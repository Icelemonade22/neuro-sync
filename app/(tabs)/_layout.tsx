import AntDesign from "@expo/vector-icons/AntDesign";
import Entypo from "@expo/vector-icons/Entypo";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Tabs } from "expo-router";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#8B5CF6",
        tabBarInactiveTintColor: "#9CA3AF",
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "700",
          marginBottom: 6,
        },
        tabBarStyle: {
          position: "absolute",
          left: 18,
          right: 18,
          bottom: 80,
          height: 76,
          borderRadius: 30,
          backgroundColor: "#FFFFFF",
          borderTopWidth: 0,
          elevation: 20,
          zIndex: 999,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.15,
          shadowRadius: 12,
          paddingTop: 8,
          paddingBottom: 8,
        },
        tabBarItemStyle: {
          height: 60,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) => {
            return focused ? (
              <FontAwesome name="home" size={24} color={color} />
            ) : (
              <Ionicons name="home-outline" size={24} color={color} />
            );
          },
        }}
      />
      <Tabs.Screen
        name="session"
        options={{
          title: "Session",
          tabBarIcon: ({ color, focused }) => {
            return focused ? (
              <AntDesign name="clock-circle" size={24} color={color} />
            ) : (
              <AntDesign name="clock-circle" size={24} color={color} />
            );
          },
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: "Progress",
          tabBarIcon: ({ color, focused }) => {
            return focused ? (
              <Entypo name="bar-graph" size={24} color={color} />
            ) : (
              <Entypo name="bar-graph" size={24} color={color} />
            );
          },
        }}
      />
      <Tabs.Screen
        name="buddies"
        options={{
          title: "Buddies",
          tabBarIcon: ({ color, focused }) => {
            return focused ? (
              <FontAwesome5 name="user-friends" size={24} color={color} />
            ) : (
              <FontAwesome5 name="user-friends" size={24} color={color} />
            );
          },
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, focused }) => {
            return focused ? (
              <Ionicons name="person-circle-outline" size={24} color={color} />
            ) : (
              <Ionicons name="person-circle-outline" size={24} color={color} />
            );
          },
        }}
      />
      <Tabs.Screen
        name="requests"
        options={{
          href: null,
        }}
      />

      <Tabs.Screen
        name="rooms"
        options={{
          href: null,
        }}
      />

      <Tabs.Screen
        name="notes"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
