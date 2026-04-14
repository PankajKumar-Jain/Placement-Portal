# 🚀 Placement Portal

A full-stack campus placement management system that connects **students, recruiters, and administrators** in a unified platform.

It streamlines the entire placement process — from job posting and applications to hiring and analytics — making it efficient, transparent, and scalable.

---

## 📌 Overview

This platform enables:

- 🎓 Students to build profiles, upload resumes, and apply for jobs  
- 🏢 Recruiters to post jobs and manage candidates  
- 🛠️ Admins to oversee placements, analytics, and announcements  

---

## ✨ Features

### 🎓 Student Portal
- Profile creation and management  
- Resume builder & upload  
- Apply for jobs  
- Track application status  
- Offer accept/reject system  
- View announcements  

### 🏢 Recruiter Portal
- Company profile management  
- Job posting with eligibility criteria  
- View applicants  
- Shortlist, reject, and hire candidates  
- Offer management system  

### 🛠️ Admin Dashboard
- Manage students and recruiters  
- View placement analytics  
- Broadcast announcements (branch & batch-wise)  
- Track company hiring activity  
- Block/unblock users  

---

## 🧱 Tech Stack

| Layer     | Technology Used        |
|----------|----------------------|
| Frontend | React (Vite)         |
| Backend  | Node.js, Express     |
| Database | MongoDB Atlas        |
| Storage  | Cloudinary           |
| Auth     | JWT Authentication   |

---

## 📁 Project Structure
Placement-Portal/
├── Frontend/ # React frontend
├── backend/ # Node.js backend APIs
└── README.md

---

## ⚙️ Prerequisites

- Node.js (v16 or above)  
- npm  
- Git  
- MongoDB Atlas account  
- Cloudinary account  

---

## 🔑 Environment Variables

Create a `.env` file inside the `backend/` folder:
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key

CLOUD_NAME=your_cloudinary_name
CLOUD_API_KEY=your_api_key
CLOUD_API_SECRET=your_api_secret


---

## 🖥️ Local Setup & Installation

### 1️⃣ Clone the Repository
git clone https://github.com/PratikshaVaya/Placement-Portal.git

cd Placement-Portal


---

### 2️⃣ Backend Setup


cd backend
npm install
npm run dev


---

### 3️⃣ Frontend Setup

Open a new terminal:


cd Frontend
npm install
npm run dev


---

## 🌐 Run the Application

- Frontend: http://localhost:5173  
- Backend: http://localhost:5000  

---

## 🔐 User Roles

- Student  
- Recruiter  
- Admin  

---

## ⚠️ Important Notes

- Run frontend and backend simultaneously  
- Do NOT upload `.env` or `node_modules`  
- Ensure MongoDB & Cloudinary are configured  

---

## 🧪 Common Issues

### Backend not starting
- Check MongoDB URI  
- Verify `.env` file  

### Image upload not working
- Check Cloudinary credentials  

### Frontend not connecting
- Ensure backend is running  

---

## 🚀 Future Enhancements

- AI-based resume scoring  
- Email notifications  
- Placement analytics improvements  

---

## 👩‍💻 Author

**Pratiksha Vaya**  
https://github.com/PratikshaVaya  

---

⭐ If you like this project, give it a star!
