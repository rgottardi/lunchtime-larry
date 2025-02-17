import React from 'react';
import { Platform, Image, View, StyleSheet } from 'react-native';
import { Card } from './Card';
import { Text } from './Text';
import {
  StarIcon,
  MapPinIcon,
  CurrencyDollarIcon,
} from '@heroicons/react/24/solid';
import clsx from 'clsx';

interface RestaurantCardProps {
  name: string;
  image: string;
  rating: number;
  reviewCount: number;
  priceLevel: number;
  distance: number;
  cuisine: string[];
  dietaryOptions?: string[];
  onPress?: () => void;
  className?: string;
}

const PRICE_LEVELS = {
  1: '$',
  2: '$$',
  3: '$$$',
  4: '$$$$',
};

export const RestaurantCard = ({
  name,
  image,
  rating,
  reviewCount,
  priceLevel,
  distance,
  cuisine,
  dietaryOptions = [],
  onPress,
  className,
}: RestaurantCardProps) => {
  if (Platform.OS === 'web') {
    return (
      <Card
        onPress={onPress}
        padding="none"
        className={clsx('overflow-hidden', className)}
      >
        <div className="aspect-h-9 aspect-w-16 relative">
          <img
            src={image}
            alt={name}
            className="h-48 w-full object-cover"
          />
        </div>
        <div className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {name}
              </h3>
              <div className="mt-1 flex items-center">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <StarIcon
                      key={i}
                      className={clsx('h-4 w-4', {
                        'text-yellow-400': i < Math.floor(rating),
                        'text-gray-300': i >= Math.floor(rating),
                      })}
                    />
                  ))}
                </div>
                <p className="ml-2 text-sm text-gray-500">
                  ({reviewCount})
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2 text-gray-500">
              <CurrencyDollarIcon className="h-5 w-5" />
              <span className="text-sm font-medium">
                {PRICE_LEVELS[priceLevel as keyof typeof PRICE_LEVELS]}
              </span>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center text-gray-500">
              <MapPinIcon className="h-5 w-5" />
              <span className="ml-1 text-sm">
                {distance.toFixed(1)} miles away
              </span>
            </div>
          </div>
          {cuisine.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {cuisine.map((type) => (
                <span
                  key={type}
                  className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800"
                >
                  {type}
                </span>
              ))}
            </div>
          )}
          {dietaryOptions.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {dietaryOptions.map((option) => (
                <span
                  key={option}
                  className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800"
                >
                  {option}
                </span>
              ))}
            </div>
          )}
        </div>
      </Card>
    );
  }

  // React Native version
  return (
    <Card onPress={onPress} padding="none" style={styles.card}>
      <Image
        source={{ uri: image }}
        style={styles.image}
        resizeMode="cover"
      />
      <View style={styles.content}>
        <View style={styles.header}>
          <View>
            <Text variant="h4" style={styles.name}>
              {name}
            </Text>
            <View style={styles.ratingContainer}>
              <View style={styles.stars}>
                {[...Array(5)].map((_, i) => (
                  <StarIcon
                    key={i}
                    size={16}
                    color={i < Math.floor(rating) ? '#FBBF24' : '#D1D5DB'}
                  />
                ))}
              </View>
              <Text variant="small" style={styles.reviewCount}>
                ({reviewCount})
              </Text>
            </View>
          </View>
          <View style={styles.priceContainer}>
            <CurrencyDollarIcon size={20} color="#6B7280" />
            <Text variant="small-semibold" style={styles.price}>
              {PRICE_LEVELS[priceLevel as keyof typeof PRICE_LEVELS]}
            </Text>
          </View>
        </View>
        <View style={styles.locationContainer}>
          <MapPinIcon size={20} color="#6B7280" />
          <Text variant="small" style={styles.distance}>
            {distance.toFixed(1)} miles away
          </Text>
        </View>
        {cuisine.length > 0 && (
          <View style={styles.tagsContainer}>
            {cuisine.map((type) => (
              <View key={type} style={styles.tag}>
                <Text variant="tiny" style={styles.tagText}>
                  {type}
                </Text>
              </View>
            ))}
          </View>
        )}
        {dietaryOptions.length > 0 && (
          <View style={styles.tagsContainer}>
            {dietaryOptions.map((option) => (
              <View key={option} style={styles.dietaryTag}>
                <Text variant="tiny" style={styles.dietaryTagText}>
                  {option}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 192,
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  name: {
    color: '#111827',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  stars: {
    flexDirection: 'row',
  },
  reviewCount: {
    marginLeft: 8,
    color: '#6B7280',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  price: {
    marginLeft: 4,
    color: '#6B7280',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },
  distance: {
    marginLeft: 4,
    color: '#6B7280',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    gap: 8,
  },
  tag: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  tagText: {
    color: '#1F2937',
  },
  dietaryTag: {
    backgroundColor: '#D1FAE5',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  dietaryTagText: {
    color: '#065F46',
  },
});