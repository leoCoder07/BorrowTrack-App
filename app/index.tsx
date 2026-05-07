import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
 Dimensions,
 ImageBackground,
 StatusBar,
 StyleSheet,
 Text,
 TouchableOpacity,
 View,
} from "react-native";

const {width, height} = Dimensions.get("window");

export default function WelcomeScreen() {
 const router = useRouter();

 return (
  <View style={styles.container}>
   <StatusBar barStyle="light-content" />

   <ImageBackground
    source={require("../assets/images/school-bag.jpg")}
    style={styles.backgroundImage}
    resizeMode="cover"
   >
    {}
    <View style={styles.overlay}>
     {}
     <View style={styles.titleContainer}>
      <MaterialCommunityIcons
       name="bag-personal"
       size={36}
       color="#FFFFFF"
       style={styles.logo}
      />
      <Text style={styles.titleText}>BorrowTrack</Text>
     </View>

     {}

     <View style={styles.tagLineAndButton}>
      <Text style={styles.taglineText}>
       Track and organize your borrowed items easily.
      </Text>
      <TouchableOpacity
       style={styles.getStartedButton}
       onPress={() => router.push("/auth" as any)}
       activeOpacity={0.8}
      >
       <Text style={styles.buttonText}>Get Started</Text>
       <Ionicons
        name="arrow-forward"
        size={20}
        color="#FFFFFF"
        style={styles.buttonIcon}
       />
      </TouchableOpacity>
     </View>
    </View>
   </ImageBackground>
  </View>
 );
}

const styles = StyleSheet.create({
 container: {
  flex: 1,
 },
 backgroundImage: {
  flex: 1,
  width: "100%",
  height: "100%",
 },
 overlay: {
  flex: 1,
  backgroundColor: "rgba(10, 42, 62, 0.62)",
  paddingHorizontal: 30,
  justifyContent: "space-between",
  paddingVertical: 100,
 },
 titleContainer: {
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  marginBottom: 20,
  gap: 10,
 },
 logo: {
  fontSize: 58,
  backgroundColor: "#00b4d8",
  padding: 20,
  borderRadius: 15,
 },
 titleText: {
  fontSize: 42,
  fontWeight: "bold",
  color: "#FFFFFF",
  letterSpacing: 1,
 },
 taglineText: {
  fontSize: 18,
  color: "#FFFFFF",
  maxWidth: 270,
  alignSelf: "center",
  textAlign: "center",
  lineHeight: 26,
  marginBottom: 40,
  opacity: 0.9,
 },
 tagLineAndButton: {},
 getStartedButton: {
  backgroundColor: "#00b4d8",
  paddingVertical: 18,
  paddingHorizontal: 40,
  borderRadius: 30,
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  shadowColor: "#000",
  shadowOffset: {
   width: 0,
   height: 4,
  },
  shadowOpacity: 0.3,
  shadowRadius: 4.65,
  elevation: 8,
 },
 buttonText: {
  color: "#FFFFFF",
  fontSize: 20,
  fontWeight: "600",
  marginRight: 8,
 },
 buttonIcon: {
  marginLeft: 4,
 },
});
