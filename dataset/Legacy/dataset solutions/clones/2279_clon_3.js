(function(moduleDefinitions) {
    /**
     * Custom Module Loading System
     * Mimics a simplified Webpack runtime for module management.
     * @param {Object.<string, Function>} moduleDefinitions - An object mapping module paths to their definition functions.
     */

    // Cache for already loaded modules
    let runtimeModuleCache = {};

    /**
     * Requires a module by its identifier.
     * @param {string} moduleIdentifier - The unique identifier for the module (usually its path).
     * @returns {any} The exports of the required module.
     */
    function runtimeRequire(moduleIdentifier) {
        // Check if the module is already in the cache
        if (runtimeModuleCache[moduleIdentifier]) {
            return runtimeModuleCache[moduleIdentifier].output;
        }

        // Create a new module object and add it to the cache
        let currentModule = runtimeModuleCache[moduleIdentifier] = {
            id: moduleIdentifier,     // Module identifier
            isLoaded: false,          // Flag to track loading status
            output: {}                // The module's exports object
        };

        // Execute the module's definition function, providing standard CommonJS variables
        moduleDefinitions[moduleIdentifier].call(
            currentModule.output,       // `this` context for the module function
            currentModule,              // `module` object
            currentModule.output,       // `exports` object
            runtimeRequire              // The `require` function itself
        );

        // Mark the module as fully loaded
        currentModule.isLoaded = true;
        return currentModule.output;
    }

    // Expose the module definitions for introspection (similar to `__webpack_modules__`)
    runtimeRequire.allModuleDefs = moduleDefinitions;

    // Expose the module cache (similar to `__webpack_module_cache__`)
    runtimeRequire.loadedModuleCache = runtimeModuleCache;

    /**
     * Defines a getter function for ECMAScript module exports (harmony exports).
     * @param {Object} exportObject - The object to define the property on.
     * @param {string} propertyName - The name of the property to define.
     * @param {Function} propertyGetter - The getter function for the property.
     */
    runtimeRequire.setupExportGetter = function(exportObject, propertyName, propertyGetter) {
        // Only define if the property doesn't already exist
        if (!Object.prototype.hasOwnProperty.call(exportObject, propertyName)) {
            Object.defineProperty(exportObject, propertyName, {
                enumerable: true, // Make it enumerable for `for...in` loops
                get: propertyGetter // The function to call when the property is accessed
            });
        }
    };

    /**
     * Marks an exports object as an ECMAScript module.
     * @param {Object} exportObject - The object to mark.
     */
    runtimeRequire.tagAsESModule = function(exportObject) {
        // Add `Symbol.toStringTag` for better `Object.prototype.toString` representation
        if (typeof Symbol !== 'undefined' && Symbol.toStringTag) {
            Object.defineProperty(exportObject, Symbol.toStringTag, { value: 'Module' });
        }
        // Set `__esModule` flag to true, indicating it's an ES module
        Object.defineProperty(exportObject, '__esModule', { value: true });
    };

    /**
     * Creates a fake namespace object for compatibility with various module modes.
     * @param {any} value - The module's value or ID.
     * @param {number} modeFlags - Bitmask indicating module processing modes.
     * @returns {Object} A namespace object.
     */
    runtimeRequire.createModuleNamespace = function(value, modeFlags) {
        // Mode & 1: value is a module ID, require it
        if (modeFlags & 1) value = runtimeRequire(value);
        // Mode & 8: behave like require, return value directly
        if (modeFlags & 8) return value;
        // Mode & 4: return value if it's already an ES module namespace object
        if ((modeFlags & 4) && typeof value === 'object' && value && value.__esModule) return value;

        // Create a new namespace object
        let namespaceObject = Object.create(null);
        runtimeRequire.tagAsESModule(namespaceObject); // Mark as ES module
        // Define 'default' export
        Object.defineProperty(namespaceObject, 'default', { enumerable: true, value: value });
        // Mode & 2: merge all properties of value into the namespace (if value is not a string)
        if (modeFlags & 2 && typeof value != 'string') {
            for (let propKey in value) {
                // Define getters for each property, binding `propKey`
                runtimeRequire.setupExportGetter(namespaceObject, propKey, ((key) => value[key]).bind(null, propKey));
            }
        }
        return namespaceObject;
    };

    /**
     * Provides a getter for the default export, useful for compatibility with non-harmony modules.
     * @param {Object} moduleInstance - The module object.
     * @returns {Function} A getter function for the default export.
     */
    runtimeRequire.obtainDefaultExport = function(moduleInstance) {
        let defaultExportGetter = moduleInstance && moduleInstance.__esModule ?
            () => moduleInstance['default'] : // If it's an ES module, use its 'default'
            () => moduleInstance;            // Otherwise, the module itself is the default
        runtimeRequire.setupExportGetter(defaultExportGetter, 'a', defaultExportGetter); // Expose as 'a' for convention
        return defaultExportGetter;
    };

    /**
     * Checks if an object has a specific property, using `Object.prototype.hasOwnProperty.call`.
     * @param {Object} targetObject - The object to check.
     * @param {string} propertyName - The name of the property.
     * @returns {boolean} True if the object has the property.
     */
    runtimeRequire.hasOwnProp = function(targetObject, propertyName) {
        return Object.prototype.hasOwnProperty.call(targetObject, propertyName);
    };

    // Public path for assets (similar to `__webpack_public_path__`)
    runtimeRequire.publicAssetPath = "";


    // Load the entry module and return its exports to kick off the application.
    // The entry point is defined here, simulating `__webpack_require__.s = "./src/ABC150/B.js"`.
    return runtimeRequire(runtimeRequire.entryModule = "./application/problem_solver/SolverB.js");

})
/************************************************************************/
({
    // Module Definitions
    // Each entry represents a module, identified by its path.
    // The function associated with each path is the module's content.

    "./application/problem_solver/SolverB.js":
    /*!***********************************************!*\
      !*** ./application/problem_solver/SolverB.js ***!
      \***********************************************/
    (function(currentModule, moduleExports, moduleRequire) {
        "use strict";
        // Mark this module as an ECMAScript module
        moduleRequire.tagAsESModule(moduleExports);

        // Import necessary modules using CommonJS `require` syntax
        const fileSystemAccess = moduleRequire("fs");
        const appHelpers = moduleRequire("./application/utilities/AppHelpers.js");

        // Destructure specific helper functions with new names
        const { getLines: extractInputLines, parseNumbers: interpretLineNumbers } = appHelpers;

        /**
         * Main function to solve the problem for ABC150/B.
         * Counts occurrences of the "ABC" pattern in a given string.
         * @param {string} rawInputString - The complete input received from standard input.
         */
        const executeSolution = (rawInputString) => {
            // Split the raw input into an array of lines
            const inputLinesArray = extractInputLines(rawInputString);

            // The string to search is expected on the second line (index 1)
            const targetSequence = inputLinesArray[1];

            // Define the pattern we are looking for
            const searchPattern = "ABC";
            const patternLength = searchPattern.length;

            // Initialize a counter for the pattern occurrences
            let foundCount = 0;

            // Edge case: if the target string is shorter than the pattern, it can't contain it.
            if (targetSequence.length < patternLength) {
                console.log(0);
                return;
            }

            // Iterate through the target sequence to find occurrences of the pattern
            // The loop runs until there are enough characters left to form the pattern
            for (let currentIdx = 0; currentIdx <= targetSequence.length - patternLength; currentIdx++) {
                // Extract a substring of the current window size
                const currentWindow = targetSequence.substring(currentIdx, currentIdx + patternLength);

                // Check if the extracted substring matches the search pattern
                if (currentWindow === searchPattern) {
                    foundCount++; // Increment the counter if a match is found
                }
            }

            // Output the final count to standard output
            console.log(foundCount);
        };

        // Entry point for execution: read from /dev/stdin and pass to the solver
        try {
            const stdinContent = fileSystemAccess.readFileSync('/dev/stdin', 'utf8');
            executeSolution(stdinContent);
        } catch (err) {
            console.error("An error occurred during input reading or processing:", err.message);
            // In a real application, more sophisticated error handling might be needed.
            // For competitive programming, this is often sufficient.
        }
    }),

    "./node_modules/webpack/buildin/module.js":
    /*!***********************************!*\
      !*** (webpack)/buildin/module.js ***!
      \***********************************/
    (function(currentModule, moduleExports) {
        // This is a webpack internal module. Its content is typically generated.
        // For Type III cloning, we can simplify or just rename variables within its scope.
        // The core functionality is to polyfill `module` object properties if not present.

        currentModule.exports = function(moduleReference) {
            // If the module reference doesn't have webpackPolyfill (meaning it's not already processed by webpack's internal logic)
            if (!moduleReference.webpackPolyfill) {
                moduleReference.deprecate = function() {}; // Stub out deprecate function
                moduleReference.paths = []; // Initialize paths array
                // module.parent is undefined by default, no need to set
                if (!moduleReference.children) moduleReference.children = []; // Ensure children array exists
                // Define `loaded` property as a getter for `module.l`
                Object.defineProperty(moduleReference, "loaded", {
                    enumerable: true,
                    get: function() {
                        return moduleReference.isLoaded; // Renamed from `l` to `isLoaded`
                    }
                });
                // Define `id` property as a getter for `module.i`
                Object.defineProperty(moduleReference, "id", {
                    enumerable: true,
                    get: function() {
                        return moduleReference.id; // Renamed from `i` to `id`
                    }
                });
                moduleReference.webpackPolyfill = 1; // Mark as polyfilled
            }
            return moduleReference;
        };
    }),

    "./application/utilities/AppHelpers.js":
    /*!*********************************************!*\
      !*** ./application/utilities/AppHelpers.js ***!
      \*********************************************/
    (function(currentModule, moduleExports, moduleRequire) {
        // Import the custom large number library
        const customLargeNumber = moduleRequire("./application/core_math/LargeNumberEngine.js");

        // Constants used throughout the application, renamed for clarity
        const POSITIVE_INFINITY_THRESHOLD = 1001001001; // A large integer used as a practical infinity
        const PRIME_MODULO_VALUE = Math.pow(10, 9) + 7; // A common prime modulus for competitive programming

        /**
         * Splits a multi-line input string into an array of individual lines.
         * @param {string} entireInputString - The raw input string, potentially containing multiple lines.
         * @returns {string[]} An array where each element is a line from the input.
         */
        const getLines = (entireInputString) => entireInputString.split('\n');

        /**
         * Parses a space-separated string of numeric values into an array of numbers.
         * @param {string} lineToParse - A string containing numbers separated by spaces.
         * @returns {number[]} An array of parsed JavaScript numbers.
         */
        const parseNumbers = (lineToParse) => lineToParse.split(' ').map((numStr) => Number(numStr));

        /**
         * Filters an array to return only unique elements.
         * @param {Array<any>} originalArray - The input array that may contain duplicate elements.
         * @returns {Array<any>} A new array containing only the unique elements from the input.
         */
        const getUniqueItems = (originalArray) => {
            // Using a Set is an efficient way to find unique elements
            return Array.from(new Set(originalArray));
        };

        /**
         * Calculates the number of permutations P(n, r) = n! / (n-r)!.
         * @param {number} totalElements - The total number of distinct items (n).
         * @param {number} chooseElements - The number of items to choose and arrange (r).
         * @returns {number} The permutation count. Returns 0 if input is invalid.
         */
        const calculatePermutationCount = (totalElements, chooseElements) => {
            let resultAccumulator = 1;

            // Input validation: r must be non-negative and not exceed n
            if (chooseElements < 0 || chooseElements > totalElements) {
                console.warn(`Invalid input for permutation: P(${totalElements}, ${chooseElements}). Returning 0.`);
                return 0;
            }

            // Calculate n * (n-1) * ... * (n-r+1)
            for (let k = 0; k < chooseElements; k++) {
                resultAccumulator = resultAccumulator * (totalElements - k);
            }
            return resultAccumulator;
        };

        /**
         * Calculates the number of combinations C(n, r) = n! / (r! * (n-r)!).
         * @param {number} totalElements - The total number of distinct items (n).
         * @param {number} chooseElements - The number of items to choose (r).
         * @returns {number} The combination count. Returns 0 if input is invalid.
         */
        const calculateCombinationCount = (totalElements, chooseElements) => {
            // C(n, r) = P(n, r) / P(r, r)
            // Handle edge cases for chooseElements
            if (chooseElements < 0 || chooseElements > totalElements) return 0;
            if (chooseElements === 0 || chooseElements === totalElements) return 1;

            // Optimization: C(n, r) = C(n, n-r)
            if (chooseElements > totalElements / 2) {
                chooseElements = totalElements - chooseElements;
            }

            const permN = calculatePermutationCount(totalElements, chooseElements);
            const permR = calculatePermutationCount(chooseElements, chooseElements);

            // Avoid division by zero, though permR should be 1 for chooseElements=0, handled above.
            if (permR === 0) {
                console.error(`Error: Division by zero in combination calculation for C(${totalElements}, ${chooseElements}).`);
                return 0; // Should ideally not happen with checks above
            }
            return permN / permR;
        };

        /**
         * Computes (base^exponent) % modulus using modular exponentiation (binary exponentiation).
         * This is an efficient algorithm for large exponents.
         * @param {number} baseValue - The base number.
         * @param {number} exponentValue - The exponent.
         * @returns {number} The result of (baseValue ^ exponentValue) % PRIME_MODULO_VALUE.
         */
        const computeModularPower = (baseValue, exponentValue) => {
            let currentBase = baseValue % PRIME_MODULO_VALUE;
            if (exponentValue === 0) return 1; // x^0 = 1
            if (exponentValue < 0) {
                // For negative exponents, calculate modular inverse of base^(abs(exponent))
                // This requires Fermat's Little Theorem for prime moduli.
                // Not typically used in standard competitive programming modular power.
                console.warn("Negative exponents in modular power not fully supported for all cases. Assuming positive exponent for this context.");
                return 0; // Or throw error, depending on desired behavior
            }
            if (exponentValue % 2 === 1) { // If exponent is odd
                return (currentBase * computeModularPower(currentBase, exponentValue - 1)) % PRIME_MODULO_VALUE;
            } else { // If exponent is even
                const halfPowerResult = computeModularPower(currentBase, exponentValue / 2);
                return (halfPowerResult * halfPowerResult) % PRIME_MODULO_VALUE;
            }
        };

        /**
         * Calculates modular combinations C(n, k) % MODULO_CONST.
         * Uses Fermat's Little Theorem for modular inverse.
         * @param {number} n - Total items.
         * @param {number} k - Items to choose.
         * @returns {number} C(n, k) modulo PRIME_MODULO_VALUE.
         */
        const calculateModularCombinations = (n, k) => {
            if (k < 0 || k > n) return 0;
            if (k === 0 || k === n) return 1;
            if (k > n / 2) k = n - k; // Optimization

            let numeratorProduct = 1;
            let denominatorProduct = 1;

            // Calculate n * (n-1) * ... * (n-k+1)
            for (let i = 0; i < k; i++) {
                numeratorProduct = (numeratorProduct * (n - i)) % PRIME_MODULO_VALUE;
            }

            // Calculate k!
            for (let i = 1; i <= k; i++) {
                denominatorProduct = (denominatorProduct * i) % PRIME_MODULO_VALUE;
            }

            // Compute modular inverse of denominator using Fermat's Little Theorem (a^(p-2) % p)
            const inverseDenominator = computeModularPower(denominatorProduct, PRIME_MODULO_VALUE - 2);

            // Result is (numerator * inverseDenominator) % PRIME_MODULO_VALUE
            return (numeratorProduct * inverseDenominator) % PRIME_MODULO_VALUE;
        };

        /**
         * Computes (valueX * valueN) % modulus using the custom large number library
         * to handle potential intermediate overflows before the final modulo.
         * @param {number} valueX - The first operand.
         * @param {number} valueN - The second operand.
         * @param {number} modulusValue - The modulus.
         * @returns {number} The result of (valueX * valueN) % modulusValue as a native JavaScript number.
         */
        const getModularProduct = (valueX, valueN, modulusValue) => {
            // Convert native numbers to custom large numbers to ensure precision during multiplication
            const bigX = customLargeNumber(valueX);
            const bigN = customLargeNumber(valueN);
            const bigMod = customLargeNumber(modulusValue);

            // Perform the multiplication and then the modulo operation using the library's methods
            // Finally, convert the remainder back to a native JavaScript number
            return bigX.times(bigN).getRemainder(bigMod).toNativeNumber();
        };

        // Export utility functions with their new names
        currentModule.exports = {
            THRESHOLD_INF: POSITIVE_INFINITY_THRESHOLD,
            DEFAULT_PRIME_MODULO: PRIME_MODULO_VALUE,
            getLines: getLines,
            parseNumbers: parseNumbers,
            getUniqueItems: getUniqueItems,
            calculatePermutationCount: calculatePermutationCount,
            calculateCombinationCount: calculateCombinationCount,
            computeModularPower: computeModularPower,
            calculateModularCombinations: calculateModularCombinations,
            getModularProduct: getModularProduct
        };
    }),

    "./application/core_math/LargeNumberEngine.js":
    /*!****************************************************!*\
      !*** ./application/core_math/LargeNumberEngine.js ***!
      \****************************************************/
    (function(currentModule, moduleExports, moduleRequire) {
        // This module defines a custom implementation for handling arbitrarily large integers,
        // exceeding JavaScript's standard `Number.MAX_SAFE_INTEGER`.
        // It provides arithmetic operations, comparisons, and utility functions for BigInt-like behavior.

        (function (externalUndefined) { // Use 'externalUndefined' to ensure 'undefined' is truly undefined
            "use strict"; // Enforce strict JavaScript mode

            // --- Core Configuration Constants ---
            const DIGIT_CHUNK_BASE = 1e7; // Each array element (chunk) stores numbers up to 10^7
            const LOG10_DIGIT_CHUNK_BASE = 7; // Log base 10 of DIGIT_CHUNK_BASE
            const JS_MAX_SAFE_INTEGER = 9007199254740992; // 2^53, the maximum safe integer in JavaScript
            // Pre-calculated chunk representation for JS_MAX_SAFE_INTEGER for internal comparisons
            const MAX_SAFE_INT_CHUNKS_REP = splitNumberIntoDigitChunks(JS_MAX_SAFE_INTEGER);
            const DEFAULT_NUMERAL_ALPHABET = "0123456789abcdefghijklmnopqrstuvwxyz"; // Standard characters for base conversion

            // Feature detection: Check if native BigInt is supported in the current environment
            const isNativeBigIntSupported = typeof BigInt === "function";

            /**
             * Factory function: Main entry point for creating LargeNumber instances.
             * This function intelligently dispatches to the appropriate constructor
             * (MultiDigitNumber, SingleDigitNumber, or PlatformBigInt) based on input.
             * @param {any} inputValue - The value to convert (number, string, BigInt, or another LargeNumber).
             * @param {number} [inputBase] - Optional base for string parsing.
             * @param {string} [customAlphabet] - Optional custom alphabet for base conversion.
             * @param {boolean} [isCaseSensitiveParsing] - Optional flag for case sensitivity in base parsing.
             * @returns {AbstractLargeNumber} An instance representing the large number.
             */
            function LargeNumberConstructor(inputValue, inputBase, customAlphabet, isCaseSensitiveParsing) {
                // If no value is provided, return the cached zero instance for efficiency
                if (typeof inputValue === "undefined") return LargeNumberConstructor._precomputed[0];
                // If a base is specified, parse the value according to that base
                if (typeof inputBase !== "undefined") {
                    // Optimize for base 10 parsing without a custom alphabet
                    return +inputBase === 10 && !customAlphabet ? parseAnyInputToLargeNumber(inputValue) : parseInputStringWithBase(inputValue, inputBase, customAlphabet, isCaseSensitiveParsing);
                }
                // Otherwise, parse the value directly without a specific base
                return parseAnyInputToLargeNumber(inputValue);
            }

            /**
             * Abstract base prototype for all large number types.
             * Contains common methods or properties that all large number types should inherit or implement.
             */
            function AbstractLargeNumber() {}

            /**
             * Represents a large integer that exceeds JavaScript's safe integer limits.
             * Stored as an array of 'chunks', where each chunk is a part of the number.
             * @param {number[]} digitChunks - An array of numbers, each representing a 'chunk' of the large integer.
             * @param {boolean} isNegativeFlag - True if the number is negative, false otherwise.
             */
            function MultiDigitNumber(digitChunks, isNegativeFlag) {
                this.digitChunks = digitChunks;
                this.isNegativeFlag = isNegativeFlag;
                this.isSmallNumber = false; // Flag indicating it's not a small integer
            }
            MultiDigitNumber.prototype = Object.create(AbstractLargeNumber.prototype);

            /**
             * Represents an integer that can be precisely stored within a standard JavaScript `number` type.
             * @param {number} numericValue - The integer value.
             */
            function SingleDigitNumber(numericValue) {
                this.value = numericValue;
                this.isNegativeFlag = numericValue < 0;
                this.isSmallNumber = true; // Flag indicating it is a small integer
            }
            SingleDigitNumber.prototype = Object.create(AbstractLargeNumber.prototype);

            /**
             * Represents a large integer using the native JavaScript `BigInt` type.
             * This class acts as a wrapper, leveraging native BigInt capabilities when available.
             * @param {BigInt} nativeBigIntValue - The native BigInt value.
             */
            function PlatformBigIntWrapper(nativeBigIntValue) {
                this.value = nativeBigIntValue;
            }
            PlatformBigIntWrapper.prototype = Object.create(AbstractLargeNumber.prototype);

            /**
             * Checks if a given number can be precisely represented by JavaScript's `number` type.
             * @param {number} num - The number to check.
             * @returns {boolean} True if the number is within the safe integer range (2^53 to -2^53).
             */
            function isWithinSafeJSRange(num) {
                return -JS_MAX_SAFE_INTEGER < num && num < JS_MAX_SAFE_INTEGER;
            }

            /**
             * Converts a JavaScript number into an array of digit chunks.
             * This function is optimized for specific chunk sizes (1e7, 1e14) to be fast.
             * @param {number} num - The number to convert into chunks.
             * @returns {number[]} An array of number chunks.
             */
            function splitNumberIntoDigitChunks(num) {
                // The magic numbers (1e7, 1e14) are directly related to DIGIT_CHUNK_BASE.
                if (num < 1e7) return [num];
                if (num < 1e14) return [num % 1e7, Math.floor(num / 1e7)];
                return [num % 1e7, Math.floor(num / 1e7) % 1e7, Math.floor(num / 1e14)];
            }

            /**
             * Attempts to combine an array of digit chunks back into a single JavaScript number.
             * Returns the original array if it's too large to fit in a safe JavaScript number.
             * @param {number[]} chunkArray - The array of number chunks to combine.
             * @returns {number | number[]} The combined number or the original array if it's too large.
             */
            function combineDigitChunksToSmallNumber(chunkArray) {
                removeLeadingZeroChunks(chunkArray); // Clean up the array by removing leading zeros
                const numberOfChunks = chunkArray.length;

                // Check if the number of chunks is small and its magnitude fits within JS_MAX_SAFE_INTEGER
                if (numberOfChunks < 4 && compareAbsoluteChunkArrays(chunkArray, MAX_SAFE_INT_CHUNKS_REP) < 0) {
                    switch (numberOfChunks) {
                        case 0: return 0;
                        case 1: return chunkArray[0];
                        case 2: return chunkArray[0] + chunkArray[1] * DIGIT_CHUNK_BASE;
                        case 3: return chunkArray[0] + (chunkArray[1] + chunkArray[2] * DIGIT_CHUNK_BASE) * DIGIT_CHUNK_BASE;
                    }
                }
                return chunkArray; // Return as an array if it represents a truly large number
            }

            /**
             * Trims an array of digit chunks by removing any leading (most significant) zero chunks.
             * This maintains canonical representation and reduces memory usage.
             * @param {number[]} chunkArray - The array of digit chunks to trim.
             */
            function removeLeadingZeroChunks(chunkArray) {
                let currentIdx = chunkArray.length;
                while (currentIdx > 0 && chunkArray[--currentIdx] === 0); // Find the last non-zero chunk
                chunkArray.length = currentIdx + 1; // Resize the array to exclude leading zeros
            }

            /**
             * Creates a new array of a specified length, initialized with zero values.
             * @param {number} desiredLength - The desired length of the new array.
             * @returns {number[]} An array filled with zeros.
             */
            function initializeZeroFilledArray(desiredLength) {
                // `Array.prototype.fill(0)` is an efficient way to create a zero-filled array.
                return new Array(desiredLength).fill(0);
            }

            /**
             * Truncates a floating-point number towards zero.
             * Equivalent to `Math.floor()` for positive numbers and `Math.ceil()` for negative numbers.
             * @param {number} num - The number to truncate.
             * @returns {number} The truncated integer.
             */
            function truncateNumberTowardsZero(num) {
                return num > 0 ? Math.floor(num) : Math.ceil(num);
            }

            /**
             * Performs addition of two chunk arrays (representing large numbers).
             * Assumes `arrayA` is longer than or equal in length to `arrayB` for simpler iteration.
             * @param {number[]} arrayA - The first chunk array (minuend).
             * @param {number[]} arrayB - The second chunk array (subtrahend).
             * @returns {number[]} The resulting chunk array from the addition.
             */
            function performChunkArrayAddition(arrayA, arrayB) {
                const lenA = arrayA.length;
                const lenB = arrayB.length;
                const resultChunks = new Array(lenA); // Result array can be at most lenA + 1
                let carry = 0;
                let currentChunkSum;

                // Add chunks as long as both arrays have elements
                for (let i = 0; i < lenB; i++) {
                    currentChunkSum = arrayA[i] + arrayB[i] + carry;
                    carry = currentChunkSum >= DIGIT_CHUNK_BASE ? 1 : 0;
                    resultChunks[i] = currentChunkSum - carry * DIGIT_CHUNK_BASE;
                }

                // Propagate carry through the remaining chunks of the longer array (arrayA)
                for (let i = lenB; i < lenA; i++) {
                    currentChunkSum = arrayA[i] + carry;
                    carry = currentChunkSum === DIGIT_CHUNK_BASE ? 1 : 0;
                    resultChunks[i] = currentChunkSum - carry * DIGIT_CHUNK_BASE;
                }

                // If there's a final carry, append it as a new most significant chunk
                if (carry > 0) resultChunks.push(carry);
                return resultChunks;
            }

            /**
             * Flexible addition of two chunk arrays, ensuring the longer array is processed first.
             * @param {number[]} arrayX - First chunk array.
             * @param {number[]} arrayY - Second chunk array.
             * @returns {number[]} The resulting chunk array from addition.
             */
            function flexibleChunkArrayAdd(arrayX, arrayY) {
                return arrayX.length >= arrayY.length ? performChunkArrayAddition(arrayX, arrayY) : performChunkArrayAddition(arrayY, arrayX);
            }

            /**
             * Adds a small integer (which acts as a carry or initial value) to a chunk array.
             * @param {number[]} chunkArray - The array of digit chunks.
             * @param {number} smallValue - The small integer to add (0 <= smallValue < JS_MAX_SAFE_INTEGER).
             * @returns {number[]} The resulting chunk array after addition.
             */
            function addSmallIntToChunkArray(chunkArray, smallValue) {
                const len = chunkArray.length;
                const result = new Array(len);
                let currentCarry = smallValue; // Start with the small value as initial carry
                let currentSum;

                for (let i = 0; i < len; i++) {
                    currentSum = chunkArray[i] + currentCarry;
                    currentCarry = truncateNumberTowardsZero(currentSum / DIGIT_CHUNK_BASE);
                    result[i] = currentSum - currentCarry * DIGIT_CHUNK_BASE;
                }

                // Propagate any remaining carry until it becomes zero
                while (currentCarry > 0) {
                    result.push(currentCarry % DIGIT_CHUNK_BASE);
                    currentCarry = truncateNumberTowardsZero(currentCarry / DIGIT_CHUNK_BASE);
                }
                return result;
            }

            // --- Addition Methods for LargeNumber Types ---

            MultiDigitNumber.prototype.add = function (otherValue) {
                const otherNumber = parseAnyInputToLargeNumber(otherValue);
                // If signs are different, convert to subtraction: A + (-B) = A - B
                if (this.isNegativeFlag !== otherNumber.isNegativeFlag) {
                    return this.subtract(otherNumber.flipSign());
                }
                const currentChunks = this.digitChunks;
                const otherChunks = otherNumber.digitChunks;

                if (otherNumber.isSmallNumber) {
                    // If the other number is a small integer, add its absolute value to our chunks
                    return new MultiDigitNumber(addSmallIntToChunkArray(currentChunks, Math.abs(otherNumber.value)), this.isNegativeFlag);
                }
                // If both are MultiDigitNumbers (or other is Small but converted to chunks), perform chunk array addition
                return new MultiDigitNumber(flexibleChunkArrayAdd(currentChunks, otherChunks), this.isNegativeFlag);
            };
            MultiDigitNumber.prototype.plus = MultiDigitNumber.prototype.add; // Alias for 'plus'

            SingleDigitNumber.prototype.add = function (otherValue) {
                const otherNumber = parseAnyInputToLargeNumber(otherValue);
                const currentNumericVal = this.value;

                // If signs are different, convert to subtraction
                if ((currentNumericVal < 0) !== otherNumber.isNegativeFlag) {
                    return this.subtract(otherNumber.flipSign());
                }
                const otherNumericValRaw = otherNumber.value;
                if (otherNumber.isSmallNumber) {
                    // If both are small integers, try direct addition
                    if (isWithinSafeJSRange(currentNumericVal + otherNumericValRaw)) return new SingleDigitNumber(currentNumericVal + otherNumericValRaw);
                    // If direct addition overflows, convert other small number to chunks and add
                    const otherAbsChunks = splitNumberIntoDigitChunks(Math.abs(otherNumericValRaw));
                    return new MultiDigitNumber(addSmallIntToChunkArray(otherAbsChunks, Math.abs(currentNumericVal)), currentNumericVal < 0);
                }
                // If one is small and the other is MultiDigitNumber, add small to the MultiDigitNumber's chunks
                return new MultiDigitNumber(addSmallIntToChunkArray(otherNumber.digitChunks, Math.abs(currentNumericVal)), currentNumericVal < 0);
            };
            SingleDigitNumber.prototype.plus = SingleDigitNumber.prototype.add; // Alias for 'plus'

            PlatformBigIntWrapper.prototype.add = function (otherValue) {
                // Leverage native BigInt addition
                return new PlatformBigIntWrapper(this.value + parseAnyInputToLargeNumber(otherValue).value);
            };
            PlatformBigIntWrapper.prototype.plus = PlatformBigIntWrapper.prototype.add; // Alias for 'plus'


            /**
             * Performs subtraction of two chunk arrays (arrayA - arrayB).
             * Assumes `arrayA` is greater than or equal to `arrayB` in magnitude.
             * @param {number[]} arrayA - The minuend chunk array.
             * @param {number[]} arrayB - The subtrahend chunk array.
             * @returns {number[]} The resulting chunk array from subtraction.
             */
            function performChunkArraySubtraction(arrayA, arrayB) {
                const lenA = arrayA.length;
                const lenB = arrayB.length;
                const result = new Array(lenA);
                let borrow = 0;
                let currentDifference;

                // Subtract chunks as long as both arrays have elements
                for (let i = 0; i < lenB; i++) {
                    currentDifference = arrayA[i] - borrow - arrayB[i];
                    if (currentDifference < 0) {
                        currentDifference += DIGIT_CHUNK_BASE;
                        borrow = 1; // A borrow occurred
                    } else {
                        borrow = 0; // No borrow
                    }
                    result[i] = currentDifference;
                }

                // Propagate borrow through the remaining chunks of arrayA
                for (let i = lenB; i < lenA; i++) {
                    currentDifference = arrayA[i] - borrow;
                    if (currentDifference < 0) {
                        currentDifference += DIGIT_CHUNK_BASE;
                        // borrow remains 1 for the next iteration
                    } else {
                        result[i++] = currentDifference; // If no borrow, assign and break early
                        break;
                    }
                    result[i] = currentDifference;
                }
                // Copy any remaining chunks from arrayA if no more borrows are needed
                for (; i < lenA; i++) {
                    result[i] = arrayA[i];
                }
                removeLeadingZeroChunks(result); // Clean up the result array
                return result;
            }

            /**
             * Flexible subtraction of two chunk arrays, handling magnitude comparison and result sign.
             * @param {number[]} arrayX - First chunk array.
             * @param {number[]} arrayY - Second chunk array.
             * @param {boolean} originalSignX - The original sign of the first operand (arrayX).
             * @returns {MultiDigitNumber | SingleDigitNumber} The result of the subtraction.
             */
            function flexibleChunkArraySubtract(arrayX, arrayY, originalSignX) {
                let finalChunkResult;
                let finalSign = originalSignX;
                // Compare absolute values to determine which array represents a larger magnitude
                if (compareAbsoluteChunkArrays(arrayX, arrayY) >= 0) {
                    finalChunkResult = performChunkArraySubtraction(arrayX, arrayY);
                } else {
                    finalChunkResult = performChunkArraySubtraction(arrayY, arrayX);
                    finalSign = !originalSignX; // Flip the sign if (Y - X) was performed
                }
                // Attempt to convert the chunk result back to a small integer if possible
                const combinedResult = combineDigitChunksToSmallNumber(finalChunkResult);

                if (typeof combinedResult === "number") {
                    if (finalSign) return new SingleDigitNumber(-combinedResult); // Apply negative sign
                    return new SingleDigitNumber(combinedResult);
                }
                return new MultiDigitNumber(combinedResult, finalSign);
            }

            /**
             * Subtracts a small integer from a chunk array.
             * @param {number[]} chunkArray - The minuend chunk array.
             * @param {number} smallSubtrahend - The small integer to subtract (0 <= smallSubtrahend < JS_MAX_SAFE_INTEGER).
             * @param {boolean} currentSign - The original sign of the chunk array.
             * @returns {MultiDigitNumber | SingleDigitNumber} The result of the subtraction.
             */
            function subtractSmallIntFromChunkArray(chunkArray, smallSubtrahend, currentSign) {
                const len = chunkArray.length;
                const result = new Array(len);
                let currentBorrow = -smallSubtrahend; // Start with the negative subtrahend as initial borrow
                let currentDifference;

                for (let i = 0; i < len; i++) {
                    currentDifference = chunkArray[i] + currentBorrow;
                    currentBorrow = truncateNumberTowardsZero(currentDifference / DIGIT_CHUNK_BASE);
                    currentDifference %= DIGIT_CHUNK_BASE;
                    // Ensure the difference is positive (within [0, DIGIT_CHUNK_BASE-1])
                    result[i] = currentDifference < 0 ? currentDifference + DIGIT_CHUNK_BASE : currentDifference;
                }
                const combinedResult = combineDigitChunksToSmallNumber(result);

                if (typeof combinedResult === "number") {
                    // If the result fits a small number, apply its sign
                    if (currentSign) return new SingleDigitNumber(-combinedResult);
                    return new SingleDigitNumber(combinedResult);
                }
                return new MultiDigitNumber(combinedResult, currentSign);
            }

            // --- Subtraction Methods for LargeNumber Types ---

            MultiDigitNumber.prototype.subtract = function (otherValue) {
                const otherNumber = parseAnyInputToLargeNumber(otherValue);
                // If signs are different, convert to addition: A - (-B) = A + B
                if (this.isNegativeFlag !== otherNumber.isNegativeFlag) {
                    return this.add(otherNumber.flipSign());
                }
                const currentChunks = this.digitChunks;
                const otherChunks = otherNumber.digitChunks;

                if (otherNumber.isSmallNumber) {
                    // If the other number is a small integer, subtract its absolute value from our chunks
                    return subtractSmallIntFromChunkArray(currentChunks, Math.abs(otherNumber.value), this.isNegativeFlag);
                }
                // If both are MultiDigitNumbers, perform flexible chunk array subtraction
                return flexibleChunkArraySubtract(currentChunks, otherChunks, this.isNegativeFlag);
            };
            MultiDigitNumber.prototype.minus = MultiDigitNumber.prototype.subtract; // Alias for 'minus'

            SingleDigitNumber.prototype.subtract = function (otherValue) {
                const otherNumber = parseAnyInputToLargeNumber(otherValue);
                const currentNumericVal = this.value;

                // If signs are different, convert to addition
                if ((currentNumericVal < 0) !== otherNumber.isNegativeFlag) {
                    return this.add(otherNumber.flipSign());
                }
                const otherNumericValRaw = otherNumber.value;
                if (otherNumber.isSmallNumber) {
                    // If both are small integers, perform direct subtraction
                    return new SingleDigitNumber(currentNumericVal - otherNumericValRaw);
                }
                // One is small, the other is MultiDigitNumber.
                // We are calculating `currentNumericVal - otherNumber`.
                // This is equivalent to `-(otherNumber - currentNumericVal)`.
                // So, we calculate `otherNumber.digitChunks - abs(currentNumericVal)` and then flip the sign.
                const absCurrentChunks = splitNumberIntoDigitChunks(Math.abs(currentNumericVal));
                const tempResult = flexibleChunkArraySubtract(otherNumber.digitChunks, absCurrentChunks, otherNumber.isNegativeFlag);
                // The result of `flexibleChunkArraySubtract` is (other - current) with its correct sign.
                // We want `current - other`, so we need to flip the sign of (other - current).
                return tempResult.flipSign();
            };
            SingleDigitNumber.prototype.minus = SingleDigitNumber.prototype.subtract; // Alias for 'minus'

            PlatformBigIntWrapper.prototype.subtract = function (otherValue) {
                // Leverage native BigInt subtraction
                return new PlatformBigIntWrapper(this.value - parseAnyInputToLargeNumber(otherValue).value);
            };
            PlatformBigIntWrapper.prototype.minus = PlatformBigIntWrapper.prototype.subtract; // Alias for 'minus'

            // --- Sign Manipulation Methods ---

            MultiDigitNumber.prototype.flipSign = function () {
                return new MultiDigitNumber(this.digitChunks, !this.isNegativeFlag); // Simply toggle the sign flag
            };
            SingleDigitNumber.prototype.flipSign = function () {
                const currentSign = this.isNegativeFlag;
                const newSmallNum = new SingleDigitNumber(-this.value); // Invert the numeric value
                newSmallNum.isNegativeFlag = !currentSign; // Explicitly set the sign flag
                return newSmallNum;
            };
            PlatformBigIntWrapper.prototype.flipSign = function () {
                return new PlatformBigIntWrapper(-this.value); // Use native BigInt negation
            };

            // --- Absolute Value Methods ---

            MultiDigitNumber.prototype.absoluteValue = function () {
                return new MultiDigitNumber(this.digitChunks, false); // A MultiDigitNumber's absolute value is always positive
            };
            SingleDigitNumber.prototype.absoluteValue = function () {
                return new SingleDigitNumber(Math.abs(this.value)); // Use native Math.abs for small integers
            };
            PlatformBigIntWrapper.prototype.absoluteValue = function () {
                return new PlatformBigIntWrapper(this.value >= 0 ? this.value : -this.value); // Use native BigInt ternary for abs
            };

            /**
             * Performs long multiplication of two chunk arrays.
             * This is the standard grade-school multiplication algorithm.
             * @param {number[]} arrayA - First chunk array.
             * @param {number[]} arrayB - Second chunk array.
             * @returns {number[]} The resulting chunk array from multiplication.
             */
            function longMultiplication(arrayA, arrayB) {
                const lenA = arrayA.length;
                const lenB = arrayB.length;
                // The product can have at most (lenA + lenB) chunks
                const result = initializeZeroFilledArray(lenA + lenB);
                let currentProduct, currentCarry;

                for (let i = 0; i < lenA; ++i) {
                    const chunkA = arrayA[i];
                    for (let j = 0; j < lenB; ++j) {
                        const chunkB = arrayB[j];
                        // Calculate product of current chunks and add to existing sum at result[i+j]
                        currentProduct = chunkA * chunkB + result[i + j];
                        currentCarry = truncateNumberTowardsZero(currentProduct / DIGIT_CHUNK_BASE);
                        result[i + j] = currentProduct - currentCarry * DIGIT_CHUNK_BASE;
                        result[i + j + 1] += currentCarry; // Add carry to the next position
                    }
                }
                removeLeadingZeroChunks(result); // Clean up the result
                return result;
            }

            /**
             * Multiplies a chunk array by a small integer.
             * @param {number[]} chunkArray - The chunk array to multiply.
             * @param {number} smallMultiplier - The small integer multiplier (|smallMultiplier| < DIGIT_CHUNK_BASE).
             * @returns {number[]} The resulting chunk array.
             */
            function multiplyChunkArrayBySmallInt(chunkArray, smallMultiplier) {
                const len = chunkArray.length;
                const result = new Array(len);
                let currentCarry = 0;
                let currentProduct;

                for (let i = 0; i < len; i++) {
                    currentProduct = chunkArray[i] * smallMultiplier + currentCarry;
                    currentCarry = truncateNumberTowardsZero(currentProduct / DIGIT_CHUNK_BASE);
                    result[i] = currentProduct - currentCarry * DIGIT_CHUNK_BASE;
                }

                // Propagate any remaining carry
                while (currentCarry > 0) {
                    result.push(currentCarry % DIGIT_CHUNK_BASE);
                    currentCarry = truncateNumberTowardsZero(currentCarry / DIGIT_CHUNK_BASE);
                }
                return result;
            }

            /**
             * Shifts a chunk array left by padding with zeros.
             * This is equivalent to multiplying by a power of `DIGIT_CHUNK_BASE`.
             * @param {number[]} chunks - The array of chunks to shift.
             * @param {number} numZeros - The number of zeros (chunks) to append to the right.
             * @returns {number[]} The new, shifted array.
             */
            function prependZerosToChunks(chunks, numZeros) {
                const zeroPadding = initializeZeroFilledArray(numZeros);
                return zeroPadding.concat(chunks);
            }

            /**
             * Implements the Karatsuba multiplication algorithm for two chunk arrays.
             * This algorithm is asymptotically faster than long multiplication for very large numbers.
             * @param {number[]} xChunks - First chunk array.
             * @param {number[]} yChunks - Second chunk array.
             * @returns {number[]} The resulting chunk array from the product.
             */
            function karatsubaProduct(xChunks, yChunks) {
                const maxLength = Math.max(xChunks.length, yChunks.length);

                // Fallback to long multiplication for smaller arrays, where Karatsuba overhead is too high
                if (maxLength <= 30) return longMultiplication(xChunks, yChunks);

                // Determine the split point for dividing the numbers into halves
                const splitIndex = Math.ceil(maxLength / 2);

                // Split the numbers into high (b, d) and low (a, c) parts
                const b_high = xChunks.slice(splitIndex);
                const a_low = xChunks.slice(0, splitIndex);
                const d_high = yChunks.slice(splitIndex);
                const c_low = yChunks.slice(0, splitIndex);

                // Recursively compute three products
                const product_ac = karatsubaProduct(a_low, c_low);
                const product_bd = karatsubaProduct(b_high, d_high);
                const sum_ab_cd = karatsubaProduct(flexibleChunkArrayAdd(a_low, b_high), flexibleChunkArrayAdd(c_low, d_high));

                // Compute the middle term: (a+b)(c+d) - ac - bd
                // The `flexibleChunkArraySubtract` needs a sign parameter, which is 'false' here for intermediate absolute values
                const middleTerm = flexibleChunkArraySubtract(flexibleChunkArraySubtract(sum_ab_cd, product_ac, false), product_bd, false).digitChunks;

                // Combine the results using shifts
                // Product = ac + (ad+bc)*Base^splitIndex + bd*Base^(2*splitIndex)
                const finalProduct = flexibleChunkArrayAdd(
                    flexibleChunkArrayAdd(product_ac, prependZerosToChunks(middleTerm, splitIndex)),
                    prependZerosToChunks(product_bd, 2 * splitIndex)
                );
                removeLeadingZeroChunks(finalProduct); // Clean up
                return finalProduct;
            }

            /**
             * Heuristic function to decide whether to use Karatsuba multiplication or standard long multiplication.
             * Karatsuba is only faster for certain array sizes due to its overhead.
             * @param {number} length1 - Length of the first chunk array.
             * @param {number} length2 - Length of the second chunk array.
             * @returns {boolean} True if Karatsuba is likely to be faster.
             */
            function shouldApplyKaratsuba(length1, length2) {
                // This formula is empirically derived from performance profiling in the original library.
                return -0.012 * length1 - 0.012 * length2 + 0.000015 * length1 * length2 > 0;
            }

            // --- Multiplication Methods for LargeNumber Types ---

            MultiDigitNumber.prototype.multiply = function (otherValue) {
                const otherNumber = parseAnyInputToLargeNumber(otherValue);
                const currentChunks = this.digitChunks;
                const otherChunks = otherNumber.digitChunks;
                const resultSign = this.isNegativeFlag !== otherNumber.isNegativeFlag; // XOR for sign determination

                // Handle multiplication by special small numbers (0, 1, -1) for efficiency
                if (otherNumber.isSmallNumber) {
                    const smallVal = otherNumber.value;
                    if (smallVal === 0) return LargeNumberConstructor._precomputed[0];
                    if (smallVal === 1) return this;
                    if (smallVal === -1) return this.flipSign();
                    const absSmallVal = Math.abs(smallVal);
                    if (absSmallVal < DIGIT_CHUNK_BASE) {
                        return new MultiDigitNumber(multiplyChunkArrayBySmallInt(currentChunks, absSmallVal), resultSign);
                    }
                    // If smallVal is larger than a single chunk, convert it to chunks and use long multiplication
                    return new MultiDigitNumber(longMultiplication(currentChunks, splitNumberIntoDigitChunks(absSmallVal)), resultSign);
                }

                // Choose between Karatsuba and long multiplication based on heuristic
                if (shouldApplyKaratsuba(currentChunks.length, otherChunks.length)) {
                    return new MultiDigitNumber(karatsubaProduct(currentChunks, otherChunks), resultSign);
                }
                return new MultiDigitNumber(longMultiplication(currentChunks, otherChunks), resultSign);
            };
            MultiDigitNumber.prototype.times = MultiDigitNumber.prototype.multiply; // Alias for 'times'

            /**
             * Helper function for multiplying a small number by a chunk array.
             * @param {number} smallNumber - The small integer (must be >= 0).
             * @param {number[]} chunkArray - The chunk array to multiply.
             * @param {boolean} finalSign - The sign of the final result.
             * @returns {MultiDigitNumber} The product as a MultiDigitNumber.
             */
            function multiplySmallIntAndChunkedArray(smallNumber, chunkArray, finalSign) {
                if (smallNumber < DIGIT_CHUNK_BASE) {
                    return new MultiDigitNumber(multiplyChunkArrayBySmallInt(chunkArray, smallNumber), finalSign);
                }
                return new MultiDigitNumber(longMultiplication(chunkArray, splitNumberIntoDigitChunks(smallNumber)), finalSign);
            }

            SingleDigitNumber.prototype._internalMultiplyBySmall = function (otherSmallNumber) {
                // If both operands are small integers, try direct multiplication
                if (isWithinSafeJSRange(otherSmallNumber.value * this.value)) {
                    return new SingleDigitNumber(otherSmallNumber.value * this.value);
                }
                // If direct multiplication overflows, convert to chunk-based multiplication
                const absOtherVal = Math.abs(otherSmallNumber.value);
                const absThisChunks = splitNumberIntoDigitChunks(Math.abs(this.value));
                return multiplySmallIntAndChunkedArray(absOtherVal, absThisChunks, this.isNegativeFlag !== otherSmallNumber.isNegativeFlag);
            };
            MultiDigitNumber.prototype._internalMultiplyBySmall = function (otherSmallNumber) {
                // Handle special cases for 0, 1, -1 for MultiDigitNumber multiplied by a SmallInteger
                if (otherSmallNumber.value === 0) return LargeNumberConstructor._precomputed[0];
                if (otherSmallNumber.value === 1) return this;
                if (otherSmallNumber.value === -1) return this.flipSign();
                // Otherwise, perform chunk-based multiplication
                return multiplySmallIntAndChunkedArray(Math.abs(otherSmallNumber.value), this.digitChunks, this.isNegativeFlag !== otherSmallNumber.isNegativeFlag);
            };
            SingleDigitNumber.prototype.multiply = function (otherValue) {
                // Delegate to the internal helper, parsing the other value first
                return parseAnyInputToLargeNumber(otherValue)._internalMultiplyBySmall(this);
            };
            SingleDigitNumber.prototype.times = SingleDigitNumber.prototype.multiply; // Alias for 'times'

            PlatformBigIntWrapper.prototype.multiply = function (otherValue) {
                // Leverage native BigInt multiplication
                return new PlatformBigIntWrapper(this.value * parseAnyInputToLargeNumber(otherValue).value);
            };
            PlatformBigIntWrapper.prototype.times = PlatformBigIntWrapper.prototype.multiply; // Alias for 'times'

            /**
             * Calculates the square of a chunk array (number * number).
             * @param {number[]} arr - The chunk array to square.
             * @returns {number[]} The squared chunk array.
             */
            function computeSquareOfChunkArray(arr) {
                const len = arr.length;
                // The square can have at most 2 * len chunks
                const result = initializeZeroFilledArray(2 * len);
                let currentProduct, currentCarry;

                for (let i = 0; i < len; i++) {
                    const arr_i = arr[i];
                    currentCarry = 0; // Reset carry for each outer loop iteration
                    // Calculate 2 * a[i] * a[j] for j > i, and a[i]^2 for j == i
                    for (let j = i; j < len; j++) {
                        const arr_j = arr[j];
                        // If i === j, it's a[i]^2. Otherwise, it's 2 * a[i] * a[j] (due to symmetry in expansion)
                        currentProduct = (i === j ? arr_i * arr_j : 2 * arr_i * arr_j) + result[i + j] + currentCarry;
                        currentCarry = truncateNumberTowardsZero(currentProduct / DIGIT_CHUNK_BASE);
                        result[i + j] = currentProduct - currentCarry * DIGIT_CHUNK_BASE;
                    }
                    result[i + len] += currentCarry; // Add any remaining carry to the next significant chunk
                }
                removeLeadingZeroChunks(result); // Clean up
                return result;
            }

            MultiDigitNumber.prototype.square = function () {
                // The square of any number is always non-negative
                return new MultiDigitNumber(computeSquareOfChunkArray(this.digitChunks), false);
            };

            SingleDigitNumber.prototype.square = function () {
                const squaredValue = this.value * this.value;
                if (isWithinSafeJSRange(squaredValue)) return new SingleDigitNumber(squaredValue);
                // If squaring overflows, convert to chunk-based and square
                return new MultiDigitNumber(computeSquareOfChunkArray(splitNumberIntoDigitChunks(Math.abs(this.value))), false);
            };

            PlatformBigIntWrapper.prototype.square = function () {
                return new PlatformBigIntWrapper(this.value * this.value); // Use native BigInt squaring
            };

            /**
             * Division Algorithm A (variant of Knuth's D-algorithm).
             * This algorithm is often faster for smaller input sizes compared to Algorithm B.
             * @param {number[]} dividendChunks - The dividend represented as a chunk array.
             * @param {number[]} divisorChunks - The divisor represented as a chunk array.
             * @returns {[number | number[], number | number[]]} A tuple: `[quotient, remainder]`.
             */
            function divisionAlgorithmA(dividendChunks, divisorChunks) {
                const dividendLength = dividendChunks.length;
                const divisorLength = divisorChunks.length;
                const quotientResult = initializeZeroFilledArray(dividendLength - divisorLength + 1); // Max quotient length
                let currentRemainderChunks = [...dividendChunks]; // Create a mutable copy of the dividend

                // Normalization step: Scale dividend and divisor to make divisor's most significant digit large.
                // This ensures better estimation of quotient digits.
                const normalizationScale = Math.ceil(DIGIT_CHUNK_BASE / (2 * divisorChunks[divisorLength - 1]));
                currentRemainderChunks = multiplyChunkArrayBySmallInt(currentRemainderChunks, normalizationScale);
                const normalizedDivisor = multiplyChunkArrayBySmallInt(divisorChunks, normalizationScale);

                // Ensure remainder has enough leading zeros for calculation.
                if (currentRemainderChunks.length <= dividendLength) currentRemainderChunks.push(0);
                normalizedDivisor.push(0); // Pad divisor for consistent length in loops

                const divisorMostSignificantDigit = normalizedDivisor[divisorLength - 1]; // MSB of the normalized divisor

                // Main division loop, iterating from most significant to least significant quotient digit
                for (let shiftOffset = dividendLength - divisorLength; shiftOffset >= 0; shiftOffset--) {
                    let estimatedQuotientDigit = DIGIT_CHUNK_BASE - 1; // Initial maximum guess
                    // Refine initial guess for quotient digit
                    if (currentRemainderChunks[shiftOffset + divisorLength] !== divisorMostSignificantDigit) {
                        estimatedQuotientDigit = truncateNumberTowardsZero((currentRemainderChunks[shiftOffset + divisorLength] * DIGIT_CHUNK_BASE + currentRemainderChunks[shiftOffset + divisorLength - 1]) / divisorMostSignificantDigit);
                    }

                    let carryAccumulator = 0;
                    let borrowAccumulator = 0;
                    const normDivisorTotalLength = normalizedDivisor.length;

                    // Multiply estimated quotient digit by divisor and subtract from the current part of the remainder
                    for (let i = 0; i < normDivisorTotalLength; i++) {
                        carryAccumulator += estimatedQuotientDigit * normalizedDivisor[i];
                        const quotientTerm = truncateNumberTowardsZero(carryAccumulator / DIGIT_CHUNK_BASE);
                        borrowAccumulator += currentRemainderChunks[shiftOffset + i] - (carryAccumulator - quotientTerm * DIGIT_CHUNK_BASE);
                        carryAccumulator = quotientTerm;
                        if (borrowAccumulator < 0) {
                            currentRemainderChunks[shiftOffset + i] = borrowAccumulator + DIGIT_CHUNK_BASE;
                            borrowAccumulator = -1;
                        } else {
                            currentRemainderChunks[shiftOffset + i] = borrowAccumulator;
                            borrowAccumulator = 0;
                        }
                    }

                    // Adjust quotient digit if subtraction resulted in a negative remainder (meaning guess was too high)
                    while (borrowAccumulator !== 0) {
                        estimatedQuotientDigit -= 1;
                        carryAccumulator = 0;
                        for (let i = 0; i < normDivisorTotalLength; i++) {
                            carryAccumulator += currentRemainderChunks[shiftOffset + i] - DIGIT_CHUNK_BASE + normalizedDivisor[i];
                            if (carryAccumulator < 0) {
                                currentRemainderChunks[shiftOffset + i] = carryAccumulator + DIGIT_CHUNK_BASE;
                                carryAccumulator = 0;
                            } else {
                                currentRemainderChunks[shiftOffset + i] = carryAccumulator;
                                carryAccumulator = 1;
                            }
                        }
                        borrowAccumulator += carryAccumulator;
                    }
                    quotientResult[shiftOffset] = estimatedQuotientDigit;
                }

                // Denormalization step: Divide the remainder by the initial normalization scale
                const [denormalizedRemainderChunks] = divideChunkArrayBySmallInt(currentRemainderChunks, normalizationScale);
                return [combineDigitChunksToSmallNumber(quotientResult), combineDigitChunksToSmallNumber(denormalizedRemainderChunks)];
            }

            /**
             * Division Algorithm B (another division implementation).
             * This version might perform better on larger input sizes.
             * @param {number[]} dividendChunks - The dividend as a chunk array.
             * @param {number[]} divisorChunks - The divisor as a chunk array.
             * @returns {[number | number[], number | number[]]} A tuple: `[quotient, remainder]`.
             */
            function divisionAlgorithmB(dividendChunks, divisorChunks) {
                let dividendLength = dividendChunks.length;
                const divisorLength = divisorChunks.length;
                const quotientDigits = [];
                let currentPartialDividend = []; // Stores the current portion of the dividend being processed

                // Process dividend chunks from most significant to least significant
                while (dividendLength > 0) {
                    // Take one chunk from the dividend and prepend it to the partial dividend
                    currentPartialDividend.unshift(dividendChunks[--dividendLength]);
                    removeLeadingZeroChunks(currentPartialDividend); // Clean up the partial dividend

                    // If the current partial dividend is smaller than the divisor, the quotient digit is 0
                    if (compareAbsoluteChunkArrays(currentPartialDividend, divisorChunks) < 0) {
                        quotientDigits.push(0);
                        continue;
                    }

                    // Estimate the quotient digit
                    const partialLen = currentPartialDividend.length;
                    let highDividendSegment = currentPartialDividend[partialLen - 1] * DIGIT_CHUNK_BASE + (partialLen > 1 ? currentPartialDividend[partialLen - 2] : 0);
                    const highDivisorSegment = divisorChunks[divisorLength - 1] * DIGIT_CHUNK_BASE + (divisorLength > 1 ? divisorChunks[divisorLength - 2] : 0);

                    // Adjust highDividendSegment if the partial dividend is significantly larger than the divisor
                    if (partialLen > divisorLength) {
                        highDividendSegment = (highDividendSegment + 1) * DIGIT_CHUNK_BASE;
                    }

                    let estimatedQuotient = truncateNumberTowardsZero(highDividendSegment / highDivisorSegment);

                    // Refine the estimated quotient by trial subtraction
                    let checkProduct;
                    do {
                        checkProduct = multiplyChunkArrayBySmallInt(divisorChunks, estimatedQuotient);
                        if (compareAbsoluteChunkArrays(checkProduct, currentPartialDividend) <= 0) break; // If product <= partial dividend, guess is good
                        estimatedQuotient--; // Otherwise, reduce the guess
                    } while (estimatedQuotient > 0); // Ensure quotient doesn't become negative

                    quotientDigits.push(estimatedQuotient); // Add the refined quotient digit
                    currentPartialDividend = performChunkArraySubtraction(currentPartialDividend, checkProduct); // Update partial dividend
                }
                quotientDigits.reverse(); // Digits were collected in reverse order, so reverse them
                return [combineDigitChunksToSmallNumber(quotientDigits), combineDigitChunksToSmallNumber(currentPartialDividend)];
            }

            /**
             * Divides a chunk array by a small integer.
             * @param {number[]} chunkArray - The dividend chunk array.
             * @param {number} smallDivisor - The small integer divisor.
             * @returns {[number[], number]} A tuple: `[quotientChunks, remainderValue]`.
             */
            function divideChunkArrayBySmallInt(chunkArray, smallDivisor) {
                const len = chunkArray.length;
                const quotient = initializeZeroFilledArray(len);
                let currentRemainder = 0; // Remainder from previous chunk division
                let currentChunkDividend, quotientTerm;

                // Iterate from most significant chunk to least significant
                for (let i = len - 1; i >= 0; --i) {
                    currentChunkDividend = currentRemainder * DIGIT_CHUNK_BASE + chunkArray[i];
                    quotientTerm = truncateNumberTowardsZero(currentChunkDividend / smallDivisor);
                    currentRemainder = currentChunkDividend - quotientTerm * smallDivisor; // Calculate new remainder
                    quotient[i] = quotientTerm | 0; // Ensure integer conversion
                }
                return [quotient, currentRemainder | 0]; // Return quotient chunks and final remainder
            }

            /**
             * Generic division and remainder function, intelligently choosing algorithms and handling types.
             * @param {AbstractLargeNumber} dividendObj - The dividend object.
             * @param {any} divisorValue - The divisor value (can be various types).
             * @returns {[AbstractLargeNumber, AbstractLargeNumber]} A tuple: `[quotient, remainder]`.
             */
            function flexibleDivisionAndRemainder(dividendObj, divisorValue) {
                const divisorObj = parseAnyInputToLargeNumber(divisorValue);

                // If native BigInt is available, leverage it for direct computation
                if (isNativeBigIntSupported) {
                    return [new PlatformBigIntWrapper(dividendObj.value / divisorObj.value), new PlatformBigIntWrapper(dividendObj.value % divisorObj.value)];
                }

                const currentDividendChunks = dividendObj.digitChunks;
                let currentDivisorChunks = divisorObj.digitChunks; // Can be reassigned if divisor is small

                if (divisorObj.isZeroValue()) throw new Error("Division by zero is not allowed.");

                if (dividendObj.isSmallNumber) {
                    if (divisorObj.isSmallNumber) {
                        // Both are small integers, perform direct division
                        return [new SingleDigitNumber(truncateNumberTowardsZero(dividendObj.value / divisorObj.value)), new SingleDigitNumber(dividendObj.value % divisorObj.value)];
                    }
                    // Small dividend, large divisor -> quotient is 0, remainder is the dividend itself
                    return [LargeNumberConstructor._precomputed[0], dividendObj];
                }

                if (divisorObj.isSmallNumber) {
                    const smallDivisorVal = divisorObj.value;
                    if (smallDivisorVal === 1) return [dividendObj, LargeNumberConstructor._precomputed[0]];
                    if (smallDivisorVal === -1) return [dividendObj.flipSign(), LargeNumberConstructor._precomputed[0]];
                    const absSmallDivisor = Math.abs(smallDivisorVal);
                    if (absSmallDivisor < DIGIT_CHUNK_BASE) {
                        const [quotientChunks, remainderNum] = divideChunkArrayBySmallInt(currentDividendChunks, absSmallDivisor);
                        let finalRemainder = remainderNum;
                        if (dividendObj.isNegativeFlag) finalRemainder = -finalRemainder; // Remainder sign matches dividend

                        const combinedQuotient = combineDigitChunksToSmallNumber(quotientChunks);
                        if (typeof combinedQuotient === "number") {
                            // Adjust quotient sign based on signs of dividend and divisor
                            const signedQuotient = (dividendObj.isNegativeFlag !== divisorObj.isNegativeFlag) ? -combinedQuotient : combinedQuotient;
                            return [new SingleDigitNumber(signedQuotient), new SingleDigitNumber(finalRemainder)];
                        }
                        return [new MultiDigitNumber(combinedQuotient, dividendObj.isNegativeFlag !== divisorObj.isNegativeFlag), new SingleDigitNumber(finalRemainder)];
                    }
                    // Small divisor but larger than a single chunk, convert it to chunks for algorithm
                    currentDivisorChunks = splitNumberIntoDigitChunks(absSmallDivisor);
                }

                // Compare absolute magnitudes of dividend and divisor
                const comparisonResult = compareAbsoluteChunkArrays(currentDividendChunks, currentDivisorChunks);
                if (comparisonResult === -1) return [LargeNumberConstructor._precomputed[0], dividendObj]; // Dividend < divisor
                if (comparisonResult === 0) { // Dividend == divisor
                    const signedUnit = (dividendObj.isNegativeFlag !== divisorObj.isNegativeFlag) ? LargeNumberConstructor._precomputed[-1] : LargeNumberConstructor._precomputed[1];
                    return [signedUnit, LargeNumberConstructor._precomputed[0]];
                }

                // Choose division algorithm based on empirical performance (input sizes)
                let divisionOutput;
                if (currentDividendChunks.length + currentDivisorChunks.length <= 200) { // Heuristic: Algorithm A for smaller combined length
                    divisionOutput = divisionAlgorithmA(currentDividendChunks, currentDivisorChunks);
                } else { // Algorithm B for larger combined length
                    divisionOutput = divisionAlgorithmB(currentDividendChunks, currentDivisorChunks);
                }

                let finalQuotientResult = divisionOutput[0];
                let finalRemainderResult = divisionOutput[1];
                const quotientSign = dividendObj.isNegativeFlag !== divisorObj.isNegativeFlag;
                const remainderSign = dividendObj.isNegativeFlag; // Remainder typically takes the sign of the dividend

                // Construct appropriate LargeNumber objects for quotient and remainder
                if (typeof finalQuotientResult === "number") {
                    if (quotientSign) finalQuotientResult = -finalQuotientResult;
                    finalQuotientResult = new SingleDigitNumber(finalQuotientResult);
                } else {
                    finalQuotientResult = new MultiDigitNumber(finalQuotientResult, quotientSign);
                }

                if (typeof finalRemainderResult === "number") {
                    if (remainderSign) finalRemainderResult = -finalRemainderResult;
                    finalRemainderResult = new SingleDigitNumber(finalRemainderResult);
                } else {
                    finalRemainderResult = new MultiDigitNumber(finalRemainderResult, remainderSign);
                }
                return [finalQuotientResult, finalRemainderResult];
            }

            // --- Division and Remainder Methods for LargeNumber Types ---

            MultiDigitNumber.prototype.getQuotientAndRemainder = function (otherValue) {
                const resultPair = flexibleDivisionAndRemainder(this, otherValue);
                return {
                    quotient: resultPair[0],
                    remainder: resultPair[1]
                };
            };
            PlatformBigIntWrapper.prototype.getQuotientAndRemainder = SingleDigitNumber.prototype.getQuotientAndRemainder = MultiDigitNumber.prototype.getQuotientAndRemainder;

            MultiDigitNumber.prototype.getQuotient = function (otherValue) {
                return flexibleDivisionAndRemainder(this, otherValue)[0];
            };
            PlatformBigIntWrapper.prototype.over = PlatformBigIntWrapper.prototype.getQuotient = function (otherValue) {
                return new PlatformBigIntWrapper(this.value / parseAnyInputToLargeNumber(otherValue).value);
            };
            SingleDigitNumber.prototype.over = SingleDigitNumber.prototype.getQuotient = MultiDigitNumber.prototype.over = MultiDigitNumber.prototype.getQuotient;

            MultiDigitNumber.prototype.getRemainder = function (otherValue) {
                return flexibleDivisionAndRemainder(this, otherValue)[1];
            };
            PlatformBigIntWrapper.prototype.mod = PlatformBigIntWrapper.prototype.getRemainder = function (otherValue) {
                return new PlatformBigIntWrapper(this.value % parseAnyInputToLargeNumber(otherValue).value);
            };
            SingleDigitNumber.prototype.remainder = SingleDigitNumber.prototype.mod = MultiDigitNumber.prototype.remainder = MultiDigitNumber.prototype.mod = MultiDigitNumber.prototype.getRemainder;

            // --- Exponentiation Methods ---

            MultiDigitNumber.prototype.power = function (exponentValue) {
                const exponentNum = parseAnyInputToLargeNumber(exponentValue);
                let finalComputedResult, baseNumericValue, exponentNumericValue;

                // Base cases for exponentiation
                if (exponentNum.isZeroValue()) return LargeNumberConstructor._precomputed[1]; // x^0 = 1
                if (this.isZeroValue()) return LargeNumberConstructor._precomputed[0]; // 0^x = 0 (for x > 0)
                if (this.isOneOrMinusOne()) { // 1^x = 1, (-1)^x = 1 if even, -1 if odd
                    return exponentNum.isEvenValue() ? LargeNumberConstructor._precomputed[1] : LargeNumberConstructor._precomputed[-1];
                }

                if (exponentNum.isNegativeValue()) {
                    // For negative integer exponents, x^(-n) = 1 / x^n. For integer arithmetic, this is 0 unless x is 1 or -1 (already handled).
                    return LargeNumberConstructor._precomputed[0];
                }

                // Guard against excessively large exponents that can't be handled efficiently
                if (!exponentNum.isSmallNumber) {
                    throw new Error(`The exponent ${exponentNum.toFormattedString()} is too large for current power implementation.`);
                }

                if (this.isSmallNumber) {
                    baseNumericValue = this.value;
                    exponentNumericValue = exponentNum.value;
                    // Attempt native Math.pow for small bases and exponents, checking for safe range
                    if (isWithinSafeJSRange(finalComputedResult = Math.pow(baseNumericValue, exponentNumericValue))) {
                        return new SingleDigitNumber(truncateNumberTowardsZero(finalComputedResult));
                    }
                }

                // Binary exponentiation (exponentiation by squaring) algorithm
                let currentBase = this;
                let resultAccumulator = LargeNumberConstructor._precomputed[1];
                let exp = exponentNum.value; // Use the raw small integer exponent for loop control

                while (true) {
                    if ((exp & 1) === 1) { // If exponent is odd, multiply result by current base
                        resultAccumulator = resultAccumulator.times(currentBase);
                        exp--;
                    }
                    if (exp === 0) break; // Exit loop if exponent is zero
                    exp /= 2; // Halve the exponent
                    currentBase = currentBase.square(); // Square the base
                }
                return resultAccumulator;
            };
            SingleDigitNumber.prototype.power = MultiDigitNumber.prototype.power;

            PlatformBigIntWrapper.prototype.power = function (exponentValue) {
                const exponentNum = parseAnyInputToLargeNumber(exponentValue);
                const baseVal = this.value;
                const expVal = exponentNum.value;

                // Constants for native BigInt operations
                const NATIVE_BI_ZERO = BigInt(0);
                const NATIVE_BI_ONE = BigInt(1);
                const NATIVE_BI_TWO = BigInt(2);
                const NATIVE_BI_NEG_ONE = BigInt(-1);

                if (expVal === NATIVE_BI_ZERO) return LargeNumberConstructor._precomputed[1];
                if (baseVal === NATIVE_BI_ZERO) return LargeNumberConstructor._precomputed[0];
                if (baseVal === NATIVE_BI_ONE) return LargeNumberConstructor._precomputed[1];
                if (baseVal === NATIVE_BI_NEG_ONE) return exponentNum.isEvenValue() ? LargeNumberConstructor._precomputed[1] : LargeNumberConstructor._precomputed[-1];
                if (exponentNum.isNegativeValue()) return new PlatformBigIntWrapper(NATIVE_BI_ZERO); // Native BigInt typically truncates to 0 for negative exponents

                // Binary exponentiation using native BigInts
                let currentBase = this;
                let resultAccumulator = LargeNumberConstructor._precomputed[1];
                let exp = expVal;

                while (true) {
                    if ((exp & NATIVE_BI_ONE) === NATIVE_BI_ONE) {
                        resultAccumulator = resultAccumulator.times(currentBase);
                        exp -= NATIVE_BI_ONE;
                    }
                    if (exp === NATIVE_BI_ZERO) break;
                    exp /= NATIVE_BI_TWO;
                    currentBase = currentBase.square();
                }
                return resultAccumulator;
            };

            MultiDigitNumber.prototype.modularExponentiation = function (exponent, modulus) {
                exponent = parseAnyInputToLargeNumber(exponent);
                modulus = parseAnyInputToLargeNumber(modulus);

                if (modulus.isZeroValue()) throw new Error("Cannot compute modular exponentiation with modulus 0.");

                let result = LargeNumberConstructor._precomputed[1];
                let currentBase = this.getRemainder(modulus); // Reduce base modulo modulus first

                if (exponent.isNegativeValue()) {
                    exponent = exponent.multiply(LargeNumberConstructor._precomputed[-1]); // Make exponent positive
                    currentBase = currentBase.modularInverse(modulus); // Calculate modular inverse for the base
                }

                // Binary exponentiation (exponentiation by squaring)
                while (exponent.isPositiveValue()) {
                    if (currentBase.isZeroValue()) return LargeNumberConstructor._precomputed[0]; // Optimization: 0^exp % mod = 0
                    if (exponent.isOddValue()) {
                        result = result.multiply(currentBase).getRemainder(modulus);
                    }
                    exponent = exponent.getQuotient(LargeNumberConstructor._precomputed[2]); // exponent /= 2
                    currentBase = currentBase.square().getRemainder(modulus);
                }
                return result;
            };
            PlatformBigIntWrapper.prototype.modularExponentiation = SingleDigitNumber.prototype.modularExponentiation = MultiDigitNumber.prototype.modularExponentiation;

            // --- Comparison Methods ---

            /**
             * Compares the absolute values of two chunk arrays.
             * @param {number[]} arrayX - First chunk array.
             * @param {number[]} arrayY - Second chunk array.
             * @returns {-1 | 0 | 1} -1 if arrayX < arrayY, 0 if arrayX == arrayY, 1 if arrayX > arrayY.
             */
            function compareAbsoluteChunkArrays(arrayX, arrayY) {
                if (arrayX.length !== arrayY.length) {
                    return arrayX.length > arrayY.length ? 1 : -1;
                }
                // Compare chunks from most significant to least significant
                for (let i = arrayX.length - 1; i >= 0; i--) {
                    if (arrayX[i] !== arrayY[i]) return arrayX[i] > arrayY[i] ? 1 : -1;
                }
                return 0; // Arrays are identical in value
            }

            MultiDigitNumber.prototype.compareAbsoluteValues = function (otherValue) {
                const otherNumber = parseAnyInputToLargeNumber(otherValue);
                const currentChunks = this.digitChunks;
                const otherChunks = otherNumber.digitChunks;
                if (otherNumber.isSmallNumber) {
                    // If comparing MultiDigitNumber with SingleDigitNumber, convert SingleDigitNumber to chunks
                    return compareAbsoluteChunkArrays(currentChunks, splitNumberIntoDigitChunks(Math.abs(otherNumber.value)));
                }
                return compareAbsoluteChunkArrays(currentChunks, otherChunks);
            };
            SingleDigitNumber.prototype.compareAbsoluteValues = function (otherValue) {
                const otherNumber = parseAnyInputToLargeNumber(otherValue);
                const absThisVal = Math.abs(this.value);
                let absOtherVal;

                if (otherNumber.isSmallNumber) {
                    absOtherVal = Math.abs(otherNumber.value);
                    return absThisVal === absOtherVal ? 0 : absThisVal > absOtherVal ? 1 : -1;
                }
                // If comparing SingleDigitNumber with MultiDigitNumber, convert SingleDigitNumber to chunks
                return compareAbsoluteChunkArrays(splitNumberIntoDigitChunks(absThisVal), otherNumber.digitChunks);
            };
            PlatformBigIntWrapper.prototype.compareAbsoluteValues = function (otherValue) {
                let absA = this.value;
                let absB = parseAnyInputToLargeNumber(otherValue).value;
                absA = absA >= 0 ? absA : -absA;
                absB = absB >= 0 ? absB : -absB;
                return absA === absB ? 0 : absA > absB ? 1 : -1;
            };

            MultiDigitNumber.prototype.compareValues = function (otherValue) {
                // Handle comparison with JavaScript's special numeric values (Infinity)
                if (otherValue === Infinity) return -1;
                if (otherValue === -Infinity) return 1;

                const otherNumber = parseAnyInputToLargeNumber(otherValue);
                const currentChunks = this.digitChunks;
                const otherChunks = otherNumber.digitChunks;

                // First, compare signs: a negative number is always less than a positive number
                if (this.isNegativeFlag !== otherNumber.isNegativeFlag) {
                    return otherNumber.isNegativeFlag ? 1 : -1; // If other is negative, this (positive) is greater; else this (negative) is lesser
                }

                // If signs are the same, compare magnitudes
                // Handle cases where one is MultiDigitNumber and other is SingleDigitNumber
                if (otherNumber.isSmallNumber) {
                    // If this is MultiDigit (non-zero) and other is Small (non-zero) and signs are same,
                    // MultiDigit will generally be larger in magnitude.
                    // Special case for zero:
                    if (this.isZeroValue() && otherNumber.isZeroValue()) return 0; // Both are zero
                    if (this.isZeroValue()) return otherNumber.isNegativeFlag ? 1 : -1; // 0 vs small_neg or 0 vs small_pos
                    if (otherNumber.isZeroValue()) return this.isNegativeFlag ? -1 : 1; // big_neg vs 0 or big_pos vs 0

                    // For non-zero, same sign, MultiDigit vs Small:
                    // Compare absolute magnitudes, then apply the common sign.
                    const absComparison = compareAbsoluteChunkArrays(currentChunks, splitNumberIntoDigitChunks(Math.abs(otherNumber.value)));
                    return absComparison * (this.isNegativeFlag ? -1 : 1); // Negative numbers: larger abs means smaller value
                }

                // Both are MultiDigitNumbers (or equivalent chunk representations) and have the same sign
                const absComparison = compareAbsoluteChunkArrays(currentChunks, otherChunks);
                return absComparison * (this.isNegativeFlag ? -1 : 1); // Apply the sign to the magnitude comparison result
            };
            MultiDigitNumber.prototype.compareTo = MultiDigitNumber.prototype.compareValues; // Alias for 'compareTo'

            SingleDigitNumber.prototype.compareValues = function (otherValue) {
                if (otherValue === Infinity) return -1;
                if (otherValue === -Infinity) return 1;

                const otherNumber = parseAnyInputToLargeNumber(otherValue);
                const currentNumericVal = this.value;
                const otherNumericValRaw = otherNumber.value;

                if (otherNumber.isSmallNumber) {
                    // Both are small integers, direct comparison
                    return currentNumericVal === otherNumericValRaw ? 0 : currentNumericVal > otherNumericValRaw ? 1 : -1;
                }

                // One is SingleDigitNumber, the other is MultiDigitNumber.
                // Compare based on signs first.
                if ((currentNumericVal < 0) !== otherNumber.isNegativeFlag) {
                    return currentNumericVal < 0 ? -1 : 1; // Small negative vs Large positive, or Small positive vs Large negative
                }
                // Both have the same sign, but different types (Small vs Large)
                // If both positive: Small positive is always less than Large positive.
                // If both negative: Small negative is always greater than Large negative (less negative is "larger").
                return currentNumericVal < 0 ? 1 : -1; // If currentVal is negative, it's "less negative" (larger) than a larger negative number. If positive, it's smaller than a larger positive number.
            };
            SingleDigitNumber.prototype.compareTo = SingleDigitNumber.prototype.compareValues; // Alias for 'compareTo'

            PlatformBigIntWrapper.prototype.compareValues = function (otherValue) {
                if (otherValue === Infinity) return -1;
                if (otherValue === -Infinity) return 1;
                const valA = this.value;
                const valB = parseAnyInputToLargeNumber(otherValue).value;
                return valA === valB ? 0 : valA > valB ? 1 : -1; // Native BigInt comparison
            };
            PlatformBigIntWrapper.prototype.compareTo = PlatformBigIntWrapper.prototype.compareValues; // Alias for 'compareTo'

            // --- Equality and Inequality Methods ---

            MultiDigitNumber.prototype.isEqualTo = function (otherValue) {
                return this.compareValues(otherValue) === 0;
            };
            // Aliases for equality and inequality across all types
            PlatformBigIntWrapper.prototype.eq = PlatformBigIntWrapper.prototype.isEqualTo = SingleDigitNumber.prototype.eq = SingleDigitNumber.prototype.isEqualTo = MultiDigitNumber.prototype.eq = MultiDigitNumber.prototype.isEqualTo;

            MultiDigitNumber.prototype.isNotEqualTo = function (otherValue) {
                return this.compareValues(otherValue) !== 0;
            };
            PlatformBigIntWrapper.prototype.neq = PlatformBigIntWrapper.prototype.isNotEqualTo = SingleDigitNumber.prototype.neq = SingleDigitNumber.prototype.isNotEqualTo = MultiDigitNumber.prototype.neq = MultiDigitNumber.prototype.isNotEqualTo;

            // --- Relational Comparison Methods ---

            MultiDigitNumber.prototype.isGreater = function (otherValue) {
                return this.compareValues(otherValue) > 0;
            };
            PlatformBigIntWrapper.prototype.gt = PlatformBigIntWrapper.prototype.isGreater = SingleDigitNumber.prototype.gt = SingleDigitNumber.prototype.isGreater = MultiDigitNumber.prototype.gt = MultiDigitNumber.prototype.isGreater;

            MultiDigitNumber.prototype.isLesser = function (otherValue) {
                return this.compareValues(otherValue) < 0;
            };
            PlatformBigIntWrapper.prototype.lt = PlatformBigIntWrapper.prototype.isLesser = SingleDigitNumber.prototype.lt = SingleDigitNumber.prototype.isLesser = MultiDigitNumber.prototype.lt = MultiDigitNumber.prototype.isLesser;

            MultiDigitNumber.prototype.isGreaterOrEqualTo = function (otherValue) {
                return this.compareValues(otherValue) >= 0;
            };
            PlatformBigIntWrapper.prototype.geq = PlatformBigIntWrapper.prototype.isGreaterOrEqualTo = SingleDigitNumber.prototype.geq = SingleDigitNumber.prototype.isGreaterOrEqualTo = MultiDigitNumber.prototype.geq = MultiDigitNumber.prototype.isGreaterOrEqualTo;

            MultiDigitNumber.prototype.isLesserOrEqualTo = function (otherValue) {
                return this.compareValues(otherValue) <= 0;
            };
            PlatformBigIntWrapper.prototype.leq = PlatformBigIntWrapper.prototype.isLesserOrEqualTo = SingleDigitNumber.prototype.leq = SingleDigitNumber.prototype.isLesserOrEqualTo = MultiDigitNumber.prototype.leq = MultiDigitNumber.prototype.isLesserOrEqualTo;

            // --- Property Checkers (Even, Odd, Positive, Negative, Zero, Unit) ---

            MultiDigitNumber.prototype.isEvenValue = function () {
                // An integer is even if its least significant digit (first chunk) is even
                return (this.digitChunks[0] & 1) === 0;
            };
            SingleDigitNumber.prototype.isEvenValue = function () {
                return (this.value & 1) === 0;
            };
            PlatformBigIntWrapper.prototype.isEvenValue = function () {
                return (this.value & BigInt(1)) === BigInt(0);
            };

            MultiDigitNumber.prototype.isOddValue = function () {
                return (this.digitChunks[0] & 1) === 1;
            };
            SingleDigitNumber.prototype.isOddValue = function () {
                return (this.value & 1) === 1;
            };
            PlatformBigIntWrapper.prototype.isOddValue = function () {
                return (this.value & BigInt(1)) === BigInt(1);
            };

            MultiDigitNumber.prototype.isPositiveValue = function () {
                return !this.isNegativeFlag;
            };
            SingleDigitNumber.prototype.isPositiveValue = function () {
                return this.value > 0;
            };
            PlatformBigIntWrapper.prototype.isPositiveValue = SingleDigitNumber.prototype.isPositiveValue; // Same logic for PlatformBigInt

            MultiDigitNumber.prototype.isNegativeValue = function () {
                return this.isNegativeFlag;
            };
            SingleDigitNumber.prototype.isNegativeValue = function () {
                return this.value < 0;
            };
            PlatformBigIntWrapper.prototype.isNegativeValue = SingleDigitNumber.prototype.isNegativeValue; // Same logic for PlatformBigInt

            MultiDigitNumber.prototype.isOneOrMinusOne = function () {
                // By definition, a MultiDigitNumber (represented by multiple chunks) is not 1 or -1,
                // unless it's a cached instance of 1 or -1 which will be SingleDigitNumber.
                return false;
            };
            SingleDigitNumber.prototype.isOneOrMinusOne = function () {
                return Math.abs(this.value) === 1;
            };
            PlatformBigIntWrapper.prototype.isOneOrMinusOne = function () {
                return this.absoluteValue().value === BigInt(1);
            };

            MultiDigitNumber.prototype.isZeroValue = function () {
                // A MultiDigitNumber is generally not zero, unless it's the specific cached zero object.
                // An empty `digitChunks` array after `removeLeadingZeroChunks` would signify zero.
                return this.digitChunks.length === 0 || (this.digitChunks.length === 1 && this.digitChunks[0] === 0);
            };
            SingleDigitNumber.prototype.isZeroValue = function () {
                return this.value === 0;
            };
            PlatformBigIntWrapper.prototype.isZeroValue = function () {
                return this.value === BigInt(0);
            };

            MultiDigitNumber.prototype.isDivisibleByValue = function (otherValue) {
                const otherNumber = parseAnyInputToLargeNumber(otherValue);
                if (otherNumber.isZeroValue()) return false; // Cannot divide by zero
                if (otherNumber.isOneOrMinusOne()) return true; // Divisible by 1 or -1
                if (otherNumber.compareAbsoluteValues(LargeNumberConstructor._precomputed[2]) === 0) return this.isEvenValue(); // Divisible by 2 check
                return this.getRemainder(otherNumber).isZeroValue(); // General case: remainder is zero
            };
            PlatformBigIntWrapper.prototype.isDivisibleByValue = SingleDigitNumber.prototype.isDivisibleByValue = MultiDigitNumber.prototype.isDivisibleByValue;

            /**
             * Performs a quick check for primality for small numbers.
             * @param {AbstractLargeNumber} candidateNum - The number to check.
             * @returns {boolean | undefined} True if prime, false if composite, undefined if further testing is needed.
             */
            function isSimplePrimalityCheck(candidateNum) {
                const absoluteNum = candidateNum.absoluteValue();
                if (absoluteNum.isOneOrMinusOne()) return false; // 1 and -1 are not prime
                if (absoluteNum.isEqualTo(LargeNumberConstructor._precomputed[2]) || absoluteNum.isEqualTo(LargeNumberConstructor._precomputed[3]) || absoluteNum.isEqualTo(LargeNumberConstructor._precomputed[5])) return true; // 2, 3, 5 are prime
                if (absoluteNum.isEvenValue() || absoluteNum.isDivisibleByValue(LargeNumberConstructor._precomputed[3]) || absoluteNum.isDivisibleByValue(LargeNumberConstructor._precomputed[5])) return false; // Divisible by 2, 3, or 5
                if (absoluteNum.isLesser(LargeNumberConstructor(49))) return true; // Numbers < 49 not divisible by 2,3,5 must be prime
                return undefined; // Not determinable by simple checks, needs probabilistic test
            }

            /**
             * Implements the Miller-Rabin probabilistic primality test.
             * @param {AbstractLargeNumber} numberToTest - The number to test for primality.
             * @param {number[]} testBases - An array of small integer bases to use for the test.
             * @returns {boolean} True if `numberToTest` is likely prime, false if it is definitely composite.
             */
            function millerRabinTest(numberToTest, testBases) {
                const nMinusOne = numberToTest.decrementValue(); // n-1
                let dValue = nMinusOne;
                let rCount = 0;
                // Find d and r such that n-1 = d * 2^r, where d is odd
                while (dValue.isEvenValue()) {
                    dValue = dValue.getQuotient(LargeNumberConstructor._precomputed[2]);
                    rCount++;
                }

                // Iterate through each base `a` in `testBases`
                for (let i = 0; i < testBases.length; i++) {
                    // Skip bases that are larger than N itself
                    if (numberToTest.isLesser(testBases[i])) continue;

                    // Compute x = a^d % n
                    let x = LargeNumberConstructor(testBases[i]).modularExponentiation(dValue, numberToTest);
                    // If x is 1 or n-1, it might be prime, continue to next base
                    if (x.isOneOrMinusOne() || x.isEqualTo(nMinusOne)) continue;

                    // Perform r-1 squaring steps
                    let isStrongPseudoprimeForThisBase = false;
                    for (let j = 0; j < rCount - 1; j++) {
                        x = x.square().getRemainder(numberToTest); // x = x^2 % n
                        if (x.isOneOrMinusOne()) return false; // If x becomes 1, it's composite
                        if (x.isEqualTo(nMinusOne)) {
                            isStrongPseudoprimeForThisBase = true; // If x becomes n-1, it passes this base's test
                            break;
                        }
                    }
                    if (!isStrongPseudoprimeForThisBase) return false; // If it failed to be a strong pseudoprime for this base, it's composite
                }
                return true; // Passed all tests, likely prime
            }

            MultiDigitNumber.prototype.checkPrimality = function (strictMode) {
                const basicCheckResult = isSimplePrimalityCheck(this);
                if (basicCheckResult !== externalUndefined) return basicCheckResult;

                const absoluteNum = this.absoluteValue();
                const bitLength = absoluteNum.determineBitLength();

                if (bitLength.isLesserOrEqualTo(LargeNumberConstructor(64))) {
                    // For numbers up to 64 bits, use a fixed set of strong bases for deterministic primality
                    return millerRabinTest(absoluteNum, [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37]);
                }

                // For larger numbers, determine the number of iterations (bases) based on bit length
                const logNValue = Math.log(2) * bitLength.toNativeNumber();
                // 'strictMode' implies a higher number of tests for greater certainty
                const numberOfTests = Math.ceil((strictMode === true) ? (2 * Math.pow(logNValue, 2)) : logNValue);

                const basesForTesting = [];
                // Generate bases starting from 2
                for (let i = 0; i < numberOfTests; i++) {
                    basesForTesting.push(LargeNumberConstructor(i + 2));
                }
                return millerRabinTest(absoluteNum, basesForTesting);
            };
            PlatformBigIntWrapper.prototype.checkPrimality = SingleDigitNumber.prototype.checkPrimality = MultiDigitNumber.prototype.checkPrimality;

            MultiDigitNumber.prototype.checkProbablePrimality = function (customIterations, randomGeneratorFn) {
                const basicCheckResult = isSimplePrimalityCheck(this);
                if (basicCheckResult !== externalUndefined) return basicCheckResult;

                const absoluteNum = this.absoluteValue();
                const numIterations = customIterations === externalUndefined ? 5 : customIterations; // Default to 5 iterations

                const basesToTest = [];
                // Generate random bases within the range [2, N-2]
                for (let i = 0; i < numIterations; i++) {
                    basesToTest.push(LargeNumberConstructor.getRandomBetween(LargeNumberConstructor._precomputed[2], absoluteNum.minus(LargeNumberConstructor._precomputed[2]), randomGeneratorFn));
                }
                return millerRabinTest(absoluteNum, basesToTest);
            };
            PlatformBigIntWrapper.prototype.checkProbablePrimality = SingleDigitNumber.prototype.checkProbablePrimality = MultiDigitNumber.prototype.checkProbablePrimality;

            MultiDigitNumber.prototype.modularInverse = function (modulus) {
                // Uses the Extended Euclidean Algorithm to find `x` such that `(this * x) % modulus = 1`.
                let current_t = LargeNumberConstructor._precomputed[0], next_t = LargeNumberConstructor._precomputed[1];
                let current_r = parseAnyInputToLargeNumber(modulus), next_r = this.absoluteValue();
                let quotientVal, last_t, last_r;

                while (!next_r.isZeroValue()) {
                    quotientVal = current_r.getQuotient(next_r);
                    last_t = current_t;
                    last_r = current_r;
                    current_t = next_t;
                    current_r = next_r;
                    next_t = last_t.subtract(quotientVal.multiply(next_t));
                    next_r = last_r.subtract(quotientVal.multiply(next_r));
                }

                // If r (the GCD) is not 1 (or -1), then no modular inverse exists (numbers are not coprime)
                if (!current_r.isOneOrMinusOne()) {
                    throw new Error(`${this.toFormattedString()} and ${modulus.toFormattedString()} are not coprime. Modular inverse does not exist.`);
                }
                // Ensure t (the inverse) is positive by adding modulus if it's negative
                if (current_t.compareValues(0) === -1) {
                    current_t = current_t.add(modulus);
                }
                // If the original number was negative, the inverse needs to be negated too (modulo modulus)
                if (this.isNegativeValue()) {
                    return current_t.flipSign();
                }
                return current_t;
            };

            PlatformBigIntWrapper.prototype.modularInverse = SingleDigitNumber.prototype.modularInverse = MultiDigitNumber.prototype.modularInverse;

            // --- Increment and Decrement Methods ---

            MultiDigitNumber.prototype.incrementValue = function () {
                const currentChunks = this.digitChunks;
                if (this.isNegativeFlag) {
                    // For negative numbers, incrementing means subtracting 1 from its absolute value
                    return subtractSmallIntFromChunkArray(currentChunks, 1, this.isNegativeFlag);
                }
                // For positive numbers, incrementing means adding 1
                return new MultiDigitNumber(addSmallIntToChunkArray(currentChunks, 1), this.isNegativeFlag);
            };
            SingleDigitNumber.prototype.incrementValue = function () {
                const currentVal = this.value;
                if (currentVal + 1 < JS_MAX_SAFE_INTEGER) return new SingleDigitNumber(currentVal + 1);
                // If incrementing overflows the safe integer limit, convert to MultiDigitNumber
                return new MultiDigitNumber(MAX_SAFE_INT_CHUNKS_REP, false);
            };
            PlatformBigIntWrapper.prototype.incrementValue = function () {
                return new PlatformBigIntWrapper(this.value + BigInt(1));
            };

            MultiDigitNumber.prototype.decrementValue = function () {
                const currentChunks = this.digitChunks;
                if (this.isNegativeFlag) {
                    // For negative numbers, decrementing means adding 1 to its absolute value
                    return new MultiDigitNumber(addSmallIntToChunkArray(currentChunks, 1), true);
                }
                // For positive numbers, decrementing means subtracting 1
                return subtractSmallIntFromChunkArray(currentChunks, 1, this.isNegativeFlag);
            };
            SingleDigitNumber.prototype.decrementValue = function () {
                const currentVal = this.value;
                if (currentVal - 1 > -JS_MAX_SAFE_INTEGER) return new SingleDigitNumber(currentVal - 1);
                // If decrementing underflows the safe integer limit, convert to MultiDigitNumber
                return new MultiDigitNumber(MAX_SAFE_INT_CHUNKS_REP, true); // Represents negative MAX_SAFE_INTEGER
            };
            PlatformBigIntWrapper.prototype.decrementValue = function () {
                return new PlatformBigIntWrapper(this.value - BigInt(1));
            };

            // --- Bitwise Operations Setup ---

            // Pre-calculate powers of two that fit within a single digit chunk for efficient bitwise shifts
            const powersOfTwoInChunk = [1];
            while (2 * powersOfTwoInChunk[powersOfTwoInChunk.length - 1] <= DIGIT_CHUNK_BASE) {
                powersOfTwoInChunk.push(2 * powersOfTwoInChunk[powersOfTwoInChunk.length - 1]);
            }
            const countPowersOfTwo = powersOfTwoInChunk.length;
            const largestPowerOfTwoChunk = powersOfTwoInChunk[countPowersOfTwo - 1]; // The largest power of two that fits in one chunk

            /**
             * Checks if a shift amount is small enough to be handled directly by JavaScript numbers.
             * @param {number} shiftAmount - The amount to shift.
             * @returns {boolean} True if the absolute shift amount is within DIGIT_CHUNK_BASE.
             */
            function isShiftAmountSmall(shiftAmount) {
                return Math.abs(shiftAmount) <= DIGIT_CHUNK_BASE;
            }

            MultiDigitNumber.prototype.bitwiseShiftLeft = function (shiftAmountVal) {
                const shiftAmount = parseAnyInputToLargeNumber(shiftAmountVal).toNativeNumber();
                if (!isShiftAmountSmall(shiftAmount)) {
                    throw new Error(`Shift amount ${shiftAmount} is too large for efficient bitwise shifting.`);
                }
                if (shiftAmount < 0) return this.bitwiseShiftRight(-shiftAmount); // Left shift by negative = right shift
                if (this.isZeroValue()) return this; // Shifting zero always results in zero

                let resultNum = this;
                let remainingShift = shiftAmount;
                // Perform shifts in chunks using pre-calculated powers of two
                while (remainingShift >= countPowersOfTwo) {
                    resultNum = resultNum.multiply(largestPowerOfTwoChunk);
                    remainingShift -= (countPowersOfTwo - 1); // Adjust remaining shift amount (each chunk shift is like multiply by 2^(log_2(CHUNK_BASE)))
                }
                return resultNum.multiply(powersOfTwoInChunk[remainingShift]);
            };
            PlatformBigIntWrapper.prototype.bitwiseShiftLeft = SingleDigitNumber.prototype.bitwiseShiftLeft = MultiDigitNumber.prototype.bitwiseShiftLeft;

            MultiDigitNumber.prototype.bitwiseShiftRight = function (shiftAmountVal) {
                const shiftAmount = parseAnyInputToLargeNumber(shiftAmountVal).toNativeNumber();
                if (!isShiftAmountSmall(shiftAmount)) {
                    throw new Error(`Shift amount ${shiftAmount} is too large for efficient bitwise shifting.`);
                }
                if (shiftAmount < 0) return this.bitwiseShiftLeft(-shiftAmount); // Right shift by negative = left shift

                let resultNum = this;
                let remainingShift = shiftAmount;
                let divisionRemainderPair;

                while (remainingShift >= countPowersOfTwo) {
                    // Handle 0 and -1 cases for arithmetic right shift
                    if (resultNum.isZeroValue() || (resultNum.isNegativeValue() && resultNum.isOneOrMinusOne())) return resultNum;
                    divisionRemainderPair = flexibleDivisionAndRemainder(resultNum, LargeNumberConstructor(largestPowerOfTwoChunk));
                    // For negative numbers, right shift floors towards negative infinity, so adjust quotient if remainder is non-zero.
                    resultNum = divisionRemainderPair[1].isNegativeValue() ? divisionRemainderPair[0].decrementValue() : divisionRemainderPair[0];
                    remainingShift -= (countPowersOfTwo - 1);
                }
                divisionRemainderPair = flexibleDivisionAndRemainder(resultNum, LargeNumberConstructor(powersOfTwoInChunk[remainingShift]));
                return divisionRemainderPair[1].isNegativeValue() ? divisionRemainderPair[0].decrementValue() : divisionRemainderPair[0];
            };
            PlatformBigIntWrapper.prototype.bitwiseShiftRight = SingleDigitNumber.prototype.bitwiseShiftRight = MultiDigitNumber.prototype.bitwiseShiftRight;

            /**
             * Performs a general bitwise operation (AND, OR, XOR) on two LargeNumber instances.
             * Handles negative numbers by converting them to their two's complement representation.
             * @param {AbstractLargeNumber} operandX - The first operand.
             * @param {any} operandY - The second operand (will be parsed to LargeNumber).
             * @param {function(number, number): number} bitwiseOperationFn - The bitwise function to apply (e.g., `(a, b) => a & b`).
             * @returns {AbstractLargeNumber} The result of the bitwise operation.
             */
            function performGeneralBitwiseOperation(operandX, operandY, bitwiseOperationFn) {
                operandY = parseAnyInputToLargeNumber(operandY);
                const xSignIsNegative = operandX.isNegativeValue();
                const ySignIsNegative = operandY.isNegativeValue();

                // Convert negative numbers to their two's complement representation (bitwise NOT + 1 is -num)
                let xRemainderAbs = xSignIsNegative ? operandX.bitwiseNOT() : operandX;
                let yRemainderAbs = ySignIsNegative ? operandY.bitwiseNOT() : operandY;

                let xCurrentDigit = 0, yCurrentDigit = 0;
                let xDivModResult = null, yDivModResult = null;
                const resultChunkDigits = []; // Store the result of chunk-wise bitwise operations

                // Process chunks from least significant to most significant
                while (!xRemainderAbs.isZeroValue() || !yRemainderAbs.isZeroValue()) {
                    xDivModResult = flexibleDivisionAndRemainder(xRemainderAbs, LargeNumberConstructor(largestPowerOfTwoChunk));
                    xCurrentDigit = xDivModResult[1].toNativeNumber();
                    if (xSignIsNegative) {
                        // Apply two's complement transformation for negative numbers
                        xCurrentDigit = largestPowerOfTwoChunk - 1 - xCurrentDigit;
                    }

                    yDivModResult = flexibleDivisionAndRemainder(yRemainderAbs, LargeNumberConstructor(largestPowerOfTwoChunk));
                    yCurrentDigit = yDivModResult[1].toNativeNumber();
                    if (ySignIsNegative) {
                        yCurrentDigit = largestPowerOfTwoChunk - 1 - yCurrentDigit;
                    }

                    xRemainderAbs = xDivModResult[0]; // Update remaining part of X
                    yRemainderAbs = yDivModResult[0]; // Update remaining part of Y
                    resultChunkDigits.push(bitwiseOperationFn(xCurrentDigit, yCurrentDigit));
                }

                // Determine the sign of the overall result based on the most significant bit of the two's complement representation
                const finalSignBitResult = bitwiseOperationFn(xSignIsNegative ? 1 : 0, ySignIsNegative ? 1 : 0);
                let reconstructedResult = finalSignBitResult !== 0 ? LargeNumberConstructor(-1) : LargeNumberConstructor(0);

                // Reconstruct the number from the chunk results, starting from MSB (reverse order of pushing)
                for (let i = resultChunkDigits.length - 1; i >= 0; i--) {
                    reconstructedResult = reconstructedResult.multiply(LargeNumberConstructor(largestPowerOfTwoChunk)).add(LargeNumberConstructor(resultChunkDigits[i]));
                }
                return reconstructedResult;
            }

            MultiDigitNumber.prototype.bitwiseNOT = function () {
                // In two's complement arithmetic, NOT(x) is equivalent to -x - 1
                return this.flipSign().decrementValue();
            };
            PlatformBigIntWrapper.prototype.bitwiseNOT = SingleDigitNumber.prototype.bitwiseNOT = MultiDigitNumber.prototype.bitwiseNOT;

            MultiDigitNumber.prototype.bitwiseAND = function (otherNum) {
                return performGeneralBitwiseOperation(this, otherNum, (a, b) => a & b);
            };
            PlatformBigIntWrapper.prototype.and = SingleDigitNumber.prototype.and = MultiDigitNumber.prototype.and = MultiDigitNumber.prototype.bitwiseAND;

            MultiDigitNumber.prototype.bitwiseOR = function (otherNum) {
                return performGeneralBitwiseOperation(this, otherNum, (a, b) => a | b);
            };
            PlatformBigIntWrapper.prototype.or = SingleDigitNumber.prototype.or = MultiDigitNumber.prototype.or = MultiDigitNumber.prototype.bitwiseOR;

            MultiDigitNumber.prototype.bitwiseXOR = function (otherNum) {
                return performGeneralBitwiseOperation(this, otherNum, (a, b) => a ^ b);
            };
            PlatformBigIntWrapper.prototype.xor = SingleDigitNumber.prototype.xor = MultiDigitNumber.prototype.xor = MultiDigitNumber.prototype.bitwiseXOR;

            // --- Utilities for Bit Length and Logarithms ---

            // Masks for quickly finding the lowest set bit in a number
            const lowestSetBitMaskForInt = 1 << 30; // A power of 2, small enough for JS number
            // A combined mask for BigInt/chunk representation, ensuring a non-zero lowest bit for the rough estimate
            const lowestSetBitMaskForBigInt = (DIGIT_CHUNK_BASE & -DIGIT_CHUNK_BASE) * (DIGIT_CHUNK_BASE & -DIGIT_CHUNK_BASE) | lowestSetBitMaskForInt;

            /**
             * Provides a rough estimate of the lowest one bit (LSB) of a number.
             * This is not a precise LOB calculation for arbitrary large numbers, but a fast heuristic.
             * @param {AbstractLargeNumber} num - The number to analyze.
             * @returns {number | BigInt} A value representing the estimated LSB.
             */
            function getRoughLowestOneBit(num) {
                const rawValue = num.value; // For SingleDigitNumber or PlatformBigIntWrapper
                let tempBitValue;
                if (typeof rawValue === "number") {
                    tempBitValue = rawValue | lowestSetBitMaskForInt; // Apply mask for standard numbers
                } else if (typeof rawValue === "bigint") {
                    tempBitValue = rawValue | BigInt(lowestSetBitMaskForInt); // Apply mask for native BigInt
                } else { // For MultiDigitNumber (chunkValues)
                    // Use the first few chunks to estimate LSB
                    tempBitValue = rawValue[0] + (rawValue.length > 1 ? rawValue[1] * DIGIT_CHUNK_BASE : 0) | lowestSetBitMaskForBigInt;
                }
                return tempBitValue & -tempBitValue; // Standard bitwise trick for LSB
            }

            /**
             * Computes the integer logarithm (floor(log_base(value))).
             * This is a recursive helper function primarily used for calculating `bitLength`.
             * @param {AbstractLargeNumber} targetNum - The number for which to find the logarithm.
             * @param {AbstractLargeNumber} logBase - The base of the logarithm.
             * @returns {{product: AbstractLargeNumber, exponent: number}} Object containing the highest power of `logBase` less than or equal to `targetNum` (`product`) and its exponent (`exponent`).
             */
            function calculateIntegerLogarithm(targetNum, logBase) {
                // Base case: if logBase is greater than targetNum, the exponent is 0
                if (logBase.compareValues(targetNum) <= 0) {
                    // Recursively call with base squared to speed up the calculation
                    const recursiveResult = calculateIntegerLogarithm(targetNum, logBase.square());
                    const product = recursiveResult.product;
                    const exponent = recursiveResult.exponent;
                    const testProduct = product.multiply(logBase);
                    // If testProduct <= targetNum, then the exponent is 2*exponent + 1, otherwise it's 2*exponent
                    return testProduct.compareValues(targetNum) <= 0 ? { product: testProduct, exponent: exponent * 2 + 1 } : { product: product, exponent: exponent * 2 };
                }
                return { product: LargeNumberConstructor._precomputed[1], exponent: 0 };
            }

            MultiDigitNumber.prototype.determineBitLength = function () {
                let currentNum = this;
                // For negative numbers, bit length is usually defined for the absolute value, or two's complement.
                // The original library defined bit length for `abs(N)-1` for negative numbers.
                if (currentNum.isNegativeValue()) {
                    currentNum = currentNum.flipSign().subtract(LargeNumberConstructor._precomputed[1]);
                }
                if (currentNum.isZeroValue()) {
                    return LargeNumberConstructor._precomputed[0];
                }
                // Calculate integer logarithm base 2 and add 1 to get the bit length
                return LargeNumberConstructor(calculateIntegerLogarithm(currentNum, LargeNumberConstructor._precomputed[2]).exponent).add(LargeNumberConstructor._precomputed[1]);
            };
            PlatformBigIntWrapper.prototype.determineBitLength = SingleDigitNumber.prototype.determineBitLength = MultiDigitNumber.prototype.determineBitLength;

            // --- Global Utility Functions (max, min, gcd, lcm, random) ---

            /**
             * Finds the maximum of two LargeNumber instances.
             * @param {any} value1 - First value.
             * @param {any} value2 - Second value.
             * @returns {AbstractLargeNumber} The larger of the two values.
             */
            function findMaximum(value1, value2) {
                value1 = parseAnyInputToLargeNumber(value1);
                value2 = parseAnyInputToLargeNumber(value2);
                return value1.isGreater(value2) ? value1 : value2;
            }

            /**
             * Finds the minimum of two LargeNumber instances.
             * @param {any} value1 - First value.
             * @param {any} value2 - Second value.
             * @returns {AbstractLargeNumber} The smaller of the two values.
             */
            function findMinimum(value1, value2) {
                value1 = parseAnyInputToLargeNumber(value1);
                value2 = parseAnyInputToLargeNumber(value2);
                return value1.isLesser(value2) ? value1 : value2;
            }

            /**
             * Computes the Greatest Common Divisor (GCD) of two LargeNumber instances using a binary GCD algorithm.
             * @param {any} valueA - First value.
             * @param {any} valueB - Second value.
             * @returns {AbstractLargeNumber} The GCD of the two values.
             */
            function calculateGreatestCommonDivisor(valueA, valueB) {
                let currentA = parseAnyInputToLargeNumber(valueA).absoluteValue();
                let currentB = parseAnyInputToLargeNumber(valueB).absoluteValue();

                if (currentA.isEqualTo(currentB)) return currentA;
                if (currentA.isZeroValue()) return currentB;
                if (currentB.isZeroValue()) return currentA;

                let commonFactorOfTwo = LargeNumberConstructor._precomputed[1]; // Keep track of common factors of 2
                let lsbValue; // Lowest set bit value

                // Step 1: Remove common factors of 2
                while (currentA.isEvenValue() && currentB.isEvenValue()) {
                    lsbValue = findMinimum(LargeNumberConstructor(getRoughLowestOneBit(currentA)), LargeNumberConstructor(getRoughLowestOneBit(currentB)));
                    currentA = currentA.getQuotient(lsbValue);
                    currentB = currentB.getQuotient(lsbValue);
                    commonFactorOfTwo = commonFactorOfTwo.multiply(lsbValue);
                }

                // Step 2: Remove factors of 2 from the remaining odd number `currentA`
                while (currentA.isEvenValue()) {
                    currentA = currentA.getQuotient(LargeNumberConstructor(getRoughLowestOneBit(currentA)));
                }

                // Step 3: Apply Euclidean algorithm with optimization for even numbers
                do {
                    // Remove factors of 2 from `currentB`
                    while (currentB.isEvenValue()) {
                        currentB = currentB.getQuotient(LargeNumberConstructor(getRoughLowestOneBit(currentB)));
                    }
                    // Ensure currentA <= currentB by swapping if necessary
                    if (currentA.isGreater(currentB)) {
                        let temp = currentB;
                        currentB = currentA;
                        currentA = temp;
                    }
                    currentB = currentB.subtract(currentA); // b = b - a
                } while (!currentB.isZeroValue());

                // Step 4: Multiply `currentA` by the common factors of 2 found in Step 1
                return commonFactorOfTwo.isOneOrMinusOne() ? currentA : currentA.multiply(commonFactorOfTwo);
            }

            /**
             * Computes the Least Common Multiple (LCM) of two LargeNumber instances.
             * LCM(a,b) = (|a*b|) / GCD(a,b)
             * @param {any} valueA - First value.
             * @param {any} valueB - Second value.
             * @returns {AbstractLargeNumber} The LCM of the two values.
             */
            function calculateLeastCommonMultiple(valueA, valueB) {
                const absA = parseAnyInputToLargeNumber(valueA).absoluteValue();
                const absB = parseAnyInputToLargeNumber(valueB).absoluteValue();
                if (absA.isZeroValue() || absB.isZeroValue()) return LargeNumberConstructor._precomputed[0]; // LCM with 0 is 0
                return absA.getQuotient(calculateGreatestCommonDivisor(absA, absB)).multiply(absB);
            }

            /**
             * Generates a random LargeNumber between two given bounds (inclusive).
             * @param {any} lowerBound - The lower bound.
             * @param {any} upperBound - The upper bound.
             * @param {function(): number} [rngFunction] - Optional custom random number generator (defaults to Math.random).
             * @returns {AbstractLargeNumber} A random number within the specified range.
             */
            function getRandomBetween(lowerBound, upperBound, rngFunction) {
                lowerBound = parseAnyInputToLargeNumber(lowerBound);
                upperBound = parseAnyInputToLargeNumber(upperBound);
                const actualRNG = rngFunction || Math.random;

                const low = findMinimum(lowerBound, upperBound);
                const high = findMaximum(lowerBound, upperBound);
                const rangeSize = high.subtract(low).add(LargeNumberConstructor._precomputed[1]); // range = high - low + 1

                if (rangeSize.isSmallNumber) {
                    return low.add(Math.floor(actualRNG() * rangeSize.toNativeNumber()));
                }

                // For large ranges, generate random numbers chunk by chunk
                const rangeChunkRepresentation = convertToBaseRepresentation(rangeSize, LargeNumberConstructor(DIGIT_CHUNK_BASE)).digitChunks;
                const generatedRandomChunks = [];
                let isRestrictedByRangeLimit = true; // Flag to indicate if digits are constrained by rangeSize's chunks

                for (let i = 0; i < rangeChunkRepresentation.length; i++) {
                    const currentTopLimit = isRestrictedByRangeLimit ? rangeChunkRepresentation[i] : DIGIT_CHUNK_BASE;
                    const randomDigit = truncateNumberTowardsZero(actualRNG() * currentTopLimit);
                    generatedRandomChunks.push(randomDigit);
                    if (randomDigit < currentTopLimit) isRestrictedByRangeLimit = false; // If a digit is less than max, subsequent digits are no longer restricted
                }
                return low.add(LargeNumberConstructor.fromChunkArray(generatedRandomChunks, DIGIT_CHUNK_BASE, false));
            }

            // --- Base Conversion and String Representation ---

            /**
             * Parses a string representation of a number in a given base into a LargeNumber.
             * @param {string} stringValue - The string to parse.
             * @param {number} baseValue - The base of the number (e.g., 2, 10, 16).
             * @param {string} [alphabetString] - Custom alphabet for digits (defaults to DEFAULT_NUMERAL_ALPHABET).
             * @param {boolean} [caseSensitivity] - Whether the alphabet parsing is case-sensitive.
             * @returns {AbstractLargeNumber} The parsed LargeNumber.
             */
            const parseInputStringWithBase = function (stringValue, baseValue, alphabetString, caseSensitivity) {
                alphabetString = alphabetString || DEFAULT_NUMERAL_ALPHABET;
                stringValue = String(stringValue);

                // Convert to lowercase if case-insensitive parsing is requested
                if (!caseSensitivity) {
                    stringValue = stringValue.toLowerCase();
                    alphabetString = alphabetString.toLowerCase();
                }

                const strLength = stringValue.length;
                const absoluteBase = Math.abs(baseValue);
                const alphabetToNumericMap = {}; // Map characters to their numeric values
                for (let i = 0; i < alphabetString.length; i++) {
                    alphabetToNumericMap[alphabetString[i]] = i;
                }

                // Validate all characters in the input string against the base and alphabet
                for (let i = 0; i < strLength; i++) {
                    const char = stringValue[i];
                    if (char === "-") continue; // Hyphen is allowed for negative numbers
                    if (char in alphabetToNumericMap) {
                        if (alphabetToNumericMap[char] >= absoluteBase) {
                            if (char === "1" && absoluteBase === 1) continue; // Special case: base 1 only uses '1'
                            throw new Error(`Character '${char}' is not a valid digit in base ${baseValue}.`);
                        }
                    } else if (char !== '<' && char !== '>') { // Allow custom digit notation like <123>
                        throw new Error(`Character '${char}' is not a valid character in the specified alphabet.`);
                    }
                }

                const baseAsLargeNum = parseAnyInputToLargeNumber(baseValue);
                const extractedDigits = [];
                const isNegativeInput = stringValue[0] === "-";

                // Extract digits, handling potential custom digit notation (e.g., "<123>")
                for (let i = (isNegativeInput ? 1 : 0); i < stringValue.length; i++) {
                    const char = stringValue[i];
                    if (char in alphabetToNumericMap) {
                        extractedDigits.push(parseAnyInputToLargeNumber(alphabetToNumericMap[char]));
                    } else if (char === "<") {
                        const startIndex = i;
                        do { i++; } while (stringValue[i] !== ">" && i < stringValue.length);
                        extractedDigits.push(parseAnyInputToLargeNumber(stringValue.slice(startIndex + 1, i)));
                    }
                    // Other invalid characters should have been caught by the initial validation loop
                }
                return constructFromDigitChunks(extractedDigits, baseAsLargeNum, isNegativeInput);
            };

            /**
             * Constructs a LargeNumber from an array of digits (represented as LargeNumbers) in a given base.
             * This performs `Sum(digit_i * base^i)`.
             * @param {AbstractLargeNumber[]} digitArray - An array of LargeNumber digits.
             * @param {AbstractLargeNumber} baseNumber - The base of the number.
             * @param {boolean} isNegativeResult - Whether the resulting number should be negative.
             * @returns {AbstractLargeNumber} The constructed LargeNumber.
             */
            function constructFromDigitChunks(digitArray, baseNumber, isNegativeResult) {
                let accumulatedValue = LargeNumberConstructor._precomputed[0];
                let currentPower = LargeNumberConstructor._precomputed[1]; // Starts as base^0 = 1

                // Iterate through digits from right to left (least significant to most significant)
                for (let i = digitArray.length - 1; i >= 0; i--) {
                    accumulatedValue = accumulatedValue.add(digitArray[i].times(currentPower));
                    currentPower = currentPower.times(baseNumber);
                }
                return isNegativeResult ? accumulatedValue.flipSign() : accumulatedValue;
            }

            /**
             * Converts a single digit (number) to its string representation using a given alphabet.
             * Handles digits larger than the alphabet length by enclosing them in angle brackets.
             * @param {number} digitValue - The numeric value of the digit.
             * @param {string} [alphabet] - The alphabet string to use.
             * @returns {string} The string representation of the digit.
             */
            function convertDigitToString(digitValue, alphabet) {
                alphabet = alphabet || DEFAULT_NUMERAL_ALPHABET;
                if (digitValue < alphabet.length) {
                    return alphabet[digitValue];
                }
                return "<" + digitValue + ">"; // Fallback for digits outside the provided alphabet
            }

            /**
             * Converts a LargeNumber to its representation in a specified base, as an array of digit values.
             * This function extracts digits by repeatedly dividing by the base and taking remainders.
             * @param {AbstractLargeNumber} numberToConvert - The number to convert.
             * @param {AbstractLargeNumber} targetBase - The target base.
             * @returns {{digitChunks: number[], isNegative: boolean}} An object containing the digit array and the sign.
             */
            function convertToBaseRepresentation(numberToConvert, targetBase) {
                if (targetBase.isZeroValue()) {
                    if (numberToConvert.isZeroValue()) return { digitChunks: [0], isNegative: false };
                    throw new Error("Cannot convert non-zero numbers to base 0.");
                }
                if (targetBase.isEqualTo(LargeNumberConstructor._precomputed[-1])) {
                    // Special handling for base -1 (negabase representation)
                    if (numberToConvert.isZeroValue()) return { digitChunks: [0], isNegative: false };
                    if (numberToConvert.isNegativeValue()) {
                        // Example: -5 in base -1 is 1011 (1*(-1)^3 + 0*(-1)^2 + 1*(-1)^1 + 1*(-1)^0 = -1+1-1+1 = -5)
                        // This part is a simplified approximation from original, potentially for fixed N
                        const absN = numberToConvert.absoluteValue().toNativeNumber();
                        const negabaseDigits = [];
                        for (let i = 0; i < absN; i++) negabaseDigits.push(1, 0); // Simplified representation
                        return { digitChunks: negabaseDigits, isNegative: false };
                    }
                    // Example: 5 in base -1 is 1101 (1*(-1)^3 + 1*(-1)^2 + 0*(-1)^1 + 1*(-1)^0 = -1+1+0+1 = 5)
                    const absN = numberToConvert.toNativeNumber();
                    const negabaseDigits = [];
                    for (let i = 0; i < absN - 1; i++) negabaseDigits.push(0, 1);
                    negabaseDigits.unshift(1); // Prepend the most significant digit
                    return { digitChunks: negabaseDigits, isNegative: false };
                }

                let isResultNegative = false;
                if (numberToConvert.isNegativeValue() && targetBase.isPositiveValue()) {
                    isResultNegative = true;
                    numberToConvert = numberToConvert.absoluteValue(); // Work with absolute value for conversion
                }

                if (targetBase.isOneOrMinusOne()) {
                    if (numberToConvert.isZeroValue()) return { digitChunks: [0], isNegative: false };
                    // Base 1 or -1 representation: a sequence of 1s, count equals abs(N)
                    return {
                        digitChunks: Array(numberToConvert.toNativeNumber()).fill(1),
                        isNegative: isResultNegative
                    };
                }

                const outputDigits = [];
                let currentNumber = numberToConvert;
                let divisionAndRemainder;

                // Repeatedly divide by the target base and collect remainders as digits
                while (currentNumber.isNegativeValue() || currentNumber.compareAbsoluteValues(targetBase) >= 0) {
                    divisionAndRemainder = currentNumber.getQuotientAndRemainder(targetBase);
                    currentNumber = divisionAndRemainder.quotient;
                    let currentDigit = divisionAndRemainder.remainder;

                    // Adjust for negative remainders (common in some division algorithms)
                    if (currentDigit.isNegativeValue()) {
                        currentDigit = targetBase.minus(currentDigit).absoluteValue(); // Make digit positive
                        currentNumber = currentNumber.incrementValue(); // Adjust quotient
                    }
                    outputDigits.push(currentDigit.toNativeNumber());
                }
                outputDigits.push(currentNumber.toNativeNumber()); // Add the final quotient as the most significant digit
                return { digitChunks: outputDigits.reverse(), isNegative: isResultNegative }; // Reverse to get correct order
            }

            /**
             * Converts a LargeNumber to its string representation in a given base.
             * @param {AbstractLargeNumber} num - The number to convert.
             * @param {number} base - The target base.
             * @param {string} [alphabet] - Custom alphabet for digits.
             * @returns {string} The string representation of the number.
             */
            function toBaseStringRepresentation(num, base, alphabet) {
                const { digitChunks: digits, isNegative } = convertToBaseRepresentation(num, LargeNumberConstructor(base));
                const digitStrings = digits.map((x) => convertDigitToString(x, alphabet));
                return (isNegative ? "-" : "") + digitStrings.join('');
            }

            MultiDigitNumber.prototype.toChunkArray = function (radix) {
                return convertToBaseRepresentation(this, LargeNumberConstructor(radix));
            };
            SingleDigitNumber.prototype.toChunkArray = function (radix) {
                return convertToBaseRepresentation(this, LargeNumberConstructor(radix));
            };
            PlatformBigIntWrapper.prototype.toChunkArray = function (radix) {
                return convertToBaseRepresentation(this, LargeNumberConstructor(radix));
            };

            MultiDigitNumber.prototype.toFormattedString = function (radix, alphabet) {
                if (radix === externalUndefined) radix = 10;
                if (radix !== 10) return toBaseStringRepresentation(this, radix, alphabet);

                const currentChunks = this.digitChunks;
                let lastChunkIndex = currentChunks.length - 1;
                let stringResult = String(currentChunks[lastChunkIndex]); // Start with the most significant chunk
                const zeroPaddingTemplate = "0000000"; // For DIGIT_CHUNK_BASE = 1e7, each chunk needs 7 digits

                // Iterate through remaining chunks, prepending padding zeros as necessary
                while (--lastChunkIndex >= 0) {
                    let chunkString = String(currentChunks[lastChunkIndex]);
                    stringResult += zeroPaddingTemplate.slice(chunkString.length) + chunkString;
                }
                const finalSignPrefix = this.isNegativeFlag ? "-" : "";
                return finalSignPrefix + stringResult;
            };

            SingleDigitNumber.prototype.toFormattedString = function (radix, alphabet) {
                if (radix === externalUndefined) radix = 10;
                if (radix !== 10) return toBaseStringRepresentation(this, radix, alphabet);
                return String(this.value);
            };

            PlatformBigIntWrapper.prototype.toFormattedString = SingleDigitNumber.prototype.toFormattedString; // Native BigInt uses same string conversion for base 10

            // JSON serialization method
            PlatformBigIntWrapper.prototype.serializeToJson = MultiDigitNumber.prototype.serializeToJson = SingleDigitNumber.prototype.serializeToJson = function () { return this.toFormattedString(); };

            // --- Value Conversion to Native JavaScript Types ---

            MultiDigitNumber.prototype.valueOfAsNumber = function () {
                // Converting a large number to a native JS number can lose precision.
                // This method is for compatibility but should be used with caution.
                return parseInt(this.toFormattedString(), 10);
            };
            MultiDigitNumber.prototype.toNativeNumber = MultiDigitNumber.prototype.valueOfAsNumber; // Alias

            SingleDigitNumber.prototype.valueOfAsNumber = function () {
                return this.value;
            };
            SingleDigitNumber.prototype.toNativeNumber = SingleDigitNumber.prototype.valueOfAsNumber; // Alias

            PlatformBigIntWrapper.prototype.valueOfAsNumber = PlatformBigIntWrapper.prototype.toNativeNumber = function () {
                // Similarly, converting native BigInt to native JS number can lose precision.
                return parseInt(this.toFormattedString(), 10);
            };

            // --- Parsing Input Values ---

            /**
             * Parses a string input into a LargeNumber. Handles scientific notation,
             * checks for valid integer format, and dispatches to appropriate constructors.
             * @param {string} stringInput - The string to parse.
             * @returns {AbstractLargeNumber} The parsed LargeNumber.
             */
            function parseNumericString(stringInput) {
                // Attempt to parse as a small integer first for performance
                if (isWithinSafeJSRange(+stringInput)) {
                    const num = +stringInput;
                    if (num === truncateNumberTowardsZero(num)) { // Check if it's a whole number
                        return isNativeBigIntSupported ? new PlatformBigIntWrapper(BigInt(num)) : new SingleDigitNumber(num);
                    }
                    throw new Error(`Invalid integer: '${stringInput}' is not a whole number.`);
                }

                let isNegativeString = stringInput[0] === "-";
                if (isNegativeString) stringInput = stringInput.slice(1);

                const scientificNotationParts = stringInput.split(/e/i);
                if (scientificNotationParts.length > 2) throw new Error(`Invalid integer: '${stringInput}' contains multiple 'e' characters.`);

                if (scientificNotationParts.length === 2) {
                    let exponentString = scientificNotationParts[1];
                    if (exponentString[0] === "+") exponentString = exponentString.slice(1);
                    const exponentNumeric = +exponentString;

                    if (exponentNumeric !== truncateNumberTowardsZero(exponentNumeric) || !isWithinSafeJSRange(exponentNumeric)) {
                        throw new Error(`Invalid integer: '${exponentNumeric}' is not a valid integer exponent.`);
                    }

                    let mainNumberPart = scientificNotationParts[0];
                    const decimalPointIndex = mainNumberPart.indexOf(".");
                    if (decimalPointIndex >= 0) {
                        // Adjust exponent for decimal places in the mantissa
                        exponentNumeric -= (mainNumberPart.length - decimalPointIndex - 1);
                        mainNumberPart = mainNumberPart.slice(0, decimalPointIndex) + mainNumberPart.slice(decimalPointIndex + 1);
                    }

                    if (exponentNumeric < 0) throw new Error("Cannot represent integers with negative exponents in this format.");
                    // Append zeros to the main part based on the adjusted exponent
                    mainNumberPart += (new Array(exponentNumeric + 1)).join("0");
                    stringInput = mainNumberPart;
                }

                // Final regex validation for integer format
                const integerFormatRegex = /^([0-9][0-9]*)$/;
                if (!integerFormatRegex.test(stringInput)) throw new Error(`Invalid integer format: '${stringInput}'.`);

                if (isNativeBigIntSupported) {
                    return new PlatformBigIntWrapper(BigInt(isNegativeString ? "-" + stringInput : stringInput));
                }

                // Convert string to chunk array for MultiDigitNumber representation
                const chunkArray = [];
                const totalStringLength = stringInput.length;
                const digitsPerChunk = LOG10_DIGIT_CHUNK_BASE;
                let currentMax = totalStringLength;