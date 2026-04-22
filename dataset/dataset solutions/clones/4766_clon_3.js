module.exports = (function (moduleDefinitions) {
    // This array will cache loaded modules to prevent redundant loading.
    const moduleCache = {};

    /**
     * Custom implementation of a 'require' function for the bundled modules.
     * It mimics Node.js's require, handling module execution and caching.
     * @param {number} moduleId - The ID of the module to load.
     * @returns {object} The exports of the requested module.
     */
    function dynamicRequire(moduleId) {
        // If the module is already in the cache, return its exports directly.
        if (moduleCache[moduleId]) {
            return moduleCache[moduleId].exports;
        }

        // If not in cache, create a new module entry.
        const currentModule = moduleCache[moduleId] = {
            id: moduleId,        // The module's identifier.
            loaded: false,       // Flag to indicate if the module has finished loading.
            exports: {}          // The object that will hold the module's exports.
        };

        // Execute the module's definition function.
        // `this` context is set to `currentModule.exports`.
        // Arguments: (module, module.exports, dynamicRequire_function)
        moduleDefinitions[moduleId].call(currentModule.exports, currentModule, currentModule.exports, dynamicRequire);

        // Mark the module as loaded after its execution.
        currentModule.loaded = true;
        return currentModule.exports;
    }

    // Attach module definitions and cache to the dynamicRequire function for introspection/debugging.
    dynamicRequire.allModuleDefinitions = moduleDefinitions;
    dynamicRequire.loadedModuleCache = moduleCache;

    /**
     * Defines a getter property on an object if it doesn't already exist.
     * Used for lazy loading or computed properties in module exports.
     * @param {object} targetObject - The object on which to define the property.
     * @param {string} propertyName - The name of the property.
     * @param {Function} getterFunction - The function to call when the property is accessed.
     */
    dynamicRequire.defineGetterProperty = function (targetObject, propertyName, getterFunction) {
        if (!Object.prototype.hasOwnProperty.call(targetObject, propertyName)) {
            Object.defineProperty(targetObject, propertyName, {
                enumerable: true, // Make the property visible during enumeration.
                get: getterFunction // The accessor function.
            });
        }
    };

    /**
     * Marks a module's exports as an ES module, adding __esModule and Symbol.toStringTag.
     * This helps with interoperability between CommonJS and ES Modules.
     * @param {object} moduleExports - The exports object of the module.
     */
    dynamicRequire.setEsModuleFlag = function (moduleExports) {
        if (typeof Symbol !== 'undefined' && Symbol.toStringTag) {
            Object.defineProperty(moduleExports, Symbol.toStringTag, { value: 'Module' });
        }
        Object.defineProperty(moduleExports, '__esModule', { value: true });
    };

    /**
     * Provides interoperability for different module types (e.g., CommonJS, ES Modules).
     * It handles various flags to correctly resolve the default export.
     * @param {*} moduleReference - The module reference (ID or already loaded module).
     * @param {number} conversionFlags - Bitmask flags indicating conversion logic.
     * @returns {*} The resolved module export, potentially wrapped for default export.
     */
    dynamicRequire.resolveInteropModule = function (moduleReference, conversionFlags) {
        // Flag 1: If it's a module ID, dynamically require it first.
        if (conversionFlags & 1) {
            moduleReference = dynamicRequire(moduleReference);
        }
        // Flag 8: If only the module reference itself is needed, return it.
        if (conversionFlags & 8) {
            return moduleReference;
        }
        // Flag 4: If it's an object and already an ES module, return it directly.
        if ((conversionFlags & 4) && typeof moduleReference === 'object' && moduleReference !== null && moduleReference.__esModule) {
            return moduleReference;
        }

        // Otherwise, create a wrapper object to represent the default export.
        const defaultExportWrapper = Object.create(null);
        dynamicRequire.setEsModuleFlag(defaultExportWrapper);
        Object.defineProperty(defaultExportWrapper, 'default', { enumerable: true, value: moduleReference });

        // Flag 2: If it's not a string, copy all properties from the original module to the wrapper.
        if ((conversionFlags & 2) && typeof moduleReference !== 'string') {
            for (const propKey in moduleReference) {
                // Ensure it's an own property and not the 'default' key itself.
                if (propKey !== 'default' && Object.prototype.hasOwnProperty.call(moduleReference, propKey)) {
                    dynamicRequire.defineGetterProperty(defaultExportWrapper, propKey, (function (key) {
                        return moduleReference[key];
                    }).bind(null, propKey));
                }
            }
        }
        return defaultExportWrapper;
    };

    /**
     * Helper to get the default export or the module itself.
     * Used for compatibility with modules that might or might not have a `.default` property.
     * @param {*} moduleEntity - The module entity.
     * @returns {Function} A function that returns the module's default export or the module itself.
     */
    dynamicRequire.getModuleDefault = function (moduleEntity) {
        const hasEsModuleFlag = moduleEntity && moduleEntity.__esModule;
        const defaultAccessor = hasEsModuleFlag ?
            function () { return moduleEntity.default; } :
            function () { return moduleEntity; };
        // Define a getter named 'a' (common in webpack bundles) for the default accessor.
        dynamicRequire.defineGetterProperty(defaultAccessor, 'a', defaultAccessor);
        return defaultAccessor;
    };

    /**
     * Checks if an object has a specified property directly (not inherited).
     * @param {object} obj - The object to check.
     * @param {string} prop - The property name.
     * @returns {boolean} True if the object has the property, false otherwise.
     */
    dynamicRequire.hasOwnProp = function (obj, prop) {
        return Object.prototype.hasOwnProperty.call(obj, prop);
    };

    // The entry point for the application.
    // Module ID 0 is set as the starting module, and then dynamically required.
    return dynamicRequire(dynamicRequire.entryModuleId = 0);
})([
    // Module 0: Handles input reading from stdin and orchestrates the main calculation.
    function (moduleContext, moduleExports, dynamicRequire) {
        // Retrieve the core calculation logic from module 1.
        const computeFactorialDivisorCount = dynamicRequire(1);
        // Load the Node.js 'fs' (file system) module from module 3.
        const nodeFileSystem = dynamicRequire(3);

        let standardInputContent;
        try {
            // Attempt to read synchronously from /dev/stdin.
            standardInputContent = nodeFileSystem.readFileSync("/dev/stdin", "UTF-8");
        } catch (error) {
            // If reading fails, log an error and provide a fallback or exit.
            console.error("Error encountered while reading from /dev/stdin:", error.message);
            // In a production environment, one might exit here or use a default.
            // For this example, we'll provide a minimal default to prevent crash.
            standardInputContent = "1\n"; // Default N to 1 if input fails.
        }

        // Split the input content into an array of lines.
        const inputLinesArray = standardInputContent.split("\n");

        // Basic input validation: ensure there's at least one non-empty line.
        if (!inputLinesArray || inputLinesArray.length === 0 || !inputLinesArray[0].trim()) {
            console.error("No valid input was provided. The program will terminate.");
            return; // Exit if input is invalid or empty.
        }

        // Pass the processed input lines to the main calculation function.
        computeFactorialDivisorCount(inputLinesArray);
    },

    // Module 1: Contains the primary logic to calculate the number of divisors of N!.
    function (moduleContext, moduleExports, dynamicRequire) {
        // Import the BigNumber constructor from module 2 to handle large numbers.
        const BigNumberConstructor = dynamicRequire(2);

        // Export the main function responsible for the calculation.
        moduleContext.exports = function (inputLines) {
            // A map to store the accumulated exponents of each prime factor.
            // e.g., { 2: 4, 3: 2, 5: 1 } for 6!
            const accumulatedPrimeExponents = {};

            // Parse the input 'N' (the upper limit for factorial) from the first line.
            const factorialUpperLimit = parseInt(inputLines[0], 10);

            // Input validation for the upper limit.
            if (isNaN(factorialUpperLimit) || factorialUpperLimit < 0) {
                console.error("Invalid or negative numeric input for N:", inputLines[0]);
                return; // Exit if N is not a valid non-negative number.
            }

            // Handle edge cases for N = 0 or N = 1, where N! has only 1 divisor.
            if (factorialUpperLimit <= 1) {
                console.log("1");
                return;
            }

            // Iterate from N down to 2 to find prime factors for each number.
            for (let currentNumber = factorialUpperLimit; currentNumber >= 2; currentNumber--) {
                let tempNumberForFactoring = currentNumber; // Use a mutable copy for factorization.
                const squareRootLimit = Math.floor(Math.sqrt(tempNumberForFactoring)); // Optimization for prime factorization.

                // Find prime factors up to the square root of the current number.
                for (let primeCandidate = 2; primeCandidate <= squareRootLimit; primeCandidate++) {
                    if (tempNumberForFactoring % primeCandidate === 0) {
                        let exponentCount = 0; // Exponent for the current prime factor.
                        // Count how many times primeCandidate divides tempNumberForFactoring.
                        while (tempNumberForFactoring % primeCandidate === 0) {
                            tempNumberForFactoring /= primeCandidate;
                            exponentCount++;
                        }
                        // Add this exponent to the total for this prime factor.
                        // Initialize if prime factor not seen before.
                        accumulatedPrimeExponents[primeCandidate] = (accumulatedPrimeExponents[primeCandidate] || 0) + exponentCount;
                    }
                }

                // If tempNumberForFactoring is still greater than 1 after the loop,
                // it means the remaining value is a prime factor itself.
                if (tempNumberForFactoring > 1) {
                    accumulatedPrimeExponents[tempNumberForFactoring] = (accumulatedPrimeExponents[tempNumberForFactoring] || 0) + 1;
                }
            }

            // Initialize the total number of divisors (using BigNumber for potentially large results).
            let totalDivisorsCount = new BigNumberConstructor(1);

            // Calculate the total number of divisors using the formula:
            // (e1 + 1) * (e2 + 1) * ... * (ek + 1)
            // where e_i is the exponent of the i-th prime factor.
            for (const primeFactor in accumulatedPrimeExponents) {
                // Ensure we only process own properties of the object.
                if (Object.prototype.hasOwnProperty.call(accumulatedPrimeExponents, primeFactor)) {
                    const exponentPlusOne = accumulatedPrimeExponents[primeFactor] + 1;
                    totalDivisorsCount = totalDivisorsCount.times(exponentPlusOne);
                }
            }

            // Output the final result to the console.
            console.log(totalDivisorsCount.toString());
        };
    },

    // Module 2: The BigNumber.js library, adapted for this bundle.
    // This module is largely a minified, self-contained library.
    // Changes here focus on renaming top-level variables, reformatting, and minimal syntactic alterations
    // without changing the core numerical algorithms which are highly optimized.
    function (moduleContext, moduleExports, dynamicRequire) {
        let BigNumberClassConstructor;

        (function (globalObject) {
            "use strict"; // Enforce strict mode for the BigNumber library.

            // Regular expression to test if a string represents a valid number.
            const numberParsingRegex = /^-?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i;

            // Alias Math functions for minification/readability.
            const mathCeiling = Math.ceil;
            const mathFlooring = Math.floor;

            // Standard error messages for BigNumber operations.
            const errorPrefixString = "[BigNumber Error] ";
            const errorPrecisionWarning = errorPrefixString + "Number primitive has more than 15 significant digits: ";

            // Core constants for the internal representation of BigNumbers.
            const internalBaseMagnitude = 1e14; // Numbers are stored as arrays of digits in base 10^14.
            const internalBaseDigits = 14;      // Number of decimal digits in each array element.
            const javascriptMaxSafeInteger = 9007199254740991; // 2^53 - 1.
            // Pre-computed powers of 10 for efficient digit extraction.
            const powersOfTenArray = [1, 10, 100, 1e3, 1e4, 1e5, 1e6, 1e7, 1e8, 1e9, 1e10, 1e11, 1e12, 1e13];
            const halfInternalBaseMagnitude = 1e7; // Square root of 10^14 (10^7).
            const maxAllowedPrecision = 1e9;      // Maximum value for DECIMAL_PLACES, POW_PRECISION settings.

            /**
             * Truncates a number towards zero (like Math.trunc).
             * For positive numbers, it's equivalent to Math.floor.
             * For negative numbers, it's equivalent to Math.ceil.
             * @param {number} val - The number to truncate.
             * @returns {number} The truncated integer.
             */
            function truncateValue(val) {
                const integerPart = val | 0; // Bitwise OR 0 is a fast way to truncate towards zero.
                return val > 0 || val === integerPart ? integerPart : integerPart - 1;
            }

            /**
             * Converts an array of coefficients (internal representation) into a formatted string.
             * It pads each coefficient with leading zeros to maintain the baseDigits length.
             * @param {number[]} coefficientsArray - The array of BigNumber coefficients.
             * @returns {string} The raw string representation of the coefficients.
             */
            function formatCoefficientsToString(coefficientsArray) {
                let segmentValue, paddingCount;
                let currentSegmentIndex = 1;
                const totalSegments = coefficientsArray.length;
                // Start with the first coefficient.
                let resultString = coefficientsArray[0] + "";

                // Append subsequent coefficients, padding with zeros as necessary.
                while (currentSegmentIndex < totalSegments) {
                    segmentValue = coefficientsArray[currentSegmentIndex++] + "";
                    paddingCount = internalBaseDigits - segmentValue.length;
                    for (; paddingCount--; segmentValue = "0" + segmentValue); // Pad with leading zeros.
                    resultString += segmentValue;
                }

                // Remove any trailing zeros from the overall string.
                let lastCharPosition = resultString.length;
                for (; 48 === resultString.charCodeAt(--lastCharPosition);); // ASCII '0' is 48.
                return resultString.slice(0, lastCharPosition + 1 || 1);
            }

            /**
             * Compares two BigNumber instances.
             * @param {BigNumberInstance} bnOne - The first BigNumber.
             * @param {BigNumberInstance} bnTwo - The second BigNumber.
             * @returns {number|null} 0 if equal, 1 if bnOne > bnTwo, -1 if bnOne < bnTwo. Returns null if either is NaN.
             */
            function compareTwoBigNumbers(bnOne, bnTwo) {
                let isFirstZero, isSecondZero;
                const coeffOne = bnOne.c;
                const coeffTwo = bnTwo.c;
                const signOne = bnOne.s;
                const signTwo = bnTwo.s;
                const expOne = bnOne.e;
                const expTwo = bnTwo.e;

                if (!signOne || !signTwo) return null; // If either sign is null, it's NaN.

                isFirstZero = coeffOne && !coeffOne[0];
                isSecondZero = coeffTwo && !coeffTwo[0];

                if (isFirstZero || isSecondZero) {
                    return isFirstZero ? (isSecondZero ? 0 : -signTwo) : signOne; // If both zero, 0. Else, sign of non-zero.
                }

                if (signOne !== signTwo) return signOne; // Different signs, the positive one is greater.

                // Same sign, compare magnitudes.
                isFirstZero = signOne < 0; // Reuse variable for 'isNegative' flag.
                isSecondZero = expOne === expTwo; // Reuse variable for 'exponentsAreEqual' flag.

                if (!coeffOne || !coeffTwo) {
                    return isSecondZero ? 0 : (!coeffOne ^ isFirstZero ? 1 : -1); // Handle Infinity cases.
                }

                if (!isSecondZero) return (expOne > expTwo) ^ isFirstZero ? 1 : -1; // Different exponents, larger exponent wins (adjusted for negative).

                // Same sign and exponent, compare coefficients element by element.
                const lengthOne = coeffOne.length;
                const lengthTwo = coeffTwo.length;
                const minLength = lengthOne < lengthTwo ? lengthOne : lengthTwo;

                for (let i = 0; i < minLength; i++) {
                    if (coeffOne[i] !== coeffTwo[i]) {
                        return (coeffOne[i] > coeffTwo[i]) ^ isFirstZero ? 1 : -1;
                    }
                }
                return lengthOne === lengthTwo ? 0 : (lengthOne > lengthTwo) ^ isFirstZero ? 1 : -1;
            }

            /**
             * Validates a numeric argument against a range and ensures it's an integer.
             * Throws an error if validation fails.
             * @param {number} value - The argument value to validate.
             * @param {number} minAllowed - Minimum acceptable value.
             * @param {number} maxAllowed - Maximum acceptable value.
             * @param {string} [argName] - Optional name of the argument for error messages.
             */
            function validateNumericArgument(value, minAllowed, maxAllowed, argName) {
                if (value < minAllowed || value > maxAllowed || value !== mathFlooring(value)) {
                    throw Error(errorPrefixString + (argName || "Argument") +
                        (typeof value === 'number' ?
                            (value < minAllowed || value > maxAllowed ? " out of range: " : " not an integer: ") :
                            " not a primitive number: ") + String(value));
                }
            }

            /**
             * Checks if a BigNumber represents an odd integer.
             * @param {BigNumberInstance} bigNum - The BigNumber instance to check.
             * @returns {boolean} True if the BigNumber is an odd integer, false otherwise.
             */
            function isBigNumberOdd(bigNum) {
                const lastCoeffIndex = bigNum.c.length - 1;
                return truncateValue(bigNum.e / internalBaseDigits) === lastCoeffIndex && bigNum.c[lastCoeffIndex] % 2 !== 0;
            }

            /**
             * Formats a coefficient string into exponential notation.
             * @param {string} coeffString - The raw coefficient string.
             * @param {number} exponentValue - The BigNumber's exponent.
             * @returns {string} The string in exponential notation (e.g., "1.23e+5").
             */
            function toScientificNotationString(coeffString, exponentValue) {
                return (coeffString.length > 1 ?
                    coeffString.charAt(0) + "." + coeffString.slice(1) :
                    coeffString) + (exponentValue < 0 ? "e" : "e+") + exponentValue;
            }

            /**
             * Formats a coefficient string into fixed-point notation.
             * @param {string} coeffString - The raw coefficient string.
             * @param {number} exponentValue - The BigNumber's exponent.
             * @param {string} paddingChar - The character to use for padding (usually '0').
             * @returns {string} The string in fixed-point notation (e.g., "123000.00").
             */
            function toFixedPointString(coeffString, exponentValue, paddingChar) {
                let currentLength, totalStringLength;
                if (exponentValue < 0) {
                    for (currentLength = paddingChar + "."; ++exponentValue; currentLength += paddingChar);
                    coeffString = currentLength + coeffString;
                } else if (++exponentValue > (totalStringLength = coeffString.length)) {
                    for (currentLength = paddingChar, exponentValue -= totalStringLength; --exponentValue; currentLength += paddingChar);
                    coeffString += currentLength;
                } else if (exponentValue < totalStringLength) {
                    coeffString = coeffString.slice(0, exponentValue) + "." + coeffString.slice(exponentValue);
                }
                return coeffString;
            }

            // BigNumber constructor function, wrapped in an IIFE for configuration.
            const BigNumberFactory = (function BigNumberFactoryFunction(configOptions) {
                // Define the prototype for BigNumber instances.
                const BigNumberPrototype = BigNumberClass.prototype = {
                    constructor: BigNumberClass,
                    toString: null, // Will be assigned later.
                    valueOf: null   // Will be assigned later.
                };

                // A constant BigNumber instance representing 1.
                const BIG_NUMBER_ONE = new BigNumberClass(1);

                // Default configurable settings for BigNumber operations.
                let decimalPlacesConfig = 20;
                let roundingModeConfig = 4; // ROUND_HALF_UP.
                let exponentialLowerBound = -7;
                let exponentialUpperBound = 21;
                let rangeMinExponent = -1e7; // Minimum exponent value.
                let rangeMaxExponent = 1e7;  // Maximum exponent value.
                let useCryptoRandom = false; // Whether to use crypto.getRandomValues for random numbers.
                let moduloCalculationMode = 1; // ROUND_DOWN for modulo.
                let powerOperationPrecision = 0; // Precision for power operations.
                const formattingSettings = {
                    prefix: "", groupSize: 3, secondaryGroupSize: 0, groupSeparator: ",",
                    decimalSeparator: ".", fractionGroupSize: 0, fractionGroupSeparator: " ", suffix: ""
                };
                let alphabetCharacters = "0123456789abcdefghijklmnopqrstuvwxyz"; // Alphabet for custom bases.

                /**
                 * BigNumber constructor. Creates a new BigNumber instance.
                 * @param {string|number|BigNumberInstance} initialValue - The value to convert.
                 * @param {number} [base] - The base of the initialValue (2-36).
                 */
                function BigNumberClass(initialValue, base) {
                    let coefficientsArray, exponentValue, isInputNumeric, signModifier, index, length, charCode, tempString;
                    const instance = this;

                    // Ensure the 'new' keyword was used.
                    if (!(instance instanceof BigNumberClass)) {
                        return new BigNumberClass(initialValue, base);
                    }

                    // Handle existing BigNumber instances (clone them).
                    if (base == null) {
                        if (initialValue && initialValue._isBigNumber === true) {
                            instance.s = initialValue.s;
                            if (!initialValue.c || initialValue.e > rangeMaxExponent) {
                                instance.c = instance.e = null; // Value is too large (Infinity).
                            } else if (initialValue.e < rangeMinExponent) {
                                instance.c = [instance.e = 0]; // Value is too small (effectively zero).
                            } else {
                                instance.e = initialValue.e;
                                instance.c = initialValue.c.slice(); // Deep copy coefficients.
                            }
                            return;
                        }

                        // Process number primitives.
                        isInputNumeric = (typeof initialValue === 'number') && isFinite(initialValue);
                        if (isInputNumeric) {
                            instance.s = (1 / initialValue < 0) ? (initialValue = -initialValue, -1) : 1; // Determine sign.
                            if (initialValue === mathFlooring(initialValue)) { // If it's an integer.
                                for (exponentValue = 0, coefficientsArray = initialValue; coefficientsArray >= 10; coefficientsArray /= 10, exponentValue++);
                                if (exponentValue > rangeMaxExponent) {
                                    instance.c = instance.e = null;
                                } else {
                                    instance.e = exponentValue;
                                    instance.c = [initialValue];
                                }
                                return;
                            }
                            tempString = String(initialValue); // Convert float to string.
                        } else {
                            // Process string input without a base.
                            if (!numberParsingRegex.test(tempString = String(initialValue))) {
                                return handleInvalidInput(instance, tempString, isInputNumeric);
                            }
                            instance.s = (45 === tempString.charCodeAt(0)) ? (tempString = tempString.slice(1), -1) : 1; // Check for negative sign.
                        }

                        // Parse decimal point and scientific notation.
                        if ((exponentValue = tempString.indexOf(".")) > -1) {
                            tempString = tempString.replace(".", ""); // Remove decimal point.
                        }
                        if ((index = tempString.search(/e/i)) > 0) {
                            if (exponentValue < 0) exponentValue = index;
                            exponentValue += +tempString.slice(index + 1); // Add exponent value.
                            tempString = tempString.substring(0, index); // Remove exponent part.
                        } else if (exponentValue < 0) {
                            exponentValue = tempString.length; // If no decimal, exponent is based on string length.
                        }
                    } else {
                        // Handle input with a specified base.
                        validateNumericArgument(base, 2, alphabetCharacters.length, "Base");

                        if (10 === base) { // If base is 10, use standard rounding.
                            return roundBigNumber(instance = new BigNumberClass(initialValue), decimalPlacesConfig + instance.e + 1, roundingModeConfig);
                        }

                        tempString = String(initialValue);
                        isInputNumeric = (typeof initialValue === 'number');

                        if (isInputNumeric) {
                            if (!isFinite(initialValue)) return handleInvalidInput(instance, tempString, isInputNumeric, base);
                            instance.s = (1 / initialValue < 0) ? (tempString = tempString.slice(1), -1) : 1;
                            if (BigNumberClass.DEBUG && tempString.replace(/^0\.0*|\./, "").length > 15) {
                                throw Error(errorPrecisionWarning + initialValue);
                            }
                        } else {
                            instance.s = (45 === tempString.charCodeAt(0)) ? (tempString = tempString.slice(1), -1) : 1;
                        }

                        const baseAlphabetSlice = alphabetCharacters.slice(0, base);
                        let decimalPointPosition = 0;
                        let scanStartIndex = 0;
                        const stringLength = tempString.length;
                        let caseConversionAttempted = false;

                        // Validate characters against the custom base alphabet.
                        for (; scanStartIndex < stringLength; scanStartIndex++) {
                            if (baseAlphabetSlice.indexOf(tempString.charAt(scanStartIndex)) < 0) {
                                if ("." === tempString.charAt(scanStartIndex)) {
                                    if (scanStartIndex > decimalPointPosition) {
                                        decimalPointPosition = stringLength; // Mark decimal point.
                                        continue;
                                    }
                                } else if (!caseConversionAttempted && (
                                    (tempString === tempString.toUpperCase() && (tempString = tempString.toLowerCase())) ||
                                    (tempString === tempString.toLowerCase() && (tempString = tempString.toUpperCase()))
                                )) {
                                    caseConversionAttempted = true; // Try converting case.
                                    scanStartIndex = -1; // Restart scan.
                                    decimalPointPosition = 0;
                                    continue;
                                }
                                return handleInvalidInput(instance, String(initialValue), isInputNumeric, base);
                            }
                        }

                        isInputNumeric = false; // Input is string-based, not a primitive number.
                        // Convert from custom base string to base 10 string.
                        decimalPointPosition = (tempString = convertBase(tempString, base, 10, instance.s)).indexOf(".");
                        if (decimalPointPosition > -1) {
                            tempString = tempString.replace(".", "");
                        } else {
                            decimalPointPosition = tempString.length;
                        }
                    }

                    // Remove leading zeros from the coefficient string.
                    for (index = 0; 48 === tempString.charCodeAt(index); index++);
                    // Remove trailing zeros from the coefficient string.
                    for (length = tempString.length; 48 === tempString.charCodeAt(--length););

                    if ((tempString = tempString.slice(index, ++length))) {
                        // Debug check for precision loss with large numbers.
                        if (length -= index, isInputNumeric && BigNumberClass.DEBUG && length > 15 && (initialValue > javascriptMaxSafeInteger || initialValue !== mathFlooring(initialValue))) {
                            throw Error(errorPrecisionWarning + instance.s * initialValue);
                        }

                        // Determine the final exponent and populate the coefficients array.
                        if ((exponentValue = decimalPointPosition - index - 1) > rangeMaxExponent) {
                            instance.c = instance.e = null; // Too large.
                        } else if (exponentValue < rangeMinExponent) {
                            instance.c = [instance.e = 0]; // Too small (effectively zero).
                        } else {
                            instance.e = exponentValue;
                            instance.c = [];
                            index = (exponentValue + 1) % internalBaseDigits;
                            if (exponentValue < 0) index += internalBaseDigits; // Adjust for negative exponent.

                            if (index < length) {
                                if (index) instance.c.push(+tempString.slice(0, index));
                                for (length -= internalBaseDigits; index < length;) {
                                    instance.c.push(+tempString.slice(index, index += internalBaseDigits));
                                }
                                index = internalBaseDigits - (tempString = tempString.slice(index)).length;
                            } else {
                                index -= length;
                            }
                            for (; index--; tempString += "0"); // Pad with trailing zeros to fill the segment.
                            instance.c.push(+tempString);
                        }
                    } else {
                        instance.c = [instance.e = 0]; // Value is exactly zero.
                    }
                }

                /**
                 * Formats a BigNumber instance into a string representation based on specified decimal places
                 * and formatting type (fixed, exponential, or precision).
                 * @param {BigNumberInstance} bnInstance - The BigNumber to format.
                 * @param {number} [targetDecimalPlaces] - Number of decimal places or significant digits.
                 * @param {number} [currentRoundingMode] - Rounding mode to apply.
                 * @param {number} [formatOutputFlag] - 1 for exponential, 2 for precision.
                 * @returns {string} The formatted string.
                 */
                function formatBigNumberOutput(bnInstance, targetDecimalPlaces, currentRoundingMode, formatOutputFlag) {
                    let firstCoefficient, currentExponent, formattedCoefficients;
                    let segmentCount, finalResultString;

                    if (currentRoundingMode == null) currentRoundingMode = roundingModeConfig;
                    else validateNumericArgument(currentRoundingMode, 0, 8);

                    if (!bnInstance.c) return bnInstance.toString(); // Handle NaN or Infinity.

                    firstCoefficient = bnInstance.c[0];
                    currentExponent = bnInstance.e;

                    if (targetDecimalPlaces == null) {
                        formattedCoefficients = formatCoefficientsToString(bnInstance.c);
                        finalResultString = (formatOutputFlag === 1 || (formatOutputFlag === 2 && (currentExponent <= exponentialLowerBound || currentExponent >= exponentialUpperBound))) ?
                            toScientificNotationString(formattedCoefficients, currentExponent) :
                            toFixedPointString(formattedCoefficients, currentExponent, "0");
                    } else {
                        // Apply rounding first, then format.
                        bnInstance = roundBigNumber(new BigNumberClass(bnInstance), targetDecimalPlaces + currentExponent + 1, currentRoundingMode);
                        currentExponent = bnInstance.e;
                        segmentCount = (formattedCoefficients = formatCoefficientsToString(bnInstance.c)).length;

                        if (formatOutputFlag === 1 || (formatOutputFlag === 2 && (targetDecimalPlaces <= currentExponent || currentExponent <= exponentialLowerBound))) {
                            for (; segmentCount < targetDecimalPlaces; formattedCoefficients += "0", segmentCount++);
                            finalResultString = toScientificNotationString(formattedCoefficients, currentExponent);
                        } else if (targetDecimalPlaces -= currentExponent, finalResultString = toFixedPointString(formattedCoefficients, currentExponent, "0"), currentExponent + 1 > segmentCount) {
                            if (--targetDecimalPlaces > 0) {
                                for (finalResultString += "."; targetDecimalPlaces--; finalResultString += "0");
                            }
                        } else if ((targetDecimalPlaces += currentExponent - segmentCount) > 0) {
                            if (currentExponent + 1 === segmentCount) finalResultString += ".";
                            for (; targetDecimalPlaces--; finalResultString += "0");
                        }
                    }
                    return bnInstance.s < 0 && firstCoefficient ? "-" + finalResultString : finalResultString;
                }

                /**
                 * Finds the minimum or maximum BigNumber from a list of arguments.
                 * @param {IArguments} bigNumArguments - The arguments object containing BigNumber instances.
                 * @param {Function} comparisonFunction - A prototype method like `.lt` (for max) or `.gt` (for min).
                 * @returns {BigNumberInstance} The BigNumber representing the extremum.
                 */
                function findExtremumBigNumber(bigNumArguments, comparisonFunction) {
                    let extremeValue = new BigNumberClass(bigNumArguments[0]);
                    let currentBigNumber;
                    for (let i = 1, argCount = bigNumArguments.length; i < argCount; i++) {
                        currentBigNumber = new BigNumberClass(bigNumArguments[i]);
                        if (!currentBigNumber.s) { // If a NaN is encountered, it takes precedence.
                            extremeValue = currentBigNumber;
                            break;
                        }
                        if (comparisonFunction.call(extremeValue, currentBigNumber)) {
                            extremeValue = currentBigNumber;
                        }
                    }
                    return extremeValue;
                }

                /**
                 * Finalizes a BigNumber instance by cleaning up coefficients (removing trailing zeros)
                 * and adjusting the exponent. It also checks for range boundaries.
                 * @param {BigNumberInstance} bnToFinalize - The BigNumber instance being finalized.
                 * @param {number[]} finalCoefficients - The processed coefficient array.
                 * @param {number} rawExponent - The raw exponent before final adjustment.
                 * @returns {BigNumberInstance} The finalized BigNumber instance.
                 */
                function finalizeBigNumberCoefficients(bnToFinalize, finalCoefficients, rawExponent) {
                    // Remove trailing zero coefficients.
                    let lastCoeffIndex = finalCoefficients.length;
                    for (; !finalCoefficients[--lastCoeffIndex]; finalCoefficients.pop());

                    // Determine the true exponent based on the most significant digit.
                    let firstCoeff = finalCoefficients[0];
                    let digitsInFirstCoeff = 1;
                    for (; firstCoeff >= 10; firstCoeff /= 10, digitsInFirstCoeff++);

                    // Adjust the exponent and check if it's within the allowed range.
                    rawExponent = digitsInFirstCoeff + rawExponent * internalBaseDigits - 1;
                    if (rawExponent > rangeMaxExponent) {
                        bnToFinalize.c = bnToFinalize.e = null; // Set to Infinity.
                    } else if (rawExponent < rangeMinExponent) {
                        bnToFinalize.c = [bnToFinalize.e = 0]; // Set to zero.
                    } else {
                        bnToFinalize.e = rawExponent;
                        bnToFinalize.c = finalCoefficients;
                    }
                    return bnToFinalize;
                }

                /**
                 * Rounds a BigNumber to a specified number of significant digits or decimal places.
                 * @param {BigNumberInstance} bnToRound - The BigNumber instance to round.
                 * @param {number} targetPrecision - The number of significant digits or decimal places.
                 * @param {number} currentRoundingMode - The rounding mode to use (e.g., ROUND_HALF_UP).
                 * @param {boolean} [isZeroCheckFlag] - Internal flag, for checking if a value is effectively zero.
                 * @returns {BigNumberInstance} The rounded BigNumber.
                 */
                function roundBigNumber(bnToRound, targetPrecision, currentRoundingMode, isZeroCheckFlag) {
                    let i, firstCoeff, digitsCount, remainderCoeff, roundingDigit, carryValue;
                    const coefficients = bnToRound.c;
                    const powersArray = powersOfTenArray;

                    if (!coefficients) return bnToRound; // NaN or Infinity cannot be rounded.

                    firstCoeff = coefficients[0];
                    digitsCount = 1;
                    for (; firstCoeff >= 10; firstCoeff /= 10, digitsCount++); // Count digits in the first coefficient.

                    // Calculate the position of the digit that determines rounding.
                    let roundingPosition = targetPrecision - digitsCount;

                    if (roundingPosition < 0) { // Rounding affects the first coefficient.
                        roundingPosition += internalBaseDigits;
                        i = 0;
                        remainderCoeff = targetPrecision;
                        roundingDigit = (carryValue = coefficients[i]) / powersArray[digitsCount - remainderCoeff - 1] % 10 | 0;
                    } else if ((i = mathFlooring((roundingPosition + 1) / internalBaseDigits)) >= coefficients.length) {
                        // Rounding beyond the existing coefficients (means it's already "rounded" or very small).
                        if (!isZeroCheckFlag) return bnToRound; // No-op unless specifically checking for zero.
                        for (; coefficients.length <= i; coefficients.push(0)); // Pad with zeros.
                        carryValue = roundingDigit = 0;
                        digitsCount = 1;
                        remainderCoeff = (roundingPosition % internalBaseDigits) - internalBaseDigits + 1;
                    } else {
                        // Rounding affects a later coefficient.
                        carryValue = firstCoeff = coefficients[i];
                        digitsCount = 1;
                        for (; firstCoeff >= 10; firstCoeff /= 10, digitsCount++);
                        roundingDigit = (remainderCoeff = (roundingPosition % internalBaseDigits) - internalBaseDigits + digitsCount) < 0 ?
                            0 : carryValue / powersArray[digitsCount - remainderCoeff - 1] % 10 | 0;
                    }

                    // Determine if a carry-over (rounding up) is needed.
                    isZeroCheckFlag = isZeroCheckFlag || targetPrecision < 0 || coefficients[0] === 0;
                    isZeroCheckFlag = isZeroCheckFlag || (remainderCoeff < 0 ? carryValue : carryValue % powersArray[digitsCount - remainderCoeff - 1]);

                    isZeroCheckFlag = currentRoundingMode < 4 ?
                        (roundingDigit || isZeroCheckFlag) && (currentRoundingMode === 0 || currentRoundingMode === (bnToRound.s < 0 ? 3 : 2)) : // UP, DOWN, CEIL, FLOOR
                        roundingDigit > 5 || (roundingDigit === 5 && (currentRoundingMode === 4 || isZeroCheckFlag || (currentRoundingMode === 6 && (roundingPosition > 0 ? remainderCoeff > 0 ? carryValue / powersArray[digitsCount - remainderCoeff] : 0 : coefficients[i - 1]) % 10 & 1) || currentRoundingMode === (bnToRound.s < 0 ? 8 : 7))); // HALF modes.

                    // If target precision is less than 1 or the number is zero.
                    if (targetPrecision < 1 || coefficients[0] === 0) {
                        coefficients.length = 0;
                        if (isZeroCheckFlag) {
                            targetPrecision -= bnToRound.e + 1;
                            coefficients[0] = powersArray[(internalBaseDigits - targetPrecision % internalBaseDigits) % internalBaseDigits];
                            bnToRound.e = -targetPrecision || 0;
                        } else {
                            coefficients[0] = bnToRound.e = 0;
                        }
                        return bnToRound;
                    }

                    // Apply the rounding.
                    if (roundingPosition === 0) {
                        coefficients.length = i;
                        carryValue = 1;
                        i--;
                    } else {
                        coefficients.length = i + 1;
                        carryValue = powersArray[internalBaseDigits - roundingPosition];
                        coefficients[i] = remainderCoeff > 0 ? mathFlooring(carryValue / powersArray[digitsCount - remainderCoeff] % powersArray[remainderCoeff]) * carryValue : 0;
                    }

                    if (isZeroCheckFlag) {
                        for (;;) {
                            if (i === 0) {
                                digitsCount = 1;
                                firstCoeff = coefficients[0];
                                for (; firstCoeff >= 10; firstCoeff /= 10, digitsCount++);
                                firstCoeff = coefficients[0] += carryValue;
                                carryValue = 1;
                                for (; firstCoeff >= 10; firstCoeff /= 10, carryValue++);
                                if (digitsCount !== carryValue) {
                                    bnToRound.e++;
                                    if (coefficients[0] === internalBaseMagnitude) coefficients[0] = 1;
                                }
                                break;
                            }
                            if (coefficients[i] += carryValue, coefficients[i] !== internalBaseMagnitude) break;
                            coefficients[i--] = 0;
                            carryValue = 1;
                        }
                    }

                    // Remove trailing zeros again after rounding.
                    for (i = coefficients.length; 0 === coefficients[--i]; coefficients.pop());

                    // Final check for exponent range.
                    if (bnToRound.e > rangeMaxExponent) {
                        bnToRound.c = bnToRound.e = null;
                    } else if (bnToRound.e < rangeMinExponent) {
                        bnToRound.c = [bnToRound.e = 0];
                    }

                    return bnToRound;
                }

                /**
                 * Converts a BigNumber to its raw string representation (no specific formatting).
                 * This is often used internally for calculations or comparisons.
                 * @param {BigNumberInstance} bn - The BigNumber instance.
                 * @returns {string} The raw string representation.
                 */
                function toRawBigNumberString(bn) {
                    const exponentVal = bn.e;
                    if (bn.c === null) return bn.toString(); // If NaN or Infinity.
                    const coeffString = formatCoefficientsToString(bn.c);
                    return (exponentVal <= exponentialLowerBound || exponentVal >= exponentialUpperBound) ?
                        toScientificNotationString(coeffString, exponentVal) :
                        toFixedPointString(coeffString, exponentVal, "0");
                }

                // --- BigNumber Static Methods and Configuration ---

                // Expose a clone function for creating new BigNumber constructors with different configs.
                BigNumberClass.clone = BigNumberFactoryFunction;
                // Rounding mode constants.
                BigNumberClass.ROUND_UP = 0;
                BigNumberClass.ROUND_DOWN = 1;
                BigNumberClass.ROUND_CEIL = 2;
                BigNumberClass.ROUND_FLOOR = 3;
                BigNumberClass.ROUND_HALF_UP = 4;
                BigNumberClass.ROUND_HALF_DOWN = 5;
                BigNumberClass.ROUND_HALF_EVEN = 6;
                BigNumberClass.ROUND_HALF_CEIL = 7;
                BigNumberClass.ROUND_HALF_FLOOR = 8;
                BigNumberClass.EUCLID = 9; // Modulo mode.

                /**
                 * Configures the global settings for BigNumber operations.
                 * @param {object} settingsObject - An object containing settings to update.
                 * @returns {object} The current BigNumber configuration.
                 */
                BigNumberClass.config = BigNumberClass.set = function (settingsObject) {
                    let settingKey, currentValue;
                    if (settingsObject != null) {
                        if (typeof settingsObject !== 'object') {
                            throw Error(errorPrefixString + "Object expected for configuration: " + settingsObject);
                        }

                        // DECIMAL_PLACES setting.
                        if (Object.prototype.hasOwnProperty.call(settingsObject, settingKey = "DECIMAL_PLACES")) {
                            validateNumericArgument(currentValue = settingsObject[settingKey], 0, maxAllowedPrecision, settingKey);
                            decimalPlacesConfig = currentValue;
                        }
                        // ROUNDING_MODE setting.
                        if (Object.prototype.hasOwnProperty.call(settingsObject, settingKey = "ROUNDING_MODE")) {
                            validateNumericArgument(currentValue = settingsObject[settingKey], 0, 8, settingKey);
                            roundingModeConfig = currentValue;
                        }
                        // EXPONENTIAL_AT setting.
                        if (Object.prototype.hasOwnProperty.call(settingsObject, settingKey = "EXPONENTIAL_AT")) {
                            currentValue = settingsObject[settingKey];
                            if (Array.isArray(currentValue)) { // If an array [lower, upper].
                                validateNumericArgument(currentValue[0], -maxAllowedPrecision, 0, settingKey);
                                validateNumericArgument(currentValue[1], 0, maxAllowedPrecision, settingKey);
                                exponentialLowerBound = currentValue[0];
                                exponentialUpperBound = currentValue[1];
                            } else { // If a single number (symmetric bounds).
                                validateNumericArgument(currentValue, -maxAllowedPrecision, maxAllowedPrecision, settingKey);
                                exponentialLowerBound = -(exponentialUpperBound = (currentValue < 0 ? -currentValue : currentValue));
                            }
                        }
                        // RANGE setting.
                        if (Object.prototype.hasOwnProperty.call(settingsObject, settingKey = "RANGE")) {
                            currentValue = settingsObject[settingKey];
                            if (Array.isArray(currentValue)) { // If an array [min, max].
                                validateNumericArgument(currentValue[0], -maxAllowedPrecision, -1, settingKey);
                                validateNumericArgument(currentValue[1], 1, maxAllowedPrecision, settingKey);
                                rangeMinExponent = currentValue[0];
                                rangeMaxExponent = currentValue[1];
                            } else { // If a single number (symmetric bounds).
                                validateNumericArgument(currentValue, -maxAllowedPrecision, maxAllowedPrecision, settingKey);
                                if (!currentValue) throw Error(errorPrefixString + settingKey + " cannot be zero: " + currentValue);
                                rangeMinExponent = -(rangeMaxExponent = (currentValue < 0 ? -currentValue : currentValue));
                            }
                        }
                        // CRYPTO setting.
                        if (Object.prototype.hasOwnProperty.call(settingsObject, settingKey = "CRYPTO")) {
                            if ((currentValue = settingsObject[settingKey]) !== true && currentValue !== false) {
                                throw Error(errorPrefixString + settingKey + " not true or false: " + currentValue);
                            }
                            if (currentValue) {
                                if (typeof crypto === 'undefined' || !crypto || (!crypto.getRandomValues && !crypto.randomBytes)) {
                                    throw useCryptoRandom = !currentValue, Error(errorPrefixString + "crypto unavailable");
                                }
                                useCryptoRandom = currentValue;
                            } else {
                                useCryptoRandom = currentValue;
                            }
                        }
                        // MODULO_MODE setting.
                        if (Object.prototype.hasOwnProperty.call(settingsObject, settingKey = "MODULO_MODE")) {
                            validateNumericArgument(currentValue = settingsObject[settingKey], 0, 9, settingKey);
                            moduloCalculationMode = currentValue;
                        }
                        // POW_PRECISION setting.
                        if (Object.prototype.hasOwnProperty.call(settingsObject, settingKey = "POW_PRECISION")) {
                            validateNumericArgument(currentValue = settingsObject[settingKey], 0, maxAllowedPrecision, settingKey);
                            powerOperationPrecision = currentValue;
                        }
                        // FORMAT setting.
                        if (Object.prototype.hasOwnProperty.call(settingsObject, settingKey = "FORMAT")) {
                            if (typeof (currentValue = settingsObject[settingKey]) !== 'object') {
                                throw Error(errorPrefixString + settingKey + " not an object: " + currentValue);
                            }
                            Object.assign(formattingSettings, currentValue); // Merge properties.
                        }
                        // ALPHABET setting.
                        if (Object.prototype.hasOwnProperty.call(settingsObject, settingKey = "ALPHABET")) {
                            if (typeof (currentValue = settingsObject[settingKey]) !== 'string' || /^.$|[+-.\s]|(.).*\1/.test(currentValue)) {
                                throw Error(errorPrefixString + settingKey + " invalid: " + currentValue);
                            }
                            alphabetCharacters = currentValue;
                        }
                    }
                    // Return the current configuration.
                    return {
                        DECIMAL_PLACES: decimalPlacesConfig, ROUNDING_MODE: roundingModeConfig, EXPONENTIAL_AT: [exponentialLowerBound, exponentialUpperBound],
                        RANGE: [rangeMinExponent, rangeMaxExponent], CRYPTO: useCryptoRandom, MODULO_MODE: moduloCalculationMode,
                        POW_PRECISION: powerOperationPrecision, FORMAT: formattingSettings, ALPHABET: alphabetCharacters
                    };
                };

                /**
                 * Checks if a given value is an instance of BigNumberClass.
                 * @param {*} value - The value to check.
                 * @returns {boolean} True if it's a BigNumber instance, false otherwise.
                 */
                BigNumberClass.isBigNumber = function (value) {
                    if (!value || value._isBigNumber !== true) return false;
                    // In debug mode, perform more rigorous internal validation.
                    if (!BigNumberClass.DEBUG) return true;

                    const coeffs = value.c;
                    const exp = value.e;
                    const sgn = value.s;

                    if (Object.prototype.toString.call(coeffs) === '[object Array]') {
                        if ((sgn === 1 || sgn === -1) && exp >= -maxAllowedPrecision && exp <= maxAllowedPrecision && exp === mathFlooring(exp)) {
                            if (coeffs[0] === 0) {
                                return exp === 0 && coeffs.length === 1;
                            }
                            let expectedFirstCoeffLen = (exp + 1) % internalBaseDigits;
                            if (expectedFirstCoeffLen < 1) expectedFirstCoeffLen += internalBaseDigits;

                            if (String(coeffs[0]).length === expectedFirstCoeffLen) {
                                for (let i = 0; i < coeffs.length; i++) {
                                    const coeff = coeffs[i];
                                    if (coeff < 0 || coeff >= internalBaseMagnitude || coeff !== mathFlooring(coeff)) {
                                        break; // Invalid coefficient found.
                                    }
                                }
                                return true; // All coefficients are valid.
                            }
                        }
                    } else if (coeffs === null && exp === null && (sgn === null || sgn === 1 || sgn === -1)) {
                        return true; // NaN or Infinity.
                    }
                    throw Error(errorPrefixString + "Invalid BigNumber: " + value); // Debug mode throws on invalid structure.
                };

                // Static methods for finding maximum and minimum from a list of BigNumbers.
                BigNumberClass.maximum = BigNumberClass.max = function () { return findExtremumBigNumber(arguments, BigNumberPrototype.lt); };
                BigNumberClass.minimum = BigNumberClass.min = function () { return findExtremumBigNumber(arguments, BigNumberPrototype.gt); };

                // Random number generation source, preferring crypto if available.
                const getRandomSource = (function () {
                    let fallbackRandomFunction = (9007199254740992 * Math.random() & 2097151) ?
                        function () { return mathFlooring(9007199254740992 * Math.random()); } :
                        function () { return 8388608 * (1073741824 * Math.random() | 0) + (8388608 * Math.random() | 0); };
                    return fallbackRandomFunction;
                })();

                /**
                 * Generates a random BigNumber between 0 (inclusive) and 1 (exclusive).
                 * @param {number} [dp] - The number of decimal places for the random number.
                 * @returns {BigNumberInstance} A random BigNumber.
                 */
                BigNumberClass.random = function (dp) {
                    let randomValue, currentLoopIndex, segmentValue, numSegmentsNeeded, cryptoUint32Array, cryptoBytesArray;
                    let segmentCount = 0;
                    const coefficientsList = [];
                    const resultBigNumber = new BigNumberClass(BIG_NUMBER_ONE);

                    if (dp == null) dp = decimalPlacesConfig;
                    else validateNumericArgument(dp, 0, maxAllowedPrecision);

                    numSegmentsNeeded = mathCeiling(dp / internalBaseDigits);

                    if (useCryptoRandom) {
                        if (crypto.getRandomValues) {
                            numSegmentsNeeded *= 2; // Need two 32-bit values for 1e14 range.
                            cryptoUint32Array = crypto.getRandomValues(new Uint32Array(numSegmentsNeeded));
                            for (; segmentCount < numSegmentsNeeded;) {
                                segmentValue = 131072 * cryptoUint32Array[segmentCount] + (cryptoUint32Array[segmentCount + 1] >>> 11);
                                if (segmentValue >= 9e15) { // If value is too large for 1e14, regenerate.
                                    cryptoUint32Array = crypto.getRandomValues(new Uint32Array(2));
                                    cryptoUint32Array[segmentCount] = cryptoUint32Array[0];
                                    cryptoUint32Array[segmentCount + 1] = cryptoUint32Array[1];
                                } else {
                                    coefficientsList.push(segmentValue % internalBaseMagnitude);
                                    segmentCount += 2;
                                }
                            }
                            segmentCount = numSegmentsNeeded / 2;
                        } else if (crypto.randomBytes) {
                            numSegmentsNeeded *= 7; // Need 7 bytes for 1e14 range.
                            cryptoBytesArray = crypto.randomBytes(numSegmentsNeeded);
                            for (; segmentCount < numSegmentsNeeded;) {
                                segmentValue = 281474976710656 * (31 & cryptoBytesArray[segmentCount]) +
                                    1099511627776 * cryptoBytesArray[segmentCount + 1] +
                                    4294967296 * cryptoBytesArray[segmentCount + 2] +
                                    16777216 * cryptoBytesArray[segmentCount + 3] +
                                    (cryptoBytesArray[segmentCount + 4] << 16) +
                                    (cryptoBytesArray[segmentCount + 5] << 8) +
                                    cryptoBytesArray[segmentCount + 6];
                                if (segmentValue >= 9e15) {
                                    crypto.randomBytes(7).copy(cryptoBytesArray, segmentCount); // Regenerate.
                                } else {
                                    coefficientsList.push(segmentValue % internalBaseMagnitude);
                                    segmentCount += 7;
                                }
                            }
                            segmentCount = numSegmentsNeeded / 7;
                        } else {
                            // If crypto is enabled but no methods found, disable and throw.
                            useCryptoRandom = false;
                            throw Error(errorPrefixString + "crypto unavailable");
                        }
                    }

                    // Fallback to Math.random if crypto is not enabled or failed.
                    if (!useCryptoRandom) {
                        for (; segmentCount < numSegmentsNeeded;) {
                            randomValue = getRandomSource();
                            if (randomValue < 9e15) { // Ensure value fits roughly within 1e14.
                                coefficientsList[segmentCount++] = randomValue % internalBaseMagnitude;
                            }
                        }
                    }

                    // Adjust the last segment based on the desired decimal places.
                    currentLoopIndex = coefficientsList.length - 1;
                    randomValue = coefficientsList[currentLoopIndex];
                    dp %= internalBaseDigits; // Remaining digits for the last segment.
                    if (randomValue && dp) {
                        segmentValue = powersOfTenArray[internalBaseDigits - dp];
                        coefficientsList[currentLoopIndex] = mathFlooring(randomValue / segmentValue) * segmentValue;
                    }

                    // Remove trailing zero coefficients.
                    while (coefficientsList[currentLoopIndex] === 0) {
                        coefficientsList.pop();
                        currentLoopIndex--;
                    }

                    if (currentLoopIndex < 0) {
                        coefficientsList[0] = randomValue = 0; // If all zeros.
                    } else {
                        // Calculate exponent.
                        randomValue = -1;
                        while (coefficientsList[0] === 0) { // Remove leading zeros and adjust exponent.
                            coefficientsList.splice(0, 1);
                            randomValue -= internalBaseDigits;
                        }
                        for (currentLoopIndex = 1, segmentValue = coefficientsList[0]; segmentValue >= 10; segmentValue /= 10, currentLoopIndex++);
                        if (currentLoopIndex < internalBaseDigits) randomValue -= (internalBaseDigits - currentLoopIndex);
                    }
                    resultBigNumber.e = randomValue;
                    resultBigNumber.c = coefficientsList;
                    return resultBigNumber;
                };

                /**
                 * Calculates the sum of all provided BigNumber arguments.
                 * @returns {BigNumberInstance} The sum.
                 */
                BigNumberClass.sum = function () {
                    let argIndex = 1;
                    const args = arguments;
                    let totalSum = new BigNumberClass(args[0]);
                    while (argIndex < args.length) {
                        totalSum = totalSum.plus(args[argIndex++]);
                    }
                    return totalSum;
                };

                // Internal utility for base conversion (e.g., hex to decimal).
                const convertBase = (function () {
                    /**
                     * Converts a number string from a source base to a target base using segmented arithmetic.
                     * @param {string} numStr - The number string to convert.
                     * @param {number} fromBase - The source base.
                     * @param {number} toBase - The target base.
                     * @param {boolean} isSigned - Indicates if the number has a sign.
                     * @returns {number[]} An array of coefficients in the target base (reversed order).
                     */
                    function performSegmentedBaseConversion(numStr, fromBase, toBase, isSigned) {
                        let innerLoopIndex, outerLoopIndex, segmentCoeffs = [0];
                        let stringCharIndex = 0;
                        const stringLength = numStr.length;

                        while (stringCharIndex < stringLength) {
                            // Multiply current segment by fromBase.
                            for (outerLoopIndex = segmentCoeffs.length; outerLoopIndex--; segmentCoeffs[outerLoopIndex] *= fromBase);
                            // Add the value of the current digit from the input string.
                            segmentCoeffs[0] += isSigned ? alphabetCharacters.indexOf(numStr.charAt(stringCharIndex++)) : "0123456789".indexOf(numStr.charAt(stringCharIndex++));

                            // Handle carries across segments.
                            for (innerLoopIndex = 0; innerLoopIndex < segmentCoeffs.length; innerLoopIndex++) {
                                if (segmentCoeffs[innerLoopIndex] > toBase - 1) {
                                    if (segmentCoeffs[innerLoopIndex + 1] == null) {
                                        segmentCoeffs[innerLoopIndex + 1] = 0;
                                    }
                                    segmentCoeffs[innerLoopIndex + 1] += mathFlooring(segmentCoeffs[innerLoopIndex] / toBase);
                                    segmentCoeffs[innerLoopIndex] %= toBase;
                                }
                            }
                        }
                        return segmentCoeffs.reverse(); // Return coefficients in standard order.
                    }

                    return function (inputString, sourceBase, targetBase, signOfValue, useCustomAlphabet) {
                        let decimalPointIndex, tempPowPrecision,
                            decimalPartBN, remainderBN, finalCoefficients,
                            integerPartBN, finalResultString;

                        decimalPointIndex = inputString.indexOf(".");

                        if (decimalPointIndex >= 0) {
                            tempPowPrecision = powerOperationPrecision;
                            powerOperationPrecision = 0; // Temporarily disable precision for intermediate conversion.
                            inputString = inputString.replace(".", "");
                            // Calculate the power of the base for the decimal part.
                            decimalPartBN = (integerPartBN = new BigNumberClass(sourceBase)).pow(inputString.length - decimalPointIndex);
                            powerOperationPrecision = tempPowPrecision; // Restore precision.
                            decimalPartBN.c = performSegmentedBaseConversion(toFixedPointString(formatCoefficientsToString(decimalPartBN.c), decimalPartBN.e, "0"), 10, targetBase, "0123456789");
                            decimalPartBN.e = decimalPartBN.c.length;
                        }

                        // Convert the integer part (or whole number if no decimal).
                        finalCoefficients = performSegmentedBaseConversion(inputString, sourceBase, targetBase, useCustomAlphabet ? (finalResultString = alphabetCharacters, "0123456789") : (finalResultString = "0123456789", alphabetCharacters));
                        integerPartBN = finalCoefficients.length;

                        // Remove trailing zeros from coefficients.
                        for (; finalCoefficients[--integerPartBN] === 0; finalCoefficients.pop());

                        if (!finalCoefficients[0]) return finalResultString.charAt(0); // Result is zero.

                        if (decimalPointIndex < 0) {
                            integerPartBN--; // Adjust exponent for integer part.
                        } else {
                            // If there was a decimal, perform division for the fractional part.
                            integerPartBN = new BigNumberClass(signOfValue);
                            integerPartBN.c = finalCoefficients;
                            integerPartBN.e = integerPartBN;
                            finalCoefficients = (integerPartBN = performDivision(integerPartBN, decimalPartBN, decimalPlacesConfig, roundingModeConfig, targetBase)).c;
                            remainderBN = integerPartBN.r;
                            integerPartBN = integerPartBN.e;
                        }

                        // Check for rounding condition.
                        let roundingDigit = finalCoefficients[decimalPointIndex = integerPartBN + decimalPlacesConfig + 1];
                        let halfTargetBase = targetBase / 2;
                        remainderBN = remainderBN || decimalPointIndex < 0 || finalCoefficients[decimalPointIndex + 1] != null;

                        remainderBN = roundingModeConfig < 4 ?
                            (roundingDigit || remainderBN) && (roundingModeConfig === 0 || roundingModeConfig === (integerPartBN.s < 0 ? 3 : 2)) :
                            roundingDigit > halfTargetBase || (roundingDigit === halfTargetBase && (roundingModeConfig === 4 || remainderBN || (roundingModeConfig === 6 && (1 & finalCoefficients[decimalPointIndex - 1])) || roundingModeConfig === (integerPartBN.s < 0 ? 8 : 7)));

                        if (decimalPointIndex < 1 || !finalCoefficients[0]) {
                            finalResultString = remainderBN ?
                                toFixedPointString(finalResultString.charAt(1), -decimalPlacesConfig, finalResultString.charAt(0)) :
                                finalResultString.charAt(0);
                        } else {
                            if (finalCoefficients.length = decimalPointIndex, remainderBN) {
                                for (--targetBase; ++finalCoefficients[--decimalPointIndex] > targetBase;) {
                                    finalCoefficients[decimalPointIndex] = 0;
                                    if (!decimalPointIndex) {
                                        ++integerPartBN;
                                        finalCoefficients = [1].concat(finalCoefficients);
                                    }
                                }
                            }
                            for (halfTargetBase = finalCoefficients.length; !finalCoefficients[--halfTargetBase];);
                            for (decimalPointIndex = 0, finalResultString = ""; decimalPointIndex <= halfTargetBase; finalResultString += alphabetCharacters.charAt(finalCoefficients[decimalPointIndex++]));
                            finalResultString = toFixedPointString(finalResultString, integerPartBN, alphabetCharacters.charAt(0));
                        }
                        return finalResultString;
                    };
                })();

                // Internal utility for BigNumber division.
                const performDivision = (function () {
                    /**
                     * Multiplies a coefficient array by a scalar and handles carries.
                     * @param {number[]} coeffs - The coefficient array.
                     * @param {number} scalar - The scalar multiplier.
                     * @param {number} base - The base (internalBaseMagnitude).
                     * @returns {number[]} The resulting coefficient array with any carry prepended.
                     */
                    function multiplyCoefficientsByScalar(coeffs, scalar, base) {
                        let productHighPart, productLowPart, carry = 0;
                        const scalarLowDigits = scalar % halfInternalBaseMagnitude;
                        const scalarHighDigits = mathFlooring(scalar / halfInternalBaseMagnitude);

                        for (let i = coeffs.length; i--;) {
                            productLowPart = scalarLowDigits * (productHighPart = coeffs[i] % halfInternalBaseMagnitude) +
                                (productHighPart = mathFlooring(coeffs[i] / halfInternalBaseMagnitude) * scalarLowDigits) * halfInternalBaseMagnitude +
                                carry;
                            productHighPart = scalarHighDigits * productHighPart + mathFlooring(productLowPart / base);
                            coeffs[i] = productLowPart % base;
                            carry = productHighPart;
                        }
                        return carry ? [carry].concat(coeffs) : coeffs;
                    }

                    /**
                     * Compares two coefficient arrays.
                     * @param {number[]} arr1 - First array.
                     * @param {number[]} arr2 - Second array.
                     * @param {number} len1 - Length of first array.
                     * @param {number} len2 - Length of second array.
                     * @returns {number} 0 if equal, 1 if arr1 > arr2, -1 if arr1 < arr2.
                     */
                    function compareCoefficientArrays(arr1, arr2, len1, len2) {
                        let i, comparisonResult;
                        if (len1 !== len2) {
                            comparisonResult = len1 > len2 ? 1 : -1;
                        } else {
                            comparisonResult = 0;
                            for (i = 0; i < len1; i++) {
                                if (arr1[i] !== arr2[i]) {
                                    comparisonResult = arr1[i] > arr2[i] ? 1 : -1;
                                    break;
                                }
                            }
                        }
                        return comparisonResult;
                    }

                    /**
                     * Subtracts one coefficient array from another in place.
                     * @param {number[]} minuendArr - The array to subtract from.
                     * @param {number[]} subtrahendArr - The array to subtract.
                     * @param {number} length - Number of elements to process.
                     * @param {number} base - The base (internalBaseMagnitude).
                     */
                    function subtractCoefficientArrays(minuendArr, subtrahendArr, length, base) {
                        let borrow = 0;
                        for (; length--;) {
                            minuendArr[length] -= borrow;
                            borrow = minuendArr[length] < subtrahendArr[length] ? 1 : 0;
                            minuendArr[length] = borrow * base + minuendArr[length] - subtrahendArr[length];
                        }
                        // Remove leading zeros.
                        while (minuendArr[0] === 0 && minuendArr.length > 1) {
                            minuendArr.splice(0, 1);
                        }
                    }

                    return function (dividendBN, divisorBN, decimalPlaces, roundingMode, customBase) {
                        let estimatedQuotientDigit, quotientCoeffs, dividendExponentDifference,
                            divisorCoeffs, dividendCoeffs,
                            dividendLength, divisorLength, currentDividendIndex,
                            currentDividendSegment, paddedDivisor, divisorFirstCoeff,
                            comparisonResult, tempDividendSegment, tempResult,
                            tempDivisorProduct, tempDividendSegmentLength;

                        // Determine the sign of the division result.
                        const resultSign = dividendBN.s === divisorBN.s ? 1 : -1;

                        const originalDividendCoeffs = dividendBN.c;
                        const originalDivisorCoeffs = divisorBN.c;

                        // Handle edge cases: NaN, Infinity, or division by zero.
                        if (!(originalDividendCoeffs && originalDividendCoeffs[0] && originalDivisorCoeffs && originalDivisorCoeffs[0])) {
                            return new BigNumberClass(
                                dividendBN.s && divisorBN.s &&
                                (originalDividendCoeffs ?
                                    (!originalDivisorCoeffs || originalDividendCoeffs[0] !== originalDivisorCoeffs[0]) :
                                    originalDivisorCoeffs) ?
                                    (originalDividendCoeffs && originalDividendCoeffs[0] === 0 || !originalDivisorCoeffs ? 0 * resultSign : resultSign / 0) :
                                    NaN
                            );
                        }

                        const quotientBigNumber = new BigNumberClass(resultSign);
                        quotientCoeffs = quotientBigNumber.c = []; // Initialize quotient coefficients.

                        dividendExponentDifference = dividendBN.e - divisorBN.e;
                        if (!customBase) {
                            customBase = internalBaseMagnitude;
                            dividendExponentDifference = truncateValue(dividendBN.e / internalBaseDigits) - truncateValue(divisorBN.e / internalBaseDigits);
                            dividendExponentDifference = mathFlooring(dividendExponentDifference / internalBaseDigits);
                        }

                        // Adjust exponent difference based on leading coefficients.
                        currentDividendIndex = 0;
                        while (originalDivisorCoeffs[currentDividendIndex] === (originalDividendCoeffs[currentDividendIndex] || 0)) {
                            currentDividendIndex++;
                        }
                        if (originalDivisorCoeffs[currentDividendIndex] > (originalDividendCoeffs[currentDividendIndex] || 0)) {
                            dividendExponentDifference--;
                        }

                        // If dividend is smaller than divisor, result is less than 1.
                        if (dividendExponentDifference < 0) {
                            quotientCoeffs.push(1);
                            estimatedQuotientDigit = true; // Flag for remainder.
                        } else {
                            dividendLength = originalDividendCoeffs.length;
                            divisorLength = originalDivisorCoeffs.length;

                            // Scale divisor and dividend for better precision in division (optional).
                            if ((estimatedQuotientDigit = mathFlooring(customBase / (originalDivisorCoeffs[0] + 1))) > 1) {
                                divisorCoeffs = multiplyCoefficientsByScalar(originalDivisorCoeffs, estimatedQuotientDigit, customBase);
                                dividendCoeffs = multiplyCoefficientsByScalar(originalDividendCoeffs, estimatedQuotientDigit, customBase);
                                divisorLength = divisorCoeffs.length;
                                dividendLength = dividendCoeffs.length;
                            } else {
                                divisorCoeffs = originalDivisorCoeffs.slice();
                                dividendCoeffs = originalDividendCoeffs.slice();
                            }

                            currentDividendIndex = divisorLength; // Start processing dividend from this index.
                            currentDividendSegment = dividendCoeffs.slice(0, divisorLength); // First segment of dividend.
                            tempDividendSegmentLength = currentDividendSegment.length;

                            // Pad `currentDividendSegment` with zeros if it's shorter than `divisorCoeffs`.
                            while (tempDividendSegmentLength < divisorLength) {
                                currentDividendSegment[tempDividendSegmentLength++] = 0;
                            }

                            paddedDivisor = divisorCoeffs.slice();
                            paddedDivisor = [0].concat(paddedDivisor); // Pad divisor with zero for comparison.

                            divisorFirstCoeff = divisorCoeffs[0];
                            if (divisorCoeffs[1] >= customBase / 2) divisorFirstCoeff++; // Adjust for rounding.

                            // Main long division loop.
                            do {
                                estimatedQuotientDigit = 0;
                                comparisonResult = compareCoefficientArrays(divisorCoeffs, currentDividendSegment, divisorLength, tempDividendSegmentLength);

                                if (comparisonResult < 0) {
                                    // If divisor is smaller, estimate quotient digit.
                                    tempResult = currentDividendSegment[0];
                                    if (divisorLength !== tempDividendSegmentLength) {
                                        tempResult = tempResult * customBase + (currentDividendSegment[1] || 0);
                                    }
                                    estimatedQuotientDigit = mathFlooring(tempResult / divisorFirstCoeff);

                                    // Adjust quotient digit if initial estimate is too high.
                                    if (estimatedQuotientDigit > 1) {
                                        if (estimatedQuotientDigit >= customBase) estimatedQuotientDigit = customBase - 1;
                                        tempDivisorProduct = multiplyCoefficientsByScalar(divisorCoeffs, estimatedQuotientDigit, customBase);
                                        tempDividendSegmentLength = tempDivisorProduct.length;

                                        while (compareCoefficientArrays(tempDivisorProduct, currentDividendSegment, tempDividendSegmentLength, tempDividendSegmentLength) === 1) {
                                            estimatedQuotientDigit--;
                                            subtractCoefficientArrays(tempDivisorProduct, divisorLength < tempDividendSegmentLength ? paddedDivisor : divisorCoeffs, tempDividendSegmentLength, customBase);
                                            tempDividendSegmentLength = tempDivisorProduct.length;
                                            comparisonResult = 1;
                                        }
                                    } else {
                                        // If quotient is 0 or 1, use divisor itself.
                                        if (estimatedQuotientDigit === 0) comparisonResult = estimatedQuotientDigit = 1;
                                        tempDivisorProduct = divisorCoeffs.slice();
                                        tempDividendSegmentLength = tempDivisorProduct.length;
                                    }

                                    // If product is shorter, pad with zero.
                                    if (tempDivisorProduct.length < tempDividendSegmentLength) {
                                        tempDivisorProduct = [0].concat(tempDivisorProduct);
                                    }

                                    // Subtract product from dividend segment.
                                    subtractCoefficientArrays(currentDividendSegment, tempDivisorProduct, tempDividendSegmentLength, customBase);
                                    tempDividendSegmentLength = currentDividendSegment.length;

                                    if (comparisonResult === -1) {
                                        while (compareCoefficientArrays(divisorCoeffs, currentDividendSegment, divisorLength, tempDividendSegmentLength) < 1) {
                                            estimatedQuotientDigit++;
                                            subtractCoefficientArrays(currentDividendSegment, divisorLength < tempDividendSegmentLength ? paddedDivisor : divisorCoeffs, tempDividendSegmentLength, customBase);
                                            tempDividendSegmentLength = currentDividendSegment.length;
                                        }
                                    }
                                } else if (comparisonResult === 0) {
                                    // Divisor equals dividend segment.
                                    estimatedQuotientDigit++;
                                    currentDividendSegment = [0]; // Remainder is zero.
                                    tempDividendSegmentLength = 1;
                                }

                                quotientCoeffs[quotientCoeffs.length] = estimatedQuotientDigit; // Add quotient digit.
                                // Bring down the next digit of the dividend.
                                currentDividendSegment[0] ?
                                    currentDividendSegment[tempDividendSegmentLength++] = dividendCoeffs[currentDividendIndex] || 0 :
                                    currentDividendSegment = [dividendCoeffs[currentDividendIndex]];
                            } while ((currentDividendIndex++ < dividendLength || currentDividendSegment[0] != null) && decimalPlaces-- >= 0);

                            estimatedQuotientDigit = currentDividendSegment[0] != null; // Flag if there's a final remainder.
                            // Remove leading zeros from the quotient.
                            quotientCoeffs[0] || quotientCoeffs.splice(0, 1);
                        }

                        // Finalize the BigNumber after division.
                        if (customBase === internalBaseMagnitude) {
                            let p = 1;
                            let R = quotientCoeffs[0];
                            for (; R >= 10; R /= 10, p++);
                            roundBigNumber(quotientBigNumber, decimalPlaces + (quotientBigNumber.e = p + dividendExponentDifference * internalBaseDigits - 1) + 1, roundingMode, estimatedQuotientDigit);
                        } else {
                            quotientBigNumber.e = dividendExponentDifference;
                            quotientBigNumber.r = +estimatedQuotientDigit; // Store remainder flag.
                        }
                        return quotientBigNumber;
                    };
                })();

                // Regular expressions for various input parsing and formatting tasks.
                const hexOctBinPrefixRegex = /^(-?)0([xbo])(?=\w[\w.]*$)/i; // Detects '0x', '0b', '0o' prefixes.
                const trailingDecimalPointRegex = /^([^.]+)\.$/; // Matches strings like "123."
                const leadingDecimalPointRegex = /^\.([^.]+)$/; // Matches strings like ".123"
                const infinityNaNDetectorRegex = /^-?(Infinity|NaN)$/; // Detects "Infinity" or "NaN".
                const whitespacePlusStripRegex = /^\s*\+(?=[\w.])|^\s+|\s+$/g; // Strips whitespace and leading plus signs.

                /**
                 * Internal function to handle invalid numeric input strings.
                 * Attempts to parse special cases (Infinity, NaN, hex/octal/binary prefixes)
                 * or sets the BigNumber to NaN.
                 * @param {BigNumberInstance} bnInstance - The BigNumber instance to modify.
                 * @param {string} inputValueString - The raw input string.
                 * @param {boolean} wasInputNumericPrimitive - True if the original input was a number primitive.
                 * @param {number} [inputBase] - The base if specified for the input.
                 */
                function handleInvalidInput(bnInstance, inputValueString, wasInputNumericPrimitive, inputBase) {
                    let determinedBase;
                    let processedString = wasInputNumericPrimitive ? inputValueString : inputValueString.replace(whitespacePlusStripRegex, "");

                    if (infinityNaNDetectorRegex.test(processedString)) {
                        bnInstance.s = isNaN(processedString) ? null : (processedString.charAt(0) === '-' ? -1 : 1);
                    } else {
                        if (!wasInputNumericPrimitive) {
                            // Replace hex/octal/binary prefixes, also determining the base.
                            processedString = processedString.replace(hexOctBinPrefixRegex, function (match, sign, prefixChar) {
                                determinedBase = (prefixChar.toLowerCase() === 'x') ? 16 : (prefixChar.toLowerCase() === 'b' ? 2 : 8);
                                // If base was explicitly specified and doesn't match prefix, keep original string.
                                return (inputBase && inputBase !== determinedBase) ? match : sign;
                            });
                            if (inputBase) {
                                determinedBase = inputBase;
                                // Clean up trailing/leading dots for base conversions.
                                processedString = processedString.replace(trailingDecimalPointRegex, "$1").replace(leadingDecimalPointRegex, "0.$1");
                            }
                        }

                        // If the string was modified, try to parse it again with the determined base.
                        if (inputValueString !== processedString) {
                            return new BigNumberClass(processedString, determinedBase);
                        }

                        // If still invalid, and in debug mode, throw an error.
                        if (BigNumberClass.DEBUG) {
                            throw Error(errorPrefixString + "Not a" + (inputBase ? " base " + inputBase : "") + " number: " + inputValueString);
                        }
                        bnInstance.s = null; // Set to NaN.
                    }
                    bnInstance.c = bnInstance.e = null; // Clear coefficients and exponent for NaN/Infinity.
                }

                // --- BigNumber Prototype Methods ---

                BigNumberPrototype.absoluteValue = BigNumberPrototype.abs = function () {
                    const absoluteBN = new BigNumberClass(this);
                    if (absoluteBN.s < 0) {
                        absoluteBN.s = 1; // Make sign positive.
                    }
                    return absoluteBN;
                };

                BigNumberPrototype.comparedTo = function (otherValue, base) {
                    return compareTwoBigNumbers(this, new BigNumberClass(otherValue, base));
                };

                BigNumberPrototype.decimalPlaces = BigNumberPrototype.dp = function (decimalCount, roundingMode) {
                    let coefficients, precisionDigitsCount, lastCoefficient, i;
                    const instance = this;

                    if (decimalCount != null) {
                        validateNumericArgument(decimalCount, 0, maxAllowedPrecision);
                        if (roundingMode == null) roundingMode = roundingModeConfig;
                        else validateNumericArgument(roundingMode, 0, 8);
                        return roundBigNumber(new BigNumberClass(instance), decimalCount + instance.e + 1, roundingMode);
                    }
                    if (!(coefficients = instance.c)) return null; // NaN or Infinity.

                    precisionDigitsCount = ((i = coefficients.length - 1) - truncateValue(instance.e / internalBaseDigits)) * internalBaseDigits;
                    lastCoefficient = coefficients[i];
                    for (; lastCoefficient % 10 === 0; lastCoefficient /= 10, precisionDigitsCount--); // Count actual decimal digits.
                    return precisionDigitsCount < 0 ? 0 : precisionDigitsCount;
                };

                BigNumberPrototype.dividedBy = BigNumberPrototype.div = function (divisorValue, base) {
                    return performDivision(this, new BigNumberClass(divisorValue, base), decimalPlacesConfig, roundingModeConfig);
                };

                BigNumberPrototype.dividedToIntegerBy = BigNumberPrototype.idiv = function (divisorValue, base) {
                    return performDivision(this, new BigNumberClass(divisorValue, base), 0, 1); // Integer division rounds down (trunc).
                };

                BigNumberPrototype.exponentiatedBy = BigNumberPrototype.pow = function (exponentValue, modulusValue) {
                    let tempBaseBN, absoluteExponentBN, isBaseExponentOdd,
                        currentExponentIteration, currentPowerFactor, resultBN,
                        isNegativeExponent, isModulusProvided,
                        isBaseAndModulusInteger, tempPowPrecision;

                    exponentValue = new BigNumberClass(exponentValue);
                    // Exponent must be an integer.
                    if (exponentValue.c && !exponentValue.isInteger()) {
                        throw Error(errorPrefixString + "Exponent not an integer: " + toRawBigNumberString(exponentValue));
                    }
                    if (modulusValue != null) {
                        modulusValue = new BigNumberClass(modulusValue);
                    }

                    const baseBigNumber = this;

                    // Handle edge cases: base is 0, 1, or exponent is 0.
                    if (!baseBigNumber.c || !baseBigNumber.c[0] || (baseBigNumber.c[0] === 1 && !baseBigNumber.e && baseBigNumber.c.length === 1) || !exponentValue.c || !exponentValue.c[0]) {
                        resultBN = new BigNumberClass(Math.pow(+toRawBigNumberString(baseBigNumber),
                            (exponentValue.e > 14) ? (2 - isBigNumberOdd(exponentValue)) : (+toRawBigNumberString(exponentValue))
                        ));
                        return modulusValue ? resultBN.mod(modulusValue) : resultBN;
                    }

                    isNegativeExponent = exponentValue.s < 0;
                    isModulusProvided = modulusValue != null;

                    if (isModulusProvided) {
                        // Modulus must be a valid non-zero BigNumber.
                        if (!modulusValue.c || !modulusValue.c[0] || !modulusValue.s) return new BigNumberClass(NaN);
                        // If base and modulus are integers and exponent is non-negative, perform modular exponentiation.
                        isBaseAndModulusInteger = !isNegativeExponent && baseBigNumber.isInteger() && modulusValue.isInteger();
                        if (isBaseAndModulusInteger) {
                            baseBigNumber = baseBigNumber.mod(modulusValue);
                        }
                    } else {
                        // Check for overflow/underflow for large exponents without modulus.
                        if (exponentValue.e > 9 && (baseBigNumber.e > 0 || baseBigNumber.e < -1 || (baseBigNumber.e === 0 ? baseBigNumber.c[0] > 1 || (exponentValue.e > 14 && baseBigNumber.c[1] >= 24e7) : baseBigNumber.c[0] < 8e13 || (exponentValue.e > 14 && baseBigNumber.c[0] <= 9999975e7)))) {
                            currentPowerFactor = baseBigNumber.s < 0 && isBigNumberOdd(exponentValue) ? -0 : 0;
                            if (baseBigNumber.e > -1) currentPowerFactor = 1 / currentPowerFactor; // Handle 1/0.
                            return new BigNumberClass(isNegativeExponent ? 1 / currentPowerFactor : currentPowerFactor);
                        }
                        if (powerOperationPrecision) currentPowerFactor = mathCeiling(powerOperationPrecision / internalBaseDigits + 2); // Adjust precision for power.
                    }

                    resultBN = new BigNumberClass(BIG_NUMBER_ONE); // Initialize result to 1.

                    // Binary exponentiation (exponentiation by squaring).
                    if (exponentValue.e > 14) { // Very large exponent.
                        tempBaseBN = new BigNumberClass(0.5);
                        if (isNegativeExponent) exponentValue.s = 1; // Treat as positive for internal logic.
                        isBaseExponentOdd = isBigNumberOdd(exponentValue);
                    } else {
                        isBaseExponentOdd = (currentExponentIteration = Math.abs(+toRawBigNumberString(exponentValue))) % 2;
                    }

                    for (;;) {
                        if (isBaseExponentOdd) {
                            if (!(resultBN = resultBN.times(baseBigNumber)).c) break; // If result becomes NaN/Infinity.
                            if (currentPowerFactor) {
                                if (resultBN.c.length > currentPowerFactor) resultBN.c.length = currentPowerFactor;
                            } else if (isBaseAndModulusInteger) {
                                resultBN = resultBN.mod(modulusValue);
                            }
                        }

                        if (currentExponentIteration) {
                            if ((currentExponentIteration = mathFlooring(currentExponentIteration / 2)) === 0) break;
                            isBaseExponentOdd = currentExponentIteration % 2;
                        } else if (roundBigNumber(exponentValue = exponentValue.times(tempBaseBN), exponentValue.e + 1, 1), exponentValue.e > 14) {
                            isBaseExponentOdd = isBigNumberOdd(exponentValue);
                        } else {
                            if ((currentExponentIteration = +toRawBigNumberString(exponentValue)) === 0) break;
                            isBaseExponentOdd = currentExponentIteration % 2;
                        }

                        baseBigNumber = baseBigNumber.times(baseBigNumber);
                        if (currentPowerFactor) {
                            if (baseBigNumber.c && baseBigNumber.c.length > currentPowerFactor) baseBigNumber.c.length = currentPowerFactor;
                        } else if (isBaseAndModulusInteger) {
                            baseBigNumber = baseBigNumber.mod(modulusValue);
                        }
                    }

                    return isBaseAndModulusInteger ? resultBN : (isNegativeExponent ? BIG_NUMBER_ONE.div(resultBN) : (modulusValue ? resultBN.mod(modulusValue) : (currentPowerFactor ? roundBigNumber(resultBN, powerOperationPrecision, roundingModeConfig) : resultBN)));
                };

                BigNumberPrototype.integerValue = function (roundingMode) {
                    const integerBigNumber = new BigNumberClass(this);
                    if (roundingMode == null) roundingMode = roundingModeConfig;
                    else validateNumericArgument(roundingMode, 0, 8);
                    return roundBigNumber(integerBigNumber, integerBigNumber.e + 1, roundingMode);
                };

                BigNumberPrototype.isEqualTo = BigNumberPrototype.eq = function (otherValue, base) {
                    return compareTwoBigNumbers(this, new BigNumberClass(otherValue, base)) === 0;
                };

                BigNumberPrototype.isFinite = function () {
                    return !!this.c; // Coefficients array exists if finite.
                };

                BigNumberPrototype.isGreaterThan = BigNumberPrototype.gt = function (otherValue, base) {
                    return compareTwoBigNumbers(this, new BigNumberClass(otherValue, base)) > 0;
                };

                BigNumberPrototype.isGreaterThanOrEqualTo = BigNumberPrototype.gte = function (otherValue, base) {
                    const comparisonResult = compareTwoBigNumbers(this, new BigNumberClass(otherValue, base));
                    return comparisonResult === 1 || comparisonResult === 0;
                };

                BigNumberPrototype.isInteger = function () {
                    return !!this.c && truncateValue(this.e / internalBaseDigits) > this.c.length - 2;
                };

                BigNumberPrototype.isLessThan = BigNumberPrototype.lt = function (otherValue, base) {
                    return compareTwoBigNumbers(this, new BigNumberClass(otherValue, base)) < 0;
                };

                BigNumberPrototype.isLessThanOrEqualTo = BigNumberPrototype.lte = function (otherValue, base) {
                    const comparisonResult = compareTwoBigNumbers(this, new BigNumberClass(otherValue, base));
                    return comparisonResult === -1 || comparisonResult === 0;
                };

                BigNumberPrototype.isNaN = function () {
                    return !this.s; // Sign is null for NaN.
                };

                BigNumberPrototype.isNegative = function () {
                    return this.s < 0;
                };

                BigNumberPrototype.isPositive = function () {
                    return this.s > 0;
                };

                BigNumberPrototype.isZero = function () {
                    return !!this.c && this.c[0] === 0;
                };

                BigNumberPrototype.minus = function (subtrahendValue, base) {
                    let i, j, tempCoeffArray,
                        resultSign, minuendExp, subtrahendExp,
                        minuendCoeffs, subtrahendCoeffs;

                    const minuendBN = this;
                    subtrahendValue = new BigNumberClass(subtrahendValue, base);

                    resultSign = minuendBN.s;
                    const subtrahendSign = subtrahendValue.s;

                    if (!resultSign || !subtrahendSign) return new BigNumberClass(NaN);

                    // If signs are different, convert to addition.
                    if (resultSign !== subtrahendSign) {
                        subtrahendValue.s = -subtrahendSign;
                        return minuendBN.plus(subtrahendValue);
                    }

                    minuendExp = minuendBN.e / internalBaseDigits;
                    subtrahendExp = subtrahendValue.e / internalBaseDigits;
                    minuendCoeffs = minuendBN.c;
                    subtrahendCoeffs = subtrahendValue.c;

                    // Handle cases where one or both are zero/null.
                    if (!minuendExp || !subtrahendExp) {
                        if (!minuendCoeffs || !subtrahendCoeffs) {
                            return minuendCoeffs ? (subtrahendValue.s = -subtrahendSign, subtrahendValue) : new BigNumberClass(subtrahendCoeffs ? minuendBN : NaN);
                        }
                        if (!minuendCoeffs[0] || !subtrahendCoeffs[0]) {
                            return subtrahendCoeffs[0] ? (subtrahendValue.s = -subtrahendSign, subtrahendValue) : new BigNumberClass(minuendCoeffs[0] ? minuendBN : (roundingModeConfig === 3 ? -0 : 0));
                        }
                    }

                    minuendExp = truncateValue(minuendExp);
                    subtrahendExp = truncateValue(subtrahendExp);
                    minuendCoeffs = minuendCoeffs.slice(); // Clone coefficients.

                    resultSign = minuendExp - subtrahendExp; // Difference in exponents.

                    if (resultSign) {
                        if (resultSign < 0) { // Minuend has smaller exponent.
                            resultSign = -resultSign;
                            tempCoeffArray = minuendCoeffs;
                        } else { // Subtrahend has smaller exponent.
                            subtrahendExp = minuendExp;
                            tempCoeffArray = subtrahendCoeffs;
                        }
                        // Pad the smaller coefficient array with zeros.
                        tempCoeffArray.reverse();
                        for (i = resultSign; i--; tempCoeffArray.push(0));
                        tempCoeffArray.reverse();
                    } else {
                        // Exponents are equal, compare coefficient arrays for magnitude.
                        const minLength = (i = minuendCoeffs.length) < (j = subtrahendCoeffs.length) ? i : j;
                        let needsComparison = false;
                        for (i = j = 0; i < minLength; i++) {
                            if (minuendCoeffs[i] !== subtrahendCoeffs[i]) {
                                needsComparison = true;
                                break;
                            }
                        }
                        if (needsComparison) {
                            resultSign = minuendCoeffs[i] < subtrahendCoeffs[i]; // True if minuend is smaller.
                        } else {
                            resultSign = minuendCoeffs.length < subtrahendCoeffs.length;
                        }
                    }

                    // If minuend is smaller than subtrahend, swap them and negate the result sign.
                    if (resultSign) {
                        tempCoeffArray = minuendCoeffs;
                        minuendCoeffs = subtrahendCoeffs;
                        subtrahendCoeffs = tempCoeffArray;
                        subtrahendValue.s = -subtrahendValue.s;
                    }

                    // Pad minuend with zeros if it's shorter than subtrahend.
                    if ((i = (j = subtrahendCoeffs.length) - (minuendCoeffs.length)) > 0) {
                        for (; i--; minuendCoeffs[minuendCoeffs.length++] = 0);
                    }

                    // Perform subtraction.
                    for (i = internalBaseMagnitude - 1; j > resultSign;) {
                        if (minuendCoeffs[--j] < subtrahendCoeffs[j]) {
                            for (let k = j; k && !minuendCoeffs[--k]; minuendCoeffs[k] = i);
                            --minuendCoeffs[k];
                            minuendCoeffs[j] += internalBaseMagnitude;
                        }
                        minuendCoeffs[j] -= subtrahendCoeffs[j];
                    }

                    // Remove leading zeros and finalize.
                    while (minuendCoeffs[0] === 0) {
                        minuendCoeffs.splice(0, 1);
                        subtrahendExp--;
                    }

                    return minuendCoeffs[0] ? finalizeBigNumberCoefficients(subtrahendValue, minuendCoeffs, subtrahendExp) : (subtrahendValue.s = (roundingModeConfig === 3 ? -1 : 1), subtrahendValue.c = [subtrahendValue.e = 0], subtrahendValue);
                };

                BigNumberPrototype.modulo = BigNumberPrototype.mod = function (modulusValue, base) {
                    let resultBN, originalModulusSign;
                    const dividendBN = this;
                    modulusValue = new BigNumberClass(modulusValue, base);

                    // Handle NaN, Infinity, or zero modulus.
                    if (!dividendBN.c || !modulusValue.s || (modulusValue.c && !modulusValue.c[0])) {
                        return new BigNumberClass(NaN);
                    }
                    // Handle zero dividend.
                    if (!modulusValue.c || (dividendBN.c && !dividendBN.c[0])) {
                        return new BigNumberClass(dividendBN);
                    }

                    // Adjust behavior based on modulo mode.
                    if (moduloCalculationMode === 9) { // EUCLID mode.
                        originalModulusSign = modulusValue.s;
                        modulusValue.s = 1; // Treat modulus as positive for division.
                        resultBN = performDivision(dividendBN, modulusValue, 0, 3); // Divide with ROUND_FLOOR.
                        modulusValue.s = originalModulusSign; // Restore modulus sign.
                        resultBN.s *= originalModulusSign; // Apply original modulus sign to quotient.
                    } else {
                        resultBN = performDivision(dividendBN, modulusValue, 0, moduloCalculationMode);
                    }

                    // Calculate remainder: dividend - (quotient * modulus).
                    resultBN = dividendBN.minus(resultBN.times(modulusValue));

                    // If remainder is zero and moduloMode is 1 (ROUND_DOWN), ensure sign matches dividend.
                    if (resultBN.c[0] === 0 && moduloCalculationMode === 1) {
                        resultBN.s = dividendBN.s;
                    }
                    return resultBN;
                };

                BigNumberPrototype.multipliedBy = BigNumberPrototype.times = function (multiplierValue, base) {
                    let i, j, productExponent,
                        lengthOne, lengthTwo,
                        coefficientsOne, coefficientsTwo,
                        productCoefficients, tempArray,
                        lowMagnitudeBase, highMagnitudeBase,
                        currentSegmentProduct, carryAccumulator,
                        scalarLow, scalarHigh,
                        segmentLow, segmentHigh;

                    const multiplicandBN = this;
                    multiplier