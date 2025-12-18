# Janji.in - Self-Hosted Deployment Guide

This guide provides step-by-step instructions for deploying Janji.in on your own server.

## Table of Contents

1. [System Requirements](#system-requirements)
2. [Prerequisites](#prerequisites)
3. [Installation](#installation)
4. [Configuration](#configuration)
5. [Database Setup](#database-setup)
6. [Building for Production](#building-for-production)
7. [Running in Production](#running-in-production)
8. [Reverse Proxy Setup](#reverse-proxy-setup)
9. [SSL/HTTPS Configuration](#sslhttps-configuration)
10. [Troubleshooting](#troubleshooting)

---

## System Requirements

- **OS**: Linux (Ubuntu 20.04+ recommended), macOS, or Windows Server
- **Node.js**: v20.x or higher
- **PostgreSQL**: v14 or higher
- **RAM**: Minimum 1GB, recommended 2GB+
- **Storage**: Minimum 1GB free space
- **CPU**: 1 core minimum, 2+ cores recommended

---

## Prerequisites

### Install Node.js 20.x

```bash
# Using nvm (recommended)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 20
nvm use 20

# Verify installation
node --version  # Should show v20.x.x
npm --version   # Should show 10.x.x
```

### Install PostgreSQL

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install postgresql postgresql-contrib

# Start PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Verify installation
psql --version
```

---

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/your-org/janji-in.git
cd janji-in/Janji-In
```

### 2. Install Dependencies

```bash
npm install
```

---

## Configuration

### Environment Variables

Create a `.env` file in the `Janji-In` directory:

```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/janjiin

# Server
PORT=5000
NODE_ENV=production

# Security (IMPORTANT: Change these in production!)
JWT_SECRET=your-super-secret-jwt-key-min-32-characters-long

# Optional: CORS
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

### Environment Variable Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | Yes | - | PostgreSQL connection string |
| `PORT` | No | 5000 | Server port |
| `NODE_ENV` | No | development | Environment mode |
| `JWT_SECRET` | Yes* | (insecure default) | Secret key for JWT tokens |
| `ALLOWED_ORIGINS` | No | localhost | Comma-separated allowed origins for CORS |

*Required for production deployments

---

## Database Setup

### 1. Create Database and User

```bash
# Access PostgreSQL as superuser
sudo -u postgres psql

# Create database and user
CREATE USER janjiin WITH PASSWORD 'your-secure-password';
CREATE DATABASE janjiin OWNER janjiin;
GRANT ALL PRIVILEGES ON DATABASE janjiin TO janjiin;

# Exit psql
\q
```

### 2. Push Database Schema

```bash
# Ensure DATABASE_URL is set before running
export DATABASE_URL="postgresql://user:password@localhost:5432/janjiin"

# This creates/updates all necessary tables
npm run db:push

# If you encounter errors, you can force push (use with caution)
# npx drizzle-kit push --force
```

**Important Notes:**
- Drizzle uses the `DATABASE_URL` from your environment
- Never change primary key column types in production
- Back up your database before pushing schema changes

---

## Building for Production

### 1. Build the Application

```bash
npm run build
```

This creates:
- `dist/index.cjs` - Compiled server bundle
- `dist/public/` - Static frontend files

### 2. Verify Build

```bash
ls -la dist/
# Should show index.cjs and public/ directory
```

---

## Running in Production

### Option 1: Direct Node.js

```bash
NODE_ENV=production node dist/index.cjs
```

### Option 2: Using PM2 (Recommended)

PM2 provides process management, auto-restart, and logging.

```bash
# Install PM2 globally
npm install -g pm2

# Start application
pm2 start dist/index.cjs --name janjiin

# View logs
pm2 logs janjiin

# Monitor
pm2 monit

# Enable startup on reboot
pm2 startup
pm2 save
```

### Option 3: Using Systemd

Create `/etc/systemd/system/janjiin.service`:

```ini
[Unit]
Description=Janji.in Booking Platform
After=network.target postgresql.service

[Service]
Type=simple
User=www-data
WorkingDirectory=/path/to/janji-in/Janji-In
Environment=NODE_ENV=production
Environment=PORT=5000
EnvironmentFile=/path/to/janji-in/Janji-In/.env
ExecStart=/usr/bin/node dist/index.cjs
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Enable and start:

```bash
sudo systemctl daemon-reload
sudo systemctl enable janjiin
sudo systemctl start janjiin
sudo systemctl status janjiin
```

---

## Reverse Proxy Setup

### Nginx Configuration

Create `/etc/nginx/sites-available/janjiin`:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # WebSocket support
    location /ws {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_read_timeout 86400;
    }
}
```

Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/janjiin /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## SSL/HTTPS Configuration

### Using Let's Encrypt (Certbot)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Verify auto-renewal
sudo certbot renew --dry-run
```

---

## Troubleshooting

### Common Issues

#### 1. Database Connection Failed

```
Error: connection refused to localhost:5432
```

**Solution:**
- Check PostgreSQL is running: `sudo systemctl status postgresql`
- Verify DATABASE_URL is correct
- Check pg_hba.conf allows connections

#### 2. Port Already in Use

```
Error: EADDRINUSE: address already in use :::5000
```

**Solution:**
```bash
# Find process using port
sudo lsof -i :5000
# Kill process or change PORT in .env
```

#### 3. Permission Denied

```
Error: EACCES: permission denied
```

**Solution:**
- Check file permissions: `ls -la`
- Run as correct user (not root for security)

#### 4. WebSocket Connection Failed

```
WebSocket connection to 'wss://...' failed
```

**Solution:**
- Ensure Nginx WebSocket config is correct
- Check firewall allows WebSocket connections
- Verify HTTPS is properly configured

### Logs and Debugging

```bash
# View PM2 logs
pm2 logs janjiin

# View systemd logs
journalctl -u janjiin -f

# Check PostgreSQL logs
sudo tail -f /var/log/postgresql/postgresql-*-main.log
```

### Health Check

Test if the application is running:

```bash
curl http://localhost:5000/api/auth/me
# Should return 401 (unauthorized) - meaning server is responding
```

---

## Updating the Application

```bash
# Pull latest changes
git pull origin main

# Install dependencies
npm install

# Rebuild
npm run build

# Push any database schema changes
npm run db:push

# Restart application
pm2 restart janjiin
# OR
sudo systemctl restart janjiin
```

---

## Security Checklist

- [ ] Change JWT_SECRET to a strong, unique value (32+ characters)
- [ ] Use HTTPS in production
- [ ] Configure firewall (allow only 80, 443, 22)
- [ ] Set up regular database backups
- [ ] Use strong PostgreSQL password
- [ ] Run as non-root user
- [ ] Keep Node.js and dependencies updated
- [ ] Configure rate limiting in production

---

## Support

For issues and feature requests, please open an issue on GitHub.

---

*Last updated: December 2025*
