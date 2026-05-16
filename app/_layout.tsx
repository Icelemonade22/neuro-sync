// import { Stack, useRouter } from "expo-router";
// import { useEffect } from "react";

// function RouteGuard({ children }: { children: React.ReactNode }) {
//   const router = useRouter();
//   const isAuth = false;

//   useEffect(() => {
//     if (!isAuth) {
//       router.replace("/auth");
//     }
//   });
//   return <>{children}</>;
// }

// export default function RootLayout() {
//   return (
//     <RouteGuard>
//       <Stack>
//         <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
//       </Stack>
//     </RouteGuard>
//   );
// }

import { AuthProvider } from "@/config/auth-context";
import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack>
        {/* <Stack.Screen name="index" options={{ headerShown: false }} /> */}
        <Stack.Screen name="auth" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </AuthProvider>
  );
}
