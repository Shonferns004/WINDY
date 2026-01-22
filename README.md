# 🌬️ WINDY – Weather AI Project

🔗 **Live Demo:** https://windy-pazzago.vercel.app   

---

## 📌 Introduction

WINDY is a **full-stack weather application** that displays weather information using a modern frontend and an AI-powered backend.

The project is divided into two main parts:
- **Client (Frontend)** – What the user sees
- **Server (Backend)** – Handles logic and AI processing

👉 Think of it like:
- 🖥️ Client = Face of the app  
- 🧠 Server = Brain of the app  
- 🌦️ Weather API = Information source  

---

## 🌐 Live Demo

You can view and use the live working version of the project here:

🔗 **Live Demo Link:** https://your-live-demo-link-here

### What You Can See in the Demo:
- Weather information displayed on the screen
- Clean and responsive user interface
- Frontend built using React and Vite
- Backend powered by Mastra AI
- No installation required to test the app

---

## 📂 Project Structure

```
WINDY-main/
│
├── client/ → Frontend (User Interface)
│
└── server/ → Backend (AI logic & APIs)

```

## 🖥️ Client (Frontend)

The client is built using **React** and **Vite**.

### 📁 Important Client Files
- `src/` – React components and logic
- `index.html` – Main HTML file
- `vite.config.js` – Vite configuration
- `tailwind.config.js` – Styling configuration
- `.example_env` – Example environment variables

### 🛠️ Technologies Used
- React
- Vite
- Tailwind CSS
- JavaScript
---

## 🧠 Server (Backend)

The server handles backend logic using **Mastra AI**.

### 📁 Important Server Files
```
server/
│
├── src/mastra/
│ ├── agents/ → AI agents
│ ├── tools/ → Tools used by agents
│ ├── workflows/ → Step-by-step task flow
│
├── mastra.config.ts
├── package.json
```

## ⚙️ How to Run the Project Locally

### 1️⃣ Clone the Repository
```bash
git clone <repository-url>
cd WINDY-main
```

## 2️⃣ Start the Server

```bash
cd server
npm install
npm run dev
```


## 3️⃣ Start the Client

```bash
cd server
npm install
npm run dev --> devlopment
npm start   --> production
```

## 🚀 Features

- 🔍 **Message Search Functionality**
  - Users can search messages using keywords
  - Helps quickly find old conversations
  - Improves usability and efficiency

- 📱 **Progressive Web App (PWA) Support**
  - The application can be installed on mobile and desktop devices
  - Works offline using cached resources
  - Loads faster and improves performance
  - Provides app-like experience using browser

- 📤 **Export Chat History**
  - Allows users to download chat history
  - Chats can be saved for future reference
  - Useful for documentation and records

- 👍 **Message Reactions / Feedback**
  - Users can react to messages using emojis
  - Reduces the need for extra replies
  - Improves interaction and user experience

- ⌨️ **Typing Indicators**
  - Shows when another user is typing
  - Makes the chat experience real-time
  - Enhances user engagement
  
---

### 🛠️ Technologies Used
- Node.js
- TypeScript
- Mastra AI
- npm  
