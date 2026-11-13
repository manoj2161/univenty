import React, { useCallback, useEffect, useMemo, useState } from "react";

import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  StatusBar,
  ImageBackground,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

import api from "../api/api";
import { COLORS } from "../theme/colors";
import { useAuth } from "../context/AuthContext";
import EventCard from "../components/EventCard";

const campusImage = require("../../assets/images/campus.png");

const CATEGORIES = [
  "All",
  "Cultural",
  "Technical",
  "Sports",
  "Workshop",
  "Academic",
];

function getList(response, keys) {
  const data = response?.data;

  if (Array.isArray(data)) return data;

  for (const key of keys) {
    if (Array.isArray(data?.[key])) return data[key];
  }

  if (Array.isArray(data?.data)) return data.data;

  return [];
}

export default function HomeScreen({ navigation }) {
  const { user, refreshUser } = useAuth();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [unreadCount, setUnreadCount] = useState(0);

  // Profile picture state
  const [imageError, setImageError] = useState(false);

  const profilePicture = user?.profilePicture;

  const firstName = user?.name?.split(" ")[0] || "Student";

  const avatarInitial = (user?.name || "U").trim().charAt(0).toUpperCase();

  // Refresh avatar error state when profile picture changes
  useEffect(() => {
    setImageError(false);
  }, [profilePicture]);

  // LOAD EVENTS
  const loadEvents = useCallback(async (refresh = false) => {
    try {
      if (refresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response = await api.get("/events");

      setEvents(getList(response, ["events"]));
    } catch (e) {
      setError(
        e.response?.data?.message ||
          "Unable to load events. Check that your backend is running.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // LOAD NOTIFICATIONS
  const loadNotifications = useCallback(async () => {
    try {
      const response = await api.get("/notifications");

      const list = getList(response, ["notifications"]);

      setUnreadCount(
        list.filter(
          (notification) =>
            notification.isRead === false || notification.read === false,
        ).length,
      );
    } catch (e) {
      console.log("Notification count:", e.message);
    }
  }, []);

  // LOAD EVENTS ON MOUNT
  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  // REFRESH USER AND NOTIFICATIONS WHEN SCREEN GETS FOCUS
  useFocusEffect(
    useCallback(() => {
      loadNotifications();

      // Refresh user data so updated profile pictures appear.
      if (typeof refreshUser === "function") {
        refreshUser().catch((error) => {
          console.log("Profile refresh:", error.message);
        });
      }
    }, [loadNotifications, refreshUser]),
  );

  // SEARCH AND CATEGORY FILTER
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    return events.filter((event) => {
      const cat = String(event.category || "").toLowerCase();

      const categoryMatch =
        category === "All" || cat === category.toLowerCase();

      const searchMatch =
        !q ||
        [
          event.name,
          event.title,
          event.description,
          event.eventLocation,
          event.category,
        ].some((value) =>
          String(value || "")
            .toLowerCase()
            .includes(q),
        );

      return categoryMatch && searchMatch;
    });
  }, [events, search, category]);

  const featured = filtered[0];

  // PULL TO REFRESH
  const refresh = async () => {
    await Promise.all([
      loadEvents(true),
      loadNotifications(),
      typeof refreshUser === "function" ? refreshUser() : Promise.resolve(),
    ]);
  };

  // PROFILE AVATAR
  const renderAvatar = () => {
    if (profilePicture && !imageError) {
      return (
        <Image
          key={profilePicture}
          source={{
            uri: profilePicture,
          }}
          style={styles.avatarImage}
          resizeMode="cover"
          onError={() => setImageError(true)}
        />
      );
    }

    return <Text style={styles.avatarText}>{avatarInitial}</Text>;
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      <ScrollView
        style={styles.page}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            tintColor={COLORS.primary}
          />
        }
      >
        {/* TOP BAR */}
        <View style={styles.topbar}>
          <View style={styles.brand}>
            <Text style={styles.logo}>UNIVENTY</Text>
            <Text style={styles.tagline}>CAMPUS CONNECT</Text>
          </View>

          <View style={styles.actions}>
            {/* NOTIFICATION ICON */}
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => navigation.navigate("Notifications")}
              activeOpacity={0.7}
            >
              <Ionicons
                name="notifications-outline"
                size={23}
                color={COLORS.primaryDark}
              />

              {unreadCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>

            {/* PROFILE AVATAR */}
            <TouchableOpacity
              style={styles.avatar}
              onPress={() => navigation.navigate("Profile")}
              activeOpacity={0.7}
            >
              {renderAvatar()}
            </TouchableOpacity>
          </View>
        </View>

        {/* WELCOME SECTION */}
        <View style={styles.welcome}>
          <Text style={styles.welcomeTitle}>Welcome, {firstName}</Text>

          <Text style={styles.welcomeSub}>
            Discover what's happening on your campus.
          </Text>
        </View>

        {/* HERO SECTION */}
        <ImageBackground
          source={campusImage}
          style={styles.hero}
          imageStyle={styles.heroImage}
        >
          <View style={styles.heroOverlay} />

          <View style={styles.heroContent}>
            <Text style={styles.heroEyebrow}>YOUR CAMPUS, YOUR COMMUNITY</Text>

            <Text style={styles.heroTitle}>
              Make every campus moment count.
            </Text>

            <Text style={styles.heroSub}>
              Find events. Meet people. Create memories.
            </Text>

            <TouchableOpacity
              style={styles.heroButton}
              onPress={() => navigation.navigate("Discover")}
              activeOpacity={0.8}
            >
              <Text style={styles.heroButtonText}>Explore events →</Text>
            </TouchableOpacity>
          </View>
        </ImageBackground>

        {/* SEARCH */}
        <View style={styles.searchBox}>
          <Ionicons
            name="search-outline"
            size={20}
            color={COLORS.primary}
            style={styles.searchIcon}
          />

          <TextInput
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholder="Search events, categories, venues..."
            placeholderTextColor={COLORS.secondaryText}
            returnKeyType="search"
          />

          {!!search && (
            <TouchableOpacity onPress={() => setSearch("")} activeOpacity={0.7}>
              <Ionicons
                name="close-circle"
                size={20}
                color={COLORS.secondaryText}
              />
            </TouchableOpacity>
          )}
        </View>

        {/* CATEGORY FILTERS */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chips}
        >
          {CATEGORIES.map((item) => (
            <TouchableOpacity
              key={item}
              onPress={() => setCategory(item)}
              style={[styles.chip, category === item && styles.chipActive]}
            >
              <Text
                style={[
                  styles.chipText,
                  category === item && styles.chipTextActive,
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* FEATURED EVENT HEADER */}
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.kicker}>HAPPENING ON CAMPUS</Text>

            <Text style={styles.sectionTitle}>Featured Event</Text>
          </View>

          <TouchableOpacity onPress={() => navigation.navigate("Discover")}>
            <Text style={styles.viewAll}>VIEW ALL →</Text>
          </TouchableOpacity>
        </View>

        {/* EVENT CONTENT */}
        {loading ? (
          <View style={styles.state}>
            <ActivityIndicator size="large" color={COLORS.primary} />

            <Text style={styles.stateText}>Loading campus events...</Text>
          </View>
        ) : error ? (
          <View style={styles.emptyCard}>
            <Text style={styles.error}>{error}</Text>

            <TouchableOpacity onPress={() => loadEvents()}>
              <Text style={styles.retry}>Try again</Text>
            </TouchableOpacity>
          </View>
        ) : filtered.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons
              name="calendar-clear-outline"
              size={35}
              color={COLORS.secondaryText}
            />

            <Text style={styles.emptyTitle}>No events found</Text>

            <Text style={styles.stateText}>
              Try a different search or category.
            </Text>
          </View>
        ) : (
          <>
            <EventCard
              event={featured}
              onPress={() =>
                navigation.navigate("EventDetails", {
                  event: featured,
                })
              }
            />

            {filtered.length > 1 && (
              <View style={styles.sectionHeader}>
                <View>
                  <Text style={styles.kicker}>EXPLORE MORE</Text>

                  <Text style={styles.sectionTitle}>Upcoming Events</Text>
                </View>

                <TouchableOpacity
                  onPress={() => navigation.navigate("Discover")}
                >
                  <Text style={styles.viewAll}>SEE ALL →</Text>
                </TouchableOpacity>
              </View>
            )}

            {filtered.slice(1, 4).map((event, index) => (
              <EventCard
                key={event._id || event.id || index}
                event={event}
                compact
                onPress={() =>
                  navigation.navigate("EventDetails", {
                    event,
                  })
                }
              />
            ))}
          </>
        )}

        {/* FOOTER */}
        <View style={styles.footer}>
          <Text style={styles.footerLogo}>UNIVENTY</Text>

          <Text style={styles.footerText}>
            Your campus. Your events. Your community.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// STYLES
const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  page: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  content: {
    paddingHorizontal: 19,
    paddingBottom: 28,
  },

  topbar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 13,
    paddingBottom: 13,
  },

  brand: {},

  logo: {
    color: COLORS.text,
    fontSize: 23,
    fontWeight: "900",
    letterSpacing: 2.2,
  },

  tagline: {
    color: COLORS.secondaryText,
    fontSize: 8,
    letterSpacing: 1.8,
    marginTop: 3,
    fontWeight: "700",
  },

  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },

  badge: {
    position: "absolute",
    top: -5,
    right: -5,
    minWidth: 18,
    height: 18,
    borderRadius: 10,
    backgroundColor: COLORS.danger,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
    borderWidth: 1,
    borderColor: COLORS.background,
  },

  badgeText: {
    color: "#FFF",
    fontSize: 9,
    fontWeight: "900",
  },

  avatar: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: COLORS.primaryLight,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },

  avatarImage: {
    width: "100%",
    height: "100%",
    borderRadius: 13,
  },

  avatarText: {
    color: COLORS.primaryDark,
    fontSize: 17,
    fontWeight: "900",
  },

  welcome: {
    paddingTop: 9,
    paddingBottom: 17,
  },

  welcomeTitle: {
    color: COLORS.text,
    fontSize: 23,
    fontWeight: "900",
  },

  welcomeSub: {
    color: COLORS.secondaryText,
    fontSize: 12,
    marginTop: 6,
  },

  hero: {
    height: 190,
    borderRadius: 19,
    overflow: "hidden",
    justifyContent: "flex-end",
    marginBottom: 19,
    backgroundColor: COLORS.primaryDark,
  },

  heroImage: {
    borderRadius: 19,
  },

  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(28,35,19,0.58)",
  },

  heroContent: {
    padding: 18,
  },

  heroEyebrow: {
    color: "#E8EBDD",
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 1.4,
  },

  heroTitle: {
    color: "#FFF",
    fontSize: 22,
    lineHeight: 27,
    fontWeight: "900",
    marginTop: 7,
    maxWidth: 280,
  },

  heroSub: {
    color: "#F1F2EB",
    fontSize: 10,
    marginTop: 5,
  },

  heroButton: {
    alignSelf: "flex-start",
    backgroundColor: "#F7F8F1",
    paddingHorizontal: 13,
    paddingVertical: 9,
    borderRadius: 9,
    marginTop: 12,
  },

  heroButtonText: {
    color: COLORS.primaryDark,
    fontSize: 10,
    fontWeight: "900",
  },

  searchBox: {
    height: 47,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 13,
  },

  searchIcon: {
    marginRight: 8,
  },

  searchInput: {
    flex: 1,
    color: COLORS.text,
    fontSize: 11,
  },

  chips: {
    gap: 8,
    paddingVertical: 15,
  },

  chip: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },

  chipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },

  chipText: {
    color: COLORS.secondaryText,
    fontSize: 10,
    fontWeight: "700",
  },

  chipTextActive: {
    color: "#FFF",
  },

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
    marginBottom: 13,
  },

  kicker: {
    color: COLORS.primary,
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 1.4,
    marginBottom: 4,
  },

  sectionTitle: {
    color: COLORS.text,
    fontSize: 19,
    fontWeight: "900",
  },

  viewAll: {
    color: COLORS.primary,
    fontSize: 9,
    fontWeight: "900",
  },

  state: {
    paddingVertical: 28,
    alignItems: "center",
  },

  stateText: {
    color: COLORS.secondaryText,
    fontSize: 11,
    marginTop: 9,
    textAlign: "center",
  },

  emptyCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 20,
    alignItems: "center",
  },

  emptyTitle: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: "800",
    marginTop: 8,
  },

  error: {
    color: COLORS.danger,
    textAlign: "center",
    fontSize: 12,
  },

  retry: {
    color: COLORS.primary,
    fontWeight: "800",
    marginTop: 12,
  },

  footer: {
    alignItems: "center",
    paddingTop: 27,
  },

  footerLogo: {
    color: COLORS.primaryDark,
    fontWeight: "900",
    letterSpacing: 2,
    fontSize: 12,
  },

  footerText: {
    color: COLORS.secondaryText,
    fontSize: 9,
    marginTop: 5,
  },
});
