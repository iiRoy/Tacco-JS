/*
 * This file defines a robust data classification and conversion system.
 * It detects and transforms values into various predefined categories.
 *
 * This module can be consumed in multiple environments:
 * - CommonJS (Node.js) via `module.exports`
 * - AMD (RequireJS) via `define`
 * - Browser global scope via attaching to `window` or `this`
 */
((globalScope, requiredModules, initializerFunction) => {
    // Check for CommonJS environment (Node.js)
    if (typeof exports === 'object' && typeof module !== 'undefined') {
        const underscoreLib = require(requiredModules[0]); // Dynamically load underscore
        // Assign the factory's output directly to module.exports
        Object.defineProperty(exports, '__esModule', { value: true }); // Indicate ES module compatibility
        exports.default = initializerFunction(underscoreLib, globalScope);
    }
    // Check for AMD environment (RequireJS)
    else if (typeof define === 'function' && define.amd) {
        // Define the module with its dependencies
        define(requiredModules, (underscoreLib) => initializerFunction(underscoreLib, globalScope));
    }
    // Browser global scope fallback
    else {
        // Ensure underscore is available in the global scope
        const underscoreLib = globalScope[requiredModules[0].replace(/[^a-zA-Z0-9]/g, '')]; // Simple name cleanup for global access
        if (!underscoreLib) {
            console.error(`Dependency '${requiredModules[0]}' not found in global scope.`);
            return; // Exit if critical dependency is missing
        }
        // Attach the module's output to the global scope under a new name
        globalScope.dataKindIdentifier = initializerFunction(underscoreLib, globalScope);
    }
})(typeof window !== 'undefined' ? window : globalThis, ['underscore'], (utilKit, currentContext) => {

    const SYSTEM_RELEASE_TAG = '1.0.0-alpha'; // Updated version string
    
    // Internal helper functions and constants
    const EMPTY_FUNCTION = () => {}; // Replaced noop with a const arrow function
    const consoleLogger = (currentContext && currentContext.console && currentContext.console.warn) ? currentContext.console.warn : EMPTY_FUNCTION;
    
    // Provides a function that always returns the same value
    const createConstantFn = (valueToReturn) => () => valueToReturn; 

    // Creates a function to check for strict equality
    const createEqualityChecker = (firstValue) => (secondValue) => firstValue === secondValue;

    // Checks if a value can be converted to a specific type
    const verifyConversionCapability = (targetTypeName) => (subjectData) => { 
        const targetCategory = dataKindIdentifier[targetTypeName];
        if (!targetCategory) {
            consoleLogger(`Warning: Target category "${targetTypeName}" not found for conversion check.`);
            return false;
        }
        // If the subjectData is already of the target type's default value, or
        // if converting it results in the target type's default value.
        // Added a null check for subjectData to avoid errors with .to()
        return subjectData === targetCategory.getAnchor() || 
               (subjectData !== targetCategory.getAnchor() && targetCategory.conversionHandler(subjectData) === targetCategory.getAnchor()); 
    };

    // Essential library requirements
    if (!utilKit) { 
        consoleLogger("dataKindIdentifier requires underscore.js (or lodash). Please ensure it's loaded."); 
        throw new Error("Missing critical dependency: underscore.js"); // Throw error instead of returning false
    }
    if (typeof Math === 'undefined') { 
        consoleLogger("dataKindIdentifier requires the global Math object."); 
        throw new Error("Missing critical dependency: Math object");
    }
    if (typeof JSON === 'undefined' || typeof JSON.parse !== 'function') { // More robust JSON check
        consoleLogger("dataKindIdentifier requires the global JSON object with parse/stringify methods."); 
        throw new Error("Missing critical dependency: JSON object");
    }

    // Main data classification function
    let dataKindIdentifier = (subjectData) => {
        // Prioritize specific, often problematic types
        if (dataKindIdentifier.isArguments(subjectData)) return 'arguments';
        if (dataKindIdentifier.isArray(subjectData)) return 'array';
        if (dataKindIdentifier.isNan(subjectData)) return 'nan';
        if (dataKindIdentifier.isNull(subjectData)) return 'null';
        if (dataKindIdentifier.isUndefined(subjectData)) return 'undefined'; // Added explicit undefined check
        
        // Fallback to standard typeof operator
        return typeof subjectData;
    };

    // Attach the version string
    dataKindIdentifier.RELEASE_VERSION = SYSTEM_RELEASE_TAG;

    // Core mechanism for extending the classification system
    dataKindIdentifier.registerType = (typeConfig) => {
        if (!typeConfig || typeof typeConfig.identifier !== 'string') {
            consoleLogger("Invalid type configuration provided. 'identifier' is required.");
            return; // Guard clause
        }

        const typeName = typeConfig.identifier;
        let isNewDefinition = false;

        // Initialize the type if it doesn't exist
        if (!dataKindIdentifier[typeName]) {
            isNewDefinition = true;
            dataKindIdentifier[typeName] = {};
        }

        // Apply inheritance first
        if (typeConfig.inheritsFrom) {
            // Ensure inheritsFrom is an array for consistent processing
            const parentTypes = Array.isArray(typeConfig.inheritsFrom) ? typeConfig.inheritsFrom : [typeConfig.inheritsFrom];
            
            parentTypes.forEach(parentTypeName => {
                const parentType = dataKindIdentifier[parentTypeName];
                if (parentType) {
                    // Use Object.assign for shallow merging of inherited properties
                    Object.assign(dataKindIdentifier[typeName], parentType);
                } else {
                    consoleLogger(`Warning: Parent type "${parentTypeName}" not found for "${typeName}".`);
                }
            });
        }
        
        // Clobber with new type methods if provided
        if (typeConfig.utilityMethods) {
            Object.assign(dataKindIdentifier[typeName], typeConfig.utilityMethods);
        }

        // Always set/clobber the base functions for the current type
        // These are the fundamental properties for `is`, `to`, `can`, and `a` (default/anchor value)
        dataKindIdentifier[typeName].getAnchor = createConstantFn(typeConfig.defaultVal); // Renamed 'a' to 'getAnchor'
        dataKindIdentifier[typeName].isInstance = typeConfig.isInstance; // Renamed 'is' to 'isInstance'
        dataKindIdentifier[typeName].conversionHandler = typeConfig.conversionHandler; // Renamed 'to' to 'conversionHandler'
        dataKindIdentifier[typeName].canConvert = typeConfig.canConvert; // Renamed 'can' to 'canConvert'

        // Optional: Add a meta-property for new definitions
        if (isNewDefinition) {
            dataKindIdentifier[typeName]._isNew = true;
        }
    };

    // #### Fundamental Categories ####

    dataKindIdentifier.registerType({
        identifier: "isNull",
        defaultVal: null,
        isInstance: utilKit.isNull,
        conversionHandler: createConstantFn(null),
        canConvert: createConstantFn(true)
    });

    dataKindIdentifier.registerType({
        identifier: "isUndefined",
        defaultVal: undefined,
        isInstance: utilKit.isUndefined,
        conversionHandler: createConstantFn(undefined),
        canConvert: createConstantFn(true)
    });

    dataKindIdentifier.registerType({
        identifier: "isNan", // Renamed from "nan"
        defaultVal: NaN,
        isInstance: utilKit.isNaN,
        conversionHandler: createConstantFn(NaN),
        canConvert: createConstantFn(true)
    });

    dataKindIdentifier.registerType({
        identifier: 'isDefined', // Renamed from "def"
        defaultVal: true,
        isInstance: (subjectData) => { 
            // A value is defined if it's not NaN, undefined, or null
            return !(dataKindIdentifier.isNan(subjectData) || dataKindIdentifier.isUndefined(subjectData) || dataKindIdentifier.isNull(subjectData)); 
        }, 
        conversionHandler: (subjectData) => { 
            // Returns the value itself if defined, otherwise the default defined value (true)
            return dataKindIdentifier.isDefined.isInstance(subjectData) ? subjectData : dataKindIdentifier.isDefined.getAnchor();
        },
        canConvert: (subjectData) => {
            return dataKindIdentifier.isDefined.isInstance(subjectData); // Direct check
        }
    }); 

    // #### Boolean Categories ####

    dataKindIdentifier.registerType({
        identifier:'isBoolean', // Renamed from 'bool'
        defaultVal: false, // Changed default from true to false for a more common default
        isInstance: utilKit.isBoolean,
        conversionHandler: (subjectData) => { 
            // More explicit conversion: handles strings, numbers, and general truthiness
            if (typeof subjectData === 'string') {
                const lowerStr = subjectData.toLowerCase().trim();
                if (lowerStr === 'true' || lowerStr === '1') return true;
                if (lowerStr === 'false' || lowerStr === '0') return false;
            }
            if (typeof subjectData === 'number') {
                return subjectData !== 0 && !isNaN(subjectData);
            }
            return Boolean(subjectData); // General truthiness conversion
        },
        canConvert: verifyConversionCapability('isBoolean'),
        utilityMethods: { // Renamed 'methods' to 'utilityMethods'
            negate : (valueToNegate) => !valueToNegate // Renamed 'not' to 'negate'
        }
    });

    dataKindIdentifier.registerType({
        identifier: 'isTrue', // Renamed from 'tru'
        inheritsFrom: 'isBoolean',
        defaultVal: true, 
        isInstance: createEqualityChecker(true), 
        conversionHandler: createConstantFn(true), // Always converts to true
        canConvert: createConstantFn(true)
    });

    dataKindIdentifier.registerType({
        identifier: 'isFalse', // Renamed from 'fal'
        inheritsFrom: 'isBoolean',
        defaultVal: false, 
        isInstance: createEqualityChecker(false), 
        conversionHandler: createConstantFn(false), // Always converts to false
        canConvert: createConstantFn(true) // Can always be converted to false
    });

    dataKindIdentifier.registerType({
        identifier: 'isTruthy', // Renamed from 'truy'
        inheritsFrom: 'isBoolean',
        defaultVal: true, 
        isInstance: (subjectData) => !!subjectData, // Explicit truthiness check
        conversionHandler: (subjectData) => subjectData ? subjectData : true, // Returns value if truthy, else default true
        canConvert: createConstantFn(true)
    });

    dataKindIdentifier.registerType({
        identifier: 'isFalsy', // Renamed from 'faly'
        inheritsFrom: 'isBoolean',
        defaultVal: false, 
        isInstance: (subjectData) => !subjectData, // Explicit falsiness check
        conversionHandler: (subjectData) => subjectData ? false : subjectData, // Returns false if truthy, else original falsy value
        canConvert: createConstantFn(true)
    });
    
    // #### Numeric Categories ####

    dataKindIdentifier.registerType({
        identifier:'isNumber', // Renamed from 'num'
        defaultVal: 0,
        isInstance: (subjectData) => utilKit.isNumber(subjectData) && Number.isFinite(subjectData), // Added Number.isFinite
        conversionHandler: (subjectData) => {
            if (dataKindIdentifier.isNumber.isInstance(subjectData)) return subjectData;
            if (dataKindIdentifier.isBoolean.isInstance(subjectData)) return subjectData ? 1 : 0;
            if (dataKindIdentifier.isFunction(subjectData)) { 
                const fnResult = subjectData();
                if (dataKindIdentifier.isNumber.isInstance(fnResult)) return fnResult; 
            } 
            // If it's an object with a 'getAnchor' method that returns a number
            if (utilKit.isObject(subjectData) && typeof subjectData.getAnchor === 'function' && dataKindIdentifier.isNumber.isInstance(subjectData.getAnchor())) {
                return subjectData.getAnchor();
            }
            if (dataKindIdentifier.isArray(subjectData)) return subjectData.length;
            if (dataKindIdentifier.isString(subjectData)) {
                const numericConversion = Number(subjectData); // Use Number() for broader conversion
                return isNaN(numericConversion) ? dataKindIdentifier.isNumber.getAnchor() : numericConversion;
            }
            return dataKindIdentifier.isNumber.getAnchor(); // Return default if no conversion possible
        },
        canConvert: verifyConversionCapability("isNumber"),
        
        utilityMethods : {
            generateRandom : utilKit.random, // Renamed 'random' to 'generateRandom'
            createRange : utilKit.range, // Renamed 'range' to 'createRange'
            
            absolute : Math.abs,
            arcCosine : Math.acos, // Renamed 'acos'
            arcSine : Math.asin,
            arcTangent : Math.atan,
            ceilValue : Math.ceil, // Renamed 'ceil'
            cosine : Math.cos,
            exponential : Math.exp,
            floorValue : Math.floor, // Renamed 'floor'
            naturalLog : Math.log, // Renamed 'log'
            maxValue : Math.max, // Renamed 'max'
            minValue : Math.min, // Renamed 'min'
            powerOf : Math.pow, // Renamed 'pow'
            roundValue : Math.round, // Renamed 'round'
            sine : Math.sin,
            squareRoot : Math.sqrt,
            tangent : Math.tan,
            truncate : Math.trunc, // Added new method
            cubeRoot : Math.cbrt, // Added new method
            
            add : (op1, op2) => op1 + op2, // Renamed 'plus'
            subtract : (op1, op2) => op1 - op2, // Renamed 'minus'
            modulo : (op1, op2) => op1 % op2, // Renamed 'mod'
            multiply : (op1, op2) => op1 * op2, // Renamed 'times'
            divide : (op1, op2) => op1 / op2, // Renamed 'div'
    
            getSign : (num) => num === 0 ? 0 : num / Math.abs(num), // Renamed 'sign'
            isBetween : (val, lowerBound, upperBound) => (val >= lowerBound && val <= upperBound), // Renamed 'between'
            isEqual : (valA, valB) => valA === valB, // Renamed 'eq'
            isNotEqual : (valA, valB) => valA !== valB, // Renamed 'neq'
            isLessThan : (valA, valB) => valA < valB, // Renamed 'lt'
            isLessThanOrEqual : (valA, valB) => valA <= valB, // Renamed 'lte'
            isGreaterThan : (valA, valB) => valA > valB, // Renamed 'gt'
            isGreaterThanOrEqual : (valA, valB) => valA >= valB, // Renamed 'gte'

            toFixedPrecision: (val, precision) => parseFloat(val.toFixed(dataKindIdentifier.isInteger.isInstance(precision) ? precision : 2)), // Renamed 'fixed', used Number.parseFloat
            toHexadecimal : (val) => `0x${val.toString(16)}`, // Renamed 'hex', added template literal
            toBinary : (val) => `0b${val.toString(2)}` // Renamed 'binary', added template literal
        }
    });

    dataKindIdentifier.registerType({
        identifier:'isInteger', // Renamed from 'int'
        defaultVal: 1,  
        inheritsFrom: "isNumber",
        isInstance: Number.isInteger, // Using native Number.isInteger
        conversionHandler: (subjectData) => { 
            const parsedValue = Number.parseInt(subjectData, 10); // Use Number.parseInt with radix
            if (!isNaN(parsedValue)) return parsedValue; 
            return dataKindIdentifier.isInteger.getAnchor();
        },
        canConvert: verifyConversionCapability("isInteger"),
        utilityMethods : {
            decrement: (val) => --val, // Renamed 'dec'
            increment: (val) => ++val // Renamed 'inc'
        }
    });

    dataKindIdentifier.registerType({
        identifier:'isFloat', // Renamed from 'flt'
        defaultVal: 0.1,  
        inheritsFrom: "isNumber",
        isInstance: (subjectData, precision) => {
            if (!dataKindIdentifier.isNumber.isInstance(subjectData)) return false;
            // Check if it's a float by comparing to its fixed-point representation
            return subjectData === dataKindIdentifier.isNumber.toFixedPrecision(subjectData, precision); 
        }, 
        conversionHandler: (subjectData, precision) => { 
            const num = dataKindIdentifier.isNumber.conversionHandler(subjectData);
            return dataKindIdentifier.isNumber.toFixedPrecision(num, precision);
        },
        canConvert: verifyConversionCapability("isFloat"),
        utilityMethods: {
            equalsWithPrecision : (valA, valB, precision) => { // Renamed 'eq'
                return dataKindIdentifier.isNumber.toFixedPrecision(valA, precision) === dataKindIdentifier.isNumber.toFixedPrecision(valB, precision);
            },
            getDecimalPart : (val) => val % 1 // Renamed 'decimal'
        }
    });

    /// #### String Categories ####

    dataKindIdentifier.registerType({
        identifier:'isString', // Renamed from 'str'
        defaultVal: '', 
        isInstance: utilKit.isString,  
        conversionHandler: (subjectData) => { 
            if (dataKindIdentifier.isDefined.isInstance(subjectData)) {
                // Handle Symbol and other non-string types gracefully
                if (typeof subjectData === 'symbol') return subjectData.toString();
                if (utilKit.isObject(subjectData) && typeof subjectData.toString === 'function' && subjectData.toString !== Object.prototype.toString) {
                    return subjectData.toString();
                }
                return String(subjectData); 
            }
            return dataKindIdentifier.isString.getAnchor(); 
        },
        canConvert: verifyConversionCapability("isString"),
        utilityMethods: {
            fromCharCodes: String.fromCharCode, // Renamed 'fromCharCode'
            getCharAtIndex: (targetString, index) => targetString.charAt(index), // Renamed 'charAt'
            getCharCodeAtIndex: (targetString, index) => targetString.charCodeAt(index), // Renamed 'charCodeAt'
            toLower: (targetString) => targetString.toLowerCase(), // Renamed 'lower'
            toUpper: (targetString) => targetString.toUpperCase(), // Renamed 'upper'
            
            escapeHTML: utilKit.escape, // Renamed 'escape'
            unescapeHTML: utilKit.unescape, // Renamed 'unescape'
            renderTemplate: utilKit.template, // Renamed 'template'
            includesSubstring: utilKit.contains, // Renamed 'contains'
            toArray: utilKit.toArray, // Renamed 'array'
            getLength: utilKit.size, // Renamed 'length'
            
            trimWhitespace: (targetString) => targetString.trim(), // Using native String.prototype.trim
            trimLeft: (targetString) => targetString.replace(/^\s+/,''), // Renamed 'ltrim'
            trimRight: (targetString) => targetString.replace(/\s+$/,''), // Renamed 'rtrim'
            
            truncateString : (text, maxLength, omitEllipsis = false) => { // Renamed 'truncate', added default for omitEllipsis
                if (!dataKindIdentifier.isString.isInstance(text) || !dataKindIdentifier.isInteger.isInstance(maxLength) || maxLength <= 0) {
                    return text; // Return original if inputs are invalid
                }
                if (text.length > maxLength) {
                    return text.substring(0, maxLength) + (omitEllipsis ? '' : '…'); // Using substring and ellipsis
                } 
                return text;
            },
            startsWith: (targetString, searchString, position = 0) => targetString.startsWith(searchString, position), // Added new method
            endsWith: (targetString, searchString, length) => targetString.endsWith(searchString, length), // Added new method
            padLeft: (targetString, targetLength, padChar = ' ') => targetString.padStart(targetLength, padChar), // Added new method
            padRight: (targetString, targetLength, padChar = ' ') => targetString.padEnd(targetLength, padChar) // Added new method
        }
    });

    dataKindIdentifier.registerType({
        identifier:'isPlainString', // Renamed from 'plain'
        defaultVal: "", 
        inheritsFrom: "isString",
        isInstance: (subjectData) => { 
            // Checks if the string contains only common characters (alphanumeric, some symbols, spaces)
            const cleaned = dataKindIdentifier.isPlainString.conversionHandler(subjectData);
            return cleaned.length === dataKindIdentifier.isString.conversionHandler(subjectData).length; 
        },
        conversionHandler: (subjectData) => { 
            if(dataKindIdentifier.isString.isInstance(subjectData)) {
                // Removes characters that are not alphanumeric, common symbols, or whitespace
                return subjectData.replace(/[^a-zA-Z0-9@!#$%^&*()+=-\[\]\\;',./{}|":<>? ]/g, '' ); 
            }
            return dataKindIdentifier.isPlainString.getAnchor(); 
        },
        canConvert: verifyConversionCapability("isString") // Retain original can logic
    });

    dataKindIdentifier.registerType({
        identifier:'isEmail', // Renamed from 'email'
        defaultVal: 'default@example.com', // Changed default value
        inheritsFrom: "isString",
        isInstance: (subjectData) => { 
            const emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            return emailRegex.test(subjectData); 
        },
        conversionHandler: (userPart, domainPart, tldPart) => { 
            if (dataKindIdentifier.isEmail.isInstance(userPart)) return userPart; // If first argument is already an email
            if (dataKindIdentifier.isDefined.isInstance(userPart) && dataKindIdentifier.isDefined.isInstance(domainPart) && dataKindIdentifier.isDefined.isInstance(tldPart)) {
                return `${userPart}@${domainPart}.${tldPart}`; 
            }
            if (dataKindIdentifier.isDefined.isInstance(userPart) && dataKindIdentifier.isDefined.isInstance(domainPart)) {
                return `${userPart}@${domainPart}`;
            }
            return dataKindIdentifier.isEmail.getAnchor();
        },
        canConvert: verifyConversionCapability("isEmail")
    });

    dataKindIdentifier.registerType({
        identifier:'isUniqueId', // Renamed from 'unique'
        defaultVal: "0",
        // Using a Set for efficient ID storage and lookup
        utilityMethods: { registeredIdentifiers: new Set(["0"]) }, // Renamed 'ids', changed to Set
        isInstance: (subjectData) => { 
            const stringifiedId = dataKindIdentifier.isString.conversionHandler(subjectData);
            if (stringifiedId) {
                return dataKindIdentifier.isUniqueId.registeredIdentifiers.has(stringifiedId); // Use Set.has
            } 
            return false;
        }, 
        canConvert: (subjectData) => { 
            const stringifiedId = dataKindIdentifier.isString.conversionHandler(subjectData);
            if (stringifiedId) {
                return !dataKindIdentifier.isUniqueId.registeredIdentifiers.has(stringifiedId); // Check if NOT already registered
            } 
            return false;
        }, 
        conversionHandler: (subjectData) => { 
            let proposedId = dataKindIdentifier.isString.conversionHandler(subjectData);
            // Ensure the ID is unique; if not, generate a new one
            while(dataKindIdentifier.isUniqueId.registeredIdentifiers.has(proposedId)) {
                proposedId = utilKit.uniqueId('gen_'); // Use utilKit.uniqueId with a prefix
            } 
            dataKindIdentifier.isUniqueId.registeredIdentifiers.add(proposedId); // Add to Set
            return proposedId;
        }
    });

    /** #### COLLECTION CATEGORIES #### **/

    dataKindIdentifier.registerType({
        identifier:'isCollection', // Renamed from 'col'
        defaultVal: [], // Changed default to empty array
        isInstance: (subjectData) => utilKit.isObject(subjectData) || utilKit.isArray(subjectData), 
        canConvert: (subjectData) => dataKindIdentifier.isCollection.isInstance(subjectData), 
        conversionHandler: (subjectData) => { 
            if (dataKindIdentifier.isCollection.isInstance(subjectData)) { return subjectData; }
            // Attempt to convert to array first, then handle as a generic collection
            return dataKindIdentifier.isArray.conversionHandler(subjectData); 
        },
        utilityMethods : {
            forEachElement: utilKit.each, // Renamed 'each'
            mapElements: utilKit.map, // Renamed 'map'
            reduceElements: utilKit.reduce, // Renamed 'reduce'
            reduceElementsRight: utilKit.reduceRight, // Renamed 'reduceRight'
            findFirst: utilKit.find, // Renamed 'find'
            filterElements: utilKit.filter, // Renamed 'filter'
            filterByProps: utilKit.where, // Renamed 'where'
            rejectElements: utilKit.reject, // Renamed 'reject'
            containsElement: utilKit.contains, // Renamed 'contains'
            invokeMethodOnEach: utilKit.invoke, // Renamed 'invoke'
            extractProperty: utilKit.pluck, // Renamed 'pluck'
            sortCollection: utilKit.sortBy, // Renamed 'sortBy'
            groupByProperty: utilKit.groupBy, // Renamed 'groupBy'
            countByProperty: utilKit.countBy, // Renamed 'countBy'
            shuffleOrder: utilKit.shuffle, // Renamed 'shuffle'
            convertToArray: utilKit.toArray, // Renamed 'toArray'
            getSize: utilKit.size, // Renamed 'length'
            
            allMatch: utilKit.all, // Renamed 'all'
            anyMatch: utilKit.any, // Renamed 'any'
            findMax: utilKit.max, // Renamed 'max'
            findMin: utilKit.min, // Renamed 'min'

            transformValues: (collection, valueTransformFn) => { // Renamed 'mapValues'
                return utilKit.reduce(collection, (accumulator, value, key) => {
                    accumulator[key] = valueTransformFn(value, key, collection); 
                    return accumulator;
                }, {});
            },
            isEmpty: (collection) => utilKit.isEmpty(collection) // Added new method
        }
    });

    dataKindIdentifier.registerType({
        identifier:'isArray', // Renamed from 'arr'
        defaultVal: [], 
        inheritsFrom: "isCollection",
        isInstance: utilKit.isArray, 
        conversionHandler: (subjectData) => { 
            if (dataKindIdentifier.isArguments(subjectData)) return Array.from(subjectData); // Use Array.from
            if (dataKindIdentifier.isArray.isInstance(subjectData)) return [...subjectData]; // Return a shallow copy
            if (dataKindIdentifier.isObject(subjectData)) {
                // Convert object values into an array
                return Object.values(subjectData); 
            }
            if (dataKindIdentifier.isFunction(subjectData)){ 
                const fnResult = subjectData();
                if (dataKindIdentifier.isArray.isInstance(fnResult)) return fnResult; 
            }
            // If it's a defined value, wrap it in an array
            if (dataKindIdentifier.isDefined.isInstance(subjectData)) return [subjectData]; 
            return []; // Return empty array as fallback
        },
        canConvert: verifyConversionCapability("isArray"),
        utilityMethods : {
            appendItem: (targetArray, item) => { const newArr = [...targetArray]; newArr.push(item); return newArr; }, // Functional push
            removeItemLast: (targetArray) => { const newArr = [...targetArray]; newArr.pop(); return newArr; }, // Functional pop
            prependItem: (targetArray, item) => { const newArr = [...targetArray]; newArr.unshift(item); return newArr; }, // Functional unshift
            removeItemFirst: (targetArray) => { const newArr = [...targetArray]; newArr.shift(); return newArr; }, // Functional shift
            extractSlice: (targetArray, begin, end) => targetArray.slice(begin, end), // Renamed 'slice'
            mutateSplice: (targetArray, ...spliceArgs) => { const newArr = [...targetArray]; newArr.splice(...spliceArgs); return newArr; }, // Renamed 'splice', returns new array
            sortArray: (targetArray, compareFn) => [...targetArray].sort(compareFn), // Functional sort
        
            createNumberRange: utilKit.range, // Renamed 'range'
            createObjectFromPairs: utilKit.object, // Renamed 'toObject'
            interleaveArrays: utilKit.zip, // Renamed 'zip'
            findIndexOf: utilKit.indexOf, // Renamed 'indexOf'
            findLastIndexOf: utilKit.lastIndexOf, // Renamed 'lastIndexOf'
            
            getFirst: utilKit.first, // Renamed 'first'
            getLast: utilKit.last, // Renamed 'last'
            getAllButLast: utilKit.initial, // Renamed 'initial'
            getAllButFirst: utilKit.rest, // Renamed 'rest'
            removeFalsyItems: utilKit.compact, // Renamed 'compact'
            flattenNested: utilKit.flatten, // Renamed 'flatten'
            filterOutSpecific: utilKit.without, // Renamed 'without'
            getUnion: utilKit.union, // Renamed 'union'
            getIntersection: utilKit.intersection, // Renamed 'intersection'
            getDifference: utilKit.difference, // Renamed 'difference'
            getUniqueItems: utilKit.unique, // Renamed 'unique'
            getSortedIndex: utilKit.sortedIndex, // Renamed 'sortedIndex'
            
            calculateAverage: (numericArray) => { // Renamed 'average'
                if (!Array.isArray(numericArray) || numericArray.length === 0) {
                    return 0; // Guard for empty or invalid array
                }
                const sum = utilKit.reduce(numericArray, (memo, num) => memo + num, 0);
                return sum / numericArray.length;
            }
        }
    });

    dataKindIdentifier.registerType({
        identifier:'isArguments', // Renamed from 'args'
        defaultVal: (() => arguments)(), // Standard way to get arguments object
        inheritsFrom: 'isArray',
        isInstance: (subjectData) => {
            // Robust check for arguments object across environments
            return Object.prototype.toString.call(subjectData) === '[object Arguments]';
        },
        canConvert: (subjectData) => dataKindIdentifier.isArguments.isInstance(subjectData) || dataKindIdentifier.isArray.isInstance(subjectData),
        conversionHandler: (...inputArgs) => inputArgs, // Converts any input to an arguments-like array
        utilityMethods: {
            convertArgumentsToArray: (argsObject) => Array.prototype.slice.call(argsObject), // Renamed 'toArray'
            getSubArguments: (argsObject, startIndex = 1) => dataKindIdentifier.isArray.extractSlice(Array.from(argsObject), startIndex), // Renamed 'sub', uses Array.from
            prependToArguments: (argsObject, itemToPrepend) => [itemToPrepend, ...Array.from(argsObject)] // Renamed 'pre', uses spread syntax
        }
    });

    dataKindIdentifier.registerType({
        identifier:'isObject', // Renamed from 'obj'
        defaultVal: {}, 
        inheritsFrom: "isCollection",
        isInstance: (subjectData) => utilKit.isObject(subjectData) && !utilKit.isArray(subjectData) && !dataKindIdentifier.isFunction(subjectData), // Exclude functions
        conversionHandler: (subjectData, valueArray) => { 
            if (dataKindIdentifier.isObject.isInstance(subjectData)) return { ...subjectData }; // Return shallow copy
            if (dataKindIdentifier.isArray.isInstance(subjectData)){ 
                if (dataKindIdentifier.isArray.isInstance(valueArray)) {
                    // Create object from key-value pairs
                    return utilKit.object(subjectData, valueArray); 
                } else {
                    // Convert array of objects to a single object (e.g., merging properties)
                    return subjectData.reduce((acc, item) => ({ ...acc, ...item }), {});
                }
            }
            if (dataKindIdentifier.isFunction(subjectData)){ 
                const fnResult = subjectData();
                if (dataKindIdentifier.isObject.isInstance(fnResult)) return fnResult; 
            }
            // If a defined value, create a simple object with it
            if (dataKindIdentifier.isDefined.isInstance(subjectData)){ return { value: subjectData }; }
            return {}; // Return empty object as fallback
        },
        canConvert: verifyConversionCapability("isObject"),

        utilityMethods: {
            mergeProperties: utilKit.extend, // Renamed 'extend'
            cloneObject: utilKit.clone, // Renamed 'clone'
            getObjectKeys: Object.keys, // Added native method
            getObjectValues: Object.values, // Added native method
            getObjectEntries: Object.entries, // Added native method
            hasProperty: (targetObject, prop) => Object.prototype.hasOwnProperty.call(targetObject, prop), // Added new method
            freezeObject: Object.freeze // Added new method
        }
    });

    // Added isFunction type definition explicitly
    dataKindIdentifier.registerType({
        identifier: 'isFunction',
        defaultVal: EMPTY_FUNCTION,
        isInstance: utilKit.isFunction,
        conversionHandler: (subjectData) => {
            if (dataKindIdentifier.isFunction.isInstance(subjectData)) return subjectData;
            // Attempt to create a function that returns the subjectData
            return () => subjectData;
        },
        canConvert: (subjectData) => typeof subjectData === 'function' || dataKindIdentifier.isDefined.isInstance(subjectData),
        utilityMethods: {
            delayExecution: utilKit.delay, // Added new method
            throttleExecution: utilKit.throttle, // Added new method
            debounceExecution: utilKit.debounce // Added new method
        }
    });

    return dataKindIdentifier;

});