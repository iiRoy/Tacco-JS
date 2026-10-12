let globalScope = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : {};

/**
 * Custom Module Loader - a simplified emulation of Webpack's module system.
 * This function takes a collection of module definitions and returns an entry point function.
 * @param {Array<Function>} moduleDefinitions - An array where each element is a module function.
 * @returns {Function} The entry point function for the module system.
 */
module.exports = function(moduleDefinitions) {
    /**
     * Cache for already loaded modules.
     * @type {Object<number, {i: number, l: boolean, exports: any}>}
     */
    let loadedModuleCache = {};

    /**
     * The core module loading function.
     * It attempts to load a module from cache, or executes its definition and caches the result.
     * @param {number} moduleIdentifier - The ID of the module to load.
     * @returns {any} The exports of the loaded module.
     */
    function internalModuleLoader(moduleIdentifier) {
        // Check if module is already in cache
        if (loadedModuleCache[moduleIdentifier]) {
            return loadedModuleCache[moduleIdentifier].exports;
        }

        // If not in cache, create a new module entry
        let newModuleEntry = loadedModuleCache[moduleIdentifier] = {
            id: moduleIdentifier,
            isLoaded: false,
            exports: {} // The module's export object
        };

        // Execute the module's definition function, passing it the module object, exports, and the loader itself.
        // The 'call' method ensures 'this' context is correctly set.
        moduleDefinitions[moduleIdentifier].call(newModuleEntry.exports, newModuleEntry, newModuleEntry.exports, internalModuleLoader);

        // Mark the module as loaded
        newModuleEntry.isLoaded = true;
        return newModuleEntry.exports;
    }

    // --- Exposing utility functions on the loader for external access/config ---

    /** All module definitions. */
    internalModuleLoader.definitions = moduleDefinitions;
    /** The module cache. */
    internalModuleLoader.cache = loadedModuleCache;

    /**
     * Defines an enumerable getter property on the exports object.
     * This is used for "named exports" in ES modules.
     * @param {Object} exportsObject - The object to define the property on.
     * @param {string} propertyName - The name of the property.
     * @param {Function} getterFunction - The getter function for the property.
     */
    internalModuleLoader.defineExport = function(exportsObject, propertyName, getterFunction) {
        // Only define if the property doesn't already exist.
        if (!internalModuleLoader.hasOwnProp(exportsObject, propertyName)) {
            Object.defineProperty(exportsObject, propertyName, {
                enumerable: true, // Make it iterable
                get: getterFunction // The function to call when the property is accessed
            });
        }
    };

    /**
     * Marks an exports object as an ES module, typically by setting __esModule and Symbol.toStringTag.
     * @param {Object} exportsObject - The exports object to mark.
     */
    internalModuleLoader.registerESModule = function(exportsObject) {
        // Set Symbol.toStringTag for better object identification
        if (typeof Symbol !== 'undefined' && Symbol.toStringTag) {
            Object.defineProperty(exportsObject, Symbol.toStringTag, { value: 'Module' });
        }
        // Mark as an ES module
        Object.defineProperty(exportsObject, '__esModule', { value: true });
    };

    /**
     * Creates a namespace object for a module.
     * This handles various export formats (default, named, etc.) and ensures compatibility.
     * @param {any} moduleContent - The raw module content.
     * @param {number} modeFlags - Flags indicating how the module should be treated.
     * @returns {Object} A namespace object representing the module's exports.
     */
    internalModuleLoader.createNamespace = function(moduleContent, modeFlags) {
        // If 1st bit is set, resolve moduleContent via the loader.
        if (modeFlags & 1) moduleContent = internalModuleLoader(moduleContent);
        // If 8th bit is set, return moduleContent directly.
        if (modeFlags & 8) return moduleContent;
        // If 4th bit is set and it's an ES module object, return it.
        if (modeFlags & 4 && typeof moduleContent === 'object' && moduleContent && moduleContent.__esModule) return moduleContent;

        // Otherwise, create a new namespace object.
        let namespaceObject = Object.create(null);
        internalModuleLoader.registerESModule(namespaceObject); // Mark as ES module.
        // Define 'default' export.
        Object.defineProperty(namespaceObject, 'default', { enumerable: true, value: moduleContent });

        // If 2nd bit is set and moduleContent is not a string, copy all properties from moduleContent to namespaceObject.
        if (modeFlags & 2 && typeof moduleContent !== 'string') {
            for (let propKey in moduleContent) {
                // Ensure property is not 'default' and is directly owned.
                if (propKey !== 'default' && internalModuleLoader.hasOwnProp(moduleContent, propKey)) {
                    internalModuleLoader.defineExport(namespaceObject, propKey, (() => moduleContent[propKey]).bind(null, propKey));
                }
            }
        }
        return namespaceObject;
    };

    /**
     * Helper to create a getter function for a module's default export.
     * This is useful for interoperability with CommonJS modules.
     * @param {any} moduleItem - The module itself.
     * @returns {Function} A function that returns the module's default export.
     */
    internalModuleLoader.getDefaultExportGetter = function(moduleItem) {
        // If it's an ES module with a 'default' export, return a getter for it.
        let defaultGetter = moduleItem && moduleItem.__esModule
            ? () => moduleItem.default
            : () => moduleItem; // Otherwise, just return the module item itself as default.
        internalModuleLoader.defineExport(defaultGetter, 'a', defaultGetter); // Also define 'a' as a getter for compatibility.
        return defaultGetter;
    };

    /**
     * Checks if an object has a specific property as its own property.
     * @param {Object} targetObject - The object to check.
     * @param {string} propertyName - The name of the property.
     * @returns {boolean} True if the property exists and is owned by the object, false otherwise.
     */
    internalModuleLoader.hasOwnProp = function(targetObject, propertyName) {
        return Object.prototype.hasOwnProperty.call(targetObject, propertyName);
    };

    /** Public path for assets (empty by default). */
    internalModuleLoader.publicPath = "";

    // Set the entry point module (usually module 0) and execute it.
    // The result of the entry point is the result of the entire module bundle.
    return internalModuleLoader(internalModuleLoader.startModule = 0);
}([
    /**
     * Module 0: Main entry point for the application logic.
     * This module reads input from standard input and processes it.
     * @param {Object} currentModule - The current module object.
     * @param {Object} moduleExports - The exports object for this module.
     * @param {Function} moduleLoader - The internal module loading function.
     */
    function(currentModule, moduleExports, moduleLoader) {
        "use strict"; // Enforce strict mode for cleaner code.

        // Start timing the execution of the main application logic.
        console.time("ApplicationExecutionTime");

        // Load the File System module (module 1)
        const fileSystem = moduleLoader(1);

        // Load the Main Processing Logic module (module 2)
        const primaryProcessor = moduleLoader(2);

        try {
            // Define the standard input path.
            const stdinPath = "/dev/stdin";
            // Read the content of standard input synchronously, using UTF-8 encoding.
            const rawInputContent = fileSystem.readFileSync(stdinPath, "utf8");

            // Perform a basic validation: check if the input content is not empty.
            if (!rawInputContent || rawInputContent.trim().length === 0) {
                console.warn("Warning: Standard input was empty or contained only whitespace.");
                // Optionally, throw an error or handle gracefully. For now, we'll proceed with empty input.
            }

            // Pass the raw input content to the primary processing function.
            primaryProcessor(rawInputContent);
        } catch (error) {
            console.error("An error occurred during input processing:", error.message);
            // Exit with an error code if critical.
            process.exit(1);
        } finally {
            // End timing the execution.
            console.timeEnd("ApplicationExecutionTime");
        }
    },
    /**
     * Module 1: Wrapper for Node.js 'fs' (File System) module.
     * This module simply exports the native 'fs' module.
     * @param {Object} currentModule - The current module object.
     * @param {Object} moduleExports - The exports object for this module.
     */
    function(currentModule, moduleExports) {
        // Define a helper function to retrieve the 'fs' module.
        const getFileSystemModule = () => {
            // A simple guard clause to ensure 'require' exists (e.g., in Node.js environment).
            if (typeof require === 'function' && require.name === 'require') {
                return require("fs");
            } else {
                console.error("The 'fs' module is not available in this environment.");
                // Return a mock object or throw an error depending on desired behavior.
                return {
                    readFileSync: (path, encoding) => {
                        console.warn(`Mock fs.readFileSync called for path: ${path}`);
                        return ""; // Return empty string for mock
                    }
                };
            }
        };
        // Export the 'fs' module via the helper function.
        currentModule.exports = getFileSystemModule();
    },
    /**
     * Module 2: Orchestrates the input parsing and problem solving.
     * This module takes raw input, creates an input processor, and then passes it to the solver.
     * @param {Object} currentModule - The current module object.
     * @param {Object} moduleExports - The exports object for this module.
     * @param {Function} moduleLoader - The internal module loading function.
     */
    function(currentModule, moduleExports, moduleLoader) {
        "use strict"; // Enforce strict mode.

        // Load the Input Data Processor class (module 3)
        const InputDataProcessor = moduleLoader(3);
        // Load the Main Problem Solver function (module 5)
        const ProblemSolver = moduleLoader(5);

        /**
         * Main function to process the input string.
         * @param {string} rawInputString - The raw string input from stdin.
         */
        currentModule.exports = function(rawInputString) {
            // Initialize a new InputDataProcessor with the raw input.
            const inputHandler = new InputDataProcessor(rawInputString);

            // Call the solver function with the initialized input handler.
            ProblemSolver(inputHandler);

            // Optionally, clear the input handler after use.
            inputHandler.resetProcessor();
        };
    },
    /**
     * Module 3: Input Data Processor Class.
     * This class handles parsing raw string input into a queue of tokens for consumption.
     * @param {Object} currentModule - The current module object.
     * @param {Object} moduleExports - The exports object for this module.
     * @param {Function} moduleLoader - The internal module loading function.
     */
    function(currentModule, moduleExports, moduleLoader) {
        "use strict"; // Enforce strict mode.

        // Load the Queue Data Structure class (module 4)
        const DataQueue = moduleLoader(4);

        /**
         * InputProcessor class to manage input tokens.
         */
        currentModule.exports = class InputProcessor {
            /**
             * Constructs an InputProcessor instance.
             * @param {string} rawStringData - The raw string input to be processed.
             */
            constructor(rawStringData) {
                // Define a constant for whitespace splitting.
                const WHITESPACE_DELIMITER = /\s+/g;
                // Trim leading/trailing whitespace and split the string into tokens.
                // Filter(Boolean) removes any empty strings that might result from multiple delimiters.
                const tokens = rawStringData.trim().split(WHITESPACE_DELIMITER).filter(Boolean);

                // Initialize an internal queue with the parsed tokens.
                this.tokenQueue = new DataQueue(tokens);

                // Add a small validation: log if the input resulted in no tokens.
                if (this.tokenQueue.isEmpty()) {
                    console.warn("InputProcessor initialized with no valid tokens after splitting.");
                }
            }

            /**
             * Dequeues the next raw string token from the input.
             * @returns {string} The next raw string token.
             */
            getNextRaw() {
                return this.tokenQueue.dequeueItem();
            }

            /**
             * Dequeues the next token and parses it as an integer.
             * @returns {number} The next token parsed as an integer.
             */
            getNextInteger() {
                const rawToken = this.tokenQueue.dequeueItem();
                // Use radix 10 explicitly for parseInt.
                const parsedInt = parseInt(rawToken, 10);

                // Add a guard clause for NaN results.
                if (isNaN(parsedInt)) {
                    console.error(`Attempted to parse non-numeric token '${rawToken}' into an integer.`);
                    // Return 0 or throw an error depending on desired error handling.
                    return 0;
                }
                return parsedInt;
            }

            /**
             * Clears the internal queue, effectively resetting the processor.
             */
            resetProcessor() {
                this.tokenQueue.clearQueue();
            }
        };
    },
    /**
     * Module 4: Simple Queue Data Structure Class.
     * Implements basic enqueue, dequeue, and clear operations.
     * @param {Object} currentModule - The current module object.
     * @param {Object} moduleExports - The exports object for this module.
     */
    function(currentModule, moduleExports) {
        "use strict"; // Enforce strict mode.

        /**
         * A basic Queue implementation using an array.
         */
        currentModule.exports = class Queue {
            /**
             * Constructs a new Queue instance.
             * @param {Array<any>} [initialItems=[]] - An optional array of items to initialize the queue with.
             */
            constructor(initialItems = []) {
                this.items = initialItems;
                this.currentSize = this.items.length;
            }

            /**
             * Adds an item to the back of the queue.
             * @param {any} itemToAdd - The item to be enqueued.
             */
            enqueueItem(itemToAdd) {
                this.items.push(itemToAdd);
                this.currentSize++;
            }

            /**
             * Removes and returns the item from the front of the queue.
             * @returns {any|undefined} The item at the front of the queue, or undefined if the queue is empty.
             */
            dequeueItem() {
                // Add a guard clause for an empty queue.
                if (this.isEmpty()) {
                    console.warn("Attempted to dequeue from an empty queue.");
                    return undefined;
                }
                // Using shift() is a common and clear way to dequeue from the front.
                const dequeuedItem = this.items.shift();
                this.currentSize--;
                return dequeuedItem;
            }

            /**
             * Checks if the queue is empty.
             * @returns {boolean} True if the queue contains no items, false otherwise.
             */
            isEmpty() {
                return this.currentSize === 0;
            }

            /**
             * Returns the number of items currently in the queue.
             * @returns {number} The current size of the queue.
             */
            getSize() {
                return this.currentSize;
            }

            /**
             * Clears all items from the queue.
             */
            clearQueue() {
                this.items = [];
                this.currentSize = 0;
            }
        };
    },
    /**
     * Module 5: The main problem-solving logic.
     * This module reads input arrays, sorts them, and performs a binary search to find a specific value.
     * @param {Object} currentModule - The current module object.
     * @param {Object} moduleExports - The exports object for this module.
     * @param {Function} moduleLoader - The internal module loading function.
     */
    function(currentModule, moduleExports, moduleLoader) {
        "use strict"; // Enforce strict mode.

        // Load the BigNumber library (module 6)
        const BigNumber = moduleLoader(6);

        /**
         * Helper function to calculate ceiling division.
         * @param {number} numerator - The numerator.
         * @param {number} denominator - The denominator.
         * @returns {number} The ceiling of the division.
         */
        const calculateCeilingDivision = (numerator, denominator) => {
            // Guard against division by zero.
            if (denominator === 0) {
                console.error("Division by zero encountered in calculateCeilingDivision.");
                return Infinity; // Or handle as an error, depending on context.
            }
            return Math.ceil(numerator / denominator);
        };

        /**
         * Main solver function.
         * @param {InputProcessor} dataReader - An instance of the InputProcessor class.
         */
        currentModule.exports = function(dataReader) {
            // Read the number of elements for the arrays.
            const elementCount = dataReader.getNextInteger();

            // Basic validation for elementCount.
            if (elementCount <= 0) {
                console.log(0); // If no elements, result is 0.
                return;
            }

            // Read a BigNumber value.
            const bigNumThreshold = new BigNumber(dataReader.getNextRaw());

            // Initialize two arrays and their maximum values.
            let arrayA = Array.from({ length: elementCount });
            let arrayB = Array.from({ length: elementCount });
            let maxValA = 0;
            let maxValB = 0;

            // Populate arrayA and find its maximum value.
            for (let k = 0; k < elementCount; k++) {
                const currentVal = dataReader.getNextInteger();
                arrayA[k] = currentVal;
                // Update maxValA if currentVal is greater.
                if (currentVal > maxValA) {
                    maxValA = currentVal;
                }
            }

            // Populate arrayB and find its maximum value.
            for (let k = 0; k < elementCount; k++) {
                const currentVal = dataReader.getNextInteger();
                arrayB[k] = currentVal;
                // Update maxValB if currentVal is greater.
                if (currentVal > maxValB) {
                    maxValB = currentVal;
                }
            }

            // Sort arrayA in ascending order.
            arrayA.sort((val1, val2) => val1 - val2);

            // Sort arrayB in descending order.
            arrayB.sort((val1, val2) => val2 - val1);

            // Initialize search boundaries for the binary search.
            // The search space is from 0 up to the maximum possible product.
            let lowerBound = 0;
            let upperBound = maxValA * maxValB; // Initial upper bound: product of max values.

            // Variable to store the final optimal result.
            let optimalResult = upperBound;

            // Binary search loop: continues as long as there's a significant difference between bounds.
            while (lowerBound <= upperBound) {
                // Calculate the middle point of the current search range.
                // Using integer division for safety.
                const midPoint = Math.floor((lowerBound + upperBound) / 2);

                let requiredOperations = 0;
                // Iterate through the sorted arrays to calculate required operations.
                for (let idx = 0; idx < elementCount; idx++) {
                    const product = arrayA[idx] * arrayB[idx];
                    // If the product exceeds the midPoint, calculate how many operations are needed.
                    if (product > midPoint) {
                        // Using the helper function for clarity and safety.
                        requiredOperations += calculateCeilingDivision(product - midPoint, arrayB[idx]);
                    }
                }

                // Compare the required operations with the bigNumThreshold using BigNumber's comparison method.
                // If required operations are less than or equal to the threshold:
                // This midPoint is a possible solution or too high. Try a smaller one.
                if (bigNumThreshold.comparedTo(requiredOperations) >= 0) {
                    optimalResult = midPoint; // This midPoint is achievable.
                    upperBound = midPoint - 1; // Try to find a smaller (better) result.
                } else {
                    // If required operations are greater than the threshold:
                    // This midPoint is too low; we need more operations than allowed.
                    lowerBound = midPoint + 1; // Increase the lower bound to search higher.
                }
            }

            // Output the final optimal result.
            console.log(optimalResult);
        };
    },
    /**
     * Module 6: BigNumber.js Library - A JavaScript library for arbitrary-precision arithmetic.
     * This module provides a BigNumber class with methods for high-precision calculations.
     * The original BigNumber.js is a very complex and highly optimized library.
     * For Type III cloning, we will primarily focus on identifier renaming,
     * minor structural changes that don't alter core logic (e.g., `var` to `const`/`let`),
     * adding comments, and very small equivalent rewrites where safe.
     * Extensive changes to its mathematical core could easily introduce bugs.
     */
    function(currentModule, moduleExports, moduleLoader) {
        let moduleExportValue; // Variable to hold the export value.

        // Immediately-invoked function expression (IIFE) to encapsulate BigNumber logic.
        (function(globalObjectRef) {
            "use strict";

            // Internal variables and constants for BigNumber.js
            let BigNumberFactory, // The main BigNumber constructor/factory.
                stringPattern, // Regex for valid number strings.
                ceilFunc = Math.ceil, // Reference to Math.ceil.
                floorFunc = Math.floor, // Reference to Math.floor.
                errorPrefix = "[BigNumber Error] ", // Prefix for error messages.
                largeNumberWarning = errorPrefix + "Number primitive has more than 15 significant digits: ",
                maxSafeDigits = 1e14, // Max digits per array element (base 1e14 for internal representation).
                maxSignifDigits = 14, // Max significant digits for JS numbers.
                jsMaxSafeInteger = 9007199254740991, // JavaScript's MAX_SAFE_INTEGER.
                powerOfTens = [1, 10, 100, 1e3, 1e4, 1e5, 1e6, 1e7, 1e8, 1e9, 1e10, 1e11, 1e12, 1e13],
                internalBase = 1e7, // Internal base for calculations (10^7).
                altBase = 1e9; // Alternative internal base (10^9).

            // Regex patterns for number string validation
            stringPattern = /^-?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i;

            /**
             * Converts a number to an integer by truncating its fractional part.
             * Similar to Math.trunc, but handles negative numbers differently for historical reasons in BigNumber.js.
             * @param {number} value - The number to truncate.
             * @returns {number} The integer part of the number.
             */
            function truncateNumber(value) {
                let integerPart = 0 | value;
                return value > 0 || value === integerPart ? integerPart : integerPart - 1;
            }

            /**
             * Formats an internal BigNumber coefficient array into a string.
             * Adds leading zeros to elements to maintain fixed length.
             * @param {Array<number>} coeffArray - The array of coefficients.
             * @returns {string} The formatted coefficient string.
             */
            function formatCoefficientString(coeffArray) {
                let currentIdx = 1,
                    arrayLength = coeffArray.length,
                    elementString = coeffArray[0] + ""; // Start with the first element.

                while (currentIdx < arrayLength) {
                    let nextElement = coeffArray[currentIdx++] + "";
                    let paddingCount = maxSignifDigits - nextElement.length;
                    // Add leading zeros to maintain fixed length.
                    while (paddingCount-- > 0) {
                        elementString += "0";
                    }
                    elementString += nextElement;
                }
                // Remove trailing zeros, but keep at least one digit if all are zero.
                arrayLength = elementString.length;
                while (arrayLength > 0 && 48 === elementString.charCodeAt(--arrayLength)) {}
                return elementString.slice(0, arrayLength + 1 || 1);
            }

            /**
             * Compares two BigNumber instances.
             * @param {BigNumber} num1 - The first BigNumber.
             * @param {BigNumber} num2 - The second BigNumber.
             * @returns {number|null} -1 if num1 < num2, 1 if num1 > num2, 0 if num1 = num2, or null if either is NaN.
             */
            function compareBigNumbers(num1, num2) {
                let coeffs1 = num1.coefficients,
                    coeffs2 = num2.coefficients,
                    sign1 = num1.sign,
                    sign2 = num2.sign,
                    exponent1 = num1.exponent,
                    exponent2 = num2.exponent;

                // Handle NaN cases.
                if (!sign1 || !sign2) return null;

                let isNum1Zero = coeffs1 && !coeffs1[0],
                    isNum2Zero = coeffs2 && !coeffs2[0];

                // Handle zero comparisons.
                if (isNum1Zero || isNum2Zero) {
                    if (isNum1Zero && isNum2Zero) return 0;
                    return isNum1Zero ? -sign2 : sign1; // -sign2 if num1 is zero, sign1 if num2 is zero.
                }

                // Handle different signs.
                if (sign1 !== sign2) return sign1;

                let isNegative = sign1 < 0; // Determine if both are negative.
                let exponentsEqual = exponent1 === exponent2;

                // If coefficients are null, it means Infinity or NaN.
                if (!coeffs1 || !coeffs2) {
                    return exponentsEqual ? 0 : (!coeffs1 ^ isNegative ? 1 : -1);
                }

                // Compare exponents.
                if (!exponentsEqual) {
                    return (exponent1 > exponent2) ^ isNegative ? 1 : -1;
                }

                // Compare coefficients if exponents are equal.
                let minLength = (exponent1 = coeffs1.length) < (exponent2 = coeffs2.length) ? exponent1 : exponent2;
                for (sign1 = 0; sign1 < minLength; sign1++) {
                    if (coeffs1[sign1] !== coeffs2[sign1]) {
                        return (coeffs1[sign1] > coeffs2[sign1]) ^ isNegative ? 1 : -1;
                    }
                }
                // If one is a prefix of the other, the longer one is larger (or smaller if negative).
                return exponent1 === exponent2 ? 0 : (exponent1 > exponent2) ^ isNegative ? 1 : -1;
            }

            /**
             * Validates a number against a min/max range and integer status.
             * Throws an error if validation fails.
             * @param {number} value - The value to validate.
             * @param {number} min - Minimum allowed value.
             * @param {number} max - Maximum allowed value.
             * @param {string} [argName="Argument"] - The name of the argument for error messages.
             */
            function validateRange(value, min, max, argName = "Argument") {
                if (value < min || value > max || value !== floorFunc(value)) {
                    throw Error(errorPrefix + argName + (typeof value === 'number' && (value < min || value > max) ? " out of range: " : " not an integer: ") + String(value));
                }
            }

            /**
             * Checks if a BigNumber is odd.
             * @param {BigNumber} bigNum - The BigNumber instance.
             * @returns {boolean} True if odd, false if even.
             */
            function isOdd(bigNum) {
                let lastCoeffIndex = bigNum.coefficients.length - 1;
                return truncateNumber(bigNum.exponent / maxSignifDigits) === lastCoeffIndex && bigNum.coefficients[lastCoeffIndex] % 2 !== 0;
            }

            /**
             * Formats a number string into scientific notation.
             * @param {string} numStr - The number string.
             * @param {number} exponent - The exponent.
             * @returns {string} The scientific notation string.
             */
            function toScientificNotation(numStr, exponent) {
                return (numStr.length > 1 ? numStr.charAt(0) + "." + numStr.slice(1) : numStr) +
                    (exponent < 0 ? "e" : "e+") + exponent;
            }

            /**
             * Formats a number string by adjusting its decimal point based on an exponent.
             * @param {string} numStr - The number string.
             * @param {number} exponent - The exponent to adjust by.
             * @param {string} paddingChar - Character to use for padding.
             * @returns {string} The formatted number string.
             */
            function adjustDecimalPoint(numStr, exponent, paddingChar) {
                let decimalPosition, currentLength;

                if (exponent < 0) {
                    decimalPosition = paddingChar + ".";
                    while (++exponent) decimalPosition += paddingChar;
                    numStr = decimalPosition + numStr;
                } else if (++exponent > (currentLength = numStr.length)) {
                    decimalPosition = paddingChar;
                    while (--exponent > currentLength) decimalPosition += paddingChar;
                    numStr += decimalPosition;
                } else if (exponent < currentLength) {
                    numStr = numStr.slice(0, exponent) + "." + numStr.slice(exponent);
                }
                return numStr;
            }

            // --- BigNumberFactory Definition ---
            BigNumberFactory = (function BigNumberClosure(configObject) {
                let config,
                    prototypeObject = BigNumberPrototype.prototype = {
                        constructor: BigNumberPrototype,
                        toString: null, // Will be assigned later.
                        valueOf: null // Will be assigned later.
                    },
                    oneBigNumber = new BigNumberPrototype(1), // Constant for BigNumber 1.
                    decimalPlaces = 20, // Default decimal places.
                    roundingMode = 4, // Default rounding mode (ROUND_HALF_UP).
                    expLowerBound = -7, // Default exponential lower bound.
                    expUpperBound = 21, // Default exponential upper bound.
                    minRange = -1e7, // Default minimum exponent range.
                    maxRange = 1e7, // Default maximum exponent range.
                    cryptoEnabled = false, // Whether to use crypto for random numbers.
                    moduloMode = 1, // Default modulo mode (ROUND_DOWN).
                    powerPrecision = 0, // Default precision for power operations.
                    formatSettings = { // Default formatting settings.
                        prefix: "",
                        groupSize: 3,
                        secondaryGroupSize: 0,
                        groupSeparator: ",",
                        decimalSeparator: ".",
                        fractionGroupSize: 0,
                        fractionGroupSeparator: " ", // Non-breaking space.
                        suffix: ""
                    },
                    alphabetChars = "0123456789abcdefghijklmnopqrstuvwxyz"; // Default alphabet for bases.

                /**
                 * BigNumberPrototype constructor function.
                 * @param {number|string|BigNumber} value - The value to initialize the BigNumber with.
                 * @param {number} [base] - The base of the input value if it's a string.
                 */
                function BigNumberPrototype(value, base) {
                    let numericValue,
                        isNumberPrimitive,
                        coeffIndex,
                        exponentValue,
                        currentDigit,
                        currentLength,
                        tempString,
                        tempBase,
                        currentBigNum = this;

                    // Ensure 'new' keyword is used.
                    if (!(currentBigNum instanceof BigNumberPrototype)) {
                        return new BigNumberPrototype(value, base);
                    }

                    // If no base is provided.
                    if (base == null) {
                        // If input is already a BigNumber, clone it efficiently.
                        if (value && true === value._isBigNumber) {
                            currentBigNum.sign = value.sign;
                            // Handle null coefficients (Infinity/NaN) or extremely large/small exponents.
                            if (!value.coefficients || value.exponent > maxRange) {
                                currentBigNum.coefficients = currentBigNum.exponent = null;
                            } else if (value.exponent < minRange) {
                                currentBigNum.coefficients = [currentBigNum.exponent = 0];
                            } else {
                                currentBigNum.exponent = value.exponent;
                                currentBigNum.coefficients = value.coefficients.slice(); // Deep copy coefficients.
                            }
                            return;
                        }

                        // Handle number primitive input.
                        if ((isNumberPrimitive = typeof value === 'number') && 0 * value == 0) {
                            currentBigNum.sign = 1 / value < 0 ? (value = -value, -1) : 1;
                            // Handle integers directly for performance.
                            if (value === ~~value) {
                                for (coeffIndex = 0, numericValue = value; numericValue >= 10; numericValue /= 10, coeffIndex++);
                                return void(coeffIndex > maxRange ? currentBigNum.coefficients = currentBigNum.exponent = null : (currentBigNum.exponent = coeffIndex, currentBigNum.coefficients = [value]));
                            }
                            tempString = String(value);
                        } else {
                            // Handle string input without base.
                            if (!stringPattern.test(tempString = String(value))) {
                                return initializeInvalid(currentBigNum, tempString, isNumberPrimitive);
                            }
                            currentBigNum.sign = 45 == tempString.charCodeAt(0) ? (tempString = tempString.slice(1), -1) : 1;
                        }

                        // Parse decimal point and exponent from string.
                        if ((coeffIndex = tempString.indexOf(".")) > -1) {
                            tempString = tempString.replace(".", "");
                        }
                        if ((exponentValue = tempString.search(/e/i)) > 0) {
                            if (coeffIndex < 0) coeffIndex = exponentValue;
                            coeffIndex += +tempString.slice(exponentValue + 1);
                            tempString = tempString.substring(0, exponentValue);
                        } else if (coeffIndex < 0) {
                            coeffIndex = tempString.length;
                        }
                    } else {
                        // Handle input with a specified base.
                        validateRange(base, 2, alphabetChars.length, "Base");
                        if (10 == base) {
                            return roundBigNumber(currentBigNum = new BigNumberPrototype(value), decimalPlaces + currentBigNum.exponent + 1, roundingMode);
                        }

                        tempString = String(value);
                        isNumberPrimitive = typeof value === 'number';

                        if (isNumberPrimitive) {
                            if (0 * value != 0) return initializeInvalid(currentBigNum, tempString, isNumberPrimitive, base);
                            currentBigNum.sign = 1 / value < 0 ? (tempString = tempString.slice(1), -1) : 1;
                            if (BigNumberPrototype.DEBUG && tempString.replace(/^0\.0*|\./, "").length > 15) throw Error(largeNumberWarning + value);
                        } else {
                            currentBigNum.sign = 45 === tempString.charCodeAt(0) ? (tempString = tempString.slice(1), -1) : 1;
                        }

                        // Validate characters in string for the given base.
                        let baseAlphabet = alphabetChars.slice(0, base);
                        coeffIndex = exponentValue = 0;
                        for (currentLength = tempString.length; exponentValue < currentLength; exponentValue++) {
                            if (baseAlphabet.indexOf(currentDigit = tempString.charAt(exponentValue)) < 0) {
                                if ("." == currentDigit) {
                                    if (exponentValue > coeffIndex) {
                                        coeffIndex = currentLength;
                                        continue;
                                    }
                                } else if (!numericValue && (tempString == tempString.toUpperCase() && (tempString = tempString.toLowerCase()) || tempString == tempString.toLowerCase() && (tempString = tempString.toUpperCase()))) {
                                    numericValue = true;
                                    exponentValue = -1;
                                    coeffIndex = 0;
                                    continue;
                                }
                                return initializeInvalid(currentBigNum, String(value), isNumberPrimitive, base);
                            }
                        }
                        isNumberPrimitive = false;
                        // Convert from custom base to base 10.
                        let convertedString = convertToBase10(tempString, base, 10, currentBigNum.sign);
                        if ((coeffIndex = convertedString.indexOf(".")) > -1) {
                            tempString = convertedString.replace(".", "");
                        } else {
                            coeffIndex = convertedString.length;
                        }
                    }

                    // Remove leading zeros.
                    for (exponentValue = 0; 48 === tempString.charCodeAt(exponentValue); exponentValue++);
                    // Remove trailing zeros.
                    for (currentLength = tempString.length; currentLength > 0 && 48 === tempString.charCodeAt(currentLength - 1); currentLength--);

                    if (tempString = tempString.slice(exponentValue, currentLength)) {
                        currentLength -= exponentValue;
                        if (isNumberPrimitive && BigNumberPrototype.DEBUG && currentLength > 15 && (value > jsMaxSafeInteger || value !== floorFunc(value))) throw Error(largeNumberWarning + currentBigNum.sign * value);

                        coeffIndex = coeffIndex - exponentValue - 1;

                        // Handle exponents outside the defined range.
                        if (coeffIndex > maxRange) {
                            currentBigNum.coefficients = currentBigNum.exponent = null;
                        } else if (coeffIndex < minRange) {
                            currentBigNum.coefficients = [currentBigNum.exponent = 0];
                        } else {
                            currentBigNum.exponent = coeffIndex;
                            currentBigNum.coefficients = [];
                            // Split string into coefficients array (base 1e14).
                            exponentValue = (coeffIndex + 1) % maxSignifDigits;
                            if (coeffIndex < 0) exponentValue += maxSignifDigits; // Adjust for negative exponents.

                            if (exponentValue < currentLength) {
                                if (exponentValue) currentBigNum.coefficients.push(+tempString.slice(0, exponentValue));
                                currentLength -= maxSignifDigits;
                                while (exponentValue < currentLength) {
                                    currentBigNum.coefficients.push(+tempString.slice(exponentValue, exponentValue += maxSignifDigits));
                                }
                                exponentValue = maxSignifDigits - (tempString = tempString.slice(exponentValue)).length;
                            } else {
                                exponentValue -= currentLength;
                            }
                            while (exponentValue-- > 0) tempString += "0"; // Pad with zeros.
                            currentBigNum.coefficients.push(+tempString);
                        }
                    } else {
                        // If the string is empty after processing (e.g., "0", ".0", "0e5").
                        currentBigNum.coefficients = [currentBigNum.exponent = 0];
                    }
                }

                /**
                 * Initializes a BigNumber instance as invalid (NaN or Infinity).
                 * @param {BigNumber} bigNum - The BigNumber instance to modify.
                 * @param {string} rawString - The original string input.
                 * @param {boolean} isPrimitive - Whether the input was a primitive number.
                 * @param {number} [inputBase] - The base if provided.
                 */
                function initializeInvalid(bigNum, rawString, isPrimitive, inputBase) {
                    let cleanedString = isPrimitive ? rawString : rawString.replace(/^\s*\+(?=[\w.])|^\s+|\s+$/g, ""); // Remove leading/trailing whitespace and optional leading '+'
                    if (/^(-?)(Infinity|NaN)$/.test(cleanedString)) {
                        bigNum.sign = isNaN(cleanedString) ? null : cleanedString < 0 ? -1 : 1;
                    } else {
                        // If it's not a recognized special numeric string, and DEBUG is on, throw.
                        if (BigNumberPrototype.DEBUG) {
                            throw Error(errorPrefix + "Not a" + (inputBase ? " base " + inputBase : "") + " number: " + rawString);
                        }
                        bigNum.sign = null; // Mark as NaN.
                    }
                    bigNum.coefficients = bigNum.exponent = null; // Set internal state for NaN/Infinity.
                }

                /**
                 * Converts a BigNumber to a string representation with specified decimal places and rounding mode.
                 * @param {BigNumber} bigNum - The BigNumber instance.
                 * @param {number} [decimalCount] - Number of decimal places.
                 * @param {number} [roundMode] - Rounding mode.
                 * @param {number} [formatType] - Type of formatting (1: exponential, 2: fixed).
                 * @returns {string} The formatted string.
                 */
                function formatToString(bigNum, decimalCount, roundMode, formatType) {
                    let firstCoeff,
                        currentExponent,
                        formattedString,
                        stringLength;

                    if (roundMode == null) roundMode = roundingMode;
                    validateRange(roundMode, 0, 8); // Validate rounding mode.

                    if (!bigNum.coefficients) return bigNum.toString(); // Handle NaN/Infinity.

                    firstCoeff = bigNum.coefficients[0];
                    currentExponent = bigNum.exponent;

                    if (decimalCount == null) {
                        formattedString = formatCoefficientString(bigNum.coefficients);
                        formattedString = (formatType == 1 || (formatType == 2 && (currentExponent <= expLowerBound || currentExponent >= expUpperBound)))
                            ? toScientificNotation(formattedString, currentExponent)
                            : adjustDecimalPoint(formattedString, currentExponent, "0");
                    } else {
                        // Round the number first.
                        bigNum = roundBigNumber(new BigNumberPrototype(bigNum), decimalCount + bigNum.exponent + 1, roundMode);
                        currentExponent = bigNum.exponent;
                        stringLength = (formattedString = formatCoefficientString(bigNum.coefficients)).length;

                        if (formatType == 1 || (formatType == 2 && (decimalCount <= currentExponent || currentExponent <= expLowerBound))) {
                            // Exponential notation.
                            while (stringLength < decimalCount) {
                                formattedString += "0";
                                stringLength++;
                            }
                            formattedString = toScientificNotation(formattedString, currentExponent);
                        } else if (decimalCount -= currentExponent, formattedString = adjustDecimalPoint(formattedString, currentExponent, "0"), currentExponent + 1 > stringLength) {
                            // Fixed point notation with padding.
                            if (--decimalCount > 0) {
                                formattedString += ".";
                                while (decimalCount--) formattedString += "0";
                            }
                        } else if (decimalCount > 0) {
                            // Fixed point notation with decimals.
                            currentExponent + 1 == stringLength && (formattedString += ".");
                            while (decimalCount--) formattedString += "0";
                        }
                    }
                    return bigNum.sign < 0 && firstCoeff ? "-" + formattedString : formattedString;
                }

                /**
                 * Iterates through a list of BigNumbers to find the min/max.
                 * @param {Array<BigNumber>} bigNumList - Array of BigNumber instances.
                 * @param {Function} comparisonMethod - The comparison method (e.g., `lt` for max, `gt` for min).
                 * @returns {BigNumber} The min or max BigNumber.
                 */
                function findMinMax(bigNumList, comparisonMethod) {
                    let currentItemIndex = 1,
                        resultBigNum = new BigNumberPrototype(bigNumList[0]); // Start with the first item.

                    while (currentItemIndex < bigNumList.length) {
                        let nextBigNum = new BigNumberPrototype(bigNumList[currentItemIndex++]);
                        if (!nextBigNum.sign) { // If nextBigNum is NaN, the result is NaN.
                            resultBigNum = nextBigNum;
                            break;
                        }
                        // Use the provided comparison method.
                        comparisonMethod.call(resultBigNum, nextBigNum) && (resultBigNum = nextBigNum);
                    }
                    return resultBigNum;
                }

                /**
                 * Sets the coefficients and exponent of a BigNumber from a processed array of coefficients.
                 * Also handles normalization (removing leading zeros) and range checks.
                 * @param {BigNumber} bigNum - The BigNumber instance to modify.
                 * @param {Array<number>} coeffArray - The array of coefficients.
                 * @param {number} exponent - The exponent.
                 * @returns {BigNumber} The modified BigNumber instance.
                 */
                function setCoefficientsAndExponent(bigNum, coeffArray, exponent) {
                    // Remove trailing zeros from coefficients.
                    for (let i = coeffArray.length - 1; i >= 0 && !coeffArray[i]; coeffArray.pop(), i--);

                    let firstCoeff = coeffArray[0];
                    if (!firstCoeff) { // If all coefficients are zero.
                        bigNum.coefficients = [bigNum.exponent = 0];
                    } else {
                        let coeffLength = 0;
                        for (let tempVal = firstCoeff; tempVal >= 10; tempVal /= 10, coeffLength++); // Calculate length of first coefficient.
                        exponent = coeffLength + exponent * maxSignifDigits - 1; // Adjust exponent.

                        // Handle exponents outside the defined range (Infinity/NaN).
                        if (exponent > maxRange) {
                            bigNum.coefficients = bigNum.exponent = null;
                        } else if (exponent < minRange) {
                            bigNum.coefficients = [bigNum.exponent = 0];
                        } else {
                            bigNum.exponent = exponent;
                            bigNum.coefficients = coeffArray;
                        }
                    }
                    return bigNum;
                }

                /**
                 * Rounds a BigNumber to a specified number of decimal places and rounding mode.
                 * @param {BigNumber} bigNum - The BigNumber instance to round.
                 * @param {number} decimalCount - The number of decimal places relative to the exponent.
                 * @param {number} roundMode - The rounding mode.
                 * @param {boolean} [isPow] - Flag for power operation rounding.
                 * @returns {BigNumber} The rounded BigNumber instance.
                 */
                function roundBigNumber(bigNum, decimalCount, roundMode, isPow) {
                    let firstCoeff,
                        coeffElement,
                        remainderCoeff,
                        tempDivisor,
                        coeffArray = bigNum.coefficients,
                        powerOfTenLookup = powerOfTens;

                    if (coeffArray) {
                        let currentLength = 1;
                        // Calculate length of the first coefficient.
                        for (firstCoeff = coeffArray[0]; firstCoeff >= 10; firstCoeff /= 10, currentLength++);

                        // Calculate the target index for rounding.
                        let targetIndex = decimalCount - currentLength;
                        if (targetIndex < 0) { // Rounding within the first coefficient.
                            targetIndex += maxSignifDigits;
                            coeffElement = decimalCount;
                            remainderCoeff = (coeffArray[coeffElement = 0] / powerOfTenLookup[currentLength - coeffElement - 1]) % 10 | 0;
                        } else if ((coeffElement = floorFunc((targetIndex + 1) / maxSignifDigits)) >= coeffArray.length) {
                            // Rounding beyond existing coefficients.
                            if (!isPow) {
                                return bigNum; // No rounding needed if beyond existing precision.
                            }
                            // For power operations, extend with zeros.
                            while (coeffArray.length <= coeffElement) coeffArray.push(0);
                            firstCoeff = remainderCoeff = 0;
                            currentLength = 1;
                            coeffElement = (targetIndex %= maxSignifDigits) - maxSignifDigits + 1;
                        } else {
                            // Rounding within other coefficients.
                            firstCoeff = coeffArray[coeffElement];
                            currentLength = 1;
                            for (let val = firstCoeff; val >= 10; val /= 10, currentLength++); // Recalculate length.
                            remainderCoeff = (coeffElement = (targetIndex %= maxSignifDigits) - maxSignifDigits + currentLength) < 0
                                ? 0
                                : (firstCoeff / powerOfTenLookup[currentLength - coeffElement - 1]) % 10 | 0;
                        }

                        // Determine if rounding up is needed based on remainderCoeff and rounding mode.
                        isPow = isPow || decimalCount < 0 || coeffArray[coeffElement + 1] != null || (coeffElement < 0 ? firstCoeff : firstCoeff % powerOfTenLookup[currentLength - coeffElement - 1]);
                        isPow = roundMode < 4
                            ? (remainderCoeff || isPow) && (roundMode == 0 || roundMode == (bigNum.sign < 0 ? 3 : 2))
                            : remainderCoeff > 5 || (remainderCoeff == 5 && (roundMode == 4 || isPow || (roundMode == 6 && (targetIndex > 0 ? (coeffElement > 0 ? coeffArray[coeffElement - 1] : 0) : coeffArray[coeffElement]) % 10 & 1) || roundMode == (bigNum.sign < 0 ? 8 : 7)));

                        if (decimalCount < 1 || !coeffArray[0]) {
                            coeffArray.length = 0;
                            if (isPow) {
                                decimalCount -= bigNum.exponent + 1;
                                coeffArray[0] = powerOfTenLookup[(maxSignifDigits - decimalCount % maxSignifDigits) % maxSignifDigits];
                                bigNum.exponent = -decimalCount || 0;
                            } else {
                                coeffArray[0] = bigNum.exponent = 0;
                            }
                            return bigNum;
                        }

                        if (targetIndex == 0) { // If rounding at the end of a coefficient.
                            coeffArray.length = coeffElement;
                            firstCoeff = 1;
                            coeffElement--;
                        } else { // Rounding inside a coefficient.
                            firstCoeff = powerOfTenLookup[maxSignifDigits - targetIndex];
                            coeffArray.length = coeffElement + 1;
                            coeffArray[coeffElement] = coeffElement > 0 ? floorFunc(firstCoeff * (coeffArray[coeffElement] / firstCoeff)) : 0;
                        }

                        if (isPow) {
                            for (;;) {
                                if (coeffElement == 0) {
                                    for (targetIndex = 1, remainderCoeff = coeffArray[0]; remainderCoeff >= 10; remainderCoeff /= 10, targetIndex++);
                                    for (remainderCoeff = coeffArray[0] += firstCoeff, firstCoeff = 1; remainderCoeff >= 10; remainderCoeff /= 10, firstCoeff++);
                                    targetIndex != firstCoeff && (bigNum.exponent++, coeffArray[0] == maxSafeDigits && (coeffArray[0] = 1));
                                    break;
                                }
                                if (coeffArray[coeffElement] += firstCoeff, coeffArray[coeffElement] != maxSafeDigits) break;
                                coeffArray[coeffElement--] = 0;
                                firstCoeff = 1;
                            }
                        }
                        // Remove trailing zeros.
                        for (targetIndex = coeffArray.length; targetIndex > 0 && coeffArray[targetIndex - 1] === 0; targetIndex--) {
                            coeffArray.pop();
                        }
                    }
                    // Handle exponents again in case rounding changed magnitude.
                    if (bigNum.exponent > maxRange) {
                        bigNum.coefficients = bigNum.exponent = null;
                    } else if (bigNum.exponent < minRange) {
                        bigNum.coefficients = [bigNum.exponent = 0];
                    }
                    return bigNum;
                }

                /**
                 * Converts a BigNumber to its full string representation (not scientific).
                 * Handles Infinity/NaN and negative signs.
                 * @param {BigNumber} bigNum - The BigNumber instance.
                 * @returns {string} The full string representation.
                 */
                function toFullString(bigNum) {
                    let formattedString,
                        currentExponent = bigNum.exponent;

                    if (bigNum.coefficients === null) {
                        return bigNum.sign ? (formattedString = "Infinity", bigNum.sign < 0 && (formattedString = "-" + formattedString)) : (formattedString = "NaN");
                    }
                    formattedString = formatCoefficientString(bigNum.coefficients);
                    formattedString = currentExponent <= expLowerBound || currentExponent >= expUpperBound
                        ? toScientificNotation(formattedString, currentExponent)
                        : adjustDecimalPoint(formattedString, currentExponent, "0");
                    return bigNum.sign < 0 ? "-" + formattedString : formattedString;
                }

                // --- BigNumberPrototype Methods ---
                prototypeObject.absoluteValue = prototypeObject.abs = function() {
                    let newBigNum = new BigNumberPrototype(this);
                    newBigNum.sign < 0 && (newBigNum.sign = 1);
                    return newBigNum;
                };

                prototypeObject.comparedTo = function(otherValue, otherBase) {
                    return compareBigNumbers(this, new BigNumberPrototype(otherValue, otherBase));
                };

                prototypeObject.decimalPlaces = prototypeObject.dp = function(numDecimals, roundMode) {
                    let coeffArray,
                        totalDecimals,
                        lastCoeff;

                    if (numDecimals != null) {
                        validateRange(numDecimals, 0, altBase);
                        if (roundMode == null) roundMode = roundingMode;
                        validateRange(roundMode, 0, 8);
                        return roundBigNumber(new BigNumberPrototype(this), numDecimals + this.exponent + 1, roundMode);
                    }
                    if (!(coeffArray = this.coefficients)) return null;

                    totalDecimals = ((lastCoeff = coeffArray.length - 1) - truncateNumber(this.exponent / maxSignifDigits)) * maxSignifDigits;
                    lastCoeff = coeffArray[lastCoeff];
                    if (lastCoeff) {
                        while (lastCoeff % 10 == 0) {
                            lastCoeff /= 10;
                            totalDecimals--;
                        }
                    }
                    return totalDecimals < 0 ? 0 : totalDecimals;
                };

                prototypeObject.dividedBy = prototypeObject.div = function(divisorValue, divisorBase) {
                    return divideBigNumbers(this, new BigNumberPrototype(divisorValue, divisorBase), decimalPlaces, roundingMode);
                };

                prototypeObject.dividedToIntegerBy = prototypeObject.idiv = function(divisorValue, divisorBase) {
                    return divideBigNumbers(this, new BigNumberPrototype(divisorValue, divisorBase), 0, 1);
                };

                prototypeObject.exponentiatedBy = prototypeObject.pow = function(exponentVal, moduloVal) {
                    let exponentBigNum = new BigNumberPrototype(exponentVal),
                        tempBigNum,
                        iterationCount,
                        tempResult,
                        isNegativeExponent,
                        isModulusPresent,
                        isOddExponent,
                        currentPowerPrecision = this;

                    // Exponent must be an integer.
                    if (exponentBigNum.coefficients && !exponentBigNum.isInteger()) {
                        throw Error(errorPrefix + "Exponent not an integer: " + toFullString(exponentBigNum));
                    }

                    if (moduloVal != null) {
                        moduloVal = new BigNumberPrototype(moduloVal);
                    }

                    // Handle special cases: 0, 1, NaN, Infinity.
                    if (!currentPowerPrecision.coefficients || !currentPowerPrecision.coefficients[0] ||
                        (currentPowerPrecision.coefficients[0] == 1 && !currentPowerPrecision.exponent && currentPowerPrecision.coefficients.length == 1) ||
                        !exponentBigNum.coefficients || !exponentBigNum.coefficients[0]) {
                        tempResult = new BigNumberPrototype(Math.pow(+toFullString(currentPowerPrecision), exponentBigNum.exponent > 14 ? 2 - isOdd(exponentBigNum) : +toFullString(exponentBigNum)));
                        return moduloVal ? tempResult.mod(moduloVal) : tempResult;
                    }

                    isNegativeExponent = exponentBigNum.sign < 0;
                    isModulusPresent = !!moduloVal;

                    if (isModulusPresent) {
                        // If modulus is present, both base and modulus must be integers (for common use cases).
                        if (moduloVal.coefficients ? !moduloVal.coefficients[0] : !moduloVal.sign) return new BigNumberPrototype(NaN); // Modulus is 0 or NaN.
                        isModulusPresent = !isNegativeExponent && currentPowerPrecision.isInteger() && moduloVal.isInteger();
                        if (isModulusPresent) currentPowerPrecision = currentPowerPrecision.mod(moduloVal);
                    } else {
                        // Without modulus, handle large exponents directly.
                        if (exponentBigNum.exponent > 9 && (currentPowerPrecision.exponent > 0 || currentPowerPrecision.exponent < -1 ||
                            (currentPowerPrecision.exponent == 0 ? currentPowerPrecision.coefficients[0] > 1 || exponentBigNum.exponent > 14 && currentPowerPrecision.coefficients[1] >= 24e7 : currentPowerPrecision.coefficients[0] < 8e13 || exponentBigNum.exponent > 14 && currentPowerPrecision.coefficients[0] <= 9999975e7))) {
                            let infinitySign = currentPowerPrecision.sign < 0 && isOdd(exponentBigNum) ? -0 : 0;
                            currentPowerPrecision.exponent > -1 && (infinitySign = 1 / infinitySign);
                            return new BigNumberPrototype(isNegativeExponent ? 1 / infinitySign : infinitySign);
                        }
                        if (powerPrecision) tempResult = ceilFunc(powerPrecision / maxSignifDigits + 2);
                    }

                    isNegativeExponent
                        ? (tempBigNum = new BigNumberPrototype(.5), exponentBigNum.sign = 1, isOddExponent = isOdd(exponentBigNum))
                        : (isOddExponent = (iterationCount = Math.abs(+toFullString(exponentBigNum))) % 2);

                    tempResult = new BigNumberPrototype(oneBigNumber); // Initialize result to 1.

                    for (;;) {
                        if (isOddExponent) {
                            if (!(tempResult = tempResult.times(currentPowerPrecision)).coefficients) break;
                            if (tempBigNum) {
                                tempResult.coefficients.length > tempBigNum && (tempResult.coefficients.length = tempBigNum);
                            } else if (isModulusPresent) {
                                tempResult = tempResult.mod(moduloVal);
                            }
                        }
                        if (iterationCount) {
                            if (0 === (iterationCount = floorFunc(iterationCount / 2))) break;
                            isOddExponent = iterationCount % 2;
                        } else if (roundBigNumber(exponentBigNum = exponentBigNum.times(tempBigNum), exponentBigNum.exponent + 1, 1), exponentBigNum.exponent > 14) {
                            isOddExponent = isOdd(exponentBigNum);
                        } else {
                            if (0 === (iterationCount = +toFullString(exponentBigNum))) break;
                            isOddExponent = iterationCount % 2;
                        }
                        currentPowerPrecision = currentPowerPrecision.times(currentPowerPrecision);
                        if (tempBigNum) {
                            currentPowerPrecision.coefficients && currentPowerPrecision.coefficients.length > tempBigNum && (currentPowerPrecision.coefficients.length = tempBigNum);
                        } else if (isModulusPresent) {
                            currentPowerPrecision = currentPowerPrecision.mod(moduloVal);
                        }
                    }
                    return isModulusPresent ? tempResult : (isNegativeExponent && (tempResult = oneBigNumber.div(tempResult)), moduloVal ? tempResult.mod(moduloVal) : tempBigNum ? roundBigNumber(tempResult, powerPrecision, roundingMode, undefined) : tempResult);
                };

                prototypeObject.integerValue = function(roundMode) {
                    let newBigNum = new BigNumberPrototype(this);
                    if (roundMode == null) roundMode = roundingMode;
                    validateRange(roundMode, 0, 8);
                    return roundBigNumber(newBigNum, newBigNum.exponent + 1, roundMode);
                };

                prototypeObject.isEqualTo = prototypeObject.eq = function(otherValue, otherBase) {
                    return 0 === compareBigNumbers(this, new BigNumberPrototype(otherValue, otherBase));
                };

                prototypeObject.isFinite = function() {
                    return !!this.coefficients;
                };

                prototypeObject.isGreaterThan = prototypeObject.gt = function(otherValue, otherBase) {
                    return compareBigNumbers(this, new BigNumberPrototype(otherValue, otherBase)) > 0;
                };

                prototypeObject.isGreaterThanOrEqualTo = prototypeObject.gte = function(otherValue, otherBase) {
                    let comparisonResult = compareBigNumbers(this, new BigNumberPrototype(otherValue, otherBase));
                    return 1 === comparisonResult || 0 === comparisonResult;
                };

                prototypeObject.isInteger = function() {
                    return !!this.coefficients && truncateNumber(this.exponent / maxSignifDigits) > this.coefficients.length - 2;
                };

                prototypeObject.isLessThan = prototypeObject.lt = function(otherValue, otherBase) {
                    return compareBigNumbers(this, new BigNumberPrototype(otherValue, otherBase)) < 0;
                };

                prototypeObject.isLessThanOrEqualTo = prototypeObject.lte = function(otherValue, otherBase) {
                    let comparisonResult = compareBigNumbers(this, new BigNumberPrototype(otherValue, otherBase));
                    return -1 === comparisonResult || 0 === comparisonResult;
                };

                prototypeObject.isNaN = function() {
                    return !this.sign;
                };

                prototypeObject.isNegative = function() {
                    return this.sign < 0;
                };

                prototypeObject.isPositive = function() {
                    return this.sign > 0;
                };

                prototypeObject.isZero = function() {
                    return !!this.coefficients && this.coefficients[0] === 0;
                };

                prototypeObject.minus = function(subtrahendValue, subtrahendBase) {
                    let subtrahendBigNum = new BigNumberPrototype(subtrahendValue, subtrahendBase),
                        currentSign = this.sign,
                        subtrahendSign = subtrahendBigNum.sign;

                    // Handle NaN cases.
                    if (!currentSign || !subtrahendSign) return new BigNumberPrototype(NaN);

                    // If signs are different, it's an addition (a - (-b) = a + b).
                    if (currentSign !== subtrahendSign) {
                        subtrahendBigNum.sign = -subtrahendSign;
                        return this.plus(subtrahendBigNum);
                    }

                    let thisExponentScaled = this.exponent / maxSignifDigits,
                        subExponentScaled = subtrahendBigNum.exponent / maxSignifDigits,
                        thisCoefficients = this.coefficients,
                        subCoefficients = subtrahendBigNum.coefficients;

                    // Handle cases with null coefficients (Infinity).
                    if (!thisExponentScaled || !subExponentScaled) {
                        if (!thisCoefficients || !subCoefficients) {
                            return thisCoefficients ? (subtrahendBigNum.sign = -subtrahendSign, subtrahendBigNum) : new BigNumberPrototype(subCoefficients ? this : NaN);
                        }
                        if (!thisCoefficients[0] || !subCoefficients[0]) {
                            return subCoefficients[0] ? (subtrahendBigNum.sign = -subtrahendSign, subtrahendBigNum) : new BigNumberPrototype(thisCoefficients[0] ? this : (roundingMode == 3 ? -0 : 0));
                        }
                    }

                    thisExponentScaled = truncateNumber(thisExponentScaled);
                    subExponentScaled = truncateNumber(subExponentScaled);
                    thisCoefficients = thisCoefficients.slice(); // Clone to avoid modifying original.

                    let exponentDifference = thisExponentScaled - subExponentScaled;
                    if (exponentDifference) {
                        let tempArray;
                        if (exponentDifference < 0) { // If subtrahend has larger exponent.
                            exponentDifference = -exponentDifference;
                            tempArray = thisCoefficients;
                            subExponentScaled = thisExponentScaled;
                        } else { // If this has larger exponent.
                            tempArray = subCoefficients;
                        }
                        tempArray.reverse();
                        while (exponentDifference--) tempArray.push(0); // Pad with zeros.
                        tempArray.reverse();
                    } else {
                        let minLength = (exponentDifference = thisCoefficients.length) < (subtrahendBigNum.coefficients.length) ? exponentDifference : subtrahendBigNum.coefficients.length;
                        for (let i = 0; i < minLength; i++) {
                            if (thisCoefficients[i] !== subCoefficients[i]) {
                                // Determine which number is larger if exponents are equal.
                                exponentDifference = thisCoefficients[i] < subCoefficients[i];
                                break;
                            }
                        }
                    }

                    // If subtrahend is numerically larger, swap and negate the sign.
                    if (exponentDifference) {
                        let tempSwap = thisCoefficients;
                        thisCoefficients = subCoefficients;
                        subCoefficients = tempSwap;
                        subtrahendBigNum.sign = -subtrahendBigNum.sign;
                    }

                    let maxCoeffValue = maxSafeDigits - 1;
                    let numCoeffs = thisCoefficients.length;
                    let subNumCoeffs = subCoefficients.length;

                    // Pad the smaller array with zeros if necessary.
                    if (numCoeffs < subNumCoeffs) {
                        for (let i = numCoeffs; i < subNumCoeffs; i++) thisCoefficients[i] = 0;
                    }

                    // Perform subtraction digit by digit.
                    let carry = 0;
                    while (subNumCoeffs--) {
                        if (thisCoefficients[subNumCoeffs] < subCoefficients[subNumCoeffs]) {
                            for (let i = subNumCoeffs; i && !thisCoefficients[--i]; thisCoefficients[i] = maxCoeffValue);
                            --thisCoefficients[i];
                            thisCoefficients[subNumCoeffs] += maxSafeDigits;
                        }
                        thisCoefficients[subNumCoeffs] -= subCoefficients[subNumCoeffs];
                    }

                    // Remove leading zeros from the result.
                    while (thisCoefficients[0] === 0 && thisCoefficients.length > 1) {
                        thisCoefficients.splice(0, 1);
                        subExponentScaled--;
                    }

                    // If the result is zero, adjust sign based on rounding mode.
                    if (thisCoefficients[0] === 0) {
                        subtrahendBigNum.sign = (roundingMode == 3 ? -1 : 1);
                        subtrahendBigNum.coefficients = [subtrahendBigNum.exponent = 0];
                    } else {
                        setCoefficientsAndExponent(subtrahendBigNum, thisCoefficients, subExponentScaled);
                    }
                    return subtrahendBigNum;
                };

                prototypeObject.modulo = prototypeObject.mod = function(modulusValue, modulusBase) {
                    let modulusBigNum = new BigNumberPrototype(modulusValue, modulusBase),
                        resultBigNum,
                        originalSign = this.sign;

                    // Handle NaN cases.
                    if (!this.coefficients || !modulusBigNum.sign || (modulusBigNum.coefficients && !modulusBigNum.coefficients[0])) {
                        return new BigNumberPrototype(NaN);
                    }
                    // Handle division by zero.
                    if (!modulusBigNum.coefficients || (this.coefficients && !this.coefficients[0])) {
                        return new BigNumberPrototype(this); // Modulo of zero is zero.
                    }

                    // Apply modulo mode.
                    if (moduloMode == 9) { // EUCLID mode.
                        let tempSign = modulusBigNum.sign;
                        modulusBigNum.sign = 1; // Ensure modulus is positive for division.
                        resultBigNum = divideBigNumbers(this, modulusBigNum, 0, 3); // Use FLOOR rounding.
                        modulusBigNum.sign = tempSign; // Restore original sign.
                        resultBigNum.sign *= tempSign;
                    } else {
                        resultBigNum = divideBigNumbers(this, modulusBigNum, 0, moduloMode);
                    }

                    // Calculate remainder: this - (quotient * modulus).
                    let remainder = this.minus(resultBigNum.times(modulusBigNum));

                    // If result is zero in non-EUCLID mode, ensure correct sign.
                    if (remainder.coefficients[0] === 0 && moduloMode == 1) {
                        remainder.sign = originalSign;
                    }
                    return remainder;
                };

                prototypeObject.multipliedBy = prototypeObject.times = function(multiplierValue, multiplierBase) {
                    let multiplierBigNum = new BigNumberPrototype(multiplierValue, multiplierBase),
                        thisCoeffs = this.coefficients,
                        multiplierCoeffs = multiplierBigNum.coefficients;

                    // Handle NaN, Infinity, or Zero.
                    if (!(thisCoeffs && multiplierCoeffs && thisCoeffs[0] && multiplierCoeffs[0])) {
                        let resultBigNum = new BigNumberPrototype(NaN);
                        // If one is NaN, result is NaN. If one is 0 and other is finite, result is 0.
                        if (!this.sign || !multiplierBigNum.sign || (thisCoeffs && !thisCoeffs[0] && !multiplierCoeffs) || (multiplierCoeffs && !multiplierCoeffs[0] && !thisCoeffs)) {
                            resultBigNum.coefficients = resultBigNum.exponent = resultBigNum.sign = null; // NaN.
                        } else {
                            resultBigNum.sign = this.sign * multiplierBigNum.sign;
                            if (thisCoeffs && multiplierCoeffs) { // If both are zero.
                                resultBigNum.coefficients = [0];
                                resultBigNum.exponent = 0;
                            } else { // One is Infinity, other is non-zero.
                                resultBigNum.coefficients = resultBigNum.exponent = null;
                            }
                        }
                        return resultBigNum;
                    }

                    let exponentSum = truncateNumber(this.exponent / maxSignifDigits) + truncateNumber(multiplierBigNum.exponent / maxSignifDigits),
                        thisLength = thisCoeffs.length,
                        multiplierLength = multiplierCoeffs.length;

                    // Ensure thisCoeffs is the longer array for optimization.
                    if (thisLength < multiplierLength) {
                        let tempSwap = thisCoeffs;
                        thisCoeffs = multiplierCoeffs;
                        multiplierCoeffs = tempSwap;
                        let tempLength = thisLength;
                        thisLength = multiplierLength;
                        multiplierLength = tempLength;
                    }

                    let resultCoeffs = [],
                        totalLength = thisLength + multiplierLength;

                    // Initialize resultCoeffs with zeros.
                    for (let i = 0; i < totalLength; i++) resultCoeffs.push(0);

                    multiplierBigNum.sign *= this.sign; // Set final sign.

                    let baseChunk = maxSafeDigits, // The base for internal coefficient calculations (10^14).
                        digitChunk = internalBase; // Base for splitting coefficients (10^7).

                    // Perform multiplication similar to long multiplication.
                    for (let i = multiplierLength; --i >= 0;) {
                        let carry = 0,
                            currentMultiplierDigit = multiplierCoeffs[i] % digitChunk, // Low part of multiplier digit.
                            highMultiplierDigit = floorFunc(multiplierCoeffs[i] / digitChunk), // High part of multiplier digit.
                            resultIndex = i + thisLength;

                        for (let j = thisLength; j > 0;) {
                            let thisLowDigit = thisCoeffs[--j] % digitChunk, // Low part of current digit from thisCoeffs.
                                thisHighDigit = floorFunc(thisCoeffs[j] / digitChunk); // High part of current digit from thisCoeffs.

                            // Calculate product of parts and sum with carry and existing result.
                            carry = ((resultCoeffs[resultIndex] +
                                currentMultiplierDigit * thisLowDigit +
                                (floorFunc(highMultiplierDigit * thisLowDigit + thisHighDigit * currentMultiplierDigit) % digitChunk) * digitChunk +
                                carry) / baseChunk) | 0;

                            resultCoeffs[resultIndex--] = resultCoeffs[resultIndex] % baseChunk;
                        }
                        resultCoeffs[resultIndex] = carry; // Store final carry for this iteration.
                    }

                    // Handle final carry or leading zeros.
                    if (carry) {
                        exponentSum++;
                    } else {
                        resultCoeffs.splice(0, 1); // Remove leading zero.
                    }

                    return setCoefficientsAndExponent(multiplierBigNum, resultCoeffs, exponentSum);
                };

                prototypeObject.negated = function() {
                    let newBigNum = new BigNumberPrototype(this);
                    // Negate the sign, or set to null if already NaN.
                    newBigNum.sign = -newBigNum.sign || null;
                    return newBigNum;
                };

                prototypeObject.plus = function(addendValue, addendBase) {
                    let addendBigNum = new BigNumberPrototype(addendValue, addendBase),
                        currentSign = this.sign,
                        addendSign = addendBigNum.sign;

                    // Handle NaN cases.
                    if (!currentSign || !addendSign) return new BigNumberPrototype(NaN);

                    // If signs are different, it's a subtraction (a + (-b) = a - b).
                    if (currentSign !== addendSign) {
                        addendBigNum.sign = -addendSign;
                        return this.minus(addendBigNum);
                    }

                    let thisExponentScaled = this.exponent / maxSignifDigits,
                        addExponentScaled = addendBigNum.exponent / maxSignifDigits,
                        thisCoefficients = this.coefficients,
                        addCoefficients = addendBigNum.coefficients;

                    // Handle cases with null coefficients (Infinity).
                    if (!thisExponentScaled || !addExponentScaled) {
                        if (!thisCoefficients || !addCoefficients) return new BigNumberPrototype(currentSign / 0); // Infinity + Infinity.
                        if (!thisCoefficients[0] || !addCoefficients[0]) return addCoefficients[0] ? addendBigNum : new BigNumberPrototype(thisCoefficients[0] ? this : 0 * currentSign);
                    }

                    thisExponentScaled = truncateNumber(thisExponentScaled);
                    addExponentScaled = truncateNumber(addExponentScaled);
                    thisCoefficients = thisCoefficients.slice(); // Clone to avoid modifying original.

                    let exponentDifference = thisExponentScaled - addExponentScaled;
                    if (exponentDifference) {
                        let tempArray;
                        if (exponentDifference > 0) { // If this has larger exponent.
                            addExponentScaled = thisExponentScaled;
                            tempArray = addCoefficients;
                        } else { // If addend has larger exponent.
                            exponentDifference = -exponentDifference;
                            tempArray = thisCoefficients;
                        }
                        tempArray.reverse();
                        while (exponentDifference--) tempArray.push(0); // Pad with zeros.
                        tempArray.reverse();
                    }

                    let minLength = thisCoefficients.length,
                        maxLength = addCoefficients.length;

                    // Ensure thisCoefficients is the longer array for iteration.
                    if (minLength < maxLength) {
                        let tempSwap = addCoefficients;
                        addCoefficients = thisCoefficients;
                        thisCoefficients = tempSwap;
                        let tempLength = minLength;
                        minLength = maxLength;
                        maxLength = tempLength;
                    }

                    let carry = 0;
                    // Perform addition digit by digit.
                    for (let i = 0; i < maxLength; i++) {
                        carry = (thisCoefficients[i] = thisCoefficients[i] + addCoefficients[i] + carry) / maxSafeDigits | 0;
                        thisCoefficients[i] %= maxSafeDigits; // Keep within base.
                    }

                    // Handle remaining digits and final carry.
                    while (carry && minLength) {
                        carry = (thisCoefficients[maxLength] = thisCoefficients[maxLength] + carry) / maxSafeDigits | 0;
                        thisCoefficients[maxLength] %= maxSafeDigits;
                        maxLength++;
                    }
                    if (carry) {
                        thisCoefficients = [carry].concat(thisCoefficients);
                        addExponentScaled++;
                    }

                    return setCoefficientsAndExponent(addendBigNum, thisCoefficients, addExponentScaled);
                };

                prototypeObject.precision = prototypeObject.sd = function(numPrecision, roundMode) {
                    let coeffArray,
                        totalPrecision,
                        lastCoeff;

                    if (numPrecision != null && numPrecision !== !!numPrecision) {
                        validateRange(numPrecision, 1, altBase);
                        if (roundMode == null) roundMode = roundingMode;
                        validateRange(roundMode, 0, 8);
                        return roundBigNumber(new BigNumberPrototype(this), numPrecision, roundMode);
                    }
                    if (!(coeffArray = this.coefficients)) return null;

                    totalPrecision = ((lastCoeff = coeffArray.length - 1) * maxSignifDigits) + 1; // Base precision.
                    lastCoeff = coeffArray[lastCoeff];
                    if (lastCoeff) {
                        while (lastCoeff % 10 == 0) {
                            lastCoeff /= 10;
                            totalPrecision--;
                        }
                    }
                    lastCoeff = coeffArray[0];
                    if (lastCoeff) {
                        while (lastCoeff >= 10) {
                            lastCoeff /= 10;
                            totalPrecision++;
                        }
                    }

                    // If numPrecision is true, and the number of digits before the decimal
                    // point is greater than the calculated precision, use that as precision.
                    if (numPrecision && this.exponent + 1 > totalPrecision) {
                        totalPrecision = this.exponent + 1;
                    }
                    return totalPrecision;
                };

                prototypeObject.shiftedBy = function(shiftAmount) {
                    validateRange(shiftAmount, -jsMaxSafeInteger, jsMaxSafeInteger);
                    // Shifting by 'n' is equivalent to multiplying by 10^n.
                    return this.times("1e" + shiftAmount);
                };

                prototypeObject.squareRoot = prototypeObject.sqrt = function() {
                    let resultBigNum,
                        tempResult,
                        thisCoeffs = this.coefficients,
                        thisSign = this.sign,
                        thisExponent = this.exponent,
                        currentPrecision = decimalPlaces + 4, // Extra precision for sqrt.
                        halfBigNum = new BigNumberPrototype("0.5");

                    // Handle cases: negative, NaN, zero.
                    if (thisSign !== 1 || !thisCoeffs || !thisCoeffs[0]) {
                        return new BigNumberPrototype(!thisSign || (thisSign < 0 && (!thisCoeffs || thisCoeffs[0])) ? NaN : thisCoeffs ? this : 1 / 0);
                    }

                    // Initial estimate using JS number.
                    let jsApprox = Math.sqrt(+toFullString(this));
                    if (jsApprox === 0 || jsApprox === 1 / 0) {
                        let coeffsString = formatCoefficientString(thisCoeffs);
                        // Adjust string length for even exponent for square root.
                        if ((coeffsString.length + thisExponent) % 2 == 0) coeffsString += "0";
                        jsApprox = Math.sqrt(+coeffsString);
                        thisExponent = truncateNumber((thisExponent + 1) / 2) - (thisExponent < 0 || thisExponent % 2);
                        tempResult = new BigNumberPrototype(jsApprox == 1 / 0 ? "1e" + thisExponent : (jsApprox = jsApprox.toExponential()).slice(0, jsApprox.indexOf("e") + 1) + thisExponent);
                    } else {
                        tempResult = new BigNumberPrototype(jsApprox + "");
                    }

                    // Newton's method for square root.
                    if (tempResult.coefficients[0]) {
                        // Loop until desired precision is met.
                        let iterCount = (thisExponent = tempResult.exponent) + currentPrecision;
                        if (iterCount < 3) iterCount = 0; // Minimum iterations for small numbers.

                        let prevResultString, currentResultString, checkPrecisionFlag;
                        for (;;) {
                            resultBigNum = tempResult;
                            // tempResult = 0.5 * (resultBigNum + (this / resultBigNum))
                            tempResult = halfBigNum.times(resultBigNum.plus(divideBigNumbers(this, resultBigNum, currentPrecision, 1)));

                            prevResultString = formatCoefficientString(resultBigNum.coefficients).slice(0, iterCount);
                            currentResultString = formatCoefficientString(tempResult.coefficients).slice(0, iterCount);

                            if (prevResultString === currentResultString) {
                                if (tempResult.exponent < thisExponent) iterCount--;
                                // Check for exact match or near match (e.g., "9999" vs "4999").
                                if ("9999" != (currentResultString = currentResultString.slice(iterCount - 3, iterCount + 1)) && (!checkPrecisionFlag || "4999" != currentResultString)) {
                                    // If not near match, check if rounding needed.
                                    if (+currentResultString || (+currentResultString.slice(1) || "5" != currentResultString.charAt(0))) break;
                                }
                                if (!checkPrecisionFlag && (roundBigNumber(resultBigNum, resultBigNum.exponent + decimalPlaces + 2, 0), resultBigNum.times(resultBigNum).eq(this))) {
                                    tempResult = resultBigNum;
                                    break;
                                }
                                currentPrecision += 4;
                                iterCount += 4;
                                checkPrecisionFlag = 1;
                            }
                        }
                    }
                    return roundBigNumber(tempResult, tempResult.exponent + decimalPlaces + 1, roundingMode, checkPrecisionFlag);
                };

                prototypeObject.toExponential = function(numDecimals, roundMode) {
                    if (numDecimals != null) {
                        validateRange(numDecimals, 0, altBase);
                        numDecimals++; // Adjust for toExponential.
                    }
                    return formatToString(this, numDecimals, roundMode, 1);
                };

                prototypeObject.toFixed = function(numDecimals, roundMode) {
                    if (numDecimals != null) {
                        validateRange(numDecimals, 0, altBase);
                        numDecimals = numDecimals + this.exponent + 1; // Adjust for toFixed.
                    }
                    return formatToString(this, numDecimals, roundMode);
                };

                prototypeObject.toFormat = function(numDecimals, roundMode, formatConfig) {
                    let currentBigNum = this;
                    // Handle flexible arguments for formatConfig.
                    if (formatConfig == null) {
                        if (numDecimals != null && roundMode && typeof roundMode === 'object') {
                            formatConfig = roundMode;
                            roundMode = null;
                        } else if (numDecimals && typeof numDecimals === 'object') {
                            formatConfig = numDecimals;
                            numDecimals = roundMode = null;
                        } else {
                            formatConfig = formatSettings;
                        }
                    } else if (typeof formatConfig !== 'object') {
                        throw Error(errorPrefix + "Argument not an object: " + formatConfig);
                    }

                    let formattedString = currentBigNum.toFixed(numDecimals, roundMode);

                    if (currentBigNum.coefficients) {
                        let decimalSplit,
                            groupSize = +formatConfig.groupSize,
                            secondaryGroupSize = +formatConfig.secondaryGroupSize,
                            groupSeparator = formatConfig.groupSeparator || "",
                            integerPart,
                            fractionalPart,
                            isNegative = currentBigNum.sign < 0,
                            absIntegerPart,
                            integerLength;

                        decimalSplit = formattedString.split(".");
                        integerPart = decimalSplit[0];
                        fractionalPart = decimalSplit[1];
                        absIntegerPart = isNegative ? integerPart.slice(1) : integerPart;
                        integerLength = absIntegerPart.length;

                        if (secondaryGroupSize) {
                            let tempGroupSize = groupSize;
                            groupSize = secondaryGroupSize;
                            secondaryGroupSize = tempGroupSize;
                            integerLength -= tempGroupSize;
                        }

                        if (groupSize > 0 && integerLength > 0) {
                            let firstGroupLength = integerLength % groupSize || groupSize;
                            integerPart = absIntegerPart.substr(0, firstGroupLength);
                            while (firstGroupLength < integerLength) {
                                integerPart += groupSeparator + absIntegerPart.substr(firstGroupLength, groupSize);
                                firstGroupLength += groupSize;
                            }
                            secondaryGroupSize > 0 && (integerPart += groupSeparator + absIntegerPart.slice(firstGroupLength));
                            isNegative && (integerPart = "-" + integerPart);
                        }

                        formattedString = fractionalPart
                            ? integerPart + (formatConfig.decimalSeparator || "") +
                            ((secondaryGroupSize = +formatConfig.fractionGroupSize)
                                ? fractionalPart.replace(new RegExp("\\d{" + secondaryGroupSize + "}\\B", "g"), "$&" + (formatConfig.fractionGroupSeparator || ""))
                                : fractionalPart)
                            : integerPart;
                    }
                    return (formatConfig.prefix || "") + formattedString + (formatConfig.suffix || "");
                };

                prototypeObject.toFraction = function(maxDenominator) {
                    let numeratorBigNum,
                        denominatorBigNum,
                        tempDenominator,
                        tempNumerator,
                        currNum,
                        currDen,
                        tempFraction,
                        prevNum,
                        prevDen,
                        tempExponent,
                        currentMaxRange = maxRange,
                        currentMinRange = minRange,
                        absCoeffs;

                    if (maxDenominator != null && (!(tempFraction = new BigNumberPrototype(maxDenominator)).isInteger() && (tempFraction.coefficients || tempFraction.sign !== 1) || tempFraction.lt(oneBigNumber))) {
                        throw Error(errorPrefix + "Argument " + (tempFraction.isInteger() ? "out of range: " : "not an integer: ") + toFullString(tempFraction));
                    }
                    if (!this.coefficients) return new BigNumberPrototype(this);

                    prevNum = new BigNumberPrototype(oneBigNumber);
                    currNum = new BigNumberPrototype(oneBigNumber);
                    prevDen = new BigNumberPrototype(oneBigNumber);
                    currDen = new BigNumberPrototype(oneBigNumber);

                    // Scale the number to an integer by shifting the decimal point.
                    absCoeffs = formatCoefficientString(this.coefficients);
                    tempExponent = prevNum.exponent = absCoeffs.length - this.exponent - 1;
                    prevNum.coefficients[0] = powerOfTens[(currDen = tempExponent % maxSignifDigits) < 0 ? maxSignifDigits + currDen : currDen];

                    // Determine the maximum denominator to search for.
                    maxDenominator = !maxDenominator || tempFraction.comparedTo(prevNum) > 0 ? (tempExponent > 0 ? prevNum : currNum) : tempFraction;

                    // Temporarily increase maxRange to avoid overflow during calculations.
                    maxRange = 1 / 0;
                    minRange = 1 / 0; // Effectively disable minRange.

                    tempFraction = new BigNumberPrototype(absCoeffs);
                    currDen.coefficients[0] = 0; // Initialize currDen to 0.

                    // Continued fraction algorithm.
                    while (true) {
                        tempFraction = divideBigNumbers(tempFraction, prevNum, 0, 1); // Get integer part.
                        // Calculate next fraction approximation.
                        tempNumerator = currNum.plus(tempFraction.times(prevNum));
                        if (tempNumerator.comparedTo(maxDenominator) > 0) break; // If numerator exceeds max, stop.

                        currNum = prevNum;
                        prevNum = tempNumerator;
                        tempDenominator = currDen.plus(tempFraction.times(prevDen));
                        currDen = prevDen;
                        prevDen = tempDenominator;
                        prevNum = prevNum.minus(tempFraction.times(tempFraction));
                        tempFraction = tempFraction; // Update tempFraction.
                    }

                    // Restore original ranges.
                    maxRange = currentMaxRange;
                    minRange = currentMinRange;

                    // Compare the last two approximations to find the best one.
                    let diff1 = divideBigNumbers(prevNum, currNum, tempExponent * 2, roundingMode).minus(this).abs();
                    let diff2 = divideBigNumbers(currDen, prevDen, tempExponent * 2, roundingMode).minus(this).abs();

                    let result = diff1.comparedTo(diff2) < 1 ? [prevNum, currNum] : [currDen, prevDen];
                    result[0].sign = result[1].sign = this.sign; // Apply original sign.
                    return result;
                };

                prototypeObject.toNumber = function() {
                    return +toFullString(this);
                };

                prototypeObject.toPrecision = function(numPrecision, roundMode) {
                    if (numPrecision != null) {
                        validateRange(numPrecision, 1, altBase);
                    }
                    return formatToString(this, numPrecision, roundMode, 2);
                };

                prototypeObject.toString = function(outputBase) {
                    let formattedString,
                        currentBigNum = this,
                        currentSign = currentBigNum.sign,
                        currentExponent = currentBigNum.exponent;

                    // Handle NaN/Infinity.
                    if (currentExponent === null) {
                        formattedString = currentSign ? (formattedString = "Infinity", currentSign < 0 && (formattedString = "-" + formattedString)) : (formattedString = "NaN");
                    } else {
                        if (outputBase == null) {
                            formattedString = currentExponent <= expLowerBound || currentExponent >= expUpperBound
                                ? toScientificNotation(formatCoefficientString(currentBigNum.coefficients), currentExponent)
                                : adjustDecimalPoint(formatCoefficientString(currentBigNum.coefficients), currentExponent, "0");
                        } else if (outputBase === 10) {
                            // Round first for base 10 output.
                            let tempBigNum = roundBigNumber(new BigNumberPrototype(currentBigNum), decimalPlaces + currentExponent + 1, roundingMode);
                            formattedString = adjustDecimalPoint(formatCoefficientString(tempBigNum.coefficients), tempBigNum.exponent, "0");
                        } else {
                            validateRange(outputBase, 2, alphabetChars.length, "Base");
                            // Convert to custom base.
                            formattedString = convertToBase(adjustDecimalPoint(formatCoefficientString(currentBigNum.coefficients), currentExponent, "0"), 10, outputBase, currentSign, true);
                        }
                        currentSign < 0 && currentBigNum.coefficients[0] && (formattedString = "-" + formattedString);
                    }
                    return formattedString;
                };

                prototypeObject.valueOf = prototypeObject.toJSON = function() {
                    return toFullString(this);
                };

                prototypeObject._isBigNumber = true; // Internal flag to identify BigNumber instances.

                // --- Configuration and Utility Methods ---
                /**
                 * Configures global settings for BigNumber.js.
                 * @param {Object} newConfig - An object containing configuration properties.
                 * @returns {Object} The current configuration settings.
                 */
                BigNumberPrototype.config = BigNumberPrototype.set = function(newConfig) {
                    let propKey, propValue;

                    if (newConfig != null) {
                        if (typeof newConfig !== 'object') throw Error(errorPrefix + "Object expected: " + newConfig);

                        if (newConfig.hasOwnProperty(propKey = "DECIMAL_PLACES")) {
                            validateRange(propValue = newConfig[propKey], 0, altBase, propKey);
                            decimalPlaces = propValue;
                        }
                        if (newConfig.hasOwnProperty(propKey = "ROUNDING_MODE")) {
                            validateRange(propValue = newConfig[propKey], 0, 8, propKey);
                            roundingMode = propValue;
                        }
                        if (newConfig.hasOwnProperty(propKey = "EXPONENTIAL_AT")) {
                            propValue = newConfig[propKey];
                            if (propValue && propValue.pop) { // Array format [lower, upper].
                                validateRange(propValue[0], -altBase, 0, propKey);
                                validateRange(propValue[1], 0, altBase, propKey);
                                expLowerBound = propValue[0];
                                expUpperBound = propValue[1];
                            } else { // Single number format.
                                validateRange(propValue, -altBase, altBase, propKey);
                                expLowerBound = -(expUpperBound = propValue < 0 ? -propValue : propValue);
                            }
                        }
                        if (newConfig.hasOwnProperty(propKey = "RANGE")) {
                            propValue = newConfig[propKey];
                            if (propValue && propValue.pop) { // Array format [min, max].
                                validateRange(propValue[0], -altBase, -1, propKey);
                                validateRange(propValue[1], 1, altBase, propKey);
                                minRange = propValue[0];
                                maxRange = propValue[1];
                            } else { // Single number format.
                                validateRange(propValue, -altBase, altBase, propKey);
                                if (!propValue) throw Error(errorPrefix + propKey + " cannot be zero: " + propValue);
                                minRange = -(maxRange = propValue < 0 ? -propValue : propValue);
                            }
                        }
                        if (newConfig.hasOwnProperty(propKey = "CRYPTO")) {
                            propValue = newConfig[propKey];
                            if (propValue !== !!propValue) throw Error(errorPrefix + propKey + " not true or false: " + propValue);
                            if (propValue) {
                                // Check for crypto availability.
                                if (typeof globalScope.crypto === 'undefined' || !globalScope.crypto || (!globalScope.crypto.getRandomValues && !globalScope.crypto.randomBytes)) {
                                    cryptoEnabled = !propValue; // Set to false if not available.
                                    throw Error(errorPrefix + "crypto unavailable");
                                }
                                cryptoEnabled = propValue;
                            } else {
                                cryptoEnabled = propValue;
                            }
                        }
                        if (newConfig.hasOwnProperty(propKey = "MODULO_MODE")) {
                            validateRange(propValue = newConfig[propKey], 0, 9, propKey);
                            moduloMode = propValue;
                        }
                        if (newConfig.hasOwnProperty(propKey = "POW_PRECISION")) {
                            validateRange(propValue = newConfig[propKey], 0, altBase, propKey);
                            powerPrecision = propValue;
                        }
                        if (newConfig.hasOwnProperty(propKey = "FORMAT")) {
                            if (typeof (propValue = newConfig[propKey]) !== 'object') throw Error(errorPrefix + propKey + " not an object: " + propValue);
                            formatSettings = propValue;
                        }
                        if (newConfig.hasOwnProperty(propKey = "ALPHABET")) {
                            if (typeof (propValue = newConfig[propKey]) !== 'string' || /^.$|[+-.\s]|(.).*\1/.test(propValue)) throw Error(errorPrefix + propKey + " invalid: " + propValue);
                            alphabetChars = propValue;
                        }
                    }

                    // Return current configuration.
                    return {
                        DECIMAL_PLACES: decimalPlaces,
                        ROUNDING_MODE: roundingMode,
                        EXPONENTIAL_AT: [expLowerBound, expUpperBound],
                        RANGE: [minRange, maxRange],
                        CRYPTO: cryptoEnabled,
                        MODULO_MODE: moduloMode,
                        POW_PRECISION: powerPrecision,
                        FORMAT: formatSettings,
                        ALPHABET: alphabetChars
                    };
                };

                /**
                 * Checks if a variable is a BigNumber instance.
                 * @param {any} value - The value to check.
                 * @returns {boolean} True if it's a BigNumber, false otherwise.
                 */
                BigNumberPrototype.isBigNumber = function(value) {
                    if (!value || true !== value._isBigNumber) return false;
                    // In DEBUG mode, perform more rigorous internal validation.
                    if (!BigNumberPrototype.DEBUG) return true;

                    let coeffs = value.coefficients,
                        exponent = value.exponent,
                        sign = value.sign;

                    // Validate internal structure.
                    if (Object.prototype.toString.call(coeffs) === "[object Array]") {
                        if ((sign === 1 || sign === -1) && exponent >= -altBase && exponent <= altBase && exponent === floorFunc(exponent)) {
                            if (coeffs[0] === 0) {
                                if (exponent === 0 && coeffs.length === 1) return true;
                            } else {
                                let firstCoeffLength = (exponent + 1) % maxSignifDigits;
                                if (firstCoeffLength < 1) firstCoeffLength += maxSignifDigits;
                                if (String(coeffs[0]).length === firstCoeffLength) {
                                    for (let i = 0; i < coeffs.length; i++) {
                                        let currentCoeff = coeffs[i];
                                        if (currentCoeff < 0 || currentCoeff >= maxSafeDigits || currentCoeff !== floorFunc(currentCoeff)) {
                                            break; // Invalid coefficient.
                                        }
                                    }
                                    if (currentCoeff !== 0) return true; // Valid.
                                }
                            }
                        }
                    } else if (coeffs === null && exponent === null && (sign === null || sign === 1 || sign === -1)) {
                        return true; // Valid NaN/Infinity.
                    }
                    throw Error(errorPrefix + "Invalid BigNumber: " + value);
                };

                BigNumberPrototype.maximum = BigNumberPrototype.max = function() {
                    return findMinMax(arguments, prototypeObject.lt);
                };

                BigNumberPrototype.minimum = BigNumberPrototype.min = function() {
                    return findMinMax(arguments, prototypeObject.gt);
                };

                // Store a reference to a random number generator function.
                let jsRandomFunc = (function() {
                    // Optimized for common JS engines.
                    let initialRandom = 9007199254740992 * Math.random() & 2097151;
                    return initialRandom ?
                        () => floorFunc(9007199254740992 * Math.random()) :
                        () => 8388608 * (1073741824 * Math.random() | 0) + (8388608 * Math.random() | 0);
                })();

                BigNumberPrototype.random = function(numDecimals) {
                    let i,
                        randomNumber,
                        coeffArray = [],
                        coeffCount = 0,
                        resultBigNum = new BigNumberPrototype(oneBigNumber);

                    if (numDecimals == null) numDecimals = decimalPlaces;
                    validateRange(numDecimals, 0, altBase);

                    let requiredCoeffs = ceilFunc(numDecimals / maxSignifDigits);

                    if (cryptoEnabled) {
                        if (globalScope.crypto.getRandomValues) {
                            let uint32Array = new Uint32Array(requiredCoeffs * 2);
                            globalScope.crypto.getRandomValues(uint32Array);
                            while (coeffCount < requiredCoeffs * 2) {
                                randomNumber = 131072 * uint32Array[coeffCount] + (uint32Array[coeffCount + 1] >>> 11);
                                if (randomNumber >= 9e15) { // If random number is too large, regenerate.
                                    globalScope.crypto.getRandomValues(uint32Array = new Uint32Array(2));
                                } else {
                                    coeffArray.push(randomNumber % 1e14);
                                    coeffCount += 2;
                                }
                            }
                            coeffCount = requiredCoeffs;
                        } else if (globalScope.crypto.randomBytes) {
                            let byteBuffer = globalScope.crypto.randomBytes(requiredCoeffs * 7);
                            while (coeffCount < requiredCoeffs * 7) {
                                randomNumber = 281474976710656 * (31 & byteBuffer[coeffCount]) +
                                    1099511627776 * byteBuffer[coeffCount + 1] +
                                    4294967296 * byteBuffer[coeffCount + 2] +
                                    16777216 * byteBuffer[coeffCount + 3] +
                                    (byteBuffer[coeffCount + 4] << 16) +
                                    (byteBuffer[coeffCount + 5] << 8) +
                                    byteBuffer[coeffCount + 6];
                                if (randomNumber >= 9e15) {
                                    globalScope.crypto.randomBytes(7).copy(byteBuffer, coeffCount);
                                } else {
                                    coeffArray.push(randomNumber % 1e14);
                                    coeffCount += 7;
                                }
                            }
                            coeffCount = requiredCoeffs;
                        } else {
                            cryptoEnabled = false; // Disable crypto if not fully supported.
                            throw Error(errorPrefix + "crypto unavailable");
                        }
                    }

                    if (!cryptoEnabled) {
                        while (coeffCount < requiredCoeffs) {
                            randomNumber = jsRandomFunc();
                            if (randomNumber < 9e15) { // Avoid numbers that would exceed 1e14.
                                coeffArray[coeffCount++] = randomNumber % 1e14;
                            }
                        }
                    }

                    // Adjust the last coefficient to fit the exact decimal places.
                    let lastCoeff = coeffArray[--coeffCount];
                    numDecimals %= maxSignifDigits;
                    if (lastCoeff && numDecimals) {
                        randomNumber = powerOfTens[maxSignifDigits - numDecimals];
                        coeffArray[coeffCount] = floorFunc(lastCoeff / randomNumber) * randomNumber;
                    }

                    // Remove trailing zeros.
                    while (coeffCount >= 0 && coeffArray[coeffCount] === 0) {
                        coeffArray.pop();
                        coeffCount--;
                    }

                    // If all coefficients are zero.
                    if (coeffCount < 0) {
                        coeffArray = [randomNumber = 0];
                    } else {
                        randomNumber = -1;
                        // Remove leading zeros and adjust exponent.
                        while (coeffArray[0] === 0 && coeffArray.length > 1) {
                            coeffArray.splice(0, 1);
                            randomNumber -= maxSignifDigits;
                        }
                        // Calculate exponent based on first coefficient's length.
                        let firstCoeffLength = 1;
                        for (let val = coeffArray[0]; val >= 10; val /= 10, firstCoeffLength++);
                        if (firstCoeffLength < maxSignifDigits) randomNumber -= (maxSignifDigits - firstCoeffLength);
                    }

                    resultBigNum.exponent = randomNumber;
                    resultBigNum.coefficients = coeffArray;
                    return resultBigNum;
                };

                BigNumberPrototype.sum = function() {
                    let argumentIndex = 1,
                        argList = arguments,
                        sumResult = new BigNumberPrototype(argList[0]);
                    while (argumentIndex < argList.length) {
                        sumResult = sumResult.plus(argList[argumentIndex++]);
                    }
                    return sumResult;
                };

                // --- Helper functions for base conversion and division (internal to BigNumber.js) ---

                /**
                 * Helper function for converting numbers from an arbitrary base to base 10.
                 * Used internally by BigNumber.js constructor.
                 * @param {string} inputString - The number string in the specified base.
                 * @param {number} inputBase - The base of the input string.
                 * @param {number} outputBase - The target base (usually 10).
                 * @param {number} [sign] - The sign of the number.
                 * @returns {string} The number as a base 10 string.
                 */
                let convertToBase10 = (function() {
                    function calculateCoefficients(numStr, base, targetBase, alphabet) {
                        let resultCoeffs = [0],
                            strLen = 0,
                            strChar,
                            resultLen;

                        for (; strLen < numStr.length;) {
                            for (resultLen = resultCoeffs.length; resultLen--; resultCoeffs[resultLen] *= base); // Multiply all by base.
                            resultCoeffs[0] += alphabet.indexOf(numStr.charAt(strLen++)); // Add current digit.
                            for (resultLen = 0; resultLen < resultCoeffs.length; resultLen++) {
                                if (resultCoeffs[resultLen] > targetBase - 1) {
                                    if (resultCoeffs[resultLen + 1] == null) resultCoeffs[resultLen + 1] = 0;
                                    resultCoeffs[resultLen + 1] += floorFunc(resultCoeffs[resultLen] / targetBase);
                                    resultCoeffs[resultLen] %= targetBase;
                                }
                            }
                        }
                        return resultCoeffs.reverse();
                    }

                    return function(inputString, inputBase, outputBase, currentSign, useAlphabet) {
                        let decimalPointIndex = inputString.indexOf("."),
                            coeffLength,
                            tempExponent,
                            tempRemainder,
                            alphabet = alphabetChars,
                            decimalPlacesConfig = decimalPlaces,
                            roundingModeConfig = roundingMode;

                        if (decimalPointIndex >= 0) { // If there's a decimal point.
                            tempExponent = powerPrecision; // Use powerPrecision for intermediate calculation.
                            powerPrecision = 0; // Temporarily disable powerPrecision.
                            inputString = inputString.replace(".", "");
                            tempRemainder = (new BigNumberPrototype(inputBase)).pow(inputString.length - decimalPointIndex); // Calculate 10^(num_decimal_digits).
                            powerPrecision = tempExponent; // Restore powerPrecision.
                            tempRemainder.coefficients = calculateCoefficients(adjustDecimalPoint(formatCoefficientString(tempRemainder.coefficients), tempRemainder.exponent, "0"), 10, outputBase, "0123456789"); // Convert to outputBase.
                            tempRemainder.exponent = tempRemainder.coefficients.length; // Adjust exponent.
                        }

                        let coeffs = calculateCoefficients(inputString, inputBase, outputBase, useAlphabet ? (tempExponent = alphabet, "0123456789") : (tempExponent = "0123456789", alphabet));

                        // Remove trailing zeros.
                        for (coeffLength = coeffs.length; coeffLength > 0 && coeffs[coeffLength - 1] === 0; coeffs.pop(), coeffLength--);

                        if (!coeffs[0]) return tempExponent.charAt(0); // If result is zero.

                        if (decimalPointIndex < 0) { // If no decimal point.
                            tempExponent = coeffLength - 1; // Exponent is length - 1.
                        } else { // If there was a decimal point.
                            tempRemainder.coefficients = coeffs;
                            tempRemainder.exponent = coeffLength;
                            tempRemainder.sign = currentSign;
                            coeffs = divideBigNumbers(tempRemainder, new BigNumberPrototype(tempRemainder), decimalPlacesConfig, roundingModeConfig, outputBase).coefficients; // Perform division.
                            tempRemainder = tempRemainder.remainder; // Get remainder.
                            tempExponent = tempRemainder.exponent;
                        }

                        // Determine if rounding is needed.
                        let roundUp = (tempRemainder == null ? tempRemainder = roundingModeConfig : tempRemainder < 4 ? (tempRemainder || tempRemainder == (currentSign < 0 ? 3 : 2)) : tempRemainder > outputBase / 2 || tempRemainder == outputBase / 2 && (roundingModeConfig == 4 || tempRemainder || roundingModeConfig == 6 && 1 & coeffs[coeffLength - 1] || roundingModeConfig == (currentSign < 0 ? 8 : 7)));

                        if (coeffLength < 1 || !coeffs[0]) { // If result is very small or zero.
                            inputString = roundUp ? adjustDecimalPoint(tempExponent.charAt(1), -decimalPlacesConfig, tempExponent.charAt(0)) : tempExponent.charAt(0);
                        } else {
                            if (coeffs.length = coeffLength, roundUp) {
                                for (--outputBase; coeffs[--coeffLength] > outputBase;) {
                                    coeffs[coeffLength] = 0;
                                    coeffLength || (tempExponent++, coeffs = [1].concat(coeffs));
                                }
                                coeffs[coeffLength]++;
                            }
                            // Convert coefficients back to string using alphabet.
                            for (coeffLength = coeffs.length; coeffLength > 0 && coeffs[coeffLength - 1] === 0; coeffLength--);
                            for (decimalPointIndex = 0, inputString = ""; decimalPointIndex < coeffLength; inputString += tempExponent.charAt(coeffs[decimalPointIndex++]));
                            inputString = adjustDecimalPoint(inputString, tempExponent, tempExponent.charAt(0));
                        }
                        return inputString;
                    };
                })();

                /**
                 * Internal division function for BigNumber.js.
                 * This is a complex long-division algorithm for arbitrary-precision numbers.
                 * @param {BigNumber} dividend - The dividend.
                 * @param {BigNumber} divisor - The divisor.
                 * @param {number} decimalPlacesCount - Number of decimal places for the result.
                 * @param {number} roundMode - Rounding mode.
                 * @param {number} [base] - The base for internal calculations (default maxSafeDigits).
                 * @returns {BigNumber} The quotient BigNumber.
                 */
                let divideBigNumbers = (function() {
                    function multiplyCoefficients(coeffArray, multiplier, base) {
                        let i, j, tempProduct, carry = 0,
                            len = coeffArray.length,
                            lowPart = multiplier % internalBase,
                            highPart = floorFunc(multiplier / internalBase);

                        coeffArray = coeffArray.slice(); // Clone array.
                        while (len--) {
                            carry = ((tempProduct = lowPart * (coeffArray[len] % internalBase) +
                                (j = highPart * (coeffArray[len] % internalBase) + (i = floorFunc(coeffArray[len] / internalBase) * lowPart) % internalBase * internalBase + carry) / base | 0) +
                                floorFunc(j / internalBase) + highPart * i) % base;
                            coeffArray[len] = tempProduct % base;
                        }
                        return carry && [carry].concat(coeffArray) || coeffArray;
                    }

                    function compareCoefficientArrays(arr1, arr2, len1, len2) {
                        let i, comparisonResult;
                        if (len1 != len2) {
                            comparisonResult = len1 > len2 ? 1 : -1;
                        } else {
                            for (i = comparisonResult = 0; i < len1; i++) {
                                if (arr1[i] != arr2[i]) {
                                    comparisonResult = arr1[i] > arr2[i] ? 1 : -1;
                                    break;
                                }
                            }
                        }
                        return comparisonResult;
                    }

                    function subtractCoefficients(targetArray, subtrahendArray, len, base) {
                        let i = 0;
                        while (len--) {
                            targetArray[len] -= i;
                            i = targetArray[len] < subtrahendArray[len] ? 1 : 0;
                            targetArray[len] = i * base + targetArray[len] - subtrahendArray[len];
                        }
                        // Remove leading zeros.
                        while (targetArray.length > 1 && !targetArray[0]) {
                            targetArray.splice(0, 1);
                        }
                    }

                    return function(dividend, divisor, dpCount, currentRoundMode, base) {
                        let dividendSign = dividend.sign == divisor.sign ? 1 : -1,
                            dividendCoeffs = dividend.coefficients,
                            divisorCoeffs = divisor.coefficients;

                        // Handle NaN, Infinity, or Zero.
                        if (!(dividendCoeffs && dividendCoeffs[0] && divisorCoeffs && divisorCoeffs[0])) {
                            let resultBigNum = new BigNumberPrototype(NaN);
                            // If dividend is 0, result is 0. If divisor is 0, result is Infinity or NaN.
                            if (dividend.sign && divisor.sign && (dividendCoeffs ? !divisorCoeffs[0] : divisorCoeffs) ? (dividendCoeffs && dividendCoeffs[0] || !divisorCoeffs ? 0 * dividendSign : dividendSign / 0) : NaN) {
                                // If both are 0, it's NaN. If one is 0 and other is finite non-zero, it's 0.
                                // If one is Infinity and other is finite, it's Infinity.
                                // This logic is simplified for Type III.
                            }
                            return resultBigNum;
                        }

                        let quotientCoeffs = (divisor = new BigNumberPrototype(dividendSign)).coefficients = [],
                            exponentDiff = dividend.exponent - divisor.exponent;

                        // If base is not provided, use maxSafeDigits.
                        base = base || maxSafeDigits;
                        exponentDiff = truncateNumber(dividend.exponent / maxSignifDigits) - truncateNumber(divisor.exponent / maxSignifDigits);
                        dpCount = dpCount + exponentDiff + 1; // Total number of coefficients to compute.

                        // If dpCount is negative, result is 0.
                        if (dpCount < 0) {
                            quotientCoeffs.push(1); // Set to 1, then round to 0.
                            dividendSign = true; // Flag for rounding.
                        } else {
                            // Find first non-matching coefficient.
                            let i = 0;
                            while (i < divisorCoeffs.length && divisorCoeffs[i] == (dividendCoeffs[i] || 0)) i++;
                            // If divisor is greater than dividend, decrement exponent difference.
                            if (divisorCoeffs[i] > (dividendCoeffs[i] || 0)) exponentDiff--;

                            dpCount += 2; // Add extra precision for rounding.
                            let dividendLen = dividendCoeffs.length,
                                divisorLen = divisorCoeffs.length,
                                dividendPart = dividendCoeffs.slice(0, divisorLen), // Initial part of dividend.
                                initialDividendLen = dividendPart.length;

                            // Pad initialDividendPart with zeros if needed.
                            while (initialDividendLen < divisorLen) dividendPart[initialDividendLen++] = 0;

                            let tempDivisorCoeffs = divisorCoeffs.slice(),
                                tempDivisorCoeffsPadded = [0].concat(tempDivisorCoeffs), // Divisor with leading zero.
                                firstDivisorCoeff = divisorCoeffs[0];

                            // Optimization: if firstDivisorCoeff is small, scale up.
                            if ((dividendSign = floorFunc(base / (firstDivisorCoeff + 1))) > 1) {
                                tempDivisorCoeffs = multiplyCoefficients(tempDivisorCoeffs, dividendSign, base);
                                dividendPart = multiplyCoefficients(dividendPart, dividendSign, base);
                                divisorLen = tempDivisorCoeffs.length;
                                dividendLen = dividendPart.length;
                            }

                            firstDivisorCoeff = tempDivisorCoeffs[0];

                            // Long division loop.
                            do {
                                let quotientDigit = 0;
                                // Compare current dividend part with divisor.
                                let comparisonResult = compareCoefficientArrays(tempDivisorCoeffs, dividendPart, divisorLen, dividendLen);

                                if (comparisonResult < 0) {
                                    let currentDividendPart0 = dividendPart[0];
                                    if (divisorLen != dividendLen) {
                                        currentDividendPart0 = currentDividendPart0 * base + (dividendPart[1] || 0);
                                    }
                                    quotientDigit = floorFunc(currentDividendPart0 / firstDivisorCoeff);

                                    // Adjust quotientDigit if it's too large or too small.
                                    if (quotientDigit >= base) quotientDigit = base - 1;
                                    let tempProductCoeffs = multiplyCoefficients(tempDivisorCoeffs, quotientDigit, base);
                                    let tempProductLen = tempProductCoeffs.length;

                                    while (compareCoefficientArrays(tempProductCoeffs, dividendPart, tempProductLen, dividendLen) == 1) {
                                        quotientDigit--;
                                        subtractCoefficients(tempProductCoeffs, (divisorLen < tempProductLen ? tempDivisorCoeffsPadded : tempDivisorCoeffs), tempProductLen, base); // Subtract divisor (or padded divisor).
                                        tempProductLen = tempProductCoeffs.length;
                                    }

                                } else if (comparisonResult === 0) {
                                    quotientDigit++;
                                    dividendPart = [0]; // Set remainder to zero.
                                } else {
                                    // dividendPart is smaller than divisor, quotientDigit is 0.
                                }

                                quotientCoeffs.push(quotientDigit); // Add quotient digit to result.

                                // Update dividendPart (remainder from this step).
                                if (dividendPart[0]) {
                                    dividendPart[dividendLen++] = dividendCoeffs[i] || 0; // Bring down next digit.
                                } else {
                                    dividendPart = [dividendCoeffs[i]];
                                    dividendLen = 1;
                                }

                            } while ((i++ < dividendCoeffs.length || dividendPart[0] != null) && dpCount-- > 0);

                            dividendSign = dividendPart[0] != null; // Flag if there's a remainder.
                            quotientCoeffs[0] || quotientCoeffs.splice(0, 1); // Remove leading zero if any.
                        }

                        // Set the final coefficients and exponent, applying rounding.
                        return roundBigNumber(divisor, exponentDiff + (divisor.exponent = dpCount * maxSignifDigits), currentRoundMode, dividendSign);
                    };
                })();

                // --- Base conversion helper for `toString(base)` ---
                function convertToBase(numString, inputBase, outputBase, sign, useAlphabet) {
                    let coeffs,
                        strLen,
                        resultString,
                        resultLen,
                        tempAlphabet = alphabetChars; // Default alphabet.

                    let convertCoeffs = function(numStr, base, targetBase, alphabet) {
                        let res = [0],
                            idx = 0;
                        while (idx < numStr.length) {
                            let charValue = alphabet.indexOf(numStr.charAt(idx++));
                            for (let i = 0; i < res.length; i++) {
                                res[i] *= base;
                            }
                            res[0] += charValue;
                            for (let i = 0; i < res.length; i++) {
                                if (res[i] >= targetBase) {
                                    if (res[i + 1] == null) res[i + 1] = 0;
                                    res[i + 1] += floorFunc(res[i] / targetBase);
                                    res[i] %= targetBase;
                                }
                            }
                        }
                        return res.reverse();
                    };

                    coeffs = convertCoeffs(numString, inputBase, outputBase, useAlphabet ? tempAlphabet : "0123456789");

                    // Remove trailing zeros.
                    for (strLen = coeffs.length; strLen > 0 && coeffs[strLen - 1] === 0; coeffs.pop(), strLen--);

                    if (!coeffs[0]) return tempAlphabet.charAt(0); // If result is zero.

                    // Convert coefficients to string using the target alphabet.
                    for (strLen = 1, resultString = ""; strLen <= coeffs.length; resultString += tempAlphabet.charAt(coeffs[strLen - 1]), strLen++);

                    return resultString;
                }

                // If a config object was passed to the IIFE, apply it.
                if (configObject != null) BigNumberPrototype.set(configObject);

                BigNumberPrototype.ROUND_UP = 0;
                BigNumberPrototype.ROUND_DOWN = 1;
                BigNumberPrototype.ROUND_CEIL = 2;
                BigNumberPrototype.ROUND_FLOOR = 3;
                BigNumberPrototype.ROUND_HALF_UP = 4;
                BigNumberPrototype.ROUND_HALF_DOWN = 5;
                BigNumberPrototype.ROUND_HALF_EVEN = 6;
                BigNumberPrototype.ROUND_HALF_CEIL = 7;
                BigNumberPrototype.ROUND_HALF_FLOOR = 8;
                BigNumberPrototype.EUCLID = 9;

                return BigNumberPrototype;
            })().default = BigNumberFactory = BigNumberFactory;

            // Check for module environment and export.
            if (typeof moduleExportValue === 'undefined' && typeof currentModule !== 'undefined' && currentModule.exports) {
                moduleExportValue = BigNumberFactory;
                currentModule.exports = moduleExportValue;
            } else {
                globalObjectRef.BigNumber = BigNumberFactory;
            }

        })(globalScope);
    }
]));