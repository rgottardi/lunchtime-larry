import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  Timestamp,
  writeBatch,
} from 'firebase/firestore';
import { nanoid } from 'nanoid';
import { db } from '../lib/firebase';
import {
  Group,
  GroupMember,
  User,
  Invitation,
  isGroupAdmin,
  isGroupOwner,
} from '../models';

/**
 * Create a new group
 */
export async function createGroup(name: string, ownerId: string): Promise<string> {
  try {
    // Get owner's user document
    const userDoc = await getDoc(doc(db, 'users', ownerId));
    if (!userDoc.exists()) {
      throw new Error('User not found');
    }

    // Create group
    const groupRef = await addDoc(collection(db, 'groups'), {
      name,
      owner: ownerId,
      memberCount: 1,
      lastActive: serverTimestamp(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    // Add owner as member
    await addDoc(collection(db, `groups/${groupRef.id}/members`), {
      id: ownerId,
      role: 'owner',
      joinedAt: serverTimestamp(),
    });

    // Add group to user's groups
    await addDoc(collection(db, `users/${ownerId}/groups`), {
      groupId: groupRef.id,
      role: 'owner',
      joinedAt: serverTimestamp(),
    });

    return groupRef.id;
  } catch (error) {
    console.error('Error creating group:', error);
    throw error;
  }
}

/**
 * Invite user to group
 */
export async function inviteToGroup(
  groupId: string,
  email: string,
  inviterId: string
): Promise<void> {
  try {
    // Check if group exists
    const groupDoc = await getDoc(doc(db, 'groups', groupId));
    if (!groupDoc.exists()) {
      throw new Error('Group not found');
    }

    // Check if inviter has permission
    if (!isGroupAdmin(inviterId, groupDoc.data() as Group)) {
      throw new Error('Not authorized to invite members');
    }

    // Check if invitation already exists
    const existingInvites = await getDocs(
      query(
        collection(db, 'invitations'),
        where('groupId', '==', groupId),
        where('email', '==', email),
        where('status', '==', 'pending')
      )
    );

    if (!existingInvites.empty) {
      throw new Error('Invitation already exists');
    }

    // Create invitation
    await addDoc(collection(db, 'invitations'), {
      groupId,
      email,
      invitedBy: inviterId,
      status: 'pending',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error inviting to group:', error);
    throw error;
  }
}

/**
 * Accept group invitation
 */
export async function acceptInvitation(
  invitationId: string,
  userId: string
): Promise<void> {
  try {
    const batch = writeBatch(db);

    // Get invitation
    const inviteDoc = await getDoc(doc(db, 'invitations', invitationId));
    if (!inviteDoc.exists()) {
      throw new Error('Invitation not found');
    }

    const invitation = inviteDoc.data() as Invitation;
    if (invitation.status !== 'pending') {
      throw new Error('Invitation is no longer pending');
    }

    // Get user
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (!userDoc.exists()) {
      throw new Error('User not found');
    }

    const user = userDoc.data() as User;
    if (user.email !== invitation.email) {
      throw new Error('Invitation is for a different email');
    }

    // Add member to group
    const memberRef = doc(collection(db, `groups/${invitation.groupId}/members`));
    batch.set(memberRef, {
      id: userId,
      role: 'member',
      joinedAt: serverTimestamp(),
    });

    // Add group to user's groups
    const userGroupRef = doc(collection(db, `users/${userId}/groups`));
    batch.set(userGroupRef, {
      groupId: invitation.groupId,
      role: 'member',
      joinedAt: serverTimestamp(),
    });

    // Update group member count
    const groupRef = doc(db, 'groups', invitation.groupId);
    batch.update(groupRef, {
      memberCount: (await getDoc(groupRef)).data()?.memberCount + 1,
      updatedAt: serverTimestamp(),
    });

    // Update invitation status
    batch.update(doc(db, 'invitations', invitationId), {
      status: 'accepted',
      updatedAt: serverTimestamp(),
    });

    await batch.commit();
  } catch (error) {
    console.error('Error accepting invitation:', error);
    throw error;
  }
}

/**
 * Remove member from group
 */
export async function removeMember(
  groupId: string,
  memberId: string,
  removerId: string
): Promise<void> {
  try {
    // Check if group exists
    const groupDoc = await getDoc(doc(db, 'groups', groupId));
    if (!groupDoc.exists()) {
      throw new Error('Group not found');
    }

    const group = groupDoc.data() as Group;

    // Check if remover has permission
    if (!isGroupAdmin(removerId, group) && removerId !== memberId) {
      throw new Error('Not authorized to remove members');
    }

    // Cannot remove owner
    if (isGroupOwner(memberId, group)) {
      throw new Error('Cannot remove group owner');
    }

    const batch = writeBatch(db);

    // Remove member from group
    const memberDocs = await getDocs(
      query(
        collection(db, `groups/${groupId}/members`),
        where('id', '==', memberId)
      )
    );
    memberDocs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    // Remove group from user's groups
    const userGroupDocs = await getDocs(
      query(
        collection(db, `users/${memberId}/groups`),
        where('groupId', '==', groupId)
      )
    );
    userGroupDocs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    // Update group member count
    batch.update(doc(db, 'groups', groupId), {
      memberCount: group.memberCount - 1,
      updatedAt: serverTimestamp(),
    });

    await batch.commit();
  } catch (error) {
    console.error('Error removing member:', error);
    throw error;
  }
}

/**
 * Delete group
 */
export async function deleteGroup(
  groupId: string,
  userId: string
): Promise<void> {
  try {
    // Check if group exists and user is owner
    const groupDoc = await getDoc(doc(db, 'groups', groupId));
    if (!groupDoc.exists()) {
      throw new Error('Group not found');
    }

    if (!isGroupOwner(userId, groupDoc.data() as Group)) {
      throw new Error('Only group owner can delete group');
    }

    const batch = writeBatch(db);

    // Delete all member references
    const memberDocs = await getDocs(collection(db, `groups/${groupId}/members`));
    memberDocs.forEach(async (memberDoc) => {
      const memberId = memberDoc.data().id;
      // Remove group from user's groups
      const userGroupDocs = await getDocs(
        query(
          collection(db, `users/${memberId}/groups`),
          where('groupId', '==', groupId)
        )
      );
      userGroupDocs.forEach((doc) => {
        batch.delete(doc.ref);
      });
      // Delete member document
      batch.delete(memberDoc.ref);
    });

    // Delete all history
    const historyDocs = await getDocs(collection(db, `groups/${groupId}/history`));
    historyDocs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    // Delete pending invitations
    const invitationDocs = await getDocs(
      query(
        collection(db, 'invitations'),
        where('groupId', '==', groupId),
        where('status', '==', 'pending')
      )
    );
    invitationDocs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    // Delete group document
    batch.delete(doc(db, 'groups', groupId));

    await batch.commit();
  } catch (error) {
    console.error('Error deleting group:', error);
    throw error;
  }
}

/**
 * Update group settings
 */
export async function updateGroup(
  groupId: string,
  userId: string,
  updates: Partial<Group>
): Promise<void> {
  try {
    // Check if group exists and user has permission
    const groupDoc = await getDoc(doc(db, 'groups', groupId));
    if (!groupDoc.exists()) {
      throw new Error('Group not found');
    }

    if (!isGroupAdmin(userId, groupDoc.data() as Group)) {
      throw new Error('Not authorized to update group');
    }

    // Update group
    await updateDoc(doc(db, 'groups', groupId), {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating group:', error);
    throw error;
  }
}