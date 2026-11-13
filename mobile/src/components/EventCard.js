import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { COLORS } from "../theme/colors";
import { getEventImage } from "./eventImages";

export default function EventCard({ event = {}, onPress, compact = false }) {
  const date = event.eventDate ? new Date(event.eventDate) : null;

  const formattedDate =
    date && !Number.isNaN(date.getTime())
      ? date.toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : "Date to be announced";

  const image = event.image || event.coverImage || event.poster || null;

  return (
    <TouchableOpacity
      style={[styles.card, compact && styles.compact]}
      onPress={onPress}
      activeOpacity={0.88}
    >
      <ImageBackground
        source={image ? { uri: image } : getEventImage(event.category)}
        style={styles.cover}
        imageStyle={styles.coverImage}
      >
        <View style={styles.coverShade} />

        <View style={styles.badge}>
          <Ionicons
            name="pricetag"
            size={11}
            color={COLORS.primaryDark}
            style={styles.badgeIcon}
          />
          <Text style={styles.badgeText}>
            {event.category || "Campus Event"}
          </Text>
        </View>
      </ImageBackground>

      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={2}>
          {event.name || event.title || "Untitled event"}
        </Text>

        {!!event.description && (
          <Text style={styles.description} numberOfLines={2}>
            {event.description}
          </Text>
        )}

        <View style={styles.meta}>
          <View style={styles.metaRow}>
            <View style={styles.metaIconContainer}>
              <Ionicons
                name="calendar-outline"
                size={14}
                color={COLORS.primary}
              />
            </View>
            <Text style={styles.metaText}>{formattedDate}</Text>
          </View>

          <View style={styles.metaRow}>
            <View style={styles.metaIconContainer}>
              <Ionicons
                name="location-outline"
                size={15}
                color={COLORS.primary}
              />
            </View>
            <Text style={styles.metaText} numberOfLines={1}>
              {event.eventLocation || "Venue to be announced"}
            </Text>
          </View>
        </View>

        <View style={styles.actionRow}>
          <Text style={styles.action}>View event</Text>
          <Ionicons
            name="arrow-forward-circle"
            size={19}
            color={COLORS.primary}
          />
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: "hidden",
    marginBottom: 15,
  },

  compact: {
    marginBottom: 12,
  },

  cover: {
    height: 145,
    justifyContent: "flex-start",
    padding: 13,
    backgroundColor: COLORS.primaryLight,
  },

  coverImage: {
    resizeMode: "cover",
  },

  coverShade: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(25,30,18,0.12)",
  },

  badge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F8F0",
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 20,
  },

  badgeIcon: {
    marginRight: 5,
  },

  badgeText: {
    color: COLORS.primaryDark,
    fontSize: 10,
    fontWeight: "800",
  },

  body: {
    padding: 15,
  },

  title: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "900",
  },

  description: {
    color: COLORS.secondaryText,
    fontSize: 11,
    lineHeight: 17,
    marginTop: 6,
  },

  meta: {
    marginTop: 11,
    gap: 8,
  },

  metaRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  metaIconContainer: {
    width: 22,
    alignItems: "flex-start",
    justifyContent: "center",
  },

  metaText: {
    color: COLORS.secondaryText,
    fontSize: 10,
    flex: 1,
  },

  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 12,
  },

  action: {
    color: COLORS.primary,
    fontWeight: "900",
    fontSize: 11,
  },
});
