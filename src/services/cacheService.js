class CacheService {
  constructor() {
    this.cache = new Map();
    this.timeouts = new Map();
    this.MAX_AGE = 1000 * 60 * 15; // 15 minutos
  }

  set(key, value) {
    this.cache.set(key, {
      value,
      timestamp: Date.now()
    });

    // Limpiar timeout anterior si existe
    if (this.timeouts.has(key)) {
      clearTimeout(this.timeouts.get(key));
    }

    // Establecer nuevo timeout
    const timeout = setTimeout(() => {
      this.cache.delete(key);
      this.timeouts.delete(key);
    }, this.MAX_AGE);

    this.timeouts.set(key, timeout);
  }

  get(key) {
    const data = this.cache.get(key);
    if (!data) return null;

    // Verificar si el cache está vigente
    if (Date.now() - data.timestamp > this.MAX_AGE) {
      this.cache.delete(key);
      return null;
    }

    return data.value;
  }

  addPublication(publication) {
    const recentPubs = this.get('recentPublications') || [];
    this.set('recentPublications', [publication, ...recentPubs]);
  }

  clear() {
    this.cache.clear();
    this.timeouts.forEach(timeout => clearTimeout(timeout));
    this.timeouts.clear();
  }
}

// Crear una instancia y exportarla
const cacheServiceInstance = new CacheService();

export default cacheServiceInstance;
