# ═══════════════════════════════════════════════════════════════════════════
# SYSTEM OPTIMIZATION GUIDE
# 64 GB RAM | 32 CPU Cores | 15 PM2 Instances | PostgreSQL | Nginx
# ═══════════════════════════════════════════════════════════════════════════

## 📊 SYSTEM OVERVIEW
- **Total RAM**: 64 GB
- **CPU Cores**: 32
- **PM2 Instances**: 15 (configured)
- **Node.js Heap per Instance**: 3.5 GB (52.5 GB total)
- **PostgreSQL**: Optimized for high concurrency
- **Nginx**: Configured as reverse proxy with caching

## 🚀 DEPLOYMENT STEPS

### 1. PM2 Configuration (DONE)
```bash
cd /path/to/backend
pm2 delete all  # Remove old processes
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup  # Enable auto-start on reboot
```

**Key Settings:**
- 15 worker instances (optimal for 32 cores)
- 3.5 GB heap per worker (--max-old-space-size=3584)
- 4 GB restart limit
- UV_THREADPOOL_SIZE=128 (for I/O operations)

### 2. Nginx Configuration

**Install & Configure:**
```bash
# Copy configuration
sudo cp nginx/nginx.conf /etc/nginx/nginx.conf

# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx

# Enable auto-start
sudo systemctl enable nginx
```

**Features:**
- 8,192 connections per worker
- Connection pooling to backend (128 keepalive)
- Gzip compression
- Rate limiting (50 req/s per IP)
- 200 MB upload limit
- 5-minute proxy timeout for long operations

### 3. PostgreSQL Optimization

**Apply Configuration:**
```bash
# Backup current config
sudo cp /etc/postgresql/*/main/postgresql.conf /etc/postgresql/*/main/postgresql.conf.backup

# Edit PostgreSQL config
sudo nano /etc/postgresql/*/main/postgresql.conf
```

**Add/Update these settings from `backend/config/postgresql_optimization.conf`:**
```
shared_buffers = 16GB
effective_cache_size = 32GB
work_mem = 128MB
maintenance_work_mem = 4GB
max_connections = 400
max_worker_processes = 16
max_parallel_workers = 16
```

**Restart PostgreSQL:**
```bash
sudo systemctl restart postgresql
```

### 4. System Kernel Tuning

**Edit `/etc/sysctl.conf`:**
```bash
sudo nano /etc/sysctl.conf
```

**Add these lines:**
```conf
# Shared memory for PostgreSQL
kernel.shmmax = 68719476736
kernel.shmall = 16777216

# Network performance
net.core.somaxconn = 4096
net.ipv4.tcp_max_syn_backlog = 4096
net.ipv4.ip_local_port_range = 10000 65535
net.core.rmem_max = 134217728
net.core.wmem_max = 134217728

# Reduce swapping
vm.swappiness = 10
vm.dirty_ratio = 15
vm.dirty_background_ratio = 5

# File limits
fs.file-max = 2097152
```

**Apply changes:**
```bash
sudo sysctl -p
```

### 5. System Limits

**Edit `/etc/security/limits.conf`:**
```bash
sudo nano /etc/security/limits.conf
```

**Add:**
```
* soft nofile 100000
* hard nofile 100000
* soft nproc 100000
* hard nproc 100000
postgres soft nofile 65536
postgres hard nofile 65536
```

**Reboot or logout/login** for limits to take effect.

## 📈 PERFORMANCE BENCHMARKS (Expected)

### With This Configuration:
- **Concurrent Users**: 1,000 - 2,000+
- **Requests per Second**: 5,000 - 10,000+
- **Database Connections**: Up to 400 concurrent
- **Response Time**: < 100ms for most API calls
- **Upload Handling**: 200 MB files efficiently
- **PDF Generation**: Multiple concurrent without slowdown

## 🔍 MONITORING

### PM2 Monitoring:
```bash
pm2 monit              # Real-time monitoring
pm2 list               # List all processes
pm2 logs               # View logs
pm2 restart all        # Restart all instances
```

### Nginx Monitoring:
```bash
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### PostgreSQL Monitoring:
```sql
-- Active connections
SELECT count(*) FROM pg_stat_activity;

-- Slow queries
SELECT * FROM pg_stat_statements ORDER BY mean_exec_time DESC LIMIT 10;

-- Cache hit ratio (should be > 99%)
SELECT 
  sum(heap_blks_read) as heap_read,
  sum(heap_blks_hit) as heap_hit,
  sum(heap_blks_hit) / (sum(heap_blks_hit) + sum(heap_blks_read)) as ratio
FROM pg_statio_user_tables;
```

### System Monitoring:
```bash
htop                   # CPU and memory usage
iotop                  # I/O usage
netstat -an | grep ESTABLISHED | wc -l  # Active connections
```

## ⚠️ IMPORTANT NOTES

1. **Memory Distribution (64 GB):**
   - PM2 Node.js: 52.5 GB (15 instances × 3.5 GB)
   - PostgreSQL: 6-8 GB (shared_buffers + work_mem)
   - OS & Nginx: 3-5 GB
   - Free Buffer: ~0.5 GB

2. **Connection Pooling:**
   - Consider using PgBouncer for PostgreSQL connection pooling
   - Reduces connection overhead significantly

3. **SSL/HTTPS:**
   - Uncomment SSL block in nginx.conf
   - Install SSL certificate (Let's Encrypt recommended)

4. **Backup Strategy:**
   - Set up automated PostgreSQL backups
   - Regular log rotation
   - Monitor disk space

5. **Security:**
   - Configure firewall (ufw/iptables)
   - Keep all software updated
   - Use strong passwords
   - Enable PostgreSQL SSL connections

## 🔧 TROUBLESHOOTING

### High Memory Usage:
```bash
# Check PM2 processes
pm2 list
# Restart if needed
pm2 restart all --update-env
```

### Slow Database:
```sql
-- Check for locks
SELECT * FROM pg_locks WHERE NOT granted;
-- Vacuum if needed
VACUUM ANALYZE;
```

### Connection Issues:
```bash
# Check Nginx upstream
sudo nginx -t
sudo systemctl status nginx
# Check backend
pm2 logs --lines 100
```

## 📚 ADDITIONAL RESOURCES

- PM2 Documentation: https://pm2.keymetrics.io/docs/
- Nginx Performance: https://nginx.org/en/docs/
- PostgreSQL Tuning: https://wiki.postgresql.org/wiki/Tuning_Your_PostgreSQL_Server
- Node.js Best Practices: https://github.com/goldbergyoni/nodebestpractices

═══════════════════════════════════════════════════════════════════════════
