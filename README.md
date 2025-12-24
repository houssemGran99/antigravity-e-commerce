# Camera Shop

A modern e-commerce web application for selling cameras. Built with a React frontend and Node.js/Express backend.

## Tech Stack

- **Frontend:** React, Vite, TailwindCSS, Lucide React
- **Backend:** Node.js, Express, MongoDB
- **Database:** MongoDB

## Prerequisites

- [Node.js](https://nodejs.org/) (v16 or higher recommended)
- [MongoDB](https://www.mongodb.com/) installed and running locally

## Getting Started

Follow these steps to set up and run the application.

### 1. Database Setup

Ensure your local MongoDB instance is running. The application connects to `mongodb://localhost:27017/camera_shop`.

### 2. Server Setup

The server currently requires manual dependency installation as there is no `package.json` yet.

```bash
cd server
npm init -y
npm install express mongoose dotenv cors
```

Create a `.env` file in the `server` directory with your MongoDB connection string:

```env
MONGO_URI=your_mongodb_connection_string
PORT=5000
```

### 3. Client Setup

Navigate to the client directory and install dependencies.

```bash
cd client
npm install
```

## Running the Application

You will need to run the server and client in separate terminal windows.

**Start the Server:**

```bash
cd server
node index.js
# Server runs on http://localhost:5000
```

**Start the Client:**

```bash
cd client
npm run dev
# Client typically runs on http://localhost:5173
```
