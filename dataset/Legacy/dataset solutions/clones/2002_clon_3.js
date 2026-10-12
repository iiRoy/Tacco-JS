"use strict"
const largeNum = (function() {
    "use strict";

    // Configuration constants for internal chunking mechanism
    const CHUNK_SIZE = 10_000_000; // Base for our large number system (10^7)
    const CHUNK_DIGITS = 7; // Number of decimal digits each chunk can hold
    const JS_MAX_SAFE_INT_VAL = 9007199254740991; // JavaScript's maximum safe integer (2^53 - 1)
    const JS_MAX_SAFE_INT_CHUNKS = convertSmallToChunkArray(JS_MAX_SAFE_INT_VAL); // Max safe integer as a chunk array
    const LOG_JS_MAX_SAFE_INT = Math.log(JS_MAX_SAFE_INT_VAL); // Logarithm for quick conversion checks

    /**
     * Primary factory function for creating number instances.
     * Determines whether to create a CompactNum or LargeNum.
     * @param {*} valueToParse - The input value (number, string, or existing instance).
     * @param {number} [baseRadix] - Optional base for string parsing.
     * @returns {NumInstance} An instance of CompactNum or LargeNum.
     */
    function NumInstanceFactory(valueToParse, baseRadix) {
        // If no value is provided, return the cached zero instance.
        if (valueToParse === undefined || valueToParse === null) {
            return NumInstanceFactory.ZERO_VAL;
        }
        // If a radix is specified, delegate to base-specific parsing.
        if (baseRadix !== undefined) {
            // Optimization for base 10: use direct value parsing.
            return (baseRadix === 10) ? parseInputToNum(valueToParse) : parseStringInBase(valueToParse, baseRadix);
        }
        // Default parsing for numbers, strings, or existing instances.
        return parseInputToNum(valueToParse);
    }

    /**
     * Base prototype for all number types (CompactNum and LargeNum).
     * Provides a common interface for methods.
     */
    function NumPrototype() {}
    // Placeholder for common methods, which will be added directly to prototypes.

    /**
     * Represents large integers using an array of number chunks.
     * @param {number[]} chunkStorage - Array of number chunks, least significant first.
     * @param {boolean} isNegative - True if the number is negative, false otherwise.
     */
    function LargeNum(chunkStorage, isNegative) {
        this.chunkStorage = chunkStorage;
        this.isNegative = isNegative;
        this.isCompact = false; // Flag to indicate it's a large number
    }
    LargeNum.prototype = Object.create(NumPrototype.prototype);

    /**
     * Represents smaller integers that fit within JavaScript's native safe integer range.
     * @param {number} rawValue - The native JavaScript number value.
     */
    function CompactNum(rawValue) {
        this.rawValue = rawValue;
        this.isNegative = rawValue < 0;
        this.isCompact = true; // Flag to indicate it's a compact number
    }
    CompactNum.prototype = Object.create(NumPrototype.prototype);

    /**
     * Checks if a given number can be accurately represented by a standard JavaScript number.
     * @param {number} numToCheck - The number to validate.
     * @returns {boolean} True if within safe integer limits, false otherwise.
     */
    function isWithinJsSafeRange(numToCheck) {
        return numToCheck > -JS_MAX_SAFE_INT_VAL && numToCheck < JS_MAX_SAFE_INT_VAL;
    }

    /**
     * Converts a small JavaScript number into an array of CHUNK_SIZE-based chunks.
     * @param {number} smallInt - The integer to convert.
     * @returns {number[]} An array of chunks.
     */
    function convertSmallToChunkArray(smallInt) {
        const absVal = Math.abs(smallInt);
        if (absVal < CHUNK_SIZE) return [absVal];
        if (absVal < CHUNK_SIZE * CHUNK_SIZE) return [absVal % CHUNK_SIZE, Math.floor(absVal / CHUNK_SIZE)];
        // Handles up to 3 chunks, which is sufficient for JS_MAX_SAFE_INT_VAL (~9e15, 3 chunks of 1e7)
        return [absVal % CHUNK_SIZE, Math.floor(absVal / CHUNK_SIZE) % CHUNK_SIZE, Math.floor(absVal / (CHUNK_SIZE * CHUNK_SIZE))];
    }

    /**
     * Attempts to convert a chunk array back into a small JavaScript number.
     * If the number is too large or has too many chunks, the original array is returned.
     * @param {number[]} chunkArray - The array of chunks.
     * @returns {number|number[]} The converted small number or the original chunk array.
     */
    function convertChunkArrayToSmall(chunkArray) {
        trimLeadingZeros(chunkArray); // Clean up array before conversion
        const chunkCount = chunkArray.length;

        // Only convert if it's likely to fit within a JS safe integer
        if (chunkCount < 4 && compareAbsoluteChunkArrays(chunkArray, JS_MAX_SAFE_INT_CHUNKS) < 0) {
            switch (chunkCount) {
                case 0: return 0; // Represents zero
                case 1: return chunkArray[0];
                case 2: return chunkArray[0] + chunkArray[1] * CHUNK_SIZE;
                case 3: return chunkArray[0] + (chunkArray[1] + chunkArray[2] * CHUNK_SIZE) * CHUNK_SIZE;
                default: return chunkArray; // Should not happen with the length check
            }
        }
        return chunkArray; // Too big for a small number
    }

    /**
     * Removes leading zero chunks from a number's chunk array representation.
     * Ensures that [0] remains [0] and not an empty array.
     * @param {number[]} chunkArray - The array of chunks to normalize.
     */
    function trimLeadingZeros(chunkArray) {
        let lastNonZeroIdx = chunkArray.length - 1;
        while (lastNonZeroIdx > 0 && chunkArray[lastNonZeroIdx] === 0) {
            lastNonZeroIdx--;
        }
        chunkArray.length = lastNonZeroIdx + 1; // Resize the array
        if (chunkArray.length === 0) chunkArray.push(0); // Ensure [0] for zero value
    }

    /**
     * Creates and initializes a new array with zeros.
     * @param {number} desiredLength - The size of the array.
     * @returns {number[]} A new array filled with zeros.
     */
    function createZeroFilledArray(desiredLength) {
        const newArr = new Array(desiredLength);
        for (let i = 0; i < desiredLength; i++) {
            newArr[i] = 0;
        }
        return newArr;
    }

    /**
     * Truncates a number towards zero (floor for positive, ceil for negative).
     * @param {number} num - The number to truncate.
     * @returns {number} The integer part of the number.
     */
    function truncateNumber(num) {
        return num > 0 ? Math.floor(num) : Math.ceil(num);
    }

    /**
     * Performs chunk-by-chunk addition of two arrays. Assumes first array is equal or longer.
     * @param {number[]} arrA - The first (potentially longer) chunk array.
     * @param {number[]} arrB - The second chunk array.
     * @returns {number[]} The resultant chunk array.
     */
    function performChunkAddition(arrA, arrB) {
        const lenA = arrA.length;
        const lenB = arrB.length;
        const result = new Array(lenA);
        let carry = 0;
        let currentSum;

        // Add corresponding chunks from both arrays
        for (let i = 0; i < lenB; i++) {
            currentSum = arrA[i] + arrB[i] + carry;
            carry = Math.floor(currentSum / CHUNK_SIZE);
            result[i] = currentSum % CHUNK_SIZE;
        }

        // Propagate any remaining carry through the longer array
        for (let i = lenB; i < lenA; i++) {
            currentSum = arrA[i] + carry;
            carry = Math.floor(currentSum / CHUNK_SIZE);
            result[i] = currentSum % CHUNK_SIZE;
        }

        // If there's a final carry, append it to the result
        if (carry > 0) {
            result.push(carry);
        }
        return result;
    }

    /**
     * Handles addition between two chunk arrays, ensuring the longer array is first.
     * @param {number[]} arr1 - First chunk array.
     * @param {number[]} arr2 - Second chunk array.
     * @returns {number[]} The sum as a chunk array.
     */
    function flexibleChunkAddition(arr1, arr2) {
        return (arr1.length >= arr2.length) ? performChunkAddition(arr1, arr2) : performChunkAddition(arr2, arr1);
    }

    /**
     * Adds a small scalar value to a chunk array.
     * @param {number[]} chunkArray - The array of chunks.
     * @param {number} scalar - The small integer to add.
     * @returns {number[]} The resultant chunk array.
     */
    function addScalarToChunkArray(chunkArray, scalar) {
        const len = chunkArray.length;
        const result = new Array(len);
        let currentCarry = scalar; // Scalar acts as the initial carry
        let currentSum;

        for (let i = 0; i < len; i++) {
            currentSum = chunkArray[i] + currentCarry;
            currentCarry = Math.floor(currentSum / CHUNK_SIZE);
            result[i] = currentSum % CHUNK_SIZE;
        }

        // Propagate any remaining carry
        while (currentCarry > 0) {
            result.push(currentCarry % CHUNK_SIZE);
            currentCarry = Math.floor(currentCarry / CHUNK_SIZE);
        }
        return result;
    }

    // LargeNum arithmetic methods
    LargeNum.prototype.add = function(otherValue) {
        const otherNum = parseInputToNum(otherValue);
        // If signs differ, it's effectively a subtraction.
        if (this.isNegative !== otherNum.isNegative) {
            return this.subtract(otherNum.negate());
        }

        const currentChunks = this.chunkStorage;
        const otherChunks = otherNum.chunkStorage;

        // Use optimized path if the other number is compact.
        if (otherNum.isCompact) {
            return new LargeNum(addScalarToChunkArray(currentChunks, Math.abs(otherNum.rawValue)), this.isNegative);
        }
        // Otherwise, perform full chunk array addition.
        return new LargeNum(flexibleChunkAddition(currentChunks, otherChunks), this.isNegative);
    };
    LargeNum.prototype.plus = LargeNum.prototype.add; // Alias for add

    // CompactNum arithmetic methods
    CompactNum.prototype.add = function(otherValue) {
        const otherNum = parseInputToNum(otherValue);
        const thisRaw = this.rawValue;

        // If signs differ, convert to subtraction.
        if ((thisRaw < 0) !== otherNum.isNegative) {
            return this.subtract(otherNum.negate());
        }

        // If both are compact, try direct JS number addition.
        if (otherNum.isCompact) {
            const sum = thisRaw + otherNum.rawValue;
            if (isWithinJsSafeRange(sum)) {
                return new CompactNum(sum);
            }
            // If sum overflows, convert to LargeNum operation using chunks.
            // Add the absolute values and apply the common sign.
            const absOtherChunks = convertSmallToChunkArray(Math.abs(otherNum.rawValue));
            return new LargeNum(addScalarToChunkArray(absOtherChunks, Math.abs(thisRaw)), thisRaw < 0);
        }
        // If this is compact but other is large, use scalar addition on the large number.
        return new LargeNum(addScalarToChunkArray(otherNum.chunkStorage, Math.abs(thisRaw)), thisRaw < 0);
    };
    CompactNum.prototype.plus = CompactNum.prototype.add; // Alias for add

    /**
     * Performs chunk-by-chunk subtraction of array B from array A. Assumes A >= B (absolute values).
     * @param {number[]} minuendChunks - The chunk array to subtract from.
     * @param {number[]} subtrahendChunks - The chunk array to subtract.
     * @returns {number[]} The resultant chunk array.
     */
    function performChunkSubtraction(minuendChunks, subtrahendChunks) {
        const lenMinuend = minuendChunks.length;
        const lenSubtrahend = subtrahendChunks.length;
        const result = new Array(lenMinuend);
        let borrow = 0;
        let difference;

        // Subtract corresponding chunks
        for (let i = 0; i < lenSubtrahend; i++) {
            difference = minuendChunks[i] - borrow - subtrahendChunks[i];
            if (difference < 0) {
                difference += CHUNK_SIZE;
                borrow = 1; // Need to borrow from the next chunk
            } else {
                borrow = 0;
            }
            result[i] = difference;
        }

        // Propagate any remaining borrow through the rest of the minuend chunks
        for (let i = lenSubtrahend; i < lenMinuend; i++) {
            difference = minuendChunks[i] - borrow;
            if (difference < 0) {
                difference += CHUNK_SIZE; // Still need to borrow
            } else {
                result[i++] = difference; // No more borrow, copy remaining chunks
                break;
            }
            result[i] = difference;
        }
        // Copy any remaining chunks if no further borrow
        for (let i = lenMinuend; i < result.length; i++) {
            result[i] = minuendChunks[i];
        }

        trimLeadingZeros(result); // Clean up result
        return result;
    }

    /**
     * Performs subtraction between two chunk arrays, managing signs and order.
     * @param {number[]} chunksA - First chunk array.
     * @param {number[]} chunksB - Second chunk array.
     * @param {boolean} originalSign - The sign of the original minuend.
     * @returns {LargeNum|CompactNum} The result of the subtraction.
     */
    function flexibleChunkSubtraction(chunksA, chunksB, originalSign) {
        let resultChunks;
        let resultSign = originalSign;

        // Compare absolute values to determine effective subtraction order.
        if (compareAbsoluteChunkArrays(chunksA, chunksB) >= 0) {
            resultChunks = performChunkSubtraction(chunksA, chunksB);
        } else {
            resultChunks = performChunkSubtraction(chunksB, chunksA);
            resultSign = !originalSign; // Sign flips if subtrahend was absolutely larger
        }

        const convertedSmall = convertChunkArrayToSmall(resultChunks);
        if (typeof convertedSmall === "number") {
            return new CompactNum(resultSign ? -convertedSmall : convertedSmall);
        }
        return new LargeNum(resultChunks, resultSign);
    }

    /**
     * Subtracts a small scalar value from a chunk array.
     * @param {number[]} chunkArray - The chunk array to subtract from.
     * @param {number} scalarAbsValue - The absolute small integer value to subtract.
     * @param {boolean} originalSign - The sign of the original minuend.
     * @returns {LargeNum|CompactNum} The result.
     */
    function subtractScalarFromChunkArray(chunkArray, scalarAbsValue, originalSign) {
        const len = chunkArray.length;
        const result = new Array(len);
        let currentCarry = -scalarAbsValue; // Scalar acts as the initial negative carry
        let difference;

        for (let i = 0; i < len; i++) {
            difference = chunkArray[i] + currentCarry;
            currentCarry = Math.floor(difference / CHUNK_SIZE);
            result[i] = difference % CHUNK_SIZE;
            if (result[i] < 0) result[i] += CHUNK_SIZE; // Ensure chunk is positive
        }
        trimLeadingZeros(result);

        const convertedSmall = convertChunkArrayToSmall(result);
        if (typeof convertedSmall === "number") {
            return new CompactNum(originalSign ? -convertedSmall : convertedSmall);
        }
        return new LargeNum(result, originalSign);
    }

    LargeNum.prototype.subtract = function(otherValue) {
        const otherNum = parseInputToNum(otherValue);
        // If signs differ, it's effectively an addition.
        if (this.isNegative !== otherNum.isNegative) {
            return this.add(otherNum.negate());
        }

        const currentChunks = this.chunkStorage;
        const otherChunks = otherNum.chunkStorage;

        // Use optimized path if the other number is compact.
        if (otherNum.isCompact) {
            return subtractScalarFromChunkArray(currentChunks, Math.abs(otherNum.rawValue), this.isNegative);
        }
        // Otherwise, perform full chunk array subtraction.
        return flexibleChunkSubtraction(currentChunks, otherChunks, this.isNegative);
    };
    LargeNum.prototype.minus = LargeNum.prototype.subtract; // Alias for subtract

    CompactNum.prototype.subtract = function(otherValue) {
        const otherNum = parseInputToNum(otherValue);
        const thisRaw = this.rawValue;

        // If signs differ, convert to addition.
        if ((thisRaw < 0) !== otherNum.isNegative) {
            return this.add(otherNum.negate());
        }

        // If both are compact, try direct JS number subtraction.
        if (otherNum.isCompact) {
            return new CompactNum(thisRaw - otherNum.rawValue);
        }
        // If this is compact but other is large, perform scalar subtraction,
        // but with operands swapped and sign adjusted.
        // E.g., small - large = -(large - small)
        return subtractScalarFromChunkArray(otherNum.chunkStorage, Math.abs(thisRaw), thisRaw >= 0);
    };
    CompactNum.prototype.minus = CompactNum.prototype.subtract; // Alias for subtract

    LargeNum.prototype.negate = function() {
        return new LargeNum(this.chunkStorage, !this.isNegative);
    };
    CompactNum.prototype.negate = function() {
        return new CompactNum(-this.rawValue);
    };

    LargeNum.prototype.toAbsolute = function() {
        return new LargeNum(this.chunkStorage, false);
    };
    CompactNum.prototype.toAbsolute = function() {
        return new CompactNum(Math.abs(this.rawValue));
    };

    /**
     * Performs standard long multiplication for two chunk arrays.
     * @param {number[]} chunksA - First operand chunks.
     * @param {number[]} chunksB - Second operand chunks.
     * @returns {number[]} The product as a chunk array.
     */
    function performLongChunkMultiplication(chunksA, chunksB) {
        const lenA = chunksA.length;
        const lenB = chunksB.length;
        const resultLen = lenA + lenB;
        const result = createZeroFilledArray(resultLen); // Initialize result with zeros

        let productTerm, currentCarry;
        let digitA, digitB;

        for (let i = 0; i < lenA; ++i) {
            digitA = chunksA[i];
            currentCarry = 0; // Reset carry for each digit of chunksA
            for (let j = 0; j < lenB; ++j) {
                digitB = chunksB[j];
                // Calculate product, add previous carry, and add existing sum at this position
                productTerm = digitA * digitB + result[i + j] + currentCarry;
                currentCarry = Math.floor(productTerm / CHUNK_SIZE);
                result[i + j] = productTerm % CHUNK_SIZE;
            }
            result[i + lenB] += currentCarry; // Add final carry to the next highest position
        }
        trimLeadingZeros(result); // Clean up any leading zeros
        return result;
    }

    /**
     * Multiplies a chunk array by a single small integer scalar.
     * @param {number[]} chunkArray - The chunk array to multiply.
     * @param {number} scalar - The scalar value.
     * @returns {number[]} The product as a chunk array.
     */
    function performChunkScalarMultiplication(chunkArray, scalar) {
        const len = chunkArray.length;
        const result = new Array(len);
        let currentCarry = 0;
        let productTerm;

        for (let i = 0; i < len; i++) {
            productTerm = chunkArray[i] * scalar + currentCarry;
            currentCarry = Math.floor(productTerm / CHUNK_SIZE);
            result[i] = productTerm % CHUNK_SIZE;
        }

        // Propagate any remaining carry
        while (currentCarry > 0) {
            result.push(currentCarry % CHUNK_SIZE);
            currentCarry = Math.floor(currentCarry / CHUNK_SIZE);
        }
        return result;
    }

    /**
     * Pads a chunk array with leading zeros, effectively shifting it left by `numZeros` chunk positions.
     * @param {number[]} chunkArray - The array of chunks.
     * @param {number} numZeros - The number of zero chunks to prepend.
     * @returns {number[]} The new array with zeros prepended.
     */
    function prependZeroChunks(chunkArray, numZeros) {
        const zeroArray = createZeroFilledArray(numZeros);
        return zeroArray.concat(chunkArray);
    }

    /**
     * Implements the Karatsuba multiplication algorithm for chunk arrays.
     * More efficient for very large numbers than standard long multiplication.
     * @param {number[]} xChunks - First operand chunks.
     * @param {number[]} yChunks - Second operand chunks.
     * @returns {number[]} The product as a chunk array.
     */
    function karatsubaChunkMultiplication(xChunks, yChunks) {
        const n = Math.max(xChunks.length, yChunks.length);
        if (n <= 30) { // Base case: use long multiplication for smaller arrays (threshold is heuristic)
            return performLongChunkMultiplication(xChunks, yChunks);
        }

        // Split arrays into halves
        const m = Math.ceil(n / 2);
        const xHigh = xChunks.slice(m); // High part of x
        const xLow = xChunks.slice(0, m); // Low part of x
        const yHigh = yChunks.slice(m); // High part of y
        const yLow = yChunks.slice(0, m); // Low part of y

        // Recursively compute three products
        const p1 = karatsubaChunkMultiplication(xLow, yLow); // xLow * yLow
        const p2 = karatsubaChunkMultiplication(xHigh, yHigh); // xHigh * yHigh
        // (xLow + xHigh) * (yLow + yHigh)
        const p3 = karatsubaChunkMultiplication(flexibleChunkAddition(xLow, xHigh), flexibleChunkAddition(yLow, yHigh));

        // Combine results: p2 * B^(2m) + (p3 - p1 - p2) * B^m + p1
        // B here refers to CHUNK_SIZE
        const middleTerm = performChunkSubtraction(performChunkSubtraction(p3, p1), p2);
        const finalProduct = flexibleChunkAddition(
            flexibleChunkAddition(p1, prependZeroChunks(middleTerm, m)),
            prependZeroChunks(p2, 2 * m)
        );
        trimLeadingZeros(finalProduct);
        return finalProduct;
    }

    /**
     * Heuristic to decide whether Karatsuba algorithm is more efficient than long multiplication.
     * @param {number} len1 - Length of first chunk array.
     * @param {number} len2 - Length of second chunk array.
     * @returns {boolean} True if Karatsuba should be used.
     */
    function karatsubaThresholdCheck(len1, len2) {
        // This magic formula is from the original library, kept for behavior consistency.
        return -0.012 * len1 - 0.012 * len2 + 15e-6 * len1 * len2 > 0;
    }

    LargeNum.prototype.multiply = function(otherValue) {
        const otherNum = parseInputToNum(otherValue);
        const currentChunks = this.chunkStorage;
        let otherChunks = otherNum.chunkStorage;
        const resultSign = this.isNegative !== otherNum.isNegative; // XOR for sign determination

        // Optimized path for multiplication by compact numbers
        if (otherNum.isCompact) {
            const scalar = otherNum.rawValue;
            if (scalar === 0) return NumInstanceFactory.ZERO_VAL;
            if (scalar === 1) return this;
            if (scalar === -1) return this.negate();

            const absScalar = Math.abs(scalar);
            if (absScalar < CHUNK_SIZE) {
                return new LargeNum(performChunkScalarMultiplication(currentChunks, absScalar), resultSign);
            }
            // If scalar is larger than a single chunk, convert it to chunks for full multiplication.
            otherChunks = convertSmallToChunkArray(absScalar);
        }

        // Choose multiplication algorithm based on array lengths.
        if (karatsubaThresholdCheck(currentChunks.length, otherChunks.length)) {
            return new LargeNum(karatsubaChunkMultiplication(currentChunks, otherChunks), resultSign);
        }
        return new LargeNum(performLongChunkMultiplication(currentChunks, otherChunks), resultSign);
    };
    LargeNum.prototype.times = LargeNum.prototype.multiply;

    /**
     * Helper to multiply a scalar by a chunk array and return a NumInstance.
     * @param {number} scalarAbs - Absolute scalar value.
     * @param {number[]} chunkArray - Chunk array operand.
     * @param {boolean} isNegativeProduct - True if final product should be negative.
     * @returns {LargeNum} The product as a LargeNum.
     */
    function scalarChunkMultiplicationHelper(scalarAbs, chunkArray, isNegativeProduct) {
        if (scalarAbs < CHUNK_SIZE) {
            return new LargeNum(performChunkScalarMultiplication(chunkArray, scalarAbs), isNegativeProduct);
        }
        // If scalar itself is large, convert it to chunks for full multiplication.
        return new LargeNum(performLongChunkMultiplication(chunkArray, convertSmallToChunkArray(scalarAbs)), isNegativeProduct);
    }

    // Internal multiplication method for CompactNum instances (used by LargeNum).
    CompactNum.prototype._multiplyByCompact = function(otherCompactNum) {
        const product = otherCompactNum.rawValue * this.rawValue;
        if (isWithinJsSafeRange(product)) {
            return new CompactNum(product);
        }
        // If overflow, convert to chunk-based multiplication.
        const absOtherRaw = Math.abs(otherCompactNum.rawValue);
        const absThisChunks = convertSmallToChunkArray(Math.abs(this.rawValue));
        return scalarChunkMultiplicationHelper(absOtherRaw, absThisChunks, this.isNegative !== otherCompactNum.isNegative);
    };

    // Internal multiplication method for LargeNum instances (used by CompactNum).
    LargeNum.prototype._multiplyByCompact = function(otherCompactNum) {
        const scalar = otherCompactNum.rawValue;
        if (scalar === 0) return NumInstanceFactory.ZERO_VAL;
        if (scalar === 1) return this;
        if (scalar === -1) return this.negate();
        return scalarChunkMultiplicationHelper(Math.abs(scalar), this.chunkStorage, this.isNegative !== otherCompactNum.isNegative);
    };

    CompactNum.prototype.multiply = function(otherValue) {
        // Delegate to the appropriate internal method based on the parsed value's type.
        return parseInputToNum(otherValue)._multiplyByCompact(this);
    };
    CompactNum.prototype.times = CompactNum.prototype.multiply; // Alias for multiply

    /**
     * Squares a chunk array.
     * @param {number[]} chunkArray - The array of chunks to square.
     * @returns {number[]} The squared value as a chunk array.
     */
    function squareChunkArray(chunkArray) {
        const len = chunkArray.length;
        const resultLen = 2 * len;
        const result = createZeroFilledArray(resultLen);

        let currentProduct, currentCarry;
        let digitI, digitJ;

        for (let i = 0; i < len; i++) {
            digitI = chunkArray[i];
            currentCarry = 0;
            // Calculate 2 * a_i * a_j + carry for j > i, and a_i * a_i + carry for j = i
            // The original code used `carry = 0 - a_i * a_i` and then `2 * (a_i * a_j) + r[i+j] + carry` which implicitly handles the a_i^2 term
            // Let's rewrite for clarity and directness.
            // Diagonal terms: a_i^2, Off-diagonal terms: 2 * a_i * a_j
            currentProduct = digitI * digitI + result[i + i] + currentCarry;
            currentCarry = Math.floor(currentProduct / CHUNK_SIZE);
            result[i + i] = currentProduct % CHUNK_SIZE;

            for (let j = i + 1; j < len; j++) {
                digitJ = chunkArray[j];
                currentProduct = 2 * (digitI * digitJ) + result[i + j] + currentCarry;
                currentCarry = Math.floor(currentProduct / CHUNK_SIZE);
                result[i + j] = currentProduct % CHUNK_SIZE;
            }
            result[i + len] += currentCarry; // Add final carry for this row
        }
        trimLeadingZeros(result);
        return result;
    }

    LargeNum.prototype.square = function() {
        return new LargeNum(squareChunkArray(this.chunkStorage), false); // Square is always non-negative
    };
    CompactNum.prototype.square = function() {
        const squaredValue = this.rawValue * this.rawValue;
        if (isWithinJsSafeRange(squaredValue)) {
            return new CompactNum(squaredValue);
        }
        // If squared value overflows, convert to LargeNum operation.
        return new LargeNum(squareChunkArray(convertSmallToChunkArray(Math.abs(this.rawValue))), false);
    };

    /**
     * Division with remainder using Knuth's Algorithm D (simplified).
     * Efficient for cases where divisor chunks are not extremely many.
     * @param {number[]} dividendChunks - The dividend.
     * @param {number[]} divisorChunks - The divisor.
     * @returns {[number[], number[]]} An array containing [quotientChunks, remainderChunks].
     */
    function knuthDivisionAlgorithm(dividendChunks, divisorChunks) {
        const lenDividend = dividendChunks.length;
        const lenDivisor = divisorChunks.length;
        const quotient = createZeroFilledArray(lenDividend); // Max possible length for quotient
        const base = CHUNK_SIZE;

        // Normalization step: scale dividend and divisor to make divisor's MSB large
        const divisorMostSignificantDigit = divisorChunks[lenDivisor - 1];
        const normalizationFactor = Math.ceil(base / (2 * divisorMostSignificantDigit)); // Scaling factor

        let scaledRemainder = performChunkScalarMultiplication(dividendChunks, normalizationFactor);
        let scaledDivisor = performChunkScalarMultiplication(divisorChunks, normalizationFactor);

        // Adjust lengths for alignment in division
        if (scaledRemainder.length <= lenDividend) scaledRemainder.push(0); // Ensure enough space for intermediate calculations
        scaledDivisor.push(0); // Pad divisor for easier calculations

        const normalizedDivisorMSB = scaledDivisor[lenDivisor - 1];

        let estimatedQuotientDigit, shiftPos, currentCarry, currentBorrow, i, k;

        // Iterate from most significant position down
        for (shiftPos = lenDividend - lenDivisor; shiftPos >= 0; shiftPos--) {
            // Estimate quotient digit
            estimatedQuotientDigit = base - 1;
            if (scaledRemainder[shiftPos + lenDivisor] !== normalizedDivisorMSB) {
                estimatedQuotientDigit = Math.floor((scaledRemainder[shiftPos + lenDivisor] * base + scaledRemainder[shiftPos + lenDivisor - 1]) / normalizedDivisorMSB);
            }

            // Perform trial subtraction: (estimatedQuotientDigit * scaledDivisor) from scaledRemainder
            currentCarry = 0;
            currentBorrow = 0;
            k = scaledDivisor.length;
            for (i = 0; i < k; i++) {
                currentCarry += estimatedQuotientDigit * scaledDivisor[i];
                const qPart = Math.floor(currentCarry / base);
                currentBorrow += scaledRemainder[shiftPos + i] - (currentCarry - qPart * base);
                currentCarry = qPart;
                if (currentBorrow < 0) {
                    scaledRemainder[shiftPos + i] = currentBorrow + base;
                    currentBorrow = -1;
                } else {
                    scaledRemainder[shiftPos + i] = currentBorrow;
                    currentBorrow = 0;
                }
            }

            // Adjust quotient digit if trial subtraction was too large (borrow occurred)
            while (currentBorrow !== 0) {
                estimatedQuotientDigit -= 1;
                currentCarry = 0;
                for (i = 0; i < k; i++) {
                    currentCarry += scaledRemainder[shiftPos + i] - base + scaledDivisor[i];
                    if (currentCarry < 0) {
                        scaledRemainder[shiftPos + i] = currentCarry + base;
                        currentCarry = 0;
                    } else {
                        scaledRemainder[shiftPos + i] = currentCarry;
                        currentCarry = 1;
                    }
                }
                currentBorrow += currentCarry;
            }
            quotient[shiftPos] = estimatedQuotientDigit;
        }

        // Denormalize the remainder
        const finalRemainder = scalarDivisionWithRemainder(scaledRemainder, normalizationFactor)[0];
        return [convertChunkArrayToSmall(quotient), convertChunkArrayToSmall(finalRemainder)];
    }

    /**
     * Optimized long division algorithm for very large numbers.
     * @param {number[]} dividendChunks - The dividend.
     * @param {number[]} divisorChunks - The divisor.
     * @returns {[number[], number[]]} An array containing [quotientChunks, remainderChunks].
     */
    function advancedLongDivision(dividendChunks, divisorChunks) {
        let lenDividend = dividendChunks.length;
        const lenDivisor = divisorChunks.length;
        const quotientResult = [];
        let partialDividend = []; // Accumulates parts of the dividend
        const base = CHUNK_SIZE;

        // Process dividend chunks from most significant to least significant
        while (lenDividend > 0) {
            partialDividend.unshift(dividendChunks[--lenDividend]); // Add next chunk
            trimLeadingZeros(partialDividend); // Ensure it's clean

            // If current partial dividend is smaller than divisor, quotient digit is 0.
            if (compareAbsoluteChunkArrays(partialDividend, divisorChunks) < 0) {
                quotientResult.push(0);
                continue;
            }

            // Estimate quotient digit using the most significant parts.
            const partialLen = partialDividend.length;
            let highPartDividend, highPartDivisor;

            highPartDividend = partialDividend[partialLen - 1] * base + (partialLen > 1 ? partialDividend[partialLen - 2] : 0);
            highPartDivisor = divisorChunks[lenDivisor - 1] * base + (lenDivisor > 1 ? divisorChunks[lenDivisor - 2] : 0);

            // Adjust dividend's high part if it's much longer than the divisor.
            if (partialLen > lenDivisor) {
                highPartDividend = (highPartDividend + 1) * base;
            }

            let estimatedDigit = Math.ceil(highPartDividend / highPartDivisor);

            // Refine estimated digit by trial multiplication and subtraction.
            let trialProduct;
            do {
                trialProduct = performChunkScalarMultiplication(divisorChunks, estimatedDigit);
                if (compareAbsoluteChunkArrays(trialProduct, partialDividend) <= 0) break;
                estimatedDigit--; // Decrement estimate if too large
            } while (estimatedDigit);

            quotientResult.push(estimatedDigit);
            partialDividend = performChunkSubtraction(partialDividend, trialProduct); // Update remainder
        }

        quotientResult.reverse(); // Reverse to get correct order
        return [convertChunkArrayToSmall(quotientResult), convertChunkArrayToSmall(partialDividend)];
    }

    /**
     * Divides a chunk array by a small integer scalar, returning quotient and remainder.
     * @param {number[]} chunkArray - The dividend chunks.
     * @param {number} scalarDivisor - The small integer divisor.
     * @returns {[number[], number]} An array containing [quotientChunks, remainder].
     */
    function scalarDivisionWithRemainder(chunkArray, scalarDivisor) {
        const len = chunkArray.length;
        const quotient = createZeroFilledArray(len);
        const base = CHUNK_SIZE;
        let remainder = 0;
        let currentDigitValue, q;

        // Perform division from most significant chunk to least significant
        for (let i = len - 1; i >= 0; --i) {
            currentDigitValue = remainder * base + chunkArray[i];
            q = truncateNumber(currentDigitValue / scalarDivisor);
            remainder = currentDigitValue - q * scalarDivisor;
            quotient[i] = q | 0; // Store integer part of quotient
        }
        return [quotient, remainder | 0];
    }

    /**
     * Handles division and modulo operations for any NumInstance types.
     * @param {LargeNum|CompactNum} dividend - The dividend object.
     * @param {*} divisorInput - The divisor (can be number, string, or NumInstance).
     * @returns {[LargeNum|CompactNum, LargeNum|CompactNum]} An array containing [quotient, remainder].
     */
    function flexibleDivisionAndModulo(dividend, divisorInput) {
        const divisor = parseInputToNum(divisorInput);
        const dividendChunks = dividend.chunkStorage; // Will be defined for both types after parseInputToNum
        const divisorChunks = divisor.chunkStorage;

        // Guard against division by zero
        if (divisor.isZero()) {
            throw new Error("Division by zero is not allowed.");
        }

        // Optimized paths for small numbers
        if (dividend.isCompact) {
            if (divisor.isCompact) {
                // Both are small, use native JS division
                const q = truncateNumber(dividend.rawValue / divisor.rawValue);
                const r = dividend.rawValue % divisor.rawValue;
                return [new CompactNum(q), new CompactNum(r)];
            }
            // Dividend is small, divisor is large => quotient is 0, remainder is dividend.
            return [NumInstanceFactory.ZERO_VAL, dividend];
        }

        if (divisor.isCompact) {
            const scalarDivisor = divisor.rawValue;
            if (scalarDivisor === 1) return [dividend, NumInstanceFactory.ZERO_VAL];
            if (scalarDivisor === -1) return [dividend.negate(), NumInstanceFactory.ZERO_VAL];

            const absScalarDivisor = Math.abs(scalarDivisor);
            if (absScalarDivisor < CHUNK_SIZE) {
                // Scalar division if divisor fits in a single chunk.
                const [quotientChunks, remainderValue] = scalarDivisionWithRemainder(dividendChunks, absScalarDivisor);
                const actualRemainder = dividend.isNegative ? -remainderValue : remainderValue;
                const convertedSmallQuotient = convertChunkArrayToSmall(quotientChunks);

                let finalQuotient;
                if (typeof convertedSmallQuotient === "number") {
                    finalQuotient = new CompactNum((dividend.isNegative !== divisor.isNegative) ? -convertedSmallQuotient : convertedSmallQuotient);
                } else {
                    finalQuotient = new LargeNum(quotientChunks, (dividend.isNegative !== divisor.isNegative));
                }
                return [finalQuotient, new CompactNum(actualRemainder)];
            }
            // If scalar divisor is larger than a chunk, but still CompactNum, fall through to general large division.
        }

        // General case for large number division
        const comparison = compareAbsoluteChunkArrays(dividendChunks, divisorChunks);
        if (comparison === -1) return [NumInstanceFactory.ZERO_VAL, dividend]; // Abs(dividend) < Abs(divisor)
        if (comparison === 0) { // Abs(dividend) == Abs(divisor)
            const quotientSign = (dividend.isNegative === divisor.isNegative);
            return [quotientSign ? NumInstanceFactory.ONE_VAL : NumInstanceFactory.MINUS_ONE_VAL, NumInstanceFactory.ZERO_VAL];
        }

        let divisionResult;
        // Heuristic to choose division algorithm based on total chunk lengths.
        if (dividendChunks.length + divisorChunks.length <= 200) { // Arbitrary threshold
            divisionResult = knuthDivisionAlgorithm(dividendChunks, divisorChunks);
        } else {
            divisionResult = advancedLongDivision(dividendChunks, divisorChunks);
        }

        const [rawQuotient, rawRemainder] = divisionResult;
        const quotientSign = dividend.isNegative !== divisor.isNegative;
        const remainderSign = dividend.isNegative;

        let finalQuotient;
        if (typeof rawQuotient === "number") {
            finalQuotient = new CompactNum(quotientSign ? -rawQuotient : rawQuotient);
        } else {
            finalQuotient = new LargeNum(rawQuotient, quotientSign);
        }

        let finalRemainder;
        if (typeof rawRemainder === "number") {
            finalRemainder = new CompactNum(remainderSign ? -rawRemainder : rawRemainder);
        } else {
            finalRemainder = new LargeNum(rawRemainder, remainderSign);
        }

        return [finalQuotient, finalRemainder];
    }

    LargeNum.prototype.divmod = function(otherValue) {
        const result = flexibleDivisionAndModulo(this, otherValue);
        return { quotient: result[0], remainder: result[1] };
    };
    CompactNum.prototype.divmod = LargeNum.prototype.divmod; // Share the implementation

    LargeNum.prototype.divide = function(otherValue) {
        return flexibleDivisionAndModulo(this, otherValue)[0];
    };
    CompactNum.prototype.over = CompactNum.prototype.divide = LargeNum.prototype.over = LargeNum.prototype.divide;

    LargeNum.prototype.modulo = function(otherValue) {
        return flexibleDivisionAndModulo(this, otherValue)[1];
    };
    CompactNum.prototype.remainder = CompactNum.prototype.modulo = LargeNum.prototype.remainder = LargeNum.prototype.modulo;

    LargeNum.prototype.pow = function(exponent) {
        const expNum = parseInputToNum(exponent);

        // Basic edge cases for exponentiation
        if (expNum.isZero()) return NumInstanceFactory.ONE_VAL; // X^0 = 1
        if (this.isZero()) return NumInstanceFactory.ZERO_VAL; // 0^X = 0 (for X > 0)
        if (this.toAbsolute().isUnit()) { // 1 or -1
            if (this.equals(NumInstanceFactory.ONE_VAL)) return NumInstanceFactory.ONE_VAL; // 1^X = 1
            if (this.equals(NumInstanceFactory.MINUS_ONE_VAL)) { // (-1)^X
                return expNum.isEven() ? NumInstanceFactory.ONE_VAL : NumInstanceFactory.MINUS_ONE_VAL;
            }
        }

        // Handle negative exponents. For integer arithmetic, X^(-Y) is 0 if |X| > 1.
        if (expNum.isNegative()) {
            // Only non-zero for base 1 or -1. Handled above.
            return NumInstanceFactory.ZERO_VAL;
        }

        // Exponent too large to handle (potentially infinite loop or memory issues)
        if (!expNum.isCompact) {
            throw new Error(`Exponent '${expNum.toString()}' is too large for current power implementation.`);
        }

        const expValue = expNum.rawValue; // Get native JS number for exponent

        // If base is small, try native Math.pow first (might overflow but fits JS_MAX_SAFE_INT_VAL)
        if (this.isCompact) {
            const potentialResult = Math.pow(this.rawValue, expValue);
            if (isWithinJsSafeRange(potentialResult)) {
                return new CompactNum(truncateNumber(potentialResult));
            }
        }

        // Use binary exponentiation (exponentiation by squaring)
        let currentBase = this;
        let resultAccumulator = NumInstanceFactory.ONE_VAL;

        let currentExp = expValue;
        while (currentExp > 0) {
            if (currentExp % 2 === 1) { // If exponent bit is 1 (odd)
                resultAccumulator = resultAccumulator.times(currentBase);
            }
            if (currentExp === 1) break; // Optimization: avoid squaring if only 1 left
            currentBase = currentBase.square();
            currentExp = Math.floor(currentExp / 2); // Shift exponent right by 1 bit
        }
        return resultAccumulator;
    };
    CompactNum.prototype.pow = LargeNum.prototype.pow; // Share implementation

    LargeNum.prototype.modPow = function(exponent, modulus) {
        const expNum = parseInputToNum(exponent);
        const modNum = parseInputToNum(modulus);

        // Input validations
        if (modNum.isZero()) {
            throw new Error("Modular exponentiation with modulus 0 is undefined.");
        }
        if (expNum.isNegative()) {
            // For negative exponents, modular inverse is needed.
            // This implementation of modPow does not directly support negative exponents.
            // If base is coprime to modulus, use `base.modInv(modulus).modPow(exp.negate(), modulus)`.
            // For simplicity, let's return 0 or throw an error for now.
            if (this.isZero() && modNum.toAbsolute().isGreaterThan(NumInstanceFactory.ONE_VAL)) {
                 throw new Error("Negative exponent with base 0 modulo non-unit modulus is undefined.");
            }
            if (this.toAbsolute().isGreaterThan(NumInstanceFactory.ONE_VAL)) {
                throw new Error("Negative exponents for modular exponentiation not supported for non-unit bases.");
            }
            // If base is 1 or -1, handle as regular power
            if (this.toAbsolute().isUnit()) {
                if (this.equals(NumInstanceFactory.ONE_VAL)) return NumInstanceFactory.ONE_VAL;
                if (this.equals(NumInstanceFactory.MINUS_ONE_VAL)) return expNum.isEven() ? NumInstanceFactory.ONE_VAL : NumInstanceFactory.MINUS_ONE_VAL;
            }
        }

        let result = NumInstanceFactory.ONE_VAL;
        let baseReduced = this.modulo(modNum); // Reduce base modulo modulus

        let currentExponent = expNum; // Use positive exponent for calculation

        // Binary exponentiation loop
        while (currentExponent.isPositive()) {
            if (baseReduced.isZero()) return NumInstanceFactory.ZERO_VAL; // Optimization if base becomes 0
            if (currentExponent.isOdd()) {
                result = result.multiply(baseReduced).modulo(modNum);
            }
            currentExponent = currentExponent.divide(2);
            baseReduced = baseReduced.square().modulo(modNum);
        }
        return result;
    };
    CompactNum.prototype.modPow = LargeNum.prototype.modPow; // Share implementation

    /**
     * Compares the absolute values of two chunk arrays.
     * @param {number[]} chunks1 - First chunk array.
     * @param {number[]} chunks2 - Second chunk array.
     * @returns {number} -1 if chunks1 < chunks2, 0 if equal, 1 if chunks1 > chunks2.
     */
    function compareAbsoluteChunkArrays(chunks1, chunks2) {
        // Compare lengths first
        if (chunks1.length !== chunks2.length) {
            return chunks1.length > chunks2.length ? 1 : -1;
        }
        // If lengths are equal, compare chunk by chunk from most significant.
        for (let i = chunks1.length - 1; i >= 0; i--) {
            if (chunks1[i] !== chunks2[i]) {
                return chunks1[i] > chunks2[i] ? 1 : -1;
            }
        }
        return 0; // Both arrays are identical
    }

    LargeNum.prototype.compareAbsolute = function(otherValue) {
        const otherNum = parseInputToNum(otherValue);
        // If other is small, and this is large, this is generally greater in magnitude (unless both are zero)
        if (otherNum.isCompact) {
            if (this.isZero() && otherNum.isZero()) return 0;
            return 1; // A LargeNum (non-zero) will always have a larger absolute value than a CompactNum (non-zero) if it's not converted to compact
        }
        return compareAbsoluteChunkArrays(this.chunkStorage, otherNum.chunkStorage);
    };
    CompactNum.prototype.compareAbsolute = function(otherValue) {
        const otherNum = parseInputToNum(otherValue);
        const thisAbsValue = Math.abs(this.rawValue);

        if (otherNum.isCompact) {
            const otherAbsValue = Math.abs(otherNum.rawValue);
            return thisAbsValue === otherAbsValue ? 0 : (thisAbsValue > otherAbsValue ? 1 : -1);
        }
        // If this is compact and other is large, other is generally greater in magnitude.
        return -1;
    };

    LargeNum.prototype.compare = function(otherValue) {
        // Handle special JS number values
        if (otherValue === Infinity) return -1;
        if (otherValue === -Infinity) return 1;

        const otherNum = parseInputToNum(otherValue);

        // Compare signs first
        if (this.isNegative !== otherNum.isNegative) {
            return this.isNegative ? -1 : 1; // Negative numbers are always less than positive numbers
        }

        // If signs are the same:
        // If other is compact, and this is a LargeNum, this is "more extreme".
        // E.g., positive LargeNum > positive CompactNum, negative LargeNum < negative CompactNum.
        if (otherNum.isCompact) {
            return this.isNegative ? -1 : 1;
        }

        // Both are LargeNums with the same sign. Compare absolute values.
        const absComparison = compareAbsoluteChunkArrays(this.chunkStorage, otherNum.chunkStorage);
        return this.isNegative ? -absComparison : absComparison; // Flip result if negative
    };
    LargeNum.prototype.compareTo = LargeNum.prototype.compare;

    CompactNum.prototype.compare = function(otherValue) {
        // Handle special JS number values
        if (otherValue === Infinity) return -1;
        if (otherValue === -Infinity) return 1;

        const otherNum = parseInputToNum(otherValue);
        const thisRaw = this.rawValue;

        // If other is compact, direct comparison
        if (otherNum.isCompact) {
            const otherRaw = otherNum.rawValue;
            return thisRaw === otherRaw ? 0 : (thisRaw > otherRaw ? 1 : -1);
        }

        // If this is compact and other is large.
        // Compare signs first.
        if (this.isNegative !== otherNum.isNegative) {
            return this.isNegative ? -1 : 1;
        }

        // Same sign. CompactNum is "less extreme" than a LargeNum.
        return this.isNegative ? 1 : -1; // If negative, (-small) > (-large). If positive, (small) < (large).
    };
    CompactNum.prototype.compareTo = CompactNum.prototype.compare;

    // Comparison aliases for convenience
    LargeNum.prototype.equals = function(otherValue) { return this.compare(otherValue) === 0; };
    CompactNum.prototype.eq = CompactNum.prototype.equals = LargeNum.prototype.eq = LargeNum.prototype.equals;

    LargeNum.prototype.notEquals = function(otherValue) { return this.compare(otherValue) !== 0; };
    CompactNum.prototype.neq = CompactNum.prototype.notEquals = LargeNum.prototype.neq = LargeNum.prototype.notEquals;

    LargeNum.prototype.isGreaterThan = function(otherValue) { return this.compare(otherValue) > 0; };
    CompactNum.prototype.gt = CompactNum.prototype.isGreaterThan = LargeNum.prototype.gt = LargeNum.prototype.isGreaterThan;

    LargeNum.prototype.isLessThan = function(otherValue) { return this.compare(otherValue) < 0; };
    CompactNum.prototype.lt = CompactNum.prototype.isLessThan = LargeNum.prototype.lt = LargeNum.prototype.isLessThan;

    LargeNum.prototype.isGreaterOrEqual = function(otherValue) { return this.compare(otherValue) >= 0; };
    CompactNum.prototype.geq = CompactNum.prototype.isGreaterOrEqual = LargeNum.prototype.geq = LargeNum.prototype.isGreaterOrEqual;

    LargeNum.prototype.isLessOrEqual = function(otherValue) { return this.compare(otherValue) <= 0; };
    CompactNum.prototype.leq = CompactNum.prototype.isLessOrEqual = LargeNum.prototype.leq = LargeNum.prototype.isLessOrEqual;

    // Type-specific boolean checks
    LargeNum.prototype.isEven = function() { return (this.chunkStorage[0] & 1) === 0; };
    CompactNum.prototype.isEven = function() { return (this.rawValue & 1) === 0; };

    LargeNum.prototype.isOdd = function() { return (this.chunkStorage[0] & 1) === 1; };
    CompactNum.prototype.isOdd = function() { return (this.rawValue & 1) === 1; };

    LargeNum.prototype.isPositive = function() { return !this.isNegative; };
    CompactNum.prototype.isPositive = function() { return this.rawValue > 0; };

    LargeNum.prototype.isNegative = function() { return this.isNegative; };
    CompactNum.prototype.isNegative = function() { return this.rawValue < 0; };

    LargeNum.prototype.isUnit = function() { return false; }; // A LargeNum instance is never 1 or -1 directly
    CompactNum.prototype.isUnit = function() { return Math.abs(this.rawValue) === 1; };

    LargeNum.prototype.isZero = function() {
        return this.chunkStorage.length === 1 && this.chunkStorage[0] === 0;
    };
    CompactNum.prototype.isZero = function() { return this.rawValue === 0; };

    LargeNum.prototype.isDivisibleBy = function(otherValue) {
        const otherNum = parseInputToNum(otherValue);
        if (otherNum.isZero()) return false; // Cannot divide by zero
        if (otherNum.toAbsolute().isUnit()) return true; // Divisible by 1 or -1
        if (otherNum.toAbsolute().equals(NumInstanceFactory.TWO_VAL)) return this.isEven(); // Optimization for 2

        // General case: check if remainder is zero
        return this.modulo(otherNum).isZero();
    };
    CompactNum.prototype.isDivisibleBy = LargeNum.prototype.isDivisibleBy; // Share implementation

    /**
     * Performs a quick check for primality using small prime factors.
     * @param {LargeNum|CompactNum} numberToCheck - The number to test.
     * @returns {boolean|undefined} True if prime, false if composite, undefined if further tests needed.
     */
    function quickPrimalityTest(numberToCheck) {
        const absNum = numberToCheck.toAbsolute();
        if (absNum.isUnit()) return false; // 1 is not prime
        if (absNum.equals(NumInstanceFactory.TWO_VAL) || absNum.equals(NumInstanceFactory.THREE_VAL) || absNum.equals(NumInstanceFactory.FIVE_VAL)) return true;
        if (absNum.isEven() || absNum.isDivisibleBy(NumInstanceFactory.THREE_VAL) || absNum.isDivisibleBy(NumInstanceFactory.FIVE_VAL)) return false;
        if (absNum.isLessThan(NumInstanceFactory(25))) return true; // Covers 7, 11, 13, 17, 19, 23
        return undefined; // Requires more robust primality test
    }

    LargeNum.prototype.isPrime = function() {
        const basicResult = quickPrimalityTest(this);
        if (basicResult !== undefined) return basicResult;

        const n = this.toAbsolute();
        const nMinusOne = n.prev();
        // Miller-Rabin primality test with fixed set of bases.
        // These bases provide deterministic results up to a certain range.
        const testBases = [2, 3, 5, 7, 11, 13, 17, 19]; // Sufficient for n < 3.3e14

        // Find d and s such that n - 1 = d * 2^s
        let d = nMinusOne;
        let s = 0;
        while (d.isEven()) {
            d = d.divide(2);
            s++;
        }

        for (let i = 0; i < testBases.length; i++) {
            const a = NumInstanceFactory(testBases[i]);
            // Skip bases larger than or equal to n
            if (a.isGreaterOrEqual(n)) continue;

            let x = a.modPow(d, n); // x = a^d mod n
            if (x.equals(NumInstanceFactory.ONE_VAL) || x.equals(nMinusOne)) {
                continue; // Witness test passed for this base
            }

            let witnessFound = true;
            for (let r = 0; r < s; r++) {
                x = x.square().modulo(n); // x = x^2 mod n
                if (x.equals(nMinusOne)) {
                    witnessFound = false;
                    break;
                }
            }
            if (witnessFound) return false; // Composite
        }
        return true; // Probably prime
    };
    CompactNum.prototype.isPrime = LargeNum.prototype.isPrime; // Share implementation

    LargeNum.prototype.isProbablePrime = function(iterations) {
        const basicResult = quickPrimalityTest(this);
        if (basicResult !== undefined) return basicResult;

        const n = this.toAbsolute();
        const numIterations = iterations === undefined ? 5 : iterations; // Default 5 iterations

        const nMinusOne = n.prev();
        let d = nMinusOne;
        let s = 0;
        while (d.isEven()) {
            d = d.divide(2);
            s++;
        }

        // Miller-Rabin test with random bases
        for (let i = 0; i < numIterations; i++) {
            // Generate random base 'a' such that 2 <= a <= n-2
            const a = NumInstanceFactory.generateRandomBetween(NumInstanceFactory.TWO_VAL, nMinusOne);
            let x = a.modPow(d, n);

            if (x.equals(NumInstanceFactory.ONE_VAL) || x.equals(nMinusOne)) {
                continue;
            }

            let witnessFound = true;
            for (let r = 0; r < s; r++) {
                x = x.square().modulo(n);
                if (x.equals(nMinusOne)) {
                    witnessFound = false;
                    break;
                }
            }
            if (witnessFound) return false; // Composite
        }
        return true; // Probable prime
    };
    CompactNum.prototype.isProbablePrime = LargeNum.prototype.isProbablePrime; // Share implementation

    LargeNum.prototype.modInv = function(modulus) {
        let t = NumInstanceFactory.ZERO_VAL;
        let newT = NumInstanceFactory.ONE_VAL;
        let r = parseInputToNum(modulus); // Current modulus
        let newR = this.toAbsolute(); // Current number (absolute)

        let quotient, lastT, lastR;

        // Extended Euclidean algorithm to find gcd(a, m) and coefficients
        // (t * a) + (r * m) = gcd(a, m)
        while (!newR.isZero()) {
            quotient = r.divide(newR);
            lastT = t;
            lastR = r;

            t = newT;
            r = newR;

            newT = lastT.subtract(quotient.multiply(newT));
            newR = lastR.subtract(quotient.multiply(newR));
        }

        // Check if gcd(this, modulus) is 1. If not, modular inverse does not exist.
        if (!r.isUnit()) {
            throw new Error(`Numbers ${this.toString()} and ${modulus.toString()} are not coprime, modular inverse does not exist.`);
        }

        // Adjust result to be positive and within [0, modulus-1]
        let inverseResult = t;
        if (inverseResult.isNegative()) {
            inverseResult = inverseResult.add(modulus);
        }

        // If the original number was negative, adjust the modular inverse accordingly.
        if (this.isNegative()) {
            inverseResult = modulus.subtract(inverseResult);
        }

        return inverseResult.modulo(modulus); // Ensure final result is within the modulus range.
    };
    CompactNum.prototype.modInv = LargeNum.prototype.modInv; // Share implementation

    LargeNum.prototype.next = function() {
        // If negative, incrementing is like decrementing its absolute value.
        // e.g., -5.next() = -4, which is -(abs(-5)-1).
        if (this.isNegative) {
            return subtractScalarFromChunkArray(this.chunkStorage, 1, this.isNegative);
        }
        return new LargeNum(addScalarToChunkArray(this.chunkStorage, 1), this.isNegative);
    };
    CompactNum.prototype.next = function() {
        const nextValue = this.rawValue + 1;
        if (isWithinJsSafeRange(nextValue)) {
            return new CompactNum(nextValue);
        }
        // If it overflows JS safe integer, convert to LargeNum.
        return new LargeNum(JS_MAX_SAFE_INT_CHUNKS, false); // Example: MAX_INT_VAL.next()
    };

    LargeNum.prototype.prev = function() {
        // If negative, decrementing is like incrementing its absolute value.
        // e.g., -5.prev() = -6, which is -(abs(-5)+1).
        if (this.isNegative) {
            return new LargeNum(addScalarToChunkArray(this.chunkStorage, 1), true);
        }
        return subtractScalarFromChunkArray(this.chunkStorage, 1, this.isNegative);
    };
    CompactNum.prototype.prev = function() {
        const prevValue = this.rawValue - 1;
        if (isWithinJsSafeRange(prevValue)) {
            return new CompactNum(prevValue);
        }
        // If it underflows JS safe integer, convert to LargeNum.
        return new LargeNum(JS_MAX_SAFE_INT_CHUNKS, true); // Example: -MAX_INT_VAL.prev()
    };

    // Pre-calculated powers of 2 for efficient bitwise shifting
    const binaryMultipliers = [1];
    while (2 * binaryMultipliers[binaryMultipliers.length - 1] <= CHUNK_SIZE) {
        binaryMultipliers.push(2 * binaryMultipliers[binaryMultipliers.length - 1]);
    }
    const binaryMultiplierCount = binaryMultipliers.length;
    const largestBinaryMultiplier = binaryMultipliers[binaryMultiplierCount - 1];

    /**
     * Checks if the shift amount is small enough to be handled directly or with simple scalar ops.
     * @param {*} shiftAmount - The shift amount.
     * @returns {boolean} True if small, false otherwise.
     */
    function isShiftAmountSmallEnough(shiftAmount) {
        // Check if it's a number/string that can be parsed as a small integer,
        // or a NumInstance that is compact or has only one chunk.
        return (typeof shiftAmount === "number" || typeof shiftAmount === "string") &&
               +Math.abs(shiftAmount) <= CHUNK_SIZE ||
               (shiftAmount instanceof LargeNum || shiftAmount instanceof CompactNum) &&
               (shiftAmount.isCompact || shiftAmount.chunkStorage.length <= 1);
    }

    LargeNum.prototype.shiftLeft = function(shiftValue) {
        if (!isShiftAmountSmallEnough(shiftValue)) {
            throw new Error(`Shift amount '${String(shiftValue)}' is too large for efficient shifting.`);
        }
        let shiftMagnitude = +shiftValue; // Coerce to number

        if (shiftMagnitude < 0) return this.shiftRight(-shiftMagnitude); // Negative shift left is shift right

        let currentResult = this;
        if (currentResult.isZero()) return currentResult;

        // Apply shifts in blocks corresponding to largestBinaryMultiplier
        while (shiftMagnitude >= binaryMultiplierCount) {
            currentResult = currentResult.multiply(largestBinaryMultiplier);
            shiftMagnitude -= (binaryMultiplierCount - 1); // Adjusted from original to prevent over-shifting
        }
        return currentResult.multiply(binaryMultipliers[shiftMagnitude]);
    };
    CompactNum.prototype.shiftLeft = LargeNum.prototype.shiftLeft;

    LargeNum.prototype.shiftRight = function(shiftValue) {
        if (!isShiftAmountSmallEnough(shiftValue)) {
            throw new Error(`Shift amount '${String(shiftValue)}' is too large for efficient shifting.`);
        }
        let shiftMagnitude = +shiftValue; // Coerce to number

        if (shiftMagnitude < 0) return this.shiftLeft(-shiftMagnitude); // Negative shift right is shift left

        let currentResult = this;
        if (currentResult.isZero()) return currentResult;
        // Special case for negative numbers: -1 shifted right any amount remains -1.
        if (currentResult.isNegative() && currentResult.isUnit()) return NumInstanceFactory.MINUS_ONE_VAL;

        let divisionRemainder;
        // Apply shifts in blocks
        while (shiftMagnitude >= binaryMultiplierCount) {
            const divMod = flexibleDivisionAndModulo(currentResult, largestBinaryMultiplier);
            currentResult = divMod[0]; // Quotient
            divisionRemainder = divMod[1]; // Remainder
            // If remainder is negative, adjust quotient to floor towards negative infinity.
            if (divisionRemainder.isNegative() && !divisionRemainder.isZero()) {
                currentResult = currentResult.prev();
            }
            if (currentResult.isZero() && divisionRemainder.isNegative()) { // If result becomes 0 but remainder was negative, it should be -1
                currentResult = NumInstanceFactory.MINUS_ONE_VAL;
            }
            shiftMagnitude -= (binaryMultiplierCount - 1); // Adjusted from original
        }
        const finalDivMod = flexibleDivisionAndModulo(currentResult, binaryMultipliers[shiftMagnitude]);
        currentResult = finalDivMod[0];
        divisionRemainder = finalDivMod[1];
        if (divisionRemainder.isNegative() && !divisionRemainder.isZero()) {
            currentResult = currentResult.prev();
        }
        return currentResult;
    };
    CompactNum.prototype.shiftRight = LargeNum.prototype.shiftRight;

    /**
     * Applies a bitwise operation (AND, OR, XOR) to two numbers.
     * This function simulates two's complement behavior for negative numbers by operating on chunks.
     * @param {LargeNum|CompactNum} num1 - First operand.
     * @param {*} num2Input - Second operand.
     * @param {function(number, number): number} bitwiseOperation - The bitwise function (e.g., `(a, b) => a & b`).
     * @returns {LargeNum|CompactNum} The result of the bitwise operation.
     */
    function applyChunkBitwiseOperation(num1, num2Input, bitwiseOperation) {
        const num2 = parseInputToNum(num2Input);

        const isNegative1 = num1.isNegative();
        const isNegative2 = num2.isNegative();

        // For negative numbers, we use the two's complement representation.
        // Bitwise NOT(X) is equivalent to -(X+1).
        // So, for calculations, we operate on NOT(abs(X)-1) or similar.
        const workingNum1 = isNegative1 ? num1.not() : num1;
        const workingNum2 = isNegative2 ? num2.not() : num2;

        let currentDigit1 = 0, currentDigit2 = 0;
        let divMod1 = null, divMod2 = null;
        const resultChunksArray = [];

        // Process chunks from LSB to MSB
        while (!workingNum1.isZero() || !workingNum2.isZero()) {
            divMod1 = flexibleDivisionAndModulo(workingNum1, largestBinaryMultiplier);
            currentDigit1 = divMod1[1].toJSNumber(); // Remainder is the current "chunk" of bits
            if (isNegative1) {
                currentDigit1 = largestBinaryMultiplier - 1 - currentDigit1; // Simulate bitwise NOT for negative numbers
            }

            divMod2 = flexibleDivisionAndModulo(workingNum2, largestBinaryMultiplier);
            currentDigit2 = divMod2[1].toJSNumber();
            if (isNegative2) {
                currentDigit2 = largestBinaryMultiplier - 1 - currentDigit2;
            }

            workingNum1 = divMod1[0]; // Quotient is the remaining part
            workingNum2 = divMod2[0];

            resultChunksArray.push(bitwiseOperation(currentDigit1, currentDigit2));
        }

        // Determine the sign of the final result. This heuristic comes from the original library
        // and is based on the result of applying the bitwise operation to the conceptual sign bits.
        const effectiveSignBitResult = bitwiseOperation(isNegative1 ? 1 : 0, isNegative2 ? 1 : 0);
        let finalAccumulator = (effectiveSignBitResult !== 0) ? NumInstanceFactory.MINUS_ONE_VAL : NumInstanceFactory.ZERO_VAL;

        // Reconstruct the number from the result chunks.
        for (let i = resultChunksArray.length - 1; i >= 0; i--) {
            finalAccumulator = finalAccumulator.multiply(largestBinaryMultiplier).add(NumInstanceFactory(resultChunksArray[i]));
        }
        return finalAccumulator;
    }

    LargeNum.prototype.not = function() {
        return this.negate().prev(); // Bitwise NOT(X) = -(X+1)
    };
    CompactNum.prototype.not = LargeNum.prototype.not;

    LargeNum.prototype.and = function(otherValue) {
        return applyChunkBitwiseOperation(this, otherValue, (a, b) => a & b);
    };
    CompactNum.prototype.and = LargeNum.prototype.and;

    LargeNum.prototype.or = function(otherValue) {
        return applyChunkBitwiseOperation(this, otherValue, (a, b) => a | b);
    };
    CompactNum.prototype.or = LargeNum.prototype.or;

    LargeNum.prototype.xor = function(otherValue) {
        return applyChunkBitwiseOperation(this, otherValue, (a, b) => a ^ b);
    };
    CompactNum.prototype.xor = LargeNum.prototype.xor;

    const LOB_MASK_JS_INT = 1 << 30; // Lowest order bit mask for JS integers (up to 2^30)
    // LOB mask for big integers, combining chunk logic with JS int mask.
    const LOB_MASK_BIG_INT = (CHUNK_SIZE & -CHUNK_SIZE) * (CHUNK_SIZE & -CHUNK_SIZE) | LOB_MASK_JS_INT;

    /**
     * Calculates a rough Lowest Order Bit (LOB) value for optimization purposes.
     * This is a heuristic and might not be perfectly accurate for very large numbers.
     * @param {LargeNum|CompactNum} num - The number instance.
     * @returns {number} A rough LOB value.
     */
    function getRoughLowestBit(num) {
        if (num.isCompact) {
            return num.rawValue | LOB_MASK_JS_INT;
        }
        // For LargeNum, use the first chunk and potentially the second.
        // `x & -x` gives the lowest set bit.
        const firstChunk = num.chunkStorage[0];
        // The original code used `num.chunkStorage[0] + num.chunkStorage[1] * CHUNK_SIZE | LOB_MASK_BIG_INT`
        // which implies it's trying to get a rough LOB across two chunks.
        return firstChunk + (num.chunkStorage[1] ? num.chunkStorage[1] * CHUNK_SIZE : 0) | LOB_MASK_BIG_INT;
    }

    /**
     * Calculates the integer logarithm of a value to a given base.
     * Used, for example, to determine bit length (log base 2).
     * @param {LargeNum|CompactNum} value - The number whose logarithm is calculated.
     * @param {LargeNum|CompactNum} base - The base of the logarithm.
     * @returns {{powerResult: LargeNum|CompactNum, exponent: number}} Object containing the highest power of base <= value, and its exponent.
     */
    function calculateIntegerLog(value, base) {
        if (base.compare(value) <= 0) {
            // Recursive doubling: log_b(N) = 2 * log_b^2(N)
            const tempResult = calculateIntegerLog(value, base.square());
            const powerResult = tempResult.powerResult;
            const exponent = tempResult.exponent;
            const testProduct = powerResult.multiply(base); // Check if (powerResult * base) is still <= value
            return testProduct.compare(value) <= 0 ? { powerResult: testProduct, exponent: exponent * 2 + 1 } : { powerResult: powerResult, exponent: exponent * 2 };
        }
        return { powerResult: NumInstanceFactory.ONE_VAL, exponent: 0 };
    }

    LargeNum.prototype.bitLength = function() {
        let n = this;
        if (n.isNegative()) {
            n = n.negate().subtract(NumInstanceFactory.ONE_VAL); // For negative numbers, bit length is for -(n+1)
        }
        if (n.isZero()) {
            return NumInstanceFactory.ZERO_VAL;
        }
        // Calculate log base 2 and add 1 (for 0-based indexing of bits)
        return NumInstanceFactory(calculateIntegerLog(n, NumInstanceFactory.TWO_VAL).exponent).add(NumInstanceFactory.ONE_VAL);
    };
    CompactNum.prototype.bitLength = LargeNum.prototype.bitLength; // Share implementation

    /**
     * Returns the maximum of two numbers.
     * @param {*} val1 - First number.
     * @param {*} val2 - Second number.
     * @returns {LargeNum|CompactNum} The greater number.
     */
    function getMax(val1, val2) {
        const num1 = parseInputToNum(val1);
        const num2 = parseInputToNum(val2);
        return num1.isGreaterThan(num2) ? num1 : num2;
    }

    /**
     * Returns the minimum of two numbers.
     * @param {*} val1 - First number.
     * @param {*} val2 - Second number.
     * @returns {LargeNum|CompactNum} The smaller number.
     */
    function getMin(val1, val2) {
        const num1 = parseInputToNum(val1);
        const num2 = parseInputToNum(val2);
        return num1.isLessThan(num2) ? num1 : num2;
    }

    /**
     * Calculates the Greatest Common Divisor (GCD) of two numbers using the binary GCD algorithm.
     * @param {*} val1 - First number.
     * @param {*} val2 - Second number.
     * @returns {LargeNum|CompactNum} The GCD.
     */
    function calculateGcd(val1, val2) {
        let numA = parseInputToNum(val1).toAbsolute();
        let numB = parseInputToNum(val2).toAbsolute();

        // Edge cases
        if (numA.equals(numB)) return numA;
        if (numA.isZero()) return numB;
        if (numB.isZero()) return numA;

        let commonPowerOfTwo = NumInstanceFactory.ONE_VAL;
        let temp;

        // Extract common factors of 2
        while (numA.isEven() && numB.isEven()) {
            const lowestBitA = getRoughLowestBit(numA);
            const lowestBitB = getRoughLowestBit(numB);
            const smallestPowerOfTwo = NumInstanceFactory(Math.min(lowestBitA, lowestBitB));
            numA = numA.divide(smallestPowerOfTwo);
            numB = numB.divide(smallestPowerOfTwo);
            commonPowerOfTwo = commonPowerOfTwo.multiply(smallestPowerOfTwo);
        }

        // Remove any remaining factors of 2 from A
        while (numA.isEven()) {
            numA = numA.divide(NumInstanceFactory(getRoughLowestBit(numA)));
        }

        // Binary Euclidean algorithm
        do {
            // Remove factors of 2 from B
            while (numB.isEven()) {
                numB = numB.divide(NumInstanceFactory(getRoughLowestBit(numB)));
            }
            // Ensure A <= B
            if (numA.isGreaterThan(numB)) {
                temp = numB;
                numB = numA;
                numA = temp;
            }
            numB = numB.subtract(numA);
        } while (!numB.isZero());

        return commonPowerOfTwo.isUnit() ? numA : numA.multiply(commonPowerOfTwo);
    }

    /**
     * Calculates the Least Common Multiple (LCM) of two numbers.
     * LCM(a, b) = |a * b| / GCD(a, b)
     * @param {*} val1 - First number.
     * @param {*} val2 - Second number.
     * @returns {LargeNum|CompactNum} The LCM.
     */
    function calculateLcm(val1, val2) {
        const numA = parseInputToNum(val1).toAbsolute();
        const numB = parseInputToNum(val2).toAbsolute();
        if (numA.isZero() || numB.isZero()) return NumInstanceFactory.ZERO_VAL; // LCM with zero is zero
        return numA.divide(calculateGcd(numA, numB)).multiply(numB);
    }

    /**
     * Generates a random number between two given numbers (inclusive).
     * @param {*} lowerBound - The lower bound.
     * @param {*} upperBound - The upper bound.
     * @returns {LargeNum|CompactNum} A random number within the specified range.
     */
    function generateRandomBetween(lowerBound, upperBound) {
        let low = getMin(lowerBound, upperBound);
        let high = getMax(lowerBound, upperBound);
        const effectiveRange = high.subtract(low).add(NumInstanceFactory.ONE_VAL);

        // If the range itself is small enough, use native Math.random.
        if (effectiveRange.isCompact) {
            return low.add(Math.floor(Math.random() * effectiveRange.rawValue));
        }

        // For large ranges, generate random chunks.
        const randomChunks = [];
        const rangeLen = effectiveRange.chunkStorage.length;
        let restrictedByRange = true; // Flag to ensure the generated number doesn't exceed the range.

        for (let i = rangeLen - 1; i >= 0; i--) {
            const maxDigit = restrictedByRange ? effectiveRange.chunkStorage[i] : CHUNK_SIZE;
            const digit = truncateNumber(Math.random() * (maxDigit + 1)); // Generate digit up to maxDigit (inclusive)
            randomChunks.unshift(digit);
            if (digit < maxDigit) restrictedByRange = false; // Once a digit is smaller, we're no longer restricted by the range's upper bound.
        }
        trimLeadingZeros(randomChunks);
        const randomValue = convertChunkArrayToSmall(randomChunks);

        return low.add(typeof randomValue === "number" ? new CompactNum(randomValue) : new LargeNum(randomValue, false));
    }

    /**
     * Parses a string representation of a number in a given base (radix).
     * @param {string} numString - The string to parse.
     * @param {number|NumInstance} base - The base (radix) of the number.
     * @returns {LargeNum|CompactNum} The parsed number.
     * @throws {Error} If the string contains invalid digits for the base.
     */
    const parseStringInBase = function(numString, base) {
        const stringLength = numString.length;
        const absBase = Math.abs(base); // Use absolute base for digit validation

        // Pre-validation of digits for the given base
        for (let i = 0; i < stringLength; i++) {
            const char = numString[i].toLowerCase();
            if (char === "-") continue;

            if (/[a-z0-9]/.test(char)) {
                let digitValue;
                if (/[0-9]/.test(char)) {
                    digitValue = parseInt(char, 10);
                } else {
                    digitValue = char.charCodeAt(0) - 87; // 'a' is 10, 'b' is 11, etc.
                }

                if (digitValue >= absBase) {
                    if (char === "1" && absBase === 1) continue; // Special handling for base 1 (unary)
                    throw new Error(`Character '${char}' is not a valid digit in base ${base}.`);
                }
            } else if (char === "<") { // Handle custom digit format, e.g., <10>
                 let endIdx = numString.indexOf(">", i);
                 if (endIdx === -1) throw new Error(`Invalid custom digit format in '${numString}'. Missing '>'.`);
                 const customDigit = parseInt(numString.slice(i + 1, endIdx), 10);
                 if (isNaN(customDigit) || customDigit >= absBase) {
                     throw new Error(`Custom digit '<${customDigit}>' is not valid in base ${base}.`);
                 }
                 i = endIdx; // Advance past the custom digit
                 continue;
            } else {
                throw new Error(`Character '${char}' is not a valid digit in base ${base}.`);
            }
        }

        // Optimization for small bases (2-36) and numbers likely to fit JS_MAX_SAFE_INT_VAL
        if (base >= 2 && base <= 36) {
            // Heuristic check: if string length * log(base) is roughly within log(MAX_SAFE_INT)
            if (stringLength * Math.log(base) <= LOG_JS_MAX_SAFE_INT + 1) {
                const nativeParsed = parseInt(numString, base);
                if (!isNaN(nativeParsed)) {
                    return new CompactNum(nativeParsed);
                }
            }
        }

        // Fallback to chunk-based parsing for larger numbers or custom bases
        const baseNum = parseInputToNum(base);
        const digitInstances = [];
        const isNegative = numString[0] === "-";

        for (let i = isNegative ? 1 : 0; i < numString.length; i++) {
            const char = numString[i].toLowerCase();
            let digitVal;
            if (char === "<") {
                const start = i;
                do { i++; } while (numString[i] !== ">");
                digitVal = numString.slice(start + 1, i); // Extract value from <...>
            } else if (char.charCodeAt(0) >= 48 && char.charCodeAt(0) <= 57) { // '0'-'9'
                digitVal = char;
            } else if (char.charCodeAt(0) >= 97 && char.charCodeAt(0) <= 122) { // 'a'-'z'
                digitVal = char.charCodeAt(0) - 87; // Convert 'a' to 10, 'b' to 11, etc.
            } else {
                throw new Error(`Invalid character '${char}' encountered during custom base parsing.`);
            }
            digitInstances.push(parseInputToNum(digitVal));
        }
        return buildFromDigitArray(digitInstances, baseNum, isNegative);
    };

    /**
     * Constructs a number from an array of digit NumInstance objects and a specified base.
     * Uses Horner's method for efficient calculation.
     * @param {NumInstance[]} digitNumInstances - Array of digit values as NumInstance objects.
     * @param {NumInstance} baseNum - The base of the number.
     * @param {boolean} isNegative - True if the final number should be negative.
     * @returns {LargeNum|CompactNum} The constructed number.
     */
    function buildFromDigitArray(digitNumInstances, baseNum, isNegative) {
        let finalValue = NumInstanceFactory.ZERO_VAL;
        let currentPower = NumInstanceFactory.ONE_VAL; // Represents base^0, base^1, etc.

        // Iterate from least significant digit to most significant
        for (let i = digitNumInstances.length - 1; i >= 0; i--) {
            finalValue = finalValue.add(digitNumInstances[i].times(currentPower));
            currentPower = currentPower.times(baseNum);
        }
        return isNegative ? finalValue.negate() : finalValue;
    }

    /**
     * Converts a numeric digit into its string representation for custom bases.
     * @param {number} digitValue - The digit to convert.
     * @returns {string} The string representation.
     */
    function formatDigitToString(digitValue) {
        if (digitValue >= 0 && digitValue <= 35) {
            return "0123456789abcdefghijklmnopqrstuvwxyz".charAt(digitValue);
        }
        return `<${digitValue}>`; // For digits > 35, use custom format
    }

    /**
     * Converts a NumInstance into an array of digits in a specified base.
     * @param {LargeNum|CompactNum} numInstance - The number to convert.
     * @param {*} baseInput - The target base.
     * @returns {{digits: number[], isNegative: boolean}} Object with digit array and sign.
     * @throws {Error} For invalid base inputs.
     */
    function convertToDigitsInBase(numInstance, baseInput) {
        const base = NumInstanceFactory(baseInput);

        // Handle edge cases for base
        if (base.isZero()) {
            if (numInstance.isZero()) return { digits: [0], isNegative: false };
            throw new Error("Cannot convert non-zero numbers to base 0.");
        }
        if (base.equals(NumInstanceFactory.MINUS_ONE_VAL)) {
            // Special handling for negabase (-1). This is a simplified version.
            if (numInstance.isZero()) return { digits: [0], isNegative: false };
            const resultDigits = [];
            let current = numInstance;
            let rem;
            while (!current.isZero()) {
                rem = current.modulo(NumInstanceFactory.TWO_VAL);
                current = current.divide(NumInstanceFactory.TWO_VAL).negate();
                if (rem.isNegative()) {
                    rem = rem.add(NumInstanceFactory.TWO_VAL);
                    current = current.next();
                }
                resultDigits.push(rem.toJSNumber());
            }
            return { digits: resultDigits.reverse(), isNegative: false };
        }

        let isResultNegative = false;
        let currentNum = numInstance;

        // Adjust sign for positive bases and negative numbers.
        if (currentNum.isNegative() && base.isPositive()) {
            isResultNegative = true;
            currentNum = currentNum.toAbsolute();
        }

        if (base.equals(NumInstanceFactory.ONE_VAL)) {
            if (currentNum.isZero()) return { digits: [0], isNegative: false };
            // Base 1 (unary): repeat '1' N times.
            const unaryDigits = [];
            for (let i = 0; i < currentNum.toJSNumber(); i++) {
                unaryDigits.push(1);
            }
            return { digits: unaryDigits, isNegative: isResultNegative };
        }

        const collectedDigits = [];
        let divModResult;
        // Repeatedly divide by base and collect remainders.
        while (currentNum.isNegative() || currentNum.compareAbsolute(base) >= 0) {
            divModResult = currentNum.divmod(base);
            currentNum = divModResult.quotient;
            let digit = divModResult.remainder;

            // Adjust negative remainders for non-standard bases (e.g., negative base)
            if (digit.isNegative()) {
                digit = base.minus(digit).toAbsolute();
                currentNum = currentNum.next();
            }
            collectedDigits.push(digit.toJSNumber());
        }
        collectedDigits.push(currentNum.toJSNumber()); // Add the last quotient

        return { digits: collectedDigits.reverse(), isNegative: isResultNegative };
    }

    /**
     * Converts a NumInstance to its string representation in a specified base.
     * @param {LargeNum|CompactNum} numInstance - The number to convert.
     * @param {*} baseInput - The target base.
     * @returns {string} The string representation.
     */
    function formatToBaseString(numInstance, baseInput) {
        const { digits: digitArray, isNegative: isResultNegative } = convertToDigitsInBase(numInstance, baseInput);
        const signPrefix = isResultNegative ? "-" : "";
        return signPrefix + digitArray.map(formatDigitToString).join("");
    }

    LargeNum.prototype.toBaseDigits = function(radix) { return convertToDigitsInBase(this, radix); };
    CompactNum.prototype.toBaseDigits = function(radix) { return convertToDigitsInBase(this, radix); };

    LargeNum.prototype.toString = function(radix) {
        if (radix === undefined) radix = 10;
        if (radix !== 10) return formatToBaseString(this, radix);

        const chunkArray = this.chunkStorage;
        let len = chunkArray.length;
        if (len === 0 || (len === 1 && chunkArray[0] === 0)) return "0"; // Handle zero

        // Convert chunks to string, padding with leading zeros for each chunk except the most significant.
        let resultString = String(chunkArray[--len]); // Start with MSB chunk
        const zeroPad = "0000000"; // CHUNK_DIGITS zeros
        let currentChunk;

        while (--len >= 0) {
            currentChunk = String(chunkArray[len]);
            // Pad with leading zeros to ensure CHUNK_DIGITS length for each chunk.
            resultString += zeroPad.slice(currentChunk.length) + currentChunk;
        }
        const signPrefix = this.isNegative ? "-" : "";
        return signPrefix + resultString;
    };
    CompactNum.prototype.toString = function(radix) {
        if (radix === undefined) radix = 10;
        if (radix !== 10) return formatToBaseString(this, radix);
        return String(this.rawValue);
    };

    LargeNum.prototype.toJSON = CompactNum.prototype.toJSON = function() {
        return this.toString(); // JSON representation is string form.
    };

    LargeNum.prototype.valueOf = function() {
        // Attempt to convert to standard JS number, might lose precision for very large numbers.
        return parseInt(this.toString(), 10);
    };
    LargeNum.prototype.toJSNumber = LargeNum.prototype.valueOf;

    CompactNum.prototype.valueOf = function() {
        return this.rawValue; // Return raw JS number value.
    };
    CompactNum.prototype.toJSNumber = CompactNum.prototype.valueOf;

    /**
     * Parses a string input into a NumInstance. Handles scientific notation, decimals, and large number string parsing.
     * @param {string} inputString - The string to parse.
     * @returns {LargeNum|CompactNum} The parsed number.
     * @throws {Error} If the string is not a valid integer representation.
     */
    function parseNumericString(inputString) {
        // Quick check for small precise numbers that fit JS safe range.
        const num = +inputString;
        if (isWithinJsSafeRange(num)) {
            if (num === truncateNumber(num)) return new CompactNum(num);
            throw new Error(`Invalid integer: '${inputString}' contains a fractional part.`);
        }

        let isNegative = inputString[0] === "-";
        if (isNegative) inputString = inputString.slice(1);

        // Handle scientific notation (e.g., "1.23e+5")
        const scientificParts = inputString.split(/e/i);
        if (scientificParts.length > 2) {
            throw new Error(`Invalid integer: '${inputString}' has multiple 'e' characters.`);
        }
        if (scientificParts.length === 2) {
            let exponentString = scientificParts[1];
            if (exponentString[0] === "+") exponentString = exponentString.slice(1);
            const exponent = +exponentString;

            if (exponent !== truncateNumber(exponent) || !isWithinJsSafeRange(exponent)) {
                throw new Error(`Invalid integer: exponent '${exponent}' is not a valid integer.`);
            }

            let basePart = scientificParts[0];
            const decimalPointIdx = basePart.indexOf(".");
            if (decimalPointIdx >= 0) {
                // Adjust exponent to account for decimal places.
                exponent -= (basePart.length - decimalPointIdx - 1);
                basePart = basePart.slice(0, decimalPointIdx) + basePart.slice(decimalPointIdx + 1);
            }

            if (exponent < 0) {
                throw new Error("Cannot represent negative exponent part for integers (results in a fraction).");
            }
            // Pad with zeros for positive exponent.
            inputString = basePart + "0".repeat(exponent);
        }

        // Final validation for digit characters.
        if (!/^([0-9][0-9]*)$/.test(inputString)) {
            throw new Error(`Invalid integer: '${inputString}' contains non-digit characters.`);
        }

        // Convert string to chunk array.
        const chunkArray = [];
        const totalLength = inputString.length;
        const digitsPerChunk = CHUNK_DIGITS;
        let currentMax = totalLength;
        let currentMin = totalLength - digitsPerChunk;

        while (currentMax > 0) {
            if (currentMin < 0) currentMin = 0;
            chunkArray.push(parseInt(inputString.slice(currentMin, currentMax), 10));
            currentMax = currentMin;
            currentMin -= digitsPerChunk;
        }
        trimLeadingZeros(chunkArray);
        return new LargeNum(chunkArray, isNegative);
    }

    /**
     * Parses a standard JavaScript number into a NumInstance.
     * @param {number} jsNumber - The number to parse.
     * @returns {CompactNum} The parsed number.
     * @throws {Error} If the number is not an integer or exceeds safe range.
     */
    function parseStandardJsNumber(jsNumber) {
        if (isWithinJsSafeRange(jsNumber)) {
            if (jsNumber !== truncateNumber(jsNumber)) {
                throw new Error(`'${jsNumber}' is not an integer.`);
            }
            return new CompactNum(jsNumber);
        }
        // If the number is out of safe range, convert it to a string and parse as a large number.
        return parseNumericString(jsNumber.toString());
    }

    /**
     * Main function to coerce various input types into a NumInstance.
     * This serves as the primary entry point for converting external values.
     * @param {*} inputValue - The value to parse (number, string, or existing NumInstance).
     * @returns {NumInstance} The parsed number.
     */
    function parseInputToNum(inputValue) {
        if (typeof inputValue === "number") {
            return parseStandardJsNumber(inputValue);
        }
        if (typeof inputValue === "string") {
            return parseNumericString(inputValue);
        }
        // If it's already a NumInstance, return it directly.
        if (inputValue instanceof LargeNum || inputValue instanceof CompactNum) {
            return inputValue;
        }
        // Fallback for other types: attempt string conversion.
        return parseNumericString(String(inputValue));
    }

    // Pre-create and cache small integer instances for performance.
    for (let i = 0; i < 1000; i++) {
        NumInstanceFactory[i] = new CompactNum(i);
        if (i > 0) NumInstanceFactory[-i] = new CompactNum(-i);
    }
    // Define common number constants.
    NumInstanceFactory.ONE_VAL = NumInstanceFactory[1];
    NumInstanceFactory.ZERO_VAL = NumInstanceFactory[0];
    NumInstanceFactory.MINUS_ONE_VAL = NumInstanceFactory[-1];
    NumInstanceFactory.TWO_VAL = NumInstanceFactory[2];
    NumInstanceFactory.THREE_VAL = NumInstanceFactory[3];
    NumInstanceFactory.FIVE_VAL = NumInstanceFactory[5];

    // Expose utility functions on the main factory object.
    NumInstanceFactory.getMax = getMax;
    NumInstanceFactory.getMin = getMin;
    NumInstanceFactory.calculateGcd = calculateGcd;
    NumInstanceFactory.calculateLcm = calculateLcm;
    NumInstanceFactory.isNumInstance = function(obj) { return obj instanceof LargeNum || obj instanceof CompactNum; };
    NumInstanceFactory.generateRandomBetween = generateRandomBetween;
    NumInstanceFactory.fromDigitArray = function(digits, base, isNegative) {
        // Ensure all digits are NumInstance objects before passing to buildFromDigitArray.
        const parsedDigits = digits.map(parseInputToNum);
        return buildFromDigitArray(parsedDigits, parseInputToNum(base || 10), isNegative);
    };

    return NumInstanceFactory;
})(); // End of largeNum IIFE

/**
 * Main function to process input data for a specific algorithm.
 * Reads input from stdin, performs calculations using the custom largeNum library,
 * and prints "Yes" or "No" based on a determined condition.
 * @param {string} rawInputString - The raw string content read from standard input.
 */
function processInputData(rawInputString) {
    // Input validation: Ensure valid and non-empty string input.
    if (typeof rawInputString !== 'string' || rawInputString.trim().length === 0) {
        console.error("Error: Input is empty or invalid. Please provide proper data.");
        return;
    }

    // Helper function to parse a line of space-separated numbers.
    const extractNumbersFromLine = (lineContent) => {
        return lineContent.split(' ').map(val => Number(val.trim())).filter(val => !isNaN(val));
    };

    const lines = rawInputString.trim().split("\n");

    // Ensure there are at least two lines of input data.
    if (lines.length < 2) {
        console.error("Error: Insufficient input provided. Expected at least two lines.");
        return;
    }

    // Parse the first line for problem parameters.
    const firstLineValues = extractNumbersFromLine(lines[0]);
    // The first number on the line, typically N (total items), is not used in this specific snippet.
    // const totalItemsCount = firstLineValues[0];
    const selectionThreshold = firstLineValues[1]; // The 'm' parameter from original code

    // Validate the selection threshold.
    if (isNaN(selectionThreshold) || selectionThreshold <= 0) {
        console.error("Error: Invalid or non-positive selection threshold (M). Must be a positive integer.");
        return;
    }

    // Parse the second line for the array of item values.
    let itemValuesArray = extractNumbersFromLine(lines[1]);

    // Validate the number of items against the threshold.
    if (itemValuesArray.length < selectionThreshold) {
        console.error("Error: Number of available items is less than the specified selection threshold.");
        return;
    }

    // Sort item values in descending order (largest first).
    itemValuesArray.sort((a, b) => b - a);

    let overallSum = largeNum(0); // Accumulator for the sum of all items.
    let sumOfRelevantItems = largeNum(0); // Accumulator for the sum of items from M-th largest downwards.

    // Calculate the sum of items from the (selectionThreshold)-th largest to the smallest.
    // If itemValuesArray is `[10, 9, 8, 7, 6, 5]` and `selectionThreshold = 3`:
    // `itemValuesArray[2]` is 8. Loop sums `8 + 7 + 6 + 5`.
    // This is `Total Sum - Sum of (top M-1) items`.
    for (let i = selectionThreshold - 1; i < itemValuesArray.length; i++) {
        sumOfRelevantItems = sumOfRelevantItems.add(itemValuesArray[i]);
    }

    // Calculate the total sum of all items.
    // Using for...of for clarity, or can use reduce.
    for (const item of itemValuesArray) {
        overallSum = overallSum.add(item);
    }

    // Calculate the target value for comparison: `totalSum / (4 * selectionThreshold)`.
    const divisor = largeNum(4).multiply(selectionThreshold);
    // Add guard for potential zero divisor, though `selectionThreshold` is already validated as positive.
    if (divisor.isZero()) {
        console.error("Error: Calculated divisor for comparison is zero. This should not happen with valid threshold.");
        return;
    }
    const comparisonTarget = overallSum.divide(divisor);

    // Determine the final output based on the comparison.
    // The original condition `bigInt(div).compare(sum_m) === 1` means `div > sum_m`.
    // So, if `comparisonTarget` is strictly greater than `sumOfRelevantItems`, print "No".
    const isConditionNotMet = comparisonTarget.isGreaterThan(sumOfRelevantItems);

    if (isConditionNotMet) {
        console.log('No');
    } else {
        console.log('Yes');
    }
}

// Execute the main processing function by reading input from standard input.
processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));