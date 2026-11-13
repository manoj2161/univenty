import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import api from "../api/api";
import EventCard from "../components/EventCard";
import { COLORS } from "../theme/colors";

const FILTERS = [
  "All",
  "Cultural",
  "Technical",
  "Sports",
  "Workshop",
  "Academic",
];

function getEvents(response) {
  const data = response?.data;
  if (Array.isArray(data)) return data;
  return data?.events || data?.data?.events || data?.data || [];
}

export default function DiscoverScreen({ navigation }) {
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async (refresh = false) => {
    try {
      refresh ? setRefreshing(true) : setLoading(true);
      setError("");

      const response = await api.get("/events");
      setEvents(getEvents(response));
    } catch (e) {
      setError(
        e.response?.data?.message ||
          "Unable to load events. Check your backend connection.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(
    () =>
      events.filter((event) => {
        const query = search.trim().toLowerCase();
        const cat = String(event.category || "").toLowerCase();

        const categoryMatch =
          category === "All" || cat === category.toLowerCase();

        const searchMatch =
          !query ||
          [
            event.name,
            event.title,
            event.description,
            event.eventLocation,
            event.category,
          ].some((value) =>
            String(value || "")
              .toLowerCase()
              .includes(query),
          );

        return categoryMatch && searchMatch;
      }),
    [events, search, category],
  );

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
            onRefresh={() => load(true)}
            tintColor={COLORS.primary}
          />
        }
      >
        <Text style={styles.eyebrow}>FIND YOUR NEXT EXPERIENCE</Text>
        <Text style={styles.heading}>Discover Events</Text>
        <Text style={styles.subtitle}>
          Explore what's happening across your campus.
        </Text>

        <View style={styles.searchBox}>
          <Ionicons
            name="search-outline"
            size={20}
            color={COLORS.primary}
            style={styles.searchIcon}
          />

          <TextInput
            style={styles.search}
            placeholder="Search events, venues or categories..."
            placeholderTextColor={COLORS.secondaryText}
            value={search}
            onChangeText={setSearch}
          />

          {!!search && (
            <TouchableOpacity
              onPress={() => setSearch("")}
              style={styles.clearButton}
              accessibilityLabel="Clear search"
            >
              <Ionicons
                name="close-circle"
                size={20}
                color={COLORS.secondaryText}
              />
            </TouchableOpacity>
          )}
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filters}
        >
          {FILTERS.map((item) => (
            <TouchableOpacity
              key={item}
              onPress={() => setCategory(item)}
              style={[styles.filter, category === item && styles.filterActive]}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.filterText,
                  category === item && styles.filterTextActive,
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.resultsRow}>
          <Text style={styles.resultsTitle}>Campus events</Text>
          {!loading && (
            <Text style={styles.count}>{filtered.length} found</Text>
          )}
        </View>

        {loading ? (
          <View style={styles.state}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.stateText}>Finding events...</Text>
          </View>
        ) : error ? (
          <View style={styles.empty}>
            <Text style={styles.error}>{error}</Text>
            <TouchableOpacity onPress={() => load()}>
              <Text style={styles.retry}>Try again</Text>
            </TouchableOpacity>
          </View>
        ) : filtered.length ? (
          filtered.map((event, index) => (
            <EventCard
              key={event._id || event.id || index}
              event={event}
              onPress={() => navigation.navigate("EventDetails", { event })}
            />
          ))
        ) : (
          <View style={styles.empty}>
            <Ionicons
              name="calendar-clear-outline"
              size={38}
              color={COLORS.primary}
              style={styles.emptyIcon}
            />
            <Text style={styles.emptyTitle}>No matching events</Text>
            <Text style={styles.stateText}>
              Change your search or category filter.
            </Text>
            <TouchableOpacity
              onPress={() => {
                setSearch("");
                setCategory("All");
              }}
            >
              <Text style={styles.retry}>Clear filters</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

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
    padding: 20,
    paddingBottom: 30,
  },
  eyebrow: {
    color: COLORS.primary,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1.4,
    marginTop: 15,
  },
  heading: {
    color: COLORS.text,
    fontSize: 26,
    fontWeight: "900",
    marginTop: 5,
  },
  subtitle: {
    color: COLORS.secondaryText,
    fontSize: 12,
    marginTop: 6,
    marginBottom: 18,
  },
  searchBox: {
    height: 48,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 13,
  },
  searchIcon: {
    marginRight: 9,
  },
  search: {
    flex: 1,
    color: COLORS.text,
    fontSize: 11,
  },
  clearButton: {
    padding: 4,
  },
  filters: {
    gap: 8,
    paddingVertical: 15,
  },
  filter: {
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterText: {
    color: COLORS.secondaryText,
    fontSize: 10,
    fontWeight: "700",
  },
  filterTextActive: {
    color: "#FFF",
  },
  resultsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
    marginBottom: 13,
  },
  resultsTitle: {
    color: COLORS.text,
    fontSize: 17,
    fontWeight: "900",
  },
  count: {
    color: COLORS.secondaryText,
    fontSize: 10,
  },
  state: {
    alignItems: "center",
    paddingVertical: 35,
  },
  stateText: {
    color: COLORS.secondaryText,
    fontSize: 11,
    marginTop: 8,
    textAlign: "center",
  },
  empty: {
    backgroundColor: COLORS.surface,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 22,
    alignItems: "center",
  },
  emptyIcon: {
    marginBottom: 12,
  },
  emptyTitle: {
    color: COLORS.text,
    fontWeight: "900",
    fontSize: 15,
  },
  error: {
    color: COLORS.danger,
    fontSize: 12,
    textAlign: "center",
  },
  retry: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: "900",
    marginTop: 13,
  },
});
