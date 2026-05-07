import AsyncStorage from "@react-native-async-storage/async-storage";

export interface BorrowedItem {
 id: string;
 itemName: string;
 borrowerName: string;
 dateBorrowed: string;
 returnDate: string;
 imageUri?: string;
 status: "borrowed" | "returned" | "overdue";
 createdAt: string;
 returnedAt?: string;
 userId: string;
}

const ITEMS_KEY = "@borrowtrack_items";

export const itemService = {
 // Add new borrowed item
 addItem: async (
  item: Omit<BorrowedItem, "id" | "createdAt" | "status">,
 ): Promise<BorrowedItem> => {
  const items = await itemService.getAllItems();

  // Check if the item is already overdue based on return date
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const returnDate = new Date(item.returnDate);
  returnDate.setHours(0, 0, 0, 0);

  const newItem: BorrowedItem = {
   ...item,
   id: Date.now().toString(),
   status: returnDate < today ? "overdue" : "borrowed",
   createdAt: new Date().toISOString(),
  };

  items.push(newItem);
  await AsyncStorage.setItem(ITEMS_KEY, JSON.stringify(items));
  return newItem;
 },

 // Get all items for current user
 getAllItems: async (userId?: string): Promise<BorrowedItem[]> => {
  const itemsJson = await AsyncStorage.getItem(ITEMS_KEY);
  const allItems: BorrowedItem[] = itemsJson ? JSON.parse(itemsJson) : [];

  if (userId) {
   return allItems.filter((item) => item.userId === userId);
  }
  return allItems;
 },

 // Get active (borrowed) items
 getActiveItems: async (userId?: string): Promise<BorrowedItem[]> => {
  const items = await itemService.getAllItems(userId);
  return items.filter((item) => item.status !== "returned");
 },

 // Get overdue items
 getOverdueItems: async (userId?: string): Promise<BorrowedItem[]> => {
  await itemService.checkOverdueItems(); // Check and update overdue status first
  const items = await itemService.getAllItems(userId);
  return items.filter((item) => item.status === "overdue");
 },

 // Get returned items (history)
 getReturnedItems: async (userId?: string): Promise<BorrowedItem[]> => {
  const items = await itemService.getAllItems(userId);
  return items.filter((item) => item.status === "returned");
 },

 // Get item by ID
 getItemById: async (itemId: string): Promise<BorrowedItem | null> => {
  const items = await itemService.getAllItems();
  return items.find((item) => item.id === itemId) || null;
 },

 // Update item status
 updateItemStatus: async (
  itemId: string,
  status: "borrowed" | "returned" | "overdue",
 ): Promise<void> => {
  const items = await itemService.getAllItems();
  const itemIndex = items.findIndex((item) => item.id === itemId);

  if (itemIndex !== -1) {
   items[itemIndex].status = status;

   if (status === "returned") {
    items[itemIndex].returnedAt = new Date().toISOString();
   }

   await AsyncStorage.setItem(ITEMS_KEY, JSON.stringify(items));
  }
 },

 // Restore item to dashboard
 restoreItem: async (itemId: string): Promise<void> => {
  const items = await itemService.getAllItems();
  const itemIndex = items.findIndex((item) => item.id === itemId);

  if (itemIndex !== -1) {
   const today = new Date();
   today.setHours(0, 0, 0, 0);
   const returnDate = new Date(items[itemIndex].returnDate);
   returnDate.setHours(0, 0, 0, 0);

   items[itemIndex].status = returnDate < today ? "overdue" : "borrowed";
   items[itemIndex].returnedAt = undefined;
   await AsyncStorage.setItem(ITEMS_KEY, JSON.stringify(items));
  }
 },

 // Check for overdue items and update their status
 checkOverdueItems: async (): Promise<void> => {
  const items = await itemService.getAllItems();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let hasUpdates = false;

  items.forEach((item) => {
   if (item.status === "borrowed") {
    const returnDate = new Date(item.returnDate);
    returnDate.setHours(0, 0, 0, 0);
    if (returnDate < today) {
     item.status = "overdue";
     hasUpdates = true;
    }
   }
  });

  if (hasUpdates) {
   await AsyncStorage.setItem(ITEMS_KEY, JSON.stringify(items));
  }
 },

 // Delete item
 deleteItem: async (itemId: string): Promise<void> => {
  const items = await itemService.getAllItems();
  const filteredItems = items.filter((item) => item.id !== itemId);
  await AsyncStorage.setItem(ITEMS_KEY, JSON.stringify(filteredItems));
 },
};
