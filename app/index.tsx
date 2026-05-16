import { useAuth } from "@/config/auth-context";
import { checkOnboardingCompleted } from "@/src/services/checkOnboarding";
import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";

export default function Index() {
  const { user, loading } = useAuth();
  const [checking, setChecking] = useState(true);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    const check = async () => {
      if (!user) {
        setChecking(false);
        return;
      }

      const result = await checkOnboardingCompleted(user.uid);
      setCompleted(result);
      setChecking(false);
    };

    if (!loading) {
      check();
    }
  }, [user, loading]);

  if (loading || checking) {
    return (
      <View style={{ flex: 1, justifyContent: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  if (!user) {
    return <Redirect href="/auth" />;
  }

  if (!completed) {
    return <Redirect href="/onboarding" />;
  }

  return <Redirect href="/(tabs)" />;
}
