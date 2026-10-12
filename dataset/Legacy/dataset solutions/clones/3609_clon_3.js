(function(exports, moduleDefinitions, moduleCache, entryPointIds){
  // Internal variable to hold any initialization error
  var initializationError;
  // Reference to the global 'parcelRequire' if it exists, for chaining loaders
  var priorModuleLoader = ("function" == typeof parcelRequire && parcelRequire);
  // Reference to Node.js 'require' if it exists, for external modules
  var nodeModuleLoader = ("function" == typeof require && require);

  /**
   * Core function to load a module by its identifier.
   * @param {string} moduleId - The unique identifier for the module.
   * @param {boolean} [isRecursiveCall=false] - Flag to prevent infinite recursion.
   * @returns {*} The exports of the requested module.
   * @throws {Error} If the module cannot be found.
   */
  function retrieveModule(moduleId, isRecursiveCall){
    // If module is already in cache, return its exports
    if(moduleCache[moduleId]) {
      return moduleCache[moduleId].exports;
    }

    // If module definition doesn't exist, try alternative loaders
    if(!moduleDefinitions[moduleId]){
      var externalParcelLoader = ("function" == typeof parcelRequire && parcelRequire);
      // Try external Parcel loader if not a recursive call
      if(!isRecursiveCall && externalParcelLoader) {
        return externalParcelLoader(moduleId, true);
      }
      // Try prior Parcel loader if available
      if(priorModuleLoader) {
        return priorModuleLoader(moduleId, true);
      }
      // Try Node.js require if available and module ID is a string
      if(nodeModuleLoader && "string" == typeof moduleId) {
        return nodeModuleLoader(moduleId);
      }
      // If all attempts fail, throw an error
      var moduleNotFoundError = new Error("Cannot locate module with ID: '" + moduleId + "'");
      moduleNotFoundError.code = "MODULE_NOT_FOUND";
      throw moduleNotFoundError;
    }

    // Prepare a local 'require' function for the module
    var moduleLocalRequire = function(dependencyId){
      return retrieveModule(moduleLocalRequire.resolve(dependencyId));
    };
    // Resolve relative paths for dependencies
    moduleLocalRequire.resolve = function(depPath){
      return moduleDefinitions[moduleId][1][depPath] || depPath;
    };
    moduleLocalRequire.cache = {}; // Local cache for this module's dependencies

    // Create a new module instance and add to cache
    var currentModuleInstance = moduleCache[moduleId] = new retrieveModule.Module(moduleId);
    // Execute the module's definition function
    moduleDefinitions[moduleId][0].call(
      currentModuleInstance.exports,
      moduleLocalRequire,
      currentModuleInstance,
      currentModuleInstance.exports,
      this
    );

    return moduleCache[moduleId].exports;
  }

  // Mark this loader as a Parcel loader
  retrieveModule.isParcelRequire = true;

  // Module constructor function
  retrieveModule.Module = function(id){
    this.id = id;
    this.bundle = retrieveModule;
    this.exports = {};
  };

  // Expose module definitions and cache
  retrieveModule.modules = moduleDefinitions;
  retrieveModule.cache = moduleCache;
  retrieveModule.parent = priorModuleLoader;

  // Function to register new modules dynamically
  retrieveModule.register = function(moduleIdentifier, moduleExportValue){
    moduleDefinitions[moduleIdentifier] = [function(moduleExports, moduleInstance){
      moduleInstance.exports = moduleExportValue;
    }, {}];
  };

  // Load all entry points
  for(var entryIdx = 0; entryIdx < entryPointIds.length; entryIdx++){
    try {
      retrieveModule(entryPointIds[entryIdx]);
    } catch(err){
      // Store the first error encountered during entry point loading
      if(!initializationError) {
        initializationError = err;
      }
    }
  }

  // If there are entry points, set up global export
  if(entryPointIds.length){
    var finalExport = retrieveModule(entryPointIds[entryPointIds.length - 1]);
    if("object" == typeof exports && "undefined" != typeof module) {
      module.exports = finalExport;
    } else if("function" == typeof define && define.amd) {
      define(function(){ return finalExport; });
    } else if(globalExportName) {
      this[globalExportName] = finalExport;
    }
  }

  // Update global parcelRequire reference
  parcelRequire = retrieveModule;

  // If an initialization error occurred, re-throw it
  if(initializationError) {
    throw initializationError;
  }

  return retrieveModule;
})({
  "9xaU":[function(require,module,exports) {
    /**
     * BigMathLib: A JavaScript library for arbitrary-precision integers.
     * This module provides a constructor for handling large integer arithmetic.
     */
    var BigMathLib = function(initialValue){
      "use strict";

      // Constants for internal representation
      var digitBase = 1e7; // Base for array digits (10^7)
      var chunkLen = 7;    // Number of digits per array element
      var maxSmallNumber = 9007199254740992; // 2^53, max safe integer in JS
      var maxSmallNumberArr = convertNumToArray(maxSmallNumber); // Max small integer represented as an array

      var digitChars = "0123456789abcdefghijklmnopqrstuvwxyz"; // Characters for base conversions
      var nativeBigIntAvail = "function" == typeof BigInt; // Check for native BigInt support

      /**
       * Factory function to create a numeric instance (SmallNum, LargeNum, or NativeBigNum).
       * @param {any} input - The value to convert.
       * @param {number} [inputBase] - Optional base for string conversion.
       * @param {boolean} [ignoreRadix] - Flag to ignore radix when parsing string.
       * @param {boolean} [preserveCase] - Flag to preserve case during parsing.
       * @returns {SmallNum|LargeNum|NativeBigNum} A numeric instance.
       */
      function createNumericInstance(input, inputBase, ignoreRadix, preserveCase){
        // Default to base 10 if not specified
        if(void 0 === input) return createNumericInstance[0];

        // If base is 10 and not explicitly set to something else
        if(void 0 !== inputBase && (10 != +inputBase || ignoreRadix)){
          return parseValueFromBaseString(input, inputBase, ignoreRadix, preserveCase);
        } else {
          return ensureBigIntInstance(input);
        }
      }

      /**
       * Constructor for Large Numbers (represented as arrays of digits).
       * @param {number[]} valueArray - Array of digits.
       * @param {boolean} isNegative - True if the number is negative.
       */
      function LargeNum(valueArray, isNegative){
        this.value = valueArray;
        this.sign = isNegative;
        this.isSmall = false; // Not a small integer
      }

      /**
       * Constructor for Small Numbers (represented as a single JS number).
       * @param {number} numValue - The numeric value.
       */
      function SmallNum(numValue){
        this.value = numValue;
        this.sign = numValue < 0; // Determine sign from number
        this.isSmall = true; // Is a small integer
      }

      /**
       * Constructor for Native BigInt numbers (uses JS BigInt).
       * @param {BigInt} bigIntValue - The native BigInt value.
       */
      function NativeBigNum(bigIntValue){
        this.value = bigIntValue;
      }

      /**
       * Checks if a number is within the safe integer range for JavaScript.
       * @param {number} num - The number to check.
       * @returns {boolean} True if the number is within the safe range.
       */
      function isWithinSmallRange(num){
        return -maxSmallNumber < num && num < maxSmallNumber;
      }

      /**
       * Converts a JavaScript number into an array of digits for LargeNum representation.
       * @param {number} num - The number to convert.
       * @returns {number[]} Array representation of the number.
       */
      function convertNumToArray(num){
        if (num < 1e7) {
            return [num]; // Single digit chunk
        } else if (num < 1e14) {
            return [num % digitBase, Math.floor(num / digitBase)]; // Two digit chunks
        } else {
            return [num % digitBase, Math.floor(num / digitBase) % digitBase, Math.floor(num / 1e14)]; // Three digit chunks
        }
      }

      /**
       * Converts an array of digits back into a JavaScript number if it fits.
       * @param {number[]} digitArray - The array of digits.
       * @returns {number|number[]} The number if small enough, otherwise the array itself.
       */
      function convertArrayToNum(digitArray){
        normalizeDigitArray(digitArray); // Trim leading zeros
        var arrLength = digitArray.length;

        // Attempt to convert to a small number
        if(arrLength < 4 && compareDigitArrays(digitArray, maxSmallNumberArr) < 0) {
          switch(arrLength){
            case 0: return 0;
            case 1: return digitArray[0];
            case 2: return digitArray[0] + digitArray[1] * digitBase;
            default: return digitArray[0] + (digitArray[1] + digitArray[2] * digitBase) * digitBase;
          }
        }
        return digitArray; // Return array if too large for JS number
      }

      /**
       * Removes leading zero elements from a digit array.
       * @param {number[]} digitArray - The array to normalize.
       */
      function normalizeDigitArray(digitArray){
        for(var arrIndex = digitArray.length; arrIndex > 0; arrIndex--){
          if(0 !== digitArray[arrIndex - 1]) break;
        }
        digitArray.length = arrIndex;
      }

      /**
       * Creates a new array filled with zeros.
       * @param {number} size - The desired size of the array.
       * @returns {number[]} An array of zeros.
       */
      function initZeroArray(size){
        var zeroArr = new Array(size);
        for(var i = -1; ++i < size;) zeroArr[i] = 0;
        return zeroArr;
      }

      /**
       * Rounds a number to the nearest integer.
       * @param {number} num - The number to round.
       * @returns {number} The rounded integer.
       */
      function roundToInteger(num){
        return num > 0 ? Math.floor(num) : Math.ceil(num);
      }

      /**
       * Performs addition of two digit arrays.
       * Assumes `arr1` is longer or equal in length to `arr2`.
       * @param {number[]} arr1 - The first digit array.
       * @param {number[]} arr2 - The second digit array.
       * @returns {number[]} The result of the addition.
       */
      function performArrayAddition(arr1, arr2){
        var len1 = arr1.length;
        var len2 = arr2.length;
        var resultArr = new Array(len1);
        var carry = 0;
        var currentSum;

        for(var i = 0; i < len2; i++){
          currentSum = arr1[i] + arr2[i] + carry;
          carry = (currentSum >= digitBase) ? 1 : 0;
          resultArr[i] = currentSum - carry * digitBase;
        }
        for(var j = len2; j < len1; j++){
          currentSum = arr1[j] + carry;
          carry = (currentSum === digitBase) ? 1 : 0;
          resultArr[j] = currentSum - carry * digitBase;
        }
        if(carry > 0) resultArr.push(carry);
        return resultArr;
      }

      /**
       * Performs addition of two digit arrays, handling unequal lengths.
       * @param {number[]} arr1 - The first digit array.
       * @param {number[]} arr2 - The second digit array.
       * @returns {number[]} The result of the addition.
       */
      function addBalancedArrays(arr1, arr2){
        if(arr1.length >= arr2.length){
          return performArrayAddition(arr1, arr2);
        } else {
          return performArrayAddition(arr2, arr1);
        }
      }

      /**
       * Adds a small number (as a string of digits) to a digit array.
       * @param {number[]} digitArray - The digit array.
       * @param {number} smallNum - The small number to add (absolute value).
       * @returns {number[]} The resulting digit array.
       */
      function addSmallNumToArray(digitArray, smallNum){
        var currentDigit, newCarry;
        var arrLen = digitArray.length;
        var resultArr = new Array(arrLen);
        var carry = smallNum; // Small num acts as initial carry

        for(var i = 0; i < arrLen; i++){
          currentDigit = digitArray[i] + carry;
          newCarry = Math.floor(currentDigit / digitBase);
          resultArr[i] = currentDigit - newCarry * digitBase;
          carry = newCarry;
        }
        for(; carry > 0;){
          resultArr.push(carry % digitBase);
          carry = Math.floor(carry / digitBase);
        }
        return resultArr;
      }

      /**
       * Performs subtraction of two digit arrays.
       * Assumes `arr1` is greater than or equal to `arr2`.
       * @param {number[]} arr1 - The first digit array.
       * @param {number[]} arr2 - The second digit array.
       * @returns {number[]} The result of the subtraction.
       */
      function performArraySubtraction(arr1, arr2){
        var len1 = arr1.length;
        var len2 = arr2.length;
        var resultArr = new Array(len1);
        var borrow = 0;
        var currentDiff;

        for(var i = 0; i < len2; i++){
          currentDiff = arr1[i] - borrow - arr2[i];
          if(currentDiff < 0){
            currentDiff += digitBase;
            borrow = 1;
          } else {
            borrow = 0;
          }
          resultArr[i] = currentDiff;
        }
        for(var j = len2; j < len1; j++){
          currentDiff = arr1[j] - borrow;
          if(currentDiff < 0){
            currentDiff += digitBase;
            resultArr[j] = currentDiff;
            // borrow remains 1
          } else {
            resultArr[j] = currentDiff;
            borrow = 0; // borrow cleared
            j++; // Move to next digit
            break;
          }
        }
        // Copy remaining digits if no more borrow
        for(; j < len1; j++){
          resultArr[j] = arr1[j];
        }

        normalizeDigitArray(resultArr);
        return resultArr;
      }

      /**
       * Subtracts a small number (as an array) from a digit array.
       * @param {number[]} digitArray - The digit array.
       * @param {number} smallNumAbs - The absolute value of the small number.
       * @param {boolean} isNegative - Whether the result should be negative.
       * @returns {SmallNum|LargeNum} The result.
       */
      function subtractSmallNumFromArray(digitArray, smallNumAbs, isNegative){
        var currentDigit, currentBorrow;
        var arrLen = digitArray.length;
        var resultArr = new Array(arrLen);
        var borrow = -smallNumAbs; // Small num acts as initial borrow

        for(var i = 0; i < arrLen; i++){
          currentDigit = digitArray[i] + borrow;
          currentBorrow = Math.floor(currentDigit / digitBase);
          currentDigit %= digitBase;
          resultArr[i] = currentDigit < 0 ? currentDigit + digitBase : currentDigit;
          borrow = currentBorrow;
        }

        var finalValue = convertArrayToNum(resultArr);
        if("number" == typeof finalValue){
          return isNegative && (finalValue = -finalValue), new SmallNum(finalValue);
        } else {
          return new LargeNum(finalValue, isNegative);
        }
      }

      /**
       * Performs multiplication of two digit arrays using standard algorithm.
       * @param {number[]} arr1 - The first digit array.
       * @param {number[]} arr2 - The second digit array.
       * @returns {number[]} The result of the multiplication.
       */
      function performArrayMultiplication(arr1, arr2){
        var len1 = arr1.length;
        var len2 = arr2.length;
        var productArr = initZeroArray(len1 + len2);
        var currentProduct, carry;

        for(var i = 0; i < len1; ++i){
          carry = 0;
          var val1 = arr1[i];
          for(var j = 0; j < len2; ++j){
            currentProduct = val1 * arr2[j] + productArr[i + j] + carry;
            carry = Math.floor(currentProduct / digitBase);
            productArr[i + j] = currentProduct - carry * digitBase;
          }
          productArr[i + len2] += carry;
        }
        normalizeDigitArray(productArr);
        return productArr;
      }

      /**
       * Multiplies a digit array by a single JavaScript number.
       * @param {number[]} digitArray - The digit array.
       * @param {number} multiplier - The single digit multiplier.
       * @returns {number[]} The resulting digit array.
       */
      function multiplyArrayBySingleDigit(digitArray, multiplier){
        var currentProduct, carry = 0;
        var arrLen = digitArray.length;
        var resultArr = new Array(arrLen);

        for(var i = 0; i < arrLen; i++){
          currentProduct = digitArray[i] * multiplier + carry;
          carry = Math.floor(currentProduct / digitBase);
          resultArr[i] = currentProduct - carry * digitBase;
        }
        for(; carry > 0;){
          resultArr.push(carry % digitBase);
          carry = Math.floor(carry / digitBase);
        }
        return resultArr;
      }

      /**
       * Pads a digit array with leading zeros to a specified number of places.
       * @param {number[]} digitArray - The array to pad.
       * @param {number} numZeros - The number of zeros to add.
       * @returns {number[]} The padded array.
       */
      function padArrayWithLeadingZeros(digitArray, numZeros){
        var zeros = [];
        for(; numZeros-- > 0;) zeros.push(0);
        return zeros.concat(digitArray);
      }

      /**
       * Constructs a LargeNum instance from a number and a digit array, determining sign.
       * @param {number} smallNumPart - A small integer part.
       * @param {number[]} digitArrPart - The digit array part.
       * @param {boolean} isNegative - The sign.
       * @returns {LargeNum} The constructed LargeNum.
       */
      function constructLargeNumFromParts(smallNumPart, digitArrPart, isNegative){
        return new LargeNum(
          smallNumPart < digitBase ? multiplyArrayBySingleDigit(digitArrPart, smallNumPart) : performArrayMultiplication(digitArrPart, convertNumToArray(smallNumPart)),
          isNegative
        );
      }

      /**
       * Squares a digit array.
       * @param {number[]} digitArray - The array to square.
       * @returns {number[]} The squared array.
       */
      function squareDigitArray(digitArray){
        var arrLen = digitArray.length;
        var resultArr = initZeroArray(arrLen + arrLen);
        var currentProduct, carry, val;

        for(var i = 0; i < arrLen; i++){
          carry = 0 - (val = digitArray[i]) * val; // Initialize carry with diagonal term
          for(var j = i; j < arrLen; j++){
            currentProduct = val * digitArray[j] * (i === j ? 1 : 2) + resultArr[i + j] + carry;
            carry = Math.floor(currentProduct / digitBase);
            resultArr[i + j] = currentProduct - carry * digitBase;
          }
          resultArr[i + arrLen] += carry;
        }
        normalizeDigitArray(resultArr);
        return resultArr;
      }

      /**
       * Divides a digit array by a single JavaScript number.
       * @param {number[]} digitArray - The digit array.
       * @param {number} divisor - The small integer divisor.
       * @returns {[number[], number]} An array containing the quotient array and the remainder.
       */
      function divideArrayBySmallDigit(digitArray, divisor){
        var remainder = 0;
        var currentQuotient, currentDividend;
        var arrLen = digitArray.length;
        var quotientArr = new Array(arrLen);

        for(var i = arrLen - 1; i >= 0; --i){
          currentDividend = remainder * digitBase + digitArray[i];
          currentQuotient = roundToInteger(currentDividend / divisor);
          remainder = currentDividend - currentQuotient * divisor;
          quotientArr[i] = 0 | currentQuotient; // Ensure integer
        }
        return [quotientArr, 0 | remainder]; // Ensure integer remainder
      }

      /**
       * Performs division and calculates quotient and remainder for two BigInt instances.
       * @param {LargeNum|SmallNum|NativeBigNum} dividendObj - The dividend.
       * @param {LargeNum|SmallNum|NativeBigNum} divisorObj - The divisor.
       * @returns {[LargeNum|SmallNum|NativeBigNum, LargeNum|SmallNum|NativeBigNum]} Array of [quotient, remainder].
       */
      function calculateQuotientAndRemainder(dividendObj, divisorObj){
        var divisor = ensureBigIntInstance(divisorObj);
        if(nativeBigIntAvail) {
          // Use native BigInt division if available
          return [new NativeBigNum(dividendObj.value / divisor.value), new NativeBigNum(dividendObj.value % divisor.value)];
        }

        var dividendValue = dividendObj.value;
        var divisorValue = divisor.value;

        if(0 === divisorValue) throw new Error("Division by zero is not allowed.");

        // Handle small integer division
        if(dividendObj.isSmall){
          if(divisor.isSmall){
            return [new SmallNum(roundToInteger(dividendValue / divisorValue)), new SmallNum(dividendValue % divisorValue)];
          } else {
            return [createNumericInstance[0], dividendObj]; // Quotient is 0, remainder is dividend
          }
        }

        // Handle small divisor for large dividend
        if(divisor.isSmall){
          if(1 === divisorValue) return [dividendObj, createNumericInstance[0]];
          if(-1 == divisorValue) return [dividendObj.negate(), createNumericInstance[0]];

          var absDivisor = Math.abs(divisorValue);
          if(absDivisor < digitBase){
            var divisionResult = divideArrayBySmallDigit(dividendValue, absDivisor);
            var quotientArr = convertArrayToNum(divisionResult[0]);
            var remainderVal = divisionResult[1];
            if(dividendObj.sign) remainderVal = -remainderVal;

            if("number" == typeof quotientArr){
              if(dividendObj.sign !== divisor.sign) quotientArr = -quotientArr;
              return [new SmallNum(quotientArr), new SmallNum(remainderVal)];
            } else {
              return [new LargeNum(quotientArr, dividendObj.sign !== divisor.sign), new SmallNum(remainderVal)];
            }
          }
          divisorValue = convertNumToArray(absDivisor); // Convert small divisor to array for large division
        }

        // Compare magnitudes
        var comparisonResult = compareDigitArrays(dividendValue, divisorValue);
        if(-1 === comparisonResult) return [createNumericInstance[0], dividendObj]; // Dividend is smaller than divisor
        if(0 === comparisonResult) return [createNumericInstance[dividendObj.sign === divisor.sign ? 1 : -1], createNumericInstance[0]]; // Dividend equals divisor

        var quotient;
        var remainderArr;

        // Choose division algorithm based on length
        if(dividendValue.length + divisorValue.length <= 200){
          // Short division algorithm (optimized for moderate lengths)
          var lenDividend = dividendValue.length;
          var lenDivisor = divisorValue.length;
          var resultQuotientArr = initZeroArray(lenDivisor);
          var currentDivisorLast = divisorValue[lenDivisor - 1];

          // Normalize by multiplying to make the divisor's leading digit large
          var multiplier = Math.ceil(digitBase / (2 * currentDivisorLast));
          var scaledDividend = multiplyArrayBySingleDigit(dividendValue, multiplier);
          var scaledDivisor = multiplyArrayBySingleDigit(divisorValue, multiplier);

          scaledDividend.length <= lenDividend && scaledDividend.push(0); // Ensure enough space
          scaledDivisor.push(0); // Pad divisor for calculation

          currentDivisorLast = scaledDivisor[lenDivisor - 1]; // Update after scaling

          for(var k = lenDividend - lenDivisor; k >= 0; k--){
            var estimatedQuotient = digitBase - 1;
            // Estimate quotient digit
            if(scaledDividend[k + lenDivisor] !== currentDivisorLast){
              estimatedQuotient = Math.floor((scaledDividend[k + lenDivisor] * digitBase + scaledDividend[k + lenDivisor - 1]) / currentDivisorLast);
            }

            var productSum = 0;
            var diffSum = 0;
            var scaledDivisorLen = scaledDivisor.length;
            var tempProduct;

            // Perform subtraction with estimated quotient
            for(var p = 0; p < scaledDivisorLen; p++){
              tempProduct = estimatedQuotient * scaledDivisor[p] + productSum;
              productSum = Math.floor(tempProduct / digitBase);
              diffSum += scaledDividend[k + p] - (tempProduct - productSum * digitBase);
              productSum = Math.floor(diffSum / digitBase);
              if(diffSum < 0){
                scaledDividend[k + p] = diffSum + digitBase;
                diffSum = -1;
              } else {
                scaledDividend[k + p] = diffSum;
                diffSum = 0;
              }
            }

            // Adjust quotient if estimate was too high
            for(; 0 !== diffSum;){
              estimatedQuotient--;
              productSum = 0;
              for(var p_inner = 0; p_inner < scaledDivisorLen; p_inner++){
                (productSum += scaledDividend[k + p_inner] - digitBase + scaledDivisor[p_inner]) < 0 ? (scaledDividend[k + p_inner] = productSum + digitBase, productSum = 0) : (scaledDividend[k + p_inner] = productSum, productSum = 1);
              }
              diffSum += productSum;
            }
            resultQuotientArr[k] = estimatedQuotient;
          }
          var unscaledDividend = divideArrayBySmallDigit(scaledDividend, multiplier)[0];
          quotient = convertArrayToNum(resultQuotientArr);
          remainderArr = convertArrayToNum(unscaledDividend);
        } else {
          // Long division algorithm (for very long numbers)
          var currentDividendChunk = [];
          var currentQuotientDigits = [];
          var dividendLen = dividendValue.length;
          var divisorLen = divisorValue.length;

          for(; dividendLen > 0;){
            currentDividendChunk.unshift(dividendValue[--dividendLen]); // Take digits from dividend
            normalizeDigitArray(currentDividendChunk); // Clean up leading zeros

            if(compareDigitArrays(currentDividendChunk, divisorValue) < 0){
              currentQuotientDigits.push(0); // If chunk too small, quotient digit is 0
            } else {
              var dividendPart = currentDividendChunk[currentDividendChunk.length - 1] * digitBase + currentDividendChunk[currentDividendChunk.length - 2];
              var divisorPart = divisorValue[divisorLen - 1] * digitBase + divisorValue[divisorLen - 2];
              if(currentDividendChunk.length > divisorLen) dividendPart = (dividendPart + 1) * digitBase; // Adjust if dividend chunk is longer

              var estimatedQuotient = Math.ceil(dividendPart / divisorPart);
              var tempProduct;

              // Refine estimated quotient
              do {
                tempProduct = multiplyArrayBySingleDigit(divisorValue, estimatedQuotient);
                if(compareDigitArrays(tempProduct, currentDividendChunk) <= 0) break;
                estimatedQuotient--;
              } while(estimatedQuotient);

              currentQuotientDigits.push(estimatedQuotient);
              currentDividendChunk = performArraySubtraction(currentDividendChunk, tempProduct); // Subtract product
            }
          }
          currentQuotientDigits.reverse();
          quotient = convertArrayToNum(currentQuotientDigits);
          remainderArr = convertArrayToNum(currentDividendChunk);
        }

        var isQuotientNegative = dividendObj.sign !== divisor.sign;
        var isRemainderNegative = dividendObj.sign;

        // Construct quotient result
        if("number" == typeof quotient){
          isQuotientNegative && (quotient = -quotient);
          quotient = new SmallNum(quotient);
        } else {
          quotient = new LargeNum(quotient, isQuotientNegative);
        }

        // Construct remainder result
        if("number" == typeof remainderArr){
          isRemainderNegative && (remainderArr = -remainderArr);
          remainderArr = new SmallNum(remainderArr);
        } else {
          remainderArr = new LargeNum(remainderArr, isRemainderNegative);
        }

        return [quotient, remainderArr];
      }

      /**
       * Compares two digit arrays.
       * @param {number[]} arr1 - The first digit array.
       * @param {number[]} arr2 - The second digit array.
       * @returns {number} 1 if arr1 > arr2, -1 if arr1 < arr2, 0 if arr1 == arr2.
       */
      function compareDigitArrays(arr1, arr2){
        if(arr1.length !== arr2.length) {
          return arr1.length > arr2.length ? 1 : -1;
        }
        for(var i = arr1.length - 1; i >= 0; i--){
          if(arr1[i] !== arr2[i]) {
            return arr1[i] > arr2[i] ? 1 : -1;
          }
        }
        return 0;
      }

      /**
       * Checks if a BigMathLib instance is a small prime number.
       * @param {BigMathLib} numInstance - The number to check.
       * @returns {boolean|undefined} True/False for small primes, undefined otherwise.
       */
      function isProbablyPrimeSmall(numInstance){
        var absValue = numInstance.abs();
        if(!absValue.isUnit()) {
          if(absValue.equals(2) || absValue.equals(3) || absValue.equals(5)) {
            return true;
          }
          if(absValue.isEven() || absValue.isDivisibleBy(3) || absValue.isDivisibleBy(5)) {
            return false;
          }
          if(absValue.lesser(49)) { // Check up to 7^2
            return true;
          }
          return void 0; // Needs Miller-Rabin
        }
        return false; // 1 is not prime
      }

      /**
       * Performs a Miller-Rabin primality test.
       * @param {BigMathLib} candidate - The number to test.
       * @param {BigMathLib[]} witnesses - Array of witness numbers.
       * @returns {boolean} True if probable prime, false otherwise.
       */
      function runMillerRabinTest(candidate, witnesses){
        var candidateMinusOne = candidate.prev();
        var d = candidateMinusOne;
        var s = 0;

        // Find s and d such that candidate - 1 = 2^s * d, with d odd
        while(d.isEven()){
          d = d.divide(2);
          s++;
        }

        witnessLoop: for(var i = 0; i < witnesses.length; i++){
          var currentWitness = witnesses[i];
          // Skip witnesses larger than or equal to candidate
          if(!candidate.lesser(currentWitness)){
            var x = BigMathLib(currentWitness).modPow(d, candidate); // x = a^d mod n

            if(!x.isUnit() && !x.equals(candidateMinusOne)){
              // Check for x^(2^r * d) mod n = 1 or n-1
              for(var r = s - 1; r > 0; r--){
                x = x.square().mod(candidate);
                if(x.isUnit()) return false; // Composite
                if(x.equals(candidateMinusOne)) continue witnessLoop; // Probable prime for this witness
              }
              return false; // Composite
            }
          }
        }
        return true; // Probable prime
      }

      // Prototypal inheritance setup
      LargeNum.prototype = Object.create(createNumericInstance.prototype);
      SmallNum.prototype = Object.create(createNumericInstance.prototype);
      NativeBigNum.prototype = Object.create(createNumericInstance.prototype);

      // --- Arithmetic Operations ---

      LargeNum.prototype.add = function(otherNum){
        var other = ensureBigIntInstance(otherNum);
        if(this.sign !== other.sign) return this.subtract(other.negate()); // Different signs, convert to subtraction
        var thisValue = this.value;
        var otherValue = other.value;
        if(other.isSmall) return new LargeNum(addSmallNumToArray(thisValue, Math.abs(otherValue)), this.sign);
        return new LargeNum(addBalancedArrays(thisValue, otherValue), this.sign);
      };
      LargeNum.prototype.plus = LargeNum.prototype.add;

      SmallNum.prototype.add = function(otherNum){
        var other = ensureBigIntInstance(otherNum);
        var thisValue = this.value;
        if(thisValue < 0 !== other.sign) return this.subtract(other.negate()); // Different signs, convert to subtraction
        var otherValue = other.value;
        if(other.isSmall){
          if(isWithinSmallRange(thisValue + otherValue)) return new SmallNum(thisValue + otherValue);
          otherValue = convertNumToArray(Math.abs(otherValue)); // Convert to array if sum overflows
        }
        return new LargeNum(addSmallNumToArray(otherValue, Math.abs(thisValue)), thisValue < 0);
      };
      SmallNum.prototype.plus = SmallNum.prototype.add;

      NativeBigNum.prototype.add = function(otherNum){
        return new NativeBigNum(this.value + ensureBigIntInstance(otherNum).value);
      };
      NativeBigNum.prototype.plus = NativeBigNum.prototype.add;

      LargeNum.prototype.subtract = function(otherNum){
        var other = ensureBigIntInstance(otherNum);
        if(this.sign !== other.sign) return this.add(other.negate()); // Different signs, convert to addition
        var thisValue = this.value;
        var otherValue = other.value;
        if(other.isSmall) return subtractSmallNumFromArray(thisValue, Math.abs(otherValue), this.sign);

        // Perform array subtraction and determine sign based on magnitude
        var result;
        var resultSign = this.sign;
        if(compareDigitArrays(thisValue, otherValue) >= 0){
          result = performArraySubtraction(thisValue, otherValue);
        } else {
          result = performArraySubtraction(otherValue, thisValue);
          resultSign = !resultSign; // Flip sign if we subtracted the larger from the smaller
        }
        var finalResult = convertArrayToNum(result);
        if("number" == typeof finalResult){
          return resultSign && (finalResult = -finalResult), new SmallNum(finalResult);
        } else {
          return new LargeNum(finalResult, resultSign);
        }
      };
      LargeNum.prototype.minus = LargeNum.prototype.subtract;

      SmallNum.prototype.subtract = function(otherNum){
        var other = ensureBigIntInstance(otherNum);
        var thisValue = this.value;
        if(thisValue < 0 !== other.sign) return this.add(other.negate()); // Different signs, convert to addition
        var otherValue = other.value;
        if(other.isSmall) return new SmallNum(thisValue - otherValue);
        return subtractSmallNumFromArray(otherValue, Math.abs(thisValue), thisValue >= 0);
      };
      SmallNum.prototype.minus = SmallNum.prototype.subtract;

      NativeBigNum.prototype.subtract = function(otherNum){
        return new NativeBigNum(this.value - ensureBigIntInstance(otherNum).value);
      };
      NativeBigNum.prototype.minus = NativeBigNum.prototype.subtract;

      LargeNum.prototype.negate = function(){
        return new LargeNum(this.value, !this.sign);
      };
      SmallNum.prototype.negate = function(){
        var originalSign = this.sign;
        var negatedSmallNum = new SmallNum(-this.value);
        negatedSmallNum.sign = !originalSign;
        return negatedSmallNum;
      };
      NativeBigNum.prototype.negate = function(){
        return new NativeBigNum(-this.value);
      };

      LargeNum.prototype.abs = function(){
        return new LargeNum(this.value, false);
      };
      SmallNum.prototype.abs = function(){
        return new SmallNum(Math.abs(this.value));
      };
      NativeBigNum.prototype.abs = function(){
        return new NativeBigNum(this.value >= 0 ? this.value : -this.value);
      };

      LargeNum.prototype.multiply = function(otherNum){
        var other = ensureBigIntInstance(otherNum);
        var thisValue = this.value;
        var otherValue = other.value;
        var resultSign = this.sign !== other.sign;

        if(other.isSmall){
          if(0 === otherValue) return createNumericInstance[0];
          if(1 === otherValue) return this;
          if(-1 === otherValue) return this.negate();
          var absOtherValue = Math.abs(otherValue);
          if(absOtherValue < digitBase) return new LargeNum(multiplyArrayBySingleDigit(thisValue, absOtherValue), resultSign);
          otherValue = convertNumToArray(absOtherValue);
        }

        // Karatsuba multiplication for larger numbers (optimization heuristic)
        var lenThis = thisValue.length;
        var lenOther = otherValue.length;
        var karatsubaThreshold = 15e-6 * lenThis * lenOther - 0.012 * lenThis - 0.012 * lenOther;
        if(karatsubaThreshold > 0){
          // Simplified Karatsuba-like logic (original was more complex)
          // For now, just use standard multiplication if the threshold is met
          return new LargeNum(performArrayMultiplication(thisValue, otherValue), resultSign);
        } else {
          return new LargeNum(performArrayMultiplication(thisValue, otherValue), resultSign);
        }
      };
      LargeNum.prototype.times = LargeNum.prototype.multiply;

      SmallNum.prototype._multiplyBySmall = function(smallNumInst){
        var product = smallNumInst.value * this.value;
        if(isWithinSmallRange(product)) return new SmallNum(product);
        return constructLargeNumFromParts(Math.abs(smallNumInst.value), convertNumToArray(Math.abs(this.value)), this.sign !== smallNumInst.sign);
      };

      LargeNum.prototype._multiplyBySmall = function(smallNumInst){
        if(0 === smallNumInst.value) return createNumericInstance[0];
        if(1 === smallNumInst.value) return this;
        if(-1 === smallNumInst.value) return this.negate();
        return constructLargeNumFromParts(Math.abs(smallNumInst.value), this.value, this.sign !== smallNumInst.sign);
      };

      SmallNum.prototype.multiply = function(otherNum){
        return ensureBigIntInstance(otherNum)._multiplyBySmall(this);
      };
      SmallNum.prototype.times = SmallNum.prototype.multiply;

      NativeBigNum.prototype.multiply = function(otherNum){
        return new NativeBigNum(this.value * ensureBigIntInstance(otherNum).value);
      };
      NativeBigNum.prototype.times = NativeBigNum.prototype.multiply;

      LargeNum.prototype.square = function(){
        return new LargeNum(squareDigitArray(this.value), false);
      };
      SmallNum.prototype.square = function(){
        var squaredVal = this.value * this.value;
        if(isWithinSmallRange(squaredVal)) return new SmallNum(squaredVal);
        return new LargeNum(squareDigitArray(convertNumToArray(Math.abs(this.value))), false);
      };
      NativeBigNum.prototype.square = function(){
        return new NativeBigNum(this.value * this.value);
      };

      LargeNum.prototype.divmod = function(otherNum){
        var result = calculateQuotientAndRemainder(this, otherNum);
        return { quotient: result[0], remainder: result[1] };
      };
      NativeBigNum.prototype.divmod = SmallNum.prototype.divmod = LargeNum.prototype.divmod;

      LargeNum.prototype.divide = function(otherNum){
        return calculateQuotientAndRemainder(this, otherNum)[0];
      };
      NativeBigNum.prototype.over = NativeBigNum.prototype.divide = function(otherNum){
        return new NativeBigNum(this.value / ensureBigIntInstance(otherNum).value);
      };
      SmallNum.prototype.over = SmallNum.prototype.divide = LargeNum.prototype.over = LargeNum.prototype.divide;

      LargeNum.prototype.mod = function(otherNum){
        return calculateQuotientAndRemainder(this, otherNum)[1];
      };
      NativeBigNum.prototype.mod = NativeBigNum.prototype.remainder = function(otherNum){
        return new NativeBigNum(this.value % ensureBigIntInstance(otherNum).value);
      };
      SmallNum.prototype.remainder = SmallNum.prototype.mod = LargeNum.prototype.remainder = LargeNum.prototype.mod;

      LargeNum.prototype.pow = function(exponentNum){
        var exponent = ensureBigIntInstance(exponentNum);
        var baseValue = this.value;
        var exponentValue = exponent.value;

        if(0 === exponentValue) return createNumericInstance[1]; // x^0 = 1
        if(0 === baseValue) return createNumericInstance[0];    // 0^y = 0 (for y > 0)
        if(1 === baseValue) return createNumericInstance[1];    // 1^y = 1
        if(-1 === baseValue) return exponent.isEven() ? createNumericInstance[1] : createNumericInstance[-1]; // (-1)^y

        if(exponent.sign) return createNumericInstance[0]; // Negative exponent -> 0 for integers

        if(!exponent.isSmall) throw new Error("The exponent " + exponent.toString() + " is too large.");

        if(this.isSmall && isWithinSmallRange(Math.pow(baseValue, exponentValue))) {
          return new SmallNum(roundToInteger(Math.pow(baseValue, exponentValue)));
        }

        var result = createNumericInstance[1];
        var currentBase = this;
        var currentExponent = exponentValue;

        while(true){
          if(1 & currentExponent) result = result.times(currentBase); // If exponent is odd, multiply result
          currentExponent /= 2; // Divide exponent by 2
          if(0 === currentExponent) break; // Loop until exponent is 0
          currentBase = currentBase.square(); // Square the base
        }
        return result;
      };
      SmallNum.prototype.pow = LargeNum.prototype.pow;

      NativeBigNum.prototype.pow = function(exponentNum){
        var exponent = ensureBigIntInstance(exponentNum);
        var baseValue = this.value;
        var exponentValue = exponent.value;

        var zeroBig = BigInt(0);
        var oneBig = BigInt(1);
        var twoBig = BigInt(2);

        if(exponentValue === zeroBig) return createNumericInstance[1];
        if(baseValue === zeroBig) return createNumericInstance[0];
        if(baseValue === oneBig) return createNumericInstance[1];
        if(baseValue === BigInt(-1)) return exponent.isEven() ? createNumericInstance[1] : createNumericInstance[-1];
        if(exponent.isNegative()) return new NativeBigNum(zeroBig); // Negative exponent for BigInts

        var currentBase = this;
        var currentResult = createNumericInstance[1];

        while(true){
          if((exponentValue & oneBig) === oneBig) {
            currentResult = currentResult.times(currentBase);
            exponentValue--; // Decrement exponent for odd case
          }
          if(exponentValue === zeroBig) break;
          exponentValue /= twoBig;
          currentBase = currentBase.square();
        }
        return currentResult;
      };

      LargeNum.prototype.modPow = function(exponentNum, modulusNum){
        var exponent = ensureBigIntInstance(exponentNum);
        var modulus = ensureBigIntInstance(modulusNum);

        if(modulus.isZero()) throw new Error("Cannot compute modular exponentiation with a modulus of zero.");

        var result = createNumericInstance[1];
        var currentBaseMod = this.mod(modulus);

        while(exponent.isPositive()){
          if(currentBaseMod.isZero()) return createNumericInstance[0]; // If base is 0 (mod modulus), result is 0
          if(exponent.isOdd()){
            result = result.multiply(currentBaseMod).mod(modulus);
          }
          exponent = exponent.divide(2);
          currentBaseMod = currentBaseMod.square().mod(modulus);
        }
        return result;
      };
      NativeBigNum.prototype.modPow = SmallNum.prototype.modPow = LargeNum.prototype.modPow;

      // --- Comparison Operations ---

      LargeNum.prototype.compareAbs = function(otherNum){
        var other = ensureBigIntInstance(otherNum);
        var thisValue = this.value;
        var otherValue = other.value;
        if(other.isSmall) return 1; // LargeNum is always greater in magnitude than SmallNum
        return compareDigitArrays(thisValue, otherValue);
      };
      SmallNum.prototype.compareAbs = function(otherNum){
        var other = ensureBigIntInstance(otherNum);
        var thisAbsValue = Math.abs(this.value);
        var otherValue = other.value;
        if(other.isSmall){
          var otherAbsValue = Math.abs(otherValue);
          return thisAbsValue === otherAbsValue ? 0 : thisAbsValue > otherAbsValue ? 1 : -1;
        }
        return -1; // SmallNum is always smaller in magnitude than LargeNum
      };
      NativeBigNum.prototype.compareAbs = function(otherNum){
        var thisAbsValue = this.value;
        var otherAbsValue = ensureBigIntInstance(otherNum).value;
        thisAbsValue = thisAbsValue >= 0 ? thisAbsValue : -thisAbsValue;
        otherAbsValue = otherAbsValue >= 0 ? otherAbsValue : -otherAbsValue;
        return thisAbsValue === otherAbsValue ? 0 : thisAbsValue > otherAbsValue ? 1 : -1;
      };

      LargeNum.prototype.compare = function(otherNum){
        if(otherNum === 1/0) return -1; // Negative infinity
        if(otherNum === -1/0) return 1; // Positive infinity

        var other = ensureBigIntInstance(otherNum);
        var thisValue = this.value;
        var otherValue = other.value;

        // Different signs
        if(this.sign !== other.sign) {
          return other.sign ? 1 : -1; // If other is negative, this (positive) is greater
        }

        // Same signs
        if(other.isSmall){
          return this.sign ? -1 : 1; // If negative, large is smaller. If positive, large is greater.
        }
        return compareDigitArrays(thisValue, otherValue) * (this.sign ? -1 : 1); // Reverse comparison for negative numbers
      };
      LargeNum.prototype.compareTo = LargeNum.prototype.compare;

      SmallNum.prototype.compare = function(otherNum){
        if(otherNum === 1/0) return -1;
        if(otherNum === -1/0) return 1;

        var other = ensureBigIntInstance(otherNum);
        var thisValue = this.value;
        var otherValue = other.value;

        if(other.isSmall){
          return thisValue === otherValue ? 0 : thisValue > otherValue ? 1 : -1;
        }

        // SmallNum vs LargeNum with different signs
        if(thisValue < 0 !== other.sign){
          return thisValue < 0 ? -1 : 1; // If this is negative, it's smaller. If this is positive, it's greater.
        }
        // SmallNum vs LargeNum with same signs
        return thisValue < 0 ? 1 : -1; // If both negative, SmallNum is "larger" (closer to zero)
      };
      SmallNum.prototype.compareTo = SmallNum.prototype.compare;

      NativeBigNum.prototype.compare = function(otherNum){
        if(otherNum === 1/0) return -1;
        if(otherNum === -1/0) return 1;

        var thisValue = this.value;
        var otherValue = ensureBigIntInstance(otherNum).value;
        return thisValue === otherValue ? 0 : thisValue > otherValue ? 1 : -1;
      };
NativeBigNum.prototype.compareTo = NativeBigNum.prototype.compare;

      LargeNum.prototype.equals = function(otherNum){
        return 0 === this.compare(otherNum);
      };
      NativeBigNum.prototype.eq = NativeBigNum.prototype.equals = SmallNum.prototype.eq = SmallNum.prototype.equals = LargeNum.prototype.eq = LargeNum.prototype.equals;

      LargeNum.prototype.notEquals = function(otherNum){
        return 0 !== this.compare(otherNum);
      };
      NativeBigNum.prototype.neq = NativeBigNum.prototype.notEquals = SmallNum.prototype.neq = SmallNum.prototype.notEquals = LargeNum.prototype.neq = LargeNum.prototype.notEquals;

      LargeNum.prototype.greater = function(otherNum){
        return this.compare(otherNum) > 0;
      };
      NativeBigNum.prototype.gt = NativeBigNum.prototype.greater = SmallNum.prototype.gt = SmallNum.prototype.greater = LargeNum.prototype.gt = LargeNum.prototype.greater;

      LargeNum.prototype.lesser = function(otherNum){
        return this.compare(otherNum) < 0;
      };
      NativeBigNum.prototype.lt = NativeBigNum.prototype.lesser = SmallNum.prototype.lt = SmallNum.prototype.lesser = LargeNum.prototype.lt = LargeNum.prototype.lesser;

      LargeNum.prototype.greaterOrEquals = function(otherNum){
        return this.compare(otherNum) >= 0;
      };
      NativeBigNum.prototype.geq = NativeBigNum.prototype.greaterOrEquals = SmallNum.prototype.geq = SmallNum.prototype.greaterOrEquals = LargeNum.prototype.geq = LargeNum.prototype.greaterOrEquals;

      LargeNum.prototype.lesserOrEquals = function(otherNum){
        return this.compare(otherNum) <= 0;
      };
      NativeBigNum.prototype.leq = NativeBigNum.prototype.lesserOrEquals = SmallNum.prototype.leq = SmallNum.prototype.lesserOrEquals = LargeNum.prototype.leq = LargeNum.prototype.lesserOrEquals;

      // --- Property Checks ---

      LargeNum.prototype.isEven = function(){
        return 0 == (1 & this.value[0]); // Check last digit
      };
      SmallNum.prototype.isEven = function(){
        return 0 == (1 & this.value);
      };
      NativeBigNum.prototype.isEven = function(){
        return (this.value & BigInt(1)) === BigInt(0);
      };

      LargeNum.prototype.isOdd = function(){
        return 1 == (1 & this.value[0]);
      };
      SmallNum.prototype.isOdd = function(){
        return 1 == (1 & this.value);
      };
      NativeBigNum.prototype.isOdd = function(){
        return (this.value & BigInt(1)) === BigInt(1);
      };

      LargeNum.prototype.isPositive = function(){
        return !this.sign;
      };
      SmallNum.prototype.isPositive = function(){
        return this.value > 0;
      };
      NativeBigNum.prototype.isPositive = SmallNum.prototype.isPositive;

      LargeNum.prototype.isNegative = function(){
        return this.sign;
      };
      SmallNum.prototype.isNegative = function(){
        return this.value < 0;
      };
      NativeBigNum.prototype.isNegative = SmallNum.prototype.isNegative;

      LargeNum.prototype.isUnit = function(){
        return false; // Unit is 1 or -1, always small
      };
      SmallNum.prototype.isUnit = function(){
        return 1 === Math.abs(this.value);
      };
      NativeBigNum.prototype.isUnit = function(){
        return this.abs().value === BigInt(1);
      };

      LargeNum.prototype.isZero = function(){
        return false; // Zero is always small
      };
      SmallNum.prototype.isZero = function(){
        return 0 === this.value;
      };
      NativeBigNum.prototype.isZero = function(){
        return this.value === BigInt(0);
      };

      LargeNum.prototype.isDivisibleBy = function(divisorNum){
        var divisor = ensureBigIntInstance(divisorNum);
        if(divisor.isZero()) return false; // Cannot divide by zero
        if(divisor.isUnit()) return true; // Divisible by 1 or -1
        if(0 === divisor.compareAbs(2)) return this.isEven(); // Divisible by 2 if even
        return this.mod(divisor).isZero(); // Otherwise, check if remainder is zero
      };
      NativeBigNum.prototype.isDivisibleBy = SmallNum.prototype.isDivisibleBy = LargeNum.prototype.isDivisibleBy;

      LargeNum.prototype.isPrime = function(numIterations){
        var probablePrimeResult = isProbablyPrimeSmall(this);
        if(void 0 !== probablePrimeResult) return probablePrimeResult;

        var absValue = this.abs();
        var bitLength = absValue.bitLength();
        if(bitLength.leq(BigMathLib(64))) { // For numbers up to 64 bits, use a fixed set of witnesses
          return runMillerRabinTest(absValue, [2,3,5,7,11,13,17,19,23,29,31,37].map(BigMathLib));
        }

        // For larger numbers, use a number of random witnesses
        var logValue = Math.log(2) * bitLength.toJSNumber();
        var witnessCount = Math.ceil(true === numIterations ? 2 * Math.pow(logValue, 2) : logValue);
        var witnesses = [];
        for(var i = 0; i < witnessCount; i++) witnesses.push(BigMathLib(i + 2));
        return runMillerRabinTest(absValue, witnesses);
      };
      NativeBigNum.prototype.isPrime = SmallNum.prototype.isPrime = LargeNum.prototype.isPrime;

      LargeNum.prototype.isProbablePrime = function(numIterations){
        var probablePrimeResult = isProbablyPrimeSmall(this);
        if(void 0 !== probablePrimeResult) return probablePrimeResult;

        var absValue = this.abs();
        var iterations = void 0 === numIterations ? 5 : numIterations; // Default iterations
        var witnesses = [];
        for(var i = 0; i < iterations; i++) {
          witnesses.push(BigMathLib.randBetween(2, absValue.minus(2)));
        }
        return runMillerRabinTest(absValue, witnesses);
      };
      NativeBigNum.prototype.isProbablePrime = SmallNum.prototype.isProbablePrime = LargeNum.prototype.isProbablePrime;

      LargeNum.prototype.modInv = function(modulusNum){
        var tempRemainder, tempQuotient, tempX, tempY;
        var x0 = BigMathLib.zero, x1 = BigMathLib.one;
        var m = ensureBigIntInstance(modulusNum);
        var a = this.abs(); // Work with absolute value of 'a'

        while(!a.isZero()){
          tempQuotient = m.divide(a);
          tempRemainder = x0;
          tempY = m;

          x0 = x1;
          m = a;
          x1 = tempRemainder.subtract(tempQuotient.multiply(x1));
          a = tempY.subtract(tempQuotient.multiply(a));
        }

        if(!m.isUnit()) {
          throw new Error("The numbers " + this.toString() + " and " + modulusNum.toString() + " are not co-prime.");
        }

        // Adjust x0 to be positive and within [0, m)
        if(-1 === x0.compare(0)){
          x0 = x0.add(modulusNum);
        }

        // If original number was negative, negate the result
        return this.isNegative() ? x0.negate() : x0;
      };
      NativeBigNum.prototype.modInv = SmallNum.prototype.modInv = LargeNum.prototype.modInv;

      LargeNum.prototype.next = function(){
        var currentVal = this.value;
        return this.sign ? subtractSmallNumFromArray(currentVal, 1, this.sign) : new LargeNum(addSmallNumToArray(currentVal, 1), this.sign);
      };
      SmallNum.prototype.next = function(){
        var currentVal = this.value;
        if(currentVal + 1 < maxSmallNumber) return new SmallNum(currentVal + 1);
        return new LargeNum(maxSmallNumberArr, false);
      };
      NativeBigNum.prototype.next = function(){
        return new NativeBigNum(this.value + BigInt(1));
      };

      LargeNum.prototype.prev = function(){
        var currentVal = this.value;
        return this.sign ? new LargeNum(addSmallNumToArray(currentVal, 1), true) : subtractSmallNumFromArray(currentVal, 1, this.sign);
      };
      SmallNum.prototype.prev = function(){
        var currentVal = this.value;
        if(currentVal - 1 > -maxSmallNumber) return new SmallNum(currentVal - 1);
        return new LargeNum(maxSmallNumberArr, true); // Represents negative maxSmallNumber
      };
      NativeBigNum.prototype.prev = function(){
        return new NativeBigNum(this.value - BigInt(1));
      };

      // Precomputed powers of 2 for bitwise shifts
      var twoPowers = [1];
      while(2 * twoPowers[twoPowers.length - 1] <= digitBase) twoPowers.push(2 * twoPowers[twoPowers.length - 1]);
      var twoPowersLen = twoPowers.length;
      var maxTwoPower = twoPowers[twoPowersLen - 1];

      /**
       * Checks if a number fits within a single digit chunk.
       * @param {number} num - The number to check.
       * @returns {boolean} True if it fits.
       */
      function isSmallValue(num){
        return Math.abs(num) <= digitBase;
      }

      /**
       * Performs bitwise operations (AND, OR, XOR) on two BigMathLib instances.
       * @param {BigMathLib} num1 - The first number.
       * @param {BigMathLib} num2 - The second number.
       * @param {function(number, number): number} operation - The bitwise operation function.
       * @returns {BigMathLib} The result.
       */
      function executeBitwiseOperation(num1, num2, operation){
        num1 = ensureBigIntInstance(num1);
        num2 = ensureBigIntInstance(num2);

        var isNum1Negative = num1.isNegative();
        var isNum2Negative = num2.isNegative();

        // Convert to two's complement-like representation for negative numbers
        var processedNum1 = isNum1Negative ? num1.not() : num1;
        var processedNum2 = isNum2Negative ? num2.not() : num2;

        var tempRemainder1, tempRemainder2;
        var quotient1, quotient2;
        var digitResults = [];
        var currentCarryA = 0;
        var currentCarryB = 0;

        // Process digit chunks from least significant to most significant
        while(!processedNum1.isZero() || !processedNum2.isZero()){
          tempRemainder1 = (quotient1 = calculateQuotientAndRemainder(processedNum1, maxTwoPower))[1].toJSNumber();
          if(isNum1Negative) tempRemainder1 = maxTwoPower - 1 - tempRemainder1; // Invert for negative

          tempRemainder2 = (quotient2 = calculateQuotientAndRemainder(processedNum2, maxTwoPower))[1].toJSNumber();
          if(isNum2Negative) tempRemainder2 = maxTwoPower - 1 - tempRemainder2; // Invert for negative

          processedNum1 = quotient1[0];
          processedNum2 = quotient2[0];

          digitResults.push(operation(tempRemainder1, tempRemainder2));
        }

        // Apply final operation based on original signs
        var finalSignOperation = operation(isNum1Negative ? 1 : 0, isNum2Negative ? 1 : 0);
        var finalResult = (0 !== finalSignOperation) ? BigMathLib(-1) : BigMathLib(0);

        // Reconstruct from digit results
        for(var i = digitResults.length - 1; i >= 0; i--){
          finalResult = finalResult.multiply(maxTwoPower).add(BigMathLib(digitResults[i]));
        }

        return finalResult;
      }

      LargeNum.prototype.shiftLeft = function(shiftAmountNum){
        var shiftAmount = ensureBigIntInstance(shiftAmountNum).toJSNumber();
        if(!isSmallValue(shiftAmount)) throw new Error("Shift amount " + String(shiftAmount) + " is too large.");
        if(shiftAmount < 0) return this.shiftRight(-shiftAmount); // Convert left shift to right shift for negative amount

        var currentNum = this;
        if(currentNum.isZero()) return currentNum;

        // Perform shifts by chunks
        while(shiftAmount >= twoPowersLen){
          currentNum = currentNum.multiply(maxTwoPower);
          shiftAmount -= (twoPowersLen - 1);
        }
        return currentNum.multiply(twoPowers[shiftAmount]);
      };
      NativeBigNum.prototype.shiftLeft = SmallNum.prototype.shiftLeft = LargeNum.prototype.shiftLeft;

      LargeNum.prototype.shiftRight = function(shiftAmountNum){
        var shiftAmount = ensureBigIntInstance(shiftAmountNum).toJSNumber();
        if(!isSmallValue(shiftAmount)) throw new Error("Shift amount " + String(shiftAmount) + " is too large.");
        if(shiftAmount < 0) return this.shiftLeft(-shiftAmount); // Convert right shift to left shift for negative amount

        var currentNum = this;
        // Perform shifts by chunks
        while(shiftAmount >= twoPowersLen){
          if(currentNum.isZero() || (currentNum.isNegative() && currentNum.isUnit())) return currentNum;
          var divModResult = calculateQuotientAndRemainder(currentNum, maxTwoPower);
          currentNum = divModResult[1].isNegative() ? divModResult[0].prev() : divModResult[0];
          shiftAmount -= (twoPowersLen - 1);
        }

        var finalDivModResult = calculateQuotientAndRemainder(currentNum, twoPowers[shiftAmount]);
        return finalDivModResult[1].isNegative() ? finalDivModResult[0].prev() : finalDivModResult[0];
      };
      NativeBigNum.prototype.shiftRight = SmallNum.prototype.shiftRight = LargeNum.prototype.shiftRight;

      LargeNum.prototype.not = function(){
        return this.negate().prev();
      };
      NativeBigNum.prototype.not = SmallNum.prototype.not = LargeNum.prototype.not;

      LargeNum.prototype.and = function(otherNum){
        return executeBitwiseOperation(this, otherNum, function(a, b){ return a & b; });
      };
      NativeBigNum.prototype.and = SmallNum.prototype.and = LargeNum.prototype.and;

      LargeNum.prototype.or = function(otherNum){
        return executeBitwiseOperation(this, otherNum, function(a, b){ return a | b; });
      };
      NativeBigNum.prototype.or = SmallNum.prototype.or = LargeNum.prototype.or;

      LargeNum.prototype.xor = function(otherNum){
        return executeBitwiseOperation(this, otherNum, function(a, b){ return a ^ b; });
      };
      NativeBigNum.prototype.xor = SmallNum.prototype.xor = LargeNum.prototype.xor;

      // Bitmasks for lowest set bit calculation
      var bitwiseMaskA = 1 << 30; // 2^30
      var bitwiseMaskB = (digitBase & -digitBase) * (digitBase & -digitBase) | bitwiseMaskA; // More complex mask

      /**
       * Calculates the lowest set bit mask for a number.
       * @param {BigMathLib} numInstance - The number.
       * @returns {number|BigInt} The lowest set bit mask.
       */
      function getLowestSetBitValue(numInstance){
        var value = numInstance.value;
        if("number" == typeof value){
          return value | bitwiseMaskA & -value; // Equivalent to value & -value for positive numbers
        } else if("bigint" == typeof value){
          return value | BigInt(bitwiseMaskA) & -value;
        } else { // Array representation
          return (value[0] + value[1] * digitBase) | bitwiseMaskB & -(value[0] + value[1] * digitBase);
        }
      }

      /**
       * Returns the greater of two BigMathLib instances.
       * @param {BigMathLib} num1 - First number.
       * @param {BigMathLib} num2 - Second number.
       * @returns {BigMathLib} The greater number.
       */
      function findMaximum(num1, num2){
        num1 = ensureBigIntInstance(num1);
        num2 = ensureBigIntInstance(num2);
        return num1.greater(num2) ? num1 : num2;
      }

      /**
       * Returns the lesser of two BigMathLib instances.
       * @param {BigMathLib} num1 - First number.
       * @param {BigMathLib} num2 - Second number.
       * @returns {BigMathLib} The lesser number.
       */
      function findMinimum(num1, num2){
        num1 = ensureBigIntInstance(num1);
        num2 = ensureBigIntInstance(num2);
        return num1.lesser(num2) ? num1 : num2;
      }

      /**
       * Computes the greatest common divisor (GCD) of two BigMathLib instances.
       * @param {BigMathLib} num1 - First number.
       * @param {BigMathLib} num2 - Second number.
       * @returns {BigMathLib} The GCD.
       */
      function computeGreatestCommonDivisor(num1, num2){
        num1 = ensureBigIntInstance(num1).abs();
        num2 = ensureBigIntInstance(num2).abs();

        if(num1.equals(num2)) return num1;
        if(num1.isZero()) return num2;
        if(num2.isZero()) return num1;

        var commonFactor = createNumericInstance[1];
        var tempNum;

        // Euclidean algorithm with binary GCD optimization
        while(num1.isEven() && num2.isEven()){
          var lowestBitMask = findMinimum(getLowestSetBitValue(num1), getLowestSetBitValue(num2));
          num1 = num1.divide(lowestBitMask);
          num2 = num2.divide(lowestBitMask);
          commonFactor = commonFactor.multiply(lowestBitMask);
        }

        while(num1.isEven()) num1 = num1.divide(getLowestSetBitValue(num1));

        do {
          while(num2.isEven()) num2 = num2.divide(getLowestSetBitValue(num2));
          if(num1.greater(num2)) {
            tempNum = num2;
            num2 = num1;
            num1 = tempNum;
          }
          num2 = num2.subtract(num1);
        } while(!num2.isZero());

        return commonFactor.isUnit() ? num1 : num1.multiply(commonFactor);
      }

      LargeNum.prototype.bitLength = function(){
        var currentNum = this;
        if(currentNum.compareTo(BigMathLib(0)) < 0) currentNum = currentNum.negate().subtract(BigMathLib(1));
        if(0 === currentNum.compareTo(BigMathLib(0))) return BigMathLib(0);

        // Helper recursive function to calculate bit length
        function calculateBitLengthRecursive(targetNum, basePowerOfTwo){
          if(basePowerOfTwo.compareTo(targetNum) <= 0){
            var doubledPower = calculateBitLengthRecursive(targetNum, basePowerOfTwo.square());
            var product = doubledPower.p.multiply(basePowerOfTwo);
            if(product.compareTo(targetNum) <= 0){
              return { p: product, e: doubledPower.e * 2 + 1 };
            } else {
              return { p: doubledPower.p, e: doubledPower.e * 2 };
            }
          }
          return { p: BigMathLib(1), e: 0 };
        }
        var result = calculateBitLengthRecursive(currentNum, BigMathLib(2));
        return BigMathLib(result.e).add(BigMathLib(1));
      };
      NativeBigNum.prototype.bitLength = SmallNum.prototype.bitLength = LargeNum.prototype.bitLength;

      /**
       * Parses a string representation of a number in a given base.
       * @param {string} inputString - The string to parse.
       * @param {number} base - The base of the number.
       * @param {boolean} [ignoreRadix] - If true, ignore base characters.
       * @param {boolean} [preserveCase] - If true, preserve case of digits.
       * @returns {BigMathLib} The parsed BigMathLib instance.
       * @throws {Error} If an invalid digit is encountered.
       */
      var parseValueFromBaseString = function(inputString, base, ignoreRadix, preserveCase){
        var effectiveBaseChars = digitChars;
        if(!preserveCase) {
          inputString = String(inputString).toLowerCase();
          effectiveBaseChars = effectiveBaseChars.toLowerCase();
        }

        var stringLength = inputString.length;
        var absBase = Math.abs(base);
        var charMap = {};
        for(var i = 0; i < effectiveBaseChars.length; i++) charMap[effectiveBaseChars[i]] = i;

        // Validate digits
        for(var j = 0; j < stringLength; j++){
          var char = inputString[j];
          if("-" !== char && (char in charMap && charMap[char] >= absBase)){
            if("1" === char && 1 === absBase) continue; // Special case for base 1
            throw new Error("Invalid digit: '" + char + "' is not valid in base " + base + ".");
          }
        }

        var baseBigInt = ensureBigIntInstance(base);
        var digitArray = [];
        var isNegative = "-" === inputString[0];

        // Convert string to an array of BigInt digits
        for(var k = isNegative ? 1 : 0; k < inputString.length; k++){
          var currentCharacter = inputString[k];
          if(currentCharacter in charMap){
            digitArray.push(ensureBigIntInstance(charMap[currentCharacter]));
          } else {
            // Handle custom digit representations (e.g., <10>, <11>)
            if("<" !== currentCharacter) throw new Error("Invalid character: '" + currentCharacter + "' is not valid.");
            var startIdx = k;
            do { k++; } while(">" !== inputString[k] && k < inputString.length);
            digitArray.push(ensureBigIntInstance(inputString.slice(startIdx + 1, k)));
          }
        }
        return buildFromDigitArray(digitArray, baseBigInt, isNegative);
      };

      /**
       * Constructs a BigMathLib instance from an array of BigMathLib digits in a given base.
       * @param {BigMathLib[]} digitArray - Array of digits (as BigMathLib instances).
       * @param {BigMathLib} base - The base.
       * @param {boolean} isNegative - Whether the number is negative.
       * @returns {BigMathLib} The constructed BigMathLib instance.
       */
      function buildFromDigitArray(digitArray, base, isNegative){
        var result = createNumericInstance[0];
        var powerOfBase = createNumericInstance[1];
        for(var i = digitArray.length - 1; i >= 0; i--){
          result = result.add(digitArray[i].times(powerOfBase));
          powerOfBase = powerOfBase.times(base);
        }
        return isNegative ? result.negate() : result;
      }

      /**
       * Converts a BigMathLib instance to an array of digits in a given base.
       * @param {BigMathLib} numInstance - The number to convert.
       * @param {BigMathLib} base - The target base.
       * @returns {{value: number[], isNegative: boolean}} Object with digit array and sign.
       * @throws {Error} If base is zero and num is non-zero.
       */
      function convertToDigitArray(numInstance, base){
        if((base = ensureBigIntInstance(base)).isZero()){
          if(numInstance.isZero()) return {value: [0], isNegative: false};
          throw new Error("Cannot convert non-zero numbers to base 0.");
        }
        if(base.equals(-1)){
          if(numInstance.isZero()) return {value: [0], isNegative: false};
          if(numInstance.isNegative()) {
            // Example: -5 in base -1 -> 101010
            var valArray = [];
            for (var i = 0; i < -numInstance.toJSNumber(); i++) valArray.push(1, 0);
            return {value: valArray, isNegative: false};
          }
          // Example: 5 in base -1 -> 10101
          var resultParts = [];
          for (var j = 0; j < numInstance.toJSNumber() - 1; j++) resultParts.push(0, 1);
          resultParts.unshift(1);
          return {value: resultParts, isNegative: false};
        }

        var isResultNegative = false;
        if(numInstance.isNegative() && base.isPositive()){
          isResultNegative = true;
          numInstance = numInstance.abs();
        }

        if(base.isUnit()){
          return numInstance.isZero()
            ? {value: [0], isNegative: false}
            : {value: Array.apply(null, Array(numInstance.toJSNumber())).map(Number.prototype.valueOf, 1), isNegative: isResultNegative};
        }

        var digits = [];
        var currentNum = numInstance;
        while(currentNum.isNegative() || currentNum.compareAbs(base) >= 0){
          var divModResult = currentNum.divmod(base);
          currentNum = divModResult.quotient;
          var remainder = divModResult.remainder;

          // Adjust for negative remainders in non-standard bases (e.g., base -2)
          if(remainder.isNegative()){
            remainder = base.minus(remainder).abs();
            currentNum = currentNum.next();
          }
          digits.push(remainder.toJSNumber());
        }
        digits.push(currentNum.toJSNumber());
        return {value: digits.reverse(), isNegative: isResultNegative};
      }

      /**
       * Formats a BigMathLib instance to a string in a given base.
       * @param {BigMathLib} numInstance - The number to format.
       * @param {number} base - The target base.
       * @param {string} [charSet] - Optional character set for digits.
       * @returns {string} The formatted string.
       */
      function formatValueToBaseString(numInstance, base, charSet){
        var conversionResult = convertToDigitArray(numInstance, base);
        var finalCharSet = charSet || digitChars;
        return (conversionResult.isNegative ? "-" : "") + conversionResult.value.map(function(digit){
          return (function(val, charset){
            return val < (charset = charset || digitChars).length ? charset[val] : "<" + val + ">";
          })(digit, finalCharSet);
        }).join("");
      }

      /**
       * Parses a numeric string into a BigMathLib instance.
       * Handles scientific notation and checks for valid integer format.
       * @param {string} numString - The string to parse.
       * @returns {BigMathLib} The parsed BigMathLib instance.
       * @throws {Error} If the string is not a valid integer.
       */
      function parseNumericString(numString){
        if(isWithinSmallRange(+numString)){ // Try parsing as a small JS number first
          var num = +numString;
          if(num === roundToInteger(num)) return nativeBigIntAvail ? new NativeBigNum(BigInt(num)) : new SmallNum(num);
          throw new Error("Invalid integer: " + numString);
        }

        var isNegative = "-" === numString[0];
        if(isNegative) numString = numString.slice(1);

        var scientificParts = numString.split(/e/i);
        if(scientificParts.length > 2) throw new Error("Invalid integer: " + scientificParts.join("e"));

        if(2 === scientificParts.length){ // Handle scientific notation (e.g., "1.23e+5")
          var exponentPart = scientificParts[1];
          if("+" === exponentPart[0]) exponentPart = exponentPart.slice(1);
          if((exponentPart = +exponentPart) !== roundToInteger(exponentPart) || !isWithinSmallRange(exponentPart)) {
            throw new Error("Invalid integer: " + exponentPart + " is not a valid exponent.");
          }

          var mantissaPart = scientificParts[0];
          var decimalPointIndex = mantissaPart.indexOf(".");
          if(decimalPointIndex >= 0){
            exponentPart -= (mantissaPart.length - decimalPointIndex - 1);
            mantissaPart = mantissaPart.slice(0, decimalPointIndex) + mantissaPart.slice(decimalPointIndex + 1);
          }
          if(exponentPart < 0) throw new Error("Cannot handle negative exponent for integer conversion.");
          numString = mantissaPart + new Array(exponentPart + 1).join("0"); // Append zeros
        }

        if(!/^([0-9][0-9]*)$/.test(numString)) throw new Error("Invalid integer format: " + numString);

        if(nativeBigIntAvail) return new NativeBigNum(BigInt(isNegative ? "-" + numString : numString));

        var digits = [];
        var currentLength = numString.length;
        var chunkSize = chunkLen;
        var startIdx = currentLength - chunkSize;

        while(currentLength > 0){
          digits.push(+numString.slice(startIdx, currentLength));
          startIdx = (startIdx -= chunkSize) < 0 ? 0 : startIdx;
          currentLength -= chunkSize;
        }
        normalizeDigitArray(digits);
        return new LargeNum(digits, isNegative);
      }

      /**
       * Ensures an input is a BigMathLib instance, coercing if necessary.
       * @param {any} input - The value to coerce.
       * @returns {BigMathLib} A BigMathLib instance.
       * @throws {Error} If input is a non-integer number.
       */
      function ensureBigIntInstance(input){
        if("number" == typeof input){
          if(nativeBigIntAvail) return new NativeBigNum(BigInt(input));
          if(isWithinSmallRange(input)){
            if(input !== roundToInteger(input)) throw new Error(input + " is not an integer.");
            return new SmallNum(input);
          }
          return parseNumericString(input.toString());
        } else if("string" == typeof input){
          return parseNumericString(input);
        } else if("bigint" == typeof input){
          return new NativeBigNum(input);
        } else {
          return input; // Already a BigMathLib instance
        }
      }

      LargeNum.prototype.toArray = function(base){
        return convertToDigitArray(this, base);
      };
      SmallNum.prototype.toArray = function(base){
        return convertToDigitArray(this, base);
      };
      NativeBigNum.prototype.toArray = function(base){
        return convertToDigitArray(this, base);
      };

      LargeNum.prototype.toString = function(base, charSet){
        if(void 0 === base) base = 10;
        if(10 !== base) return formatValueToBaseString(this, base, charSet);

        var digitArray = this.value;
        var arrLength = digitArray.length;
        var firstDigitStr = String(digitArray[--arrLength]);
        while(--arrLength >= 0){
          var currentDigitStr = String(digitArray[arrLength]);
          firstDigitStr += "0000000".slice(currentDigitStr.length) + currentDigitStr;
        }
        return (this.sign ? "-" : "") + firstDigitStr;
      };
      SmallNum.prototype.toString = function(base, charSet){
        if(void 0 === base) base = 10;
        if(10 != base) return formatValueToBaseString(this, base, charSet);
        return String(this.value);
      };
      NativeBigNum.prototype.toString = SmallNum.prototype.toString;

      NativeBigNum.prototype.toJSON = LargeNum.prototype.toJSON = SmallNum.prototype.toJSON = function(){
        return this.toString();
      };

      LargeNum.prototype.valueOf = function(){
        return parseInt(this.toString(), 10);
      };
      LargeNum.prototype.toJSNumber = LargeNum.prototype.valueOf;
      SmallNum.prototype.valueOf = function(){
        return this.value;
      };
      SmallNum.prototype.toJSNumber = SmallNum.prototype.valueOf;
      NativeBigNum.prototype.valueOf = NativeBigNum.prototype.toJSNumber = function(){
        return parseInt(this.toString(), 10);
      };

      // Precompute and cache small integer instances
      var precomputedSmallInts = [];
      for(var i = 0; i < 1e3; i++){
        precomputedSmallInts[i] = ensureBigIntInstance(i);
        if(i > 0) precomputedSmallInts[-i] = ensureBigIntInstance(-i);
      }

      // Export commonly used constants and utility functions
      createNumericInstance.one = createNumericInstance[1];
      createNumericInstance.zero = createNumericInstance[0];
      createNumericInstance.minusOne = createNumericInstance[-1];
      createNumericInstance.max = findMaximum;
      createNumericInstance.min = findMinimum;
      createNumericInstance.gcd = computeGreatestCommonDivisor;
      createNumericInstance.lcm = function(num1, num2){
        num1 = ensureBigIntInstance(num1).abs();
        num2 = ensureBigIntInstance(num2).abs();
        return num1.divide(computeGreatestCommonDivisor(num1, num2)).multiply(num2);
      };
      createNumericInstance.isInstance = function(obj){
        return obj instanceof LargeNum || obj instanceof SmallNum || obj instanceof NativeBigNum;
      };
      createNumericInstance.randBetween = function(lowerBound, upperBound){
        var min = findMinimum(lowerBound = ensureBigIntInstance(lowerBound), upperBound = ensureBigIntInstance(upperBound));
        var max = findMaximum(lowerBound, upperBound);
        var range = max.subtract(min).add(1);

        if(range.isSmall) return min.add(Math.floor(Math.random() * range));

        var rangeDigits = convertToDigitArray(range, digitBase).value;
        var randomDigits = [];
        var isLeadingZero = true; // Flag to ensure highest digit is not zero unless range is zero

        for(var i = 0; i < rangeDigits.length; i++){
          var upperLimit = isLeadingZero ? rangeDigits[i] : digitBase;
          var randomDigit = roundToInteger(Math.random() * upperLimit);
          randomDigits.push(randomDigit);
          if(randomDigit < upperLimit) isLeadingZero = false;
        }
        return min.add(createNumericInstance.fromArray(randomDigits, digitBase, false));
      };
      createNumericInstance.fromArray = function(digitArr, base, isNegative){
        return buildFromDigitArray(digitArr.map(ensureBigIntInstance), ensureBigIntInstance(base || 10), isNegative);
      };

      return createNumericInstance;
    }();

    if("undefined" != typeof module && module.hasOwnProperty("exports")) {
      module.exports = BigMathLib;
    }
    if("function" == typeof define && define.amd) {
      define("big-integer",[],function(){ return BigMathLib; });
    }
  },{}],
  "Focm":[function(require,module,exports) {
    // This file contains the main application logic, compiled from PureScript.
    // Module definitions are structured as `runtimeModules["Module.Path"] = runtimeModules["Module.Path"] || {}`

    var runtimeModules = {};

    (function(currentModule){
      "use strict";
      var SemigroupoidType = function(composeFn){ this.compose = composeFn };
      var semigroupoidInstance = new SemigroupoidType(function(f){
        return function(g){
          return function(x){
            return f(g(x));
          };
        };
      });
      currentModule.compose = function(dict){ return dict.compose };
      currentModule.Semigroupoid = SemigroupoidType;
      currentModule.semigroupoidFn = semigroupoidInstance;
    })(runtimeModules["Control.Semigroupoid"] = runtimeModules["Control.Semigroupoid"] || {});

    (function(currentModule){
      "use strict";
      var semigroupoidRef = runtimeModules["Control.Semigroupoid"];
      var CategoryType = function(semigroupoidDict, identityFn){
        this.Semigroupoid0 = semigroupoidDict;
        this.identity = identityFn;
      };
      var categoryInstance = new CategoryType(function(){ return semigroupoidRef.semigroupoidFn }, function(x){ return x });
      currentModule.Category = CategoryType;
      currentModule.identity = function(dict){ return dict.identity };
      currentModule.categoryFn = categoryInstance;
    })(runtimeModules["Control.Category"] = runtimeModules["Control.Category"] || {});

    (function(currentModule){
      "use strict";
      (runtimeModules["Data.Eq"] = runtimeModules["Data.Eq"] || {}).referenceEquality = function(x){ return function(y){ return x === y } };
    })();

    (function(currentModule){
      "use strict";
      (runtimeModules["Data.Unit"] = runtimeModules["Data.Unit"] || {}).unitValue = {};
    })();

    (function(currentModule){
      "use strict";
      runtimeModules["Data.Show"]; runtimeModules["Data.Symbol"]; runtimeModules["Record.Unsafe"]; runtimeModules["Type.Data.RowList"];
      currentModule.Show = function(showFn){ this.show = showFn };
      currentModule.displayValue = function(dict){ return dict.show };
    })(runtimeModules["Data.Show"] = runtimeModules["Data.Show"] || {});

    (function(currentModule){
      "use strict";
      var unitRef = runtimeModules["Data.Unit"];
      runtimeModules["Data.Show"];
      currentModule.unit = unitRef.unitValue;
    })(runtimeModules["Data.Unit"] = runtimeModules["Data.Unit"] || {});

    (function(currentModule){
      "use strict";
      var eqRef = runtimeModules["Data.Eq"];
      var heytingAlgebraRef = (runtimeModules["Data.HeytingAlgebra"], runtimeModules["Data.Symbol"], runtimeModules["Data.Unit"], runtimeModules["Data.Void"], runtimeModules["Record.Unsafe"], runtimeModules["Type.Data.RowList"]);
      var EquivalenceType = function(eqFn){ this.eq = eqFn };
      var charEqInstance = new EquivalenceType(eqRef.referenceEquality);
      var booleanEqInstance = new EquivalenceType(eqRef.referenceEquality);
      var areEqual = function(dict){ return dict.eq };
      currentModule.EquivalenceType = EquivalenceType;
      currentModule.areEqual = areEqual;
      currentModule.notEqual = function(dict){
        return function(x){
          return function(y){
            return areEqual(booleanEqInstance)(areEqual(dict)(x)(y))(!false);
          };
        };
      };
      currentModule.booleanEq = booleanEqInstance;
      currentModule.charEq = charEqInstance;
    })(runtimeModules["Data.Eq"] = runtimeModules["Data.Eq"] || {});

    (function(currentModule){
      "use strict";
      runtimeModules["Data.Semigroup"]; runtimeModules["Data.Symbol"]; runtimeModules["Data.Unit"]; runtimeModules["Data.Void"]; runtimeModules["Record.Unsafe"]; runtimeModules["Type.Data.RowList"];
      currentModule.Semigroup = function(appendFn){ this.append = appendFn };
      currentModule.combineElements = function(dict){ return dict.append };
    })(runtimeModules["Data.Semigroup"] = runtimeModules["Data.Semigroup"] || {});

    (function(currentModule){
      "use strict";
      runtimeModules["Data.Eq"]; runtimeModules["Data.Semigroup"]; runtimeModules["Data.Show"];
      var OrderLess = (function(){ function OrderLessCtor(){} OrderLessCtor.value = new OrderLessCtor(); return OrderLessCtor; })();
      var OrderGreater = (function(){ function OrderGreaterCtor(){} OrderGreaterCtor.value = new OrderGreaterCtor(); return OrderGreaterCtor; })();
      var OrderEqual = (function(){ function OrderEqualCtor(){} OrderEqualCtor.value = new OrderEqualCtor(); return OrderEqualCtor; })();
      currentModule.OrderLess = OrderLess;
      currentModule.OrderGreater = OrderGreater;
      currentModule.OrderEqual = OrderEqual;
    })(runtimeModules["Data.Ordering"] = runtimeModules["Data.Ordering"] || {});

    (function(currentModule){
      "use strict";
      runtimeModules["Data.Ord"]; runtimeModules["Data.Eq"]; runtimeModules["Data.Ord.Unsafe"];
      var orderingRef = runtimeModules["Data.Ordering"];
      var ringRef = (runtimeModules["Data.Ring"], runtimeModules["Data.Semiring"], runtimeModules["Data.Symbol"], runtimeModules["Data.Unit"], runtimeModules["Data.Void"], runtimeModules["Record.Unsafe"], runtimeModules["Type.Data.RowList"]);
      var OrderableType = function(eqDict, compareFn){
        this.Eq0 = eqDict;
        this.compare = compareFn;
      };
      var performComparison = function(dict){ return dict.compare };
      currentModule.OrderableType = OrderableType;
      currentModule.performComparison = performComparison;
      currentModule.lessThanOrEq = function(dict){
        return function(x){
          return function(y){
            return !(performComparison(dict)(x)(y) instanceof orderingRef.OrderGreater);
          };
        };
      };
    })(runtimeModules["Data.Ord"] = runtimeModules["Data.Ord"] || {});

    (function(currentModule){
      "use strict";
      runtimeModules["Control.Category"]; runtimeModules["Data.Boolean"]; runtimeModules["Data.Ord"]; runtimeModules["Data.Ring"];
      currentModule.flipArgs = function(f){
        return function(x){
          return function(y){
            return f(y)(x);
          };
        };
      };
      currentModule.constantFn = function(x){
        return function(y){
          return x;
        };
      };
    })(runtimeModules["Data.Function"] = runtimeModules["Data.Function"] || {});

    (function(currentModule){
      "use strict";
      runtimeModules["Data.Functor"]; runtimeModules["Control.Semigroupoid"];
      var functionRef = runtimeModules["Data.Function"];
      var unitRef = runtimeModules["Data.Unit"];
      var transformValue = function(dict){ return dict.map };
      currentModule.Functor = function(mapFn){ this.map = mapFn };
      currentModule.transformValue = transformValue;
      currentModule.void = function(dict){
        return transformValue(dict)(functionRef.constantFn(unitRef.unitValue));
      };
    })(runtimeModules["Data.Functor"] = runtimeModules["Data.Functor"] || {});

    (function(currentModule){
      "use strict";
      runtimeModules["Control.Apply"];
      var categoryRef = runtimeModules["Control.Category"];
      var functionRef = runtimeModules["Data.Function"];
      var functorRef = runtimeModules["Data.Functor"];
      var applyFunction = function(dict){ return dict.apply };
      currentModule.Apply = function(functorDict, applyFn){
        this.Functor0 = functorDict;
        this.apply = applyFn;
      };
      currentModule.applyFunction = applyFunction;
      currentModule.applySecond = function(dict){
        return function(f){
          return function(a){
            return applyFunction(dict)(functorRef.transformValue(dict.Functor0())(functionRef.constantFn(categoryRef.identity(categoryRef.categoryFn)))(f))(a);
          };
        };
      };
    })(runtimeModules["Control.Apply"] = runtimeModules["Control.Apply"] || {});

    (function(currentModule){
      "use strict";
      var applyRef = runtimeModules["Control.Apply"];
      var functorRef = (runtimeModules["Data.Functor"], runtimeModules["Data.Unit"]);
      var wrapValue = function(dict){ return dict.pure };
      currentModule.Applicative = function(applyDict, pureFn){
        this.Apply0 = applyDict;
        this.pure = pureFn;
      };
      currentModule.wrapValue = wrapValue;
      currentModule.liftA1 = function(dict){
        return function(f){
          return function(a){
            return applyRef.applyFunction(dict.Apply0())(wrapValue(dict)(f))(a);
          };
        };
      };
    })(runtimeModules["Control.Applicative"] = runtimeModules["Control.Applicative"] || {});

    (function(currentModule){
      "use strict";
      runtimeModules["Control.Bind"]; runtimeModules["Control.Applicative"]; runtimeModules["Control.Apply"]; runtimeModules["Control.Category"];
      var functionRef = runtimeModules["Data.Function"];
      var functorRef = (runtimeModules["Data.Functor"], runtimeModules["Data.Unit"]);
      var sequenceOperation = function(dict){ return dict.bind };
      var sequenceOperationFlipped = function(dict){ return functionRef.flipArgs(sequenceOperation(dict)) };
      currentModule.Bind = function(applyDict, bindFn){
        this.Apply0 = applyDict;
        this.bind = bindFn;
      };
      currentModule.sequenceOperation = sequenceOperation;
      currentModule.sequenceOperationFlipped = sequenceOperationFlipped;
      currentModule.composeKleisliFlipped = function(dict){
        return function(f){
          return function(g){
            return function(x){
              return sequenceOperationFlipped(dict)(f)(g(x));
            };
          };
        };
      };
    })(runtimeModules["Control.Bind"] = runtimeModules["Control.Bind"] || {});

    (function(currentModule){
      "use strict";
      currentModule.getArrayLength = function(arr){ return arr.length };
      currentModule.safeArrayIndex = function(justFn){
        return function(nothingVal){
          return function(arr){
            return function(idx){
              if(idx < 0 || idx >= arr.length) return nothingVal;
              return justFn(arr[idx]);
            };
          };
        };
      };
      currentModule.findArrayIndex = function(justFn){
        return function(nothingVal){
          return function(predicate){
            return function(arr){
              for(var i = 0, len = arr.length; i < len; i++){
                if(predicate(arr[i])) return justFn(i);
              }
              return nothingVal;
            };
          };
        };
      };
      currentModule.sliceArray = function(start){
        return function(end){
          return function(arr){
            return arr.slice(start, end);
          };
        };
      };
      currentModule.takeElements = function(n){
        return function(arr){
          return n < 1 ? [] : arr.slice(0, n);
        };
      };
    })(runtimeModules["Data.Array"] = runtimeModules["Data.Array"] || {});

    (function(currentModule){
      "use strict";
      currentModule.foldRightArray = function(f){
        return function(initial){
          return function(arr){
            var accumulator = initial;
            for(var i = arr.length - 1; i >= 0; i--) accumulator = f(arr[i])(accumulator);
            return accumulator;
          };
        };
      };
      currentModule.foldLeftArray = function(f){
        return function(initial){
          return function(arr){
            var accumulator = initial;
            for(var i = 0, len = arr.length; i < len; i++) accumulator = f(accumulator)(arr[i]);
            return accumulator;
          };
        };
      };
    })(runtimeModules["Data.Foldable"] = runtimeModules["Data.Foldable"] || {});

    (function(currentModule){
      "use strict";
      var applicativeRef = runtimeModules["Control.Applicative"];
      var applyRef = (runtimeModules["Control.Apply"], runtimeModules["Control.Bind"]);
      var functorRef = (runtimeModules["Data.Functor"], runtimeModules["Data.Unit"]);
      currentModule.MonadInterface = function(applicativeDict, bindDict){
        this.Applicative0 = applicativeDict;
        this.Bind1 = bindDict;
      };
      currentModule.applyMonadic = function(monadDict){
        return function(mf){
          return function(ma){
            return applyRef.sequenceOperation(monadDict.Bind1())(mf)(function(f){
              return applyRef.sequenceOperation(monadDict.Bind1())(ma)(function(a){
                return applicativeRef.wrapValue(monadDict.Applicative0())(f(a));
              });
            });
          };
        };
      };
    })(runtimeModules["Control.Monad"] = runtimeModules["Control.Monad"] || {});

    (function(currentModule){
      "use strict";
      runtimeModules["Data.Boolean"]; runtimeModules["Data.Eq"]; runtimeModules["Data.EuclideanRing"]; runtimeModules["Data.Ord"]; runtimeModules["Data.Ordering"]; runtimeModules["Data.Semigroup"]; runtimeModules["Data.Symbol"]; runtimeModules["Data.Unit"]; runtimeModules["Record.Unsafe"]; runtimeModules["Type.Data.RowList"];
      currentModule.Monoid = function(semigroupDict, memptyVal){
        this.Semigroup0 = semigroupDict;
        this.mempty = memptyVal;
      };
      currentModule.emptyElement = function(dict){ return dict.mempty };
    })(runtimeModules["Data.Monoid"] = runtimeModules["Data.Monoid"] || {});

    (function(currentModule){
      "use strict";
      runtimeModules["Control.Alt"]; runtimeModules["Control.Alternative"]; runtimeModules["Control.Applicative"];
      var applyRef = runtimeModules["Control.Apply"];
      var bindRef = runtimeModules["Control.Bind"];
      var categoryRef = runtimeModules["Control.Category"];
      var extendRef = (runtimeModules["Control.Extend"], runtimeModules["Control.Monad"], runtimeModules["Control.MonadZero"], runtimeModules["Control.Plus"]);
      var functorRef = runtimeModules["Data.Functor"];
      var functorInvariantRef = (runtimeModules["Data.Functor.Invariant"], runtimeModules["Data.Monoid"], runtimeModules["Data.Ord"], runtimeModules["Data.Ordering"], runtimeModules["Data.Semigroup"], runtimeModules["Data.Show"], runtimeModules["Data.Unit"]);
      var preludeRef = runtimeModules.Prelude; // Assuming Prelude exists globally or is loaded

      var MaybeNothing = (function(){ function MaybeNothingCtor(){} MaybeNothingCtor.value = new MaybeNothingCtor(); return MaybeNothingCtor; })();
      var MaybeJust = (function(){ function MaybeJustCtor(val){ this.value0 = val } MaybeJustCtor.create = function(val){ return new MaybeJustCtor(val) }; return MaybeJustCtor; })();

      var handleMaybe = function(nothingHandler){
        return function(justHandler){
          return function(maybeVal){
            if(maybeVal instanceof MaybeNothing) return nothingHandler;
            if(maybeVal instanceof MaybeJust) return justHandler(maybeVal.value0);
            throw new Error("Pattern match failed for Maybe type.");
          };
        };
      };

      var maybeFunctor = new functorRef.Functor(function(f){
        return function(maybeVal){
          if(maybeVal instanceof MaybeJust) return new MaybeJust(f(maybeVal.value0));
          return MaybeNothing.value;
        };
      });

      var maybeApply = new applyRef.Apply(function(){ return maybeFunctor }, function(fMaybe){
        return function(aMaybe){
          if(fMaybe instanceof MaybeJust) return functorRef.transformValue(maybeFunctor)(fMaybe.value0)(aMaybe);
          if(fMaybe instanceof MaybeNothing) return MaybeNothing.value;
          throw new Error("Pattern match failed for Maybe apply.");
        };
      });

      var maybeBind = new bindRef.Bind(function(){ return maybeApply }, function(maybeVal){
        return function(f){
          if(maybeVal instanceof MaybeJust) return f(maybeVal.value0);
          if(maybeVal instanceof MaybeNothing) return MaybeNothing.value;
          throw new Error("Pattern match failed for Maybe bind.");
        };
      });

      currentModule.MaybeNothing = MaybeNothing;
      currentModule.MaybeJust = MaybeJust;
      currentModule.handleMaybe = handleMaybe;
      currentModule.fromMaybe = function(defaultValue){
        return handleMaybe(defaultValue)(categoryRef.identity(categoryRef.categoryFn));
      };
      currentModule.fromJust = function(maybeVal){
        if(maybeVal instanceof MaybeJust) return maybeVal.value0;
        throw new Error("Called fromJust on Nothing.");
      };
      currentModule.maybeFunctor = maybeFunctor;
      currentModule.maybeApply = maybeApply;
      currentModule.maybeBind = maybeBind;
    })(runtimeModules["Data.Maybe"] = runtimeModules["Data.Maybe"] || {});

    (function(currentModule){
      "use strict";
      var foldableRef = runtimeModules["Data.Foldable"];
      var altRef = (runtimeModules["Control.Alt"], runtimeModules["Control.Applicative"]);
      var applyRef = runtimeModules["Control.Apply"];
      var bindRef = (runtimeModules["Control.Bind"], runtimeModules["Control.Category"], runtimeModules["Control.Plus"], runtimeModules["Control.Semigroupoid"], runtimeModules["Data.Eq"], runtimeModules["Data.Function"], runtimeModules["Data.Functor"], runtimeModules["Data.HeytingAlgebra"], runtimeModules["Data.Maybe"], runtimeModules["Data.Maybe.First"], runtimeModules["Data.Maybe.Last"]);
      var monoidRef = runtimeModules["Data.Monoid"];
      var monoidAdditiveRef = (runtimeModules["Data.Monoid.Additive"], runtimeModules["Data.Monoid.Conj"], runtimeModules["Data.Monoid.Disj"], runtimeModules["Data.Monoid.Dual"], runtimeModules["Data.Monoid.Endo"], runtimeModules["Data.Monoid.Multiplicative"], runtimeModules["Data.Newtype"], runtimeModules["Data.Ord"], runtimeModules["Data.Ordering"]);
      var semigroupRef = runtimeModules["Data.Semigroup"];
      var semiringRef = (runtimeModules["Data.Semiring"], runtimeModules["Data.Unit"]);
      var unitRef = runtimeModules["Data.Unit"];
      var preludeRef = runtimeModules.Prelude;

      var FoldableConstructor = function(foldMapFn, foldlFn, foldrFn){
        this.foldMap = foldMapFn;
        this.foldl = foldlFn;
        this.foldr = foldrFn;
      };

      var foldRight = function(dict){ return dict.foldr };
      var defaultFoldMapRight = function(dictFoldable){
        return function(dictMonoid){
          return function(f){
            return function(foldableVal){
              return foldRight(dictFoldable)(function(x){
                return function(accumulator){
                  return semigroupRef.combineElements(dictMonoid.Semigroup0())(f(x))(accumulator);
                };
              })(monoidRef.emptyElement(dictMonoid));
            };
          };
        };
      };

      var arrayFoldableInstance = new FoldableConstructor(
        function(dictMonoid){ return defaultFoldMapRight(arrayFoldableInstance)(dictMonoid) },
        foldableRef.foldlArray,
        foldableRef.foldRightArray
      );

      currentModule.FoldableInterface = FoldableConstructor;
      currentModule.foldRight = foldRight;
      currentModule.foldLeft = function(dict){ return dict.foldl };
      currentModule.foldMapElements = function(dict){ return dict.foldMap };
      currentModule.defaultFoldMapRight = defaultFoldMapRight;
      currentModule.traverse_ = function(dictApplicative){
        return function(dictFoldable){
          return function(f){
            return function(foldableVal){
              return foldRight(dictFoldable)(function(x){
                return applyRef.applySecond(dictApplicative.Apply0())(f(x));
              })(altRef.wrapValue(dictApplicative)(unitRef.unitVal));
            };
          };
        };
      };
      currentModule.arrayFoldable = arrayFoldableInstance;
    })(runtimeModules["Data.Foldable"] = runtimeModules["Data.Foldable"] || {});

    (function(currentModule){
      "use strict";
      (runtimeModules["Partial.Unsafe"] = runtimeModules["Partial.Unsafe"] || {}).unsafePartialCall = function(f){ return f() };
    })();

    (function(currentModule){
      "use strict";
      (runtimeModules["Partial"] = runtimeModules["Partial"] || {}).throwFatalError = function(){
        return function(msg){
          throw new Error(msg);
        };
      };
    })();

    (function(currentModule){
      "use strict";
      var unsafePartialRef = runtimeModules["Partial.Unsafe"];
      var partialRef = runtimeModules.Partial;
      currentModule.forceCrash = function(msg){
        return unsafePartialRef.unsafePartialCall(function(dict){ return partialRef.throwFatalError(dict)(msg) });
      };
    })(runtimeModules["Partial.Unsafe"] = runtimeModules["Partial.Unsafe"] || {});

    (function(currentModule){
      "use strict";
      (runtimeModules["Unsafe.Coerce"] = runtimeModules["Unsafe.Coerce"] || {}).unsafeTypeCoerce = function(x){ return x };
    })();

    (function(currentModule){
      "use strict";
      var unsafeCoerceRef = runtimeModules["Unsafe.Coerce"];
      currentModule.unsafeTypeCoerce = unsafeCoerceRef.unsafeTypeCoerce;
    })(runtimeModules["Unsafe.Coerce"] = runtimeModules["Unsafe.Coerce"] || {});

    (function(currentModule){
      "use strict";
      var arrayRef = runtimeModules["Data.Array"];
      var altRef = (runtimeModules["Control.Alt"], runtimeModules["Control.Alternative"], runtimeModules["Control.Applicative"], runtimeModules["Control.Apply"], runtimeModules["Control.Bind"], runtimeModules["Control.Category"], runtimeModules["Control.Lazy"], runtimeModules["Control.Monad.Rec.Class"], runtimeModules["Control.Monad.ST"], runtimeModules["Control.Monad.ST.Internal"], runtimeModules["Control.Semigroupoid"], runtimeModules["Data.Array.NonEmpty.Internal"], runtimeModules["Data.Array.ST"], runtimeModules["Data.Array.ST.Iterator"], runtimeModules["Data.Boolean"], runtimeModules["Data.Eq"], runtimeModules["Data.Foldable"], runtimeModules["Data.Function"], runtimeModules["Data.Functor"], runtimeModules["Data.HeytingAlgebra"]);
      var maybeRef = runtimeModules["Data.Maybe"];
      var ordRef = (runtimeModules["Data.Ord"], runtimeModules["Data.Ordering"], runtimeModules["Data.Ring"], runtimeModules["Data.Semigroup"], runtimeModules["Data.Semiring"], runtimeModules["Data.Traversable"], runtimeModules["Data.Tuple"], runtimeModules["Data.Unfoldable"], runtimeModules["Partial.Unsafe"]);
      var preludeRef = runtimeModules.Prelude;
      var unsafeCoerceRef = runtimeModules["Unsafe.Coerce"];

      var arrayIndexGetter = arrayRef.safeArrayIndex(maybeRef.MaybeJust.create)(maybeRef.MaybeNothing.value);
      var arrayFindIndex = arrayRef.findArrayIndex(maybeRef.MaybeJust.create)(maybeRef.MaybeNothing.value);

      currentModule.getArrayHead = function(arr){ return arrayIndexGetter(arr)(0) };
      currentModule.getArrayLast = function(arr){ return arrayIndexGetter(arr)(arrayRef.getArrayLength(arr) - 1 | 0) };
      currentModule.getAtIndex = arrayIndexGetter;
      currentModule.findArrayIndex = arrayFindIndex;
      currentModule.getArrayLength = arrayRef.getArrayLength;
      currentModule.takeElements = arrayRef.takeElements;
    })(runtimeModules["Data.Array"] = runtimeModules["Data.Array"] || {});

    (function(currentModule){
      "use strict";
      var BigIntCore = require("big-integer"); // Renamed the require variable
      currentModule.bigIntFromBase = function(justFn){
        return function(nothingVal){
          return function(base){
            return function(str){
              try {
                var bi = BigIntCore(str, base);
                return justFn(bi);
              } catch (e) {
                return nothingVal;
              }
            };
          };
        };
      };
      currentModule.bigIntFromInteger = function(i){ return BigIntCore(i) };
      currentModule.bigIntToBaseString = function(base){ return function(bi){ return bi.toString(base) } };
      currentModule.bigIntEquality = function(bi1){ return function(bi2){ return bi1.equals(bi2) } };
      currentModule.bigIntComparison = function(bi1){ return function(bi2){ return bi1.compare(bi2) } };
    })(runtimeModules["Data.BigInt"] = runtimeModules["Data.BigInt"] || {});

    (function(currentModule){
      "use strict";
      (runtimeModules["Data.Int"] = runtimeModules["Data.Int"] || {}).parseIntegerStringImpl = function(justFn){
        return function(nothingVal){
          return function(radix){
            var digitRegex;
            if(radix < 11){
              digitRegex = "[0-" + (radix - 1).toString() + "]";
            } else if(radix === 11){
              digitRegex = "[0-9a]";
            } else {
              digitRegex = "[0-9a-" + String.fromCharCode(86 + radix) + "]";
            }
            var fullRegex = new RegExp("^[\\+\\-]?" + digitRegex + "+$", "i");

            return function(str){
              if(fullRegex.test(str)){
                var parsed = parseInt(str, radix);
                // Check if parsed value is a valid 32-bit integer
                if((parsed | 0) === parsed) return justFn(parsed);
                return nothingVal;
              }
              return nothingVal;
            };
          };
        };
      };
    })();

    (function(currentModule){
      "use strict";
      var intRef = runtimeModules["Data.Int"];
      var categoryRef = (runtimeModules["Control.Category"], runtimeModules["Control.Semigroupoid"], runtimeModules["Data.Boolean"], runtimeModules["Data.Bounded"], runtimeModules["Data.CommutativeRing"], runtimeModules["Data.DivisionRing"], runtimeModules["Data.Eq"], runtimeModules["Data.EuclideanRing"], runtimeModules["Data.HeytingAlgebra"], runtimeModules["Data.Int.Bits"]);
      var maybeRef = runtimeModules["Data.Maybe"];
      var ordRef = (runtimeModules["Data.Ord"], runtimeModules["Data.Ordering"], runtimeModules["Data.Ring"], runtimeModules["Data.Semiring"], runtimeModules["Data.Show"], runtimeModules.Global, runtimeModules.Math, runtimeModules.Prelude);

      var parseIntegerString = intRef.parseIntegerStringImpl(maybeRef.MaybeJust.create)(maybeRef.MaybeNothing.value);
      var parseDecimalString = parseIntegerString(10);
      currentModule.parseDecimalString = parseDecimalString;
      currentModule.parseBaseStringAs = parseIntegerString;
    })(runtimeModules["Data.Int"] = runtimeModules["Data.Int"] || {});

    (function(currentModule){
      "use strict";
      var BigIntCore = runtimeModules["Data.BigInt"];
      var semigroupoidRef = (runtimeModules["Control.Semigroupoid"], runtimeModules["Data.Array.NonEmpty"]);
      var commutativeRingRef = (runtimeModules["Data.CommutativeRing"], runtimeModules["Data.Eq"]);
      var euclideanRingRef = (runtimeModules["Data.EuclideanRing"], runtimeModules["Data.Function"]);
      var intRef = runtimeModules["Data.Int"];
      var maybeRef = runtimeModules["Data.Maybe"];
      var ordRef = runtimeModules["Data.Ord"];
      var orderingRef = runtimeModules["Data.Ordering"];
      var ringRef = (runtimeModules["Data.Ring"], runtimeModules["Data.Semigroup"], runtimeModules["Data.Semiring"], runtimeModules["Data.Show"], runtimeModules["Data.String.NonEmpty"], runtimeModules["Data.String.NonEmpty.Internal"]);
      var unsafePartialRef = runtimeModules["Partial.Unsafe"];
      var preludeRef = runtimeModules.Prelude;

      var bigIntToStringDecimal = BigIntCore.bigIntToBaseString(10);
      var bigIntFromStringDecimal = BigIntCore.bigIntFromBase(maybeRef.MaybeJust.create)(maybeRef.MaybeNothing.value)(10);

      var bigIntEqInstance = new commutativeRingRef.EquivalenceType(BigIntCore.bigIntEquality);
      var bigIntOrdInstance = new ordRef.OrderableType(function(){ return bigIntEqInstance }, function(bi1){
        return function(bi2){
          var cmpResult = BigIntCore.bigIntComparison(bi1)(bi2);
          if(cmpResult === 1) return orderingRef.OrderGreater.value;
          if(cmpResult === 0) return orderingRef.OrderEqual.value;
          return orderingRef.OrderLess.value;
        };
      });

      currentModule.bigIntFromStringDecimal = bigIntFromStringDecimal;
      currentModule.bigIntFromBase = BigIntCore.bigIntFromBase;
      currentModule.bigIntToStringDecimal = bigIntToStringDecimal;
      currentModule.bigIntEqInstance = bigIntEqInstance;
      currentModule.bigIntOrdInstance = bigIntOrdInstance;
      currentModule.bigIntFromInteger = BigIntCore.bigIntFromInteger;
    })(runtimeModules["Data.BigInt"] = runtimeModules["Data.BigInt"] || {});

    (function(currentModule){
      "use strict";
      runtimeModules["Control.Alt"];
      var applicativeRef = runtimeModules["Control.Applicative"];
      var applyRef = runtimeModules["Control.Apply"];
      var bindRef = runtimeModules["Control.Bind"];
      var extendRef = (runtimeModules["Control.Extend"], runtimeModules["Control.Monad"], runtimeModules["Control.Semigroupoid"]);
      var bifoldableRef = (runtimeModules["Data.Bifoldable"], runtimeModules["Data.Bifunctor"], runtimeModules["Data.Bitraversable"], runtimeModules["Data.Bounded"], runtimeModules["Data.Eq"], runtimeModules["Data.Foldable"], runtimeModules["Data.FoldableWithIndex"], runtimeModules["Data.Function"]);
      var functorRef = runtimeModules["Data.Functor"];
      var functorInvariantRef = (runtimeModules["Data.Functor.Invariant"], runtimeModules["Data.FunctorWithIndex"], runtimeModules["Data.Maybe"]);
      var monoidRef = (runtimeModules["Data.Monoid"], runtimeModules["Data.Ord"], runtimeModules["Data.Ordering"], runtimeModules["Data.Semigroup"], runtimeModules["Data.Show"], runtimeModules["Data.Traversable"], runtimeModules["Data.TraversableWithIndex"], runtimeModules["Data.Unit"]);
      var preludeRef = runtimeModules.Prelude;

      var EitherLeft = (function(){ function EitherLeftCtor(val){ this.value0 = val } EitherLeftCtor.create = function(val){ return new EitherLeftCtor(val) }; return EitherLeftCtor; })();
      var EitherRight = (function(){ function EitherRightCtor(val){ this.value0 = val } EitherRightCtor.create = function(val){ return new EitherRightCtor(val) }; return EitherRightCtor; })();

      var eitherFunctor = new functorRef.Functor(function(f){
        return function(eitherVal){
          if(eitherVal instanceof EitherLeft) return new EitherLeft(eitherVal.value0);
          if(eitherVal instanceof EitherRight) return new EitherRight(f(eitherVal.value0));
          throw new Error("Pattern match failed for Either functor.");
        };
      });

      var handleEither = function(leftHandler){
        return function(rightHandler){
          return function(eitherVal){
            if(eitherVal instanceof EitherLeft) return leftHandler(eitherVal.value0);
            if(eitherVal instanceof EitherRight) return rightHandler(eitherVal.value0);
            throw new Error("Pattern match failed for handleEither.");
          };
        };
      };

      var eitherApply = new applyRef.Apply(function(){ return eitherFunctor }, function(fEither){
        return function(aEither){
          if(fEither instanceof EitherLeft) return new EitherLeft(fEither.value0);
          if(fEither instanceof EitherRight) return functorRef.transformValue(eitherFunctor)(fEither.value0)(aEither);
          throw new Error("Pattern match failed for Either apply.");
        };
      });

      var eitherBind = new bindRef.Bind(function(){ return eitherApply }, handleEither(function(leftVal){
        return function(f){ return new EitherLeft(leftVal) };
      })(function(rightVal){
        return function(f){ return f(rightVal) };
      }));

      var eitherApplicative = new applicativeRef.Applicative(function(){ return eitherApply }, EitherRight.create);

      currentModule.EitherLeft = EitherLeft;
      currentModule.EitherRight = EitherRight;
      currentModule.handleEither = handleEither;
      currentModule.note = function(leftVal){
        return functorInvariantRef.maybeRef.handleMaybe(new EitherLeft(leftVal))(EitherRight.create);
      };
      currentModule.eitherFunctor = eitherFunctor;
      currentModule.eitherApply = eitherApply;
      currentModule.eitherApplicative = eitherApplicative;
      currentModule.eitherBind = eitherBind;
    })(runtimeModules["Data.Either"] = runtimeModules["Data.Either"] || {});

    (function(currentModule){
      "use strict";
      currentModule.stringToCharArr = function(s){ return s.split("") };
      currentModule.charToString = function(c){ return c };
    })(runtimeModules["Data.String.CodeUnits"] = runtimeModules["Data.String.CodeUnits"] || {});

    (function(currentModule){
      "use strict";
      var stringCodeUnitsRef = runtimeModules["Data.String.CodeUnits"];
      runtimeModules["Control.Semigroupoid"]; runtimeModules["Data.Boolean"]; runtimeModules["Data.Eq"]; runtimeModules["Data.Function"]; runtimeModules["Data.HeytingAlgebra"]; runtimeModules["Data.Maybe"]; runtimeModules["Data.Ord"]; runtimeModules["Data.Ring"]; runtimeModules["Data.Semiring"]; runtimeModules["Data.String.Pattern"]; runtimeModules["Data.String.Unsafe"]; runtimeModules.Prelude;
      currentModule.charToString = stringCodeUnitsRef.charToString;
      currentModule.stringToCharArr = stringCodeUnitsRef.stringToCharArr;
    })(runtimeModules["Data.String.CodeUnits"] = runtimeModules["Data.String.CodeUnits"] || {});

    (function(currentModule){
      "use strict";
      currentModule.splitString = function(separator){ return function(s){ return s.split(separator) } };
      currentModule.trimWhitespace = function(s){ return s.trim() };
    })(runtimeModules["Data.String.Common"] = runtimeModules["Data.String.Common"] || {});

    (function(currentModule){
      "use strict";
      var stringCommonRef = runtimeModules["Data.String.Common"];
      runtimeModules["Data.Eq"]; runtimeModules["Data.Ordering"]; runtimeModules["Data.String.Pattern"]; runtimeModules.Prelude;
      currentModule.splitString = stringCommonRef.splitString;
      currentModule.trimWhitespace = stringCommonRef.trimWhitespace;
    })(runtimeModules["Data.String.Common"] = runtimeModules["Data.String.Common"] || {});

    (function(currentModule){
      "use strict";
      currentModule.effectPure = function(val){ return function(){ return val } };
      currentModule.effectBind = function(effectFn){
        return function(continuation){
          return function(){
            return continuation(effectFn())();
          };
        };
      };
    })(runtimeModules.Effect = runtimeModules.Effect || {});

    (function(currentModule){
      "use strict";
      var effectRef = runtimeModules.Effect;
      var applicativeRef = runtimeModules["Control.Applicative"];
      var applyRef = runtimeModules["Control.Apply"];
      var bindRef = runtimeModules["Control.Bind"];
      var monadRef = runtimeModules["Control.Monad"];
      var functorRef = runtimeModules["Data.Functor"];
      var monadEffectInstance = new monadRef.MonadInterface(function(){ return effectApplicative }, function(){ return effectBindInstance });
      var effectBindInstance = new bindRef.Bind(function(){ return effectApply }, effectRef.effectBind);
      var effectApply = new applyRef.Apply(function(){ return effectFunctor }, monadRef.applyMonadic(monadEffectInstance));
      var effectApplicative = new applicativeRef.Applicative(function(){ return effectApply }, effectRef.effectPure);
      var effectFunctor = new functorRef.Functor(applicativeRef.liftA1(effectApplicative));

      currentModule.effectFunctor = effectFunctor;
      currentModule.effectApply = effectApply;
      currentModule.effectApplicative = effectApplicative;
      currentModule.effectBindInstance = effectBindInstance;
      currentModule.effectMonad = monadEffectInstance;
    })(runtimeModules.Effect = runtimeModules.Effect || {});

    (function(currentModule){
      "use strict";
      var AffRuntime = (function(){
        var EMPTY_AFF = {}; // Represents an empty or completed Aff
        var TAG_PURE = "Pure";
        var TAG_THROW = "Throw";
        var TAG_CATCH = "Catch";
        var TAG_SYNC = "Sync";
        var TAG_ASYNC = "Async";
        var TAG_BIND = "Bind";
        var TAG_BRACKET = "Bracket";
        var TAG_FORK = "Fork";
        var TAG_SEQ = "Sequential";
        var TAG_MAP = "Map";
        var TAG_APPLY = "Apply";
        var TAG_ALT = "Alt";
        var TAG_CONS = "Cons"; // Internal: for Fiber stack
        var TAG_RESUME = "Resume"; // Internal: for Fiber stack
        var TAG_RELEASE = "Release"; // Internal: for Fiber stack
        var TAG_FINALIZER = "Finalizer"; // Internal: for Fiber stack
        var TAG_FINALIZED = "Finalized"; // Internal: for Fiber stack
        var TAG_FORKED = "Forked"; // Internal: for Fiber stack

        // Internal constructor for Aff types
        function AffCtor(tag, _1, _2, _3){
          this.tag = tag;
          this._1 = _1;
          this._2 = _2;
          this._3 = _3;
        }

        // Factory functions for each Aff type
        function createAffType(tag){
          var ctor = function(_1, _2, _3){ return new AffCtor(tag, _1, _2, _3) };
          ctor.tag = tag; // Store tag on constructor for easy access
          return ctor;
        }

        var Pure = createAffType(TAG_PURE);
        var Throw = createAffType(TAG_THROW);
        var Catch = createAffType(TAG_CATCH);
        var Sync = createAffType(TAG_SYNC);
        var Async = createAffType(TAG_ASYNC);
        var Bind = createAffType(TAG_BIND);
        var Bracket = createAffType(TAG_BRACKET);
        var Fork = createAffType(TAG_FORK);
        var Sequential = createAffType(TAG_SEQ);
        var ParMap = createAffType(TAG_MAP);
        var ParApply = createAffType(TAG_APPLY);
        var ParAlt = createAffType(TAG_ALT);
        var Cons = createAffType(TAG_CONS); // Internal
        var Resume = createAffType(TAG_RESUME); // Internal
        var Release = createAffType(TAG_RELEASE); // Internal
        var Finalizer = createAffType(TAG_FINALIZER); // Internal
        var Finalized = createAffType(TAG_FINALIZED); // Internal
        var Forked = createAffType(TAG_FORKED); // Internal

        // Scheduler for running Effects asynchronously
        var Scheduler = (function(){
          var queueSize = 1024;
          var head = 0;
          var tail = 0;
          var taskQueue = new Array(queueSize);
          var isCurrentlyDraining = false;

          function drainQueue(){
            isCurrentlyDraining = true;
            while(head !== tail){
              tail--;
              var task = taskQueue[tail];
              taskQueue[tail] = undefined; // Clear reference
              head = (head + 1) % queueSize; // Advance head pointer
              task();
            }
            isCurrentlyDraining = false;
          }

          return {
            isDraining: function(){ return isCurrentlyDraining },
            enqueue: function(task){
              // If queue is full, drain it first
              if(head === queueSize){
                var wasDraining = isCurrentlyDraining;
                drainQueue();
                isCurrentlyDraining = wasDraining;
              }
              taskQueue[(head + tail) % queueSize] = task;
              tail++;
              if(!isCurrentlyDraining) drainQueue();
            }
          };
        })();

        // Constants for Fiber state
        var FIBER_STATE_INITIAL = 0;
        var FIBER_STATE_RUNNING = 1;
        var FIBER_STATE_PAUSED = 2;
        var FIBER_STATE_BINDING = 3;
        var FIBER_STATE_ASYNC = 4;
        var FIBER_STATE_ERROR = 5;
        var FIBER_STATE_KILLED = 6;

        /**
         * Fiber: Represents a cancellable computation.
         * @param {*} eitherImpl - An object providing `isLeft`, `fromLeft`, `fromRight`, `left`, `right`.
         * @param {*} supervisor - The supervisor for this fiber (can be null).
         * @param {*} initialAff - The initial Aff computation.
         */
        function Fiber(eitherImpl, supervisor, initialAff){
          var nextTickId = 0; // Counter for scheduling
          var fiberState = FIBER_STATE_INITIAL;
          var currentValue = initialAff;
          var errorValue = null;
          var bindStack = null; // Stack for Bind operations (continuation functions)
          var cleanupStack = null; // Stack for Bracket/Finally cleanup actions
          var cleanupReason = null; // Reason for cleanup (error, killed, completed)
          var bracketDepth = 0; // Tracks depth of Bracket operations for cleanup
          var finalizerDepth = 0; // Tracks depth of Finalizer operations
          var onCompleteHandlers = null; // Handlers to call when fiber completes
          var rethrowOnComplete = true; // Flag to rethrow unhandled errors on completion

          // Handler for `onComplete` registration
          function registerOnComplete(handlerInfo){
            var handlerId = nextTickId++;
            onCompleteHandlers = onCompleteHandlers || {};
            onCompleteHandlers[handlerId] = handlerInfo;
            return function(){
              if(onCompleteHandlers) delete onCompleteHandlers[handlerId];
            };
          }

          // Main interpreter loop for the Fiber
          function runFiber(tickId){
            var currentStackItem;
            var currentCleanupItem;
            var currentAff;
            var nextAction; // For the next step in the loop

            // Loop until fiber state changes or computation completes
            while(true){
              currentStackItem = null;
              currentCleanupItem = null;
              currentAff = null;

              switch(fiberState){
                case FIBER_STATE_BINDING: // Executing a continuation
                  fiberState = FIBER_STATE_RUNNING;
                  currentValue = cleanupReason(currentValue); // Apply continuation
                  if(bindStack === null) {
                    cleanupReason = null; // Clear continuation
                  } else {
                    cleanupReason = bindStack._1; // Pop next continuation
                    bindStack = bindStack._2; // Pop stack
                  }
                  break;

                case FIBER_STATE_PAUSED: // An error occurred, or fiber was killed
                  // If we have an error, and no cleanup stack, transition to ERROR state
                  if(eitherImpl.isLeft(currentValue)){
                    fiberState = FIBER_STATE_ERROR;
                    errorValue = currentValue;
                    currentValue = null;
                  } else {
                    // If no error, and no bind stack, transition to KILLED state
                    if(bindStack === null){
                      fiberState = FIBER_STATE_KILLED;
                      currentValue = cleanupReason || currentValue;
                    } else {
                      // Otherwise, execute the continuation
                      fiberState = FIBER_STATE_BINDING;
                      currentValue = eitherImpl.fromRight(currentValue); // Unpack value
                    }
                  }
                  break;

                case FIBER_STATE_RUNNING: // Normal execution of an Aff
                  switch(currentValue.tag){
                    case TAG_BIND: // Bind operation: push continuation, then execute first Aff
                      if(bindStack) bindStack = new Cons(cleanupReason, bindStack);
                      cleanupReason = currentValue._2; // Store continuation
                      fiberState = FIBER_STATE_RUNNING;
                      currentValue = currentValue._1;
                      break;

                    case TAG_PURE: // Pure value: pop continuation or complete
                      if(bindStack === null){
                        fiberState = FIBER_STATE_KILLED; // No more binds, computation finished
                        currentValue = eitherImpl.right(currentValue._1);
                      } else {
                        fiberState = FIBER_STATE_BINDING; // Apply next continuation
                        currentValue = currentValue._1;
                      }
                      break;

                    case TAG_SYNC: // Synchronous Effect: execute and handle result
                      fiberState = FIBER_STATE_PAUSED; // Set state to handle potential error
                      currentValue = (function(leftHandler, rightHandler, action){
                        try {
                          return rightHandler(action());
                        } catch (e) {
                          return leftHandler(e);
                        }
                      })(eitherImpl.left, eitherImpl.right, currentValue._1);
                      break;

                    case TAG_ASYNC: // Asynchronous Effect: pause fiber and wait for callback
                      fiberState = FIBER_STATE_ASYNC;
                      return (function(leftHandler, callbackFn, asyncAction){
                        try {
                          return asyncAction(leftHandler)(function(result){
                            return function(){
                              // Schedule continuation on next tick
                              if(nextTickId === tickId){
                                nextTickId++;
                                Scheduler.enqueue(function(){
                                  if(nextTickId === tickId + 1){
                                    fiberState = FIBER_STATE_BINDING; // Resume with result
                                    currentValue = result;
                                    runFiber(nextTickId);
                                  }
                                });
                              }
                            };
                          });
                        } catch (e) {
                          return callbackFn(leftHandler(e))(); // Handle synchronous errors from async setup
                        }
                      })(eitherImpl.left, currentValue._1, function(errCb){
                        return function(successCb){
                          currentValue._1(errCb)(successCb);
                        };
                      });

                    case TAG_THROW: // Throw an error: set error and start cleanup
                      fiberState = FIBER_STATE_ERROR;
                      errorValue = eitherImpl.left(currentValue._1);
                      currentValue = null; // Clear value
                      break;

                    case TAG_CATCH: // Catch block: push context, then execute guarded Aff
                      cleanupStack = new Cons(currentValue, cleanupStack === null ? cleanupStack : new Cons(new Resume(cleanupReason, bindStack), cleanupStack));
                      cleanupReason = null; bindStack = null; // Clear context for guarded Aff
                      fiberState = FIBER_STATE_RUNNING;
                      currentValue = currentValue._1;
                      break;

                    case TAG_BRACKET: // Bracket operation: push context, then execute acquisition
                      bracketDepth++;
                      cleanupStack = new Cons(currentValue, cleanupStack === null ? cleanupStack : new Cons(new Resume(cleanupReason, bindStack), cleanupStack));
                      cleanupReason = null; bindStack = null; // Clear context for acquisition
                      fiberState = FIBER_STATE_RUNNING;
                      currentValue = currentValue._1;
                      break;

                    case TAG_FORK: // Fork operation: create new fiber and return it
                      fiberState = FIBER_STATE_PAUSED;
                      var newFiber = Fiber(eitherImpl, supervisor, currentValue._2);
                      if(supervisor) supervisor.register(newFiber);
                      if(currentValue._1) newFiber.run(); // Run immediately if `_1` is true
                      currentValue = eitherImpl.right(newFiber);
                      break;

                    case TAG_SEQ: // Sequential execution: run Aff, then continue
                      fiberState = FIBER_STATE_RUNNING;
                      currentValue = runSequentialAff(eitherImpl, supervisor, currentValue._1);
                      break;

                    default: // Should not happen for valid Aff constructors
                      throw new Error("Unknown Aff tag: " + currentValue.tag);
                  }
                  break;

                case FIBER_STATE_ERROR: // An error occurred, unwind cleanup stack
                  // If no cleanup stack, then unhandled error, complete fiber with error
                  if(cleanupStack === null){
                    fiberState = FIBER_STATE_KILLED;
                    currentValue = cleanupReason || errorValue || currentValue;
                  } else {
                    currentStackItem = cleanupStack._1; // Pop current cleanup item
                    currentCleanupItem = cleanupStack._2; // Rest of cleanup stack
                    cleanupStack = currentCleanupItem; // Update stack

                    switch(currentStackItem.tag){
                      case TAG_CATCH: // Catch block: execute handler with error
                        cleanupReason = currentStackItem._2; // Restore continuation
                        fiberState = FIBER_STATE_BINDING;
                        currentValue = currentStackItem._2(eitherImpl.fromLeft(errorValue));
                        errorValue = null; // Error handled
                        break;
                      case TAG_RESUME: // Resume normal execution after a cleanup
                        // If an error happened during cleanup, ignore the resume and continue error propagation
                        if(errorValue) {
                           // continue to process next cleanup
                        } else {
                          cleanupReason = currentStackItem._1; // Restore continuation
                          bindStack = currentStackItem._2; // Restore bind stack
                          fiberState = FIBER_STATE_BINDING;
                          currentValue = eitherImpl.fromRight(currentValue); // Continue with value
                        }
                        break;
                      case TAG_BRACKET: // Bracket block: execute release function
                        bracketDepth--;
                        // If error occurred during acquisition, just execute release
                        if(errorValue) {
                          cleanupStack = new Cons(new Finalizer(currentStackItem._2(eitherImpl.fromLeft(errorValue))(currentStackItem._3)), cleanupStack);
                          fiberState = FIBER_STATE_RUNNING;
                          currentValue = null; // Clear value
                          errorValue = null; // Error handled by release
                        } else { // Error happened later, execute release with acquired resource and error
                          currentAff = currentStackItem._2(eitherImpl.fromLeft(errorValue))(eitherImpl.fromRight(currentValue));
                          cleanupStack = new Cons(new Finalizer(currentAff), cleanupStack);
                          fiberState = FIBER_STATE_RUNNING;
                          currentValue = null; // Clear value
                          errorValue = null; // Error handled by release
                        }
                        break;
                      case TAG_FINALIZER: // Finalizer block: just run it, error is already being propagated
                      case TAG_RELEASE: // Release block: same as finalizer
                        currentValue = currentStackItem._1; // The finalizer action itself
                        fiberState = FIBER_STATE_RUNNING;
                        errorValue = null; // Error is being handled by the finalizer chain
                        break;
                      case TAG_FINALIZED: // Finalized block: continue unwinding
                        finalizerDepth--;
                        fiberState = FIBER_STATE_PAUSED; // Back to paused state for next cleanup
                        currentValue = currentStackItem._1; // Value from before finalizer
                        errorValue = currentStackItem._2; // Error from before finalizer
                        break;
                      default:
                        // Fallback: If unknown tag, just propagate error
                        fiberState = FIBER_STATE_KILLED;
                        currentValue = errorValue;
                        break;
                    }
                  }
                  break;

                case FIBER_STATE_KILLED: // Fiber completed or was killed
                  // Execute onComplete handlers
                  for(var handlerKey in onCompleteHandlers){
                    if(onCompleteHandlers.hasOwnProperty(handlerKey)){
                      rethrowOnComplete = rethrowOnComplete && onCompleteHandlers[handlerKey].rethrow;
                      try {
                        onCompleteHandlers[handlerKey].handler(currentValue);
                      } catch (e) {
                        // Log or handle errors in handlers themselves
                        console.error("Error in onComplete handler:", e);
                      }
                    }
                  }
                  onCompleteHandlers = null; // Clear handlers
                  // Rethrow unhandled error if configured
                  if(cleanupReason && rethrowOnComplete){
                    setTimeout(function(){
                      throw eitherImpl.fromLeft(cleanupReason);
                    }, 0);
                  }
                  return; // Fiber execution finished

                case FIBER_STATE_INITIAL: // Initial state, start execution
                  fiberState = FIBER_STATE_RUNNING;
                  break;

                case FIBER_STATE_ASYNC: // Should not be in async state in the loop, means async task is running
                  return;
                default:
                  throw new Error("Unknown Fiber state: " + fiberState);
              }
            }
          }

          // Kill function for external cancellation
          function killFiber(killError, callback){
            return function(){
              if(fiberState === FIBER_STATE_KILLED) return callback(eitherImpl.right(undefined))(); // Already killed

              var handlerUnregister = registerOnComplete({
                rethrow: false,
                handler: function(){ return callback(eitherImpl.right(undefined))() }
              });

              switch(fiberState){
                case FIBER_STATE_INITIAL:
                  cleanupReason = eitherImpl.left(killError);
                  fiberState = FIBER_STATE_KILLED;
                  currentValue = cleanupReason;
                  runFiber(nextTickId); // Run to complete
                  break;
                case FIBER_STATE_ASYNC: // If async, inject error and continue cleanup
                  if(cleanupReason === null) cleanupReason = eitherImpl.left(killError);
                  if(bracketDepth === 0){ // If no brackets, just set state to ERROR
                    fiberState = FIBER_STATE_ERROR;
                    currentValue = null;
                    errorValue = null;
                  } else { // If brackets, initiate cleanup
                    // Push a finalizer to the cleanup stack to handle the async operation
                    cleanupStack = new Cons(new Finalizer(currentValue(killError)), cleanupStack);
                    fiberState = FIBER_STATE_ERROR; // Transition to error state to process cleanup
                    currentValue = null;
                    errorValue = eitherImpl.left(killError);
                  }
                  runFiber(++nextTickId); // Resume immediately
                  break;
                default:
                  if(cleanupReason === null) cleanupReason = eitherImpl.left(killError);
                  if(bracketDepth === 0){
                    fiberState = FIBER_STATE_ERROR;
                    currentValue = null;
                    errorValue = eitherImpl.left(killError);
                  } else {
                    fiberState = FIBER_STATE_ERROR;
                    currentValue = null;
                    errorValue = eitherImpl.left(killError);
                  }
              }
              return handlerUnregister;
            };
          }

          return {
            kill: killFiber,
            join: function(callback){
              return function(){
                var handlerUnregister = registerOnComplete({
                  rethrow: false,
                  handler: callback
                })();
                if(fiberState === FIBER_STATE_INITIAL) runFiber(nextTickId);
                return handlerUnregister;
              };
            },
            onComplete: registerOnComplete,
            isSuspended: function(){ return fiberState === FIBER_STATE_INITIAL },
            run: function(){
              if(fiberState === FIBER_STATE_INITIAL){
                Scheduler.isDraining() ? runFiber(nextTickId) : Scheduler.enqueue(function(){ runFiber(nextTickId) });
              }
            }
          };
        }

        /**
         * Runs a sequential Aff computation.
         * @param {*} eitherImpl - Either implementation.
         * @param {*} supervisor - Supervisor.
         * @param {*} aff - The Aff to run.
         * @param {function(Error): any} [onError] - Optional error handler.
         * @returns {*} Result of the Aff.
         */
        function runSequentialAff(eitherImpl, supervisor, aff, onError){
          var currentAff = aff;
          var bindStack = null;
          var cleanupStack = null;
          var errorValue = null;
          var bracketDepth = 0;
          var finalizerDepth = 0;

          // Main loop for sequential execution
          while(true){
            var nextAff = null;
            var nextBind = null;
            var nextCleanup = null;

            switch(currentAff.tag){
              case TAG_BIND:
                bindStack = new Cons(currentAff._2, bindStack);
                currentAff = currentAff._1;
                break;
              case TAG_PURE:
                if(bindStack === null) return eitherImpl.right(currentAff._1); // Completed
                nextBind = bindStack._1;
                bindStack = bindStack._2;
                currentAff = nextBind(currentAff._1);
                break;
              case TAG_SYNC:
                try {
                  currentAff = eitherImpl.right(currentAff._1());
                } catch (e) {
                  currentAff = eitherImpl.left(e);
                }
                break;
              case TAG_ASYNC: // In sequential, async is treated as a sync blocking call for simplicity
                var result = null;
                var syncError = null;
                currentAff._1(function(e){ syncError = e })(function(val){ result = val })();
                if(syncError) currentAff = eitherImpl.left(syncError);
                else currentAff = eitherImpl.right(result);
                break;
              case TAG_THROW:
                currentAff = eitherImpl.left(currentAff._1);
                break;
              case TAG_CATCH:
                cleanupStack = new Cons(currentAff, cleanupStack === null ? cleanupStack : new Cons(new Resume(null, bindStack), cleanupStack));
                bindStack = null;
                currentAff = currentAff._1;
                break;
              case TAG_BRACKET:
                bracketDepth++;
                cleanupStack = new Cons(currentAff, cleanupStack === null ? cleanupStack : new Cons(new Resume(null, bindStack), cleanupStack));
                bindStack = null;
                currentAff = currentAff._1;
                break;
              case TAG_FORK: // Fork in sequential just returns the fiber without running it
                var newFiber = Fiber(eitherImpl, supervisor, currentAff._2);
                if(supervisor) supervisor.register(newFiber);
                currentAff = eitherImpl.right(newFiber);
                break;
              case TAG_SEQ:
                currentAff = runSequentialAff(eitherImpl, supervisor, currentAff._1);
                break;
              default: // If we get an error or a wrapped value
                if(eitherImpl.isLeft(currentAff)){
                  errorValue = currentAff;
                  // Unwind cleanup stack
                  while(cleanupStack !== null){
                    nextCleanup = cleanupStack._1;
                    cleanupStack = cleanupStack._2;
                    switch(nextCleanup.tag){
                      case TAG_CATCH:
                        // If error occurred, run catch handler
                        bindStack = nextCleanup._2;
                        currentAff = nextCleanup._2(eitherImpl.fromLeft(errorValue));
                        errorValue = null; // Error handled
                        break;
                      case TAG_RESUME:
                        // If an error happened during cleanup, ignore the resume and continue error propagation
                        if(errorValue) {
                           // continue to process next cleanup
                        } else {
                          bindStack = nextCleanup._2;
                          currentAff = eitherImpl.fromRight(currentAff); // Continue with value
                        }
                        break;
                      case TAG_BRACKET:
                        bracketDepth--;
                        // If error occurred during acquisition, just execute release
                        if(errorValue) {
                          currentAff = nextCleanup._2(eitherImpl.fromLeft(errorValue))(nextCleanup._3);
                          errorValue = null;
                        } else { // Error happened later, execute release with acquired resource and error
                          currentAff = nextCleanup._2(eitherImpl.fromLeft(errorValue))(eitherImpl.fromRight(currentAff));
                          errorValue = null;
                        }
                        break;
                      case TAG_FINALIZER:
                      case TAG_RELEASE:
                        currentAff = nextCleanup._1;
                        errorValue = null;
                        break;
                      case TAG_FINALIZED:
                        finalizerDepth--;
                        currentAff = nextCleanup._1;
                        errorValue = nextCleanup._2;
                        break;
                      default:
                        break;
                    }
                    if(errorValue === null) break; // Error was handled, resume normal flow
                  }
                  if(errorValue) {
                    if (onError) onError(eitherImpl.fromLeft(errorValue));
                    else throw eitherImpl.fromLeft(errorValue);
                  }
                  return errorValue || currentAff;
                } else { // Normal value, continue with bind stack
                  if(bindStack === null) return currentAff; // Completed
                  nextBind = bindStack._1;
                  bindStack = bindStack._2;
                  currentAff = nextBind(eitherImpl.fromRight(currentAff));
                }
            }
          }
        }


        // Supervisor for managing child fibers
        function FiberSupervisor(eitherImpl){
          var managedFibers = {};
          var fiberCount = 0;
          var activeFiberCount = 0;

          return {
            register: function(fiber){
              var fiberId = fiberCount++;
              fiber.onComplete({
                rethrow: true, // Default to rethrowing errors from supervised fibers
                handler: function(result){
                  return function(){
                    activeFiberCount--;
                    delete managedFibers[fiberId];
                    if(eitherImpl.isLeft(result)){
                      // If a supervised fiber fails, log or rethrow the error
                      setTimeout(function(){ throw eitherImpl.fromLeft(result); }, 0);
                    }
                  };
                }
              });
              managedFibers[fiberId] = fiber;
              activeFiberCount++;
            },
            isEmpty: function(){ return activeFiberCount === 0 },
            killAll: function(killError, onAllKilled){
              return function(){
                var remainingToKill = 0;
                var killCancelers = {};

                function handleKillCompletion(fiberId){
                  return function(result){
                    return function(){
                      delete killCancelers[fiberId];
                      remainingToKill--;
                      if(eitherImpl.isLeft(result)){
                        setTimeout(function(){ throw eitherImpl.fromLeft(result); }, 0);
                      }
                      if(remainingToKill === 0) onAllKilled();
                    };
                  };
                }

                for(var id in managedFibers){
                  if(managedFibers.hasOwnProperty(id)){
                    remainingToKill++;
                    killCancelers[id] = managedFibers[id].kill(killError, handleKillCompletion(id))();
                  }
                }
                managedFibers = {};
                fiberCount = 0;
                activeFiberCount = 0;

                return function(cancelKill){
                  return new Sync(function(){
                    for(var key in killCancelers){
                      if(killCancelers.hasOwnProperty(key)) killCancelers[key]();
                    }
                  });
                };
              };
            }
          };
        }

        // Export runtime components
        return {
          EMPTY: EMPTY_AFF,
          Pure: Pure,
          Throw: Throw,
          Catch: Catch,
          Sync: Sync,
          Async: Async,
          Bind: Bind,
          Bracket: Bracket,
          Fork: Fork,
          Sequential: Sequential,
          ParMap: ParMap,
          ParApply: ParApply,
          ParAlt: ParAlt,
          Fiber: Fiber,
          Supervisor: FiberSupervisor,
          Scheduler: Scheduler,
          nonCanceler: Pure(undefined) // A no-op canceler
        };
      })();

      currentModule._affPure = AffRuntime.Pure;
      currentModule._affMap = function(f){
        return function(aff){
          if(aff.tag === AffRuntime.Pure.tag) return AffRuntime.Pure(f(aff._1));
          return AffRuntime.Bind(aff, function(a){ return AffRuntime.Pure(f(a)) });
        };
      };
      currentModule._affBind = function(aff){ return function(f){ return AffRuntime.Bind(aff, f) } };
      currentModule._affLiftEffect = AffRuntime.Sync;
      currentModule._parAffMap = function(f){ return function(aff){ return AffRuntime.ParMap(f, aff) } };
      currentModule._parAffApply = function(fAff){ return function(aAff){ return AffRuntime.ParApply(fAff, aAff) } };
      currentModule.makeAff = AffRuntime.Async;
      currentModule._makeFiber = function(eitherImpl, aff){ return function(){ return AffRuntime.Fiber(eitherImpl, null, aff) } };
      currentModule._affSequential = AffRuntime.Sequential;
    })(runtimeModules["Effect.Aff"] = runtimeModules["Effect.Aff"] || {});

    (function(currentModule){
      "use strict";
      runtimeModules["Control.Category"]; runtimeModules["Control.Monad"]; runtimeModules.Effect;
      currentModule.liftToEffect = function(dict){ return dict.liftEffect };
      currentModule.MonadEffectInterface = function(monadDict, liftEffectFn){
        this.Monad0 = monadDict;
        this.liftEffect = liftEffectFn;
      };
    })(runtimeModules["Effect.Class"] = runtimeModules["Effect.Class"] || {});

    (function(currentModule){
      "use strict";
      currentModule.createRef = function(initialVal){ return function(){ return { value: initialVal } } };
      currentModule.readRef = function(ref){ return function(){ return ref.value } };
      currentModule.writeRef = function(newVal){
        return function(ref){
          return function(){
            ref.value = newVal;
            return {}; // Unit value
          };
        };
      };
    })(runtimeModules["Effect.Ref"] = runtimeModules["Effect.Ref"] || {});

    (function(currentModule){
      "use strict";
      var refRef = runtimeModules["Effect.Ref"];
      runtimeModules["Data.Function"]; runtimeModules["Data.Functor"]; runtimeModules.Effect; runtimeModules.Prelude;
      currentModule.createRef = refRef.createRef;
      currentModule.readRef = refRef.readRef;
      currentModule.writeRef = refRef.writeRef;
    })(runtimeModules["Effect.Ref"] = runtimeModules["Effect.Ref"] || {});

    (function(currentModule){
      "use strict";
      runtimeModules["Control.Alt"]; runtimeModules["Control.Alternative"]; runtimeModules["Control.Applicative"]; runtimeModules["Control.Apply"]; runtimeModules["Control.Bind"]; runtimeModules["Control.Monad.Cont.Trans"]; runtimeModules["Control.Monad.Except.Trans"]; runtimeModules["Control.Monad.Maybe.Trans"]; runtimeModules["Control.Monad.Reader.Trans"]; runtimeModules["Control.Monad.Writer.Trans"]; runtimeModules["Control.Plus"]; runtimeModules["Control.Semigroupoid"]; runtimeModules["Data.Either"]; runtimeModules["Data.Function"]; runtimeModules["Data.Functor"]; runtimeModules["Data.Functor.Compose"]; runtimeModules["Data.Maybe"]; runtimeModules["Data.Newtype"]; runtimeModules["Data.Unit"]; runtimeModules["Effect.Class"]; runtimeModules["Effect.Ref"]; runtimeModules.Prelude;
      currentModule.executeParallel = function(dict){ return dict.parallel };
      currentModule.executeSequential = function(dict){ return dict.sequential };
      currentModule.ParallelInterface = function(applicativeDict, monadDict, parallelFn, sequentialFn){
        this.Applicative1 = applicativeDict;
        this.Monad0 = monadDict;
        this.parallel = parallelFn;
        this.sequential = sequentialFn;
      };
    })(runtimeModules["Control.Parallel.Class"] = runtimeModules["Control.Parallel.Class"] || {});

    (function(currentModule){
      "use strict";
      runtimeModules["Control.Alternative"]; runtimeModules["Control.Apply"];
      var categoryRef = runtimeModules["Control.Category"];
      var parallelClassRef = runtimeModules["Control.Parallel.Class"];
      var semigroupoidRef = (runtimeModules["Control.Semigroupoid"], runtimeModules["Data.Foldable"]);
      var traversableRef = (runtimeModules["Data.Traversable"], runtimeModules.Prelude);

      var parallelTraverseAndDiscard = function(dictParallel){
        return function(dictFoldable){
          return function(f){
            return function(foldableVal){
              return parallelClassRef.executeSequential(dictParallel)(semigroupoidRef.traverse_(
                parallelClassRef.Applicative1(dictParallel)
              )(dictFoldable)(function(x){
                return parallelClassRef.executeParallel(dictParallel)(f(x));
              })(foldableVal));
            };
          };
        };
      };

      currentModule.parallelTraverseAndDiscard = parallelTraverseAndDiscard;
      currentModule.parallelSequenceAndDiscard = function(dictParallel){
        return function(dictFoldable){
          return parallelTraverseAndDiscard(dictParallel)(dictFoldable)(categoryRef.identity(categoryRef.categoryFn));
        };
      };
    })(runtimeModules["Control.Parallel"] = runtimeModules["Control.Parallel"] || {});

    (function(currentModule){
      "use strict";
      currentModule.createJsError = function(msg){ return new Error(msg) };
      currentModule.throwJsException = function(err){ return function(){ throw err } };
    })(runtimeModules["Effect.Exception"] = runtimeModules["Effect.Exception"] || {});

    (function(currentModule){
      "use strict";
      var exceptionRef = runtimeModules["Effect.Exception"];
      runtimeModules["Control.Applicative"]; runtimeModules["Control.Semigroupoid"]; runtimeModules["Data.Either"]; runtimeModules["Data.Functor"]; runtimeModules["Data.Maybe"]; runtimeModules["Data.Show"]; runtimeModules.Effect; runtimeModules.Prelude;
      currentModule.throwError = function(msg){ return exceptionRef.throwJsException(exceptionRef.createJsError(msg)) };
    })(runtimeModules["Effect.Exception"] = runtimeModules["Effect.Exception"] || {});

    (function(currentModule){
      "use strict";
      var AffModule = runtimeModules["Effect.Aff"];
      var altRef = (runtimeModules["Control.Alt"], runtimeModules["Control.Alternative"]);
      var applicativeRef = runtimeModules["Control.Applicative"];
      var applyRef = runtimeModules["Control.Apply"];
      var bindRef = runtimeModules["Control.Bind"];
      var monadRef = (runtimeModules["Control.Lazy"], runtimeModules["Control.Monad"]);
      var monadErrorRef = (runtimeModules["Control.Monad.Error.Class"], runtimeModules["Control.Monad.Rec.Class"]);
      var parallelRef = runtimeModules["Control.Parallel"];
      var parallelClassRef = runtimeModules["Control.Parallel.Class"];
      var plusRef = (runtimeModules["Control.Plus"], runtimeModules["Control.Semigroupoid"]);
      var EitherModule = runtimeModules["Data.Either"];
      var FoldableModule = runtimeModules["Data.Foldable"];
      var FunctionModule = runtimeModules["Data.Function"];
      var FunctionUncurriedRef = (runtimeModules["Data.Function.Uncurried"], runtimeModules["Data.Functor"]);
      var functorRef = runtimeModules["Data.Functor"];
      var MonoidModule = runtimeModules["Data.Monoid"];
      var NewtypeModule = (runtimeModules["Data.Newtype"], runtimeModules["Data.Semigroup"]);
      var SemigroupModule = runtimeModules["Data.Semigroup"];
      var timeDurationRef = (runtimeModules["Data.Time.Duration"], runtimeModules["Data.Unit"]);
      var UnitModule = runtimeModules["Data.Unit"];
      var EffectModule = runtimeModules.Effect;
      var EffectClass = runtimeModules["Effect.Class"];
      var ExceptionRef = (runtimeModules["Effect.Exception"], runtimeModules["Effect.Unsafe"]);
      var UnsafePartialModule = runtimeModules["Partial.Unsafe"];
      var preludeRef = runtimeModules.Prelude;
      var unsafeCoerceRef = runtimeModules["Unsafe.Coerce"];

      var parAffFunctor = new functorRef.Functor(AffModule._parAffMap);
      var affFunctor = new functorRef.Functor(AffModule._affMap);

      var eitherImplementation = {
        isLeft: function(val){
          if(val instanceof EitherModule.EitherLeft) return true;
          if(val instanceof EitherModule.EitherRight) return false;
          throw new Error("isLeft: expected Either type.");
        },
        fromLeft: function(val){
          if(val instanceof EitherModule.EitherLeft) return val.value0;
          if(val instanceof EitherModule.EitherRight) return UnsafePartialModule.forceCrash("unsafeFromLeft: Right");
          throw new Error("fromLeft: expected Either type.");
        },
        fromRight: function(val){
          if(val instanceof EitherModule.EitherRight) return val.value0;
          if(val instanceof EitherModule.EitherLeft) return UnsafePartialModule.forceCrash("unsafeFromRight: Left");
          throw new Error("fromRight: expected Either type.");
        },
        left: EitherModule.EitherLeft.create,
        right: EitherModule.EitherRight.create
      };

      var launchAff = function(aff){
        return function(){
          var fiberCreator = AffModule._makeFiber(eitherImplementation, aff)();
          fiberCreator.run();
          return fiberCreator;
        };
      };

      var parAffApply = new applyRef.Apply(function(){ return parAffFunctor }, AffModule._parAffApply);
      var affMonad = new monadRef.MonadInterface(function(){ return affApplicative }, function(){ return affBind });
      var affBind = new bindRef.Bind(function(){ return affApply }, AffModule._affBind);
      var affApply = new applyRef.Apply(function(){ return affFunctor }, monadRef.applyMonadic(affMonad));
      var affApplicative = new applicativeRef.Applicative(function(){ return affApply }, AffModule._affPure);
      var monadEffectAff = new EffectClass.MonadEffectInterface(function(){ return affMonad }, AffModule._affLiftEffect);

      var parallelAffInstance = new parallelClassRef.ParallelInterface(
        function(){ return parAffApplicative },
        function(){ return affMonad },
        unsafeCoerceRef.unsafeTypeCoerce, // parallel (identity, effectively)
        AffModule._affSequential // sequential
      );

      var parAffApplicative = new applicativeRef.Applicative(function(){ return parAffApply }, function(a){
        return parallelClassRef.executeParallel(parallelAffInstance)(applicativeRef.wrapValue(affApplicative)(a));
      });

      var semigroupCanceler = new SemigroupModule.Semigroup(function(cancel1){
        return function(cancel2){
          return function(err){
            return parallelRef.parallelSequenceAndDiscard(parallelAffInstance)(FoldableModule.arrayFoldable)([cancel1(err), cancel2(err)]);
          };
        };
      });

      var noOpCanceler = FunctionModule.constantFn(applicativeRef.wrapValue(affApplicative)(UnitModule.unitValue));
      var monoidCanceler = new MonoidModule.Monoid(function(){ return semigroupCanceler }, noOpCanceler);

      currentModule.launchAff = launchAff;
      currentModule.launchAff_ = function(aff){ return functorRef.void(EffectModule.effectFunctor)(launchAff(aff)) };
      currentModule.noOpCanceler = noOpCanceler;
      currentModule.affFunctor = affFunctor;
      currentModule.affApply = affApply;
      currentModule.affApplicative = affApplicative;
      currentModule.affBind = affBind;
      currentModule.affMonad = affMonad;
      currentModule.monadEffectAff = monadEffectAff;
      currentModule.parAffFunctor = parAffFunctor;
      currentModule.parAffApply = parAffApply;
      currentModule.parAffApplicative = parAffApplicative;
      currentModule.parallelAffInstance = parallelAffInstance;
      currentModule.semigroupCanceler = semigroupCanceler;
      currentModule.monoidCanceler = monoidCanceler;
      currentModule.makeAff = AffModule.makeAff;
    })(runtimeModules["Effect.Aff"] = runtimeModules["Effect.Aff"] || {});

    (function(currentModule){
      "use strict";
      runtimeModules["Node.Encoding"];
      var showRef = runtimeModules["Data.Show"];
      var preludeRef = (runtimeModules.Prelude);

      // Encoding types
      var AsciiEncoding = (function(){ function AsciiCtor(){} AsciiCtor.value = new AsciiCtor(); return AsciiCtor; })();
      var Utf8Encoding = (function(){ function Utf8Ctor(){} Utf8Ctor.value = new Utf8Ctor(); return Utf8Ctor; })();
      var Utf16leEncoding = (function(){ function Utf16leCtor(){} Utf16leCtor.value = new Utf16leCtor(); return Utf16leCtor; })();
      var Ucs2Encoding = (function(){ function Ucs2Ctor(){} Ucs2Ctor.value = new Ucs2Ctor(); return Ucs2Ctor; })();
      var Base64Encoding = (function(){ function Base64Ctor(){} Base64Ctor.value = new Base64Ctor(); return Base64Ctor; })();
      var Latin1Encoding = (function(){ function Latin1Ctor(){} Latin1Ctor.value = new Latin1Ctor(); return Latin1Ctor; })();
      var BinaryEncoding = (function(){ function BinaryCtor(){} BinaryCtor.value = new BinaryCtor(); return BinaryCtor; })();
      var HexEncoding = (function(){ function HexCtor(){} HexCtor.value = new HexCtor(); return HexCtor; })();

      var showEncodingInstance = new showRef.Show(function(encoding){
        if(encoding instanceof AsciiEncoding) return "ASCII";
        if(encoding instanceof Utf8Encoding) return "UTF8";
        if(encoding instanceof Utf16leEncoding) return "UTF16LE";
        if(encoding instanceof Ucs2Encoding) return "UCS2";
        if(encoding instanceof Base64Encoding) return "Base64";
        if(encoding instanceof Latin1Encoding) return "Latin1";
        if(encoding instanceof BinaryEncoding) return "Binary";
        if(encoding instanceof HexEncoding) return "Hex";
        throw new Error("Unknown encoding type for showEncoding.");
      });

      currentModule.AsciiEncoding = AsciiEncoding;
      currentModule.Utf8Encoding = Utf8Encoding;
      currentModule.Utf16leEncoding = Utf16leEncoding;
      currentModule.Ucs2Encoding = Ucs2Encoding;
      currentModule.Base64Encoding = Base64Encoding;
      currentModule.Latin1Encoding = Latin1Encoding;
      currentModule.BinaryEncoding = BinaryEncoding;
      currentModule.HexEncoding = HexEncoding;

      currentModule.mapEncodingToNode = function(encoding){
        if(encoding instanceof AsciiEncoding) return "ascii";
        if(encoding instanceof Utf8Encoding) return "utf8";
        if(encoding instanceof Utf16leEncoding) return "utf16le";
        if(encoding instanceof Ucs2Encoding) return "ucs2";
        if(encoding instanceof Base64Encoding) return "base64";
        if(encoding instanceof Latin1Encoding) return "latin1";
        if(encoding instanceof BinaryEncoding) return "binary";
        if(encoding instanceof HexEncoding) return "hex";
        throw new Error("mapEncodingToNode: Unknown encoding type.");
      };
      currentModule.showEncoding = showEncodingInstance;
    })(runtimeModules["Node.Encoding"] = runtimeModules["Node.Encoding"] || {});

    (function(currentModule){
      "use strict";
      (runtimeModules["Node.Process"] = runtimeModules["Node.Process"] || {}).processObject = process;
    })();

    (function(currentModule){
      "use strict";
      currentModule.readDataChunkImpl = function(bufferHandler){
        return function(stringHandler){
          return function(chunk){
            if(chunk instanceof Buffer) return bufferHandler(chunk);
            if("string" == typeof chunk) return stringHandler(chunk);
            throw new Error("Node.Stream.readDataChunkImpl: Unrecognized chunk type; expected String or Buffer, got: " + chunk);
          };
        };
      };
      currentModule.onStreamDataEither = function(chunkParser){
        return function(stream){
          return function(handler){
            return function(){
              stream.on("data", function(chunk){
                handler(chunkParser(chunk))();
              });
            };
          };
        };
      };
      currentModule.onStreamEnd = function(stream){
        return function(handler){
          return function(){
            stream.on("end", handler);
          };
        };
      };
      currentModule.writeToStream = function(stream){
        return function(data){
          return function(callback){
            return function(){
              return stream.write(data, null, callback);
            };
          };
        };
      };
      currentModule.writeStringImpl = function(stream){
        return function(encoding){
          return function(data){
            return function(callback){
              return function(){
                return stream.write(data, encoding, callback);
              };
            };
          };
        };
      };
    })(runtimeModules["Node.Stream"] = runtimeModules["Node.Stream"] || {});

    (function(currentModule){
      "use strict";
      (runtimeModules["Node.Buffer"] = runtimeModules["Node.Buffer"] || {}).bufferToStringImplementation = function(encoding){
        return function(buffer){
          return function(){
            return buffer.toString(encoding);
          };
        };
      };
    })();

    (function(currentModule){
      "use strict";
      var nodeBufferRef = runtimeModules["Node.Buffer"];
      var semigroupoidRef = (runtimeModules["Control.Semigroupoid"], runtimeModules["Data.ArrayBuffer.Types"], runtimeModules["Data.Maybe"], runtimeModules["Data.Show"]);
      var effectRef = runtimeModules.Effect;
      var nodeEncodingRef = runtimeModules["Node.Encoding"];
      var preludeRef = runtimeModules.Prelude;
      currentModule.bufferToString = function(encoding){
        return nodeBufferRef.bufferToStringImplementation(nodeEncodingRef.mapEncodingToNode(encoding));
      };
    })(runtimeModules["Node.Buffer"] = runtimeModules["Node.Buffer"] || {});

    (function(currentModule){
      "use strict";
      var nodeStreamRef = runtimeModules["Node.Stream"];
      var applicativeRef = runtimeModules["Control.Applicative"];
      var bindRef = runtimeModules["Control.Bind"];
      var eitherRef = runtimeModules["Data.Either"];
      var functorRef = (runtimeModules["Data.Functor"], runtimeModules["Data.Maybe"], runtimeModules["Data.Show"]);
      var effectRef = runtimeModules.Effect;
      var exceptionRef = runtimeModules["Effect.Exception"];
      var nodeBufferRef = runtimeModules["Node.Buffer"];
      var nodeEncodingRef = runtimeModules["Node.Encoding"];
      var preludeRef = runtimeModules.Prelude;

      var parseChunkAsEither = nodeStreamRef.readDataChunkImpl(eitherRef.EitherLeft.create)(eitherRef.EitherRight.create);

      var handleStreamData = function(stream){
        return function(handler){
          return nodeStreamRef.onStreamDataEither(parseChunkAsEither)(stream)(bindRef.composeKleisliFlipped(effectRef.effectBindInstance)(handler)(function(eitherChunk){
            if(eitherChunk instanceof eitherRef.EitherLeft) return exceptionRef.throwError("Stream encoding should not be set");
            if(eitherChunk instanceof eitherRef.EitherRight) return applicativeRef.wrapValue(effectRef.effectApplicative)(eitherChunk.value0);
            throw new Error("Pattern match failed in handleStreamData for EitherChunk.");
          }));
        };
      };

      currentModule.handleStreamData = handleStreamData;
      currentModule.onDataAsString = function(stream){
        return function(encoding){
          return function(handler){
            return handleStreamData(stream)(bindRef.composeKleisliFlipped(effectRef.effectBindInstance)(handler)(nodeBufferRef.bufferToString(encoding)));
          };
        };
      };
      currentModule.onStreamDataEither = nodeStreamRef.onStreamDataEither;
      currentModule.writeString = function(stream){
        return function(encoding){
          return nodeStreamRef.writeStringImpl(stream)(functorRef.displayValue(nodeEncodingRef.showEncoding)(encoding));
        };
      };
      currentModule.onStreamEnd = nodeStreamRef.onStreamEnd;
    })(runtimeModules["Node.Stream"] = runtimeModules["Node.Stream"] || {});

    (function(currentModule){
      "use strict";
      var nodeProcessRef = runtimeModules["Node.Process"];
      var functorRef = (runtimeModules["Data.Functor"], runtimeModules["Data.Maybe"], runtimeModules["Data.Posix"], runtimeModules["Data.Posix.Signal"], runtimeModules.Effect);
      var foreignObjectRef = (runtimeModules["Foreign.Object"], runtimeModules["Node.Platform"], runtimeModules["Node.Stream"]);
      var preludeRef = runtimeModules.Prelude;
      var unsafeCoerceRef = runtimeModules["Unsafe.Coerce"];

      var standardOutput = nodeProcessRef.processObject.stdout;
      var standardInput = nodeProcessRef.processObject.stdin;

      currentModule.standardInput = standardInput;
      currentModule.standardOutput = standardOutput;
    })(runtimeModules["Node.Process"] = runtimeModules["Node.Process"] || {});

    (function(currentModule){
      "use strict";
      var applicativeRef = runtimeModules["Control.Applicative"];
      var bindRef = runtimeModules["Control.Bind"];
      var categoryRef = runtimeModules["Control.Category"];
      var arrayRef = runtimeModules["Data.Array"];
      var bigIntRef = runtimeModules["Data.BigInt"];
      var eitherRef = runtimeModules["Data.Either"];
      var eqRef = runtimeModules["Data.Eq"];
      var functorRef = runtimeModules["Data.Functor"];
      var intRef = runtimeModules["Data.Int"];
      var maybeRef = runtimeModules["Data.Maybe"];
      var monoidRef = runtimeModules["Data.Monoid"];
      var ordRef = runtimeModules["Data.Ord"];
      var ringRef = (runtimeModules["Data.Ring"], runtimeModules["Data.Semigroup"], runtimeModules["Data.Semiring"]);
      var stringRef = (runtimeModules["Data.String"], runtimeModules["Data.String.CodeUnits"]);
      var stringCommonRef = runtimeModules["Data.String.Common"];
      var stringPatternRef = (runtimeModules["Data.String.Pattern"], runtimeModules["Data.Unit"]);
      var unitRef = runtimeModules["Data.Unit"];
      var effectRef = runtimeModules.Effect;
      var affRef = runtimeModules["Effect.Aff"];
      var effectClassRef = runtimeModules["Effect.Class"];
      var refRef = runtimeModules["Effect.Ref"];
      var nodeEncodingRef = runtimeModules["Node.Encoding"];
      var nodeProcessRef = runtimeModules["Node.Process"];
      var nodeStreamRef = runtimeModules["Node.Stream"];
      var unsafePartialRef = runtimeModules["Partial.Unsafe"];
      var preludeRef = runtimeModules.Prelude;

      /**
       * Solves the problem by determining the K-th character.
       * @param {string} rawInput - The raw input string containing 's' and 'k'.
       * @returns {string} The K-th character followed by a newline.
       */
      var processInputAndSolve = function(rawInput){
        // Helper to crash if Either is Left
        var crashIfLeft = function(eitherVal){
          return eitherRef.handleEither(function(errorMsg){
            return unsafePartialRef.forceCrash(errorMsg);
          })(categoryRef.identity(categoryRef.categoryFn))(eitherVal);
        };

        // Split input by newline and trim whitespace
        var lines = stringCommonRef.splitString("\n")(stringCommonRef.trimWhitespace(rawInput));

        // Attempt to extract 's' (first line)
        var maybeS = arrayRef.getArrayHead(lines);
        var s = crashIfLeft(eitherRef.note("Input string 's' not found.")(maybeS));

        // Attempt to extract 'k' (last line), convert to BigInt
        var maybeKString = arrayRef.getArrayLast(lines);
        var maybeK = bindRef.sequenceOperation(maybeRef.maybeBind)(maybeKString)(bigIntRef.bigIntFromStringDecimal);
        var k = crashIfLeft(eitherRef.note("Input 'k' not found or invalid.")(maybeK));

        // Define the core logic to find the K-th character
        var findCharacter = function(inputS, inputK){
          var charArray = stringRef.stringToCharArr(inputS);

          // Find the first character that is not '1'
          var nonOneCharIndex = arrayRef.findArrayIndex(eqRef.notEqual(eqRef.charEq)("1"))(charArray);

          var prefixChars;
          if(nonOneCharIndex instanceof maybeRef.MaybeNothing){
            // If all characters are '1', the prefix is just '1'
            prefixChars = ["1"];
          } else if(nonOneCharIndex instanceof maybeRef.MaybeJust){
            // Otherwise, take characters up to and including the first non-'1'
            prefixChars = arrayRef.takeElements(nonOneCharIndex.value0 + 1 | 0)(charArray);
          } else {
            throw new Error("Pattern match failed for nonOneCharIndex.");
          }

          var firstNonOneChar = maybeRef.fromJust()(arrayRef.getArrayLast(prefixChars));

          // Determine the final character
          var resultChar;
          // If K is less than or equal to the length of the prefix, it's one of the prefix chars
          if(ordRef.lessThanOrEq(bigIntRef.bigIntOrdInstance)(bigIntRef.bigIntFromInteger(arrayRef.getArrayLength(prefixChars)))(inputK)){
            resultChar = firstNonOneChar;
          } else {
            // Otherwise, K is larger than the prefix, so we need to find the character at K-th position
            // Convert K to a JS number (assuming K won't be excessively large for array indexing)
            var kAsJSNumber = maybeRef.fromJust()(intRef.parseDecimalString(bigIntRef.bigIntToStringDecimal(inputK)));
            // Adjust for 0-based indexing
            var charIndex = kAsJSNumber - 1;
            // Get the character from the original input string
            var charFromOriginalString = maybeRef.fromMaybe(firstNonOneChar)(arrayRef.getAtIndex(charArray)(charIndex));
            resultChar = charFromOriginalString;
          }
          return stringRef.charToString(resultChar);
        };

        // Execute the character finding logic
        var finalChar = findCharacter(s, k);
        return finalChar + "\n";
      };

      /**
       * Async operation to read all content from stdin.
       * @returns {Aff<string>} An Aff that resolves with the full input string.
       */
      var asyncInputReader = affRef.makeAff(function(callback){
        return function(){
          // Use a Ref to accumulate input chunks
          var inputBufferRef = refRef.createRef("")();

          // Set up data handler for stdin
          var dataHandlerCanceler = nodeStreamRef.onDataAsString(nodeProcessRef.standardInput)(nodeEncodingRef.Utf8Encoding.value)(function(chunk){
            return function(){
              var currentContent = refRef.readRef(inputBufferRef)();
              refRef.writeRef(currentContent + chunk)(inputBufferRef)();
              return unitRef.unitValue;
            };
          })();

          // Set up end handler for stdin
          var endHandlerCanceler = nodeStreamRef.onStreamEnd(nodeProcessRef.standardInput)(function(){
            var finalContent = refRef.readRef(inputBufferRef)();
            callback(applicativeRef.wrapValue(eitherRef.eitherApplicative)(finalContent))();
            return unitRef.unitValue;
          })();

          // Return a no-op canceler (actual cancelers from event listeners are handled internally)
          return monoidRef.emptyElement(affRef.monoidCanceler);
        };
      });

      /**
       * Main program entry point.
       * Reads stdin, processes it, and writes the result to stdout.
       */
      var programEntrypoint = affRef.launchAff_(bindRef.sequenceOperation(affRef.affBind)(asyncInputReader)(function(inputContent){
        // Process the input and obtain the result string
        var resultString = processInputAndSolve(inputContent);

        // Lift the effect of writing to stdout into Aff
        return effectClassRef.liftToEffect(affRef.monadEffectAff)(nodeStreamRef.writeString(nodeProcessRef.standardOutput)(nodeEncodingRef.Utf8Encoding.value)(resultString)(applicativeRef.wrapValue(effectRef.effectApplicative)(unitRef.unitValue)));
      }));

      currentModule.main = programEntrypoint;
      currentModule.solve = processInputAndSolve;
    })(runtimeModules.ContestSolver = runtimeModules.ContestSolver || {});

    // Execute the main program entry point
    runtimeModules.ContestSolver.main();

  // End of modules
  }
,{}],
},{},["Focm"], null)