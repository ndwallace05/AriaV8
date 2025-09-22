<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Aria - Your Personal AI Assistant

Aria is a web-based personal assistant that helps you manage your daily life. It integrates with your Google services (Calendar, Email, and Tasks) to provide a centralized dashboard for your important information. Aria is powered by Google's Gemini AI to understand natural language commands, both typed and spoken.

## ✨ Features

*   **Unified Dashboard**: View your upcoming events, unread emails, and pending tasks at a glance.
*   **Google Integration**: Securely connect your Google account to sync your Calendar, Gmail, and Tasks.
*   **AI-Powered Chat**: Interact with the Gemini-powered assistant, "Aria," to get information and perform actions.
*   **Voice Commands**: Use your voice to add events to your calendar, manage your task list, and interact with your emails.
*   **Persistent Memory**: Tell Aria to remember things, and she'll keep them in her memory to provide more personalized assistance in the future.
*   **Responsive Design**: Works on both desktop and mobile devices.

## 🛠️ Setup and Configuration

To run this application locally, you'll need to configure access to the Google APIs and set up your environment.

**Prerequisites:**
*   [Node.js](https://nodejs.org/) (v18 or later recommended)
*   A Google Cloud Platform (GCP) project

### 1. Google Cloud Platform Setup

1.  **Create a GCP Project**: If you don't have one already, create a new project in the [Google Cloud Console](https://console.cloud.google.com/).
2.  **Enable APIs**: Enable the following APIs for your project:
    *   Google Calendar API
    *   Gmail API
    *   Google Tasks API
3.  **Configure OAuth Consent Screen**:
    *   Go to "APIs & Services" -> "OAuth consent screen".
    *   Choose "External" and create a consent screen.
    *   Fill in the required details (app name, user support email, etc.).
    *   Add the necessary scopes:
        *   `https://www.googleapis.com/auth/calendar.readonly`
        *   `https://www.googleapis.com/auth/calendar.events`
        *   `https://www.googleapis.com/auth/gmail.readonly`
        *   `https://www.googleapis.com/auth/gmail.modify`
        *   `https://www.googleapis.com/auth/tasks.readonly`
        *   `https://www.googleapis.com/auth/tasks`
    *   Add your email address to the list of test users.
4.  **Create OAuth 2.0 Client ID**:
    *   Go to "APIs & Services" -> "Credentials".
    *   Click "Create Credentials" -> "OAuth client ID".
    *   Select "Web application" as the application type.
    *   Add `http://localhost:5173` (or your local development port) to the "Authorized JavaScript origins".
    *   Copy the generated **Client ID**.

### 2. Local Environment Setup

1.  **Clone the Repository**:
    ```bash
    git clone https://github.com/your-username/aria-assistant.git
    cd aria-assistant
    ```
2.  **Install Dependencies**:
    ```bash
    npm install
    ```
3.  **Configure Environment Variables**:
    *   Open the `config.ts` file.
    *   Replace the placeholder value of `GOOGLE_CLIENT_ID` with the Client ID you obtained from the GCP console.
    *   Create a `.env` file in the root of the project.
    *   Add your Gemini API key to the `.env` file:
        ```
        API_KEY=your_gemini_api_key_here
        ```

## 🚀 Running the Application

Once the setup is complete, you can run the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173`.

## 🎤 Usage

*   **Navigate**: Use the sidebar to switch between the Dashboard, Calendar, Email, Tasks, Memory, and Settings views.
*   **Connect Account**: Go to the **Settings** view to connect your Google account.
*   **Chat with Aria**: Click the chat icon in the bottom right to open the chat window. Type or speak commands.
*   **Voice Commands**: In the Calendar, Email, and Tasks views, use the microphone button to issue voice commands like:
    *   "Add an event for a dentist appointment tomorrow"
    *   "Add a task to buy milk"
    *   "Mark the email from John Doe as read"
*   **Use Aria's Memory**: Tell Aria things like "Remember my favorite color is blue." You can view stored memories in the **Memory** view.
