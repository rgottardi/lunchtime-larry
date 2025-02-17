import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  ScrollView,
  Switch,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import {
  Button,
  Text,
  Input,
  Card,
} from '@lunchtime-larry/ui';
import {
  CogIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '@lunchtime-larry/core/hooks';
import { useDocument } from '@lunchtime-larry/core/hooks';
import {
  DIETARY_RESTRICTIONS,
  CUISINES,
  PRICE_RANGES,
} from '@lunchtime-larry/core/models';

export default function ProfileScreen() {
  const navigation = useNavigation();
  const { user, signout } = useAuth();
  const [loading, setLoading] = useState(false);

  // Get user profile
  const {
    data: profile,
    error: profileError,
    refetch: refetchProfile,
  } = useDocument(`users/${user?.uid}`);

  const handleSignOut = async () => {
    try {
      setLoading(true);
      await signout();
      navigation.reset({
        index: 0,
        routes: [{ name: 'Auth' }],
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to sign out. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleDietaryRestriction = async (restriction: string) => {
    if (!profile || !user) return;

    const newRestrictions = profile.preferences.dietaryRestrictions.includes(restriction)
      ? profile.preferences.dietaryRestrictions.filter((r) => r !== restriction)
      : [...profile.preferences.dietaryRestrictions, restriction];

    try {
      await updateProfile(user.uid, {
        preferences: {
          ...profile.preferences,
          dietaryRestrictions: newRestrictions,
        },
      });
      refetchProfile();
    } catch (error) {
      Alert.alert('Error', 'Failed to update preferences. Please try again.');
    }
  };

  const toggleCuisine = async (cuisine: string) => {
    if (!profile || !user) return;

    const newCuisines = profile.preferences.favoriteCuisines.includes(cuisine)
      ? profile.preferences.favoriteCuisines.filter((c) => c !== cuisine)
      : [...profile.preferences.favoriteCuisines, cuisine];

    try {
      await updateProfile(user.uid, {
        preferences: {
          ...profile.preferences,
          favoriteCuisines: newCuisines,
        },
      });
      refetchProfile();
    } catch (error) {
      Alert.alert('Error', 'Failed to update preferences. Please try again.');
    }
  };

  const togglePriceRange = async (price: string) => {
    if (!profile || !user) return;

    const newPriceRange = profile.preferences.priceRange.includes(price)
      ? profile.preferences.priceRange.filter((p) => p !== price)
      : [...profile.preferences.priceRange, price];

    try {
      await updateProfile(user.uid, {
        preferences: {
          ...profile.preferences,
          priceRange: newPriceRange,
        },
      });
      refetchProfile();
    } catch (error) {
      Alert.alert('Error', 'Failed to update preferences. Please try again.');
    }
  };

  if (profileError) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text variant="h3" style={styles.errorTitle}>
            Error Loading Profile
          </Text>
          <Text style={styles.errorText}>
            Unable to load your profile. Please try again.
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

  if (!profile) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* Header */}
        <View style={styles.header}>
          <UserCircleIcon width={64} height={64} color="#6B7280" />
          <Text variant="h2" style={styles.title}>
            {profile.displayName || profile.email}
          </Text>
          <Text variant="body" style={styles.subtitle}>
            {profile.email}
          </Text>
        </View>

        {/* Preferences */}
        <View style={styles.section}>
          <Text variant="h3" style={styles.sectionTitle}>
            Dietary Restrictions
          </Text>
          <View style={styles.preferencesGrid}>
            {DIETARY_RESTRICTIONS.map((restriction) => (
              <TouchableOpacity
                key={restriction}
                onPress={() => toggleDietaryRestriction(restriction)}
                style={[
                  styles.preferenceItem,
                  profile.preferences.dietaryRestrictions.includes(restriction) &&
                    styles.preferenceSelected,
                ]}
              >
                <Text
                  style={[
                    styles.preferenceText,
                    profile.preferences.dietaryRestrictions.includes(restriction) &&
                      styles.preferenceTextSelected,
                  ]}
                >
                  {restriction}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text variant="h3" style={styles.sectionTitle}>
            Favorite Cuisines
          </Text>
          <View style={styles.preferencesGrid}>
            {CUISINES.map((cuisine) => (
              <TouchableOpacity
                key={cuisine}
                onPress={() => toggleCuisine(cuisine)}
                style={[
                  styles.preferenceItem,
                  profile.preferences.favoriteCuisines.includes(cuisine) &&
                    styles.preferenceSelected,
                ]}
              >
                <Text
                  style={[
                    styles.preferenceText,
                    profile.preferences.favoriteCuisines.includes(cuisine) &&
                      styles.preferenceTextSelected,
                  ]}
                >
                  {cuisine}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text variant="h3" style={styles.sectionTitle}>
            Price Range
          </Text>
          <View style={styles.priceRange}>
            {PRICE_RANGES.map((price) => (
              <TouchableOpacity
                key={price}
                onPress={() => togglePriceRange(price)}
                style={[
                  styles.priceItem,
                  profile.preferences.priceRange.includes(price) &&
                    styles.priceSelected,
                ]}
              >
                <Text
                  style={[
                    styles.priceText,
                    profile.preferences.priceRange.includes(price) &&
                      styles.priceTextSelected,
                  ]}
                >
                  {'$'.repeat(parseInt(price))}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <Button
            onPress={() => navigation.navigate('Settings')}
            variant="secondary"
            leftIcon={<CogIcon width={20} height={20} />}
            style={styles.actionButton}
          >
            Settings
          </Button>
          <Button
            onPress={handleSignOut}
            variant="danger"
            leftIcon={<ArrowRightOnRectangleIcon width={20} height={20} />}
            loading={loading}
            style={styles.actionButton}
          >
            Sign Out
          </Button>
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
  header: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    marginTop: 12,
    marginBottom: 4,
    color: '#111827',
  },
  subtitle: {
    color: '#6B7280',
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    marginBottom: 16,
    color: '#111827',
  },
  preferencesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  preferenceItem: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
  },
  preferenceSelected: {
    backgroundColor: '#4F46E5',
  },
  preferenceText: {
    fontSize: 14,
    color: '#374151',
    textTransform: 'capitalize',
  },
  preferenceTextSelected: {
    color: '#FFFFFF',
  },
  priceRange: {
    flexDirection: 'row',
    gap: 8,
  },
  priceItem: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  priceSelected: {
    backgroundColor: '#4F46E5',
  },
  priceText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  priceTextSelected: {
    color: '#FFFFFF',
  },
  actions: {
    padding: 20,
    gap: 12,
  },
  actionButton: {
    width: '100%',
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