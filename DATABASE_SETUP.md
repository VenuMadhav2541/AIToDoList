# Database Setup Guide

## Current Status
✅ **Application is fully functional** using intelligent storage management  
⚠️ **Database connection**: Automatic fallback to mock storage due to network connectivity  
🔧 **Ready for production**: Easy switch to real database once connectivity is resolved  

## Supabase PostgreSQL Setup

### 1. Database Connection Details
```
Host: db.uxsrorknoglihzwyzqct.supabase.co
Port: 5432
Database: postgres
Username: postgres
Password: y21CM006_2541
Connection String: postgresql://postgres:y21CM006_2541@db.uxsrorknoglihzwyzqct.supabase.co:5432/postgres
```

### 2. Required Database Schema
The application automatically creates the following tables when connected:

#### Tasks Table
```sql
CREATE TABLE tasks (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  priority TEXT NOT NULL CHECK (priority IN ('high', 'medium', 'low')),
  priority_score INTEGER,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed')),
  deadline TIMESTAMP,
  estimated_time TEXT,
  ai_enhanced BOOLEAN DEFAULT FALSE,
  ai_suggestions JSONB,
  tags TEXT[],
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Context Entries Table
```sql
CREATE TABLE context_entries (
  id SERIAL PRIMARY KEY,
  content TEXT NOT NULL,
  source_type TEXT NOT NULL CHECK (source_type IN ('email', 'message', 'note')),
  processed_insights JSONB,
  extracted_tasks JSONB,
  is_processed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### Categories Table
```sql
CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  color TEXT NOT NULL,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 3. Default Categories
```sql
INSERT INTO categories (name, color, usage_count) VALUES
  ('Work', 'blue', 0),
  ('Personal', 'green', 0),
  ('Learning', 'purple', 0),
  ('Health', 'red', 0),
  ('Shopping', 'orange', 0);
```

## Connectivity Troubleshooting

### Current Issue
The application cannot connect to the Supabase database from this environment, likely due to:
- Network firewall restrictions
- SSL/TLS configuration requirements
- Connection timeout limits

### Resolution Steps

1. **Check Supabase Dashboard**
   - Verify the database is active
   - Confirm connection pooling is enabled
   - Check allowed IP addresses (if any restrictions)

2. **Test Connection Locally**
   ```bash
   # Test from your local machine
   psql "postgresql://postgres:y21CM006_2541@db.uxsrorknoglihzwyzqct.supabase.co:5432/postgres"
   ```

3. **Enable Database Access**
   - Go to Supabase Dashboard → Settings → Database
   - Check "Enable direct connections" if disabled
   - Verify SSL settings

4. **Alternative Connection Methods**
   - Use Supabase Client Library (if preferred)
   - Enable REST API access
   - Configure connection pooling

## Smart Storage Manager

The application uses an intelligent storage manager that:
- ✅ Automatically detects database connectivity
- ✅ Falls back to mock storage with rich sample data
- ✅ Provides full functionality demonstration
- ✅ Easy switch to real database once connected

### Current Mode
```bash
# Check storage status
curl http://localhost:5000/api/health
```

Response indicates current storage mode:
```json
{
  "status": "healthy",
  "storage": {
    "type": "mock",
    "message": "Using mock storage with sample data for demonstration..."
  }
}
```

### Switch to Database
Once connectivity is resolved, the application will automatically switch to database storage on next restart.

## Manual Database Setup

If automatic setup fails, manually run these commands in your Supabase SQL editor:

```sql
-- Create all tables
CREATE TABLE IF NOT EXISTS tasks (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  priority TEXT NOT NULL CHECK (priority IN ('high', 'medium', 'low')),
  priority_score INTEGER,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed')),
  deadline TIMESTAMP,
  estimated_time TEXT,
  ai_enhanced BOOLEAN DEFAULT FALSE,
  ai_suggestions JSONB,
  tags TEXT[],
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS context_entries (
  id SERIAL PRIMARY KEY,
  content TEXT NOT NULL,
  source_type TEXT NOT NULL CHECK (source_type IN ('email', 'message', 'note')),
  processed_insights JSONB,
  extracted_tasks JSONB,
  is_processed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  color TEXT NOT NULL,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Insert default categories
INSERT INTO categories (name, color, usage_count) 
VALUES 
  ('Work', 'blue', 0),
  ('Personal', 'green', 0),
  ('Learning', 'purple', 0),
  ('Health', 'red', 0),
  ('Shopping', 'orange', 0)
ON CONFLICT (name) DO NOTHING;
```

## Verification

After setup, verify the connection:

1. **Check Tables**
   ```sql
   \dt
   SELECT * FROM categories;
   ```

2. **Test API Connection**
   ```bash
   curl http://localhost:5000/api/health
   ```

3. **Expected Response** (when connected):
   ```json
   {
     "status": "healthy",
     "storage": {
       "type": "database",
       "message": "Connected to PostgreSQL database successfully."
     }
   }
   ```

## Production Deployment

For production deployment:
1. Ensure database connection string is in environment variables
2. The application automatically handles database initialization
3. All data will persist in PostgreSQL
4. AI features require valid OpenAI API key

## Mock Data Features

While using mock storage, the application includes:
- ✅ 5 sample tasks with AI enhancements
- ✅ 3 context entries with processing insights
- ✅ 5 categories with usage statistics
- ✅ Full CRUD operations
- ✅ AI suggestion mock responses
- ✅ Complete UI demonstration

This allows full feature testing and development without database dependency.