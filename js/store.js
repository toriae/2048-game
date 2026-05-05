function safeParse(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

const defaultState = {
  theme: localStorage.getItem('theme') || 'dark',
  fontSize: parseInt(localStorage.getItem('fontSize')) || 16,
  readerSettings: safeParse('readerSettings', {
    theme: 'dark',
    fontSize: 18,
    lineHeight: 1.8,
    pageMode: 'scroll'
  })
};

class Store {
  state = { ...defaultState };
  listeners = {};

  subscribe(key, callback) {
    if (!this.listeners[key]) this.listeners[key] = [];
    this.listeners[key].push(callback);
    return () => {
      this.listeners[key] = this.listeners[key].filter(cb => cb !== callback);
    };
  }

  set(key, value) {
    this.state[key] = value;
    this.notify(key);
    this.persist(key, value);
  }

  notify(key) {
    (this.listeners[key] || []).forEach(cb => cb(this.state[key], key));
  }

  persist(key, value) {
    try {
      if (key === 'readerSettings') {
        localStorage.setItem('readerSettings', JSON.stringify(value));
      } else {
        localStorage.setItem(key, value);
      }
    } catch (e) {
      console.warn('Failed to persist setting:', key, e);
    }
  }

  get(key) {
    return this.state[key];
  }
}

export const store = new Store();
