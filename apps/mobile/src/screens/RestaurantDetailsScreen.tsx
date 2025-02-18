import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  Linking,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Button, Text, Card } from '@lunchtime-larry/ui';
import {
  StarIcon,
  MapPinIcon,
  PhoneIcon,
  GlobeAltIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { format } from 'date-fns';
import { useDocument } from '@lunchtime-larry/core/hooks';
import { Restaurant } from '@lunchtime-larry/core/models';

const PRICE_LEVELS = {
  1: '$',
  2: '$$',
  3: '$$$',
  4: '$$$$',
};

const DAYS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

export default function RestaurantDetailsScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { restaurantId } = route.params as { restaurantId: string };

  // Get restaurant data
  const { data: restaurant, error } = useDocument<Restaurant>(
    `restaurants/${restaurantId}`
  );

  const handleCall = () => {
    if (restaurant?.phoneNumber) {
      Linking.openURL(`tel:${restaurant.phoneNumber}`);
    }
  };

  const handleWebsite = () => {
    if (restaurant?.website) {
      Linking.openURL(restaurant.website);
    }
  };

  const handleDirections = () => {
    if (restaurant?.location) {
      const { latitude, longitude } = restaurant.location;
      const url = Platform.select({
        ios: `maps:0,0?q=${latitude},${longitude}`,
        android: `google.navigation:q=${latitude},${longitude}`,
      });
      if (url) {
        Linking.openURL(url);
      }
    }
  };

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text variant="h3" style={styles.errorTitle}>
            Error Loading Restaurant
          </Text>
          <Text style={styles.errorText}>
            Unable to load restaurant details. Please try again.
          </Text>
          <Button
            onPress={() => navigation.goBack()}
            variant="primary"
          >
            Go Back
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  if (!restaurant) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* Header Image */}
        {restaurant.photoURL && (
          <Image
            source={{ uri: restaurant.photoURL }}
            style={styles.image}
            resizeMode="cover"
          />
        )}

        {/* Restaurant Info */}
        <View style={styles.content}>
          <Text variant="h2" style={styles.title}>
            {restaurant.name}
          </Text>

          {/* Rating and Price */}
          <View style={styles.ratingContainer}>
            <View style={styles.rating}>
              {[...Array(5)].map((_, i) => {
                const IconComponent =
                  i < Math.floor(restaurant.rating)
                    ? StarIconSolid
                    : StarIcon;
                return (
                  <IconComponent
                    key={i}
                    width={20}
                    height={20}
                    color={
                      i < Math.floor(restaurant.rating)
                        ? '#FBBF24'
                        : '#D1D5DB'
                    }
                  />
                );
              })}
              <Text variant="body" style={styles.ratingText}>
                ({restaurant.reviewCount})
              </Text>
            </View>
            <Text style={styles.price}>
              {PRICE_LEVELS[restaurant.priceLevel as keyof typeof PRICE_LEVELS]}
            </Text>
          </View>

          {/* Cuisine Tags */}
          <View style={styles.cuisineContainer}>
            {restaurant.cuisine.map((type) => (
              <View key={type} style={styles.cuisineTag}>
                <Text style={styles.cuisineText}>{type}</Text>
              </View>
            ))}
          </View>

          {/* Dietary Options */}
          {restaurant.dietaryOptions.length > 0 && (
            <View style={styles.dietaryContainer}>
              {restaurant.dietaryOptions.map((option) => (
                <View key={option} style={styles.dietaryTag}>
                  <Text style={styles.dietaryText}>{option}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Contact Buttons */}
          <View style={styles.actionButtons}>
            <Button
              onPress={handleDirections}
              variant="secondary"
              leftIcon={<MapPinIcon width={20} height={20} />}
              style={styles.actionButton}
            >
              Directions
            </Button>
            {restaurant.phoneNumber && (
              <Button
                onPress={handleCall}
                variant="secondary"
                leftIcon={<PhoneIcon width={20} height={20} />}
                style={styles.actionButton}
              >
                Call
              </Button>
            )}
            {restaurant.website && (
              <Button
                onPress={handleWebsite}
                variant="secondary"
                leftIcon={<GlobeAltIcon width={20} height={20} />}
                style={styles.actionButton}
              >
                Website
              </Button>
            )}
          </View>

          {/* Hours */}
          <View style={styles.hoursContainer}>
            <Text variant="h3" style={styles.sectionTitle}>
              Hours
            </Text>
            {restaurant.operatingHours.map((hours) => (
              <View key={hours.day} style={styles.hoursRow}>
                <Text style={styles.dayText}>{DAYS[hours.day]}</Text>
                <Text style={styles.hoursText}>
                  {hours.open} - {hours.close}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  image: {
    width: '100%',
    height: 200,
  },
  content: {
    padding: 20,
  },
  title: {
    marginBottom: 12,
    color: '#111827',
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    marginLeft: 8,
    color: '#6B7280',
  },
  price: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  cuisineContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  cuisineTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
  },
  cuisineText: {
    fontSize: 14,
    color: '#374151',
    textTransform: 'capitalize',
  },
  dietaryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  dietaryTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#D1FAE5',
  },
  dietaryText: {
    fontSize: 14,
    color: '#065F46',
    textTransform: 'capitalize',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  actionButton: {
    flex: 1,
  },
  hoursContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
  },
  sectionTitle: {
    marginBottom: 12,
    color: '#111827',
  },
  hoursRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  dayText: {
    fontSize: 14,
    color: '#374151',
  },
  hoursText: {
    fontSize: 14,
    color: '#111827',
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