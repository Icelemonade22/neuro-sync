// Import auth context, firebase auth, onboarding checker, navigation and UI components
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

// Checks email format before allowing Sign In or Sign Up
const isValidEmail = (email: string) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

// Turns firebase auth error codes to user friendly messages
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
  // Boolean to track & stores if users are in Sign Up mode or Sign In mode
  const [isSignUp, setIsSignUp] = useState<boolean>(false);

  // Stores user input values
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  // Stores validation or authentication error messages
  const [error, setError] = useState<string | null>("");

  const theme = useTheme();
  const router = useRouter();

  // Get authentication functions from the custom auth context
  const { signIn, signUp, resetPassword } = useAuth();

  // Handles both account registration and login based on the current
  // mode (Sign Up or Sign In)
  const handleAuth = async () => {
    // Basic validation checks before attempting authentication
    if (!email && !password) {
      setError("Please enter your email and password.");
      return;
    }

    if (!email) {
      setError("Please enter your email address.");
      return;
    }

    if (!password) {
      setError("Please enter your password.");
      return;
    }

    // Validate email format
    if (!isValidEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    // For Sign Up, enforce stronger password requirements and provide
    // feedback on password strength
    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    setError(null);

    // Attempt to sign up or sign in based on the current mode
    if (isSignUp) {
      const error = await signUp(email.trim(), password);
      if (error) {
        setError(getFriendlyAuthError(error));
        return;
      }

      // After successful sign up, show a welcome alert and switch to Sign In mode
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
      // For Sign In, check credentials and then determine if the
      // user needs to complete onboarding or can go straight to the main app
      const error = await signIn(email.trim(), password);
      if (error) {
        setError(getFriendlyAuthError(error));
        return;
      }

      // After successful sign in, check if onboarding is completed
      // and navigate accordingly
      const user = auth.currentUser;

      // This should never happen since signIn would have failed if
      // there was no user, but still check just in case
      if (!user) return;

      // Check if the user has completed onboarding and navigate to
      // the appropriate screen
      const completed = await checkOnboardingCompleted(user.uid);

      // If onboarding is completed, navigate to the main app; otherwise,
      // take the user to the onboarding flow
      if (completed) {
        router.replace("/(tabs)");
      } else {
        router.replace("/onboarding");
      }
    }
  };

  // Handles the "Forgot Password" flow by validating the email and sending
  // a password reset email if valid
  const handleForgotPassword = async () => {
    if (!email) {
      setError("Please enter your email address first.");
      return;
    }

    // Validate email format before attempting to send reset email
    if (!isValidEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    // Attempt to send password reset email and handle any errors that may occur
    const error = await resetPassword(email.trim().toLowerCase());

    // If there's an error (like user not found), show a friendly message;
    // otherwise, confirm that the reset email has been sent
    if (error) {
      setError(getFriendlyAuthError(error));
      return;
    }

    // Clear any previous errors and inform the user that the password
    // reset email has been sent
    setError("Password reset email has been sent. Please check your inbox.");
  };

  // Helper functions to evaluate password strength and provide feedback on
  // which criteria are met
  const getPasswordChecks = (password: string) => {
    return {
      length: password.length >= 8,
      number: /\d/.test(password),
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      special: /[^A-Za-z0-9]/.test(password),
    };
  };

  // Based on the number of criteria met, determine the overall password
  // strength and return a label, progress percentage, and color for visual feedback
  const getPasswordStrength = (password: string) => {
    const checks = getPasswordChecks(password);
    const score = Object.values(checks).filter(Boolean).length;

    if (score <= 2)
      return { label: "Weak password", progress: "25%", color: "#ef4444" };
    if (score <= 4)
      return { label: "Medium password", progress: "60%", color: "#f59e0b" };
    return { label: "Strong password", progress: "100%", color: "#22c55e" };
  };

  // Get the current password checks and strength to provide real-time feedback
  // as the user types their password
  const checks = getPasswordChecks(password);
  const strength = getPasswordStrength(password);

  // Toggles between Sign Up and Sign In modes, and resets the form fields and
  // error messages when switching
  const handleSwitchMode = () => {
    setIsSignUp((prev) => !prev);
    setEmail("");
    setPassword("");
    setError(null);
  };

  return (
    <KeyboardAvoidingView
      // Use "height" behavior for Android to avoid issues with certain keyboard
      // types, and "padding" for iOS to ensure the content is pushed up correctly
      behavior={Platform.OS === "android" ? "height" : "padding"}
      style={styles.container}
    >
      <View style={styles.content}>
        {/* Display the appropriate title based on whether the user is signing up or signing in */}
        <Text style={styles.title} variant="headlineMedium">
          {isSignUp ? "Create Account" : "Welcome Back"}
        </Text>
        {/* Email input field with appropriate keyboard and auto-capitalization
        settings for better user experience */}
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
        {/* Password input field with secure text entry and real-time feedback on
        password strength when in Sign Up mode */}
        <TextInput
          label="Password"
          value={password}
          autoCapitalize="none"
          mode="outlined"
          secureTextEntry
          style={styles.input}
          onChangeText={setPassword}
        />
        {/* When in Sign Up mode, show the password strength meter and criteria
        checklist to guide users in creating a strong password */}
        {isSignUp && password.length > 0 && (
          <View style={styles.passwordBox}>
            {/* Visual strength meter that fills based on the calculated password
            strength, with color coding for weak, medium, and strong passwords */}
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
            {/* Checklist of password criteria with checkmarks for met criteria
            and crosses for unmet criteria, providing clear feedback to the user
            on how to improve their password */}
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
        {/* Display any validation or authentication error messages in a
        user-friendly way, using the theme's error color for visibility */}
        {error && <Text style={{ color: theme.colors.error }}>{error}</Text>}
        {/* Primary button to trigger the authentication process, with the label
        changing based on the current mode (Sign Up or Sign In) */}
        <Button mode="contained" style={styles.button} onPress={handleAuth}>
          {isSignUp ? "Sign Up" : "Sign In"}
        </Button>
        {/* When in Sign In mode, show a "Forgot Password?" button that allows
        users to initiate the password reset process if users can't remember
        password */}
        {!isSignUp && (
          <Button mode="text" onPress={handleForgotPassword}>
            Forgot Password?
          </Button>
        )}
        {/* Button to toggle between Sign Up and Sign In modes, with the label
        providing a clear call to action for users who need to switch modes */}
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

// Styles for the authentication screen, including layout, spacing, and visual feedback for password strength and error messages
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
