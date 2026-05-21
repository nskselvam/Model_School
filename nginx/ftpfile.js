cat > /tmp/vsftpd_install_guide.md << 'EOF'
# vsftpd Installation and Configuration Guide

## 1. Install vsftpd

### For Ubuntu/Debian:
```bash
sudo apt update
sudo apt install vsftpd -y
```

### For CentOS/RHEL:
```bash
sudo yum install vsftpd -y
```

## 2. Backup Original Config
```bash
sudo cp /etc/vsftpd.conf /etc/vsftpd.conf.backup
```

## 3. Configure vsftpd
```bash
sudo nano /etc/vsftpd.conf
```

### Basic Configuration (Userlist Disabled):
```
listen=YES
listen_ipv6=NO
anonymous_enable=NO
local_enable=YES
write_enable=YES
local_umask=022
dirmessage_enable=YES
use_localtime=YES
xferlog_enable=YES
connect_from_port_20=YES
chroot_local_user=YES
secure_chroot_dir=/var/run/vsftpd/empty
pam_service_name=vsftpd
pasv_enable=YES
pasv_min_port=10000
pasv_max_port=10100
userlist_enable=NO
allow_writeable_chroot=YES
user_config_dir=/etc/vsftpd/user_conf
```

## 4. Create FTP User
```bash
# Create user
sudo adduser svnosms

# Set password
sudo passwd Narakumar$16

# Add to userlist
echo "svnosms" | sudo tee -a /etc/vsftpd.userlist
```

## 5. Set Directory Permissions and Restrict User to Specific Directory
```bash

# Check what process is running
ps -u svnosms

# Kill all processes for user svnosms
sudo pkill -u svnosms

# Or kill specific process
sudo kill 3715

# If still running, force kill
sudo pkill -9 -u svnosms

# Then run the usermod command
sudo usermod -d /var/osmsbackend/uploads svnosms


# Create directory
sudo mkdir -p /var/osmsbackend/uploads

# Set user's home directory to restricted path
sudo usermod -d /var/osmsbackend/uploads svnosms

# Set ownership
sudo chown svnosms:svnosms /var/osmsbackend/uploads
sudo chmod 755 /var/osmsbackend/uploads

# Create user-specific config directory
sudo mkdir -p /etc/vsftpd/user_conf

# Create user-specific config file
sudo tee /etc/vsftpd/user_conf/svnosms > /dev/null <<EOL
local_root=/var/osmsbackend/uploads
EOL
```

### Add to vsftpd.conf for user-specific restrictions:
```bash
# Edit main config
sudo nano /etc/vsftpd.conf

# Add this line at the end:
user_config_dir=/etc/vsftpd/user_conf
```

**Result**: User `svnosms` will only see and access `/var/osmsbackend/uploads` directory. They cannot navigate to parent directories or any other system directories.

## 6. Configure Firewall
```bash
# For UFW (Ubuntu):
sudo ufw allow 20/tcp
sudo ufw allow 21/tcp
sudo ufw allow 10000:10100/tcp
sudo ufw reload

# For firewalld (CentOS):
sudo firewall-cmd --permanent --add-port=21/tcp
sudo firewall-cmd --permanent --add-port=20/tcp
sudo firewall-cmd --permanent --add-port=10000-10100/tcp
sudo firewall-cmd --reload
```

## 7. Start and Enable vsftpd
```bash
sudo systemctl start vsftpd
sudo systemctl enable vsftpd
sudo systemctl status vsftpd
```

## 8. Test Connection

### Troubleshooting the "Permission denied" Error:

#### Step 1: Check if vsftpd is running
```bash
# On server (192.168.1.60):
sudo systemctl status vsftpd
sudo systemctl start vsftpd   # if not running
```

#### Step 2: Check FTP port is listening
```bash
# On server:
sudo netstat -tulnp | grep 21
# OR
sudo ss -tulnp | grep 21
```

#### Step 3: Check firewall
```bash
# On server:
sudo ufw status
sudo iptables -L -n | grep 21
```

#### Step 4: Correct FTP Connection Method
```bash
# From client machine - INTERACTIVE MODE:
ftp 192.168.1.60

# You'll see a prompt like this:
# Connected to 192.168.1.60.
# 220 (vsFTPd 3.0.3)
# Name (192.168.1.60:user): svnosms
# 331 Please specify the password.
# Password: [enter: Narakumar$16]
# 230 Login successful.

# Then use FTP commands:
ftp> ls                    # list files
ftp> pwd                   # show current directory
ftp> cd /var/osmsbackend   # change directory
ftp> get filename          # download a file
ftp> put localfile.txt     # upload a file
ftp> bye                   # exit
```

#### Step 5: Alternative - Use lftp or curl
```bash
# Using lftp (better for scripting):
sudo apt install lftp
lftp -u svnosms,Narakumar$16 192.168.1.60

# Using curl to list files:
curl -u svnosms:Narakumar$16 ftp://192.168.1.60/

# Using curl to upload:
curl -u svnosms:Narakumar$16 -T localfile.txt ftp://192.168.1.60/uploads/
```

#### Step 6: Check user permissions
```bash
# On server:
sudo ls -la /var/osmsbackend/uploads
sudo chown -R svnosms:svnosms /var/osmsbackend/uploads
sudo chmod -R 755 /var/osmsbackend/uploads
```

#### Step 7: Check vsftpd logs
```bash
# On server:
sudo tail -50 /var/log/vsftpd.log
sudo journalctl -u vsftpd -n 50
```

## 9. Troubleshooting Commands

### Fix "cannot read user list file" Error:
```bash
# Create the userlist file (note: user_list vs userlist)
echo "svnosms" | sudo tee /etc/vsftpd.user_list
sudo chmod 644 /etc/vsftpd.user_list

# Also create with underscore version
echo "svnosms" | sudo tee /etc/vsftpd.userlist
sudo chmod 644 /etc/vsftpd.userlist

# Check which file vsftpd is looking for
sudo grep "userlist_file" /etc/vsftpd.conf

# Fix the path if needed
sudo sed -i 's|userlist_file=.*|userlist_file=/etc/vsftpd.user_list|g' /etc/vsftpd.conf

# Restart service
sudo systemctl restart vsftpd
```

### General Troubleshooting:
```bash
# Check status
sudo systemctl status vsftpd

# View logs
sudo tail -f /var/log/vsftpd.log

# Test config
sudo vsftpd /etc/vsftpd.conf

# Restart service
sudo systemctl restart vsftpd
```

## 10. Security Recommendations
- Use FTPS (FTP over SSL/TLS)
- Limit user access with chroot
- Use strong passwords
- Monitor logs regularly
- Consider using SFTP instead of FTP

## Configure SSL/TLS (Optional but Recommended)
```bash
# Generate SSL certificate
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout /etc/ssl/private/vsftpd.pem \
  -out /etc/ssl/private/vsftpd.pem

# Add to vsftpd.conf:
# rsa_cert_file=/etc/ssl/private/vsftpd.pem
# rsa_private_key_file=/etc/ssl/private/vsftpd.pem
# ssl_enable=YES
# force_local_data_ssl=YES
# force_local_logins_ssl=YES
```
EOF
cat /tmp/vsftpd_install_guide.md


# SSH into server
ssh svnosms@192.168.1.160

# Change user's home directory
sudo usermod -d /var/osmsbackend/uploads svnosms

# Set ownership
sudo chown svnosms:svnosms /var/osmsbackend/uploads
sudo chmod 755 /var/osmsbackend/uploads

# Update package list
sudo apt update

# Install Redis
sudo apt install redis-server -y

# Start Redis service
sudo systemctl start redis-server

# Enable Redis to start on boot
sudo systemctl enable redis-server

# Check Redis status
sudo systemctl status redis-server

# Test Redis connection
redis-cli ping
# Should respond with: PONG

# Optional: Configure Redis for remote connections
# Edit the Redis config file
sudo nano /etc/redis/redis.conf

# Find and change these lines:
# bind 127.0.0.1 ::1  -> bind 0.0.0.0
# protected-mode yes  -> protected-mode no

# Restart Redis after configuration changes
sudo systemctl restart redis-server

# Allow Redis port through firewall (if ufw is active)
sudo ufw allow 6379/tcp