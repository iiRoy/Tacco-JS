// Import a utility library, aliased for convenience.
// This provides various helper functions like type checking and object manipulation.
const utilityBelt = require('alloy')._;

/**
 * @private
 * @description A lightweight, empty function used purely for establishing prototype chains
 *              without invoking actual parent constructors during inheritance setup.
 *              It serves as a temporary link in the prototype chain creation process.
 */
const protoChainBuilder = function () {};

/**
 * @class TypeFactory
 * @singleton
 * @description Manages the creation, definition, and registration of new JavaScript classes
 *              within the application's runtime environment.
 */
const TypeFactory = {
    /**
     * Defines and registers a new class based on the provided configuration.
     *
     * If the `typeConfiguration` includes an `initialize` or `construct` method,
     * one of these will be designated as the primary constructor for instances.
     *
     * @param {string} classNameIdentifier - The unique name for the class being defined.
     * @param {object} typeConfiguration - An object literal detailing the class's methods,
     *                                     properties, and inheritance structure.
     * @param {object} [exportContainer] - An optional object (e.g., `module.exports`)
     *                                      to which the newly defined class will be assigned.
     * @returns {Function} The newly created and defined class constructor.
     * @throws {Error} If `classNameIdentifier` is not a string or `typeConfiguration` is not an object.
     */
    createAndRegister: function (classNameIdentifier, typeConfiguration, exportContainer) {
        // --- Input validation and initial setup ---
        if (typeof classNameIdentifier !== 'string' || classNameIdentifier.trim() === '') {
            throw new Error('Class name must be a non-empty string.');
        }
        if (typeof typeConfiguration !== 'object' || typeConfiguration === null) {
            throw new Error('Type configuration must be a valid object.');
        }

        let staticMembers = typeConfiguration.statics || {};
        let baseClassReference = null;
        let newlyConstructedClass; // This will hold our final class constructor

        // Extract and process inheritance information
        const parentDefinition = typeConfiguration.extend;
        if (parentDefinition) {
            baseClassReference = utilityBelt.isString(parentDefinition)
                ? require(parentDefinition)
                : parentDefinition;
        }

        // Clean up the configuration object by removing processed keys
        // Create a shallow copy to prevent modifying the original typeConfiguration object
        const methodAndPropertyDefinitions = { ...typeConfiguration };
        delete methodAndPropertyDefinitions.extend;
        delete methodAndPropertyDefinitions.statics;

        // Ensure the class name is set on static members, defaulting if not provided
        // Use a more robust check for own property.
        if (!Object.prototype.hasOwnProperty.call(staticMembers, 'classname')) {
            staticMembers.classname = classNameIdentifier;
        }

        // --- Determine the class constructor function ---
        if (Object.prototype.hasOwnProperty.call(methodAndPropertyDefinitions, 'initialize')) {
            newlyConstructedClass = methodAndPropertyDefinitions.initialize;
        } else if (Object.prototype.hasOwnProperty.call(methodAndPropertyDefinitions, 'construct')) {
            newlyConstructedClass = methodAndPropertyDefinitions.construct;
        } else if (baseClassReference) {
            // If inheriting and no explicit constructor, create one that calls the parent's
            newlyConstructedClass = function (...args) {
                // Use apply to forward all arguments to the parent constructor
                baseClassReference.apply(this, args);
            };
        } else {
            // Default empty constructor for a base class that doesn't inherit
            newlyConstructedClass = function () { /* No-op constructor */ };
        }

        // --- Establish prototype chain and inherit instance properties ---
        if (baseClassReference) {
            // Copy static properties from parent to the new class constructor itself
            Object.assign(newlyConstructedClass, baseClassReference);

            // Set up the prototype chain for instance methods and properties using the builder
            protoChainBuilder.prototype = baseClassReference.prototype;
            newlyConstructedClass.prototype = new protoChainBuilder();

            // Mix in the new instance methods and properties from the definition
            Object.assign(newlyConstructedClass.prototype, methodAndPropertyDefinitions);

            // Store a reference to the parent's prototype on the new class's static members
            staticMembers.parent = baseClassReference.prototype;
        } else {
            // For a base class (no inheritance), its prototype is a direct copy of the definitions
            newlyConstructedClass.prototype = Object.assign({}, methodAndPropertyDefinitions);
        }

        // --- Apply static members to the class constructor itself ---
        Object.assign(newlyConstructedClass, staticMembers);

        // --- Finalize prototype and class references ---
        newlyConstructedClass.prototype.constructor = newlyConstructedClass;
        // Also provide a static reference to the class itself via its prototype for convenience
        newlyConstructedClass.prototype.statics = newlyConstructedClass;

        // --- Optional: Assign the class to an export target (e.g., module.exports) ---
        if (exportContainer) {
            exportContainer.exports = newlyConstructedClass;
        }

        return newlyConstructedClass;
    }
};

// Expose the TypeFactory as the module's primary export.
module.exports = TypeFactory;