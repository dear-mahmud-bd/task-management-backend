# 🚀 Task Management Backend – NestJS

This is the backend service for the Collaborative Task Management Platform. Built using **NestJS**, **MongoDB**, and **Mongoose** with a modular and scalable architecture.

---

## 📦 Tech Stack

- **Framework:** [NestJS](https://nestjs.com/)
- **Database:** [MongoDB](https://www.mongodb.com/)
- **ORM:** [Mongoose](https://mongoosejs.com/)
- **Authentication:** JWT (JSON Web Token)
- **Features:** Modular structure, role-based access, export data 

---

## ⚙️ Backend Setup 
### Prerequisites
- Node.js (Latest LTS recommended)
- npm or yarn installed

### Clone the Repository
```bash
git clone https://github.com/dear-mahmud-bd/task-management-backend.git
cd task-management-backend
```

### Install Dependencies
```bash
npm install
```

### Setup Environment Variables
Create a `.env` file and configure:

```
PORT=5000
MONGO_URI=mongodb://localhost:27017/taskdb
JWT_SECRET=your_jwt_secret

```

### Run the Development Server
```bash
npm run start:dev
```

### Create a admin User with postman (JSON)

with this url `http://localhost:5000/user/register` or `{{env-url}}/user/register`
```bash
{
    "name": "One Admin",
    "title": "Sr. Developer",
    "role": "admin",
    "email": "one@admin.com",
    "password": "one@admin.com"  // make password same for testing
}

```
# after that login to the frontend and explore


The backend will be available at `http://localhost:5000/`.
