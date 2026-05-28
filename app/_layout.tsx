import { AuthProvider } from "@/config/auth-context";
import { Stack } from "expo-router";
import { PaperProvider } from "react-native-paper";

export default function RootLayout() {
  return (
    <PaperProvider>
      <AuthProvider>
        <Stack>
          <Stack.Screen name="auth" options={{ headerShown: false }} />
          <Stack.Screen name="onboarding" options={{ headerShown: false }} />
          <Stack.Screen name="editProfile" options={{ headerShown: false }} />
          <Stack.Screen name="leaderboard" options={{ headerShown: false }} />
          <Stack.Screen name="assistant" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="uploadNote" options={{ headerShown: false }} />

          <Stack.Screen name="room/[id]" options={{ title: "Study Room" }} />
          <Stack.Screen name="quiz" options={{ headerShown: false }} />
          <Stack.Screen name="dailyMissions" options={{ headerShown: false }} />

          <Stack.Screen name="admin/index" options={{ headerShown: false }} />
          <Stack.Screen name="admin/users" options={{ headerShown: false }} />
          <Stack.Screen name="admin/notes" options={{ headerShown: false }} />
          <Stack.Screen name="admin/rooms" options={{ headerShown: false }} />

          <Stack.Screen
            name="room/[id]/session"
            options={{ title: "Shared Session" }}
          />
        </Stack>
      </AuthProvider>
    </PaperProvider>
  );
}
