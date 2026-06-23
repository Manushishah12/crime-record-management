# Crime Record Management System with AI Assistant

A full-stack Crime Record Management System designed to help law enforcement agencies efficiently manage criminal records, cases, officers, evidence, and investigation workflows. The system provides secure role-based access for Administrators, Officers, and Viewers. It also includes an AI-powered Case Assistant that helps officers analyze case details, summarize evidence, review timelines, and answer investigation-related questions using Groq LLM integration.

## Authors

* Manushi Shah (Manushishah12)

## Features

* Role-based authentication (Admin, Officer)
* Only officers whose email addresses have been pre-approved and registered by the administrator can create accounts and log in.
* Secure JWT-based login and authorization
* Criminal record management
* Case creation and tracking
* Officer management and assignment
* Evidence upload and management
* Investigation timeline tracking
* Case status management (Open, Under Investigation, Closed)
* Dashboard with crime statistics and analytics
* Global search across cases, criminals, and officers
* PDF report generation
* AI-powered Case Assistant using Groq LLM
* RESTful APIs for frontend-backend communication
* MongoDB database for secure and scalable storage

## Tech Stack

### Frontend

* React.js
* JavaScript
* CSS
* React Router

### Backend

* Node.js
* Express.js

### Database

* MongoDB
* Mongoose

### Authentication

* JWT (JSON Web Token)
* bcrypt.js

### AI Integration

* Groq API
* Llama 3.3 70B Versatile Model

### Tools & Platforms

* MongoDB Atlas / MongoDB Compass
* GitHub
* Postman
* VS Code

## Environment Variables

Create a `.env` file inside the `server` folder and add:

```env
PORT=5000

MONGO_URI=your_mongodb_connection_string

JWT_SECRET=your_jwt_secret_key

GROQ_API_KEY=your_groq_api_key
```

## Installation

Clone the repository:

```bash
git clone https://github.com/Manushishah12/crime-record-management.git

cd crime-record-management
```

### Install Backend Dependencies

```bash
cd server

npm install
```

### Install Frontend Dependencies

```bash
cd ../client

npm install
```

## Running the Project

### Start Backend Server

```bash
cd server

npm run dev
```

or

```bash
node server.js
```

Backend runs on:

```text
http://localhost:5000
```

### Start Frontend

```bash
cd client

npm run dev
```

Frontend runs on:

```text
http://localhost:5173
```

## AI Case Assistant

The system includes an AI-powered investigation assistant that can:

* Summarize case details
* Identify assigned officers
* Summarize investigation timelines
* Answer case-related questions

The assistant uses Groq's Llama 3.3 70B model and only responds using information available within the selected case.

## Project Structure

```text
crime-record-management
│
├── client/
│   ├── src/
│   ├── public/
│   └── package.json
│
├── server/
│   ├── controllers/
│   ├── routes/
│   ├── models/
│   ├── middleware/
│   ├── uploads/
│   └── server.js
│
├── .gitignore
├── package.json
└── README.md
```

## Future Enhancements

* Real-time notifications
* Facial recognition integration
* Crime hotspot visualization
* AI-based suspect prediction
* Multi-language support
* Cloud file storage for evidence

## License

This project is developed for educational and academic purposes.

## Images

<img width="1026" height="742" alt="image" src="https://github.com/user-attachments/assets/45321f63-fd2b-47f3-be72-edb858176867" />
<img width="1610" height="837" alt="image" src="https://github.com/user-attachments/assets/450ad6d7-4131-49a5-9a3b-233f252d2045" />
<img width="1610" height="817" alt="image" src="https://github.com/user-attachments/assets/415a92e1-378b-465c-881f-db21fdf659c3" />
<img width="1282" height="807" alt="image" src="https://github.com/user-attachments/assets/d595f9dd-8135-469b-a63c-5cbdd0e94b20" />
<img width="1297" height="682" alt="image" src="https://github.com/user-attachments/assets/0b3d97e2-c2fe-4ccd-8e1e-ad5b8e4809ff" />


