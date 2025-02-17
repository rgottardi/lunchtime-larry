import React, { useState } from 'react';
import { View, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Button, Text, Input } from '@lunchtime-larry/ui';
import { createGroup } from '@lunchtime-larry/core/services';
import { useAuth } from '@lunchtime-larry/core/hooks';
import * as yup from 'yup';

const validationSchema = yup.object().shape({
  name: yup.string()
    .required('Group name is required')
    .min(3, 'Group name must be at least 3 characters')
    .max(50, 'Group name must be less than 50 characters'),
});

export default function CreateGroupScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    try {
      // Reset error state
      setError(null);

      // Validate input
      await validationSchema.validate({ name });

      if (!user) {
        throw new Error('You must be signed in to create a group');
      }

      setLoading(true);

      // Create group
      const groupId = await createGroup(name, user.uid);

      // Navigate to group details
      navigation.replace('GroupDetails', { groupId });
    } catch (err) {
      if (err instanceof yup.ValidationError) {
        setError(err.message);
      } else {
        Alert.alert(
          'Error',
          'Unable to create group. Please try again.',
          [{ text: 'OK' }]
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.content}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text variant="h2" style={styles.title}>
            Create New Group
          </Text>
          <Text variant="body" style={styles.subtitle}>
            Create a group to find lunch with your friends or colleagues
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <Input
            label="Group Name"
            value={name}
            onChangeText={setName}
            placeholder="Enter group name..."
            error={error}
            autoFocus
            returnKeyType="done"
            onSubmitEditing={handleCreate}
          />

          <Button
            onPress={handleCreate}
            variant="primary"
            size="lg"
            loading={loading}
            style={styles.createButton}
          >
            Create Group
          </Button>
        </View>

        {/* Tips */}
        <View style={styles.tips}>
          <Text variant="small" style={styles.tipsTitle}>
            Tips for creating a group:
          </Text>
          <View style={styles.tipsList}>
            <Text variant="small" style={styles.tip}>
              • Choose a name that's easy for others to recognize
            </Text>
            <Text variant="small" style={styles.tip}>
              • You can invite members after creating the group
            </Text>
            <Text variant="small" style={styles.tip}>
              • You'll be the group owner and can manage settings
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  content: {
    flex: 1,
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
  form: {
    padding: 20,
  },
  createButton: {
    marginTop: 16,
  },
  tips: {
    padding: 20,
  },
  tipsTitle: {
    marginBottom: 12,
    color: '#374151',
    fontWeight: '600',
  },
  tipsList: {
    gap: 8,
  },
  tip: {
    color: '#6B7280',
  },
});