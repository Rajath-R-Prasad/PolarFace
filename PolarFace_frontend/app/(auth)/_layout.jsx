import { Stack } from 'expo-router';

const AuthLayout = () => {
  return (
    <Stack>
      <Stack.Screen name='login' options={{ title: 'Login', headerShown: true }} />
      <Stack.Screen name='register' options={{ title: 'Register', headerShown: true }} />
    </Stack>
  );
};

export default AuthLayout;
