# ShuttleUP - Badminton Club Booking System

A modern badminton club management system built with React and MongoDB Atlas.

## Features

- User registration and authentication
- Session booking and management
- Credit system for payments
- Admin dashboard for user and session management
- Division-based session filtering
- Credit transaction history
- Recurring session creation

## Setup Instructions

### 1. MongoDB Atlas Setup

1. **Create a MongoDB Atlas Account**
   - Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
   - Sign up for a free account

2. **Create a Cluster**
   - Click "Build a Database"
   - Choose "Shared" (free tier)
   - Select your preferred cloud provider and region
   - Click "Create Cluster"

3. **Create Database User**
   - Go to "Database Access" in the left sidebar
   - Click "Add New Database User"
   - Choose "Password" authentication
   - Create a username and secure password
   - Set user privileges to "Read and write to any database"
   - Click "Add User"

4. **Configure Network Access**
   - Go to "Network Access" in the left sidebar
   - Click "Add IP Address"
   - For development, you can click "Allow Access from Anywhere" (0.0.0.0/0)
   - For production, add your specific IP addresses

5. **Get Connection String**
   - Go to "Database" in the left sidebar
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
   - It will look like: `mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`

### 2. Environment Configuration

1. **Update .env file**
   ```env
   # Replace with your actual MongoDB Atlas connection string
   MONGODB_URI=mongodb+srv://your-username:your-password@your-cluster.mongodb.net/shuttleup?retryWrites=true&w=majority
   
   # Generate a secure JWT secret (you can use: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
   JWT_SECRET=your-super-secure-jwt-secret-key-here
   
   PORT=5000
   FRONTEND_URL=http://localhost:5173
   ```

2. **Create .env.local for frontend** (optional)
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

### 3. Installation and Running

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start the Application**
   ```bash
   # Start both frontend and backend
   npm run dev:full
   
   # Or start them separately:
   # Backend only
   npm run server
   
   # Frontend only (in another terminal)
   npm run dev
   ```

3. **Access the Application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000

### 4. Default Admin Account

The system automatically creates a default admin account:
- **Email**: admin@shuttleup.com
- **Password**: admin123

Use this account to:
- Approve new user registrations
- Create badminton sessions
- Manage user credits
- View all system data

### 5. Database Collections

The system will automatically create these collections in MongoDB:
- `users` - User accounts and profiles
- `sessions` - Badminton sessions
- `bookings` - Session bookings
- `credittransactions` - Credit transaction history

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login

### Users (Admin only)
- `GET /api/users` - Get all users
- `PUT /api/users/:id` - Update user
- `POST /api/users/:id/credits` - Add credits to user

### Sessions
- `GET /api/sessions` - Get all upcoming sessions
- `POST /api/sessions` - Create new session (Admin only)
- `POST /api/sessions/:id/book` - Book a session
- `DELETE /api/sessions/:id/book` - Cancel booking

### Credit History
- `GET /api/users/:id/credit-history` - Get user's credit transaction history

## Production Deployment

### Backend Deployment (Railway/Heroku/DigitalOcean)
1. Deploy the backend to your preferred platform
2. Set environment variables in your hosting platform
3. Update the frontend API URL

### Frontend Deployment (Netlify/Vercel)
1. Build the frontend: `npm run build`
2. Deploy the `dist` folder
3. Set the `VITE_API_URL` environment variable to your backend URL

## Security Notes

- JWT tokens expire after 24 hours
- Passwords are hashed using bcrypt
- Admin-only endpoints are protected
- Users can only access their own data
- Input validation on all endpoints

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Check your connection string
   - Verify network access settings
   - Ensure database user credentials are correct

2. **CORS Errors**
   - Make sure the backend is running
   - Check the FRONTEND_URL in your .env file

3. **JWT Token Issues**
   - Clear localStorage and login again
   - Check if JWT_SECRET is set correctly

### Development Tips

- Use MongoDB Compass to view your database
- Check browser console for frontend errors
- Check server logs for backend errors
- Use Postman to test API endpoints directly