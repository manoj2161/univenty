import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  StatusBar,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../context/AuthContext";
import { COLORS } from "../theme/colors";

const INITIAL_FORM = {
  name: "",
  email: "",
  password: "",
  category: "Student",
  department: "",
  rollNumber: "",
  phone: "",
};

export default function RegisterScreen({ navigation }) {
  const { register } = useAuth();

  const [form, setForm] = useState(INITIAL_FORM);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const updateField = (field, value) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const handleRegister = async () => {
    setError("");
    setSuccess("");

    if (
      !form.name.trim() ||
      !form.email.trim() ||
      !form.password ||
      !form.department.trim() ||
      !form.rollNumber.trim() ||
      !form.phone.trim()
    ) {
      setError("Please complete all fields.");
      return;
    }

    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }

    if (form.password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    if (!/^[0-9+()\-\s]{7,15}$/.test(form.phone.trim())) {
      setError("Please enter a valid phone number.");
      return;
    }

    try {
      setLoading(true);

      await register({
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        category: form.category,
        department: form.department.trim(),
        rollNumber: form.rollNumber.trim(),
        phone: form.phone.trim(),
      });

      setSuccess("Your account has been created. Please sign in.");

      setTimeout(() => {
        navigation.navigate("Login");
      }, 1200);
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const renderInput = (label, field, placeholder, options = {}) => (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor="#96978E"
        value={form[field]}
        onChangeText={(value) => updateField(field, value)}
        editable={!loading}
        autoCapitalize={options.autoCapitalize || "sentences"}
        keyboardType={options.keyboardType || "default"}
        autoCorrect={options.autoCorrect ?? true}
        secureTextEntry={options.secureTextEntry || false}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Text style={styles.backArrow}>‹</Text>
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Create account</Text>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.container}>
            <View style={styles.brand}>
              <Image source={require("../../assets/images/univenty-logo.png")} style={styles.brandLogo} resizeMode="contain" />
              <Text style={styles.brandName}>UNIVENTY</Text>
              <Text style={styles.tagline}>
                Your campus. Your events. Your community.
              </Text>
            </View>

            <View style={styles.formSection}>
              <Text style={styles.heading}>Create Account</Text>
              <Text style={styles.subtitle}>Join your campus community.</Text>

              {error ? (
                <View style={styles.errorBox}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}

              {success ? (
                <View style={styles.successBox}>
                  <Text style={styles.successText}>{success}</Text>
                </View>
              ) : null}

              <Text style={styles.label}>ACCOUNT TYPE</Text>

              <View style={styles.categoryRow}>
                {["Student", "Organiser"].map((category) => {
                  const selected = form.category === category;

                  return (
                    <TouchableOpacity
                      key={category}
                      style={[
                        styles.categoryButton,
                        selected && styles.categorySelected,
                      ]}
                      onPress={() => updateField("category", category)}
                      disabled={loading}
                    >
                      <Text
                        style={[
                          styles.categoryText,
                          selected && styles.categoryTextSelected,
                        ]}
                      >
                        {category}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {renderInput("FULL NAME", "name", "Enter your full name")}

              {renderInput(
                "EMAIL ADDRESS",
                "email",
                "Enter your email address",
                {
                  keyboardType: "email-address",
                  autoCapitalize: "none",
                  autoCorrect: false,
                },
              )}

              <View style={styles.inputGroup}>
                <Text style={styles.label}>PASSWORD</Text>

                <View style={styles.passwordContainer}>
                  <TextInput
                    style={styles.passwordInput}
                    placeholder="Create a password"
                    placeholderTextColor="#96978E"
                    value={form.password}
                    onChangeText={(value) => updateField("password", value)}
                    secureTextEntry={!showPassword}
                    editable={!loading}
                    autoCapitalize="none"
                  />

                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.showButton}
                  >
                    <Text style={styles.showText}>
                      {showPassword ? "HIDE" : "SHOW"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {renderInput("DEPARTMENT", "department", "Enter your department")}

              {renderInput(
                "ROLL NUMBER",
                "rollNumber",
                "Enter your roll number",
                { autoCapitalize: "characters" },
              )}

              {renderInput("PHONE NUMBER", "phone", "Enter your phone number", {
                keyboardType: "phone-pad",
              })}

              <TouchableOpacity
                style={[styles.primaryButton, loading && styles.disabledButton]}
                onPress={handleRegister}
                disabled={loading}
                activeOpacity={0.85}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.primaryButtonText}>Create Account</Text>
                )}
              </TouchableOpacity>

              <View style={styles.loginRow}>
                <Text style={styles.loginText}>Already registered?</Text>

                <TouchableOpacity
                  onPress={() => navigation.navigate("Login")}
                  disabled={loading}
                >
                  <Text style={styles.loginLink}>Sign in</Text>
                </TouchableOpacity>
              </View>
            </View>

            <Text style={styles.footer}>UNIVENTY • CAMPUS CONNECT</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    height: 54,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    width: 40,
    height: 44,
    justifyContent: "center",
  },
  backArrow: {
    color: COLORS.text,
    fontSize: 34,
    lineHeight: 38,
  },
  headerTitle: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: "700",
    marginLeft: 8,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 25,
  },
  container: {
    width: "100%",
    maxWidth: 520,
    alignSelf: "center",
    paddingHorizontal: 22,
    paddingTop: 28,
  },
  brand: {
    alignItems: "center",
    marginBottom: 32,
  },
  brandLogo: { width: 55, height: 55, marginBottom: 9 },
  logoMark: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  logoLetter: {
    color: "#FFFFFF",
    fontSize: 26,
    fontWeight: "800",
  },
  brandName: {
    color: COLORS.text,
    fontSize: 24,
    fontWeight: "800",
    letterSpacing: 2.3,
  },
  tagline: {
    color: COLORS.secondaryText,
    fontSize: 11,
    marginTop: 6,
    textAlign: "center",
  },
  formSection: {
    width: "100%",
  },
  heading: {
    color: COLORS.text,
    fontSize: 25,
    fontWeight: "700",
    marginBottom: 6,
  },
  subtitle: {
    color: COLORS.secondaryText,
    fontSize: 13,
    marginBottom: 24,
  },
  label: {
    color: COLORS.text,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  categoryRow: {
    flexDirection: "row",
    marginBottom: 20,
    gap: 12,
  },
  categoryButton: {
    flex: 1,
    height: 46,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.surface,
  },
  categorySelected: {
    backgroundColor: COLORS.primaryLight,
    borderColor: COLORS.primary,
    borderWidth: 1.5,
  },
  categoryText: {
    color: COLORS.secondaryText,
    fontSize: 13,
    fontWeight: "600",
  },
  categoryTextSelected: {
    color: COLORS.primaryDark,
    fontWeight: "800",
  },
  inputGroup: {
    marginBottom: 18,
  },
  input: {
    height: 51,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 11,
    backgroundColor: COLORS.surface,
    paddingHorizontal: 15,
    fontSize: 13,
    color: COLORS.text,
  },
  passwordContainer: {
    height: 51,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 11,
    backgroundColor: COLORS.surface,
  },
  passwordInput: {
    flex: 1,
    height: "100%",
    paddingHorizontal: 15,
    fontSize: 13,
    color: COLORS.text,
  },
  showButton: {
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  showText: {
    color: COLORS.primary,
    fontSize: 10,
    fontWeight: "800",
  },
  primaryButton: {
    height: 52,
    backgroundColor: COLORS.primary,
    borderRadius: 11,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
    elevation: 2,
  },
  disabledButton: {
    opacity: 0.65,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },
  loginRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
  },
  loginText: {
    color: COLORS.secondaryText,
    fontSize: 12,
    marginRight: 5,
  },
  loginLink: {
    color: COLORS.primaryDark,
    fontSize: 12,
    fontWeight: "800",
  },
  errorBox: {
    backgroundColor: "#FCEBE9",
    borderRadius: 10,
    padding: 12,
    marginBottom: 18,
  },
  errorText: {
    color: COLORS.danger,
    fontSize: 12,
  },
  successBox: {
    backgroundColor: "#E8F2E5",
    borderRadius: 10,
    padding: 12,
    marginBottom: 18,
  },
  successText: {
    color: COLORS.success,
    fontSize: 12,
  },
  footer: {
    textAlign: "center",
    color: COLORS.secondaryText,
    fontSize: 10,
    letterSpacing: 1.2,
    marginTop: 30,
    marginBottom: 10,
  },
});
