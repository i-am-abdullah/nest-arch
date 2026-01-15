# PostgreSQL Start Guide

## Quick Start

### Option 1: Using Homebrew Services (Recommended)

**Start PostgreSQL:**
```bash
brew services start postgresql@14
```

**Stop PostgreSQL:**
```bash
brew services stop postgresql@14
```

**Restart PostgreSQL:**
```bash
brew services restart postgresql@14
```

**Check Status:**
```bash
brew services list | grep postgres
```

---

### Option 2: Using pg_ctl (Manual)

**Start PostgreSQL:**
```bash
# For Intel Macs
pg_ctl -D /usr/local/var/postgres start

# For Apple Silicon Macs
pg_ctl -D /opt/homebrew/var/postgres start
```

**Stop PostgreSQL:**
```bash
# For Intel Macs
pg_ctl -D /usr/local/var/postgres stop

# For Apple Silicon Macs
pg_ctl -D /opt/homebrew/var/postgres stop
```

**Check Status:**
```bash
# For Intel Macs
pg_ctl -D /usr/local/var/postgres status

# For Apple Silicon Macs
pg_ctl -D /opt/homebrew/var/postgres status
```

---

## Verify PostgreSQL is Running

**Check if PostgreSQL is running:**
```bash
ps aux | grep postgres
```

**Connect to PostgreSQL:**
```bash
psql -U postgres -d postgres
```

**Or connect to your database:**
```bash
psql -U postgres -d nestarch
```

---

## Troubleshooting

### If PostgreSQL won't start:

1. **Check if port 5432 is already in use:**
   ```bash
   lsof -i :5432
   ```

2. **Check PostgreSQL logs:**
   ```bash
   # For Intel Macs
   tail -f /usr/local/var/log/postgresql@14.log
   
   # For Apple Silicon Macs
   tail -f /opt/homebrew/var/log/postgresql@14.log
   ```

3. **Initialize database (if needed):**
   ```bash
   # For Intel Macs
   initdb /usr/local/var/postgres
   
   # For Apple Silicon Macs
   initdb /opt/homebrew/var/postgres
   ```

4. **Check PostgreSQL version:**
   ```bash
   postgres --version
   ```

---

## For Your NestJS Application

Once PostgreSQL is running, you can:

1. **Start your NestJS app:**
   ```bash
   npm run start:dev
   ```

2. **Run migrations (if needed):**
   ```bash
   npm run migration:up
   ```

3. **Check database connection:**
   The app will automatically connect to:
   - Master DB: `localhost:5432`
   - Slave DB: `localhost:5433` (if configured)

---

## Quick Commands Summary

```bash
# Start PostgreSQL
brew services start postgresql@14

# Check if running
brew services list | grep postgres

# Connect to database
psql -U postgres -d nestarch

# Stop PostgreSQL
brew services stop postgresql@14
```

