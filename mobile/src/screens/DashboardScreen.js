import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ImageBackground,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { COLORS } from "../theme/colors";
import { useAuth } from "../context/AuthContext";

const campusImage = require("../../assets/images/collegeimg2.png");

const QUICK_LINKS = [
  {
    title: "My Registrations",
    description: "View your registered campus events",
    icon: "ticket-outline",
    screen: "MyRegistrations",
  },
  {
    title: "Saved Events",
    description: "Events you have bookmarked",
    icon: "bookmark-outline",
    screen: "Bookmarks",
  },
  {
    title: "Notifications",
    description: "Stay updated with campus activities",
    icon: "notifications-outline",
    screen: "Notifications",
  },
  {
    title: "Edit Profile",
    description: "Manage your personal information",
    icon: "person-circle-outline",
    screen: "EditProfile",
  },
];

function QuickLink({ item, onPress }) {
  return (
    <TouchableOpacity
      style={styles.quickCard}
      onPress={onPress}
      activeOpacity={0.8} 
    >
      <View style={styles.quickIcon}>
        <Ionicons name={item.icon} size={23} color={COLORS.primaryDark} />
      </View>

      <View style={styles.quickContent}>
        <Text style={styles.quickTitle}>{item.title}</Text>
        <Text style={styles.quickDescription}>{item.description}</Text>
      </View>

      <Ionicons name="chevron-forward" size={19} color={COLORS.primary} />
    </TouchableOpacity>
  );
}

function DashboardSection({ title, subtitle, children }) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeading}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {subtitle ? (
          <Text style={styles.sectionSubtitle}>{subtitle}</Text>
        ) : null}
      </View>
      {children}
    </View>
  );
}

export default function DashboardScreen({ navigation }) {
  const { user } = useAuth();

  const role = String(user?.category || user?.role || "Student").toLowerCase();

  const isAdmin = user?.isAdmin === true || role === "admin";
  const isOrganiser = role === "organiser" || isAdmin;

  const firstName = user?.name?.split(" ")[0] || "Student";

  const links = isAdmin
    ? [
        ...QUICK_LINKS,
        {
          title: "Manage Users",
          description: "Manage campus accounts and access",
          icon: "people-outline",
          screen: "AdminUsers",
        },
        {
          title: "Manage Events",
          description: "Review and manage all campus events",
          icon: "calendar-outline",
          screen: "AdminEvents",
        },
        {
          title: "Registrations",
          description: "Manage event registrations",
          icon: "clipboard-outline",
          screen: "AdminRegistrations",
        },
        {
          title: "Announcements",
          description: "Publish campus announcements",
          icon: "megaphone-outline",
          screen: "Announcements",
        },
        {
          title: "Analytics",
          description: "View platform performance",
          icon: "stats-chart-outline",
          screen: "AdminAnalytics",
        },
      ]
    : isOrganiser
      ? [
          ...QUICK_LINKS,
          {
            title: "Manage Events",
            description: "Create, edit and manage your events",
            icon: "calendar-outline",
            screen: "ManageEvents",
          },
        ]
      : QUICK_LINKS;

  const openScreen = (screen) => {
    navigation.navigate(screen);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>UNIVENTY CAMPUS CONNECT</Text>
            <Text style={styles.pageTitle}>Your Dashboard</Text>
          </View>

          <TouchableOpacity
            style={styles.avatar}
            onPress={() => openScreen("Profile")}
            activeOpacity={0.8}
          >
            {user?.profilePicture ? (
              <Image
                source={{ uri: user.profilePicture }}
                style={styles.avatarImage}
                resizeMode="cover"
              />
            ) : (
              <Text style={styles.avatarText}>
                {firstName.charAt(0).toUpperCase()}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* WELCOME CARD */}
        <View style={styles.welcomeCard}>
          <View style={styles.welcomeTop}>
            <View style={styles.welcomeTextContainer}>
              <Text style={styles.welcomeLabel}>WELCOME BACK</Text>
              <Text style={styles.welcomeTitle}>Hello, {firstName}</Text>
              <Text style={styles.welcomeDescription}>
                Your campus life, all in one place.
              </Text>
            </View>

            <View style={styles.welcomeDecoration}>
              <Ionicons name="school" size={31} color="#FFFFFF" />
            </View>
          </View>

          <View style={styles.roleBadge}>
            <Text style={styles.roleBadgeText}>
              {isAdmin
                ? "ADMIN ACCOUNT"
                : isOrganiser
                  ? "ORGANISER ACCOUNT"
                  : "STUDENT ACCOUNT"}
            </Text>
          </View>
        </View>

        {/* ORGANISER CREATE EVENT ACTION */}
        {isOrganiser && (
          <TouchableOpacity
            style={styles.createEventButton}
            onPress={() => navigation.navigate("ManageEvents")}
            activeOpacity={0.85}
          >
            <View style={styles.createEventIcon}>
              <Ionicons name="add-circle" size={30} color="#FFFFFF" />
            </View>

            <View style={styles.createEventContent}>
              <Text style={styles.createEventTitle}>Create New Event</Text>
              <Text style={styles.createEventDescription}>
                Publish a workshop, fest or campus activity
              </Text>
            </View>

            <Ionicons name="arrow-forward-circle" size={25} color="#FFFFFF" />
          </TouchableOpacity>
        )}

        {/* CAMPUS BANNER */}
        <ImageBackground
          source={campusImage}
          style={styles.campusBanner}
          imageStyle={styles.campusBannerImage}
        >
          <View style={styles.campusOverlay} />
          <Text style={styles.campusBannerTitle}>Be part of campus life</Text>
          <Text style={styles.campusBannerText}>
            Discover experiences beyond the classroom.
          </Text>
        </ImageBackground>

        {/* QUICK ACCESS */}
        <DashboardSection
          title="Quick Access"
          subtitle="Everything you need, just one tap away"
        >
          <View style={styles.quickGrid}>
            {links.map((item) => (
              <QuickLink
                key={item.screen}
                item={item}
                onPress={() => openScreen(item.screen)}
              />
            ))}
          </View>
        </DashboardSection>

        {/* EXPLORE CAMPUS */}
        <DashboardSection
          title="Explore Campus"
          subtitle="Find something happening around you"
        >
          <TouchableOpacity
            style={styles.exploreCard}
            onPress={() => navigation.navigate("Discover")}
            activeOpacity={0.85}
          >
            <View style={styles.exploreIcon}>
              <Ionicons
                name="compass-outline"
                size={25}
                color={COLORS.primaryDark}
              />
            </View>

            <View style={styles.exploreContent}>
              <Text style={styles.exploreTitle}>Discover Events</Text>
              <Text style={styles.exploreDescription}>
                Explore upcoming events, workshops and activities.
              </Text>
            </View>

            <Ionicons name="arrow-forward" size={19} color={COLORS.primary} />
          </TouchableOpacity>
        </DashboardSection>

        {/* FOOTER */}
        <View style={styles.footer}>
          <Text style={styles.footerBrand}>UNIVENTY</Text>
          <Text style={styles.footerText}>
            Your campus. Your events. Your community.
          </Text>
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
    backgroundColor: COLORS.background,
  },

  content: {
    paddingHorizontal: 20,
    paddingBottom: 35,
  },

  header: {
    paddingTop: 15,
    paddingBottom: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  eyebrow: {
    fontSize: 9,
    color: COLORS.primary,
    fontWeight: "800",
    letterSpacing: 1.5,
    marginBottom: 5,
  },

  pageTitle: {
    fontSize: 25,
    fontWeight: "900",
    color: COLORS.text,
  },

  avatar: {
    height: 45,
    width: 45,
    borderRadius: 16,
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
    borderRadius: 15,
  },

  avatarText: {
    fontSize: 19,
    fontWeight: "900",
    color: COLORS.primaryDark,
  },

  welcomeCard: {
    backgroundColor: COLORS.primaryDark,
    borderRadius: 19,
    padding: 19,
    marginBottom: 20,
  },

  welcomeTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  welcomeTextContainer: {
    flex: 1,
  },

  welcomeLabel: {
    color: "#DCE3CC",
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1.4,
  },

  welcomeTitle: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "900",
    marginTop: 8,
  },

  welcomeDescription: {
    color: "#E1E5D7",
    fontSize: 12,
    marginTop: 7,
  },

  welcomeDecoration: {
    height: 54,
    width: 54,
    borderRadius: 18,
    backgroundColor: "#6C7952",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 10,
  },

  roleBadge: {
    alignSelf: "flex-start",
    marginTop: 20,
    backgroundColor: "#68734A",
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 20,
  },

  roleBadgeText: {
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.8,
  },

  // CREATE EVENT BUTTON
  createEventButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    padding: 15,
    marginBottom: 24,
    flexDirection: "row",
    alignItems: "center",
    elevation: 3,
  },

  createEventIcon: {
    width: 47,
    height: 47,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.17)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 13,
  },

  createEventContent: {
    flex: 1,
  },

  createEventTitle: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "900",
  },

  createEventDescription: {
    color: "#F0F1E9",
    fontSize: 10,
    marginTop: 5,
  },

  campusBanner: {
    height: 112,
    borderRadius: 17,
    overflow: "hidden",
    justifyContent: "center",
    paddingHorizontal: 17,
    marginBottom: 25,
    backgroundColor: COLORS.primaryDark,
  },

  campusBannerImage: {
    borderRadius: 17,
  },

  campusOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(35,43,24,0.52)",
  },

  campusBannerTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "900",
  },

  campusBannerText: {
    color: "#F0F1E9",
    fontSize: 10,
    marginTop: 5,
  },

  section: {
    marginBottom: 27,
  },

  sectionHeading: {
    marginBottom: 14,
  },

  sectionTitle: {
    color: COLORS.text,
    fontSize: 19,
    fontWeight: "900",
  },

  sectionSubtitle: {
    color: COLORS.secondaryText,
    fontSize: 11,
    marginTop: 5,
  },

  quickGrid: {
    gap: 11,
  },

  quickCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    minHeight: 77,
  },

  quickIcon: {
    width: 43,
    height: 43,
    borderRadius: 13,
    backgroundColor: COLORS.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 13,
  },

  quickContent: {
    flex: 1,
  },

  quickTitle: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: "800",
  },

  quickDescription: {
    color: COLORS.secondaryText,
    fontSize: 10,
    marginTop: 5,
  },

  exploreCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
  },

  exploreIcon: {
    height: 44,
    width: 44,
    borderRadius: 14,
    backgroundColor: COLORS.primaryLight,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 13,
  },

  exploreContent: {
    flex: 1,
  },

  exploreTitle: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: "800",
  },

  exploreDescription: {
    color: COLORS.secondaryText,
    fontSize: 10,
    lineHeight: 16,
    marginTop: 5,
  },

  footer: {
    alignItems: "center",
    paddingTop: 10,
  },

  footerBrand: {
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
});
