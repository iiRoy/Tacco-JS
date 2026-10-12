"use strict";

// Custom Input Stream Handler
// This class facilitates reading tokens and lines from a multi-line string input.
// It keeps track of the current position (line and column) within the input.
function DataStreamProcessor(sourceText, tokenParser) {
    // Split the entire input text into an array of individual lines.
    this.lineArray = sourceText.split("\n");
    // Initialize the current column index to 0.
    this.currentElementIndex = 0;
    // Initialize the current line index to 0.
    this.currentLineIndex = 0;
    // Store the function used to parse individual tokens (e.g., Number, String).
    // If no parser is provided, default to Number for numerical input.
    this.parseFn = tokenParser || Number;
}

// Prototype method to retrieve the next available token from the input stream.
DataStreamProcessor.prototype.readNextElement = function() {
    // Get the current line based on the current line index.
    const activeLine = this.lineArray[this.currentLineIndex];

    // If the current line is undefined (end of input), return undefined.
    if (!activeLine) {
        return undefined;
    }

    // Trim whitespace from the line and split it into tokens by space.
    const lineTokens = activeLine.trim().split(" ");
    // Get the token at the current element index.
    const nextToken = lineTokens[this.currentElementIndex];

    // Advance the element index to the next token.
    this.currentElementIndex++;

    // If all tokens on the current line have been consumed, reset element index
    // and move to the next line.
    if (lineTokens.length === this.currentElementIndex) {
        this.currentElementIndex = 0;
        this.currentLineIndex++;
    }

    // Parse and return the token using the stored parser function.
    return this.parseFn(nextToken);
};

// Prototype method to retrieve all tokens from the current line and advance to the next line.
DataStreamProcessor.prototype.readAllElementsOnLine = function() {
    // Get the current line.
    const activeLine = this.lineArray[this.currentLineIndex];

    // If the current line is undefined, return undefined.
    if (!activeLine) {
        return undefined;
    }

    // Reset the element index as we're consuming the whole line.
    this.currentElementIndex = 0;
    // Advance to the next line.
    this.currentLineIndex++;

    // Split the line into tokens, parse each using the stored function, and return the array.
    return activeLine.split(" ").map(this.parseFn);
};

// Start of the custom arbitrary-precision integer library.
const largeNumber = (function(emptyValue) {
    "use strict";

    // Configuration constants for the internal representation of large numbers.
    // Numbers are stored as arrays of 'digits' in a base of 10^7.
    const DIGIT_BASE = 1e7;
    const DIGIT_LOG_BASE = 7; // log10(DIGIT_BASE)

    // JavaScript's maximum safe integer (2^53 - 1).
    const JS_MAX_SAFE_INT = 9007199254740992;
    // Array representation of JS_MAX_SAFE_INT for comparison.
    const JS_MAX_SAFE_INT_DIGITS = convertSmallToDigitArray(JS_MAX_SAFE_INT);
    // Logarithm of JS_MAX_SAFE_INT, used for base conversion checks.
    const JS_MAX_SAFE_INT_LOG = Math.log(JS_MAX_SAFE_INT);

    // Constructor for the main NumericEntity object.
    // This acts as a factory, returning either a SmallNumericEntity or a LargeNumericEntity.
    function NumericEntity(inputValue, baseRadix) {
        // If no value is provided, return the cached zero instance.
        if (typeof inputValue === "undefined") {
            return NumericEntity.ZERO;
        }
        // If a radix is specified, parse the value according to that radix.
        if (typeof baseRadix !== "undefined") {
            // Optimization: if radix is 10, use standard parsing.
            return +baseRadix === 10 ? parseInputToNumericEntity(inputValue) : parseValueWithBase(inputValue, baseRadix);
        }
        // Otherwise, parse the value assuming base 10.
        return parseInputToNumericEntity(inputValue);
    }

    // Represents a large integer using an array of 'digits'.
    function LargeNumericEntity(digitArray, isNegativeFlag) {
        this.magnitude = digitArray; // Array of numbers representing the integer's magnitude.
        this.isNegative = isNegativeFlag; // Boolean indicating if the number is negative.
        this.isRepresentedAsSmall = false; // Flag to distinguish from SmallNumericEntity.
    }
    // LargeNumericEntity inherits from NumericEntity.
    LargeNumericEntity.prototype = Object.create(NumericEntity.prototype);

    // Represents a small integer that can be stored directly as a JavaScript number.
    function SmallNumericEntity(numericValue) {
        this.magnitude = numericValue; // The number itself.
        this.isNegative = numericValue < 0; // Boolean indicating negativity.
        this.isRepresentedAsSmall = true; // Flag to distinguish from LargeNumericEntity.
    }
    // SmallNumericEntity inherits from NumericEntity.
    SmallNumericEntity.prototype = Object.create(NumericEntity.prototype);

    /**
     * Checks if a given number can be precisely represented by JavaScript's number type.
     * @param {number} num - The number to check.
     * @returns {boolean} True if precise, false otherwise.
     */
    function isJsPrecise(num) {
        return -JS_MAX_SAFE_INT < num && num < JS_MAX_SAFE_INT;
    }

    /**
     * Converts a small JavaScript number into an array of digits (base DIGIT_BASE).
     * @param {number} num - The small number.
     * @returns {number[]} Array of digits.
     */
    function convertSmallToDigitArray(num) {
        // Handle negative numbers by taking absolute value for digit representation.
        const positiveNum = Math.abs(num);
        if (positiveNum < 1e7) return [positiveNum];
        if (positiveNum < 1e14) return [positiveNum % 1e7, Math.floor(positiveNum / 1e7)];
        return [positiveNum % 1e7, Math.floor(positiveNum / 1e7) % 1e7, Math.floor(positiveNum / 1e14)];
    }

    /**
     * Converts an array of digits (base DIGIT_BASE) back into a small JavaScript number if possible.
     * @param {number[]} digitArr - Array of digits.
     * @returns {number | number[]} The number if small, or the array if it's still large.
     */
    function convertDigitArrayToSmall(digitArr) {
        removeLeadingZeros(digitArr); // Clean up the array first.
        const len = digitArr.length;
        // Check if the number of digits is small enough and its absolute value fits JS_MAX_SAFE_INT.
        if (len < 4 && compareAbsoluteMagnitudes(digitArr, JS_MAX_SAFE_INT_DIGITS) < 0) {
            switch (len) {
                case 0: return 0;
                case 1: return digitArr[0];
                case 2: return digitArr[0] + digitArr[1] * DIGIT_BASE;
                default: return digitArr[0] + (digitArr[1] + digitArr[2] * DIGIT_BASE) * DIGIT_BASE;
            }
        }
        return digitArr; // Return the array if it's still large.
    }

    /**
     * Removes leading zero 'digits' from a digit array representation.
     * @param {number[]} digitArr - The array of digits to trim.
     */
    function removeLeadingZeros(digitArr) {
        let i = digitArr.length;
        while (i > 0 && digitArr[--i] === 0); // Find the last non-zero digit.
        digitArr.length = i + 1; // Truncate the array.
    }

    /**
     * Creates a new array of a specified length, initialized with zeros.
     * @param {number} len - The desired length of the array.
     * @returns {number[]} An array filled with zeros.
     */
    function initializeZeroArray(len) {
        return new Array(len).fill(0);
    }

    /**
     * Truncates a number (removes its fractional part).
     * @param {number} n - The number to truncate.
     * @returns {number} The truncated integer.
     */
    function getIntegerPart(n) {
        return n > 0 ? Math.floor(n) : Math.ceil(n);
    }

    /**
     * Adds two digit arrays (representing positive numbers).
     * @param {number[]} arr1 - First digit array.
     * @param {number[]} arr2 - Second digit array.
     * @returns {number[]} The sum as a new digit array.
     */
    function performArrayAddition(arr1, arr2) {
        const len1 = arr1.length;
        const len2 = arr2.length;
        const result = new Array(len1);
        let currentCarry = 0;
        let tempSum;
        let i;

        // Add corresponding digits from both arrays.
        for (i = 0; i < len2; i++) {
            tempSum = arr1[i] + arr2[i] + currentCarry;
            currentCarry = (tempSum >= DIGIT_BASE) ? 1 : 0;
            result[i] = tempSum - currentCarry * DIGIT_BASE;
        }

        // Add any remaining digits from the longer array with the carry.
        while (i < len1) {
            tempSum = arr1[i] + currentCarry;
            currentCarry = (tempSum === DIGIT_BASE) ? 1 : 0;
            result[i++] = tempSum - currentCarry * DIGIT_BASE;
        }

        // If there's a final carry, append it.
        if (currentCarry > 0) {
            result.push(currentCarry);
        }
        return result;
    }

    /**
     * Adds two digit arrays, handling cases where one might be longer.
     * Ensures the longer array is the first argument to performArrayAddition.
     * @param {number[]} arrX - First digit array.
     * @param {number[]} arrY - Second digit array.
     * @returns {number[]} The sum as a new digit array.
     */
    function addAnyDigitArrays(arrX, arrY) {
        return arrX.length >= arrY.length ? performArrayAddition(arrX, arrY) : performArrayAddition(arrY, arrX);
    }

    /**
     * Adds a small number (as a carry) to a digit array.
     * This is specifically for `addSmall` where `b` is small.
     * @param {number[]} digitArr - The digit array.
     * @param {number} smallCarry - The small number (carry) to add.
     * @returns {number[]} The result as a new digit array.
     */
    function addSmallToDigitArray(digitArr, smallCarry) {
        const len = digitArr.length;
        const result = new Array(len);
        let currentCarry = smallCarry;
        let tempSum;
        let i;

        for (i = 0; i < len; i++) {
            // Note: Original code had `a[i] - DIGIT_BASE + carry`. This is equivalent to `a[i] + carry`
            // and then normalizing the carry. Let's make it explicit.
            tempSum = digitArr[i] + currentCarry;
            currentCarry = Math.floor(tempSum / DIGIT_BASE);
            result[i] = tempSum % DIGIT_BASE; // Remainder is the digit.
        }

        // Propagate any remaining carry.
        while (currentCarry > 0) {
            result[i++] = currentCarry % DIGIT_BASE;
            currentCarry = Math.floor(currentCarry / DIGIT_BASE);
        }
        return result;
    }

    // LargeNumericEntity addition method.
    LargeNumericEntity.prototype.add = function(otherValue) {
        const otherNum = parseInputToNumericEntity(otherValue);

        // If signs are different, convert to subtraction (this - (-other) or -this + other).
        if (this.isNegative !== otherNum.isNegative) {
            return this.subtract(otherNum.getNegated());
        }

        const currentMagnitude = this.magnitude;
        const otherMagnitude = otherNum.magnitude;

        // Optimization: if the other number is small, use specialized addition.
        if (otherNum.isRepresentedAsSmall) {
            // Convert the small number's magnitude to a digit array for `addSmallToDigitArray`.
            // Note: `addSmallToDigitArray` expects a carry, so we pass `Math.abs(otherNum.magnitude)`.
            // The result will have the same sign as `this`.
            return new LargeNumericEntity(addSmallToDigitArray(currentMagnitude, Math.abs(otherNum.magnitude)), this.isNegative);
        }

        // Both are large and have the same sign, perform standard array addition.
        return new LargeNumericEntity(addAnyDigitArrays(currentMagnitude, otherMagnitude), this.isNegative);
    };
    // Alias for add.
    LargeNumericEntity.prototype.plus = LargeNumericEntity.prototype.add;

    // SmallNumericEntity addition method.
    SmallNumericEntity.prototype.add = function(otherValue) {
        const otherNum = parseInputToNumericEntity(otherValue);
        const thisValue = this.magnitude;

        // If signs are different, convert to subtraction.
        if (thisValue < 0 !== otherNum.isNegative) {
            return this.subtract(otherNum.getNegated());
        }

        const otherValueMagnitude = otherNum.magnitude;

        // If both are small, try direct JS number addition.
        if (otherNum.isRepresentedAsSmall) {
            const sum = thisValue + otherValueMagnitude;
            if (isJsPrecise(sum)) {
                return new SmallNumericEntity(sum);
            }
            // If sum overflows JS safe integer, convert to LargeNumericEntity.
            // `addSmallToDigitArray` expects the first argument to be the array, and the second the small value.
            // The sign is determined by `thisValue < 0`.
            return new LargeNumericEntity(addSmallToDigitArray(convertSmallToDigitArray(Math.abs(thisValue)), Math.abs(otherValueMagnitude)), thisValue < 0);
        }
        // If `this` is small but `otherNum` is large, convert `this` to a digit array for `addSmallToDigitArray`.
        // `addSmallToDigitArray` takes an array and a small number. Here `otherValueMagnitude` is the array.
        // The small value is `Math.abs(thisValue)`. The sign is `thisValue < 0`.
        return new LargeNumericEntity(addSmallToDigitArray(otherValueMagnitude, Math.abs(thisValue)), thisValue < 0);
    };
    // Alias for add.
    SmallNumericEntity.prototype.plus = SmallNumericEntity.prototype.add;

    /**
     * Subtracts digit array `b` from digit array `a` (assuming a >= b and both are positive).
     * @param {number[]} a - The minuend digit array.
     * @param {number[]} b - The subtrahend digit array.
     * @returns {number[]} The difference as a new digit array.
     */
    function performArraySubtraction(a, b) {
        const lenA = a.length;
        const lenB = b.length;
        const result = new Array(lenA);
        let currentBorrow = 0;
        let difference;
        let i;

        // Subtract corresponding digits.
        for (i = 0; i < lenB; i++) {
            difference = a[i] - currentBorrow - b[i];
            if (difference < 0) {
                difference += DIGIT_BASE;
                currentBorrow = 1;
            } else {
                currentBorrow = 0;
            }
            result[i] = difference;
        }

        // Propagate borrow through remaining digits of `a`.
        for (i = lenB; i < lenA; i++) {
            difference = a[i] - currentBorrow;
            if (difference < 0) {
                difference += DIGIT_BASE;
            } else {
                result[i++] = difference; // If no borrow, fill and break early.
                break;
            }
            result[i] = difference;
        }

        // Copy any remaining digits from `a` if no more borrows.
        for (; i < lenA; i++) {
            result[i] = a[i];
        }

        removeLeadingZeros(result); // Clean up the result.
        return result;
    }

    /**
     * Performs subtraction between two digit arrays, handling signs and magnitude comparison.
     * @param {number[]} a - First digit array.
     * @param {number[]} b - Second digit array.
     * @param {boolean} currentSign - The original sign of the first number.
     * @returns {NumericEntity} The result of the subtraction.
     */
    function subtractAnyDigitArrays(a, b, currentSign) {
        let resultMagnitude;
        let finalSign = currentSign;

        // Compare absolute magnitudes to determine which array is larger.
        const comparison = compareAbsoluteMagnitudes(a, b);

        if (comparison >= 0) { // |a| >= |b|
            resultMagnitude = performArraySubtraction(a, b);
        } else { // |a| < |b|
            resultMagnitude = performArraySubtraction(b, a);
            finalSign = !finalSign; // Sign flips if |b| was larger.
        }

        // Attempt to convert the result back to a SmallNumericEntity if possible.
        const smallResult = convertDigitArrayToSmall(resultMagnitude);
        if (typeof smallResult === "number") {
            return new SmallNumericEntity(finalSign ? -smallResult : smallResult);
        }
        return new LargeNumericEntity(smallResult, finalSign);
    }

    /**
     * Subtracts a small number from a digit array.
     * @param {number[]} digitArr - The digit array.
     * @param {number} smallSubtrahend - The small number to subtract.
     * @param {boolean} isNegativeFlag - The sign of the original digit array.
     * @returns {NumericEntity} The result of the subtraction.
     */
    function subtractSmallFromDigitArray(digitArr, smallSubtrahend, isNegativeFlag) {
        const len = digitArr.length;
        const result = new Array(len);
        let currentCarry = -smallSubtrahend; // Small subtrahend acts as a negative carry.
        let tempDifference;
        let i;

        for (i = 0; i < len; i++) {
            tempDifference = digitArr[i] + currentCarry;
            currentCarry = Math.floor(tempDifference / DIGIT_BASE); // Calculate new carry (can be negative).
            tempDifference %= DIGIT_BASE; // Remainder is the digit.
            result[i] = tempDifference < 0 ? tempDifference + DIGIT_BASE : tempDifference; // Normalize negative digits.
        }

        // Attempt to convert the result back to a SmallNumericEntity.
        const smallResult = convertDigitArrayToSmall(result);
        if (typeof smallResult === "number") {
            return new SmallNumericEntity(isNegativeFlag ? -smallResult : smallResult);
        }
        return new LargeNumericEntity(smallResult, isNegativeFlag);
    }

    // LargeNumericEntity subtraction method.
    LargeNumericEntity.prototype.subtract = function(otherValue) {
        const otherNum = parseInputToNumericEntity(otherValue);

        // If signs are different, convert to addition (this + (-other)).
        if (this.isNegative !== otherNum.isNegative) {
            return this.add(otherNum.getNegated());
        }

        const currentMagnitude = this.magnitude;
        const otherMagnitude = otherNum.magnitude;

        // Optimization: if the other number is small, use specialized subtraction.
        if (otherNum.isRepresentedAsSmall) {
            return subtractSmallFromDigitArray(currentMagnitude, Math.abs(otherNum.magnitude), this.isNegative);
        }

        // Both are large and have the same sign, perform standard array subtraction.
        return subtractAnyDigitArrays(currentMagnitude, otherMagnitude, this.isNegative);
    };
    // Alias for subtract.
    LargeNumericEntity.prototype.minus = LargeNumericEntity.prototype.subtract;

    // SmallNumericEntity subtraction method.
    SmallNumericEntity.prototype.subtract = function(otherValue) {
        const otherNum = parseInputToNumericEntity(otherValue);
        const thisValue = this.magnitude;

        // If signs are different, convert to addition.
        if (thisValue < 0 !== otherNum.isNegative) {
            return this.add(otherNum.getNegated());
        }

        const otherValueMagnitude = otherNum.magnitude;

        // If both are small, try direct JS number subtraction.
        if (otherNum.isRepresentedAsSmall) {
            const difference = thisValue - otherValueMagnitude;
            if (isJsPrecise(difference)) {
                return new SmallNumericEntity(difference);
            }
            // Fallback for when difference is precise but was handled by BigInt for some reason.
            // This path should ideally not be hit if `isJsPrecise` is correct.
            return subtractSmallFromDigitArray(convertSmallToDigitArray(Math.abs(thisValue)), Math.abs(otherValueMagnitude), thisValue < 0);
        }

        // If `this` is small but `otherNum` is large, perform subtraction with flipped operands and sign.
        // `subtractSmallFromDigitArray` expects array as first arg, small as second.
        // Original: `subtractSmall(b, Math.abs(a), a>=0)`
        // `b` is `otherMagnitude`, `Math.abs(a)` is `Math.abs(thisValue)`.
        // The sign logic `a>=0` determines the sign if `b` was smaller, but here `b` is large.
        // So we are doing `otherNum - this`, and then negating the result's sign.
        // Let's rewrite this for clarity: `-(otherNum - thisValue)`
        const magnitudeOfThis = convertSmallToDigitArray(Math.abs(thisValue));
        const tempResult = subtractAnyDigitArrays(otherMagnitude, magnitudeOfThis, otherNum.isNegative);
        return tempResult.getNegated();
    };
    // Alias for subtract.
    SmallNumericEntity.prototype.minus = SmallNumericEntity.prototype.subtract;

    // Negates the number (flips its sign).
    LargeNumericEntity.prototype.getNegated = function() {
        return new LargeNumericEntity(this.magnitude, !this.isNegative);
    };
    SmallNumericEntity.prototype.getNegated = function() {
        // Create a new SmallNumericEntity with the negated value.
        // The `isNegative` flag is automatically set by the constructor.
        return new SmallNumericEntity(-this.magnitude);
    };

    // Returns the absolute value of the number.
    LargeNumericEntity.prototype.getAbsoluteValue = function() {
        return new LargeNumericEntity(this.magnitude, false);
    };
    SmallNumericEntity.prototype.getAbsoluteValue = function() {
        return new SmallNumericEntity(Math.abs(this.magnitude));
    };

    /**
     * Multiplies two digit arrays using standard long multiplication algorithm.
     * @param {number[]} a - First digit array.
     * @param {number[]} b - Second digit array.
     * @returns {number[]} The product as a new digit array.
     */
    function performLongMultiplication(a, b) {
        const lenA = a.length;
        const lenB = b.length;
        const resultLen = lenA + lenB;
        const result = initializeZeroArray(resultLen);
        let product, currentCarry;
        let digitA, digitB;

        for (let i = 0; i < lenA; ++i) {
            digitA = a[i];
            currentCarry = 0; // Reset carry for each digit of 'a'.
            for (let j = 0; j < lenB; ++j) {
                digitB = b[j];
                product = digitA * digitB + result[i + j] + currentCarry;
                currentCarry = Math.floor(product / DIGIT_BASE);
                result[i + j] = product % DIGIT_BASE;
            }
            result[i + lenB] += currentCarry; // Add any final carry to the next position.
        }
        removeLeadingZeros(result);
        return result;
    }

    /**
     * Multiplies a digit array by a single small number.
     * @param {number[]} digitArr - The digit array.
     * @param {number} multiplier - The small integer multiplier.
     * @returns {number[]} The product as a new digit array.
     */
    function multiplyDigitArrayBySmall(digitArr, multiplier) {
        const len = digitArr.length;
        const result = new Array(len);
        let currentCarry = 0;
        let product;

        for (let i = 0; i < len; i++) {
            product = digitArr[i] * multiplier + currentCarry;
            currentCarry = Math.floor(product / DIGIT_BASE);
            result[i] = product % DIGIT_BASE;
        }

        // Propagate any remaining carry.
        while (currentCarry > 0) {
            result[i++] = currentCarry % DIGIT_BASE;
            currentCarry = Math.floor(currentCarry / DIGIT_BASE);
        }
        return result;
    }

    /**
     * Shifts a digit array left by appending zeros.
     * @param {number[]} digits - The digit array.
     * @param {number} count - The number of zeros to append.
     * @returns {number[]} The shifted digit array.
     */
    function shiftDigitsLeft(digits, count) {
        if (count === 0) return digits; // No shift needed.
        const zeros = initializeZeroArray(count);
        return zeros.concat(digits);
    }

    /**
     * Multiplies two digit arrays using the Karatsuba algorithm for efficiency with large numbers.
     * @param {number[]} x - First digit array.
     * @param {number[]} y - Second digit array.
     * @returns {number[]} The product as a new digit array.
     */
    function karatsubaMultiplication(x, y) {
        const n = Math.max(x.length, y.length);

        // Base case: if numbers are small enough, use long multiplication.
        if (n <= 30) { // Threshold for switching to long multiplication.
            return performLongMultiplication(x, y);
        }

        // Split numbers into two halves.
        const halfN = Math.ceil(n / 2);
        const xHigh = x.slice(halfN);
        const xLow = x.slice(0, halfN);
        const yHigh = y.slice(halfN);
        const yLow = y.slice(0, halfN);

        // Recursively compute three products.
        const productLow = karatsubaMultiplication(xLow, yLow);
        const productHigh = karatsubaMultiplication(xHigh, yHigh);
        const sumLowHighX = addAnyDigitArrays(xLow, xHigh);
        const sumLowHighY = addAnyDigitArrays(yLow, yHigh);
        const productMid = karatsubaMultiplication(sumLowHighX, sumLowHighY);

        // Combine the products using the Karatsuba formula:
        // P = productHigh * B^(2*halfN) + (productMid - productLow - productHigh) * B^halfN + productLow
        // where B is DIGIT_BASE.
        const middleTerm = subtractAnyDigitArrays(
            subtractAnyDigitArrays(productMid, productLow, false).magnitude, // Assuming positive for intermediate steps
            productHigh,
            false
        ).magnitude;

        const finalProduct = addAnyDigitArrays(
            addAnyDigitArrays(productLow, shiftDigitsLeft(middleTerm, halfN)),
            shiftDigitsLeft(productHigh, 2 * halfN)
        );

        removeLeadingZeros(finalProduct);
        return finalProduct;
    }

    /**
     * Heuristic to decide whether to use Karatsuba multiplication.
     * @param {number} len1 - Length of the first digit array.
     * @param {number} len2 - Length of the second digit array.
     * @returns {boolean} True if Karatsuba is likely faster.
     */
    function shouldUseKaratsuba(len1, len2) {
        // This is an empirical formula from the original library.
        return -.012 * len1 - .012 * len2 + 15e-6 * len1 * len2 > 0;
    }

    // LargeNumericEntity multiplication method.
    LargeNumericEntity.prototype.multiply = function(otherValue) {
        const otherNum = parseInputToNumericEntity(otherValue);
        const thisMagnitude = this.magnitude;
        const otherMagnitude = otherNum.magnitude;

        // Determine the sign of the result.
        const resultIsNegative = this.isNegative !== otherNum.isNegative;

        // Handle special cases for small multipliers.
        if (otherNum.isRepresentedAsSmall) {
            const smallVal = otherNum.magnitude;
            if (smallVal === 0) return NumericEntity.ZERO;
            if (smallVal === 1) return this;
            if (smallVal === -1) return this.getNegated();

            const absSmallVal = Math.abs(smallVal);
            // If the absolute value of the small multiplier fits within a single digit base.
            if (absSmallVal < DIGIT_BASE) {
                return new LargeNumericEntity(multiplyDigitArrayBySmall(thisMagnitude, absSmallVal), resultIsNegative);
            }
            // If it's small but larger than a single digit base, convert to digit array.
            return new LargeNumericEntity(performLongMultiplication(thisMagnitude, convertSmallToDigitArray(absSmallVal)), resultIsNegative);
        }

        // Decide between Karatsuba and long multiplication for large numbers.
        if (shouldUseKaratsuba(thisMagnitude.length, otherMagnitude.length)) {
            return new LargeNumericEntity(karatsubaMultiplication(thisMagnitude, otherMagnitude), resultIsNegative);
        }
        return new LargeNumericEntity(performLongMultiplication(thisMagnitude, otherMagnitude), resultIsNegative);
    };
    // Alias for multiply.
    LargeNumericEntity.prototype.times = LargeNumericEntity.prototype.multiply;

    /**
     * Helper for multiplying small number by a digit array.
     * @param {number} smallNum - The small integer.
     * @param {number[]} digitArr - The digit array.
     * @param {boolean} resultSign - The sign of the result.
     * @returns {LargeNumericEntity} The product.
     */
    function multiplySmallByDigitArray(smallNum, digitArr, resultSign) {
        if (smallNum < DIGIT_BASE) {
            return new LargeNumericEntity(multiplyDigitArrayBySmall(digitArr, smallNum), resultSign);
        }
        return new LargeNumericEntity(performLongMultiplication(digitArr, convertSmallToDigitArray(smallNum)), resultSign);
    }

    // SmallNumericEntity internal multiplication by another small number.
    SmallNumericEntity.prototype._multiplyBySmall = function(otherSmallNum) {
        const product = otherSmallNum.magnitude * this.magnitude;
        if (isJsPrecise(product)) {
            return new SmallNumericEntity(product);
        }
        // If product overflows, convert to large number multiplication.
        const absThis = Math.abs(this.magnitude);
        const absOther = Math.abs(otherSmallNum.magnitude);
        const resultSign = this.isNegative !== otherSmallNum.isNegative;
        return multiplySmallByDigitArray(absOther, convertSmallToDigitArray(absThis), resultSign);
    };

    // LargeNumericEntity internal multiplication by a small number.
    LargeNumericEntity.prototype._multiplyBySmall = function(otherSmallNum) {
        const smallVal = otherSmallNum.magnitude;
        if (smallVal === 0) return NumericEntity.ZERO;
        if (smallVal === 1) return this;
        if (smallVal === -1) return this.getNegated();

        return multiplySmallByDigitArray(Math.abs(smallVal), this.magnitude, this.isNegative !== otherSmallNum.isNegative);
    };

    // SmallNumericEntity multiplication method.
    SmallNumericEntity.prototype.multiply = function(otherValue) {
        const otherNum = parseInputToNumericEntity(otherValue);
        // Delegate to internal helper based on the type of `otherNum`.
        return otherNum._multiplyBySmall(this);
    };
    // Alias for multiply.
    SmallNumericEntity.prototype.times = SmallNumericEntity.prototype.multiply;

    /**
     * Squares a digit array (multiplies it by itself).
     * Uses a specialized algorithm for squaring that is slightly faster than general multiplication.
     * @param {number[]} digits - The digit array to square.
     * @returns {number[]} The squared value as a new digit array.
     */
    function squareDigitArray(digits) {
        const len = digits.length;
        const result = initializeZeroArray(2 * len); // Max length of square is 2*len.
        let product, currentCarry;
        let digitI, digitJ;

        for (let i = 0; i < len; i++) {
            digitI = digits[i];
            currentCarry = 0; // Reset carry for each outer loop iteration.
            // Calculate 2 * a[i] * a[j] for j > i and a[i]^2.
            // This loop calculates (a[i]*a[i]) and (2*a[i]*a[j]) and adds to result.
            for (let j = i; j < len; j++) {
                digitJ = digits[j];
                product = (i === j ? digitI * digitJ : 2 * digitI * digitJ) + result[i + j] + currentCarry;
                currentCarry = Math.floor(product / DIGIT_BASE);
                result[i + j] = product % DIGIT_BASE;
            }
            result[i + len] += currentCarry; // Add remaining carry to the higher-order position.
        }
        removeLeadingZeros(result);
        return result;
    }

    // LargeNumericEntity square method.
    LargeNumericEntity.prototype.square = function() {
        // Squaring a number always results in a non-negative value.
        return new LargeNumericEntity(squareDigitArray(this.magnitude), false);
    };

    // SmallNumericEntity square method.
    SmallNumericEntity.prototype.square = function() {
        const squaredValue = this.magnitude * this.magnitude;
        if (isJsPrecise(squaredValue)) {
            return new SmallNumericEntity(squaredValue);
        }
        // If the squared value overflows, convert to LargeNumericEntity.
        return new LargeNumericEntity(squareDigitArray(convertSmallToDigitArray(Math.abs(this.magnitude))), false);
    };

    /**
     * Division with remainder (DivMod) using Knuth's algorithm D.
     * This is an optimized division for large digit arrays.
     * @param {number[]} dividend - The dividend digit array.
     * @param {number[]} divisor - The divisor digit array.
     * @returns {[number[], number[]]} An array containing [quotient, remainder] digit arrays.
     */
    function knuthDivMod(dividend, divisor) {
        const lenDividend = dividend.length;
        const lenDivisor = divisor.length;

        // Ensure divisor is not zero and dividend is not smaller than divisor.
        if (lenDivisor === 0) throw new Error("Division by zero.");
        if (lenDividend < lenDivisor) return [initializeZeroArray(0), dividend];

        // Normalization: Multiply dividend and divisor by a factor 'lambda'
        // such that the most significant digit of the divisor is at least DIGIT_BASE / 2.
        // This improves accuracy of quotient digit estimation.
        const lambda = Math.ceil(DIGIT_BASE / (2 * divisor[lenDivisor - 1]));
        const normalizedDividend = multiplyDigitArrayBySmall(dividend, lambda);
        const normalizedDivisor = multiplyDigitArrayBySmall(divisor, lambda);

        const lenNormDividend = normalizedDividend.length;
        const lenNormDivisor = normalizedDivisor.length;

        // If normalization made dividend shorter than divisor, it means original dividend < original divisor.
        if (lenNormDividend < lenNormDivisor) {
            // Need to reverse the normalization for the remainder.
            const originalRemainder = performSmallDivMod(normalizedDividend, lambda)[0];
            return [initializeZeroArray(0), originalRemainder];
        }

        const quotient = initializeZeroArray(lenDividend - lenDivisor + 1);
        const mostSignificantDivisorDigit = normalizedDivisor[lenNormDivisor - 1];

        // Adjust normalizedDividend length for easier indexing.
        if (normalizedDividend.length <= lenDividend) normalizedDividend.push(0);
        // Add a leading zero to normalizedDivisor for easier indexing.
        normalizedDivisor.push(0);

        // Main loop: Estimate quotient digits and subtract divisor.
        for (let shift = lenDividend - lenDivisor; shift >= 0; shift--) {
            let estimatedQuotientDigit = DIGIT_BASE - 1;

            // Estimate quotient digit based on the two most significant digits of dividend and one of divisor.
            if (normalizedDividend[shift + lenNormDivisor] !== mostSignificantDivisorDigit) {
                estimatedQuotientDigit = Math.floor(
                    (normalizedDividend[shift + lenNormDivisor] * DIGIT_BASE + normalizedDividend[shift + lenNormDivisor - 1]) / mostSignificantDivisorDigit
                );
            }

            // Temporarily subtract estimatedQuotientDigit * normalizedDivisor from normalizedDividend.
            let currentCarry = 0;
            let currentBorrow = 0;
            let tempProduct;
            let tempDifference;

            for (let i = 0; i < lenNormDivisor + 1; i++) {
                tempProduct = estimatedQuotientDigit * normalizedDivisor[i] + currentCarry;
                currentCarry = Math.floor(tempProduct / DIGIT_BASE);
                tempDifference = normalizedDividend[shift + i] - (tempProduct % DIGIT_BASE) - currentBorrow;

                if (tempDifference < 0) {
                    tempDifference += DIGIT_BASE;
                    currentBorrow = 1;
                } else {
                    currentBorrow = 0;
                }
                normalizedDividend[shift + i] = tempDifference;
            }

            // Adjust quotient digit if the subtraction resulted in a negative borrow (estimated too high).
            while (currentBorrow !== 0) {
                estimatedQuotientDigit--;
                currentCarry = 0;
                currentBorrow = 0; // Reset borrow for adjustment.

                for (let i = 0; i < lenNormDivisor + 1; i++) {
                    tempSum = normalizedDividend[shift + i] + normalizedDivisor[i] + currentCarry;
                    if (tempSum >= DIGIT_BASE) {
                        normalizedDividend[shift + i] = tempSum - DIGIT_BASE;
                        currentCarry = 1;
                    } else {
                        normalizedDividend[shift + i] = tempSum;
                        currentCarry = 0;
                    }
                }
                // If currentCarry is 0, it means the adjustment was enough.
                currentBorrow = (currentCarry === 0) ? 0 : -1; // This logic is tricky, original just `borrow += carry`.
                // Let's ensure this correctly reflects adding divisor back.
                // If carry is 1, it means we added back successfully, so borrow goes to 0 (or less negative).
                // If carry is 0, it means we still have a negative borrow.
                // The original code `borrow += carry` is simpler and probably assumes `borrow` is -1.
                // Let's stick closer to the original:
                // `currentBorrow` here means if the previous subtraction had a net negative effect.
                // When we `estimatedQuotientDigit--`, we effectively add `normalizedDivisor` back.
                // So if `currentBorrow` is -1, `estimatedQuotientDigit` was too high.
                // After decrementing `estimatedQuotientDigit`, we add `normalizedDivisor` back to `normalizedDividend`.
                // This loop continues until `currentBorrow` (which represents the overall borrow after adjustment) is 0.
                // The loop should effectively be `while(currentBorrow < 0)`.
                // The original `while(borrow !== 0)` covers both cases, but implies `borrow` could be positive too, which it shouldn't.
                // Let's keep `while(currentBorrow !== 0)` and ensure the inner loop logic for `carry` is correct.
                // The inner loop for correction: `carry` is 1 if `remainder[i] - base + divisor[i]` results in a positive sum.
                // If `carry` is 1, it means we successfully "undid" a borrow.
                // If `carry` is 0, it means `remainder[i] - base + divisor[i]` was still negative or zero.
                // The `borrow += carry` means if `carry` was 1, we reduce the negative `borrow`.
                // So, if `borrow` was -1 and `carry` was 1, it becomes 0. If `borrow` was -1 and `carry` was 0, it stays -1.
                // This is effectively `currentBorrow = (currentCarry === 1 ? 0 : currentBorrow)` after the loop.
                // Let's simplify this.
                let adjustmentCarry = 0;
                for(let k = 0; k < lenNormDivisor + 1; k++){
                    let tempVal = normalizedDividend[shift + k] + normalizedDivisor[k] + adjustmentCarry;
                    normalizedDividend[shift + k] = tempVal % DIGIT_BASE;
                    adjustmentCarry = Math.floor(tempVal / DIGIT_BASE);
                }
                currentBorrow += adjustmentCarry; // `currentBorrow` was -1, now it's -1 + `adjustmentCarry` (0 or 1).
            }
            quotient[shift] = estimatedQuotientDigit;
        }

        // Unnormalize the remainder.
        const finalRemainder = performSmallDivMod(normalizedDividend, lambda)[0];

        // Clean up and return.
        removeLeadingZeros(quotient);
        removeLeadingZeros(finalRemainder);
        return [quotient, finalRemainder];
    }


    /**
     * Fallback division algorithm for very large numbers where Knuth's D might be too complex or for specific cases.
     * This uses a simpler iterative approach.
     * @param {number[]} dividend - The dividend digit array.
     * @param {number[]} divisor - The divisor digit array.
     * @returns {[number[], number[]]} An array containing [quotient, remainder] digit arrays.
     */
    function simpleIterativeDivMod(dividend, divisor) {
        let currentLenDividend = dividend.length;
        const lenDivisor = divisor.length;
        const resultQuotient = [];
        let currentPartialDividend = []; // This will accumulate digits from `dividend`.

        // Iterate from most significant digit to least significant.
        while (currentLenDividend > 0) {
            // Take the next digit from the dividend and prepend it to the partial dividend.
            currentPartialDividend.unshift(dividend[--currentLenDividend]);
            removeLeadingZeros(currentPartialDividend); // Clean up leading zeros in partial dividend.

            // If current partial dividend is smaller than divisor, quotient digit is 0.
            if (compareAbsoluteMagnitudes(currentPartialDividend, divisor) < 0) {
                resultQuotient.push(0);
                continue;
            }

            // Estimate the quotient digit.
            let estimatedQuotient;
            const xLen = currentPartialDividend.length;
            const highX = currentPartialDividend[xLen - 1] * DIGIT_BASE + (currentPartialDividend[xLen - 2] || 0);
            const highY = divisor[lenDivisor - 1] * DIGIT_BASE + (divisor[lenDivisor - 2] || 0);

            if (xLen > lenDivisor) {
                estimatedQuotient = Math.floor((highX + 1) * DIGIT_BASE / highY);
            } else {
                estimatedQuotient = Math.floor(highX / highY);
            }

            // Refine the estimated quotient digit (can be off by 1 or 2).
            let testProduct;
            do {
                testProduct = multiplyDigitArrayBySmall(divisor, estimatedQuotient);
                if (compareAbsoluteMagnitudes(testProduct, currentPartialDividend) <= 0) break;
                estimatedQuotient--;
            } while (estimatedQuotient > 0); // Ensure quotient doesn't go below zero.

            resultQuotient.push(estimatedQuotient);
            currentPartialDividend = performArraySubtraction(currentPartialDividend, testProduct);
        }

        resultQuotient.reverse(); // Reverse to get correct order.
        removeLeadingZeros(resultQuotient);
        removeLeadingZeros(currentPartialDividend);
        return [resultQuotient, currentPartialDividend];
    }

    /**
     * Divides a digit array by a small number (lambda).
     * @param {number[]} digitArr - The dividend digit array.
     * @param {number} lambda - The small integer divisor.
     * @returns {[number[], number]} An array containing [quotient digit array, remainder].
     */
    function performSmallDivMod(digitArr, lambda) {
        const len = digitArr.length;
        const quotient = initializeZeroArray(len);
        let currentRemainder = 0;
        let currentDivisorPart;
        let q;

        // Iterate from most significant digit to least significant.
        for (let i = len - 1; i >= 0; --i) {
            currentDivisorPart = currentRemainder * DIGIT_BASE + digitArr[i];
            q = getIntegerPart(currentDivisorPart / lambda);
            currentRemainder = currentDivisorPart - q * lambda; // Calculate new remainder.
            quotient[i] = q; // Store the quotient digit.
        }
        removeLeadingZeros(quotient);
        return [quotient, currentRemainder]; // Remainder is always a single JS number.
    }

    /**
     * General division with remainder method for any NumericEntity types.
     * @param {NumericEntity} self - The dividend.
     * @param {NumericEntity} otherValue - The divisor.
     * @returns {[NumericEntity, NumericEntity]} An array containing [quotient, remainder].
     */
    function calculateDivMod(self, otherValue) {
        const otherNum = parseInputToNumericEntity(otherValue);
        const dividendMagnitude = self.magnitude;
        const divisorMagnitude = otherNum.magnitude;

        // Handle division by zero.
        if (otherNum.isZero()) {
            throw new Error("Attempted division by zero.");
        }

        let quotientMagnitude;
        let remainderMagnitude;

        // Optimization for small numbers.
        if (self.isRepresentedAsSmall) {
            if (otherNum.isRepresentedAsSmall) {
                // Both are small, use direct JS number division.
                const q = getIntegerPart(self.magnitude / otherNum.magnitude);
                const r = self.magnitude % otherNum.magnitude;
                return [new SmallNumericEntity(q), new SmallNumericEntity(r)];
            }
            // Self is small, other is large. Quotient is 0, remainder is self.
            return [NumericEntity.ZERO, self];
        }

        // Dividend is large.
        if (otherNum.isRepresentedAsSmall) {
            const smallDivisorVal = otherNum.magnitude;
            if (smallDivisorVal === 1) return [self, NumericEntity.ZERO];
            if (smallDivisorVal === -1) return [self.getNegated(), NumericEntity.ZERO];

            const absSmallDivisor = Math.abs(smallDivisorVal);
            // If small divisor fits within a single digit base.
            if (absSmallDivisor < DIGIT_BASE) {
                const [qArr, rNum] = performSmallDivMod(dividendMagnitude, absSmallDivisor);
                quotientMagnitude = convertDigitArrayToSmall(qArr);
                remainderMagnitude = rNum;

                // Adjust signs for quotient and remainder.
                const quotientSign = self.isNegative !== otherNum.isNegative;
                const remainderSign = self.isNegative;

                let finalQuotient;
                if (typeof quotientMagnitude === "number") {
                    finalQuotient = new SmallNumericEntity(quotientSign ? -quotientMagnitude : quotientMagnitude);
                } else {
                    finalQuotient = new LargeNumericEntity(quotientMagnitude, quotientSign);
                }

                const finalRemainder = new SmallNumericEntity(remainderSign ? -remainderMagnitude : remainderMagnitude);
                return [finalQuotient, finalRemainder];
            }
            // Small divisor is larger than a single digit base, treat as large.
            // Convert small divisor to a digit array for general division.
            divisorMagnitude = convertSmallToDigitArray(absSmallDivisor);
        }

        // Both are large (or small divisor was converted to large).
        const comparison = compareAbsoluteMagnitudes(dividendMagnitude, divisorMagnitude);
        if (comparison === -1) { // |dividend| < |divisor|
            return [NumericEntity.ZERO, self];
        }
        if (comparison === 0) { // |dividend| === |divisor|
            const quotientSign = self.isNegative !== otherNum.isNegative;
            return [new SmallNumericEntity(quotientSign ? -1 : 1), NumericEntity.ZERO];
        }

        // Perform actual division using one of the algorithms.
        let divisionResult;
        // Heuristic to choose division algorithm based on length.
        if (dividendMagnitude.length + divisorMagnitude.length <= 200) {
            divisionResult = knuthDivMod(dividendMagnitude, divisorMagnitude);
        } else {
            divisionResult = simpleIterativeDivMod(dividendMagnitude, divisorMagnitude);
        }

        quotientMagnitude = divisionResult[0];
        remainderMagnitude = divisionResult[1];

        // Determine signs for the final quotient and remainder.
        const quotientIsNegative = self.isNegative !== otherNum.isNegative;
        const remainderIsNegative = self.isNegative;

        let finalQuotient;
        let finalRemainder;

        // Convert quotient to SmallNumericEntity if possible.
        const convertedQuotient = convertDigitArrayToSmall(quotientMagnitude);
        if (typeof convertedQuotient === "number") {
            finalQuotient = new SmallNumericEntity(quotientIsNegative ? -convertedQuotient : convertedQuotient);
        } else {
            finalQuotient = new LargeNumericEntity(convertedQuotient, quotientIsNegative);
        }

        // Convert remainder to SmallNumericEntity if possible.
        const convertedRemainder = convertDigitArrayToSmall(remainderMagnitude);
        if (typeof convertedRemainder === "number") {
            finalRemainder = new SmallNumericEntity(remainderIsNegative ? -convertedRemainder : convertedRemainder);
        } else {
            finalRemainder = new LargeNumericEntity(convertedRemainder, remainderIsNegative);
        }

        return [finalQuotient, finalRemainder];
    }

    // LargeNumericEntity divmod method.
    LargeNumericEntity.prototype.divmod = function(otherValue) {
        const result = calculateDivMod(this, otherValue);
        return { quotient: result[0], remainder: result[1] };
    };
    // SmallNumericEntity delegates divmod to LargeNumericEntity's prototype.
    SmallNumericEntity.prototype.divmod = LargeNumericEntity.prototype.divmod;

    // LargeNumericEntity division method (returns only the quotient).
    LargeNumericEntity.prototype.divide = function(otherValue) {
        return calculateDivMod(this, otherValue)[0];
    };
    // Aliases for division.
    SmallNumericEntity.prototype.over = SmallNumericEntity.prototype.divide = LargeNumericEntity.prototype.over = LargeNumericEntity.prototype.divide;

    // LargeNumericEntity modulo method (returns only the remainder).
    LargeNumericEntity.prototype.mod = function(otherValue) {
        return calculateDivMod(this, otherValue)[1];
    };
    // Aliases for modulo.
    SmallNumericEntity.prototype.remainder = SmallNumericEntity.prototype.mod = LargeNumericEntity.prototype.remainder = LargeNumericEntity.prototype.mod;

    // LargeNumericEntity power method (exponentiation).
    LargeNumericEntity.prototype.power = function(exponentValue) {
        const exponentNum = parseInputToNumericEntity(exponentValue);
        const baseMagnitude = this.magnitude;
        const baseValue = this.magnitude[0]; // For small number checks

        // Handle special cases for base.
        if (exponentNum.isZero()) return NumericEntity.ONE;
        if (baseValue === 0 && this.magnitude.length === 1) return NumericEntity.ZERO; // Base is 0.
        if (baseValue === 1 && this.magnitude.length === 1 && !this.isNegative) return NumericEntity.ONE; // Base is 1.
        if (baseValue === 1 && this.magnitude.length === 1 && this.isNegative) { // Base is -1.
            return exponentNum.isEven() ? NumericEntity.ONE : NumericEntity.MINUS_ONE;
        }

        // Handle negative exponent (results in 0 for integers, or error for non-integers).
        if (exponentNum.isNegative) {
            return NumericEntity.ZERO;
        }

        // Check if exponent is too large (only small exponents are supported for now).
        if (!exponentNum.isRepresentedAsSmall) {
            throw new Error(`The exponent ${exponentNum.toString()} is too large for direct power calculation.`);
        }

        // If base is small, try direct Math.pow.
        if (this.isRepresentedAsSmall) {
            const result = Math.pow(this.magnitude, exponentNum.magnitude);
            if (isJsPrecise(result)) {
                return new SmallNumericEntity(getIntegerPart(result));
            }
        }

        let currentBase = this;
        let result = NumericEntity.ONE;
        let exponent = exponentNum.magnitude; // Use the raw JS number for the exponent.

        // Binary exponentiation (exponentiation by squaring).
        while (true) {
            if ((exponent & 1) === 1) { // If exponent is odd.
                result = result.multiply(currentBase);
                exponent--;
            }
            if (exponent === 0) break;
            exponent /= 2;
            currentBase = currentBase.square();
        }
        return result;
    };
    // SmallNumericEntity delegates power to LargeNumericEntity's prototype.
    SmallNumericEntity.prototype.power = LargeNumericEntity.prototype.power;

    // LargeNumericEntity modular exponentiation method.
    LargeNumericEntity.prototype.modPower = function(exp, mod) {
        const exponent = parseInputToNumericEntity(exp);
        const modulus = parseInputToNumericEntity(mod);

        if (modulus.isZero()) {
            throw new Error("Cannot perform modular exponentiation with a modulus of zero.");
        }

        let result = NumericEntity.ONE;
        let currentBase = this.mod(modulus); // Base is reduced modulo modulus.

        // Standard modular exponentiation algorithm.
        while (exponent.isPositive()) {
            if (currentBase.isZero()) return NumericEntity.ZERO; // If base is 0, result is 0.
            if (exponent.isOdd()) {
                result = result.multiply(currentBase).mod(modulus);
            }
            // Divide exponent by 2.
            exponent = exponent.divide(2);
            // Square the base modulo modulus.
            currentBase = currentBase.square().mod(modulus);
        }
        return result;
    };
    // SmallNumericEntity delegates modPower to LargeNumericEntity's prototype.
    SmallNumericEntity.prototype.modPower = LargeNumericEntity.prototype.modPower;

    /**
     * Compares the absolute magnitudes of two digit arrays.
     * @param {number[]} arr1 - First digit array.
     * @param {number[]} arr2 - Second digit array.
     * @returns {number} -1 if arr1 < arr2, 0 if arr1 == arr2, 1 if arr1 > arr2.
     */
    function compareAbsoluteMagnitudes(arr1, arr2) {
        // Compare lengths first.
        if (arr1.length !== arr2.length) {
            return arr1.length > arr2.length ? 1 : -1;
        }
        // If lengths are equal, compare digits from most significant to least significant.
        for (let i = arr1.length - 1; i >= 0; i--) {
            if (arr1[i] !== arr2[i]) {
                return arr1[i] > arr2[i] ? 1 : -1;
            }
        }
        return 0; // Arrays are identical.
    }

    // LargeNumericEntity method to compare absolute values.
    LargeNumericEntity.prototype.compareAbsoluteValue = function(otherValue) {
        const otherNum = parseInputToNumericEntity(otherValue);
        const thisMagnitude = this.magnitude;
        const otherMagnitude = otherNum.magnitude;

        // If other number is small, and this is large, this is greater.
        if (otherNum.isRepresentedAsSmall) {
            return 1;
        }
        // Both are large, compare their digit arrays.
        return compareAbsoluteMagnitudes(thisMagnitude, otherMagnitude);
    };

    // SmallNumericEntity method to compare absolute values.
    SmallNumericEntity.prototype.compareAbsoluteValue = function(otherValue) {
        const otherNum = parseInputToNumericEntity(otherValue);
        const thisAbsValue = Math.abs(this.magnitude);
        let otherAbsValue;

        // If other number is also small.
        if (otherNum.isRepresentedAsSmall) {
            otherAbsValue = Math.abs(otherNum.magnitude);
            return (thisAbsValue === otherAbsValue) ? 0 : (thisAbsValue > otherAbsValue ? 1 : -1);
        }
        // If this is small but other is large, this is smaller.
        return -1;
    };

    // LargeNumericEntity general comparison method.
    LargeNumericEntity.prototype.compare = function(otherValue) {
        // Handle comparison with JavaScript's Infinity.
        if (otherValue === Infinity) return -1;
        if (otherValue === -Infinity) return 1;

        const otherNum = parseInputToNumericEntity(otherValue);
        const thisMagnitude = this.magnitude;
        const otherMagnitude = otherNum.magnitude;

        // Compare signs first.
        if (this.isNegative !== otherNum.isNegative) {
            return otherNum.isNegative ? 1 : -1; // If `otherNum` is negative, `this` (positive) is greater.
        }

        // If signs are the same, compare magnitudes.
        if (otherNum.isRepresentedAsSmall) {
            // If `otherNum` is small and `this` is large:
            // If positive, `this` is greater. If negative, `this` is smaller (more negative).
            return this.isNegative ? -1 : 1;
        }

        // Both are large and have the same sign.
        // Compare absolute magnitudes, then adjust based on sign.
        return compareAbsoluteMagnitudes(thisMagnitude, otherMagnitude) * (this.isNegative ? -1 : 1);
    };
    // Alias for compare.
    LargeNumericEntity.prototype.compareTo = LargeNumericEntity.prototype.compare;

    // SmallNumericEntity general comparison method.
    SmallNumericEntity.prototype.compare = function(otherValue) {
        // Handle comparison with JavaScript's Infinity.
        if (otherValue === Infinity) return -1;
        if (otherValue === -Infinity) return 1;

        const otherNum = parseInputToNumericEntity(otherValue);
        const thisValue = this.magnitude;
        const otherValueMagnitude = otherNum.magnitude;

        // If other number is also small, direct comparison.
        if (otherNum.isRepresentedAsSmall) {
            return (thisValue === otherValueMagnitude) ? 0 : (thisValue > otherValueMagnitude ? 1 : -1);
        }

        // If this is small but other is large.
        // If signs are different, compare signs.
        if (thisValue < 0 !== otherNum.isNegative) {
            return thisValue < 0 ? -1 : 1; // If this is negative, it's smaller. If this is positive, it's greater.
        }
        // If signs are the same, `this` (small) is smaller than `other` (large).
        // Except if both are negative, then `this` (less negative) is greater.
        return thisValue < 0 ? 1 : -1;
    };
    // Alias for compare.
    SmallNumericEntity.prototype.compareTo = SmallNumericEntity.prototype.compare;

    // Comparison utility methods.
    LargeNumericEntity.prototype.equals = function(v) { return this.compare(v) === 0; };
    SmallNumericEntity.prototype.eq = SmallNumericEntity.prototype.equals = LargeNumericEntity.prototype.eq = LargeNumericEntity.prototype.equals;

    LargeNumericEntity.prototype.notEquals = function(v) { return this.compare(v) !== 0; };
    SmallNumericEntity.prototype.neq = SmallNumericEntity.prototype.notEquals = LargeNumericEntity.prototype.neq = LargeNumericEntity.prototype.notEquals;

    LargeNumericEntity.prototype.isGreaterThan = function(v) { return this.compare(v) > 0; };
    SmallNumericEntity.prototype.gt = SmallNumericEntity.prototype.isGreaterThan = LargeNumericEntity.prototype.gt = LargeNumericEntity.prototype.isGreaterThan;

    LargeNumericEntity.prototype.isLessThan = function(v) { return this.compare(v) < 0; };
    SmallNumericEntity.prototype.lt = SmallNumericEntity.prototype.isLessThan = LargeNumericEntity.prototype.lt = LargeNumericEntity.prototype.isLessThan;

    LargeNumericEntity.prototype.isGreaterOrEqual = function(v) { return this.compare(v) >= 0; };
    SmallNumericEntity.prototype.geq = SmallNumericEntity.prototype.isGreaterOrEqual = LargeNumericEntity.prototype.geq = LargeNumericEntity.prototype.isGreaterOrEqual;

    LargeNumericEntity.prototype.isLessOrEqual = function(v) { return this.compare(v) <= 0; };
    SmallNumericEntity.prototype.leq = SmallNumericEntity.prototype.isLessOrEqual = LargeNumericEntity.prototype.leq = LargeNumericEntity.prototype.isLessOrEqual;

    // Parity checks.
    LargeNumericEntity.prototype.isEven = function() { return (this.magnitude[0] & 1) === 0; };
    SmallNumericEntity.prototype.isEven = function() { return (this.magnitude & 1) === 0; };

    LargeNumericEntity.prototype.isOdd = function() { return (this.magnitude[0] & 1) === 1; };
    SmallNumericEntity.prototype.isOdd = function() { return (this.magnitude & 1) === 1; };

    // Sign checks.
    LargeNumericEntity.prototype.isPositive = function() { return !this.isNegative; };
    SmallNumericEntity.prototype.isPositive = function() { return this.magnitude > 0; };

    LargeNumericEntity.prototype.isNegative = function() { return this.isNegative; };
    SmallNumericEntity.prototype.isNegative = function() { return this.magnitude < 0; };

    // Value checks.
    LargeNumericEntity.prototype.isUnit = function() { return false; }; // A large number cannot be 1 or -1.
    SmallNumericEntity.prototype.isUnit = function() { return Math.abs(this.magnitude) === 1; };

    LargeNumericEntity.prototype.isZero = function() { return false; }; // A large number (by definition of its constructor) is not 0.
    SmallNumericEntity.prototype.isZero = function() { return this.magnitude === 0; };

    // Divisibility check.
    LargeNumericEntity.prototype.isDivisibleBy = function(otherValue) {
        const otherNum = parseInputToNumericEntity(otherValue);
        const otherMagnitude = otherNum.magnitude;

        if (otherNum.isZero()) return false;
        if (otherNum.isUnit()) return true; // Divisible by 1 or -1.
        if (otherNum.magnitude === 2 && otherNum.isRepresentedAsSmall) return this.isEven(); // Optimization for 2.

        return this.mod(otherNum).equals(NumericEntity.ZERO);
    };
    // SmallNumericEntity delegates isDivisibleBy.
    SmallNumericEntity.prototype.isDivisibleBy = LargeNumericEntity.prototype.isDivisibleBy;

    /**
     * Checks if a small number (less than 25) is prime.
     * @param {NumericEntity} numEntity - The number to check.
     * @returns {boolean | undefined} True if prime, false if composite, undefined if unknown (needs Miller-Rabin).
     */
    function isBasicPrime(numEntity) {
        const absoluteNum = numEntity.getAbsoluteValue();
        if (absoluteNum.isUnit()) return false; // 1 is not prime.
        if (absoluteNum.equals(2) || absoluteNum.equals(3) || absoluteNum.equals(5)) return true;
        if (absoluteNum.isEven() || absoluteNum.isDivisibleBy(3) || absoluteNum.isDivisibleBy(5)) return false;
        if (absoluteNum.isLessThan(25)) return true; // Small primes not caught above.
        return undefined; // Needs more robust check.
    }

    // LargeNumericEntity primality test (Miller-Rabin for larger numbers).
    LargeNumericEntity.prototype.isPrime = function() {
        const basicCheckResult = isBasicPrime(this);
        if (basicCheckResult !== undefined) return basicCheckResult;

        const n = this.getAbsoluteValue();
        const nMinusOne = n.prev(); // n-1

        // Miller-Rabin primality test.
        // n-1 = 2^s * d, where d is odd.
        let d = nMinusOne;
        while (d.isEven()) {
            d = d.divide(2);
        }

        // List of small prime bases for Miller-Rabin (for strong probable prime).
        // The original code uses a fixed list.
        const testBases = [2, 3, 5, 7, 11, 13, 17, 19];

        for (let i = 0; i < testBases.length; i++) {
            let x = NumericEntity(testBases[i]).modPower(d, n);
            if (x.equals(NumericEntity.ONE) || x.equals(nMinusOne)) {
                continue; // Witness passes.
            }

            let witnessPasses = false;
            // Loop while d < n-1.
            let currentD = d;
            while (currentD.isLessThan(nMinusOne)) {
                x = x.square().mod(n);
                if (x.equals(nMinusOne)) {
                    witnessPasses = true; // Witness passes.
                    break;
                }
                currentD = currentD.multiply(2);
            }
            if (!witnessPasses) return false; // Witness fails, n is composite.
        }
        return true; // Likely prime.
    };
    // SmallNumericEntity delegates isPrime.
    SmallNumericEntity.prototype.isPrime = LargeNumericEntity.prototype.isPrime;

    // LargeNumericEntity probable primality test (Miller-Rabin with configurable iterations).
    LargeNumericEntity.prototype.isProbablePrime = function(iterations) {
        const basicCheckResult = isBasicPrime(this);
        if (basicCheckResult !== undefined) return basicCheckResult;

        const n = this.getAbsoluteValue();
        const numIterations = iterations === undefined ? 5 : iterations;

        // n-1 = 2^s * d, where d is odd.
        let nMinusOne = n.prev();
        let d = nMinusOne;
        while (d.isEven()) {
            d = d.divide(2);
        }

        for (let i = 0; i < numIterations; i++) {
            // Pick a random 'a' such that 2 <= a <= n-2.
            const a = NumericEntity.randBetween(2, n.subtract(2));
            let x = a.modPower(d, n);

            if (x.equals(NumericEntity.ONE) || x.equals(nMinusOne)) {
                continue;
            }

            let witnessPasses = false;
            let currentD = d;
            while (currentD.isLessThan(nMinusOne)) {
                x = x.square().mod(n);
                if (x.equals(nMinusOne)) {
                    witnessPasses = true;
                    break;
                }
                currentD = currentD.multiply(2);
            }
            if (!witnessPasses) return false; // Witness fails.
        }
        return true; // Probably prime.
    };
    // SmallNumericEntity delegates isProbablePrime.
    SmallNumericEntity.prototype.isProbablePrime = LargeNumericEntity.prototype.isProbablePrime;

    // LargeNumericEntity modular inverse method (Extended Euclidean Algorithm).
    LargeNumericEntity.prototype.modInverse = function(modulusValue) {
        let t = NumericEntity.ZERO;
        let newT = NumericEntity.ONE;
        let r = parseInputToNumericEntity(modulusValue);
        let newR = this.getAbsoluteValue(); // Use absolute value for calculations.

        let quotient, lastT, lastR;

        while (!newR.equals(NumericEntity.ZERO)) {
            quotient = r.divide(newR);
            lastT = t;
            lastR = r;
            t = newT;
            r = newR;
            newT = lastT.subtract(quotient.multiply(newT));
            newR = lastR.subtract(quotient.multiply(newR));
        }

        if (!r.equals(NumericEntity.ONE)) {
            throw new Error(`${this.toString()} and ${modulusValue.toString()} are not coprime, so modular inverse does not exist.`);
        }

        // Ensure result is positive and within modulus.
        if (t.compare(0) === -1) {
            t = t.add(modulusValue);
        }

        // If original number was negative, negate the result modulo modulus.
        if (this.isNegative()) {
            return t.getNegated().mod(modulusValue);
        }
        return t;
    };
    // SmallNumericEntity delegates modInverse.
    SmallNumericEntity.prototype.modInverse = LargeNumericEntity.prototype.modInverse;

    // Calculates the next integer (this + 1).
    LargeNumericEntity.prototype.getNext = function() {
        const currentMagnitude = this.magnitude;
        if (this.isNegative) {
            // If negative, -N -> -(N-1). So we subtract 1 from magnitude.
            // `subtractSmallFromDigitArray` expects positive magnitude for first arg.
            return subtractSmallFromDigitArray(currentMagnitude, 1, this.isNegative);
        }
        return new LargeNumericEntity(addSmallToDigitArray(currentMagnitude, 1), this.isNegative);
    };

    SmallNumericEntity.prototype.getNext = function() {
        const currentVal = this.magnitude;
        if (currentVal + 1 < JS_MAX_SAFE_INT) {
            return new SmallNumericEntity(currentVal + 1);
        }
        // If it overflows, convert to LargeNumericEntity.
        return new LargeNumericEntity(JS_MAX_SAFE_INT_DIGITS, false);
    };

    // Calculates the previous integer (this - 1).
    LargeNumericEntity.prototype.getPrevious = function() {
        const currentMagnitude = this.magnitude;
        if (this.isNegative) {
            // If negative, -N -> -(N+1). So we add 1 to magnitude.
            return new LargeNumericEntity(addSmallToDigitArray(currentMagnitude, 1), true);
        }
        // If positive, N -> N-1. So we subtract 1 from magnitude.
        return subtractSmallFromDigitArray(currentMagnitude, 1, this.isNegative);
    };

    SmallNumericEntity.prototype.getPrevious = function() {
        const currentVal = this.magnitude;
        if (currentVal - 1 > -JS_MAX_SAFE_INT) {
            return new SmallNumericEntity(currentVal - 1);
        }
        // If it underflows, convert to LargeNumericEntity.
        return new LargeNumericEntity(JS_MAX_SAFE_INT_DIGITS, true); // Represents -JS_MAX_SAFE_INT.
    };

    // Precomputed powers of two up to DIGIT_BASE.
    const powersOfTwoCache = [1];
    while (2 * powersOfTwoCache[powersOfTwoCache.length - 1] <= DIGIT_BASE) {
        powersOfTwoCache.push(2 * powersOfTwoCache[powersOfTwoCache.length - 1]);
    }
    const powers2CacheLen = powersOfTwoCache.length;
    const highestPowerOfTwo = powersOfTwoCache[powers2CacheLen - 1];

    /**
     * Checks if a shift amount is small enough to be handled directly as a JS number.
     * @param {*} shiftAmount - The shift amount.
     * @returns {boolean} True if small enough.
     */
    function isShiftAmountSmall(shiftAmount) {
        return (typeof shiftAmount === "number" || typeof shiftAmount === "string") && +Math.abs(shiftAmount) <= DIGIT_BASE || (shiftAmount instanceof LargeNumericEntity && shiftAmount.magnitude.length <= 1);
    }

    // LargeNumericEntity left bit shift.
    LargeNumericEntity.prototype.shiftDigitsLeft = function(shiftAmount) {
        if (!isShiftAmountSmall(shiftAmount)) {
            throw new Error(`Shift amount ${String(shiftAmount)} is too large for shifting.`);
        }
        let s = +shiftAmount;
        if (s < 0) return this.shiftDigitsRight(-s); // Negative left shift is a right shift.

        let result = this;
        if (result.isZero()) return result; // Shifting zero results in zero.

        // Repeatedly multiply by highestPowerOfTwo until shift amount is small.
        while (s >= powers2CacheLen) {
            result = result.multiply(highestPowerOfTwo);
            s -= (powers2CacheLen - 1); // Adjust s by (log2(highestPowerOfTwo))
        }
        return result.multiply(powersOfTwoCache[s]);
    };
    // SmallNumericEntity delegates shiftDigitsLeft.
    SmallNumericEntity.prototype.shiftDigitsLeft = LargeNumericEntity.prototype.shiftDigitsLeft;

    // LargeNumericEntity right bit shift.
    LargeNumericEntity.prototype.shiftDigitsRight = function(shiftAmount) {
        if (!isShiftAmountSmall(shiftAmount)) {
            throw new Error(`Shift amount ${String(shiftAmount)} is too large for shifting.`);
        }
        let s = +shiftAmount;
        if (s < 0) return this.shiftDigitsLeft(-s); // Negative right shift is a left shift.

        let result = this;
        // Optimization: if shifting a negative unit (e.g., -1) right, it remains -1.
        if (result.isNegative() && result.isUnit()) return result;

        // Repeatedly divide by highestPowerOfTwo until shift amount is small.
        while (s >= powers2CacheLen) {
            if (result.isZero()) return result;
            let [quotient, remainder] = calculateDivMod(result, highestPowerOfTwo);
            // Handle negative numbers: if remainder is negative, decrement quotient.
            result = remainder.isNegative() ? quotient.getPrevious() : quotient;
            s -= (powers2CacheLen - 1);
        }
        if (result.isZero()) return result;
        let [quotient, remainder] = calculateDivMod(result, powersOfTwoCache[s]);
        return remainder.isNegative() ? quotient.getPrevious() : quotient;
    };
    // SmallNumericEntity delegates shiftDigitsRight.
    SmallNumericEntity.prototype.shiftDigitsRight = LargeNumericEntity.prototype.shiftDigitsRight;

    // Constants for bitwise operations.
    const LOBMASK_JS_INT = 1 << 30; // Lowest order bit mask for a 31-bit JS int.
    const LOBMASK_BIG_INT = (DIGIT_BASE & -DIGIT_BASE) * (DIGIT_BASE & -DIGIT_BASE) | LOBMASK_JS_INT; // Mask for base DIGIT_BASE.

    /**
     * Estimates the position of the lowest set bit (similar to `roughLOB` in original).
     * Used for GCD optimization.
     * @param {NumericEntity} numEntity - The number.
     * @returns {number} An integer representing a power of two.
     */
    function estimateLowestBitPower(numEntity) {
        const val = numEntity.magnitude;
        const x = typeof val === "number" ? (val | LOBMASK_JS_INT) : (val[0] + (val[1] || 0) * DIGIT_BASE | LOBMASK_BIG_INT);
        return x & -x; // Returns the lowest set bit.
    }

    /**
     * Performs bitwise operations (AND, OR, XOR) on NumericEntity objects.
     * Operates by processing digits in chunks.
     * @param {NumericEntity} numX - First operand.
     * @param {NumericEntity} numY - Second operand.
     * @param {function(number, number): number} bitwiseFn - The bitwise function (e.g., `(a,b) => a & b`).
     * @returns {NumericEntity} The result of the bitwise operation.
     */
    function performBitwiseOperation(numX, numY, bitwiseFn) {
        numY = parseInputToNumericEntity(numY);

        // Handle negative numbers by converting to two's complement-like representation.
        const xIsNegative = numX.isNegative();
        const yIsNegative = numY.isNegative();

        let xRemaining = xIsNegative ? numX.getNegated().prev() : numX;
        let yRemaining = yIsNegative ? numY.getNegated().prev() : numY;

        const resultDigits = [];
        let xDigit, yDigit;
        let xDivModResult, yDivModResult;

        // Process digits in chunks until both numbers are zero.
        while (!xRemaining.isZero() || !yRemaining.isZero()) {
            xDivModResult = calculateDivMod(xRemaining, highestPowerOfTwo);
            xDigit = xDivModResult[1].toJSNumber();
            if (xIsNegative) {
                xDigit = highestPowerOfTwo - 1 - xDigit; // Invert bits for negative numbers.
            }

            yDivModResult = calculateDivMod(yRemaining, highestPowerOfTwo);
            yDigit = yDivModResult[1].toJSNumber();
            if (yIsNegative) {
                yDigit = highestPowerOfTwo - 1 - yDigit; // Invert bits for negative numbers.
            }

            xRemaining = xDivModResult[0];
            yRemaining = yDivModResult[0];
            resultDigits.push(bitwiseFn(xDigit, yDigit));
        }

        // Determine the sign of the final result based on the bitwise operation on signs.
        let finalResultSignBit = bitwiseFn(xIsNegative ? 1 : 0, yIsNegative ? 1 : 0);
        let finalSum = NumericEntity(finalResultSignBit !== 0 ? -1 : 0);

        // Reconstruct the number from the result digits.
        for (let i = resultDigits.length - 1; i >= 0; i--) {
            finalSum = finalSum.multiply(highestPowerOfTwo).add(NumericEntity(resultDigits[i]));
        }

        return finalSum;
    }

    // LargeNumericEntity bitwise NOT.
    LargeNumericEntity.prototype.bitwiseNOT = function() {
        return this.getNegated().prev(); // ~N = -(N+1)
    };
    // SmallNumericEntity delegates bitwiseNOT.
    SmallNumericEntity.prototype.bitwiseNOT = LargeNumericEntity.prototype.bitwiseNOT;

    // LargeNumericEntity bitwise AND.
    LargeNumericEntity.prototype.bitwiseAND = function(otherNum) {
        return performBitwiseOperation(this, otherNum, (a, b) => a & b);
    };
    // SmallNumericEntity delegates bitwiseAND.
    SmallNumericEntity.prototype.bitwiseAND = LargeNumericEntity.prototype.bitwiseAND;

    // LargeNumericEntity bitwise OR.
    LargeNumericEntity.prototype.bitwiseOR = function(otherNum) {
        return performBitwiseOperation(this, otherNum, (a, b) => a | b);
    };
    // SmallNumericEntity delegates bitwiseOR.
    SmallNumericEntity.prototype.bitwiseOR = LargeNumericEntity.prototype.bitwiseOR;

    // LargeNumericEntity bitwise XOR.
    LargeNumericEntity.prototype.bitwiseXOR = function(otherNum) {
        return performBitwiseOperation(this, otherNum, (a, b) => a ^ b);
    };
    // SmallNumericEntity delegates bitwiseXOR.
    SmallNumericEntity.prototype.bitwiseXOR = LargeNumericEntity.prototype.bitwiseXOR;

    /**
     * Calculates the integer logarithm (floor(log_base(value))).
     * Recursive function.
     * @param {NumericEntity} value - The number.
     * @param {NumericEntity} base - The base for the logarithm.
     * @returns {{p: NumericEntity, e: number}} An object containing the power (p) and exponent (e).
     */
    function calculateIntegerLog(value, base) {
        // Base case: if base is greater than value, log is 0.
        if (base.compare(value) > 0) { // base > value
            return { p: NumericEntity(1), e: 0 };
        }

        // Recursive step: log_b(x) = 2 * log_b^2(x)
        const tempResult = calculateIntegerLog(value, base.square());
        const powerResult = tempResult.p;
        const exponentResult = tempResult.e;

        // Check if multiplying by base one more time fits.
        const productWithBase = powerResult.multiply(base);
        if (productWithBase.compare(value) <= 0) { // productWithBase <= value
            return { p: productWithBase, e: exponentResult * 2 + 1 };
        }
        return { p: powerResult, e: exponentResult * 2 };
    }

    // LargeNumericEntity bit length calculation.
    LargeNumericEntity.prototype.getBitLength = function() {
        let n = this;
        // For negative numbers, bit length is usually defined for two's complement.
        // Here, it's (abs(N)-1)'s bit length.
        if (n.isNegative()) {
            n = n.getNegated().subtract(NumericEntity(1));
        }
        if (n.isZero()) {
            return NumericEntity.ZERO;
        }
        // Calculate log base 2.
        return NumericEntity(calculateIntegerLog(n, NumericEntity(2)).e).add(NumericEntity(1));
    };
    // SmallNumericEntity delegates getBitLength.
    SmallNumericEntity.prototype.getBitLength = LargeNumericEntity.prototype.getBitLength;

    /**
     * Returns the maximum of two NumericEntity objects.
     * @param {*} a - First value.
     * @param {*} b - Second value.
     * @returns {NumericEntity} The maximum value.
     */
    function findMaximum(a, b) {
        const numA = parseInputToNumericEntity(a);
        const numB = parseInputToNumericEntity(b);
        return numA.isGreaterThan(numB) ? numA : numB;
    }

    /**
     * Returns the minimum of two NumericEntity objects.
     * @param {*} a - First value.
     * @param {*} b - Second value.
     * @returns {NumericEntity} The minimum value.
     */
    function findMinimum(a, b) {
        const numA = parseInputToNumericEntity(a);
        const numB = parseInputToNumericEntity(b);
        return numA.isLessThan(numB) ? numA : numB;
    }

    /**
     * Calculates the greatest common divisor (GCD) of two numbers using binary GCD algorithm.
     * @param {*} a - First number.
     * @param {*} b - Second number.
     * @returns {NumericEntity} The GCD.
     */
    function calculateGCD(a, b) {
        let numA = parseInputToNumericEntity(a).getAbsoluteValue();
        let numB = parseInputToNumericEntity(b).getAbsoluteValue();

        if (numA.equals(numB)) return numA;
        if (numA.isZero()) return numB;
        if (numB.isZero()) return numA;

        let commonFactorOfTwo = NumericEntity.ONE;
        let lowestBitPower;

        // Remove common factors of 2.
        while (numA.isEven() && numB.isEven()) {
            lowestBitPower = Math.min(estimateLowestBitPower(numA), estimateLowestBitPower(numB));
            numA = numA.divide(lowestBitPower);
            numB = numB.divide(lowestBitPower);
            commonFactorOfTwo = commonFactorOfTwo.multiply(lowestBitPower);
        }

        // Remove factors of 2 from remaining numbers.
        while (numA.isEven()) {
            numA = numA.divide(estimateLowestBitPower(numA));
        }

        do {
            while (numB.isEven()) {
                numB = numB.divide(estimateLowestBitPower(numB));
            }
            if (numA.isGreaterThan(numB)) {
                let temp = numB;
                numB = numA;
                numA = temp;
            }
            numB = numB.subtract(numA);
        } while (!numB.isZero());

        return commonFactorOfTwo.isUnit() ? numA : numA.multiply(commonFactorOfTwo);
    }

    /**
     * Calculates the least common multiple (LCM) of two numbers.
     * LCM(a, b) = |a * b| / GCD(a, b).
     * @param {*} a - First number.
     * @param {*} b - Second number.
     * @returns {NumericEntity} The LCM.
     */
    function calculateLCM(a, b) {
        const numA = parseInputToNumericEntity(a).getAbsoluteValue();
        const numB = parseInputToNumericEntity(b).getAbsoluteValue();
        return numA.divide(calculateGCD(numA, numB)).multiply(numB);
    }

    /**
     * Generates a random NumericEntity between two given bounds (inclusive).
     * @param {*} lowerBound - The lower bound.
     * @param {*} upperBound - The upper bound.
     * @returns {NumericEntity} A random number within the range.
     */
    function generateRandomBetween(lowerBound, upperBound) {
        let low = findMinimum(lowerBound, upperBound);
        let high = findMaximum(lowerBound, upperBound);
        let range = high.subtract(low).add(NumericEntity(1));

        // If the range fits a small integer.
        if (range.isRepresentedAsSmall) {
            return low.add(Math.floor(Math.random() * range.magnitude));
        }

        // For large ranges, generate random digits.
        const rangeMagnitude = range.magnitude;
        const rangeLength = rangeMagnitude.length - 1;
        const resultDigits = [];
        let restrictedByUpper = true; // Flag to ensure result doesn't exceed range.

        for (let i = rangeLength; i >= 0; i--) {
            const maxDigit = restrictedByUpper ? rangeMagnitude[i] : DIGIT_BASE;
            const digit = getIntegerPart(Math.random() * maxDigit);
            resultDigits.unshift(digit);
            if (digit < maxDigit) restrictedByUpper = false; // If a digit is less than max, subsequent digits can be anything.
        }

        const randomComponent = convertDigitArrayToSmall(resultDigits);
        return low.add(typeof randomComponent === "number" ? new SmallNumericEntity(randomComponent) : new LargeNumericEntity(randomComponent, false));
    }

    /**
     * Parses a string representation of a number with a given base (radix).
     * @param {string} textValue - The string to parse.
     * @param {number | NumericEntity} baseRadix - The base (2-36).
     * @returns {NumericEntity} The parsed number.
     */
    const parseValueWithBase = function(textValue, baseRadix) {
        const strLength = textValue.length;
        let charIndex;
        const absBase = Math.abs(baseRadix);

        // Input validation for digits.
        for (charIndex = 0; charIndex < strLength; charIndex++) {
            const char = textValue[charIndex].toLowerCase();
            if (char === "-") continue; // Allow negative sign.
            if (/[a-z0-9]/.test(char)) {
                if (/[0-9]/.test(char) && +char >= absBase) {
                    // If digit is '1' and base is '1', it's allowed. Otherwise, invalid.
                    if (!(char === "1" && absBase === 1)) {
                        throw new Error(`Character '${char}' is not a valid digit in base ${baseRadix}.`);
                    }
                } else if (char.charCodeAt(0) - 87 >= absBase) {
                    throw new Error(`Character '${char}' is not a valid digit in base ${baseRadix}.`);
                }
            }
        }

        // Optimization for common small bases.
        if (baseRadix >= 2 && baseRadix <= 36) {
            // Check if result fits within JS_MAX_SAFE_INT.
            if (strLength <= JS_MAX_SAFE_INT_LOG / Math.log(baseRadix)) {
                const parsedResult = parseInt(textValue, baseRadix);
                if (isNaN(parsedResult)) {
                    throw new Error(`Could not parse value '${textValue}' as an integer in base ${baseRadix}.`);
                }
                return new SmallNumericEntity(parsedResult);
            }
        }

        const baseNum = parseInputToNumericEntity(baseRadix);
        const digits = [];
        const isNegative = textValue[0] === "-";

        // Parse individual digits from the string.
        for (charIndex = isNegative ? 1 : 0; charIndex < textValue.length; charIndex++) {
            const char = textValue[charIndex].toLowerCase();
            const charCode = char.charCodeAt(0);
            if (charCode >= 48 && charCode <= 57) { // '0'-'9'
                digits.push(parseInputToNumericEntity(char));
            } else if (charCode >= 97 && charCode <= 122) { // 'a'-'z'
                digits.push(parseInputToNumericEntity(charCode - 87));
            } else if (char === "<") { // Handle custom digit representation like <10>
                const startIndex = charIndex;
                do {
                    charIndex++;
                } while (textValue[charIndex] !== ">" && charIndex < textValue.length);
                if (textValue[charIndex] !== ">") throw new Error("Unclosed custom digit segment.");
                digits.push(parseInputToNumericEntity(textValue.slice(startIndex + 1, charIndex)));
            } else {
                throw new Error(`Character '${char}' is not a valid character for base ${baseRadix}.`);
            }
        }
        return parseDigitArrayWithBase(digits, baseNum, isNegative);
    };

    /**
     * Converts an array of digits in a given base to a NumericEntity.
     * @param {NumericEntity[]} digitEntities - Array of NumericEntity digits.
     * @param {NumericEntity} base - The base.
     * @param {boolean} isNegative - Whether the final number should be negative.
     * @returns {NumericEntity} The converted number.
     */
    function parseDigitArrayWithBase(digitEntities, base, isNegative) {
        let resultValue = NumericEntity.ZERO;
        let currentPower = NumericEntity.ONE;
        // Iterate from least significant digit to most significant.
        for (let i = digitEntities.length - 1; i >= 0; i--) {
            resultValue = resultValue.add(digitEntities[i].times(currentPower));
            currentPower = currentPower.times(base);
        }
        return isNegative ? resultValue.getNegated() : resultValue;
    }

    /**
     * Converts a digit (0-35) to its string representation (0-9, a-z) or custom format.
     * @param {number} digit - The digit.
     * @returns {string} The string representation.
     */
    function getDigitStringRepresentation(digit) {
        if (digit <= 35) {
            return "0123456789abcdefghijklmnopqrstuvwxyz".charAt(digit);
        }
        return `<${digit}>`; // For bases > 36.
    }

    /**
     * Converts a NumericEntity to an array of digits in a specified base.
     * @param {NumericEntity} numEntity - The number to convert.
     * @param {NumericEntity} base - The target base.
     * @returns {{value: number[], isNegative: boolean}} Object with digit array and sign.
     */
    function convertToBaseArray(numEntity, base) {
        base = NumericEntity(base); // Ensure base is a NumericEntity.

        if (base.isZero()) {
            if (numEntity.isZero()) return { value: [0], isNegative: false };
            throw new Error("Cannot convert non-zero numbers to base 0.");
        }
        if (base.equals(-1)) {
            if (numEntity.isZero()) return { value: [0], isNegative: false };
            if (numEntity.isNegative()) {
                // For negative numbers in base -1, the representation alternates 1 and 0.
                // e.g., -5 (base -1) = 10101 (base -1)
                const absNum = numEntity.getNegated();
                const arr = [];
                for(let i = 0; i < absNum.toJSNumber(); i++) {
                    arr.push(1);
                    arr.push(0);
                }
                return { value: arr, isNegative: false };
            }
            // For positive numbers in base -1, e.g., 3 (base -1) = 111 (base -1)
            const arr = Array.from({length: numEntity.toJSNumber()}).map(() => 1);
            return { value: arr, isNegative: false };
        }

        let isResultNegative = false;
        if (numEntity.isNegative() && base.isPositive()) {
            isResultNegative = true;
            numEntity = numEntity.getAbsoluteValue();
        }

        if (base.equals(1)) {
            if (numEntity.isZero()) return { value: [0], isNegative: false };
            // In base 1, a number N is represented by N ones.
            return { value: Array.from({length: numEntity.toJSNumber()}).map(() => 1), isNegative: isResultNegative };
        }

        const resultDigits = [];
        let currentLeftover = numEntity;
        let divModPair;

        while (currentLeftover.isNegative() || currentLeftover.compareAbsoluteValue(base) >= 0) {
            divModPair = currentLeftover.divmod(base);
            currentLeftover = divModPair.quotient;
            let digit = divModPair.remainder;

            // Handle negative remainders by adjusting quotient and remainder.
            if (digit.isNegative()) {
                digit = base.minus(digit).getAbsoluteValue();
                currentLeftover = currentLeftover.getNext();
            }
            resultDigits.push(digit.toJSNumber());
        }
        resultDigits.push(currentLeftover.toJSNumber()); // Add the last quotient.

        return { value: resultDigits.reverse(), isNegative: isResultNegative };
    }

    /**
     * Converts a NumericEntity to its string representation in a given base.
     * @param {NumericEntity} numEntity - The number to convert.
     * @param {number | NumericEntity} base - The target base.
     * @returns {string} The string representation.
     */
    function convertToBaseString(numEntity, base) {
        const { value: digitArray, isNegative: isResultNegative } = convertToBaseArray(numEntity, base);
        return (isResultNegative ? "-" : "") + digitArray.map(getDigitStringRepresentation).join("");
    }

    // LargeNumericEntity toArray method.
    LargeNumericEntity.prototype.toArray = function(radix) {
        return convertToBaseArray(this, radix);
    };
    // SmallNumericEntity delegates toArray.
    SmallNumericEntity.prototype.toArray = LargeNumericEntity.prototype.toArray;

    // LargeNumericEntity toString method.
    LargeNumericEntity.prototype.toString = function(radix) {
        if (radix === undefined) radix = 10;
        if (radix !== 10) return convertToBaseString(this, radix);

        const digitArray = this.magnitude;
        let len = digitArray.length;
        // Start with the most significant digit.
        let resultString = String(digitArray[--len]);

        // Pad with zeros for consistency in base 10.
        const zeroPad = "0000000"; // Enough zeros for DIGIT_LOG_BASE.
        let currentDigitString;

        // Append remaining digits.
        while (--len >= 0) {
            currentDigitString = String(digitArray[len]);
            resultString += zeroPad.slice(currentDigitString.length) + currentDigitString;
        }
        return (this.isNegative ? "-" : "") + resultString;
    };
    // SmallNumericEntity toString method.
    SmallNumericEntity.prototype.toString = function(radix) {
        if (radix === undefined) radix = 10;
        if (radix !== 10) return convertToBaseString(this, radix);
        return String(this.magnitude);
    };

    // Serialization methods.
    LargeNumericEntity.prototype.toJSON = SmallNumericEntity.prototype.toJSON = function() {
        return this.toString();
    };

    // Value conversion methods.
    LargeNumericEntity.prototype.valueOf = function() {
        return parseInt(this.toString(), 10);
    };
    LargeNumericEntity.prototype.toJSNumber = LargeNumericEntity.prototype.valueOf;

    SmallNumericEntity.prototype.valueOf = function() {
        return this.magnitude;
    };
    SmallNumericEntity.prototype.toJSNumber = SmallNumericEntity.prototype.valueOf;

    /**
     * Parses a string value into a NumericEntity. Handles scientific notation and large numbers.
     * @param {string} stringValue - The string to parse.
     * @returns {NumericEntity} The parsed number.
     */
    function parseStringValue(stringValue) {
        // If the string represents a number that fits JS safe integer and is an integer.
        if (isJsPrecise(+stringValue) && +stringValue === getIntegerPart(+stringValue)) {
            return new SmallNumericEntity(+stringValue);
        }

        let isNegative = stringValue[0] === "-";
        if (isNegative) stringValue = stringValue.slice(1);

        const scientificNotationParts = stringValue.split(/e/i);
        if (scientificNotationParts.length > 2) {
            throw new Error(`Invalid integer format: too many 'e' characters in '${stringValue}'.`);
        }

        // Handle scientific notation.
        if (scientificNotationParts.length === 2) {
            let exponentPart = scientificNotationParts[1];
            if (exponentPart[0] === "+") exponentPart = exponentPart.slice(1);
            const exponent = +exponentPart;

            if (exponent !== getIntegerPart(exponent) || !isJsPrecise(exponent)) {
                throw new Error(`Invalid integer exponent: '${exponentPart}' is not a valid integer exponent.`);
            }

            let mainPart = scientificNotationParts[0];
            const decimalPointIndex = mainPart.indexOf(".");
            if (decimalPointIndex >= 0) {
                // Adjust exponent based on decimal places.
                exponent -= (mainPart.length - decimalPointIndex - 1);
                mainPart = mainPart.slice(0, decimalPointIndex) + mainPart.slice(decimalPointIndex + 1);
            }

            if (exponent < 0) {
                // Negative exponents imply fractional numbers, which are not supported for integers.
                throw new Error("Cannot parse fractional numbers as integers (negative exponent part).");
            }
            // Append zeros for positive exponent.
            stringValue = mainPart + "0".repeat(exponent);
        }

        // Validate that the string contains only digits.
        if (!/^\d+$/.test(stringValue)) {
            throw new Error(`Invalid integer string: '${stringValue}' contains non-digit characters.`);
        }

        // Convert string to digit array.
        const digitArray = [];
        let stringLength = stringValue.length;
        const digitChunkLength = DIGIT_LOG_BASE; // e.g., 7 for 10^7.
        let endIndex = stringLength;
        let startIndex = stringLength - digitChunkLength;

        while (endIndex > 0) {
            if (startIndex < 0) startIndex = 0;
            digitArray.push(+stringValue.slice(startIndex, endIndex));
            endIndex = startIndex;
            startIndex -= digitChunkLength;
        }

        removeLeadingZeros(digitArray);
        return new LargeNumericEntity(digitArray, isNegative);
    }

    /**
     * Parses a number value into a NumericEntity.
     * @param {number} numberValue - The number to parse.
     * @returns {NumericEntity} The parsed number.
     */
    function parseNumberValue(numberValue) {
        if (isJsPrecise(numberValue)) {
            if (numberValue !== getIntegerPart(numberValue)) {
                throw new Error(`${numberValue} is not an integer.`);
            }
            return new SmallNumericEntity(numberValue);
        }
        // If it's a large number (e.g., from `Number.MAX_VALUE`), convert to string and parse.
        return parseStringValue(numberValue.toString());
    }

    /**
     * Generic parser function to convert various input types to NumericEntity.
     * @param {*} rawValue - The input value (number, string, or NumericEntity).
     * @returns {NumericEntity} The parsed NumericEntity.
     */
    function parseInputToNumericEntity(rawValue) {
        if (typeof rawValue === "number") {
            return parseNumberValue(rawValue);
        }
        if (typeof rawValue === "string") {
            return parseStringValue(rawValue);
        }
        // If it's already a NumericEntity, return it directly.
        return rawValue;
    }

    // Pre-cache small integer instances for performance.
    const SMALL_INT_CACHE_LIMIT = 1000;
    for (let i = 0; i < SMALL_INT_CACHE_LIMIT; i++) {
        NumericEntity[i] = new SmallNumericEntity(i);
        if (i > 0) {
            NumericEntity[-i] = new SmallNumericEntity(-i);
        }
    }

    // Export common constants and utility functions.
    NumericEntity.ONE = NumericEntity[1];
    NumericEntity.ZERO = NumericEntity[0];
    NumericEntity.MINUS_ONE = NumericEntity[-1];
    NumericEntity.max = findMaximum;
    NumericEntity.min = findMinimum;
    NumericEntity.gcd = calculateGCD;
    NumericEntity.lcm = calculateLCM;
    NumericEntity.isInstance = function(x) {
        return x instanceof LargeNumericEntity || x instanceof SmallNumericEntity;
    };
    NumericEntity.randBetween = generateRandomBetween;
    NumericEntity.fromDigitArray = function(digitArray, base, isNegativeFlag) {
        // Map input digits to NumericEntity instances before parsing.
        const parsedDigits = digitArray.map(parseInputToNumericEntity);
        const parsedBase = parseInputToNumericEntity(base || 10);
        return parseDigitArrayWithBase(parsedDigits, parsedBase, isNegativeFlag);
    };

    return NumericEntity;
})(); // Pass 'undefined' to ensure it's truly undefined locally.

// Main application logic.
function processSolution(rawInputString) {
    // Initialize the input processor.
    const inputReaderInstance = new DataStreamProcessor(rawInputString);

    // Read problem parameters. N and K are standard numbers here.
    const elementCountN = inputReaderInstance.readNextElement(); // Represents N
    const targetK = inputReaderInstance.readNextElement();       // Represents K
    const inputNumberArray = inputReaderInstance.readAllElementsOnLine(); // Array 'a'

    // Define the bit depth for calculations. This limits the max value of K and the number of bits considered.
    const bitDepthLimit = 40;

    // Precompute powers of two in descending order for bitwise calculations.
    // b[0] = 2^(bitDepthLimit-1), b[1] = 2^(bitDepthLimit-2), ..., b[bitDepthLimit-1] = 2^0.
    const descendingPowersOfTwo = Array.from({ length: bitDepthLimit }, (_, i) => Math.pow(2, bitDepthLimit - 1 - i));

    // Calculate the count of '1's for each bit position across all numbers in `inputNumberArray`.
    // `bitOccurrenceCounts[i]` stores how many numbers in `inputNumberArray` have the (bitDepthLimit-1-i)-th bit set.
    const bitOccurrenceCounts = initializeZeroArray(bitDepthLimit); // Using the helper from largeNumber.
    for (let i = 0; i < bitDepthLimit; i++) {
        const currentPowerOfTwo = descendingPowersOfTwo[i];
        // Iterate through each number in the input array.
        for (const num of inputNumberArray) {
            // Check if the current bit (corresponding to currentPowerOfTwo) is set in `num`.
            // `Math.floor(num / currentPowerOfTwo)` effectively right-shifts `num`.
            // `% 2` checks the lowest bit of the shifted result.
            if (Math.floor(num / currentPowerOfTwo) % 2 === 1) {
                bitOccurrenceCounts[i]++;
            }
        }
    }

    // Construct an "optimal" binary string.
    // For each bit position, if more than half of the numbers have a '1' at that position,
    // then the optimal strategy for *that bit* is to set it to '0' to minimize XOR sum
    // (because `(x XOR 0)` is `x` and `(x XOR 1)` is `~x`).
    // If setting a bit to '0' makes more sense, `perfectBit` is '0', else '1'.
    const halfArrayLength = Math.floor(inputNumberArray.length / 2);
    const optimalBitString = bitOccurrenceCounts.map(count => (count >= halfArrayLength ? "0" : "1")).join("");

    // Generate candidate values for `X`.
    // The candidates include `targetK` itself, and values derived from `targetK`
    // by changing a '1' bit to '0' and setting subsequent bits to match the `optimalBitString`.
    const candidateXValues = [targetK];
    const targetKBinaryString = targetK.toString(2); // Binary representation of K.
    const targetKBinaryLength = targetKBinaryString.length;

    // Iterate through the binary representation of `targetK`.
    for (let i = 0; i < targetKBinaryLength; i++) {
        // If the i-th bit of `targetK` is '1'.
        if (targetKBinaryString[i] === "1") {
            // Create a temporary candidate string:
            // - Prefix: Copy `targetKBinaryString` up to (but not including) the current '1' bit.
            // - Current bit: Set to '0'.
            // - Suffix: Copy bits from `optimalBitString` for the remaining positions.
            const prefix = targetKBinaryString.slice(0, i);
            const suffix = optimalBitString.slice(optimalBitString.length - (targetKBinaryLength - i - 1));
            const tempCandidateString = prefix + "0" + suffix;

            // Convert the binary string back to a number and add to candidates.
            // Note: `parseInt` will cap at JS_MAX_SAFE_INT. This is fine because `targetK` is a JS Number.
            candidateXValues.push(parseInt(tempCandidateString, 2));
        }
    }

    // Initialize the maximum XOR sum found so far to zero.
    let maxTotalXORSum = largeNumber(0);

    // Iterate through each candidate X value.
    candidateXValues.forEach(currentX => {
        // Convert current X to a binary string and pad with leading zeros to `bitDepthLimit`.
        let currentXBinaryString = currentX.toString(2).padStart(bitDepthLimit, "0");

        // Calculate the XOR sum for the current candidate X.
        const currentXORSum = currentXBinaryString.split("").reduce((accumulator, bitChar, index) => {
            // `bitChar` is the bit of currentX at `index`.
            // `descendingPowersOfTwo[index]` is 2^(bitDepthLimit-1-index).
            // `bitOccurrenceCounts[index]` is the count of '1's at that bit position in `inputNumberArray`.

            const powerVal = largeNumber(descendingPowersOfTwo[index]);
            const countOnes = bitOccurrenceCounts[index];
            const countZeros = inputNumberArray.length - countOnes;

            // If the bit of `currentX` is '0':
            // We want to maximize `(num XOR 0) * (2^bitPos)`. This means we want `num` to have '1' at this bit.
            // The contribution is `(count of numbers with 1 at this bit) * (2^bitPos)`.
            if (bitChar === "0") {
                return accumulator.add(powerVal.multiply(countOnes));
            } else { // If the bit of `currentX` is '1':
                // We want to maximize `(num XOR 1) * (2^bitPos)`. This means we want `num` to have '0' at this bit.
                // The contribution is `(count of numbers with 0 at this bit) * (2^bitPos)`.
                return accumulator.add(powerVal.multiply(countZeros));
            }
        }, largeNumber(0)); // Initialize accumulator as a largeNumber.

        // Update `maxTotalXORSum` if the current XOR sum is greater.
        if (currentXORSum.isGreaterThan(maxTotalXORSum)) {
            maxTotalXORSum = currentXORSum;
        }
    });

    // Output the final maximum XOR sum.
    console.log(maxTotalXORSum.toString());
}

// Read input from stdin and run the solution.
processSolution(require("fs").readFileSync("/dev/stdin", "utf8"));