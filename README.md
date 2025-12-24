# Lumière Camera Shop

A premium e-commerce web application designed for photography enthusiasts. Lumière offers a curated selection of high-end cameras, lenses, and accessories with a stunning, modern user interface.

## ✨ Features

### Client (Storefront)
- **Modern UI/UX**: Built with a dark-themed, premium aesthetic using TailwindCSS.
- **Product Browsing**: View featured products, search by name, and browse by category.
- **Product Details**: High-quality images, detailed specs, and similar product recommendations.
- **Shopping Cart**: Fully functional cart with persistent state.
- **Authentication**: Secure Google Login integration for users.
- **Profile Management**: View order history and user details.

### Admin Dashboard
- **Analytics**: Visual charts for inventory status and order statistics.
- **Product Management**: Add, edit, and delete products easily.
- **Filtering**: Real-time product filtering by category and search terms for efficient management.
- **Security**: Protected routes ensuring only admins can access sensitive features.

## 🛠 Tech Stack

### Frontend
- **Framework**: [Next.js](https://nextjs.org/) (React)
- **Styling**: TailwindCSS, CSS Modules
- **Icons**: Lucide React
- **Charts**: Recharts
- **State Management**: React Context API

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose ODM)
- **Authentication**: Google Auth Library & JWT

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+ recommended)
- [MongoDB](https://www.mongodb.com/) installed and running locally

### 1. Database & Server Setup

Navigate to the server directory and install dependencies:

```bash
cd server
npm install
```

Create a `.env` file in the `server` directory:

```env
MONGO_URI=mongodb://localhost:27017/camera_shop
PORT=5000
JWT_SECRET=your_super_secret_key_here
GOOGLE_CLIENT_ID=your_google_client_id_here
```

**Seed the Database:**
Populate your local database with initial product data:

```bash
npm run seed
```

**Start the Server:**

```bash
npm run dev
# Server runs on http://localhost:5000
```

### 2. Client Setup

Navigate to the client directory and install dependencies:

```bash
cd client
npm install
```

Create a `.env.local` file in the `client` directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id_here
```

**Start the Client:**

```bash
npm run dev
# Application runs on http://localhost:3000
```

## 🔐 Admin Access

To access the admin dashboard:
1. Log in with a Google account.
2. Manually update your user document in MongoDB to set `isAdmin: true`.
3. Navigate to `/admin` or click the Admin Dashboard link in the profile menu.

## 📄 License

This project is licensed under the ISC License.
