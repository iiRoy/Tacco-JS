"use strict";

// --- Custom Input Stream Processor ---
/**
 * @class InputScanner
 * @description Utility for parsing input strings line by line and token by token.
 *              Designed to read from a multi-line string source.
 */
class InputScanner {
    /**
     * @private {string[]} inputLines - Array of lines from the input string.
     */
    #inputLines;

    /**
     * @private {number} segmentPointer - Current index within the token array of the active line.
     */
    #segmentPointer;

    /**
     * @private {number} linePointer - Current line index being processed.
     */
    #linePointer;

    /**
     * @private {Function} valueParser - Function to convert token strings to desired types (e.g., Number, BigInt).
     */
    #valueParser;

    /**
     * @private {string[]} currentLineSegments - Cached array of tokens for the current line.
     */
    #currentLineSegments;

    /**
     * Creates an instance of InputScanner.
     * @param {string} sourceString - The multi-line string input.
     * @param {Function} [converter=Number] - An optional function to parse string tokens into a specific type.
     */
    constructor(sourceString, converter = Number) {
        if (typeof sourceString !== 'string') {
            throw new TypeError("Input source must be a string.");
        }
        if (typeof converter !== 'function') {
            console.warn("Provided converter is not a function, defaulting to Number.");
            this.#valueParser = Number;
        } else {
            this.#valueParser = converter;
        }

        this.#inputLines = sourceString.split("\n");
        this.#segmentPointer = 0;
        this.#linePointer = 0;
        this.#currentLineSegments = []; // Initialize as empty
    }

    /**
     * @private
     * @description Fetches and splits the current line into segments if not already done or if line changed.
     * @returns {string[]|null} An array of string segments for the current line, or null if no more lines.
     */
    #fetchCurrentLineSegments() {
        if (this.#linePointer >= this.#inputLines.length) {
            return null; // No more lines
        }
        const activeLineText = this.#inputLines[this.#linePointer];
        if (!activeLineText) {
            // Handle empty or whitespace-only lines by returning an empty array or null
            return [];
        }
        return activeLineText.trim().split(/\s+/); // Split by one or more whitespace characters
    }

    /**
     * Reads and returns the next single token from the input stream.
     * Advances the internal pointers.
     * @returns {any|undefined} The parsed token, or undefined if no more tokens.
     */
    getNextToken() {
        if (this.#linePointer >= this.#inputLines.length) {
            return undefined; // End of input
        }

        if (this.#currentLineSegments.length === 0 || this.#segmentPointer >= this.#currentLineSegments.length) {
            this.#currentLineSegments = this.#fetchCurrentLineSegments();
            this.#segmentPointer = 0; // Reset segment pointer for the new line

            if (this.#currentLineSegments === null) {
                return undefined; // No more lines after attempting to fetch
            }

            // If the line is empty or only whitespace, advance line pointer and try again
            if (this.#currentLineSegments.length === 0) {
                this.#linePointer++;
                return this.getNextToken(); // Recursively call to get token from next line
            }
        }

        const tokenString = this.#currentLineSegments[this.#segmentPointer];
        this.#segmentPointer++;

        // If all segments on the current line have been consumed, prepare for the next line
        if (this.#segmentPointer >= this.#currentLineSegments.length) {
            this.#segmentPointer = 0;
            this.#linePointer++;
            this.#currentLineSegments = []; // Clear segments to force re-fetch for next line
        }

        return this.#valueParser(tokenString);
    }

    /**
     * Reads and returns all tokens from the current line as an array.
     * Advances the line pointer to the next line.
     * @returns {any[]|undefined} An array of parsed tokens for the line, or undefined if no more lines.
     */
    getLineTokens() {
        if (this.#linePointer >= this.#inputLines.length) {
            return undefined; // End of input
        }

        const activeLineText = this.#inputLines[this.#linePointer];
        this.#linePointer++; // Advance line pointer immediately
        this.#segmentPointer = 0; // Reset segment pointer
        this.#currentLineSegments = []; // Clear cached segments

        if (!activeLineText) {
            return []; // Return empty array for empty lines
        }

        const tokens = activeLineText.trim().split(/\s+/);
        return tokens.map(this.#valueParser);
    }
}

// Export for CommonJS compatibility
if (typeof module !== "undefined" && module.exports) {
    module.exports = InputScanner;
}


// --- GrandNumber Library (formerly bigInt) ---
const GrandNumber = (function(undefined) {
    "use strict";

    // Core configuration for the arbitrary-precision arithmetic
    const CHUNK_BASE = 1e7; // Each array element represents a 'chunk' of this magnitude
    const CHUNK_DIGIT_COUNT = 7; // Number of digits in each chunk (log10(CHUNK_BASE))
    const MAX_SAFE_JS_NUM = 9007199254740992; // 2^53 - 1
    const MAX_SAFE_JS_NUM_CHUNKS = decomposeJsNum(MAX_SAFE_JS_NUM);
    const BASE_36_DIGITS = "0123456789abcdefghijklmnopqrstuvwxyz"; // Default alphabet for base conversions

    // Check for native BigInt support
    const HAS_NATIVE_BIGINT = typeof BigInt === "function";

    /**
     * @class AbstractNumber
     * @description Base class for all number types in the GrandNumber system.
     *              Provides a common prototype chain.
     */
    function AbstractNumber(initialValue, baseRadix, customAlphabet, caseSensitive) {
        // Factory pattern: returns appropriate instance based on input
        if (typeof initialValue === "undefined") {
            return GrandNumberFactory.zero;
        }
        if (typeof baseRadix !== "undefined") {
            // If a radix is provided, parse the value from that base
            return +baseRadix === 10 && !customAlphabet ? parseAnyValue(initialValue) : parseArbitraryBaseString(initialValue, baseRadix, customAlphabet, caseSensitive);
        }
        // Otherwise, parse as a standard number/string
        return parseAnyValue(initialValue);
    }

    /**
     * @class ExtendedNumber
     * @augments AbstractNumber
     * @description Represents large numbers using an array of 'chunks'.
     */
    function ExtendedNumber(chunkArray, isNegative) {
        // Ensure the chunk array is normalized (no leading zeros)
        normalizeChunkArray(chunkArray);
        this.chunkArray = chunkArray;
        this.isNegative = !!isNegative; // Coerce to boolean
        this.isCompact = false;
    }
    ExtendedNumber.prototype = Object.create(AbstractNumber.prototype);
    ExtendedNumber.prototype.constructor = ExtendedNumber;

    /**
     * @class CompactNumber
     * @augments AbstractNumber
     * @description Represents numbers that fit within JavaScript's safe integer range.
     */
    function CompactNumber(numValue) {
        this.numericalValue = numValue;
        this.isNegative = numValue < 0;
        this.isCompact = true;
    }
    CompactNumber.prototype = Object.create(AbstractNumber.prototype);
    CompactNumber.prototype.constructor = CompactNumber;

    /**
     * @class PlatformBigInt
     * @augments AbstractNumber
     * @description Wrapper for JavaScript's native BigInt type.
     */
    function PlatformBigInt(nativeBigIntValue) {
        this.nativeBigIntValue = nativeBigIntValue;
    }
    PlatformBigInt.prototype = Object.create(AbstractNumber.prototype);
    PlatformBigInt.prototype.constructor = PlatformBigInt;

    /**
     * Checks if a number can be precisely represented by JavaScript's number type.
     * @param {number} n - The number to check.
     * @returns {boolean} True if the number is within the safe integer range, false otherwise.
     */
    function isWithinJsSafeRange(n) {
        return -MAX_SAFE_JS_NUM < n && n < MAX_SAFE_JS_NUM;
    }

    /**
     * Decomposes a JavaScript number into an array of chunks (base CHUNK_BASE).
     * @param {number} n - The number to decompose.
     * @returns {number[]} An array of number chunks.
     */
    function decomposeJsNum(n) {
        // Efficient decomposition for common small numbers
        if (n < CHUNK_BASE) return [n];
        if (n < CHUNK_BASE * CHUNK_BASE) return [n % CHUNK_BASE, Math.floor(n / CHUNK_BASE)];
        // For larger numbers within safe range
        return [n % CHUNK_BASE, Math.floor(n / CHUNK_BASE) % CHUNK_BASE, Math.floor(n / (CHUNK_BASE * CHUNK_BASE))];
    }

    /**
     * Recomposes an array of chunks back into a JavaScript number, if possible.
     * @param {number[]} chunkArray - The array of number chunks.
     * @returns {number|number[]} A JavaScript number if it fits, otherwise the original chunk array.
     */
    function recomposeJsNum(chunkArray) {
        normalizeChunkArray(chunkArray);
        const chunkCount = chunkArray.length;
        // Check if the number of chunks and their magnitude allow conversion to a small number
        if (chunkCount < 4 && compareAbsoluteChunkValues(chunkArray, MAX_SAFE_JS_NUM_CHUNKS) < 0) {
            switch (chunkCount) {
                case 0: return 0;
                case 1: return chunkArray[0];
                case 2: return chunkArray[0] + chunkArray[1] * CHUNK_BASE;
                default: return chunkArray[0] + (chunkArray[1] + chunkArray[2] * CHUNK_BASE) * CHUNK_BASE;
            }
        }
        return chunkArray;
    }

    /**
     * Removes leading zero chunks from an array. Modifies the array in place.
     * @param {number[]} chunkArray - The array of number chunks.
     */
    function normalizeChunkArray(chunkArray) {
        let i = chunkArray.length;
        while (i > 0 && chunkArray[i - 1] === 0) {
            i--;
        }
        chunkArray.length = i; // Truncate array
        if (chunkArray.length === 0) {
            chunkArray.push(0); // Ensure a zero array is [0]
        }
    }

    /**
     * Initializes a new array with a specified length, filled with zeros.
     * @param {number} len - The desired length of the array.
     * @returns {number[]} A new array filled with zeros.
     */
    function initializeChunkArray(len) {
        return Array.from({ length: len }).fill(0);
    }

    /**
     * Truncates a number towards zero (floor for positive, ceil for negative).
     * @param {number} value - The number to truncate.
     * @returns {number} The truncated integer.
     */
    function floorOrCeil(value) {
        return value > 0 ? Math.floor(value) : Math.ceil(value);
    }

    /**
     * Performs addition of two chunk arrays. Assumes positive values.
     * @param {number[]} arrA - First chunk array.
     * @param {number[]} arrB - Second chunk array.
     * @returns {number[]} The sum as a new chunk array.
     */
    function addChunkArrays(arrA, arrB) {
        const lenA = arrA.length;
        const lenB = arrB.length;
        const resultChunks = initializeChunkArray(Math.max(lenA, lenB));
        let carryOver = 0;
        let sumValue;
        let i = 0;

        // Add corresponding chunks from both arrays
        for (; i < lenB; i++) {
            sumValue = arrA[i] + arrB[i] + carryOver;
            carryOver = sumValue >= CHUNK_BASE ? 1 : 0;
            resultChunks[i] = sumValue - carryOver * CHUNK_BASE;
        }

        // Add remaining chunks from the longer array (if any) with carry
        for (; i < lenA; i++) {
            sumValue = arrA[i] + carryOver;
            carryOver = sumValue >= CHUNK_BASE ? 1 : 0;
            resultChunks[i] = sumValue - carryOver * CHUNK_BASE;
        }

        // If there's a final carry, add it
        if (carryOver > 0) {
            resultChunks.push(carryOver);
        }
        return resultChunks;
    }

    /**
     * Adds a small integer to a chunk array. Used for incrementing/decrementing.
     * @param {number[]} chunkArray - The chunk array to modify.
     * @param {number} smallInt - The small integer to add (can be negative).
     * @returns {number[]} A new chunk array representing the sum.
     */
    function addSmallToChunkArray(chunkArray, smallInt) {
        const len = chunkArray.length;
        const resultChunks = initializeChunkArray(len);
        let currentCarry = smallInt; // smallInt can be negative, effectively a borrow
        let chunkSum;

        for (let i = 0; i < len; i++) {
            chunkSum = chunkArray[i] + currentCarry;
            currentCarry = floorOrCeil(chunkSum / CHUNK_BASE);
            resultChunks[i] = chunkSum - currentCarry * CHUNK_BASE;
        }

        // Propagate any remaining carry/borrow
        while (currentCarry !== 0) {
            resultChunks.push(currentCarry % CHUNK_BASE);
            currentCarry = floorOrCeil(currentCarry / CHUNK_BASE);
        }
        normalizeChunkArray(resultChunks);
        return resultChunks;
    }

    /**
     * Performs subtraction of two chunk arrays. Assumes arrA >= arrB (absolute values).
     * @param {number[]} arrA - The minuend chunk array.
     * @param {number[]} arrB - The subtrahend chunk array.
     * @returns {number[]} The difference as a new chunk array.
     */
    function subtractChunkArrays(arrA, arrB) {
        const lenA = arrA.length;
        const lenB = arrB.length;
        const resultChunks = initializeChunkArray(lenA);
        let borrowAmount = 0;
        let chunkDifference;

        for (let i = 0; i < lenB; i++) {
            chunkDifference = arrA[i] - borrowAmount - arrB[i];
            if (chunkDifference < 0) {
                chunkDifference += CHUNK_BASE;
                borrowAmount = 1;
            } else {
                borrowAmount = 0;
            }
            resultChunks[i] = chunkDifference;
        }

        // Handle remaining chunks in arrA with borrow
        for (let i = lenB; i < lenA; i++) {
            chunkDifference = arrA[i] - borrowAmount;
            if (chunkDifference < 0) {
                chunkDifference += CHUNK_BASE;
            } else {
                // No more borrow needed from this point onwards
                resultChunks[i++] = chunkDifference;
                // Copy remaining chunks directly
                while (i < lenA) {
                    resultChunks[i] = arrA[i];
                    i++;
                }
                break;
            }
            resultChunks[i] = chunkDifference;
        }
        normalizeChunkArray(resultChunks);
        return resultChunks;
    }

    /**
     * Handles subtraction between two numbers, determining the correct sign.
     * @param {number[]} arrA - First chunk array (absolute value).
     * @param {number[]} arrB - Second chunk array (absolute value).
     * @param {boolean} currentSign - The sign of the original number (this).
     * @returns {ExtendedNumber|CompactNumber} The result of the subtraction.
     */
    function flexibleSubtract(arrA, arrB, currentSign) {
        let valueResult;
        let finalSign = currentSign;

        // Compare absolute values to determine which is larger
        if (compareAbsoluteChunkValues(arrA, arrB) >= 0) {
            valueResult = subtractChunkArrays(arrA, arrB);
        } else {
            valueResult = subtractChunkArrays(arrB, arrA);
            finalSign = !finalSign; // Flip sign if (B - A) was performed
        }

        const recomposed = recomposeJsNum(valueResult);
        if (typeof recomposed === "number") {
            return new CompactNumber(finalSign ? -recomposed : recomposed);
        }
        return new ExtendedNumber(recomposed, finalSign);
    }

    /**
     * Subtracts a small integer from a chunk array.
     * @param {number[]} chunkArray - The chunk array to subtract from.
     * @param {number} smallInt - The small integer (absolute value) to subtract.
     * @param {boolean} currentSign - The sign of the original number (this).
     * @returns {ExtendedNumber|CompactNumber} The result of the subtraction.
     */
    function subtractSmallFromChunkArray(chunkArray, smallInt, currentSign) {
        const len = chunkArray.length;
        const resultChunks = initializeChunkArray(len);
        let currentBorrow = smallInt;
        let chunkDifference;

        for (let i = 0; i < len; i++) {
            chunkDifference = chunkArray[i] - currentBorrow;
            currentBorrow = 0;
            if (chunkDifference < 0) {
                currentBorrow = 1;
                chunkDifference += CHUNK_BASE;
            }
            resultChunks[i] = chunkDifference;
        }

        const recomposed = recomposeJsNum(resultChunks);
        if (typeof recomposed === "number") {
            return new CompactNumber(currentSign ? -recomposed : recomposed);
        }
        return new ExtendedNumber(recomposed, currentSign);
    }

    // --- Arithmetic Operations ---

    ExtendedNumber.prototype.sumWith = function(otherValue) {
        const otherNum = parseAnyValue(otherValue);
        if (this.isNegative !== otherNum.isNegative) {
            // Different signs => subtraction of absolute values
            return this.differenceWith(otherNum.negate());
        }
        const arrA = this.chunkArray;
        const arrB = otherNum.chunkArray;
        if (otherNum.isCompact) {
            // Optimized path for adding a small integer
            return new ExtendedNumber(addSmallToChunkArray(arrA, Math.abs(otherNum.numericalValue)), this.isNegative);
        }
        // General chunk array addition
        return new ExtendedNumber(addChunkArrays(arrA, arrB), this.isNegative);
    };
    ExtendedNumber.prototype.addAlias = ExtendedNumber.prototype.sumWith; // Alias

    CompactNumber.prototype.sumWith = function(otherValue) {
        const otherNum = parseAnyValue(otherValue);
        const valA = this.numericalValue;
        if ((valA < 0) !== otherNum.isNegative) {
            // Different signs, perform subtraction with negated value
            return this.differenceWith(otherNum.negate());
        }
        const valB = otherNum.numericalValue;
        if (otherNum.isCompact) {
            const sum = valA + valB;
            if (isWithinJsSafeRange(sum)) {
                return new CompactNumber(sum);
            }
            // If sum overflows, convert to ExtendedNumber
            return new ExtendedNumber(addSmallToChunkArray(decomposeJsNum(Math.abs(valB)), Math.abs(valA)), valA < 0);
        }
        // If otherNum is Extended, add this small value to its chunks
        return new ExtendedNumber(addSmallToChunkArray(otherNum.chunkArray, Math.abs(valA)), valA < 0);
    };
    CompactNumber.prototype.addAlias = CompactNumber.prototype.sumWith;

    PlatformBigInt.prototype.sumWith = function(otherValue) {
        return new PlatformBigInt(this.nativeBigIntValue + parseAnyValue(otherValue).nativeBigIntValue);
    };
    PlatformBigInt.prototype.addAlias = PlatformBigInt.prototype.sumWith;


    ExtendedNumber.prototype.differenceWith = function(otherValue) {
        const otherNum = parseAnyValue(otherValue);
        if (this.isNegative !== otherNum.isNegative) {
            // Different signs => addition of absolute values
            return this.sumWith(otherNum.negate());
        }
        const arrA = this.chunkArray;
        const arrB = otherNum.chunkArray;
        if (otherNum.isCompact) {
            return flexibleSubtract(arrA, decomposeJsNum(Math.abs(otherNum.numericalValue)), this.isNegative);
        }
        return flexibleSubtract(arrA, arrB, this.isNegative);
    };
    ExtendedNumber.prototype.subtractAlias = ExtendedNumber.prototype.differenceWith;

    CompactNumber.prototype.differenceWith = function(otherValue) {
        const otherNum = parseAnyValue(otherValue);
        const valA = this.numericalValue;
        if ((valA < 0) !== otherNum.isNegative) {
            // Different signs, perform addition with negated value
            return this.sumWith(otherNum.negate());
        }
        const valB = otherNum.numericalValue;
        if (otherNum.isCompact) {
            const diff = valA - valB;
            if (isWithinJsSafeRange(diff)) {
                return new CompactNumber(diff);
            }
            // If diff overflows, convert to ExtendedNumber
            return flexibleSubtract(decomposeJsNum(Math.abs(valB)), Math.abs(valA), valA >= 0);
        }
        // If otherNum is Extended, subtract this small value from its chunks
        return flexibleSubtract(otherNum.chunkArray, decomposeJsNum(Math.abs(valA)), valA >= 0);
    };
    CompactNumber.prototype.subtractAlias = CompactNumber.prototype.differenceWith;

    PlatformBigInt.prototype.differenceWith = function(otherValue) {
        return new PlatformBigInt(this.nativeBigIntValue - parseAnyValue(otherValue).nativeBigIntValue);
    };
    PlatformBigInt.prototype.subtractAlias = PlatformBigInt.prototype.differenceWith;


    ExtendedNumber.prototype.negate = function() {
        return new ExtendedNumber(this.chunkArray, !this.isNegative);
    };
    CompactNumber.prototype.negate = function() {
        return new CompactNumber(-this.numericalValue);
    };
    PlatformBigInt.prototype.negate = function() {
        return new PlatformBigInt(-this.nativeBigIntValue);
    };

    ExtendedNumber.prototype.absoluteValue = function() {
        return new ExtendedNumber(this.chunkArray, false);
    };
    CompactNumber.prototype.absoluteValue = function() {
        return new CompactNumber(Math.abs(this.numericalValue));
    };
    PlatformBigInt.prototype.absoluteValue = function() {
        return new PlatformBigInt(this.nativeBigIntValue >= BigInt(0) ? this.nativeBigIntValue : -this.nativeBigIntValue);
    };

    /**
     * Performs long multiplication of two chunk arrays.
     * @param {number[]} arrA - First chunk array.
     * @param {number[]} arrB - Second chunk array.
     * @returns {number[]} The product as a new chunk array.
     */
    function multiplyLongChunks(arrA, arrB) {
        const lenA = arrA.length;
        const lenB = arrB.length;
        const resultChunks = initializeChunkArray(lenA + lenB);
        let productTerm, currentCarry;

        for (let i = 0; i < lenA; ++i) {
            const chunkA = arrA[i];
            currentCarry = 0;
            for (let j = 0; j < lenB; ++j) {
                const chunkB = arrB[j];
                productTerm = chunkA * chunkB + resultChunks[i + j] + currentCarry;
                currentCarry = floorOrCeil(productTerm / CHUNK_BASE);
                resultChunks[i + j] = productTerm - currentCarry * CHUNK_BASE;
            }
            resultChunks[i + lenB] += currentCarry; // Add final carry
        }
        normalizeChunkArray(resultChunks);
        return resultChunks;
    }

    /**
     * Multiplies a chunk array by a small integer.
     * @param {number[]} chunkArray - The chunk array.
     * @param {number} multiplier - The small integer multiplier.
     * @returns {number[]} The product as a new chunk array.
     */
    function multiplyChunkBySmall(chunkArray, multiplier) {
        const len = chunkArray.length;
        const resultChunks = initializeChunkArray(len);
        let currentCarry = 0;
        let productTerm;

        for (let i = 0; i < len; i++) {
            productTerm = chunkArray[i] * multiplier + currentCarry;
            currentCarry = floorOrCeil(productTerm / CHUNK_BASE);
            resultChunks[i] = productTerm - currentCarry * CHUNK_BASE;
        }

        // Add any remaining carry
        while (currentCarry > 0) {
            resultChunks.push(currentCarry % CHUNK_BASE);
            currentCarry = floorOrCeil(currentCarry / CHUNK_BASE);
        }
        normalizeChunkArray(resultChunks);
        return resultChunks;
    }

    /**
     * Shifts a chunk array left by padding with zeros.
     * @param {number[]} chunks - The chunk array to shift.
     * @param {number} numZeros - The number of zeros to append.
     * @returns {number[]} A new array with zeros prepended.
     */
    function shiftChunksLeft(chunks, numZeros) {
        const result = [];
        for (let i = 0; i < numZeros; i++) {
            result.push(0);
        }
        return result.concat(chunks);
    }

    /**
     * Determines if Karatsuba multiplication algorithm should be used based on operand lengths.
     * @param {number} len1 - Length of the first operand's chunk array.
     * @param {number} len2 - Length of the second operand's chunk array.
     * @returns {boolean} True if Karatsuba is more efficient.
     */
    function shouldUseKaratsuba(len1, len2) {
        // Empirical threshold for Karatsuba's efficiency gain
        return -0.012 * len1 - 0.012 * len2 + 15e-6 * len1 * len2 > 0;
    }

    /**
     * Implements Karatsuba multiplication for chunk arrays.
     * @param {number[]} xChunks - First operand's chunk array.
     * @param {number[]} yChunks - Second operand's chunk array.
     * @returns {number[]} The product as a chunk array.
     */
    function karatsubaProduct(xChunks, yChunks) {
        const n = Math.max(xChunks.length, yChunks.length);
        if (n <= 30) { // Fallback to long multiplication for small arrays
            return multiplyLongChunks(xChunks, yChunks);
        }

        const halfN = Math.ceil(n / 2); // Split point

        // Split x and y into high and low parts
        const xLow = xChunks.slice(0, halfN);
        const xHigh = xChunks.slice(halfN);
        const yLow = yChunks.slice(0, halfN);
        const yHigh = yChunks.slice(halfN);

        // Three recursive products
        const z0 = karatsubaProduct(xLow, yLow); // z0 = x_low * y_low
        const z1 = karatsubaProduct(addChunkArrays(xLow, xHigh), addChunkArrays(yLow, yHigh)); // z1 = (x_low + x_high) * (y_low + y_high)
        const z2 = karatsubaProduct(xHigh, yHigh); // z2 = x_high * y_high

        // Combine terms: z0 + (z1 - z0 - z2) * CHUNK_BASE^halfN + z2 * CHUNK_BASE^(2*halfN)
        const middleTerm = subtractChunkArrays(subtractChunkArrays(z1, z0), z2);
        const productResult = addChunkArrays(
            addChunkArrays(z0, shiftChunksLeft(middleTerm, halfN)),
            shiftChunksLeft(z2, 2 * halfN)
        );
        normalizeChunkArray(productResult);
        return productResult;
    }

    ExtendedNumber.prototype.productOf = function(otherValue) {
        const otherNum = parseAnyValue(otherValue);
        const arrA = this.chunkArray;
        const arrB = otherNum.chunkArray;
        const finalSign = this.isNegative !== otherNum.isNegative;

        if (otherNum.isCompact) {
            const smallVal = otherNum.numericalValue;
            if (smallVal === 0) return GrandNumberFactory.zero;
            if (smallVal === 1) return this;
            if (smallVal === -1) return this.negate();

            const absSmallVal = Math.abs(smallVal);
            if (absSmallVal < CHUNK_BASE) {
                return new ExtendedNumber(multiplyChunkBySmall(arrA, absSmallVal), finalSign);
            }
            // If small number is still large, convert it to chunks
            return new ExtendedNumber(multiplyLongChunks(arrA, decomposeJsNum(absSmallVal)), finalSign);
        }

        if (shouldUseKaratsuba(arrA.length, arrB.length)) {
            return new ExtendedNumber(karatsubaProduct(arrA, arrB), finalSign);
        }
        return new ExtendedNumber(multiplyLongChunks(arrA, arrB), finalSign);
    };
    ExtendedNumber.prototype.multiplyAlias = ExtendedNumber.prototype.productOf;

    CompactNumber.prototype.productOf = function(otherValue) {
        const otherNum = parseAnyValue(otherValue);
        const valA = this.numericalValue;
        const finalSign = this.isNegative !== otherNum.isNegative;

        if (otherNum.isCompact) {
            const product = valA * otherNum.numericalValue;
            if (isWithinJsSafeRange(product)) {
                return new CompactNumber(product);
            }
            // If product overflows, convert to ExtendedNumber.
            // This is a simplified path for small * small -> large
            return new ExtendedNumber(multiplyLongChunks(decomposeJsNum(Math.abs(valA)), decomposeJsNum(Math.abs(otherNum.numericalValue))), finalSign);
        }

        // If otherNum is Extended, multiply its chunks by this small value
        const absSmallVal = Math.abs(valA);
        if (absSmallVal === 0) return GrandNumberFactory.zero;
        if (absSmallVal === 1) return finalSign ? otherNum.negate() : otherNum;
        if (absSmallVal < CHUNK_BASE) {
            return new ExtendedNumber(multiplyChunkBySmall(otherNum.chunkArray, absSmallVal), finalSign);
        }
        return new ExtendedNumber(multiplyLongChunks(otherNum.chunkArray, decomposeJsNum(absSmallVal)), finalSign);
    };
    CompactNumber.prototype.multiplyAlias = CompactNumber.prototype.productOf;

    PlatformBigInt.prototype.productOf = function(otherValue) {
        return new PlatformBigInt(this.nativeBigIntValue * parseAnyValue(otherValue).nativeBigIntValue);
    };
    PlatformBigInt.prototype.multiplyAlias = PlatformBigInt.prototype.productOf;

    /**
     * Squares a chunk array. Optimized for squaring (avoids redundant calculations).
     * @param {number[]} chunkArray - The chunk array to square.
     * @returns {number[]} The square as a new chunk array.
     */
    function squareChunks(chunkArray) {
        const len = chunkArray.length;
        const resultChunks = initializeChunkArray(len + len);
        let productTerm, currentCarry;

        for (let i = 0; i < len; i++) {
            const chunkI = chunkArray[i];
            currentCarry = 0 - chunkI * chunkI; // Initialize carry with diagonal term (negative to be subtracted)
            for (let j = i; j < len; j++) {
                const chunkJ = chunkArray[j];
                // For j=i, it's chunkI*chunkI. For j>i, it's 2*chunkI*chunkJ.
                // The diagonal term is added at j=i then subtracted by the '0 - chunkI*chunkI' above.
                productTerm = (j === i ? chunkI * chunkJ : 2 * chunkI * chunkJ) + resultChunks[i + j] + currentCarry;
                currentCarry = floorOrCeil(productTerm / CHUNK_BASE);
                resultChunks[i + j] = productTerm - currentCarry * CHUNK_BASE;
            }
            resultChunks[i + len] += currentCarry; // Add final carry for this row
        }
        normalizeChunkArray(resultChunks);
        return resultChunks;
    }

    ExtendedNumber.prototype.square = function() {
        return new ExtendedNumber(squareChunks(this.chunkArray), false);
    };
    CompactNumber.prototype.square = function() {
        const valueSquared = this.numericalValue * this.numericalValue;
        if (isWithinJsSafeRange(valueSquared)) {
            return new CompactNumber(valueSquared);
        }
        return new ExtendedNumber(squareChunks(decomposeJsNum(Math.abs(this.numericalValue))), false);
    };
    PlatformBigInt.prototype.square = function() {
        return new PlatformBigInt(this.nativeBigIntValue * this.nativeBigIntValue);
    };

    /**
     * Performs division and modulus for two chunk arrays using a fast algorithm (Knuth's Algorithm D).
     * @param {number[]} dividendChunks - The dividend's chunk array.
     * @param {number[]} divisorChunks - The divisor's chunk array.
     * @returns {[number[], number[]]} An array containing [quotientChunks, remainderChunks].
     */
    function longDivisionOptimized(dividendChunks, divisorChunks) {
        const divLen = dividendChunks.length;
        const sorLen = divisorChunks.length;
        const quotientChunks = initializeChunkArray(divLen - sorLen + 1); // Max possible quotient length

        // Optimization: Normalize divisor to make its most significant digit large.
        // This ensures the initial guess for quotient digits is more accurate.
        const normalizer = floorOrCeil(CHUNK_BASE / (divisorChunks[sorLen - 1] + 1));
        const normalizedDividend = multiplyChunkBySmall(dividendChunks, normalizer);
        const normalizedDivisor = multiplyChunkBySmall(divisorChunks, normalizer);

        const nDivLen = normalizedDividend.length;
        const nSorLen = normalizedDivisor.length;
        const sorMostSigDigit = normalizedDivisor[nSorLen - 1];

        // Ensure dividend has an extra leading zero if its length is not greater than divisor's.
        // This makes dividend[shift + nSorLen] always valid.
        if (nDivLen <= nSorLen) normalizedDividend.push(0);

        for (let shift = nDivLen - nSorLen; shift >= 0; shift--) {
            let guessQuotientDigit = CHUNK_BASE - 1; // Initial maximum guess

            // Calculate a more accurate guess for the quotient digit
            if (normalizedDividend[shift + nSorLen] !== sorMostSigDigit) {
                guessQuotientDigit = floorOrCeil(
                    (normalizedDividend[shift + nSorLen] * CHUNK_BASE + normalizedDividend[shift + nSorLen - 1]) / sorMostSigDigit
                );
            }

            // Test the guess: multiply divisor by guess and subtract from relevant part of dividend.
            let carry = 0;
            let borrow = 0;
            let productTerm, difference;

            for (let i = 0; i < nSorLen; i++) {
                carry += guessQuotientDigit * normalizedDivisor[i];
                const q = floorOrCeil(carry / CHUNK_BASE);
                difference = normalizedDividend[shift + i] - (carry - q * CHUNK_BASE) - borrow;
                carry = q;

                if (difference < 0) {
                    normalizedDividend[shift + i] = difference + CHUNK_BASE;
                    borrow = 1;
                } else {
                    normalizedDividend[shift + i] = difference;
                    borrow = 0;
                }
            }
            normalizedDividend[shift + nSorLen] -= carry + borrow; // Final subtraction for the carry/borrow

            // Adjust guess if it was too large (subtraction resulted in negative)
            while (normalizedDividend[shift + nSorLen] < 0) {
                guessQuotientDigit--;
                carry = 0;
                // Add divisor back to remainder
                for (let i = 0; i < nSorLen; i++) {
                    carry += normalizedDividend[shift + i] + normalizedDivisor[i];
                    normalizedDividend[shift + i] = carry % CHUNK_BASE;
                    carry = floorOrCeil(carry / CHUNK_BASE);
                }
                normalizedDividend[shift + nSorLen] += carry;
            }
            quotientChunks[shift] = guessQuotientDigit;
        }

        // Un-normalize the remainder
        const remainderChunks = divideChunksBySmall(normalizedDividend, normalizer)[0];
        normalizeChunkArray(quotientChunks);
        normalizeChunkArray(remainderChunks);
        return [quotientChunks, remainderChunks];
    }

    /**
     * Performs division and modulus using a simpler, iterative subtraction method.
     * Less efficient than longDivisionOptimized, used as fallback or for smaller numbers.
     * @param {number[]} dividendChunks - The dividend's chunk array.
     * @param {number[]} divisorChunks - The divisor's chunk array.
     * @returns {[number[], number[]]} An array containing [quotientChunks, remainderChunks].
     */
    function longDivisionFallback(dividendChunks, divisorChunks) {
        const divLen = dividendChunks.length;
        const sorLen = divisorChunks.length;
        const quotientResult = [];
        let currentPart = []; // Accumulates dividend chunks for current division step

        let idx = divLen;
        while (idx--) {
            currentPart.unshift(dividendChunks[idx]); // Add next dividend chunk to the front
            normalizeChunkArray(currentPart);

            // If currentPart is smaller than divisor, quotient digit is 0
            if (compareAbsoluteChunkValues(currentPart, divisorChunks) < 0) {
                quotientResult.push(0);
                continue;
            }

            // Estimate quotient digit
            const currentPartLen = currentPart.length;
            let guessDigit;
            if (currentPartLen > sorLen) {
                // If currentPart is longer, use its two most significant chunks
                guessDigit = floorOrCeil((currentPart[currentPartLen - 1] * CHUNK_BASE + currentPart[currentPartLen - 2]) / divisorChunks[sorLen - 1]);
            } else {
                // If same length, use most significant chunks
                guessDigit = floorOrCeil(currentPart[currentPartLen - 1] / divisorChunks[sorLen - 1]);
            }

            // Refine guess
            let productToCheck;
            do {
                productToCheck = multiplyChunkBySmall(divisorChunks, guessDigit);
                if (compareAbsoluteChunkValues(productToCheck, currentPart) <= 0) break;
                guessDigit--;
            } while (guessDigit > 0); // Ensure guess doesn't go below 0

            quotientResult.push(guessDigit);
            currentPart = subtractChunkArrays(currentPart, productToCheck); // Update remainder
        }
        quotientResult.reverse(); // Digits were pushed in reverse order
        normalizeChunkArray(quotientResult);
        normalizeChunkArray(currentPart); // currentPart is the final remainder

        return [quotientResult, currentPart];
    }

    /**
     * Divides a chunk array by a small integer.
     * @param {number[]} chunkArray - The dividend's chunk array.
     * @param {number} smallDivisor - The small integer divisor.
     * @returns {[number[], number]} An array containing [quotientChunks, remainder].
     */
    function divideChunksBySmall(chunkArray, smallDivisor) {
        const len = chunkArray.length;
        const quotientChunks = initializeChunkArray(len);
        let currentRemainder = 0;
        let currentDividendChunk, quotientDigit;

        for (let i = len - 1; i >= 0; --i) {
            currentDividendChunk = currentRemainder * CHUNK_BASE + chunkArray[i];
            quotientDigit = floorOrCeil(currentDividendChunk / smallDivisor);
            currentRemainder = currentDividendChunk - quotientDigit * smallDivisor; // Remainder for next iteration
            quotientChunks[i] = quotientDigit | 0; // Ensure integer
        }
        normalizeChunkArray(quotientChunks);
        return [quotientChunks, currentRemainder | 0]; // Ensure integer
    }

    /**
     * Performs division and modulus for any two GrandNumber instances.
     * @param {AbstractNumber} currentNum - The dividend.
     * @param {AbstractNumber} divisorNum - The divisor.
     * @returns {[AbstractNumber, AbstractNumber]} An array containing [quotient, remainder].
     */
    function performDivisionAndModulus(currentNum, divisorNum) {
        if (HAS_NATIVE_BIGINT) {
            // Use native BigInt if available
            return [
                new PlatformBigInt(currentNum.nativeBigIntValue / divisorNum.nativeBigIntValue),
                new PlatformBigInt(currentNum.nativeBigIntValue % divisorNum.nativeBigIntValue)
            ];
        }

        const absDivisorNum = parseAnyValue(divisorNum);
        const absCurrentNum = parseAnyValue(currentNum);

        const currentVal = absCurrentNum.chunkArray;
        const divisorVal = absDivisorNum.chunkArray;

        if (absDivisorNum.isZero()) {
            throw new Error("Cannot divide by zero.");
        }

        if (absCurrentNum.isCompact) {
            if (absDivisorNum.isCompact) {
                // Both are small, use JS numbers
                return [
                    new CompactNumber(floorOrCeil(currentNum.numericalValue / divisorNum.numericalValue)),
                    new CompactNumber(currentNum.numericalValue % divisorNum.numericalValue)
                ];
            }
            // Small dividend, large divisor => quotient is 0, remainder is dividend itself
            return [GrandNumberFactory.zero, currentNum];
        }

        if (absDivisorNum.isCompact) {
            // Large dividend, small divisor
            const smallDivisorValue = absDivisorNum.numericalValue;
            if (smallDivisorValue === 1) return [currentNum, GrandNumberFactory.zero];
            if (smallDivisorValue === -1) return [currentNum.negate(), GrandNumberFactory.zero];

            const absSmallDivisor = Math.abs(smallDivisorValue);
            if (absSmallDivisor < CHUNK_BASE) {
                const [quotientChunks, remainder] = divideChunksBySmall(currentVal, absSmallDivisor);
                const quotient = recomposeJsNum(quotientChunks);
                const finalRemainder = currentNum.isNegative ? -remainder : remainder;

                // Determine final quotient sign
                const finalQuotientSign = currentNum.isNegative !== absDivisorNum.isNegative;

                if (typeof quotient === "number") {
                    return [new CompactNumber(finalQuotientSign ? -quotient : quotient), new CompactNumber(finalRemainder)];
                }
                return [new ExtendedNumber(quotient, finalQuotientSign), new CompactNumber(finalRemainder)];
            }
            // If the "small" divisor is still large enough to be a chunk array
            // Fall through to general long division
        }

        const comparisonResult = compareAbsoluteChunkValues(currentVal, divisorVal);
        if (comparisonResult === -1) {
            return [GrandNumberFactory.zero, currentNum]; // Dividend < Divisor
        }
        if (comparisonResult === 0) {
            // Dividend == Divisor
            const quotient = GrandNumberFactory[currentNum.isNegative === absDivisorNum.isNegative ? 1 : -1];
            return [quotient, GrandNumberFactory.zero];
        }

        let divisionResult;
        // Choose division algorithm based on size
        if (currentVal.length + divisorVal.length <= 200) { // Empirical threshold
            divisionResult = longDivisionOptimized(currentVal, divisorVal);
        } else {
            divisionResult = longDivisionFallback(currentVal, divisorVal);
        }

        const quotientChunks = divisionResult[0];
        const remainderChunks = divisionResult[1];

        // Determine signs for quotient and remainder
        const quotientSign = currentNum.isNegative !== absDivisorNum.isNegative;
        const remainderSign = currentNum.isNegative; // Remainder takes sign of dividend

        const finalQuotient = recomposeJsNum(quotientChunks);
        const finalRemainder = recomposeJsNum(remainderChunks);

        const quotientObject = typeof finalQuotient === "number" ? new CompactNumber(quotientSign ? -finalQuotient : finalQuotient) : new ExtendedNumber(finalQuotient, quotientSign);
        const remainderObject = typeof finalRemainder === "number" ? new CompactNumber(remainderSign ? -finalRemainder : finalRemainder) : new ExtendedNumber(finalRemainder, remainderSign);

        return [quotientObject, remainderObject];
    }

    ExtendedNumber.prototype.divideAndRemainder = CompactNumber.prototype.divideAndRemainder = PlatformBigInt.prototype.divideAndRemainder = function(otherValue) {
        const [quotient, remainder] = performDivisionAndModulus(this, otherValue);
        return { quotient: quotient, remainder: remainder };
    };

    ExtendedNumber.prototype.divisionResult = function(otherValue) {
        return performDivisionAndModulus(this, otherValue)[0];
    };
    ExtendedNumber.prototype.over = ExtendedNumber.prototype.divisionResult;

    CompactNumber.prototype.divisionResult = function(otherValue) {
        return performDivisionAndModulus(this, otherValue)[0];
    };
    CompactNumber.prototype.over = CompactNumber.prototype.divisionResult;

    PlatformBigInt.prototype.divisionResult = function(otherValue) {
        return performDivisionAndModulus(this, otherValue)[0];
    };
    PlatformBigInt.prototype.over = PlatformBigInt.prototype.divisionResult;

    ExtendedNumber.prototype.modulusResult = function(otherValue) {
        return performDivisionAndModulus(this, otherValue)[1];
    };
    ExtendedNumber.prototype.remainderAlias = ExtendedNumber.prototype.modulusResult;

    CompactNumber.prototype.modulusResult = function(otherValue) {
        return performDivisionAndModulus(this, otherValue)[1];
    };
    CompactNumber.prototype.remainderAlias = CompactNumber.prototype.modulusResult;

    PlatformBigInt.prototype.modulusResult = function(otherValue) {
        return performDivisionAndModulus(this, otherValue)[1];
    };
    PlatformBigInt.prototype.remainderAlias = PlatformBigInt.prototype.modulusResult;

    ExtendedNumber.prototype.power = CompactNumber.prototype.power = function(exponentValue) {
        const exponentNum = parseAnyValue(exponentValue);
        const currentBaseVal = this.chunkArray;
        const exponentVal = exponentNum.numericalValue; // pow only supports small integer exponents

        if (exponentVal === 0) return GrandNumberFactory.one;
        if (currentBaseVal === 0) return GrandNumberFactory.zero;
        if (currentBaseVal === 1) return GrandNumberFactory.one;
        if (currentBaseVal === -1) return exponentNum.isEvenVal() ? GrandNumberFactory.one : GrandNumberFactory.minusOne;

        if (exponentNum.isNegative()) {
            // For negative exponents, result is 0 for integers (or 1/base^|exp| for rationals, not supported)
            return GrandNumberFactory.zero;
        }
        if (!exponentNum.isCompact) {
            throw new Error("Exponent " + exponentNum.toString() + " is too large for integer power calculation.");
        }

        if (this.isCompact) {
            const calculatedPower = Math.pow(this.numericalValue, exponentVal);
            if (isWithinJsSafeRange(calculatedPower)) {
                return new CompactNumber(floorOrCeil(calculatedPower));
            }
        }

        let base = this;
        let result = GrandNumberFactory.one;
        let tempExponent = exponentVal;

        // Binary exponentiation (exponentiation by squaring)
        while (true) {
            if ((tempExponent & 1) === 1) { // If exponent is odd
                result = result.productOf(base);
                tempExponent--;
            }
            if (tempExponent === 0) break;
            tempExponent /= 2; // Divide exponent by 2
            base = base.square(); // Square the base
        }
        return result;
    };

    let nativePowFunction;
    if (HAS_NATIVE_BIGINT) {
        // Use eval to avoid syntax error in environments without BigInt support
        nativePowFunction = eval("(a,b)=>a**b");
    }
    PlatformBigInt.prototype.power = function(exponentValue) {
        const exponentNum = parseAnyValue(exponentValue);
        const baseVal = this.nativeBigIntValue;
        const expVal = exponentNum.nativeBigIntValue;

        if (expVal === BigInt(0)) return GrandNumberFactory.one;
        if (baseVal === BigInt(0)) return GrandNumberFactory.zero;
        if (baseVal === BigInt(1)) return GrandNumberFactory.one;
        if (baseVal === BigInt(-1)) return exponentNum.isEvenVal() ? GrandNumberFactory.one : GrandNumberFactory.minusOne;

        if (exponentNum.isNegative()) return new PlatformBigInt(BigInt(0)); // BigInt cannot have negative exponents
        return new PlatformBigInt(nativePowFunction(baseVal, expVal));
    };

    ExtendedNumber.prototype.modularPower = CompactNumber.prototype.modularPower = PlatformBigInt.prototype.modularPower = function(exp, mod) {
        const exponent = parseAnyValue(exp);
        const modulus = parseAnyValue(mod);

        if (modulus.isZero()) {
            throw new Error("Cannot compute modular power with modulus 0.");
        }

        let result = GrandNumberFactory.one;
        let currentBase = this.modulusResult(modulus); // base = this % modulus

        // Handle negative modulus (conventionally, modulus should be positive)
        if (modulus.isNegative()) {
            modulus = modulus.negate();
        }

        // Binary exponentiation (exponentiation by squaring)
        while (exponent.isPositiveVal()) {
            if (currentBase.isZero()) return GrandNumberFactory.zero; // Optimization: 0^exp = 0
            if (exponent.isOddVal()) {
                result = result.productOf(currentBase).modulusResult(modulus);
            }
            exponent = exponent.divisionResult(2); // exponent = floor(exponent / 2)
            currentBase = currentBase.square().modulusResult(modulus); // base = (base^2) % modulus
        }
        return result;
    };

    /**
     * Compares the absolute values of two chunk arrays.
     * @param {number[]} arrA - First chunk array.
     * @param {number[]} arrB - Second chunk array.
     * @returns {number} -1 if arrA < arrB, 0 if arrA == arrB, 1 if arrA > arrB.
     */
    function compareAbsoluteChunkValues(arrA, arrB) {
        if (arrA.length !== arrB.length) {
            return arrA.length > arrB.length ? 1 : -1;
        }
        // Compare chunks from most significant to least significant
        for (let i = arrA.length - 1; i >= 0; i--) {
            if (arrA[i] !== arrB[i]) {
                return arrA[i] > arrB[i] ? 1 : -1;
            }
        }
        return 0; // Arrays are identical
    }

    ExtendedNumber.prototype.compareAbsolute = function(otherValue) {
        const otherNum = parseAnyValue(otherValue);
        const arrA = this.chunkArray;
        const arrB = otherNum.chunkArray;
        if (otherNum.isCompact) {
            // If other is compact, convert its absolute value to chunks for comparison
            return compareAbsoluteChunkValues(arrA, decomposeJsNum(Math.abs(otherNum.numericalValue)));
        }
        return compareAbsoluteChunkValues(arrA, arrB);
    };

    CompactNumber.prototype.compareAbsolute = function(otherValue) {
        const otherNum = parseAnyValue(otherValue);
        const absValA = Math.abs(this.numericalValue);
        const absValB = otherNum.numericalValue; // For CompactNumber, numericalValue is the raw value

        if (otherNum.isCompact) {
            const absOtherVal = Math.abs(absValB);
            return absValA === absOtherVal ? 0 : (absValA > absOtherVal ? 1 : -1);
        }
        // If otherNum is Extended, this compact number is smaller unless it's 0
        return -1;
    };

    PlatformBigInt.prototype.compareAbsolute = function(otherValue) {
        let absA = this.nativeBigIntValue;
        let absB = parseAnyValue(otherValue).nativeBigIntValue;
        absA = absA >= BigInt(0) ? absA : -absA;
        absB = absB >= BigInt(0) ? absB : -absB;
        return absA === absB ? 0 : (absA > absB ? 1 : -1);
    };

    ExtendedNumber.prototype.compareValues = function(otherValue) {
        // Handle special JS number values
        if (otherValue === Infinity) return -1;
        if (otherValue === -Infinity) return 1;

        const otherNum = parseAnyValue(otherValue);
        const arrA = this.chunkArray;
        const arrB = otherNum.chunkArray;

        if (this.isNegative !== otherNum.isNegative) {
            return this.isNegative ? -1 : 1; // Negative is always less than positive
        }
        if (this.isNegative) {
            // Both negative, compare absolute values and flip result
            return -this.compareAbsolute(otherNum);
        }
        // Both positive, compare absolute values directly
        return this.compareAbsolute(otherNum);
    };
    ExtendedNumber.prototype.compareTo = ExtendedNumber.prototype.compareValues;

    CompactNumber.prototype.compareValues = function(otherValue) {
        if (otherValue === Infinity) return -1;
        if (otherValue === -Infinity) return 1;

        const otherNum = parseAnyValue(otherValue);
        const valA = this.numericalValue;
        const valB = otherNum.numericalValue;

        if (otherNum.isCompact) {
            return valA === valB ? 0 : (valA > valB ? 1 : -1);
        }

        // If otherNum is Extended
        if ((valA < 0) !== otherNum.isNegative) {
            return valA < 0 ? -1 : 1; // Negative is less than positive
        }
        // Both have same sign, but one is compact, one is extended.
        // A compact number will always be "smaller" in magnitude than an extended number
        // (unless the extended number is 0, which would be compact).
        // Since both have same sign, if positive, compact < extended. If negative, compact > extended.
        return valA < 0 ? 1 : -1;
    };
    CompactNumber.prototype.compareTo = CompactNumber.prototype.compareValues;

    PlatformBigInt.prototype.compareValues = function(otherValue) {
        if (otherValue === Infinity) return -1;
        if (otherValue === -Infinity) return 1;

        const valA = this.nativeBigIntValue;
        const valB = parseAnyValue(otherValue).nativeBigIntValue;
        return valA === valB ? 0 : (valA > valB ? 1 : -1);
    };
    PlatformBigInt.prototype.compareTo = PlatformBigInt.prototype.compareValues;

    // --- Comparison Aliases ---
    ExtendedNumber.prototype.isEqual = CompactNumber.prototype.isEqual = PlatformBigInt.prototype.isEqual = function(otherValue) { return this.compareValues(otherValue) === 0; };
    ExtendedNumber.prototype.eq = CompactNumber.prototype.eq = PlatformBigInt.prototype.eq = ExtendedNumber.prototype.isEqual;

    ExtendedNumber.prototype.isNotEqual = CompactNumber.prototype.isNotEqual = PlatformBigInt.prototype.isNotEqual = function(otherValue) { return this.compareValues(otherValue) !== 0; };
    ExtendedNumber.prototype.neq = CompactNumber.prototype.neq = PlatformBigInt.prototype.neq = ExtendedNumber.prototype.isNotEqual;

    ExtendedNumber.prototype.isGreater = CompactNumber.prototype.isGreater = PlatformBigInt.prototype.isGreater = function(otherValue) { return this.compareValues(otherValue) > 0; };
    ExtendedNumber.prototype.gt = CompactNumber.prototype.gt = PlatformBigInt.prototype.gt = ExtendedNumber.prototype.isGreater;

    ExtendedNumber.prototype.isLesser = CompactNumber.prototype.isLesser = PlatformBigInt.prototype.isLesser = function(otherValue) { return this.compareValues(otherValue) < 0; };
    ExtendedNumber.prototype.lt = CompactNumber.prototype.lt = PlatformBigInt.prototype.lt = ExtendedNumber.prototype.isLesser;

    ExtendedNumber.prototype.isGreaterOrEqual = CompactNumber.prototype.isGreaterOrEqual = PlatformBigInt.prototype.isGreaterOrEqual = function(otherValue) { return this.compareValues(otherValue) >= 0; };
    ExtendedNumber.prototype.geq = CompactNumber.prototype.geq = PlatformBigInt.prototype.geq = ExtendedNumber.prototype.isGreaterOrEqual;

    ExtendedNumber.prototype.isLesserOrEqual = CompactNumber.prototype.isLesserOrEqual = PlatformBigInt.prototype.isLesserOrEqual = function(otherValue) { return this.compareValues(otherValue) <= 0; };
    ExtendedNumber.prototype.leq = CompactNumber.prototype.leq = PlatformBigInt.prototype.leq = ExtendedNumber.prototype.isLesserOrEqual;

    // --- Property Checks ---
    ExtendedNumber.prototype.isEvenVal = function() { return (this.chunkArray[0] & 1) === 0; };
    CompactNumber.prototype.isEvenVal = function() { return (this.numericalValue & 1) === 0; };
    PlatformBigInt.prototype.isEvenVal = function() { return (this.nativeBigIntValue & BigInt(1)) === BigInt(0); };

    ExtendedNumber.prototype.isOddVal = function() { return (this.chunkArray[0] & 1) === 1; };
    CompactNumber.prototype.isOddVal = function() { return (this.numericalValue & 1) === 1; };
    PlatformBigInt.prototype.isOddVal = function() { return (this.nativeBigIntValue & BigInt(1)) === BigInt(1); };

    ExtendedNumber.prototype.isPositiveVal = function() { return !this.isNegative; };
    CompactNumber.prototype.isPositiveVal = function() { return this.numericalValue > 0; };
    PlatformBigInt.prototype.isPositiveVal = CompactNumber.prototype.isPositiveVal; // Native BigInt uses value directly

    ExtendedNumber.prototype.isNegativeVal = function() { return this.isNegative; };
    CompactNumber.prototype.isNegativeVal = function() { return this.numericalValue < 0; };
    PlatformBigInt.prototype.isNegativeVal = CompactNumber.prototype.isNegativeVal; // Native BigInt uses value directly

    ExtendedNumber.prototype.isUnit = function() { return false; }; // Only compact numbers can be unit unless value is [1]
    CompactNumber.prototype.isUnit = function() { return Math.abs(this.numericalValue) === 1; };
    PlatformBigInt.prototype.isUnit = function() { return this.absoluteValue().nativeBigIntValue === BigInt(1); };

    ExtendedNumber.prototype.isZero = function() { return this.chunkArray.length === 1 && this.chunkArray[0] === 0; };
    CompactNumber.prototype.isZero = function() { return this.numericalValue === 0; };
    PlatformBigInt.prototype.isZero = function() { return this.nativeBigIntValue === BigInt(0); };

    ExtendedNumber.prototype.isDivisibleBy = CompactNumber.prototype.isDivisibleBy = PlatformBigInt.prototype.isDivisibleBy = function(otherValue) {
        const otherNum = parseAnyValue(otherValue);
        if (otherNum.isZero()) return false;
        if (otherNum.isUnit()) return true;
        if (otherNum.compareAbsolute(2) === 0) return this.isEvenVal(); // Optimization for 2
        return this.modulusResult(otherNum).isZero();
    };

    ExtendedNumber.prototype.increment = function() {
        if (this.isNegative) {
            return new ExtendedNumber(subtractSmallFromChunkArray(this.chunkArray, 1, this.isNegative).chunkArray, true);
        }
        return new ExtendedNumber(addSmallToChunkArray(this.chunkArray, 1), this.isNegative);
    };
    CompactNumber.prototype.increment = function() {
        const nextValue = this.numericalValue + 1;
        if (isWithinJsSafeRange(nextValue)) {
            return new CompactNumber(nextValue);
        }
        // If it overflows JS safe integer, convert to ExtendedNumber
        return new ExtendedNumber(decomposeJsNum(MAX_SAFE_JS_NUM), false);
    };
    PlatformBigInt.prototype.increment = function() {
        return new PlatformBigInt(this.nativeBigIntValue + BigInt(1));
    };

    ExtendedNumber.prototype.decrement = function() {
        if (this.isNegative) {
            return new ExtendedNumber(addSmallToChunkArray(this.chunkArray, 1), true);
        }
        return new ExtendedNumber(subtractSmallFromChunkArray(this.chunkArray, 1, this.isNegative).chunkArray, false);
    };
    CompactNumber.prototype.decrement = function() {
        const prevValue = this.numericalValue - 1;
        if (isWithinJsSafeRange(prevValue)) {
            return new CompactNumber(prevValue);
        }
        // If it underflows JS safe integer, convert to ExtendedNumber
        return new ExtendedNumber(decomposeJsNum(MAX_SAFE_JS_NUM), true);
    };
    PlatformBigInt.prototype.decrement = function() {
        return new PlatformBigInt(this.nativeBigIntValue - BigInt(1));
    };


    // --- Bitwise Operations ---
    const powersOfTwoChunks = [1];
    while (2 * powersOfTwoChunks[powersOfTwoChunks.length - 1] <= CHUNK_BASE) {
        powersOfTwoChunks.push(2 * powersOfTwoChunks[powersOfTwoChunks.length - 1]);
    }
    const powersOfTwoCount = powersOfTwoChunks.length;
    const highestPowerOfTwoChunk = powersOfTwoChunks[powersOfTwoCount - 1];

    function isShiftAmountSmall(n) {
        return Math.abs(n) <= CHUNK_BASE; // Check if shift amount fits in a chunk
    }

    ExtendedNumber.prototype.shiftBitsLeft = CompactNumber.prototype.shiftBitsLeft = PlatformBigInt.prototype.shiftBitsLeft = function(shiftAmount) {
        const numShift = parseAnyValue(shiftAmount).toJsNumber();
        if (!isShiftAmountSmall(numShift)) {
            throw new Error(`Shift amount ${numShift} is too large for shifting.`);
        }
        if (numShift < 0) return this.shiftBitsRight(-numShift); // Shift right for negative shift left

        let result = this;
        if (result.isZero()) return result;

        // Apply shifts in chunks to avoid multiplying by huge numbers
        let remainingShift = numShift;
        while (remainingShift >= powersOfTwoCount) {
            result = result.productOf(highestPowerOfTwoChunk);
            remainingShift -= powersOfTwoCount - 1; // powersOfTwoCount is length, not max index
        }
        return result.productOf(powersOfTwoChunks[remainingShift]);
    };

    ExtendedNumber.prototype.shiftBitsRight = CompactNumber.prototype.shiftBitsRight = PlatformBigInt.prototype.shiftBitsRight = function(shiftAmount) {
        const numShift = parseAnyValue(shiftAmount).toJsNumber();
        if (!isShiftAmountSmall(numShift)) {
            throw new Error(`Shift amount ${numShift} is too large for shifting.`);
        }
        if (numShift < 0) return this.shiftBitsLeft(-numShift); // Shift left for negative shift right

        let result = this;
        // Optimization: if number is 0 or -1, shifting right doesn't change it
        if (result.isZero() || (result.isNegativeVal() && result.isUnit())) return result;

        let remainingShift = numShift;
        while (remainingShift >= powersOfTwoCount) {
            const [quotient, remainder] = performDivisionAndModulus(result, highestPowerOfTwoChunk);
            result = remainder.isNegativeVal() ? quotient.decrement() : quotient;
            remainingShift -= powersOfTwoCount - 1;
        }
        const [quotient, remainder] = performDivisionAndModulus(result, powersOfTwoChunks[remainingShift]);
        return remainder.isNegativeVal() ? quotient.decrement() : quotient;
    };

    /**
     * Applies a bitwise operation function (AND, OR, XOR) to two numbers.
     * @param {AbstractNumber} numX - First operand.
     * @param {AbstractNumber} numY - Second operand.
     * @param {Function} bitwiseFn - The bitwise function (e.g., `(a,b) => a & b`).
     * @returns {AbstractNumber} The result of the bitwise operation.
     */
    function applyBitwiseOperation(numX, numY, bitwiseFn) {
        const parsedY = parseAnyValue(numY);

        const xIsNegative = numX.isNegativeVal();
        const yIsNegative = parsedY.isNegativeVal();

        // Handle negative numbers by converting to two's complement representation
        let xNormalized = xIsNegative ? numX.not() : numX;
        let yNormalized = yIsNegative ? parsedY.not() : parsedY;

        let xDigit = 0, yDigit = 0;
        let xDivMod = null, yDivMod = null;
        const resultChunks = [];

        // Process chunks from least significant to most significant
        while (!xNormalized.isZero() || !yNormalized.isZero()) {
            xDivMod = performDivisionAndModulus(xNormalized, highestPowerOfTwoChunk);
            xDigit = xDivMod[1].toJsNumber();
            if (xIsNegative) {
                xDigit = highestPowerOfTwoChunk - 1 - xDigit; // Two's complement for this chunk
            }

            yDivMod = performDivisionAndModulus(yNormalized, highestPowerOfTwoChunk);
            yDigit = yDivMod[1].toJsNumber();
            if (yIsNegative) {
                yDigit = highestPowerOfTwoChunk - 1 - yDigit; // Two's complement for this chunk
            }

            xNormalized = xDivMod[0];
            yNormalized = yDivMod[0];
            resultChunks.push(bitwiseFn(xDigit, yDigit));
        }

        // Determine the sign of the result based on the bitwise operation on the sign bits
        const finalSignBitResult = bitwiseFn(xIsNegative ? 1 : 0, yIsNegative ? 1 : 0);
        let finalResult = finalSignBitResult !== 0 ? GrandNumberFactory.minusOne : GrandNumberFactory.zero;

        // Reconstruct the number from result chunks
        for (let i = resultChunks.length - 1; i >= 0; i--) {
            finalResult = finalResult.productOf(highestPowerOfTwoChunk).sumWith(GrandNumber(resultChunks[i]));
        }

        return finalResult;
    }

    ExtendedNumber.prototype.bitwiseNot = CompactNumber.prototype.bitwiseNot = PlatformBigInt.prototype.bitwiseNot = function() {
        return this.negate().decrement(); // ~x = -x - 1
    };

    ExtendedNumber.prototype.bitwiseAnd = CompactNumber.prototype.bitwiseAnd = PlatformBigInt.prototype.bitwiseAnd = function(otherValue) {
        return applyBitwiseOperation(this, otherValue, (a, b) => a & b);
    };

    ExtendedNumber.prototype.bitwiseOr = CompactNumber.prototype.bitwiseOr = PlatformBigInt.prototype.bitwiseOr = function(otherValue) {
        return applyBitwiseOperation(this, otherValue, (a, b) => a | b);
    };

    ExtendedNumber.prototype.bitwiseXor = CompactNumber.prototype.bitwiseXor = PlatformBigInt.prototype.bitwiseXor = function(otherValue) {
        return applyBitwiseOperation(this, otherValue, (a, b) => a ^ b);
    };

    // --- Utility Functions ---
    /**
     * Estimates the lowest one bit (LSB) of a number.
     * Used in GCD for optimization.
     * @param {AbstractNumber} num - The number to analyze.
     * @returns {number|BigInt} The value of the lowest one bit.
     */
    function estimateLowestOneBit(num) {
        const val = num.chunkArray; // Assume ExtendedNumber for this
        if (num.isCompact) return num.numericalValue & (-(num.numericalValue));
        if (HAS_NATIVE_BIGINT && num instanceof PlatformBigInt) return num.nativeBigIntValue & (-num.nativeBigIntValue);

        // For ExtendedNumber, combine first two chunks to get more LSB info
        const combinedChunk = val[0] + val[1] * CHUNK_BASE;
        return combinedChunk & (-combinedChunk);
    }

    /**
     * Calculates the integer logarithm (floor(log_base(value))).
     * @param {AbstractNumber} value - The number.
     * @param {AbstractNumber} base - The logarithm base.
     * @returns {{power: AbstractNumber, exponent: number}} Object with base raised to exponent, and exponent itself.
     */
    function calculateIntegerLog(value, base) {
        if (base.compareValues(value) <= 0) {
            const tempResult = calculateIntegerLog(value, base.square());
            const p = tempResult.power;
            const e = tempResult.exponent;
            const t = p.productOf(base);
            return t.compareValues(value) <= 0 ? { power: t, exponent: e * 2 + 1 } : { power: p, exponent: e * 2 };
        }
        return { power: GrandNumberFactory.one, exponent: 0 };
    }

    ExtendedNumber.prototype.bitLength = CompactNumber.prototype.bitLength = PlatformBigInt.prototype.bitLength = function() {
        let currentNum = this;
        if (currentNum.isNegativeVal()) {
            currentNum = currentNum.negate().decrement(); // Two's complement length
        }
        if (currentNum.isZero()) {
            return GrandNumberFactory.zero;
        }
        // Calculate bit length using integer logarithm base 2
        return GrandNumber(calculateIntegerLog(currentNum, GrandNumber(2)).exponent).sumWith(GrandNumber(1));
    };

    function findMaximum(numA, numB) {
        numA = parseAnyValue(numA);
        numB = parseAnyValue(numB);
        return numA.isGreater(numB) ? numA : numB;
    }

    function findMinimum(numA, numB) {
        numA = parseAnyValue(numA);
        numB = parseAnyValue(numB);
        return numA.isLesser(numB) ? numA : numB;
    }

    function computeGCD(numA, numB) {
        numA = parseAnyValue(numA).absoluteValue();
        numB = parseAnyValue(numB).absoluteValue();

        if (numA.isEqual(numB)) return numA;
        if (numA.isZero()) return numB;
        if (numB.isZero()) return numA;

        let commonFactor = GrandNumberFactory.one;
        let tempA = numA, tempB = numB, tempSwap;

        // Optimized Euclidean algorithm (binary GCD)
        while (tempA.isEvenVal() && tempB.isEvenVal()) {
            const lsbA = estimateLowestOneBit(tempA);
            const lsbB = estimateLowestOneBit(tempB);
            const minLsb = findMinimum(GrandNumber(lsbA), GrandNumber(lsbB));
            tempA = tempA.divisionResult(minLsb);
            tempB = tempB.divisionResult(minLsb);
            commonFactor = commonFactor.productOf(minLsb);
        }

        while (tempA.isEvenVal()) {
            tempA = tempA.divisionResult(estimateLowestOneBit(tempA));
        }

        do {
            while (tempB.isEvenVal()) {
                tempB = tempB.divisionResult(estimateLowestOneBit(tempB));
            }
            if (tempA.isGreater(tempB)) {
                tempSwap = tempB;
                tempB = tempA;
                tempA = tempSwap;
            }
            tempB = tempB.differenceWith(tempA);
        } while (!tempB.isZero());

        return commonFactor.productOf(tempA);
    }

    function computeLCM(numA, numB) {
        numA = parseAnyValue(numA).absoluteValue();
        numB = parseAnyValue(numB).absoluteValue();
        if (numA.isZero() || numB.isZero()) return GrandNumberFactory.zero;
        return numA.divisionResult(computeGCD(numA, numB)).productOf(numB);
    }

    function generateRandomBetween(lowerBound, upperBound) {
        lowerBound = parseAnyValue(lowerBound);
        upperBound = parseAnyValue(upperBound);

        const low = findMinimum(lowerBound, upperBound);
        const high = findMaximum(lowerBound, upperBound);
        const range = high.differenceWith(low).sumWith(1);

        if (range.isCompact) {
            return low.sumWith(Math.floor(Math.random() * range.numericalValue));
        }

        // For large ranges, generate random digits
        const rangeChunks = convertToArbitraryBase(range, CHUNK_BASE).value;
        const resultChunks = [];
        let isRestricted = true; // True if digits must be less than or equal to rangeChunks[i]

        for (let i = 0; i < rangeChunks.length; i++) {
            const upperLimit = isRestricted ? rangeChunks[i] : CHUNK_BASE;
            const randomDigit = floorOrCeil(Math.random() * upperLimit);
            resultChunks.push(randomDigit);
            if (randomDigit < upperLimit) isRestricted = false;
        }
        return low.sumWith(GrandNumberFactory.fromChunkArray(resultChunks, CHUNK_BASE, false));
    }

    /**
     * Parses a string representation of a number in an arbitrary base.
     * @param {string} textValue - The string to parse.
     * @param {number} baseRadix - The base (e.g., 10, 16).
     * @param {string} [customAlphabet=BASE_36_DIGITS] - Custom characters for digits.
     * @param {boolean} [caseSensitive=false] - Whether the alphabet is case-sensitive.
     * @returns {AbstractNumber} The parsed GrandNumber.
     */
    function parseArbitraryBaseString(textValue, baseRadix, customAlphabet, caseSensitive) {
        customAlphabet = customAlphabet || BASE_36_DIGITS;
        textValue = String(textValue);

        if (!caseSensitive) {
            textValue = textValue.toLowerCase();
            customAlphabet = customAlphabet.toLowerCase();
        }

        const absBase = Math.abs(baseRadix);
        const digitMap = {};
        for (let i = 0; i < customAlphabet.length; i++) {
            digitMap[customAlphabet[i]] = i;
        }

        // Validate digits in the input string
        for (let i = 0; i < textValue.length; i++) {
            const char = textValue[i];
            if (char === "-") continue;
            if (char in digitMap) {
                if (digitMap[char] >= absBase) {
                    if (char === "1" && absBase === 1) continue; // Special case for unary base 1
                    throw new Error(`Character '${char}' is not a valid digit in base ${baseRadix}.`);
                }
            } else if (char !== "<") { // Allow custom digit representation <N>
                throw new Error(`Character '${char}' is not a valid character for base ${baseRadix}.`);
            }
        }

        const baseNum = parseAnyValue(baseRadix);
        const digitValues = [];
        const isNegative = textValue[0] === "-";

        // Extract digit values, handling custom <N> format
        for (let i = isNegative ? 1 : 0; i < textValue.length; i++) {
            const char = textValue[i];
            if (char in digitMap) {
                digitValues.push(parseAnyValue(digitMap[char]));
            } else if (char === "<") {
                const startIdx = i;
                do {
                    i++;
                } while (textValue[i] !== ">" && i < textValue.length);
                digitValues.push(parseAnyValue(textValue.slice(startIdx + 1, i)));
            } else {
                // This case should ideally be caught by the earlier validation, but as a safeguard.
                throw new Error(`Unexpected character '${char}' during digit extraction.`);
            }
        }
        return constructFromBaseChunks(digitValues, baseNum, isNegative);
    }

    /**
     * Constructs a GrandNumber from an array of digit values and a base.
     * @param {AbstractNumber[]} digitValues - Array of GrandNumber instances representing digits.
     * @param {AbstractNumber} base - The base of the number system.
     * @param {boolean} isNegative - Whether the resulting number should be negative.
     * @returns {AbstractNumber} The constructed GrandNumber.
     */
    function constructFromBaseChunks(digitValues, base, isNegative) {
        let result = GrandNumberFactory.zero;
        let currentPower = GrandNumberFactory.one;

        // Horner's method for polynomial evaluation
        for (let i = digitValues.length - 1; i >= 0; i--) {
            result = result.sumWith(digitValues[i].productOf(currentPower));
            currentPower = currentPower.productOf(base);
        }
        return isNegative ? result.negate() : result;
    }

    /**
     * Converts a single digit (number) to its string representation using an alphabet.
     * @param {number} digit - The digit value.
     * @param {string} alphabet - The alphabet string.
     * @returns {string} The string representation of the digit.
     */
    function convertDigitToString(digit, alphabet) {
        alphabet = alphabet || BASE_36_DIGITS;
        if (digit < alphabet.length) {
            return alphabet[digit];
        }
        return `<${digit}>`; // For digits outside the alphabet range
    }

    /**
     * Converts a GrandNumber to an array of digits in a specified base.
     * @param {AbstractNumber} num - The GrandNumber to convert.
     * @param {AbstractNumber} base - The target base.
     * @returns {{value: number[], isNegative: boolean}} Object containing digit array and sign.
     */
    function convertToArbitraryBase(num, base) {
        base = GrandNumber(base); // Ensure base is a GrandNumber instance

        if (base.isZero()) {
            if (num.isZero()) return { value: [0], isNegative: false };
            throw new Error("Cannot convert non-zero numbers to base 0.");
        }
        if (base.isEqual(GrandNumberFactory.minusOne)) {
            // Special handling for base -1 (negabase)
            if (num.isZero()) return { value: [0], isNegative: false };
            // This case is complex and often requires specific algorithms.
            // For now, let's simplify or throw error if not directly implementable.
            // Original code has a complex array mapping. I'll simplify with an error for now
            // or provide a placeholder for complex negabase logic.
            // Original logic:
            // if(n.isNegative())return{value:[].concat.apply([],Array.apply(null,Array(-n.toJSNumber())).map(Array.prototype.valueOf,[1,0])),isNegative:false};
            // var arr=Array.apply(null,Array(n.toJSNumber()-1)).map(Array.prototype.valueOf,[0,1]);
            // arr.unshift([1]);return{value:[].concat.apply([],arr),isNegative:false}
            // For now, let's keep it simple:
            throw new Error("Conversion to base -1 is not fully implemented or optimized in this clone.");
        }

        let isResultNegative = false;
        if (num.isNegativeVal() && base.isPositiveVal()) {
            isResultNegative = true;
            num = num.absoluteValue();
        }

        if (base.isUnit()) {
            if (num.isZero()) return { value: [0], isNegative: false };
            // Unary representation (e.g., base 1)
            return { value: Array.from({ length: num.toJsNumber() }).fill(1), isNegative: isResultNegative };
        }

        const outputDigits = [];
        let currentLeftover = num;
        let divModResult;

        while (currentLeftover.isNegativeVal() || currentLeftover.compareAbsolute(base) >= 0) {
            divModResult = performDivisionAndModulus(currentLeftover, base);
            currentLeftover = divModResult[0]; // Quotient
            let digit = divModResult[1];      // Remainder

            if (digit.isNegativeVal()) {
                digit = base.differenceWith(digit).absoluteValue(); // Adjust negative remainder
                currentLeftover = currentLeftover.increment();       // Adjust quotient
            }
            outputDigits.push(digit.toJsNumber());
        }
        outputDigits.push(currentLeftover.toJsNumber()); // Add the last quotient

        return { value: outputDigits.reverse(), isNegative: isResultNegative };
    }

    /**
     * Converts a GrandNumber to its string representation in a specified base.
     * @param {AbstractNumber} num - The GrandNumber to convert.
     * @param {number} baseRadix - The target base (e.g., 10, 16).
     * @param {string} [alphabet=BASE_36_DIGITS] - Custom characters for digits.
     * @returns {string} The string representation.
     */
    function formatToBaseString(num, baseRadix, alphabet) {
        const converted = convertToArbitraryBase(num, baseRadix);
        const signPrefix = converted.isNegative ? "-" : "";
        const digitStrings = converted.value.map(digit => convertDigitToString(digit, alphabet));
        return signPrefix + digitStrings.join("");
    }

    ExtendedNumber.prototype.toDigitArray = CompactNumber.prototype.toDigitArray = PlatformBigInt.prototype.toDigitArray = function(radix) {
        return convertToArbitraryBase(this, radix);
    };

    ExtendedNumber.prototype.toString = function(radix, alphabet) {
        if (radix === undefined) radix = 10;
        if (radix !== 10) return formatToBaseString(this, radix, alphabet);

        const chunkArr = this.chunkArray;
        const len = chunkArr.length;
        // Start with the most significant chunk
        let resultString = String(chunkArr[len - 1]);
        const zeroPadding = "0000000"; // CHUNK_DIGIT_COUNT zeros

        // Append remaining chunks, ensuring proper padding
        for (let i = len - 2; i >= 0; --i) {
            const chunkString = String(chunkArr[i]);
            resultString += zeroPadding.slice(chunkString.length) + chunkString;
        }
        return (this.isNegative ? "-" : "") + resultString;
    };

    CompactNumber.prototype.toString = function(radix, alphabet) {
        if (radix === undefined) radix = 10;
        if (radix !== 10) return formatToBaseString(this, radix, alphabet);
        return String(this.numericalValue);
    };

    PlatformBigInt.prototype.toString = CompactNumber.prototype.toString; // Native BigInt toString is sufficient

    ExtendedNumber.prototype.toJsonValue = CompactNumber.prototype.toJsonValue = PlatformBigInt.prototype.toJsonValue = function() {
        return this.toString();
    };

    ExtendedNumber.prototype.valueOf = ExtendedNumber.prototype.toJsNumber = function() {
        return parseInt(this.toString(), 10); // Lossy conversion for large numbers
    };
    CompactNumber.prototype.valueOf = CompactNumber.prototype.toJsNumber = function() {
        return this.numericalValue;
    };
    PlatformBigInt.prototype.valueOf = PlatformBigInt.prototype.toJsNumber = function() {
        // Potentially lossy for very large BigInts
        return parseInt(this.toString(), 10);
    };

    /**
     * Parses a string into a GrandNumber. Handles scientific notation and checks for validity.
     * @param {string} strValue - The string to parse.
     * @returns {AbstractNumber} The parsed GrandNumber.
     */
    function parseStringRepresentation(strValue) {
        // Check if it's a simple number that fits in JS safe range
        if (isWithinJsSafeRange(+strValue)) {
            const num = +strValue;
            if (num === floorOrCeil(num)) {
                return HAS_NATIVE_BIGINT ? new PlatformBigInt(BigInt(num)) : new CompactNumber(num);
            }
            throw new Error(`Invalid integer: '${strValue}' has a fractional part.`);
        }

        let isNegative = strValue[0] === "-";
        if (isNegative) strValue = strValue.slice(1);

        // Handle scientific notation (e.g., "1.23e+5")
        const scientificSplit = strValue.split(/e/i);
        if (scientificSplit.length > 2) {
            throw new Error(`Invalid integer: Multiple 'e' characters in '${strValue}'.`);
        }
        if (scientificSplit.length === 2) {
            let exponentPart = scientificSplit[1];
            if (exponentPart[0] === "+") exponentPart = exponentPart.slice(1);
            exponentPart = +exponentPart;

            if (exponentPart !== floorOrCeil(exponentPart) || !isWithinJsSafeRange(exponentPart)) {
                throw new Error(`Invalid integer: exponent '${exponentPart}' is not a valid integer.`);
            }
            if (exponentPart < 0) {
                throw new Error("Cannot parse integer with negative exponent part (fractional result).");
            }

            let basePart = scientificSplit[0];
            const decimalPointIndex = basePart.indexOf(".");
            if (decimalPointIndex >= 0) {
                // Adjust exponent for decimal places
                exponentPart -= (basePart.length - decimalPointIndex - 1);
                basePart = basePart.slice(0, decimalPointIndex) + basePart.slice(decimalPointIndex + 1);
            }
            // Append zeros based on the adjusted exponent
            basePart += "0".repeat(exponentPart);
            strValue = basePart;
        }

        // Validate remaining string contains only digits
        if (!/^[0-9]+$/.test(strValue)) {
            throw new Error(`Invalid integer: '${strValue}' contains non-digit characters.`);
        }

        if (HAS_NATIVE_BIGINT) {
            return new PlatformBigInt(BigInt(isNegative ? `-${strValue}` : strValue));
        }

        // Convert string to chunk array
        const chunkArray = [];
        let maxIdx = strValue.length;
        const chunkSize = CHUNK_DIGIT_COUNT;
        let minIdx = maxIdx - chunkSize;

        while (maxIdx > 0) {
            chunkArray.push(+strValue.slice(Math.max(0, minIdx), maxIdx));
            minIdx -= chunkSize;
            maxIdx -= chunkSize;
        }
        normalizeChunkArray(chunkArray);
        return new ExtendedNumber(chunkArray, isNegative);
    }

    /**
     * Parses a JavaScript number into a GrandNumber.
     * @param {number} numValue - The number to parse.
     * @returns {AbstractNumber} The parsed GrandNumber.
     */
    function parseNumericPrimitive(numValue) {
        if (HAS_NATIVE_BIGINT) {
            return new PlatformBigInt(BigInt(numValue));
        }
        if (isWithinJsSafeRange(numValue)) {
            if (numValue !== floorOrCeil(numValue)) {
                throw new Error(`Number '${numValue}' is not an integer.`);
            }
            return new CompactNumber(numValue);
        }
        // If number is outside safe integer range, convert via string
        return parseStringRepresentation(numValue.toString());
    }

    /**
     * Parses any value (number, string, BigInt, or existing GrandNumber) into a GrandNumber instance.
     * @param {any} val - The value to parse.
     * @returns {AbstractNumber} A GrandNumber instance.
     */
    function parseAnyValue(val) {
        if (val === null || val === undefined) {
            throw new Error("Cannot parse null or undefined value into GrandNumber.");
        }
        if (typeof val === "number") {
            return parseNumericPrimitive(val);
        }
        if (typeof val === "string") {
            return parseStringRepresentation(val);
        }
        if (typeof val === "bigint") {
            return new PlatformBigInt(val);
        }
        // Assume it's already a GrandNumber instance
        return val;
    }

    // --- GrandNumber Factory Object ---
    // This object provides convenience methods and pre-computed common number instances.
    const GrandNumberFactory = function(value, radix, alphabet, caseSensitive) {
        // This acts as the main entry point (constructor for users)
        return AbstractNumber(value, radix, alphabet, caseSensitive);
    };

    // Pre-calculate common small integers for efficiency
    for (let i = 0; i < 1000; i++) {
        GrandNumberFactory[i] = parseAnyValue(i);
        if (i > 0) GrandNumberFactory[-i] = parseAnyValue(-i);
    }

    // Assign common constants
    GrandNumberFactory.one = GrandNumberFactory[1];
    GrandNumberFactory.zero = GrandNumberFactory[0];
    GrandNumberFactory.minusOne = GrandNumberFactory[-1];

    // Assign utility functions
    GrandNumberFactory.maximum = findMaximum;
    GrandNumberFactory.minimum = findMinimum;
    GrandNumberFactory.greatestCommonDivisor = computeGCD;
    GrandNumberFactory.leastCommonMultiple = computeLCM;
    GrandNumberFactory.isGrandNumberInstance = function(obj) {
        return obj instanceof ExtendedNumber || obj instanceof CompactNumber || obj instanceof PlatformBigInt;
    };
    GrandNumberFactory.randomBetween = generateRandomBetween;
    GrandNumberFactory.fromChunkArray = function(digitValues, base, isNegative) {
        // Map raw digit values to GrandNumber instances
        const parsedDigits = digitValues.map(parseAnyValue);
        return constructFromBaseChunks(parsedDigits, parseAnyValue(base || 10), isNegative);
    };

    return GrandNumberFactory;
})(); // End of GrandNumber IIFE

// Export for CommonJS compatibility
if (typeof module !== "undefined" && module.exports) {
    module.exports = GrandNumber;
}
// Export for AMD compatibility
if (typeof define === "function" && define.amd) {
    define("grand-number", [], function() {
        return GrandNumber;
    });
}

// --- Custom Binary Search Function ---
/**
 * @function findInsertionPoint
 * @description Performs a binary search on a sorted collection to find the index of a target element.
 *              If the element is not found, returns `-(insertion_point + 1)`.
 * @param {Array<any>} orderedCollection - The sorted array to search within.
 * @param {any} searchTarget - The element to search for.
 * @param {Function} [elementComparator=(a,b) => a-b] - Optional comparison function.
 * @returns {number} The index of the found element, or a negative value indicating insertion point.
 */
function findInsertionPoint(orderedCollection, searchTarget, elementComparator = (a, b) => a - b) {
    if (!orderedCollection || orderedCollection.length === 0) {
        // For an empty array, insertion point for any element is 0.
        // So, return -(0 + 1) = -1.
        return -1;
    }

    let lowPtr = 0;
    let highPtr = orderedCollection.length - 1;

    // Loop until pointers cross
    while (lowPtr <= highPtr) {
        const midPtr = Math.floor((lowPtr + highPtr) / 2); // Calculate middle index
        const currentValue = orderedCollection[midPtr];
        const comparisonResult = elementComparator(searchTarget, currentValue);

        if (comparisonResult > 0) {
            // Target is greater, search in the right half
            lowPtr = midPtr + 1;
        } else if (comparisonResult < 0) {
            // Target is lesser, search in the left half
            highPtr = midPtr - 1;
        } else {
            // Target found
            return midPtr;
        }
    }
    // Element not found. lowPtr indicates the insertion point.
    // Return -(insertion_point + 1) to distinguish from found index 0.
    return -lowPtr - 1;
}

// --- Main Application Logic ---
/**
 * @function obtainStandardInput
 * @description Helper function to read input from standard input (stdin).
 * @returns {string} The content read from stdin.
 */
function obtainStandardInput() {
    try {
        const fs = require("fs");
        return fs.readFileSync("/dev/stdin", "utf8");
    } catch (error) {
        console.error("Error reading from stdin:", error);
        // Fallback or handle error appropriately in a real application
        return "";
    }
}

/**
 * @function buildIndexMap
 * @description Populates a map where keys are values and values are arrays of indices
 *              where that value appears in the sequence.
 * @param {number[]} itemValuesArray - The sequence of numerical item values.
 * @param {object} mapToPopulate - The object to populate with value-to-indices mapping.
 */
function buildIndexMap(itemValuesArray, mapToPopulate) {
    for (let currentIdx = 0; currentIdx < itemValuesArray.length; currentIdx++) {
        const currentVal = itemValuesArray[currentIdx];
        if (!mapToPopulate[currentVal]) {
            mapToPopulate[currentVal] = [currentIdx];
        } else {
            mapToPopulate[currentVal].push(currentIdx);
        }
    }
}

/**
 * @function executeSequenceProcessing
 * @description Main function to process the input sequence and compute cumulative path counts.
 * @param {string} sourceTextContent - The raw input string containing sequence data.
 */
function executeSequenceProcessing(sourceTextContent) {
    const dataParser = new InputScanner(sourceTextContent);

    const sequenceItemCount = dataParser.getNextToken();
    if (sequenceItemCount === undefined || sequenceItemCount <= 0) {
        console.log("0"); // No items to process, output 0 paths.
        return;
    }

    const itemValuesArray = [];
    const valueToIndexMap = {}; // Stores { value: [index1, index2, ...] }

    // Read all item values and populate the index map
    for (let i = 0; i < sequenceItemCount; i++) {
        const currentReadValue = dataParser.getNextToken();
        itemValuesArray.push(currentReadValue);
    }
    buildIndexMap(itemValuesArray, valueToIndexMap);

    const MODULO_DIVISOR = GrandNumber(1000000007); // Use GrandNumber for modulus

    // Initialize an array to store cumulative path counts
    const computedPathCounts = new Array(sequenceItemCount);
    computedPathCounts[0] = GrandNumber(1); // Base case: one path to the first element

    // Iterate through the sequence to compute path counts
    for (let currentIndex = 1; currentIndex < sequenceItemCount; currentIndex++) {
        const currentElement = itemValuesArray[currentIndex];
        const previousElement = itemValuesArray[currentIndex - 1];
        const pathsToPreviousIndex = computedPathCounts[currentIndex - 1];

        if (currentElement === previousElement) {
            // If current element is same as previous, paths are simply inherited
            computedPathCounts[currentIndex] = pathsToPreviousIndex;
        } else {
            // Find all occurrences of the current element
            const indicesOfCurrentElement = valueToIndexMap[currentElement];

            // Perform binary search to find the position of `currentIndex` within its own index list.
            // This is to find the previous occurrence of `currentElement`.
            const foundIdxInMapList = findInsertionPoint(indicesOfCurrentElement, currentIndex);
            // The previous occurrence will be at `foundIdxInMapList - 1`
            const previousOccurrenceIndex = indicesOfCurrentElement[foundIdxInMapList - 1];

            if (previousOccurrenceIndex !== undefined) {
                // If a previous occurrence exists, add paths from previous index and paths from that occurrence.
                const pathsFromPreviousOccurrence = computedPathCounts[previousOccurrenceIndex];
                computedPathCounts[currentIndex] = pathsToPreviousIndex.sumWith(pathsFromPreviousOccurrence);
            } else {
                // If no previous occurrence, paths are simply inherited from previous index.
                computedPathCounts[currentIndex] = pathsToPreviousIndex;
            }
        }
    }

    // Output the result modulo the divisor
    const finalResult = computedPathCounts[sequenceItemCount - 1];
    console.log(finalResult.modulusResult(MODULO_DIVISOR).toString());
}

// Execute the main processing function with standard input
executeSequenceProcessing(obtainStandardInput());