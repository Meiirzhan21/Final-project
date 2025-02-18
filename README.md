# Hotel Booking System

Hotel Booking System is a web application that allows users to register, browse available hotels, and make reservations.

## Features
- User registration and authentication
- Browse available hotels and rooms
- Book hotels with check-in and check-out dates
- Admin panel for managing bookings

## Technologies Used
### Frontend
- **React (Next.js)**
- **Tailwind CSS**
- **Redux / Zustand**

### Backend
- **Node.js (Express)**
- **MongoDB (Mongoose)**
- **JWT authentication**

---

## Installation and Setup

### 1. Clone the repository
```sh
git clone https://github.com/Meiirzhan21/Final-project.git
cd Final-project
```

### 2. Install dependencies
#### Frontend
```sh
cd gofront/hotel-booking-frontend
npm install
npm run dev
```
#### Backend
```sh
cd ../../booking-system
npm install
npm start
```

---

## Configuration
Create `.env` files for both backend and frontend.

### Backend (`booking-system/.env`)
```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

### Frontend (`gofront/hotel-booking-frontend/.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

---

## API Example
Example request to the booking API:
```sh
POST /api/bookings
Content-Type: application/json

{
  "user": "user_id",
  "hotel": "hotel_id",
  "checkIn": "2025-02-20",
  "checkOut": "2025-02-25"
}
```

Response:
```json
{
  "success": true,
  "message": "Booking confirmed"
}
```

---

## Authors
- **Meiirzhan Zhumabek**  
- **Darkhan Serikov**  
- **Kudashov Adilet**  

---

