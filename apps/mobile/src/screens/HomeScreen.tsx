import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import * as Location from 'expo-location';
import { SpinWheel, Button, Text, RestaurantCard } from '@lunchtime-larry/ui';
import { useDocument, useCollection } from '@lunchtime-larry/core/hooks';
import { selectRestaurant, getRecommendedRestaurants } from '@lunchtime-larry/core/services';
import { Restaurant, Location as LocationType } from '@lunchtime-larry/core/models';

export default function HomeScreen() {
  const navigation = useNavigation();
  const [location, setLocation] = useState<LocationType | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [spinning, setSpinning] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [recommendations, setRecommendations] = useState<Restaurant[]>([]);

  // Get user preferences
  const { data: user } = useDocument('users/current');

  // Get user's active group if any
  const { data: groups } = useCollection('users/current/groups');
  const activeGroup = groups?.[0]; // TODO: Add active group selection

  useEffect(() => {
    (async () => {
      // Request location permissions
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationError('Location permission is required to find restaurants near you.');
        return;
      }

      try {
        // Get current location
        const { coords } = await Location.getCurrentPositionAsync({});
        setLocation({
          latitude: coords.latitude,
          longitude: coords.longitude,
        });

        // Get initial recommendations
        if (user?.preferences) {
          const recs = await getRecommendedRestaurants({
            location: {
              latitude: coords.latitude,
              longitude: coords.longitude,
            },
            radius: user.preferences.maxRadius,
            dietaryRestrictions: user.preferences.dietaryRestrictions,
            priceRange: user.preferences.priceRange,
          });
          setRecommendations(recs);
        }
      } catch (error) {
        setLocationError('Unable to get your location. Please try again.');
      }
    })();
  }, [user?.preferences]);

  const handleSpin = async () => {
    if (!location || !user?.preferences) {
      Alert.alert('Error', 'Unable to get your location or preferences.');
      return;
    }

    setSpinning(true);
    try {
      const restaurant = await selectRestaurant(
        {
          location,
          radius: user.preferences.maxRadius,
          dietaryRestrictions: user.preferences.dietaryRestrictions,
          priceRange: user.preferences.priceRange,
        },
        activeGroup?.id
      );
      setSelectedRestaurant(restaurant);
    } catch (error) {
      Alert.alert('Error', 'Unable to find a restaurant. Please try again.');
    } finally {
      setSpinning(false);
    }
  };

  const handleRestaurantPress = (restaurant: Restaurant) => {
    navigation.navigate('RestaurantDetails', { restaurantId: restaurant.id });
  };

  if (locationError) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text variant="h3" style={styles.errorTitle}>
            Location Required
          </Text>
          <Text style={styles.errorText}>{locationError}</Text>
          <Button
            onPress={() => navigation.navigate('Settings')}
            variant="primary"
          >
            Open Settings
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* Header */}
        <View style={styles.header}>
          <Text variant="h2" style={styles.title}>
            {activeGroup
              ? `${activeGroup.name}'s Lunch`
              : "What's for lunch?"}
          </Text>
          {location && (
            <Text variant="body" style={styles.subtitle}>
              Finding restaurants within {user?.preferences.maxRadius} miles
            </Text>
          )}
        </View>

        {/* Spin Wheel */}
        <View style={styles.wheelContainer}>
          <SpinWheel
            options={recommendations.map((r) => ({
              id: r.id,
              label: r.name,
              color: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
            }))}
            spinning={spinning}
            onSpinEnd={(id) => {
              const restaurant = recommendations.find((r) => r.id === id);
              if (restaurant) {
                setSelectedRestaurant(restaurant);
              }
            }}
          />
          <Button
            onPress={handleSpin}
            variant="primary"
            size="lg"
            fullWidth
            loading={spinning}
            style={styles.spinButton}
          >
            {spinning ? 'Spinning...' : 'Spin for Lunch!'}
          </Button>
        </View>

        {/* Selected Restaurant */}
        {selectedRestaurant && (
          <View style={styles.selectedContainer}>
            <Text variant="h3" style={styles.sectionTitle}>
              Selected Restaurant
            </Text>
            <RestaurantCard
              restaurant={selectedRestaurant}
              onPress={() => handleRestaurantPress(selectedRestaurant)}
            />
            <Button
              onPress={handleSpin}
              variant="secondary"
              style={styles.respin}
            >
              Try Again
            </Button>
          </View>
        )}

        {/* Recommendations */}
        {!selectedRestaurant && recommendations.length > 0 && (
          <View style={styles.recommendationsContainer}>
            <Text variant="h3" style={styles.sectionTitle}>
              Recommended Restaurants
            </Text>
            {recommendations.map((restaurant) => (
              <RestaurantCard
                key={restaurant.id}
                restaurant={restaurant}
                onPress={() => handleRestaurantPress(restaurant)}
                style={styles.recommendationCard}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    padding: 20,
  },
  title: {
    marginBottom: 8,
    color: '#111827',
  },
  subtitle: {
    color: '#6B7280',
  },
  wheelContainer: {
    padding: 20,
    alignItems: 'center',
  },
  spinButton: {
    marginTop: 20,
  },
  selectedContainer: {
    padding: 20,
  },
  recommendationsContainer: {
    padding: 20,
  },
  sectionTitle: {
    marginBottom: 16,
    color: '#111827',
  },
  recommendationCard: {
    marginBottom: 16,
  },
  respin: {
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorTitle: {
    marginBottom: 12,
    color: '#111827',
    textAlign: 'center',
  },
  errorText: {
    marginBottom: 24,
    color: '#6B7280',
    textAlign: 'center',
  },
});