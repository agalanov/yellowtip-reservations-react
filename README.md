# Myolika Reservations - React Version

A modern reservation management system for spas and wellness centers, built with React, TypeScript, Node.js, Prisma, Nest, Next and PostgreSQL.

## 🚀 Features

- **Modern Tech Stack**: React 18, TypeScript, Node.js, Express, Prisma, PostgreSQL
- **Docker Support**: Full containerization with Docker Compose
- **Responsive UI**: Material-UI components with modern design
- **Real-time Updates**: React Query for efficient data fetching
- **Authentication**: JWT-based authentication system
- **Role-based Access**: Granular permissions system
- **Booking Management**: Complete reservation lifecycle management
- **Multi-entity Support**: Rooms, Services, Guests, Therapists
- **Admin Dashboard**: Comprehensive management interface

## 📋 Prerequisites

- Node.js 18+ 
- Docker & Docker Compose
- Git

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd yellowtip-reservations-react
   ```

2. **Start the services with Docker Compose**
   ```bash
   docker-compose up -d
   ```

3. **Initialize the database**
   ```bash
   # Backend container should be running
   docker-compose exec backend npm run prisma:migrate
   docker-compose exec backend npm run prisma:seed
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001/api
   - Database: localhost:5432

## 🔧 Development

### Backend Development

```bash
cd backend
npm install
npm run dev
```

### Frontend Development

```bash
cd frontend
npm install
npm start
```

### Database Management

```bash
# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Seed database
npm run prisma:seed

# Open Prisma Studio
npm run prisma:studio
```

## 📁 Project Structure

```
yellowtip-reservations-react/
├── backend/                 # Node.js/Express API
│   ├── src/
│   │   ├── controllers/     # Route controllers
│   │   ├── middleware/      # Express middleware
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic
│   │   ├── types/           # TypeScript types
│   │   └── utils/           # Utility functions
│   ├── prisma/              # Database schema & migrations
│   └── package.json
├── frontend/                # React application
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── pages/           # Page components
│   │   ├── hooks/           # Custom hooks
│   │   ├── services/        # API services
│   │   ├── types/           # TypeScript types
│   │   └── contexts/        # React contexts
│   └── package.json
├── docker/                  # Docker configuration
├── docker-compose.yml       # Multi-container setup
└── README.md
```

## 🔐 Default Credentials

- **Username**: admin
- **Password**: admin123

## 🗄️ Database Schema

The application uses PostgreSQL with Prisma ORM. Key entities include:

- **Accounts**: User management and authentication
- **Bookings**: Reservation records
- **Rooms**: Physical spaces for services
- **Services**: Available treatments and services
- **Guests**: Customer information
- **Therapists**: Staff members
- **Roles & Permissions**: Access control system

## 🚀 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/verify` - Verify token

### Bookings
- `GET /api/bookings` - List bookings
- `POST /api/bookings` - Create booking
- `GET /api/bookings/:id` - Get booking details
- `PUT /api/bookings/:id` - Update booking
- `DELETE /api/bookings/:id` - Delete booking

### Rooms
- `GET /api/rooms` - List rooms
- `POST /api/rooms` - Create room
- `GET /api/rooms/:id` - Get room details
- `PUT /api/rooms/:id` - Update room
- `DELETE /api/rooms/:id` - Delete room

### Services
- `GET /api/services` - List services
- `POST /api/services` - Create service
- `GET /api/services/:id` - Get service details
- `PUT /api/services/:id` - Update service
- `DELETE /api/services/:id` - Delete service

### Guests
- `GET /api/guests` - List guests
- `POST /api/guests` - Create guest
- `GET /api/guests/:id` - Get guest details
- `PUT /api/guests/:id` - Update guest
- `DELETE /api/guests/:id` - Delete guest

### Therapists
- `GET /api/therapists` - List therapists
- `POST /api/therapists` - Create therapist
- `GET /api/therapists/:id` - Get therapist details
- `PUT /api/therapists/:id` - Update therapist
- `DELETE /api/therapists/:id` - Delete therapist

### Admin
- `GET /api/admin/dashboard` - Dashboard statistics
- `GET /api/admin/config` - System configuration
- `PUT /api/admin/config` - Update configuration
- `GET /api/admin/users` - List users
- `POST /api/admin/users` - Create user
- `PUT /api/admin/users/:id` - Update user
- `DELETE /api/admin/users/:id` - Delete user

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## 📦 Deployment

### Production Build

```bash
# Build backend
cd backend
npm run build

# Build frontend
cd frontend
npm run build
```

### Docker Production

```bash
docker-compose -f docker-compose.prod.yml up -d
```

## 🔧 Environment Variables

### Backend (.env)
```
DATABASE_URL="postgresql://user:password@localhost:5432/database"
REDIS_URL="redis://localhost:6379"
JWT_SECRET="your-secret-key"
PORT=3001
NODE_ENV=production
FRONTEND_URL="http://localhost:3000"
```

### Frontend (.env)
```
REACT_APP_API_URL="http://localhost:3001/api"
REACT_APP_WS_URL="ws://localhost:3001"
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

## 🆘 Support

For support and questions, please open an issue in the repository.

## 🔄 Migration from PHP

This React version is a complete rewrite of the original PHP5 Myolika Reservations system, featuring:

- Modern, maintainable codebase
- Type safety with TypeScript
- Better performance and scalability
- Improved user experience
- Mobile-responsive design
- Better security practices
- Comprehensive API documentation

The database schema has been preserved and enhanced to maintain compatibility with existing data.
