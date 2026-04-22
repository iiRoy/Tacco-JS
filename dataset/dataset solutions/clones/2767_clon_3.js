"use strict";

// This module provides extended precision arithmetic for numbers that exceed
// JavaScript's native Number.MAX_SAFE_INTEGER (2^53 - 1). It handles
// arbitrary-precision integers by storing them as arrays of "chunks."
let largeNum = (function(undef) {
    // --- Core Configuration Constants ---
    // Each internal chunk represents a number up to 10^7.
    // This balance (1e7) allows efficient multiplication without overflowing
    // standard 53-bit floating-point precision during intermediate calculations.
    const CHUNK_SIZE = 1e7;
    // The number of decimal digits represented by each chunk (log10(CHUNK_SIZE)).
    const CHUNK_DIGITS = 7;

    // JavaScript's maximum safe integer (2^53 - 1).
    // Numbers outside this range might lose precision in standard JS operations.
    const MAX_SAFE_JS_INT = 9007199254740992; // 2^53

    // Pre-computed chunk representation of MAX_SAFE_JS_INT for quick comparisons.
    // This helps determine if a result can fit back into a native JS number.
    const MAX_SAFE_JS_INT_PARTS = splitJSNumIntoChunks(MAX_SAFE_JS_INT);

    // Logarithm of MAX_SAFE_JS_INT, useful for base conversion and length checks.
    const LOG_MAX_SAFE_JS_INT = Math.log(MAX_SAFE_JS_INT);

    // --- Base Number Objects and Prototypes ---

    /**
     * Factory function for creating large number instances.
     * It intelligently returns either a SmallNumber or LargeNumber based on the input.
     * Also handles parsing of various input types (numbers, strings, other bases).
     * @param {number|string|LargeNumber|SmallNumber} inputValue - The value to wrap.
     * @param {number} [inputRadix] - Optional radix if `inputValue` is a string.
     * @returns {LargeNumber|SmallNumber} A new large number instance.
     */
    function NumBase(inputValue, inputRadix) {
        if (inputValue === undef) {
            return NumBase.ZERO; // Default to zero if no value is provided.
        }
        if (inputRadix !== undef) {
            // If a radix is specified, delegate to specialized parsing.
            return +inputRadix === 10 ? parseInputToNumber(inputValue) : parseStringWithBase(inputValue, inputRadix);
        }
        return parseInputToNumber(inputValue); // Parse direct value.
    }

    /**
     * Represents a number that exceeds JavaScript's `MAX_SAFE_JS_INT`.
     * Stored as an array of `chunks`, where each chunk is a digit in base `CHUNK_SIZE`.
     * @param {number[]} chunkArray - An array of number chunks (least significant first).
     * @param {boolean} isNegativeFlag - True if the number is negative, false otherwise.
     */
    function LargeNumber(chunkArray, isNegativeFlag) {
        this.chunks = chunkArray;
        this.isNegative = isNegativeFlag;
        this.isCompact = false; // Flag indicating it's an extended precision number.
    }
    LargeNumber.prototype = Object.create(NumBase.prototype);
    LargeNumber.prototype.constructor = LargeNumber; // Restore constructor reference.

    /**
     * Represents a number that fits within JavaScript's native `MAX_SAFE_JS_INT`.
     * This allows for direct use of JS number operations for performance.
     * @param {number} jsValue - The native JavaScript number value.
     */
    function SmallNumber(jsValue) {
        this.val = jsValue;
        this.isNegative = jsValue < 0;
        this.isCompact = true; // Flag indicating it's a native JS number.
    }
    SmallNumber.prototype = Object.create(NumBase.prototype);
    SmallNumber.prototype.constructor = SmallNumber; // Restore constructor reference.

    // --- Utility Functions ---

    /**
     * Checks if a given number can be precisely represented by JavaScript's `Number` type.
     * @param {number} n - The number to check.
     * @returns {boolean} True if precise, false otherwise.
     */
    function canFitInJS(n) {
        return -MAX_SAFE_JS_INT < n && n < MAX_SAFE_JS_INT;
    }

    /**
     * Converts a JavaScript number into an array of chunks based on `CHUNK_SIZE`.
     * For example, 123456789 -> [456789, 123].
     * @param {number} n - The JavaScript number.
     * @returns {number[]} An array of number chunks, least significant first.
     */
    function splitJSNumIntoChunks(n) {
        if (n < CHUNK_SIZE) return [n];
        if (n < CHUNK_SIZE * CHUNK_SIZE) return [n % CHUNK_SIZE, Math.floor(n / CHUNK_SIZE)];
        return [n % CHUNK_SIZE, Math.floor(n / CHUNK_SIZE) % CHUNK_SIZE, Math.floor(n / (CHUNK_SIZE * CHUNK_SIZE))];
    }

    /**
     * Attempts to combine an array of chunks back into a single JavaScript number.
     * Returns the JS number if it fits, otherwise returns the original chunk array.
     * @param {number[]} chunkArr - An array of number chunks.
     * @returns {number|number[]} A JavaScript number or the original chunk array.
     */
    function combineChunksToJSNum(chunkArr) {
        normalizeChunks(chunkArr); // Remove leading zeros before combining.
        const chunkCount = chunkArr.length;
        if (chunkCount < 4 && compareAbsoluteChunks(chunkArr, MAX_SAFE_JS_INT_PARTS) < 0) {
            switch (chunkCount) {
                case 0: return 0;
                case 1: return chunkArr[0];
                case 2: return chunkArr[0] + chunkArr[1] * CHUNK_SIZE;
                case 3: return chunkArr[0] + chunkArr[1] * CHUNK_SIZE + chunkArr[2] * CHUNK_SIZE * CHUNK_SIZE;
                default: return chunkArr;
            }
        }
        return chunkArr;
    }

    /**
     * Removes leading zero chunks from a number's chunk array.
     * Modifies the array in place. Ensures that `[0]` remains `[0]`.
     * @param {number[]} chunkArr - The array of chunks.
     */
    function normalizeChunks(chunkArr) {
        let i = chunkArr.length;
        while (i > 0 && chunkArr[--i] === 0);
        chunkArr.length = i + 1;
        if (chunkArr.length === 0) chunkArr.push(0); // Ensure zero is represented as [0].
    }

    /**
     * Creates an array of a specified length, initialized with zeros.
     * @param {number} len - The desired length of the array.
     * @returns {number[]} A new array filled with zeros.
     */
    function initZeroArray(len) {
        return Array(len).fill(0);
    }

    /**
     * Returns the integer part of a number (truncates decimals).
     * @param {number} n - The number.
     * @returns {number} The integer part.
     */
    function intPart(n) {
        return Math.trunc(n); // Using modern Math.trunc for clarity.
    }

    // --- Arithmetic Operations (Internal Chunk-based) ---

    /**
     * Adds two arrays of chunks (representing positive large numbers).
     * Assumes `chunkA.length >= chunkB.length`.
     * @param {number[]} chunkA - First chunk array.
     * @param {number[]} chunkB - Second chunk array.
     * @returns {number[]} The result chunk array.
     */
    function addChunks(chunkA, chunkB) {
        const lenA = chunkA.length;
        const lenB = chunkB.length;
        const resultChunks = new Array(lenA); // Result can be at most lenA + 1
        let carry = 0;
        let sum;

        for (let i = 0; i < lenB; i++) {
            sum = chunkA[i] + chunkB[i] + carry;
            carry = Math.floor(sum / CHUNK_SIZE);
            resultChunks[i] = sum % CHUNK_SIZE;
        }

        for (let i = lenB; i < lenA; i++) {
            sum = chunkA[i] + carry;
            carry = Math.floor(sum / CHUNK_SIZE);
            resultChunks[i] = sum % CHUNK_SIZE;
        }

        if (carry > 0) resultChunks.push(carry);
        return resultChunks;
    }

    /**
     * Adds two arrays of chunks, handling length differences by ensuring the longer array is first.
     * @param {number[]} chunkA - First chunk array.
     * @param {number[]} chunkB - Second chunk array.
     * @returns {number[]} The result chunk array.
     */
    function addChunksFlexible(chunkA, chunkB) {
        return chunkA.length >= chunkB.length ? addChunks(chunkA, chunkB) : addChunks(chunkB, chunkA);
    }

    /**
     * Adds a small JavaScript number (`smallVal`) to a chunk array (`chunks`).
     * @param {number[]} chunks - The chunk array.
     * @param {number} smallVal - The small number to add (must be positive).
     * @returns {number[]} The result chunk array.
     */
    function addSmallToChunks(chunks, smallVal) {
        const len = chunks.length;
        const result = new Array(len);
        let carry = smallVal;
        let sum;

        for (let i = 0; i < len; i++) {
            sum = chunks[i] + carry;
            carry = Math.floor(sum / CHUNK_SIZE);
            result[i] = sum % CHUNK_SIZE;
        }

        while (carry > 0) {
            result.push(carry % CHUNK_SIZE);
            carry = Math.floor(carry / CHUNK_SIZE);
        }
        return result;
    }

    LargeNumber.prototype.add = function(otherNum) {
        const n = parseInputToNumber(otherNum);
        if (this.isNegative !== n.isNegative) {
            return this.subtract(n.flipSign()); // Different signs -> subtract absolute values.
        }
        const aChunks = this.chunks;
        if (n.isCompact) {
            return new LargeNumber(addSmallToChunks(aChunks, Math.abs(n.val)), this.isNegative);
        }
        return new LargeNumber(addChunksFlexible(aChunks, n.chunks), this.isNegative);
    };
    LargeNumber.prototype.plus = LargeNumber.prototype.add;

    SmallNumber.prototype.add = function(otherNum) {
        const n = parseInputToNumber(otherNum);
        const aVal = this.val;

        if (this.isNegative !== n.isNegative) {
            return this.subtract(n.flipSign());
        }

        if (n.isCompact) {
            const sumVal = aVal + n.val;
            if (canFitInJS(sumVal)) {
                return new SmallNumber(sumVal);
            }
            // Sum overflows, convert to LargeNumber.
            return new LargeNumber(addSmallToChunks(splitJSNumIntoChunks(Math.abs(n.val)), Math.abs(aVal)), aVal < 0);
        }
        // SmallNumber + LargeNumber
        return new LargeNumber(addSmallToChunks(n.chunks, Math.abs(aVal)), aVal < 0);
    };
    SmallNumber.prototype.plus = SmallNumber.prototype.add;

    /**
     * Subtracts chunk array B from chunk array A (A - B).
     * Assumes `chunkA >= chunkB` (absolute values) and both are positive.
     * @param {number[]} chunkA - The minuend chunk array.
     * @param {number[]} chunkB - The subtrahend chunk array.
     * @returns {number[]} The result chunk array.
     */
    function subtractChunks(chunkA, chunkB) {
        const lenA = chunkA.length;
        const lenB = chunkB.length;
        const resultChunks = new Array(lenA);
        let borrow = 0;
        let difference;

        for (let i = 0; i < lenB; i++) {
            difference = chunkA[i] - borrow - chunkB[i];
            if (difference < 0) {
                difference += CHUNK_SIZE;
                borrow = 1;
            } else {
                borrow = 0;
            }
            resultChunks[i] = difference;
        }

        for (let i = lenB; i < lenA; i++) {
            difference = chunkA[i] - borrow;
            if (difference < 0) {
                difference += CHUNK_SIZE;
                borrow = 1;
            } else {
                resultChunks[i++] = difference;
                borrow = 0;
                // Optimization: if no more borrow, copy rest of chunks and break.
                while (i < lenA) { resultChunks[i] = chunkA[i]; i++; }
                break;
            }
            resultChunks[i] = difference;
        }
        normalizeChunks(resultChunks);
        return resultChunks;
    }

    /**
     * Performs subtraction of two large numbers, handling signs and magnitude comparison.
     * @param {number[]} chunkA - Chunks of the first number (absolute value).
     * @param {number[]} chunkB - Chunks of the second number (absolute value).
     * @param {boolean} currentSign - The sign of the result if `chunkA >= chunkB`.
     * @returns {LargeNumber|SmallNumber} The result of the subtraction.
     */
    function subtractChunksFlexible(chunkA, chunkB, currentSign) {
        let resultChunks;
        let finalSign = currentSign;

        if (compareAbsoluteChunks(chunkA, chunkB) >= 0) {
            resultChunks = subtractChunks(chunkA, chunkB);
        } else {
            resultChunks = subtractChunks(chunkB, chunkA);
            finalSign = !finalSign; // Flip sign if B was larger than A.
        }

        const combinedResult = combineChunksToJSNum(resultChunks);
        if (typeof combinedResult === "number") {
            return new SmallNumber(finalSign ? -combinedResult : combinedResult);
        }
        return new LargeNumber(combinedResult, finalSign);
    }

    /**
     * Subtracts a small JavaScript number (`smallVal`) from a chunk array (`chunkArr`).
     * @param {number[]} chunkArr - The chunk array (minuend).
     * @param {number} smallVal - The small number (subtrahend, absolute value).
     * @param {boolean} currentSign - The sign to apply if the chunkArr is larger.
     * @returns {LargeNumber|SmallNumber} The result.
     */
    function subtractSmallFromChunks(chunkArr, smallVal, currentSign) {
        const len = chunkArr.length;
        const resultChunks = new Array(len);
        let borrow = smallVal;
        let difference;

        for (let i = 0; i < len; i++) {
            difference = chunkArr[i] - borrow;
            borrow = 0;
            if (difference < 0) {
                borrow = 1;
                difference += CHUNK_SIZE;
            }
            resultChunks[i] = difference;
        }

        normalizeChunks(resultChunks);
        const combinedResult = combineChunksToJSNum(resultChunks);
        if (typeof combinedResult === "number") {
            return new SmallNumber(currentSign ? -combinedResult : combinedResult);
        }
        return new LargeNumber(combinedResult, currentSign);
    }

    LargeNumber.prototype.subtract = function(otherNum) {
        const n = parseInputToNumber(otherNum);
        if (this.isNegative !== n.isNegative) {
            return this.add(n.flipSign()); // Different signs -> add absolute values.
        }
        const aChunks = this.chunks;
        if (n.isCompact) {
            return subtractSmallFromChunks(aChunks, Math.abs(n.val), this.isNegative);
        }
        return subtractChunksFlexible(aChunks, n.chunks, this.isNegative);
    };
    LargeNumber.prototype.minus = LargeNumber.prototype.subtract;

    SmallNumber.prototype.subtract = function(otherNum) {
        const n = parseInputToNumber(otherNum);
        const aVal = this.val;

        if (this.isNegative !== n.isNegative) {
            return this.add(n.flipSign());
        }

        if (n.isCompact) {
            const diffVal = aVal - n.val;
            if (canFitInJS(diffVal)) {
                return new SmallNumber(diffVal);
            }
            // This case should be rare if canFitInJS is correct for inputs.
            // Fallback to chunk-based subtraction.
            return subtractChunksFlexible(splitJSNumIntoChunks(Math.abs(aVal)), splitJSNumIntoChunks(Math.abs(n.val)), aVal < 0);
        }

        // SmallNumber - LargeNumber
        const aChunks = splitJSNumIntoChunks(Math.abs(aVal));
        return subtractChunksFlexible(aChunks, n.chunks, this.isNegative);
    };
    SmallNumber.prototype.minus = SmallNumber.prototype.subtract;

    LargeNumber.prototype.flipSign = function() {
        return new LargeNumber(this.chunks, !this.isNegative);
    };
    SmallNumber.prototype.flipSign = function() {
        return new SmallNumber(-this.val);
    };

    LargeNumber.prototype.absoluteValue = function() {
        return new LargeNumber(this.chunks, false);
    };
    SmallNumber.prototype.absoluteValue = function() {
        return new SmallNumber(Math.abs(this.val));
    };

    /**
     * Multiplies two chunk arrays (long multiplication algorithm).
     * Assumes positive numbers.
     * @param {number[]} chunkA - First chunk array.
     * @param {number[]} chunkB - Second chunk array.
     * @returns {number[]} The product chunk array.
     */
    function multiplyChunksLong(chunkA, chunkB) {
        const lenA = chunkA.length;
        const lenB = chunkB.length;
        const resultChunks = initZeroArray(lenA + lenB);

        for (let i = 0; i < lenA; ++i) {
            const a_i = chunkA[i];
            let carry = 0;
            for (let j = 0; j < lenB; ++j) {
                const b_j = chunkB[j];
                const product = a_i * b_j + resultChunks[i + j] + carry;
                carry = Math.floor(product / CHUNK_SIZE);
                resultChunks[i + j] = product % CHUNK_SIZE;
            }
            resultChunks[i + lenB] += carry;
        }
        normalizeChunks(resultChunks);
        return resultChunks;
    }

    /**
     * Multiplies a chunk array by a small JavaScript number.
     * Assumes positive numbers.
     * @param {number[]} chunkArr - The chunk array.
     * @param {number} smallNum - The small JavaScript number.
     * @returns {number[]} The product chunk array.
     */
    function multiplyChunksBySmallNum(chunkArr, smallNum) {
        const len = chunkArr.length;
        const resultChunks = new Array(len);
        let carry = 0;
        let product;

        for (let i = 0; i < len; i++) {
            product = chunkArr[i] * smallNum + carry;
            carry = Math.floor(product / CHUNK_SIZE);
            resultChunks[i] = product % CHUNK_SIZE;
        }

        while (carry > 0) {
            resultChunks.push(carry % CHUNK_SIZE);
            carry = Math.floor(carry / CHUNK_SIZE);
        }
        return resultChunks;
    }

    /**
     * Pads an array with zeros on the left (effectively multiplying by powers of CHUNK_SIZE).
     * @param {number[]} arr - The array of chunks.
     * @param {number} numChunks - The number of zero chunks to prepend.
     * @returns {number[]} A new array with prepended zeros.
     */
    function padZerosLeft(arr, numChunks) {
        if (numChunks <= 0) return arr.slice();
        const zeros = new Array(numChunks).fill(0);
        return zeros.concat(arr);
    }

    /**
     * Karatsuba multiplication algorithm for large numbers.
     * @param {number[]} xChunks - First chunk array.
     * @param {number[]} yChunks - Second chunk array.
     * @returns {number[]} The product chunk array.
     */
    function karatsubaMultiply(xChunks, yChunks) {
        const n = Math.max(xChunks.length, yChunks.length);

        if (n <= 30) return multiplyChunksLong(xChunks, yChunks); // Base case for recursion.

        const m = Math.ceil(n / 2);
        const highX = xChunks.slice(m);
        const lowX = xChunks.slice(0, m);
        const highY = yChunks.slice(m);
        const lowY = yChunks.slice(0, m);

        const z0 = karatsubaMultiply(lowX, lowY);
        const z1 = karatsubaMultiply(addChunksFlexible(lowX, highX), addChunksFlexible(lowY, highY));
        const z2 = karatsubaMultiply(highX, highY);

        const term1 = padZerosLeft(z2, 2 * m);
        const term2 = padZerosLeft(subtractChunksFlexible(subtractChunksFlexible(z1, z2, false).chunks, z0, false).chunks, m);
        const term3 = z0;

        const product = addChunksFlexible(addChunksFlexible(term1, term2), term3);
        normalizeChunks(product);
        return product;
    }

    /**
     * Heuristic to decide whether to use Karatsuba algorithm based on number lengths.
     * @param {number} len1 - Length of first chunk array.
     * @param {number} len2 - Length of second chunk array.
     * @returns {boolean} True if Karatsuba should be used.
     */
    function shouldUseKaratsuba(len1, len2) {
        return -0.012 * len1 - 0.012 * len2 + 15e-6 * len1 * len2 > 0;
    }

    LargeNumber.prototype.multiply = function(otherNum) {
        const n = parseInputToNumber(otherNum);
        const aChunks = this.chunks;
        const finalSign = this.isNegative !== n.isNegative;

        if (n.isCompact) {
            const smallVal = n.val;
            if (smallVal === 0) return NumBase.ZERO;
            if (smallVal === 1) return this;
            if (smallVal === -1) return this.flipSign();

            const absSmallVal = Math.abs(smallVal);
            if (absSmallVal < CHUNK_SIZE) {
                return new LargeNumber(multiplyChunksBySmallNum(aChunks, absSmallVal), finalSign);
            }
            return new LargeNumber(multiplyChunksLong(aChunks, splitJSNumIntoChunks(absSmallVal)), finalSign);
        }

        // Both are LargeNumbers.
        if (shouldUseKaratsuba(aChunks.length, n.chunks.length)) {
            return new LargeNumber(karatsubaMultiply(aChunks, n.chunks), finalSign);
        }
        return new LargeNumber(multiplyChunksLong(aChunks, n.chunks), finalSign);
    };
    LargeNumber.prototype.times = LargeNumber.prototype.multiply;

    /**
     * Helper for multiplying a small number by a chunk array, handling signs.
     * @param {number} smallVal - The small JavaScript number (absolute value).
     * @param {number[]} chunkArr - The chunk array.
     * @param {boolean} finalSign - The determined sign of the result.
     * @returns {LargeNumber} The product.
     */
    function multiplySmallAndChunks(smallVal, chunkArr, finalSign) {
        if (smallVal < CHUNK_SIZE) {
            return new LargeNumber(multiplyChunksBySmallNum(chunkArr, smallVal), finalSign);
        }
        return new LargeNumber(multiplyChunksLong(chunkArr, splitJSNumIntoChunks(smallVal)), finalSign);
    }

    SmallNumber.prototype._multiplyByCompact = function(otherNum) {
        if (canFitInJS(otherNum.val * this.val)) {
            return new SmallNumber(otherNum.val * this.val);
        }
        return multiplySmallAndChunks(
            Math.abs(otherNum.val),
            splitJSNumIntoChunks(Math.abs(this.val)),
            this.isNegative !== otherNum.isNegative
        );
    };

    LargeNumber.prototype._multiplyByCompact = function(otherNum) {
        if (otherNum.val === 0) return NumBase.ZERO;
        if (otherNum.val === 1) return this;
        if (otherNum.val === -1) return this.flipSign();

        return multiplySmallAndChunks(
            Math.abs(otherNum.val),
            this.chunks,
            this.isNegative !== otherNum.isNegative
        );
    };

    SmallNumber.prototype.multiply = function(otherNum) {
        const n = parseInputToNumber(otherNum);
        return n._multiplyByCompact(this); // Delegate to internal helper.
    };
    SmallNumber.prototype.times = SmallNumber.prototype.multiply;

    /**
     * Squares a chunk array (optimized multiplication by itself).
     * Assumes positive numbers.
     * @param {number[]} chunkArr - The chunk array to square.
     * @returns {number[]} The squared chunk array.
     */
    function squareChunks(chunkArr) {
        const len = chunkArr.length;
        const resultChunks = initZeroArray(2 * len);

        for (let i = 0; i < len; i++) {
            const a_i = chunkArr[i];
            let carry = 0;

            // Calculate a_i * a_i and add to resultChunks[2*i]
            let product = a_i * a_i + resultChunks[2 * i];
            carry = Math.floor(product / CHUNK_SIZE);
            resultChunks[2 * i] = product % CHUNK_SIZE;

            // Calculate 2 * a_i * a_j for j > i
            for (let j = i + 1; j < len; j++) {
                const a_j = chunkArr[j];
                product = 2 * (a_i * a_j) + resultChunks[i + j] + carry;
                carry = Math.floor(product / CHUNK_SIZE);
                resultChunks[i + j] = product % CHUNK_SIZE;
            }
            resultChunks[i + len] += carry;
        }
        normalizeChunks(resultChunks);
        return resultChunks;
    }

    LargeNumber.prototype.square = function() {
        return new LargeNumber(squareChunks(this.chunks), false);
    };
    SmallNumber.prototype.square = function() {
        const squaredVal = this.val * this.val;
        if (canFitInJS(squaredVal)) {
            return new SmallNumber(squaredVal);
        }
        return new LargeNumber(squareChunks(splitJSNumIntoChunks(Math.abs(this.val))), false);
    };

    /**
     * Performs division and modulo operation for large numbers using a classical algorithm.
     * (Similar to Knuth's Algorithm D, but simplified for clarity).
     * @param {number[]} dividendChunks - The dividend (absolute value).
     * @param {number[]} divisorChunks - The divisor (absolute value).
     * @returns {[number[], number[]]} An array containing [quotientChunks, remainderChunks].
     */
    function performDivisionClassic(dividendChunks, divisorChunks) {
        const lenDividend = dividendChunks.length;
        const lenDivisor = divisorChunks.length;

        if (compareAbsoluteChunks(dividendChunks, divisorChunks) < 0) {
            return [initZeroArray(1), dividendChunks];
        }
        if (compareAbsoluteChunks(dividendChunks, divisorChunks) === 0) {
            return [initZeroArray(1).fill(1), initZeroArray(1)];
        }

        // Normalize divisor to improve quotient digit estimation.
        const normalizationFactor = Math.ceil(CHUNK_SIZE / (divisorChunks[lenDivisor - 1] + 1)); // +1 to prevent division by zero for 0
        const normalizedDividend = multiplyChunksBySmallNum(dividendChunks, normalizationFactor);
        const normalizedDivisor = multiplyChunksBySmallNum(divisorChunks, normalizationFactor);

        const nDividend = normalizedDividend.length;
        const nDivisor = normalizedDivisor.length;

        const quotientChunks = initZeroArray(nDividend - nDivisor + 1);
        let remainder = normalizedDividend.slice(); // Copy for modification.

        const divisorMSD = normalizedDivisor[nDivisor - 1];

        for (let shift = nDividend - nDivisor; shift >= 0; shift--) {
            let qHat;
            // Estimate quotient digit.
            if (remainder[shift + nDivisor] === divisorMSD) {
                qHat = CHUNK_SIZE - 1;
            } else {
                qHat = Math.floor(
                    (remainder[shift + nDivisor] * CHUNK_SIZE + (remainder[shift + nDivisor - 1] || 0)) / divisorMSD
                );
            }

            // Refine qHat if it's too large.
            let testProduct = multiplyChunksBySmallNum(normalizedDivisor, qHat);
            while (
                compareAbsoluteChunks(testProduct, remainder.slice(shift, shift + nDivisor + 1)) > 0
            ) {
                qHat--;
                testProduct = multiplyChunksBySmallNum(normalizedDivisor, qHat);
            }

            // Perform subtraction
            let borrow = 0;
            for (let i = 0; i < nDivisor; i++) {
                const diff = remainder[shift + i] - (testProduct[i] || 0) - borrow;
                if (diff < 0) {
                    remainder[shift + i] = diff + CHUNK_SIZE;
                    borrow = 1;
                } else {
                    remainder[shift + i] = diff;
                    borrow = 0;
                }
            }
            remainder[shift + nDivisor] -= borrow; // Highest digit might have a borrow.

            // If subtraction resulted in negative, qHat was still too large. Adjust.
            while (remainder[shift + nDivisor] < 0) {
                qHat--;
                let carry = 0;
                for (let i = 0; i < nDivisor; i++) {
                    const sum = remainder[shift + i] + (normalizedDivisor[i] || 0) + carry;
                    remainder[shift + i] = sum % CHUNK_SIZE;
                    carry = Math.floor(sum / CHUNK_SIZE);
                }
                remainder[shift + nDivisor] += carry;
            }

            quotientChunks[shift] = qHat;
        }

        // Denormalize the remainder.
        remainder = divideChunksBySmallNum(remainder, normalizationFactor)[0];

        normalizeChunks(quotientChunks);
        normalizeChunks(remainder);

        return [combineChunksToJSNum(quotientChunks), combineChunksToJSNum(remainder)];
    }

    /**
     * Divides a chunk array by a small JavaScript number.
     * @param {number[]} chunkArr - The chunk array (dividend).
     * @param {number} smallDivisor - The small JavaScript number (divisor, must be positive).
     * @returns {[number[], number]} An array containing [quotientChunks, remainder].
     */
    function divideChunksBySmallNum(chunkArr, smallDivisor) {
        const len = chunkArr.length;
        const quotientChunks = initZeroArray(len);
        let remainder = 0;

        for (let i = len - 1; i >= 0; --i) {
            const currentDividendPart = remainder * CHUNK_SIZE + chunkArr[i];
            const q = intPart(currentDividendPart / smallDivisor);
            remainder = currentDividendPart % smallDivisor;
            quotientChunks[i] = q;
        }
        normalizeChunks(quotientChunks);
        return [quotientChunks, remainder];
    }

    /**
     * Generic division and modulo function, handling all number types and signs.
     * @param {LargeNumber|SmallNumber} currentNum - The dividend.
     * @param {any} otherVal - The divisor (can be any type parseable by parseInputToNumber).
     * @returns {[LargeNumber|SmallNumber, LargeNumber|SmallNumber]} An array [quotient, remainder].
     * @throws {Error} If division by zero.
     */
    function divideAndModulate(currentNum, otherVal) {
        const divisorNum = parseInputToNumber(otherVal);

        if (divisorNum.isAbsolutelyZero()) {
            throw new Error("Cannot divide by zero.");
        }

        // Handle SmallNumber operations directly if possible.
        if (currentNum.isCompact) {
            if (divisorNum.isCompact) {
                return [
                    new SmallNumber(intPart(currentNum.val / divisorNum.val)),
                    new SmallNumber(currentNum.val % divisorNum.val)
                ];
            }
            return [NumBase.ZERO, currentNum]; // SmallNumber / LargeNumber results in 0 quotient.
        }

        // Dividend is LargeNumber.
        const dividendChunks = currentNum.absoluteValue().chunks;
        if (divisorNum.isCompact) {
            const smallDivisorVal = divisorNum.val;
            if (smallDivisorVal === 1) return [currentNum, NumBase.ZERO];
            if (smallDivisorVal === -1) return [currentNum.flipSign(), NumBase.ZERO];

            const absSmallDivisor = Math.abs(smallDivisorVal);
            if (absSmallDivisor < CHUNK_SIZE) {
                const [quotientChunks, remainder] = divideChunksBySmallNum(dividendChunks, absSmallDivisor);
                const quotient = combineChunksToJSNum(quotientChunks);
                const finalRemainder = currentNum.isNegative ? -remainder : remainder;

                if (typeof quotient === "number") {
                    return [
                        new SmallNumber(currentNum.isNegative !== divisorNum.isNegative ? -quotient : quotient),
                        new SmallNumber(finalRemainder)
                    ];
                }
                return [
                    new LargeNumber(quotient, currentNum.isNegative !== divisorNum.isNegative),
                    new SmallNumber(finalRemainder)
                ];
            }
        }

        // Both are LargeNumbers, or LargeNumber / (Compact but multi-chunk equivalent)
        const divisorChunks = divisorNum.absoluteValue().chunks || splitJSNumIntoChunks(Math.abs(divisorNum.val));
        const comparison = compareAbsoluteChunks(dividendChunks, divisorChunks);
        if (comparison === -1) return [NumBase.ZERO, currentNum];
        if (comparison === 0) {
            return [
                new SmallNumber(currentNum.isNegative !== divisorNum.isNegative ? -1 : 1),
                NumBase.ZERO
            ];
        }

        // Use the classical division algorithm.
        const [quotientResult, remainderResult] = performDivisionClassic(dividendChunks, divisorChunks);

        const quotientSign = currentNum.isNegative !== divisorNum.isNegative;
        const remainderSign = currentNum.isNegative; // Remainder takes sign of dividend.

        const finalQuotient = (typeof quotientResult === "number")
            ? new SmallNumber(quotientSign ? -quotientResult : quotientResult)
            : new LargeNumber(quotientResult, quotientSign);

        const finalRemainder = (typeof remainderResult === "number")
            ? new SmallNumber(remainderSign ? -remainderResult : remainderResult)
            : new LargeNumber(remainderResult, remainderSign);

        return [finalQuotient, finalRemainder];
    }

    LargeNumber.prototype.getDivModResult = function(otherVal) {
        const result = divideAndModulate(this, otherVal);
        return { quotient: result[0], remainder: result[1] };
    };
    SmallNumber.prototype.getDivModResult = LargeNumber.prototype.getDivModResult;

    LargeNumber.prototype.getQuotient = function(otherVal) {
        return divideAndModulate(this, otherVal)[0];
    };
    SmallNumber.prototype.over = SmallNumber.prototype.getQuotient = LargeNumber.prototype.over = LargeNumber.prototype.getQuotient;

    LargeNumber.prototype.getRemainder = function(otherVal) {
        return divideAndModulate(this, otherVal)[1];
    };
    SmallNumber.prototype.remainder = SmallNumber.prototype.getRemainder = LargeNumber.prototype.remainder = LargeNumber.prototype.getRemainder;

    LargeNumber.prototype.power = function(exponentVal) {
        const expNum = parseInputToNumber(exponentVal);

        if (expNum.isAbsolutelyZero()) return NumBase.ONE;
        if (this.isAbsolutelyZero()) return NumBase.ZERO;
        if (this.isOneOrMinusOne()) {
            if (this.isEqualTo(NumBase.ONE)) return NumBase.ONE;
            return expNum.isEvenlyDivisible() ? NumBase.ONE : NumBase.MINUS_ONE;
        }
        if (expNum.isStrictlyNegative()) return NumBase.ZERO; // For integer power, negative exponent is 0.
        if (!expNum.isCompact) {
            throw new Error(`The exponent ${expNum.toDecimalString()} is too large for direct power calculation.`);
        }

        const expJSVal = expNum.val;

        if (this.isCompact) {
            const resultJSVal = Math.pow(this.val, expJSVal);
            if (canFitInJS(resultJSVal)) {
                return new SmallNumber(intPart(resultJSVal));
            }
        }

        let currentBase = this;
        let result = NumBase.ONE;

        while (expJSVal > 0) {
            if (expJSVal % 2 === 1) result = result.multiply(currentBase);
            if (expJSVal === 1) break;
            currentBase = currentBase.square();
            expJSVal = intPart(expJSVal / 2);
        }
        return result;
    };
    SmallNumber.prototype.power = LargeNumber.prototype.power;

    LargeNumber.prototype.modularExponentiation = function(exponentVal, modulusVal) {
        let expNum = parseInputToNumber(exponentVal);
        let modulusNum = parseInputToNumber(modulusVal);

        if (modulusNum.isAbsolutelyZero()) {
            throw new Error("Cannot compute modular exponentiation with modulus 0.");
        }
        if (expNum.isStrictlyNegative()) {
            // Modular inverse is needed for negative exponents, which is not directly implemented here for modPow.
            return NumBase.ZERO;
        }

        let result = NumBase.ONE;
        let currentBase = this.getRemainder(modulusNum);

        while (expNum.isStrictlyPositive()) {
            if (currentBase.isAbsolutelyZero()) return NumBase.ZERO;
            if (expNum.isOddlyDivisible()) {
                result = result.multiply(currentBase).getRemainder(modulusNum);
            }
            expNum = expNum.getQuotient(2);
            currentBase = currentBase.square().getRemainder(modulusNum);
        }
        return result;
    };
    SmallNumber.prototype.modularExponentiation = LargeNumber.prototype.modularExponentiation;

    // --- Comparison Operations ---

    /**
     * Compares the absolute values of two chunk arrays.
     * @param {number[]} chunkA - First chunk array.
     * @param {number[]} chunkB - Second chunk array.
     * @returns {number} -1 if |A| < |B|, 0 if |A| == |B|, 1 if |A| > |B|.
     */
    function compareAbsoluteChunks(chunkA, chunkB) {
        if (chunkA.length !== chunkB.length) {
            return chunkA.length > chunkB.length ? 1 : -1;
        }
        for (let i = chunkA.length - 1; i >= 0; i--) {
            if (chunkA[i] !== chunkB[i]) {
                return chunkA[i] > chunkB[i] ? 1 : -1;
            }
        }
        return 0;
    }

    LargeNumber.prototype.compareAbsoluteValue = function(otherVal) {
        const n = parseInputToNumber(otherVal);
        if (n.isCompact) {
            if (n.isAbsolutelyZero()) return this.isAbsolutelyZero() ? 0 : 1;
            return compareAbsoluteChunks(this.chunks, splitJSNumIntoChunks(Math.abs(n.val)));
        }
        return compareAbsoluteChunks(this.chunks, n.chunks);
    };
    SmallNumber.prototype.compareAbsoluteValue = function(otherVal) {
        const n = parseInputToNumber(otherVal);
        const aAbsVal = Math.abs(this.val);
        if (n.isCompact) {
            const bAbsVal = Math.abs(n.val);
            return (aAbsVal === bAbsVal) ? 0 : (aAbsVal > bAbsVal ? 1 : -1);
        }
        if (n.isAbsolutelyZero()) return this.isAbsolutelyZero() ? 0 : 1;
        return -1; // SmallNumber is absolutely smaller than a non-zero LargeNumber.
    };

    LargeNumber.prototype.compareWith = function(otherVal) {
        if (otherVal === Infinity) return -1;
        if (otherVal === -Infinity) return 1;

        const n = parseInputToNumber(otherVal);

        if (this.isNegative !== n.isNegative) {
            return this.isNegative ? -1 : 1; // Negative < Positive.
        }

        // Same signs. Compare absolute values and adjust based on sign.
        const comparison = this.compareAbsoluteValue(n);
        return this.isNegative ? -comparison : comparison;
    };
    LargeNumber.prototype.compareTo = LargeNumber.prototype.compareWith;

    SmallNumber.prototype.compareWith = function(otherVal) {
        if (otherVal === Infinity) return -1;
        if (otherVal === -Infinity) return 1;

        const n = parseInputToNumber(otherVal);
        const aVal = this.val;

        if (n.isCompact) {
            const bVal = n.val;
            return (aVal === bVal) ? 0 : (aVal > bVal ? 1 : -1);
        }

        // SmallNumber vs LargeNumber.
        if (this.isNegative !== n.isNegative) {
            return this.isNegative ? -1 : 1;
        }
        // Same signs. SmallNumber is smaller if positive, larger if negative.
        return this.isNegative ? 1 : -1;
    };
    SmallNumber.prototype.compareTo = SmallNumber.prototype.compareWith;

    LargeNumber.prototype.isEqualTo = function(otherVal) {
        return this.compareWith(otherVal) === 0;
    };
    SmallNumber.prototype.eq = SmallNumber.prototype.isEqualTo = LargeNumber.prototype.eq = LargeNumber.prototype.isEqualTo;

    LargeNumber.prototype.isNotEqualTo = function(otherVal) {
        return this.compareWith(otherVal) !== 0;
    };
    SmallNumber.prototype.neq = SmallNumber.prototype.isNotEqualTo = LargeNumber.prototype.neq = LargeNumber.prototype.isNotEqualTo;

    LargeNumber.prototype.isGreaterThan = function(otherVal) {
        return this.compareWith(otherVal) > 0;
    };
    SmallNumber.prototype.gt = SmallNumber.prototype.isGreaterThan = LargeNumber.prototype.gt = LargeNumber.prototype.isGreaterThan;

    LargeNumber.prototype.isLessThan = function(otherVal) {
        return this.compareWith(otherVal) < 0;
    };
    SmallNumber.prototype.lt = SmallNumber.prototype.isLessThan = LargeNumber.prototype.lt = LargeNumber.prototype.isLessThan;

    LargeNumber.prototype.isGreaterOrEqualTo = function(otherVal) {
        return this.compareWith(otherVal) >= 0;
    };
    SmallNumber.prototype.geq = SmallNumber.prototype.isGreaterOrEqualTo = LargeNumber.prototype.geq = LargeNumber.prototype.isGreaterOrEqualTo;

    LargeNumber.prototype.isLesserOrEqualTo = function(otherVal) {
        return this.compareWith(otherVal) <= 0;
    };
    SmallNumber.prototype.leq = SmallNumber.prototype.isLesserOrEqualTo = LargeNumber.prototype.leq = LargeNumber.prototype.isLesserOrEqualTo;

    // --- Property Checks ---

    LargeNumber.prototype.isEvenlyDivisible = function() {
        return (this.chunks[0] % 2) === 0;
    };
    SmallNumber.prototype.isEvenlyDivisible = function() {
        return (this.val % 2) === 0;
    };

    LargeNumber.prototype.isOddlyDivisible = function() {
        return (this.chunks[0] % 2) === 1;
    };
    SmallNumber.prototype.isOddlyDivisible = function() {
        return (this.val % 2) === 1;
    };

    LargeNumber.prototype.isStrictlyPositive = function() {
        return !this.isNegative && !this.isAbsolutelyZero();
    };
    SmallNumber.prototype.isStrictlyPositive = function() {
        return this.val > 0;
    };

    LargeNumber.prototype.isStrictlyNegative = function() {
        return this.isNegative;
    };
    SmallNumber.prototype.isStrictlyNegative = function() {
        return this.val < 0;
    };

    LargeNumber.prototype.isOneOrMinusOne = function() {
        return this.chunks.length === 1 && this.chunks[0] === 1;
    };
    SmallNumber.prototype.isOneOrMinusOne = function() {
        return Math.abs(this.val) === 1;
    };

    LargeNumber.prototype.isAbsolutelyZero = function() {
        return this.chunks.length === 1 && this.chunks[0] === 0;
    };
    SmallNumber.prototype.isAbsolutelyZero = function() {
        return this.val === 0;
    };

    LargeNumber.prototype.isDivisibleBy = function(otherVal) {
        const n = parseInputToNumber(otherVal);
        if (n.isAbsolutelyZero()) return false;
        if (n.isOneOrMinusOne()) return true;
        if (n.isEqualTo(2)) return this.isEvenlyDivisible();
        return this.getRemainder(n).isAbsolutelyZero();
    };
    SmallNumber.prototype.isDivisibleBy = LargeNumber.prototype.isDivisibleBy;

    // --- Primality Tests ---

    /**
     * Checks if a number is a "basic" prime (2, 3, 5, or small numbers not divisible by these).
     * @param {LargeNumber|SmallNumber} num - The number to check.
     * @returns {boolean|undefined} True if basic prime, false if composite, undefined if more checks needed.
     */
    function checkSimplePrime(num) {
        const absNum = num.absoluteValue();
        if (absNum.isOneOrMinusOne() || absNum.isAbsolutelyZero()) return false;
        if (absNum.isEqualTo(2) || absNum.isEqualTo(3) || absNum.isEqualTo(5)) return true;
        if (absNum.isEvenlyDivisible() || absNum.isDivisibleBy(3) || absNum.isDivisibleBy(5)) return false;
        if (absNum.isLessThan(25)) return true; // Primes: 7, 11, 13, 17, 19, 23
        return undef; // Requires more rigorous testing.
    }

    LargeNumber.prototype.isTrulyPrime = function() {
        const simpleCheckResult = checkSimplePrime(this);
        if (simpleCheckResult !== undef) return simpleCheckResult;

        const n = this.absoluteValue();
        const nMinusOne = n.decrement();

        const testBases = [2, 3, 5, 7, 11, 13, 17, 19];
        let d = nMinusOne;
        let s = 0;
        while (d.isEvenlyDivisible()) {
            d = d.getQuotient(2);
            s++;
        }

        for (let i = 0; i < testBases.length; i++) {
            const a = NumBase(testBases[i]);
            if (a.isGreaterOrEqualTo(n)) continue;

            let x = a.modularExponentiation(d, n);

            if (x.isEqualTo(NumBase.ONE) || x.isEqualTo(nMinusOne)) {
                continue;
            }

            let isWitness = true;
            for (let r = 1; r < s; r++) {
                x = x.square().getRemainder(n);
                if (x.isEqualTo(nMinusOne)) {
                    isWitness = false;
                    break;
                }
            }
            if (isWitness) return false;
        }
        return true;
    };
    SmallNumber.prototype.isTrulyPrime = LargeNumber.prototype.isTrulyPrime;

    LargeNumber.prototype.isLikelyPrime = function(iterations) {
        const simpleCheckResult = checkSimplePrime(this);
        if (simpleCheckResult !== undef) return simpleCheckResult;

        const n = this.absoluteValue();
        const nMinusTwo = n.subtract(2);
        const numIterations = iterations === undef ? 5 : iterations;

        for (let i = 0; i < numIterations; i++) {
            const a = NumBase.generateRandomBetween(2, nMinusTwo);
            if (!a.modularExponentiation(n.decrement(), n).isOneOrMinusOne()) {
                return false;
            }
        }
        return true;
    };
    SmallNumber.prototype.isLikelyPrime = LargeNumber.prototype.isLikelyPrime;

    LargeNumber.prototype.modularInverse = function(modulusVal) {
        let t = NumBase.ZERO;
        let newT = NumBase.ONE;
        let r = parseInputToNumber(modulusVal);
        let newR = this.absoluteValue();

        let q, lastT, lastR;

        while (!newR.isAbsolutelyZero()) {
            q = r.getQuotient(newR);
            lastT = t;
            lastR = r;
            t = newT;
            r = newR;
            newT = lastT.subtract(q.multiply(newT));
            newR = lastR.subtract(q.multiply(newR));
        }

        if (!r.isEqualTo(NumBase.ONE)) {
            throw new Error(`Numbers ${this.toDecimalString()} and ${modulusVal.toDecimalString()} are not co-prime, modular inverse does not exist.`);
        }

        if (t.isStrictlyNegative()) {
            t = t.add(parseInputToNumber(modulusVal));
        }

        if (this.isStrictlyNegative()) {
            return parseInputToNumber(modulusVal).subtract(t);
        }
        return t;
    };
    SmallNumber.prototype.modularInverse = LargeNumber.prototype.modularInverse;

    // --- Increment/Decrement ---

    LargeNumber.prototype.increment = function() {
        if (this.isNegative) {
            return subtractSmallFromChunks(this.chunks, 1, this.isNegative);
        }
        return new LargeNumber(addSmallToChunks(this.chunks, 1), this.isNegative);
    };
    SmallNumber.prototype.increment = function() {
        const nextVal = this.val + 1;
        if (canFitInJS(nextVal)) {
            return new SmallNumber(nextVal);
        }
        return new LargeNumber(splitJSNumIntoChunks(nextVal), false);
    };

    LargeNumber.prototype.decrement = function() {
        if (this.isNegative) {
            return new LargeNumber(addSmallToChunks(this.chunks, 1), true);
        }
        return subtractSmallFromChunks(this.chunks, 1, this.isNegative);
    };
    SmallNumber.prototype.decrement = function() {
        const prevVal = this.val - 1;
        if (canFitInJS(prevVal)) {
            return new SmallNumber(prevVal);
        }
        return new LargeNumber(splitJSNumIntoChunks(Math.abs(prevVal)), true);
    };

    // --- Bitwise Operations ---

    // Pre-calculated powers of two up to CHUNK_SIZE for bitwise operations.
    const twoPowersArr = [1];
    while (2 * twoPowersArr[twoPowersArr.length - 1] <= CHUNK_SIZE) {
        twoPowersArr.push(2 * twoPowersArr[twoPowersArr.length - 1]);
    }
    const twoPowersCount = twoPowersArr.length; // Number of powers of 2 (e.g., 1, 2, 4, ..., 2^N).
    const largestTwoPowerChunk = twoPowersArr[twoPowersCount - 1]; // The largest power of 2 less than or equal to CHUNK_SIZE.

    /**
     * Checks if a shift amount is small enough to be handled directly as a JS number.
     * @param {any} shiftAmount - The value representing the shift amount.
     * @returns {boolean} True if the shift amount is manageable, false otherwise.
     */
    function isShiftAmountManageable(shiftAmount) {
        return (typeof shiftAmount === "number" || typeof shiftAmount === "string") &&
            +Math.abs(shiftAmount) <= CHUNK_SIZE ||
            (shiftAmount instanceof LargeNumber && shiftAmount.chunks.length <= 1);
    }

    LargeNumber.prototype.shiftBitsLeft = function(shiftAmount) {
        if (!isShiftAmountManageable(shiftAmount)) {
            throw new Error(`Shift amount ${String(shiftAmount)} is too large for shifting.`);
        }
        let numShift = +shiftAmount;
        if (numShift < 0) return this.shiftBitsRight(-numShift);
        if (this.isAbsolutelyZero()) return this;

        let currentNum = this;
        // Shift by multiples of `log2(largestTwoPowerChunk)` bits.
        while (numShift >= twoPowersCount - 1) { // `powers2Length - 1` is `log2(highestPower2)`
            currentNum = currentNum.multiply(largestTwoPowerChunk);
            numShift -= (twoPowersCount - 1);
        }
        return currentNum.multiply(twoPowersArr[numShift]);
    };
    SmallNumber.prototype.shiftBitsLeft = LargeNumber.prototype.shiftBitsLeft;

    LargeNumber.prototype.shiftBitsRight = function(shiftAmount) {
        if (!isShiftAmountManageable(shiftAmount)) {
            throw new Error(`Shift amount ${String(shiftAmount)} is too large for shifting.`);
        }
        let numShift = +shiftAmount;
        if (numShift < 0) return this.shiftBitsLeft(-numShift);
        if (this.isAbsolutelyZero()) return this;
        if (this.isStrictlyNegative() && this.isOneOrMinusOne()) return NumBase.MINUS_ONE;

        let currentNum = this;
        let divModResult;
        while (numShift >= twoPowersCount - 1) {
            if (currentNum.isAbsolutelyZero() || (currentNum.isStrictlyNegative() && currentNum.isOneOrMinusOne())) {
                return currentNum;
            }
            divModResult = divideAndModulate(currentNum, largestTwoPowerChunk);
            currentNum = divModResult[1].isStrictlyNegative() ? divModResult[0].decrement() : divModResult[0];
            numShift -= (twoPowersCount - 1);
        }
        divModResult = divideAndModulate(currentNum, twoPowersArr[numShift]);
        return divModResult[1].isStrictlyNegative() ? divModResult[0].decrement() : divModResult[0];
    };
    SmallNumber.prototype.shiftBitsRight = LargeNumber.prototype.shiftBitsRight;

    /**
     * Performs a bitwise operation on two large numbers.
     * Handles negative numbers using two's complement logic.
     * @param {LargeNumber|SmallNumber} x - First operand.
     * @param {any} y - Second operand.
     * @param {function(number, number): number} bitwiseFn - The bitwise function (&, |, ^).
     * @returns {LargeNumber|SmallNumber} The result of the bitwise operation.
     */
    function performBitwiseOp(x, y, bitwiseFn) {
        y = parseInputToNumber(y);

        const xIsNeg = x.isStrictlyNegative();
        const yIsNeg = y.isStrictlyNegative();

        // Convert to "two's complement" logic: `~N = -(N+1)`.
        // So for negative numbers, we operate on `abs(N)-1` and then apply bitwise NOT logic.
        let xValueForOp = xIsNeg ? x.flipSign().decrement() : x;
        let yValueForOp = yIsNeg ? y.flipSign().decrement() : y;

        const resultChunks = [];
        // Process chunk by chunk from LSB.
        while (!xValueForOp.isAbsolutelyZero() || !yValueForOp.isAbsolutelyZero()) {
            const xDivMod = divideAndModulate(xValueForOp, largestTwoPowerChunk);
            let xDigit = xDivMod[1].toJSPrimitiveNumber();
            if (xIsNeg) xDigit = largestTwoPowerChunk - 1 - xDigit; // Apply NOT logic for negative x.

            const yDivMod = divideAndModulate(yValueForOp, largestTwoPowerChunk);
            let yDigit = yDivMod[1].toJSPrimitiveNumber();
            if (yIsNeg) yDigit = largestTwoPowerChunk - 1 - yDigit; // Apply NOT logic for negative y.

            xValueForOp = xDivMod[0];
            yValueForOp = yDivMod[0];

            resultChunks.push(bitwiseFn(xDigit, yDigit));
        }

        // Reconstruct the result from chunks, applying the final sign based on the bitwise operation
        // on the "implicit" highest bits (representing the sign bit).
        let finalResult = NumBase(bitwiseFn(xIsNeg ? 1 : 0, yIsNeg ? 1 : 0) !== 0 ? -1 : 0);
        for (let i = resultChunks.length - 1; i >= 0; i--) {
            finalResult = finalResult.multiply(largestTwoPowerChunk).add(NumBase(resultChunks[i]));
        }
        return finalResult;
    }

    LargeNumber.prototype.bitwiseNot = function() {
        return this.flipSign().decrement(); // Bitwise NOT is equivalent to -(N+1) for integers.
    };
    SmallNumber.prototype.bitwiseNot = LargeNumber.prototype.bitwiseNot;

    LargeNumber.prototype.bitwiseAnd = function(otherNum) {
        return performBitwiseOp(this, otherNum, (a, b) => a & b);
    };
    SmallNumber.prototype.bitwiseAnd = LargeNumber.prototype.bitwiseAnd;

    LargeNumber.prototype.bitwiseOr = function(otherNum) {
        return performBitwiseOp(this, otherNum, (a, b) => a | b);
    };
    SmallNumber.prototype.bitwiseOr = LargeNumber.prototype.bitwiseOr;

    LargeNumber.prototype.bitwiseXor = function(otherNum) {
        return performBitwiseOp(this, otherNum, (a, b) => a ^ b);
    };
    SmallNumber.prototype.bitwiseXor = LargeNumber.prototype.bitwiseXor;

    // --- Other Mathematical Functions ---

    // Mask for roughly determining the lowest set bit in a JS number (useful up to 2^30).
    const lowestBitMaskJS = 1 << 30;

    /**
     * Roughly estimates the lowest set bit (position of the rightmost 1) of a number.
     * Used in GCD for optimization.
     * @param {LargeNumber|SmallNumber} num - The number.
     * @returns {number} A rough estimate of the lowest set bit value (e.g., 1, 2, 4, 8...).
     */
    function getLowestSetBit(num) {
        const val = num.isCompact ? num.val : num.chunks;
        let x;
        if (typeof val === "number") {
            x = val | lowestBitMaskJS; // Ensure some high bits are set for non-zero numbers.
        } else {
            x = val[0] + (val[1] ? val[1] * CHUNK_SIZE : 0) | lowestBitMaskJS; // Simplified for chunks.
        }
        return x & -x;
    }

    /**
     * Calculates the integer logarithm of a value with a given base.
     * (e.g., log_base(value)). Used for bitLength.
     * @param {LargeNumber|SmallNumber} value - The number.
     * @param {LargeNumber|SmallNumber} base - The base of the logarithm.
     * @returns {{p: LargeNumber|SmallNumber, e: number}} An object with power (p) and exponent (e).
     */
    function calcIntegerLog(value, base) {
        if (base.compareWith(value) > 0) {
            return { p: NumBase.ONE, e: 0 };
        }
        const tmp = calcIntegerLog(value, base.square());
        const p = tmp.p;
        const e = tmp.e;
        const t = p.multiply(base);
        return t.compareWith(value) <= 0 ? { p: t, e: e * 2 + 1 } : { p: p, e: e * 2 };
    }

    LargeNumber.prototype.getBitLength = function() {
        let n = this;
        if (n.isStrictlyNegative()) {
            n = n.flipSign().decrement(); // Bit length of -N is often defined as bit length of abs(N)-1.
        }
        if (n.isAbsolutelyZero()) {
            return NumBase.ZERO;
        }
        return NumBase(calcIntegerLog(n, NumBase(2)).e).add(NumBase(1));
    };
    SmallNumber.prototype.getBitLength = LargeNumber.prototype.getBitLength;

    /**
     * Finds the maximum of two numbers.
     * @param {any} a - First number.
     * @param {any} b - Second number.
     * @returns {LargeNumber|SmallNumber} The larger of the two.
     */
    function findMax(a, b) {
        const numA = parseInputToNumber(a);
        const numB = parseInputToNumber(b);
        return numA.isGreaterThan(numB) ? numA : numB;
    }

    /**
     * Finds the minimum of two numbers.
     * @param {any} a - First number.
     * @param {any} b - Second number.
     * @returns {LargeNumber|SmallNumber} The smaller of the two.
     */
    function findMin(a, b) {
        const numA = parseInputToNumber(a);
        const numB = parseInputToNumber(b);
        return numA.isLessThan(numB) ? numA : numB;
    }

    /**
     * Calculates the greatest common divisor (GCD) of two numbers using binary GCD algorithm.
     * @param {any} a - First number.
     * @param {any} b - Second number.
     * @returns {LargeNumber|SmallNumber} The GCD.
     */
    function greatestCommonDivisor(a, b) {
        let numA = parseInputToNumber(a).absoluteValue();
        let numB = parseInputToNumber(b).absoluteValue();

        if (numA.isEqualTo(numB)) return numA;
        if (numA.isAbsolutelyZero()) return numB;
        if (numB.isAbsolutelyZero()) return numA;

        let commonFactor = NumBase.ONE;
        let d, temp;

        while (numA.isEvenlyDivisible() && numB.isEvenlyDivisible()) {
            d = Math.min(getLowestSetBit(numA), getLowestSetBit(numB));
            numA = numA.getQuotient(d);
            numB = numB.getQuotient(d);
            commonFactor = commonFactor.multiply(d);
        }

        while (numA.isEvenlyDivisible()) {
            numA = numA.getQuotient(getLowestSetBit(numA));
        }

        do {
            while (numB.isEvenlyDivisible()) {
                numB = numB.getQuotient(getLowestSetBit(numB));
            }
            if (numA.isGreaterThan(numB)) {
                temp = numB;
                numB = numA;
                numA = temp;
            }
            numB = numB.subtract(numA);
        } while (!numB.isAbsolutelyZero());

        return commonFactor.isOneOrMinusOne() ? numA : numA.multiply(commonFactor);
    }

    /**
     * Calculates the least common multiple (LCM) of two numbers.
     * @param {any} a - First number.
     * @param {any} b - Second number.
     * @returns {LargeNumber|SmallNumber} The LCM.
     */
    function leastCommonMultiple(a, b) {
        const numA = parseInputToNumber(a).absoluteValue();
        const numB = parseInputToNumber(b).absoluteValue();
        if (numA.isAbsolutelyZero() || numB.isAbsolutelyZero()) return NumBase.ZERO;
        return numA.getQuotient(greatestCommonDivisor(numA, numB)).multiply(numB);
    }

    /**
     * Generates a random large number between two given bounds (inclusive).
     * @param {any} lowerBound - The lower bound.
     * @param {any} upperBound - The upper bound.
     * @returns {LargeNumber|SmallNumber} A random number within the range.
     */
    function generateRandomBetween(lowerBound, upperBound) {
        let low = findMin(lowerBound, upperBound);
        let high = findMax(lowerBound, upperBound);
        let range = high.subtract(low).add(1);

        if (range.isCompact) {
            return low.add(Math.floor(Math.random() * range.val));
        }

        const rangeChunks = range.chunks;
        const len = rangeChunks.length;
        const resultChunks = [];
        let restricted = true;

        for (let i = len - 1; i >= 0; i--) {
            const currentMaxChunk = restricted ? rangeChunks[i] : CHUNK_SIZE - 1;
            const digit = intPart(Math.random() * (currentMaxChunk + 1));
            resultChunks.unshift(digit);
            if (digit < currentMaxChunk) restricted = false;
        }

        const combinedResult = combineChunksToJSNum(resultChunks);
        if (typeof combinedResult === "number") {
            return low.add(new SmallNumber(combinedResult));
        }
        return low.add(new LargeNumber(combinedResult, false));
    }

    // --- Base Conversion and String Representation ---

    /**
     * Parses a string representation of a number in a given base (radix).
     * @param {string} textValue - The string to parse.
     * @param {number} inputRadix - The base (2-36, or custom for `<digit>` format).
     * @returns {LargeNumber|SmallNumber} The parsed number.
     * @throws {Error} If the string contains invalid digits for the base.
     */
    const parseStringWithBase = function(textValue, inputRadix) {
        const strLen = textValue.length;
        const base = parseInputToNumber(inputRadix);
        const absBase = Math.abs(base.toJSPrimitiveNumber());

        // Basic validation for character validity in the given base.
        for (let i = 0; i < strLen; i++) {
            const char = textValue[i].toLowerCase();
            if (char === "-") continue;
            if (/[a-z0-9]/.test(char)) {
                let digitValue = /[0-9]/.test(char) ? parseInt(char, 10) : char.charCodeAt(0) - 87;
                if (digitValue >= absBase && !(char === "1" && absBase === 1)) {
                    throw new Error(`'${char}' is not a valid digit in base ${inputRadix}.`);
                }
            } else if (char === "<") {
                let start = i;
                do { i++; } while (i < strLen && textValue[i] !== ">");
                if (i === strLen) throw new Error(`Unclosed custom digit in base string: ${textValue.substring(start)}`);
            } else {
                throw new Error(`'${char}' is not a valid character in base ${inputRadix}.`);
            }
        }

        // Optimization for common bases (2-36) where `parseInt` can be used.
        if (base.isCompact && base.val >= 2 && base.val <= 36) {
            if (strLen <= LOG_MAX_SAFE_JS_INT / Math.log(base.val)) {
                const result = parseInt(textValue, base.val);
                if (!isNaN(result)) return new SmallNumber(result);
            }
        }

        const digits = [];
        const isNegative = textValue[0] === "-";
        for (let i = isNegative ? 1 : 0; i < textValue.length; i++) {
            const char = textValue[i].toLowerCase();
            const charCode = char.charCodeAt(0);
            if (charCode >= 48 && charCode <= 57) {
                digits.push(NumBase(char));
            } else if (charCode >= 97 && charCode <= 122) {
                digits.push(NumBase(charCode - 87));
            } else if (char === "<") {
                let start = i;
                do { i++; } while (textValue[i] !== ">");
                digits.push(NumBase(textValue.slice(start + 1, i)));
            }
        }
        return constructFromBaseChunks(digits, base, isNegative);
    };

    /**
     * Constructs a large number from an array of digits and a base.
     * @param {Array<LargeNumber|SmallNumber>} digitNums - Array of digits (each a NumBase instance).
     * @param {LargeNumber|SmallNumber} baseNum - The base.
     * @param {boolean} isNegativeFlag - True if the number should be negative.
     * @returns {LargeNumber|SmallNumber} The constructed number.
     */
    function constructFromBaseChunks(digitNums, baseNum, isNegativeFlag) {
        let result = NumBase.ZERO;
        let currentPower = NumBase.ONE;

        for (let i = digitNums.length - 1; i >= 0; i--) {
            result = result.add(digitNums[i].multiply(currentPower));
            currentPower = currentPower.multiply(baseNum);
        }
        return isNegativeFlag ? result.flipSign() : result;
    }

    /**
     * Converts a single digit (0-35) to its string representation (0-9, a-z).
     * For digits > 35, it uses a custom `<digit>` format.
     * @param {number} digit - The digit to stringify.
     * @returns {string} The string representation.
     */
    function chunkToString(digit) {
        if (digit >= 0 && digit <= 35) {
            return "0123456789abcdefghijklmnopqrstuvwxyz".charAt(digit);
        }
        return `<${digit}>`;
    }

    /**
     * Converts a large number to an array of its digits in a specified base.
     * @param {LargeNumber|SmallNumber} num - The number to convert.
     * @param {LargeNumber|SmallNumber} base - The target base.
     * @returns {{value: number[], isNegative: boolean}} An object with digit array and sign.
     * @throws {Error} If base is zero.
     */
    function convertToBaseDigits(num, base) {
        base = parseInputToNumber(base);

        if (base.isAbsolutelyZero()) {
            if (num.isAbsolutelyZero()) return { value: [0], isNegative: false };
            throw new Error("Cannot convert nonzero numbers to base 0.");
        }

        if (base.isEqualTo(-1)) {
            const absNumVal = num.absoluteValue().toJSPrimitiveNumber();
            if (absNumVal === 0) return { value: [0], isNegative: false };
            const digits = [];
            if (num.isStrictlyNegative()) { // -N in base -1
                for (let i = 0; i < absNumVal; i++) { digits.push(1, 0); }
            } else { // +N in base -1
                digits.push(1);
                for (let i = 0; i < absNumVal - 1; i++) { digits.push(0, 1); }
            }
            return { value: digits, isNegative: false };
        }

        if (base.isEqualTo(1)) {
            if (num.isAbsolutelyZero()) return { value: [0], isNegative: false };
            const absNumVal = num.absoluteValue().toJSPrimitiveNumber();
            return { value: Array(absNumVal).fill(1), isNegative: num.isNegative };
        }

        let isResultNegative = false;
        let currentNum = num;
        if (num.isStrictlyNegative() && base.isStrictlyPositive()) {
            isResultNegative = true;
            currentNum = num.absoluteValue();
        }

        const digitArray = [];
        let divModResult;

        while (currentNum.isStrictlyNegative() || currentNum.compareAbsoluteValue(base) >= 0) {
            divModResult = currentNum.getDivModResult(base);
            currentNum = divModResult.quotient;
            let digit = divModResult.remainder;

            if (digit.isStrictlyNegative()) {
                digit = base.subtract(digit).absoluteValue();
                currentNum = currentNum.increment();
            }
            digitArray.push(digit.toJSPrimitiveNumber());
        }
        digitArray.push(currentNum.toJSPrimitiveNumber());

        return { value: digitArray.reverse(), isNegative: isResultNegative };
    }

    /**
     * Converts a large number to its string representation in a given base.
     * @param {LargeNumber|SmallNumber} num - The number.
     * @param {any} base - The target base.
     * @returns {string} The string representation.
     */
    function toBaseStringRepresentation(num, base) {
        const { value: digitArr, isNegative } = convertToBaseDigits(num, base);
        return (isNegative ? "-" : "") + digitArr.map(chunkToString).join("");
    }

    LargeNumber.prototype.toDigitArray = function(radix) {
        return convertToBaseDigits(this, radix);
    };
    SmallNumber.prototype.toDigitArray = function(radix) {
        return convertToBaseDigits(this, radix);
    };

    LargeNumber.prototype.toDecimalString = function(radix) {
        if (radix === undef || radix === 10) {
            const chunks = this.chunks;
            const len = chunks.length;
            let str = String(chunks[len - 1]);
            const zeroPadding = "0".repeat(CHUNK_DIGITS);

            for (let i = len - 2; i >= 0; i--) {
                const digitChunk = String(chunks[i]);
                str += zeroPadding.slice(digitChunk.length) + digitChunk;
            }
            return (this.isNegative ? "-" : "") + str;
        }
        return toBaseStringRepresentation(this, radix);
    };
    SmallNumber.prototype.toDecimalString = function(radix) {
        if (radix === undef || radix === 10) {
            return String(this.val);
        }
        return toBaseStringRepresentation(this, radix);
    };

    LargeNumber.prototype.toJSONObject = SmallNumber.prototype.toJSONObject = function() {
        return this.toDecimalString();
    };

    LargeNumber.prototype.getPrimitiveValue = function() {
        return parseInt(this.toDecimalString(), 10);
    };
    LargeNumber.prototype.toJSPrimitiveNumber = LargeNumber.prototype.getPrimitiveValue;

    SmallNumber.prototype.getPrimitiveValue = function() {
        return this.val;
    };
    SmallNumber.prototype.toJSPrimitiveNumber = SmallNumber.prototype.getPrimitiveValue;

    // --- Input Parsing ---

    /**
     * Parses a string input into a LargeNumber or SmallNumber.
     * Handles scientific notation and decimal points (only if it resolves to an integer).
     * @param {string} strValue - The string to parse.
     * @returns {LargeNumber|SmallNumber} The parsed number.
     * @throws {Error} If the string is not a valid integer representation.
     */
    function processStringInput(strValue) {
        if (strValue.trim() === '') return NumBase.ZERO; // Handle empty string as zero.
        if (canFitInJS(+strValue)) {
            const num = +strValue;
            if (num === intPart(num)) return new SmallNumber(num);
            throw new Error(`Invalid integer: ${strValue} contains a fractional part.`);
        }

        let isNegative = strValue[0] === "-";
        if (isNegative) strValue = strValue.slice(1);

        const parts = strValue.split(/e/i);
        if (parts.length > 2) {
            throw new Error(`Invalid integer: ${parts.join("e")} has multiple 'e' characters.`);
        }
        if (parts.length === 2) {
            let exponentPart = parts[1];
            if (exponentPart[0] === "+") exponentPart = exponentPart.slice(1);
            const exponent = +exponentPart;

            if (exponent !== intPart(exponent) || !canFitInJS(exponent)) {
                throw new Error(`Invalid integer: exponent '${exponentPart}' is not a valid integer or is too large.`);
            }

            let mainPart = parts[0];
            const decimalPointIndex = mainPart.indexOf(".");
            if (decimalPointIndex >= 0) {
                exponent -= (mainPart.length - decimalPointIndex - 1);
                mainPart = mainPart.slice(0, decimalPointIndex) + mainPart.slice(decimalPointIndex + 1);
            }

            if (exponent < 0) {
                throw new Error("Cannot include negative exponent part for integer representation.");
            }
            mainPart += "0".repeat(exponent);
            strValue = mainPart;
        }

        if (!/^([0-9]+)$/.test(strValue)) {
            if (strValue === '') return NumBase.ZERO;
            throw new Error(`Invalid integer format: ${strValue}.`);
        }

        const resultChunks = [];
        let startIndex = strValue.length - CHUNK_DIGITS;

        while (startIndex >= 0) {
            resultChunks.push(+strValue.slice(startIndex, startIndex + CHUNK_DIGITS));
            startIndex -= CHUNK_DIGITS;
        }
        if (startIndex < 0 && startIndex + CHUNK_DIGITS > 0) {
            resultChunks.push(+strValue.slice(0, startIndex + CHUNK_DIGITS));
        }
        resultChunks.reverse();

        normalizeChunks(resultChunks);
        return new LargeNumber(resultChunks, isNegative);
    }

    /**
     * Parses a number input into a SmallNumber or LargeNumber.
     * @param {number} numValue - The number to parse.
     * @returns {SmallNumber|LargeNumber} The parsed number.
     * @throws {Error} If the number is not an integer or is not finite.
     */
    function processNumberInput(numValue) {
        if (numValue === undef) return NumBase.ZERO;
        if (!Number.isFinite(numValue)) throw new Error(`Invalid number: ${numValue} is not a finite number.`);
        if (numValue === 0) return NumBase.ZERO;

        if (canFitInJS(numValue)) {
            if (numValue !== intPart(numValue)) {
                throw new Error(`${numValue} is not an integer.`);
            }
            return new SmallNumber(numValue);
        }
        return processStringInput(String(numValue));
    }

    /**
     * Parses various input types (number, string, or existing NumBase object) into a NumBase instance.
     * This is the primary entry point for converting external values into the library's number format.
     * @param {any} input - The value to parse.
     * @returns {LargeNumber|SmallNumber} A NumBase instance.
     */
    function parseInputToNumber(input) {
        if (typeof input === "number") return processNumberInput(input);
        if (typeof input === "string") return processStringInput(input);
        if (input instanceof LargeNumber || input instanceof SmallNumber) return input;
        
        // Attempt to convert objects with valueOf/toString methods.
        if (input && typeof input.valueOf === 'function' && !isNaN(input.valueOf())) {
            const val = input.valueOf();
            if (typeof val === 'number') return processNumberInput(val);
            if (typeof val === 'string') return processStringInput(val);
        }
        if (input && typeof input.toDecimalString === 'function') {
            return processStringInput(input.toDecimalString());
        }
        throw new Error(`Cannot parse input type: ${typeof input} with value ${JSON.stringify(input)}`);
    }

    // --- Static Properties and Methods for NumBase ---

    // Pre-populate small integer instances for performance.
    for (let i = 0; i < 1000; i++) {
        NumBase[i] = new SmallNumber(i);
        if (i > 0) NumBase[-i] = new SmallNumber(-i);
    }

    NumBase.ONE = NumBase[1];
    NumBase.ZERO = NumBase[0];
    NumBase.MINUS_ONE = NumBase[-1];
    NumBase.findMax = findMax;
    NumBase.findMin = findMin;
    NumBase.greatestCommonDivisor = greatestCommonDivisor;
    NumBase.leastCommonMultiple = leastCommonMultiple;
    NumBase.isInstance = (obj) => obj instanceof LargeNumber || obj instanceof SmallNumber;
    NumBase.generateRandomBetween = generateRandomBetween;
    NumBase.fromDigitArray = (digitValues, base, isNegative) => {
        const parsedDigits = digitValues.map(parseInputToNumber);
        return constructFromBaseChunks(parsedDigits, parseInputToNumber(base || 10), isNegative);
    };

    return NumBase;
})();

// --- Main Program Logic ---

// This function calculates the minimum value of (i * (i+1)) % 2019
// for a given range [L, R) or [L, R] depending on problem interpretation.
// The original code implies [L, R) for the loop, but the initial value covers L.
// Let's assume the task is to find min (i * (i+1)) % 2019 for i from L to R (inclusive).
const calculateMinModulo = (inputContent) => {
    // Input validation for robustness.
    if (typeof inputContent !== 'string' || !inputContent.trim()) {
        throw new Error("Input content must be a non-empty string.");
    }

    const lines = inputContent.trim().split("\n");
    const boundsStr = lines[0].split(" ");

    if (boundsStr.length < 2) {
        throw new Error("Input string is missing lower (L) or upper (R) bound.");
    }

    const lowerBoundVal = parseInt(boundsStr[0], 10);
    const upperBoundVal = parseInt(boundsStr[1], 10);

    if (isNaN(lowerBoundVal) || isNaN(upperBoundVal)) {
        throw new Error("Invalid integer bounds provided in input.");
    }
    if (lowerBoundVal < 0 || upperBoundVal < 0) {
        throw new Error("Bounds (L and R) must be non-negative integers.");
    }
    if (lowerBoundVal > upperBoundVal) {
        throw new Error("Lower bound (L) cannot be greater than upper bound (R).");
    }

    const MOD_TARGET = 2019; // The modulo value.

    // Optimization: If any number 'i' in the range [L, R] is a multiple of MOD_TARGET,
    // then 'i * (i+1)' will also be a multiple of MOD_TARGET, resulting in a remainder of 0.
    // This is the absolute minimum possible non-negative remainder.
    // Check for this condition first to potentially short-circuit the entire calculation.
    for (let currentVal = lowerBoundVal; currentVal <= upperBoundVal; currentVal++) {
        if (currentVal % MOD_TARGET === 0) {
            console.log("0");
            return;
        }
    }

    // If no direct multiple of MOD_TARGET was found, we need to iterate and calculate.
    // Initialize minimum remainder with the value for L.
    const initialLNum = largeNum(lowerBoundVal);
    let minRemainderSoFar = initialLNum.multiply(initialLNum.add(1)).getRemainder(MOD_TARGET);

    // Iterate from L + 1 up to R (inclusive).
    // The original code's loop was `for(let i=L; i<R; i++)`, meaning `R` is exclusive.
    // Let's adhere to the original loop range for `i`, which is `[L, R-1]`.
    // The `for` loop below will iterate from `lowerBoundVal` up to `upperBoundVal - 1`.
    // The first value `lowerBoundVal` is already processed above as `initialLNum`.
    // So the loop should iterate from `lowerBoundVal + 1` up to `upperBoundVal - 1`.
    // Or, simpler, iterate from `lowerBoundVal` and update `minRemainderSoFar`.
    // Let's make the loop simple `L` to `R-1` and update `minRemainderSoFar` inside.
    // The initial `minRemainderSoFar` will be for `L`.
    for (let currentVal = lowerBoundVal; currentVal < upperBoundVal; currentVal++) {
        const currentNum = largeNum(currentVal);
        const product = currentNum.multiply(currentNum.add(1));
        const currentModResult = product.getRemainder(MOD_TARGET);

        if (currentModResult.isLessThan(minRemainderSoFar)) {
            minRemainderSoFar = currentModResult;
        }
    }

    // Output the final minimum remainder.
    console.log(minRemainderSoFar.toDecimalString());
};

// Read input from /dev/stdin (standard input for competitive programming).
const inputReader = require('fs').readFileSync('/dev/stdin', 'utf8');
calculateMinModulo(inputReader);