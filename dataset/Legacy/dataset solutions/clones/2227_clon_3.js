const InputProcessor = (function() {
    /**
     * Factory function to create a new StreamReader instance.
     * @param {string} rawInputString - The complete input string to be processed.
     * @returns {StreamReader} An initialized StreamReader.
     */
    function createReader(rawInputString) {
        return new StreamReader(rawInputString);
    }

    /**
     * @class StreamReader
     * Manages parsing lines and tokens from a multi-line input string.
     */
    function StreamReader(rawInputString) {
        // Store all input lines, trimmed and split by newline.
        // Adding a guard for empty input.
        this.inputDataLines = rawInputString ? rawInputString.trim().split("\n") : [];
        // Pointer to the current line being processed.
        this.currentLinePointer = 0;
    }

    /**
     * Extracts a single token from the current line.
     * Tokens are space-separated. The internal line representation is modified
     * to allow popping tokens efficiently.
     * @param {boolean} [asString=false] - If true, returns the token as a string; otherwise, converts to number.
     * @returns {string|number|null} The extracted token, or null if no more input.
     */
    StreamReader.prototype.extractToken = function(asString = false) {
        if (this.currentLinePointer >= this.inputDataLines.length) {
            return null; // No more lines to read.
        }

        // If the current line hasn't been split into tokens yet, do it.
        if (typeof this.inputDataLines[this.currentLinePointer] === "string") {
            this.inputDataLines[this.currentLinePointer] = this.inputDataLines[this.currentLinePointer].split(" ").reverse();
        }

        const tokenValue = this.inputDataLines[this.currentLinePointer].pop();

        // If all tokens from the current line have been consumed, advance the line pointer.
        if (this.inputDataLines[this.currentLinePointer].length === 0) {
            this.currentLinePointer++;
        }

        return asString ? tokenValue : +tokenValue;
    };

    /**
     * Reads an entire line of space-separated values and advances the line pointer.
     * @param {boolean} [asStrings=false] - If true, returns tokens as strings; otherwise, converts to numbers.
     * @returns {Array<string|number>} An array of values from the line. Returns empty array if no more lines.
     */
    StreamReader.prototype.fetchLineData = function(asStrings = false) {
        if (this.currentLinePointer >= this.inputDataLines.length) {
            return [];
        }
        const lineContent = this.inputDataLines[this.currentLinePointer++];
        const lineValues = lineContent ? lineContent.split(" ") : [];
        return asStrings ? lineValues : lineValues.map(val => +val);
    };

    /**
     * Reads a block of `numRows` lines, parsing each into an array of numbers.
     * Advances the line pointer by `numRows`.
     * @param {number} numRows - The number of lines to read.
     * @param {boolean} [asStrings=false] - If true, returns values as strings; otherwise, converts to numbers.
     * @returns {Array<Array<string|number>>} A 2D array (matrix) of values.
     */
    StreamReader.prototype.getGridData = function(numRows, asStrings = false) {
        const startIdx = this.currentLinePointer;
        const endIdx = startIdx + numRows;
        // Provide a warning if trying to read beyond available input.
        if (endIdx > this.inputDataLines.length) {
             console.warn(`Attempted to read ${numRows} lines for grid, but only ${this.inputDataLines.length - startIdx} remaining.`);
        }
        const blockLines = this.inputDataLines.slice(startIdx, endIdx);
        this.currentLinePointer = endIdx; // Advance pointer.

        const processedBlock = blockLines.map(line => line.split(" "));
        return asStrings ? processedBlock : processedBlock.map(row => row.map(val => +val));
    };

    /**
     * Reads a block of `numRows` lines, treating each line as a single scalar value.
     * Advances the line pointer by `numRows`.
     * @param {number} numRows - The number of lines to read.
     * @param {boolean} [asStrings=false] - If true, returns values as strings; otherwise, converts to numbers.
     * @returns {Array<string|number>} An array of scalar values.
     */
    StreamReader.prototype.grabScalarBlock = function(numRows, asStrings = false) {
        const startIdx = this.currentLinePointer;
        const endIdx = startIdx + numRows;
        // Provide a warning if trying to read beyond available input.
        if (endIdx > this.inputDataLines.length) {
             console.warn(`Attempted to read ${numRows} scalar lines, but only ${this.inputDataLines.length - startIdx} remaining.`);
        }
        const blockLines = this.inputDataLines.slice(startIdx, endIdx);
        this.currentLinePointer = endIdx; // Advance pointer.

        return asStrings ? blockLines : blockLines.map(val => +val);
    };

    return createReader;
})();

// Instantiate the input reader, typically for Node.js standard input.
const inputSource = InputProcessor(require("fs").readFileSync("/dev/stdin", "utf8"));

/**
 * Creates a multi-dimensional array filled with a specified value.
 * This is a recursive, safe implementation, replacing the original `eval`-based `xArray`.
 * @param {*} fillValue - The value to fill the array with.
 * @param {...number} dimensions - The sizes of each dimension, from outermost to innermost.
 * @returns {Array|*} The created multi-dimensional array, or just `fillValue` if no dimensions.
 */
function buildMultiDimArray(fillValue, ...dimensions) {
    // If no dimensions are provided, return the fill value itself.
    if (!Array.isArray(dimensions) || dimensions.length === 0) {
        return fillValue;
    }

    const currentDimensionSize = dimensions[0];
    const remainingDimensions = dimensions.slice(1);
    const newArray = new Array(currentDimensionSize);

    for (let i = 0; i < currentDimensionSize; i++) {
        // Recursively build the next level of the array.
        newArray[i] = buildMultiDimArray(fillValue, ...remainingDimensions);
    }
    return newArray;
}


// --- Arbitrary Precision Numeric Operations Module ---
// This module provides a custom implementation for handling numbers larger than
// JavaScript's native Number.MAX_SAFE_INTEGER, supporting various arithmetic operations.
const ArbitraryPrecisionMath = (function(undefined) { // Using 'undefined' as a local variable for robustness.
    // Configuration constants for the BigInt implementation.
    // The base for chunking large numbers (e.g., 10^7 for 7 digits).
    const CHUNK_RADIX = 1e7;
    // Number of decimal digits per chunk.
    const DIGITS_PER_CHUNK = 7;
    // JavaScript's maximum safe integer (2^53 - 1).
    const JS_MAX_SAFE_INTEGER = 9007199254740992;
    // JS_MAX_SAFE_INTEGER represented as an array of chunks.
    const JS_MAX_SAFE_INTEGER_CHUNKS = convertSmallNumToChunks(JS_MAX_SAFE_INTEGER);
    // Logarithm base 2 of JS_MAX_SAFE_INTEGER, used for parsing optimizations.
    const LOG_JS_MAX_SAFE_INTEGER = Math.log(JS_MAX_SAFE_INTEGER);

    /**
     * @class AbstractNumericValue
     * Base class for all numeric types in this library.
     */
    function AbstractNumericValue(val, base) {
        // If no value, return a cached zero instance.
        if (typeof val === "undefined") return AbstractNumericValue.ZERO;
        // If a base is provided, parse the value as a string in that base.
        if (typeof base !== "undefined") {
            return (+base === 10) ? parseInputToNumeric(val) : parseStringWithBase(val, base);
        }
        // Otherwise, parse the value directly.
        return parseInputToNumeric(val);
    }

    /**
     * @class LargeNumericValue
     * Represents numbers that exceed JavaScript's safe integer limit, stored as an array of chunks.
     * @param {Array<number>} chunkArray - An array of number chunks, where each chunk is < CHUNK_RADIX.
     * @param {boolean} isNegative - True if the number is negative.
     */
    function LargeNumericValue(chunkArray, isNegative) {
        this.chunkArray = chunkArray;
        this.isNegative = isNegative;
        this.isCompact = false; // Flag to indicate it's a large number.
    }
    LargeNumericValue.prototype = Object.create(AbstractNumericValue.prototype);

    /**
     * @class CompactNumericValue
     * Represents numbers that fit within JavaScript's safe integer limit.
     * @param {number} rawValue - The native JavaScript number.
     */
    function CompactNumericValue(rawValue) {
        this.rawValue = rawValue;
        this.isNegative = rawValue < 0;
        this.isCompact = true; // Flag to indicate it's a compact number.
    }
    CompactNumericValue.prototype = Object.create(AbstractNumericValue.prototype);

    /**
     * Checks if a native JavaScript number is within the safe integer range.
     * @param {number} n - The number to check.
     * @returns {boolean} True if the number is safe, false otherwise.
     */
    function isJsSafeInteger(n) {
        return -JS_MAX_SAFE_INTEGER < n && n < JS_MAX_SAFE_INTEGER;
    }

    /**
     * Converts a small native number into an array of chunks.
     * @param {number} n - The small integer.
     * @returns {Array<number>} The chunk array representation.
     */
    function convertSmallNumToChunks(n) {
        if (n < CHUNK_RADIX) return [n];
        if (n < 1e14) return [n % CHUNK_RADIX, Math.floor(n / CHUNK_RADIX)];
        return [n % CHUNK_RADIX, Math.floor(n / CHUNK_RADIX) % CHUNK_RADIX, Math.floor(n / 1e14)];
    }

    /**
     * Converts an array of chunks back into a small native number if possible.
     * @param {Array<number>} chunks - The chunk array.
     * @returns {number|Array<number>} The small number or the original chunk array if too large.
     */
    function convertChunksToSmallNum(chunks) {
        normalizeChunkArray(chunks);
        const chunkCount = chunks.length;
        if (chunkCount < 4 && compareAbsoluteChunks(chunks, JS_MAX_SAFE_INTEGER_CHUNKS) < 0) {
            switch (chunkCount) {
                case 0: return 0;
                case 1: return chunks[0];
                case 2: return chunks[0] + chunks[1] * CHUNK_RADIX;
                default: return chunks[0] + (chunks[1] + chunks[2] * CHUNK_RADIX) * CHUNK_RADIX;
            }
        }
        return chunks;
    }

    /**
     * Removes leading zero chunks from an array.
     * @param {Array<number>} chunkArr - The array of chunks.
     */
    function normalizeChunkArray(chunkArr) {
        let i = chunkArr.length;
        while (i-- > 0 && chunkArr[i] === 0);
        chunkArr.length = i + 1;
    }

    /**
     * Creates a new array filled with zeros.
     * @param {number} length - The desired length of the array.
     * @returns {Array<number>} The new zero-filled array.
     */
    function createZeroFilledArray(length) {
        const arr = new Array(length);
        for (let i = 0; i < length; i++) {
            arr[i] = 0;
        }
        return arr;
    }

    /**
     * Truncates a number (removes decimal part).
     * @param {number} n - The number to truncate.
     * @returns {number} The truncated integer.
     */
    function floorOrCeil(n) {
        return n > 0 ? Math.floor(n) : Math.ceil(n);
    }

    /**
     * Adds two chunk arrays. Assumes `a` is longer or equal length to `b`.
     * @param {Array<number>} a - First chunk array (longer).
     * @param {Array<number>} b - Second chunk array (shorter).
     * @returns {Array<number>} The sum as a new chunk array.
     */
    function addChunkArrays(a, b) {
        const lenA = a.length, lenB = b.length;
        const result = new Array(lenA);
        let carry = 0;
        let sum;

        for (let i = 0; i < lenB; i++) {
            sum = a[i] + b[i] + carry;
            carry = sum >= CHUNK_RADIX ? 1 : 0;
            result[i] = sum - carry * CHUNK_RADIX;
        }
        for (let i = lenB; i < lenA; i++) {
            sum = a[i] + carry;
            carry = sum === CHUNK_RADIX ? 1 : 0;
            result[i] = sum - carry * CHUNK_RADIX;
        }
        if (carry > 0) result.push(carry);
        return result;
    }

    /**
     * Adds two chunk arrays, handling length differences by ensuring the longer is first.
     * @param {Array<number>} a - First chunk array.
     * @param {Array<number>} b - Second chunk array.
     * @returns {Array<number>} The sum as a new chunk array.
     */
    function addChunkArraysGeneral(a, b) {
        return a.length >= b.length ? addChunkArrays(a, b) : addChunkArrays(b, a);
    }

    /**
     * Adds a small integer to a chunk array.
     * @param {Array<number>} arr - The chunk array.
     * @param {number} smallInt - The small integer to add.
     * @returns {Array<number>} The sum as a new chunk array.
     */
    function addSmallIntToChunkArray(arr, smallInt) {
        const len = arr.length;
        const result = new Array(len);
        let carry = smallInt; // Start with the small integer as initial carry.
        let sum;

        for (let i = 0; i < len; i++) {
            sum = arr[i] + carry;
            carry = Math.floor(sum / CHUNK_RADIX);
            result[i] = sum % CHUNK_RADIX; // Remainder is the new digit.
        }
        while (carry > 0) {
            result.push(carry % CHUNK_RADIX);
            carry = Math.floor(carry / CHUNK_RADIX);
        }
        return result;
    }

    // --- Addition Methods ---
    LargeNumericValue.prototype.add = function(other) {
        const otherNum = parseInputToNumeric(other);
        if (this.isNegative !== otherNum.isNegative) {
            // If signs differ, convert to subtraction (this - (-otherNum) = this + otherNum).
            return this.subtract(otherNum.negate());
        }
        const valA = this.chunkArray;
        if (otherNum.isCompact) {
            return new LargeNumericValue(addSmallIntToChunkArray(valA, Math.abs(otherNum.rawValue)), this.isNegative);
        }
        const valB = otherNum.chunkArray;
        return new LargeNumericValue(addChunkArraysGeneral(valA, valB), this.isNegative);
    };
    LargeNumericValue.prototype.plus = LargeNumericValue.prototype.add;

    CompactNumericValue.prototype.add = function(other) {
        const otherNum = parseInputToNumeric(other);
        const valA = this.rawValue;
        if (valA < 0 !== otherNum.isNegative) {
            // If signs differ, convert to subtraction.
            return this.subtract(otherNum.negate());
        }
        const valB = otherNum.rawValue;
        if (otherNum.isCompact) {
            const sum = valA + valB;
            if (isJsSafeInteger(sum)) return new CompactNumericValue(sum);
            // If sum overflows, convert to large number addition.
            // Temporarily convert otherNum's rawValue to chunks for the addSmallIntToChunkArray.
            return new LargeNumericValue(addSmallIntToChunkArray(convertSmallNumToChunks(Math.abs(valB)), Math.abs(valA)), valA < 0);
        }
        // Compact number + Large number.
        return new LargeNumericValue(addSmallIntToChunkArray(otherNum.chunkArray, Math.abs(valA)), valA < 0);
    };
    CompactNumericValue.prototype.plus = CompactNumericValue.prototype.add;

    /**
     * Subtracts chunk array `b` from `a`. Assumes `a >= b` (absolute values).
     * @param {Array<number>} a - The minuend chunk array.
     * @param {Array<number>} b - The subtrahend chunk array.
     * @returns {Array<number>} The difference as a new chunk array.
     */
    function subtractChunkArrays(a, b) {
        const lenA = a.length, lenB = b.length;
        const result = new Array(lenA);
        let borrow = 0;
        let difference;

        for (let i = 0; i < lenB; i++) {
            difference = a[i] - borrow - b[i];
            if (difference < 0) {
                difference += CHUNK_RADIX;
                borrow = 1;
            } else borrow = 0;
            result[i] = difference;
        }
        for (let i = lenB; i < lenA; i++) {
            difference = a[i] - borrow;
            if (difference < 0) difference += CHUNK_RADIX;
            else {
                result[i++] = difference;
                break; // No more borrows needed.
            }
            result[i] = difference;
        }
        // Copy remaining chunks if any.
        for (; i < lenA; i++) {
            result[i] = a[i];
        }
        normalizeChunkArray(result);
        return result;
    }

    /**
     * Subtracts two chunk arrays, handling signs and magnitude.
     * @param {Array<number>} a - First chunk array.
     * @param {Array<number>} b - Second chunk array.
     * @param {boolean} currentSign - The sign of the result if `|a| >= |b|`.
     * @returns {CompactNumericValue|LargeNumericValue} The difference.
     */
    function subtractChunkArraysGeneral(a, b, currentSign) {
        let resultChunks;
        if (compareAbsoluteChunks(a, b) >= 0) {
            resultChunks = subtractChunkArrays(a, b);
        } else {
            resultChunks = subtractChunkArrays(b, a);
            currentSign = !currentSign; // Flip sign if |b| > |a|.
        }
        const compactResult = convertChunksToSmallNum(resultChunks);
        if (typeof compactResult === "number") {
            if (currentSign) compactResult = -compactResult;
            return new CompactNumericValue(compactResult);
        }
        return new LargeNumericValue(compactResult, currentSign);
    }

    /**
     * Subtracts a small integer from a chunk array.
     * @param {Array<number>} arr - The chunk array.
     * @param {number} smallInt - The small integer to subtract (absolute value).
     * @param {boolean} isNegativeResult - The expected sign of the result.
     * @returns {CompactNumericValue|LargeNumericValue} The difference.
     */
    function subtractSmallIntFromChunkArray(arr, smallInt, isNegativeResult) {
        const len = arr.length;
        const result = new Array(len);
        let carry = -smallInt; // Use negative smallInt as initial carry for subtraction.
        let difference;

        for (let i = 0; i < len; i++) {
            difference = arr[i] + carry;
            carry = Math.floor(difference / CHUNK_RADIX); // This carry will be negative if borrow.
            difference %= CHUNK_RADIX;
            result[i] = difference < 0 ? difference + CHUNK_RADIX : difference;
        }
        const compactResult = convertChunksToSmallNum(result);
        if (typeof compactResult === "number") {
            if (isNegativeResult) compactResult = -compactResult;
            return new CompactNumericValue(compactResult);
        }
        return new LargeNumericValue(compactResult, isNegativeResult);
    }

    // --- Subtraction Methods ---
    LargeNumericValue.prototype.subtract = function(other) {
        const otherNum = parseInputToNumeric(other);
        if (this.isNegative !== otherNum.isNegative) {
            // If signs differ, convert to addition (this - (-otherNum) = this + otherNum).
            return this.add(otherNum.negate());
        }
        const valA = this.chunkArray;
        if (otherNum.isCompact) return subtractSmallIntFromChunkArray(valA, Math.abs(otherNum.rawValue), this.isNegative);
        const valB = otherNum.chunkArray;
        return subtractChunkArraysGeneral(valA, valB, this.isNegative);
    };
    LargeNumericValue.prototype.minus = LargeNumericValue.prototype.subtract;

    CompactNumericValue.prototype.subtract = function(other) {
        const otherNum = parseInputToNumeric(other);
        const valA = this.rawValue;
        if (valA < 0 !== otherNum.isNegative) {
            // If signs differ, convert to addition.
            return this.add(otherNum.negate());
        }
        const valB = otherNum.rawValue;
        if (otherNum.isCompact) {
            return new CompactNumericValue(valA - valB);
        }
        // Small num - Large num (same sign). Equivalent to -(Large num - Small num).
        return subtractSmallIntFromChunkArray(otherNum.chunkArray, Math.abs(valA), valA >= 0);
    };
    CompactNumericValue.prototype.minus = CompactNumericValue.prototype.subtract;

    // --- Negation & Absolute Value ---
    LargeNumericValue.prototype.negate = function() {
        return new LargeNumericValue(this.chunkArray, !this.isNegative);
    };
    CompactNumericValue.prototype.negate = function() {
        const negVal = new CompactNumericValue(-this.rawValue);
        negVal.isNegative = !this.isNegative; // Explicitly set sign for clarity.
        return negVal;
    };

    LargeNumericValue.prototype.abs = function() {
        return new LargeNumericValue(this.chunkArray, false);
    };
    CompactNumericValue.prototype.abs = function() {
        return new CompactNumericValue(Math.abs(this.rawValue));
    };

    // --- Multiplication ---
    /**
     * Performs long multiplication on two chunk arrays.
     * @param {Array<number>} a - First chunk array.
     * @param {Array<number>} b - Second chunk array.
     * @returns {Array<number>} The product as a new chunk array.
     */
    function longMultiplyChunks(a, b) {
        const lenA = a.length, lenB = b.length;
        const result = createZeroFilledArray(lenA + lenB);
        let product, carry;

        for (let i = 0; i < lenA; ++i) {
            const chunkA = a[i];
            for (let j = 0; j < lenB; ++j) {
                const chunkB = b[j];
                product = chunkA * chunkB + result[i + j];
                carry = Math.floor(product / CHUNK_RADIX);
                result[i + j] = product - carry * CHUNK_RADIX;
                result[i + j + 1] += carry; // Add carry to the next position.
            }
        }
        normalizeChunkArray(result);
        return result;
    }

    /**
     * Multiplies a chunk array by a small integer.
     * @param {Array<number>} arr - The chunk array.
     * @param {number} smallInt - The small integer multiplier.
     * @returns {Array<number>} The product as a new chunk array.
     */
    function multiplyChunksBySmall(arr, smallInt) {
        const len = arr.length;
        const result = new Array(len);
        let carry = 0;
        let product;

        for (let i = 0; i < len; i++) {
            product = arr[i] * smallInt + carry;
            carry = Math.floor(product / CHUNK_RADIX);
            result[i] = product - carry * CHUNK_RADIX;
        }
        while (carry > 0) {
            result.push(carry % CHUNK_RADIX);
            carry = Math.floor(carry / CHUNK_RADIX);
        }
        return result;
    }

    /**
     * Shifts a chunk array left by padding with zeros.
     * @param {Array<number>} arr - The chunk array.
     * @param {number} numZeros - Number of zeros to prepend.
     * @returns {Array<number>} The shifted array.
     */
    function prependZeros(arr, numZeros) {
        const zeros = [];
        while (numZeros-- > 0) zeros.push(0);
        return zeros.concat(arr);
    }

    /**
     * Karatsuba multiplication algorithm for faster large number multiplication.
     * @param {Array<number>} x - First chunk array.
     * @param {Array<number>} y - Second chunk array.
     * @returns {Array<number>} The product.
     */
    function karatsubaMultiply(x, y) {
        const len = Math.max(x.length, y.length);
        if (len <= 30) return longMultiplyChunks(x, y); // Base case for small arrays.

        const halfLen = Math.ceil(len / 2);
        const x_low = x.slice(0, halfLen);
        const x_high = x.slice(halfLen);
        const y_low = y.slice(0, halfLen);
        const y_high = y.slice(halfLen);

        const prod_low = karatsubaMultiply(x_low, y_low); // ac
        const prod_high = karatsubaMultiply(x_high, y_high); // bd
        const sum_x = addChunkArraysGeneral(x_low, x_high);
        const sum_y = addChunkArraysGeneral(y_low, y_high);
        const prod_sums = karatsubaMultiply(sum_x, sum_y); // (a+b)(c+d)

        // (a+b)(c+d) - ac - bd = ad + bc
        const middle_term = subtractChunkArrays(subtractChunkArrays(prod_sums, prod_low), prod_high);

        // Result = prod_high * (CHUNK_RADIX^(2*halfLen)) + middle_term * (CHUNK_RADIX^halfLen) + prod_low
        let product = addChunkArraysGeneral(
            addChunkArraysGeneral(
                prod_low,
                prependZeros(middle_term, halfLen)
            ),
            prependZeros(prod_high, 2 * halfLen)
        );
        normalizeChunkArray(product);
        return product;
    }

    /**
     * Heuristic to decide whether to use Karatsuba algorithm.
     * @param {number} len1 - Length of first array.
     * @param {number} len2 - Length of second array.
     * @returns {boolean} True if Karatsuba is likely faster.
     */
    function shouldUseKaratsuba(len1, len2) {
        // Original heuristic from `big-integer` library.
        return -.012 * len1 - .012 * len2 + 15e-6 * len1 * len2 > 0;
    }

    LargeNumericValue.prototype.multiply = function(other) {
        const otherNum = parseInputToNumeric(other);
        const valA = this.chunkArray;
        const resultIsNegative = this.isNegative !== otherNum.isNegative;
        let absProductChunks;

        if (otherNum.isCompact) {
            if (otherNum.rawValue === 0) return AbstractNumericValue.ZERO;
            if (otherNum.rawValue === 1) return this;
            if (otherNum.rawValue === -1) return this.negate();
            const absSmall = Math.abs(otherNum.rawValue);
            if (absSmall < CHUNK_RADIX) {
                return new LargeNumericValue(multiplyChunksBySmall(valA, absSmall), resultIsNegative);
            }
            // If small integer is larger than a chunk, convert it to chunks.
            absProductChunks = longMultiplyChunks(valA, convertSmallNumToChunks(absSmall));
        } else {
            // Both are large numbers.
            const valB = otherNum.chunkArray;
            absProductChunks = shouldUseKaratsuba(valA.length, valB.length) ? karatsubaMultiply(valA, valB) : longMultiplyChunks(valA, valB);
        }
        return new LargeNumericValue(absProductChunks, resultIsNegative);
    };
    LargeNumericValue.prototype.times = LargeNumericValue.prototype.multiply;

    // Helper for multiplying small integer by chunk array.
    function multiplySmallNumAndChunkArray(smallVal, chunkArr, resultIsNegative) {
        if (smallVal < CHUNK_RADIX) {
            return new LargeNumericValue(multiplyChunksBySmall(chunkArr, smallVal), resultIsNegative);
        }
        return new LargeNumericValue(longMultiplyChunks(chunkArr, convertSmallNumToChunks(smallVal)), resultIsNegative);
    }

    LargeNumericValue.prototype._multiplyByCompact = function(compactNum) {
        if (compactNum.rawValue === 0) return AbstractNumericValue.ZERO;
        if (compactNum.rawValue === 1) return this;
        if (compactNum.rawValue === -1) return this.negate();
        return multiplySmallNumAndChunkArray(Math.abs(compactNum.rawValue), this.chunkArray, this.isNegative !== compactNum.isNegative);
    };

    CompactNumericValue.prototype.multiply = function(other) {
        const otherNum = parseInputToNumeric(other);
        return otherNum._multiplyByCompact(this); // Delegate to the other number's internal method.
    };
    CompactNumericValue.prototype.times = CompactNumericValue.prototype.multiply;

    CompactNumericValue.prototype._multiplyByCompact = function(compactNum) {
        // Both are compact numbers.
        const product = compactNum.rawValue * this.rawValue;
        if (isJsSafeInteger(product)) {
            return new CompactNumericValue(product);
        }
        // Overflow, convert to large number multiplication.
        return multiplySmallNumAndChunkArray(
            Math.abs(compactNum.rawValue),
            convertSmallNumToChunks(Math.abs(this.rawValue)),
            this.isNegative !== compactNum.isNegative
        );
    };

    /**
     * Squares a chunk array (multiplies it by itself).
     * @param {Array<number>} a - The chunk array.
     * @returns {Array<number>} The squared chunk array.
     */
    function squareChunkArray(a) {
        const len = a.length;
        const result = createZeroFilledArray(len + len);
        let product, carry;

        for (let i = 0; i < len; i++) {
            const chunkA_i = a[i];
            carry = 0;
            for (let j = 0; j < len; j++) {
                const chunkA_j = a[j];
                product = chunkA_i * chunkA_j + result[i + j] + carry;
                carry = Math.floor(product / CHUNK_RADIX);
                result[i + j] = product - carry * CHUNK_RADIX;
            }
            result[i + len] += carry;
        }
        normalizeChunkArray(result);
        return result;
    }

    LargeNumericValue.prototype.square = function() {
        return new LargeNumericValue(squareChunkArray(this.chunkArray), false);
    };
    CompactNumericValue.prototype.square = function() {
        const valSquared = this.rawValue * this.rawValue;
        if (isJsSafeInteger(valSquared)) return new CompactNumericValue(valSquared);
        return new LargeNumericValue(squareChunkArray(convertSmallNumToChunks(Math.abs(this.rawValue))), false);
    };

    // --- Division and Modulo ---
    // The division algorithms are complex and directly ported with renaming.

    /**
     * Division algorithm variant 1 (faster for smaller numbers).
     */
    function divideAndModVariant1(dividendChunks, divisorChunks) {
        const len_dividend = dividendChunks.length, len_divisor = divisorChunks.length;
        const result_quotient = createZeroFilledArray(len_dividend - len_divisor + 1); // Max possible length.
        const d_msd = divisorChunks[len_divisor - 1]; // Divisor Most Significant Digit.
        const lambda = Math.ceil(CHUNK_RADIX / (2 * d_msd)); // Normalization factor.

        let normalized_dividend = multiplyChunksBySmall(dividendChunks, lambda);
        let normalized_divisor = multiplyChunksBySmall(divisorChunks, lambda);

        // Ensure dividend has enough leading zeros for subtraction (max one extra chunk).
        if (normalized_dividend.length <= len_dividend) normalized_dividend.push(0);
        normalized_divisor.push(0); // Pad divisor for comparison.

        const n_d_msd = normalized_divisor[len_divisor - 1]; // Normalized Divisor MSD.

        for (let shift = len_dividend - len_divisor; shift >= 0; shift--) {
            let current_quotient_digit = CHUNK_RADIX - 1;
            // Estimate quotient digit based on most significant chunks.
            if (normalized_dividend[shift + len_divisor] !== n_d_msd) {
                current_quotient_digit = Math.floor((normalized_dividend[shift + len_divisor] * CHUNK_RADIX + normalized_dividend[shift + len_divisor - 1]) / n_d_msd);
            }

            let carry = 0;
            let borrow = 0;
            const temp_divisor_len = normalized_divisor.length;
            // Subtract `current_quotient_digit * normalized_divisor` from `normalized_dividend` at `shift` position.
            for (let i = 0; i < temp_divisor_len; i++) {
                carry += current_quotient_digit * normalized_divisor[i];
                const q = Math.floor(carry / CHUNK_RADIX);
                borrow += normalized_dividend[shift + i] - (carry - q * CHUNK_RADIX);
                carry = q;
                if (borrow < 0) {
                    normalized_dividend[shift + i] = borrow + CHUNK_RADIX;
                    borrow = -1;
                } else {
                    normalized_dividend[shift + i] = borrow;
                    borrow = 0;
                }
            }

            // If subtraction resulted in a negative, reduce quotient digit and add back divisor.
            while (borrow !== 0) {
                current_quotient_digit -= 1;
                carry = 0;
                for (let i = 0; i < temp_divisor_len; i++) {
                    carry += normalized_dividend[shift + i] - CHUNK_RADIX + normalized_divisor[i];
                    if (carry < 0) {
                        normalized_dividend[shift + i] = carry + CHUNK_RADIX;
                        carry = 0;
                    } else {
                        normalized_dividend[shift + i] = carry;
                        carry = 1;
                    }
                }
                borrow += carry;
            }
            result_quotient[shift] = current_quotient_digit;
        }
        // Denormalize remainder.
        const [final_remainder_chunks] = divideAndModBySmall(normalized_dividend, lambda);
        return [convertChunksToSmallNum(result_quotient), convertChunksToSmallNum(final_remainder_chunks)];
    }

    /**
     * Division algorithm variant 2 (for very large numbers, uses repeated subtraction).
     */
    function divideAndModVariant2(dividendChunks, divisorChunks) {
        let len_dividend = dividendChunks.length, len_divisor = divisorChunks.length;
        const result_quotient_chunks = [];
        let current_part_dividend = []; // Accumulates parts of the dividend.

        while (len_dividend > 0) {
            current_part_dividend.unshift(dividendChunks[--len_dividend]);
            normalizeChunkArray(current_part_dividend); // Remove leading zeros from current_part_dividend.

            if (compareAbsoluteChunks(current_part_dividend, divisorChunks) < 0) {
                result_quotient_chunks.push(0);
                continue;
            }

            const x_len = current_part_dividend.length;
            let high_x = current_part_dividend[x_len - 1] * CHUNK_RADIX + (current_part_dividend[x_len - 2] || 0);
            const high_y = divisorChunks[len_divisor - 1] * CHUNK_RADIX + (divisorChunks[len_divisor - 2] || 0);

            if (x_len > len_divisor) {
                high_x = (high_x + 1) * CHUNK_RADIX; // Adjust estimate if lengths differ significantly.
            }

            let estimated_quotient = Math.ceil(high_x / high_y);
            let check_product;

            // Refine estimated_quotient by repeatedly checking and decrementing.
            do {
                check_product = multiplyChunksBySmall(divisorChunks, estimated_quotient);
                if (compareAbsoluteChunks(check_product, current_part_dividend) <= 0) break;
                estimated_quotient--;
            } while (estimated_quotient > 0);

            result_quotient_chunks.push(estimated_quotient);
            current_part_dividend = subtractChunkArrays(current_part_dividend, check_product);
        }
        result_quotient_chunks.reverse(); // Digits were pushed in reverse order.
        return [convertChunksToSmallNum(result_quotient_chunks), convertChunksToSmallNum(current_part_dividend)];
    }

    /**
     * Divides a chunk array by a small integer.
     * @param {Array<number>} chunkArr - The dividend chunk array.
     * @param {number} smallDivisor - The small integer divisor.
     * @returns {Array<Array<number>>} An array containing [quotientChunks, remainder].
     */
    function divideAndModBySmall(chunkArr, smallDivisor) {
        const len = chunkArr.length;
        const quotientChunks = createZeroFilledArray(len);
        let remainder = 0;
        let current_divisor_value, q;

        for (let i = len - 1; i >= 0; --i) {
            current_divisor_value = remainder * CHUNK_RADIX + chunkArr[i];
            q = floorOrCeil(current_divisor_value / smallDivisor);
            remainder = current_divisor_value - q * smallDivisor;
            quotientChunks[i] = q | 0; // Ensure integer value.
        }
        return [quotientChunks, remainder | 0]; // Ensure integer remainder.
    }

    /**
     * Generic division and modulo method, handling different number types and signs.
     * @param {AbstractNumericValue} self - The dividend.
     * @param {*} other - The divisor.
     * @returns {Array<AbstractNumericValue>} An array containing [quotient, remainder].
     */
    function performDivisionAndModulo(self, other) {
        const divisorNum = parseInputToNumeric(other);

        if (divisorNum.isZero()) throw new Error("Division by zero is undefined.");

        if (self.isCompact) {
            if (divisorNum.isCompact) {
                // Both are compact (small numbers).
                return [
                    new CompactNumericValue(floorOrCeil(self.rawValue / divisorNum.rawValue)),
                    new CompactNumericValue(self.rawValue % divisorNum.rawValue)
                ];
            }
            // Small dividend, large divisor -> quotient is 0, remainder is dividend.
            return [AbstractNumericValue.ZERO, self];
        }

        let dividendChunks = self.chunkArray; // Will be modified for small divisor.
        let divisorChunks = divisorNum.chunkArray; // Will be modified for small divisor.

        if (divisorNum.isCompact) {
            if (divisorNum.rawValue === 1) return [self, AbstractNumericValue.ZERO];
            if (divisorNum.rawValue === -1) return [self.negate(), AbstractNumericValue.ZERO];
            const absSmallDivisor = Math.abs(divisorNum.rawValue);
            if (absSmallDivisor < CHUNK_RADIX) {
                const [qChunks, rem] = divideAndModBySmall(dividendChunks, absSmallDivisor);
                const quotient = convertChunksToSmallNum(qChunks);
                let remainder = rem;
                if (self.isNegative) remainder = -remainder;

                if (typeof quotient === "number") {
                    // Resulting quotient is small.
                    if (self.isNegative !== divisorNum.isNegative) quotient = -quotient;
                    return [new CompactNumericValue(quotient), new CompactNumericValue(remainder)];
                }
                return [new LargeNumericValue(quotient, self.isNegative !== divisorNum.isNegative), new CompactNumericValue(remainder)];
            }
            // Small divisor, but too large for direct `divideAndModBySmall`. Convert to chunks.
            divisorChunks = convertSmallNumToChunks(absSmallDivisor); // This makes divisorNum effectively Large.
        }

        // Both are large numbers or converted to large.
        const comparison = compareAbsoluteChunks(dividendChunks, divisorChunks);
        if (comparison === -1) return [AbstractNumericValue.ZERO, self]; // Dividend < divisor.
        if (comparison === 0) return [new CompactNumericValue(self.isNegative === divisorNum.isNegative ? 1 : -1), AbstractNumericValue.ZERO];

        let divisionResult;
        // Heuristic to choose division algorithm.
        if (dividendChunks.length + divisorChunks.length <= 200) { // arbitrary threshold
            divisionResult = divideAndModVariant1(dividendChunks, divisorChunks);
        } else {
            divisionResult = divideAndModVariant2(dividendChunks, divisorChunks);
        }

        let quotient = divisionResult[0];
        let remainder = divisionResult[1];
        const quotientIsNegative = self.isNegative !== divisorNum.isNegative;
        const remainderIsNegative = self.isNegative; // Remainder takes sign of dividend.

        if (typeof quotient === "number") {
            if (quotientIsNegative) quotient = -quotient;
            quotient = new CompactNumericValue(quotient);
        } else quotient = new LargeNumericValue(quotient, quotientIsNegative);

        if (typeof remainder === "number") {
            if (remainderIsNegative) remainder = -remainder;
            remainder = new CompactNumericValue(remainder);
        } else remainder = new LargeNumericValue(remainder, remainderIsNegative);

        return [quotient, remainder];
    }

    LargeNumericValue.prototype.divmod = function(other) {
        const result = performDivisionAndModulo(this, other);
        return { quotient: result[0], remainder: result[1] };
    };
    CompactNumericValue.prototype.divmod = LargeNumericValue.prototype.divmod;

    LargeNumericValue.prototype.divide = function(other) {
        return performDivisionAndModulo(this, other)[0];
    };
    CompactNumericValue.prototype.over = CompactNumericValue.prototype.divide = LargeNumericValue.prototype.over = LargeNumericValue.prototype.divide;

    LargeNumericValue.prototype.mod = function(other) {
        return performDivisionAndModulo(this, other)[1];
    };
    CompactNumericValue.prototype.remainder = CompactNumericValue.prototype.mod = LargeNumericValue.prototype.remainder = LargeNumericValue.prototype.mod;

    // --- Exponentiation ---
    LargeNumericValue.prototype.power = function(exponent) {
        const expNum = parseInputToNumeric(exponent);
        const baseVal = this.chunkArray;
        const expVal = expNum.rawValue;

        if (expVal === 0) return AbstractNumericValue.ONE;
        if (baseVal === 0 || this.isZero()) return AbstractNumericValue.ZERO;
        if (baseVal.length === 1 && baseVal[0] === 1) return AbstractNumericValue.ONE; // Base is 1.
        if (baseVal.length === 1 && baseVal[0] === 1 && this.isNegative) return expNum.isEven() ? AbstractNumericValue.ONE : AbstractNumericValue.MINUS_ONE; // Base is -1.

        if (expNum.isNegative) return AbstractNumericValue.ZERO; // Negative exponents result in fractions.
        if (!expNum.isCompact) throw new Error(`Exponent ${expNum.toString()} is too large for direct power calculation.`);

        if (this.isCompact) {
            const nativePower = Math.pow(this.rawValue, expVal);
            if (isJsSafeInteger(nativePower)) return new CompactNumericValue(floorOrCeil(nativePower));
        }

        let currentBase = this;
        let result = AbstractNumericValue.ONE;
        let currentExponent = expVal;

        while (true) {
            if (currentExponent % 2 === 1) { // If exponent is odd.
                result = result.times(currentBase);
                currentExponent--;
            }
            if (currentExponent === 0) break;
            currentExponent /= 2; // Halve the exponent.
            currentBase = currentBase.square(); // Square the base.
        }
        return result;
    };
    CompactNumericValue.prototype.power = LargeNumericValue.prototype.power;

    LargeNumericValue.prototype.modularPower = function(exp, modulus) {
        let expNum = parseInputToNumeric(exp);
        let modNum = parseInputToNumeric(modulus);

        if (modNum.isZero()) throw new Error("Cannot compute modular exponentiation with modulus 0.");

        let result = AbstractNumericValue.ONE;
        let currentBase = this.mod(modNum); // Reduce base modulo modulus.

        while (expNum.isPositive()) {
            if (currentBase.isZero()) return AbstractNumericValue.ZERO; // 0^exp = 0
            if (expNum.isOdd()) {
                result = result.multiply(currentBase).mod(modNum);
            }
            expNum = expNum.divide(2);
            currentBase = currentBase.square().mod(modNum);
        }
        return result;
    };
    CompactNumericValue.prototype.modularPower = LargeNumericValue.prototype.modularPower;

    // --- Comparisons ---
    /**
     * Compares the absolute values of two chunk arrays.
     * @param {Array<number>} a - First chunk array.
     * @param {Array<number>} b - Second chunk array.
     * @returns {number} -1 if |a| < |b|, 0 if |a| == |b|, 1 if |a| > |b|.
     */
    function compareAbsoluteChunks(a, b) {
        if (a.length !== b.length) {
            return a.length > b.length ? 1 : -1;
        }
        for (let i = a.length - 1; i >= 0; i--) {
            if (a[i] !== b[i]) return a[i] > b[i] ? 1 : -1;
        }
        return 0;
    }

    LargeNumericValue.prototype.compareAbsolute = function(other) {
        const otherNum = parseInputToNumeric(other);
        if (otherNum.isCompact) return 1; // A large number's absolute value is always greater than a small number's (unless small is also 0).
        return compareAbsoluteChunks(this.chunkArray, otherNum.chunkArray);
    };
    CompactNumericValue.prototype.compareAbsolute = function(other) {
        const otherNum = parseInputToNumeric(other);
        const absA = Math.abs(this.rawValue);
        if (otherNum.isCompact) {
            const absB = Math.abs(otherNum.rawValue);
            return absA === absB ? 0 : (absA > absB ? 1 : -1);
        }
        return -1; // A small number's absolute value is always less than a large number's.
    };

    LargeNumericValue.prototype.compare = function(other) {
        if (other === Infinity) return -1;
        if (other === -Infinity) return 1;

        const otherNum = parseInputToNumeric(other);
        const valA = this.chunkArray, valB = otherNum.chunkArray;

        if (this.isNegative !== otherNum.isNegative) {
            return otherNum.isNegative ? 1 : -1; // If signs differ, negative is smaller.
        }
        // If same sign:
        if (otherNum.isCompact) {
            // Large vs Small (same sign).
            return this.isNegative ? -1 : 1; // Negative large is smaller than negative small, positive large is larger.
        }
        return compareAbsoluteChunks(valA, valB) * (this.isNegative ? -1 : 1);
    };
    LargeNumericValue.prototype.compareTo = LargeNumericValue.prototype.compare;

    CompactNumericValue.prototype.compare = function(other) {
        if (other === Infinity) return -1;
        if (other === -Infinity) return 1;

        const otherNum = parseInputToNumeric(other);
        const valA = this.rawValue, valB = otherNum.rawValue;

        if (otherNum.isCompact) {
            return (valA === valB) ? 0 : (valA > valB ? 1 : -1);
        }
        // Small vs Large.
        // If signs differ, `valA < 0 !== otherNum.isNegative` means `valA` is negative and `otherNum` positive, or vice-versa.
        if (valA < 0 !== otherNum.isNegative) {
            return valA < 0 ? -1 : 1; // If `valA` negative, it's smaller; if `valA` positive, it's larger.
        }
        // Small vs Large (same sign).
        // If both negative, small is larger (e.g., -5 > -100).
        // If both positive, small is smaller (e.g., 5 < 100).
        return valA < 0 ? 1 : -1;
    };
    CompactNumericValue.prototype.compareTo = CompactNumericValue.prototype.compare;

    // --- Equality and Relational Operators ---
    LargeNumericValue.prototype.equals = function(other) { return this.compare(other) === 0; };
    CompactNumericValue.prototype.eq = CompactNumericValue.prototype.equals = LargeNumericValue.prototype.eq = LargeNumericValue.prototype.equals;

    LargeNumericValue.prototype.notEquals = function(other) { return this.compare(other) !== 0; };
    CompactNumericValue.prototype.neq = CompactNumericValue.prototype.notEquals = LargeNumericValue.prototype.neq = LargeNumericValue.prototype.notEquals;

    LargeNumericValue.prototype.greaterThan = function(other) { return this.compare(other) > 0; };
    CompactNumericValue.prototype.gt = CompactNumericValue.prototype.greaterThan = LargeNumericValue.prototype.gt = LargeNumericValue.prototype.greaterThan;

    LargeNumericValue.prototype.lessThan = function(other) { return this.compare(other) < 0; };
    CompactNumericValue.prototype.lt = CompactNumericValue.prototype.lessThan = LargeNumericValue.prototype.lt = LargeNumericValue.prototype.lessThan;

    LargeNumericValue.prototype.greaterOrEquals = function(other) { return this.compare(other) >= 0; };
    CompactNumericValue.prototype.geq = CompactNumericValue.prototype.greaterOrEquals = LargeNumericValue.prototype.geq = LargeNumericValue.prototype.greaterOrEquals;

    LargeNumericValue.prototype.lesserOrEquals = function(other) { return this.compare(other) <= 0; };
    CompactNumericValue.prototype.leq = CompactNumericValue.prototype.lesserOrEquals = LargeNumericValue.prototype.leq = LargeNumericValue.prototype.lesserOrEquals;

    // --- Properties (isEven, isOdd, isPositive, etc.) ---
    LargeNumericValue.prototype.isEven = function() { return (this.chunkArray[0] & 1) === 0; };
    CompactNumericValue.prototype.isEven = function() { return (this.rawValue & 1) === 0; };

    LargeNumericValue.prototype.isOdd = function() { return (this.chunkArray[0] & 1) === 1; };
    CompactNumericValue.prototype.isOdd = function() { return (this.rawValue & 1) === 1; };

    LargeNumericValue.prototype.isPositive = function() { return !this.isNegative; };
    CompactNumericValue.prototype.isPositive = function() { return this.rawValue > 0; };

    LargeNumericValue.prototype.isNegative = function() { return this.isNegative; };
    CompactNumericValue.prototype.isNegative = function() { return this.rawValue < 0; };

    LargeNumericValue.prototype.isUnit = function() { return false; }; // A large number cannot be 1 or -1, by definition (it would be Compact).
    CompactNumericValue.prototype.isUnit = function() { return Math.abs(this.rawValue) === 1; };

    LargeNumericValue.prototype.isZero = function() { return this.chunkArray.length === 0 || (this.chunkArray.length === 1 && this.chunkArray[0] === 0); };
    CompactNumericValue.prototype.isZero = function() { return this.rawValue === 0; };

    LargeNumericValue.prototype.isDivisibleBy = function(other) {
        const otherNum = parseInputToNumeric(other);
        if (otherNum.isZero()) return false;
        if (otherNum.isUnit()) return true;
        if (otherNum.equals(2)) return this.isEven();
        return this.mod(otherNum).isZero();
    };
    CompactNumericValue.prototype.isDivisibleBy = LargeNumericValue.prototype.isDivisibleBy;

    // --- Primality Tests ---
    /**
     * Checks for basic primality (small primes and multiples).
     */
    function checkBasicPrimality(num) {
        const absNum = num.abs();
        if (absNum.isUnit()) return false;
        if (absNum.equals(2) || absNum.equals(3) || absNum.equals(5)) return true;
        if (absNum.isEven() || absNum.isDivisibleBy(3) || absNum.isDivisibleBy(5)) return false;
        if (absNum.lessThan(25)) return true;
        return undefined; // Cannot determine with basic checks.
    }

    LargeNumericValue.prototype.isPrime = function() {
        const basicCheckResult = checkBasicPrimality(this);
        if (basicCheckResult !== undefined) return basicCheckResult;

        const num = this.abs();
        const numMinusOne = num.prev(); // n-1.

        // Miller-Rabin primality test.
        const testBases = [2, 3, 5, 7, 11, 13, 17, 19];
        let d = numMinusOne;
        while (d.isEven()) d = d.divide(2); // Find d such that num-1 = d * 2^s.

        for (let i = 0; i < testBases.length; i++) {
            let x = ArbitraryPrecisionMath(testBases[i]).modularPower(d, num);
            if (x.equals(AbstractNumericValue.ONE) || x.equals(numMinusOne)) continue;

            let isWitness = true;
            let currentD = d;
            while (isWitness && currentD.lessThan(numMinusOne)) {
                x = x.square().mod(num);
                if (x.equals(numMinusOne)) isWitness = false;
                currentD = currentD.multiply(2);
            }
            if (isWitness) return false; // Found a strong witness, not prime.
        }
        return true; // Likely prime.
    };
    CompactNumericValue.prototype.isPrime = LargeNumericValue.prototype.isPrime;

    LargeNumericValue.prototype.isProbablePrime = function(iterations) {
        const basicCheckResult = checkBasicPrimality(this);
        if (basicCheckResult !== undefined) return basicCheckResult;

        const num = this.abs();
        const numMinusOne = num.prev();
        const testIterations = (iterations === undefined) ? 5 : iterations;

        for (let i = 0; i < testIterations; i++) {
            // Random base 'a' such that 2 <= a <= n-2.
            const a = AbstractNumericValue.randomBetween(2, num.minus(2));
            if (!a.modularPower(numMinusOne, num).isUnit()) return false;
        }
        return true; // Probably prime.
    };
    CompactNumericValue.prototype.isProbablePrime = LargeNumericValue.prototype.isProbablePrime;

    // --- Modular Inverse ---
    LargeNumericValue.prototype.modularInverse = function(modulus) {
        let t = AbstractNumericValue.ZERO, newT = AbstractNumericValue.ONE;
        let r = parseInputToNumeric(modulus), newR = this.abs(); // Use extended Euclidean algorithm.

        let q, lastT, lastR;
        while (!newR.isZero()) {
            q = r.divide(newR);
            lastT = t;
            lastR = r;
            t = newT;
            r = newR;
            newT = lastT.subtract(q.multiply(newT));
            newR = lastR.subtract(q.multiply(newR));
        }

        if (!r.equals(1)) {
            throw new Error(`Numbers ${this.toString()} and ${modulus.toString()} are not co-prime, modular inverse does not exist.`);
        }

        // Adjust 't' to be positive and within [0, modulus-1].
        if (t.compare(0) === -1) {
            t = t.add(modulus);
        }
        // If original number was negative, the inverse needs to be adjusted.
        if (this.isNegative) {
            return t.negate();
        }
        return t;
    };
    CompactNumericValue.prototype.modularInverse = LargeNumericValue.prototype.modularInverse;

    // --- Increment/Decrement ---
    LargeNumericValue.prototype.increment = function() {
        if (this.isNegative) {
            // e.g., -5.increment() = -4. Equivalent to -(5-1).
            return subtractSmallIntFromChunkArray(this.chunkArray, 1, this.isNegative);
        }
        return new LargeNumericValue(addSmallIntToChunkArray(this.chunkArray, 1), this.isNegative);
    };
    CompactNumericValue.prototype.increment = function() {
        const nextVal = this.rawValue + 1;
        if (nextVal < JS_MAX_SAFE_INTEGER) return new CompactNumericValue(nextVal);
        return new LargeNumericValue(JS_MAX_SAFE_INTEGER_CHUNKS, false); // If overflow, convert to large.
    };

    LargeNumericValue.prototype.decrement = function() {
        if (this.isNegative) {
            // e.g., -5.decrement() = -6. Equivalent to -(5+1).
            return new LargeNumericValue(addSmallIntToChunkArray(this.chunkArray, 1), true);
        }
        return subtractSmallIntFromChunkArray(this.chunkArray, 1, this.isNegative);
    };
    CompactNumericValue.prototype.decrement = function() {
        const prevVal = this.rawValue - 1;
        if (prevVal > -JS_MAX_SAFE_INTEGER) return new CompactNumericValue(prevVal);
        // If underflow, convert to large.
        // For -MAX_INT-1, it becomes a large number with value MAX_INT_ARR and negative sign.
        return new LargeNumericValue(JS_MAX_SAFE_INTEGER_CHUNKS, true);
    };

    // --- Bitwise Operations Helpers ---
    const POWERS_OF_TWO_ARRAY = [1];
    while (2 * POWERS_OF_TWO_ARRAY[POWERS_OF_TWO_ARRAY.length - 1] <= CHUNK_RADIX) {
        POWERS_OF_TWO_ARRAY.push(2 * POWERS_OF_TWO_ARRAY[POWERS_OF_TWO_ARRAY.length - 1]);
    }
    const POWERS_OF_TWO_COUNT = POWERS_OF_TWO_ARRAY.length;
    const HIGHEST_POWER_OF_TWO = POWERS_OF_TWO_ARRAY[POWERS_OF_TWO_COUNT - 1];

    function isShiftAmountSmall(n) {
        return (typeof n === "number" || typeof n === "string") && +Math.abs(n) <= CHUNK_RADIX || (n instanceof LargeNumericValue && n.chunkArray.length <= 1);
    }

    LargeNumericValue.prototype.shiftLeft = function(shiftAmount) {
        if (!isShiftAmountSmall(shiftAmount)) {
            throw new Error(`Shift amount ${String(shiftAmount)} is too large for efficient shifting.`);
        }
        const shiftVal = +shiftAmount;
        if (shiftVal < 0) return this.shiftRight(-shiftVal);
        if (this.isZero()) return this;

        let resultNum = this;
        let remainingShift = shiftVal;
        while (remainingShift >= POWERS_OF_TWO_COUNT) {
            resultNum = resultNum.multiply(HIGHEST_POWER_OF_TWO);
            remainingShift -= (POWERS_OF_TWO_COUNT - 1); // Adjust based on array indexing.
        }
        return resultNum.multiply(POWERS_OF_TWO_ARRAY[remainingShift]);
    };
    CompactNumericValue.prototype.shiftLeft = LargeNumericValue.prototype.shiftLeft;

    LargeNumericValue.prototype.shiftRight = function(shiftAmount) {
        if (!isShiftAmountSmall(shiftAmount)) {
            throw new Error(`Shift amount ${String(shiftAmount)} is too large for efficient shifting.`);
        }
        const shiftVal = +shiftAmount;
        if (shiftVal < 0) return this.shiftLeft(-shiftVal);
        // Right shifting -1 is -1. Right shifting 0 is 0.
        if (this.isZero() || (this.isNegative && this.isUnit())) return this;

        let resultNum = this;
        let remainingShift = shiftVal;
        let divModResult;
        while (remainingShift >= POWERS_OF_TWO_COUNT) {
            divModResult = performDivisionAndModulo(resultNum, HIGHEST_POWER_OF_TWO);
            // If remainder is negative, decrement quotient to get floor division behavior.
            resultNum = divModResult[1].isNegative() ? divModResult[0].decrement() : divModResult[0];
            if (resultNum.isZero() && !resultNum.isNegative()) return AbstractNumericValue.ZERO;
            remainingShift -= (POWERS_OF_TWO_COUNT - 1);
        }
        divModResult = performDivisionAndModulo(resultNum, POWERS_OF_TWO_ARRAY[remainingShift]);
        return divModResult[1].isNegative() ? divModResult[0].decrement() : divModResult[0];
    };
    CompactNumericValue.prototype.shiftRight = LargeNumericValue.prototype.shiftRight;

    // Helper for bitwise operations.
    function applyBitwiseOperation(x, y, operationFn) {
        let yNum = parseInputToNumeric(y);
        const xIsNegative = x.isNegative();
        const yIsNegative = yNum.isNegative();

        // Convert to two's complement representation if negative.
        let xComplement = xIsNegative ? x.not() : x;
        let yComplement = yIsNegative ? yNum.not() : yNum;

        const resultChunks = [];
        let xChunk = 0, yChunk = 0;
        let xDivMod = null, yDivMod = null;

        // Process chunk by chunk.
        while (!xComplement.isZero() || !yComplement.isZero()) {
            xDivMod = performDivisionAndModulo(xComplement, HIGHEST_POWER_OF_TWO);
            xChunk = xDivMod[1].toJSNumber();
            if (xIsNegative) xChunk = HIGHEST_POWER_OF_TWO - 1 - xChunk; // Apply two's complement for current chunk.

            yDivMod = performDivisionAndModulo(yComplement, HIGHEST_POWER_OF_TWO);
            yChunk = yDivMod[1].toJSNumber();
            if (yIsNegative) yChunk = HIGHEST_POWER_OF_TWO - 1 - yChunk;

            xComplement = xDivMod[0];
            yComplement = yDivMod[0];
            resultChunks.push(operationFn(xChunk, yChunk));
        }

        // Reconstruct the result, considering the sign.
        let finalSum = operationFn(xIsNegative ? 1 : 0, yIsNegative ? 1 : 0) !== 0 ? ArbitraryPrecisionMath(-1) : ArbitraryPrecisionMath(0);
        for (let i = resultChunks.length - 1; i >= 0; i--) {
            finalSum = finalSum.multiply(HIGHEST_POWER_OF_TWO).add(ArbitraryPrecisionMath(resultChunks[i]));
        }
        return finalSum;
    }

    LargeNumericValue.prototype.not = function() {
        return this.negate().decrement(); // ~x = -x - 1
    };
    CompactNumericValue.prototype.not = LargeNumericValue.prototype.not;

    LargeNumericValue.prototype.and = function(other) { return applyBitwiseOperation(this, other, (a, b) => a & b); };
    CompactNumericValue.prototype.and = LargeNumericValue.prototype.and;

    LargeNumericValue.prototype.or = function(other) { return applyBitwiseOperation(this, other, (a, b) => a | b); };
    CompactNumericValue.prototype.or = LargeNumericValue.prototype.or;

    LargeNumericValue.prototype.xor = function(other) { return applyBitwiseOperation(this, other, (a, b) => a ^ b); };
    CompactNumericValue.prototype.xor = LargeNumericValue.prototype.xor;

    // --- Bit Length ---
    // Lowest One Bit Mask logic, slightly simplified.
    const LOB_MASK_INT = 1 << 30;
    const LOB_MASK_BIGINT = (CHUNK_RADIX & -CHUNK_RADIX) * (CHUNK_RADIX & -CHUNK_RADIX) | LOB_MASK_INT;

    function getLowestOneBitMask(num) {
        const val = num.chunkArray;
        const x = (num.isCompact) ? num.rawValue | LOB_MASK_INT : val[0] + (val[1] * CHUNK_RADIX || 0) | LOB_MASK_BIGINT;
        return x & -x; // Returns the lowest set bit.
    }

    /**
     * Calculates integer logarithm base 2.
     * @param {AbstractNumericValue} value - The number.
     * @param {AbstractNumericValue} base - The base (must be 2 for bitLength).
     * @returns {{p: AbstractNumericValue, e: number}} An object with power and exponent.
     */
    function calculateIntegerLogarithm(value, base) {
        if (base.compare(value) <= 0) {
            const tempResult = calculateIntegerLogarithm(value, base.square());
            const p = tempResult.p;
            const e = tempResult.e;
            const t = p.multiply(base);
            return t.compare(value) <= 0 ? { p: t, e: e * 2 + 1 } : { p: p, e: e * 2 };
        }
        return { p: ArbitraryPrecisionMath(1), e: 0 };
    }

    LargeNumericValue.prototype.bitLength = function() {
        let num = this;
        if (num.compare(AbstractNumericValue.ZERO) < 0) {
            num = num.negate().subtract(AbstractNumericValue.ONE);
        }
        if (num.isZero()) return AbstractNumericValue.ZERO;
        return ArbitraryPrecisionMath(calculateIntegerLogarithm(num, ArbitraryPrecisionMath(2)).e).add(AbstractNumericValue.ONE);
    };
    CompactNumericValue.prototype.bitLength = LargeNumericValue.prototype.bitLength;

    // --- Static Utility Methods ---
    function maxNumber(a, b) {
        const numA = parseInputToNumeric(a);
        const numB = parseInputToNumeric(b);
        return numA.greaterThan(numB) ? numA : numB;
    }

    function minNumber(a, b) {
        const numA = parseInputToNumeric(a);
        const numB = parseInputToNumeric(b);
        return numA.lessThan(numB) ? numA : numB;
    }

    function greatestCommonDivisor(a, b) {
        let numA = parseInputToNumeric(a).abs();
        let numB = parseInputToNumeric(b).abs();

        if (numA.equals(numB)) return numA;
        if (numA.isZero()) return numB;
        if (numB.isZero()) return numA;

        let commonFactor = AbstractNumericValue.ONE;
        let tempNum;

        // Optimization: remove common factors of 2.
        while (numA.isEven() && numB.isEven()) {
            const lowestOneBit = getLowestOneBitMask(numA); // Original uses min(roughLOB(a), roughLOB(b)).
            numA = numA.divide(lowestOneBit);
            numB = numB.divide(lowestOneBit);
            commonFactor = commonFactor.multiply(lowestOneBit);
        }
        while (numA.isEven()) {
            numA = numA.divide(getLowestOneBitMask(numA));
        }

        // Euclidean algorithm.
        do {
            while (numB.isEven()) {
                numB = numB.divide(getLowestOneBitMask(numB));
            }
            if (numA.greaterThan(numB)) {
                tempNum = numB;
                numB = numA;
                numA = tempNum;
            }
            numB = numB.subtract(numA);
        } while (!numB.isZero());

        return commonFactor.isUnit() ? numA : numA.multiply(commonFactor);
    }

    function leastCommonMultiple(a, b) {
        const numA = parseInputToNumeric(a).abs();
        const numB = parseInputToNumeric(b).abs();
        // LCM(a, b) = |a * b| / GCD(a, b)
        return numA.divide(greatestCommonDivisor(numA, numB)).multiply(numB);
    }

    function randomBetween(lowerBound, upperBound) {
        const low = minNumber(lowerBound, upperBound);
        const high = maxNumber(lowerBound, upperBound);
        const range = high.subtract(low).add(1);

        if (range.isCompact) {
            return low.add(Math.floor(Math.random() * range.rawValue));
        }

        const rangeChunks = range.chunkArray;
        const numChunks = rangeChunks.length - 1;
        const resultChunks = [];
        let restrictedByRange = true; // Flag to ensure digits don't exceed range's digits.

        for (let i = numChunks; i >= 0; i--) {
            const topLimit = restrictedByRange ? rangeChunks[i] : CHUNK_RADIX;
            const digit = floorOrCeil(Math.random() * topLimit);
            resultChunks.unshift(digit);
            if (digit < topLimit) restrictedByRange = false;
        }
        const randomOffset = convertChunksToSmallNum(resultChunks);
        return low.add(typeof randomOffset === "number" ? new CompactNumericValue(randomOffset) : new LargeNumericValue(randomOffset, false));
    }

    // --- Parsing and Formatting ---
    /**
     * Parses a string representation of a number in a given base.
     * @param {string} text - The number string.
     * @param {number|AbstractNumericValue} base - The base (2 to 36, or custom for >36).
     * @returns {AbstractNumericValue} The parsed number.
     */
    const parseStringWithBase = function(text, base) {
        const textLength = text.length;
        let absBase = Math.abs(typeof base === "object" ? base.toJSNumber() : base);

        // Input validation for digits in base.
        for (let i = 0; i < textLength; i++) {
            const char = text[i].toLowerCase();
            if (char === "-") continue;
            if (/[a-z0-9]/.test(char)) {
                if (/[0-9]/.test(char) && +char >= absBase) {
                    if (char === "1" && absBase === 1) continue; // Special case for base 1 (unary).
                    throw new Error(`Invalid digit '${char}' for base ${base}.`);
                } else if (char.charCodeAt(0) - 87 >= absBase) { // 'a' is 10, 'b' is 11, etc.
                    throw new Error(`Invalid digit '${char}' for base ${base}.`);
                }
            }
        }

        // Optimized path for common small bases (2-36) if result fits JS Number.
        if (2 <= base && base <= 36) {
            // Check if result might fit in JS_MAX_SAFE_INTEGER based on length and base.
            if (textLength <= LOG_JS_MAX_SAFE_INTEGER / Math.log(base)) {
                const result = parseInt(text, base);
                if (!isNaN(result)) {
                    return new CompactNumericValue(result);
                }
            }
        }

        const baseNum = parseInputToNumeric(base);
        const digits = [];
        const isNegative = text[0] === "-";

        for (let i = isNegative ? 1 : 0; i < text.length; i++) {
            const char = text[i].toLowerCase();
            const charCode = char.charCodeAt(0);
            if (48 <= charCode && charCode <= 57) { // '0'-'9'
                digits.push(parseInputToNumeric(char));
            } else if (97 <= charCode && charCode <= 122) { // 'a'-'z'
                digits.push(parseInputToNumeric(charCode - 87));
            } else if (char === "<") { // Custom digits like "<10>"
                const startIndex = i;
                do { i++; } while (text[i] !== ">");
                digits.push(parseInputToNumeric(text.slice(startIndex + 1, i)));
            } else {
                throw new Error(`Invalid character '${char}' in number string for base ${base}.`);
            }
        }
        return parseDigitsInBase(digits, baseNum, isNegative);
    };

    /**
     * Constructs a number from an array of digits and a base.
     * @param {Array<AbstractNumericValue>} digits - Array of digits (as NumericValue instances).
     * @param {AbstractNumericValue} base - The base.
     * @param {boolean} isNegative - True if the final number should be negative.
     * @returns {AbstractNumericValue} The constructed number.
     */
    function parseDigitsInBase(digits, base, isNegative) {
        let value = AbstractNumericValue.ZERO;
        let power = AbstractNumericValue.ONE;

        // Horner's method (or direct polynomial evaluation).
        for (let i = digits.length - 1; i >= 0; i--) {
            value = value.add(digits[i].times(power));
            power = power.times(base);
        }
        return isNegative ? value.negate() : value;
    }

    /**
     * Converts a single digit (0-35) to its string representation.
     * @param {number} digit - The digit value.
     * @returns {string} The string representation.
     */
    function digitToString(digit) {
        if (digit <= 35) {
            return "0123456789abcdefghijklmnopqrstuvwxyz".charAt(digit);
        }
        return `<${digit}>`; // For bases > 36, use custom format.
    }

    /**
     * Converts a NumericValue to an array of digits in a specified base.
     * @param {AbstractNumericValue} num - The number to convert.
     * @param {AbstractNumericValue} base - The target base.
     * @returns {{value: Array<number>, isNegative: boolean}} Object with digit array and sign.
     */
    function convertToBaseRepresentation(num, base) {
        const baseNum = ArbitraryPrecisionMath(base);

        if (baseNum.isZero()) {
            if (num.isZero()) return { value: [0], isNegative: false };
            throw new Error("Cannot convert non-zero numbers to base 0.");
        }
        if (baseNum.equals(-1)) {
            if (num.isZero()) return { value: [0], isNegative: false };
            if (num.isNegative()) {
                let unaryRepresentation = [];
                for (let i = 0; i < num.abs().toJSNumber(); i++) {
                    unaryRepresentation.push(1, 0);
                }
                return { value: unaryRepresentation, isNegative: false };
            }
            let unaryRep = [];
            for (let i = 0; i < num.toJSNumber() - 1; i++) {
                unaryRep.push(0, 1);
            }
            unaryRep.unshift(1);
            return { value: unaryRep, isNegative: false };
        }

        let isNegativeResult = false;
        if (num.isNegative() && baseNum.isPositive()) {
            isNegativeResult = true;
            num = num.abs();
        }

        if (baseNum.equals(1)) {
            if (num.isZero()) return { value: [0], isNegative: false };
            return { value: Array(num.toJSNumber()).fill(1), isNegative: isNegativeResult };
        }

        const digitsArray = [];
        let currentLeft = num;
        let divModPair;

        while (currentLeft.isNegative() || currentLeft.compareAbsolute(baseNum) >= 0) {
            divModPair = currentLeft.divmod(baseNum);
            currentLeft = divModPair.quotient;
            let digit = divModPair.remainder;

            // Handle negative remainders for non-standard bases (e.g., negative bases).
            if (digit.isNegative()) {
                digit = baseNum.minus(digit).abs();
                currentLeft = currentLeft.increment();
            }
            digitsArray.push(digit.toJSNumber());
        }
        digitsArray.push(currentLeft.toJSNumber());
        return { value: digitsArray.reverse(), isNegative: isNegativeResult };
    }

    /**
     * Converts a NumericValue to its string representation in a given base.
     * @param {AbstractNumericValue} num - The number.
     * @param {number} base - The target base.
     * @returns {string} The string representation.
     */
    function formatToBaseString(num, base) {
        const { value: digitValues, isNegative } = convertToBaseRepresentation(num, base);
        return (isNegative ? "-" : "") + digitValues.map(digitToString).join("");
    }

    LargeNumericValue.prototype.toArray = function(radix) {
        return convertToBaseRepresentation(this, radix);
    };
    CompactNumericValue.prototype.toArray = function(radix) {
        return convertToBaseRepresentation(this, radix);
    };

    LargeNumericValue.prototype.toString = function(radix = 10) {
        if (radix !== 10) return formatToBaseString(this, radix);

        const chunks = this.chunkArray;
        let lastChunkIndex = chunks.length - 1;
        let resultString = String(chunks[lastChunkIndex]);
        const zeroPadding = "0000000";

        while (--lastChunkIndex >= 0) {
            let currentChunk = String(chunks[lastChunkIndex]);
            resultString += zeroPadding.slice(currentChunk.length) + currentChunk;
        }
        return (this.isNegative ? "-" : "") + resultString;
    };
    CompactNumericValue.prototype.toString = function(radix = 10) {
        if (radix !== 10) return formatToBaseString(this, radix);
        return String(this.rawValue);
    };

    LargeNumericValue.prototype.toJSON = CompactNumericValue.prototype.toJSON = function() {
        return this.toString();
    };

    LargeNumericValue.prototype.valueOf = function() {
        return parseInt(this.toString(), 10);
    };
    LargeNumericValue.prototype.toJSNumber = LargeNumericValue.prototype.valueOf;

    CompactNumericValue.prototype.valueOf = function() {
        return this.rawValue;
    };
    CompactNumericValue.prototype.toJSNumber = CompactNumericValue.prototype.valueOf;

    /**
     * Parses a string into a LargeNumericValue.
     * Handles scientific notation and ensures it's an integer.
     * @param {string} strValue - The string to parse.
     * @returns {LargeNumericValue} The parsed number.
     */
    function parseLiteralString(strValue) {
        // Check for quick conversion to CompactNumericValue if it fits.
        if (isJsSafeInteger(+strValue)) {
            const num = +strValue;
            if (num === floorOrCeil(num)) return new CompactNumericValue(num);
            throw new Error(`Invalid integer string: ${strValue}`);
        }

        let isNegative = strValue[0] === "-";
        if (isNegative) strValue = strValue.slice(1);

        const scientificNotationParts = strValue.split(/e/i);
        if (scientificNotationParts.length > 2) throw new Error(`Invalid integer format: multiple 'e' characters in ${strValue}`);

        if (scientificNotationParts.length === 2) {
            let exponentPart = scientificNotationParts[1];
            if (exponentPart[0] === "+") exponentPart = exponentPart.slice(1);
            exponentPart = +exponentPart;

            if (exponentPart !== floorOrCeil(exponentPart) || !isJsSafeInteger(exponentPart)) {
                throw new Error(`Invalid integer exponent: ${exponentPart} is not a valid integer.`);
            }

            let mainPart = scientificNotationParts[0];
            const decimalPointIndex = mainPart.indexOf(".");
            if (decimalPointIndex >= 0) {
                exponentPart -= (mainPart.length - decimalPointIndex - 1);
                mainPart = mainPart.slice(0, decimalPointIndex) + mainPart.slice(decimalPointIndex + 1);
            }
            if (exponentPart < 0) {
                throw new Error("Cannot have negative exponent for integer representation.");
            }
            mainPart += "0".repeat(exponentPart);
            strValue = mainPart;
        }

        // Basic validation for pure digit string.
        if (!/^([0-9][0-9]*)$/.test(strValue)) {
            throw new Error(`Invalid integer string format: ${strValue}`);
        }

        const chunkArray = [];
        let currentLength = strValue.length;
        const chunkSize = DIGITS_PER_CHUNK;
        let minIndex = currentLength - chunkSize;

        while (currentLength > 0) {
            chunkArray.push(+(strValue.slice(Math.max(0, minIndex), currentLength)));
            minIndex -= chunkSize;
            currentLength -= chunkSize;
        }
        normalizeChunkArray(chunkArray);
        return new LargeNumericValue(chunkArray, isNegative);
    }

    /**
     * Parses a native JavaScript number into a NumericValue.
     * @param {number} numValue - The number to parse.
     * @returns {CompactNumericValue|LargeNumericValue} The parsed number.
     */
    function parseLiteralNumber(numValue) {
        if (isJsSafeInteger(numValue)) {
            if (numValue !== floorOrCeil(numValue)) throw new Error(`${numValue} is not an integer.`);
            return new CompactNumericValue(numValue);
        }
        // If it's a large number, convert to string and parse.
        return parseLiteralString(numValue.toString());
    }

    /**
     * Coerces various input types into a NumericValue instance.
     * @param {*} input - The input value (number, string, or existing NumericValue).
     * @returns {AbstractNumericValue} A NumericValue instance.
     */
    function parseInputToNumeric(input) {
        if (typeof input === "number") {
            return parseLiteralNumber(input);
        }
        if (typeof input === "string") {
            return parseLiteralString(input);
        }
        // Assume it's already a NumericValue instance.
        return input;
    }

    // Pre-cache common small integer instances for efficiency.
    for (let i = 0; i < 1000; i++) {
        AbstractNumericValue[i] = new CompactNumericValue(i);
        if (i > 0) AbstractNumericValue[-i] = new CompactNumericValue(-i);
    }
    AbstractNumericValue.ONE = AbstractNumericValue[1];
    AbstractNumericValue.ZERO = AbstractNumericValue[0];
    AbstractNumericValue.MINUS_ONE = AbstractNumericValue[-1];

    // Export static methods.
    AbstractNumericValue.max = maxNumber;
    AbstractNumericValue.min = minNumber;
    AbstractNumericValue.gcd = greatestCommonDivisor;
    AbstractNumericValue.lcm = leastCommonMultiple;
    AbstractNumericValue.isNumericInstance = function(x) {
        return x instanceof LargeNumericValue || x instanceof CompactNumericValue;
    };
    AbstractNumericValue.randomBetween = randomBetween;
    AbstractNumericValue.fromChunkArray = function(chunks, base, isNegative) {
        const parsedDigits = chunks.map(parseInputToNumeric);
        const parsedBase = parseInputToNumeric(base || 10);
        return parseDigitsInBase(parsedDigits, parsedBase, isNegative);
    };

    return AbstractNumericValue;
})();

// Initialize the BigInt library.
const bigNumFactory = ArbitraryPrecisionMath;

// Define the modulus for calculations.
const calculationModulus = bigNumFactory(1e9 + 7);

// --- Main Program Execution ---
/**
 * The main function to solve the problem.
 * Reads input, performs calculations using arbitrary precision arithmetic,
 * and returns the final result.
 * @returns {number|string} The final computed value.
 */
function solveProblem() {
    // Read the number of elements.
    const numElements = inputSource.extractToken();
    // Read the array of numbers.
    const inputNumericArray = inputSource.fetchLineData();

    if (!Array.isArray(inputNumericArray) || inputNumericArray.length === 0) {
        console.error("Error: Input array is empty.");
        return 0;
    }
    if (numElements !== inputNumericArray.length) {
        console.warn(`Warning: Declared number of elements (${numElements}) does not match actual input array length (${inputNumericArray.length}). Using actual length.`);
    }

    // Calculate the Least Common Multiple (LCM) of all numbers in the array.
    // Start with the first element as the initial LCM, converting it to a BigNum.
    let currentLcm = bigNumFactory(inputNumericArray[0]);
    // Iterate through the rest of the array to compute cumulative LCM.
    for (let i = 1; i < inputNumericArray.length; i++) {
        currentLcm = bigNumFactory.lcm(currentLcm, inputNumericArray[i]);
    }
    // Apply modulo to the calculated LCM.
    currentLcm = currentLcm.mod(calculationModulus);

    // Initialize an accumulator for the final sum.
    let finalSumAccumulator = bigNumFactory.ZERO;
    // Iterate through the input array to compute the sum of (LCM / a[i]) % mod.
    for (const num of inputNumericArray) {
        const currentNumBig = bigNumFactory(num);
        // Calculate (1 / a[i]) % mod using modular inverse.
        const inverseMod = currentNumBig.modularInverse(calculationModulus);
        // Multiply LCM by the modular inverse of a[i], then take modulo.
        const term = currentLcm.multiply(inverseMod).mod(calculationModulus);
        // Add to the total sum.
        finalSumAccumulator = finalSumAccumulator.add(term);
    }

    // Return the final sum modulo the calculationModulus, converted to a native JS number.
    return finalSumAccumulator.mod(calculationModulus).toJSNumber();
}

// Execute the main problem-solving function.
const problemResult = solveProblem();
// Output the result if it's not undefined.
if (problemResult !== undefined) {
    console.log(problemResult);
}