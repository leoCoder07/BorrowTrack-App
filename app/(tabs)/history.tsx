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

type SortOrder = "asc" | "desc";
type FilterType = "all" | "on_time" | "overdue";

export default function HistoryScreen() {
 const [items, setItems] = useState<BorrowedItem[]>([]);
 const [currentUser, setCurrentUser] = useState<any>(null);
 const [searchQuery, setSearchQuery] = useState("");
 const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
 const [filterType, setFilterType] = useState<FilterType>("all");
 const [selectedItem, setSelectedItem] = useState<BorrowedItem | null>(null);
 const [isLoading, setIsLoading] = useState(false);

 useFocusEffect(
  useCallback(() => {
   loadHistory();
  }, []),
 );

 const loadHistory = async () => {
  setIsLoading(true);
  const user = await userService.getCurrentUser();
  setCurrentUser(user);
  if (user) {
   const returnedItems = await itemService.getReturnedItems(user.id);
   setItems(returnedItems);
  }
  setIsLoading(false);
 };

 const handleDeleteItem = (item: BorrowedItem) => {
  Alert.alert(
   "Delete Record",
   `Are you sure you want to permanently delete "${item.itemName}"? This action cannot be undone.`,
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
      await loadHistory();
      Alert.alert("Deleted", "Record has been permanently deleted");
     },
    },
   ],
  );
 };

 const handleRestoreItem = (item: BorrowedItem) => {
  Alert.alert(
   "Restore to Dashboard",
   `Move "${item.itemName}" back to active borrowed items?`,
   [
    {text: "Cancel", style: "cancel"},
    {
     text: "Restore",
     onPress: async () => {
      await itemService.restoreItem(item.id);
      setSelectedItem(null);
      await loadHistory();
      Alert.alert("Restored", "Item has been moved back to dashboard");
     },
    },
   ],
  );
 };

 const isOnTime = (item: BorrowedItem) => {
  if (!item.returnDate || !item.returnedAt) return true;
  const returnBy = new Date(item.returnDate);
  const returnedOn = new Date(item.returnedAt);
  return returnedOn <= returnBy;
 };

 const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
   year: "numeric",
   month: "short",
   day: "numeric",
  });
 };

 const formatDateTime = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
   year: "numeric",
   month: "short",
   day: "numeric",
   hour: "2-digit",
   minute: "2-digit",
  });
 };

 const getFilteredAndSortedItems = () => {
  let filtered = [...items];

  if (filterType === "on_time") {
   filtered = filtered.filter((item) => isOnTime(item));
  } else if (filterType === "overdue") {
   filtered = filtered.filter((item) => !isOnTime(item));
  }

  if (searchQuery.trim()) {
   const query = searchQuery.toLowerCase();
   filtered = filtered.filter(
    (item) =>
     item.itemName.toLowerCase().includes(query) ||
     item.borrowerName.toLowerCase().includes(query),
   );
  }

  filtered.sort((a, b) => {
   const dateA = new Date(a.returnedAt || a.createdAt).getTime();
   const dateB = new Date(b.returnedAt || b.createdAt).getTime();
   return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
  });

  return filtered;
 };

 const filteredItems = getFilteredAndSortedItems();

 const renderHistoryItem = ({item}: {item: BorrowedItem}) => (
  <View style={styles.historyCard}>
   <TouchableOpacity
    style={styles.historyCardContent}
    onPress={() => setSelectedItem(item)}
    activeOpacity={0.7}
   >
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
     <View style={styles.itemTopRow}>
      <Text style={styles.itemName} numberOfLines={1}>
       {item.itemName}
      </Text>
      <TouchableOpacity
       onPress={() => handleDeleteItem(item)}
       style={styles.deleteIconButton}
       hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
      >
       <Ionicons name="trash-outline" size={18} color="#FF4444" />
      </TouchableOpacity>
     </View>

     <Text style={styles.borrowerName}>
      <Ionicons name="person-outline" size={12} color="#666" />{" "}
      {item.borrowerName}
     </Text>

     <View style={styles.dateRow}>
      <View style={styles.dateInfo}>
       <Ionicons name="calendar-outline" size={12} color="#666" />
       <Text style={styles.dateText}>B: {item.dateBorrowed}</Text>
      </View>
      <View style={styles.dateInfo}>
       <Ionicons name="calendar-outline" size={12} color="#666" />
       <Text style={styles.dateText}>R: {item.returnDate}</Text>
      </View>
     </View>

     <View style={styles.statusRow}>
      <View
       style={[
        styles.statusIndicator,
        {backgroundColor: isOnTime(item) ? "#4CAF50" : "#FF4444"},
       ]}
      />
      <Text
       style={[
        styles.statusText,
        {color: isOnTime(item) ? "#4CAF50" : "#FF4444"},
       ]}
      >
       {isOnTime(item) ? "On Time" : "Overdue"}
      </Text>
      <Text style={styles.returnedDate}>
       Returned: {formatDate(item.returnedAt || "")}
      </Text>
     </View>
    </View>
   </TouchableOpacity>
  </View>
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
      <View style={styles.detailHeaderText}>
       <Text style={styles.detailHeaderTitle} numberOfLines={1}>
        {selectedItem.itemName}
       </Text>
       <Text style={styles.detailHeaderSubtitle}>
        {selectedItem.borrowerName}
       </Text>
      </View>
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
        {backgroundColor: isOnTime(selectedItem) ? "#4CAF50" : "#FF4444"},
       ]}
      >
       <Ionicons
        name={isOnTime(selectedItem) ? "checkmark-circle" : "alert-circle"}
        size={20}
        color="#FFF"
       />
       <Text style={styles.detailStatusText}>
        {isOnTime(selectedItem) ? "Returned On Time" : "Returned Late"}
       </Text>
      </View>
     </View>

     {}
     <View style={styles.detailsCard}>
      <Text style={styles.detailsCardTitle}>Return Information</Text>

      <View style={styles.detailRow}>
       <View style={styles.detailIconContainer}>
        <Ionicons name="checkmark-circle-outline" size={22} color="#4CAF50" />
       </View>
       <View style={styles.detailInfo}>
        <Text style={styles.detailLabel}>Marked as Returned</Text>
        <Text style={styles.detailValue}>
         {selectedItem.returnedAt
          ? formatDateTime(selectedItem.returnedAt)
          : "Unknown"}
        </Text>
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
         name={isOnTime(selectedItem) ? "calendar-outline" : "alert-circle"}
         size={22}
         color={isOnTime(selectedItem) ? "#00b4d8" : "#FF4444"}
        />
       </View>
       <View style={styles.detailInfo}>
        <Text style={styles.detailLabel}>Expected Return Date</Text>
        <Text
         style={[
          styles.detailValue,
          !isOnTime(selectedItem) && styles.overdueValue,
         ]}
        >
         {selectedItem.returnDate}
        </Text>
       </View>
      </View>
     </View>

     {}
     <View style={styles.actionButtons}>
      <TouchableOpacity
       style={styles.restoreButton}
       onPress={() => handleRestoreItem(selectedItem)}
       activeOpacity={0.8}
      >
       <Ionicons name="refresh-outline" size={22} color="#FFFFFF" />
       <Text style={styles.actionButtonText}>Restore to Dashboard</Text>
      </TouchableOpacity>

      <TouchableOpacity
       style={styles.deleteButton}
       onPress={() => handleDeleteItem(selectedItem)}
       activeOpacity={0.8}
      >
       <Ionicons name="trash-outline" size={22} color="#FFFFFF" />
       <Text style={styles.actionButtonText}>Delete Permanently</Text>
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
    <View style={styles.headerTop}>
     <View style={styles.headerTitleRow}>
      <MaterialCommunityIcons
       name="history"
       size={28}
       color="#FFFFFF"
       style={styles.headerIcon}
      />
      <Text style={styles.headerTitle}>History</Text>
     </View>
     <Text style={styles.subHeader}>Past Transactions & Records</Text>
    </View>
   </View>

   {}
   <View style={styles.searchContainer}>
    <Ionicons
     name="search-outline"
     size={20}
     color="#999"
     style={styles.searchIcon}
    />
    <TextInput
     style={styles.searchInput}
     placeholder="Search items or borrowers..."
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

   {}
   <View style={styles.controlsContainer}>
    <View style={styles.filterButtons}>
     <TouchableOpacity
      style={[
       styles.filterButton,
       filterType === "all" && styles.filterButtonActive,
      ]}
      onPress={() => setFilterType("all")}
     >
      <Text
       style={[
        styles.filterButtonText,
        filterType === "all" && styles.filterButtonTextActive,
       ]}
      >
       All
      </Text>
     </TouchableOpacity>
     <TouchableOpacity
      style={[
       styles.filterButton,
       filterType === "on_time" && styles.onTimeButtonActive,
      ]}
      onPress={() => setFilterType("on_time")}
     >
      <Text
       style={[
        styles.filterButtonText,
        filterType === "on_time" && styles.filterButtonTextActive,
       ]}
      >
       On Time
      </Text>
     </TouchableOpacity>
     <TouchableOpacity
      style={[
       styles.filterButton,
       filterType === "overdue" && styles.overdueButtonActive,
      ]}
      onPress={() => setFilterType("overdue")}
     >
      <Text
       style={[
        styles.filterButtonText,
        filterType === "overdue" && styles.filterButtonTextActive,
       ]}
      >
       Overdue
      </Text>
     </TouchableOpacity>
    </View>

    <TouchableOpacity
     style={styles.sortButton}
     onPress={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
    >
     <Ionicons
      name={sortOrder === "asc" ? "arrow-up" : "arrow-down"}
      size={20}
      color="#00b4d8"
     />
     <Text style={styles.sortButtonText}>
      {sortOrder === "asc" ? "Oldest First" : "Newest First"}
     </Text>
    </TouchableOpacity>
   </View>

   {}
   {filteredItems.length === 0 ? (
    <View style={styles.emptyState}>
     <MaterialCommunityIcons
      name="archive-outline"
      size={80}
      color="#00b4d8"
      opacity={0.3}
     />
     <Text style={styles.emptyText}>No history records</Text>
     <Text style={styles.emptySubText}>
      {items.length === 0
       ? "Items marked as returned will appear here"
       : "No items match your current filters"}
     </Text>
    </View>
   ) : (
    <FlatList
     data={filteredItems}
     renderItem={renderHistoryItem}
     keyExtractor={(item) => item.id}
     contentContainerStyle={styles.listContainer}
     showsVerticalScrollIndicator={false}
    />
   )}
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

 controlsContainer: {
  paddingHorizontal: 20,
  marginTop: 15,
  marginBottom: 5,
 },
 filterButtons: {
  flexDirection: "row",
  backgroundColor: "#FFFFFF",
  borderRadius: 12,
  padding: 4,
  marginBottom: 10,
  elevation: 2,
  shadowColor: "#000",
  shadowOffset: {width: 0, height: 1},
  shadowOpacity: 0.1,
  shadowRadius: 2,
 },
 filterButton: {
  flex: 1,
  paddingVertical: 8,
  borderRadius: 10,
  alignItems: "center",
 },
 filterButtonActive: {
  backgroundColor: "#00b4d8",
 },
 onTimeButtonActive: {
  backgroundColor: "#4CAF50",
 },
 overdueButtonActive: {
  backgroundColor: "#FF4444",
 },
 filterButtonText: {
  fontSize: 13,
  fontWeight: "600",
  color: "#666",
 },
 filterButtonTextActive: {
  color: "#FFFFFF",
 },
 sortButton: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: "#FFFFFF",
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
  color: "#00b4d8",
  fontWeight: "600",
  marginLeft: 6,
 },

 listContainer: {
  padding: 16,
  paddingBottom: 20,
 },
 historyCard: {
  backgroundColor: "#FFFFFF",
  borderRadius: 12,
  padding: 12,
  marginBottom: 10,
  elevation: 2,
  shadowColor: "#000",
  shadowOffset: {width: 0, height: 1},
  shadowOpacity: 0.1,
  shadowRadius: 2,
 },
 historyCardContent: {
  flexDirection: "row",
 },
 itemImageContainer: {
  width: 60,
  height: 60,
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
  width: 60,
  height: 60,
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
 },
 itemTopRow: {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 3,
 },
 itemName: {
  fontSize: 15,
  fontWeight: "bold",
  color: "#333",
  flex: 1,
  marginRight: 8,
 },
 deleteIconButton: {
  padding: 2,
 },
 borrowerName: {
  fontSize: 12,
  color: "#666",
  marginBottom: 6,
 },
 dateRow: {
  flexDirection: "row",
  justifyContent: "space-between",
  marginBottom: 6,
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
 statusRow: {
  flexDirection: "row",
  alignItems: "center",
  borderTopWidth: 1,
  borderTopColor: "#F0F0F0",
  paddingTop: 6,
 },
 statusIndicator: {
  width: 8,
  height: 8,
  borderRadius: 4,
  marginRight: 6,
 },
 statusText: {
  fontSize: 12,
  fontWeight: "600",
  flex: 1,
 },
 returnedDate: {
  fontSize: 11,
  color: "#999",
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
 detailHeaderTitle: {
  fontSize: 22,
  fontWeight: "bold",
  color: "#FFFFFF",
 },
 detailHeaderSubtitle: {
  fontSize: 14,
  color: "#FFFFFF",
  opacity: 0.8,
  marginTop: 2,
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
  alignItems: "center",
  marginBottom: 20,
 },
 detailStatusBadge: {
  flexDirection: "row",
  alignItems: "center",
  paddingHorizontal: 20,
  paddingVertical: 10,
  borderRadius: 20,
  elevation: 3,
  shadowColor: "#000",
  shadowOffset: {width: 0, height: 2},
  shadowOpacity: 0.2,
  shadowRadius: 2,
 },
 detailStatusText: {
  color: "#FFFFFF",
  fontSize: 16,
  fontWeight: "bold",
  marginLeft: 8,
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
 restoreButton: {
  backgroundColor: "#00b4d8",
  paddingVertical: 16,
  borderRadius: 12,
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  elevation: 3,
  shadowColor: "#00b4d8",
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
