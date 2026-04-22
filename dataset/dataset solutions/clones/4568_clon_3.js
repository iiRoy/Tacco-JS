"use strict";

// The outer function to encapsulate the numeric library.
// Renamed from 'bigInt' to 'hugeNumberFactory'.
// The 'undefined' parameter from the original IIFE has been removed,
// as it's less critical in modern JavaScript and its absence represents a Type III deletion.
let hugeNumberFactory = function() {
    // Core constants for the digit-based representation of large numbers.
    // Renamed from 'BASE', 'LOG_BASE', 'MAX_INT', 'MAX_INT_ARR', 'LOG_MAX_INT'.
    const DIGIT_GROUP_SIZE = 1e7; // Each array element holds a number up to this value (10,000,000).
    const GROUP_LOG_VALUE = 7;    // Log10 of DIGIT_GROUP_SIZE.
    const MAX_JS_SAFE_INTEGER = 9007199254740991; // The largest integer n such that n and n+1 are exactly representable as a JavaScript Number.
    const MAX_JS_SAFE_INT_DIGITS = decomposeSmallInt(MAX_JS_SAFE_INTEGER); // MAX_JS_SAFE_INTEGER decomposed into digit groups.
    const LOG_MAX_JS_SAFE_INT = Math.log(MAX_JS_SAFE_INTEGER); // Log of MAX_JS_SAFE_INTEGER, used for parsing optimizations.

    /**
     * Base class for all numeric types within this library.
     * Renamed from 'Integer' to 'AbstractNumericEntity'.
     * Provides common functionality and serves as a factory for numeric instances.
     * @param {number|string|AbstractNumericEntity} initialVal - The value to parse.
     * @param {number} [radixValue] - The base for string parsing.
     * @returns {AbstractNumericEntity} A CompactNumeric or MultiDigitNumeric instance.
     */
    function AbstractNumericEntity(initialVal, radixValue) {
        // If no value is provided, return the pre-defined zero constant.
        if (typeof initialVal === "undefined") {
            return AbstractNumericEntity.ZERO_VAL;
        }
        // If a radix is specified, parse the value based on that radix.
        if (typeof radixValue !== "undefined") {
            const parsedRadix = +radixValue;
            // Added explicit validation for radix (Type III addition).
            if (isNaN(parsedRadix) || parsedRadix < 2 || parsedRadix > 36) {
                throw new Error(`Invalid radix specified: ${radixValue}. Must be between 2 and 36.`);
            }
            return parsedRadix === 10 ? processInputToNumeric(initialVal) : parseCustomBaseString(initialVal, parsedRadix);
        }
        // Otherwise, process the input using the default parsing mechanism.
        return processInputToNumeric(initialVal);
    }

    /**
     * Represents a large integer that exceeds JavaScript's safe integer limits.
     * Stores numbers as arrays of digits.
     * Renamed from 'BigInteger' to 'MultiDigitNumeric'.
     * @param {number[]} digitArray - Array of digit groups, least significant first.
     * @param {boolean} isNegativeFlag - True if the number is negative.
     */
    function MultiDigitNumeric(digitArray, isNegativeFlag) {
        this.digitValues = digitArray; // Renamed 'value' to 'digitValues'.
        this.isNegative = isNegativeFlag; // Renamed 'sign' to 'isNegative'.
        this.isCompact = false; // Renamed 'isSmall' to 'isCompact'.
    }
    // Establish prototype chain.
    MultiDigitNumeric.prototype = Object.create(AbstractNumericEntity.prototype);
    MultiDigitNumeric.prototype.constructor = MultiDigitNumeric; // Explicit constructor assignment (Type III addition).

    /**
     * Represents a small integer that fits within JavaScript's safe integer limits.
     * Stores numbers directly as a primitive number.
     * Renamed from 'SmallInteger' to 'CompactNumeric'.
     * @param {number} numericalValue - The integer value.
     */
    function CompactNumeric(numericalValue) {
        this.numericalValue = numericalValue; // Renamed 'value' to 'numericalValue'.
        this.isNegative = numericalValue < 0; // Renamed 'sign' to 'isNegative'.
        this.isCompact = true; // Renamed 'isSmall' to 'isCompact'.
    }
    // Establish prototype chain.
    CompactNumeric.prototype = Object.create(AbstractNumericEntity.prototype);
    CompactNumeric.prototype.constructor = CompactNumeric; // Explicit constructor assignment (Type III addition).

    /**
     * Checks if a given number is within JavaScript's safe integer range.
     * Renamed from 'isPrecise' to 'isWithinSafeIntRange'.
     * @param {number} num - The number to check.
     * @returns {boolean} True if the number is within the safe integer range.
     */
    function isWithinSafeIntRange(num) {
        return Math.abs(num) <= MAX_JS_SAFE_INTEGER;
    }

    /**
     * Converts a standard JavaScript number into its digit array representation.
     * Renamed from 'smallToArray' to 'decomposeSmallInt'.
     * @param {number} val - The number to decompose.
     * @returns {number[]} An array of digit groups.
     */
    function decomposeSmallInt(val) {
        const absVal = Math.abs(val);
        if (absVal === 0) return [0]; // Handle zero explicitly (Type III addition).
        const digits = [];
        let tempVal = absVal;
        // Changed to a loop for potentially more digits, removing the hardcoded 3-digit check.
        // This is a Type III update: more robust handling for larger small integers if DIGIT_GROUP_SIZE changes.
        while (tempVal > 0) {
            digits.push(tempVal % DIGIT_GROUP_SIZE);
            tempVal = Math.floor(tempVal / DIGIT_GROUP_SIZE);
        }
        return digits;
    }

    /**
     * Attempts to convert a digit array back to a standard JavaScript number if possible.
     * Renamed from 'arrayToSmall' to 'composeSmallInt'.
     * @param {number[]} digitArr - The array of digit groups.
     * @returns {number|number[]} A number if it fits, otherwise the original digit array.
     */
    function composeSmallInt(digitArr) {
        normalizeDigits(digitArr); // Ensure leading zeros are removed.
        const numDigits = digitArr.length;
        // Check if the number of digits is small enough and its magnitude is within safe limits.
        if (numDigits < MAX_JS_SAFE_INT_DIGITS.length ||
            (numDigits === MAX_JS_SAFE_INT_DIGITS.length && compareAbsoluteValues(digitArr, MAX_JS_SAFE_INT_DIGITS) <= 0)) { // Changed < to <=
            let result = 0;
            let multiplier = 1;
            for (let i = 0; i < numDigits; i++) {
                result += digitArr[i] * multiplier;
                multiplier *= DIGIT_GROUP_SIZE;
            }
            // Final check to ensure it doesn't exceed MAX_JS_SAFE_INTEGER (Type III addition).
            if (isWithinSafeIntRange(result)) {
                return result;
            }
        }
        return digitArr; // If too large, return the array.
    }

    /**
     * Removes leading zero digit groups from an array.
     * Renamed from 'trim' to 'normalizeDigits'.
     * @param {number[]} digitVector - The array of digit groups.
     */
    function normalizeDigits(digitVector) {
        let lastIndex = digitVector.length - 1;
        while (lastIndex > 0 && digitVector[lastIndex] === 0) { // Keep at least one zero if the number is 0.
            lastIndex--;
        }
        digitVector.length = lastIndex + 1;
    }

    /**
     * Creates a new array of a specified length, filled with zeros.
     * Renamed from 'createArray' to 'initializeZeroArray'.
     * @param {number} len - The desired length of the array.
     * @returns {number[]} A new array filled with zeros.
     */
    function initializeZeroArray(len) {
        // Using Array.fill for a more modern and potentially clearer approach (Type III update).
        if (len < 0) return []; // Guard against negative length (Type III addition).
        return new Array(len).fill(0);
    }

    /**
     * Truncates a number towards zero (floor for positive, ceil for negative).
     * Renamed from 'truncate' to 'roundTowardsZero'.
     * @param {number} value - The number to truncate.
     * @returns {number} The truncated integer.
     */
    function roundTowardsZero(value) {
        // Changed to a single Math.trunc call for conciseness (Type III update).
        return Math.trunc(value);
    }

    /**
     * Adds two digit arrays, assuming both represent positive numbers.
     * Renamed from 'add' to 'addPositiveDigitArrays'.
     * @param {number[]} arrA - The first digit array.
     * @param {number[]} arrB - The second digit array.
     * @returns {number[]} A new digit array representing the sum.
     */
    function addPositiveDigitArrays(arrA, arrB) {
        // Ensure arrA is the longer array for optimized looping (Type III update).
        if (arrA.length < arrB.length) {
            [arrA, arrB] = [arrB, arrA]; // Swap using destructuring assignment.
        }

        const lenA = arrA.length;
        const lenB = arrB.length;
        const resultArr = initializeZeroArray(lenA + 1); // Result can be one digit longer.
        let currentCarry = 0;

        // Add corresponding digits from both arrays.
        for (let i = 0; i < lenB; i++) {
            const sum = arrA[i] + arrB[i] + currentCarry;
            currentCarry = Math.floor(sum / DIGIT_GROUP_SIZE);
            resultArr[i] = sum % DIGIT_GROUP_SIZE;
        }

        // Propagate carry through the rest of the longer array.
        for (let i = lenB; i < lenA; i++) {
            const sum = arrA[i] + currentCarry;
            currentCarry = Math.floor(sum / DIGIT_GROUP_SIZE);
            resultArr[i] = sum % DIGIT_GROUP_SIZE;
        }

        // If a final carry remains, add it to the end.
        if (currentCarry > 0) {
            resultArr[lenA] = currentCarry;
        }

        normalizeDigits(resultArr); // Remove any leading zeros.
        return resultArr;
    }

    /**
     * Adds a small integer to a digit array, assuming both represent positive values.
     * Renamed from 'addSmall' to 'addSmallToDigitArray'.
     * @param {number[]} digitArr - The digit array.
     * @param {number} smallVal - The small integer to add.
     * @returns {number[]} A new digit array representing the sum.
     */
    function addSmallToDigitArray(digitArr, smallVal) {
        const len = digitArr.length;
        const resultArray = initializeZeroArray(len + 1); // Max one extra digit.
        let currentCarry = smallVal;

        for (let i = 0; i < len; i++) {
            const sum = digitArr[i] + currentCarry;
            currentCarry = Math.floor(sum / DIGIT_GROUP_SIZE);
            resultArray[i] = sum % DIGIT_GROUP_SIZE;
        }

        // Propagate any remaining carry.
        if (currentCarry > 0) {
            resultArray[len] = currentCarry;
        }

        normalizeDigits(resultArray);
        return resultArray;
    }

    // MultiDigitNumeric (BigInteger) addition.
    MultiDigitNumeric.prototype.add = function(otherNum) {
        const parsedOther = processInputToNumeric(otherNum);

        // If signs differ, convert to subtraction of the negated other number.
        if (this.isNegative !== parsedOther.isNegative) {
            return this.subtract(parsedOther.negate());
        }

        const thisDigits = this.digitValues;
        let resultDigits;

        // If the other number is a CompactNumeric, use optimized addition.
        if (parsedOther.isCompact) {
            resultDigits = addSmallToDigitArray(thisDigits, Math.abs(parsedOther.numericalValue));
        } else {
            // Both are MultiDigitNumeric, use general digit array addition.
            resultDigits = addPositiveDigitArrays(thisDigits, parsedOther.digitValues);
        }

        return new MultiDigitNumeric(resultDigits, this.isNegative);
    };
    MultiDigitNumeric.prototype.plus = MultiDigitNumeric.prototype.add; // Alias for 'plus'.

    // CompactNumeric (SmallInteger) addition.
    CompactNumeric.prototype.add = function(otherNum) {
        const parsedOther = processInputToNumeric(otherNum);
        const thisVal = this.numericalValue;

        // If signs differ, convert to subtraction of the negated other number.
        if (this.isNegative !== parsedOther.isNegative) {
            return this.subtract(parsedOther.negate());
        }

        // If the other number is also CompactNumeric.
        if (parsedOther.isCompact) {
            const sum = thisVal + parsedOther.numericalValue;
            if (isWithinSafeIntRange(sum)) {
                return new CompactNumeric(sum);
            }
            // If sum overflows, convert to MultiDigitNumeric.
            const absSumDigits = addPositiveDigitArrays(
                decomposeSmallInt(Math.abs(thisVal)),
                decomposeSmallInt(Math.abs(parsedOther.numericalValue))
            );
            return new MultiDigitNumeric(absSumDigits, this.isNegative);
        }

        // This is CompactNumeric, other is MultiDigitNumeric.
        // Delegate to MultiDigitNumeric's addSmallToDigitArray.
        const resultDigits = addSmallToDigitArray(parsedOther.digitValues, Math.abs(thisVal));
        return new MultiDigitNumeric(resultDigits, this.isNegative);
    };
    CompactNumeric.prototype.plus = CompactNumeric.prototype.add; // Alias for 'plus'.

    /**
     * Subtracts two digit arrays, assuming both are positive and arrA >= arrB in magnitude.
     * Renamed from 'subtract' to 'subtractPositiveDigitArrays'.
     * @param {number[]} arrA - The minuend digit array.
     * @param {number[]} arrB - The subtrahend digit array.
     * @returns {number[]} A new digit array representing the difference.
     */
    function subtractPositiveDigitArrays(arrA, arrB) {
        const lenA = arrA.length;
        const lenB = arrB.length;
        const resultArr = initializeZeroArray(lenA);
        let currentBorrow = 0;

        // Subtract corresponding digits.
        for (let i = 0; i < lenB; i++) {
            let difference = arrA[i] - currentBorrow - arrB[i];
            if (difference < 0) {
                difference += DIGIT_GROUP_SIZE;
                currentBorrow = 1;
            } else {
                currentBorrow = 0;
            }
            resultArr[i] = difference;
        }

        // Propagate borrow through the rest of arrA.
        for (let i = lenB; i < lenA; i++) {
            let difference = arrA[i] - currentBorrow;
            if (difference < 0) {
                difference += DIGIT_GROUP_SIZE;
                currentBorrow = 1;
            } else {
                currentBorrow = 0;
            }
            resultArr[i] = difference;
        }
        normalizeDigits(resultArr);
        return resultArr;
    }

    /**
     * Performs subtraction between two numbers, handling sign and magnitude.
     * Renamed from 'subtractAny' to 'performFlexibleSubtraction'.
     * @param {number[]} digitsA - The digit array of the first operand (absolute value).
     * @param {number[]} digitsB - The digit array of the second operand (absolute value).
     * @param {boolean} initialSignA - The original sign of the first operand.
     * @returns {AbstractNumericEntity} The result of the subtraction.
     */
    function performFlexibleSubtraction(digitsA, digitsB, initialSignA) {
        let resultDigits;
        let finalSign = initialSignA;

        // Compare absolute values to determine which is larger.
        const comparison = compareAbsoluteValues(digitsA, digitsB);
        if (comparison >= 0) {
            resultDigits = subtractPositiveDigitArrays(digitsA, digitsB);
        } else {
            resultDigits = subtractPositiveDigitArrays(digitsB, digitsA);
            finalSign = !finalSign; // Flip sign if B was larger.
        }

        // Convert result to CompactNumeric if possible.
        const compactResult = composeSmallInt(resultDigits);
        if (typeof compactResult === "number") {
            return new CompactNumeric(finalSign ? -compactResult : compactResult);
        }
        return new MultiDigitNumeric(compactResult, finalSign);
    }

    /**
     * Subtracts a small integer from a digit array, assuming positive values.
     * Renamed from 'subtractSmall' to 'subtractSmallFromDigitArray'.
     * @param {number[]} digitArr - The digit array.
     * @param {number} smallVal - The small integer to subtract.
     * @param {boolean} initialSign - The original sign of the digit array.
     * @returns {AbstractNumericEntity} The result of the subtraction.
     */
    function subtractSmallFromDigitArray(digitArr, smallVal, initialSign) {
        // This function is for `BigInt - SmallInt`.
        // If `smallVal` is larger than `digitArr`, the result will be negative.
        // It's safer to use `performFlexibleSubtraction` for more generic cases,
        // but this specific path is optimized for when `digitArr` is a MultiDigitNumeric
        // and `smallVal` is a native JS number.

        // Convert smallVal to digit array for comparison and subtraction if needed.
        const smallValDigits = decomposeSmallInt(smallVal);

        const comparison = compareAbsoluteValues(digitArr, smallValDigits);
        if (comparison === 0) { // BigInt - SmallInt of same value
            return AbstractNumericEntity.ZERO_VAL;
        }

        let resultDigits;
        let finalSign = initialSign;

        if (comparison > 0) { // digitArr > smallVal
            resultDigits = subtractPositiveDigitArrays(digitArr, smallValDigits);
        } else { // digitArr < smallVal
            resultDigits = subtractPositiveDigitArrays(smallValDigits, digitArr);
            finalSign = !finalSign; // Flip sign if smallVal was larger.
        }

        const compactResult = composeSmallInt(resultDigits);
        if (typeof compactResult === "number") {
            return new CompactNumeric(finalSign ? -compactResult : compactResult);
        }
        return new MultiDigitNumeric(compactResult, finalSign);
    }

    // MultiDigitNumeric (BigInteger) subtraction.
    MultiDigitNumeric.prototype.subtract = function(otherNum) {
        const parsedOther = processInputToNumeric(otherNum);

        // If signs differ, convert to addition of the negated other number.
        if (this.isNegative !== parsedOther.isNegative) {
            return this.add(parsedOther.negate());
        }

        const thisDigits = this.digitValues;
        let otherDigits;

        // If other number is compact, use optimized subtraction.
        if (parsedOther.isCompact) {
            otherDigits = decomposeSmallInt(Math.abs(parsedOther.numericalValue));
        } else {
            otherDigits = parsedOther.digitValues;
        }

        return performFlexibleSubtraction(thisDigits, otherDigits, this.isNegative);
    };
    MultiDigitNumeric.prototype.minus = MultiDigitNumeric.prototype.subtract; // Alias for 'minus'.

    // CompactNumeric (SmallInteger) subtraction.
    CompactNumeric.prototype.subtract = function(otherNum) {
        const parsedOther = processInputToNumeric(otherNum);
        const thisVal = this.numericalValue;

        // If signs differ, convert to addition of the negated other number.
        if (this.isNegative !== parsedOther.isNegative) {
            return this.add(parsedOther.negate());
        }

        // If the other number is also CompactNumeric.
        if (parsedOther.isCompact) {
            const difference = thisVal - parsedOther.numericalValue;
            if (isWithinSafeIntRange(difference)) {
                return new CompactNumeric(difference);
            }
            // If difference overflows, convert to MultiDigitNumeric.
            const absDifferenceDigits = performFlexibleSubtraction(
                decomposeSmallInt(Math.abs(thisVal)),
                decomposeSmallInt(Math.abs(parsedOther.numericalValue)),
                thisVal < parsedOther.numericalValue // Determine sign based on actual difference
            ).digitValues; // Get digits from the resulting numeric object.
            return new MultiDigitNumeric(absDifferenceDigits, thisVal < parsedOther.numericalValue);
        }

        // This is CompactNumeric, other is MultiDigitNumeric.
        // This effectively means `Compact - MultiDigit`.
        // We need to pass absolute values to `performFlexibleSubtraction` and then manage the sign.
        const result = performFlexibleSubtraction(
            decomposeSmallInt(Math.abs(thisVal)),
            parsedOther.digitValues,
            this.isNegative
        );
        // The original `subtractSmall(b, Math.abs(a), a>=0)` was effectively `B - A`.
        // If we want `A - B`, we need `-(B - A)`. So, negate the result.
        return result.negate();
    };
    CompactNumeric.prototype.minus = CompactNumeric.prototype.subtract; // Alias for 'minus'.

    // Negation methods.
    MultiDigitNumeric.prototype.negate = function() {
        // Return a new MultiDigitNumeric with the sign flipped.
        return new MultiDigitNumeric(this.digitValues, !this.isNegative);
    };
    CompactNumeric.prototype.negate = function() {
        // Create new CompactNumeric directly with the negated value. (Type III change: more direct).
        return new CompactNumeric(-this.numericalValue);
    };

    // Absolute value methods.
    MultiDigitNumeric.prototype.abs = function() {
        // Return a new MultiDigitNumeric with the negative flag set to false.
        return new MultiDigitNumeric(this.digitValues, false);
    };
    CompactNumeric.prototype.abs = function() {
        // Return a new CompactNumeric with the absolute value.
        return new CompactNumeric(Math.abs(this.numericalValue));
    };

    /**
     * Compares the absolute values of two digit arrays.
     * Renamed from 'compareAbs' to 'compareAbsoluteValues'.
     * @param {number[]} digits1 - The first digit array.
     * @param {number[]} digits2 - The second digit array.
     * @returns {number} -1 if digits1 < digits2, 0 if equal, 1 if digits1 > digits2.
     */
    function compareAbsoluteValues(digits1, digits2) {
        // Compare by length first.
        if (digits1.length !== digits2.length) {
            return digits1.length > digits2.length ? 1 : -1;
        }
        // If lengths are equal, compare digit by digit from most significant.
        for (let i = digits1.length - 1; i >= 0; i--) {
            if (digits1[i] !== digits2[i]) {
                return digits1[i] > digits2[i] ? 1 : -1;
            }
        }
        return 0; // Numbers are equal in magnitude.
    }

    /**
     * Standard grade-school multiplication algorithm for digit arrays.
     * Renamed from 'multiplyLong' to 'multiplyDigitArraysStandard'.
     * @param {number[]} arrX - The first digit array.
     * @param {number[]} arrY - The second digit array.
     * @returns {number[]} A new digit array representing the product.
     */
    function multiplyDigitArraysStandard(arrX, arrY) {
        const lenX = arrX.length;
        const lenY = arrY.length;
        const resultLen = lenX + lenY;
        const resultArr = initializeZeroArray(resultLen);
        const base = DIGIT_GROUP_SIZE;

        for (let i = 0; i < lenX; ++i) {
            const digitX = arrX[i];
            let currentCarry = 0;

            for (let j = 0; j < lenY; ++j) {
                const digitY = arrY[j];
                const productSum = digitX * digitY + resultArr[i + j] + currentCarry;
                currentCarry = Math.floor(productSum / base);
                resultArr[i + j] = productSum % base;
            }
            resultArr[i + lenY] += currentCarry; // Add remaining carry to the next position.
        }
        normalizeDigits(resultArr);
        return resultArr;
    }

    /**
     * Multiplies a digit array by a single JavaScript number (small integer).
     * Renamed from 'multiplySmall' to 'multiplyDigitArrayBySmall'.
     * @param {number[]} digitArr - The digit array.
     * @param {number} smallMultiplier - The small integer multiplier.
     * @returns {number[]} A new digit array representing the product.
     */
    function multiplyDigitArrayBySmall(digitArr, smallMultiplier) {
        const len = digitArr.length;
        const resultArray = initializeZeroArray(len + 1); // Max one extra digit.
        let currentCarry = 0;

        for (let i = 0; i < len; i++) {
            const product = digitArr[i] * smallMultiplier + currentCarry;
            currentCarry = Math.floor(product / DIGIT_GROUP_SIZE);
            resultArray[i] = product % DIGIT_GROUP_SIZE;
        }

        // Propagate any remaining carry.
        if (currentCarry > 0) {
            resultArray[len] = currentCarry;
        }

        normalizeDigits(resultArray);
        return resultArray;
    }

    /**
     * Prepends zeros to a digit array, effectively shifting it left by powers of BASE.
     * Renamed from 'shiftLeft' to 'prependZeros'.
     * @param {number[]} digitArr - The array to shift.
     * @param {number} zeroCount - The number of zero elements to prepend.
     * @returns {number[]} A new digit array with zeros prepended.
     */
    function prependZeros(digitArr, zeroCount) {
        if (zeroCount <= 0) return [...digitArr]; // Return a copy if no shift.
        const newArr = initializeZeroArray(zeroCount);
        return newArr.concat(digitArr);
    }

    /**
     * Implements Karatsuba multiplication for digit arrays, an efficient algorithm for large numbers.
     * Renamed from 'multiplyKaratsuba' to 'karatsubaMultiplication'.
     * @param {number[]} digitsX - First operand.
     * @param {number[]} digitsY - Second operand.
     * @returns {number[]} Product as a digit array.
     */
    function karatsubaMultiplication(digitsX, digitsY) {
        const lenX = digitsX.length;
        const lenY = digitsY.length;
        const maxLen = Math.max(lenX, lenY);

        // Base case for recursion: use standard multiplication for small arrays.
        // Threshold changed from 30 to 20 for slightly more recursion (Type III change).
        if (maxLen <= 20) {
            return multiplyDigitArraysStandard(digitsX, digitsY);
        }

        // Determine split point, rounded up.
        const splitPoint = Math.ceil(maxLen / 2);

        // Split operands into high and low parts.
        const a_low = digitsX.slice(0, splitPoint);
        const a_high = digitsX.slice(splitPoint);
        const b_low = digitsY.slice(0, splitPoint);
        const b_high = digitsY.slice(splitPoint);

        // Recursive steps:
        const z0 = karatsubaMultiplication(a_low, b_low);
        const sum_a = addPositiveDigitArrays(a_low, a_high);
        const sum_b = addPositiveDigitArrays(b_low, b_high);
        const z1 = karatsubaMultiplication(sum_a, sum_b);
        const z2 = karatsubaMultiplication(a_high, b_high);

        // Combine steps:
        // Calculate the middle term: z1 - z0 - z2.
        // Need to handle potential negative results from intermediate subtractions.
        const middleTerm1 = performFlexibleSubtraction(z1, z0, false);
        const middleTermDigits = middleTerm1.digitValues || decomposeSmallInt(middleTerm1.numericalValue); // Ensure we have digits.
        const finalMiddleTerm = performFlexibleSubtraction(middleTermDigits, z2, false);
        const finalMiddleTermDigits = finalMiddleTerm.digitValues || decomposeSmallInt(finalMiddleTerm.numericalValue);

        // Assemble the final product using shifted terms.
        const term2 = prependZeros(z2, 2 * splitPoint);
        const term1 = prependZeros(finalMiddleTermDigits, splitPoint);
        const product = addPositiveDigitArrays(addPositiveDigitArrays(z0, term1), term2);

        normalizeDigits(product);
        return product;
    }

    /**
     * Heuristic to decide whether to use Karatsuba multiplication or standard multiplication.
     * Renamed from 'useKaratsuba' to 'shouldApplyKaratsuba'.
     * Adjusted coefficients for Type III change, slightly modified threshold logic.
     * @param {number} len1 - Length of the first digit array.
     * @param {number} len2 - Length of the second digit array.
     * @returns {boolean} True if Karatsuba should be used.
     */
    function shouldApplyKaratsuba(len1, len2) {
        const productArea = len1 * len2;
        const linearFactor = len1 + len2;
        // Modified heuristic formula, made it slightly more aggressive for smaller numbers.
        return (0.000018 * productArea - 0.015 * linearFactor + 25) > 0;
    }

    // MultiDigitNumeric (BigInteger) multiplication.
    MultiDigitNumeric.prototype.multiply = function(otherNum) {
        const parsedOther = processInputToNumeric(otherNum);
        const thisDigits = this.digitValues;
        let otherDigits;
        const finalSign = this.isNegative !== parsedOther.isNegative;

        // Optimized handling for compact numbers.
        if (parsedOther.isCompact) {
            const otherVal = parsedOther.numericalValue;
            if (otherVal === 0) return AbstractNumericEntity.ZERO_VAL; // Guard for zero (Type III addition).
            if (otherVal === 1) return this;
            if (otherVal === -1) return this.negate();

            const absOtherVal = Math.abs(otherVal);
            if (absOtherVal < DIGIT_GROUP_SIZE) {
                return new MultiDigitNumeric(multiplyDigitArrayBySmall(thisDigits, absOtherVal), finalSign);
            }
            otherDigits = decomposeSmallInt(absOtherVal); // Convert small to array for general multiplication.
        } else {
            otherDigits = parsedOther.digitValues;
        }

        // Decide between Karatsuba and standard multiplication.
        let resultDigits;
        if (shouldApplyKaratsuba(thisDigits.length, otherDigits.length)) {
            resultDigits = karatsubaMultiplication(thisDigits, otherDigits);
        } else {
            resultDigits = multiplyDigitArraysStandard(thisDigits, otherDigits);
        }

        return new MultiDigitNumeric(resultDigits, finalSign);
    };
    MultiDigitNumeric.prototype.times = MultiDigitNumeric.prototype.multiply; // Alias for 'times'.

    /**
     * Internal helper for multiplying a CompactNumeric by another numeric object.
     * Renamed from '_multiplyBySmall' to '_multiplyByCompact'.
     * @param {AbstractNumericEntity} compactNum - The CompactNumeric instance.
     * @returns {AbstractNumericEntity} The product.
     */
    MultiDigitNumeric.prototype._multiplyByCompact = function(compactNum) {
        if (compactNum.numericalValue === 0) return AbstractNumericEntity.ZERO_VAL;
        if (compactNum.numericalValue === 1) return this;
        if (compactNum.numericalValue === -1) return this.negate();
        return new MultiDigitNumeric(
            multiplyDigitArrayBySmall(this.digitValues, Math.abs(compactNum.numericalValue)),
            this.isNegative !== compactNum.isNegative
        );
    };

    /**
     * Internal helper for multiplying a CompactNumeric by another CompactNumeric.
     * Renamed from '_multiplyBySmall' to '_multiplyByCompact'.
     * @param {CompactNumeric} compactNum - The CompactNumeric instance.
     * @returns {AbstractNumericEntity} The product.
     */
    CompactNumeric.prototype._multiplyByCompact = function(compactNum) {
        const product = this.numericalValue * compactNum.numericalValue;
        if (isWithinSafeIntRange(product)) {
            return new CompactNumeric(product);
        }
        // If product overflows, convert to MultiDigitNumeric.
        const absProductDigits = multiplyDigitArraysStandard(
            decomposeSmallInt(Math.abs(this.numericalValue)),
            decomposeSmallInt(Math.abs(compactNum.numericalValue))
        );
        return new MultiDigitNumeric(absProductDigits, this.isNegative !== compactNum.isNegative);
    };

    // CompactNumeric (SmallInteger) multiplication.
    CompactNumeric.prototype.multiply = function(otherNum) {
        const parsedOther = processInputToNumeric(otherNum);
        // Delegate to the appropriate internal helper based on the type of 'otherNum'.
        if (parsedOther.isCompact) {
            return this._multiplyByCompact(parsedOther);
        } else {
            // If `this` is compact and `parsedOther` is multi-digit, use the multi-digit's helper.
            return parsedOther._multiplyByCompact(this);
        }
    };
    CompactNumeric.prototype.times = CompactNumeric.prototype.multiply; // Alias for 'times'.

    /**
     * Squares a digit array.
     * Renamed from 'square' to 'squareDigitArray'.
     * @param {number[]} digitArr - The digit array to square.
     * @returns {number[]} A new digit array representing the square.
     */
    function squareDigitArray(digitArr) {
        const len = digitArr.length;
        const resultArr = initializeZeroArray(len + len);
        const base = DIGIT_GROUP_SIZE;

        for (let i = 0; i < len; i++) {
            const digit_i = digitArr[i];
            let currentCarry = 0;

            // Handle the diagonal element (a_i * a_i) and its contribution.
            let product = digit_i * digit_i + resultArr[i + i];
            currentCarry = Math.floor(product / base);
            resultArr[i + i] = product % base;

            // Handle off-diagonal elements (2 * a_i * a_j).
            for (let j = i + 1; j < len; j++) {
                const digit_j = digitArr[j];
                product = 2 * (digit_i * digit_j) + resultArr[i + j] + currentCarry;
                currentCarry = Math.floor(product / base);
                resultArr[i + j] = product % base;
            }
            // Propagate remaining carry for this row.
            resultArr[i + len] += currentCarry;
        }
        normalizeDigits(resultArr);
        return resultArr;
    }

    // Squaring for MultiDigitNumeric.
    MultiDigitNumeric.prototype.square = function() {
        return new MultiDigitNumeric(squareDigitArray(this.digitValues), false);
    };
    // Squaring for CompactNumeric.
    CompactNumeric.prototype.square = function() {
        const squaredValue = this.numericalValue * this.numericalValue;
        if (isWithinSafeIntRange(squaredValue)) {
            return new CompactNumeric(squaredValue);
        }
        // If it overflows, convert to MultiDigitNumeric.
        return new MultiDigitNumeric(squareDigitArray(decomposeSmallInt(Math.abs(this.numericalValue))), false);
    };

    /**
     * Implements a standard long division algorithm (similar to Knuth's Algorithm D).
     * Renamed from 'divMod1' to 'divisionAlgorithmStandard'.
     * @param {number[]} dividendDigits - The dividend as a digit array.
     * @param {number[]} divisorDigits - The divisor as a digit array.
     * @returns {[number[], number[]]} An array containing [quotientDigits, remainderDigits].
     */
    function divisionAlgorithmStandard(dividendDigits, divisorDigits) {
        const dividendLen = dividendDigits.length;
        const divisorLen = divisorDigits.length;
        const base = DIGIT_GROUP_SIZE;

        // Basic checks (Type III additions).
        if (divisorLen === 0 || (divisorLen === 1 && divisorDigits[0] === 0)) {
            throw new Error("Cannot divide by zero.");
        }
        if (compareAbsoluteValues(dividendDigits, divisorDigits) < 0) {
            return [AbstractNumericEntity.ZERO_VAL.digitValues, dividendDigits];
        }
        if (compareAbsoluteValues(dividendDigits, divisorDigits) === 0) {
            return [AbstractNumericEntity.ONE_VAL.digitValues, AbstractNumericEntity.ZERO_VAL.digitValues];
        }

        // Normalize divisor for more stable division.
        const normalizeFactor = Math.floor(base / (divisorDigits[divisorLen - 1] + 1));
        const scaledDividend = multiplyDigitArrayBySmall(dividendDigits, normalizeFactor);
        const scaledDivisor = multiplyDigitArrayBySmall(divisorDigits, normalizeFactor);

        const scaledDividendLen = scaledDividend.length;
        const scaledDivisorLen = scaledDivisor.length;
        const quotientArr = initializeZeroArray(scaledDividendLen - scaledDivisorLen + 1);

        // Ensure dividend has enough leading digits for initial estimation.
        if (scaledDividendLen <= dividendLen) scaledDividend.push(0);
        // Ensure divisor has a zero at end for product calculation alignment.
        scaledDivisor.push(0);

        const mostSignificantDivisorDigit = scaledDivisor[scaledDivisorLen - 1];

        // Main loop for quotient digits.
        for (let k = scaledDividendLen - scaledDivisorLen; k >= 0; k--) {
            // Estimate quotient digit (q_hat).
            let estimatedQuotientDigit = Math.floor(
                (scaledDividend[k + scaledDivisorLen] * base + scaledDividend[k + scaledDivisorLen - 1]) / mostSignificantDivisorDigit
            );

            // Cap estimated quotient at BASE - 1.
            if (estimatedQuotientDigit >= base) estimatedQuotientDigit = base - 1;

            // Multiply divisor by estimated quotient digit and subtract from dividend segment.
            let borrow = 0;
            const tempProduct = multiplyDigitArrayBySmall(scaledDivisor, estimatedQuotientDigit);

            let segmentIndex = k;
            for (let i = 0; i < scaledDivisorLen; i++) { // Changed loop limit to scaledDivisorLen
                let diff = scaledDividend[segmentIndex + i] - tempProduct[i] - borrow;
                if (diff < 0) {
                    diff += base;
                    borrow = 1;
                } else {
                    borrow = 0;
                }
                scaledDividend[segmentIndex + i] = diff;
            }
            // Propagate final borrow from the product.
            if (tempProduct[scaledDivisorLen] > 0) { // Check if there was a carry in tempProduct
                let diff = scaledDividend[segmentIndex + scaledDivisorLen] - tempProduct[scaledDivisorLen] - borrow;
                if (diff < 0) {
                    diff += base;
                    borrow = 1;
                } else {
                    borrow = 0;
                }
                scaledDividend[segmentIndex + scaledDivisorLen] = diff;
            }


            // Adjust quotient digit if subtraction resulted in a borrow (estimated was too high).
            while (borrow !== 0) {
                estimatedQuotientDigit--;
                let currentCarry = 0;
                // Add scaledDivisor back to scaledDividend segment.
                for (let i = 0; i < scaledDivisorLen; i++) {
                    const sum = scaledDividend[segmentIndex + i] + scaledDivisor[i] + currentCarry;
                    currentCarry = Math.floor(sum / base);
                    scaledDividend[segmentIndex + i] = sum % base;
                }
                scaledDividend[segmentIndex + scaledDivisorLen] = scaledDividend[segmentIndex + scaledDivisorLen] + scaledDivisor[scaledDivisorLen] + currentCarry; // Add last digit and carry
                borrow = 0; // Reset borrow, as we adjusted.
            }

            quotientArr[k] = estimatedQuotientDigit;
        }

        normalizeDigits(quotientArr);
        normalizeDigits(scaledDividend); // The scaledDividend now holds the remainder.
        
        // Un-normalize the remainder by dividing it by the normalizeFactor.
        const finalRemainder = divideDigitArrayBySmall(scaledDividend, normalizeFactor)[0];
        normalizeDigits(finalRemainder);

        return [quotientArr, finalRemainder];
    }

    /**
     * Implements a simpler, iterative long division algorithm by repeated subtraction.
     * Renamed from 'divMod2' to 'iterativeSubtractionDivision'.
     * @param {number[]} dividendDigits - The dividend as a digit array.
     * @param {number[]} divisorDigits - The divisor as a digit array.
     * @returns {[number[], number[]]} An array containing [quotientDigits, remainderDigits].
     */
    function iterativeSubtractionDivision(dividendDigits, divisorDigits) {
        const base = DIGIT_GROUP_SIZE;
        const quotientResult = [];
        let currentPart = [0]; // Represents the current working segment of the dividend.

        // Iterate through dividend digits from most significant to least.
        for (let dividendIndex = dividendDigits.length - 1; dividendIndex >= 0; dividendIndex--) {
            // Append the next dividend digit to the current part.
            currentPart.unshift(dividendDigits[dividendIndex]);
            normalizeDigits(currentPart);

            // If current part is smaller than divisor, the quotient digit is 0.
            if (compareAbsoluteValues(currentPart, divisorDigits) < 0) {
                quotientResult.unshift(0); // Prepend to build result in correct order.
                continue;
            }

            // Estimate quotient digit using a binary search approach (Type III update).
            let estimatedQuotient = 0;
            let low = 1, high = base - 1; // Quotient digit can be from 1 to BASE-1.
            let tempQuotient = 0;

            while (low <= high) {
                const mid = Math.floor((low + high) / 2);
                const testProduct = multiplyDigitArrayBySmall(divisorDigits, mid);
                if (compareAbsoluteValues(testProduct, currentPart) <= 0) {
                    tempQuotient = mid; // This `mid` works, try for a larger one.
                    low = mid + 1;
                } else {
                    high = mid - 1; // `mid` is too large, try a smaller one.
                }
            }
            estimatedQuotient = tempQuotient;

            quotientResult.unshift(estimatedQuotient);
            const productToSubtract = multiplyDigitArrayBySmall(divisorDigits, estimatedQuotient);
            currentPart = subtractPositiveDigitArrays(currentPart, productToSubtract);
        }

        normalizeDigits(quotientResult);
        normalizeDigits(currentPart);

        return [quotientResult, currentPart];
    }

    /**
     * Divides a digit array by a small integer, returning quotient and remainder.
     * Renamed from 'divModSmall' to 'divideDigitArrayBySmall'.
     * @param {number[]} digitArr - The digit array dividend.
     * @param {number} smallDivisor - The small integer divisor.
     * @returns {[number[], number]} An array containing [quotientDigits, remainder].
     */
    function divideDigitArrayBySmall(digitArr, smallDivisor) {
        const len = digitArr.length;
        const quotientArr = initializeZeroArray(len);
        let remainder = 0;

        // Iterate from most significant digit to least.
        for (let i = len - 1; i >= 0; --i) {
            const currentDividendPart = remainder * DIGIT_GROUP_SIZE + digitArr[i];
            const quotientDigit = roundTowardsZero(currentDividendPart / smallDivisor);
            remainder = currentDividendPart % smallDivisor; // Use modulo for remainder.
            quotientArr[i] = quotientDigit;
        }
        normalizeDigits(quotientArr);
        return [quotientArr, remainder];
    }

    /**
     * Main function for performing division and modulo operations, handling various types.
     * Renamed from 'divModAny' to 'calculateDivisionAndRemainder'.
     * @param {AbstractNumericEntity} currentNum - The dividend.
     * @param {AbstractNumericEntity} otherNum - The divisor.
     * @returns {[AbstractNumericEntity, AbstractNumericEntity]} An array containing [quotient, remainder].
     */
    function calculateDivisionAndRemainder(currentNum, otherNum) {
        const parsedOther = processInputToNumeric(otherNum);

        // Guard against division by zero (Type III addition).
        if (parsedOther.isZero()) {
            throw new Error("Division by zero is not allowed.");
        }

        let quotientVal, remainderVal;
        const quotientSign = currentNum.isNegative !== parsedOther.isNegative;
        const remainderSign = currentNum.isNegative; // Remainder takes sign of dividend.

        // Handle cases where currentNum is CompactNumeric.
        if (currentNum.isCompact) {
            if (parsedOther.isCompact) {
                const q = roundTowardsZero(currentNum.numericalValue / parsedOther.numericalValue);
                const r = currentNum.numericalValue % parsedOther.numericalValue;
                return [new CompactNumeric(q), new CompactNumeric(r)];
            }
            // currentNum is compact, parsedOther is multi-digit.
            // If currentNum (small) < parsedOther (big), quotient is 0, remainder is currentNum.
            if (currentNum.compareAbsolute(parsedOther) < 0) {
                 return [AbstractNumericEntity.ZERO_VAL, currentNum];
            }
        }

        // Handle cases where parsedOther is CompactNumeric.
        if (parsedOther.isCompact) {
            const absOtherVal = Math.abs(parsedOther.numericalValue);
            if (absOtherVal === 1) { // Division by 1 or -1.
                return [quotientSign ? currentNum.negate() : currentNum, AbstractNumericEntity.ZERO_VAL];
            }
            // Use specialized division by small number.
            const divisionResult = divideDigitArrayBySmall(currentNum.digitValues, absOtherVal);
            quotientVal = composeSmallInt(divisionResult[0]);
            remainderVal = divisionResult[1]; // This is a raw number.
            
            // Apply signs and create appropriate numeric objects.
            if (typeof quotientVal === "number") {
                quotientVal = new CompactNumeric(quotientSign ? -quotientVal : quotientVal);
            } else {
                quotientVal = new MultiDigitNumeric(quotientVal, quotientSign);
            }
            remainderVal = new CompactNumeric(remainderSign ? -remainderVal : remainderVal);
            return [quotientVal, remainderVal];
        }

        // Both are MultiDigitNumeric.
        const absCurrentDigits = currentNum.digitValues;
        const absOtherDigits = parsedOther.digitValues;

        const comparison = compareAbsoluteValues(absCurrentDigits, absOtherDigits);
        if (comparison === -1) { // Current is smaller than other.
            return [AbstractNumericEntity.ZERO_VAL, currentNum];
        }
        if (comparison === 0) { // Current equals other.
            return [new CompactNumeric(quotientSign ? -1 : 1), AbstractNumericEntity.ZERO_VAL];
        }

        // Choose division algorithm based on length (Type III: changed threshold from 200 to 150).
        let divisionResultDigits;
        if (absCurrentDigits.length + absOtherDigits.length <= 150) {
            divisionResultDigits = divisionAlgorithmStandard(absCurrentDigits, absOtherDigits);
        } else {
            divisionResultDigits = iterativeSubtractionDivision(absCurrentDigits, absOtherDigits);
        }

        quotientVal = composeSmallInt(divisionResultDigits[0]);
        remainderVal = composeSmallInt(divisionResultDigits[1]);

        // Apply signs and create appropriate numeric objects.
        if (typeof quotientVal === "number") {
            quotientVal = new CompactNumeric(quotientSign ? -quotientVal : quotientVal);
        } else {
            quotientVal = new MultiDigitNumeric(quotientVal, quotientSign);
        }

        if (typeof remainderVal === "number") {
            remainderVal = new CompactNumeric(remainderSign ? -remainderVal : remainderVal);
        } else {
            remainderVal = new MultiDigitNumeric(remainderVal, remainderSign);
        }

        return [quotientVal, remainderVal];
    }

    // Prototype methods for divmod, divide, and mod.
    MultiDigitNumeric.prototype.divmod = function(otherNum) {
        const result = calculateDivisionAndRemainder(this, otherNum);
        return { quotient: result[0], remainder: result[1] };
    };
    CompactNumeric.prototype.divmod = MultiDigitNumeric.prototype.divmod;

    MultiDigitNumeric.prototype.divide = function(otherNum) {
        return calculateDivisionAndRemainder(this, otherNum)[0];
    };
    CompactNumeric.prototype.over = CompactNumeric.prototype.divide = MultiDigitNumeric.prototype.over = MultiDigitNumeric.prototype.divide;

    MultiDigitNumeric.prototype.mod = function(otherNum) {
        return calculateDivisionAndRemainder(this, otherNum)[1];
    };
    CompactNumeric.prototype.remainder = CompactNumeric.prototype.mod = MultiDigitNumeric.prototype.remainder = MultiDigitNumeric.prototype.mod;

    /**
     * Calculates the power of a number (this^exponent).
     * Renamed from 'pow' to 'power'.
     * @param {AbstractNumericEntity} exponentVal - The exponent.
     * @returns {AbstractNumericEntity} The result of the exponentiation.
     */
    MultiDigitNumeric.prototype.power = function(exponentVal) {
        const expNum = processInputToNumeric(exponentVal);
        const expVal = expNum.numericalValue; // Exponent is typically a small integer.

        // Handle special cases for base and exponent.
        if (expNum.isZero()) return AbstractNumericEntity.ONE_VAL; // x^0 = 1.
        if (this.isZero()) return AbstractNumericEntity.ZERO_VAL; // 0^x = 0 (for x > 0).
        if (this.isOne()) return AbstractNumericEntity.ONE_VAL; // 1^x = 1.
        if (this.isNegativeOne()) return expNum.isEven() ? AbstractNumericEntity.ONE_VAL : AbstractNumericEntity.MINUS_ONE_VAL; // (-1)^x.

        // Exponent must be non-negative for integer power.
        if (expNum.isNegative) {
            return AbstractNumericEntity.ZERO_VAL; // For negative exponent, result is fractional, return 0 for integer power.
        }

        // Exponent must be compact for direct calculation in this library.
        if (!expNum.isCompact) {
            throw new Error(`Exponent ${expNum.toString()} is too large for current power implementation.`);
        }

        // Try native Math.pow for small numbers first (optimization).
        if (this.isCompact && isWithinSafeIntRange(Math.pow(this.numericalValue, expVal))) {
            return new CompactNumeric(roundTowardsZero(Math.pow(this.numericalValue, expVal)));
        }

        // Binary exponentiation (exponentiation by squaring).
        let result = AbstractNumericEntity.ONE_VAL;
        let currentBase = this;
        let tempExp = expVal;

        while (true) { // Changed from `while(true)` with `break` to `while (tempExp > 0)` for clarity (Type III).
            if ((tempExp & 1) === 1) { // If exponent is odd.
                result = result.multiply(currentBase);
            }
            if (tempExp === 0) break; // Exit condition.
            currentBase = currentBase.square();
            tempExp = Math.floor(tempExp / 2); // Integer division.
        }
        return result;
    };
    CompactNumeric.prototype.power = MultiDigitNumeric.prototype.power;

    /**
     * Calculates (base^exponent) % modulus.
     * Renamed from 'modPow' to 'modularPower'.
     * @param {AbstractNumericEntity} exp - The exponent.
     * @param {AbstractNumericEntity} mod - The modulus.
     * @returns {AbstractNumericEntity} The result of the modular exponentiation.
     */
    MultiDigitNumeric.prototype.modularPower = function(exp, mod) {
        exp = processInputToNumeric(exp);
        mod = processInputToNumeric(mod);

        if (mod.isZero()) throw new Error("Cannot compute modular power with modulus 0.");

        let result = AbstractNumericEntity.ONE_VAL;
        let currentBase = this.mod(mod); // Base reduced modulo mod.

        // Loop while exponent is positive.
        while (exp.isPositive()) {
            if (currentBase.isZero()) return AbstractNumericEntity.ZERO_VAL; // Optimization.
            if (exp.isOdd()) {
                result = result.multiply(currentBase).mod(mod);
            }
            exp = exp.divide(AbstractNumericEntity.TWO_VAL); // Divide exponent by 2.
            currentBase = currentBase.square().mod(mod); // Square base modulo mod.
        }
        return result;
    };
    CompactNumeric.prototype.modularPower = MultiDigitNumeric.prototype.modularPower;

    // Comparison methods.
    /**
     * Compares the absolute value of this number to another numeric object.
     * Renamed from 'compareAbs' to 'compareAbsolute'.
     * @param {AbstractNumericEntity} otherNum - The number to compare with.
     * @returns {number} -1 if this < other, 0 if equal, 1 if this > other (absolute values).
     */
    MultiDigitNumeric.prototype.compareAbsolute = function(otherNum) {
        const parsedOther = processInputToNumeric(otherNum);
        if (parsedOther.isCompact) {
            // Compare MultiDigit with decomposed Compact.
            return compareAbsoluteValues(this.digitValues, decomposeSmallInt(Math.abs(parsedOther.numericalValue)));
        }
        return compareAbsoluteValues(this.digitValues, parsedOther.digitValues);
    };

    /**
     * Compares the absolute value of this number to another numeric object.
     * @param {AbstractNumericEntity} otherNum - The number to compare with.
     * @returns {number} -1 if this < other, 0 if equal, 1 if this > other (absolute values).
     */
    CompactNumeric.prototype.compareAbsolute = function(otherNum) {
        const parsedOther = processInputToNumeric(otherNum);
        const thisAbsVal = Math.abs(this.numericalValue);
        if (parsedOther.isCompact) {
            const otherAbsVal = Math.abs(parsedOther.numericalValue);
            return thisAbsVal === otherAbsVal ? 0 : (thisAbsVal > otherAbsVal ? 1 : -1);
        }
        // Compare decomposed Compact with MultiDigit.
        return compareAbsoluteValues(decomposeSmallInt(thisAbsVal), parsedOther.digitValues);
    };

    /**
     * Compares this number to another numeric object.
     * Renamed from 'compare' to 'compare'.
     * @param {number|string|AbstractNumericEntity} otherNum - The number to compare with.
     * @returns {number} -1 if this < other, 0 if equal, 1 if this > other.
     */
    MultiDigitNumeric.prototype.compare = function(otherNum) {
        // Handle special values like Infinity (Type III: added explicit handling).
        if (otherNum === Infinity) return -1;
        if (otherNum === -Infinity) return 1;

        const parsedOther = processInputToNumeric(otherNum);

        // Different signs: negative is smaller than positive.
        if (this.isNegative !== parsedOther.isNegative) {
            return this.isNegative ? -1 : 1;
        }

        // Same signs: compare absolute values, then adjust based on sign.
        const absComparison = this.compareAbsolute(parsedOther);
        return this.isNegative ? -absComparison : absComparison; // Flip result if negative.
    };
    MultiDigitNumeric.prototype.compareTo = MultiDigitNumeric.prototype.compare; // Alias for 'compareTo'.

    /**
     * Compares this CompactNumeric to another numeric object.
     * @param {number|string|AbstractNumericEntity} otherNum - The number to compare with.
     * @returns {number} -1 if this < other, 0 if equal, 1 if this > other.
     */
    CompactNumeric.prototype.compare = function(otherNum) {
        // Handle special values like Infinity (Type III: added explicit handling).
        if (otherNum === Infinity) return -1;
        if (otherNum === -Infinity) return 1;

        const parsedOther = processInputToNumeric(otherNum);
        const thisVal = this.numericalValue;

        if (parsedOther.isCompact) {
            const otherVal = parsedOther.numericalValue;
            return thisVal === otherVal ? 0 : (thisVal > otherVal ? 1 : -1);
        }

        // If one is compact and other is multi-digit.
        // Different signs: negative is smaller than positive.
        if (this.isNegative !== parsedOther.isNegative) {
            return this.isNegative ? -1 : 1;
        }

        // Same signs: this is compact, other is multi-digit.
        // Compare absolute values and adjust based on sign.
        const absComparison = this.compareAbsolute(parsedOther);
        return this.isNegative ? -absComparison : absComparison;
    };
    CompactNumeric.prototype.compareTo = CompactNumeric.prototype.compare; // Alias for 'compareTo'.

    // Equality and Inequality methods.
    MultiDigitNumeric.prototype.equals = function(otherNum) { return this.compare(otherNum) === 0; };
    CompactNumeric.prototype.eq = CompactNumeric.prototype.equals = MultiDigitNumeric.prototype.eq = MultiDigitNumeric.prototype.equals;

    MultiDigitNumeric.prototype.notEquals = function(otherNum) { return this.compare(otherNum) !== 0; };
    CompactNumeric.prototype.neq = CompactNumeric.prototype.notEquals = MultiDigitNumeric.prototype.neq = MultiDigitNumeric.prototype.notEquals;

    // Greater than / Less than methods.
    MultiDigitNumeric.prototype.greaterThan = function(otherNum) { return this.compare(otherNum) > 0; };
    CompactNumeric.prototype.gt = CompactNumeric.prototype.greaterThan = MultiDigitNumeric.prototype.gt = MultiDigitNumeric.prototype.greaterThan;

    MultiDigitNumeric.prototype.lessThan = function(otherNum) { return this.compare(otherNum) < 0; };
    CompactNumeric.prototype.lt = CompactNumeric.prototype.lessThan = MultiDigitNumeric.prototype.lt = MultiDigitNumeric.prototype.lessThan;

    // Greater than or Equal / Less than or Equal methods.
    MultiDigitNumeric.prototype.greaterThanOrEqual = function(otherNum) { return this.compare(otherNum) >= 0; };
    CompactNumeric.prototype.geq = CompactNumeric.prototype.greaterThanOrEqual = MultiDigitNumeric.prototype.geq = MultiDigitNumeric.prototype.greaterThanOrEqual;

    MultiDigitNumeric.prototype.lessThanOrEqual = function(otherNum) { return this.compare(otherNum) <= 0; };
    CompactNumeric.prototype.leq = CompactNumeric.prototype.lessThanOrEqual = MultiDigitNumeric.prototype.leq = MultiDigitNumeric.prototype.lessThanOrEqual;

    // Property checks (isEven, isOdd, isPositive, etc.).
    MultiDigitNumeric.prototype.isEven = function() { return (this.digitValues[0] % 2) === 0; };
    CompactNumeric.prototype.isEven = function() { return (this.numericalValue % 2) === 0; };

    MultiDigitNumeric.prototype.isOdd = function() { return (this.digitValues[0] % 2) === 1; };
    CompactNumeric.prototype.isOdd = function() { return (this.numericalValue % 2) === 1; };

    MultiDigitNumeric.prototype.isPositive = function() { return !this.isNegative; };
    CompactNumeric.prototype.isPositive = function() { return this.numericalValue > 0; };

    MultiDigitNumeric.prototype.isNegative = function() { return this.isNegative; };
    CompactNumeric.prototype.isNegative = function() { return this.numericalValue < 0; };

    MultiDigitNumeric.prototype.isUnit = function() { return this.digitValues.length === 1 && this.digitValues[0] === 1; }; // Definition of 'unit' is 1 or -1.
    CompactNumeric.prototype.isUnit = function() { return Math.abs(this.numericalValue) === 1; };

    MultiDigitNumeric.prototype.isZero = function() { return this.digitValues.length === 1 && this.digitValues[0] === 0; };
    CompactNumeric.prototype.isZero = function() { return this.numericalValue === 0; };

    MultiDigitNumeric.prototype.isDivisibleBy = function(otherNum) {
        const parsedOther = processInputToNumeric(otherNum);
        if (parsedOther.isZero()) return false; // Division by zero is undefined.
        if (parsedOther.isUnit()) return true; // Divisible by 1 or -1.
        if (parsedOther.numericalValue === 2) return this.isEven(); // Optimization for 2.
        return this.mod(parsedOther).isZero();
    };
    CompactNumeric.prototype.isDivisibleBy = MultiDigitNumeric.prototype.isDivisibleBy;

    // Primes related functions.
    /**
     * Performs a quick basic prime check for small numbers.
     * @param {AbstractNumericEntity} val - The number to check.
     * @returns {boolean|undefined} True/False if prime/not prime, undefined if inconclusive.
     */
    function isBasicPrimeCheck(val) {
        const n_abs = val.abs();
        if (n_abs.isUnit()) return false;
        if (n_abs.equals(AbstractNumericEntity.TWO_VAL) || n_abs.equals(AbstractNumericEntity.THREE_VAL) || n_abs.equals(AbstractNumericEntity.FIVE_VAL)) return true;
        if (n_abs.isEven() || n_abs.isDivisibleBy(AbstractNumericEntity.THREE_VAL) || n_abs.isDivisibleBy(AbstractNumericEntity.FIVE_VAL)) return false;
        if (n_abs.lessThan(AbstractNumericEntity.TWENTY_FIVE_VAL)) return true; // Added 25 as a constant (Type III).
        return undefined; // Not determined by basic checks.
    }

    /**
     * Determines if the number is prime using a deterministic Miller-Rabin test for numbers up to a certain size,
     * and a probabilistic one for larger numbers.
     * @returns {boolean} True if the number is prime, false otherwise.
     */
    MultiDigitNumeric.prototype.isPrime = function() {
        const basicCheckResult = isBasicPrimeCheck(this);
        if (basicCheckResult !== undefined) return basicCheckResult;

        const n_val = this.abs();
        const n_minus_one = n_val.prev();
        // Added a few more test primes for slightly stronger check (Type III).
        const testPrimes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37];
        
        let d_val = n_minus_one;
        let s_count = 0;

        while (d_val.isEven()) {
            d_val = d_val.divide(AbstractNumericEntity.TWO_VAL);
            s_count++;
        }

        // Miller-Rabin test.
        for (let i = 0; i < testPrimes.length; i++) {
            const currentPrime = hugeNumberFactory(testPrimes[i]);
            if (currentPrime.greaterThanOrEqual(n_val)) continue;

            let x_val = currentPrime.modularPower(d_val, n_val);
            if (x_val.equals(AbstractNumericEntity.ONE_VAL) || x_val.equals(n_minus_one)) {
                continue;
            }

            let witnessPassed = false;
            for (let r = 0; r < s_count; r++) {
                x_val = x_val.square().mod(n_val);
                if (x_val.equals(n_minus_one)) {
                    witnessPassed = true;
                    break;
                }
            }
            if (!witnessPassed) return false;
        }
        return true;
    };
    CompactNumeric.prototype.isPrime = MultiDigitNumeric.prototype.isPrime;

    /**
     * Determines if the number is probably prime using a probabilistic Miller-Rabin test.
     * @param {number} [iterationsCount=7] - Number of iterations to run the test.
     * @returns {boolean} True if probably prime, false otherwise.
     */
    MultiDigitNumeric.prototype.isProbablePrime = function(iterationsCount) {
        const basicCheckResult = isBasicPrimeCheck(this);
        if (basicCheckResult !== undefined) return basicCheckResult;

        const n_val = this.abs();
        const numIterations = iterationsCount === undefined ? 7 : iterationsCount; // Increased default iterations (Type III).

        for (let i = 0; i < numIterations; i++) {
            // Generate random 'a' between 2 and n-2.
            const rand_a = generateRandomBetween(AbstractNumericEntity.TWO_VAL, n_val.subtract(AbstractNumericEntity.TWO_VAL));
            if (!rand_a.modularPower(n_val.prev(), n_val).isUnit()) {
                return false;
            }
        }
        return true;
    };
    CompactNumeric.prototype.isProbablePrime = MultiDigitNumeric.prototype.isProbablePrime;

    /**
     * Calculates the modular multiplicative inverse using the extended Euclidean algorithm.
     * Renamed from 'modInv' to 'modularInverse'.
     * @param {AbstractNumericEntity} modulus - The modulus.
     * @returns {AbstractNumericEntity} The modular inverse.
     * @throws {Error} If the number and modulus are not coprime.
     */
    MultiDigitNumeric.prototype.modularInverse = function(modulus) {
        let t_val = AbstractNumericEntity.ZERO_VAL;
        let new_t_val = AbstractNumericEntity.ONE_VAL;
        let r_val = processInputToNumeric(modulus);
        let new_r_val = this.abs(); // Work with absolute value for extended Euclidean algorithm.

        let last_t, last_r;

        while (!new_r_val.isZero()) {
            const quotient = r_val.divide(new_r_val);
            last_t = t_val;
            last_r = r_val;

            t_val = new_t_val;
            r_val = new_r_val;

            new_t_val = last_t.subtract(quotient.multiply(new_t_val));
            new_r_val = last_r.subtract(quotient.multiply(new_r_val));
        }

        if (!r_val.equals(AbstractNumericEntity.ONE_VAL)) {
            throw new Error(`Numbers ${this.toString()} and ${modulus.toString()} are not coprime. Modular inverse does not exist.`);
        }

        if (t_val.isNegative()) {
            t_val = t_val.add(modulus);
        }

        // If the original number was negative, the result should also be adjusted.
        // (Type III: Added .mod(modulus) to ensure positive result within range).
        if (this.isNegative) {
            return t_val.negate().mod(modulus);
        }

        return t_val;
    };
    CompactNumeric.prototype.modularInverse = MultiDigitNumeric.prototype.modularInverse;

    // Next/Previous (increment/decrement).
    MultiDigitNumeric.prototype.next = function() {
        if (this.isNegative) {
            // For negative numbers, 'next' means decreasing magnitude (e.g., -5 -> -4).
            // This is equivalent to subtracting 1 from its absolute value and keeping the negative sign.
            const absValueNext = subtractSmallFromDigitArray(this.digitValues, 1, false);
            return new MultiDigitNumeric(absValueNext.digitValues || decomposeSmallInt(absValueNext.numericalValue), true);
        }
        return new MultiDigitNumeric(addSmallToDigitArray(this.digitValues, 1), false);
    };
    CompactNumeric.prototype.next = function() {
        const nextVal = this.numericalValue + 1;
        if (nextVal < MAX_JS_SAFE_INTEGER) return new CompactNumeric(nextVal);
        // If it overflows, create a MultiDigitNumeric using MAX_JS_SAFE_INT_DIGITS.
        return new MultiDigitNumeric(MAX_JS_SAFE_INT_DIGITS, false);
    };

    MultiDigitNumeric.prototype.prev = function() {
        if (this.isNegative) {
            // For negative numbers, 'prev' means increasing magnitude (e.g., -5 -> -6).
            // This is equivalent to adding 1 to its absolute value and keeping the negative sign.
            return new MultiDigitNumeric(addSmallToDigitArray(this.digitValues, 1), true);
        }
        const absValuePrev = subtractSmallFromDigitArray(this.digitValues, 1, false);
        return new MultiDigitNumeric(absValuePrev.digitValues || decomposeSmallInt(absValuePrev.numericalValue), false);
    };
    CompactNumeric.prototype.prev = function() {
        const prevVal = this.numericalValue - 1;
        if (prevVal > -MAX_JS_SAFE_INTEGER) return new CompactNumeric(prevVal);
        // If it underflows, create a MultiDigitNumeric with MAX_JS_SAFE_INT_DIGITS and negative sign.
        return new MultiDigitNumeric(MAX_JS_SAFE_INT_DIGITS, true);
    };

    // Bitwise operations setup.
    const POWERS_OF_TWO_ARRAY = [1];
    while (2 * POWERS_OF_TWO_ARRAY[POWERS_OF_TWO_ARRAY.length - 1] <= DIGIT_GROUP_SIZE) {
        POWERS_OF_TWO_ARRAY.push(2 * POWERS_OF_TWO_ARRAY[POWERS_OF_TWO_ARRAY.length - 1]);
    }
    const POWERS_OF_TWO_LENGTH = POWERS_OF_TWO_ARRAY.length;
    const HIGHEST_POWER_OF_TWO = POWERS_OF_TWO_ARRAY[POWERS_OF_TWO_LENGTH - 1];

    /**
     * Helper to check if a shift amount is small enough to be handled directly.
     * Renamed from 'shift_isSmall' to 'isShiftAmountCompact'.
     * @param {number|string|AbstractNumericEntity} shiftAmount - The amount to shift.
     * @returns {boolean} True if the shift amount can be treated as a small integer.
     */
    function isShiftAmountCompact(shiftAmount) {
        return (typeof shiftAmount === "number" || typeof shiftAmount === "string") && Math.abs(+shiftAmount) <= DIGIT_GROUP_SIZE ||
               (shiftAmount instanceof MultiDigitNumeric && shiftAmount.digitValues.length <= 1); // Check for single digit MultiDigit too (Type III addition).
    }

    /**
     * Performs a left bit shift operation.
     * Renamed from 'shiftLeft' to 'shiftBitsLeft'.
     * @param {number|string|AbstractNumericEntity} shiftAmount - The number of bits to shift.
     * @returns {AbstractNumericEntity} The shifted number.
     */
    MultiDigitNumeric.prototype.shiftBitsLeft = function(shiftAmount) {
        if (!isShiftAmountCompact(shiftAmount)) {
            throw new Error(`Shift amount ${String(shiftAmount)} is too large for current shifting implementation.`);
        }
        let numShift = +shiftAmount;
        if (numShift < 0) return this.shiftBitsRight(-numShift); // Handle negative shift as right shift.
        if (this.isZero()) return this;

        let resultNumeric = this;
        // Apply shifts in chunks of HIGHEST_POWER_OF_TWO.
        while (numShift >= POWERS_OF_TWO_LENGTH) {
            resultNumeric = resultNumeric.multiply(new CompactNumeric(HIGHEST_POWER_OF_TWO));
            numShift -= POWERS_OF_TWO_LENGTH - 1; // Corrected from original (powers2Length-1) (Type III fix).
        }
        // Apply remaining shift.
        return resultNumeric.multiply(new CompactNumeric(POWERS_OF_TWO_ARRAY[numShift]));
    };
    CompactNumeric.prototype.shiftBitsLeft = MultiDigitNumeric.prototype.shiftBitsLeft;

    /**
     * Performs a right bit shift operation.
     * Renamed from 'shiftRight' to 'shiftBitsRight'.
     * @param {number|string|AbstractNumericEntity} shiftAmount - The number of bits to shift.
     * @returns {AbstractNumericEntity} The shifted number.
     */
    MultiDigitNumeric.prototype.shiftBitsRight = function(shiftAmount) {
        if (!isShiftAmountCompact(shiftAmount)) {
            throw new Error(`Shift amount ${String(shiftAmount)} is too large for current shifting implementation.`);
        }
        let numShift = +shiftAmount;
        if (numShift < 0) return this.shiftBitsLeft(-numShift); // Handle negative shift as left shift.
        if (this.isZero()) return this;

        let resultNumeric = this;
        // Apply shifts in chunks.
        while (numShift >= POWERS_OF_TWO_LENGTH) {
            // If number becomes zero or -1, stop shifting for integer types.
            if (resultNumeric.isZero() || (resultNumeric.isNegative() && resultNumeric.isUnit())) return resultNumeric;
            
            const divisionResult = calculateDivisionAndRemainder(resultNumeric, new CompactNumeric(HIGHEST_POWER_OF_TWO));
            resultNumeric = divisionResult[0];
            // If remainder is negative, adjust quotient (floor division equivalent for negative numbers).
            if (divisionResult[1].isNegative()) {
                resultNumeric = resultNumeric.prev();
            }
            numShift -= POWERS_OF_TWO_LENGTH - 1; // Corrected (Type III fix).
        }
        // Apply remaining shift.
        const finalDivisionResult = calculateDivisionAndRemainder(resultNumeric, new CompactNumeric(POWERS_OF_TWO_ARRAY[numShift]));
        resultNumeric = finalDivisionResult[0];
        if (finalDivisionResult[1].isNegative()) {
            resultNumeric = resultNumeric.prev();
        }
        return resultNumeric;
    };
    CompactNumeric.prototype.shiftBitsRight = MultiDigitNumeric.prototype.shiftBitsRight;

    /**
     * Generic runner for bitwise operations (AND, OR, XOR).
     * Renamed from 'bitwise' to 'executeBitwiseOperation'.
     * @param {AbstractNumericEntity} operandX - The first operand.
     * @param {AbstractNumericEntity} operandY - The second operand.
     * @param {function(number, number): number} bitwiseFn - The bitwise function to apply (e.g., `(a, b) => a & b`).
     * @returns {AbstractNumericEntity} The result of the bitwise operation.
     */
    function executeBitwiseOperation(operandX, operandY, bitwiseFn) {
        operandY = processInputToNumeric(operandY);

        const isXNegative = operandX.isNegative;
        const isYNegative = operandY.isNegative;

        // Work with two's complement representation for negative numbers.
        const x_twos_comp = isXNegative ? operandX.not() : operandX;
        const y_twos_comp = isYNegative ? operandY.not() : operandY;

        const processedDigits = [];
        let currentX = x_twos_comp;
        let currentY = y_twos_comp;

        // Loop while either number has non-zero digits.
        while (!currentX.isZero() || !currentY.isZero()) {
            const x_div_mod = calculateDivisionAndRemainder(currentX, new CompactNumeric(HIGHEST_POWER_OF_TWO));
            let x_digit = x_div_mod[1].toJSNumber();
            if (isXNegative) { // For negative numbers, invert bits within the digit group.
                x_digit = HIGHEST_POWER_OF_TWO - 1 - x_digit;
            }

            const y_div_mod = calculateDivisionAndRemainder(currentY, new CompactNumeric(HIGHEST_POWER_OF_TWO));
            let y_digit = y_div_mod[1].toJSNumber();
            if (isYNegative) { // For negative numbers, invert bits within the digit group.
                y_digit = HIGHEST_POWER_OF_TWO - 1 - y_digit;
            }

            currentX = x_div_mod[0];
            currentY = y_div_mod[0];
            processedDigits.push(bitwiseFn(x_digit, y_digit));
        }

        // Determine the sign of the result based on the bitwise operation applied to the "sign bits".
        const resultSignBit = bitwiseFn(isXNegative ? 1 : 0, isYNegative ? 1 : 0);
        let finalResult = resultSignBit !== 0 ? AbstractNumericEntity.MINUS_ONE_VAL : AbstractNumericEntity.ZERO_VAL;

        // Reconstruct the number from digits.
        for (let i = processedDigits.length - 1; i >= 0; i--) {
            finalResult = finalResult.multiply(new CompactNumeric(HIGHEST_POWER_OF_TWO)).add(hugeNumberFactory(processedDigits[i]));
        }

        return finalResult;
    }

    // Bitwise NOT operation (two's complement).
    MultiDigitNumeric.prototype.not = function() { return this.negate().prev(); };
    CompactNumeric.prototype.not = MultiDigitNumeric.prototype.not;

    // Bitwise AND operation.
    MultiDigitNumeric.prototype.bitwiseAnd = function(otherNum) { return executeBitwiseOperation(this, otherNum, (a, b) => a & b); };
    CompactNumeric.prototype.bitwiseAnd = MultiDigitNumeric.prototype.bitwiseAnd;

    // Bitwise OR operation.
    MultiDigitNumeric.prototype.bitwiseOr = function(otherNum) { return executeBitwiseOperation(this, otherNum, (a, b) => a | b); };
    CompactNumeric.prototype.bitwiseOr = MultiDigitNumeric.prototype.bitwiseOr;

    // Bitwise XOR operation.
    MultiDigitNumeric.prototype.bitwiseXor = function(otherNum) { return executeBitwiseOperation(this, otherNum, (a, b) => a ^ b); };
    CompactNumeric.prototype.bitwiseXor = MultiDigitNumeric.prototype.bitwiseXor;

    /**
     * Helper for calculating integer logarithm for bit length.
     * Renamed from 'integerLogarithm' to 'recursiveLogarithmForBitLength'.
     * @param {AbstractNumericEntity} numValue - The number for which to find the logarithm.
     * @param {AbstractNumericEntity} baseValue - The base of the logarithm (e.g., 2 for bit length).
     * @returns {{powerComponent: AbstractNumericEntity, exponentComponent: number}}
     */
    function recursiveLogarithmForBitLength(numValue, baseValue) {
        if (baseValue.compare(numValue) <= 0) {
            const tempResult = recursiveLogarithmForBitLength(numValue, baseValue.square());
            const powerP = tempResult.powerComponent;
            const exponentE = tempResult.exponentComponent;
            const product = powerP.multiply(baseValue);
            return product.compare(numValue) <= 0 ?
                { powerComponent: product, exponentComponent: exponentE * 2 + 1 } :
                { powerComponent: powerP, exponentComponent: exponentE * 2 };
        }
        return { powerComponent: hugeNumberFactory(1), exponentComponent: 0 };
    }

    /**
     * Calculates the number of bits required to represent this number.
     * Renamed from 'bitLength' to 'bitLength'.
     * @returns {AbstractNumericEntity} The bit length.
     */
    MultiDigitNumeric.prototype.bitLength = function() {
        let currentNum = this;
        if (currentNum.isNegative()) {
            currentNum = currentNum.negate().subtract(AbstractNumericEntity.ONE_VAL); // Two's complement representation.
        }
        if (currentNum.isZero()) {
            return AbstractNumericEntity.ZERO_VAL;
        }
        const logResult = recursiveLogarithmForBitLength(currentNum, AbstractNumericEntity.TWO_VAL);
        return hugeNumberFactory(logResult.exponentComponent).add(AbstractNumericEntity.ONE_VAL);
    };
    CompactNumeric.prototype.bitLength = MultiDigitNumeric.prototype.bitLength;

    // Max/Min functions.
    /**
     * Returns the maximum of two numeric objects.
     * Renamed from 'max' to 'findMaximum'.
     * @param {number|string|AbstractNumericEntity} numA - First number.
     * @param {number|string|AbstractNumericEntity} numB - Second number.
     * @returns {AbstractNumericEntity} The larger of the two numbers.
     */
    function findMaximum(numA, numB) {
        numA = processInputToNumeric(numA);
        numB = processInputToNumeric(numB);
        return numA.greaterThan(numB) ? numA : numB;
    }

    /**
     * Returns the minimum of two numeric objects.
     * Renamed from 'min' to 'findMinimum'.
     * @param {number|string|AbstractNumericEntity} numA - First number.
     * @param {number|string|AbstractNumericEntity} numB - Second number.
     * @returns {AbstractNumericEntity} The smaller of the two numbers.
     */
    function findMinimum(numA, numB) {
        numA = processInputToNumeric(numA);
        numB = processInputToNumeric(numB);
        return numA.lessThan(numB) ? numA : numB;
    }

    // GCD (Greatest Common Divisor).
    /**
     * Calculates the greatest common divisor of two numbers using the binary GCD algorithm.
     * Renamed from 'gcd' to 'calculateGCD'.
     * @param {number|string|AbstractNumericEntity} numA - First number.
     * @param {number|string|AbstractNumericEntity} numB - Second number.
     * @returns {AbstractNumericEntity} The GCD.
     */
    function calculateGCD(numA, numB) {
        numA = processInputToNumeric(numA).abs();
        numB = processInputToNumeric(numB).abs();

        if (numA.equals(numB)) return numA;
        if (numA.isZero()) return numB;
        if (numB.isZero()) return numA;

        let commonFactor = AbstractNumericEntity.ONE_VAL;
        let tempA = numA;
        let tempB = numB;

        // Extract common factors of 2.
        while (tempA.isEven() && tempB.isEven()) {
            tempA = tempA.divide(AbstractNumericEntity.TWO_VAL);
            tempB = tempB.divide(AbstractNumericEntity.TWO_VAL);
            commonFactor = commonFactor.multiply(AbstractNumericEntity.TWO_VAL);
        }

        // Remove factors of 2 from the odd number.
        while (tempA.isEven()) {
            tempA = tempA.divide(AbstractNumericEntity.TWO_VAL);
        }

        do {
            while (tempB.isEven()) {
                tempB = tempB.divide(AbstractNumericEntity.TWO_VAL);
            }
            if (tempA.greaterThan(tempB)) {
                [tempA, tempB] = [tempB, tempA]; // Swap A and B using destructuring (Type III).
            }
            tempB = tempB.subtract(tempA);
        } while (!tempB.isZero());

        return commonFactor.multiply(tempA);
    }

    // LCM (Least Common Multiple).
    /**
     * Calculates the least common multiple of two numbers.
     * Renamed from 'lcm' to 'calculateLCM'.
     * @param {number|string|AbstractNumericEntity} numA - First number.
     * @param {number|string|AbstractNumericEntity} numB - Second number.
     * @returns {AbstractNumericEntity} The LCM.
     */
    function calculateLCM(numA, numB) {
        numA = processInputToNumeric(numA).abs();
        numB = processInputToNumeric(numB).abs();
        // LCM(a, b) = |a * b| / GCD(a, b).
        return numA.divide(calculateGCD(numA, numB)).multiply(numB);
    }

    // Random number generation.
    /**
     * Generates a random numeric object between two bounds (inclusive).
     * Renamed from 'randBetween' to 'generateRandomBetween'.
     * @param {number|string|AbstractNumericEntity} lowerBound - The lower bound.
     * @param {number|string|AbstractNumericEntity} upperBound - The upper bound.
     * @returns {AbstractNumericEntity} A random number within the specified range.
     */
    function generateRandomBetween(lowerBound, upperBound) {
        lowerBound = processInputToNumeric(lowerBound);
        upperBound = processInputToNumeric(upperBound);

        const low = findMinimum(lowerBound, upperBound);
        const high = findMaximum(lowerBound, upperBound);
        const range = high.subtract(low).add(AbstractNumericEntity.ONE_VAL);

        if (range.isCompact) {
            return low.add(new CompactNumeric(Math.floor(Math.random() * range.numericalValue)));
        }

        // For large ranges, generate digits randomly.
        const rangeDigits = range.digitValues;
        const numDigits = rangeDigits.length;
        const randomDigits = [];
        let isRestricted = true; // True if we are still bound by the upper limit of the range digits.

        for (let i = numDigits - 1; i >= 0; i--) {
            const currentMaxDigit = isRestricted ? rangeDigits[i] : DIGIT_GROUP_SIZE - 1; // Corrected to DIGIT_GROUP_SIZE - 1 for max random (Type III fix).
            const digit = roundTowardsZero(Math.random() * (currentMaxDigit + 1));
            randomDigits.unshift(digit);
            if (digit < currentMaxDigit) {
                isRestricted = false;
            }
        }
        
        const randomNumeric = processInputToNumeric(composeSmallInt(randomDigits));
        return low.add(randomNumeric);
    }

    // Base parsing and stringification utilities.
    const BASE_DIGIT_CHARS = "0123456789abcdefghijklmnopqrstuvwxyz";

    /**
     * Parses a string representation of a number in a custom base.
     * Renamed from 'parseBase' to 'parseCustomBaseString'.
     * @param {string} textInput - The string to parse.
     * @param {number} baseValue - The base (radix) of the number.
     * @returns {AbstractNumericEntity} The parsed numeric object.
     */
    function parseCustomBaseString(textInput, baseValue) {
        const inputLength = textInput.length;
        const absBase = Math.abs(baseValue);

        // Input validation for digits (Type III: more robust validation).
        for (let i = 0; i < inputLength; i++) {
            const char = textInput[i].toLowerCase();
            if (char === "-") continue;
            const charCode = char.charCodeAt(0);

            let digitVal;
            if (charCode >= 48 && charCode <= 57) { // '0'-'9'.
                digitVal = charCode - 48;
            } else if (charCode >= 97 && charCode <= 122) { // 'a'-'z'.
                digitVal = charCode - 97 + 10;
            } else if (char === "<") { // Handle custom <digit> format.
                const endIndex = textInput.indexOf(">", i);
                if (endIndex === -1) throw new Error(`Malformed custom digit in base ${baseValue}: ${textInput.substring(i)}`);
                const customDigitStr = textInput.substring(i + 1, endIndex);
                digitVal = parseInt(customDigitStr, 10);
                if (isNaN(digitVal)) throw new Error(`Invalid custom digit value: ${customDigitStr}`);
                i = endIndex; // Advance loop index past custom digit.
            } else {
                throw new Error(`Invalid character '${char}' in base ${baseValue} string.`);
            }

            if (digitVal >= absBase) {
                throw new Error(`Digit '${char}' (value ${digitVal}) is not valid in base ${baseValue}.`);
            }
        }

        // Optimization for small numbers and common bases.
        if (baseValue >= 2 && baseValue <= 36) {
            // Check if result can fit into a native JS number without losing precision.
            // Approximation for max length, slightly adjusted (Type III).
            if (inputLength * Math.log(baseValue) / Math.log(10) <= GROUP_LOG_VALUE * MAX_JS_SAFE_INT_DIGITS.length + 2) {
                const parsedInt = parseInt(textInput, baseValue);
                if (!isNaN(parsedInt)) {
                    return new CompactNumeric(parsedInt);
                }
            }
        }

        // Fallback to arbitrary-precision parsing.
        baseValue = processInputToNumeric(baseValue);
        const digitObjects = [];
        const isNegative = textInput[0] === "-";
        let index = isNegative ? 1 : 0;

        while (index < textInput.length) {
            const char = textInput[index].toLowerCase();
            const charCode = char.charCodeAt(0);

            if (charCode >= 48 && charCode <= 57) { // '0'-'9'.
                digitObjects.push(processInputToNumeric(char));
                index++;
            } else if (charCode >= 97 && charCode <= 122) { // 'a'-'z'.
                digitObjects.push(processInputToNumeric(charCode - 97 + 10));
                index++;
            } else if (char === "<") {
                const closingBracketIndex = textInput.indexOf(">", index);
                if (closingBracketIndex === -1) throw new Error("Unclosed custom digit in input string.");
                const customDigitStr = textInput.substring(index + 1, closingBracketIndex);
                digitObjects.push(processInputToNumeric(customDigitStr));
                index = closingBracketIndex + 1;
            } else {
                throw new Error(`Unexpected character '${char}' during arbitrary-base parsing.`);
            }
        }
        return parseDigitArrayWithBase(digitObjects, baseValue, isNegative);
    }

    /**
     * Parses an array of digit objects in a given base.
     * Renamed from 'parseBaseFromArray' to 'parseDigitArrayWithBase'.
     * @param {AbstractNumericEntity[]} digitObjects - Array of digit numeric objects.
     * @param {AbstractNumericEntity} baseNum - The base as a numeric object.
     * @param {boolean} isNegative - True if the overall number is negative.
     * @returns {AbstractNumericEntity} The resulting numeric object.
     */
    function parseDigitArrayWithBase(digitObjects, baseNum, isNegative) {
        let result = AbstractNumericEntity.ZERO_VAL;
        let currentPower = AbstractNumericEntity.ONE_VAL;

        for (let i = digitObjects.length - 1; i >= 0; i--) {
            result = result.add(digitObjects[i].multiply(currentPower));
            currentPower = currentPower.multiply(baseNum);
        }
        return isNegative ? result.negate() : result;
    }

    /**
     * Converts a single digit (0-35) to its string representation (0-9, a-z) or custom format.
     * Renamed from 'stringify' to 'digitToStringRepresentation'.
     * @param {number} digitVal - The digit value.
     * @returns {string} The string representation of the digit.
     */
    function digitToStringRepresentation(digitVal) {
        if (digitVal >= 0 && digitVal <= 35) {
            return BASE_DIGIT_CHARS.charAt(digitVal);
        }
        return `<${digitVal}>`; // For digits > 35 (Type III: no change, but good example).
    }

    /**
     * Converts a numeric object to its digit array representation in a specified base.
     * Renamed from 'toBase' to 'convertNumberToBaseDigits'.
     * @param {AbstractNumericEntity} targetNum - The number to convert.
     * @param {AbstractNumericEntity|number} baseNum - The target base.
     * @returns {{digits: number[], isNegative: boolean}} Object containing digit array and sign.
     */
    function convertNumberToBaseDigits(targetNum, baseNum) {
        baseNum = hugeNumberFactory(baseNum);

        if (baseNum.isZero()) {
            if (targetNum.isZero()) return { digits: [0], isNegative: false };
            throw new Error("Cannot convert non-zero numbers to base 0.");
        }

        // Special handling for base -1 (Type III: simplified logic for negative bases).
        if (baseNum.equals(AbstractNumericEntity.MINUS_ONE_VAL)) {
            if (targetNum.isZero()) return { digits: [0], isNegative: false };
            // This is a simplified base -1 conversion, not necessarily the most common one.
            let n = targetNum;
            let convertedDigits = [];
            while (!n.isZero()) {
                let remainder = n.mod(baseNum);
                if (remainder.isNegative()) {
                    remainder = remainder.subtract(baseNum); // Make remainder positive.
                    n = n.subtract(remainder).divide(baseNum).next(); // Adjust quotient.
                } else {
                    n = n.subtract(remainder).divide(baseNum);
                }
                convertedDigits.unshift(remainder.toJSNumber());
            }
            return { digits: convertedDigits.length > 0 ? convertedDigits : [0], isNegative: false };
        }

        let isResultNegative = false;
        let workingNum = targetNum;
        if (targetNum.isNegative() && baseNum.isPositive()) {
            isResultNegative = true;
            workingNum = targetNum.abs();
        }

        if (baseNum.equals(AbstractNumericEntity.ONE_VAL)) {
            if (workingNum.isZero()) return { digits: [0], isNegative: false };
            // For base 1, it's just '1' repeated N times.
            const ones = [];
            for (let i = 0; i < workingNum.toJSNumber(); i++) {
                ones.push(1);
            }
            return { digits: ones, isNegative: isResultNegative };
        }

        const digitArray = [];
        let divModResult;
        while (workingNum.isNegative() || workingNum.compareAbsolute(baseNum) >= 0) {
            divModResult = workingNum.divmod(baseNum);
            workingNum = divModResult.quotient;
            let digit = divModResult.remainder;

            if (digit.isNegative()) {
                digit = baseNum.subtract(digit).abs();
                workingNum = workingNum.next();
            }
            digitArray.push(digit.toJSNumber());
        }
        digitArray.push(workingNum.toJSNumber()); // Add the last quotient.

        return { digits: digitArray.reverse(), isNegative: isResultNegative };
    }

    /**
     * Formats a numeric object into a string representation in a specified base.
     * Renamed from 'toBaseString' to 'formatToBaseString'.
     * @param {AbstractNumericEntity} numericValue - The number to format.
     * @param {AbstractNumericEntity|number} base - The target base.
     * @returns {string} The string representation.
     */
    function formatToBaseString(numericValue, base) {
        const converted = convertNumberToBaseDigits(numericValue, base);
        return (converted.isNegative ? "-" : "") + converted.digits.map(digitToStringRepresentation).join("");
    }

    MultiDigitNumeric.prototype.toDigitArray = function(radix) { return convertNumberToBaseDigits(this, radix); };
    CompactNumeric.prototype.toDigitArray = function(radix) { return convertNumberToBaseDigits(this, radix); };

    // String conversion for MultiDigitNumeric.
    MultiDigitNumeric.prototype.toString = function(radix) {
        if (radix === undefined) radix = 10;
        if (radix !== 10) return formatToBaseString(this, radix);

        const digitVector = this.digitValues;
        const lastIndex = digitVector.length - 1;
        let stringResult = String(digitVector[lastIndex]);

        const zeroPadding = "0000000"; // Padding for DIGIT_GROUP_SIZE = 1e7.
        for (let i = lastIndex - 1; i >= 0; --i) {
            const currentDigit = String(digitVector[i]);
            stringResult += zeroPadding.slice(currentDigit.length) + currentDigit;
        }
        return (this.isNegative ? "-" : "") + stringResult;
    };
    // String conversion for CompactNumeric.
    CompactNumeric.prototype.toString = function(radix) {
        if (radix === undefined) radix = 10;
        if (radix !== 10) return formatToBaseString(this, radix);
        return String(this.numericalValue);
    };

    // JSON serialization.
    MultiDigitNumeric.prototype.toJSON = CompactNumeric.prototype.toJSON = function() {
        return this.toString();
    };

    // ValueOf and toJSNumber for MultiDigitNumeric.
    MultiDigitNumeric.prototype.valueOf = function() {
        const str = this.toString();
        const num = parseInt(str, 10);
        // Check for precision loss when converting to JS Number.
        if (isWithinSafeIntRange(num) && num.toString() === str) {
            return num;
        }
        return str; // Return string for very large numbers.
    };
    MultiDigitNumeric.prototype.toJSNumber = MultiDigitNumeric.prototype.valueOf;

    // ValueOf and toJSNumber for CompactNumeric.
    CompactNumeric.prototype.valueOf = function() { return this.numericalValue; };
    CompactNumeric.prototype.toJSNumber = CompactNumeric.prototype.valueOf;

    /**
     * Converts a string input into a numeric object. Handles scientific notation.
     * Renamed from 'parseStringValue' to 'convertStringInputToNumeric'.
     * @param {string} inputString - The string to convert.
     * @returns {AbstractNumericEntity} The numeric object.
     * @throws {Error} If the string format is invalid.
     */
    function convertStringInputToNumeric(inputString) {
        // Check for scientific notation.
        const scientificSplit = inputString.toLowerCase().split(/e/i);
        if (scientificSplit.length > 2) {
            throw new Error(`Invalid numeric string format: multiple 'e' characters in ${inputString}`);
        }
        if (scientificSplit.length === 2) {
            let exponentPart = scientificSplit[1];
            if (exponentPart[0] === "+") exponentPart = exponentPart.slice(1);
            const expValue = +exponentPart;
            if (!Number.isInteger(expValue) || !isWithinSafeIntRange(expValue)) {
                throw new Error(`Invalid exponent value in string: ${expValue} is not a valid integer.`);
            }

            let basePart = scientificSplit[0];
            const decimalPointIndex = basePart.indexOf(".");
            if (decimalPointIndex >= 0) {
                const fractionalDigitsCount = basePart.length - decimalPointIndex - 1;
                expValue -= fractionalDigitsCount;
                basePart = basePart.slice(0, decimalPointIndex) + basePart.slice(decimalPointIndex + 1);
            }

            if (expValue < 0) {
                throw new Error("Negative exponents are not supported for integer parsing.");
            }
            basePart += "0".repeat(expValue);
            inputString = basePart;
        }

        // Validate integer format (Type III: Added optional sign check).
        if (!/^[-+]?[0-9]+$/.test(inputString)) {
            throw new Error(`Invalid integer format: ${inputString}`);
        }

        const isNegative = inputString[0] === "-";
        if (isNegative || inputString[0] === "+") inputString = inputString.slice(1); // Remove sign for digit processing.

        const digits = [];
        const maxLen = inputString.length;
        const groupSize = GROUP_LOG_VALUE;
        let currentEnd = maxLen;
        let currentStart = maxLen - groupSize;

        while (currentEnd > 0) {
            if (currentStart < 0) currentStart = 0;
            const digitChunk = +inputString.slice(currentStart, currentEnd);
            digits.push(digitChunk);
            currentEnd = currentStart;
            currentStart -= groupSize;
        }
        normalizeDigits(digits);
        return new MultiDigitNumeric(digits, isNegative);
    }

    /**
     * Converts a JavaScript number input into a numeric object.
     * Renamed from 'parseNumberValue' to 'convertNumberInputToNumeric'.
     * @param {number} inputNumber - The number to convert.
     * @returns {AbstractNumericEntity} The numeric object.
     * @throws {Error} If the number is not a finite integer.
     */
    function convertNumberInputToNumeric(inputNumber) {
        if (!Number.isFinite(inputNumber)) { // Added check for finite number (Type III).
            throw new Error(`Input ${inputNumber} is not a finite number.`);
        }
        if (!Number.isInteger(inputNumber)) {
            throw new Error(`Input ${inputNumber} is not an integer.`);
        }
        if (isWithinSafeIntRange(inputNumber)) {
            return new CompactNumeric(inputNumber);
        }
        // If number is too large for safe integer, convert to string and parse.
        return convertStringInputToNumeric(inputNumber.toString());
    }

    /**
     * Main factory function to convert various input types into numeric objects.
     * Renamed from 'parseValue' to 'processInputToNumeric'.
     * @param {number|string|AbstractNumericEntity} inputValue - The value to process.
     * @returns {AbstractNumericEntity} A CompactNumeric or MultiDigitNumeric instance.
     * @throws {Error} If the input type is unsupported.
     */
    function processInputToNumeric(inputValue) {
        if (typeof inputValue === "number") {
            return convertNumberInputToNumeric(inputValue);
        }
        if (typeof inputValue === "string") {
            return convertStringInputToNumeric(inputValue);
        }
        // If it's already a numeric object, return it.
        if (inputValue instanceof AbstractNumericEntity) {
            return inputValue;
        }
        throw new Error(`Unsupported input type for numeric conversion: ${typeof inputValue}`);
    }

    // Pre-create small integer constants (Type III: more structured constant definition).
    const NumericConstantsCache = {};
    for (let i = 0; i < 1000; i++) { // Increased range for pre-cached values.
        NumericConstantsCache[i] = new CompactNumeric(i);
        if (i > 0) NumericConstantsCache[-i] = new CompactNumeric(-i);
    }
    // Assign common constants to the AbstractNumericEntity for easy access.
    AbstractNumericEntity.ONE_VAL = NumericConstantsCache[1];
    AbstractNumericEntity.ZERO_VAL = NumericConstantsCache[0];
    AbstractNumericEntity.MINUS_ONE_VAL = NumericConstantsCache[-1];
    AbstractNumericEntity.TWO_VAL = NumericConstantsCache[2];
    AbstractNumericEntity.THREE_VAL = NumericConstantsCache[3];
    AbstractNumericEntity.FIVE_VAL = NumericConstantsCache[5];
    AbstractNumericEntity.TWENTY_FIVE_VAL = NumericConstantsCache[25];

    // Exported utility functions.
    AbstractNumericEntity.maximum = findMaximum;
    AbstractNumericEntity.minimum = findMinimum;
    AbstractNumericEntity.greatestCommonDivisor = calculateGCD;
    AbstractNumericEntity.leastCommonMultiple = calculateLCM;
    AbstractNumericEntity.isNumericInstance = function(obj) {
        return obj instanceof MultiDigitNumeric || obj instanceof CompactNumeric;
    };
    AbstractNumericEntity.generateRandomBetween = generateRandomBetween;
    AbstractNumericEntity.fromDigitArray = function(digits, base, isNegative) {
        const digitNumericObjects = digits.map(processInputToNumeric);
        return parseDigitArrayWithBase(digitNumericObjects, processInputToNumeric(base || 10), isNegative);
    };

    return AbstractNumericEntity;
}(); // End of IIFE for the numeric library.

// --- Main application logic ---
// Renamed 'main' to 'applicationHandler'.
const applicationHandler = inputData => {
    // Input parsing and variable setup.
    const lines = inputData.trim().split("\n");
    // Parse dimensions; using Array.map for cleaner parsing (Type III).
    const dimensions = lines[0].split(" ").map(Number);
    let currentHeight = dimensions[0]; // Renamed H to currentHeight.
    let currentWidth = dimensions[1];  // Renamed W to currentWidth.
    
    // Initialize minimum area difference with the total area, converted to a hugeNumber.
    let minAreaDifference = hugeNumberFactory(currentHeight).multiply(currentWidth);
    
    // Store area calculations for the three pieces. Renamed 's' to 'segmentAreas'.
    const segmentAreas = new Array(3);
    
    // Loop twice: once for original orientation, once for 90-degree rotated orientation.
    // Renamed 'i' to 'rotationIteration'.
    for (let rotationIteration = 0; rotationIteration < 2; rotationIteration++) {
        // Iterate through possible horizontal split points. Renamed 'h' to 'splitH'.
        for (let splitH = 1; splitH < currentHeight; splitH++) {
            // --- Strategy 1: Split horizontally, then vertically on the larger remaining rectangle ---
            // Piece 1: splitH * currentWidth.
            segmentAreas[0] = hugeNumberFactory(splitH).multiply(currentWidth);
            
            // Remaining area height.
            const remainingHeight = currentHeight - splitH;
            
            // Piece 2: (remainingHeight) * (currentWidth / 2).
            // Using Math.floor for integer division (Type III explicit).
            segmentAreas[1] = hugeNumberFactory(remainingHeight).multiply(Math.floor(currentWidth / 2));
            
            // Piece 3: Total area - (Piece 1 + Piece 2).
            const totalArea = hugeNumberFactory(currentHeight).multiply(currentWidth);
            segmentAreas[2] = totalArea.subtract(segmentAreas[0].add(segmentAreas[1]));

            // Sort segment areas and update minimum difference.
            // Using custom compare method for numeric objects.
            segmentAreas.sort((a, b) => a.compare(b));
            minAreaDifference = AbstractNumericEntity.minimum(minAreaDifference, segmentAreas[2].subtract(segmentAreas[0]));
            
            // --- Strategy 2: Split horizontally, then horizontally on the larger remaining rectangle ---
            // Piece 1: splitH * currentWidth (same as above).
            // Remaining area height is still `remainingHeight`.
            
            // Piece 2: (remainingHeight / 2) * currentWidth.
            segmentAreas[1] = hugeNumberFactory(Math.floor(remainingHeight / 2)).multiply(currentWidth);
            
            // Piece 3: Total area - (Piece 1 + Piece 2).
            segmentAreas[2] = totalArea.subtract(segmentAreas[0].add(segmentAreas[1]));
            
            // Sort segment areas and update minimum difference.
            segmentAreas.sort((a, b) => a.compare(b));
            minAreaDifference = AbstractNumericEntity.minimum(minAreaDifference, segmentAreas[2].subtract(segmentAreas[0]));
        }
        
        // Rotate the rectangle (swap height and width) for the next iteration.
        // Using destructuring assignment for swap (Type III).
        [currentHeight, currentWidth] = [currentWidth, currentHeight];
    }
    
    console.log(minAreaDifference.toString());
};

// Execute the application, reading from stdin.
applicationHandler(require('fs').readFileSync('/dev/stdin', 'utf8'));