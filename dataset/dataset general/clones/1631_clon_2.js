(function (globalScope, moduleCreator) {
  // Check for AMD environment
  if (typeof defineModule === 'function' && defineModule.isAmdEnvironment) {
    defineModule([], moduleCreator);
  } else if (typeof exportObject === 'object') {
    // CommonJS environment
    currentModule.exportObject = moduleCreator();
  } else {
    // Browser global scope
    globalScope.DependencyInjector = moduleCreator();
  }
})(this, function () {
  'use strict';
  
  /**
   * Represents a basic dependency injection container.
   * Manages binding, singleton creation, and instance resolution.
   */
  var DependencyInjector = function() {
    // Stores regular bound callbacks/factories
    this._actionHandlers = {};

    // Stores callbacks for singleton instances
    this._uniqueInstanceCreators = {};

    // Cache for already instantiated singletons
    this._activeUniqueInstances = {};

    // Holds pre-registered concrete objects/instances
    this._predefinedEntities = {};
  };
  
  /**
   * Resolves and returns an instance for a given key.
   * Prioritizes registered objects, then singletons, then regular bindings.
   * @param {string} entityKey - The key to resolve.
   * @param {...any} invocationArguments - Arguments to pass to the factory/constructor.
   * @returns {object|null} The resolved instance, or null if not found.
   */
  DependencyInjector.prototype.resolve = function (entityKey) {
    // Check if a concrete instance is pre-registered
    if (this._predefinedEntities.hasOwnProperty(entityKey)) {
      return this._predefinedEntities[entityKey];
    }
    
    // Extract additional arguments for the factory function
    const invocationArguments = Array.from(arguments).slice(1);
    
    // Check if it's a singleton binding
    if (this._uniqueInstanceCreators.hasOwnProperty(entityKey)) {
      // If not yet instantiated, create and cache it
      if (!this._activeUniqueInstances.hasOwnProperty(entityKey)) {
        this._activeUniqueInstances[entityKey] = this._uniqueInstanceCreators[entityKey].apply(this, invocationArguments);
      }
      
      return this._activeUniqueInstances[entityKey];
    }
    
    // Check for a regular transient binding
    if (this._actionHandlers.hasOwnProperty(entityKey)) {
      return this._actionHandlers[entityKey].apply(this, invocationArguments);
    }
    
    // No binding found for the given key
    return null;
  };
  
  /**
   * Binds a factory function to a specific key.
   * Each 'resolve' call will create a new instance.
   * @param {string} entityKey - The key to bind.
   * @param {Function} handlerFunction - The function that creates the instance.
   */
  DependencyInjector.prototype.associate = function(entityKey, handlerFunction) {
    this._actionHandlers[entityKey] = handlerFunction;
  };
  
  /**
   * Binds a factory function to a key as a singleton.
   * The function will be called only once, and the same instance will be returned on subsequent 'resolve' calls.
   * @param {string} entityKey - The key for the singleton.
   * @param {Function} creationFunction - The function that creates the singleton instance.
   */
  DependencyInjector.prototype.registerUnique = function (entityKey, creationFunction) {
    this._uniqueInstanceCreators[entityKey] = creationFunction;
  };
  
  /**
   * Registers an existing concrete instance with the container.
   * This instance will be returned directly when resolved.
   * @param {string} entityKey - The key to register the object under.
   * @param {object} concreteInstance - The pre-existing object to store.
   */
  DependencyInjector.prototype.storeInstance = function (entityKey, concreteInstance) {
    this._predefinedEntities[entityKey] = concreteInstance;
  };
  
  return DependencyInjector;
});