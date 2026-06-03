import { useAuth } from "@/config/auth-context";
import { auth } from "@/config/firebase";
import { checkOnboardingCompleted } from "@/src/services/checkOnboarding";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  View,
} from "react-native";
import { Button, Text, TextInput, useTheme } from "react-native-paper";

const isValidEmail = (email: string) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const getFriendlyAuthError = (message: string) => {
  if (message.includes("auth/invalid-credential")) {
    return "Incorrect email or password. Please try again.";
  }

  if (message.includes("auth/user-not-found")) {
    return "No account found with this email.";
  }

  if (message.includes("auth/wrong-password")) {
    return "Incorrect password. Please try again.";
  }

  if (message.includes("auth/email-already-in-use")) {
    return "This email is already registered. Please sign in instead.";
  }

  if (message.includes("auth/too-many-requests")) {
    return "Too many attempts. Please wait a while and try again.";
  }

  return "Something went wrong. Please try again.";
};

export default function AuthScreen() {
  const [isSignUp, setIsSignUp] = useState<boolean>(false);
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string | null>("");

  const theme = useTheme();
  const router = useRouter();

  const { signIn, signUp, resetPassword } = useAuth();

  // It will handle both creating and signIn in to the account
  const handleAuth = async () => {
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    if (!isValidEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    setError(null);

    if (isSignUp) {
      const error = await signUp(email.trim(), password);
      if (error) {
        setError(getFriendlyAuthError(error));
        return;
      }
      Alert.alert(
        "Welcome to NeuroSync 🧠",
        "Your account is ready. Please sign in to continue.",
        [
          {
            text: "OK",
            onPress: () => {
              setIsSignUp(false);
              setPassword("");
              setError(null);
            },
          },
        ],
      );
      return;
    } else {
      const error = await signIn(email.trim(), password);
      if (error) {
        setError(getFriendlyAuthError(error));
        return;
      }

      const user = auth.currentUser;

      if (!user) return;

      const completed = await checkOnboardingCompleted(user.uid);

      if (completed) {
        router.replace("/(tabs)");
      } else {
        router.replace("/onboarding");
      }
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError("Please enter your email address first.");
      return;
    }

    if (!isValidEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    const error = await resetPassword(email.trim().toLowerCase());

    if (error) {
      setError(getFriendlyAuthError(error));
      return;
    }

    setError("Password reset email has been sent. Please check your inbox.");
  };

  const getPasswordChecks = (password: string) => {
    return {
      length: password.length >= 8,
      number: /\d/.test(password),
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      special: /[^A-Za-z0-9]/.test(password),
    };
  };

  const getPasswordStrength = (password: string) => {
    const checks = getPasswordChecks(password);
    const score = Object.values(checks).filter(Boolean).length;

    if (score <= 2)
      return { label: "Weak password", progress: "25%", color: "#ef4444" };
    if (score <= 4)
      return { label: "Medium password", progress: "60%", color: "#f59e0b" };
    return { label: "Strong password", progress: "100%", color: "#22c55e" };
  };

  const checks = getPasswordChecks(password);
  const strength = getPasswordStrength(password);

  const handleSwitchMode = () => {
    setIsSignUp((prev) => !prev);
    setEmail("");
    setPassword("");
    setError(null);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "android" ? "height" : "padding"}
      style={styles.container}
    >
      <View style={styles.content}>
        <Text style={styles.title} variant="headlineMedium">
          {isSignUp ? "Create Account" : "Welcome Back"}
        </Text>

        <TextInput
          label="Email"
          value={email}
          autoCapitalize="none"
          keyboardType="email-address"
          placeholder="example@gmail.com"
          mode="outlined"
          style={styles.input}
          onChangeText={(text) => setEmail(text.trim().toLowerCase())}
        />

        <TextInput
          label="Password"
          value={password}
          autoCapitalize="none"
          mode="outlined"
          secureTextEntry
          style={styles.input}
          onChangeText={setPassword}
        />

        {isSignUp && password.length > 0 && (
          <View style={styles.passwordBox}>
            <View style={styles.progressBackground}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: strength.progress as any,
                    backgroundColor: strength.color,
                  },
                ]}
              />
            </View>

            <Text style={styles.strengthText}>
              {strength.label}. Must contain:
            </Text>

            <Text style={[styles.checkText, checks.length && styles.validText]}>
              {checks.length ? "✓" : "×"} At least 8 characters
            </Text>
            <Text style={[styles.checkText, checks.number && styles.validText]}>
              {checks.number ? "✓" : "×"} At least 1 number
            </Text>
            <Text
              style={[styles.checkText, checks.lowercase && styles.validText]}
            >
              {checks.lowercase ? "✓" : "×"} At least 1 lowercase letter
            </Text>
            <Text
              style={[styles.checkText, checks.uppercase && styles.validText]}
            >
              {checks.uppercase ? "✓" : "×"} At least 1 uppercase letter
            </Text>
            <Text
              style={[styles.checkText, checks.special && styles.validText]}
            >
              {checks.special ? "✓" : "×"} At least 1 special character
            </Text>
          </View>
        )}

        {error && <Text style={{ color: theme.colors.error }}>{error}</Text>}

        <Button mode="contained" style={styles.button} onPress={handleAuth}>
          {isSignUp ? "Sign Up" : "Sign In"}
        </Button>

        {!isSignUp && (
          <Button mode="text" onPress={handleForgotPassword}>
            Forgot Password?
          </Button>
        )}

        <Button
          mode="text"
          onPress={handleSwitchMode}
          style={styles.switchModeButton}
        >
          {isSignUp
            ? "Already have an account? Sign In"
            : "Don't have an account? Sign Up"}
        </Button>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  content: {
    flex: 1,
    padding: 16,
    justifyContent: "center",
  },
  title: {
    textAlign: "center",
    marginBottom: 24,
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
  },
  switchModeButton: {
    marginTop: 16,
  },
  passwordBox: {
    marginTop: -8,
    marginBottom: 16,
  },
  progressBackground: {
    height: 4,
    backgroundColor: "#ddd",
    borderRadius: 10,
    marginBottom: 10,
  },
  progressFill: {
    height: 4,
    borderRadius: 10,
  },
  strengthText: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 6,
    color: "#555",
  },
  checkText: {
    fontSize: 13,
    color: "#888",
    marginBottom: 4,
  },
  validText: {
    color: "#22c55e",
  },
});
