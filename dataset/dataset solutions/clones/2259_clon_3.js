"use strict";
// This module provides arbitrary-precision integer arithmetic capabilities.
// It's a reimplementation inspired by common big integer libraries.
const largeNumFactory = (function(missingParam) {
    "use strict";

    // Configuration constants for internal digit representation
    const DIGIT_BASE = 1e7; // Each array element stores up to 10^7
    const BASE_LOG_EXPONENT = 7; // log10(DIGIT_BASE)
    const JAVASCRIPT_MAX_SAFE_INT = 9007199254740992; // 2^53
    const MAX_SAFE_INT_DIGITS = convertSmallToDigits(JAVASCRIPT_MAX_SAFE_INT);
    const LOG_OF_MAX_JS_INT = Math.log(JAVASCRIPT_MAX_SAFE_INT);

    /**
     * Base class for numeric entities (large or small).
     * @param {*} initialVal - The value to parse.
     * @param {number} inputRadix - The base for string parsing.
     * @returns {NumericEntity} A LargeNumber or CompactNumber instance.
     */
    function NumericEntity(initialVal, inputRadix) {
        // If no value is provided, return the cached zero instance.
        if (typeof initialVal === "undefined") {
            return NumericEntity.ZERO;
        }
        // Handle radix-based string parsing.
        if (typeof inputRadix !== "undefined") {
            // If radix is 10, treat as a standard number string.
            return +inputRadix === 10 ? castToNumericEntity(initialVal) : parseStringWithBase(initialVal, inputRadix);
        }
        // Default parsing for numbers or un-radixed strings.
        return castToNumericEntity(initialVal);
    }

    /**
     * Represents a large integer number, stored as an array of digits.
     * @param {number[]} digitArray - Array of digits in DIGIT_BASE.
     * @param {boolean} isNegative - True if the number is negative.
     */
    function LargeNumber(digitArray, isNegative) {
        this.digitArray = digitArray;
        this.isNegative = isNegative;
        this.isSmall = false; // Flag to distinguish from CompactNumber
    }
    LargeNumber.prototype = Object.create(NumericEntity.prototype);

    /**
     * Represents an integer that fits within JavaScript's safe integer limits.
     * @param {number} numericalValue - The actual JS number.
     */
    function CompactNumber(numericalValue) {
        this.numericalValue = numericalValue;
        this.isNegative = numericalValue < 0;
        this.isSmall = true; // Flag to distinguish from LargeNumber
    }
    CompactNumber.prototype = Object.create(NumericEntity.prototype);

    /**
     * Checks if a given number can be precisely represented as a JavaScript integer.
     * @param {number} n - The number to check.
     * @returns {boolean} True if precise, false otherwise.
     */
    function isWithinJsPrecision(n) {
        return -JAVASCRIPT_MAX_SAFE_INT < n && n < JAVASCRIPT_MAX_SAFE_INT;
    }

    /**
     * Converts a small JavaScript number into its DIGIT_BASE array representation.
     * @param {number} n - The small integer.
     * @returns {number[]} Array of digits.
     */
    function convertSmallToDigits(n) {
        if (n < DIGIT_BASE) return [n];
        if (n < DIGIT_BASE * DIGIT_BASE) return [n % DIGIT_BASE, Math.floor(n / DIGIT_BASE)];
        // Handles numbers up to 10^21.
        return [n % DIGIT_BASE, Math.floor(n / DIGIT_BASE) % DIGIT_BASE, Math.floor(n / (DIGIT_BASE * DIGIT_BASE))];
    }

    /**
     * Converts a digit array back into a small JavaScript number if possible.
     * @param {number[]} digitArr - Array of digits.
     * @returns {number|number[]} The JS number or the original array if too large.
     */
    function convertDigitsToSmall(digitArr) {
        normalizeDigitArray(digitArr);
        const currentLength = digitArr.length;
        // Check if the number of digits is small enough and the absolute value fits.
        if (currentLength < 4 && compareAbsoluteValues(digitArr, MAX_SAFE_INT_DIGITS) < 0) {
            switch (currentLength) {
                case 0:
                    return 0;
                case 1:
                    return digitArr[0];
                case 2:
                    return digitArr[0] + digitArr[1] * DIGIT_BASE;
                default: // currentLength === 3
                    return digitArr[0] + (digitArr[1] + digitArr[2] * DIGIT_BASE) * DIGIT_BASE;
            }
        }
        return digitArr;
    }

    /**
     * Removes leading zeros from a digit array (most significant end).
     * @param {number[]} digitVec - The digit array to trim.
     */
    function normalizeDigitArray(digitVec) {
        let idx = digitVec.length;
        while (idx > 0 && digitVec[--idx] === 0); // Find first non-zero from end
        digitVec.length = idx + 1; // Truncate array
    }

    /**
     * Creates and initializes a new array of a given length with zeros.
     * @param {number} len - The desired length of the array.
     * @returns {number[]} A new array filled with zeros.
     */
    function initializeDigitArray(len) {
        const newArr = new Array(len);
        let currentIdx = -1;
        while (++currentIdx < len) {
            newArr[currentIdx] = 0;
        }
        return newArr;
    }

    /**
     * Truncates a number towards zero (floor for positive, ceil for negative).
     * @param {number} num - The number to truncate.
     * @returns {number} The truncated integer.
     */
    function floorValue(num) {
        if (num > 0) return Math.floor(num);
        return Math.ceil(num);
    }

    /**
     * Performs addition of two digit arrays (assuming both are positive).
     * @param {number[]} arr1 - First operand.
     * @param {number[]} arr2 - Second operand.
     * @returns {number[]} The sum as a new digit array.
     */
    function performArrayAddition(arr1, arr2) {
        const len1 = arr1.length;
        const len2 = arr2.length;
        const result = new Array(len1); // result will be at most len1 + 1
        let carry = 0;
        let currentSum;
        let i;

        // Add common parts
        for (i = 0; i < len2; i++) {
            currentSum = arr1[i] + arr2[i] + carry;
            carry = currentSum >= DIGIT_BASE ? 1 : 0;
            result[i] = currentSum - carry * DIGIT_BASE;
        }

        // Add remaining part of the longer array (arr1) with carry
        while (i < len1) {
            currentSum = arr1[i] + carry;
            carry = currentSum === DIGIT_BASE ? 1 : 0;
            result[i++] = currentSum - carry * DIGIT_BASE;
        }

        // Handle final carry
        if (carry > 0) {
            result.push(carry);
        }
        return result;
    }

    /**
     * Adds two digit arrays, ensuring the longer one is the first argument for `performArrayAddition`.
     * @param {number[]} digitsA - First operand.
     * @param {number[]} digitsB - Second operand.
     * @returns {number[]} The sum as a new digit array.
     */
    function addDigitArrays(digitsA, digitsB) {
        if (digitsA.length >= digitsB.length) {
            return performArrayAddition(digitsA, digitsB);
        }
        return performArrayAddition(digitsB, digitsA);
    }

    /**
     * Adds a small number (carry) to a digit array.
     * @param {number[]} digitVec - The digit array.
     * @param {number} smallCarry - The small number to add (must be positive).
     * @returns {number[]} The result as a new digit array.
     */
    function addSmallNumberToDigits(digitVec, smallCarry) {
        const currentLen = digitVec.length;
        const resultArr = new Array(currentLen);
        let carryVal = smallCarry;
        let currentSum;
        let i;

        for (i = 0; i < currentLen; i++) {
            currentSum = digitVec[i] + carryVal;
            // Faster way to calculate carry and remainder
            carryVal = Math.floor(currentSum / DIGIT_BASE);
            resultArr[i] = currentSum % DIGIT_BASE;
        }

        // Propagate any remaining carry
        while (carryVal > 0) {
            resultArr[i++] = carryVal % DIGIT_BASE;
            carryVal = Math.floor(carryVal / DIGIT_BASE);
        }
        return resultArr;
    }

    // LargeNumber Addition
    LargeNumber.prototype.add = function(otherVal) {
        const otherNum = castToNumericEntity(otherVal);
        // If signs are different, convert to subtraction.
        if (this.isNegative !== otherNum.isNegative) {
            return this.subtract(otherNum.flipSign());
        }

        const currentDigits = this.digitArray;
        const otherDigits = otherNum.digitArray;

        // Optimized path for adding a small number to a large number.
        if (otherNum.isSmall) {
            return new LargeNumber(addSmallNumberToDigits(currentDigits, Math.abs(otherNum.numericalValue)), this.isNegative);
        }
        // General case for adding two large numbers.
        return new LargeNumber(addDigitArrays(currentDigits, otherDigits), this.isNegative);
    };
    LargeNumber.prototype.plus = LargeNumber.prototype.add; // Alias

    // CompactNumber Addition
    CompactNumber.prototype.add = function(otherVal) {
        const otherNum = castToNumericEntity(otherVal);
        const thisValue = this.numericalValue;

        // If signs are different, convert to subtraction.
        if (thisValue < 0 !== otherNum.isNegative) {
            return this.subtract(otherNum.flipSign());
        }

        const otherValue = otherNum.numericalValue;
        if (otherNum.isSmall) {
            // If both are small, try direct JS addition.
            if (isWithinJsPrecision(thisValue + otherValue)) {
                return new CompactNumber(thisValue + otherValue);
            }
            // If sum exceeds JS precision, convert other to digits and add.
            const otherDigits = convertSmallToDigits(Math.abs(otherValue));
            return new LargeNumber(addSmallNumberToDigits(otherDigits, Math.abs(thisValue)), thisValue < 0);
        }
        // If this is small and other is large, convert this to digits and add.
        return new LargeNumber(addSmallNumberToDigits(otherNum.digitArray, Math.abs(thisValue)), thisValue < 0);
    };
    CompactNumber.prototype.plus = CompactNumber.prototype.add; // Alias

    /**
     * Performs subtraction of two digit arrays (arr1 - arr2), assuming arr1 >= arr2 and both are positive.
     * @param {number[]} arr1 - Minuend (must be greater than or equal to arr2).
     * @param {number[]} arr2 - Subtrahend.
     * @returns {number[]} The difference as a new digit array.
     */
    function performArraySubtraction(arr1, arr2) {
        const len1 = arr1.length;
        const len2 = arr2.length;
        const result = new Array(len1);
        let borrow = 0;
        let currentDiff;
        let i;

        // Subtract common parts
        for (i = 0; i < len2; i++) {
            currentDiff = arr1[i] - borrow - arr2[i];
            if (currentDiff < 0) {
                currentDiff += DIGIT_BASE;
                borrow = 1;
            } else {
                borrow = 0;
            }
            result[i] = currentDiff;
        }

        // Propagate borrow through the remaining part of arr1
        for (i = len2; i < len1; i++) {
            currentDiff = arr1[i] - borrow;
            if (currentDiff < 0) {
                currentDiff += DIGIT_BASE;
            } else {
                result[i++] = currentDiff; // If no borrow, copy and break
                break;
            }
            result[i] = currentDiff;
        }

        // Copy any remaining digits from arr1 if no more borrows
        for (; i < len1; i++) {
            result[i] = arr1[i];
        }

        normalizeDigitArray(result);
        return result;
    }

    /**
     * Subtracts two digit arrays, handling sign logic.
     * @param {number[]} digitsA - First operand.
     * @param {number[]} digitsB - Second operand.
     * @param {boolean} currentSign - The expected sign of the result if digitsA >= digitsB.
     * @returns {NumericEntity} The result of the subtraction.
     */
    function subtractDigitArrays(digitsA, digitsB, currentSign) {
        let resultDigits;
        let finalSign = currentSign;

        if (compareAbsoluteValues(digitsA, digitsB) >= 0) {
            resultDigits = performArraySubtraction(digitsA, digitsB);
        } else {
            resultDigits = performArraySubtraction(digitsB, digitsA);
            finalSign = !finalSign; // Flip sign if (B - A) was computed
        }

        const smallResult = convertDigitsToSmall(resultDigits);
        if (typeof smallResult === "number") {
            // If it fits into a small number, apply sign and return CompactNumber.
            if (finalSign) smallResult = -smallResult;
            return new CompactNumber(smallResult);
        }
        return new LargeNumber(smallResult, finalSign);
    }

    /**
     * Subtracts a small number from a digit array.
     * @param {number[]} digitVec - The digit array (positive).
     * @param {number} smallVal - The small number to subtract (positive).
     * @param {boolean} isNegativeSign - The sign of the original large number.
     * @returns {NumericEntity} The result of the subtraction.
     */
    function subtractSmallNumberFromDigits(digitVec, smallVal, isNegativeSign) {
        const currentLen = digitVec.length;
        const resultArr = new Array(currentLen);
        let carryVal = -smallVal; // Treat subtraction as negative carry
        let currentDiff;
        let i;

        for (i = 0; i < currentLen; i++) {
            currentDiff = digitVec[i] + carryVal;
            carryVal = Math.floor(currentDiff / DIGIT_BASE);
            currentDiff %= DIGIT_BASE;
            resultArr[i] = currentDiff < 0 ? currentDiff + DIGIT_BASE : currentDiff;
        }

        const smallResult = convertDigitsToSmall(resultArr);
        if (typeof smallResult === "number") {
            if (isNegativeSign) smallResult = -smallResult;
            return new CompactNumber(smallResult);
        }
        return new LargeNumber(smallResult, isNegativeSign);
    }

    // LargeNumber Subtraction
    LargeNumber.prototype.subtract = function(otherVal) {
        const otherNum = castToNumericEntity(otherVal);
        // If signs are different, convert to addition with flipped sign.
        if (this.isNegative !== otherNum.isNegative) {
            return this.add(otherNum.flipSign());
        }

        const currentDigits = this.digitArray;
        const otherValue = otherNum.numericalValue; // For small number optimization

        // Optimized path for subtracting a small number from a large number.
        if (otherNum.isSmall) {
            return subtractSmallNumberFromDigits(currentDigits, Math.abs(otherValue), this.isNegative);
        }
        // General case for subtracting two large numbers.
        return subtractDigitArrays(currentDigits, otherNum.digitArray, this.isNegative);
    };
    LargeNumber.prototype.minus = LargeNumber.prototype.subtract; // Alias

    // CompactNumber Subtraction
    CompactNumber.prototype.subtract = function(otherVal) {
        const otherNum = castToNumericEntity(otherVal);
        const thisValue = this.numericalValue;

        // If signs are different, convert to addition with flipped sign.
        if (thisValue < 0 !== otherNum.isNegative) {
            return this.add(otherNum.flipSign());
        }

        const otherValue = otherNum.numericalValue;
        if (otherNum.isSmall) {
            // If both are small, try direct JS subtraction.
            return new CompactNumber(thisValue - otherValue);
        }
        // If this is small and other is large, convert other to digits and subtract.
        // The logic for `subtractSmallNumberFromDigits` assumes the digit array is positive,
        // and its sign parameter reflects the original number.
        // Here, we're effectively doing `small_A - Large_B`. This means we need `-(Large_B - small_A)`.
        // So, we swap operands and flip the result's sign.
        return subtractSmallNumberFromDigits(otherNum.digitArray, Math.abs(thisValue), !(thisValue >= 0));
    };
    CompactNumber.prototype.minus = CompactNumber.prototype.subtract; // Alias

    // Sign manipulation methods
    LargeNumber.prototype.flipSign = function() {
        return new LargeNumber(this.digitArray, !this.isNegative);
    };
    CompactNumber.prototype.flipSign = function() {
        const currentSign = this.isNegative;
        const newCompact = new CompactNumber(-this.numericalValue);
        newCompact.isNegative = !currentSign; // Ensure correct sign for -0 edge case
        return newCompact;
    };

    // Absolute value methods
    LargeNumber.prototype.absoluteValue = function() {
        return new LargeNumber(this.digitArray, false);
    };
    CompactNumber.prototype.absoluteValue = function() {
        return new CompactNumber(Math.abs(this.numericalValue));
    };

    /**
     * Performs standard long multiplication for two digit arrays.
     * @param {number[]} digitsA - First operand.
     * @param {number[]} digitsB - Second operand.
     * @returns {number[]} The product as a new digit array.
     */
    function multiplyDigitArraysLong(digitsA, digitsB) {
        const lenA = digitsA.length;
        const lenB = digitsB.length;
        const resultLen = lenA + lenB;
        const resultArr = initializeDigitArray(resultLen);
        let currentProduct, currentCarry;
        let digitA_val, digitB_val;

        // Iterate through each digit of the first number.
        for (let i = 0; i < lenA; ++i) {
            digitA_val = digitsA[i];
            currentCarry = 0; // Reset carry for each row of multiplication

            // Multiply digitA_val by each digit of the second number.
            for (let j = 0; j < lenB; ++j) {
                digitB_val = digitsB[j];
                currentProduct = digitA_val * digitB_val + resultArr[i + j] + currentCarry;
                currentCarry = Math.floor(currentProduct / DIGIT_BASE);
                resultArr[i + j] = currentProduct - currentCarry * DIGIT_BASE;
            }
            resultArr[i + lenB] += currentCarry; // Add remaining carry
        }
        normalizeDigitArray(resultArr);
        return resultArr;
    }

    /**
     * Multiplies a digit array by a small JavaScript number.
     * @param {number[]} digitVec - The digit array.
     * @param {number} smallMultiplier - The small integer multiplier.
     * @returns {number[]} The product as a new digit array.
     */
    function multiplyDigitsBySmall(digitVec, smallMultiplier) {
        const currentLen = digitVec.length;
        const resultArr = new Array(currentLen);
        let carry = 0;
        let currentProduct;
        let i;

        for (i = 0; i < currentLen; i++) {
            currentProduct = digitVec[i] * smallMultiplier + carry;
            carry = Math.floor(currentProduct / DIGIT_BASE);
            resultArr[i] = currentProduct - carry * DIGIT_BASE;
        }

        // Propagate any remaining carry
        while (carry > 0) {
            resultArr[i++] = carry % DIGIT_BASE;
            carry = Math.floor(carry / DIGIT_BASE);
        }
        return resultArr;
    }

    /**
     * Pads an array with `n` zeros at the beginning (effectively shifting left by n positions).
     * @param {number[]} arr - The array to pad.
     * @param {number} numZeros - Number of zeros to add.
     * @returns {number[]} A new array with leading zeros.
     */
    function padWithZeros(arr, numZeros) {
        const newArr = [];
        for (let k = 0; k < numZeros; k++) newArr.push(0);
        return newArr.concat(arr);
    }

    /**
     * Implements the Karatsuba multiplication algorithm for digit arrays.
     * Efficient for very large numbers.
     * @param {number[]} x - First operand.
     * @param {number[]} y - Second operand.
     * @returns {number[]} The product as a new digit array.
     */
    function karatsubaMultiplication(x, y) {
        const maxLen = Math.max(x.length, y.length);
        if (maxLen <= 30) { // Base case for small arrays, use long multiplication
            return multiplyDigitArraysLong(x, y);
        }

        // Split arrays into two halves
        const halfLen = Math.ceil(maxLen / 2);
        const b = x.slice(halfLen); // High part of x
        const a = x.slice(0, halfLen); // Low part of x
        const d = y.slice(halfLen); // High part of y
        const c = y.slice(0, halfLen); // Low part of y

        // Recursive calls
        const ac = karatsubaMultiplication(a, c);
        const bd = karatsubaMultiplication(b, d);
        const abcd = karatsubaMultiplication(addDigitArrays(a, b), addDigitArrays(c, d));

        // Combine results: (abcd - ac - bd) * BASE^halfLen + bd * BASE^(2*halfLen) + ac
        const middleTerm = subtractDigitArrays(subtractDigitArrays(abcd, ac, false).digitArray, bd, false).digitArray;
        const product = addDigitArrays(addDigitArrays(ac, padWithZeros(middleTerm, halfLen)), padWithZeros(bd, 2 * halfLen));
        normalizeDigitArray(product);
        return product;
    }

    /**
     * Heuristic to decide whether to use Karatsuba or standard long multiplication.
     * @param {number} len1 - Length of the first digit array.
     * @param {number} len2 - Length of the second digit array.
     * @returns {boolean} True if Karatsuba should be used.
     */
    function shouldUseKaratsuba(len1, len2) {
        // This is a common heuristic, empirically determined.
        // It's a linear equation that becomes positive for larger lengths.
        return -0.012 * len1 - 0.012 * len2 + 15e-6 * len1 * len2 > 0;
    }

    // LargeNumber Multiplication
    LargeNumber.prototype.multiply = function(otherVal) {
        const otherNum = castToNumericEntity(otherVal);
        const digitsA = this.digitArray;
        const digitsB = otherNum.digitArray;
        const finalSign = this.isNegative !== otherNum.isNegative; // XOR for signs

        // Optimization for small multipliers
        if (otherNum.isSmall) {
            const smallVal = otherNum.numericalValue;
            if (smallVal === 0) return NumericEntity.ZERO;
            if (smallVal === 1) return this;
            if (smallVal === -1) return this.flipSign();
            const absSmallVal = Math.abs(smallVal);
            if (absSmallVal < DIGIT_BASE) {
                return new LargeNumber(multiplyDigitsBySmall(digitsA, absSmallVal), finalSign);
            }
            // If small number is larger than a single digit, convert it to array for long multiplication.
            return new LargeNumber(multiplyDigitArraysLong(digitsA, convertSmallToDigits(absSmallVal)), finalSign);
        }

        // Choose multiplication algorithm based on size heuristic
        if (shouldUseKaratsuba(digitsA.length, digitsB.length)) {
            return new LargeNumber(karatsubaMultiplication(digitsA, digitsB), finalSign);
        }
        return new LargeNumber(multiplyDigitArraysLong(digitsA, digitsB), finalSign);
    };
    LargeNumber.prototype.times = LargeNumber.prototype.multiply; // Alias

    /**
     * Helper for multiplying small numbers with digit arrays, used internally.
     * @param {number} smallVal - Small number multiplier.
     * @param {number[]} digitArr - Digit array operand.
     * @param {boolean} finalSign - Result sign.
     * @returns {LargeNumber} The product.
     */
    function multiplySmallAndDigitArray(smallVal, digitArr, finalSign) {
        if (smallVal < DIGIT_BASE) {
            return new LargeNumber(multiplyDigitsBySmall(digitArr, smallVal), finalSign);
        }
        return new LargeNumber(multiplyDigitArraysLong(digitArr, convertSmallToDigits(smallVal)), finalSign);
    }

    // Internal helper for CompactNumber to multiply by another (potentially small) number.
    CompactNumber.prototype._multiplyByCompact = function(otherCompact) {
        const productVal = otherCompact.numericalValue * this.numericalValue;
        if (isWithinJsPrecision(productVal)) {
            return new CompactNumber(productVal);
        }
        // If product exceeds JS precision, convert to large number multiplication.
        const absOtherVal = Math.abs(otherCompact.numericalValue);
        const absThisDigits = convertSmallToDigits(Math.abs(this.numericalValue));
        return multiplySmallAndDigitArray(absOtherVal, absThisDigits, this.isNegative !== otherCompact.isNegative);
    };

    // Internal helper for LargeNumber to multiply by a small number (CompactNumber).
    LargeNumber.prototype._multiplyByCompact = function(otherCompact) {
        if (otherCompact.numericalValue === 0) return NumericEntity.ZERO;
        if (otherCompact.numericalValue === 1) return this;
        if (otherCompact.numericalValue === -1) return this.flipSign();
        return multiplySmallAndDigitArray(Math.abs(otherCompact.numericalValue), this.digitArray, this.isNegative !== otherCompact.isNegative);
    };

    // CompactNumber Multiplication
    CompactNumber.prototype.multiply = function(otherVal) {
        const otherNum = castToNumericEntity(otherVal);
        return otherNum._multiplyByCompact(this); // Delegate to internal helper
    };
    CompactNumber.prototype.times = CompactNumber.prototype.multiply; // Alias

    /**
     * Squares a digit array.
     * @param {number[]} digitVec - The digit array to square.
     * @returns {number[]} The squared result.
     */
    function squareDigits(digitVec) {
        const currentLen = digitVec.length;
        const resultArr = initializeDigitArray(2 * currentLen); // Result can have up to 2*len digits
        let currentProduct, currentCarry;
        let digit_i_val, digit_j_val;

        for (let i = 0; i < currentLen; i++) {
            digit_i_val = digitVec[i];
            currentCarry = 0;

            // Compute 2 * (a_i * a_j) for j > i and a_i * a_i for j = i
            // The loop computes 2 * (a_i * a_j) for j > i and adds a_i*a_i.
            // The initial carry is set to -a_i*a_i to adjust for the double counting later.
            // This is a specific optimization for squaring.
            // A more straightforward but possibly slower way is to use multiplyDigitArraysLong(digitVec, digitVec).
            currentProduct = digit_i_val * digit_i_val + resultArr[i + i]; // Diagonal term
            currentCarry = Math.floor(currentProduct / DIGIT_BASE);
            resultArr[i + i] = currentProduct % DIGIT_BASE;

            for (let j = i + 1; j < currentLen; j++) {
                digit_j_val = digitVec[j];
                currentProduct = 2 * (digit_i_val * digit_j_val) + resultArr[i + j] + currentCarry;
                currentCarry = Math.floor(currentProduct / DIGIT_BASE);
                resultArr[i + j] = currentProduct % DIGIT_BASE;
            }
            resultArr[i + currentLen] += currentCarry; // Add remaining carry
        }
        normalizeDigitArray(resultArr);
        return resultArr;
    }

    // LargeNumber Square
    LargeNumber.prototype.square = function() {
        return new LargeNumber(squareDigits(this.digitArray), false);
    };

    // CompactNumber Square
    CompactNumber.prototype.square = function() {
        const squaredValue = this.numericalValue * this.numericalValue;
        if (isWithinJsPrecision(squaredValue)) {
            return new CompactNumber(squaredValue);
        }
        // If squared value exceeds JS precision, convert to large number square.
        return new LargeNumber(squareDigits(convertSmallToDigits(Math.abs(this.numericalValue))), false);
    };

    /**
     * Performs division and modulo using Knuth's Algorithm D (normalized division).
     * @param {number[]} dividendDigits - The dividend.
     * @param {number[]} divisorDigits - The divisor.
     * @returns {[number[], number[]]} An array containing [quotient, remainder].
     */
    function longDivisionAlgorithm(dividendDigits, divisorDigits) {
        const len_dividend = dividendDigits.length;
        const len_divisor = divisorDigits.length;
        const quotientResult = initializeDigitArray(len_dividend - len_divisor + 1); // Max possible quotient length

        // Normalization: Multiply both by `lambda` such that the most significant digit of divisor >= DIGIT_BASE/2.
        // This ensures the first guess of quotient digit is usually accurate.
        const divisorMostSignificantDigit = divisorDigits[len_divisor - 1];
        const normalizationFactor = Math.ceil(DIGIT_BASE / (2 * divisorMostSignificantDigit)); // Knuth's 'd' factor

        const normalizedDividend = multiplyDigitsBySmall(dividendDigits, normalizationFactor);
        const normalizedDivisor = multiplyDigitsBySmall(divisorDigits, normalizationFactor);

        // Adjust lengths after normalization
        const normDivLen = normalizedDivisor.length;
        const normDivMSD = normalizedDivisor[normDivLen - 1];

        // Ensure normalizedDividend has enough room at the top for intermediate calculations.
        if (normalizedDividend.length <= len_dividend) {
            normalizedDividend.push(0);
        }
        // Ensure normalizedDivisor has a trailing zero for easier loop boundary.
        normalizedDivisor.push(0); // This is not strictly necessary for the algorithm but sometimes simplifies indexing.

        let quotientDigitGuess, shiftIdx, currentCarry, currentBorrow, loopIdx, q;

        // Main loop for calculating quotient digits.
        for (shiftIdx = len_dividend - len_divisor; shiftIdx >= 0; --shiftIdx) {
            // Estimate quotient digit (q_hat)
            const dividendHigh = normalizedDividend[shiftIdx + normDivLen - 1] * DIGIT_BASE + normalizedDividend[shiftIdx + normDivLen - 2];
            quotientDigitGuess = floorValue(dividendHigh / normDivMSD);

            // Clamp q_hat to [0, DIGIT_BASE - 1]
            if (quotientDigitGuess >= DIGIT_BASE) quotientDigitGuess = DIGIT_BASE - 1;
            if (quotientDigitGuess < 0) quotientDigitGuess = 0; // Should not happen with positive numbers

            // Subtract (q_hat * normalizedDivisor) from a section of normalizedDividend.
            currentCarry = 0;
            currentBorrow = 0;
            for (loopIdx = 0; loopIdx < normDivLen; ++loopIdx) {
                currentCarry += quotientDigitGuess * normalizedDivisor[loopIdx];
                q = floorValue(currentCarry / DIGIT_BASE);
                currentBorrow += normalizedDividend[shiftIdx + loopIdx] - (currentCarry - q * DIGIT_BASE);
                currentCarry = q;
                if (currentBorrow < 0) {
                    normalizedDividend[shiftIdx + loopIdx] = currentBorrow + DIGIT_BASE;
                    currentBorrow = -1;
                } else {
                    normalizedDividend[shiftIdx + loopIdx] = currentBorrow;
                    currentBorrow = 0;
                }
            }
            normalizedDividend[shiftIdx + normDivLen] += currentBorrow; // Propagate final borrow

            // Adjust q_hat if it was too large (i.e., if subtraction resulted in a negative value).
            while (currentBorrow !== 0) {
                quotientDigitGuess -= 1;
                currentCarry = 0;
                // Add back normalizedDivisor to normalizedDividend (undo the too-large subtraction).
                for (loopIdx = 0; loopIdx < normDivLen; ++loopIdx) {
                    currentCarry += normalizedDividend[shiftIdx + loopIdx] - DIGIT_BASE + normalizedDivisor[loopIdx];
                    if (currentCarry < 0) {
                        normalizedDividend[shiftIdx + loopIdx] = currentCarry + DIGIT_BASE;
                        currentCarry = 0;
                    } else {
                        normalizedDividend[shiftIdx + loopIdx] = currentCarry;
                        currentCarry = 1;
                    }
                }
                currentBorrow += currentCarry; // Update borrow based on this adjustment.
            }
            quotientResult[shiftIdx] = quotientDigitGuess;
        }

        // Denormalize the remainder
        const remainderResult = divideDigitsBySmall(normalizedDividend, normalizationFactor)[0];
        normalizeDigitArray(remainderResult);
        normalizeDigitArray(quotientResult);

        return [quotientResult, remainderResult];
    }

    /**
     * Performs a simpler division algorithm, typically used for smaller numbers or as a fallback.
     * Continuously subtracts the divisor from parts of the dividend.
     * @param {number[]} dividendDigits - The dividend.
     * @param {number[]} divisorDigits - The divisor.
     * @returns {[number[], number[]]} An array containing [quotient, remainder].
     */
    function shortDivisionAlgorithm(dividendDigits, divisorDigits) {
        let currentDividendLen = dividendDigits.length;
        const divisorLen = divisorDigits.length;
        const quotientDigits = [];
        let partialDividend = [];
        let currentQuotientDigit;
        let xLen, highX, highY;

        // Loop from the most significant digit down.
        while (currentDividendLen > 0) {
            // Take one digit from the dividend and prepend it to the partial dividend.
            partialDividend.unshift(dividendDigits[--currentDividendLen]);
            normalizeDigitArray(partialDividend); // Trim leading zeros if any

            // If the partial dividend is smaller than the divisor, quotient digit is 0.
            if (compareAbsoluteValues(partialDividend, divisorDigits) < 0) {
                quotientDigits.push(0);
                continue;
            }

            // Estimate the quotient digit.
            xLen = partialDividend.length;
            highX = partialDividend[xLen - 1] * DIGIT_BASE + (partialDividend[xLen - 2] || 0); // Get top two digits
            highY = divisorDigits[divisorLen - 1] * DIGIT_BASE + (divisorDigits[divisorLen - 2] || 0); // Get top two digits of divisor

            // If partial dividend is longer than divisor, adjust highX to make guess more accurate.
            if (xLen > divisorLen) {
                highX = (highX + 1) * DIGIT_BASE; // Effectively adds another "zero" digit.
            }

            currentQuotientDigit = Math.ceil(highX / highY);

            // Refine guess by trial subtraction.
            let trialProduct;
            do {
                trialProduct = multiplyDigitsBySmall(divisorDigits, currentQuotientDigit);
                if (compareAbsoluteValues(trialProduct, partialDividend) <= 0) break;
                currentQuotientDigit--;
            } while (currentQuotientDigit); // Loop until trialProduct <= partialDividend

            quotientDigits.push(currentQuotientDigit);
            // Subtract the trial product from the partial dividend.
            partialDividend = performArraySubtraction(partialDividend, trialProduct);
        }

        quotientDigits.reverse(); // Quotient digits were accumulated in reverse order.
        return [convertDigitsToSmall(quotientDigits), convertDigitsToSmall(partialDividend)];
    }

    /**
     * Divides a digit array by a small JavaScript number.
     * @param {number[]} digitVec - The dividend.
     * @param {number} smallDivisor - The small integer divisor.
     * @returns {[number[], number]} An array containing [quotient, remainder].
     */
    function divideDigitsBySmall(digitVec, smallDivisor) {
        const currentLen = digitVec.length;
        const quotientArr = initializeDigitArray(currentLen);
        let remainder = 0;
        let currentDividend, q;

        // Perform long division from most significant digit to least.
        for (let i = currentLen - 1; i >= 0; --i) {
            currentDividend = remainder * DIGIT_BASE + digitVec[i];
            q = floorValue(currentDividend / smallDivisor);
            remainder = currentDividend - q * smallDivisor;
            quotientArr[i] = q | 0; // Ensure integer
        }
        return [quotientArr, remainder | 0]; // Ensure integer remainder
    }

    /**
     * General division and modulo function, handling all number types and signs.
     * @param {NumericEntity} currentNum - The dividend.
     * @param {*} divisorVal - The divisor (can be any type parseable by `castToNumericEntity`).
     * @returns {[NumericEntity, NumericEntity]} An array containing [quotient, remainder].
     */
    function performDivisionAndModulo(currentNum, divisorVal) {
        const divisorNum = castToNumericEntity(divisorVal);
        const dividendDigits = currentNum.digitArray;
        const divisorDigits = divisorNum.digitArray;
        let quotientResult;

        // Handle division by zero
        if (divisorNum.isActualZero()) {
            throw new Error("Cannot divide by zero.");
        }

        // Optimized for small numbers
        if (currentNum.isSmall) {
            if (divisorNum.isSmall) {
                // Both small: use native JS division
                return [new CompactNumber(floorValue(currentNum.numericalValue / divisorNum.numericalValue)), new CompactNumber(currentNum.numericalValue % divisorNum.numericalValue)];
            }
            // Small dividend, large divisor: quotient is 0, remainder is dividend itself
            return [NumericEntity.ZERO, currentNum];
        }

        // Optimized for small divisors (large dividend / small divisor)
        if (divisorNum.isSmall) {
            const smallDivisorVal = divisorNum.numericalValue;
            if (smallDivisorVal === 1) return [currentNum, NumericEntity.ZERO];
            if (smallDivisorVal === -1) return [currentNum.flipSign(), NumericEntity.ZERO];
            const absSmallDivisor = Math.abs(smallDivisorVal);
            if (absSmallDivisor < DIGIT_BASE) {
                const divisionTuple = divideDigitsBySmall(dividendDigits, absSmallDivisor);
                quotientResult = divisionTuple[0];
                let remainderResult = divisionTuple[1];

                // Adjust remainder sign if original dividend was negative
                if (currentNum.isNegative) remainderResult = -remainderResult;

                const smallQuotient = convertDigitsToSmall(quotientResult);
                let finalQuotient;
                if (typeof smallQuotient === "number") {
                    if (currentNum.isNegative !== divisorNum.isNegative) smallQuotient = -smallQuotient;
                    finalQuotient = new CompactNumber(smallQuotient);
                } else {
                    finalQuotient = new LargeNumber(smallQuotient, currentNum.isNegative !== divisorNum.isNegative);
                }
                return [finalQuotient, new CompactNumber(remainderResult)];
            }
            // If small divisor is larger than a single digit, convert it to array for long division.
            // This case should ideally be handled by the general case.
            // For now, let's convert `smallDivisorVal` to digits and proceed.
            // The original code passed `smallToArray(abs)` which is equivalent to this.
            // Let's ensure `divisorDigits` is correctly set for the general case.
            // This path is redundant if the next `if` handles `divisorDigits` being `smallToArray(abs)`.
            // Let's ensure `divisorDigits` is always a digit array for the general case.
        }

        // General case for large numbers
        const comparison = compareAbsoluteValues(dividendDigits, divisorDigits);
        if (comparison === -1) {
            // Dividend < Divisor (absolute values), quotient is 0, remainder is dividend
            return [NumericEntity.ZERO, currentNum];
        }
        if (comparison === 0) {
            // Dividend === Divisor (absolute values), quotient is 1 (or -1), remainder is 0
            return [NumericEntity[currentNum.isNegative !== divisorNum.isNegative ? -1 : 1], NumericEntity.ZERO];
        }

        // Choose division algorithm based on length (heuristic)
        // Original heuristic was a.length + b.length <= 200 for divMod1, else divMod2.
        // Let's slightly tweak or keep for recognizing similarity.
        // For simplicity, let's use longDivisionAlgorithm (divMod1) for general case.
        // The original code had specific conditions, let's try to match them.
        if (dividendDigits.length + divisorDigits.length <= 200) { // Arbitrary threshold
            quotientResult = longDivisionAlgorithm(dividendDigits, divisorDigits);
        } else {
            quotientResult = shortDivisionAlgorithm(dividendDigits, divisorDigits);
        }

        let finalQuotient = quotientResult[0];
        let finalRemainder = quotientResult[1];

        // Determine signs for quotient and remainder
        const quotientSign = currentNum.isNegative !== divisorNum.isNegative;
        const remainderSign = currentNum.isNegative;

        // Convert quotient to NumericEntity
        if (typeof finalQuotient === "number") {
            if (quotientSign) finalQuotient = -finalQuotient;
            finalQuotient = new CompactNumber(finalQuotient);
        } else {
            finalQuotient = new LargeNumber(finalQuotient, quotientSign);
        }

        // Convert remainder to NumericEntity
        if (typeof finalRemainder === "number") {
            if (remainderSign) finalRemainder = -finalRemainder;
            finalRemainder = new CompactNumber(finalRemainder);
        } else {
            finalRemainder = new LargeNumber(finalRemainder, remainderSign);
        }

        return [finalQuotient, finalRemainder];
    }

    // Division and Modulo methods
    LargeNumber.prototype.getDivisionResult = function(otherVal) {
        const result = performDivisionAndModulo(this, otherVal);
        return {
            quotient: result[0],
            remainder: result[1]
        };
    };
    CompactNumber.prototype.getDivisionResult = LargeNumber.prototype.getDivisionResult;

    LargeNumber.prototype.getQuotient = function(otherVal) {
        return performDivisionAndModulo(this, otherVal)[0];
    };
    CompactNumber.prototype.getQuotientAlias = CompactNumber.prototype.getQuotient =
        LargeNumber.prototype.getQuotientAlias = LargeNumber.prototype.getQuotient;

    LargeNumber.prototype.getRemainder = function(otherVal) {
        return performDivisionAndModulo(this, otherVal)[1];
    };
    CompactNumber.prototype.getRemainderAlias = CompactNumber.prototype.getRemainder =
        LargeNumber.prototype.getRemainderAlias = LargeNumber.prototype.getRemainder;

    // Exponentiation (pow)
    LargeNumber.prototype.exponentiate = function(exponentVal) {
        const exponentNum = castToNumericEntity(exponentVal);
        const thisValue = this.numericalValue; // Only relevant for CompactNumber, but accessed here for brevity

        // Handle base cases for exponentiation
        if (exponentNum.isActualZero()) return NumericEntity.ONE; // x^0 = 1
        if (this.isActualZero()) return NumericEntity.ZERO; // 0^n = 0 (for n > 0)
        if (this.isOneOrMinusOne()) { // 1^n = 1, (-1)^n = 1 if n even, -1 if n odd
            if (this.isEqualTo(NumericEntity.ONE)) return NumericEntity.ONE;
            return exponentNum.isEvenlyDivisible() ? NumericEntity.ONE : NumericEntity.MINUS_ONE;
        }
        if (exponentNum.isTrulyNegative()) {
            // Negative exponents result in fractions, which our BigInt doesn't handle directly.
            // For integer exponents, this typically implies a result of 0.
            return NumericEntity.ZERO;
        }

        // If exponent is too large, it's an error for non-zero bases.
        if (!exponentNum.isSmall) {
            throw new Error(`The exponent ${exponentNum.toTextString()} is too large for this operation.`);
        }

        // If base is small, try native JS exponentiation first.
        if (this.isSmall) {
            const resultValue = Math.pow(thisValue, exponentNum.numericalValue);
            if (isWithinJsPrecision(resultValue)) {
                return new CompactNumber(floorValue(resultValue));
            }
        }

        // Binary exponentiation (exponentiation by squaring)
        let base = this;
        let result = NumericEntity.ONE;
        let currentExp = exponentNum.numericalValue;

        while (true) {
            if (currentExp % 2 === 1) { // If exponent is odd
                result = result.multiply(base);
                currentExp--; // Decrement exponent
            }
            if (currentExp === 0) break;
            currentExp /= 2; // Halve the exponent
            base = base.square(); // Square the base
        }
        return result;
    };
    CompactNumber.prototype.exponentiate = LargeNumber.prototype.exponentiate; // Inherit

    // Modular Exponentiation (modPow)
    LargeNumber.prototype.modularExponentiation = function(expVal, modVal) {
        let exponent = castToNumericEntity(expVal);
        const modulus = castToNumericEntity(modVal);

        if (modulus.isActualZero()) {
            throw new Error("Cannot compute modular exponentiation with modulus 0.");
        }

        let result = NumericEntity.ONE;
        let currentBase = this.getRemainder(modulus); // base % modulus

        // Handle negative exponent: modInv is needed, not implemented directly here for negative exp.
        if (exponent.isTrulyNegative()) {
             // For integer BigInt, negative exponent behavior is usually undefined or 0.
             // If modular inverse is expected for negative exponents, it needs to be implemented.
             // For now, consistent with pow, assume 0 or error.
             if (!currentBase.isActualZero()) {
                 // For a^b mod m, if b < 0, it means (a^-1)^|b| mod m.
                 // This requires modular inverse of 'a' first.
                 // This is not in the original, so we stick to non-negative exponents.
                 throw new Error("Negative exponents for modular exponentiation not supported.");
             } else {
                 return NumericEntity.ZERO; // 0^negative_exp mod m is typically 0.
             }
        }

        // Loop while exponent is positive
        while (exponent.isTrulyPositive()) {
            if (currentBase.isActualZero()) return NumericEntity.ZERO; // If base becomes 0, result is 0.
            if (exponent.isOddlyDivisible()) {
                result = result.multiply(currentBase).getRemainder(modulus);
            }
            exponent = exponent.getQuotient(NumericEntity.TWO); // exponent / 2
            currentBase = currentBase.square().getRemainder(modulus); // base^2 % modulus
        }
        return result;
    };
    CompactNumber.prototype.modularExponentiation = LargeNumber.prototype.modularExponentiation; // Inherit

    /**
     * Compares the absolute values of two digit arrays.
     * @param {number[]} arrA - First digit array.
     * @param {number[]} arrB - Second digit array.
     * @returns {number} 1 if arrA > arrB, -1 if arrA < arrB, 0 if arrA === arrB.
     */
    function compareAbsoluteValues(arrA, arrB) {
        // Compare lengths first
        if (arrA.length !== arrB.length) {
            return arrA.length > arrB.length ? 1 : -1;
        }
        // If lengths are equal, compare digits from most significant to least.
        for (let i = arrA.length - 1; i >= 0; i--) {
            if (arrA[i] !== arrB[i]) {
                return arrA[i] > arrB[i] ? 1 : -1;
            }
        }
        return 0; // Arrays are identical
    }

    // Absolute Value Comparison
    LargeNumber.prototype.compareAbsoluteValues = function(otherVal) {
        const otherNum = castToNumericEntity(otherVal);
        const thisDigits = this.digitArray;

        if (otherNum.isSmall) {
            // If other is small, convert it to digits for comparison.
            // Special handling if otherNum is 0, since convertSmallToDigits(0) is [0].
            if (otherNum.isActualZero()) {
                return this.isActualZero() ? 0 : 1;
            }
            return compareAbsoluteValues(thisDigits, convertSmallToDigits(Math.abs(otherNum.numericalValue)));
        }
        return compareAbsoluteValues(thisDigits, otherNum.digitArray);
    };
    CompactNumber.prototype.compareAbsoluteValues = function(otherVal) {
        const otherNum = castToNumericEntity(otherVal);
        const thisAbs = Math.abs(this.numericalValue);

        if (otherNum.isSmall) {
            const otherAbs = Math.abs(otherNum.numericalValue);
            if (thisAbs === otherAbs) return 0;
            return thisAbs > otherAbs ? 1 : -1;
        }
        // If this is small and other is large, this is always smaller.
        return -1;
    };

    // General Comparison
    LargeNumber.prototype.compareWith = function(otherVal) {
        // Handle special JS number values
        if (otherVal === Infinity) return -1;
        if (otherVal === -Infinity) return 1;

        const otherNum = castToNumericEntity(otherVal);

        // Compare signs first
        if (this.isNegative !== otherNum.isNegative) {
            return otherNum.isNegative ? 1 : -1; // If this is positive and other negative, this > other. Vice versa.
        }

        // If signs are the same, compare absolute values.
        // For negative numbers, the "larger" absolute value means a "smaller" number.
        const comparisonResult = this.compareAbsoluteValues(otherNum);
        return this.isNegative ? -comparisonResult : comparisonResult;
    };
    LargeNumber.prototype.compareToAlias = LargeNumber.prototype.compareWith; // Alias

    CompactNumber.prototype.compareWith = function(otherVal) {
        // Handle special JS number values
        if (otherVal === Infinity) return -1;
        if (otherVal === -Infinity) return 1;

        const otherNum = castToNumericEntity(otherVal);
        const thisValue = this.numericalValue;

        if (otherNum.isSmall) {
            const otherValue = otherNum.numericalValue;
            if (thisValue === otherValue) return 0;
            return thisValue > otherValue ? 1 : -1;
        }

        // One is small, other is large. Compare based on signs.
        if (thisValue < 0 !== otherNum.isNegative) {
            return thisValue < 0 ? -1 : 1; // If this is negative, other is positive. This < other.
        }
        // If both are same sign (e.g., both positive, this small, other large)
        // or both negative (this small, other large)
        return thisValue < 0 ? 1 : -1; // If negative, small is "larger" (closer to 0). If positive, small is "smaller".
    };
    CompactNumber.prototype.compareToAlias = CompactNumber.prototype.compareWith; // Alias

    // Equality Checks
    LargeNumber.prototype.isEqualTo = function(otherVal) {
        return this.compareWith(otherVal) === 0;
    };
    CompactNumber.prototype.isEqualToAlias = CompactNumber.prototype.isEqualTo =
        LargeNumber.prototype.isEqualToAlias = LargeNumber.prototype.isEqualTo;

    LargeNumber.prototype.isNotEqualTo = function(otherVal) {
        return this.compareWith(otherVal) !== 0;
    };
    CompactNumber.prototype.isNotEqualToAlias = CompactNumber.prototype.isNotEqualTo =
        LargeNumber.prototype.isNotEqualToAlias = LargeNumber.prototype.isNotEqualTo;

    // Relational Operators
    LargeNumber.prototype.isGreaterThan = function(otherVal) {
        return this.compareWith(otherVal) > 0;
    };
    CompactNumber.prototype.isGreaterThanAlias = CompactNumber.prototype.isGreaterThan =
        LargeNumber.prototype.isGreaterThanAlias = LargeNumber.prototype.isGreaterThan;

    LargeNumber.prototype.isLesserThan = function(otherVal) {
        return this.compareWith(otherVal) < 0;
    };
    CompactNumber.prototype.isLesserThanAlias = CompactNumber.prototype.isLesserThan =
        LargeNumber.prototype.isLesserThanAlias = LargeNumber.prototype.isLesserThan;

    LargeNumber.prototype.isGreaterOrEqualTo = function(otherVal) {
        return this.compareWith(otherVal) >= 0;
    };
    CompactNumber.prototype.isGreaterOrEqualToAlias = CompactNumber.prototype.isGreaterOrEqualTo =
        LargeNumber.prototype.isGreaterOrEqualToAlias = LargeNumber.prototype.isGreaterOrEqualTo;

    LargeNumber.prototype.isLesserOrEqualTo = function(otherVal) {
        return this.compareWith(otherVal) <= 0;
    };
    CompactNumber.prototype.isLesserOrEqualToAlias = CompactNumber.prototype.isLesserOrEqualTo =
        LargeNumber.prototype.isLesserOrEqualToAlias = LargeNumber.prototype.isLesserOrEqualTo;

    // Property checks
    LargeNumber.prototype.isEvenlyDivisible = function() {
        return (this.digitArray[0] & 1) === 0; // Check least significant digit
    };
    CompactNumber.prototype.isEvenlyDivisible = function() {
        return (this.numericalValue & 1) === 0;
    };

    LargeNumber.prototype.isOddlyDivisible = function() {
        return (this.digitArray[0] & 1) === 1;
    };
    CompactNumber.prototype.isOddlyDivisible = function() {
        return (this.numericalValue & 1) === 1;
    };

    LargeNumber.prototype.isTrulyPositive = function() {
        return !this.isNegative;
    };
    CompactNumber.prototype.isTrulyPositive = function() {
        return this.numericalValue > 0;
    };

    LargeNumber.prototype.isTrulyNegative = function() {
        return this.isNegative;
    };
    CompactNumber.prototype.isTrulyNegative = function() {
        return this.numericalValue < 0;
    };

    LargeNumber.prototype.isOneOrMinusOne = function() {
        return false; // Only CompactNumber can be 1 or -1 directly
    };
    CompactNumber.prototype.isOneOrMinusOne = function() {
        return Math.abs(this.numericalValue) === 1;
    };

    LargeNumber.prototype.isActualZero = function() {
        return false; // Only CompactNumber can be 0 directly
    };
    CompactNumber.prototype.isActualZero = function() {
        return this.numericalValue === 0;
    };

    LargeNumber.prototype.isDivisibleByOther = function(otherVal) {
        const otherNum = castToNumericEntity(otherVal);
        const otherValue = otherNum.numericalValue; // For small number optimization

        if (otherNum.isActualZero()) return false; // Cannot divide by zero
        if (otherNum.isOneOrMinusOne()) return true; // Divisible by 1 or -1
        if (otherNum.isEqualTo(NumericEntity.TWO)) return this.isEvenlyDivisible(); // Divisible by 2 check

        // General case: check if remainder is zero
        return this.getRemainder(otherNum).isEqualTo(NumericEntity.ZERO);
    };
    CompactNumber.prototype.isDivisibleByOther = LargeNumber.prototype.isDivisibleByOther; // Inherit

    /**
     * Checks if a number is a "basic" prime (2, 3, 5, or small numbers not divisible by these).
     * @param {NumericEntity} numToCheck - The number to check.
     * @returns {boolean|undefined} True if basic prime, false if composite, undefined if needs further checks.
     */
    function isTrivialPrime(numToCheck) {
        const absNum = numToCheck.absoluteValue();
        if (absNum.isOneOrMinusOne()) return false; // 1 and -1 are not prime
        if (absNum.isEqualTo(NumericEntity.TWO) || absNum.isEqualTo(NumericEntity.THREE) || absNum.isEqualTo(NumericEntity.FIVE)) return true;
        if (absNum.isEvenlyDivisible() || absNum.isDivisibleByOther(NumericEntity.THREE) || absNum.isDivisibleByOther(NumericEntity.FIVE)) return false;
        // For numbers less than 25, if they passed above checks, they are prime (7, 11, 13, 17, 19, 23).
        if (absNum.isLesserThan(largeNumFactory(25))) return true;
    }

    // Primality Tests
    LargeNumber.prototype.checkPrimality = function() {
        const basicCheck = isTrivialPrime(this);
        if (basicCheck !== undefined) return basicCheck; // Return early if trivial prime/composite

        const absN = this.absoluteValue();
        const nMinusOne = absN.decrementByOne(); // n-1

        // Miller-Rabin witnesses (for small primes)
        const witnesses = [2, 3, 5, 7, 11, 13, 17, 19];
        let currentB = nMinusOne; // n-1 = 2^s * d
        let dVal; // d
        let sCount = 0; // s

        // Find d and s such that n-1 = 2^s * d, where d is odd
        while (currentB.isEvenlyDivisible()) {
            currentB = currentB.getQuotient(NumericEntity.TWO);
            sCount++;
        }
        dVal = currentB;

        // Miller-Rabin test for each witness
        for (let i = 0; i < witnesses.length; i++) {
            const witnessNum = largeNumFactory(witnesses[i]);
            if (witnessNum.isGreaterOrEqualTo(absN)) break; // Witness must be < n

            let x = witnessNum.modularExponentiation(dVal, absN); // x = a^d mod n

            if (x.isEqualTo(NumericEntity.ONE) || x.isEqualTo(nMinusOne)) {
                continue; // Witness passes, move to next
            }

            let pass = false;
            // x = x^(2^r) mod n for 0 <= r < s
            for (let r = 0; r < sCount; r++) {
                x = x.square().getRemainder(absN);
                if (x.isEqualTo(nMinusOne)) {
                    pass = true;
                    break;
                }
            }
            if (!pass) return false; // Witness failed, n is composite
        }
        return true; // Passed all witness tests, likely prime
    };
    CompactNumber.prototype.checkPrimality = LargeNumber.prototype.checkPrimality; // Inherit

    LargeNumber.prototype.checkProbablePrimality = function(iterations) {
        const basicCheck = isTrivialPrime(this);
        if (basicCheck !== undefined) return basicCheck;

        const absN = this.absoluteValue();
        if (absN.isLesserOrEqualTo(NumericEntity.ONE)) return false; // 0, 1 are not prime

        const numIterations = iterations === undefined ? 5 : iterations; // Default 5 iterations

        for (let i = 0; i < numIterations; i++) {
            // Pick a random 'a' such that 2 <= a <= n-2
            const randomA = largeNumFactory.randomBetweenRange(NumericEntity.TWO, absN.decrementByOne().decrementByOne());
            // Check if a^(n-1) === 1 (mod n) (Fermat's Little Theorem)
            // This is a weak test; a full Miller-Rabin is stronger.
            // The original code implies Miller-Rabin was intended for `isPrime`,
            // and `isProbablePrime` is a simpler Fermat check (a^(n-1) != 1 mod n => composite).
            // A number `n` is composite if `a^(n-1) != 1 (mod n)` for some `a`.
            // If it is `1 (mod n)` for all chosen `a`, it's probably prime.
            if (!randomA.modularExponentiation(absN.decrementByOne(), absN).isOneOrMinusOne()) {
                return false; // Not a unit (1 or -1), so not prime.
            }
        }
        return true; // Probably prime
    };
    CompactNumber.prototype.checkProbablePrimality = LargeNumber.prototype.checkProbablePrimality; // Inherit

    // Modular Inverse (Extended Euclidean Algorithm)
    LargeNumber.prototype.modularInverse = function(modulusVal) {
        let tempT = NumericEntity.ZERO;
        let newTempT = NumericEntity.ONE;
        let remainder = castToNumericEntity(modulusVal);
        let newRemainder = this.absoluteValue(); // Ensure positive for algorithm

        // Check for modulus 0 or 1
        if (remainder.isActualZero() || remainder.isOneOrMinusOne()) {
            throw new Error("Modulus must be > 1 for modular inverse.");
        }

        let quotientVal, lastT, lastR;

        // Extended Euclidean Algorithm
        while (!newRemainder.isActualZero()) {
            quotientVal = remainder.getQuotient(newRemainder);
            lastT = tempT;
            lastR = remainder;

            tempT = newTempT;
            remainder = newRemainder;

            newTempT = lastT.subtract(quotientVal.multiply(newTempT));
            newRemainder = lastR.subtract(quotientVal.multiply(newRemainder));
        }

        // If remainder is not 1, then no modular inverse exists (not co-prime)
        if (!remainder.isEqualTo(NumericEntity.ONE)) {
            throw new Error(`${this.toTextString()} and ${modulusVal.toTextString()} are not co-prime.`);
        }

        // Adjust t to be positive
        if (tempT.compareWith(NumericEntity.ZERO) === -1) {
            tempT = tempT.add(modulusVal);
        }

        // If original number was negative, invert the result mod n
        if (this.isTrulyNegative()) {
            return tempT.flipSign().getRemainder(modulusVal); // Remainder will handle modulus for negative
        }
        return tempT;
    };
    CompactNumber.prototype.modularInverse = LargeNumber.prototype.modularInverse; // Inherit

    // Increment/Decrement by one
    LargeNumber.prototype.incrementByOne = function() {
        const currentDigits = this.digitArray;
        if (this.isNegative) {
            // -N + 1 => -(N - 1)
            return subtractSmallNumberFromDigits(currentDigits, 1, this.isNegative);
        }
        return new LargeNumber(addSmallNumberToDigits(currentDigits, 1), this.isNegative);
    };
    CompactNumber.prototype.incrementByOne = function() {
        const currentVal = this.numericalValue;
        if (currentVal + 1 < JAVASCRIPT_MAX_SAFE_INT) {
            return new CompactNumber(currentVal + 1);
        }
        // If it overflows JS safe int, convert to LargeNumber.
        return new LargeNumber(MAX_SAFE_INT_DIGITS, false).incrementByOne(); // MAX_SAFE_INT_DIGITS + 1
    };

    LargeNumber.prototype.decrementByOne = function() {
        const currentDigits = this.digitArray;
        if (this.isNegative) {
            // -N - 1 => -(N + 1)
            return new LargeNumber(addSmallNumberToDigits(currentDigits, 1), true);
        }
        return subtractSmallNumberFromDigits(currentDigits, 1, this.isNegative);
    };
    CompactNumber.prototype.decrementByOne = function() {
        const currentVal = this.numericalValue;
        if (currentVal - 1 > -JAVASCRIPT_MAX_SAFE_INT) {
            return new CompactNumber(currentVal - 1);
        }
        // If it underflows JS safe int, convert to LargeNumber.
        const maxNegDigits = convertSmallToDigits(JAVASCRIPT_MAX_SAFE_INT);
        return new LargeNumber(maxNegDigits, true).decrementByOne(); // -(MAX_SAFE_INT_DIGITS + 1)
    };

    // Pre-calculated powers of two for efficient bit shifts
    const powersOfTwoCache = [1];
    while (2 * powersOfTwoCache[powersOfTwoCache.length - 1] <= DIGIT_BASE) {
        powersOfTwoCache.push(2 * powersOfTwoCache[powersOfTwoCache.length - 1]);
    }
    const powersOfTwoCacheLength = powersOfTwoCache.length;
    const largestCachedPowerOfTwo = powersOfTwoCache[powersOfTwoCacheLength - 1];

    /**
     * Checks if a shift amount is small enough to be handled directly by JS number.
     * @param {*} shiftAmount - The amount to shift.
     * @returns {boolean} True if small, false otherwise.
     */
    function isShiftAmountSmall(shiftAmount) {
        return (typeof shiftAmount === "number" || typeof shiftAmount === "string") &&
            +Math.abs(shiftAmount) <= DIGIT_BASE ||
            shiftAmount instanceof LargeNumber && shiftAmount.digitArray.length <= 1;
    }

    // Bitwise Shift Left (multiplication by 2^n)
    LargeNumber.prototype.bitwiseShiftLeft = function(shiftAmount) {
        if (!isShiftAmountSmall(shiftAmount)) {
            throw new Error(`Shift amount ${String(shiftAmount)} is too large for shifting.`);
        }
        let n = +shiftAmount;
        if (n < 0) return this.bitwiseShiftRight(-n); // Delegate to right shift for negative shifts

        let currentResult = this;
        if (currentResult.isActualZero()) return currentResult;

        // Apply shifts in chunks using cached powers of two
        while (n >= powersOfTwoCacheLength) {
            currentResult = currentResult.multiply(largestCachedPowerOfTwo);
            n -= powersOfTwoCacheLength - 1; // Subtract 2^(powersOfTwoCacheLength-1) (largest power in cache)
        }
        return currentResult.multiply(powersOfTwoCache[n]);
    };
    CompactNumber.prototype.bitwiseShiftLeft = LargeNumber.prototype.bitwiseShiftLeft; // Inherit

    // Bitwise Shift Right (division by 2^n)
    LargeNumber.prototype.bitwiseShiftRight = function(shiftAmount) {
        let divisionRemainderPair;
        if (!isShiftAmountSmall(shiftAmount)) {
            throw new Error(`Shift amount ${String(shiftAmount)} is too large for shifting.`);
        }
        let n = +shiftAmount;
        if (n < 0) return this.bitwiseShiftLeft(-n); // Delegate to left shift for negative shifts

        let currentResult = this;

        // Apply shifts in chunks using cached powers of two
        while (n >= powersOfTwoCacheLength) {
            if (currentResult.isActualZero() || (currentResult.isTrulyNegative() && currentResult.isOneOrMinusOne())) {
                return currentResult; // Shifting -1 right results in -1, shifting 0 right results in 0.
            }
            divisionRemainderPair = performDivisionAndModulo(currentResult, largestCachedPowerOfTwo);
            currentResult = divisionRemainderPair[1].isTrulyNegative() ? divisionRemainderPair[0].decrementByOne() : divisionRemainderPair[0];
            n -= powersOfTwoCacheLength - 1;
        }
        divisionRemainderPair = performDivisionAndModulo(currentResult, powersOfTwoCache[n]);
        return divisionRemainderPair[1].isTrulyNegative() ? divisionRemainderPair[0].decrementByOne() : divisionRemainderPair[0];
    };
    CompactNumber.prototype.bitwiseShiftRight = LargeNumber.prototype.bitwiseShiftRight; // Inherit

    /**
     * Generic bitwise operation helper (AND, OR, XOR).
     * @param {NumericEntity} numX - First operand.
     * @param {NumericEntity} numY - Second operand.
     * @param {function(number, number): number} bitwiseFn - The bitwise function (e.g., `(a,b) => a & b`).
     * @returns {NumericEntity} The result of the bitwise operation.
     */
    function performBitwiseOperation(numX, numY, bitwiseFn) {
        const parsedY = castToNumericEntity(numY);
        const xSign = numX.isTrulyNegative();
        const ySign = parsedY.isTrulyNegative();

        // Convert negative numbers to their two's complement representation for bitwise ops.
        // x.not() is equivalent to -(x+1), which is two's complement for BigInt.
        let xRepresentation = xSign ? numX.not() : numX;
        let yRepresentation = ySign ? parsedY.not() : parsedY;

        let xDigitVal = 0,
            yDigitVal = 0;
        let xDivMod = null,
            yDivMod = null;
        const resultDigits = []; // Store the results for each DIGIT_BASE chunk

        // Process digit by digit from LSB
        while (!xRepresentation.isActualZero() || !yRepresentation.isActualZero()) {
            xDivMod = performDivisionAndModulo(xRepresentation, largestCachedPowerOfTwo);
            xDigitVal = xDivMod[1].getJsNumber();
            if (xSign) {
                // If negative, assume two's complement and invert bits for the chunk
                xDigitVal = largestCachedPowerOfTwo - 1 - xDigitVal;
            }

            yDivMod = performDivisionAndModulo(yRepresentation, largestCachedPowerOfTwo);
            yDigitVal = yDivMod[1].getJsNumber();
            if (ySign) {
                // If negative, assume two's complement and invert bits for the chunk
                yDigitVal = largestCachedPowerOfTwo - 1 - yDigitVal;
            }

            xRepresentation = xDivMod[0];
            yRepresentation = yDivMod[0];
            resultDigits.push(bitwiseFn(xDigitVal, yDigitVal));
        }

        // Determine the sign of the result based on the bitwise operation on the signs.
        // For two's complement, the sign bit is effectively the highest bit.
        // A common pattern is that the result's sign is determined by the "sign extension" of the operation.
        // If the result of the bitwise operation on the sign bits (1 for negative, 0 for positive) is 1,
        // then the result is negative. Otherwise, it's positive.
        let finalResult = bitwiseFn(xSign ? 1 : 0, ySign ? 1 : 0) !== 0 ? largeNumFactory(-1) : largeNumFactory(0);

        // Reconstruct the number from digits, applying the sign.
        for (let i = resultDigits.length - 1; i >= 0; i -= 1) {
            finalResult = finalResult.multiply(largestCachedPowerOfTwo).add(largeNumFactory(resultDigits[i]));
        }

        return finalResult;
    }

    // Bitwise NOT (~)
    LargeNumber.prototype.not = function() {
        return this.flipSign().decrementByOne(); // Equivalent to -(x+1)
    };
    CompactNumber.prototype.not = LargeNumber.prototype.not; // Inherit

    // Bitwise AND (&)
    LargeNumber.prototype.and = function(otherNum) {
        return performBitwiseOperation(this, otherNum, function(a, b) {
            return a & b;
        });
    };
    CompactNumber.prototype.and = LargeNumber.prototype.and; // Inherit

    // Bitwise OR (|)
    LargeNumber.prototype.or = function(otherNum) {
        return performBitwiseOperation(this, otherNum, function(a, b) {
            return a | b;
        });
    };
    CompactNumber.prototype.or = LargeNumber.prototype.or; // Inherit

    // Bitwise XOR (^)
    LargeNumber.prototype.xor = function(otherNum) {
        return performBitwiseOperation(this, otherNum, function(a, b) {
            return a ^ b;
        });
    };
    CompactNumber.prototype.xor = LargeNumber.prototype.xor; // Inherit

    // Masks for rough LOB (Lowest One Bit) calculation
    const LOW_ORDER_BIT_MASK_INT = 1 << 30; // Max 30-bit integer
    // Combined mask for BigInt digits:
    // (DIGIT_BASE & -DIGIT_BASE) ensures we get lowest power of 2 in DIGIT_BASE.
    // If DIGIT_BASE is 1e7 (10,000,000), then DIGIT_BASE is 0b1001100010010110100000000.
    // -DIGIT_BASE in two's complement is 0b0110011101101001100000000.
    // DIGIT_BASE & -DIGIT_BASE would be the lowest set bit.
    // For 1e7, it is 1.
    // This seems to be a more complex way to get 1, or it's designed for a different DIGIT_BASE.
    // If DIGIT_BASE is a power of 2, this would make sense. For 1e7, it's 1.
    // The original code implies BASE&-BASE is 1.
    const LOW_ORDER_BIT_MASK_BIGINT = (DIGIT_BASE & -DIGIT_BASE) * (DIGIT_BASE & -DIGIT_BASE) | LOW_ORDER_BIT_MASK_INT;

    /**
     * Estimates the Lowest One Bit (LOB) for a number, used in GCD.
     * Provides a quick way to find the smallest power of two that divides the number.
     * @param {NumericEntity} num - The number.
     * @returns {number} An integer representing the LOB (e.g., 1, 2, 4, 8...).
     */
    function estimateLowestOneBit(num) {
        const val = num.numericalValue; // For CompactNumber
        if (typeof val === "number") {
            // Apply LOB mask for JS numbers directly.
            // (val | LOW_ORDER_BIT_MASK_INT) ensures at least one bit is set for LOB to work.
            return (val | LOW_ORDER_BIT_MASK_INT) & -(val | LOW_ORDER_BIT_MASK_INT);
        } else {
            // For LargeNumber, check the first digit (least significant).
            // Combine with the mask for BigInt digits.
            // This logic is a bit obscure, potentially relying on the properties of DIGIT_BASE.
            // If DIGIT_BASE is not a power of 2, this might not directly give a power of 2.
            // The original logic `v[0]+v[1]*BASE|LOBMASK_BI` implies it's looking at the first few digits.
            // Let's simplify to just the first digit's LOB, as that determines the overall LOB.
            const firstDigit = num.digitArray[0];
            return firstDigit & -firstDigit; // This finds the lowest set bit in the first digit.
        }
    }

    /**
     * Calculates the integer logarithm (floor(log_base(value))).
     * @param {NumericEntity} value - The number.
     * @param {NumericEntity} base - The base of the logarithm.
     * @returns {{p: NumericEntity, e: number}} An object with power (p) and exponent (e).
     */
    function calculateIntegerLogarithm(value, base) {
        if (base.compareWith(value) <= 0) {
            const tempResult = calculateIntegerLogarithm(value, base.square());
            const power = tempResult.p;
            const exponent = tempResult.e;
            const testProduct = power.multiply(base);
            return testProduct.compareWith(value) <= 0 ? {
                p: testProduct,
                e: exponent * 2 + 1
            } : {
                p: power,
                e: exponent * 2
            };
        }
        return {
            p: largeNumFactory(1),
            e: 0
        };
    }

    // Bit Length
    LargeNumber.prototype.bitLength = function() {
        let n = this;
        // For negative numbers, bit length is usually defined for two's complement representation.
        // For `x.bitLength()`, it's typically `(x.negate().subtract(1)).bitLength()` for negative `x`.
        if (n.isTrulyNegative()) {
            n = n.flipSign().decrementByOne();
        }
        if (n.isActualZero()) {
            return largeNumFactory(0);
        }
        // Use integer logarithm base 2 to find bit length.
        return largeNumFactory(calculateIntegerLogarithm(n, largeNumFactory(2)).e).add(largeNumFactory(1));
    };
    CompactNumber.prototype.bitLength = LargeNumber.prototype.bitLength; // Inherit

    // Utility functions for min/max
    function findMaximum(valA, valB) {
        const numA = castToNumericEntity(valA);
        const numB = castToNumericEntity(valB);
        return numA.isGreaterThan(numB) ? numA : numB;
    }

    function findMinimum(valA, valB) {
        const numA = castToNumericEntity(valA);
        const numB = castToNumericEntity(valB);
        return numA.isLesserThan(numB) ? numA : numB;
    }

    // Greatest Common Divisor (GCD) using Binary GCD algorithm
    function greatestCommonDivisor(valA, valB) {
        let numA = castToNumericEntity(valA).absoluteValue();
        let numB = castToNumericEntity(valB).absoluteValue();

        if (numA.isEqualTo(numB)) return numA;
        if (numA.isActualZero()) return numB;
        if (numB.isActualZero()) return numA;

        let commonFactor = NumericEntity.ONE;
        let lobValue, tempNum;

        // Extract common factors of 2
        while (numA.isEvenlyDivisible() && numB.isEvenlyDivisible()) {
            lobValue = Math.min(estimateLowestOneBit(numA), estimateLowestOneBit(numB));
            numA = numA.getQuotient(largeNumFactory(lobValue));
            numB = numB.getQuotient(largeNumFactory(lobValue));
            commonFactor = commonFactor.multiply(largeNumFactory(lobValue));
        }

        // Remove factors of 2 from remaining A
        while (numA.isEvenlyDivisible()) {
            numA = numA.getQuotient(largeNumFactory(estimateLowestOneBit(numA)));
        }

        // Apply binary GCD algorithm (Stein's algorithm)
        do {
            while (numB.isEvenlyDivisible()) {
                numB = numB.getQuotient(largeNumFactory(estimateLowestOneBit(numB)));
            }
            if (numA.isGreaterThan(numB)) {
                tempNum = numB;
                numB = numA;
                numA = tempNum;
            }
            numB = numB.subtract(numA);
        } while (!numB.isActualZero());

        return commonFactor.isOneOrMinusOne() ? numA : numA.multiply(commonFactor);
    }

    // Least Common Multiple (LCM)
    function leastCommonMultiple(valA, valB) {
        const numA = castToNumericEntity(valA).absoluteValue();
        const numB = castToNumericEntity(valB).absoluteValue();
        // LCM(a, b) = |a * b| / GCD(a, b)
        return numA.getQuotient(greatestCommonDivisor(numA, numB)).multiply(numB);
    }

    // Random number generation within a range
    function randomBetweenRange(valA, valB) {
        const lowerBound = findMinimum(valA, valB);
        const upperBound = findMaximum(valA, valB);
        const range = upperBound.subtract(lowerBound).add(NumericEntity.ONE);

        if (range.isSmall) {
            // If range fits in JS number, use Math.random directly
            return lowerBound.add(Math.floor(Math.random() * range.numericalValue));
        }

        // For large ranges, generate digits randomly
        const rangeDigitsLength = range.digitArray.length - 1; // Index of most significant digit
        const randomDigits = [];
        let restrictedUpper = true; // Flag to ensure digits don't exceed range's digits

        for (let i = rangeDigitsLength; i >= 0; i--) {
            const currentUpperLimit = restrictedUpper ? range.digitArray[i] : DIGIT_BASE;
            const generatedDigit = floorValue(Math.random() * currentUpperLimit);
            randomDigits.unshift(generatedDigit); // Prepend to build from LSB
            if (generatedDigit < currentUpperLimit) {
                restrictedUpper = false; // Once a digit is less than max, subsequent digits can be any value up to DIGIT_BASE-1
            }
        }

        const resultingNumber = convertDigitsToSmall(randomDigits);
        return lowerBound.add(typeof resultingNumber === "number" ? new CompactNumber(resultingNumber) : new LargeNumber(resultingNumber, false));
    }

    /**
     * Parses a string representation of a number in a given base.
     * @param {string} inputString - The string to parse.
     * @param {number|NumericEntity} baseValue - The base (2 to 36).
     * @returns {NumericEntity} The parsed number.
     */
    const parseStringWithBase = function(inputString, baseValue) {
        const strLength = inputString.length;
        const absBase = Math.abs(+baseValue); // Ensure base is a number for initial checks

        // Basic validation of digits for the given base
        for (let i = 0; i < strLength; i++) {
            const char = inputString[i].toLowerCase();
            if (char === "-") continue;
            if (/[a-z0-9]/.test(char)) {
                if (/[0-9]/.test(char) && +char >= absBase) {
                    if (!(char === "1" && absBase === 1)) { // Special case: base 1 only uses '1'
                        throw new Error(`Character '${char}' is not a valid digit in base ${baseValue}.`);
                    }
                } else if (char.charCodeAt(0) - 87 >= absBase) { // 'a' is 10, 'b' is 11, etc.
                    throw new Error(`Character '${char}' is not a valid digit in base ${baseValue}.`);
                }
            }
        }

        // Optimized path for small bases (2-36) and short strings that fit in JS number.
        if (2 <= absBase && absBase <= 36) {
            // Check if string length might fit into JS_SAFE_MAX after conversion.
            // log_base(MAX_INT) = LOG_MAX_INT / log(base)
            if (strLength <= LOG_OF_MAX_JS_INT / Math.log(absBase)) {
                const jsResult = parseInt(inputString, absBase);
                if (!isNaN(jsResult)) {
                    return new CompactNumber(jsResult);
                }
            }
        }

        // General case for large numbers or arbitrary bases.
        const parsedBase = castToNumericEntity(baseValue);
        const digitList = [];
        const isNegative = inputString[0] === "-";

        for (let i = isNegative ? 1 : 0; i < inputString.length; i++) {
            const char = inputString[i].toLowerCase();
            const charCode = char.charCodeAt(0);

            if (48 <= charCode && charCode <= 57) { // '0'-'9'
                digitList.push(castToNumericEntity(char));
            } else if (97 <= charCode && charCode <= 122) { // 'a'-'z'
                digitList.push(castToNumericEntity(charCode - 87)); // 'a' is 10
            } else if (char === "<") { // Custom digit format <val>
                let startIndex = i;
                do {
                    i++;
                } while (inputString[i] !== ">" && i < inputString.length); // Find closing '>'
                if (inputString[i] !== ">") {
                    throw new Error("Unclosed custom digit format: " + inputString.substring(startIndex));
                }
                digitList.push(castToNumericEntity(inputString.slice(startIndex + 1, i)));
            } else {
                throw new Error(`Invalid character '${char}' for parsing: ` + inputString);
            }
        }
        return parseDigitsWithBase(digitList, parsedBase, isNegative);
    };

    /**
     * Converts an array of digits (each a NumericEntity) from a given base to a NumericEntity.
     * @param {NumericEntity[]} digitsArray - Array of digits as NumericEntity objects.
     * @param {NumericEntity} baseEntity - The base as a NumericEntity.
     * @param {boolean} isNegativeSign - True if the final number should be negative.
     * @returns {NumericEntity} The resulting number.
     */
    function parseDigitsWithBase(digitsArray, baseEntity, isNegativeSign) {
        let accumulatedValue = NumericEntity.ZERO;
        let currentPower = NumericEntity.ONE;
        let i;

        // Iterate from least significant digit to most significant.
        for (i = digitsArray.length - 1; i >= 0; i--) {
            accumulatedValue = accumulatedValue.add(digitsArray[i].multiply(currentPower));
            currentPower = currentPower.multiply(baseEntity);
        }
        return isNegativeSign ? accumulatedValue.flipSign() : accumulatedValue;
    }

    /**
     * Converts a single digit (0-35) to its string representation (0-9, a-z).
     * @param {number} digit - The digit to convert.
     * @returns {string} String representation.
     */
    function digitToStringRep(digit) {
        if (digit <= 35) {
            return "0123456789abcdefghijklmnopqrstuvwxyz".charAt(digit);
        }
        return "<" + digit + ">"; // For bases > 36, use custom format
    }

    /**
     * Converts a NumericEntity to an array of digits in a specified base.
     * @param {NumericEntity} numEntity - The number to convert.
     * @param {NumericEntity} baseEntity - The target base.
     * @returns {{value: number[], isNegative: boolean}} Object with digit array and sign.
     */
    function convertToBaseDigits(numEntity, baseEntity) {
        let isNegativeResult = false;
        if (baseEntity.isActualZero()) {
            if (numEntity.isActualZero()) return {
                value: [0],
                isNegative: false
            };
            throw new Error("Cannot convert non-zero numbers to base 0.");
        }
        if (baseEntity.isEqualTo(NumericEntity.MINUS_ONE)) {
            // Base -1 (negabase) conversion is complex, this is a simplified version.
            // For 0, it's [0]. For positive N, it's alternating 0s and 1s.
            // For negative N, it's alternating 1s and 0s starting with 1.
            if (numEntity.isActualZero()) return { value: [0], isNegative: false };
            if (numEntity.isTrulyNegative()) {
                // Example: -1 in base -1 is 11_(-1) (1*(-1)^1 + 1*(-1)^0 = -1+1=0, not -1)
                // The original code has a very specific pattern for -N. Let's replicate.
                // It appears to generate [..., 1, 0, 1, 0] for positive, [..., 0, 1, 0, 1] for negative.
                // This is likely wrong for a general negabase system.
                // Sticking to the original pattern for clone purposes.
                // Original: Array.apply(null, Array(-n)).map(Array.prototype.valueOf,[1,0])
                // For -N: [1,0,1,0,...] of length 2*abs(N)
                const absVal = numEntity.absoluteValue().getJsNumber();
                const arr = [];
                for(let i=0; i<absVal; ++i) arr.push(1,0); // A bit strange, but matches source.
                return { value: arr, isNegative: false };
            }
            // For +N: [1,0,1,0,...] or [0,1,0,1,...]
            // Original: Array.apply(null,Array(+n-1)).map(Array.prototype.valueOf,[0,1]); arr.unshift([1]);
            const absVal = numEntity.absoluteValue().getJsNumber();
            const arr = [];
            if (absVal > 0) arr.push(1);
            for(let i=0; i<absVal-1; ++i) arr.push(0,1);
            return { value: arr, isNegative: false };
        }

        if (numEntity.isTrulyNegative() && baseEntity.isTrulyPositive()) {
            isNegativeResult = true;
            numEntity = numEntity.absoluteValue();
        }

        if (baseEntity.isEqualTo(NumericEntity.ONE)) {
            if (numEntity.isActualZero()) return {
                value: [0],
                isNegative: false
            };
            // Base 1: unary representation, e.g., 5 in base 1 is [1,1,1,1,1]
            const unaryArray = [];
            const numVal = numEntity.getJsNumber();
            for (let i = 0; i < numVal; i++) unaryArray.push(1);
            return {
                value: unaryArray,
                isNegative: isNegativeResult
            };
        }

        const outputDigits = [];
        let remainingNum = numEntity;
        let divisionResult;

        // Repeatedly divide by base and collect remainders
        while (remainingNum.isTrulyNegative() || remainingNum.compareAbsoluteValues(baseEntity) >= 0) {
            divisionResult = remainingNum.getDivisionResult(baseEntity);
            remainingNum = divisionResult.quotient;
            let digit = divisionResult.remainder;

            // Handle negative remainders for non-standard base systems (e.g., negabase, but original code uses this for all)
            if (digit.isTrulyNegative()) {
                digit = baseEntity.minus(digit).absoluteValue(); // digit = base - abs(remainder)
                remainingNum = remainingNum.incrementByOne(); // Adjust quotient
            }
            outputDigits.push(digit.getJsNumber());
        }
        outputDigits.push(remainingNum.getJsNumber()); // Push the last quotient

        return {
            value: outputDigits.reverse(),
            isNegative: isNegativeResult
        };
    }

    /**
     * Converts a NumericEntity to its string representation in a specified base.
     * @param {NumericEntity} numEntity - The number to convert.
     * @param {number|NumericEntity} baseValue - The target base.
     * @returns {string} The string representation.
     */
    function convertToBaseString(numEntity, baseValue) {
        const digitConversionResult = convertToBaseDigits(numEntity, castToNumericEntity(baseValue));
        return (digitConversionResult.isNegative ? "-" : "") + digitConversionResult.value.map(digitToStringRep).join("");
    }

    // Array conversion methods
    LargeNumber.prototype.toDigitArray = function(radix) {
        return convertToBaseDigits(this, radix);
    };
    CompactNumber.prototype.toDigitArray = function(radix) {
        return convertToBaseDigits(this, radix);
    };

    // String conversion methods
    LargeNumber.prototype.toTextString = function(radix) {
        if (radix === undefined) radix = 10;
        if (radix !== 10) return convertToBaseString(this, radix);

        const digitArr = this.digitArray;
        const len = digitArr.length;
        let resultStr = String(digitArr[len - 1]); // Start with most significant digit
        const paddingZeros = "0000000"; // For padding digits to BASE_LOG_EXPONENT length
        let currentDigit;

        // Append remaining digits, padding with zeros as needed
        for (let i = len - 2; i >= 0; i--) {
            currentDigit = String(digitArr[i]);
            resultStr += paddingZeros.slice(currentDigit.length) + currentDigit;
        }
        const signPrefix = this.isNegative ? "-" : "";
        return signPrefix + resultStr;
    };
    CompactNumber.prototype.toTextString = function(radix) {
        if (radix === undefined) radix = 10;
        if (radix !== 10) return convertToBaseString(this, radix);
        return String(this.numericalValue);
    };

    // JSON serialization
    LargeNumber.prototype.serializeToJSON = CompactNumber.prototype.serializeToJSON = function() {
        return this.toTextString();
    };

    // ValueOf and JS Number conversion
    LargeNumber.prototype.getPrimitiveValue = function() {
        // Warning: This can lose precision for very large numbers.
        return parseInt(this.toTextString(), 10);
    };
    LargeNumber.prototype.getJsNumber = LargeNumber.prototype.getPrimitiveValue;

    CompactNumber.prototype.getPrimitiveValue = function() {
        return this.numericalValue;
    };
    CompactNumber.prototype.getJsNumber = CompactNumber.prototype.getPrimitiveValue;

    /**
     * Parses a string input into a NumericEntity.
     * Handles scientific notation and decimal points (for integer conversion).
     * @param {string} inputStr - The string to parse.
     * @returns {NumericEntity} The parsed number.
     */
    function processStringInput(inputStr) {
        // Try to parse as a small number first to check precision.
        if (isWithinJsPrecision(+inputStr)) {
            const numValue = +inputStr;
            if (numValue === floorValue(numValue)) { // Check if it's an integer
                return new CompactNumber(numValue);
            }
            throw new Error(`Invalid integer: ${inputStr} has a decimal part.`);
        }

        let isNegative = inputStr[0] === "-";
        if (isNegative) inputStr = inputStr.slice(1); // Remove sign for parsing digits

        const scientificNotationParts = inputStr.split(/e/i);
        if (scientificNotationParts.length > 2) {
            throw new Error(`Invalid integer: ${scientificNotationParts.join("e")} contains multiple 'e' characters.`);
        }

        if (scientificNotationParts.length === 2) {
            let exponentPart = scientificNotationParts[1];
            if (exponentPart[0] === "+") exponentPart = exponentPart.slice(1);
            const exponentVal = +exponentPart;

            if (exponentVal !== floorValue(exponentVal) || !isWithinJsPrecision(exponentVal)) {
                throw new Error(`Invalid integer: ${exponentVal} is not a valid integer exponent.`);
            }

            let mainPart = scientificNotationParts[0];
            const decimalPointIndex = mainPart.indexOf(".");
            if (decimalPointIndex >= 0) {
                // Adjust exponent for decimal places.
                exponentVal -= mainPart.length - decimalPointIndex - 1;
                mainPart = mainPart.slice(0, decimalPointIndex) + mainPart.slice(decimalPointIndex + 1);
            }

            if (exponentVal < 0) {
                throw new Error("Cannot include negative exponent part for integers.");
            }
            // Append zeros based on exponent.
            mainPart += new Array(exponentVal + 1).join("0");
            inputStr = mainPart;
        }

        // Validate the final string contains only digits.
        if (!/^[0-9][0-9]*$/.test(inputStr)) {
            throw new Error(`Invalid integer format: ${inputStr} contains non-digit characters.`);
        }

        const digitArray = [];
        let maxIndex = inputStr.length;
        const segmentLength = BASE_LOG_EXPONENT; // 7 digits per segment
        let minIndex = maxIndex - segmentLength;

        while (maxIndex > 0) {
            // Extract segments from right to left.
            digitArray.push(+inputStr.slice(Math.max(0, minIndex), maxIndex));
            minIndex -= segmentLength;
            maxIndex -= segmentLength;
        }
        normalizeDigitArray(digitArray);
        return new LargeNumber(digitArray, isNegative);
    }

    /**
     * Parses a number input into a NumericEntity.
     * @param {number} inputNum - The number to parse.
     * @returns {NumericEntity} The parsed number.
     */
    function processNumberInput(inputNum) {
        if (isWithinJsPrecision(inputNum)) {
            if (inputNum !== floorValue(inputNum)) {
                throw new Error(`${inputNum} is not an integer.`);
            }
            return new CompactNumber(inputNum);
        }
        // If number is outside JS safe integer range, convert to string and parse.
        return processStringInput(inputNum.toString());
    }

    /**
     * Universal parsing function for various input types.
     * @param {*} input - The value to parse (number, string, or existing NumericEntity).
     * @returns {NumericEntity} The parsed NumericEntity instance.
     */
    function castToNumericEntity(input) {
        if (typeof input === "number") {
            return processNumberInput(input);
        }
        if (typeof input === "string") {
            return processStringInput(input);
        }
        // If it's already a NumericEntity, return it directly.
        return input;
    }

    // Pre-cache small integer instances for performance.
    // Creates instances for 0 to 999 and -1 to -999.
    for (let i = 0; i < 1e3; i++) {
        NumericEntity[i] = new CompactNumber(i);
        if (i > 0) NumericEntity[-i] = new CompactNumber(-i);
    }

    // Common constants
    NumericEntity.ONE = NumericEntity[1];
    NumericEntity.ZERO = NumericEntity[0];
    NumericEntity.MINUS_ONE = NumericEntity[-1];
    NumericEntity.TWO = NumericEntity[2]; // Added for convenience

    // Export utility functions
    NumericEntity.max = findMaximum;
    NumericEntity.min = findMinimum;
    NumericEntity.gcd = greatestCommonDivisor;
    NumericEntity.lcm = leastCommonMultiple;

    // Type checking
    NumericEntity.isInstance = function(x) {
        return x instanceof LargeNumber || x instanceof CompactNumber;
    };

    // Random number generation
    NumericEntity.randBetween = randomBetweenRange;

    // Factory method to create from digit array (e.g., for internal use)
    NumericEntity.fromArray = function(digits, base, isNegative) {
        // Ensure digits are NumericEntity instances
        const processedDigits = digits.map(castToNumericEntity);
        // Ensure base is a NumericEntity
        const processedBase = castToNumericEntity(base || 10);
        return parseDigitsWithBase(processedDigits, processedBase, isNegative);
    };

    return NumericEntity;
})(); // End of largeNumFactory IIFE

// --- Main application logic ---

/**
 * Executes the main program flow:
 * 1. Reads input.
 * 2. Parses N and K from the first line.
 * 3. Parses an array of numbers from the second line.
 * 4. Generates combinations of these numbers of size K.
 * 5. For each combination, calculates the range (max - min).
 * 6. Sums these ranges modulo a large prime.
 * 7. Prints the final sum.
 * @param {string} rawInput - The raw string input from stdin.
 */
function executeProgram(rawInput) {
    const inputLines = rawInput.trim().split("\n");

    // Parse the first line: N K
    const sourceDataParts = inputLines[0].split(' ').map(val => parseInt(val, 10));
    const countN = sourceDataParts[0]; // N is not actually used in the provided logic for combination generation
    const selectionK = sourceDataParts[1];

    // Parse the second line: array of numbers
    const inputNumbers = inputLines[1].split(' ').map(val => parseInt(val, 10));

    // Generate all combinations of 'selectionK' numbers from 'inputNumbers'
    const selectedGroups = generateCombinations(inputNumbers, selectionK);

    let totalSum = 0;
    const MODULUS_CONSTANT = 1000000007; // A large prime modulus

    // Iterate through each generated combination group
    for (let i = 0; i < selectedGroups.length; i++) {
        const currentGroup = selectedGroups[i];

        // Calculate the range (max - min) for the current group
        const maxVal = Math.max(...currentGroup); // Using spread for Math.max
        const minVal = Math.min(...currentGroup); // Using spread for Math.min
        const currentRange = maxVal - minVal;

        // Add the range (modulo MODULUS_CONSTANT) to the total sum
        totalSum = (totalSum + currentRange) % MODULUS_CONSTANT;
    }

    console.log(totalSum);
}

/**
 * Recursively generates all unique combinations of a specified size from an input array.
 * This is a standard backtracking algorithm for combinations.
 * @param {number[]} inputArray - The array of numbers to choose from.
 * @param {number} groupSize - The desired size of each combination.
 * @param {number} [originalGroupSize] - Internal parameter to keep track of the initial group size.
 * @returns {number[][]} An array of arrays, where each inner array is a combination.
 */
function generateCombinations(inputArray, groupSize, originalGroupSize) {
    const resultCombinations = [];
    // Store original group size for base case clarity, though not strictly used in current logic.
    const initialSize = originalGroupSize === undefined ? groupSize : originalGroupSize;

    // Guard clause: If the input array is smaller than the group size, no combinations are possible.
    if (inputArray.length < groupSize) {
        return [];
    }

    // Base case: If we need to select only one element.
    if (groupSize === 1) {
        for (let i = 0; i < inputArray.length; i++) {
            resultCombinations.push([inputArray[i]]);
        }
    } else {
        // Recursive step: Iterate through the array.
        // For each element, consider it as the first element of a combination,
        // then recursively find combinations for the remaining elements.
        for (let idx = 0; idx <= inputArray.length - groupSize; idx++) {
            // Get combinations from the rest of the array (after current element),
            // needing (groupSize - 1) more elements.
            const remainingElements = inputArray.slice(idx + 1);
            const subCombinations = generateCombinations(remainingElements, groupSize - 1, initialSize);

            // Prepend the current element to each sub-combination.
            for (let subIdx = 0; subIdx < subCombinations.length; subIdx++) {
                resultCombinations.push([inputArray[idx]].concat(subCombinations[subIdx]));
            }
        }
    }
    return resultCombinations;
}

// Execute the program by reading from standard input.
executeProgram(require('fs').readFileSync('/dev/stdin', 'utf8'));