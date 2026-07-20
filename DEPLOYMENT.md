# Deployment Guide

This guide covers deploying the AI PDF to E-Course Learning Platform to production.

## Prerequisites

- Docker and Docker Compose installed
- PostgreSQL database (or use Supabase/Neon)
- Groq API key
- Google OAuth credentials (optional)

## Environment Variables

### Backend (.env)
```bash
DATABASE_URL=postgresql://user:password@host:5432/database
SECRET_KEY=your-secret-key-here
GROQ_API_KEY=your-groq-api-key
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760
CORS_ORIGINS=https://yourdomain.com
```

### Frontend (.env)
```bash
VITE_API_URL=https://your-api-domain.com/api
VITE_GOOGLE_CLIENT_ID=your-google-client-id
```

## Deployment Options

### Option 1: Docker Compose (Local/Development)

1. Clone the repository
2. Create `.env` files in both `frontend` and `backend` directories
3. Run with Docker Compose:

```bash
docker-compose up -d
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs

### Option 2: Render (Backend) + Vercel (Frontend)

#### Backend Deployment (Render)

1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Set environment variables in Render dashboard
4. Add a `render.yaml` file to your repository root:

```yaml
services:
  - type: web
    name: courseai-backend
    env: python
    buildCommand: pip install -r requirements.txt
    startCommand: uvicorn app.main:app --host 0.0.0.0 --port $PORT
    envVars:
      - key: DATABASE_URL
        fromDatabase:
          name: courseai-db
          property: connectionString
      - key: SECRET_KEY
        generateValue: true
      - key: GROQ_API_KEY
        sync: false
      - key: GOOGLE_CLIENT_ID
        sync: false
      - key: GOOGLE_CLIENT_SECRET
        sync: false
```

5. Deploy!

#### Frontend Deployment (Vercel)

1. Create a new project on Vercel
2. Import your GitHub repository
3. Set environment variables in Vercel dashboard
4. Add a `vercel.json` file to the frontend directory:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://your-backend-url.onrender.com/api/:path*"
    },
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

5. Deploy!

### Option 3: AWS (EC2 + RDS)

1. Launch an EC2 instance (Ubuntu 22.04)
2. Create an RDS PostgreSQL instance
3. SSH into EC2 and install Docker:

```bash
sudo apt update
sudo apt install docker.io docker-compose -y
sudo usermod -aG docker $USER
```

4. Clone the repository
5. Configure environment variables
6. Run with Docker Compose:

```bash
docker-compose up -d
```

7. Set up Nginx as reverse proxy (optional)
8. Configure SSL with Let's Encrypt (optional)

## Database Setup

### Using Supabase

1. Create a new project on Supabase
2. Get the database connection string
3. Set `DATABASE_URL` environment variable
4. Run migrations:

```bash
cd backend
alembic upgrade head
```

### Using Neon

1. Create a new project on Neon
2. Get the database connection string
3. Set `DATABASE_URL` environment variable
4. Run migrations

### Using Local PostgreSQL

```bash
# Create database
createdb courseai

# Run migrations
cd backend
alembic upgrade head
```

## Monitoring and Logging

### Backend Logs

```bash
# Docker Compose
docker-compose logs -f backend

# Render
View logs in Render dashboard

# AWS/EC2
docker logs -f courseai_backend
```

### Health Check

```bash
curl https://your-api-domain.com/health
```

Expected response:
```json
{"status": "healthy"}
```

## Scaling Considerations

### Backend

- Use a load balancer for multiple instances
- Implement Redis for caching
- Use CDN for static file serving
- Consider using Celery for background tasks

### Frontend

- Vercel handles scaling automatically
- Implement CDN for assets
- Use service workers for offline support

### Database

- Use connection pooling
- Implement read replicas
- Consider using a managed database service

## Security Best Practices

1. **Environment Variables**: Never commit `.env` files
2. **Secrets**: Use a secrets manager (AWS Secrets Manager, HashiCorp Vault)
3. **HTTPS**: Always use HTTPS in production
4. **CORS**: Restrict CORS origins to your domain
5. **Rate Limiting**: Implement rate limiting on API endpoints
6. **Input Validation**: Validate all user inputs
7. **SQL Injection**: Use parameterized queries (ORM handles this)
8. **XSS**: Sanitize user-generated content
9. **CSRF**: Implement CSRF protection for forms
10. **Dependencies**: Regularly update dependencies

## Backup Strategy

### Database Backups

```bash
# Manual backup
pg_dump $DATABASE_URL > backup.sql

# Automated backup (cron)
0 2 * * * pg_dump $DATABASE_URL > /backups/courseai-$(date +\%Y\%m\%d).sql
```

### File Backups

```bash
# Backup uploads
tar -czf uploads-backup.tar.gz uploads/

# Backup vector stores
tar -czf vector-stores-backup.tar.gz vector_stores/
```

## Troubleshooting

### Backend Won't Start

1. Check environment variables are set
2. Verify database connection
3. Check logs: `docker-compose logs backend`
4. Ensure all dependencies are installed

### Frontend Build Fails

1. Clear node_modules: `rm -rf node_modules package-lock.json`
2. Reinstall: `npm install`
3. Check TypeScript errors
4. Verify environment variables

### Database Connection Issues

1. Verify DATABASE_URL format
2. Check database is accessible
3. Ensure firewall allows connection
4. Verify credentials

## Performance Optimization

### Backend

- Enable query caching
- Use database indexes
- Implement pagination
- Optimize N+1 queries
- Use connection pooling

### Frontend

- Code splitting
- Lazy loading
- Image optimization
- Minimize bundle size
- Enable compression

## Cost Estimation

### Render (Backend)
- Free tier: $0/month (limited)
- Standard: $7/month
- Pro: $25/month

### Vercel (Frontend)
- Hobby: $0/month
- Pro: $20/month

### Supabase (Database)
- Free: 500MB database
- Pro: $25/month

### AWS (EC2 + RDS)
- t3.micro: ~$15/month
- t3.small: ~$25/month
- RDS: ~$15-100/month depending on instance

## Support

For issues or questions:
- Check the GitHub Issues
- Review API documentation at `/docs`
- Check logs for error messages
