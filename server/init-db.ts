import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import pg from 'pg';
import * as schema from '@shared/schema';

const { Pool } = pg;

export async function initializeDatabase() {
  if (!process.env.DATABASE_URL) {
    console.log("DATABASE_URL not found, skipping database initialization");
    return;
  }

  try {
    console.log("Initializing database...");
    
    const pool = new Pool({ 
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });
    
    const db = drizzle({ client: pool, schema });

    // Test connection
    await pool.query('SELECT NOW()');
    console.log("✅ Database connection successful");

    // Create tables if they don't exist
    await createTablesIfNotExist(pool);
    
    console.log("✅ Database initialization complete");
    
    await pool.end();
  } catch (error) {
    console.error("❌ Database initialization failed:", error);
    // Don't throw error - let app continue with memory storage
  }
}

async function createTablesIfNotExist(pool: pg.Pool) {
  const createTablesSQL = `
    -- Create sessions table
    CREATE TABLE IF NOT EXISTS sessions (
      sid VARCHAR PRIMARY KEY,
      sess JSON NOT NULL,
      expire TIMESTAMP NOT NULL
    );
    CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON sessions (expire);

    -- Create users table
    CREATE TABLE IF NOT EXISTS users (
      id VARCHAR PRIMARY KEY,
      email VARCHAR UNIQUE NOT NULL,
      password VARCHAR,
      first_name VARCHAR,
      last_name VARCHAR,
      profile_image_url VARCHAR,
      is_admin BOOLEAN DEFAULT false,
      provider VARCHAR DEFAULT 'local',
      provider_id VARCHAR,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

    -- Create projects table
    CREATE TABLE IF NOT EXISTS projects (
      id VARCHAR PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      image TEXT NOT NULL,
      github_url TEXT,
      demo_url TEXT,
      technologies JSON NOT NULL,
      category VARCHAR NOT NULL DEFAULT 'web',
      tags JSON DEFAULT '[]'::json,
      status VARCHAR NOT NULL DEFAULT 'published',
      featured BOOLEAN DEFAULT false,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

    -- Create achievements table
    CREATE TABLE IF NOT EXISTS achievements (
      id VARCHAR PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      image TEXT,
      date TIMESTAMP NOT NULL,
      category VARCHAR NOT NULL DEFAULT 'certification',
      certificate_url TEXT,
      organization TEXT,
      status VARCHAR NOT NULL DEFAULT 'published',
      featured BOOLEAN DEFAULT false,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

    -- Create experiences table
    CREATE TABLE IF NOT EXISTS experiences (
      id VARCHAR PRIMARY KEY,
      title TEXT NOT NULL,
      company TEXT NOT NULL,
      description TEXT NOT NULL,
      start_date TIMESTAMP NOT NULL,
      end_date TIMESTAMP,
      location TEXT,
      technologies JSON DEFAULT '[]'::json,
      current BOOLEAN DEFAULT false,
      status VARCHAR NOT NULL DEFAULT 'published',
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

    -- Create contacts table
    CREATE TABLE IF NOT EXISTS contacts (
      id VARCHAR PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      subject TEXT NOT NULL,
      message TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    );

    -- Create project_likes table
    CREATE TABLE IF NOT EXISTS project_likes (
      id VARCHAR PRIMARY KEY,
      project_id VARCHAR NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
      user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at TIMESTAMP DEFAULT NOW()
    );

    -- Create project_comments table
    CREATE TABLE IF NOT EXISTS project_comments (
      id VARCHAR PRIMARY KEY,
      project_id VARCHAR NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
      user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      content TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    );

    -- Create achievement_likes table
    CREATE TABLE IF NOT EXISTS achievement_likes (
      id VARCHAR PRIMARY KEY,
      achievement_id VARCHAR NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
      user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at TIMESTAMP DEFAULT NOW()
    );

    -- Create achievement_comments table
    CREATE TABLE IF NOT EXISTS achievement_comments (
      id VARCHAR PRIMARY KEY,
      achievement_id VARCHAR NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
      user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      content TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    );

    -- Create notifications table
    CREATE TABLE IF NOT EXISTS notifications (
      id VARCHAR PRIMARY KEY,
      user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      type VARCHAR NOT NULL,
      entity_type VARCHAR NOT NULL,
      entity_id VARCHAR NOT NULL,
      from_user_id VARCHAR REFERENCES users(id) ON DELETE CASCADE,
      message TEXT NOT NULL,
      read BOOLEAN DEFAULT false,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `;

  try {
    await pool.query(createTablesSQL);
    console.log("✅ All tables created successfully");
  } catch (error) {
    console.error("❌ Error creating tables:", error);
    throw error;
  }
}