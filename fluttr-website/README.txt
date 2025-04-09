# Fluttr - 18+ Dating Video Chat Website

## 🔧 Setup Instructions

### Backend
1. Go to `backend/` folder
2. Run:
   ```
   npm install express socket.io cors
   node index.js
   ```
   This starts the signaling server at `http://localhost:5000`

### Frontend
1. Go to `frontend/` folder
2. Create a React app using:
   ```
   npx create-react-app .
   npm install socket.io-client
   ```
3. Replace `src/App.js` with the provided file
4. Run:
   ```
   npm start
   ```
   Open [http://localhost:3000](http://localhost:3000)

### 🔞 Age Restricted
The site blocks access unless the user confirms they are 18+

---

Have fun chatting! 💕
