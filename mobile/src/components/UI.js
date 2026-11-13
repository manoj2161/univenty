
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";

import { COLORS as colors } from "../theme/colors";
export function Screen({ children, style }) {
  return <View style={[styles.screen, style]}>{children}</View>;
}

export function Heading({ children, subtitle }) {
  return (
    <View style={styles.headingContainer}>
      <Text style={styles.heading}>{children}</Text>

      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

export function Button({
  title,
  onPress,
  secondary,
  danger,
  loading,
  disabled,
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.button,
        secondary && styles.secondaryButton,
        danger && styles.dangerButton,
        (disabled || loading) && { opacity: 0.5 },
      ]}
    >
      {loading ? (
        <ActivityIndicator color={secondary ? colors.primary : colors.white} />
      ) : (
        <Text
          style={[styles.buttonText, secondary && { color: colors.primary }]}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

export function Field({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  keyboardType,
  multiline,
}) {
  return (
    <View style={styles.fieldContainer}>
      <Text style={styles.label}>{label}</Text>

      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder || label}
        placeholderTextColor={colors.secondaryText}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        multiline={multiline}
        style={[
          styles.input,
          multiline && {
            height: 100,
            textAlignVertical: "top",
          },
        ]}
      />
    </View>
  );
}

export function Card({ children, style }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function ErrorText({ children }) {
  if (!children) return null;

  return <Text style={styles.error}>{children}</Text>;
}

export function Empty({ text }) {
  return (
    <Card>
      <Text style={styles.empty}>{text || "Nothing to show yet."}</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 18,
  },

  headingContainer: {
    marginBottom: 18,
  },

  heading: {
    fontSize: 25,
    fontWeight: "800",
    color: colors.text,
  },

  subtitle: {
    fontSize: 13,
    color: colors.secondaryText,
    marginTop: 5,
  },

  button: {
    backgroundColor: colors.primary,
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },

  secondaryButton: {
    backgroundColor: colors.primaryLight,
    borderWidth: 1,
    borderColor: colors.border,
  },

  dangerButton: {
    backgroundColor: colors.danger,
  },

  buttonText: {
    color: colors.white,
    fontWeight: "800",
    fontSize: 14,
  },

  fieldContainer: {
    marginBottom: 14,
  },

  label: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 7,
  },

  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 11,
    padding: 13,
    color: colors.text,
    fontSize: 14,
  },

  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 15,
    marginBottom: 13,
  },

  error: {
    color: colors.danger,
    fontSize: 13,
    marginVertical: 8,
  },

  empty: {
    color: colors.secondaryText,
    textAlign: "center",
    padding: 12,
  },
});
