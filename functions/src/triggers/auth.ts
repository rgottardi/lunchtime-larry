import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

export const onUserCreated = async (user: functions.auth.UserRecord) => {
  const db = admin.firestore();
  
  try {
    // Create user profile document
    await db.collection('users').doc(user.uid).set({
      email: user.email,
      displayName: user.displayName || '',
      photoURL: user.photoURL || '',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      preferences: {
        dietaryRestrictions: [],
        maxRadius: 5, // Default 5 miles
        priceRange: ['1', '2', '3'], // Default all price ranges except luxury
        favoriteCuisines: []
      }
    });

    // Check for pending invitations
    const pendingInvitations = await db
      .collection('invitations')
      .where('email', '==', user.email)
      .where('status', '==', 'pending')
      .get();

    // Process pending invitations
    const batch = db.batch();
    
    pendingInvitations.docs.forEach((doc) => {
      const data = doc.data();
      
      // Add user to group members
      const memberRef = db
        .collection('groups')
        .doc(data.groupId)
        .collection('members')
        .doc(user.uid);
        
      batch.set(memberRef, {
        joinedAt: admin.firestore.FieldValue.serverTimestamp(),
        invitedBy: data.invitedBy,
        role: 'member'
      });

      // Update invitation status
      batch.update(doc.ref, {
        status: 'accepted'
      });

      // Update group member count
      batch.update(db.collection('groups').doc(data.groupId), {
        memberCount: admin.firestore.FieldValue.increment(1)
      });
    });

    await batch.commit();

    return { success: true };
  } catch (error) {
    console.error('Error creating user profile:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Failed to create user profile'
    );
  }
};

export const onUserDeleted = async (user: functions.auth.UserRecord) => {
  const db = admin.firestore();
  
  try {
    // Get all groups where user is a member
    const userGroups = await db
      .collectionGroup('members')
      .where(admin.firestore.FieldPath.documentId(), '==', user.uid)
      .get();

    const batch = db.batch();

    // Remove user from all groups
    for (const memberDoc of userGroups.docs) {
      const groupId = memberDoc.ref.parent.parent!.id;
      
      // Delete member document
      batch.delete(memberDoc.ref);
      
      // Update group member count
      batch.update(db.collection('groups').doc(groupId), {
        memberCount: admin.firestore.FieldValue.increment(-1)
      });
    }

    // Delete user profile
    batch.delete(db.collection('users').doc(user.uid));

    // Delete user's preferences
    batch.delete(db.collection('users').doc(user.uid).collection('preferences').doc('default'));

    await batch.commit();

    return { success: true };
  } catch (error) {
    console.error('Error cleaning up user data:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Failed to clean up user data'
    );
  }
};