"use strict";

const largeNumUtil = (function(undefValue) {
    // Core constants for the arbitrary-precision arithmetic system
    const RADIX_BASE = 1e7; // Each chunk represents up to 10^7
    const RADIX_LOG = 7;    // Number of decimal digits per chunk (log10(1e7))
    const JS_MAX_SAFE_INTEGER = 9007199254740992; // Max safe integer in JavaScript
    const JS_SAFE_INTEGER_PARTS = decomposeNative(JS_MAX_SAFE_INTEGER); // JS_MAX_SAFE_INTEGER broken into RADIX_BASE chunks
    const LOG_JS_MAX_SAFE_INTEGER = Math.log(JS_MAX_SAFE_INTEGER); // Logarithm of max safe integer

    /**
     * Base constructor for all numerical entities.
     * @param {number|string|LargeNumber|SmallNumber} initialValue - The value to parse.
     * @param {number} inputRadix - Optional radix for string parsing.
     * @returns {NumericalBase} An instance of LargeNumber or SmallNumber.
     */
    function NumericalBase(initialValue, inputRadix) {
        // If no value provided, return the static zero instance.
        if (typeof initialValue === "undefined") {
            return NumericalBase[0];
        }
        // If a radix is provided, parse the value accordingly.
        if (typeof inputRadix !== "undefined") {
            return +inputRadix === 10 ? processInput(initialValue) : processBaseString(initialValue, inputRadix);
        }
        // Otherwise, process the input value directly.
        return processInput(initialValue);
    }

    /**
     * Represents a large number, stored as an array of chunks.
     * @param {Array<number>} chunkArray - Array of number chunks.
     * @param {boolean} isNegative - True if the number is negative.
     */
    function LargeNumber(chunkArray, isNegative) {
        this.chunkData = chunkArray;
        this.isNegative = isNegative;
        this.isCompact = false; // Flag to indicate it's not a SmallNumber
    }
    // Inherit from NumericalBase
    LargeNumber.prototype = Object.create(NumericalBase.prototype);
    Object.defineProperty(LargeNumber.prototype, 'constructor', { value: LargeNumber, enumerable: false, writable: true });


    /**
     * Represents a small number that fits within JavaScript's safe integer range.
     * @param {number} numValue - The native JavaScript number value.
     */
    function SmallNumber(numValue) {
        this.numValue = numValue;
        this.isNegative = numValue < 0;
        this.isCompact = true; // Flag to indicate it's a SmallNumber
    }
    // Inherit from NumericalBase
    SmallNumber.prototype = Object.create(NumericalBase.prototype);
    Object.defineProperty(SmallNumber.prototype, 'constructor', { value: SmallNumber, enumerable: false, writable: true });

    /**
     * Checks if a native JavaScript number is within the safe integer range.
     * @param {number} n - The number to check.
     * @returns {boolean} True if the number is precise, false otherwise.
     */
    function isWithinJsRange(n) {
        return -JS_MAX_SAFE_INTEGER < n && n < JS_MAX_SAFE_INTEGER;
    }

    /**
     * Converts a small native number into an array of RADIX_BASE chunks.
     * @param {number} n - The small number.
     * @returns {Array<number>} An array of chunks.
     */
    function decomposeNative(n) {
        // Optimizations for numbers that fit within one or two chunks
        if (n < RADIX_BASE) {
            return [n];
        }
        if (n < 1e14) { // Up to 10^14, fits in two chunks (1e7 * 1e7)
            return [n % RADIX_BASE, Math.floor(n / RADIX_BASE)];
        }
        // For larger numbers, up to JS_MAX_SAFE_INTEGER, it fits in three chunks
        return [n % RADIX_BASE, Math.floor(n / RADIX_BASE) % RADIX_BASE, Math.floor(n / 1e14)];
    }

    /**
     * Reconstructs a small number from an array of RADIX_BASE chunks.
     * @param {Array<number>} chunkArr - The array of chunks.
     * @returns {number|Array<number>} The reconstructed number if small, or the trimmed array if large.
     */
    function recomposeSmall(chunkArr) {
        normalizeChunks(chunkArr); // Remove leading zeros
        const len = chunkArr.length;

        // If the number of chunks is small and its magnitude is within JS_MAX_SAFE_INTEGER
        if (len < 4 && compareMagnitude(chunkArr, JS_SAFE_INTEGER_PARTS) < 0) {
            switch (len) {
                case 0: return 0;
                case 1: return chunkArr[0];
                case 2: return chunkArr[0] + chunkArr[1] * RADIX_BASE;
                default: return chunkArr[0] + (chunkArr[1] + chunkArr[2] * RADIX_BASE) * RADIX_BASE;
            }
        }
        return chunkArr; // Return the array if it's too large to be a small number
    }

    /**
     * Removes leading zero chunks from a numerical chunk array.
     * @param {Array<number>} chunkVec - The array of chunks to trim.
     */
    function normalizeChunks(chunkVec) {
        let idx = chunkVec.length;
        // Iterate backwards to find the first non-zero chunk
        while (idx > 0 && chunkVec[--idx] === 0);
        chunkVec.length = idx + 1; // Adjust length to remove trailing zeros
    }

    /**
     * Creates a new array initialized with zeros.
     * @param {number} arrayLength - The desired length of the array.
     * @returns {Array<number>} A new array filled with zeros.
     */
    function initZeroArray(arrayLength) {
        const newArr = new Array(arrayLength);
        for (let k = 0; k < arrayLength; ++k) {
            newArr[k] = 0;
        }
        return newArr;
    }

    /**
     * Truncates a number, rounding towards zero.
     * @param {number} val - The number to truncate.
     * @returns {number} The truncated integer.
     */
    function floorOrCeil(val) {
        return val > 0 ? Math.floor(val) : Math.ceil(val);
    }

    /**
     * Adds two chunk arrays (representing positive numbers).
     * Assumes a.length >= b.length.
     * @param {Array<number>} arrA - First chunk array.
     * @param {Array<number>} arrB - Second chunk array.
     * @returns {Array<number>} The sum as a new chunk array.
     */
    function sumChunks(arrA, arrB) {
        const lenA = arrA.length, lenB = arrB.length;
        const result = new Array(lenA);
        let carry = 0;
        let currentSum;
        let i = 0;

        // Add corresponding chunks from both arrays
        for (; i < lenB; ++i) {
            currentSum = arrA[i] + arrB[i] + carry;
            carry = currentSum >= RADIX_BASE ? 1 : 0;
            result[i] = currentSum - carry * RADIX_BASE;
        }

        // Add remaining chunks from arrA with carry
        while (i < lenA) {
            currentSum = arrA[i] + carry;
            carry = currentSum === RADIX_BASE ? 1 : 0;
            result[i++] = currentSum - carry * RADIX_BASE;
        }

        // If there's a final carry, append it
        if (carry > 0) {
            result.push(carry);
        }
        return result;
    }

    /**
     * Flexible addition for two chunk arrays, handling different lengths.
     * @param {Array<number>} arrA - First chunk array.
     * @param {Array<number>} arrB - Second chunk array.
     * @returns {Array<number>} The sum as a new chunk array.
     */
    function flexiSum(arrA, arrB) {
        return arrA.length >= arrB.length ? sumChunks(arrA, arrB) : sumChunks(arrB, arrA);
    }

    /**
     * Adds a small number (carry) to a chunk array.
     * Used for operations like adding 1 or a constant.
     * @param {Array<number>} arr - The chunk array.
     * @param {number} smallVal - The small integer to add (can be negative for subtraction).
     * @returns {Array<number>} The result as a new chunk array.
     */
    function sumSmallVal(arr, smallVal) {
        const len = arr.length;
        const result = new Array(len);
        let currentCarry = smallVal;
        let currentSum;
        let i = 0;

        // Add smallVal to each chunk, propagating carry
        for (; i < len; ++i) {
            currentSum = arr[i] + currentCarry;
            currentCarry = floorOrCeil(currentSum / RADIX_BASE); // New carry
            result[i] = currentSum % RADIX_BASE; // Remainder is the new chunk value
        }

        // Propagate any remaining carry
        while (currentCarry !== 0) {
            result[i++] = currentCarry % RADIX_BASE;
            currentCarry = floorOrCeil(currentCarry / RADIX_BASE);
        }
        return result;
    }

    // Prototype method for addition on LargeNumber
    LargeNumber.prototype.plusOp = function(otherValue) {
        const otherNum = processInput(otherValue);
        // If signs are different, convert to subtraction
        if (this.isNegative !== otherNum.isNegative) {
            return this.minusOp(otherNum.negate());
        }
        const valA = this.chunkData;
        const valB = otherNum.chunkData;

        // Optimize for small number addition
        if (otherNum.isCompact) {
            return new LargeNumber(sumSmallVal(valA, Math.abs(otherNum.numValue)), this.isNegative);
        }
        return new LargeNumber(flexiSum(valA, valB), this.isNegative);
    };
    LargeNumber.prototype.add = LargeNumber.prototype.plusOp; // Alias

    // Prototype method for addition on SmallNumber
    SmallNumber.prototype.plusOp = function(otherValue) {
        const otherNum = processInput(otherValue);
        const myVal = this.numValue;

        // If signs are different, convert to subtraction
        if (myVal < 0 !== otherNum.isNegative) {
            return this.minusOp(otherNum.negate());
        }
        const otherVal = otherNum.numValue;

        // If both are small, perform native addition if precise
        if (otherNum.isCompact) {
            if (isWithinJsRange(myVal + otherVal)) {
                return new SmallNumber(myVal + otherVal);
            }
            // If sum overflows JS safe integer, convert other to chunks
            return new LargeNumber(sumSmallVal(decomposeNative(Math.abs(myVal)), Math.abs(otherVal)), myVal < 0);
        }
        // If one is small and other is large, convert small to chunks and use LargeNumber logic
        return new LargeNumber(sumSmallVal(otherNum.chunkData, Math.abs(myVal)), myVal < 0);
    };
    SmallNumber.prototype.add = SmallNumber.prototype.plusOp; // Alias

    /**
     * Subtracts chunk array B from chunk array A.
     * Assumes A >= B (magnitude-wise).
     * @param {Array<number>} arrA - The minuend chunk array.
     * @param {Array<number>} arrB - The subtrahend chunk array.
     * @returns {Array<number>} The difference as a new chunk array.
     */
    function diffChunks(arrA, arrB) {
        const lenA = arrA.length, lenB = arrB.length;
        const result = new Array(lenA);
        let borrow = 0;
        let difference;
        let i = 0;

        // Subtract chunks, propagating borrow
        for (; i < lenB; ++i) {
            difference = arrA[i] - borrow - arrB[i];
            if (difference < 0) {
                difference += RADIX_BASE;
                borrow = 1;
            } else {
                borrow = 0;
            }
            result[i] = difference;
        }

        // Continue with remaining chunks of arrA
        for (; i < lenA; ++i) {
            difference = arrA[i] - borrow;
            if (difference < 0) {
                difference += RADIX_BASE;
            } else {
                result[i++] = difference; // If no borrow, just assign and break
                break;
            }
            result[i] = difference;
        }

        // Fill any remaining chunks from arrA (should be no borrow by now)
        for (; i < lenA; ++i) {
            result[i] = arrA[i];
        }

        normalizeChunks(result);
        return result;
    }

    /**
     * Flexible subtraction for two chunk arrays, handling signs and magnitudes.
     * @param {Array<number>} arrA - First chunk array.
     * @param {Array<number>} arrB - Second chunk array.
     * @param {boolean} initialSign - The sign if `arrA >= arrB` (magnitude).
     * @returns {LargeNumber|SmallNumber} The result of the subtraction.
     */
    function flexiDiff(arrA, arrB, initialSign) {
        let valueResult;
        let finalSign = initialSign;

        // Compare magnitudes to determine which array is larger
        if (compareMagnitude(arrA, arrB) >= 0) {
            valueResult = diffChunks(arrA, arrB);
        } else {
            valueResult = diffChunks(arrB, arrA);
            finalSign = !initialSign; // Flip sign if B was larger
        }

        const smallResult = recomposeSmall(valueResult);
        if (typeof smallResult === "number") {
            if (finalSign) {
                smallResult = -smallResult;
            }
            return new SmallNumber(smallResult);
        }
        return new LargeNumber(smallResult, finalSign);
    }

    /**
     * Subtracts a small number from a chunk array.
     * @param {Array<number>} arr - The chunk array.
     * @param {number} smallVal - The small integer to subtract.
     * @param {boolean} isNegativeSign - The sign of the original `arr` (minuend).
     * @returns {LargeNumber|SmallNumber} The result of the subtraction.
     */
    function diffSmallVal(arr, smallVal, isNegativeSign) {
        const len = arr.length;
        const result = new Array(len);
        let currentCarry = -smallVal; // Treat subtraction as adding a negative carry
        let difference;
        let i = 0;

        // Perform subtraction with carry propagation
        for (; i < len; ++i) {
            difference = arr[i] + currentCarry;
            currentCarry = floorOrCeil(difference / RADIX_BASE);
            difference %= RADIX_BASE;
            result[i] = difference < 0 ? difference + RADIX_BASE : difference; // Ensure chunk is positive
        }

        const smallResult = recomposeSmall(result);
        if (typeof smallResult === "number") {
            if (isNegativeSign) {
                smallResult = -smallResult;
            }
            return new SmallNumber(smallResult);
        }
        return new LargeNumber(smallResult, isNegativeSign);
    }

    // Prototype method for subtraction on LargeNumber
    LargeNumber.prototype.minusOp = function(otherValue) {
        const otherNum = processInput(otherValue);
        // If signs are different, convert to addition
        if (this.isNegative !== otherNum.isNegative) {
            return this.plusOp(otherNum.negate());
        }
        const valA = this.chunkData;
        const valB = otherNum.chunkData;

        // Optimize for small number subtraction
        if (otherNum.isCompact) {
            return diffSmallVal(valA, Math.abs(otherNum.numValue), this.isNegative);
        }
        return flexiDiff(valA, valB, this.isNegative);
    };
    LargeNumber.prototype.subtract = LargeNumber.prototype.minusOp; // Alias

    // Prototype method for subtraction on SmallNumber
    SmallNumber.prototype.minusOp = function(otherValue) {
        const otherNum = processInput(otherValue);
        const myVal = this.numValue;

        // If signs are different, convert to addition
        if (myVal < 0 !== otherNum.isNegative) {
            return this.plusOp(otherNum.negate());
        }
        const otherVal = otherNum.numValue;

        // If both are small, perform native subtraction
        if (otherNum.isCompact) {
            return new SmallNumber(myVal - otherVal);
        }
        // If one is small and other is large, convert small to chunks and use LargeNumber logic
        // Note: The order of operands is reversed here, and sign adjusted
        return diffSmallVal(otherNum.chunkData, Math.abs(myVal), myVal >= 0);
    };
    SmallNumber.prototype.subtract = SmallNumber.prototype.minusOp; // Alias

    // Negation for LargeNumber: just flip the sign flag
    LargeNumber.prototype.negate = function() {
        return new LargeNumber(this.chunkData, !this.isNegative);
    };

    // Negation for SmallNumber: negate value and flip sign flag
    SmallNumber.prototype.negate = function() {
        const oldSign = this.isNegative;
        const compact = new SmallNumber(-this.numValue);
        compact.isNegative = !oldSign; // Explicitly set, though constructor does it too
        return compact;
    };

    // Absolute value for LargeNumber: create new instance with isNegative=false
    LargeNumber.prototype.absolute = function() {
        return new LargeNumber(this.chunkData, false);
    };
    LargeNumber.prototype.abs = LargeNumber.prototype.absolute; // Alias

    // Absolute value for SmallNumber: use Math.abs on native value
    SmallNumber.prototype.absolute = function() {
        return new SmallNumber(Math.abs(this.numValue));
    };
    SmallNumber.prototype.abs = SmallNumber.prototype.absolute; // Alias

    /**
     * Performs "long multiplication" of two chunk arrays.
     * This is the standard grade-school multiplication algorithm.
     * @param {Array<number>} arrA - First chunk array.
     * @param {Array<number>} arrB - Second chunk array.
     * @returns {Array<number>} The product as a new chunk array.
     */
    function longProduct(arrA, arrB) {
        const lenA = arrA.length, lenB = arrB.length;
        const result = initZeroArray(lenA + lenB); // Max possible length of product
        let product, carry;
        let chunkA, chunkB;

        // Iterate through each chunk of A and B
        for (let i = 0; i < lenA; ++i) {
            chunkA = arrA[i];
            carry = 0; // Reset carry for each row
            for (let j = 0; j < lenB; ++j) {
                chunkB = arrB[j];
                // Calculate product for current chunks + existing value in result + carry
                product = chunkA * chunkB + result[i + j] + carry;
                carry = floorOrCeil(product / RADIX_BASE);
                result[i + j] = product % RADIX_BASE;
            }
            result[i + lenB] += carry; // Add any remaining carry to the next position
        }
        normalizeChunks(result);
        return result;
    }

    /**
     * Multiplies a chunk array by a small native number.
     * @param {Array<number>} arr - The chunk array.
     * @param {number} smallVal - The small integer multiplier.
     * @returns {Array<number>} The product as a new chunk array.
     */
    function smallProduct(arr, smallVal) {
        const len = arr.length;
        const result = new Array(len);
        let carry = 0;
        let product;
        let i = 0;

        // Multiply each chunk by smallVal, propagating carry
        for (; i < len; ++i) {
            product = arr[i] * smallVal + carry;
            carry = floorOrCeil(product / RADIX_BASE);
            result[i] = product % RADIX_BASE;
        }

        // Propagate any remaining carry
        while (carry > 0) {
            result[i++] = carry % RADIX_BASE;
            carry = floorOrCeil(carry / RADIX_BASE);
        }
        return result;
    }

    /**
     * Pads an array with zeros on the right (effectively shifting left).
     * @param {Array<number>} arr - The array to pad.
     * @param {number} numZeros - The number of zeros to add.
     * @returns {Array<number>} A new array with zeros prepended.
     */
    function padZerosRight(arr, numZeros) {
        const newArr = [];
        while (numZeros-- > 0) {
            newArr.push(0);
        }
        return newArr.concat(arr);
    }

    /**
     * Implements Karatsuba multiplication for chunk arrays.
     * @param {Array<number>} xChunks - First chunk array.
     * @param {Array<number>} yChunks - Second chunk array.
     * @returns {Array<number>} The product as a new chunk array.
     */
    function karatsubaProduct(xChunks, yChunks) {
        const n = Math.max(xChunks.length, yChunks.length);

        // Base case: if arrays are small, use long multiplication
        if (n <= 30) { // Threshold for switching to long multiplication
            return longProduct(xChunks, yChunks);
        }

        // Split arrays into halves
        const m = Math.ceil(n / 2);
        const xLow = xChunks.slice(0, m);
        const xHigh = xChunks.slice(m);
        const yLow = yChunks.slice(0, m);
        const yHigh = yChunks.slice(m);

        // Recursive steps:
        // z0 = xLow * yLow
        const z0 = karatsubaProduct(xLow, yLow);
        // z2 = xHigh * yHigh
        const z2 = karatsubaProduct(xHigh, yHigh);
        // z1 = (xLow + xHigh) * (yLow + yHigh) - z0 - z2
        const xSum = flexiSum(xLow, xHigh);
        const ySum = flexiSum(yLow, yHigh);
        const z1 = karatsubaProduct(xSum, ySum);
        // z1 = z1 - z0 - z2
        const z1_sub = flexiDiff(flexiDiff(z1, z0, false).chunkData, z2, false).chunkData;

        // Combine results: result = z2 * BASE^(2m) + z1 * BASE^m + z0
        const finalProduct = flexiSum(flexiSum(z0, padZerosRight(z1_sub, m)), padZerosRight(z2, 2 * m));
        normalizeChunks(finalProduct);
        return finalProduct;
    }

    /**
     * Heuristic to decide whether to use Karatsuba multiplication.
     * @param {number} len1 - Length of the first chunk array.
     * @param {number} len2 - Length of the second chunk array.
     * @returns {boolean} True if Karatsuba is likely faster.
     */
    function shouldUseKaratsuba(len1, len2) {
        // This is an empirical formula, might need tuning
        return -0.012 * len1 - 0.012 * len2 + 15e-6 * len1 * len2 > 0;
    }

    /**
     * Multiplies a small native number by a chunk array.
     * @param {number} smallNativeVal - The small integer.
     * @param {Array<number>} chunkArr - The chunk array.
     * @param {boolean} resultIsNegative - The sign of the final product.
     * @returns {LargeNumber} The product as a LargeNumber.
     */
    function smallTimesChunked(smallNativeVal, chunkArr, resultIsNegative) {
        // If the small number itself can be represented as chunks within RADIX_BASE
        if (smallNativeVal < RADIX_BASE) {
            return new LargeNumber(smallProduct(chunkArr, smallNativeVal), resultIsNegative);
        }
        // Otherwise, convert the small number to chunks and use long multiplication
        return new LargeNumber(longProduct(chunkArr, decomposeNative(smallNativeVal)), resultIsNegative);
    }

    // Prototype method for multiplication on LargeNumber
    LargeNumber.prototype.timesOp = function(otherValue) {
        const otherNum = processInput(otherValue);
        const valA = this.chunkData;
        const valB = otherNum.chunkData;
        const finalSign = this.isNegative !== otherNum.isNegative; // XOR for sign

        // Handle special cases for small multipliers
        if (otherNum.isCompact) {
            const bVal = otherNum.numValue;
            if (bVal === 0) return NumericalBase[0];
            if (bVal === 1) return this;
            if (bVal === -1) return this.negate();
            const absB = Math.abs(bVal);
            return smallTimesChunked(absB, valA, finalSign);
        }

        // Decide between Karatsuba and long multiplication
        if (shouldUseKaratsuba(valA.length, valB.length)) {
            return new LargeNumber(karatsubaProduct(valA, valB), finalSign);
        }
        return new LargeNumber(longProduct(valA, valB), finalSign);
    };
    LargeNumber.prototype.multiply = LargeNumber.prototype.timesOp; // Alias

    // Helper for SmallNumber multiplication by another SmallNumber
    SmallNumber.prototype._multiplyBySmall = function(otherSmallNum) {
        // If the product fits within JS safe integer, perform native multiplication
        if (isWithinJsRange(otherSmallNum.numValue * this.numValue)) {
            return new SmallNumber(otherSmallNum.numValue * this.numValue);
        }
        // Otherwise, convert to chunked multiplication
        return smallTimesChunked(
            Math.abs(otherSmallNum.numValue),
            decomposeNative(Math.abs(this.numValue)),
            this.isNegative !== otherSmallNum.isNegative
        );
    };

    // Helper for LargeNumber multiplication by a SmallNumber
    LargeNumber.prototype._multiplyBySmall = function(otherSmallNum) {
        const bVal = otherSmallNum.numValue;
        if (bVal === 0) return NumericalBase[0];
        if (bVal === 1) return this;
        if (bVal === -1) return this.negate();
        return smallTimesChunked(Math.abs(bVal), this.chunkData, this.isNegative !== otherSmallNum.isNegative);
    };

    // Prototype method for multiplication on SmallNumber
    SmallNumber.prototype.timesOp = function(otherValue) {
        // Delegate to the appropriate helper based on the type of `otherValue`
        return processInput(otherValue)._multiplyBySmall(this);
    };
    SmallNumber.prototype.multiply = SmallNumber.prototype.timesOp; // Alias

    /**
     * Calculates the square of a chunk array (number multiplied by itself).
     * Uses a specialized algorithm for efficiency.
     * @param {Array<number>} arr - The chunk array.
     * @returns {Array<number>} The square as a new chunk array.
     */
    function selfProduct(arr) {
        const len = arr.length;
        const result = initZeroArray(len + len);
        let product, carry;
        let chunkI, chunkJ;

        for (let i = 0; i < len; ++i) {
            chunkI = arr[i];
            carry = 0; // Reset carry for each row
            // Calculate diagonal and upper triangle part
            for (let j = i; j < len; ++j) {
                chunkJ = arr[j];
                // For i == j, it's chunkI * chunkI. For i != j, it's 2 * chunkI * chunkJ
                product = (i === j ? chunkI * chunkJ : 2 * chunkI * chunkJ) + result[i + j] + carry;
                carry = floorOrCeil(product / RADIX_BASE);
                result[i + j] = product % RADIX_BASE;
            }
            result[i + len] += carry; // Add any remaining carry
        }
        normalizeChunks(result);
        return result;
    }

    // Prototype method for squaring on LargeNumber
    LargeNumber.prototype.square = function() {
        return new LargeNumber(selfProduct(this.chunkData), false); // Square is always positive
    };

    // Prototype method for squaring on SmallNumber
    SmallNumber.prototype.square = function() {
        const val = this.numValue * this.numValue;
        if (isWithinJsRange(val)) {
            return new SmallNumber(val);
        }
        // If square overflows, convert to chunked squaring
        return new LargeNumber(selfProduct(decomposeNative(Math.abs(this.numValue))), false);
    };

    /**
     * Division and remainder using "Newton-Raphson-like" method (Algorithm 1 from Knuth).
     * More efficient for very large numbers.
     * @param {Array<number>} dividendChunks - The dividend.
     * @param {Array<number>} divisorChunks - The divisor.
     * @returns {[Array<number>, Array<number>]} An array containing [quotient, remainder] as chunk arrays.
     */
    function divideAndRemainderLong(dividendChunks, divisorChunks) {
        const lenDividend = dividendChunks.length, lenDivisor = divisorChunks.length;
        const quotientResult = initZeroArray(lenDivisor); // Initialize quotient
        // Scale dividend and divisor to make divisor's MSB large
        const scalingFactor = Math.ceil(RADIX_BASE / (2 * divisorChunks[lenDivisor - 1]));
        let scaledRemainder = smallProduct(dividendChunks, scalingFactor);
        let scaledDivisor = smallProduct(divisorChunks, scalingFactor);
        let qDigit, shiftAmount, currentCarry, currentBorrow, i, l, q;

        // Ensure scaledRemainder has enough space for potential overflow
        if (scaledRemainder.length <= lenDividend) {
            scaledRemainder.push(0);
        }
        scaledDivisor.push(0); // Pad scaledDivisor for easier indexing

        const divisorMSD = scaledDivisor[lenDivisor - 1]; // Most significant digit of scaled divisor

        // Iterate from most significant position down
        for (shiftAmount = lenDividend - lenDivisor; shiftAmount >= 0; --shiftAmount) {
            qDigit = RADIX_BASE - 1; // Initial guess for quotient digit

            // Refine initial guess if MSBs don't match
            if (scaledRemainder[shiftAmount + lenDivisor] !== divisorMSD) {
                qDigit = floorOrCeil((scaledRemainder[shiftAmount + lenDivisor] * RADIX_BASE + scaledRemainder[shiftAmount + lenDivisor - 1]) / divisorMSD);
            }

            currentCarry = 0;
            currentBorrow = 0;
            l = scaledDivisor.length;

            // Perform trial subtraction (qDigit * scaledDivisor) from scaledRemainder
            for (i = 0; i < l; ++i) {
                currentCarry += qDigit * scaledDivisor[i];
                q = floorOrCeil(currentCarry / RADIX_BASE);
                currentBorrow += scaledRemainder[shiftAmount + i] - (currentCarry - q * RADIX_BASE);
                currentCarry = q;
                if (currentBorrow < 0) {
                    scaledRemainder[shiftAmount + i] = currentBorrow + RADIX_BASE;
                    currentBorrow = -1;
                } else {
                    scaledRemainder[shiftAmount + i] = currentBorrow;
                    currentBorrow = 0;
                }
            }

            // Adjust qDigit if trial subtraction resulted in a borrow
            while (currentBorrow !== 0) {
                qDigit -= 1;
                currentCarry = 0;
                for (i = 0; i < l; ++i) {
                    currentCarry += scaledRemainder[shiftAmount + i] - RADIX_BASE + scaledDivisor[i];
                    if (currentCarry < 0) {
                        scaledRemainder[shiftAmount + i] = currentCarry + RADIX_BASE;
                        currentCarry = 0;
                    } else {
                        scaledRemainder[shiftAmount + i] = currentCarry;
                        currentCarry = 1;
                    }
                }
                currentBorrow += currentCarry;
            }
            quotientResult[shiftAmount] = qDigit;
        }

        // Unscale the remainder
        scaledRemainder = divideAndRemainderSmall(scaledRemainder, scalingFactor)[0];
        return [recomposeSmall(quotientResult), recomposeSmall(scaledRemainder)];
    }

    /**
     * Division and remainder using a simpler, iterative subtraction method.
     * Less efficient for very large numbers, but simpler.
     * @param {Array<number>} dividendChunks - The dividend.
     * @param {Array<number>} divisorChunks - The divisor.
     * @returns {[Array<number>, Array<number>]} An array containing [quotient, remainder] as chunk arrays.
     */
    function divideAndRemainderShort(dividendChunks, divisorChunks) {
        let lenDividend = dividendChunks.length, lenDivisor = divisorChunks.length;
        const quotientParts = [];
        let currentPartialDividend = [];
        let currentGuess, xLen, highX, highY, checkResult;

        // Iterate through dividend chunks from MSB to LSB
        while (lenDividend > 0) {
            currentPartialDividend.unshift(dividendChunks[--lenDividend]); // Take next chunk
            normalizeChunks(currentPartialDividend); // Trim leading zeros

            // If current partial dividend is smaller than divisor, quotient digit is 0
            if (compareMagnitude(currentPartialDividend, divisorChunks) < 0) {
                quotientParts.push(0);
                continue;
            }

            xLen = currentPartialDividend.length;
            highX = currentPartialDividend[xLen - 1] * RADIX_BASE + (currentPartialDividend[xLen - 2] || 0);
            highY = divisorChunks[lenDivisor - 1] * RADIX_BASE + (divisorChunks[lenDivisor - 2] || 0);

            // Adjust highX if currentPartialDividend is longer than divisor (to account for potential extra digit)
            if (xLen > lenDivisor) {
                highX = (highX + 1) * RADIX_BASE;
            }

            // Initial guess for quotient digit
            currentGuess = Math.ceil(highX / highY);

            // Refine guess by trial multiplication and subtraction
            do {
                checkResult = smallProduct(divisorChunks, currentGuess);
                if (compareMagnitude(checkResult, currentPartialDividend) <= 0) break; // Guess is good
                currentGuess--;
            } while (currentGuess);

            quotientParts.push(currentGuess);
            currentPartialDividend = diffChunks(currentPartialDividend, checkResult); // Update remainder
        }

        quotientParts.reverse(); // Reverse to get correct order
        return [recomposeSmall(quotientParts), recomposeSmall(currentPartialDividend)];
    }

    /**
     * Divides a chunk array by a small native number.
     * @param {Array<number>} chunkVec - The chunk array (dividend).
     * @param {number} smallDivisor - The small integer divisor.
     * @returns {[Array<number>, number]} An array containing [quotient_chunks, remainder_native].
     */
    function divideAndRemainderSmall(chunkVec, smallDivisor) {
        const len = chunkVec.length;
        const quotientChunks = initZeroArray(len);
        let remainder = 0;
        let currentDividend;
        let q;

        // Perform long division from most significant chunk
        for (let i = len - 1; i >= 0; --i) {
            currentDividend = remainder * RADIX_BASE + chunkVec[i];
            q = floorOrCeil(currentDividend / smallDivisor);
            remainder = currentDividend - q * smallDivisor;
            quotientChunks[i] = q | 0; // Ensure integer
        }
        return [quotientChunks, remainder | 0]; // Remainder is always a small integer
    }

    /**
     * Flexible division and remainder, handling different types and magnitudes.
     * @param {LargeNumber|SmallNumber} dividendNum - The dividend.
     * @param {LargeNumber|SmallNumber} divisorNum - The divisor.
     * @returns {[LargeNumber|SmallNumber, LargeNumber|SmallNumber]} An array containing [quotient, remainder].
     */
    function flexibleDivideAndRemainder(dividendNum, divisorNum) {
        const dividendVal = dividendNum.chunkData;
        const divisorVal = divisorNum.chunkData;
        let quotientResult;

        if (divisorNum.isZero()) {
            throw new Error("Cannot divide by zero");
        }

        // Optimize for SmallNumber operations
        if (dividendNum.isCompact) {
            if (divisorNum.isCompact) {
                return [
                    new SmallNumber(floorOrCeil(dividendNum.numValue / divisorNum.numValue)),
                    new SmallNumber(dividendNum.numValue % divisorNum.numValue)
                ];
            }
            return [NumericalBase[0], dividendNum]; // If small / large, quotient is 0, remainder is small
        }

        if (divisorNum.isCompact) {
            const bVal = divisorNum.numValue;
            if (bVal === 1) return [dividendNum, NumericalBase[0]];
            if (bVal === -1) return [dividendNum.negate(), NumericalBase[0]];

            const absB = Math.abs(bVal);
            if (absB < RADIX_BASE) {
                const [qChunks, remNative] = divideAndRemainderSmall(dividendVal, absB);
                const remainder = dividendNum.isNegative ? -remNative : remNative;
                const finalQuotient = recomposeSmall(qChunks);

                if (typeof finalQuotient === "number") {
                    const qSign = dividendNum.isNegative !== divisorNum.isNegative;
                    return [
                        new SmallNumber(qSign ? -finalQuotient : finalQuotient),
                        new SmallNumber(remainder)
                    ];
                }
                return [
                    new LargeNumber(finalQuotient, dividendNum.isNegative !== divisorNum.isNegative),
                    new SmallNumber(remainder)
                ];
            }
            // If divisor is small but too large for divideAndRemainderSmall, convert to chunks
            divisorNum = processInput(absB);
            divisorVal = divisorNum.chunkData;
        }

        // Compare magnitudes to handle cases where dividend < divisor
        const magnitudeComparison = compareMagnitude(dividendVal, divisorVal);
        if (magnitudeComparison === -1) {
            return [NumericalBase[0], dividendNum];
        }
        if (magnitudeComparison === 0) {
            return [NumericalBase[dividendNum.isNegative === divisorNum.isNegative ? 1 : -1], NumericalBase[0]];
        }

        // Choose division algorithm based on size
        if (dividendVal.length + divisorVal.length <= 200) { // Empirical threshold
            quotientResult = divideAndRemainderLong(dividendVal, divisorVal);
        } else {
            quotientResult = divideAndRemainderShort(dividendVal, divisorVal);
        }

        const quotient = quotientResult[0];
        const remainder = quotientResult[1];
        const qSign = dividendNum.isNegative !== divisorNum.isNegative;
        const rSign = dividendNum.isNegative;

        let finalQuotient, finalRemainder;

        if (typeof quotient === "number") {
            finalQuotient = new SmallNumber(qSign ? -quotient : quotient);
        } else {
            finalQuotient = new LargeNumber(quotient, qSign);
        }

        if (typeof remainder === "number") {
            finalRemainder = new SmallNumber(rSign ? -remainder : remainder);
        } else {
            finalRemainder = new LargeNumber(remainder, rSign);
        }

        return [finalQuotient, finalRemainder];
    }

    // Prototype method for divmod on LargeNumber
    LargeNumber.prototype.divmod = function(otherValue) {
        const result = flexibleDivideAndRemainder(this, processInput(otherValue));
        return { quotient: result[0], remainder: result[1] };
    };
    SmallNumber.prototype.divmod = LargeNumber.prototype.divmod; // SmallNumber inherits divmod

    // Prototype method for division on LargeNumber
    LargeNumber.prototype.divOp = function(otherValue) {
        return flexibleDivideAndRemainder(this, processInput(otherValue))[0];
    };
    LargeNumber.prototype.divide = LargeNumber.prototype.divOp; // Alias
    SmallNumber.prototype.divOp = SmallNumber.prototype.divide = LargeNumber.prototype.divOp; // SmallNumber inherits divide

    // Prototype method for modulo on LargeNumber
    LargeNumber.prototype.remOp = function(otherValue) {
        return flexibleDivideAndRemainder(this, processInput(otherValue))[1];
    };
    LargeNumber.prototype.mod = LargeNumber.prototype.remOp; // Alias
    SmallNumber.prototype.remOp = SmallNumber.prototype.mod = LargeNumber.prototype.remOp; // SmallNumber inherits mod

    // Prototype method for power on LargeNumber
    LargeNumber.prototype.powerOp = function(exponentValue) {
        const exponentNum = processInput(exponentValue);
        const baseVal = this.chunkData;
        const expVal = exponentNum.numValue;
        let resultValue;

        if (exponentNum.isZero()) return NumericalBase[1]; // x^0 = 1
        if (this.isZero()) return NumericalBase[0];        // 0^x = 0 (for x > 0)
        if (this.isUnit()) {                                // 1^x = 1, (-1)^x = 1 or -1
            if (this.equals(NumericalBase[1])) return NumericalBase[1];
            return exponentNum.isEven() ? NumericalBase[1] : NumericalBase[-1];
        }

        if (exponentNum.isNegative()) {
            return NumericalBase[0]; // For positive base and negative exponent, result is fractional (0 for integers)
        }
        if (!exponentNum.isCompact) {
            throw new Error(`The exponent ${exponentNum.toString()} is too large.`);
        }

        // If base is SmallNumber, check if native Math.pow can be used
        if (this.isCompact) {
            resultValue = Math.pow(this.numValue, expVal);
            if (isWithinJsRange(resultValue)) {
                return new SmallNumber(floorOrCeil(resultValue));
            }
        }

        // Binary exponentiation (exponentiation by squaring)
        let base = this;
        let result = NumericalBase[1];
        let currentExp = expVal;

        while (true) {
            if ((currentExp & 1) === 1) { // If exponent is odd
                result = result.timesOp(base);
                --currentExp;
            }
            if (currentExp === 0) break; // Done
            currentExp /= 2; // Halve exponent
            base = base.square(); // Square the base
        }
        return result;
    };
    LargeNumber.prototype.pow = LargeNumber.prototype.powerOp; // Alias
    SmallNumber.prototype.powerOp = LargeNumber.prototype.powerOp; // SmallNumber inherits pow

    // Prototype method for modular power on LargeNumber
    LargeNumber.prototype.modularPower = function(exponent, modulus) {
        exponent = processInput(exponent);
        modulus = processInput(modulus);

        if (modulus.isZero()) {
            throw new Error("Cannot take modular power with modulus 0");
        }

        let result = NumericalBase[1];
        let base = this.mod(modulus); // Reduce base modulo modulus

        // Apply modular exponentiation by squaring
        while (exponent.isPositive()) {
            if (base.isZero()) return NumericalBase[0]; // 0^exp mod N = 0
            if (exponent.isOdd()) {
                result = result.timesOp(base).mod(modulus);
            }
            exponent = exponent.divide(2);
            base = base.square().mod(modulus);
        }
        return result;
    };
    LargeNumber.prototype.modPow = LargeNumber.prototype.modularPower; // Alias
    SmallNumber.prototype.modularPower = LargeNumber.prototype.modularPower; // SmallNumber inherits modPow

    /**
     * Compares the absolute magnitudes of two chunk arrays.
     * @param {Array<number>} arrA - First chunk array.
     * @param {Array<number>} arrB - Second chunk array.
     * @returns {number} -1 if A < B, 0 if A == B, 1 if A > B.
     */
    function compareMagnitude(arrA, arrB) {
        if (arrA.length !== arrB.length) {
            return arrA.length > arrB.length ? 1 : -1;
        }
        // If lengths are equal, compare chunk by chunk from MSB to LSB
        for (let i = arrA.length - 1; i >= 0; --i) {
            if (arrA[i] !== arrB[i]) {
                return arrA[i] > arrB[i] ? 1 : -1;
            }
        }
        return 0; // Arrays are identical
    }

    // Prototype method for comparing absolute values on LargeNumber
    LargeNumber.prototype.compareMagnitudeWith = function(otherValue) {
        const otherNum = processInput(otherValue);
        // If other is small, current large number is always greater (unless other is 0)
        if (otherNum.isCompact) {
            return this.isZero() && otherNum.isZero() ? 0 : 1;
        }
        return compareMagnitude(this.chunkData, otherNum.chunkData);
    };
    LargeNumber.prototype.compareAbs = LargeNumber.prototype.compareMagnitudeWith; // Alias

    // Prototype method for comparing absolute values on SmallNumber
    SmallNumber.prototype.compareMagnitudeWith = function(otherValue) {
        const otherNum = processInput(otherValue);
        const myAbsVal = Math.abs(this.numValue);
        const otherAbsVal = Math.abs(otherNum.numValue); // Ensure other's value is abs too

        if (otherNum.isCompact) {
            return myAbsVal === otherAbsVal ? 0 : (myAbsVal > otherAbsVal ? 1 : -1);
        }
        return -1; // Small number is always smaller than a large number (magnitude-wise)
    };
    SmallNumber.prototype.compareAbs = SmallNumber.prototype.compareMagnitudeWith; // Alias

    // Prototype method for full comparison on LargeNumber
    LargeNumber.prototype.compareWith = function(otherValue) {
        if (otherValue === Infinity) return -1;
        if (otherValue === -Infinity) return 1;

        const otherNum = processInput(otherValue);
        const mySign = this.isNegative;
        const otherSign = otherNum.isNegative;

        // Different signs: negative < positive
        if (mySign !== otherSign) {
            return mySign ? -1 : 1;
        }

        // If other is small, and we are large, handle based on sign
        if (otherNum.isCompact) {
            return mySign ? -1 : 1; // If both negative, large number is smaller. If both positive, large number is larger.
        }

        // Same signs, compare magnitudes
        const magnitudeComparison = compareMagnitude(this.chunkData, otherNum.chunkData);
        return mySign ? -magnitudeComparison : magnitudeComparison; // Flip if negative
    };
    LargeNumber.prototype.compare = LargeNumber.prototype.compareWith; // Alias
    LargeNumber.prototype.compareTo = LargeNumber.prototype.compareWith; // Alias

    // Prototype method for full comparison on SmallNumber
    SmallNumber.prototype.compareWith = function(otherValue) {
        if (otherValue === Infinity) return -1;
        if (otherValue === -Infinity) return 1;

        const otherNum = processInput(otherValue);
        const myVal = this.numValue;
        const otherVal = otherNum.numValue;

        if (otherNum.isCompact) {
            return myVal === otherVal ? 0 : (myVal > otherVal ? 1 : -1);
        }

        // One is small, other is large. Compare based on signs.
        const mySign = this.isNegative;
        const otherSign = otherNum.isNegative;

        if (mySign !== otherSign) {
            return mySign ? -1 : 1;
        }
        // Both same sign, but one is small and one is large.
        // If positive, small < large. If negative, small > large (closer to zero).
        return mySign ? 1 : -1;
    };
    SmallNumber.prototype.compare = SmallNumber.prototype.compareWith; // Alias
    SmallNumber.prototype.compareTo = SmallNumber.prototype.compareWith; // Alias

    // Comparison aliases for both LargeNumber and SmallNumber prototypes
    LargeNumber.prototype.isEqualTo = SmallNumber.prototype.isEqualTo = function(v) { return this.compareWith(v) === 0; };
    LargeNumber.prototype.eq = SmallNumber.prototype.eq = LargeNumber.prototype.isEqualTo;

    LargeNumber.prototype.isNotEqualTo = SmallNumber.prototype.isNotEqualTo = function(v) { return this.compareWith(v) !== 0; };
    LargeNumber.prototype.neq = SmallNumber.prototype.neq = LargeNumber.prototype.isNotEqualTo;

    LargeNumber.prototype.isGreaterThan = SmallNumber.prototype.isGreaterThan = function(v) { return this.compareWith(v) > 0; };
    LargeNumber.prototype.gt = SmallNumber.prototype.gt = LargeNumber.prototype.isGreaterThan;

    LargeNumber.prototype.isLesserThan = SmallNumber.prototype.isLesserThan = function(v) { return this.compareWith(v) < 0; };
    LargeNumber.prototype.lt = SmallNumber.prototype.lt = LargeNumber.prototype.isLesserThan;

    LargeNumber.prototype.isGreaterOrEqual = SmallNumber.prototype.isGreaterOrEqual = function(v) { return this.compareWith(v) >= 0; };
    LargeNumber.prototype.geq = SmallNumber.prototype.geq = LargeNumber.prototype.isGreaterOrEqual;

    LargeNumber.prototype.isLesserOrEqual = SmallNumber.prototype.isLesserOrEqual = function(v) { return this.compareWith(v) <= 0; };
    LargeNumber.prototype.leq = SmallNumber.prototype.leq = LargeNumber.prototype.isLesserOrEqual;

    // Parity checks
    LargeNumber.prototype.isEven = function() { return (this.chunkData[0] & 1) === 0; };
    SmallNumber.prototype.isEven = function() { return (this.numValue & 1) === 0; };

    LargeNumber.prototype.isOdd = function() { return (this.chunkData[0] & 1) === 1; };
    SmallNumber.prototype.isOdd = function() { return (this.numValue & 1) === 1; };

    // Sign checks
    LargeNumber.prototype.isPositive = function() { return !this.isNegative; };
    SmallNumber.prototype.isPositive = function() { return this.numValue > 0; };

    LargeNumber.prototype.isNegative = function() { return this.isNegative; };
    SmallNumber.prototype.isNegative = function() { return this.numValue < 0; };

    // Special value checks
    LargeNumber.prototype.isUnit = function() { return false; }; // A large number can't be 1 or -1
    SmallNumber.prototype.isUnit = function() { return Math.abs(this.numValue) === 1; };

    LargeNumber.prototype.isZero = function() { return this.chunkData.length === 0 || (this.chunkData.length === 1 && this.chunkData[0] === 0); };
    SmallNumber.prototype.isZero = function() { return this.numValue === 0; };

    LargeNumber.prototype.isDivisibleBy = function(otherValue) {
        const otherNum = processInput(otherValue);
        const otherVal = otherNum.numValue;

        if (otherNum.isZero()) return false;
        if (otherNum.isUnit()) return true; // Divisible by 1 or -1
        if (otherNum.equals(NumericalBase[2])) return this.isEven(); // Optimization for 2

        return this.mod(otherNum).isZero();
    };
    SmallNumber.prototype.isDivisibleBy = LargeNumber.prototype.isDivisibleBy; // SmallNumber inherits isDivisibleBy

    /**
     * Checks if a number is a basic prime (2, 3, 5) or easily determined composite.
     * @param {LargeNumber|SmallNumber} num - The number to check.
     * @returns {boolean|undefined} True/False if determined, undefined otherwise.
     */
    function isBasicPrimeCheck(num) {
        const absNum = num.absolute();
        if (absNum.isUnit()) return false;
        if (absNum.equals(2) || absNum.equals(3) || absNum.equals(5)) return true;
        if (absNum.isEven() || absNum.isDivisibleBy(3) || absNum.isDivisibleBy(5)) return false;
        if (absNum.isLesserThan(25)) return true; // Numbers < 25 not caught by 2,3,5 checks are prime (7,11,13,17,19,23)
        return undefValue; // Cannot determine with basic checks
    }

    // Prototype method for primality test on LargeNumber (Miller-Rabin)
    LargeNumber.prototype.isPrime = function() {
        const basicCheckResult = isBasicPrimeCheck(this);
        if (basicCheckResult !== undefValue) return basicCheckResult;

        const num = this.absolute();
        const numMinusOne = num.previous(); // n-1
        const trialPrimes = [2, 3, 5, 7, 11, 13, 17, 19]; // Small primes for Miller-Rabin
        let d = numMinusOne;
        let s = 0;

        // Find d and s such that n-1 = d * 2^s, where d is odd
        while (d.isEven()) {
            d = d.divide(2);
            s++;
        }

        // Miller-Rabin test for each trial prime
        for (let i = 0; i < trialPrimes.length; ++i) {
            let a = largeNumUtil(trialPrimes[i]);
            let x = a.modPow(d, num);

            if (x.equals(NumericalBase[1]) || x.equals(numMinusOne)) {
                continue; // Witness passes
            }

            let witnessPassed = false;
            for (let r = 0; r < s - 1; ++r) {
                x = x.square().mod(num);
                if (x.equals(numMinusOne)) {
                    witnessPassed = true;
                    break;
                }
            }
            if (!witnessPassed) return false; // Composite
        }
        return true; // Probably prime
    };
    SmallNumber.prototype.isPrime = LargeNumber.prototype.isPrime; // SmallNumber inherits isPrime

    // Prototype method for probable primality test on LargeNumber (Miller-Rabin with random bases)
    LargeNumber.prototype.isProbablePrime = function(iterations) {
        const basicCheckResult = isBasicPrimeCheck(this);
        if (basicCheckResult !== undefValue) return basicCheckResult;

        const num = this.absolute();
        const numMinusTwo = num.minusOp(NumericalBase[2]);
        const numMinusOne = num.previous();
        const numIterations = iterations === undefValue ? 5 : iterations;

        if (num.isLesserOrEqual(NumericalBase[1])) return false; // 0, 1 are not prime

        let d = numMinusOne;
        let s = 0;
        while (d.isEven()) {
            d = d.divide(2);
            s++;
        }

        for (let i = 0; i < numIterations; ++i) {
            const a = randomBetween(NumericalBase[2], numMinusTwo); // Pick random 'a' in [2, n-2]
            let x = a.modPow(d, num);

            if (x.equals(NumericalBase[1]) || x.equals(numMinusOne)) {
                continue;
            }

            let witnessPassed = false;
            for (let r = 0; r < s - 1; ++r) {
                x = x.square().mod(num);
                if (x.equals(numMinusOne)) {
                    witnessPassed = true;
                    break;
                }
            }
            if (!witnessPassed) return false;
        }
        return true;
    };
    SmallNumber.prototype.isProbablePrime = LargeNumber.prototype.isProbablePrime; // SmallNumber inherits isProbablePrime

    // Prototype method for modular inverse on LargeNumber (Extended Euclidean Algorithm)
    LargeNumber.prototype.modularInverse = function(modulus) {
        let t = largeNumUtil.zero, newT = largeNumUtil.one;
        let r = processInput(modulus), newR = this.absolute(); // Ensure positive
        let q, lastT, lastR;

        // Extended Euclidean Algorithm
        while (!newR.isZero()) {
            q = r.divide(newR);
            lastT = t;
            lastR = r;
            t = newT;
            r = newR;
            newT = lastT.minusOp(q.timesOp(newT));
            newR = lastR.minusOp(q.timesOp(newR));
        }

        // If gcd(this, modulus) is not 1, modular inverse does not exist
        if (!r.equals(1)) {
            throw new Error(`${this.toString()} and ${modulus.toString()} are not co-prime`);
        }

        // Adjust t to be positive if necessary
        if (t.compareWith(0) === -1) {
            t = t.plusOp(modulus);
        }

        // If original number was negative, invert result (a^-1 mod N = (N - (-a)^-1) mod N)
        if (this.isNegative()) {
            return modulus.minusOp(t); // (N - t) mod N
        }
        return t;
    };
    LargeNumber.prototype.modInv = LargeNumber.prototype.modularInverse; // Alias
    SmallNumber.prototype.modularInverse = LargeNumber.prototype.modularInverse; // SmallNumber inherits modInv

    // Prototype method for next number on LargeNumber
    LargeNumber.prototype.next = function() {
        const val = this.chunkData;
        if (this.isNegative) {
            return diffSmallVal(val, 1, this.isNegative); // Subtract 1 from magnitude if negative
        }
        return new LargeNumber(sumSmallVal(val, 1), this.isNegative);
    };

    // Prototype method for next number on SmallNumber
    SmallNumber.prototype.next = function() {
        const val = this.numValue;
        if (val + 1 < JS_MAX_SAFE_INTEGER) {
            return new SmallNumber(val + 1);
        }
        return new LargeNumber(JS_SAFE_INTEGER_PARTS, false); // Overflow to LargeNumber
    };

    // Prototype method for previous number on LargeNumber
    LargeNumber.prototype.previous = function() {
        const val = this.chunkData;
        if (this.isNegative) {
            return new LargeNumber(sumSmallVal(val, 1), true); // Add 1 to magnitude if negative (e.g., -5 -> -6)
        }
        return diffSmallVal(val, 1, this.isNegative);
    };

    // Prototype method for previous number on SmallNumber
    SmallNumber.prototype.previous = function() {
        const val = this.numValue;
        if (val - 1 > -JS_MAX_SAFE_INTEGER) {
            return new SmallNumber(val - 1);
        }
        return new LargeNumber(JS_SAFE_INTEGER_PARTS, true); // Underflow to LargeNumber (e.g., -MAX_INT-1)
    };

    // Precomputed powers of 2 for bitwise shifts
    const powersOfTwo = [1];
    while (2 * powersOfTwo[powersOfTwo.length - 1] <= RADIX_BASE) {
        powersOfTwo.push(2 * powersOfTwo[powersOfTwo.length - 1]);
    }
    const powers2Len = powersOfTwo.length;
    const highestPowerOf2 = powersOfTwo[powers2Len - 1];

    /**
     * Checks if the shift amount is a small, safe integer.
     * @param {number|string|LargeNumber} shiftAmount - The shift amount.
     * @returns {boolean} True if the shift amount is small enough.
     */
    function isShiftAmountCompact(shiftAmount) {
        return (typeof shiftAmount === "number" || typeof shiftAmount === "string") && +Math.abs(shiftAmount) <= RADIX_BASE || (shiftAmount instanceof LargeNumber && shiftAmount.chunkData.length <= 1);
    }

    // Prototype method for left bit shift on LargeNumber
    LargeNumber.prototype.shiftLeft = function(shiftAmount) {
        if (!isShiftAmountCompact(shiftAmount)) {
            throw new Error(`Shift amount ${String(shiftAmount)} is too large for shifting.`);
        }
        let n = +shiftAmount; // Ensure it's a number
        if (n < 0) return this.shiftRight(-n); // Negative shift left is shift right

        let currentResult = this;
        if (currentResult.isZero()) return currentResult;

        // Apply shifts in chunks of highestPowerOf2
        while (n >= powers2Len) {
            currentResult = currentResult.timesOp(highestPowerOf2);
            n -= (powers2Len - 1); // Adjust n by number of bits in highestPowerOf2
        }
        return currentResult.timesOp(powersOfTwo[n]); // Apply remaining shift
    };
    SmallNumber.prototype.shiftLeft = LargeNumber.prototype.shiftLeft; // SmallNumber inherits shiftLeft

    // Prototype method for right bit shift on LargeNumber
    LargeNumber.prototype.shiftRight = function(shiftAmount) {
        let divRemPair;
        if (!isShiftAmountCompact(shiftAmount)) {
            throw new Error(`Shift amount ${String(shiftAmount)} is too large for shifting.`);
        }
        let n = +shiftAmount;
        if (n < 0) return this.shiftLeft(-n); // Negative shift right is shift left

        let currentResult = this;
        // Apply shifts in chunks of highestPowerOf2
        while (n >= powers2Len) {
            if (currentResult.isZero() || (currentResult.isNegative() && currentResult.isUnit())) {
                return currentResult; // Shifting negative 1 right results in -1, 0 results in 0
            }
            divRemPair = flexibleDivideAndRemainder(currentResult, largeNumUtil(highestPowerOf2));
            // Adjust quotient for negative numbers (floor division)
            currentResult = divRemPair[1].isNegative() ? divRemPair[0].previous() : divRemPair[0];
            n -= (powers2Len - 1);
        }
        divRemPair = flexibleDivideAndRemainder(currentResult, largeNumUtil(powersOfTwo[n]));
        return divRemPair[1].isNegative() ? divRemPair[0].previous() : divRemPair[0];
    };
    SmallNumber.prototype.shiftRight = LargeNumber.prototype.shiftRight; // SmallNumber inherits shiftRight

    /**
     * Performs a bitwise operation (AND, OR, XOR) on two numbers.
     * @param {LargeNumber|SmallNumber} num1 - First operand.
     * @param {LargeNumber|SmallNumber} num2 - Second operand.
     * @param {function(number, number): number} operationFn - The bitwise function (e.g., `(a,b) => a & b`).
     * @returns {LargeNumber|SmallNumber} The result of the bitwise operation.
     */
    function performBitwiseOp(num1, num2, operationFn) {
        num2 = processInput(num2);

        // Handle two's complement for negative numbers
        const sign1 = num1.isNegative();
        const sign2 = num2.isNegative();
        let remaining1 = sign1 ? num1.not() : num1; // Invert and add 1 for two's complement
        let remaining2 = sign2 ? num2.not() : num2;

        const resultChunks = [];
        let chunk1 = 0, chunk2 = 0;
        let divMod1 = null, divMod2 = null;

        // Process chunks from LSB to MSB
        while (!remaining1.isZero() || !remaining2.isZero()) {
            divMod1 = flexibleDivideAndRemainder(remaining1, largeNumUtil(highestPowerOf2));
            chunk1 = divMod1[1].toJSNumber();
            if (sign1) {
                chunk1 = highestPowerOf2 - 1 - chunk1; // Invert chunk for negative numbers
            }

            divMod2 = flexibleDivideAndRemainder(remaining2, largeNumUtil(highestPowerOf2));
            chunk2 = divMod2[1].toJSNumber();
            if (sign2) {
                chunk2 = highestPowerOf2 - 1 - chunk2; // Invert chunk for negative numbers
            }

            remaining1 = divMod1[0];
            remaining2 = divMod2[0];
            resultChunks.push(operationFn(chunk1, chunk2));
        }

        // Determine final sign based on the operation and original signs
        let finalSum = operationFn(sign1 ? 1 : 0, sign2 ? 1 : 0) !== 0 ? largeNumUtil(-1) : largeNumUtil(0);

        // Reconstruct the number from result chunks
        for (let i = resultChunks.length - 1; i >= 0; --i) {
            finalSum = finalSum.timesOp(largeNumUtil(highestPowerOf2)).plusOp(largeNumUtil(resultChunks[i]));
        }
        return finalSum;
    }

    // Prototype method for bitwise NOT on LargeNumber (two's complement: ~x = -x - 1)
    LargeNumber.prototype.bitwiseNot = function() {
        return this.negate().previous();
    };
    LargeNumber.prototype.not = LargeNumber.prototype.bitwiseNot; // Alias
    SmallNumber.prototype.bitwiseNot = LargeNumber.prototype.bitwiseNot; // SmallNumber inherits not

    // Prototype method for bitwise AND on LargeNumber
    LargeNumber.prototype.bitwiseAnd = function(otherValue) {
        return performBitwiseOp(this, otherValue, (a, b) => a & b);
    };
    LargeNumber.prototype.and = LargeNumber.prototype.bitwiseAnd; // Alias
    SmallNumber.prototype.bitwiseAnd = LargeNumber.prototype.bitwiseAnd; // SmallNumber inherits and

    // Prototype method for bitwise OR on LargeNumber
    LargeNumber.prototype.bitwiseOr = function(otherValue) {
        return performBitwiseOp(this, otherValue, (a, b) => a | b);
    };
    LargeNumber.prototype.or = LargeNumber.prototype.bitwiseOr; // Alias
    SmallNumber.prototype.bitwiseOr = LargeNumber.prototype.bitwiseOr; // SmallNumber inherits or

    // Prototype method for bitwise XOR on LargeNumber
    LargeNumber.prototype.bitwiseXor = function(otherValue) {
        return performBitwiseOp(this, otherValue, (a, b) => a ^ b);
    };
    LargeNumber.prototype.xor = LargeNumber.prototype.bitwiseXor; // Alias
    SmallNumber.prototype.bitwiseXor = LargeNumber.prototype.bitwiseXor; // SmallNumber inherits xor

    // Constants for rough lowest-order bit calculation
    const LOW_ORDER_BIT_MASK_S = 1 << 30; // Mask for native number
    const LOW_ORDER_BIT_MASK_L = (RADIX_BASE & -RADIX_BASE) * (RADIX_BASE & -RADIX_BASE) | LOW_ORDER_BIT_MASK_S; // Mask for chunk array

    /**
     * Estimates the lowest order bit (LSB) of a number.
     * Used in GCD for performance.
     * @param {LargeNumber|SmallNumber} num - The number.
     * @returns {number} A rough estimate of the LSB.
     */
    function estimateLowestBit(num) {
        const val = num.chunkData;
        const x = typeof val === "number" ? val | LOW_ORDER_BIT_MASK_S : val[0] + val[1] * RADIX_BASE | LOW_ORDER_BIT_MASK_L;
        return x & -x; // Returns the lowest set bit (e.g., 8 for 8, 2 for 10)
    }

    /**
     * Calculates the integer logarithm of a value with respect to a base.
     * @param {LargeNumber|SmallNumber} value - The number.
     * @param {LargeNumber|SmallNumber} base - The base.
     * @returns {{p: LargeNumber|SmallNumber, e: number}} An object containing power and exponent.
     */
    function calcIntegerLog(value, base) {
        // If base is greater than or equal to value, recurse
        if (base.compareWith(value) <= 0) {
            const temp = calcIntegerLog(value, base.square());
            const p = temp.p;
            const e = temp.e;
            const t = p.timesOp(base);
            return t.compareWith(value) <= 0 ? { p: t, e: e * 2 + 1 } : { p: p, e: e * 2 };
        }
        return { p: largeNumUtil(1), e: 0 };
    }

    // Prototype method for bit length on LargeNumber
    LargeNumber.prototype.bitLength = function() {
        let num = this;
        // For negative numbers, bit length is usually defined for abs(n+1)
        if (num.compareWith(largeNumUtil(0)) < 0) {
            num = num.negate().minusOp(largeNumUtil(1));
        }
        if (num.isZero()) {
            return largeNumUtil(0);
        }
        // Calculate log base 2 and add 1
        return largeNumUtil(calcIntegerLog(num, largeNumUtil(2)).e).plusOp(largeNumUtil(1));
    };
    SmallNumber.prototype.bitLength = LargeNumber.prototype.bitLength; // SmallNumber inherits bitLength

    /**
     * Returns the larger of two numbers.
     * @param {LargeNumber|SmallNumber|number|string} a - First number.
     * @param {LargeNumber|SmallNumber|number|string} b - Second number.
     * @returns {LargeNumber|SmallNumber} The larger number.
     */
    function getLarger(a, b) {
        a = processInput(a);
        b = processInput(b);
        return a.isGreaterThan(b) ? a : b;
    }

    /**
     * Returns the smaller of two numbers.
     * @param {LargeNumber|SmallNumber|number|string} a - First number.
     * @param {LargeNumber|SmallNumber|number|string} b - Second number.
     * @returns {LargeNumber|SmallNumber} The smaller number.
     */
    function getSmaller(a, b) {
        a = processInput(a);
        b = processInput(b);
        return a.isLesserThan(b) ? a : b;
    }

    /**
     * Calculates the greatest common divisor (GCD) of two numbers.
     * Uses binary GCD algorithm for efficiency.
     * @param {LargeNumber|SmallNumber|number|string} a - First number.
     * @param {LargeNumber|SmallNumber|number|string} b - Second number.
     * @returns {LargeNumber|SmallNumber} The GCD.
     */
    function greatestCommonDivisor(a, b) {
        a = processInput(a).absolute();
        b = processInput(b).absolute();

        if (a.equals(b)) return a;
        if (a.isZero()) return b;
        if (b.isZero()) return a;

        let commonFactor = NumericalBase[1];
        let d, temp;

        // Remove common factors of 2
        while (a.isEven() && b.isEven()) {
            d = Math.min(estimateLowestBit(a), estimateLowestBit(b));
            a = a.divide(d);
            b = b.divide(d);
            commonFactor = commonFactor.timesOp(d);
        }

        // Remove factors of 2 from a
        while (a.isEven()) {
            a = a.divide(estimateLowestBit(a));
        }

        // Euclidean algorithm with optimizations
        do {
            while (b.isEven()) {
                b = b.divide(estimateLowestBit(b));
            }
            if (a.isGreaterThan(b)) {
                temp = b;
                b = a;
                a = temp;
            }
            b = b.minusOp(a);
        } while (!b.isZero());

        return commonFactor.isUnit() ? a : a.timesOp(commonFactor);
    }

    /**
     * Calculates the least common multiple (LCM) of two numbers.
     * LCM(a, b) = |a * b| / GCD(a, b)
     * @param {LargeNumber|SmallNumber|number|string} a - First number.
     * @param {LargeNumber|SmallNumber|number|string} b - Second number.
     * @returns {LargeNumber|SmallNumber} The LCM.
     */
    function leastCommonMultiple(a, b) {
        a = processInput(a).absolute();
        b = processInput(b).absolute();
        return a.divide(greatestCommonDivisor(a, b)).timesOp(b);
    }

    /**
     * Generates a random number between two given numbers (inclusive).
     * @param {LargeNumber|SmallNumber|number|string} lowerBound - The lower bound.
     * @param {LargeNumber|SmallNumber|number|string} upperBound - The upper bound.
     * @returns {LargeNumber|SmallNumber} A random number in the specified range.
     */
    function randomBetween(lowerBound, upperBound) {
        lowerBound = processInput(lowerBound);
        upperBound = processInput(upperBound);
        const low = getSmaller(lowerBound, upperBound);
        const high = getLarger(lowerBound, upperBound);

        const range = high.minusOp(low).plusOp(1);

        // If range is small, use native Math.random
        if (range.isCompact) {
            return low.plusOp(Math.floor(Math.random() * range.numValue));
        }

        // For large ranges, generate random chunks
        const rangeChunks = range.chunkData;
        const len = rangeChunks.length - 1;
        const resultChunks = [];
        let isRestricted = true; // Flag to ensure generated number is within range

        for (let i = len; i >= 0; --i) {
            const maxChunkVal = isRestricted ? rangeChunks[i] : RADIX_BASE;
            const digit = floorOrCeil(Math.random() * maxChunkVal);
            resultChunks.unshift(digit); // Add to the front
            if (digit < maxChunkVal) {
                isRestricted = false; // Once a digit is smaller than max, subsequent can be anything up to RADIX_BASE
            }
        }

        const randomVal = recomposeSmall(resultChunks);
        return low.plusOp(typeof randomVal === "number" ? new SmallNumber(randomVal) : new LargeNumber(randomVal, false));
    }

    /**
     * Parses a string representation of a number in a given base.
     * @param {string} textValue - The string to parse.
     * @param {number|LargeNumber|SmallNumber} inputBase - The base (2-36 or custom).
     * @returns {LargeNumber|SmallNumber} The parsed number.
     */
    const processBaseString = function(textValue, inputBase) {
        const strLen = textValue.length;
        const absBase = Math.abs(inputBase); // Use absolute base for digit validation

        // Pre-validation of digits for common bases (2-36)
        if (absBase >= 2 && absBase <= 36) {
            for (let i = 0; i < strLen; ++i) {
                const char = textValue[i].toLowerCase();
                if (char === "-") continue; // Allow leading minus sign
                if (!/[a-z0-9]/.test(char)) {
                    throw new Error(`Invalid character '${char}' in base ${inputBase}.`);
                }
                if (/[0-9]/.test(char) && +char >= absBase) {
                    if (char === "1" && absBase === 1) continue; // Special case for base 1
                    throw new Error(`Digit '${char}' is not valid in base ${inputBase}.`);
                } else if (char.charCodeAt(0) - 87 >= absBase) { // 'a' is charCode 97
                    throw new Error(`Digit '${char}' is not valid in base ${inputBase}.`);
                }
            }
        }

        // Native parsing for small numbers and common bases
        if (absBase >= 2 && absBase <= 36) {
            // Check if result could fit in JS safe integer range
            // LOG_MAX_INT / Math.log(base) gives max digits in that base for JS_MAX_SAFE_INTEGER
            if (strLen <= LOG_JS_MAX_SAFE_INTEGER / Math.log(absBase)) {
                const result = parseInt(textValue, absBase);
                if (!isNaN(result)) {
                    return new SmallNumber(result);
                }
            }
        }

        // Full BigInt parsing for larger numbers or custom bases
        const baseNum = processInput(inputBase);
        const digitValues = [];
        const isNegative = textValue[0] === "-";

        for (let i = isNegative ? 1 : 0; i < textValue.length; ++i) {
            const char = textValue[i].toLowerCase();
            let charCode = char.charCodeAt(0);

            if (charCode >= 48 && charCode <= 57) { // 0-9
                digitValues.push(processInput(char));
            } else if (charCode >= 97 && charCode <= 122) { // a-z
                digitValues.push(processInput(charCode - 87)); // 'a' is 10, 'b' is 11, etc.
            } else if (char === "<") { // Handle custom multi-digit "digits" like <10>
                const startIndex = i;
                do {
                    i++;
                } while (textValue[i] !== ">" && i < textValue.length);
                if (textValue[i] !== ">") {
                    throw new Error("Unclosed custom digit tag in string.");
                }
                digitValues.push(processInput(textValue.slice(startIndex + 1, i)));
            } else {
                throw new Error(`Invalid character '${char}' in base ${inputBase}.`);
            }
        }
        return processBaseArray(digitValues, baseNum, isNegative);
    };

    /**
     * Converts an array of digit values (as BigInts) in a given base to a BigInt.
     * @param {Array<LargeNumber|SmallNumber>} digitNums - Array of digit values.
     * @param {LargeNumber|SmallNumber} baseNum - The base.
     * @param {boolean} isNegative - True if the original number was negative.
     * @returns {LargeNumber|SmallNumber} The resulting number.
     */
    function processBaseArray(digitNums, baseNum, isNegative) {
        let resultVal = NumericalBase[0];
        let currentPower = NumericalBase[1];
        // Iterate through digits from LSB to MSB (reversed array order)
        for (let i = digitNums.length - 1; i >= 0; --i) {
            resultVal = resultVal.plusOp(digitNums[i].timesOp(currentPower));
            currentPower = currentPower.timesOp(baseNum);
        }
        return isNegative ? resultVal.negate() : resultVal;
    }

    /**
     * Converts a single digit (0-35) to its string representation.
     * For digits > 35, it wraps them in "< >".
     * @param {number} digit - The digit value.
     * @returns {string} The string representation.
     */
    function digitToString(digit) {
        if (digit <= 35) {
            return "0123456789abcdefghijklmnopqrstuvwxyz".charAt(digit);
        }
        return `<${digit}>`; // For custom bases with large "digits"
    }

    /**
     * Converts a BigInt to an array of digits in a specified base.
     * @param {LargeNumber|SmallNumber} num - The number to convert.
     * @param {LargeNumber|SmallNumber} base - The target base.
     * @returns {{value: Array<number>, isNegative: boolean}} Object with digit array and sign.
     */
    function convertToBase(num, base) {
        base = processInput(base);

        if (base.isZero()) {
            if (num.isZero()) return { value: [0], isNegative: false };
            throw new Error("Cannot convert nonzero numbers to base 0.");
        }
        if (base.equals(-1)) { // Special handling for base -1
            if (num.isZero()) return { value: [0], isNegative: false };
            if (num.isNegative()) {
                const count = num.negate().toJSNumber();
                return {
                    value: Array.from({ length: count }, (_, i) => [1, 0]).flat(),
                    isNegative: false
                };
            }
            const count = num.toJSNumber();
            const arr = Array.from({ length: count - 1 }, (_, i) => [0, 1]).flat();
            arr.unshift(1);
            return { value: arr, isNegative: false };
        }

        let finalNegative = false;
        if (num.isNegative() && base.isPositive()) {
            finalNegative = true;
            num = num.absolute();
        }

        if (base.equals(1)) { // Special handling for base 1
            if (num.isZero()) return { value: [0], isNegative: false };
            return {
                value: Array.from({ length: num.toJSNumber() }, () => 1),
                isNegative: finalNegative
            };
        }

        const outputDigits = [];
        let currentLeft = num;
        let divModResult;

        // Repeatedly divide by base and take remainder
        while (currentLeft.isNegative() || currentLeft.compareMagnitudeWith(base) >= 0) {
            divModResult = currentLeft.divmod(base);
            currentLeft = divModResult.quotient;
            let digit = divModResult.remainder;

            // Adjust for negative remainders (e.g., in base -2)
            if (digit.isNegative()) {
                digit = base.minusOp(digit).absolute(); // digit = abs(base - abs(digit))
                currentLeft = currentLeft.next(); // Adjust quotient
            }
            outputDigits.push(digit.toJSNumber());
        }
        outputDigits.push(currentLeft.toJSNumber()); // Add the last quotient
        return { value: outputDigits.reverse(), isNegative: finalNegative };
    }

    /**
     * Converts a BigInt to a string representation in a given base.
     * @param {LargeNumber|SmallNumber} num - The number.
     * @param {LargeNumber|SmallNumber} base - The target base.
     * @returns {string} The string representation.
     */
    function baseToString(num, base) {
        const arr = convertToBase(num, base);
        return (arr.isNegative ? "-" : "") + arr.value.map(digitToString).join("");
    }

    // Prototype method to convert to an array of digits (in a given radix)
    LargeNumber.prototype.toArray = function(radix) { return convertToBase(this, radix); };
    SmallNumber.prototype.toArray = function(radix) { return convertToBase(this, radix); };

    // Prototype method for string conversion on LargeNumber
    LargeNumber.prototype.toString = function(radix) {
        if (radix === undefValue) radix = 10;
        if (radix !== 10) return baseToString(this, radix); // Use generic base converter

        const val = this.chunkData;
        const len = val.length;
        let str = String(val[len - 1]); // Start with MSB
        const zeroPadding = "0000000"; // For padding chunks to RADIX_LOG digits
        let currentDigit;

        // Append other chunks, padding with zeros as needed
        for (let i = len - 2; i >= 0; --i) {
            currentDigit = String(val[i]);
            str += zeroPadding.slice(currentDigit.length) + currentDigit;
        }
        return (this.isNegative ? "-" : "") + str;
    };

    // Prototype method for string conversion on SmallNumber
    SmallNumber.prototype.toString = function(radix) {
        if (radix === undefValue) radix = 10;
        if (radix !== 10) return baseToString(this, radix);
        return String(this.numValue);
    };

    // JSON serialization for both types
    LargeNumber.prototype.toJSON = SmallNumber.prototype.toJSON = function() {
        return this.toString();
    };

    // ValueOf and toJSNumber methods
    LargeNumber.prototype.valueOf = LargeNumber.prototype.toJSNumber = function() {
        // Caution: This can lose precision for large numbers
        return parseInt(this.toString(), 10);
    };
    SmallNumber.prototype.valueOf = SmallNumber.prototype.toJSNumber = function() {
        return this.numValue;
    };

    /**
     * Parses a string value into a LargeNumber or SmallNumber.
     * Handles scientific notation and decimal points (for integer conversion).
     * @param {string} strValue - The string to parse.
     * @returns {LargeNumber|SmallNumber} The parsed number.
     */
    function parseTextValue(strValue) {
        // Quick check for small, precise numbers
        if (isWithinJsRange(+strValue)) {
            const x = +strValue;
            if (x === floorOrCeil(x)) return new SmallNumber(x);
            throw new Error(`Invalid integer: ${strValue} contains a non-integer part.`);
        }

        let isNegative = strValue[0] === "-";
        if (isNegative) strValue = strValue.slice(1);

        // Handle scientific notation (e.g., "1.23e+5")
        const scientificParts = strValue.split(/e/i);
        if (scientificParts.length > 2) {
            throw new Error(`Invalid integer: ${scientificParts.join("e")}`);
        }
        if (scientificParts.length === 2) {
            let exponentStr = scientificParts[1];
            if (exponentStr[0] === "+") exponentStr = exponentStr.slice(1);
            const exponent = +exponentStr;

            if (exponent !== floorOrCeil(exponent) || !isWithinJsRange(exponent)) {
                throw new Error(`Invalid integer: ${exponent} is not a valid exponent.`);
            }

            let baseText = scientificParts[0];
            const decimalPointIndex = baseText.indexOf(".");
            if (decimalPointIndex >= 0) {
                // Adjust exponent for decimal places
                exponent -= (baseText.length - decimalPointIndex - 1);
                baseText = baseText.slice(0, decimalPointIndex) + baseText.slice(decimalPointIndex + 1);
            }

            if (exponent < 0) {
                throw new Error("Cannot include negative exponent part for integers.");
            }
            // Pad with zeros for positive exponent
            baseText += new Array(exponent + 1).join("0");
            strValue = baseText;
        }

        // Validate the resulting string contains only digits
        if (!/^([0-9][0-9]*)$/.test(strValue)) {
            throw new Error(`Invalid integer: ${strValue}`);
        }

        const chunkArray = [];
        let maxLen = strValue.length;
        const chunkSize = RADIX_LOG;
        let minLen = maxLen - chunkSize;

        // Split string into RADIX_BASE chunks from right to left
        while (maxLen > 0) {
            chunkArray.push(+strValue.slice(Math.max(0, minLen), maxLen));
            minLen -= chunkSize;
            maxLen -= chunkSize;
        }
        normalizeChunks(chunkArray);
        return new LargeNumber(chunkArray, isNegative);
    }

    /**
     * Parses a number value into a SmallNumber or LargeNumber.
     * @param {number} numValue - The number to parse.
     * @returns {LargeNumber|SmallNumber} The parsed number.
     */
    function parseNumericValue(numValue) {
        if (isWithinJsRange(numValue)) {
            if (numValue !== floorOrCeil(numValue)) {
                throw new Error(`${numValue} is not an integer.`);
            }
            return new SmallNumber(numValue);
        }
        // If outside safe integer range, convert to string and parse
        return parseTextValue(numValue.toString());
    }

    /**
     * Central function to parse various input types into a BigInt instance.
     * @param {number|string|LargeNumber|SmallNumber} inputValue - The input value.
     * @returns {LargeNumber|SmallNumber} A BigInt instance.
     */
    function processInput(inputValue) {
        if (typeof inputValue === "number") {
            return parseNumericValue(inputValue);
        }
        if (typeof inputValue === "string") {
            return parseTextValue(inputValue);
        }
        // If it's already a BigInt instance, return it as is
        return inputValue;
    }

    // Initialize static instances for common small numbers (0-999 and their negatives)
    for (let i = 0; i < 1e3; ++i) {
        NumericalBase[i] = new SmallNumber(i);
        if (i > 0) NumericalBase[-i] = new SmallNumber(-i);
    }

    // Assign static properties to the NumericalBase constructor
    NumericalBase.one = NumericalBase[1];
    NumericalBase.zero = NumericalBase[0];
    NumericalBase.minusOne = NumericalBase[-1];
    NumericalBase.max = getLarger;
    NumericalBase.min = getSmaller;
    NumericalBase.gcd = greatestCommonDivisor;
    NumericalBase.lcm = leastCommonMultiple;
    NumericalBase.isInstance = function(obj) {
        return obj instanceof LargeNumber || obj instanceof SmallNumber;
    };
    NumericalBase.randBetween = randomBetween;
    NumericalBase.fromArray = function(digitArray, base, isNegative) {
        return processBaseArray(
            digitArray.map(processInput),
            processInput(base || 10),
            isNegative
        );
    };

    return NumericalBase;
})();

/**
 * Main execution function for the problem.
 * @param {string} inputData - The raw input string from stdin.
 */
const processSolution = inputData => {
    // Trim whitespace and split into lines
    const lines = inputData.trim().split("\n");

    // Parse the first line for X and Y
    const firstLineParts = lines[0].split(" ");
    const initialX = largeNumUtil(parseInt(firstLineParts[0], 10)); // Convert to LargeNumber
    const targetY = largeNumUtil(parseInt(firstLineParts[1], 10)); // Convert to LargeNumber

    let currentVal = initialX;
    let doublingSteps = 0;

    // Loop while current value is less than or equal to target Y
    while (currentVal.isLesserOrEqual(targetY)) {
        doublingSteps++;
        // Double the current value
        // The toString() here is a stylistic choice, not strictly necessary if currentVal is already a LargeNumber
        // but it mimics the original's intermediate string conversion.
        currentVal = currentVal.timesOp(2);
    }

    console.log(doublingSteps);
};

// Read input from /dev/stdin and pass to the solution function
processSolution(require('fs').readFileSync('/dev/stdin', 'utf8'));