# Docker Setup for Zanos Digital Nomad Platform

This guide covers how to run the Zanos application using Docker and Docker Compose.

## Prerequisites

- Docker Desktop (recommended) or Docker Engine
- Docker Compose v3.8+
- Git (to clone the repository)

## Quick Start

1. **Clone and navigate to the repository:**
   ```bash
   git clone https://github.com/zanegreyy/zanos.git
   cd zanos
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your actual API keys
   ```

3. **Run in development mode:**
   ```bash
   npm run docker:dev
   ```

4. **Access the application:**
   - Development: http://localhost:3000
   - Production: http://localhost:3001



## Docker Commands

### Development Mode

```bash
# Start development server with hot reload
npm run docker:dev

# Or use Docker Compose directly
docker-compose up app
```

### Production Mode

```bash
# Build and run production container
npm run docker:prod

# Or use Docker Compose directly
docker-compose --profile production up app-prod
```

### Other Useful Commands

```bash
# Build Docker image manually
npm run docker:build

# Stop all containers
npm run docker:down

# Clean up containers, volumes, and images
npm run docker:clean

# View running containers
docker ps

# View logs
docker-compose logs app
docker-compose logs -f app  # Follow logs
```

## Container Architecture

### Multi-Stage Dockerfile

The Dockerfile uses a multi-stage build process:

1. **Base Stage**: Node.js 20 Alpine Linux
2. **Dependencies Stage**: Install production dependencies
3. **Builder Stage**: Build the Next.js application
4. **Runner Stage**: Optimized production runtime

### Docker Compose Services

- **app**: Development service with hot reload
- **app-prod**: Production service (profile-based)
- **zanos-network**: Bridge network for service communication

## Development Workflow

### Hot Reload Development

The development container mounts your source code as volumes, enabling:
- Instant code changes reflection
- Preserved node_modules and .next cache
- Full Next.js development features

### File Structure

```
zanos/
├── Dockerfile              # Multi-stage production build
├── docker-compose.yml      # Development and production services
├── .dockerignore          # Files excluded from Docker context
├── DOCKER.md              # This documentation
└── .env.local             # Environment variables (create from .env.example)
```

## Troubleshooting

### Common Issues

1. **Port Already in Use:**
   ```bash
   # Check what's using the port
   lsof -i :3000
   
   # Kill the process or change the port in docker-compose.yml
   ```

2. **Environment Variables Not Loading:**
   ```bash
   # Ensure .env.local exists and has correct variables
   cat .env.local
   
   # Restart containers after env changes
   npm run docker:down && npm run docker:dev
   ```

3. **Build Failures:**
   ```bash
   # Clean up and rebuild
   npm run docker:clean
   npm run docker:build
   ```

4. **Permission Issues (Linux/macOS):**
   ```bash
   # Fix file permissions
   sudo chown -R $USER:$USER .
   ```

### Debugging

```bash
# Access container shell
docker-compose exec app sh

# View detailed logs
docker-compose logs --tail=100 app

# Inspect container
docker inspect zanos-dev
```

## Production Deployment

### Environment Variables for Production

Update your production environment with:

```bash
NEXT_PUBLIC_BASE_URL=https://your-domain.com
NODE_ENV=production
```

### Security Considerations

- Use secrets management for API keys
- Enable HTTPS in production
- Configure proper CORS settings
- Set up health checks and monitoring

### Scaling

For production scaling, consider:
- Using orchestration platforms (Kubernetes, Docker Swarm)
- Load balancers for multiple container instances
- Separate database containers
- CDN for static assets

## Next Steps

1. Set up CI/CD pipelines with Docker
2. Implement health checks
3. Add monitoring and logging
4. Configure production secrets management
5. Set up SSL/TLS certificates

For more information about the Zanos platform, see the main README.md file.