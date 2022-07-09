import Dexie, { type Table } from 'dexie';

interface Book {
  id?: number;
  author: string[];
  title: string;
  cover: Blob;
  file: File;
}

class BookDB extends Dexie {
  books!: Table<Book>;

  constructor() {
    super('bookDB');
    this.version(1).stores({
      books: '++id, author, title, cover, file'
    });
  }
}

export const db = new BookDB();

export async function storeBook(meta: { title: string, author: string[], cover: string }, file: File) {
  let shouldSave = file.size < 30000000;
  for (let storedBook of await db.books.toArray()) {
    if (storedBook.title === meta.title) {
      shouldSave = false;
      return storedBook.id;
    }
  }

  if (shouldSave) {
    try {
      const id = await db.books.add({
        author: meta.author,
        title: meta.title,
        cover: await fetch(meta.cover).then((r) => r.blob()),
        file: file,
      });
      return id;
    } catch (error) {
      console.log(error);
    }
  }
}