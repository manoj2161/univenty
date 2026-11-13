import React from "react";
import { ActivityIndicator, View, StyleSheet } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

import { useAuth } from "../context/AuthContext";
import { COLORS } from "../theme/colors";

import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import HomeScreen from "../screens/HomeScreen";
import DiscoverScreen from "../screens/DiscoverScreen";
import DashboardScreen from "../screens/DashboardScreen";
import ProfileScreen from "../screens/ProfileScreen";

import {
  EventDetailsScreen,
  MyRegistrationsScreen,
  BookmarksScreen,
  NotificationsScreen,
  EditProfileScreen,
  ManageEventsScreen,
  ParticipantsScreen,
  AdminUsersScreen,
  AdminEventsScreen,
  AdminRegistrationsScreen,
  AnnouncementsScreen,
  AdminAnalyticsScreen,
} from "../screens/FeatureScreens";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const getUserRole = (user) => {
  if (!user) return "Guest";
  if (user.isAdmin === true) return "Admin";

  const role = String(user.category || user.role || "Student").toLowerCase();

  if (role === "admin") return "Admin";
  if (role === "organiser") return "Organiser";

  return "Student";
};

const TAB_ICONS = {
  Home: { active: "home", inactive: "home-outline" },
  Discover: { active: "compass", inactive: "compass-outline" },
  Dashboard: { active: "grid", inactive: "grid-outline" },
  Profile: { active: "person", inactive: "person-outline" },
};

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.secondaryText,

        tabBarStyle: {
          height: 66,
          paddingBottom: 8,
          paddingTop: 7,
          backgroundColor: COLORS.surface,
          borderTopColor: COLORS.border,
          borderTopWidth: 1,
          elevation: 8,
        },

        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
        },

        tabBarIcon: ({ focused, color }) => {
          const icon = TAB_ICONS[route.name];

          return (
            <Ionicons
              name={focused ? icon.active : icon.inactive}
              size={23}
              color={color}
            />
          );
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Discover" component={DiscoverScreen} />
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

const secondaryHeaderOptions = {
  headerShown: true,
  headerTitle: "",
  headerBackTitle: "",
  headerTintColor: COLORS.primaryDark,
  headerStyle: {
    backgroundColor: COLORS.background,
  },
  headerShadowVisible: false,
  headerBackVisible: true,
  headerTitleAlign: "left",
};

export default function AppNavigator() {
  const { user, loading } = useAuth();
  const role = getUserRole(user);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
        contentStyle: {
          backgroundColor: COLORS.background,
        },
      }}
    >
      {!user ? (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </>
      ) : (
        <>
          <Stack.Screen name="Main" component={MainTabs} />

          <Stack.Screen
            name="EventDetails"
            component={EventDetailsScreen}
            options={secondaryHeaderOptions}
          />

          <Stack.Screen
            name="MyRegistrations"
            component={MyRegistrationsScreen}
            options={secondaryHeaderOptions}
          />

          <Stack.Screen
            name="Bookmarks"
            component={BookmarksScreen}
            options={secondaryHeaderOptions}
          />

          <Stack.Screen
            name="Notifications"
            component={NotificationsScreen}
            options={secondaryHeaderOptions}
          />

          <Stack.Screen
            name="EditProfile"
            component={EditProfileScreen}
            options={secondaryHeaderOptions}
          />

          {(role === "Organiser" || role === "Admin") && (
            <>
              <Stack.Screen
                name="ManageEvents"
                component={ManageEventsScreen}
                options={secondaryHeaderOptions}
              />

              <Stack.Screen
                name="Participants"
                component={ParticipantsScreen}
                options={secondaryHeaderOptions}
              />
            </>
          )}

          {role === "Admin" && (
            <>
              <Stack.Screen
                name="AdminUsers"
                component={AdminUsersScreen}
                options={secondaryHeaderOptions}
              />

              <Stack.Screen
                name="AdminEvents"
                component={AdminEventsScreen}
                options={secondaryHeaderOptions}
              />

              <Stack.Screen
                name="AdminRegistrations"
                component={AdminRegistrationsScreen}
                options={secondaryHeaderOptions}
              />

              <Stack.Screen
                name="Announcements"
                component={AnnouncementsScreen}
                options={secondaryHeaderOptions}
              />

              <Stack.Screen
                name="AdminAnalytics"
                component={AdminAnalyticsScreen}
                options={secondaryHeaderOptions}
              />
            </>
          )}
        </>
      )}
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: "center",
    alignItems: "center",
  },
});
