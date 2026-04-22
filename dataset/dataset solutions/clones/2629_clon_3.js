(function(allModuleDefinitions) {
    // Cache for already loaded modules.
    const loadedModuleCache = {};

    /**
     * The primary module loading function.
     * It retrieves modules from the definition array, caches them, and handles their execution.
     * @param {number} requestedModuleId - The numeric identifier for the module to be loaded.
     * @returns {*} The exported value of the requested module.
     */
    function moduleLoader(requestedModuleId) {
        // Guard clause: If the module is already in our cache, return its exports immediately.
        if (loadedModuleCache[requestedModuleId]) {
            return loadedModuleCache[requestedModuleId].exportedValue;
        }

        // Initialize a new entry in the module cache.
        // This entry contains metadata about the module's loading state.
        const currentModuleEntry = loadedModuleCache[requestedModuleId] = {
            uniqueIdentifier: requestedModuleId,
            loadingComplete: false,
            exportedValue: {} // This object will be populated by the module's code.
        };

        // Execute the module's definition function.
        // The module function is expected to populate `currentModuleEntry.exportedValue`
        // and may use `moduleLoader` itself to resolve its own dependencies.
        allModuleDefinitions[requestedModuleId].call(
            currentModuleEntry.exportedValue, // The 'this' context for the module's code.
            currentModuleEntry,               // The full module entry object.
            currentModuleEntry.exportedValue, // The specific object where exports should be added.
            moduleLoader                      // The function to request other modules (like `require`).
        );

        // Mark the module as fully loaded after its definition function has executed.
        currentModuleEntry.loadingComplete = true;

        // Return the now-populated exports object.
        return currentModuleEntry.exportedValue;
    }

    // Expose the complete set of module definitions for introspection or advanced use.
    moduleLoader.moduleDefinitions = allModuleDefinitions;
    // Expose the internal cache of loaded modules.
    moduleLoader.cache = loadedModuleCache;

    /**
     * Defines a non-writable, non-enumerable property on a target object.
     * This is typically used for internal flags or to conform to ES module specifications.
     * @param {object} targetObject - The object on which to define the property.
     * @param {string} propertyName - The name of the property to define.
     * @param {function} propertyGetter - A function that returns the property's value when accessed.
     */
    moduleLoader.defineExport = function(targetObject, propertyName, propertyGetter) {
        // Structural change: Check for existing property before defining to prevent errors.
        // Original: n.o(t,r)||Object.defineProperty(t,r,{enumerable:!0,get:e})
        // Clone: if (!moduleLoader.utility_objectHasOwnProperty(targetObject, propertyName)) { ... }
        if (!moduleLoader.utility_objectHasOwnProperty(targetObject, propertyName)) {
            Object.defineProperty(targetObject, propertyName, {
                enumerable: true,     // Make the property visible during enumeration.
                get: propertyGetter   // The function that provides the property's value.
            });
        }
    };

    /**
     * Registers a module as an ECMAScript Module (ESM).
     * This involves setting the `__esModule` flag and `Symbol.toStringTag`.
     * @param {object} moduleExportsObject - The exports object of the module to register.
     */
    moduleLoader.registerEsModule = function(moduleExportsObject) {
        // Add `Symbol.toStringTag` for better object identification.
        if (typeof Symbol !== 'undefined' && Symbol.toStringTag) {
            Object.defineProperty(moduleExportsObject, Symbol.toStringTag, {
                value: 'Module'
            });
        }
        // Set the `__esModule` flag, indicating it's an ES module.
        Object.defineProperty(moduleExportsObject, '__esModule', {
            value: true
        });
    };

    /**
     * Provides interoperability for various module formats (e.g., CommonJS with ES Modules).
     * This function handles different loading scenarios based on `interopMode` flags.
     * @param {*} originalModuleContent - The raw exports from a module.
     * @param {number} interopMode - A bitmask indicating the desired interoperability behavior.
     * @returns {*} The interoperability-wrapped module content.
     */
    moduleLoader.interopRequire = function(originalModuleContent, interopMode) {
        // Mode 1: If the module content is actually a module ID, load it first.
        if (interopMode & 1) {
            originalModuleContent = moduleLoader(originalModuleContent);
        }

        // Mode 8: If it's already an object and explicitly marked as an ES module, return it directly.
        if (interopMode & 8 && typeof originalModuleContent === 'object' && originalModuleContent && originalModuleContent.__esModule) {
            return originalModuleContent;
        }

        // Prepare a new object to hold the interoperability-wrapped exports.
        // This ensures a clean object for the default export.
        const interopWrapper = Object.create(null);
        moduleLoader.registerEsModule(interopWrapper); // Mark the wrapper as an ES module.

        // Define the 'default' export property.
        Object.defineProperty(interopWrapper, 'default', {
            enumerable: true,
            value: originalModuleContent // The original content becomes the default export.
        });

        // Mode 2: If the original module content is not a string, copy all its properties.
        // This is for cases where CommonJS exports need to be exposed as named exports.
        if (interopMode & 2 && typeof originalModuleContent !== 'string') {
            // Iterate over all properties of the original module.
            for (const propertyKey in originalModuleContent) {
                // Define each property on the wrapper, using a getter for lazy access.
                // The getter ensures that the property is accessed from the original module
                // when requested, preserving dynamic behavior if any.
                moduleLoader.defineExport(interopWrapper, propertyKey, ((keyToBind) => {
                    return function() { return originalModuleContent[keyToBind]; };
                }).bind(null, propertyKey)); // Type III: Explicitly bind `null` for `this` context.
            }
        }
        return interopWrapper;
    };

    /**
     * Creates a getter function for a module's default export.
     * This is used by `moduleLoader.n` to simplify access to default exports.
     * @param {*} moduleExportsObject - The exports object of the module.
     * @returns {function} A function that, when called, returns the default export.
     */
    moduleLoader.getModuleDefaultExport = function(moduleExportsObject) {
        // Determine the appropriate getter based on whether `__esModule` is set.
        const defaultExportAccessor = moduleExportsObject && moduleExportsObject.__esModule ?
            function() { return moduleExportsObject.default; } :
            function() { return moduleExportsObject; };

        // Define a property 'a' (likely an alias for 'accessor' or 'all')
        // on the accessor function itself, which points back to the accessor.
        // This pattern is common in webpack for consistent access.
        moduleLoader.defineExport(defaultExportAccessor, 'a', defaultExportAccessor);
        return defaultExportAccessor;
    };

    /**
     * A utility function to check if an object has a direct (non-inherited) property.
     * This is a wrapper around `Object.prototype.hasOwnProperty.call`.
     * @param {object} targetObject - The object to inspect.
     * @param {string} propertyKey - The name of the property to check for.
     * @returns {boolean} `true` if the property exists directly on the object, `false` otherwise.
     */
    moduleLoader.utility_objectHasOwnProperty = function(targetObject, propertyKey) {
        return Object.prototype.hasOwnProperty.call(targetObject, propertyKey);
    };

    // The public path for loading additional chunks or assets (e.g., for code splitting).
    // In this configuration, it's an empty string, implying relative paths or no external chunks.
    moduleLoader.publicPath = "";

    // The entry point of the application.
    // This line initiates the loading of the main module, identified by ID 133.
    moduleLoader(moduleLoader.startupModule = 133);
})([
    // Module 0: utility_polyfillFeatures (Original n(0))
    // This module provides a generic function to apply polyfills and extend existing JavaScript features.
    function(currentModule, currentExports, loader_getModule) {
        const globalObject = loader_getModule(5); // Get a reference to the global object (e.g., `window` or `global`).
        const objectGetOwnPropertyDescriptor = loader_getModule(22).f; // Access `Object.getOwnPropertyDescriptor.f`.
        const utility_defineNonEnumerableProperty = loader_getModule(16); // Helper to define properties that are not enumerable.
        const utility_defineProperty = loader_getModule(23); // Helper to define properties (can be enumerable or not).
        const utility_setGlobalProperty = loader_getModule(79); // Utility to safely set properties on the global object.
        const utility_copyProperties = loader_getModule(100); // Helper to copy properties from one object to another.
        const utility_isForcedPolyfill = loader_getModule(62); // Determines if a polyfill should be applied based on conditions.

        // The core export of this module is a function that applies feature configurations.
        currentModule.exports = function(featureConfig, implementationMap) {
            const featureTargetName = featureConfig.target; // The name of the target object/constructor (e.g., 'Array', 'Math').
            const isGlobalTarget = featureConfig.global;   // Flag indicating if the target is the global object itself.
            const isStaticMethod = featureConfig.stat;     // Flag indicating if the feature is a static method (e.g., `Math.method`).

            let targetContainer; // The actual object where the feature will be added (e.g., `Array.prototype`, `Math`).

            // Determine the correct target container based on the configuration.
            if (isGlobalTarget) {
                targetContainer = globalObject; // Target is the global object.
            } else if (isStaticMethod) {
                // Target is a static property of a global constructor (e.g., `Object.assign`).
                targetContainer = globalObject[featureTargetName] || utility_setGlobalProperty(featureTargetName, {});
            } else {
                // Target is a prototype method (e.g., `Array.prototype.map`).
                targetContainer = (globalObject[featureTargetName] || {}).prototype;
            }

            // Iterate over each feature/method provided in the `implementationMap`.
            for (const featureMethodName in implementationMap) {
                const featureImplementation = implementationMap[featureMethodName]; // The polyfill's implementation.
                let existingFeatureImplementation; // The currently existing implementation of the feature.

                // Retrieve the existing feature, potentially handling cases where direct access is restricted.
                if (featureConfig.noTargetGet) {
                    const descriptor