import {
 FontAwesome5,
 Ionicons,
 MaterialCommunityIcons,
} from "@expo/vector-icons";
import { Tabs } from "expo-router";

export default function TabsLayout() {
 return (
  <Tabs
   screenOptions={{
    headerShown: false,
    tabBarActiveTintColor: "#00b4d8",
    tabBarInactiveTintColor: "#999",
    tabBarStyle: {
     backgroundColor: "#FFFFFF",
     borderTopWidth: 0,
     elevation: 10,
     shadowColor: "#000",
     shadowOffset: {width: 0, height: -2},
     shadowOpacity: 0.1,
     shadowRadius: 4,
     height: 90,
     paddingBottom: 8,
     paddingTop: 8,
    },
    tabBarLabelStyle: {
     fontSize: 11,
     fontWeight: "600",
    },
   }}
  >
   <Tabs.Screen
    name="home"
    options={{
     tabBarLabel: "Home",
     tabBarIcon: ({color, size}) => (
      <Ionicons name="home-outline" size={size} color={color} />
     ),
    }}
   />
   <Tabs.Screen
    name="history"
    options={{
     tabBarLabel: "History",
     tabBarIcon: ({color, size}) => (
      <MaterialCommunityIcons name="history" size={size} color={color} />
     ),
    }}
   />
   <Tabs.Screen
    name="notifications"
    options={{
     tabBarLabel: "Alerts",
     tabBarIcon: ({color, size}) => (
      <Ionicons name="notifications-outline" size={size} color={color} />
     ),
    }}
   />
   <Tabs.Screen
    name="profile"
    options={{
     tabBarLabel: "Profile",
     tabBarIcon: ({color, size}) => (
      <FontAwesome5 name="user" size={size} color={color} />
     ),
    }}
   />
  </Tabs>
 );
}
