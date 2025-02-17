import React, { useState } from 'react';
import { View, StyleSheet, Alert, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Button, Text, Card } from '@lunchtime-larry/ui';
import {
  UsersIcon,
  ClockIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';
import { useCollection } from '@lunchtime-larry/core/hooks';
import { Group } from '@lunchtime-larry/core/models';
import { formatDistanceToNow } from 'date-fns';

export default function GroupsScreen() {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);

  // Get user's groups
  const { data: groups, error } = useCollection<Group>('users/current/groups');

  const handleCreateGroup = () => {
    navigation.navigate('CreateGroup');
  };

  const handleJoinGroup = () => {
    navigation.navigate('JoinGroup');
  };

  const handleGroupPress = (groupId: string) => {
    navigation.navigate('GroupDetails', { groupId });
  };

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text variant="h3" style={styles.errorTitle}>
            Error Loading Groups
          </Text>
          <Text style={styles.errorText}>
            Unable to load your groups. Please try again.
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

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* Header */}
        <View style={styles.header}>
          <Text variant="h2" style={styles.title}>
            Your Groups
          </Text>
          <Text variant="body" style={styles.subtitle}>
            Create or join groups to find lunch together
          </Text>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <Button
            onPress={handleCreateGroup}
            variant="primary"
            style={styles.actionButton}
          >
            Create New Group
          </Button>
          <Button
            onPress={handleJoinGroup}
            variant="secondary"
            style={styles.actionButton}
          >
            Join a Group
          </Button>
        </View>

        {/* Groups List */}
        <View style={styles.groupsContainer}>
          {groups?.map((group) => (
            <TouchableOpacity
              key={group.id}
              onPress={() => handleGroupPress(group.id)}
              activeOpacity={0.7}
            >
              <Card style={styles.groupCard}>
                <View style={styles.groupContent}>
                  <View>
                    <Text variant="h4" style={styles.groupName}>
                      {group.name}
                    </Text>
                    <View style={styles.groupMetadata}>
                      <View style={styles.metadataItem}>
                        <UsersIcon width={16} height={16} color="#6B7280" />
                        <Text variant="small" style={styles.metadataText}>
                          {group.memberCount} members
                        </Text>
                      </View>
                      <View style={styles.metadataItem}>
                        <ClockIcon width={16} height={16} color="#6B7280" />
                        <Text variant="small" style={styles.metadataText}>
                          Active{' '}
                          {formatDistanceToNow(
                            new Date(group.lastActive.seconds * 1000),
                            { addSuffix: true }
                          )}
                        </Text>
                      </View>
                    </View>
                  </View>
                  <ChevronRightIcon width={20} height={20} color="#9CA3AF" />
                </View>
              </Card>
            </TouchableOpacity>
          ))}

          {groups?.length === 0 && (
            <View style={styles.emptyContainer}>
              <UsersIcon width={48} height={48} color="#9CA3AF" />
              <Text variant="body" style={styles.emptyText}>
                You haven't joined any groups yet.
              </Text>
              <Text variant="body" style={styles.emptySubtext}>
                Create a new group or join an existing one to get started.
              </Text>
            </View>
          )}
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
  },
  title: {
    marginBottom: 8,
    color: '#111827',
  },
  subtitle: {
    color: '#6B7280',
  },
  actions: {
    padding: 20,
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
  },
  groupsContainer: {
    padding: 20,
  },
  groupCard: {
    marginBottom: 12,
  },
  groupContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  groupName: {
    marginBottom: 8,
    color: '#111827',
  },
  groupMetadata: {
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
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    marginTop: 16,
    marginBottom: 8,
    color: '#374151',
    textAlign: 'center',
  },
  emptySubtext: {
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