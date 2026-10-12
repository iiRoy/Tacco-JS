let moduleLoader = function(moduleDefinitions, moduleCache, entryPoints, exportName) {
  // Store references to global module loaders for fallback
  let currentError = null;
  const parentModuleLoader = typeof parcelRequire === "function" && parcelRequire;
  const nodeNativeRequire = typeof require === "function" && require;

  /**
   * Internal function to load a module by its ID.
   * @param {string} moduleId - The ID of the module to load.
   * @param {boolean} [isRecursiveCall=false] - Flag to prevent infinite recursion.
   * @returns {object} The exports of the loaded module.
   * @throws {Error} If the module cannot be found.
   */
  function loadModule(moduleId, isRecursiveCall) {
    // If module is already in cache, return its exports
    if (moduleCache[moduleId]) {
      return moduleCache[moduleId].exports;
    }

    // If module definition doesn't exist, try external loaders
    if (!moduleDefinitions[moduleId]) {
      // If not a recursive call and parent loader exists, try it
      if (!isRecursiveCall && parentModuleLoader) {
        return parentModuleLoader(moduleId, true);
      }
      // If node's require is available and module ID is a string, try it
      if (nodeNativeRequire && typeof moduleId === "string") {
        return nodeNativeRequire(moduleId);
      }
      // If all else fails, throw a module not found error
      const notFoundError = new Error("Cannot locate module: '" + moduleId + "'");
      notFoundError.code = "MODULE_NOT_FOUND";
      throw notFoundError;
    }

    // Prepare resolver for relative paths within the module
    const moduleResolver = function(requestPath) {
      return moduleDefinitions[moduleId][1][requestPath] || requestPath;
    };
    moduleResolver.cache = {}; // Placeholder, not actively used by Parcel in this context

    // Create a new module instance and add to cache
    const moduleInstance = moduleCache[moduleId] = new loadModule.Module(moduleId);
    // Execute the module's definition function
    moduleDefinitions[moduleId][0].call(moduleInstance.exports, moduleResolver, moduleInstance, moduleInstance.exports, this);

    return moduleCache[moduleId].exports;
  }

  // Mark this loader as a Parcel-specific instance
  loadModule.isParcelRequire = true;

  // Define the Module constructor
  loadModule.Module = function(id) {
    this.id = id;
    this.bundle = loadModule;
    this.exports = {};
  };

  // Expose module definitions and cache for debugging/inspection
  loadModule.modules = moduleDefinitions;
  loadModule.cache = moduleCache;
  loadModule.parent = parentModuleLoader; // Reference to the parent loader

  // Function to register a new module definition
  loadModule.register = function(id, moduleExports) {
    moduleDefinitions[id] = [function(localRequire, moduleRef) {
      moduleRef.exports = moduleExports;
    }, {}];
  };

  // Process all entry points
  for (let entryIndex = 0; entryIndex < entryPoints.length; entryIndex++) {
    try {
      loadModule(entryPoints[entryIndex]);
    } catch (err) {
      // Store the first error encountered, but continue processing other entries
      currentError = currentError || err;
    }
  }

  // If there are entry points, ensure the last one's exports are returned
  if (entryPoints.length > 0) {
    const lastEntryExport = loadModule(entryPoints[entryPoints.length - 1]);
    // Handle different module export environments
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = lastEntryExport;
    } else if (typeof define === "function" && define.amd) {
      define(function() {
        return lastEntryExport;
      });
    } else if (exportName) {
      this[exportName] = lastEntryExport;
    }
  }

  // If an error occurred during entry point loading, re-throw it
  if (currentError) {
    throw currentError;
  }

  // Overwrite the global parcelRequire with this instance
  parcelRequire = loadModule;

  return loadModule;
}({
  "9xaU": [function(localRequire, moduleRef, moduleExports) {
    /*
     * This file implements a big-integer library, handling arbitrary precision integers.
     * It supports various arithmetic operations, conversions, and comparisons.
     * The implementation uses arrays of numbers to represent large integers,
     * where each element in the array is a 'digit' in a large base (e.g., 10^7).
     * It also includes optimizations for small numbers and native BigInt support where available.
     */

    let bigIntFactory = (function(initialValue) {
      "use strict";

      // --- Constants and Global Settings ---
      const BASE_MAGNITUDE = 1e7; // Each array element represents a 'digit' up to 10 million
      const DIGIT_GROUP_SIZE = 7; // Number of decimal digits in BASE_MAGNITUDE
      const MAX_SAFE_JS_INT = 9007199254740992; // 2^53 - maximum safe integer in JavaScript
      const MAX_SAFE_JS_INT_PARTS = convertJsNumToParts(MAX_SAFE_JS_INT); // MAX_SAFE_JS_INT broken into BASE_MAGNITUDE parts
      const DEFAULT_RADIX_CHARS = "0123456789abcdefghijklmnopqrstuvwxyz"; // Chars for base conversions
      const HAS_NATIVE_BIGINT = typeof BigInt === "function"; // Check for native BigInt support

      // --- Main BigInt Creation Function ---
      /**
       * Creates a new BigInt instance.
       * @param {number|string|BigInt|BigIntObject} inputValue - The value to convert.
       * @param {number} [inputRadix=10] - The radix of the input string.
       * @param {string} [customRadixChars] - Custom characters for the radix.
       * @param {boolean} [caseSensitive=false] - Whether radix parsing is case-sensitive.
       * @returns {BigIntObject} A BigInt instance (LargeNumber, SmallNumber, or NativeBigInt).
       */
      function createBigInt(inputValue, inputRadix, customRadixChars, caseSensitive) {
        // Handle undefined input, returning zero
        if (inputValue === undefined) {
          return createBigInt._cachedConstants[0];
        }
        // If radix is 10 (or implicit) and no custom chars, use optimized decimal parser
        if (inputRadix !== undefined && (10 !== +inputRadix || customRadixChars)) {
          return _parseBaseString(inputValue, inputRadix, customRadixChars, caseSensitive);
        }
        // Otherwise, use general normalization for various input types
        return _normalizeInputToBigInt(inputValue);
      }

      // --- BigInt Internal Classes ---

      /**
       * Represents a large arbitrary-precision integer.
       * Uses an array of digits for values exceeding MAX_SAFE_JS_INT.
       * @param {number[]} digits - Array of number parts.
       * @param {boolean} isNegative - True if the number is negative.
       */
      function LargeNumber(digits, isNegative) {
        this.value = digits;
        this.sign = isNegative;
        this.isSmall = false; // Always false for LargeNumber
      }

      /**
       * Represents a small integer that fits within JavaScript's safe integer range.
       * @param {number} numValue - The numeric value.
       */
      function SmallNumber(numValue) {
        this.value = numValue;
        this.sign = numValue < 0;
        this.isSmall = true; // Always true for SmallNumber
      }

      /**
       * Represents an integer using JavaScript's native BigInt type.
       * Only used if HAS_NATIVE_BIGINT is true.
       * @param {BigInt} bigIntValue - The native BigInt value.
       */
      function NativeBigInt(bigIntValue) {
        this.value = bigIntValue;
      }

      // --- Utility Functions ---

      /**
       * Checks if a number can be represented as a SmallNumber (within JS safe integer limits).
       * @param {number} num - The number to check.
       * @returns {boolean} True if the number is within the safe range, false otherwise.
       */
      function isSmallJsNumber(num) {
        return -MAX_SAFE_JS_INT < num && num < MAX_SAFE_JS_INT;
      }

      /**
       * Converts a JavaScript number into an array of BASE_MAGNITUDE parts.
       * Used for converting small numbers into the internal large number format.
       * @param {number} num - The number to convert.
       * @returns {number[]} An array of digits.
       */
      function convertJsNumToParts(num) {
        // For numbers smaller than BASE_MAGNITUDE, return a single-element array
        if (num < BASE_MAGNITUDE) {
          return [num];
        }
        // For numbers up to 10^14, return two parts
        if (num < 1e14) {
          return [num % BASE_MAGNITUDE, Math.floor(num / BASE_MAGNITUDE)];
        }
        // For larger numbers up to MAX_SAFE_JS_INT, return three parts
        return [num % BASE_MAGNITUDE, Math.floor(num / BASE_MAGNITUDE) % BASE_MAGNITUDE, Math.floor(num / 1e14)];
      }

      /**
       * Removes leading zero parts from a digit array.
       * Example: [1, 2, 0, 0] becomes [1, 2]
       * @param {number[]} digitArray - The array of digits.
       */
      function _internalTrimArray(digitArray) {
        let lastIndex = digitArray.length;
        while (lastIndex > 0 && digitArray[--lastIndex] === 0);
        digitArray.length = lastIndex + 1;
      }

      /**
       * Conditionally converts a digit array back to a simple number if it's small enough.
       * Also trims leading zeros.
       * @param {number[]} digitArray - The array of digits.
       * @returns {number|number[]} A number if small, otherwise the trimmed digit array.
       */
      function trimLeadingZeros(digitArray) {
        _internalTrimArray(digitArray);
        const arrayLength = digitArray.length;

        // Convert back to number if it fits within a small number of parts
        if (arrayLength < 4 && _compareDigitArrays(digitArray, MAX_SAFE_JS_INT_PARTS) < 0) {
          switch (arrayLength) {
            case 0:
              return 0;
            case 1:
              return digitArray[0];
            case 2:
              return digitArray[0] + digitArray[1] * BASE_MAGNITUDE;
            default: // arrayLength is 3
              return digitArray[0] + (digitArray[1] + digitArray[2] * BASE_MAGNITUDE) * BASE_MAGNITUDE;
          }
        }
        return digitArray;
      }

      /**
       * Creates a new array filled with zeros.
       * @param {number} length - The desired length of the array.
       * @returns {number[]} A zero-filled array.
       */
      function _createZeroFilledArray(length) {
        return Array(length).fill(0);
      }

      /**
       * Truncates a number to an integer (floor for positive, ceil for negative).
       * @param {number} num - The number to truncate.
       * @returns {number} The truncated integer.
       */
      function _truncateToInteger(num) {
        return num > 0 ? Math.floor(num) : Math.ceil(num);
      }

      /**
       * Adds two digit arrays, handling carries.
       * Assumes `arr1` is longer or equal in length to `arr2`.
       * @param {number[]} arr1 - The first digit array.
       * @param {number[]} arr2 - The second digit array.
       * @returns {number[]} The result of the addition.
       */
      function _addDigitArrays(arr1, arr2) {
        const len1 = arr1.length;
        const len2 = arr2.length;
        const result = new Array(len1);
        let carry = 0;
        let sumPart;

        // Add corresponding parts from both arrays
        for (let i = 0; i < len2; i++) {
          sumPart = arr1[i] + arr2[i] + carry;
          carry = Math.floor(sumPart / BASE_MAGNITUDE);
          result[i] = sumPart % BASE_MAGNITUDE;
        }

        // Add remaining parts of the longer array with carry
        for (let i = len2; i < len1; i++) {
          sumPart = arr1[i] + carry;
          carry = Math.floor(sumPart / BASE_MAGNITUDE);
          result[i] = sumPart % BASE_MAGNITUDE;
        }

        // If there's a final carry, append it
        if (carry > 0) {
          result.push(carry);
        }
        return result;
      }

      /**
       * Adds two digit arrays, ensuring the first argument is always the longer one.
       * @param {number[]} arr1 - The first digit array.
       * @param {number[]} arr2 - The second digit array.
       * @returns {number[]} The result of the addition.
       */
      function _addArraysWithCarry(arr1, arr2) {
        return arr1.length >= arr2.length ? _addDigitArrays(arr1, arr2) : _addDigitArrays(arr2, arr1);
      }

      /**
       * Adds a small number (as a single digit) to a digit array.
       * Used for operations like `next()` or adding 1.
       * @param {number[]} digitArray - The array of digits.
       * @param {number} smallNum - The small number to add.
       * @returns {number[]} The result array.
       */
      function _addSmallToDigitArray(digitArray, smallNum) {
        const len = digitArray.length;
        const result = new Array(len);
        let currentCarry = smallNum; // SmallNum effectively acts as the initial carry

        for (let i = 0; i < len; i++) {
          const sumPart = digitArray[i] + currentCarry;
          currentCarry = Math.floor(sumPart / BASE_MAGNITUDE);
          result[i] = sumPart % BASE_MAGNITUDE;
        }

        // If a carry remains after iterating through all digits, append it
        while (currentCarry > 0) {
          result.push(currentCarry % BASE_MAGNITUDE);
          currentCarry = Math.floor(currentCarry / BASE_MAGNITUDE);
        }
        return result;
      }

      /**
       * Subtracts one digit array from another.
       * Assumes `arr1` is greater than or equal to `arr2`.
       * @param {number[]} arr1 - The minuend digit array.
       * @param {number[]} arr2 - The subtrahend digit array.
       * @returns {number[]} The result of the subtraction.
       */
      function _subtractDigitArrays(arr1, arr2) {
        const len1 = arr1.length;
        const len2 = arr2.length;
        const result = new Array(len1);
        let borrow = 0;
        let diffPart;

        // Subtract corresponding parts
        for (let i = 0; i < len2; i++) {
          diffPart = arr1[i] - borrow - arr2[i];
          if (diffPart < 0) {
            diffPart += BASE_MAGNITUDE;
            borrow = 1;
          } else {
            borrow = 0;
          }
          result[i] = diffPart;
        }

        // Propagate borrow through remaining parts of the minuend
        for (let i = len2; i < len1; i++) {
          diffPart = arr1[i] - borrow;
          if (diffPart < 0) {
            diffPart += BASE_MAGNITUDE;
            borrow = 1;
          } else {
            result[i++] = diffPart; // Assign and then break if no borrow
            break;
          }
          result[i] = diffPart;
        }

        // Copy any remaining parts from arr1
        for (let i = len1 - 1; i >= 0 && borrow === 0; i--) { // Check borrow to avoid unnecessary copy
          if (result[i] === undefined) result[i] = arr1[i];
        }

        _internalTrimArray(result);
        return result;
      }

      /**
       * Subtracts a small number (as a single digit) from a digit array.
       * Used for operations like `prev()` or subtracting 1.
       * @param {number[]} digitArray - The array of digits.
       * @param {number} smallNum - The small number to subtract.
       * @param {boolean} isNegativeResult - Flag indicating if the overall result should be negative.
       * @returns {BigIntObject} A BigInt instance representing the result.
       */
      function _subtractSmallFromDigitArray(digitArray, smallNum, isNegativeResult) {
        const len = digitArray.length;
        const result = new Array(len);
        let currentBorrow = -smallNum; // SmallNum acts as initial borrow
        let diffPart;

        for (let i = 0; i < len; i++) {
          diffPart = digitArray[i] + currentBorrow;
          currentBorrow = Math.floor(diffPart / BASE_MAGNITUDE);
          diffPart %= BASE_MAGNITUDE;
          result[i] = diffPart < 0 ? diffPart + BASE_MAGNITUDE : diffPart; // Ensure positive digit
        }

        // Convert the result back to a SmallNumber if possible, otherwise a LargeNumber
        const processedResult = trimLeadingZeros(result);
        if (typeof processedResult === "number") {
          return new SmallNumber(isNegativeResult ? -processedResult : processedResult);
        }
        return new LargeNumber(processedResult, isNegativeResult);
      }

      /**
       * Multiplies two digit arrays.
       * Implements standard long multiplication.
       * @param {number[]} arr1 - The first digit array.
       * @param {number[]} arr2 - The second digit array.
       * @returns {number[]} The result of the multiplication.
       */
      function _multiplyDigitArrays(arr1, arr2) {
        const len1 = arr1.length;
        const len2 = arr2.length;
        const result = _createZeroFilledArray(len1 + len2); // Max possible length
        const base = BASE_MAGNITUDE;

        for (let i = 0; i < len1; ++i) {
          const digit1 = arr1[i];
          let carry = 0; // Carry for the current row of multiplication

          for (let j = 0; j < len2; ++j) {
            // Calculate product of current digits plus carry from previous step
            const product = digit1 * arr2[j] + result[i + j] + carry;
            carry = Math.floor(product / base); // New carry
            result[i + j] = product % base; // Store current digit
          }
          result[i + len2] += carry; // Add final carry for this row
        }
        _internalTrimArray(result);
        return result;
      }

      /**
       * Multiplies a digit array by a small JavaScript number.
       * @param {number[]} digitArray - The array of digits.
       * @param {number} smallMultiplier - The small number to multiply by.
       * @returns {number[]} The result array.
       */
      function _multiplyDigitArrayBySmall(digitArray, smallMultiplier) {
        const len = digitArray.length;
        const result = new Array(len);
        const base = BASE_MAGNITUDE;
        let carry = 0;
        let productPart;

        for (let i = 0; i < len; i++) {
          productPart = digitArray[i] * smallMultiplier + carry;
          carry = Math.floor(productPart / base);
          result[i] = productPart % base;
        }

        // If carry remains, append it
        while (carry > 0) {
          result.push(carry % base);
          carry = Math.floor(carry / base);
        }
        return result;
      }

      /**
       * Pads a digit array with leading zeros.
       * @param {number[]} digitArray - The array to pad.
       * @param {number} numZeros - The number of zeros to prepend.
       * @returns {number[]} The padded array.
       */
      function _padArrayWithZeros(digitArray, numZeros) {
        const zeros = [];
        for (let i = 0; i < numZeros; i++) {
          zeros.push(0);
        }
        return zeros.concat(digitArray);
      }

      /**
       * Creates a LargeNumber from a product of a small number and a digit array.
       * @param {number} smallFactor - The small number factor.
       * @param {number[]} digitArrayFactor - The digit array factor.
       * @param {boolean} isNegativeResult - Sign of the result.
       * @returns {LargeNumber} A new LargeNumber instance.
       */
      function _createLargeNumFromProduct(smallFactor, digitArrayFactor, isNegativeResult) {
        // Multiply digitArrayFactor by the absolute value of smallFactor
        const productParts = _multiplyDigitArrayBySmall(digitArrayFactor, smallFactor);
        return new LargeNumber(productParts, isNegativeResult);
      }

      /**
       * Squares a digit array.
       * Uses a specialized algorithm for squaring that can be more efficient than general multiplication.
       * @param {number[]} digitArray - The array of digits to square.
       * @returns {number[]} The squared digit array.
       */
      function _squareDigitArray(digitArray) {
        const len = digitArray.length;
        const result = _createZeroFilledArray(len + len);
        const base = BASE_MAGNITUDE;

        for (let i = 0; i < len; i++) {
          let carry = 0;
          const digit = digitArray[i];
          // Calculate product of current digit with all other digits
          for (let j = i; j < len; j++) {
            // For i == j, it's digit*digit. For i != j, it's 2*digit*digitArray[j].
            const product = digit * digitArray[j] * (i === j ? 1 : 2) + result[i + j] + carry;
            carry = Math.floor(product / base);
            result[i + j] = product % base;
          }
          result[i + len] += carry;
        }
        _internalTrimArray(result);
        return result;
      }

      /**
       * Divides a digit array by a small JavaScript number.
       * Returns both quotient and remainder.
       * @param {number[]} dividendParts - The digit array dividend.
       * @param {number} smallDivisor - The small number divisor.
       * @returns {[number[], number]} An array containing the quotient array and the remainder.
       */
      function _divideDigitArrayBySmall(dividendParts, smallDivisor) {
        const len = dividendParts.length;
        const quotientParts = new Array(len);
        let currentRemainder = 0;
        const base = BASE_MAGNITUDE;

        // Process digits from most significant to least significant
        for (let i = len - 1; i >= 0; --i) {
          const combinedDigit = currentRemainder * base + dividendParts[i];
          const quotientDigit = _truncateToInteger(combinedDigit / smallDivisor);
          currentRemainder = combinedDigit % smallDivisor;
          quotientParts[i] = quotientDigit;
        }
        _internalTrimArray(quotientParts);
        return [quotientParts, currentRemainder];
      }

      /**
       * Performs division and modulus operations for BigInts.
       * Returns both quotient and remainder as BigInt objects.
       * @param {BigIntObject} dividendBigInt - The dividend.
       * @param {BigIntObject} divisorBigInt - The divisor.
       * @returns {[BigIntObject, BigIntObject]} An array containing the quotient and remainder.
       * @throws {Error} If dividing by zero.
       */
      function _performDivisionAndModulus(dividendBigInt, divisorBigInt) {
        const normalizedDivisor = _normalizeInputToBigInt(divisorBigInt);

        // Native BigInt handling if available
        if (HAS_NATIVE_BIGINT) {
          return [
            new NativeBigInt(dividendBigInt.value / normalizedDivisor.value),
            new NativeBigInt(dividendBigInt.value % normalizedDivisor.value)
          ];
        }

        const dividendValue = dividendBigInt.value;
        let divisorValue = normalizedDivisor.value;

        // Handle division by zero
        if (divisorValue === 0) {
          throw new Error("Division by zero error.");
        }

        // Optimized path for small number division
        if (dividendBigInt.isSmall) {
          // If divisor is also small, perform standard JS division
          if (normalizedDivisor.isSmall) {
            return [
              new SmallNumber(_truncateToInteger(dividendValue / divisorValue)),
              new SmallNumber(dividendValue % divisorValue)
            ];
          }
          // If dividend is small but divisor is large, quotient is 0, remainder is dividend
          return [createBigInt._cachedConstants[0], dividendBigInt];
        }

        // Optimized path for small divisor
        if (normalizedDivisor.isSmall) {
          if (divisorValue === 1) return [dividendBigInt, createBigInt._cachedConstants[0]];
          if (divisorValue === -1) return [dividendBigInt.negate(), createBigInt._cachedConstants[0]];

          const absDivisor = Math.abs(divisorValue);
          // If small divisor fits within BASE_MAGNITUDE, use optimized _divideDigitArrayBySmall
          if (absDivisor < BASE_MAGNITUDE) {
            const [quotientParts, remainderNum] = _divideDigitArrayBySmall(dividendValue, absDivisor);
            const quotientResult = trimLeadingZeros(quotientParts);
            // Determine signs for quotient and remainder
            const quotientSign = dividendBigInt.sign !== normalizedDivisor.sign;
            const remainderSign = dividendBigInt.sign;

            // Construct quotient BigInt
            const finalQuotient = typeof quotientResult === "number" ?
              new SmallNumber(quotientSign ? -quotientResult : quotientResult) :
              new LargeNumber(quotientResult, quotientSign);

            // Construct remainder BigInt
            const finalRemainder = new SmallNumber(remainderSign ? -remainderNum : remainderNum);

            return [finalQuotient, finalRemainder];
          }
          // If small divisor is larger than BASE_MAGNITUDE, convert it to parts
          divisorValue = convertJsNumToParts(absDivisor);
        }

        // Compare magnitudes to determine if quotient is 0
        const comparisonResult = _compareDigitArrays(dividendValue, divisorValue);
        if (comparisonResult === -1) {
          return [createBigInt._cachedConstants[0], dividendBigInt]; // Dividend is smaller than divisor
        }
        if (comparisonResult === 0) {
          // Dividend equals divisor, quotient is 1 (or -1), remainder is 0
          const quotient = createBigInt._cachedConstants[dividendBigInt.sign === normalizedDivisor.sign ? 1 : -1];
          return [quotient, createBigInt._cachedConstants[0]];
        }

        let quotientParts;
        let remainderParts;

        // Select division algorithm based on operand size for performance
        if (dividendValue.length + divisorValue.length <= 200) {
          // Optimized "long division" for relatively smaller large numbers
          const base = BASE_MAGNITUDE;
          const dividendLen = dividendValue.length;
          const divisorLen = divisorValue.length;
          const resultQuotientDigits = _createZeroFilledArray(divisorLen);
          let currentDividend = convertJsNumToParts(0); // Initialize current working dividend
          currentDividend.pop(); // Remove the initial 0

          // Normalize dividend and divisor for more accurate estimation
          // Multiplier `d` ensures the most significant digit of divisor `w` is large
          const d = Math.ceil(base / (2 * divisorValue[divisorLen - 1]));
          const scaledDividend = _multiplyDigitArrayBySmall(dividendValue, d);
          const scaledDivisor = _multiplyDigitArrayBySmall(divisorValue, d);

          // Pad scaledDividend if necessary to accommodate potential carry from scaling
          if (scaledDividend.length <= dividendLen) scaledDividend.push(0);
          scaledDivisor.push(0); // Pad scaledDivisor for easier indexing

          const c = scaledDivisor[divisorLen - 1]; // Most significant digit of scaled divisor

          for (let i = dividendLen - divisorLen; i >= 0; i--) {
            // Estimate quotient digit `q`
            let q = base - 1;
            if (scaledDividend[i + divisorLen] !== c) {
              q = Math.floor((scaledDividend[i + divisorLen] * base + scaledDividend[i + divisorLen - 1]) / c);
            }

            // Perform trial subtraction
            let carry = 0;
            let diff = 0;
            const scaledDivisorFullLen = scaledDivisor.length;
            for (let j = 0; j < scaledDivisorFullLen; j++) {
              carry += q * scaledDivisor[j];
              diff += scaledDividend[i + j] - (carry % base);
              carry = Math.floor(carry / base);
              if (diff < 0) {
                scaledDividend[i + j] = diff + base;
                diff = -1;
              } else {
                scaledDividend[i + j] = diff;
                diff = 0;
              }
            }

            // Adjust `q` if trial subtraction resulted in a negative value (q was too large)
            while (diff !== 0) {
              q--;
              carry = 0;
              for (let j = 0; j < scaledDivisorFullLen; j++) {
                carry += scaledDividend[i + j] - base + scaledDivisor[j];
                if (carry < 0) {
                  scaledDividend[i + j] = carry + base;
                  carry = 0;
                } else {
                  scaledDividend[i + j] = carry;
                  carry = 1;
                }
              }
              diff += carry;
            }
            resultQuotientDigits[i] = q;
          }

          // Unscale the remainder
          remainderParts = _divideDigitArrayBySmall(scaledDividend, d)[0];
          quotientParts = trimLeadingZeros(resultQuotientDigits);

        } else {
          // "Grade-school" long division for very large numbers
          // This approach is simpler but less efficient for many cases
          const base = BASE_MAGNITUDE;
          const currentQuotientDigits = [];
          let currentRemainderDigits = []; // This will hold the current part of the dividend being divided

          let currentDividendIndex = dividendValue.length;
          while (currentDividendIndex > 0) {
            currentRemainderDigits.unshift(dividendValue[--currentDividendIndex]);
            _internalTrimArray(currentRemainderDigits); // Trim leading zeros from current remainder

            if (_compareDigitArrays(currentRemainderDigits, divisorValue) < 0) {
              currentQuotientDigits.push(0); // Current dividend part is too small, quotient digit is 0
            } else {
              // Estimate quotient digit
              let estimatedQuotientDigit = currentRemainderDigits[currentRemainderDigits.length - 1] * base +
                (currentRemainderDigits.length > 1 ? currentRemainderDigits[currentRemainderDigits.length - 2] : 0);
              let estimatedDivisorCombined = divisorValue[divisorValue.length - 1] * base +
                (divisorValue.length > 1 ? divisorValue[divisorValue.length - 2] : 0);

              // Add 1 to estimatedQuotientDigit and multiply by base to ensure it's always larger than estimatedDivisorCombined
              // when dividend length is greater than divisor length. This helps with initial estimation.
              if (currentRemainderDigits.length > divisorValue.length) {
                estimatedQuotientDigit = (estimatedQuotientDigit + 1) * base;
              }

              let q = Math.ceil(estimatedQuotientDigit / estimatedDivisorCombined);

              // Refine q (trial and error)
              let trialProduct;
              do {
                if (q === 0) break; // Avoid infinite loop if q becomes 0
                trialProduct = _multiplyDigitArrayBySmall(divisorValue, q);
                if (_compareDigitArrays(trialProduct, currentRemainderDigits) <= 0) break;
                q--;
              } while (q > 0);

              currentQuotientDigits.push(q);
              currentRemainderDigits = _subtractDigitArrays(currentRemainderDigits, trialProduct);
            }
          }
          currentQuotientDigits.reverse();
          quotientParts = trimLeadingZeros(currentQuotientDigits);
          remainderParts = trimLeadingZeros(currentRemainderDigits);
        }

        // Determine signs and return BigInt objects
        const quotientIsNegative = dividendBigInt.sign !== normalizedDivisor.sign;
        const remainderIsNegative = dividendBigInt.sign;

        const finalQuotient = typeof quotientParts === "number" ?
          (quotientIsNegative ? new SmallNumber(-quotientParts) : new SmallNumber(quotientParts)) :
          new LargeNumber(quotientParts, quotientIsNegative);

        const finalRemainder = typeof remainderParts === "number" ?
          (remainderIsNegative ? new SmallNumber(-remainderParts) : new SmallNumber(remainderParts)) :
          new LargeNumber(remainderParts, remainderIsNegative);

        return [finalQuotient, finalRemainder];
      }

      /**
       * Compares two digit arrays.
       * @param {number[]} arr1 - The first digit array.
       * @param {number[]} arr2 - The second digit array.
       * @returns {number} -1 if arr1 < arr2, 0 if arr1 == arr2, 1 if arr1 > arr2.
       */
      function _compareDigitArrays(arr1, arr2) {
        if (arr1.length !== arr2.length) {
          return arr1.length > arr2.length ? 1 : -1;
        }
        // Compare from most significant digit downwards
        for (let i = arr1.length - 1; i >= 0; i--) {
          if (arr1[i] !== arr2[i]) {
            return arr1[i] > arr2[i] ? 1 : -1;
          }
        }
        return 0; // Arrays are equal
      }

      /**
       * Performs a quick primality check for small numbers.
       * @param {BigIntObject} num - The number to check.
       * @returns {boolean|undefined} True/False if prime/composite, undefined if too large for quick check.
       */
      function _isQuickCheckPrime(num) {
        const absoluteValue = num.abs();
        // 0, 1 are not prime. Negative numbers are not typically considered prime.
        if (absoluteValue.isUnit() || absoluteValue.isZero()) return false;
        // 2, 3, 5 are prime
        if (absoluteValue.equals(2) || absoluteValue.equals(3) || absoluteValue.equals(5)) return true;
        // Even numbers, multiples of 3, or multiples of 5 are composite
        if (absoluteValue.isEven() || absoluteValue.isDivisibleBy(3) || absoluteValue.isDivisibleBy(5)) return false;
        // Numbers less than 49 (7*7) are prime if they passed the previous checks
        if (absoluteValue.lesser(49)) return true;
        return undefined; // Too large for quick check, proceed to Miller-Rabin
      }

      /**
       * Implements the Miller-Rabin primality test.
       * @param {BigIntObject} candidate - The number to test for primality.
       * @param {BigIntObject[]} bases - An array of bases to test against.
       * @returns {boolean} True if likely prime, false if composite.
       */
      function _runMillerRabinTest(candidate, bases) {
        // If candidate is 2, 3, 5, etc. and small, it's prime.
        // If candidate is even or divisible by small primes, it's composite.
        // These checks are usually done before calling Miller-Rabin.
        // Assume candidate is odd and > 5.

        const candidateMinusOne = candidate.prev(); // candidate - 1
        let d = candidateMinusOne;
        let s = 0; // Number of times 2 divides candidateMinusOne

        // Find s and d such that candidate - 1 = 2^s * d, where d is odd
        while (d.isEven()) {
          d = d.divide(2);
          s++;
        }

        // Loop through each base 'a' for the test
        for (let i = 0; i < bases.length; i++) {
          const a = createBigInt(bases[i]); // Convert base to BigInt
          // If candidate is less than or equal to base 'a', it means 'a' itself might be the prime.
          // Or 'a' is just a small number for testing.
          // This check ensures we don't try to modPow a number by itself if it's small.
          if (candidate.lesser(a)) continue; // Skip if base is larger than candidate

          let x = a.modPow(d, candidate); // x = a^d mod candidate

          // If x is 1 or candidate - 1, then candidate might be prime for this base
          if (x.isUnit() || x.equals(candidateMinusOne)) {
            continue; // Test passes for this base, try next base
          }

          // Otherwise, check x^(2^r) mod candidate for 0 <= r < s
          let foundStrongWitness = false;
          for (let r = 0; r < s - 1; r++) {
            x = x.square().mod(candidate); // x = x^2 mod candidate
            if (x.isUnit()) return false; // Found a non-trivial square root of 1, candidate is composite
            if (x.equals(candidateMinusOne)) {
              foundStrongWitness = true;
              break; // Test passes for this base, try next base
            }
          }
          if (!foundStrongWitness) return false; // Candidate is composite
        }
        return true; // Candidate is likely prime
      }

      // --- Prototype Chain Setup ---
      // Establish prototype inheritance for the three BigInt types
      LargeNumber.prototype = Object.create(createBigInt.prototype);
      SmallNumber.prototype = Object.create(createBigInt.prototype);
      NativeBigInt.prototype = Object.create(createBigInt.prototype);

      // --- Arithmetic Operations ---

      // LargeNumber Addition
      LargeNumber.prototype.add = function(otherBigInt) {
        const normalizedOther = _normalizeInputToBigInt(otherBigInt);
        // If signs are different, perform subtraction instead
        if (this.sign !== normalizedOther.sign) {
          return this.subtract(normalizedOther.negate());
        }
        const thisValue = this.value;
        const otherValue = normalizedOther.value;
        // If other is small, convert its absolute value to parts and add
        if (normalizedOther.isSmall) {
          return new LargeNumber(_addSmallToDigitArray(thisValue, Math.abs(otherValue)), this.sign);
        }
        // Both are large, perform array addition
        return new LargeNumber(_addArraysWithCarry(thisValue, otherValue), this.sign);
      };
      LargeNumber.prototype.plus = LargeNumber.prototype.add; // Alias

      // SmallNumber Addition
      SmallNumber.prototype.add = function(otherBigInt) {
        const normalizedOther = _normalizeInputToBigInt(otherBigInt);
        const thisValue = this.value;
        // If signs are different, perform subtraction instead
        if ((thisValue < 0) !== normalizedOther.sign) {
          return this.subtract(normalizedOther.negate());
        }
        const otherValue = normalizedOther.value;
        // If other is small, check if sum fits in small number
        if (normalizedOther.isSmall) {
          const sum = thisValue + otherValue;
          if (isSmallJsNumber(sum)) {
            return new SmallNumber(sum);
          }
          // If sum is too large, convert to parts and create LargeNumber
          const absSumParts = _addSmallToDigitArray(convertJsNumToParts(Math.abs(thisValue)), Math.abs(otherValue));
          return new LargeNumber(absSumParts, thisValue < 0);
        }
        // This is small, other is large. Convert this to parts and add.
        return new LargeNumber(_addSmallToDigitArray(otherValue, Math.abs(thisValue)), thisValue < 0);
      };
      SmallNumber.prototype.plus = SmallNumber.prototype.add; // Alias

      // NativeBigInt Addition
      NativeBigInt.prototype.add = function(otherBigInt) {
        return new NativeBigInt(this.value + _normalizeInputToBigInt(otherBigInt).value);
      };
      NativeBigInt.prototype.plus = NativeBigInt.prototype.add; // Alias

      // LargeNumber Subtraction
      LargeNumber.prototype.subtract = function(otherBigInt) {
        const normalizedOther = _normalizeInputToBigInt(otherBigInt);
        // If signs are different, perform addition with negated other
        if (this.sign !== normalizedOther.sign) {
          return this.add(normalizedOther.negate());
        }
        const thisValue = this.value;
        const otherValue = normalizedOther.value;

        // Helper for subtraction logic
        const _performSubtractionLogic = (minuendParts, subtrahendParts, isNegativeResult) => {
          let resultParts;
          if (_compareDigitArrays(minuendParts, subtrahendParts) >= 0) {
            resultParts = _subtractDigitArrays(minuendParts, subtrahendParts);
          } else {
            resultParts = _subtractDigitArrays(subtrahendParts, minuendParts);
            isNegativeResult = !isNegativeResult; // Flip sign if subtrahend was larger
          }
          const finalResult = trimLeadingZeros(resultParts);
          if (typeof finalResult === "number") {
            return new SmallNumber(isNegativeResult ? -finalResult : finalResult);
          }
          return new LargeNumber(finalResult, isNegativeResult);
        };

        // If other is small, convert its absolute value to parts and subtract
        if (normalizedOther.isSmall) {
          return _performSubtractionLogic(thisValue, convertJsNumToParts(Math.abs(otherValue)), this.sign);
        }
        // Both are large, perform array subtraction
        return _performSubtractionLogic(thisValue, otherValue, this.sign);
      };
      LargeNumber.prototype.minus = LargeNumber.prototype.subtract; // Alias

      // SmallNumber Subtraction
      SmallNumber.prototype.subtract = function(otherBigInt) {
        const normalizedOther = _normalizeInputToBigInt(otherBigInt);
        const thisValue = this.value;
        // If signs are different, perform addition with negated other
        if ((thisValue < 0) !== normalizedOther.sign) {
          return this.add(normalizedOther.negate());
        }
        const otherValue = normalizedOther.value;
        // If other is small, perform standard JS subtraction
        if (normalizedOther.isSmall) {
          return new SmallNumber(thisValue - otherValue);
        }
        // This is small, other is large. Convert this to parts and subtract.
        // The result will be large and potentially negative.
        const absThisValue = Math.abs(thisValue);
        const result = _subtractSmallFromDigitArray(otherValue, absThisValue, thisValue >= 0);
        return result;
      };
      SmallNumber.prototype.minus = SmallNumber.prototype.subtract; // Alias

      // NativeBigInt Subtraction
      NativeBigInt.prototype.subtract = function(otherBigInt) {
        return new NativeBigInt(this.value - _normalizeInputToBigInt(otherBigInt).value);
      };
      NativeBigInt.prototype.minus = NativeBigInt.prototype.subtract; // Alias

      // Negation
      LargeNumber.prototype.negate = function() {
        return new LargeNumber(this.value, !this.sign);
      };
      SmallNumber.prototype.negate = function() {
        const negatedValue = -this.value;
        // Create new SmallNumber, explicitly setting sign based on new value
        return new SmallNumber(negatedValue);
      };
      NativeBigInt.prototype.negate = function() {
        return new NativeBigInt(-this.value);
      };

      // Absolute Value
      LargeNumber.prototype.abs = function() {
        return new LargeNumber(this.value, false);
      };
      SmallNumber.prototype.abs = function() {
        return new SmallNumber(Math.abs(this.value));
      };
      NativeBigInt.prototype.abs = function() {
        return new NativeBigInt(this.value >= 0 ? this.value : -this.value);
      };

      // LargeNumber Multiplication
      LargeNumber.prototype.multiply = function(otherBigInt) {
        const normalizedOther = _normalizeInputToBigInt(otherBigInt);
        const thisValue = this.value;
        const otherValue = normalizedOther.value;
        const isResultNegative = this.sign !== normalizedOther.sign;

        // Handle multiplication by zero
        if (normalizedOther.isZero()) return createBigInt._cachedConstants[0];
        // Handle multiplication by one
        if (normalizedOther.isUnit()) return normalizedOther.sign ? this.negate() : this;

        // If other is a small number, use optimized multiplication by small
        if (normalizedOther.isSmall) {
          const absOtherValue = Math.abs(otherValue);
          // If absOtherValue is within BASE_MAGNITUDE, use _multiplyDigitArrayBySmall
          if (absOtherValue < BASE_MAGNITUDE) {
            return new LargeNumber(_multiplyDigitArrayBySmall(thisValue, absOtherValue), isResultNegative);
          }
          // Otherwise, convert small number to parts and proceed with array multiplication
          return new LargeNumber(_multiplyDigitArrays(thisValue, convertJsNumToParts(absOtherValue)), isResultNegative);
        }

        // Both are large numbers, determine which multiplication algorithm to use
        const len1 = thisValue.length;
        const len2 = otherValue.length;

        // Karatsuba multiplication for very large numbers (threshold ~30 digits)
        // The condition `-.012*o-.012*n+15e-6*o*n>0` approximates `len1*len2 > ~1600`
        // which roughly translates to `len1 + len2 > ~80` for equal lengths.
        // It's a heuristic to decide when Karatsuba is faster than naive multiplication.
        if (-0.012 * len1 - 0.012 * len2 + 0.000015 * len1 * len2 > 0) {
          // Karatsuba algorithm (recursive implementation)
          const karatsubaMultiply = (arrA, arrB) => {
            const maxLen = Math.max(arrA.length, arrB.length);
            if (maxLen <= 30) { // Base case for Karatsuba: fall back to naive multiplication
              return _multiplyDigitArrays(arrA, arrB);
            }

            // Split arrays into two halves
            const mid = Math.ceil(maxLen / 2);
            const highA = arrA.slice(mid);
            const lowA = arrA.slice(0, mid);
            const highB = arrB.slice(mid);
            const lowB = arrB.slice(0, mid);

            // Recursive steps
            const z0 = karatsubaMultiply(lowA, lowB);
            const z2 = karatsubaMultiply(highA, highB);
            const z1 = karatsubaMultiply(_addArraysWithCarry(lowA, highA), _addArraysWithCarry(lowB, highB));

            // Combine results: z2 * BASE^(2*mid) + (z1 - z2 - z0) * BASE^mid + z0
            const term1 = _addArraysWithCarry(z0, _padArrayWithZeros(_subtractDigitArrays(_subtractDigitArrays(z1, z0), z2), mid));
            const finalResult = _addArraysWithCarry(term1, _padArrayWithZeros(z2, 2 * mid));
            _internalTrimArray(finalResult);
            return finalResult;
          };
          return new LargeNumber(karatsubaMultiply(thisValue, otherValue), isResultNegative);
        } else {
          // Standard long multiplication
          return new LargeNumber(_multiplyDigitArrays(thisValue, otherValue), isResultNegative);
        }
      };
      LargeNumber.prototype.times = LargeNumber.prototype.multiply; // Alias

      // SmallNumber Internal Multiplication Helper
      SmallNumber.prototype._multiplyBySmall = function(otherBigInt) {
        const thisValue = this.value;
        const otherValue = otherBigInt.value;
        // If product fits in a small number
        if (isSmallJsNumber(thisValue * otherValue)) {
          return new SmallNumber(thisValue * otherValue);
        }
        // Otherwise, convert to parts and create a LargeNumber
        const absProductParts = _createLargeNumFromProduct(Math.abs(otherValue), convertJsNumToParts(Math.abs(thisValue)), this.sign !== otherBigInt.sign);
        return absProductParts;
      };

      // LargeNumber Internal Multiplication Helper
      LargeNumber.prototype._multiplyBySmall = function(otherBigInt) {
        const otherValue = otherBigInt.value;
        // Handle multiplication by zero, one, minus one
        if (otherValue === 0) return createBigInt._cachedConstants[0];
        if (otherValue === 1) return this;
        if (otherValue === -1) return this.negate();

        // Perform multiplication and determine sign
        const absOtherValue = Math.abs(otherValue);
        const productParts = _multiplyDigitArrayBySmall(this.value, absOtherValue);
        const isResultNegative = this.sign !== otherBigInt.sign;
        return new LargeNumber(productParts, isResultNegative);
      };

      // SmallNumber Multiplication
      SmallNumber.prototype.multiply = function(otherBigInt) {
        // Delegate to the internal helper, which handles the type conversion
        return _normalizeInputToBigInt(otherBigInt)._multiplyBySmall(this);
      };
      SmallNumber.prototype.times = SmallNumber.prototype.multiply; // Alias

      // NativeBigInt Multiplication
      NativeBigInt.prototype.multiply = function(otherBigInt) {
        return new NativeBigInt(this.value * _normalizeInputToBigInt(otherBigInt).value);
      };
      NativeBigInt.prototype.times = NativeBigInt.prototype.multiply; // Alias

      // Squaring
      LargeNumber.prototype.square = function() {
        return new LargeNumber(_squareDigitArray(this.value), false);
      };
      SmallNumber.prototype.square = function() {
        const squaredValue = this.value * this.value;
        if (isSmallJsNumber(squaredValue)) {
          return new SmallNumber(squaredValue);
        }
        return new LargeNumber(_squareDigitArray(convertJsNumToParts(Math.abs(this.value))), false);
      };
      NativeBigInt.prototype.square = function() {
        return new NativeBigInt(this.value * this.value);
      };

      // Division and Modulus (divmod)
      LargeNumber.prototype.divmod = function(otherBigInt) {
        const result = _performDivisionAndModulus(this, otherBigInt);
        return {
          quotient: result[0],
          remainder: result[1]
        };
      };
      // SmallNumber and NativeBigInt also use the shared divmod logic
      NativeBigInt.prototype.divmod = SmallNumber.prototype.divmod = LargeNumber.prototype.divmod;

      // Division
      LargeNumber.prototype.divide = function(otherBigInt) {
        return _performDivisionAndModulus(this, otherBigInt)[0];
      };
      NativeBigInt.prototype.over = NativeBigInt.prototype.divide = function(otherBigInt) {
        return new NativeBigInt(this.value / _normalizeInputToBigInt(otherBigInt).value);
      };
      SmallNumber.prototype.over = SmallNumber.prototype.divide = LargeNumber.prototype.over = LargeNumber.prototype.divide; // Aliases

      // Modulus
      LargeNumber.prototype.mod = function(otherBigInt) {
        return _performDivisionAndModulus(this, otherBigInt)[1];
      };
      NativeBigInt.prototype.mod = NativeBigInt.prototype.remainder = function(otherBigInt) {
        return new NativeBigInt(this.value % _normalizeInputToBigInt(otherBigInt).value);
      };
      SmallNumber.prototype.remainder = SmallNumber.prototype.mod = LargeNumber.prototype.remainder = LargeNumber.prototype.mod; // Aliases

      // Power (Exponentiation)
      LargeNumber.prototype.pow = function(exponentBigInt) {
        const exponent = _normalizeInputToBigInt(exponentBigInt);
        const baseValue = this.value;
        const exponentValue = exponent.value;

        // Handle special cases for exponent
        if (exponent.isZero()) return createBigInt._cachedConstants[1]; // x^0 = 1
        if (this.isZero()) return createBigInt._cachedConstants[0]; // 0^x = 0 (for x > 0)
        if (this.isUnit()) return createBigInt._cachedConstants[1]; // 1^x = 1
        if (this.equals(-1)) return exponent.isEven() ? createBigInt._cachedConstants[1] : createBigInt._cachedConstants[-1]; // (-1)^x = 1 or -1

        // Handle negative exponent: result is 0 for BigInts (integer division)
        if (exponent.sign) return createBigInt._cachedConstants[0];

        // If exponent is too large for JS Number, throw error (unless native BigInt)
        if (!exponent.isSmall) {
          throw new Error("Exponent " + exponent.toString() + " is too large for this operation.");
        }

        // If base is small and result fits in JS Number
        if (this.isSmall) {
          const jsPowerResult = Math.pow(this.value, exponentValue);
          if (isSmallJsNumber(jsPowerResult)) {
            return new SmallNumber(_truncateToInteger(jsPowerResult));
          }
        }

        // General binary exponentiation (exponentiation by squaring)
        let result = createBigInt._cachedConstants[1];
        let currentBase = this;
        let currentExponent = exponentValue;

        while (true) {
          // If currentExponent is odd, multiply result by currentBase
          if (currentExponent & 1) {
            result = result.times(currentBase);
            currentExponent--; // Decrement to make it even
          }
          if (currentExponent === 0) break; // Exponent is 0, done

          currentExponent /= 2; // Divide exponent by 2
          currentBase = currentBase.square(); // Square the base
        }
        return result;
      };
      SmallNumber.prototype.pow = LargeNumber.prototype.pow; // Share implementation

      // NativeBigInt Power
      NativeBigInt.prototype.pow = function(exponentBigInt) {
        const exponent = _normalizeInputToBigInt(exponentBigInt);
        const baseValue = this.value;
        const exponentValue = exponent.value;

        const BI_ZERO = BigInt(0);
        const BI_ONE = BigInt(1);
        const BI_TWO = BigInt(2);

        // Handle special cases for exponent
        if (exponentValue === BI_ZERO) return createBigInt._cachedConstants[1];
        if (baseValue === BI_ZERO) return createBigInt._cachedConstants[0];
        if (baseValue === BI_ONE) return createBigInt._cachedConstants[1];
        if (baseValue === BigInt(-1)) return exponent.isEven() ? createBigInt._cachedConstants[1] : createBigInt._cachedConstants[-1];

        // Handle negative exponent (result is 0 for integer BigInts)
        if (exponent.isNegative()) return new NativeBigInt(BI_ZERO);

        // Binary exponentiation for native BigInt
        let result = createBigInt._cachedConstants[1];
        let currentBase = this;
        let currentExponent = exponentValue;

        while (true) {
          if ((currentExponent & BI_ONE) === BI_ONE) { // If exponent is odd
            result = result.times(currentBase);
            currentExponent--;
          }
          if (currentExponent === BI_ZERO) break;

          currentExponent /= BI_TWO;
          currentBase = currentBase.square();
        }
        return result;
      };

      // Modulo Power (modPow)
      LargeNumber.prototype.modPow = function(exponentBigInt, modulusBigInt) {
        let exponent = _normalizeInputToBigInt(exponentBigInt);
        const modulus = _normalizeInputToBigInt(modulusBigInt);

        // Modulus cannot be zero
        if (modulus.isZero()) {
          throw new Error("Cannot compute modular exponentiation with modulus 0.");
        }

        let result = createBigInt._cachedConstants[1]; // Initialize result to 1
        let baseModulus = this.mod(modulus); // Calculate base % modulus

        // Handle negative exponent (modular inverse)
        if (exponent.isNegative()) {
          // a^(-b) mod m = (a^-1)^b mod m
          baseModulus = baseModulus.modInv(modulus);
          exponent = exponent.negate();
        }

        // Binary exponentiation loop
        while (exponent.isPositive()) {
          if (baseModulus.isZero()) return createBigInt._cachedConstants[0]; // If base % modulus is 0, result is 0
          if (exponent.isOdd()) {
            result = result.multiply(baseModulus).mod(modulus);
          }
          exponent = exponent.divide(2); // exponent = exponent / 2
          baseModulus = baseModulus.square().mod(modulus); // baseModulus = (baseModulus^2) % modulus
        }
        return result;
      };
      NativeBigInt.prototype.modPow = SmallNumber.prototype.modPow = LargeNumber.prototype.modPow; // Share implementation

      // --- Comparison Operations ---

      // Compare Absolute Values
      LargeNumber.prototype.compareAbs = function(otherBigInt) {
        const normalizedOther = _normalizeInputToBigInt(otherBigInt);
        const thisValue = this.value;
        const otherValue = normalizedOther.value;
        // If other is small, its absolute value is a JS number
        if (normalizedOther.isSmall) {
          // Compare this large number's parts to the small number's parts
          // The other value's absolute value is a JS number, so we compare this.value to [Math.abs(otherValue)]
          return _compareDigitArrays(thisValue, convertJsNumToParts(Math.abs(otherValue)));
        }
        // Both are large, compare their digit arrays
        return _compareDigitArrays(thisValue, otherValue);
      };
      SmallNumber.prototype.compareAbs = function(otherBigInt) {
        const normalizedOther = _normalizeInputToBigInt(otherBigInt);
        const absThisValue = Math.abs(this.value);
        const otherValue = normalizedOther.value;
        // If other is small, compare JS numbers
        if (normalizedOther.isSmall) {
          const absOtherValue = Math.abs(otherValue);
          return absThisValue === absOtherValue ? 0 : (absThisValue > absOtherValue ? 1 : -1);
        }
        // This is small, other is large. Small number is always lesser in absolute value.
        return -1;
      };
      NativeBigInt.prototype.compareAbs = function(otherBigInt) {
        const absThisValue = this.value >= 0 ? this.value : -this.value;
        const absOtherValue = _normalizeInputToBigInt(otherBigInt).value;
        const otherAbs = absOtherValue >= 0 ? absOtherValue : -absOtherValue;
        if (absThisValue === otherAbs) return 0;
        return absThisValue > otherAbs ? 1 : -1;
      };

      // Full Comparison
      LargeNumber.prototype.compare = function(otherBigInt) {
        // Handle special JS number comparisons (Infinity)
        if (otherBigInt === Infinity) return -1;
        if (otherBigInt === -Infinity) return 1;

        const normalizedOther = _normalizeInputToBigInt(otherBigInt);
        const thisValue = this.value;
        const otherValue = normalizedOther.value;

        // Compare signs first
        if (this.sign !== normalizedOther.sign) {
          return normalizedOther.sign ? 1 : -1; // If other is negative, this (positive) is greater
        }

        // If other is small, compare this large number's parts to the small number's parts
        if (normalizedOther.isSmall) {
          // A large number is always "larger" than a small number of the same sign (unless it's 0)
          // Exception: if this is negative, then a small negative is "lesser" than a large negative.
          return this.sign ? -1 : 1; // If negative, this is less; if positive, this is greater.
        }

        // Both are large, compare their digit arrays
        const partsComparison = _compareDigitArrays(thisValue, otherValue);
        // If both are positive, direct comparison. If both are negative, flip comparison result.
        return this.sign ? -partsComparison : partsComparison;
      };
      LargeNumber.prototype.compareTo = LargeNumber.prototype.compare; // Alias

      SmallNumber.prototype.compare = function(otherBigInt) {
        if (otherBigInt === Infinity) return -1;
        if (otherBigInt === -Infinity) return 1;

        const normalizedOther = _normalizeInputToBigInt(otherBigInt);
        const thisValue = this.value;
        const otherValue = normalizedOther.value;

        // If other is small, direct JS number comparison
        if (normalizedOther.isSmall) {
          return thisValue === otherValue ? 0 : (thisValue > otherValue ? 1 : -1);
        }
        // This is small, other is large.
        // If signs are different, compare based on sign.
        if ((thisValue < 0) !== normalizedOther.sign) {
          return thisValue < 0 ? -1 : 1; // If this is negative, it's smaller. If this is positive, it's smaller.
        }
        // Both have the same sign, but other is large.
        // If positive, this (small) is smaller. If negative, this (small) is larger (closer to zero).
        return thisValue < 0 ? 1 : -1;
      };
      SmallNumber.prototype.compareTo = SmallNumber.prototype.compare; // Alias

      NativeBigInt.prototype.compare = function(otherBigInt) {
        if (otherBigInt === Infinity) return -1;
        if (otherBigInt === -Infinity) return 1;

        const otherNativeValue = _normalizeInputToBigInt(otherBigInt).value;
        if (this.value === otherNativeValue) return 0;
        return this.value > otherNativeValue ? 1 : -1;
      };
      NativeBigInt.prototype.compareTo = NativeBigInt.prototype.compare; // Alias

      // Equality checks
      LargeNumber.prototype.equals = function(otherBigInt) {
        return this.compare(otherBigInt) === 0;
      };
      NativeBigInt.prototype.eq = NativeBigInt.prototype.equals = SmallNumber.prototype.eq = SmallNumber.prototype.equals = LargeNumber.prototype.eq = LargeNumber.prototype.equals;

      // Inequality checks
      LargeNumber.prototype.notEquals = function(otherBigInt) {
        return this.compare(otherBigInt) !== 0;
      };
      NativeBigInt.prototype.neq = NativeBigInt.prototype.notEquals = SmallNumber.prototype.neq = SmallNumber.prototype.notEquals = LargeNumber.prototype.neq = LargeNumber.prototype.notEquals;

      // Greater than
      LargeNumber.prototype.greater = function(otherBigInt) {
        return this.compare(otherBigInt) > 0;
      };
      NativeBigInt.prototype.gt = NativeBigInt.prototype.greater = SmallNumber.prototype.gt = SmallNumber.prototype.greater = LargeNumber.prototype.gt = LargeNumber.prototype.greater;

      // Lesser than
      LargeNumber.prototype.lesser = function(otherBigInt) {
        return this.compare(otherBigInt) < 0;
      };
      NativeBigInt.prototype.lt = NativeBigInt.prototype.lesser = SmallNumber.prototype.lt = SmallNumber.prototype.lesser = LargeNumber.prototype.lt = LargeNumber.prototype.lesser;

      // Greater or Equals
      LargeNumber.prototype.greaterOrEquals = function(otherBigInt) {
        return this.compare(otherBigInt) >= 0;
      };
      NativeBigInt.prototype.geq = NativeBigInt.prototype.greaterOrEquals = SmallNumber.prototype.geq = SmallNumber.prototype.greaterOrEquals = LargeNumber.prototype.geq = LargeNumber.prototype.greaterOrEquals;

      // Lesser or Equals
      LargeNumber.prototype.lesserOrEquals = function(otherBigInt) {
        return this.compare(otherBigInt) <= 0;
      };
      NativeBigInt.prototype.leq = NativeBigInt.prototype.lesserOrEquals = SmallNumber.prototype.leq = SmallNumber.prototype.lesserOrEquals = LargeNumber.prototype.leq = LargeNumber.prototype.lesserOrEquals;

      // --- Property Checks ---

      // Is Even
      LargeNumber.prototype.isEven = function() {
        return (this.value[0] & 1) === 0; // Check least significant digit
      };
      SmallNumber.prototype.isEven = function() {
        return (this.value & 1) === 0;
      };
      NativeBigInt.prototype.isEven = function() {
        return (this.value & BigInt(1)) === BigInt(0);
      };

      // Is Odd
      LargeNumber.prototype.isOdd = function() {
        return (this.value[0] & 1) === 1; // Check least significant digit
      };
      SmallNumber.prototype.isOdd = function() {
        return (this.value & 1) === 1;
      };
      NativeBigInt.prototype.isOdd = function() {
        return (this.value & BigInt(1)) === BigInt(1);
      };

      // Is Positive
      LargeNumber.prototype.isPositive = function() {
        return !this.sign;
      };
      SmallNumber.prototype.isPositive = function() {
        return this.value > 0;
      };
      NativeBigInt.prototype.isPositive = SmallNumber.prototype.isPositive; // Share implementation

      // Is Negative
      LargeNumber.prototype.isNegative = function() {
        return this.sign;
      };
      SmallNumber.prototype.isNegative = function() {
        return this.value < 0;
      };
      NativeBigInt.prototype.isNegative = SmallNumber.prototype.isNegative; // Share implementation

      // Is Unit (1 or -1)
      LargeNumber.prototype.isUnit = function() {
        return false; // LargeNumber cannot be 1 or -1
      };
      SmallNumber.prototype.isUnit = function() {
        return Math.abs(this.value) === 1;
      };
      NativeBigInt.prototype.isUnit = function() {
        return this.abs().value === BigInt(1);
      };

      // Is Zero
      LargeNumber.prototype.isZero = function() {
        return false; // LargeNumber cannot be 0
      };
      SmallNumber.prototype.isZero = function() {
        return this.value === 0;
      };
      NativeBigInt.prototype.isZero = function() {
        return this.value === BigInt(0);
      };

      // Is Divisible By
      LargeNumber.prototype.isDivisibleBy = function(otherBigInt) {
        const divisor = _normalizeInputToBigInt(otherBigInt);
        // Cannot divide by zero
        if (divisor.isZero()) return false;
        // Any number is divisible by 1 or -1
        if (divisor.isUnit()) return true;
        // If divisor is 2 (or -2), check if this number is even
        if (divisor.compareAbs(2) === 0) return this.isEven();
        // Otherwise, check if remainder is zero
        return this.mod(divisor).isZero();
      };
      NativeBigInt.prototype.isDivisibleBy = SmallNumber.prototype.isDivisibleBy = LargeNumber.prototype.isDivisibleBy; // Share implementation

      // Is Prime (deterministic for small numbers, probabilistic for larger)
      LargeNumber.prototype.isPrime = function(numIterations) {
        // First, check quick primality tests
        const quickCheckResult = _isQuickCheckPrime(this);
        if (quickCheckResult !== undefined) return quickCheckResult;

        const absoluteValue = this.abs();
        const bitLength = absoluteValue.bitLength();

        // For numbers up to 64 bits, use a specific set of bases for deterministic Miller-Rabin
        if (bitLength.lesserOrEquals(64)) {
          // Bases for deterministic Miller-Rabin up to 2^64
          const fixedBases = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37];
          return _runMillerRabinTest(absoluteValue, fixedBases);
        }

        // For larger numbers, use a probabilistic Miller-Rabin test
        // Calculate number of iterations based on bit length for desired confidence
        const ln2_times_bitLength = Math.log(2) * bitLength.toJSNumber();
        const iterations = Math.ceil(numIterations === true ? 2 * Math.pow(ln2_times_bitLength, 2) : ln2_times_bitLength);

        // Generate random bases
        const randomBases = [];
        for (let i = 0; i < iterations; i++) {
          randomBases.push(createBigIntFactory.randBetween(2, absoluteValue.minus(2)));
        }
        return _runMillerRabinTest(absoluteValue, randomBases);
      };
      NativeBigInt.prototype.isPrime = SmallNumber.prototype.isPrime = LargeNumber.prototype.isPrime;

      // Is Probable Prime (probabilistic Miller-Rabin)
      LargeNumber.prototype.isProbablePrime = function(numIterations) {
        // First, check quick primality tests
        const quickCheckResult = _isQuickCheckPrime(this);
        if (quickCheckResult !== undefined) return quickCheckResult;

        const absoluteValue = this.abs();
        const iterations = numIterations === undefined ? 5 : numIterations; // Default 5 iterations

        // Generate random bases
        const randomBases = [];
        for (let i = 0; i < iterations; i++) {
          randomBases.push(createBigIntFactory.randBetween(2, absoluteValue.minus(2)));
        }
        return _runMillerRabinTest(absoluteValue, randomBases);
      };
      NativeBigInt.prototype.isProbablePrime = SmallNumber.prototype.isProbablePrime = LargeNumber.prototype.isProbablePrime;

      // Modular Inverse (a^-1 mod m)
      LargeNumber.prototype.modInv = function(modulusBigInt) {
        let currentDividend = createBigInt._cachedConstants[0]; // Represents x0 in extended Euclidean algorithm
        let currentDivisor = createBigInt._cachedConstants[1]; // Represents x1
        let a = _normalizeInputToBigInt(modulusBigInt); // `m` in a^-1 mod m
        let b = this.abs(); // `a` in a^-1 mod m

        // Extended Euclidean Algorithm
        while (!b.isZero()) {
          const [quotient, remainder] = a.divmod(b); // q = a / b, r = a % b
          // Update (x0, x1) and (a, b)
          const tempX0 = currentDividend;
          const tempA = a;
          currentDividend = currentDivisor;
          a = b;
          currentDivisor = tempX0.subtract(quotient.multiply(currentDivisor));
          b = remainder;
        }

        // If gcd(a, m) is not 1, then modular inverse does not exist
        if (!a.isUnit()) {
          throw new Error(this.toString() + " and " + modulusBigInt.toString() + " are not coprime. Modular inverse does not exist.");
        }

        // Ensure result is positive
        if (currentDividend.compare(0) < 0) {
          currentDividend = currentDividend.add(modulusBigInt);
        }
        // If original number was negative, negate the result
        return this.isNegative() ? currentDividend.negate() : currentDividend;
      };
      NativeBigInt.prototype.modInv = SmallNumber.prototype.modInv = LargeNumber.prototype.modInv;

      // Next (add 1)
      LargeNumber.prototype.next = function() {
        // If negative, it means (abs(value) - 1) and keep negative sign.
        // If positive, it means (abs(value) + 1) and keep positive sign.
        return this.sign ? _subtractSmallFromDigitArray(this.value, 1, this.sign) : new LargeNumber(_addSmallToDigitArray(this.value, 1), this.sign);
      };
      SmallNumber.prototype.next = function() {
        const nextValue = this.value + 1;
        // If nextValue still fits in small number, return SmallNumber
        if (nextValue < MAX_SAFE_JS_INT) {
          return new SmallNumber(nextValue);
        }
        // Otherwise, convert to LargeNumber (MAX_SAFE_JS_INT becomes a LargeNumber)
        return new LargeNumber(MAX_SAFE_JS_INT_PARTS, false);
      };
      NativeBigInt.prototype.next = function() {
        return new NativeBigInt(this.value + BigInt(1));
      };

      // Previous (subtract 1)
      LargeNumber.prototype.prev = function() {
        // If negative, it means (abs(value) + 1) and keep negative sign.
        // If positive, it means (abs(value) - 1) and keep positive sign.
        return this.sign ? new LargeNumber(_addSmallToDigitArray(this.value, 1), true) : _subtractSmallFromDigitArray(this.value, 1, this.sign);
      };
      SmallNumber.prototype.prev = function() {
        const prevValue = this.value - 1;
        // If prevValue still fits in small number, return SmallNumber
        if (prevValue > -MAX_SAFE_JS_INT) {
          return new SmallNumber(prevValue);
        }
        // Otherwise, convert to LargeNumber (-MAX_SAFE_JS_INT becomes a LargeNumber)
        return new LargeNumber(MAX_SAFE_JS_INT_PARTS, true);
      };
      NativeBigInt.prototype.prev = function() {
        return new NativeBigInt(this.value - BigInt(1));
      };

      // --- Bitwise Operations ---

      // Pre-calculated powers of 2 for shift operations
      const _POWER_OF_TWO_CACHE = [1];
      while (2 * _POWER_OF_TWO_CACHE[_POWER_OF_TWO_CACHE.length - 1] <= BASE_MAGNITUDE) {
        _POWER_OF_TWO_CACHE.push(2 * _POWER_OF_TWO_CACHE[_POWER_OF_TWO_CACHE.length - 1]);
      }
      const _POWER_OF_TWO_CACHE_LENGTH = _POWER_OF_TWO_CACHE.length;
      const _LARGEST_CACHE_POWER = _POWER_OF_TWO_CACHE[_POWER_OF_TWO_CACHE_LENGTH - 1];

      /**
       * Checks if a number is within a safe range for JavaScript bitwise shifts.
       * @param {number} num - The number to check.
       * @returns {boolean} True if safe, false otherwise.
       */
      function _isJsNumberShiftable(num) {
        return Math.abs(num) <= BASE_MAGNITUDE; // Using BASE_MAGNITUDE as a heuristic for shiftability range
      }

      /**
       * Performs a bitwise operation (AND, OR, XOR) on two BigInts.
       * Iterates through digit arrays, applying the operation on corresponding parts.
       * Handles signs and different lengths.
       * @param {BigIntObject} operand1 - The first BigInt operand.
       * @param {BigIntObject} operand2 - The second BigInt operand.
       * @param {function(number, number): number} operationFn - The bitwise function (e.g., `(a, b) => a & b`).
       * @returns {BigIntObject} The result of the bitwise operation.
       */
      function _performBitwiseOperation(operand1, operand2, operationFn) {
        const a = _normalizeInputToBigInt(operand1);
        const b = _normalizeInputToBigInt(operand2);

        // Determine effective values for signed bitwise operations
        const isANegative = a.isNegative();
        const isBNegative = b.isNegative();
        const absA = isANegative ? a.not() : a; // Apply two's complement for negative numbers
        const absB = isBNegative ? b.not() : b;

        let resultDigits = [];
        let currentShiftedA, currentShiftedB;
        let currentRemainderA, currentRemainderB;
        let aParts = absA;
        let bParts = absB;
        let index = 0;

        // Iterate while either operand has remaining parts
        while (!aParts.isZero() || !bParts.isZero()) {
          // Divide by _LARGEST_CACHE_POWER to get "digits" for bitwise operation
          currentShiftedA = _performDivisionAndModulus(aParts, _LARGEST_CACHE_POWER);
          currentRemainderA = currentShiftedA[1].toJSNumber();
          aParts = currentShiftedA[0];

          currentShiftedB = _performDivisionAndModulus(bParts, _LARGEST_CACHE_POWER);
          currentRemainderB = currentShiftedB[1].toJSNumber();
          bParts = currentShiftedB[0];

          // Apply the bitwise operation on the current "digits"
          resultDigits.push(operationFn(currentRemainderA, currentRemainderB));
          index++;
        }

        // Determine sign of the result
        const finalSignResult = operationFn(isANegative ? 1 : 0, isBNegative ? 1 : 0);
        let finalBigIntResult = createBigIntFactory.fromArray(resultDigits, _LARGEST_CACHE_POWER, false);

        // If the result should be negative, apply two's complement again
        if (finalSignResult !== 0) {
          finalBigIntResult = finalBigIntResult.not();
        }
        return finalBigIntResult;
      }

      // Shift Left
      LargeNumber.prototype.shiftLeft = function(shiftAmountBigInt) {
        const shiftAmount = _normalizeInputToBigInt(shiftAmountBigInt).toJSNumber();
        if (!_isJsNumberShiftable(shiftAmount)) {
          throw new Error("Shift amount " + String(shiftAmount) + " is too large for shifting.");
        }
        if (shiftAmount < 0) {
          return this.shiftRight(-shiftAmount);
        }
        // If shifting by 0, return original number
        if (shiftAmount === 0 || this.isZero()) {
          return this;
        }

        let resultBigInt = this;
        let remainingShift = shiftAmount;

        // Shift by large chunks using multiplication by powers of BASE_MAGNITUDE
        while (remainingShift >= _POWER_OF_TWO_CACHE_LENGTH) {
          resultBigInt = resultBigInt.multiply(_LARGEST_CACHE_POWER);
          remainingShift -= (_POWER_OF_TWO_CACHE_LENGTH - 1); // _LARGEST_CACHE_POWER is 2^(L-1)
        }
        // Shift by remaining smaller amount using cached powers of 2
        return resultBigInt.multiply(_POWER_OF_TWO_CACHE[remainingShift]);
      };
      NativeBigInt.prototype.shiftLeft = SmallNumber.prototype.shiftLeft = LargeNumber.prototype.shiftLeft;

      // Shift Right
      LargeNumber.prototype.shiftRight = function(shiftAmountBigInt) {
        const shiftAmount = _normalizeInputToBigInt(shiftAmountBigInt).toJSNumber();
        if (!_isJsNumberShiftable(shiftAmount)) {
          throw new Error("Shift amount " + String(shiftAmount) + " is too large for shifting.");
        }
        if (shiftAmount < 0) {
          return this.shiftLeft(-shiftAmount);
        }
        // If shifting by 0, return original number
        if (shiftAmount === 0 || this.isZero()) {
          return this;
        }
        // For negative numbers, shifting right is equivalent to floor(num / 2^shift)
        // JavaScript's `>>` operator performs sign-preserving right shift (truncates towards negative infinity for negative numbers)
        // BigInt's `>>` truncates towards zero.
        // The original big-integer library implements arithmetic right shift for negative numbers (floor towards negative infinity).
        // For example, -5 >> 1 = -3.
        // (A / 2^S) rounded towards negative infinity.
        // If negative and result becomes -1 after shifting, return -1.
        if (this.isNegative() && this.equals(-1)) {
          return createBigInt._cachedConstants[-1];
        }

        let resultBigInt = this;
        let remainingShift = shiftAmount;

        // Shift by large chunks using division by powers of BASE_MAGNITUDE
        while (remainingShift >= _POWER_OF_TWO_CACHE_LENGTH) {
          if (resultBigInt.isZero() || (resultBigInt.isNegative() && resultBigInt.isUnit())) {
            return resultBigInt; // Optimization for -1 or 0
          }
          const [quotient, remainder] = _performDivisionAndModulus(resultBigInt, _LARGEST_CACHE_POWER);
          resultBigInt = remainder.isNegative() ? quotient.prev() : quotient; // Handle negative numbers for floor behavior
          remainingShift -= (_POWER_OF_TWO_CACHE_LENGTH - 1);
        }

        // Shift by remaining smaller amount using cached powers of 2
        const [quotient, remainder] = _performDivisionAndModulus(resultBigInt, _POWER_OF_TWO_CACHE[remainingShift]);
        return remainder.isNegative() ? quotient.prev() : quotient; // Handle negative numbers for floor behavior
      };
      NativeBigInt.prototype.shiftRight = SmallNumber.prototype.shiftRight = LargeNumber.prototype.shiftRight;

      // Bitwise NOT (Two's Complement)
      LargeNumber.prototype.not = function() {
        return this.negate().prev(); // ~x = -x - 1
      };
      NativeBigInt.prototype.not = SmallNumber.prototype.not = LargeNumber.prototype.not;

      // Bitwise AND
      LargeNumber.prototype.and = function(otherBigInt) {
        return _performBitwiseOperation(this, otherBigInt, (a, b) => a & b);
      };
      NativeBigInt.prototype.and = SmallNumber.prototype.and = LargeNumber.prototype.and;

      // Bitwise OR
      LargeNumber.prototype.or = function(otherBigInt) {
        return _performBitwiseOperation(this, otherBigInt, (a, b) => a | b);
      };
      NativeBigInt.prototype.or = SmallNumber.prototype.or = LargeNumber.prototype.or;

      // Bitwise XOR
      LargeNumber.prototype.xor = function(otherBigInt) {
        return _performBitwiseOperation(this, otherBigInt, (a, b) => a ^ b);
      };
      NativeBigInt.prototype.xor = SmallNumber.prototype.xor = LargeNumber.prototype.xor;

      // --- Other Operations ---

      const _MAGIC_SHIFT_CONST_1 = 1 << 30; // 2^30
      const _MAGIC_SHIFT_CONST_2 = (BASE_MAGNITUDE & -BASE_MAGNITUDE) * (BASE_MAGNITUDE & -BASE_MAGNITUDE) | _MAGIC_SHIFT_CONST_1;

      /**
       * Returns the value of the least significant bit (LSB) that is set.
       * Equivalent to `val & -val`.
       * @param {BigIntObject} num - The BigInt to check.
       * @returns {number|BigInt} The value of the LSB.
       */
      function _getLowestSetBitValue(num) {
        const val = num.value;
        if (typeof val === "number") {
          return val | _MAGIC_SHIFT_CONST_1 & -val | _MAGIC_SHIFT_CONST_1; // Ensure 32-bit behavior for small numbers
        } else if (typeof val === "bigint") {
          return val | BigInt(_MAGIC_SHIFT_CONST_1) & -val | BigInt(_MAGIC_SHIFT_CONST_1); // For native BigInt
        } else { // Array of digits
          // The lowest set bit is in the first non-zero digit.
          // Find the first non-zero digit and apply bitwise AND with its negative.
          for (let i = 0; i < val.length; i++) {
            if (val[i] !== 0) {
              return val[i] & -val[i];
            }
          }
          return 0; // If all digits are zero
        }
      }

      /**
       * Finds the maximum of two BigInts.
       * @param {BigIntObject} num1 - The first BigInt.
       * @param {BigIntObject} num2 - The second BigInt.
       * @returns {BigIntObject} The larger BigInt.
       */
      function _findMaximumBigInt(num1, num2) {
        num1 = _normalizeInputToBigInt(num1);
        num2 = _normalizeInputToBigInt(num2);
        return num1.greater(num2) ? num1 : num2;
      }

      /**
       * Finds the minimum of two BigInts.
       * @param {BigIntObject} num1 - The first BigInt.
       * @param {BigIntObject} num2 - The second BigInt.
       * @returns {BigIntObject} The smaller BigInt.
       */
      function _findMinimumBigInt(num1, num2) {
        num1 = _normalizeInputToBigInt(num1);
        num2 = _normalizeInputToBigInt(num2);
        return num1.lesser(num2) ? num1 : num2;
      }

      /**
       * Calculates the Greatest Common Divisor (GCD) of two BigInts using Euclidean algorithm.
       * @param {BigIntObject} num1 - The first BigInt.
       * @param {BigIntObject} num2 - The second BigInt.
       * @returns {BigIntObject} The GCD.
       */
      function _calculateGreatestCommonDivisor(num1, num2) {
        num1 = _normalizeInputToBigInt(num1).abs();
        num2 = _normalizeInputToBigInt(num2).abs();

        // Handle edge cases: if numbers are equal, return one of them
        if (num1.equals(num2)) return num1;
        // If one is zero, return the other (abs value)
        if (num1.isZero()) return num2;
        if (num2.isZero()) return num1;

        let commonFactors = createBigInt._cachedConstants[1]; // Stores common factors of 2

        // Remove common factors of 2 (binary GCD optimization)
        while (num1.isEven() && num2.isEven()) {
          const lsb1 = _getLowestSetBitValue(num1);
          const lsb2 = _getLowestSetBitValue(num2);
          const minLsb = _findMinimumBigInt(lsb1, lsb2);
          num1 = num1.divide(minLsb);
          num2 = num2.divide(minLsb);
          commonFactors = commonFactors.multiply(minLsb);
        }

        // Remove remaining factors of 2 from num1
        while (num1.isEven()) {
          num1 = num1.divide(_getLowestSetBitValue(num1));
        }

        // Euclidean algorithm (subtractive version)
        let tempNum;
        do {
          while (num2.isEven()) {
            num2 = num2.divide(_getLowestSetBitValue(num2));
          }
          // Ensure num1 >= num2 for subtraction
          if (num1.greater(num2)) {
            tempNum = num2;
            num2 = num1;
            num1 = tempNum;
          }
          num2 = num2.subtract(num1);
        } while (!num2.isZero());

        return num1.multiply(commonFactors);
      }

      // Bit Length
      LargeNumber.prototype.bitLength = function() {
        let tempBigInt = this;
        // For negative numbers, bit length is usually defined for two's complement,
        // so it's bitLength(~x) + 1.
        if (tempBigInt.compareTo(createBigInt._cachedConstants[0]) < 0) {
          tempBigInt = tempBigInt.negate().subtract(createBigInt._cachedConstants[1]);
        }
        if (tempBigInt.compareTo(createBigInt._cachedConstants[0]) === 0) {
          return createBigInt._cachedConstants[0];
        }

        // Recursive helper to find bit length (p, e) where p is 2^e <= num < 2^(e+1)
        const _findPowerOfTwo = (currentNum, currentPowerOfTwo) => {
          if (currentPowerOfTwo.compareTo(currentNum) <= 0) {
            const nextPowerInfo = _findPowerOfTwo(currentNum, currentPowerOfTwo.square(currentPowerOfTwo));
            const p = nextPowerInfo.p;
            const e = nextPowerInfo.e;
            const product = p.multiply(currentPowerOfTwo);
            // If product (2^(2e+1)) is still <= currentNum, then exponent is 2e+1
            if (product.compareTo(currentNum) <= 0) {
              return {
                p: product,
                e: 2 * e + 1
              };
            }
            // Otherwise, exponent is 2e
            return {
              p: p,
              e: 2 * e
            };
          }
          return {
            p: createBigInt._cachedConstants[1],
            e: 0
          };
        };

        // Bit length = floor(log2(num)) + 1
        // Which is equivalent to 'e' + 1 from the helper
        return _findPowerOfTwo(tempBigInt, createBigInt._cachedConstants[2]).e.add(createBigInt._cachedConstants[1]);
      };
      NativeBigInt.prototype.bitLength = SmallNumber.prototype.bitLength = LargeNumber.prototype.bitLength;

      /**
       * Parses a string in a given radix into a BigInt.
       * @param {string} inputString - The string to parse.
       * @param {number} radix - The radix (base) of the string.
       * @param {string} [customRadixChars] - Custom characters for the radix.
       * @param {boolean} [caseSensitive=false] - Whether parsing is case-sensitive.
       * @returns {BigIntObject} The resulting BigInt.
       * @throws {Error} If an invalid digit is encountered.
       */
      let _parseBaseString = function(inputString, radix, customRadixChars, caseSensitive) {
        customRadixChars = customRadixChars || DEFAULT_RADIX_CHARS;
        inputString = String(inputString);

        // Normalize string and radix chars for case-insensitivity if needed
        if (!caseSensitive) {
          inputString = inputString.toLowerCase();
          customRadixChars = customRadixChars.toLowerCase();
        }

        const stringLength = inputString.length;
        const base = Math.abs(radix); // Use absolute value of radix
        const digitMap = {}; // Map characters to their numeric values
        for (let i = 0; i < customRadixChars.length; i++) {
          digitMap[customRadixChars[i]] = i;
        }

        // Validate input string characters
        for (let i = 0; i < stringLength; i++) {
          const char = inputString[i];
          if (char === "-") continue; // Allow leading minus sign
          // Check if char is in digit map and its value is less than the base
          if (digitMap[char] !== undefined && digitMap[char] >= base) {
            // Special case for base 1: only '1' is valid
            if (char === "1" && base === 1) continue;
            throw new Error(`Invalid digit '${char}' in base ${radix}.`);
          }
          // Handle custom "digits" enclosed in < >
          if (char === "<") {
            let endIndex = i;
            while (inputString[endIndex] !== ">" && endIndex < stringLength) {
              endIndex++;
            }
            if (endIndex === stringLength) {
              throw new Error(`Unclosed custom digit sequence starting at index ${i}.`);
            }
            const customDigitValue = parseInt(inputString.slice(i + 1, endIndex), 10);
            if (isNaN(customDigitValue) || customDigitValue >= base) {
              throw new Error(`Invalid custom digit value '${inputString.slice(i + 1, endIndex)}' in base ${radix}.`);
            }
            i = endIndex; // Advance index past the custom digit
            continue;
          }
          // If char is not in digit map and not a custom digit, it's invalid
          if (digitMap[char] === undefined && char !== "-") {
            throw new Error(`Invalid character '${char}' in base ${radix}.`);
          }
        }

        const normalizedRadix = _normalizeInputToBigInt(radix);
        const parsedDigits = [];
        const isNegative = inputString[0] === "-";

        // Parse string into an array of BigInt digits
        for (let i = isNegative ? 1 : 0; i < inputString.length; i++) {
          const char = inputString[i];
          if (char in digitMap) {
            parsedDigits.push(_normalizeInputToBigInt(digitMap[char]));
          } else if (char === "<") { // Handle custom "digits"
            let endIndex = i;
            while (inputString[endIndex] !== ">" && endIndex < inputString.length) {
              endIndex++;
            }
            parsedDigits.push(_normalizeInputToBigInt(inputString.slice(i + 1, endIndex)));
            i = endIndex;
          }
        }
        return _fromDigitArrayToBase(parsedDigits, normalizedRadix, isNegative);
      };

      /**
       * Converts an array of BigInt "digits" in a given base to a single BigInt.
       * Implements Horner's method for polynomial evaluation.
       * @param {BigIntObject[]} digitBigInts - Array of digits as BigInt objects.
       * @param {BigIntObject} baseBigInt - The base as a BigInt object.
       * @param {boolean} isNegative - Whether the final result should be negative.
       * @returns {BigIntObject} The resulting BigInt.
       */
      function _fromDigitArrayToBase(digitBigInts, baseBigInt, isNegative) {
        let result = createBigInt._cachedConstants[0]; // Initialize to 0
        let currentPower = createBigInt._cachedConstants[1]; // Initialize to 1 (base^0)

        // Iterate from least significant digit to most significant
        for (let i = digitBigInts.length - 1; i >= 0; i--) {
          result = result.add(digitBigInts[i].times(currentPower));
          currentPower = currentPower.times(baseBigInt);
        }
        return isNegative ? result.negate() : result;
      }

      /**
       * Converts a BigInt to an array of digits in a specified base.
       * @param {BigIntObject} bigIntNum - The BigInt to convert.
       * @param {BigIntObject} baseBigInt - The target base as a BigInt object.
       * @returns {{value: number[], isNegative: boolean}} An object containing the digit array and sign.
       * @throws {Error} If base is zero for non-zero number.
       */
      function _toDigitArrayFromBase(bigIntNum, baseBigInt) {
        // Handle base zero
        if (baseBigInt.isZero()) {
          if (bigIntNum.isZero()) {
            return {
              value: [0],
              isNegative: false
            };
          }
          throw new Error("Cannot convert non-zero numbers to base 0.");
        }

        // Handle base -1
        if (baseBigInt.equals(-1)) {
          if (bigIntNum.isZero()) {
            return {
              value: [0],
              isNegative: false
            };
          }
          // For negative numbers in base -1, the representation depends on the exact algorithm.
          // The original code uses a specific pattern for negative numbers.
          if (bigIntNum.isNegative()) {
            // Example: -1 (base -1) = 1, -2 (base -1) = 101, -3 (base -1) = 10
            // This is a specialized representation.
            const absValue = bigIntNum.negate().toJSNumber(); // Assuming absValue is small enough
            const pattern = [];
            // Generate sequence like [1,0,1,0,1] for -2, -4, etc.
            for (let i = 0; i < absValue; i++) {
              pattern.push(i % 2 === 0 ? 1 : 0);
            }
            return {
              value: pattern,
              isNegative: false
            };
          }
          // For positive numbers in base -1, e.g., 2 (base -1) = 110
          const absValue = bigIntNum.toJSNumber(); // Assuming absValue is small enough
          const resultArr = [];
          for (let i = 0; i < absValue - 1; i++) {
            resultArr.push(0, 1); // [0,1,0,1,...]
          }
          resultArr.unshift(1); // Prepend 1
          return {
            value: resultArr,
            isNegative: false
          };
        }

        let isResultNegative = false;
        // If bigIntNum is negative and base is positive, make bigIntNum positive and mark result as negative
        if (bigIntNum.isNegative() && baseBigInt.isPositive()) {
          isResultNegative = true;
          bigIntNum = bigIntNum.abs();
        }

        // Handle base 1
        if (baseBigInt.isUnit()) {
          if (bigIntNum.isZero()) {
            return {
              value: [0],
              isNegative: false
            };
          }
          // For base 1, representation is just `num` ones.
          const onesArray = Array(bigIntNum.toJSNumber()).fill(1);
          return {
            value: onesArray,
            isNegative: isResultNegative
          };
        }

        const digitList = [];
        let currentNum = bigIntNum;

        // Repeated division and remainder until currentNum is 0
        while (currentNum.isNegative() || currentNum.compareAbs(baseBigInt) >= 0) {
          const {
            quotient,
            remainder
          } = currentNum.divmod(baseBigInt);
          currentNum = quotient;
          let currentRemainder = remainder;

          // If remainder is negative (e.g., -5 % 3 = -2), adjust it and quotient
          if (currentRemainder.isNegative()) {
            currentRemainder = baseBigInt.minus(currentRemainder).abs(); // abs(base - remainder)
            currentNum = currentNum.next(); // Increment quotient
          }
          digitList.push(currentRemainder.toJSNumber());
        }
        digitList.push(currentNum.toJSNumber()); // Add the final quotient

        return {
          value: digitList.reverse(), // Digits are collected in reverse order
          isNegative: isResultNegative
        };
      }

      /**
       * Formats a BigInt into a string representation in a given base.
       * @param {BigIntObject} bigIntNum - The BigInt to format.
       * @param {number} radix - The target base.
       * @param {string} [customRadixChars] - Custom characters for the radix.
       * @returns {string} The string representation.
       */
      function _formatBigIntToBaseString(bigIntNum, radix, customRadixChars) {
        const converted = _toDigitArrayFromBase(bigIntNum, createBigInt(radix));
        const chars = customRadixChars || DEFAULT_RADIX_CHARS;

        // Map numeric digits to character representation
        const digitChars = converted.value.map(digit => {
          // If digit is within standard chars, use it
          if (digit < chars.length) {
            return chars[digit];
          }
          // Otherwise, enclose in < > for custom digits
          return `<${digit}>`;
        });
        return (converted.isNegative ? "-" : "") + digitChars.join("");
      }

      /**
       * Parses a string into a BigInt. Handles decimal, scientific notation, and negative numbers.
       * @param {string} inputString - The string to parse.
       * @returns {BigIntObject} The resulting BigInt.
       * @throws {Error} If the string is not a valid integer.
       */
      function _parseStringIntoBigInt(inputString) {
        // Optimize for small numbers that can be parsed directly by JS
        if (isSmallJsNumber(+inputString)) {
          const parsedNum = +inputString;
          // Ensure it's an integer
          if (parsedNum !== _truncateToInteger(parsedNum)) {
            throw new Error("Invalid integer: " + inputString);
          }
          return HAS_NATIVE_BIGINT ? new NativeBigInt(BigInt(parsedNum)) : new SmallNumber(parsedNum);
        }

        let isNegative = false;
        if (inputString[0] === "-") {
          isNegative = true;
          inputString = inputString.slice(1);
        }

        // Handle scientific notation (e.g., "1.23e+5")
        const parts = inputString.split(/e/i);
        if (parts.length > 2) {
          throw new Error("Invalid integer: " + parts.join("e"));
        }
        if (parts.length === 2) {
          let exponentStr = parts[1];
          // Remove '+' sign from exponent if present
          if (exponentStr[0] === "+") {
            exponentStr = exponentStr.slice(1);
          }
          const exponentNum = +exponentStr;
          // Validate exponent: must be an integer and within JS safe range
          if (exponentNum !== _truncateToInteger(exponentNum) || !isSmallJsNumber(exponentNum)) {
            throw new Error("Invalid integer: " + exponentNum + " is not a valid exponent.");
          }

          let baseNumStr = parts[0];
          const decimalPointIndex = baseNumStr.indexOf(".");
          if (decimalPointIndex >= 0) {
            // Adjust exponent for decimal point
            exponentNum -= (baseNumStr.length - decimalPointIndex - 1);
            baseNumStr = baseNumStr.slice(0, decimalPointIndex) + baseNumStr.slice(decimalPointIndex + 1);
          }

          // If exponent is negative, the number is fractional, not an integer
          if (exponentNum < 0) {
            throw new Error("Cannot include negative exponent part for integers.");
          }
          // Append zeros for positive exponent
          inputString = baseNumStr + "0".repeat(exponentNum);
        }

        // Validate that the string contains only digits
        if (!/^\d+$/.test(inputString)) {
          throw new Error("Invalid integer: " + inputString);
        }

        // If native BigInt is available, use it directly
        if (HAS_NATIVE_BIGINT) {
          return new NativeBigInt(isNegative ? BigInt("-" + inputString) : BigInt(inputString));
        }

        // For non-native BigInt, convert string to digit array
        const digitArray = [];
        const stringLength = inputString.length;
        const groupSize = DIGIT_GROUP_SIZE; // 7 digits per group
        let endIndex = stringLength;
        let startIndex = stringLength - groupSize;

        while (endIndex > 0) {
          if (startIndex < 0) startIndex = 0; // Ensure startIndex doesn't go below 0
          digitArray.push(+inputString.slice(startIndex, endIndex));
          endIndex = startIndex;
          startIndex -= groupSize;
        }
        _internalTrimArray(digitArray); // Remove any leading zeros (shouldn't be any from this process, but good for consistency)
        return new LargeNumber(digitArray, isNegative);
      }

      /**
       * Normalizes various input types into a BigInt object (LargeNumber, SmallNumber, or NativeBigInt).
       * This is the primary internal conversion function.
       * @param {any} input - The value to normalize.
       * @returns {BigIntObject} A BigInt instance.
       * @throws {Error} For invalid input types.
       */
      function _normalizeInputToBigInt(input) {
        if (typeof input === "number") {
          // If native BigInt is available, convert number to BigInt
          if (HAS_NATIVE_BIGINT) return new NativeBigInt(BigInt(input));
          // Check if number fits in SmallNumber
          if (isSmallJsNumber(input)) {
            if (input !== _truncateToInteger(input)) {
              throw new Error(input + " is not an integer.");
            }
            return new SmallNumber(input);
          }
          // Otherwise, parse as string for LargeNumber
          return _parseStringIntoBigInt(input.toString());
        }
        if (typeof input === "string") {
          return _parseStringIntoBigInt(input);
        }
        if (typeof input === "bigint") {
          return new NativeBigInt(input);
        }
        // If already a BigInt object, return it directly
        if (input instanceof LargeNumber || input instanceof SmallNumber || input instanceof NativeBigInt) {
          return input;
        }
        // Throw error for unsupported types
        throw new Error("Invalid input type for BigInt: " + (typeof input));
      }

      // --- Conversion Methods for BigInt Objects ---

      LargeNumber.prototype.toArray = function(radix) {
        return _toDigitArrayFromBase(this, _normalizeInputToBigInt(radix));
      };
      SmallNumber.prototype.toArray = function(radix) {
        return _toDigitArrayFromBase(this, _normalizeInputToBigInt(radix));
      };
      NativeBigInt.prototype.toArray = function(radix) {
        return _toDigitArrayFromBase(this, _normalizeInputToBigInt(radix));
      };

      LargeNumber.prototype.toString = function(radix, customRadixChars) {
        if (radix === undefined) radix = 10;
        if (radix !== 10) {
          return _formatBigIntToBaseString(this, radix, customRadixChars);
        }
        // Optimized decimal string conversion for LargeNumber
        const valueParts = this.value;
        const numParts = valueParts.length;
        let resultString = String(valueParts[numParts - 1]); // Start with most significant part

        // Append remaining parts, padding with zeros if necessary
        for (let i = numParts - 2; i >= 0; --i) {
          const currentPart = String(valueParts[i]);
          resultString += "0".repeat(DIGIT_GROUP_SIZE - currentPart.length) + currentPart;
        }
        return (this.sign ? "-" : "") + resultString;
      };
      SmallNumber.prototype.toString = function(radix, customRadixChars) {
        if (radix === undefined) radix = 10;
        if (radix !== 10) {
          return _formatBigIntToBaseString(this, radix, customRadixChars);
        }
        return String(this.value);
      };
      NativeBigInt.prototype.toString = SmallNumber.prototype.toString; // Share implementation

      // JSON serialization (returns string representation)
      NativeBigInt.prototype.toJSON = LargeNumber.prototype.toJSON = SmallNumber.prototype.toJSON = function() {
        return this.toString();
      };

      // ValueOf (returns JS number if possible, otherwise string)
      LargeNumber.prototype.valueOf = function() {
        // Attempt to parse to JS number, but it will likely lose precision for large numbers
        const jsNum = parseInt(this.toString(), 10);
        if (Number.isSafeInteger(jsNum)) return jsNum;
        // If it's too big, return the string representation as a fallback for `valueOf`
        // or throw an error to indicate precision loss, depending on desired behavior.
        // The original big-integer returns parseInt for large numbers, which can be inaccurate.
        // For Type III, I'll keep the `parseInt` behavior as it's directly from original.
        return jsNum;
      };
      LargeNumber.prototype.toJSNumber = LargeNumber.prototype.valueOf; // Alias for consistency

      SmallNumber.prototype.valueOf = function() {
        return this.value;
      };
      SmallNumber.prototype.toJSNumber = SmallNumber.prototype.valueOf; // Alias

      NativeBigInt.prototype.valueOf = NativeBigInt.prototype.toJSNumber = function() {
        // Converting native BigInt to JS Number can lead to precision loss.
        // The original code uses parseInt, which is generally not ideal for BigInt.
        // For Type III, I'll keep the `parseInt` behavior for consistency with other types' valueOf.
        return parseInt(this.toString(), 10);
      };

      // --- Initialization of Cached Constants ---
      // Cache common BigInt values (0, 1, -1, etc.) for performance
      createBigInt._cachedConstants = [];
      for (let _initCounter = 0; _initCounter < 1000; _initCounter++) {
        createBigInt._cachedConstants[_initCounter] = _normalizeInputToBigInt(_initCounter);
        if (_initCounter > 0) {
          createBigInt._cachedConstants[-_initCounter] = _normalizeInputToBigInt(-_initCounter);
        }
      }

      // Expose common BigInt constants and utility functions
      createBigInt.one = createBigInt._cachedConstants[1];
      createBigInt.zero = createBigInt._cachedConstants[0];
      createBigInt.minusOne = createBigInt._cachedConstants[-1];
      createBigInt.max = _findMaximumBigInt;
      createBigInt.min = _findMinimumBigInt;
      createBigInt.gcd = _calculateGreatestCommonDivisor;
      createBigInt.lcm = function(num1, num2) {
        num1 = _normalizeInputToBigInt(num1).abs();
        num2 = _normalizeInputToBigInt(num2).abs();
        // lcm(a,b) = |a*b| / gcd(a,b)
        return num1.divide(_calculateGreatestCommonDivisor(num1, num2)).multiply(num2);
      };
      createBigInt.isInstance = function(obj) {
        return obj instanceof LargeNumber || obj instanceof SmallNumber || obj instanceof NativeBigInt;
      };

      /**
       * Generates a random BigInt within a specified range (inclusive).
       * @param {BigIntObject} lowerBound - The lower bound.
       * @param {BigIntObject} upperBound - The upper bound.
       * @returns {BigIntObject} A random BigInt.
       */
      createBigInt.randBetween = function(lowerBound, upperBound) {
        let minVal = _findMinimumBigInt(_normalizeInputToBigInt(lowerBound), _normalizeInputToBigInt(upperBound));
        let maxVal = _findMaximumBigInt(_normalizeInputToBigInt(lowerBound), _normalizeInputToBigInt(upperBound));
        const range = maxVal.subtract(minVal).add(1); // (max - min + 1)

        // If range is small, use standard Math.random
        if (range.isSmall) {
          return minVal.add(Math.floor(Math.random() * range.toJSNumber()));
        }

        // For large ranges, generate random digits
        const rangeParts = _toDigitArrayFromBase(range, createBigInt(BASE_MAGNITUDE)).value;
        const randomDigits = [];
        let canBeSmaller = true; // Flag to ensure generated number is within range

        for (let i = 0; i < rangeParts.length; i++) {
          const upperLimit = canBeSmaller ? rangeParts[i] : BASE_MAGNITUDE;
          const randomPart = _truncateToInteger(Math.random() * upperLimit);
          randomDigits.push(randomPart);
          if (randomPart < upperLimit) {
            canBeSmaller = false; // Once a digit is smaller, subsequent digits can be anything
          }
        }
        // Convert random digits back to BigInt and add to minVal
        return minVal.add(createBigInt.fromArray(randomDigits, BASE_MAGNITUDE, false));
      };

      /**
       * Creates a BigInt from an array of digits in a specified base.
       * @param {number[]} digitArray - The array of digits.
       * @param {number} [radix=10] - The base of the digits.
       * @param {boolean} [isNegative=false] - Whether the number is negative.
       * @returns {BigIntObject} The resulting BigInt.
       */
      createBigInt.fromArray = function(digitArray, radix, isNegative) {
        // Convert each digit to a BigInt object first
        const bigIntDigits = digitArray.map(_normalizeInputToBigInt);
        return _fromDigitArrayToBase(bigIntDigits, _normalizeInputToBigInt(radix || 10), isNegative);
      };

      return createBigInt;
    })();

    // Export the big-integer library
    if (typeof moduleRef !== "undefined" && moduleRef.hasOwnProperty("exports")) {
      moduleRef.exports = bigIntFactory;
    }
    if (typeof define === "function" && define.amd) {
      define("big-integer", [], function() {
        return bigIntFactory;
      });
    }

  }, {}],
  "Focm": [function(localRequire, moduleRef, moduleExports) {
    // This module contains application-specific logic, integrating the big-integer library
    // along with other utility modules for functional programming constructs.

    let appDataStore = {};

    (function(appNamespace) {
      const bigIntLib = localRequire("big-integer"); // Import the big-integer library

      // --- Data.BigInt Operations (wrapping big-integer library functions) ---

      /**
       * Curried function to parse a string in a given radix to a BigInt,
       * returning a Maybe type (Just for success, Nothing for failure).
       * @param {function(BigInt): Maybe.Just} justConstructor - Function to wrap a value in Just.
       * @returns {function(Maybe.Nothing): function(number): function(string): Maybe.Just|Maybe.Nothing}
       */
      appNamespace["fromRadixString"] = function(justConstructor) {
        return function(nothingValue) {
          return function(radix) {
            return function(inputString) {
              try {
                const parsedBigInt = bigIntLib(inputString, radix);
                return justConstructor(parsedBigInt);
              } catch (error) {
                // If parsing fails (e.g., invalid digit), return Nothing
                return nothingValue;
              }
            };
          };
        };
      };

      /**
       * Converts a JavaScript number to a BigInt.
       * @param {number} num - The number to convert.
       * @returns {BigIntObject}
       */
      appNamespace.fromInteger = function(num) {
        return bigIntLib(num);
      };

      /**
       * Curried function to convert a BigInt to its string representation in a given radix.
       * @param {number} radix - The target radix.
       * @returns {function(BigInt): string}
       */
      appNamespace.toRadixString = function(radix) {
        return function(bigIntVal) {
          return bigIntVal.toString(radix);
        };
      };

      // Basic arithmetic operations, wrapped for functional style
      appNamespace.bigIntAdd = function(operandA) {
        return function(operandB) {
          return operandA.add(operandB);
        };
      };
      appNamespace.bigIntMultiply = function(operandA) {
        return function(operandB) {
          return operandA.multiply(operandB);
        };
      };
      appNamespace.bigIntSubtract = function(operandA) {
        return function(operandB) {
          return operandA.minus(operandB);
        };
      };
      appNamespace.bigIntModulo = function(operandA) {
        return function(operandB) {
          return operandA.mod(operandB);
        };
      };
      appNamespace.bigIntAreEquivalent = function(operandA) {
        return function(operandB) {
          return operandA.equals(operandB);
        };
      };

      appNamespace.isEvenNumber = function(bigIntVal) {
        return bigIntVal.isEven();
      };
      appNamespace.bigIntXOR = function(operandA) {
        return function(operandB) {
          return operandA.xor(operandB);
        };
      };

    })(appDataStore["Data.BigIntOps"] = appDataStore["Data.BigIntOps"] || {}); // Namespace for BigInt specific ops

    (function(appNamespace) {
      "use strict";
      // Dependencies: Data.Eq, Data.HeytingAlgebra, Data.Symbol, Data.Unit, Data.Void, Record.Unsafe, Type.Data.RowList
      // Placeholder for Eq type class definition
      appNamespace.Eq = function(eqFn) {
        this.eq = eqFn;
      };
      appNamespace.eq = function(instance) {
        return instance.eq;
      };
    })(appDataStore["Data.Eq"] = appDataStore["Data.Eq"] || {});

    (function(appNamespace) {
      "use strict";
      // Dependencies: Data.Functor
      appNamespace["Data.Functor"] = appNamespace["Data.Functor"] || {};
      appNamespace["Data.Functor"].arrayMapper = function(mappingFunction) {
        return function(inputArray) {
          const arrayLength = inputArray.length;
          const resultArray = new Array(arrayLength);
          for (let i = 0; i < arrayLength; i++) {
            resultArray[i] = mappingFunction(inputArray[i]);
          }
          return resultArray;
        };
      };
    })();

    (function(appNamespace) {
      "use strict";
      // Dependencies: Control.Semigroupoid, Data.Function, Data.Unit, Data.Functor.arrayMapper
      const arrayMap = appNamespace["Data.Functor"].arrayMapper;

      // Functor type class definition
      const Functor = function(mapFn) {
        this.map = mapFn;
      };
      const functorArrayInstance = new Functor(arrayMap);

      appNamespace.Functor = Functor;
      appNamespace.map = function(instance) {
        return instance.map;
      };
      appNamespace.functorArray = functorArrayInstance; // Export array functor instance
    })(appDataStore["Data.Functor"] = appDataStore["Data.Functor"] || {});

    (function(appNamespace) {
      "use strict";
      // Dependencies: Data.Show, Data.Symbol, Record.Unsafe, Type.Data.RowList
      // Placeholder for Show type class definition
      appNamespace.Show = function(showFn) {
        this.show = showFn;
      };
      appNamespace.show = function(instance) {
        return instance.show;
      };
    })(appDataStore["Data.Show"] = appNamespace["Data.Show"] || {});

    (function(appNamespace) {
      "use strict";
      // Dependencies: Control.Alt, Control.Alternative, Control.Applicative, Control.Apply, Control.Bind, Control.Category, Control.Extend, Control.Monad, Control.MonadZero, Control.Plus, Data.Bounded, Data.Eq, Data.Function, Data.Functor, Data.Functor.Invariant, Data.Monoid, Data.Ord, Data.Ordering, Data.Semigroup, Data.Show, Data.Unit, Prelude

      // Define Nothing (singleton for no value)
      const NothingConstructor = function() {};
      NothingConstructor.value = new NothingConstructor(); // Singleton instance
      const NothingValue = NothingConstructor.value;

      // Define Just (constructor for a present value)
      const JustConstructor = function(val) {
        this.value0 = val; // Store the wrapped value
      };
      JustConstructor.create = function(val) {
        return new JustConstructor(val);
      };

      appNamespace.NothingValue = NothingValue;
      appNamespace.JustValue = JustConstructor;
    })(appDataStore["Data.Maybe"] = appDataStore["Data.Maybe"] || {});

    (function(appNamespace) {
      "use strict";
      // Dependencies: Data.Semiring, Data.Symbol, Data.Unit, Record.Unsafe, Type.Data.Row, Type.Data.RowList
      // Semiring type class definition
      appNamespace.SemiringClass = function(addFn, mulFn, oneVal, zeroVal) {
        this.add = addFn;
        this.mul = mulFn;
        this.one = oneVal;
        this.zero = zeroVal;
      };
      appNamespace.add = function(instance) {
        return instance.add;
      };
      appNamespace.zero = function(instance) {
        return instance.zero;
      };
      appNamespace.mul = function(instance) {
        return instance.mul;
      };
      appNamespace.one = function(instance) {
        return instance.one;
      };
    })(appDataStore["Data.Semiring"] = appDataStore["Data.Semiring"] || {});

    (function(appNamespace) {
      "use strict";
      // Dependencies: Data.Ring, Data.Semiring, Data.Symbol, Data.Unit, Record.Unsafe, Type.Data.RowList
      // Ring type class definition (extends Semiring)
      appNamespace.RingClass = function(semiringParent, subFn) {
        this.Semiring0 = semiringParent; // Reference to parent Semiring instance
        this.sub = subFn;
      };
      appNamespace.sub = function(instance) {
        return instance.sub;
      };
    })(appDataStore["Data.Ring"] = appDataStore["Data.Ring"] || {});

    (function(appNamespace) {
      "use strict";
      // Partial.Unsafe module
      appNamespace.unsafePartialFn = function(thunk) {
        return thunk();
      };
    })(appDataStore["Partial.Unsafe"] = appDataStore["Partial.Unsafe"] || {});

    (function(appNamespace) {
      "use strict";
      // Partial module
      appNamespace.crashAndBurn = function() {
        return function(message) {
          throw new Error(message);
        };
      };
    })(appDataStore["Partial"] = appDataStore["Partial"] || {});

    (function(appNamespace) {
      "use strict";
      // Dependencies: Partial.Unsafe, Partial
      const unsafePartial = appNamespace["Partial.Unsafe"];
      const partial = appNamespace["Partial"];
      appNamespace.unsafeCrashAndBurn = function(message) {
        return unsafePartial.unsafePartialFn(function() {
          return partial.crashAndBurn()(message);
        });
      };
    })(appDataStore["Partial.Unsafe"] = appDataStore["Partial.Unsafe"] || {}); // Re-using Partial.Unsafe namespace

    (function(appNamespace) {
      "use strict";
      // Dependencies: Data.BigIntOps (bigIntLib wrapper), Data.Maybe, Data.Semiring, Data.Ring, Data.Eq
      const bigIntOps = appNamespace["Data.BigIntOps"];
      const Maybe = appNamespace["Data.Maybe"];
      const Semiring = appNamespace["Data.Semiring"];
      const Ring = appNamespace["Data.Ring"];
      const Eq = appNamespace["Data.Eq"];

      // --- BigInt Instance Definitions ---

      // Semiring instance for BigInt
      const bigIntSemiring = new Semiring.SemiringClass(
        bigIntOps.bigIntAdd,
        bigIntOps.bigIntMultiply,
        bigIntOps.fromInteger(1),
        bigIntOps.fromInteger(0)
      );

      // Ring instance for BigInt (extends Semiring)
      const bigIntRing = new Ring.RingClass(
        function() {
          return bigIntSemiring;
        }, // Thunk for Semiring parent
        bigIntOps.bigIntSubtract
      );

      // Eq instance for BigInt
      const equalityChecker = new Eq.Eq(bigIntOps.bigIntAreEquivalent);

      // --- Exported BigInt Utilities for application logic ---
      appNamespace.fromString = appNamespace["fromRadixString"](Maybe.JustValue.create)(Maybe.NothingValue.value)(10); // Decimal string parser
      appNamespace.fromBase = appNamespace["fromRadixString"];
      appNamespace.toString = appNamespace["toRadixString"](10); // Decimal string converter
      appNamespace.rem = bigIntOps.bigIntModulo; // Modulo operation
      appNamespace.eqBigInt = equalityChecker;
      appNamespace.semiringBigInt = bigIntSemiring;
      appNamespace.ringBigInt = bigIntRing;
      appNamespace.fromInt = bigIntOps.fromInteger;
      appNamespace.even = bigIntOps.isEvenNumber;
      appNamespace.xor = bigIntOps.bigIntXOR;

    })(appDataStore["Data.BigInt"] = appDataStore["Data.BigInt"] || {}); // Namespace for BigInt type class instances

    (function(appNamespace) {
      "use strict";
      // Data.Boolean module
      // 'otherwise' is a common Purescript idiom for a catch-all boolean true.
      appNamespace.otherwise = true;
    })(appDataStore["Data.Boolean"] = appDataStore["Data.Boolean"] || {});

    (function(appNamespace) {
      "use strict";
      // Data.String.Common module
      appNamespace.split = function(separator) {
        return function(inputString) {
          return inputString.split(separator);
        };
      };
      appNamespace.trim = function(inputString) {
        return inputString.trim();
      };
    })(appDataStore["Data.String.Common"] = appDataStore["Data.String.Common"] || {});

    (function(appNamespace) {
      "use strict";
      // Dependencies: Data.String.Common, Data.Eq, Data.Ordering, Data.String.Pattern, Prelude
      const stringCommon = appNamespace["Data.String.Common"];
      appNamespace.split = stringCommon.split;
      appNamespace.trim = stringCommon.trim;
    })(appDataStore["Data.String.Common"] = appDataStore["Data.String.Common"] || {}); // Re-using Data.String.Common namespace

    (function(appNamespace) {
      "use strict";
      // Dependencies: Data.BigInt, Data.Boolean, Data.Eq, Data.Functor, Data.Maybe, Data.Ring, Data.Semiring, Data.String.Common, Partial.Unsafe, Prelude

      const BigIntOps = appNamespace["Data.BigInt"];
      const BooleanUtils = appNamespace["Data.Boolean"];
      const Eq = appNamespace["Data.Eq"];
      const Functor = appNamespace["Data.Functor"];
      const Maybe = appNamespace["Data.Maybe"];
      const Ring = appNamespace["Data.Ring"];
      const Semiring = appNamespace["Data.Semiring"];
      const StringCommon = appNamespace["Data.String.Common"];
      const UnsafePartial = appNamespace["Partial.Unsafe"];

      /**
       * Calculates the XOR sum of numbers from A to B.
       * The function `f(N)` is defined as the XOR sum of numbers from 0 to N.
       * The XOR sum from A to B is `f(B) XOR f(A-1)`.
       * This implementation calculates `f(N)` recursively with optimizations.
       *
       * f(N) = N XOR f(N-1)
       * f(N) = N XOR (N-1) XOR f(N-2)
       *
       * The pattern for f(N) based on N mod 4 is:
       * N % 4 == 0: N
       * N % 4 == 1: 1
       * N % 4 == 2: N + 1
       * N % 4 == 3: 0
       *
       * This translates to:
       * If N is even:
       *   If N % 4 == 0, result is N
       *   If N % 4 == 2, result is N + 1
       * If N is odd:
       *   If N % 4 == 1, result is 1
       *   If N % 4 == 3, result is 0
       *
       * In the original Purescript code, the recursive function `l` is `xorSumFromZero(N)`.
       * The `if` conditions are rewritten to match the pattern:
       *
       * `xorSumFromZero(n)`:
       * 1. If `n` and `t` are equal, return `n`. (Base case or optimization)
       * 2. If `n` is even:
       *    `diff = (t - n) + 1`
       *    `adjustedDiff = isEven(diff) ? diff : diff - 1`
       *    `mod4Result = isEven(adjustedDiff) ? 0 : 1`  (This is checking `adjustedDiff % 4 == 0` vs `adjustedDiff % 4 == 2`)
       *    `return xor(isEven(diff) ? t : t-1)(mod4Result)`  (This is hard to map directly)
       *
       * The provided `l` function (renamed `_calculateXorSum`) appears to be calculating `f(N) XOR f(A-1)` directly,
       * but the logic is slightly different from the standard `N mod 4` pattern for `f(N)`.
       * It's a specific recursive solution. Let's re-interpret the original logic for `_calculateXorSum(currentVal, targetVal)`
       * to be more explicit.
       */
      const _calculateXorSum = function(currentVal, targetVal) {
        // Base case: If currentVal has reached targetVal, return currentVal.
        if (Eq.eq(BigIntOps.eqBigInt)(currentVal)(targetVal)) {
          return currentVal;
        }

        // Case 1: currentVal is an even number
        if (BigIntOps.even(currentVal)) {
          // Calculate the difference plus one, which is effectively the number of elements from `currentVal` to `targetVal` (inclusive).
          const countOfElements = Semiring.add(BigIntOps.semiringBigInt)(Ring.sub(BigIntOps.ringBigInt)(targetVal)(currentVal))(Semiring.one(BigIntOps.semiringBigInt));

          // Determine the 'parity' or 'mod 4' behavior based on `countOfElements`.
          // If `countOfElements` is even, use `countOfElements`. If odd, use `countOfElements - 1`.
          // This effectively aligns the sequence to a multiple of 4 for XOR sum calculation.
          const alignedCount = BigIntOps.even(countOfElements) ? countOfElements : Ring.sub(BigIntOps.ringBigInt)(countOfElements)(Semiring.one(BigIntOps.semiringBigInt));

          // Check if `alignedCount` is a multiple of 4.
          // `alignedCount % 4 == 0` implies 0, `alignedCount % 4 == 2` implies 1.
          // This determines a specific XOR component.
          const modFourResult = Eq.eq(BigIntOps.eqBigInt)(BigIntOps.rem(alignedCount)(BigIntOps.fromInt(4)))(Semiring.zero(BigIntOps.semiringBigInt)) ? Semiring.zero(BigIntOps.semiringBigInt) : Semiring.one(BigIntOps.semiringBigInt);

          // The result is `targetVal` XOR `modFourResult`, but `targetVal` is adjusted if `countOfElements` was odd.
          const finalXorOperand = BigIntOps.even(countOfElements) ? targetVal : Ring.sub(BigIntOps.ringBigInt)(targetVal)(Semiring.one(BigIntOps.semiringBigInt));
          return BigIntOps.xor(finalXorOperand)(modFourResult);
        }

        // Case 2: currentVal is an odd number (using `otherwise` for catch-all)
        if (BooleanUtils.otherwise) {
          // If currentVal is odd, XOR it with the result of calling the function on (currentVal + 1) and targetVal.
          // This is a recursive step that progresses towards an even `currentVal` or the base case.
          const nextCurrentVal = Semiring.add(BigIntOps.semiringBigInt)(currentVal)(Semiring.one(BigIntOps.semiringBigInt));
          return BigIntOps.xor(currentVal)(_calculateXorSum(nextCurrentVal)(targetVal));
        }

        // Fallback for unexpected cases (should not be reached with `otherwise`)
        throw new Error("Logic error in _calculateXorSum. This path should be unreachable.");
      };


      /**
       * Solves the AtCoder ABC121 D problem: calculate XOR sum of A to B.
       * @param {string} inputData - A string containing two space-separated numbers, A and B.
       * @returns {string} The XOR sum as a string, followed by a newline.
       */
      appNamespace.computeSolution = function(inputData) {
        // Split the input string by space and trim whitespace from each part.
        const inputParts = StringCommon.split(" ")(StringCommon.trim(inputData));

        // Attempt to parse the two parts into BigInts using the `fromString` helper.
        // This destructuring and type checking ensures we have two valid BigInts.
        let parsedInputRange;
        if (inputParts.length === 2) {
          const bigIntA = Functor.map(Functor.functorArray)(BigIntOps.fromString)([inputParts[0], inputParts[1]]);
          // Check if both elements are successfully parsed into Just(BigInt)
          if (bigIntA[0] instanceof Maybe.JustValue && bigIntA[1] instanceof Maybe.JustValue) {
            parsedInputRange = {
              start: bigIntA[0].value0,
              end: bigIntA[1].value0
            };
          }
        }

        // If parsing failed or input format was incorrect, crash with an error.
        if (!parsedInputRange) {
          UnsafePartial.unsafeCrashAndBurn("Failed to parse BigInts from input: " + inputData);
        }

        // Calculate the XOR sum using the custom `_calculateXorSum` function.
        const finalXorSum = _calculateXorSum(parsedInputRange.start)(parsedInputRange.end);

        // Convert the result back to a string and append a newline.
        return BigIntOps.toString(finalXorSum) + "\n";
      };

    })(appDataStore["AtCoder.ABC121.D_Solver"] = appDataStore["AtCoder.ABC121.D_Solver"] || {});

    (function(appNamespace) {
      "use strict";
      // Dependencies: Node.Encoding, Data.Show, Prelude

      // Define different encoding types as singleton objects
      const AsciiEncodingConstructor = function() {};
      AsciiEncodingConstructor.value = new AsciiEncodingConstructor();
      const Utf8EncodingConstructor = function() {};
      Utf8EncodingConstructor.value = new Utf8EncodingConstructor();
      const Utf16leEncodingConstructor = function() {};
      Utf16leEncodingConstructor.value = new Utf16leEncodingConstructor();
      const Ucs2EncodingConstructor = function() {};
      Ucs2EncodingConstructor.value = new Ucs2EncodingConstructor();
      const Base64EncodingConstructor = function() {};
      Base64EncodingConstructor.value = new Base64EncodingConstructor();
      const Latin1EncodingConstructor = function() {};
      Latin1EncodingConstructor.value = new Latin1EncodingConstructor();
      const BinaryEncodingConstructor = function() {};
      BinaryEncodingConstructor.value = new BinaryEncodingConstructor();
      const HexEncodingConstructor = function() {};
      HexEncodingConstructor.value = new HexEncodingConstructor();

      // Show instance for Encoding types
      const displayEncodingInstance = new appNamespace["Data.Show"].Show(function(encodingType) {
        if (encodingType instanceof AsciiEncodingConstructor) return "ascii";
        if (encodingType instanceof Utf8EncodingConstructor) return "utf8";
        if (encodingType instanceof Utf16leEncodingConstructor) return "utf16le";
        if (encodingType instanceof Ucs2EncodingConstructor) return "ucs2";
        if (encodingType instanceof Base64EncodingConstructor) return "base64";
        if (encodingType instanceof Latin1EncodingConstructor) return "latin1";
        if (encodingType instanceof BinaryEncodingConstructor) return "binary";
        if (encodingType instanceof HexEncodingConstructor) return "hex";
        // Handle unexpected encoding types
        throw new Error("Unknown encoding type for display: " + (encodingType ? encodingType.constructor.name : String(encodingType)));
      });

      appNamespace.AsciiEncoding = AsciiEncodingConstructor;
      appNamespace.Utf8Encoding = Utf8EncodingConstructor;
      appNamespace.Utf16leEncoding = Utf16leEncodingConstructor;
      appNamespace.Ucs2Encoding = Ucs2EncodingConstructor;
      appNamespace.Base64Encoding = Base64EncodingConstructor;
      appNamespace.Latin1Encoding = Latin1EncodingConstructor;
      appNamespace.BinaryEncoding = BinaryEncodingConstructor;
      appNamespace.HexEncoding = HexEncodingConstructor;
      appNamespace.displayEncoding = displayEncodingInstance;

    })(appDataStore["Node.EncodingTypes"] = appDataStore["Node.EncodingTypes"] || {});

    (function(appNamespace) {
      "use strict";
      // Node.FS.Internal module
      appNamespace.fileSystemModule = localRequire("fs"); // Node.js 'fs' module
    })(appDataStore["Node.FileSystemInternals"] = appDataStore["Node.FileSystemInternals"] || {});

    (function(appNamespace) {
      "use strict";
      // Unsafe.Coerce module
      // This function bypasses type checks, assuming the programmer knows what they're doing.
      appNamespace.unsafeCoerce = function(value) {
        return value;
      };
    })(appDataStore["Unsafe.Coerce"] = appDataStore["Unsafe.Coerce"] || {});

    (function(appNamespace) {
      "use strict";
      // Dependencies: Unsafe.Coerce
      const unsafeCoerceModule = appNamespace["Unsafe.Coerce"];
      appNamespace.unsafeCoerce = unsafeCoerceModule.unsafeCoerce;
    })(appDataStore["Unsafe.Coerce"] = appDataStore["Unsafe.Coerce"] || {}); // Re-using Unsafe.Coerce namespace

    (function(appNamespace) {
      "use strict";
      // Dependencies: Effect, Prelude, Unsafe.Coerce, Node.FS.Internal
      const unsafeCoerce = appNamespace["Unsafe.Coerce"].unsafeCoerce;
      const fsInternals = appNamespace["Node.FileSystemInternals"];

      // Helper to create an Effect (a computation that performs side effects)
      appNamespace.createEffect = unsafeCoerce; // In Purescript, this casts a JS function to an Effect type.
      appNamespace.syncFsModule = fsInternals.fileSystemModule; // Export the underlying 'fs' module
    })(appDataStore["Node.FileSystemInternals"] = appDataStore["Node.FileSystemInternals"] || {}); // Re-using Node.FileSystemInternals namespace

    (function(appNamespace) {
      "use strict";
      // Dependencies: Control.Bind, Control.Semigroupoid, Data.DateTime, Data.DateTime.Instant, Data.EuclideanRing, Data.Function, Data.Function.Uncurried, Data.Functor, Data.Int, Data.Maybe, Data.Nullable, Data.Show, Data.Time.Duration, Effect, Node.Buffer, Node.Encoding, Node.FS, Node.FS.Internal, Node.FS.Perms, Node.FS.Stats, Node.Path, Prelude

      const displayer = appNamespace["Data.Show"];
      const encodingTypes = appNamespace["Node.EncodingTypes"];
      const fsInternals = appNamespace["Node.FileSystemInternals"];
      const syncFsModule = fsInternals.syncFsModule; // The actual Node.js 'fs' module

      /**
       * Reads a text file synchronously.
       * @param {EncodingType} fileEncoding - The encoding to use.
       * @returns {function(string): Effect<string>} A function that takes a file path and returns an Effect.
       */
      appNamespace.readTextFile = function(fileEncoding) {
        return function(filePath) {
          return fsInternals.createEffect(function() {
            // Use the Node.js `fs.readFileSync` method
            return syncFsModule.readFileSync(filePath, {
              encoding: displayer.show(encodingTypes.displayEncoding)(fileEncoding)
            });
          });
        };
      };

      /**
       * Appends text to a file synchronously.
       * @param {EncodingType} fileEncoding - The encoding to use.
       * @returns {function(string): function(string): Effect<void>} A curried function.
       */
      appNamespace.appendTextFile = function(fileEncoding) {
        return function(filePath) {
          return function(contentToAppend) {
            return fsInternals.createEffect(function() {
              // Use the Node.js `fs.appendFileSync` method
              return syncFsModule.appendFileSync(filePath, contentToAppend, {
                encoding: displayer.show(encodingTypes.displayEncoding)(fileEncoding)
              });
            });
          };
        };
      };

    })(appDataStore["Node.FileSystemSyncOps"] = appDataStore["Node.FileSystemSyncOps"] || {});

    (function(appNamespace) {
      "use strict";
      // Dependencies: AtCoder.ABC121.D_Solver, Control.Applicative, Control.Bind, Effect, Node.Encoding, Node.FS.Sync, Prelude

      const problemSolver = appNamespace["AtCoder.ABC121.D_Solver"];
      const encodingModule = appNamespace["Node.EncodingTypes"];
      const fileSystemSync = appNamespace["Node.FileSystemSyncOps"];

      // The main entry point for the application.
      appNamespace.main = function() {
        // Read input from /dev/stdin using UTF8 encoding.
        const rawInputString = fileSystemSync.readTextFile(encodingModule.Utf8Encoding.value)("/dev/stdin")();

        // Compute the solution using the logic from the AtCoder problem solver.
        const computedResultString = problemSolver.computeSolution(rawInputString);

        // Write the computed result to /dev/stdout using UTF8 encoding.
        return fileSystemSync.appendTextFile(encodingModule.Utf8Encoding.value)("/dev/stdout")(computedResultString)();
      };

    })(appDataStore.MainExecution = appDataStore.MainExecution || {});

    // Execute the main function of the application.
    appDataStore.MainExecution.main();

  }, {
    "big-integer": "9xaU"
  }]
}, {}, ["Focm"], null);