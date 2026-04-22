// This file contains foundational utilities and type system enhancements.
// It provides core functionalities for object and type manipulation,
// acting as a modern reinterpretation of a classic JavaScript framework's core.

// Using an immediately invoked function expression to encapsulate scope
// and prevent global pollution, while exposing necessary utilities globally.
(function() {

    // --- Global Namespace Configuration ---
    // This object serves as the main entry point for our library,
    // holding versioning and build information.
    this.EnhancedKit = {
        revision: '2.0.1',
        checksum: 'b3f9d1e2c8a7b6f5d4e3a2b1c0d9e8f7a6b5c4d3' // A new, unique build identifier.
    };

    // --- Core Type Identification and Instance Checking ---

    /**
     * Determines the precise kind of a given JavaScript value.
     * This function offers a more granular type classification than the standard `typeof` operator,
     * handling built-in types, DOM elements, and custom family identifiers.
     * @param {*} subject - The value to inspect.
     * @returns {string} A string representing the item's identified kind (e.g., 'null', 'element', 'array', 'function', 'undefined').
     */
    const identifyKind = this.identifyKind = function(subject) {
        // Explicitly handle null and undefined values at the beginning for clarity and performance.
        if (subject === null) return 'null';
        if (subject === undefined) return 'undefined';

        // Check for a custom '$kindFamily' property, which allows objects to declare their type.
        // This is a common pattern in class-based systems for custom type identification.
        if (subject.$kindFamily) {
            const familyIdentifier = subject.$kindFamily();
            if (typeof familyIdentifier === 'string') return familyIdentifier;
        }

        // DOM node specific checks.
        // `nodeName` property is characteristic of DOM nodes.
        if (subject.nodeName) {
            if (subject.nodeType === 1) return 'element'; // HTML Element
            if (subject.nodeType === 3) return (/\S/).test(subject.nodeValue) ? 'textnode' : 'whitespace'; // Text node (with or without content)
            if (subject.nodeType === 9) return 'document'; // Document node
            if (subject.nodeType === 11) return 'documentfragment'; // Document fragment
        }

        // Array-like object checks.
        // `Array.isArray` is the most reliable way to check for true arrays.
        if (Array.isArray(subject)) return 'array';

        // Check for other array-like objects based on `length` property.
        if (typeof subject.length === 'number' && subject.length >= 0) {
            if (subject.callee) return 'arguments'; // The special `arguments` object.
            // Check for specific DOM collections (e.g., HTMLCollection, NodeList).
            if (typeof subject.item === 'function' && typeof subject.namedItem === 'function') return 'htmlcollection';
            if (typeof subject.item === 'function') return 'nodelist';
            // General collection fallback for other array-like structures without `item` method.
            if (Object.prototype.hasOwnProperty.call(subject, 'length') && !subject.nodeType && !subject.callee) return 'collection';
        }

        // Fallback to standard `typeof` for primitive types and functions.
        // For plain objects, this will return 'object', which is further refined by checks above.
        return typeof subject;
    };

    /**
     * Determines if a given item is an instance of a specified constructor or any constructor in its prototype chain.
     * This function extends the standard `instanceof` operator to support custom `parent` links for inheritance systems.
     * @param {*} item - The item to verify.
     * @param {Function} targetConstructor - The constructor function to check against.
     * @returns {boolean} `true` if the item is an instance of `targetConstructor`, `false` otherwise.
     */
    const isInstance = this.isInstance = (item, targetConstructor) => {
        // Early exit for null/undefined items or invalid target constructors.
        if (item === null || item === undefined || typeof targetConstructor !== 'function') return false;

        let currentCtor = item.$ctor || item.constructor; // Use custom '$ctor' if available, otherwise default `constructor`.
        // Traverse the prototype chain using a custom 'parent' property (e.g., for Class systems).
        while (currentCtor) {
            if (currentCtor === targetConstructor) return true;
            currentCtor = currentCtor.parent; // Follow custom 'parent' link.
        }
        // Fallback to the native JavaScript `instanceof` operator for standard inheritance.
        return item instanceof targetConstructor;
    };

    // --- Function Enhancements: Overloading and Extension Utilities ---

    // A list of non-enumerable properties that `for...in` loops might miss in older environments.
    const standardNonEnumerables = ['hasOwnProperty', 'valueOf', 'isPrototypeOf', 'propertyIsEnumerable', 'toLocaleString', 'toString', 'constructor'];
    let needsEnumerablePolyfill = false;
    // Check if `for...in` correctly enumerates `toString` for a simple object.
    for (const prop in { toString: 1 }) {
        if (prop === 'toString') {
            needsEnumerablePolyfill = true;
            break;
        }
    }
    const enumerableFixKeys = needsEnumerablePolyfill ? standardNonEnumerables : [];

    /**
     * Enhances a function to act as a "setter" that can handle either a single key-value pair
     * or an object containing multiple key-value pairs. This allows for flexible API design.
     * @param {boolean} forceObjectInput - If `true`, always treats the first argument as an object of properties.
     * @returns {Function} A new function with overloaded setter capabilities.
     */
    Function.prototype.applyMultipleSetter = function(forceObjectInput) {
        const baseMethod = this; // Capture the original function to be applied.
        return function(firstArgument, secondArgument) {
            // Guard against operations on null/undefined targets.
            if (this === null || this === undefined) {
                console.warn("EnhancedKit: Attempted to set properties on a null/undefined context.");
                return this;
            }

            if (forceObjectInput || typeof firstArgument !== 'string' || firstArgument === null || firstArgument === undefined) {
                // If `forceObjectInput` is true, or `firstArgument` is not a string (implying an object),
                // iterate over its properties and apply the `baseMethod` for each.
                const propertiesObject = firstArgument || {}; // Ensure it's an object, even if null/undefined.
                for (const propName in propertiesObject) {
                    if (Object.prototype.hasOwnProperty.call(propertiesObject, propName)) {
                        baseMethod.call(this, propName, propertiesObject[propName]);
                    }
                }
                // Apply the fix for non-enumerable properties in older JS engines.
                for (let i = enumerableFixKeys.length - 1; i >= 0; i--) {
                    const nonEnumKey = enumerableFixKeys[i];
                    if (Object.prototype.hasOwnProperty.call(propertiesObject, nonEnumKey)) {
                        baseMethod.call(this, nonEnumKey, propertiesObject[nonEnumKey]);
                    }
                }
            } else {
                // Otherwise, assume `firstArgument` is a single key and `secondArgument` is its value.
                baseMethod.call(this, firstArgument, secondArgument);
            }
            return this; // Enable method chaining.
        };
    };

    /**
     * Enhances a function to act as a "getter" that can retrieve either a single property
     * or an array/list of properties, returning results in an object if multiple keys are requested.
     * @param {boolean} forceArrayInput - If `true`, always treats input as an array of keys, even if a single string is passed.
     * @returns {Function} A new function with overloaded getter capabilities.
     */
    Function.prototype.applyMultipleGetter = function(forceArrayInput) {
        const baseMethod = this;
        return function(keyOrKeys) {
            // Guard against invalid input, returning an empty object for consistency.
            if (keyOrKeys === null || keyOrKeys === undefined) {
                return {};
            }

            let keysToProcess;
            // Determine if the input is an array of keys or a single key.
            if (forceArrayInput || (arguments.length > 1 && typeof keyOrKeys !== 'string') ) {
                // If forceArrayInput is true, or multiple arguments are provided, treat `arguments` as the list of keys.
                keysToProcess = Array.from(arguments);
            } else if (Array.isArray(keyOrKeys)) {
                keysToProcess = keyOrKeys;
            } else {
                // If it's a single string key.
                keysToProcess = [keyOrKeys];
            }

            // If there are multiple keys, collect results into an object.
            if (keysToProcess.length > 1 || (Array.isArray(keyOrKeys) && keysToProcess.length === 1)) {
                const results = {};
                for (const singleKey of keysToProcess) {
                    if (singleKey !== null && singleKey !== undefined) { // Validate key before calling base method.
                        results[singleKey] = baseMethod.call(this, singleKey);
                    }
                }
                return results;
            } else {
                // For a single key, return the direct result from the base method.
                return baseMethod.call(this, keyOrKeys);
            }
        };
    };

    /**
     * Adds one or more static methods directly to a constructor function.
     * This uses `applyMultipleSetter` to allow adding methods via an object.
     * @param {string|Object} methodName - The name of the static method, or an object of method names to functions.
     * @param {Function} [methodBody] - The function body if `methodName` is a string.
     */
    Function.prototype.augmentStatic = function(methodName, methodBody) {
        this[methodName] = methodBody;
    }.applyMultipleSetter();

    /**
     * Adds one or more methods to a constructor's prototype, making them instance methods.
     * This uses `applyMultipleSetter` to allow adding methods via an object.
     * @param {string|Object} methodName - The name of the prototype method, or an object of method names to functions.
     * @param {Function} [methodBody] - The function body if `methodName` is a string.
     */
    Function.prototype.implementPrototype = function(methodName, methodBody) {
        this.prototype[methodName] = methodBody;
    }.applyMultipleSetter();

    // --- Type Coercion Utilities ---
    const internalArraySlice = Array.prototype.slice;

    /**
     * Creates a function that, when called, always returns the provided `inputItem`.
     * If `inputItem` is already a function, it's returned directly.
     * This is useful for creating constant functions.
     * @param {*} inputItem - The value to be returned by the created function.
     * @returns {Function} A function that consistently returns `inputItem`.
     */
    Function.createConstant = (inputItem) => {
        return (identifyKind(inputItem) === 'function') ? inputItem : () => inputItem;
    };

    /**
     * Converts any input into a new array. Handles null, undefined, array-like objects, and single values.
     * @param {*} inputItem - The item to convert to an array.
     * @returns {Array} A new array containing the elements of `inputItem`.
     */
    Array.coerceToArray = (inputItem) => {
        if (inputItem === null || inputItem === undefined) return [];
        // Use `KindSystem.canEnumerate` to check for array-like structures, excluding strings.
        if (KindSystem.canEnumerate(inputItem) && identifyKind(inputItem) !== 'string') {
            return (identifyKind(inputItem) === 'array') ? internalArraySlice.call(inputItem) : internalArraySlice.call(inputItem);
        }
        return [inputItem]; // Wrap single items (or non-array-like) in an array.
    };

    /**
     * Attempts to convert an item into a number. Returns `null` if the conversion results in a non-finite number.
     * @param {*} inputItem - The item to convert.
     * @returns {number|null} The numerical representation of the item, or `null`.
     */
    Number.coerceToNumber = (inputItem) => {
        const parsedNumber = parseFloat(inputItem);
        return Number.isFinite(parsedNumber) ? parsedNumber : null;
    };

    /**
     * Converts any input into its string representation.
     * @param {*} inputItem - The item to convert.
     * @returns {string} The string representation of `inputItem`.
     */
    String.coerceToString = (inputItem) => {
        // Explicitly cast to string, safely handling null/undefined.
        return String(inputItem);
    };

    // --- Function State Management: Concealment and Safeguarding ---

    Function.implementPrototype({
        /**
         * Marks a function as 'concealed'. Concealed functions are typically ignored
         * by iteration or introspection utilities, making them effectively "private" within the system.
         * @returns {Function} The function itself, allowing for method chaining.
         */
        conceal: function() {
            this.$isConcealed = true;
            return this;
        },
        /**
         * Marks a function as 'safeguarded'. Safeguarded functions are protected
         * from being easily overwritten by subsequent assignments, ensuring their integrity.
         * @returns {Function} The function itself, allowing for method chaining.
         */
        safeguard: function() {
            this.$isSafeguarded = true;
            return this;
        }
    });

    // --- The Core Type Management System ---

    /**
     * `KindSystem` is the central component for managing and registering custom types.
     * It allows associating a string `typeName` with a JavaScript `constructorRef`,
     * and provides utilities for type checking and extension.
     * @param {string} typeName - The unique name for the type (e.g., 'String', 'MyClass').
     * @param {Function} [constructorRef] - The JavaScript constructor function associated with this type.
     * @returns {Function|null} The registered constructor function, or `null` if no constructor was provided.
     */
    const KindSystem = this.KindSystem = function(typeName, constructorRef) {
        // Essential guard clause: a type name string is mandatory.
        if (!typeName || typeof typeName !== 'string') {
            console.error("KindSystem: A valid type name (string) is required during registration.");
            return null;
        }

        const normalizedName = typeName.toLowerCase();
        // Create a specific type-checking utility, e.g., `KindSystem.isString(item)`.
        KindSystem['is' + typeName] = (item) => (identifyKind(item) === normalizedName);

        if (constructorRef !== null && constructorRef !== undefined) {
            // Assign a custom type family identifier to the prototype.
            // This is concealed to prevent it from being easily enumerated.
            constructorRef.prototype.$kindFamily = (() => normalizedName).conceal();
            // Store a reference to the KindSystem that managed this constructor.
            constructorRef.$kindSystemConstructor = KindSystem;
            // Add a custom constructor reference on the prototype for `isInstance` checks.
            constructorRef.prototype.$ctor = constructorRef;

            // Augment the constructor with KindSystem's own static methods (e.g., `augmentStatic`, `implementPrototype`).
            // This allows built-in types to be extended using the system's mechanisms.
            constructorRef.augmentStatic(KindSystem);
        }

        return constructorRef || null;
    };

    const objectPrototypeToString = Object.prototype.toString;

    /**
     * Checks if an item is "enumerable" in the context of being array-like (having a `length` property).
     * This specifically excludes functions, even if they have a `length` property (which indicates arity).
     * @param {*} item - The item to check for enumerability.
     * @returns {boolean} `true` if the item is enumerable, `false` otherwise.
     */
    KindSystem.canEnumerate = (item) => {
        return (item !== null && item !== undefined && typeof item.length === 'number' && objectPrototypeToString.call(item) !== '[object Function]');
    };

    // --- Extension Point Management ---

    const extensionHooksRegistry = {}; // Stores arrays of functions that act as extension hooks for types.

    /**
     * Retrieves the list of registered extension hooks for a given prototype's kind.
     * If no hooks exist for that kind, an empty array is created and returned.
     * @param {Object} prototypeObject - The prototype object (e.g., `String.prototype`) to find hooks for.
     * @returns {Array<Function>} An array of hook functions.
     */
    const getPrototypeExtensionHooks = (prototypeObject) => {
        const protoKind = identifyKind(prototypeObject);
        if (!extensionHooksRegistry[protoKind]) {
            extensionHooksRegistry[protoKind] = [];
        }
        return extensionHooksRegistry[protoKind];
    };

    /**
     * Applies a new method to a constructor's prototype, respecting protection flags
     * and triggering any registered extension hooks. It can also create a corresponding
     * static method if one doesn't exist.
     * @param {string} methodName - The name of the method to add.
     * @param {Function} methodLogic - The function body for the new method.
     */
    const applyPrototypeMethod = function(methodName, methodLogic) {
        // Do not apply methods marked as concealed.
        if (methodLogic && methodLogic.$isConcealed) return;

        // Execute all registered extension hooks for the current type's prototype.
        const currentHooks = getPrototypeExtensionHooks(this.prototype);
        for (const hook of currentHooks) {
            if (identifyKind(hook) === 'kindsystem') {
                // If the hook is a KindSystem instance, delegate the implementation to it.
                applyPrototypeMethod.call(hook, methodName, methodLogic);
            } else if (typeof hook === 'function') {
                // Otherwise, execute the direct hook function.
                hook.call(this, methodName, methodLogic);
            }
        }

        const existingMethod = this.prototype[methodName];
        // Only override the method if it doesn't exist or is not safeguarded.
        if (existingMethod === null || existingMethod === undefined || !existingMethod.$isSafeguarded) {
            this.prototype[methodName] = methodLogic;
        }

        // Automatically create a static helper method if none exists and the prototype method is a function.
        // This static method allows calling the instance method on an item passed as the first argument.
        if ((this[methodName] === null || this[methodName] === undefined) && identifyKind(methodLogic) === 'function') {
            applyStaticMethod.call(this, methodName, function(targetItem, ...extraArgs) {
                if (targetItem === null || targetItem === undefined) {
                    console.warn(`EnhancedKit: Static call to '${methodName}' received null/undefined target.`);
                    return undefined;
                }
                return methodLogic.apply(targetItem, extraArgs);
            });
        }
    };

    /**
     * Applies a new static method directly to a constructor function, respecting protection flags.
     * @param {string} methodName - The name of the static method to add.
     * @param {Function} methodLogic - The function body for the new static method.
     */
    const applyStaticMethod = function(methodName, methodLogic) {
        // Do not apply methods marked as concealed.
        if (methodLogic && methodLogic.$isConcealed) return;

        const existingStaticMethod = this[methodName];
        // Only override if the existing static method is not safeguarded.
        if (existingStaticMethod === null || existingStaticMethod === undefined || !existingStaticMethod.$isSafeguarded) {
            this[methodName] = methodLogic;
        }
    };

    // Augment the KindSystem itself with methods to manage type extensions.
    KindSystem.implementPrototype({
        /**
         * Implements one or more prototype methods for the type managed by this KindSystem.
         * Uses the `applyMultipleSetter` to handle flexible input (single key-value or object).
         */
        implement: applyPrototypeMethod.applyMultipleSetter(),

        /**
         * Extends the static properties of the type managed by this KindSystem.
         * Uses the `applyMultipleSetter` for flexible input.
         */
        extend: applyStaticMethod.applyMultipleSetter(),

        /**
         * Creates an alias for an existing prototype method on the type managed by this KindSystem.
         * @param {string} newMethodName - The new name for the method.
         * @param {string} existingMethodName - The name of the method to alias.
         */
        createAlias: function(newMethodName, existingMethodName) {
            const targetMethod = this.prototype[existingMethodName];
            if (targetMethod) {
                applyPrototypeMethod.call(this, newMethodName, targetMethod);
            } else {
                console.warn(`EnhancedKit: Alias creation failed for '${newMethodName}': Existing method '${existingMethodName}' not found.`);
            }
        }.applyMultipleSetter(),

        /**
         * Registers a hook function that will be executed whenever new methods are implemented
         * for the type managed by this KindSystem.
         * @param {Function} hookFunction - The function to register as an extension hook.
         * @returns {Object} This KindSystem instance, allowing chaining.
         */
        registerExtensionHook: function(hookFunction) {
            if (typeof hookFunction === 'function') {
                getPrototypeExtensionHooks(this.prototype).push(hookFunction);
            } else {
                console.warn("EnhancedKit: Attempted to register a non-function as an extension hook.");
            }
            return this;
        }
    });

    // Register KindSystem itself as a type within the system.
    new KindSystem('KindSystem', KindSystem);

    // --- Setup for Built-in JavaScript Types ---

    /**
     * A helper function to consistently register and configure built-in JavaScript types
     * within the KindSystem. It registers the type, safeguards specified methods, and
     * applies any existing prototype methods to ensure they are tracked by the system.
     * @param {string} typeName - The name of the built-in type (e.g., 'String', 'Array').
     * @param {Function} constructorRef - The native JavaScript constructor (e.g., String, Array).
     * @param {Array<string>} methodsToSafeguard - An array of method names to mark as protected.
     * @returns {Function} This `configureBuiltinType` function itself, for fluent chaining.
     */
    const configureBuiltinType = function(typeName, constructorRef, methodsToSafeguard) {
        // Input validation.
        if (!typeName || typeof typeName !== 'string' || typeof constructorRef !== 'function' || !Array.isArray(methodsToSafeguard)) {
            console.error("EnhancedKit: Invalid arguments for `configureBuiltinType`.");
            return configureBuiltinType;
        }

        const isStandardType = (constructorRef !== Object); // Special handling for the base `Object` type.
        let kindSystemInstance = constructorRef;

        if (isStandardType) {
            // Register the constructor with our KindSystem.
            kindSystemInstance = new KindSystem(typeName, constructorRef);
        }

        const prototypeRef = constructorRef.prototype;

        // Iterate through methods to safeguard, protecting them from accidental overwrites.
        for (const key of methodsToSafeguard) {
            const staticMethod = constructorRef[key];
            const protoMethod = prototypeRef[key];

            if (staticMethod && typeof staticMethod === 'function') {
                staticMethod.safeguard();
            }
            if (isStandardType && protoMethod && typeof protoMethod === 'function') {
                // Safeguarding native prototype methods might require a temporary removal and re-assignment
                // in some environments to ensure the '$isSafeguarded' flag is correctly set on the function object.
                delete prototypeRef[key];
                prototypeRef[key] = protoMethod.safeguard();
            }
        }

        // For actual types (not just the base `Object`), apply all methods currently on their prototype.
        // This integrates existing native methods into the KindSystem's extension model.
        if (isStandardType && kindSystemInstance) {
            kindSystemInstance.implement(prototypeRef);
        }

        return configureBuiltinType; // Allow chaining calls.
    };

    // Apply the configuration to standard JavaScript built-in types.
    configureBuiltinType('String', String, [
        'charAt', 'charCodeAt', 'concat', 'indexOf', 'lastIndexOf', 'match', 'quote', 'replace', 'search',
        'slice', 'split', 'substr', 'substring', 'toLowerCase', 'toUpperCase', 'trim', 'startsWith', 'endsWith', 'includes' // Added modern string methods.
    ])('Array', Array, [
        'pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift', 'concat', 'join', 'slice',
        'indexOf', 'lastIndexOf', 'filter', 'forEach', 'every', 'map', 'some', 'reduce', 'reduceRight', 'find', 'findIndex', 'flat', 'flatMap' // Added modern array methods.
    ])('Number', Number, [
        'toExponential', 'toFixed', 'toLocaleString', 'toPrecision'
    ])('Function', Function, [
        'apply', 'call', 'bind'
    ])('RegExp', RegExp, [
        'exec', 'test'
    ])('Object', Object, [
        'create', 'defineProperty', 'defineProperties', 'keys', 'values', 'entries', // Added Object.values/entries.
        'getPrototypeOf', 'getOwnPropertyDescriptor', 'getOwnPropertyNames',
        'preventExtensions', 'isExtensible', 'seal', 'isSealed', 'freeze', 'isFrozen'
    ])('Date', Date, ['now']); // Date.now is a static method.

    // Directly extend Object with the static extension mechanism.
    Object.augmentStatic = applyStaticMethod.applyMultipleSetter();

    // Add a static 'currentTime' method to Date, ensuring it's protected.
    Date.augmentStatic('currentTime', function() {
        return +(new Date()); // Returns current timestamp as a number.
    }.safeguard()); // Mark as safeguarded.

    new KindSystem('Boolean', Boolean); // Register Boolean type.

    // Custom `$kindFamily` implementation for Number.prototype to handle NaN.
    // This ensures NaN is identified as 'null' within our system, aligning with `identifyKind`.
    Number.prototype.$kindFamily = function() {
        return Number.isFinite(this.valueOf()) ? 'number' : 'null';
    }.conceal(); // Mark as concealed.

    // --- Number Utilities ---

    Number.augmentStatic('generateRandom', function(minBoundary, maxBoundary) {
        // Robust input validation for random number generation.
        if (typeof minBoundary !== 'number' || typeof maxBoundary !== 'number' || minBoundary > maxBoundary) {
            console.error("EnhancedKit: `generateRandom` requires valid numerical boundaries (min <= max).");
            return NaN;
        }
        return Math.floor(Math.random() * (maxBoundary - minBoundary + 1) + minBoundary);
    });

    // --- Iteration Utilities ---

    const objectHasOwnProperty = Object.prototype.hasOwnProperty;

    Object.augmentStatic('iterateProperties', function(targetObject, callbackFunction, bindContext) {
        // Guard against invalid inputs for iteration.
        if (targetObject === null || targetObject === undefined || typeof callbackFunction !== 'function') {
            console.warn("EnhancedKit: `iterateProperties` requires a valid object and a function callback.");
            return;
        }
        // Iterate over own enumerable properties of the object.
        for (const propertyKey in targetObject) {
            if (objectHasOwnProperty.call(targetObject, propertyKey)) {
                callbackFunction.call(bindContext, targetObject[propertyKey], propertyKey, targetObject);
            }
        }
    });

    Object.iterate = Object.iterateProperties; // Create a convenient alias.

    Array.implementPrototype({
        iterateElements: function(callbackFunction, bindContext) {
            if (typeof callbackFunction !== 'function') {
                console.warn("EnhancedKit: `iterateElements` requires a function callback.");
                return;
            }
            // Use a traditional `for` loop for robust sparse array handling and performance.
            for (let i = 0; i < this.length; i++) {
                if (i in this) { // Check if the index truly exists (for sparse arrays).
                    callbackFunction.call(bindContext, this[i], i, this);
                }
            }
        },
        // Alias for convenience, and returns `this` for chaining.
        iterate: function(callbackFunction, bindContext) {
            this.iterateElements(callbackFunction, bindContext);
            return this;
        }
    });

    // --- Object/Array Cloning, Merging, and Appending ---

    /**
     * Recursively creates a deep copy of a value. Handles nested arrays, objects, Dates, and RegExps.
     * @param {*} valueToCopy - The value to be deep cloned.
     * @returns {*} A new, deep-cloned instance of the value.
     */
    const performDeepCopy = (valueToCopy) => {
        const kind = identifyKind(valueToCopy);
        switch (kind) {
            case 'array':
                // Assumes Array.prototype.deepClone exists (defined below).
                return valueToCopy.deepClone();
            case 'object':
                // Assumes Object.deepClone exists (defined below).
                return Object.deepClone(valueToCopy);
            case 'date':
                return new Date(valueToCopy.getTime()); // Create a new Date object.
            case 'regexp':
                return new RegExp(valueToCopy.source, valueToCopy.flags); // Create a new RegExp object.
            default:
                return valueToCopy; // Primitives, functions, null, undefined are returned as-is.
        }
    };

    Array.implementPrototype('deepClone', function() {
        // Modern array cloning using `map` and `performDeepCopy`.
        return this.map(item => performDeepCopy(item));
    });

    /**
     * Merges a single property from a source value into a target object.
     * This function handles deep merging for nested objects and arrays.
     * @param {Object} targetObject - The object to merge into.
     * @param {string} propertyKey - The key of the property to merge.
     * @param {*} sourceValue - The value to be merged for the given key.
     * @returns {Object} The modified target object.
     */
    const mergeSinglePropertyDeeply = (targetObject, propertyKey, sourceValue) => {
        const sourceValueKind = identifyKind(sourceValue);
        const targetValueKind = identifyKind(targetObject[propertyKey]);

        if (sourceValueKind === 'object' && targetValueKind === 'object') {
            // If both are objects, recursively deep merge them.
            Object.deepMerge(targetObject[propertyKey], sourceValue);
        } else if (sourceValueKind === 'array') {
            // If the source value is an array, deep clone it into the target.
            targetObject[propertyKey] = sourceValue.deepClone();
        } else {
            // For primitives or non-matching types, perform a deep copy of the source value.
            targetObject[propertyKey] = performDeepCopy(sourceValue);
        }
        return targetObject;
    };

    Object.augmentStatic({
        /**
         * Performs a deep merge of properties from one or more source objects into a target object.
         * Properties from later source objects will overwrite those from earlier ones.
         * @param {Object} target - The initial object to merge into.
         * @param {...Object} sources - One or more source objects whose properties will be merged.
         * @returns {Object} The deeply merged target object.
         */
        deepMerge: function(target, ...sources) {
            // Ensure `target` is a valid object; if not, initialize it as an empty object.
            if (target === null || typeof target !== 'object') {
                target = {};
            }

            // Handle a specific overload: if deepMerge is called with (target, key, value).
            if (typeof target === 'object' && typeof sources[0] === 'string' && sources.length === 2) {
                return mergeSinglePropertyDeeply(target, sources[0], sources[1]);
            }

            // Iterate through each source object.
            for (const source of sources) {
                if (source === null || typeof source !== 'object') continue; // Skip invalid sources.
                for (const key in source) {
                    if (objectHasOwnProperty.call(source, key)) {
                        mergeSinglePropertyDeeply(target, key, source[key]);
                    }
                }
            }
            return target;
        },

        /**
         * Creates a complete deep clone of an object. All nested objects and arrays are also cloned.
         * @param {Object} sourceObject - The object to be deep cloned.
         * @returns {Object} A new object, which is a deep copy of the sourceObject.
         */
        deepClone: function(sourceObject) {
            // Primitives and null are returned as-is.
            if (sourceObject === null || typeof sourceObject !== 'object') {
                return sourceObject;
            }
            const clonedObject = {};
            for (const key in sourceObject) {
                if (objectHasOwnProperty.call(sourceObject, key)) {
                    clonedObject[key] = performDeepCopy(sourceObject[key]);
                }
            }
            return clonedObject;
        },

        /**
         * Performs a shallow copy of properties from one or more source objects into a destination object.
         * Properties from later source objects will overwrite those from earlier ones.
         * This is not a deep copy; nested objects/arrays are copied by reference.
         * @param {Object} destination - The object to copy properties into.
         * @param {...Object} sources - One or more source objects.
         * @returns {Object} The modified destination object.
         */
        shallowCopy: function(destination, ...sources) {
            // Ensure `destination` is a valid object; if not, initialize it.
            if (destination === null || typeof destination !== 'object') {
                destination = {};
            }
            for (const source of sources) {
                if (source === null || typeof source !== 'object') continue; // Skip invalid sources.
                for (const key in source) {
                    if (objectHasOwnProperty.call(source, key)) {
                        destination[key] = source[key];
                    }
                }
            }
            return destination;
        }
    });

    // --- Registering Object-less Types ---
    // These types do not have a direct constructor but are recognized by `identifyKind`.
    ['Object', 'WhiteSpace', 'TextNode', 'Collection', 'Arguments', 'Undefined', 'HTMLCollection', 'NodeList', 'Document', 'DocumentFragment'].iterateElements(function(name) {
        new KindSystem(name);
    });

    // --- Unique ID Generation ---

    let uniqueIdCounter = Date.now(); // Initialize with current timestamp for uniqueness.

    String.augmentStatic('generateUniqueId', function() {
        return (uniqueIdCounter++).toString(36); // Increment and convert to base 36 for a shorter, alphanumeric ID.
    });

    // --- KeyValueStore (formerly Hash) ---

    /**
     * A utility class representing a flexible key-value data store.
     * It provides methods for iterating, cleaning, and getting property counts,
     * similar to a plain JavaScript object but with added functionality.
     * @param {Object} [initialData={}] - An optional object to initialize the store's properties.
     * @constructor
     */
    const KeyValueStore = this.KeyValueStore = new KindSystem('KeyValueStore', function(initialData = {}) {
        // If initializing from another KeyValueStore, deep clone its clean properties.
        if (identifyKind(initialData) === 'keyvaluestore') {
            initialData = Object.deepClone(initialData.getCleanProperties());
        }
        // Copy initial properties to `this` instance.
        for (const prop in initialData) {
            if (objectHasOwnProperty.call(initialData, prop)) {
                this[prop] = initialData[prop];
            }
        }
    });

    KeyValueStore.implementPrototype({
        /**
         * Iterates over each own, enumerable key-value pair in the store.
         * @param {Function} callback - A function to execute for each property. It receives (value, key, store).
         * @param {*} [context] - The `this` context for the callback function.
         */
        iterate: function(callback, context) {
            Object.iterateProperties(this, callback, context);
        },

        /**
         * Returns a new plain object containing only the own, enumerable properties of this store.
         * This creates a "clean" snapshot without inherited properties or methods.
         * @returns {Object} A plain JavaScript object with the store's properties.
         */
        getCleanProperties: function() {
            const cleaned = {};
            for (const prop in this) {
                if (objectHasOwnProperty.call(this, prop)) {
                    cleaned[prop] = this[prop];
                }
            }
            return cleaned;
        },

        /**
         * Returns the number of own, enumerable properties in the store.
         * @returns {number} The count of properties.
         */
        getPropertyCount: function() {
            return Object.keys(this).length; // Efficiently gets own enumerable property keys.
        }
    });

    KeyValueStore.createAlias('each', 'iterate'); // Provide an alias for `iterate`.

    // --- Core Native Type Definition ---

    /**
     * `CoreNative` is a wrapper function for defining and configuring native-like types
     * within the `KindSystem`. It simplifies the process of registering types that
     * might have specific initialization logic.
     * @param {Object} config - Configuration object containing `name` (string) and `initialize` (function).
     * @returns {Object|null} The created `KindSystem` instance or `null` on error.
     */
    this.CoreNative = function(config) {
        if (!config || typeof config.name !== 'string' || typeof config.initialize !== 'function') {
            console.error("EnhancedKit: CoreNative requires a config object with 'name' and 'initialize' function.");
            return null;
        }
        return new KindSystem(config.name, config.initialize);
    };

    /**
     * Applies a set of prototype methods to an array of constructor functions.
     * This utility is useful for implementing common interfaces across multiple types.
     * @param {Array<Function>} constructorsArray - An array of constructor functions (e.g., [String, Array]).
     * @param {Object} methodsObject - An object where keys are method names and values are method functions.
     * @returns {Object} The `CoreNative` object itself, allowing chaining.
     */
    this.CoreNative.applyMethods = function(constructorsArray, methodsObject) {
        if (!Array.isArray(constructorsArray) || typeof methodsObject !== 'object') {
            console.error("EnhancedKit: CoreNative.applyMethods expects an array of constructors and an object of methods.");
            return this;
        }
        for (const ctor of constructorsArray) {
            // Ensure the constructor is a function and has the `implementPrototype` method.
            if (typeof ctor === 'function' && ctor.prototype && ctor.implementPrototype) {
                ctor.implementPrototype(methodsObject);
            } else {
                console.warn(`EnhancedKit: Skipping invalid constructor in array for method application: ${ctor}`);
            }
        }
        return this;
    };

    // Override the `KindSystem.isArray` checker to also use `isInstance` for more robust checks.
    const originalIsArrayChecker = KindSystem.isArray;
    KindSystem.isArray = function(item) {
        return isInstance(item, Array) || originalIsArrayChecker(item);
    };

    // --- Global Utility Aliases (Shortcuts) ---

    /**
     * Global alias: Converts an item to a shallow copy of an array.
     * @param {*} item - The item to convert.
     * @returns {Array} A shallow copy of the array representation.
     */
    this.$arrayFrom = (item) => Array.coerceToArray(item).slice();

    /**
     * Global alias: Creates a function that returns the argument at a specific index from its own arguments.
     * Useful for creating simple argument accessors.
     * @param {number} index - The zero-based index of the argument to retrieve.
     * @returns {Function} A function that, when called, returns its argument at the specified index.
     */
    this.$getArgumentAt = (index) => function() { return arguments[index]; };

    /**
     * Global alias: Checks if a value is "defined and not empty". This specifically excludes null, undefined, and empty strings.
     * @param {*} value - The value to check.
     * @returns {boolean} `true` if the value is defined and not an empty string, `false` otherwise.
     */
    this.$isDefinedAndNotEmpty = (value) => (value !== null && value !== undefined && value !== '');

    /**
     * Global alias: Clears both a `setTimeout` and `setInterval` timer, then returns `null`.
     * @param {number} timerId - The ID returned by `setTimeout` or `setInterval`.
     * @returns {null} Always returns `null`.
     */
    this.$clearAllTimers = (timerId) => { clearTimeout(timerId); clearInterval(timerId); return null; };

    /**
     * Global alias: Checks if a value is strictly neither `null` nor `undefined`.
     * @param {*} value - The value to check.
     * @returns {boolean} `true` if the value is defined (not null/undefined), `false` otherwise.
     */
    this.$isTrulyDefined = (value) => (value !== null && value !== undefined);

    /**
     * Global alias: Iterates over the elements of an iterable (array-like) or the properties of an object.
     * It intelligently dispatches to the appropriate iteration method.
     * @param {Iterable|Object} iterableItem - The item to iterate over.
     * @param {Function} callback - The function to call for each element/property.
     * @param {*} [context] - The `this` context for the callback.
     */
    this.$forEvery = (iterableItem, callback, context) => {
        const itemKind = identifyKind(iterableItem);
        if (['array', 'arguments', 'collection', 'nodelist', 'htmlcollection'].includes(itemKind)) {
            Array.prototype.iterateElements.call(iterableItem, callback, context);
        } else if (itemKind === 'object' || itemKind === 'keyvaluestore') {
            Object.iterateProperties(iterableItem, callback, context);
        } else {
            console.warn(`EnhancedKit: $forEvery cannot iterate over items of kind '${itemKind}'.`);
        }
    };

    /**
     * Global alias: An empty function that performs no operations. Useful as a placeholder or default.
     */
    this.$noop = () => {};

    /**
     * Global alias: Performs a shallow copy of properties from `extended` into `original`.
     * @param {Object} original - The object to be extended.
     * @param {Object} extended - The object providing properties to copy.
     * @returns {Object} The modified `original` object.
     */
    this.$shallowExtend = (original, extended) => Object.shallowCopy(original, extended);

    /**
     * Global alias: Creates a new `KeyValueStore` instance from a plain object.
     * @param {Object} obj - The object to convert.
     * @returns {KeyValueStore} A new `KeyValueStore` instance.
     */
    this.$createKeyValueStore = (obj) => new KeyValueStore(obj);

    /**
     * Global alias: Performs a deep merge of multiple objects into a new, empty object.
     * @param {...Object} objectsToMerge - The objects to be deeply merged.
     * @returns {Object} A new object containing all deeply merged properties.
     */
    this.$deepMergeObjects = (...objectsToMerge) => Object.deepMerge({}, ...objectsToMerge);

    // Further aliases for common functionality.
    this.$constantFunction = Function.createConstant;
    this.$deepCombine = Object.deepMerge;
    this.$randomInteger = Number.generateRandom;

}).call(this); // Execute the IIFE, binding `this` to the global object (e.g., `window` in browsers, `global` in Node.js).