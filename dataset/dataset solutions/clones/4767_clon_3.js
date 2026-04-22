// This file implements a custom module bundling system, similar to Webpack,
// and includes a large BigNumber library.
// The main application logic calculates the number of divisors for N! (N factorial)
// modulo 1,000,000,007, where N is read from standard input.

// Outer IIFE for the module loader and execution environment.
(function(moduleDefinitions) {
    // Cache for already loaded modules.
    const moduleCache = {};

    /**
     * Custom module 'require' function.
     * @param {number} moduleID - The ID of the module to load.
     * @returns {object} The exports of the required module.
     */
    function requireModule(moduleID) {
        // Check if module is already in cache.
        if (moduleCache[moduleID]) {
            return moduleCache[moduleID].exports;
        }

        // If not in cache, create a new module entry.
        const currentModule = moduleCache[moduleID] = {
            id: moduleID,
            isLoaded: false,
            exports: {}
        };

        // Execute the module function, populating its exports.
        // The module function receives (module, module.exports, requireModule)
        moduleDefinitions[moduleID].call(
            currentModule.exports,
            currentModule,
            currentModule.exports,
            requireModule
        );

        // Mark module as loaded.
        currentModule.isLoaded = true;
        return currentModule.exports;
    }

    // Attach module definitions and cache to the require function for internal use.
    requireModule.moduleDefs = moduleDefinitions;
    requireModule.cache = moduleCache;

    /**
     * Defines a getter property for module exports.
     * @param {object} targetObject - The object to define the property on.
     * @param {string} propertyName - The name of the property.
     * @param {function} getterFunction - The getter function for the property.
     */
    requireModule.defineGetter = function(targetObject, propertyName, getterFunction) {
        // Ensure the property is not already defined.
        if (!Object.prototype.hasOwnProperty.call(targetObject, propertyName)) {
            Object.defineProperty(targetObject, propertyName, {
                enumerable: true, // Make it enumerable.
                get: getterFunction // Set the getter.
            });
        }
    };

    /**
     * Marks a module as an ES module and defines Symbol.toStringTag.
     * @param {object} moduleExports - The exports object of the module.
     */
    requireModule.markAsEsModule = function(moduleExports) {
        // Set Symbol.toStringTag for better module identification.
        if (typeof Symbol !== "undefined" && Symbol.toStringTag) {
            Object.defineProperty(moduleExports, Symbol.toStringTag, {
                value: "Module"
            });
        }
        // Mark as ES module.
        Object.defineProperty(moduleExports, "__esModule", {
            value: true
        });
    };

    /**
     * Interop default export helper.
     * @param {any} moduleValue - The module value.
     * @param {number} flag - Bitmask flag for interop behavior.
     * @returns {any} The interop-compatible module export.
     */
    requireModule.interopDefault = function(moduleValue, flag) {
        // If flag indicates, resolve module value using requireModule.
        if (flag & 1) {
            moduleValue = requireModule(moduleValue);
        }
        // If flag indicates raw value or already ES module, return directly.
        if (flag & 8) {
            return moduleValue;
        }
        if (flag & 4 && typeof moduleValue === "object" && moduleValue && moduleValue.__esModule) {
            return moduleValue;
        }

        // Create a new object for interop.
        const interopObject = Object.create(null);
        requireModule.markAsEsModule(interopObject);

        // Define 'default' property.
        Object.defineProperty(interopObject, "default", {
            enumerable: true,
            value: moduleValue
        });

        // If flag indicates, copy all properties from moduleValue.
        if (flag & 2 && typeof moduleValue !== "string") {
            for (const propName in moduleValue) {
                requireModule.defineGetter(interopObject, propName, ((key) => moduleValue[key]).bind(null, propName));
            }
        }
        return interopObject;
    };

    /**
     * Get default export helper.
     * @param {object} moduleExports - The module exports object.
     * @returns {function} A function that returns the default export.
     */
    requireModule.getDefaultExport = function(moduleExports) {
        const defaultExportFn = moduleExports && moduleExports.__esModule ?
            () => moduleExports.default :
            () => moduleExports;
        // Define a getter 'a' for the default export function itself.
        requireModule.defineGetter(defaultExportFn, "a", defaultExportFn);
        return defaultExportFn;
    };

    /**
     * Checks if an object has a property.
     * @param {object} obj - The object to check.
     * @param {string} prop - The property name.
     * @returns {boolean} True if the object has the property, false otherwise.
     */
    requireModule.hasProperty = function(obj, prop) {
        return Object.prototype.hasOwnProperty.call(obj, prop);
    };

    // Set public path (empty for this setup).
    requireModule.publicPath = "";

    // Kick off the application by requiring the entry module (module 0).
    // The `requireModule.startModule = 0` assignment is a common Webpack pattern
    // for indicating the entry point, but here `requireModule(0)` directly uses it.
    requireModule(requireModule.startModule = 0);
})
// Array of module definitions. Each element is a function representing a module.
([
    // Module 0: Main entry point for the application.
    // This module reads input from stdin and passes it to Module 1.
    function(exportsObj, moduleData, dynamicRequire) {
        const fileSystem = dynamicRequire(3); // Import the 'fs' module.
        const primaryProcessor = dynamicRequire(1); // Import the main logic module.

        try {
            // Read input from /dev/stdin, decode as UTF-8, and split by newlines.
            const rawInput = fileSystem.readFileSync("/dev/stdin", "UTF-8");
            const inputLines = rawInput.split("\n");

            // Basic validation: ensure input is not empty.
            if (!inputLines || inputLines.length === 0 || inputLines[0].trim() === "") {
                console.error("Error: No input provided. Please provide an integer N.");
                return;
            }

            // Execute the primary processing logic with the input lines.
            primaryProcessor(inputLines);
        } catch (error) {
            console.error("An error occurred while processing input:", error.message);
            // Optionally, provide a default or exit gracefully.
        }
    },

    // Module 1: Core logic for calculating the number of divisors of N!.
    // This module depends on the BigNumber library (Module 2).
    function(exportedResult, moduleData, currentRequire) {
        const BigNumberClass = currentRequire(2); // Import the BigNumber library.

        // The main function exported by this module.
        exportedResult.exports = function(inputLines) {
            // Parse the first line of input as the maximum value N.
            const maxValN = Number(inputLines[0]);

            // Validate N.
            if (isNaN(maxValN) || maxValN < 2) {
                console.error("Invalid input: N must be a number greater than or equal to 2.");
                return;
            }

            // Map to store the sum of exponents for each prime factor in N!.
            // E.g., for N=4, 4! = 24 = 2^3 * 3^1. primeExponentsMap = {2: 3, 3: 1}.
            const primeExponentsMap = {};

            // Iterate from 2 up to N to find prime factors and their exponents.
            for (let currentNum = 2; currentNum <= maxValN; currentNum++) {
                let divisorFoundCounter = 0; // Counts how many distinct prime factors are found for currentNum.
                let tempNum = currentNum; // Temporary variable for factorization.

                // Iterate through potential divisors to factorize currentNum.
                // This checks for prime factors that have already been identified
                // and accumulated in primeExponentsMap.
                for (let potentialDivisor = 2; potentialDivisor < currentNum; potentialDivisor++) {
                    // If potentialDivisor divides currentNum AND it's a prime we've tracked.
                    if (tempNum % potentialDivisor === 0 && primeExponentsMap[potentialDivisor]) {
                        divisorFoundCounter++; // Mark that a prime divisor was found.
                        let factorCount = 0; // Count how many times potentialDivisor divides currentNum.
                        while (tempNum % potentialDivisor === 0) {
                            tempNum /= potentialDivisor;
                            factorCount++;
                        }
                        // Add the count to the total exponent for this prime factor.
                        // Ensure the entry exists before adding.
                        primeExponentsMap[potentialDivisor] = (primeExponentsMap[potentialDivisor] || 0) + factorCount;
                    }
                    // Optimization: if tempNum becomes 1, all factors found.
                    if (tempNum === 1) break;
                }

                // If no divisors were found from the existing prime list, and tempNum is still original currentNum,
                // then currentNum is a prime number itself.
                if (divisorFoundCounter === 0 && tempNum === currentNum) {
                    // Initialize or increment the exponent for this new prime.
                    primeExponentsMap[currentNum] = (primeExponentsMap[currentNum] || 0) + 1;
                }
            }

            // Calculate the total number of divisors using the formula:
            // (exponent_p1 + 1) * (exponent_p2 + 1) * ... * (exponent_pk + 1)
            // Use BigNumber to handle potentially large intermediate products.
            let totalDivisors = new BigNumberClass(1);

            for (const primeFactor in primeExponentsMap) {
                if (primeExponentsMap.hasOwnProperty(primeFactor)) {
                    const exponent = primeExponentsMap[primeFactor];
                    const term = new BigNumberClass(exponent).plus(1);
                    totalDivisors = totalDivisors.times(term);
                }
            }

            // Apply modulo 1,000,000,007 to the final result.
            const MODULO_CONSTANT = 1000000007;
            totalDivisors = totalDivisors.mod(MODULO_CONSTANT);

            // Output the final result to the console.
            console.log(totalDivisors.toString());
        };
    },

    // Module 2: The BigNumber.js library, extensively refactored and modified.
    function(exportsContext, moduleExports, requireFunc) {
        // Ensure "use strict" is enabled for this module.
        "use strict";

        // Internal alias for the BigNumber constructor.
        let BigNumberConstructor;

        (function(globalContext) {
            // Regex for validating numeric strings.
            const NUMERIC_STRING_PATTERN = /^-?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i;
            // Math utility functions.
            const ceilFunction = Math.ceil;
            const floorFunction = Math.floor;

            // Error messages.
            const ERR_PREFIX = "[BigDecimal Error] ";
            const SIG_DIGIT_WARNING = ERR_PREFIX + "Number primitive has more than 15 significant digits: ";

            // Constants for internal digit representation.
            const BASE_POWER_CHUNK = 1e14; // Max value for a single coefficient 'chunk'.
            const DIGITS_PER_CHUNK = 14; // Number of digits in BASE_POWER_CHUNK.
            const MAX_SAFE_JS_INTEGER = 9007199254740991; // 2^53 - 1

            // Pre-computed powers of 10.
            const POWERS_OF_TEN_ARRAY = [
                1, 10, 100, 1e3, 1e4, 1e5, 1e6, 1e7, 1e8, 1e9, 1e10, 1e11, 1e12, 1e13
            ];
            // Larger chunk bases for specific internal operations.
            const MEGA_CHUNK_BASE = 1e7;
            const GIGA_CHUNK_BASE = 1e9;

            /**
             * Returns the floor of a number, handling negative numbers correctly.
             * @param {number} value - The number.
             * @returns {number} The floor integer.
             */
            function safeFloor(value) {
                const integerPart = value | 0;
                return value > 0 || value === integerPart ? integerPart : integerPart - 1;
            }

            /**
             * Converts a coefficient array into a string representation.
             * @param {number[]} coefficientArray - Array of number coefficients.
             * @returns {string} The concatenated string.
             */
            function formatCoefficientArray(coefficientArray) {
                let index = 1;
                const arrayLength = coefficientArray.length;
                let resultString = coefficientArray[0] + "";

                // Concatenate subsequent chunks, padding with leading zeros if necessary.
                while (index < arrayLength) {
                    let chunkString = coefficientArray[index++] + "";
                    let paddingNeeded = DIGITS_PER_CHUNK - chunkString.length;
                    while (paddingNeeded--) {
                        chunkString = "0" + chunkString;
                    }
                    resultString += chunkString;
                }

                // Remove trailing zeros.
                let strLen = resultString.length;
                while (strLen > 0 && resultString.charCodeAt(--strLen) === 48); // ASCII '0'
                return resultString.slice(0, strLen + 1 || 1);
            }

            /**
             * Compares two BigNumber instances.
             * @param {BigNumber} numA - First BigNumber.
             * @param {BigNumber} numB - Second BigNumber.
             * @returns {number} -1 if numA < numB, 1 if numA > numB, 0 if numA == numB.
             */
            function compareBigNumbers(numA, numB) {
                const coeffsA = numA.coeffs;
                const coeffsB = numB.coeffs;
                const signA = numA.sign;
                const signB = numB.sign;
                const exponentA = numA.exponent;
                const exponentB = numB.exponent;

                // Handle NaN or zero cases.
                if (!signA || !signB) {
                    return (!signA) ? ((!signB) ? 0 : -signB) : signA; // NaN checks.
                }

                // Different signs.
                if (signA !== signB) {
                    return signA;
                }

                // Both are zero.
                if (!coeffsA || !coeffsB) {
                    return (exponentA === exponentB) ? 0 : ((!coeffsA) ? (exponentB ? signA : 0) : -signA);
                }

                // Same sign, compare exponents.
                if (exponentA !== exponentB) {
                    return (exponentA > exponentB) ? signA : -signA;
                }

                // Same sign and exponent, compare coefficients.
                const lenA = coeffsA.length;
                const lenB = coeffsB.length;
                const minLen = (lenA < lenB) ? lenA : lenB;

                for (let i = 0; i < minLen; i++) {
                    if (coeffsA[i] !== coeffsB[i]) {
                        return (coeffsA[i] > coeffsB[i]) ? signA : -signA;
                    }
                }

                return (lenA === lenB) ? 0 : ((lenA > lenB) ? signA : -signA);
            }

            /**
             * Validates an argument against a range and type.
             * @param {number} value - The argument value.
             * @param {number} min - Minimum allowed value.
             * @param {number} max - Maximum allowed value.
             * @param {string} argName - Name of the argument for error messages.
             */
            function validateArgument(value, min, max, argName) {
                if (value < min || value > max || value !== floorFunction(value)) {
                    throw Error(ERR_PREFIX + (argName || "Argument") +
                        (typeof value === "number" ?
                            (value < min || value > max ? " out of range: " : " not an integer: ") :
                            " not a primitive number: ") + String(value));
                }
            }

            /**
             * Checks if a BigNumber's coefficient array represents an odd number.
             * @param {BigNumber} bigNum - The BigNumber instance.
             * @returns {boolean} True if odd, false otherwise.
             */
            function isBigNumberOdd(bigNum) {
                const lastCoeffIndex = bigNum.coeffs.length - 1;
                return safeFloor(bigNum.exponent / DIGITS_PER_CHUNK) === lastCoeffIndex &&
                    bigNum.coeffs[lastCoeffIndex] % 2 !== 0;
            }

            /**
             * Formats a number string into scientific notation.
             * @param {string} numStr - The number string.
             * @param {number} exponent - The exponent.
             * @returns {string} Formatted string.
             */
            function formatToExponential(numStr, exponent) {
                const decimalPoint = numStr.length > 1 ? numStr.charAt(0) + "." + numStr.slice(1) : numStr;
                const sign = exponent < 0 ? "e" : "e+";
                return decimalPoint + sign + exponent;
            }

            /**
             * Formats a number string into decimal notation.
             * @param {string} numStr - The number string.
             * @param {number} exponent - The exponent.
             * @param {string} padChar - Character to use for padding (usually '0').
             * @returns {string} Formatted string.
             */
            function formatToDecimal(numStr, exponent, padChar) {
                let result = numStr;
                let adjustedExponent = exponent + 1;

                if (adjustedExponent < 0) { // Add leading zeros for negative exponents.
                    let prefix = padChar + ".";
                    while (++adjustedExponent) {
                        prefix += padChar;
                    }
                    result = prefix + result;
                } else if (adjustedExponent > result.length) { // Add trailing zeros for large exponents.
                    let suffix = "";
                    while (adjustedExponent-- > result.length) {
                        suffix += padChar;
                    }
                    result += suffix;
                } else if (adjustedExponent < result.length) { // Insert decimal point.
                    result = result.slice(0, adjustedExponent) + "." + result.slice(adjustedExponent);
                }
                return result;
            }

            // BigNumber prototype object.
            const BigNumberPrototype = {
                constructor: BigNumber,
                toString: null, // Will be assigned later.
                valueOf: null // Will be assigned later.
            };

            // Global BigNumber constants.
            const ONE_BIG_NUMBER = new BigNumber(1);

            // Configuration defaults.
            let globalDecimalPlaces = 20;
            let globalRoundingMode = 4; // ROUND_HALF_UP
            let globalExpAtLower = -7;
            let globalExpAtUpper = 21;
            let globalRangeLower = -1e7;
            let globalRangeUpper = 1e7;
            let globalCryptoEnabled = false;
            let globalModuloMode = 1; // ROUND_DOWN
            let globalPowPrecision = 0;
            const globalFormatConfig = {
                prefix: "",
                groupSize: 3,
                secondaryGroupSize: 0,
                groupSeparator: ",",
                decimalSeparator: ".",
                fractionGroupSize: 0,
                fractionGroupSeparator: " ", // Non-breaking space
                suffix: ""
            };
            let globalAlphabet = "0123456789abcdefghijklmnopqrstuvwxyz";

            /**
             * BigNumber constructor function.
             * @param {number|string|BigNumber} value - The initial value.
             * @param {number} [base] - The base of the value if it's a string.
             */
            function BigNumber(value, base) {
                const instance = this;

                // Ensure 'new' keyword is used.
                if (!(instance instanceof BigNumber)) {
                    return new BigNumber(value, base);
                }

                let numString;
                let isNumericPrimitive;
                let decimalPointIndex;
                let exponentIndex;
                let tempLength;
                let currentDigit;

                if (base == null) { // Base is not provided, assume base 10 or BigNumber instance.
                    if (value && true === value._isBigNumber) { // Copy from another BigNumber instance.
                        instance.sign = value.sign;
                        if (!value.coeffs || value.exponent > globalRangeUpper) {
                            instance.coeffs = instance.exponent = null;
                        } else if (value.exponent < globalRangeLower) {
                            instance.coeffs = [instance.exponent = 0];
                        } else {
                            instance.exponent = value.exponent;
                            instance.coeffs = value.coeffs.slice(); // Deep copy coefficients.
                        }
                        return;
                    }

                    isNumericPrimitive = (typeof value === "number") && (value * 0 === 0);
                    if (isNumericPrimitive) { // Handle number primitive.
                        instance.sign = (1 / value < 0) ? (value = -value, -1) : 1;
                        if (value === ~~value) { // Is integer.
                            for (decimalPointIndex = 0, tempLength = value; tempLength >= 10; tempLength /= 10, decimalPointIndex++);
                            if (decimalPointIndex > globalRangeUpper) {
                                instance.coeffs = instance.exponent = null;
                            } else {
                                instance.exponent = decimalPointIndex;
                                instance.coeffs = [value];
                            }
                            return;
                        }
                        numString = String(value);
                    } else { // Handle string input without base.
                        if (!NUMERIC_STRING_PATTERN.test(numString = String(value))) {
                            return parseInvalidInput(instance, numString, isNumericPrimitive);
                        }
                        instance.sign = (numString.charCodeAt(0) === 45) ? (numString = numString.slice(1), -1) : 1;
                    }

                    // Remove decimal point and adjust exponent.
                    decimalPointIndex = numString.indexOf(".");
                    if (decimalPointIndex > -1) {
                        numString = numString.replace(".", "");
                    }

                    // Handle scientific notation.
                    exponentIndex = numString.search(/e/i);
                    if (exponentIndex > 0) {
                        if (decimalPointIndex < 0) decimalPointIndex = exponentIndex;
                        decimalPointIndex += +numString.slice(exponentIndex + 1);
                        numString = numString.substring(0, exponentIndex);
                    } else if (decimalPointIndex < 0) {
                        decimalPointIndex = numString.length;
                    }
                } else { // Base is provided.
                    validateArgument(base, 2, globalAlphabet.length, "Base");
                    if (base === 10) { // If base is 10, just round and return.
                        return roundBigNumber(instance = new BigNumber(value), globalDecimalPlaces + instance.exponent + 1, globalRoundingMode);
                    }

                    numString = String(value);
                    isNumericPrimitive = (typeof value === "number");

                    if (isNumericPrimitive) {
                        if (value * 0 !== 0) return parseInvalidInput(instance, numString, isNumericPrimitive, base);
                        instance.sign = (1 / value < 0) ? (numString = numString.slice(1), -1) : 1;
                        // if (BigNumber.DEBUG && numString.replace(/^0\.0*|\./, "").length > 15) {
                        //     throw Error(SIG_DIGIT_WARNING + value);
                        // }
                    } else {
                        instance.sign = (numString.charCodeAt(0) === 45) ? (numString = numString.slice(1), -1) : 1;
                    }

                    let conversionFlag = false; // Flag for case conversion.
                    decimalPointIndex = exponentIndex = 0;
                    tempLength = numString.length;

                    // Validate digits against the alphabet for the given base.
                    for (; exponentIndex < tempLength; exponentIndex++) {
                        if (globalAlphabet.indexOf(currentDigit = numString.charAt(exponentIndex)) < 0) {
                            if (currentDigit === ".") {
                                if (exponentIndex > decimalPointIndex) {
                                    decimalPointIndex = tempLength;
                                    continue;
                                }
                            } else if (!conversionFlag &&
                                (numString === numString.toUpperCase() && (numString = numString.toLowerCase()) ||
                                 numString === numString.toLowerCase() && (numString = numString.toUpperCase()))) {
                                conversionFlag = true;
                                exponentIndex = -1; // Restart loop after case conversion.
                                decimalPointIndex = 0;
                                continue;
                            }
                            return parseInvalidInput(instance, String(value), isNumericPrimitive, base);
                        }
                    }

                    isNumericPrimitive = false; // Input is now treated as a string.
                    // Convert the number string from the given base to base 10.
                    const convertedString = convertBase(numString, base, 10, instance.sign);
                    decimalPointIndex = convertedString.indexOf(".");
                    if (decimalPointIndex > -1) {
                        numString = convertedString.replace(".", "");
                    } else {
                        decimalPointIndex = convertedString.length;
                    }
                }

                // Remove leading zeros.
                for (currentDigit = 0; currentDigit < numString.length && numString.charCodeAt(currentDigit) === 48; currentDigit++);
                // Remove trailing zeros.
                for (tempLength = numString.length; tempLength > currentDigit && numString.charCodeAt(tempLength - 1) === 48; tempLength--);

                if (numString = numString.slice(currentDigit, tempLength)) {
                    tempLength -= currentDigit; // New length of coefficient string.

                    // if (isNumericPrimitive && BigNumber.DEBUG && tempLength > 15 && (value > MAX_SAFE_JS_INTEGER || value !== floorFunction(value))) {
                    //     throw Error(SIG_DIGIT_WARNING + instance.sign * value);
                    // }

                    // Adjust exponent for decimal point.
                    decimalPointIndex = decimalPointIndex - currentDigit - 1;

                    // Handle numbers outside the configured range.
                    if (decimalPointIndex > globalRangeUpper) {
                        instance.coeffs = instance.exponent = null;
                    } else if (decimalPointIndex < globalRangeLower) {
                        instance.coeffs = [instance.exponent = 0];
                    } else {
                        instance.exponent = decimalPointIndex;
                        instance.coeffs = []; // Initialize coefficient array.

                        // Populate coefficients.
                        currentDigit = (decimalPointIndex + 1) % DIGITS_PER_CHUNK;
                        if (currentDigit < 0) currentDigit += DIGITS_PER_CHUNK;

                        if (currentDigit < tempLength) {
                            if (currentDigit) instance.coeffs.push(+(numString.slice(0, currentDigit)));
                            tempLength -= DIGITS_PER_CHUNK;
                            while (currentDigit < tempLength) {
                                instance.coeffs.push(+(numString.slice(currentDigit, currentDigit += DIGITS_PER_CHUNK)));
                            }
                            currentDigit = DIGITS_PER_CHUNK - (numString = numString.slice(currentDigit)).length;
                        } else {
                            currentDigit -= tempLength;
                        }

                        for (; currentDigit--; numString += "0");
                        instance.coeffs.push(+(numString));
                    }
                } else {
                    instance.coeffs = [instance.exponent = 0]; // Represents zero.
                }
            }

            /**
             * Formats a BigNumber to a string based on specified precision and rounding.
             * @param {BigNumber} bigNum - The BigNumber instance.
             * @param {number} [decimalPlaces] - Number of decimal places.
             * @param {number} [roundingMode] - Rounding mode.
             * @param {number} [formatType] - 1 for exponential, 2 for precision, else fixed.
             * @returns {string} The formatted string.
             */
            function formatNumberString(bigNum, decimalPlaces, roundingMode, formatType) {
                let currentCoeff;
                let currentExponent;
                let formattedString;
                let originalLength;

                if (roundingMode == null) roundingMode = globalRoundingMode;
                else validateArgument(roundingMode, 0, 8);

                if (!bigNum.coeffs) return bigNum.toString(); // NaN or Infinity.

                currentCoeff = bigNum.coeffs[0];
                currentExponent = bigNum.exponent;

                if (decimalPlaces == null) {
                    formattedString = formatCoefficientArray(bigNum.coeffs);
                    formattedString = (formatType === 1 || (formatType === 2 && (currentExponent <= globalExpAtLower || currentExponent >= globalExpAtUpper))) ?
                        formatToExponential(formattedString, currentExponent) :
                        formatToDecimal(formattedString, currentExponent, "0");
                } else if (formatType === 1 || (formatType === 2 && (decimalPlaces <= currentExponent || currentExponent <= globalExpAtLower))) {
                    // Exponential format.
                    bigNum = roundBigNumber(new BigNumber(bigNum), decimalPlaces, roundingMode);
                    originalLength = (formattedString = formatCoefficientArray(bigNum.coeffs)).length;
                    for (; originalLength < decimalPlaces; formattedString += "0", originalLength++);
                    formattedString = formatToExponential(formattedString, bigNum.exponent);
                } else {
                    // Fixed format.
                    bigNum = roundBigNumber(new BigNumber(bigNum), decimalPlaces + bigNum.exponent + 1, roundingMode);
                    formattedString = formatCoefficientArray(bigNum.coeffs);
                    currentExponent = bigNum.exponent;

                    if (currentExponent + 1 > formattedString.length) {
                        if (--decimalPlaces > 0) {
                            for (formattedString += "."; decimalPlaces--; formattedString += "0");
                        }
                    } else {
                        if ((decimalPlaces += currentExponent - formattedString.length) > 0) {
                            for (currentExponent + 1 === formattedString.length && (formattedString += "."); decimalPlaces--; formattedString += "0");
                        }
                        formattedString = formatToDecimal(formattedString, bigNum.exponent, "0");
                    }
                }
                return bigNum.sign < 0 && currentCoeff ? "-" + formattedString : formattedString;
            }

            /**
             * Reduces an array of BigNumbers to a single BigNumber based on a comparison function.
             * @param {Array<BigNumber>} bigNumArray - Array of BigNumber instances.
             * @param {function} comparisonFn - Function to compare two BigNumbers (e.g., lt, gt).
             * @returns {BigNumber} The reduced BigNumber.
             */
            function reduceBigNumbersByComparison(bigNumArray, comparisonFn) {
                let currentBigNum;
                let resultBigNum = new BigNumber(bigNumArray[0]);

                for (let i = 1; i < bigNumArray.length; i++) {
                    currentBigNum = new BigNumber(bigNumArray[i]);
                    if (!currentBigNum.sign) { // If NaN, result is NaN.
                        resultBigNum = currentBigNum;
                        break;
                    }
                    if (comparisonFn.call(resultBigNum, currentBigNum)) { // If current is 'better' than result.
                        resultBigNum = currentBigNum;
                    }
                }
                return resultBigNum;
            }

            /**
             * Normalizes a BigNumber's coefficient array and exponent after an operation.
             * @param {BigNumber} bigNum - The BigNumber instance to normalize.
             * @param {number[]} coefficients - The coefficient array.
             * @param {number} exponentOffset - The exponent offset.
             * @returns {BigNumber} The normalized BigNumber.
             */
            function normalizeBigNumber(bigNum, coefficients, exponentOffset) {
                // Remove trailing zeros from coefficients.
                let i = coefficients.length;
                while (i > 0 && coefficients[--i] === 0) {
                    coefficients.pop();
                }

                // If all coefficients are zero, set to canonical zero.
                if (!coefficients[0]) {
                    bigNum.coeffs = [bigNum.exponent = 0];
                    return bigNum;
                }

                // Determine the true exponent.
                let firstCoeff = coefficients[0];
                let firstCoeffDigits = 0;
                while (firstCoeff >= 10) {
                    firstCoeff /= 10;
                    firstCoeffDigits++;
                }

                // Adjust exponent based on the first coefficient's magnitude.
                const trueExponent = firstCoeffDigits + exponentOffset * DIGITS_PER_CHUNK - 1;

                // Handle numbers outside the configured range.
                if (trueExponent > globalRangeUpper) {
                    bigNum.coeffs = bigNum.exponent = null;
                } else if (trueExponent < globalRangeLower) {
                    bigNum.coeffs = [bigNum.exponent = 0];
                } else {
                    bigNum.exponent = trueExponent;
                    bigNum.coeffs = coefficients;
                }
                return bigNum;
            }

            /**
             * Rounds a BigNumber to a specified number of significant digits or decimal places.
             * @param {BigNumber} bigNum - The BigNumber instance to round.
             * @param {number} precision - Number of significant digits or decimal places.
             * @param {number} roundingMode - The rounding mode.
             * @param {boolean} [isPow] - Internal flag for power function.
             * @returns {BigNumber} The rounded BigNumber.
             */
            function roundBigNumber(bigNum, precision, roundingMode, isPow) {
                const coeffs = bigNum.coeffs;
                if (!coeffs) return bigNum; // NaN or Infinity.

                let firstCoeffDigits = 1;
                let currentCoeff = coeffs[0];
                while (currentCoeff >= 10) {
                    currentCoeff /= 10;
                    firstCoeffDigits++;
                }

                let digitsToShift = precision - firstCoeffDigits;
                let coeffIndex = 0;
                let roundDownDigit; // The digit that determines rounding.

                // Calculate the index of the coefficient that contains the rounding digit.
                if (digitsToShift < 0) {
                    digitsToShift += DIGITS_PER_CHUNK;
                    coeffIndex = precision; // Precision is the target coefficient index.
                } else {
                    coeffIndex = ceilFunction((digitsToShift + 1) / DIGITS_PER_CHUNK);
                }

                // If coefficient array is too short for the precision, pad with zeros.
                if (coeffIndex >= coeffs.length) {
                    if (isPow) {
                        for (; coeffs.length <= coeffIndex; coeffs.push(0));
                        currentCoeff = roundDownDigit = 0;
                        firstCoeffDigits = 1;
                        digitsToShift = (precision %= DIGITS_PER_CHUNK) - DIGITS_PER_CHUNK + 1;
                    } else {
                        // No rounding needed if precision extends beyond existing digits.
                        return bigNum;
                    }
                } else {
                    // Extract the relevant coefficient and determine the rounding digit.
                    currentCoeff = coeffs[coeffIndex];
                    firstCoeffDigits = 1;
                    while (currentCoeff >= 10) {
                        currentCoeff /= 10;
                        firstCoeffDigits++;
                    }
                    roundDownDigit = (digitsToShift = (precision %= DIGITS_PER_CHUNK) - DIGITS_PER_CHUNK + firstCoeffDigits) < 0 ? 0 :
                        (coeffs[coeffIndex] / POWERS_OF_TEN_ARRAY[firstCoeffDigits - digitsToShift - 1]) % 10 | 0;
                }

                // Determine if rounding up is needed based on rounding mode.
                isPow = isPow || precision < 0 || coeffs[coeffIndex + 1] != null ||
                    (digitsToShift < 0 ? currentCoeff : currentCoeff % POWERS_OF_TEN_ARRAY[firstCoeffDigits - digitsToShift - 1]);
                isPow = roundingMode < 4 ?
                    (roundDownDigit || isPow) && (roundingMode === 0 || roundingMode === (bigNum.sign < 0 ? 3 : 2)) :
                    roundDownDigit > 5 || (roundDownDigit === 5 && (roundingMode === 4 || isPow || (roundingMode === 6 &&
                        (digitsToShift > 0 ? (currentCoeff / POWERS_OF_TEN_ARRAY[firstCoeffDigits - digitsToShift]) :
                            (coeffs[coeffIndex - 1])) % 10 & 1) || roundingMode === (bigNum.sign < 0 ? 8 : 7)));

                // If precision is 0 or less, or if the first coefficient is 0, handle edge cases.
                if (precision < 1 || !coeffs[0]) {
                    coeffs.length = 0;
                    if (isPow) {
                        precision -= bigNum.exponent + 1;
                        coeffs[0] = POWERS_OF_TEN_ARRAY[(DIGITS_PER_CHUNK - precision % DIGITS_PER_CHUNK) % DIGITS_PER_CHUNK];
                        bigNum.exponent = -precision || 0;
                    } else {
                        coeffs[0] = bigNum.exponent = 0;
                    }
                    return bigNum;
                }

                // Perform rounding.
                if (digitsToShift === 0) { // Rounding at a chunk boundary.
                    coeffs.length = coeffIndex;
                    firstCoeffDigits = 1;
                    coeffIndex--;
                } else { // Rounding within a chunk.
                    coeffs.length = coeffIndex + 1;
                    firstCoeffDigits = POWERS_OF_TEN_ARRAY[DIGITS_PER_CHUNK - digitsToShift];
                    coeffs[coeffIndex] = safeFloor(currentCoeff / POWERS_OF_TEN_ARRAY[firstCoeffDigits - digitsToShift] % POWERS_OF_TEN_ARRAY[digitsToShift]) * firstCoeffDigits;
                }

                if (isPow) {
                    for (;;) {
                        if (coeffIndex === 0) {
                            let tempCount = 1;
                            let tempVal = coeffs[0];
                            while (tempVal >= 10) {
                                tempVal /= 10;
                                tempCount++;
                            }
                            tempVal = coeffs[0] += firstCoeffDigits;
                            firstCoeffDigits = 1;
                            while (tempVal >= 10) {
                                tempVal /= 10;
                                firstCoeffDigits++;
                            }
                            if (tempCount !== firstCoeffDigits) {
                                bigNum.exponent++;
                                if (coeffs[0] === BASE_POWER_CHUNK) coeffs[0] = 1;
                            }
                            break;
                        }
                        coeffs[coeffIndex] += firstCoeffDigits;
                        if (coeffs[coeffIndex] !== BASE_POWER_CHUNK) break;
                        coeffs[coeffIndex--] = 0;
                        firstCoeffDigits = 1;
                    }
                }

                // Remove leading zeros after rounding.
                coeffIndex = coeffs.length;
                while (coeffIndex > 0 && coeffs[--coeffIndex] === 0) {
                    coeffs.pop();
                }

                // Handle numbers outside the configured range again.
                if (bigNum.exponent > globalRangeUpper) {
                    bigNum.coeffs = bigNum.exponent = null;
                } else if (bigNum.exponent < globalRangeLower) {
                    bigNum.coeffs = [bigNum.exponent = 0];
                }

                return bigNum;
            }

            /**
             * Converts a BigNumber to its raw string representation (without formatting).
             * @param {BigNumber} bigNum - The BigNumber instance.
             * @returns {string} The raw string.
             */
            function toRawString(bigNum) {
                const exponent = bigNum.exponent;
                if (bigNum.coeffs === null) {
                    return bigNum.sign ? (bigNum.sign < 0 ? "-Infinity" : "Infinity") : "NaN";
                }
                const coeffString = formatCoefficientArray(bigNum.coeffs);
                const resultString = (exponent <= globalExpAtLower || exponent >= globalExpAtUpper) ?
                    formatToExponential(coeffString, exponent) :
                    formatToDecimal(coeffString, exponent, "0");
                return bigNum.sign < 0 ? "-" + resultString : resultString;
            }

            /**
             * Initializes BigNumber configuration.
             * @param {object} configObj - Configuration object.
             * @returns {object} Current configuration.
             */
            BigNumber.setConfiguration = BigNumber.config = function(configObj) {
                let propName, propValue;

                if (configObj != null) {
                    if (typeof configObj !== "object") {
                        throw Error(ERR_PREFIX + "Object expected: " + configObj);
                    }

                    if (configObj.hasOwnProperty(propName = "DECIMAL_PLACES")) {
                        validateArgument(propValue = configObj[propName], 0, GIGA_CHUNK_BASE, propName);
                        globalDecimalPlaces = propValue;
                    }
                    if (configObj.hasOwnProperty(propName = "ROUNDING_MODE")) {
                        validateArgument(propValue = configObj[propName], 0, 8, propName);
                        globalRoundingMode = propValue;
                    }
                    if (configObj.hasOwnProperty(propName = "EXPONENTIAL_AT")) {
                        if ((propValue = configObj[propName]) && propValue.pop) {
                            validateArgument(propValue[0], -GIGA_CHUNK_BASE, 0, propName);
                            validateArgument(propValue[1], 0, GIGA_CHUNK_BASE, propName);
                            globalExpAtLower = propValue[0];
                            globalExpAtUpper = propValue[1];
                        } else {
                            validateArgument(propValue, -GIGA_CHUNK_BASE, GIGA_CHUNK_BASE, propName);
                            globalExpAtLower = -(globalExpAtUpper = (propValue < 0 ? -propValue : propValue));
                        }
                    }
                    if (configObj.hasOwnProperty(propName = "RANGE")) {
                        if ((propValue = configObj[propName]) && propValue.pop) {
                            validateArgument(propValue[0], -GIGA_CHUNK_BASE, -1, propName);
                            validateArgument(propValue[1], 1, GIGA_CHUNK_BASE, propName);
                            globalRangeLower = propValue[0];
                            globalRangeUpper = propValue[1];
                        } else {
                            validateArgument(propValue, -GIGA_CHUNK_BASE, GIGA_CHUNK_BASE, propName);
                            if (!propValue) throw Error(ERR_PREFIX + propName + " cannot be zero: " + propValue);
                            globalRangeLower = -(globalRangeUpper = (propValue < 0 ? -propValue : propValue));
                        }
                    }
                    if (configObj.hasOwnProperty(propName = "CRYPTO")) {
                        if ((propValue = configObj[propName]) !== !!propValue) {
                            throw Error(ERR_PREFIX + propName + " not true or false: " + propValue);
                        }
                        if (propValue) {
                            if (typeof crypto === "undefined" || !crypto || (!crypto.getRandomValues && !crypto.randomBytes)) {
                                globalCryptoEnabled = !propValue; // Disable if crypto not available.
                                throw Error(ERR_PREFIX + "crypto unavailable");
                            }
                            globalCryptoEnabled = propValue;
                        } else {
                            globalCryptoEnabled = propValue;
                        }
                    }
                    if (configObj.hasOwnProperty(propName = "MODULO_MODE")) {
                        validateArgument(propValue = configObj[propName], 0, 9, propName);
                        globalModuloMode = propValue;
                    }
                    if (configObj.hasOwnProperty(propName = "POW_PRECISION")) {
                        validateArgument(propValue = configObj[propName], 0, GIGA_CHUNK_BASE, propName);
                        globalPowPrecision = propValue;
                    }
                    if (configObj.hasOwnProperty(propName = "FORMAT")) {
                        if (typeof(propValue = configObj[propName]) !== "object") {
                            throw Error(ERR_PREFIX + propName + " not an object: " + propValue);
                        }
                        Object.assign(globalFormatConfig, propValue); // Merge format config.
                    }
                    if (configObj.hasOwnProperty(propName = "ALPHABET")) {
                        if (typeof(propValue = configObj[propName]) !== "string" || /^.$|[+-.\s]|(.).*\1/.test(propValue)) {
                            throw Error(ERR_PREFIX + propName + " invalid: " + propValue);
                        }
                        globalAlphabet = propValue;
                    }
                }
                return {
                    DECIMAL_PLACES: globalDecimalPlaces,
                    ROUNDING_MODE: globalRoundingMode,
                    EXPONENTIAL_AT: [globalExpAtLower, globalExpAtUpper],
                    RANGE: [globalRangeLower, globalRangeUpper],
                    CRYPTO: globalCryptoEnabled,
                    MODULO_MODE: globalModuloMode,
                    POW_PRECISION: globalPowPrecision,
                    FORMAT: globalFormatConfig,
                    ALPHABET: globalAlphabet
                };
            };

            // BigNumber.DEBUG = false; // Default, can be set to true for extra validation.

            BigNumber.isBigNumber = function(value) {
                if (!value || true !== value._isBigNumber) return false;
                // If DEBUG is enabled, perform more thorough internal validation.
                // if (BigNumber.DEBUG) { /* ... detailed validation logic ... */ }
                return true; // Assume valid if _isBigNumber is true.
            };

            BigNumber.maximum = BigNumber.max = function() {
                return reduceBigNumbersByComparison(arguments, BigNumberPrototype.lt);
            };

            BigNumber.minimum = BigNumber.min = function() {
                return reduceBigNumbersByComparison(arguments, BigNumberPrototype.gt);
            };

            // Random number generator helper.
            const cryptoRandomGenerator = (function() {
                // Fallback to Math.random if crypto is unavailable or not preferred.
                let mathRandomFallback = (MAX_SAFE_JS_INTEGER * Math.random() & 2097151) ?
                    function() {
                        return floorFunction(MAX_SAFE_JS_INTEGER * Math.random());
                    } :
                    function() {
                        return (MEGA_CHUNK_BASE * (1073741824 * Math.random() | 0) + (MEGA_CHUNK_BASE * Math.random() | 0));
                    };
                return function(precision) {
                    let randNum, numChunks, chunkIndex, tempVal, resultChunks = [];
                    const resultBigNum = new BigNumber(ONE_BIG_NUMBER);

                    if (precision == null) precision = globalDecimalPlaces;
                    else validateArgument(precision, 0, GIGA_CHUNK_BASE);

                    numChunks = ceilFunction(precision / DIGITS_PER_CHUNK);

                    if (globalCryptoEnabled) {
                        if (crypto.getRandomValues) {
                            const uint32Array = new Uint32Array(numChunks * 2);
                            crypto.getRandomValues(uint32Array);
                            for (chunkIndex = 0; chunkIndex < numChunks * 2; chunkIndex += 2) {
                                tempVal = (131072 * uint32Array[chunkIndex] + (uint32Array[chunkIndex + 1] >>> 11));
                                if (tempVal >= 9e15) { // If value too large, re-roll.
                                    const newUint32 = new Uint32Array(2);
                                    crypto.getRandomValues(newUint32);
                                    uint32Array[chunkIndex] = newUint32[0];
                                    uint32Array[chunkIndex + 1] = newUint32[1];
                                    chunkIndex -= 2; // Retry current index.
                                } else {
                                    resultChunks.push(tempVal % BASE_POWER_CHUNK);
                                }
                            }
                            chunkIndex = numChunks;
                        } else if (crypto.randomBytes) {
                            const bytesArray = crypto.randomBytes(numChunks * 7);
                            for (chunkIndex = 0; chunkIndex < numChunks * 7; chunkIndex += 7) {
                                tempVal = (281474976710656 * (31 & bytesArray[chunkIndex]) +
                                    1099511627776 * bytesArray[chunkIndex + 1] +
                                    4294967296 * bytesArray[chunkIndex + 2] +
                                    16777216 * bytesArray[chunkIndex + 3] +
                                    (bytesArray[chunkIndex + 4] << 16) + (bytesArray[chunkIndex + 5] << 8) +
                                    bytesArray[chunkIndex + 6]);
                                if (tempVal >= 9e15) { // If value too large, re-roll.
                                    crypto.randomBytes(7).copy(bytesArray, chunkIndex);
                                    chunkIndex -= 7; // Retry current index.
                                } else {
                                    resultChunks.push(tempVal % BASE_POWER_CHUNK);
                                }
                            }
                            chunkIndex = numChunks;
                        } else {
                            globalCryptoEnabled = false; // Disable if crypto is not truly available.
                            throw Error(ERR_PREFIX + "crypto unavailable");
                        }
                    }

                    // Fallback to Math.random if crypto not enabled or failed.
                    if (!globalCryptoEnabled) {
                        for (chunkIndex = 0; chunkIndex < numChunks;) {
                            tempVal = mathRandomFallback();
                            if (tempVal < 9e15) resultChunks[chunkIndex++] = tempVal % BASE_POWER_CHUNK;
                        }
                    }

                    // Adjust last chunk for exact precision.
                    chunkIndex = resultChunks.length - 1;
                    precision %= DIGITS_PER_CHUNK;
                    if (resultChunks[chunkIndex] && precision) {
                        tempVal = POWERS_OF_TEN_ARRAY[DIGITS_PER_CHUNK - precision];
                        resultChunks[chunkIndex] = floorFunction(resultChunks[chunkIndex] / tempVal) * tempVal;
                    }

                    // Remove trailing zeros.
                    while (chunkIndex >= 0 && resultChunks[chunkIndex] === 0) {
                        resultChunks.pop();
                        chunkIndex--;
                    }

                    if (chunkIndex < 0) {
                        resultChunks = [randNum = 0];
                    } else {
                        // Adjust exponent based on leading zeros.
                        randNum = -1;
                        while (resultChunks[0] === 0) {
                            resultChunks.splice(0, 1);
                            randNum -= DIGITS_PER_CHUNK;
                        }
                        let leadDigits = 1;
                        tempVal = resultChunks[0];
                        while (tempVal >= 10) {
                            tempVal /= 10;
                            leadDigits++;
                        }
                        if (leadDigits < DIGITS_PER_CHUNK) randNum -= DIGITS_PER_CHUNK - leadDigits;
                    }

                    resultBigNum.exponent = randNum;
                    resultBigNum.coeffs = resultChunks;
                    return resultBigNum;
                };
            })();

            BigNumber.random = cryptoRandomGenerator;

            BigNumber.sum = function() {
                let currentIdx = 1;
                const argArray = arguments;
                let sumResult = new BigNumber(argArray[0]);
                while (currentIdx < argArray.length) {
                    sumResult = sumResult.plus(argArray[currentIdx++]);
                }
                return sumResult;
            };

            /**
             * Helper to convert a number string from one base to another.
             * @param {string} numStr - The number string.
             * @param {number} fromBase - The original base.
             * @param {number} toBase - The target base.
             * @param {string} alphabet - The alphabet for digits.
             * @returns {string} The converted number string.
             */
            const convertBase = (function() {
                /**
                 * Converts a base string to a coefficient array in a new base.
                 * @param {string} inputString - The number string.
                 * @param {number} inputBase - The input base.
                 * @param {number} outputBase - The output base.
                 * @param {string} digitAlphabet - The alphabet for input digits.
                 * @returns {number[]} Coefficient array in outputBase.
                 */
                function toCoeffArray(inputString, inputBase, outputBase, digitAlphabet) {
                    let i, j, currentDigit;
                    const resultCoeffs = [0]; // Start with [0] to handle addition.
                    const inputLength = inputString.length;

                    for (i = 0; i < inputLength; i++) {
                        // Multiply existing result by inputBase.
                        for (j = resultCoeffs.length; j--; resultCoeffs[j] *= inputBase);
                        // Add current digit's value.
                        resultCoeffs[0] += digitAlphabet.indexOf(inputString.charAt(i));

                        // Carry over digits if they exceed outputBase.
                        for (j = 0; j < resultCoeffs.length; j++) {
                            if (resultCoeffs[j] >= outputBase) {
                                if (resultCoeffs[j + 1] == null) resultCoeffs[j + 1] = 0;
                                resultCoeffs[j + 1] += floorFunction(resultCoeffs[j] / outputBase);
                                resultCoeffs[j] %= outputBase;
                            }
                        }
                    }
                    return resultCoeffs.reverse(); // Reverse to get most significant digit first.
                }

                return function(numStr, fromBase, toBase, isSigned) {
                    let decimalPointIndex = numStr.indexOf(".");
                    let currentPrecision = globalDecimalPlaces;
                    let currentRounding = globalRoundingMode;
                    let processedStr;

                    if (decimalPointIndex >= 0) {
                        currentPrecision = globalPowPrecision; // Use POW_PRECISION for fractional conversion.
                        globalPowPrecision = 0; // Reset for internal BigNumber calls.
                        numStr = numStr.replace(".", "");
                        const basePower = (new BigNumber(fromBase)).pow(numStr.length - decimalPointIndex);
                        globalPowPrecision = currentPrecision; // Restore.

                        basePower.coeffs = toCoeffArray(formatCoefficientArray(basePower.coeffs), 10, toBase, "0123456789");
                        basePower.exponent = basePower.coeffs.length;
                    }

                    let convertedCoeffs = toCoeffArray(numStr, fromBase, toBase, isSigned ? (processedStr = globalAlphabet, "0123456789") : (processedStr = "0123456789", globalAlphabet));

                    // Remove leading zeros from converted coefficients.
                    let coeffLength = convertedCoeffs.length;
                    while (coeffLength > 0 && convertedCoeffs[--coeffLength] === 0) {
                        convertedCoeffs.pop();
                    }

                    if (!convertedCoeffs[0]) return processedStr.charAt(0); // If result is zero.

                    // If fractional part was involved, perform division.
                    if (decimalPointIndex < 0) {
                        decimalPointIndex = --coeffLength;
                    } else {
                        const tempBigNum = new BigNumber(isSigned); // Create a temporary BigNumber for division.
                        tempBigNum.coeffs = convertedCoeffs;
                        tempBigNum.exponent = coeffLength;
                        tempBigNum.sign = isSigned;

                        const divisionResult = divideNumbers(tempBigNum, basePower, currentPrecision, currentRounding);
                        convertedCoeffs = divisionResult.coeffs;
                        isSigned = divisionResult.roundingFlag; // Use rounding flag from division.
                        coeffLength = divisionResult.exponent;
                    }

                    // Apply rounding based on rounding mode.
                    decimalPointIndex = convertedCoeffs[currentPrecision + coeffLength + 1]; // Digit after desired precision.
                    const halfBase = toBase / 2;
                    isSigned = isSigned || decimalPointIndex < 0 || convertedCoeffs[currentPrecision + coeffLength + 1] != null;
                    isSigned = currentRounding < 4 ?
                        (decimalPointIndex != null || isSigned) && (currentRounding === 0 || currentRounding === (isSigned < 0 ? 3 : 2)) :
                        decimalPointIndex > halfBase || (decimalPointIndex === halfBase && (currentRounding === 4 || isSigned || (currentRounding === 6 &&
                            1 & convertedCoeffs[currentPrecision + coeffLength - 1]) || currentRounding === (isSigned < 0 ? 8 : 7)));

                    if (currentPrecision < 1 || !convertedCoeffs[0]) {
                        numStr = isSigned ? formatToDecimal(processedStr.charAt(1), -currentPrecision, processedStr.charAt(0)) : processedStr.charAt(0);
                    } else {
                        convertedCoeffs.length = currentPrecision;
                        if (isSigned) {
                            for (--toBase; ++convertedCoeffs[--currentPrecision] > toBase;) {
                                convertedCoeffs[currentPrecision] = 0;
                                if (!currentPrecision) {
                                    ++coeffLength;
                                    convertedCoeffs = [1].concat(convertedCoeffs);
                                }
                            }
                        }
                        for (currentPrecision = convertedCoeffs.length; currentPrecision > 0 && convertedCoeffs[currentPrecision - 1] === 0; currentPrecision--);
                        for (decimalPointIndex = 0, numStr = ""; decimalPointIndex < currentPrecision; numStr += processedStr.charAt(convertedCoeffs[decimalPointIndex++]));
                        numStr = formatToDecimal(numStr, coeffLength, processedStr.charAt(0));
                    }
                    return numStr;
                };
            })();

            /**
             * Performs BigNumber division.
             * @param {BigNumber} dividend - The dividend.
             * @param {BigNumber} divisor - The divisor.
             * @param {number} precision - Required precision.
             * @param {number} roundingMode - Rounding mode.
             * @returns {BigNumber} The result of the division.
             */
            const divideNumbers = (function() {
                /**
                 * Multiplies a coefficient array by a single digit and returns carries.
                 * @param {number[]} coeffs - Coefficient array.
                 * @param {number} multiplier - Single digit multiplier.
                 * @param {number} base - The base (e.g., BASE_POWER_CHUNK).
                 * @returns {number[]} The new coefficient array.
                 */
                function multiplyCoeffsByDigit(coeffs, multiplier, base) {
                    let i, j, carry = 0;
                    const len = coeffs.length;
                    const lowMultiplier = multiplier % MEGA_CHUNK_BASE;
                    const highMultiplier = floorFunction(multiplier / MEGA_CHUNK_BASE);
                    const newCoeffs = coeffs.slice(); // Clone array.

                    for (i = len - 1; i >= 0; i--) {
                        // Perform multiplication on current chunk.
                        j = lowMultiplier * (newCoeffs[i] % MEGA_CHUNK_BASE) +
                            highMultiplier * (newCoeffs[i] / MEGA_CHUNK_BASE | 0) % MEGA_CHUNK_BASE * MEGA_CHUNK_BASE +
                            carry;
                        carry = floorFunction(j / base) + floorFunction(j / MEGA_CHUNK_BASE) + highMultiplier * (newCoeffs[i] / MEGA_CHUNK_BASE | 0);
                        newCoeffs[i] = j % base;
                    }
                    if (carry) newCoeffs.unshift(carry); // Prepend any final carry.
                    return newCoeffs;
                }

                /**
                 * Compares two coefficient arrays.
                 * @param {number[]} arrA - First array.
                 * @param {number[]} arrB - Second array.
                 * @param {number} lenA - Length of first array.
                 * @param {number} lenB - Length of second array.
                 * @returns {number} -1 if arrA < arrB, 1 if arrA > arrB, 0 if equal.
                 */
                function compareCoeffArrays(arrA, arrB, lenA, lenB) {
                    if (lenA !== lenB) return lenA > lenB ? 1 : -1;
                    for (let i = 0; i < lenA; i++) {
                        if (arrA[i] !== arrB[i]) return arrA[i] > arrB[i] ? 1 : -1;
                    }
                    return 0;
                }

                /**
                 * Subtracts one coefficient array from another.
                 * @param {number[]} minuend - Array to subtract from.
                 * @param {number[]} subtrahend - Array to subtract.
                 * @param {number} len - Length of arrays to process.
                 * @param {number} base - The base (e.g., BASE_POWER_CHUNK).
                 */
                function subtractCoeffArrays(minuend, subtrahend, len, base) {
                    let borrow = 0;
                    for (let i = len - 1; i >= 0; i--) {
                        minuend[i] -= borrow;
                        if (minuend[i] < subtrahend[i]) {
                            borrow = 1;
                            minuend[i] += base - subtrahend[i];
                        } else {
                            borrow = 0;
                            minuend[i] -= subtrahend[i];
                        }
                    }
                    // Remove leading zeros.
                    while (minuend.length > 1 && minuend[0] === 0) {
                        minuend.shift();
                    }
                }

                return function(dividend, divisor, precision, roundingMode) {
                    const dividendSign = dividend.sign;
                    const divisorSign = divisor.sign;
                    let resultSign;

                    // Handle NaN, Infinity, or Zero divisors.
                    if (!dividend.coeffs || !divisorSign || (divisor.coeffs && !divisor.coeffs[0])) {
                        return new BigNumber(dividendSign && divisorSign && (dividend.coeffs ? !divisor.coeffs || dividend.coeffs[0] !== divisor.coeffs[0] : divisor.coeffs) ?
                            (dividend.coeffs && dividend.coeffs[0] === 0 || !divisor.coeffs ? 0 * dividendSign : dividendSign / 0) : NaN);
                    }

                    // Handle zero dividend.
                    if (!divisor.coeffs || (dividend.coeffs && !dividend.coeffs[0])) {
                        return new BigNumber(dividend);
                    }

                    resultSign = dividendSign === divisorSign ? 1 : -1;
                    let dividendCoeffs = dividend.coeffs;
                    let divisorCoeffs = divisor.coeffs;

                    let exponentDifference = dividend.exponent - divisor.exponent;
                    // Adjust precision based on internal chunk size.
                    // If not for fractional part, use DIGITS_PER_CHUNK.
                    if (!roundingMode) roundingMode = DIGITS_PER_CHUNK;
                    exponentDifference = safeFloor(dividend.exponent / DIGITS_PER_CHUNK) - safeFloor(divisor.exponent / DIGITS_PER_CHUNK);
                    precision = precision + exponentDifference + 1;

                    // Result will be zero if precision is negative.
                    if (precision < 0) {
                        return (new BigNumber(resultSign)).coeffs = [1], (new BigNumber(resultSign)).roundingFlag = true, (new BigNumber(resultSign));
                    }

                    let dividendLen = dividendCoeffs.length;
                    let divisorLen = divisorCoeffs.length;
                    let coeffIndex = 0;

                    // Pad dividend with zeros for initial alignment.
                    for (; divisorCoeffs[coeffIndex] === (dividendCoeffs[coeffIndex] || 0); coeffIndex++);
                    if (divisorCoeffs[coeffIndex] > (dividendCoeffs[coeffIndex] || 0)) {
                        exponentDifference--;
                    }

                    // Pre-normalize dividend and divisor for easier division.
                    const resultCoeffs = [];
                    let dividendPartial = []; // Stores the current part of the dividend being divided.
                    let dividendPartialLen;

                    // Create an initial partial dividend.
                    for (coeffIndex = 0; coeffIndex < divisorLen; coeffIndex++) {
                        dividendPartial[coeffIndex] = dividendCoeffs[coeffIndex] || 0;
                    }
                    dividendPartialLen = dividendPartial.length;

                    // Optimize by multiplying divisor and dividend by a factor to make divisor's first digit large.
                    let normalizationFactor = 1;
                    const firstDivisorCoeff = divisorCoeffs[0];
                    if (firstDivisorCoeff < BASE_POWER_CHUNK / 2) {
                        normalizationFactor = floorFunction(BASE_POWER_CHUNK / (firstDivisorCoeff + 1));
                        divisorCoeffs = multiplyCoeffsByDigit(divisorCoeffs, normalizationFactor, BASE_POWER_CHUNK);
                        dividendPartial = multiplyCoeffsByDigit(dividendPartial, normalizationFactor, BASE_POWER_CHUNK);
                        divisorLen = divisorCoeffs.length;
                        dividendPartialLen = dividendPartial.length;
                    }

                    const divisorCopy = divisorCoeffs.slice();
                    divisorCopy.unshift(0); // Add a leading zero for overflow.

                    const firstDivisorDigit = divisorCoeffs[0];

                    let currentQuotientDigit;
                    let tempDivisorProduct;
                    let tempDividendRemainder;
                    let comparisonResult;

                    // Main division loop.
                    do {
                        currentQuotientDigit = 0;
                        comparisonResult = compareCoeffArrays(divisorCoeffs, dividendPartial, divisorLen, dividendPartialLen);

                        if (comparisonResult < 0) {
                            // Estimate quotient digit.
                            tempDividendRemainder = dividendPartial[0];
                            if (divisorLen !== dividendPartialLen) {
                                tempDividendRemainder = tempDividendRemainder * BASE_POWER_CHUNK + (dividendPartial[1] || 0);
                            }
                            currentQuotientDigit = floorFunction(tempDividendRemainder / firstDivisorDigit);

                            // Clamp quotient digit if too large.
                            if (currentQuotientDigit >= BASE_POWER_CHUNK) currentQuotientDigit = BASE_POWER_CHUNK - 1;

                            // Multiply divisor by estimated quotient digit.
                            tempDivisorProduct = multiplyCoeffsByDigit(divisorCoeffs, currentQuotientDigit, BASE_POWER_CHUNK);
                            let productLen = tempDivisorProduct.length;
                            dividendPartialLen = dividendPartial.length;

                            // Adjust quotient digit if product is too large.
                            while (compareCoeffArrays(tempDivisorProduct, dividendPartial, productLen, dividendPartialLen) === 1) {
                                currentQuotientDigit--;
                                subtractCoeffArrays(tempDivisorProduct, divisorLen < productLen ? divisorCopy : divisorCoeffs, productLen, BASE_POWER_CHUNK);
                                productLen = tempDivisorProduct.length;
                                comparisonResult = 1; // Mark for re-check.
                            }
                            if (currentQuotientDigit === 0) comparisonResult = currentQuotientDigit = 1; // Ensure progress.

                            // Subtract product from partial dividend.
                            subtractCoeffArrays(dividendPartial, tempDivisorProduct, dividendPartialLen, BASE_POWER_CHUNK);
                            dividendPartialLen = dividendPartial.length;
                        } else if (comparisonResult === 0) {
                            currentQuotientDigit++;
                            dividendPartial = [0]; // Remainder is zero.
                            dividendPartialLen = 1;
                        }

                        resultCoeffs[coeffIndex++] = currentQuotientDigit;
                        // Append next digit from dividend if available.
                        if (dividendPartial[0]) {
                            dividendPartial[dividendPartialLen++] = dividendCoeffs[divisorLen] || 0;
                        } else {
                            dividendPartial = [dividendCoeffs[divisorLen]];
                            dividendPartialLen = 1;
                        }
                    } while ((divisorLen++ < dividendLen || dividendPartial[0] != null) && precision-- >= 0);

                    // Determine rounding flag.
                    const remainderExists = dividendPartial[0] != null;
                    resultCoeffs[0] || resultCoeffs.splice(0, 1); // Remove leading zero if present.

                    const resultBigNum = new BigNumber(resultSign);
                    resultBigNum.exponent = exponentDifference;
                    resultBigNum.roundingFlag = remainderExists; // Store remainder flag.

                    // Round the result.
                    if (roundingMode === BASE_POWER_CHUNK) { // Special rounding for base conversion.
                        roundBigNumber(resultBigNum, precision + resultBigNum.exponent + 1, roundingMode, remainderExists);
                    } else {
                        roundBigNumber(resultBigNum, precision + resultBigNum.exponent + 1, roundingMode, remainderExists);
                    }

                    return resultBigNum;
                };
            })();

            // Regex patterns for parsing.
            const HEX_OCT_BIN_PATTERN = /^(-?)0([xbo])(?=\w[\w.]*$)/i;
            const TRAILING_DOT_PATTERN = /^([^.]+)\.$/;
            const LEADING_DOT_PATTERN = /^\.([^.]+)$/;
            const INF_NAN_PATTERN = /^-?(Infinity|NaN)$/;
            const WHITESPACE_PATTERN = /^\s*\+(?=[\w.])|^\s+|\s+$/g;

            /**
             * Parses an input string for BigNumber creation, handling special cases like NaN/Infinity.
             * @param {BigNumber} instance - The BigNumber instance to populate.
             * @param {string} inputString - The raw input string.
             * @param {boolean} isNumberPrimitive - True if input was a number primitive.
             * @param {number} [base] - Optional base.
             */
            function parseInvalidInput(instance, inputString, isNumberPrimitive, base) {
                let tempBase;
                const cleanedString = isNumberPrimitive ? inputString : inputString.replace(WHITESPACE_PATTERN, "");

                if (INF_NAN_PATTERN.test(cleanedString)) {
                    instance.sign = isNaN(cleanedString) ? null : (cleanedString < 0 ? -1 : 1);
                } else {
                    if (!isNumberPrimitive) {
                        // Handle hex/octal/binary prefixes.
                        const match = HEX_OCT_BIN_PATTERN.exec(cleanedString);
                        if (match) {
                            tempBase = (match[2].toLowerCase() === "x") ? 16 : (match[2].toLowerCase() === "b") ? 2 : 8;
                            if (base && base !== tempBase) { // If explicit base given, it must match prefix.
                                return parseInvalidInput(instance, cleanedString, isNumberPrimitive, base);
                            }
                            inputString = match[1]; // Keep sign.
                        }
                        // Handle leading/trailing dots.
                        inputString = inputString.replace(TRAILING_DOT_PATTERN, "$1").replace(LEADING_DOT_PATTERN, "0.$1");
                    }
                    if (BigNumber.DEBUG) {
                        throw Error(ERR_PREFIX + "Not a" + (base ? " base " + base : "") + " number: " + inputString);
                    }
                    instance.sign = null; // Mark as NaN.
                }
                instance.coeffs = instance.exponent = null;
            }

            // --- BigNumber Prototype Methods ---

            BigNumberPrototype.absoluteValue = BigNumberPrototype.abs = function() {
                const result = new BigNumber(this);
                if (result.sign < 0) result.sign = 1;
                return result;
            };

            BigNumberPrototype.comparedTo = function(value, base) {
                return compareBigNumbers(this, new BigNumber(value, base));
            };

            BigNumberPrototype.decimalPlaces = BigNumberPrototype.dp = function(numDP, roundingMode) {
                let coeffs, totalDigits, lastCoeff, result;
                if (numDP != null) {
                    validateArgument(numDP, 0, GIGA_CHUNK_BASE);
                    if (roundingMode == null) roundingMode = globalRoundingMode;
                    else validateArgument(roundingMode, 0, 8);
                    return roundBigNumber(new BigNumber(this), numDP + this.exponent + 1, roundingMode);
                }
                if (!(coeffs = this.coeffs)) return null; // NaN or Infinity.

                totalDigits = (lastCoeff = coeffs.length - 1) * DIGITS_PER_CHUNK - safeFloor(this.exponent / DIGITS_PER_CHUNK) * DIGITS_PER_CHUNK;
                if (lastCoeff = coeffs[lastCoeff]) {
                    for (; lastCoeff % 10 === 0; lastCoeff /= 10, totalDigits--);
                }
                result = totalDigits < 0 ? 0 : totalDigits;
                return result;
            };

            BigNumberPrototype.dividedBy = BigNumberPrototype.div = function(value, base) {
                return divideNumbers(this, new BigNumber(value, base), globalDecimalPlaces, globalRoundingMode);
            };

            BigNumberPrototype.dividedToIntegerBy = BigNumberPrototype.idiv = function(value, base) {
                return divideNumbers(this, new BigNumber(value, base), 0, 1); // Round down to integer.
            };

            BigNumberPrototype.exponentiatedBy = BigNumberPrototype.pow = function(exponentVal, moduloVal) {
                let exponentBigNum, baseBigNum, tempBigNum, resultBigNum,
                    isNegativeExponent, useModulo,
                    isBaseInteger, isModuloInteger,
                    powPrecisionThreshold, exponentIsOdd;

                exponentBigNum = new BigNumber(exponentVal);
                if (exponentBigNum.coeffs && !exponentBigNum.isInteger()) {
                    throw Error(ERR_PREFIX + "Exponent not an integer: " + toRawString(exponentBigNum));
                }

                if (moduloVal != null) moduloVal = new BigNumber(moduloVal);

                // Handle special cases: base or exponent is NaN, 0, 1.
                baseBigNum = this;
                if (!baseBigNum.coeffs || !baseBigNum.coeffs[0] ||
                    (baseBigNum.coeffs[0] === 1 && !baseBigNum.exponent && baseBigNum.coeffs.length === 1) ||
                    !exponentBigNum.coeffs || !exponentBigNum.coeffs[0]) {
                    resultBigNum = new BigNumber(Math.pow(+(toRawString(baseBigNum)),
                        exponentBigNum.exponent > 14 ? (2 - isBigNumberOdd(exponentBigNum)) : +(toRawString(exponentBigNum))));
                    return moduloVal ? resultBigNum.mod(moduloVal) : resultBigNum;
                }

                isNegativeExponent = exponentBigNum.sign < 0;
                useModulo = moduloVal;

                if (useModulo) {
                    if (moduloVal.coeffs && !moduloVal.coeffs[0] || !moduloVal.sign) return new BigNumber(NaN);
                    isBaseInteger = !isNegativeExponent && baseBigNum.isInteger();
                    isModuloInteger = moduloVal.isInteger();
                    if (isBaseInteger && isModuloInteger) {
                        baseBigNum = baseBigNum.mod(moduloVal); // Reduce base if modulo is used.
                    }
                } else {
                    // Check for potential overflow with large exponents.
                    if (exponentBigNum.exponent > 9 &&
                        (baseBigNum.exponent > 0 || baseBigNum.exponent < -1 ||
                            (baseBigNum.exponent === 0 ? baseBigNum.coeffs[0] > 1 || (exponentBigNum.exponent > 14 && baseBigNum.coeffs[1] >= 24e7) :
                                baseBigNum.coeffs[0] < 8e13 || (exponentBigNum.exponent > 14 && baseBigNum.coeffs[0] <= 9999975e7)))) {
                        let signForZero = baseBigNum.sign < 0 && isBigNumberOdd(exponentBigNum) ? -0 : 0;
                        if (baseBigNum.exponent > -1) signForZero = 1 / signForZero; // Handle +/- Infinity.
                        return new BigNumber(isNegativeExponent ? 1 / signForZero : signForZero);
                    }
                    if (globalPowPrecision) powPrecisionThreshold = ceilFunction(globalPowPrecision / DIGITS_PER_CHUNK + 2);
                }

                if (exponentBigNum.exponent > 14) { // Very large exponent.
                    tempBigNum = new BigNumber(0.5);
                    if (isNegativeExponent) exponentBigNum.sign = 1;
                    exponentIsOdd = isBigNumberOdd(exponentBigNum);
                } else {
                    exponentIsOdd = (Math.abs(+(toRawString(exponentBigNum)))) % 2;
                }

                resultBigNum = new BigNumber(ONE_BIG_NUMBER); // Initialize result to 1.

                // Binary exponentiation (exponentiation by squaring).
                for (;;) {
                    if (exponentIsOdd) {
                        if (!(resultBigNum = resultBigNum.times(baseBigNum)).coeffs) break; // Result became NaN.
                        if (powPrecisionThreshold) { // Apply precision limit.
                            if (resultBigNum.coeffs.length > powPrecisionThreshold) resultBigNum.coeffs.length = powPrecisionThreshold;
                        } else if (isBaseInteger && isModuloInteger) {
                            resultBigNum = resultBigNum.mod(moduloVal);
                        }
                    }
                    if (exponentIsOdd) { // Check again for integer exponent.
                        let currentExponentValue = Math.abs(+(toRawString(exponentBigNum)));
                        if (currentExponentValue === 0) break;
                        exponentIsOdd = (currentExponentValue = floorFunction(currentExponentValue / 2)) % 2;
                    } else if (exponentBigNum.exponent > 14) { // If exponent is very large.
                        roundBigNumber(exponentBigNum = exponentBigNum.times(tempBigNum), exponentBigNum.exponent + 1, 1); // Divide exponent by 2.
                        if (exponentBigNum.exponent > 14) {
                            exponentIsOdd = isBigNumberOdd(exponentBigNum);
                        } else {
                            let currentExponentValue = +(toRawString(exponentBigNum));
                            if (currentExponentValue === 0) break;
                            exponentIsOdd = currentExponentValue % 2;
                        }
                    } else {
                        break;
                    }
                    baseBigNum = baseBigNum.times(baseBigNum); // Square the base.
                    if (powPrecisionThreshold) {
                        if (baseBigNum.coeffs && baseBigNum.coeffs.length > powPrecisionThreshold) baseBigNum.coeffs.length = powPrecisionThreshold;
                    } else if (isBaseInteger && isModuloInteger) {
                        baseBigNum = baseBigNum.mod(moduloVal);
                    }
                }

                if (isNegativeExponent) {
                    resultBigNum = ONE_BIG_NUMBER.div(resultBigNum);
                }
                return useModulo ? resultBigNum.mod(moduloVal) : (powPrecisionThreshold ? roundBigNumber(resultBigNum, globalPowPrecision, globalRoundingMode, undefined) : resultBigNum);
            };

            BigNumberPrototype.integerValue = function(roundingMode) {
                const result = new BigNumber(this);
                if (roundingMode == null) roundingMode = globalRoundingMode;
                else validateArgument(roundingMode, 0, 8);
                return roundBigNumber(result, result.exponent + 1, roundingMode);
            };

            BigNumberPrototype.isEqualTo = BigNumberPrototype.eq = function(value, base) {
                return compareBigNumbers(this, new BigNumber(value, base)) === 0;
            };

            BigNumberPrototype.isFinite = function() {
                return !!this.coeffs;
            };

            BigNumberPrototype.isGreaterThan = BigNumberPrototype.gt = function(value, base) {
                return compareBigNumbers(this, new BigNumber(value, base)) > 0;
            };

            BigNumberPrototype.isGreaterThanOrEqualTo = BigNumberPrototype.gte = function(value, base) {
                const comparisonResult = compareBigNumbers(this, new BigNumber(value, base));
                return comparisonResult === 1 || comparisonResult === 0;
            };

            BigNumberPrototype.isInteger = function() {
                return !!this.coeffs && safeFloor(this.exponent / DIGITS_PER_CHUNK) > this.coeffs.length - 2;
            };

            BigNumberPrototype.isLessThan = BigNumberPrototype.lt = function(value, base) {
                return compareBigNumbers(this, new BigNumber(value, base)) < 0;
            };

            BigNumberPrototype.isLessThanOrEqualTo = BigNumberPrototype.lte = function(value, base) {
                const comparisonResult = compareBigNumbers(this, new BigNumber(value, base));
                return comparisonResult === -1 || comparisonResult === 0;
            };

            BigNumberPrototype.isNaN = function() {
                return !this.sign;
            };

            BigNumberPrototype.isNegative = function() {
                return this.sign < 0;
            };

            BigNumberPrototype.isPositive = function() {
                return this.sign > 0;
            };

            BigNumberPrototype.isZero = function() {
                return !!this.coeffs && this.coeffs[0] === 0;
            };

            BigNumberPrototype.minus = function(value, base) {
                let otherBigNum, thisSign, otherSign,
                    thisExponentChunk, otherExponentChunk,
                    thisCoeffs, otherCoeffs,
                    tempCoeffs,
                    exponentDifference,
                    isThisSmaller;

                thisSign = this.sign;
                otherBigNum = new BigNumber(value, base);
                otherSign = otherBigNum.sign;

                if (!thisSign || !otherSign) return new BigNumber(NaN); // If either is NaN.

                if (thisSign !== otherSign) { // If signs are different, it's an addition.
                    otherBigNum.sign = -otherSign;
                    return this.plus(otherBigNum);
                }

                thisExponentChunk = this.exponent / DIGITS_PER_CHUNK;
                otherExponentChunk = otherBigNum.exponent / DIGITS_PER_CHUNK;
                thisCoeffs = this.coeffs;
                otherCoeffs = otherBigNum.coeffs;

                // Handle cases where coefficients are null (Infinity/NaN) or zero.
                if (!thisExponentChunk || !otherExponentChunk) {
                    if (!thisCoeffs || !otherCoeffs) {
                        return thisCoeffs ? (otherBigNum.sign = -otherSign, otherBigNum) : new BigNumber(otherCoeffs ? this : NaN);
                    }
                    if (!thisCoeffs[0] || !otherCoeffs[0]) {
                        return otherCoeffs[0] ? (otherBigNum.sign = -otherSign, otherBigNum) : new BigNumber(thisCoeffs[0] ? this : (globalRoundingMode === 3 ? -0 : 0));
                    }
                }

                thisExponentChunk = safeFloor(thisExponentChunk);
                otherExponentChunk = safeFloor(otherExponentChunk);
                thisCoeffs = thisCoeffs.slice(); // Clone for modification.

                exponentDifference = thisExponentChunk - otherExponentChunk;

                if (exponentDifference) { // If exponents are different, align coefficients.
                    if (exponentDifference < 0) { // Other number has larger exponent.
                        exponentDifference = -exponentDifference;
                        tempCoeffs = thisCoeffs;
                        thisCoeffs = otherCoeffs;
                        otherCoeffs = tempCoeffs;
                        otherExponentChunk = thisExponentChunk; // Swap chunk exponents.
                        isThisSmaller = true; // Mark that original 'this' was smaller.
                    } else {
                        tempCoeffs = otherCoeffs;
                    }
                    tempCoeffs.reverse();
                    for (; exponentDifference--; tempCoeffs.push(0));
                    tempCoeffs.reverse();
                } else { // Exponents are the same, compare coefficient arrays directly.
                    let minLen = (exponentDifference = thisCoeffs.length) < (otherSign = otherCoeffs.length) ? exponentDifference : otherSign;
                    exponentDifference = otherSign = 0;
                    for (; exponentDifference < minLen; exponentDifference++) {
                        if (thisCoeffs[exponentDifference] !== otherCoeffs[exponentDifference]) {
                            isThisSmaller = thisCoeffs[exponentDifference] < otherCoeffs[exponentDifference];
                            break;
                        }
                    }
                }

                if (isThisSmaller) { // If original 'this' was smaller, swap again and negate sign.
                    tempCoeffs = thisCoeffs;
                    thisCoeffs = otherCoeffs;
                    otherCoeffs = tempCoeffs;
                    otherBigNum.sign = -otherBigNum.sign;
                }

                // Pad shorter coefficient array with zeros.
                if ((otherSign = thisCoeffs.length) - (exponentDifference = otherCoeffs.length) > 0) {
                    for (; otherSign > exponentDifference; otherCoeffs[exponentDifference++] = 0);
                }

                // Perform subtraction digit by digit.
                for (otherSign = BASE_POWER_CHUNK - 1; exponentDifference > 0;) {
                    if (thisCoeffs[--exponentDifference] < otherCoeffs[exponentDifference]) {
                        for (otherSign = exponentDifference; otherSign && !thisCoeffs[--otherSign]; thisCoeffs[otherSign] = BASE_POWER_CHUNK - 1);
                        --thisCoeffs[otherSign];
                        thisCoeffs[exponentDifference] += BASE_POWER_CHUNK;
                    }
                    thisCoeffs[exponentDifference] -= otherCoeffs[exponentDifference];
                }

                // Remove leading zeros.
                while (thisCoeffs.length > 1 && thisCoeffs[0] === 0) {
                    thisCoeffs.splice(0, 1);
                    otherExponentChunk--;
                }

                // Normalize and return.
                return thisCoeffs[0] ? normalizeBigNumber(otherBigNum, thisCoeffs, otherExponentChunk) :
                    (otherBigNum.sign = (globalRoundingMode === 3 ? -1 : 1), otherBigNum.coeffs = [otherBigNum.exponent = 0], otherBigNum);
            };

            BigNumberPrototype.modulo = BigNumberPrototype.mod = function(value, base) {
                let resultBigNum, divisorBigNum, tempResult;
                const thisBigNum = this;

                divisorBigNum = new BigNumber(value, base);

                // Handle NaN, Infinity, or Zero divisors.
                if (!thisBigNum.coeffs || !divisorBigNum.sign || (divisorBigNum.coeffs && !divisorBigNum.coeffs[0])) {
                    return new BigNumber(NaN);
                }
                // Handle zero dividend.
                if (!divisorBigNum.coeffs || (thisBigNum.coeffs && !thisBigNum.coeffs[0])) {
                    return new BigNumber(thisBigNum);
                }

                if (globalModuloMode === 9) { // Euclidean modulo.
                    let originalDivisorSign = divisorBigNum.sign;
                    divisorBigNum.sign = 1; // Temporarily make divisor positive.
                    tempResult = divideNumbers(thisBigNum, divisorBigNum, 0, 3); // Floor division.
                    divisorBigNum.sign = originalDivisorSign; // Restore divisor sign.
                    resultBigNum = thisBigNum.minus(tempResult.times(divisorBigNum));
                    resultBigNum.sign *= originalDivisorSign; // Adjust result sign based on original divisor.
                } else {
                    tempResult = divideNumbers(thisBigNum, divisorBigNum, 0, globalModuloMode);
                    resultBigNum = thisBigNum.minus(tempResult.times(divisorBigNum));
                }

                // If result is zero, ensure sign matches dividend (except for MODULO_MODE 1, which is always positive).
                if (!resultBigNum.coeffs[0] && globalModuloMode !== 1) {
                    resultBigNum.sign = thisBigNum.sign;
                }
                return resultBigNum;
            };

            BigNumberPrototype.multipliedBy = BigNumberPrototype.times = function(value, base) {
                let otherBigNum,
                    thisCoeffs, otherCoeffs,
                    exponentSum, resultSign,
                    thisCoeffsLen, otherCoeffsLen,
                    resultCoeffsLen,
                    resultCoeffs = [];

                thisCoeffs = this.coeffs;
                otherBigNum = new BigNumber(value, base);
                otherCoeffs = otherBigNum.coeffs;

                // Handle NaN, Infinity, or Zero operands.
                if (!(thisCoeffs && otherCoeffs && thisCoeffs[0] && otherCoeffs[0])) {
                    resultSign = this.sign * otherBigNum.sign;
                    if (!this.sign || !otherBigNum.sign ||
                        (thisCoeffs && !thisCoeffs[0] && !otherCoeffs) ||
                        (otherCoeffs && !otherCoeffs[0] && !thisCoeffs)) {
                        otherBigNum.coeffs = otherBigNum.exponent = otherBigNum.sign = null; // NaN.
                    } else {
                        otherBigNum.sign = resultSign;
                        if (thisCoeffs && otherCoeffs) {
                            otherBigNum.coeffs = [0];
                            otherBigNum.exponent = 0;
                        } else {
                            otherBigNum.coeffs = otherBigNum.exponent = null; // Infinity.
                        }
                    }
                    return otherBigNum;
                }

                exponentSum = safeFloor(this.exponent / DIGITS_PER_CHUNK) + safeFloor(otherBigNum.exponent / DIGITS_PER_CHUNK);
                otherBigNum.sign *= this.sign;

                // Ensure 'this' has more coefficients for optimization.
                thisCoeffsLen = thisCoeffs.length;
                otherCoeffsLen = otherCoeffs.length;
                if (thisCoeffsLen < otherCoeffsLen) {
                    let tempArr = thisCoeffs;
                    thisCoeffs = otherCoeffs;
                    otherCoeffs = tempArr;
                    let tempLen = thisCoeffsLen;
                    thisCoeffsLen = otherCoeffsLen;
                    otherCoeffsLen = tempLen;
                }

                // Initialize result coefficient array with zeros.
                resultCoeffsLen = thisCoeffsLen + otherCoeffsLen;
                for (let i = 0; i < resultCoeffsLen; i++) resultCoeffs.push(0);

                let carryDigit,
                    lowDigitMultiplier, highDigitMultiplier,
                    currentProductLow, currentProductHigh,
                    tempCoeff, tempSum;

                for (let i = otherCoeffsLen - 1; i >= 0; i--) {
                    carryDigit = 0;
                    lowDigitMultiplier = otherCoeffs[i] % MEGA_CHUNK_BASE;
                    highDigitMultiplier = floorFunction(otherCoeffs[i] / MEGA_CHUNK_BASE);

                    for (let j = thisCoeffsLen - 1 + (resultCoeffsLen - otherCoeffsLen); j > i; j--) {
                        tempCoeff = thisCoeffs[j - (resultCoeffsLen - otherCoeffsLen)]; // Current coefficient from 'this'.

                        currentProductLow = lowDigitMultiplier * (tempCoeff % MEGA_CHUNK_BASE);
                        currentProductHigh = highDigitMultiplier * (tempCoeff % MEGA_CHUNK_BASE) +
                            floorFunction(tempCoeff / MEGA_CHUNK_BASE) * lowDigitMultiplier;

                        tempSum = resultCoeffs[j] + currentProductLow +
                            (currentProductHigh % MEGA_CHUNK_BASE) * MEGA_CHUNK_BASE + carryDigit;

                        carryDigit = floorFunction(tempSum / BASE_POWER_CHUNK) + floorFunction(currentProductHigh / MEGA_CHUNK_BASE) +
                            highDigitMultiplier * floorFunction(tempCoeff / MEGA_CHUNK_BASE);

                        resultCoeffs[j] = tempSum % BASE_POWER_CHUNK;
                    }
                    resultCoeffs[i] = carryDigit;
                }

                // Adjust exponent based on carry.
                if (resultCoeffs[0]) {
                    exponentSum++;
                } else {
                    resultCoeffs.splice(0, 1);
                }

                return normalizeBigNumber(otherBigNum, resultCoeffs, exponentSum);
            };

            BigNumberPrototype.negated = function() {
                const result = new BigNumber(this);
                result.sign = -result.sign || null; // Flip sign, or set to null if NaN.
                return result;
            };

            BigNumberPrototype.plus = function(value, base) {
                let otherBigNum,
                    thisSign, otherSign,
                    thisExponentChunk, otherExponentChunk,
                    thisCoeffs, otherCoeffs,
                    tempCoeffs,
                    exponentDifference,
                    carry = 0;

                thisSign = this.sign;
                otherBigNum = new BigNumber(value, base);
                otherSign = otherBigNum.sign;

                if (!thisSign || !otherSign) return new BigNumber(NaN); // If either is NaN.

                if (thisSign !== otherSign) { // If signs are different, it's a subtraction.
                    otherBigNum.sign = -otherSign;
                    return this.minus(otherBigNum);
                }

                thisExponentChunk = this.exponent / DIGITS_PER_CHUNK;
                otherExponentChunk = otherBigNum.exponent / DIGITS_PER_CHUNK;
                thisCoeffs = this.coeffs;
                otherCoeffs = otherBigNum.coeffs;

                // Handle cases where coefficients are null (Infinity/NaN) or zero.
                if (!thisExponentChunk || !otherExponentChunk) {
                    if (!thisCoeffs || !otherCoeffs) return new BigNumber(thisSign / 0); // Both Infinity.
                    if (!thisCoeffs[0] || !otherCoeffs[0]) return otherCoeffs[0] ? otherBigNum : new BigNumber(thisCoeffs[0] ? this : 0 * thisSign);
                }

                thisExponentChunk = safeFloor(thisExponentChunk);
                otherExponentChunk = safeFloor(otherExponentChunk);
                thisCoeffs = thisCoeffs.slice(); // Clone for modification.

                exponentDifference = thisExponentChunk - otherExponentChunk;

                if (exponentDifference) { // If exponents are different, align coefficients by padding.
                    if (exponentDifference > 0) { // 'this' has larger exponent.
                        otherExponentChunk = thisExponentChunk;
                        tempCoeffs = otherCoeffs;
                    } else { // 'otherBigNum' has larger exponent.
                        exponentDifference = -exponentDifference;
                        tempCoeffs = thisCoeffs;
                    }
                    tempCoeffs.reverse();
                    for (; exponentDifference--; tempCoeffs.push(0));
                    tempCoeffs.reverse();
                }

                // Ensure 'thisCoeffs' is the longer array for loop.
                if (thisCoeffs.length < otherCoeffs.length) {
                    tempCoeffs = otherCoeffs;
                    otherCoeffs = thisCoeffs;
                    thisCoeffs = tempCoeffs;
                }

                // Perform addition digit by digit.
                for (let i = 0; i < otherCoeffs.length; i++) {
                    carry = floorFunction((thisCoeffs[i] = thisCoeffs[i] + otherCoeffs[i] + carry) / BASE_POWER_CHUNK);
                    thisCoeffs[i] %= BASE_POWER_CHUNK;
                }

                // Propagate any remaining carry.
                for (let i = otherCoeffs.length; i < thisCoeffs.length && carry; i++) {
                    carry = floorFunction((thisCoeffs[i] = thisCoeffs[i] + carry) / BASE_POWER_CHUNK);
                    thisCoeffs[i] %= BASE_POWER_CHUNK;
                }

                if (carry) { // If a final carry remains, prepend it.
                    thisCoeffs = [carry].concat(thisCoeffs);
                    otherExponentChunk++;
                }

                return normalizeBigNumber(otherBigNum, thisCoeffs, otherExponentChunk);
            };

            BigNumberPrototype.precision = BigNumberPrototype.sd = function(sigDigits, roundingMode) {
                let coeffs, totalDigits, lastCoeff, firstCoeff;
                if (sigDigits != null && sigDigits !== !!sigDigits) { // If num of significant digits is provided.
                    validateArgument(sigDigits, 1, GIGA_CHUNK_BASE);
                    if (roundingMode == null) roundingMode = globalRoundingMode;
                    else validateArgument(roundingMode, 0, 8);
                    return roundBigNumber(new BigNumber(this), sigDigits, roundingMode);
                }
                if (!(coeffs = this.coeffs)) return null; // NaN or Infinity.

                // Calculate total significant digits.
                totalDigits = (lastCoeff = coeffs.length - 1) * DIGITS_PER_CHUNK + 1;
                if (lastCoeff = coeffs[lastCoeff]) {
                    for (; lastCoeff % 10 === 0; lastCoeff /= 10, totalDigits--);
                }
                firstCoeff = coeffs[0];
                for (; firstCoeff >= 10; firstCoeff /= 10, totalDigits++);

                // If sigDigits flag is true and exponent is greater, use exponent.
                if (sigDigits && this.exponent + 1 > totalDigits) totalDigits = this.exponent + 1;
                return totalDigits;
            };

            BigNumberPrototype.shiftedBy = function(shiftAmount) {
                validateArgument(shiftAmount, -MAX_SAFE_JS_INTEGER, MAX_SAFE_JS_INTEGER);
                return this.times("1e" + shiftAmount); // Shift is multiplication by 10^shiftAmount.
            };

            BigNumberPrototype.squareRoot = BigNumberPrototype.sqrt = function() {
                let currentGuess, previousGuess,
                    precisionThreshold,
                    tempSign,
                    isPerfectSquare,
                    numString,
                    exponentForSqrt,
                    halfBigNum = new BigNumber("0.5");

                tempSign = this.sign;
                thisCoeffs = this.coeffs;

                if (tempSign !== 1 || !thisCoeffs || !thisCoeffs[0]) {
                    // Handle negative, NaN, or zero base.
                    return new BigNumber(!tempSign || (tempSign < 0 && (!thisCoeffs || thisCoeffs[0])) ? NaN : (thisCoeffs ? this : 1 / 0));
                }

                // If sqrt(N) is 0 or Infinity, use Math.sqrt directly.
                tempSign = Math.sqrt(+(toRawString(this)));
                if (tempSign === 0 || tempSign === 1 / 0) {
                    // Adjust exponent for string representation.
                    numString = formatCoefficientArray(thisCoeffs);
                    if ((numString.length + this.exponent) % 2 === 0) numString += "0";
                    tempSign = Math.sqrt(+(numString));
                    exponentForSqrt = safeFloor((this.exponent + 1) / 2) - (this.exponent < 0 || this.exponent % 2);
                    currentGuess = new BigNumber(tempSign === 1 / 0 ? "1e" + exponentForSqrt :
                        (numString = tempSign.toExponential()).slice(0, numString.indexOf("e") + 1) + exponentForSqrt);
                } else {
                    currentGuess = new BigNumber(tempSign + ""); // Initial guess.
                }

                if (!currentGuess.coeffs[0]) return currentGuess; // If initial guess is 0.

                precisionThreshold = globalDecimalPlaces + 4; // Add extra precision for iterations.
                if (currentGuess.exponent + precisionThreshold < 3) precisionThreshold = 0; // Don't over-precision for small numbers.

                // Babylonian method for square root.
                for (;;) {
                    previousGuess = currentGuess;
                    currentGuess = halfBigNum.times(previousGuess.plus(divideNumbers(this, previousGuess, precisionThreshold, 1))); // (x + N/x) / 2.

                    // Check for convergence.
                    if (formatCoefficientArray(previousGuess.coeffs).slice(0, precisionThreshold) ===
                        (numString = formatCoefficientArray(currentGuess.coeffs)).slice(0, precisionThreshold)) {
                        if (currentGuess.exponent < previousGuess.exponent) --precisionThreshold;
                        // Check for exact square or near-exact.
                        if (numString !== "9999" && (isPerfectSquare || "4999" !== numString)) {
                            if (+(numString.slice(1)) || "5" !== numString.charAt(0)) {
                                // Double check if it's an exact square.
                                if (!isPerfectSquare && (roundBigNumber(previousGuess, previousGuess.exponent + globalDecimalPlaces + 2, 0).times(previousGuess)).eq(this)) {
                                    currentGuess = previousGuess;
                                }
                                break;
                            }
                        }
                        precisionThreshold += 4; // Increase precision and iterate again.
                        isPerfectSquare = true;
                    }
                }
                return roundBigNumber(currentGuess, currentGuess.exponent + globalDecimalPlaces + 1, globalRoundingMode, isPerfectSquare);
            };

            BigNumberPrototype.toExponential = function(decimalPlaces, roundingMode) {
                if (decimalPlaces != null) {
                    validateArgument(decimalPlaces, 0, GIGA_CHUNK_BASE);
                    decimalPlaces++; // Adjust for internal representation.
                }
                return formatNumberString(this, decimalPlaces, roundingMode, 1);
            };

            BigNumberPrototype.toFixed = function(decimalPlaces, roundingMode) {
                if (decimalPlaces != null) {
                    validateArgument(decimalPlaces, 0, GIGA_CHUNK_BASE);
                    decimalPlaces = decimalPlaces + this.exponent + 1; // Adjust for internal representation.
                }
                return formatNumberString(this, decimalPlaces, roundingMode);
            };

            BigNumberPrototype.toFormat = function(decimalPlaces, roundingMode, formatConfig) {
                let formattedString;
                const currentInstance = this;

                if (formatConfig == null) {
                    if (decimalPlaces != null && roundingMode && typeof roundingMode === "object") {
                        formatConfig = roundingMode;
                        roundingMode = null;
                    } else if (decimalPlaces && typeof decimalPlaces === "object") {
                        formatConfig = decimalPlaces;
                        decimalPlaces = roundingMode = null;
                    } else {
                        formatConfig = globalFormatConfig;
                    }
                } else if (typeof formatConfig !== "object") {
                    throw Error(ERR_PREFIX + "Argument not an object: " + formatConfig);
                }

                formattedString = currentInstance.toFixed(decimalPlaces, roundingMode);

                if (currentInstance.coeffs) {
                    let parts = formattedString.split(".");
                    let groupSize = +formatConfig.groupSize;
                    let secondaryGroupSize = +formatConfig.secondaryGroupSize;
                    let groupSeparator = formatConfig.groupSeparator || "";
                    let integerPart = parts[0];
                    let fractionalPart = parts[1];
                    let isNegative = currentInstance.sign < 0;
                    let absIntegerPart = isNegative ? integerPart.slice(1) : integerPart;
                    let absIntegerLength = absIntegerPart.length;

                    if (secondaryGroupSize) {
                        let temp = groupSize;
                        groupSize = secondaryGroupSize;
                        secondaryGroupSize = temp;
                        absIntegerLength -= secondaryGroupSize;
                    }

                    if (groupSize > 0 && absIntegerLength > 0) {
                        let firstGroupLen = absIntegerLength % groupSize || groupSize;
                        integerPart = absIntegerPart.substr(0, firstGroupLen);
                        for (; firstGroupLen < absIntegerLength; firstGroupLen += groupSize) {
                            integerPart += groupSeparator + absIntegerPart.substr(firstGroupLen, groupSize);
                        }
                        if (secondaryGroupSize > 0) {
                            integerPart += groupSeparator + absIntegerPart.slice(firstGroupLen);
                        }
                        if (isNegative) integerPart = "-" + integerPart;
                    }

                    formattedString = fractionalPart ?
                        integerPart + (formatConfig.decimalSeparator || "") +
                        ((secondaryGroupSize = +formatConfig.fractionGroupSize) ?
                            fractionalPart.replace(new RegExp("\\d{" + secondaryGroupSize + "}\\B", "g"), "$&" + (formatConfig.fractionGroupSeparator || "")) :
                            fractionalPart) :
                        integerPart;
                }
                return (formatConfig.prefix || "") + formattedString + (formatConfig.suffix || "");
            };

            BigNumberPrototype.toFraction = function(maxDenominator) {
                let numeratorBigNum, denominatorBigNum,
                    tempNum, tempDen,
                    tempBigNum, tempResult,
                    precisionExponent,
                    currentMaxRange,
                    fractionResult;

                const thisBigNum = this;
                const thisCoeffs = thisBigNum.coeffs;

                if (maxDenominator != null && (!((tempBigNum = new BigNumber(maxDenominator)).isInteger() && (tempBigNum.coeffs || tempBigNum.sign === 1)) || tempBigNum.lt(ONE_BIG_NUMBER))) {
                    throw Error(ERR_PREFIX + "Argument " + (tempBigNum.isInteger() ? "out of range: " : "not an integer: ") + toRawString(tempBigNum));
                }

                if (!thisCoeffs) return new BigNumber(thisBigNum); // NaN or Infinity.

                // Initialize for continued fraction algorithm.
                numeratorBigNum = new BigNumber(ONE_BIG_NUMBER);
                tempNum = new BigNumber(ONE_BIG_NUMBER);
                denominatorBigNum = new BigNumber(ONE_BIG_NUMBER);
                tempDen = new BigNumber(ONE_BIG_NUMBER);

                // Calculate initial precision based on magnitude.
                let coeffString = formatCoefficientArray(thisCoeffs);
                precisionExponent = numeratorBigNum.exponent = coeffString.length - thisBigNum.exponent - 1;
                numeratorBigNum.coeffs[0] = POWERS_OF_TEN_ARRAY[(tempDen = precisionExponent % DIGITS_PER_CHUNK) < 0 ? DIGITS_PER_CHUNK + tempDen : tempDen];

                // Set max denominator for iteration.
                maxDenominator = !maxDenominator || tempBigNum.comparedTo(numeratorBigNum) > 0 ? (precisionExponent > 0 ? numeratorBigNum : tempNum) : tempBigNum;

                currentMaxRange = globalRangeUpper;
                globalRangeUpper = 1 / 0; // Temporarily disable range check.

                tempBigNum = new BigNumber(coeffString); // Convert to BigNumber for division.
                tempDen.coeffs[0] = 0; // Initialize tempDen to 0.

                // Continued fraction algorithm.
                for (;;) {
                    tempResult = divideNumbers(tempBigNum, numeratorBigNum, 0, 1); // Integer division.
                    if (ONE_BIG_NUMBER.comparedTo(denominatorBigNum.plus(tempResult.times(tempDen))) !== 1) break;

                    tempNum = denominatorBigNum;
                    denominatorBigNum = denominatorBigNum.plus(tempResult.times(tempDen));
                    numeratorBigNum = tempDen;
                    tempDen = tempNum;
                    numeratorBigNum = tempBigNum.minus(tempResult.times(tempNum));
                    tempBigNum = tempNum;
                }

                tempResult = divideNumbers(maxDenominator.minus(tempNum), denominatorBigNum, 0, 1);
                tempDen = tempDen.plus(tempResult.times(numeratorBigNum));
                tempNum = tempNum.plus(tempResult.times(denominatorBigNum));

                tempDen.sign = tempNum.sign = thisBigNum.sign; // Apply original sign.

                // Choose the closer fraction.
                fractionResult = divideNumbers(numeratorBigNum, denominatorBigNum, precisionExponent *= 2, globalRoundingMode).minus(thisBigNum).abs().comparedTo(
                    divideNumbers(tempDen, tempNum, precisionExponent, globalRoundingMode).minus(thisBigNum).abs()) < 1 ? [numeratorBigNum, denominatorBigNum] : [tempDen, tempNum];

                globalRangeUpper = currentMaxRange; // Restore range check.
                return fractionResult;
            };

            BigNumberPrototype.toNumber = function() {
                return +(toRawString(this));
            };

            BigNumberPrototype.toPrecision = function(significantDigits, roundingMode) {
                if (significantDigits != null) validateArgument(significantDigits, 1, GIGA_CHUNK_BASE);
                return formatNumberString(this, significantDigits, roundingMode, 2);
            };

            BigNumberPrototype.toString = function(base) {
                let formattedString;
                const currentInstance = this;
                const currentSign = currentInstance.sign;
                const currentExponent = currentInstance.exponent;

                if (currentExponent === null) { // NaN or Infinity.
                    formattedString = currentSign ? (currentSign < 0 ? "-Infinity" : "Infinity") : "NaN";
                } else if (base == null) { // Default base 10.
                    formattedString = (currentExponent <= globalExpAtLower || currentExponent >= globalExpAtUpper) ?
                        formatToExponential(formatCoefficientArray(currentInstance.coeffs), currentExponent) :
                        formatToDecimal(formatCoefficientArray(currentInstance.coeffs), currentExponent, "0");
                } else if (base === 10) { // Explicit base 10.
                    // Recalculate with adjusted precision for toString(10).
                    const tempBigNum = roundBigNumber(new BigNumber(currentInstance), globalDecimalPlaces + currentExponent + 1, globalRoundingMode);
                    formattedString = formatToDecimal(formatCoefficientArray(tempBigNum.coeffs), tempBigNum.exponent, "0");
                } else { // Other bases.
                    validateArgument(base, 2, globalAlphabet.length, "Base");
                    formattedString = convertBase(formatToDecimal(formatCoefficientArray(currentInstance.coeffs), currentExponent, "0"), 10, base, currentSign, true);
                }
                return currentSign < 0 && currentInstance.coeffs[0] ? "-" + formattedString : formattedString;
            };

            BigNumberPrototype.valueOf = BigNumberPrototype.toJSON = function() {
                return toRawString(this);
            };

            BigNumberPrototype._isBigNumber = true; // Internal flag for type checking.

            // If a configuration object is passed during module loading, apply it.
            if (exportsContext != null && exportsContext.constructor === Object) { // Check if it's the `r` (module.exports) object.
                BigNumber.setConfiguration(exportsContext);
            }

            BigNumberConstructor = BigNumber; // Assign to the module-level variable.

        })(this); // Pass 'this' (global context in browser, or undefined in Node).

        // Export the BigNumber constructor.
        if (typeof (BigNumberConstructor = (function() {
                return BigNumberConstructor;
            }).call(requireFunc, moduleExports, exportsContext, exportsContext)) === "undefined") {
            // If the IIFE returns undefined, assign to exportsContext.
            exportsContext.exports = BigNumberConstructor;
        } else {
            // Otherwise, assign the returned value directly.
            moduleExports.default = BigNumberConstructor;
            moduleExports.BigNumber = BigNumberConstructor;
        }
    },

    // Module 3: Node.js 'fs' module wrapper.
    // This simply re-exports the native 'fs' module.
    function(exportsContext, moduleData) {
        moduleData.exports = require("fs");
    }
]);