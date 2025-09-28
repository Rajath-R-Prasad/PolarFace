import { StyleSheet, Text, View } from "react-native";
import { Slot, Stack } from "expo-router";
import "./global.css"
const RootLayout = () => {
  return (
    <View className="flex-1 bg-white">
      <Stack screenOptions={{ headerStyle: { backgroundColor: '#2563eb' }, headerTintColor: '#fff', headerTitleStyle: { fontWeight: 'bold' } }}>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="home" options={{ title: "Home" }} />
        <Stack.Screen name="(auth)" options={{ headerShown:false }} />
        <Stack.Screen name="(dashboard)" options={{ headerShown:false }} />
        
      </Stack>
     
    </View>
  );
};

export default RootLayout;

const styles = StyleSheet.create({});
