import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  StatusBar,
  Image,
  ActivityIndicator,
  ActionSheetIOS,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";

import { COLORS } from "../theme/colors";
import { useAuth } from "../context/AuthContext";
import api from "../api/api";

export default function ProfileScreen({ navigation }) {
  const { user, logout, refreshUser } = useAuth();
  const [uploading, setUploading] = useState(false);

  const role = String(user?.category || user?.role || "Student").toLowerCase();

  const accountType =
    user?.isAdmin || role === "admin"
      ? "Administrator"
      : role === "organiser"
        ? "Event Organiser"
        : "Student";

  const initials = (user?.name || "U")
    .split(" ")
    .map((part) => part.charAt(0))
    .join("")
    .substring(0, 2)
    .toUpperCase();

  const uploadImage = async (asset) => {
    try {
      setUploading(true);

      const formData = new FormData();

      formData.append("profilePicture", {
        uri: asset.uri,
        name: asset.fileName || `profile-${Date.now()}.jpg`,
        type: asset.mimeType || "image/jpeg",
      });

      await api.put("/profile/picture", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        timeout: 60000,
      });

      await refreshUser();

      Alert.alert("Success", "Profile picture updated successfully.");
    } catch (error) {
      Alert.alert(
        "Upload failed",
        error.message || "Unable to upload your profile picture.",
      );
    } finally {
      setUploading(false);
    }
  };

  const selectFromGallery = async () => {
    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          "Permission required",
          "Please allow gallery access to select a profile picture.",
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets?.length) {
        await uploadImage(result.assets[0]);
      }
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  const takePhoto = async () => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          "Permission required",
          "Please allow camera access to take a profile picture.",
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets?.length) {
        await uploadImage(result.assets[0]);
      }
    } catch (error) {
      Alert.alert("Camera error", error.message);
    }
  };

  const removePicture = () => {
    Alert.alert(
      "Remove profile picture",
      "Are you sure you want to remove your current profile picture?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            try {
              setUploading(true);
              await api.delete("/profile/picture");
              await refreshUser();

              Alert.alert("Success", "Profile picture removed.");
            } catch (error) {
              Alert.alert("Error", error.message);
            } finally {
              setUploading(false);
            }
          },
        },
      ],
    );
  };

  const showPictureOptions = () => {
    if (uploading) return;

    const options = [
      "Take Photo",
      "Choose from Gallery",
      ...(user?.profilePicture ? ["Remove Profile Picture"] : []),
      "Cancel",
    ];

    const cancelButtonIndex = options.length - 1;
    const destructiveButtonIndex = user?.profilePicture ? 2 : undefined;

    const handleSelection = (index) => {
      if (index === 0) takePhoto();
      if (index === 1) selectFromGallery();
      if (user?.profilePicture && index === 2) removePicture();
    };

    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options,
          cancelButtonIndex,
          destructiveButtonIndex,
        },
        handleSelection,
      );
    } else {
      Alert.alert("Profile Picture", "Choose an option", [
        { text: "Take Photo", onPress: takePhoto },
        { text: "Choose from Gallery", onPress: selectFromGallery },
        ...(user?.profilePicture
          ? [
              {
                text: "Remove Picture",
                style: "destructive",
                onPress: removePicture,
              },
            ]
          : []),
        { text: "Cancel", style: "cancel" },
      ]);
    }
  };

  const confirmLogout = () => {
    Alert.alert("Log out", "Are you sure you want to log out of UNIVENTY?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log Out",
        style: "destructive",
        onPress: async () => {
          await logout();
        },
      },
    ]);
  };

  const ProfileDetail = ({ label, value }) => (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value || "Not provided"}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.eyebrow}>UNIVENTY ACCOUNT</Text>
          <Text style={styles.title}>My Profile</Text>
          <Text style={styles.subtitle}>
            Manage your personal information and account.
          </Text>
        </View>

        <View style={styles.profileCard}>
          <View style={styles.identity}>
            <TouchableOpacity
              style={styles.avatarContainer}
              onPress={showPictureOptions}
              activeOpacity={0.8}
              disabled={uploading}
            >
              {user?.profilePicture ? (
                <Image
                  source={{ uri: user.profilePicture }}
                  style={styles.avatarImage}
                />
              ) : (
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{initials}</Text>
                </View>
              )}

              <View style={styles.editPictureBadge}>
                <Ionicons name="camera" size={13} color="#FFFFFF" />
              </View>

              {uploading && (
                <View style={styles.uploadOverlay}>
                  <ActivityIndicator color="#FFFFFF" size="small" />
                </View>
              )}
            </TouchableOpacity>

            <View style={styles.identityInfo}>
              <Text style={styles.name}>{user?.name || "UNIVENTY User"}</Text>
              <Text style={styles.email}>
                {user?.email || "No email available"}
              </Text>

              <View style={styles.roleBadge}>
                <Text style={styles.roleText}>{accountType}</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={styles.changePictureButton}
            onPress={showPictureOptions}
            disabled={uploading}
          >
            <Ionicons
              name="camera-outline"
              size={15}
              color={COLORS.primaryDark}
              style={styles.buttonIcon}
            />
            <Text style={styles.changePictureText}>
              {uploading ? "Uploading..." : "Change Profile Picture"}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          <Text style={styles.sectionSubtitle}>
            Your registered account details.
          </Text>

          <View style={styles.detailsCard}>
            <ProfileDetail label="Full Name" value={user?.name} />
            <View style={styles.divider} />
            <ProfileDetail label="Email Address" value={user?.email} />
            <View style={styles.divider} />
            <ProfileDetail label="Account Type" value={accountType} />
            <View style={styles.divider} />
            <ProfileDetail label="Department" value={user?.department} />
            <View style={styles.divider} />
            <ProfileDetail label="Roll Number" value={user?.rollNumber} />
            <View style={styles.divider} />
            <ProfileDetail label="Phone Number" value={user?.phone} />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Settings</Text>
          <Text style={styles.sectionSubtitle}>
            Update your account information.
          </Text>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate("EditProfile")}
            activeOpacity={0.8}
          >
            <View style={styles.actionIcon}>
              <Ionicons
                name="create-outline"
                size={23}
                color={COLORS.primaryDark}
              />
            </View>

            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Edit Profile</Text>
              <Text style={styles.actionDescription}>
                Update your name, phone and other details.
              </Text>
            </View>

            <Ionicons name="chevron-forward" size={20} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={confirmLogout}
          activeOpacity={0.85}
        >
          <Ionicons
            name="log-out-outline"
            size={18}
            color="#FFFFFF"
            style={styles.logoutIcon}
          />
          <Text style={styles.logoutText}>LOG OUT</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerLogo}>UNIVENTY</Text>
          <Text style={styles.footerText}>
            Your campus. Your events. Your community.
          </Text>
          <Text style={styles.version}>CAMPUS CONNECT</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 35,
  },
  header: {
    paddingTop: 18,
    paddingBottom: 22,
  },
  eyebrow: {
    color: COLORS.primary,
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1.6,
    marginBottom: 6,
  },
  title: {
    color: COLORS.text,
    fontSize: 26,
    fontWeight: "900",
  },
  subtitle: {
    color: COLORS.secondaryText,
    fontSize: 12,
    marginTop: 7,
  },
  profileCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 18,
  },
  identity: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarContainer: {
    width: 65,
    height: 65,
    marginRight: 15,
    position: "relative",
  },
  avatarImage: {
    width: 65,
    height: 65,
    borderRadius: 21,
  },
  avatar: {
    width: 65,
    height: 65,
    borderRadius: 21,
    backgroundColor: COLORS.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: COLORS.primaryDark,
    fontSize: 22,
    fontWeight: "900",
  },
  editPictureBadge: {
    position: "absolute",
    right: -5,
    bottom: -5,
    width: 25,
    height: 25,
    borderRadius: 13,
    backgroundColor: COLORS.primaryDark,
    borderWidth: 2,
    borderColor: COLORS.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  uploadOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.55)",
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
  },
  identityInfo: {
    flex: 1,
  },
  name: {
    color: COLORS.text,
    fontSize: 19,
    fontWeight: "900",
  },
  email: {
    color: COLORS.secondaryText,
    fontSize: 12,
    marginTop: 5,
  },
  roleBadge: {
    alignSelf: "flex-start",
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    marginTop: 9,
  },
  roleText: {
    color: COLORS.primaryDark,
    fontSize: 10,
    fontWeight: "800",
  },
  changePictureButton: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    marginTop: 17,
    paddingVertical: 9,
    paddingHorizontal: 13,
    borderRadius: 9,
    backgroundColor: COLORS.primaryLight,
  },
  buttonIcon: {
    marginRight: 7,
  },
  changePictureText: {
    color: COLORS.primaryDark,
    fontSize: 11,
    fontWeight: "800",
  },
  section: {
    marginTop: 27,
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: 17,
    fontWeight: "900",
  },
  sectionSubtitle: {
    color: COLORS.secondaryText,
    fontSize: 11,
    marginTop: 5,
    marginBottom: 13,
  },
  detailsCard: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    paddingHorizontal: 16,
  },
  detailRow: {
    paddingVertical: 14,
  },
  detailLabel: {
    color: COLORS.secondaryText,
    fontSize: 10,
    fontWeight: "600",
  },
  detailValue: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: "700",
    marginTop: 5,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
  },
  actionCard: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 15,
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
  },
  actionIcon: {
    width: 43,
    height: 43,
    borderRadius: 13,
    backgroundColor: COLORS.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 13,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: "800",
  },
  actionDescription: {
    color: COLORS.secondaryText,
    fontSize: 10,
    marginTop: 5,
  },
  logoutButton: {
    height: 52,
    backgroundColor: COLORS.primaryDark,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 30,
  },
  logoutIcon: {
    marginRight: 9,
  },
  logoutText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 0.7,
  },
  footer: {
    alignItems: "center",
    paddingTop: 30,
  },
  footerLogo: {
    color: COLORS.primaryDark,
    fontSize: 13,
    fontWeight: "900",
    letterSpacing: 2,
  },
  footerText: {
    color: COLORS.secondaryText,
    fontSize: 10,
    marginTop: 6,
  },
  version: {
    color: COLORS.secondaryText,
    fontSize: 8,
    letterSpacing: 1.5,
    marginTop: 12,
  },
});
