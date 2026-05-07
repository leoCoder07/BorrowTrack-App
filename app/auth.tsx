import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
 ActivityIndicator,
 Alert,
 KeyboardAvoidingView,
 Platform,
 ScrollView,
 StatusBar,
 StyleSheet,
 Text,
 TextInput,
 TouchableOpacity,
 View,
} from "react-native";
import { userService } from "../services/userService";

export default function AuthScreen() {
 const router = useRouter();
 const [isLogin, setIsLogin] = useState(true);
 const [showPassword, setShowPassword] = useState(false);
 const [showConfirmPassword, setShowConfirmPassword] = useState(false);
 const [isLoading, setIsLoading] = useState(false);

 const [username, setUsername] = useState("");
 const [email, setEmail] = useState("");
 const [password, setPassword] = useState("");
 const [confirmPassword, setConfirmPassword] = useState("");

 const validateForm = (): boolean => {
  if (!isLogin) {
   if (!username.trim()) {
    Alert.alert("Error", "Please enter a username");
    return false;
   }
   if (!email.trim()) {
    Alert.alert("Error", "Please enter an email");
    return false;
   }
   if (!email.includes("@")) {
    Alert.alert("Error", "Please enter a valid email");
    return false;
   }
   if (!password) {
    Alert.alert("Error", "Please enter a password");
    return false;
   }
   if (password.length < 6) {
    Alert.alert("Error", "Password must be at least 6 characters");
    return false;
   }
   if (password !== confirmPassword) {
    Alert.alert("Error", "Passwords do not match");
    return false;
   }
  } else {
   if (!username.trim()) {
    Alert.alert("Error", "Please enter your username or email");
    return false;
   }
   if (!password) {
    Alert.alert("Error", "Please enter your password");
    return false;
   }
  }
  return true;
 };

 const handleSubmit = async () => {
  if (!validateForm()) return;

  setIsLoading(true);

  try {
   if (isLogin) {
    await userService.login(username, password);
    Alert.alert("Success", "Welcome back!", [
     {text: "OK", onPress: () => router.replace("/(tabs)/home" as any)},
    ]);
   } else {
    await userService.register(username, email, password);
    Alert.alert("Success", "Account created successfully!", [
     {text: "OK", onPress: () => router.replace("/auth" as any)},
    ]);
   }
  } catch (error: any) {
   Alert.alert("Error", error.message || "Something went wrong");
  } finally {
   setIsLoading(false);
  }
 };

 return (
  <KeyboardAvoidingView
   style={styles.container}
   behavior={Platform.OS === "ios" ? "padding" : "height"}
  >
   <StatusBar barStyle="light-content" />
   <ScrollView
    contentContainerStyle={styles.scrollContent}
    keyboardShouldPersistTaps="handled"
   >
    {/* Header Section */}
    <View style={styles.headerSection}>
     <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
      <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
     </TouchableOpacity>

     <View style={styles.logoContainer}>
      <MaterialCommunityIcons name="bag-personal" size={50} color="#FFFFFF" />
     </View>

     <Text style={styles.appName}>BorrowTrack</Text>
     <Text style={styles.welcomeText}>
      {isLogin ? "Welcome back!" : "Create your account"}
     </Text>
    </View>

    {/* Form Section */}
    <View style={styles.formSection}>
     {/* Toggle Buttons */}
     <View style={styles.toggleContainer}>
      <TouchableOpacity
       style={[styles.toggleButton, isLogin && styles.toggleButtonActive]}
       onPress={() => {
        setIsLogin(true);
        setEmail("");
        setConfirmPassword("");
       }}
      >
       <Text style={[styles.toggleText, isLogin && styles.toggleTextActive]}>
        Login
       </Text>
      </TouchableOpacity>
      <TouchableOpacity
       style={[styles.toggleButton, !isLogin && styles.toggleButtonActive]}
       onPress={() => setIsLogin(false)}
      >
       <Text style={[styles.toggleText, !isLogin && styles.toggleTextActive]}>
        Sign Up
       </Text>
      </TouchableOpacity>
     </View>

     {/* Sign Up Fields */}
     {!isLogin && (
      <>
       <View style={styles.inputContainer}>
        <Ionicons
         name="person-outline"
         size={20}
         color="#00b4d8"
         style={styles.inputIcon}
        />
        <TextInput
         style={styles.input}
         placeholder="Username"
         placeholderTextColor="#999"
         value={username}
         onChangeText={setUsername}
         autoCapitalize="none"
        />
       </View>

       <View style={styles.inputContainer}>
        <Ionicons
         name="mail-outline"
         size={20}
         color="#00b4d8"
         style={styles.inputIcon}
        />
        <TextInput
         style={styles.input}
         placeholder="Email"
         placeholderTextColor="#999"
         value={email}
         onChangeText={setEmail}
         keyboardType="email-address"
         autoCapitalize="none"
        />
       </View>
      </>
     )}

     {/* Login Username/Email Field */}
     {isLogin && (
      <View style={styles.inputContainer}>
       <Ionicons
        name="person-outline"
        size={20}
        color="#00b4d8"
        style={styles.inputIcon}
       />
       <TextInput
        style={styles.input}
        placeholder="Username or Email"
        placeholderTextColor="#999"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
       />
      </View>
     )}

     {/* Password Field */}
     <View style={styles.inputContainer}>
      <Ionicons
       name="lock-closed-outline"
       size={20}
       color="#00b4d8"
       style={styles.inputIcon}
      />
      <TextInput
       style={styles.input}
       placeholder="Password"
       placeholderTextColor="#999"
       value={password}
       onChangeText={setPassword}
       secureTextEntry={!showPassword}
       autoCapitalize="none"
      />
      <TouchableOpacity
       onPress={() => setShowPassword(!showPassword)}
       style={styles.eyeIcon}
      >
       <Ionicons
        name={showPassword ? "eye-off-outline" : "eye-outline"}
        size={20}
        color="#00b4d8"
       />
      </TouchableOpacity>
     </View>

     {/* Confirm Password Field */}
     {!isLogin && (
      <View style={styles.inputContainer}>
       <Ionicons
        name="lock-closed-outline"
        size={20}
        color="#00b4d8"
        style={styles.inputIcon}
       />
       <TextInput
        style={styles.input}
        placeholder="Confirm Password"
        placeholderTextColor="#999"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry={!showConfirmPassword}
        autoCapitalize="none"
       />
       <TouchableOpacity
        onPress={() => setShowConfirmPassword(!showConfirmPassword)}
        style={styles.eyeIcon}
       >
        <Ionicons
         name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
         size={20}
         color="#00b4d8"
        />
       </TouchableOpacity>
      </View>
     )}

     {/* Submit Button */}
     <TouchableOpacity
      style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
      onPress={handleSubmit}
      activeOpacity={0.8}
      disabled={isLoading}
     >
      {isLoading ? (
       <ActivityIndicator color="#FFFFFF" size="small" />
      ) : (
       <>
        <Text style={styles.submitButtonText}>
         {isLogin ? "Login" : "Sign Up"}
        </Text>
        <Ionicons
         name={isLogin ? "log-in-outline" : "person-add-outline"}
         size={20}
         color="#FFFFFF"
         style={styles.submitIcon}
        />
       </>
      )}
     </TouchableOpacity>

     {/* Forgot Password (Login only) */}
     {isLogin && (
      <TouchableOpacity style={styles.forgotPassword}>
       <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
      </TouchableOpacity>
     )}

     {/* Terms and Conditions (Sign Up only) */}
     {!isLogin && (
      <Text style={styles.termsText}>
       By signing up, you agree to our{" "}
       <Text style={styles.termsLink}>Terms of Service</Text> and{" "}
       <Text style={styles.termsLink}>Privacy Policy</Text>
      </Text>
     )}
    </View>
   </ScrollView>
  </KeyboardAvoidingView>
 );
}

const styles = StyleSheet.create({
 container: {
  flex: 1,
  backgroundColor: "#00b4d8",
 },
 scrollContent: {
  flexGrow: 1,
 },
 headerSection: {
  paddingTop: 60,
  paddingBottom: 30,
  alignItems: "center",
  justifyContent: "center",
  minHeight: 250,
 },
 backButton: {
  position: "absolute",
  top: 50,
  left: 20,
  zIndex: 1,
  padding: 10,
 },
 logoContainer: {
  width: 90,
  height: 90,
  borderRadius: 45,
  backgroundColor: "rgba(255, 255, 255, 0.2)",
  alignItems: "center",
  justifyContent: "center",
  marginBottom: 15,
 },
 appName: {
  fontSize: 32,
  fontWeight: "bold",
  color: "#FFFFFF",
  marginBottom: 8,
 },
 welcomeText: {
  fontSize: 16,
  color: "#FFFFFF",
  opacity: 0.9,
 },
 formSection: {
  flex: 1,
  backgroundColor: "#FFFFFF",
  borderTopLeftRadius: 30,
  borderTopRightRadius: 30,
  paddingHorizontal: 25,
  paddingTop: 30,
  paddingBottom: 40,
 },
 toggleContainer: {
  flexDirection: "row",
  backgroundColor: "#F5F5F5",
  borderRadius: 25,
  padding: 4,
  marginBottom: 30,
 },
 toggleButton: {
  flex: 1,
  paddingVertical: 12,
  borderRadius: 25,
  alignItems: "center",
 },
 toggleButtonActive: {
  backgroundColor: "#00b4d8",
  shadowColor: "#000",
  shadowOffset: {
   width: 0,
   height: 2,
  },
  shadowOpacity: 0.1,
  shadowRadius: 3.84,
  elevation: 5,
 },
 toggleText: {
  fontSize: 16,
  fontWeight: "600",
  color: "#999",
 },
 toggleTextActive: {
  color: "#FFFFFF",
 },
 inputContainer: {
  flexDirection: "row",
  alignItems: "center",
  backgroundColor: "#F8F9FA",
  borderRadius: 12,
  marginBottom: 16,
  borderWidth: 1,
  borderColor: "#E0E0E0",
 },
 inputIcon: {
  paddingLeft: 15,
 },
 input: {
  flex: 1,
  paddingVertical: 15,
  paddingHorizontal: 10,
  fontSize: 16,
  color: "#333",
 },
 eyeIcon: {
  padding: 15,
 },
 submitButton: {
  backgroundColor: "#00b4d8",
  paddingVertical: 16,
  borderRadius: 12,
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  marginTop: 10,
  shadowColor: "#00b4d8",
  shadowOffset: {
   width: 0,
   height: 4,
  },
  shadowOpacity: 0.3,
  shadowRadius: 4.65,
  elevation: 8,
 },
 submitButtonDisabled: {
  opacity: 0.7,
 },
 submitButtonText: {
  color: "#FFFFFF",
  fontSize: 18,
  fontWeight: "bold",
  marginRight: 8,
 },
 submitIcon: {
  marginLeft: 4,
 },
 forgotPassword: {
  alignSelf: "center",
  marginTop: 20,
 },
 forgotPasswordText: {
  color: "#00b4d8",
  fontSize: 14,
  fontWeight: "500",
 },
 termsText: {
  textAlign: "center",
  marginTop: 25,
  fontSize: 12,
  color: "#666",
  lineHeight: 18,
 },
 termsLink: {
  color: "#00b4d8",
  fontWeight: "600",
 },
});
