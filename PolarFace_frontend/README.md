# Facial Recognition Mobile App (Frontend)

This is the frontend for the Facial Recognition mobile application, built with React Native and Expo. It provides a user interface for registering and logging in with a username and password, as well as through facial recognition. The application communicates with a separate backend service for user authentication and data management.

## Prerequisites

Before you start, make sure you have the following installed:

- **Node.js and npm**: Required for managing project dependencies and running scripts. You can download them from [nodejs.org](https://nodejs.org/).
- **Expo Go App**: To run the application on your physical mobile device (iOS or Android), you will need the Expo Go app. You can find it on the [App Store](https://apps.apple.com/us/app/expo-go/id982107779) and [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent).
- **Running Backend**: This frontend application requires the backend service to be running. Please ensure you have followed the setup instructions in the `PolarFace_backend` directory and that the server is active.

## Installation & Setup

1.  **Navigate to the Frontend Directory**

    Open your terminal and change to the frontend project directory:

    ```bash
    cd facial-recognition-app\PolarFace_frontend
    ```

2.  **Install Dependencies**

    Install all the necessary Node.js packages using npm:

    ```bash
    npm install
    ```

## Configuration

The application needs to know the address of the backend API. Currently, the API URL is hardcoded in the source files.

**IMPORTANT**: You will need to update the IP address to match the local IP address of the machine running the backend server.

The files to update are:

- `app/(auth)/login.jsx`
- `app/(auth)/register.jsx`
- `app/(dashboard)/profile.jsx`

In these files, find the `API_BASE_URL` constant and replace the IP address `10.166.158.46` with the correct IP for your backend server. For example:

```javascript
// Before
const API_BASE_URL = "http://10.166.158.46:8000";

// After (example)
const API_BASE_URL = "http://192.168.1.10:8000";
```

## Running the Application

1.  **Start the Metro Bundler**

    Once the dependencies are installed and the configuration is set, you can start the application by running:

    ```bash
    npx expo start
    ```

    This will start the Expo Metro bundler and display a QR code in your terminal.

2.  **Open the App on Your Device**
    - **On a physical device**: Open the Expo Go app on your phone and scan the QR code from the terminal. Your phone must be on the same Wi-Fi network as your computer.
    - **On an emulator/simulator**: You can press `a` for an Android emulator or `i` for an iOS simulator in the terminal to launch the app.

## Project Structure

The main application code is located in the `app` directory, which uses the Expo Router file-based routing system.

- `app/_layout.tsx`: The main layout file for the application.
- `app/index.tsx`: The entry point of the app.
- `app/(auth)`: Contains screens related to user authentication, such as login and registration.
- `app/(dashboard)`: Contains the main screens of the application after a user is logged in, including the user profile, service history, and other features.
