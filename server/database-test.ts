import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

// Test database connection with the provided Supabase URL
const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:y21CM006_2541@db.uxsrorknoglihzwyzqct.supabase.co:5432/postgres';

export async function testDatabaseConnection(): Promise<{ connected: boolean; error?: string }> {
  try {
    console.log('Testing database connection...');
    
    // Create a client with timeout settings
    const client = postgres(connectionString, {
      max: 1,
      idle_timeout: 5,
      connect_timeout: 10,
      ssl: 'require', // Supabase requires SSL
    });
    
    // Test the connection
    const result = await client`SELECT 1 as test`;
    
    if (result.length > 0 && result[0].test === 1) {
      console.log('✅ Database connection successful');
      await client.end();
      return { connected: true };
    } else {
      await client.end();
      return { connected: false, error: 'Invalid response from database' };
    }
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return { 
      connected: false, 
      error: error instanceof Error ? error.message : 'Unknown connection error' 
    };
  }
}

export async function setupDatabaseSchema(): Promise<{ success: boolean; error?: string }> {
  try {
    const client = postgres(connectionString, {
      ssl: 'require',
      max: 1
    });
    
    // Create tables schema
    await client`
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
      )
    `;
    
    await client`
      CREATE TABLE IF NOT EXISTS context_entries (
        id SERIAL PRIMARY KEY,
        content TEXT NOT NULL,
        source_type TEXT NOT NULL CHECK (source_type IN ('email', 'message', 'note')),
        processed_insights JSONB,
        extracted_tasks JSONB,
        is_processed BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;
    
    await client`
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        color TEXT NOT NULL,
        usage_count INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;
    
    // Insert default categories if they don't exist
    await client`
      INSERT INTO categories (name, color, usage_count) 
      VALUES 
        ('Work', 'blue', 0),
        ('Personal', 'green', 0),
        ('Learning', 'purple', 0),
        ('Health', 'red', 0),
        ('Shopping', 'orange', 0)
      ON CONFLICT (name) DO NOTHING
    `;
    
    console.log('✅ Database schema setup completed');
    await client.end();
    return { success: true };
    
  } catch (error) {
    console.error('❌ Database schema setup failed:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown setup error' 
    };
  }
}

// Run test immediately
(async () => {
  const connectionTest = await testDatabaseConnection();
  console.log('Connection test result:', connectionTest);
  
  if (connectionTest.connected) {
    const schemaSetup = await setupDatabaseSchema();
    console.log('Schema setup result:', schemaSetup);
  }
})();