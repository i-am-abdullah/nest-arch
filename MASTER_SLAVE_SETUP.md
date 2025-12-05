# Master-Slave Database Replication Setup Guide

## 📚 Theoretical Overview

### What is Master-Slave Replication?

**Master Database (Primary):**
- Handles ALL write operations (INSERT, UPDATE, DELETE)
- Single source of truth
- Receives data changes first
- Typically runs on port `5432`

**Slave Database (Replica):**
- Receives copies of all changes from Master
- Handles ONLY read operations (SELECT)
- Read-only database
- Typically runs on a different port (e.g., `5433`)
- Automatically syncs with Master

### Why Use Master-Slave Architecture?

1. **Performance** 🚀
   - Distribute read load across multiple databases
   - Master focuses on writes, slaves handle reads
   - Reduces contention on the master database

2. **Scalability** 📈
   - Can add multiple slaves as read load increases
   - Horizontal scaling for read-heavy applications
   - Master can handle writes without read interference

3. **High Availability** 🛡️
   - If master fails, a slave can be promoted to master
   - Redundancy ensures data safety
   - Disaster recovery capability

4. **Load Distribution** ⚖️
   - 80% of database operations are typically reads
   - Offload 80% of traffic to slaves
   - Master handles critical 20% (writes)

### How It Works in Your NestJS Application

#### Request Flow:

```
┌─────────────────────────────────────────────────────────────┐
│                    HTTP Request                              │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              DbContextInterceptor                            │
│  Checks for @UseSlaveDB() decorator                         │
└──────────────────────┬──────────────────────────────────────┘
                       │
        ┌──────────────┴──────────────┐
        │                             │
        ▼                             ▼
┌───────────────┐            ┌─────────────────┐
│  GET Request  │            │ POST/PUT/DELETE │
│ @UseSlaveDB() │            │  (No decorator) │
└───────┬───────┘            └────────┬────────┘
        │                             │
        ▼                             ▼
┌───────────────┐            ┌─────────────────┐
│  Slave DB     │            │   Master DB     │
│  (Read Only)  │            │   (Read/Write)  │
│  Port: 5433   │            │   Port: 5432   │
└───────────────┘            └─────────────────┘
```

#### Code Flow Example:

1. **Read Operation (GET /users):**
   ```typescript
   @Get()
   @UseSlaveDB()  // ← Decorator marks this as read operation
   async findAll() {
     // DbContextInterceptor detects @UseSlaveDB()
     // Routes query to Slave DB (port 5433)
     return await this.usersService.findAll();
   }
   ```

2. **Write Operation (POST /users):**
   ```typescript
   @Post()
   // No @UseSlaveDB() decorator
   async create(@Body() dto: CreateUserDto) {
     // DbContextInterceptor sees no decorator
     // Routes query to Master DB (port 5432)
     return await this.usersService.create(dto);
   }
   ```

#### Replication Mechanism:

```
Master DB (Port 5432)          Slave DB (Port 5433)
     │                              │
     │  INSERT user                 │
     │  ────────────►               │
     │                              │
     │  WAL (Write-Ahead Log)       │
     │  ────────────────────────────┼──► Stream WAL
     │                              │
     │                              │  Apply changes
     │                              │  ────────────►
     │                              │  Data synced!
```

### How PostgreSQL Replication Works

1. **Write-Ahead Logging (WAL):**
   - Master writes all changes to WAL files
   - WAL contains a complete record of all modifications
   - Slaves read and replay WAL records

2. **Streaming Replication:**
   - Slave connects to Master
   - Master streams WAL records in real-time
   - Slave applies changes as they arrive
   - Very low latency (near real-time sync)

3. **Replication Lag:**
   - Small delay between Master write and Slave sync
   - Usually milliseconds to seconds
   - Acceptable for most read operations

## 🛠️ Practical Setup Steps

### Step 1: Check PostgreSQL Installation

```bash
# Check if PostgreSQL is installed
psql --version

# Check if PostgreSQL service is running
brew services list | grep postgresql
```

### Step 2: Create Master Database

```bash
# Connect to PostgreSQL
psql postgres

# Create master database
CREATE DATABASE myapp;

# Create user (if needed)
CREATE USER postgres WITH PASSWORD 'postgres';
GRANT ALL PRIVILEGES ON DATABASE myapp TO postgres;

# Grant replication privileges (required for pg_basebackup)
ALTER USER postgres WITH REPLICATION;

# Exit psql
\q
```

### Step 3: Configure Master PostgreSQL

Find PostgreSQL configuration directory:
```bash
# On Mac with Homebrew, config is usually here:
# For PostgreSQL 14:
/usr/local/var/postgresql@14/postgresql.conf  # Intel Mac
# OR
/opt/homebrew/var/postgresql@14/postgresql.conf  # Apple Silicon Mac
# OR for older versions:
/usr/local/var/postgres/postgresql.conf
/opt/homebrew/var/postgres/postgresql.conf

# Check exact location with (use without -U flag):
psql postgres -c "SHOW config_file;"
```

Edit `postgresql.conf`:
```bash
# Find and edit these settings:
wal_level = replica              # Enable WAL for replication
max_wal_senders = 3              # Allow 3 replication connections
wal_keep_size = 16000            # Keep WAL files for replication
```

Edit `pg_hba.conf` (in same directory):
```bash
# Add this line to allow replication connections:
host    replication    postgres    127.0.0.1/32    md5
```

Restart PostgreSQL:
```bash
brew services restart postgresql
```

### Step 4: Create Slave Database Directory

```bash
# Create data directory for slave
mkdir -p /usr/local/var/postgres-slave
# OR if using Homebrew on Apple Silicon:
mkdir -p /opt/homebrew/var/postgres-slave

# Set permissions
chmod 700 /usr/local/var/postgres-slave
```

### Step 5: Initialize Slave Database

```bash
# Initialize slave database cluster
# Replace paths with your actual PostgreSQL installation path
/usr/local/bin/initdb -D /usr/local/var/postgres-slave
# OR for Apple Silicon:
/opt/homebrew/bin/initdb -D /opt/homebrew/var/postgres-slave
```

### Step 6: Configure Slave PostgreSQL

Edit slave's `postgresql.conf`:
```bash
# Edit: /usr/local/var/postgres-slave/postgresql.conf
# OR: /opt/homebrew/var/postgres-slave/postgresql.conf

port = 5433                      # Different port!
hot_standby = on                 # Enable read-only queries
```

Create `recovery.conf` (or `postgresql.auto.conf` in newer versions):
```bash
# Create recovery file
cat > /usr/local/var/postgres-slave/recovery.conf << EOF
standby_mode = 'on'
primary_conninfo = 'host=localhost port=5432 user=postgres password=postgres'
trigger_file = '/tmp/postgresql.trigger'
EOF
```

### Step 7: Perform Base Backup

**Important:** The target directory must be empty. If you ran `initdb` earlier, remove its contents first:
```bash
# Clean up if directory already exists with initdb data
rm -rf /usr/local/var/postgres-slave/*
# OR for Apple Silicon:
rm -rf /opt/homebrew/var/postgres-slave/*
```

Then perform base backup from master:
```bash
# Stop slave (if running)
# Then perform base backup from master
pg_basebackup -h localhost -p 5432 -U postgres -D /usr/local/var/postgres-slave -Fp -Xs -P -R
# OR for Apple Silicon:
pg_basebackup -h localhost -p 5432 -U postgres -D /opt/homebrew/var/postgres-slave -Fp -Xs -P -R
```

**Note:** If you get "must be superuser or replication role" error, ensure you granted replication privileges:
```sql
ALTER USER postgres WITH REPLICATION;
```

### Step 8: Start Slave Database

```bash
# Start slave on port 5433
pg_ctl -D /usr/local/var/postgres-slave -o "-p 5433" start
# OR for Apple Silicon:
pg_ctl -D /opt/homebrew/var/postgres-slave -o "-p 5433" start
```

### Step 9: Verify Replication

```bash
# Connect to master
psql -p 5432 -U postgres -d myapp

# Create a test table
CREATE TABLE test_replication (id SERIAL PRIMARY KEY, name VARCHAR(100));
INSERT INTO test_replication (name) VALUES ('Test from Master');

# Connect to slave
psql -p 5433 -U postgres -d myapp

# Check if data replicated
SELECT * FROM test_replication;
# Should show: Test from Master
```

### Step 10: Configure Environment Variables

Create `.env` file:
```bash
cp .env.example .env
```

Edit `.env`:
```env
NODE_ENV=development
PORT=3000

# Master Database (Port 5432)
DB_MASTER_HOST=localhost
DB_MASTER_PORT=5432
DB_MASTER_USER=postgres
DB_MASTER_PASSWORD=postgres
DB_MASTER_NAME=myapp

# Slave Database (Port 5433)
DB_SLAVE_HOST=localhost
DB_SLAVE_PORT=5433
DB_SLAVE_USER=postgres
DB_SLAVE_PASSWORD=postgres
DB_SLAVE_NAME=myapp
```

## 🔍 Troubleshooting

### Check Replication Status

**On Master:**
```sql
SELECT * FROM pg_stat_replication;
```

**On Slave:**
```sql
SELECT * FROM pg_stat_wal_receiver;
```

### Common Issues

1. **Slave not connecting:**
   - Check `pg_hba.conf` has replication entry
   - Verify password authentication
   - Check firewall settings

2. **Replication lag:**
   - Check network connectivity
   - Verify WAL files are being generated
   - Check slave's `recovery.conf` settings

3. **Port conflicts:**
   - Ensure slave uses different port (5433)
   - Check if port is already in use: `lsof -i :5433`

## 📝 Quick Reference Commands

```bash
# Start Master
brew services start postgresql

# Start Slave
pg_ctl -D /usr/local/var/postgres-slave -o "-p 5433" start

# Stop Slave
pg_ctl -D /usr/local/var/postgres-slave stop

# Check Master Status
psql -p 5432 -U postgres -c "SELECT version();"

# Check Slave Status
psql -p 5433 -U postgres -c "SELECT version();"

# View Replication Status
psql -p 5432 -U postgres -c "SELECT * FROM pg_stat_replication;"
```

## 🎯 Summary

1. **Master** = Port 5432 = All writes + some reads
2. **Slave** = Port 5433 = Only reads (replicated from Master)
3. **@UseSlaveDB()** = Routes GET requests to Slave
4. **No decorator** = Routes POST/PUT/DELETE to Master
5. **Replication** = Automatic sync via WAL streaming

This setup gives you:
- ✅ Better performance
- ✅ Scalability
- ✅ High availability
- ✅ Load distribution

