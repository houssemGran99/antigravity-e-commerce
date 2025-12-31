# 📸 Lumière Camera Shop

A premium e-commerce web application designed for photography enthusiasts. Lumière offers a curated selection of high-end cameras, lenses, and accessories with a stunning, modern user interface.

![Project Banner](https://images.unsplash.com/photo-1516035069371-29a1b244cc32?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80)

## 🏗 Architecture

```mermaid
graph TD
    User((User))
    
    subgraph Client [Client Side (Next.js)]
        UI[UI Components]
        Pages[Pages & Routing]
        Context[React Context State]
        Axios[API Client]
    end

    subgraph Server [Server Side (Node/Express)]
        Middleware[Security & Auth Middleware]
        Routes[API Routes]
        Controllers[Controllers]
    end

    subgraph Database [Data Layer]
        Atlas[(MongoDB Atlas/Local)]
    end

    User -- Interacts --> UI
    UI --> Pages
    Pages -- Uses --> Context
    Context -- Requests --> Axios
    Axios -- HTTP/JSON --> Middleware
    Middleware --> Routes
    Routes --> Controllers
    Controllers -- Mongoose Queries --> Atlas
```

## ✨ Features

### Client (Storefront)
- **Modern UI/UX**: Built with a dark-themed, premium aesthetic using TailwindCSS and Framer Motion for smooth animations.
- **Product Browsing**:
  - Featured carousel with "Show Now" calls to action.
  - Advanced filtering by category, price range, and search terms.
  - Pagination for optimal performance.
- **Product Details**: High-resolution image galleries, detailed specifications, and "You might also like" recommendations.
- **Shopping Cart**: Persistent cart management with real-time subtotal calculations.
- **Authentication**: Seamless Google One-Tap and standard Google Login integration.
- **User Profile**: Order history tracking and personal details management.
- **Notifications**: Real-time toast notifications for system actions (cart updates, login status).

### Admin Dashboard
- **Analytics & Insights**: Visual charts (Recharts) for sales trends, inventory distribution, and order status.
- **Product Management**: comprehensive CRUD operations for the product catalog.
- **Order Management**: View and update order statuses (Processing, Shipped, Delivered), with automated email notifications.
- **Security**: Role-based access control (RBAC) protecting admin routes.

## 🛠 Tech Stack

### Frontend
- **Core**: [Next.js 15+](https://nextjs.org/) (App Router), React 19
- **Styling**: [TailwindCSS v4](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **State Management**: React Context API
- **Data Visualization**: [Recharts](https://recharts.org/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Utilities**: `canvas-confetti` (celebrations), `react-hot-toast` (notifications)

### Backend
- **Runtime**: Node.js
- **Framework**: [Express.js](https://expressjs.com/)
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: Google Auth Library, JWT (JSON Web Tokens)
- **Security**:
  - `helmet`: Secure HTTP headers
  - `express-rate-limit`: Rate limiting to prevent brute-force
  - `express-mongo-sanitize`: Prevent NoSQL injection
  - `xss-clean` & `hpp`: Protection against XSS and HTTP Parameter Pollution
- **Documentation**: Swagger UI (`/api-docs`)

## 📂 Project Structure

```bash
📦 camera_shop
 ┣ 📂 client               # Next.js Frontend
 ┃ ┣ 📂 src
 ┃ ┃ ┣ 📂 app              # App Router Pages
 ┃ ┃ ┣ 📂 components       # Reusable UI Components
 ┃ ┃ ┣ 📂 context          # Global State (Auth, Cart)
 ┃ ┃ ┗ 📂 lib              # Utilities (API, formatting)
 ┃ ┗ 📜 package.json
 ┣ 📂 server               # Express Backend
 ┃ ┣ 📂 config             # DB Connection
 ┃ ┣ 📂 controllers        # Request Handlers
 ┃ ┣ 📂 middleware         # Auth & Error Handling
 ┃ ┣ 📂 models             # Mongoose Schemas
 ┃ ┣ 📂 routes             # API Endpoints
 ┃ ┗ 📜 package.json
 ┗ 📜 README.md
```

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+ recommended)
- [MongoDB](https://www.mongodb.com/try/download/community) installed locally or a MongoDB Atlas connection string.

### 1. Backend Setup

1. Navigate to the server directory:
   ```bash
   cd server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the `server` directory:
   ```env
   MONGO_URI=mongodb://localhost:27017/camera_shop
   PORT=5000
   JWT_SECRET=your_super_secure_jwt_secret
   GOOGLE_CLIENT_ID=your_google_client_id_from_console
   EMAIL_USER=your_email_for_notifications
   EMAIL_PASS=your_email_app_password
   client_URL=http://localhost:3000
   ```

4. Seed the database with initial products:
   ```bash
   npm run seed
   ```

5. Start the development server:
   ```bash
   npm run dev
   # Server: http://localhost:5000
   # API Docs: http://localhost:5000/api-docs
   ```

### 2. Client Setup

1. Open a new terminal and navigate to the client directory:
   ```bash
   cd client
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file in the `client` directory:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000
   NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id_same_as_server
   ```

4. Start the frontend application:
   ```bash
   npm run dev
   # App: http://localhost:3000
   ```

## 🔐 Admin Access Guide

By default, new users are **Customers**. To grant **Admin** privileges:

1. **Log in** to the application using your Google account.
2. Access your MongoDB database (using Compass or CLI).
3. Find your user document in the `users` collection.
4. Update the `role` field from `'customer'` to `'admin'` or set `isAdmin: true` (depending on schema version).
5. Refresh the application. You will now see the "Admin Dashboard" link in your profile menu.

## 📄 License

This project is licensed under the ISC License.
