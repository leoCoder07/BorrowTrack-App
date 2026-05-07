import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import {
 Alert,
 Dimensions,
 FlatList,
 Image,
 Platform,
 ScrollView,
 StatusBar,
 StyleSheet,
 Text,
 TextInput,
 TouchableOpacity,
 View,
} from "react-native";
import { BorrowedItem, itemService } from "../../services/itemService";
import { userService } from "../../services/userService";

const {width} = Dimensions.get("window");
const CARD_SIZE = (width - 56) / 2;

type SortOrder = "asc" | "desc";

export default function NotificationsScreen() {
 const [items, setItems] = useState<BorrowedItem[]>([]);
 const [currentUser, setCurrentUser] = useState<any>(null);
 const [searchQuery, setSearchQuery] = useState("");
 const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
 const [selectedItem, setSelectedItem] = useState<BorrowedItem | null>(null);

 useFocusEffect(
  useCallback(() => {
   loadOverdueItems();
  }, []),
 );

 const loadOverdueItems = async () => {
  const user = await userService.getCurrentUser();
  setCurrentUser(user);
  if (user) {
   await itemService.checkOverdueItems();
   const overdueItems = await itemService.getOverdueItems(user.id);
   setItems(overdueItems);
  }
 };

 const handleMarkAsReturned = (item: BorrowedItem) => {
  Alert.alert(
   "Mark as Returned",
   `Has "${item.itemName}" been returned by ${item.borrowerName}?`,
   [
    {text: "Cancel", style: "cancel"},
    {
     text: "Yes, Mark Returned",
     onPress: async () => {
      await itemService.updateItemStatus(item.id, "returned");
      setSelectedItem(null);
      await loadOverdueItems();
      Alert.alert("Success", "Item marked as returned!");
     },
    },
   ],
  );
 };

 const handleDeleteItem = (item: BorrowedItem) => {
  Alert.alert(
   "Delete Item",
   `Are you sure you want to delete "${item.itemName}"? This cannot be undone.`,
   [
    {text: "Cancel", style: "cancel"},
    {
     text: "Delete",
     style: "destructive",
     onPress: async () => {
      await itemService.deleteItem(item.id);
      if (selectedItem?.id === item.id) {
       setSelectedItem(null);
      }
      await loadOverdueItems();
      Alert.alert("Deleted", "Item has been deleted");
     },
    },
   ],
  );
 };

 const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
   year: "numeric",
   month: "short",
   day: "numeric",
  });
 };

 const getDaysOverdue = (returnDate: string) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const returnBy = new Date(returnDate);
  returnBy.setHours(0, 0, 0, 0);
  const diffTime = today.getTime() - returnBy.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
 };

 const getFilteredAndSortedItems = () => {
  let filtered = [...items];

  if (searchQuery.trim()) {
   const query = searchQuery.toLowerCase();
   filtered = filtered.filter(
    (item) =>
     item.itemName.toLowerCase().includes(query) ||
     item.borrowerName.toLowerCase().includes(query),
   );
  }

  filtered.sort((a, b) => {
   const dateA = new Date(a.returnDate).getTime();
   const dateB = new Date(b.returnDate).getTime();
   return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
  });

  return filtered;
 };

 const filteredItems = getFilteredAndSortedItems();

 const renderNotificationCard = ({item}: {item: BorrowedItem}) => {
  const daysOverdue = getDaysOverdue(item.returnDate);

  return (
   <TouchableOpacity
    style={styles.notificationCard}
    onPress={() => setSelectedItem(item)}
    activeOpacity={0.7}
   >
    {/* Image */}
    <View style={styles.cardImageContainer}>
     {item.imageUri ? (
      <Image
       source={{uri: item.imageUri}}
       style={styles.cardImage}
       resizeMode="cover"
      />
     ) : (
      <View style={styles.cardImagePlaceholder}>
       <MaterialCommunityIcons
        name="package-variant"
        size={35}
        color="#FF6B6B"
        opacity={0.5}
       />
      </View>
     )}
     {/* Days Overdue Badge */}
     <View style={styles.daysOverdueBadge}>
      <Text style={styles.daysOverdueText}>{daysOverdue}d</Text>
     </View>
    </View>

    {/* Content */}
    <View style={styles.cardContent}>
     <Text style={styles.cardItemName} numberOfLines={1}>
      {item.itemName}
     </Text>
     <Text style={styles.cardBorrowerName} numberOfLines={1}>
      <Ionicons name="person-outline" size={11} color="#FF9999" />{" "}
      {item.borrowerName}
     </Text>
     <View style={styles.cardDates}>
      <Text style={styles.cardDateLabel}>Return by:</Text>
      <Text style={styles.cardReturnDate}>{item.returnDate}</Text>
     </View>
    </View>
   </TouchableOpacity>
  );
 };

 if (selectedItem) {
  const daysOverdue = getDaysOverdue(selectedItem.returnDate);

  return (
   <View style={styles.container}>
    <StatusBar backgroundColor="#FF4444" barStyle="light-content" />

    {/* Header */}
    <View style={styles.detailHeader}>
     <View style={styles.detailHeaderRow}>
      <TouchableOpacity
       onPress={() => setSelectedItem(null)}
       style={styles.backButton}
      >
       <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
      </TouchableOpacity>
      <View style={styles.detailHeaderText}>
       <Text style={styles.detailHeaderReturn}>
        Return by {selectedItem.returnDate}
       </Text>
       <Text style={styles.detailHeaderBorrower}>
        {selectedItem.borrowerName}
       </Text>
      </View>
     </View>
    </View>

    <ScrollView
     style={styles.detailContent}
     showsVerticalScrollIndicator={false}
    >
     {/* Image Section */}
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
         color="#FF6B6B"
         opacity={0.3}
        />
        <Text style={styles.noImageText}>No Image Available</Text>
       </View>
      )}
     </View>

     {/* Action Message */}
     <View style={styles.actionMessageCard}>
      <View style={styles.actionIconContainer}>
       <Ionicons name="warning" size={30} color="#FF4444" />
      </View>
      <Text style={styles.actionMessageTitle}>Action Required!</Text>
      <Text style={styles.actionMessageText}>
       This item is{" "}
       <Text style={styles.actionMessageBold}>{daysOverdue} days</Text> overdue.
       Please contact{" "}
       <Text style={styles.actionMessageBold}>{selectedItem.borrowerName}</Text>{" "}
       to return{" "}
       <Text style={styles.actionMessageBold}>{selectedItem.itemName}</Text> as
       soon as possible.
      </Text>
     </View>

     {/* Details Card */}
     <View style={styles.detailsCard}>
      <Text style={styles.detailsCardTitle}>Item Details</Text>

      <View style={styles.detailRow}>
       <View style={[styles.detailIconContainer, {backgroundColor: "#FFEBEE"}]}>
        <MaterialCommunityIcons
         name="package-variant"
         size={22}
         color="#FF4444"
        />
       </View>
       <View style={styles.detailInfo}>
        <Text style={styles.detailLabel}>Item Name</Text>
        <Text style={styles.detailValue}>{selectedItem.itemName}</Text>
       </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.detailRow}>
       <View style={[styles.detailIconContainer, {backgroundColor: "#FFEBEE"}]}>
        <Ionicons name="person-outline" size={22} color="#FF4444" />
       </View>
       <View style={styles.detailInfo}>
        <Text style={styles.detailLabel}>Borrower</Text>
        <Text style={styles.detailValue}>{selectedItem.borrowerName}</Text>
       </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.detailRow}>
       <View style={[styles.detailIconContainer, {backgroundColor: "#FFEBEE"}]}>
        <Ionicons name="calendar-outline" size={22} color="#FF4444" />
       </View>
       <View style={styles.detailInfo}>
        <Text style={styles.detailLabel}>Date Borrowed</Text>
        <Text style={styles.detailValue}>{selectedItem.dateBorrowed}</Text>
       </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.detailRow}>
       <View style={[styles.detailIconContainer, {backgroundColor: "#FFCDD2"}]}>
        <Ionicons name="alert-circle" size={22} color="#D32F2F" />
       </View>
       <View style={styles.detailInfo}>
        <Text style={styles.detailLabel}>Return Date (Overdue)</Text>
        <Text style={styles.detailValueOverdue}>
         {selectedItem.returnDate} ({daysOverdue} days late)
        </Text>
       </View>
      </View>
     </View>

     {/* Action Buttons */}
     <View style={styles.actionButtons}>
      <TouchableOpacity
       style={styles.markReturnedButton}
       onPress={() => handleMarkAsReturned(selectedItem)}
       activeOpacity={0.8}
      >
       <Ionicons name="checkmark-circle-outline" size={22} color="#FFFFFF" />
       <Text style={styles.actionButtonText}>Mark as Returned</Text>
      </TouchableOpacity>

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
   <StatusBar backgroundColor="#FF4444" barStyle="light-content" />

   {/* Header */}
   <View style={styles.header}>
    <View style={styles.headerTop}>
     <View style={styles.headerTitleRow}>
      <Ionicons
       name="notifications"
       size={28}
       color="#FFFFFF"
       style={styles.headerIcon}
      />
      <Text style={styles.headerTitle}>Alerts</Text>
     </View>
     <Text style={styles.subHeader}>Overdue Items & Reminders</Text>
    </View>
   </View>

   {/* Warning Message */}
   {items.length > 0 && (
    <View style={styles.warningMessage}>
     <Ionicons name="warning" size={20} color="#FFFFFF" />
     <Text style={styles.warningText}>
      You have {items.length} overdue {items.length === 1 ? "item" : "items"}!
      Please take action.
     </Text>
    </View>
   )}

   {/* Search Bar */}
   <View style={styles.searchContainer}>
    <Ionicons
     name="search-outline"
     size={20}
     color="#999"
     style={styles.searchIcon}
    />
    <TextInput
     style={styles.searchInput}
     placeholder="Search overdue items..."
     placeholderTextColor="#999"
     value={searchQuery}
     onChangeText={setSearchQuery}
    />
    {searchQuery.length > 0 && (
     <TouchableOpacity onPress={() => setSearchQuery("")}>
      <Ionicons name="close-circle" size={20} color="#999" />
     </TouchableOpacity>
    )}
   </View>

   {/* Sort Button */}
   <TouchableOpacity
    style={styles.sortButton}
    onPress={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
   >
    <Ionicons
     name={sortOrder === "asc" ? "arrow-up" : "arrow-down"}
     size={20}
     color="#FF4444"
    />
    <Text style={styles.sortButtonText}>
     {sortOrder === "asc" ? "Oldest First" : "Newest First"}
    </Text>
   </TouchableOpacity>

   {/* Items Grid */}
   {filteredItems.length === 0 ? (
    <View style={styles.emptyState}>
     <Ionicons
      name="checkmark-circle-outline"
      size={80}
      color="#4CAF50"
      opacity={0.5}
     />
     <Text style={styles.emptyText}>All Clear!</Text>
     <Text style={styles.emptySubText}>
      {items.length === 0
       ? "No overdue items at the moment"
       : "No items match your search"}
     </Text>
    </View>
   ) : (
    <FlatList
     data={filteredItems}
     renderItem={renderNotificationCard}
     keyExtractor={(item) => item.id}
     numColumns={2}
     columnWrapperStyle={styles.columnWrapper}
     contentContainerStyle={styles.gridContainer}
     showsVerticalScrollIndicator={false}
    />
   )}
  </View>
 );
}

const styles = StyleSheet.create({
 container: {
  flex: 1,
  backgroundColor: "#FFF5F5",
 },
 header: {
  backgroundColor: "#FF4444",
  paddingTop: Platform.OS === "ios" ? 50 : 40,
  paddingBottom: 15,
  paddingHorizontal: 20,
  borderBottomLeftRadius: 20,
  borderBottomRightRadius: 20,
  elevation: 5,
  shadowColor: "#000",
  shadowOffset: {width: 0, height: 2},
  shadowOpacity: 0.25,
  shadowRadius: 3.84,
 },
 headerTop: {
  marginBottom: 5,
 },
 headerTitleRow: {
  flexDirection: "row",
  alignItems: "center",
  marginBottom: 5,
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

 warningMessage: {
  flexDirection: "row",
  alignItems: "center",
  backgroundColor: "#FF6B6B",
  marginHorizontal: 20,
  marginTop: 15,
  padding: 12,
  borderRadius: 10,
  elevation: 3,
  shadowColor: "#FF4444",
  shadowOffset: {width: 0, height: 2},
  shadowOpacity: 0.3,
  shadowRadius: 3,
 },
 warningText: {
  color: "#FFFFFF",
  fontSize: 14,
  fontWeight: "600",
  marginLeft: 10,
  flex: 1,
 },

 searchContainer: {
  flexDirection: "row",
  alignItems: "center",
  backgroundColor: "#FFFFFF",
  marginHorizontal: 20,
  marginTop: 15,
  borderRadius: 12,
  paddingHorizontal: 15,
  elevation: 2,
  shadowColor: "#000",
  shadowOffset: {width: 0, height: 1},
  shadowOpacity: 0.1,
  shadowRadius: 2,
 },
 searchIcon: {
  marginRight: 10,
 },
 searchInput: {
  flex: 1,
  paddingVertical: 12,
  fontSize: 16,
  color: "#333",
 },

 sortButton: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: "#FFFFFF",
  marginHorizontal: 20,
  marginTop: 10,
  paddingVertical: 10,
  borderRadius: 10,
  elevation: 2,
  shadowColor: "#000",
  shadowOffset: {width: 0, height: 1},
  shadowOpacity: 0.1,
  shadowRadius: 2,
 },
 sortButtonText: {
  fontSize: 14,
  color: "#FF4444",
  fontWeight: "600",
  marginLeft: 6,
 },

 gridContainer: {
  padding: 16,
  paddingBottom: 20,
 },
 columnWrapper: {
  justifyContent: "space-between",
  marginBottom: 12,
 },
 notificationCard: {
  width: CARD_SIZE,
  backgroundColor: "#FFFFFF",
  borderRadius: 15,
  overflow: "hidden",
  elevation: 4,
  shadowColor: "#FF4444",
  shadowOffset: {width: 0, height: 2},
  shadowOpacity: 0.2,
  shadowRadius: 4,
 },
 cardImageContainer: {
  width: "100%",
  height: CARD_SIZE * 0.8,
  position: "relative",
 },
 cardImage: {
  width: "100%",
  height: "100%",
 },
 cardImagePlaceholder: {
  width: "100%",
  height: "100%",
  backgroundColor: "#FFE8E8",
  justifyContent: "center",
  alignItems: "center",
 },
 daysOverdueBadge: {
  position: "absolute",
  top: 8,
  right: 8,
  backgroundColor: "#FF4444",
  paddingHorizontal: 8,
  paddingVertical: 4,
  borderRadius: 12,
  elevation: 3,
 },
 daysOverdueText: {
  color: "#FFFFFF",
  fontSize: 12,
  fontWeight: "bold",
 },
 cardContent: {
  padding: 10,
 },
 cardItemName: {
  fontSize: 14,
  fontWeight: "bold",
  color: "#333",
  marginBottom: 4,
 },
 cardBorrowerName: {
  fontSize: 11,
  color: "#FF6B6B",
  marginBottom: 8,
 },
 cardDates: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  borderTopWidth: 1,
  borderTopColor: "#FFE8E8",
  paddingTop: 8,
 },
 cardDateLabel: {
  fontSize: 10,
  color: "#999",
  fontWeight: "600",
 },
 cardReturnDate: {
  fontSize: 11,
  color: "#FF4444",
  fontWeight: "bold",
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

 detailHeader: {
  backgroundColor: "#FF4444",
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
 detailHeaderRow: {
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
 detailHeaderText: {
  flex: 1,
 },
 detailHeaderReturn: {
  fontSize: 20,
  fontWeight: "bold",
  color: "#FFFFFF",
 },
 detailHeaderBorrower: {
  fontSize: 14,
  color: "#FFFFFF",
  opacity: 0.8,
  marginTop: 3,
 },

 detailContent: {
  flex: 1,
  padding: 20,
 },
 detailImageContainer: {
  width: "100%",
  height: 220,
  borderRadius: 15,
  overflow: "hidden",
  marginBottom: 16,
  elevation: 5,
  shadowColor: "#000",
  shadowOffset: {width: 0, height: 2},
  shadowOpacity: 0.25,
  shadowRadius: 3.84,
  borderWidth: 2,
  borderColor: "#FF4444",
 },
 detailImage: {
  width: "100%",
  height: "100%",
 },
 detailImagePlaceholder: {
  width: "100%",
  height: "100%",
  backgroundColor: "#FFE8E8",
  justifyContent: "center",
  alignItems: "center",
 },
 noImageText: {
  color: "#FF6B6B",
  marginTop: 10,
  fontSize: 16,
  opacity: 0.5,
 },

 actionMessageCard: {
  backgroundColor: "#FFFFFF",
  borderRadius: 15,
  padding: 20,
  marginBottom: 16,
  alignItems: "center",
  borderLeftWidth: 4,
  borderLeftColor: "#FF4444",
  elevation: 3,
  shadowColor: "#000",
  shadowOffset: {width: 0, height: 2},
  shadowOpacity: 0.1,
  shadowRadius: 3,
 },
 actionIconContainer: {
  marginBottom: 10,
 },
 actionMessageTitle: {
  fontSize: 18,
  fontWeight: "bold",
  color: "#FF4444",
  marginBottom: 8,
 },
 actionMessageText: {
  fontSize: 14,
  color: "#666",
  textAlign: "center",
  lineHeight: 20,
 },
 actionMessageBold: {
  fontWeight: "bold",
  color: "#333",
 },

 detailsCard: {
  backgroundColor: "#FFFFFF",
  borderRadius: 15,
  padding: 20,
  marginBottom: 16,
  elevation: 3,
  shadowColor: "#000",
  shadowOffset: {width: 0, height: 2},
  shadowOpacity: 0.1,
  shadowRadius: 3,
 },
 detailsCardTitle: {
  fontSize: 18,
  fontWeight: "bold",
  color: "#333",
  marginBottom: 20,
  paddingBottom: 10,
  borderBottomWidth: 2,
  borderBottomColor: "#FF4444",
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
  justifyContent: "center",
  alignItems: "center",
  marginRight: 15,
 },
 detailInfo: {
  flex: 1,
 },
 detailLabel: {
  fontSize: 11,
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
 detailValueOverdue: {
  fontSize: 16,
  color: "#FF4444",
  fontWeight: "bold",
 },
 divider: {
  height: 1,
  backgroundColor: "#FFE8E8",
  marginLeft: 60,
 },

 actionButtons: {
  gap: 12,
  marginBottom: 30,
 },
 markReturnedButton: {
  backgroundColor: "#4CAF50",
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
 deleteButton: {
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
 actionButtonText: {
  color: "#FFFFFF",
  fontSize: 16,
  fontWeight: "bold",
  marginLeft: 8,
 },
});
