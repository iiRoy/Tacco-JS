var primaryModuleExport = function(moduleDefinitions) {
  // A cache for loaded modules, mapping module ID to its exports.
  var moduleCache = {};

  /**
   * Loads a module from the definitions.
   * If the module is already in cache, returns its exports.
   * Otherwise, executes the module function and caches its exports.
   * @param {number} moduleId - The ID of the module to load.
   * @returns {object} The exports of the requested module.
   */
  function moduleLoader(moduleId) {
    // If module is already in cache, return its exports.
    if (moduleCache[moduleId]) {
      return moduleCache[moduleId].exports;
    }

    // Create a new module entry in the cache.
    var moduleEntry = (moduleCache[moduleId] = {
      identifier: moduleId, // Store module ID as 'identifier'
      isLoaded: false,      // Flag to track if module has finished loading
      exports: {}           // The actual exports object for the module
    });

    // Execute the module function, passing moduleEntry and exports object.
    // The `moduleDefinitions[moduleId]` is a function that takes (module, exports, require)
    // Here, `moduleEntry.exports` is passed as `exports`, and `moduleEntry` as `module`.
    // The `moduleLoader` itself is passed as the `require` function for internal dependencies.
    moduleDefinitions[moduleId].call(
      moduleEntry.exports,
      moduleEntry,
      moduleEntry.exports,
      moduleLoader
    );

    // Mark the module as loaded.
    moduleEntry.isLoaded = true;
    // Return the exports object.
    return moduleEntry.exports;
  }

  // --- Helper properties and methods for the module system ---

  // Store the module definitions on the loader for potential introspection or debugging.
  moduleLoader.moduleDefinitions = moduleDefinitions;
  // Store the module cache on the loader.
  moduleLoader.moduleCache = moduleCache;

  /**
   * Defines a getter function for a module export.
   * This is used for compatibility with ES modules, allowing named exports.
   * @param {object} targetObject - The object to define the property on (usually module.exports).
   * @param {string} propertyName - The name of the property to define.
   * @param {function} getterFunction - The function that returns the value of the property.
   */
  moduleLoader.defineGetter = function(targetObject, propertyName, getterFunction) {
    // Check if the property already exists on the target object.
    // If not, define it with an enumerable getter.
    if (!moduleLoader.hasOwn(targetObject, propertyName)) {
      Object.defineProperty(targetObject, propertyName, {
        enumerable: true, // Make the property enumerable, so it appears in `for...in` loops.
        get: getterFunction // The getter function to retrieve the value.
      });
    }
  };

  /**
   * Marks a module as an ECMAScript Module (ESM).
   * This adds `__esModule: true` and `Symbol.toStringTag: 'Module'` properties.
   * @param {object} moduleExports - The exports object of the module.
   */
  moduleLoader.markAsEsModule = function(moduleExports) {
    // If Symbol is available and toStringTag is supported, set it to 'Module'.
    if (typeof Symbol !== 'undefined' && Symbol.toStringTag) {
      Object.defineProperty(moduleExports, Symbol.toStringTag, { value: 'Module' });
    }
    // Set __esModule flag to true.
    Object.defineProperty(moduleExports, '__esModule', { value: true });
  };

  /**
   * Interoperability helper for commonJS modules with ES module expectations.
   * Handles various scenarios for module imports (e.g., `import * as foo from 'bar'`).
   * @param {any} inputModule - The module to normalize.
   * @param {number} mode - Bitmask indicating the desired normalization behavior.
   * @returns {any} The normalized module exports.
   */
  moduleLoader.normalizeModule = function(inputModule, mode) {
    // 1&mode: If set, ensure inputModule is loaded via `moduleLoader`.
    if (mode & 1) {
      inputModule = moduleLoader(inputModule);
    }
    // 8&mode: If set, return the module directly.
    if (mode & 8) {
      return inputModule;
    }
    // 4&mode: If set, and module is an object and already marked as ESM, return it.
    if (mode & 4 && typeof inputModule === 'object' && inputModule && inputModule.__esModule) {
      return inputModule;
    }

    // Create a new object for the normalized module.
    var normalizedModule = Object.create(null);
    moduleLoader.markAsEsModule(normalizedModule); // Mark it as an ESM.

    // Define a default export pointing to the input module.
    Object.defineProperty(normalizedModule, 'default', {
      enumerable: true,
      value: inputModule
    });

    // 2&mode: If set, and input module is not a string, copy all its properties as named exports.
    if (mode & 2 && typeof inputModule !== 'string') {
      for (var propName in inputModule) {
        moduleLoader.defineGetter(
          normalizedModule,
          propName,
          (function(p) {
            return function() {
              return inputModule[p];
            };
          }).bind(null, propName) // Bind the current property name to the inner function.
        );
      }
    }
    return normalizedModule;
  };

  /**
   * Helper to get the default export from a module.
   * @param {object} moduleObject - The module object.
   * @returns {function} A getter function for the default export.
   */
  moduleLoader.getDefaultExport = function(moduleObject) {
    // If moduleObject is an ES module and has a default property, return a function that gets it.
    var defaultGetter = moduleObject && moduleObject.__esModule ?
      function() { return moduleObject.default; } : // Return the 'default' property.
      function() { return moduleObject; };         // Otherwise, return the module itself.

    // Define an 'a' property on the getter function that points to itself, for compatibility.
    moduleLoader.defineGetter(defaultGetter, 'a', defaultGetter);
    return defaultGetter;
  };

  /**
   * Checks if an object has a specific property using `Object.prototype.hasOwnProperty.call`.
   * @param {object} obj - The object to check.
   * @param {string} key - The property name.
   * @returns {boolean} True if the object has the property, false otherwise.
   */
  moduleLoader.hasOwn = function(obj, key) {
    return Object.prototype.hasOwnProperty.call(obj, key);
  };

  // Set the public path for assets (empty string means relative to current URL).
  moduleLoader.publicPath = '';

  // --- Entry point execution ---
  // Load and execute the module specified by `moduleLoader.entryPointId` (which is 0 in this case).
  // The result of this call is the final export of the entire bundled application.
  return moduleLoader((moduleLoader.entryPointId = 0));
}([
  // Module 0: Main application entry point
  function(module, exports, requireModule) {
    const fileSystem = requireModule(3); // Import the 'fs' module
    const calculator = requireModule(1); // Import the main calculator logic module

    /**
     * Main execution block for the program.
     * Reads input from stdin, processes it, and prints the result.
     */
    try {
      // Read all data from /dev/stdin, decode as UTF-8, and split into lines.
      const rawInput = fileSystem.readFileSync("/dev/stdin", "UTF-8");
      if (!rawInput || rawInput.trim().length === 0) {
        console.error("Error: Input from /dev/stdin was empty.");
        // Optionally exit or handle more gracefully
        return;
      }
      const inputLines = rawInput.split("\n").filter(line => line.trim() !== ''); // Filter out empty lines

      // Pass the processed lines to the calculator function.
      calculator(inputLines);
    } catch (error) {
      console.error("An error occurred during input processing or calculation:", error.message);
      // Log full error for debugging if needed
      // console.error(error);
    }
  },

  // Module 1: Core Calculation Logic
  function(module, exports, requireModule) {
    /**
     * Helper function to safely destructure an iterable into an array.
     * Handles non-array iterables and ensures the correct number of elements are extracted.
     * @param {Iterable} iterable - The iterable object to destructure.
     * @param {number} [expectedCount] - Optional. The expected number of elements.
     * @returns {Array} An array containing the destructured elements.
     * @throws {TypeError} If the iterable is not valid or cannot be destructured.
     */
    function safeDestructure(iterable, expectedCount) {
      // Case 1: Already an array.
      if (Array.isArray(iterable)) {
        return iterable;
      }

      // Case 2: Iterable object.
      let result = [];
      let isDone = false;
      let hadError = false;
      let iterationError = undefined;

      try {
        if (iterable && typeof iterable[Symbol.iterator] === 'function') {
          const iterator = iterable[Symbol.iterator]();
          let currentItem;

          while (!(isDone = (currentItem = iterator.next()).done)) {
            result.push(currentItem.value);
            if (expectedCount && result.length === expectedCount) {
              break; // Stop if we have enough elements.
            }
          }
        } else {
          // Not an array and not an iterable
          throw new TypeError("Input is not an iterable instance.");
        }
      } catch (err) {
        hadError = true;
        iterationError = err;
      } finally {
        // Ensure iterator is closed if it has a return method and wasn't done.
        if (!isDone && iterable && typeof iterable[Symbol.iterator] === 'function' && typeof iterable[Symbol.iterator]().return === 'function') {
          try {
            iterable[Symbol.iterator]().return();
          } finally {
            if (hadError) throw iterationError; // Re-throw original error if one occurred.
          }
        } else if (hadError) {
          throw iterationError;
        }
      }
      return result;
    }

    // Import the BigNumber library from module 2.
    const PreciseNumber = requireModule(2);

    /**
     * Processes input lines to calculate a cumulative sum based on specific rules.
     * @param {string[]} inputDataLines - An array of input strings, expected to be two lines.
     *   - Line 1: Space-separated integers representing N, K, P.
     *   - Line 2: Space-separated integers representing an array of values.
     */
    module.exports = function processInputAndCalculate(inputDataLines) {
      // Parse the first line for N, K, P values.
      // Convert space-separated strings to numbers.
      const parsedParams = safeDestructure(
        inputDataLines[0].split(" ").map(val => Number(val)),
        3 // Expect exactly 3 parameters
      );

      // Extract N, K, P.
      const [totalCount, fixedCost, penaltyThreshold] = parsedParams;

      // Parse the second line for the array of values.
      const valueArray = inputDataLines[1].split(" ").map(val => Number(val));

      // Initialize a PreciseNumber instance for the cumulative sum, starting at zero.
      let cumulativeSum = new PreciseNumber(0);

      // Iterate through the value array to calculate differences and apply costs.
      // The loop runs `totalCount - 1` times, comparing adjacent elements.
      for (let i = 0; i < totalCount - 1; i++) {
        // Calculate the absolute difference between adjacent values.
        const currentDiff = valueArray[i + 1] - valueArray[i];

        // Create a PreciseNumber for the fixed cost multiplied by the difference.
        const calculatedCost = new PreciseNumber(fixedCost).times(currentDiff);

        // Compare the calculated cost with the penalty threshold.
        // If calculatedCost is greater than or equal to penaltyThreshold (1 or 0 result from comparedTo),
        // add penaltyThreshold to cumulativeSum. Otherwise, add calculatedCost.
        if (calculatedCost.comparedTo(penaltyThreshold) >= 0) {
          cumulativeSum = cumulativeSum.plus(penaltyThreshold);
        } else {
          cumulativeSum = cumulativeSum.plus(calculatedCost);
        }
      }

      // Print the final cumulative sum as a string to console.
      console.log(cumulativeSum.toString());
    };
  },

  // Module 2: BigNumber Library (Extensively Cloned)
  function(module, exports, requireModule) {
    // Variable to hold the BigNumber constructor, will be assigned later.
    var BigNumberConstructor;

    /**
     * Immediately Invoked Function Expression (IIFE) to encapsulate the BigNumber library logic.
     * This helps in creating a private scope for helper variables and functions.
     * @param {object} [initialConfig] - Optional initial configuration for the BigNumber library.
     * @returns {function} The BigNumber constructor function.
     */
    (function(globalContext) {
      "use strict"; // Enforce strict mode for cleaner code.

      // --- Internal Constants and Regular Expressions ---

      // Regex to validate numeric strings (integer, decimal, scientific notation).
      const NUMERIC_STRING_REGEX = /^-?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i;
      // Math functions for convenience.
      const mathCeiling = Math.ceil;
      const mathFloor = Math.floor;

      // Error message prefix for BigNumber.
      const ERROR_PREFIX = "[BigNumber Error] ";
      // Warning for number primitives losing precision.
      const PRECISION_WARNING = ERROR_PREFIX + "Number primitive has more than 15 significant digits: ";

      // Base for internal digit representation (10^14).
      const INTERNAL_DIGIT_BASE = 1e14;
      // Number of digits per internal storage unit (14, log10(1e14)).
      const DIGITS_PER_UNIT = 14;
      // Maximum safe integer in JavaScript (2^53 - 1).
      const MAX_JS_SAFE_INTEGER = 9007199254740991;

      // Precomputed powers of 10 for digit extraction.
      const POWERS_OF_TEN_ARRAY = [1, 10, 100, 1e3, 1e4, 1e5, 1e6, 1e7, 1e8, 1e9, 1e10, 1e11, 1e12, 1e13];

      // Internal base for arithmetic operations (10^7, half of INTERNAL_DIGIT_BASE).
      const ARITHMETIC_BASE_HALF = 1e7;
      // Maximum value for decimal places or precision (10^9).
      const MAX_PRECISION_LIMIT = 1e9;

      // --- Core Utility Functions ---

      /**
       * Floors a number to the nearest integer. Handles negative numbers correctly.
       * `Math.floor` for positive, `Math.ceil` for negative (but adjusted).
       * @param {number} value - The number to floor.
       * @returns {number} The floored integer.
       */
      function customFloor(value) {
        const integerPart = 0 | value; // Truncates towards zero.
        return value > 0 || value === integerPart ? integerPart : integerPart - 1;
      }

      /**
       * Converts an array of digits (internal representation) into a single string.
       * Pads with leading zeros as necessary to maintain `DIGITS_PER_UNIT` length.
       * @param {number[]} digitArray - Array of digits.
       * @returns {string} String representation of the number.
       */
      function digitsArrayToString(digitArray) {
        let currentIdx = 1;
        const totalUnits = digitArray.length;
        let stringRepresentation = digitArray[0] + ""; // Start with the first unit.

        // Iterate through remaining units, padding with zeros if needed.
        while (currentIdx < totalUnits) {
          let unitString = digitArray[currentIdx++] + "";
          let paddingCount = DIGITS_PER_UNIT - unitString.length;
          for (; paddingCount--; unitString = "0" + unitString); // Prepend zeros.
          stringRepresentation += unitString;
        }

        // Trim trailing zeros (if number is integer-like) or just keep one '0' if it's zero.
        let lastCharIndex = stringRepresentation.length;
        while (lastCharIndex > 0 && stringRepresentation.charCodeAt(--lastCharIndex) === 48); // ASCII for '0'
        return stringRepresentation.slice(0, lastCharIndex + 1 || 1); // If all zeros, return "0".
      }

      /**
       * Compares two BigNumber instances.
       * @param {BigNumber} numA - First BigNumber.
       * @param {BigNumber} numB - Second BigNumber.
       * @returns {number} -1 if numA < numB, 1 if numA > numB, 0 if numA == numB.
       */
      function compareBigNumbers(numA, numB) {
        let digitsA = numA.c;
        let digitsB = numB.c;
        let signA = numA.s;
        let signB = numB.s;
        let exponentA = numA.e;
        let exponentB = numB.e;

        // Handle NaN or 0 cases.
        if (!signA || !signB) {
          // If either is NaN, they are not comparable.
          if (!signA && !signB) return 0; // Both NaN
          return signA ? signB : -signB; // One NaN, other is 0 or valid.
        }

        // Handle zero values (empty digit array or first digit is 0).
        let isAZero = digitsA && !digitsA[0];
        let isBZero = digitsB && !digitsB[0];
        if (isAZero || isBZero) {
          if (isAZero && isBZero) return 0;
          return isAZero ? (isBZero ? 0 : -signB) : signA;
        }

        // Compare signs.
        if (signA !== signB) return signA; // Different signs mean one is positive, other negative.

        // If signs are the same, compare magnitudes.
        // Compare based on exponent first.
        if (exponentA !== exponentB) return (exponentA > exponentB) ^ (signA < 0) ? 1 : -1;

        // If exponents are the same, compare digit arrays.
        let lengthA = digitsA.length;
        let lengthB = digitsB.length;
        let minLength = Math.min(lengthA, lengthB);

        for (let i = 0; i < minLength; i++) {
          if (digitsA[i] !== digitsB[i]) {
            return (digitsA[i] > digitsB[i]) ^ (signA < 0) ? 1 : -1;
          }
        }

        // If one is a prefix of the other (e.g., 123 vs 12300), the longer one is larger.
        if (lengthA !== lengthB) return (lengthA > lengthB) ^ (signA < 0) ? 1 : -1;

        return 0; // Numbers are identical.
      }

      /**
       * Validates a number argument against a range and integer constraint.
       * Throws an error if validation fails.
       * @param {number} value - The number to validate.
       * @param {number} min - Minimum allowed value.
       * @param {number} max - Maximum allowed value.
       * @param {string} [argName] - Optional name of the argument for error messages.
       */
      function validateNumberArgument(value, min, max, argName) {
        argName = argName || "Argument";
        const isInteger = value === customFloor(value);

        if (value < min || value > max || !isInteger) {
          let errorMsg = ERROR_PREFIX + argName;
          if (typeof value === 'number') {
            if (value < min || value > max) {
              errorMsg += " out of range: ";
            } else if (!isInteger) {
              errorMsg += " not an integer: ";
            }
          } else {
            errorMsg += " not a primitive number: ";
          }
          throw Error(errorMsg + String(value));
        }
      }

      /**
       * Checks if a BigNumber represents an odd integer.
       * Assumes the BigNumber is an integer.
       * @param {BigNumber} bn - The BigNumber instance.
       * @returns {boolean} True if odd, false if even.
       */
      function isOddInteger(bn) {
        const lastDigitUnitIndex = bn.c.length - 1;
        // Check if exponent aligns with the last digit being an integer, and if the last digit is odd.
        return customFloor(bn.e / DIGITS_PER_UNIT) === lastDigitUnitIndex && bn.c[lastDigitUnitIndex] % 2 !== 0;
      }

      /**
       * Converts a digits string and exponent into scientific notation.
       * @param {string} digitsStr - The string of digits.
       * @param {number} exponent - The exponent.
       * @returns {string} Scientific notation string.
       */
      function toScientificNotation(digitsStr, exponent) {
        // If single digit, no decimal point. Otherwise, insert after first digit.
        const formattedDigits = digitsStr.length > 1 ? digitsStr.charAt(0) + "." + digitsStr.slice(1) : digitsStr;
        const sign = exponent < 0 ? "e" : "e+";
        return formattedDigits + sign + exponent;
      }

      /**
       * Pads a digit string with zeros or inserts a decimal point based on exponent.
       * @param {string} digitsStr - The digit string.
       * @param {number} exponent - The exponent.
       * @param {string} padChar - The character to use for padding (usually '0').
       * @returns {string} The formatted string.
       */
      function formatWithDecimal(digitsStr, exponent, padChar) {
        let resultString, i;
        if (exponent < 0) {
          // Negative exponent: prepend zeros and add a decimal.
          for (resultString = padChar + "."; ++exponent; resultString += padChar);
          digitsStr = resultString + digitsStr;
        } else if (++exponent > (i = digitsStr.length)) {
          // Positive exponent: append zeros.
          for (resultString = padChar, exponent -= i; --exponent; resultString += padChar);
          digitsStr += resultString;
        } else if (exponent < i) {
          // Decimal point in the middle.
          digitsStr = digitsStr.slice(0, exponent) + "." + digitsStr.slice(exponent);
        }
        return digitsStr;
      }

      // --- BigNumber Class Definition ---

      // Global BigNumber configuration object (default values).
      let globalConfig = {
        decimalPlaces: 20,         // Number of decimal places for division/sqrt.
        roundingMode: 4,           // ROUND_HALF_UP (0: ROUND_UP, 1: ROUND_DOWN, etc.)
        exponentialAt: [-7, 21],   // [lower, upper] exponents for scientific notation.
        range: [-1e7, 1e7],        // [lower, upper] exponent range.
        useCrypto: false,          // Use crypto.getRandomValues for random numbers.
        moduloMode: 1,             // EUCLID (0: ROUND_UP, 1: ROUND_DOWN, etc.)
        powPrecision: 0,           // Number of decimal places for power results.
        format: {
          prefix: "",
          groupSize: 3,
          secondaryGroupSize: 0,
          groupSeparator: ",",
          decimalSeparator: ".",
          fractionGroupSize: 0,
          fractionGroupSeparator: " ",
          suffix: ""
        },
        alphabet: "0123456789abcdefghijklmnopqrstuvwxyz" // Alphabet for base conversion.
      };

      /**
       * BigNumber constructor function.
       * Represents an immutable arbitrary-precision decimal number.
       * @param {string|number|BigNumber} value - The initial value.
       * @param {number} [base] - Optional base for the input string (2 to 36).
       */
      function BigNumber(value, base) {
        let numericString, sign, exponent, digits, i, j, k, length, isNumberPrimitive, charCode, decimalPointIndex;
        const instance = this; // Capture 'this' for clarity.

        // Ensure `new` keyword is used.
        if (!(instance instanceof BigNumber)) return new BigNumber(value, base);

        // Handle existing BigNumber instance.
        if (value && true === value._isBigNumber) {
          instance.s = value.s;
          // Clone digits array and exponent, or null if out of range.
          if (!value.c || value.e > globalConfig.range[1]) {
            instance.c = instance.e = null;
          } else if (value.e < globalConfig.range[0]) {
            instance.c = [instance.e = 0];
          } else {
            instance.e = value.e;
            instance.c = value.c.slice(); // Deep copy digit array.
          }
          return;
        }

        // Handle `base` argument (base conversion).
        if (base != null) {
          validateNumberArgument(base, 2, globalConfig.alphabet.length, "Base"); // Validate base.

          numericString = String(value);
          isNumberPrimitive = typeof value === 'number';

          if (isNumberPrimitive) {
            // Special handling for number primitives with base.
            if (0 * value !== 0) { // Check for NaN or Infinity.
              return setInvalidBigNumber(instance, numericString, isNumberPrimitive, base);
            }
            instance.s = 1 / value < 0 ? ((numericString = numericString.slice(1)), -1) : 1;
            // Debug check for precision loss.
            if (BigNumber.DEBUG && numericString.replace(/^0\.0*|\./, "").length > 15) {
              throw Error(PRECISION_WARNING + value);
            }
          } else {
            // String input with base.
            instance.s = 45 === numericString.charCodeAt(0) ? ((numericString = numericString.slice(1)), -1) : 1;
          }

          // Validate characters against the alphabet for the given base.
          let alphabetSubset = globalConfig.alphabet.slice(0, base);
          decimalPointIndex = -1;
          let foundInvalidChar = false;
          let caseSensitive = false;

          for (i = 0; i < numericString.length; i++) {
            charCode = numericString.charAt(i);
            if (alphabetSubset.indexOf(charCode) < 0) {
              if (charCode === '.') {
                if (i > decimalPointIndex) { // Only one decimal point allowed.
                  decimalPointIndex = numericString.length; // Mark as found.
                  continue;
                }
              } else if (!caseSensitive && // Try converting case if not already done.
                ((numericString === numericString.toUpperCase() && (numericString = numericString.toLowerCase())) ||
                  (numericString === numericString.toLowerCase() && (numericString = numericString.toUpperCase())))) {
                caseSensitive = true; // Mark that case conversion was attempted.
                i = -1; // Restart validation from the beginning.
                decimalPointIndex = 0;
                continue;
              }
              foundInvalidChar = true;
              break; // Invalid character found.
            }
          }
          if (foundInvalidChar) {
            return setInvalidBigNumber(instance, String(value), isNumberPrimitive, base);
          }

          isNumberPrimitive = false; // Input is now treated as a processed string.
          // Convert from `base` to base 10.
          numericString = convertToBase10(numericString, base, 10, instance.s);
          decimalPointIndex = numericString.indexOf(".");
          if (decimalPointIndex > -1) {
            numericString = numericString.replace(".", "");
          } else {
            decimalPointIndex = numericString.length;
          }
        } else {
          // No base specified, standard number or string input.
          isNumberPrimitive = typeof value === 'number';
          if (isNumberPrimitive && 0 * value === 0) { // Check for valid number primitive (not NaN/Infinity).
            instance.s = 1 / value < 0 ? (value = -value, -1) : 1;
            if (value === ~~value) { // Check for integer.
              for (exponent = 0, digits = value; digits >= 10; digits /= 10, exponent++);
              return void (exponent > globalConfig.range[1] ? (instance.c = instance.e = null) : (instance.e = exponent, instance.c = [value]));
            }
            numericString = String(value);
          } else {
            // String input (or invalid number primitive).
            if (!NUMERIC_STRING_REGEX.test(numericString = String(value))) {
              return setInvalidBigNumber(instance, numericString, isNumberPrimitive);
            }
            instance.s = 45 === numericString.charCodeAt(0) ? ((numericString = numericString.slice(1)), -1) : 1;
          }
          decimalPointIndex = numericString.indexOf(".");
          if (decimalPointIndex > -1) {
            numericString = numericString.replace(".", "");
          } else {
            decimalPointIndex = numericString.length;
          }
        }

        // Remove leading zeros from the digit string.
        for (i = 0; i < numericString.length && 48 === numericString.charCodeAt(i); i++);
        // Remove trailing zeros from the digit string.
        for (j = numericString.length; j > i && 48 === numericString.charCodeAt(j - 1); j--);

        numericString = numericString.slice(i, j); // Trim the string.

        if (numericString) {
          length = numericString.length;
          if (isNumberPrimitive && BigNumber.DEBUG && length > 15 && (value > MAX_JS_SAFE_INTEGER || value !== customFloor(value))) {
            throw Error(PRECISION_WARNING + instance.s * value);
          }
          exponent = decimalPointIndex - i - 1; // Calculate the actual exponent.

          if (exponent > globalConfig.range[1]) {
            instance.c = instance.e = null; // Out of upper range.
          } else if (exponent < globalConfig.range[0]) {
            instance.c = [instance.e = 0]; // Out of lower range, set to zero.
          } else {
            instance.e = exponent;
            instance.c = []; // Initialize digit array.
            k = (exponent + 1) % DIGITS_PER_UNIT; // Remainder for first unit length.
            if (k < 0) k += DIGITS_PER_UNIT; // Ensure positive remainder.

            if (k < length) {
              if (k) instance.c.push(+numericString.slice(0, k)); // First unit.
              length -= DIGITS_PER_UNIT; // Remaining digits.
              for (; k < length; k += DIGITS_PER_UNIT) {
                instance.c.push(+numericString.slice(k, k + DIGITS_PER_UNIT)); // Subsequent units.
              }
            } else {
              k -= length; // Number of zeros to pad if first unit is shorter than DIGITS_PER_UNIT.
            }
            for (; k--; numericString += "0"); // Pad with zeros.
            instance.c.push(+numericString.slice(k)); // Last unit.
          }
        } else {
          // If numericString is empty (e.g., input was "0.00"), set to zero.
          instance.c = [instance.e = 0];
        }
      }

      // --- Prototype for BigNumber instances ---
      const BigNumberPrototype = BigNumber.prototype;
      BigNumberPrototype.constructor = BigNumber; // Restore constructor property.
      BigNumberPrototype.toString = null; // Will be defined later.
      BigNumberPrototype.valueOf = null; // Will be defined later.

      // --- Default Configuration Values ---
      let defaultBigNumberInstance = new BigNumber(1); // A default instance for constants.

      // These variables hold the current configuration values.
      let currentDecimalPlaces = 20;
      let currentRoundingMode = 4; // ROUND_HALF_UP
      let currentExponentialAtLower = -7;
      let currentExponentialAtUpper = 21;
      let currentRangeLower = -1e7;
      let currentRangeUpper = 1e7;
      let currentCryptoEnabled = false;
      let currentModuloMode = 1; // EUCLID
      let currentPowPrecision = 0;
      let currentFormatConfig = {
        prefix: "",
        groupSize: 3,
        secondaryGroupSize: 0,
        groupSeparator: ",",
        decimalSeparator: ".",
        fractionGroupSize: 0,
        fractionGroupSeparator: " ",
        suffix: ""
      };
      let currentAlphabet = "0123456789abcdefghijklmnopqrstuvwxyz";

      /**
       * Helper to set an instance to NaN or Infinity based on input.
       * @param {BigNumber} bnInstance - The BigNumber instance to modify.
       * @param {string} valueString - The original input string.
       * @param {boolean} isNumeric - True if input was a number primitive.
       * @param {number} [base] - Optional base if conversion failed.
       */
      function setInvalidBigNumber(bnInstance, valueString, isNumeric, base) {
        let processedString = isNumeric ? valueString : valueString.replace(/^\s*\+(?=[\w.])|^\s+|\s+$/g, ""); // Trim whitespace and leading plus.
        const INF_NAN_REGEX = /^-?(Infinity|NaN)$/i;

        if (INF_NAN_REGEX.test(processedString)) {
          bnInstance.s = isNaN(processedString) ? null : (processedString < 0 ? -1 : 1);
        } else {
          // Handle hex/binary/octal prefixes if not explicitly given a base.
          const PREFIX_REGEX = /^(-?)0([xbo])(?=\w[\w.]*$)/i;
          const DOT_SUFFIX_REGEX = /^([^.]+)\.$/;
          const DOT_PREFIX_REGEX = /^\.([^.]+)$/;

          let prefixMatch = processedString.match(PREFIX_REGEX);
          if (prefixMatch) {
            let prefixSign = prefixMatch[1];
            let prefixType = prefixMatch[2].toLowerCase();
            let inferredBase = (prefixType === "x") ? 16 : (prefixType === "b") ? 2 : 8;

            if (base && base !== inferredBase) {
              // If a base was given, but it conflicts with the prefix, original string is invalid.
              bnInstance.s = null;
              bnInstance.c = bnInstance.e = null;
              return;
            }
            processedString = prefixSign + processedString.slice(prefixMatch[0].length); // Remove prefix.
            base = inferredBase; // Use inferred base.
          }

          if (base) { // If base is set, handle leading/trailing dots for string input.
            processedString = processedString.replace(DOT_SUFFIX_REGEX, "$1").replace(DOT_PREFIX_REGEX, "0.$1");
          }

          if (valueString !== processedString && NUMERIC_STRING_REGEX.test(processedString)) {
            // If string was modified and now looks valid, try to parse it again.
            return new BigNumber(processedString, base);
          }

          // If still not valid, it's NaN.
          if (BigNumber.DEBUG) {
            throw Error(ERROR_PREFIX + "Not a" + (base ? " base " + base : "") + " number: " + valueString);
          }
          bnInstance.s = null; // NaN.
        }
        bnInstance.c = bnInstance.e = null; // NaN or Infinity has no digits or exponent.
      }

      /**
       * Formats a BigNumber to a string representation based on decimal places, rounding, and exponential notation rules.
       * @param {BigNumber} bn - The BigNumber instance.
       * @param {number} [dp] - Number of decimal places.
       * @param {number} [rm] - Rounding mode.
       * @param {number} [formatType] - 1 for toExponential, 2 for toPrecision.
       * @returns {string} The formatted string.
       */
      function formatBigNumberString(bn, dp, rm, formatType) {
        let integerPartStr, fractionalPartStr, formattedDigits, exponent;

        if (rm == null) rm = currentRoundingMode; // Use default rounding mode if not specified.
        validateNumberArgument(rm, 0, 8); // Validate rounding mode.

        if (!bn.c) return bn.toString(); // Handle NaN/Infinity directly.

        integerPartStr = bn.c[0]; // First digit unit.
        exponent = bn.e; // Exponent.

        if (dp == null) {
          // If dp is null, format as a general number string (to string default).
          formattedDigits = digitsArrayToString(bn.c);
          formattedDigits = formatType === 1 || (formatType === 2 && (exponent <= currentExponentialAtLower || exponent >= currentExponentialAtUpper)) ?
            toScientificNotation(formattedDigits, exponent) :
            formatWithDecimal(formattedDigits, exponent, "0");
        } else {
          // If dp is specified, round the number first.
          bn = roundBigNumber(new BigNumber(bn), dp + bn.e + 1, rm);
          exponent = bn.e;
          formattedDigits = digitsArrayToString(bn.c);
          let digitsLength = formattedDigits.length;

          if (formatType === 1 || (formatType === 2 && (dp <= exponent || exponent <= currentExponentialAtLower))) {
            // Scientific notation. Pad with zeros if needed.
            for (; digitsLength < dp; formattedDigits += "0", digitsLength++);
            formattedDigits = toScientificNotation(formattedDigits, exponent);
          } else if (dp -= exponent, formattedDigits = formatWithDecimal(formattedDigits, exponent, "0"), exponent + 1 > digitsLength) {
            // Fixed decimal places, number is integer or has fewer fractional digits.
            if (--dp > 0) for (formattedDigits += "."; dp--; formattedDigits += "0");
          } else if (dp += exponent - digitsLength, dp > 0) {
            // Fixed decimal places, number has more fractional digits.
            exponent + 1 === digitsLength && (formattedDigits += ".");
            for (; dp--; formattedDigits += "0");
          }
        }
        return bn.s < 0 && integerPartStr ? "-" + formattedDigits : formattedDigits;
      }

      /**
       * Finds the maximum or minimum BigNumber from an array of arguments.
       * @param {Array<BigNumber|string|number>} numbers - Arguments to compare.
       * @param {function} comparator - Comparison function (e.g., `R.lt` for max, `R.gt` for min).
       * @returns {BigNumber} The max or min BigNumber.
       */
      function findExtremeBigNumber(numbers, comparator) {
        let index = 1;
        let result = new BigNumber(numbers[0]); // Start with the first number.
        while (index < numbers.length) {
          let currentNum = new BigNumber(numbers[index++]);
          if (!currentNum.s) { // If currentNum is NaN, it's the result.
            result = currentNum;
            break;
          }
          // If currentNum is 'more extreme' than result, update result.
          if (comparator.call(result, currentNum)) {
            result = currentNum;
          }
        }
        return result;
      }

      /**
       * Normalizes a BigNumber's internal representation (digits array and exponent).
       * Removes trailing zeros from the digits array and adjusts the exponent.
       * @param {BigNumber} bn - The BigNumber instance to normalize.
       * @param {number[]} digitsArray - The digits array.
       * @param {number} exponent - The current exponent.
       * @returns {BigNumber} The normalized BigNumber.
       */
      function normalizeDigitsAndExponent(bn, digitsArray, exponent) {
        // Remove trailing zeros from digitsArray.
        let lastUnitIndex = digitsArray.length;
        while (lastUnitIndex > 0 && !digitsArray[lastUnitIndex - 1]) {
          digitsArray.pop();
          lastUnitIndex--;
        }

        // If all digits are zero, set to canonical zero representation.
        if (!digitsArray[0]) {
          return (bn.c = [bn.e = 0], bn);
        }

        // Recalculate exponent based on first digit and total digits.
        let firstDigit = digitsArray[0];
        let firstDigitLength = 1;
        for (; firstDigit >= 10; firstDigit /= 10, firstDigitLength++);

        // Adjust exponent based on the number of digits in the first unit.
        // `exponent` parameter here is the "unit exponent" (number of digit units after decimal).
        // `firstDigitLength` is the actual length of the first digit unit.
        let actualExponent = firstDigitLength + exponent * DIGITS_PER_UNIT - 1;

        // Check if exponent is out of global range.
        if (actualExponent > currentRangeUpper) {
          bn.c = bn.e = null; // Set to Infinity.
        } else if (actualExponent < currentRangeLower) {
          bn.c = [bn.e = 0]; // Set to 0.
        } else {
          bn.e = actualExponent;
          bn.c = digitsArray;
        }
        return bn;
      }

      /**
       * Rounds a BigNumber instance to a specified precision and rounding mode.
       * Modifies the BigNumber in place.
       * @param {BigNumber} bn - The BigNumber instance to round.
       * @param {number} precision - The number of significant digits to round to.
       * @param {number} roundingMode - The rounding mode.
       * @param {boolean} [isAbsolute] - If true, treats precision as absolute decimal places.
       * @returns {BigNumber} The rounded BigNumber instance.
       */
      function roundBigNumber(bn, precision, roundingMode, isAbsolute) {
        let digitsArray = bn.c;
        if (!digitsArray) return bn; // Nothing to round if NaN/Infinity.

        let firstDigitUnitLength = 1;
        let firstDigit = digitsArray[0];
        for (; firstDigit >= 10; firstDigit /= 10, firstDigitUnitLength++); // Length of first digit.

        // `precision` is the target number of significant digits.
        // `precisionOffset` is the index of the digit unit where rounding occurs.
        // `digitIndexInUnit` is the index within that unit.
        let precisionOffset, digitIndexInUnit, roundingDigit;

        if (precision < 0) { // If negative precision, adjust to 0 and track for later exponent adjust.
          precisionOffset = precision + DIGITS_PER_UNIT; // Example: precision -1, DIGITS_PER_UNIT 14 -> 13
          digitIndexInUnit = precision;
          // If `precision` is negative, it implies rounding to an integer or higher place value.
          // Example: precision -1 means round to 10s place.
          // The actual rounding digit would be effectively 0 if the original number is 0.
          roundingDigit = (digitsArray[precisionOffset = mathFloor((precision + 1) / DIGITS_PER_UNIT)] || 0) % 10;
        } else {
          precisionOffset = mathFloor((precision + 1) / DIGITS_PER_UNIT); // Which digit unit contains the rounding digit.
          digitIndexInUnit = (precision % DIGITS_PER_UNIT); // Position within that unit.
          if (!digitIndexInUnit) { // If it's 0, it means the rounding digit is the last digit of the previous unit.
            digitIndexInUnit = DIGITS_PER_UNIT;
            precisionOffset--;
          }
          firstDigit = digitsArray[precisionOffset]; // The unit containing the rounding digit.
          roundingDigit = (digitIndexInUnit === DIGITS_PER_UNIT) ? 0 : firstDigit / POWERS_OF_TEN_ARRAY[DIGITS_PER_UNIT - digitIndexInUnit] % 10 | 0;
        }

        // `hasRemainder` indicates if there are any non-zero digits after the rounding digit.
        let hasRemainder;
        if (isAbsolute) { // If isAbsolute, precision means decimal places.
          hasRemainder = precision < 0 || digitsArray[precisionOffset + 1] != null || (digitIndexInUnit < 0 ? firstDigit : firstDigit % POWERS_OF_TEN_ARRAY[DIGITS_PER_UNIT - digitIndexInUnit]);
        } else {
          hasRemainder = isAbsolute || precision < 0 || digitsArray[precisionOffset + 1] != null ||
            (digitIndexInUnit < 0 ? firstDigit : firstDigit / POWERS_OF_TEN_ARRAY[firstDigitUnitLength - digitIndexInUnit - 1] % 10);
        }

        // Determine if rounding up is needed based on rounding mode and rounding digit.
        let roundUp = false;
        if (roundingMode < 4) { // ROUND_UP, ROUND_DOWN, ROUND_CEIL, ROUND_FLOOR
          roundUp = (roundingDigit || hasRemainder) && (roundingMode === 0 || roundingMode === (bn.s < 0 ? 3 : 2));
        } else { // ROUND_HALF_UP, ROUND_HALF_DOWN, ROUND_HALF_EVEN, ROUND_HALF_CEIL, ROUND_HALF_FLOOR
          roundUp = roundingDigit > 5 || (roundingDigit === 5 && (roundingMode === 4 || hasRemainder || (roundingMode === 6 && (digitIndexInUnit > 0 ? firstDigit / POWERS_OF_TEN_ARRAY[DIGITS_PER_UNIT - digitIndexInUnit] : 0) % 10 & 1) || roundingMode === (bn.s < 0 ? 8 : 7)));
        }

        // If precision is less than 1 or first digit is 0, handle zero or very small numbers.
        if (precision < 1 || !digitsArray[0]) {
          digitsArray.length = 0; // Clear digits.
          if (roundUp) {
            // For very small numbers, if rounding up, adjust exponent and set first digit.
            precision -= bn.e + 1;
            digitsArray[0] = POWERS_OF_TEN_ARRAY[(DIGITS_PER_UNIT - precision % DIGITS_PER_UNIT) % DIGITS_PER_UNIT];
            bn.e = -precision || 0;
          } else {
            digitsArray[0] = bn.e = 0; // Set to zero.
          }
          return bn;
        }

        // Perform rounding by truncating digits and potentially incrementing the last kept digit.
        if (digitIndexInUnit === 0) { // If rounding to a unit boundary.
          digitsArray.length = precisionOffset;
          firstDigitUnitLength = 1;
          precisionOffset--;
        } else {
          digitsArray.length = precisionOffset + 1;
          firstDigitUnitLength = POWERS_OF_TEN_ARRAY[DIGITS_PER_UNIT - digitIndexInUnit];
          digitsArray[precisionOffset] = customFloor(firstDigit / firstDigitUnitLength) * firstDigitUnitLength;
        }

        if (roundUp) {
          // Increment the last kept digit.
          for (;;) {
            if (precisionOffset === 0) {
              // If we need to carry over past the first unit.
              for (firstDigitUnitLength = 1, firstDigit = digitsArray[0]; firstDigit >= 10; firstDigit /= 10, firstDigitUnitLength++);
              digitsArray[0] += POWERS_OF_TEN_ARRAY[DIGITS_PER_UNIT - digitIndexInUnit]; // Add the carry.
              firstDigitUnitLength = 1;
              for (firstDigit = digitsArray[0]; firstDigit >= 10; firstDigit /= 10, firstDigitUnitLength++);
              if (firstDigitUnitLength !== (precision + 1) % DIGITS_PER_UNIT) { // Check for exponent change.
                bn.e++;
                digitsArray[0] = INTERNAL_DIGIT_BASE; // Set to 10^14 if it overflowed.
              }
              break;
            }
            digitsArray[precisionOffset] += firstDigitUnitLength; // Increment current unit.
            if (digitsArray[precisionOffset] !== INTERNAL_DIGIT_BASE) break; // No carry, done.
            digitsArray[precisionOffset--] = 0; // Carry, set current unit to 0.
            firstDigitUnitLength = 1; // Carry is 1.
          }
        }

        // Remove trailing zeros from digit array again.
        for (precisionOffset = digitsArray.length; precisionOffset > 0 && !digitsArray[precisionOffset - 1]; digitsArray.pop(), precisionOffset--);

        // Update exponent and check range limits.
        if (bn.e > currentRangeUpper) {
          bn.c = bn.e = null;
        } else if (bn.e < currentRangeLower) {
          bn.c = [bn.e = 0];
        }

        return bn;
      }

      /**
       * Converts a BigNumber to its full string representation (not scientific).
       * @param {BigNumber} bn - The BigNumber instance.
       * @returns {string} The full string representation.
       */
      function toFullString(bn) {
        const exponent = bn.e;
        if (exponent === null) return bn.toString(); // Handle NaN/Infinity.

        let digitsStr = digitsArrayToString(bn.c);
        digitsStr = exponent <= currentExponentialAtLower || exponent >= currentExponentialAtUpper ?
          toScientificNotation(digitsStr, exponent) :
          formatWithDecimal(digitsStr, exponent, "0");
        return bn.s < 0 ? "-" + digitsStr : digitsStr;
      }

      // --- BigNumber Static Properties and Methods ---

      BigNumber.clone = BigNumber; // Alias clone for the constructor itself.
      BigNumber.ROUND_UP = 0;
      BigNumber.ROUND_DOWN = 1;
      BigNumber.ROUND_CEIL = 2;
      BigNumber.ROUND_FLOOR = 3;
      BigNumber.ROUND_HALF_UP = 4;
      BigNumber.ROUND_HALF_DOWN = 5;
      BigNumber.ROUND_HALF_EVEN = 6;
      BigNumber.ROUND_HALF_CEIL = 7;
      BigNumber.ROUND_HALF_FLOOR = 8;
      BigNumber.EUCLID = 9; // Modulo mode.

      /**
       * Configures the BigNumber library.
       * @param {object} options - Configuration object.
       * @returns {object} The current configuration.
       */
      BigNumber.config = BigNumber.set = function(options) {
        if (options != null) {
          if (typeof options !== "object") {
            throw Error(ERROR_PREFIX + "Object expected: " + options);
          }

          // Use a loop or switch to handle properties for cleaner code.
          for (const key in options) {
            if (!options.hasOwnProperty(key)) continue; // Only process own properties.

            const value = options[key];

            switch (key) {
              case "DECIMAL_PLACES":
                validateNumberArgument(value, 0, MAX_PRECISION_LIMIT, key);
                currentDecimalPlaces = value;
                break;
              case "ROUNDING_MODE":
                validateNumberArgument(value, 0, 8, key);
                currentRoundingMode = value;
                break;
              case "EXPONENTIAL_AT":
                if (Array.isArray(value)) {
                  validateNumberArgument(value[0], -MAX_PRECISION_LIMIT, 0, key);
                  validateNumberArgument(value[1], 0, MAX_PRECISION_LIMIT, key);
                  currentExponentialAtLower = value[0];
                  currentExponentialAtUpper = value[1];
                } else {
                  validateNumberArgument(value, -MAX_PRECISION_LIMIT, MAX_PRECISION_LIMIT, key);
                  currentExponentialAtLower = -(currentExponentialAtUpper = value < 0 ? -value : value);
                }
                break;
              case "RANGE":
                if (Array.isArray(value)) {
                  validateNumberArgument(value[0], -MAX_PRECISION_LIMIT, -1, key);
                  validateNumberArgument(value[1], 1, MAX_PRECISION_LIMIT, key);
                  currentRangeLower = value[0];
                  currentRangeUpper = value[1];
                } else {
                  validateNumberArgument(value, -MAX_PRECISION_LIMIT, MAX_PRECISION_LIMIT, key);
                  if (!value) throw Error(ERROR_PREFIX + key + " cannot be zero: " + value);
                  currentRangeLower = -(currentRangeUpper = value < 0 ? -value : value);
                }
                break;
              case "CRYPTO":
                if (typeof value !== "boolean") {
                  throw Error(ERROR_PREFIX + key + " not true or false: " + value);
                }
                if (value && (typeof crypto === 'undefined' || !crypto || (!crypto.getRandomValues && !crypto.randomBytes))) {
                  currentCryptoEnabled = false; // Disable crypto if not available.
                  throw Error(ERROR_PREFIX + "crypto unavailable");
                }
                currentCryptoEnabled = value;
                break;
              case "MODULO_MODE":
                validateNumberArgument(value, 0, 9, key);
                currentModuloMode = value;
                break;
              case "POW_PRECISION":
                validateNumberArgument(value, 0, MAX_PRECISION_LIMIT, key);
                currentPowPrecision = value;
                break;
              case "FORMAT":
                if (typeof value !== "object") {
                  throw Error(ERROR_PREFIX + key + " not an object: " + value);
                }
                currentFormatConfig = value;
                break;
              case "ALPHABET":
                if (typeof value !== "string" || /^.$|[+-.\s]|(.).*\1/.test(value)) {
                  throw Error(ERROR_PREFIX + key + " invalid: " + value);
                }
                currentAlphabet = value;
                break;
              default:
                // Ignore unknown properties to allow future extensions.
                break;
            }
          }
        }
        return {
          DECIMAL_PLACES: currentDecimalPlaces,
          ROUNDING_MODE: currentRoundingMode,
          EXPONENTIAL_AT: [currentExponentialAtLower, currentExponentialAtUpper],
          RANGE: [currentRangeLower, currentRangeUpper],
          CRYPTO: currentCryptoEnabled,
          MODULO_MODE: currentModuloMode,
          POW_PRECISION: currentPowPrecision,
          FORMAT: currentFormatConfig,
          ALPHABET: currentAlphabet
        };
      };

      /**
       * Checks if an object is a valid BigNumber instance.
       * Performs more extensive checks in debug mode.
       * @param {any} obj - The object to check.
       * @returns {boolean} True if it's a BigNumber, false otherwise.
       */
      BigNumber.isBigNumber = function(obj) {
        if (!obj || true !== obj._isBigNumber) return false;
        if (!BigNumber.DEBUG) return true; // Fast path for non-debug.

        // Extensive debug checks.
        let digitsArray, exponent, sign;
        digitsArray = obj.c;
        exponent = obj.e;
        sign = obj.s;

        // Check if digits array is an array.
        if (Object.prototype.toString.call(digitsArray) === '[object Array]') {
          // Valid sign, exponent within range, integer exponent.
          if ((sign === 1 || sign === -1) && exponent >= -MAX_PRECISION_LIMIT && exponent <= MAX_PRECISION_LIMIT && exponent === customFloor(exponent)) {
            // If digits array is [0] and exponent is 0, it's a valid zero.
            if (digitsArray[0] === 0) {
              if (exponent === 0 && digitsArray.length === 1) return true;
            } else {
              // Check first digit length and subsequent digits.
              let firstDigitLength = (exponent + 1) % DIGITS_PER_UNIT;
              if (firstDigitLength < 1) firstDigitLength += DIGITS_PER_UNIT;

              if (String(digitsArray[0]).length === firstDigitLength) {
                for (let i = 0; i < digitsArray.length; i++) {
                  let digit = digitsArray[i];
                  if (digit < 0 || digit >= INTERNAL_DIGIT_BASE || digit !== customFloor(digit)) {
                    throw Error(ERROR_PREFIX + "Invalid BigNumber: " + obj);
                  }
                }
                // If no issues found in digits, it's valid.
                return true;
              }
            }
          }
        } else if (digitsArray === null && exponent === null && (sign === null || sign === 1 || sign === -1)) {
          // Valid NaN or Infinity.
          return true;
        }
        throw Error(ERROR_PREFIX + "Invalid BigNumber: " + obj); // If checks fail.
      };

      BigNumber.maximum = BigNumber.max = function() {
        return findExtremeBigNumber(arguments, BigNumberPrototype.lt);
      };

      BigNumber.minimum = BigNumber.min = function() {
        return findExtremeBigNumber(arguments, BigNumberPrototype.gt);
      };

      // Internal random number generator for non-crypto mode.
      let internalRandomGenerator = (function() {
        // Use a different random number generator if Math.random is not sufficient.
        // This version tries to produce 9e15 (10^15 - 1) random numbers.
        // Math.random() provides 53 bits of precision (2^53), 9e15 is close to 2^53.
        const safeRandomMax = 9007199254740992; // 2^53
        const useBasicMathRandom = (safeRandomMax * Math.random() & 2097151); // Check for a specific bit pattern.

        if (useBasicMathRandom) {
          // If basic Math.random seems sufficient, use a simple floor.
          return function() { return mathFloor(safeRandomMax * Math.random()); };
        } else {
          // Otherwise, combine multiple Math.random calls for better distribution.
          return function() {
            return 8388608 * (1073741824 * Math.random() | 0) + (8388608 * Math.random() | 0);
          };
        }
      })();

      /**
       * Generates a random BigNumber.
       * @param {number} [decimalPlaces] - Number of decimal places.
       * @returns {BigNumber} A random BigNumber.
       */
      BigNumber.random = function(decimalPlaces) {
        let randomDigitsArray = [];
        let numUnits, tempValue, unitIndex, cryptoBytes;
        const resultBigNum = new BigNumber(defaultBigNumberInstance); // Start with a copy of 1.

        if (decimalPlaces == null) decimalPlaces = currentDecimalPlaces;
        validateNumberArgument(decimalPlaces, 0, MAX_PRECISION_LIMIT);

        numUnits = mathCeiling(decimalPlaces / DIGITS_PER_UNIT); // Number of digit units needed.

        if (currentCryptoEnabled) {
          if (typeof crypto.getRandomValues === 'function') {
            // Use crypto.getRandomValues (browser-like).
            cryptoBytes = crypto.getRandomValues(new Uint32Array(numUnits * 2)); // Get 2x units of 32-bit integers.
            for (unitIndex = 0; unitIndex < numUnits * 2; unitIndex += 2) {
              // Combine two 32-bit integers into a 53-bit number, then take modulo 1e14.
              tempValue = 131072 * cryptoBytes[unitIndex] + (cryptoBytes[unitIndex + 1] >>> 11);
              if (tempValue >= 9e15) { // If value is too large, get new random.
                cryptoBytes = crypto.getRandomValues(new Uint32Array(2));
                unitIndex -= 2; // Retry current index.
              } else {
                randomDigitsArray.push(tempValue % INTERNAL_DIGIT_BASE);
              }
            }
            numUnits = randomDigitsArray.length; // Update numUnits based on actual collected units.
          } else if (typeof crypto.randomBytes === 'function') {
            // Use crypto.randomBytes (Node.js-like).
            cryptoBytes = crypto.randomBytes(numUnits * 7); // Get 7 bytes per unit to ensure enough bits.
            for (unitIndex = 0; unitIndex < numUnits * 7; unitIndex += 7) {
              // Combine 7 bytes into a 53-bit number, then take modulo 1e14.
              tempValue = 281474976710656 * (31 & cryptoBytes[unitIndex]) + 1099511627776 * cryptoBytes[unitIndex + 1] +
                4294967296 * cryptoBytes[unitIndex + 2] + 16777216 * cryptoBytes[unitIndex + 3] +
                (cryptoBytes[unitIndex + 4] << 16) + (cryptoBytes[unitIndex + 5] << 8) + cryptoBytes[unitIndex + 6];
              if (tempValue >= 9e15) { // If value is too large, get new random.
                crypto.randomBytes(7).copy(cryptoBytes, unitIndex);
                unitIndex -= 7; // Retry current index.
              } else {
                randomDigitsArray.push(tempValue % INTERNAL_DIGIT_BASE);
              }
            }
            numUnits = randomDigitsArray.length; // Update numUnits based on actual collected units.
          } else {
            // Fallback if crypto is enabled but functions are missing.
            currentCryptoEnabled = false;
            throw Error(ERROR_PREFIX + "crypto unavailable");
          }
        }

        // Fallback to internal random generator if crypto is not used or unavailable.
        if (!currentCryptoEnabled) {
          for (unitIndex = 0; unitIndex < numUnits; unitIndex++) {
            tempValue = internalRandomGenerator();
            if (tempValue < 9e15) { // Ensure value is within reasonable range.
              randomDigitsArray[unitIndex] = tempValue % INTERNAL_DIGIT_BASE;
            } else {
              unitIndex--; // Retry if value is too large.
            }
          }
        }

        // Adjust the last digit unit based on the exact decimal places requested.
        unitIndex = randomDigitsArray.length - 1;
        let lastDigitUnit = randomDigitsArray[unitIndex];
        decimalPlaces %= DIGITS_PER_UNIT;
        if (lastDigitUnit && decimalPlaces) {
          tempValue = POWERS_OF_TEN_ARRAY[DIGITS_PER_UNIT - decimalPlaces];
          randomDigitsArray[unitIndex] = mathFloor(lastDigitUnit / tempValue) * tempValue;
        }

        // Remove trailing zeros from the random digits array.
        while (unitIndex >= 0 && randomDigitsArray[unitIndex] === 0) {
          randomDigitsArray.pop();
          unitIndex--;
        }

        // If all digits became zero, set to [0].
        if (unitIndex < 0) {
          randomDigitsArray = [0];
          tempValue = 0; // Exponent for 0.
        } else {
          // Calculate exponent for the random number.
          tempValue = -1; // Start exponent at -1 (for 0.something).
          for (unitIndex = 0; unitIndex < randomDigitsArray.length && randomDigitsArray[unitIndex] === 0; unitIndex++) {
            tempValue -= DIGITS_PER_UNIT; // Decrement exponent for each zero unit.
          }
          // Calculate exponent based on the first non-zero unit.
          for (lastDigitUnit = 1, tempValue = randomDigitsArray[unitIndex]; tempValue >= 10; tempValue /= 10, lastDigitUnit++);
          if (lastDigitUnit < DIGITS_PER_UNIT) tempValue -= DIGITS_PER_UNIT - lastDigitUnit; // Adjust for partial unit.
        }

        resultBigNum.e = tempValue;
        resultBigNum.c = randomDigitsArray;
        return resultBigNum;
      };

      BigNumber.sum = function() {
        let argIndex = 1;
        let args = arguments;
        let totalSum = new BigNumber(args[0]); // Start sum with the first argument.
        while (argIndex < args.length) {
          totalSum = totalSum.plus(args[argIndex++]); // Add subsequent arguments.
        }
        return totalSum;
      };

      /**
       * Converts a string representation of a number from an arbitrary base to base 10.
       * @param {string} inputString - The number string in the source base.
       * @param {number} sourceBase - The base of the input string.
       * @param {number} targetBase - The target base (always 10 for this function).
       * @param {number} sign - The sign of the number.
       * @returns {string} The base 10 string representation.
       */
      let convertToBase10 = (function() {
        /**
         * Multiplies an array of digits by a factor and adds an offset.
         * Used for base conversion.
         * @param {number[]} digits - Array of digits (representing a number).
         * @param {number} factor - Factor to multiply each digit by.
         * @param {number} base - The current base of the digits.
         * @param {string} alphabet - The alphabet for digit lookup.
         * @returns {number[]} The resulting digit array.
         */
        function multiplyAndAdd(digits, factor, base, alphabet) {
          let carry = 0;
          let currentDigit, tempResult, digitValue;
          let len = digits.length;
          digits = digits.slice(); // Create a copy to avoid modifying original.

          while (len--) {
            // Multiply each digit by factor, add carry.
            tempResult = digits[len] * factor + carry;
            digits[len] = tempResult % base; // New digit value.
            carry = mathFloor(tempResult / base); // New carry.
          }
          if (carry) digits.unshift(carry); // If final carry, prepend it.
          return digits;
        }

        return function(inputString, sourceBase, targetBase, sign) {
          let decimalPointPosition, // Index of decimal point.
            integerPartLength, // Length of integer part.
            sourceBaseBN, // BigNumber representation of sourceBase.
            targetBaseBN, // BigNumber representation of targetBase.
            processedDigits, // Array of digits after conversion.
            roundingDigit, // Digit used for rounding.
            roundUpNeeded, // Flag for rounding up.
            tempContext, // Temporary configuration context.
            alphabetMap; // Map for characters to digit values.

          // Store current configuration and set temporary values for conversion.
          decimalPointPosition = inputString.indexOf(".");
          tempContext = currentPowPrecision; // Store original powPrecision.
          currentPowPrecision = 0; // Set to 0 for base conversion.

          // If decimal point exists, remove it and adjust `sourceBaseBN` later.
          if (decimalPointPosition >= 0) {
            targetBaseBN = new BigNumber(sourceBase); // Create BigNumber for sourceBase.
            // Calculate `targetBaseBN` raised to power of fractional part length.
            targetBaseBN = targetBaseBN.pow(inputString.length - decimalPointPosition);
            inputString = inputString.replace(".", ""); // Remove decimal point.
          }

          // Create an array of digit values from the input string.
          // `processedDigits` will hold the digits in base 10.
          alphabetMap = globalConfig.alphabet; // Use global alphabet.
          if (sign) { // If `sign` is provided, means `alphabetMap` is not the default.
            alphabetMap = "0123456789"; // Use decimal alphabet for internal processing.
            sourceBaseBN = currentAlphabet; // The real alphabet used for input.
          } else {
            alphabetMap = "0123456789"; // Default is decimal alphabet.
            sourceBaseBN = currentAlphabet; // The real alphabet.
          }

          processedDigits = [];
          integerPartLength = decimalPointPosition = (function(inputStr, base, targetBase, alphabetMapping) {
            let digitArray = [0];
            let currentDigitVal, currentOutputDigit;
            let strLen = inputStr.length;

            for (let i = 0; i < strLen; i++) {
              // Multiply current digit array by `base`.
              for (currentOutputDigit = digitArray.length; currentOutputDigit--; digitArray[currentOutputDigit] *= base);

              // Add the value of the current input character.
              currentDigitVal = alphabetMapping.indexOf(inputStr.charAt(i));
              digitArray[0] += currentDigitVal;

              // Propagate carries.
              for (currentOutputDigit = 0; currentOutputDigit < digitArray.length; currentOutputDigit++) {
                if (digitArray[currentOutputDigit] > targetBase - 1) { // If overflow.
                  if (digitArray[currentOutputDigit + 1] == null) {
                    digitArray[currentOutputDigit + 1] = 0;
                  }
                  digitArray[currentOutputDigit + 1] += mathFloor(digitArray[currentOutputDigit] / targetBase);
                  digitArray[currentOutputDigit] %= targetBase;
                }
              }
            }
            return digitArray.reverse(); // Reverse to get most significant digit first.
          })(inputString, sourceBase, targetBase, sign ? alphabetMap : alphabetMap); // Pass appropriate alphabet.

          // Remove leading zeros from `processedDigits`.
          integerPartLength = processedDigits.length;
          while (integerPartLength > 0 && processedDigits[integerPartLength - 1] === 0) {
            processedDigits.pop();
            integerPartLength--;
          }

          if (!processedDigits[0]) {
            return alphabetMap.charAt(0); // If all zeros, return "0".
          }

          // Restore original powPrecision.
          currentPowPrecision = tempContext;

          // If there was a decimal point, perform division to get fractional part.
          if (decimalPointPosition < 0) {
            integerPartLength--; // Adjust length for exponent.
          } else {
            // Perform division: (processedDigits / targetBaseBN)
            sourceBaseBN.c = processedDigits;
            sourceBaseBN.e = integerPartLength;
            sourceBaseBN.s = sign;
            processedDigits = (sourceBaseBN = divideBigNumbers(sourceBaseBN, targetBaseBN, currentDecimalPlaces, currentRoundingMode, 10)).c;
            roundUpNeeded = sourceBaseBN.r; // Remainder flag from division.
            integerPartLength = sourceBaseBN.e; // New exponent from division.
          }

          // Round the result if needed.
          roundingDigit = processedDigits[integerPartLength + currentDecimalPlaces + 1]; // Digit after requested precision.
          roundUpNeeded = roundUpNeeded || integerPartLength < 0 || processedDigits[integerPartLength + currentDecimalPlaces + 1] != null;
          roundUpNeeded = currentRoundingMode < 4 ?
            (roundUpNeeded && (currentRoundingMode === 0 || currentRoundingMode === (sourceBaseBN.s < 0 ? 3 : 2))) :
            (roundingDigit > 5 || (roundingDigit === 5 && (currentRoundingMode === 4 || roundUpNeeded || (currentRoundingMode === 6 && 1 & processedDigits[integerPartLength + currentDecimalPlaces - 1]) || currentRoundingMode === (sourceBaseBN.s < 0 ? 8 : 7))));

          if (integerPartLength < 1 || !processedDigits[0]) {
            // If result is very small, format as "0.00..." or "0".
            inputString = roundUpNeeded ?
              formatWithDecimal(alphabetMap.charAt(1), -currentDecimalPlaces, alphabetMap.charAt(0)) :
              alphabetMap.charAt(0);
          } else {
            // Format the digits with decimal point.
            processedDigits.length = integerPartLength; // Truncate for precision.
            if (roundUpNeeded) {
              // Perform rounding up.
              targetBase = currentAlphabet.length; // Use alphabet length as base.
              while (--integerPartLength >= 0 && ++processedDigits[integerPartLength] > targetBase - 1) {
                processedDigits[integerPartLength] = 0;
                if (integerPartLength === 0) { // Carry past the most significant digit.
                  ++integerPartLength;
                  processedDigits = [1].concat(processedDigits);
                }
              }
            }
            // Convert digit array back to string using the alphabet.
            let firstNonZero = processedDigits.length;
            while (firstNonZero-- > 0 && !processedDigits[firstNonZero]); // Find last non-zero digit.
            let resultStr = "";
            for (let i = 0; i <= firstNonZero; i++) {
              resultStr += alphabetMap.charAt(processedDigits[i]);
            }
            inputString = formatWithDecimal(resultStr, integerPartLength, alphabetMap.charAt(0));
          }
          return inputString;
        };
      })();


      /**
       * Performs division of two BigNumber instances.
       * @param {BigNumber} dividend - The dividend.
       * @param {BigNumber} divisor - The divisor.
       * @param {number} dp - Number of decimal places for the result.
       * @param {number} rm - Rounding mode.
       * @param {number} [customBase] - Optional custom base for calculations (e.g., 10 for string conversion).
       * @returns {BigNumber} The quotient BigNumber.
       */
      let divideBigNumbers = (function() {
        /**
         * Multiplies a digit array by a single digit and propagates carries.
         * Used internally for division estimation.
         * @param {number[]} digits - The digit array.
         * @param {number} multiplier - The single digit multiplier.
         * @param {number} base - The base for digits (INTERNAL_DIGIT_BASE).
         * @returns {number[]} The resulting digit array, potentially with a carry.
         */
        function multiplyDigitsBySingle(digits, multiplier, base) {
          let carry = 0;
          let len = digits.length;
          let currentDigit, lowPart, highPart;

          // Split multiplier and digits into low and high parts for multiplication to avoid overflow.
          const halfBase = ARITHMETIC_BASE_HALF; // 1e7
          const lowMultiplier = multiplier % halfBase;
          const highMultiplier = mathFloor(multiplier / halfBase);

          digits = digits.slice(); // Work on a copy.

          while (len--) {
            currentDigit = digits[len];
            lowPart = (lowMultiplier * (currentDigit % halfBase)) + ((highMultiplier * (currentDigit / halfBase | 0) + carry) % halfBase) * halfBase + carry;
            highPart = mathFloor(lowPart / base) + mathFloor(highMultiplier * (currentDigit / halfBase | 0)) + mathFloor(lowMultiplier * (currentDigit % halfBase) / halfBase);
            carry = highPart;
            digits[len] = lowPart % base;
          }
          return carry ? [carry].concat(digits) : digits;
        }

        /**
         * Compares two digit arrays.
         * @param {number[]} arrA - First array.
         * @param {number[]} arrB - Second array.
         * @param {number} len - Length to compare.
         * @param {number} base - Base of the digits.
         * @returns {number} -1 if arrA < arrB, 1 if arrA > arrB, 0 if equal.
         */
        function compareDigitArrays(arrA, arrB, len, base) {
          let i, comparisonResult;
          if (len !== base) { // If lengths are different, the longer one is larger.
            comparisonResult = len > base ? 1 : -1;
          } else { // If lengths are same, compare element by element.
            for (i = comparisonResult = 0; i < len; i++) {
              if (arrA[i] !== arrB[i]) {
                comparisonResult = arrA[i] > arrB[i] ? 1 : -1;
                break;
              }
            }
          }
          return comparisonResult;
        }

        /**
         * Subtracts one digit array from another (arrA - arrB).
         * @param {number[]} arrA - Minuend.
         * @param {number[]} arrB - Subtrahend.
         * @param {number} len - Length to subtract.
         * @param {number} base - Base of the digits.
         */
        function subtractDigits(arrA, arrB, len, base) {
          let borrow = 0;
          while (len--) {
            arrA[len] -= borrow;
            borrow = arrA[len] < arrB[len] ? 1 : 0;
            arrA[len] = (borrow * base) + arrA[len] - arrB[len];
          }
          // Remove leading zeros from the result.
          while (arrA.length > 1 && arrA[0] === 0) {
            arrA.splice(0, 1);
          }
        }

        return function(dividend, divisor, dp, rm, customBase) {
          let dividendSign = dividend.s;
          let divisorSign = divisor.s;
          let dividendDigits = dividend.c;
          let divisorDigits = divisor.c;

          // Handle NaN, Infinity, or zero divisors.
          if (!dividendDigits || !dividendDigits[0] || !divisorDigits || !divisorDigits[0]) {
            // If divisor is 0, result is NaN or Infinity.
            if (!divisorDigits || !divisorDigits[0]) {
              return new BigNumber(dividendSign && divisorSign && (dividendDigits && dividendDigits[0] ? dividendSign / 0 : NaN));
            }
            // If dividend is 0, result is 0.
            return new BigNumber(dividendSign && divisorSign && dividendDigits && !dividendDigits[0] ? 0 * dividendSign : NaN);
          }

          // Determine the sign of the result.
          let resultSign = dividendSign === divisorSign ? 1 : -1;
          let exponentDifference = dividend.e - divisor.e; // Difference in exponents.

          // If customBase is not provided, use INTERNAL_DIGIT_BASE.
          if (!customBase) {
            customBase = INTERNAL_DIGIT_BASE;
            exponentDifference = customFloor(dividend.e / DIGITS_PER_UNIT) - customFloor(divisor.e / DIGITS_PER_UNIT);
            dp = (dp / DIGITS_PER_UNIT) | 0; // Adjust dp to units.
          }

          // Add 2 to dp for extra precision during division to handle rounding correctly.
          let precisionUnits = dp + exponentDifference + 2;

          let quotientDigits = []; // Array to store quotient digits.
          let remainderFlag = false; // Flag to indicate if there's a non-zero remainder.

          // Align the decimal points for division.
          let dividendLen = dividendDigits.length;
          let divisorLen = divisorDigits.length;
          let currentDividendIndex = 0;

          // Pad divisorDigits with zeros to match dividend's length for initial comparison.
          let currentDividendSegment = divisorDigits.slice(); // Current segment of dividend.
          let segmentLen = currentDividendSegment.length;
          for (; segmentLen < divisorLen; currentDividendSegment[segmentLen++] = 0);

          // Get the first digit of the divisor for estimation.
          let divisorFirstDigit = divisorDigits[0];
          // If the first digit is large, increase it by 1 to make the estimate more conservative.
          if (divisorDigits[1] >= customBase / 2) divisorFirstDigit++;

          // Main division loop.
          do {
            let estimatedQuotient = 0;
            // Compare current dividend segment with divisor.
            let comparison = compareDigitArrays(divisorDigits, currentDividendSegment, divisorLen, segmentLen);

            if (comparison < 0) { // If segment < divisor.
              // Estimate quotient digit.
              let dividendSegmentFirstDigit = currentDividendSegment[0];
              if (divisorLen !== segmentLen) { // If segment is shorter.
                dividendSegmentFirstDigit = dividendSegmentFirstDigit * customBase + (currentDividendSegment[1] || 0);
              }
              estimatedQuotient = mathFloor(dividendSegmentFirstDigit / divisorFirstDigit);
              // Ensure estimatedQuotient is not too large (max is customBase - 1).
              if (estimatedQuotient > customBase - 1) estimatedQuotient = customBase - 1;

              // Multiply divisor by estimatedQuotient and compare to segment.
              let multipliedDivisor = multiplyDigitsBySingle(divisorDigits, estimatedQuotient, customBase);
              let multipliedDivisorLen = multipliedDivisor.length;

              // Adjust estimatedQuotient if it's too high.
              while (compareDigitArrays(multipliedDivisor, currentDividendSegment, multipliedDivisorLen, segmentLen) === 1) {
                estimatedQuotient--;
                subtractDigits(multipliedDivisor, divisorLen < multipliedDivisorLen ? [0].concat(divisorDigits) : divisorDigits, multipliedDivisorLen, customBase);
                multipliedDivisorLen = multipliedDivisor.length;
              }

              // Subtract multipliedDivisor from currentDividendSegment.
              subtractDigits(currentDividendSegment, multipliedDivisor, segmentLen, customBase);
              segmentLen = currentDividendSegment.length; // Update segment length after subtraction.

              if (comparison === -1) { // If original segment was smaller, we need to add back.
                // This logic is for when initial segment was smaller, and after subtraction,
                // it might become negative, indicating estimatedQuotient was too small.
                while (compareDigitArrays(divisorDigits, currentDividendSegment, divisorLen, segmentLen) < 1) {
                  estimatedQuotient++;
                  subtractDigits(currentDividendSegment, divisorLen < segmentLen ? [0].concat(divisorDigits) : divisorDigits, segmentLen, customBase);
                  segmentLen = currentDividendSegment.length;
                }
              }
            } else if (comparison === 0) { // If segment == divisor.
              estimatedQuotient++;
              currentDividendSegment = [0]; // Remainder is 0.
              segmentLen = 1;
            }

            quotientDigits.push(estimatedQuotient); // Add estimated quotient digit to result.

            if (currentDividendSegment[0]) {
              currentDividendSegment[segmentLen++] = dividendDigits[currentDividendIndex] || 0; // Bring down next digit.
            } else {
              currentDividendSegment = [dividendDigits[currentDividendIndex] || 0]; // Replace if segment was 0.
              segmentLen = 1;
            }
          } while ((currentDividendIndex++ < dividendLen || currentDividendSegment[0] != null) && precisionUnits-- > 0);

          remainderFlag = currentDividendSegment[0] != null; // True if there's a remaining non-zero segment.

          // Remove leading zeros from quotient.
          while (quotientDigits.length > 1 && quotientDigits[0] === 0) {
            quotientDigits.splice(0, 1);
          }

          // Create the result BigNumber.
          let resultBigNum = new BigNumber(resultSign);
          if (customBase === INTERNAL_DIGIT_BASE) {
            normalizeDigitsAndExponent(resultBigNum, quotientDigits, dp + (resultBigNum.e = exponentDifference * DIGITS_PER_UNIT + quotientDigits.length - 1) + 1, rm, remainderFlag);
          } else {
            resultBigNum.e = exponentDifference;
            resultBigNum.r = +remainderFlag; // Store remainder flag.
          }
          resultBigNum.c = quotientDigits; // Set digits.
          return resultBigNum;
        };
      })();

      BigNumberPrototype.absoluteValue = BigNumberPrototype.abs = function() {
        const newBN = new BigNumber(this);
        if (newBN.s < 0) newBN.s = 1; // Change sign to positive if negative.
        return newBN;
      };

      BigNumberPrototype.comparedTo = function(otherValue, base) {
        return compareBigNumbers(this, new BigNumber(otherValue, base));
      };

      BigNumberPrototype.decimalPlaces = BigNumberPrototype.dp = function(dp, rm) {
        if (dp != null) {
          validateNumberArgument(dp, 0, MAX_PRECISION_LIMIT);
          if (rm == null) rm = currentRoundingMode;
          validateNumberArgument(rm, 0, 8);
          // Round to `dp` decimal places.
          return roundBigNumber(new BigNumber(this), dp + this.e + 1, rm);
        }

        // If dp is null, calculate actual decimal places.
        let digits = this.c;
        if (!digits) return null; // NaN/Infinity.

        let lastDigitUnitIndex = digits.length - 1;
        let actualDecimalPlaces = (lastDigitUnitIndex - customFloor(this.e / DIGITS_PER_UNIT)) * DIGITS_PER_UNIT;
        let lastUnit = digits[lastDigitUnitIndex];

        // Count trailing zeros in the last unit.
        while (lastUnit > 0 && lastUnit % 10 === 0) {
          lastUnit /= 10;
          actualDecimalPlaces--;
        }
        return actualDecimalPlaces < 0 ? 0 : actualDecimalPlaces;
      };

      BigNumberPrototype.dividedBy = BigNumberPrototype.div = function(divisorValue, base) {
        return divideBigNumbers(this, new BigNumber(divisorValue, base), currentDecimalPlaces, currentRoundingMode);
      };

      BigNumberPrototype.dividedToIntegerBy = BigNumberPrototype.idiv = function(divisorValue, base) {
        return divideBigNumbers(this, new BigNumber(divisorValue, base), 0, 1); // Round down to integer.
      };

      BigNumberPrototype.exponentiatedBy = BigNumberPrototype.pow = function(exponentValue, moduloValue) {
        let exponentBN = new BigNumber(exponentValue);
        let baseBN = this;
        let resultBN;
        let isExponentNegative;
        let moduloBN;
        let isBaseIntegerAndModuloInteger;
        let powPrecisionRequired;

        // Validate exponent is an integer.
        if (exponentBN.c && !exponentBN.isInteger()) {
          throw Error(ERROR_PREFIX + "Exponent not an integer: " + toFullString(exponentBN));
        }

        if (moduloValue != null) {
          moduloBN = new BigNumber(moduloValue);
        }

        // Handle special cases: base is 0, 1, or exponent is 0.
        if (!baseBN.c || !baseBN.c[0] || (baseBN.c[0] === 1 && !baseBN.e && baseBN.c.length === 1) || !exponentBN.c || !exponentBN.c[0]) {
          // Calculate result using native Math.pow for these simple cases.
          resultBN = new BigNumber(Math.pow(+toFullString(baseBN), isOddInteger(exponentBN) ? 2 - isOddInteger(exponentBN) : +toFullString(exponentBN)));
          return moduloBN ? resultBN.mod(moduloBN) : resultBN;
        }

        isExponentNegative = exponentBN.s < 0;

        if (moduloBN) {
          // If modulo is provided, check if base and modulo are integers.
          if (moduloBN.c && !moduloBN.c[0]) return new BigNumber(NaN); // Modulo is 0.
          isBaseIntegerAndModuloInteger = !isExponentNegative && baseBN.isInteger() && moduloBN.isInteger();
          if (isBaseIntegerAndModuloInteger) {
            baseBN = baseBN.mod(moduloBN); // Apply modulo to base if integers.
          }
        } else {
          // If no modulo, check for very large exponents that could overflow.
          if (exponentBN.e > 9 && (baseBN.e > 0 || baseBN.e < -1 || (baseBN.e === 0 ? baseBN.c[0] > 1 || (isOddInteger(exponentBN) && baseBN.c[1] >= 24e7) : baseBN.c[0] < 8e13 || (isOddInteger(exponentBN) && baseBN.c[0] <= 9999975e7)))) {
            let infinityResult = baseBN.s < 0 && isOddInteger(exponentBN) ? -0 : 0; // Sign of infinity.
            if (baseBN.e > -1) infinityResult = 1 / infinityResult; // Handle 0^negative_exponent = infinity.
            return new BigNumber(isExponentNegative ? 1 / infinityResult : infinityResult);
          }
          if (currentPowPrecision) {
            powPrecisionRequired = mathFloor(currentPowPrecision / DIGITS_PER_UNIT + 2); // Calculate required precision units.
          }
        }

        let half = new BigNumber(0.5); // Constant for division by 2.
        let actualExponentIsOdd; // Flag for current exponent being odd.
        let exponentAsNumber; // Exponent as a JavaScript number.

        if (isOddInteger(exponentBN)) {
          isExponentNegative && (exponentBN.s = 1); // Make exponent positive for calculation if odd and negative.
          actualExponentIsOdd = isOddInteger(exponentBN);
        } else {
          exponentAsNumber = Math.abs(+toFullString(exponentBN)); // Convert exponent to JS number.
          actualExponentIsOdd = exponentAsNumber % 2; // Check if JS number exponent is odd.
        }

        resultBN = new BigNumber(defaultBigNumberInstance); // Initialize result to 1.

        for (;;) {
          if (actualExponentIsOdd) {
            if (!(resultBN = resultBN.times(baseBN)).c) break; // If result becomes NaN.
            if (powPrecisionRequired) {
              if (resultBN.c.length > powPrecisionRequired) resultBN.c.length = powPrecisionRequired; // Truncate for precision.
            } else if (isBaseIntegerAndModuloInteger) {
              resultBN = resultBN.mod(moduloBN); // Apply modulo.
            }
          }

          if (exponentAsNumber) {
            exponentAsNumber = mathFloor(exponentAsNumber / 2); // Divide exponent by 2.
            if (exponentAsNumber === 0) break;
            actualExponentIsOdd = exponentAsNumber % 2; // Check new exponent for oddness.
          } else {
            // If exponent is a BigNumber, divide it by 2.
            exponentBN = exponentBN.times(half);
            roundBigNumber(exponentBN, exponentBN.e + 1, 1); // Round down.
            if (exponentBN.e > 14) { // If exponent is still very large.
              actualExponentIsOdd = isOddInteger(exponentBN);
            } else {
              exponentAsNumber = +toFullString(exponentBN); // Convert to JS number.
              if (exponentAsNumber === 0) break;
              actualExponentIsOdd = exponentAsNumber % 2;
            }
          }
          baseBN = baseBN.times(baseBN); // Square the base.
          if (powPrecisionRequired) {
            if (baseBN.c && baseBN.c.length > powPrecisionRequired) baseBN.c.length = powPrecisionRequired;
          } else if (isBaseIntegerAndModuloInteger) {
            baseBN = baseBN.mod(moduloBN);
          }
        }

        return isBaseIntegerAndModuloInteger ? resultBN : (isExponentNegative ? defaultBigNumberInstance.div(resultBN) : resultBN);
      };

      BigNumberPrototype.integerValue = function(roundingMode) {
        const newBN = new BigNumber(this);
        if (roundingMode == null) roundingMode = currentRoundingMode;
        validateNumberArgument(roundingMode, 0, 8);
        return roundBigNumber(newBN, newBN.e + 1, roundingMode);
      };

      BigNumberPrototype.isEqualTo = BigNumberPrototype.eq = function(otherValue, base) {
        return compareBigNumbers(this, new BigNumber(otherValue, base)) === 0;
      };

      BigNumberPrototype.isFinite = function() {
        return !!this.c; // True if digits array exists (not NaN/Infinity).
      };

      BigNumberPrototype.isGreaterThan = BigNumberPrototype.gt = function(otherValue, base) {
        return compareBigNumbers(this, new BigNumber(otherValue, base)) > 0;
      };

      BigNumberPrototype.isGreaterThanOrEqualTo = BigNumberPrototype.gte = function(otherValue, base) {
        const comparison = compareBigNumbers(this, new BigNumber(otherValue, base));
        return comparison === 1 || comparison === 0;
      };

      BigNumberPrototype.isInteger = function() {
        // True if digits exist and the exponent is such that all digits are before the decimal point.
        return !!this.c && customFloor(this.e / DIGITS_PER_UNIT) > this.c.length - 2;
      };

      BigNumberPrototype.isLessThan = BigNumberPrototype.lt = function(otherValue, base) {
        return compareBigNumbers(this, new BigNumber(otherValue, base)) < 0;
      };

      BigNumberPrototype.isLessThanOrEqualTo = BigNumberPrototype.lte = function(otherValue, base) {
        const comparison = compareBigNumbers(this, new BigNumber(otherValue, base));
        return comparison === -1 || comparison === 0;
      };

      BigNumberPrototype.isNaN = function() {
        return !this.s; // True if sign is null (NaN).
      };

      BigNumberPrototype.isNegative = function() {
        return this.s < 0;
      };

      BigNumberPrototype.isPositive = function() {
        return this.s > 0;
      };

      BigNumberPrototype.isZero = function() {
        return !!this.c && this.c[0] === 0;
      };

      BigNumberPrototype.minus = function(subtrahendValue, base) {
        let minuend = this;
        let subtrahend = new BigNumber(subtrahendValue, base);
        let minuendSign = minuend.s;
        let subtrahendSign = subtrahend.s;

        // Handle NaN/Infinity.
        if (!minuendSign || !subtrahendSign) return new BigNumber(NaN);

        // If signs are different, convert to addition.
        if (minuendSign !== subtrahendSign) {
          subtrahend.s = -subtrahendSign; // Flip sign of subtrahend.
          return minuend.plus(subtrahend);
        }

        let minuendExponentUnits = customFloor(minuend.e / DIGITS_PER_UNIT);
        let subtrahendExponentUnits = customFloor(subtrahend.e / DIGITS_PER_UNIT);
        let minuendDigits = minuend.c;
        let subtrahendDigits = subtrahend.c;

        // Handle cases where one or both numbers are 0.
        if (!minuendDigits || !subtrahendDigits) {
          if (!minuendDigits) {
            subtrahend.s = -subtrahendSign; // Flip sign of subtrahend for consistent NaN handling.
            return subtrahend;
          }
          return minuend;
        }
        if (!minuendDigits[0] || !subtrahendDigits[0]) {
          if (!subtrahendDigits[0]) return minuend;
          subtrahend.s = -subtrahendSign;
          return subtrahend;
        }

        minuendDigits = minuendDigits.slice(); // Work on a copy.

        let exponentDifference = minuendExponentUnits - subtrahendExponentUnits;
        if (exponentDifference !== 0) {
          // Align decimal points by padding with zeros.
          let longerArray, shorterArray;
          if (exponentDifference < 0) {
            exponentDifference = -exponentDifference;
            longerArray = minuendDigits;
            shorterArray = subtrahendDigits;
            subtrahendExponentUnits = minuendExponentUnits; // Align subtrahend's unit exponent to minuend's.
          } else {
            longerArray = subtrahendDigits;
            shorterArray = minuendDigits;
          }
          longerArray.reverse();
          for (; exponentDifference--; longerArray.push(0));
          longerArray.reverse();
        } else {
          // If exponents are the same, determine which number is larger.
          let minLength = Math.min(minuendDigits.length, subtrahendDigits.length);
          let minuendIsSmaller = false;
          for (let i = 0; i < minLength; i++) {
            if (minuendDigits[i] !== subtrahendDigits[i]) {
              minuendIsSmaller = minuendDigits[i] < subtrahendDigits[i];
              break;
            }
          }
          // If minuend is smaller, swap them and flip the sign of the result.
          if (minuendIsSmaller) {
            let temp = minuendDigits;
            minuendDigits = subtrahendDigits;
            subtrahendDigits = temp;
            subtrahend.s = -subtrahend.s; // Flip the sign of the result.
          }
        }

        // Pad the shorter array with leading zeros if necessary.
        let subtrahendLen = subtrahendDigits.length;
        let minuendLen = minuendDigits.length;
        if (subtrahendLen > minuendLen) {
          for (; subtrahendLen > minuendLen; minuendDigits[minuendLen++] = 0);
        }

        // Perform digit-by-digit subtraction with borrowing.
        let borrow = 0;
        let base = INTERNAL_DIGIT_BASE; // 1e14
        while (minuendLen > 0) {
          minuendLen--;
          if (minuendDigits[minuendLen] < subtrahendDigits[minuendLen]) {
            let currentIdx = minuendLen;
            while (currentIdx > 0 && minuendDigits[--currentIdx] === 0) {
              minuendDigits[currentIdx] = base - 1; // Borrow from higher units.
            }
            minuendDigits[currentIdx]--; // Decrement the first non-zero unit.
            minuendDigits[minuendLen] += base; // Add base to current unit.
          }
          minuendDigits[minuendLen] -= subtrahendDigits[minuendLen];
        }

        // Remove leading zeros from the result.
        while (minuendDigits.length > 1 && minuendDigits[0] === 0) {
          minuendDigits.splice(0, 1);
          minuendExponentUnits--; // Adjust unit exponent.
        }

        // Normalize the result BigNumber.
        if (minuendDigits[0]) {
          normalizeDigitsAndExponent(subtrahend, minuendDigits, minuendExponentUnits);
        } else {
          subtrahend.s = currentRoundingMode === 3 ? -1 : 1; // Set sign for 0 based on rounding mode.
          subtrahend.c = [subtrahend.e = 0];
        }
        return subtrahend;
      };

      BigNumberPrototype.modulo = BigNumberPrototype.mod = function(moduloValue, base) {
        let dividend = this;
        let divisor = new BigNumber(moduloValue, base);
        let resultQuotient;
        let resultRemainder;

        // Handle NaN/Infinity or zero divisor.
        if (!dividend.c || !divisor.s || (divisor.c && !divisor.c[0])) return new BigNumber(NaN);
        // If dividend is 0, result is 0.
        if (!divisor.c || (dividend.c && !dividend.c[0])) return new BigNumber(dividend);

        if (currentModuloMode === 9) { // EUCLID mode.
          // For Euclidean modulo, always use positive divisor for division.
          let originalDivisorSign = divisor.s;
          divisor.s = 1;
          resultQuotient = divideBigNumbers(dividend, divisor, 0, 3); // Round quotient towards -Infinity (floor).
          divisor.s = originalDivisorSign; // Restore divisor sign.
          resultRemainder = dividend.minus(resultQuotient.times(divisor));
          resultRemainder.s *= originalDivisorSign; // Remainder takes sign of original divisor.
        } else {
          resultQuotient = divideBigNumbers(dividend, divisor, 0, currentModuloMode); // Use configured rounding mode.
          resultRemainder = dividend.minus(resultQuotient.times(divisor));
          // If remainder is 0 and modulo mode is 1 (ROUND_DOWN), ensure sign matches dividend.
          if (!resultRemainder.c[0] && currentModuloMode === 1) resultRemainder.s = dividend.s;
        }
        return resultRemainder;
      };

      BigNumberPrototype.multipliedBy = BigNumberPrototype.times = function(multiplierValue, base) {
        let multiplicand = this;
        let multiplier = new BigNumber(multiplierValue, base);
        let multiplicandDigits = multiplicand.c;
        let multiplierDigits = multiplier.c;
        let resultExponentUnit;
        let multiplicandLen, multiplierLen;
        let tempResultDigits;
        let resultIndex;
        let currentDigitProduct;
        let carry;
        let lowPart, highPart;
        let firstMultiplierDigit, secondMultiplierDigit, firstMultiplicandDigit;

        // Handle NaN/Infinity or zero operands.
        if (!(multiplicandDigits && multiplierDigits && multiplicandDigits[0] && multiplierDigits[0])) {
          let result = new BigNumber(multiplicand); // Copy multiplicand.
          result.s *= multiplier.s; // Set result sign.
          if (!multiplicandDigits || !multiplierDigits || (multiplicandDigits[0] === 0 && multiplierDigits[0] === 0)) {
            result.c = [0];
            result.e = 0;
          } else {
            result.c = result.e = null; // Set to NaN or Infinity.
          }
          return result;
        }

        // Calculate the exponent for the result.
        resultExponentUnit = customFloor(multiplicand.e / DIGITS_PER_UNIT) + customFloor(multiplier.e / DIGITS_PER_UNIT);
        multiplier.s *= multiplicand.s; // Set the sign of the result.

        // Ensure multiplicand is the longer array for optimization.
        multiplicandLen = multiplicandDigits.length;
        multiplierLen = multiplierDigits.length;
        if (multiplicandLen < multiplierLen) {
          let temp = multiplicandDigits;
          multiplicandDigits = multiplierDigits;
          multiplierDigits = temp;
          temp = multiplicandLen;
          multiplicandLen = multiplierLen;
          multiplierLen = temp;
        }

        // Initialize result digits array with zeros. Max possible length is sum of lengths.
        tempResultDigits = [];
        for (resultIndex = multiplicandLen + multiplierLen; resultIndex--; tempResultDigits.push(0));

        const base = INTERNAL_DIGIT_BASE; // 1e14
        const halfBase = ARITHMETIC_BASE_HALF; // 1e7

        // Perform multiplication using schoolbook algorithm (convolution).
        for (let i = multiplierLen; --i >= 0;) {
          carry = 0;
          firstMultiplierDigit = multiplierDigits[i] % halfBase; // Low part of multiplier digit.
          secondMultiplierDigit = multiplierDigits[i] / halfBase | 0; // High part of multiplier digit.

          for (let j = i + (firstMultiplicandDigit = multiplicandLen); j > i;) {
            currentDigitProduct = tempResultDigits[j] + carry; // Add previous carry.

            // Multiply multiplicand digit by multiplier digit, split into low and high parts.
            lowPart = firstMultiplierDigit * (multiplicandDigits[--firstMultiplicandDigit] % halfBase);
            highPart = secondMultiplierDigit * (multiplicandDigits[firstMultiplicandDigit] % halfBase);
            let midPart1 = (multiplicandDigits[firstMultiplicandDigit] / halfBase | 0) * firstMultiplierDigit;
            let midPart2 = (multiplicandDigits[firstMultiplicandDigit] / halfBase | 0) * secondMultiplierDigit;

            currentDigitProduct += lowPart + (highPart + midPart1) % halfBase * halfBase + (highPart + midPart1) / halfBase | 0 + midPart2;

            carry = currentDigitProduct / base | 0; // New carry.
            tempResultDigits[j--] = currentDigitProduct % base; // New digit.
          }
          tempResultDigits[j] = carry; // Store final carry.
        }

        // Adjust exponent if there was a carry from the highest position.
        if (tempResultDigits[0]) {
          resultExponentUnit++;
        } else {
          tempResultDigits.splice(0, 1); // Remove leading zero.
        }

        // Normalize the result BigNumber.
        return normalizeDigitsAndExponent(multiplier, tempResultDigits, resultExponentUnit);
      };

      BigNumberPrototype.negated = function() {
        const newBN = new BigNumber(this);
        newBN.s = -newBN.s || null; // Flip sign, or set to null if NaN.
        return newBN;
      };

      BigNumberPrototype.plus = function(addendValue, base) {
        let augend = this;
        let addend = new BigNumber(addendValue, base);
        let augendSign = augend.s;
        let addendSign = addend.s;

        // Handle NaN/Infinity.
        if (!augendSign || !addendSign) return new BigNumber(NaN);

        // If signs are different, convert to subtraction.
        if (augendSign !== addendSign) {
          addend.s = -addendSign; // Flip sign of addend.
          return augend.minus(addend);
        }

        let augendExponentUnits = customFloor(augend.e / DIGITS_PER_UNIT);
        let addendExponentUnits = customFloor(addend.e / DIGITS_PER_UNIT);
        let augendDigits = augend.c;
        let addendDigits = addend.c;

        // Handle cases where one or both numbers are 0.
        if (!augendDigits || !addendDigits) {
          if (!augendDigits) return new BigNumber(augendSign / 0); // Infinity.
          return new BigNumber(addendSign / 0); // Infinity.
        }
        if (!augendDigits[0] || !addendDigits[0]) {
          return addendDigits[0] ? addend : new BigNumber(augendDigits[0] ? augend : 0 * augendSign);
        }

        augendDigits = augendDigits.slice(); // Work on a copy.

        let exponentDifference = augendExponentUnits - addendExponentUnits;
        if (exponentDifference !== 0) {
          // Align decimal points by padding with zeros.
          let shorterArray;
          if (exponentDifference > 0) {
            addendExponentUnits = augendExponentUnits; // Align addend's unit exponent to augend's.
            shorterArray = addendDigits;
          } else {
            exponentDifference = -exponentDifference;
            shorterArray = augendDigits;
          }
          shorterArray.reverse();
          for (; exponentDifference--; shorterArray.push(0));
          shorterArray.reverse();
        }

        // Ensure arrays have same length by padding shorter one with zeros.
        let augendLen = augendDigits.length;
        let addendLen = addendDigits.length;
        if (augendLen < addendLen) {
          let temp = addendDigits;
          addendDigits = augendDigits;
          augendDigits = temp;
          let tempLen = addendLen;
          addendLen = augendLen;
          augendLen = tempLen;
        }

        // Perform digit-by-digit addition with carrying.
        let carry = 0;
        let base = INTERNAL_DIGIT_BASE; // 1e14
        while (augendLen > 0) {
          augendLen--;
          carry = (augendDigits[augendLen] = augendDigits[augendLen] + (addendDigits[augendLen] || 0) + carry) / base | 0;
          augendDigits[augendLen] %= base;
        }

        // If there's a final carry, prepend it and increment unit exponent.
        if (carry) {
          augendDigits = [carry].concat(augendDigits);
          addendExponentUnits++;
        }

        // Normalize the result BigNumber.
        return normalizeDigitsAndExponent(addend, augendDigits, addendExponentUnits);
      };

      BigNumberPrototype.precision = BigNumberPrototype.sd = function(significantDigits, rm) {
        if (significantDigits != null && significantDigits !== !!significantDigits) {
          validateNumberArgument(significantDigits, 1, MAX_PRECISION_LIMIT);
          if (rm == null) rm = currentRoundingMode;
          validateNumberArgument(rm, 0, 8);
          return roundBigNumber(new BigNumber(this), significantDigits, rm);
        }

        // If significantDigits is null, return actual significant digits.
        let digits = this.c;
        if (!digits) return null; // NaN/Infinity.

        let lastDigitUnitIndex = digits.length - 1;
        let actualSignificantDigits = lastDigitUnitIndex * DIGITS_PER_UNIT + 1;
        let lastUnit = digits[lastDigitUnitIndex];

        // Count trailing zeros in the last unit.
        while (lastUnit > 0 && lastUnit % 10 === 0) {
          lastUnit /= 10;
          actualSignificantDigits--;
        }

        let firstUnit = digits[0];
        // Count leading zeros in the first unit.
        while (firstUnit > 0 && firstUnit >= 10) {
          firstUnit /= 10;
          actualSignificantDigits++;
        }

        // If significantDigits is true, ensure precision is at least exponent + 1.
        if (significantDigits && this.e + 1 > actualSignificantDigits) {
          actualSignificantDigits = this.e + 1;
        }
        return actualSignificantDigits;
      };

      BigNumberPrototype.shiftedBy = function(shiftAmount) {
        validateNumberArgument(shiftAmount, -MAX_JS_SAFE_INTEGER, MAX_JS_SAFE_INTEGER);
        return this.times("1e" + shiftAmount); // Shift is equivalent to multiplying by 10^shiftAmount.
      };

      BigNumberPrototype.squareRoot = BigNumberPrototype.sqrt = function() {
        let bn = this;
        let digits = bn.c;
        let sign = bn.s;
        let exponent = bn.e;
        let resultBN;
        let tempPrecision = currentDecimalPlaces + 4; // Add extra precision for sqrt.
        let half = new BigNumber("0.5");

        // Handle negative numbers (NaN), NaN, Infinity, or zero.
        if (sign !== 1 || !digits || !digits[0]) {
          return new BigNumber(!sign || sign < 0 && (!digits || digits[0]) ? NaN : digits ? bn : 1 / 0);
        }

        // If 0, return 0.
        if (digits[0] === 0) return new BigNumber(0);

        // Estimate initial guess using Math.sqrt.
        let estimate = Math.sqrt(+toFullString(bn));
        if (estimate === 0 || estimate === 1 / 0) {
          // If native sqrt fails, manually create an estimate.
          let digitsStr = digitsArrayToString(digits);
          // Ensure even number of digits for sqrt.
          if ((digitsStr.length + exponent) % 2 === 0) digitsStr += "0";
          estimate = Math.sqrt(+digitsStr); // Take sqrt of significant digits.
          exponent = customFloor((exponent + 1) / 2) - (exponent < 0 || exponent % 2); // Adjust exponent.
          resultBN = new BigNumber(estimate === 1 / 0 ? "1e" + exponent : (estimate = estimate.toExponential()).slice(0, estimate.indexOf("e") + 1) + exponent);
        } else {
          resultBN = new BigNumber(estimate + "");
        }

        // If initial estimate is zero (e.g., very small number), return zero.
        if (!resultBN.c[0]) return new BigNumber(0);

        let previousResult;
        let checkPrecision = (resultBN.e + tempPrecision) < 3 ? 0 : (resultBN.e + tempPrecision); // Precision for comparison.
        let equalDigitsString;
        let roundUpFlag;

        // Newton's method for square root.
        for (;;) {
          previousResult = resultBN;
          // next_x = 0.5 * (x + N/x)
          resultBN = half.times(previousResult.plus(divideBigNumbers(bn, previousResult, tempPrecision, 1)));

          // Compare string representations to check for convergence.
          if (digitsArrayToString(previousResult.c).slice(0, checkPrecision) === (equalDigitsString = digitsArrayToString(resultBN.c)).slice(0, checkPrecision)) {
            // If converged, check if rounding caused an issue.
            if (resultBN.e < previousResult.e) checkPrecision--;
            if ("9999" !== (equalDigitsString = equalDigitsString.slice(checkPrecision - 3, checkPrecision + 1)) && (roundUpFlag || "4999" !== equalDigitsString)) {
              // If not "9999" or "4999", then converged.
              +equalDigitsString && (+equalDigitsString.slice(1) || "5" !== equalDigitsString.charAt(0)) || (roundBigNumber(resultBN, resultBN.e + currentDecimalPlaces + 2, 1), roundUpFlag = !resultBN.times(resultBN).eq(bn));
              break;
            }
            if (!roundUpFlag && (roundBigNumber(previousResult, previousResult.e + currentDecimalPlaces + 2, 0), previousResult.times(previousResult).eq(bn))) {
              resultBN = previousResult;
              break;
            }
            tempPrecision += 4;
            checkPrecision += 4;
            roundUpFlag = 1;
          }
        }
        return roundBigNumber(resultBN, resultBN.e + currentDecimalPlaces + 1, currentRoundingMode, roundUpFlag);
      };

      BigNumberPrototype.toExponential = function(dp, rm) {
        if (dp != null) {
          validateNumberArgument(dp, 0, MAX_PRECISION_LIMIT);
          dp++; // Adjust dp for exponential notation (significant digits).
        }
        return formatBigNumberString(this, dp, rm, 1);
      };

      BigNumberPrototype.toFixed = function(dp, rm) {
        if (dp != null) {
          validateNumberArgument(dp, 0, MAX_PRECISION_LIMIT);
          dp = dp + this.e + 1; // Adjust dp for fixed decimal places.
        }
        return formatBigNumberString(this, dp, rm);
      };

      BigNumberPrototype.toFormat = function(dp, rm, formatConfig) {
        let formattedString = this; // Use `formattedString` to hold the BigNumber instance.
        if (formatConfig == null) {
          if (dp != null && rm && typeof rm === "object") {
            formatConfig = rm;
            rm = null;
          } else if (dp && typeof dp === "object") {
            formatConfig = dp;
            dp = rm = null;
          } else {
            formatConfig = currentFormatConfig; // Use global format config.
          }
        } else if (typeof formatConfig !== "object") {
          throw Error(ERROR_PREFIX + "Argument not an object: " + formatConfig);
        }

        formattedString = formattedString.toFixed(dp, rm); // Get the number string.

        if (this.c) { // If not NaN/Infinity.
          let parts = formattedString.split(".");
          let groupSize = +formatConfig.groupSize;
          let secondaryGroupSize = +formatConfig.secondaryGroupSize;
          let groupSeparator = formatConfig.groupSeparator || "";
          let integerPart = parts[0];
          let fractionalPart = parts[1];
          let isNegative = this.s < 0;
          let absoluteIntegerPart = isNegative ? integerPart.slice(1) : integerPart;
          let integerLength = absoluteIntegerPart.length;

          // Apply secondary grouping if configured.
          if (secondaryGroupSize && integerLength > 0) {
            let temp = groupSize;
            groupSize = secondaryGroupSize;
            secondaryGroupSize = temp; // Swap group sizes.
            integerLength -= secondaryGroupSize; // Adjust length.
          }

          // Apply primary grouping.
          if (groupSize > 0 && integerLength > 0) {
            let firstGroupLength = integerLength % groupSize || groupSize;
            integerPart = absoluteIntegerPart.substr(0, firstGroupLength);
            for (let i = firstGroupLength; i < integerLength; i += groupSize) {
              integerPart += groupSeparator + absoluteIntegerPart.substr(i, groupSize);
            }
            if (secondaryGroupSize > 0) {
              integerPart += groupSeparator + absoluteIntegerPart.slice(integerLength);
            }
            if (isNegative) integerPart = "-" + integerPart;
          }

          // Reconstruct the formatted string.
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
        let bn = this;
        let numeratorBN, denominatorBN;
        let integerPartBN, tempNumBN, tempDenBN;
        let stringValue = digitsArrayToString(bn.c);
        let exponentOffset = stringValue.length - bn.e - 1; // Exponent relative to 1 (e.g., 0.123 -> expOffset 3)

        // Validate maxDenominator.
        if (maxDenominator != null && (!(tempNumBN = new BigNumber(maxDenominator)).isInteger() && (tempNumBN.c || tempNumBN.s !== 1) || tempNumBN.lt(defaultBigNumberInstance))) {
          throw Error(ERROR_PREFIX + "Argument " + (tempNumBN.isInteger() ? "out of range: " : "not an integer: ") + toFullString(tempNumBN));
        }

        if (!bn.c) return new BigNumber(bn); // If NaN/Infinity, return as is.

        // Initialize numerator and denominator.
        numeratorBN = new BigNumber(defaultBigNumberInstance); // Represents 1.
        denominatorBN = new BigNumber(defaultBigNumberInstance); // Represents 1.
        integerPartBN = new BigNumber(defaultBigNumberInstance); // For continued fraction.
        tempNumBN = new BigNumber(defaultBigNumberInstance); // Temporary numerator.
        tempDenBN = new BigNumber(defaultBigNumberInstance); // Temporary denominator.

        // Calculate initial fraction (bn converted to `numeratorBN / denominatorBN`).
        numeratorBN.e = exponentOffset;
        numeratorBN.c[0] = POWERS_OF_TEN_ARRAY[(exponentOffset % DIGITS_PER_UNIT) < 0 ? DIGITS_PER_UNIT + (exponentOffset % DIGITS_PER_UNIT) : (exponentOffset % DIGITS_PER_UNIT)];

        // If maxDenominator is not provided or is larger than the initial denominator, use it.
        maxDenominator = !maxDenominator || tempNumBN.comparedTo(numeratorBN) > 0 ?
          (exponentOffset > 0 ? numeratorBN : denominatorBN) :
          tempNumBN;

        let originalRangeUpper = currentRangeUpper;
        currentRangeUpper = 1 / 0; // Temporarily set range to infinity for intermediate calculations.

        let bnAsBigNum = new BigNumber(stringValue); // Original number as BigNumber.
        tempDenBN.c[0] = 0; // Initialize tempDenBN to 0.

        // Continued fraction algorithm.
        let quotientBN;
        while (true) {
          quotientBN = divideBigNumbers(bnAsBigNum, numeratorBN, 0, 1); // Integer part of division.

          let nextNumBN = denominatorBN.plus(quotientBN.times(tempDenBN));
          if (nextNumBN.comparedTo(maxDenominator) === 1) break; // Stop if denominator exceeds limit.

          denominatorBN = tempDenBN;
          tempDenBN = nextNumBN;

          numeratorBN = bnAsBigNum.minus(quotientBN.times(tempNumBN));
          bnAsBigNum = tempNumBN;
          tempNumBN = numeratorBN;
        }

        // Restore original range.
        currentRangeUpper = originalRangeUpper;

        // Compare two candidate fractions for closeness to original number.
        // [numeratorBN, denominatorBN] and [tempNumBN, tempDenBN]
        let fractionA = divideBigNumbers(denominatorBN, tempDenBN, exponentOffset * 2, currentRoundingMode).minus(bn).abs();
        let fractionB = divideBigNumbers(tempNumBN, denominatorBN, exponentOffset * 2, currentRoundingMode).minus(bn).abs();

        let resultFraction = fractionA.comparedTo(fractionB) < 1 ?
          [denominatorBN, tempDenBN] : // [numerator, denominator] from previous step
          [tempNumBN, denominatorBN]; // [numerator, denominator] from current step

        // Set the sign of the result.
        resultFraction[0].s = resultFraction[1].s = bn.s;
        return resultFraction;
      };

      BigNumberPrototype.toNumber = function() {
        return +toFullString(this); // Convert to JavaScript number primitive.
      };

      BigNumberPrototype.toPrecision = function(significantDigits, rm) {
        if (significantDigits != null) {
          validateNumberArgument(significantDigits, 1, MAX_PRECISION_LIMIT);
        }
        return formatBigNumberString(this, significantDigits, rm, 2);
      };

      BigNumberPrototype.toString = function(base) {
        let bn = this;
        let sign = bn.s;
        let exponent = bn.e;
        let resultString;

        if (exponent === null) { // Handle NaN/Infinity.
          resultString = sign ? (sign < 0 ? "-Infinity" : "Infinity") : "NaN";
        } else {
          if (base == null) {
            // Default toString: use scientific or fixed notation based on config.
            resultString = exponent <= currentExponentialAtLower || exponent >= currentExponentialAtUpper ?
              toScientificNotation(digitsArrayToString(bn.c), exponent) :
              formatWithDecimal(digitsArrayToString(bn.c), exponent, "0");
          } else {
            // Convert to a custom base.
            validateNumberArgument(base, 2, currentAlphabet.length, "Base");
            if (base === 10) {
              // If base is 10, format as fixed decimal string.
              resultString = formatWithDecimal(digitsArrayToString(roundBigNumber(new BigNumber(bn), currentDecimalPlaces + exponent + 1, currentRoundingMode).c), bn.e, "0");
            } else {
              // Convert to custom base using the helper function.
              resultString = convertToBase10(formatWithDecimal(digitsArrayToString(bn.c), exponent, "0"), 10, base, sign, true); // sign is true here to indicate alphabet map.
            }
          }
          if (sign < 0 && bn.c[0]) { // Prepend minus sign if negative and not zero.
            resultString = "-" + resultString;
          }
        }
        return resultString;
      };

      BigNumberPrototype.valueOf = BigNumberPrototype.toJSON = function() {
        return toFullString(this); // Return full string representation for JSON.
      };

      BigNumberPrototype._isBigNumber = true; // Internal flag to identify BigNumber instances.

      // Apply initial configuration if provided.
      if (initialConfig != null) BigNumber.set(initialConfig);

      BigNumberConstructor = BigNumber; // Assign to the outer scope variable.
    })(this); // Pass global context.

    BigNumberConstructor.default = BigNumberConstructor.BigNumber = BigNumberConstructor; // Export as default and named.

    // Handle module export for different environments (Node.js, browser, AMD).
    if (typeof exports === 'object' && typeof module !== 'undefined') {
      module.exports = BigNumberConstructor; // Node.js style.
    }
  },

  // Module 3: File System (Node.js built-in)
  function(module, exports) {
    // This module is a placeholder for Node.js 'fs' module.
    // In a browser environment, this would likely be an empty object or a mock.
    // For Node.js, it simply requires the built-in 'fs' module.
    module.exports = require("fs");
  }
]));