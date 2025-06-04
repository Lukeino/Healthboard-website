// Semplice Event Bus per la comunicazione tra componenti
class EventBus {
  constructor() {
    this.events = {};
  }

  // Registra un listener per un evento
  on(event, callback) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
  }

  // Rimuove un listener per un evento
  off(event, callback) {
    if (!this.events[event]) return;
    this.events[event] = this.events[event].filter(cb => cb !== callback);
  }

  // Emette un evento
  emit(event, data) {
    if (!this.events[event]) return;
    this.events[event].forEach(callback => callback(data));
  }
}

// Eventi predefiniti
const EVENTS = {
  PATIENT_CREATED: 'patient_created',
  PATIENT_UPDATED: 'patient_updated',
  PATIENT_DELETED: 'patient_deleted'
};

// Esporta un'istanza singleton con eventi inclusi
export const eventBus = new EventBus();
eventBus.EVENTS = EVENTS;

// Esporta anche EVENTS separatamente per retrocompatibilità
export { EVENTS };
