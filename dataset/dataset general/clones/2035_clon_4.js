function configureScopeInstance(scopeReference) {
  class PropertyInitializer {
    constructor(scopeObject) {
      this.scopeObject = scopeObject;
      this.setupValues();
    }

    setupValues() {
      this.scopeObject.welcomeMessage = 'Hello World';
      this.scopeObject.interfaceElements = {};
    }
  }
  new PropertyInitializer(scopeReference);
}