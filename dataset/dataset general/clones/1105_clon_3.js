!function(factoryFunc){
    // This is a UMD (Universal Module Definition) wrapper.
    // It allows the code to be used in different JavaScript environments:
    // CommonJS (Node.js), AMD (RequireJS), or as a global browser variable.

    // CommonJS environment detection
    if("object" === typeof exports && typeof module !== 'undefined') {
        module.exports = factoryFunc();
    }
    // AMD environment detection
    else if(typeof define === "function" && define.amd) {
        define(factoryFunc);
    }
    // Browser global environment
    else {
        let globalScope;
        // Determine the global object (window, global, self)
        if(typeof window !== 'undefined') {
            globalScope = window;
        } else if(typeof global !== 'undefined') {
            globalScope = global;
        } else if(typeof self !== 'undefined') { // Web Workers or other environments
            globalScope = self;
        } else {
            globalScope = Function('return this')(); // Fallback for stricter environments
        }
        // Assign the exported module to a global variable
        globalScope.stampit = factoryFunc();
    }
}(function(){
    // These variables are declared here to shadow potential global `define`, `module`, `exports`
    // preventing conflicts within the bundled modules.
    var define, module, exports;

    // This is a custom module bundler, similar to what Browserify or Webpack might generate.
    // It loads modules, caches them, and handles their dependencies.
    return (function moduleLoader(moduleDefinitions, loadedModules, entryPointIds){

        // The internal 'require' function for resolving module dependencies.
        function resolveModule(moduleId, preventRecursion){
            // If the module is already loaded, return its exports.
            if(loadedModules[moduleId]){
                return loadedModules[moduleId].exports;
            }

            // If the module definition doesn't exist, it's an error.
            if(!moduleDefinitions[moduleId]){
                // Attempt to use a global 'require' if available (e.g., Node.js, not prevented)
                const nodeGlobalRequire = typeof require === "function" && require;
                if(!preventRecursion && nodeGlobalRequire) {
                    return nodeGlobalRequire(moduleId, true);
                }
                // Attempt to use the browser-specific 'require' if available
                if(browserRequireRef) {
                    return browserRequireRef(moduleId, true);
                }
                // If all attempts fail, throw an error.
                throw new Error("Cannot find requested module: '" + moduleId + "'");
            }

            // Initialize a new module object and cache it.
            const currentModule = loadedModules[moduleId] = { exports: {} };

            // Execute the module's definition function.
            // The callback function provided to the module acts as its local 'require'.
            moduleDefinitions[moduleId][0].call(
                currentModule.exports,
                function localModuleRequester(dependencyPath){
                    // Resolve the actual module ID from the dependency path map.
                    const mappedDependencyId = moduleDefinitions[moduleId][1][dependencyPath];
                    return resolveModule(mappedDependencyId ? mappedDependencyId : dependencyPath);
                },
                currentModule,
                currentModule.exports,
                moduleLoader,
                moduleDefinitions,
                loadedModules,
                entryPointIds
            );

            // Return the exports of the newly loaded module.
            return loadedModules[moduleId].exports;
        }

        // Reference to a global 'require' function, typically for browser environments.
        const browserRequireRef = typeof require === "function" && require;

        // Load all specified entry point modules.
        for(const entryId of entryPointIds){
            resolveModule(entryId);
        }

        // Return the main module resolver function.
        return resolveModule;
    })({
// --- Start of Bundled Modules ---
1: [function(reqFn, currentModule, currentExports){
    // This module provides a utility for iterating over object properties.
    const iterateObjectProps = reqFn('mout/object/forIn');

    /**
     * Internal helper function to copy a single property.
     * `this` context will be the target object.
     * @param {*} propValue - The value of the property.
     * @param {string} propKey - The name of the property.
     */
    function assignPropertyToTarget(propValue, propKey){
        this[propKey] = propValue;
    }

    /**
     * Merges properties from multiple source objects into a single destination object.
     * This function iterates through all arguments starting from the second one,
     * taking properties from each source and assigning them to the first argument (destination).
     *
     * @param {object} destinationObject - The object to which properties will be copied.
     * @param {...object} sourceObjects - One or more source objects to copy properties from.
     * @returns {object} The modified destination object.
     */
    currentModule.exports = function chainAssignProperties(destinationObject){
        if (!destinationObject || typeof destinationObject !== 'object') {
            // If the destination is not a valid object, return it as is or throw an error.
            // For cloning, we'll assume it's meant to be an object, so we'll return it.
            return destinationObject;
        }

        // Start from the second argument (index 1) as the first is the destination.
        const totalSources = arguments.length;
        for (let idx = 1; idx < totalSources; ++idx) {
            const currentSource = arguments[idx];
            // Only process non-null and non-undefined source objects.
            if (currentSource !== null && currentSource !== undefined) {
                iterateObjectProps(currentSource, assignPropertyToTarget, destinationObject);
            }
        }
        return destinationObject;
    };

}, {"mout/object/forIn":14}],
2: [function(reqFn, currentModule, currentExports){
    /**
     * Iterates over elements of an array, executing a callback function for each.
     * This implementation handles sparse arrays and allows breaking the loop.
     *
     * @param {Array<*>} inputArray - The array to iterate over.
     * @param {function(*, number, Array<*>): boolean|void} iterateeFunction - The function to call for each element.
     *        It receives (value, index, array). If it returns `false`, the iteration stops.
     * @param {object} [contextObject] - The `this` context for the iteratee function.
     */
    function iterateArrayElements(inputArray, iterateeFunction, contextObject) {
        // Guard clause: if the array is null or undefined, do nothing.
        if (inputArray === null || inputArray === undefined) {
            return;
        }
        // Optional: Add a check for iterateeFunction type if strict validation is desired
        if (typeof iterateeFunction !== 'function') {
            console.warn('Warning: iterateeFunction provided to iterateArrayElements is not a function.');
            return;
        }

        const arrayLength = inputArray.length;
        // Using a for loop for clarity and modern JS style.
        for (let currentIndex = 0; currentIndex < arrayLength; ++currentIndex) {
            // Note: This iterates over sparse items to maintain compatibility with older JS engines (like IE 7-8).
            // For modern JS, `Array.prototype.forEach` or `for...of` might be preferred, but this mimics original behavior.
            const shouldContinue = iterateeFunction.call(contextObject, inputArray[currentIndex], currentIndex, inputArray);
            if (shouldContinue === false) {
                break; // Stop iteration if the callback explicitly returns false.
            }
        }
    }

    currentModule.exports = iterateArrayElements;

}, {}],
3: [function(reqFn, currentModule, currentExports){
    // Import necessary utility functions.
    const arrayIterator = reqFn('./forEach'); // Renamed from forEach
    const createIteratorHandler = reqFn('../function/makeIterator_'); // Renamed from makeIterator_

    /**
     * Transforms an array by applying a callback function to each element,
     * producing a new array with the results.
     *
     * @param {Array<*>} inputCollection - The array to transform.
     * @param {function(*, number, Array<*>): *} transformerFunc - The function to call for each element.
     *        It receives (value, index, array) and should return the transformed value.
     * @param {object} [executionContext] - The `this` context for the transformer function.
     * @returns {Array<*>} A new array containing the transformed elements.
     */
    function transformArray(inputCollection, transformerFunc, executionContext) {
        // First, ensure the transformer function is properly prepared (e.g., bound context, object-to-predicate conversion).
        const preparedTransformer = createIteratorHandler(transformerFunc, executionContext);

        const outputCollection = []; // Initialize an empty array for the results.

        // Guard clause: If the input is not an array or is null/undefined, return an empty array.
        if (inputCollection === null || inputCollection === undefined || !Array.isArray(inputCollection)) {
            return outputCollection;
        }

        const collectionSize = inputCollection.length;
        // Iterate through the input collection to populate the output collection.
        for (let indexCounter = 0; indexCounter < collectionSize; ++indexCounter) {
            outputCollection[indexCounter] = preparedTransformer(inputCollection[indexCounter], indexCounter, inputCollection);
        }

        return outputCollection;
    }

    currentModule.exports = transformArray;

}, {"../function/makeIterator_":4,"./forEach":2}],
4: [function(reqFn, currentModule, currentExports){
    // Import helper functions for creating iterators.
    const getPropertyExtractor = reqFn('./prop'); // Renamed from prop
    const recursiveMatcher = reqFn('../object/deepMatches'); // Renamed from deepMatches

    /**
     * Converts a source input into a standardized iterator (predicate function).
     * This utility is used internally by many collection methods to provide
     * convenient shorthand syntax for callbacks.
     *
     * @param {*} sourceInput - The input to convert into an iterator.
     *        Can be an object (for deep matching), string/number (for property access),
     *        or a function (potentially bound to a context).
     * @param {object} [boundContext] - The `this` context to bind to a function iterator.
     * @returns {function(*, string|number, *): *} A predicate function.
     */
    function buildPredicateFunction(sourceInput, boundContext){
        // If the source input is null, it typically means no operation, so return it as is.
        if (sourceInput === null) {
            return sourceInput;
        }

        switch(typeof sourceInput) {
            case 'object':
                // If it's an object (and not null), create a deep matching predicate.
                // Otherwise, return the source itself (e.g., if it was an array or regex intended to be passed directly).
                return function(currentValue){
                    return recursiveMatcher(currentValue, sourceInput);
                };
            case 'string':
            case 'number':
                // For strings or numbers, create a function that extracts a property by that name/index.
                return getPropertyExtractor(sourceInput);
            case 'function':
                // If it's already a function, check if a context needs to be bound.
                if (typeof boundContext === 'undefined') {
                    return sourceInput; // No context to bind, return original function.
                } else {
                    // Return a new function with the context bound using `Function.prototype.call`.
                    // This creates a new closure, ensuring the context is always applied.
                    return function(itemValue, itemIndex, fullArray){
                        return sourceInput.call(boundContext, itemValue, itemIndex, fullArray);
                    };
                }
            default:
                // For any other type (boolean, symbol, undefined), return the source as is.
                return sourceInput;
        }
    }

    currentModule.exports = buildPredicateFunction;

}, {"../object/deepMatches":13,"./prop":5}],
5: [function(reqFn, currentModule, currentExports){
    /**
     * Creates a function that, when called with an object,
     * returns the value of a specified property from that object.
     *
     * @param {string|number} propertyName - The name or index of the property to retrieve.
     * @returns {function(object): *} A function that takes an object and returns its property value.
     */
    function createPropertyAccessor(propertyName){
        return function(inputObject){
            // Access the property using bracket notation, supporting both string and number keys.
            return inputObject[propertyName];
        };
    }

    currentModule.exports = createPropertyAccessor;

}, {}],
6: [function(reqFn, currentModule, currentExports){
    // Import utility functions for type checking and object manipulation.
    const getTypeIdentifier = reqFn('./kindOf'); // Renamed from kindOf
    const isSimpleObject = reqFn('./isPlainObject'); // Renamed from isPlainObject
    const assignProperties = reqFn('../object/mixIn'); // Renamed from mixIn

    /**
     * Performs a shallow copy of primitive values and common native objects.
     * For objects and arrays, it creates new instances but does not recursively
     * copy nested structures.
     *
     * @param {*} originalValue - The value to be copied.
     * @returns {*} A shallow copy of the input value.
     */
    function shallowCopyValue(originalValue){
        // Early exit for null or undefined values, or primitives which are immutable.
        if (originalValue === null || typeof originalValue !== 'object') {
            return originalValue;
        }

        switch (getTypeIdentifier(originalValue)) {
            case 'Object':
                return copyObjectShallowly(originalValue);
            case 'Array':
                return copyArrayShallowly(originalValue);
            case 'RegExp':
                return replicateRegex(originalValue);
            case 'Date':
                return duplicateDate(originalValue);
            default:
                // For other types like Function, Symbol, Map, Set, etc., return as is (shallow copy).
                // Or, if it's a custom class instance, it's generally returned as is for shallow copy.
                return originalValue;
        }
    }

    /**
     * Creates a shallow copy of a plain JavaScript object.
     * If the source is not a plain object, it's returned directly.
     * @param {object} sourceObj - The object to copy.
     * @returns {object} A new object with properties copied from sourceObj.
     */
    function copyObjectShallowly(sourceObj) {
        if (isSimpleObject(sourceObj)) {
            // Use assignProperties (which usually maps to Object.assign or similar)
            // to copy own enumerable properties to a new empty object.
            return assignProperties({}, sourceObj);
        } else {
            // If it's not a plain object (e.g., a custom class instance), return it directly.
            return sourceObj;
        }
    }

    /**
     * Creates a new RegExp object with the same pattern and flags.
     * @param {RegExp} regexPattern - The regular expression to replicate.
     * @returns {RegExp} A new RegExp instance.
     */
    function replicateRegex(regexPattern) {
        const flagCollection = [];
        // Construct the flags string based on the original regex properties.
        if (regexPattern.multiline) flagCollection.push('m');
        if (regexPattern.global) flagCollection.push('g');
        if (regexPattern.ignoreCase) flagCollection.push('i'); // Note: original used 'ignorecase'
        if (regexPattern.dotAll) flagCollection.push('s'); // Added for modern regex flags
        if (regexPattern.unicode) flagCollection.push('u');
        if (regexPattern.sticky) flagCollection.push('y');

        const combinedFlags = flagCollection.join('');
        return new RegExp(regexPattern.source, combinedFlags);
    }

    /**
     * Creates a new Date object with the same timestamp.
     * @param {Date} dateInstance - The Date object to duplicate.
     * @returns {Date} A new Date instance.
     */
    function duplicateDate(dateInstance) {
        // Using `+dateInstance` implicitly calls `valueOf()` to get the timestamp.
        return new Date(+dateInstance);
    }

    /**
     * Creates a shallow copy of an array.
     * @param {Array<*>} sourceArray - The array to copy.
     * @returns {Array<*>} A new array containing the same elements.
     */
    function copyArrayShallowly(sourceArray) {
        return sourceArray.slice(); // `slice()` creates a shallow copy.
    }

    currentModule.exports = shallowCopyValue;

}, {"../object/mixIn":18,"./isPlainObject":11,"./kindOf":12}],
7: [function(reqFn, currentModule, currentExports){
    // Import necessary utility functions.
    const simpleCopy = reqFn('./clone'); // Renamed from clone (shallow clone)
    const iterateOwnProperties = reqFn('../object/forOwn'); // Renamed from forOwn
    const getValueType = reqFn('./kindOf'); // Renamed from kindOf
    const isBasicObject = reqFn('./isPlainObject'); // Renamed from isPlainObject

    /**
     * Performs a deep recursive copy of an input item, handling nested objects and arrays.
     * Primitive values are returned directly. Native objects like RegExp and Date are shallow-cloned.
     *
     * @param {*} inputItem - The value to be deeply copied.
     * @param {function(*): *} [customCloner] - An optional function to handle custom object instances.
     *        If provided, it will be called for non-plain objects that are not arrays.
     * @returns {*} A deep copy of the input item.
     */
    function recursiveCopy(inputItem, customCloner) {
        // Handle null, undefined, and primitives directly as they are immutable.
        if (inputItem === null || typeof inputItem !== 'object') {
            return inputItem;
        }

        switch (getValueType(inputItem)) {
            case 'Object':
                return deepCopyObject(inputItem, customCloner);
            case 'Array':
                return deepCopyArray(inputItem, customCloner);
            default:
                // For other types (RegExp, Date, Function, etc.), perform a simple shallow copy.
                return simpleCopy(inputItem);
        }
    }

    /**
     * Recursively copies properties of a plain object.
     * If the source is not a plain object, it handles it via the custom cloner or returns it as is.
     * @param {object} sourceObj - The object to deep copy.
     * @param {function(*): *} customCloner - Optional function for custom instances.
     * @returns {object} A new deeply copied object.
     */
    function deepCopyObject(sourceObj, customCloner) {
        if (isBasicObject(sourceObj)) {
            const newObject = {};
            // Iterate over own properties of the source object.
            iterateOwnProperties(sourceObj, function(propertyValue, propertyName) {
                // Recursively copy each property value.
                this[propertyName] = recursiveCopy(propertyValue, customCloner);
            }, newObject); // 'this' inside the callback refers to newObject.
            return newObject;
        } else if (typeof customCloner === 'function') {
            // If it's not a plain object but a custom cloner is provided, use it.
            return customCloner(sourceObj);
        } else {
            // Otherwise, return the non-plain object reference directly.
            return sourceObj;
        }
    }

    /**
     * Recursively copies elements of an array.
     * @param {Array<*>} sourceArr - The array to deep copy.
     * @param {function(*): *} customCloner - Optional function for custom instances.
     * @returns {Array<*>} A new deeply copied array.
     */
    function deepCopyArray(sourceArr, customCloner) {
        const newArray = [];
        const arrLen = sourceArr.length;
        // Iterate through the array elements.
        for (let idx = 0; idx < arrLen; ++idx) {
            // Recursively copy each element.
            newArray[idx] = recursiveCopy(sourceArr[idx], customCloner);
        }
        return newArray;
    }

    currentModule.exports = recursiveCopy;

}, {"../object/forOwn":15,"./clone":6,"./isPlainObject":11,"./kindOf":12}],
8: [function(reqFn, currentModule, currentExports){
    // Import the generic type checking utility.
    const checkTypeCategory = reqFn('./isKind');

    /**
     * Determines if a given value is an array.
     * Uses `Array.isArray` if available (modern browsers/Node.js),
     * otherwise falls back to a type check using `isKind`.
     *
     * @param {*} testedValue - The value to check.
     * @returns {boolean} True if the value is an array, false otherwise.
     */
    const isAnArray = Array.isArray || function (testedValue) {
        return checkTypeCategory(testedValue, 'Array');
    };

    currentModule.exports = isAnArray;

}, {"./isKind":9}],
9: [function(reqFn, currentModule, currentExports){
    // Import the utility to determine the full type string of a value.
    const determineValueType = reqFn('./kindOf');

    /**
     * Checks if a value is of a specific "kind" (e.g., 'String', 'Number', 'Array', 'Object').
     * This uses `Object.prototype.toString` internally for robust type identification.
     *
     * @param {*} inputVal - The value to check.
     * @param {string} expectedType - The expected type string (e.g., 'Array', 'Date', 'RegExp').
     * @returns {boolean} True if the value's kind matches the expected type, false otherwise.
     */
    function isSpecificType(inputVal, expectedType){
        return determineValueType(inputVal) === expectedType;
    }

    currentModule.exports = isSpecificType;

}, {"./kindOf":12}],
10: [function(reqFn, currentModule, currentExports){
    // Import the type checking utility.
    const isTypeOf = reqFn('./isKind');

    /**
     * Determines if a given value is a plain JavaScript object (i.e., its kind is 'Object').
     * This excludes arrays, functions, dates, regex, etc.
     *
     * @param {*} candidateValue - The value to check.
     * @returns {boolean} True if the value is an object (kind 'Object'), false otherwise.
     */
    function isGenericObject(candidateValue) {
        return isTypeOf(candidateValue, 'Object');
    }

    currentModule.exports = isGenericObject;

}, {"./isKind":9}],
11: [function(reqFn, currentModule, currentExports){
    /**
     * Checks if a given value is a "plain" JavaScript object.
     * A plain object is typically one created by the `Object` constructor or with object literal syntax.
     * It helps differentiate from other object types like Arrays, Dates, RegExps, or custom class instances.
     *
     * @param {*} testSubject - The value to inspect.
     * @returns {boolean} True if the value is a plain object, false otherwise.
     */
    function isVanillaObject(testSubject) {
        // Explicitly handle null, which `typeof` returns 'object' for.
        if (testSubject === null) {
            return false;
        }

        // Must be an object, and its constructor must be the native `Object` constructor.
        // The `!!testSubject` ensures it's truthy (not null, undefined, 0, false, '').
        return (!!testSubject
            && typeof testSubject === 'object'
            && testSubject.constructor === Object);
    }

    currentModule.exports = isVanillaObject;

}, {}],
12: [function(reqFn, currentModule, currentExports){
    // Regular expression to extract the type name from `[object TypeName]` string.
    const typeRegex = /^\[object (.*)\]$/;
    // Cache `Object.prototype.toString` for performance and reliability.
    const objToString = Object.prototype.toString;
    // Explicitly define an undefined value for strict comparison.
    const UNDEFINED_VALUE = void 0; // Ensures it's truly undefined, even if global `undefined` is shadowed.

    /**
     * Determines the "kind" of a value, returning a string representing its type.
     * This is more robust than `typeof` for differentiating between various object types.
     * Examples: 'String', 'Number', 'Array', 'Object', 'RegExp', 'Date', 'Null', 'Undefined'.
     *
     * @param {*} inputEntity - The value to inspect.
     * @returns {string} The kind of the value.
     */
    function obtainValueKind(inputEntity) {
        if (inputEntity === null) {
            return 'Null';
        }
        if (inputEntity === UNDEFINED_VALUE) {
            return 'Undefined';
        }
        // For other types, use `Object.prototype.toString` and extract the type name.
        const typeString = objToString.call(inputEntity);
        const match = typeRegex.exec(typeString);
        // The type name is captured in the first group of the regex.
        return match ? match[1] : 'Unknown'; // Fallback for unexpected cases.
    }

    currentModule.exports = obtainValueKind;

}, {}],
13: [function(reqFn, currentModule, currentExports){
    // Import utilities for object iteration and array checking.
    const iterateObjectProperties = reqFn('./forOwn'); // Renamed from forOwn
    const checkIfArray = reqFn('../lang/isArray'); // Renamed from isArray

    /**
     * Checks if any element in `sourceArr` deeply matches `matchPattern`.
     * @param {Array<*>} sourceArr - The array to search within.
     * @param {*} matchPattern - The pattern to match against array elements.
     * @returns {boolean} True if a match is found, false otherwise.
     */
    function arrayHasMatchingElement(sourceArr, matchPattern) {
        for (let idx = 0; idx < sourceArr.length; ++idx) {
            if (recursiveComparison(sourceArr[idx], matchPattern)) {
                return true;
            }
        }
        return false;
    }

    /**
     * Compares two arrays recursively to see if `targetArray` contains all elements
     * that deeply match elements in `patternArray`. Order is not strictly enforced
     * for `targetArray` elements, but all `patternArray` elements must find a match.
     * @param {Array<*>} targetArray - The array to be checked.
     * @param {Array<*>} patternArray - The array containing patterns to match.
     * @returns {boolean} True if all patterns in `patternArray` are found in `targetArray`.
     */
    function compareArraysRecursively(targetArray, patternArray) {
        // If target or pattern array is not an array, or if lengths are vastly different,
        // we might add more specific checks here for performance or strictness.
        // For now, adhere to original logic: check if each pattern element exists in target.
        if (!checkIfArray(targetArray) || !checkIfArray(patternArray)) {
            return false; // Cannot compare if one is not an array.
        }
        if (patternArray.length === 0 && targetArray.length === 0) return true;
        if (patternArray.length > targetArray.length && patternArray.length > 0) return false; // Optimization

        for (let index = 0; index < patternArray.length; ++index) {
            // Each element of the pattern array must find a deep match in the target array.
            if (!arrayHasMatchingElement(targetArray, patternArray[index])) {
                return false;
            }
        }
        return true;
    }

    /**
     * Compares two objects recursively to see if `targetObject` contains all properties
     * that deeply match properties in `patternObject`.
     * @param {object} targetObject - The object to be checked.
     * @param {object} patternObject - The object containing patterns to match.
     * @returns {boolean} True if all properties in `patternObject` are found and deeply match in `targetObject`.
     */
    function compareObjectsRecursively(targetObject, patternObject) {
        let overallMatch = true;
        // Iterate over own properties of the pattern object.
        iterateObjectProperties(patternObject, function(patternValue, patternKey) {
            // If a property in the target object does not deeply match the pattern's property,
            // or if the target object doesn't even have this property, then it's not a match.
            if (!recursiveComparison(targetObject[patternKey], patternValue)) {
                overallMatch = false; // Set flag to false.
                return false; // Return false to break out of `iterateObjectProperties` early.
            }
        });
        return overallMatch;
    }

    /**
     * Recursively checks if two values deeply match.
     * Handles primitives, objects, and arrays.
     *
     * @param {*} mainTarget - The value to be checked against the pattern.
     * @param {*} comparisonPattern - The pattern to match against.
     * @returns {boolean} True if the target deeply matches the pattern, false otherwise.
     */
    function recursiveComparison(mainTarget, comparisonPattern){
        // If both are strictly equal, they match (includes primitives, same object reference).
        if (mainTarget === comparisonPattern) {
            return true;
        }

        // If one is null/undefined and the other is not, they don't match (already handled `===` for both null/undefined).
        if (mainTarget === null || comparisonPattern === null || typeof mainTarget !== 'object' || typeof comparisonPattern !== 'object') {
            return false;
        }

        // If both are objects, proceed with deeper comparison.
        if (checkIfArray(mainTarget) && checkIfArray(comparisonPattern)) {
            return compareArraysRecursively(mainTarget, comparisonPattern);
        } else if (typeof mainTarget === 'object' && typeof comparisonPattern === 'object') {
            // Note: This covers plain objects and other object types (Date, RegExp, etc.)
            // For Date/RegExp, the simple `===` check above would have already handled identity.
            // For structural comparison, only plain objects are compared property-by-property here.
            // If mainTarget is a Date and comparisonPattern is a Date, they would only match if they are the exact same instance.
            // For value-based comparison of such types, additional logic would be needed.
            return compareObjectsRecursively(mainTarget, comparisonPattern);
        } else {
            // If types are different or not objects, and not strictly equal, they don't match.
            return false;
        }
    }

    currentModule.exports = recursiveComparison;

}, {"../lang/isArray":8,"./forOwn":15}],
14: [function(reqFn, currentModule, currentExports){
    // Flag to indicate if the "Don't Enum" bug is present in the environment.
    let hasEnumerableBug = null;
    // List of properties that are not enumerable by default in old IE, even if shadowed.
    let unenumerableProps = [];

    /**
     * Initializes the `hasEnumerableBug` flag and `unenumerableProps` list.
     * This function is called lazily (only when `iterateAllProperties` is first invoked).
     * It detects the "Don't Enum" bug present in older IE versions (up to IE8).
     */
    function initializeEnumBugCheck(){
        unenumerableProps = [
            'toString', 'toLocaleString', 'valueOf', 'hasOwnProperty',
            'isPrototypeOf', 'propertyIsEnumerable', 'constructor'
        ];

        hasEnumerableBug = true; // Assume bug exists

        // Test for the bug: if `for...in` iterates over 'toString' on a plain object,
        // then the bug is NOT present.
        for (const key in {'toString': null}) {
            hasEnumerableBug = false; // Bug not present if 'toString' is enumerated.
            break; // No need to check further.
        }
    }

    /**
     * Executes a callback function for a given property.
     * @param {function} iteratorCallback - The function to execute.
     * @param {object} targetObject - The object being iterated.
     * @param {string} propName - The name of the current property.
     * @param {object} callbackContext - The `this` context for the callback.
     * @returns {boolean|void} The return value of the callback.
     */
    function executeCallback(iteratorCallback, targetObject, propName, callbackContext){
        return iteratorCallback.call(callbackContext, targetObject[propName], propName, targetObject);
    }

    /**
     * Iterates over all enumerable properties of an object, including those
     * from the prototype chain and handling the "Don't Enum" bug for older IE.
     * This is similar to `for...in` but with special handling for older browsers.
     *
     * @param {object} targetObject - The object whose properties are to be iterated.
     * @param {function(*, string, object): boolean|void} iteratorCallback - The function to call for each property.
     *        It receives (value, key, object). If it returns `false`, iteration stops.
     * @param {object} [callbackContext] - The `this` context for the iterator callback.
     */
    function iterateAllProperties(targetObject, iteratorCallback, callbackContext){
        // No explicit check for `targetObject` type as `for...in` works on various types.
        // It will just iterate over properties it finds.

        // Lazily initialize bug check on first use.
        if (hasEnumerableBug === null) {
            initializeEnumBugCheck();
        }

        // Iterate over standard enumerable properties (including prototype chain).
        for (const propName in targetObject) {
            if (executeCallback(iteratorCallback, targetObject, propName, callbackContext) === false) {
                return; // Stop iteration if callback returns false.
            }
        }

        // If the "Don't Enum" bug is present, manually check specific unenumerable properties.
        if (hasEnumerableBug) {
            // Iterate through the predefined list of problematic properties.
            for (let index = 0; index < unenumerableProps.length; ++index) {
                const propName = unenumerableProps[index];
                // Check if the property exists directly on the object and is not inherited from `Object.prototype`.
                // This ensures we only process shadowed properties, not standard prototype ones.
                if (Object.prototype.hasOwnProperty.call(targetObject, propName) &&
                    targetObject[propName] !== Object.prototype[propName]) {
                    if (executeCallback(iteratorCallback, targetObject, propName, callbackContext) === false) {
                        return; // Stop iteration.
                    }
                }
            }
        }
    }

    currentModule.exports = iterateAllProperties;

}, {}],
15: [function(reqFn, currentModule, currentExports){
    // Import utilities for checking own properties and iterating all properties.
    const checkOwnProperty = reqFn('./hasOwn'); // Renamed from hasOwn
    const traverseAllProps = reqFn('./forIn'); // Renamed from forIn

    /**
     * Iterates over an object's *own* enumerable properties, excluding those from the prototype chain.
     * This is similar to `Object.keys().forEach()` but handles older IE's "Don't Enum" bug via `traverseAllProps`.
     *
     * @param {object} inputObject - The object to iterate over.
     * @param {function(*, string, object): boolean|void} processFunction - The function to call for each own property.
     *        It receives (value, key, object). If it returns `false`, iteration stops.
     * @param {object} [contextForCallback] - The `this` context for the process function.
     */
    function iterateOwnProperty(inputObject, processFunction, contextForCallback){
        // Guard clause: if inputObject is null or undefined, there are no properties to iterate.
        if (inputObject === null || inputObject === undefined) {
            return;
        }

        // Use `traverseAllProps` (which handles "Don't Enum" bug) and filter for own properties.
        traverseAllProps(inputObject, function(propertyValue, propertyKey){
            // Only execute the `processFunction` if the property belongs directly to `inputObject`.
            if (checkOwnProperty(inputObject, propertyKey)) {
                // Return the result of the process function to allow breaking the iteration.
                return processFunction.call(contextForCallback, propertyValue, propertyKey, inputObject);
            }
        }, contextForCallback); // Pass context through to `traverseAllProps` for consistency.
    }

    currentModule.exports = iterateOwnProperty;

}, {"./forIn":14,"./hasOwn":16}],
16: [function(reqFn, currentModule, currentExports){
    // Cache `Object.prototype.hasOwnProperty` for performance and to avoid issues
    // if an object has a `hasOwnProperty` method that is not the native one.
    const nativeHasOwnProperty = Object.prototype.hasOwnProperty;

    /**
     * A safer way to check if an object has an *own* property (not inherited).
     * This method correctly handles cases where an object might override its own `hasOwnProperty` method.
     *
     * @param {object} targetEntity - The object to check.
     * @param {string} propName - The name of the property to look for.
     * @returns {boolean} True if the object has the specified own property, false otherwise.
     */
    function objectHasProperty(targetEntity, propName){
        // Guard against null/undefined or non-object targets.
        // `hasOwnProperty` expects an object.
        if (targetEntity === null || typeof targetEntity !== 'object') {
            return false;
        }
        return nativeHasOwnProperty.call(targetEntity, propName);
    }

    currentModule.exports = objectHasProperty;

}, {}],
17: [function(reqFn, currentModule, currentExports){
    // Import necessary helper functions.
    const hasSpecificProperty = reqFn('./hasOwn'); // Renamed from hasOwn
    const recursiveDuplication = reqFn('../lang/deepClone'); // Renamed from deepClone
    const isAnObject = reqFn('../lang/isObject'); // Renamed from isObject

    /**
     * Recursively merges properties from multiple source objects into a new target object.
     * This function performs a deep merge, meaning nested objects and arrays are also merged/cloned.
     *
     * @param {...object} sourceObjects - One or more objects to merge. The first object
     *        serves as the initial target, and subsequent objects' properties are merged into it.
     * @returns {object} A new object containing the deeply merged properties.
     */
    function deepMergeObjects() {
        const numArgs = arguments.length;
        if (numArgs === 0) {
            return {}; // If no arguments, return an empty object.
        }

        // The first argument is the base object. Create a deep clone to ensure
        // the original first argument is not modified.
        const initialTarget = arguments[0];
        let finalResult = recursiveDuplication(initialTarget);

        // Iterate through the rest of the arguments (source objects).
        for (let sourceIndex = 1; sourceIndex < numArgs; sourceIndex++) {
            const sourceObject = arguments[sourceIndex];

            // Skip null or undefined source objects.
            if (sourceObject === null || sourceObject === undefined) {
                continue;
            }

            // Iterate over own enumerable properties of the current source object.
            for (const currentKey in sourceObject) {
                if (!hasSpecificProperty(sourceObject, currentKey)) {
                    continue; // Skip inherited properties.
                }

                const currentValue = sourceObject[currentKey];

                // If both the current value and the target's corresponding value are objects,
                // perform a recursive deep merge.
                if (isAnObject(currentValue) && isAnObject(finalResult[currentKey])) {
                    // Recursive call for deep merging nested objects.
                    finalResult[currentKey] = deepMergeObjects(finalResult[currentKey], currentValue);
                } else {
                    // For other types (primitives, arrays, dates, regex, functions),
                    // perform a deep clone to ensure they are copied by value, not reference.
                    finalResult[currentKey] = recursiveDuplication(currentValue);
                }
            }
        }

        return finalResult;
    }

    currentModule.exports = deepMergeObjects;

}, {"../lang/deepClone":7,"../lang/isObject":10,"./hasOwn":16}],
18: [function(reqFn, currentModule, currentExports){
    // Import utility for iterating over an object's own properties.
    const iterateOwnPropsOnly = reqFn('./forOwn'); // Renamed from forOwn

    /**
     * Combines properties from one or more source objects into a target object.
     * This method modifies the `destinationObject` in place.
     * It only copies own enumerable properties from sources to the destination.
     * For a new object, pass an empty object literal `{}` as the first argument.
     *
     * @param {object} destinationObject - The object to which properties will be added or overwritten.
     * @param {...object} sourceObjects - One or more objects whose properties will be copied.
     * @returns {object} The modified destination object.
     */
    currentModule.exports = function assignAllProperties(destinationObject){
        // If the destination is not a valid object, return it as is.
        // Or, we could throw an error for invalid input.
        if (destinationObject === null || typeof destinationObject !== 'object') {
            return destinationObject;
        }

        // Iterate through all arguments starting from the second one, which are source objects.
        for (let i = 1; i < arguments.length; i++) {
            const currentSource = arguments[i];

            // Only process valid source objects (not null or undefined).
            if (currentSource !== null && typeof currentSource === 'object') {
                // Use iterateOwnPropsOnly to copy only enumerable own properties.
                iterateOwnPropsOnly(currentSource, function(propValue, propKey){
                    // Assign the property directly to the destination object.
                    // This overwrites existing properties if they have the same key.
                    destinationObject[propKey] = propValue;
                });
            }
        }

        return destinationObject;
    };

}, {"./forOwn":15}]
// --- End of Bundled Modules ---
    }, {}, [1]) // The last array `[1]` specifies the entry point module ID.
});