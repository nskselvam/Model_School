# Examination Onscreen Valuation System

A comprehensive web-based examination and valuation management system with separate backend and frontend components. This system allows for onscreen examination administration, result valuation, and user management.

## Table of Contents

- [Features](#features)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [Project Structure Details](#project-structure-details)
- [Contributing](#contributing)

## Features

- **User Authentication**: Secure login system with JWT token-based authentication
- **Role-Based Access**: Support for different user roles (Admin, Examiner, Student)
- **Dashboard**: Role-specific dashboards for different user types
- **Examination Management**: Tools for managing examinations and questions
- **Password Reset**: Secure password reset functionality
- **Question Bank**: Manage and organize examination questions
- **Real-time Updates**: Redux-based state management for smooth data synchronization

## Project Structure

```
Examination_Onscreen_Valuation/
├── backend/                 # Node.js/Express backend
│   ├── app.js              # Main application file
│   ├── package.json        # Backend dependencies
│   ├── config/             # Configuration files
│   ├── controller/         # Request handlers
│   ├── db/                 # Database configuration and models
│   ├── middleware/         # Express middleware
│   ├── router/             # API routes
│   └── utils/              # Utility functions
└── frontend/               # React/Vite frontend
    ├── package.json        # Frontend dependencies
    ├── vite.config.js      # Vite configuration
    ├── index.html          # HTML entry point
    └── src/
        ├── App.jsx         # Main App component
        ├── main.jsx        # Entry point
        ├── components/     # Reusable components
        ├── pages/          # Page components
        ├── redux-slice/    # Redux slices and API integration
        ├── router/         # Route configuration
        ├── hooks/          # Custom React hooks
        ├── constraint/     # Constants and constraints
        ├── style/          # Styling files
        └── private/        # Protected route components
```

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v14.0 or higher) - [Download](https://nodejs.org/)
- **npm** (v6.0 or higher) - Comes with Node.js
- **Git** - [Download](https://git-scm.com/)
- **Database**: MySQL or PostgreSQL (based on your configuration)

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/nskselvam/Examination_Onscreen_Valuation.git
cd Examination_Onscreen_Valuation
```

### 2. Backend Setup

Navigate to the backend directory and install dependencies:

```bash
cd backend
npm install
```

#### Configure Environment Variables

Create a `.env` file in the `backend` directory with the following variables:

```env
# Database Configuration
DB_HOST=localhost
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=examination_db
DB_DIALECT=mysql

# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your_secret_key_here
JWT_EXPIRE=7d

# Email Configuration (if applicable)
EMAIL_HOST=your_email_host
EMAIL_PORT=587
EMAIL_USER=your_email
EMAIL_PASSWORD=your_email_password
```

#### Database Setup

```bash
# Run migrations
npx sequelize-cli db:migrate

# Run seeders (optional)
npx sequelize-cli db:seed:all
```

### 3. Frontend Setup

Navigate to the frontend directory and install dependencies:

```bash
cd ../frontend
npm install
```

#### Configure API Endpoint

Update the API endpoint in `src/constraint/constraint.js`:

```javascript
// Set your backend API URL
const API_BASE_URL = 'http://localhost:5000/api';
```

## Running the Application

### Start the Backend Server

```bash
cd backend
npm start
```

The backend server will run on `http://localhost:5000`

### Start the Frontend Development Server

In a new terminal:

```bash
cd frontend
npm run dev
```

The frontend will run on `http://localhost:5173` (or the port shown in your terminal)

## Project Structure Details

### Backend

- **config/**: Database and application configuration
- **controller/**: Request handlers and business logic
  - `authController.js`: Authentication related endpoints
- **db/**: 
  - `models/`: Sequelize models for database entities
  - `migrations/`: Database schema migrations
  - `seeders/`: Initial data seeders
- **middleware/**: Custom Express middleware
  - `errorController.js`: Error handling middleware
- **router/**: API route definitions
  - `authRouter.js`: Authentication routes
- **utils/**: Helper functions
  - `appError.js`: Custom error class
  - `catchAsync.js`: Async error handler
  - `formatDateTime.js`: Date/time formatting utilities
  - `jwtToken.js`: JWT token operations

### Frontend

- **components/**: Reusable React components
  - `Login/`: Login card and password input components
  - `Navbar/`: Navigation bar components
  - `DashboardComponents/`: Dashboard related components
  - `ResetComponents/`: Password reset components
- **pages/**: Full page components
  - `Login/`: Login page
  - `Dashboard/`: Dashboard pages for different roles
  - `reset_password/`: Password reset page
- **redux-slice/**: Redux state management
  - `authSlice.js`: Authentication state
  - `authApiSlice.js`: Authentication API calls
  - `apiSlice.js`: General API configuration
  - `examApiSlice.js`: Examination API calls
  - `qbankApiSlice.js`: Question bank API calls
- **router/**: React Router configuration
- **hooks/**: Custom React hooks
  - `useAuth.js`: Authentication hook
- **constraint/**: Application constants and constraints
- **style/**: CSS styling files

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/reset-password` - Reset password
- `POST /api/auth/refresh-token` - Refresh JWT token

## Environment Configuration

The application uses environment-specific configurations:

- **Development**: `NODE_ENV=development`
- **Production**: `NODE_ENV=production`

Ensure the appropriate environment variables are set in your `.env` file.

## Troubleshooting

### Backend Issues

1. **Port already in use**: Change the `PORT` in `.env` file
2. **Database connection error**: Verify database credentials and ensure database service is running
3. **Dependencies issue**: Delete `node_modules` and `package-lock.json`, then run `npm install` again

### Frontend Issues

1. **API connection error**: Verify the API endpoint in `constraint.js` matches your backend URL
2. **Port conflict**: Vite will automatically use a different port if 5173 is occupied
3. **Redux state issues**: Clear browser cache and reload the application

## Contributing

To contribute to this project:

1. Create a feature branch (`git checkout -b feature/AmazingFeature`)
2. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
3. Push to the branch (`git push origin feature/AmazingFeature`)
4. Open a Pull Request

## License

This project is private. Please contact the repository owner for licensing information.

## Support

For issues and questions, please open an issue on the [GitHub repository](https://github.com/nskselvam/Examination_Onscreen_Valuation).

---

**Last Updated**: January 2, 2026
# Common_structure
