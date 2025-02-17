import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { HomeIcon, UsersIcon, UserIcon } from 'react-native-heroicons/outline';

import { useAuth } from '@/hooks/useAuth';
import { RootStackParamList, MainTabParamList, AuthStackParamList } from './types';

// Auth screens
import SignInScreen from '@/screens/auth/SignInScreen';
import SignUpScreen from '@/screens/auth/SignUpScreen';
import ForgotPasswordScreen from '@/screens/auth/ForgotPasswordScreen';

// Main screens
import HomeScreen from '@/screens/HomeScreen';
import GroupsScreen from '@/screens/GroupsScreen';
import ProfileScreen from '@/screens/ProfileScreen';
import GroupDetailsScreen from '@/screens/GroupDetailsScreen';
import CreateGroupScreen from '@/screens/CreateGroupScreen';
import JoinGroupScreen from '@/screens/JoinGroupScreen';
import RestaurantDetailsScreen from '@/screens/RestaurantDetailsScreen';
import ProfileSetupScreen from '@/screens/ProfileSetupScreen';
import SettingsScreen from '@/screens/SettingsScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();
const AuthStack = createNativeStackNavigator<AuthStackParamList>();

function AuthNavigator() {
  return (
    <AuthStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <AuthStack.Screen name="SignIn" component={SignInScreen} />
      <AuthStack.Screen name="SignUp" component={SignUpScreen} />
      <AuthStack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </AuthStack.Navigator>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#4F46E5',
        tabBarInactiveTintColor: '#6B7280',
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <HomeIcon color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Groups"
        component={GroupsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <UsersIcon color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <UserIcon color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function Navigation() {
  const { user, loading } = useAuth();

  if (loading) {
    return null; // Or a loading screen
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        {!user ? (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        ) : (
          <>
            <Stack.Screen name="Main" component={MainTabs} />
            <Stack.Screen
              name="GroupDetails"
              component={GroupDetailsScreen}
              options={{
                headerShown: true,
                title: 'Group Details',
              }}
            />
            <Stack.Screen
              name="CreateGroup"
              component={CreateGroupScreen}
              options={{
                headerShown: true,
                title: 'Create Group',
              }}
            />
            <Stack.Screen
              name="JoinGroup"
              component={JoinGroupScreen}
              options={{
                headerShown: true,
                title: 'Join Group',
              }}
            />
            <Stack.Screen
              name="RestaurantDetails"
              component={RestaurantDetailsScreen}
              options={{
                headerShown: true,
                title: 'Restaurant Details',
              }}
            />
            <Stack.Screen
              name="ProfileSetup"
              component={ProfileSetupScreen}
              options={{
                headerShown: true,
                title: 'Complete Profile',
              }}
            />
            <Stack.Screen
              name="Settings"
              component={SettingsScreen}
              options={{
                headerShown: true,
                title: 'Settings',
              }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}