# Docker Deployment Guide (API Only)

## Prerequisites
- Docker installed on your system
- Docker Compose installed
- Existing MySQL database container running
- Existing phpMyAdmin container (optional)

## Quick Start

1. **Clone and navigate to the project directory**
   ```bash
   cd api-database-film
   ```

2. **Create environment file**
   ```bash
   cp .env.example .env
   ```
   Then edit the `.env` file with your actual database connection details.

3. **Build and run with Docker Compose**
   ```bash
   docker-compose up -d
   ```

4. **Check if service is running**
   ```bash
   docker-compose ps
   ```

## Services

The docker-compose setup includes:

- **API Application** (Port 5000): Your Node.js REST API only

## Database Connection

This setup assumes you have:
- MySQL database running in a separate container
- phpMyAdmin running in a separate container (optional)

Make sure to configure the correct database connection in your `.env` file:

## Environment Variables

Make sure to set these variables in your `.env` file:

### Database (External Container)
- `DB_HOST`: Database host (usually 'localhost' or container name)
- `DB_PORT`: Database port (usually 3306)
- `DB_NAME`: Database name
- `DB_USER`: Database username
- `DB_PASSWORD`: Database password

### Application
- `JWT_SECRET`: Secret key for JWT tokens
- `PORT`: Application port (default: 5000)

### Firebase (if using Firebase features)
- `FIREBASE_PROJECT_ID`
- `FIREBASE_PRIVATE_KEY`
- `FIREBASE_CLIENT_EMAIL`

### Email (for OTP functionality)
- `EMAIL_USER`
- `EMAIL_PASSWORD`

### APIs (if using external services)
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_REFRESH_TOKEN`
- `IMGUR_CLIENT_ID`

## Common Commands

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs api
docker-compose logs mysql

# Rebuild and start
docker-compose up --build -d

# Execute commands in API container
docker-compose exec api npm run seed

# Access MySQL directly
docker-compose exec mysql mysql -u root -p
```

## Accessing Services

- **API**: http://localhost:5000
- **Database**: Access through your existing MySQL container
- **phpMyAdmin**: Access through your existing phpMyAdmin container

## Troubleshooting

1. **Port conflicts**: Change API port in docker-compose.yml if needed
2. **Permission issues**: Make sure uploads directory is writable
3. **Database connection**: 
   - Ensure your MySQL container is running
   - Check DB_HOST, DB_PORT in .env file
   - If using Docker network, use container name as DB_HOST
   - If using host network, use 'localhost' as DB_HOST
4. **Firebase issues**: Check if Firebase service account key file exists
5. **Network issues**: Make sure API container can reach your database container

## Production Deployment

For production:
1. Update `.env` with production values
2. Consider using Docker secrets for sensitive data
3. Set up proper SSL/TLS certificates
4. Configure proper backup strategy for database
5. Set up monitoring and logging