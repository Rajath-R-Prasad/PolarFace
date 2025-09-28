import { StyleSheet, Text, View, Button, Alert } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const profile = () => {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      const username = await AsyncStorage.getItem('username');
      if (username) {
        try {
          const response = await fetch(`http://10.166.158.46:8000/users/${username}`);
          if (response.ok) {
            const userData = await response.json();
            setUser(userData);
          } else {
            Alert.alert("Error", "Failed to fetch user data.");
          }
        } catch (error) {
          console.error(error);
          Alert.alert("Error", "An error occurred while fetching user data.");
        }
      } else {
        router.replace('/(auth)/login');
      }
    };
    fetchUserData();
  }, []);

  const handleLogout = async () => {
    await AsyncStorage.removeItem('username');
    router.replace('/(auth)/login');
  };

  const handleDelete = async () => {
    Alert.alert(
      "Delete Account",
      "Are you sure you want to delete your account? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "OK",
          onPress: async () => {
            try {
              const username = await AsyncStorage.getItem('username');
              const response = await fetch(`http://10.166.158.46:8000/users/${username}`, {
                method: 'DELETE',
              });
              if (response.ok) {
                await AsyncStorage.removeItem('username');
                router.replace('/(auth)/login');
              } else {
                Alert.alert("Error", "Failed to delete account.");
              }
            } catch (error) {
              console.error(error);
              Alert.alert("Error", "An error occurred while deleting the account.");
            }
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>
      {user && <Text style={styles.username}>Welcome, {user.username}</Text>}
      <View style={styles.buttonContainer}>
        <Button title="Logout" onPress={handleLogout} color="#6200ee" />
        <Button title="Delete Account" onPress={handleDelete} color="#b00020" />
      </View>
    </View>
  );
};

export default profile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  username: {
    fontSize: 18,
    marginBottom: 20,
  },
  buttonContainer: {
    marginTop: 20,
    width: '80%',
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
});
