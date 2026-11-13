import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import { COLORS } from "../theme/colors";

export default function ProfileAvatar({ user, size = 42, style }) {
  const imageUri = user?.profilePicture;

  const initial = (user?.name || "U").trim().charAt(0).toUpperCase();

  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: size * 0.32,
        },
        style,
      ]}
    >
      {imageUri ? (
        <Image
          source={{ uri: imageUri }}
          style={{
            width: size,
            height: size,
            borderRadius: size * 0.32,
          }}
          resizeMode="cover"
        />
      ) : (
        <Text style={[styles.initial, { fontSize: size * 0.4 }]}>
          {initial}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.primaryLight,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  initial: {
    color: COLORS.primaryDark,
    fontWeight: "900",
  },
});
