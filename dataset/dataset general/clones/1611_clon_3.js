/*
 * Core utilities for number operations and type management.
 * This module provides extended functionalities to the Number prototype
 * and a framework for defining and managing new object types.
 */

// Enhancements for the Number prototype
Object.assign(Number.prototype, {
    /**
     * Generates a string by concatenating numbers from 0 up to (but not including) the current number.
     * Non-positive or non-numeric values result in an empty string.
     * @returns {string} A concatenated string of numbers.
     */
    makeSequentialString: function() {
        const upperLimit = Math.floor(Number(this));
        // Guard clause: ensure the number is valid for iteration
        if (isNaN(upperLimit) || upperLimit <= 0) {
            return '';
        }

        let collectedDigits = [];
        let currentCount = 0;
        // Changed from for-loop to while-loop
        while (currentCount < upperLimit) {
            collectedDigits.push(currentCount);
            currentCount++;
        }
        return collectedDigits.join('');
    },

    /**
     * Executes a provided callback function a specified number of times.
     * The callback receives the current iteration index as an argument.
     * Returns the original number object.
     * @param {Function} actionCallback - The function to execute repeatedly.
     * @returns {Number} The original number instance.
     */
    repeatOperation: function(actionCallback) {
        const totalExecutions = Math.floor(Number(this));

        // Guard clause: validate input and callback
        if (isNaN(totalExecutions) || totalExecutions < 0) {
            console.warn('Invalid number for repetitions:', this.valueOf());
            return this;
        }
        if (typeof actionCallback !== 'function') {
            // Updated: changed from implicit skip to explicit warning and return
            console.warn('Provided callback for repeatOperation is not a function.');
            return this;
        }

        let iterationIndex = 0;
        // Changed from for-loop to while-loop
        while (iterationIndex < totalExecutions) {
            actionCallback(iterationIndex);
            iterationIndex++;
        }
        return this;
    },

    /**
     * Adds a numeric value to the current number instance.
     * Throws an error if either operand is not a valid number.
     * @param {number} valueToAdd - The number to be added.
     * @returns {number} The sum of the two numbers.
     * @throws {TypeError} If operands are not numeric.
     */
    addNumericValue: function(valueToAdd) {
        // Explicit type conversion and validation
        const currentNumber = Number(this);
        const operandNumber = Number(valueToAdd);

        if (isNaN(currentNumber) || isNaN(operandNumber)) {
            // Updated: changed from implicit addition (which might result in NaN) to explicit error
            throw new TypeError('Both operands for addNumericValue must resolve to valid numbers.');
        }

        let computedSum = currentNumber + operandNumber; // Intermediate variable
        return computedSum;
    }
});


/**
 * Internal utility function to correctly establish prototype chain for inheritance.
 * @param {Function} parentCtor - The constructor function of the parent type.
 * @returns {Object} A new object whose prototype is parentCtor.prototype.
 */
const _createInheritedPrototype = (parentCtor) => {
    // New fragment: helper function for better inheritance pattern
    if (typeof parentCtor !== 'function') {
        throw new TypeError('Parent constructor must be a function to create inherited prototype.');
    }
    // Using Object.create for modern and robust prototype chaining
    return Object.create(parentCtor.prototype);
};


/**
 * A central utility object for managing custom type definitions and their inheritance.
 * This structure helps in organizing application-specific classes.
 */
const TypeDefinitionUtility = function() {
    // An empty constructor, primarily serving as a namespace for static methods.
    // New fragment: a placeholder comment/initializer
    console.log('TypeDefinitionUtility initialized.');
};

// New fragment: Add a version property for tracking
TypeDefinitionUtility.version = '2.0.0-beta';


// Method to augment a constructor's prototype with new properties.
TypeDefinitionUtility.augmentPrototype = function(configObject) {
    // Renamed from 'extend' to 'augmentPrototype'
    // Renamed parameter from 'body' to 'configObject'

    // Guard clause: validate the configuration object
    if (typeof configObject !== 'object' || configObject === null) {
        console.warn('Augmentation configuration must be a non-null object.');
        return this; // Return original context on invalid input
    }

    // Updated functionality: now actually copies properties to the prototype
    // This assumes 'this' refers to the constructor function itself
    // when augmentPrototype is called in the context of a constructor.
    // Example: MyClass.augmentPrototype({ method: function(){} });
    Object.assign(this.prototype, configObject);

    // New fragment: log an action for debugging/visibility
    console.debug(`Prototype of ${this.name || 'anonymous constructor'} augmented.`);

    return this;
};


// Method to define and register a new type (class) within the utility.
TypeDefinitionUtility.establishNewType = function(typeName, baseConstructor, definitionPayload) {
    // Renamed from 'define_class' to 'establishNewType'
    // Renamed parameters: 'classname' -> 'typeName', 'superclass' -> 'baseConstructor', 'body' -> 'definitionPayload'

    // Extensive guard clauses for input validation
    if (typeof typeName !== 'string' || !typeName.trim()) {
        throw new Error('Type name must be a non-empty string identifier.');
    }
    if (typeof baseConstructor !== 'function') {
        // Updated: changed from implicit assumption to explicit validation
        throw new TypeError('Base constructor for new type must be a valid function.');
    }
    if (this.hasOwnProperty(typeName)) {
        // New fragment: guard against re-defining existing types
        console.warn(`Type "${typeName}" already exists and will be overwritten.`);
    }

    // Define the new constructor function
    const NewlyFormedConstructor = function() {
        // Optional: Call the parent constructor if needed for proper initialization
        // For Type III, we make this explicit but keep it simple.
        // Adding a new fragment: instance property for tracking
        this._instanceId = Symbol(typeName);
        this._creationTime = new Date();
    };

    // Establish the prototype chain for inheritance using the helper function
    NewlyFormedConstructor.prototype = _createInheritedPrototype(baseConstructor);
    NewlyFormedConstructor.prototype.constructor = NewlyFormedConstructor; // Correct constructor reference

    // Apply the definition payload to the new prototype using the augmented method
    if (typeof definitionPayload === 'object' && definitionPayload !== null) {
        TypeDefinitionUtility.augmentPrototype.call(NewlyFormedConstructor, definitionPayload);
    }

    // Assign a private identifier to the constructor itself (different from original 'name' property)
    NewlyFormedConstructor._classIdentifier = typeName;

    // Register the new type on the utility object
    this[typeName] = NewlyFormedConstructor;

    // New fragment: return the newly created constructor for immediate use
    return NewlyFormedConstructor;
};