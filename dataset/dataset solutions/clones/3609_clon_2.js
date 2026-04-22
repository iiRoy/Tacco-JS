moduleLoader=function(moduleDefinitions,moduleCache,entryPoints,globalExportName){
  // Variable to store the first encountered error during module loading
  var initialLoadError,
      // Reference to the previous parcelRequire, if it exists in the global scope
      previousLoader = "function" == typeof moduleLoader && moduleLoader,
      // Reference to Node.js's native require, if available
      nodeJSNativeRequire = "function" == typeof require && require;

  // Main function to load and execute a module
  function executeAndCacheModule(moduleId, bypassCacheCheck) {
    // If the module is already in cache, return its exports
    if (!moduleCache[moduleId]) {
      // If the module definition doesn't exist, try to load it from external sources
      if (!moduleDefinitions[moduleId]) {
        var externalLoader = "function" == typeof moduleLoader && moduleLoader;
        // If not bypassing cache check and an external loader exists, use it
        if (!bypassCacheCheck && externalLoader) return externalLoader(moduleId, !0);
        // If an old loader exists, use it
        if (previousLoader) return previousLoader(moduleId, !0);
        // If Node.js require is available and it's a string path, use it
        if (nodeJSNativeRequire && "string" == typeof moduleId) return nodeJSNativeRequire(moduleId);

        // If module still not found, throw an error
        var moduleNotFoundErr = new Error("Cannot locate required package '" + moduleId + "'");
        throw moduleNotFoundErr.code = "MODULE_NOT_FOUND", moduleNotFoundErr
      }

      // Prepare a local resolver for the module
      localRequireResolver.resolve = function(relativePath) {
        return moduleDefinitions[moduleId][1][relativePath] || relativePath
      };
      // Initialize module's private cache
      localRequireResolver.cache = {};

      // Create a new module instance and add it to the cache
      var currentModuleInstance = moduleCache[moduleId] = new executeAndCacheModule.Module(moduleId);
      // Execute the module's definition function
      moduleDefinitions[moduleId][0].call(currentModuleInstance.exports, localRequireResolver, currentModuleInstance, currentModuleInstance.exports, this)
    }
    // Return the module's exports
    return moduleCache[moduleId].exports;

    // Local require function for modules
    function localRequireResolver(relativePath) {
      return executeAndCacheModule(localRequireResolver.resolve(relativePath))
    }
  }

  // Mark this loader as a Parcel-generated one
  executeAndCacheModule.isParcelRequire = !0;
  // Module constructor
  executeAndCacheModule.Module = function(moduleId) {
    this.id = moduleId, this.bundle = executeAndCacheModule, this.exports = {}
  };
  // Store all module definitions
  executeAndCacheModule.modules = moduleDefinitions;
  // Store the module cache
  executeAndCacheModule.cache = moduleCache;
  // Store a reference to the parent loader (if any)
  executeAndCacheModule.parent = previousLoader;
  // Function to register new modules
  executeAndCacheModule.register = function(moduleId, moduleBody) {
    moduleDefinitions[moduleId] = [function(exportsObj, moduleObj) {
      moduleObj.exports = moduleBody
    }, {}]
  };

  // Iterate through entry points and load them
  for (var entryIndex = 0; entryIndex < entryPoints.length; entryIndex++) {
    try {
      executeAndCacheModule(entryPoints[entryIndex])
    } catch (currentError) {
      // Store the first error encountered
      initialLoadError || (initialLoadError = currentError)
    }
  }

  // If there are entry points, handle the last one for global export
  if (entryPoints.length) {
    var lastModuleExports = executeAndCacheModule(entryPoints[entryPoints.length - 1]);
    // Export based on environment (CommonJS, AMD, or global)
    "object" == typeof exports && "undefined" != typeof module ? module.exports = lastModuleExports : "function" == typeof define && define.amd ? define(function() {
      return lastModuleExports
    }) : globalExportName && (this[globalExportName] = lastModuleExports)
  }

  // Update the global parcelRequire (or moduleLoader)
  if (moduleLoader = executeAndCacheModule, initialLoadError) throw initialLoadError;
  // Return the main module loader function
  return executeAndCacheModule
}({
  "9xaU": [function(requireModulePath, currentModule, exportsObject) {
    // This block defines the BigInt functionality.
    // It's a complex implementation of arbitrary-precision integers.

    // The main factory function for BigInt instances
    var bigIntFactory = function(inputNumber) {
      "use strict";
      // Constants used in the BigInt implementation
      var baseTenMillion = 1e7, // Base for internal digit representation (10,000,000)
          digitGroupSize = 7, // Number of digits in each group for baseTenMillion
          maxSafeJSInteger = 9007199254740992, // Maximum safe integer in JavaScript
          maxSafeJSIntegerAsDigits = convertNumberToDigitArray(maxSafeJSInteger), // maxSafeJSInteger represented as an array of digits
          base36Digits = "0123456789abcdefghijklmnopqrstuvwxyz", // Digits for base conversion
          supportsNativeBigInt = "function" == typeof BigInt; // Check if native BigInt is supported

      /**
       * Constructs a BigInt instance.
       * @param {number|string|BigInt|LongNumberRepresentation|SmallNumberRepresentation|NativeBigIntRepresentation} value The value to convert to a BigInt.
       * @param {number} [base] The base of the input string, if applicable.
       * @param {boolean} [isSigned] Whether the input string is signed.
       * @param {boolean} [isCaseSensitive] Whether the input base string is case-sensitive.
       * @returns {LongNumberRepresentation|SmallNumberRepresentation|NativeBigIntRepresentation} A BigInt instance.
       */
      function constructBigInt(value, base, isSigned, isCaseSensitive) {
        if (void 0 === value) return bigIntConstants[0]; // If no value, return zero
        // If base is provided and not 10, or if isSigned is true, parse from string with base
        if (void 0 !== base && (10 != +base || isSigned)) return parseStringWithBase(value, base, isSigned, isCaseSensitive);
        // Otherwise, convert the value to an appropriate BigInt representation
        return ensureBigIntInstance(value)
      }

      /**
       * Represents a large integer using an array of digits.
       * @param {number[]} digitArray The array of digits.
       * @param {boolean} isNegative Sign of the number.
       * @constructor
       */
      function LongNumberRepresentation(digitArray, isNegative) {
        this.value = digitArray, this.sign = isNegative, this.isSmall = !1
      }

      /**
       * Represents a small integer that fits within JavaScript's safe integer range.
       * @param {number} numberValue The integer value.
       * @constructor
       */
      function SmallNumberRepresentation(numberValue) {
        this.value = numberValue, this.sign = numberValue < 0, this.isSmall = !0
      }

      /**
       * Represents a BigInt using JavaScript's native BigInt type.
       * @param {BigInt} nativeBigIntValue The native BigInt value.
       * @constructor
       */
      function NativeBigIntRepresentation(nativeBigIntValue) {
        this.value = nativeBigIntValue
      }

      /**
       * Checks if a number is within the safe integer range.
       * @param {number} num The number to check.
       * @returns {boolean} True if the number is safe, false otherwise.
       */
      function isWithinSafeIntegerRange(num) {
        return -maxSafeJSInteger < num && num < maxSafeJSInteger
      }

      /**
       * Converts a number into an array of digits based on baseTenMillion.
       * @param {number} num The number to convert.
       * @returns {number[]} Array of digits.
       */
      function convertNumberToDigitArray(num) {
        // Handle numbers smaller than baseTenMillion
        return num < 1e7 ? [num] :
            // Handle numbers smaller than 1e14
            num < 1e14 ? [num % 1e7, Math.floor(num / 1e7)] :
                // Handle larger numbers
                [num % 1e7, Math.floor(num / 1e7) % 1e7, Math.floor(num / 1e14)]
      }

      /**
       * Converts an array of digits back to a number, if it's small enough.
       * @param {number[]} digitArray The array of digits.
       * @returns {number|number[]} The number or the original array if too large.
       */
      function convertDigitArrayToNumber(digitArray) {
        trimLeadingZeros(digitArray);
        var arrayLength = digitArray.length;
        // If array is small and represents a number less than maxSafeJSInteger, convert to number
        if (arrayLength < 4 && compareDigitArrays(digitArray, maxSafeJSIntegerAsDigits) < 0) switch (arrayLength) {
          case 0:
            return 0;
          case 1:
            return digitArray[0];
          case 2:
            return digitArray[0] + digitArray[1] * baseTenMillion;
          default:
            return digitArray[0] + (digitArray[1] + digitArray[2] * baseTenMillion) * baseTenMillion
        }
        return digitArray
      }

      /**
       * Removes leading zero digits from a digit array.
       * @param {number[]} digitArray The array of digits.
       */
      function trimLeadingZeros(digitArray) {
        for (var i = digitArray.length; 0 === digitArray[--i];);
        digitArray.length = i + 1
      }

      /**
       * Creates a new array filled with zeros.
       * @param {number} size The size of the array.
       * @returns {number[]} A new zero-filled array.
       */
      function createZeroFilledArray(size) {
        for (var newArray = new Array(size), idx = -1; ++idx < size;) newArray[idx] = 0;
        return newArray
      }

      /**
       * Rounds a number towards zero (floor for positive, ceil for negative).
       * @param {number} num The number to round.
       * @returns {number} The rounded integer.
       */
      function roundToInteger(num) {
        return num > 0 ? Math.floor(num) : Math.ceil(num)
      }

      /**
       * Adds two digit arrays.
       * @param {number[]} arr1 The first digit array.
       * @param {number[]} arr2 The second digit array.
       * @returns {number[]} The resulting digit array.
       */
      function addDigitArrays(arr1, arr2) {
        var digit, carry,
            len1 = arr1.length,
            len2 = arr2.length,
            resultArray = new Array(len1),
            currentCarry = 0,
            digitBase = baseTenMillion;
        for (carry = 0; carry < len2; carry++) currentCarry = (digit = arr1[carry] + arr2[carry] + currentCarry) >= digitBase ? 1 : 0, resultArray[carry] = digit - currentCarry * digitBase;
        for (; carry < len1;) currentCarry = (digit = arr1[carry] + currentCarry) === digitBase ? 1 : 0, resultArray[carry++] = digit - currentCarry * digitBase;
        return currentCarry > 0 && resultArray.push(currentCarry), resultArray
      }

      /**
       * Adds two digit arrays, handling different lengths.
       * @param {number[]} arr1 The first digit array.
       * @param {number[]} arr2 The second digit array.
       * @returns {number[]} The resulting digit array.
       */
      function sumDigitArrays(arr1, arr2) {
        return arr1.length >= arr2.length ? addDigitArrays(arr1, arr2) : addDigitArrays(arr2, arr1)
      }

      /**
       * Adds a small number to a digit array.
       * @param {number[]} digitArray The digit array.
       * @param {number} smallNumber The small number to add.
       * @returns {number[]} The resulting digit array.
       */
      function addNumberToDigitArray(digitArray, smallNumber) {
        var digit, carry,
            arrayLength = digitArray.length,
            resultArray = new Array(arrayLength),
            digitBase = baseTenMillion,
            currentCarry = smallNumber;
        for (carry = 0; carry < arrayLength; carry++) digit = digitArray[carry] + digitBase + currentCarry, currentCarry = Math.floor(digit / digitBase), resultArray[carry] = digit - currentCarry * digitBase, currentCarry += 1;
        for (; currentCarry > 0;) resultArray[carry++] = currentCarry % digitBase, currentCarry = Math.floor(currentCarry / digitBase);
        return resultArray
      }

      /**
       * Subtracts one digit array from another. Assumes first array >= second array.
       * @param {number[]} arr1 The first digit array.
       * @param {number[]} arr2 The second digit array.
       * @returns {number[]} The resulting digit array.
       */
      function subtractDigitArrays(arr1, arr2) {
        var digit, borrow,
            len1 = arr1.length,
            len2 = arr2.length,
            resultArray = new Array(len1),
            currentBorrow = 0,
            digitBase = baseTenMillion;
        for (digit = 0; digit < len2; digit++)(borrow = arr1[digit] - currentBorrow - arr2[digit]) < 0 ? (borrow += digitBase, currentBorrow = 1) : currentBorrow = 0, resultArray[digit] = borrow;
        for (digit = len2; digit < len1; digit++) {
          if (!((borrow = arr1[digit] - currentBorrow) < 0)) {
            resultArray[digit++] = borrow;
            break
          }
          borrow += digitBase, resultArray[digit] = borrow
        }
        for (; digit < len1; digit++) resultArray[digit] = arr1[digit];
        return trimLeadingZeros(resultArray), resultArray
      }

      /**
       * Subtracts a small number from a digit array.
       * @param {number[]} digitArray The digit array.
       * @param {number} smallNumber The small number to subtract.
       * @param {boolean} isNegativeResult Flag to indicate if the result should be negative.
       * @returns {SmallNumberRepresentation|LongNumberRepresentation} The resulting BigInt.
       */
      function subtractNumberFromDigitArray(digitArray, smallNumber, isNegativeResult) {
        var digit, carry,
            arrayLength = digitArray.length,
            resultArray = new Array(arrayLength),
            currentCarry = -smallNumber,
            digitBase = baseTenMillion;
        for (digit = 0; digit < arrayLength; digit++) carry = digitArray[digit] + currentCarry, currentCarry = Math.floor(carry / digitBase), carry %= digitBase, resultArray[digit] = carry < 0 ? carry + digitBase : carry;
        return "number" == typeof(resultArray = convertDigitArrayToNumber(resultArray)) ? (isNegativeResult && (resultArray = -resultArray), new SmallNumberRepresentation(resultArray)) : new LongNumberRepresentation(resultArray, isNegativeResult)
      }

      /**
       * Multiplies two digit arrays. Uses Karatsuba algorithm for large arrays.
       * @param {number[]} arr1 The first digit array.
       * @param {number[]} arr2 The second digit array.
       * @returns {number[]} The resulting digit array.
       */
      function multiplyDigitArrays(arr1, arr2) {
        var digit, carry,
            len1 = arr1.length,
            len2 = arr2.length,
            resultArray = createZeroFilledArray(len1 + len2),
            digitBase = baseTenMillion;
        for (carry = 0; carry < len1; ++carry) {
          digit = arr1[carry];
          for (var i = 0; i < len2; ++i) digit = digit * arr2[i] + resultArray[carry + i], carry = Math.floor(digit / digitBase), resultArray[carry + i] = digit - carry * digitBase, resultArray[carry + i + 1] += carry
        }
        return trimLeadingZeros(resultArray), resultArray
      }

      /**
       * Multiplies a digit array by a single number.
       * @param {number[]} digitArray The digit array.
       * @param {number} multiplier The number to multiply by.
       * @returns {number[]} The resulting digit array.
       */
      function multiplyDigitArrayByNumber(digitArray, multiplier) {
        var digit, carry,
            arrayLength = digitArray.length,
            resultArray = new Array(arrayLength),
            digitBase = baseTenMillion,
            currentCarry = 0;
        for (carry = 0; carry < arrayLength; carry++) digit = digitArray[carry] * multiplier + currentCarry, currentCarry = Math.floor(digit / digitBase), resultArray[carry] = digit - currentCarry * digitBase;
        for (; currentCarry > 0;) resultArray[carry++] = currentCarry % digitBase, currentCarry = Math.floor(currentCarry / digitBase);
        return resultArray
      }

      /**
       * Prepends zeros to a digit array.
       * @param {number[]} digitArray The array to pad.
       * @param {number} count The number of zeros to prepend.
       * @returns {number[]} The padded array.
       */
      function padDigitArrayWithZeros(digitArray, count) {
        for (var zeros = []; count-- > 0;) zeros.push(0);
        return zeros.concat(digitArray)
      }

      /**
       * Creates a BigInt from a number and a digit array.
       * @param {number} num The number (e.g., multiplier).
       * @param {number[]} digitArray The digit array.
       * @param {boolean} isNegative Sign of the number.
       * @returns {LongNumberRepresentation} The BigInt instance.
       */
      function createBigIntFromDigitArray(num, digitArray, isNegative) {
        return new LongNumberRepresentation(num < baseTenMillion ? multiplyDigitArrayByNumber(digitArray, num) : multiplyDigitArrays(digitArray, convertNumberToDigitArray(num)), isNegative)
      }

      /**
       * Squares a digit array.
       * @param {number[]} digitArray The digit array to square.
       * @returns {number[]} The resulting digit array.
       */
      function squareDigitArray(digitArray) {
        var digit, carry,
            arrayLength = digitArray.length,
            resultArray = createZeroFilledArray(arrayLength + arrayLength),
            digitBase = baseTenMillion;
        for (carry = 0; carry < arrayLength; carry++) {
          digit = 0 - (carry = digitArray[carry]) * carry;
          for (var i = carry; i < arrayLength; i++) digit = carry * digitArray[i] * 2 + resultArray[carry + i] + digit, carry = Math.floor(digit / digitBase), resultArray[carry + i] = digit - carry * digitBase, resultArray[carry + arrayLength] = carry
        }
        return trimLeadingZeros(resultArray), resultArray
      }

      /**
       * Divides a digit array by a single number.
       * @param {number[]} digitArray The digit array.
       * @param {number} divisor The divisor.
       * @returns {[number[], number]} An array containing the quotient digit array and the remainder.
       */
      function divideDigitArrayByNumber(digitArray, divisor) {
        var digit, remainder,
            arrayLength = digitArray.length,
            quotientArray = createZeroFilledArray(arrayLength),
            digitBase = baseTenMillion,
            currentRemainder = 0;
        for (digit = 0, remainder = arrayLength - 1; remainder >= 0; --remainder) currentRemainder = (digit = currentRemainder * digitBase + digitArray[remainder]) - (remainder = roundToInteger(digit / divisor)) * divisor, quotientArray[remainder] = 0 | remainder;
        return [quotientArray, 0 | currentRemainder]
      }

      /**
       * Performs BigInt division and remainder.
       * @param {LongNumberRepresentation|SmallNumberRepresentation} dividend The dividend.
       * @param {LongNumberRepresentation|SmallNumberRepresentation} divisor The divisor.
       * @returns {[LongNumberRepresentation|SmallNumberRepresentation, LongNumberRepresentation|SmallNumberRepresentation]} An array containing the quotient and remainder BigInts.
       */
      function bigIntDivisionAndRemainder(dividend, divisor) {
        var currentDivisor = ensureBigIntInstance(divisor);
        if (supportsNativeBigInt) return [new NativeBigIntRepresentation(dividend.value / currentDivisor.value), new NativeBigIntRepresentation(dividend.value % currentDivisor.value)];
        var dividendValue = dividend.value,
            divisorValue = currentDivisor.value;
        if (0 === divisorValue) throw new Error("Cannot divide by zero");
        if (dividend.isSmall) return currentDivisor.isSmall ? [new SmallNumberRepresentation(roundToInteger(dividendValue / divisorValue)), new SmallNumberRepresentation(dividendValue % divisorValue)] : [bigIntConstants[0], dividend];
        if (currentDivisor.isSmall) {
          if (1 === divisorValue) return [dividend, bigIntConstants[0]];
          if (-1 == divisorValue) return [dividend.negate(), bigIntConstants[0]];
          var absDivisor = Math.abs(divisorValue);
          if (absDivisor < baseTenMillion) {
            var divisionResult = divideDigitArrayByNumber(dividendValue, absDivisor);
            var quotientDigits = convertDigitArrayToNumber(divisionResult[0]);
            var remainderValue = divisionResult[1];
            return dividend.sign && (remainderValue = -remainderValue),
                "number" == typeof quotientDigits ?
                    (dividend.sign !== currentDivisor.sign && (quotientDigits = -quotientDigits), [new SmallNumberRepresentation(quotientDigits), new SmallNumberRepresentation(remainderValue)]) :
                    [new LongNumberRepresentation(quotientDigits, dividend.sign !== currentDivisor.sign), new SmallNumberRepresentation(remainderValue)]
          }
          divisorValue = convertNumberToDigitArray(absDivisor)
        }
        var comparison = compareDigitArrays(dividendValue, divisorValue);
        if (-1 === comparison) return [bigIntConstants[0], dividend];
        if (0 === comparison) return [bigIntConstants[dividend.sign === currentDivisor.sign ? 1 : -1], bigIntConstants[0]];
        var quotientArray = (dividendValue.length + divisorValue.length <= 200 ? function(dividendArr, divisorArr) {
          // Division algorithm for smaller arrays
          var quotientDigit, currentDividendDigit, i, j,
              dividendLength = dividendArr.length,
              divisorLength = divisorArr.length,
              resultQuotient = createZeroFilledArray(divisorLength),
              digitBase = baseTenMillion,
              scaledDividend = multiplyDigitArrayByNumber(dividendArr, (i = Math.ceil(digitBase / (2 * divisorArr[divisorLength - 1]))));
          scaledDividend.length <= dividendLength && scaledDividend.push(0);
          var scaledDivisor = multiplyDigitArrayByNumber(divisorArr, i);
          scaledDivisor.push(0);
          currentDivisorDigit = scaledDivisor[divisorLength - 1];

          for (i = dividendLength - divisorLength; i >= 0; i--) {
            for (quotientDigit = digitBase - 1, scaledDividend[i + divisorLength] !== currentDivisorDigit && (quotientDigit = Math.floor((scaledDividend[i + divisorLength] * digitBase + scaledDividend[i + divisorLength - 1]) / currentDivisorDigit)), j = 0, currentDividendDigit = 0, dividendLength = scaledDivisor.length, currentRemainderDigit = 0; currentRemainderDigit < dividendLength; currentRemainderDigit++) j += quotientDigit * scaledDivisor[currentRemainderDigit], remainderDigit = Math.floor(j / digitBase), currentDividendDigit += scaledDividend[i + currentRemainderDigit] - (j - remainderDigit * digitBase), j = remainderDigit, currentDividendDigit < 0 ? (scaledDividend[i + currentRemainderDigit] = currentDividendDigit + digitBase, currentDividendDigit = -1) : (scaledDividend[i + currentRemainderDigit] = currentDividendDigit, currentDividendDigit = 0);
            for (; 0 !== currentDividendDigit;) {
              for (quotientDigit -= 1, j = 0, currentRemainderDigit = 0; currentRemainderDigit < dividendLength; currentRemainderDigit++)(j += scaledDividend[i + currentRemainderDigit] - digitBase + scaledDivisor[currentRemainderDigit]) < 0 ? (scaledDividend[i + currentRemainderDigit] = j + digitBase, j = 0) : (scaledDividend[i + currentRemainderDigit] = j, j = 1);
              currentDividendDigit += j
            }
            resultQuotient[i] = quotientDigit
          }
          return scaledDividend = divideDigitArrayByNumber(scaledDividend, i)[0], [convertDigitArrayToNumber(resultQuotient), convertDigitArrayToNumber(scaledDividend)]
        }(dividendValue, divisorValue) : function(dividendArr, divisorArr) {
          // Long division algorithm for very large arrays
          for (var quotientDigits, remainderDigits, currentDigit, carryDigit, tempProduct,
                   dividendLength = dividendArr.length,
                   divisorLength = divisorArr.length,
                   quotientResult = [],
                   remainderAccumulator = [],
                   digitBase = baseTenMillion; dividendLength;)
            if (remainderAccumulator.unshift(dividendArr[--dividendLength]), trimLeadingZeros(remainderAccumulator), compareDigitArrays(remainderAccumulator, divisorArr) < 0) quotientResult.push(0);
            else {
              quotientDigits = remainderAccumulator[(currentDigit = remainderAccumulator.length) - 1] * digitBase + remainderAccumulator[currentDigit - 2], carryDigit = divisorArr[divisorLength - 1] * digitBase + divisorArr[divisorLength - 2], currentDigit > divisorLength && (quotientDigits = (quotientDigits + 1) * digitBase), currentDigit = Math.ceil(quotientDigits / carryDigit);
              do {
                if (compareDigitArrays(tempProduct = multiplyDigitArrayByNumber(divisorArr, currentDigit), remainderAccumulator) <= 0) break;
                currentDigit--
              } while (currentDigit);
              quotientResult.push(currentDigit), remainderAccumulator = subtractDigitArrays(remainderAccumulator, tempProduct)
            }
          return quotientResult.reverse(), [convertDigitArrayToNumber(quotientResult), convertDigitArrayToNumber(remainderAccumulator)]
        }(dividendValue, divisorValue))[0];
        var isResultNegative = dividend.sign !== currentDivisor.sign,
            remainderBigInt = quotientArray[1],
            isRemainderNegative = dividend.sign;
        return "number" == typeof quotientArray ? (isResultNegative && (quotientArray = -quotientArray), quotientArray = new SmallNumberRepresentation(quotientArray)) : quotientArray = new LongNumberRepresentation(quotientArray, isResultNegative),
            "number" == typeof remainderBigInt ? (isRemainderNegative && (remainderBigInt = -remainderBigInt), remainderBigInt = new SmallNumberRepresentation(remainderBigInt)) : remainderBigInt = new LongNumberRepresentation(remainderBigInt, isRemainderNegative), [quotientArray, remainderBigInt]
      }

      /**
       * Compares two digit arrays.
       * @param {number[]} arr1 The first digit array.
       * @param {number[]} arr2 The second digit array.
       * @returns {number} 1 if arr1 > arr2, -1 if arr1 < arr2, 0 if equal.
       */
      function compareDigitArrays(arr1, arr2) {
        if (arr1.length !== arr2.length) return arr1.length > arr2.length ? 1 : -1;
        for (var i = arr1.length - 1; i >= 0; i--)
          if (arr1[i] !== arr2[i]) return arr1[i] > arr2[i] ? 1 : -1;
        return 0
      }

      /**
       * Checks if a BigInt is a probable prime for small numbers.
       * @param {LongNumberRepresentation|SmallNumberRepresentation|NativeBigIntRepresentation} bigNum The BigInt to check.
       * @returns {boolean|undefined} True/False if small enough, undefined otherwise.
       */
      function isSmallPrimeCandidate(bigNum) {
        var absNum = bigNum.abs();
        return !absNum.isUnit() && (!!(absNum.equals(2) || absNum.equals(3) || absNum.equals(5)) || !(absNum.isEven() || absNum.isDivisibleBy(3) || absNum.isDivisibleBy(5)) && (!!absNum.lesser(49) || void 0))
      }

      /**
       * Performs the Miller-Rabin primality test.
       * @param {LongNumberRepresentation|SmallNumberRepresentation|NativeBigIntRepresentation} candidateNum The number to test.
       * @param {number[]} testBases An array of bases to test against.
       * @returns {boolean} True if probable prime, false otherwise.
       */
      function millerRabinTest(candidateNum, testBases) {
        for (var witness, power, exponent,
                 prevNum = candidateNum.prev(),
                 tempPrevNum = prevNum,
                 powerCount = 0; tempPrevNum.isEven();) tempPrevNum = tempPrevNum.divide(2), powerCount++;
        testLoop: for (exponent = 0; exponent < testBases.length; exponent++)
          if (!candidateNum.lesser(testBases[exponent]) && !(witness = bigIntFactory(testBases[exponent]).modPow(tempPrevNum, candidateNum)).isUnit() && !witness.equals(prevNum)) {
            for (power = powerCount - 1; 0 != power; power--) {
              if ((witness = witness.square().mod(candidateNum)).isUnit()) return !1;
              if (witness.equals(prevNum)) continue testLoop
            }
            return !1
          }
        return !0
      }

      // Prototypal inheritance setup
      LongNumberRepresentation.prototype = Object.create(constructBigInt.prototype);
      SmallNumberRepresentation.prototype = Object.create(constructBigInt.prototype);
      NativeBigIntRepresentation.prototype = Object.create(constructBigInt.prototype);

      // --- Arithmetic Operations ---

      LongNumberRepresentation.prototype.add = function(otherNum) {
        var otherBigInt = ensureBigIntInstance(otherNum);
        if (this.sign !== otherBigInt.sign) return this.subtract(otherBigInt.negate());
        var thisValue = this.value,
            otherValue = otherBigInt.value;
        return otherBigInt.isSmall ? new LongNumberRepresentation(addNumberToDigitArray(thisValue, Math.abs(otherValue)), this.sign) : new LongNumberRepresentation(sumDigitArrays(thisValue, otherValue), this.sign)
      };
      LongNumberRepresentation.prototype.plus = LongNumberRepresentation.prototype.add;

      SmallNumberRepresentation.prototype.add = function(otherNum) {
        var otherBigInt = ensureBigIntInstance(otherNum),
            thisValue = this.value;
        if (thisValue < 0 !== otherBigInt.sign) return this.subtract(otherBigInt.negate());
        var otherValue = otherBigInt.value;
        if (otherBigInt.isSmall) {
          if (isWithinSafeIntegerRange(thisValue + otherValue)) return new SmallNumberRepresentation(thisValue + otherValue);
          otherValue = convertNumberToDigitArray(Math.abs(otherValue))
        }
        return new LongNumberRepresentation(addNumberToDigitArray(otherValue, Math.abs(thisValue)), thisValue < 0)
      };
      SmallNumberRepresentation.prototype.plus = SmallNumberRepresentation.prototype.add;

      NativeBigIntRepresentation.prototype.add = function(otherNum) {
        return new NativeBigIntRepresentation(this.value + ensureBigIntInstance(otherNum).value)
      };
      NativeBigIntRepresentation.prototype.plus = NativeBigIntRepresentation.prototype.add;

      LongNumberRepresentation.prototype.subtract = function(otherNum) {
        var otherBigInt = ensureBigIntInstance(otherNum);
        if (this.sign !== otherBigInt.sign) return this.add(otherBigInt.negate());
        var thisValue = this.value,
            otherValue = otherBigInt.value;
        return otherBigInt.isSmall ? subtractNumberFromDigitArray(thisValue, Math.abs(otherValue), this.sign) : function(arr1, arr2, isNegative) {
          var resultDigits;
          return compareDigitArrays(arr1, arr2) >= 0 ? resultDigits = subtractDigitArrays(arr1, arr2) : (resultDigits = subtractDigitArrays(arr2, arr1), isNegative = !isNegative),
              "number" == typeof(resultDigits = convertDigitArrayToNumber(resultDigits)) ? (isNegative && (resultDigits = -resultDigits), new SmallNumberRepresentation(resultDigits)) : new LongNumberRepresentation(resultDigits, isNegative)
        }(thisValue, otherValue, this.sign)
      };
      LongNumberRepresentation.prototype.minus = LongNumberRepresentation.prototype.subtract;

      SmallNumberRepresentation.prototype.subtract = function(otherNum) {
        var otherBigInt = ensureBigIntInstance(otherNum),
            thisValue = this.value;
        if (thisValue < 0 !== otherBigInt.sign) return this.add(otherBigInt.negate());
        var otherValue = otherBigInt.value;
        return otherBigInt.isSmall ? new SmallNumberRepresentation(thisValue - otherValue) : subtractNumberFromDigitArray(otherValue, Math.abs(thisValue), thisValue >= 0)
      };
      SmallNumberRepresentation.prototype.minus = SmallNumberRepresentation.prototype.subtract;

      NativeBigIntRepresentation.prototype.subtract = function(otherNum) {
        return new NativeBigIntRepresentation(this.value - ensureBigIntInstance(otherNum).value)
      };
      NativeBigIntRepresentation.prototype.minus = NativeBigIntRepresentation.prototype.subtract;

      LongNumberRepresentation.prototype.negate = function() {
        return new LongNumberRepresentation(this.value, !this.sign)
      };

      SmallNumberRepresentation.prototype.negate = function() {
        var originalSign = this.sign,
            negatedNum = new SmallNumberRepresentation(-this.value);
        return negatedNum.sign = !originalSign, negatedNum
      };

      NativeBigIntRepresentation.prototype.negate = function() {
        return new NativeBigIntRepresentation(-this.value)
      };

      LongNumberRepresentation.prototype.abs = function() {
        return new LongNumberRepresentation(this.value, !1)
      };

      SmallNumberRepresentation.prototype.abs = function() {
        return new SmallNumberRepresentation(Math.abs(this.value))
      };

      NativeBigIntRepresentation.prototype.abs = function() {
        return new NativeBigIntRepresentation(this.value >= 0 ? this.value : -this.value)
      };

      LongNumberRepresentation.prototype.multiply = function(otherNum) {
        var product, karatsubaThreshold,
            otherBigInt = ensureBigIntInstance(otherNum),
            thisValue = this.value,
            otherValue = otherBigInt.value,
            isResultNegative = this.sign !== otherBigInt.sign;
        if (otherBigInt.isSmall) {
          if (0 === otherValue) return bigIntConstants[0];
          if (1 === otherValue) return this;
          if (-1 === otherValue) return this.negate();
          if ((karatsubaThreshold = Math.abs(otherValue)) < baseTenMillion) return new LongNumberRepresentation(multiplyDigitArrayByNumber(thisValue, karatsubaThreshold), isResultNegative);
          otherValue = convertNumberToDigitArray(karatsubaThreshold)
        }
        product = thisValue.length, karatsubaThreshold = otherValue.length;
        return new LongNumberRepresentation(-.012 * product - .012 * karatsubaThreshold + 15e-6 * product * karatsubaThreshold > 0 ? function karatsubaMultiply(arr1, arr2) {
          var maxLength = Math.max(arr1.length, arr2.length);
          if (maxLength <= 30) return multiplyDigitArrays(arr1, arr2); // Use standard multiplication for small arrays
          maxLength = Math.ceil(maxLength / 2);
          var arr1High = arr1.slice(maxLength),
              arr1Low = arr1.slice(0, maxLength),
              arr2High = arr2.slice(maxLength),
              arr2Low = arr2.slice(0, maxLength),
              productLowLow = karatsubaMultiply(arr1Low, arr2Low),
              productHighHigh = karatsubaMultiply(arr1High, arr2High),
              productSum = karatsubaMultiply(sumDigitArrays(arr1Low, arr1High), sumDigitArrays(arr2Low, arr2High)),
              finalProduct = sumDigitArrays(sumDigitArrays(productLowLow, padDigitArrayWithZeros(subtractDigitArrays(subtractDigitArrays(productSum, productLowLow), productHighHigh), maxLength)), padDigitArrayWithZeros(productHighHigh, 2 * maxLength));
          return trimLeadingZeros(finalProduct), finalProduct
        }(thisValue, otherValue) : multiplyDigitArrays(thisValue, otherValue), isResultNegative)
      };
      LongNumberRepresentation.prototype.times = LongNumberRepresentation.prototype.multiply;

      SmallNumberRepresentation.prototype._multiplyBySmall = function(smallNum) {
        return isWithinSafeIntegerRange(smallNum.value * this.value) ? new SmallNumberRepresentation(smallNum.value * this.value) : createBigIntFromDigitArray(Math.abs(smallNum.value), convertNumberToDigitArray(Math.abs(this.value)), this.sign !== smallNum.sign)
      };

      LongNumberRepresentation.prototype._multiplyBySmall = function(smallNum) {
        return 0 === smallNum.value ? bigIntConstants[0] : 1 === smallNum.value ? this : -1 === smallNum.value ? this.negate() : createBigIntFromDigitArray(Math.abs(smallNum.value), this.value, this.sign !== smallNum.sign)
      };

      SmallNumberRepresentation.prototype.multiply = function(otherNum) {
        return ensureBigIntInstance(otherNum)._multiplyBySmall(this)
      };
      SmallNumberRepresentation.prototype.times = SmallNumberRepresentation.prototype.multiply;

      NativeBigIntRepresentation.prototype.multiply = function(otherNum) {
        return new NativeBigIntRepresentation(this.value * ensureBigIntInstance(otherNum).value)
      };
      NativeBigIntRepresentation.prototype.times = NativeBigIntRepresentation.prototype.multiply;

      LongNumberRepresentation.prototype.square = function() {
        return new LongNumberRepresentation(squareDigitArray(this.value), !1)
      };

      SmallNumberRepresentation.prototype.square = function() {
        var squaredValue = this.value * this.value;
        return isWithinSafeIntegerRange(squaredValue) ? new SmallNumberRepresentation(squaredValue) : new LongNumberRepresentation(squareDigitArray(convertNumberToDigitArray(Math.abs(this.value))), !1)
      };

      NativeBigIntRepresentation.prototype.square = function(input) {
        return new NativeBigIntRepresentation(this.value * this.value)
      };

      LongNumberRepresentation.prototype.divmod = function(otherNum) {
        var result = bigIntDivisionAndRemainder(this, otherNum);
        return {
          quotient: result[0],
          remainder: result[1]
        }
      };
      NativeBigIntRepresentation.prototype.divmod = SmallNumberRepresentation.prototype.divmod = LongNumberRepresentation.prototype.divmod;

      LongNumberRepresentation.prototype.divide = function(otherNum) {
        return bigIntDivisionAndRemainder(this, otherNum)[0]
      };
      NativeBigIntRepresentation.prototype.over = NativeBigIntRepresentation.prototype.divide = function(otherNum) {
        return new NativeBigIntRepresentation(this.value / ensureBigIntInstance(otherNum).value)
      };
      SmallNumberRepresentation.prototype.over = SmallNumberRepresentation.prototype.divide = LongNumberRepresentation.prototype.over = LongNumberRepresentation.prototype.divide;

      LongNumberRepresentation.prototype.mod = function(otherNum) {
        return bigIntDivisionAndRemainder(this, otherNum)[1]
      };
      NativeBigIntRepresentation.prototype.mod = NativeBigIntRepresentation.prototype.remainder = function(otherNum) {
        return new NativeBigIntRepresentation(this.value % ensureBigIntInstance(otherNum).value)
      };
      SmallNumberRepresentation.prototype.remainder = SmallNumberRepresentation.prototype.mod = LongNumberRepresentation.prototype.remainder = LongNumberRepresentation.prototype.mod;

      LongNumberRepresentation.prototype.pow = function(exponentNum) {
        var tempResult, base, currentExponent,
            exponentBigInt = ensureBigIntInstance(exponentNum),
            baseValue = this.value,
            exponentValue = exponentBigInt.value;
        if (0 === exponentValue) return bigIntConstants[1];
        if (0 === baseValue) return bigIntConstants[0];
        if (1 === baseValue) return bigIntConstants[1];
        if (-1 === baseValue) return exponentBigInt.isEven() ? bigIntConstants[1] : bigIntConstants[-1];
        if (exponentBigInt.sign) return bigIntConstants[0];
        if (!exponentBigInt.isSmall) throw new Error("The exponent " + exponentBigInt.toString() + " is too large.");
        if (this.isSmall && isWithinSafeIntegerRange(tempResult = Math.pow(baseValue, exponentValue))) return new SmallNumberRepresentation(roundToInteger(tempResult));
        for (base = this, currentExponent = bigIntConstants[1]; !0 & exponentValue && (currentExponent = currentExponent.times(base), --exponentValue), 0 !== exponentValue;) exponentValue /= 2, base = base.square();
        return currentExponent
      };
      SmallNumberRepresentation.prototype.pow = LongNumberRepresentation.prototype.pow;

      NativeBigIntRepresentation.prototype.pow = function(exponentNum) {
        var exponentBigInt = ensureBigIntInstance(exponentNum),
            baseValue = this.value,
            exponentValue = exponentBigInt.value,
            nativeZero = BigInt(0),
            nativeOne = BigInt(1),
            nativeTwo = BigInt(2);
        if (exponentValue === nativeZero) return bigIntConstants[1];
        if (baseValue === nativeZero) return bigIntConstants[0];
        if (baseValue === nativeOne) return bigIntConstants[1];
        if (baseValue === BigInt(-1)) return exponentBigInt.isEven() ? bigIntConstants[1] : bigIntConstants[-1];
        if (exponentBigInt.isNegative()) return new NativeBigIntRepresentation(nativeZero);
        for (var currentBase = this, result = bigIntConstants[1]; (exponentValue & nativeOne) === nativeOne && (result = result.times(currentBase), --exponentValue), exponentValue !== nativeZero;) exponentValue /= nativeTwo, currentBase = currentBase.square();
        return result
      };

      LongNumberRepresentation.prototype.modPow = function(exponentNum, modulusNum) {
        if (exponentNum = ensureBigIntInstance(exponentNum), (modulusNum = ensureBigIntInstance(modulusNum)).isZero()) throw new Error("Cannot take modPow with modulus 0");
        for (var result = bigIntConstants[1], baseMod = this.mod(modulusNum); exponentNum.isPositive();) {
          if (baseMod.isZero()) return bigIntConstants[0];
          exponentNum.isOdd() && (result = result.multiply(baseMod).mod(modulusNum)), exponentNum = exponentNum.divide(2), baseMod = baseMod.square().mod(modulusNum)
        }
        return result
      };
      NativeBigIntRepresentation.prototype.modPow = SmallNumberRepresentation.prototype.modPow = LongNumberRepresentation.prototype.modPow;

      // --- Comparison Operations ---

      LongNumberRepresentation.prototype.compareAbs = function(otherNum) {
        var otherBigInt = ensureBigIntInstance(otherNum),
            thisValue = this.value,
            otherValue = otherBigInt.value;
        return otherBigInt.isSmall ? 1 : compareDigitArrays(thisValue, otherValue)
      };

      SmallNumberRepresentation.prototype.compareAbs = function(otherNum) {
        var otherBigInt = ensureBigIntInstance(otherNum),
            thisValueAbs = Math.abs(this.value),
            otherValue = otherBigInt.value;
        return otherBigInt.isSmall ? thisValueAbs === (otherValue = Math.abs(otherValue)) ? 0 : thisValueAbs > otherValue ? 1 : -1 : -1
      };

      NativeBigIntRepresentation.prototype.compareAbs = function(otherNum) {
        var thisValue = this.value,
            otherValue = ensureBigIntInstance(otherNum).value;
        return (thisValue = thisValue >= 0 ? thisValue : -thisValue) === (otherValue = otherValue >= 0 ? otherValue : -otherValue) ? 0 : thisValue > otherValue ? 1 : -1
      };

      LongNumberRepresentation.prototype.compare = function(otherNum) {
        if (otherNum === 1 / 0) return -1;
        if (otherNum === -1 / 0) return 1;
        var otherBigInt = ensureBigIntInstance(otherNum),
            thisValue = this.value,
            otherValue = otherBigInt.value;
        return this.sign !== otherBigInt.sign ? otherBigInt.sign ? 1 : -1 : otherBigInt.isSmall ? this.sign ? -1 : 1 : compareDigitArrays(thisValue, otherValue) * (this.sign ? -1 : 1)
      };
      LongNumberRepresentation.prototype.compareTo = LongNumberRepresentation.prototype.compare;

      SmallNumberRepresentation.prototype.compare = function(otherNum) {
        if (otherNum === 1 / 0) return -1;
        if (otherNum === -1 / 0) return 1;
        var otherBigInt = ensureBigIntInstance(otherNum),
            thisValue = this.value,
            otherValue = otherBigInt.value;
        return otherBigInt.isSmall ? thisValue == otherValue ? 0 : thisValue > otherValue ? 1 : -1 : thisValue < 0 !== otherBigInt.sign ? thisValue < 0 ? -1 : 1 : thisValue < 0 ? 1 : -1
      };
      SmallNumberRepresentation.prototype.compareTo = SmallNumberRepresentation.prototype.compare;

      NativeBigIntRepresentation.prototype.compare = function(otherNum) {
        if (otherNum === 1 / 0) return -1;
        if (otherNum === -1 / 0) return 1;
        var thisValue = this.value,
            otherValue = ensureBigIntInstance(otherNum).value;
        return thisValue === otherValue ? 0 : thisValue > otherValue ? 1 : -1
      };
      NativeBigIntRepresentation.prototype.compareTo = NativeBigIntRepresentation.prototype.compare;

      LongNumberRepresentation.prototype.equals = function(otherNum) {
        return 0 === this.compare(otherNum)
      };
      NativeBigIntRepresentation.prototype.eq = NativeBigIntRepresentation.prototype.equals = SmallNumberRepresentation.prototype.eq = SmallNumberRepresentation.prototype.equals = LongNumberRepresentation.prototype.eq = LongNumberRepresentation.prototype.equals;

      LongNumberRepresentation.prototype.notEquals = function(otherNum) {
        return 0 !== this.compare(otherNum)
      };
      NativeBigIntRepresentation.prototype.neq = NativeBigIntRepresentation.prototype.notEquals = SmallNumberRepresentation.prototype.neq = SmallNumberRepresentation.prototype.notEquals = LongNumberRepresentation.prototype.neq = LongNumberRepresentation.prototype.notEquals;

      LongNumberRepresentation.prototype.greater = function(otherNum) {
        return this.compare(otherNum) > 0
      };
      NativeBigIntRepresentation.prototype.gt = NativeBigIntRepresentation.prototype.greater = SmallNumberRepresentation.prototype.gt = SmallNumberRepresentation.prototype.greater = LongNumberRepresentation.prototype.gt = LongNumberRepresentation.prototype.greater;

      LongNumberRepresentation.prototype.lesser = function(otherNum) {
        return this.compare(otherNum) < 0
      };
      NativeBigIntRepresentation.prototype.lt = NativeBigIntRepresentation.prototype.lesser = SmallNumberRepresentation.prototype.lt = SmallNumberRepresentation.prototype.lesser = LongNumberRepresentation.prototype.lt = LongNumberRepresentation.prototype.lesser;

      LongNumberRepresentation.prototype.greaterOrEquals = function(otherNum) {
        return this.compare(otherNum) >= 0
      };
      NativeBigIntRepresentation.prototype.geq = NativeBigIntRepresentation.prototype.greaterOrEquals = SmallNumberRepresentation.prototype.geq = SmallNumberRepresentation.prototype.greaterOrEquals = LongNumberRepresentation.prototype.geq = LongNumberRepresentation.prototype.greaterOrEquals;

      LongNumberRepresentation.prototype.lesserOrEquals = function(otherNum) {
        return this.compare(otherNum) <= 0
      };
      NativeBigIntRepresentation.prototype.leq = NativeBigIntRepresentation.prototype.lesserOrEquals = SmallNumberRepresentation.prototype.leq = SmallNumberRepresentation.prototype.lesserOrEquals = LongNumberRepresentation.prototype.leq = LongNumberRepresentation.prototype.lesserOrEquals;

      // --- Property Checks ---

      LongNumberRepresentation.prototype.isEven = function() {
        return 0 == (1 & this.value[0])
      };

      SmallNumberRepresentation.prototype.isEven = function() {
        return 0 == (1 & this.value)
      };

      NativeBigIntRepresentation.prototype.isEven = function() {
        return (this.value & BigInt(1)) === BigInt(0)
      };

      LongNumberRepresentation.prototype.isOdd = function() {
        return 1 == (1 & this.value[0])
      };

      SmallNumberRepresentation.prototype.isOdd = function() {
        return 1 == (1 & this.value)
      };

      NativeBigIntRepresentation.prototype.isOdd = function() {
        return (this.value & BigInt(1)) === BigInt(1)
      };

      LongNumberRepresentation.prototype.isPositive = function() {
        return !this.sign
      };

      SmallNumberRepresentation.prototype.isPositive = function() {
        return this.value > 0
      };
      NativeBigIntRepresentation.prototype.isPositive = SmallNumberRepresentation.prototype.isPositive;

      LongNumberRepresentation.prototype.isNegative = function() {
        return this.sign
      };

      SmallNumberRepresentation.prototype.isNegative = function() {
        return this.value < 0
      };
      NativeBigIntRepresentation.prototype.isNegative = SmallNumberRepresentation.prototype.isNegative;

      LongNumberRepresentation.prototype.isUnit = function() {
        return !1
      };

      SmallNumberRepresentation.prototype.isUnit = function() {
        return 1 === Math.abs(this.value)
      };

      NativeBigIntRepresentation.prototype.isUnit = function() {
        return this.abs().value === BigInt(1)
      };

      LongNumberRepresentation.prototype.isZero = function() {
        return !1
      };

      SmallNumberRepresentation.prototype.isZero = function() {
        return 0 === this.value
      };

      NativeBigIntRepresentation.prototype.isZero = function() {
        return this.value === BigInt(0)
      };

      LongNumberRepresentation.prototype.isDivisibleBy = function(otherNum) {
        var otherBigInt = ensureBigIntInstance(otherNum);
        return !otherBigInt.isZero() && (!!otherBigInt.isUnit() || (0 === otherBigInt.compareAbs(2) ? this.isEven() : this.mod(otherBigInt).isZero()))
      };
      NativeBigIntRepresentation.prototype.isDivisibleBy = SmallNumberRepresentation.prototype.isDivisibleBy = LongNumberRepresentation.prototype.isDivisibleBy;

      LongNumberRepresentation.prototype.isPrime = function(isStrong) {
        var checkResult = isSmallPrimeCandidate(this);
        if (void 0 !== checkResult) return checkResult;
        var absValue = this.abs(),
            numBitLength = absValue.bitLength();
        if (numBitLength <= 64) return millerRabinTest(absValue, [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37]);
        for (var numWitnesses = Math.ceil(!0 === isStrong ? 2 * Math.pow(Math.log(2) * numBitLength.toJSNumber(), 2) : Math.log(2) * numBitLength.toJSNumber()),
                 witnessArray = [], witnessIndex = 0; witnessIndex < numWitnesses; witnessIndex++) witnessArray.push(bigIntFactory(witnessIndex + 2));
        return millerRabinTest(absValue, witnessArray)
      };
      NativeBigIntRepresentation.prototype.isPrime = SmallNumberRepresentation.prototype.isPrime = LongNumberRepresentation.prototype.isPrime;

      LongNumberRepresentation.prototype.isProbablePrime = function(numIterations) {
        var checkResult = isSmallPrimeCandidate(this);
        if (void 0 !== checkResult) return checkResult;
        for (var absValue = this.abs(),
                 iterations = void 0 === numIterations ? 5 : numIterations,
                 witnesses = [], witnessIndex = 0; witnessIndex < iterations; witnessIndex++) witnesses.push(bigIntFactory.randBetween(2, absValue.minus(2)));
        return millerRabinTest(absValue, witnesses)
      };
      NativeBigIntRepresentation.prototype.isProbablePrime = SmallNumberRepresentation.prototype.isProbablePrime = LongNumberRepresentation.prototype.isProbablePrime;

      LongNumberRepresentation.prototype.modInv = function(modulusNum) {
        for (var quotient, oldRemainder, newRemainder,
                 inverse = bigIntFactory.zero,
                 prevInverse = bigIntFactory.one,
                 currentModulus = ensureBigIntInstance(modulusNum),
                 absoluteThis = this.abs(); !absoluteThis.isZero();)
          quotient = currentModulus.divide(absoluteThis),
              oldRemainder = inverse,
              newRemainder = currentModulus,
              inverse = prevInverse,
              currentModulus = absoluteThis,
              prevInverse = oldRemainder.subtract(quotient.multiply(prevInverse)),
              absoluteThis = newRemainder.subtract(quotient.multiply(absoluteThis));
        if (!currentModulus.isUnit()) throw new Error(this.toString() + " and " + modulusNum.toString() + " are not co-prime");
        return -1 === inverse.compare(0) && (inverse = inverse.add(modulusNum)), this.isNegative() ? inverse.negate() : inverse
      };
      NativeBigIntRepresentation.prototype.modInv = SmallNumberRepresentation.prototype.modInv = LongNumberRepresentation.prototype.modInv;

      LongNumberRepresentation.prototype.next = function() {
        var currentDigits = this.value;
        return this.sign ? subtractNumberFromDigitArray(currentDigits, 1, this.sign) : new LongNumberRepresentation(addNumberToDigitArray(currentDigits, 1), this.sign)
      };

      SmallNumberRepresentation.prototype.next = function() {
        var currentValue = this.value;
        return currentValue + 1 < maxSafeJSInteger ? new SmallNumberRepresentation(currentValue + 1) : new LongNumberRepresentation(maxSafeJSIntegerAsDigits, !1)
      };

      NativeBigIntRepresentation.prototype.next = function() {
        return new NativeBigIntRepresentation(this.value + BigInt(1))
      };

      LongNumberRepresentation.prototype.prev = function() {
        var currentDigits = this.value;
        return this.sign ? new LongNumberRepresentation(addNumberToDigitArray(currentDigits, 1), !0) : subtractNumberFromDigitArray(currentDigits, 1, this.sign)
      };

      SmallNumberRepresentation.prototype.prev = function() {
        var currentValue = this.value;
        return currentValue - 1 > -maxSafeJSInteger ? new SmallNumberRepresentation(currentValue - 1) : new LongNumberRepresentation(maxSafeJSIntegerAsDigits, !0)
      };

      NativeBigIntRepresentation.prototype.prev = function() {
        return new NativeBigIntRepresentation(this.value - BigInt(1))
      };

      // --- Bitwise Operations ---

      // Precomputed powers of 2 for shift operations
      for (var powerOfTwoFactors = [1]; 2 * powerOfTwoFactors[powerOfTwoFactors.length - 1] <= baseTenMillion;) powerOfTwoFactors.push(2 * powerOfTwoFactors[powerOfTwoFactors.length - 1]);
      var numPowerFactors = powerOfTwoFactors.length,
          maxPowerFactor = powerOfTwoFactors[numPowerFactors - 1];

      /**
       * Checks if a shift amount is small enough for direct JS number conversion.
       * @param {number} shiftAmount The shift amount.
       * @returns {boolean} True if small enough, false otherwise.
       */
      function isSmallEnoughForShift(shiftAmount) {
        return Math.abs(shiftAmount) <= baseTenMillion
      }

      /**
       * Performs a bitwise operation on two BigInts.
       * @param {BigInt} num1 The first BigInt.
       * @param {BigInt} num2 The second BigInt.
       * @param {function(number, number): number} operation The bitwise operation function.
       * @returns {BigInt} The result.
       */
      function performBitwiseOperation(num1, num2, operation) {
        num1 = ensureBigIntInstance(num1), num2 = ensureBigIntInstance(num2);
        var isNum1Negative = num1.isNegative(),
            isNum2Negative = num2.isNegative(),
            absNum1 = isNum1Negative ? num1.not() : num1,
            absNum2 = isNum2Negative ? num2.not() : num2,
            num1Remainder = 0,
            num2Remainder = 0,
            remainderResults = null,
            otherRemainderResults = null,
            resultDigits = [];
        for (; !absNum1.isZero() || !absNum2.isZero();)
          num1Remainder = (remainderResults = bigIntDivisionAndRemainder(absNum1, maxPowerFactor))[1].toJSNumber(),
              isNum1Negative && (num1Remainder = maxPowerFactor - 1 - num1Remainder),
              num2Remainder = (otherRemainderResults = bigIntDivisionAndRemainder(absNum2, maxPowerFactor))[1].toJSNumber(),
              isNum2Negative && (num2Remainder = maxPowerFactor - 1 - num2Remainder),
              absNum1 = remainderResults[0],
              absNum2 = otherRemainderResults[0],
              resultDigits.push(operation(num1Remainder, num2Remainder));
        for (var finalResult = 0 !== operation(isNum1Negative ? 1 : 0, isNum2Negative ? 1 : 0) ? bigIntFactory(-1) : bigIntFactory(0),
                 i = resultDigits.length - 1; i >= 0; i -= 1) finalResult = finalResult.multiply(maxPowerFactor).add(bigIntFactory(resultDigits[i]));
        return finalResult
      }

      LongNumberRepresentation.prototype.shiftLeft = function(shiftAmount) {
        var shiftBigInt = ensureBigIntInstance(shiftAmount).toJSNumber();
        if (!isSmallEnoughForShift(shiftBigInt)) throw new Error(String(shiftBigInt) + " is too large for shifting.");
        if (shiftBigInt < 0) return this.shiftRight(-shiftBigInt);
        var currentBigInt = this;
        if (currentBigInt.isZero()) return currentBigInt;
        for (; shiftBigInt >= numPowerFactors;) currentBigInt = currentBigInt.multiply(maxPowerFactor), shiftBigInt -= numPowerFactors - 1;
        return currentBigInt.multiply(powerOfTwoFactors[shiftBigInt])
      };
      NativeBigIntRepresentation.prototype.shiftLeft = SmallNumberRepresentation.prototype.shiftLeft = LongNumberRepresentation.prototype.shiftLeft;

      LongNumberRepresentation.prototype.shiftRight = function(shiftAmount) {
        var divisionResult,
            shiftBigInt = ensureBigIntInstance(shiftAmount).toJSNumber();
        if (!isSmallEnoughForShift(shiftBigInt)) throw new Error(String(shiftBigInt) + " is too large for shifting.");
        if (shiftBigInt < 0) return this.shiftLeft(-shiftBigInt);
        for (var currentBigInt = this; shiftBigInt >= numPowerFactors;) {
          if (currentBigInt.isZero() || currentBigInt.isNegative() && currentBigInt.isUnit()) return currentBigInt;
          currentBigInt = (divisionResult = bigIntDivisionAndRemainder(currentBigInt, maxPowerFactor))[1].isNegative() ? divisionResult[0].prev() : divisionResult[0], shiftBigInt -= numPowerFactors - 1
        }
        return (divisionResult = bigIntDivisionAndRemainder(currentBigInt, powerOfTwoFactors[shiftBigInt]))[1].isNegative() ? divisionResult[0].prev() : divisionResult[0]
      };
      NativeBigIntRepresentation.prototype.shiftRight = SmallNumberRepresentation.prototype.shiftRight = LongNumberRepresentation.prototype.shiftRight;

      LongNumberRepresentation.prototype.not = function() {
        return this.negate().prev()
      };
      NativeBigIntRepresentation.prototype.not = SmallNumberRepresentation.prototype.not = LongNumberRepresentation.prototype.not;

      LongNumberRepresentation.prototype.and = function(otherNum) {
        return performBitwiseOperation(this, otherNum, function(a, b) {
          return a & b
        })
      };
      NativeBigIntRepresentation.prototype.and = SmallNumberRepresentation.prototype.and = LongNumberRepresentation.prototype.and;

      LongNumberRepresentation.prototype.or = function(otherNum) {
        return performBitwiseOperation(this, otherNum, function(a, b) {
          return a | b
        })
      };
      NativeBigIntRepresentation.prototype.or = SmallNumberRepresentation.prototype.or = LongNumberRepresentation.prototype.or;

      LongNumberRepresentation.prototype.xor = function(otherNum) {
        return performBitwiseOperation(this, otherNum, function(a, b) {
          return a ^ b
        })
      };
      NativeBigIntRepresentation.prototype.xor = SmallNumberRepresentation.prototype.xor = LongNumberRepresentation.prototype.xor;

      // Constants for bit length calculation
      var bitLengthConstantC = 1 << 30,
          magicBitMask = (baseTenMillion & -baseTenMillion) * (baseTenMillion & -baseTenMillion) | bitLengthConstantC;

      /**
       * Computes the lowest set bit for a BigInt value.
       * @param {BigInt} bigNum The BigInt.
       * @returns {number|BigInt} The lowest set bit.
       */
      function computeLowestSetBit(bigNum) {
        var value = bigNum.value,
            result = "number" == typeof value ? value | bitLengthConstantC : "bigint" == typeof value ? value | BigInt(bitLengthConstantC) : value[0] + value[1] * baseTenMillion | magicBitMask;
        return result & -result
      }

      /**
       * Finds the maximum of two BigInts.
       * @param {BigInt} num1 The first BigInt.
       * @param {BigInt} num2 The second BigInt.
       * @returns {BigInt} The larger BigInt.
       */
      function findMaximumBigInt(num1, num2) {
        return num1 = ensureBigIntInstance(num1), num2 = ensureBigIntInstance(num2), num1.greater(num2) ? num1 : num2
      }

      /**
       * Finds the minimum of two BigInts.
       * @param {BigInt} num1 The first BigInt.
       * @param {BigInt} num2 The second BigInt.
       * @returns {BigInt} The smaller BigInt.
       */
      function findMinimumBigInt(num1, num2) {
        return num1 = ensureBigIntInstance(num1), num2 = ensureBigIntInstance(num2), num1.lesser(num2) ? num1 : num2
      }

      /**
       * Calculates the greatest common divisor (GCD) of two BigInts.
       * @param {BigInt} num1 The first BigInt.
       * @param {BigInt} num2 The second BigInt.
       * @returns {BigInt} The GCD.
       */
      function calculateGCD(num1, num2) {
        if (num1 = ensureBigIntInstance(num1).abs(), num2 = ensureBigIntInstance(num2).abs(), num1.equals(num2)) return num1;
        if (num1.isZero()) return num2;
        if (num2.isZero()) return num1;
        for (var lowestSetBit, tempNum, commonFactors = bigIntConstants[1]; num1.isEven() && num2.isEven();)
          lowestSetBit = findMinimumBigInt(computeLowestSetBit(num1), computeLowestSetBit(num2)),
              num1 = num1.divide(lowestSetBit),
              num2 = num2.divide(lowestSetBit),
              commonFactors = commonFactors.multiply(lowestSetBit);
        for (; num1.isEven();) num1 = num1.divide(computeLowestSetBit(num1));
        do {
          for (; num2.isEven();) num2 = num2.divide(computeLowestSetBit(num2));
          num1.greater(num2) && (tempNum = num2, num2 = num1, num1 = tempNum), num2 = num2.subtract(num1)
        } while (!num2.isZero());
        return commonFactors.isUnit() ? num1 : num1.multiply(commonFactors)
      }

      LongNumberRepresentation.prototype.bitLength = function() {
        var currentNum = this;
        return currentNum.compareTo(bigIntFactory(0)) < 0 && (currentNum = currentNum.negate().subtract(bigIntFactory(1))),
            0 === currentNum.compareTo(bigIntFactory(0)) ? bigIntFactory(0) : bigIntFactory(function getPower(number, base) {
              if (base.compareTo(number) <= 0) {
                var squaredBaseResult = getPower(number, base.square(base)),
                    powerValue = squaredBaseResult.p,
                    exponentValue = squaredBaseResult.e,
                    product = powerValue.multiply(base);
                return product.compareTo(number) <= 0 ? {
                  p: product,
                  e: 2 * exponentValue + 1
                } : {
                  p: powerValue,
                  e: 2 * exponentValue
                }
              }
              return {
                p: bigIntFactory(1),
                e: 0
              }
            }(currentNum, bigIntFactory(2)).e).add(bigIntFactory(1))
      };
      NativeBigIntRepresentation.prototype.bitLength = SmallNumberRepresentation.prototype.bitLength = LongNumberRepresentation.prototype.bitLength;

      /**
       * Parses a string representation of a BigInt from a given base.
       * @param {string} inputString The string to parse.
       * @param {number} base The base of the input string.
       * @param {boolean} isSigned Whether the number is signed.
       * @param {boolean} [isCaseSensitive] Whether base digits are case-sensitive.
       * @returns {BigInt} The parsed BigInt.
       */
      var parseStringWithBase = function(inputString, base, isSigned, isCaseSensitive) {
        isSigned = isSigned || base36Digits;
        inputString = String(inputString);
        isCaseSensitive || (inputString = inputString.toLowerCase(), isSigned = isSigned.toLowerCase());
        var charCode, charMap = {},
            inputLength = inputString.length,
            parsedBase = Math.abs(base);
        for (charCode = 0; charCode < isSigned.length; charCode++) charMap[isSigned[charCode]] = charCode;
        for (charCode = 0; charCode < inputLength; charCode++) {
          var currentChar;
          if ("-" !== (currentChar = inputString[charCode]) && (currentChar in charMap && charMap[currentChar] >= parsedBase)) {
            if ("1" === currentChar && 1 === parsedBase) continue; // Special case for base 1
            throw new Error(currentChar + " is not a valid digit in base " + base + ".")
          }
        }
        base = ensureBigIntInstance(base);
        var digitArray = [],
            isNegative = "-" === inputString[0];
        for (charCode = isNegative ? 1 : 0; charCode < inputString.length; charCode++) {
          var charVal;
          if ((charVal = inputString[charCode]) in charMap) digitArray.push(ensureBigIntInstance(charMap[charVal]));
          else {
            if ("<" !== charVal) throw new Error(charVal + " is not a valid character");
            var startIdx = charCode;
            do {
              charCode++
            } while (">" !== inputString[charCode] && charCode < inputString.length);
            digitArray.push(ensureBigIntInstance(inputString.slice(startIdx + 1, charCode)))
          }
        }
        return convertDigitArrayToBase(digitArray, base, isNegative)
      };

      /**
       * Converts an array of BigInt digits in a given base to a BigInt.
       * @param {BigInt[]} digitArray The array of BigInt digits.
       * @param {BigInt} base The base of the digits.
       * @param {boolean} isNegative Whether the number is negative.
       * @returns {BigInt} The resulting BigInt.
       */
      function convertDigitArrayToBase(digitArray, base, isNegative) {
        var index, result = bigIntConstants[0],
            power = bigIntConstants[1];
        for (index = digitArray.length - 1; index >= 0; index--) result = result.add(digitArray[index].times(power)), power = power.times(base);
        return isNegative ? result.negate() : result
      }

      /**
       * Converts a BigInt to an array of digits in a specified base.
       * @param {BigInt} bigNum The BigInt to convert.
       * @param {BigInt} base The target base.
       * @returns {{value: number[], isNegative: boolean}} Object containing the digit array and sign.
       */
      function convertBigIntToArray(bigNum, base) {
        if ((base = bigIntFactory(base)).isZero()) {
          if (bigNum.isZero()) return {
            value: [0],
            isNegative: !1
          };
          throw new Error("Cannot convert nonzero numbers to base 0.")
        }
        if (base.equals(-1)) {
          if (bigNum.isZero()) return {
            value: [0],
            isNegative: !1
          };
          if (bigNum.isNegative()) return {
            value: [].concat.apply([], Array.apply(null, Array(-bigNum.toJSNumber())).map(Array.prototype.valueOf, [1, 0])),
            isNegative: !1
          };
          var sequence = Array.apply(null, Array(bigNum.toJSNumber() - 1)).map(Array.prototype.valueOf, [0, 1]);
          return sequence.unshift([1]), {
            value: [].concat.apply([], sequence),
            isNegative: !1
          }
        }
        var isResultNegative = !1;
        if (bigNum.isNegative() && base.isPositive() && (isResultNegative = !0, bigNum = bigNum.abs()), base.isUnit())
          return bigNum.isZero() ? {
            value: [0],
            isNegative: !1
          } : {
            value: Array.apply(null, Array(bigNum.toJSNumber())).map(Number.prototype.valueOf, 1),
            isNegative: isResultNegative
          };
        for (var divisionResult, digits = [], currentNum = bigNum; currentNum.isNegative() || currentNum.compareAbs(base) >= 0;)
          divisionResult = currentNum.divmod(base), currentNum = divisionResult.quotient;
        var remainder = divisionResult.remainder;
        return remainder.isNegative() && (remainder = base.minus(remainder).abs(), currentNum = currentNum.next()), digits.push(remainder.toJSNumber()), digits.push(currentNum.toJSNumber()), {
          value: digits.reverse(),
          isNegative: isResultNegative
        }
      }

      /**
       * Formats a BigInt to a string in a specified base.
       * @param {BigInt} bigNum The BigInt to format.
       * @param {number} base The target base.
       * @param {string} [digitChars] Custom characters for digits.
       * @returns {string} The formatted string.
       */
      function formatBigIntToBaseString(bigNum, base, digitChars) {
        var conversionResult = convertBigIntToArray(bigNum, base);
        return (conversionResult.isNegative ? "-" : "") + conversionResult.value.map(function(digit) {
          return function(digitValue, chars) {
            return digitValue < (chars = chars || base36Digits).length ? chars[digitValue] : "<" + digitValue + ">"
          }(digit, digitChars)
        }).join("")
      }

      /**
       * Parses a string into a BigInt, handling scientific notation and validation.
       * @param {string} inputString The string to parse.
       * @returns {SmallNumberRepresentation|LongNumberRepresentation|NativeBigIntRepresentation} The parsed BigInt.
       */
      function parseBigIntFromString(inputString) {
        if (isWithinSafeIntegerRange(+inputString)) {
          var numValue = +inputString;
          if (numValue === roundToInteger(numValue)) return supportsNativeBigInt ? new NativeBigIntRepresentation(BigInt(numValue)) : new SmallNumberRepresentation(numValue);
          throw new Error("Invalid integer: " + inputString)
        }
        var isNegative = "-" === inputString[0];
        isNegative && (inputString = inputString.slice(1));
        var parts = inputString.split(/e/i);
        if (parts.length > 2) throw new Error("Invalid integer: " + parts.join("e"));
        if (2 === parts.length) {
          var exponentPart = parts[1];
          if ("+" === exponentPart[0] && (exponentPart = exponentPart.slice(1)), (exponentPart = +exponentPart) !== roundToInteger(exponentPart) || !isWithinSafeIntegerRange(exponentPart)) throw new Error("Invalid integer: " + exponentPart + " is not a valid exponent.");
          var basePart = parts[0],
              decimalPointIndex = basePart.indexOf(".");
          decimalPointIndex >= 0 && (exponentPart -= basePart.length - decimalPointIndex - 1, basePart = basePart.slice(0, decimalPointIndex) + basePart.slice(decimalPointIndex + 1)),
          exponentPart < 0 && (basePart = basePart.slice(0, basePart.length + exponentPart), exponentPart = 0), // Handle negative exponents by truncating/rounding
          exponentPart < 0 && (basePart = "0"); // If exponent is negative, and no digits left, it's 0.
          if (exponentPart < 0) throw new Error("Cannot include negative exponent part for integers");
          inputString = basePart += new Array(exponentPart + 1).join("0")
        }
        if (!/^([0-9][0-9]*)$/.test(inputString)) throw new Error("Invalid integer: " + inputString);
        if (supportsNativeBigInt) return new NativeBigIntRepresentation(BigInt(isNegative ? "-" + inputString : inputString));
        for (var digitArray = [],
                 strLength = inputString.length,
                 groupSize = digitGroupSize,
                 currentLength = strLength - groupSize; strLength > 0;)
          digitArray.push(+inputString.slice(currentLength, strLength)),
              (currentLength -= groupSize) < 0 && (currentLength = 0),
              strLength -= groupSize;
        return trimLeadingZeros(digitArray), new LongNumberRepresentation(digitArray, isNegative)
      }

      /**
       * Ensures a value is a BigInt instance.
       * @param {number|string|BigInt|LongNumberRepresentation|SmallNumberRepresentation|NativeBigIntRepresentation} value The value to convert.
       * @returns {LongNumberRepresentation|SmallNumberRepresentation|NativeBigIntRepresentation} A BigInt instance.
       */
      function ensureBigIntInstance(value) {
        return "number" == typeof value ? function(num) {
          if (supportsNativeBigInt) return new NativeBigIntRepresentation(BigInt(num));
          if (isWithinSafeIntegerRange(num)) {
            if (num !== roundToInteger(num)) throw new Error(num + " is not an integer.");
            return new SmallNumberRepresentation(num)
          }
          return parseBigIntFromString(num.toString())
        }(value) : "string" == typeof value ? parseBigIntFromString(value) : "bigint" == typeof value ? new NativeBigIntRepresentation(value) : value
      }

      // --- Conversion Methods ---

      LongNumberRepresentation.prototype.toArray = function(base) {
        return convertBigIntToArray(this, base)
      };
      SmallNumberRepresentation.prototype.toArray = function(base) {
        return convertBigIntToArray(this, base)
      };
      NativeBigIntRepresentation.prototype.toArray = function(base) {
        return convertBigIntToArray(this, base)
      };

      LongNumberRepresentation.prototype.toString = function(base, digitChars) {
        if (void 0 === base && (base = 10), 10 !== base) return formatBigIntToBaseString(this, base, digitChars);
        for (var digitString, resultString = "",
                 currentDigits = this.value,
                 arrayLength = currentDigits.length,
                 i = String(currentDigits[--arrayLength]); --arrayLength >= 0;)
          digitString = String(currentDigits[arrayLength]), resultString += "0000000".slice(digitString.length) + digitString;
        return (this.sign ? "-" : "") + i
      };

      SmallNumberRepresentation.prototype.toString = function(base, digitChars) {
        return void 0 === base && (base = 10), 10 != base ? formatBigIntToBaseString(this, base, digitChars) : String(this.value)
      };
      NativeBigIntRepresentation.prototype.toString = SmallNumberRepresentation.prototype.toString;

      NativeBigIntRepresentation.prototype.toJSON = LongNumberRepresentation.prototype.toJSON = SmallNumberRepresentation.prototype.toJSON = function() {
        return this.toString()
      };

      LongNumberRepresentation.prototype.valueOf = function() {
        return parseInt(this.toString(), 10)
      };
      LongNumberRepresentation.prototype.toJSNumber = LongNumberRepresentation.prototype.valueOf;

      SmallNumberRepresentation.prototype.valueOf = function() {
        return this.value
      };
      SmallNumberRepresentation.prototype.toJSNumber = SmallNumberRepresentation.prototype.valueOf;

      NativeBigIntRepresentation.prototype.valueOf = NativeBigIntRepresentation.prototype.toJSNumber = function() {
        return parseInt(this.toString(), 10)
      };

      // Pre-populate common BigInt constants (0-999 and their negatives)
      for (var precomputedBigIntConstants = 0; precomputedBigIntConstants < 1e3; precomputedBigIntConstants++)
        constructBigInt[precomputedBigIntConstants] = ensureBigIntInstance(precomputedBigIntConstants),
        precomputedBigIntConstants > 0 && (constructBigInt[-precomputedBigIntConstants] = ensureBigIntInstance(-precomputedBigIntConstants));

      // Export common BigInt constants and utility functions
      constructBigInt.one = constructBigInt[1];
      constructBigInt.zero = constructBigInt[0];
      constructBigInt.minusOne = constructBigInt[-1];
      constructBigInt.max = findMaximumBigInt;
      constructBigInt.min = findMinimumBigInt;
      constructBigInt.gcd = calculateGCD;
      constructBigInt.lcm = function(num1, num2) {
        return num1 = ensureBigIntInstance(num1).abs(), num2 = ensureBigIntInstance(num2).abs(), num1.divide(calculateGCD(num1, num2)).multiply(num2)
      };
      constructBigInt.isInstance = function(obj) {
        return obj instanceof LongNumberRepresentation || obj instanceof SmallNumberRepresentation || obj instanceof NativeBigIntRepresentation
      };
      constructBigInt.randBetween = function(lowerBound, upperBound) {
        var minNum = findMinimumBigInt(lowerBound = ensureBigIntInstance(lowerBound), upperBound = ensureBigIntInstance(upperBound)),
            range = findMaximumBigInt(lowerBound, upperBound).subtract(minNum).add(1);
        if (range.isSmall) return minNum.add(Math.floor(Math.random() * range));
        for (var rangeDigits = convertBigIntToArray(range, baseTenMillion).value,
                 randomDigits = [], allowLeadingZeros = !0, i = 0; i < rangeDigits.length; i++) {
          var limit = allowLeadingZeros ? rangeDigits[i] : baseTenMillion,
              randomDigit = roundToInteger(Math.random() * limit);
          randomDigits.push(randomDigit), randomDigit < limit && (allowLeadingZeros = !1)
        }
        return minNum.add(constructBigInt.fromArray(randomDigits, baseTenMillion, !1))
      };
      constructBigInt.fromArray = function(digitArray, base, isNegative) {
        return convertDigitArrayToBase(digitArray.map(ensureBigIntInstance), ensureBigIntInstance(base || 10), isNegative)
      };

      // Expose the main factory function
      return constructBigInt
    }();

    // Export the big-integer library
    "undefined" != typeof module && module.hasOwnProperty("exports") && (currentModule.exports = bigIntFactory);
    // Support AMD if available
    "function" == typeof define && define.amd && define("big-integer", [], function() {
      return bigIntFactory
    })
  }, {}],
  "Focm": [function(requiredPath, currentModule, exportsObj) {
    // This module defines the main application logic, likely for a programming contest problem.

    var psRuntime = {};

    // Begin Purescript generated code emulation
    !function(psNamespace) {
      "use strict";
      var SemigroupoidConstructor = function(composeFunction) {
        this.compose = composeFunction
      },
          semigroupoidInstance = new SemigroupoidConstructor(function(func1) {
            return function(func2) {
              return function(arg) {
                return func1(func2(arg))
              }
            }
          });
      psNamespace.compose = function(semigroupoid) {
        return semigroupoid.compose
      }, psNamespace.Semigroupoid = SemigroupoidConstructor, psNamespace.semigroupoidFn = semigroupoidInstance
    }(psRuntime["Control.Semigroupoid"] = psRuntime["Control.Semigroupoid"] || {}),
        function(psNamespace) {
          "use strict";
          var semigrpNamespace = psRuntime["Control.Semigroupoid"],
              CategoryConstructor = function(semigroupoidZero, identityFunction) {
                this.Semigroupoid0 = semigroupoidZero, this.identity = identityFunction
              },
              categoryInstanceFn = new CategoryConstructor(function() {
                return semigrpNamespace.semigroupoidFn
              }, function(arg) {
                return arg
              });
          psNamespace.Category = CategoryConstructor, psNamespace.identity = function(category) {
            return category.identity
          }, psNamespace.categoryFn = categoryInstanceFn
        }(psRuntime["Control.Category"] = psRuntime["Control.Category"] || {}),
        function(psNamespace) {
          "use strict";
          (psRuntime["Data.Eq"] = psRuntime["Data.Eq"] || {}).refEq = function(val1) {
            return function(val2) {
              return val1 === val2
            }
          }
        }(),
        function(psNamespace) {
          "use strict";
          (psRuntime["Data.Unit"] = psNamespace["Data.Unit"] || {}).unit = {}
        }(),
        function(psNamespace) {
          "use strict";
          psRuntime["Data.Show"], psRuntime["Data.Symbol"], psRuntime["Record.Unsafe"], psRuntime["Type.Data.RowList"];
          psNamespace.Show = function(showFunction) {
            this.show = showFunction
          }, psNamespace.show = function(showInstance) {
            return showInstance.show
          }
        }(psRuntime["Data.Show"] = psRuntime["Data.Show"] || {}),
        function(psNamespace) {
          "use strict";
          var unitNamespace = psRuntime["Data.Unit"];
          psRuntime["Data.Show"];
          psNamespace.unit = unitNamespace.unit
        }(psRuntime["Data.Unit"] = psRuntime["Data.Unit"] || {}),
        function(psNamespace) {
          "use strict";
          var eqRefNamespace = psRuntime["Data.Eq"],
              EqConstructor = (psRuntime["Data.HeytingAlgebra"], psRuntime["Data.Symbol"], psRuntime["Data.Unit"], psRuntime["Data.Void"], psRuntime["Record.Unsafe"], psRuntime["Type.Data.RowList"], function(eqFunction) {
                this.eq = eqFunction
              }),
              eqInstanceChar = new EqConstructor(eqRefNamespace.refEq),
              eqInstanceBoolean = new EqConstructor(eqRefNamespace.refEq),
              getEqFunction = function(eqInstance) {
                return eqInstance.eq
              };
          psNamespace.Eq = EqConstructor, psNamespace.eq = getEqFunction, psNamespace.notEq = function(eqInstance) {
            return function(val1) {
              return function(val2) {
                return getEqFunction(eqInstance)(val1)(val2)(!1)
              }
            }
          }, psNamespace.eqBoolean = eqInstanceBoolean, psNamespace.eqChar = eqInstanceChar
        }(psRuntime["Data.Eq"] = psRuntime["Data.Eq"] || {}),
        function(psNamespace) {
          "use strict";
          psRuntime["Data.Semigroup"], psRuntime["Data.Symbol"], psRuntime["Data.Unit"], psRuntime["Data.Void"], psRuntime["Record.Unsafe"], psRuntime["Type.Data.RowList"];
          psNamespace.Semigroup = function(appendFunction) {
            this.append = appendFunction
          }, psNamespace.append = function(semigroupInstance) {
            return semigroupInstance.append
          }
        }(psRuntime["Data.Semigroup"] = psNamespace["Data.Semigroup"] || {}),
        function(psNamespace) {
          "use strict";
          psRuntime["Data.Eq"], psRuntime["Data.Semigroup"], psRuntime["Data.Show"];
          var OrderingLT = function() {
            function OrderingLT() {}
            return OrderingLT.value = new OrderingLT, OrderingLT
          }(),
              OrderingGT = function() {
                function OrderingGT() {}
                return OrderingGT.value = new OrderingGT, OrderingGT
              }(),
              OrderingEQ = function() {
                function OrderingEQ() {}
                return OrderingEQ.value = new OrderingEQ, OrderingEQ
              }();
          psNamespace.LT = OrderingLT, psNamespace.GT = OrderingGT, psNamespace.EQ = OrderingEQ
        }(psRuntime["Data.Ordering"] = psRuntime["Data.Ordering"] || {}),
        function(psNamespace) {
          "use strict";
          psRuntime["Data.Ord"], psRuntime["Data.Eq"], psRuntime["Data.Ord.Unsafe"];
          var OrderingNamespace = psRuntime["Data.Ordering"],
              OrdConstructor = (psRuntime["Data.Ring"], psRuntime["Data.Semiring"], psRuntime["Data.Symbol"], psRuntime["Data.Unit"], psRuntime["Data.Void"], psRuntime["Record.Unsafe"], psRuntime["Type.Data.RowList"], function(eqZero, compareFunction) {
                this.Eq0 = eqZero, this.compare = compareFunction
              }),
              getCompareFunction = function(ordInstance) {
                return ordInstance.compare
              };
          psNamespace.Ord = OrdConstructor, psNamespace.compare = getCompareFunction, psNamespace.lessThanOrEq = function(ordInstance) {
            return function(val1) {
              return function(val2) {
                return !(getCompareFunction(ordInstance)(val1)(val2) instanceof OrderingNamespace.GT)
              }
            }
          }
        }(psRuntime["Data.Ord"] = psRuntime["Data.Ord"] || {}),
        function(psNamespace) {
          "use strict";
          psRuntime["Control.Category"], psRuntime["Data.Boolean"], psRuntime["Data.Ord"], psRuntime["Data.Ring"];
          psNamespace.flip = function(func) {
            return function(arg1) {
              return function(arg2) {
                return func(arg2)(arg1)
              }
            }
          }, psNamespace.const = function(val) {
            return function(ignored) {
              return val
            }
          }
        }(psRuntime["Data.Function"] = psRuntime["Data.Function"] || {}),
        function(psNamespace) {
          "use strict";
          psRuntime["Data.Functor"], psRuntime["Control.Semigroupoid"];
          var FunctionNamespace = psRuntime["Data.Function"],
              UnitNamespace = psRuntime["Data.Unit"],
              getMapFunction = function(functor) {
                return functor.map
              };
          psNamespace.Functor = function(mapFunction) {
            this.map = mapFunction
          }, psNamespace.map = getMapFunction, psNamespace.void = function(functorInstance) {
            return getMapFunction(functorInstance)(FunctionNamespace.const(UnitNamespace.unit))
          }
        }(psRuntime["Data.Functor"] = psNamespace["Data.Functor"] || {}),
        function(psNamespace) {
          "use strict";
          psRuntime["Control.Apply"];
          var CategoryNamespace = psRuntime["Control.Category"],
              FunctionNamespace = psRuntime["Data.Function"],
              FunctorNamespace = psRuntime["Data.Functor"],
              getApplyFunction = function(applyInstance) {
                return applyInstance.apply
              };
          psNamespace.Apply = function(functorZero, applyFunction) {
            this.Functor0 = functorZero, this.apply = applyFunction
          }, psNamespace.apply = getApplyFunction, psNamespace.applySecond = function(applyInstance) {
            return function(applyFunc) {
              return function(applyArg) {
                return getApplyFunction(applyInstance)(FunctorNamespace.map(applyInstance.Functor0())(FunctionNamespace.const(CategoryNamespace.identity(CategoryNamespace.categoryFn)))(applyFunc))(applyArg)
              }
            }
          }
        }(psRuntime["Control.Apply"] = psNamespace["Control.Apply"] || {}),
        function(psNamespace) {
          "use strict";
          var ApplyNamespace = psRuntime["Control.Apply"],
              getPureFunction = (psRuntime["Data.Functor"], psRuntime["Data.Unit"], function(applicativeInstance) {
                return applicativeInstance.pure
              });
          psNamespace.Applicative = function(applyZero, pureFunction) {
            this.Apply0 = applyZero, this.pure = pureFunction
          }, psNamespace.pure = getPureFunction, psNamespace.liftA1 = function(applicativeInstance) {
            return function(func) {
              return function(arg) {
                return ApplyNamespace.apply(applicativeInstance.Apply0())(getPureFunction(applicativeInstance)(func))(arg)
              }
            }
          }
        }(psRuntime["Control.Applicative"] = psNamespace["Control.Applicative"] || {}),
        function(psNamespace) {
          "use strict";
          psNamespace["Control.Bind"], psNamespace["Control.Applicative"], psNamespace["Control.Apply"], psNamespace["Control.Category"];
          var FunctionNamespace = psNamespace["Data.Function"],
              getBindFunction = (psNamespace["Data.Functor"], psNamespace["Data.Unit"], function(bindInstance) {
                return bindInstance.bind
              }),
              bindFlippedFunction = function(bindInstance) {
                return FunctionNamespace.flip(getBindFunction(bindInstance))
              };
          psNamespace.Bind = function(applyZero, bindFunction) {
            this.Apply0 = applyZero, this.bind = bindFunction
          }, psNamespace.bind = getBindFunction, psNamespace.bindFlipped = bindFlippedFunction, psNamespace.composeKleisliFlipped = function(bindInstance) {
            return function(func1) {
              return function(func2) {
                return function(arg) {
                  return bindFlippedFunction(bindInstance)(func1)(func2(arg))
                }
              }
            }
          }
        }(psRuntime["Control.Bind"] = psNamespace["Control.Bind"] || {}),
        function(psNamespace) {
          "use strict";
          psNamespace.length = function(arr) {
            return arr.length
          }, psNamespace.indexImpl = function(justConstructor) {
            return function(nothingValue) {
              return function(arr) {
                return function(idx) {
                  return idx < 0 || idx >= arr.length ? nothingValue : justConstructor(arr[idx])
                }
              }
            }
          }, psNamespace.findIndexImpl = function(justConstructor) {
            return function(nothingValue) {
              return function(predicate) {
                return function(arr) {
                  for (var i = 0, len = arr.length; i < len; i++)
                    if (predicate(arr[i])) return justConstructor(i);
                  return nothingValue
                }
              }
            }
          }, psNamespace.slice = function(startIndex) {
            return function(endIndex) {
              return function(arr) {
                return arr.slice(startIndex, endIndex)
              }
            }
          }, psNamespace.take = function(count) {
            return function(arr) {
              return count < 1 ? [] : arr.slice(0, count)
            }
          }
        }(psRuntime["Data.Array"] = psNamespace["Data.Array"] || {}),
        function(psNamespace) {
          "use strict";
          psNamespace.foldrArray = function(func) {
            return function(initialValue) {
              return function(arr) {
                for (var result = initialValue, i = arr.length - 1; i >= 0; i--) result = func(arr[i])(result);
                return result
              }
            }
          }, psNamespace.foldlArray = function(func) {
            return function(initialValue) {
              return function(arr) {
                for (var result = initialValue, len = arr.length, i = 0; i < len; i++) result = func(result)(arr[i]);
                return result
              }
            }
          }
        }(psRuntime["Data.Foldable"] = psNamespace["Data.Foldable"] || {}),
        function(psNamespace) {
          "use strict";
          var ApplicativeNamespace = psNamespace["Control.Applicative"],
              ApplyNamespace = (psNamespace["Control.Apply"], psNamespace["Control.Bind"]),
              MonadConstructor = (psNamespace["Control.Monad"], psNamespace["Data.Functor"], psNamespace["Data.Unit"], function(applicativeZero, bindOne) {
                this.Applicative0 = applicativeZero, this.Bind1 = bindOne
              }),
              MonadEffectInstance = new MonadConstructor(function() {
                return monadEffectApplicative
              }, function() {
                return monadEffectBind
              }),
              monadEffectBind = new ApplyNamespace.Bind(function() {
                return monadEffectApply
              }, requiredPath.bindE),
              monadEffectApply = new ApplicativeNamespace.Apply(function() {
                return monadEffectFunctor
              }, MonadConstructor.ap(MonadEffectInstance)),
              monadEffectApplicative = new ApplicativeNamespace.Applicative(function() {
                return monadEffectApply
              }, requiredPath.pureE),
              monadEffectFunctor = new psNamespace["Data.Functor"].Functor(ApplicativeNamespace.liftA1(monadEffectApplicative));
          psNamespace.Monad = MonadConstructor, psNamespace.ap = function(monadInstance) {
            return function(funcM) {
              return function(argM) {
                return ApplyNamespace.bind(monadInstance.Bind1())(funcM)(function(func) {
                  return ApplyNamespace.bind(monadInstance.Bind1())(argM)(function(arg) {
                    return ApplicativeNamespace.pure(monadInstance.Applicative0())(func(arg))
                  })
                })
              }
            }
          }
        }(psRuntime["Control.Monad"] = psNamespace["Control.Monad"] || {}),
        function(psNamespace) {
          "use strict";
          psNamespace["Data.Boolean"], psNamespace["Data.Eq"], psNamespace["Data.EuclideanRing"], psNamespace["Data.Ord"], psNamespace["Data.Ordering"], psNamespace["Data.Semigroup"], psNamespace["Data.Symbol"], psNamespace["Data.Unit"], psNamespace["Record.Unsafe"], psNamespace["Type.Data.RowList"];
          psNamespace.Monoid = function(semigroupZero, memptyValue) {
            this.Semigroup0 = semigroupZero, this.mempty = memptyValue
          }, psNamespace.mempty = function(monoidInstance) {
            return monoidInstance.mempty
          }
        }(psRuntime["Data.Monoid"] = psNamespace["Data.Monoid"] || {}),
        function(psNamespace) {
          "use strict";
          psNamespace["Control.Alt"], psNamespace["Control.Alternative"], psNamespace["Control.Applicative"];
          var ApplyNamespace = psNamespace["Control.Apply"],
              BindNamespace = psNamespace["Control.Bind"],
              CategoryNamespace = psNamespace["Control.Category"],
              FunctorNamespace = (psNamespace["Control.Extend"], psNamespace["Control.Monad"], psNamespace["Control.MonadZero"], psNamespace["Control.Plus"], psNamespace["Data.Bounded"], psNamespace["Data.Eq"], psNamespace["Data.Function"], psNamespace["Data.Functor"]),
              NothingConstructor = (psNamespace["Data.Functor.Invariant"], psNamespace["Data.Monoid"], psNamespace["Data.Ord"], psNamespace["Data.Ordering"], psNamespace["Data.Semigroup"], psNamespace["Data.Show"], psNamespace["Data.Unit"], psNamespace.Prelude, function() {
                function NothingConstructor() {}
                return NothingConstructor.value = new NothingConstructor, NothingConstructor
              }()),
              JustConstructor = function() {
                function JustConstructor(value) {
                  this.value0 = value
                }
                return JustConstructor.create = function(value) {
                  return new JustConstructor(value)
                }, JustConstructor
              }(),
              maybeFunction = function(nothingResult) {
                return function(justFunction) {
                  return function(maybeValue) {
                    if (maybeValue instanceof NothingConstructor) return nothingResult;
                    if (maybeValue instanceof JustConstructor) return justFunction(maybeValue.value0);
                    throw new Error("Failed pattern match at Data.Maybe (line 217, column 1 - line 217, column 51): " + [nothingResult.constructor.name, justFunction.constructor.name, maybeValue.constructor.name])
                  }
                }
              },
              functorMaybeInstance = new FunctorNamespace.Functor(function(func) {
                return function(maybeValue) {
                  return maybeValue instanceof JustConstructor ? new JustConstructor(func(maybeValue.value0)) : NothingConstructor.value
                }
              }),
              applyMaybeInstance = new ApplyNamespace.Apply(function() {
                return functorMaybeInstance
              }, function(maybeFunc) {
                return function(maybeArg) {
                  if (maybeFunc instanceof JustConstructor) return FunctorNamespace.map(functorMaybeInstance)(maybeFunc.value0)(maybeArg);
                  if (maybeFunc instanceof NothingConstructor) return NothingConstructor.value;
                  throw new Error("Failed pattern match at Data.Maybe (line 67, column 1 - line 67, column 35): " + [maybeFunc.constructor.name, maybeArg.constructor.name])
                }
              }),
              bindMaybeInstance = new BindNamespace.Bind(function() {
                return applyMaybeInstance
              }, function(maybeValue) {
                return function(func) {
                  if (maybeValue instanceof JustConstructor) return func(maybeValue.value0);
                  if (maybeValue instanceof NothingConstructor) return NothingConstructor.value;
                  throw new Error("Failed pattern match at Data.Maybe (line 125, column 1 - line 125, column 33): " + [maybeValue.constructor.name, func.constructor.name])
                }
              });
          psNamespace.Nothing = NothingConstructor, psNamespace.Just = JustConstructor, psNamespace.maybe = maybeFunction, psNamespace.fromMaybe = function(defaultValue) {
            return maybeFunction(defaultValue)(CategoryNamespace.identity(CategoryNamespace.categoryFn))
          }, psNamespace.fromJust = function(maybeValue) {
            return function(maybeVal) {
              if (maybeVal instanceof JustConstructor) return maybeVal.value0;
              throw new Error("Failed pattern match at Data.Maybe (line 268, column 1 - line 268, column 46): " + [maybeVal.constructor.name])
            }
          }, psNamespace.functorMaybe = functorMaybeInstance, psNamespace.applyMaybe = applyMaybeInstance, psNamespace.bindMaybe = bindMaybeInstance
        }(psRuntime["Data.Maybe"] = psNamespace["Data.Maybe"] || {}),
        function(psNamespace) {
          "use strict";
          var FoldableNamespace = psNamespace["Data.Foldable"],
              ApplicativeNamespace = (psNamespace["Control.Alt"], psNamespace["Control.Applicative"]),
              ApplyNamespace = psNamespace["Control.Apply"],
              MonoidNamespace = (psNamespace["Control.Bind"], psNamespace["Control.Category"], psNamespace["Control.Plus"], psNamespace["Control.Semigroupoid"], psNamespace["Data.Eq"], psNamespace["Data.Function"], psNamespace["Data.Functor"], psNamespace["Data.HeytingAlgebra"], psNamespace["Data.Maybe"], psNamespace["Data.Maybe.First"], psNamespace["Data.Maybe.Last"], psNamespace["Data.Monoid"]),
              SemigroupNamespace = (psNamespace["Data.Monoid.Additive"], psNamespace["Data.Monoid.Conj"], psNamespace["Data.Monoid.Disj"], psNamespace["Data.Monoid.Dual"], psNamespace["Data.Monoid.Endo"], psNamespace["Data.Monoid.Multiplicative"], psNamespace["Data.Newtype"], psNamespace["Data.Ord"], psNamespace["Data.Ordering"], psNamespace["Data.Semigroup"]),
              UnitNamespace = (psNamespace["Data.Semiring"], psNamespace["Data.Unit"]),
              FoldableConstructor = (psNamespace.Prelude, function(foldMapFunc, foldlFunc, foldrFunc) {
                this.foldMap = foldMapFunc, this.foldl = foldlFunc, this.foldr = foldrFunc
              }),
              getFoldrFunction = function(foldableInstance) {
                return foldableInstance.foldr
              },
              foldMapDefaultRFunction = function(foldableInstance) {
                return function(semigroupMonoid) {
                  return function(func) {
                    return getFoldrFunction(foldableInstance)(function(elem) {
                      return function(acc) {
                        return SemigroupNamespace.append(semigroupMonoid.Semigroup0())(func(elem))(acc)
                      }
                    })(MonoidNamespace.mempty(semigroupMonoid))
                  }
                }
              },
              foldableArrayInstance = new FoldableConstructor(function(semigroupMonoid) {
                return foldMapDefaultRFunction(foldableArrayInstance)(semigroupMonoid)
              }, FoldableNamespace.foldlArray, FoldableNamespace.foldrArray);
          psNamespace.Foldable = FoldableConstructor, psNamespace.foldr = getFoldrFunction, psNamespace.foldl = function(foldableInstance) {
            return foldableInstance.foldl
          }, psNamespace.foldMap = function(foldableInstance) {
            return foldableInstance.foldMap
          }, psNamespace.foldMapDefaultR = foldMapDefaultRFunction, psNamespace.traverse_ = function(applicativeInstance) {
            return function(foldableInstance) {
              return function(func) {
                return getFoldrFunction(foldableInstance)(function(elem) {
                  return ApplyNamespace.applySecond(applicativeInstance.Apply0())(func(elem))
                })(ApplicativeNamespace.pure(applicativeInstance)(UnitNamespace.unit))
              }
            }
          }, psNamespace.foldableArray = foldableArrayInstance
        }(psRuntime["Data.Foldable"] = psNamespace["Data.Foldable"] || {}),
        function(psNamespace) {
          "use strict";
          (psRuntime["Partial.Unsafe"] = psNamespace["Partial.Unsafe"] || {}).unsafePartial = function(func) {
            return func()
          }
        }(),
        function(psNamespace) {
          "use strict";
          (psRuntime["Partial"] = psNamespace["Partial"] || {}).crashWith = function() {
            return function(message) {
              throw new Error(message)
            }
          }
        }(),
        function(psNamespace) {
          "use strict";
          var PartialNamespace = psNamespace.Partial;
          psNamespace.crashWith = PartialNamespace.crashWith
        }(psRuntime.Partial = psNamespace.Partial || {}),
        function(psNamespace) {
          "use strict";
          var UnsafePartialNamespace = psNamespace["Partial.Unsafe"],
              PartialNamespace = psNamespace.Partial;
          psNamespace.unsafeCrashWith = function(message) {
            return UnsafePartialNamespace.unsafePartial(function(partialFunc) {
              return PartialNamespace.crashWith(partialFunc)(message)
            })
          }
        }(psRuntime["Partial.Unsafe"] = psNamespace["Partial.Unsafe"] || {}),
        function(psNamespace) {
          "use strict";
          (psNamespace["Unsafe.Coerce"] = psNamespace["Unsafe.Coerce"] || {}).unsafeCoerce = function(val) {
            return val
          }
        }(),
        function(psNamespace) {
          "use strict";
          var UnsafeCoerceNamespace = psNamespace["Unsafe.Coerce"];
          psNamespace.unsafeCoerce = UnsafeCoerceNamespace.unsafeCoerce
        }(psRuntime["Unsafe.Coerce"] = psNamespace["Unsafe.Coerce"] || {}),
        function(psNamespace) {
          "use strict";
          var ArrayNamespace = psNamespace["Data.Array"],
              MaybeNamespace = (psNamespace["Control.Alt"], psNamespace["Control.Alternative"], psNamespace["Control.Applicative"], psNamespace["Control.Apply"], psNamespace["Control.Bind"], psNamespace["Control.Category"], psNamespace["Control.Lazy"], psNamespace["Control.Monad.Rec.Class"], psNamespace["Control.Monad.ST"], psNamespace["Control.Monad.ST.Internal"], psNamespace["Control.Semigroupoid"], psNamespace["Data.Array.NonEmpty.Internal"], psNamespace["Data.Array.ST"], psNamespace["Data.Array.ST.Iterator"], psNamespace["Data.Boolean"], psNamespace["Data.Eq"], psNamespace["Data.Foldable"], psNamespace["Data.Function"], psNamespace["Data.Functor"], psNamespace["Data.HeytingAlgebra"], psNamespace["Data.Maybe"]),
              ArrayMaybeIndex = (psNamespace["Data.Ord"], psNamespace["Data.Ordering"], psNamespace["Data.Ring"], psNamespace["Data.Semigroup"], psNamespace["Data.Semiring"], psNamespace["Data.Traversable"], psNamespace["Data.Tuple"], psNamespace["Data.Unfoldable"], psNamespace["Partial.Unsafe"], psNamespace.Prelude, psNamespace["Unsafe.Coerce"], ArrayNamespace.indexImpl(MaybeNamespace.Just.create)(MaybeNamespace.Nothing.value)),
              ArrayMaybeFindIndex = ArrayNamespace.findIndexImpl(MaybeNamespace.Just.create)(MaybeNamespace.Nothing.value);
          psNamespace.head = function(arr) {
            return ArrayMaybeIndex(arr)(0)
          }, psNamespace.last = function(arr) {
            return ArrayMaybeIndex(arr)(ArrayNamespace.length(arr) - 1 | 0)
          }, psNamespace.index = ArrayMaybeIndex, psNamespace.findIndex = ArrayMaybeFindIndex, psNamespace.length = ArrayNamespace.length, psNamespace.take = ArrayNamespace.take
        }(psRuntime["Data.Array"] = psNamespace["Data.Array"] || {}),
        function(psNamespace) {
          var bigIntLibrary = requireModulePath("big-integer");
          psNamespace["fromBase'"] = function(justConstructor) {
            return function(nothingValue) {
              return function(base) {
                return function(numString) {
                  try {
                    var parsedBigInt = bigIntLibrary(numString, base);
                    return justConstructor(parsedBigInt)
                  } catch (error) {
                    return nothingValue
                  }
                }
              }
            }
          }, psNamespace.fromInt = function(num) {
            return bigIntLibrary(num)
          }, psNamespace.toBase = function(base) {
            return function(bigNum) {
              return bigNum.toString(base)
            }
          }, psNamespace.biEquals = function(bigNum1) {
            return function(bigNum2) {
              return bigNum1.equals(bigNum2)
            }
          }, psNamespace.biCompare = function(bigNum1) {
            return function(bigNum2) {
              return bigNum1.compare(bigNum2)
            }
          }
        }(psRuntime["Data.BigInt"] = psNamespace["Data.BigInt"] || {}),
        function(psNamespace) {
          "use strict";
          (psNamespace["Data.Int"] = psNamespace["Data.Int"] || {}).fromStringAsImpl = function(justConstructor) {
            return function(nothingValue) {
              return function(base) {
                var regexCharSet;
                regexCharSet = base < 11 ? "[0-" + (base - 1).toString() + "]" : 11 === base ? "[0-9a]" : "[0-9a-" + String.fromCharCode(86 + base) + "]";
                var regexPattern = new RegExp("^[\\+\\-]?" + regexCharSet + "+$", "i");
                return function(inputString) {
                  if (regexPattern.test(inputString)) {
                    var parsedInt = parseInt(inputString, base);
                    return (0 | parsedInt) === parsedInt ? justConstructor(parsedInt) : nothingValue
                  }
                  return nothingValue
                }
              }
            }
          }
        }(),
        function(psNamespace) {
          "use strict";
          var IntNamespace = psNamespace["Data.Int"],
              MaybeNamespace = (psNamespace["Control.Category"], psNamespace["Control.Semigroupoid"], psNamespace["Data.Boolean"], psNamespace["Data.Bounded"], psNamespace["Data.CommutativeRing"], psNamespace["Data.DivisionRing"], psNamespace["Data.Eq"], psNamespace["Data.EuclideanRing"], psNamespace["Data.HeytingAlgebra"], psNamespace["Data.Int.Bits"], psNamespace["Data.Maybe"]),
              fromStringAsFunction = (psNamespace["Data.Ord"], psNamespace["Data.Ordering"], psNamespace["Data.Ring"], psNamespace["Data.Semiring"], psNamespace["Data.Show"], psNamespace.Global, psNamespace.Math, psNamespace.Prelude, IntNamespace.fromStringAsImpl(MaybeNamespace.Just.create)(MaybeNamespace.Nothing.value)),
              fromStringFunction = fromStringAsFunction(10);
          psNamespace.fromString = fromStringFunction, psNamespace.fromStringAs = fromStringAsFunction
        }(psNamespace["Data.Int"] = psNamespace["Data.Int"] || {}),
        function(psNamespace) {
          "use strict";
          var BigIntNamespace = psNamespace["Data.BigInt"],
              MaybeNamespace = (psNamespace["Control.Semigroupoid"], psNamespace["Data.Array.NonEmpty"], psNamespace["Data.CommutativeRing"], psNamespace["Data.Eq"]),
              OrdNamespace = (psNamespace["Data.EuclideanRing"], psNamespace["Data.Function"], psNamespace["Data.Int"], psNamespace["Data.Maybe"]),
              OrderingNamespace = psNamespace["Data.Ord"],
              EqBigIntInstance = psNamespace["Data.Ordering"],
              OrdBigIntInstance = (psNamespace["Data.Ring"], psNamespace["Data.Semigroup"], psNamespace["Data.Semiring"], psNamespace["Data.Show"], psNamespace["Data.String.NonEmpty"], psNamespace["Data.String.NonEmpty.Internal"], psNamespace["Partial.Unsafe"], psNamespace.Prelude, BigIntNamespace.toBase(10)),
              fromBaseFunction = BigIntNamespace["fromBase'"](OrdNamespace.Just.create)(OrdNamespace.Nothing.value),
              fromStringFunction = fromBaseFunction(10),
              eqBigInt = new MaybeNamespace.Eq(BigIntNamespace.biEquals),
              ordBigInt = new OrderingNamespace.Ord(function() {
                return eqBigInt
              }, function(bigNum1) {
                return function(bigNum2) {
                  var compareResult = BigIntNamespace.biCompare(bigNum1)(bigNum2);
                  return 1 === compareResult ? EqBigIntInstance.GT.value : 0 === compareResult ? EqBigIntInstance.EQ.value : EqBigIntInstance.LT.value
                }
              });
          psNamespace.fromString = fromStringFunction, psNamespace.fromBase = fromBaseFunction, psNamespace.toString = OrdBigIntInstance, psNamespace.eqBigInt = eqBigInt, psNamespace.ordBigInt = ordBigInt, psNamespace.fromInt = BigIntNamespace.fromInt
        }(psNamespace["Data.BigInt"] = psNamespace["Data.BigInt"] || {}),
        function(psNamespace) {
          "use strict";
          psNamespace["Control.Alt"];
          var ApplicativeNamespace = psNamespace["Control.Applicative"],
              ApplyNamespace = psNamespace["Control.Apply"],
              BindNamespace = psNamespace["Control.Bind"],
              FunctorNamespace = (psNamespace["Control.Extend"], psNamespace["Control.Monad"], psNamespace["Control.Semigroupoid"], psNamespace["Data.Bifoldable"], psNamespace["Data.Bifunctor"], psNamespace["Data.Bitraversable"], psNamespace["Data.Bounded"], psNamespace["Data.Eq"], psNamespace["Data.Foldable"], psNamespace["Data.FoldableWithIndex"], psNamespace["Data.Function"], psNamespace["Data.Functor"]),
              LeftConstructor = (psNamespace["Data.Functor.Invariant"], psNamespace["Data.FunctorWithIndex"], psNamespace["Data.Maybe"], psNamespace["Data.Monoid"], psNamespace["Data.Ord"], psNamespace["Data.Ordering"], psNamespace["Data.Semigroup"], psNamespace["Data.Show"], psNamespace["Data.Traversable"], psNamespace["Data.TraversableWithIndex"], psNamespace["Data.Unit"], psNamespace.Prelude, function() {
                function LeftConstructor(value) {
                  this.value0 = value
                }
                return LeftConstructor.create = function(value) {
                  return new LeftConstructor(value)
                }, LeftConstructor
              }()),
              RightConstructor = function() {
                function RightConstructor(value) {
                  this.value0 = value
                }
                return RightConstructor.create = function(value) {
                  return new RightConstructor(value)
                }, RightConstructor
              }(),
              functorEitherInstance = new FunctorNamespace.Functor(function(func) {
                return function(eitherValue) {
                  if (eitherValue instanceof LeftConstructor) return new LeftConstructor(eitherValue.value0);
                  if (eitherValue instanceof RightConstructor) return new RightConstructor(func(eitherValue.value0));
                  throw new Error("Failed pattern match at Data.Either (line 38, column 8 - line 38, column 52): " + [eitherValue.constructor.name])
                }
              }),
              eitherFunction = function(leftFunc) {
                return function(rightFunc) {
                  return function(eitherValue) {
                    if (eitherValue instanceof LeftConstructor) return leftFunc(eitherValue.value0);
                    if (eitherValue instanceof RightConstructor) return rightFunc(eitherValue.value0);
                    throw new Error("Failed pattern match at Data.Either (line 238, column 1 - line 238, column 64): " + [leftFunc.constructor.name, rightFunc.constructor.name, eitherValue.constructor.name])
                  }
                }
              },
              applyEitherInstance = new ApplyNamespace.Apply(function() {
                return functorEitherInstance
              }, function(eitherFunc) {
                return function(eitherArg) {
                  if (eitherFunc instanceof LeftConstructor) return new LeftConstructor(eitherFunc.value0);
                  if (eitherFunc instanceof RightConstructor) return FunctorNamespace.map(functorEitherInstance)(eitherFunc.value0)(eitherArg);
                  throw new Error("Failed pattern match at Data.Either (line 82, column 1 - line 82, column 41): " + [eitherFunc.constructor.name, eitherArg.constructor.name])
                }
              }),
              applicativeEitherInstance = new ApplicativeNamespace.Applicative(function() {
                return applyEitherInstance
              }, RightConstructor.create),
              bindEitherInstance = new BindNamespace.Bind(function() {
                return applyEitherInstance
              }, eitherFunction(function(leftVal) {
                return function(func) {
                  return new LeftConstructor(leftVal)
                }
              })(function(rightVal) {
                return function(func) {
                  return func(rightVal)
                }
              }));
          psNamespace.Left = LeftConstructor, psNamespace.Right = RightConstructor, psNamespace.either = eitherFunction, psNamespace.note = function(leftVal) {
            return FunctorNamespace.maybe(new LeftConstructor(leftVal))(RightConstructor.create)
          }, psNamespace.functorEither = functorEitherInstance, psNamespace.applyEither = applyEitherInstance, psNamespace.applicativeEither = applicativeEitherInstance, psNamespace.bindEither = bindEitherInstance
        }(psNamespace["Data.Either"] = psNamespace["Data.Either"] || {}),
        function(psNamespace) {
          "use strict";
          psNamespace.toCharArray = function(str) {
            return str.split("")
          }, psNamespace.singleton = function(char) {
            return char
          }
        }(psNamespace["Data.String.CodeUnits"] = psNamespace["Data.String.CodeUnits"] || {}),
        function(psNamespace) {
          "use strict";
          var StringCodeUnitsNamespace = psNamespace["Data.String.CodeUnits"];
          psNamespace["Control.Semigroupoid"], psNamespace["Data.Boolean"], psNamespace["Data.Eq"], psNamespace["Data.Function"], psNamespace["Data.HeytingAlgebra"], psNamespace["Data.Maybe"], psNamespace["Data.Ord"], psNamespace["Data.Ring"], psNamespace["Data.Semiring"], psNamespace["Data.String.Pattern"], psNamespace["Data.String.Unsafe"], psNamespace.Prelude;
          psNamespace.singleton = StringCodeUnitsNamespace.singleton, psNamespace.toCharArray = StringCodeUnitsNamespace.toCharArray
        }(psNamespace["Data.String.CodeUnits"] = psNamespace["Data.String.CodeUnits"] || {}),
        function(psNamespace) {
          "use strict";
          psNamespace.split = function(separator) {
            return function(str) {
              return str.split(separator)
            }
          }, psNamespace.trim = function(str) {
            return str.trim()
          }
        }(psNamespace["Data.String.Common"] = psNamespace["Data.String.Common"] || {}),
        function(psNamespace) {
          "use strict";
          var StringCommonNamespace = psNamespace["Data.String.Common"];
          psNamespace["Data.Eq"], psNamespace["Data.Ordering"], psNamespace["Data.String.Pattern"], psNamespace.Prelude;
          psNamespace.split = StringCommonNamespace.split, psNamespace.trim = StringCommonNamespace.trim
        }(psNamespace["Data.String.Common"] = psNamespace["Data.String.Common"] || {}),
        function(psNamespace) {
          "use strict";
          psNamespace.pureE = function(val) {
            return function() {
              return val
            }
          }, psNamespace.bindE = function(effect) {
            return function(func) {
              return function() {
                return func(effect())()
              }
            }
          }
        }(psNamespace.Effect = psNamespace.Effect || {}),
        function(psNamespace) {
          "use strict";
          var EffectNamespace = psNamespace.Effect,
              ApplicativeNamespace = psNamespace["Control.Applicative"],
              ApplyNamespace = psNamespace["Control.Apply"],
              BindNamespace = psNamespace["Control.Bind"],
              MonadNamespace = psNamespace["Control.Monad"],
              FunctorNamespace = psNamespace["Data.Functor"],
              EffectMonadInstance = (psNamespace["Data.Monoid"], psNamespace["Data.Semigroup"], psNamespace.Prelude, new MonadNamespace.Monad(function() {
                return effectApplicativeInstance
              }, function() {
                return effectBindInstance
              })),
              effectBindInstance = new BindNamespace.Bind(function() {
                return effectApplyInstance
              }, EffectNamespace.bindE),
              effectApplyInstance = new ApplyNamespace.Apply(function() {
                return effectFunctorInstance
              }, MonadNamespace.ap(EffectMonadInstance)),
              effectApplicativeInstance = new ApplicativeNamespace.Applicative(function() {
                return effectApplyInstance
              }, EffectNamespace.pureE),
              effectFunctorInstance = new FunctorNamespace.Functor(ApplicativeNamespace.liftA1(effectApplicativeInstance));
          psNamespace.functorEffect = effectFunctorInstance, psNamespace.applyEffect = effectApplyInstance, psNamespace.applicativeEffect = effectApplicativeInstance, psNamespace.bindEffect = effectBindInstance, psNamespace.monadEffect = EffectMonadInstance
        }(psNamespace.Effect = psNamespace.Effect || {}),
        function(psNamespace) {
          "use strict";
          var AffInternal = function() {
            var AffConstants = {},
                AffTagPure = "Pure",
                AffTagThrow = "Throw",
                AffTagCatch = "Catch",
                AffTagSync = "Sync",
                AffTagAsync = "Async",
                AffTagBind = "Bind",
                AffTagBracket = "Bracket",
                AffTagFork = "Fork",
                AffTagSequential = "Sequential",
                AffTagMap = "Map",
                AffTagApply = "Apply",
                AffTagAlt = "Alt",
                AffTagCons = "Cons",
                AffTagResume = "Resume",
                AffTagRelease = "Release",
                AffTagFinalizer = "Finalizer",
                AffTagFinalized = "Finalized",
                AffTagForked = "Forked";

            function AffNode(tag, val1, val2, val3) {
              this.tag = tag, this._1 = val1, this._2 = val2, this._3 = val3
            }

            function createAffNode(tag) {
              var constructorFunc = function(val1, val2, val3) {
                return new AffNode(tag, val1, val2, val3)
              };
              return constructorFunc.tag = tag, constructorFunc
            }

            function createPureNode(val) {
              return new AffNode(AffTagPure, void 0)
            }

            function handleSyncEffect(effectFunc) {
              try {
                effectFunc()
              } catch (error) {
                setTimeout(function() {
                  throw error
                }, 0)
              }
            }

            function handleCatchEffect(leftFunc, rightFunc, effectFunc) {
              try {
                return rightFunc(effectFunc())
              } catch (error) {
                return leftFunc(error)
              }
            }

            function handleAsyncEffect(leftFunc, effectFunc, cancelFunc) {
              try {
                return effectFunc(cancelFunc)
              } catch (error) {
                return cancelFunc(leftFunc(error))(), createPureNode
              }
            }

            var scheduler = function() {
              var queueSize = 1024,
                  currentQueueLength = 0,
                  queueHead = 0,
                  taskQueue = new Array(queueSize),
                  isCurrentlyDraining = !1;

              function drainQueue() {
                var task;
                for (isCurrentlyDraining = !0; 0 !== currentQueueLength;) currentQueueLength--, task = taskQueue[queueHead], taskQueue[queueHead] = void 0, queueHead = (queueHead + 1) % queueSize, task();
                isCurrentlyDraining = !1
              }

              return {
                isDraining: function() {
                  return isCurrentlyDraining
                },
                enqueue: function(task) {
                  var prevDrainingState;
                  currentQueueLength === queueSize && (prevDrainingState = isCurrentlyDraining, drainQueue(), isCurrentlyDraining = prevDrainingState), taskQueue[(queueHead + currentQueueLength) % queueSize] = task, currentQueueLength++, isCurrentlyDraining || drainQueue()
                }
              }
            }();

            var FiberStatusSuspended = 0,
                FiberStatusRunning = 1,
                FiberStatusCompleted = 2,
                FiberStatusFailed = 3,
                FiberStatusAsync = 4,
                FiberStatusKilled = 5,
                FiberStatusFinalizing = 6;

            function Fiber(eitherAdapter, supervisor, initialValue) {
              var currentStackDepth = 0,
                  currentFiberStatus = FiberStatusSuspended,
                  currentValue = initialValue,
                  currentError = null,
                  bindStack = null,
                  applyStack = null,
                  bracketStack = null,
                  releaseStack = null,
                  bracketCount = 0,
                  forkCount = 0,
                  interruptHandlers = null,
                  rethrowOnUnhandled = !0;

              function executeFiber(initialDepth) {
                var currentBindNode, currentApplyNode, currentBracketNode,
                    currentInterruptHandler, currentReleaseHandler;
                for (;;) switch (currentBindNode = null, currentApplyNode = null, currentBracketNode = null, currentFiberStatus) {
                  case FiberStatusCompleted:
                    currentFiberStatus = FiberStatusRunning, currentValue = bindStack(currentValue), null === applyStack ? bindStack = null : (bindStack = applyStack._1, applyStack = applyStack._2);
                    break;
                  case FiberStatusFailed:
                    eitherAdapter.isLeft(currentValue) ? (currentFiberStatus = FiberStatusKilled, currentError = currentValue, currentValue = null) : null === bindStack ? currentFiberStatus = FiberStatusKilled : (currentFiberStatus = FiberStatusCompleted, currentValue = eitherAdapter.fromRight(currentValue));
                    break;
                  case FiberStatusRunning:
                    switch (currentValue.tag) {
                      case AffTagBind:
                        bindStack && (applyStack = new AffNode(AffTagCons, bindStack, applyStack)), bindStack = currentValue._2, currentFiberStatus = FiberStatusRunning, currentValue = currentValue._1;
                        break;
                      case AffTagPure:
                        null === bindStack ? (currentFiberStatus = FiberStatusKilled, currentValue = eitherAdapter.right(currentValue._1)) : (currentFiberStatus = FiberStatusCompleted, currentValue = currentValue._1);
                        break;
                      case AffTagSync:
                        currentFiberStatus = FiberStatusFailed, currentValue = handleCatchEffect(eitherAdapter.left, eitherAdapter.right, currentValue._1);
                        break;
                      case AffTagAsync:
                        return currentFiberStatus = FiberStatusAsync, void(currentValue = handleAsyncEffect(eitherAdapter.left, currentValue._1, function(callback) {
                          return function() {
                            currentStackDepth === initialDepth && (currentStackDepth++, scheduler.enqueue(function() {
                              currentStackDepth === initialDepth + 1 && (currentFiberStatus = FiberStatusFailed, currentValue = callback, executeFiber(currentStackDepth))
                            }))
                          }
                        }));
                      case AffTagThrow:
                        currentFiberStatus = FiberStatusKilled, currentError = eitherAdapter.left(currentValue._1), currentValue = null;
                        break;
                      case AffTagCatch:
                        bracketStack = new AffNode(AffTagCons, currentValue, null === bindStack ? bracketStack : new AffNode(AffTagCons, new AffNode(AffTagResume, bindStack, applyStack), bracketStack, releaseStack), releaseStack), bindStack = null, applyStack = null, currentFiberStatus = FiberStatusRunning, currentValue = currentValue._1;
                        break;
                      case AffTagBracket:
                        bracketCount++, bracketStack = new AffNode(AffTagCons, currentValue, null === bindStack ? bracketStack : new AffNode(AffTagCons, new AffNode(AffTagResume, bindStack, applyStack), bracketStack, releaseStack), releaseStack), bindStack = null, applyStack = null, currentFiberStatus = FiberStatusRunning, currentValue = currentValue._1;
                        break;
                      case AffTagFork:
                        currentFiberStatus = FiberStatusFailed, currentBindNode = Fiber(eitherAdapter, supervisor, currentValue._2), supervisor && supervisor.register(currentBindNode), currentValue._1 && currentBindNode.run(), currentValue = eitherAdapter.right(currentBindNode);
                        break;
                      case AffTagSequential:
                        currentFiberStatus = FiberStatusRunning, currentValue = processSequentialAff(eitherAdapter, supervisor, currentValue._1);
                    }
                    break;
                  case FiberStatusKilled:
                    if (bindStack = null, applyStack = null, null === bracketStack) currentFiberStatus = FiberStatusFinalizing, currentValue = releaseStack || currentError || currentValue;
                    else switch (currentBindNode = bracketStack._3, currentBracketNode = bracketStack._1, bracketStack = bracketStack._2, currentBracketNode.tag) {
                      case AffTagCatch:
                        releaseStack && releaseStack !== currentBindNode ? currentFiberStatus = FiberStatusKilled : currentError && (currentFiberStatus = FiberStatusRunning, currentValue = currentBracketNode._2(eitherAdapter.fromLeft(currentError)), currentError = null);
                        break;
                      case AffTagResume:
                        releaseStack && releaseStack !== currentBindNode || currentError ? currentFiberStatus = FiberStatusKilled : (bindStack = currentBracketNode._1, applyStack = currentBracketNode._2, currentFiberStatus = FiberStatusCompleted, currentValue = eitherAdapter.fromRight(currentValue));
                        break;
                      case AffTagBracket:
                        bracketCount--, null === currentError && (currentApplyNode = eitherAdapter.fromRight(currentValue), bracketStack = new AffNode(AffTagCons, new AffNode(AffTagRelease, currentBracketNode._2, currentApplyNode), bracketStack, currentBindNode), (releaseStack === currentBindNode || bracketCount > 0) && (currentFiberStatus = FiberStatusRunning, currentValue = currentBracketNode._3(currentApplyNode)));
                        break;
                      case AffTagRelease:
                        bracketCount++, bracketStack = new AffNode(AffTagCons, new AffNode(AffTagFinalized, currentValue, currentError), bracketStack, currentBindNode), currentFiberStatus = FiberStatusRunning, currentValue = currentBindNode && releaseStack !== currentBindNode ? currentBracketNode._1.killed(eitherAdapter.fromLeft(releaseStack))(currentBracketNode._2) : currentError ? currentBracketNode._1.failed(eitherAdapter.fromLeft(currentError))(currentBracketNode._2) : currentBracketNode._1.completed(eitherAdapter.fromRight(currentValue))(currentBracketNode._2), currentError = null;
                        break;
                      case AffTagFinalizer:
                        bracketCount++, bracketStack = new AffNode(AffTagCons, new AffNode(AffTagFinalized, currentValue, currentError), bracketStack, currentBindNode), currentFiberStatus = FiberStatusRunning, currentValue = currentBracketNode._1;
                        break;
                      case AffTagFinalized:
                        bracketCount--, currentFiberStatus = FiberStatusKilled, currentValue = currentBracketNode._1, currentError = currentBracketNode._2
                    }
                    break;
                  case FiberStatusFinalizing:
                    for (var key in interruptHandlers) interruptHandlers.hasOwnProperty(key) && (rethrowOnUnhandled = rethrowOnUnhandled && interruptHandlers[key].rethrow, handleSyncEffect(interruptHandlers[key].handler(currentValue)));
                    return interruptHandlers = null, void(releaseStack && currentError ? setTimeout(function() {
                      throw eitherAdapter.fromLeft(currentError)
                    }, 0) : eitherAdapter.isLeft(currentValue) && rethrowOnUnhandled && setTimeout(function() {
                      if (rethrowOnUnhandled) throw eitherAdapter.fromLeft(currentValue)
                    }, 0));
                  case FiberStatusSuspended:
                    currentFiberStatus = FiberStatusRunning;
                    break;
                  case FiberStatusAsync:
                    return
                }
              }

              function registerInterruptHandler(handlerObj) {
                return function() {
                  if (currentFiberStatus === FiberStatusFinalizing) return rethrowOnUnhandled = rethrowOnUnhandled && handlerObj.rethrow, handlerObj.handler(currentValue)(),
                      function() {};
                  var handlerId = forkCount++;
                  return (interruptHandlers = interruptHandlers || {})[handlerId] = handlerObj,
                      function() {
                        null !== interruptHandlers && delete interruptHandlers[handlerId]
                      }
                }
              }

              return {
                kill: function(killError, callback) {
                  return function() {
                    if (currentFiberStatus === FiberStatusFinalizing) return callback(eitherAdapter.right(void 0))(),
                        function() {};
                    var cleanup = registerInterruptHandler({
                      rethrow: !1,
                      handler: function() {
                        return callback(eitherAdapter.right(void 0))
                      }
                    })();
                    switch (currentFiberStatus) {
                      case FiberStatusSuspended:
                        releaseStack = eitherAdapter.left(killError), currentFiberStatus = FiberStatusFinalizing, currentValue = releaseStack, executeFiber(currentStackDepth);
                        break;
                      case FiberStatusAsync:
                        null === releaseStack && (releaseStack = eitherAdapter.left(killError)), 0 === bracketCount && (currentFiberStatus === FiberStatusAsync && (bracketStack = new AffNode(AffTagCons, new AffNode(AffTagFinalizer, currentValue(killError)), bracketStack, releaseStack)), currentFiberStatus = FiberStatusKilled, currentValue = null, currentError = null, executeFiber(++currentStackDepth));
                        break;
                      default:
                        null === releaseStack && (releaseStack = eitherAdapter.left(killError)), 0 === bracketCount && (currentFiberStatus = FiberStatusKilled, currentValue = null, currentError = null)
                    }
                    return cleanup
                  }
                },
                join: function(callback) {
                  return function() {
                    var cleanup = registerInterruptHandler({
                      rethrow: !1,
                      handler: callback
                    })();
                    return currentFiberStatus === FiberStatusSuspended && executeFiber(currentStackDepth), cleanup
                  }
                },
                onComplete: registerInterruptHandler,
                isSuspended: function() {
                  return currentFiberStatus === FiberStatusSuspended
                },
                run: function() {
                  currentFiberStatus === FiberStatusSuspended && (scheduler.isDraining() ? executeFiber(currentStackDepth) : scheduler.enqueue(function() {
                    executeFiber(currentStackDepth)
                  }))
                }
              }
            }

            function processSequentialAff(eitherAdapter, supervisor, affNode, callback) {
              var counter = 0,
                  fiberMap = {},
                  killCounter = 0,
                  killMap = {},
                  earlyExitError = new Error("[ParAff] Early exit"),
                  globalError = null,
                  currentAdapter = eitherAdapter;

              function killAllFibers(errorToKill, callbackFunc, currentAffNode) {
                var fiber, i, j,
                    node = currentAffNode,
                    parentError = null,
                    childError = null,
                    numKilled = 0,
                    killHandlers = {};

                nodeLoop: for (;;) switch (fiber = null, node.tag) {
                  case AffTagForked:
                    if (node._3 === eitherAdapter && (fiber = fiberMap[node._1], killHandlers[numKilled++] = fiber.kill(errorToKill, function(res) {
                      return function() {
                        0 === --numKilled && callbackFunc(res)()
                      }
                    })), null === parentError) break nodeLoop;
                    node = parentError._2, null === childError ? parentError = null : (parentError = childError._1, childError = childError._2);
                    break;
                  case AffTagMap:
                    node = node._2;
                    break;
                  case AffTagApply:
                  case AffTagAlt:
                    parentError && (childError = new AffNode(AffTagCons, parentError, childError)), parentError = node, node = node._1
                }
                if (0 === numKilled) callbackFunc(eitherAdapter.right(void 0))();
                else
                  for (i = 0, fiber = numKilled; i < fiber; i++) killHandlers[i] = killHandlers[i]();
                return killHandlers
              }

              function handleFiberCompletion(fiberNode) {
                return function(fiberResult) {
                  return function() {
                    delete fiberMap[fiberNode._1], fiberNode._3 = fiberResult,
                        function propagateResult(result, node, parentNode) {
                          var currentResult, currentError, leftResult, rightResult,
                              isPropagationComplete, killId;
                          for (eitherAdapter.isLeft(result) ? (currentError = result, currentResult = null) : (currentResult = result, currentError = null);;) {
                            if (leftResult = null, rightResult = null, isPropagationComplete = null, null !== globalError) return;
                            if (null === node) return void callback(currentError || currentResult)();
                            if (node._3 !== eitherAdapter) return;
                            switch (node.tag) {
                              case AffTagMap:
                                null === currentError ? (node._3 = eitherAdapter.right(node._1(eitherAdapter.fromRight(currentResult))), currentResult = node._3) : node._3 = currentError;
                                break;
                              case AffTagApply:
                                leftResult = node._1._3, rightResult = node._2._3;
                                if (currentError) {
                                  if (node._3 = currentError, isPropagationComplete = !0, killId = killCounter++, killMap[killId] = killAllFibers(earlyExitError, function() {
                                    return function() {
                                      delete killMap[killId], isPropagationComplete ? isPropagationComplete = !1 : null === parentNode ? propagateResult(currentError, null, null) : propagateResult(currentError, parentNode._1, parentNode._2)
                                    }
                                  }), isPropagationComplete) return void(isPropagationComplete = !1)
                                } else {
                                  if (leftResult === eitherAdapter || rightResult === eitherAdapter) return;
                                  currentResult = eitherAdapter.right(eitherAdapter.fromRight(leftResult)(eitherAdapter.fromRight(rightResult))), node._3 = currentResult
                                }
                                break;
                              case AffTagAlt:
                                leftResult = node._1._3, rightResult = node._2._3;
                                if (leftResult === eitherAdapter && eitherAdapter.isLeft(rightResult) || rightResult === eitherAdapter && eitherAdapter.isLeft(leftResult)) return; // Both still running, or one failed and other still running
                                if (leftResult !== eitherAdapter && eitherAdapter.isLeft(leftResult) && rightResult !== eitherAdapter && eitherAdapter.isLeft(rightResult)) // Both failed
                                  currentError = currentResult === leftResult ? rightResult : leftResult, currentResult = null, node._3 = currentError;
                                else { // One succeeded
                                  if (node._3 = currentResult, isPropagationComplete = !0, killId = killCounter++, killMap[killId] = killAllFibers(earlyExitError, function() {
                                    return function() {
                                      delete killMap[killId], isPropagationComplete ? isPropagationComplete = !1 : null === parentNode ? propagateResult(currentResult, null, null) : propagateResult(currentResult, parentNode._1, parentNode._2)
                                    }
                                  }), isPropagationComplete) return void(isPropagationComplete = !1)
                                }
                            }
                            null === parentNode ? node = null : (node = parentNode._1, parentNode = parentNode._2)
                          }
                        }(fiberResult, fiberNode._2._1, fiberNode._2._2)
                  }
                }
              }

              return function() {
                var currentAffNode, currentParentNode,
                    currentProcessState = FiberStatusRunning,
                    currentTree = affNode,
                    parentTree = null,
                    grandParentTree = null;

                nodeTraversal: for (;;) switch (currentAffNode = null, currentParentNode = null, currentProcessState) {
                  case FiberStatusRunning:
                    switch (currentTree.tag) {
                      case AffTagMap:
                        grandParentTree && (parentTree = new AffNode(AffTagCons, grandParentTree, parentTree)), grandParentTree = new AffNode(AffTagMap, currentTree._1, eitherAdapter, eitherAdapter), currentTree = currentTree._2;
                        break;
                      case AffTagApply:
                        grandParentTree && (parentTree = new AffNode(AffTagCons, grandParentTree, parentTree)), grandParentTree = new AffNode(AffTagApply, eitherAdapter, currentTree._2, eitherAdapter), currentTree = currentTree._1;
                        break;
                      case AffTagAlt:
                        grandParentTree && (parentTree = new AffNode(AffTagCons, grandParentTree, parentTree)), grandParentTree = new AffNode(AffTagAlt, eitherAdapter, currentTree._2, eitherAdapter), currentTree = currentTree._1;
                        break;
                      default:
                        currentParentNode = counter++, currentProcessState = FiberStatusKilled, currentAffNode = currentTree, currentTree = new AffNode(AffTagForked, currentParentNode, new AffNode(AffTagCons, grandParentTree, parentTree), eitherAdapter), (currentAffNode = Fiber(eitherAdapter, supervisor, currentAffNode)).onComplete({
                          rethrow: !1,
                          handler: handleFiberCompletion(currentTree)
                        })(), fiberMap[currentParentNode] = currentAffNode, supervisor && supervisor.register(currentAffNode)
                    }
                    break;
                  case FiberStatusKilled:
                    if (null === grandParentTree) break nodeTraversal;
                    grandParentTree._1 === eitherAdapter ? (grandParentTree._1 = currentTree, currentProcessState = FiberStatusRunning, currentTree = grandParentTree._2, grandParentTree._2 = eitherAdapter) : (grandParentTree._2 = currentTree, currentTree = grandParentTree, null === parentTree ? grandParentTree = null : (grandParentTree = parentTree._1, parentTree = parentTree._2))
                }
                for (currentAdapter = currentTree, currentAffNode = 0; currentAffNode < counter; currentAffNode++) fiberMap[currentAffNode].run()
              }(),
                  function(errorMsg) {
                    return new AffNode(AffTagAsync, function(cancelFunc) {
                      return function() {
                        var cleanup = registerInterruptHandler({
                          rethrow: !1,
                          handler: cancelFunc
                        })();
                        for (var killId in killMap) killMap.hasOwnProperty(killId) && killMap[killId]();
                        killMap = null;
                        var finalKill = killAllFibers(errorMsg, currentAdapter, currentTree);
                        return function(cancelAll) {
                          return new AffNode(AffTagAsync, function() {
                            for (var killId in finalKill) finalKill.hasOwnProperty(killId) && finalKill[killId]();
                            return createPureNode
                          })
                        }
                      }
                    })
                  }
            }

            return AffNode.EMPTY = eitherAdapter, AffNode.Pure = createAffNode(AffTagPure), AffNode.Throw = createAffNode(AffTagThrow), AffNode.Catch = createAffNode(AffTagCatch), AffNode.Sync = createAffNode(AffTagSync), AffNode.Async = createAffNode(AffTagAsync), AffNode.Bind = createAffNode(AffTagBind), AffNode.Bracket = createAffNode(AffTagBracket), AffNode.Fork = createAffNode(AffTagFork), AffNode.Seq = createAffNode(AffTagSequential), AffNode.ParMap = createAffNode(AffTagMap), AffNode.ParApply = createAffNode(AffTagApply), AffNode.ParAlt = createAffNode(AffTagAlt), AffNode.Fiber = Fiber, AffNode.Supervisor = function(adapter) {
              var fiberRegistry = {},
                  nextFiberId = 0,
                  activeFibers = 0;
              return {
                register: function(fiber) {
                  var id = nextFiberId++;
                  fiber.onComplete({
                    rethrow: !0,
                    handler: function(result) {
                      return function() {
                        activeFibers--, delete fiberRegistry[id]
                      }
                    }
                  }), fiberRegistry[id] = fiber, activeFibers++
                },
                isEmpty: function() {
                  return 0 === activeFibers
                },
                killAll: function(errorToKill, callback) {
                  return function() {
                    var numToKill = 0,
                        killHandles = {};

                    function killAndReport(fiberId) {
                      killHandles[fiberId] = fiberRegistry[fiberId].kill(errorToKill, function(result) {
                        return function() {
                          delete killHandles[fiberId], numToKill--, adapter.isLeft(result) && adapter.fromLeft(result) && setTimeout(function() {
                            throw adapter.fromLeft(result)
                          }, 0), 0 === numToKill && callback()
                        }
                      })()
                    }

                    for (var fiberId in fiberRegistry) fiberRegistry.hasOwnProperty(fiberId) && (numToKill++, killAndReport(fiberId));
                    return fiberRegistry = {}, nextFiberId = 0, activeFibers = 0,
                        function(affNode) {
                          return new AffNode(AffTagAsync, function() {
                            for (var id in killHandles) killHandles.hasOwnProperty(id) && killHandles[id]();
                            return createPureNode
                          })
                        }
                  }
                }
              }
            }, AffNode.Scheduler = scheduler, AffNode.nonCanceler = createPureNode, AffNode
          }();

          psNamespace._pure = AffInternal.Pure, psNamespace._map = function(func) {
            return function(aff) {
              return aff.tag === AffInternal.Pure.tag ? AffInternal.Pure(func(aff._1)) : AffInternal.Bind(aff, function(val) {
                return AffInternal.Pure(func(val))
              })
            }
          }, psNamespace._bind = function(aff) {
            return function(func) {
              return AffInternal.Bind(aff, func)
            }
          }, psNamespace._liftEffect = AffInternal.Sync, psNamespace._parAffMap = function(func) {
            return function(parAff) {
              return AffInternal.ParMap(func, parAff)
            }
          }, psNamespace._parAffApply = function(parAffFunc) {
            return function(parAffArg) {
              return AffInternal.ParApply(parAffFunc, parAffArg)
            }
          }, psNamespace.makeAff = AffInternal.Async, psNamespace._makeFiber = function(eitherAdapter, aff) {
            return function() {
              return AffInternal.Fiber(eitherAdapter, null, aff)
            }
          }, psNamespace._sequential = AffInternal.Seq
        }(psNamespace["Effect.Aff"] = psNamespace["Effect.Aff"] || {}),
        function(psNamespace) {
          "use strict";
          psNamespace["Control.Category"], psNamespace["Control.Monad"], psNamespace.Effect;
          psNamespace.liftEffect = function(monadEffect) {
            return monadEffect.liftEffect
          }, psNamespace.MonadEffect = function(monadZero, liftEffectFunc) {
            this.Monad0 = monadZero, this.liftEffect = liftEffectFunc
          }
        }(psNamespace["Effect.Class"] = psNamespace["Effect.Class"] || {}),
        function(psNamespace) {
          "use strict";
          psNamespace.new = function(initialValue) {
            return function() {
              return {
                value: initialValue
              }
            }
          }, psNamespace.read = function(ref) {
            return function() {
              return ref.value
            }
          }, psNamespace.write = function(newValue) {
            return function(ref) {
              return function() {
                return ref.value = newValue, {}
              }
            }
          }
        }(psNamespace["Effect.Ref"] = psNamespace["Effect.Ref"] || {}),
        function(psNamespace) {
          "use strict";
          var EffectRefNamespace = psNamespace["Effect.Ref"];
          psNamespace["Data.Function"], psNamespace["Data.Functor"], psNamespace.Effect, psNamespace.Prelude;
          psNamespace.new = EffectRefNamespace.new, psNamespace.read = EffectRefNamespace.read, psNamespace.write = EffectRefNamespace.write
        }(psNamespace["Effect.Ref"] = psNamespace["Effect.Ref"] || {}),
        function(psNamespace) {
          "use strict";
          psNamespace["Control.Alt"], psNamespace["Control.Alternative"], psNamespace["Control.Applicative"], psNamespace["Control.Apply"], psNamespace["Control.Bind"], psNamespace["Control.Monad.Cont.Trans"], psNamespace["Control.Monad.Except.Trans"], psNamespace["Control.Monad.Maybe.Trans"], psNamespace["Control.Monad.Reader.Trans"], psNamespace["Control.Monad.Writer.Trans"], psNamespace["Control.Plus"], psNamespace["Control.Semigroupoid"], psNamespace["Data.Either"], psNamespace["Data.Function"], psNamespace["Data.Functor"], psNamespace["Data.Functor.Compose"], psNamespace["Data.Maybe"], psNamespace["Data.Newtype"], psNamespace["Data.Unit"], psNamespace["Effect.Class"], psNamespace["Effect.Ref"], psNamespace.Prelude;
          psNamespace.parallel = function(parallelInstance) {
            return parallelInstance.parallel
          }, psNamespace.sequential = function(parallelInstance) {
            return parallelInstance.sequential
          }, psNamespace.Parallel = function(applicativeOne, monadZero, parallelFunc, sequentialFunc) {
            this.Applicative1 = applicativeOne, this.Monad0 = monadZero, this.parallel = parallelFunc, this.sequential = sequentialFunc
          }
        }(psNamespace["Control.Parallel.Class"] = psNamespace["Control.Parallel.Class"] || {}),
        function(psNamespace) {
          "use strict";
          psNamespace["Control.Alternative"], psNamespace["Control.Apply"];
          var CategoryNamespace = psNamespace["Control.Category"],
              ParallelClassNamespace = psNamespace["Control.Parallel.Class"],
              FoldableNamespace = (psNamespace["Control.Semigroupoid"], psNamespace["Data.Foldable"]),
              parTraverseFunc = (psNamespace["Data.Traversable"], psNamespace.Prelude, function(parallelInstance) {
                return function(foldableInstance) {
                  return function(func) {
                    return function(arr) {
                      return ParallelClassNamespace.sequential(parallelInstance)(FoldableNamespace.traverse_(parallelInstance.Applicative1())(foldableInstance)(function(elem) {
                        return ParallelClassNamespace.parallel(parallelInstance)(func(elem))
                      })(arr))
                    }
                  }
                }
              });
          psNamespace.parTraverse_ = parTraverseFunc, psNamespace.parSequence_ = function(parallelInstance) {
            return function(foldableInstance) {
              return parTraverseFunc(parallelInstance)(foldableInstance)(CategoryNamespace.identity(CategoryNamespace.categoryFn))
            }
          }
        }(psNamespace["Control.Parallel"] = psNamespace["Control.Parallel"] || {}),
        function(psNamespace) {
          "use strict";
          psNamespace.error = function(message) {
            return new Error(message)
          }, psNamespace.throwException = function(errorObj) {
            return function() {
              throw errorObj
            }
          }
        }(psNamespace["Effect.Exception"] = psNamespace["Effect.Exception"] || {}),
        function(psNamespace) {
          "use strict";
          var ExceptionNamespace = psNamespace["Effect.Exception"];
          psNamespace["Control.Applicative"], psNamespace["Control.Semigroupoid"], psNamespace["Data.Either"], psNamespace["Data.Functor"], psNamespace["Data.Maybe"], psNamespace["Data.Show"], psNamespace.Effect, psNamespace.Prelude;
          psNamespace.throw = function(message) {
            return ExceptionNamespace.throwException(ExceptionNamespace.error(message))
          }
        }(psNamespace["Effect.Exception"] = psNamespace["Effect.Exception"] || {}),
        function(psNamespace) {
          "use strict";
          var AffNamespace = psNamespace["Effect.Aff"],
              ApplicativeNamespace = (psNamespace["Control.Alt"], psNamespace["Control.Alternative"], psNamespace["Control.Applicative"]),
              ApplyNamespace = psNamespace["Control.Apply"],
              BindNamespace = psNamespace["Control.Bind"],
              MonadNamespace = (psNamespace["Control.Lazy"], psNamespace["Control.Monad"]),
              ParallelNamespace = (psNamespace["Control.Monad.Error.Class"], psNamespace["Control.Monad.Rec.Class"], psNamespace["Control.Parallel"]),
              ParallelClassNamespace = psNamespace["Control.Parallel.Class"],
              EitherNamespace = (psNamespace["Control.Plus"], psNamespace["Control.Semigroupoid"], psNamespace["Data.Either"]),
              FoldableNamespace = psNamespace["Data.Foldable"],
              FunctionNamespace = psNamespace["Data.Function"],
              FunctorNamespace = (psNamespace["Data.Function.Uncurried"], psNamespace["Data.Functor"]),
              MonoidNamespace = psNamespace["Data.Monoid"],
              SemigroupNamespace = (psNamespace["Data.Newtype"], psNamespace["Data.Semigroup"]),
              UnitNamespace = (psNamespace["Data.Time.Duration"], psNamespace["Data.Unit"]),
              EffectRuntime = psNamespace.Effect,
              EffectClassNamespace = psNamespace["Effect.Class"],
              UnsafePartialNamespace = (psNamespace["Effect.Exception"], psNamespace["Effect.Unsafe"], psNamespace["Partial.Unsafe"]),
              UnsafeCoerceNamespace = (psNamespace.Prelude, psNamespace["Unsafe.Coerce"]),
              functorParAffInstance = new FunctorNamespace.Functor(AffNamespace._parAffMap),
              functorAffInstance = new FunctorNamespace.Functor(AffNamespace._map),
              affEitherAdapter = {
                isLeft: function(eitherVal) {
                  if (eitherVal instanceof EitherNamespace.Left) return !0;
                  if (eitherVal instanceof EitherNamespace.Right) return !1;
                  throw new Error("Failed pattern match at Effect.Aff (line 390, column 12 - line 392, column 20): " + [eitherVal.constructor.name])
                },
                fromLeft: function(eitherVal) {
                  if (eitherVal instanceof EitherNamespace.Left) return eitherVal.value0;
                  if (eitherVal instanceof EitherNamespace.Right) return UnsafePartialNamespace.unsafeCrashWith("unsafeFromLeft: Right");
                  throw new Error("Failed pattern match at Effect.Aff (line 395, column 20 - line 399, column 3): " + [eitherVal.constructor.name])
                },
                fromRight: function(eitherVal) {
                  if (eitherVal instanceof EitherNamespace.Right) return eitherVal.value0;
                  if (eitherVal instanceof EitherNamespace.Left) return UnsafePartialNamespace.unsafeCrashWith("unsafeFromRight: Left");
                  throw new Error("Failed pattern match at Effect.Aff (line 400, column 21 - line 402, column 31): " + [eitherVal.constructor.name])
                },
                left: EitherNamespace.Left.create,
                right: EitherNamespace.Right.create
              },
              launchAffFunction = function(aff) {
                return function() {
                  var fiberCreator = function(affValue) {
                    return AffNamespace._makeFiber(affEitherAdapter, affValue)
                  }(aff)();
                  return fiberCreator.run(), fiberCreator
                }
              },
              applyParAffInstance = new ApplyNamespace.Apply(function() {
                return functorParAffInstance
              }, AffNamespace._parAffApply),
              monadAffInstance = new MonadNamespace.Monad(function() {
                return applicativeAffInstance
              }, function() {
                return bindAffInstance
              }),
              bindAffInstance = new BindNamespace.Bind(function() {
                return applyAffInstance
              }, AffNamespace._bind),
              applyAffInstance = new ApplyNamespace.Apply(function() {
                return functorAffInstance
              }, MonadNamespace.ap(monadAffInstance)),
              applicativeAffInstance = new ApplicativeNamespace.Applicative(function() {
                return applyAffInstance
              }, AffNamespace._pure),
              monadEffectAffInstance = new EffectClassNamespace.MonadEffect(function() {
                return monadAffInstance
              }, AffNamespace._liftEffect),
              parallelAffInstance = new ParallelClassNamespace.Parallel(function() {
                return applicativeParAffInstance
              }, function() {
                return monadAffInstance
              }, UnsafeCoerceNamespace.unsafeCoerce, AffNamespace._sequential),
              applicativeParAffInstance = new ApplicativeNamespace.Applicative(function() {
                return applyParAffInstance
              }, function(val) {
                return ParallelClassNamespace.parallel(parallelAffInstance)(ApplicativeNamespace.pure(applicativeAffInstance)(val))
              }),
              semigroupCancelerInstance = new SemigroupNamespace.Semigroup(function(canceler1) {
                return function(canceler2) {
                  return function(fiber) {
                    return ParallelNamespace.parSequence_(parallelAffInstance)(FoldableNamespace.foldableArray)([canceler1(fiber), canceler2(fiber)])
                  }
                }
              }),
              nonCancelerValue = FunctionNamespace.const(ApplicativeNamespace.pure(applicativeAffInstance)(UnitNamespace.unit)),
              monoidCancelerInstance = new MonoidNamespace.Monoid(function() {
                return semigroupCancelerInstance
              }, nonCancelerValue);
          psNamespace.launchAff = launchAffFunction, psNamespace.launchAff_ = function(aff) {
            return FunctorNamespace.void(EffectRuntime.functorEffect)(launchAffFunction(aff))
          }, psNamespace.nonCanceler = nonCancelerValue, psNamespace.functorAff = functorAffInstance, psNamespace.applyAff = applyAffInstance, psNamespace.applicativeAff = applicativeAffInstance, psNamespace.bindAff = bindAffInstance, psNamespace.monadAff = monadAffInstance, psNamespace.monadEffectAff = monadEffectAffInstance, psNamespace.functorParAff = functorParAffInstance, psNamespace.applyParAff = applyParAffInstance, psNamespace.applicativeParAff = applicativeParAffInstance, psNamespace.parallelAff = parallelAffInstance, psNamespace.semigroupCanceler = semigroupCancelerInstance, psNamespace.monoidCanceler = monoidCancelerInstance, psNamespace.makeAff = AffNamespace.makeAff
        }(psNamespace["Effect.Aff"] = psNamespace["Effect.Aff"] || {}),
        function(psNamespace) {
          "use strict";
          psNamespace["Node.Encoding"];
          var ShowNamespace = psNamespace["Data.Show"],
              AsciiEncoding = (psNamespace.Prelude, function() {
                function AsciiEncoding() {}
                return AsciiEncoding.value = new AsciiEncoding, AsciiEncoding
              }()),
              Utf8Encoding = function() {
                function Utf8Encoding() {}
                return Utf8Encoding.value = new Utf8Encoding, Utf8Encoding
              }(),
              Utf16leEncoding = function() {
                function Utf16leEncoding() {}
                return Utf16leEncoding.value = new Utf16leEncoding, Utf16leEncoding
              }(),
              Ucs2Encoding = function() {
                function Ucs2Encoding() {}
                return Ucs2Encoding.value = new Ucs2Encoding, Ucs2Encoding
              }(),
              Base64Encoding = function() {
                function Base64Encoding() {}
                return Base64Encoding.value = new Base64Encoding, Base64Encoding
              }(),
              Latin1Encoding = function() {
                function Latin1Encoding() {}
                return Latin1Encoding.value = new Latin1Encoding, Latin1Encoding
              }(),
              BinaryEncoding = function() {
                function BinaryEncoding() {}
                return BinaryEncoding.value = new BinaryEncoding, BinaryEncoding
              }(),
              HexEncoding = function() {
                function HexEncoding() {}
                return HexEncoding.value = new HexEncoding, HexEncoding
              }(),
              showEncodingInstance = new ShowNamespace.Show(function(encoding) {
                if (encoding instanceof AsciiEncoding) return "ASCII";
                if (encoding instanceof Utf8Encoding) return "UTF8";
                if (encoding instanceof Utf16leEncoding) return "UTF16LE";
                if (encoding instanceof Ucs2Encoding) return "UCS2";
                if (encoding instanceof Base64Encoding) return "Base64";
                if (encoding instanceof Latin1Encoding) return "Latin1";
                if (encoding instanceof BinaryEncoding) return "Binary";
                if (encoding instanceof HexEncoding) return "Hex";
                throw new Error("Failed pattern match at Node.Encoding (line 19, column 1 - line 19, column 39): " + [encoding.constructor.name])
              });
          psNamespace.ASCII = AsciiEncoding, psNamespace.UTF8 = Utf8Encoding, psNamespace.UTF16LE = Utf16leEncoding, psNamespace.UCS2 = Ucs2Encoding, psNamespace.Base64 = Base64Encoding, psNamespace.Latin1 = Latin1Encoding, psNamespace.Binary = BinaryEncoding, psNamespace.Hex = HexEncoding, psNamespace.encodingToNode = function(encoding) {
            if (encoding instanceof AsciiEncoding) return "ascii";
            if (encoding instanceof Utf8Encoding) return "utf8";
            if (encoding instanceof Utf16leEncoding) return "utf16le";
            if (encoding instanceof Ucs2Encoding) return "ucs2";
            if (encoding instanceof Base64Encoding) return "base64";
            if (encoding instanceof Latin1Encoding) return "latin1";
            if (encoding instanceof BinaryEncoding) return "binary";
            if (encoding instanceof HexEncoding) return "hex";
            throw new Error("Failed pattern match at Node.Encoding (line 31, column 1 - line 31, column 37): " + [encoding.constructor.name])
          }, psNamespace.showEncoding = showEncodingInstance
        }(psNamespace["Node.Encoding"] = psNamespace["Node.Encoding"] || {}),
        function(psNamespace) {
          "use strict";
          (psNamespace["Node.Process"] = psNamespace["Node.Process"] || {}).process = process
        }(),
        function(psNamespace) {
          "use strict";
          psNamespace.readChunkImpl = function(bufferHandler) {
            return function(stringHandler) {
              return function(chunk) {
                if (chunk instanceof Buffer) return stringHandler(chunk);
                if ("string" == typeof chunk) return bufferHandler(chunk);
                throw new Error("Node.Stream.readChunkImpl: Unrecognised chunk type; expected String or Buffer, got: " + chunk)
              }
            }
          }, psNamespace.onDataEitherImpl = function(chunkHandler) {
            return function(stream) {
              return function(callback) {
                return function() {
                  stream.on("data", function(chunk) {
                    callback(chunkHandler(chunk))()
                  })
                }
              }
            }
          }, psNamespace.onEnd = function(stream) {
            return function(callback) {
              return function() {
                stream.on("end", callback)
              }
            }
          }, psNamespace.write = function(stream) {
            return function(data) {
              return function(callback) {
                return function() {
                  return stream.write(data, null, callback)
                }
              }
            }
          }, psNamespace.writeStringImpl = function(stream) {
            return function(encoding) {
              return function(data) {
                return function(callback) {
                  return function() {
                    return stream.write(data, encoding, callback)
                  }
                }
              }
            }
          }
        }(psNamespace["Node.Stream"] = psNamespace["Node.Stream"] || {}),
        function(psNamespace) {
          "use strict";
          (psNamespace["Node.Buffer"] = psNamespace["Node.Buffer"] || {}).toStringImpl = function(encoding) {
            return function(buffer) {
              return function() {
                return buffer.toString(encoding)
              }
            }
          }
        }(),
        function(psNamespace) {
          "use strict";
          var BufferNamespace = psNamespace["Node.Buffer"],
              EncodingNamespace = (psNamespace["Control.Semigroupoid"], psNamespace["Data.ArrayBuffer.Types"], psNamespace["Data.Maybe"], psNamespace["Data.Show"], psNamespace.Effect, psNamespace["Node.Encoding"]);
          psNamespace.Prelude;
          psNamespace.toString = function(encoding) {
            return BufferNamespace.toStringImpl(EncodingNamespace.encodingToNode(encoding))
          }
        }(psNamespace["Node.Buffer"] = psNamespace["Node.Buffer"] || {}),
        function(psNamespace) {
          "use strict";
          var StreamNamespace = psNamespace["Node.Stream"],
              ApplicativeNamespace = psNamespace["Control.Applicative"],
              BindNamespace = psNamespace["Control.Bind"],
              EitherNamespace = psNamespace["Data.Either"],
              ShowNamespace = (psNamespace["Data.Functor"], psNamespace["Data.Maybe"], psNamespace["Data.Show"]),
              EffectNamespace = psNamespace.Effect,
              ExceptionNamespace = psNamespace["Effect.Exception"],
              BufferNamespace = psNamespace["Node.Buffer"],
              EncodingNamespace = psNamespace["Node.Encoding"],
              readChunkEither = (psNamespace.Prelude, StreamNamespace.readChunkImpl(EitherNamespace.Left.create)(EitherNamespace.Right.create)),
              onDataEitherFunction = function(chunkHandler) {
                return function(stream) {
                  return StreamNamespace.onDataEitherImpl(chunkHandler)(stream)
                }
              },
              onDataBufferedFunction = function(stream) {
                return function(callback) {
                  return onDataEitherFunction(readChunkEither)(stream)(BindNamespace.composeKleisliFlipped(EffectNamespace.bindEffect)(callback)(function(eitherChunk) {
                    if (eitherChunk instanceof EitherNamespace.Left) return ExceptionNamespace.throw("Stream encoding should not be set");
                    if (eitherChunk instanceof EitherNamespace.Right) return ApplicativeNamespace.pure(EffectNamespace.applicativeEffect)(eitherChunk.value0);
                    throw new Error("Failed pattern match at Node.Stream (line 94, column 5 - line 98, column 17): " + [eitherChunk.constructor.name])
                  }))
                }
              };
          psNamespace.onData = onDataBufferedFunction, psNamespace.onDataString = function(stream) {
            return function(encoding) {
              return function(callback) {
                return onDataBufferedFunction(stream)(BindNamespace.composeKleisliFlipped(EffectNamespace.bindEffect)(callback)(BufferNamespace.toString(encoding)))
              }
            }
          }, psNamespace.onDataEither = onDataEitherFunction, psNamespace.writeString = function(stream) {
            return function(encoding) {
              return StreamNamespace.writeStringImpl(stream)(ShowNamespace.show(EncodingNamespace.showEncoding)(encoding))
            }
          }, psNamespace.onEnd = StreamNamespace.onEnd
        }(psNamespace["Node.Stream"] = psNamespace["Node.Stream"] || {}),
        function(psNamespace) {
          "use strict";
          var ProcessNamespace = psNamespace["Node.Process"],
              StdInStream = (psNamespace["Data.Functor"], psNamespace["Data.Maybe"], psNamespace["Data.Posix"], psNamespace["Data.Posix.Signal"], psNamespace.Effect, psNamespace["Foreign.Object"], psNamespace["Node.Platform"], psNamespace["Node.Stream"], psNamespace.Prelude, psNamespace["Unsafe.Coerce"], ProcessNamespace.process.stdout),
              StdOutStream = ProcessNamespace.process.stdin;
          psNamespace.stdin = StdOutStream, psNamespace.stdout = StdInStream
        }(psNamespace["Node.Process"] = psNamespace["Node.Process"] || {}),
        function(psNamespace) {
          "use strict";
          var ApplicativeNamespace = psNamespace["Control.Applicative"],
              BindNamespace = psNamespace["Control.Bind"],
              CategoryNamespace = psNamespace["Control.Category"],
              ArrayNamespace = psNamespace["Data.Array"],
              BigIntNamespace = psNamespace["Data.BigInt"],
              EitherNamespace = psNamespace["Data.Either"],
              EqNamespace = psNamespace["Data.Eq"],
              FunctorNamespace = psNamespace["Data.Functor"],
              IntNamespace = psNamespace["Data.Int"],
              MaybeNamespace = psNamespace["Data.Maybe"],
              MonoidNamespace = psNamespace["Data.Monoid"],
              OrdNamespace = psNamespace["Data.Ord"],
              StringCodeUnitsNamespace = (psNamespace["Data.Ring"], psNamespace["Data.Semigroup"], psNamespace["Data.Semiring"], psNamespace["Data.String"], psNamespace["Data.String.CodeUnits"]),
              StringCommonNamespace = psNamespace["Data.String.Common"],
              UnitNamespace = (psNamespace["Data.String.Pattern"], psNamespace["Data.Unit"]),
              EffectNamespace = psNamespace.Effect,
              AffNamespace = psNamespace["Effect.Aff"],
              EffectClassNamespace = psNamespace["Effect.Class"],
              EffectRefNamespace = psNamespace["Effect.Ref"],
              EncodingNamespace = psNamespace["Node.Encoding"],
              ProcessNamespace = psNamespace["Node.Process"],
              StreamNamespace = psNamespace["Node.Stream"],
              UnsafePartialNamespace = psNamespace["Partial.Unsafe"],
              solveProblem = (psNamespace.Prelude, function(inputData) {
                // Helper to crash on Either.Left, or return Either.Right value
                var unwrapEither = EitherNamespace.either(function(errorMsg) {
                      return UnsafePartialNamespace.unsafeCrashWith(errorMsg)
                    })(CategoryNamespace.identity(CategoryNamespace.categoryFn)),
                    // Split input by newline and trim whitespace
                    inputLines = StringCommonNamespace.split("\n")(StringCommonNamespace.trim(inputData)),
                    // Extract first line (S) and last line (K)
                    parseS = BindNamespace.bind(EitherNamespace.bindEither)(EitherNamespace.note("s")(ArrayNamespace.head(inputLines)))(function(sStr) {
                      return BindNamespace.bind(EitherNamespace.bindEither)(EitherNamespace.note("k")(BindNamespace.bind(MaybeNamespace.bindMaybe)(ArrayNamespace.last(inputLines))(BigIntNamespace.fromString)))(function(kBigInt) {
                        return ApplicativeNamespace.pure(EitherNamespace.applicativeEither)((function(sString, kVal) {
                          // Convert S string to character array
                          var sChars = StringCodeUnitsNamespace.toCharArray(sString),
                              // Find the first non-'1' character
                              // If no non-'1' found, it's all '1's
                              // Otherwise, take up to and including the first non-'1'
                              prefix = function() {
                                var firstNonOneIdx = ArrayNamespace.findIndex(EqNamespace.notEq(EqNamespace.eqChar)("1"))(sChars);
                                if (firstNonOneIdx instanceof MaybeNamespace.Nothing) return ["1"]; // All ones
                                if (firstNonOneIdx instanceof MaybeNamespace.Just) return ArrayNamespace.take(firstNonOneIdx.value0 + 1 | 0)(sChars); // Take up to and including non-one
                                throw new Error("Failed pattern match at ABC106C (line 66, column 7 - line 68, column 46): " + [firstNonOneIdx.constructor.name])
                              }(),
                              // The character at the end of the prefix
                              lastPrefixChar = MaybeNamespace.fromJust()(ArrayNamespace.last(prefix));
                          // Determine the output character
                          return StringCodeUnitsNamespace.singleton(function() {
                            // If K is less than or equal to the prefix length, the answer is the last char of the prefix
                            if (OrdNamespace.lessThanOrEq(BigIntNamespace.ordBigInt)(BigIntNamespace.fromInt(ArrayNamespace.length(prefix)))(kVal)) return lastPrefixChar;
                            // Otherwise, it's the character at (K-1)th index of the original string
                            var kMinusOne = MaybeNamespace.fromJust()(IntNamespace.fromString(BigIntNamespace.toString(kVal)));
                            return MaybeNamespace.fromMaybe(lastPrefixChar)(ArrayNamespace.index(sChars)(kMinusOne - 1 | 0))
                          }())
                        })(sStr, kBigInt) + "\n")
                      })
                    });
                return unwrapEither(parseS)
              }),
              // Aff computation to read stdin
              readStdinAff = AffNamespace.makeAff(function(callback) {
                return function() {
                  // Create a mutable reference to accumulate input
                  var inputRef = EffectRefNamespace.new("")();
                  // Attach data listener to stdin
                  StreamNamespace.onDataString(ProcessNamespace.stdin)(EncodingNamespace.UTF8.value)(function(chunk) {
                    return function() {
                      var currentContent = EffectRefNamespace.read(inputRef)();
                      return EffectRefNamespace.write(currentContent + chunk)(inputRef)()
                    }
                  })(),
                      // Attach end listener to stdin
                      StreamNamespace.onEnd(ProcessNamespace.stdin)(function() {
                        var finalContent = EffectRefNamespace.read(inputRef)();
                        return callback(ApplicativeNamespace.pure(EitherNamespace.applicativeEither)(finalContent))()
                      })(),
                      // Return a non-canceler for this Aff
                      MonoidNamespace.mempty(AffNamespace.monoidCanceler)
                }
              }),
              // Main Aff computation: read, solve, write
              mainAffComputation = AffNamespace.launchAff_(BindNamespace.bind(AffNamespace.bindAff)(readStdinAff)(function(inputStr) {
                return BindNamespace.bind(AffNamespace.bindAff)(ApplicativeNamespace.pure(AffNamespace.applicativeAff)(solveProblem(inputStr)))(function(outputStr) {
                  // Lift the effect of writing to stdout into Aff
                  return EffectClassNamespace.liftEffect(AffNamespace.monadEffectAff)(FunctorNamespace.void(EffectNamespace.functorEffect)(StreamNamespace.writeString(ProcessNamespace.stdout)(EncodingNamespace.UTF8.value)(outputStr)(ApplicativeNamespace.pure(EffectNamespace.applicativeEffect)(UnitNamespace.unit))))
                })
              }));

          // Export main function and solve logic
          psNamespace.main = mainAffComputation, psNamespace.solve = solveProblem
        }(psRuntime.ABC106C = psNamespace.ABC106C || {}), psRuntime.ABC106C.main();
    // End Purescript generated code emulation
  }, {
    "big-integer": "9xaU"
  }]
}, {}, ["Focm"], null)