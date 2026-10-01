import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(__dirname, '../../../data');

// Ensure data folder exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

export class DBStore<T extends { id?: string; _id?: string; createdAt?: Date | string; updatedAt?: Date | string }> {
  private filePath: string;

  constructor(collectionName: string) {
    this.filePath = path.join(DATA_DIR, `${collectionName}.json`);
    if (!fs.existsSync(this.filePath)) {
      fs.writeFileSync(this.filePath, JSON.stringify([], null, 2), 'utf-8');
    }
  }

  private read(): T[] {
    try {
      const content = fs.readFileSync(this.filePath, 'utf-8');
      return JSON.parse(content);
    } catch {
      return [];
    }
  }

  private write(data: T[]): void {
    fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2), 'utf-8');
  }

  async find(filter?: Partial<T> | ((item: T) => boolean)): Promise<T[]> {
    const items = this.read();
    if (!filter) return items;
    if (typeof filter === 'function') {
      return items.filter(filter);
    }
    return items.filter(item => {
      for (const key in filter) {
        if ((item as any)[key] !== (filter as any)[key]) {
          return false;
        }
      }
      return true;
    });
  }

  async findOne(filter: Partial<T> | ((item: T) => boolean)): Promise<T | null> {
    const items = await this.find(filter);
    return items.length > 0 ? items[0] : null;
  }

  async findById(id: string): Promise<T | null> {
    const items = this.read();
    const match = items.find(item => item.id === id || item._id === id);
    return match || null;
  }

  async create(data: Omit<T, 'id' | '_id' | 'createdAt' | 'updatedAt'>): Promise<T> {
    const items = this.read();
    const id = Math.random().toString(36).substring(2, 11);
    const now = new Date().toISOString();
    
    const newItem = {
      ...data,
      id,
      _id: id,
      createdAt: now,
      updatedAt: now,
    } as unknown as T;

    items.push(newItem);
    this.write(items);
    return newItem;
  }

  async findByIdAndUpdate(id: string, update: Partial<T>): Promise<T | null> {
    const items = this.read();
    const idx = items.findIndex(item => item.id === id || item._id === id);
    if (idx === -1) return null;

    const updatedItem = {
      ...items[idx],
      ...update,
      updatedAt: new Date().toISOString(),
    } as T;

    items[idx] = updatedItem;
    this.write(items);
    return updatedItem;
  }

  async findByIdAndDelete(id: string): Promise<boolean> {
    const items = this.read();
    const filtered = items.filter(item => item.id !== id && item._id !== id);
    if (filtered.length === items.length) return false;
    this.write(filtered);
    return true;
  }

  async clear(): Promise<void> {
    this.write([]);
  }

  async count(filter?: Partial<T>): Promise<number> {
    const list = await this.find(filter);
    return list.length;
  }
}
