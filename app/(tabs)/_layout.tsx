import AntDesign from "@expo/vector-icons/AntDesign";
import Entypo from "@expo/vector-icons/Entypo";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Tabs } from "expo-router";

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: "coral" }}>
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) => {
            return focused ? (
              <FontAwesome name="home" size={24} color={color} />
            ) : (
              <Ionicons name="home-outline" size={24} color="black" />
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
              <AntDesign name="clock-circle" size={24} color="black" />
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
              <Entypo name="bar-graph" size={24} color="black" />
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
              <FontAwesome5 name="user-friends" size={24} color="black" />
            );
          },
        }}
      />
      <Tabs.Screen name="login" options={{ title: "Login" }} />
    </Tabs>
  );
}
