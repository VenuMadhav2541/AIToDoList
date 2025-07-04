import { Storage } from './storage';
import { MockStorage } from './mock-storage';
import type { IStorage } from './storage';

/**
 * Smart Storage Manager
 * 
 * This class automatically detects database connectivity and switches between
 * real database storage and mock storage for demonstration purposes.
 * It provides a seamless fallback mechanism when database connection fails.
 */
class StorageManager {
  private storage: IStorage | null = null;
  private isUsingMock = false;
  private connectionTested = false;

  async getStorage(): Promise<IStorage> {
    if (!this.connectionTested) {
      await this.testAndInitializeStorage();
    }
    
    if (!this.storage) {
      // Fallback to mock storage if something went wrong
      this.storage = new MockStorage();
      this.isUsingMock = true;
      console.log('🔄 Using mock storage as fallback');
    }
    
    return this.storage;
  }

  private async testAndInitializeStorage(): Promise<void> {
    this.connectionTested = true;
    
    try {
      // Try to initialize real database storage
      const realStorage = new Storage();
      
      // Test if we can perform a basic operation
      await Promise.race([
        realStorage.getTasks(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Connection timeout')), 5000))
      ]);
      
      this.storage = realStorage;
      this.isUsingMock = false;
      console.log('✅ Connected to PostgreSQL database');
      
    } catch (error) {
      console.log('⚠️  Database connection failed, using mock storage for demonstration');
      console.log('   Error:', error instanceof Error ? error.message : 'Unknown error');
      console.log('   This allows you to see the full application functionality');
      
      this.storage = new MockStorage();
      this.isUsingMock = true;
    }
  }

  isUsingMockStorage(): boolean {
    return this.isUsingMock;
  }

  getStorageInfo(): { type: 'database' | 'mock'; message: string } {
    if (this.isUsingMock) {
      return {
        type: 'mock',
        message: 'Using mock storage with sample data for demonstration. Database connection may need configuration.'
      };
    } else {
      return {
        type: 'database',
        message: 'Connected to PostgreSQL database successfully.'
      };
    }
  }
}

// Export singleton instance
export const storageManager = new StorageManager();