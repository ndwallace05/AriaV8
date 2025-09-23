<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Aria - Your Personal AI Assistant

Aria is a web-based personal assistant that helps you manage your daily life. It integrates with your Google services (Calendar, Email, and Tasks) and uses a persistent, multi-user memory to provide personalized assistance. The backend is powered by a Python LiveKit agent.

## ✨ Features

*   **Unified Dashboard**: View your upcoming events, unread emails, and pending tasks at a glance.
*   **Google Integration**: Securely connect your Google account to sync your Calendar, Gmail, and Tasks.
*   **LiveKit Voice Agent**: The backend is a voice-enabled agent that can process commands and respond naturally.
*   **Persistent, Multi-User Memory**: Aria remembers information from your conversations, with each user having their own isolated memory.
*   **Extensible Tool Use**: The agent can use tools to interact with Google services and its own memory.

## 🛠️ Setup and Configuration

This is a full-stack application with a React frontend and a Python backend.

**Prerequisites:**
*   [Node.js](https://nodejs.org/) (v18 or later)
*   [Python](https://www.python.org/) (v3.9 or later)
*   A Google Cloud Platform (GCP) project
*   A LiveKit account

### 1. Google Cloud Platform Setup

Follow the steps in the previous documentation to set up a GCP project, enable the necessary APIs (Gmail, Calendar, Tasks), and get your **Google Client ID**.

### 2. LiveKit Setup

1.  Create a LiveKit account at [livekit.io](https://livekit.io/).
2.  Create a new project.
3.  In your project settings, find your **API Key**, **API Secret**, and **Server URL**.

### 3. Local Environment Setup

1.  **Clone the Repository**:
    ```bash
    git clone https://github.com/your-username/aria-assistant.git
    cd aria-assistant
    ```
2.  **Install Frontend Dependencies**:
    ```bash
    npm install
    ```
3.  **Install Python Dependencies**:
    ```bash
    pip install -r requirements.txt
    ```
4.  **Configure Environment Variables**:
    *   Create a `.env` file in the root of the project.
    *   Add the following variables:
        ```
        # From Google Cloud Console
        GOOGLE_CLIENT_ID=your_google_client_id_here

        # From LiveKit Project Settings
        LIVEKIT_API_KEY=your_livekit_api_key
        LIVEKIT_API_SECRET=your_livekit_api_secret
        LIVEKIT_URL=wss://your-livekit-url.livekit.cloud

        # From Gibson.ai (or your database provider)
        DATABASE_URL=your_database_connection_string
        ```
    *   Create a `.env.local` file for the frontend. This is used by Vite.
        ```
        VITE_LIVEKIT_URL=wss://your-livekit-url.livekit.cloud
        ```

## 🚀 Running the Application

### Local Development

You need to run three processes in separate terminals: the Python agent, the Python token server, and the frontend development server.

1.  **Run the Python Agent**:
    ```bash
    python agent.py
    ```
2.  **Run the Token Server**:
    ```bash
    python token_server.py
    ```
3.  **Run the Frontend**:
    ```bash
    npm run dev
    ```

The application will be available at `http://localhost:5173`.

### Docker

Alternatively, you can build and run the entire application using Docker.

1.  **Build the Docker image**:
    ```bash
    docker build -t aria-assistant .
    ```
2.  **Run the Docker container**:
    Make sure your `.env` file is present in the root of the project.
    ```bash
    docker run -p 80:80 -p 5001:5001 --env-file .env aria-assistant
    ```
    The application will be available at `http://localhost`.

## 🎤 Usage

*   **Navigate**: Use the sidebar to switch between the Dashboard, Calendar, Email, Tasks, Memory, and Settings views.
*   **Connect Account**: Go to the **Settings** view to connect your Google account.
*   **Chat with Aria**: Click the chat icon in the bottom right to open the chat window. Once you are logged in, the application will automatically connect to the LiveKit agent in the background. You can then type or speak commands to the agent.
