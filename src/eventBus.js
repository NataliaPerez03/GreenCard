class EventBus {
  constructor() {
    this.listeners = {};
    this.history = [];
  }

  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }

    this.listeners[event].push(callback);
    return () => this.off(event, callback);
  }

  off(event, callback) {
    if (!this.listeners[event]) {
      return;
    }

    this.listeners[event] = this.listeners[event].filter((listener) => listener !== callback);
  }

  emit(event, data) {
    this.history.push({ event, data, timestamp: Date.now() });
    (this.listeners[event] || []).forEach((listener) => listener(data));
  }
}

export const eventBus = new EventBus();
