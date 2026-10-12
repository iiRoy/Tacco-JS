"use strict";

// This self-executing function defines the core large number arithmetic library.
const massiveVal = (unspecifiedParam) => {
    // Fundamental constants for internal number representation and JavaScript limits.
    const CHUNK_BASE = 1e7; /* Base for internal number chunks (10^7) */
    const CHUNK_EXPONENT = 7; /* Log base 10 of CHUNK_BASE, used for string parsing */
    const JS_SAFE_LIMIT = 9007199254740992; /* Maximum safe integer value in JavaScript (2^53 - 1) */
    const JS_SAFE_LIMIT_ARRAY = splitSmallNumber(JS_SAFE_LIMIT); /* Array representation of JS_SAFE_LIMIT */
    const LOG_JS_SAFE_LIMIT = Math.log(JS_SAFE_LIMIT); /* Logarithm of JS_SAFE_LIMIT for parsing optimization */

    /**
     * Factory function for creating numeric entities (either GrandNumber or CompactValue).
     * @param {*} dataArg - The input value, can be a number, string, or existing NumericEntity.
     * @param {number} [baseSystem] - Optional base for parsing string inputs (e.g., 2 for binary).
     * @returns {NumericEntity} A new NumericEntity instance.
     */
    function NumericEntity(dataArg, baseSystem) {
        if (typeof dataArg === "undefined") {
            return NumericEntity[0]; // Return zero if no value is provided.
        }
        if (typeof baseSystem !== "undefined") {
            // If a base system is specified, parse accordingly.
            return +baseSystem === 10 ? interpretInput(dataArg) : parseValueByBase(dataArg, baseSystem);
        }
        return interpretInput(dataArg); // Default parsing for numbers, strings, or existing entities.
    }

    /**
     * Represents a large number, stored as an array of numerical chunks.
     * These numbers exceed JavaScript's safe integer limit.
     * @param {number[]} chunkArray - An array of number chunks, least significant first.
     * @param {boolean} isNegative - True if the number is negative, false otherwise.
     */
    function GrandNumber(chunkArray, isNegative) {
        this.chunkArray = chunkArray;
        this.isNegative = isNegative;
        this.isCompact = false; // Flag indicating it's not a small, native JS number.
    }
    GrandNumber.prototype = Object.create(NumericEntity.prototype); // Inherit from NumericEntity.

    /**
     * Represents a small number, directly stored as a native JavaScript number.
     * These numbers fit within JavaScript's safe integer limit.
     * @param {number} value - The native JavaScript number value.
     */
    function CompactValue(value) {
        this.value = value;
        this.isNegative = value < 0; // Determine sign based on value.
        this.isCompact = true; // Flag indicating it's a small, native JS number.
    }
    CompactValue.prototype = Object.create(NumericEntity.prototype); // Inherit from NumericEntity.

    /**
     * Checks if a given number falls within JavaScript's safe integer range.
     * @param {number} numToCheck - The number to verify.
     * @returns {boolean} True if the number is exact (within JS_SAFE_LIMIT), false otherwise.
     */
    function checkPrecision(numToCheck) {
        return -JS_SAFE_LIMIT < numToCheck && numToCheck < JS_SAFE_LIMIT;
    }

    /**
     * Converts a small JavaScript number into an array of CHUNK_BASE-based chunks.
     * This is used to convert CompactValues to the internal GrandNumber representation.
     * @param {number} numToSplit - The small number to convert.
     * @returns {number[]} An array of chunks.
     */
    function splitSmallNumber(numToSplit) {
        if (numToSplit < 1e7) return [numToSplit]; // Single chunk for numbers less than 10^7.
        if (numToSplit < 1e14) return [numToSplit % 1e7, Math.floor(numToSplit / 1e7)]; // Two chunks.
        return [numToSplit % 1e7, Math.floor(numToSplit / 1e7) % 1e7, Math.floor(numToSplit / 1e14)]; // Three chunks.
    }

    /**
     * Attempts to convert an array of chunks back into a small JavaScript number.
     * If the combined value exceeds JS_SAFE_LIMIT, the original array is returned.
     * @param {number[]} chunkArray - The array of number chunks.
     * @returns {number | number[]} The combined small number or the original array if too large.
     */
    function combineArrayToSmall(chunkArray) {
        normalizeArray(chunkArray); // Remove any leading zero chunks.
        const chunkCount = chunkArray.length;
        // Check if the number of chunks and its absolute value fit within a CompactValue.
        if (chunkCount < 4 && compareAbsoluteValues(chunkArray, JS_SAFE_LIMIT_ARRAY) < 0) {
            switch (chunkCount) {
                case 0:
                    return 0; // Empty array represents zero.
                case 1:
                    return chunkArray[0];
                case 2:
                    return chunkArray[0] + chunkArray[1] * CHUNK_BASE;
                default:
                    return chunkArray[0] + (chunkArray[1] + chunkArray[2] * CHUNK_BASE) * CHUNK_BASE;
            }
        }
        return chunkArray; // The number is too large to be a CompactValue.
    }

    /**
     * Removes leading zero chunks from an array representation of a large number.
     * Modifies the array in place by adjusting its length.
     * @param {number[]} chunkVector - The array of chunks to normalize.
     */
    function normalizeArray(chunkVector) {
        let currentIdx = chunkVector.length;
        // Find the index of the most significant non-zero chunk.
        while (currentIdx > 0 && chunkVector[--currentIdx] === 0);
        chunkVector.length = currentIdx + 1; // Trim the array to this length.
    }

    /**
     * Creates a new array of a specified length, initialized with zeros.
     * @param {number} desiredLength - The desired length of the new array.
     * @returns {number[]} A new zero-filled array.
     */
    function allocateEmptyArray(desiredLength) {
        const newArr = new Array(desiredLength);
        let idx = -1;
        while (++idx < desiredLength) {
            newArr[idx] = 0;
        }
        return newArr;
    }

    /**
     * Rounds a number towards zero (equivalent to Math.trunc()).
     * For positive numbers, it's Math.floor(); for negative, Math.ceil().
     * @param {number} num - The number to truncate.
     * @returns {number} The truncated integer.
     */
    function roundTowardsZero(num) {
        if (num > 0) return Math.floor(num);
        return Math.ceil(num);
    }

    /**
     * Performs addition on two arrays of number chunks.
     * Assumes `arr1` is longer or equal in length to `arr2`.
     * @param {number[]} arr1 - The first operand (minuend), expected to be longer or equal.
     * @param {number[]} arr2 - The second operand (subtrahend).
     * @returns {number[]} The resulting chunk array.
     */
    function performAddition(arr1, arr2) {
        const len1 = arr1.length,
            len2 = arr2.length;
        const resArr = new Array(len1); // Result array initially sized for the longer operand.
        let overflow = 0,
            sumVal, idx;

        // Add corresponding chunks from both arrays, propagating overflow.
        for (idx = 0; idx < len2; idx++) {
            sumVal = arr1[idx] + arr2[idx] + overflow;
            overflow = sumVal >= CHUNK_BASE ? 1 : 0; // Calculate new overflow.
            resArr[idx] = sumVal - overflow * CHUNK_BASE; // Store current chunk value.
        }

        // Add remaining chunks from arr1 with any existing overflow.
        while (idx < len1) {
            sumVal = arr1[idx] + overflow;
            overflow = sumVal === CHUNK_BASE ? 1 : 0; // If sum is exactly CHUNK_BASE, overflow is 1.
            resArr[idx++] = sumVal - overflow * CHUNK_BASE;
        }

        // If there's a final overflow, append it to the result.
        if (overflow > 0) resArr.push(overflow);
        return resArr;
    }

    /**
     * Performs addition on two chunk arrays, automatically handling which array is longer.
     * @param {number[]} arrX - The first chunk array.
     * @param {number[]} arrY - The second chunk array.
     * @returns {number[]} The resulting chunk array.
     */
    function flexibleAdd(arrX, arrY) {
        if (arrX.length >= arrY.length) return performAddition(arrX, arrY);
        return performAddition(arrY, arrX); // Ensure the longer array is first.
    }

    /**
     * Adds a small integer value (carry) to each chunk of an array, propagating carries.
     * This is optimized for adding a CompactValue to a GrandNumber.
     * @param {number[]} chunkArray - The array of chunks to modify.
     * @param {number} initialCarry - The small integer value to add (positive).
     * @returns {number[]} The resulting chunk array.
     */
    function augmentWithCarry(chunkArray, initialCarry) {
        const len = chunkArray.length;
        const resArr = new Array(len);
        let currentCarry = initialCarry,
            sumVal, idx;

        for (idx = 0; idx < len; idx++) {
            // Optimized sum: (chunkArray[idx] + currentCarry) is effectively (chunkArray[idx] - CHUNK_BASE + currentCarry + CHUNK_BASE).
            // The -CHUNK_BASE is to ensure sumVal is likely negative or small, making floor division work for carry.
            sumVal = chunkArray[idx] - CHUNK_BASE + currentCarry;
            currentCarry = Math.floor(sumVal / CHUNK_BASE);
            resArr[idx] = sumVal - currentCarry * CHUNK_BASE;
            currentCarry += 1; // Adjust carry for the negative CHUNK_BASE part.
        }

        // Propagate any remaining carry until it's zero.
        while (currentCarry > 0) {
            resArr[idx++] = currentCarry % CHUNK_BASE;
            currentCarry = Math.floor(currentCarry / CHUNK_BASE);
        }
        return resArr;
    }

    // GrandNumber addition method.
    GrandNumber.prototype.add = function(inputVal) {
        const otherNum = interpretInput(inputVal); // Convert input to NumericEntity.
        // If signs are different, convert the operation to subtraction of the negated number.
        if (this.isNegative !== otherNum.isNegative) {
            return this.subtract(otherNum.flipSign());
        }
        const selfChunks = this.chunkArray,
            otherChunks = otherNum.chunkArray;
        // If the other number is a CompactValue, use the specialized small addition.
        if (otherNum.isCompact) {
            return new GrandNumber(augmentWithCarry(selfChunks, Math.abs(otherNum.value)), this.isNegative);
        }
        // Otherwise, use the general array addition for two GrandNumbers.
        return new GrandNumber(flexibleAdd(selfChunks, otherChunks), this.isNegative);
    };
    GrandNumber.prototype.plus = GrandNumber.prototype.add; // Alias for add.

    // CompactValue addition method.
    CompactValue.prototype.add = function(inputVal) {
        const otherNum = interpretInput(inputVal);
        const selfVal = this.value;
        // If signs are different, convert to subtraction.
        if ((selfVal < 0) !== otherNum.isNegative) {
            return this.subtract(otherNum.flipSign());
        }
        let otherVal = otherNum.value;
        // If both are CompactValues, perform direct JavaScript addition.
        if (otherNum.isCompact) {
            if (checkPrecision(selfVal + otherVal)) {
                return new CompactValue(selfVal + otherVal); // Result fits in CompactValue.
            }
            // If sum overflows JS_SAFE_LIMIT, convert the other value to chunks.
            otherVal = splitSmallNumber(Math.abs(otherVal));
        }
        // If one is CompactValue and the other is GrandNumber, or if the sum overflows,
        // use augmentWithCarry with the absolute value of the CompactValue.
        return new GrandNumber(augmentWithCarry(otherVal, Math.abs(selfVal)), selfVal < 0);
    };
    CompactValue.prototype.plus = CompactValue.prototype.add; // Alias for add.

    /**
     * Performs subtraction on two arrays of number chunks.
     * Assumes `arr1` is greater than or equal to `arr2` in absolute value.
     * @param {number[]} arr1 - The minuend chunk array.
     * @param {number[]} arr2 - The subtrahend chunk array.
     * @returns {number[]} The resulting chunk array.
     */
    function performSubtraction(arr1, arr2) {
        const len1 = arr1.length,
            len2 = arr2.length;
        const resArr = new Array(len1);
        let currentBorrow = 0,
            diffVal, idx;

        // Subtract corresponding chunks, propagating borrow.
        for (idx = 0; idx < len2; idx++) {
            diffVal = arr1[idx] - currentBorrow - arr2[idx];
            if (diffVal < 0) {
                diffVal += CHUNK_BASE; // Add CHUNK_BASE to make positive.
                currentBorrow = 1; // Set borrow for next chunk.
            } else {
                currentBorrow = 0; // No borrow needed.
            }
            resArr[idx] = diffVal;
        }

        // Subtract remaining chunks from arr1 with any existing borrow.
        for (idx = len2; idx < len1; idx++) {
            diffVal = arr1[idx] - currentBorrow;
            if (diffVal < 0) {
                diffVal += CHUNK_BASE;
            } else {
                resArr[idx++] = diffVal; // No more borrow, copy rest of arr1.
                break;
            }
            resArr[idx] = diffVal;
        }

        // Copy any remaining chunks from arr1 if the loop above broke early.
        for (; idx < len1; idx++) {
            resArr[idx] = arr1[idx];
        }
        normalizeArray(resArr); // Remove leading zeros from result.
        return resArr;
    }

    /**
     * Performs subtraction on two chunk arrays, handling absolute value comparison
     * and adjusting the sign of the result if the operands are swapped.
     * @param {number[]} arrX - The first chunk array.
     * @param {number[]} arrY - The second chunk array.
     * @param {boolean} currentSign - The initial sign of the operation (true for negative, false for positive).
     * @returns {CompactValue|GrandNumber} The result of the subtraction.
     */
    function flexibleSubtract(arrX, arrY, currentSign) {
        let finalValue;
        // Compare absolute values to determine which array is larger.
        if (compareAbsoluteValues(arrX, arrY) >= 0) {
            finalValue = performSubtraction(arrX, arrY);
        } else {
            finalValue = performSubtraction(arrY, arrX);
            currentSign = !currentSign; // If (Y - X) was performed, flip the sign.
        }
        finalValue = combineArrayToSmall(finalValue); // Attempt to convert to CompactValue.
        if (typeof finalValue === "number") {
            if (currentSign) finalValue = -finalValue;
            return new CompactValue(finalValue);
        }
        return new GrandNumber(finalValue, currentSign);
    }

    /**
     * Subtracts a small integer value (effectively adds a negative carry) from an array of chunks.
     * This is optimized for subtracting a CompactValue from a GrandNumber.
     * @param {number[]} chunkArray - The array of chunks.
     * @param {number} smallSubtrahend - The small number to subtract (absolute value).
     * @param {boolean} currentSign - The sign of the result.
     * @returns {CompactValue|GrandNumber} The result of the subtraction.
     */
    function decrementWithBorrow(chunkArray, smallSubtrahend, currentSign) {
        const len = chunkArray.length;
        const resArr = new Array(len);
        let currentCarry = -smallSubtrahend, // Initial carry is the negative subtrahend.
            diffVal, idx;

        for (idx = 0; idx < len; idx++) {
            diffVal = chunkArray[idx] + currentCarry;
            currentCarry = Math.floor(diffVal / CHUNK_BASE); // Calculate carry.
            diffVal %= CHUNK_BASE; // Current chunk value.
            resArr[idx] = diffVal < 0 ? diffVal + CHUNK_BASE : diffVal; // Ensure chunk is positive.
        }
        let finalResult = combineArrayToSmall(resArr); // Attempt to convert to CompactValue.
        if (typeof finalResult === "number") {
            if (currentSign) finalResult = -finalResult;
            return new CompactValue(finalResult);
        }
        return new GrandNumber(finalResult, currentSign);
    }

    // GrandNumber subtraction method.
    GrandNumber.prototype.subtract = function(inputVal) {
        const otherNum = interpretInput(inputVal);
        // If signs are different, convert the operation to addition of the negated number.
        if (this.isNegative !== otherNum.isNegative) {
            return this.add(otherNum.flipSign());
        }
        const selfChunks = this.chunkArray,
            otherChunks = otherNum.chunkArray;
        // If the other number is a CompactValue, use the specialized small subtraction.
        if (otherNum.isCompact) {
            return decrementWithBorrow(selfChunks, Math.abs(otherNum.value), this.isNegative);
        }
        // Otherwise, use the general array subtraction for two GrandNumbers.
        return flexibleSubtract(selfChunks, otherChunks, this.isNegative);
    };
    GrandNumber.prototype.minus = GrandNumber.prototype.subtract; // Alias for subtract.

    // CompactValue subtraction method.
    CompactValue.prototype.subtract = function(inputVal) {
        const otherNum = interpretInput(inputVal);
        const selfVal = this.value;
        // If signs are different, convert to addition.
        if ((selfVal < 0) !== otherNum.isNegative) {
            return this.add(otherNum.flipSign());
        }
        const otherVal = otherNum.value;
        // If both are CompactValues, perform direct JavaScript subtraction.
        if (otherNum.isCompact) {
            return new CompactValue(selfVal - otherVal);
        }
        // If other is GrandNumber, subtract self (as absolute value) from it,
        // and determine the result's sign.
        return decrementWithBorrow(otherVal, Math.abs(selfVal), selfVal >= 0);
    };
    CompactValue.prototype.minus = CompactValue.prototype.subtract; // Alias for subtract.

    // Negates a GrandNumber by flipping its sign flag.
    GrandNumber.prototype.flipSign = function() {
        return new GrandNumber(this.chunkArray, !this.isNegative);
    };

    // Negates a CompactValue by negating its numerical value and flipping its sign flag.
    CompactValue.prototype.flipSign = function() {
        const originalSign = this.isNegative;
        const negatedSmall = new CompactValue(-this.value);
        negatedSmall.isNegative = !originalSign; // Explicitly set sign for consistency.
        return negatedSmall;
    };

    // Returns the absolute value of a GrandNumber by setting its sign to positive.
    GrandNumber.prototype.absolute = function() {
        return new GrandNumber(this.chunkArray, false);
    };

    // Returns the absolute value of a CompactValue using Math.abs().
    CompactValue.prototype.absolute = function() {
        return new CompactValue(Math.abs(this.value));
    };

    /**
     * Performs 'long' multiplication on two arrays of number chunks.
     * This is a standard grade-school multiplication algorithm.
     * @param {number[]} factorA - The first multiplicand chunk array.
     * @param {number[]} factorB - The second multiplicand chunk array.
     * @returns {number[]} The resulting product chunk array.
     */
    function longMultiplication(factorA, factorB) {
        const lenA = factorA.length,
            lenB = factorB.length;
        const resultLen = lenA + lenB; // Maximum possible length of the product.
        const productChunks = allocateEmptyArray(resultLen);
        let currentProduct, currentCarry, idxA, chunkA, chunkB;

        for (idxA = 0; idxA < lenA; ++idxA) {
            chunkA = factorA[idxA];
            for (let idxB = 0; idxB < lenB; ++idxB) {
                chunkB = factorB[idxB];
                // Multiply chunks, add to existing product at this position, and add carry.
                currentProduct = chunkA * chunkB + productChunks[idxA + idxB];
                currentCarry = Math.floor(currentProduct / CHUNK_BASE); // Calculate carry to next position.
                productChunks[idxA + idxB] = currentProduct - currentCarry * CHUNK_BASE; // Store current chunk.
                productChunks[idxA + idxB + 1] += currentCarry; // Add carry to the next higher position.
            }
        }
        normalizeArray(productChunks); // Remove any leading zeros.
        return productChunks;
    }

    /**
     * Multiplies an array of chunks by a single small number.
     * Optimized for multiplying a GrandNumber by a CompactValue.
     * @param {number[]} chunkArray - The array of chunks.
     * @param {number} multiplier - The small number multiplier.
     * @returns {number[]} The resulting product chunk array.
     */
    function multiplyBySingleDigit(chunkArray, multiplier) {
        const len = chunkArray.length;
        const resArr = new Array(len);
        let currentCarry = 0,
            currentProduct, idx;

        for (idx = 0; idx < len; idx++) {
            currentProduct = chunkArray[idx] * multiplier + currentCarry;
            currentCarry = Math.floor(currentProduct / CHUNK_BASE); // Calculate carry.
            resArr[idx] = currentProduct - currentCarry * CHUNK_BASE; // Store current chunk.
        }

        // Propagate any remaining carry.
        while (currentCarry > 0) {
            resArr[idx++] = currentCarry % CHUNK_BASE;
            currentCarry = Math.floor(currentCarry / CHUNK_BASE);
        }
        return resArr;
    }

    /**
     * Pads an array with leading zeros, effectively performing a left bit shift.
     * @param {number[]} numArr - The array to shift.
     * @param {number} numZeros - The number of zeros to prepend (shift amount).
     * @returns {number[]} The shifted array.
     */
    function leftShiftDigits(numArr, numZeros) {
        const paddedArr = [];
        while (numZeros-- > 0) paddedArr.push(0); // Prepend zeros.
        return paddedArr.concat(numArr); // Concatenate with original array.
    }

    /**
     * Multiplies two chunk arrays using the Karatsuba algorithm for improved efficiency
     * with very large numbers.
     * @param {number[]} arrX - The first chunk array.
     * @param {number[]} arrY - The second chunk array.
     * @returns {number[]} The resulting product chunk array.
     */
    function karatsubaProduct(arrX, arrY) {
        let maxLen = Math.max(arrX.length, arrY.length);
        if (maxLen <= 30) return longMultiplication(arrX, arrY); // Base case: use long multiplication for small arrays.

        maxLen = Math.ceil(maxLen / 2); // Split point for Karatsuba.
        const b_high = arrX.slice(maxLen); // High part of X.
        const a_low = arrX.slice(0, maxLen); // Low part of X.
        const d_high = arrY.slice(maxLen); // High part of Y.
        const c_low = arrY.slice(0, maxLen); // Low part of Y.

        // Recursively compute the three products.
        const ac_prod = karatsubaProduct(a_low, c_low);
        const bd_prod = karatsubaProduct(b_high, d_high);
        const abcd_prod = karatsubaProduct(flexibleAdd(a_low, b_high), flexibleAdd(c_low, d_high));

        // Combine the results using the Karatsuba identity:
        // (a*B^n + b)(c*B^n + d) = ac*B^2n + ((a+b)(c+d) - ac - bd)*B^n + bd
        const intermediate = flexibleSubtract(flexibleSubtract(abcd_prod, ac_prod), bd_prod);
        const finalProduct = flexibleAdd(flexibleAdd(ac_prod, leftShiftDigits(intermediate.chunkArray, maxLen)), leftShiftDigits(bd_prod, 2 * maxLen));
        normalizeArray(finalProduct);
        return finalProduct;
    }

    /**
     * Determines if the Karatsuba algorithm should be used for multiplication
     * based on the lengths of the two chunk arrays. This is an empirical threshold.
     * @param {number} len1 - Length of the first array.
     * @param {number} len2 - Length of the second array.
     * @returns {boolean} True if Karatsuba is estimated to be more efficient.
     */
    function karatsubaThreshold(len1, len2) {
        // Empirical formula to decide when Karatsuba is faster.
        return -.012 * len1 - .012 * len2 + 15e-6 * len1 * len2 > 0;
    }

    // GrandNumber multiplication method.
    GrandNumber.prototype.multiply = function(inputVal) {
        const otherNum = interpretInput(inputVal);
        const selfChunks = this.chunkArray,
            otherChunks = otherNum.chunkArray;
        const finalSign = this.isNegative !== otherNum.isNegative; // Determine sign of the product.
        let absOtherVal;

        // Optimized path for multiplication by a CompactValue.
        if (otherNum.isCompact) {
            absOtherVal = Math.abs(otherNum.value);
            if (absOtherVal === 0) return NumericEntity[0]; // Multiply by zero.
            if (absOtherVal === 1) return finalSign ? this.flipSign() : this; // Multiply by 1 or -1.
            if (absOtherVal < CHUNK_BASE) { // If multiplier fits in one chunk.
                return new GrandNumber(multiplyBySingleDigit(selfChunks, absOtherVal), finalSign);
            }
            // If multiplier is small but requires multiple chunks (e.g., 10^7).
            absOtherVal = splitSmallNumber(absOtherVal);
        }

        // Choose between Karatsuba and long multiplication based on array lengths.
        if (karatsubaThreshold(selfChunks.length, absOtherVal ? absOtherVal.length : otherChunks.length)) {
            return new GrandNumber(karatsubaProduct(selfChunks, absOtherVal || otherChunks), finalSign);
        }
        // Fallback to standard long multiplication.
        return new GrandNumber(longMultiplication(selfChunks, absOtherVal || otherChunks), finalSign);
    };
    GrandNumber.prototype.times = GrandNumber.prototype.multiply; // Alias for multiply.

    /**
     * Helper function for multiplying a small number by a chunk array.
     * @param {number} smallFactor - The small number (absolute value).
     * @param {number[]} chunkArray - The chunk array.
     * @param {boolean} resultSign - The sign of the final result.
     * @returns {GrandNumber} The product as a GrandNumber.
     */
    function multiplySmallByArray(smallFactor, chunkArray, resultSign) {
        if (smallFactor < CHUNK_BASE) {
            return new GrandNumber(multiplyBySingleDigit(chunkArray, smallFactor), resultSign);
        }
        // If smallFactor is larger than a single chunk, convert it to chunks for long multiplication.
        return new GrandNumber(longMultiplication(chunkArray, splitSmallNumber(smallFactor)), resultSign);
    }

    // Internal multiplication method for CompactValue by a SmallNumber (CompactValue).
    CompactValue.prototype._multiplyBySmall = function(smallFactor) {
        // If the product fits within a JS safe integer, return a new CompactValue.
        if (checkPrecision(smallFactor.value * this.value)) {
            return new CompactValue(smallFactor.value * this.value);
        }
        // Otherwise, perform multiplication using chunk arrays.
        return multiplySmallByArray(Math.abs(smallFactor.value), splitSmallNumber(Math.abs(this.value)), this.isNegative !== smallFactor.isNegative);
    };

    // Internal multiplication method for GrandNumber by a SmallNumber (CompactValue).
    GrandNumber.prototype._multiplyBySmall = function(smallFactor) {
        if (smallFactor.value === 0) return NumericEntity[0];
        if (smallFactor.value === 1) return this;
        if (smallFactor.value === -1) return this.flipSign();
        return multiplySmallByArray(Math.abs(smallFactor.value), this.chunkArray, this.isNegative !== smallFactor.isNegative);
    };

    // CompactValue multiplication method.
    CompactValue.prototype.multiply = function(inputVal) {
        // Delegate to the internal _multiplyBySmall method of the other operand.
        return interpretInput(inputVal)._multiplyBySmall(this);
    };
    CompactValue.prototype.times = CompactValue.prototype.multiply; // Alias for multiply.

    /**
     * Calculates the square of a chunk array.
     * This is an optimized multiplication when both factors are the same.
     * @param {number[]} chunkArray - The array to square.
     * @returns {number[]} The resulting squared chunk array.
     */
    function computeSquare(chunkArray) {
        const len = chunkArray.length;
        const resultArr = allocateEmptyArray(len + len); // Max length of square.
        let currentProduct, currentCarry, idxI, valI, valJ;

        for (idxI = 0; idxI < len; idxI++) {
            valI = chunkArray[idxI];
            currentCarry = 0 - valI * valI; // Initialize carry with negative diagonal term (optimization).
            for (let idxJ = idxI; idxJ < len; idxJ++) {
                valJ = chunkArray[idxJ];
                // Formula for square: (sum a_i * B^i)^2 = sum (2 * a_i * a_j) * B^(i+j) + sum a_i^2 * B^(2i)
                // This loop computes 2 * a_i * a_j and adds it to result.
                currentProduct = 2 * (valI * valJ) + resultArr[idxI + idxJ] + currentCarry;
                currentCarry = Math.floor(currentProduct / CHUNK_BASE);
                resultArr[idxI + idxJ] = currentProduct - currentCarry * CHUNK_BASE;
            }
            resultArr[idxI + len] += currentCarry; // Propagate final carry for this row.
        }
        normalizeArray(resultArr);
        return resultArr;
    }

    // GrandNumber square method.
    GrandNumber.prototype.square = function() {
        return new GrandNumber(computeSquare(this.chunkArray), false); // Square is always positive.
    };

    // CompactValue square method.
    CompactValue.prototype.square = function() {
        const squaredVal = this.value * this.value;
        if (checkPrecision(squaredVal)) return new CompactValue(squaredVal); // If result fits in CompactValue.
        // Otherwise, convert to chunks and compute square as a GrandNumber.
        return new GrandNumber(computeSquare(splitSmallNumber(Math.abs(this.value))), false);
    };

    /**
     * Division algorithm 1: Optimized for smaller divisors.
     * Implements a variant of Knuth's Algorithm D for arbitrary precision division.
     * @param {number[]} dividendArr - The dividend chunk array.
     * @param {number[]} divisorArr - The divisor chunk array.
     * @returns {[number[], number[]]} An array containing [quotient chunks, remainder chunks].
     */
    function longDivisionAlgorithm(dividendArr, divisorArr) {
        const dividendLen = dividendArr.length,
            divisorLen = divisorArr.length;
        const resultQuotient = allocateEmptyArray(divisorLen); // Quotient can have up to divisorLen chunks.
        const highestDivisorChunk = divisorArr[divisorLen - 1]; // Most significant chunk of divisor.
        // Normalization factor: scale operands to make divisor's MSB large, improving quotient digit estimation.
        const normFactor = Math.ceil(CHUNK_BASE / (2 * highestDivisorChunk));
        let remainderArr = multiplyBySingleDigit(dividendArr, normFactor); // Scale dividend.
        let scaledDivisor = multiplyBySingleDigit(divisorArr, normFactor); // Scale divisor.
        let quotientDigit, currentShift, currentCarry, currentBorrow, idx, loopLen, tempQuotient;

        if (remainderArr.length <= dividendLen) remainderArr.push(0); // Ensure remainder array has enough capacity.
        scaledDivisor.push(0); // Pad scaled divisor for comparison logic.
        const newHighestDivisorChunk = scaledDivisor[divisorLen - 1]; // Recalculate after scaling.

        // Iterate from most significant possible quotient digit position down to least significant.
        for (currentShift = dividendLen - divisorLen; currentShift >= 0; currentShift--) {
            quotientDigit = CHUNK_BASE - 1; // Initial guess for quotient digit (max possible).
            // Refine guess using the two most significant chunks of remainder and divisor.
            if (remainderArr[currentShift + divisorLen] !== newHighestDivisorChunk) {
                quotientDigit = Math.floor((remainderArr[currentShift + divisorLen] * CHUNK_BASE + remainderArr[currentShift + divisorLen - 1]) / newHighestDivisorChunk);
            }

            currentCarry = 0;
            currentBorrow = 0;
            loopLen = scaledDivisor.length;
            // Subtract (quotientDigit * scaledDivisor) from the current part of remainder.
            for (idx = 0; idx < loopLen; idx++) {
                currentCarry += quotientDigit * scaledDivisor[idx];
                tempQuotient = Math.floor(currentCarry / CHUNK_BASE);
                currentBorrow += remainderArr[currentShift + idx] - (currentCarry - tempQuotient * CHUNK_BASE);
                currentCarry = tempQuotient;

                if (currentBorrow < 0) {
                    remainderArr[currentShift + idx] = currentBorrow + CHUNK_BASE;
                    currentBorrow = -1; // Propagate negative borrow.
                } else {
                    remainderArr[currentShift + idx] = currentBorrow;
                    currentBorrow = 0;
                }
            }

            // Adjust quotient if initial guess was too high (i.e., we borrowed too much).
            while (currentBorrow !== 0) {
                quotientDigit -= 1;
                currentCarry = 0;
                // Add scaledDivisor back to remainder (effectively compensating for over-subtraction).
                for (idx = 0; idx < loopLen; idx++) {
                    currentCarry += remainderArr[currentShift + idx] - CHUNK_BASE + scaledDivisor[idx];
                    if (currentCarry < 0) {
                        remainderArr[currentShift + idx] = currentCarry + CHUNK_BASE;
                        currentCarry = 0;
                    } else {
                        remainderArr[currentShift + idx] = currentCarry;
                        currentCarry = 1;
                    }
                }
                currentBorrow += currentCarry; // Update borrow after adjustment.
            }
            resultQuotient[currentShift] = quotientDigit; // Store the refined quotient digit.
        }

        // Unscale the remainder (divide by normFactor).
        remainderArr = scalarDivision(remainderArr, normFactor)[0];
        return [combineArrayToSmall(resultQuotient), combineArrayToSmall(remainderArr)];
    }

    /**
     * Division algorithm 2: A simpler, more general-purpose division algorithm.
     * It iteratively subtracts multiples of the divisor from the dividend.
     * @param {number[]} dividendArr - The dividend chunk array.
     * @param {number[]} divisorArr - The divisor chunk array.
     * @returns {[number[], number[]]} An array containing [quotient chunks, remainder chunks].
     */
    function optimizedDivision(dividendArr, divisorArr) {
        let dividendLen = dividendArr.length,
            divisorLen = divisorArr.length;
        const resultParts = [],
            currentPart = []; // `currentPart` holds the current portion of the dividend being processed.
        let guessVal, xLength, highX, highY, checkResult;

        // Process dividend chunks from most significant to least significant.
        while (dividendLen) {
            currentPart.unshift(dividendArr[--dividendLen]); // Take one chunk from dividend, add to front of currentPart.
            normalizeArray(currentPart); // Trim leading zeros from currentPart.

            // If currentPart is smaller than divisor, quotient digit is 0.
            if (compareAbsoluteValues(currentPart, divisorArr) < 0) {
                resultParts.push(0);
                continue;
            }

            xLength = currentPart.length;
            // Estimate quotient digit using the two most significant chunks of currentPart and divisor.
            highX = currentPart[xLength - 1] * CHUNK_BASE + currentPart[xLength - 2];
            highY = divisorArr[divisorLen - 1] * CHUNK_BASE + divisorArr[divisorLen - 2];

            if (xLength > divisorLen) {
                highX = (highX + 1) * CHUNK_BASE; // Adjust estimate if currentPart has an extra chunk.
            }

            guessVal = Math.ceil(highX / highY); // Initial guess for quotient digit.

            // Refine guess by iteratively checking if (guessVal * divisor) is too large.
            do {
                checkResult = multiplyBySingleDigit(divisorArr, guessVal);
                if (compareAbsoluteValues(checkResult, currentPart) <= 0) break; // Guess is good or too small.
                guessVal--; // Reduce guess.
            } while (guessVal);

            resultParts.push(guessVal); // Store the determined quotient digit.
            currentPart = performSubtraction(currentPart, checkResult); // Update remainder.
        }

        resultParts.reverse(); // Digits were pushed in reverse order, reverse to correct.
        return [combineArrayToSmall(resultParts), combineArrayToSmall(currentPart)];
    }

    /**
     * Divides an array of chunks by a single small number (scalar).
     * @param {number[]} chunkArray - The chunk array dividend.
     * @param {number} scalarDivisor - The small number divisor.
     * @returns {[number[], number]} An array containing [quotient chunks, remainder].
     */
    function scalarDivision(chunkArray, scalarDivisor) {
        const len = chunkArray.length;
        const quotientArr = allocateEmptyArray(len);
        let currentRemainder = 0,
            qVal, currentDividend, idx;

        // Process chunks from most significant to least significant.
        for (idx = len - 1; idx >= 0; --idx) {
            currentDividend = currentRemainder * CHUNK_BASE + chunkArray[idx]; // Form current dividend.
            qVal = roundTowardsZero(currentDividend / scalarDivisor); // Calculate quotient digit.
            currentRemainder = currentDividend - qVal * scalarDivisor; // Calculate new remainder.
            quotientArr[idx] = qVal | 0; // Store quotient digit, ensuring integer.
        }
        return [quotientArr, currentRemainder | 0]; // Return quotient array and final remainder.
    }

    /**
     * Universal division and modulo function for any numeric entity.
     * Handles various combinations of CompactValue and GrandNumber operands.
     * @param {NumericEntity} selfNum - The dividend.
     * @param {*} divisorVal - The divisor (can be number, string, or NumericEntity).
     * @returns {[NumericEntity, NumericEntity]} An array containing [quotient, remainder].
     * @throws {Error} If division by zero is attempted.
     */
    function universalDivMod(selfNum, divisorVal) {
        let resultPair, otherNum = interpretInput(divisorVal);
        const selfChunks = selfNum.chunkArray,
            otherChunks = otherNum.chunkArray;
        let finalQuotient;

        if (otherNum.isZero()) throw new Error("Cannot divide by zero");

        // Case 1: Both operands are CompactValues.
        if (selfNum.isCompact) {
            if (otherNum.isCompact) {
                return [new CompactValue(roundTowardsZero(selfNum.value / otherNum.value)), new CompactValue(selfNum.value % otherNum.value)];
            }
            // Case 2: CompactValue (dividend) by GrandNumber (divisor). Quotient is 0, remainder is dividend.
            return [NumericEntity[0], selfNum];
        }

        // Case 3: GrandNumber (dividend) by CompactValue (divisor).
        if (otherNum.isCompact) {
            if (otherNum.value === 1) return [selfNum, NumericEntity[0]]; // Divide by 1.
            if (otherNum.value === -1) return [selfNum.flipSign(), NumericEntity[0]]; // Divide by -1.
            const absOther = Math.abs(otherNum.value);
            if (absOther < CHUNK_BASE) { // If small divisor fits in one chunk.
                resultPair = scalarDivision(selfChunks, absOther);
                finalQuotient = combineArrayToSmall(resultPair[0]);
                let finalRemainder = resultPair[1];
                if (selfNum.isNegative) finalRemainder = -finalRemainder; // Remainder sign matches dividend.

                if (typeof finalQuotient === "number") {
                    if (selfNum.isNegative !== otherNum.isNegative) finalQuotient = -finalQuotient;
                    return [new CompactValue(finalQuotient), new CompactValue(finalRemainder)];
                }
                return [new GrandNumber(finalQuotient, selfNum.isNegative !== otherNum.isNegative), new CompactValue(finalRemainder)];
            }
            // If small divisor requires multiple chunks.
            otherChunks = splitSmallNumber(absOther);
        }

        // Case 4: Both operands are GrandNumbers (or GrandNumber / multi-chunk CompactValue).
        const comparison = compareAbsoluteValues(selfChunks, otherChunks);
        if (comparison === -1) return [NumericEntity[0], selfNum]; // |Dividend| < |Divisor|.
        if (comparison === 0) return [NumericEntity[selfNum.isNegative === otherNum.isNegative ? 1 : -1], NumericEntity[0]]; // |Dividend| = |Divisor|.

        // Choose between different division algorithms based on size.
        if (selfChunks.length + otherChunks.length <= 200) { // Empirical threshold.
            resultPair = longDivisionAlgorithm(selfChunks, otherChunks);
        } else {
            resultPair = optimizedDivision(selfChunks, otherChunks);
        }

        finalQuotient = resultPair[0];
        let finalModulus = resultPair[1];
        const quotientSign = selfNum.isNegative !== otherNum.isNegative,
            modulusSign = selfNum.isNegative; // Remainder sign matches dividend.

        // Convert quotient to CompactValue or GrandNumber.
        if (typeof finalQuotient === "number") {
            if (quotientSign) finalQuotient = -finalQuotient;
            finalQuotient = new CompactValue(finalQuotient);
        } else finalQuotient = new GrandNumber(finalQuotient, quotientSign);

        // Convert remainder to CompactValue or GrandNumber.
        if (typeof finalModulus === "number") {
            if (modulusSign) finalModulus = -finalModulus;
            finalModulus = new CompactValue(finalModulus);
        } else finalModulus = new GrandNumber(finalModulus, modulusSign);

        return [finalQuotient, finalModulus];
    }

    // GrandNumber divmod method: returns an object with quotient and remainder.
    GrandNumber.prototype.divmod = function(inputVal) {
        const result = universalDivMod(this, inputVal);
        return {
            quotient: result[0],
            remainder: result[1]
        };
    };
    CompactValue.prototype.divmod = GrandNumber.prototype.divmod; // Share implementation.

    // GrandNumber divide method: returns only the quotient.
    GrandNumber.prototype.divide = function(inputVal) {
        return universalDivMod(this, inputVal)[0];
    };
    // Aliases for divide.
    CompactValue.prototype.over = CompactValue.prototype.divide = GrandNumber.prototype.over = GrandNumber.prototype.divide;

    // GrandNumber modulo method: returns only the remainder.
    GrandNumber.prototype.mod = function(inputVal) {
        return universalDivMod(this, inputVal)[1];
    };
    // Aliases for mod.
    CompactValue.prototype.remainder = CompactValue.prototype.mod = GrandNumber.prototype.remainder = GrandNumber.prototype.mod;

    // GrandNumber power method (exponentiation).
    GrandNumber.prototype.power = function(inputVal) {
        const exponentNum = interpretInput(inputVal);
        const baseChunks = this.chunkArray,
            exponentVal = exponentNum.value;
        let computedValue, baseInstance, resultInstance;

        if (exponentVal === 0) return NumericEntity[1]; // x^0 = 1.
        if (this.isZero()) return NumericEntity[0]; // 0^y = 0 (for y > 0).
        if (this.equals(1)) return NumericEntity[1]; // 1^y = 1.
        if (this.equals(-1)) return exponentNum.isEven() ? NumericEntity[1] : NumericEntity[-1]; // (-1)^y.

        if (exponentNum.isNegative()) { // Negative exponent means result is 0 for integer power.
            return NumericEntity[0];
        }
        if (!exponentNum.isCompact) {
            throw new Error("The exponent " + exponentNum.toString() + " is too large.");
        }

        // Optimization for small bases: try native JS Math.pow.
        if (this.isCompact) {
            computedValue = Math.pow(baseChunks, exponentVal);
            if (checkPrecision(computedValue)) return new CompactValue(roundTowardsZero(computedValue));
        }

        // Binary exponentiation (exponentiation by squaring).
        baseInstance = this;
        resultInstance = NumericEntity[1];
        while (true) {
            if ((exponentVal & 1) === 1) { // If exponent is odd.
                resultInstance = resultInstance.times(baseInstance);
            }
            // Halve the exponent, square the base.
            exponentVal = Math.floor(exponentVal / 2); // Use Math.floor for positive integer division.
            if (exponentVal === 0) break; // Exponent becomes zero, loop terminates.
            baseInstance = baseInstance.square();
        }
        return resultInstance;
    };
    CompactValue.prototype.power = GrandNumber.prototype.power; // Share implementation.

    // GrandNumber modular exponentiation (a^b mod m).
    GrandNumber.prototype.modPower = function(expVal, modVal) {
        let exponent = interpretInput(expVal);
        let modulus = interpretInput(modVal);
        if (modulus.isZero()) throw new Error("Cannot perform modPower with modulus 0");

        let result = NumericEntity[1]; // Initialize result to 1.
        let currentBase = this.mod(modulus); // Reduce base modulo m.

        while (exponent.isPositive()) {
            if (currentBase.isZero()) return NumericEntity[0]; // If base is 0, result is 0 (for positive exponent).
            if (exponent.isOdd()) {
                result = result.multiply(currentBase).mod(modulus); // result = (result * base) mod modulus.
            }
            exponent = exponent.divide(2); // exponent = exponent / 2.
            currentBase = currentBase.square().mod(modulus); // base = (base * base) mod modulus.
        }
        return result;
    };
    CompactValue.prototype.modPower = GrandNumber.prototype.modPower; // Share implementation.

    /**
     * Compares the absolute values of two chunk arrays.
     * @param {number[]} arrA - The first chunk array.
     * @param {number[]} arrB - The second chunk array.
     * @returns {number} -1 if |arrA| < |arrB|, 0 if |arrA| = |arrB|, 1 if |arrA| > |arrB|.
     */
    function compareAbsoluteValues(arrA, arrB) {
        if (arrA.length !== arrB.length) {
            return arrA.length > arrB.length ? 1 : -1; // Longer array has larger absolute value.
        }
        // Compare chunks from most significant to least significant.
        for (let idx = arrA.length - 1; idx >= 0; idx--) {
            if (arrA[idx] !== arrB[idx]) return arrA[idx] > arrB[idx] ? 1 : -1;
        }
        return 0; // Arrays are absolutely identical.
    }

    // GrandNumber absolute value comparison.
    GrandNumber.prototype.compareAbs = function(inputVal) {
        const otherNum = interpretInput(inputVal);
        const selfChunks = this.chunkArray,
            otherChunks = otherNum.chunkArray;
        if (otherNum.isCompact) return 1; // A GrandNumber is always absolutely larger than a CompactValue.
        return compareAbsoluteValues(selfChunks, otherChunks);
    };

    // CompactValue absolute value comparison.
    CompactValue.prototype.compareAbs = function(inputVal) {
        const otherNum = interpretInput(inputVal);
        const selfAbsVal = Math.abs(this.value),
            otherVal = otherNum.value;
        if (otherNum.isCompact) {
            const otherAbsVal = Math.abs(otherVal);
            return selfAbsVal === otherAbsVal ? 0 : selfAbsVal > otherAbsVal ? 1 : -1;
        }
        return -1; // A CompactValue is always absolutely smaller than a GrandNumber.
    };

    // GrandNumber general comparison.
    GrandNumber.prototype.compare = function(inputVal) {
        if (inputVal === Infinity) {
            return -1; // Any finite number is less than infinity.
        }
        if (inputVal === -Infinity) {
            return 1; // Any finite number is greater than negative infinity.
        }
        const otherNum = interpretInput(inputVal);
        const selfChunks = this.chunkArray,
            otherChunks = otherNum.chunkArray;

        if (this.isNegative !== otherNum.isNegative) {
            return otherNum.isNegative ? 1 : -1; // Different signs: negative < positive.
        }
        if (otherNum.isCompact) { // GrandNumber vs CompactValue.
            return this.isNegative ? -1 : 1; // Negative large is smaller than negative small, positive large is larger than positive small.
        }
        // Same sign, both GrandNumbers.
        return compareAbsoluteValues(selfChunks, otherChunks) * (this.isNegative ? -1 : 1);
    };
    GrandNumber.prototype.compareTo = GrandNumber.prototype.compare; // Alias for compare.

    // CompactValue general comparison.
    CompactValue.prototype.compare = function(inputVal) {
        if (inputVal === Infinity) {
            return -1;
        }
        if (inputVal === -Infinity) {
            return 1;
        }
        const otherNum = interpretInput(inputVal);
        const selfVal = this.value,
            otherVal = otherNum.value;

        if (otherNum.isCompact) { // Both compact values.
            return selfVal === otherVal ? 0 : selfVal > otherVal ? 1 : -1;
        }
        // CompactValue vs GrandNumber.
        if ((selfVal < 0) !== otherNum.isNegative) {
            return selfVal < 0 ? -1 : 1; // Negative compact < positive large, positive compact > negative large.
        }
        // Same sign, one compact, one grand.
        return selfVal < 0 ? 1 : -1; // If both negative, compact is 'less negative' (larger). If both positive, compact is 'smaller'.
    };
    CompactValue.prototype.compareTo = CompactValue.prototype.compare; // Alias for compare.

    // Equality check.
    GrandNumber.prototype.equals = function(inputVal) {
        return this.compare(inputVal) === 0;
    };
    CompactValue.prototype.eq = CompactValue.prototype.equals = GrandNumber.prototype.eq = GrandNumber.prototype.equals;

    // Inequality check.
    GrandNumber.prototype.notEquals = function(inputVal) {
        return this.compare(inputVal) !== 0;
    };
    CompactValue.prototype.neq = CompactValue.prototype.notEquals = GrandNumber.prototype.neq = GrandNumber.prototype.notEquals;

    // Greater than check.
    GrandNumber.prototype.greater = function(inputVal) {
        return this.compare(inputVal) > 0;
    };
    CompactValue.prototype.gt = CompactValue.prototype.greater = GrandNumber.prototype.gt = GrandNumber.prototype.greater;

    // Less than check.
    GrandNumber.prototype.lesser = function(inputVal) {
        return this.compare(inputVal) < 0;
    };
    CompactValue.prototype.lt = CompactValue.prototype.lesser = GrandNumber.prototype.lt = GrandNumber.prototype.lesser;

    // Greater than or equals check.
    GrandNumber.prototype.greaterOrEquals = function(inputVal) {
        return this.compare(inputVal) >= 0;
    };
    CompactValue.prototype.geq = CompactValue.prototype.greaterOrEquals = GrandNumber.prototype.geq = GrandNumber.prototype.greaterOrEquals;

    // Less than or equals check.
    GrandNumber.prototype.lesserOrEquals = function(inputVal) {
        return this.compare(inputVal) <= 0;
    };
    CompactValue.prototype.leq = CompactValue.prototype.lesserOrEquals = GrandNumber.prototype.leq = GrandNumber.prototype.lesserOrEquals;

    // GrandNumber parity check (even).
    GrandNumber.prototype.isEven = function() {
        return (this.chunkArray[0] & 1) === 0; // Check least significant chunk's last bit.
    };
    // CompactValue parity check (even).
    CompactValue.prototype.isEven = function() {
        return (this.value & 1) === 0; // Check native number's last bit.
    };

    // GrandNumber parity check (odd).
    GrandNumber.prototype.isOdd = function() {
        return (this.chunkArray[0] & 1) === 1; // Check least significant chunk's last bit.
    };
    // CompactValue parity check (odd).
    CompactValue.prototype.isOdd = function() {
        return (this.value & 1) === 1; // Check native number's last bit.
    };

    // GrandNumber sign check (positive).
    GrandNumber.prototype.isPositive = function() {
        return !this.isNegative;
    };
    // CompactValue sign check (positive).
    CompactValue.prototype.isPositive = function() {
        return this.value > 0;
    };

    // GrandNumber sign check (negative).
    GrandNumber.prototype.isNegative = function() {
        return this.isNegative;
    };
    // CompactValue sign check (negative).
    CompactValue.prototype.isNegative = function() {
        return this.value < 0;
    };

    // GrandNumber unit check (1 or -1).
    GrandNumber.prototype.isUnit = function() {
        return false; // By definition, a GrandNumber is not 1 or -1 (those would be CompactValues).
    };
    // CompactValue unit check (1 or -1).
    CompactValue.prototype.isUnit = function() {
        return Math.abs(this.value) === 1;
    };

    // GrandNumber zero check.
    GrandNumber.prototype.isZero = function() {
        return false; // A GrandNumber instance implies it's not zero (zero is CompactValue).
    };
    // CompactValue zero check.
    CompactValue.prototype.isZero = function() {
        return this.value === 0;
    };

    // GrandNumber divisibility check.
    GrandNumber.prototype.isDivisibleBy = function(inputVal) {
        const otherNum = interpretInput(inputVal);
        const otherVal = otherNum.value;
        if (otherNum.isZero()) return false; // Cannot divide by zero.
        if (otherNum.isUnit()) return true; // Divisible by 1 or -1.
        if (otherNum.equals(2)) return this.isEven(); // Optimized for 2.
        return this.mod(otherNum).equals(NumericEntity[0]); // Check if remainder is zero.
    };
    CompactValue.prototype.isDivisibleBy = GrandNumber.prototype.isDivisibleBy; // Share implementation.

    /**
     * Checks if a number is a basic prime (small primes up to 23).
     * This is a quick pre-check for primality tests.
     * @param {NumericEntity} numToCheck - The number to check.
     * @returns {boolean|undefined} True for basic prime, false for basic composite, undefined otherwise.
     */
    function checkBasicPrime(numToCheck) {
        const absNum = numToCheck.absolute();
        if (absNum.isUnit()) return false; // 1 and -1 are not prime.
        if (absNum.equals(2) || absNum.equals(3) || absNum.equals(5)) return true;
        if (absNum.isEven() || absNum.isDivisibleBy(3) || absNum.isDivisibleBy(5)) return false;
        if (absNum.lesser(25)) return true; // Numbers like 7, 11, 13, 17, 19, 23 (after previous checks).
        return undefined; // Not a basic prime, further tests needed.
    }

    // GrandNumber primality test (Miller-Rabin algorithm).
    GrandNumber.prototype.isPrime = function() {
        const basicCheckResult = checkBasicPrime(this);
        if (basicCheckResult !== undefined) return basicCheckResult; // Use quick check results.

        const num = this.absolute();
        const numMinusOne = num.previous(); // n-1.
        const testPrimes = [2, 3, 5, 7, 11, 13, 17, 19]; // Fixed small bases for Miller-Rabin.
        let d_val = numMinusOne; // d in Miller-Rabin: n-1 = 2^s * d.
        let s_val = 0;

        // Find d and s such that n-1 = 2^s * d, where d is odd.
        while (d_val.isEven()) {
            d_val = d_val.divide(2);
            s_val++;
        }

        // Apply Miller-Rabin test for each base 'a'.
        for (let idx = 0; idx < testPrimes.length; idx++) {
            let a_base = massiveVal(testPrimes[idx]);
            let x_val = a_base.modPower(d_val, num); // x = a^d mod n.

            if (x_val.equals(NumericEntity[1]) || x_val.equals(numMinusOne)) continue; // Passes for this base.

            let isWitness = true; // Assume 'a' is a witness (n is composite).
            for (let r_val = 0; r_val < s_val; r_val++) {
                x_val = x_val.square().mod(num); // x = x^2 mod n.
                if (x_val.equals(numMinusOne)) {
                    isWitness = false; // Not a witness, n might be prime.
                    break;
                }
            }
            if (isWitness) return false; // Found a witness, n is composite.
        }
        return true; // Passed all tests, likely prime.
    };
    CompactValue.prototype.isPrime = GrandNumber.prototype.isPrime; // Share implementation.

    // GrandNumber probable primality test (Miller-Rabin with random bases).
    GrandNumber.prototype.isProbablePrime = function(numIterations) {
        const basicCheckResult = checkBasicPrime(this);
        if (basicCheckResult !== undefined) return basicCheckResult;

        const num = this.absolute();
        const iterations = numIterations === undefined ? 5 : numIterations; // Default 5 iterations.

        for (let idx = 0; idx < iterations; idx++) {
            // Pick a random base 'a' between 2 and n-2.
            const a_base = massiveVal.randBetween(2, num.minus(2));
            // Apply Miller-Rabin condition: a^(n-1) mod n === 1.
            if (!a_base.modPower(num.previous(), num).isUnit()) {
                return false; // Fails Miller-Rabin test.
            }
        }
        return true; // Probably prime.
    };
    CompactValue.prototype.isProbablePrime = GrandNumber.prototype.isProbablePrime; // Share implementation.

    // GrandNumber modular inverse (a^-1 mod n).
    GrandNumber.prototype.modInverse = function(modulus) {
        let t_val = massiveVal.zero,
            newT_val = massiveVal.one;
        let r_val = interpretInput(modulus),
            newR_val = this.absolute(); // Use absolute value for extended Euclidean algorithm.
        let q_val, lastT_val, lastR_val;

        // Extended Euclidean Algorithm.
        while (!newR_val.equals(massiveVal.zero)) {
            q_val = r_val.divide(newR_val);
            lastT_val = t_val;
            lastR_val = r_val;
            t_val = newT_val;
            r_val = newR_val;
            newT_val = lastT_val.subtract(q_val.multiply(newT_val));
            newR_val = lastR_val.subtract(q_val.multiply(newR_val));
        }

        if (!r_val.equals(1)) {
            throw new Error(this.toString() + " and " + modulus.toString() + " are not co-prime");
        }

        if (t_val.compare(0) === -1) {
            t_val = t_val.add(modulus); // Ensure positive result.
        }

        if (this.isNegative()) {
            return t_val.flipSign(); // Adjust sign if original number was negative.
        }
        return t_val;
    };
    CompactValue.prototype.modInverse = GrandNumber.prototype.modInverse; // Share implementation.

    // GrandNumber next integer (this + 1).
    GrandNumber.prototype.next = function() {
        const currentChunks = this.chunkArray;
        if (this.isNegative) {
            // Adding 1 to a negative number is like subtracting 1 from its absolute value.
            return decrementWithBorrow(currentChunks, 1, this.isNegative);
        }
        return new GrandNumber(augmentWithCarry(currentChunks, 1), this.isNegative);
    };

    // CompactValue next integer (this + 1).
    CompactValue.prototype.next = function() {
        const currentVal = this.value;
        if (currentVal + 1 < JS_SAFE_LIMIT) {
            return new CompactValue(currentVal + 1);
        }
        // If incrementing overflows safe integer limit, convert to GrandNumber.
        return new GrandNumber(JS_SAFE_LIMIT_ARRAY, false);
    };

    // GrandNumber previous integer (this - 1).
    GrandNumber.prototype.previous = function() {
        const currentChunks = this.chunkArray;
        if (this.isNegative) {
            // Subtracting 1 from a negative number is like adding 1 to its absolute value and keeping it negative.
            return new GrandNumber(augmentWithCarry(currentChunks, 1), true);
        }
        return decrementWithBorrow(currentChunks, 1, this.isNegative);
    };

    // CompactValue previous integer (this - 1).
    CompactValue.prototype.previous = function() {
        const currentVal = this.value;
        if (currentVal - 1 > -JS_SAFE_LIMIT) {
            return new CompactValue(currentVal - 1);
        }
        // If decrementing underflows safe integer limit, convert to negative GrandNumber.
        return new GrandNumber(JS_SAFE_LIMIT_ARRAY, true);
    };

    // Pre-calculated powers of two for efficient bit shifting (up to CHUNK_BASE).
    const powersOfTwo = [1];
    while (2 * powersOfTwo[powersOfTwo.length - 1] <= CHUNK_BASE) {
        powersOfTwo.push(2 * powersOfTwo[powersOfTwo.length - 1]);
    }
    const twoPowerCount = powersOfTwo.length; // Number of powers of 2.
    const highestTwoPower = powersOfTwo[twoPowerCount - 1]; // Largest power of 2 less than CHUNK_BASE.

    /**
     * Checks if a shift amount is small enough for direct JavaScript number handling (for optimization).
     * @param {*} shiftAmount - The value representing the shift amount.
     * @returns {boolean} True if the shift amount is small.
     */
    function isShiftSmall(shiftAmount) {
        return (typeof shiftAmount === "number" || typeof shiftAmount === "string") && +Math.abs(shiftAmount) <= CHUNK_BASE || shiftAmount instanceof GrandNumber && shiftAmount.chunkArray.length <= 1;
    }

    // GrandNumber bit shift left (equivalent to multiplication by powers of 2).
    GrandNumber.prototype.shiftLeft = function(shiftAmount) {
        if (!isShiftSmall(shiftAmount)) {
            throw new Error(String(shiftAmount) + " is too large for shifting.");
        }
        const shiftVal = +shiftAmount;
        if (shiftVal < 0) return this.shiftRight(-shiftVal); // Negative left shift is a right shift.

        let currentResult = this;
        if (currentResult.isZero()) return currentResult;

        // Apply shifts in chunks of highestTwoPower for efficiency.
        while (shiftVal >= twoPowerCount) {
            currentResult = currentResult.multiply(highestTwoPower);
            shiftVal -= (twoPowerCount - 1); // Adjust for loop structure.
        }
        return currentResult.multiply(powersOfTwo[shiftVal]);
    };
    CompactValue.prototype.shiftLeft = GrandNumber.prototype.shiftLeft; // Share implementation.

    // GrandNumber bit shift right (equivalent to division by powers of 2).
    GrandNumber.prototype.shiftRight = function(shiftAmount) {
        let divModResult;
        if (!isShiftSmall(shiftAmount)) {
            throw new Error(String(shiftAmount) + " is too large for shifting.");
        }
        const shiftVal = +shiftAmount;
        if (shiftVal < 0) return this.shiftLeft(-shiftVal); // Negative right shift is a left shift.

        let currentResult = this;

        // Apply shifts in chunks of highestTwoPower.
        while (shiftVal >= twoPowerCount) {
            // For negative numbers, (x >> n) is floor(x / 2^n).
            // `universalDivMod` rounds towards zero, so adjustment for negative remainders is needed.
            if (currentResult.isZero() || (currentResult.isNegative() && currentResult.isUnit())) {
                return currentResult; // -1 >> N remains -1, 0 >> N remains 0.
            }
            divModResult = universalDivMod(currentResult, highestTwoPower);
            currentResult = divModResult[1].isNegative() ? divModResult[0].previous() : divModResult[0];
            shiftVal -= (twoPowerCount - 1);
        }
        divModResult = universalDivMod(currentResult, powersOfTwo[shiftVal]);
        return divModResult[1].isNegative() ? divModResult[0].previous() : divModResult[0];
    };
    CompactValue.prototype.shiftRight = GrandNumber.prototype.shiftRight; // Share implementation.

    /**
     * Performs a generic bitwise operation (AND, OR, XOR) on two numeric entities.
     * Handles negative numbers by converting to a two's complement-like representation.
     * @param {NumericEntity} op1 - The first operand.
     * @param {NumericEntity} op2 - The second operand.
     * @param {function(number, number): number} bitwiseFn - The native JavaScript bitwise function (e.g., `(a,b) => a & b`).
     * @returns {GrandNumber} The result of the bitwise operation.
     */
    function bitwiseOperation(op1, op2, bitwiseFn) {
        op2 = interpretInput(op2);
        const op1Sign = op1.isNegative();
        const op2Sign = op2.isNegative();

        // Convert negative numbers to a representation suitable for bitwise operations.
        // `~x = -x - 1`. So, `x = ~(-x-1)`.
        let op1Remaining = op1Sign ? op1.not() : op1;
        let op2Remaining = op2Sign ? op2.not() : op2;

        let op1Chunk = 0,
            op2Chunk = 0;
        let op1DivResult = null,
            op2DivResult = null;
        const resultChunks = [];

        // Process chunks from least significant to most significant.
        while (!op1Remaining.isZero() || !op2Remaining.isZero()) {
            op1DivResult = universalDivMod(op1Remaining, highestTwoPower);
            op1Chunk = op1DivResult[1].toJSNumber();
            if (op1Sign) {
                op1Chunk = highestTwoPower - 1 - op1Chunk; // Invert bits for negative numbers (part of two's complement).
            }

            op2DivResult = universalDivMod(op2Remaining, highestTwoPower);
            op2Chunk = op2DivResult[1].toJSNumber();
            if (op2Sign) {
                op2Chunk = highestTwoPower - 1 - op2Chunk; // Invert bits for negative numbers.
            }

            op1Remaining = op1DivResult[0]; // Update remaining part of operand.
            op2Remaining = op2DivResult[0];
            resultChunks.push(bitwiseFn(op1Chunk, op2Chunk)); // Apply bitwise function to chunks.
        }

        // Reconstruct the result, handling potential sign extension for negative results.
        let finalSum = bitwiseFn(op1Sign ? 1 : 0, op2Sign ? 1 : 0) !== 0 ? massiveVal(-1) : massiveVal(0);
        for (let idx = resultChunks.length - 1; idx >= 0; idx -= 1) {
            finalSum = finalSum.multiply(highestTwoPower).add(massiveVal(resultChunks[idx]));
        }
        return finalSum;
    }

    // GrandNumber bitwise NOT (~x = -x - 1).
    GrandNumber.prototype.not = function() {
        return this.flipSign().previous();
    };
    CompactValue.prototype.not = GrandNumber.prototype.not; // Share implementation.

    // GrandNumber bitwise AND.
    GrandNumber.prototype.and = function(inputVal) {
        return bitwiseOperation(this, inputVal, (a, b) => a & b);
    };
    CompactValue.prototype.and = GrandNumber.prototype.and; // Share implementation.

    // GrandNumber bitwise OR.
    GrandNumber.prototype.or = function(inputVal) {
        return bitwiseOperation(this, inputVal, (a, b) => a | b);
    };
    CompactValue.prototype.or = GrandNumber.prototype.or; // Share implementation.

    // GrandNumber bitwise XOR.
    GrandNumber.prototype.xor = function(inputVal) {
        return bitwiseOperation(this, inputVal, (a, b) => a ^ b);
    };
    CompactValue.prototype.xor = GrandNumber.prototype.xor; // Share implementation.

    // Constants for rough LOB (Least Significant Bit) calculation.
    const LOBMASK_JS = 1 << 30; // Mask for JS number (32-bit signed int).
    const LOBMASK_BIG = (CHUNK_BASE & -CHUNK_BASE) * (CHUNK_BASE & -CHUNK_BASE) | LOBMASK_JS; // Mask for big int chunks.

    /**
     * Estimates the position of the least significant bit (LSB) set to 1.
     * This is an optimization used in GCD calculation.
     * @param {NumericEntity} num - The number to analyze.
     * @returns {number} A rough estimate of the LOB.
     */
    function estimateLOB(num) {
        const val = num.chunkArray;
        // For CompactValue, use direct JS bitwise. For GrandNumber, combine chunks.
        const combinedChunk = typeof val === "number" ? val | LOBMASK_JS : val[0] + val[1] * CHUNK_BASE | LOBMASK_BIG;
        return combinedChunk & -combinedChunk; // Isolates the least significant bit.
    }

    /**
     * Calculates integer logarithm (floor(log_base(value))).
     * Used internally for bitLength calculation (log base 2).
     * @param {NumericEntity} val - The value.
     * @param {NumericEntity} base - The base of the logarithm.
     * @returns {{p: NumericEntity, e: number}} Object with power and exponent.
     */
    function calculateIntegerLog(val, base) {
        if (base.compareTo(val) <= 0) {
            const recursiveResult = calculateIntegerLog(val, base.square());
            const power = recursiveResult.p;
            const exponent = recursiveResult.e;
            const tempProduct = power.multiply(base);
            return tempProduct.compareTo(val) <= 0 ? {
                p: tempProduct,
                e: exponent * 2 + 1
            } : {
                p: power,
                e: exponent * 2
            };
        }
        return {
            p: massiveVal(1),
            e: 0
        };
    }

    // GrandNumber bit length.
    GrandNumber.prototype.bitLength = function() {
        let num = this;
        if (num.compareTo(massiveVal(0)) < 0) {
            num = num.flipSign().subtract(massiveVal(1)); // For negative numbers, get bit length of two's complement.
        }
        if (num.compareTo(massiveVal(0)) === 0) {
            return massiveVal(0);
        }
        // Log base 2 of the number, +1 for count.
        return massiveVal(calculateIntegerLog(num, massiveVal(2)).e).add(massiveVal(1));
    };
    CompactValue.prototype.bitLength = GrandNumber.prototype.bitLength; // Share implementation.

    /**
     * Returns the larger of two numeric entities.
     * @param {*} num1 - First number.
     * @param {*} num2 - Second number.
     * @returns {NumericEntity} The maximum.
     */
    function findMax(num1, num2) {
        num1 = interpretInput(num1);
        num2 = interpretInput(num2);
        return num1.greater(num2) ? num1 : num2;
    }

    /**
     * Returns the smaller of two numeric entities.
     * @param {*} num1 - First number.
     * @param {*} num2 - Second number.
     * @returns {NumericEntity} The minimum.
     */
    function findMin(num1, num2) {
        num1 = interpretInput(num1);
        num2 = interpretInput(num2);
        return num1.lesser(num2) ? num1 : num2;
    }

    /**
     * Calculates the greatest common divisor (GCD) of two numbers using binary GCD algorithm.
     * @param {*} num1 - First number.
     * @param {*} num2 - Second number.
     * @returns {NumericEntity} The GCD.
     */
    function calculateGCD(num1, num2) {
        num1 = interpretInput(num1).absolute();
        num2 = interpretInput(num2).absolute();

        if (num1.equals(num2)) return num1;
        if (num1.isZero()) return num2;
        if (num2.isZero()) return num1;

        let commonFactor = NumericEntity[1];
        let tempVal;

        // Remove common factors of 2.
        while (num1.isEven() && num2.isEven()) {
            const minLOB = Math.min(estimateLOB(num1), estimateLOB(num2));
            num1 = num1.divide(minLOB);
            num2 = num2.divide(minLOB);
            commonFactor = commonFactor.multiply(minLOB);
        }

        // Remove remaining factors of 2 from num1 (now one of them must be odd).
        while (num1.isEven()) {
            num1 = num1.divide(estimateLOB(num1));
        }

        // Main binary GCD loop.
        do {
            while (num2.isEven()) {
                num2 = num2.divide(estimateLOB(num2));
            }
            if (num1.greater(num2)) {
                tempVal = num2;
                num2 = num1;
                num1 = tempVal;
            }
            num2 = num2.subtract(num1);
        } while (!num2.isZero());

        return commonFactor.isUnit() ? num1 : num1.multiply(commonFactor);
    }

    /**
     * Calculates the least common multiple (LCM) of two numbers.
     * LCM(a, b) = |a * b| / GCD(a, b)
     * @param {*} num1 - First number.
     * @param {*} num2 - Second number.
     * @returns {NumericEntity} The LCM.
     */
    function calculateLCM(num1, num2) {
        num1 = interpretInput(num1).absolute();
        num2 = interpretInput(num2).absolute();
        // To avoid overflow, divide first: (a / gcd(a,b)) * b.
        return num1.divide(calculateGCD(num1, num2)).multiply(num2);
    }

    /**
     * Generates a random number between two given numeric entities (inclusive).
     * @param {*} lowerBound - The lower bound.
     * @param {*} upperBound - The upper bound.
     * @returns {NumericEntity} A random number.
     */
    function generateRandomBetween(lowerBound, upperBound) {
        lowerBound = interpretInput(lowerBound);
        upperBound = interpretInput(upperBound);
        const low = findMin(lowerBound, upperBound);
        const high = findMax(lowerBound, upperBound);
        const range = high.subtract(low).add(1); // Calculate the size of the range.

        if (range.isCompact) {
            return low.add(Math.floor(Math.random() * range.value)); // For small ranges, use native JS random.
        }

        const rangeLen = range.chunkArray.length - 1;
        const randomChunks = [];
        let restrictedRange = true; // Flag to indicate if digits are still restricted by range.

        // Generate random chunks from most significant to least significant.
        for (let idx = rangeLen; idx >= 0; idx--) {
            const upperLimit = restrictedRange ? range.chunkArray[idx] : CHUNK_BASE;
            const digit = roundTowardsZero(Math.random() * upperLimit);
            randomChunks.unshift(digit); // Add to the beginning (least significant first).
            if (digit < upperLimit) restrictedRange = false; // Once a digit is less than max, no longer restricted.
        }

        const randomArray = combineArrayToSmall(randomChunks); // Attempt to convert to CompactValue.
        return low.add(typeof randomArray === "number" ? new CompactValue(randomArray) : new GrandNumber(randomArray, false));
    }

    /**
     * Parses a string representation of a number in a given base.
     * Handles standard bases (2-36) and custom bases.
     * @param {string} inputText - The string to parse.
     * @param {number|NumericEntity} baseSystem - The base (an integer >= 2).
     * @returns {NumericEntity} The parsed number.
     * @throws {Error} If invalid digit or base.
     */
    const parseValueByBase = (inputText, baseSystem) => {
        const textLength = inputText.length;
        let idx;
        const absBase = Math.abs(baseSystem);

        // Basic validation for digits based on the base.
        for (idx = 0; idx < textLength; idx++) {
            const char = inputText[idx].toLowerCase();
            if (char === "-") continue; // Skip negative sign.
            if (/[a-z0-9]/.test(char)) {
                if (/[0-9]/.test(char) && +char >= absBase) {
                    if (char === "1" && absBase === 1) continue; // Special case for base 1 (all ones).
                    throw new Error(char + " is not a valid digit in base " + baseSystem + ".");
                } else if (char.charCodeAt(0) - 87 >= absBase) { // 'a' is 97, so 'a'-87=10.
                    throw new Error(char + " is not a valid digit in base " + baseSystem + ".");
                }
            }
        }

        // Optimization for standard JS bases (2-36) if within safe integer limits.
        if (2 <= baseSystem && baseSystem <= 36) {
            // Check if string length is small enough to fit in a JS_SAFE_LIMIT number for this base.
            if (textLength <= LOG_JS_SAFE_LIMIT / Math.log(baseSystem)) {
                const jsParsedResult = parseInt(inputText, baseSystem);
                if (isNaN(jsParsedResult)) {
                    throw new Error("Invalid number string: " + inputText + " for base " + baseSystem + ".");
                }
                return new CompactValue(jsParsedResult);
            }
        }

        baseSystem = interpretInput(baseSystem);
        const digitValues = [];
        const isNegative = inputText[0] === "-";

        // Extract digit values from the string.
        for (idx = isNegative ? 1 : 0; idx < inputText.length; idx++) {
            const char = inputText[idx].toLowerCase();
            const charCode = char.charCodeAt(0);
            if (48 <= charCode && charCode <= 57) { // ASCII 0-9.
                digitValues.push(interpretInput(char));
            } else if (97 <= charCode && charCode <= 122) { // ASCII a-z.
                digitValues.push(interpretInput(charCode - 87));
            } else if (char === "<") { // Handle custom digit format like <10>.
                const startIdx = idx;
                do {
                    idx++;
                } while (inputText[idx] !== ">");
                digitValues.push(interpretInput(inputText.slice(startIdx + 1, idx)));
            } else {
                throw new Error(char + " is not a valid character.");
            }
        }
        return parseArrayIntoBase(digitValues, baseSystem, isNegative);
    };

    /**
     * Converts an array of digit NumericEntities in a given base into a single NumericEntity.
     * This is used by `parseValueByBase` for non-standard or large base numbers.
     * @param {NumericEntity[]} digitArr - Array of digit NumericEntities.
     * @param {NumericEntity} baseNum - The base as a NumericEntity.
     * @param {boolean} isNegative - Whether the final number should be negative.
     * @returns {NumericEntity} The resulting number.
     */
    function parseArrayIntoBase(digitArr, baseNum, isNegative) {
        let result = NumericEntity[0],
            currentPower = NumericEntity[1];
        // Horner's method: iterate from least significant digit.
        for (let idx = digitArr.length - 1; idx >= 0; idx--) {
            result = result.add(digitArr[idx].times(currentPower));
            currentPower = currentPower.times(baseNum);
        }
        return isNegative ? result.flipSign() : result;
    }

    /**
     * Converts a numerical digit value to its string representation.
     * For digits 0-35, uses standard alphanumeric characters. For larger, uses "<digit>".
     * @param {number} digitVal - The digit value.
     * @returns {string} The string representation of the digit.
     */
    function digitToString(digitVal) {
        if (digitVal <= 35) {
            return "0123456789abcdefghijklmnopqrstuvwxyz".charAt(digitVal);
        }
        return "<" + digitVal + ">"; // For digits larger than 35.
    }

    /**
     * Converts a numeric entity to an array of digits in a specified base.
     * @param {NumericEntity} num - The number to convert.
     * @param {NumericEntity} targetBase - The base for conversion.
     * @returns {{value: number[], isNegative: boolean}} Object with digit array and sign.
     * @throws {Error} For invalid base conversions (e.g., base 0).
     */
    function convertToBaseArray(num, targetBase) {
        targetBase = massiveVal(targetBase);
        if (targetBase.isZero()) {
            if (num.isZero()) return {
                value: [0],
                isNegative: false
            };
            throw new Error("Cannot convert nonzero numbers to base 0.");
        }
        if (targetBase.equals(-1)) { // Special handling for base -1.
            if (num.isZero()) return {
                value: [0],
                isNegative: false
            };
            const absNum = num.absolute().toJSNumber();
            if (num.isNegative()) {
                const arr = Array.from({
                    length: absNum
                }, () => [1, 0]).flat(); // e.g., -5 -> [1,0,1,0,1,0]
                return {
                    value: arr,
                    isNegative: false
                };
            }
            const arr = Array.from({
                length: absNum - 1
            }, () => [0, 1]).flat(); // e.g., 5 -> [1,0,1,0,1]
            arr.unshift(1);
            return {
                value: arr,
                isNegative: false
            };
        }

        let isResultNegative = false;
        if (num.isNegative() && targetBase.isPositive()) {
            isResultNegative = true;
            num = num.absolute(); // Convert to positive for conversion.
        }

        if (targetBase.equals(1)) { // Special handling for base 1.
            if (num.isZero()) return {
                value: [0],
                isNegative: false
            };
            const arr = Array.from({
                length: num.toJSNumber()
            }, () => 1); // e.g., 5 -> [1,1,1,1,1]
            return {
                value: arr,
                isNegative: isResultNegative
            };
        }

        const digitOutput = [];
        let remainingNum = num,
            divModResult;
        // Repeatedly divide by base and collect remainders.
        while (remainingNum.isNegative() || remainingNum.compareAbs(targetBase) >= 0) {
            divModResult = remainingNum.divmod(targetBase);
            remainingNum = divModResult.quotient;
            let digit = divModResult.remainder;
            if (digit.isNegative()) {
                digit = targetBase.minus(digit).absolute(); // Adjust for negative remainder.
                remainingNum = remainingNum.next(); // Adjust quotient.
            }
            digitOutput.push(digit.toJSNumber());
        }
        digitOutput.push(remainingNum.toJSNumber()); // Push the last quotient.
        return {
            value: digitOutput.reverse(),
            isNegative: isResultNegative
        }; // Reverse to get correct order.
    }

    /**
     * Converts a numeric entity to a string in a specified base.
     * @param {NumericEntity} num - The number to convert.
     * @param {NumericEntity} targetBase - The base.
     * @returns {string} The string representation.
     */
    function convertToBaseString(num, targetBase) {
        const arrResult = convertToBaseArray(num, targetBase);
        return (arrResult.isNegative ? "-" : "") + arrResult.value.map(digitToString).join("");
    }

    // GrandNumber method to convert to an array of digits in a given base.
    GrandNumber.prototype.toDigitArray = function(targetBase) {
        return convertToBaseArray(this, targetBase);
    };
    CompactValue.prototype.toDigitArray = function(targetBase) {
        return convertToBaseArray(this, targetBase);
    };

    // GrandNumber toString method.
    GrandNumber.prototype.toString = function(targetBase) {
        if (targetBase === undefined) targetBase = 10;
        if (targetBase !== 10) return convertToBaseString(this, targetBase);

        const currentChunks = this.chunkArray;
        let lastChunkIdx = currentChunks.length - 1;
        let outputString = String(currentChunks[lastChunkIdx--]); // Start with most significant chunk.
        const paddingZeros = "0000000"; // For zero-padding chunks (to CHUNK_EXPONENT length).
        let currentDigit;

        while (lastChunkIdx >= 0) {
            currentDigit = String(currentChunks[lastChunkIdx--]);
            outputString += paddingZeros.slice(currentDigit.length) + currentDigit; // Pad and append.
        }
        const signPrefix = this.isNegative ? "-" : "";
        return signPrefix + outputString;
    };

    // CompactValue toString method.
    CompactValue.prototype.toString = function(targetBase) {
        if (targetBase === undefined) targetBase = 10;
        if (targetBase != 10) return convertToBaseString(this, targetBase);
        return String(this.value); // Direct conversion for native numbers.
    };

    // JSON serialization method for both types.
    GrandNumber.prototype.toJSON = CompactValue.prototype.toJSON = function() {
        return this.toString(); // Serialize to string.
    };

    // ValueOf for GrandNumber (converts to JS number if possible, or string).
    GrandNumber.prototype.valueOf = function() {
        return parseInt(this.toString(), 10);
    };
    GrandNumber.prototype.toJSNumber = GrandNumber.prototype.valueOf; // Alias for JS number conversion.

    // ValueOf for CompactValue (returns raw JS number).
    CompactValue.prototype.valueOf = function() {
        return this.value;
    };
    CompactValue.prototype.toJSNumber = CompactValue.prototype.valueOf; // Alias for JS number conversion.

    /**
     * Parses a string value into a numeric entity. Handles scientific notation and checks for valid integer format.
     * @param {string} strVal - The string to parse.
     * @returns {CompactValue|GrandNumber} The parsed number.
     * @throws {Error} If the string is not a valid integer.
     */
    function parseStringValue(strVal) {
        // Attempt to parse as a native JS number first.
        if (checkPrecision(+strVal)) {
            const num = +strVal;
            if (num === roundTowardsZero(num)) return new CompactValue(num); // If it's a precise integer.
            throw new Error("Invalid integer: " + strVal);
        }

        let isNegative = strVal[0] === "-";
        if (isNegative) strVal = strVal.slice(1); // Remove sign for parsing digits.

        const exponentSplit = strVal.split(/e/i); // Handle scientific notation (e.g., "1.23e+4").
        if (exponentSplit.length > 2) throw new Error("Invalid integer: " + exponentSplit.join("e"));

        if (exponentSplit.length === 2) {
            let exponentPart = exponentSplit[1];
            if (exponentPart[0] === "+") exponentPart = exponentPart.slice(1);
            exponentPart = +exponentPart; // Convert exponent to number.

            if (exponentPart !== roundTowardsZero(exponentPart) || !checkPrecision(exponentPart)) {
                throw new Error("Invalid integer: " + exponentPart + " is not a valid exponent.");
            }

            let mainText = exponentSplit[0];
            const decimalPointIdx = mainText.indexOf(".");
            if (decimalPointIdx >= 0) {
                exponentPart -= mainText.length - decimalPointIdx - 1; // Adjust exponent for decimal places.
                mainText = mainText.slice(0, decimalPointIdx) + mainText.slice(decimalPointIdx + 1); // Remove decimal point.
            }
            if (exponentPart < 0) {
                throw new Error("Cannot include negative exponent part for integers");
            }
            mainText += new Array(exponentPart + 1).join("0"); // Append zeros for positive exponent.
            strVal = mainText; // Update string with expanded value.
        }

        const isValidInteger = /^([0-9][0-9]*)$/.test(strVal); // Basic regex validation for integer.
        if (!isValidInteger) throw new Error("Invalid integer: " + strVal);

        const chunkResult = [];
        let currentMax = strVal.length,
            chunkSize = CHUNK_EXPONENT;
        let currentMin = currentMax - chunkSize;

        // Split string into CHUNK_BASE-sized chunks from right to left.
        while (currentMax > 0) {
            chunkResult.push(+strVal.slice(currentMin, currentMax));
            currentMin -= chunkSize;
            if (currentMin < 0) currentMin = 0;
            currentMax -= chunkSize;
        }
        normalizeArray(chunkResult); // Remove any leading zeros.
        return new GrandNumber(chunkResult, isNegative);
    }

    /**
     * Parses a number value into a numeric entity.
     * @param {number} numVal - The number to parse.
     * @returns {CompactValue|GrandNumber} The parsed number.
     * @throws {Error} If the number is not an integer.
     */
    function parseNumberValue(numVal) {
        if (checkPrecision(numVal)) {
            if (numVal !== roundTowardsZero(numVal)) throw new Error(numVal + " is not an integer.");
            return new CompactValue(numVal); // If it's a precise integer, return CompactValue.
        }
        return parseStringValue(numVal.toString()); // If too large, convert to string and parse.
    }

    /**
     * Universal input interpreter, converts various types to NumericEntity.
     * This is the primary entry point for converting inputs into the internal number format.
     * @param {*} input - The input value (number, string, or existing NumericEntity).
     * @returns {NumericEntity} A NumericEntity instance.
     */
    function interpretInput(input) {
        if (typeof input === "number") {
            return parseNumberValue(input);
        }
        if (typeof input === "string") {
            return parseStringValue(input);
        }
        return input; // Assume it's already a NumericEntity instance.
    }

    // Initialize common integer constants (0-999) as CompactValues for efficiency.
    for (let i = 0; i < 1e3; i++) {
        NumericEntity[i] = new CompactValue(i);
        if (i > 0) NumericEntity[-i] = new CompactValue(-i);
    }

    // Define aliases for commonly used constants.
    NumericEntity.one = NumericEntity[1];
    NumericEntity.zero = NumericEntity[0];
    NumericEntity.minusOne = NumericEntity[-1];

    // Expose utility functions on the NumericEntity factory.
    NumericEntity.max = findMax;
    NumericEntity.min = findMin;
    NumericEntity.gcd = calculateGCD;
    NumericEntity.lcm = calculateLCM;
    NumericEntity.isInstance = function(obj) {
        return obj instanceof GrandNumber || obj instanceof CompactValue;
    };
    NumericEntity.randBetween = generateRandomBetween;
    NumericEntity.fromArray = function(digitArray, baseSystem, isNegative) {
        // Map input digits to NumericEntity instances before parsing.
        return parseArrayIntoBase(digitArray.map(interpretInput), interpretInput(baseSystem || 10), isNegative);
    };

    return NumericEntity; // Return the NumericEntity factory function.
}(); // End of self-executing function for massiveVal library.


// Main application logic processing.
const processInput = (inputData) => {
    // Trim whitespace from input and split into an array of lines.
    const inputLines = inputData.trim().split("\n");
    // Parse the first line as a large number using the massiveVal library.
    const inputQuantity = massiveVal(inputLines[0]);

    // Problem-specific logic: Check if the input number is odd.
    // If the remainder of division by 2 is not 0, the number is odd.
    // In this specific problem context, an odd input might lead to 0 as the answer.
    if (parseInt(inputQuantity.divmod(2).remainder) !== 0) {
        console.log(0); // Output 0 for odd numbers.
        return; // Exit the function.
    }

    // Initialize a list to store multiples of 5 (powers of 5).
    let factorMultiples = [];
    // Start with the base factor of 5.
    let iterationFactor = massiveVal(5);

    // Loop to generate powers of 5 until they exceed the input quantity.
    // This is typically used in problems involving prime factorization or trailing zeros.
    while (inputQuantity.greaterOrEquals(iterationFactor)) {
        factorMultiples.push(iterationFactor); // Add current power of 5 to the list.
        iterationFactor = iterationFactor.multiply(5); // Calculate the next power of 5.
    }

    // Initialize the final count accumulator.
    let finalTally = massiveVal(0);

    // Iterate through the generated powers of 5.
    for (let idx in factorMultiples) {
        // For each power of 5 (factorMultiples[idx]), divide the input quantity by (power of 5 * 2).
        // The original problem likely involves a specific mathematical series or calculation related to
        // factors of 10 in some context (e.g., number of trailing zeros in a factorial variant).
        const intermediateResult = inputQuantity.divide(factorMultiples[idx].multiply(2));

        // Add the result of this division to the final tally.
        finalTally = finalTally.add(intermediateResult);
    }

    // Output the final accumulated count as a string.
    console.log(finalTally.toString());
};

// Read input from standard input and execute the main processing function.
// This line typically uses Node.js 'fs' module to read from '/dev/stdin'.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));