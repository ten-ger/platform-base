import Dexie from 'dexie';
import { Log } from './log';

export interface TableSchema {
  [tableName: string]: string
}

class IndexedDbController {

  private db: Dexie | null = null;
  private databaseName: string | null = null

  async openDatabase(databaseName: string, tableSchema: TableSchema, version: number = 1): Promise<void> {
    
    if (this.db && this.db.isOpen() && this.databaseName === databaseName) {
      Log.info(`Database '${databaseName}' is already open.`);
      return; // Database already open
    }

    try {
      this.db = new Dexie(databaseName);
      this.databaseName = databaseName;

      this.db.version(version).stores(tableSchema);
      await this.db.open();
    }
    catch (error) {
      Log.error(`Error opening database ${databaseName}:`, error);
      this.db = null;
      throw error;
    }
  }

  closeDatabase(): void {
    if (this.db && this.db.isOpen()) {
      this.db.close();
      this.db = null;
      this.databaseName = null;
    } else {
      Log.debug('No database is currently open to close.');
    }
  }

  async deleteDatabase(databaseName: string) {
    try {
      if (this.db && this.db.name === databaseName && this.db.isOpen()) {
        this.closeDatabase();
      }
      await Dexie.delete(databaseName);
    }
    catch (error) {
      Log.error('Error deleting database', error);
      throw error;
    }
  }

  private getDb(): Dexie {
    if (!this.db || !this.db.isOpen()) {
      throw new Error('Database not open. Call openDatabase first.');
    }
    return this.db;
  }

  private getDbTable<T = any>(tableName: string): Dexie.Table<T, any> {
    return this.getDb().table<T, any>(tableName);
  }

  async clearTable(tableName: string) {
    try {
      await this.getDbTable(tableName).clear();
    } catch (error) {
      Log.error(`Error clearing table '${tableName}':`, error);
      throw error;
    }
  }

  async forEach<T = any>(tableName: string, func: (item: T) => void | Promise<void>): Promise<void> {
    try {
      await this.getDbTable(tableName).each(async item => {
        await func(item)
      });
    }
    catch (error) {
      Log.error(`Error iterating over table ${tableName}:`, error);
      throw error;
    }
  }

  async getCount(tableName: string) {
    return await this.getDbTable(tableName).count();
  }

  async getAll<T = any>(tableName: string): Promise<T[]> {
    return await this.getDbTable<T>(tableName).toArray();
  }

  async getItem<T = any>(tableName: string, itemKey: any): Promise<T> {
    return await this.getDbTable<T>(tableName).get(itemKey);
  }
  
  async getItemsBy<T = any>(tableName: string, propertyName: string, propertyValue: any): Promise<T[] | undefined> {
    return await this.getDbTable<T>(tableName).where(propertyName).equals(propertyValue).toArray();
  }
  
  async getItemBy<T = any>(tableName: string, propertyName: string, propertyValue: any): Promise<T | undefined> {
    return await this.getDbTable<T>(tableName).where(propertyName).equals(propertyValue).first();
  }
  
  async setItem<T = any>(tableName: string, item: any): Promise<any> {
    return await this.getDbTable<T>(tableName).put(item);
  }

  async deleteItem(tableName: string, itemKey: any): Promise<void> {
    await this.getDbTable(tableName).delete(itemKey);
  }

  async getPage(tableName: string, pageSize: number = 20, startAt: number = 0) {
    return this.getDbTable(tableName).offset(startAt).limit(pageSize);
  }

  async bulkGet<T = any>(tableName: string, propertyName: string, propertyValues: string[]): Promise<T[] | undefined> {
    return await this.getDbTable<T>(tableName).where(propertyName).anyOf(propertyValues).toArray();
  }

  async bulkPut<T = any>(tableName: string, items: T[]) {
    await this.getDbTable<T>(tableName).bulkPut(items);
  }
}
export const IndexedDbService = new IndexedDbController();