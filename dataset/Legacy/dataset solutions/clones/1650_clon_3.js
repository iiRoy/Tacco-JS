const InputParser = (() => {
    // Internal function to create a new DataStreamReader instance
    function createStreamReader(inputStringContent) {
        // Basic validation for input content
        if (typeof inputStringContent !== 'string' || inputStringContent.length === 0) {
            console.warn("InputParser received empty or invalid string content. Proceeding with empty data.");
            return new DataStreamReader("");
        }
        return new DataStreamReader(inputStringContent);
    }

    // Class to handle reading and processing input data lines
    class DataStreamReader {
        // Internal storage for processed lines, using private class fields for encapsulation
        #processedLines;

        /**
         * Constructs a DataStreamReader instance.
         * @param {string} rawInputString - The raw string input, typically from a file.
         */
        constructor(rawInputString) {
            // Trim whitespace from input and split into individual lines.
            // Filtering out empty lines for robustness.
            this.#processedLines = rawInputString.trim().split("\n").filter(line => line.length > 0);
        }

        /**
         * Retrieves the raw string content of a specific line by its index.
         * @param {number} lineIndex - The zero-based index of the desired line.
         * @returns {string} The content of the specified line.
         * @throws {Error} If the line index is out of bounds.
         */
        getLineContent(lineIndex) {
            this.#validateLineIndex(lineIndex);
            return this.#processedLines[lineIndex];
        }

        /**
         * Parses a specific line into an array of numbers.
         * Elements are split by spaces and converted to numbers. Non-numeric elements remain as strings.
         * @param {number} lineIndex - The zero-based index of the desired line.
         * @returns {Array<number|string>} An array of numbers or original strings.
         * @throws {Error} If the line index is out of bounds.
         */
        getLineAsNumbers(lineIndex) {
            this.#validateLineIndex(lineIndex);
            // Delegate to a helper method for string-to-array conversion
            return this.#convertStringToNumericArray(this.#processedLines[lineIndex]);
        }

        /**
         * Extracts a segment of lines starting from `startIndex` and converts each line
         * into a single number. If a line is not purely numeric, it remains a string.
         * @param {number} startIndex - The starting line index (inclusive).
         * @param {number} [countLimit] - The maximum number of lines to extract. If omitted, extracts until end.
         * @returns {Array<number|string>} An array of numbers or original strings from the specified segment.
         */
        extractNumericSegment(startIndex, countLimit) {
            // Ensure countLimit is a non-negative number, defaulting to remaining lines if invalid
            const effectiveLimit = Math.max(0, Number(countLimit) || (this.#processedLines.length - startIndex));
            if (effectiveLimit === 0) return []; // Return empty array if limit is zero or no lines to read

            // Calculate the actual end index, ensuring it doesn't exceed the total number of lines
            const endIndex = Math.min(startIndex + effectiveLimit, this.#processedLines.length);

            // Slice the internal array and map each string value to a number or its original form
            return this.#processedLines.slice(startIndex, endIndex).map(lineValue => this.#attemptParseToNumber(lineValue));
        }

        /**
         * Extracts a segment of lines and converts each line into an array of numbers.
         * Each line itself is treated as a space-separated list of values.
         * @param {number} startIndex - The starting line index (inclusive).
         * @param {number} [countLimit] - The maximum number of lines to extract. If omitted, extracts until end.
         * @returns {Array<Array<number|string>>} An array of arrays, where each inner array contains numbers or strings.
         */
        extractNumericArraySegment(startIndex, countLimit) {
            // Similar limit handling as extractNumericSegment
            const effectiveLimit = Math.max(0, Number(countLimit) || (this.#processedLines.length - startIndex));
            if (effectiveLimit === 0) return [];

            const endIndex = Math.min(startIndex + effectiveLimit, this.#processedLines.length);

            // Slice the internal array and map each string value to an array of numbers
            return this.#processedLines.slice(startIndex, endIndex).map(lineValue => this.#convertStringToNumericArray(lineValue));
        }

        /**
         * Private helper method to convert a space-separated string into an array of numbers.
         * @param {string} inputString - The string to convert.
         * @returns {Array<number|string>} An array of numbers or original strings.
         */
        #convertStringToNumericArray(inputString) {
            // Split by space, filter out any empty strings (e.g., from multiple spaces), and convert each part
            return inputString.split(" ").filter(s => s.length > 0).map(subValue => this.#attemptParseToNumber(subValue));
        }

        /**
         * Private helper method to attempt converting a string to a number.
         * If the conversion results in NaN, the original string is returned.
         * @param {string} inputStr - The string to convert.
         * @returns {number|string} The parsed number or the original string.
         */
        #attemptParseToNumber(inputStr) {
            const parsedNum = Number(inputStr);
            // Check if the parsed number is a valid number (i.e., not NaN)
            return Number.isNaN(parsedNum) ? inputStr : parsedNum;
        }

        /**
         * Private method for validating if a given line index is within the valid range.
         * @param {number} index - The line index to validate.
         * @throws {Error} If the index is out of bounds.
         */
        #validateLineIndex(index) {
            if (index < 0 || index >= this.#processedLines.length) {
                throw new Error(`Line index ${index} is out of bounds. Total lines available: ${this.#processedLines.length}.`);
            }
        }
    }

    return createStreamReader;
})();

// Create an instance of the input reader by reading from standard input
const inputDataHandler = InputParser(require("fs").readFileSync("/dev/stdin", "utf8"));

// ----------------------------------------------------------------------------------------------------
// Start of the modified LargeInteger library section
// This section is a Type III clone of the BigInteger.js library, with renamed identifiers,
// reformatting, added comments, and minor structural adjustments for cloning purposes.
// The core mathematical algorithms remain unchanged to preserve functionality.
// Original source: https://github.com/peterolson/BigInteger.js
// ----------------------------------------------------------------------------------------------------

const largeInteger = (function (undefined) {
    "use strict";

    // Internal constants for numeric representation and limits
    const DIGIT_BASE = 1e7; // Base for internal digit arrays (10^7)
    const LOG_DIGIT_BASE = 7; // Log10 of DIGIT_BASE, used for string parsing
    const JS_MAX_SAFE_INT = 9007199254740992; // 2^53, maximum safe integer in JavaScript
    const JS_MAX_SAFE_INT_DIGITS = convertSmallToDigitArray(JS_MAX_SAFE_INT); // Digit array representation of MAX_SAFE_INT
    const DEFAULT_RADIX_ALPHABET = "0123456789abcdefghijklmnopqrstuvwxyz"; // Default alphabet for radix conversion

    // Feature detection for native BigInt support
    const hasNativeBigIntSupport = typeof BigInt === "function";

    /**
     * Main factory function for creating LargeNumber instances.
     * This acts as the public interface for the library.
     * @param {any} inputValue - The value to convert into a LargeNumber (number, string, BigInt, or another LargeNumber).
     * @param {number} [radixValue] - The radix (base) of the input string, if `inputValue` is a string.
     * @param {string} [customAlphabet] - Custom alphabet for parsing string input in non-standard bases.
     * @param {boolean} [isCaseSensitive] - Whether parsing of custom alphabet is case-sensitive.
     * @returns {LargeNumberImpl | SmallNumberImpl | NativeLargeNumberImpl} A LargeNumber instance.
     */
    function LargeNumber(inputValue, radixValue, customAlphabet, isCaseSensitive) {
        if (typeof inputValue === "undefined") {
            return LargeNumber[0]; // Default to zero if no value is provided
        }
        if (typeof radixValue !== "undefined") {
            // Optimization: if radix is 10 and no custom alphabet, use direct parsing
            if (+radixValue === 10 && !customAlphabet) {
                return parseInputToValue(inputValue);
            } else {
                return parseValueWithRadix(inputValue, radixValue, customAlphabet, isCaseSensitive);
            }
        }
        return parseInputToValue(inputValue);
    }

    /**
     * Prototype for LargeNumberImpl instances. These represent numbers that exceed
     * JavaScript's safe integer range and are stored as arrays of digits.
     * @param {number[]} digitArray - An array of digits in base `DIGIT_BASE`.
     * @param {boolean} isNegative - True if the number is negative, false otherwise.
     */
    function LargeNumberImpl(digitArray, isNegative) {
        this.value = digitArray;
        this.sign = isNegative;
        this.isSmall = false; // Flag to distinguish from SmallNumberImpl
    }
    LargeNumberImpl.prototype = Object.create(LargeNumber.prototype);
    LargeNumberImpl.prototype.constructor = LargeNumberImpl; // Correct constructor reference

    /**
     * Prototype for SmallNumberImpl instances. These represent numbers that fit
     * within JavaScript's safe integer range and are stored as native JS numbers.
     * @param {number} numericValue - The raw JavaScript number.
     */
    function SmallNumberImpl(numericValue) {
        this.value = numericValue;
        this.sign = numericValue < 0; // Determine sign from the JS number
        this.isSmall = true; // Flag to distinguish from LargeNumberImpl
    }
    SmallNumberImpl.prototype = Object.create(LargeNumber.prototype);
    SmallNumberImpl.prototype.constructor = SmallNumberImpl; // Correct constructor reference

    /**
     * Prototype for NativeLargeNumberImpl instances. Used when native BigInt
     * support is available, wrapping the native BigInt object.
     * @param {BigInt} nativeValue - The native BigInt value.
     */
    function NativeLargeNumberImpl(nativeValue) {
        this.value = nativeValue;
    }
    NativeLargeNumberImpl.prototype = Object.create(LargeNumber.prototype);
    NativeLargeNumberImpl.prototype.constructor = NativeLargeNumberImpl; // Correct constructor reference

    /**
     * Checks if a standard JavaScript number is within the safe integer range.
     * @param {number} n - The number to check.
     * @returns {boolean} True if the number is precise (within 2^53 - 1 to -(2^53 - 1)).
     */
    function isJsPrecise(n) {
        return -JS_MAX_SAFE_INT < n && n < JS_MAX_SAFE_INT;
    }

    /**
     * Converts a small JavaScript number into an array of digits (base `DIGIT_BASE`).
     * This is used to represent JS numbers as digit arrays for large number arithmetic.
     * @param {number} n - The number to convert.
     * @returns {number[]} An array of digits.
     */
    function convertSmallToDigitArray(n) {
        // Handle numbers up to DIGIT_BASE^3 for efficiency
        if (n < DIGIT_BASE) return [n];
        if (n < DIGIT_BASE * DIGIT_BASE) return [n % DIGIT_BASE, Math.floor(n / DIGIT_BASE)];
        return [n % DIGIT_BASE, Math.floor(n / DIGIT_BASE) % DIGIT_BASE, Math.floor(n / (DIGIT_BASE * DIGIT_BASE))];
    }

    /**
     * Converts an array of digits (base `DIGIT_BASE`) back to a small JavaScript number
     * if it fits within the safe integer range. Otherwise, returns the original array.
     * @param {number[]} digitArray - The array of digits.
     * @returns {number | number[]} The converted number or the original digit array.
     */
    function convertDigitArrayToSmall(digitArray) {
        trimLeadingZeros(digitArray); // Ensure no leading zeros for accurate conversion
        const len = digitArray.length;
        // Check if the number represented by the digit array is small enough
        if (len < 4 && compareAbsolute(digitArray, JS_MAX_SAFE_INT_DIGITS) < 0) {
            switch (len) {
                case 0:
                    return 0;
                case 1:
                    return digitArray[0];
                case 2:
                    return digitArray[0] + digitArray[1] * DIGIT_BASE;
                default: // case 3
                    return digitArray[0] + (digitArray[1] + digitArray[2] * DIGIT_BASE) * DIGIT_BASE;
            }
        }
        return digitArray;
    }

    /**
     * Removes leading zero digits from a digit array representation of a number.
     * This ensures canonical form and avoids issues with arithmetic operations.
     * @param {number[]} digitArray - The array of digits to trim.
     */
    function trimLeadingZeros(digitArray) {
        let i = digitArray.length;
        while (i > 0 && digitArray[--i] === 0); // Find the last non-zero digit
        digitArray.length = i + 1; // Truncate the array to remove trailing zeros
    }

    /**
     * Creates a new array of a specified length, initialized with zeros.
     * @param {number} length - The desired length of the array.
     * @returns {number[]} An array filled with zeros.
     */
    function createZeroFilledArray(length) {
        const arr = new Array(length);
        for (let i = 0; i < length; i++) {
            arr[i] = 0;
        }
        return arr;
    }

    /**
     * Truncates a number to its integer part. For positive numbers, it's `Math.floor()`;
     * for negative numbers, it's `Math.ceil()`. This is equivalent to `Math.trunc()`.
     * @param {number} n - The number to truncate.
     * @returns {number} The truncated integer.
     */
    function truncateToInteger(n) {
        return (n > 0) ? Math.floor(n) : Math.ceil(n);
    }

    // --- Arithmetic Operations ---

    /**
     * Adds two digit arrays, assuming both represent positive numbers.
     * `arr1` is expected to be the longer or equal-length array for efficiency.
     * @param {number[]} arr1 - The first (and usually longer) digit array.
     * @param {number[]} arr2 - The second digit array.
     * @returns {number[]} The sum as a digit array.
     */
    function addDigitArrays(arr1, arr2) {
        const len1 = arr1.length,
            len2 = arr2.length;
        const result = new Array(len1); // Result array will be at least as long as arr1
        let carry = 0;
        let sum;
        let i;

        // Add digits up to the length of the shorter array (`len2`)
        for (i = 0; i < len2; i++) {
            sum = arr1[i] + arr2[i] + carry;
            carry = sum >= DIGIT_BASE ? 1 : 0; // Determine carry
            result[i] = sum - carry * DIGIT_BASE; // Store the current digit
        }

        // Add any remaining digits from the longer array (`arr1`) with the carry
        while (i < len1) {
            sum = arr1[i] + carry;
            carry = sum === DIGIT_BASE ? 1 : 0; // Carry is 1 if sum equals DIGIT_BASE
            result[i++] = sum - carry * DIGIT_BASE;
        }

        // If there's a final carry, append it to the result
        if (carry > 0) {
            result.push(carry);
        }
        return result;
    }

    /**
     * Adds two digit arrays, ensuring the longer array is passed first to `addDigitArrays`.
     * @param {number[]} arr1 - The first digit array.
     * @param {number[]} arr2 - The second digit array.
     * @returns {number[]} The sum as a digit array.
     */
    function addAnyDigitArrays(arr1, arr2) {
        if (arr1.length >= arr2.length) {
            return addDigitArrays(arr1, arr2);
        }
        return addDigitArrays(arr2, arr1); // Swap to ensure `arr1` is the longer one
    }

    /**
     * Adds a small JavaScript number (carry) to a digit array.
     * @param {number[]} digitArray - The array representing a large number.
     * @param {number} carryValue - The small number to add.
     * @returns {number[]} The result as a new digit array.
     */
    function addSmallToDigitArray(digitArray, carryValue) {
        const len = digitArray.length;
        const result = new Array(len);
        let currentCarry = carryValue;
        let sum;
        let i;

        for (i = 0; i < len; i++) {
            sum = digitArray[i] + currentCarry; // Direct addition
            currentCarry = Math.floor(sum / DIGIT_BASE); // New carry
            result[i] = sum % DIGIT_BASE; // Current digit
        }

        // Propagate any remaining carry
        while (currentCarry > 0) {
            result[i++] = currentCarry % DIGIT_BASE;
            currentCarry = Math.floor(currentCarry / DIGIT_BASE);
        }
        return result;
    }

    LargeNumberImpl.prototype.add = function (otherValue) {
        const otherNum = parseInputToValue(otherValue);
        // If signs are different, it's effectively a subtraction
        if (this.sign !== otherNum.sign) {
            return this.subtract(otherNum.negate());
        }
        const valA = this.value,
            valB = otherNum.value;
        if (otherNum.isSmall) {
            // If the other number is small, add its absolute value to the digit array
            return new LargeNumberImpl(addSmallToDigitArray(valA, Math.abs(valB)), this.sign);
        }
        // Both are large, use general array addition
        return new LargeNumberImpl(addAnyDigitArrays(valA, valB), this.sign);
    };
    LargeNumberImpl.prototype.plus = LargeNumberImpl.prototype.add; // Alias for add

    SmallNumberImpl.prototype.add = function (otherValue) {
        const otherNum = parseInputToValue(otherValue);
        const valA = this.value;
        // If signs are different, it's effectively a subtraction
        if (this.sign !== otherNum.sign) {
            return this.subtract(otherNum.negate());
        }
        const valB = otherNum.value;
        if (otherNum.isSmall) {
            // Both are small, check if their sum is precise
            const sum = valA + valB;
            if (isJsPrecise(sum)) {
                return new SmallNumberImpl(sum);
            }
            // If not precise, convert to digit arrays and add
            return new LargeNumberImpl(addAnyDigitArrays(convertSmallToDigitArray(Math.abs(valA)), convertSmallToDigitArray(Math.abs(valB))), valA < 0);
        }
        // One small, one large. Convert small to digit array and add.
        return new LargeNumberImpl(addSmallToDigitArray(valB, Math.abs(valA)), valA < 0);
    };
    SmallNumberImpl.prototype.plus = SmallNumberImpl.prototype.add;

    NativeLargeNumberImpl.prototype.add = function (otherValue) {
        return new NativeLargeNumberImpl(this.value + parseInputToValue(otherValue).value);
    };
    NativeLargeNumberImpl.prototype.plus = NativeLargeNumberImpl.prototype.add;

    /**
     * Subtracts digit array `arr2` from `arr1`, assuming `arr1` >= `arr2` in absolute value.
     * @param {number[]} arr1 - The minuend digit array.
     * @param {number[]} arr2 - The subtrahend digit array.
     * @returns {number[]} The difference as a digit array.
     */
    function subtractDigitArrays(arr1, arr2) {
        const len1 = arr1.length,
            len2 = arr2.length;
        const result = new Array(len1);
        let borrow = 0;
        let difference;
        let i;

        // Subtract digits up to the length of the shorter array (`len2`)
        for (i = 0; i < len2; i++) {
            difference = arr1[i] - borrow - arr2[i];
            if (difference < 0) {
                difference += DIGIT_BASE;
                borrow = 1;
            } else {
                borrow = 0;
            }
            result[i] = difference;
        }

        // Propagate borrow through remaining digits of `arr1`
        for (i = len2; i < len1; i++) {
            difference = arr1[i] - borrow;
            if (difference < 0) {
                difference += DIGIT_BASE;
            } else {
                result[i++] = difference; // If no borrow, copy remaining digits and break
                break;
            }
            result[i] = difference;
        }

        // Copy any remaining digits from `arr1` (if no more borrows)
        for (; i < len1; i++) {
            result[i] = arr1[i];
        }

        trimLeadingZeros(result); // Remove leading zeros from the result
        return result;
    }

    /**
     * Performs subtraction between two digit arrays, handling signs and operand order.
     * @param {number[]} arr1 - First digit array.
     * @param {number[]} arr2 - Second digit array.
     * @param {boolean} currentSign - The sign of the original first operand.
     * @returns {LargeNumberImpl | SmallNumberImpl} The result of subtraction.
     */
    function subtractAnyDigitArrays(arr1, arr2, currentSign) {
        let value;
        let finalSign = currentSign;

        // Determine which array is larger in absolute value to ensure correct subtraction order
        if (compareAbsolute(arr1, arr2) >= 0) {
            value = subtractDigitArrays(arr1, arr2);
        } else {
            value = subtractDigitArrays(arr2, arr1);
            finalSign = !currentSign; // Flip sign if we swapped operands
        }

        // Attempt to convert the result back to a small integer if possible
        const convertedValue = convertDigitArrayToSmall(value);
        if (typeof convertedValue === "number") {
            if (finalSign) return new SmallNumberImpl(-convertedValue); // Apply final sign
            return new SmallNumberImpl(convertedValue);
        }
        return new LargeNumberImpl(convertedValue, finalSign);
    }

    /**
     * Subtracts a small number from a digit array.
     * @param {number[]} digitArray - The digit array to subtract from.
     * @param {number} smallNum - The small number (subtrahend).
     * @param {boolean} currentSign - The sign of the original digit array.
     * @returns {LargeNumberImpl | SmallNumberImpl} The result.
     */
    function subtractSmallFromDigitArray(digitArray, smallNum, currentSign) {
        const len = digitArray.length;
        const result = new Array(len);
        let carry = -smallNum; // Initial carry for subtraction
        let difference;
        let i;

        for (i = 0; i < len; i++) {
            difference = digitArray[i] + carry;
            carry = Math.floor(difference / DIGIT_BASE);
            difference %= DIGIT_BASE;
            result[i] = difference < 0 ? difference + DIGIT_BASE : difference; // Ensure positive digit
        }

        // Attempt to convert the result back to a small integer if possible
        const convertedResult = convertDigitArrayToSmall(result);
        if (typeof convertedResult === "number") {
            if (currentSign) return new SmallNumberImpl(-convertedResult);
            return new SmallNumberImpl(convertedResult);
        }
        return new LargeNumberImpl(convertedResult, currentSign);
    }

    LargeNumberImpl.prototype.subtract = function (otherValue) {
        const otherNum = parseInputToValue(otherValue);
        // If signs are different, it's effectively an addition with a negated operand
        if (this.sign !== otherNum.sign) {
            return this.add(otherNum.negate());
        }
        const valA = this.value,
            valB = otherNum.value;
        if (otherNum.isSmall) {
            // Subtract small number from large digit array
            return subtractSmallFromDigitArray(valA, Math.abs(valB), this.sign);
        }
        // Both are large, use general array subtraction
        return subtractAnyDigitArrays(valA, valB, this.sign);
    };
    LargeNumberImpl.prototype.minus = LargeNumberImpl.prototype.subtract;

    SmallNumberImpl.prototype.subtract = function (otherValue) {
        const otherNum = parseInputToValue(otherValue);
        const valA = this.value;
        // If signs are different, it's effectively an addition with a negated operand
        if (this.sign !== otherNum.sign) {
            return this.add(otherNum.negate());
        }
        const valB = otherNum.value;
        if (otherNum.isSmall) {
            // Both are small, directly subtract
            return new SmallNumberImpl(valA - valB);
        }
        // Small minuend, large subtrahend. This effectively means we're doing -(large - abs(small)).
        // `subtractSmallFromDigitArray` expects the larger absolute value as the first argument.
        // `valB` is the digit array of the large number.
        // `Math.abs(valA)` is the small number's absolute value.
        // The `valA >= 0` determines the sign of the result before potential negation.
        return subtractSmallFromDigitArray(valB, Math.abs(valA), valA >= 0);
    };
    SmallNumberImpl.prototype.minus = SmallNumberImpl.prototype.subtract;

    NativeLargeNumberImpl.prototype.subtract = function (otherValue) {
        return new NativeLargeNumberImpl(this.value - parseInputToValue(otherValue).value);
    };
    NativeLargeNumberImpl.prototype.minus = NativeLargeNumberImpl.prototype.subtract;

    LargeNumberImpl.prototype.negate = function () {
        return new LargeNumberImpl(this.value, !this.sign); // Flip the sign
    };
    SmallNumberImpl.prototype.negate = function () {
        const negatedSmall = new SmallNumberImpl(-this.value);
        negatedSmall.sign = !this.sign; // Ensure sign is explicitly set
        return negatedSmall;
    };
    NativeLargeNumberImpl.prototype.negate = function () {
        return new NativeLargeNumberImpl(-this.value);
    };

    LargeNumberImpl.prototype.abs = function () {
        return new LargeNumberImpl(this.value, false); // Absolute value is always non-negative
    };
    SmallNumberImpl.prototype.abs = function () {
        return new SmallNumberImpl(Math.abs(this.value));
    };
    NativeLargeNumberImpl.prototype.abs = function () {
        return new NativeLargeNumberImpl(this.value >= BigInt(0) ? this.value : -this.value);
    };

    /**
     * Multiplies two digit arrays using the standard long multiplication algorithm.
     * @param {number[]} arr1 - First digit array.
     * @param {number[]} arr2 - Second digit array.
     * @returns {number[]} The product as a digit array.
     */
    function multiplyLongDigitArrays(arr1, arr2) {
        const len1 = arr1.length,
            len2 = arr2.length;
        const result = createZeroFilledArray(len1 + len2); // Max possible length for product
        let product, carry;
        let i, j;

        for (i = 0; i < len1; ++i) {
            const digit1 = arr1[i];
            for (j = 0; j < len2; ++j) {
                const digit2 = arr2[j];
                product = digit1 * digit2 + result[i + j];
                carry = Math.floor(product / DIGIT_BASE);
                result[i + j] = product - carry * DIGIT_BASE;
                result[i + j + 1] += carry; // Add carry to the next position
            }
        }
        trimLeadingZeros(result);
        return result;
    }

    /**
     * Multiplies a digit array by a small JavaScript number.
     * @param {number[]} digitArray - The digit array.
     * @param {number} smallMultiplier - The small number multiplier.
     * @returns {number[]} The product as a digit array.
     */
    function multiplyDigitArrayBySmall(digitArray, smallMultiplier) {
        const len = digitArray.length;
        const result = new Array(len);
        let carry = 0;
        let product;
        let i;

        for (i = 0; i < len; i++) {
            product = digitArray[i] * smallMultiplier + carry;
            carry = Math.floor(product / DIGIT_BASE);
            result[i] = product - carry * DIGIT_BASE;
        }

        // Propagate any remaining carry
        while (carry > 0) {
            result[i++] = carry % DIGIT_BASE;
            carry = Math.floor(carry / DIGIT_BASE);
        }
        return result;
    }

    /**
     * Shifts a digit array left by `n` positions (conceptually multiplying by `DIGIT_BASE^n`).
     * @param {number[]} digitArray - The array to shift.
     * @param {number} n - Number of zero digits to prepend.
     * @returns {number[]} The shifted array.
     */
    function shiftDigitsLeft(digitArray, n) {
        const shifted = [];
        while (n-- > 0) shifted.push(0);
        return shifted.concat(digitArray);
    }

    /**
     * Karatsuba multiplication algorithm for faster multiplication of very large numbers.
     * It's a divide and conquer algorithm.
     * @param {number[]} x - First digit array.
     * @param {number[]} y - Second digit array.
     * @returns {number[]} The product as a digit array.
     */
    function multiplyUsingKaratsuba(x, y) {
        const n = Math.max(x.length, y.length);
        // Base case: if numbers are small enough, use long multiplication (more efficient for small N)
        if (n <= 30) return multiplyLongDigitArrays(x, y); // The threshold can be tuned empirically

        const halfN = Math.ceil(n / 2); // Split point for Karatsuba

        // Split x and y into two halves: x = b*B^halfN + a, y = d*B^halfN + c
        const b = x.slice(halfN);
        const a = x.slice(0, halfN);
        const d = y.slice(halfN);
        const c = y.slice(0, halfN);

        // Recursively compute three products
        const ac = multiplyUsingKaratsuba(a, c);
        const bd = multiplyUsingKaratsuba(b, d);
        const sum_a_b = addAnyDigitArrays(a, b);
        const sum_c_d = addAnyDigitArrays(c, d);
        const abcd = multiplyUsingKaratsuba(sum_a_b, sum_c_d);

        // Combine results using Karatsuba's formula:
        // product = ac * B^(2*halfN) + ( (a+b)(c+d) - ac - bd ) * B^halfN + bd
        const middleTerm = subtractDigitArrays(subtractDigitArrays(abcd, ac), bd);
        const product = addAnyDigitArrays(addAnyDigitArrays(ac, shiftDigitsLeft(middleTerm, halfN)), shiftDigitsLeft(bd, 2 * halfN));

        trimLeadingZeros(product);
        return product;
    }

    /**
     * Heuristic to decide whether to use Karatsuba multiplication over standard long multiplication.
     * Karatsuba has a higher overhead but better asymptotic complexity.
     * @param {number} len1 - Length of the first digit array.
     * @param {number} len2 - Length of the second digit array.
     * @returns {boolean} True if Karatsuba is likely faster for these lengths.
     */
    function shouldUseKaratsuba(len1, len2) {
        // This is an empirically derived heuristic from the original library.
        return -.012 * len1 - .012 * len2 + 15e-6 * len1 * len2 > 0;
    }

    LargeNumberImpl.prototype.multiply = function (otherValue) {
        const otherNum = parseInputToValue(otherValue);
        const valA = this.value,
            valB = otherNum.value;
        const finalSign = this.sign !== otherNum.sign; // Result sign is XOR of operands' signs

        if (otherNum.isSmall) {
            const smallVal = otherNum.value;
            if (smallVal === 0) return LargeNumber[0];
            if (smallVal === 1) return this;
            if (smallVal === -1) return this.negate();

            const absSmallVal = Math.abs(smallVal);
            if (absSmallVal < DIGIT_BASE) {
                return new LargeNumberImpl(multiplyDigitArrayBySmall(valA, absSmallVal), finalSign);
            }
            // If smallVal is larger than DIGIT_BASE but still a JS number, convert to digit array
            return new LargeNumberImpl(multiplyLongDigitArrays(valA, convertSmallToDigitArray(absSmallVal)), finalSign);
        }

        // Both operands are large numbers
        if (shouldUseKaratsuba(valA.length, valB.length)) {
            return new LargeNumberImpl(multiplyUsingKaratsuba(valA, valB), finalSign);
        }
        return new LargeNumberImpl(multiplyLongDigitArrays(valA, valB), finalSign);
    };
    LargeNumberImpl.prototype.times = LargeNumberImpl.prototype.multiply;

    /**
     * Helper for multiplication when one operand is a small JS number and the other is a digit array.
     * @param {number} smallOperand - The small number.
     * @param {number[]} digitArrayOperand - The digit array.
     * @param {boolean} finalSign - The sign of the result.
     * @returns {LargeNumberImpl} The product.
     */
    function multiplySmallAndDigitArray(smallOperand, digitArrayOperand, finalSign) {
        if (smallOperand < DIGIT_BASE) {
            return new LargeNumberImpl(multiplyDigitArrayBySmall(digitArrayOperand, smallOperand), finalSign);
        }
        // If smallOperand is larger than DIGIT_BASE, treat it as a small digit array
        return new LargeNumberImpl(multiplyLongDigitArrays(digitArrayOperand, convertSmallToDigitArray(smallOperand)), finalSign);
    }

    // Internal multiplication method for a LargeNumberImpl by a SmallNumberImpl
    LargeNumberImpl.prototype._multiplyBySmall = function (smallNumObj) {
        if (smallNumObj.value === 0) return LargeNumber[0];
        if (smallNumObj.value === 1) return this;
        if (smallNumObj.value === -1) return this.negate();
        return multiplySmallAndDigitArray(Math.abs(smallNumObj.value), this.value, this.sign !== smallNumObj.sign);
    };

    // Internal multiplication method for a SmallNumberImpl by a SmallNumberImpl
    SmallNumberImpl.prototype._multiplyBySmall = function (smallNumObj) {
        // Check if the product fits within JS safe integer range
        const product = smallNumObj.value * this.value;
        if (isJsPrecise(product)) {
            return new SmallNumberImpl(product);
        }
        // If not, convert to digit arrays and multiply
        return multiplySmallAndDigitArray(Math.abs(smallNumObj.value), convertSmallToDigitArray(Math.abs(this.value)), this.sign !== smallNumObj.sign);
    };

    SmallNumberImpl.prototype.multiply = function (otherValue) {
        // Delegate to the internal `_multiplyBySmall` method after parsing
        return parseInputToValue(otherValue)._multiplyBySmall(this);
    };
    SmallNumberImpl.prototype.times = SmallNumberImpl.prototype.multiply;

    NativeLargeNumberImpl.prototype.multiply = function (otherValue) {
        return new NativeLargeNumberImpl(this.value * parseInputToValue(otherValue).value);
    };
    NativeLargeNumberImpl.prototype.times = NativeLargeNumberImpl.prototype.multiply;

    /**
     * Squares a digit array using an optimized algorithm for squaring.
     * @param {number[]} digitArray - The array to square.
     * @returns {number[]} The squared value as a digit array.
     */
    function squareDigitArray(digitArray) {
        const len = digitArray.length;
        const result = createZeroFilledArray(len + len); // Max possible length for square
        let product, carry;
        let i, j;

        for (i = 0; i < len; i++) {
            const digit_i = digitArray[i];
            carry = 0; // Reset carry for each outer loop iteration

            // Calculate diagonal (digit_i * digit_i) and off-diagonal (2 * digit_i * digit_j) terms
            for (j = i; j < len; j++) {
                const digit_j = digitArray[j];
                // For j=i, it's digit_i * digit_i. For j>i, it's 2 * digit_i * digit_j (since a_i*a_j and a_j*a_i contribute)
                product = (i === j ? digit_i * digit_j : 2 * digit_i * digit_j) + result[i + j] + carry;
                carry = Math.floor(product / DIGIT_BASE);
                result[i + j] = product - carry * DIGIT_BASE;
            }
            result[i + len] += carry; // Add remaining carry to the next higher position
        }
        trimLeadingZeros(result);
        return result;
    }

    LargeNumberImpl.prototype.square = function () {
        return new LargeNumberImpl(squareDigitArray(this.value), false); // Square is always non-negative
    };
    SmallNumberImpl.prototype.square = function () {
        const squaredValue = this.value * this.value;
        if (isJsPrecise(squaredValue)) {
            return new SmallNumberImpl(squaredValue);
        }
        // If it overflows JS safe integer, convert to large number
        return new LargeNumberImpl(squareDigitArray(convertSmallToDigitArray(Math.abs(this.value))), false);
    };
    NativeLargeNumberImpl.prototype.square = function () {
        return new NativeLargeNumberImpl(this.value * this.value);
    };

    /**
     * Division with remainder helper function (Knuth's Algorithm D).
     * This is a complex algorithm designed for optimal performance with large numbers.
     * @param {number[]} dividend - The dividend digit array.
     * @param {number[]} divisor - The divisor digit array.
     * @returns {[number[], number[]]} An array containing [quotient, remainder] digit arrays.
     */
    function divModAlgorithm1(dividend, divisor) {
        const dividendLength = dividend.length,
            divisorLength = divisor.length;
        const quotientResult = createZeroFilledArray(dividendLength - divisorLength + 1);
        const divisorMostSignificantDigit = divisor[divisorLength - 1];

        // Normalize (multiply by lambda) to make divisor's MSD large enough.
        // This ensures the first guess of quotient digit is accurate or off by at most 2.
        const lambda = Math.ceil(DIGIT_BASE / (2 * divisorMostSignificantDigit));
        const normalizedRemainder = multiplyDigitArrayBySmall(dividend, lambda);
        const normalizedDivisor = multiplyDigitArrayBySmall(divisor, lambda);

        // Pad normalizedRemainder if needed and add a zero to normalizedDivisor for easier indexing
        if (normalizedRemainder.length <= dividendLength) normalizedRemainder.push(0);
        normalizedDivisor.push(0); // This makes normalizedDivisor.length == divisorLength + 1 after this line

        const newDivisorMSD = normalizedDivisor[divisorLength - 1];

        let quotientDigitGuess;
        let shiftPosition;
        let currentCarry, currentBorrow;
        let i, loopLength, qCandidate;

        // Iterate from the most significant digits down
        for (shiftPosition = dividendLength - divisorLength; shiftPosition >= 0; shiftPosition--) {
            // Estimate quotient digit
            quotientDigitGuess = DIGIT_BASE - 1;
            if (normalizedRemainder[shiftPosition + divisorLength] !== newDivisorMSD) {
                quotientDigitGuess = Math.floor((normalizedRemainder[shiftPosition + divisorLength] * DIGIT_BASE + normalizedRemainder[shiftPosition + divisorLength - 1]) / newDivisorMSD);
            }

            currentCarry = 0;
            currentBorrow = 0;
            loopLength = normalizedDivisor.length;
            for (i = 0; i < loopLength; i++) {
                currentCarry += quotientDigitGuess * normalizedDivisor[i];
                qCandidate = Math.floor(currentCarry / DIGIT_BASE);
                currentBorrow += normalizedRemainder[shiftPosition + i] - (currentCarry - qCandidate * DIGIT_BASE);
                currentCarry = qCandidate;

                if (currentBorrow < 0) {
                    normalizedRemainder[shiftPosition + i] = currentBorrow + DIGIT_BASE;
                    currentBorrow = -1;
                } else {
                    normalizedRemainder[shiftPosition + i] = currentBorrow;
                    currentBorrow = 0;
                }
            }

            // Adjust quotient digit if guess was too high (remainder becomes negative)
            while (currentBorrow !== 0) {
                quotientDigitGuess -= 1;
                currentCarry = 0;
                for (i = 0; i < loopLength; i++) {
                    currentCarry += normalizedRemainder[shiftPosition + i] - DIGIT_BASE + normalizedDivisor[i];
                    if (currentCarry < 0) {
                        normalizedRemainder[shiftPosition + i] = currentCarry + DIGIT_BASE;
                        currentCarry = 0;
                    } else {
                        normalizedRemainder[shiftPosition + i] = currentCarry;
                        currentCarry = 1;
                    }
                }
                currentBorrow += currentCarry;
            }
            quotientResult[shiftPosition] = quotientDigitGuess;
        }

        // Denormalize the remainder
        const finalRemainder = divModSmallNumber(normalizedRemainder, lambda)[0];
        return [convertDigitArrayToSmall(quotientResult), convertDigitArrayToSmall(finalRemainder)];
    }

    /**
     * Simpler division with remainder for smaller dividend/divisor lengths.
     * This is a "schoolbook" long division approach, less efficient than Algorithm D but easier to implement.
     * @param {number[]} dividend - The dividend digit array.
     * @param {number[]} divisor - The divisor digit array.
     * @returns {[number[], number[]]} An array containing [quotient, remainder] digit arrays.
     */
    function divModAlgorithm2(dividend, divisor) {
        let dividendLength = dividend.length,
            divisorLength = divisor.length;
        const quotientDigits = [];
        let currentPartialDividend = []; // Represents the current working part of the dividend

        let guessValue, highX, highY, checkProduct;

        // Iterate through the dividend digits from most significant to least
        while (dividendLength) {
            currentPartialDividend.unshift(dividend[--dividendLength]); // Take one digit from dividend
            trimLeadingZeros(currentPartialDividend); // Remove leading zeros from partial dividend

            // If current partial dividend is smaller than divisor, quotient digit is 0
            if (compareAbsolute(currentPartialDividend, divisor) < 0) {
                quotientDigits.push(0);
                continue;
            }

            // Estimate the quotient digit
            const partialLen = currentPartialDividend.length;
            highX = currentPartialDividend[partialLen - 1] * DIGIT_BASE + (partialLen > 1 ? currentPartialDividend[partialLen - 2] : 0);
            highY = divisor[divisorLength - 1] * DIGIT_BASE + (divisorLength > 1 ? divisor[divisorLength - 2] : 0);

            if (partialLen > divisorLength) {
                highX = (highX + 1) * DIGIT_BASE; // Adjust estimate if partial dividend is significantly larger
            }

            guessValue = Math.ceil(highX / highY);

            // Refine the guess by trial multiplication and subtraction
            do {
                checkProduct = multiplyDigitArrayBySmall(divisor, guessValue);
                if (compareAbsolute(checkProduct, currentPartialDividend) <= 0) break; // Guess is good or too low
                guessValue--; // Guess was too high, decrement
            } while (guessValue);

            quotientDigits.push(guessValue);
            currentPartialDividend = subtractDigitArrays(currentPartialDividend, checkProduct);
        }

        quotientDigits.reverse(); // Quotient digits were accumulated in reverse order
        return [convertDigitArrayToSmall(quotientDigits), convertDigitArrayToSmall(currentPartialDividend)];
    }

    /**
     * Divides a digit array by a small JavaScript number (lambda).
     * @param {number[]} digitArray - The array to divide.
     * @param {number} lambda - The small number divisor.
     * @returns {[number[], number]} An array containing [quotient digit array, remainder number].
     */
    function divModSmallNumber(digitArray, lambda) {
        const len = digitArray.length;
        const quotient = createZeroFilledArray(len);
        let remainder = 0;
        let currentDivisor, qDigit;

        // Perform long division from most significant digit
        for (let i = len - 1; i >= 0; --i) {
            currentDivisor = remainder * DIGIT_BASE + digitArray[i];
            qDigit = truncateToInteger(currentDivisor / lambda);
            remainder = currentDivisor - qDigit * lambda;
            quotient[i] = qDigit | 0; // Ensure integer
        }
        return [quotient, remainder | 0]; // Return quotient array and final remainder
    }

    /**
     * Generic division with remainder function that delegates to specific algorithms
     * based on input type and magnitude.
     * @param {LargeNumberImpl | SmallNumberImpl | NativeLargeNumberImpl} self - The dividend.
     * @param {any} divisorValue - The divisor (will be parsed).
     * @returns {[LargeNumberImpl | SmallNumberImpl | NativeLargeNumberImpl, LargeNumberImpl | SmallNumberImpl | NativeLargeNumberImpl]} [quotient, remainder].
     */
    function performDivisionWithRemainder(self, divisorValue) {
        const otherNum = parseInputToValue(divisorValue);

        // Handle native BigInt if supported
        if (hasNativeBigIntSupport) {
            return [new NativeLargeNumberImpl(self.value / otherNum.value), new NativeLargeNumberImpl(self.value % otherNum.value)];
        }

        const valA = self.value,
            valB = otherNum.value;
        let quotientResult, remainderResult;

        if (otherNum.isZero()) {
            throw new Error("Division by zero is not allowed.");
        }

        // Handle small number cases
        if (self.isSmall) {
            if (otherNum.isSmall) {
                return [new SmallNumberImpl(truncateToInteger(valA / valB)), new SmallNumberImpl(valA % valB)];
            }
            // Small dividend, large divisor -> quotient 0, remainder is dividend
            return [LargeNumber[0], self];
        }

        // Handle large dividend, small divisor
        if (otherNum.isSmall) {
            if (valB === 1) return [self, LargeNumber[0]];
            if (valB === -1) return [self.negate(), LargeNumber[0]];

            const absDivisor = Math.abs(valB);
            if (absDivisor < DIGIT_BASE) {
                const divisionOutput = divModSmallNumber(valA, absDivisor);
                quotientResult = convertDigitArrayToSmall(divisionOutput[0]);
                remainderResult = divisionOutput[1];

                if (self.sign) remainderResult = -remainderResult; // Apply sign to remainder

                if (typeof quotientResult === "number") {
                    if (self.sign !== otherNum.sign) quotientResult = -quotientResult;
                    return [new SmallNumberImpl(quotientResult), new SmallNumberImpl(remainderResult)];
                }
                return [new LargeNumberImpl(quotientResult, self.sign !== otherNum.sign), new SmallNumberImpl(remainderResult)];
            }
            // Small divisor, but too large for divModSmallNumber. Convert to digit array.
            valB = convertSmallToDigitArray(absDivisor);
        }

        // Both operands are large numbers (or `otherNum` was converted to digit array)
        const comparison = compareAbsolute(valA, valB);
        if (comparison === -1) return [LargeNumber[0], self]; // Dividend < Divisor
        if (comparison === 0) return [LargeNumber[self.sign === otherNum.sign ? 1 : -1], LargeNumber[0]]; // Dividend == Divisor

        // Choose division algorithm based on length heuristic
        if (valA.length + valB.length <= 200) { // Heuristic for switching algorithms
            [quotientResult, remainderResult] = divModAlgorithm1(valA, valB);
        } else {
            [quotientResult, remainderResult] = divModAlgorithm2(valA, valB);
        }

        // Determine signs for quotient and remainder
        const quotientSign = self.sign !== otherNum.sign;
        const remainderSign = self.sign;

        // Wrap results in appropriate LargeNumber types
        let finalQuotient, finalRemainder;
        if (typeof quotientResult === "number") {
            finalQuotient = new SmallNumberImpl(quotientSign ? -quotientResult : quotientResult);
        } else {
            finalQuotient = new LargeNumberImpl(quotientResult, quotientSign);
        }

        if (typeof remainderResult === "number") {
            finalRemainder = new SmallNumberImpl(remainderSign ? -remainderResult : remainderResult);
        } else {
            finalRemainder = new LargeNumberImpl(remainderResult, remainderSign);
        }

        return [finalQuotient, finalRemainder];
    }

    LargeNumberImpl.prototype.divmod = function (otherValue) {
        const resultPair = performDivisionWithRemainder(this, otherValue);
        return {
            quotient: resultPair[0],
            remainder: resultPair[1]
        };
    };
    NativeLargeNumberImpl.prototype.divmod = SmallNumberImpl.prototype.divmod = LargeNumberImpl.prototype.divmod;

    LargeNumberImpl.prototype.divide = function (otherValue) {
        return performDivisionWithRemainder(this, otherValue)[0];
    };
    NativeLargeNumberImpl.prototype.over = NativeLargeNumberImpl.prototype.divide = function (otherValue) {
        return new NativeLargeNumberImpl(this.value / parseInputToValue(otherValue).value);
    };
    SmallNumberImpl.prototype.over = SmallNumberImpl.prototype.divide = LargeNumberImpl.prototype.over = LargeNumberImpl.prototype.divide;

    LargeNumberImpl.prototype.mod = function (otherValue) {
        return performDivisionWithRemainder(this, otherValue)[1];
    };
    NativeLargeNumberImpl.prototype.mod = NativeLargeNumberImpl.prototype.remainder = function (otherValue) {
        return new NativeLargeNumberImpl(this.value % parseInputToValue(otherValue).value);
    };
    SmallNumberImpl.prototype.remainder = SmallNumberImpl.prototype.mod = LargeNumberImpl.prototype.remainder = LargeNumberImpl.prototype.mod;

    LargeNumberImpl.prototype.pow = function (exponentValue) {
        const exponentNum = parseInputToValue(exponentValue);
        const baseVal = this.value;
        let expVal = exponentNum.value; // Use let as expVal is modified
        let resultValue, xVar, yVar;

        if (exponentNum.isZero()) return LargeNumber[1]; // N^0 = 1
        if (baseVal === 0) return LargeNumber[0]; // 0^N = 0 (for N > 0)
        if (baseVal === 1) return LargeNumber[1]; // 1^N = 1
        if (baseVal === -1) return exponentNum.isEven() ? LargeNumber[1] : LargeNumber[-1]; // (-1)^N = 1 if N even, -1 if N odd

        if (exponentNum.isNegative()) {
            // For negative exponents, BigInts typically yield 0 (for integers) or throw error.
            // Returning 0 for non-unit bases.
            return LargeNumber[0];
        }
        if (!exponentNum.isSmall) {
            throw new Error(`Exponent ${exponentNum.toString()} is too large for current power implementation.`);
        }

        if (this.isSmall) {
            // If base is small, try direct Math.pow first
            if (isJsPrecise(resultValue = Math.pow(baseVal, expVal))) {
                return new SmallNumberImpl(truncateToInteger(resultValue));
            }
        }

        // Use exponentiation by squaring (binary exponentiation)
        xVar = this;
        yVar = LargeNumber[1]; // Initialize result to 1
        while (true) {
            if ((expVal & 1) === 1) { // If exponent is odd
                yVar = yVar.times(xVar);
                expVal--;
            }
            if (expVal === 0) break; // Exponent is 0, done
            expVal /= 2; // Divide exponent by 2
            xVar = xVar.square(); // Square the base
        }
        return yVar;
    };
    SmallNumberImpl.prototype.pow = LargeNumberImpl.prototype.pow;

    NativeLargeNumberImpl.prototype.pow = function (exponentValue) {
        const exponentNum = parseInputToValue(exponentValue);
        const baseVal = this.value;
        let expVal = exponentNum.value; // Use let as expVal is modified

        const _ZERO = BigInt(0),
            _ONE = BigInt(1),
            _TWO = BigInt(2);

        if (expVal === _ZERO) return LargeNumber[1];
        if (baseVal === _ZERO) return LargeNumber[0];
        if (baseVal === _ONE) return LargeNumber[1];
        if (baseVal === BigInt(-1)) return exponentNum.isEven() ? LargeNumber[1] : LargeNumber[-1];
        if (exponentNum.isNegative()) return new NativeLargeNumberImpl(_ZERO); // Native BigInt doesn't support fractional results.

        let xVar = this;
        let yVar = LargeNumber[1]; // Initialize result to 1

        while (true) {
            if ((expVal & _ONE) === _ONE) { // If exponent is odd
                yVar = yVar.times(xVar);
                expVal -= _ONE;
            }
            if (expVal === _ZERO) break;
            expVal /= _TWO; // Divide exponent by 2
            xVar = xVar.square(); // Square the base
        }
        return yVar;
    };

    LargeNumberImpl.prototype.modPow = function (exponent, modulus) {
        exponent = parseInputToValue(exponent);
        modulus = parseInputToValue(modulus);

        if (modulus.isZero()) {
            throw new Error("Cannot compute modular exponentiation with a modulus of zero.");
        }

        let result = LargeNumber[1];
        let base = this.mod(modulus); // Reduce base modulo modulus

        if (exponent.isNegative()) {
            // For negative exponents, calculate modular inverse
            exponent = exponent.multiply(LargeNumber[-1]); // Make exponent positive
            base = base.modInv(modulus); // Calculate modular inverse of base (a^-1 mod m)
        }

        // Standard modular exponentiation (binary method)
        while (exponent.isPositive()) {
            if (base.isZero()) return LargeNumber[0]; // Optimization: if base is 0, result is 0
            if (exponent.isOdd()) {
                result = result.multiply(base).mod(modulus);
            }
            exponent = exponent.divide(LargeNumber[2]); // exponent /= 2
            base = base.square().mod(modulus); // base = (base^2) % modulus
        }
        return result;
    };
    NativeLargeNumberImpl.prototype.modPow = SmallNumberImpl.prototype.modPow = LargeNumberImpl.prototype.modPow;

    /**
     * Compares the absolute values of two digit arrays.
     * @param {number[]} arr1 - First digit array.
     * @param {number[]} arr2 - Second digit array.
     * @returns {number} 0 if equal, 1 if arr1 > arr2, -1 if arr1 < arr2.
     */
    function compareAbsolute(arr1, arr2) {
        if (arr1.length !== arr2.length) {
            return arr1.length > arr2.length ? 1 : -1;
        }
        // If lengths are equal, compare digits from most significant to least
        for (let i = arr1.length - 1; i >= 0; i--) {
            if (arr1[i] !== arr2[i]) {
                return arr1[i] > arr2[i] ? 1 : -1;
            }
        }
        return 0; // Arrays are absolutely equal
    }

    LargeNumberImpl.prototype.compareAbs = function (otherValue) {
        const otherNum = parseInputToValue(otherValue);
        const valA = this.value,
            valB = otherNum.value;
        if (otherNum.isSmall) {
            // If otherNum is small, and this is large, this is generally larger in magnitude
            // unless this is 0 and otherNum is also 0. But for LargeNumberImpl, value is never empty array unless 0.
            // If this is a non-zero LargeNumberImpl, it's always greater than any SmallNumberImpl's absolute value.
            return 1;
        }
        return compareAbsolute(valA, valB);
    };

    SmallNumberImpl.prototype.compareAbs = function (otherValue) {
        const otherNum = parseInputToValue(otherValue);
        const valA = Math.abs(this.value),
            valB = otherNum.value;
        if (otherNum.isSmall) {
            const absOtherVal = Math.abs(valB);
            return valA === absOtherVal ? 0 : valA > absOtherVal ? 1 : -1;
        }
        // If this is small and otherNum is large, this is generally smaller in magnitude
        return -1;
    };

    NativeLargeNumberImpl.prototype.compareAbs = function (otherValue) {
        let valA = this.value;
        let valB = parseInputToValue(otherValue).value;
        valA = valA >= BigInt(0) ? valA : -valA;
        valB = valB >= BigInt(0) ? valB : -valB;
        return valA === valB ? 0 : valA > valB ? 1 : -1;
    };

    LargeNumberImpl.prototype.compare = function (otherValue) {
        if (otherValue === Infinity) return -1;
        if (otherValue === -Infinity) return 1;

        const otherNum = parseInputToValue(otherValue);
        const valA = this.value,
            valB = otherNum.value;

        // Compare signs first
        if (this.sign !== otherNum.sign) {
            return otherNum.sign ? 1 : -1; // If other is negative, this (positive) is larger; else this (negative) is smaller
        }

        // If otherNum is small and this is large, and they have the same sign
        if (otherNum.isSmall) {
            return this.sign ? -1 : 1; // If negative, large absolute value means smaller; if positive, large absolute value means larger
        }

        // Both are large or both are small, same sign
        const absoluteComparison = compareAbsolute(valA, valB);
        return absoluteComparison * (this.sign ? -1 : 1); // Flip result if both are negative
    };
    LargeNumberImpl.prototype.compareTo = LargeNumberImpl.prototype.compare;

    SmallNumberImpl.prototype.compare = function (otherValue) {
        if (otherValue === Infinity) return -1;
        if (otherValue === -Infinity) return 1;

        const otherNum = parseInputToValue(otherValue);
        const valA = this.value,
            valB = otherNum.value;

        if (otherNum.isSmall) {
            return valA === valB ? 0 : valA > valB ? 1 : -1;
        }

        // One small, one large. Compare signs.
        if (this.sign !== otherNum.sign) {
            return this.sign ? -1 : 1; // If this is negative, it's smaller; if positive, it's larger
        }
        // Same sign, but different types (small vs large).
        // A small number will always be "smaller" than a large one in magnitude.
        // So if both positive, small is smaller. If both negative, small is larger (closer to zero).
        return this.sign ? 1 : -1;
    };
    SmallNumberImpl.prototype.compareTo = SmallNumberImpl.prototype.compare;

    NativeLargeNumberImpl.prototype.compare = function (otherValue) {
        if (otherValue === Infinity) return -1;
        if (otherValue === -Infinity) return 1;

        const valA = this.value;
        const valB = parseInputToValue(otherValue).value;
        return valA === valB ? 0 : valA > valB ? 1 : -1;
    };
    NativeLargeNumberImpl.prototype.compareTo = NativeLargeNumberImpl.prototype.compare;


    // --- Comparison aliases ---
    LargeNumberImpl.prototype.equals = function (otherValue) {
        return this.compare(otherValue) === 0;
    };
    NativeLargeNumberImpl.prototype.eq = NativeLargeNumberImpl.prototype.equals = SmallNumberImpl.prototype.eq = SmallNumberImpl.prototype.equals = LargeNumberImpl.prototype.eq = LargeNumberImpl.prototype.equals;

    LargeNumberImpl.prototype.notEquals = function (otherValue) {
        return this.compare(otherValue) !== 0;
    };
    NativeLargeNumberImpl.prototype.neq = NativeLargeNumberImpl.prototype.notEquals = SmallNumberImpl.prototype.neq = SmallNumberImpl.prototype.notEquals = LargeNumberImpl.prototype.neq = LargeNumberImpl.prototype.notEquals;

    LargeNumberImpl.prototype.greater = function (otherValue) {
        return this.compare(otherValue) > 0;
    };
    NativeLargeNumberImpl.prototype.gt = NativeLargeNumberImpl.prototype.greater = SmallNumberImpl.prototype.gt = SmallNumberImpl.prototype.greater = LargeNumberImpl.prototype.gt = LargeNumberImpl.prototype.greater;

    LargeNumberImpl.prototype.lesser = function (otherValue) {
        return this.compare(otherValue) < 0;
    };
    NativeLargeNumberImpl.prototype.lt = NativeLargeNumberImpl.prototype.lesser = SmallNumberImpl.prototype.lt = SmallNumberImpl.prototype.lesser = LargeNumberImpl.prototype.lt = LargeNumberImpl.prototype.lesser;

    LargeNumberImpl.prototype.greaterOrEquals = function (otherValue) {
        return this.compare(otherValue) >= 0;
    };
    NativeLargeNumberImpl.prototype.geq = NativeLargeNumberImpl.prototype.greaterOrEquals = SmallNumberImpl.prototype.geq = SmallNumberImpl.prototype.greaterOrEquals = LargeNumberImpl.prototype.geq = LargeNumberImpl.prototype.greaterOrEquals;

    LargeNumberImpl.prototype.lesserOrEquals = function (otherValue) {
        return this.compare(otherValue) <= 0;
    };
    NativeLargeNumberImpl.prototype.leq = NativeLargeNumberImpl.prototype.lesserOrEquals = SmallNumberImpl.prototype.leq = SmallNumberImpl.prototype.lesserOrEquals = LargeNumberImpl.prototype.leq = LargeNumberImpl.prototype.lesserOrEquals;

    // --- Property checks ---
    LargeNumberImpl.prototype.isEven = function () {
        return (this.value[0] & 1) === 0; // Check the least significant digit
    };
    SmallNumberImpl.prototype.isEven = function () {
        return (this.value & 1) === 0;
    };
    NativeLargeNumberImpl.prototype.isEven = function () {
        return (this.value & BigInt(1)) === BigInt(0);
    };

    LargeNumberImpl.prototype.isOdd = function () {
        return (this.value[0] & 1) === 1;
    };
    SmallNumberImpl.prototype.isOdd = function () {
        return (this.value & 1) === 1;
    };
    NativeLargeNumberImpl.prototype.isOdd = function () {
        return (this.value & BigInt(1)) === BigInt(1);
    };

    LargeNumberImpl.prototype.isPositive = function () {
        return !this.sign;
    };
    SmallNumberImpl.prototype.isPositive = function () {
        return this.value > 0;
    };
    NativeLargeNumberImpl.prototype.isPositive = SmallNumberImpl.prototype.isPositive; // Reuse SmallNumberImpl's logic for consistency

    LargeNumberImpl.prototype.isNegative = function () {
        return this.sign;
    };
    SmallNumberImpl.prototype.isNegative = function () {
        return this.value < 0;
    };
    NativeLargeNumberImpl.prototype.isNegative = SmallNumberImpl.prototype.isNegative; // Reuse SmallNumberImpl's logic for consistency

    LargeNumberImpl.prototype.isUnit = function () {
        return false; // A large number (digit array) is generally not a unit (1 or -1) unless it's a specific instance
    };
    SmallNumberImpl.prototype.isUnit = function () {
        return Math.abs(this.value) === 1;
    };
    NativeLargeNumberImpl.prototype.isUnit = function () {
        return this.abs().value === BigInt(1);
    };

    LargeNumberImpl.prototype.isZero = function () {
        // A large number (digit array) is zero if its value array is empty or contains only [0]
        return this.value.length === 0 || (this.value.length === 1 && this.value[0] === 0);
    };
    SmallNumberImpl.prototype.isZero = function () {
        return this.value === 0;
    };
    NativeLargeNumberImpl.prototype.isZero = function () {
        return this.value === BigInt(0);
    };

    LargeNumberImpl.prototype.isDivisibleBy = function (divisor) {
        const otherNum = parseInputToValue(divisor);
        if (otherNum.isZero()) return false; // Cannot divide by zero
        if (otherNum.isUnit()) return true; // Any integer is divisible by 1 or -1
        if (otherNum.compareAbs(LargeNumber[2]) === 0) return this.isEven(); // Check divisibility by 2
        return this.mod(otherNum).isZero(); // General case: remainder is zero
    };
    NativeLargeNumberImpl.prototype.isDivisibleBy = SmallNumberImpl.prototype.isDivisibleBy = LargeNumberImpl.prototype.isDivisibleBy;

    // --- Primality tests (complex, minimal changes to preserve correctness) ---
    function checkBasicPrime(numVal) {
        const absNum = numVal.abs();
        if (absNum.isUnit()) return false; // 1 is not prime
        if (absNum.equals(2) || absNum.equals(3) || absNum.equals(5)) return true;
        if (absNum.isEven() || absNum.isDivisibleBy(3) || absNum.isDivisibleBy(5)) return false;
        if (absNum.lesser(49)) return true; // Numbers less than 49 not divisible by 2,3,5 are prime
        return undefined; // Not determined by basic checks, needs Miller-Rabin
    }

    // Miller-Rabin primality test implementation
    function millerRabinTest(candidateN, testBases) {
        const nMinusOne = candidateN.prev(); // n-1
        let d = nMinusOne;
        let r = 0;
        // Express n-1 as d * 2^r
        while (d.isEven()) {
            d = d.divide(2);
            r++;
        }

        // Test each base 'a'
        nextBase: for (let i = 0; i < testBases.length; i++) {
            const a = LargeNumber(testBases[i]);
            if (candidateN.lesser(a)) continue; // Skip if base is larger than N itself

            let x = a.modPow(d, candidateN); // x = a^d mod n

            if (x.isUnit() || x.equals(nMinusOne)) {
                continue nextBase; // Likely prime for this base
            }

            // Check x^(2^j * d) mod n for j from 1 to r-1
            for (let j = 0; j < r - 1; j++) {
                x = x.square().mod(candidateN);
                if (x.isUnit()) return false; // Composite
                if (x.equals(nMinusOne)) {
                    continue nextBase; // Likely prime for this base
                }
            }
            return false; // Composite
        }
        return true; // Passed all tests, likely prime
    }

    LargeNumberImpl.prototype.isPrime = function (isStrict) {
        const basicCheckResult = checkBasicPrime(this);
        if (basicCheckResult !== undefined) return basicCheckResult;

        const absN = this.abs();
        const numBits = absN.bitLength();

        // Use pre-defined bases for smaller numbers (up to 64 bits)
        if (numBits.lesserOrEquals(64)) {
            return millerRabinTest(absN, [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37]);
        }

        // For larger numbers, determine number of iterations based on desired strictness
        const logN = Math.log(2) * numBits.toJSNumber();
        const numIterations = Math.ceil(isStrict === true ? 2 * Math.pow(logN, 2) : logN);
        const randomBases = [];
        for (let i = 0; i < numIterations; i++) {
            // Generate random bases 'a' in range [2, N-2]
            randomBases.push(LargeNumber.randBetween(2, absN.minus(2)));
        }
        return millerRabinTest(absN, randomBases);
    };
    NativeLargeNumberImpl.prototype.isPrime = SmallNumberImpl.prototype.isPrime = LargeNumberImpl.prototype.isPrime;

    LargeNumberImpl.prototype.isProbablePrime = function (iterations, rngFunction) {
        const basicCheckResult = checkBasicPrime(this);
        if (basicCheckResult !== undefined) return basicCheckResult;

        const absN = this.abs();
        const effectiveIterations = iterations === undefined ? 5 : iterations; // Default to 5 iterations
        const testBases = [];
        for (let i = 0; i < effectiveIterations; i++) {
            // Generate random bases 'a' in range [2, N-2]
            testBases.push(LargeNumber.randBetween(2, absN.minus(2), rngFunction));
        }
        return millerRabinTest(absN, testBases);
    };
    NativeLargeNumberImpl.prototype.isProbablePrime = SmallNumberImpl.prototype.isProbablePrime = LargeNumberImpl.prototype.isProbablePrime;

    LargeNumberImpl.prototype.modInv = function (modulus) {
        let t = LargeNumber.zero,
            newT = LargeNumber.one;
        let r = parseInputToValue(modulus),
            newR = this.abs(); // Use absolute value for extended Euclidean algorithm
        let q, lastT, lastR;

        // Extended Euclidean Algorithm
        while (!newR.isZero()) {
            q = r.divide(newR); // q = floor(r / newR)
            lastT = t;
            lastR = r;

            t = newT;
            r = newR;

            newT = lastT.subtract(q.multiply(newT));
            newR = lastR.subtract(q.multiply(newR));
        }

        // If r (the final gcd) is not 1, then no modular inverse exists
        if (!r.isUnit()) {
            throw new Error(`Numbers ${this.toString()} and ${modulus.toString()} are not coprime. Modular inverse does not exist.`);
        }

        // Adjust t to be positive if it's negative
        if (t.compare(0) === -1) {
            t = t.add(modulus);
        }

        // If the original number was negative, the inverse needs to be negated
        if (this.isNegative()) {
            return t.negate();
        }
        return t;
    };
    NativeLargeNumberImpl.prototype.modInv = SmallNumberImpl.prototype.modInv = LargeNumberImpl.prototype.modInv;

    LargeNumberImpl.prototype.next = function () {
        const currentVal = this.value;
        if (this.sign) {
            // If negative, next is current + 1 (which is subtracting 1 from abs value)
            return subtractSmallFromDigitArray(currentVal, 1, this.sign);
        }
        // If positive, next is current + 1
        return new LargeNumberImpl(addSmallToDigitArray(currentVal, 1), this.sign);
    };
    SmallNumberImpl.prototype.next = function () {
        const currentVal = this.value;
        if (currentVal + 1 < JS_MAX_SAFE_INT) {
            return new SmallNumberImpl(currentVal + 1);
        }
        // If it overflows, convert to LargeNumberImpl
        return new LargeNumberImpl(JS_MAX_SAFE_INT_DIGITS, false);
    };
    NativeLargeNumberImpl.prototype.next = function () {
        return new NativeLargeNumberImpl(this.value + BigInt(1));
    };

    LargeNumberImpl.prototype.prev = function () {
        const currentVal = this.value;
        if (this.sign) {
            // If negative, previous is current - 1 (which is adding 1 to abs value)
            return new LargeNumberImpl(addSmallToDigitArray(currentVal, 1), true);
        }
        // If positive, previous is current - 1
        return subtractSmallFromDigitArray(currentVal, 1, this.sign);
    };
    SmallNumberImpl.prototype.prev = function () {
        const currentVal = this.value;
        if (currentVal - 1 > -JS_MAX_SAFE_INT) {
            return new SmallNumberImpl(currentVal - 1);
        }
        // If it underflows, convert to LargeNumberImpl (negative MAX_INT)
        return new LargeNumberImpl(JS_MAX_SAFE_INT_DIGITS, true);
    };
    NativeLargeNumberImpl.prototype.prev = function () {
        return new NativeLargeNumberImpl(this.value - BigInt(1));
    };

    // Pre-calculated powers of two for bitwise operations
    const powersOfTwo = [1];
    while (2 * powersOfTwo[powersOfTwo.length - 1] <= DIGIT_BASE) {
        powersOfTwo.push(2 * powersOfTwo[powersOfTwo.length - 1]);
    }
    const powers2Length = powersOfTwo.length,
        highestPowerOfTwo = powersOfTwo[powers2Length - 1];

    /**
     * Checks if a shift amount is small enough to be handled directly by JS numbers.
     * @param {number} shiftAmount - The shift amount.
     * @returns {boolean} True if small, false otherwise.
     */
    function isShiftAmountSmall(shiftAmount) {
        return Math.abs(shiftAmount) <= DIGIT_BASE; // Using DIGIT_BASE as a reasonable threshold
    }

    LargeNumberImpl.prototype.shiftLeft = function (shiftAmountValue) {
        const shiftAmount = parseInputToValue(shiftAmountValue).toJSNumber();
        if (!isShiftAmountSmall(shiftAmount)) {
            throw new Error(`Shift amount ${shiftAmount} is too large for shifting.`);
        }
        if (shiftAmount < 0) return this.shiftRight(-shiftAmount); // Delegate negative shift to shiftRight

        let currentResult = this;
        if (currentResult.isZero()) return currentResult;

        // Repeatedly multiply by highestPowerOfTwo until shiftAmount is smaller than powers2Length
        while (shiftAmount >= powers2Length) {
            currentResult = currentResult.multiply(highestPowerOfTwo);
            shiftAmount -= (powers2Length - 1); // Adjust shift amount
        }
        return currentResult.multiply(powersOfTwo[shiftAmount]);
    };
    NativeLargeNumberImpl.prototype.shiftLeft = SmallNumberImpl.prototype.shiftLeft = LargeNumberImpl.prototype.shiftLeft;

    LargeNumberImpl.prototype.shiftRight = function (shiftAmountValue) {
        let quotientAndRemainder;
        const shiftAmount = parseInputToValue(shiftAmountValue).toJSNumber();
        if (!isShiftAmountSmall(shiftAmount)) {
            throw new Error(`Shift amount ${shiftAmount} is too large for shifting.`);
        }
        if (shiftAmount < 0) return this.shiftLeft(-shiftAmount); // Delegate negative shift to shiftLeft

        let currentResult = this;

        // Repeatedly divide by highestPowerOfTwo until shiftAmount is smaller than powers2Length
        while (shiftAmount >= powers2Length) {
            if (currentResult.isZero() || (currentResult.isNegative() && currentResult.isUnit())) {
                return currentResult; // Optimization for -1 shifted right (remains -1)
            }
            quotientAndRemainder = performDivisionWithRemainder(currentResult, highestPowerOfTwo);
            currentResult = quotientAndRemainder[1].isNegative() ? quotientAndRemainder[0].prev() : quotientAndRemainder[0];
            shiftAmount -= (powers2Length - 1); // Adjust shift amount
        }
        quotientAndRemainder = performDivisionWithRemainder(currentResult, powersOfTwo[shiftAmount]);
        return quotientAndRemainder[1].isNegative() ? quotientAndRemainder[0].prev() : quotientAndRemainder[0];
    };
    NativeLargeNumberImpl.prototype.shiftRight = SmallNumberImpl.prototype.shiftRight = LargeNumberImpl.prototype.shiftRight;

    /**
     * Generic bitwise operation function. It simulates bitwise operations on large numbers
     * by processing them digit by digit in the chosen base (`highestPowerOfTwo`).
     * Handles two's complement for negative numbers.
     * @param {LargeNumberImpl} x - First operand.
     * @param {any} y - Second operand (will be parsed).
     * @param {function(number, number): number} bitwiseOpFn - The bitwise operation function (e.g., `(a,b) => a & b`).
     * @returns {LargeNumberImpl} The result of the bitwise operation.
     */
    function performBitwiseOperation(x, y, bitwiseOpFn) {
        y = parseInputToValue(y);
        const xIsNegative = x.isNegative(),
            yIsNegative = y.isNegative();

        // For negative numbers, bitwise ops are typically done on two's complement.
        // `not()` essentially converts to two's complement (negate and decrement).
        let xRemaining = xIsNegative ? x.not() : x;
        let yRemaining = yIsNegative ? y.not() : y;

        let xCurrentDigit = 0,
            yCurrentDigit = 0;
        let xDivModResult = null,
            yDivModResult = null;
        const resultDigits = [];

        // Process digits from LSB to MSB
        while (!xRemaining.isZero() || !yRemaining.isZero()) {
            xDivModResult = performDivisionWithRemainder(xRemaining, highestPowerOfTwo);
            xCurrentDigit = xDivModResult[1].toJSNumber();
            if (xIsNegative) {
                xCurrentDigit = highestPowerOfTwo - 1 - xCurrentDigit; // Simulate two's complement for this digit
            }

            yDivModResult = performDivisionWithRemainder(yRemaining, highestPowerOfTwo);
            yCurrentDigit = yDivModResult[1].toJSNumber();
            if (yIsNegative) {
                yCurrentDigit = highestPowerOfTwo - 1 - yCurrentDigit; // Simulate two's complement for this digit
            }

            xRemaining = xDivModResult[0];
            yRemaining = yDivModResult[0];
            resultDigits.push(bitwiseOpFn(xCurrentDigit, yCurrentDigit));
        }

        // Determine the sign of the result based on the most significant bit (simulated)
        let finalSum = (bitwiseOpFn(xIsNegative ? 1 : 0, yIsNegative ? 1 : 0) !== 0) ? LargeNumber[-1] : LargeNumber[0];

        // Reconstruct the result from digits
        for (let i = resultDigits.length - 1; i >= 0; i--) {
            finalSum = finalSum.multiply(highestPowerOfTwo).add(LargeNumber(resultDigits[i]));
        }
        return finalSum;
    }

    LargeNumberImpl.prototype.not = function () {
        return this.negate().prev(); // Bitwise NOT is equivalent to -(N + 1)
    };
    NativeLargeNumberImpl.prototype.not = SmallNumberImpl.prototype.not = LargeNumberImpl.prototype.not;

    LargeNumberImpl.prototype.and = function (otherValue) {
        return performBitwiseOperation(this, otherValue, (a, b) => a & b);
    };
    NativeLargeNumberImpl.prototype.and = SmallNumberImpl.prototype.and = LargeNumberImpl.prototype.and;

    LargeNumberImpl.prototype.or = function (otherValue) {
        return performBitwiseOperation(this, otherValue, (a, b) => a | b);
    };
    NativeLargeNumberImpl.prototype.or = SmallNumberImpl.prototype.or = LargeNumberImpl.prototype.or;

    LargeNumberImpl.prototype.xor = function (otherValue) {
        return performBitwiseOperation(this, otherValue, (a, b) => a ^ b);
    };
    NativeLargeNumberImpl.prototype.xor = SmallNumberImpl.prototype.xor = LargeNumberImpl.prototype.xor;

    // Constants for rough LOB (Least One Bit) calculation
    const LOB_MASK_JS_INT = 1 << 30; // Mask for JS integer LOB
    const LOB_MASK_BIG_INT = (DIGIT_BASE & -DIGIT_BASE) * (DIGIT_BASE & -DIGIT_BASE) | LOB_MASK_JS_INT;

    /**
     * Estimates the Least One Bit (LOB) for a LargeNumber.
     * This is an approximation used in GCD.
     * @param {LargeNumberImpl} num - The number.
     * @returns {number} A rough estimate of the LOB.
     */
    function roughLeastOneBit(num) {
        const val = num.value;
        let x;
        if (typeof val === "number") {
            x = val | LOB_MASK_JS_INT;
        } else if (typeof val === "bigint") {
            x = val | BigInt(LOB_MASK_JS_INT);
        } else { // Digit array
            // Combine first two digits for a wider LOB estimate
            x = val[0] + (val[1] || 0) * DIGIT_BASE | LOB_MASK_BIG_INT; // Handle cases where val[1] might be undefined
        }
        return x & -x; // Returns the lowest set bit
    }

    /**
     * Calculates integer logarithm (base 2) for bitLength.
     * Used internally to determine the number of bits required to represent a number.
     * @param {LargeNumberImpl} value - The number whose logarithm is to be calculated.
     * @param {LargeNumberImpl} base - The base of the logarithm (e.g., 2 for bitLength).
     * @returns {{p: LargeNumberImpl, e: number}} An object with power `p` and exponent `e`.
     */
    function calculateIntegerLogarithm(value, base) {
        if (base.compareTo(value) <= 0) {
            const recursiveResult = calculateIntegerLogarithm(value, base.square());
            const pVal = recursiveResult.p;
            const eVal = recursiveResult.e;
            const testProduct = pVal.multiply(base); // Test p * base
            return testProduct.compareTo(value) <= 0 ? {
                p: testProduct,
                e: eVal * 2 + 1
            } : {
                p: pVal,
                e: eVal * 2
            };
        }
        return {
            p: LargeNumber(1),
            e: 0
        };
    }

    LargeNumberImpl.prototype.bitLength = function () {
        let currentNum = this;
        // For negative numbers, bit length is usually defined for abs(N) or N+1 in two's complement.
        // The original library uses -(N+1) for negative numbers' bitLength.
        if (currentNum.compareTo(LargeNumber(0)) < 0) {
            currentNum = currentNum.negate().subtract(LargeNumber(1));
        }
        if (currentNum.compareTo(LargeNumber(0)) === 0) {
            return LargeNumber(0);
        }
        // Calculate log base 2 to find bit length
        return LargeNumber(calculateIntegerLogarithm(currentNum, LargeNumber(2)).e).add(LargeNumber(1));
    };
    NativeLargeNumberImpl.prototype.bitLength = SmallNumberImpl.prototype.bitLength = LargeNumberImpl.prototype.bitLength;

    // --- Utility functions exposed on the main LargeNumber object ---
    function findMax(a, b) {
        a = parseInputToValue(a);
        b = parseInputToValue(b);
        return a.greater(b) ? a : b;
    }

    function findMin(a, b) {
        a = parseInputToValue(a);
        b = parseInputToValue(b);
        return a.lesser(b) ? a : b;
    }

    function calculateGCD(a, b) {
        a = parseInputToValue(a).abs();
        b = parseInputToValue(b).abs();

        if (a.equals(b)) return a;
        if (a.isZero()) return b;
        if (b.isZero()) return a;

        let commonFactor = LargeNumber[1];
        let tempNum;

        // Remove common factors of 2 (or rough LOB)
        while (a.isEven() && b.isEven()) {
            const lob = findMin(roughLeastOneBit(a), roughLeastOneBit(b)); // Use roughLOB
            a = a.divide(lob);
            b = b.divide(lob);
            commonFactor = commonFactor.multiply(lob);
        }
        while (a.isEven()) {
            a = a.divide(roughLeastOneBit(a));
        }

        // Euclidean algorithm
        do {
            while (b.isEven()) {
                b = b.divide(roughLeastOneBit(b));
            }
            if (a.greater(b)) {
                tempNum = b;
                b = a;
                a = tempNum;
            }
            b = b.subtract(a);
        } while (!b.isZero());

        return commonFactor.isUnit() ? a : a.multiply(commonFactor);
    }

    function calculateLCM(a, b) {
        a = parseInputToValue(a).abs();
        b = parseInputToValue(b).abs();
        // LCM(a, b) = |a * b| / GCD(a, b)
        return a.divide(calculateGCD(a, b)).multiply(b);
    }

    function generateRandomBetween(lowerBound, upperBound, randomFunc) {
        lowerBound = parseInputToValue(lowerBound);
        upperBound = parseInputToValue(upperBound);
        const usedRNG = randomFunc || Math.random;

        const low = findMin(lowerBound, upperBound);
        const high = findMax(lowerBound, upperBound);
        const range = high.subtract(low).add(1); // Inclusive range

        if (range.isSmall) {
            return low.add(Math.floor(usedRNG() * range.toJSNumber()));
        }

        // For large ranges, generate random digits
        const rangeDigits = toRadix(range, DIGIT_BASE).value;
        const resultDigits = [];
        let isRestricted = true; // True if we are restricted by the digits of 'range'

        for (let i = 0; i < rangeDigits.length; i++) {
            const currentTop = isRestricted ? rangeDigits[i] : DIGIT_BASE;
            const digit = truncateToInteger(usedRNG() * currentTop);
            resultDigits.push(digit);
            if (digit < currentTop) isRestricted = false; // Once a digit is smaller, subsequent digits can be anything up to DIGIT_BASE-1
        }
        return low.add(LargeNumber.fromDigitArray(resultDigits, DIGIT_BASE, false));
    }

    /**
     * Parses a string value based on a given radix and alphabet.
     * @param {string} textInput - The string to parse.
     * @param {number} radixBase - The base (e.g., 10, 16).
     * @param {string} [alphabet] - Custom alphabet string.
     * @param {boolean} [caseSensitive] - Whether parsing is case-sensitive.
     * @returns {LargeNumberImpl | SmallNumberImpl | NativeLargeNumberImpl} The parsed number.
     */
    const parseValueWithRadix = function (textInput, radixBase, alphabet, caseSensitive) {
        alphabet = alphabet || DEFAULT_RADIX_ALPHABET;
        textInput = String(textInput);

        if (!caseSensitive) {
            textInput = textInput.toLowerCase();
            alphabet = alphabet.toLowerCase();
        }

        const inputLength = textInput.length;
        const alphabetMap = {}; // Map characters to their numeric values
        for (let i = 0; i < alphabet.length; i++) {
            alphabetMap[alphabet[i]] = i;
        }

        const absRadix = Math.abs(radixBase);
        // Validate input characters against the alphabet and radix
        for (let i = 0; i < inputLength; i++) {
            const char = textInput[i];
            if (char === "-") continue; // Allow negative sign
            if (char in alphabetMap) {
                if (alphabetMap[char] >= absRadix) {
                    if (char === "1" && absRadix === 1) continue; // Special case for base 1
                    throw new Error(`Character '${char}' is not a valid digit in base ${radixBase}.`);
                }
            } else if (char !== '<') { // Allow custom digit representation <N>
                throw new Error(`Character '${char}' is not a valid character in the provided alphabet.`);
            }
        }

        const digitValues = [];
        const isNegative = textInput[0] === "-";
        radixBase = parseInputToValue(radixBase); // Ensure radix is a LargeNumber

        for (let i = isNegative ? 1 : 0; i < textInput.length; i++) {
            const char = textInput[i];
            if (char in alphabetMap) {
                digitValues.push(parseInputToValue(alphabetMap[char]));
            } else if (char === "<") {
                let start = i;
                do {
                    i++;
                } while (textInput[i] !== ">" && i < textInput.length);
                digitValues.push(parseInputToValue(textInput.slice(start + 1, i)));
            } else {
                // This case should ideally be caught by the earlier validation loop, but kept for safety.
                throw new Error(`Unexpected character '${char}' during digit parsing.`);
            }
        }
        return parseDigitArrayWithRadix(digitValues, radixBase, isNegative);
    };

    /**
     * Converts an array of digits (each a LargeNumber) from a given radix to a LargeNumber.
     * @param {LargeNumber[]} digitArray - Array of digits, where each element is a LargeNumber.
     * @param {LargeNumber} base - The radix base, as a LargeNumber.
     * @param {boolean} isNegative - Whether the final number should be negative.
     * @returns {LargeNumberImpl | SmallNumberImpl | NativeLargeNumberImpl} The resulting number.
     */
    function parseDigitArrayWithRadix(digitArray, base, isNegative) {
        let resultNum = LargeNumber[0];
        let currentPower = LargeNumber[1];
        // Horner's method (or direct polynomial evaluation): sum(digit_i * base^i)
        for (let i = digitArray.length - 1; i >= 0; i--) {
            resultNum = resultNum.add(digitArray[i].times(currentPower));
            currentPower = currentPower.times(base);
        }
        return isNegative ? resultNum.negate() : resultNum;
    }

    /**
     * Converts a single digit value to its string representation using an alphabet.
     * @param {number} digitValue - The numeric digit.
     * @param {string} alphabet - The alphabet string.
     * @returns {string} The string representation of the digit.
     */
    function convertDigitToString(digitValue, alphabet) {
        alphabet = alphabet || DEFAULT_RADIX_ALPHABET;
        if (digitValue < alphabet.length) {
            return alphabet[digitValue];
        }
        return "<" + digitValue + ">"; // For digits larger than alphabet size, use <N> format
    }

    /**
     * Converts a LargeNumber to an array of digits in a specified radix.
     * @param {LargeNumberImpl | SmallNumberImpl | NativeLargeNumberImpl} num - The number to convert.
     * @param {LargeNumber} radix - The target radix.
     * @returns {{value: number[], isNegative: boolean}} Object with digit array and sign.
     */
    function toRadix(num, radix) {
        radix = LargeNumber(radix);

        if (radix.isZero()) {
            if (num.isZero()) return {
                value: [0],
                isNegative: false
            };
            throw new Error("Cannot convert non-zero numbers to base 0.");
        }
        if (radix.equals(-1)) {
            // Special handling for base -1 (negabase)
            if (num.isZero()) return {
                value: [0],
                isNegative: false
            };
            if (num.isNegative()) {
                // For negative numbers in base -1, the representation can be complex.
                // Keeping original logic as it's a direct copy.
                return {
                    value: [].concat.apply([], Array.apply(null, Array(-num.toJSNumber())).map(Array.prototype.valueOf, [1, 0])),
                    isNegative: false
                };
            }
            const arr = Array.apply(null, Array(num.toJSNumber() - 1)).map(Array.prototype.valueOf, [0, 1]);
            arr.unshift([1]);
            return {
                value: [].concat.apply([], arr),
                isNegative: false
            };
        }

        let isNegativeResult = false;
        if (num.isNegative() && radix.isPositive()) {
            isNegativeResult = true;
            num = num.abs();
        }

        if (radix.isUnit()) {
            if (num.isZero()) return {
                value: [0],
                isNegative: false
            };
            // For base 1 or -1, the representation is a series of 1s (or other base digit).
            return {
                value: Array.apply(null, Array(num.toJSNumber())).map(Number.prototype.valueOf, 1),
                isNegative: isNegativeResult
            };
        }

        const outputDigits = [];
        let currentLeftover = num;
        let divisionResult;

        // Repeatedly divide by radix and collect remainders
        while (currentLeftover.isNegative() || currentLeftover.compareAbs(radix) >= 0) {
            divisionResult = currentLeftover.divmod(radix);
            currentLeftover = divisionResult.quotient;
            let digit = divisionResult.remainder;

            // Adjust for negative remainders in non-standard bases
            if (digit.isNegative()) {
                digit = radix.minus(digit).abs(); // digit = abs(base - abs(remainder))
                currentLeftover = currentLeftover.next(); // Increment quotient
            }
            outputDigits.push(digit.toJSNumber());
        }
        outputDigits.push(currentLeftover.toJSNumber()); // Add the last quotient

        return {
            value: outputDigits.reverse(),
            isNegative: isNegativeResult
        };
    }

    /**
     * Converts a LargeNumber to a string in a specified radix and alphabet.
     * @param {LargeNumberImpl | SmallNumberImpl | NativeLargeNumberImpl} num - The number.
     * @param {number} radix - The target radix.
     * @param {string} [alphabet] - Custom alphabet string.
     * @returns {string} The string representation.
     */
    function toRadixString(num, radix, alphabet) {
        const digitArrayInfo = toRadix(num, radix);
        const digitStrings = digitArrayInfo.value.map(digit => convertDigitToString(digit, alphabet));
        return (digitArrayInfo.isNegative ? "-" : "") + digitStrings.join("");
    }

    LargeNumberImpl.prototype.toArray = function (radix) {
        return toRadix(this, radix);
    };
    SmallNumberImpl.prototype.toArray = function (radix) {
        return toRadix(this, radix);
    };
    NativeLargeNumberImpl.prototype.toArray = function (radix) {
        return toRadix(this, radix);
    };

    LargeNumberImpl.prototype.toString = function (radix, alphabet) {
        if (radix === undefined) radix = 10;
        if (radix !== 10) return toRadixString(this, radix, alphabet);

        const digitArray = this.value;
        let len = digitArray.length;
        // Start with the most significant digit
        let stringRepresentation = String(digitArray[--len]);
        const zeroPadding = "0000000"; // For padding digits to DIGIT_BASE width

        // Concatenate remaining digits, padding with zeros as needed
        while (--len >= 0) {
            const digit = String(digitArray[len]);
            stringRepresentation += zeroPadding.slice(digit.length) + digit;
        }
        const signPrefix = this.sign ? "-" : "";
        return signPrefix + stringRepresentation;
    };

    SmallNumberImpl.prototype.toString = function (radix, alphabet) {
        if (radix === undefined) radix = 10;
        if (radix !== 10) return toRadixString(this, radix, alphabet);
        return String(this.value);
    };
    NativeLargeNumberImpl.prototype.toString = SmallNumberImpl.prototype.toString;

    // JSON serialization
    NativeLargeNumberImpl.prototype.toJSON = LargeNumberImpl.prototype.toJSON = SmallNumberImpl.prototype.toJSON = function () {
        return this.toString();
    };

    // ValueOf / toJSNumber for interoperability (warning: can lose precision)
    LargeNumberImpl.prototype.valueOf = function () {
        return parseInt(this.toString(), 10);
    };
    LargeNumberImpl.prototype.toJSNumber = LargeNumberImpl.prototype.valueOf;

    SmallNumberImpl.prototype.valueOf = function () {
        return this.value;
    };
    SmallNumberImpl.prototype.toJSNumber = SmallNumberImpl.prototype.valueOf;

    NativeLargeNumberImpl.prototype.valueOf = NativeLargeNumberImpl.prototype.toJSNumber = function () {
        return parseInt(this.toString(), 10);
    };

    /**
     * Parses a string value into a LargeNumber.
     * Handles scientific notation and checks for valid integer format.
     * @param {string} strValue - The string to parse.
     * @returns {LargeNumberImpl | SmallNumberImpl | NativeLargeNumberImpl} The parsed number.
     */
    function parseStringValue(strValue) {
        // Attempt to parse as a standard JS number first
        if (isJsPrecise(+strValue)) {
            const num = +strValue;
            if (num === truncateToInteger(num)) {
                return hasNativeBigIntSupport ? new NativeLargeNumberImpl(BigInt(num)) : new SmallNumberImpl(num);
            }
            // If it's a float but within safe integer range, it's an error for integer parsing
            throw new Error(`Invalid integer: '${strValue}' is not a whole number.`);
        }

        let isNegative = false;
        if (strValue[0] === "-") {
            isNegative = true;
            strValue = strValue.slice(1); // Remove sign for parsing digits
        }

        // Handle scientific notation (e.g., "1.23e+5")
        const scientificSplit = strValue.split(/e/i);
        if (scientificSplit.length > 2) {
            throw new Error(`Invalid integer: Multiple 'e' characters in '${strValue}'.`);
        }
        if (scientificSplit.length === 2) {
            let exponentPart = scientificSplit[1];
            if (exponentPart[0] === "+") exponentPart = exponentPart.slice(1);
            const expNum = +exponentPart;

            if (expNum !== truncateToInteger(expNum) || !isJsPrecise(expNum)) {
                throw new Error(`Invalid integer: exponent '${expNum}' is not a valid integer.`);
            }
            if (expNum < 0) {
                throw new Error("Cannot parse negative exponent part for integers");
            }

            let mainPart = scientificSplit[0];
            const decimalPointIndex = mainPart.indexOf(".");
            if (decimalPointIndex >= 0) {
                // Adjust exponent for decimal places
                expNum -= (mainPart.length - decimalPointIndex - 1);
                mainPart = mainPart.slice(0, decimalPointIndex) + mainPart.slice(decimalPointIndex + 1);
            }
            // Append zeros based on adjusted exponent
            mainPart += "0".repeat(expNum);
            strValue = mainPart;
        }

        // Validate that the string contains only digits
        const integerRegex = /^([0-9][0-9]*)$/;
        if (!integerRegex.test(strValue)) {
            throw new Error(`Invalid integer format: '${strValue}'.`);
        }

        // Use native BigInt if available
        if (hasNativeBigIntSupport) {
            return new NativeLargeNumberImpl(BigInt(isNegative ? "-" + strValue : strValue));
        }

        // Fallback to digit array representation
        const digitArray = [];
        let maxLen = strValue.length,
            currentChunkSize = LOG_DIGIT_BASE; // Process in chunks of LOG_DIGIT_BASE digits
        let minSlice = maxLen - currentChunkSize;

        while (maxLen > 0) {
            digitArray.push(+strValue.slice(minSlice, maxLen));
            minSlice -= currentChunkSize;
            if (minSlice < 0) minSlice = 0; // Ensure minSlice doesn't go below 0
            maxLen -= currentChunkSize;
        }
        trimLeadingZeros(digitArray); // Remove any leading zeros from the digit array
        return new LargeNumberImpl(digitArray, isNegative);
    }

    /**
     * Parses a number value into a LargeNumber.
     * @param {number} numValue - The number to parse.
     * @returns {LargeNumberImpl | SmallNumberImpl | NativeLargeNumberImpl} The parsed number.
     */
    function parseNumberValue(numValue) {
        if (hasNativeBigIntSupport) {
            return new NativeLargeNumberImpl(BigInt(numValue));
        }
        if (isJsPrecise(numValue)) {
            if (numValue !== truncateToInteger(numValue)) {
                throw new Error(`'${numValue}' is not an integer.`);
            }
            return new SmallNumberImpl(numValue);
        }
        // If it's a large JS number (e.g., from `Number.MAX_VALUE`), convert to string then parse
        return parseStringValue(numValue.toString());
    }

    /**
     * Main parsing function that dispatches based on input type.
     * @param {any} valueToParse - The value to convert.
     * @returns {LargeNumberImpl | SmallNumberImpl | NativeLargeNumberImpl} The parsed number.
     */
    function parseInputToValue(valueToParse) {
        if (typeof valueToParse === "number") {
            return parseNumberValue(valueToParse);
        }
        if (typeof valueToParse === "string") {
            return parseStringValue(valueToParse);
        }
        if (typeof valueToParse === "bigint") {
            return new NativeLargeNumberImpl(valueToParse);
        }
        // If it's already a LargeNumber instance, return it directly
        if (valueToParse instanceof LargeNumberImpl ||
            valueToParse instanceof SmallNumberImpl ||
            valueToParse instanceof NativeLargeNumberImpl) {
            return valueToParse;
        }
        // If it's none of the above, it's an unsupported type
        throw new Error(`Unsupported type for LargeNumber conversion: ${typeof valueToParse}.`);
    }

    // Pre-populate small integer instances for performance (0-999 and their negatives)
    for (let i = 0; i < 1e3; i++) {
        LargeNumber[i] = parseInputToValue(i);
        if (i > 0) LargeNumber[-i] = parseInputToValue(-i);
    }

    // Expose common constants and utilities on the main LargeNumber object
    LargeNumber.one = LargeNumber[1];
    LargeNumber.zero = LargeNumber[0];
    LargeNumber.minusOne = LargeNumber[-1];
    LargeNumber.max = findMax;
    LargeNumber.min = findMin;
    LargeNumber.gcd = calculateGCD;
    LargeNumber.lcm = calculateLCM;
    LargeNumber.isInstance = function (obj) {
        return obj instanceof LargeNumberImpl || obj instanceof SmallNumberImpl || obj instanceof NativeLargeNumberImpl;
    };
    LargeNumber.randBetween = generateRandomBetween;
    LargeNumber.fromDigitArray = function (digits, base, isNegative) {
        // Ensure all digits are LargeNumber instances before parsing
        const parsedDigits = digits.map(parseInputToValue);
        return parseDigitArrayWithRadix(parsedDigits, parseInputToValue(base || 10), isNegative);
    };

    return LargeNumber;
})();

// Provide compatibility for CommonJS and AMD environments
if (typeof module !== "undefined" && module.hasOwnProperty("exports")) {
    module.exports = largeInteger;
}
if (typeof define === "function" && define.amd) {
    define(function () {
        return largeInteger;
    });
}
// ----------------------------------------------------------------------------------------------------
// End of the modified LargeInteger library section
// ----------------------------------------------------------------------------------------------------


// Entry point for the application logic
// The main function is called and its return value is printed to the console.
console.log(executeMainLogic());

/**
 * Main application logic. Reads input, processes data, and returns formatted output.
 * This function calculates a sliding window product and compares it with the previous window's product.
 * @returns {string} A newline-separated string of 'Yes' or 'No' based on product comparisons.
 */
function executeMainLogic() {
    // Read N (total elements) and K (window size) from the first line of input (index 0)
    const paramsArray = inputDataHandler.getLineAsNumbers(0);
    const totalElements = paramsArray[0];
    const windowSize = paramsArray[1];

    // --- Input Validation ---
    if (totalElements === undefined || windowSize === undefined || !Number.isInteger(totalElements) || !Number.isInteger(windowSize)) {
        return "Invalid input format: N and K must be integers.";
    }
    if (totalElements <= 0 || windowSize <= 0) {
        return "Invalid input: N and K must be positive integers.";
    }
    if (windowSize > totalElements) {
        return "Invalid input: Window size (K) cannot be greater than total elements (N).";
    }

    // Read the sequence of numbers (An) from the second line of input (index 1)
    const dataSequence = inputDataHandler.getLineAsNumbers(1);

    // Ensure the data sequence has enough elements as specified by N
    if (dataSequence.length < totalElements) {
        return `Input error: Data sequence has fewer elements (${dataSequence.length}) than specified N (${totalElements}).`;
    }

    // Array to store the products of each sliding window
    const windowProducts = [];
    // Array to store the comparison outcomes ('Yes'/'No')
    const comparisonOutcomes = [];

    /**
     * Helper function to calculate the product of a sub-array of numbers.
     * It handles potential zeros efficiently.
     * @param {Array<number|string>} arr - The array of numbers (or strings that represent numbers).
     * @returns {largeInteger} The product of the elements.
     */
    const calculateProduct = (arr) => {
        // Ensure all elements are converted to largeInteger before multiplication
        return arr.reduce((accumulator, currentElement) => {
            const num = largeInteger(currentElement);
            if (num.isZero()) return largeInteger(0); // Optimization: if any element is 0, product is 0
            return accumulator.multiply(num);
        }, largeInteger(1)); // Start with 1 for product accumulation
    };

    // Calculate the product for the initial window (from index 0 up to windowSize-1)
    const initialWindowElements = dataSequence.slice(0, windowSize);
    windowProducts.push(calculateProduct(initialWindowElements));

    // Iterate through the remaining elements to form subsequent windows
    // The loop starts from the element immediately after the first window
    for (let currentIndex = windowSize; currentIndex < totalElements; currentIndex++) {
        const previousProduct = windowProducts[currentIndex - windowSize]; // Product of the window ending at currentIndex - 1

        const elementLeavingWindow = largeInteger(dataSequence[currentIndex - windowSize]); // The element that is sliding out
        const elementEnteringWindow = largeInteger(dataSequence[currentIndex]); // The new element that is sliding in

        let currentWindowProduct;

        // Special handling for division by zero: if the element leaving the window is zero
        if (elementLeavingWindow.isZero()) {
            // If the element leaving was zero, the previous product must have been zero.
            // A new product must be calculated from scratch for the current window.
            // The current window starts one element after the old window's start.
            const currentWindowElements = dataSequence.slice(currentIndex - windowSize + 1, currentIndex + 1);
            currentWindowProduct = calculateProduct(currentWindowElements);
        } else {
            // Calculate the new window product using the sliding window formula:
            // new_product = (old_product / element_removed) * element_added
            currentWindowProduct = previousProduct.divide(elementLeavingWindow).multiply(elementEnteringWindow);
        }

        windowProducts.push(currentWindowProduct); // Store the new product

        // Compare the current window's product with the previous one
        const currentProductIndex = windowProducts.length - 1;
        const previousProductIndex = currentProductIndex - 1;

        // Add a check to ensure previousProductIndex is valid, though it should always be >= 0 after the first window
        if (previousProductIndex >= 0) {
            const comparisonResult = windowProducts[currentProductIndex].greater(windowProducts[previousProductIndex]) ? 'Yes' : 'No';
            comparisonOutcomes.push(comparisonResult);
        } else {
            // This path should ideally not be reached if the loop conditions are correct and initial window is handled.
            // It serves as a safeguard for unexpected scenarios.
            comparisonOutcomes.push('N/A - No previous window for comparison');
        }
    }

    // Join all comparison outcomes with newlines to form the final output string
    return comparisonOutcomes.join('\n');
}