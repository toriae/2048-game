const DB_NAME = 'InkReaderDB';
const DB_VERSION = 1;
const BOOKS_STORE = 'books';
const BOOKMARKS_STORE = 'bookmarks';

let dbInstance = null;

function openDB() {
  if (dbInstance) return Promise.resolve(dbInstance);

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(BOOKS_STORE)) {
        db.createObjectStore(BOOKS_STORE, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(BOOKMARKS_STORE)) {
        const store = db.createObjectStore(BOOKMARKS_STORE, { keyPath: 'id' });
        store.createIndex('bookId', 'bookId', { unique: false });
      }
    };

    request.onsuccess = (e) => {
      dbInstance = e.target.result;
      dbInstance.onclose = () => { dbInstance = null; };
      resolve(dbInstance);
    };

    request.onerror = () => reject(request.error);
  });
}

function getStore(name, mode = 'readonly') {
  return openDB().then(db => {
    const tx = db.transaction(name, mode);
    return tx.objectStore(name);
  });
}

function promisifyRequest(request) {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export const db = {
  async addBook(book) {
    const store = await getStore(BOOKS_STORE, 'readwrite');
    return promisifyRequest(store.put(book));
  },

  async getBook(id) {
    const store = await getStore(BOOKS_STORE);
    return promisifyRequest(store.get(id));
  },

  async getAllBooks() {
    const store = await getStore(BOOKS_STORE);
    return promisifyRequest(store.getAll());
  },

  async updateProgress(id, data) {
    const book = await this.getBook(id);
    if (!book) return;
    Object.assign(book, data);
    const store = await getStore(BOOKS_STORE, 'readwrite');
    return promisifyRequest(store.put(book));
  },

  async deleteBook(id) {
    const store = await getStore(BOOKS_STORE, 'readwrite');
    return promisifyRequest(store.delete(id));
  },

  async addBookmark(bookmark) {
    const store = await getStore(BOOKMARKS_STORE, 'readwrite');
    return promisifyRequest(store.put(bookmark));
  },

  async getBookmarks(bookId) {
    const store = await getStore(BOOKMARKS_STORE);
    const index = store.index('bookId');
    return promisifyRequest(index.getAll(bookId));
  },

  async deleteBookmark(id) {
    const store = await getStore(BOOKMARKS_STORE, 'readwrite');
    return promisifyRequest(store.delete(id));
  }
};
