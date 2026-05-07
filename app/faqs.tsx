import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
 LayoutAnimation,
 Platform,
 SafeAreaView,
 ScrollView,
 StatusBar,
 StyleSheet,
 Text,
 TouchableOpacity,
 UIManager,
 View,
} from "react-native";

if (
 Platform.OS === "android" &&
 UIManager.setLayoutAnimationEnabledExperimental
) {
 UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface FAQItem {
 id: number;
 question: string;
 answer: string;
}

export default function FAQsScreen() {
 const [expandedId, setExpandedId] = useState<number | null>(null);

 const faqs: FAQItem[] = [
  {
   id: 1,
   question: "What is BorrowTrack?",
   answer:
    "BorrowTrack is a mobile application designed to help you keep track of items you've lent to others. It helps you monitor borrowed items, set return dates, and receive notifications for overdue items.",
  },
  {
   id: 2,
   question: "How do I add a borrowed item?",
   answer:
    'Go to the Home tab and tap the "+" button at the bottom-right corner. Fill in the item details including item name, borrower name, date borrowed, and expected return date. You can also take a photo of the item for better tracking.',
  },
  {
   id: 3,
   question: "How do I mark an item as returned?",
   answer:
    'You can mark an item as returned in two ways:\n\n1. From the Home tab: Tap on the item and click "Mark as Returned"\n\n2. From the Alerts tab: If the item is overdue, tap on it and click "Mark as Returned"\n\nThe item will then move to your History tab.',
  },
  {
   id: 4,
   question: "What happens when an item is overdue?",
   answer:
    "When an item's return date has passed, it will automatically appear in the Alerts tab with a red indicator. You'll see how many days the item is overdue, and you can take action by contacting the borrower or marking it as returned.",
  },
  {
   id: 5,
   question: "Can I restore an item from history?",
   answer:
    'Yes! If you accidentally marked an item as returned, or need to restore it for any reason:\n\n1. Go to the History tab\n2. Tap on the item\n3. Click "Restore to Dashboard"\n\nThe item will be moved back to your active borrowed items.',
  },
  {
   id: 6,
   question: "How do I delete an item?",
   answer:
    'You can delete items from the Home tab or History tab by tapping on the item and selecting "Delete". Please note that deleting an item is permanent and cannot be undone.',
  },
  {
   id: 7,
   question: "Is my data stored securely?",
   answer:
    "Your data is stored locally on your device using AsyncStorage. This means your information stays on your phone and is not uploaded to any server. However, this also means your data won't sync across devices.",
  },
  {
   id: 8,
   question: "Can I add a photo to my items?",
   answer:
    "Yes! When adding a new item, you can take a photo using your camera or choose one from your gallery. This helps you visually identify the item you've lent out.",
  },
  {
   id: 9,
   question: "How do I change my profile picture?",
   answer:
    "Go to the Profile tab and tap on your profile picture or the camera icon. You can choose to take a new photo or select one from your gallery.",
  },
  {
   id: 10,
   question: "Can I use BorrowTrack offline?",
   answer:
    "Yes! BorrowTrack works completely offline since all data is stored locally on your device. You don't need an internet connection to use the app.",
  },
 ];

 const toggleExpand = (id: number) => {
  LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  setExpandedId(expandedId === id ? null : id);
 };

 return (
  <SafeAreaView style={styles.container}>
   <StatusBar barStyle="dark-content" backgroundColor="#F5F5F5" />

   {/* Header */}
   <View style={styles.header}>
    <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
     <Ionicons name="arrow-back" size={24} color="#00b4d8" />
    </TouchableOpacity>
    <Text style={styles.headerTitle}>FAQs</Text>
    <View style={{width: 40}} />
   </View>

   <ScrollView
    style={styles.scrollView}
    contentContainerStyle={styles.scrollContent}
    showsVerticalScrollIndicator={false}
   >
    <Text style={styles.subtitle}>Frequently Asked Questions</Text>

    {faqs.map((faq) => (
     <View key={faq.id} style={styles.faqCard}>
      <TouchableOpacity
       style={styles.faqHeader}
       onPress={() => toggleExpand(faq.id)}
       activeOpacity={0.7}
      >
       <View style={styles.faqQuestionContainer}>
        <View style={styles.faqNumberBadge}>
         <Text style={styles.faqNumber}>{faq.id}</Text>
        </View>
        <Text style={styles.faqQuestion}>{faq.question}</Text>
       </View>
       <Ionicons
        name={expandedId === faq.id ? "chevron-up" : "chevron-down"}
        size={20}
        color="#00b4d8"
       />
      </TouchableOpacity>

      {expandedId === faq.id && (
       <View style={styles.faqAnswer}>
        <View style={styles.faqAnswerDivider} />
        <Text style={styles.faqAnswerText}>{faq.answer}</Text>
       </View>
      )}
     </View>
    ))}

    {/* Contact Section */}
    <View style={styles.contactCard}>
     <Ionicons name="chatbubble-ellipses-outline" size={32} color="#00b4d8" />
     <Text style={styles.contactTitle}>Still have questions?</Text>
     <Text style={styles.contactText}>
      Feel free to reach out to our support team for assistance.
     </Text>
     <Text style={styles.contactEmail}>support@borrowtrack.app</Text>
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
  padding: 20,
 },
 subtitle: {
  fontSize: 16,
  color: "#666",
  marginBottom: 20,
  textAlign: "center",
 },
 faqCard: {
  backgroundColor: "#FFFFFF",
  borderRadius: 16,
  marginBottom: 12,
  elevation: 2,
  shadowColor: "#000",
  shadowOffset: {width: 0, height: 1},
  shadowOpacity: 0.08,
  shadowRadius: 4,
  overflow: "hidden",
 },
 faqHeader: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  padding: 16,
 },
 faqQuestionContainer: {
  flexDirection: "row",
  alignItems: "center",
  flex: 1,
  marginRight: 12,
 },
 faqNumberBadge: {
  width: 28,
  height: 28,
  borderRadius: 14,
  backgroundColor: "#00b4d8",
  justifyContent: "center",
  alignItems: "center",
  marginRight: 12,
 },
 faqNumber: {
  fontSize: 13,
  fontWeight: "bold",
  color: "#FFFFFF",
 },
 faqQuestion: {
  flex: 1,
  fontSize: 15,
  fontWeight: "600",
  color: "#333",
 },
 faqAnswer: {
  paddingHorizontal: 16,
  paddingBottom: 16,
 },
 faqAnswerDivider: {
  height: 1,
  backgroundColor: "#F0F0F0",
  marginBottom: 12,
 },
 faqAnswerText: {
  fontSize: 14,
  color: "#555",
  lineHeight: 22,
 },
 contactCard: {
  backgroundColor: "#FFFFFF",
  borderRadius: 16,
  padding: 24,
  alignItems: "center",
  marginTop: 20,
  borderWidth: 2,
  borderColor: "#00b4d8",
  borderStyle: "dashed",
 },
 contactTitle: {
  fontSize: 18,
  fontWeight: "bold",
  color: "#333",
  marginTop: 12,
  marginBottom: 8,
 },
 contactText: {
  fontSize: 14,
  color: "#666",
  textAlign: "center",
  marginBottom: 12,
  lineHeight: 20,
 },
 contactEmail: {
  fontSize: 16,
  fontWeight: "600",
  color: "#00b4d8",
 },
});
