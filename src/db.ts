import { openDB, deleteDB } from 'idb';
import type { Book } from './services/types';

const DB_NAME = 'bookDB';
const DB_VERSION = 1;
const BOOKS_STORE = 'books';

const openBookDB = openDB(DB_NAME, DB_VERSION, {
  upgrade(db) {
    if (!db.objectStoreNames.contains(BOOKS_STORE)) {
      db.createObjectStore(BOOKS_STORE, { keyPath: 'id', autoIncrement: true });
    }
  },
});

const bookDB = {
  async addBook(book: Book) {
    try {
      return (await openBookDB).add(BOOKS_STORE, book);
    } catch (error) {
      console.error('Failed to add book:', error);
      return -1;
    }
  },

  async removeBook(id: number) {
    try {
      return (await openBookDB).delete(BOOKS_STORE, id);
    } catch (error) {
      console.error('Failed to remove book:', error);
      return -1;
    }
  },

  async getBook(id: number) {
    try {
      return (await openBookDB).get(BOOKS_STORE, id);
    } catch (error) {
      console.error('Failed to get book:', error);
      return null;
    }
  },

  async getAll() {
    try {
      return (await openBookDB).getAll(BOOKS_STORE);
    } catch (error) {
      console.error('Failed to get all books:', error);
      if (error.message.includes("version")) {
        // This is primarily such that if an old (higher version) 
        // database is found (like one from Dexie),
        // a new one can be created and allow the app to continue.
        console.log("Deleting old database");
        await deleteDB(DB_NAME);
        location.reload();
      }
      return [];
    }
  },
};

export default bookDB;
