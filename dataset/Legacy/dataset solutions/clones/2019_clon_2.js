"use strict";

// This module provides arbitrary-precision integer arithmetic capabilities.
// It uses an internal array-based representation for large numbers
// and optimizes for smaller numbers that fit within JavaScript's native limits.
const largeNum = function(undefVal) {
    // Configuration constants for internal representation
    const CHUNK_SIZE = 10_000_000; // Base for internal number representation (10^7)
    const CHUNK_DIGITS = 7;       // Number of decimal digits per chunk (log10(CHUNK_SIZE))
    const JS_MAX_SAFE_INTEGER = 9007199254740992; // Maximum safe integer in JavaScript (2^53 - 1)
    // Decomposed representation of JS_MAX_SAFE_INTEGER for comparison purposes
    const SAFE_INT_LIMIT_PARTS = decomposeSmallNum(JS_MAX_SAFE_INTEGER);
    // Logarithm of MAX_SAFE_INTEGER, used for base conversion checks to avoid overflow
    const LOG_SAFE_INT_LIMIT = Math.log(JS_MAX_SAFE_INTEGER);

    /**
     * Core constructor for a generic numeric entity.
     * This serves as an abstract base for LargeNumber and CompactNumber.
     * It handles initial parsing of various input types.
     * @param {any} inputVal - The value to be converted into a numeric entity.
     * @param {number} [baseVal] - Optional radix if inputVal is a string.
     * @returns {NumericEntity} An instance of LargeNumber or CompactNumber.
     */
    function NumericEntity(inputVal, baseVal) {
        // If no value is supplied, default to the zero constant.
        if (typeof inputVal === "undefined") {
            return NumericEntity[0];
        }
        // If a radix is provided, parse the value based on that radix.
        if (typeof baseVal !== "undefined") {
            // Special handling for base 10 for efficiency.
            return +baseVal === 10 ? processInput(inputVal) : interpretBaseInput(inputVal, baseVal);
        }
        // For standard input without a specified base, use generic parsing.
        return processInput(inputVal);
    }

    /**
     * Represents a number that exceeds JavaScript's safe integer range.
     * Stored as an array of numerical "chunks" in base CHUNK_SIZE.
     * @param {number[]} magnitude - Array of number chunks, representing the absolute value.
     * @param {boolean} isNegative - Flag indicating if the number is negative.
     */
    function LargeNumber(magnitude, isNegative) {
        this.magnitude = magnitude;
        this.isNegative = isNegative;
        this.isCompact = false; // Denotes this is not a small, native JS integer.
    }
    // Inherit methods and properties from the NumericEntity prototype.
    LargeNumber.prototype = Object.create(NumericEntity.prototype);

    /**
     * Represents a number that fits within JavaScript's safe integer range.
     * These numbers can leverage native JS arithmetic for performance.
     * @param {number} rawValue - The raw JavaScript number.
     */
    function CompactNumber(rawValue) {
        this.magnitude = rawValue;
        this.isNegative = rawValue < 0;
        this.isCompact = true; // Denotes this is a small, native JS integer.
    }
    // Inherit methods and properties from the NumericEntity prototype.
    CompactNumber.prototype = Object.create(NumericEntity.prototype);

    /**
     * Determines if a given number can be precisely represented by JavaScript's native number type.
     * @param {number} num - The number to evaluate.
     * @returns {boolean} True if the number is within the safe integer range, false otherwise.
     */
    function isWithinJsRange(num) {
        return -JS_MAX_SAFE_INTEGER < num && num < JS_MAX_SAFE_INTEGER;
    }

    /**
     * Converts a small integer into an array of chunks, based on CHUNK_SIZE.
     * This is used when a CompactNumber needs to interact with LargeNumber operations.
     * @param {number} num - The small integer to decompose.
     * @returns {number[]} An array of number chunks.
     */
    function decomposeSmallNum(num) {
        if (num < 10_000_000) return [num];
        if (num < 100_000_000_000_000) return [num % CHUNK_SIZE, Math.floor(num / CHUNK_SIZE)];
        return [num % CHUNK_SIZE, Math.floor(num / CHUNK_SIZE) % CHUNK_SIZE, Math.floor(num / 100_000_000_000_000)];
    }

    /**
     * Attempts to convert an array of chunks back into a native JavaScript small integer.
     * If the number is too large or contains too many chunks, the original array is returned.
     * @param {number[]} partsArray - The array of number chunks.
     * @returns {number|number[]} A small integer or the original chunk array.
     */
    function recomposeToSmallNum(partsArray) {
        normalizeParts(partsArray); // Remove any leading zero chunks first.
        const partsCount = partsArray.length;
        // Check if the number of chunks is small enough and its magnitude is within JS_MAX_SAFE_INTEGER.
        if (partsCount < 4 && compareMagnitudes(partsArray, SAFE_INT_LIMIT_PARTS) < 0) {
            switch (partsCount) {
                case 0: return 0;
                case 1: return partsArray[0];
                case 2: return partsArray[0] + partsArray[1] * CHUNK_SIZE;
                default: return partsArray[0] + (partsArray[1] + partsArray[2] * CHUNK_SIZE) * CHUNK_SIZE;
            }
        }
        return partsArray;
    }

    /**
     * Removes leading zero chunks from an array of number parts.
     * This modifies the array in place to maintain a canonical representation.
     * @param {number[]} partsArr - The array of number chunks.
     */
    function normalizeParts(partsArr) {
        let currentIdx = partsArr.length;
        while (currentIdx > 0 && partsArr[--currentIdx] === 0); // Find the last non-zero chunk.
        partsArr.length = currentIdx + 1; // Trim the array to exclude leading zeros.
    }

    /**
     * Creates a new array initialized with zeros.
     * Useful for pre-allocating result arrays in arithmetic operations.
     * @param {number} length - The desired length of the array.
     * @returns {number[]} A new array filled with zeros.
     */
    function buildZeroFilledArray(length) {
        const newArr = new Array(length);
        let iterator = -1;
        while (++iterator < length) {
            newArr[iterator] = 0;
        }
        return newArr;
    }

    /**
     * Truncates a number to its integer part. For positive numbers, it's Math.floor;
     * for negative numbers, it's Math.ceil.
     * @param {number} num - The number to truncate.
     * @returns {number} The truncated integer.
     */
    function floorOrCeil(num) {
        if (num > 0) return Math.floor(num);
        return Math.ceil(num);
    }

    /**
     * Performs addition of two positive arrays of number chunks.
     * It's assumed that `firstOperandParts` has a length greater than or equal to `secondOperandParts`.
     * @param {number[]} firstOperandParts - The first array of chunks (addend).
     * @param {number[]} secondOperandParts - The second array of chunks (addend).
     * @returns {number[]} The resulting array of chunks.
     */
    function performAddition(firstOperandParts, secondOperandParts) {
        const lenA = firstOperandParts.length;
        const lenB = secondOperandParts.length;
        const resultParts = new Array(lenA);
        let carryOver = 0;
        const currentBase = CHUNK_SIZE;
        let partSum;
        let idx;

        // Add corresponding chunks from both arrays, propagating carry.
        for (idx = 0; idx < lenB; idx++) {
            partSum = firstOperandParts[idx] + secondOperandParts[idx] + carryOver;
            carryOver = partSum >= currentBase ? 1 : 0;
            resultParts[idx] = partSum - carryOver * currentBase;
        }
        // Continue propagating carry through the remaining chunks of the longer array.
        while (idx < lenA) {
            partSum = firstOperandParts[idx] + carryOver;
            carryOver = partSum === currentBase ? 1 : 0;
            resultParts[idx++] = partSum - carryOver * currentBase;
        }
        // If there's a final carry-over, add it as a new most significant chunk.
        if (carryOver > 0) resultParts.push(carryOver);
        return resultParts;
    }

    /**
     * A flexible addition function that ensures the first array passed to `performAddition`
     * is always the longer one, optimizing the loop structure.
     * @param {number[]} arr1 - The first array of chunks.
     * @param {number[]} arr2 - The second array of chunks.
     * @returns {number[]} The resulting array of chunks.
     */
    function performFlexibleAddition(arr1, arr2) {
        if (arr1.length >= arr2.length) return performAddition(arr1, arr2);
        return performAddition(arr2, arr1);
    }

    /**
     * Adds a small integer value (or a carry/borrow) to an array of number chunks.
     * This is typically used for incrementing/decrementing or propagating results from small operations.
     * @param {number[]} partsArr - The array of number chunks.
     * @param {number} smallVal - The small integer to add (can be negative for subtraction-like effects).
     * @returns {number[]} The resulting array of chunks.
     */
    function addSmallToParts(partsArr, smallVal) {
        const len = partsArr.length;
        const resultArr = new Array(len);
        const currentBase = CHUNK_SIZE;
        let partSum;
        let idx;
        let carryOver = smallVal; // The small value acts as the initial carry.

        // Iterate through chunks, adding the carry and propagating it.
        for (idx = 0; idx < len; idx++) {
            partSum = partsArr[idx] + carryOver;
            carryOver = Math.floor(partSum / currentBase);
            resultArr[idx] = partSum % currentBase;
        }
        // Propagate any remaining carry-over to new chunks.
        while (carryOver > 0) {
            resultArr[idx++] = carryOver % currentBase;
            carryOver = Math.floor(carryOver / currentBase);
        }
        return resultArr;
    }

    // BigNumber.prototype.add method: Handles addition for large numbers.
    LargeNumber.prototype.add = function(otherNum) {
        const parsedOther = processInput(otherNum);
        // If signs are different, addition becomes subtraction of absolute values.
        if (this.isNegative !== parsedOther.isNegative) {
            return this.performSubtraction(parsedOther.invertSign());
        }
        const firstOperandParts = this.magnitude;
        const secondOperandVal = parsedOther.magnitude;

        // If the other operand is a compact number, use optimized small addition.
        if (parsedOther.isCompact) {
            return new LargeNumber(addSmallToParts(firstOperandParts, Math.abs(secondOperandVal)), this.isNegative);
        }
        // If both are large numbers, use flexible addition.
        return new LargeNumber(performFlexibleAddition(firstOperandParts, secondOperandVal), this.isNegative);
    };
    LargeNumber.prototype.addOperation = LargeNumber.prototype.add; // Alias for add.

    // CompactNumber.prototype.add method: Handles addition for small numbers.
    CompactNumber.prototype.add = function(otherNum) {
        const parsedOther = processInput(otherNum);
        const currentVal = this.magnitude;
        // If signs are different, addition becomes subtraction of absolute values.
        if ((currentVal < 0) !== parsedOther.isNegative) {
            return this.performSubtraction(parsedOther.invertSign());
        }
        const otherVal = parsedOther.magnitude;

        // If both operands are compact numbers.
        if (parsedOther.isCompact) {
            // Check if the sum still fits within JS safe integer range.
            if (isWithinJsRange(currentVal + otherVal)) {
                return new CompactNumber(currentVal + otherVal);
            }
            // If sum overflows, convert to large number addition.
            return new LargeNumber(addSmallToParts(decomposeSmallNum(Math.abs(otherVal)), Math.abs(currentVal)), currentVal < 0);
        }
        // If one is compact and the other is large, convert compact to parts and add.
        return new LargeNumber(addSmallToParts(otherVal, Math.abs(currentVal)), currentVal < 0);
    };
    CompactNumber.prototype.addOperation = CompactNumber.prototype.add; // Alias for add.

    /**
     * Performs subtraction of two positive arrays of number chunks.
     * It's assumed that `firstOperandParts` has a magnitude greater than or equal to `secondOperandParts`.
     * @param {number[]} firstOperandParts - The first array of chunks (minuend).
     * @param {number[]} secondOperandParts - The second array of chunks (subtrahend).
     * @returns {number[]} The resulting array of chunks.
     */
    function performSubtraction(firstOperandParts, secondOperandParts) {
        const opALen = firstOperandParts.length;
        const opBLen = secondOperandParts.length;
        const resArr = new Array(opALen);
        let borrowVal = 0;
        const radixUnit = CHUNK_SIZE;
        let k;
        let diffResult;

        // Subtract corresponding chunks, propagating borrow.
        for (k = 0; k < opBLen; k++) {
            diffResult = firstOperandParts[k] - borrowVal - secondOperandParts[k];
            if (diffResult < 0) {
                diffResult += radixUnit;
                borrowVal = 1;
            } else {
                borrowVal = 0;
            }
            resArr[k] = diffResult;
        }
        // Continue propagating borrow through the remaining chunks of the longer array.
        for (k = opBLen; k < opALen; k++) {
            diffResult = firstOperandParts[k] - borrowVal;
            if (diffResult < 0) {
                diffResult += radixUnit;
            } else {
                resArr[k++] = diffResult; // If no more borrow, copy remaining chunks directly.
                break;
            }
            resArr[k] = diffResult;
        }
        // Copy any remaining higher-order chunks from the minuend.
        for (; k < opALen; k++) {
            resArr[k] = firstOperandParts[k];
        }
        normalizeParts(resArr); // Remove any leading zero chunks.
        return resArr;
    }

    /**
     * A flexible subtraction function that correctly handles signs and operand order
     * by comparing absolute magnitudes before performing the subtraction.
     * @param {number[]} arrA - The first array of chunks.
     * @param {number[]} arrB - The second array of chunks.
     * @param {boolean} currentSign - The initial sign of the result (before magnitude comparison).
     * @returns {CompactNumber|LargeNumber} The result of the subtraction.
     */
    function flexibleSubtraction(arrA, arrB, currentSign) {
        let resultValue;
        // Compare absolute magnitudes to determine the order of subtraction.
        if (compareMagnitudes(arrA, arrB) >= 0) {
            resultValue = performSubtraction(arrA, arrB);
        } else {
            resultValue = performSubtraction(arrB, arrA);
            currentSign = !currentSign; // If (B - A) was computed, flip the sign.
        }
        resultValue = recomposeToSmallNum(resultValue); // Try to convert to a CompactNumber.
        if (typeof resultValue === "number") {
            if (currentSign) resultValue = -resultValue;
            return new CompactNumber(resultValue);
        }
        return new LargeNumber(resultValue, currentSign);
    }

    /**
     * Subtracts a small integer value from an array of chunks.
     * Used for operations like decrementing or small subtractions.
     * @param {number[]} partsArr - The array of number chunks (minuend).
     * @param {number} smallVal - The small integer to subtract.
     * @param {boolean} currentSign - The current sign of the number.
     * @returns {CompactNumber|LargeNumber} The result of the subtraction.
     */
    function subtractSmallFromParts(partsArr, smallVal, currentSign) {
        const len = partsArr.length;
        const resultArr = new Array(len);
        let carryOver = -smallVal; // Initial carry is negative for subtraction.
        const radixUnit = CHUNK_SIZE;
        let k;
        let diffResult;

        // Iterate through chunks, subtracting the value and propagating borrow.
        for (k = 0; k < len; k++) {
            diffResult = partsArr[k] + carryOver;
            carryOver = Math.floor(diffResult / radixUnit);
            diffResult %= radixUnit;
            resultArr[k] = diffResult < 0 ? diffResult + radixUnit : diffResult; // Handle negative chunk result.
        }
        const finalResult = recomposeToSmallNum(resultArr); // Try to convert to CompactNumber.
        if (typeof finalResult === "number") {
            if (currentSign) finalResult = -finalResult;
            return new CompactNumber(finalResult);
        }
        return new LargeNumber(finalResult, currentSign);
    }

    // BigNumber.prototype.subtract method: Handles subtraction for large numbers.
    LargeNumber.prototype.subtract = function(otherNum) {
        const parsedOther = processInput(otherNum);
        // If signs are different, subtraction becomes addition of absolute values.
        if (this.isNegative !== parsedOther.isNegative) {
            return this.add(parsedOther.invertSign());
        }
        const firstOperandParts = this.magnitude;
        const secondOperandVal = parsedOther.magnitude;

        // If the other operand is a compact number, use optimized small subtraction.
        if (parsedOther.isCompact) {
            return subtractSmallFromParts(firstOperandParts, Math.abs(secondOperandVal), this.isNegative);
        }
        // If both are large numbers, use flexible subtraction.
        return flexibleSubtraction(firstOperandParts, secondOperandVal, this.isNegative);
    };
    LargeNumber.prototype.subOperation = LargeNumber.prototype.subtract; // Alias for subtract.

    // CompactNumber.prototype.subtract method: Handles subtraction for small numbers.
    CompactNumber.prototype.subtract = function(otherNum) {
        const parsedOther = processInput(otherNum);
        const currentVal = this.magnitude;
        // If signs are different, subtraction becomes addition of absolute values.
        if ((currentVal < 0) !== parsedOther.isNegative) {
            return this.add(parsedOther.invertSign());
        }
        const otherVal = parsedOther.magnitude;

        // If both operands are compact numbers, use native JS subtraction.
        if (parsedOther.isCompact) {
            return new CompactNumber(currentVal - otherVal);
        }
        // If one is compact and the other is large, use optimized small subtraction.
        // The sign `currentVal >= 0` determines if `this` is positive.
        return subtractSmallFromParts(otherVal, Math.abs(currentVal), currentVal >= 0);
    };
    CompactNumber.prototype.subOperation = CompactNumber.prototype.subtract; // Alias for subtract.

    // BigNumber.prototype.negate method: Returns a new number with the opposite sign.
    LargeNumber.prototype.invertSign = function() {
        return new LargeNumber(this.magnitude, !this.isNegative);
    };

    // CompactNumber.prototype.negate method: Returns a new number with the opposite sign.
    CompactNumber.prototype.invertSign = function() {
        const currentSign = this.isNegative;
        const invertedCompact = new CompactNumber(-this.magnitude);
        invertedCompact.isNegative = !currentSign; // Explicitly update the sign flag.
        return invertedCompact;
    };

    // BigNumber.prototype.abs method: Returns the absolute value of the number.
    LargeNumber.prototype.getAbsoluteValue = function() {
        return new LargeNumber(this.magnitude, false); // Always positive.
    };

    // CompactNumber.prototype.abs method: Returns the absolute value of the number.
    CompactNumber.prototype.getAbsoluteValue = function() {
        return new CompactNumber(Math.abs(this.magnitude)); // Use native Math.abs.
    };

    /**
     * Performs long multiplication of two arrays of chunks (representing positive numbers).
     * This is the standard "schoolbook" multiplication algorithm.
     * @param {number[]} firstArr - The first array of chunks (multiplicand).
     * @param {number[]} secondArr - The second array of chunks (multiplier).
     * @returns {number[]} The resulting array of chunks.
     */
    function longMultiplication(firstArr, secondArr) {
        const lenFirst = firstArr.length;
        const lenSecond = secondArr.length;
        const totalLen = lenFirst + lenSecond;
        const productArray = buildZeroFilledArray(totalLen); // Initialize result array with zeros.
        const unitRadix = CHUNK_SIZE;
        let tempProd, accumCarry;
        let iterI, valA_I, valB_J;

        // Iterate through each chunk of the multiplicand.
        for (iterI = 0; iterI < lenFirst; ++iterI) {
            valA_I = firstArr[iterI];
            // Multiply by each chunk of the multiplier and add to the result array.
            for (let j = 0; j < lenSecond; ++j) {
                valB_J = secondArr[j];
                tempProd = valA_I * valB_J + productArray[iterI + j];
                accumCarry = Math.floor(tempProd / unitRadix);
                productArray[iterI + j] = tempProd - accumCarry * unitRadix;
                productArray[iterI + j + 1] += accumCarry; // Carry over to the next chunk position.
            }
        }
        normalizeParts(productArray); // Clean up any leading zero chunks.
        return productArray;
    }

    /**
     * Multiplies an array of chunks by a single small integer.
     * This is an optimized operation for when one operand is a CompactNumber.
     * @param {number[]} partsArr - The array of number chunks.
     * @param {number} smallMultiplierVal - The small integer multiplier.
     * @returns {number[]} The resulting array of chunks.
     */
    function smallMultiplier(partsArr, smallMultiplierVal) {
        const len = partsArr.length;
        const resultArr = new Array(len);
        const unitRadix = CHUNK_SIZE;
        let accumCarry = 0;
        let tempProd;
        let idx;

        // Multiply each chunk by the small value and propagate carry.
        for (idx = 0; idx < len; idx++) {
            tempProd = partsArr[idx] * smallMultiplierVal + accumCarry;
            accumCarry = Math.floor(tempProd / unitRadix);
            resultArr[idx] = tempProd - accumCarry * unitRadix;
        }
        // Add any remaining carry as new chunks.
        while (accumCarry > 0) {
            resultArr[idx++] = accumCarry % unitRadix;
            accumCarry = Math.floor(accumCarry / unitRadix);
        }
        return resultArr;
    }

    /**
     * Shifts an array of chunks to the left by prepending zeros.
     * This is equivalent to multiplying by a power of CHUNK_SIZE.
     * @param {number[]} partsArr - The array of chunks to shift.
     * @param {number} numZeros - The number of zeros to prepend (number of chunk positions to shift).
     * @returns {number[]} A new array with the zeros prepended.
     */
    function padWithZeros(partsArr, numZeros) {
        const zeroPadArr = [];
        while (numZeros-- > 0) zeroPadArr.push(0);
        return zeroPadArr.concat(partsArr);
    }

    /**
     * Implements the Karatsuba multiplication algorithm for large numbers.
     * This algorithm is asymptotically faster than long multiplication for very large inputs.
     * @param {number[]} xParts - The first array of chunks.
     * @param {number[]} yParts - The second array of chunks.
     * @returns {number[]} The resulting array of chunks.
     */
    function karatsubaProduct(xParts, yParts) {
        const maxLen = Math.max(xParts.length, yParts.length);
        // Base case: if lengths are small, revert to long multiplication for efficiency.
        if (maxLen <= 30) return longMultiplication(xParts, yParts);

        // Determine the split point for dividing the numbers into halves.
        const splitPoint = Math.ceil(maxLen / 2);

        // Divide the numbers into two halves (upper and lower chunks).
        const lowerX = xParts.slice(splitPoint);
        const upperX = xParts.slice(0, splitPoint);
        const lowerY = yParts.slice(splitPoint);
        const upperY = yParts.slice(0, splitPoint);

        // Recursively compute three products: AC, BD, and (A+B)(C+D).
        const prodAC = karatsubaProduct(upperX, upperY);
        const prodBD = karatsubaProduct(lowerX, lowerY);
        const sumProd = karatsubaProduct(
            performFlexibleAddition(upperX, lowerX),
            performFlexibleAddition(upperY, lowerY)
        );

        // Combine the results using Karatsuba's formula:
        // Z2 * B^(2m) + (Z1 - Z2 - Z0) * B^m + Z0
        // where Z2=AC, Z0=BD, Z1=(A+B)(C+D)
        const finalProduct = performFlexibleAddition(
            performFlexibleAddition(prodAC, padWithZeros(performSubtraction(performSubtraction(sumProd, prodAC), prodBD), splitPoint)),
            padWithZeros(prodBD, 2 * splitPoint)
        );
        normalizeParts(finalProduct); // Clean up any leading zeros.
        return finalProduct;
    }

    /**
     * Heuristic function to decide whether Karatsuba multiplication is more efficient
     * than standard long multiplication for given operand lengths.
     * @param {number} length1 - Length of the first operand's chunk array.
     * @param {number} length2 - Length of the second operand's chunk array.
     * @returns {boolean} True if Karatsuba is likely more efficient.
     */
    function shouldUseKaratsuba(length1, length2) {
        // This is an empirically determined threshold.
        return -0.012 * length1 - 0.012 * length2 + 0.000015 * length1 * length2 > 0;
    }

    // BigNumber.prototype.multiply method: Handles multiplication for large numbers.
    LargeNumber.prototype.multiply = function(otherNum) {
        const parsedOther = processInput(otherNum);
        const firstOperandParts = this.magnitude;
        const secondOperandVal = parsedOther.magnitude;
        const resultIsNegative = this.isNegative !== parsedOther.isNegative; // Determine sign of result.
        let absoluteVal;

        // If the other operand is a compact number.
        if (parsedOther.isCompact) {
            if (secondOperandVal === 0) return NumericEntity[0]; // Multiplication by zero.
            if (secondOperandVal === 1) return this; // Multiplication by one.
            if (secondOperandVal === -1) return this.invertSign(); // Multiplication by negative one.
            absoluteVal = Math.abs(secondOperandVal);
            // If the absolute value of the compact number fits within a single chunk, use small multiplier.
            if (absoluteVal < CHUNK_SIZE) {
                return new LargeNumber(smallMultiplier(firstOperandParts, absoluteVal), resultIsNegative);
            }
            // Otherwise, convert the compact number to parts and use long multiplication.
            return new LargeNumber(longMultiplication(firstOperandParts, decomposeSmallNum(absoluteVal)), resultIsNegative);
        }
        // If both operands are large numbers, decide between Karatsuba and long multiplication.
        if (shouldUseKaratsuba(firstOperandParts.length, secondOperandVal.length)) {
            return new LargeNumber(karatsubaProduct(firstOperandParts, secondOperandVal), resultIsNegative);
        }
        return new LargeNumber(longMultiplication(firstOperandParts, secondOperandVal), resultIsNegative);
    };
    LargeNumber.prototype.multOperation = LargeNumber.prototype.multiply; // Alias for multiply.

    /**
     * Helper function for multiplying a small integer (native JS number) with an array of chunks.
     * This handles the conversion and delegates to the appropriate multiplication function.
     * @param {number} smallNum - The small integer multiplier.
     * @param {number[]} partsArr - The array of chunks (multiplicand).
     * @param {boolean} resultSign - The sign of the final product.
     * @returns {LargeNumber} The resulting large number.
     */
    function multiplySmallAndArray(smallNum, partsArr, resultSign) {
        if (smallNum < CHUNK_SIZE) {
            return new LargeNumber(smallMultiplier(partsArr, smallNum), resultSign);
        }
        // If the "small" number is actually large enough to be represented as multiple chunks,
        // convert it to parts and use long multiplication.
        return new LargeNumber(longMultiplication(partsArr, decomposeSmallNum(smallNum)), resultSign);
    }

    // CompactNumber.prototype._multiplyByCompact (internal helper for multiplication involving a CompactNumber)
    CompactNumber.prototype._multiplyByCompact = function(otherCompact) {
        // If the product of two compact numbers still fits in JS safe integer, use native multiplication.
        if (isWithinJsRange(otherCompact.magnitude * this.magnitude)) {
            return new CompactNumber(otherCompact.magnitude * this.magnitude);
        }
        // Otherwise, convert to large number multiplication.
        return multiplySmallAndArray(
            Math.abs(otherCompact.magnitude),
            decomposeSmallNum(Math.abs(this.magnitude)),
            this.isNegative !== otherCompact.isNegative
        );
    };

    // BigNumber.prototype._multiplyByCompact (internal helper for multiplication involving a CompactNumber)
    LargeNumber.prototype._multiplyByCompact = function(otherCompact) {
        if (otherCompact.magnitude === 0) return NumericEntity[0];
        if (otherCompact.magnitude === 1) return this;
        if (otherCompact.magnitude === -1) return this.invertSign();
        return multiplySmallAndArray(Math.abs(otherCompact.magnitude), this.magnitude, this.isNegative !== otherCompact.isNegative);
    };

    // CompactNumber.prototype.multiply method: Delegates to the internal helper.
    CompactNumber.prototype.multiply = function(otherNum) {
        return processInput(otherNum)._multiplyByCompact(this);
    };
    CompactNumber.prototype.multOperation = CompactNumber.prototype.multiply; // Alias for multiply.

    /**
     * Squares an array of chunks (representing a positive number).
     * This is an optimized version of multiplication for N * N.
     * @param {number[]} partsArr - The array of chunks to square.
     * @returns {number[]} The resulting array of chunks.
     */
    function performSquaring(partsArr) {
        const len = partsArr.length;
        const resultArr = buildZeroFilledArray(len + len); // Max length of A*A is 2*len.
        const unitRadix = CHUNK_SIZE;
        let tempProd, accumCarry;
        let iterI, valA_I, valA_J;

        // Optimized squaring algorithm.
        for (iterI = 0; iterI < len; iterI++) {
            valA_I = partsArr[iterI];
            accumCarry = 0; // Reset carry for each row.
            // Calculate products for A_i * A_j (including self-product A_i * A_i).
            for (let j = iterI; j < len; j++) {
                valA_J = partsArr[j];
                // For i=j, it's A_i * A_i. For i!=j, it's 2 * (A_i * A_j).
                tempProd = (iterI === j ? valA_I * valA_J : 2 * valA_I * valA_J) + resultArr[iterI + j] + accumCarry;
                accumCarry = Math.floor(tempProd / unitRadix);
                resultArr[iterI + j] = tempProd - accumCarry * unitRadix;
            }
            resultArr[iterI + len] += accumCarry; // Add final carry for this row.
        }
        normalizeParts(resultArr); // Clean up leading zeros.
        return resultArr;
    }

    // BigNumber.prototype.square method: Squares a large number.
    LargeNumber.prototype.square = function() {
        return new LargeNumber(performSquaring(this.magnitude), false); // Square is always positive.
    };

    // CompactNumber.prototype.square method: Squares a small number.
    CompactNumber.prototype.square = function() {
        const squaredValue = this.magnitude * this.magnitude;
        // If squared value still fits in JS safe integer, return CompactNumber.
        if (isWithinJsRange(squaredValue)) {
            return new CompactNumber(squaredValue);
        }
        // Otherwise, convert to large number and square.
        return new LargeNumber(performSquaring(decomposeSmallNum(Math.abs(this.magnitude))), false);
    };

    /**
     * Implements Knuth's Algorithm D for division and modulo.
     * This is an efficient algorithm for dividing large numbers.
     * @param {number[]} dividendParts - Array of chunks for the dividend.
     * @param {number[]} divisorParts - Array of chunks for the divisor.
     * @returns {[number[], number[]]} A tuple: [quotient_parts, remainder_parts].
     */
    function divideAndModuloVariant1(dividendParts, divisorParts) {
        const dividendLen = dividendParts.length;
        const divisorLen = divisorParts.length;
        const unitRadix = CHUNK_SIZE;
        const qResult = buildZeroFilledArray(dividendLen - divisorLen + 1); // Quotient result array.
        const divisorMostSignificantDigit = divisorParts[divisorLen - 1];

        // Normalization step (D1): Adjust dividend and divisor so that the divisor's
        // most significant digit is large enough for good quotient estimation.
        const lambda = Math.ceil(unitRadix / (2 * divisorMostSignificantDigit));
        let remResult = smallMultiplier(dividendParts, lambda); // Normalized dividend.
        let divPart = smallMultiplier(divisorParts, lambda); // Normalized divisor.

        let quotientDigit, shiftAmount, accumCarry, borrowVal, k, currentLen, q;

        // Ensure normalized dividend has an extra leading zero if necessary (D2).
        if (remResult.length <= dividendLen) remResult.push(0);
        divPart.push(0); // Pad divisor with a zero for easier indexing.
        const normalizedDivisorMSD = divPart[divisorLen - 1]; // Most significant digit of normalized divisor.

        // Main loop (D3): Iterate from most significant quotient digit.
        for (shiftAmount = dividendLen - divisorLen; shiftAmount >= 0; shiftAmount--) {
            // Estimate quotient digit (D3.1).
            quotientDigit = unitRadix - 1; // Initial maximum guess.
            if (remResult[shiftAmount + divisorLen] !== normalizedDivisorMSD) {
                quotientDigit = Math.floor(
                    (remResult[shiftAmount + divisorLen] * unitRadix + remResult[shiftAmount + divisorLen - 1]) /
                    normalizedDivisorMSD
                );
            }

            // Multiply and subtract (D3.2): Perform q * divisor and subtract from dividend.
            accumCarry = 0;
            borrowVal = 0;
            currentLen = divPart.length;
            for (k = 0; k < currentLen; k++) {
                accumCarry += quotientDigit * divPart[k];
                q = Math.floor(accumCarry / unitRadix);
                borrowVal += remResult[shiftAmount + k] - (accumCarry - q * unitRadix);
                accumCarry = q;
                if (borrowVal < 0) {
                    remResult[shiftAmount + k] = borrowVal + unitRadix;
                    borrowVal = -1;
                } else {
                    remResult[shiftAmount + k] = borrowVal;
                    borrowVal = 0;
                }
            }

            // Adjust quotient digit if too large (D3.3): If subtraction resulted in a negative remainder.
            while (borrowVal !== 0) {
                quotientDigit -= 1; // Decrement quotient digit.
                accumCarry = 0;
                // Add back divisor to remainder.
                for (k = 0; k < currentLen; k++) {
                    accumCarry += remResult[shiftAmount + k] - unitRadix + divPart[k];
                    if (accumCarry < 0) {
                        remResult[shiftAmount + k] = accumCarry + unitRadix;
                        accumCarry = 0;
                    } else {
                        remResult[shiftAmount + k] = accumCarry;
                        accumCarry = 1;
                    }
                }
                borrowVal += accumCarry;
            }
            qResult[shiftAmount] = quotientDigit;
        }

        // Unnormalization step (D4): Divide the remainder by the normalization factor (lambda).
        remResult = smallDivisionAndModulo(remResult, lambda)[0];

        return [recomposeToSmallNum(qResult), recomposeToSmallNum(remResult)];
    }

    /**
     * A simpler, iterative subtraction-based division and modulo algorithm.
     * This might be slower for very large numbers but can be simpler to implement.
     * @param {number[]} dividendParts - Array of chunks for the dividend.
     * @param {number[]} divisorParts - Array of chunks for the divisor.
     * @returns {[number[], number[]]} A tuple: [quotient_parts, remainder_parts].
     */
    function divideAndModuloVariant2(dividendParts, divisorParts) {
        let dividendLen = dividendParts.length;
        const divisorLen = divisorParts.length;
        const qResult = [];
        let currentPartialDividend = []; // Accumulates chunks from the dividend.
        const unitRadix = CHUNK_SIZE;
        let estimatedQuotient;
        let xLen, highX, highY, checkResult;

        // Iterate from the most significant chunk of the dividend downwards.
        while (dividendLen > 0) {
            // Take one chunk from the dividend and prepend it to the current partial dividend.
            currentPartialDividend.unshift(dividendParts[--dividendLen]);
            normalizeParts(currentPartialDividend); // Remove leading zeros from the partial dividend.

            // If the current partial dividend is smaller than the divisor, the quotient chunk is 0.
            if (compareMagnitudes(currentPartialDividend, divisorParts) < 0) {
                qResult.push(0);
                continue;
            }

            // Estimate the quotient chunk by comparing the most significant parts.
            xLen = currentPartialDividend.length;
            highX = currentPartialDividend[xLen - 1] * unitRadix + (currentPartialDividend[xLen - 2] || 0); // Use 0 if chunk doesn't exist.
            highY = divisorParts[divisorLen - 1] * unitRadix + (divisorParts[divisorLen - 2] || 0); // Use 0 if chunk doesn't exist.
            if (xLen > divisorLen) { // If partial dividend is one chunk longer than divisor.
                highX = (highX + 1) * unitRadix; // Adjust highX for a better estimate.
            }
            estimatedQuotient = Math.ceil(highX / highY);

            // Refine the quotient chunk by trial subtraction until it's correct.
            do {
                checkResult = smallMultiplier(divisorParts, estimatedQuotient);
                if (compareMagnitudes(checkResult, currentPartialDividend) <= 0) break; // Found the correct quotient.
                estimatedQuotient--;
            } while (estimatedQuotient);

            qResult.push(estimatedQuotient); // Add the refined quotient chunk.
            currentPartialDividend = performSubtraction(currentPartialDividend, checkResult); // Update the remainder.
        }
        qResult.reverse(); // Chunks were collected in reverse order, so reverse for correct order.

        return [recomposeToSmallNum(qResult), recomposeToSmallNum(currentPartialDividend)];
    }

    /**
     * Performs division and modulo for an array of chunks by a small integer.
     * This is an optimized operation for when the divisor is a CompactNumber.
     * @param {number[]} partsArr - Array of chunks (dividend).
     * @param {number} smallDivisor - The small integer divisor.
     * @returns {[number[], number]} A tuple: [quotient_parts, remainder_number].
     */
    function smallDivisionAndModulo(partsArr, smallDivisor) {
        const len = partsArr.length;
        const qResult = buildZeroFilledArray(len);
        const unitRadix = CHUNK_SIZE;
        let k, quotientChunk, remValue, divValue;

        remValue = 0; // Initialize remainder.
        // Iterate from the most significant chunk downwards.
        for (k = len - 1; k >= 0; --k) {
            divValue = remValue * unitRadix + partsArr[k]; // Combine previous remainder with current chunk.
            quotientChunk = floorOrCeil(divValue / smallDivisor); // Calculate quotient for this step.
            remValue = divValue - quotientChunk * smallDivisor; // Calculate new remainder.
            qResult[k] = quotientChunk | 0; // Store integer part of quotient chunk.
        }
        return [qResult, remValue | 0]; // Return quotient chunks and final remainder.
    }

    /**
     * A generic division and modulo function that handles different number types and signs.
     * It dispatches to the appropriate specialized division functions.
     * @param {NumericEntity} currentNum - The dividend.
     * @param {any} divisorVal - The divisor (can be string, number, or NumericEntity).
     * @returns {[NumericEntity, NumericEntity]} A tuple: [quotient, remainder].
     * @throws {Error} If division by zero is attempted.
     */
    function flexibleDivideAndModulo(currentNum, divisorVal) {
        let resultValue;
        const parsedDivisor = processInput(divisorVal);
        const dividendParts = currentNum.magnitude;
        const divisorOperand = parsedDivisor.magnitude;
        let quotientResult;

        // Check for division by zero.
        if (divisorOperand === 0 || (Array.isArray(divisorOperand) && divisorOperand.length === 0)) {
            throw new Error("Cannot divide by zero");
        }

        // Case 1: Dividend is a CompactNumber.
        if (currentNum.isCompact) {
            if (parsedDivisor.isCompact) {
                // Both are compact, use native JS division and modulo.
                return [
                    new CompactNumber(floorOrCeil(dividendParts / divisorOperand)),
                    new CompactNumber(dividendParts % divisorOperand)
                ];
            }
            // Compact dividend, LargeNumber divisor -> quotient is 0, remainder is the dividend itself.
            return [NumericEntity[0], currentNum];
        }

        // Case 2: Dividend is a LargeNumber, divisor is a CompactNumber.
        if (parsedDivisor.isCompact) {
            if (divisorOperand === 1) return [currentNum, NumericEntity[0]]; // Division by 1.
            if (divisorOperand === -1) return [currentNum.invertSign(), NumericEntity[0]]; // Division by -1.
            const absoluteDivisor = Math.abs(divisorOperand);
            // If the absolute value of the compact divisor fits within a single chunk.
            if (absoluteDivisor < CHUNK_SIZE) {
                resultValue = smallDivisionAndModulo(dividendParts, absoluteDivisor);
                quotientResult = recomposeToSmallNum(resultValue[0]);
                let remainderResult = resultValue[1];
                if (currentNum.isNegative) remainderResult = -remainderResult; // Remainder takes sign of dividend.

                // Convert quotient to CompactNumber if possible.
                if (typeof quotientResult === "number") {
                    if (currentNum.isNegative !== parsedDivisor.isNegative) quotientResult = -quotientResult;
                    return [new CompactNumber(quotientResult), new CompactNumber(remainderResult)];
                }
                return [new LargeNumber(quotientResult, currentNum.isNegative !== parsedDivisor.isNegative), new CompactNumber(remainderResult)];
            }
            // If compact divisor is too large for smallDivisionAndModulo, convert it to parts.
            return flexibleDivideAndModulo(currentNum, new LargeNumber(decomposeSmallNum(absoluteDivisor), parsedDivisor.isNegative));
        }

        // Case 3: Both dividend and divisor are LargeNumbers.
        const magnitudeComparison = compareMagnitudes(dividendParts, divisorOperand);
        if (magnitudeComparison === -1) return [NumericEntity[0], currentNum]; // Dividend < Divisor.
        if (magnitudeComparison === 0) { // Dividend == Divisor.
            return [NumericEntity[currentNum.isNegative === parsedDivisor.isNegative ? 1 : -1], NumericEntity[0]];
        }

        // Choose division algorithm based on length heuristic.
        if (dividendParts.length + divisorOperand.length <= 200) {
            resultValue = divideAndModuloVariant1(dividendParts, divisorOperand);
        } else {
            resultValue = divideAndModuloVariant2(dividendParts, divisorOperand);
        }

        quotientResult = resultValue[0];
        const quotientIsNegative = currentNum.isNegative !== parsedDivisor.isNegative;
        const moduloResult = resultValue[1];
        const moduloIsNegative = currentNum.isNegative; // Remainder takes sign of dividend.

        // Convert quotient to CompactNumber if possible.
        if (typeof quotientResult === "number") {
            if (quotientIsNegative) quotientResult = -quotientResult;
            quotientResult = new CompactNumber(quotientResult);
        } else {
            quotientResult = new LargeNumber(quotientResult, quotientIsNegative);
        }

        // Convert remainder to CompactNumber if possible.
        if (typeof moduloResult === "number") {
            if (moduloIsNegative) moduloResult = -moduloResult;
            moduloResult = new CompactNumber(moduloResult);
        } else {
            moduloResult = new LargeNumber(moduloResult, moduloIsNegative);
        }

        return [quotientResult, moduloResult];
    }

    // BigNumber.prototype.divmod method: Returns an object containing quotient and remainder.
    LargeNumber.prototype.divisionRemainder = function(divisorVal) {
        const resultPair = flexibleDivideAndModulo(this, divisorVal);
        return {
            quotient: resultPair[0],
            remainder: resultPair[1]
        };
    };
    CompactNumber.prototype.divisionRemainder = LargeNumber.prototype.divisionRemainder; // Alias for CompactNumber.

    // BigNumber.prototype.divide method: Returns only the quotient.
    LargeNumber.prototype.divisionOperation = function(divisorVal) {
        return flexibleDivideAndModulo(this, divisorVal)[0];
    };
    CompactNumber.prototype.divisionOperation = LargeNumber.prototype.divisionOperation; // Alias for CompactNumber.
    LargeNumber.prototype.divisionAlias = LargeNumber.prototype.divisionOperation; // Another alias for divide.
    CompactNumber.prototype.divisionAlias = CompactNumber.prototype.divisionOperation; // Another alias for divide.

    // BigNumber.prototype.mod method: Returns only the remainder.
    LargeNumber.prototype.moduloOperation = function(divisorVal) {
        return flexibleDivideAndModulo(this, divisorVal)[1];
    };
    CompactNumber.prototype.moduloOperation = LargeNumber.prototype.moduloOperation; // Alias for CompactNumber.
    LargeNumber.prototype.remainderAlias = LargeNumber.prototype.moduloOperation; // Another alias for mod.
    CompactNumber.prototype.remainderAlias = CompactNumber.prototype.moduloOperation; // Another alias for mod.

    // BigNumber.prototype.pow method: Computes exponentiation (base^exponent).
    LargeNumber.prototype.exponentiate = function(powerExp) {
        const parsedExponent = processInput(powerExp);
        const baseMagnitude = this.magnitude;
        let exponentValue = parsedExponent.magnitude; // Use let as it will be modified.
        let resultVal, currentX, currentY;

        // Handle edge cases for exponentiation.
        if (exponentValue === 0) return NumericEntity[1]; // x^0 = 1.
        if (baseMagnitude === 0) return NumericEntity[0]; // 0^x = 0 (for x > 0).
        if (baseMagnitude === 1 && !this.isNegative) return NumericEntity[1]; // 1^x = 1.
        if (baseMagnitude === 1 && this.isNegative) { // (-1)^x.
            return parsedExponent.isEvenNumber() ? NumericEntity[1] : NumericEntity[-1];
        }
        if (parsedExponent.isNegativeValue()) { // Negative exponent (e.g., x^-y) evaluates to 0 for integers.
            return NumericEntity[0];
        }

        // Throw an error if the exponent is too large to handle.
        if (!parsedExponent.isCompact) {
            throw new Error(`The exponent ${parsedExponent.stringRepresentation()} is too large.`);
        }

        // If the base is a compact number, try native JS exponentiation first.
        if (this.isCompact) {
            if (isWithinJsRange(resultVal = Math.pow(baseMagnitude, exponentValue))) {
                return new CompactNumber(floorOrCeil(resultVal));
            }
        }

        // Use binary exponentiation (exponentiation by squaring) for efficiency.
        currentX = this;
        currentY = NumericEntity[1]; // Initialize result to 1.
        while (true) {
            if ((exponentValue & 1) === 1) { // If the current exponent bit is 1 (exponent is odd).
                currentY = currentY.multiply(currentX); // Multiply result by current base.
                exponentValue--; // Decrement exponent.
            }
            if (exponentValue === 0) break; // Stop when exponent is 0.
            exponentValue /= 2; // Halve the exponent.
            currentX = currentX.square(); // Square the base.
        }
        return currentY;
    };
    CompactNumber.prototype.exponentiate = LargeNumber.prototype.exponentiate; // Alias for CompactNumber.

    // BigNumber.prototype.modPow method: Computes (base^exponent) % modulus.
    LargeNumber.prototype.modularExponentiation = function(powerExp, modulusVal) {
        powerExp = processInput(powerExp);
        modulusVal = processInput(modulusVal);

        if (modulusVal.isZeroValue()) {
            throw new Error("Cannot take modular exponentiation with modulus 0");
        }

        let finalResult = NumericEntity[1]; // Initialize result to 1.
        let currentBase = this.moduloOperation(modulusVal); // Reduce base modulo modulus.

        // Use binary exponentiation with modulo at each step.
        while (powerExp.isPositiveValue()) {
            if (currentBase.isZeroValue()) return NumericEntity[0]; // If base is 0, result is 0 (for positive exponent).
            if (powerExp.isOddNumber()) {
                finalResult = finalResult.multiply(currentBase).moduloOperation(modulusVal); // (res * base) % mod.
            }
            powerExp = powerExp.divisionOperation(2); // exponent = exponent / 2.
            currentBase = currentBase.square().moduloOperation(modulusVal); // base = (base^2) % mod.
        }
        return finalResult;
    };
    CompactNumber.prototype.modularExponentiation = LargeNumber.prototype.modularExponentiation; // Alias for CompactNumber.

    /**
     * Compares the absolute magnitudes of two arrays of chunks.
     * @param {number[]} arrA - The first array of chunks.
     * @param {number[]} arrB - The second array of chunks.
     * @returns {number} 0 if magnitudes are equal, 1 if arrA's magnitude > arrB's, -1 if arrA's magnitude < arrB's.
     */
    function compareMagnitudes(arrA, arrB) {
        // Compare lengths first, as longer array usually means larger magnitude.
        if (arrA.length !== arrB.length) {
            return arrA.length > arrB.length ? 1 : -1;
        }
        // If lengths are equal, compare chunk by chunk from most significant to least significant.
        for (let k = arrA.length - 1; k >= 0; k--) {
            if (arrA[k] !== arrB[k]) {
                return arrA[k] > arrB[k] ? 1 : -1;
            }
        }
        return 0; // Arrays are identical, so magnitudes are equal.
    }

    // BigNumber.prototype.compareAbs method: Compares absolute values of two numbers.
    LargeNumber.prototype.compareMagnitudes = function(otherVal) {
        const parsedOther = processInput(otherVal);
        const firstOperandParts = this.magnitude;
        const secondOperandVal = parsedOther.magnitude;

        if (parsedOther.isCompact) {
            // If the other operand is a compact number, convert it to an array of chunks
            // for magnitude comparison.
            const otherMagnitudeParts = decomposeSmallNum(Math.abs(secondOperandVal));
            return compareMagnitudes(firstOperandParts, otherMagnitudeParts);
        }
        // If both are large numbers, compare their chunk arrays directly.
        return compareMagnitudes(firstOperandParts, secondOperandVal);
    };

    // CompactNumber.prototype.compareAbs method: Compares absolute values of two numbers.
    CompactNumber.prototype.compareMagnitudes = function(otherVal) {
        const parsedOther = processInput(otherVal);
        const currentAbsVal = Math.abs(this.magnitude);
        const otherAbsVal = parsedOther.magnitude;

        if (parsedOther.isCompact) {
            // If both are compact, use native JS comparison of absolute values.
            const otherCompactAbsVal = Math.abs(otherAbsVal);
            return currentAbsVal === otherCompactAbsVal ? 0 : (currentAbsVal > otherCompactAbsVal ? 1 : -1);
        }
        // If 'this' is compact and 'other' is large, 'this' is generally smaller in magnitude.
        // A CompactNumber's magnitude is always less than a LargeNumber's magnitude if both are non-zero.
        return -1;
    };

    // BigNumber.prototype.compare method: Compares two numbers, considering their signs.
    LargeNumber.prototype.comparisonOperation = function(otherVal) {
        // Handle comparison with native Infinity values.
        if (otherVal === Infinity) return -1;
        if (otherVal === -Infinity) return 1;

        const parsedOther = processInput(otherVal);
        const firstOperandParts = this.magnitude;
        const secondOperandVal = parsedOther.magnitude;

        // First, compare signs. If signs differ, the positive number is greater.
        if (this.isNegative !== parsedOther.isNegative) {
            return parsedOther.isNegative ? 1 : -1; // If `this` is positive and `other` negative, `this` > `other`.
        }

        // If signs are the same, compare magnitudes.
        // The interpretation of magnitude comparison depends on the sign.
        let magnitudeComparison;
        if (parsedOther.isCompact) {
            // If `other` is compact, convert its absolute value to chunks for consistent comparison.
            const otherMagnitudeParts = decomposeSmallNum(Math.abs(secondOperandVal));
            magnitudeComparison = compareMagnitudes(firstOperandParts, otherMagnitudeParts);
        } else {
            // Both are large numbers.
            magnitudeComparison = compareMagnitudes(firstOperandParts, secondOperandVal);
        }

        // If numbers are negative, the one with smaller magnitude is actually greater (closer to zero).
        return magnitudeComparison * (this.isNegative ? -1 : 1);
    };
    LargeNumber.prototype.compareAlias = LargeNumber.prototype.comparisonOperation; // Alias for compare.

    // CompactNumber.prototype.compare method: Compares two numbers, considering their signs.
    CompactNumber.prototype.comparisonOperation = function(otherVal) {
        // Handle comparison with native Infinity values.
        if (otherVal === Infinity) return -1;
        if (otherVal === -Infinity) return 1;

        const parsedOther = processInput(otherVal);
        const currentVal = this.magnitude;
        const otherOperand = parsedOther.magnitude;

        // If both are compact numbers, use native JS comparison.
        if (parsedOther.isCompact) {
            return currentVal === otherOperand ? 0 : (currentVal > otherOperand ? 1 : -1);
        }

        // If `this` is compact and `other` is large.
        // Compare signs first.
        if ((currentVal < 0) !== parsedOther.isNegative) {
            return currentVal < 0 ? -1 : 1; // If `this` is negative and `other` positive, `this` < `other`.
        }
        // If signs are the same:
        // A positive compact number is less than a positive large number.
        // A negative compact number is greater than a negative large number (closer to zero).
        return currentVal < 0 ? 1 : -1;
    };
    CompactNumber.prototype.compareAlias = CompactNumber.prototype.comparisonOperation; // Alias for compare.

    // Equality checks
    LargeNumber.prototype.equalityCheck = function(otherVal) { return this.comparisonOperation(otherVal) === 0; };
    CompactNumber.prototype.equalityCheck = LargeNumber.prototype.equalityCheck; // Alias for CompactNumber.
    LargeNumber.prototype.equalityAlias = LargeNumber.prototype.equalityCheck; // Another alias for equals.
    CompactNumber.prototype.equalityAlias = CompactNumber.prototype.equalityCheck; // Another alias for equals.

    // Inequality checks
    LargeNumber.prototype.inequalityCheck = function(otherVal) { return this.comparisonOperation(otherVal) !== 0; };
    CompactNumber.prototype.inequalityCheck = LargeNumber.prototype.inequalityCheck; // Alias for CompactNumber.
    LargeNumber.prototype.inequalityAlias = LargeNumber.prototype.inequalityCheck; // Another alias for notEquals.
    CompactNumber.prototype.inequalityAlias = CompactNumber.prototype.inequalityCheck; // Another alias for notEquals.

    // Greater than
    LargeNumber.prototype.isGreater = function(otherVal) { return this.comparisonOperation(otherVal) > 0; };
    CompactNumber.prototype.isGreater = LargeNumber.prototype.isGreater; // Alias for CompactNumber.
    LargeNumber.prototype.greaterThanAlias = LargeNumber.prototype.isGreater; // Another alias for greater.
    CompactNumber.prototype.greaterThanAlias = CompactNumber.prototype.isGreater; // Another alias for greater.

    // Lesser than
    LargeNumber.prototype.isLesser = function(otherVal) { return this.comparisonOperation(otherVal) < 0; };
    CompactNumber.prototype.isLesser = LargeNumber.prototype.isLesser; // Alias for CompactNumber.
    LargeNumber.prototype.lessThanAlias = LargeNumber.prototype.isLesser; // Another alias for lesser.
    CompactNumber.prototype.lessThanAlias = CompactNumber.prototype.isLesser; // Another alias for lesser.

    // Greater or equal
    LargeNumber.prototype.isGreaterOrEqual = function(otherVal) { return this.comparisonOperation(otherVal) >= 0; };
    CompactNumber.prototype.isGreaterOrEqual = LargeNumber.prototype.isGreaterOrEqual; // Alias for CompactNumber.
    LargeNumber.prototype.greaterEqualAlias = LargeNumber.prototype.isGreaterOrEqual; // Another alias for greaterOrEquals.
    CompactNumber.prototype.greaterEqualAlias = CompactNumber.prototype.isGreaterOrEqual; // Another alias for greaterOrEquals.

    // Lesser or equal
    LargeNumber.prototype.isLesserOrEqual = function(otherVal) { return this.comparisonOperation(otherVal) <= 0; };
    CompactNumber.prototype.isLesserOrEqual = LargeNumber.prototype.isLesserOrEqual; // Alias for CompactNumber.
    LargeNumber.prototype.lessEqualAlias = LargeNumber.prototype.isLesserOrEqual; // Another alias for lesserOrEquals.
    CompactNumber.prototype.lessEqualAlias = CompactNumber.prototype.isLesserOrEqual; // Another alias for lesserOrEquals.

    // Parity checks
    LargeNumber.prototype.isEvenNumber = function() { return (this.magnitude[0] & 1) === 0; }; // Check the least significant chunk.
    CompactNumber.prototype.isEvenNumber = function() { return (this.magnitude & 1) === 0; }; // Check the raw value.

    LargeNumber.prototype.isOddNumber = function() { return (this.magnitude[0] & 1) === 1; }; // Check the least significant chunk.
    CompactNumber.prototype.isOddNumber = function() { return (this.magnitude & 1) === 1; }; // Check the raw value.

    // Sign checks
    LargeNumber.prototype.isPositiveValue = function() { return !this.isNegative; };
    CompactNumber.prototype.isPositiveValue = function() { return this.magnitude > 0; };

    LargeNumber.prototype.isNegativeValue = function() { return this.isNegative; };
    CompactNumber.prototype.isNegativeValue = function() { return this.magnitude < 0; };

    // Value checks
    LargeNumber.prototype.isUnity = function() { return false; }; // A LargeNumber is never 1 or -1 (they would be CompactNumbers).
    CompactNumber.prototype.isUnity = function() { return Math.abs(this.magnitude) === 1; };

    LargeNumber.prototype.isZeroValue = function() { return false; }; // A LargeNumber is never 0 (it would be a CompactNumber 0).
    CompactNumber.prototype.isZeroValue = function() { return this.magnitude === 0; };

    // Divisibility check
    LargeNumber.prototype.checkDivisibility = function(divisorVal) {
        const parsedDivisor = processInput(divisorVal);
        const divisorOperand = parsedDivisor.magnitude;
        if (divisorOperand === 0) return false; // Cannot divide by zero.
        if (divisorOperand === 1) return true; // Always divisible by 1.
        if (divisorOperand === 2) return this.isEvenNumber(); // Optimized check for divisibility by 2.
        return this.moduloOperation(parsedDivisor).equalityCheck(NumericEntity[0]); // General case: remainder is 0.
    };
    CompactNumber.prototype.checkDivisibility = LargeNumber.prototype.checkDivisibility; // Alias for CompactNumber.

    /**
     * Performs a quick check for small prime numbers (2, 3, 5) and small composite numbers.
     * @param {NumericEntity} num - The number to check.
     * @returns {boolean|undefined} True if prime, false if composite, undefined if more rigorous tests are needed.
     */
    function isSimplePrime(num) {
        const absoluteNum = num.getAbsoluteValue();
        if (absoluteNum.isUnity()) return false; // 1 is not prime.
        if (absoluteNum.equalityCheck(2) || absoluteNum.equalityCheck(3) || absoluteNum.equalityCheck(5)) return true;
        if (absoluteNum.isEvenNumber() || absoluteNum.checkDivisibility(3) || absoluteNum.checkDivisibility(5)) return false;
        if (absoluteNum.isLesser(25)) return true; // Primes up to 23 not covered by 2,3,5 divisibility.
        return undefined; // Indicates that further, more complex primality tests are required.
    }

    // BigNumber.prototype.isPrime method: Determines if a number is prime using Miller-Rabin test.
    LargeNumber.prototype.primeCheck = function() {
        const simpleCheckResult = isSimplePrime(this);
        if (simpleCheckResult !== undefined) return simpleCheckResult; // If simple check resolves, return.

        const absoluteNum = this.getAbsoluteValue();
        let numMinusOne = absoluteNum.getPreviousValue();
        // Array of small, fixed bases for the Miller-Rabin test.
        const testBases = [2, 3, 5, 7, 11, 13, 17, 19];
        let tempVal = numMinusOne;
        let divisorVal, flag, powerResult;

        // Find `d` and `s` such that `n-1 = d * 2^s` where `d` is odd.
        while (tempVal.isEvenNumber()) {
            tempVal = tempVal.divisionOperation(2);
        }

        // Perform Miller-Rabin test for each chosen base.
        for (let k = 0; k < testBases.length; k++) {
            powerResult = largeNum(testBases[k]).modularExponentiation(tempVal, absoluteNum); // a^d mod n.
            if (powerResult.equalityCheck(NumericEntity[1]) || powerResult.equalityCheck(numMinusOne)) continue; // Passes first condition.

            // Check a^(d*2^r) mod n for r in [0, s-1].
            for (flag = true, divisorVal = tempVal; flag && divisorVal.isLesser(numMinusOne); divisorVal = divisorVal.multiply(2)) {
                powerResult = powerResult.square().moduloOperation(absoluteNum);
                if (powerResult.equalityCheck(numMinusOne)) flag = false; // Passes second condition.
            }
            if (flag) return false; // Fails Miller-Rabin test, definitely composite.
        }
        return true; // Passes all tests, likely prime.
    };
    CompactNumber.prototype.primeCheck = LargeNumber.prototype.primeCheck; // Alias for CompactNumber.

    // BigNumber.prototype.isProbablePrime method: Checks if a number is probably prime using a simplified Miller-Rabin test.
    LargeNumber.prototype.probablePrimeCheck = function(numIterations) {
        const simpleCheckResult = isSimplePrime(this);
        if (simpleCheckResult !== undefined) return simpleCheckResult; // If simple check resolves, return.

        const absoluteNum = this.getAbsoluteValue();
        const numTests = numIterations === undefined ? 5 : numIterations; // Default to 5 iterations if not specified.
        const upperBoundForRand = absoluteNum.subOperation(2); // Upper bound for random base `a` (2 <= a <= n-2).

        // Perform Miller-Rabin for a specified number of random bases.
        for (let k = 0; k < numTests; k++) {
            // Pick a random base `a` between 2 and n-2.
            const randomBase = largeNum.randomBetween(2, upperBoundForRand);
            // Check `a^(n-1) mod n == 1` (Fermat's Little Theorem, part of Miller-Rabin).
            if (!randomBase.modularExponentiation(absoluteNum.getPreviousValue(), absoluteNum).isUnity()) {
                return false; // Fails the test, definitely composite.
            }
        }
        return true; // Passes all tests, probably prime.
    };
    CompactNumber.prototype.probablePrimeCheck = LargeNumber.prototype.probablePrimeCheck; // Alias for CompactNumber.

    // BigNumber.prototype.modInv method: Computes the modular multiplicative inverse.
    // Finds `x` such that `(this * x) % n == 1`.
    LargeNumber.prototype.modularInverse = function(modulusVal) {
        let coeffS = NumericEntity.zero;
        let newCoeffS = NumericEntity.one;
        let remR = processInput(modulusVal);
        let newRemR = this.getAbsoluteValue(); // Use absolute value for Euclidean algorithm.
        let quotientVal, oldCoeffS, oldRemR;

        // Extended Euclidean Algorithm to find GCD and coefficients.
        while (!newRemR.equalityCheck(NumericEntity.zero)) {
            quotientVal = remR.divisionOperation(newRemR);
            oldCoeffS = coeffS;
            oldRemR = remR;
            coeffS = newCoeffS;
            remR = newRemR;
            newCoeffS = oldCoeffS.subOperation(quotientVal.multiply(newCoeffS));
            newRemR = oldRemR.subOperation(quotientVal.multiply(newRemR));
        }

        // If GCD(this, n) is not 1, then the modular inverse does not exist.
        if (!remR.equalityCheck(1)) {
            throw new Error(`${this.stringRepresentation()} and ${modulusVal.stringRepresentation()} are not co-prime`);
        }

        // Adjust the coefficient `s` to be positive and within the range [0, n-1].
        if (coeffS.comparisonOperation(0) === -1) {
            coeffS = coeffS.add(modulusVal);
        }

        // If the original number was negative, the inverse needs to be negated relative to modulus.
        if (this.isNegativeValue()) {
            return coeffS.invertSign();
        }
        return coeffS;
    };
    CompactNumber.prototype.modularInverse = LargeNumber.prototype.modularInverse; // Alias for CompactNumber.

    // BigNumber.prototype.next method: Returns the number incremented by one.
    LargeNumber.prototype.getNextValue = function() {
        const currentMagnitude = this.magnitude;
        if (this.isNegative) {
            // For negative numbers, `next` means decreasing magnitude (e.g., -5 -> -4).
            return subtractSmallFromParts(currentMagnitude, 1, this.isNegative);
        }
        // For positive numbers, `next` means increasing magnitude.
        return new LargeNumber(addSmallToParts(currentMagnitude, 1), this.isNegative);
    };

    // CompactNumber.prototype.next method: Returns the number incremented by one.
    CompactNumber.prototype.getNextValue = function() {
        const currentVal = this.magnitude;
        // If incrementing by 1 still keeps it within JavaScript's safe integer range.
        if (currentVal + 1 < JS_MAX_SAFE_INTEGER) {
            return new CompactNumber(currentVal + 1);
        }
        // Otherwise, it overflows to a LargeNumber.
        return new LargeNumber(SAFE_INT_LIMIT_PARTS, false);
    };

    // BigNumber.prototype.prev method: Returns the number decremented by one.
    LargeNumber.prototype.getPreviousValue = function() {
        const currentMagnitude = this.magnitude;
        if (this.isNegative) {
            // For negative numbers, `prev` means increasing magnitude (e.g., -5 -> -6).
            return new LargeNumber(addSmallToParts(currentMagnitude, 1), true);
        }
        // For positive numbers, `prev` means decreasing magnitude.
        return subtractSmallFromParts(currentMagnitude, 1, this.isNegative);
    };

    // CompactNumber.prototype.prev method: Returns the number decremented by one.
    CompactNumber.prototype.getPreviousValue = function() {
        const currentVal = this.magnitude;
        // If decrementing by 1 still keeps it within JavaScript's safe integer range.
        if (currentVal - 1 > -JS_MAX_SAFE_INTEGER) {
            return new CompactNumber(currentVal - 1);
        }
        // Otherwise, it underflows to a LargeNumber.
        return new LargeNumber(SAFE_INT_LIMIT_PARTS, true);
    };

    // Precomputed powers of two up to CHUNK_SIZE for efficient bit shifting operations.
    const powersOfTwoChunks = [1];
    while (2 * powersOfTwoChunks[powersOfTwoChunks.length - 1] <= CHUNK_SIZE) {
        powersOfTwoChunks.push(2 * powersOfTwoChunks[powersOfTwoChunks.length - 1]);
    }
    const chunkPowersLen = powersOfTwoChunks.length; // Number of precomputed powers.
    const maxPowerOfTwoChunk = powersOfTwoChunks[chunkPowersLen - 1]; // The largest power of two that fits in one chunk.

    /**
     * Checks if a given shift amount is "compact" (i.e., small enough to be handled directly
     * or by simple multiplication/division by powers of two within a chunk).
     * @param {any} shiftAmount - The value representing the shift amount.
     * @returns {boolean} True if the shift amount is compact, false otherwise.
     */
    function isShiftAmountCompact(shiftAmount) {
        return (typeof shiftAmount === "number" || typeof shiftAmount === "string") &&
               +Math.abs(shiftAmount) <= CHUNK_SIZE || // If it's a number/string, check its absolute value.
               (shiftAmount instanceof LargeNumber && shiftAmount.magnitude.length <= 1); // If it's a LargeNumber, check if it has only one chunk.
    }

    // BigNumber.prototype.shiftLeft method: Performs a bitwise left shift.
    LargeNumber.prototype.leftShiftBits = function(shiftAmount) {
        if (!isShiftAmountCompact(shiftAmount)) {
            throw new Error(`${String(shiftAmount)} is too large for shifting.`);
        }
        let shiftVal = +shiftAmount; // Convert shift amount to a number.
        if (shiftVal < 0) return this.rightShiftBits(-shiftVal); // Negative left shift is a right shift.

        let currentResult = this;
        if (currentResult.isZeroValue()) return currentResult; // Shifting zero results in zero.

        // Repeatedly multiply by the largest power of two that fits in a chunk until the remaining shift amount is small.
        while (shiftVal >= chunkPowersLen) {
            currentResult = currentResult.multiply(maxPowerOfTwoChunk);
            shiftVal -= (chunkPowersLen - 1); // Subtract log2(CHUNK_SIZE) from shift amount.
        }
        // Perform the final multiplication by the remaining power of two.
        return currentResult.multiply(powersOfTwoChunks[shiftVal]);
    };
    CompactNumber.prototype.leftShiftBits = LargeNumber.prototype.leftShiftBits; // Alias for CompactNumber.

    // BigNumber.prototype.shiftRight method: Performs a bitwise right shift.
    LargeNumber.prototype.rightShiftBits = function(shiftAmount) {
        let remainderQuotientPair;
        if (!isShiftAmountCompact(shiftAmount)) {
            throw new Error(`${String(shiftAmount)} is too large for shifting.`);
        }
        let shiftVal = +shiftAmount; // Convert shift amount to a number.
        if (shiftVal < 0) return this.leftShiftBits(-shiftVal); // Negative right shift is a left shift.

        let currentResult = this;

        // Repeatedly divide by the largest power of two that fits in a chunk until the remaining shift amount is small.
        while (shiftVal >= chunkPowersLen) {
            // Special handling for zero or negative one (unit) to avoid infinite loops.
            if (currentResult.isZeroValue() || (currentResult.isNegativeValue() && currentResult.isUnity())) {
                return currentResult;
            }
            remainderQuotientPair = flexibleDivideAndModulo(currentResult, maxPowerOfTwoChunk);
            // Adjust quotient for floor division behavior with negative numbers.
            currentResult = remainderQuotientPair[1].isNegativeValue() ? remainderQuotientPair[0].getPreviousValue() : remainderQuotientPair[0];
            shiftVal -= (chunkPowersLen - 1); // Subtract log2(CHUNK_SIZE) from shift amount.
        }
        // Perform the final division by the remaining power of two.
        remainderQuotientPair = flexibleDivideAndModulo(currentResult, powersOfTwoChunks[shiftVal]);
        return remainderQuotientPair[1].isNegativeValue() ? remainderQuotientPair[0].getPreviousValue() : remainderQuotientPair[0];
    };
    CompactNumber.prototype.rightShiftBits = LargeNumber.prototype.rightShiftBits; // Alias for CompactNumber.

    /**
     * Generic function to perform bitwise operations (AND, OR, XOR) on two NumericEntities.
     * It handles two's complement representation for negative numbers.
     * @param {NumericEntity} firstNum - The first operand.
     * @param {NumericEntity} secondNum - The second operand.
     * @param {function(number, number): number} operationFn - The bitwise function (e.g., `(a, b) => a & b`).
     * @returns {NumericEntity} The result of the bitwise operation.
     */
    function performBitwiseOp(firstNum, secondNum, operationFn) {
        secondNum = processInput(secondNum); // Ensure second operand is a NumericEntity.
        const firstNumSign = firstNum.isNegativeValue();
        const secondNumSign = secondNum.isNegativeValue();

        // Convert negative numbers to their two's complement representation (bitwise NOT + 1).
        const firstRemainder = firstNumSign ? firstNum.bitwiseNot() : firstNum;
        const secondRemainder = secondNumSign ? secondNum.bitwiseNot() : secondNum;

        let firstChunkDigit = 0, secondChunkDigit = 0;
        let firstDivModResult = null, secondDivModResult = null;
        const operationResults = [];

        // Iterate through chunks (from least significant), performing bitwise operation on each.
        while (!firstRemainder.isZeroValue() || !secondRemainder.isZeroValue()) {
            // Get the current chunk of the first number.
            firstDivModResult = flexibleDivideAndModulo(firstRemainder, maxPowerOfTwoChunk);
            firstChunkDigit = firstDivModResult[1].toNativeNumber();
            if (firstNumSign) {
                firstChunkDigit = maxPowerOfTwoChunk - 1 - firstChunkDigit; // Invert for two's complement.
            }

            // Get the current chunk of the second number.
            secondDivModResult = flexibleDivideAndModulo(secondRemainder, maxPowerOfTwoChunk);
            secondChunkDigit = secondDivModResult[1].toNativeNumber();
            if (secondNumSign) {
                secondChunkDigit = maxPowerOfTwoChunk - 1 - secondChunkDigit; // Invert for two's complement.
            }

            firstRemainder = firstDivModResult[0]; // Move to the next chunk for first number.
            secondRemainder = secondDivModResult[0]; // Move to the next chunk for second number.
            operationResults.push(operationFn(firstChunkDigit, secondChunkDigit)); // Store result of chunk operation.
        }

        // Determine the final sign bit of the result based on the bitwise operation on signs.
        const finalSignBitResult = operationFn(firstNumSign ? 1 : 0, secondNumSign ? 1 : 0);
        // Reconstruct the number from the chunk results.
        let accumulatedResult = finalSignBitResult !== 0 ? largeNum(-1) : largeNum(0); // If sign bit is 1, start with -1.

        for (let k = operationResults.length - 1; k >= 0; k -= 1) {
            accumulatedResult = accumulatedResult.multiply(maxPowerOfTwoChunk).add(largeNum(operationResults[k]));
        }
        return accumulatedResult;
    }

    // BigNumber.prototype.not method: Performs bitwise NOT operation (~x = -(x + 1)).
    LargeNumber.prototype.bitwiseNot = function() {
        return this.invertSign().getPreviousValue();
    };
    CompactNumber.prototype.bitwiseNot = LargeNumber.prototype.bitwiseNot; // Alias for CompactNumber.

    // BigNumber.prototype.and method: Performs bitwise AND operation.
    LargeNumber.prototype.bitwiseAnd = function(otherNum) {
        return performBitwiseOp(this, otherNum, function(a, b) { return a & b; });
    };
    CompactNumber.prototype.bitwiseAnd = LargeNumber.prototype.bitwiseAnd; // Alias for CompactNumber.

    // BigNumber.prototype.or method: Performs bitwise OR operation.
    LargeNumber.prototype.bitwiseOr = function(otherNum) {
        return performBitwiseOp(this, otherNum, function(a, b) { return a | b; });
    };
    CompactNumber.prototype.bitwiseOr = LargeNumber.prototype.bitwiseOr; // Alias for CompactNumber.

    // BigNumber.prototype.xor method: Performs bitwise XOR operation.
    LargeNumber.prototype.bitwiseXor = function(otherNum) {
        return performBitwiseOp(this, otherNum, function(a, b) { return a ^ b; });
    };
    CompactNumber.prototype.bitwiseXor = LargeNumber.prototype.bitwiseXor; // Alias for CompactNumber.

    // Masks for calculating the lowest one bit (rightmost set bit).
    const LOW_BIT_MASK_INT = 1 << 30; // For small integers, to ensure enough bits for `& -val` trick.
    // For big integers, combine the first two chunks to get a wider bit representation, then apply mask.
    const LOW_BIT_MASK_BIGNUM = (CHUNK_SIZE & -CHUNK_SIZE) * (CHUNK_SIZE & -CHUNK_SIZE) | LOW_BIT_MASK_INT;

    /**
     * Estimates the lowest one bit (rightmost 1) for a number.
     * This is used in GCD calculations to efficiently divide by powers of two.
     * @param {NumericEntity} num - The number to analyze.
     * @returns {number} A rough numerical estimate of the lowest one bit.
     */
    function estimateLowestOneBit(num) {
        const numMagnitude = num.magnitude;
        // If it's a compact number, use its raw value.
        // If it's a large number, combine its first two chunks for a more significant bit representation.
        const combinedBits = typeof numMagnitude === "number" ? numMagnitude | LOW_BIT_MASK_INT : numMagnitude[0] + (numMagnitude[1] || 0) * CHUNK_SIZE | LOW_BIT_MASK_BIGNUM;
        return combinedBits & -combinedBits; // Standard bitwise trick to isolate the lowest set bit.
    }

    /**
     * Calculates the integer logarithm of a value with respect to a given base.
     * This is typically used for determining bit lengths.
     * @param {NumericEntity} val - The value whose logarithm is to be calculated.
     * @param {NumericEntity} base - The base of the logarithm.
     * @returns {{p: NumericEntity, e: number}} An object containing the power (p) and exponent (e).
     */
    function calcIntegerLog(val, base) {
        // Base case for recursion: if base is greater than value, log is 0.
        if (base.comparisonOperation(val) <= 0) {
            // Recursive step: log_B(V) = 2 * log_(B^2)(V).
            const tempResult = calcIntegerLog(val, base.square());
            const powerP = tempResult.p;
            const exponentE = tempResult.e;
            const testProduct = powerP.multiply(base);
            // If p * base is still <= value, then the exponent is 2*e + 1, otherwise 2*e.
            return testProduct.comparisonOperation(val) <= 0 ? { p: testProduct, e: exponentE * 2 + 1 } : { p: powerP, e: exponentE * 2 };
        }
        return { p: largeNum(1), e: 0 }; // Base case: base > value, logarithm is 0.
    }

    // BigNumber.prototype.bitLength method: Calculates the number of bits required to represent the number.
    LargeNumber.prototype.getBitLength = function() {
        let currentNum = this;
        // For negative numbers, calculate bit length of `-(x + 1)` (two's complement representation).
        if (currentNum.comparisonOperation(largeNum(0)) < 0) {
            currentNum = currentNum.invertSign().subOperation(largeNum(1));
        }
        if (currentNum.comparisonOperation(largeNum(0)) === 0) {
            return largeNum(0); // Bit length of 0 is 0.
        }
        // Calculate log base 2 and add 1 to get the bit length.
        return largeNum(calcIntegerLog(currentNum, largeNum(2)).e).add(largeNum(1));
    };
    CompactNumber.prototype.getBitLength = LargeNumber.prototype.getBitLength; // Alias for CompactNumber.

    /**
     * Finds the maximum of two NumericEntities.
     * @param {any} num1 - The first number.
     * @param {any} num2 - The second number.
     * @returns {NumericEntity} The greater of the two numbers.
     */
    function findMaximum(num1, num2) {
        num1 = processInput(num1);
        num2 = processInput(num2);
        return num1.isGreater(num2) ? num1 : num2;
    }

    /**
     * Finds the minimum of two NumericEntities.
     * @param {any} num1 - The first number.
     * @param {any} num2 - The second number.
     * @returns {NumericEntity} The lesser of the two numbers.
     */
    function findMinimum(num1, num2) {
        num1 = processInput(num1);
        num2 = processInput(num2);
        return num1.isLesser(num2) ? num1 : num2;
    }

    /**
     * Calculates the greatest common divisor (GCD) of two NumericEntities using the binary GCD algorithm.
     * @param {any} num1 - The first number.
     * @param {any} num2 - The second number.
     * @returns {NumericEntity} The GCD of the two numbers.
     */
    function greatestCommonDivisor(num1, num2) {
        let opA = processInput(num1).getAbsoluteValue();
        let opB = processInput(num2).getAbsoluteValue();

        if (opA.equalityCheck(opB)) return opA; // If equal, GCD is itself.
        if (opA.isZeroValue()) return opB; // GCD(0, b) = b.
        if (opB.isZeroValue()) return opA; // GCD(a, 0) = a.

        let commonFactor = NumericEntity[1]; // Store common factors of 2.
        let tempDivisor;
        let tempSwap;

        // Step 1: Remove common factors of 2.
        while (opA.isEvenNumber() && opB.isEvenNumber()) {
            tempDivisor = Math.min(estimateLowestOneBit(opA), estimateLowestOneBit(opB));
            opA = opA.divisionOperation(tempDivisor);
            opB = opB.divisionOperation(tempDivisor);
            commonFactor = commonFactor.multiply(tempDivisor);
        }
        // Step 2: Remove factors of 2 from A if B is odd.
        while (opA.isEvenNumber()) {
            opA = opA.divisionOperation(estimateLowestOneBit(opA));
        }

        // Step 3: Main binary GCD loop.
        do {
            // Remove factors of 2 from B.
            while (opB.isEvenNumber()) {
                opB = opB.divisionOperation(estimateLowestOneBit(opB));
            }
            // Ensure A <= B.
            if (opA.isGreater(opB)) {
                tempSwap = opB;
                opB = opA;
                opA = tempSwap;
            }
            opB = opB.subOperation(opA); // B = B - A.
        } while (!opB.isZeroValue()); // Repeat until B is zero.

        // Step 4: Multiply by common factors of 2 removed earlier.
        return commonFactor.isUnity() ? opA : opA.multiply(commonFactor);
    }

    /**
     * Calculates the least common multiple (LCM) of two NumericEntities.
     * LCM(a, b) = |a * b| / GCD(a, b).
     * @param {any} num1 - The first number.
     * @param {any} num2 - The second number.
     * @returns {NumericEntity} The LCM of the two numbers.
     */
    function leastCommonMultiple(num1, num2) {
        const opA = processInput(num1).getAbsoluteValue();
        const opB = processInput(num2).getAbsoluteValue();
        // Calculate LCM using the formula.
        return opA.divisionOperation(greatestCommonDivisor(opA, opB)).multiply(opB);
    }

    /**
     * Generates a random NumericEntity between two bounds (inclusive).
     * @param {any} lowerBoundVal - The lower bound for the random number.
     * @param {any} upperBoundVal - The upper bound for the random number.
     * @returns {NumericEntity} A random number within the specified range.
     */
    function randomBetween(lowerBoundVal, upperBoundVal) {
        const lowerBound = findMinimum(processInput(lowerBoundVal), processInput(upperBoundVal));
        const upperBound = findMaximum(processInput(lowerBoundVal), processInput(upperBoundVal));
        const valueRange = upperBound.subOperation(lowerBound).add(1); // Calculate the size of the range.

        // If the range fits within a small integer, use native Math.random for efficiency.
        if (valueRange.isCompact) {
            return lowerBound.add(Math.floor(Math.random() * valueRange.magnitude));
        }

        const rangeLength = valueRange.magnitude.length - 1;
        const randDigits = [];
        let isRestricted = true; // Flag to ensure generated digits don't exceed the range's magnitude.
        const unitRadix = CHUNK_SIZE;

        // Generate random digits chunk by chunk, from most significant to least significant.
        for (let k = rangeLength; k >= 0; k--) {
            // The upper limit for the current digit depends on whether previous digits
            // were strictly less than the range's corresponding digits (restricted).
            const upperLimit = isRestricted ? valueRange.magnitude[k] : unitRadix;
            const randomDigit = floorOrCeil(Math.random() * (upperLimit + (isRestricted ? 1 : 0))); // +1 for inclusive upper limit
            randDigits.unshift(randomDigit); // Prepend to build the number from right to left.
            if (randomDigit < upperLimit) isRestricted = false; // If a digit is less, future digits are no longer restricted.
        }
        const generatedRandom = recomposeToSmallNum(randDigits); // Convert generated digits back to a number.

        // Add the generated random number to the lower bound.
        return lowerBound.add(typeof generatedRandom === "number" ? new CompactNumber(generatedRandom) : new LargeNumber(generatedRandom, false));
    }

    /**
     * Parses a string representation of a number in a given base (radix).
     * Handles various bases and custom digit representations.
     * @param {string} inputString - The string to parse.
     * @param {any} baseValue - The base (radix) as a number or NumericEntity.
     * @returns {NumericEntity} The parsed number.
     * @throws {Error} If the input string contains invalid digits for the specified base.
     */
    const parseStringWithBase = function(inputString, baseValue) {
        const strLen = inputString.length;
        let loopIdx;
        const absRadix = Math.abs(baseValue);

        // Pre-validation of digits for small bases to catch errors early.
        for (loopIdx = 0; loopIdx < strLen; loopIdx++) {
            const charVal = inputString[loopIdx].toLowerCase();
            if (charVal === "-") continue; // Skip negative sign.
            if (/[a-z0-9]/.test(charVal)) {
                if (/[0-9]/.test(charVal) && +charVal >= absRadix) {
                    if (charVal === "1" && absRadix === 1) continue; // Special case: base 1 only uses '1'.
                    throw new Error(`${charVal} is not a valid digit in base ${baseValue}.`);
                } else if (charVal.charCodeAt(0) - 87 >= absRadix) { // 'a' corresponds to 10, 'b' to 11, etc.
                    throw new Error(`${charVal} is not a valid digit in base ${baseValue}.`);
                }
            }
        }

        // For small bases (2 to 36) that fit within native JavaScript's `parseInt` capabilities.
        if (2 <= baseValue && baseValue <= 36) {
            // Check if the string length is small enough to avoid overflow in native `parseInt`.
            if (strLen <= LOG_SAFE_INT_LIMIT / Math.log(baseValue)) {
                const nativeResult = parseInt(inputString, baseValue);
                if (isNaN(nativeResult)) {
                    throw new Error(`Invalid number string for base ${baseValue}.`);
                }
                return new CompactNumber(nativeResult);
            }
        }

        // For larger bases or numbers that exceed native JS parsing limits.
        baseValue = processInput(baseValue); // Ensure base is a NumericEntity.
        const digitEntities = [];
        const isNegativeStr = inputString[0] === "-";
        for (loopIdx = isNegativeStr ? 1 : 0; loopIdx < inputString.length; loopIdx++) {
            const charVal = inputString[loopIdx].toLowerCase();
            const charAscii = charVal.charCodeAt(0);
            if (48 <= charAscii && charAscii <= 57) { // Digits '0'-'9'.
                digitEntities.push(processInput(charVal));
            } else if (97 <= charAscii && charAscii <= 122) { // Letters 'a'-'z'.
                digitEntities.push(processInput(charAscii - 87)); // Convert 'a' to 10, 'b' to 11, etc.
            } else if (charVal === "<") { // Handle custom digits like <10>, <42>.
                let startIndex = loopIdx;
                do { loopIdx++; } while (inputString[loopIdx] !== ">");
                digitEntities.push(processInput(inputString.slice(startIndex + 1, loopIdx)));
            } else {
                throw new Error(`${charVal} is not a valid character.`);
            }
        }
        return parsePartsWithBase(digitEntities, baseValue, isNegativeStr);
    };

    /**
     * Parses an array of digit NumericEntities in a given base.
     * This essentially converts a number from a custom base representation to internal base CHUNK_SIZE.
     * @param {NumericEntity[]} digitEntities - An array where each element is a NumericEntity representing a digit.
     * @param {NumericEntity} baseEntity - The base (radix) as a NumericEntity.
     * @param {boolean} isNegativeFlag - True if the number being parsed is negative.
     * @returns {NumericEntity} The parsed number.
     */
    function parsePartsWithBase(digitEntities, baseEntity, isNegativeFlag) {
        let accumulatedVal = NumericEntity[0];
        let currentPower = NumericEntity[1];
        let loopIdx;

        // Use Horner's method for efficient base conversion:
        // val = d_n * base^n + d_{n-1} * base^{n-1} + ... + d_1 * base + d_0
        // val = d_0 + base * (d_1 + base * (d_2 + ...))
        for (loopIdx = digitEntities.length - 1; loopIdx >= 0; loopIdx--) {
            accumulatedVal = accumulatedVal.add(digitEntities[loopIdx].multiply(currentPower));
            currentPower = currentPower.multiply(baseEntity);
        }
        return isNegativeFlag ? accumulatedVal.invertSign() : accumulatedVal;
    }

    /**
     * Converts a numerical digit value into its string representation.
     * For digits 0-35, it uses standard alphanumeric characters.
     * For digits > 35, it uses a `<N>` format (e.g., `<36>`).
     * @param {number} digitValue - The digit to convert.
     * @returns {string} The string representation of the digit.
     */
    function digitToString(digitValue) {
        if (digitValue <= 35) {
            return "0123456789abcdefghijklmnopqrstuvwxyz".charAt(digitValue);
        }
        return `<${digitValue}>`; // Custom format for digits beyond base 36.
    }

    /**
     * Converts a NumericEntity to an array of digits in a specified base.
     * This is the reverse operation of `parsePartsWithBase`.
     * @param {NumericEntity} numEntity - The number to convert.
     * @param {NumericEntity} baseEntity - The target base.
     * @returns {{value: number[], isNegative: boolean}} An object containing the digit array and the sign.
     * @throws {Error} For invalid base conversions (e.g., base 0).
     */
    function convertToBase(numEntity, baseEntity) {
        baseEntity = largeNum(baseEntity); // Ensure base is a NumericEntity.

        if (baseEntity.isZeroValue()) {
            if (numEntity.isZeroValue()) return { value: [0], isNegative: false };
            throw new Error("Cannot convert nonzero numbers to base 0.");
        }
        if (baseEntity.equalityCheck(-1)) {
            if (numEntity.isZeroValue()) return { value: [0], isNegative: false };
            if (numEntity.isNegativeValue()) {
                // Special handling for base -1 for negative numbers.
                const negAbs = -numEntity.toNativeNumber();
                const arr = Array.from({ length: negAbs }).flatMap(() => [1, 0]);
                return { value: arr, isNegative: false };
            }
            // Special handling for base -1 for positive numbers.
            const posVal = +numEntity.toNativeNumber() - 1;
            const arr = Array.from({ length: posVal }).flatMap(() => [0, 1]);
            arr.unshift(1);
            return { value: arr, isNegative: false };
        }

        let isNegResult = false;
        if (numEntity.isNegativeValue() && baseEntity.isPositiveValue()) {
            isNegResult = true;
            numEntity = numEntity.getAbsoluteValue(); // Convert to positive for conversion, then reapply sign.
        }

        if (baseEntity.equalityCheck(1)) {
            if (numEntity.isZeroValue()) return { value: [0], isNegative: false };
            // For base 1, representation is just '1' repeated N times.
            return { value: Array.from({ length: +numEntity.toNativeNumber() }).fill(1), isNegative: isNegResult };
        }

        const outputDigits = [];
        let remainingVal = numEntity;
        let divModPair;
        let currentDigit;

        // Repeatedly divide the number by the base and collect the remainders as digits.
        while (remainingVal.isNegativeValue() || remainingVal.compareMagnitudes(baseEntity) >= 0) {
            divModPair = remainingVal.divisionRemainder(baseEntity);
            remainingVal = divModPair.quotient;
            currentDigit = divModPair.remainder;
            if (currentDigit.isNegativeValue()) {
                // Adjust for negative remainders (e.g., in negative bases).
                currentDigit = baseEntity.subOperation(currentDigit).getAbsoluteValue();
                remainingVal = remainingVal.getNextValue(); // Adjust quotient accordingly.
            }
            outputDigits.push(currentDigit.toNativeNumber());
        }
        outputDigits.push(remainingVal.toNativeNumber()); // Add the last remaining quotient as a digit.
        return { value: outputDigits.reverse(), isNegative: isNegResult }; // Reverse to get correct digit order.
    }

    /**
     * Converts a NumericEntity to its string representation in a specified base.
     * @param {NumericEntity} numEntity - The number to convert.
     * @param {NumericEntity} baseEntity - The target base.
     * @returns {string} The string representation of the number in the given base.
     */
    function convertToStringBase(numEntity, baseEntity) {
        const digitArrayResult = convertToBase(numEntity, baseEntity);
        return (digitArrayResult.isNegative ? "-" : "") + digitArrayResult.value.map(digitToString).join("");
    }

    // BigNumber.prototype.toArray method: Converts the number to an array of digits in a given radix.
    LargeNumber.prototype.toBaseArray = function(radix) {
        return convertToBase(this, radix);
    };
    CompactNumber.prototype.toBaseArray = function(radix) {
        return convertToBase(this, radix);
    };

    // BigNumber.prototype.toString method: Converts the number to its string representation.
    LargeNumber.prototype.stringRepresentation = function(radix) {
        if (radix === undefined) radix = 10;
        if (radix !== 10) return convertToStringBase(this, radix); // Use generic base conversion if not base 10.

        const numVal = this.magnitude;
        let partsLen = numVal.length;
        let strPart = String(numVal[--partsLen]); // Start with the most significant chunk.
        const zeroPad = "0000000"; // Padding string for chunks (CHUNK_DIGITS zeros).
        let currentDigitStr;

        // Concatenate chunks from most significant to least significant, ensuring proper zero padding.
        while (--partsLen >= 0) {
            currentDigitStr = String(numVal[partsLen]);
            strPart += zeroPad.slice(currentDigitStr.length) + currentDigitStr;
        }
        const finalSign = this.isNegative ? "-" : "";
        return finalSign + strPart;
    };

    // CompactNumber.prototype.toString method: Converts the number to its string representation.
    CompactNumber.prototype.stringRepresentation = function(radix) {
        if (radix === undefined) radix = 10;
        if (radix !== 10) return convertToStringBase(this, radix); // Use generic base conversion if not base 10.
        return String(this.magnitude); // For base 10, use native JavaScript's toString.
    };

    // JSON serialization method for both types.
    LargeNumber.prototype.toJsonFormat = CompactNumber.prototype.toJsonFormat = function() {
        return this.stringRepresentation();
    };

    // ValueOf and toJSNumber methods: Convert to native JavaScript number.
    LargeNumber.prototype.jsValue = function() {
        // This conversion might lose precision for very large numbers.
        return parseInt(this.stringRepresentation(), 10);
    };
    LargeNumber.prototype.toNativeNumber = LargeNumber.prototype.jsValue; // Alias for LargeNumber.

    CompactNumber.prototype.jsValue = function() {
        return this.magnitude; // Directly return the native number.
    };
    CompactNumber.prototype.toNativeNumber = CompactNumber.prototype.jsValue; // Alias for CompactNumber.

    /**
     * Parses a string value into a NumericEntity.
     * Handles various string formats including scientific notation and validates integer input.
     * @param {string} inputString - The string to parse.
     * @returns {NumericEntity} The parsed number.
     * @throws {Error} If the string is not a valid integer representation.
     */
    function interpretString(inputString) {
        // First, check if the number, when parsed as a native JS number, is precise.
        if (isWithinJsRange(+inputString)) {
            const numVal = +inputString;
            if (numVal === floorOrCeil(numVal)) return new CompactNumber(numVal);
            throw new Error(`Invalid integer: ${inputString}`); // Not an integer.
        }

        let isNegativeStr = inputString[0] === "-";
        if (isNegativeStr) inputString = inputString.slice(1); // Remove sign for magnitude parsing.

        // Handle scientific notation (e.g., "1.23e+5", "4e-2").
        const exponentSplit = inputString.split(/e/i);
        if (exponentSplit.length > 2) throw new Error(`Invalid integer: ${exponentSplit.join("e")}`);
        if (exponentSplit.length === 2) {
            let exponentVal = exponentSplit[1];
            if (exponentVal[0] === "+") exponentVal = exponentVal.slice(1);
            exponentVal = +exponentVal;
            // Validate exponent is an integer and within safe range.
            if (exponentVal !== floorOrCeil(exponentVal) || !isWithinJsRange(exponentVal)) {
                throw new Error(`Invalid integer: ${exponentVal} is not a valid exponent.`);
            }
            let numText = exponentSplit[0];
            const decimalPointIdx = numText.indexOf(".");
            if (decimalPointIdx >= 0) {
                exponentVal -= numText.length - decimalPointIdx - 1; // Adjust exponent for decimal places.
                numText = numText.slice(0, decimalPointIdx) + numText.slice(decimalPointIdx + 1); // Remove decimal point.
            }
            if (exponentVal < 0) {
                throw new Error("Cannot include negative exponent part for integers"); // Integers cannot have negative exponents (e.g., 1e-2 = 0.01).
            }
            numText += Array(exponentVal + 1).join("0"); // Append zeros based on exponent.
            inputString = numText;
        }

        // Final validation: Ensure the string contains only digits.
        const stringIsValid = /^([0-9][0-9]*)$/.test(inputString);
        if (!stringIsValid) throw new Error(`Invalid integer: ${inputString}`);

        const resultParts = [];
        let maxLength = inputString.length;
        const chunkLength = CHUNK_DIGITS; // Each chunk holds CHUNK_DIGITS decimal digits.
        let minLength = maxLength - chunkLength;

        // Split the string into chunks from right to left (least significant to most significant).
        while (maxLength > 0) {
            resultParts.push(+inputString.slice(minLength, maxLength)); // Convert chunk string to number.
            minLength -= chunkLength;
            if (minLength < 0) minLength = 0;
            maxLength -= chunkLength;
        }
        normalizeParts(resultParts); // Remove any leading zero chunks.
        return new LargeNumber(resultParts, isNegativeStr);
    }

    /**
     * Parses a native JavaScript number into a NumericEntity.
     * @param {number} inputNum - The number to parse.
     * @returns {NumericEntity} The parsed number.
     * @throws {Error} If the input number is not an integer.
     */
    function interpretNumber(inputNum) {
        if (isWithinJsRange(inputNum)) {
            if (inputNum !== floorOrCeil(inputNum)) {
                throw new Error(`${inputNum} is not an integer.`);
            }
            return new CompactNumber(inputNum);
        }
        // If the number is too large for a CompactNumber, convert it to a string and parse.
        return interpretString(inputNum.toString());
    }

    /**
     * Generic parser for any value into a NumericEntity.
     * It intelligently handles numbers, strings, or existing NumericEntity instances.
     * @param {any} inputVal - The value to parse.
     * @returns {NumericEntity} The parsed number.
     */
    function interpretAnyValue(inputVal) {
        if (typeof inputVal === "number") {
            return interpretNumber(inputVal);
        }
        if (typeof inputVal === "string") {
            return interpretString(inputVal);
        }
        return inputVal; // Assume it's already a NumericEntity instance.
    }

    // Pre-populate NumericEntity with instances for small integers (0-999) for performance.
    for (let k = 0; k < 1000; k++) {
        NumericEntity[k] = new CompactNumber(k);
        if (k > 0) NumericEntity[-k] = new CompactNumber(-k);
    }

    // Expose common constants and utility functions on the main NumericEntity object.
    NumericEntity.one = NumericEntity[1];
    NumericEntity.zero = NumericEntity[0];
    NumericEntity.minusOne = NumericEntity[-1];
    NumericEntity.findMaximum = findMaximum;
    NumericEntity.findMinimum = findMinimum;
    NumericEntity.greatestCommonDivisor = greatestCommonDivisor;
    NumericEntity.leastCommonMultiple = leastCommonMultiple;
    NumericEntity.isInstance = function(obj) {
        return obj instanceof LargeNumber || obj instanceof CompactNumber;
    };
    NumericEntity.randomBetween = randomBetween;
    NumericEntity.fromArray = function(digitArr, baseRadix, isNegativeFlag) {
        // Map input digits to NumericEntities before parsing.
        return parsePartsWithBase(digitArr.map(interpretAnyValue), interpretAnyValue(baseRadix || 10), isNegativeFlag);
    };

    return NumericEntity;
}(); // IIFE (Immediately Invoked Function Expression) to initialize the module.

// Main execution logic for the specific problem.
const checkInputPattern = (inputData) => {
    // Trim whitespace, split input into lines, and then the first line into individual characters.
    const inputLines = inputData.trim().split("\n");
    const charArray = inputLines[0].split('');

    // Check if the 3rd character is the same as the 4th, AND the 5th character is the same as the 6th.
    // (Array indices are 0-based, so 3rd char is index 2, 4th is index 3, etc.)
    if (charArray[2] === charArray[3] && charArray[4] === charArray[5]) {
        global.console.log('Yes'); // Output 'Yes' if the pattern matches.
    } else {
        global.console.log('No');  // Output 'No' otherwise.
    }
};

// Read input from standard input and pass it to the main processing function.
checkInputPattern(require('fs').readFileSync('/dev/stdin', 'utf8'));