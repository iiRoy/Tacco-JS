((globalCtx, moduleCreator) => {
    // Universal Module Definition (UMD) pattern for library distribution.
    // Supports AMD (RequireJS), CommonJS (Node.js), and browser global scope.

    // Check if AMD loader is present
    if (typeof define === 'function' && define.amd) {
        define([], moduleCreator);
    }
    // Check if CommonJS environment (e.g., Node.js)
    else if (typeof exports === 'object') {
        module.exports = moduleCreator();
    }
    // Fallback for browser global context
    else {
        // Assign the module's export to a global variable.
        // Using 'self' for Web Workers and 'this' for regular browser/Node global.
        globalCtx.ServiceLocator = moduleCreator();
    }
})(typeof self !== 'undefined' ? self : this, () => {
    'use strict'; // Enforce stricter parsing and error handling for cleaner code.

    // This class implements a basic Inversion of Control (IoC) container,
    // often referred to as a Service Locator. It manages the registration
    // and resolution of dependencies.
    const ServiceLocatorHub = function() {
        // A dictionary to store factory functions for services that should
        // produce a new instance every time they are requested (transient scope).
        this._transientFactories = {};

        // A dictionary to store factory functions for services that should
        // produce only a single instance across the application (singleton scope).
        this._uniqueInstanceProducers = {};

        // A cache to hold the already instantiated singleton services.
        // Once a unique service is created, its instance is stored here.
        this._cachedUniqueInstances = {};

        // A dictionary to store pre-instantiated objects, which are
        // returned directly without needing a factory function.
        this._preconfiguredInstances = {};
    };

    /**
     * Resolves and returns a service instance associated with the given key.
     * The resolution order is: pre-configured instance -> cached unique instance -> new unique instance -> new transient instance.
     *
     * @param {string} serviceKey The unique identifier string for the service to be resolved.
     * @param {...any} constructorArguments Any additional arguments to be passed to the service's factory function.
     * @returns {any|undefined} The resolved service instance, or `undefined` if the service cannot be found or created.
     */
    ServiceLocatorHub.prototype.resolveService = function(serviceKey) {
        // Validate the service key to ensure it's a valid string.
        if (typeof serviceKey !== 'string' || serviceKey.trim() === '') {
            console.warn(`ServiceLocatorHub: Attempted to resolve service with an invalid or empty key: '${serviceKey}'`);
            return undefined;
        }

        const normalizedKey = serviceKey.trim();
        // Collect any additional arguments passed to the resolveService method,
        // which are intended for the service's constructor or factory function.
        const constructorArguments = Array.prototype.slice.call(arguments, 1);
        let serviceInstance = undefined; // Initialize with undefined, consistent with not found scenario.

        // Step 1: Check for a pre-configured, already instantiated object.
        // Use Object.prototype.hasOwnProperty.call for safer property checking.
        if (Object.prototype.hasOwnProperty.call(this._preconfiguredInstances, normalizedKey)) {
            serviceInstance = this._preconfiguredInstances[normalizedKey];
            // console.debug(`ServiceLocatorHub: Resolved '${normalizedKey}' as a pre-configured instance.`);
            return serviceInstance;
        }

        // Step 2: Check for a unique (singleton) service.
        if (Object.prototype.hasOwnProperty.call(this._uniqueInstanceProducers, normalizedKey)) {
            // If the unique instance hasn't been created and cached yet, create it now.
            if (!Object.prototype.hasOwnProperty.call(this._cachedUniqueInstances, normalizedKey)) {
                const producerFn = this._uniqueInstanceProducers[normalizedKey];

                // Ensure the registered producer is indeed a function.
                if (typeof producerFn === 'function') {
                    this._cachedUniqueInstances[normalizedKey] = producerFn.apply(this, constructorArguments);
                    // console.debug(`ServiceLocatorHub: Instantiated and cached new unique service for '${normalizedKey}'.`);
                } else {
                    console.error(`ServiceLocatorHub: Unique instance producer for '${normalizedKey}' is not a function.`);
                    return undefined;
                }
            }
            serviceInstance = this._cachedUniqueInstances[normalizedKey];
            // console.debug(`ServiceLocatorHub: Resolved '${normalizedKey}' as a cached unique instance.`);
            return serviceInstance;
        }

        // Step 3: Check for a transient service.
        if (Object.prototype.hasOwnProperty.call(this._transientFactories, normalizedKey)) {
            const factoryFunc = this._transientFactories[normalizedKey];

            // Ensure the registered factory is indeed a function.
            if (typeof factoryFunc === 'function') {
                serviceInstance = factoryFunc.apply(this, constructorArguments);
                // console.debug(`ServiceLocatorHub: Instantiated new transient service for '${normalizedKey}'.`);
                return serviceInstance;
            } else {
                console.error(`ServiceLocatorHub: Transient factory for '${normalizedKey}' is not a function.`);
                return undefined;
            }
        }
        
        // If no matching service definition is found after all checks.
        // console.warn(`ServiceLocatorHub: No service definition found for key '${normalizedKey}'.`);
        return undefined;
    };

    /**
     * Registers a factory function that will be called to produce a new instance
     * every time the service is requested via `resolveService`. This defines a transient service.
     *
     * @param {string} serviceKey The unique identifier string for the service.
     * @param {function} factoryFunc The function responsible for creating the service instance.
     * @returns {ServiceLocatorHub} The current `ServiceLocatorHub` instance, allowing for method chaining.
     * @throws {Error} If `serviceKey` is invalid or `factoryFunc` is not a function.
     */
    ServiceLocatorHub.prototype.registerTransientFactory = function(serviceKey, factoryFunc) {
        if (typeof serviceKey !== 'string' || serviceKey.trim() === '') {
            throw new Error('ServiceLocatorHub: Service key for transient factory must be a non-empty string.');
        }
        if (typeof factoryFunc !== 'function') {
            throw new Error('ServiceLocatorHub: Factory function for transient service must be a valid function.');
        }
        const normalizedKey = serviceKey.trim();
        this._transientFactories[normalizedKey] = factoryFunc;
        // console.debug(`ServiceLocatorHub: Registered transient factory for '${normalizedKey}'.`);
        return this; // Enable fluent API/method chaining.
    };

    /**
     * Registers a factory function for a unique (singleton) service.
     * The factory function will be invoked only once upon the first request for the service,
     * and the resulting instance will be cached and returned for all subsequent requests.
     *
     * @param {string} serviceKey The unique identifier string for the singleton service.
     * @param {function} producerFunc The function that creates the single service instance.
     * @returns {ServiceLocatorHub} The current `ServiceLocatorHub` instance, allowing for method chaining.
     * @throws {Error} If `serviceKey` is invalid or `producerFunc` is not a function.
     */
    ServiceLocatorHub.prototype.registerUniqueFactory = function(serviceKey, producerFunc) {
        if (typeof serviceKey !== 'string' || serviceKey.trim() === '') {
            throw new Error('ServiceLocatorHub: Service key for unique factory must be a non-empty string.');
        }
        if (typeof producerFunc !== 'function') {
            throw new Error('ServiceLocatorHub: Producer function for unique service must be a valid function.');
        }
        const normalizedKey = serviceKey.trim();

        // Optional: Warn if a factory for this key is already registered and clear any cached instance.
        if (Object.prototype.hasOwnProperty.call(this._uniqueInstanceProducers, normalizedKey)) {
            console.warn(`ServiceLocatorHub: Overwriting an existing unique factory for '${normalizedKey}'.`);
            // If replacing a factory, any previously cached instance must be cleared
            // to ensure the new factory is used on the next resolution.
            if (Object.prototype.hasOwnProperty.call(this._cachedUniqueInstances, normalizedKey)) {
                delete this._cachedUniqueInstances[normalizedKey];
                console.warn(`ServiceLocatorHub: Cleared cached unique instance for '${normalizedKey}' due to factory overwrite.`);
            }
        }

        this._uniqueInstanceProducers[normalizedKey] = producerFunc;
        // console.debug(`ServiceLocatorHub: Registered unique factory for '${normalizedKey}'.`);
        return this; // Enable fluent API/method chaining.
    };

    /**
     * Registers an already instantiated object directly as a service.
     * This object will be returned immediately whenever its key is requested,
     * without any factory function being called.
     *
     * @param {string} serviceKey The unique identifier string for the pre-configured instance.
     * @param {any} instanceObject The pre-instantiated object to register. Can be any type, including null/undefined.
     * @returns {ServiceLocatorHub} The current `ServiceLocatorHub` instance, allowing for method chaining.
     * @throws {Error} If `serviceKey` is invalid.
     */
    ServiceLocatorHub.prototype.registerInstance = function(serviceKey, instanceObject) {
        if (typeof serviceKey !== 'string' || serviceKey.trim() === '') {
            throw new Error('ServiceLocatorHub: Service key for instance registration must be a non-empty string.');
        }
        const normalizedKey = serviceKey.trim();
        this._preconfiguredInstances[normalizedKey] = instanceObject;
        // console.debug(`ServiceLocatorHub: Registered pre-configured instance for '${normalizedKey}'.`);
        return this; // Enable fluent API/method chaining.
    };

    // Return the constructor function of our Service Locator Hub.
    return ServiceLocatorHub;
});