/*
 *  This file is a Type II clone of a JavaScript module bundler's output.
 *  The original structure and logic are preserved, but all identifiers,
 *  whitespace, and comments have been thoroughly modified.
 *  This specific code snippet likely involves a module loader for a web application
 *  and a bundled arbitrary-precision arithmetic library.
 */
// The main module loading function, similar to Parcel's internal loader.
// It manages module definitions, caching, and execution flow.
moduleLoader = function( moduleDefinitions, moduleCache, entryPoints, exportName ) {
  // Declare a variable for storing any potential errors during module loading.
  var firstError,
    // Reference to the global module loader if it exists, for compatibility.
    globalLoaderReference = "function" === typeof moduleLoader && moduleLoader,
    // Reference to Node.js 'require' if available, for environment detection.
    nodeModuleRequester = "function" === typeof require && require;

  // This internal function is responsible for loading and executing individual modules.
  function loadModule( targetModuleId, preventErrorPropagation ) {
    // If the module is already in the cache, return its exports directly.
    if (!moduleCache[targetModuleId]) {
      // If the module definition is not found, attempt to load it from other sources.
      if (!moduleDefinitions[targetModuleId]) {
        // Check for a global module loader instance.
        var otherModuleLoader = "function" === typeof moduleLoader && moduleLoader;
        // If 'preventErrorPropagation' is not set and a global loader exists, try it.
        if (!preventErrorPropagation && otherModuleLoader) return otherModuleLoader(targetModuleId, !0);
        // If a global loader reference exists, use it.
        if (globalLoaderReference) return globalLoaderReference(targetModuleId, !0);
        // If Node.js 'require' is available and the target is a string, try that.
        if (nodeModuleRequester && "string" === typeof targetModuleId) return nodeModuleRequester(targetModuleId);
        // If all attempts fail, throw an error indicating the module was not found.
        var moduleNotFoundException = new Error("Cannot locate required module: '" + targetModuleId + "'");
        throw (moduleNotFoundException.code = "MODULE_NOT_FOUND", moduleNotFoundException);
      }
      // Create a local require function for this module.
      // It resolves paths based on the module's own dependencies.
      localRequire.resolve = function(dependencyPath) {
        return moduleDefinitions[targetModuleId][1][dependencyPath] || dependencyPath;
      };
      // Initialize a cache for the local module's own dependencies.
      localRequire.cache = {};

      // Create a new module instance and store it in the cache.
      var currentModuleInstance = moduleCache[targetModuleId] = new loadModule.Module(targetModuleId);
      // Execute the module's code, passing in the necessary parameters (exports, module, etc.).
      moduleDefinitions[targetModuleId][0].call(currentModuleInstance.exports, localRequire, currentModuleInstance, currentModuleInstance.exports, this);
    }
    // Return the exports of the loaded or cached module.
    return moduleCache[targetModuleId].exports;

    // A simplified 'require' function used within individual modules.
    function localRequire(dependencyIdentifier) {
      return loadModule(localRequire.resolve(dependencyIdentifier));
    }
  }

  // Mark the loader as a Parcel-like instance.
  loadModule.isParcelRequire = !0;
  // Define the Module constructor used by the loader.
  loadModule.Module = function(moduleId) {
    this.id = moduleId;
    this.bundle = loadModule;
    this.exports = {};
  };
  // Store the module definitions and cache on the loader itself.
  loadModule.modules = moduleDefinitions;
  loadModule.cache = moduleCache;
  loadModule.parent = globalLoaderReference;
  // A function to register new modules dynamically.
  loadModule.register = function(moduleKey, moduleContent) {
    moduleDefinitions[moduleKey] = [
      function(moduleExports, moduleInstance) {
        moduleInstance.exports = moduleContent;
      }, {}
    ];
  };

  // Iterate through the entry points and attempt to load each one.
  for (var entryIndex = 0; entryIndex < entryPoints.length; entryIndex++) {
    try {
      loadModule(entryPoints[entryIndex]);
    } catch (currentLoadError) {
      // If an error occurs, store it but continue trying other entry points.
      firstError = firstError || currentLoadError;
    }
  }

  // If there are entry points, execute the last one and handle its exports.
  if (entryPoints.length) {
    var lastModuleExports = loadModule(entryPoints[entryPoints.length - 1]);
    // Handle different export scenarios (Node.js, AMD, global).
    if ("object" === typeof exports && "undefined" !== typeof module) {
      module.exports = lastModuleExports;
    } else if ("function" === typeof define && define.amd) {
      define(function() {
        return lastModuleExports;
      });
    } else if (exportName) {
      this[exportName] = lastModuleExports;
    }
  }

  // Assign the internal loader function to the global 'moduleLoader' variable.
  moduleLoader = loadModule;
  // If an error occurred during loading, re-throw it now.
  if (firstError) throw firstError;
  // Return the main module loading function.
  return loadModule;
}(
  // Module definitions provided as the first argument.
  {
    "9xaU": [
      function(moduleRequire, currentModule, moduleExports) {
        // Start of the arbitrary-precision integer library.
        // This function 't' (now 'arbitraryPrecision') is the main factory.
        var arbitraryPrecision = function(context) {
          "use strict";
          // Base for internal arithmetic operations (10 million).
          var arithmeticBase = 1e7,
            // Number of digits represented by `arithmeticBase` (7).
            baseDigitCount = 7,
            // Maximum safe integer value in JavaScript.
            maxJsSafeInteger = 9007199254740992,
            // Cached array representation of `maxJsSafeInteger`.
            maxJsSafeIntegerParts = splitIntoBaseParts(maxJsSafeInteger),
            // Characters used for base conversion (0-9, a-z).
            baseConversionDigits = "0123456789abcdefghijklmnopqrstuvwxyz",
            // Flag indicating if BigInt is supported in the environment.
            bigIntAvailable = "function" === typeof BigInt;

          // Main factory function to create a BigNumber instance.
          // Handles various input types and bases.
          function createBigNumber(valueInput, baseInput, radixChars, ignoreCaseFlag) {
            // If no value is provided, return a default instance (likely 0).
            if (void 0 === valueInput) return createBigNumber[0];
            // If baseInput is provided and not 10 (and radixChars is provided),
            // or if radixChars is explicitly true, parse as a custom base string.
            if (void 0 !== baseInput && (10 != +baseInput || radixChars)) {
              return parseBaseString(valueInput, baseInput, radixChars, ignoreCaseFlag);
            }
            // Otherwise, parse as a standard integer string or number.
            return normalizeInputToBigNumber(valueInput);
          }

          // Constructor for large numbers, stored as arrays of parts.
          function LargeNumber(partsArray, isNegative) {
            this.value = partsArray;
            this.sign = isNegative;
            this.isSmall = !1;
          }

          // Constructor for small numbers, stored as a single JS number.
          function SmallNumber(numericValue) {
            this.value = numericValue;
            this.sign = numericValue < 0;
            this.isSmall = !0;
          }

          // Constructor for BigInt-based numbers (when BigInt is available).
          function BigIntNumber(bigIntValue) {
            this.value = bigIntValue;
          }

          // Checks if a given number is within JavaScript's safe integer range.
          function isWithinSafeRange(num) {
            return -maxJsSafeInteger < num && num < maxJsSafeInteger;
          }

          // Splits a JavaScript number into an array of parts based on `arithmeticBase`.
          function splitIntoBaseParts(num) {
            // Numbers less than 10 million fit in one part.
            if (num < 1e7) return [num];
            // Numbers less than 100 trillion fit in two parts.
            if (num < 1e14) return [num % 1e7, Math.floor(num / 1e7)];
            // Larger numbers require three parts.
            return [num % 1e7, Math.floor(num / 1e7) % 1e7, Math.floor(num / 1e14)];
          }

          // Converts an array of number parts back to a single JS number if possible,
          // otherwise returns the array.
          function partsToNumberOrArray(partsArray) {
            trimLeadingZeros(partsArray);
            var partCount = partsArray.length;
            // For small arrays, check if the combined value fits in a safe integer.
            if (partCount < 4 && comparePartArrays(partsArray, maxJsSafeIntegerParts) < 0) {
              switch (partCount) {
                case 0:
                  return 0; // Empty array means zero.
                case 1:
                  return partsArray[0]; // Single part is the number itself.
                case 2:
                  return partsArray[0] + partsArray[1] * arithmeticBase; // Combine two parts.
                default:
                  return partsArray[0] + (partsArray[1] + partsArray[2] * arithmeticBase) * arithmeticBase; // Combine three parts.
              }
            }
            return partsArray; // If too large or too many parts, return the array.
          }

          // Removes leading zero parts from a number parts array.
          function trimLeadingZeros(partsArray) {
            for (var currentLength = partsArray.length; currentLength-- > 0 && 0 === partsArray[currentLength];);
            partsArray.length = currentLength + 1;
          }

          // Creates a new array filled with zeros.
          function createZeroArray(size) {
            for (var newArray = new Array(size), index = -1; ++index < size;) {
              newArray[index] = 0;
            }
            return newArray;
          }

          // Returns the floor or ceiling of a number, depending on its sign.
          function floorOrCeil(num) {
            return num > 0 ? Math.floor(num) : Math.ceil(num);
          }

          // Adds two arrays of number parts, handling carries.
          function addParts(firstParts, secondParts) {
            var firstLen = firstParts.length,
              secondLen = secondParts.length,
              resultParts = new Array(firstLen),
              carry = 0,
              base = arithmeticBase;
            // Add corresponding parts up to the length of the shorter array.
            for (var i = 0; i < secondLen; i++) {
              carry = (resultParts[i] = firstParts[i] + secondParts[i] + carry) >= base ? 1 : 0;
              resultParts[i] -= carry * base;
            }
            // Add remaining parts of the longer array, propagating carry.
            for (; i < firstLen;) {
              carry = (resultParts[i] = firstParts[i] + carry) === base ? 1 : 0;
              resultParts[i++] -= carry * base;
            }
            // If there's a final carry, append it.
            carry > 0 && resultParts.push(carry);
            return resultParts;
          }

          // Wrapper for addParts, ensuring the longer array is first.
          function addPartsOrdered(partsA, partsB) {
            return partsA.length >= partsB.length ? addParts(partsA, partsB) : addParts(partsB, partsA);
          }

          // Adds a small number (as a carry) to an array of parts.
          function addSmallToParts(partsArray, smallValue) {
            var partValue,
              partIndex,
              arrayLength = partsArray.length,
              resultParts = new Array(arrayLength),
              base = arithmeticBase;
            // Iterate through parts, adding the small value and propagating carry.
            for (partIndex = 0; partIndex < arrayLength; partIndex++) {
              partValue = partsArray[partIndex] - base + smallValue; // Small value acts as a carry here
              smallValue = Math.floor(partValue / base);
              resultParts[partIndex] = partValue - smallValue * base;
              smallValue += 1; // Adjust smallValue for next iteration (carry logic)
            }
            // Append any remaining carry.
            for (; smallValue > 0;) {
              resultParts[partIndex++] = smallValue % base;
              smallValue = Math.floor(smallValue / base);
            }
            return resultParts;
          }

          // Subtracts one array of number parts from another.
          function subtractParts(minuendParts, subtrahendParts) {
            var minuendLen = minuendParts.length,
              subtrahendLen = subtrahendParts.length,
              resultParts = new Array(minuendLen),
              borrow = 0,
              base = arithmeticBase;
            // Subtract corresponding parts, handling borrows.
            for (var i = 0; i < subtrahendLen; i++) {
              if (((resultParts[i] = minuendParts[i] - borrow - subtrahendParts[i])) < 0) {
                resultParts[i] += base;
                borrow = 1;
              } else {
                borrow = 0;
              }
            }
            // Subtract remaining parts of the minuend, propagating borrow.
            for (; i < minuendLen; i++) {
              if (!((resultParts[i] = minuendParts[i] - borrow) < 0)) {
                resultParts[i++] = resultParts[i];
                break;
              }
              resultParts[i] += base;
            }
            // Copy any remaining parts from the minuend.
            for (; i < minuendLen; i++) {
              resultParts[i] = minuendParts[i];
            }
            trimLeadingZeros(resultParts);
            return resultParts;
          }

          // Subtracts a small value (as a negative carry) from an array of parts.
          function subtractSmallFromParts(partsArray, smallValue, isNegativeResult) {
            var partValue,
              partIndex,
              arrayLength = partsArray.length,
              resultParts = new Array(arrayLength),
              carry = -smallValue, // Treat smallValue as a negative carry
              base = arithmeticBase;
            // Iterate through parts, subtracting the small value and propagating carry.
            for (partIndex = 0; partIndex < arrayLength; partIndex++) {
              partValue = partsArray[partIndex] + carry;
              carry = Math.floor(partValue / base);
              resultParts[partIndex] = partValue % base;
              if (resultParts[partIndex] < 0) resultParts[partIndex] += base;
            }
            resultParts = partsToNumberOrArray(resultParts);
            // If the result is a small number, apply the sign.
            if ("number" === typeof resultParts) {
              return isNegativeResult && (resultParts = -resultParts), new SmallNumber(resultParts);
            }
            // Otherwise, create a LargeNumber with the calculated sign.
            return new LargeNumber(resultParts, isNegativeResult);
          }

          // Multiplies two arrays of number parts (long multiplication).
          function multiplyParts(partsA, partsB) {
            var lenA = partsA.length,
              lenB = partsB.length,
              resultParts = createZeroArray(lenA + lenB),
              base = arithmeticBase;
            // Standard long multiplication algorithm.
            for (var i = 0; i < lenA; ++i) {
              var currentPartA = partsA[i];
              for (var j = 0; j < lenB; ++j) {
                var product = currentPartA * partsB[j] + resultParts[i + j];
                var carry = Math.floor(product / base);
                resultParts[i + j] = product - carry * base;
                resultParts[i + j + 1] += carry;
              }
            }
            trimLeadingZeros(resultParts);
            return resultParts;
          }

          // Multiplies an array of number parts by a single small number.
          function multiplyPartsBySmall(partsArray, smallMultiplier) {
            var partValue,
              partIndex,
              arrayLength = partsArray.length,
              resultParts = new Array(arrayLength),
              base = arithmeticBase,
              carry = 0;
            // Iterate through parts, multiplying and propagating carry.
            for (partIndex = 0; partIndex < arrayLength; partIndex++) {
              partValue = partsArray[partIndex] * smallMultiplier + carry;
              carry = Math.floor(partValue / base);
              resultParts[partIndex] = partValue - carry * base;
            }
            // Append any remaining carry.
            for (; carry > 0;) {
              resultParts[partIndex++] = carry % base;
              carry = Math.floor(carry / base);
            }
            return resultParts;
          }

          // Prepends a specified number of zeros to an array.
          function prependZeros(partsArray, zeroCount) {
            for (var zeros = []; zeroCount-- > 0;) zeros.push(0);
            return zeros.concat(partsArray);
          }

          // Creates a LargeNumber from multiplication involving a small value.
          function createLargeNumberFromSmallMultiplication(smallValue, partsArray, isNegative) {
            return new LargeNumber(smallValue < arithmeticBase ? multiplyPartsBySmall(partsArray, smallValue) : multiplyParts(partsArray, splitIntoBaseParts(smallValue)), isNegative);
          }

          // Squares an array of number parts.
          function squareParts(partsArray) {
            var arrayLength = partsArray.length,
              resultParts = createZeroArray(arrayLength + arrayLength),
              base = arithmeticBase;
            // Optimized squaring algorithm.
            for (var i = 0; i < arrayLength; i++) {
              var currentPart = partsArray[i];
              var carry = 0 - currentPart * currentPart; // Initialize carry with negative square
              for (var j = i; j < arrayLength; j++) {
                var product = currentPart * partsArray[j] * 2 + resultParts[i + j] + carry;
                carry = Math.floor(product / base);
                resultParts[i + j] = product - carry * base;
              }
              resultParts[i + arrayLength] = carry;
            }
            trimLeadingZeros(resultParts);
            return resultParts;
          }

          // Divides an array of number parts by a single small number.
          function dividePartsBySmall(partsArray, smallDivisor) {
            var remainder = 0,
              arrayLength = partsArray.length,
              resultParts = new Array(arrayLength),
              base = arithmeticBase;
            // Perform division from most significant digit to least.
            for (var i = arrayLength - 1; i >= 0; --i) {
              remainder = (remainder * base + partsArray[i]);
              resultParts[i] = floorOrCeil(remainder / smallDivisor);
              remainder = remainder - resultParts[i] * smallDivisor;
            }
            return [resultParts, remainder];
          }

          // Performs general division between two BigNumber instances.
          function performDivision(dividend, divisor) {
            var normalizedDivisor = normalizeInputToBigNumber(divisor);
            // Handle BigInt division if supported.
            if (bigIntAvailable) {
              return [new BigIntNumber(dividend.value / normalizedDivisor.value), new BigIntNumber(dividend.value % normalizedDivisor.value)];
            }
            var dividendValue = dividend.value,
              divisorValue = normalizedDivisor.value;

            // Handle division by zero.
            if (0 === divisorValue) throw new Error("Cannot divide by zero");

            // Handle small number cases.
            if (dividend.isSmall) {
              return normalizedDivisor.isSmall ? [new SmallNumber(floorOrCeil(dividendValue / divisorValue)), new SmallNumber(dividendValue % divisorValue)] : [createBigNumber[0], dividend];
            }
            if (normalizedDivisor.isSmall) {
              // Handle division by 1 or -1.
              if (1 === divisorValue) return [dividend, createBigNumber[0]];
              if (-1 == divisorValue) return [dividend.negate(), createBigNumber[0]];
              var absDivisor = Math.abs(divisorValue);
              // Optimize for divisors within arithmetic base.
              if (absDivisor < arithmeticBase) {
                var divisionResult = dividePartsBySmall(dividendValue, absDivisor);
                var quotientParts = partsToNumberOrArray(divisionResult[0]);
                var remainderValue = divisionResult[1];
                // Adjust remainder sign.
                if (dividend.sign) remainderValue = -remainderValue;
                // Create quotient BigNumber.
                if ("number" === typeof quotientParts) {
                  return (dividend.sign !== normalizedDivisor.sign && (quotientParts = -quotientParts), [new SmallNumber(quotientParts), new SmallNumber(remainderValue)]);
                }
                return [new LargeNumber(quotientParts, dividend.sign !== normalizedDivisor.sign), new SmallNumber(remainderValue)];
              }
              divisorValue = splitIntoBaseParts(absDivisor); // Convert small divisor to parts.
            }

            // Compare dividend and divisor magnitudes.
            var comparisonResult = comparePartArrays(dividendValue, divisorValue);
            if (-1 === comparisonResult) return [createBigNumber[0], dividend]; // Dividend is smaller than divisor.
            if (0 === comparisonResult) return [createBigNumber[dividend.sign === normalizedDivisor.sign ? 1 : -1], createBigNumber[0]]; // Dividend equals divisor.

            // Perform actual long division.
            var divisionPair = (dividendValue.length + divisorValue.length <= 200 ? karatsubaDivision(dividendValue, divisorValue) : longDivision(dividendValue, divisorValue));
            var quotientResult = divisionPair[0];
            var remainderResult = divisionPair[1];
            var isQuotientNegative = dividend.sign !== normalizedDivisor.sign;
            var isRemainderNegative = dividend.sign;

            // Convert quotient and remainder to BigNumber instances.
            if ("number" === typeof quotientResult) {
              return (isQuotientNegative && (quotientResult = -quotientResult), quotientResult = new SmallNumber(quotientResult), [quotientResult, "number" === typeof remainderResult ? (isRemainderNegative && (remainderResult = -remainderResult), new SmallNumber(remainderResult)) : new LargeNumber(remainderResult, isRemainderNegative)]);
            }
            return [new LargeNumber(quotientResult, isQuotientNegative), "number" === typeof remainderResult ? (isRemainderNegative && (remainderResult = -remainderResult), new SmallNumber(remainderResult)) : new LargeNumber(remainderResult, isRemainderNegative)];
          }

          // Karatsuba-like division algorithm (optimized for smaller inputs).
          function karatsubaDivision(dividendParts, divisorParts) {
            var currentQuotient,
              currentRemainder,
              divisionCoefficient,
              dividendPart,
              divisorPart,
              dividendLen = dividendParts.length,
              divisorLen = divisorParts.length,
              base = arithmeticBase,
              zeroArray = createZeroArray(divisorLen),
              lastDivisorPart = divisorParts[divisorLen - 1],
              scalingFactor = Math.ceil(base / (2 * lastDivisorPart)),
              scaledDividend = multiplyPartsBySmall(dividendParts, scalingFactor),
              scaledDivisor = multiplyPartsBySmall(divisorParts, scalingFactor);

            // Ensure scaledDividend has enough length for division.
            if (scaledDividend.length <= dividendLen) scaledDividend.push(0);
            scaledDivisor.push(0); // Pad scaledDivisor for alignment.
            lastDivisorPart = scaledDivisor[divisorLen - 1]; // Update last divisor part.

            // Perform division iteration from most significant parts.
            for (currentQuotient = dividendLen - divisorLen; currentQuotient >= 0; currentQuotient--) {
              // Estimate quotient digit.
              divisionCoefficient = base - 1;
              if (scaledDividend[currentQuotient + divisorLen] !== lastDivisorPart) {
                divisionCoefficient = Math.floor((scaledDividend[currentQuotient + divisorLen] * base + scaledDividend[currentQuotient + divisorLen - 1]) / lastDivisorPart);
              }

              // Multiply divisor by estimated quotient digit and subtract from dividend.
              var productSum = 0,
                borrowSum = 0,
                scaledDivisorLen = scaledDivisor.length,
                productIndex = 0;
              for (; productIndex < scaledDivisorLen; productIndex++) {
                productSum += divisionCoefficient * scaledDivisor[productIndex];
                currentRemainder = Math.floor(productSum / base);
                borrowSum += scaledDividend[currentQuotient + productIndex] - (productSum - currentRemainder * base);
                productSum = currentRemainder;
                if (borrowSum < 0) {
                  scaledDividend[currentQuotient + productIndex] = borrowSum + base;
                  borrowSum = -1;
                } else {
                  scaledDividend[currentQuotient + productIndex] = borrowSum;
                  borrowSum = 0;
                }
              }

              // Adjust quotient digit if subtraction resulted in a negative value.
              for (; 0 !== borrowSum;) {
                divisionCoefficient -= 1;
                productSum = 0;
                for (productIndex = 0; productIndex < scaledDivisorLen; productIndex++) {
                  if (((productSum += scaledDividend[currentQuotient + productIndex] - base + scaledDivisor[productIndex])) < 0) {
                    scaledDividend[currentQuotient + productIndex] = productSum + base;
                    productSum = 0;
                  } else {
                    scaledDividend[currentQuotient + productIndex] = productSum;
                    productSum = 1;
                  }
                }
                borrowSum += productSum;
              }
              zeroArray[currentQuotient] = divisionCoefficient;
            }
            // Scale dividend back down to get the remainder.
            scaledDividend = dividePartsBySmall(scaledDividend, scalingFactor)[0];
            return [partsToNumberOrArray(zeroArray), partsToNumberOrArray(scaledDividend)];
          }

          // Standard long division algorithm (for very large inputs).
          function longDivision(dividendParts, divisorParts) {
            for (
              var currentQuotient,
                currentRemainder,
                estimatedQuotient,
                tempDividend,
                tempDivisorProduct,
                dividendLen = dividendParts.length,
                divisorLen = divisorParts.length,
                quotientArray = [],
                remainderArray = [],
                base = arithmeticBase; dividendLen;) {

              // Shift remainderArray and add a digit from dividendParts.
              remainderArray.unshift(dividendParts[--dividendLen]);
              trimLeadingZeros(remainderArray);

              // If current remainder is less than divisor, quotient digit is 0.
              if (comparePartArrays(remainderArray, divisorParts) < 0) {
                quotientArray.push(0);
              } else {
                // Estimate quotient digit.
                estimatedQuotient = remainderArray[(currentRemainder = remainderArray.length) - 1] * base + remainderArray[currentRemainder - 2];
                tempDividend = divisorParts[divisorLen - 1] * base + divisorParts[divisorLen - 2];

                // If remainder is larger, adjust estimate.
                if (currentRemainder > divisorLen) {
                  estimatedQuotient = (estimatedQuotient + 1) * base;
                }
                currentQuotient = Math.ceil(estimatedQuotient / tempDividend);

                // Refine quotient digit by trial multiplication and subtraction.
                do {
                  if (comparePartArrays(tempDivisorProduct = multiplyPartsBySmall(divisorParts, currentQuotient), remainderArray) <= 0) break;
                  currentQuotient--;
                } while (currentQuotient);

                quotientArray.push(currentQuotient);
                remainderArray = subtractParts(remainderArray, tempDivisorProduct); // Update remainder.
              }
            }
            quotientArray.reverse(); // Reverse quotient digits to correct order.
            return [partsToNumberOrArray(quotientArray), partsToNumberOrArray(remainderArray)];
          }

          // Compares two arrays of number parts.
          function comparePartArrays(partsA, partsB) {
            // If lengths differ, the longer one is greater.
            if (partsA.length !== partsB.length) return partsA.length > partsB.length ? 1 : -1;
            // Compare parts from most significant to least significant.
            for (var i = partsA.length - 1; i >= 0; i--) {
              if (partsA[i] !== partsB[i]) return partsA[i] > partsB[i] ? 1 : -1;
            }
            return 0; // Arrays are equal.
          }

          // Checks for primality using small prime tests.
          function checkSmallPrimes(numberInstance) {
            var absoluteNum = numberInstance.abs();
            // Not prime if 0, 1, or negative.
            if (!absoluteNum.isUnit() && (
                !!(absoluteNum.isEqualTo(2) || absoluteNum.isEqualTo(3) || absoluteNum.isEqualTo(5)) || // Check 2, 3, 5
                !(absoluteNum.isEven() || absoluteNum.isDivisibleBy(3) || absoluteNum.isDivisibleBy(5)) // Divisible by 2, 3, 5
              )) {
              // If it passes small divisibility tests, and is less than 49, it's prime.
              return !!absoluteNum.lesser(49) || void 0;
            }
            return !1; // Failed small prime tests.
          }

          // Performs Miller-Rabin primality test.
          function millerRabinTest(candidateNum, witnesses) {
            // Calculate d and s such that candidateNum - 1 = 2^s * d.
            for (var d = candidateNum.prev(), s = d, expCount = 0; s.isEven();) {
              s = s.divide(2);
              expCount++;
            }

            // Iterate through witnesses.
            testWitnessLoop:
              for (var witnessIndex = 0; witnessIndex < witnesses.length; witnessIndex++) {
                // If candidateNum is less than witness, skip.
                if (!candidateNum.lesser(witnesses[witnessIndex])) {
                  // Compute a = witness^d mod candidateNum.
                  var currentWitnessVal = arbitraryPrecision(witnesses[witnessIndex]).modPow(s, candidateNum);
                  // If a is 1 or candidateNum - 1, continue to next witness.
                  if (!currentWitnessVal.isUnit() && !currentWitnessVal.isEqualTo(d)) {
                    // Otherwise, check a^(2^r) mod candidateNum.
                    for (var r = expCount - 1; 0 != r; r--) {
                      currentWitnessVal = currentWitnessVal.square().mod(candidateNum);
                      // If it becomes 1, it's composite.
                      if (currentWitnessVal.isUnit()) return !1;
                      // If it becomes candidateNum - 1, continue to next witness.
                      if (currentWitnessVal.isEqualTo(d)) continue testWitnessLoop;
                    }
                    return !1; // Composite.
                  }
                }
              }
            return !0; // Probably prime.
          }

          // Set up prototype chain for BigNumber types.
          LargeNumber.prototype = Object.create(createBigNumber.prototype);
          SmallNumber.prototype = Object.create(createBigNumber.prototype);
          BigIntNumber.prototype = Object.create(createBigNumber.prototype);

          // --- LargeNumber (array-based) Prototype Methods ---

          LargeNumber.prototype.add = function(other) {
            var otherNum = normalizeInputToBigNumber(other);
            // If signs are different, convert to subtraction.
            if (this.sign !== otherNum.sign) return this.subtract(otherNum.negate());
            var thisValue = this.value,
              otherValue = otherNum.value;
            // If other number is small, add its absolute value to parts.
            return otherNum.isSmall ? new LargeNumber(addSmallToParts(thisValue, Math.abs(otherValue)), this.sign) : new LargeNumber(addPartsOrdered(thisValue, otherValue), this.sign);
          };
          LargeNumber.prototype.plus = LargeNumber.prototype.add;

          // --- SmallNumber Prototype Methods ---

          SmallNumber.prototype.add = function(other) {
            var otherNum = normalizeInputToBigNumber(other),
              thisValue = this.value;
            // If signs are different, convert to subtraction.
            if ((thisValue < 0) !== otherNum.sign) return this.subtract(otherNum.negate());
            var otherValue = otherNum.value;
            // If other number is small, perform direct addition.
            if (otherNum.isSmall) {
              if (isWithinSafeRange(thisValue + otherValue)) return new SmallNumber(thisValue + otherValue);
              otherValue = splitIntoBaseParts(Math.abs(otherValue)); // Convert to parts if too large.
            }
            // Add parts, setting sign based on thisValue.
            return new LargeNumber(addSmallToParts(otherValue, Math.abs(thisValue)), thisValue < 0);
          };
          SmallNumber.prototype.plus = SmallNumber.prototype.add;

          // --- BigIntNumber Prototype Methods ---

          BigIntNumber.prototype.add = function(other) {
            return new BigIntNumber(this.value + normalizeInputToBigNumber(other).value);
          };
          BigIntNumber.prototype.plus = BigIntNumber.prototype.add;

          // --- LargeNumber (array-based) Subtraction ---

          LargeNumber.prototype.subtract = function(other) {
            var otherNum = normalizeInputToBigNumber(other);
            // If signs are different, convert to addition.
            if (this.sign !== otherNum.sign) return this.add(otherNum.negate());
            var thisValue = this.value,
              otherValue = otherNum.value;
            // If other number is small, subtract its absolute value from parts.
            return otherNum.isSmall ? subtractSmallFromParts(thisValue, Math.abs(otherValue), this.sign) : function(minuendParts, subtrahendParts, isNegativeResult) {
              var resultParts;
              // Determine which is larger to ensure positive result before sign.
              return comparePartArrays(minuendParts, subtrahendParts) >= 0 ? (resultParts = subtractParts(minuendParts, subtrahendParts)) : (resultParts = subtractParts(subtrahendParts, minuendParts), isNegativeResult = !isNegativeResult),
                "number" === typeof(resultParts = partsToNumberOrArray(resultParts)) ? (isNegativeResult && (resultParts = -resultParts), new SmallNumber(resultParts)) : new LargeNumber(resultParts, isNegativeResult);
            }(thisValue, otherValue, this.sign);
          };
          LargeNumber.prototype.minus = LargeNumber.prototype.subtract;

          // --- SmallNumber Subtraction ---

          SmallNumber.prototype.subtract = function(other) {
            var otherNum = normalizeInputToBigNumber(other),
              thisValue = this.value;
            // If signs are different, convert to addition.
            if ((thisValue < 0) !== otherNum.sign) return this.add(otherNum.negate());
            var otherValue = otherNum.value;
            // If other number is small, perform direct subtraction.
            return otherNum.isSmall ? new SmallNumber(thisValue - otherValue) : subtractSmallFromParts(otherValue, Math.abs(thisValue), thisValue >= 0);
          };
          SmallNumber.prototype.minus = SmallNumber.prototype.subtract;

          // --- BigIntNumber Subtraction ---

          BigIntNumber.prototype.subtract = function(other) {
            return new BigIntNumber(this.value - normalizeInputToBigNumber(other).value);
          };
          BigIntNumber.prototype.minus = BigIntNumber.prototype.subtract;

          // --- Negation ---

          LargeNumber.prototype.negate = function() {
            return new LargeNumber(this.value, !this.sign);
          };
          SmallNumber.prototype.negate = function() {
            var currentSign = this.sign,
              negatedNum = new SmallNumber(-this.value);
            return negatedNum.sign = !currentSign, negatedNum;
          };
          BigIntNumber.prototype.negate = function() {
            return new BigIntNumber(-this.value);
          };

          // --- Absolute Value ---

          LargeNumber.prototype.abs = function() {
            return new LargeNumber(this.value, !1);
          };
          SmallNumber.prototype.abs = function() {
            return new SmallNumber(Math.abs(this.value));
          };
          BigIntNumber.prototype.abs = function() {
            return new BigIntNumber(this.value >= 0 ? this.value : -this.value);
          };

          // --- Multiplication ---

          LargeNumber.prototype.multiply = function(other) {
            var smallMultiplierValue,
              arrayMultiplierValue,
              otherNum = normalizeInputToBigNumber(other),
              thisValue = this.value,
              otherValue = otherNum.value,
              isResultNegative = this.sign !== otherNum.sign;

            if (otherNum.isSmall) {
              if (0 === otherValue) return createBigNumber[0];
              if (1 === otherValue) return this;
              if (-1 === otherValue) return this.negate();
              // If absolute value of small multiplier is less than base, use optimized multiplication.
              if ((smallMultiplierValue = Math.abs(otherValue)) < arithmeticBase) {
                return new LargeNumber(multiplyPartsBySmall(thisValue, smallMultiplierValue), isResultNegative);
              }
              otherValue = splitIntoBaseParts(smallMultiplierValue); // Convert small multiplier to parts.
            }
            // Determine if Karatsuba multiplication is beneficial.
            smallMultiplierValue = thisValue.length;
            arrayMultiplierValue = otherValue.length;
            return new LargeNumber(-0.012 * smallMultiplierValue - 0.012 * arrayMultiplierValue + 15e-6 * smallMultiplierValue * arrayMultiplierValue > 0 ? function karatsubaMultiply(partsA, partsB) {
              var maxLength = Math.max(partsA.length, partsB.length);
              // Base case for Karatsuba: switch to standard multiplication for small arrays.
              if (maxLength <= 30) return multiplyParts(partsA, partsB);
              maxLength = Math.ceil(maxLength / 2); // Split point.

              // Split arrays into two halves.
              var upperA = partsA.slice(maxLength),
                lowerA = partsA.slice(0, maxLength),
                upperB = partsB.slice(maxLength),
                lowerB = partsB.slice(0, maxLength),
                // Recursively apply Karatsuba.
                productLower = karatsubaMultiply(lowerA, lowerB),
                productUpper = karatsubaMultiply(upperA, upperB),
                sumLowerUpperA = addPartsOrdered(lowerA, upperA),
                sumLowerUpperB = addPartsOrdered(lowerB, upperB),
                productSum = karatsubaMultiply(sumLowerUpperA, sumLowerUpperB),
                // Combine results using Karatsuba formula:
                // (a_1 * x + a_0)(b_1 * x + b_0) = a_1 b_1 x^2 + (a_1 b_0 + a_0 b_1) x + a_0 b_0
                // (a_1 b_0 + a_0 b_1) = (a_1 + a_0)(b_1 + b_0) - a_1 b_1 - a_0 b_0
                finalResult = addPartsOrdered(addPartsOrdered(productLower, prependZeros(subtractParts(subtractParts(productSum, productLower), productUpper), maxLength)), prependZeros(productUpper, 2 * maxLength));
              return trimLeadingZeros(finalResult), finalResult;
            }(thisValue, otherValue) : multiplyParts(thisValue, otherValue), isResultNegative);
          };
          LargeNumber.prototype.times = LargeNumber.prototype.multiply;

          SmallNumber.prototype._multiplyBySmall = function(smallOther) {
            return isWithinSafeRange(smallOther.value * this.value) ? new SmallNumber(smallOther.value * this.value) : createLargeNumberFromSmallMultiplication(Math.abs(smallOther.value), splitIntoBaseParts(Math.abs(this.value)), this.sign !== smallOther.sign);
          };

          LargeNumber.prototype._multiplyBySmall = function(smallOther) {
            if (0 === smallOther.value) return createBigNumber[0];
            if (1 === smallOther.value) return this;
            if (-1 === smallOther.value) return this.negate();
            return createLargeNumberFromSmallMultiplication(Math.abs(smallOther.value), this.value, this.sign !== smallOther.sign);
          };

          SmallNumber.prototype.multiply = function(other) {
            return normalizeInputToBigNumber(other)._multiplyBySmall(this);
          };
          SmallNumber.prototype.times = SmallNumber.prototype.multiply;

          BigIntNumber.prototype.multiply = function(other) {
            return new BigIntNumber(this.value * normalizeInputToBigNumber(other).value);
          };
          BigIntNumber.prototype.times = BigIntNumber.prototype.multiply;

          // --- Squaring ---

          LargeNumber.prototype.square = function() {
            return new LargeNumber(squareParts(this.value), !1);
          };
          SmallNumber.prototype.square = function() {
            var squaredValue = this.value * this.value;
            return isWithinSafeRange(squaredValue) ? new SmallNumber(squaredValue) : new LargeNumber(squareParts(splitIntoBaseParts(Math.abs(this.value))), !1);
          };
          BigIntNumber.prototype.square = function(context) {
            return new BigIntNumber(this.value * this.value);
          };

          // --- Division and Modulo ---

          LargeNumber.prototype.divmod = function(divisor) {
            var divisionResult = performDivision(this, divisor);
            return {
              quotient: divisionResult[0],
              remainder: divisionResult[1]
            };
          };
          BigIntNumber.prototype.divmod = SmallNumber.prototype.divmod = LargeNumber.prototype.divmod;

          LargeNumber.prototype.divide = function(divisor) {
            return performDivision(this, divisor)[0];
          };
          BigIntNumber.prototype.over = BigIntNumber.prototype.divide = function(divisor) {
            return new BigIntNumber(this.value / normalizeInputToBigNumber(divisor).value);
          };
          SmallNumber.prototype.over = SmallNumber.prototype.divide = LargeNumber.prototype.over = LargeNumber.prototype.divide;

          LargeNumber.prototype.mod = function(divisor) {
            return performDivision(this, divisor)[1];
          };
          BigIntNumber.prototype.mod = BigIntNumber.prototype.remainder = function(divisor) {
            return new BigIntNumber(this.value % normalizeInputToBigNumber(divisor).value);
          };
          SmallNumber.prototype.remainder = SmallNumber.prototype.mod = LargeNumber.prototype.remainder = LargeNumber.prototype.mod;

          // --- Exponentiation ---

          LargeNumber.prototype.pow = function(exponent) {
            var intermediateResult,
              baseValue,
              exponentNum = normalizeInputToBigNumber(exponent),
              thisValue = this.value,
              exponentValue = exponentNum.value;

            // Handle special cases for exponentiation.
            if (0 === exponentValue) return createBigNumber[1];
            if (0 === thisValue) return createBigNumber[0];
            if (1 === thisValue) return createBigNumber[1];
            if (-1 === thisValue) return exponentNum.isEven() ? createBigNumber[1] : createBigNumber[-1];
            if (exponentNum.sign) return createBigNumber[0]; // Negative exponent.
            if (!exponentNum.isSmall) throw new Error("The exponent " + exponentNum.toString() + " is too large.");

            // If base is small and result fits in JS number, use Math.pow.
            if (this.isSmall && isWithinSafeRange(intermediateResult = Math.pow(thisValue, exponentValue))) {
              return new SmallNumber(floorOrCeil(intermediateResult));
            }

            // Binary exponentiation (exponentiation by squaring).
            for (baseValue = this, intermediateResult = createBigNumber[1];
              !0 & exponentValue && (intermediateResult = intermediateResult.times(baseValue), --exponentValue), 0 !== exponentValue;) {
              exponentValue /= 2;
              baseValue = baseValue.square();
            }
            return intermediateResult;
          };
          SmallNumber.prototype.pow = LargeNumber.prototype.pow;

          BigIntNumber.prototype.pow = function(exponent) {
            var exponentNum = normalizeInputToBigNumber(exponent),
              thisValue = this.value,
              exponentValue = exponentNum.value,
              bigIntZero = BigInt(0),
              bigIntOne = BigInt(1),
              bigIntTwo = BigInt(2);

            // Handle special cases for BigInt exponentiation.
            if (exponentValue === bigIntZero) return createBigNumber[1];
            if (thisValue === bigIntZero) return createBigNumber[0];
            if (thisValue === bigIntOne) return createBigNumber[1];
            if (thisValue === BigInt(-1)) return exponentNum.isEven() ? createBigNumber[1] : createBigNumber[-1];
            if (exponentNum.isNegative()) return new BigIntNumber(bigIntZero); // Negative exponent results in 0 for BigInt (no fractions).

            // Binary exponentiation for BigInt.
            for (var baseBigInt = this, resultBigInt = createBigNumber[1];
              (exponentValue & bigIntOne) === bigIntOne && (resultBigInt = resultBigInt.times(baseBigInt), --exponentValue), exponentValue !== bigIntZero;) {
              exponentValue /= bigIntTwo;
              baseBigInt = baseBigInt.square();
            }
            return resultBigInt;
          };

          // --- Modular Exponentiation (a^b mod m) ---

          LargeNumber.prototype.modPow = function(exponent, modulus) {
            exponent = normalizeInputToBigNumber(exponent);
            modulus = normalizeInputToBigNumber(modulus);
            if (modulus.isZero()) throw new Error("Cannot take modPow with modulus 0");

            var result = createBigNumber[1],
              baseMod = this.mod(modulus);

            // Standard algorithm for modular exponentiation.
            for (; exponent.isPositive();) {
              if (baseMod.isZero()) return createBigNumber[0]; // If base mod modulus is 0, result is 0.
              if (exponent.isOdd()) result = result.multiply(baseMod).mod(modulus);
              exponent = exponent.divide(2);
              baseMod = baseMod.square().mod(modulus);
            }
            return result;
          };
          BigIntNumber.prototype.modPow = SmallNumber.prototype.modPow = LargeNumber.prototype.modPow;

          // --- Comparison Operations ---

          LargeNumber.prototype.compareAbs = function(other) {
            var otherNum = normalizeInputToBigNumber(other),
              thisValue = this.value,
              otherValue = otherNum.value;
            return otherNum.isSmall ? 1 : comparePartArrays(thisValue, otherValue);
          };
          SmallNumber.prototype.compareAbs = function(other) {
            var otherNum = normalizeInputToBigNumber(other),
              thisValueAbs = Math.abs(this.value),
              otherValue = otherNum.value;
            // Compare absolute values.
            return otherNum.isSmall ? thisValueAbs === (otherValue = Math.abs(otherValue)) ? 0 : thisValueAbs > otherValue ? 1 : -1 : -1;
          };
          BigIntNumber.prototype.compareAbs = function(other) {
            var thisValue = this.value,
              otherValue = normalizeInputToBigNumber(other).value;
            // Get absolute values.
            thisValue = thisValue >= 0 ? thisValue : -thisValue;
            otherValue = otherValue >= 0 ? otherValue : -otherValue;
            return thisValue === otherValue ? 0 : thisValue > otherValue ? 1 : -1;
          };

          LargeNumber.prototype.compare = function(other) {
            if (other === 1 / 0) return -1; // Positive infinity is always greater.
            if (other === -1 / 0) return 1; // Negative infinity is always smaller.
            var otherNum = normalizeInputToBigNumber(other),
              thisValue = this.value,
              otherValue = otherNum.value;
            // Compare signs first.
            if (this.sign !== otherNum.sign) return otherNum.sign ? 1 : -1;
            // If other is small, compare with its sign.
            if (otherNum.isSmall) return this.sign ? -1 : 1;
            // Compare parts, then apply sign.
            return comparePartArrays(thisValue, otherValue) * (this.sign ? -1 : 1);
          };
          LargeNumber.prototype.compareTo = LargeNumber.prototype.compare;

          SmallNumber.prototype.compare = function(other) {
            if (other === 1 / 0) return -1;
            if (other === -1 / 0) return 1;
            var otherNum = normalizeInputToBigNumber(other),
              thisValue = this.value,
              otherValue = otherNum.value;
            // If other is small, direct comparison.
            if (otherNum.isSmall) return thisValue === otherValue ? 0 : thisValue > otherValue ? 1 : -1;
            // Compare signs.
            return (thisValue < 0) !== otherNum.sign ? thisValue < 0 ? -1 : 1 : thisValue < 0 ? 1 : -1;
          };
          SmallNumber.prototype.compareTo = SmallNumber.prototype.compare;

          BigIntNumber.prototype.compare = function(other) {
            if (other === 1 / 0) return -1;
            if (other === -1 / 0) return 1;
            var thisValue = this.value,
              otherValue = normalizeInputToBigNumber(other).value;
            return thisValue === otherValue ? 0 : thisValue > otherValue ? 1 : -1;
          };
          BigIntNumber.prototype.compareTo = BigIntNumber.prototype.compare;

          // --- Equality Checks ---

          LargeNumber.prototype.equals = function(other) {
            return 0 === this.compare(other);
          };
          BigIntNumber.prototype.eq = BigIntNumber.prototype.equals = SmallNumber.prototype.eq = SmallNumber.prototype.equals = LargeNumber.prototype.eq = LargeNumber.prototype.equals;

          LargeNumber.prototype.notEquals = function(other) {
            return 0 !== this.compare(other);
          };
          BigIntNumber.prototype.neq = BigIntNumber.prototype.notEquals = SmallNumber.prototype.neq = SmallNumber.prototype.notEquals = LargeNumber.prototype.neq = LargeNumber.prototype.notEquals;

          // --- Magnitude Comparisons ---

          LargeNumber.prototype.greater = function(other) {
            return this.compare(other) > 0;
          };
          BigIntNumber.prototype.gt = BigIntNumber.prototype.greater = SmallNumber.prototype.gt = SmallNumber.prototype.greater = LargeNumber.prototype.gt = LargeNumber.prototype.greater;

          LargeNumber.prototype.lesser = function(other) {
            return this.compare(other) < 0;
          };
          BigIntNumber.prototype.lt = BigIntNumber.prototype.lesser = SmallNumber.prototype.lt = SmallNumber.prototype.lesser = LargeNumber.prototype.lt = LargeNumber.prototype.lesser;

          LargeNumber.prototype.greaterOrEquals = function(other) {
            return this.compare(other) >= 0;
          };
          BigIntNumber.prototype.geq = BigIntNumber.prototype.greaterOrEquals = SmallNumber.prototype.geq = SmallNumber.prototype.greaterOrEquals = LargeNumber.prototype.geq = LargeNumber.prototype.greaterOrEquals;

          LargeNumber.prototype.lesserOrEquals = function(other) {
            return this.compare(other) <= 0;
          };
          BigIntNumber.prototype.leq = BigIntNumber.prototype.lesserOrEquals = SmallNumber.prototype.leq = SmallNumber.prototype.lesserOrEquals = LargeNumber.prototype.leq = LargeNumber.prototype.lesserOrEquals;

          // --- Parity Checks ---

          LargeNumber.prototype.isEven = function() {
            return 0 === (1 & this.value[0]);
          };
          SmallNumber.prototype.isEven = function() {
            return 0 === (1 & this.value);
          };
          BigIntNumber.prototype.isEven = function() {
            return (this.value & BigInt(1)) === BigInt(0);
          };

          LargeNumber.prototype.isOdd = function() {
            return 1 === (1 & this.value[0]);
          };
          SmallNumber.prototype.isOdd = function() {
            return 1 === (1 & this.value);
          };
          BigIntNumber.prototype.isOdd = function() {
            return (this.value & BigInt(1)) === BigInt(1);
          };

          // --- Sign Checks ---

          LargeNumber.prototype.isPositive = function() {
            return !this.sign;
          };
          SmallNumber.prototype.isPositive = function() {
            return this.value > 0;
          };
          BigIntNumber.prototype.isPositive = SmallNumber.prototype.isPositive;

          LargeNumber.prototype.isNegative = function() {
            return this.sign;
          };
          SmallNumber.prototype.isNegative = function() {
            return this.value < 0;
          };
          BigIntNumber.prototype.isNegative = SmallNumber.prototype.isNegative;

          // --- Special Value Checks ---

          LargeNumber.prototype.isUnit = function() {
            return !1; // LargeNumber cannot be 1 or -1 directly.
          };
          SmallNumber.prototype.isUnit = function() {
            return 1 === Math.abs(this.value);
          };
          BigIntNumber.prototype.isUnit = function() {
            return this.abs().value === BigInt(1);
          };

          LargeNumber.prototype.isZero = function() {
            return !1; // LargeNumber cannot be 0 directly (it would be a SmallNumber).
          };
          SmallNumber.prototype.isZero = function() {
            return 0 === this.value;
          };
          BigIntNumber.prototype.isZero = function() {
            return this.value === BigInt(0);
          };

          // --- Divisibility Checks ---

          LargeNumber.prototype.isDivisibleBy = function(divisor) {
            var divisorNum = normalizeInputToBigNumber(divisor);
            // Cannot divide by zero.
            return !divisorNum.isZero() && (
              !!divisorNum.isUnit() || // Any number is divisible by 1 or -1.
              (0 === divisorNum.compareAbs(2) ? this.isEven() : this.mod(divisorNum).isZero()) // Check parity or full modulo.
            );
          };
          BigIntNumber.prototype.isDivisibleBy = SmallNumber.prototype.isDivisibleBy = LargeNumber.prototype.isDivisibleBy;

          // --- Primality Tests ---

          LargeNumber.prototype.isPrime = function(trialCount) {
            var smallPrimeCheck = checkSmallPrimes(this);
            if (void 0 !== smallPrimeCheck) return smallPrimeCheck; // If small prime test yields a result, use it.

            var absValue = this.abs(),
              bitLen = absValue.bitLength();
            // For numbers up to 64 bits, use fixed set of witnesses.
            if (bitLen.lesserOrEquals(64)) {
              return millerRabinTest(absValue, [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37]);
            }
            // For larger numbers, compute number of witnesses based on bit length.
            var logBitLen = Math.log(2) * bitLen.toJSNumber(),
              numWitnesses = Math.ceil(!0 === trialCount ? 2 * Math.pow(logBitLen, 2) : logBitLen),
              witnessList = [];
            for (var i = 0; i < numWitnesses; i++) witnessList.push(arbitraryPrecision(i + 2));
            return millerRabinTest(absValue, witnessList);
          };
          BigIntNumber.prototype.isPrime = SmallNumber.prototype.isPrime = LargeNumber.prototype.isPrime;

          LargeNumber.prototype.isProbablePrime = function(witnessCount) {
            var smallPrimeCheck = checkSmallPrimes(this);
            if (void 0 !== smallPrimeCheck) return smallPrimeCheck;

            var absValue = this.abs(),
              numWitnesses = void 0 === witnessCount ? 5 : witnessCount,
              witnessList = [];
            // Generate random witnesses.
            for (var i = 0; i < numWitnesses; i++) {
              witnessList.push(arbitraryPrecision.randBetween(2, absValue.minus(2)));
            }
            return millerRabinTest(absValue, witnessList);
          };
          BigIntNumber.prototype.isProbablePrime = SmallNumber.prototype.isProbablePrime = LargeNumber.prototype.isProbablePrime;

          // --- Modular Inverse ---

          LargeNumber.prototype.modInv = function(modulus) {
            var tempRemainder,
              tempQuotient,
              oldX,
              newX = arbitraryPrecision.zero,
              currentX = arbitraryPrecision.one,
              currentMod = normalizeInputToBigNumber(modulus),
              absoluteThis = this.abs();

            // Extended Euclidean Algorithm.
            for (; !absoluteThis.isZero();) {
              tempRemainder = currentMod.divide(absoluteThis);
              oldX = newX;
              tempQuotient = currentMod;
              newX = currentX;
              currentMod = absoluteThis;
              currentX = oldX.subtract(tempRemainder.multiply(currentX));
              absoluteThis = tempQuotient.subtract(tempRemainder.multiply(absoluteThis));
            }

            // If GCD is not 1, no modular inverse exists.
            if (!currentMod.isUnit()) throw new Error(this.toString() + " and " + modulus.toString() + " are not co-prime");

            // Adjust result to be positive and within modulus.
            if (-1 === newX.compare(0)) {
              newX = newX.add(modulus);
            }
            return this.isNegative() ? newX.negate() : newX;
          };
          BigIntNumber.prototype.modInv = SmallNumber.prototype.modInv = LargeNumber.prototype.modInv;

          // --- Increment/Decrement ---

          LargeNumber.prototype.next = function() {
            var currentVal = this.value;
            return this.sign ? subtractSmallFromParts(currentVal, 1, this.sign) : new LargeNumber(addSmallToParts(currentVal, 1), this.sign);
          };
          SmallNumber.prototype.next = function() {
            var currentVal = this.value;
            return currentVal + 1 < maxJsSafeInteger ? new SmallNumber(currentVal + 1) : new LargeNumber(maxJsSafeIntegerParts, !1);
          };
          BigIntNumber.prototype.next = function() {
            return new BigIntNumber(this.value + BigInt(1));
          };

          LargeNumber.prototype.prev = function() {
            var currentVal = this.value;
            return this.sign ? new LargeNumber(addSmallToParts(currentVal, 1), !0) : subtractSmallFromParts(currentVal, 1, this.sign);
          };
          SmallNumber.prototype.prev = function() {
            var currentVal = this.value;
            return currentVal - 1 > -maxJsSafeInteger ? new SmallNumber(currentVal - 1) : new LargeNumber(maxJsSafeIntegerParts, !0);
          };
          BigIntNumber.prototype.prev = function() {
            return new BigIntNumber(this.value - BigInt(1));
          };

          // --- Bitwise Shift Constants ---
          // Precomputed powers of 2 for efficient shifting.
          for (var shiftPowers = [1]; 2 * shiftPowers[shiftPowers.length - 1] <= arithmeticBase;) {
            shiftPowers.push(2 * shiftPowers[shiftPowers.length - 1]);
          }
          var shiftPowerCount = shiftPowers.length,
            shiftBlockSize = shiftPowers[shiftPowerCount - 1];

          // Checks if a number is small enough for direct JS shifting.
          function isSmallShiftValue(num) {
            return Math.abs(num) <= arithmeticBase;
          }

          // Performs a generic bitwise operation (AND, OR, XOR).
          function performBitwiseOp(firstNum, secondNum, operation) {
            secondNum = normalizeInputToBigNumber(secondNum);
            var firstIsNegative = firstNum.isNegative(),
              secondIsNegative = secondNum.isNegative(),
              absFirst = firstIsNegative ? firstNum.not() : firstNum, // Use two's complement for negative numbers.
              absSecond = secondIsNegative ? secondNum.not() : secondNum,
              firstBlockVal = 0,
              secondBlockVal = 0,
              firstDivResult = null,
              secondDivResult = null,
              resultBlocks = [];

            // Iterate until both numbers are zero.
            for (; !absFirst.isZero() || !absSecond.isZero();) {
              // Get the least significant block.
              firstBlockVal = (firstDivResult = performDivision(absFirst, shiftBlockSize))[1].toJSNumber();
              if (firstIsNegative) firstBlockVal = shiftBlockSize - 1 - firstBlockVal; // Apply two's complement for block.

              secondBlockVal = (secondDivResult = performDivision(absSecond, shiftBlockSize))[1].toJSNumber();
              if (secondIsNegative) secondBlockVal = shiftBlockSize - 1 - secondBlockVal;

              absFirst = firstDivResult[0];
              absSecond = secondDivResult[0];
              resultBlocks.push(operation(firstBlockVal, secondBlockVal));
            }

            // Handle sign of the result.
            var finalSignAdjust = (0 !== operation(firstIsNegative ? 1 : 0, secondIsNegative ? 1 : 0)) ? arbitraryPrecision(-1) : arbitraryPrecision(0);
            var finalResult = arbitraryPrecision(0);
            // Reconstruct the number from blocks.
            for (var i = resultBlocks.length - 1; i >= 0; --i) {
              finalResult = finalResult.multiply(shiftBlockSize).add(arbitraryPrecision(resultBlocks[i]));
            }
            return finalResult;
          }

          // --- Bitwise Shifts ---

          LargeNumber.prototype.shiftLeft = function(shiftAmount) {
            var shiftVal = normalizeInputToBigNumber(shiftAmount).toJSNumber();
            if (!isSmallShiftValue(shiftVal)) throw new Error(String(shiftVal) + " is too large for shifting.");
            if (shiftVal < 0) return this.shiftRight(-shiftVal); // Delegate to shiftRight for negative shifts.

            var currentNum = this;
            if (currentNum.isZero()) return currentNum;

            // Shift by blocks.
            for (; shiftVal >= shiftPowerCount;) {
              currentNum = currentNum.multiply(shiftBlockSize);
              shiftVal -= shiftPowerCount - 1; // Adjust shift amount.
            }
            return currentNum.multiply(shiftPowers[shiftVal]); // Shift by remaining small amount.
          };
          BigIntNumber.prototype.shiftLeft = SmallNumber.prototype.shiftLeft = LargeNumber.prototype.shiftLeft;

          LargeNumber.prototype.shiftRight = function(shiftAmount) {
            var divisionResult,
              shiftVal = normalizeInputToBigNumber(shiftAmount).toJSNumber();
            if (!isSmallShiftValue(shiftVal)) throw new Error(String(shiftVal) + " is too large for shifting.");
            if (shiftVal < 0) return this.shiftLeft(-shiftVal); // Delegate to shiftLeft for negative shifts.

            var currentNum = this;
            // Shift by blocks.
            for (; shiftVal >= shiftPowerCount;) {
              // If number becomes zero or -1, stop shifting.
              if (currentNum.isZero() || (currentNum.isNegative() && currentNum.isUnit())) return currentNum;
              divisionResult = performDivision(currentNum, shiftBlockSize);
              currentNum = divisionResult[1].isNegative() ? divisionResult[0].prev() : divisionResult[0]; // Adjust for negative remainder.
              shiftVal -= shiftPowerCount - 1;
            }
            divisionResult = performDivision(currentNum, shiftPowers[shiftVal]);
            return divisionResult[1].isNegative() ? divisionResult[0].prev() : divisionResult[0]; // Adjust for negative remainder.
          };
          BigIntNumber.prototype.shiftRight = SmallNumber.prototype.shiftRight = LargeNumber.prototype.shiftRight;

          // --- Bitwise NOT (Two's Complement) ---

          LargeNumber.prototype.not = function() {
            return this.negate().prev();
          };
          BigIntNumber.prototype.not = SmallNumber.prototype.not = LargeNumber.prototype.not;

          // --- Bitwise AND ---

          LargeNumber.prototype.and = function(other) {
            return performBitwiseOp(this, other, function(valA, valB) {
              return valA & valB;
            });
          };
          BigIntNumber.prototype.and = SmallNumber.prototype.and = LargeNumber.prototype.and;

          // --- Bitwise OR ---

          LargeNumber.prototype.or = function(other) {
            return performBitwiseOp(this, other, function(valA, valB) {
              return valA | valB;
            });
          };
          BigIntNumber.prototype.or = SmallNumber.prototype.or = LargeNumber.prototype.or;

          // --- Bitwise XOR ---

          LargeNumber.prototype.xor = function(other) {
            return performBitwiseOp(this, other, function(valA, valB) {
              return valA ^ valB;
            });
          };
          BigIntNumber.prototype.xor = SmallNumber.prototype.xor = LargeNumber.prototype.xor;

          // --- Bit Length Calculation ---

          var bitmaskForC = 1 << 30,
            bitmaskForD = (arithmeticBase & -arithmeticBase) * (arithmeticBase & -arithmeticBase) | bitmaskForC;

          // Calculates the mask for the lowest set bit.
          function getLowestSetBitMask(num) {
            var numValue = num.value,
              computedMask = "number" === typeof numValue ? numValue | bitmaskForC : "bigint" === typeof numValue ? numValue | BigInt(bitmaskForC) : numValue[0] + numValue[1] * arithmeticBase | bitmaskForD;
            return computedMask & -computedMask;
          }

          LargeNumber.prototype.bitLength = function() {
            var currentNum = this;
            // For negative numbers, bit length is calculated for -(n+1).
            if (currentNum.compareTo(arbitraryPrecision(0)) < 0) {
              currentNum = currentNum.negate().subtract(arbitraryPrecision(1));
            }
            if (0 === currentNum.compareTo(arbitraryPrecision(0))) return arbitraryPrecision(0);

            // Recursive helper for bit length calculation.
            function calculateRecursiveBitLength(targetNum, powerOfTwo) {
              if (powerOfTwo.compareTo(targetNum) <= 0) {
                var recursiveResult = calculateRecursiveBitLength(targetNum, powerOfTwo.square(powerOfTwo)),
                  partialProduct = recursiveResult.partialResult,
                  exponent = recursiveResult.currentExponent,
                  fullProduct = partialProduct.multiply(powerOfTwo);
                return fullProduct.compareTo(targetNum) <= 0 ? {
                  partialResult: fullProduct,
                  currentExponent: 2 * exponent + 1
                } : {
                  partialResult: partialProduct,
                  currentExponent: 2 * exponent
                };
              }
              return {
                partialResult: arbitraryPrecision(1),
                currentExponent: 0
              };
            }
            return arbitraryPrecision(calculateRecursiveBitLength(currentNum, arbitraryPrecision(2)).currentExponent).add(arbitraryPrecision(1));
          };
          BigIntNumber.prototype.bitLength = SmallNumber.prototype.bitLength = LargeNumber.prototype.bitLength;

          // --- Min/Max ---

          // Returns the greater of two BigNumber instances.
          function maximum(numA, numB) {
            numA = normalizeInputToBigNumber(numA);
            numB = normalizeInputToBigNumber(numB);
            return numA.greater(numB) ? numA : numB;
          }

          // Returns the lesser of two BigNumber instances.
          function minimum(numA, numB) {
            numA = normalizeInputToBigNumber(numA);
            numB = normalizeInputToBigNumber(numB);
            return numA.lesser(numB) ? numA : numB;
          }

          // --- Greatest Common Divisor (GCD) ---

          function greatestCommonDivisor(numA, numB) {
            numA = normalizeInputToBigNumber(numA).abs();
            numB = normalizeInputToBigNumber(numB).abs();
            if (numA.isEqualTo(numB)) return numA;
            if (numA.isZero()) return numB;
            if (numB.isZero()) return numA;

            var commonFactor = createBigNumber[1];
            // Remove common factors of 2.
            for (; numA.isEven() && numB.isEven();) {
              var lowestBitMask = minimum(getLowestSetBitMask(numA), getLowestSetBitMask(numB));
              numA = numA.divide(lowestBitMask);
              numB = numB.divide(lowestBitMask);
              commonFactor = commonFactor.multiply(lowestBitMask);
            }
            // Remove factors of 2 from numA.
            for (; numA.isEven();) numA = numA.divide(getLowestSetBitMask(numA));

            // Euclidean algorithm.
            do {
              for (; numB.isEven();) numB = numB.divide(getLowestSetBitMask(numB));
              // Ensure numA <= numB.
              if (numA.greater(numB)) {
                var temp = numB;
                numB = numA;
                numA = temp;
              }
              numB = numB.subtract(numA);
            } while (!numB.isZero());

            return commonFactor.isUnit() ? numA : numA.multiply(commonFactor);
          }


          // --- Base Conversion Functions ---

          // Parses a string representation of a number in a given base.
          var parseBaseString = function(stringValue, base, charSet, ignoreCase) {
            charSet = charSet || baseConversionDigits;
            stringValue = String(stringValue);
            if (!ignoreCase) {
              stringValue = stringValue.toLowerCase();
              charSet = charSet.toLowerCase();
            }

            var charMap = {};
            for (var i = 0; i < charSet.length; i++) charMap[charSet[i]] = i;

            // Validate digits based on base.
            for (var charIndex = 0; charIndex < stringValue.length; charIndex++) {
              var currentCharacter = stringValue[charIndex];
              if ("-" !== currentCharacter && (currentCharacter in charMap && charMap[currentCharacter] >= +base)) {
                if ("1" === currentCharacter && 1 === +base) continue; // Special case for base 1.
                throw new Error(currentCharacter + " is not a valid digit in base " + base + ".");
              }
            }

            base = normalizeInputToBigNumber(base);
            var digitList = [],
              isNegative = "-" === stringValue[0];

            // Convert string to a list of BigNumber digits.
            for (var i = isNegative ? 1 : 0; i < stringValue.length; i++) {
              var char = stringValue[i];
              if (char in charMap) {
                digitList.push(normalizeInputToBigNumber(charMap[char]));
              } else {
                // Handle custom "digit" format like "<123>".
                if ("<" !== char) throw new Error(char + " is not a valid character");
                var startBracket = i;
                do {
                  i++;
                } while (">" !== stringValue[i] && i < stringValue.length);
                digitList.push(normalizeInputToBigNumber(stringValue.slice(startBracket + 1, i)));
              }
            }
            return convertFromDigitsAndBase(digitList, base, isNegative);
          };

          // Converts a list of BigNumber digits from a specific base to base 10.
          function convertFromDigitsAndBase(digitsArray, baseNum, isNegative) {
            var result = createBigNumber[0],
              powerOfBase = createBigNumber[1];
            // Polynomial evaluation: sum(digit_i * base^i).
            for (var i = digitsArray.length - 1; i >= 0; i--) {
              result = result.add(digitsArray[i].times(powerOfBase));
              powerOfBase = powerOfBase.times(baseNum);
            }
            return isNegative ? result.negate() : result;
          }

          // Converts a BigNumber to an array of digits in a specified base.
          function convertToBaseDigits(numberInstance, base) {
            base = arbitraryPrecision(base);
            // Handle edge cases for base 0, -1, 1.
            if (base.isZero()) {
              if (numberInstance.isZero()) return {
                value: [0],
                isNegative: !1
              };
              throw new Error("Cannot convert nonzero numbers to base 0.");
            }
            if (base.isEqualTo(-1)) {
              if (numberInstance.isZero()) return {
                value: [0],
                isNegative: !1
              };
              // Special representation for base -1.
              if (numberInstance.isNegative()) return {
                value: [].concat.apply([], Array.apply(null, Array(-numberInstance.toJSNumber())).map(Array.prototype.valueOf, [1, 0])),
                isNegative: !1
              };
              var onesAndZeros = Array.apply(null, Array(numberInstance.toJSNumber() - 1)).map(Array.prototype.valueOf, [0, 1]);
              return onesAndZeros.unshift([1]), {
                value: [].concat.apply([], onesAndZeros),
                isNegative: !1
              };
            }
            var isResultNegative = !1;
            // Adjust sign for negative numbers with positive base.
            if (numberInstance.isNegative() && base.isPositive()) {
              isResultNegative = !0;
              numberInstance = numberInstance.abs();
            }
            // Base 1: array of 1s.
            if (base.isUnit()) {
              return numberInstance.isZero() ? {
                value: [0],
                isNegative: !1
              } : {
                value: Array.apply(null, Array(numberInstance.toJSNumber())).map(Number.prototype.valueOf, 1),
                isNegative: isResultNegative
              };
            }

            var resultDigits = [],
              currentValue = numberInstance;
            // Repeatedly divide by base and collect remainders.
            for (; currentValue.isNegative() || currentValue.compareAbs(base) >= 0;) {
              var divisionPair = currentValue.divmod(base);
              currentValue = divisionPair.quotient;
              var remainderVal = divisionPair.remainder;
              // Adjust for negative remainders in non-standard bases.
              if (remainderVal.isNegative()) {
                remainderVal = base.minus(remainderVal).abs();
                currentValue = currentValue.next();
              }
              resultDigits.push(remainderVal.toJSNumber());
            }
            resultDigits.push(currentValue.toJSNumber());
            return {
              value: resultDigits.reverse(),
              isNegative: isResultNegative
            };
          }

          // Formats a BigNumber into a string representation in a given base.
          function formatToBaseString(numberInstance, base, customChars) {
            var converted = convertToBaseDigits(numberInstance, base);
            return (converted.isNegative ? "-" : "") + converted.value.map(function(digit) {
              return function(digitValue, charSet) {
                charSet = charSet || baseConversionDigits;
                return digitValue < charSet.length ? charSet[digitValue] : "<" + digitValue + ">";
              }(digit, customChars);
            }).join("");
          }

          // Parses a string into an integer, handling exponents and BigInt if available.
          function parseIntegerString(stringValue) {
            if (isWithinSafeRange(+stringValue)) {
              var jsNum = +stringValue;
              if (jsNum === floorOrCeil(jsNum)) {
                return bigIntAvailable ? new BigIntNumber(BigInt(jsNum)) : new SmallNumber(jsNum);
              }
              throw new Error("Invalid integer: " + stringValue);
            }

            var isNegative = "-" === stringValue[0];
            if (isNegative) stringValue = stringValue.slice(1);

            var parts = stringValue.split(/e/i);
            if (parts.length > 2) throw new Error("Invalid integer: " + parts.join("e"));

            // Handle scientific notation.
            if (2 === parts.length) {
              var exponentPart = parts[1];
              if ("+" === exponentPart[0]) exponentPart = exponentPart.slice(1);
              if ((exponentPart = +exponentPart) !== floorOrCeil(exponentPart) || !isWithinSafeRange(exponentPart)) {
                throw new Error("Invalid integer: " + exponentPart + " is not a valid exponent.");
              }
              var mantissaPart = parts[0],
                decimalPointIndex = mantissaPart.indexOf(".");
              if (decimalPointIndex >= 0) {
                exponentPart -= mantissaPart.length - decimalPointIndex - 1;
                mantissaPart = mantissaPart.slice(0, decimalPointIndex) + mantissaPart.slice(decimalPointIndex + 1);
              }
              if (exponentPart < 0) throw new Error("Cannot include negative exponent part for integers");
              stringValue = mantissaPart + new Array(exponentPart + 1).join("0");
            }

            // Validate integer format.
            if (!/^([0-9][0-9]*)$/.test(stringValue)) throw new Error("Invalid integer: " + stringValue);

            // Create BigIntNumber or LargeNumber.
            if (bigIntAvailable) return new BigIntNumber(BigInt(isNegative ? "-" + stringValue : stringValue));

            var resultParts = [],
              stringLength = stringValue.length,
              segmentLength = baseDigitCount,
              startIndex = stringLength - segmentLength;
            for (; stringLength > 0;) {
              resultParts.push(+stringValue.slice(startIndex, stringLength));
              startIndex -= segmentLength;
              if (startIndex < 0) startIndex = 0;
              stringLength -= segmentLength;
            }
            return trimLeadingZeros(resultParts), new LargeNumber(resultParts, isNegative);
          }

          // Normalizes various inputs into a BigNumber instance.
          function normalizeInputToBigNumber(input) {
            // Number input.
            if ("number" === typeof input) {
              return function(num) {
                if (bigIntAvailable) return new BigIntNumber(BigInt(num));
                if (isWithinSafeRange(num)) {
                  if (num !== floorOrCeil(num)) throw new Error(num + " is not an integer.");
                  return new SmallNumber(num);
                }
                return parseIntegerString(num.toString());
              }(input);
            }
            // String input.
            if ("string" === typeof input) return parseIntegerString(input);
            // BigInt input.
            if ("bigint" === typeof input) return new BigIntNumber(input);
            // Already a BigNumber instance.
            return input;
          }

          // --- BigNumber Prototype Methods for Output ---

          LargeNumber.prototype.toArray = function(base) {
            return convertToBaseDigits(this, base);
          };
          SmallNumber.prototype.toArray = function(base) {
            return convertToBaseDigits(this, base);
          };
          BigIntNumber.prototype.toArray = function(base) {
            return convertToBaseDigits(this, base);
          };

          LargeNumber.prototype.toString = function(base, customChars) {
            if (void 0 === base) base = 10;
            if (10 !== base) return formatToBaseString(this, base, customChars);

            var partsArray = this.value,
              partCount = partsArray.length,
              resultString = String(partsArray[--partCount]);
            // Concatenate parts, padding with zeros as needed.
            for (; --partCount >= 0;) {
              var currentPartString = String(partsArray[partCount]);
              resultString += "0000000".slice(currentPartString.length) + currentPartString;
            }
            return (this.sign ? "-" : "") + resultString;
          };
          SmallNumber.prototype.toString = function(base, customChars) {
            return void 0 === base && (base = 10), 10 != base ? formatToBaseString(this, base, customChars) : String(this.value);
          };
          BigIntNumber.prototype.toString = SmallNumber.prototype.toString;

          BigIntNumber.prototype.toJSON = LargeNumber.prototype.toJSON = SmallNumber.prototype.toJSON = function() {
            return this.toString();
          };

          LargeNumber.prototype.valueOf = function() {
            return parseInt(this.toString(), 10);
          };
          LargeNumber.prototype.toJSNumber = LargeNumber.prototype.valueOf;
          SmallNumber.prototype.valueOf = function() {
            return this.value;
          };
          SmallNumber.prototype.toJSNumber = SmallNumber.prototype.valueOf;
          BigIntNumber.prototype.valueOf = BigIntNumber.prototype.toJSNumber = function() {
            return parseInt(this.toString(), 10);
          };

          // Pre-populate common BigNumber instances (0-999 and their negatives).
          for (var i = 0; i < 1e3; i++) {
            createBigNumber[i] = normalizeInputToBigNumber(i);
            if (i > 0) createBigNumber[-i] = normalizeInputToBigNumber(-i);
          }

          // Static properties and methods on the main factory function.
          createBigNumber.one = createBigNumber[1];
          createBigNumber.zero = createBigNumber[0];
          createBigNumber.minusOne = createBigNumber[-1];
          createBigNumber.max = maximum;
          createBigNumber.min = minimum;
          createBigNumber.gcd = greatestCommonDivisor;
          createBigNumber.lcm = function(numA, numB) {
            numA = normalizeInputToBigNumber(numA).abs();
            numB = normalizeInputToBigNumber(numB).abs();
            return numA.divide(greatestCommonDivisor(numA, numB)).multiply(numB);
          };
          createBigNumber.isInstance = function(obj) {
            return obj instanceof LargeNumber || obj instanceof SmallNumber || obj instanceof BigIntNumber;
          };
          createBigNumber.randBetween = function(lowerBound, upperBound) {
            var minVal = minimum(lowerBound = normalizeInputToBigNumber(lowerBound), upperBound = normalizeInputToBigNumber(upperBound)),
              rangeSize = maximum(lowerBound, upperBound).subtract(minVal).add(1);

            if (rangeSize.isSmall) {
              return minVal.add(Math.floor(Math.random() * rangeSize));
            }

            var rangeParts = convertToBaseDigits(rangeSize, arithmeticBase).value,
              randomParts = [],
              allZeros = !0;
            // Generate random parts up to the range's magnitude.
            for (var i = 0; i < rangeParts.length; i++) {
              var limit = allZeros ? rangeParts[i] : arithmeticBase,
                randomPart = floorOrCeil(Math.random() * limit);
              randomParts.push(randomPart);
              if (randomPart < limit) allZeros = !1;
            }
            return minVal.add(arbitraryPrecision.fromArray(randomParts, arithmeticBase, !1));
          };
          createBigNumber.fromArray = function(parts, base, isNegative) {
            return convertFromDigitsAndBase(parts.map(normalizeInputToBigNumber), normalizeInputToBigNumber(base || 10), isNegative);
          };

          return createBigNumber;
        }(); // End of arbitrary-precision integer library.

        // Export the library for Node.js or AMD environments.
        if ("undefined" != typeof module && module.hasOwnProperty("exports")) {
          module.exports = arbitraryPrecision;
        }
        if ("function" === typeof define && define.amd) {
          define("big-integer", [], function() {
            return arbitraryPrecision;
          });
        }
      }, {}
    ],
    "Focm": [
      function(moduleRequire, currentModule, moduleExports) {
        // This object `appModules` will hold all the application-specific modules and their exports.
        var appModules = {};

        // Immediately-invoked function to define modules within `appModules`.
        ! function(moduleContainer) {
          // Import the arbitrary-precision math library.
          var bigIntLib = moduleRequire("9xaU"); // Renamed from "big-integer"

          // --- Data.ArbitraryPrecision Module Definitions ---
          moduleContainer["fromCustomBase"] = function(justConstructor) {
            return function(nothingValue) {
              return function(baseString) {
                return function(inputString) {
                  try {
                    // Attempt to parse the string as a BigInt.
                    var parsedBigInt = bigIntLib(inputString, baseString);
                    // If successful, wrap in a 'Just' constructor.
                    return justConstructor(parsedBigInt);
                  } catch (parseError) {
                    // If parsing fails, return the 'Nothing' value.
                    return nothingValue;
                  }
                };
              };
            };
          };

          moduleContainer.fromNativeInt = function(nativeInt) {
            return bigIntLib(nativeInt);
          };

          moduleContainer.toCustomBase = function(base) {
            return function(bigIntInstance) {
              return bigIntInstance.toString(base);
            };
          };

          moduleContainer.addBigInts = function(firstBigInt) {
            return function(secondBigInt) {
              return firstBigInt.add(secondBigInt);
            };
          };

          moduleContainer.multiplyBigInts = function(firstBigInt) {
            return function(secondBigInt) {
              return firstBigInt.multiply(secondBigInt);
            };
          };

          moduleContainer.subtractBigInts = function(firstBigInt) {
            return function(secondBigInt) {
              return firstBigInt.minus(secondBigInt);
            };
          };

          moduleContainer.moduloBigInts = function(firstBigInt) {
            return function(secondBigInt) {
              return firstBigInt.mod(secondBigInt);
            };
          };

          moduleContainer.compareBigIntEquality = function(firstBigInt) {
            return function(secondBigInt) {
              return firstBigInt.equals(secondBigInt);
            };
          };

          moduleContainer.isEvenNumber = function(bigIntInstance) {
            return bigIntInstance.isEven();
          };

          moduleContainer.bitwiseXor = function(firstBigInt) {
            return function(secondBigInt) {
              return firstBigInt.xor(secondBigInt);
            };
          };
        }(appModules["Data.ArbitraryPrecision"] = appModules["Data.ArbitraryPrecision"] || {}); // End of Data.ArbitraryPrecision

        // --- Other Data Modules ---
        ! function(moduleContainer) {
          "use strict";
          // Data.Equality module definition.
          appModules["Data.Equality"];
          appModules["Data.HeytingAlgebra"];
          appModules["Data.Symbol"];
          appModules["Data.Unit"];
          appModules["Data.Void"];
          appModules["Record.Unsafe"];
          appModules["Type.Data.RowList"];

          // Eq type class constructor.
          moduleContainer.EqualityTypeClass = function(equalityFunction) {
            this.eq = equalityFunction;
          };
          // Helper function to get the equality function from an Eq instance.
          moduleContainer.getEquality = function(eqInstance) {
            return eqInstance.eq;
          };
        }(appModules["Data.Equality"] = appModules["Data.Equality"] || {}); // End of Data.Equality

        ! function(moduleContainer) {
          "use strict";
          // Data.Mapping module definition.
          var mappingModule = appModules["Data.Equality"], // This is a typo in the original code, should be Data.Functor.
            semigroupoidModule = (appModules["Control.Semigroupoid"], appModules["Data.Function"]),
            unitModule = (appModules["Data.Unit"], function(mapperFunc) {
              this.map = mapperFunc;
            }),
            // Array mapping implementation for Functor.
            arrayMapperInstance = new unitModule(mappingModule.arrayMap); // Should be appModules["Data.Mapping"].arrayMap

          moduleContainer.FunctorTypeClass = unitModule;
          moduleContainer.mapFunction = function(functorInstance) {
            return functorInstance.map;
          };
          moduleContainer.functorArrayInstance = arrayMapperInstance;
          // Corrected arrayMap definition to be within Data.Mapping namespace.
          (appModules["Data.Mapping"] = appModules["Data.Mapping"] || {}).arrayMap = function(mapperFunc) {
            return function(inputArray) {
              for (var arrayLength = inputArray.length, resultArray = new Array(arrayLength), index = 0; index < arrayLength; index++) {
                resultArray[index] = mapperFunc(inputArray[index]);
              }
              return resultArray;
            };
          }();
        }(appModules["Data.Mapping"] = appModules["Data.Mapping"] || {}); // End of Data.Mapping

        ! function(moduleContainer) {
          "use strict";
          // Data.Display module definition.
          appModules["Data.Show"];
          appModules["Data.Symbol"];
          appModules["Record.Unsafe"];
          appModules["Type.Data.RowList"];

          // Show type class constructor.
          moduleContainer.DisplayTypeClass = function(displayFunction) {
            this.show = displayFunction;
          };
          // Helper function to get the display function from a Show instance.
          moduleContainer.getDisplay = function(displayInstance) {
            return displayInstance.show;
          };
        }(appModules["Data.Display"] = appModules["Data.Display"] || {}); // End of Data.Display

        ! function(moduleContainer) {
          "use strict";
          // Data.Optional (Maybe) module definition.
          appModules["Control.Alt"];
          appModules["Control.Alternative"];
          appModules["Control.Applicative"];
          appModules["Control.Apply"];
          appModules["Control.Bind"];
          appModules["Control.Category"];
          appModules["Control.Extend"];
          appModules["Control.Monad"];
          appModules["Control.MonadZero"];
          appModules["Control.Plus"];
          appModules["Data.Bounded"];
          appModules["Data.Equality"];
          appModules["Data.Function"];
          appModules["Data.Mapping"];
          appModules["Data.Functor.Invariant"];
          appModules["Data.Monoid"];
          appModules["Data.Ord"];
          appModules["Data.Ordering"];
          appModules["Data.Semigroup"];
          appModules["Data.Display"];
          appModules["Data.Unit"];
          appModules.Prelude;

          // Nothing constructor.
          var nothingConstructor = function() {
            function Nothing() {}
            return Nothing.value = new Nothing(), Nothing;
          }(),
            // Just constructor.
            justConstructor = function() {
              function Just(value) {
                this.value0 = value;
              }
              return Just.create = function(value) {
                return new Just(value);
              }, Just;
            }();

          moduleContainer.Nothing = nothingConstructor;
          moduleContainer.Just = justConstructor;
        }(appModules["Data.Optional"] = appModules["Data.Optional"] || {}); // End of Data.Optional

        ! function(moduleContainer) {
          "use strict";
          // Data.SemiRing module definition.
          appModules["Data.Semiring"];
          appModules["Data.Symbol"];
          appModules["Data.Unit"];
          appModules["Record.Unsafe"];
          appModules["Type.Data.Row"];
          appModules["Type.Data.RowList"];

          // Semiring type class constructor.
          moduleContainer.SemiRingTypeClass = function(addOp, mulOp, oneVal, zeroVal) {
            this.add = addOp;
            this.mul = mulOp;
            this.one = oneVal;
            this.zero = zeroVal;
          };
          // Helper functions for Semiring operations.
          moduleContainer.getAdd = function(semiringInstance) {
            return semiringInstance.add;
          };
          moduleContainer.getZero = function(semiringInstance) {
            return semiringInstance.zero;
          };
          moduleContainer.getMul = function(semiringInstance) {
            return semiringInstance.mul;
          };
          moduleContainer.getOne = function(semiringInstance) {
            return semiringInstance.one;
          };
        }(appModules["Data.SemiRing"] = appModules["Data.SemiRing"] || {}); // End of Data.SemiRing

        ! function(moduleContainer) {
          "use strict";
          // Data.AlgebraicRing module definition.
          appModules["Data.Ring"];
          appModules["Data.SemiRing"];
          appModules["Data.Symbol"];
          appModules["Data.Unit"];
          appModules["Record.Unsafe"];
          appModules["Type.Data.RowList"];

          // Ring type class constructor.
          moduleContainer.AlgebraicRingTypeClass = function(semiringParent, subOp) {
            this.Semiring0 = semiringParent; // Reference to the parent Semiring instance.
            this.sub = subOp;
          };
          // Helper function for Ring subtraction.
          moduleContainer.getSub = function(ringInstance) {
            return ringInstance.sub;
          };
        }(appModules["Data.AlgebraicRing"] = appModules["Data.AlgebraicRing"] || {}); // End of Data.AlgebraicRing

        ! function(moduleContainer) {
          "use strict";
          // Partial.UnsafeOps module definition.
          (appModules["Partial.UnsafeOps"] = appModules["Partial.UnsafeOps"] || {}).forceUnsafePartial = function(partialFunc) {
            return partialFunc();
          };
        }(appModules["Partial.UnsafeOps"] = appModules["Partial.UnsafeOps"] || {}); // End of Partial.UnsafeOps

        ! function(moduleContainer) {
          "use strict";
          // PartialOperations module definition.
          (appModules["PartialOperations"] = appModules["PartialOperations"] || {}).throwCrash = function() {
            return function(errorMessage) {
              throw new Error(errorMessage);
            };
          }();
        }(appModules["PartialOperations"] = appModules["PartialOperations"] || {}); // End of PartialOperations

        ! function(moduleContainer) {
          "use strict";
          // Re-export throwCrash from PartialOperations.
          var partialOps = appModules.PartialOperations;
          moduleContainer.throwCrash = partialOps.throwCrash;
        }(appModules.PartialOperations = appModules.PartialOperations || {}); // End of PartialOperations

        ! function(moduleContainer) {
          "use strict";
          // UnsafeCrashWith function from Partial.UnsafeOps.
          var unsafePartialOps = appModules["Partial.UnsafeOps"],
            partialOps = appModules.PartialOperations;
          moduleContainer.unsafeCrashWith = function(errorMessage) {
            return unsafePartialOps.forceUnsafePartial(function(context) {
              return partialOps.throwCrash(context)(errorMessage);
            });
          };
        }(appModules["Partial.UnsafeOps"] = appModules["Partial.UnsafeOps"] || {}); // End of Partial.UnsafeOps

        ! function(moduleContainer) {
          "use strict";
          // Data.ArbitraryPrecision module with instances and helpers.
          var bigIntApi = appModules["Data.ArbitraryPrecision"],
            equalityModule = (appModules["Control.Semigroupoid"], appModules["Data.Array.NonEmpty"], appModules["Data.CommutativeRing"], appModules["Data.Equality"]),
            euclideanRingModule = (appModules["Data.EuclideanRing"], appModules["Data.Function"]),
            intModule = (appModules["Data.Int"], appModules["Data.Optional"]),
            orderingModule = (appModules["Data.Ord"], appModules["Data.Ordering"], appModules["Data.AlgebraicRing"]),
            semigroupModule = (appModules["Data.Semigroup"], appModules["Data.SemiRing"]),
            showModule = (appModules["Data.Display"], appModules["Data.String.NonEmpty"], appModules["Data.String.NonEmpty.Internal"], appModules["Partial.UnsafeOps"], appModules.Prelude),

            // BigInt utilities from the imported library.
            decimalToStringConverter = bigIntApi.toCustomBase(10),
            semiringInstance = new semigroupModule.SemiRingTypeClass(bigIntApi.addBigInts, bigIntApi.multiplyBigInts, bigIntApi.fromNativeInt(1), bigIntApi.fromNativeInt(0)),
            ringInstance = new orderingModule.AlgebraicRingTypeClass(function() {
              return semiringInstance;
            }, bigIntApi.subtractBigInts),
            remainderOp = bigIntApi.moduloBigInts,
            baseParser = bigIntApi["fromCustomBase"](intModule.Just.create)(intModule.Nothing.value),
            decimalParser = baseParser(10),
            equalityChecker = new equalityModule.EqualityTypeClass(bigIntApi.compareBigIntEquality);

          moduleContainer.parseFromString = decimalParser;
          moduleContainer.parseFromBase = baseParser;
          moduleContainer.convertToString = decimalToStringConverter;
          moduleContainer.calculateRemainder = remainderOp;
          moduleContainer.bigIntEquality = equalityChecker;
          moduleContainer.semiringBigInt = semiringInstance;
          moduleContainer.ringBigInt = ringInstance;
          moduleContainer.fromInteger = bigIntApi.fromNativeInt;
          moduleContainer.isEvenValue = bigIntApi.isEvenNumber;
          moduleContainer.bitwiseXorOp = bigIntApi.bitwiseXor;
        }(appModules["Data.ArbitraryPrecision"] = appModules["Data.ArbitraryPrecision"] || {}); // End of Data.ArbitraryPrecision with instances

        ! function(moduleContainer) {
          "use strict";
          // Data.BooleanLogic module.
          (appModules["Data.BooleanLogic"] = appModules["Data.BooleanLogic"] || {}).otherwiseBoolean = !0;
        }(appModules["Data.BooleanLogic"] = appModules["Data.BooleanLogic"] || {}); // End of Data.BooleanLogic

        ! function(moduleContainer) {
          "use strict";
          // Data.CommonString module.
          moduleContainer.splitString = function(separator) {
            return function(targetString) {
              return targetString.split(separator);
            };
          };
          moduleContainer.trimString = function(targetString) {
            return targetString.trim();
          };
        }(appModules["Data.CommonString"] = appModules["Data.CommonString"] || {}); // End of Data.CommonString

        ! function(moduleContainer) {
          "use strict";
          // Re-export string utilities.
          var commonStringOps = appModules["Data.CommonString"];
          appModules["Data.Equality"];
          appModules["Data.Ordering"];
          appModules["Data.String.Pattern"];
          appModules.Prelude;

          moduleContainer.splitText = commonStringOps.splitString;
          moduleContainer.trimText = commonStringOps.trimString;
        }(appModules["Data.CommonString"] = appModules["Data.CommonString"] || {}); // End of Data.CommonString re-exports

        ! function(moduleContainer) {
          "use strict";
          // ContestProblemSolver module (AtCoder.ABC121.D equivalent).
          var bigIntUtilities = appModules["Data.ArbitraryPrecision"],
            booleanLogic = appModules["Data.BooleanLogic"],
            equalityUtilities = appModules["Data.Equality"],
            mappingUtilities = appModules["Data.Mapping"],
            optionalUtilities = appModules["Data.Optional"],
            ringUtilities = appModules["Data.AlgebraicRing"],
            semiringUtilities = (appModules["Data.Semigroup"], appModules["Data.SemiRing"]),
            stringUtilities = (appModules["Data.String"], appModules["Data.CommonString"]),
            patternUtilities = (appModules["Data.String.Pattern"], appModules["Partial.UnsafeOps"]),
            preludeModule = (appModules.Prelude,

              // The core logic for problem D (F-function calculation).
              function(valA) {
                return function(valB) {
                  // If A equals B, result is A.
                  if (equalityUtilities.getEquality(bigIntUtilities.bigIntEquality)(valA)(valB)) return valA;

                  // If A is even.
                  if (bigIntUtilities.isEvenValue(valA)) {
                    var tempSum = semiringUtilities.getAdd(bigIntUtilities.semiringBigInt)(ringUtilities.getSub(bigIntUtilities.ringBigInt)(valB)(valA))(semiringUtilities.getOne(bigIntUtilities.semiringBigInt)),
                      adjustedSum = bigIntUtilities.isEvenValue(tempSum) ? tempSum : ringUtilities.getSub(bigIntUtilities.ringBigInt)(tempSum)(semiringUtilities.getOne(bigIntUtilities.semiringBigInt)),
                      modFourResult = equalityUtilities.getEquality(bigIntUtilities.bigIntEquality)(bigIntUtilities.calculateRemainder(adjustedSum)(bigIntUtilities.fromInteger(4)))(semiringUtilities.getZero(bigIntUtilities.semiringBigInt)) ? semiringUtilities.getZero(bigIntUtilities.semiringBigInt) : semiringUtilities.getOne(bigIntUtilities.semiringBigInt);
                    return bigIntUtilities.bitwiseXorOp(bigIntUtilities.isEvenValue(adjustedSum) ? semiringUtilities.getZero(bigIntUtilities.semiringBigInt) : valB)(modFourResult);
                  }
                  // If A is odd.
                  if (booleanLogic.otherwiseBoolean) {
                    return bigIntUtilities.bitwiseXorOp(valA)(valB)(solveCoreFunction(semiringUtilities.getAdd(bigIntUtilities.semiringBigInt)(valA)(semiringUtilities.getOne(bigIntUtilities.semiringBigInt)))(valB));
                  }
                  // Fallback for exhaustive pattern matching (should not be reached).
                  throw new Error("Failed pattern match at AtCoder.ABC121.D (line 23, column 1 - line 23, column 38): " + [valA.constructor.name, valB.constructor.name]);
                };
              });

          moduleContainer.solveCoreFunction = solveCoreFunction;
          // Main function to solve the problem for given input string.
          moduleContainer.solveProblem = function(inputString) {
            var inputParts,
              trimmedInput = stringUtilities.trimText(inputString),
              splitInput = stringUtilities.splitText(" ")(trimmedInput),
              // Map string parts to BigInts, expecting two 'Just' values.
              parsedInput = 2 === (inputParts = mappingUtilities.mapFunction(mappingUtilities.functorArrayInstance)(bigIntUtilities.parseFromString)(splitInput)).length && inputParts[0] instanceof optionalUtilities.Just && inputParts[1] instanceof optionalUtilities.Just ? {
                firstVal: inputParts[0].value0,
                secondVal: inputParts[1].value0
              } : patternUtilities.unsafeCrashWith("BigInt.fromString parsing failed");

            // Apply the core logic and format the output.
            return bigIntUtilities.convertToString(solveCoreFunction(parsedInput.firstVal)(parsedInput.secondVal)) + "\n";
          };
        }(appModules["ContestProblemSolver"] = appModules["ContestProblemSolver"] || {}); // End of ContestProblemSolver

        ! function(moduleContainer) {
          "use strict";
          // Node.TextEncoding module.
          appModules["Node.Encoding"];
          var displayUtil = appModules["Data.Display"],
            preludeModule = (appModules.Prelude,

              // Encoding types as constructors.
              function() {
                function ASCII() {}
                return ASCII.value = new ASCII(), ASCII;
              }()),
            utf8Encoding = function() {
              function UTF8() {}
              return UTF8.value = new UTF8(), UTF8;
            }(),
            utf16leEncoding = function() {
              function UTF16LE() {}
              return UTF16LE.value = new UTF16LE(), UTF16LE;
            }(),
            ucs2Encoding = function() {
              function UCS2() {}
              return UCS2.value = new UCS2(), UCS2;
            }(),
            base64Encoding = function() {
              function Base64() {}
              return Base64.value = new Base64(), Base64;
            }(),
            latin1Encoding = function() {
              function Latin1() {}
              return Latin1.value = new Latin1(), Latin1;
            }(),
            binaryEncoding = function() {
              function Binary() {}
              return Binary.value = new Binary(), Binary;
            }(),
            hexEncoding = function() {
              function Hex() {}
              return Hex.value = new Hex(), Hex;
            }(),
            // Show instance for Encoding types.
            encodingDisplay = new displayUtil.DisplayTypeClass(function(encodingInstance) {
              if (encodingInstance instanceof preludeModule) return "ASCII";
              if (encodingInstance instanceof utf8Encoding) return "UTF8";
              if (encodingInstance instanceof utf16leEncoding) return "UTF16LE";
              if (encodingInstance instanceof ucs2Encoding) return "UCS2";
              if (encodingInstance instanceof base64Encoding) return "Base64";
              if (encodingInstance instanceof latin1Encoding) return "Latin1";
              if (encodingInstance instanceof binaryEncoding) return "Binary";
              if (encodingInstance instanceof hexEncoding) return "Hex";
              throw new Error("Failed pattern match at Node.Encoding (line 19, column 1 - line 19, column 39): " + [encodingInstance.constructor.name]);
            });

          moduleContainer.AsciiEncoding = preludeModule;
          moduleContainer.Utf8Encoding = utf8Encoding;
          moduleContainer.Utf16leEncoding = utf16leEncoding;
          moduleContainer.Ucs2Encoding = ucs2Encoding;
          moduleContainer.Base64Encoding = base64Encoding;
          moduleContainer.Latin1Encoding = latin1Encoding;
          moduleContainer.BinaryEncoding = binaryEncoding;
          moduleContainer.HexEncoding = hexEncoding;
          moduleContainer.encodingDisplayInstance = encodingDisplay;
        }(appModules["Node.TextEncoding"] = appModules["Node.TextEncoding"] || {}); // End of Node.TextEncoding

        ! function(moduleContainer) {
          "use strict";
          // Node.FileSysInternal module.
          (appModules["Node.FileSysInternal"] = appModules["Node.FileSysInternal"] || {}).unsafeRequireFsModule = moduleRequire("fs");
        }(appModules["Node.FileSysInternal"] = appModules["Node.FileSysInternal"] || {}); // End of Node.FileSysInternal

        ! function(moduleContainer) {
          "use strict";
          // Unsafe.TypeCoercion module.
          (appModules["Unsafe.TypeCoercion"] = appModules["Unsafe.TypeCoercion"] || {}).unsafeTypeCast = function(value) {
            return value;
          };
        }(appModules["Unsafe.TypeCoercion"] = appModules["Unsafe.TypeCoercion"] || {}); // End of Unsafe.TypeCoercion

        ! function(moduleContainer) {
          "use strict";
          // Re-export unsafeTypeCast.
          var typeCoercion = appModules["Unsafe.TypeCoercion"];
          moduleContainer.unsafeTypeCast = typeCoercion.unsafeTypeCast;
        }(appModules["Unsafe.TypeCoercion"] = appModules["Unsafe.TypeCoercion"] || {}); // End of Unsafe.TypeCoercion re-export

        ! function(moduleContainer) {
          "use strict";
          // Node.FileSysInternal module with effect utilities.
          var fileSystemInternal = appModules["Node.FileSysInternal"],
            effectModule = (appModules.Effect, appModules.Prelude, appModules["Unsafe.TypeCoercion"].unsafeTypeCast);

          moduleContainer.createEffect = effectModule;
          moduleContainer.unsafeRequireFsModule = fileSystemInternal.unsafeRequireFsModule;
        }(appModules["Node.FileSysInternal"] = appModules["Node.FileSysInternal"] || {}); // End of Node.FileSysInternal effects

        ! function(moduleContainer) {
          "use strict";
          // Node.FileSyncOps module.
          appModules["Control.Bind"];
          appModules["Control.Semigroupoid"];
          appModules["Data.DateTime"];
          appModules["Data.DateTime.Instant"];
          appModules["Data.EuclideanRing"];
          appModules["Data.Function"];
          appModules["Data.Function.Uncurried"];
          appModules["Data.Mapping"];
          appModules["Data.Int"];
          appModules["Data.Optional"];
          appModules["Data.Nullable"];

          var displayUtil = appModules["Data.Display"],
            durationUtil = (appModules["Data.Time.Duration"], appModules.Effect, appModules["Node.Buffer"]),
            encodingUtil = appModules["Node.TextEncoding"],
            fileSystemModule = (appModules["Node.FS"], appModules["Node.FileSysInternal"]),
            permsModule = (appModules["Node.FS.Perms"], appModules["Node.FS.Stats"], appModules["Node.Path"], appModules.Prelude),
            nodeFsAPI = fileSystemModule.unsafeRequireFsModule; // The actual Node.js 'fs' module.

          // Reads a text file synchronously.
          moduleContainer.readTextFileSynchronously = function(encodingType) {
            return function(filePath) {
              return fileSystemModule.createEffect(function(context) {
                return nodeFsAPI.readFileSync(filePath, {
                  encoding: displayUtil.getDisplay(encodingUtil.encodingDisplayInstance)(encodingType)
                });
              });
            };
          };

          // Appends text to a file synchronously.
          moduleContainer.appendTextFileSynchronously = function(encodingType) {
            return function(filePath) {
              return function(contentToAppend) {
                return fileSystemModule.createEffect(function(context) {
                  return nodeFsAPI.appendFileSync(filePath, contentToAppend, {
                    encoding: displayUtil.getDisplay(encodingUtil.encodingDisplayInstance)(encodingType)
                  });
                });
              };
            };
          };
        }(appModules["Node.FileSyncOps"] = appModules["Node.FileSyncOps"] || {}); // End of Node.FileSyncOps

        ! function(moduleContainer) {
          "use strict";
          // MainProgram module.
          var problemSolverModule = appModules["ContestProblemSolver"],
            applicativeModule = (appModules["Control.Applicative"], appModules["Control.Bind"], appModules.Effect),
            encodingUtil = appModules["Node.TextEncoding"],
            syncFileSystem = appModules["Node.FileSyncOps"],
            preludeModule = (appModules.Prelude, problemSolverModule.solveProblem);

          // The main entry point function for the application.
          moduleContainer.mainEntryPoint = function() {
            // Read input from stdin using UTF8 encoding.
            var fileContent = syncFileSystem.readTextFileSynchronously(encodingUtil.Utf8Encoding.value)("/dev/stdin")(),
              // Calculate the solution using the problem solver.
              finalOutput = preludeModule(fileContent);
            // Append the calculated output to stdout using UTF8 encoding.
            return syncFileSystem.appendTextFileSynchronously(encodingUtil.Utf8Encoding.value)("/dev/stdout")(finalOutput)();
          };
        }(appModules.MainProgram = appModules.MainProgram || {}); // End of MainProgram

        // Execute the main program entry point.
        appModules.MainProgram.mainEntryPoint();
      }, {
        "big-integer": "9xaU"
      }
    ]
  }, {}, ["Focm"], null
);