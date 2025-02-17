import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { z } from 'zod';
import { randomRestaurantSelection } from './services/restaurant';
import { handleGroupInvitation } from './services/group';
import { onUserCreated } from './triggers/auth';

// Initialize Firebase Admin
admin.initializeApp();

// Schema for restaurant selection request
const SelectionRequestSchema = z.object({
  groupId: z.string(),
  radius: z.number().min(0.1).max(10),
  latitude: z.number(),
  longitude: z.number(),
  dietary: z.array(z.string()).optional(),
  priceRange: z.array(z.string()).optional(),
});

// Random restaurant selection endpoint
export const selectRestaurant = functions.https.onCall(async (data, context) => {
  // Verify authentication
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'Must be authenticated to use this feature'
    );
  }

  try {
    const { groupId, radius, latitude, longitude, dietary, priceRange } = 
      SelectionRequestSchema.parse(data);

    return await randomRestaurantSelection({
      groupId,
      radius,
      latitude,
      longitude,
      dietary,
      priceRange,
      userId: context.auth.uid,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new functions.https.HttpsError('invalid-argument', 'Invalid request data');
    }
    throw new functions.https.HttpsError('internal', 'Something went wrong');
  }
});

// Group invitation endpoint
export const inviteToGroup = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'Must be authenticated to invite users'
    );
  }

  const { groupId, email } = data;
  
  if (!groupId || !email) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Missing required fields'
    );
  }

  try {
    await handleGroupInvitation(groupId, email, context.auth.uid);
    return { success: true };
  } catch (error) {
    throw new functions.https.HttpsError('internal', 'Failed to process invitation');
  }
});

// Auth trigger for new user creation
export const createUserProfile = functions.auth.user().onCreate(onUserCreated);

// Scheduled restaurant data update
export const updateRestaurantData = functions.pubsub
  .schedule('every 24 hours')
  .onRun(async (context) => {
    // TODO: Implement restaurant data update logic
    return null;
});
