import {
 FontAwesome5,
 Ionicons
} from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
 Alert,
 Image,
 Platform,
 ScrollView,
 StatusBar,
 StyleSheet,
 Text,
 TouchableOpacity,
 View,
} from "react-native";
import { userService } from "../../services/userService";

const PROFILE_IMAGE_KEY = "@borrowtrack_profile_image";

export default function ProfileScreen() {
 const router = useRouter();
 const [user, setUser] = useState<any>(null);
 const [profileImage, setProfileImage] = useState<string | null>(null);

 useEffect(() => {
  loadUserData();
 }, []);

 const loadUserData = async () => {
  const currentUser = await userService.getCurrentUser();
  setUser(currentUser);

  // Load saved profile image
  const savedImage = await AsyncStorage.getItem(PROFILE_IMAGE_KEY);
  if (savedImage) {
   setProfileImage(savedImage);
  }
 };

 const handleChangeProfilePicture = () => {
  Alert.alert("Profile Picture", "Choose an option", [
   {text: "Cancel", style: "cancel"},
   {
    text: "Take Photo",
    onPress: () => openCamera(),
   },
   {
    text: "Choose from Gallery",
    onPress: () => openGallery(),
   },
   ...(profileImage
    ? [
       {
        text: "Remove Photo",
        style: "destructive" as const,
        onPress: () => removeProfilePicture(),
       },
      ]
    : []),
  ]);
 };

 const openCamera = async () => {
  const {status} = await ImagePicker.requestCameraPermissionsAsync();

  if (status !== "granted") {
   Alert.alert(
    "Permission needed",
    "Camera permission is required to take photos",
   );
   return;
  }

  const result = await ImagePicker.launchCameraAsync({
   mediaTypes: ImagePicker.MediaTypeOptions.Images,
   allowsEditing: true,
   aspect: [1, 1],
   quality: 0.8,
  });

  if (!result.canceled) {
   const uri = result.assets[0].uri;
   setProfileImage(uri);
   await AsyncStorage.setItem(PROFILE_IMAGE_KEY, uri);
  }
 };

 const openGallery = async () => {
  const {status} = await ImagePicker.requestMediaLibraryPermissionsAsync();

  if (status !== "granted") {
   Alert.alert(
    "Permission needed",
    "Gallery permission is required to select photos",
   );
   return;
  }

  const result = await ImagePicker.launchImageLibraryAsync({
   mediaTypes: ImagePicker.MediaTypeOptions.Images,
   allowsEditing: true,
   aspect: [1, 1],
   quality: 0.8,
  });

  if (!result.canceled) {
   const uri = result.assets[0].uri;
   setProfileImage(uri);
   await AsyncStorage.setItem(PROFILE_IMAGE_KEY, uri);
  }
 };

 const removeProfilePicture = async () => {
  setProfileImage(null);
  await AsyncStorage.removeItem(PROFILE_IMAGE_KEY);
 };

 const handleLogout = () => {
  Alert.alert("Logout", "Are you sure you want to logout?", [
   {text: "Cancel", style: "cancel"},
   {
    text: "Logout",
    style: "destructive",
    onPress: async () => {
     await userService.logout();
     router.replace("/auth");
    },
   },
  ]);
 };

 return (
  <View style={styles.container}>
   <StatusBar backgroundColor="#00b4d8" barStyle="light-content" />

   {/* Header */}
   <View style={styles.header}>
    <View style={styles.headerContent}>
     <FontAwesome5
      name="user-circle"
      size={28}
      color="#FFFFFF"
      style={styles.headerIcon}
     />
     <Text style={styles.headerTitle}>Profile</Text>
    </View>
    <Text style={styles.subHeader}>Account Settings</Text>
   </View>

   <ScrollView
    style={styles.content}
    showsVerticalScrollIndicator={false}
    contentContainerStyle={styles.scrollContent}
   >
    {/* Profile Picture Section */}
    <TouchableOpacity
     style={styles.profilePictureSection}
     onPress={handleChangeProfilePicture}
     activeOpacity={0.8}
    >
     <View style={styles.profilePictureContainer}>
      {profileImage ? (
       <Image source={{uri: profileImage}} style={styles.profilePicture} />
      ) : (
       <View style={styles.profilePicturePlaceholder}>
        <FontAwesome5 name="user" size={50} color="#00b4d8" />
       </View>
      )}
      <View style={styles.cameraIconContainer}>
       <Ionicons name="camera" size={16} color="#FFFFFF" />
      </View>
     </View>
     <Text style={styles.changePhotoText}>Change Profile Picture</Text>
    </TouchableOpacity>

    {/* User Info Card */}
    {user && (
     <View style={styles.infoCard}>
      <View style={styles.infoRow}>
       <View style={styles.infoIconContainer}>
        <FontAwesome5 name="user" size={20} color="#00b4d8" />
       </View>
       <View style={styles.infoTextContainer}>
        <Text style={styles.infoLabel}>Username</Text>
        <Text style={styles.infoValue}>{user.username}</Text>
       </View>
      </View>

      <View style={styles.infoDivider} />

      <View style={styles.infoRow}>
       <View style={styles.infoIconContainer}>
        <Ionicons name="mail-outline" size={20} color="#00b4d8" />
       </View>
       <View style={styles.infoTextContainer}>
        <Text style={styles.infoLabel}>Email</Text>
        <Text style={styles.infoValue}>{user.email}</Text>
       </View>
      </View>
     </View>
    )}

    {/* Menu Items */}
    <View style={styles.menuSection}>
     <TouchableOpacity
      style={styles.menuItem}
      onPress={() => router.push("/faqs")}
      activeOpacity={0.7}
     >
      <View style={[styles.menuIconContainer, {backgroundColor: "#E3F2FD"}]}>
       <Ionicons name="help-circle-outline" size={22} color="#2196F3" />
      </View>
      <Text style={styles.menuText}>FAQs</Text>
      <Ionicons name="chevron-forward" size={20} color="#CCC" />
     </TouchableOpacity>

     <TouchableOpacity
      style={[styles.menuItem, styles.menuItemLast]}
      onPress={() => router.push("/about")}
      activeOpacity={0.7}
     >
      <View style={[styles.menuIconContainer, {backgroundColor: "#E8F5E9"}]}>
       <Ionicons name="information-circle-outline" size={22} color="#4CAF50" />
      </View>
      <Text style={styles.menuText}>About</Text>
      <Ionicons name="chevron-forward" size={20} color="#CCC" />
     </TouchableOpacity>
    </View>

    {/* Logout Button */}
    <TouchableOpacity
     style={styles.logoutButton}
     onPress={handleLogout}
     activeOpacity={0.8}
    >
     <Ionicons name="log-out-outline" size={22} color="#FFFFFF" />
     <Text style={styles.logoutText}>Logout</Text>
    </TouchableOpacity>
   </ScrollView>
  </View>
 );
}

const styles = StyleSheet.create({
 container: {
  flex: 1,
  backgroundColor: "#F5F5F5",
 },
 header: {
  backgroundColor: "#00b4d8",
  paddingTop: Platform.OS === "ios" ? 50 : 40,
  paddingBottom: 20,
  paddingHorizontal: 20,
  borderBottomLeftRadius: 20,
  borderBottomRightRadius: 20,
  elevation: 5,
  shadowColor: "#000",
  shadowOffset: {width: 0, height: 2},
  shadowOpacity: 0.25,
  shadowRadius: 3.84,
 },
 headerContent: {
  flexDirection: "row",
  alignItems: "center",
  marginBottom: 8,
 },
 headerIcon: {
  marginRight: 10,
 },
 headerTitle: {
  fontSize: 28,
  fontWeight: "bold",
  color: "#FFFFFF",
 },
 subHeader: {
  fontSize: 16,
  color: "#FFFFFF",
  opacity: 0.9,
 },
 content: {
  flex: 1,
 },
 scrollContent: {
  padding: 20,
  paddingBottom: 40,
 },
 // Profile Picture
 profilePictureSection: {
  alignItems: "center",
  marginTop: 20,
  marginBottom: 30,
 },
 profilePictureContainer: {
  position: "relative",
  marginBottom: 12,
 },
 profilePicture: {
  width: 120,
  height: 120,
  borderRadius: 60,
  borderWidth: 4,
  borderColor: "#00b4d8",
 },
 profilePicturePlaceholder: {
  width: 120,
  height: 120,
  borderRadius: 60,
  backgroundColor: "#E3F2FD",
  justifyContent: "center",
  alignItems: "center",
  borderWidth: 4,
  borderColor: "#00b4d8",
 },
 cameraIconContainer: {
  position: "absolute",
  bottom: 0,
  right: 0,
  backgroundColor: "#00b4d8",
  width: 36,
  height: 36,
  borderRadius: 18,
  justifyContent: "center",
  alignItems: "center",
  borderWidth: 3,
  borderColor: "#FFFFFF",
  elevation: 3,
  shadowColor: "#000",
  shadowOffset: {width: 0, height: 2},
  shadowOpacity: 0.2,
  shadowRadius: 3,
 },
 changePhotoText: {
  fontSize: 14,
  color: "#00b4d8",
  fontWeight: "600",
 },
 // Info Card
 infoCard: {
  backgroundColor: "#FFFFFF",
  borderRadius: 16,
  padding: 20,
  marginBottom: 24,
  elevation: 3,
  shadowColor: "#000",
  shadowOffset: {width: 0, height: 2},
  shadowOpacity: 0.1,
  shadowRadius: 4,
 },
 infoRow: {
  flexDirection: "row",
  alignItems: "center",
  paddingVertical: 4,
 },
 infoIconContainer: {
  width: 45,
  height: 45,
  borderRadius: 12,
  backgroundColor: "#E3F2FD",
  justifyContent: "center",
  alignItems: "center",
  marginRight: 14,
 },
 infoTextContainer: {
  flex: 1,
 },
 infoLabel: {
  fontSize: 12,
  color: "#999",
  marginBottom: 2,
  textTransform: "uppercase",
  fontWeight: "600",
 },
 infoValue: {
  fontSize: 16,
  fontWeight: "500",
  color: "#333",
 },
 infoDivider: {
  height: 1,
  backgroundColor: "#F0F0F0",
  marginVertical: 16,
  marginLeft: 59,
 },
 // Menu Section
 menuSection: {
  backgroundColor: "#FFFFFF",
  borderRadius: 16,
  marginBottom: 24,
  elevation: 3,
  shadowColor: "#000",
  shadowOffset: {width: 0, height: 2},
  shadowOpacity: 0.1,
  shadowRadius: 4,
  overflow: "hidden",
 },
 menuItem: {
  flexDirection: "row",
  alignItems: "center",
  paddingVertical: 16,
  paddingHorizontal: 20,
  borderBottomWidth: 1,
  borderBottomColor: "#F5F5F5",
 },
 menuItemLast: {
  borderBottomWidth: 0,
 },
 menuIconContainer: {
  width: 40,
  height: 40,
  borderRadius: 10,
  justifyContent: "center",
  alignItems: "center",
  marginRight: 14,
 },
 menuText: {
  flex: 1,
  fontSize: 16,
  fontWeight: "500",
  color: "#333",
 },
 // Logout Button
 logoutButton: {
  backgroundColor: "#FF4444",
  paddingVertical: 16,
  borderRadius: 12,
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  elevation: 3,
  shadowColor: "#FF4444",
  shadowOffset: {width: 0, height: 2},
  shadowOpacity: 0.3,
  shadowRadius: 3,
 },
 logoutText: {
  color: "#FFFFFF",
  fontSize: 16,
  fontWeight: "bold",
  marginLeft: 8,
 },
});
