# SpecVerse — AR Sunglasses Try-On

A MERN-stack web app that lets users try on sunglasses in real time using their webcam. Face tracking runs entirely in the browser with `face-api.js` — no images are ever uploaded to a server.

> **Add a demo GIF or screenshot here.** Record your screen while trying on a pair, convert it to a GIF, and drop it in this README. This is the single most impressive part of the project.
>
> `![SpecVerse demo](./demo.gif)`

---

## Features

- **Real-time AR try-on** — 68-point facial landmark detection positions, scales and rotates the sunglasses overlay to match your face as you move.
- **Motion smoothing** — an interpolation factor keeps the overlay steady instead of jittering frame to frame.
- **Dynamic product catalogue** — products are served from MongoDB, not hardcoded in the frontend.
- **Category filtering** — browse by Aviator, Wayfarer, Round, Sport and more.
- **Persistent cart** — cart items are stored in MongoDB and survive a page refresh.
- **Wishlist** — mark favourites while browsing.
- **Privacy-first** — the camera stream stays on the user's device.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite |
| AR / Vision | face-api.js (TinyFaceDetector + 68-point landmarks), HTML5 Canvas |
| Camera | react-webcam |
| Backend | Node.js, Express 5 |
| Database | MongoDB Atlas, Mongoose |

---

## Project Structure

```
SpecVerse/
├── client/              # React frontend (Vite)
│   ├── public/
│   │   └── models/      # face-api.js pre-trained model weights
│   └── src/
│       ├── App.jsx
│       └── components/
│           └── TryOnModal.jsx   # AR try-on logic
└── server/              # Express API
    ├── models/          # Mongoose schemas (Product, Cart)
    ├── seedScript.js    # Populates the database with sample products
    └── server.js
```

---

## Getting Started

### Prerequisites

- Node.js v18 or higher
- A free MongoDB Atlas account (or a local MongoDB instance)

### 1. Clone the repository

```bash
git clone https://github.com/YOUR-USERNAME/SpecVerse.git
cd SpecVerse
```

### 2. Set up the backend

```bash
cd server
npm install
```

Create a `.env` file inside `server/` (use `.env.example` as a template):

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string_here
```

Seed the database with sample products:

```bash
node seedScript.js
```

Start the API server:

```bash
node server.js
```

The API runs at `http://localhost:5000`.

### 3. Set up the frontend

In a second terminal:

```bash
cd client
npm install
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`) and allow camera access when prompted.

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/products` | Fetch all products |
| GET | `/api/products/:id` | Fetch a single product |
| GET | `/api/cart` | Fetch cart items with product details |
| POST | `/api/cart` | Add a product to the cart, or increment its quantity |
| DELETE | `/api/cart/:id` | Remove an item from the cart |

---

## How the AR Try-On Works

1. `react-webcam` streams the user's camera into a `<video>` element.
2. On every animation frame, `face-api.js` detects a single face and returns 68 landmark points.
3. The outer corners of both eyes (landmarks 36 and 45) give the eye-to-eye distance, which determines the width, height and tilt angle of the sunglasses.
4. Because the webcam preview is mirrored, the canvas is flipped on the X axis and the rotation angle is inverted so the overlay lines up with what the user sees.
5. New coordinates are blended with the previous frame's values so the overlay glides instead of snapping.

---

## Roadmap

- [ ] User authentication so each user has their own cart
- [ ] Quantity increase/decrease controls in the cart
- [ ] Checkout and order history
- [ ] Deploy the frontend to Vercel and the backend to Render
- [ ] Support for multiple face detection

---

## Notes

The cart is currently shared across all visitors (there is no user authentication yet), so it behaves as a single-session demo cart.

---

## Author

**Iman Tahir** — BS Information Technology, University of Gujrat