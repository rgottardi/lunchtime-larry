import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';

interface GroupInvitation {
  email: string;
  groupId: string;
  invitedBy: string;
  status: 'pending' | 'accepted' | 'declined';
  timestamp: FirebaseFirestore.Timestamp;
}

export const handleGroupInvitation = async (
  groupId: string,
  email: string,
  inviterId: string
) => {
  const db = admin.firestore();

  // Check if group exists
  const groupRef = db.collection('groups').doc(groupId);
  const group = await groupRef.get();

  if (!group.exists) {
    throw new Error('Group not found');
  }

  // Verify inviter is group owner or admin
  const groupData = group.data()!;
  if (groupData.owner !== inviterId && !groupData.admins?.includes(inviterId)) {
    throw new Error('Not authorized to invite members');
  }

  // Check if user exists by email
  try {
    const userRecord = await admin.auth().getUserByEmail(email);
    
    // Check if user is already a member
    const memberRef = groupRef.collection('members').doc(userRecord.uid);
    const memberDoc = await memberRef.get();
    
    if (memberDoc.exists) {
      throw new Error('User is already a member of this group');
    }

    // Create invitation
    const invitation: GroupInvitation = {
      email,
      groupId,
      invitedBy: inviterId,
      status: 'pending',
      timestamp: admin.firestore.Timestamp.now()
    };

    // Store invitation
    await db.collection('invitations').add(invitation);

    // Send notification email
    await sendInvitationEmail(email, groupData.name, inviterId);

    return { success: true };
  } catch (error) {
    if (error.code === 'auth/user-not-found') {
      // Handle case where user doesn't exist
      throw new Error('User not found with provided email');
    }
    throw error;
  }
};

export const handleInvitationResponse = async (
  invitationId: string,
  userId: string,
  accept: boolean
) => {
  const db = admin.firestore();
  
  // Get invitation
  const invitationRef = db.collection('invitations').doc(invitationId);
  const invitation = await invitationRef.get();
  
  if (!invitation.exists) {
    throw new Error('Invitation not found');
  }

  const invitationData = invitation.data() as GroupInvitation;

  // Verify invitation belongs to user
  const userRecord = await admin.auth().getUser(userId);
  if (userRecord.email !== invitationData.email) {
    throw new Error('Invitation does not belong to this user');
  }

  if (accept) {
    // Add user to group
    const groupRef = db.collection('groups').doc(invitationData.groupId);
    const memberRef = groupRef.collection('members').doc(userId);

    await db.runTransaction(async (transaction) => {
      const groupDoc = await transaction.get(groupRef);
      
      if (!groupDoc.exists) {
        throw new Error('Group no longer exists');
      }

      // Add member to group
      transaction.set(memberRef, {
        joinedAt: admin.firestore.FieldValue.serverTimestamp(),
        invitedBy: invitationData.invitedBy,
        role: 'member'
      });

      // Update group members count
      transaction.update(groupRef, {
        memberCount: admin.firestore.FieldValue.increment(1)
      });

      // Update invitation status
      transaction.update(invitationRef, {
        status: 'accepted'
      });
    });
  } else {
    // Update invitation as declined
    await invitationRef.update({
      status: 'declined'
    });
  }

  return { success: true };
};

const sendInvitationEmail = async (
  email: string,
  groupName: string,
  inviterId: string
) => {
  // Get inviter's name
  const inviter = await admin.auth().getUser(inviterId);
  const inviterName = inviter.displayName || inviter.email;

  // Configure email template
  const message = {
    notification: {
      title: `Invitation to join ${groupName} on Lunchtime Larry`,
      body: `${inviterName} has invited you to join their lunch group "${groupName}". Open the app to respond to this invitation.`
    },
    data: {
      type: 'group_invitation',
      groupName,
      inviterId
    }
  };

  try {
    // Send email using Firebase Auth custom templates
    await admin.auth().generateEmailVerificationLink(email, {
      url: `https://lunchtimelarry.app/invite?group=${groupName}`,
    });
  } catch (error) {
    console.error('Failed to send invitation email:', error);
    // Continue even if email fails - user can still see invitation in app
  }
};