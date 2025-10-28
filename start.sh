#!/bin/bash

# YellowTip Reservations - Start Script
echo "🚀 Starting YellowTip Reservations System..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Start services with Docker Compose
echo "📦 Starting services with Docker Compose..."
docker-compose up -d

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 10

# Check if backend is ready
echo "🔍 Checking backend health..."
max_attempts=30
attempt=1

while [ $attempt -le $max_attempts ]; do
    if curl -f http://localhost:3001/health > /dev/null 2>&1; then
        echo "✅ Backend is ready!"
        break
    fi
    
    if [ $attempt -eq $max_attempts ]; then
        echo "❌ Backend failed to start after $max_attempts attempts"
        echo "📋 Checking logs..."
        docker-compose logs backend
        exit 1
    fi
    
    echo "⏳ Attempt $attempt/$max_attempts - Backend not ready yet..."
    sleep 2
    attempt=$((attempt + 1))
done

# Initialize database
echo "🗄️ Initializing database..."
docker-compose exec -T backend npm run prisma:migrate
docker-compose exec -T backend npm run prisma:seed

# Check if frontend is ready
echo "🔍 Checking frontend..."
max_attempts=30
attempt=1

while [ $attempt -le $max_attempts ]; do
    if curl -f http://localhost:3000 > /dev/null 2>&1; then
        echo "✅ Frontend is ready!"
        break
    fi
    
    if [ $attempt -eq $max_attempts ]; then
        echo "❌ Frontend failed to start after $max_attempts attempts"
        echo "📋 Checking logs..."
        docker-compose logs frontend
        exit 1
    fi
    
    echo "⏳ Attempt $attempt/$max_attempts - Frontend not ready yet..."
    sleep 2
    attempt=$((attempt + 1))
done

echo ""
echo "🎉 YellowTip Reservations System is ready!"
echo ""
echo "📱 Frontend: http://localhost:3000"
echo "🔧 Backend API: http://localhost:3001/api"
echo "🗄️ Database: localhost:5432"
echo ""
echo "🔐 Default credentials:"
echo "   Username: admin"
echo "   Password: admin123"
echo ""
echo "📋 To view logs: docker-compose logs -f"
echo "🛑 To stop: docker-compose down"
echo ""
