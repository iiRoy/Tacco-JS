"use strict";
var largeNum = function (void 0) {
    "use strict";

    // Configuration constants for the number representation system
    const CHUNK_SIZE_BASE = 1e7; // Each array element stores numbers up to this value (10^7)
    const CHUNK_LOG_SIZE = 7; // log10(CHUNK_SIZE_BASE)
    const JS_SAFE_MAX = 9007199254740992; // Max safe integer in JavaScript
    const JS_SAFE_MAX_PARTS = splitJsNumToChunks(JS_SAFE_MAX); // JS_SAFE_MAX represented as chunks
    const JS_SAFE_MAX_LOG = Math.log(JS_SAFE_MAX); // Logarithm of JS_SAFE_MAX

    /**
     * Base constructor/factory for numeric objects.
     * Delegates to specific constructors based on input type and radix.
     * @param {number|string|object} inputValue - The value to parse.
     * @param {number} [radixBase] - The base for parsing string values.
     * @returns {NumBase} A LargeNum or TinyNum instance.
     */
    function NumBase(inputValue, radixBase) {
        // If no value, return the cached zero instance
        if (typeof inputValue === "undefined") {
            return NumBase.ZERO;
        }

        // If radix is provided, parse accordingly
        if (typeof radixBase !== "undefined") {
            // If base is 10, use standard parsing, otherwise use base-specific parsing
            return Number(radixBase) === 10 ? parseInputVal(inputValue) : parseFromBase(inputValue, radixBase);
        }

        // Default parsing for a single value
        return parseInputVal(inputValue);
    }

    /**
     * Represents a large integer that exceeds JavaScript's safe integer limit.
     * Stores the number as an array of 'chunks' (digits in a large base).
     * @param {number[]} chunkArray - Array of number chunks.
     * @param {boolean} isNegative - True if the number is negative.
     */
    function LargeNum(chunkArray, isNegative) {
        this.value = chunkArray;
        this.isNegative = isNegative; // Renamed 'sign' to 'isNegative' for clarity
        this.isTiny = false; // Renamed 'isSmall' to 'isTiny'
    }
    // Inherit from NumBase's prototype to share common methods
    LargeNum.prototype = Object.create(NumBase.prototype);

    /**
     * Represents a small integer that fits within JavaScript's safe integer limit.
     * @param {number} rawValue - The native JavaScript number.
     */
    function TinyNum(rawValue) {
        this.value = rawValue;
        this.isNegative = rawValue < 0;
        this.isTiny = true;
    }
    // Inherit from NumBase's prototype to share common methods
    TinyNum.prototype = Object.create(NumBase.prototype);

    /**
     * Checks if a given number is a safe integer in JavaScript.
     * @param {number} numToCheck - The number to check.
     * @returns {boolean} True if the number is within JS_SAFE_MAX, false otherwise.
     */
    function isJsSafeInt(numToCheck) {
        return -JS_SAFE_MAX < numToCheck && numToCheck < JS_SAFE_MAX;
    }

    /**
     * Converts a native JavaScript number into an array of chunks.
     * Used for representing small numbers in the large number format.
     * @param {number} num - The number to convert.
     * @returns {number[]} An array of number chunks.
     */
    function splitJsNumToChunks(num) {
        const absNum = Math.abs(num); // Work with absolute value
        if (absNum < CHUNK_SIZE_BASE) {
            return [absNum];
        }
        if (absNum < CHUNK_SIZE_BASE * CHUNK_SIZE_BASE) { // Up to 10^14
            return [absNum % CHUNK_SIZE_BASE, Math.floor(absNum / CHUNK_SIZE_BASE)];
        }
        // Up to 10^21 (approx JS_SAFE_MAX)
        return [absNum % CHUNK_SIZE_BASE, Math.floor(absNum / CHUNK_SIZE_BASE) % CHUNK_SIZE_BASE, Math.floor(absNum / (CHUNK_SIZE_BASE * CHUNK_SIZE_BASE))];
    }

    /**
     * Converts an array of chunks back into a native JavaScript number, if possible.
     * @param {number[]} chunkArr - The array of number chunks.
     * @returns {number|number[]} The native number or the original array if too large.
     */
    function chunksToJsNum(chunkArr) {
        normalizeChunks(chunkArr); // Remove leading zeros
        const chunkCount = chunkArr.length;
        // Check if the number of chunks and its magnitude allow conversion to a small integer
        if (chunkCount < 4 && compareAbsoluteChunks(chunkArr, JS_SAFE_MAX_PARTS) < 0) {
            switch (chunkCount) {
                case 0:
                    return 0;
                case 1:
                    return chunkArr[0];
                case 2:
                    return chunkArr[0] + chunkArr[1] * CHUNK_SIZE_BASE;
                case 3:
                    return chunkArr[0] + (chunkArr[1] + chunkArr[2] * CHUNK_SIZE_BASE) * CHUNK_SIZE_BASE;
            }
        }
        return chunkArr; // Return as chunks if too large
    }

    /**
     * Removes leading zero chunks from an array of number chunks.
     * Modifies the array in-place.
     * @param {number[]} chunkArr - The array of number chunks.
     */
    function normalizeChunks(chunkArr) {
        let idx = chunkArr.length;
        while (idx > 0 && chunkArr[--idx] === 0);
        chunkArr.length = idx + 1;
    }

    /**
     * Creates a new array filled with zeros.
     * @param {number} len - The desired length of the array.
     * @returns {number[]} A new array filled with zeros.
     */
    function makeZeroFilledArray(len) {
        const newArr = new Array(len);
        for (let k = 0; k < len; k++) {
            newArr[k] = 0;
        }
        return newArr;
    }

    /**
     * Rounds a number towards zero (equivalent to Math.trunc).
     * @param {number} num - The number to truncate.
     * @returns {number} The integer part of the number.
     */
    function floorOrCeil(num) {
        return num > 0 ? Math.floor(num) : Math.ceil(num);
    }

    /**
     * Adds two arrays of number chunks (representing positive numbers).
     * Assumes `arrA` is longer or equal in length to `arrB`.
     * @param {number[]} arrA - The first array of chunks.
     * @param {number[]} arrB - The second array of chunks.
     * @returns {number[]} A new array of chunks representing the sum.
     */
    function sumChunks(arrA, arrB) {
        const lenA = arrA.length;
        const lenB = arrB.length;
        const resultChunks = new Array(lenA);
        let carry = 0;
        const base = CHUNK_SIZE_BASE;
        let currentSum;

        for (let i = 0; i < lenB; i++) {
            currentSum = arrA[i] + arrB[i] + carry;
            carry = currentSum >= base ? 1 : 0;
            resultChunks[i] = currentSum - carry * base;
        }
        for (let i = lenB; i < lenA; i++) {
            currentSum = arrA[i] + carry;
            carry = currentSum === base ? 1 : 0;
            resultChunks[i] = currentSum - carry * base;
        }
        if (carry > 0) {
            resultChunks.push(carry);
        }
        return resultChunks;
    }

    /**
     * Adds two arrays of number chunks, handling different lengths.
     * @param {number[]} arrA - The first array of chunks.
     * @param {number[]} arrB - The second array of chunks.
     * @returns {number[]} A new array of chunks representing the sum.
     */
    function sumAnyChunks(arrA, arrB) {
        return arrA.length >= arrB.length ? sumChunks(arrA, arrB) : sumChunks(arrB, arrA);
    }

    /**
     * Adds a small integer value to an array of number chunks.
     * @param {number[]} chunkArr - The array of chunks.
     * @param {number} smallVal - The small integer to add.
     * @returns {number[]} A new array of chunks representing the sum.
     */
    function sumSmallChunkVal(chunkArr, smallVal) {
        const len = chunkArr.length;
        const resultChunks = new Array(len);
        let carry = smallVal; // SmallVal acts as initial carry
        const base = CHUNK_SIZE_BASE;
        let currentSum;

        for (let i = 0; i < len; i++) {
            currentSum = chunkArr[i] - base + carry; // Subtract base to leverage negative carry
            carry = Math.floor(currentSum / base);
            resultChunks[i] = currentSum - carry * base;
            carry += 1; // Adjust carry back
        }
        while (carry > 0) {
            resultChunks[len++] = carry % base;
            carry = Math.floor(carry / base);
        }
        return resultChunks;
    }

    /**
     * Adds another number to this LargeNum.
     * @param {NumBase|number|string} operand - The number to add.
     * @returns {LargeNum|TinyNum} The sum.
     */
    LargeNum.prototype.add = function (operand) {
        const otherNum = parseInputVal(operand);

        // If signs are different, perform subtraction
        if (this.isNegative !== otherNum.isNegative) {
            return this.subtract(otherNum.flipSign());
        }

        const currentVal = this.value;
        const otherVal = otherNum.value;

        // Optimized for small integer addition
        if (otherNum.isTiny) {
            return new LargeNum(sumSmallChunkVal(currentVal, Math.abs(otherVal)), this.isNegative);
        }

        // General addition of two large numbers
        return new LargeNum(sumAnyChunks(currentVal, otherVal), this.isNegative);
    };
    LargeNum.prototype.plus = LargeNum.prototype.add; // Alias

    /**
     * Adds another number to this TinyNum.
     * @param {NumBase|number|string} operand - The number to add.
     * @returns {LargeNum|TinyNum} The sum.
     */
    TinyNum.prototype.add = function (operand) {
        const otherNum = parseInputVal(operand);
        const currentVal = this.value;

        // If signs are different, perform subtraction
        if (currentVal < 0 !== otherNum.isNegative) {
            return this.subtract(otherNum.flipSign());
        }

        const otherVal = otherNum.value;

        // If both are tiny, try native addition
        if (otherNum.isTiny) {
            const sum = currentVal + otherVal;
            if (isJsSafeInt(sum)) {
                return new TinyNum(sum);
            }
            // If sum exceeds safe integer, convert other to chunks and perform large addition
            return new LargeNum(sumSmallChunkVal(splitJsNumToChunks(Math.abs(otherVal)), Math.abs(currentVal)), currentVal < 0);
        }

        // If 'otherNum' is large, convert 'this' to chunks and perform large addition
        return new LargeNum(sumSmallChunkVal(otherVal, Math.abs(currentVal)), currentVal < 0);
    };
    TinyNum.prototype.plus = TinyNum.prototype.add; // Alias

    /**
     * Subtracts array `b` from array `a` (assuming `a >= b` and both are positive).
     * @param {number[]} arrA - The minuend chunks.
     * @param {number[]} arrB - The subtrahend chunks.
     * @returns {number[]} A new array of chunks representing the difference.
     */
    function diffChunks(arrA, arrB) {
        const lenA = arrA.length;
        const lenB = arrB.length;
        const resultChunks = new Array(lenA);
        let borrow = 0;
        const base = CHUNK_SIZE_BASE;
        let difference;

        for (let i = 0; i < lenB; i++) {
            difference = arrA[i] - borrow - arrB[i];
            if (difference < 0) {
                difference += base;
                borrow = 1;
            } else {
                borrow = 0;
            }
            resultChunks[i] = difference;
        }
        for (let i = lenB; i < lenA; i++) {
            difference = arrA[i] - borrow;
            if (difference < 0) {
                difference += base;
            } else {
                resultChunks[i++] = difference; // If no borrow, copy remaining and break
                break;
            }
            resultChunks[i] = difference;
        }
        // Copy any remaining higher-order chunks from arrA
        for (; i < lenA; i++) {
            resultChunks[i] = arrA[i];
        }
        normalizeChunks(resultChunks);
        return resultChunks;
    }

    /**
     * Subtracts two numbers represented as chunk arrays, handling signs and magnitudes.
     * @param {number[]} arrA - First operand chunks.
     * @param {number[]} arrB - Second operand chunks.
     * @param {boolean} currentSign - The original sign of the first operand.
     * @returns {LargeNum|TinyNum} The difference.
     */
    function diffAnyChunks(arrA, arrB, currentSign) {
        let resultVal;
        let finalSign = currentSign;

        // Determine which is larger to ensure positive result from `diffChunks`
        if (compareAbsoluteChunks(arrA, arrB) >= 0) {
            resultVal = diffChunks(arrA, arrB);
        } else {
            resultVal = diffChunks(arrB, arrA);
            finalSign = !finalSign; // Flip sign if subtraction order was reversed
        }

        resultVal = chunksToJsNum(resultVal); // Try to convert back to small
        if (typeof resultVal === "number") {
            return new TinyNum(finalSign ? -resultVal : resultVal);
        }
        return new LargeNum(resultVal, finalSign);
    }

    /**
     * Subtracts a small integer from an array of number chunks.
     * @param {number[]} chunkArr - The array of chunks.
     * @param {number} smallVal - The small integer to subtract.
     * @param {boolean} currentSign - The sign of the original number.
     * @returns {LargeNum|TinyNum} The difference.
     */
    function diffSmallChunkVal(chunkArr, smallVal, currentSign) {
        const len = chunkArr.length;
        const resultChunks = new Array(len);
        let borrow = -smallVal; // SmallVal acts as initial borrow (negative)
        const base = CHUNK_SIZE_BASE;
        let difference;

        for (let i = 0; i < len; i++) {
            difference = chunkArr[i] + borrow;
            borrow = Math.floor(difference / base);
            difference %= base;
            resultChunks[i] = difference < 0 ? difference + base : difference;
        }
        const finalResult = chunksToJsNum(resultChunks);
        if (typeof finalResult === "number") {
            return new TinyNum(currentSign ? -finalResult : finalResult);
        }
        return new LargeNum(finalResult, currentSign);
    }

    /**
     * Subtracts another number from this LargeNum.
     * @param {NumBase|number|string} operand - The number to subtract.
     * @returns {LargeNum|TinyNum} The difference.
     */
    LargeNum.prototype.subtract = function (operand) {
        const otherNum = parseInputVal(operand);

        // If signs are different, perform addition with negated operand
        if (this.isNegative !== otherNum.isNegative) {
            return this.add(otherNum.flipSign());
        }

        const currentVal = this.value;
        const otherVal = otherNum.value;

        // Optimized for small integer subtraction
        if (otherNum.isTiny) {
            return diffSmallChunkVal(currentVal, Math.abs(otherVal), this.isNegative);
        }

        // General subtraction of two large numbers
        return diffAnyChunks(currentVal, otherVal, this.isNegative);
    };
    LargeNum.prototype.minus = LargeNum.prototype.subtract; // Alias

    /**
     * Subtracts another number from this TinyNum.
     * @param {NumBase|number|string} operand - The number to subtract.
     * @returns {LargeNum|TinyNum} The difference.
     */
    TinyNum.prototype.subtract = function (operand) {
        const otherNum = parseInputVal(operand);
        const currentVal = this.value;

        // If signs are different, perform addition with negated operand
        if (currentVal < 0 !== otherNum.isNegative) {
            return this.add(otherNum.flipSign());
        }

        const otherVal = otherNum.value;

        // If both are tiny, try native subtraction
        if (otherNum.isTiny) {
            return new TinyNum(currentVal - otherVal);
        }

        // If 'otherNum' is large, convert 'this' to chunks and perform large subtraction
        // Note: The original logic here was `subtractSmall(b, Math.abs(a), a >= 0)` which
        // implies `b - |a|` with `a >= 0` determining the sign.
        // This should be `-(|b| - |a|)` if `|b| > |a|` and `a` is positive, etc.
        // Let's rewrite to be more explicit: `this - otherNum`
        return diffAnyChunks(otherVal, splitJsNumToChunks(Math.abs(currentVal)), !this.isNegative); // Invert order and sign for `-(other - this)`
    };
    TinyNum.prototype.minus = TinyNum.prototype.subtract; // Alias

    /**
     * Returns a new number with the sign flipped.
     * @returns {LargeNum} A new LargeNum with the opposite sign.
     */
    LargeNum.prototype.flipSign = function () {
        return new LargeNum(this.value, !this.isNegative);
    };

    /**
     * Returns a new number with the sign flipped.
     * @returns {TinyNum} A new TinyNum with the opposite sign.
     */
    TinyNum.prototype.flipSign = function () {
        const newTiny = new TinyNum(-this.value);
        newTiny.isNegative = !this.isNegative; // Explicitly set, though -this.value handles it
        return newTiny;
    };

    /**
     * Returns the absolute value of this LargeNum.
     * @returns {LargeNum} A new LargeNum with a positive sign.
     */
    LargeNum.prototype.absoluteVal = function () {
        return new LargeNum(this.value, false);
    };

    /**
     * Returns the absolute value of this TinyNum.
     * @returns {TinyNum} A new TinyNum with a positive sign.
     */
    TinyNum.prototype.absoluteVal = function () {
        return new TinyNum(Math.abs(this.value));
    };

    /**
     * Multiplies two arrays of number chunks using a standard long multiplication algorithm.
     * @param {number[]} arrA - First operand chunks.
     * @param {number[]} arrB - Second operand chunks.
     * @returns {number[]} A new array of chunks representing the product.
     */
    function productLongChunks(arrA, arrB) {
        const lenA = arrA.length;
        const lenB = arrB.length;
        const resultChunks = makeZeroFilledArray(lenA + lenB);
        const base = CHUNK_SIZE_BASE;
        let product, carry;

        for (let i = 0; i < lenA; ++i) {
            const currentAChunk = arrA[i];
            carry = 0;
            for (let j = 0; j < lenB; ++j) {
                // Calculate product for current positions, add previous carry and existing result at this position
                product = currentAChunk * arrB[j] + resultChunks[i + j] + carry;
                carry = Math.floor(product / base);
                resultChunks[i + j] = product - carry * base;
            }
            resultChunks[i + lenB] += carry; // Add any remaining carry to the next position
        }
        normalizeChunks(resultChunks);
        return resultChunks;
    }

    /**
     * Multiplies an array of number chunks by a single small integer.
     * @param {number[]} chunkArr - The array of chunks.
     * @param {number} smallVal - The small integer multiplier.
     * @returns {number[]} A new array of chunks representing the product.
     */
    function productSmallChunkVal(chunkArr, smallVal) {
        const len = chunkArr.length;
        const resultChunks = new Array(len);
        const base = CHUNK_SIZE_BASE;
        let carry = 0;
        let product;

        for (let i = 0; i < len; i++) {
            product = chunkArr[i] * smallVal + carry;
            carry = Math.floor(product / base);
            resultChunks[i] = product - carry * base;
        }
        while (carry > 0) {
            resultChunks[len++] = carry % base;
            carry = Math.floor(carry / base);
        }
        return resultChunks;
    }

    /**
     * Prepends `n` zeros to an array of chunks, effectively shifting left.
     * @param {number[]} chunkArr - The array of chunks to shift.
     * @param {number} numZeros - The number of zeros to prepend.
     * @returns {number[]} A new array with zeros prepended.
     */
    function padZerosForLeftShift(chunkArr, numZeros) {
        const zeros = makeZeroFilledArray(numZeros);
        return zeros.concat(chunkArr);
    }

    /**
     * Multiplies two arrays of number chunks using Karatsuba algorithm for efficiency.
     * @param {number[]} arrX - First operand chunks.
     * @param {number[]} arrY - Second operand chunks.
     * @returns {number[]} A new array of chunks representing the product.
     */
    function karatsubaProduct(arrX, arrY) {
        const n = Math.max(arrX.length, arrY.length);
        // Base case for recursion: switch to long multiplication for small inputs
        if (n <= 30) { // Threshold can be tuned
            return productLongChunks(arrX, arrY);
        }

        // Split arrays into halves
        const halfN = Math.ceil(n / 2);
        const b = arrX.slice(halfN);
        const a = arrX.slice(0, halfN);
        const d = arrY.slice(halfN);
        const c = arrY.slice(0, halfN);

        // Recursively compute sub-products
        const productAC = karatsubaProduct(a, c);
        const productBD = karatsubaProduct(b, d);
        const sumAB = sumAnyChunks(a, b);
        const sumCD = sumAnyChunks(c, d);
        const productABCD = karatsubaProduct(sumAB, sumCD);

        // Combine sub-products
        // product = ac * (BASE^(2*halfN)) + ((ad+bc) * (BASE^halfN)) + bd
        // ad+bc = (a+b)(c+d) - ac - bd
        const middleTerm = diffChunks(diffChunks(productABCD, productAC), productBD);
        const finalProduct = sumAnyChunks(sumAnyChunks(productAC, padZerosForLeftShift(middleTerm, halfN)), padZerosForLeftShift(productBD, 2 * halfN));

        normalizeChunks(finalProduct);
        return finalProduct;
    }

    /**
     * Heuristic to decide whether to use Karatsuba multiplication.
     * @param {number} len1 - Length of the first chunk array.
     * @param {number} len2 - Length of the second chunk array.
     * @returns {boolean} True if Karatsuba should be used, false otherwise.
     */
    function shouldUseKaratsuba(len1, len2) {
        // This is an empirical formula, might need adjustment
        return -0.012 * len1 - 0.012 * len2 + 15e-6 * len1 * len2 > 0;
    }

    /**
     * Multiplies this LargeNum by another number.
     * @param {NumBase|number|string} operand - The number to multiply by.
     * @returns {LargeNum|TinyNum} The product.
     */
    LargeNum.prototype.multiply = function (operand) {
        const otherNum = parseInputVal(operand);
        const currentVal = this.value;
        const otherVal = otherNum.value;
        const finalIsNegative = this.isNegative !== otherNum.isNegative;
        let absoluteResult;

        if (otherNum.isTiny) {
            const smallMultiplier = otherNum.value;
            if (smallMultiplier === 0) return NumBase.ZERO;
            if (smallMultiplier === 1) return this;
            if (smallMultiplier === -1) return this.flipSign();

            const absSmallMultiplier = Math.abs(smallMultiplier);
            if (absSmallMultiplier < CHUNK_SIZE_BASE) {
                absoluteResult = productSmallChunkVal(currentVal, absSmallMultiplier);
            } else {
                absoluteResult = productLongChunks(currentVal, splitJsNumToChunks(absSmallMultiplier));
            }
        } else {
            // Choose multiplication algorithm based on size
            if (shouldUseKaratsuba(currentVal.length, otherVal.length)) {
                absoluteResult = karatsubaProduct(currentVal, otherVal);
            } else {
                absoluteResult = productLongChunks(currentVal, otherVal);
            }
        }

        const finalResult = chunksToJsNum(absoluteResult);
        if (typeof finalResult === "number") {
            return new TinyNum(finalIsNegative ? -finalResult : finalResult);
        }
        return new LargeNum(finalResult, finalIsNegative);
    };
    LargeNum.prototype.times = LargeNum.prototype.multiply; // Alias

    /**
     * Helper for multiplying a chunk array by a small integer, returning a LargeNum.
     * @param {number} smallVal - The small integer multiplier.
     * @param {number[]} chunkArr - The chunk array.
     * @param {boolean} finalIsNegative - The sign of the result.
     * @returns {LargeNum} The product as a LargeNum.
     */
    function multiplySmallAndArray(smallVal, chunkArr, finalIsNegative) {
        if (smallVal < CHUNK_SIZE_BASE) {
            return new LargeNum(productSmallChunkVal(chunkArr, smallVal), finalIsNegative);
        }
        return new LargeNum(productLongChunks(chunkArr, splitJsNumToChunks(smallVal)), finalIsNegative);
    }

    /**
     * Internal method for TinyNum to multiply by another TinyNum.
     * @param {TinyNum} otherTiny - The other TinyNum.
     * @returns {LargeNum|TinyNum} The product.
     */
    TinyNum.prototype._mulBySmallScalar = function (otherTiny) {
        const currentVal = this.value;
        const otherVal = otherTiny.value;
        const finalIsNegative = this.isNegative !== otherTiny.isNegative;

        if (isJsSafeInt(currentVal * otherVal)) {
            return new TinyNum(currentVal * otherVal);
        }
        // If product exceeds safe integer, convert to large number multiplication
        return multiplySmallAndArray(Math.abs(otherVal), splitJsNumToChunks(Math.abs(currentVal)), finalIsNegative);
    };

    /**
     * Internal method for LargeNum to multiply by a TinyNum.
     * @param {TinyNum} otherTiny - The TinyNum multiplier.
     * @returns {LargeNum|TinyNum} The product.
     */
    LargeNum.prototype._mulBySmallScalar = function (otherTiny) {
        const smallMultiplier = otherTiny.value;
        if (smallMultiplier === 0) return NumBase.ZERO;
        if (smallMultiplier === 1) return this;
        if (smallMultiplier === -1) return this.flipSign();

        const finalIsNegative = this.isNegative !== otherTiny.isNegative;
        return multiplySmallAndArray(Math.abs(smallMultiplier), this.value, finalIsNegative);
    };

    /**
     * Multiplies this TinyNum by another number.
     * @param {NumBase|number|string} operand - The number to multiply by.
     * @returns {LargeNum|TinyNum} The product.
     */
    TinyNum.prototype.multiply = function (operand) {
        const otherNum = parseInputVal(operand);
        // Delegate to internal _mulBySmallScalar for efficiency
        return otherNum._mulBySmallScalar(this);
    };
    TinyNum.prototype.times = TinyNum.prototype.multiply; // Alias

    /**
     * Squares an array of number chunks. Optimized for squaring.
     * @param {number[]} chunkArr - The array of chunks to square.
     * @returns {number[]} A new array of chunks representing the square.
     */
    function selfProduct(chunkArr) {
        const len = chunkArr.length;
        const resultChunks = makeZeroFilledArray(len + len);
        const base = CHUNK_SIZE_BASE;
        let product, carry;

        for (let i = 0; i < len; i++) {
            const currentAChunk = chunkArr[i];
            carry = 0; // Reset carry for each outer loop iteration

            // Process diagonal and upper triangle (j >= i)
            // Multiply by 2 because a_i * a_j appears twice when i != j
            for (let j = i; j < len; j++) {
                const currentBChunk = chunkArr[j];
                product = (i === j ? currentAChunk * currentBChunk : 2 * currentAChunk * currentBChunk) + resultChunks[i + j] + carry;
                carry = Math.floor(product / base);
                resultChunks[i + j] = product - carry * base;
            }
            resultChunks[i + len] += carry; // Add remaining carry
        }
        normalizeChunks(resultChunks);
        return resultChunks;
    }

    /**
     * Squares this LargeNum.
     * @returns {LargeNum} The square of this number.
     */
    LargeNum.prototype.square = function () {
        return new LargeNum(selfProduct(this.value), false); // Square is always positive
    };

    /**
     * Squares this TinyNum.
     * @returns {LargeNum|TinyNum} The square of this number.
     */
    TinyNum.prototype.square = function () {
        const squaredVal = this.value * this.value;
        if (isJsSafeInt(squaredVal)) {
            return new TinyNum(squaredVal);
        }
        // If square exceeds safe integer, convert to large number square
        return new LargeNum(selfProduct(splitJsNumToChunks(Math.abs(this.value))), false);
    };

    /**
     * Performs division and modulo using a Knuth-style algorithm (Algorithm D from TAOCP).
     * This is generally faster for larger numbers.
     * @param {number[]} dividendChunks - The dividend as chunks.
     * @param {number[]} divisorChunks - The divisor as chunks.
     * @returns {[number[], number[]]} An array containing [quotientChunks, remainderChunks].
     */
    function longDivisionAlgorithm(dividendChunks, divisorChunks) {
        const divdLen = dividendChunks.length;
        const divsLen = divisorChunks.length;
        const quotientResult = makeZeroFilledArray(divsLen); // Quotient length is approx. dividend length - divisor length
        const base = CHUNK_SIZE_BASE;

        // Scale the numbers to make the divisor's most significant digit larger (normalization)
        const divisorMostSignificantDigit = divisorChunks[divsLen - 1];
        const normalizationFactor = Math.ceil(base / (2 * divisorMostSignificantDigit)); // d = floor(B / (d_n+1))
        const scaledRemainder = productSmallChunkVal(dividendChunks, normalizationFactor);
        const scaledDivisor = productSmallChunkVal(divisorChunks, normalizationFactor);

        // Adjust lengths for algorithm
        if (scaledRemainder.length <= divdLen) scaledRemainder.push(0);
        scaledDivisor.push(0); // Pad divisor to match remainder length in loop

        const normalizedDivisorMsb = scaledDivisor[divsLen - 1];
        let quotientDigitEstimate;
        let carry, borrow;
        let currentLoopLength, tempQ;

        // Main loop, iterating from most significant chunk downwards
        for (let shift = divdLen - divsLen; shift >= 0; shift--) {
            // Estimate quotient digit
            quotientDigitEstimate = base - 1;
            if (scaledRemainder[shift + divsLen] !== normalizedDivisorMsb) {
                quotientDigitEstimate = Math.floor((scaledRemainder[shift + divsLen] * base + scaledRemainder[shift + divsLen - 1]) / normalizedDivisorMsb);
            }

            // Multiply divisor by estimate and subtract from remainder
            carry = 0;
            borrow = 0;
            currentLoopLength = scaledDivisor.length;
            for (let i = 0; i < currentLoopLength; i++) {
                carry += quotientDigitEstimate * scaledDivisor[i];
                tempQ = Math.floor(carry / base);
                borrow += scaledRemainder[shift + i] - (carry - tempQ * base);
                carry = tempQ;
                if (borrow < 0) {
                    scaledRemainder[shift + i] = borrow + base;
                    borrow = -1;
                } else {
                    scaledRemainder[shift + i] = borrow;
                    borrow = 0;
                }
            }

            // Adjust quotient estimate if it was too high (remainder became negative)
            while (borrow !== 0) {
                quotientDigitEstimate -= 1;
                carry = 0;
                for (let i = 0; i < currentLoopLength; i++) {
                    carry += scaledRemainder[shift + i] - base + scaledDivisor[i];
                    if (carry < 0) {
                        scaledRemainder[shift + i] = carry + base;
                        carry = 0;
                    } else {
                        scaledRemainder[shift + i] = carry;
                        carry = 1;
                    }
                }
                borrow += carry;
            }
            quotientResult[shift] = quotientDigitEstimate;
        }

        // Un-normalize the remainder
        const finalRemainder = divideChunksBySmall(scaledRemainder, normalizationFactor)[0];
        return [chunksToJsNum(quotientResult), chunksToJsNum(finalRemainder)];
    }

    /**
     * Performs division and modulo using a simpler, iterative subtraction method.
     * Less efficient for very large numbers than Knuth's algorithm.
     * @param {number[]} dividendChunks - The dividend as chunks.
     * @param {number[]} divisorChunks - The divisor as chunks.
     * @returns {[number[], number[]]} An array containing [quotientChunks, remainderChunks].
     */
    function shortDivisionAlgorithm(dividendChunks, divisorChunks) {
        let divdLen = dividendChunks.length;
        const divsLen = divisorChunks.length;
        const quotientResult = [];
        let partialDividend = []; // Acts as current remainder
        const base = CHUNK_SIZE_BASE;
        let guess, checkProduct;

        // Process dividend chunks from MSB to LSB
        while (divdLen > 0) {
            partialDividend.unshift(dividendChunks[--divdLen]); // Add next chunk to partial dividend
            normalizeChunks(partialDividend); // Remove leading zeros if any

            // If current partial dividend is smaller than divisor, quotient digit is 0
            if (compareAbsoluteChunks(partialDividend, divisorChunks) < 0) {
                quotientResult.push(0);
                continue;
            }

            // Estimate quotient digit
            let partialLen = partialDividend.length;
            let highX = partialDividend[partialLen - 1] * base + (partialLen > 1 ? partialDividend[partialLen - 2] : 0);
            let highY = divisorChunks[divsLen - 1] * base + (divsLen > 1 ? divisorChunks[divsLen - 2] : 0);

            if (partialLen > divsLen) { // If partial dividend has one more chunk than divisor
                highX = (highX + 1) * base; // Make estimate more conservative by increasing numerator
            }

            guess = Math.ceil(highX / highY);

            // Refine guess by trial subtraction
            do {
                checkProduct = productSmallChunkVal(divisorChunks, guess);
                if (compareAbsoluteChunks(checkProduct, partialDividend) <= 0) break;
                guess--;
            } while (guess);

            quotientResult.push(guess);
            partialDividend = diffChunks(partialDividend, checkProduct); // Subtract `guess * divisor` from partial dividend
        }

        quotientResult.reverse(); // Digits were pushed in reverse order
        return [chunksToJsNum(quotientResult), chunksToJsNum(partialDividend)];
    }

    /**
     * Divides an array of number chunks by a small integer.
     * @param {number[]} chunkArr - The array of chunks to divide.
     * @param {number} smallDivisor - The small integer divisor.
     * @returns {[number[], number]} An array containing [quotientChunks, remainder].
     */
    function divideChunksBySmall(chunkArr, smallDivisor) {
        const len = chunkArr.length;
        const quotientResult = makeZeroFilledArray(len);
        const base = CHUNK_SIZE_BASE;
        let remainder = 0;
        let currentDividend, q;

        for (let i = len - 1; i >= 0; --i) {
            currentDividend = remainder * base + chunkArr[i];
            q = floorOrCeil(currentDividend / smallDivisor);
            remainder = currentDividend - q * smallDivisor; // Calculate remainder for next iteration
            quotientResult[i] = q | 0; // Ensure integer
        }
        return [quotientResult, remainder | 0];
    }

    /**
     * Performs division and modulo operation for any two numeric objects.
     * @param {NumBase} selfNum - The dividend.
     * @param {NumBase|number|string} operand - The divisor.
     * @returns {[LargeNum|TinyNum, LargeNum|TinyNum]} An array containing [quotient, remainder].
     */
    function divideAny(selfNum, operand) {
        const otherNum = parseInputVal(operand);
        const currentVal = selfNum.value;
        const otherVal = otherNum.value;
        let quotientResult;

        // Guard against division by zero
        if (otherNum.isZeroValue()) {
            throw new Error("Division by zero is not allowed.");
        }

        // Special handling for small numbers
        if (selfNum.isTiny) {
            if (otherNum.isTiny) {
                return [new TinyNum(floorOrCeil(currentVal / otherVal)), new TinyNum(currentVal % otherVal)];
            }
            // If dividend is tiny but divisor is large, quotient is 0, remainder is dividend
            return [NumBase.ZERO, selfNum];
        }

        // Special handling for small divisor
        if (otherNum.isTiny) {
            const smallDivisor = otherNum.value;
            if (smallDivisor === 1) return [selfNum, NumBase.ZERO];
            if (smallDivisor === -1) return [selfNum.flipSign(), NumBase.ZERO];

            const absSmallDivisor = Math.abs(smallDivisor);
            if (absSmallDivisor < CHUNK_SIZE_BASE) {
                const divisionResult = divideChunksBySmall(currentVal, absSmallDivisor);
                quotientResult = chunksToJsNum(divisionResult[0]);
                let remainder = divisionResult[1];

                // Adjust remainder sign
                if (selfNum.isNegative) remainder = -remainder;

                let finalQuotient;
                if (typeof quotientResult === "number") {
                    finalQuotient = new TinyNum(selfNum.isNegative !== otherNum.isNegative ? -quotientResult : quotientResult);
                } else {
                    finalQuotient = new LargeNum(quotientResult, selfNum.isNegative !== otherNum.isNegative);
                }
                return [finalQuotient, new TinyNum(remainder)];
            }
            // If smallDivisor is still large enough to be represented by multiple chunks
            // Fall through to general division
            // otherVal = splitJsNumToChunks(absSmallDivisor); // This line is implicit in general case
        }

        // General case: both numbers are potentially large
        const comparison = compareAbsoluteChunks(currentVal, otherVal);
        if (comparison === -1) return [NumBase.ZERO, selfNum]; // Dividend < Divisor
        if (comparison === 0) return [new TinyNum(selfNum.isNegative !== otherNum.isNegative ? -1 : 1), NumBase.ZERO]; // Dividend == Divisor

        // Choose division algorithm based on magnitude (heuristic)
        let divisionValues;
        if (currentVal.length + otherVal.length <= 200) { // Threshold can be tuned
            divisionValues = longDivisionAlgorithm(currentVal, otherVal);
        } else {
            divisionValues = shortDivisionAlgorithm(currentVal, otherVal);
        }

        quotientResult = divisionValues[0];
        const remainderResult = divisionValues[1];

        const quotientIsNegative = selfNum.isNegative !== otherNum.isNegative;
        const remainderIsNegative = selfNum.isNegative; // Remainder sign matches dividend

        let finalQuotient, finalRemainder;

        if (typeof quotientResult === "number") {
            finalQuotient = new TinyNum(quotientIsNegative ? -quotientResult : quotientResult);
        } else {
            finalQuotient = new LargeNum(quotientResult, quotientIsNegative);
        }

        if (typeof remainderResult === "number") {
            finalRemainder = new TinyNum(remainderIsNegative ? -remainderResult : remainderResult);
        } else {
            finalRemainder = new LargeNum(remainderResult, remainderIsNegative);
        }

        return [finalQuotient, finalRemainder];
    }

    /**
     * Returns an object containing the quotient and remainder of the division.
     * @param {NumBase|number|string} operand - The divisor.
     * @returns {{quotient: LargeNum|TinyNum, remainder: LargeNum|TinyNum}} The division result.
     */
    LargeNum.prototype.getDivModResult = function (operand) {
        const result = divideAny(this, operand);
        return {
            quotient: result[0],
            remainder: result[1]
        };
    };
    TinyNum.prototype.getDivModResult = LargeNum.prototype.getDivModResult; // Share method

    /**
     * Returns the quotient of the division.
     * @param {NumBase|number|string} operand - The divisor.
     * @returns {LargeNum|TinyNum} The quotient.
     */
    LargeNum.prototype.getQuotient = function (operand) {
        return divideAny(this, operand)[0];
    };
    TinyNum.prototype.over = TinyNum.prototype.getQuotient; // Alias
    TinyNum.prototype.getQuotient = LargeNum.prototype.getQuotient; // Share method
    LargeNum.prototype.over = LargeNum.prototype.getQuotient; // Alias

    /**
     * Returns the remainder of the division.
     * @param {NumBase|number|string} operand - The divisor.
     * @returns {LargeNum|TinyNum} The remainder.
     */
    LargeNum.prototype.getRemainder = function (operand) {
        return divideAny(this, operand)[1];
    };
    TinyNum.prototype.remainder = TinyNum.prototype.getRemainder; // Alias
    TinyNum.prototype.getRemainder = LargeNum.prototype.getRemainder; // Share method
    LargeNum.prototype.remainder = LargeNum.prototype.getRemainder; // Alias

    /**
     * Computes this number raised to the power of an exponent.
     * @param {NumBase|number|string} exponent - The exponent.
     * @returns {LargeNum|TinyNum} The result of the exponentiation.
     */
    LargeNum.prototype.powerOf = function (exponent) {
        const expNum = parseInputVal(exponent);
        const baseVal = this.value;
        const expVal = expNum.value;
        let result;

        // Handle special cases for exponent
        if (expVal === 0) return NumBase.ONE;
        if (baseVal === 0) return NumBase.ZERO;
        if (baseVal === 1) return NumBase.ONE;
        if (baseVal === -1) return expNum.isParityEven() ? NumBase.ONE : NumBase.MINUS_ONE;

        // Negative exponent -> result is 0 for integers
        if (expNum.isNegative) {
            return NumBase.ZERO;
        }
        // Exponent too large for practical computation
        if (!expNum.isTiny) {
            throw new Error(`The exponent ${expNum.toNumeralString()} is too large.`);
        }

        // If base is small, try native Math.pow
        if (this.isTiny) {
            const nativeResult = Math.pow(baseVal, expVal);
            if (isJsSafeInt(nativeResult)) {
                return new TinyNum(floorOrCeil(nativeResult));
            }
        }

        let currentBase = this;
        let finalResult = NumBase.ONE;
        let powerCounter = expVal;

        // Binary exponentiation (exponentiation by squaring)
        while (powerCounter > 0) {
            if (powerCounter % 2 === 1) { // If exponent is odd
                finalResult = finalResult.multiply(currentBase);
            }
            if (powerCounter === 1) break; // Optimization: if powerCounter is 1, next will be 0, no need to square
            currentBase = currentBase.square();
            powerCounter = Math.floor(powerCounter / 2);
        }
        return finalResult;
    };
    TinyNum.prototype.powerOf = LargeNum.prototype.powerOf; // Share method

    /**
     * Computes (base ^ exponent) mod modulus.
     * @param {NumBase|number|string} exponent - The exponent.
     * @param {NumBase|number|string} modulus - The modulus.
     * @returns {LargeNum|TinyNum} The result of the modular exponentiation.
     */
    LargeNum.prototype.modularExponentiation = function (exponent, modulus) {
        let exp = parseInputVal(exponent);
        let mod = parseInputVal(modulus);

        if (mod.isZeroValue()) {
            throw new Error("Cannot take modular exponentiation with modulus 0.");
        }

        let result = NumBase.ONE;
        let base = this.getRemainder(mod); // base = this % mod

        while (exp.isPositiveSign()) {
            if (base.isZeroValue()) return NumBase.ZERO; // Optimization: 0^exp mod mod = 0 if exp > 0
            if (exp.isParityOdd()) {
                result = result.multiply(base).getRemainder(mod);
            }
            exp = exp.getQuotient(2); // exp = exp / 2
            base = base.square().getRemainder(mod); // base = (base^2) % mod
        }
        return result;
    };
    TinyNum.prototype.modularExponentiation = LargeNum.prototype.modularExponentiation; // Share method

    /**
     * Compares the absolute values of two chunk arrays.
     * @param {number[]} arrA - First array of chunks.
     * @param {number[]} arrB - Second array of chunks.
     * @returns {number} -1 if |arrA| < |arrB|, 0 if |arrA| == |arrB|, 1 if |arrA| > |arrB|.
     */
    function compareAbsoluteChunks(arrA, arrB) {
        if (arrA.length !== arrB.length) {
            return arrA.length > arrB.length ? 1 : -1;
        }
        for (let i = arrA.length - 1; i >= 0; i--) {
            if (arrA[i] !== arrB[i]) {
                return arrA[i] > arrB[i] ? 1 : -1;
            }
        }
        return 0; // Arrays are identical
    }

    /**
     * Compares the absolute value of this LargeNum with another number.
     * @param {NumBase|number|string} operand - The number to compare with.
     * @returns {number} -1 if |this| < |operand|, 0 if |this| == |operand|, 1 if |this| > |operand|.
     */
    LargeNum.prototype.compareAbsolute = function (operand) {
        const otherNum = parseInputVal(operand);
        const currentVal = this.value;
        const otherVal = otherNum.value;
        if (otherNum.isTiny) {
            // If otherNum is tiny, convert it to chunks for comparison
            return compareAbsoluteChunks(currentVal, splitJsNumToChunks(Math.abs(otherVal)));
        }
        return compareAbsoluteChunks(currentVal, otherVal);
    };

    /**
     * Compares the absolute value of this TinyNum with another number.
     * @param {NumBase|number|string} operand - The number to compare with.
     * @returns {number} -1 if |this| < |operand|, 0 if |this| == |operand|, 1 if |this| > |operand|.
     */
    TinyNum.prototype.compareAbsolute = function (operand) {
        const otherNum = parseInputVal(operand);
        const currentAbsVal = Math.abs(this.value);
        const otherVal = otherNum.value;
        if (otherNum.isTiny) {
            const otherAbsVal = Math.abs(otherVal);
            return currentAbsVal === otherAbsVal ? 0 : (currentAbsVal > otherAbsVal ? 1 : -1);
        }
        // If otherNum is large, this TinyNum is definitively smaller (in absolute terms)
        return -1;
    };

    /**
     * Compares this LargeNum with another number, considering signs.
     * @param {NumBase|number|string|Infinity} operand - The number to compare with.
     * @returns {number} -1 if this < operand, 0 if this == operand, 1 if this > operand.
     */
    LargeNum.prototype.compareWith = function (operand) {
        // Handle special JS Infinity values
        if (operand === Infinity) return -1;
        if (operand === -Infinity) return 1;

        const otherNum = parseInputVal(operand);
        const currentVal = this.value;
        const otherVal = otherNum.value;

        // Different signs: positive is always greater than negative
        if (this.isNegative !== otherNum.isNegative) {
            return otherNum.isNegative ? 1 : -1;
        }

        // If one is tiny and the other is large, and signs are same, the large one is greater
        if (otherNum.isTiny) {
            // If `this` is LargeNum and `otherNum` is TinyNum, `this` is greater unless `this` is 0
            if (this.isZeroValue() && otherNum.isZeroValue()) return 0;
            if (this.isNegative) {
                return -1; // Negative large is smaller than negative tiny (e.g. -100 vs -5)
            } else {
                return 1; // Positive large is greater than positive tiny (e.g. 100 vs 5)
            }
        }

        // Same signs, both large numbers: compare absolute values, then adjust for sign
        const absoluteComparison = compareAbsoluteChunks(currentVal, otherVal);
        return this.isNegative ? -absoluteComparison : absoluteComparison;
    };
    LargeNum.prototype.compareTo = LargeNum.prototype.compareWith; // Alias

    /**
     * Compares this TinyNum with another number, considering signs.
     * @param {NumBase|number|string|Infinity} operand - The number to compare with.
     * @returns {number} -1 if this < operand, 0 if this == operand, 1 if this > operand.
     */
    TinyNum.prototype.compareWith = function (operand) {
        if (operand === Infinity) return -1;
        if (operand === -Infinity) return 1;

        const otherNum = parseInputVal(operand);
        const currentVal = this.value;
        const otherVal = otherNum.value;

        // Both are tiny: native comparison
        if (otherNum.isTiny) {
            return currentVal === otherVal ? 0 : (currentVal > otherVal ? 1 : -1);
        }

        // One tiny, one large: compare signs first
        if (currentVal < 0 !== otherNum.isNegative) {
            return currentVal < 0 ? -1 : 1; // Negative tiny is smaller than positive large, positive tiny is smaller than negative large
        }

        // Same signs, one tiny, one large:
        // If currentVal is positive, and otherNum is LargeNum and positive, currentVal < otherNum.
        // If currentVal is negative, and otherNum is LargeNum and negative, currentVal > otherNum.
        return currentVal < 0 ? 1 : -1;
    };
    TinyNum.prototype.compareTo = TinyNum.prototype.compareWith; // Alias

    /**
     * Checks if this number is equal to another.
     * @param {NumBase|number|string} operand - The number to compare with.
     * @returns {boolean} True if equal, false otherwise.
     */
    LargeNum.prototype.isEqualTo = function (operand) {
        return this.compareWith(operand) === 0;
    };
    TinyNum.prototype.eq = TinyNum.prototype.isEqualTo; // Alias
    TinyNum.prototype.isEqualTo = LargeNum.prototype.isEqualTo; // Share method
    LargeNum.prototype.eq = LargeNum.prototype.isEqualTo; // Alias

    /**
     * Checks if this number is not equal to another.
     * @param {NumBase|number|string} operand - The number to compare with.
     * @returns {boolean} True if not equal, false otherwise.
     */
    LargeNum.prototype.isNotEqualTo = function (operand) {
        return this.compareWith(operand) !== 0;
    };
    TinyNum.prototype.neq = TinyNum.prototype.isNotEqualTo; // Alias
    TinyNum.prototype.isNotEqualTo = LargeNum.prototype.isNotEqualTo; // Share method
    LargeNum.prototype.neq = LargeNum.prototype.isNotEqualTo; // Alias

    /**
     * Checks if this number is strictly greater than another.
     * @param {NumBase|number|string} operand - The number to compare with.
     * @returns {boolean} True if greater, false otherwise.
     */
    LargeNum.prototype.isGreaterThan = function (operand) {
        return this.compareWith(operand) > 0;
    };
    TinyNum.prototype.gt = TinyNum.prototype.isGreaterThan; // Alias
    TinyNum.prototype.isGreaterThan = LargeNum.prototype.isGreaterThan; // Share method
    LargeNum.prototype.gt = LargeNum.prototype.isGreaterThan; // Alias

    /**
     * Checks if this number is strictly lesser than another.
     * @param {NumBase|number|string} operand - The number to compare with.
     * @returns {boolean} True if lesser, false otherwise.
     */
    LargeNum.prototype.isLesserThan = function (operand) {
        return this.compareWith(operand) < 0;
    };
    TinyNum.prototype.lt = TinyNum.prototype.isLesserThan; // Alias
    TinyNum.prototype.isLesserThan = LargeNum.prototype.isLesserThan; // Share method
    LargeNum.prototype.lt = LargeNum.prototype.isLesserThan; // Alias

    /**
     * Checks if this number is greater than or equal to another.
     * @param {NumBase|number|string} operand - The number to compare with.
     * @returns {boolean} True if greater or equal, false otherwise.
     */
    LargeNum.prototype.isGte = function (operand) {
        return this.compareWith(operand) >= 0;
    };
    TinyNum.prototype.geq = TinyNum.prototype.isGte; // Alias
    TinyNum.prototype.isGte = LargeNum.prototype.isGte; // Share method
    LargeNum.prototype.geq = LargeNum.prototype.isGte; // Alias

    /**
     * Checks if this number is lesser than or equal to another.
     * @param {NumBase|number|string} operand - The number to compare with.
     * @returns {boolean} True if lesser or equal, false otherwise.
     */
    LargeNum.prototype.isLte = function (operand) {
        return this.compareWith(operand) <= 0;
    };
    TinyNum.prototype.leq = TinyNum.prototype.isLte; // Alias
    TinyNum.prototype.isLte = LargeNum.prototype.isLte; // Share method
    LargeNum.prototype.leq = LargeNum.prototype.isLte; // Alias

    /**
     * Checks if this LargeNum is even.
     * @returns {boolean} True if even, false if odd.
     */
    LargeNum.prototype.isParityEven = function () {
        return (this.value[0] & 1) === 0;
    };

    /**
     * Checks if this TinyNum is even.
     * @returns {boolean} True if even, false if odd.
     */
    TinyNum.prototype.isParityEven = function () {
        return (this.value & 1) === 0;
    };

    /**
     * Checks if this LargeNum is odd.
     * @returns {boolean} True if odd, false if even.
     */
    LargeNum.prototype.isParityOdd = function () {
        return (this.value[0] & 1) === 1;
    };

    /**
     * Checks if this TinyNum is odd.
     * @returns {boolean} True if odd, false if even.
     */
    TinyNum.prototype.isParityOdd = function () {
        return (this.value & 1) === 1;
    };

    /**
     * Checks if this LargeNum is positive.
     * @returns {boolean} True if positive, false otherwise.
     */
    LargeNum.prototype.isPositiveSign = function () {
        return !this.isNegative;
    };

    /**
     * Checks if this TinyNum is positive.
     * @returns {boolean} True if positive, false otherwise.
     */
    TinyNum.prototype.isPositiveSign = function () {
        return this.value > 0;
    };

    /**
     * Checks if this LargeNum is negative.
     * @returns {boolean} True if negative, false otherwise.
     */
    LargeNum.prototype.isNegativeSign = function () {
        return this.isNegative;
    };

    /**
     * Checks if this TinyNum is negative.
     * @returns {boolean} True if negative, false otherwise.
     */
    TinyNum.prototype.isNegativeSign = function () {
        return this.value < 0;
    };

    /**
     * Checks if this LargeNum has an absolute value of 1.
     * @returns {boolean} Always false for a LargeNum (by definition of TinyNum).
     */
    LargeNum.prototype.isUnity = function () {
        return false;
    };

    /**
     * Checks if this TinyNum has an absolute value of 1.
     * @returns {boolean} True if absolute value is 1, false otherwise.
     */
    TinyNum.prototype.isUnity = function () {
        return Math.abs(this.value) === 1;
    };

    /**
     * Checks if this LargeNum is zero.
     * @returns {boolean} Always false for a LargeNum (by definition of TinyNum).
     */
    LargeNum.prototype.isZeroValue = function () {
        return false;
    };

    /**
     * Checks if this TinyNum is zero.
     * @returns {boolean} True if value is 0, false otherwise.
     */
    TinyNum.prototype.isZeroValue = function () {
        return this.value === 0;
    };

    /**
     * Checks if this number is divisible by another number.
     * @param {NumBase|number|string} operand - The divisor.
     * @returns {boolean} True if divisible, false otherwise.
     */
    LargeNum.prototype.isDivisibleByOther = function (operand) {
        const otherNum = parseInputVal(operand);
        const otherVal = otherNum.value;

        if (otherVal === 0) return false; // Cannot divide by zero
        if (otherVal === 1) return true; // Any number is divisible by 1
        if (otherVal === 2) return this.isParityEven(); // Optimized check for 2

        // General case: check if remainder is zero
        return this.getRemainder(otherNum).isEqualTo(NumBase.ZERO);
    };
    TinyNum.prototype.isDivisibleByOther = LargeNum.prototype.isDivisibleByOther; // Share method

    /**
     * Checks if a number is a small prime candidate (2, 3, 5, etc.).
     * @param {NumBase} num - The number to check.
     * @returns {boolean|undefined} True if prime, false if composite, undefined if unknown (needs Miller-Rabin).
     */
    function isSmallPrimeCandidate(num) {
        const absNum = num.absoluteVal();
        if (absNum.isUnity()) return false; // 1 is not prime
        if (absNum.isEqualTo(2) || absNum.isEqualTo(3) || absNum.isEqualTo(5)) return true; // Small primes
        if (absNum.isParityEven() || absNum.isDivisibleByOther(3) || absNum.isDivisibleByOther(5)) return false; // Divisible by 2, 3, or 5
        if (absNum.isLesserThan(25)) return true; // Numbers < 25 not divisible by 2,3,5 (7,11,13,17,19,23) are prime
        return void 0; // Not a basic prime, needs further testing
    }

    /**
     * Determines if this LargeNum is a prime number using Miller-Rabin primality test.
     * @returns {boolean} True if prime, false otherwise.
     */
    LargeNum.prototype.checkPrime = function () {
        const basicCheck = isSmallPrimeCandidate(this);
        if (basicCheck !== void 0) return basicCheck;

        const num = this.absoluteVal();
        const numMinusOne = num.decrement(); // n - 1

        // Miller-Rabin specific values
        const smallPrimes = [2, 3, 5, 7, 11, 13, 17, 19];
        let d = numMinusOne;
        let t; // Flag for inner loop

        // Find d and s such that n-1 = d * 2^s, where d is odd
        while (d.isParityEven()) {
            d = d.getQuotient(2);
        }

        // Perform Miller-Rabin test for each small prime 'a'
        for (let i = 0; i < smallPrimes.length; i++) {
            const a = NumBase(smallPrimes[i]);
            let x = a.modularExponentiation(d, num); // x = a^d mod n

            if (x.isEqualTo(NumBase.ONE) || x.isEqualTo(numMinusOne)) {
                continue; // Witness passes, continue to next 'a'
            }

            // Check if x^(2^r) mod n is n-1 for some 0 <= r < s
            t = true; // Assume witness fails initially
            for (let currentD = d; t && currentD.isLesserThan(numMinusOne); currentD = currentD.multiply(2)) {
                x = x.square().getRemainder(num);
                if (x.isEqualTo(numMinusOne)) {
                    t = false; // Witness passes
                }
            }
            if (t) return false; // Witness failed, n is composite
        }
        return true; // Passed all witnesses, n is probably prime
    };
    TinyNum.prototype.checkPrime = LargeNum.prototype.checkPrime; // Share method

    /**
     * Determines if this LargeNum is a probable prime using Miller-Rabin test with random bases.
     * @param {number} [iterations=5] - Number of iterations (witnesses) to test.
     * @returns {boolean} True if probable prime, false otherwise.
     */
    LargeNum.prototype.checkProbablePrime = function (iterations) {
        const basicCheck = isSmallPrimeCandidate(this);
        if (basicCheck !== void 0) return basicCheck;

        const num = this.absoluteVal();
        const numMinusOne = num.decrement();
        const numMinusTwo = num.subtract(2); // For randBetween(2, n-2)

        const testCount = iterations === void 0 ? 5 : iterations;

        for (let i = 0; i < testCount; i++) {
            const a = NumBase.randomBetween(2, numMinusTwo); // Pick random 'a' in [2, n-2]
            if (!a.modularExponentiation(numMinusOne, num).isUnity()) { // Check a^(n-1) = 1 (mod n)
                return false; // Composite
            }
        }
        return true; // Probably prime
    };
    TinyNum.prototype.checkProbablePrime = LargeNum.prototype.checkProbablePrime; // Share method

    /**
     * Computes the modular multiplicative inverse of this number modulo n.
     * (this * x) % n == 1
     * Uses Extended Euclidean Algorithm.
     * @param {NumBase|number|string} modulus - The modulus.
     * @returns {LargeNum|TinyNum} The modular inverse.
     * @throws {Error} If `this` and `modulus` are not co-prime.
     */
    LargeNum.prototype.modularInverse = function (modulus) {
        let t_val = NumBase.ZERO;
        let new_t_val = NumBase.ONE;
        let r_val = parseInputVal(modulus);
        let new_r_val = this.absoluteVal(); // Use absolute value for calculations

        let q_val, last_t_val, last_r_val;

        // Extended Euclidean Algorithm
        while (!new_r_val.isZeroValue()) {
            q_val = r_val.getQuotient(new_r_val); // quotient = r / newR
            last_t_val = t_val;
            last_r_val = r_val;

            t_val = new_t_val;
            r_val = new_r_val;

            new_t_val = last_t_val.subtract(q_val.multiply(new_t_val)); // newT = lastT - quotient * newT
            new_r_val = last_r_val.subtract(q_val.multiply(new_r_val)); // newR = lastR - quotient * newR
        }

        if (!r_val.isEqualTo(1)) {
            throw new Error(`${this.toNumeralString()} and ${modulus.toNumeralString()} are not co-prime.`);
        }

        // Adjust result to be positive within [0, modulus-1]
        if (t_val.compareWith(0) === -1) {
            t_val = t_val.add(modulus);
        }

        // Adjust sign if original number was negative
        if (this.isNegativeSign()) {
            return t_val.flipSign();
        }
        return t_val;
    };
    TinyNum.prototype.modularInverse = LargeNum.prototype.modularInverse; // Share method

    /**
     * Returns the next integer (this + 1).
     * @returns {LargeNum|TinyNum} The incremented number.
     */
    LargeNum.prototype.increment = function () {
        const currentVal = this.value;
        if (this.isNegative) {
            // For negative numbers, next is |N|-1, then negate (e.g., -5 -> -(5-1) = -4)
            return diffSmallChunkVal(currentVal, 1, this.isNegative);
        }
        return new LargeNum(sumSmallChunkVal(currentVal, 1), this.isNegative);
    };

    /**
     * Returns the next integer (this + 1).
     * @returns {LargeNum|TinyNum} The incremented number.
     */
    TinyNum.prototype.increment = function () {
        const currentVal = this.value;
        if (currentVal + 1 < JS_SAFE_MAX) {
            return new TinyNum(currentVal + 1);
        }
        // If it exceeds safe int, convert to LargeNum
        return new LargeNum(JS_SAFE_MAX_PARTS, false);
    };

    /**
     * Returns the previous integer (this - 1).
     * @returns {LargeNum|TinyNum} The decremented number.
     */
    LargeNum.prototype.decrement = function () {
        const currentVal = this.value;
        if (this.isNegative) {
            // For negative numbers, prev is |N|+1, then negate (e.g., -5 -> -(5+1) = -6)
            return new LargeNum(sumSmallChunkVal(currentVal, 1), true);
        }
        return diffSmallChunkVal(currentVal, 1, this.isNegative);
    };

    /**
     * Returns the previous integer (this - 1).
     * @returns {LargeNum|TinyNum} The decremented number.
     */
    TinyNum.prototype.decrement = function () {
        const currentVal = this.value;
        if (currentVal - 1 > -JS_SAFE_MAX) {
            return new TinyNum(currentVal - 1);
        }
        // If it goes below safe int, convert to LargeNum
        const negativeMaxParts = JS_SAFE_MAX_PARTS.slice(); // Copy to avoid modifying constant
        return new LargeNum(negativeMaxParts, true);
    };

    // Pre-calculate powers of 2 up to CHUNK_SIZE_BASE for efficient bit shifting
    const POW_OF_TWO_CACHE = [1];
    while (2 * POW_OF_TWO_CACHE[POW_OF_TWO_CACHE.length - 1] <= CHUNK_SIZE_BASE) {
        POW_OF_TWO_CACHE.push(2 * POW_OF_TWO_CACHE[POW_OF_TWO_CACHE.length - 1]);
    }
    const POW_TWO_CACHE_LEN = POW_OF_TWO_CACHE.length;
    const MAX_POW_TWO_CHUNK = POW_OF_TWO_CACHE[POW_TWO_CACHE_LEN - 1];

    /**
     * Checks if the shift amount is small enough for optimized handling.
     * @param {number|string|NumBase} shiftAmount - The amount to shift.
     * @returns {boolean} True if small, false otherwise.
     */
    function isShiftAmountSmall(shiftAmount) {
        return (typeof shiftAmount === "number" || typeof shiftAmount === "string") &&
            +Math.abs(shiftAmount) <= CHUNK_SIZE_BASE ||
            (shiftAmount instanceof LargeNum && shiftAmount.value.length <= 1);
    }

    /**
     * Performs a left bit shift operation.
     * @param {NumBase|number|string} shiftAmount - The number of bits to shift.
     * @returns {LargeNum|TinyNum} The shifted number.
     * @throws {Error} If shift amount is too large.
     */
    LargeNum.prototype.shiftBitsLeft = function (shiftAmount) {
        if (!isShiftAmountSmall(shiftAmount)) {
            throw new Error(`Shift amount ${String(shiftAmount)} is too large for shifting.`);
        }
        let shiftVal = +shiftAmount;
        if (shiftVal < 0) return this.shiftBitsRight(-shiftVal); // Delegate to right shift for negative shifts

        let currentResult = this;
        if (currentResult.isZeroValue()) return currentResult;

        // Perform shifts in chunks of MAX_POW_TWO_CHUNK
        while (shiftVal >= POW_TWO_CACHE_LEN) {
            currentResult = currentResult.multiply(MAX_POW_TWO_CHUNK);
            shiftVal -= (POW_TWO_CACHE_LEN - 1); // Each multiply shifts by highestPower2, which corresponds to POW_TWO_CACHE_LEN-1 bits
        }
        return currentResult.multiply(POW_OF_TWO_CACHE[shiftVal]);
    };
    TinyNum.prototype.shiftBitsLeft = LargeNum.prototype.shiftBitsLeft; // Share method

    /**
     * Performs a right bit shift operation.
     * @param {NumBase|number|string} shiftAmount - The number of bits to shift.
     * @returns {LargeNum|TinyNum} The shifted number.
     * @throws {Error} If shift amount is too large.
     */
    LargeNum.prototype.shiftBitsRight = function (shiftAmount) {
        let divModPair;
        if (!isShiftAmountSmall(shiftAmount)) {
            throw new Error(`Shift amount ${String(shiftAmount)} is too large for shifting.`);
        }
        let shiftVal = +shiftAmount;
        if (shiftVal < 0) return this.shiftBitsLeft(-shiftVal); // Delegate to left shift for negative shifts

        let currentResult = this;
        // Optimization for zero or -1 (unit)
        if (currentResult.isZeroValue() || (currentResult.isNegativeSign() && currentResult.isUnity())) return currentResult;

        // Perform shifts in chunks of MAX_POW_TWO_CHUNK
        while (shiftVal >= POW_TWO_CACHE_LEN) {
            divModPair = divideAny(currentResult, MAX_POW_TWO_CHUNK);
            // Adjust quotient for negative numbers (floor division vs truncate)
            currentResult = divModPair[1].isNegativeSign() ? divModPair[0].decrement() : divModPair[0];
            if (currentResult.isZeroValue() || (currentResult.isNegativeSign() && currentResult.isUnity())) return currentResult;
            shiftVal -= (POW_TWO_CACHE_LEN - 1);
        }
        divModPair = divideAny(currentResult, POW_OF_TWO_CACHE[shiftVal]);
        return divModPair[1].isNegativeSign() ? divModPair[0].decrement() : divModPair[0];
    };
    TinyNum.prototype.shiftBitsRight = LargeNum.prototype.shiftBitsRight; // Share method

    // Masks for roughLOB (lowest one bit) calculation
    const LOWER_BITS_MASK_SMALL = 1 << 30; // For small integers
    const LOWER_BITS_MASK_LARGE = (CHUNK_SIZE_BASE & -CHUNK_SIZE_BASE) * (CHUNK_SIZE_BASE & -CHUNK_SIZE_BASE) | LOWER_BITS_MASK_SMALL; // For chunk array elements

    /**
     * Calculates the lowest one bit (LSB) mask for a number.
     * Used in GCD calculation.
     * @param {NumBase} num - The number.
     * @returns {number} The LSB mask.
     */
    function getRoughLowestOneBit(num) {
        const val = num.value;
        // If it's a small number, use native bitwise ops
        if (typeof val === "number") {
            return val | LOWER_BITS_MASK_SMALL; // Ensure it's a 32-bit int
        }
        // For large numbers, consider the lowest chunk
        return val[0] + val[1] * CHUNK_SIZE_BASE | LOWER_BITS_MASK_LARGE;
    }

    /**
     * Performs a bitwise operation (AND, OR, XOR) on two numbers.
     * @param {NumBase} numX - First operand.
     * @param {NumBase|number|string} numY - Second operand.
     * @param {function(number, number): number} bitwiseFn - The bitwise function to apply.
     * @returns {LargeNum|TinyNum} The result of the bitwise operation.
     */
    function performBitwiseOp(numX, numY, bitwiseFn) {
        const otherNum = parseInputVal(numY);

        const xIsNegative = numX.isNegativeSign();
        const yIsNegative = otherNum.isNegativeSign();

        // Convert negative numbers to two's complement representation for bitwise ops
        let xAbs = xIsNegative ? numX.bitwiseNot() : numX;
        let yAbs = yIsNegative ? otherNum.bitwiseNot() : otherNum;

        const resultChunks = [];
        let xChunkVal = 0,
            yChunkVal = 0;
        let xDivMod = null,
            yDivMod = null;

        // Process chunks from LSB upwards
        while (!xAbs.isZeroValue() || !yAbs.isZeroValue()) {
            xDivMod = divideAny(xAbs, MAX_POW_TWO_CHUNK);
            xChunkVal = xDivMod[1].toNativeNumber();
            if (xIsNegative) {
                xChunkVal = MAX_POW_TWO_CHUNK - 1 - xChunkVal; // Two's complement for this chunk
            }

            yDivMod = divideAny(yAbs, MAX_POW_TWO_CHUNK);
            yChunkVal = yDivMod[1].toNativeNumber();
            if (yIsNegative) {
                yChunkVal = MAX_POW_TWO_CHUNK - 1 - yChunkVal; // Two's complement for this chunk
            }

            xAbs = xDivMod[0];
            yAbs = yDivMod[0];
            resultChunks.push(bitwiseFn(xChunkVal, yChunkVal));
        }

        // Combine the last 'carry' bit if both were negative
        let finalSum = bitwiseFn(xIsNegative ? 1 : 0, yIsNegative ? 1 : 0) !== 0 ? NumBase.MINUS_ONE : NumBase.ZERO;

        // Reconstruct the number from result chunks
        for (let i = resultChunks.length - 1; i >= 0; i -= 1) {
            finalSum = finalSum.multiply(MAX_POW_TWO_CHUNK).add(NumBase(resultChunks[i]));
        }
        return finalSum;
    }

    /**
     * Computes bitwise NOT (~).
     * @returns {LargeNum|TinyNum} The result.
     */
    LargeNum.prototype.bitwiseNot = function () {
        return this.flipSign().decrement(); // ~N = -(N+1)
    };
    TinyNum.prototype.bitwiseNot = LargeNum.prototype.bitwiseNot; // Share method

    /**
     * Computes bitwise AND (&).
     * @param {NumBase|number|string} operand - Second operand.
     * @returns {LargeNum|TinyNum} The result.
     */
    LargeNum.prototype.bitwiseAnd = function (operand) {
        return performBitwiseOp(this, operand, (a, b) => a & b);
    };
    TinyNum.prototype.bitwiseAnd = LargeNum.prototype.bitwiseAnd; // Share method

    /**
     * Computes bitwise OR (|).
     * @param {NumBase|number|string} operand - Second operand.
     * @returns {LargeNum|TinyNum} The result.
     */
    LargeNum.prototype.bitwiseOr = function (operand) {
        return performBitwiseOp(this, operand, (a, b) => a | b);
    };
    TinyNum.prototype.bitwiseOr = LargeNum.prototype.bitwiseOr; // Share method

    /**
     * Computes bitwise XOR (^).
     * @param {NumBase|number|string} operand - Second operand.
     * @returns {LargeNum|TinyNum} The result.
     */
    LargeNum.prototype.bitwiseXor = function (operand) {
        return performBitwiseOp(this, operand, (a, b) => a ^ b);
    };
    TinyNum.prototype.bitwiseXor = LargeNum.prototype.bitwiseXor; // Share method

    /**
     * Computes the integer logarithm of 'value' with base 'base'.
     * @param {NumBase} value - The number to compute logarithm for.
     * @param {NumBase} base - The base of the logarithm.
     * @returns {{p: NumBase, e: number}} An object with 'p' (largest power of base <= value) and 'e' (exponent).
     */
    function calcIntegerLog(value, base) {
        // Base case for recursion: if base > value, then log is 0, and base^0 = 1
        if (base.compareWith(value) <= 0) {
            const tempResult = calcIntegerLog(value, base.square()); // log_b(N) = 2 * log_b^2(N)
            const pVal = tempResult.p;
            const eVal = tempResult.e;
            const testProduct = pVal.multiply(base); // Check if base * pVal is still <= value
            return testProduct.compareWith(value) <= 0 ? {
                p: testProduct,
                e: eVal * 2 + 1
            } : {
                p: pVal,
                e: eVal * 2
            };
        }
        return {
            p: NumBase(1),
            e: 0
        };
    }

    /**
     * Calculates the bit length (number of bits required to represent the number).
     * @returns {LargeNum} The bit length.
     */
    LargeNum.prototype.getBitLength = function () {
        let num = this;
        if (num.compareWith(NumBase.ZERO) < 0) {
            num = num.flipSign().subtract(NumBase.ONE); // For negative numbers, bit length of -(N+1)
        }
        if (num.compareWith(NumBase.ZERO) === 0) {
            return NumBase(0);
        }
        // Uses integer logarithm with base 2
        return NumBase(calcIntegerLog(num, NumBase(2)).e).add(NumBase(1));
    };
    TinyNum.prototype.getBitLength = LargeNum.prototype.getBitLength; // Share method

    /**
     * Returns the maximum of two numbers.
     * @param {NumBase|number|string} numA - First number.
     * @param {NumBase|number|string} numB - Second number.
     * @returns {NumBase} The larger number.
     */
    function findMax(numA, numB) {
        numA = parseInputVal(numA);
        numB = parseInputVal(numB);
        return numA.isGreaterThan(numB) ? numA : numB;
    }

    /**
     * Returns the minimum of two numbers.
     * @param {NumBase|number|string} numA - First number.
     * @param {NumBase|number|string} numB - Second number.
     * @returns {NumBase} The smaller number.
     */
    function findMin(numA, numB) {
        numA = parseInputVal(numA);
        numB = parseInputVal(numB);
        return numA.isLesserThan(numB) ? numA : numB;
    }

    /**
     * Computes the greatest common divisor (GCD) of two numbers using binary GCD algorithm.
     * @param {NumBase|number|string} numA - First number.
     * @param {NumBase|number|string} numB - Second number.
     * @returns {NumBase} The GCD.
     */
    function greatestCommonDivisor(numA, numB) {
        numA = parseInputVal(numA).absoluteVal();
        numB = parseInputVal(numB).absoluteVal();

        if (numA.isEqualTo(numB)) return numA;
        if (numA.isZeroValue()) return numB;
        if (numB.isZeroValue()) return numA;

        let commonFactor = NumBase.ONE;
        let dVal, tempNum;

        // Remove common factors of 2
        while (numA.isParityEven() && numB.isParityEven()) {
            dVal = Math.min(getRoughLowestOneBit(numA), getRoughLowestOneBit(numB));
            numA = numA.getQuotient(dVal);
            numB = numB.getQuotient(dVal);
            commonFactor = commonFactor.multiply(dVal);
        }
        // Remove factors of 2 from remaining 'a'
        while (numA.isParityEven()) {
            numA = numA.getQuotient(getRoughLowestOneBit(numA));
        }

        do {
            // Remove factors of 2 from 'b'
            while (numB.isParityEven()) {
                numB = numB.getQuotient(getRoughLowestOneBit(numB));
            }
            // Ensure a <= b
            if (numA.isGreaterThan(numB)) {
                tempNum = numB;
                numB = numA;
                numA = tempNum;
            }
            numB = numB.subtract(numA); // b = b - a
        } while (!numB.isZeroValue());

        return commonFactor.isUnity() ? numA : numA.multiply(commonFactor);
    }

    /**
     * Computes the least common multiple (LCM) of two numbers.
     * LCM(a, b) = |a * b| / GCD(a, b)
     * @param {NumBase|number|string} numA - First number.
     * @param {NumBase|number|string} numB - Second number.
     * @returns {NumBase} The LCM.
     */
    function leastCommonMultiple(numA, numB) {
        numA = parseInputVal(numA).absoluteVal();
        numB = parseInputVal(numB).absoluteVal();
        // Handle edge case if a or b is zero, LCM is zero
        if (numA.isZeroValue() || numB.isZeroValue()) return NumBase.ZERO;
        return numA.getQuotient(greatestCommonDivisor(numA, numB)).multiply(numB);
    }

    /**
     * Generates a random integer between 'min' and 'max' (inclusive).
     * @param {NumBase|number|string} minVal - The minimum value.
     * @param {NumBase|number|string} maxVal - The maximum value.
     * @returns {NumBase} A random number within the specified range.
     */
    function generateRandomBetween(minVal, maxVal) {
        let low = findMin(parseInputVal(minVal), parseInputVal(maxVal));
        let high = findMax(parseInputVal(minVal), parseInputVal(maxVal));
        const range = high.subtract(low).add(1);

        // If range fits in a small integer, use native Math.random
        if (range.isTiny) {
            return low.add(Math.floor(Math.random() * range.value));
        }

        const rangeLength = range.value.length - 1;
        const resultChunks = [];
        let restrictedUpper = true; // Flag to indicate if we're restricted by the upper bound of the range

        // Generate random chunks from most significant to least significant
        for (let i = rangeLength; i >= 0; i--) {
            const upperLimit = restrictedUpper ? range.value[i] : CHUNK_SIZE_BASE;
            const digit = floorOrCeil(Math.random() * (upperLimit + 1)); // Random digit up to upperLimit (inclusive)
            resultChunks.unshift(digit); // Add to the beginning
            if (digit < upperLimit) {
                restrictedUpper = false; // If we picked a digit smaller than max, subsequent digits are not restricted
            }
        }
        const randomChunkResult = chunksToJsNum(resultChunks);
        return low.add(typeof randomChunkResult === "number" ? new TinyNum(randomChunkResult) : new LargeNum(randomChunkResult, false));
    }

    /**
     * Parses a string representation of a number in a given base.
     * @param {string} textValue - The string to parse.
     * @param {number|NumBase} base - The base (radix) of the number.
     * @returns {NumBase} The parsed number.
     * @throws {Error} If the input string contains invalid digits for the base.
     */
    const parseFromBase = function (textValue, base) {
        const strLen = textValue.length;
        let digitIndex;
        const absBase = Math.abs(base); // Work with absolute base for digit validation

        // Validate all characters in the string against the provided base
        for (digitIndex = 0; digitIndex < strLen; digitIndex++) {
            const char = textValue[digitIndex].toLowerCase();
            if (char === "-") continue; // Allow negative sign at start

            if (/[a-z0-9]/.test(char)) {
                // Check if digit is valid for the base
                if (/[0-9]/.test(char)) {
                    if (Number(char) >= absBase) {
                        if (char === "1" && absBase === 1) continue; // Special case for base 1
                        throw new Error(`${char} is not a valid digit in base ${base}.`);
                    }
                } else if (char.charCodeAt(0) - 87 >= absBase) { // For 'a' through 'z'
                    throw new Error(`${char} is not a valid digit in base ${base}.`);
                }
            } else if (char !== "<") { // Allow custom digit notation '<digit>'
                throw new Error(`${char} is not a valid character for base ${base}.`);
            }
        }

        // Optimization for common bases that fit in native JS numbers
        if (base >= 2 && base <= 36) {
            // Check if the number of digits would exceed JS safe integer log length for this base
            if (strLen <= JS_SAFE_MAX_LOG / Math.log(base)) {
                const parsedNative = parseInt(textValue, base);
                if (isNaN(parsedNative)) {
                    throw new Error(`Failed to parse "${textValue}" as a number in base ${base}.`);
                }
                return new TinyNum(parsedNative);
            }
        }

        // For large numbers or custom bases, parse digit by digit
        const numBase = parseInputVal(base);
        const digitValues = [];
        const isNegative = textValue[0] === "-";

        for (digitIndex = isNegative ? 1 : 0; digitIndex < textValue.length; digitIndex++) {
            const char = textValue[digitIndex].toLowerCase();
            let charCode = char.charCodeAt(0);

            if (charCode >= 48 && charCode <= 57) { // '0' to '9'
                digitValues.push(parseInputVal(char));
            } else if (charCode >= 97 && charCode <= 122) { // 'a' to 'z'
                digitValues.push(parseInputVal(charCode - 87)); // 'a' is 10, 'b' is 11, etc.
            } else if (char === "<") { // Custom digit format <N>
                const startIdx = digitIndex;
                do {
                    digitIndex++;
                } while (textValue[digitIndex] !== ">" && digitIndex < textValue.length);
                if (digitIndex === textValue.length) {
                    throw new Error(`Unclosed custom digit in base ${base} string: "${textValue.substring(startIdx)}"`);
                }
                digitValues.push(parseInputVal(textValue.slice(startIdx + 1, digitIndex)));
            } else {
                throw new Error(`Invalid character "${char}" found in base ${base} string.`);
            }
        }
        return parseChunksFromBase(digitValues, numBase, isNegative);
    };

    /**
     * Constructs a number from an array of digits in a given base.
     * @param {NumBase[]} digitsArr - Array of digit values (as NumBase objects).
     * @param {NumBase} base - The base of the number.
     * @param {boolean} isNegative - True if the resulting number should be negative.
     * @returns {NumBase} The constructed number.
     */
    function parseChunksFromBase(digitsArr, base, isNegative) {
        let finalValue = NumBase.ZERO;
        let currentPower = NumBase.ONE;

        // Iterate from LSB to MSB (right to left)
        for (let i = digitsArr.length - 1; i >= 0; i--) {
            finalValue = finalValue.add(digitsArr[i].times(currentPower));
            currentPower = currentPower.times(base);
        }
        return isNegative ? finalValue.flipSign() : finalValue;
    }

    /**
     * Converts a digit (0-35) to its character representation.
     * @param {number} digit - The digit to convert.
     * @returns {string} The character representation.
     */
    function digitToChar(digit) {
        if (digit <= 35) {
            return "0123456789abcdefghijklmnopqrstuvwxyz".charAt(digit);
        }
        return `<${digit}>`; // For digits > 35
    }

    /**
     * Converts a number to an array of digits in a specified base.
     * @param {NumBase} num - The number to convert.
     * @param {NumBase} base - The target base.
     * @returns {{value: number[], isNegative: boolean}} Object with digit array and sign.
     * @throws {Error} If base is zero or negative.
     */
    function convertToBaseArray(num, base) {
        base = parseInputVal(base);

        if (base.isZeroValue()) {
            if (num.isZeroValue()) return {
                value: [0],
                isNegative: false
            };
            throw new Error("Cannot convert non-zero numbers to base 0.");
        }

        // Special case for base -1 (alternating base system)
        if (base.isEqualTo(-1)) {
            if (num.isZeroValue()) return {
                value: [0],
                isNegative: false
            };
            if (num.isNegativeSign()) {
                // For negative numbers, base -1 representation is tricky.
                // Example: -1 in base -1 is "11" (1*(-1)^1 + 1*(-1)^0 = -1+1 = 0, no... this is more complex)
                // The original logic is for positive numbers only, so let's keep it similar
                // Original: Array.apply(null,Array(-n)).map(Array.prototype.valueOf,[1,0])
                // This seems to represent `n` as alternating 1s and 0s.
                // Reimplementing this is out of scope for a clone, so simplify/remove if unclear.
                // Let's assume the original intended `num` to be positive for this case, or simplify.
                // For now, I'll attempt to replicate the original behavior.
                const count = num.flipSign().toNativeNumber();
                const tempArr = [];
                for (let k = 0; k < count; k++) {
                    tempArr.push([1, 0]);
                }
                return {
                    value: [].concat.apply([], tempArr),
                    isNegative: false
                };
            }
            // Original: Array.apply(null,Array(+n-1)).map(Array.prototype.valueOf,[0,1]); arr.unshift([1]);
            const count = num.toNativeNumber();
            const tempArr = [];
            for (let k = 0; k < count - 1; k++) {
                tempArr.push([0, 1]);
            }
            if (count > 0) tempArr.unshift([1]);
            return {
                value: [].concat.apply([], tempArr),
                isNegative: false
            };
        }

        let finalIsNegative = false;
        if (num.isNegativeSign() && base.isPositiveSign()) {
            finalIsNegative = true;
            num = num.absoluteVal();
        }

        // Special case for base 1
        if (base.isEqualTo(1)) {
            if (num.isZeroValue()) return {
                value: [0],
                isNegative: false
            };
            const digits = [];
            for (let k = 0; k < num.toNativeNumber(); k++) {
                digits.push(1);
            }
            return {
                value: digits,
                isNegative: finalIsNegative
            };
        }

        const digitArray = [];
        let currentLeft = num;
        let divModResult;

        // Repeatedly divide by base and collect remainders
        while (currentLeft.isNegativeSign() || currentLeft.compareAbsolute(base) >= 0) {
            divModResult = currentLeft.getDivModResult(base);
            currentLeft = divModResult.quotient;
            let digit = divModResult.remainder;

            // Handle negative remainders for non-standard bases (e.g., negative bases)
            if (digit.isNegativeSign()) {
                digit = base.minus(digit).absoluteVal(); // digit = |base - remainder|
                currentLeft = currentLeft.increment(); // Adjust quotient
            }
            digitArray.push(digit.toNativeNumber());
        }
        digitArray.push(currentLeft.toNativeNumber()); // Add the last quotient
        return {
            value: digitArray.reverse(),
            isNegative: finalIsNegative
        };
    }

    /**
     * Converts a number to its string representation in a given base.
     * @param {NumBase} num - The number to convert.
     * @param {NumBase|number|string} base - The target base.
     * @returns {string} The string representation.
     */
    function convertToBaseString(num, base) {
        const arr = convertToBaseArray(num, base);
        return (arr.isNegative ? "-" : "") + arr.value.map(digitToChar).join("");
    }

    /**
     * Converts this number to an array of digits in the specified radix.
     * @param {number} [radix=10] - The target base.
     * @returns {{value: number[], isNegative: boolean}} Object with digit array and sign.
     */
    LargeNum.prototype.toBaseDigits = function (radix) {
        return convertToBaseArray(this, radix);
    };
    TinyNum.prototype.toBaseDigits = function (radix) {
        return convertToBaseArray(this, radix);
    };

    /**
     * Converts this number to its string representation.
     * @param {number} [radix=10] - The target base.
     * @returns {string} The string representation.
     */
    LargeNum.prototype.toNumeralString = function (radix) {
        if (radix === void 0) radix = 10;
        if (radix !== 10) return convertToBaseString(this, radix);

        const val = this.value;
        let len = val.length;
        let resultStr = String(val[--len]); // Most significant chunk
        const zeroPad = "0000000"; // For padding chunks
        let currentDigit;

        while (--len >= 0) {
            currentDigit = String(val[len]);
            resultStr += zeroPad.slice(currentDigit.length) + currentDigit;
        }
        const finalSign = this.isNegative ? "-" : "";
        return `${finalSign}${resultStr}`;
    };

    /**
     * Converts this number to its string representation.
     * @param {number} [radix=10] - The target base.
     * @returns {string} The string representation.
     */
    TinyNum.prototype.toNumeralString = function (radix) {
        if (radix === void 0) radix = 10;
        if (radix !== 10) return convertToBaseString(this, radix);
        return String(this.value);
    };

    /**
     * Converts this number to its JSON string representation.
     * @returns {string} The JSON string.
     */
    LargeNum.prototype.toJSONString = TinyNum.prototype.toJSONString = function () {
        return this.toNumeralString();
    };

    /**
     * Returns the primitive value of the number, attempting to convert to a native JS number.
     * @returns {number} The native JS number.
     */
    LargeNum.prototype.toPrimitiveValue = function () {
        return parseInt(this.toNumeralString(), 10);
    };
    LargeNum.prototype.toNativeNumber = LargeNum.prototype.toPrimitiveValue; // Alias

    /**
     * Returns the primitive value of the number.
     * @returns {number} The native JS number.
     */
    TinyNum.prototype.toPrimitiveValue = function () {
        return this.value;
    };
    TinyNum.prototype.toNativeNumber = TinyNum.prototype.toPrimitiveValue; // Alias

    /**
     * Helper to safely parse an integer string using parseInt and check for NaN.
     * @param {string} str - The string to parse.
     * @param {number} radix - The radix.
     * @returns {number} The parsed integer.
     * @throws {Error} If parsing fails.
     */
    function tryParseInt(str, radix) {
        const num = parseInt(str, radix);
        if (isNaN(num)) {
            throw new Error(`Invalid integer string: "${str}"`);
        }
        return num;
    }

    /**
     * Parses a string value into a LargeNum object.
     * @param {string} strValue - The string to parse.
     * @returns {LargeNum} The parsed LargeNum.
     * @throws {Error} If the string is not a valid integer representation.
     */
    function parseStringRep(strValue) {
        // Check if it's a small integer first
        if (isJsSafeInt(+strValue)) {
            const num = +strValue;
            if (num === floorOrCeil(num)) return new TinyNum(num);
            throw new Error(`Invalid integer (has decimal part): ${strValue}`);
        }

        let isNegative = strValue[0] === "-";
        if (isNegative) strValue = strValue.slice(1);

        const expSplit = strValue.split(/e/i); // Handle scientific notation
        if (expSplit.length > 2) throw new Error(`Invalid integer (multiple 'e' characters): ${strValue}`);

        if (expSplit.length === 2) {
            let exponentStr = expSplit[1];
            if (exponentStr[0] === "+") exponentStr = exponentStr.slice(1);
            const exponentVal = tryParseInt(exponentStr, 10);

            if (exponentVal !== floorOrCeil(exponentVal) || !isJsSafeInt(exponentVal)) {
                throw new Error(`Invalid integer (invalid exponent): ${exponentVal}`);
            }

            let mainPart = expSplit[0];
            const decimalPointIdx = mainPart.indexOf(".");
            if (decimalPointIdx >= 0) {
                // Adjust exponent for decimal places
                const fractionalLength = mainPart.length - decimalPointIdx - 1;
                if (exponentVal < fractionalLength) {
                    throw new Error(`Cannot include fractional part with insufficient exponent: ${strValue}`);
                }
                exponentVal -= fractionalLength;
                mainPart = mainPart.slice(0, decimalPointIdx) + mainPart.slice(decimalPointIdx + 1);
            }

            if (exponentVal < 0) {
                throw new Error("Cannot represent negative exponent part for integers.");
            }
            mainPart += "0".repeat(exponentVal); // Append zeros for the exponent
            strValue = mainPart;
        }

        // Validate the format of the resulting string
        const isValidFormat = /^([0-9][0-9]*)$/.test(strValue);
        if (!isValidFormat) throw new Error(`Invalid integer format: ${strValue}`);

        const chunkArray = [];
        let currentMax = strValue.length;
        const chunkSize = CHUNK_LOG_SIZE;
        let currentMin = currentMax - chunkSize;

        // Split string into chunks
        while (currentMax > 0) {
            chunkArray.push(tryParseInt(strValue.slice(Math.max(0, currentMin), currentMax), 10));
            currentMin -= chunkSize;
            if (currentMin < 0) currentMin = 0;
            currentMax -= chunkSize;
        }
        normalizeChunks(chunkArray); // Remove any leading zeros from parsing
        return new LargeNum(chunkArray, isNegative);
    }

    /**
     * Parses a numeric value into a TinyNum or LargeNum object.
     * @param {number} numValue - The number to parse.
     * @returns {TinyNum|LargeNum} The parsed number object.
     * @throws {Error} If the number is not an integer.
     */
    function parseNumericValue(numValue) {
        if (isJsSafeInt(numValue)) {
            if (numValue !== floorOrCeil(numValue)) {
                throw new Error(`${numValue} is not an integer.`);
            }
            return new TinyNum(numValue);
        }
        // If it's a large JS number, convert to string and parse
        return parseStringRep(numValue.toString());
    }

    /**
     * Coerces various input types into a NumBase object (LargeNum or TinyNum).
     * This is the central parsing function.
     * @param {NumBase|number|string} input - The input value.
     * @returns {NumBase} A NumBase object.
     */
    function parseInputVal(input) {
        if (typeof input === "number") {
            return parseNumericValue(input);
        }
        if (typeof input === "string") {
            return parseStringRep(input);
        }
        // If it's already a NumBase instance, return as is
        if (input instanceof LargeNum || input instanceof TinyNum) {
            return input;
        }
        // Fallback for unexpected types or undefined (handled by NumBase constructor)
        return NumBase(input);
    }

    // Cache common small integers for efficiency
    for (let i = 0; i < 1e3; i++) { // Cache numbers from 0 to 999
        NumBase[i] = new TinyNum(i);
        if (i > 0) NumBase[-i] = new TinyNum(-i);
    }

    // Static properties for common number objects
    NumBase.ONE = NumBase[1];
    NumBase.ZERO = NumBase[0];
    NumBase.MINUS_ONE = NumBase[-1];

    // Expose static methods
    NumBase.maximum = findMax;
    NumBase.minimum = findMin;
    NumBase.computeGCD = greatestCommonDivisor;
    NumBase.computeLCM = leastCommonMultiple;
    NumBase.isLargeNumInstance = function (x) {
        return x instanceof LargeNum || x instanceof TinyNum;
    };
    NumBase.randomBetween = generateRandomBetween;
    NumBase.fromDigitArray = function (digits, base, isNegative) {
        // Map digits to NumBase objects before parsing
        const parsedDigits = digits.map(parseInputVal);
        return parseChunksFromBase(parsedDigits, parseInputVal(base || 10), isNegative);
    };

    return NumBase;
}();

/**
 * Main execution function to find the first prime number above a given starting value.
 * @param {string} inputData - The input string, expected to contain a number on the first line.
 */
function findFirstPrimeAbove(inputData) {
    const inputLines = inputData.split("\n");
    const firstLine = inputLines[0];

    // Validate and parse the starting value
    let startValue;
    try {
        const parsedStart = Number(firstLine);
        if (isNaN(parsedStart) || !isFinite(parsedStart)) {
            throw new Error(`Invalid numeric input: ${firstLine}`);
        }
        startValue = largeNum(Math.floor(parsedStart)); // Ensure integer and convert to largeNum
    } catch (e) {
        console.error(`Error parsing start value: ${e.message}`);
        // Fallback or exit if parsing fails
        startValue = largeNum(2); // Default to 2 if input is bad
        console.log("Defaulting to start value 2 due to input error.");
    }

    // Set a reasonable limit to prevent infinite loops on large searches
    const MAX_SEARCH_COUNT = largeNum(1000000); // Search up to 1 million numbers
    let currentNum = startValue;
    let foundPrime = false;
    let searchIterations = largeNum(0);

    // Loop to find the first prime number
    // We search for a prime number starting from `startValue`
    // and continue for up to `MAX_SEARCH_COUNT` iterations.
    while (searchIterations.isLesserThan(MAX_SEARCH_COUNT)) {
        if (currentNum.checkPrime()) {
            console.log(currentNum.toNumeralString());
            foundPrime = true;
            break; // Found the prime, exit loop
        }
        currentNum = currentNum.increment(); // Move to the next number
        searchIterations = searchIterations.increment(); // Increment iteration counter

        // Optional: add a progress indicator for very long searches
        if (searchIterations.getRemainder(100000).isZeroValue()) {
             // console.log(`... Still searching, checked up to ${currentNum.toNumeralString()}`);
        }
    }

    if (!foundPrime) {
        console.log(`No prime found within ${MAX_SEARCH_COUNT.toNumeralString()} numbers starting from ${startValue.toNumeralString()}.`);
    }
}

// Execute the main function with input from stdin
findFirstPrimeAbove(require('fs').readFileSync('/dev/stdin', 'utf8'));