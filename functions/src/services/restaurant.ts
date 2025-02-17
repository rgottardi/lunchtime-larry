import * as admin from 'firebase-admin';
import axios from 'axios';
import { getDistance } from 'geolib';

interface RestaurantSelectionParams {
  groupId: string;
  radius: number;
  latitude: number;
  longitude: number;
  dietary?: string[];
  priceRange?: string[];
  userId: string;
}

// Helper function to check if a restaurant matches dietary restrictions
const matchesDietary = (
  restaurantOptions: string[],
  restrictions: string[]
): boolean => {
  return restrictions.every((restriction) =>
    restaurantOptions.some((option) =>
      option.toLowerCase().includes(restriction.toLowerCase())
    )
  );
};

// Main restaurant selection function
export const randomRestaurantSelection = async ({
  groupId,
  radius,
  latitude,
  longitude,
  dietary = [],
  priceRange = [],
  userId,
}: RestaurantSelectionParams) => {
  const db = admin.firestore();
  
  // Get group data to check permissions
  const groupDoc = await db.collection('groups').doc(groupId).get();
  
  if (!groupDoc.exists) {
    throw new Error('Group not found');
  }

  // Verify user is in group
  const memberRef = await db
    .collection('groups')
    .doc(groupId)
    .collection('members')
    .doc(userId)
    .get();

  if (!memberRef.exists) {
    throw new Error('User not in group');
  }

  // Get all restaurants within radius
  const restaurantsRef = db.collection('restaurants');
  const restaurants = await restaurantsRef.get();

  const eligibleRestaurants = restaurants.docs
    .map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))
    .filter((restaurant) => {
      // Filter by distance
      const distance = getDistance(
        { latitude, longitude },
        {
          latitude: restaurant.location.latitude,
          longitude: restaurant.location.longitude,
        }
      );
      const isWithinRadius = distance <= radius * 1609.34; // Convert miles to meters

      // Filter by dietary restrictions
      const meetsDietary = dietary.length === 0 || 
        matchesDietary(restaurant.dietaryOptions || [], dietary);

      // Filter by price range
      const meetsPrice = priceRange.length === 0 || 
        priceRange.includes(restaurant.priceLevel.toString());

      return isWithinRadius && meetsDietary && meetsPrice;
    });

  if (eligibleRestaurants.length === 0) {
    throw new Error('No matching restaurants found');
  }

  // Randomly select a restaurant
  const selectedIndex = Math.floor(Math.random() * eligibleRestaurants.length);
  const selectedRestaurant = eligibleRestaurants[selectedIndex];

  // Create a selection history record
  await db.collection('groups').doc(groupId).collection('history').add({
    restaurantId: selectedRestaurant.id,
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
    selectedBy: userId,
    parameters: {
      radius,
      dietary,
      priceRange,
      location: {
        latitude,
        longitude
      }
    }
  });

  // Get additional details from Google Places API if needed
  try {
    const placeDetails = await getPlaceDetails(selectedRestaurant.placeId);
    return {
      ...selectedRestaurant,
      additionalDetails: placeDetails
    };
  } catch (error) {
    // Return basic restaurant info if Places API fails
    return selectedRestaurant;
  }
};

// Helper function to get additional place details
const getPlaceDetails = async (placeId: string) => {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    throw new Error('Google Places API key not configured');
  }

  const { data } = await axios.get(
    `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=opening_hours,formatted_phone_number,website,photos&key=${apiKey}`
  );

  if (data.status !== 'OK') {
    throw new Error('Failed to fetch place details');
  }

  return data.result;
};

// Function to update restaurant data periodically
export const updateRestaurantData = async () => {
  const db = admin.firestore();
  const restaurantsRef = db.collection('restaurants');
  const restaurants = await restaurantsRef.get();

  for (const restaurant of restaurants.docs) {
    try {
      const placeDetails = await getPlaceDetails(restaurant.data().placeId);
      await restaurantsRef.doc(restaurant.id).update({
        lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
        operatingHours: placeDetails.opening_hours?.periods || [],
        phoneNumber: placeDetails.formatted_phone_number,
        website: placeDetails.website
      });
    } catch (error) {
      console.error(`Failed to update restaurant ${restaurant.id}:`, error);
    }
  }
};