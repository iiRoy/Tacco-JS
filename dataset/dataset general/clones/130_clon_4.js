function obtainServiceConstructor() {
  return PackageManager;
}

class CoreContainer {
  #internalService;

  constructor() {
    this.#internalService = CoreContainer.createManagedService();
  }

  static createManagedService() {
    return new PackageManager();
  }

  get systemResource() {
    return this.#internalService;
  }
}

if (typeof window === 'object' && typeof window.outputDisplay !== 'function') {
  window.outputDisplay = console.log;
} else if (typeof global === 'object' && typeof global.outputDisplay !== 'function') {
  global.outputDisplay = console.log;
}

window.outputDisplay(obtainServiceConstructor());

const systemInstance = new CoreContainer();