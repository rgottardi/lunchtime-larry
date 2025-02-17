import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import {
  Button,
  Text,
  Input,
  Card,
  RestaurantCard,
} from '@lunchtime-larry/ui';
import {
  UserIcon,
  UserPlusIcon,
  UserMinusIcon,
  ChevronRightIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { useDocument, useCollection, useAuth } from '@lunchtime-larry/core/hooks';
import {
  Group,
  GroupMember,
  Restaurant,
  isGroupAdmin,
  isGroupOwner,
} from '@lunchtime-larry/core/models';
import {
  inviteToGroup,
  removeMember,
  deleteGroup,
} from '@lunchtime-larry/core/services';

export default function GroupDetailsScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviting, setInviting] = useState(false);

  const { groupId } = route.params as { groupId: string };

  // Get group data
  const {
    data: group,
    error: groupError,
    refetch: refetchGroup,
  } = useDocument<Group>(`groups/${groupId}`);

  // Get members
  const {
    data: members,
    error: membersError,
    refetch: refetchMembers,
  } = useCollection<GroupMember>(`groups/${groupId}/members`);

  // Get history
  const {
    data: history,
    error: historyError,
    refetch: refetchHistory,
  } = useCollection(`groups/${groupId}/history`);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      refetchGroup(),
      refetchMembers(),
      refetchHistory(),
    ]);
    setRefreshing(false);
  }, [refetchGroup, refetchMembers, refetchHistory]);

  const handleInvite = async () => {
    if (!user || !group) return;

    try {
      setInviting(true);
      await inviteToGroup(groupId, inviteEmail, user.uid);
      setInviteEmail('');
      Alert.alert('Success', 'Invitation sent!');
    } catch (error) {
      Alert.alert('Error', 'Failed to send invitation. Please try again.');
    } finally {
      setInviting(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!user || !group) return;

    Alert.alert(
      'Remove Member',
      'Are you sure you want to remove this member?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await removeMember(groupId, memberId, user.uid);
              refetchMembers();
            } catch (error) {
              Alert.alert(
                'Error',
                'Failed to remove member. Please try again.'
              );
            }
          },
        },
      ]
    );
  };

  const handleDeleteGroup = async () => {
    if (!user || !group) return;

    Alert.alert(
      'Delete Group',
      'Are you sure you want to delete this group? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteGroup(groupId, user.uid);
              navigation.navigate('Groups');
            } catch (error) {
              Alert.alert(
                'Error',
                'Failed to delete group. Please try again.'
              );
            }
          },
        },
      ]
    );
  };

  if (groupError || membersError) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text variant="h3" style={styles.errorTitle}>
            Error Loading Group
          </Text>
          <Text style={styles.errorText}>
            Unable to load group details. Please try again.
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

  if (!group || !members) {
    return null;
  }

  const isAdmin = user ? isGroupAdmin(user.uid, group) : false;
  const isOwner = user ? isGroupOwner(user.uid, group) : false;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text variant="h2" style={styles.title}>
            {group.name}
          </Text>
          <View style={styles.metadata}>
            <View style={styles.metadataItem}>
              <UserIcon width={16} height={16} color="#6B7280" />
              <Text variant="small" style={styles.metadataText}>
                {group.memberCount} members
              </Text>
            </View>
            <View style={styles.metadataItem}>
              <ClockIcon width={16} height={16} color="#6B7280" />
              <Text variant="small" style={styles.metadataText}>
                Created{' '}
                {format(new Date(group.createdAt.seconds * 1000), 'MMM d, yyyy')}
              </Text>
            </View>
          </View>
        </View>

        {/* Members */}
        <View style={styles.section}>
          <Text variant="h3" style={styles.sectionTitle}>
            Members
          </Text>
          {members.map((member) => (
            <Card key={member.id} style={styles.memberCard}>
              <View style={styles.memberContent}>
                <View style={styles.memberInfo}>
                  <Text variant="body-semibold" style={styles.memberName}>
                    {member.displayName || 'User'}
                  </Text>
                  <Text variant="small" style={styles.memberRole}>
                    {member.role}
                  </Text>
                </View>
                {isAdmin && !isGroupOwner(member.id, group) && (
                  <TouchableOpacity
                    onPress={() => handleRemoveMember(member.id)}
                    style={styles.removeButton}
                  >
                    <UserMinusIcon width={20} height={20} color="#EF4444" />
                  </TouchableOpacity>
                )}
              </View>
            </Card>
          ))}
        </View>

        {/* Invite Members */}
        {isAdmin && (
          <View style={styles.section}>
            <Text variant="h3" style={styles.sectionTitle}>
              Invite Members
            </Text>
            <View style={styles.inviteForm}>
              <Input
                placeholder="Enter email address..."
                value={inviteEmail}
                onChangeText={setInviteEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                style={styles.inviteInput}
              />
              <Button
                onPress={handleInvite}
                variant="primary"
                loading={inviting}
                style={styles.inviteButton}
              >
                Invite
              </Button>
            </View>
          </View>
        )}

        {/* History */}
        {history && history.length > 0 && (
          <View style={styles.section}>
            <Text variant="h3" style={styles.sectionTitle}>
              Recent Selections
            </Text>
            {history.map((item) => (
              <RestaurantCard
                key={item.id}
                restaurant={item.restaurant}
                onPress={() =>
                  navigation.navigate('RestaurantDetails', {
                    restaurantId: item.restaurantId,
                  })
                }
                style={styles.historyCard}
              />
            ))}
          </View>
        )}

        {/* Delete Group */}
        {isOwner && (
          <View style={styles.deleteSection}>
            <Button
              onPress={handleDeleteGroup}
              variant="danger"
              style={styles.deleteButton}
            >
              Delete Group
            </Button>
            <Text variant="small" style={styles.deleteWarning}>
              This action cannot be undone. All members will be removed and
              history will be deleted.
            </Text>
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
  metadata: {
    flexDirection: 'row',
    gap: 16,
  },
  metadataItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metadataText: {
    color: '#6B7280',
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    marginBottom: 16,
    color: '#111827',
  },
  memberCard: {
    marginBottom: 12,
  },
  memberContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    marginBottom: 4,
    color: '#111827',
  },
  memberRole: {
    color: '#6B7280',
    textTransform: 'capitalize',
  },
  removeButton: {
    padding: 8,
  },
  inviteForm: {
    flexDirection: 'row',
    gap: 12,
  },
  inviteInput: {
    flex: 1,
  },
  inviteButton: {
    minWidth: 100,
  },
  historyCard: {
    marginBottom: 12,
  },
  deleteSection: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  deleteButton: {
    marginBottom: 12,
  },
  deleteWarning: {
    color: '#6B7280',
    textAlign: 'center',
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