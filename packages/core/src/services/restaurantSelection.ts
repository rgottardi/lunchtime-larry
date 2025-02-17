import { getDistance } from 'geolib';
import {
  collection,
  query,
  where,
  getDocs,
  Timestamp,
  addDoc,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import {
  Restaurant,
  Location,
  GroupHistory,
  SelectionParams,
} from '../models';

interface RestaurantWithScore {
  restaurant: Restaurant;
  score: number;
  distance: number;
}

/**
 * Calculate score for a restaurant based on various factors
 */
function calculateScore(
  restaurant: Restaurant,
  distance: number,
  params: SelectionParams,
  previousSelections: GroupHistory[] = []
): number {
  let score = 100;

  // Distance factor (closer is better)
  const distanceFactor = 1 - distance / (params.radius * 1609.34); // Convert miles to meters
  score *= distanceFactor;

  // Rating factor
  const ratingFactor = (restaurant.rating / 5) * 1.2; // 20% boost for high ratings
  score *= ratingFactor;

  // Price level compatibility
  if (params.priceRange && params.priceRange.length > 0) {
    if (!params.priceRange.includes(restaurant.priceLevel.toString())) {
      score = 0;
    }
  }

  // Dietary restrictions compatibility
  if (params.dietaryRestrictions && params.dietaryRestrictions.length > 0) {
    const missingRestrictions = params.dietaryRestrictions.filter(
      (restriction) => !restaurant.dietaryOptions.includes(restriction)
    );
    if (missingRestrictions.length > 0) {
      score = 0;
    }
  }

  // Recent selection penalty
  const recentSelections = previousSelections
    .filter((selection) => selection.restaurantId === restaurant.id)
    .sort((a, b) => b.timestamp.seconds - a.timestamp.seconds);

  if (recentSelections.length > 0) {
    const lastSelected = recentSelections[0].timestamp;
    const daysSinceLastSelected = 
      (Date.now() / 1000 - lastSelected.seconds) / (24 * 60 * 60);
    
    // Apply penalty for restaurants selected in the last 7 days
    if (daysSinceLastSelected < 7) {
      score *= 0.5; // 50% penalty
    }
  }

  // Explicitly excluded restaurants
  if (params.excludeRestaurants?.includes(restaurant.id)) {
    score = 0;
  }

  return score;
}

/**
 * Select a restaurant based on given parameters
 */
export async function selectRestaurant(
  params: SelectionParams,
  groupId?: string
): Promise<Restaurant> {
  // Get all restaurants
  const restaurantsRef = collection(db, 'restaurants');
  const restaurantDocs = await getDocs(restaurantsRef);
  const restaurants = restaurantDocs.docs.map(
    (doc) => ({ id: doc.id, ...doc.data() }) as Restaurant
  );

  // Get previous selections if group ID provided
  let previousSelections: GroupHistory[] = [];
  if (groupId) {
    const historyRef = collection(db, `groups/${groupId}/history`);
    const historyDocs = await getDocs(
      query(historyRef, where('timestamp', '>', new Timestamp(Date.now() / 1000 - 7 * 24 * 60 * 60, 0)))
    );
    previousSelections = historyDocs.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() }) as GroupHistory
    );
  }

  // Calculate scores for each restaurant
  const restaurantsWithScores: RestaurantWithScore[] = restaurants.map((restaurant) => {
    const distance = getDistance(
      params.location,
      restaurant.location
    ) / 1609.34; // Convert meters to miles

    return {
      restaurant,
      score: calculateScore(restaurant, distance, params, previousSelections),
      distance,
    };
  });

  // Filter out restaurants with zero scores and sort by score
  const eligibleRestaurants = restaurantsWithScores
    .filter((r) => r.score > 0 && r.distance <= params.radius)
    .sort((a, b) => b.score - a.score);

  if (eligibleRestaurants.length === 0) {
    throw new Error('No eligible restaurants found');
  }

  // Select a restaurant randomly, weighted by score
  const totalScore = eligibleRestaurants.reduce((sum, r) => sum + r.score, 0);
  let random = Math.random() * totalScore;
  let selectedRestaurant: Restaurant | null = null;

  for (const r of eligibleRestaurants) {
    random -= r.score;
    if (random <= 0) {
      selectedRestaurant = r.restaurant;
      break;
    }
  }

  // Fallback to first restaurant if something went wrong with random selection
  if (!selectedRestaurant) {
    selectedRestaurant = eligibleRestaurants[0].restaurant;
  }

  // Record selection in group history if group ID provided
  if (groupId) {
    const historyRef = collection(db, `groups/${groupId}/history`);
    await addDoc(historyRef, {
      restaurantId: selectedRestaurant.id,
      timestamp: new Timestamp(Math.floor(Date.now() / 1000), 0),
      coordinates: params.location,
      radius: params.radius,
      dietaryRestrictions: params.dietaryRestrictions || [],
      priceRange: params.priceRange || [],
    });
  }

  return selectedRestaurant;
}

/**
 * Get recommended restaurants based on parameters
 */
export async function getRecommendedRestaurants(
  params: SelectionParams,
  limit: number = 5
): Promise<Restaurant[]> {
  // Get all restaurants
  const restaurantsRef = collection(db, 'restaurants');
  const restaurantDocs = await getDocs(restaurantsRef);
  const restaurants = restaurantDocs.docs.map(
    (doc) => ({ id: doc.id, ...doc.data() }) as Restaurant
  );

  // Calculate scores
  const restaurantsWithScores: RestaurantWithScore[] = restaurants.map((restaurant) => {
    const distance = getDistance(
      params.location,
      restaurant.location
    ) / 1609.34;

    return {
      restaurant,
      score: calculateScore(restaurant, distance, params),
      distance,
    };
  });

  // Return top restaurants sorted by score
  return restaurantsWithScores
    .filter((r) => r.score > 0 && r.distance <= params.radius)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((r) => r.restaurant);
}