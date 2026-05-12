# Redis Installation Guide

## Table of Contents
1. [Overview](#overview)
2. [macOS Installation](#macos-installation)
3. [Ubuntu/Debian Installation](#ubuntudebian-installation)
4. [CentOS/RHEL Installation](#centosrhel-installation)
5. [Windows Installation](#windows-installation)
6. [Verify Installation](#verify-installation)
7. [Basic Configuration](#basic-configuration)
8. [Running Redis as a Service](#running-redis-as-a-service)
9. [Connecting to Redis](#connecting-to-redis)
10. [Troubleshooting](#troubleshooting)

---

## Overview

Redis (Remote Dictionary Server) is an in-memory data structure store used as a database, cache, and message broker. This guide covers installation on various operating systems.

**System Requirements:**
- Minimum 1GB RAM (2GB+ recommended for production)
- Linux/Unix-based OS recommended (macOS, Ubuntu, CentOS)
- Port 6379 available (default Redis port)

---

## macOS Installation

### Method 1: Using Homebrew (Recommended)

1. **Install Homebrew** (if not already installed):
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

2. **Install Redis**:
```bash
brew install redis
```

3. **Start Redis**:
```bash
# Start Redis now and restart at login
brew services start redis

# Or start Redis in foreground (stops when terminal closes)
redis-server /usr/local/etc/redis.conf
```

4. **Stop Redis**:
```bash
brew services stop redis
```

### Method 2: From Source

```bash
# Download and compile
curl -O http://download.redis.io/redis-stable.tar.gz
tar xzvf redis-stable.tar.gz
cd redis-stable
make
make test
sudo make install
```

---

## Ubuntu/Debian Installation

### Method 1: Using APT (Recommended)

```bash
# Update package list
sudo apt update

# Install Redis
sudo apt install redis-server -y

# Check Redis status
sudo systemctl status redis-server
```

### Method 2: Install Latest Version from Source

```bash
# Install dependencies
sudo apt update
sudo apt install build-essential tcl -y

# Download Redis
cd /tmp
curl -O http://download.redis.io/redis-stable.tar.gz
tar xzvf redis-stable.tar.gz
cd redis-stable

# Compile and install
make
make test
sudo make install

# Create Redis user and directories
sudo adduser --system --group --no-create-home redis
sudo mkdir /var/lib/redis
sudo chown redis:redis /var/lib/redis
sudo chmod 770 /var/lib/redis
```

---

## CentOS/RHEL Installation

### Using YUM/DNF

```bash
# Enable EPEL repository
sudo yum install epel-release -y
# OR for CentOS 8+
sudo dnf install epel-release -y

# Install Redis
sudo yum install redis -y
# OR for CentOS 8+
sudo dnf install redis -y

# Start Redis
sudo systemctl start redis
sudo systemctl enable redis

# Check status
sudo systemctl status redis
```

### From Source

```bash
# Install dependencies
sudo yum groupinstall "Development Tools" -y
sudo yum install tcl -y

# Download and install
cd /tmp
curl -O http://download.redis.io/redis-stable.tar.gz
tar xzvf redis-stable.tar.gz
cd redis-stable
make
make test
sudo make install
```

---

## Windows Installation

### Using Windows Subsystem for Linux (WSL) - Recommended

1. **Install WSL**:
```powershell
wsl --install
```

2. **Follow Ubuntu installation steps** above within WSL.

### Using Redis for Windows (Legacy)

**Note**: Official Redis does not support Windows. Use WSL or Docker instead.

**Alternative - Docker**:
```bash
# Pull Redis image
docker pull redis:latest

# Run Redis container
docker run --name redis-server -p 6379:6379 -d redis

# Run with persistence
docker run --name redis-server -p 6379:6379 -v redis-data:/data -d redis redis-server --appendonly yes
```

---

## Verify Installation

### Check Redis Version
```bash
redis-server --version
```

### Test Redis CLI
```bash
# Connect to Redis CLI
redis-cli

# Inside Redis CLI, test basic commands:
127.0.0.1:6379> ping
PONG

127.0.0.1:6379> set test "Hello Redis"
OK

127.0.0.1:6379> get test
"Hello Redis"

127.0.0.1:6379> exit
```

### Check Redis is Running
```bash
# Check if Redis is listening on port 6379
sudo netstat -tulpn | grep 6379

# OR using ss command
sudo ss -tulpn | grep 6379

# OR check process
ps aux | grep redis
```

---

## Basic Configuration

### Redis Configuration File Locations

- **macOS (Homebrew)**: `/usr/local/etc/redis.conf`
- **Ubuntu/Debian**: `/etc/redis/redis.conf`
- **CentOS/RHEL**: `/etc/redis.conf`

### Important Configuration Options

```bash
# Edit configuration file
sudo nano /etc/redis/redis.conf
```

**Key Settings:**

```conf
# Bind to specific IP (use 0.0.0.0 to accept connections from any IP)
bind 127.0.0.1

# Port
port 6379

# Enable password protection
requirepass your_strong_password_here

# Set maximum memory
maxmemory 256mb
maxmemory-policy allkeys-lru

# Enable persistence (RDB snapshots)
save 900 1
save 300 10
save 60 10000

# Enable AOF (Append Only File) for better durability
appendonly yes
appendfilename "appendonly.aof"

# Log level (debug, verbose, notice, warning)
loglevel notice

# Log file location
logfile /var/log/redis/redis-server.log

# Working directory for data files
dir /var/lib/redis
```

### Apply Configuration Changes

```bash
# Restart Redis to apply changes
sudo systemctl restart redis

# OR on macOS
brew services restart redis
```

---

## Running Redis as a Service

### Ubuntu/Debian Systemd Service

Create service file:
```bash
sudo nano /etc/systemd/system/redis.service
```

Add the following content:
```ini
[Unit]
Description=Redis In-Memory Data Store
After=network.target

[Service]
User=redis
Group=redis
ExecStart=/usr/local/bin/redis-server /etc/redis/redis.conf
ExecStop=/usr/local/bin/redis-cli shutdown
Restart=always

[Install]
WantedBy=multi-user.target
```

Enable and start service:
```bash
sudo systemctl daemon-reload
sudo systemctl enable redis
sudo systemctl start redis
sudo systemctl status redis
```

### Service Management Commands

```bash
# Start Redis
sudo systemctl start redis

# Stop Redis
sudo systemctl stop redis

# Restart Redis
sudo systemctl restart redis

# Check status
sudo systemctl status redis

# Enable auto-start on boot
sudo systemctl enable redis

# Disable auto-start
sudo systemctl disable redis

# View logs
sudo journalctl -u redis -f
```

---

## Connecting to Redis

### From Command Line

```bash
# Connect to local Redis
redis-cli

# Connect to remote Redis
redis-cli -h hostname -p port -a password

# Example
redis-cli -h 192.168.1.100 -p 6379 -a mypassword
```

### From Node.js Application

Install Redis client:
```bash
npm install redis
```

Example connection:
```javascript
const redis = require('redis');

const client = redis.createClient({
  host: 'localhost',
  port: 6379,
  password: 'your_password_here'
});

client.on('connect', () => {
  console.log('Connected to Redis');
});

client.on('error', (err) => {
  console.error('Redis error:', err);
});

// Test commands
client.set('key', 'value', (err, reply) => {
  console.log(reply); // OK
});

client.get('key', (err, reply) => {
  console.log(reply); // value
});
```

### Using Redis with Your Application

Check your `backend/config/redis.js` file for application-specific configuration:

```javascript
const redis = require('redis');

const redisClient = redis.createClient({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  retry_strategy: (options) => {
    if (options.error && options.error.code === 'ECONNREFUSED') {
      return new Error('Redis server refused connection');
    }
    if (options.total_retry_time > 1000 * 60 * 60) {
      return new Error('Redis retry time exhausted');
    }
    if (options.attempt > 10) {
      return undefined;
    }
    return Math.min(options.attempt * 100, 3000);
  }
});

module.exports = redisClient;
```

---

## Troubleshooting

### Redis Won't Start

**Check if port 6379 is already in use:**
```bash
sudo lsof -i :6379
# OR
sudo netstat -tulpn | grep 6379
```

**Check Redis logs:**
```bash
# Ubuntu/Debian
sudo tail -f /var/log/redis/redis-server.log

# CentOS/RHEL
sudo tail -f /var/log/redis/redis.log

# Using systemd
sudo journalctl -u redis -f
```

### Permission Issues

```bash
# Fix ownership of Redis directories
sudo chown -R redis:redis /var/lib/redis
sudo chown -R redis:redis /var/log/redis

# Fix permissions
sudo chmod 770 /var/lib/redis
sudo chmod 755 /var/log/redis
```

### Can't Connect to Redis

1. **Check if Redis is running:**
```bash
sudo systemctl status redis
ps aux | grep redis
```

2. **Check firewall:**
```bash
# Ubuntu/Debian
sudo ufw allow 6379

# CentOS/RHEL
sudo firewall-cmd --permanent --add-port=6379/tcp
sudo firewall-cmd --reload
```

3. **Check bind address in config:**
```bash
grep "^bind" /etc/redis/redis.conf
# Should show: bind 127.0.0.1
# For remote access: bind 0.0.0.0 (not recommended without password)
```

4. **Test connection:**
```bash
redis-cli ping
# Should return: PONG
```

### Memory Issues

**Check Redis memory usage:**
```bash
redis-cli info memory
```

**Set memory limit:**
```bash
# Edit config
sudo nano /etc/redis/redis.conf

# Add or modify:
maxmemory 256mb
maxmemory-policy allkeys-lru

# Restart Redis
sudo systemctl restart redis
```

### Performance Issues

**Monitor Redis in real-time:**
```bash
# Monitor all commands
redis-cli monitor

# Get statistics
redis-cli info

# Get slow queries
redis-cli slowlog get 10
```

### Reset Redis Password

```bash
# Edit config
sudo nano /etc/redis/redis.conf

# Change or remove requirepass line
requirepass new_password

# Restart
sudo systemctl restart redis

# Test new password
redis-cli -a new_password ping
```

---

## Security Best Practices

1. **Always set a password:**
```conf
requirepass strong_random_password_here
```

2. **Bind to localhost only** (if not using remote connections):
```conf
bind 127.0.0.1
```

3. **Disable dangerous commands:**
```conf
rename-command CONFIG ""
rename-command FLUSHDB ""
rename-command FLUSHALL ""
```

4. **Use firewall rules** to restrict access

5. **Enable protected mode:**
```conf
protected-mode yes
```

6. **Run Redis as unprivileged user** (not root)

7. **Use SSL/TLS** for production (Redis 6+):
```conf
tls-port 6380
tls-cert-file /path/to/redis.crt
tls-key-file /path/to/redis.key
tls-ca-cert-file /path/to/ca.crt
```

---

## Quick Reference Commands

```bash
# Service Management
sudo systemctl start redis
sudo systemctl stop redis
sudo systemctl restart redis
sudo systemctl status redis

# Redis CLI
redis-cli                          # Connect to local Redis
redis-cli -h host -p port          # Connect to remote Redis
redis-cli -a password              # Connect with password
redis-cli ping                     # Test connection
redis-cli info                     # Get server info
redis-cli config get *             # Get all config
redis-cli shutdown                 # Shutdown Redis server

# Basic Redis Commands
SET key value                      # Set a key
GET key                           # Get a key
DEL key                           # Delete a key
EXISTS key                        # Check if key exists
KEYS pattern                      # Find keys matching pattern
FLUSHALL                          # Delete all keys
INFO                              # Server information
SAVE                              # Save data to disk
```

---

## Additional Resources

- **Official Documentation**: https://redis.io/documentation
- **Redis Commands Reference**: https://redis.io/commands
- **Redis Node.js Client**: https://github.com/redis/node-redis
- **Redis Best Practices**: https://redis.io/topics/admin
- **Redis Security**: https://redis.io/topics/security

---

## For This Project

After installing Redis, update your application configuration:

1. **Update environment variables** in `backend/.env`:
```env
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_password_here
```

2. **Ensure Redis service is running**:
```bash
sudo systemctl status redis
```

3. **Test connection from your application**:
```bash
cd backend
node -e "const redis = require('./config/redis'); console.log('Redis connected');"
```

4. **Start your application**:
```bash
npm start
```
