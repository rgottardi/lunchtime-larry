import { z } from 'zod';

// Basic types
export const LocationSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
  address: z.string().optional(),
});

export const TimestampSchema = z.object({
  seconds: z.number(),
  nanoseconds: z.number(),
});

// User
export const UserPreferencesSchema = z.object({
  maxRadius: z.number(),
  dietaryRestrictions: z.array(z.string()),
  favoriteCuisines: z.array(z.string()),
  priceRange: z.array(z.string()),
});

export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  displayName: z.string(),
  photoURL: z.string().optional(),
  preferences: UserPreferencesSchema,
  createdAt: TimestampSchema,
  updatedAt: TimestampSchema,
});

// Group
export const GroupMemberSchema = z.object({
  id: z.string(),
  role: z.enum(['owner', 'admin', 'member']),
  joinedAt: TimestampSchema,
});

export const GroupHistorySchema = z.object({
  id: z.string(),
  restaurantId: z.string(),
  selectedBy: z.string(),
  timestamp: TimestampSchema,
  coordinates: LocationSchema,
  radius: z.number(),
  dietaryRestrictions: z.array(z.string()),
  priceRange: z.array(z.string()),
});

export const GroupSchema = z.object({
  id: z.string(),
  name: z.string(),
  owner: z.string(),
  members: z.array(GroupMemberSchema),
  lastActive: TimestampSchema,
  createdAt: TimestampSchema,
  updatedAt: TimestampSchema,
});

// Restaurant
export const OperatingHoursSchema = z.object({
  day: z.number(),
  open: z.string(),
  close: z.string(),
});

export const RestaurantSchema = z.object({
  id: z.string(),
  placeId: z.string(),
  name: z.string(),
  location: LocationSchema,
  cuisine: z.array(z.string()),
  priceLevel: z.number(),
  rating: z.number(),
  reviewCount: z.number(),
  dietaryOptions: z.array(z.string()),
  operatingHours: z.array(OperatingHoursSchema),
  photoURL: z.string().optional(),
  website: z.string().optional(),
  phoneNumber: z.string().optional(),
});

// Invitation
export const InvitationSchema = z.object({
  id: z.string(),
  groupId: z.string(),
  email: z.string().email(),
  invitedBy: z.string(),
  status: z.enum(['pending', 'accepted', 'declined']),
  createdAt: TimestampSchema,
  updatedAt: TimestampSchema,
});

// Selection
export const SelectionParamsSchema = z.object({
  location: LocationSchema,
  radius: z.number(),
  dietaryRestrictions: z.array(z.string()).optional(),
  priceRange: z.array(z.string()).optional(),
  excludeRestaurants: z.array(z.string()).optional(),
});

// Types
export type Location = z.infer<typeof LocationSchema>;
export type Timestamp = z.infer<typeof TimestampSchema>;
export type UserPreferences = z.infer<typeof UserPreferencesSchema>;
export type User = z.infer<typeof UserSchema>;
export type GroupMember = z.infer<typeof GroupMemberSchema>;
export type GroupHistory = z.infer<typeof GroupHistorySchema>;
export type Group = z.infer<typeof GroupSchema>;
export type OperatingHours = z.infer<typeof OperatingHoursSchema>;
export type Restaurant = z.infer<typeof RestaurantSchema>;
export type Invitation = z.infer<typeof InvitationSchema>;
export type SelectionParams = z.infer<typeof SelectionParamsSchema>;

// Constants
export const DIETARY_RESTRICTIONS = [
  'vegetarian',
  'vegan',
  'gluten-free',
  'dairy-free',
  'nut-free',
  'halal',
  'kosher',
] as const;

export const CUISINES = [
  'american',
  'chinese',
  'indian',
  'italian',
  'japanese',
  'korean',
  'mexican',
  'thai',
  'vietnamese',
] as const;

export const PRICE_RANGES = ['1', '2', '3', '4'] as const;

// Type Guards
export const isGroupMember = (user: string, group: Group): boolean => {
  return group.members.some((member) => member.id === user);
};

export const isGroupAdmin = (user: string, group: Group): boolean => {
  return group.members.some(
    (member) => member.id === user && (member.role === 'admin' || member.role === 'owner')
  );
};

export const isGroupOwner = (user: string, group: Group): boolean => {
  return group.owner === user;
};