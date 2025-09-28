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

const { width, height } = Dimensions.get("window");

const Register = () => {
  const API_BASE_URL = "http://10.166.158.46:8000"; // Your actual server URL

  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [hasPermission, setHasPermission] = useState(null);
  const [facing, setFacing] = useState("front"); // Using simple string
  const [showCamera, setShowCamera] = useState(false);
  const [loading, setLoading] = useState(false);
  const cameraRef = useRef(null);

  useEffect(() => {
    const requestPermissions = async () => {
      try {
        const { status } = await Camera.requestCameraPermissionsAsync();
        setHasPermission(status === "granted");
      } catch (error) {
        // Fallback for newer versions
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

  const validateForm = () => {
    if (!username.trim()) {
      Alert.alert("Error", "Please enter a username");
      return false;
    }
    if (!password.trim()) {
      Alert.alert("Error", "Please enter a password");
      return false;
    }
    if (password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters long");
      return false;
    }
    return true;
  };

  const handleRegister = () => {
    if (!validateForm()) return;
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

        await uploadRegistrationData(photo.uri);
      } catch (error) {
        console.error("Error taking picture:", error);
        Alert.alert("Error", "Failed to take picture. Please try again.");
        setLoading(false);
      }
    }
  };

  const uploadRegistrationData = async (imageUri) => {
    try {
      const formData = new FormData();
      formData.append("username", username);
      formData.append("password", password);
      formData.append("file", {
        uri: imageUri,
        type: "image/jpeg",
        name: "face.jpg",
      });

      const response = await fetch(`${API_BASE_URL}/register/`, {
        method: "POST",
        body: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert(
          "Success",
          `Registration successful for ${data.username}!`,
          [
            {
              text: "OK",
              onPress: () => {
                setShowCamera(false);
                router.replace("/(auth)/login");
              },
            },
          ]
        );
      } else {
        throw new Error(data.detail || "Registration failed");
      }
    } catch (error) {
      console.error("Registration error:", error);
      Alert.alert(
        "Error",
        error.message || "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const flipCamera = () => {
    setFacing((current) => (current === "back" ? "front" : "back"));
  };

  const cancelCamera = () => {
    setShowCamera(false);
  };

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <Text>Requesting camera permission...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No access to camera</Text>
        <TouchableOpacity
          style={styles.button}
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
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (showCamera) {
    // Try to use CameraView first (newer API), fallback to Camera
    const CameraComponent = CameraView || Camera;

    return (
      <View style={styles.cameraContainer}>
        <CameraComponent style={styles.camera} facing={facing} ref={cameraRef}>
          <View style={styles.cameraOverlay}>
            <View style={styles.faceFrame} />
            <Text style={styles.instructionText}>
              Position your face within the frame
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
                  <Text style={styles.captureButtonText}>Capture</Text>
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
      <Text style={styles.title}>Create Account</Text>

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
          style={styles.button}
          onPress={handleRegister}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Continue with Face Recognition</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.linkButton}
          onPress={() => {
            router.replace("/(auth)/login");
          }}
        >
          <Text style={styles.linkText}>Already have an account? Login</Text>
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
  linkButton: {
    alignItems: "center",
  },
  linkText: {
    color: "#007AFF",
    fontSize: 16,
  },
  errorText: {
    fontSize: 18,
    textAlign: "center",
    marginBottom: 20,
    color: "#ff4444",
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
    backgroundColor: "#ff4444",
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
  disabledButton: {
    opacity: 0.6,
  },
});

export default Register;


