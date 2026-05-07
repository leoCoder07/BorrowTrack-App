import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
 Alert,
 Dimensions,
 FlatList,
 Image,
 Keyboard,
 KeyboardAvoidingView,
 Modal,
 Platform,
 ScrollView,
 StatusBar,
 StyleSheet,
 Text,
 TextInput,
 TouchableOpacity,
 TouchableWithoutFeedback,
 View,
} from "react-native";
import { BorrowedItem, itemService } from "../../services/itemService";
import { userService } from "../../services/userService";

const {width, height} = Dimensions.get("window");

export default function HomeScreen() {
 const router = useRouter();
 const [modalVisible, setModalVisible] = useState(false);
 const [items, setItems] = useState<BorrowedItem[]>([]);
 const [currentUser, setCurrentUser] = useState<any>(null);
 const [selectedItem, setSelectedItem] = useState<BorrowedItem | null>(null);

 const [itemName, setItemName] = useState("");
 const [borrowerName, setBorrowerName] = useState("");
 const [dateBorrowed, setDateBorrowed] = useState("");
 const [returnDate, setReturnDate] = useState("");
 const [imageUri, setImageUri] = useState<string | null>(null);

 useEffect(() => {
  loadUserAndItems();
 }, []);

 useFocusEffect(
  useCallback(() => {
   loadItems();
  }, [currentUser]),
 );

 const loadUserAndItems = async () => {
  const user = await userService.getCurrentUser();
  setCurrentUser(user);
  if (user) {
   await itemService.checkOverdueItems();
   await loadItems();
  }
 };

 const loadItems = async () => {
  if (currentUser) {
   const activeItems = await itemService.getActiveItems(currentUser.id);
   setItems(activeItems);
  }
 };

 const handleOpenCamera = async () => {
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
   aspect: [4, 3],
   quality: 0.8,
  });

  if (!result.canceled) {
   setImageUri(result.assets[0].uri);
  }
 };

 const handleAddItem = async () => {
  if (!itemName.trim()) {
   Alert.alert("Error", "Please enter item name");
   return;
  }
  if (!borrowerName.trim()) {
   Alert.alert("Error", "Please enter borrower name");
   return;
  }
  if (!dateBorrowed.trim()) {
   Alert.alert("Error", "Please enter date borrowed");
   return;
  }
  if (!returnDate.trim()) {
   Alert.alert("Error", "Please enter return date");
   return;
  }

  try {
   await itemService.addItem({
    itemName: itemName.trim(),
    borrowerName: borrowerName.trim(),
    dateBorrowed: dateBorrowed.trim(),
    returnDate: returnDate.trim(),
    imageUri: imageUri || undefined,
    userId: currentUser.id,
   });

   setItemName("");
   setBorrowerName("");
   setDateBorrowed("");
   setReturnDate("");
   setImageUri(null);
   setModalVisible(false);

   await loadItems();
   Alert.alert("Success", "Item added successfully!");
  } catch (error) {
   Alert.alert("Error", "Failed to add item");
  }
 };

 const handleMarkAsReturned = (item: BorrowedItem) => {
  Alert.alert(
   "Mark as Returned",
   `Are you sure "${item.itemName}" has been returned?`,
   [
    {text: "Cancel", style: "cancel"},
    {
     text: "Yes, Mark Returned",
     onPress: async () => {
      await itemService.updateItemStatus(item.id, "returned");
      setSelectedItem(null);
      await loadItems();
      Alert.alert("Success", "Item marked as returned!");
     },
    },
   ],
  );
 };

 const handleDeleteItem = (item: BorrowedItem) => {
  Alert.alert(
   "Delete Item",
   `Are you sure you want to delete "${item.itemName}"? This action cannot be undone.`,
   [
    {text: "Cancel", style: "cancel"},
    {
     text: "Delete",
     style: "destructive",
     onPress: async () => {
      await itemService.deleteItem(item.id);
      setSelectedItem(null);
      await loadItems();
      Alert.alert("Deleted", "Item has been deleted successfully");
     },
    },
   ],
  );
 };

 const getStatusColor = (status: string) => {
  switch (status) {
   case "borrowed":
    return "#00b4d8";
   case "overdue":
    return "#FF4444";
   case "returned":
    return "#4CAF50";
   default:
    return "#999";
  }
 };

 const getStatusIcon = (status: string) => {
  switch (status) {
   case "borrowed":
    return "time-outline";
   case "overdue":
    return "warning-outline";
   case "returned":
    return "checkmark-circle-outline";
   default:
    return "help-circle-outline";
  }
 };

 const getStatusText = (status: string) => {
  switch (status) {
   case "borrowed":
    return "Borrowed";
   case "overdue":
    return "Overdue";
   case "returned":
    return "Returned";
   default:
    return status;
  }
 };

 const renderItem = ({item}: {item: BorrowedItem}) => (
  <TouchableOpacity
   style={styles.itemCard}
   onPress={() => setSelectedItem(item)}
  >
   <View style={styles.itemCardContent}>
    {}
    {item.imageUri ? (
     <View style={styles.itemImageContainer}>
      <Image
       source={{uri: item.imageUri}}
       style={styles.itemImage}
       resizeMode="cover"
      />
     </View>
    ) : (
     <View style={styles.itemImagePlaceholder}>
      <MaterialCommunityIcons
       name="package-variant"
       size={30}
       color="#00b4d8"
       opacity={0.5}
      />
     </View>
    )}

    {}
    <View style={styles.itemDetails}>
     <View style={styles.itemHeader}>
      <View style={styles.itemInfo}>
       <Text style={styles.itemName} numberOfLines={1}>
        {item.itemName}
       </Text>
       <Text style={styles.borrowerName}>
        <Ionicons name="person-outline" size={12} color="#666" />{" "}
        {item.borrowerName}
       </Text>
      </View>
      <View
       style={[
        styles.statusBadge,
        {backgroundColor: getStatusColor(item.status)},
       ]}
      >
       <Ionicons name={getStatusIcon(item.status)} size={10} color="#FFF" />
       <Text style={styles.statusText}>{item.status}</Text>
      </View>
     </View>

     <View style={styles.itemFooter}>
      <View style={styles.dateInfo}>
       <Ionicons name="calendar-outline" size={13} color="#666" />
       <Text style={styles.dateText}>Borrowed: {item.dateBorrowed}</Text>
      </View>
      <View style={styles.dateInfo}>
       <Ionicons
        name={item.status === "overdue" ? "alert-circle" : "calendar-outline"}
        size={13}
        color={item.status === "overdue" ? "#FF4444" : "#666"}
       />
       <Text
        style={[
         styles.dateText,
         item.status === "overdue" && styles.overdueText,
        ]}
       >
        Return: {item.returnDate}
       </Text>
      </View>
     </View>
    </View>
   </View>
  </TouchableOpacity>
 );

 if (selectedItem) {
  return (
   <View style={styles.container}>
    <StatusBar backgroundColor="#00b4d8" barStyle="light-content" />

    {}
    <View style={styles.header}>
     <View style={styles.detailHeader}>
      <TouchableOpacity
       onPress={() => setSelectedItem(null)}
       style={styles.backButton}
      >
       <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
      </TouchableOpacity>
      <Text style={styles.detailHeaderTitle} numberOfLines={1}>
       {selectedItem.itemName} Details
      </Text>
     </View>
    </View>

    <ScrollView
     style={styles.detailContent}
     showsVerticalScrollIndicator={false}
    >
     {}
     <View style={styles.detailImageContainer}>
      {selectedItem.imageUri ? (
       <Image
        source={{uri: selectedItem.imageUri}}
        style={styles.detailImage}
        resizeMode="cover"
       />
      ) : (
       <View style={styles.detailImagePlaceholder}>
        <MaterialCommunityIcons
         name="package-variant"
         size={80}
         color="#00b4d8"
         opacity={0.3}
        />
        <Text style={styles.noImageText}>No Image Available</Text>
       </View>
      )}
     </View>

     {}
     <View style={styles.detailStatusContainer}>
      <View
       style={[
        styles.detailStatusBadge,
        {backgroundColor: getStatusColor(selectedItem.status)},
       ]}
      >
       <Ionicons
        name={getStatusIcon(selectedItem.status)}
        size={18}
        color="#FFF"
       />
       <Text style={styles.detailStatusText}>
        {getStatusText(selectedItem.status)}
       </Text>
      </View>
     </View>

     {}
     <View style={styles.detailsCard}>
      <Text style={styles.detailsCardTitle}>Item Information</Text>

      <View style={styles.detailRow}>
       <View style={styles.detailIconContainer}>
        <MaterialCommunityIcons
         name="package-variant"
         size={22}
         color="#00b4d8"
        />
       </View>
       <View style={styles.detailInfo}>
        <Text style={styles.detailLabel}>Item Name</Text>
        <Text style={styles.detailValue}>{selectedItem.itemName}</Text>
       </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.detailRow}>
       <View style={styles.detailIconContainer}>
        <Ionicons name="person-outline" size={22} color="#00b4d8" />
       </View>
       <View style={styles.detailInfo}>
        <Text style={styles.detailLabel}>Borrower Name</Text>
        <Text style={styles.detailValue}>{selectedItem.borrowerName}</Text>
       </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.detailRow}>
       <View style={styles.detailIconContainer}>
        <Ionicons name="calendar-outline" size={22} color="#00b4d8" />
       </View>
       <View style={styles.detailInfo}>
        <Text style={styles.detailLabel}>Date Borrowed</Text>
        <Text style={styles.detailValue}>{selectedItem.dateBorrowed}</Text>
       </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.detailRow}>
       <View
        style={[
         styles.detailIconContainer,
         selectedItem.status === "overdue" && styles.overdueIconBg,
        ]}
       >
        <Ionicons
         name={
          selectedItem.status === "overdue"
           ? "alert-circle"
           : "calendar-outline"
         }
         size={22}
         color={selectedItem.status === "overdue" ? "#FF4444" : "#00b4d8"}
        />
       </View>
       <View style={styles.detailInfo}>
        <Text style={styles.detailLabel}>Return Date</Text>
        <Text
         style={[
          styles.detailValue,
          selectedItem.status === "overdue" && styles.overdueValue,
         ]}
        >
         {selectedItem.returnDate}
         {selectedItem.status === "overdue" && " (Overdue)"}
        </Text>
       </View>
      </View>
     </View>

     {}
     <View style={styles.actionButtons}>
      {selectedItem.status !== "returned" && (
       <TouchableOpacity
        style={styles.markReturnedButton}
        onPress={() => handleMarkAsReturned(selectedItem)}
        activeOpacity={0.8}
       >
        <Ionicons name="checkmark-circle-outline" size={22} color="#FFFFFF" />
        <Text style={styles.actionButtonText}>Mark as Returned</Text>
       </TouchableOpacity>
      )}

      {selectedItem.status === "returned" && (
       <TouchableOpacity style={styles.returnedBadge} disabled>
        <Ionicons name="checkmark-circle" size={22} color="#FFFFFF" />
        <Text style={styles.actionButtonText}>Item Returned</Text>
       </TouchableOpacity>
      )}

      <TouchableOpacity
       style={styles.deleteButton}
       onPress={() => handleDeleteItem(selectedItem)}
       activeOpacity={0.8}
      >
       <Ionicons name="trash-outline" size={22} color="#FFFFFF" />
       <Text style={styles.actionButtonText}>Delete Item</Text>
      </TouchableOpacity>
     </View>
    </ScrollView>
   </View>
  );
 }

 return (
  <View style={styles.container}>
   <StatusBar backgroundColor="#00b4d8" barStyle="light-content" />

   {}
   <View style={styles.header}>
    <View style={styles.headerContent}>
     <View style={styles.logoContainer}>
      <MaterialCommunityIcons name="bag-personal" size={24} color="#FFFFFF" />
     </View>
     <Text style={styles.headerTitle}>BorrowTrack</Text>
    </View>
    <Text style={styles.subHeader}>Dashboard: Borrowed Items</Text>
   </View>

   {}
   {items.length === 0 ? (
    <View style={styles.emptyState}>
     <MaterialCommunityIcons
      name="package-variant-closed"
      size={80}
      color="#00b4d8"
      opacity={0.5}
     />
     <Text style={styles.emptyText}>No borrowed items yet</Text>
     <Text style={styles.emptySubText}>
      Tap the + button to add your first item
     </Text>
    </View>
   ) : (
    <FlatList
     data={items}
     renderItem={renderItem}
     keyExtractor={(item) => item.id}
     contentContainerStyle={styles.listContainer}
     showsVerticalScrollIndicator={false}
    />
   )}

   {}
   <TouchableOpacity
    style={styles.fab}
    onPress={() => setModalVisible(true)}
    activeOpacity={0.8}
   >
    <Ionicons name="add" size={30} color="#FFFFFF" />
   </TouchableOpacity>

   {}
   <Modal
    animationType="slide"
    transparent={true}
    visible={modalVisible}
    onRequestClose={() => {
     Keyboard.dismiss();
     setModalVisible(false);
    }}
    statusBarTranslucent={true}
   >
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
     <View style={styles.modalOverlay}>
      <KeyboardAvoidingView
       behavior={Platform.OS === "ios" ? "padding" : "height"}
       style={styles.keyboardAvoidingView}
       keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
       <View style={styles.modalContainer}>
        {}
        <View style={styles.modalHeader}>
         <Text style={styles.modalTitle}>Add Borrowed Item</Text>
         <TouchableOpacity
          onPress={() => {
           Keyboard.dismiss();
           setModalVisible(false);
          }}
          style={styles.closeButton}
         >
          <Ionicons name="close" size={24} color="#333" />
         </TouchableOpacity>
        </View>

        <ScrollView
         showsVerticalScrollIndicator={false}
         keyboardShouldPersistTaps="handled"
         contentContainerStyle={styles.scrollContent}
        >
         {}
         <TouchableOpacity
          style={styles.imagePicker}
          onPress={handleOpenCamera}
         >
          {imageUri ? (
           <Image source={{uri: imageUri}} style={styles.pickedImage} />
          ) : (
           <View style={styles.imagePlaceholder}>
            <Ionicons name="camera-outline" size={40} color="#00b4d8" />
            <Text style={styles.imagePlaceholderText}>
             Take Photo (Optional)
            </Text>
           </View>
          )}
         </TouchableOpacity>

         {}
         <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Item Name *</Text>
          <View style={styles.inputContainer}>
           <MaterialCommunityIcons
            name="package-variant"
            size={20}
            color="#00b4d8"
            style={styles.inputIcon}
           />
           <TextInput
            style={styles.input}
            placeholder="e.g., Textbook, Laptop"
            placeholderTextColor="#999"
            value={itemName}
            onChangeText={setItemName}
            returnKeyType="next"
           />
          </View>
         </View>

         {}
         <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Borrower Name *</Text>
          <View style={styles.inputContainer}>
           <Ionicons
            name="person-outline"
            size={20}
            color="#00b4d8"
            style={styles.inputIcon}
           />
           <TextInput
            style={styles.input}
            placeholder="e.g., Juan Dela Cruz"
            placeholderTextColor="#999"
            value={borrowerName}
            onChangeText={setBorrowerName}
            returnKeyType="next"
           />
          </View>
         </View>

         {}
         <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Date Borrowed *</Text>
          <View style={styles.inputContainer}>
           <Ionicons
            name="calendar-outline"
            size={20}
            color="#00b4d8"
            style={styles.inputIcon}
           />
           <TextInput
            style={styles.input}
            placeholder="YYYY-MM-DD"
            placeholderTextColor="#999"
            value={dateBorrowed}
            onChangeText={setDateBorrowed}
            keyboardType="numbers-and-punctuation"
            returnKeyType="next"
           />
          </View>
         </View>

         {}
         <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Return Date *</Text>
          <View style={styles.inputContainer}>
           <Ionicons
            name="calendar-outline"
            size={20}
            color="#00b4d8"
            style={styles.inputIcon}
           />
           <TextInput
            style={styles.input}
            placeholder="YYYY-MM-DD"
            placeholderTextColor="#999"
            value={returnDate}
            onChangeText={setReturnDate}
            keyboardType="numbers-and-punctuation"
            returnKeyType="done"
            onSubmitEditing={handleAddItem}
           />
          </View>
         </View>

         {}
         <TouchableOpacity
          style={styles.addButton}
          onPress={handleAddItem}
          activeOpacity={0.8}
         >
          <Ionicons name="add-circle-outline" size={20} color="#FFFFFF" />
          <Text style={styles.addButtonText}>Add Item</Text>
         </TouchableOpacity>
        </ScrollView>
       </View>
      </KeyboardAvoidingView>
     </View>
    </TouchableWithoutFeedback>
   </Modal>
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
 logoContainer: {
  marginRight: 10,
  backgroundColor: "rgba(255, 255, 255, 0.2)",
  padding: 8,
  borderRadius: 10,
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
  marginTop: 5,
 },

 detailHeader: {
  flexDirection: "row",
  alignItems: "center",
  marginTop: 10,
 },
 backButton: {
  marginRight: 15,
  padding: 5,
  backgroundColor: "rgba(255, 255, 255, 0.2)",
  borderRadius: 10,
 },
 detailHeaderTitle: {
  fontSize: 22,
  fontWeight: "bold",
  color: "#FFFFFF",
  flex: 1,
 },

 detailContent: {
  flex: 1,
  padding: 20,
 },
 detailImageContainer: {
  width: "100%",
  height: 250,
  borderRadius: 15,
  overflow: "hidden",
  marginBottom: 16,
  elevation: 5,
  shadowColor: "#000",
  shadowOffset: {width: 0, height: 2},
  shadowOpacity: 0.25,
  shadowRadius: 3.84,
 },
 detailImage: {
  width: "100%",
  height: "100%",
 },
 detailImagePlaceholder: {
  width: "100%",
  height: "100%",
  backgroundColor: "#E3F2FD",
  justifyContent: "center",
  alignItems: "center",
  borderWidth: 2,
  borderColor: "#00b4d8",
  borderStyle: "dashed",
  borderRadius: 15,
 },
 noImageText: {
  color: "#00b4d8",
  marginTop: 10,
  fontSize: 16,
  opacity: 0.5,
 },
 detailStatusContainer: {
  alignItems: "flex-start",
  marginBottom: 20,
 },
 detailStatusBadge: {
  flexDirection: "row",
  alignItems: "center",
  padding: 20,
  borderRadius: 10,
  elevation: 3,
  shadowColor: "#000",
  shadowOffset: {width: 0, height: 2},
  shadowOpacity: 0.2,
  shadowRadius: 2,
  width: "100%",
 },
 detailStatusText: {
  color: "#FFFFFF",
  fontSize: 16,
  fontWeight: "bold",
  marginLeft: 8,
  textTransform: "uppercase",
 },
 detailsCard: {
  backgroundColor: "#FFFFFF",
  borderRadius: 15,
  padding: 20,
  marginBottom: 20,
  elevation: 3,
  shadowColor: "#000",
  shadowOffset: {width: 0, height: 1},
  shadowOpacity: 0.1,
  shadowRadius: 2,
 },
 detailsCardTitle: {
  fontSize: 18,
  fontWeight: "bold",
  color: "#333",
  marginBottom: 20,
  paddingBottom: 10,
  borderBottomWidth: 2,
  borderBottomColor: "#00b4d8",
 },
 detailRow: {
  flexDirection: "row",
  alignItems: "center",
  paddingVertical: 12,
 },
 detailIconContainer: {
  width: 45,
  height: 45,
  borderRadius: 12,
  backgroundColor: "#E3F2FD",
  justifyContent: "center",
  alignItems: "center",
  marginRight: 15,
 },
 overdueIconBg: {
  backgroundColor: "#FFEBEE",
 },
 detailInfo: {
  flex: 1,
 },
 detailLabel: {
  fontSize: 12,
  color: "#999",
  marginBottom: 4,
  textTransform: "uppercase",
  fontWeight: "600",
 },
 detailValue: {
  fontSize: 16,
  color: "#333",
  fontWeight: "500",
 },
 overdueValue: {
  color: "#FF4444",
  fontWeight: "bold",
 },
 divider: {
  height: 1,
  backgroundColor: "#F0F0F0",
  marginLeft: 60,
 },
 actionButtons: {
  gap: 12,
  marginBottom: 30,
 },
 markReturnedButton: {
  backgroundColor: "#34a0a4",
  paddingVertical: 16,
  borderRadius: 12,
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  elevation: 3,
  shadowColor: "#4CAF50",
  shadowOffset: {width: 0, height: 2},
  shadowOpacity: 0.3,
  shadowRadius: 3,
 },
 returnedBadge: {
  backgroundColor: "#4CAF50",
  paddingVertical: 16,
  borderRadius: 12,
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  opacity: 0.7,
 },
 deleteButton: {
  backgroundColor: "#b5179e",
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
 actionButtonText: {
  color: "#FFFFFF",
  fontSize: 16,
  fontWeight: "bold",
  marginLeft: 8,
 },

 listContainer: {
  padding: 16,
  paddingBottom: 80,
 },
 itemCard: {
  backgroundColor: "#FFFFFF",
  borderRadius: 12,
  padding: 12,
  marginBottom: 12,
  elevation: 3,
  shadowColor: "#000",
  shadowOffset: {width: 0, height: 1},
  shadowOpacity: 0.1,
  shadowRadius: 2,
 },
 itemCardContent: {
  flexDirection: "row",
 },
 itemImageContainer: {
  width: 70,
  height: 70,
  borderRadius: 10,
  overflow: "hidden",
  marginRight: 12,
  backgroundColor: "#F0F0F0",
 },
 itemImage: {
  width: "100%",
  height: "100%",
 },
 itemImagePlaceholder: {
  width: 70,
  height: 70,
  borderRadius: 10,
  marginRight: 12,
  backgroundColor: "#F0F8FF",
  justifyContent: "center",
  alignItems: "center",
  borderWidth: 1,
  borderColor: "#E0E0E0",
  borderStyle: "dashed",
 },
 itemDetails: {
  flex: 1,
  justifyContent: "space-between",
 },
 itemHeader: {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "flex-start",
  marginBottom: 8,
 },
 itemInfo: {
  flex: 1,
  marginRight: 8,
 },
 itemName: {
  fontSize: 16,
  fontWeight: "bold",
  color: "#333",
  marginBottom: 3,
 },
 borrowerName: {
  fontSize: 13,
  color: "#666",
 },
 statusBadge: {
  flexDirection: "row",
  alignItems: "center",
  paddingHorizontal: 8,
  paddingVertical: 3,
  borderRadius: 10,
 },
 statusText: {
  color: "#FFFFFF",
  fontSize: 11,
  fontWeight: "600",
  marginLeft: 3,
  textTransform: "capitalize",
 },
 itemFooter: {
  flexDirection: "row",
  justifyContent: "space-between",
  borderTopWidth: 1,
  borderTopColor: "#F0F0F0",
  paddingTop: 8,
 },
 dateInfo: {
  flexDirection: "row",
  alignItems: "center",
 },
 dateText: {
  fontSize: 11,
  color: "#666",
  marginLeft: 4,
 },
 overdueText: {
  color: "#FF4444",
  fontWeight: "600",
 },
 fab: {
  position: "absolute",
  right: 20,
  bottom: 20,
  width: 60,
  height: 60,
  borderRadius: 30,
  backgroundColor: "#00b4d8",
  justifyContent: "center",
  alignItems: "center",
  elevation: 8,
  shadowColor: "#000",
  shadowOffset: {width: 0, height: 4},
  shadowOpacity: 0.3,
  shadowRadius: 4.65,
 },
 emptyState: {
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
  paddingHorizontal: 40,
 },
 emptyText: {
  fontSize: 20,
  fontWeight: "bold",
  color: "#333",
  marginTop: 16,
 },
 emptySubText: {
  fontSize: 14,
  color: "#666",
  marginTop: 8,
  textAlign: "center",
 },

 modalOverlay: {
  flex: 1,
  backgroundColor: "rgba(0, 0, 0, 0.5)",
  justifyContent: "flex-end",
 },
 keyboardAvoidingView: {
  flex: 1,
  justifyContent: "flex-end",
 },
 modalContainer: {
  backgroundColor: "#FFFFFF",
  borderTopLeftRadius: 30,
  borderTopRightRadius: 30,
  paddingHorizontal: 20,
  paddingTop: 20,
  paddingBottom: 40,
  maxHeight: height * 0.85,
 },
 modalHeader: {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 20,
  paddingBottom: 10,
  borderBottomWidth: 1,
  borderBottomColor: "#F0F0F0",
 },
 modalTitle: {
  fontSize: 24,
  fontWeight: "bold",
  color: "#333",
 },
 closeButton: {
  padding: 5,
  borderRadius: 20,
  backgroundColor: "#F5F5F5",
  width: 34,
  height: 34,
  justifyContent: "center",
  alignItems: "center",
 },
 scrollContent: {
  paddingBottom: 20,
 },
 imagePicker: {
  width: "100%",
  height: 150,
  borderRadius: 12,
  borderWidth: 2,
  borderColor: "#00b4d8",
  borderStyle: "dashed",
  marginBottom: 20,
  overflow: "hidden",
 },
 imagePlaceholder: {
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
 },
 imagePlaceholderText: {
  color: "#00b4d8",
  marginTop: 8,
  fontSize: 14,
 },
 pickedImage: {
  width: "100%",
  height: "100%",
 },
 inputGroup: {
  marginBottom: 16,
 },
 inputLabel: {
  fontSize: 14,
  fontWeight: "600",
  color: "#333",
  marginBottom: 8,
 },
 inputContainer: {
  flexDirection: "row",
  alignItems: "center",
  backgroundColor: "#F8F9FA",
  borderRadius: 12,
  borderWidth: 1,
  borderColor: "#E0E0E0",
 },
 inputIcon: {
  paddingLeft: 15,
 },
 input: {
  flex: 1,
  paddingVertical: 12,
  paddingHorizontal: 10,
  fontSize: 16,
  color: "#333",
 },
 addButton: {
  backgroundColor: "#00b4d8",
  paddingVertical: 14,
  borderRadius: 12,
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  marginTop: 10,
  elevation: 3,
  shadowColor: "#00b4d8",
  shadowOffset: {width: 0, height: 2},
  shadowOpacity: 0.3,
  shadowRadius: 3,
 },
 addButtonText: {
  color: "#FFFFFF",
  fontSize: 16,
  fontWeight: "bold",
  marginLeft: 8,
 },
});
