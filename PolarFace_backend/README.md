# Polar Face - API Backend

This backend service provides a RESTful API for a facial recognition application. It allows users to register with a username, password, and a profile image, and then authenticate using either their credentials or by providing an image for facial recognition.

## Prerequisites

Before you begin, ensure you have the following installed on your local machine:

- **Python 3.11**: This project is specifically configured to run on Python 3.11. You can download it from the [official Python website](https://www.python.org/downloads/).
- **C++ Compiler**: The `dlib` library, which is a core dependency for the facial recognition functionality, is written in C++. You will need a C++ compiler to install it.
  - **For Windows**: Install [Visual Studio Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/). Make sure to select "C++ build tools" during the installation.

## Installation & Setup

Follow these steps to get the backend server running on your local machine.

1.  **Navigate to the Backend Directory**

    Open your terminal or command prompt and navigate to the project's backend directory:

    ```bash
    cd facial-recognition-app\PolarFace_backend
    ```

2.  **Create a Python Virtual Environment**

    It is highly recommended to use a virtual environment to manage project dependencies. Create one by running:

    ```bash
    python -m venv venv
    ```

3.  **Activate the Virtual Environment**

    Activate the newly created virtual environment.

    - **On Windows**:
      ```bash
      .\venv\Scripts\activate
      ```
    - **On macOS/Linux**:
      ```bash
      source venv/bin/activate
      ```

4.  **Install the `dlib` Dependency**

    This project requires a specific version of the `dlib` library. A Python wheel file for `dlib` compatible with Python 3.11 on 64-bit Windows is included in this directory. Install it using pip:

    ```bash
    pip install dlib-19.24.1-cp311-cp311-win_amd64.whl
    ```

    _Note: If you are not on a 64-bit Windows system, you will need to build `dlib` from source, which can be a complex process. It is recommended to use the provided wheel file in the intended environment._

5.  **Install Remaining Dependencies**

    Install all other required Python packages using the `requirements.txt` file:

    ```bash
    pip install -r requirements.txt
    ```

## Running the Application

Once the setup is complete, you can start the FastAPI server.

1.  **Run the Server**

    From the `PolarFace_backend` directory, run the `main.py` file:

    ```bash
    python main.py
    ```

2.  **Access the API**

    The server will start and be accessible at `http://localhost:8000`.

    You can view the auto-generated API documentation by navigating to `http://localhost:8000/docs` in your web browser. This will provide a Swagger UI where you can interact with and test the API endpoints.

## API Endpoints

The following are the main API endpoints provided by this service:

- `GET /`

  - **Description**: A root endpoint to check if the API is running.
  - **Response**: `{"message": "Facial Recognition API is running"}`

- `POST /register/`

  - **Description**: Registers a new user.
  - **Request Body**: `multipart/form-data` with the following fields:
    - `username` (string): The desired username.
    - `password` (string): The user's password.
    - `file` (image file): An image of the user's face.
  - **Response**: A confirmation message on successful registration.

- `POST /login/`

  - **Description**: Authenticates a user with their username and password.
  - **Request Body**: A JSON object with:
    - `username` (string)
    - `password` (string)
  - **Response**: A success message and the username upon successful login.

- `POST /login/face`

  - **Description**: Authenticates a user via facial recognition.
  - **Request Body**: `multipart/form-data` with a `file` field containing an image of the user's face.
  - **Response**: A success message with the recognized username and a confidence score.

- `GET /health`

  - **Description**: A health check endpoint.
  - **Response**: `{"status": "healthy", "service": "facial-recognition-api"}`

- `GET /users/{username}`

  - **Description**: Retrieves details for a specific user.
  - **Response**: A JSON object with the user's `id` and `username`.

- `DELETE /users/{username}`
  - **Description**: Deletes a user from the database.
  - **Response**: A confirmation message.
