import { Stack } from "expo-router";

export default function RootLayout() {
 return (
  <Stack screenOptions={{headerShown: false}}>
   <Stack.Screen name="index" />
   <Stack.Screen name="auth" />
   <Stack.Screen name="(tabs)" options={{headerShown: false}} />
   <Stack.Screen name="about" options={{headerShown: false}} />
   <Stack.Screen name="faqs" options={{headerShown: false}} />
  </Stack>
 );
}
