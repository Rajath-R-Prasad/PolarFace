import { StyleSheet, Text, View } from "react-native";
import { Link } from "expo-router";
const landing = () => {
  return (
    <View className="flex-1 bg-blue-600 items-center justify-center">
      <Text className="text-center font-bold border p-3 rounded-xl text-4xl text-gray-200">Polar face</Text>
      <Link href="/login" className="m-3 bg-white p-3 rounded-full text-blue-500"><Text>Get Started</Text></Link>
    </View>
  );
};

export default landing;


