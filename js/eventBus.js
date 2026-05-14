class EventBus {
  constructor() { this.listeners = {}; this.history = []; }
  on(event, cb) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(cb);
    return () => this.off(event, cb);
  }
  off(event, cb) {
    if (this.listeners[event]) this.listeners[event] = this.listeners[event].filter(f => f !== cb);
  }
  emit(event, data) {
    this.history.push({ event, data, timestamp: Date.now() });
    (this.listeners[event] || []).forEach(cb => cb(data));
  }
}
export const eventBus = new EventBus();
