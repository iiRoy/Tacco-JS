/**
 * @module Classy.js
 * @description A robust, lightweight framework for class-based inheritance patterns in JavaScript.
 * @version 1.0.0 (Type III Clone)
 * @author Derived from Proton.js by Ali Najafizadeh
 * @license MIT Equivalent (functional clone)
 */
(function globalModuleWrapper() {
    'use strict';

    // Internal configuration and state management
    const internalState = {
        constructorKey: 'initializer', // Renamed from 'init'
        classCounter: 0,
        debugMode: false
    };

    let Classy, AspectEngine; // Renamed from Proton, AOP

    /**
     * @private
     * @function constructBlueprint
     * @description Transforms a plain object specification into a callable constructor function
     * and assigns its properties to the prototype. Each generated class receives a unique ID.
     * @param {Object} blueprintDefinition - An object defining the class, including an 'initializer' method.
     * @returns {Function} A new constructor function representing the class.
     * @throws {Error} If the blueprintDefinition is not a valid object.
     */
    function constructBlueprint(blueprintDefinition) {
        if (typeof blueprintDefinition !== 'object' || blueprintDefinition === null) {
            throw new Error('Classy: Blueprint definition must be a non-null object.');
        }

        // Extract the constructor function; default to an empty function if not provided.
        const newClassConstructor = blueprintDefinition[internalState.constructorKey] || function defaultInitializer() {};

        // Assign a unique internal identifier to the class for debugging/tracking.
        newClassConstructor.__classyId = ++internalState.classCounter;

        // Iterate over the blueprint's own properties, assigning them to the prototype
        // of the newly created constructor function.
        Object.keys(blueprintDefinition).forEach(propertyName => {
            if (propertyName !== internalState.constructorKey) {
                newClassConstructor.prototype[propertyName] = blueprintDefinition[propertyName];
            }
        });

        if (internalState.debugMode) {
            console.log(`Classy: Created new class with ID ${newClassConstructor.__classyId}`);
        }

        return newClassConstructor;
    }

    /**
     * @private
     * @function mixinPrototypeMembers
     * @description Merges properties from a source specification into a target specification,
     * ensuring that existing properties on the target are not overwritten.
     * This is primarily used for prototype inheritance.
     * @param {Object} targetPrototypeSpec - The specification object to receive new properties.
     * @param {Object} sourcePrototypeSpec - The specification object providing properties to merge.
     * @throws {Error} If either specification is not a valid object.
     */
    function mixinPrototypeMembers(targetPrototypeSpec, sourcePrototypeSpec) {
        if (typeof targetPrototypeSpec !== 'object' || targetPrototypeSpec === null) {
            throw new Error('Classy: Target prototype specification must be a non-null object for mixing.');
        }
        if (typeof sourcePrototypeSpec !== 'object' || sourcePrototypeSpec === null) {
            console.warn('Classy: Source prototype specification is not a valid object. Skipping mixin operation.');
            return;
        }

        // Iterate through all enumerable properties of the source prototype.
        for (const memberIdentifier in sourcePrototypeSpec) {
            // Only consider own properties of the source and skip the constructor key.
            if (Object.prototype.hasOwnProperty.call(sourcePrototypeSpec, memberIdentifier) &&
                memberIdentifier !== internalState.constructorKey) {
                // If the target doesn't already have this property, add it.
                if (!Object.prototype.hasOwnProperty.call(targetPrototypeSpec, memberIdentifier)) {
                    targetPrototypeSpec[memberIdentifier] = sourcePrototypeSpec[memberIdentifier];
                }
            }
        }
    }

    /**
     * @global
     * @function Classy
     * @description The primary interface for defining and extending classes.
     * This function supports two main modes of operation:
     * 1. Defining a new class: `const MyClass = Classy({ initializer: function() {}, methodA: function() {} });`
     * 2. Adding static methods to an existing class: `Classy(MyClass, { staticMethodB: function() {} });`
     *
     * @param {Object|Function} classSpecification - Either an object literal defining a new class,
     *                                               or an existing Classy-generated class constructor.
     * @param {Object} [staticMethodsCollection] - An optional object containing methods to be added
     *                                             as static properties to an existing class constructor.
     * @returns {Function|undefined} The newly created class constructor, or `undefined` if
     *                               adding static methods to an existing class.
     * @throws {Error} If classSpecification is invalid.
     */
    Classy = function (classSpecification, staticMethodsCollection) {
        // --- Mode 2: Adding static methods to an existing class ---
        if (staticMethodsCollection !== undefined && staticMethodsCollection !== null) {
            if (typeof classSpecification !== 'function') {
                throw new Error('Classy: When adding static methods, the first argument must be an existing class constructor.');
            }
            if (typeof staticMethodsCollection !== 'object' || staticMethodsCollection === null) {
                throw new Error('Classy: Static methods collection must be a non-null object.');
            }
            // Directly assign static methods to the target class constructor.
            Object.assign(classSpecification, staticMethodsCollection);
            if (internalState.debugMode) {
                console.log(`Classy: Added static methods to class ID ${classSpecification.__classyId || 'unknown'}.`);
            }
            return; // No new class is returned in this mode.
        }

        // --- Mode 1: Defining a new class ---
        if (typeof classSpecification !== 'object' || classSpecification === null) {
            throw new Error('Classy: Class definition must be a non-null object.');
        }

        const parentConstructor = constructBlueprint(classSpecification);

        /**
         * @method Classy.extend
         * @description A static method attached to each generated class, allowing it to be extended.
         * Creates a new class that inherits from the current class.
         * @param {Object} derivedClassSpecification - An object defining the child class.
         * @returns {Function} The new derived class constructor.
         * @memberof Classy
         */
        parentConstructor.derive = function (derivedClassSpecification) {
            if (typeof derivedClassSpecification !== 'object' || derivedClassSpecification === null) {
                throw new Error('Classy.derive: Derived class specification must be a non-null object.');
            }

            // Mix in properties from the parent's blueprint into the child's blueprint.
            mixinPrototypeMembers(derivedClassSpecification, classSpecification);

            // Create the derived class using the main Classy function.
            const derivedClassInstance = Classy(derivedClassSpecification);

            /**
             * @method derivedClassInstance.invokeSuperConstructor
             * @description A utility method for derived classes to call their parent's constructor.
             * This should typically be the first line within the derived class's `initializer`.
             * @param {...*} invocationArgs - The arguments to pass to the parent constructor,
             *                                 with the first argument being the `this` context.
             * @memberof Classy
             */
            derivedClassInstance.invokeSuperConstructor = function () {
                const invocationArgs = Array.from(arguments); // Convert arguments to a real array.
                const instanceContext = invocationArgs.shift(); // The first argument is the instance context.

                if (instanceContext === undefined || instanceContext === null) {
                    console.error('Classy.invokeSuperConstructor: Context (this) is undefined or null. Ensure you pass `this` as the first argument.');
                    return;
                }
                parentConstructor.apply(instanceContext, invocationArgs);
            };

            /**
             * @property {Function} derivedClassInstance.superClassReference
             * @description A reference to the direct parent class constructor.
             * Useful for accessing parent static methods or for explicit super calls.
             * @memberof Classy
             */
            derivedClassInstance.superClassReference = parentConstructor;

            if (internalState.debugMode) {
                console.log(`Classy: Class ID ${derivedClassInstance.__classyId} derived from ID ${parentConstructor.__classyId}.`);
            }

            return derivedClassInstance;
        };

        return parentConstructor;
    };

    /**
     * @static
     * @function Classy.identifyClass
     * @description A helper to check if a given function is a Classy-generated class
     * by looking for its internal unique identifier.
     * @param {Function} potentialClass - The function to check.
     * @returns {boolean} True if it's a Classy class, false otherwise.
     */
    Classy.identifyClass = function (potentialClass) {
        return typeof potentialClass === 'function' &&
               Object.prototype.hasOwnProperty.call(potentialClass, '__classyId') &&
               typeof potentialClass.__classyId === 'number';
    };

    /**
     * @property {Object} Classy.config
     * @description Global configuration object for Classy.
     * @memberof Classy
     */
    Classy.config = {
        setConstructorKey: function(key) {
            if (typeof key !== 'string' || key.trim() === '') {
                throw new Error('Classy.config: Constructor key must be a non-empty string.');
            }
            internalState.constructorKey = key;
        },
        getConstructorKey: function() {
            return internalState.constructorKey;
        },
        enableDebugMode: function(enable) {
            internalState.debugMode = !!enable;
        }
    };


    // --- Aspect-Oriented Programming (AOP) Engine ---

    /**
     * @class AspectEngine
     * @description Provides functionality for aspect-oriented programming (AOP) by
     * allowing 'advice' (functions) to be woven around specific methods of a class.
     * @param {Function} targetClass - The Classy-generated class constructor to advise.
     * @param {string} methodToAdvise - The name of the method within the targetClass's prototype to advise.
     * @throws {Error} If targetClass or methodToAdvise are invalid.
     */
    AspectEngine = Classy({
        initializer: function (targetClass, methodToAdvise) {
            if (!Classy.identifyClass(targetClass)) {
                throw new Error('AspectEngine: Invalid target class provided. Must be a Classy-generated class.');
            }
            if (typeof methodToAdvise !== 'string' || methodToAdvise.trim() === '') {
                throw new Error('AspectEngine: Method name to advise must be a non-empty string.');
            }
            if (typeof targetClass.prototype[methodToAdvise] !== 'function') {
                console.warn(`AspectEngine: Method '${methodToAdvise}' does not exist on the prototype of the target class. Advice might not apply.`);
            }

            this._methodToAdvise = methodToAdvise;
            this._targetPrototype = targetClass.prototype;
        },

        /**
         * @method before
         * @description Executes an advice function *before* the advised method.
         * The advice receives the same arguments as the original method.
         * @param {Function} adviceFunction - The function to run before the original method.
         * @returns {AspectEngine} This instance for chaining.
         */
        before: function (adviceFunction) {
            const originalMethod = this._targetPrototype[this._methodToAdvise];
            if (typeof originalMethod !== 'function') { return this; } // No original method to advise.

            this._targetPrototype[this._methodToAdvise] = function () {
                // Execute the advice function with the current context and arguments.
                adviceFunction.apply(this, arguments);
                // Then, execute the original method.
                return originalMethod.apply(this, arguments);
            };
            return this;
        },

        /**
         * @method afterReturning
         * @description Executes an advice function *after* the advised method successfully returns.
         * The advice receives the return value of the original method as its argument.
         * @param {Function} adviceFunction - The function to run after the original method returns.
         * @returns {AspectEngine} This instance for chaining.
         */
        afterReturning: function (adviceFunction) {
            const originalMethod = this._targetPrototype[this._methodToAdvise];
            if (typeof originalMethod !== 'function') { return this; }

            this._targetPrototype[this._methodToAdvise] = function () {
                // Execute the original method and capture its result.
                const operationResult = originalMethod.apply(this, arguments);
                // Execute the advice function, passing the result of the original method.
                return adviceFunction.call(this, operationResult);
            };
            return this;
        },

        /**
         * @method afterThrowing
         * @description Executes an advice function *if* the advised method throws an exception.
         * The advice receives the thrown exception object as its argument.
         * @param {Function} adviceFunction - The function to run if the original method throws an error.
         * @returns {AspectEngine} This instance for chaining.
         */
        afterThrowing: function (adviceFunction) {
            const originalMethod = this._targetPrototype[this._methodToAdvise];
            if (typeof originalMethod !== 'function') { return this; }

            this._targetPrototype[this._methodToAdvise] = function () {
                let finalResult;
                try {
                    finalResult = originalMethod.apply(this, arguments);
                } catch (exceptionObject) {
                    // If an error occurs, execute the advice function with the caught exception.
                    finalResult = adviceFunction.call(this, exceptionObject);
                }
                return finalResult;
            };
            return this;
        }
    });

    /**
     * @static
     * @function Classy.createAspect
     * @description Factory method for creating an AspectEngine instance, facilitating AOP.
     * This allows you to chain various advice types (`.before()`, `.afterReturning()`, `.afterThrowing()`)
     * to modify the behavior of a class method.
     * @param {Function} targetClass - The Classy class constructor whose method will be advised.
     * @param {string} methodName - The name of the method to apply aspects to.
     * @returns {AspectEngine} A new instance of the AspectEngine for chaining advice.
     * @memberof Classy
     */
    Classy.createAspect = function (targetClass, methodName) {
        return new AspectEngine(targetClass, methodName);
    };

    // --- Exporting the Classy library ---
    // Universal Module Definition (UMD) pattern for Node.js and browser environments.
    const currentGlobalScope = (typeof globalThis !== 'undefined' && globalThis) ||
                               (typeof self !== 'undefined' && self) ||
                               (typeof window !== 'undefined' && window) ||
                               (typeof global !== 'undefined' && global) ||
                               this; // Fallback to `this` in strict mode for global.

    if (typeof exportModule !== 'undefined' && exportModule.exports) {
        // Node.js environment
        exportModule.exports = Classy;
    } else {
        // Browser or other global environment
        currentGlobalScope.Classy = Classy;
        if (internalState.debugMode) {
            console.log('Classy.js loaded into global scope.');
        }
    }

}());