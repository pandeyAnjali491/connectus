# 🚀 ConnectUs

ConnectUs is a real-time chat application that allows users to connect, send messages, and communicate instantly in a secure and responsive environment.
You can simply share the meeting code with your friend and instantly connect to chat with them.

## 🌐 Live Demo

🔗 (https://connectus-frontend-fywz.onrender.com)

## 🌟 Features

* 💬 Real-time one-to-one messaging
* 🔐 Secure authentication (JWT)
* 👤 User registration & login
* ⚡ Instant message updates using Socket.IO
* 📱 Responsive UI (works on mobile & desktop)

## 🛠️ Tech Stack

* React.js
* Node.js
* Express.js
* MongoDB
* Socket.IO
* JWT Authentication

## 📂 Folder Structure

```id="c1"
connectus/
 ├── client/
 │   ├── src/
 │   │   ├── components/
 │   │   ├── pages/
 │   │   └── App.js
 │
 ├── server/
 │   ├── controllers/
 │   ├── routes/
 │   ├── models/
 │   └── server.js
```

## ⚙️ Installation & Setup

1. Clone the repository:

```id="c2"
git clone https://github.com/pandeyAnjali491/connectus.git
```

2. Navigate to project:

```id="c3"
cd connectus
```

3. Install backend dependencies:

```id="c4"
npm install
```

4. Install frontend dependencies:

```id="c5"
cd client
npm install
cd ..
```

5. Create `.env` file:

```id="c6"
PORT=5000
MONGO_URI=your_mongodb_connection
JWT_SECRET=your_secret_key
```

6. Run the project:

```id="c7"
npm run dev
```

## 🔗 API Base URL

```id="c8"
http://localhost:5000
```
