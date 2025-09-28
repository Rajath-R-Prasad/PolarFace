import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { CameraView, Camera } from "expo-camera";
import * as FileSystem from "expo-file-system";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width, height } = Dimensions.get("window");


const API_BASE_URL = "http://10.166.158.46:8000"; 

const Login = () => {
  const router = useRouter();
  // ... existing state declarations ...
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [hasPermission, setHasPermission] = useState(null);
  const [facing, setFacing] = useState("front");
  const [showCamera, setShowCamera] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loginMethod, setLoginMethod] = useState("password");
  const cameraRef = useRef(null);

  useEffect(() => {
    const requestPermissions = async () => {
      try {
        const { status } = await Camera.requestCameraPermissionsAsync();
        setHasPermission(status === "granted");
      } catch (error) {
        try {
          const { status } = await CameraView.requestCameraPermissionsAsync();
          setHasPermission(status === "granted");
        } catch (fallbackError) {
          console.error("Error requesting camera permission:", error);
          setHasPermission(false);
        }
      }
    };

    requestPermissions();
  }, []);

  const validatePasswordForm = () => {
    if (!username.trim()) {
      Alert.alert("Error", "Please enter a username");
      return false;
    }
    if (!password.trim()) {
      Alert.alert("Error", "Please enter a password");
      return false;
    }
    return true;
  };

  const handlePasswordLogin = async () => {
    if (!validatePasswordForm()) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/login/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username,
          password: password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        await AsyncStorage.setItem('username', data.username);
        Alert.alert("Success", "Login successful!", [
          {
            text: "OK",
            onPress: () => {
              router.replace("/(dashboard)/profile");
            },
          },
        ]);
      } else {
        throw new Error(data.detail || "Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      Alert.alert("Error", error.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const testConnection = async () => {
    try {
      console.log("Testing connection to backend...");
      const response = await fetch(`${API_BASE_URL}/`, {
        method: "GET",
        timeout: 10000,
      });
      console.log("Connection test response:", response.status);
      return response.ok;
    } catch (error) {
      console.error("Connection test failed:", error);
      return false;
    }
  };

  const handleFaceLogin = async () => {
    if (hasPermission === false) {
      Alert.alert("Error", "Camera permission is required for face login");
      return;
    }

    // Test connection first
    const isConnected = await testConnection();
    if (!isConnected) {
      Alert.alert(
        "Connection Error",
        "Cannot connect to server. Please ensure:\n• Backend server is running on port 8000\n• You have network connectivity",
        [
          {
            text: "Try Anyway",
            onPress: () => {
              setLoginMethod("face");
              setShowCamera(true);
            },
          },
          {
            text: "Cancel",
            style: "cancel",
          },
        ]
      );
      return;
    }

    setLoginMethod("face");
    setShowCamera(true);
  };

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        setLoading(true);
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.7,
          base64: false,
        });

        await uploadFaceData(photo.uri);
      } catch (error) {
        console.error("Error taking picture:", error);
        Alert.alert("Error", "Failed to take picture. Please try again.");
        setLoading(false);
      }
    }
  };

  const uploadFaceData = async (imageUri) => {
    try {
      console.log("Starting face login with image:", imageUri);

      // Create FormData with proper format
      const formData = new FormData();
      formData.append("file", {
        uri: imageUri,
        type: "image/jpeg",
        name: "face.jpg",
      });

      console.log("Sending request to backend...");

      const response = await fetch(`${API_BASE_URL}/login/face`, {
        method: "POST",
        body: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
        timeout: 30000, // 30 second timeout
      });

      console.log("Response status:", response.status);
      const data = await response.json();
      console.log("Response data:", data);

      if (response.ok) {
        await AsyncStorage.setItem('username', data.username);
        Alert.alert("Success", `Welcome back, ${data.username}!`, [
          {
            text: "OK",
            onPress: () => {
              setShowCamera(false);
              router.replace("/(dashboard)/profile");
            },
          },
        ]);
      } else {
        throw new Error(data.detail || "Face recognition failed");
      }
    } catch (error) {
      console.error("Face login error:", error);

      // More specific error messages
      if (error.message.includes("Network request failed")) {
        Alert.alert(
          "Connection Error",
          "Cannot connect to server. Please check:\n• Backend server is running\n• Network connection\n• Server address is correct",
          [
            {
              text: "Retry",
              onPress: () => uploadFaceData(imageUri),
            },
            {
              text: "Cancel",
              style: "cancel",
            },
          ]
        );
      } else {
        Alert.alert(
          "Error",
          error.message || "Face recognition failed. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const flipCamera = () => {
    setFacing((current) => (current === "back" ? "front" : "back"));
  };

  const cancelCamera = () => {
    setShowCamera(false);
    setLoginMethod("password");
  };

  if (hasPermission === null && loginMethod === "face") {
    return (
      <View style={styles.container}>
        <Text>Requesting camera permission...</Text>
      </View>
    );
  }

  if (showCamera && loginMethod === "face") {
    const CameraComponent = CameraView || Camera;

    return (
      <View style={styles.cameraContainer}>
        <CameraComponent style={styles.camera} facing={facing} ref={cameraRef}>
          <View style={styles.cameraOverlay}>
            <View style={styles.faceFrame} />
            <Text style={styles.instructionText}>
              Position your face within the frame for recognition
            </Text>
            <View style={styles.cameraButtonContainer}>
              <TouchableOpacity
                style={styles.cameraButton}
                onPress={cancelCamera}
                disabled={loading}
              >
                <Text style={styles.cameraButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.captureButton, loading && styles.disabledButton]}
                onPress={takePicture}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.captureButtonText}>Login</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cameraButton}
                onPress={flipCamera}
                disabled={loading}
              >
                <Text style={styles.cameraButtonText}>Flip</Text>
              </TouchableOpacity>
            </View>
          </View>
        </CameraComponent>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome Back</Text>

      <View style={styles.formContainer}>
        <TextInput
          style={styles.input}
          placeholder="Username"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
          autoCorrect={false}
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
        />

        <TouchableOpacity
          style={[styles.button, loading && styles.disabledButton]}
          onPress={handlePasswordLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.buttonText}>Login with Password</Text>
          )}
        </TouchableOpacity>

        <View style={styles.dividerContainer}>
          <View style={styles.divider} />
          <Text style={styles.dividerText}>OR</Text>
          <View style={styles.divider} />
        </View>

        <TouchableOpacity
          style={[
            styles.faceButton,
            hasPermission === false && styles.disabledButton,
          ]}
          onPress={handleFaceLogin}
          disabled={hasPermission === false}
        >
          <Text style={styles.faceButtonText}>
            {hasPermission === false
              ? "Camera Permission Required"
              : "Login with Face Recognition"}
          </Text>
        </TouchableOpacity>

        {hasPermission === false && (
          <TouchableOpacity
            style={styles.permissionButton}
            onPress={async () => {
              try {
                const { status } = await Camera.requestCameraPermissionsAsync();
                setHasPermission(status === "granted");
              } catch (error) {
                try {
                  const { status } =
                    await CameraView.requestCameraPermissionsAsync();
                  setHasPermission(status === "granted");
                } catch (fallbackError) {
                  console.error("Failed to request permissions");
                }
              }
            }}
          >
            <Text style={styles.permissionButtonText}>
              Grant Camera Permission
            </Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.linkButton}
          onPress={() => {
            router.replace("/(auth)/register");
          }}
        >
          <Text style={styles.linkText}>Don't have an account? Register</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 40,
    color: "#333",
  },
  formContainer: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  button: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 15,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  faceButton: {
    backgroundColor: "#34C759",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 15,
  },
  faceButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  permissionButton: {
    backgroundColor: "#FF9500",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 15,
  },
  permissionButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: "#ddd",
  },
  dividerText: {
    marginHorizontal: 15,
    color: "#666",
    fontSize: 14,
  },
  linkButton: {
    alignItems: "center",
    marginTop: 10,
  },
  linkText: {
    color: "#007AFF",
    fontSize: 16,
  },
  disabledButton: {
    opacity: 0.6,
  },
  cameraContainer: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    flex: 1,
    backgroundColor: "transparent",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 50,
  },
  faceFrame: {
    width: 250,
    height: 300,
    borderWidth: 3,
    borderColor: "#fff",
    borderRadius: 150,
    backgroundColor: "transparent",
    marginTop: 50,
  },
  instructionText: {
    color: "white",
    fontSize: 18,
    textAlign: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 10,
    borderRadius: 5,
    margin: 20,
  },
  cameraButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    width: "100%",
    paddingHorizontal: 20,
  },
  cameraButton: {
    backgroundColor: "rgba(255,255,255,0.3)",
    padding: 15,
    borderRadius: 50,
    minWidth: 80,
    alignItems: "center",
  },
  cameraButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  captureButton: {
    backgroundColor: "#34C759",
    padding: 20,
    borderRadius: 50,
    minWidth: 100,
    alignItems: "center",
  },
  captureButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default Login;
