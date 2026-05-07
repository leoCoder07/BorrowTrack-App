import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
 Alert,
 Linking,
 SafeAreaView,
 ScrollView,
 StatusBar,
 StyleSheet,
 Text,
 TouchableOpacity,
 View,
} from "react-native";

export default function AboutScreen() {
 const appInfo = {
  name: "BorrowTrack",
  version: "1.0.0",
  description:
   "BorrowTrack is your personal borrowing assistant that helps you keep track of items you've lent to others. Never lose track of your belongings again with smart reminders, overdue alerts, and a complete borrowing history.",
  developer: "Ariel Jake",
  email: "ariel_jake@borrowtrack.app",
  website: "www.borrowtrack.app",
 };

 const handleRateApp = () => {
  Alert.alert(
   "Rate BorrowTrack",
   "Thanks for your support! Would you like to rate us?",
   [
    {text: "Later", style: "cancel"},
    {
     text: "Rate Now",
     onPress: () => {
      Linking.openURL("https://apps.apple.com/app/id123456789");
     },
    },
   ],
  );
 };

 const handleShare = () => {
  Alert.alert(
   "Share BorrowTrack",
   "Share this app with your friends!\n\nTell them to download BorrowTrack from the App Store or Google Play.",
   [{text: "OK"}],
  );
 };

 const handlePrivacyPolicy = () => {
  Alert.alert(
   "Privacy Policy",
   "Our privacy policy will be available soon at our website.",
   [{text: "OK"}],
  );
 };

 const handleTermsOfService = () => {
  Alert.alert(
   "Terms of Service",
   "Our terms of service will be available soon at our website.",
   [{text: "OK"}],
  );
 };

 const handleContact = () => {
  Linking.openURL(`mailto:${appInfo.email}`);
 };

 const handleWebsite = () => {
  Alert.alert("Website", `Visit us at ${appInfo.website}\n\nComing soon!`, [
   {text: "OK"},
  ]);
 };

 return (
  <SafeAreaView style={styles.container}>
   <StatusBar barStyle="dark-content" backgroundColor="#F5F5F5" />

   {}
   <View style={styles.header}>
    <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
     <Ionicons name="arrow-back" size={24} color="#00b4d8" />
    </TouchableOpacity>
    <Text style={styles.headerTitle}>About</Text>
    <View style={{width: 40}} />
   </View>

   <ScrollView
    style={styles.scrollView}
    contentContainerStyle={styles.scrollContent}
    showsVerticalScrollIndicator={false}
   >
    {}
    <View style={styles.logoSection}>
     <View style={styles.logoContainer}>
      <MaterialCommunityIcons name="bag-personal" size={48} color="#ffffff" />
     </View>
     <Text style={styles.appName}>{appInfo.name}</Text>
     <Text style={styles.appVersion}>Version {appInfo.version}</Text>
    </View>

    {}
    <View style={styles.card}>
     <Text style={styles.descriptionText}>{appInfo.description}</Text>
    </View>

    {}
    <View style={styles.card}>
     <View style={styles.infoRow}>
      <View style={styles.infoIconContainer}>
       <Ionicons name="code-slash-outline" size={20} color="#00b4d8" />
      </View>
      <View style={styles.infoTextContainer}>
       <Text style={styles.infoLabel}>Developer</Text>
       <Text style={styles.infoValue}>{appInfo.developer}</Text>
      </View>
     </View>

     <View style={styles.infoDivider} />

     <TouchableOpacity style={styles.infoRow} onPress={handleContact}>
      <View style={styles.infoIconContainer}>
       <Ionicons name="mail-outline" size={20} color="#00b4d8" />
      </View>
      <View style={styles.infoTextContainer}>
       <Text style={styles.infoLabel}>Contact</Text>
       <Text style={styles.infoValue}>{appInfo.email}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color="#CCC" />
     </TouchableOpacity>

     <View style={styles.infoDivider} />

     <TouchableOpacity style={styles.infoRow} onPress={handleWebsite}>
      <View style={styles.infoIconContainer}>
       <Ionicons name="globe-outline" size={20} color="#00b4d8" />
      </View>
      <View style={styles.infoTextContainer}>
       <Text style={styles.infoLabel}>Website</Text>
       <Text style={styles.infoValue}>{appInfo.website}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color="#CCC" />
     </TouchableOpacity>
    </View>

    {}
    <View style={styles.actionsSection}>
     <TouchableOpacity
      style={styles.actionButton}
      onPress={handleRateApp}
      activeOpacity={0.8}
     >
      <View style={styles.actionIconContainer}>
       <Ionicons name="star" size={20} color="#F39C12" />
      </View>
      <Text style={styles.actionText}>Rate on App Store</Text>
      <Ionicons name="chevron-forward" size={18} color="#CCC" />
     </TouchableOpacity>

     <TouchableOpacity
      style={styles.actionButton}
      onPress={handleShare}
      activeOpacity={0.8}
     >
      <View style={styles.actionIconContainer}>
       <Ionicons name="share-outline" size={20} color="#3498DB" />
      </View>
      <Text style={styles.actionText}>Share with Friends</Text>
      <Ionicons name="chevron-forward" size={18} color="#CCC" />
     </TouchableOpacity>

     <TouchableOpacity
      style={styles.actionButton}
      onPress={handlePrivacyPolicy}
      activeOpacity={0.8}
     >
      <View style={styles.actionIconContainer}>
       <Ionicons name="document-text-outline" size={20} color="#9B59B6" />
      </View>
      <Text style={styles.actionText}>Privacy Policy</Text>
      <Ionicons name="chevron-forward" size={18} color="#CCC" />
     </TouchableOpacity>

     <TouchableOpacity
      style={[styles.actionButton, styles.actionButtonLast]}
      onPress={handleTermsOfService}
      activeOpacity={0.8}
     >
      <View style={styles.actionIconContainer}>
       <Ionicons name="document-outline" size={20} color="#E67E22" />
      </View>
      <Text style={styles.actionText}>Terms of Service</Text>
      <Ionicons name="chevron-forward" size={18} color="#CCC" />
     </TouchableOpacity>
    </View>

    {}
    <View style={styles.techStackSection}>
     <Text style={styles.techStackTitle}>Built With</Text>
     <View style={styles.techStackRow}>
      <View style={styles.techBadge}>
       <Ionicons name="logo-react" size={14} color="#00b4d8" />
       <Text style={styles.techBadgeText}>React Native</Text>
      </View>
      <View style={styles.techBadge}>
       <Ionicons name="rocket-outline" size={14} color="#00b4d8" />
       <Text style={styles.techBadgeText}>Expo</Text>
      </View>
      <View style={styles.techBadge}>
       <Ionicons name="server-outline" size={14} color="#00b4d8" />
       <Text style={styles.techBadgeText}>AsyncStorage</Text>
      </View>
     </View>
    </View>

    {}
    <View style={styles.footer}>
     <Text style={styles.footerText}>Made with ❤️ by {appInfo.developer}</Text>
     <Text style={styles.footerCopyright}>
      © {new Date().getFullYear()} {appInfo.name}. All rights reserved.
     </Text>
    </View>

    <View style={{height: 40}} />
   </ScrollView>
  </SafeAreaView>
 );
}

const styles = StyleSheet.create({
 container: {
  flex: 1,
  backgroundColor: "#F5F5F5",
 },
 header: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  paddingHorizontal: 16,
  paddingVertical: 12,
  backgroundColor: "#FFFFFF",
  borderBottomWidth: 1,
  borderBottomColor: "#E8E8E8",
  elevation: 2,
 },
 headerButton: {
  width: 40,
  height: 40,
  borderRadius: 12,
  backgroundColor: "#F5F5F5",
  justifyContent: "center",
  alignItems: "center",
 },
 headerTitle: {
  fontSize: 22,
  fontWeight: "700",
  color: "#00b4d8",
  letterSpacing: 0.5,
 },
 scrollView: {
  flex: 1,
 },
 scrollContent: {
  paddingHorizontal: 20,
  paddingTop: 30,
 },
 logoSection: {
  alignItems: "center",
  marginBottom: 28,
 },
 logoContainer: {
  width: 100,
  height: 100,
  borderRadius: 24,
  backgroundColor: "#00b4d8",
  justifyContent: "center",
  alignItems: "center",
  shadowColor: "#000",
  shadowOffset: {width: 0, height: 4},
  shadowOpacity: 0.1,
  shadowRadius: 10,
  elevation: 5,
  marginBottom: 16,
 },
 appName: {
  fontSize: 28,
  fontWeight: "700",
  color: "#1a1a1a",
  letterSpacing: 1,
 },
 appVersion: {
  fontSize: 14,
  color: "#888",
  marginTop: 4,
 },
 card: {
  backgroundColor: "#FFFFFF",
  borderRadius: 16,
  padding: 20,
  marginBottom: 16,
  shadowColor: "#000",
  shadowOffset: {width: 0, height: 2},
  shadowOpacity: 0.06,
  shadowRadius: 6,
  elevation: 2,
 },
 descriptionText: {
  fontSize: 15,
  color: "#555",
  lineHeight: 24,
  textAlign: "justify",
 },
 infoRow: {
  flexDirection: "row",
  alignItems: "center",
  paddingVertical: 4,
 },
 infoIconContainer: {
  width: 40,
  height: 40,
  borderRadius: 20,
  backgroundColor: "rgba(0, 180, 216, 0.08)",
  justifyContent: "center",
  alignItems: "center",
  marginRight: 12,
 },
 infoTextContainer: {
  flex: 1,
 },
 infoLabel: {
  fontSize: 12,
  color: "#999",
  marginBottom: 2,
 },
 infoValue: {
  fontSize: 15,
  fontWeight: "500",
  color: "#333",
 },
 infoDivider: {
  height: 1,
  backgroundColor: "#F0F0F0",
  marginVertical: 12,
 },
 actionsSection: {
  marginBottom: 24,
  gap: 10,
 },
 actionButton: {
  flexDirection: "row",
  alignItems: "center",
  backgroundColor: "#FFFFFF",
  borderRadius: 16,
  paddingVertical: 16,
  paddingHorizontal: 18,
  marginBottom: 1,
 },
 actionButtonLast: {
  marginBottom: 0,
 },
 actionIconContainer: {
  width: 36,
  height: 36,
  borderRadius: 18,
  backgroundColor: "#F8F8F8",
  justifyContent: "center",
  alignItems: "center",
  marginRight: 14,
 },
 actionText: {
  flex: 1,
  fontSize: 15,
  fontWeight: "500",
  color: "#333",
 },
 techStackSection: {
  alignItems: "center",
  marginBottom: 24,
 },
 techStackTitle: {
  fontSize: 13,
  fontWeight: "600",
  color: "#999",
  letterSpacing: 1,
  marginBottom: 12,
  textTransform: "uppercase",
 },
 techStackRow: {
  flexDirection: "row",
  gap: 10,
 },
 techBadge: {
  flexDirection: "row",
  alignItems: "center",
  backgroundColor: "#FFFFFF",
  paddingHorizontal: 12,
  paddingVertical: 8,
  borderRadius: 20,
  gap: 6,
  shadowColor: "#000",
  shadowOffset: {width: 0, height: 1},
  shadowOpacity: 0.05,
  shadowRadius: 3,
  elevation: 1,
 },
 techBadgeText: {
  fontSize: 12,
  fontWeight: "600",
  color: "#00b4d8",
 },
 footer: {
  alignItems: "center",
  paddingVertical: 20,
 },
 footerText: {
  fontSize: 14,
  color: "#888",
  marginBottom: 6,
 },
 footerCopyright: {
  fontSize: 12,
  color: "#BBB",
 },
});
