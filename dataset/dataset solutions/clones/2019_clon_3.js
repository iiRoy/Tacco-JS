"use strict";

// This module provides functionality for handling arbitrary-precision integers,
// going beyond JavaScript's native number limits.
let largeNum = (function (undefValue) { // Renamed 'bigInt' to 'largeNum', 'undefined' to 'undefValue'
    // --- Core Configuration Settings ---
    const CHUNK_SIZE = 1e7; // Base for internal number representation (10^7, max 7 digits per chunk)
    const CHUNK_POWER = 7; // Logarithm base 10 of CHUNK_SIZE
    const SAFE_JS_MAX = 9007199254740992; // Maximum safe integer in JavaScript (2^53 - 1)
    // Pre-calculated chunk array representation of SAFE_JS_MAX for efficient comparisons
    const SAFE_JS_MAX_DIGITS = convertSmallToChunkArray(SAFE_JS_MAX);
    const LOG_SAFE_JS_MAX = Math.log(SAFE_JS_MAX); // Natural logarithm of SAFE_JS_MAX

    /**
     * Factory function to create an arbitrary-precision integer.
     * It returns either a `LargeNumber` (for values exceeding native JS number limits)
     * or a `TinyNumber` (for values fitting within native JS numbers).
     * @param {number|string|LargeNumber|TinyNumber} inputValue The value to convert into an integer object.
     * @param {number} [inputRadix] Optional radix for string inputs. Defaults to 10 if not provided.
     * @returns {LargeNumber|TinyNumber} An instance representing the integer.
     */
    function createInteger(inputValue, inputRadix) {
        // Handle undefined or null inputs by returning the static zero constant.
        if (typeof inputValue === "undefined" || inputValue === null) {
            return createInteger.ZERO;
        }
        // If a specific radix is provided, delegate to the base parsing function.
        if (typeof inputRadix !== "undefined") {
            return +inputRadix === 10 ? parseValue(inputValue) : parseValueWithBase(inputValue, inputRadix);
        }
        // Otherwise, attempt to parse the value assuming a standard numerical or string format.
        return parseValue(inputValue);
    }

    /**
     * Represents a large integer using an array of `CHUNK_SIZE` based digits.
     * Each element in `chunkValues` is a 'digit' in base `CHUNK_SIZE`.
     * @param {number[]} chunkValues An array of number chunks representing the absolute value.
     * @param {boolean} isNegative Flag indicating if the number is negative.
     */
    function LargeNumber(chunkValues, isNegative) {
        this.chunkValues = chunkValues; // Array of digits (e.g., [1234567, 890])
        this.isNegative = isNegative; // true if negative, false if positive or zero
        this.isTiny = false; // Marker to distinguish from TinyNumber
    }
    // Set up prototype chain for inheritance from the base `createInteger` object.
    LargeNumber.prototype = Object.create(createInteger.prototype);
    LargeNumber.prototype.constructor = LargeNumber; // Restore constructor reference

    /**
     * Represents a small integer that can be stored directly as a native JavaScript number.
     * @param {number} rawNumericValue The native JavaScript number value.
     */
    function TinyNumber(rawNumericValue) {
        this.chunkValue = rawNumericValue; // The actual JS number
        this.isNegative = rawNumericValue < 0; // True if negative
        this.isTiny = true; // Marker to distinguish from LargeNumber
    }
    // Set up prototype chain.
    TinyNumber.prototype = Object.create(createInteger.prototype);
    TinyNumber.prototype.constructor = TinyNumber; // Restore constructor reference

    /**
     * Determines if a given JavaScript number can be precisely represented
     * within the safe integer range (-(2^53-1) to 2^53-1).
     * @param {number} num The number to check.
     * @returns {boolean} `true` if the number is within the safe integer range, `false` otherwise.
     */
    function canFitInNative(num) {
        return num > -SAFE_JS_MAX && num < SAFE_JS_MAX;
    }

    /**
     * Converts a standard JavaScript number into its base `CHUNK_SIZE` array representation.
     * This is primarily used for converting `TinyNumber` values or intermediate results.
     * @param {number} sNum The small number to convert (must be non-negative).
     * @returns {number[]} An array of chunks.
     */
    function convertSmallToChunkArray(sNum) {
        if (sNum < CHUNK_SIZE) return [sNum];
        if (sNum < 1e14) return [sNum % CHUNK_SIZE, Math.floor(sNum / CHUNK_SIZE)];
        // Handles numbers up to 1e21, which is beyond SAFE_JS_MAX, but useful for intermediate steps.
        return [sNum % CHUNK_SIZE, Math.floor(sNum / CHUNK_SIZE) % CHUNK_SIZE, Math.floor(sNum / 1e14)];
    }

    /**
     * Attempts to convert a chunk array back into a native JavaScript number.
     * If the value is too large or complex, the original array is returned.
     * @param {number[]} chunkArr The array of chunks.
     * @returns {number|number[]} The converted small number or the original chunk array.
     */
    function convertChunkArrayToSmall(chunkArr) {
        removeLeadingZeros(chunkArr); // Clean up the array first.
        const len = chunkArr.length;
        // A number fits into SAFE_JS_MAX if it has less than 4 chunks (for CHUNK_SIZE=1e7)
        // and its absolute value is less than SAFE_JS_MAX_DIGITS.
        if (len < 4 && compareAbsoluteValues(chunkArr, SAFE_JS_MAX_DIGITS) < 0) {
            switch (len) {
                case 0: return 0; // Empty array represents zero.
                case 1: return chunkArr[0];
                case 2: return chunkArr[0] + chunkArr[1] * CHUNK_SIZE;
                case 3: return chunkArr[0] + (chunkArr[1] + chunkArr[2] * CHUNK_SIZE) * CHUNK_SIZE;
            }
        }
        return chunkArr; // If too large, return the array as is.
    }

    /**
     * Removes leading zero chunks from an array (e.g., `[0, 0, 1, 2]` becomes `[1, 2]`).
     * Modifies the array in-place. An array representing zero (`[0]`) becomes `[]`.
     * @param {number[]} chunkArr The array of chunks to normalize.
     */
    function removeLeadingZeros(chunkArr) {
        let i = chunkArr.length;
        // Iterate backwards to find the first non-zero chunk.
        while (i > 0 && chunkArr[--i] === 0);
        chunkArr.length = i + 1; // Trim the array to exclude trailing zeros.
    }

    /**
     * Creates a new array of a specified length, initialized with zeros.
     * @param {number} desiredLength The length of the array to create.
     * @returns {number[]} A new array filled with zeros.
     */
    function createZeroFilledArray(desiredLength) {
        const newArr = new Array(desiredLength);
        for (let k = 0; k < desiredLength; ++k) {
            newArr[k] = 0;
        }
        return newArr;
    }

    /**
     * Truncates a floating-point number towards zero (e.g., 3.7 -> 3, -3.7 -> -3).
     * @param {number} val The number to truncate.
     * @returns {number} The integer part of the number.
     */
    function truncateTowardZero(val) {
        return val > 0 ? Math.floor(val) : Math.ceil(val);
    }

    // --- Arithmetic Operations: Addition ---

    /**
     * Adds two non-negative chunk arrays. Assumes `arrA` is at least as long as `arrB`.
     * @param {number[]} arrA The first operand's chunk array (minuend).
     * @param {number[]} arrB The second operand's chunk array (subtrahend).
     * @returns {number[]} A new chunk array representing the sum.
     */
    function addChunkArrays(arrA, arrB) {
        const lenA = arrA.length;
        const lenB = arrB.length;
        const resultChunks = new Array(lenA); // Result can be at most lenA + 1 chunks.
        let carry = 0;
        let sumCurrentDigits;
        let k; // Loop counter

        // Add chunks up to the length of the shorter array (arrB).
        for (k = 0; k < lenB; ++k) {
            sumCurrentDigits = arrA[k] + arrB[k] + carry;
            carry = Math.floor(sumCurrentDigits / CHUNK_SIZE);
            resultChunks[k] = sumCurrentDigits % CHUNK_SIZE;
        }

        // Propagate carry through the remaining chunks of the longer array (arrA).
        while (k < lenA) {
            sumCurrentDigits = arrA[k] + carry;
            carry = Math.floor(sumCurrentDigits / CHUNK_SIZE);
            resultChunks[k++] = sumCurrentDigits % CHUNK_SIZE;
        }

        // If a final carry remains, append it to the result.
        if (carry > 0) {
            resultChunks.push(carry);
        }
        return resultChunks;
    }

    /**
     * Adds two non-negative chunk arrays, handling unequal lengths by ensuring the longer one is first.
     * @param {number[]} arr1 The first chunk array.
     * @param {number[]} arr2 The second chunk array.
     * @returns {number[]} A new chunk array representing the sum.
     */
    function addFlexibleChunkArrays(arr1, arr2) {
        // Pass the longer array as the first argument to `addChunkArrays`.
        if (arr1.length >= arr2.length) {
            return addChunkArrays(arr1, arr2);
        }
        return addChunkArrays(arr2, arr1);
    }

    /**
     * Adds a small non-negative number to a chunk array, propagating carries.
     * @param {number[]} arr The chunk array to add to.
     * @param {number} smallVal The small number to add (must be non-negative).
     * @returns {number[]} A new chunk array representing the sum.
     */
    function addSmallToChunkArray(arr, smallVal) {
        const len = arr.length;
        const result = new Array(len);
        let currentCarry = smallVal;
        let sumCurrentDigits;

        for (let k = 0; k < len; ++k) {
            sumCurrentDigits = arr[k] + currentCarry;
            currentCarry = Math.floor(sumCurrentDigits / CHUNK_SIZE);
            result[k] = sumCurrentDigits % CHUNK_SIZE;
        }

        // Append any remaining carry digits.
        while (currentCarry > 0) {
            result.push(currentCarry % CHUNK_SIZE);
            currentCarry = Math.floor(currentCarry / CHUNK_SIZE);
        }
        return result;
    }

    /**
     * Implements addition for `LargeNumber` instances.
     * @param {number|string|LargeNumber|TinyNumber} operand The value to add.
     * @returns {LargeNumber|TinyNumber} The sum as a new integer object.
     */
    LargeNumber.prototype.add = function (operand) {
        const otherNumber = parseValue(operand); // Ensure operand is an integer object.

        // If signs are different, convert addition to subtraction (e.g., A + (-B) = A - B).
        if (this.isNegative !== otherNumber.isNegative) {
            return this.subtract(otherNumber.negate());
        }

        const thisChunks = this.chunkValues;
        // Convert `TinyNumber` operand to chunk array for consistent operations.
        const otherChunks = otherNumber.isTiny ? convertSmallToChunkArray(Math.abs(otherNumber.chunkValue)) : otherNumber.chunkValues;

        let sumResultChunks;
        if (otherNumber.isTiny && Math.abs(otherNumber.chunkValue) < CHUNK_SIZE) {
            // Optimization: if adding a truly small number (single chunk).
            sumResultChunks = addSmallToChunkArray(thisChunks, Math.abs(otherNumber.chunkValue));
        } else {
            sumResultChunks = addFlexibleChunkArrays(thisChunks, otherChunks);
        }

        // Convert the result back to `TinyNumber` if it fits, otherwise `LargeNumber`.
        const finalResult = convertChunkArrayToSmall(sumResultChunks);
        if (typeof finalResult === "number") {
            return new TinyNumber(this.isNegative ? -finalResult : finalResult);
        }
        return new LargeNumber(finalResult, this.isNegative);
    };
    LargeNumber.prototype.plus = LargeNumber.prototype.add; // Alias for convenience.

    /**
     * Implements addition for `TinyNumber` instances.
     * @param {number|string|LargeNumber|TinyNumber} operand The value to add.
     * @returns {LargeNumber|TinyNumber} The sum as a new integer object.
     */
    TinyNumber.prototype.add = function (operand) {
        const otherNumber = parseValue(operand);
        const thisValue = this.chunkValue;

        // If signs are different, convert to subtraction.
        if (this.isNegative !== otherNumber.isNegative) {
            return this.subtract(otherNumber.negate());
        }

        // Both are `TinyNumber`s, attempt native JS addition.
        if (otherNumber.isTiny) {
            const sum = thisValue + otherNumber.chunkValue;
            if (canFitInNative(sum)) {
                return new TinyNumber(sum);
            }
            // If native addition overflows, convert to `LargeNumber` arithmetic.
            const absThisChunks = convertSmallToChunkArray(Math.abs(thisValue));
            const absOtherChunks = convertSmallToChunkArray(Math.abs(otherNumber.chunkValue));
            const sumResultChunks = addFlexibleChunkArrays(absThisChunks, absOtherChunks);
            return new LargeNumber(sumResultChunks, this.isNegative);
        }

        // `this` is `TinyNumber`, `otherNumber` is `LargeNumber`.
        // Delegate to `LargeNumber`'s add method, by effectively doing `otherNumber.add(this)`.
        return otherNumber.add(thisValue);
    };
    TinyNumber.prototype.plus = TinyNumber.prototype.add; // Alias.

    // --- Arithmetic Operations: Subtraction ---

    /**
     * Subtracts chunk array `arrB` from `arrA` (non-negative). Assumes `|arrA| >= |arrB|`.
     * @param {number[]} arrA The minuend's chunk array.
     * @param {number[]} arrB The subtrahend's chunk array.
     * @returns {number[]} A new chunk array representing the difference.
     */
    function subtractChunkArrays(arrA, arrB) {
        const lenA = arrA.length;
        const lenB = arrB.length;
        const result = new Array(lenA);
        let borrow = 0;
        let differenceCurrentDigits;
        let k;

        // Subtract chunks up to the length of the shorter array (arrB).
        for (k = 0; k < lenB; ++k) {
            differenceCurrentDigits = arrA[k] - borrow - arrB[k];
            if (differenceCurrentDigits < 0) {
                differenceCurrentDigits += CHUNK_SIZE; // Add base to make it positive.
                borrow = 1; // Set borrow for next chunk.
            } else {
                borrow = 0; // No borrow needed.
            }
            result[k] = differenceCurrentDigits;
        }

        // Propagate borrow through the remaining chunks of the longer array (arrA).
        for (; k < lenA; ++k) {
            differenceCurrentDigits = arrA[k] - borrow;
            if (differenceCurrentDigits < 0) {
                differenceCurrentDigits += CHUNK_SIZE;
                // borrow remains 1 for the next chunk.
            } else {
                result[k++] = differenceCurrentDigits; // No more borrow, so copy remaining chunks directly.
                break;
            }
            result[k] = differenceCurrentDigits;
        }
        // Copy any remaining chunks from arrA (if the loop broke early due to no more borrow).
        for (; k < lenA; ++k) {
            result[k] = arrA[k];
        }

        removeLeadingZeros(result); // Clean up result (e.g., 100 - 99 = [1]).
        return result;
    }

    /**
     * Performs subtraction between two numbers represented by chunk arrays,
     * determining the correct order of subtraction and the sign of the result.
     * @param {number[]} valA The first number's absolute chunk array.
     * @param {number[]} valB The second number's absolute chunk array.
     * @param {boolean} originalSignA The sign of the original first number.
     * @returns {LargeNumber|TinyNumber} The difference as an integer object.
     */
    function subtractAbsoluteChunkArrays(valA, valB, originalSignA) {
        let resultChunks;
        let finalSign = originalSignA;

        const comparison = compareAbsoluteValues(valA, valB);
        if (comparison >= 0) {
            // If |valA| >= |valB|, then result sign is the same as original valA.
            resultChunks = subtractChunkArrays(valA, valB);
        } else {
            // If |valA| < |valB|, then result sign is opposite of original valA.
            resultChunks = subtractChunkArrays(valB, valA); // Subtract smaller from larger.
            finalSign = !originalSignA;
        }

        // Convert result back to `TinyNumber` if possible.
        const smallResult = convertChunkArrayToSmall(resultChunks);
        if (typeof smallResult === "number") {
            return new TinyNumber(finalSign ? -smallResult : smallResult);
        }
        return new LargeNumber(smallResult, finalSign);
    }

    /**
     * Subtracts a small non-negative number from a chunk array, propagating borrows.
     * @param {number[]} chunkArr The minuend chunk array.
     * @param {number} smallSubtrahend The small number to subtract (absolute value).
     * @param {boolean} originalSign The sign of the original `LargeNumber`.
     * @returns {LargeNumber|TinyNumber} The difference as an integer object.
     */
    function subtractSmallFromChunkArray(chunkArr, smallSubtrahend, originalSign) {
        const len = chunkArr.length;
        const result = new Array(len);
        let currentBorrow = smallSubtrahend;
        let differenceCurrentDigits;

        for (let k = 0; k < len; ++k) {
            differenceCurrentDigits = chunkArr[k] - currentBorrow;
            currentBorrow = Math.floor(differenceCurrentDigits / CHUNK_SIZE); // This will be negative or zero.
            differenceCurrentDigits %= CHUNK_SIZE;
            result[k] = differenceCurrentDigits < 0 ? differenceCurrentDigits + CHUNK_SIZE : differenceCurrentDigits;
            currentBorrow = currentBorrow < 0 ? 1 : 0; // Convert negative "carry" to positive borrow flag.
        }

        // Convert result back to `TinyNumber` if possible.
        const smallResult = convertChunkArrayToSmall(result);
        if (typeof smallResult === "number") {
            return new TinyNumber(originalSign ? -smallResult : smallResult);
        }
        return new LargeNumber(smallResult, originalSign);
    }

    /**
     * Implements subtraction for `LargeNumber` instances.
     * @param {number|string|LargeNumber|TinyNumber} operand The value to subtract.
     * @returns {LargeNumber|TinyNumber} The difference as a new integer object.
     */
    LargeNumber.prototype.subtract = function (operand) {
        const otherNumber = parseValue(operand);

        // If signs are different, convert subtraction to addition (e.g., A - (-B) = A + B).
        if (this.isNegative !== otherNumber.isNegative) {
            return this.add(otherNumber.negate());
        }

        const thisChunks = this.chunkValues;
        const otherChunks = otherNumber.isTiny ? convertSmallToChunkArray(Math.abs(otherNumber.chunkValue)) : otherNumber.chunkValues;

        if (otherNumber.isTiny && Math.abs(otherNumber.chunkValue) < CHUNK_SIZE) {
            // Optimization for subtracting a single small chunk.
            return subtractSmallFromChunkArray(thisChunks, Math.abs(otherNumber.chunkValue), this.isNegative);
        } else {
            // General subtraction for two large numbers or a large number minus a larger small number.
            return subtractAbsoluteChunkArrays(thisChunks, otherChunks, this.isNegative);
        }
    };
    LargeNumber.prototype.minus = LargeNumber.prototype.subtract; // Alias.

    /**
     * Implements subtraction for `TinyNumber` instances.
     * @param {number|string|LargeNumber|TinyNumber} operand The value to subtract.
     * @returns {LargeNumber|TinyNumber} The difference as a new integer object.
     */
    TinyNumber.prototype.subtract = function (operand) {
        const otherNumber = parseValue(operand);
        const thisValue = this.chunkValue;

        // If signs are different, convert to addition.
        if (this.isNegative !== otherNumber.isNegative) {
            return this.add(otherNumber.negate());
        }

        // Both are `TinyNumber`s, attempt native JS subtraction.
        if (otherNumber.isTiny) {
            const difference = thisValue - otherNumber.chunkValue;
            if (canFitInNative(difference)) {
                return new TinyNumber(difference);
            }
            // If native subtraction overflows, convert to `LargeNumber` arithmetic.
            const absThisChunks = convertSmallToChunkArray(Math.abs(thisValue));
            const absOtherChunks = convertSmallToChunkArray(Math.abs(otherNumber.chunkValue));
            // Determine the final sign based on which absolute value is larger.
            // If `thisValue` is smaller than `otherNumber.chunkValue` and both are positive, result is negative.
            // If `thisValue` is less negative than `otherNumber.chunkValue` and both are negative, result is positive.
            return subtractAbsoluteChunkArrays(absThisChunks, absOtherChunks, thisValue < otherNumber.chunkValue);
        }

        // `this` is `TinyNumber`, `otherNumber` is `LargeNumber`.
        // This is equivalent to `(small - large)`. Since `otherNumber` is large, its absolute value
        // is likely greater than `this`'s. So the result will be `-(|large| - |small|)`.
        const absThisChunks = convertSmallToChunkArray(Math.abs(thisValue));
        const otherChunks = otherNumber.chunkValues;
        // The sign logic `this.isNegative` vs `otherNumber.isNegative` is handled by the first `if`.
        // Here, they have the same sign.
        // If `this` is positive and `other` is positive, `small - large` will be negative.
        // If `this` is negative and `other` is negative, `-small - (-large) = large - small`.
        // The `subtractAbsoluteChunkArrays` function will handle the comparison of magnitudes
        // and flip the sign if `absThisChunks < otherChunks`.
        return subtractAbsoluteChunkArrays(absThisChunks, otherChunks, this.isNegative);
    };
    TinyNumber.prototype.minus = TinyNumber.prototype.subtract; // Alias.

    /**
     * Negates the current `LargeNumber` instance (flips its sign).
     * @returns {LargeNumber} A new `LargeNumber` with the opposite sign.
     */
    LargeNumber.prototype.negate = function () {
        if (this.isZero()) return createInteger.ZERO; // Negating zero has no effect.
        return new LargeNumber(this.chunkValues, !this.isNegative);
    };

    /**
     * Negates the current `TinyNumber` instance.
     * @returns {TinyNumber} A new `TinyNumber` with the opposite sign.
     */
    TinyNumber.prototype.negate = function () {
        if (this.isZero()) return createInteger.ZERO;
        return new TinyNumber(-this.chunkValue);
    };

    /**
     * Returns the absolute value of the current `LargeNumber`.
     * @returns {LargeNumber} A new `LargeNumber` representing the absolute value.
     */
    LargeNumber.prototype.getAbsolute = function () {
        return new LargeNumber(this.chunkValues, false);
    };

    /**
     * Returns the absolute value of the current `TinyNumber`.
     * @returns {TinyNumber} A new `TinyNumber` representing the absolute value.
     */
    TinyNumber.prototype.getAbsolute = function () {
        return new TinyNumber(Math.abs(this.chunkValue));
    };

    // --- Arithmetic Operations: Multiplication ---

    /**
     * Performs long multiplication of two non-negative chunk arrays.
     * @param {number[]} arrX The first chunk array.
     * @param {number[]} arrY The second chunk array.
     * @returns {number[]} A new chunk array representing the product.
     */
    function multiplyLongChunks(arrX, arrY) {
        const lenX = arrX.length;
        const lenY = arrY.length;
        const result = createZeroFilledArray(lenX + lenY); // Max length of product is sum of lengths.
        let currentProduct, carry;

        for (let i = 0; i < lenX; ++i) {
            const x_chunk = arrX[i];
            if (x_chunk === 0) continue; // Optimization: skip if chunk is zero.
            carry = 0; // Reset carry for each chunk of arrX.
            for (let j = 0; j < lenY; ++j) {
                const y_chunk = arrY[j];
                currentProduct = x_chunk * y_chunk + result[i + j] + carry;
                carry = Math.floor(currentProduct / CHUNK_SIZE);
                result[i + j] = currentProduct % CHUNK_SIZE;
            }
            result[i + lenY] += carry; // Add final carry to the next position.
        }
        removeLeadingZeros(result);
        return result;
    }

    /**
     * Multiplies a non-negative chunk array by a small non-negative number.
     * @param {number[]} chunkArr The chunk array to multiply.
     * @param {number} smallMultiplier The small number multiplier.
     * @returns {number[]} A new chunk array representing the product.
     */
    function multiplyChunkArrayBySmall(chunkArr, smallMultiplier) {
        const len = chunkArr.length;
        const result = new Array(len);
        let carry = 0;
        let currentProduct;

        for (let i = 0; i < len; ++i) {
            currentProduct = chunkArr[i] * smallMultiplier + carry;
            carry = Math.floor(currentProduct / CHUNK_SIZE);
            result[i] = currentProduct % CHUNK_SIZE;
        }

        // Propagate any remaining carry.
        while (carry > 0) {
            result.push(carry % CHUNK_SIZE);
            carry = Math.floor(currentCarry / CHUNK_SIZE);
        }
        return result;
    }

    /**
     * Shifts a chunk array to the left by `numShifts` positions.
     * This is equivalent to multiplying by `CHUNK_SIZE` raised to the power of `numShifts`.
     * @param {number[]} arr The chunk array to shift.
     * @param {number} numShifts The number of positions to shift.
     * @returns {number[]} The shifted array.
     */
    function shiftChunkArrayLeft(arr, numShifts) {
        if (numShifts <= 0) return [...arr]; // Return a copy if no shift or negative shift (shouldn't happen here).
        const prefixZeros = createZeroFilledArray(numShifts);
        return prefixZeros.concat(arr);
    }

    /**
     * Heuristic to decide whether to use Karatsuba multiplication for performance.
     * Karatsuba is generally faster for very large numbers, but has overhead for smaller ones.
     * @param {number} len1 Length of the first operand's chunk array.
     * @param {number} len2 Length of the second operand's chunk array.
     * @returns {boolean} `true` if Karatsuba should be used, `false` otherwise.
     */
    function shouldApplyKaratsuba(len1, len2) {
        // The original heuristic: -.012*l1-.012*l2+15e-6*l1*l2>0
        // A simpler, often effective heuristic is to use a minimum length threshold.
        const KARATSUBA_THRESHOLD = 30; // Empirical cutoff.
        return len1 >= KARATSUBA_THRESHOLD && len2 >= KARATSUBA_THRESHOLD;
    }

    /**
     * Implements the Karatsuba multiplication algorithm for two non-negative chunk arrays.
     * This is a recursive divide-and-conquer algorithm for large numbers.
     * @param {number[]} xChunks The first chunk array.
     * @param {number[]} yChunks The second chunk array.
     * @returns {number[]} The product as a new chunk array.
     */
    function multiplyKaratsuba(xChunks, yChunks) {
        const n = Math.max(xChunks.length, yChunks.length);

        // Base case: if numbers are small enough, use standard long multiplication.
        const KARATSUBA_BASE_CASE_SIZE = 30;
        if (n <= KARATSUBA_BASE_CASE_SIZE) {
            return multiplyLongChunks(xChunks, yChunks);
        }

        // Split numbers into two halves at the midpoint `k`.
        const k = Math.ceil(n / 2);
        const x_low = xChunks.slice(0, k);
        const x_high = xChunks.slice(k);
        const y_low = yChunks.slice(0, k);
        const y_high = yChunks.slice(k);

        // Recursive steps:
        // z2 = x_high * y_high
        const z2 = multiplyKaratsuba(x_high, y_high);
        // z0 = x_low * y_low
        const z0 = multiplyKaratsuba(x_low, y_low);
        // z1 = (x_low + x_high) * (y_low + y_high) - z0 - z2
        const sum_x_halves = addFlexibleChunkArrays(x_low, x_high);
        const sum_y_halves = addFlexibleChunkArrays(y_low, y_high);
        const z1_intermediate = multiplyKaratsuba(sum_x_halves, sum_y_halves);
        // z1_intermediate = (x_l+x_h)(y_l+y_h) = x_l y_l + x_l y_h + x_h y_l + x_h y_h = z0 + x_l y_h + x_h y_l + z2
        // So, x_l y_h + x_h y_l = z1_intermediate - z0 - z2. This is z1.
        const z1_temp = subtractChunkArrays(z1_intermediate, z0);
        const z1 = subtractChunkArrays(z1_temp, z2);

        // Combine results: product = z2 * CHUNK_SIZE^(2k) + z1 * CHUNK_SIZE^k + z0
        const shifted_z2 = shiftChunkArrayLeft(z2, 2 * k);
        const shifted_z1 = shiftChunkArrayLeft(z1, k);

        const tempSum = addFlexibleChunkArrays(shifted_z1, z0);
        const finalProduct = addFlexibleChunkArrays(shifted_z2, tempSum);

        removeLeadingZeros(finalProduct);
        return finalProduct;
    }

    /**
     * Implements multiplication for `LargeNumber` instances.
     * @param {number|string|LargeNumber|TinyNumber} multiplier The value to multiply by.
     * @returns {LargeNumber|TinyNumber} The product as a new integer object.
     */
    LargeNumber.prototype.multiply = function (multiplier) {
        const otherNumber = parseValue(multiplier);
        const thisChunks = this.chunkValues;
        // Determine the sign of the result: negative if signs are different (XOR).
        const resultIsNegative = this.isNegative !== otherNumber.isNegative;

        // Handle multiplication by small numbers first.
        if (otherNumber.isTiny) {
            const smallValue = otherNumber.chunkValue;
            if (smallValue === 0) return createInteger.ZERO;
            if (smallValue === 1) return this;
            if (smallValue === -1) return this.negate();

            const absSmallValue = Math.abs(smallValue);
            let productChunks;
            if (absSmallValue < CHUNK_SIZE) {
                // If small multiplier fits within a single chunk, use optimized `multiplyChunkArrayBySmall`.
                productChunks = multiplyChunkArrayBySmall(thisChunks, absSmallValue);
            } else {
                // If small multiplier is larger than a single chunk, convert it to an array and use `multiplyLongChunks`.
                productChunks = multiplyLongChunks(thisChunks, convertSmallToChunkArray(absSmallValue));
            }
            // Convert result back to `TinyNumber` if it fits.
            const finalProduct = convertChunkArrayToSmall(productChunks);
            if (typeof finalProduct === "number") {
                return new TinyNumber(resultIsNegative ? -finalProduct : finalProduct);
            }
            return new LargeNumber(finalProduct, resultIsNegative);
        }

        // Handle multiplication by another `LargeNumber`.
        const otherChunks = otherNumber.chunkValues;
        let productChunks;
        if (shouldApplyKaratsuba(thisChunks.length, otherChunks.length)) {
            productChunks = multiplyKaratsuba(thisChunks, otherChunks);
        } else {
            productChunks = multiplyLongChunks(thisChunks, otherChunks);
        }
        return new LargeNumber(productChunks, resultIsNegative);
    };
    LargeNumber.prototype.times = LargeNumber.prototype.multiply; // Alias.

    /**
     * Helper function for multiplying a small number (as a raw JS number) with a chunk array.
     * @param {number} rawSmallValue The absolute value of the small integer.
     * @param {number[]} chunkArr The chunk array.
     * @param {boolean} resultSign The predetermined sign of the result.
     * @returns {LargeNumber|TinyNumber} The product as an integer object.
     */
    function multiplySmallAndChunkArray(rawSmallValue, chunkArr, resultSign) {
        let productChunks;
        if (rawSmallValue < CHUNK_SIZE) {
            productChunks = multiplyChunkArrayBySmall(chunkArr, rawSmallValue);
        } else {
            productChunks = multiplyLongChunks(chunkArr, convertSmallToChunkArray(rawSmallValue));
        }
        const smallResult = convertChunkArrayToSmall(productChunks);
        if (typeof smallResult === "number") {
            return new TinyNumber(resultSign ? -smallResult : smallResult);
        }
        return new LargeNumber(smallResult, resultSign);
    }

    /**
     * Internal method for `LargeNumber` to be multiplied by a `TinyNumber`.
     * @param {TinyNumber} otherTinyNum The `TinyNumber` to multiply by.
     * @returns {LargeNumber|TinyNumber} The product.
     */
    LargeNumber.prototype._multiplyByTiny = function (otherTinyNum) {
        const smallValue = otherTinyNum.chunkValue;
        if (smallValue === 0) return createInteger.ZERO;
        if (smallValue === 1) return this;
        if (smallValue === -1) return this.negate();
        return multiplySmallAndChunkArray(Math.abs(smallValue), this.chunkValues, this.isNegative !== otherTinyNum.isNegative);
    };

    /**
     * Internal method for `TinyNumber` to be multiplied by another `TinyNumber`.
     * @param {TinyNumber} otherTinyNum The `TinyNumber` to multiply by.
     * @returns {LargeNumber|TinyNumber} The product.
     */
    TinyNumber.prototype._multiplyByTiny = function (otherTinyNum) {
        const product = this.chunkValue * otherTinyNum.chunkValue;
        if (canFitInNative(product)) {
            return new TinyNumber(product);
        }
        // If native product overflows, use chunk array arithmetic.
        return multiplySmallAndChunkArray(
            Math.abs(otherTinyNum.chunkValue),
            convertSmallToChunkArray(Math.abs(this.chunkValue)),
            this.isNegative !== otherTinyNum.isNegative
        );
    };

    /**
     * Implements multiplication for `TinyNumber` instances.
     * @param {number|string|LargeNumber|TinyNumber} multiplier The value to multiply by.
     * @returns {LargeNumber|TinyNumber} The product.
     */
    TinyNumber.prototype.multiply = function (multiplier) {
        const otherNumber = parseValue(multiplier);
        // Delegate to the appropriate internal method based on the type of `otherNumber`.
        if (otherNumber.isTiny) {
            return this._multiplyByTiny(otherNumber);
        } else {
            // If `otherNumber` is a `LargeNumber`, let it handle the multiplication.
            return otherNumber._multiplyByTiny(this);
        }
    };
    TinyNumber.prototype.times = TinyNumber.prototype.multiply; // Alias.

    /**
     * Squares a non-negative chunk array using an optimized algorithm.
     * @param {number[]} chunkArr The chunk array to square.
     * @returns {number[]} The square as a new chunk array.
     */
    function squareChunkArray(chunkArr) {
        const len = chunkArr.length;
        const result = createZeroFilledArray(2 * len); // Maximum length of square is 2 * original length.
        let currentProduct, carry;

        for (let i = 0; i < len; ++i) {
            const a_i = chunkArr[i];
            carry = 0;

            // Calculate diagonal terms (a_i * a_i) and add to result.
            currentProduct = a_i * a_i + result[i + i] + carry;
            carry = Math.floor(currentProduct / CHUNK_SIZE);
            result[i + i] = currentProduct % CHUNK_SIZE;

            // Calculate off-diagonal terms (2 * a_i * a_j) for j > i.
            // These are added twice (a_i*a_j and a_j*a_i), so multiply by 2.
            for (let j = i + 1; j < len; ++j) {
                const a_j = chunkArr[j];
                currentProduct = 2 * (a_i * a_j) + result[i + j] + carry;
                carry = Math.floor(currentProduct / CHUNK_SIZE);
                result[i + j] = currentProduct % CHUNK_SIZE;
            }
            result[i + len] += carry; // Add the final carry for this row.
        }
        removeLeadingZeros(result);
        return result;
    }

    /**
     * Squares the current `LargeNumber` instance.
     * @returns {LargeNumber} The square as a new `LargeNumber`.
     */
    LargeNumber.prototype.square = function () {
        return new LargeNumber(squareChunkArray(this.chunkValues), false); // Square is always non-negative.
    };

    /**
     * Squares the current `TinyNumber` instance.
     * @returns {LargeNumber|TinyNumber} The square as a new integer object.
     */
    TinyNumber.prototype.square = function () {
        const valueSquared = this.chunkValue * this.chunkValue;
        if (canFitInNative(valueSquared)) {
            return new TinyNumber(valueSquared);
        }
        // If native square overflows, convert to `LargeNumber` arithmetic.
        return new LargeNumber(squareChunkArray(convertSmallToChunkArray(Math.abs(this.chunkValue))), false);
    };

    // --- Division and Modulo Operations ---

    /**
     * Performs division and modulo for `LargeNumber`s using a variant of Knuth's Algorithm D.
     * This algorithm is generally efficient for multi-precision division.
     * @param {number[]} dividendChunks The dividend's chunk array (non-negative).
     * @param {number[]} divisorChunks The divisor's chunk array (non-negative).
     * @returns {[number[], number[]]} An array containing [quotientChunks, remainderChunks].
     */
    function divideAndModKnuthVariant(dividendChunks, divisorChunks) {
        const dividendLen = dividendChunks.length;
        const divisorLen = divisorChunks.length;

        // Step D1: Normalize. Scale dividend and divisor so that the most significant digit
        // of the divisor is at least CHUNK_SIZE / 2. This improves accuracy of quotient guesses.
        const normalizationFactor = Math.ceil(CHUNK_SIZE / (2 * divisorChunks[divisorLen - 1]));
        const normalizedDividend = multiplyChunkArrayBySmall(dividendChunks, normalizationFactor);
        const normalizedDivisor = multiplyChunkArrayBySmall(divisorChunks, normalizationFactor);

        const quotientChunks = createZeroFilledArray(dividendLen - divisorLen + 1); // Max length of quotient.
        let currentRemainderChunks = normalizedDividend; // Remainder starts as normalized dividend.

        // Add an extra zero to the remainder to simplify boundary conditions in loops.
        if (currentRemainderChunks.length <= dividendLen) currentRemainderChunks.push(0);
        normalizedDivisor.push(0); // Also add an extra zero to the normalized divisor.

        const mostSignificantDivisorDigit = normalizedDivisor[divisorLen - 1];

        // Step D2 to D7: Iterate to find quotient digits.
        for (let k = dividendLen - divisorLen; k >= 0; --k) {
            let trialQuotientDigit = CHUNK_SIZE - 1; // Initialize with max possible digit.

            // Step D3: Estimate quotient digit.
            if (currentRemainderChunks[k + divisorLen] !== mostSignificantDivisorDigit) {
                trialQuotientDigit = Math.floor((currentRemainderChunks[k + divisorLen] * CHUNK_SIZE + currentRemainderChunks[k + divisorLen - 1]) / mostSignificantDivisorDigit);
            }

            // Step D4: Multiply and Subtract. Perform trial multiplication and subtraction.
            let carryFromMultiplication = 0;
            let borrowFromSubtraction = 0;
            const tempDivisorLength = normalizedDivisor.length;
            for (let i = 0; i < tempDivisorLength; ++i) {
                carryFromMultiplication += trialQuotientDigit * normalizedDivisor[i];
                const quotientOfCarry = Math.floor(carryFromMultiplication / CHUNK_SIZE);
                borrowFromSubtraction += currentRemainderChunks[k + i] - (carryFromMultiplication % CHUNK_SIZE);
                carryFromMultiplication = quotientOfCarry;

                if (borrowFromSubtraction < 0) {
                    currentRemainderChunks[k + i] = borrowFromSubtraction + CHUNK_SIZE;
                    borrowFromSubtraction = -1; // Propagate borrow.
                } else {
                    currentRemainderChunks[k + i] = borrowFromSubtraction;
                    borrowFromSubtraction = 0;
                }
            }

            // Step D5: Add back if remainder is negative. Adjust trial quotient digit.
            while (borrowFromSubtraction !== 0) {
                trialQuotientDigit--;
                carryFromMultiplication = 0; // This is an "add back" operation, not new multiplication.
                for (let i = 0; i < tempDivisorLength; ++i) {
                    carryFromMultiplication += currentRemainderChunks[k + i] - CHUNK_SIZE + normalizedDivisor[i];
                    if (carryFromMultiplication < 0) {
                        currentRemainderChunks[k + i] = carryFromMultiplication + CHUNK_SIZE;
                        carryFromMultiplication = 0;
                    } else {
                        currentRemainderChunks[k + i] = carryFromMultiplication;
                        carryFromMultiplication = 1;
                    }
                }
                borrowFromSubtraction += carryFromMultiplication;
            }
            quotientChunks[k] = trialQuotientDigit;
        }

        // Step D8: Denormalize remainder. Divide the remainder by the normalization factor.
        const denormalizedRemainder = divideAndModSmall(currentRemainderChunks, normalizationFactor)[0];
        return [convertChunkArrayToSmall(quotientChunks), convertChunkArrayToSmall(denormalizedRemainder)];
    }

    /**
     * Performs division and modulo for `LargeNumber`s using a simpler iterative subtraction method.
     * This is generally less efficient than Knuth's algorithm for very large numbers but conceptually simpler.
     * @param {number[]} dividendChunks The dividend's chunk array (non-negative).
     * @param {number[]} divisorChunks The divisor's chunk array (non-negative).
     * @returns {[number[], number[]]} An array containing [quotientChunks, remainderChunks].
     */
    function divideAndModIterative(dividendChunks, divisorChunks) {
        let currentDividendLen = dividendChunks.length;
        const divisorLen = divisorChunks.length;
        const quotientDigits = [];
        let partialDividend = []; // Accumulates dividend chunks until it's large enough for division.

        // Process dividend chunks from most significant to least significant.
        while (currentDividendLen > 0) {
            // Take the next most significant chunk of the dividend.
            partialDividend.unshift(dividendChunks[--currentDividendLen]);
            removeLeadingZeros(partialDividend);

            // If the current partial dividend is smaller than the divisor, the quotient digit is 0.
            if (compareAbsoluteValues(partialDividend, divisorChunks) < 0) {
                quotientDigits.push(0);
                continue;
            }

            // Estimate the quotient digit.
            let estimatedQuotientDigit;
            const partialLen = partialDividend.length;
            const highDividendPart = partialDividend[partialLen - 1] * CHUNK_SIZE + (partialLen > 1 ? partialDividend[partialLen - 2] : 0);
            const highDivisorPart = divisorChunks[divisorLen - 1] * CHUNK_SIZE + (divisorLen > 1 ? divisorChunks[divisorLen - 2] : 0);

            // If partial dividend has more chunks than divisor, adjust the high part for estimation.
            if (partialLen > divisorLen) {
                // Effectively (highDividendPart * CHUNK_SIZE) / highDivisorPart
                estimatedQuotientDigit = Math.floor(highDividendPart / highDivisorPart);
            } else {
                estimatedQuotientDigit = Math.floor(highDividendPart / highDivisorPart);
            }

            // Refine the estimate by trial subtraction.
            let trialProduct;
            // Loop until `estimatedQuotientDigit` is valid (trialProduct <= partialDividend).
            do {
                if (estimatedQuotientDigit === 0) break; // If estimate drops to 0, stop.
                trialProduct = multiplyChunkArrayBySmall(divisorChunks, estimatedQuotientDigit);
                if (compareAbsoluteValues(trialProduct, partialDividend) <= 0) break;
                estimatedQuotientDigit--;
            } while (true);

            quotientDigits.push(estimatedQuotientDigit);
            partialDividend = subtractChunkArrays(partialDividend, trialProduct); // Update partial dividend (remainder).
        }
        quotientDigits.reverse(); // Digits were collected in reverse order (least significant first).
        return [convertChunkArrayToSmall(quotientDigits), convertChunkArrayToSmall(partialDividend)];
    }

    /**
     * Divides a chunk array by a small non-negative number, returning quotient and remainder.
     * @param {number[]} valueChunks The chunk array to divide.
     * @param {number} smallDivisor The small number divisor (must be non-negative).
     * @returns {[number[], number]} An array containing [quotientChunks, remainder].
     */
    function divideAndModSmall(valueChunks, smallDivisor) {
        const len = valueChunks.length;
        const quotient = createZeroFilledArray(len);
        let remainder = 0;
        let currentDividendPart;

        // Process chunks from most significant to least significant.
        for (let i = len - 1; i >= 0; --i) {
            currentDividendPart = remainder * CHUNK_SIZE + valueChunks[i];
            quotient[i] = truncateTowardZero(currentDividendPart / smallDivisor);
            remainder = currentDividendPart % smallDivisor;
        }
        return [quotient, remainder];
    }

    /**
     * Central function for performing division and modulo operations.
     * Handles sign logic and delegates to appropriate division algorithms.
     * @param {LargeNumber|TinyNumber} numSelf The dividend.
     * @param {number|string|LargeNumber|TinyNumber} numOther The divisor.
     * @returns {{quotient: LargeNumber|TinyNumber, remainder: LargeNumber|TinyNumber}} An object with quotient and remainder.
     * @throws {Error} If division by zero is attempted.
     */
    function performDivisionAndMod(numSelf, numOther) {
        const divisor = parseValue(numOther);

        // Guard against division by zero.
        if (divisor.isZero()) {
            throw new Error("Cannot divide by zero.");
        }

        let quotientRawResult;
        let remainderRawResult;

        // Handle cases where the dividend (`numSelf`) is a `TinyNumber`.
        if (numSelf.isTiny) {
            const selfValue = numSelf.chunkValue;
            if (divisor.isTiny) {
                // Both are `TinyNumber`s, use native JS division.
                const divisorValue = divisor.chunkValue;
                return {
                    quotient: new TinyNumber(truncateTowardZero(selfValue / divisorValue)),
                    remainder: new TinyNumber(selfValue % divisorValue)
                };
            }
            // `numSelf` is tiny, `divisor` is large.
            // The quotient is 0, and the remainder is the dividend itself.
            return { quotient: createInteger.ZERO, remainder: numSelf };
        }

        // From here, `numSelf` is a `LargeNumber`.
        const selfAbsoluteChunks = numSelf.chunkValues;

        // Handle cases where the divisor is a `TinyNumber`.
        if (divisor.isTiny) {
            const divisorValue = divisor.chunkValue;
            if (divisorValue === 1) return { quotient: numSelf, remainder: createInteger.ZERO };
            if (divisorValue === -1) return { quotient: numSelf.negate(), remainder: createInteger.ZERO };

            const absDivisorValue = Math.abs(divisorValue);
            if (absDivisorValue < CHUNK_SIZE) {
                // Divisor is a single small chunk, use optimized `divideAndModSmall`.
                const divModPair = divideAndModSmall(selfAbsoluteChunks, absDivisorValue);
                quotientRawResult = convertChunkArrayToSmall(divModPair[0]);
                remainderRawResult = divModPair[1];

                // Adjust remainder sign to match dividend's sign.
                if (numSelf.isNegative) remainderRawResult = -remainderRawResult;

                let finalQuotient;
                if (typeof quotientRawResult === "number") {
                    // Adjust quotient sign based on signs of dividend and divisor.
                    finalQuotient = new TinyNumber(numSelf.isNegative !== divisor.isNegative ? -quotientRawResult : quotientRawResult);
                } else {
                    finalQuotient = new LargeNumber(quotientRawResult, numSelf.isNegative !== divisor.isNegative);
                }
                return { quotient: finalQuotient, remainder: new TinyNumber(remainderRawResult) };
            }
            // If divisor is a large `TinyNumber` (e.g., 2^53), convert it to chunk array for general division.
            const absDivisorChunks = convertSmallToChunkArray(absDivisorValue);
            // Fall through to the general large number division below.
            quotientRawResult = absDivisorChunks; // Reuse variable, but not directly used as value.
        }

        // Both `numSelf` and `divisor` are effectively `LargeNumber`s (or a large `TinyNumber`).
        const absDivisorChunks = divisor.isTiny ? convertSmallToChunkArray(Math.abs(divisor.chunkValue)) : divisor.chunkValues;

        // Compare absolute values to handle cases where dividend is smaller than divisor.
        const comparison = compareAbsoluteValues(selfAbsoluteChunks, absDivisorChunks);
        if (comparison === -1) {
            return { quotient: createInteger.ZERO, remainder: numSelf }; // Dividend < Divisor.
        }
        if (comparison === 0) {
            // Dividend == Divisor. Quotient is 1 or -1, remainder is 0.
            return {
                quotient: new TinyNumber(numSelf.isNegative !== divisor.isNegative ? -1 : 1),
                remainder: createInteger.ZERO
            };
        }

        // Choose the division algorithm based on the total number of chunks.
        const DIVISION_ALGORITHM_CUTOFF = 100; // Heuristic: Knuth's is better for very large N.
        const divModPair = (selfAbsoluteChunks.length + absDivisorChunks.length <= DIVISION_ALGORITHM_CUTOFF) ?
            divideAndModKnuthVariant(selfAbsoluteChunks, absDivisorChunks) :
            divideAndModIterative(selfAbsoluteChunks, absDivisorChunks);

        quotientRawResult = divModPair[0];
        remainderRawResult = divModPair[1];

        // Determine the final signs for quotient and remainder.
        const quotientIsNegative = numSelf.isNegative !== divisor.isNegative;
        const remainderIsNegative = numSelf.isNegative; // Remainder takes the sign of the dividend.

        let finalQuotient;
        if (typeof quotientRawResult === "number") {
            finalQuotient = new TinyNumber(quotientIsNegative ? -quotientRawResult : quotientRawResult);
        } else {
            finalQuotient = new LargeNumber(quotientRawResult, quotientIsNegative);
        }

        let finalRemainder;
        if (typeof remainderRawResult === "number") {
            finalRemainder = new TinyNumber(remainderIsNegative ? -remainderRawResult : remainderRawResult);
        } else {
            finalRemainder = new LargeNumber(remainderRawResult, remainderIsNegative);
        }

        return { quotient: finalQuotient, remainder: finalRemainder };
    }

    /**
     * Returns an object containing both the quotient and remainder of the division.
     * @param {number|string|LargeNumber|TinyNumber} divisor The number to divide by.
     * @returns {{quotient: LargeNumber|TinyNumber, remainder: LargeNumber|TinyNumber}}
     */
    LargeNumber.prototype.divmod = function (divisor) {
        return performDivisionAndMod(this, divisor);
    };
    TinyNumber.prototype.divmod = LargeNumber.prototype.divmod; // Share implementation.

    /**
     * Divides the current number by another and returns only the quotient.
     * @param {number|string|LargeNumber|TinyNumber} divisor The number to divide by.
     * @returns {LargeNumber|TinyNumber} The quotient.
     */
    LargeNumber.prototype.divide = function (divisor) {
        return performDivisionAndMod(this, divisor).quotient;
    };
    TinyNumber.prototype.over = TinyNumber.prototype.divide = LargeNumber.prototype.over = LargeNumber.prototype.divide; // Aliases.

    /**
     * Returns the remainder of the division of the current number by another.
     * @param {number|string|LargeNumber|TinyNumber} divisor The number to divide by.
     * @returns {LargeNumber|TinyNumber} The remainder.
     */
    LargeNumber.prototype.modulo = function (divisor) {
        return performDivisionAndMod(this, divisor).remainder;
    };
    TinyNumber.prototype.remainder = TinyNumber.prototype.modulo = LargeNumber.prototype.remainder = LargeNumber.prototype.modulo; // Aliases.

    /**
     * Calculates the power of the current number raised to an exponent (this^exponent).
     * @param {number|string|LargeNumber|TinyNumber} exponent The exponent.
     * @returns {LargeNumber|TinyNumber} The result of the exponentiation.
     * @throws {Error} If the exponent is negative or too large for current implementation.
     */
    LargeNumber.prototype.power = function (exponent) {
        const expNum = parseValue(exponent);

        // Handle special base cases.
        if (this.isZero()) { // 0^x
            // 0^0 is 1, 0^positive is 0, 0^negative is undefined (return 0 or error).
            return expNum.isZero() ? createInteger.ONE : createInteger.ZERO;
        }
        if (this.isUnit()) { // 1^x or (-1)^x
            if (this.equals(createInteger.ONE)) return createInteger.ONE; // 1^x = 1
            // (-1)^x = 1 if x is even, -1 if x is odd.
            return expNum.isEven() ? createInteger.ONE : createInteger.MINUS_ONE;
        }

        // Exponent must be non-negative for integer power.
        if (expNum.isNegative()) {
            // For negative exponents, the result is typically 1 / (base^|exp|),
            // which is not an integer unless base is 1 or -1 (already handled).
            // So, for other bases, it's 0 for integer power context.
            return createInteger.ZERO;
        }

        // Exponent must fit in a native JavaScript number for efficient iteration.
        if (!expNum.isTiny) {
            throw new Error(`The exponent ${expNum.toString()} is too large to compute directly.`);
        }

        let currentBase = this;
        let currentExp = expNum.chunkValue;
        let result = createInteger.ONE; // Initialize result to 1 (base^0).

        // Optimized exponentiation by squaring (binary exponentiation).
        while (currentExp > 0) {
            if (currentExp & 1) { // If exponent is odd, multiply result by currentBase.
                result = result.multiply(currentBase);
            }
            currentExp >>= 1; // Divide exponent by 2 (right bit shift).
            if (currentExp === 0) break;
            currentBase = currentBase.square(); // Square the base.
        }
        return result;
    };
    TinyNumber.prototype.power = LargeNumber.prototype.power; // Share implementation.

    /**
     * Calculates (base^exponent) mod modulus.
     * This uses modular exponentiation (binary exponentiation with modulo at each step).
     * @param {number|string|LargeNumber|TinyNumber} exponent The exponent.
     * @param {number|string|LargeNumber|TinyNumber} modulus The modulus.
     * @returns {LargeNumber|TinyNumber} The result of (this^exponent) % modulus.
     * @throws {Error} If modulus is zero.
     */
    LargeNumber.prototype.modPower = function (exponent, modulus) {
        const exp = parseValue(exponent);
        const mod = parseValue(modulus);

        if (mod.isZero()) {
            throw new Error("Modular exponentiation with a modulus of zero is undefined.");
        }

        let result = createInteger.ONE;
        let currentBase = this.modulo(mod); // Reduce base modulo modulus to keep numbers small.

        // Standard modular exponentiation algorithm.
        while (exp.isPositive()) {
            if (currentBase.isZero()) return createInteger.ZERO; // If base becomes 0, result is 0.
            if (exp.isOdd()) {
                result = result.multiply(currentBase).modulo(mod);
            }
            exp = exp.divide(2); // Integer division by 2.
            currentBase = currentBase.square().modulo(mod);
        }
        return result;
    };
    TinyNumber.prototype.modPower = LargeNumber.prototype.modPower; // Share implementation.

    // --- Comparison Operations ---

    /**
     * Compares the absolute values of two non-negative chunk arrays.
     * @param {number[]} arr1 The first chunk array.
     * @param {number[]} arr2 The second chunk array.
     * @returns {number} -1 if |arr1| < |arr2|, 0 if |arr1| == |arr2|, 1 if |arr1| > |arr2|.
     */
    function compareAbsoluteValues(arr1, arr2) {
        // First, compare lengths. Longer array means larger absolute value.
        if (arr1.length !== arr2.length) {
            return arr1.length > arr2.length ? 1 : -1;
        }

        // If lengths are equal, compare chunk by chunk from most significant to least significant.
        for (let i = arr1.length - 1; i >= 0; --i) {
            if (arr1[i] !== arr2[i]) {
                return arr1[i] > arr2[i] ? 1 : -1;
            }
        }
        return 0; // Arrays are identical, so absolute values are equal.
    }

    /**
     * Compares the absolute value of the current `LargeNumber` with another value.
     * @param {number|string|LargeNumber|TinyNumber} other The value to compare with.
     * @returns {number} -1 if |this| < |other|, 0 if |this| == |other|, 1 if |this| > |other|.
     */
    LargeNumber.prototype.compareAbsolute = function (other) {
        const otherNumber = parseValue(other);
        const thisChunks = this.chunkValues;
        // Convert `otherNumber` to chunk array for comparison if it's a `TinyNumber`.
        const otherChunks = otherNumber.isTiny ? convertSmallToChunkArray(Math.abs(otherNumber.chunkValue)) : otherNumber.chunkValues;

        return compareAbsoluteValues(thisChunks, otherChunks);
    };

    /**
     * Compares the absolute value of the current `TinyNumber` with another value.
     * @param {number|string|LargeNumber|TinyNumber} other The value to compare with.
     * @returns {number} -1 if |this| < |other|, 0 if |this| == |other|, 1 if |this| > |other|.
     */
    TinyNumber.prototype.compareAbsolute = function (other) {
        const otherNumber = parseValue(other);
        const thisAbsValue = Math.abs(this.chunkValue);

        if (otherNumber.isTiny) {
            const otherAbsValue = Math.abs(otherNumber.chunkValue);
            return thisAbsValue === otherAbsValue ? 0 : (thisAbsValue > otherAbsValue ? 1 : -1);
        }
        // If `otherNumber` is a `LargeNumber`, convert `this` to chunk array for comparison.
        const thisChunks = convertSmallToChunkArray(thisAbsValue);
        const otherChunks = otherNumber.chunkValues;
        return compareAbsoluteValues(thisChunks, otherChunks);
    };

    /**
     * Compares the current `LargeNumber` with another value.
     * @param {number|string|LargeNumber|TinyNumber} other The value to compare with.
     * @returns {number} -1 if this < other, 0 if this == other, 1 if this > other.
     */
    LargeNumber.prototype.compare = function (other) {
        // Handle special JavaScript number comparisons (Infinity, -Infinity).
        if (other === Infinity) return -1;
        if (other === -Infinity) return 1;

        const otherNumber = parseValue(other);

        // First, compare signs. Negative numbers are always smaller than positive numbers.
        if (this.isNegative !== otherNumber.isNegative) {
            return this.isNegative ? -1 : 1; // If `this` is negative, it's smaller (-1). If positive, it's larger (1).
        }

        // If signs are the same, compare absolute values.
        const absoluteComparison = this.compareAbsolute(otherNumber);
        // If both are negative, a larger absolute value means a smaller number (e.g., -10 < -5).
        return this.isNegative ? -absoluteComparison : absoluteComparison;
    };
    LargeNumber.prototype.compareTo = LargeNumber.prototype.compare; // Alias for consistency.

    /**
     * Compares the current `TinyNumber` with another value.
     * @param {number|string|LargeNumber|TinyNumber} other The value to compare with.
     * @returns {number} -1 if this < other, 0 if this == other, 1 if this > other.
     */
    TinyNumber.prototype.compare = function (other) {
        // Handle special JavaScript number comparisons.
        if (other === Infinity) return -1;
        if (other === -Infinity) return 1;

        const otherNumber = parseValue(other);
        const thisValue = this.chunkValue;

        if (otherNumber.isTiny) {
            // Both are `TinyNumber`s, use native JS comparison.
            const otherValue = otherNumber.chunkValue;
            return thisValue === otherValue ? 0 : (thisValue > otherValue ? 1 : -1);
        }

        // `this` is `TinyNumber`, `otherNumber` is `LargeNumber`.
        // Compare signs first.
        if (this.isNegative !== otherNumber.isNegative) {
            return this.isNegative ? -1 : 1;
        }

        // If signs are the same:
        // If both positive: a smaller number (`TinyNumber`) is less than a larger one (`LargeNumber`).
        // If both negative: a less negative number (`TinyNumber`) is greater than a more negative one (`LargeNumber`).
        return this.isNegative ? 1 : -1;
    };
    TinyNumber.prototype.compareTo = TinyNumber.prototype.compare; // Alias.

    // --- Equality and Relational Operators ---
    // These are implemented using the `compare` method for consistency.

    LargeNumber.prototype.equals = function (other) { return this.compare(other) === 0; };
    TinyNumber.prototype.eq = TinyNumber.prototype.equals = LargeNumber.prototype.eq = LargeNumber.prototype.equals;

    LargeNumber.prototype.notEquals = function (other) { return this.compare(other) !== 0; };
    TinyNumber.prototype.neq = TinyNumber.prototype.notEquals = LargeNumber.prototype.neq = LargeNumber.prototype.notEquals;

    LargeNumber.prototype.greaterThan = function (other) { return this.compare(other) > 0; };
    TinyNumber.prototype.gt = TinyNumber.prototype.greaterThan = LargeNumber.prototype.gt = LargeNumber.prototype.greaterThan;

    LargeNumber.prototype.lessThan = function (other) { return this.compare(other) < 0; };
    TinyNumber.prototype.lt = TinyNumber.prototype.lessThan = LargeNumber.prototype.lt = LargeNumber.prototype.lessThan;

    LargeNumber.prototype.greaterThanOrEqual = function (other) { return this.compare(other) >= 0; };
    TinyNumber.prototype.geq = TinyNumber.prototype.greaterThanOrEqual = LargeNumber.prototype.geq = LargeNumber.prototype.greaterThanOrEqual;

    LargeNumber.prototype.lessThanOrEqual = function (other) { return this.compare(other) <= 0; };
    TinyNumber.prototype.leq = TinyNumber.prototype.lessThanOrEqual = LargeNumber.prototype.leq = LargeNumber.prototype.lessThanOrEqual;

    // --- Property Checks (isEven, isZero, etc.) ---

    LargeNumber.prototype.isEven = function () {
        // Even/odd is determined by the least significant digit.
        return (this.chunkValues[0] & 1) === 0;
    };
    TinyNumber.prototype.isEven = function () {
        return (this.chunkValue & 1) === 0;
    };

    LargeNumber.prototype.isOdd = function () {
        return (this.chunkValues[0] & 1) === 1;
    };
    TinyNumber.prototype.isOdd = function () {
        return (this.chunkValue & 1) === 1;
    };

    LargeNumber.prototype.isPositive = function () {
        return !this.isNegative;
    };
    TinyNumber.prototype.isPositive = function () {
        return this.chunkValue > 0;
    };

    LargeNumber.prototype.isNegative = function () {
        return this.isNegative;
    };
    TinyNumber.prototype.isNegative = function () {
        return this.chunkValue < 0;
    };

    LargeNumber.prototype.isUnit = function () {
        // A LargeNumber cannot be 1 or -1 by definition (it would be a TinyNumber).
        return false;
    };
    TinyNumber.prototype.isUnit = function () {
        return Math.abs(this.chunkValue) === 1;
    };

    LargeNumber.prototype.isZero = function () {
        // A LargeNumber is zero if its chunk array is empty or contains only a single zero chunk.
        return this.chunkValues.length === 0 || (this.chunkValues.length === 1 && this.chunkValues[0] === 0);
    };
    TinyNumber.prototype.isZero = function () {
        return this.chunkValue === 0;
    };

    LargeNumber.prototype.isDivisibleBy = function (divisor) {
        const otherNumber = parseValue(divisor);
        if (otherNumber.isZero()) return false; // Division by zero.
        if (otherNumber.isUnit()) return true; // Divisible by 1 or -1.
        if (otherNumber.equals(2)) return this.isEven(); // Optimized check for 2.
        return this.modulo(otherNumber).isZero(); // Generic check: remainder is zero.
    };
    TinyNumber.prototype.isDivisibleBy = LargeNumber.prototype.isDivisibleBy; // Share implementation.

    /**
     * Performs a quick, basic check for primality for small numbers.
     * @param {LargeNumber|TinyNumber} num The number to check.
     * @returns {boolean|undefined} `true` if basic prime, `false` if basic composite, `undefined` if further checks are needed.
     */
    function performBasicPrimeCheck(num) {
        const absoluteNum = num.getAbsolute();
        if (absoluteNum.isUnit()) return false; // 1 is not prime.
        if (absoluteNum.equals(2) || absoluteNum.equals(3) || absoluteNum.equals(5)) return true; // 2, 3, 5 are prime.
        if (absoluteNum.isEven() || absoluteNum.isDivisibleBy(3) || absoluteNum.isDivisibleBy(5)) return false; // Divisible by 2, 3, or 5.
        // For numbers less than 25, if they passed above checks, they are prime (7, 11, 13, 17, 19, 23).
        if (absoluteNum.lessThan(25)) return true;
        return undefValue; // Needs more rigorous testing (e.g., Miller-Rabin).
    }

    LargeNumber.prototype.isPrime = function () {
        const basicCheckResult = performBasicPrimeCheck(this);
        if (basicCheckResult !== undefValue) return basicCheckResult;

        const n = this.getAbsolute();
        const nMinusOne = n.prev(); // n-1

        // Miller-Rabin primality test.
        // These bases are sufficient for numbers up to a certain limit (e.g., 3.3 * 10^14 for these specific bases).
        const strongProbablePrimeBases = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37];
        let d = nMinusOne;
        let s = 0; // Count of factors of 2 in n-1, i.e., n-1 = d * 2^s.
        while (d.isEven()) {
            d = d.divide(2);
            s++;
        }

        // Witness loop for each base 'a'.
        for (let i = 0; i < strongProbablePrimeBases.length; ++i) {
            const a = createInteger(strongProbablePrimeBases[i]);
            // Skip bases greater than or equal to n.
            if (a.greaterThanOrEqual(n)) continue;

            let x = a.modPower(d, n); // x = a^d mod n

            if (x.equals(createInteger.ONE) || x.equals(nMinusOne)) {
                continue; // n is a strong probable prime with respect to base 'a'.
            }

            let isCompositeWitness = true;
            for (let r = 1; r < s; ++r) {
                x = x.square().modulo(n); // x = x^2 mod n
                if (x.equals(nMinusOne)) {
                    isCompositeWitness = false; // Found a condition for probable prime.
                    break;
                }
            }
            if (isCompositeWitness) return false; // 'a' is a witness to n's compositeness.
        }
        return true; // Passed all strong probable prime tests, highly likely prime.
    };
    TinyNumber.prototype.isPrime = LargeNumber.prototype.isPrime; // Share implementation.

    LargeNumber.prototype.isProbablePrime = function (iterations) {
        const basicCheckResult = performBasicPrimeCheck(this);
        if (basicCheckResult !== undefValue) return basicCheckResult;

        const n = this.getAbsolute();
        const numIterations = iterations === undefValue ? 5 : iterations; // Default to 5 iterations.

        // Additional checks for small numbers to avoid edge cases.
        if (n.lessThanOrEqual(createInteger.ONE)) return false;
        if (n.equals(2) || n.equals(3)) return true;
        if (n.isEven()) return false;

        const nMinusOne = n.prev();
        let d = nMinusOne;
        // Find d and s such that n-1 = d * 2^s where d is odd.
        while (d.isEven()) {
            d = d.divide(2);
        }

        // Miller-Rabin test with random bases.
        for (let i = 0; i < numIterations; ++i) {
            // Pick a random 'a' such that 2 <= a <= n-2.
            const a = createInteger.randBetween(createInteger(2), n.subtract(2));
            let x = a.modPower(d, n); // x = a^d mod n

            if (x.equals(createInteger.ONE) || x.equals(nMinusOne)) {
                continue;
            }

            let isCompositeWitness = true;
            let currentExponent = d;
            while (currentExponent.lessThan(nMinusOne)) {
                x = x.square().modulo(n);
                if (x.equals(nMinusOne)) {
                    isCompositeWitness = false;
                    break;
                }
                currentExponent = currentExponent.multiply(2); // Double the exponent.
            }
            if (isCompositeWitness) return false; // Found a witness, definitely composite.
        }
        return true; // Passed all probabilistic tests, highly likely prime.
    };
    TinyNumber.prototype.isProbablePrime = LargeNumber.prototype.isProbablePrime; // Share implementation.

    /**
     * Calculates the modular multiplicative inverse of `this` modulo `modulus`.
     * Uses the Extended Euclidean Algorithm.
     * @param {number|string|LargeNumber|TinyNumber} modulus The modulus.
     * @returns {LargeNumber|TinyNumber} The modular inverse.
     * @throws {Error} If `this` and `modulus` are not coprime (GCD is not 1).
     */
    LargeNumber.prototype.modInverse = function (modulus) {
        let t = createInteger.ZERO, newT = createInteger.ONE;
        let r = parseValue(modulus), newR = this.getAbsolute(); // Use absolute value for Euclidean algorithm.

        let q, lastT, lastR;

        // Extended Euclidean Algorithm loop.
        while (!newR.isZero()) {
            q = r.divide(newR); // q = floor(r / newR)
            lastT = t;
            lastR = r;

            t = newT;
            r = newR;

            newT = lastT.subtract(q.multiply(newT));
            newR = lastR.subtract(q.multiply(newR));
        }

        // If GCD(this, modulus) is not 1, then modular inverse does not exist.
        if (!r.equals(createInteger.ONE)) {
            throw new Error(`Numbers ${this.toString()} and ${modulus.toString()} are not coprime, no modular inverse exists.`);
        }

        // Adjust `t` to be positive if it's negative.
        if (t.isNegative()) {
            t = t.add(modulus);
        }

        // If the original number was negative, negate the final result.
        if (this.isNegative()) {
            return t.negate();
        }
        return t;
    };
    TinyNumber.prototype.modInverse = LargeNumber.prototype.modInverse; // Share implementation.

    /**
     * Returns the next integer (this + 1).
     * @returns {LargeNumber|TinyNumber} The result.
     */
    LargeNumber.prototype.next = function () {
        if (this.isNegative) {
            // For negative numbers, adding 1 means subtracting 1 from its absolute value and keeping negative sign.
            // e.g., -5.next() => -4.  abs(-5) - 1 => 5 - 1 = 4. Then negate => -4.
            return subtractSmallFromChunkArray(this.chunkValues, 1, this.isNegative);
        }
        return new LargeNumber(addSmallToChunkArray(this.chunkValues, 1), this.isNegative);
    };
    TinyNumber.prototype.next = function () {
        const nextValue = this.chunkValue + 1;
        if (canFitInNative(nextValue)) {
            return new TinyNumber(nextValue);
        }
        // If it overflows the native JS safe integer limit, convert to LargeNumber.
        // Assuming SAFE_JS_MAX_DIGITS represents SAFE_JS_MAX, so next is SAFE_JS_MAX + 1.
        return new LargeNumber(addSmallToChunkArray(SAFE_JS_MAX_DIGITS, 1), false);
    };

    /**
     * Returns the previous integer (this - 1).
     * @returns {LargeNumber|TinyNumber} The result.
     */
    LargeNumber.prototype.prev = function () {
        if (this.isNegative) {
            // For negative numbers, subtracting 1 means adding 1 to its absolute value and keeping negative sign.
            // e.g., -5.prev() => -6.  abs(-5) + 1 => 5 + 1 = 6. Then negate => -6.
            return new LargeNumber(addSmallToChunkArray(this.chunkValues, 1), true);
        }
        return subtractSmallFromChunkArray(this.chunkValues, 1, this.isNegative);
    };
    TinyNumber.prototype.prev = function () {
        const prevValue = this.chunkValue - 1;
        if (canFitInNative(prevValue)) {
            return new TinyNumber(prevValue);
        }
        // If it underflows the native JS safe integer limit, convert to LargeNumber.
        // This would be -SAFE_JS_MAX - 1.
        return new LargeNumber(addSmallToChunkArray(SAFE_JS_MAX_DIGITS, 1), true);
    };

    // --- Bitwise Operations ---

    // Pre-calculate powers of 2 up to CHUNK_SIZE for efficient bit shifts.
    const POWERS_OF_TWO = [1];
    while (2 * POWERS_OF_TWO[POWERS_OF_TWO.length - 1] <= CHUNK_SIZE) {
        POWERS_OF_TWO.push(2 * POWERS_OF_TWO[POWERS_OF_TWO.length - 1]);
    }
    const POWERS_OF_TWO_ARRAY_LEN = POWERS_OF_TWO.length;
    const HIGHEST_POWER_OF_TWO_IN_CHUNK = POWERS_OF_TWO[POWERS_OF_TWO_ARRAY_LEN - 1];

    /**
     * Checks if a given shift amount can be represented by a small integer.
     * @param {any} shiftAmount The value representing the shift amount.
     * @returns {boolean} `true` if small enough, `false` otherwise.
     */
    function isShiftAmountSmall(shiftAmount) {
        return (typeof shiftAmount === "number" || typeof shiftAmount === "string") && Math.abs(Number(shiftAmount)) <= CHUNK_SIZE ||
               (shiftAmount instanceof LargeNumber && shiftAmount.chunkValues.length <= 1) ||
               (shiftAmount instanceof TinyNumber);
    }

    /**
     * Shifts the current number's bits to the left by `n` positions.
     * This is equivalent to multiplying by 2^n.
     * @param {number|string|LargeNumber|TinyNumber} shiftBy The number of bits to shift.
     * @returns {LargeNumber|TinyNumber} The shifted number.
     * @throws {Error} If the shift amount is too large.
     */
    LargeNumber.prototype.shiftLeft = function (shiftBy) {
        if (!isShiftAmountSmall(shiftBy)) {
            throw new Error(`Shift amount ${String(shiftBy)} is too large for efficient shifting.`);
        }
        const n = Number(shiftBy);
        if (n < 0) return this.shiftRight(-n); // Left shift by negative N is right shift by N.
        if (this.isZero()) return createInteger.ZERO; // Shifting zero results in zero.

        let result = this;
        let remainingShifts = n;

        // Apply shifts in chunks, multiplying by HIGHEST_POWER_OF_TWO each time.
        while (remainingShifts >= POWERS_OF_TWO_ARRAY_LEN) {
            result = result.multiply(HIGHEST_POWER_OF_TWO_IN_CHUNK);
            remainingShifts -= (POWERS_OF_TWO_ARRAY_LEN - 1); // Adjust remaining shifts (highestPower is 2^6, not 2^7).
        }
        // Apply any remaining shifts using the precomputed powers of two.
        return result.multiply(POWERS_OF_TWO[remainingShifts]);
    };
    TinyNumber.prototype.shiftLeft = LargeNumber.prototype.shiftLeft; // Share implementation.

    /**
     * Shifts the current number's bits to the right by `n` positions.
     * This is equivalent to integer division by 2^n.
     * @param {number|string|LargeNumber|TinyNumber} shiftBy The number of bits to shift.
     * @returns {LargeNumber|TinyNumber} The shifted number.
     * @throws {Error} If the shift amount is too large.
     */
    LargeNumber.prototype.shiftRight = function (shiftBy) {
        if (!isShiftAmountSmall(shiftBy)) {
            throw new Error(`Shift amount ${String(shiftBy)} is too large for efficient shifting.`);
        }
        const n = Number(shiftBy);
        if (n < 0) return this.shiftLeft(-n); // Right shift by negative N is left shift by N.
        if (this.isZero() || (this.isNegative && this.isUnit())) return this; // Shifting 0 or -1 results in 0 or -1.

        let result = this;
        let remainingShifts = n;
        let divisionResult;

        // Apply shifts in chunks, dividing by HIGHEST_POWER_OF_TWO.
        while (remainingShifts >= POWERS_OF_TWO_ARRAY_LEN) {
            if (result.isZero() || (result.isNegative() && result.isUnit())) return result;
            divisionResult = result.divmod(HIGHEST_POWER_OF_TWO_IN_CHUNK);
            // For right shifts, division truncates towards negative infinity.
            // If the remainder is negative, decrement the quotient to ensure floor division.
            result = divisionResult.remainder.isNegative() ? divisionResult.quotient.prev() : divisionResult.quotient;
            remainingShifts -= (POWERS_OF_TWO_ARRAY_LEN - 1);
        }

        // Apply any remaining shifts.
        divisionResult = result.divmod(POWERS_OF_TWO[remainingShifts]);
        return divisionResult.remainder.isNegative() ? divisionResult.quotient.prev() : divisionResult.quotient;
    };
    TinyNumber.prototype.shiftRight = LargeNumber.prototype.shiftRight; // Share implementation.

    /**
     * Generic function for performing bitwise operations (AND, OR, XOR).
     * It simulates two's complement behavior for negative numbers.
     * @param {LargeNumber|TinyNumber} firstOperand The first operand.
     * @param {number|string|LargeNumber|TinyNumber} secondOperand The second operand.
     * @param {function(number, number): number} bitwiseFunction The native bitwise function (e.g., `(a,b) => a & b`).
     * @returns {LargeNumber|TinyNumber} The result of the bitwise operation.
     */
    function performBitwiseOperation(firstOperand, secondOperand, bitwiseFunction) {
        const op2 = parseValue(secondOperand);

        const op1IsNegative = firstOperand.isNegative();
        const op2IsNegative = op2.isNegative();

        // For negative numbers, bitwise operations are performed on their two's complement.
        // In this implementation, `N.not()` gives `~N` (which is `-N - 1`).
        // So `N` for `N < 0` is effectively `~(|N|-1)`.
        const op1PositiveEquivalent = op1IsNegative ? firstOperand.not() : firstOperand;
        const op2PositiveEquivalent = op2IsNegative ? op2.not() : op2;

        const resultChunks = [];
        let currentOp1 = op1PositiveEquivalent;
        let currentOp2 = op2PositiveEquivalent;
        let op1ChunkBitValue, op2ChunkBitValue;
        let divMod1, divMod2;

        // Process chunks from least significant to most significant.
        // The loop continues as long as either number has non-zero chunks.
        while (!currentOp1.isZero() || !currentOp2.isZero()) {
            divMod1 = currentOp1.divmod(HIGHEST_POWER_OF_TWO_IN_CHUNK);
            op1ChunkBitValue = divMod1.remainder.toJSNumber();
            if (op1IsNegative) op1ChunkBitValue = HIGHEST_POWER_OF_TWO_IN_CHUNK - 1 - op1ChunkBitValue; // Invert bits for negative.
            currentOp1 = divMod1.quotient;

            divMod2 = currentOp2.divmod(HIGHEST_POWER_OF_TWO_IN_CHUNK);
            op2ChunkBitValue = divMod2.remainder.toJSNumber();
            if (op2IsNegative) op2ChunkBitValue = HIGHEST_POWER_OF_TWO_IN_CHUNK - 1 - op2ChunkBitValue; // Invert bits for negative.
            currentOp2 = divMod2.quotient;

            resultChunks.push(bitwiseFunction(op1ChunkBitValue, op2ChunkBitValue));
        }

        // Determine the "sign bit" of the result based on the bitwise operation on the original signs.
        // This is a simplified way to determine if the final number should be negative, assuming two's complement.
        const finalSignBitResult = bitwiseFunction(op1IsNegative ? 1 : 0, op2IsNegative ? 1 : 0);
        let finalResult = finalSignBitResult !== 0 ? createInteger.MINUS_ONE : createInteger.ZERO;

        // Reconstruct the number from the resulting chunks.
        for (let i = resultChunks.length - 1; i >= 0; --i) {
            finalResult = finalResult.multiply(HIGHEST_POWER_OF_TWO_IN_CHUNK).add(createInteger(resultChunks[i]));
        }
        return finalResult;
    }

    /**
     * Bitwise NOT operation (~N = -N - 1).
     * @returns {LargeNumber|TinyNumber} The result.
     */
    LargeNumber.prototype.not = function () {
        return this.negate().prev();
    };
    TinyNumber.prototype.not = LargeNumber.prototype.not; // Share implementation.

    /**
     * Bitwise AND operation.
     * @param {number|string|LargeNumber|TinyNumber} other The second operand.
     * @returns {LargeNumber|TinyNumber} The result.
     */
    LargeNumber.prototype.and = function (other) {
        return performBitwiseOperation(this, other, (a, b) => a & b);
    };
    TinyNumber.prototype.and = LargeNumber.prototype.and; // Share implementation.

    /**
     * Bitwise OR operation.
     * @param {number|string|LargeNumber|TinyNumber} other The second operand.
     * @returns {LargeNumber|TinyNumber} The result.
     */
    LargeNumber.prototype.or = function (other) {
        return performBitwiseOperation(this, other, (a, b) => a | b);
    };
    TinyNumber.prototype.or = LargeNumber.prototype.or; // Share implementation.

    /**
     * Bitwise XOR operation.
     * @param {number|string|LargeNumber|TinyNumber} other The second operand.
     * @returns {LargeNumber|TinyNumber} The result.
     */
    LargeNumber.prototype.xor = function (other) {
        return performBitwiseOperation(this, other, (a, b) => a ^ b);
    };
    TinyNumber.prototype.xor = LargeNumber.prototype.xor; // Share implementation.

    // --- Number Theory and Utility Functions ---

    // Masks for quickly finding the Least Significant Bit (LOB) for GCD optimization.
    const JS_INT_LOB_MASK = 1 << 30; // Max 2^N for 32-bit signed integer.
    // For chunk arrays, combine the first two chunks as a rough estimate.
    const CHUNK_ARRAY_LOB_MASK = (CHUNK_SIZE & -CHUNK_SIZE) * (CHUNK_SIZE & -CHUNK_SIZE) | JS_INT_LOB_MASK;

    /**
     * Calculates a rough approximation of the Least Significant Bit (LOB) for GCD optimization.
     * This is useful for efficiently finding factors of 2.
     * @param {LargeNumber|TinyNumber} num The number to analyze.
     * @returns {number} A power of two representing the LOB.
     */
    function calculateRoughLOB(num) {
        const valueRepresentation = num.isTiny ? num.chunkValue : num.chunkValues;
        const x = typeof valueRepresentation === "number"
            ? valueRepresentation | JS_INT_LOB_MASK
            : valueRepresentation[0] + (valueRepresentation[1] || 0) * CHUNK_SIZE | CHUNK_ARRAY_LOB_MASK;
        return x & -x; // This extracts the lowest set bit (e.g., 12 -> 4, 10 -> 2).
    }

    /**
     * Computes the integer logarithm base `base` of `value`.
     * Returns the largest integer `e` such that `base^e <= value`.
     * @param {LargeNumber|TinyNumber} value The number for which to find the logarithm.
     * @param {LargeNumber|TinyNumber} base The base of the logarithm.
     * @returns {{power: LargeNumber|TinyNumber, exponent: number}} An object containing `base^e` and `e`.
     */
    function computeIntegerLogarithm(value, base) {
        // Base case: if base is greater than value, the exponent is 0 (base^0 = 1).
        if (base.compare(value) > 0) {
            return { power: createInteger.ONE, exponent: 0 };
        }

        // Recursive step: log_b(N) = 2 * log_b^2(N) + (0 or 1)
        // Calculate log for base^2 to halve the problem size.
        const tempLog = computeIntegerLogarithm(value, base.square());
        const p_squared = tempLog.power; // This is (base^2)^exponent
        const exponent_for_squared_base = tempLog.exponent;

        // Check if multiplying by `base` again keeps it <= `value`.
        const p_final = p_squared.multiply(base);
        if (p_final.compare(value) <= 0) {
            // If (base^2)^e * base <= value, then the exponent for base is 2*e + 1.
            return { power: p_final, exponent: exponent_for_squared_base * 2 + 1 };
        }
        // Otherwise, the exponent for base is 2*e.
        return { power: p_squared, exponent: exponent_for_squared_base * 2 };
    }

    /**
     * Calculates the minimum number of bits required to represent the absolute value of `this` number.
     * For negative numbers, it's typically the bit length of `|N|-1` in two's complement.
     * @returns {LargeNumber|TinyNumber} The bit length as an integer object.
     */
    LargeNumber.prototype.bitLength = function () {
        let currentNum = this;
        // For negative numbers, bit length is usually for `~N` which is `abs(N)-1` in unsigned context.
        if (currentNum.isNegative()) {
            currentNum = currentNum.negate().subtract(createInteger.ONE);
        }
        if (currentNum.isZero()) {
            return createInteger.ZERO;
        }
        // Use the integer logarithm base 2 to find the highest power of 2 less than or equal to `currentNum`.
        // The exponent + 1 gives the bit length.
        return createInteger(computeIntegerLogarithm(currentNum, createInteger(2)).exponent).add(createInteger.ONE);
    };
    TinyNumber.prototype.bitLength = LargeNumber.prototype.bitLength; // Share implementation.

    /**
     * Returns the greater of two numbers.
     * @param {number|string|LargeNumber|TinyNumber} val1 The first number.
     * @param {number|string|LargeNumber|TinyNumber} val2 The second number.
     * @returns {LargeNumber|TinyNumber} The greater number.
     */
    function findMax(val1, val2) {
        const numA = parseValue(val1);
        const numB = parseValue(val2);
        return numA.greaterThan(numB) ? numA : numB;
    }

    /**
     * Returns the lesser of two numbers.
     * @param {number|string|LargeNumber|TinyNumber} val1 The first number.
     * @param {number|string|LargeNumber|TinyNumber} val2 The second number.
     * @returns {LargeNumber|TinyNumber} The lesser number.
     */
    function findMin(val1, val2) {
        const numA = parseValue(val1);
        const numB = parseValue(val2);
        return numA.lessThan(numB) ? numA : numB;
    }

    /**
     * Computes the Greatest Common Divisor (GCD) of two numbers using the binary (Stein's) GCD algorithm.
     * @param {number|string|LargeNumber|TinyNumber} val1 The first number.
     * @param {number|string|LargeNumber|TinyNumber} val2 The second number.
     * @returns {LargeNumber|TinyNumber} The GCD of the two numbers.
     */
    function calculateGCD(val1, val2) {
        let numA = parseValue(val1).getAbsolute();
        let numB = parseValue(val2).getAbsolute();

        if (numA.equals(numB)) return numA;
        if (numA.isZero()) return numB;
        if (numB.isZero()) return numA;

        let commonFactorsOfTwo = createInteger.ONE;
        let tempHolder;

        // Step 1: Remove common factors of 2.
        while (numA.isEven() && numB.isEven()) {
            // Find the minimum power of 2 that divides both numA and numB.
            const lobA = calculateRoughLOB(numA);
            const lobB = calculateRoughLOB(numB);
            const minLob = Math.min(lobA, lobB); // e.g., if lobA=4, lobB=2, minLob=2.

            numA = numA.divide(createInteger(minLob));
            numB = numB.divide(createInteger(minLob));
            commonFactorsOfTwo = commonFactorsOfTwo.multiply(createInteger(minLob));
        }

        // Step 2: Remove remaining factors of 2 from numA (now at least one is odd).
        while (numA.isEven()) {
            numA = numA.divide(calculateRoughLOB(numA));
        }

        // Step 3: Main binary GCD loop.
        do {
            // Remove factors of 2 from numB.
            while (numB.isEven()) {
                numB = numB.divide(calculateRoughLOB(numB));
            }
            // Ensure numA <= numB by swapping if necessary.
            if (numA.greaterThan(numB)) {
                tempHolder = numB;
                numB = numA;
                numA = tempHolder;
            }
            // Subtract numA from numB. Since numA and numB are now odd, their difference is even.
            numB = numB.subtract(numA);
        } while (!numB.isZero()); // Loop until numB becomes zero.

        // The result is numA multiplied by the common factors of 2 extracted earlier.
        return commonFactorsOfTwo.isUnit() ? numA : numA.multiply(commonFactorsOfTwo);
    }

    /**
     * Computes the Least Common Multiple (LCM) of two numbers.
     * LCM(a, b) = (|a| * |b|) / GCD(|a|, |b|)
     * @param {number|string|LargeNumber|TinyNumber} val1 The first number.
     * @param {number|string|LargeNumber|TinyNumber} val2 The second number.
     * @returns {LargeNumber|TinyNumber} The LCM of the two numbers.
     */
    function calculateLCM(val1, val2) {
        const numA = parseValue(val1).getAbsolute();
        const numB = parseValue(val2).getAbsolute();

        if (numA.isZero() || numB.isZero()) return createInteger.ZERO; // LCM involving zero is zero.

        // To prevent intermediate overflow (a * b might be too large),
        // calculate as (a / GCD(a, b)) * b.
        return numA.divide(calculateGCD(numA, numB)).multiply(numB);
    }

    /**
     * Generates a cryptographically weak pseudo-random integer between `minVal` and `maxVal` (inclusive).
     * @param {number|string|LargeNumber|TinyNumber} minVal The minimum value for the random number.
     * @param {number|string|LargeNumber|TinyNumber} maxVal The maximum value for the random number.
     * @returns {LargeNumber|TinyNumber} A random integer within the specified range.
     */
    function generateRandomBetween(minVal, maxVal) {
        const lowerBound = findMin(minVal, maxVal);
        const upperBound = findMax(minVal, maxVal);

        const range = upperBound.subtract(lowerBound).add(1); // Calculate (max - min + 1).

        // If the range fits into a small integer, use native `Math.random`.
        if (range.isTiny) {
            return lowerBound.add(Math.floor(Math.random() * range.chunkValue));
        }

        const rangeChunks = range.chunkValues;
        const numChunksInRandom = rangeChunks.length;
        const generatedChunks = [];
        let isUpperLimitRestricted = true; // Flag to ensure the generated number doesn't exceed the range.

        // Generate random chunks from most significant to least significant.
        for (let i = numChunksInRandom - 1; i >= 0; --i) {
            const currentMaxDigit = isUpperLimitRestricted ? rangeChunks[i] : CHUNK_SIZE;
            const digit = truncateTowardZero(Math.random() * (currentMaxDigit + 1)); // (+1 to make it inclusive)
            generatedChunks.unshift(digit);
            if (digit < currentMaxDigit) {
                isUpperLimitRestricted = false; // Once a digit is less than its max, subsequent digits can be anything.
            }
        }
        removeLeadingZeros(generatedChunks); // Clean up leading zeros.

        const randomNumAsSmall = convertChunkArrayToSmall(generatedChunks);
        if (typeof randomNumAsSmall === "number") {
            return lowerBound.add(new TinyNumber(randomNumAsSmall));
        } else {
            return lowerBound.add(new LargeNumber(randomNumAsSmall, false));
        }
    }

    /**
     * Parses a string representation of a number in a given base (radix).
     * @param {string} numberString The string to parse.
     * @param {number} base The base (radix) of the numberString.
     * @returns {LargeNumber|TinyNumber} The parsed number.
     * @throws {Error} If the string contains invalid digits for the specified base.
     */
    const parseValueWithBase = function (numberString, base) {
        const stringLength = numberString.length;
        const absoluteBase = Math.abs(base);

        // Pre-validation of characters in the string for the given base.
        for (let i = 0; i < stringLength; ++i) {
            const char = numberString[i].toLowerCase();
            if (char === "-") continue; // Allow a leading minus sign.
            if (!/[a-z0-9]/.test(char) && char !== '<') { // Allow custom digit markers.
                throw new Error(`Invalid character '${char}' found in base ${base} string.`);
            }

            const charCode = char.charCodeAt(0);
            let digitValue;
            if (charCode >= 48 && charCode <= 57) { // '0'-'9'
                digitValue = charCode - 48;
            } else if (charCode >= 97 && charCode <= 122) { // 'a'-'z'
                digitValue = charCode - 97 + 10;
            } else if (char === '<') { // Custom digit, e.g., <10>
                // Skip parsing for now, handled below.
                continue;
            } else {
                throw new Error(`Invalid digit '${char}' for base ${base}.`); // Should not be reached with prior regex.
            }

            if (digitValue >= absoluteBase) {
                // Special edge case: base 1 only allows '1'.
                if (char === "1" && absoluteBase === 1) continue;
                throw new Error(`Digit '${char}' is not valid for base ${base}.`);
            }
        }

        // Optimization: For small bases (2-36) and numbers that might fit native JS integers.
        if (base >= 2 && base <= 36) {
            // Estimate if the number of digits could exceed SAFE_JS_MAX.
            if (stringLength <= LOG_SAFE_JS_MAX / Math.log(base)) {
                const nativeParsed = parseInt(numberString, base);
                if (!isNaN(nativeParsed) && canFitInNative(nativeParsed)) {
                    return new TinyNumber(nativeParsed);
                }
            }
        }

        const parsedBaseObject = parseValue(base); // Ensure base is an integer object.
        const digitObjects = [];
        const isNegative = numberString[0] === "-";
        let currentStringIndex = isNegative ? 1 : 0;

        // Parse individual digits into Integer objects.
        while (currentStringIndex < numberString.length) {
            const char = numberString[currentStringIndex].toLowerCase();
            const charCode = char.charCodeAt(0);

            if (charCode >= 48 && charCode <= 57) { // '0'-'9'
                digitObjects.push(parseValue(char));
            } else if (charCode >= 97 && charCode <= 122) { // 'a'-'z'
                digitObjects.push(parseValue(charCode - 97 + 10));
            } else if (char === "<") { // Handle custom digits like <10>, <100>
                const startIndex = currentStringIndex;
                do {
                    currentStringIndex++;
                } while (currentStringIndex < numberString.length && numberString[currentStringIndex] !== ">");
                if (numberString[currentStringIndex] !== ">") {
                    throw new Error("Unclosed custom digit token starting at index " + startIndex);
                }
                digitObjects.push(parseValue(numberString.slice(startIndex + 1, currentStringIndex)));
            } else {
                throw new Error(`Invalid character '${char}' encountered during parsing for base ${base}`);
            }
            currentStringIndex++;
        }
        return parseBaseFromDigitArray(digitObjects, parsedBaseObject, isNegative);
    };

    /**
     * Converts an array of digits (where each digit is itself an Integer object) from a given base to decimal.
     * This is the core logic for converting arbitrary bases.
     * @param {Array<LargeNumber|TinyNumber>} digitObjects An array of Integer objects representing the digits.
     * @param {LargeNumber|TinyNumber} base The base of the digits.
     * @param {boolean} isNegative Flag indicating if the overall number is negative.
     * @returns {LargeNumber|TinyNumber} The resulting decimal integer object.
     */
    function parseBaseFromDigitArray(digitObjects, base, isNegative) {
        let result = createInteger.ZERO;
        let currentPower = createInteger.ONE; // Represents base^0, base^1, base^2, etc.

        // Iterate from the least significant digit to the most significant.
        for (let i = digitObjects.length - 1; i >= 0; --i) {
            result = result.add(digitObjects[i].multiply(currentPower));
            currentPower = currentPower.multiply(base);
        }
        return isNegative ? result.negate() : result;
    }

    /**
     * Converts a single digit value (number) to its string representation.
     * Used for `toString(radix)` when radix is not 10.
     * @param {number} digitValue The numerical value of the digit.
     * @returns {string} The string representation of the digit (e.g., 'A' for 10, '<36>' for 36).
     */
    function convertDigitToString(digitValue) {
        if (digitValue >= 0 && digitValue <= 35) {
            return "0123456789abcdefghijklmnopqrstuvwxyz".charAt(digitValue);
        }
        return `<${digitValue}>`; // For bases > 36 or custom digit representations.
    }

    /**
     * Converts a `LargeNumber` or `TinyNumber` to its representation in a given base.
     * @param {LargeNumber|TinyNumber} num The number to convert.
     * @param {LargeNumber|TinyNumber} base The target base.
     * @returns {{digits: number[], isNegative: boolean}} An object containing the digit array and sign.
     * @throws {Error} If base is zero or an unsupported negative base.
     */
    function convertToBaseArray(num, base) {
        const targetBase = parseValue(base);

        if (targetBase.isZero()) {
            if (num.isZero()) return { digits: [0], isNegative: false };
            throw new Error("Cannot convert non-zero numbers to base 0.");
        }

        // Handle specific non-standard negative bases.
        // The original code had a very specific, non-standard interpretation of base -1.
        // It's usually `11` for -1, `10` for -2, etc.
        // The original logic is preserved but might not align with common negative base systems.
        if (targetBase.equals(-1)) {
            if (num.isZero()) return { digits: [0], isNegative: false };
            const absN = num.getAbsolute().toJSNumber(); // Assume it fits for this non-standard case.
            if (num.isNegative()) {
                if (absN === 1) return { digits: [1, 1], isNegative: false }; // -1 in base -1 is 11
                const resultArr = [];
                for (let i = 0; i < absN; i++) {
                    resultArr.push(1, 0); // This specific pattern from original code.
                }
                return { digits: resultArr, isNegative: false };
            } else { // Positive num
                if (absN === 1) return { digits: [1], isNegative: false };
                const arr = [];
                for (let i = 0; i < absN - 1; i++) arr.push(0, 1);
                arr.unshift(1);
                return { digits: arr, isNegative: false };
            }
        }

        let resultIsNegative = false;
        let currentNum = num;

        // If the number is negative and the base is positive, extract the sign.
        if (num.isNegative() && targetBase.isPositive()) {
            resultIsNegative = true;
            currentNum = num.getAbsolute();
        }

        // Handle base 1 (unary representation).
        if (targetBase.equals(1)) {
            if (currentNum.isZero()) return { digits: [0], isNegative: false };
            const onesCount = currentNum.toJSNumber(); // Assuming it fits for this case.
            if (onesCount > 100000) { // Guard against excessively large arrays.
                throw new Error(`Cannot represent large number in base 1 (too many digits).`);
            }
            return { digits: Array(onesCount).fill(1), isNegative: resultIsNegative };
        }

        const digitList = [];
        let divModResult;

        // Repeated division to extract digits.
        while (currentNum.isNegative() || currentNum.compareAbsolute(targetBase) >= 0) {
            divModResult = performDivisionAndMod(currentNum, targetBase);
            currentNum = divModResult.quotient;
            let digit = divModResult.remainder;

            // Adjust for negative remainders (e.g., in negative bases).
            if (digit.isNegative()) {
                digit = targetBase.subtract(digit).getAbsolute(); // Make remainder positive by adding base.
                currentNum = currentNum.next(); // Adjust quotient accordingly.
            }
            digitList.push(digit.toJSNumber());
        }
        digitList.push(currentNum.toJSNumber()); // Add the last quotient.

        return { digits: digitList.reverse(), isNegative: resultIsNegative };
    }

    /**
     * Converts a number to its string representation in the specified base.
     * @param {LargeNumber|TinyNumber} num The number to convert.
     * @param {number} base The target base.
     * @returns {string} The string representation.
     */
    function convertToBaseString(num, base) {
        const { digits, isNegative } = convertToBaseArray(num, base);
        const signPrefix = isNegative ? "-" : "";
        return signPrefix + digits.map(convertDigitToString).join("");
    }

    /**
     * Returns the number as an array of digits in the specified base.
     * @param {number} radix The target base.
     * @returns {{digits: number[], isNegative: boolean}} An object containing the digit array and sign.
     */
    LargeNumber.prototype.toDigitArray = function (radix) {
        return convertToBaseArray(this, radix);
    };
    TinyNumber.prototype.toDigitArray = LargeNumber.prototype.toDigitArray; // Share implementation.

    /**
     * Returns the string representation of the `LargeNumber` in the specified base.
     * @param {number} [radix=10] The target base.
     * @returns {string} The string representation.
     */
    LargeNumber.prototype.toString = function (radix) {
        const base = radix === undefValue ? 10 : radix;
        if (base !== 10) return convertToBaseString(this, base);

        const chunks = this.chunkValues;
        const len = chunks.length;
        if (this.isZero()) return "0"; // Handle zero explicitly.

        let stringRepresentation = String(chunks[len - 1]); // Start with the most significant chunk.
        const paddingZeros = "0000000"; // For padding chunks to 7 digits (CHUNK_POWER).
        let currentChunkString;

        // Iterate from the second most significant chunk down to the least significant.
        for (let i = len - 2; i >= 0; --i) {
            currentChunkString = String(chunks[i]);
            stringRepresentation += paddingZeros.slice(currentChunkString.length) + currentChunkString;
        }
        return (this.isNegative ? "-" : "") + stringRepresentation;
    };

    /**
     * Returns the string representation of the `TinyNumber` in the specified base.
     * @param {number} [radix=10] The target base.
     * @returns {string} The string representation.
     */
    TinyNumber.prototype.toString = function (radix) {
        const base = radix === undefValue ? 10 : radix;
        if (base !== 10) return convertToBaseString(this, base);
        return String(this.chunkValue);
    };

    /**
     * Returns the JSON representation of the number, which is its string value.
     * @returns {string} The string representation.
     */
    LargeNumber.prototype.toJSON = TinyNumber.prototype.toJSON = function () {
        return this.toString();
    };

    /**
     * Returns the primitive value of the number (used by `valueOf` for type coercion).
     * Attempts to convert to a native JavaScript number if possible, otherwise returns string.
     * @returns {number|string} The primitive value.
     */
    LargeNumber.prototype.valueOf = function () {
        // Converting to string then parsing is a reliable way to check if it fits native number.
        const asJsNumber = parseInt(this.toString(), 10);
        if (canFitInNative(asJsNumber)) return asJsNumber;
        return this.toString(); // Fallback to string if too large.
    };
    LargeNumber.prototype.toJSNumber = LargeNumber.prototype.valueOf; // Alias.

    /**
     * Returns the primitive value of the `TinyNumber`.
     * @returns {number} The native JavaScript number.
     */
    TinyNumber.prototype.valueOf = function () {
        return this.chunkValue;
    };
    TinyNumber.prototype.toJSNumber = TinyNumber.prototype.valueOf; // Alias.

    /**
     * Parses a string into a `LargeNumber` or `TinyNumber` instance.
     * Handles standard decimal strings, scientific notation, and validates integer format.
     * @param {string} stringValue The string to parse.
     * @returns {LargeNumber|TinyNumber} The parsed number.
     * @throws {Error} If the string is not a valid integer representation.
     */
    function parseStringValue(stringValue) {
        // Quick check for small integers that fit native JS numbers.
        if (canFitInNative(+stringValue)) {
            const num = +stringValue;
            if (num === truncateTowardZero(num)) return new TinyNumber(num);
            // If it's a float, it's not a valid integer for this library.
            throw new Error(`Invalid integer: '${stringValue}' contains a fractional part.`);
        }

        let isNegative = false;
        let workingString = stringValue;

        // Handle leading minus sign.
        if (workingString[0] === "-") {
            isNegative = true;
            workingString = workingString.slice(1);
        }

        // Handle scientific notation (e.g., "1.23e+5").
        const scientificNotationParts = workingString.split(/e/i);
        if (scientificNotationParts.length > 2) {
            throw new Error(`Invalid integer: '${stringValue}' contains multiple 'e' characters.`);
        }

        if (scientificNotationParts.length === 2) {
            let exponentPart = scientificNotationParts[1];
            if (exponentPart[0] === "+") exponentPart = exponentPart.slice(1);
            const exponentValue = +exponentPart;

            if (!Number.isInteger(exponentValue) || !canFitInNative(exponentValue)) {
                throw new Error(`Invalid integer: exponent '${exponentValue}' is not a valid integer or is too large.`);
            }
            if (exponentValue < 0) {
                // Negative exponents imply fractional numbers (e.g., 123e-2 = 1.23).
                throw new Error(`Invalid integer: negative exponent '${exponentValue}' implies a non-integer value.`);
            }

            let mainNumberPart = scientificNotationParts[0];
            const decimalPointIndex = mainNumberPart.indexOf(".");
            if (decimalPointIndex >= 0) {
                // Adjust exponent for decimal point shift.
                exponentValue -= (mainNumberPart.length - decimalPointIndex - 1);
                mainNumberPart = mainNumberPart.slice(0, decimalPointIndex) + mainNumberPart.slice(decimalPointIndex + 1);
            }

            // Append zeros based on the adjusted exponent.
            mainNumberPart += "0".repeat(exponentValue);
            workingString = mainNumberPart;
        }

        // Final validation: ensure the string contains only digits.
        if (!/^[0-9]+$/.test(workingString)) {
            throw new Error(`Invalid integer: '${stringValue}' contains non-digit characters after processing.`);
        }

        // Convert the validated string into a chunk array.
        const digitChunks = [];
        const totalLength = workingString.length;
        const chunkSizeInDigits = CHUNK_POWER; // 7 digits per chunk.

        let currentEnd = totalLength;
        let currentStart = totalLength - chunkSizeInDigits;

        while (currentEnd > 0) {
            if (currentStart < 0) currentStart = 0;
            digitChunks.push(+(workingString.slice(currentStart, currentEnd)));
            currentEnd = currentStart;
            currentStart -= chunkSizeInDigits;
        }
        removeLeadingZeros(digitChunks); // Clean up any potential leading zeros.

        return new LargeNumber(digitChunks, isNegative);
    }

    /**
     * Parses a JavaScript number into a `LargeNumber` or `TinyNumber` instance.
     * @param {number} numericValue The number to parse.
     * @returns {LargeNumber|TinyNumber} The parsed number.
     * @throws {Error} If the number is not an integer.
     */
    function parseNumberValue(numericValue) {
        if (!Number.isInteger(numericValue)) {
            throw new Error(`'${numericValue}' is not an integer.`);
        }
        if (canFitInNative(numericValue)) {
            return new TinyNumber(numericValue);
        }
        // If it's a large integer beyond the safe limit, convert to string and parse.
        return parseStringValue(numericValue.toString());
    }

    /**
     * Universal parser: Converts various input types (number, string, or existing integer objects)
     * into a `LargeNumber` or `TinyNumber` instance.
     * @param {any} value The value to parse.
     * @returns {LargeNumber|TinyNumber} The parsed number instance.
     * @throws {Error} If the input type is unsupported.
     */
    function parseValue(value) {
        if (typeof value === "number") {
            return parseNumberValue(value);
        }
        if (typeof value === "string") {
            return parseStringValue(value);
        }
        // If it's already an instance, return it directly.
        if (value instanceof LargeNumber || value instanceof TinyNumber) {
            return value;
        }
        // Handle objects that can be coerced to a primitive (e.g., `Date` objects).
        if (typeof value === 'object' && value !== null && typeof value.valueOf === 'function') {
            const primitiveValue = value.valueOf();
            if (typeof primitiveValue === 'number' || typeof primitiveValue === 'string') {
                return parseValue(primitiveValue);
            }
        }
        throw new Error(`Unsupported input type for number conversion: ${typeof value}`);
    }

    // --- Static Constants and Methods Initialization ---

    // Cache small integers (0-999) for performance, avoiding repeated object creation.
    const SMALL_INT_CACHE_LIMIT = 1000;
    for (let i = 0; i < SMALL_INT_CACHE_LIMIT; ++i) {
        createInteger[i] = new TinyNumber(i);
        if (i > 0) createInteger[-i] = new TinyNumber(-i);
    }

    // Define common integer constants for easy access.
    createInteger.ONE = createInteger[1];
    createInteger.ZERO = createInteger[0];
    createInteger.MINUS_ONE = createInteger[-1];

    // Expose utility functions as static methods on the `createInteger` object.
    createInteger.max = findMax;
    createInteger.min = findMin;
    createInteger.gcd = calculateGCD;
    createInteger.lcm = calculateLCM;
    createInteger.isInstance = function (obj) {
        return obj instanceof LargeNumber || obj instanceof TinyNumber;
    };
    createInteger.randBetween = generateRandomBetween;
    // Method to create an integer from a digit array in a specific base.
    createInteger.fromDigitArray = function (digits, base, isNegative) {
        // Ensure all input digits are parsed into integer objects first.
        const parsedDigits = digits.map(d => parseValue(d));
        const parsedBase = parseValue(base || 10); // Default base to 10.
        return parseBaseFromDigitArray(parsedDigits, parsedBase, isNegative);
    };

    return createInteger;
})(void 0); // `void 0` is a robust way to get the `undefined` primitive value.


// --- Main Application Logic ---
// This section processes input and applies a simple string pattern check.

/**
 * Processes the input string to check for a specific character pattern.
 * The pattern is: 3rd and 4th characters are identical, AND 5th and 6th characters are identical.
 * (Using 0-based indexing, this means index 2 == index 3, and index 4 == index 5).
 * @param {string} rawInput The raw string input, typically read from stdin.
 */
const processInput = (rawInput) => {
    // Input validation: Ensure `rawInput` is a string.
    if (typeof rawInput !== 'string') {
        console.error("Error: Input must be a string. Received type:", typeof rawInput);
        return; // Exit if input is invalid.
    }

    // Trim whitespace and split the input into lines. We only care about the first line.
    const inputLines = rawInput.trim().split("\n");

    // Guard clause: Check if the first line exists and is long enough.
    // We need at least 6 characters for indices 2, 3, 4, 5.
    if (inputLines.length === 0 || inputLines[0].length < 6) {
        console.log("Input string is too short or empty. Expected at least 6 characters on the first line for pattern check.");
        return;
    }

    // Convert the first line into an array of characters for easy indexing.
    const firstLineCharacters = inputLines[0].split('');

    // Extract the specific characters required for the pattern check.
    const charAtIdx2 = firstLineCharacters[2];
    const charAtIdx3 = firstLineCharacters[3];
    const charAtIdx4 = firstLineCharacters[4];
    const charAtIdx5 = firstLineCharacters[5];

    // Evaluate the pattern conditions.
    const areThirdAndFourthCharsSame = (charAtIdx2 === charAtIdx3);
    const areFifthAndSixthCharsSame = (charAtIdx4 === charAtIdx5);

    // Output the result based on the combined conditions.
    if (areThirdAndFourthCharsSame && areFifthAndSixthCharsSame) {
        console.log('Yes, the specific character pattern was found!');
    } else {
        console.log('No, the specified character pattern does not match.');
    }
};

// Execute the main application logic by reading input from standard input.
// This assumes a Node.js environment where `require('fs')` and `/dev/stdin` are available.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));