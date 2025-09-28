import React from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { Link } from "expo-router";

const AuthForm = ({
  formType,
  username,
  setUsername,
  password,
  setPassword,
  handleSubmit,
}) => {
  const isLogin = formType === "Login";

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={{ width: "100%", alignItems: "center", marginTop: 20 }}>
        <Text style={{ fontSize: 32, fontWeight: "bold", marginBottom: 20 }}>
          {formType}
        </Text>

        <TextInput
          placeholder="Username"
          style={{
            backgroundColor: "#f1f5f9",
            borderWidth: 1,
            borderColor: "#ccc",
            width: "70%",
            padding: 10,
            borderRadius: 10,
            marginBottom: 10,
          }}
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
        />

        <TextInput
          placeholder="Password"
          style={{
            backgroundColor: "#f1f5f9",
            borderWidth: 1,
            borderColor: "#ccc",
            width: "70%",
            padding: 10,
            borderRadius: 10,
            marginBottom: 20,
          }}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoCapitalize="none"
        />

        <Pressable
          onPress={handleSubmit}
          style={{
            backgroundColor: "#7c3aed",
            paddingVertical: 10,
            paddingHorizontal: 20,
            borderRadius: 10,
            marginBottom: 10,
          }}
        >
          <Text style={{ color: "white", textAlign: "center" }}>
            {formType}
          </Text>
        </Pressable>

        {isLogin ? (
          <Link href="/register">Don't have an account? Register</Link>
        ) : (
          <Link href="/login">Already have an account? Login</Link>
        )}
      </View>
    </TouchableWithoutFeedback>
  );
};

export default AuthForm;
