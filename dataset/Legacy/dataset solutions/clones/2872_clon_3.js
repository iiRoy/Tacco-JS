let unspecifiedValue = undefined; // Renamed 'undefined' to 'unspecifiedValue' for Type II.

/*
 * This module provides an arbitrary-precision integer arithmetic library,
 * handling numbers that exceed JavaScript's native safe integer limits.
 * It supports basic arithmetic operations, comparisons, bitwise operations,
 * modular arithmetic, and base conversions.
 */
let ArithmX = function (unspecifiedValue) {
    "use strict";

    const CHUNK_SIZE = 10000000; // Renamed BASE to CHUNK_SIZE (1e7)
    const CHUNK_DIGITS = 7; // Renamed LOG_BASE to CHUNK_DIGITS (log10(1e7))
    const MAX_SAFE_JS_INT = 9007199254740992; // Renamed MAX_INT to MAX_SAFE_JS_INT (2^53)
    const MAX_SAFE_JS_INT_ARRAY = convertJsNumToChunkArray(MAX_SAFE_JS_INT); // Renamed MAX_INT_ARR
    const LOG_MAX_SAFE_JS_INT = Math.log(MAX_SAFE_JS_INT); // Renamed LOG_MAX_INT

    /**
     * @class NumVal
     * @description Base class for arbitrary-precision integers.
     * @param {number|string|NumVal} initialVal - The value to initialize with.
     * @param {number} [radix] - The base for string parsing.
     * @returns {NumVal} An instance of TinyNum or LargeNum.
     */
    function NumVal(initialVal, radix) {
        // Return the cached zero constant if no value is provided.
        if (initialVal === unspecifiedValue) {
            return NumVal[0];
        }
        // If a radix is specified, use the specialized base parser.
        if (radix !== unspecifiedValue) {
            // Optimize for base 10, otherwise use generic base parsing.
            return +radix === 10 ? parseValueAsNumVal(initialVal) : parseStringInBase(initialVal, radix);
        }
        // Default parsing for numbers or strings.
        return parseValueAsNumVal(initialVal);
    }

    /**
     * @class LargeNum
     * @augments NumVal
     * @description Represents an arbitrary-precision integer stored as an array of chunks.
     * @param {number[]} chunkStore - Array of number chunks.
     * @param {boolean} isNegativeFlag - True if the number is negative.
     */
    function LargeNum(chunkStore, isNegativeFlag) {
        this.chunkStore = chunkStore; // Renamed 'value' to 'chunkStore'
        this.isNegativeFlag = isNegativeFlag; // Renamed 'sign' to 'isNegativeFlag'
        this.isSmall = false; // Indicates it's a LargeNum.
    }
    LargeNum.prototype = Object.create(NumVal.prototype); // Inherit from NumVal.

    /**
     * @class TinyNum
     * @augments NumVal
     * @description Represents an integer that fits within JavaScript's safe integer limits.
     * @param {number} rawValue - The native JavaScript number value.
     */
    function TinyNum(rawValue) {
        this.chunkStore = rawValue; // Renamed 'value' to 'chunkStore'
        this.isNegativeFlag = rawValue < 0; // Renamed 'sign' to 'isNegativeFlag'
        this.isSmall = true; // Indicates it's a TinyNum.
    }
    TinyNum.prototype = Object.create(NumVal.prototype); // Inherit from NumVal.

    /**
     * Checks if a given number can be accurately represented by JavaScript's Number type.
     * @param {number} num - The number to verify.
     * @returns {boolean} True if precise, false otherwise.
     */
    function isJsNumberPrecise(num) { // Renamed isPrecise to isJsNumberPrecise
        return -MAX_SAFE_JS_INT < num && num < MAX_SAFE_JS_INT;
    }

    /**
     * Converts a standard JavaScript number into its chunk array representation.
     * @param {number} num - The JS number.
     * @returns {number[]} Array of chunks.
     */
    function convertJsNumToChunkArray(num) { // Renamed smallToArray to convertJsNumToChunkArray
        if (num < CHUNK_SIZE) {
            return [num];
        }
        if (num < 1e14) { // 1e14 is CHUNK_SIZE^2
            return [num % CHUNK_SIZE, Math.floor(num / CHUNK_SIZE)];
        }
        return [num % CHUNK_SIZE, Math.floor(num / CHUNK_SIZE) % CHUNK_SIZE, Math.floor(num / 1e14)];
    }

    /**
     * Attempts to convert a chunk array back into a small JavaScript number.
     * @param {number[]} chunks - Array of chunks.
     * @returns {number|number[]} The JS number if conversion is possible, otherwise the original chunk array.
     */
    function convertChunkArrayToJsNum(chunks) { // Renamed arrayToSmall to convertChunkArrayToJsNum
        trimChunkArray(chunks); // Remove leading zeros first.
        const currentLen = chunks.length;
        // Only attempt conversion if the number of chunks is small and the overall value fits.
        if (currentLen < 4 && compareAbsoluteChunkArrays(chunks, MAX_SAFE_JS_INT_ARRAY) < 0) {
            switch (currentLen) {
                case 0: return 0;
                case 1: return chunks[0];
                case 2: return chunks[0] + chunks[1] * CHUNK_SIZE;
                case 3: return chunks[0] + (chunks[1] + chunks[2] * CHUNK_SIZE) * CHUNK_SIZE;
            }
        }
        return chunks; // If too large or too many chunks, return as is.
    }

    /**
     * Removes leading zero chunks from an array representation.
     * Modifies the array in place.
     * @param {number[]} chunkArr - The chunk array to trim.
     */
    function trimChunkArray(chunkArr) { // Renamed trim to trimChunkArray
        let currentIdx = chunkArr.length;
        while (currentIdx > 0 && chunkArr[--currentIdx] === 0) { /* empty */ }
        chunkArr.length = currentIdx + 1;
    }

    /**
     * Initializes a new array of a specified length with all elements set to zero.
     * @param {number} length - The desired length of the array.
     * @returns {number[]} An array filled with zeros.
     */
    function createZeroFilledArray(length) { // Renamed createArray to createZeroFilledArray
        const newArray = new Array(length);
        for (let i = 0; i < length; i++) {
            newArray[i] = 0;
        }
        return newArray;
    }

    /**
     * Truncates a floating-point number towards zero (equivalent to Math.floor for positive, Math.ceil for negative).
     * @param {number} num - The number to truncate.
     * @returns {number} The integer part of the number.
     */
    function truncateNumber(num) { // Renamed truncate to truncateNumber
        return num > 0 ? Math.floor(num) : Math.ceil(num);
    }

    /**
     * Adds two non-negative chunk arrays. Assumes first array is longer or equal in length.
     * @param {number[]} arrA - First chunk array.
     * @param {number[]} arrB - Second chunk array.
     * @returns {number[]} The sum as a new chunk array.
     */
    function addChunkArrays(arrA, arrB) { // Renamed add to addChunkArrays
        const lenA = arrA.length;
        const lenB = arrB.length;
        const result = new Array(lenA);
        let carry = 0;
        let currentSum;

        for (let i = 0; i < lenB; i++) {
            currentSum = arrA[i] + arrB[i] + carry;
            carry = (currentSum >= CHUNK_SIZE) ? 1 : 0;
            result[i] = currentSum - carry * CHUNK_SIZE;
        }
        while (i < lenA) {
            currentSum = arrA[i] + carry;
            carry = (currentSum === CHUNK_SIZE) ? 1 : 0;
            result[i++] = currentSum - carry * CHUNK_SIZE;
        }
        if (carry > 0) {
            result.push(carry);
        }
        return result;
    }

    /**
     * Adds two chunk arrays, handling operand order.
     * @param {number[]} arr1 - First chunk array.
     * @param {number[]} arr2 - Second chunk array.
     * @returns {number[]} The sum as a new chunk array.
     */
    function addAnyChunkArrays(arr1, arr2) { // Renamed addAny to addAnyChunkArrays
        // Ensure the first array is always the longer one for addChunkArrays.
        if (arr1.length >= arr2.length) {
            return addChunkArrays(arr1, arr2);
        }
        return addChunkArrays(arr2, arr1);
    }

    /**
     * Adds a small number (as a carry) to each chunk of an array.
     * @param {number[]} chunkArr - The array of chunks.
     * @param {number} carryValue - The small number to add.
     * @returns {number[]} The resulting chunk array.
     */
    function addSmallCarryToChunkArray(chunkArr, carryValue) { // Renamed addSmall to addSmallCarryToChunkArray
        const len = chunkArr.length;
        const result = new Array(len);
        let currentCarry = carryValue;
        let tempSum;

        for (let i = 0; i < len; i++) {
            tempSum = chunkArr[i] + currentCarry;
            currentCarry = Math.floor(tempSum / CHUNK_SIZE);
            result[i] = tempSum % CHUNK_SIZE;
        }
        while (currentCarry > 0) {
            result.push(currentCarry % CHUNK_SIZE);
            currentCarry = Math.floor(currentCarry / CHUNK_SIZE);
        }
        return result;
    }

    // --- Addition Methods for NumVal Prototypes ---
    LargeNum.prototype.add = function (operand) {
        const otherNum = parseValueAsNumVal(operand);
        // If signs differ, convert to subtraction: A + (-B) = A - B.
        if (this.isNegativeFlag !== otherNum.isNegativeFlag) {
            return this.subtract(otherNum.negate());
        }

        const thisChunks = this.chunkStore;
        const otherChunks = otherNum.chunkStore;

        if (otherNum.isSmall) {
            // Adding a LargeNum and a TinyNum. Convert the TinyNum's absolute value to be added.
            return new LargeNum(addSmallCarryToChunkArray(thisChunks, Math.abs(otherChunks)), this.isNegativeFlag);
        }
        // Both LargeNums, use general chunk array addition.
        return new LargeNum(addAnyChunkArrays(thisChunks, otherChunks), this.isNegativeFlag);
    };
    LargeNum.prototype.plus = LargeNum.prototype.add; // Alias.

    TinyNum.prototype.add = function (operand) {
        const otherNum = parseValueAsNumVal(operand);
        const thisValue = this.chunkStore;

        // If signs differ, convert to subtraction: A + (-B) = A - B.
        if (thisValue < 0 !== otherNum.isNegativeFlag) {
            return this.subtract(otherNum.negate());
        }

        const otherValue = otherNum.chunkStore;

        if (otherNum.isSmall) {
            // Both are TinyNums. If sum is precise, return TinyNum.
            if (isJsNumberPrecise(thisValue + otherValue)) {
                return new TinyNum(thisValue + otherValue);
            }
            // Otherwise, sum overflows JS safe integer. Convert to LargeNum operation.
            // Convert both absolute values to chunk arrays for addition.
            const absOtherChunks = convertJsNumToChunkArray(Math.abs(otherValue));
            return new LargeNum(addSmallCarryToChunkArray(absOtherChunks, Math.abs(thisValue)), thisValue < 0);
        }
        // Adding a TinyNum and a LargeNum. Convert TinyNum's absolute value to be added to LargeNum's chunks.
        return new LargeNum(addSmallCarryToChunkArray(otherNum.chunkStore, Math.abs(thisValue)), thisValue < 0);
    };
    TinyNum.prototype.plus = TinyNum.prototype.add; // Alias.

    /**
     * Subtracts chunk array `arrB` from `arrA`. Assumes `arrA >= arrB` (absolute values) and both are non-negative.
     * @param {number[]} arrA - Minuend chunk array.
     * @param {number[]} arrB - Subtrahend chunk array.
     * @returns {number[]} The difference as a new chunk array.
     */
    function subtractNonNegativeChunkArrays(arrA, arrB) { // Renamed subtract to subtractNonNegativeChunkArrays
        const lenA = arrA.length;
        const lenB = arrB.length;
        const result = new Array(lenA);
        let borrow = 0;
        let difference;

        for (let i = 0; i < lenB; i++) {
            difference = arrA[i] - borrow - arrB[i];
            if (difference < 0) {
                difference += CHUNK_SIZE;
                borrow = 1;
            } else {
                borrow = 0;
            }
            result[i] = difference;
        }
        // Propagate borrow through remaining chunks of arrA.
        for (let i = lenB; i < lenA; i++) {
            difference = arrA[i] - borrow;
            if (difference < 0) {
                difference += CHUNK_SIZE;
                // borrow remains 1.
            } else {
                result[i++] = difference;
                // No more borrow needed, copy rest of arrA directly.
                while (i < lenA) {
                    result[i] = arrA[i];
                    i++;
                }
                trimChunkArray(result);
                return result;
            }
            result[i] = difference;
        }
        trimChunkArray(result);
        return result;
    }

    /**
     * Performs subtraction between two numbers, handling their signs and magnitudes.
     * @param {number[]} val1Chunks - First operand's chunk array (absolute value).
     * @param {number[]} val2Chunks - Second operand's chunk array (absolute value).
     * @param {boolean} originalSign - The sign of the first operand.
     * @returns {NumVal} The difference as a NumVal.
     */
    function performGeneralSubtraction(val1Chunks, val2Chunks, originalSign) { // Renamed subtractAny to performGeneralSubtraction
        let resultChunks;
        let finalSign = originalSign;

        // Determine which absolute value is larger to ensure correct subtraction order.
        if (compareAbsoluteChunkArrays(val1Chunks, val2Chunks) >= 0) {
            resultChunks = subtractNonNegativeChunkArrays(val1Chunks, val2Chunks);
        } else {
            resultChunks = subtractNonNegativeChunkArrays(val2Chunks, val1Chunks);
            finalSign = !finalSign; // Flip sign if operands were swapped.
        }
        const smallResult = convertChunkArrayToJsNum(resultChunks);
        if (typeof smallResult === "number") {
            return new TinyNum(finalSign ? -smallResult : smallResult);
        }
        return new LargeNum(smallResult, finalSign);
    }

    /**
     * Subtracts a small number from a chunk array.
     * @param {number[]} targetChunks - The chunk array (minuend).
     * @param {number} smallNumVal - The small number (subtrahend, absolute value).
     * @param {boolean} targetIsNegative - Initial sign of the targetChunks.
     * @returns {NumVal} The result as a NumVal.
     */
    function subtractSmallFromChunkArray(targetChunks, smallNumVal, targetIsNegative) { // Renamed subtractSmall to subtractSmallFromChunkArray
        const len = targetChunks.length;
        const result = new Array(len);
        let currentCarry = -smallNumVal; // Negative carry for subtraction.
        let difference;

        for (let i = 0; i < len; i++) {
            difference = targetChunks[i] + currentCarry;
            currentCarry = Math.floor(difference / CHUNK_SIZE);
            difference %= CHUNK_SIZE;
            result[i] = difference < 0 ? difference + CHUNK_SIZE : difference;
        }
        const convertedResult = convertChunkArrayToJsNum(result);
        if (typeof convertedResult === "number") {
            return new TinyNum(targetIsNegative ? -convertedResult : convertedResult);
        }
        return new LargeNum(convertedResult, targetIsNegative);
    }

    // --- Subtraction Methods for NumVal Prototypes ---
    LargeNum.prototype.subtract = function (operand) {
        const otherNum = parseValueAsNumVal(operand);
        // If signs differ, convert to addition: A - (-B) = A + B.
        if (this.isNegativeFlag !== otherNum.isNegativeFlag) {
            return this.add(otherNum.negate());
        }

        const thisChunks = this.chunkStore;
        const otherChunks = otherNum.chunkStore;

        if (otherNum.isSmall) {
            // Subtracting a TinyNum from a LargeNum. Use its absolute value.
            return subtractSmallFromChunkArray(thisChunks, Math.abs(otherChunks), this.isNegativeFlag);
        }
        // Both LargeNums, perform general subtraction.
        return performGeneralSubtraction(thisChunks, otherChunks, this.isNegativeFlag);
    };
    LargeNum.prototype.minus = LargeNum.prototype.subtract; // Alias.

    TinyNum.prototype.subtract = function (operand) {
        const otherNum = parseValueAsNumVal(operand);
        const thisValue = this.chunkStore;

        // If signs differ, convert to addition: A - (-B) = A + B.
        if (thisValue < 0 !== otherNum.isNegativeFlag) {
            return this.add(otherNum.negate());
        }

        const otherValue = otherNum.chunkStore;

        if (otherNum.isSmall) {
            // Both TinyNums. If difference is precise, return TinyNum.
            if (isJsNumberPrecise(thisValue - otherValue)) {
                return new TinyNum(thisValue - otherValue);
            }
            // Otherwise, difference overflows JS safe integer. Convert to LargeNum operation.
            const absThis = Math.abs(thisValue);
            const absOther = Math.abs(otherValue);
            if (absThis >= absOther) {
                // If |this| >= |other|, sign is same as 'this'.
                return performGeneralSubtraction(convertJsNumToChunkArray(absThis), convertJsNumToChunkArray(absOther), thisValue < 0);
            } else {
                // If |this| < |other|, sign is opposite of 'this'.
                return performGeneralSubtraction(convertJsNumToChunkArray(absOther), convertJsNumToChunkArray(absThis), !(thisValue < 0));
            }
        }
        // Subtracting a LargeNum from a TinyNum. Convert TinyNum to chunks.
        const absThisChunks = convertJsNumToChunkArray(Math.abs(thisValue));
        return performGeneralSubtraction(otherNum.chunkStore, absThisChunks, !(thisValue < 0));
    };
    TinyNum.prototype.minus = TinyNum.prototype.subtract; // Alias.

    // --- Unary Operators ---
    LargeNum.prototype.negate = function () {
        return new LargeNum(this.chunkStore, !this.isNegativeFlag);
    };

    TinyNum.prototype.negate = function () {
        return new TinyNum(-this.chunkStore);
    };

    LargeNum.prototype.getAbsoluteValue = function () { // Renamed abs to getAbsoluteValue
        return new LargeNum(this.chunkStore, false);
    };

    TinyNum.prototype.getAbsoluteValue = function () { // Renamed abs to getAbsoluteValue
        return new TinyNum(Math.abs(this.chunkStore));
    };

    /**
     * Multiplies two chunk arrays using the traditional long multiplication algorithm.
     * @param {number[]} arrA - First chunk array.
     * @param {number[]} arrB - Second chunk array.
     * @returns {number[]} The product as a new chunk array.
     */
    function performLongMultiplication(arrA, arrB) { // Renamed multiplyLong to performLongMultiplication
        const lenA = arrA.length;
        const lenB = arrB.length;
        const productResult = createZeroFilledArray(lenA + lenB);
        let currentProduct, currentCarry;

        for (let i = 0; i < lenA; ++i) {
            const chunkA = arrA[i];
            currentCarry = 0;
            for (let j = 0; j < lenB; ++j) {
                const chunkB = arrB[j];
                currentProduct = chunkA * chunkB + productResult[i + j] + currentCarry;
                currentCarry = Math.floor(currentProduct / CHUNK_SIZE);
                productResult[i + j] = currentProduct % CHUNK_SIZE; // Use modulo directly.
            }
            productResult[i + lenB] += currentCarry;
        }
        trimChunkArray(productResult);
        return productResult;
    }

    /**
     * Multiplies a chunk array by a single small integer.
     * @param {number[]} chunkArr - The chunk array.
     * @param {number} multiplier - The small integer multiplier.
     * @returns {number[]} The product as a new chunk array.
     */
    function multiplyChunkArrayBySmallInt(chunkArr, multiplier) { // Renamed multiplySmall to multiplyChunkArrayBySmallInt
        const len = chunkArr.length;
        const result = new Array(len);
        let carry = 0;
        let productChunk;

        for (let i = 0; i < len; i++) {
            productChunk = chunkArr[i] * multiplier + carry;
            carry = Math.floor(productChunk / CHUNK_SIZE);
            result[i] = productChunk % CHUNK_SIZE;
        }
        while (carry > 0) {
            result.push(carry % CHUNK_SIZE);
            carry = Math.floor(carry / CHUNK_SIZE);
        }
        return result;
    }

    /**
     * Shifts a chunk array to the left by `numChunks` positions (equivalent to multiplying by CHUNK_SIZE^numChunks).
     * @param {number[]} arr - The chunk array.
     * @param {number} numChunks - Number of chunks to shift.
     * @returns {number[]} The shifted array.
     */
    function shiftChunkArrayLeft(arr, numChunks) { // Renamed shiftLeft to shiftChunkArrayLeft
        if (numChunks === 0) return arr.slice(); // Return a shallow copy if no shift.
        const zeros = createZeroFilledArray(numChunks);
        return zeros.concat(arr);
    }

    /**
     * Multiplies two chunk arrays using the Karatsuba algorithm.
     * @param {number[]} arrX - First chunk array.
     * @param {number[]} arrY - Second chunk array.
     * @returns {number[]} The product as a new chunk array.
     */
    function karatsubaMultiplication(arrX, arrY) { // Renamed multiplyKaratsuba to karatsubaMultiplication
        const totalLen = Math.max(arrX.length, arrY.length);
        if (totalLen <= 30) { // Base case for recursion: use long multiplication for small arrays.
            return performLongMultiplication(arrX, arrY);
        }

        const splitPoint = Math.ceil(totalLen / 2); // Split arrays into two halves.

        const xLow = arrX.slice(0, splitPoint);
        const xHigh = arrX.slice(splitPoint);
        const yLow = arrY.slice(0, splitPoint);
        const yHigh = arrY.slice(splitPoint);

        // Recursive calls for Karatsuba.
        const productLow = karatsubaMultiplication(xLow, yLow); // z0
        const productHigh = karatsubaMultiplication(xHigh, yHigh); // z2
        const sumX = addAnyChunkArrays(xLow, xHigh);
        const sumY = addAnyChunkArrays(yLow, yHigh);
        const productSums = karatsubaMultiplication(sumX, sumY); // z1

        // Combine results: z2 * (CHUNK_SIZE^splitPoint)^2 + (z1 - z0 - z2) * CHUNK_SIZE^splitPoint + z0
        const middleTerm = subtractNonNegativeChunkArrays(subtractNonNegativeChunkArrays(productSums, productLow), productHigh);

        const finalProduct = addAnyChunkArrays(
            addAnyChunkArrays(productLow, shiftChunkArrayLeft(middleTerm, splitPoint)),
            shiftChunkArrayLeft(productHigh, 2 * splitPoint)
        );
        trimChunkArray(finalProduct);
        return finalProduct;
    }

    /**
     * Heuristic function to determine if Karatsuba multiplication is beneficial.
     * @param {number} len1 - Length of the first chunk array.
     * @param {number} len2 - Length of the second chunk array.
     * @returns {boolean} True if Karatsuba should be used.
     */
    function shouldApplyKaratsuba(len1, len2) { // Renamed useKaratsuba to shouldApplyKaratsuba
        return -0.012 * len1 - 0.012 * len2 + 15e-6 * len1 * len2 > 0;
    }

    // --- Multiplication Methods for NumVal Prototypes ---
    LargeNum.prototype.multiply = function (operand) {
        const otherNum = parseValueAsNumVal(operand);
        const thisChunks = this.chunkStore;
        let otherChunksOrValue = otherNum.chunkStore; // Can be number or array.
        const resultIsNegative = this.isNegativeFlag !== otherNum.isNegativeFlag;

        if (otherNum.isSmall) {
            const smallValue = otherChunksOrValue;
            if (smallValue === 0) return NumVal[0];
            if (smallValue === 1) return this;
            if (smallValue === -1) return this.negate();

            const absSmallValue = Math.abs(smallValue);
            if (absSmallValue < CHUNK_SIZE) {
                // Multiplier is a small number within one chunk.
                return new LargeNum(multiplyChunkArrayBySmallInt(thisChunks, absSmallValue), resultIsNegative);
            }
            // Multiplier is a small number but larger than one chunk. Convert to chunk array.
            otherChunksOrValue = convertJsNumToChunkArray(absSmallValue);
        }

        // Use Karatsuba or long multiplication based on heuristic.
        const productResult = shouldApplyKaratsuba(thisChunks.length, otherChunksOrValue.length) ?
            karatsubaMultiplication(thisChunks, otherChunksOrValue) :
            performLongMultiplication(thisChunks, otherChunksOrValue);

        return new LargeNum(productResult, resultIsNegative);
    };
    LargeNum.prototype.times = LargeNum.prototype.multiply; // Alias.

    /**
     * Helper function to multiply a small JS number with a chunk array.
     * @param {number} smallNum - The small number (absolute value).
     * @param {number[]} chunkArr - The chunk array.
     * @param {boolean} isResultNegative - Flag for the result's sign.
     * @returns {LargeNum} The product as a LargeNum.
     */
    function multiplySmallJsNumAndChunkArray(smallNum, chunkArr, isResultNegative) { // Renamed multiplySmallAndArray
        if (smallNum < CHUNK_SIZE) {
            return new LargeNum(multiplyChunkArrayBySmallInt(chunkArr, smallNum), isResultNegative);
        }
        // If smallNum is larger than a single chunk, convert it to a chunk array and use long multiplication.
        return new LargeNum(performLongMultiplication(chunkArr, convertJsNumToChunkArray(smallNum)), isResultNegative);
    }

    // Internal multiplication methods for different types.
    LargeNum.prototype._multiplyByTinyNum = function (otherTinyNum) { // Renamed _multiplyBySmall
        // otherTinyNum is guaranteed to be a TinyNum.
        const smallValue = otherTinyNum.chunkStore;
        if (smallValue === 0) return NumVal[0];
        if (smallValue === 1) return this;
        if (smallValue === -1) return this.negate();
        return multiplySmallJsNumAndChunkArray(Math.abs(smallValue), this.chunkStore, this.isNegativeFlag !== otherTinyNum.isNegativeFlag);
    };

    TinyNum.prototype._multiplyByTinyNum = function (otherTinyNum) { // Renamed _multiplyBySmall
        // Both are TinyNums.
        const val1 = this.chunkStore;
        const val2 = otherTinyNum.chunkStore;
        if (isJsNumberPrecise(val1 * val2)) {
            return new TinyNum(val1 * val2);
        }
        // Product overflows JS safe integer. Convert to LargeNum multiplication.
        const absVal1Chunks = convertJsNumToChunkArray(Math.abs(val1));
        const absVal2 = Math.abs(val2);
        return multiplySmallJsNumAndChunkArray(absVal2, absVal1Chunks, this.isNegativeFlag !== otherTinyNum.isNegativeFlag);
    };

    TinyNum.prototype.multiply = function (operand) {
        // Delegate to internal helper for efficient TinyNum multiplication.
        return parseValueAsNumVal(operand)._multiplyByTinyNum(this);
    };
    TinyNum.prototype.times = TinyNum.prototype.multiply; // Alias.

    /**
     * Squares a chunk array efficiently using a specialized algorithm.
     * @param {number[]} arr - The chunk array to square.
     * @returns {number[]} The square as a new chunk array.
     */
    function squareChunkArray(arr) { // Renamed square to squareChunkArray
        const len = arr.length;
        const result = createZeroFilledArray(len + len);
        let product, carry;

        for (let i = 0; i < len; i++) {
            const chunkI = arr[i];
            carry = 0;
            // Calculate diagonal term (a_i * a_i)
            product = chunkI * chunkI + result[i + i];
            carry = Math.floor(product / CHUNK_SIZE);
            result[i + i] = product % CHUNK_SIZE;

            // Calculate off-diagonal terms (2 * a_i * a_j)
            for (let j = i + 1; j < len; j++) {
                const chunkJ = arr[j];
                product = 2 * (chunkI * chunkJ) + result[i + j] + carry;
                carry = Math.floor(product / CHUNK_SIZE);
                result[i + j] = product % CHUNK_SIZE;
            }
            result[i + len] += carry;
        }
        trimChunkArray(result);
        return result;
    }

    LargeNum.prototype.square = function () {
        return new LargeNum(squareChunkArray(this.chunkStore), false); // Square is always non-negative.
    };

    TinyNum.prototype.square = function () {
        const val = this.chunkStore;
        const squaredVal = val * val;
        if (isJsNumberPrecise(squaredVal)) {
            return new TinyNum(squaredVal);
        }
        // If overflow, convert to LargeNum and square its chunk array.
        return new LargeNum(squareChunkArray(convertJsNumToChunkArray(Math.abs(val))), false);
    };

    /**
     * Division and modulo using an optimized algorithm (similar to Knuth's D-algorithm).
     * @param {number[]} dividend - The dividend chunk array.
     * @param {number[]} divisor - The divisor chunk array.
     * @returns {[number[], number[]]} Array containing [quotient_chunks, remainder_chunks].
     */
    function divModOptimized(dividend, divisor) { // Renamed divMod1 to divModOptimized
        const dividendLen = dividend.length;
        const divisorLen = divisor.length;
        const quotient = createZeroFilledArray(dividendLen - divisorLen + 1); // Correct quotient length.

        const divisorMSD = divisor[divisorLen - 1]; // Most significant digit of divisor.
        // Normalization factor to make divisor's MSD large, improving quotient estimation.
        const normalizationFactor = Math.ceil(CHUNK_SIZE / (2 * divisorMSD));
        let normalizedRemainder = multiplyChunkArrayBySmallInt(dividend, normalizationFactor);
        let normalizedDivisor = multiplyChunkArrayBySmallInt(divisor, normalizationFactor);

        // Pad normalized remainder and divisor for easier indexing.
        if (normalizedRemainder.length <= dividendLen) normalizedRemainder.push(0);
        normalizedDivisor.push(0); // Add a zero for consistent indexing.

        const newDivisorMSD = normalizedDivisor[divisorLen - 1]; // MSD of normalized divisor.

        let currentQuotientDigit;
        let shiftPos;
        let carry, borrow, loopBound, trialProduct;

        // Iterate from most significant position of quotient.
        for (shiftPos = dividendLen - divisorLen; shiftPos >= 0; shiftPos--) {
            // Estimate quotient digit.
            currentQuotientDigit = CHUNK_SIZE - 1; // Start with max possible.
            // Refine guess based on leading chunks of remainder and divisor.
            if (normalizedRemainder[shiftPos + divisorLen] !== newDivisorMSD) {
                currentQuotientDigit = Math.floor(
                    (normalizedRemainder[shiftPos + divisorLen] * CHUNK_SIZE + normalizedRemainder[shiftPos + divisorLen - 1]) / newDivisorMSD
                );
            }

            carry = 0;
            borrow = 0;
            loopBound = normalizedDivisor.length;
            // Perform trial subtraction: currentQuotientDigit * normalizedDivisor from normalizedRemainder.
            for (let i = 0; i < loopBound; i++) {
                carry += currentQuotientDigit * normalizedDivisor[i];
                trialProduct = Math.floor(carry / CHUNK_SIZE);
                borrow += normalizedRemainder[shiftPos + i] - (carry - trialProduct * CHUNK_SIZE);
                carry = trialProduct;

                if (borrow < 0) {
                    normalizedRemainder[shiftPos + i] = borrow + CHUNK_SIZE;
                    borrow = -1;
                } else {
                    normalizedRemainder[shiftPos + i] = borrow;
                    borrow = 0;
                }
            }

            // Adjust quotient digit if trial subtraction resulted in a negative remainder.
            while (borrow !== 0) {
                currentQuotientDigit -= 1;
                carry = 0;
                for (let i = 0; i < loopBound; i++) {
                    carry += normalizedRemainder[shiftPos + i] - CHUNK_SIZE + normalizedDivisor[i];
                    if (carry < 0) {
                        normalizedRemainder[shiftPos + i] = carry + CHUNK_SIZE;
                        carry = 0;
                    } else {
                        normalizedRemainder[shiftPos + i] = carry;
                        carry = 1;
                    }
                }
                borrow += carry;
            }
            quotient[shiftPos] = currentQuotientDigit;
        }

        // Denormalize the remainder.
        const denormalizedRemainder = divModBySmallJsNum(normalizedRemainder, normalizationFactor)[0]; // [0] for quotient.
        trimChunkArray(quotient);
        trimChunkArray(denormalizedRemainder);

        return [convertChunkArrayToJsNum(quotient), convertChunkArrayToJsNum(denormalizedRemainder)];
    }

    /**
     * Division and modulo using iterative subtraction. Less efficient for very large numbers.
     * @param {number[]} dividend - The dividend chunk array.
     * @param {number[]} divisor - The divisor chunk array.
     * @returns {[number[], number[]]} Array containing [quotient_chunks, remainder_chunks].
     */
    function divModIterative(dividend, divisor) { // Renamed divMod2 to divModIterative
        let currentDividendLen = dividend.length;
        const divisorLen = divisor.length;
        const quotientChunks = [];
        let currentPartialDividend = []; // Accumulates chunks from dividend.

        let highDividendEstimate, highDivisorEstimate, estimatedQuotient;
        let trialProductChunks;

        while (currentDividendLen > 0) {
            currentPartialDividend.unshift(dividend[--currentDividendLen]); // Add next chunk from dividend.
            trimChunkArray(currentPartialDividend);

            if (compareAbsoluteChunkArrays(currentPartialDividend, divisor) < 0) {
                quotientChunks.push(0);
                continue;
            }

            // Estimate quotient digit from leading chunks.
            const partialLen = currentPartialDividend.length;
            highDividendEstimate = currentPartialDividend[partialLen - 1] * CHUNK_SIZE + (currentPartialDividend[partialLen - 2] || 0);
            highDivisorEstimate = divisor[divisorLen - 1] * CHUNK_SIZE + (divisor[divisorLen - 2] || 0);

            if (partialLen > divisorLen) {
                highDividendEstimate = (highDividendEstimate + 1) * CHUNK_SIZE;
            }
            estimatedQuotient = Math.ceil(highDividendEstimate / highDivisorEstimate);

            // Refine quotient digit by trial multiplication and subtraction.
            do {
                trialProductChunks = multiplyChunkArrayBySmallInt(divisor, estimatedQuotient);
                if (compareAbsoluteChunkArrays(trialProductChunks, currentPartialDividend) <= 0) break;
                estimatedQuotient--;
            } while (estimatedQuotient > 0); // Ensure quotient doesn't go below 0.

            quotientChunks.push(estimatedQuotient);
            currentPartialDividend = subtractNonNegativeChunkArrays(currentPartialDividend, trialProductChunks);
        }

        quotientChunks.reverse(); // Chunks were collected in reverse order.
        return [convertChunkArrayToJsNum(quotientChunks), convertChunkArrayToJsNum(currentPartialDividend)];
    }

    /**
     * Divides a chunk array by a single small JavaScript number.
     * @param {number[]} chunkArr - The chunk array dividend.
     * @param {number} smallDivisor - The small integer divisor.
     * @returns {[number[], number]} Array containing [quotient_chunk_array, remainder_number].
     */
    function divModBySmallJsNum(chunkArr, smallDivisor) { // Renamed divModSmall to divModBySmallJsNum
        const len = chunkArr.length;
        const quotient = createZeroFilledArray(len);
        let remainder = 0;
        let currentDividendPart, qVal;

        for (let i = len - 1; i >= 0; --i) {
            currentDividendPart = remainder * CHUNK_SIZE + chunkArr[i];
            qVal = truncateNumber(currentDividendPart / smallDivisor);
            remainder = currentDividendPart - qVal * smallDivisor;
            quotient[i] = qVal | 0; // Ensure integer.
        }
        return [quotient, remainder | 0]; // Return integer remainder.
    }

    /**
     * Performs general division and modulo operations for NumVal objects.
     * @param {NumVal} dividendNum - The dividend.
     * @param {NumVal} divisorNum - The divisor.
     * @returns {[NumVal, NumVal]} An array containing [quotient, remainder] NumVal objects.
     */
    function performGeneralDivMod(dividendNum, divisorNum) { // Renamed divModAny to performGeneralDivMod
        const parsedDivisor = parseValueAsNumVal(divisorNum);
        const dividendChunks = dividendNum.chunkStore;
        const divisorChunksOrValue = parsedDivisor.chunkStore;

        let divisionResult; // Will hold [quotient_raw, remainder_raw]

        // Guard clause: division by zero.
        if (parsedDivisor.isZero()) {
            throw new Error("Division by zero is not allowed.");
        }

        // Case 1: Dividend is a TinyNum.
        if (dividendNum.isSmall) {
            const smallDividend = dividendChunks;
            if (parsedDivisor.isSmall) {
                const smallDivisor = divisorChunksOrValue;
                // Both are TinyNums, use native JS division and modulo.
                return [new TinyNum(truncateNumber(smallDividend / smallDivisor)), new TinyNum(smallDividend % smallDivisor)];
            }
            // TinyNum dividend, LargeNum divisor. Quotient is 0, remainder is the dividend itself.
            return [NumVal[0], dividendNum];
        }

        // Case 2: Divisor is a TinyNum.
        if (parsedDivisor.isSmall) {
            const smallDivisor = divisorChunksOrValue;
            if (smallDivisor === 1) return [dividendNum, NumVal[0]];
            if (smallDivisor === -1) return [dividendNum.negate(), NumVal[0]];

            const absSmallDivisor = Math.abs(smallDivisor);
            if (absSmallDivisor < CHUNK_SIZE) {
                // Divisor fits in a single chunk.
                const [qChunks, remNum] = divModBySmallJsNum(dividendChunks, absSmallDivisor);
                const quotientRaw = convertChunkArrayToJsNum(qChunks);
                let remainder = remNum;

                // Adjust remainder sign to match dividend.
                if (dividendNum.isNegativeFlag) remainder = -remainder;

                const finalQuotient = typeof quotientRaw === "number" ?
                    new TinyNum(dividendNum.isNegativeFlag !== parsedDivisor.isNegativeFlag ? -quotientRaw : quotientRaw) :
                    new LargeNum(quotientRaw, dividendNum.isNegativeFlag !== parsedDivisor.isNegativeFlag);
                const finalRemainder = new TinyNum(remainder);
                return [finalQuotient, finalRemainder];
            }
            // Divisor is a TinyNum but too large for single-chunk division. Convert to chunk array.
            const divisorAsChunks = convertJsNumToChunkArray(absSmallDivisor);
            divisionResult = divModOptimized(dividendChunks, divisorAsChunks); // Use optimized method.
        } else {
            // Case 3: Both are LargeNums.
            const divisorAsChunks = divisorChunksOrValue;
            const comparison = compareAbsoluteChunkArrays(dividendChunks, divisorAsChunks);

            if (comparison === -1) return [NumVal[0], dividendNum]; // |Dividend| < |Divisor|
            if (comparison === 0) { // |Dividend| == |Divisor|
                const signFactor = dividendNum.isNegativeFlag === parsedDivisor.isNegativeFlag ? 1 : -1;
                return [NumVal[signFactor], NumVal[0]];
            }

            // Choose division algorithm based on operand size.
            // Heuristic threshold for switching between division methods.
            if (dividendChunks.length + divisorAsChunks.length <= 200) {
                divisionResult = divModOptimized(dividendChunks, divisorAsChunks);
            } else {
                divisionResult = divModIterative(dividendChunks, divisorAsChunks);
            }
        }

        const quotientRaw = divisionResult[0];
        const remainderRaw = divisionResult[1];

        // Determine final signs for quotient and remainder.
        const quotientNegative = dividendNum.isNegativeFlag !== parsedDivisor.isNegativeFlag;
        const remainderNegative = dividendNum.isNegativeFlag;

        const finalQuotient = typeof quotientRaw === "number" ?
            new TinyNum(quotientNegative ? -quotientRaw : quotientRaw) :
            new LargeNum(quotientRaw, quotientNegative);

        const finalRemainder = typeof remainderRaw === "number" ?
            new TinyNum(remainderNegative ? -remainderRaw : remainderRaw) :
            new LargeNum(remainderRaw, remainderNegative);

        return [finalQuotient, finalRemainder];
    }

    // --- Division and Modulo Methods ---
    LargeNum.prototype.divmod = function (operand) {
        const [quotient, remainder] = performGeneralDivMod(this, operand);
        return { quotient: quotient, remainder: remainder };
    };
    TinyNum.prototype.divmod = LargeNum.prototype.divmod;

    LargeNum.prototype.divide = function (operand) {
        return performGeneralDivMod(this, operand)[0];
    };
    TinyNum.prototype.over = TinyNum.prototype.divide = LargeNum.prototype.over = LargeNum.prototype.divide; // Aliases.

    LargeNum.prototype.getRemainder = function (operand) { // Renamed mod to getRemainder
        return performGeneralDivMod(this, operand)[1];
    };
    TinyNum.prototype.remainder = TinyNum.prototype.getRemainder = LargeNum.prototype.remainder = LargeNum.prototype.getRemainder; // Aliases.

    // --- Exponentiation ---
    LargeNum.prototype.toPower = function (exponent) { // Renamed pow to toPower
        const expNum = parseValueAsNumVal(exponent);
        const baseChunks = this.chunkStore;
        const expValue = expNum.chunkStore;

        // Handle special base and exponent values.
        if (expValue === 0) return NumVal[1]; // x^0 = 1
        if (baseChunks === 0) return NumVal[0]; // 0^y = 0 (for y > 0)
        if (baseChunks === 1) return NumVal[1]; // 1^y = 1
        if (baseChunks === -1) return expNum.isEven() ? NumVal[1] : NumVal[-1]; // (-1)^y

        // Negative exponents for integers result in 0 (unless base is 0, which is undefined, but here 0).
        if (expNum.isNegative()) {
            return NumVal[0];
        }

        // Exponent must be a small number for this implementation.
        if (!expNum.isSmall) {
            throw new Error(`The exponent ${expNum.toString()} is too large to compute.`);
        }

        // If base is small, try native Math.pow first.
        if (this.isSmall) {
            const rawResult = Math.pow(baseChunks, expValue);
            if (isJsNumberPrecise(rawResult)) {
                return new TinyNum(truncateNumber(rawResult));
            }
        }

        // Binary exponentiation (exponentiation by squaring).
        let currentBase = this;
        let result = NumVal[1];
        let currentExp = expValue; // Use JS number for iteration.

        while (currentExp > 0) {
            if ((currentExp & 1) === 1) { // If exponent is odd.
                result = result.times(currentBase);
            }
            currentExp = currentExp >> 1; // Integer division by 2.
            currentBase = currentBase.square();
        }
        return result;
    };
    TinyNum.prototype.toPower = LargeNum.prototype.toPower; // Share implementation.

    LargeNum.prototype.modularExponentiation = function (exponent, modulus) { // Renamed modPow to modularExponentiation
        let exp = parseValueAsNumVal(exponent);
        let mod = parseValueAsNumVal(modulus);

        if (mod.isZero()) {
            throw new Error("Modular exponentiation with modulus 0 is undefined.");
        }

        let result = NumVal[1];
        let base = this.getRemainder(mod); // Reduce base modulo modulus.

        // Standard modular exponentiation by squaring.
        while (exp.isPositive()) {
            if (base.isZero()) return NumVal[0]; // 0^exp mod M = 0 for exp > 0.
            if (exp.isOdd()) {
                result = result.multiply(base).getRemainder(mod);
            }
            exp = exp.divide(2);
            base = base.square().getRemainder(mod);
        }
        return result;
    };
    TinyNum.prototype.modularExponentiation = LargeNum.prototype.modularExponentiation; // Share implementation.

    /**
     * Compares the absolute values of two chunk arrays.
     * @param {number[]} arrA - First chunk array.
     * @param {number[]} arrB - Second chunk array.
     * @returns {number} -1 if arrA < arrB, 0 if arrA == arrB, 1 if arrA > arrB.
     */
    function compareAbsoluteChunkArrays(arrA, arrB) { // Renamed compareAbs to compareAbsoluteChunkArrays
        if (arrA.length !== arrB.length) {
            return arrA.length > arrB.length ? 1 : -1;
        }
        // Compare chunks from most significant to least significant.
        for (let i = arrA.length - 1; i >= 0; i--) {
            if (arrA[i] !== arrB[i]) {
                return arrA[i] > arrB[i] ? 1 : -1;
            }
        }
        return 0; // Arrays are identical.
    }

    // --- Comparison Methods ---
    LargeNum.prototype.compareAbsolute = function (operand) { // Renamed compareAbs to compareAbsolute
        const otherNum = parseValueAsNumVal(operand);
        if (otherNum.isSmall) {
            // Compare LargeNum with absolute value of TinyNum.
            return compareAbsoluteChunkArrays(this.chunkStore, convertJsNumToChunkArray(Math.abs(otherNum.chunkStore)));
        }
        // Both LargeNums.
        return compareAbsoluteChunkArrays(this.chunkStore, otherNum.chunkStore);
    };

    TinyNum.prototype.compareAbsolute = function (operand) { // Renamed compareAbs to compareAbsolute
        const otherNum = parseValueAsNumVal(operand);
        const absThis = Math.abs(this.chunkStore);

        if (otherNum.isSmall) {
            const absOther = Math.abs(otherNum.chunkStore);
            return absThis === absOther ? 0 : (absThis > absOther ? 1 : -1);
        }
        // TinyNum vs LargeNum. TinyNum is always smaller in absolute magnitude if both are not zero.
        return -1; // this (small) < other (large)
    };

    LargeNum.prototype.compare = function (operand) {
        if (operand === Infinity) return -1;
        if (operand === -Infinity) return 1;

        const otherNum = parseValueAsNumVal(operand);
        const thisChunks = this.chunkStore;
        const otherChunks = otherNum.chunkStore;

        // Different signs: negative is smaller.
        if (this.isNegativeFlag !== otherNum.isNegativeFlag) {
            return otherNum.isNegativeFlag ? 1 : -1; // If other is negative, this (positive) is greater.
        }

        // Same signs:
        if (otherNum.isSmall) {
            // LargeNum vs TinyNum (same sign).
            // If both positive, LargeNum is greater. If both negative, LargeNum is smaller.
            return this.isNegativeFlag ? -1 : 1;
        }

        // Both LargeNums, same sign. Compare absolute values and adjust based on sign.
        const absComparison = compareAbsoluteChunkArrays(thisChunks, otherChunks);
        return this.isNegativeFlag ? -absComparison : absComparison;
    };
    LargeNum.prototype.compareTo = LargeNum.prototype.compare; // Alias.

    TinyNum.prototype.compare = function (operand) {
        if (operand === Infinity) return -1;
        if (operand === -Infinity) return 1;

        const otherNum = parseValueAsNumVal(operand);
        const thisValue = this.chunkStore;
        const otherValue = otherNum.chunkStore;

        if (otherNum.isSmall) {
            // Both TinyNums, use native comparison.
            return thisValue === otherValue ? 0 : (thisValue > otherValue ? 1 : -1);
        }

        // TinyNum vs LargeNum.
        // If signs differ, negative is smaller.
        if (thisValue < 0 !== otherNum.isNegativeFlag) {
            return thisValue < 0 ? -1 : 1; // If this is negative, it's smaller.
        }

        // Same signs. TinyNum is generally smaller in magnitude than LargeNum.
        // If both positive, TinyNum is smaller. If both negative, TinyNum is larger (less negative).
        return thisValue < 0 ? 1 : -1;
    };
    TinyNum.prototype.compareTo = TinyNum.prototype.compare; // Alias.

    // Equality and Inequality
    LargeNum.prototype.equals = function (operand) {
        return this.compare(operand) === 0;
    };
    TinyNum.prototype.eq = TinyNum.prototype.equals = LargeNum.prototype.eq = LargeNum.prototype.equals;

    LargeNum.prototype.notEquals = function (operand) {
        return this.compare(operand) !== 0;
    };
    TinyNum.prototype.neq = TinyNum.prototype.notEquals = LargeNum.prototype.neq = LargeNum.prototype.notEquals;

    // Relational Operators
    LargeNum.prototype.isGreaterThan = function (operand) { // Renamed greater to isGreaterThan
        return this.compare(operand) > 0;
    };
    TinyNum.prototype.gt = TinyNum.prototype.isGreaterThan = LargeNum.prototype.gt = LargeNum.prototype.isGreaterThan;

    LargeNum.prototype.isLessThan = function (operand) { // Renamed lesser to isLessThan
        return this.compare(operand) < 0;
    };
    TinyNum.prototype.lt = TinyNum.prototype.isLessThan = LargeNum.prototype.lt = LargeNum.prototype.isLessThan;

    LargeNum.prototype.isGreaterThanOrEqualTo = function (operand) { // Renamed greaterOrEquals to isGreaterThanOrEqualTo
        return this.compare(operand) >= 0;
    };
    TinyNum.prototype.geq = TinyNum.prototype.isGreaterThanOrEqualTo = LargeNum.prototype.geq = LargeNum.prototype.isGreaterThanOrEqualTo;

    LargeNum.prototype.isLessThanOrEqualTo = function (operand) { // Renamed lesserOrEquals to isLessThanOrEqualTo
        return this.compare(operand) <= 0;
    };
    TinyNum.prototype.leq = TinyNum.prototype.isLessThanOrEqualTo = LargeNum.prototype.leq = LargeNum.prototype.isLessThanOrEqualTo;

    // --- Property Checks ---
    LargeNum.prototype.isEven = function () {
        return (this.chunkStore[0] & 1) === 0; // Check least significant chunk.
    };
    TinyNum.prototype.isEven = function () {
        return (this.chunkStore & 1) === 0;
    };

    LargeNum.prototype.isOdd = function () {
        return (this.chunkStore[0] & 1) === 1;
    };
    TinyNum.prototype.isOdd = function () {
        return (this.chunkStore & 1) === 1;
    };

    LargeNum.prototype.isPositive = function () {
        return !this.isNegativeFlag;
    };
    TinyNum.prototype.isPositive = function () {
        return this.chunkStore > 0;
    };

    LargeNum.prototype.isNegative = function () {
        return this.isNegativeFlag;
    };
    TinyNum.prototype.isNegative = function () {
        return this.chunkStore < 0;
    };

    LargeNum.prototype.isUnit = function () {
        // A LargeNum is only a unit if its chunk array is [1] and it's positive/negative.
        return this.chunkStore.length === 1 && this.chunkStore[0] === 1;
    };
    TinyNum.prototype.isUnit = function () {
        return Math.abs(this.chunkStore) === 1;
    };

    LargeNum.prototype.isZero = function () {
        return this.chunkStore.length === 1 && this.chunkStore[0] === 0;
    };
    TinyNum.prototype.isZero = function () {
        return this.chunkStore === 0;
    };

    LargeNum.prototype.isDivisibleBy = function (operand) {
        const otherNum = parseValueAsNumVal(operand);
        const otherVal = otherNum.chunkStore;

        if (otherVal === 0) return false; // Cannot divide by zero.
        if (otherVal === 1) return true; // Any number is divisible by 1.
        if (otherVal === 2) return this.isEven(); // Optimized check for divisibility by 2.

        return this.getRemainder(otherNum).equals(NumVal[0]);
    };
    TinyNum.prototype.isDivisibleBy = LargeNum.prototype.isDivisibleBy;

    // --- Primality Tests ---
    /**
     * Performs a quick check for basic primality for small numbers.
     * @param {NumVal} num - The number to check.
     * @returns {boolean|undefined} True if prime, false if composite, undefined if more tests are needed.
     */
    function checkBasicPrimality(num) { // Renamed isBasicPrime to checkBasicPrimality
        const absNum = num.getAbsoluteValue();
        if (absNum.isUnit()) return false;
        if (absNum.equals(2) || absNum.equals(3) || absNum.equals(5)) return true;
        if (absNum.isEven() || absNum.isDivisibleBy(3) || absNum.isDivisibleBy(5)) return false;
        if (absNum.isLessThan(25)) return true; // Primes 7, 11, 13, 17, 19, 23 fall here.
        return unspecifiedValue; // Need more advanced tests.
    }

    LargeNum.prototype.isPrime = function () {
        const basicCheckResult = checkBasicPrimality(this);
        if (basicCheckResult !== unspecifiedValue) return basicCheckResult;

        const num = this.getAbsoluteValue();
        const numMinusOne = num.previous();
        const millerRabinBases = [2, 3, 5, 7, 11, 13, 17, 19]; // Fixed small prime bases.

        let d = numMinusOne; // d such that n-1 = d * 2^s and d is odd.
        let s = 0;
        while (d.isEven()) {
            d = d.divide(2);
            s++;
        }

        // Miller-Rabin primality test.
        for (let i = 0; i < millerRabinBases.length; i++) {
            const a = NumVal(millerRabinBases[i]);
            // If a >= n, skip this base.
            if (a.isGreaterThanOrEqualTo(num)) continue;

            let x = a.modularExponentiation(d, num); // x = a^d mod n

            if (x.equals(NumVal[1]) || x.equals(numMinusOne)) continue; // Check conditions for primality.

            let isCompositeWitness = true;
            for (let j = 0; j < s - 1; j++) {
                x = x.square().getRemainder(num);
                if (x.equals(numMinusOne)) {
                    isCompositeWitness = false;
                    break;
                }
            }
            if (isCompositeWitness) return false; // Found a strong witness for compositeness.
        }
        return true; // Passed all checks, is likely prime.
    };
    TinyNum.prototype.isPrime = LargeNum.prototype.isPrime;

    LargeNum.prototype.isProbablePrime = function (iterations) {
        const basicCheckResult = checkBasicPrimality(this);
        if (basicCheckResult !== unspecifiedValue) return basicCheckResult;

        const num = this.getAbsoluteValue();
        const numMinusOne = num.previous();
        const numIterations = iterations === unspecifiedValue ? 5 : iterations;

        for (let i = 0; i < numIterations; i++) {
            const a = NumVal.randomBetween(NumVal[2], numMinusOne); // Random base a.
            if (!a.modularExponentiation(numMinusOne, num).isUnit()) { // Check a^(n-1) === 1 (mod n)
                return false; // Definitely composite by Fermat's Little Theorem.
            }
        }
        return true; // Probable prime.
    };
    TinyNum.prototype.isProbablePrime = LargeNum.prototype.isProbablePrime;

    // --- Modular Inverse ---
    LargeNum.prototype.getModularInverse = function (modulus) { // Renamed modInv to getModularInverse
        let t = NumVal.zero;
        let newT = NumVal.one;
        let r = parseValueAsNumVal(modulus);
        let newR = this.getAbsoluteValue();

        let quotient, lastT, lastR;

        // Extended Euclidean algorithm.
        while (!newR.isZero()) {
            quotient = r.divide(newR);
            lastT = t;
            lastR = r;

            t = newT;
            r = newR;

            newT = lastT.subtract(quotient.multiply(newT));
            newR = lastR.subtract(quotient.multiply(newR));
        }

        if (!r.equals(NumVal[1])) {
            throw new Error(`Numbers ${this.toString()} and ${modulus.toString()} are not coprime; modular inverse does not exist.`);
        }

        // Adjust result to be positive and within modulus.
        if (t.isNegative()) {
            t = t.add(modulus);
        }

        if (this.isNegative()) {
            // If original number was negative, inverse needs adjustment.
            return t.negate();
        }
        return t;
    };
    TinyNum.prototype.getModularInverse = LargeNum.prototype.getModularInverse;

    // --- Increment/Decrement ---
    LargeNum.prototype.increment = function () { // Renamed next to increment
        if (this.isNegativeFlag) {
            // e.g., -5.increment() -> -4. This is like adding 1 to -5.
            return new LargeNum(subtractSmallFromChunkArray(this.chunkStore, 1, this.isNegativeFlag).chunkStore, this.isNegativeFlag);
        }
        return new LargeNum(addSmallCarryToChunkArray(this.chunkStore, 1), this.isNegativeFlag);
    };

    TinyNum.prototype.increment = function () { // Renamed next to increment
        const val = this.chunkStore;
        if (val + 1 < MAX_SAFE_JS_INT) {
            return new TinyNum(val + 1);
        }
        // If overflow, convert to LargeNum.
        return new LargeNum(MAX_SAFE_JS_INT_ARRAY, false);
    };

    LargeNum.prototype.decrement = function () { // Renamed prev to decrement
        if (this.isNegativeFlag) {
            // e.g., -5.decrement() -> -6. This is like adding 1 to abs(-5) and keeping negative sign.
            return new LargeNum(addSmallCarryToChunkArray(this.chunkStore, 1), true);
        }
        return subtractSmallFromChunkArray(this.chunkStore, 1, this.isNegativeFlag);
    };

    TinyNum.prototype.decrement = function () { // Renamed prev to decrement
        const val = this.chunkStore;
        if (val - 1 > -MAX_SAFE_JS_INT) {
            return new TinyNum(val - 1);
        }
        // If underflow, convert to LargeNum.
        return new LargeNum(MAX_SAFE_JS_INT_ARRAY, true);
    };

    // --- Bitwise Operations Helpers ---
    const powersOfTwo = [1];
    while (2 * powersOfTwo[powersOfTwo.length - 1] <= CHUNK_SIZE) {
        powersOfTwo.push(2 * powersOfTwo[powersOfTwo.length - 1]);
    }
    const numPowersOf2 = powersOfTwo.length;
    const largestPowerOf2InChunk = powersOfTwo[numPowersOf2 - 1]; // Largest power of 2 <= CHUNK_SIZE.

    /**
     * Checks if a given shift amount is small enough to be handled directly.
     * @param {number|string|NumVal} shiftAmt - The shift amount.
     * @returns {boolean} True if the shift amount is small.
     */
    function isShiftAmountSmall(shiftAmt) { // Renamed shift_isSmall to isShiftAmountSmall
        return (typeof shiftAmt === "number" || typeof shiftAmt === "string") && +Math.abs(shiftAmt) <= CHUNK_SIZE ||
            (shiftAmt instanceof LargeNum && shiftAmt.chunkStore.length <= 1);
    }

    // --- Bitwise Shift Left ---
    LargeNum.prototype.shiftLeft = function (shiftAmount) {
        if (!isShiftAmountSmall(shiftAmount)) {
            throw new Error(`Shift amount '${String(shiftAmount)}' is too large for efficient shifting.`);
        }
        let numShift = +shiftAmount;
        if (numShift < 0) return this.shiftRight(-numShift); // Negative shift left is shift right.

        let currentResult = this;
        if (currentResult.isZero()) return currentResult;

        // Repeatedly multiply by largestPowerOf2InChunk for large shifts.
        while (numShift >= numPowersOf2) {
            currentResult = currentResult.multiply(largestPowerOf2InChunk);
            numShift -= (numPowersOf2 - 1); // Adjust shift amount.
        }
        return currentResult.multiply(powersOfTwo[numShift]);
    };
    TinyNum.prototype.shiftLeft = LargeNum.prototype.shiftLeft;

    // --- Bitwise Shift Right ---
    LargeNum.prototype.shiftRight = function (shiftAmount) {
        if (!isShiftAmountSmall(shiftAmount)) {
            throw new Error(`Shift amount '${String(shiftAmount)}' is too large for efficient shifting.`);
        }
        let numShift = +shiftAmount;
        if (numShift < 0) return this.shiftLeft(-numShift); // Negative shift right is shift left.

        let currentResult = this;
        // Optimization for shifting -1.
        if (currentResult.isNegative() && currentResult.isUnit()) return currentResult;

        let divModPair;
        while (numShift >= numPowersOf2) {
            if (currentResult.isZero()) return currentResult;
            divModPair = performGeneralDivMod(currentResult, NumVal(largestPowerOf2InChunk));
            // Adjust quotient for negative numbers if remainder is non-zero.
            currentResult = divModPair[1].isNegative() ? divModPair[0].decrement() : divModPair[0];
            numShift -= (numPowersOf2 - 1);
        }
        divModPair = performGeneralDivMod(currentResult, NumVal(powersOfTwo[numShift]));
        return divModPair[1].isNegative() ? divModPair[0].decrement() : divModPair[0];
    };
    TinyNum.prototype.shiftRight = LargeNum.prototype.shiftRight;

    /**
     * Generic function to apply a bitwise operation (AND, OR, XOR) to two NumVal objects.
     * Handles two's complement for negative numbers.
     * @param {NumVal} operandX - First operand.
     * @param {NumVal} operandY - Second operand.
     * @param {function(number, number): number} bitwiseOpFn - The bitwise function (e.g., (a,b)=>a&b).
     * @returns {NumVal} The result of the bitwise operation.
     */
    function applyBitwiseOperation(operandX, operandY, bitwiseOpFn) { // Renamed bitwise to applyBitwiseOperation
        const parsedY = parseValueAsNumVal(operandY);

        const xIsNegative = operandX.isNegative();
        const yIsNegative = parsedY.isNegative();

        // Convert to two's complement representation (effectively, ~x for negative x).
        let xRemaining = xIsNegative ? operandX.not() : operandX;
        let yRemaining = yIsNegative ? parsedY.not() : parsedY;

        let xCurrentChunk = 0, yCurrentChunk = 0;
        let xDivMod, yDivMod;
        const resultChunks = [];

        // Process chunks from least significant to most significant.
        while (!xRemaining.isZero() || !yRemaining.isZero()) {
            xDivMod = performGeneralDivMod(xRemaining, NumVal(largestPowerOf2InChunk));
            xCurrentChunk = xDivMod[1].toJSNumber();
            if (xIsNegative) {
                xCurrentChunk = largestPowerOf2InChunk - 1 - xCurrentChunk; // Invert bits for negative.
            }

            yDivMod = performGeneralDivMod(yRemaining, NumVal(largestPowerOf2InChunk));
            yCurrentChunk = yDivMod[1].toJSNumber();
            if (yIsNegative) {
                yCurrentChunk = largestPowerOf2InChunk - 1 - yCurrentChunk; // Invert bits for negative.
            }

            xRemaining = xDivMod[0];
            yRemaining = yDivMod[0];

            resultChunks.push(bitwiseOpFn(xCurrentChunk, yCurrentChunk));
        }

        // Determine the overall sign based on the bitwise operation on the conceptual sign bits.
        const finalSignBit = bitwiseOpFn(xIsNegative ? 1 : 0, yIsNegative ? 1 : 0);
        let reconstructedResult = finalSignBit !== 0 ? NumVal(-1) : NumVal(0);

        // Reconstruct the number from the processed chunks.
        for (let i = resultChunks.length - 1; i >= 0; i--) {
            reconstructedResult = reconstructedResult.multiply(largestPowerOf2InChunk).add(NumVal(resultChunks[i]));
        }
        return reconstructedResult;
    }

    // --- Bitwise NOT ---
    LargeNum.prototype.not = function () {
        // Bitwise NOT of x is equivalent to -x - 1.
        return this.negate().decrement();
    };
    TinyNum.prototype.not = LargeNum.prototype.not;

    // --- Bitwise AND ---
    LargeNum.prototype.and = function (operand) {
        return applyBitwiseOperation(this, operand, (a, b) => a & b);
    };
    TinyNum.prototype.and = LargeNum.prototype.and;

    // --- Bitwise OR ---
    LargeNum.prototype.or = function (operand) {
        return applyBitwiseOperation(this, operand, (a, b) => a | b);
    };
    TinyNum.prototype.or = LargeNum.prototype.or;

    // --- Bitwise XOR ---
    LargeNum.prototype.xor = function (operand) {
        return applyBitwiseOperation(this, operand, (a, b) => a ^ b);
    };
    TinyNum.prototype.xor = LargeNum.prototype.xor;

    // Helper for rough Least Significant Bit (LSB) calculation.
    const LOBMASK_JS_NUMBER = 1 << 30; // Mask for JS number LOB.
    const LOBMASK_LARGE_NUMBER = (CHUNK_SIZE & -CHUNK_SIZE) * (CHUNK_SIZE & -CHUNK_SIZE) | LOBMASK_JS_NUMBER;

    /**
     * Calculates a rough Least Significant Bit (LSB) value, used in GCD.
     * @param {NumVal} num - The number.
     * @returns {number} A rough LSB value.
     */
    function getRoughLSB(num) { // Renamed roughLOB to getRoughLSB
        const val = num.chunkStore;
        // If TinyNum, use JS bitwise. If LargeNum, use first chunk.
        const x = typeof val === "number" ? val | LOBMASK_JS_NUMBER : val[0] + (val[1] || 0) * CHUNK_SIZE | LOBMASK_LARGE_NUMBER;
        return x & -x; // Standard LSB trick.
    }

    /**
     * Computes the integer logarithm base 2 of a NumVal.
     * @param {NumVal} value - The number.
     * @param {NumVal} base - The base (e.g., NumVal(2)).
     * @returns {{power: NumVal, exponent: number}} Object with closest power of base and its exponent.
     */
    function computeIntegerLogarithm(value, base) { // Renamed integerLogarithm
        if (base.compareTo(value) > 0) { // Base case: base > value, exponent is 0.
            return { power: NumVal(1), exponent: 0 };
        }

        const tempResult = computeIntegerLogarithm(value, base.square());
        const p = tempResult.power;
        const e = tempResult.exponent;

        const testProduct = p.multiply(base);
        return testProduct.compareTo(value) <= 0 ? { power: testProduct, exponent: e * 2 + 1 } : { power: p, exponent: e * 2 };
    }

    LargeNum.prototype.bitLength = function () {
        let num = this;
        // For negative numbers, bit length is typically defined as for abs(n)-1.
        if (num.isNegative()) {
            num = num.negate().decrement();
        }
        if (num.isZero()) {
            return NumVal(0);
        }
        return NumVal(computeIntegerLogarithm(num, NumVal(2)).exponent).add(NumVal(1));
    };
    TinyNum.prototype.bitLength = LargeNum.prototype.bitLength;

    // --- Utility Functions ---
    /**
     * Returns the maximum of two NumVal objects.
     * @param {NumVal|number|string} val1 - First number.
     * @param {NumVal|number|string} val2 - Second number.
     * @returns {NumVal} The larger number.
     */
    function findMaximum(val1, val2) { // Renamed max to findMaximum
        const num1 = parseValueAsNumVal(val1);
        const num2 = parseValueAsNumVal(val2);
        return num1.isGreaterThan(num2) ? num1 : num2;
    }

    /**
     * Returns the minimum of two NumVal objects.
     * @param {NumVal|number|string} val1 - First number.
     * @param {NumVal|number|string} val2 - Second number.
     * @returns {NumVal} The smaller number.
     */
    function findMinimum(val1, val2) { // Renamed min to findMinimum
        const num1 = parseValueAsNumVal(val1);
        const num2 = parseValueAsNumVal(val2);
        return num1.isLessThan(num2) ? num1 : num2;
    }

    /**
     * Computes the Greatest Common Divisor (GCD) of two NumVal objects using binary GCD algorithm.
     * @param {NumVal|number|string} val1 - First number.
     * @param {NumVal|number|string} val2 - Second number.
     * @returns {NumVal} The GCD.
     */
    function computeGCD(val1, val2) { // Renamed gcd to computeGCD
        let numA = parseValueAsNumVal(val1).getAbsoluteValue();
        let numB = parseValueAsNumVal(val2).getAbsoluteValue();

        if (numA.equals(numB)) return numA;
        if (numA.isZero()) return numB;
        if (numB.isZero()) return numA;

        let commonPowerOfTwoFactor = NumVal[1];
        let tempSwap;

        // Extract common factors of 2.
        while (numA.isEven() && numB.isEven()) {
            const lsbVal = Math.min(getRoughLSB(numA), getRoughLSB(numB));
            const divisor = NumVal(lsbVal);
            numA = numA.divide(divisor);
            numB = numB.divide(divisor);
            commonPowerOfTwoFactor = commonPowerOfTwoFactor.multiply(divisor);
        }

        // Remove all factors of 2 from numA.
        while (numA.isEven()) {
            numA = numA.divide(NumVal(getRoughLSB(numA)));
        }

        // Main binary GCD loop (Euclidean algorithm variant).
        do {
            // Remove all factors of 2 from numB.
            while (numB.isEven()) {
                numB = numB.divide(NumVal(getRoughLSB(numB)));
            }
            // Ensure numA <= numB.
            if (numA.isGreaterThan(numB)) {
                tempSwap = numB;
                numB = numA;
                numA = tempSwap;
            }
            numB = numB.subtract(numA);
        } while (!numB.isZero());

        return commonPowerOfTwoFactor.isUnit() ? numA : numA.multiply(commonPowerOfTwoFactor);
    }

    /**
     * Computes the Least Common Multiple (LCM) of two NumVal objects.
     * @param {NumVal|number|string} val1 - First number.
     * @param {NumVal|number|string} val2 - Second number.
     * @returns {NumVal} The LCM.
     */
    function computeLCM(val1, val2) { // Renamed lcm to computeLCM
        const numA = parseValueAsNumVal(val1).getAbsoluteValue();
        const numB = parseValueAsNumVal(val2).getAbsoluteValue();
        // LCM(a, b) = (|a * b|) / GCD(a, b)
        return numA.divide(computeGCD(numA, numB)).multiply(numB);
    }

    /**
     * Generates a random NumVal between two given NumVal objects (inclusive).
     * @param {NumVal|number|string} lowerBound - The lower bound.
     * @param {NumVal|number|string} upperBound - The upper bound.
     * @returns {NumVal} A random NumVal.
     */
    function generateRandomNumValBetween(lowerBound, upperBound) { // Renamed randBetween to generateRandomNumValBetween
        const lower = findMinimum(lowerBound, upperBound);
        const higher = findMaximum(lowerBound, upperBound);
        const range = higher.subtract(lower).add(1);

        if (range.isSmall) {
            // If the range fits within a JS number, use native Math.random.
            return lower.add(Math.floor(Math.random() * range.chunkStore));
        }

        const rangeChunks = range.chunkStore;
        const maxChunkIdx = rangeChunks.length - 1;
        const randomChunks = [];
        let isBoundByRange = true; // Flag to indicate if we're still restricted by the range's digits.

        // Generate random chunks from most significant to least significant.
        for (let i = maxChunkIdx; i >= 0; i--) {
            const upperLimit = isBoundByRange ? rangeChunks[i] : CHUNK_SIZE;
            const digit = truncateNumber(Math.random() * upperLimit);
            randomChunks.unshift(digit); // Add to the beginning (least significant).
            if (digit < upperLimit) {
                isBoundByRange = false; // Once a digit is smaller than the range's corresponding digit, subsequent digits can be anything up to CHUNK_SIZE-1.
            }
        }
        trimChunkArray(randomChunks); // Remove any leading zeros.

        const randomNum = convertChunkArrayToJsNum(randomChunks);
        return lower.add(typeof randomNum === "number" ? new TinyNum(randomNum) : new LargeNum(randomNum, false));
    }

    /**
     * Parses a string representation of a number in a given base.
     * @param {string} strValue - The string to parse.
     * @param {number|NumVal} base - The radix.
     * @returns {NumVal} The parsed number.
     */
    const parseStringInBase = function (strValue, base) { // Renamed parseBase to parseStringInBase
        const strLen = strValue.length;
        const absBase = Math.abs(base);

        // Basic validation of digits against the given base.
        for (let i = 0; i < strLen; i++) {
            const char = strValue[i].toLowerCase();
            if (char === "-") continue; // Skip negative sign.
            if (/[a-z0-9]/.test(char)) {
                let digitVal;
                if (/[0-9]/.test(char)) {
                    digitVal = +char;
                } else {
                    digitVal = char.charCodeAt(0) - 87; // 'a' is 10, 'b' is 11, etc.
                }
                if (digitVal >= absBase) {
                    if (char === "1" && absBase === 1) continue; // Special case for base 1.
                    throw new Error(`Character '${char}' is not a valid digit in base ${base}.`);
                }
            } else if (char === '<') { // Handle custom multi-digit symbols like "<10>"
                let startIdx = i;
                do { i++; } while (i < strLen && strValue[i] !== '>');
                if (i === strLen) throw new Error(`Unclosed custom digit symbol in base ${base} string.`);
                const customDigitValue = +strValue.slice(startIdx + 1, i);
                if (isNaN(customDigitValue) || customDigitValue >= absBase) {
                    throw new Error(`Custom digit '<${strValue.slice(startIdx + 1, i)}>' is not valid in base ${base}.`);
                }
            } else {
                throw new Error(`Character '${char}' is not a valid character for base ${base} parsing.`);
            }
        }

        // Optimization for common small bases (2-36) and numbers that might fit in JS numbers.
        if (base >= 2 && base <= 36) {
            if (strLen <= LOG_MAX_SAFE_JS_INT / Math.log(base)) {
                const parsedJsInt = parseInt(strValue, base);
                if (!isNaN(parsedJsInt)) {
                    return new TinyNum(parsedJsInt);
                }
                throw new Error(`Invalid number format for base ${base}: ${strValue}`);
            }
        }

        // General case for large numbers or arbitrary bases.
        const baseNumVal = parseValueAsNumVal(base);
        const digitNumVals = [];
        const isNegative = strValue[0] === "-";
        for (let i = isNegative ? 1 : 0; i < strValue.length; i++) {
            const char = strValue[i].toLowerCase();
            const charCode = char.charCodeAt(0);
            if (charCode >= 48 && charCode <= 57) { // '0'-'9'
                digitNumVals.push(parseValueAsNumVal(char));
            } else if (charCode >= 97 && charCode <= 122) { // 'a'-'z'
                digitNumVals.push(parseValueAsNumVal(charCode - 87));
            } else if (char === "<") { // Custom multi-digit symbols.
                let startIdx = i;
                do { i++; } while (strValue[i] !== ">");
                digitNumVals.push(parseValueAsNumVal(strValue.slice(startIdx + 1, i)));
            } else {
                throw new Error(`Unexpected character '${char}' during base parsing.`);
            }
        }
        return convertDigitArrayToBaseNumVal(digitNumVals, baseNumVal, isNegative);
    };

    /**
     * Converts an array of digit NumVal objects in a given base to a single NumVal.
     * @param {NumVal[]} digits - Array of digit NumVal objects.
     * @param {NumVal} base - The base of the number.
     * @param {boolean} isNegative - True if the final number should be negative.
     * @returns {NumVal} The resulting NumVal.
     */
    function convertDigitArrayToBaseNumVal(digits, base, isNegative) { // Renamed parseBaseFromArray
        let result = NumVal[0];
        let currentPower = NumVal[1];

        // Process digits from right to left (least significant to most significant).
        for (let i = digits.length - 1; i >= 0; i--) {
            result = result.add(digits[i].times(currentPower));
            currentPower = currentPower.times(base);
        }
        return isNegative ? result.negate() : result;
    }

    /**
     * Converts a single digit (0-35) to its string representation or custom format.
     * @param {number} digit - The digit.
     * @returns {string} The string representation.
     */
    function digitToCharString(digit) { // Renamed stringify to digitToCharString
        if (digit >= 0 && digit <= 35) {
            return "0123456789abcdefghijklmnopqrstuvwxyz".charAt(digit);
        }
        return `<${digit}>`; // For digits > 35, use custom format.
    }

    /**
     * Converts a NumVal to an array of digits in a specified base.
     * @param {NumVal} num - The number to convert.
     * @param {number|NumVal} base - The target base.
     * @returns {{value: number[], isNegative: boolean}} Object with digit array and sign.
     */
    function convertNumValToDigitArray(num, base) { // Renamed toBase to convertNumValToDigitArray
        const targetBase = ArithmX(base);

        if (targetBase.isZero()) {
            if (num.isZero()) return { value: [0], isNegative: false };
            throw new Error("Cannot convert nonzero numbers to base 0.");
        }
        // Special handling for base -1 (complex representation).
        if (targetBase.equals(-1)) {
            if (num.isZero()) return { value: [0], isNegative: false };
            const resultDigits = [];
            let current = num;
            while (!current.isZero()) {
                const [q, r] = current.divmod(targetBase);
                if (r.isNegative()) {
                    resultDigits.push(targetBase.minus(r).getAbsoluteValue().toJSNumber());
                    current = q.increment();
                } else {
                    resultDigits.push(r.toJSNumber());
                    current = q;
                }
            }
            return { value: resultDigits.reverse(), isNegative: false };
        }

        let isResultNegative = false;
        let workingNum = num;
        // If number is negative and base is positive, result will be negative.
        if (num.isNegative() && targetBase.isPositive()) {
            isResultNegative = true;
            workingNum = num.getAbsoluteValue();
        }

        if (targetBase.equals(1)) {
            if (num.isZero()) return { value: [0], isNegative: false };
            // Base 1: N is represented by N ones.
            const onesArray = Array(workingNum.toJSNumber()).fill(1);
            return { value: onesArray, isNegative: isResultNegative };
        }

        const outputDigits = [];
        let divmodPair;
        // Repeatedly divide by base and collect remainders.
        while (workingNum.isNegative() || workingNum.compareAbsolute(targetBase) >= 0) {
            divmodPair = workingNum.divmod(targetBase);
            workingNum = divmodPair.quotient;
            let digit = divmodPair.remainder;
            if (digit.isNegative()) {
                digit = targetBase.minus(digit).getAbsoluteValue();
                workingNum = workingNum.increment();
            }
            outputDigits.push(digit.toJSNumber());
        }
        outputDigits.push(workingNum.toJSNumber()); // Add the last quotient.
        return { value: outputDigits.reverse(), isNegative: isResultNegative };
    }

    /**
     * Converts a NumVal to its string representation in a given base.
     * @param {NumVal} num - The number to convert.
     * @param {number} base - The target base.
     * @returns {string} The string representation.
     */
    function convertNumValToBaseString(num, base) { // Renamed toBaseString to convertNumValToBaseString
        const converted = convertNumValToDigitArray(num, base);
        const signPrefix = converted.isNegative ? "-" : "";
        return signPrefix + converted.value.map(digitToCharString).join("");
    }

    // --- Output and Serialization Methods ---
    LargeNum.prototype.toDigitArray = function (radix) { // Renamed toArray to toDigitArray
        return convertNumValToDigitArray(this, radix);
    };
    TinyNum.prototype.toDigitArray = function (radix) { // Renamed toArray to toDigitArray
        return convertNumValToDigitArray(this, radix);
    };

    LargeNum.prototype.toString = function (radix) {
        if (radix === unspecifiedValue) radix = 10;
        if (radix !== 10) return convertNumValToBaseString(this, radix);

        const chunkArr = this.chunkStore;
        const len = chunkArr.length;

        // Start with the most significant chunk.
        let stringRep = String(chunkArr[len - 1]);
        const zeroPadString = "0000000"; // For CHUNK_DIGITS = 7.

        // Append remaining chunks, padding with leading zeros as necessary.
        for (let i = len - 2; i >= 0; i--) {
            const chunkString = String(chunkArr[i]);
            stringRep += zeroPadString.slice(chunkString.length) + chunkString;
        }

        const signPrefix = this.isNegativeFlag ? "-" : "";
        return signPrefix + stringRep;
    };

    TinyNum.prototype.toString = function (radix) {
        if (radix === unspecifiedValue) radix = 10;
        if (radix !== 10) return convertNumValToBaseString(this, radix);
        return String(this.chunkStore);
    };

    // JSON serialization for interoperability.
    LargeNum.prototype.toJSON = TinyNum.prototype.toJSON = function () {
        return this.toString();
    };

    // ValueOf and toJSNumber for implicit type conversion and native numerical operations.
    LargeNum.prototype.valueOf = function () {
        return parseInt(this.toString(), 10);
    };
    LargeNum.prototype.toJSNumber = LargeNum.prototype.valueOf;

    TinyNum.prototype.valueOf = function () {
        return this.chunkStore;
    };
    TinyNum.prototype.toJSNumber = TinyNum.prototype.valueOf;

    /**
     * Parses a string value into a NumVal object.
     * Handles scientific notation and validates integer format.
     * @param {string} strValue - The string to parse.
     * @returns {NumVal} The parsed NumVal.
     */
    function parseStringValue(strValue) { // Renamed parseStringValue
        // Quick check for small precise integers.
        if (isJsNumberPrecise(+strValue)) {
            const num = +strValue;
            if (num === truncateNumber(num)) { // Ensure it's an integer.
                return new TinyNum(num);
            }
            throw new Error(`Invalid integer: '${strValue}' contains a fractional part.`);
        }

        let isNegative = strValue[0] === "-";
        let tempStr = isNegative ? strValue.slice(1) : strValue;

        // Handle scientific notation (e.g., "1.23e5").
        const scientificParts = tempStr.split(/e/i);
        if (scientificParts.length > 2) {
            throw new Error(`Invalid integer: '${strValue}' has multiple 'e' characters.`);
        }
        if (scientificParts.length === 2) {
            let exponentPart = scientificParts[1];
            if (exponentPart[0] === "+") exponentPart = exponentPart.slice(1);
            const exponentVal = +exponentPart;

            if (exponentVal !== truncateNumber(exponentVal) || !isJsNumberPrecise(exponentVal)) {
                throw new Error(`Invalid integer: exponent '${exponentVal}' in '${strValue}' is not a valid integer.`);
            }
            if (exponentVal < 0) {
                throw new Error(`Invalid integer: negative exponents are not supported for integer parsing in '${strValue}'.`);
            }

            let mainPart = scientificParts[0];
            const decimalPointIdx = mainPart.indexOf(".");
            if (decimalPointIdx >= 0) {
                exponentVal -= (mainPart.length - decimalPointIdx - 1);
                mainPart = mainPart.slice(0, decimalPointIdx) + mainPart.slice(decimalPointIdx + 1);
            }
            if (exponentVal < 0) {
                throw new Error(`Invalid integer: resulting number has fractional part after exponent adjustment in '${strValue}'.`);
            }
            tempStr = mainPart + "0".repeat(exponentVal); // Append zeros.
        }

        // Validate that the string contains only digits.
        if (!/^([0-9][0-9]*)$/.test(tempStr)) {
            throw new Error(`Invalid integer: '${tempStr}' contains non-digit characters.`);
        }

        const chunkArray = [];
        let currentMaxIdx = tempStr.length;
        const chunkSize = CHUNK_DIGITS;
        let currentMinIdx = currentMaxIdx - chunkSize;

        // Slice string into chunks from right to left.
        while (currentMaxIdx > 0) {
            if (currentMinIdx < 0) currentMinIdx = 0;
            chunkArray.push(parseInt(tempStr.slice(currentMinIdx, currentMaxIdx), 10));
            currentMaxIdx = currentMinIdx;
            currentMinIdx -= chunkSize;
        }
        trimChunkArray(chunkArray);
        return new LargeNum(chunkArray, isNegative);
    }

    /**
     * Parses a JavaScript number into a NumVal object.
     * @param {number} jsNum - The number to parse.
     * @returns {NumVal} The parsed NumVal.
     */
    function parseNumberValue(jsNum) { // Renamed parseNumberValue
        if (isJsNumberPrecise(jsNum)) {
            if (jsNum !== truncateNumber(jsNum)) {
                throw new Error(`'${jsNum}' is not an integer.`);
            }
            return new TinyNum(jsNum);
        }
        // If it's a large JS number (or has precision issues), convert to string and parse.
        return parseStringValue(jsNum.toString());
    }

    /**
     * Parses any input value (number, string, or existing NumVal) into a NumVal object.
     * @param {number|string|NumVal} value - The value to parse.
     * @returns {NumVal} The parsed NumVal.
     */
    function parseValueAsNumVal(value) { // Renamed parseValue to parseValueAsNumVal
        if (typeof value === "number") {
            return parseNumberValue(value);
        }
        if (typeof value === "string") {
            return parseStringValue(value);
        }
        // If it's already a NumVal object, return it directly.
        return value;
    }

    // Pre-create and cache small integer instances for performance.
    for (let i = 0; i < 1000; i++) {
        NumVal[i] = new TinyNum(i);
        if (i > 0) NumVal[-i] = new TinyNum(-i);
    }

    // Expose common constants and utility functions.
    NumVal.one = NumVal[1];
    NumVal.zero = NumVal[0];
    NumVal.minusOne = NumVal[-1];
    NumVal.max = findMaximum;
    NumVal.min = findMinimum;
    NumVal.gcd = computeGCD;
    NumVal.lcm = computeLCM;
    NumVal.isInstance = function (obj) {
        return obj instanceof LargeNum || obj instanceof TinyNum;
    };
    NumVal.randomBetween = generateRandomNumValBetween; // Renamed randBetween
    NumVal.fromDigitArray = function (digits, base, isNegative) { // Renamed fromArray
        return convertDigitArrayToBaseNumVal(digits.map(parseValueAsNumVal), parseValueAsNumVal(base || 10), isNegative);
    };

    return NumVal;
}(); // Self-executing anonymous function.

// ------------------- Input Reading Utility -------------------
let getInputStream = (function () { // Renamed GET to getInputStream
    /**
     * Factory function to create an input reader instance.
     * @param {string} sourceText - The entire input as a single string.
     * @returns {InputReader} A new InputReader instance.
     */
    function createInputReader(sourceText) { // Renamed f to createInputReader
        return new InputReader(sourceText);
    }

    /**
     * @class InputReader
     * @description Manages reading tokens and lines from a multi-line string input.
     * @param {string} rawInputText - The raw input string.
     */
    function InputReader(rawInputText) { // Renamed g to InputReader
        this._rawInputLines = rawInputText.trim().split("\n"); // Renamed _s to _rawInputLines
        this._currentLineIndex = 0; // Renamed _y to _currentLineIndex
        this._bufferedTokens = []; // Added to store tokens from the current line.
    }

    InputReader.prototype.readNextToken = function (asRawString = false) { // Renamed a to readNextToken, added default param
        // If no tokens are buffered, read the next line and split it.
        while (this._bufferedTokens.length === 0) {
            if (this._currentLineIndex >= this._rawInputLines.length) {
                throw new Error("End of input stream reached. No more tokens to read.");
            }
            // Split by one or more whitespace characters, filter out empty strings, and reverse for efficient popping.
            const lineTokens = this._rawInputLines[this._currentLineIndex++].split(/\s+/).filter(Boolean);
            if (lineTokens.length > 0) {
                this._bufferedTokens = lineTokens.reverse();
            }
        }
        const token = this._bufferedTokens.pop();
        return asRawString ? token : parseFloat(token); // Use parseFloat for robust number conversion.
    };

    InputReader.prototype.readLineTokens = function (asRawString = false) { // Renamed l to readLineTokens
        if (this._currentLineIndex >= this._rawInputLines.length) {
            throw new Error("End of input stream reached. No more lines to read.");
        }
        const line = this._rawInputLines[this._currentLineIndex++].split(/\s+/).filter(Boolean);
        return asRawString ? line : line.map(parseFloat);
    };

    InputReader.prototype.readMultipleLinesAsMatrix = function (numRows, asRawString = false) { // Renamed m to readMultipleLinesAsMatrix
        if (this._currentLineIndex + numRows > this._rawInputLines.length) {
            throw new Error(`Insufficient lines remaining to read a matrix of ${numRows} rows.`);
        }
        const matrixRaw = this._rawInputLines.slice(this._currentLineIndex, this._currentLineIndex + numRows);
        this._currentLineIndex += numRows; // Advance line index.

        return matrixRaw.map(row => {
            const rowTokens = row.split(/\s+/).filter(Boolean);
            return asRawString ? rowTokens : rowTokens.map(parseFloat);
        });
    };

    InputReader.prototype.readLinesToNumberArray = function (numLines, asRawString = false) { // Renamed r to readLinesToNumberArray
        if (this._currentLineIndex + numLines > this._rawInputLines.length) {
            throw new Error(`Insufficient lines remaining to read ${numLines} lines as numbers.`);
        }
        const lines = this._rawInputLines.slice(this._currentLineIndex, this._currentLineIndex + numLines);
        this._currentLineIndex += numLines;
        return asRawString ? lines : lines.map(parseFloat);
    };

    return createInputReader;
})();

// ------------------- Main Program Logic -------------------
// Initialize the input reader by reading from standard input.
const standardInputReader = getInputStream(require("fs").readFileSync("/dev/stdin", "utf8")); // Renamed o to standardInputReader

/**
 * Dynamically creates a multi-dimensional array with a specified default value.
 * This is a recursive implementation replacing the original's `eval()`-based one.
 * @param {function|any} defaultValueProvider - A function to generate default values, or a static value.
 * @param {...number} dimensions - The sizes of each dimension.
 * @returns {Array} The initialized multi-dimensional array.
 */
function createMultiDimensionalArray(defaultValueProvider, ...dimensions) { // Renamed xArray to createMultiDimensionalArray
    if (dimensions.length === 0) {
        return typeof defaultValueProvider === 'function' ? defaultValueProvider() : defaultValueProvider;
    }

    const currentDimensionSize = dimensions[0];
    if (currentDimensionSize <= 0 || !Number.isInteger(currentDimensionSize)) {
        throw new Error("Array dimensions must be positive integers.");
    }

    const remainingDimensions = dimensions.slice(1);
    const newArray = new Array(currentDimensionSize);

    for (let i = 0; i < currentDimensionSize; i++) {
        newArray[i] = createMultiDimensionalArray(defaultValueProvider, ...remainingDimensions);
    }
    return newArray;
}

let currentCalculationModulus; // Renamed mod to currentCalculationModulus
const bigNumberFactory = ArithmX; // Renamed bi to bigNumberFactory

/**
 * Performs modular multiplication for JavaScript numbers, avoiding intermediate overflow.
 * This function uses a specialized algorithm to handle products that might exceed
 * JS safe integer limits before the modulo operation, by splitting numbers into 16-bit chunks.
 * @param {number} factor1 - The first number.
 * @param {number} factor2 - The second number.
 * @returns {number} (factor1 * factor2) % currentCalculationModulus.
 */
function modularMultiplySafe(factor1, factor2) { // Renamed abmod to modularMultiplySafe
    // Break down numbers into 16-bit parts to prevent overflow during intermediate products.
    const CHUNK_SIZE_16_BIT = 65536; // 2^16

    let f1High = Math.floor(factor1 / CHUNK_SIZE_16_BIT); // factor1 >> 16
    let f1Low = factor1 & (CHUNK_SIZE_16_BIT - 1); // factor1 & 0xFFFF
    let f2High = Math.floor(factor2 / CHUNK_SIZE_16_BIT); // factor2 >> 16
    let f2Low = factor2 & (CHUNK_SIZE_16_BIT - 1); // factor2 & 0xFFFF

    // Distributive property: (A*2^16 + B) * (C*2^16 + D) = A*C*2^32 + A*D*2^16 + B*C*2^16 + B*D
    // All modulo currentCalculationModulus.
    let term1 = (f1High * f2High) % currentCalculationModulus;
    term1 = (term1 * CHUNK_SIZE_16_BIT) % currentCalculationModulus;
    term1 = (term1 * CHUNK_SIZE_16_BIT) % currentCalculationModulus;

    let term2 = (f1High * f2Low) % currentCalculationModulus;
    term2 = (term2 * CHUNK_SIZE_16_BIT) % currentCalculationModulus;

    let term3 = (f1Low * f2High) % currentCalculationModulus;
    term3 = (term3 * CHUNK_SIZE_16_BIT) % currentCalculationModulus;

    let term4 = (f1Low * f2Low) % currentCalculationModulus;

    // Sum all terms and take modulo.
    let result = (term1 + term2 + term3 + term4) % currentCalculationModulus;
    return result;
}

/**
 * Computes modular exponentiation (base^exponent % currentCalculationModulus) for JS numbers.
 * Uses the binary exponentiation (exponentiation by squaring) method.
 * @param {number} base - The base.
 * @param {number} exponent - The exponent.
 * @returns {number} (base^exponent) % currentCalculationModulus.
 */
function calculateModularPower(base, exponent) { // Renamed powmod to calculateModularPower
    let result = 1;
    let currentBase = base % currentCalculationModulus; // Reduce base initially.

    while (exponent > 0) {
        if (exponent & 1) { // If exponent is odd.
            result = modularMultiplySafe(result, currentBase);
        }
        currentBase = modularMultiplySafe(currentBase, currentBase); // Square the base.
        exponent >>= 1; // Divide exponent by 2 (integer right shift).
    }
    return result;
}

/**
 * The main program logic for solving the problem.
 * Reads input parameters and performs calculations involving large numbers and matrix exponentiation.
 * @returns {number} The final computed result.
 */
function main() {
    // Read input values for L, A, B.
    const inputL = standardInputReader.readNextToken();
    const inputA = standardInputReader.readNextToken();
    const inputB = standardInputReader.readNextToken();

    // Convert L, A, B to arbitrary-precision numbers.
    const largeLimit = bigNumberFactory(inputL); // Renamed l to largeLimit
    const largeStart = bigNumberFactory(inputA); // Renamed a to largeStart
    const largeStep = bigNumberFactory(inputB); // Renamed b to largeStep

    // Read the modulus for matrix operations.
    currentCalculationModulus = standardInputReader.readNextToken(); // Renamed mod

    // The original code re-assigned L, A, B to their number values here.
    // We'll keep their initial number values as separate constants for clarity,
    // as matrix operations use JS numbers.
    const numL = inputL;
    const numA = inputA;
    const numB = inputB;

    // Initialize the result matrix (effectively a 1x3 row vector).
    // The matrix contains JS numbers as per the modular arithmetic functions.
    let currentResultMatrix = [0, 0, 1]; // Renamed ans to currentResultMatrix

    let processedSum = bigNumberFactory(0); // Renamed s to processedSum, initialized to 0.

    // The problem involves iterating through digit lengths (1-18) for numbers.
    const MAX_DIGIT_ITERATIONS = 19;
    for (let digitLength = 1; digitLength < MAX_DIGIT_ITERATIONS; digitLength++) {
        // If the processed sum has already reached or exceeded the limit, we can stop.
        if (processedSum.isGreaterThanOrEqualTo(largeLimit)) {
            break;
        }

        // Calculate `powerOfTenMinusOne = 10^digitLength - 1`.
        // This represents the largest number consisting of `digitLength` nines (e.g., 9, 99, 999).
        const tenToPower = bigNumberFactory(10).toPower(digitLength);
        const currentBlockMaxVal = tenToPower.subtract(1);

        // Calculate `countInBlock = (currentBlockMaxVal - largeStart + largeStep) / largeStep - processedSum`.
        // This determines how many numbers from the arithmetic progression (A, A+B, ...)
        // fall within the current digit length block (up to currentBlockMaxVal),
        // subtracting those already accounted for in previous blocks.
        const numeratorForCount = currentBlockMaxVal.subtract(largeStart).add(largeStep);
        const rawBlockCount = numeratorForCount.divide(largeStep).subtract(processedSum);

        // Ensure the calculated block count is non-negative.
        const effectiveBlockCount = rawBlockCount.isGreaterThan(bigNumberFactory(0)) ? rawBlockCount : bigNumberFactory(0);

        if (effectiveBlockCount.isZero()) {
            continue; // No numbers to add in this block.
        }

        // Adjust block count if adding it would exceed the overall limit `largeLimit`.
        let actualBlockSize = effectiveBlockCount;
        if (processedSum.add(actualBlockSize).isGreaterThan(largeLimit)) {
            actualBlockSize = largeLimit.subtract(processedSum);
        }

        // Prepare the base transformation matrix for this block.
        // The matrix elements are JS numbers, so bigInt results must be converted.
        const tenPowerMod = calculateModularPower(10, digitLength);
        const stepBModulo = largeStep.getRemainder(currentCalculationModulus).toJSNumber();

        const blockTransformationMatrix = [
            [tenPowerMod, 0, 0],
            [1, 1, 0],
            [0, stepBModulo, 1]
        ];

        // Raise the transformation matrix to the power of `actualBlockSize` (using bigInt exponent).
        const matrixPowerResult = matrixModularExponentiation(blockTransformationMatrix, actualBlockSize);

        // Update currentResultMatrix:
        // The original logic updates `ans[0][1]` before multiplication.
        // This corresponds to setting the `sum_of_terms` component based on the `processedSum`
        // *before* applying the transformation for the current block.
        const currentTermSumComponent = largeStep.times(processedSum).add(largeStart).getRemainder(currentCalculationModulus).toJSNumber();
        currentResultMatrix[1] = currentTermSumComponent;

        // Multiply the current result matrix by the block's transformation matrix.
        currentResultMatrix = matrixModularMultiply(currentResultMatrix, matrixPowerResult);

        // Update the total sum of numbers processed.
        processedSum = processedSum.add(actualBlockSize);
    }

    // The final answer is the first element of the result matrix (which is a 1x3 vector).
    return currentResultMatrix[0];
}

/**
 * Computes matrix modular exponentiation (Matrix^Exponent % currentCalculationModulus).
 * @param {number[][]} baseMatrix - The base matrix.
 * @param {ArithmX} exponentNum - The exponent (NumVal object).
 * @returns {number[][]} The resulting matrix.
 */
function matrixModularExponentiation(baseMatrix, exponentNum) { // Renamed matrixPowMod
    const dim = baseMatrix.length;
    // Initialize an identity matrix of the same dimension.
    let resultMatrix = createMultiDimensionalArray(0, dim, dim);
    for (let i = 0; i < dim; i++) {
        resultMatrix[i][i] = 1;
    }

    let currentBase = baseMatrix;
    let currentExponent = exponentNum;

    // Binary exponentiation for matrices.
    while (!currentExponent.isZero()) {
        if (!currentExponent.and(1).isZero()) { // If exponent is odd.
            resultMatrix = matrixModularMultiply(resultMatrix, currentBase);
        }
        currentBase = matrixModularMultiply(currentBase, currentBase); // Square the base matrix.
        currentExponent = currentExponent.divide(2); // Integer division.
    }
    return resultMatrix;
}

/**
 * Multiplies two matrices (A * B) modulo currentCalculationModulus.
 * Handles multiplication of a 1xN vector by an NxN matrix.
 * @param {number[][]|number[]} matrixA - First matrix (or 1D array for vector).
 * @param {number[][]} matrixB - Second matrix.
 * @returns {number[][]|number[]} The product matrix. Returns a 1D array if matrixA was a 1D array.
 */
function matrixModularMultiply(matrixA, matrixB) { // Renamed matrixMultipleMod
    // Normalize matrixA to always be a 2D array for consistent processing.
    const isVectorInput = !Array.isArray(matrixA[0]);
    const normalizedA = isVectorInput ? [matrixA] : matrixA;

    const rowsA = normalizedA.length;
    const colsA = normalizedA[0].length;
    const rowsB = matrixB.length;
    const colsB = matrixB[0].length;

    // Validate matrix dimensions for multiplication.
    if (colsA !== rowsB) {
        throw new Error(`Matrix dimensions incompatible for multiplication: (${rowsA}x${colsA}) * (${rowsB}x${colsB})`);
    }

    const resultRows = rowsA;
    const resultCols = colsB;
    const resultMatrix = createMultiDimensionalArray(0, resultRows, resultCols);

    for (let i = 0; i < resultRows; i++) { // Iterate through rows of the result matrix.
        for (let j = 0; j < resultCols; j++) { // Iterate through columns of the result matrix.
            let sumTerm = 0;
            for (let k = 0; k < colsA; k++) { // Perform dot product.
                sumTerm = (sumTerm + modularMultiplySafe(normalizedA[i][k], matrixB[k][j])) % currentCalculationModulus;
            }
            resultMatrix[i][j] = sumTerm;
        }
    }

    // If the input matrixA was originally a 1D vector, return a 1D vector.
    return isVectorInput ? resultMatrix[0] : resultMatrix;
}

// Execute the main function and print its result to console.
console.log(main());