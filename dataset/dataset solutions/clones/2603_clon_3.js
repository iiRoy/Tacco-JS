"use strict";

/*
 * This module provides arbitrary-precision integer arithmetic capabilities.
 * It handles numbers larger than JavaScript's native Number.MAX_SAFE_INTEGER
 * by representing them as arrays of digits in a custom base.
 */
const hugeIntegerModule = (() => {

    // --- Configuration Constants ---
    // The base for our digit arrays (10^7). This allows each array element
    // to hold up to 7 decimal digits, fitting well within typical 32-bit
    // integer limits (e.g., 2^31 - 1).
    const CHUNK_RADIX = 10_000_000;
    // Number of decimal digits in our CHUNK_RADIX.
    const CHUNK_DIGIT_COUNT = 7;
    // Maximum safe integer value in JavaScript.
    const NATIVE_MAX_SAFE_VALUE = Number.MAX_SAFE_INTEGER; // 9007199254740991
    // Array representation of NATIVE_MAX_SAFE_VALUE for comparisons.
    const NATIVE_MAX_DIGIT_ARRAY = convertNativeToDigitArray(NATIVE_MAX_SAFE_VALUE);
    // Logarithm of NATIVE_MAX_SAFE_VALUE, useful for base conversions.
    const NATIVE_MAX_VALUE_LOG = Math.log(NATIVE_MAX_SAFE_VALUE);

    // --- Core Data Structures ---

    /**
     * Base class for all numerical entities (both large and small).
     * @constructor
     */
    function NumericalEntity() {
        // This is primarily for prototype chaining.
    }

    /**
     * Represents a large integer value, stored as an array of digits.
     * @param {number[]} digitArray - An array of digits in CHUNK_RADIX.
     * @param {boolean} isNegative - True if the number is negative.
     * @constructor
     */
    class LargeInteger extends NumericalEntity {
        constructor(digitArray, isNegative) {
            super();
            this.internalDigits = digitArray;
            this.isNegative = isNegative;
            this.isCompact = false; // Flag to distinguish from CompactInteger
        }
    }
    // Inherit methods from NumericalEntity
    LargeInteger.prototype = Object.create(NumericalEntity.prototype);

    /**
     * Represents a small integer value that fits within JavaScript's native safe integer limits.
     * @param {number} rawValue - The native JavaScript number.
     * @constructor
     */
    class CompactInteger extends NumericalEntity {
        constructor(rawValue) {
            super();
            this.rawValue = rawValue;
            this.isNegative = rawValue < 0;
            this.isCompact = true; // Flag to distinguish from LargeInteger
        }
    }
    // Inherit methods from NumericalEntity
    CompactInteger.prototype = Object.create(NumericalEntity.prototype);

    // --- Utility Functions ---

    /**
     * Checks if a given number can be precisely represented by native JavaScript numbers.
     * @param {number} val - The number to check.
     * @returns {boolean} True if the number is within the safe integer range.
     */
    function canUseNativeArithmetic(val) {
        return val > -NATIVE_MAX_SAFE_VALUE && val < NATIVE_MAX_SAFE_VALUE;
    }

    /**
     * Converts a native JavaScript number into an array of digits based on CHUNK_RADIX.
     * @param {number} n - The native number.
     * @returns {number[]} An array of digits.
     */
    function convertNativeToDigitArray(n) {
        // Optimized for common small values.
        if (n < CHUNK_RADIX) {
            return [n];
        }
        if (n < CHUNK_RADIX * CHUNK_RADIX) { // 1e14
            return [n % CHUNK_RADIX, Math.floor(n / CHUNK_RADIX)];
        }
        // For larger numbers, up to NATIVE_MAX_SAFE_VALUE
        return [n % CHUNK_RADIX, Math.floor(n / CHUNK_RADIX) % CHUNK_RADIX, Math.floor(n / (CHUNK_RADIX * CHUNK_RADIX))];
    }

    /**
     * Converts an array of digits back to a native JavaScript number if possible.
     * @param {number[]} digitArr - The array of digits.
     * @returns {number|number[]} A native number if it fits, otherwise the original array.
     */
    function convertDigitArrayToNative(digitArr) {
        normalizeDigitArray(digitArr);
        const currentLength = digitArr.length;
        if (currentLength < 4 && compareAbsoluteValues(digitArr, NATIVE_MAX_DIGIT_ARRAY) < 0) {
            switch (currentLength) {
                case 0:
                    return 0;
                case 1:
                    return digitArr[0];
                case 2:
                    return digitArr[0] + digitArr[1] * CHUNK_RADIX;
                case 3:
                    return digitArr[0] + (digitArr[1] + digitArr[2] * CHUNK_RADIX) * CHUNK_RADIX;
                default: // Should not happen with length < 4
                    return digitArr;
            }
        }
        return digitArr;
    }

    /**
     * Removes leading zeros from a digit array to normalize it.
     * @param {number[]} digits - The digit array to trim.
     */
    function normalizeDigitArray(digits) {
        let i = digits.length;
        while (i > 0 && digits[--i] === 0);
        digits.length = i + 1;
    }

    /**
     * Creates a new array of a specified length, initialized with zeros.
     * @param {number} len - The desired length of the array.
     * @returns {number[]} A new array filled with zeros.
     */
    function initializeZeroArray(len) {
        // Using Array.prototype.fill for conciseness and modern JavaScript.
        return new Array(len).fill(0);
    }

    /**
     * Truncates a number towards zero (floor for positive, ceil for negative).
     * @param {number} n - The number to truncate.
     * @returns {number} The truncated integer.
     */
    function roundTowardZero(n) {
        return n > 0 ? Math.floor(n) : Math.ceil(n);
    }

    // --- Arithmetic Operations (Internal) ---

    /**
     * Performs addition of two digit arrays. Assumes a.length >= b.length.
     * @param {number[]} a - The first digit array (operand 1).
     * @param {number[]} b - The second digit array (operand 2).
     * @returns {number[]} The resulting digit array.
     */
    function performAddition(a, b) {
        const lenA = a.length,
            lenB = b.length;
        const result = new Array(lenA); // Result array will be at most lenA + 1
        let carry = 0;
        let currentSum;
        let i = 0;

        // Add corresponding digits from both arrays
        for (; i < lenB; ++i) {
            currentSum = a[i] + b[i] + carry;
            carry = currentSum >= CHUNK_RADIX ? 1 : 0;
            result[i] = currentSum - carry * CHUNK_RADIX;
        }

        // Add remaining digits from the longer array (a)
        while (i < lenA) {
            currentSum = a[i] + carry;
            carry = currentSum === CHUNK_RADIX ? 1 : 0;
            result[i++] = currentSum - carry * CHUNK_RADIX;
        }

        // If there's a final carry, add it to the result
        if (carry > 0) {
            result.push(carry);
        }
        return result;
    }

    /**
     * Adds two digit arrays, handling differing lengths by ensuring the longer one is first.
     * @param {number[]} arr1 - First digit array.
     * @param {number[]} arr2 - Second digit array.
     * @returns {number[]} The sum as a digit array.
     */
    function addFlexibleArrays(arr1, arr2) {
        // Ensure the first array is the longer one for performAddition.
        return arr1.length >= arr2.length ? performAddition(arr1, arr2) : performAddition(arr2, arr1);
    }

    /**
     * Adds a small native number (carry) to a digit array.
     * @param {number[]} digitArr - The digit array.
     * @param {number} carryValue - The small native number to add.
     * @returns {number[]} The resulting digit array.
     */
    function addSmallValueToArray(digitArr, carryValue) {
        const len = digitArr.length;
        const result = new Array(len);
        let currentCarry = carryValue;
        let currentSum;

        for (let i = 0; i < len; ++i) {
            currentSum = digitArr[i] + currentCarry;
            currentCarry = Math.floor(currentSum / CHUNK_RADIX);
            result[i] = currentSum % CHUNK_RADIX;
        }

        // Propagate any remaining carry
        while (currentCarry > 0) {
            result.push(currentCarry % CHUNK_RADIX);
            currentCarry = Math.floor(currentCarry / CHUNK_RADIX);
        }
        return result;
    }

    /**
     * Performs subtraction of two digit arrays (a - b). Assumes a >= b.
     * @param {number[]} a - The minuend digit array.
     * @param {number[]} b - The subtrahend digit array.
     * @returns {number[]} The resulting digit array.
     */
    function performSubtraction(a, b) {
        const lenA = a.length,
            lenB = b.length;
        const result = new Array(lenA);
        let borrow = 0;
        let difference;
        let i = 0;

        // Subtract corresponding digits
        for (; i < lenB; ++i) {
            difference = a[i] - borrow - b[i];
            if (difference < 0) {
                difference += CHUNK_RADIX;
                borrow = 1;
            } else {
                borrow = 0;
            }
            result[i] = difference;
        }

        // Propagate borrow through the remaining digits of 'a'
        for (; i < lenA; ++i) {
            difference = a[i] - borrow;
            if (difference < 0) {
                difference += CHUNK_RADIX;
            } else {
                // If no more borrow, copy remaining digits and break
                result[i++] = difference;
                break;
            }
            result[i] = difference;
        }

        // Copy any remaining digits from 'a' if no more borrow
        for (; i < lenA; ++i) {
            result[i] = a[i];
        }

        normalizeDigitArray(result);
        return result;
    }

    /**
     * Subtracts two digit arrays, handling magnitude comparison and sign.
     * @param {number[]} arrA - First digit array.
     * @param {number[]} arrB - Second digit array.
     * @param {boolean} currentSign - The sign of the result if arrA >= arrB.
     * @returns {NumericalEntity} The result of subtraction.
     */
    function subtractFlexibleArrays(arrA, arrB, currentSign) {
        let resultDigits;
        let finalSign = currentSign;

        // Determine which array is larger in absolute value.
        if (compareAbsoluteValues(arrA, arrB) >= 0) {
            resultDigits = performSubtraction(arrA, arrB);
        } else {
            resultDigits = performSubtraction(arrB, arrA);
            finalSign = !finalSign; // Flip sign if we swapped operands
        }

        // Attempt to convert to CompactInteger if small enough.
        const potentialSmall = convertDigitArrayToNative(resultDigits);
        if (typeof potentialSmall === "number") {
            return new CompactInteger(finalSign ? -potentialSmall : potentialSmall);
        }
        return new LargeInteger(potentialSmall, finalSign);
    }

    /**
     * Subtracts a small native number (subtrahend) from a digit array (minuend).
     * @param {number[]} digitArr - The minuend digit array.
     * @param {number} smallSubtrahend - The small native number to subtract (absolute value).
     * @param {boolean} currentSign - The sign of the minuend.
     * @returns {NumericalEntity} The result of subtraction.
     */
    function subtractSmallValueFromArray(digitArr, smallSubtrahend, currentSign) {
        const len = digitArr.length;
        const result = new Array(len);
        let currentBorrow = -smallSubtrahend; // Treat as negative carry
        let difference;

        for (let i = 0; i < len; ++i) {
            difference = digitArr[i] + currentBorrow;
            currentBorrow = Math.floor(difference / CHUNK_RADIX); // This will be negative or zero
            difference %= CHUNK_RADIX;
            result[i] = difference < 0 ? difference + CHUNK_RADIX : difference; // Adjust if negative
        }

        // Attempt to convert to CompactInteger if small enough.
        const potentialSmall = convertDigitArrayToNative(result);
        if (typeof potentialSmall === "number") {
            return new CompactInteger(currentSign ? -potentialSmall : potentialSmall);
        }
        return new LargeInteger(potentialSmall, currentSign);
    }

    /**
     * Performs long multiplication of two digit arrays.
     * @param {number[]} arr1 - First digit array.
     * @param {number[]} arr2 - Second digit array.
     * @returns {number[]} The product as a digit array.
     */
    function longMultiplication(arr1, arr2) {
        const len1 = arr1.length,
            len2 = arr2.length;
        const result = initializeZeroArray(len1 + len2); // Max possible length
        let product, carry;

        for (let i = 0; i < len1; ++i) {
            const digit1 = arr1[i];
            let currentCarry = 0; // Carry for this row of multiplication
            for (let j = 0; j < len2; ++j) {
                const digit2 = arr2[j];
                // Sum the current product, existing digit in result, and current row carry
                product = digit1 * digit2 + result[i + j] + currentCarry;
                currentCarry = Math.floor(product / CHUNK_RADIX);
                result[i + j] = product % CHUNK_RADIX;
            }
            // Add any remaining carry for this row
            result[i + len2] += currentCarry;
        }
        normalizeDigitArray(result);
        return result;
    }

    /**
     * Multiplies a digit array by a small native number.
     * @param {number[]} digitArr - The digit array.
     * @param {number} scalar - The small native multiplier.
     * @returns {number[]} The product as a digit array.
     */
    function scalarMultiplication(digitArr, scalar) {
        const len = digitArr.length;
        const result = new Array(len);
        let currentCarry = 0;
        let product;

        for (let i = 0; i < len; ++i) {
            product = digitArr[i] * scalar + currentCarry;
            currentCarry = Math.floor(product / CHUNK_RADIX);
            result[i] = product % CHUNK_RADIX;
        }

        // Propagate any remaining carry
        while (currentCarry > 0) {
            result.push(currentCarry % CHUNK_RADIX);
            currentCarry = Math.floor(currentCarry / CHUNK_RADIX);
        }
        return result;
    }

    /**
     * Shifts a digit array left by adding `n` zeros at the beginning (lower significance).
     * @param {number[]} arr - The digit array.
     * @param {number} n - The number of zeros to prepend.
     * @returns {number[]} The shifted array.
     */
    function padWithZeros(arr, n) {
        // Creates an array of n zeros and concatenates the original array.
        // This effectively shifts the number by n powers of CHUNK_RADIX.
        return [...initializeZeroArray(n), ...arr];
    }

    /**
     * Implements Karatsuba multiplication for faster large number products.
     * @param {number[]} x - First operand digit array.
     * @param {number[]} y - Second operand digit array.
     * @returns {number[]} The product as a digit array.
     */
    function karatsubaProduct(x, y) {
        const maxLen = Math.max(x.length, y.length);

        // Base case for small arrays, fall back to long multiplication.
        if (maxLen <= 30) { // Threshold can be tuned for performance
            return longMultiplication(x, y);
        }

        // Split point for Karatsuba algorithm.
        const splitPoint = Math.ceil(maxLen / 2);

        // Divide x and y into two parts: x = a * R^k + b, y = c * R^k + d
        const b = x.slice(splitPoint);
        const a = x.slice(0, splitPoint);
        const d = y.slice(splitPoint);
        const c = y.slice(0, splitPoint);

        // Recursively compute products:
        // ac = a * c
        // bd = b * d
        // ad_plus_bc = (a + b) * (c + d) - ac - bd
        const ac = karatsubaProduct(a, c);
        const bd = karatsubaProduct(b, d);
        const abcd = karatsubaProduct(addFlexibleArrays(a, b), addFlexibleArrays(c, d));

        // Combine terms: ac * R^(2k) + (ad + bc) * R^k + bd
        const middleTerm = performSubtraction(performSubtraction(abcd, ac), bd); // (a+b)(c+d) - ac - bd

        const product = addFlexibleArrays(
            addFlexibleArrays(ac, padWithZeros(middleTerm, splitPoint)),
            padWithZeros(bd, 2 * splitPoint)
        );

        normalizeDigitArray(product);
        return product;
    }

    /**
     * Heuristic to decide whether to use Karatsuba multiplication.
     * @param {number} len1 - Length of the first array.
     * @param {number} len2 - Length of the second array.
     * @returns {boolean} True if Karatsuba is likely faster.
     */
    function shouldUseKaratsuba(len1, len2) {
        // This empirical formula might need tuning based on environment.
        // It roughly checks if the arrays are large enough for Karatsuba's overhead to be worth it.
        return -0.012 * len1 - 0.012 * len2 + 15e-6 * len1 * len2 > 0;
    }

    /**
     * Multiplies a scalar (native number) by a digit array, returning a new LargeInteger.
     * @param {number} scalarVal - The scalar value (absolute).
     * @param {number[]} digitArr - The digit array (absolute).
     * @param {boolean} finalSign - The sign of the result.
     * @returns {LargeInteger} The product.
     */
    function multiplyScalarByArray(scalarVal, digitArr, finalSign) {
        if (scalarVal < CHUNK_RADIX) {
            return new LargeInteger(scalarMultiplication(digitArr, scalarVal), finalSign);
        }
        // If scalar is large, convert it to an array and use long multiplication.
        return new LargeInteger(longMultiplication(digitArr, convertNativeToDigitArray(scalarVal)), finalSign);
    }

    /**
     * Calculates the square of a digit array (x*x).
     * @param {number[]} arr - The digit array.
     * @returns {number[]} The squared digit array.
     */
    function calculateSquare(arr) {
        const len = arr.length;
        const result = initializeZeroArray(len + len);
        let product, carry;

        for (let i = 0; i < len; ++i) {
            const digit_i = arr[i];
            carry = 0; // Carry for this row's products
            // Calculate 2 * a_i * a_j + carry
            for (let j = 0; j < i; ++j) { // Only half the products, then double
                const digit_j = arr[j];
                product = 2 * (digit_i * digit_j) + result[i + j] + carry;
                carry = Math.floor(product / CHUNK_RADIX);
                result[i + j] = product % CHUNK_RADIX;
            }
            // Calculate a_i * a_i + carry
            product = digit_i * digit_i + result[i + i] + carry;
            carry = Math.floor(product / CHUNK_RADIX);
            result[i + i] = product % CHUNK_RADIX;
            result[i + len] += carry; // Add remaining carry
        }
        normalizeDigitArray(result);
        return result;
    }

    /**
     * Performs long division using the "normalization" method (Knuth's Algorithm D).
     * This version is optimized for larger numbers.
     * @param {number[]} dividendDigits - The dividend as a digit array.
     * @param {number[]} divisorDigits - The divisor as a digit array.
     * @returns {[number[], number[]]} An array containing [quotient, remainder] as digit arrays.
     */
    function longDivisionAlgorithm(dividendDigits, divisorDigits) {
        const lenDividend = dividendDigits.length;
        const lenDivisor = divisorDigits.length;
        const quotientDigits = initializeZeroArray(lenDividend);
        let normalizedDividend, normalizedDivisor;

        // Step D1: Normalize divisor and dividend.
        // Multiply by 'lambda' to make the most significant digit of the divisor large.
        // This improves estimation of quotient digits.
        const divisorMostSignificantDigit = divisorDigits[lenDivisor - 1];
        const lambda = Math.ceil(CHUNK_RADIX / (2 * divisorMostSignificantDigit)); // Normalization factor.

        // If lambda is 1, no normalization needed.
        if (lambda === 1) {
            normalizedDividend = [...dividendDigits];
            normalizedDivisor = [...divisorDigits];
        } else {
            normalizedDividend = scalarMultiplication(dividendDigits, lambda);
            normalizedDivisor = scalarMultiplication(divisorDigits, lambda);
        }

        // Ensure dividend is long enough for initial comparison.
        if (normalizedDividend.length <= lenDividend) {
            normalizedDividend.push(0);
        }
        // Add a zero to the divisor for internal calculations.
        normalizedDivisor.push(0);

        const nDivisor = normalizedDivisor.length - 1; // Actual length of normalizedDivisor digits
        const d_n = normalizedDivisor[nDivisor - 1]; // Most significant digit of normalized divisor

        for (let shiftIndex = lenDividend - lenDivisor; shiftIndex >= 0; --shiftIndex) {
            // Step D3: Estimate quotient digit (q_hat).
            let estimatedQuotientDigit = CHUNK_RADIX - 1;
            const dividendSliceMostSignificant = normalizedDividend[shiftIndex + nDivisor];
            const dividendSliceNextSignificant = normalizedDividend[shiftIndex + nDivisor - 1];

            if (dividendSliceMostSignificant !== d_n) {
                estimatedQuotientDigit = Math.floor((dividendSliceMostSignificant * CHUNK_RADIX + dividendSliceNextSignificant) / d_n);
            }

            // Step D4: Multiply and Subtract (q_hat * normalizedDivisor from normalizedDividend slice).
            // This loop performs `normalizedDividend[shiftIndex ... shiftIndex+nDivisor] -= estimatedQuotientDigit * normalizedDivisor`.
            let currentCarry = 0;
            let currentBorrow = 0;
            let tempProduct, difference;

            for (let i = 0; i < nDivisor + 1; ++i) {
                tempProduct = estimatedQuotientDigit * normalizedDivisor[i] + currentCarry;
                currentCarry = Math.floor(tempProduct / CHUNK_RADIX);
                difference = normalizedDividend[shiftIndex + i] - (tempProduct % CHUNK_RADIX) - currentBorrow;

                if (difference < 0) {
                    difference += CHUNK_RADIX;
                    currentBorrow = 1;
                } else {
                    currentBorrow = 0;
                }
                normalizedDividend[shiftIndex + i] = difference;
            }

            // Step D5: Add Back (if subtraction resulted in negative).
            // If the estimated quotient digit was too large, the subtraction might have
            // resulted in a negative value (indicated by currentBorrow > 0).
            // Decrement the quotient digit and add back the divisor.
            while (currentBorrow !== 0) {
                estimatedQuotientDigit -= 1;
                currentCarry = 0;
                for (let i = 0; i < nDivisor + 1; ++i) {
                    currentCarry += normalizedDividend[shiftIndex + i] + normalizedDivisor[i];
                    normalizedDividend[shiftIndex + i] = currentCarry % CHUNK_RADIX;
                    currentCarry = Math.floor(currentCarry / CHUNK_RADIX);
                }
                currentBorrow += currentCarry; // currentBorrow will eventually become 0
            }
            quotientDigits[shiftIndex] = estimatedQuotientDigit; // Store the valid quotient digit
        }

        // Step D8: Unnormalize the remainder.
        // Divide the remainder by lambda to get the true remainder.
        const finalRemainder = scalarDivision(normalizedDividend, lambda)[0];

        return [convertDigitArrayToNative(quotientDigits), convertDigitArrayToNative(finalRemainder)];
    }

    /**
     * Performs division and modulo for large numbers, using a simpler, iterative approach.
     * This is useful for cases where `longDivisionAlgorithm` might be too complex or for smaller divisions.
     * @param {number[]} dividendDigits - The dividend as a digit array.
     * @param {number[]} divisorDigits - The divisor as a digit array.
     * @returns {[number[], number[]]} An array containing [quotient, remainder] as digit arrays.
     */
    function optimizedDivision(dividendDigits, divisorDigits) {
        let currentDividendLen = dividendDigits.length;
        const divisorLen = divisorDigits.length;
        const quotientResult = [];
        let partialDividend = []; // Stores the current part of the dividend being processed.

        // Loop through the dividend from most significant to least significant chunk.
        while (currentDividendLen > 0) {
            // Take one digit from the dividend and prepend it to the partial dividend.
            partialDividend.unshift(dividendDigits[--currentDividendLen]);
            normalizeDigitArray(partialDividend); // Clean up leading zeros if any.

            // If the partial dividend is smaller than the divisor, the quotient digit is 0.
            if (compareAbsoluteValues(partialDividend, divisorDigits) < 0) {
                quotientResult.push(0);
                continue;
            }

            // Estimate the quotient digit.
            let estimatedQuotient;
            const pDivLen = partialDividend.length;
            const highX = partialDividend[pDivLen - 1] * CHUNK_RADIX + (partialDividend[pDivLen - 2] || 0);
            const highY = divisorDigits[divisorLen - 1] * CHUNK_RADIX + (divisorDigits[divisorLen - 2] || 0);

            // Adjust highX if its length is greater than divisor's length by one (for better estimation).
            if (pDivLen > divisorLen) {
                estimatedQuotient = Math.ceil((highX + 1) / highY);
            } else {
                estimatedQuotient = Math.ceil(highX / highY);
            }

            // Refine the estimated quotient digit by repeatedly multiplying the divisor
            // and comparing with the partial dividend.
            let testProduct;
            do {
                testProduct = scalarMultiplication(divisorDigits, estimatedQuotient);
                if (compareAbsoluteValues(testProduct, partialDividend) <= 0) {
                    break; // Found a valid quotient digit.
                }
                estimatedQuotient--;
            } while (estimatedQuotient > 0); // Ensure quotient doesn't go below zero.

            quotientResult.push(estimatedQuotient);
            partialDividend = performSubtraction(partialDividend, testProduct); // Update partial dividend (remainder).
        }

        quotientResult.reverse(); // Digits were pushed in reverse order.
        return [convertDigitArrayToNative(quotientResult), convertDigitArrayToNative(partialDividend)];
    }

    /**
     * Divides a digit array by a small native number (scalar).
     * Returns both the quotient and the remainder.
     * @param {number[]} dividendDigits - The digit array to divide.
     * @param {number} scalarDivisor - The small native divisor.
     * @returns {[number[], number]} An array containing [quotientDigits, remainder].
     */
    function scalarDivision(dividendDigits, scalarDivisor) {
        const len = dividendDigits.length;
        const quotientDigits = initializeZeroArray(len);
        let remainder = 0;
        let currentDividendPart, quotientDigit;

        // Iterate from most significant digit to least significant.
        for (let i = len - 1; i >= 0; --i) {
            currentDividendPart = remainder * CHUNK_RADIX + dividendDigits[i];
            quotientDigit = roundTowardZero(currentDividendPart / scalarDivisor);
            remainder = currentDividendPart - quotientDigit * scalarDivisor;
            quotientDigits[i] = quotientDigit | 0; // Ensure integer
        }
        return [quotientDigits, remainder | 0]; // Ensure remainder is integer
    }

    /**
     * Generic division and modulo function, handles various types and sizes.
     * @param {NumericalEntity} dividend - The dividend.
     * @param {NumericalEntity} divisor - The divisor.
     * @returns {[NumericalEntity, NumericalEntity]} An array containing [quotient, remainder].
     * @throws {Error} If division by zero occurs.
     */
    function flexibleDivisionAndModulo(dividend, divisor) {
        // Ensure both operands are HugeNumber instances for consistency.
        const numDividend = coerceToHugeNumber(dividend);
        const numDivisor = coerceToHugeNumber(divisor);

        const dividendVal = numDividend.internalDigits;
        const divisorVal = numDivisor.internalDigits;

        // Handle division by zero.
        if (numDivisor.isZeroValue()) {
            throw new Error("Division by zero is not allowed.");
        }

        // Handle cases where dividend is zero.
        if (numDividend.isZeroValue()) {
            return [NUMERIC_CONSTANTS[0], NUMERIC_CONSTANTS[0]];
        }

        let quotientResult, remainderResult;

        // Optimized path for small divisors.
        if (numDivisor.isCompact) {
            const absDivisor = Math.abs(numDivisor.rawValue);
            // Handle division by 1 or -1.
            if (absDivisor === 1) {
                return [numDividend.flipSign(), NUMERIC_CONSTANTS[0]];
            }
            // If divisor fits within a single chunk.
            if (absDivisor < CHUNK_RADIX) {
                const [qDigits, rem] = scalarDivision(dividendVal, absDivisor);
                quotientResult = convertDigitArrayToNative(qDigits);
                remainderResult = numDividend.isNegative ? -rem : rem;

                // Construct quotient.
                let finalQuotient;
                if (typeof quotientResult === "number") {
                    finalQuotient = new CompactInteger(numDividend.isNegative !== numDivisor.isNegative ? -quotientResult : quotientResult);
                } else {
                    finalQuotient = new LargeInteger(quotientResult, numDividend.isNegative !== numDivisor.isNegative);
                }
                // Construct remainder.
                const finalRemainder = new CompactInteger(remainderResult);
                return [finalQuotient, finalRemainder];
            }
            // If divisor is small but doesn't fit in a single chunk, convert to array for general division.
            // This path is technically redundant if `convertNativeToDigitArray` always returns array for >= CHUNK_RADIX,
            // but keeps the logic explicit.
            // divisorVal = convertNativeToDigitArray(absDivisor);
        }

        // Compare absolute values of dividend and divisor.
        const absComparison = compareAbsoluteValues(dividendVal, divisorVal);

        // If dividend is smaller than divisor, quotient is 0, remainder is dividend.
        if (absComparison === -1) {
            return [NUMERIC_CONSTANTS[0], numDividend];
        }
        // If dividend equals divisor (absolute), quotient is 1 (or -1), remainder is 0.
        if (absComparison === 0) {
            const finalQuotient = new CompactInteger(numDividend.isNegative !== numDivisor.isNegative ? -1 : 1);
            return [finalQuotient, NUMERIC_CONSTANTS[0]];
        }

        // Perform actual long division.
        // Choose between different algorithms based on size.
        const divisionAlgorithm = (dividendVal.length + divisorVal.length <= 200) ? longDivisionAlgorithm : optimizedDivision;
        const [rawQuotient, rawRemainder] = divisionAlgorithm(dividendVal, divisorVal);

        // Determine signs for quotient and remainder.
        const quotientNegative = numDividend.isNegative !== numDivisor.isNegative;
        const remainderNegative = numDividend.isNegative;

        let finalQuotient, finalRemainder;

        // Convert raw quotient to appropriate NumericalEntity.
        if (typeof rawQuotient === "number") {
            finalQuotient = new CompactInteger(quotientNegative ? -rawQuotient : rawQuotient);
        } else {
            finalQuotient = new LargeInteger(rawQuotient, quotientNegative);
        }

        // Convert raw remainder to appropriate NumericalEntity.
        if (typeof rawRemainder === "number") {
            finalRemainder = new CompactInteger(remainderNegative ? -rawRemainder : rawRemainder);
        } else {
            finalRemainder = new LargeInteger(rawRemainder, remainderNegative);
        }

        return [finalQuotient, finalRemainder];
    }

    // --- Comparison Functions ---

    /**
     * Compares the absolute values of two digit arrays.
     * @param {number[]} arr1 - First digit array.
     * @param {number[]} arr2 - Second digit array.
     * @returns {number} -1 if arr1 < arr2, 0 if arr1 == arr2, 1 if arr1 > arr2.
     */
    function compareAbsoluteValues(arr1, arr2) {
        if (arr1.length !== arr2.length) {
            return arr1.length > arr2.length ? 1 : -1;
        }
        // Iterate from most significant digit downwards.
        for (let i = arr1.length - 1; i >= 0; --i) {
            if (arr1[i] !== arr2[i]) {
                return arr1[i] > arr2[i] ? 1 : -1;
            }
        }
        return 0; // Arrays are equal.
    }

    // --- Bitwise Operations (Internal) ---

    // Precomputed powers of 2 up to CHUNK_RADIX for bitwise operations.
    const CHUNK_POWERS_OF_TWO = [1];
    while (2 * CHUNK_POWERS_OF_TWO[CHUNK_POWERS_OF_TWO.length - 1] <= CHUNK_RADIX) {
        CHUNK_POWERS_OF_TWO.push(2 * CHUNK_POWERS_OF_TWO[CHUNK_POWERS_OF_TWO.length - 1]);
    }
    const CHUNK_POWER_COUNT = CHUNK_POWERS_OF_TWO.length;
    const MAX_CHUNK_POWER = CHUNK_POWERS_OF_TWO[CHUNK_POWER_COUNT - 1];

    /**
     * Checks if the shift amount is small enough to be handled directly or if it requires full BigInt operations.
     * @param {*} shiftAmount - The value representing the shift amount.
     * @returns {boolean} True if the shift amount is small.
     */
    function isShiftAmountSmall(shiftAmount) {
        // Native number or string convertible to native, and within CHUNK_RADIX, or a CompactInteger with small value.
        return (typeof shiftAmount === "number" || typeof shiftAmount === "string") && +Math.abs(shiftAmount) <= CHUNK_RADIX ||
            (shiftAmount instanceof LargeInteger || shiftAmount instanceof CompactInteger) && shiftAmount.internalDigits && shiftAmount.internalDigits.length <= 1;
    }

    /**
     * Performs a bitwise operation (`fn`) on two HugeNumber instances.
     * @param {NumericalEntity} num1 - The first operand.
     * @param {NumericalEntity} num2 - The second operand.
     * @param {function(number, number): number} fn - The bitwise function (e.g., `(a, b) => a & b`).
     * @returns {NumericalEntity} The result of the bitwise operation.
     */
    function performBitwiseOperation(num1, num2, fn) {
        const operand1 = coerceToHugeNumber(num1);
        const operand2 = coerceToHugeNumber(num2);

        const operand1Negative = operand1.isNegative;
        const operand2Negative = operand2.isNegative;

        // For negative numbers, bitwise operations are typically performed on their two's complement.
        // This implementation uses a simplified approach by converting to positive, performing the op,
        // then converting back and handling sign.
        const positiveOp1 = operand1Negative ? operand1.bitwiseNot() : operand1;
        const positiveOp2 = operand2Negative ? operand2.bitwiseNot() : operand2;

        let currentDigitOp1 = 0,
            currentDigitOp2 = 0;
        let remainingOp1 = positiveOp1,
            remainingOp2 = positiveOp2;
        let divModResultOp1, divModResultOp2;
        const resultDigits = [];

        // Process chunk by chunk from least significant.
        while (!remainingOp1.isZeroValue() || !remainingOp2.isZeroValue()) {
            divModResultOp1 = flexibleDivisionAndModulo(remainingOp1, MAX_CHUNK_POWER);
            currentDigitOp1 = divModResultOp1[1].toNativeNumber();
            if (operand1Negative) {
                currentDigitOp1 = MAX_CHUNK_POWER - 1 - currentDigitOp1; // Simulate two's complement for this chunk
            }

            divModResultOp2 = flexibleDivisionAndModulo(remainingOp2, MAX_CHUNK_POWER);
            currentDigitOp2 = divModResultOp2[1].toNativeNumber();
            if (operand2Negative) {
                currentDigitOp2 = MAX_CHUNK_POWER - 1 - currentDigitOp2; // Simulate two's complement for this chunk
            }

            remainingOp1 = divModResultOp1[0];
            remainingOp2 = divModResultOp2[0];

            resultDigits.push(fn(currentDigitOp1, currentDigitOp2));
        }

        // Determine the overall sign of the result based on the bitwise operation on the signs.
        // For two's complement, the result's sign is determined by the most significant bit.
        // If both were negative, or one was negative and the result needs to be negative.
        let finalResult = (fn(operand1Negative ? 1 : 0, operand2Negative ? 1 : 0) !== 0) ? NUMERIC_CONSTANTS[-1] : NUMERIC_CONSTANTS[0];

        // Reconstruct the result from chunks.
        for (let i = resultDigits.length - 1; i >= 0; --i) {
            finalResult = finalResult.multiply(MAX_CHUNK_POWER).add(new CompactInteger(resultDigits[i]));
        }

        return finalResult;
    }

    // Masks to find the lowest set bit in a number.
    const LOW_ORDER_BIT_MASK_NATIVE = 1 << 30; // For native numbers.
    const LOW_ORDER_BIT_MASK_BIGINT = (CHUNK_RADIX & -CHUNK_RADIX) * (CHUNK_RADIX & -CHUNK_RADIX) | LOW_ORDER_BIT_MASK_NATIVE; // For BigInt digits.

    /**
     * Finds the lowest set bit (LSB) in a number or digit array.
     * This is a rough estimation for optimization purposes (e.g., in GCD).
     * @param {NumericalEntity} num - The number to check.
     * @returns {number} A power of two representing the LSB.
     */
    function findLowestSetBit(num) {
        const val = num.internalDigits;
        // If it's a CompactInteger or a single-digit LargeInteger.
        if (num.isCompact || val.length === 1) {
            return num.rawValue & LOW_ORDER_BIT_MASK_NATIVE;
        }
        // For multi-digit LargeInteger, check the least significant digit.
        return val[0] & LOW_ORDER_BIT_MASK_BIGINT;
    }

    /**
     * Calculates the integer logarithm (log base `base` of `value`).
     * @param {NumericalEntity} value - The number whose logarithm is to be calculated.
     * @param {NumericalEntity} base - The base of the logarithm.
     * @returns {{p: NumericalEntity, e: number}} An object containing the power `p` and exponent `e` such that `p * base^e <= value`.
     */
    function calculateIntegerLog(value, base) {
        if (base.compareValues(value) <= 0) {
            const temp = calculateIntegerLog(value, base.square());
            const power = temp.p;
            const exponent = temp.e;
            const testProduct = power.multiply(base);
            return testProduct.compareValues(value) <= 0 ? {
                p: testProduct,
                e: exponent * 2 + 1
            } : {
                p: power,
                e: exponent * 2
            };
        }
        return {
            p: NUMERIC_CONSTANTS[1],
            e: 0
        };
    }

    // --- Public API Methods for NumericalEntity Prototypes ---

    // Additions
    LargeInteger.prototype.add = function(otherVal) {
        const otherNum = coerceToHugeNumber(otherVal);
        if (this.isNegative !== otherNum.isNegative) {
            // If signs differ, perform subtraction of absolute values.
            return this.subtract(otherNum.flipSign());
        }
        // If signs are the same, add absolute values and keep the sign.
        const resultDigits = otherNum.isCompact ?
            addSmallValueToArray(this.internalDigits, Math.abs(otherNum.rawValue)) :
            addFlexibleArrays(this.internalDigits, otherNum.internalDigits);
        return new LargeInteger(resultDigits, this.isNegative);
    };
    CompactInteger.prototype.add = function(otherVal) {
        const otherNum = coerceToHugeNumber(otherVal);
        const thisVal = this.rawValue;

        if (this.isNegative !== otherNum.isNegative) {
            return this.subtract(otherNum.flipSign());
        }

        if (otherNum.isCompact) {
            const sum = thisVal + otherNum.rawValue;
            if (canUseNativeArithmetic(sum)) {
                return new CompactInteger(sum);
            }
            // Fallback to LargeInteger if sum overflows native safe integer.
            const absSumDigits = addSmallValueToArray(convertNativeToDigitArray(Math.abs(thisVal)), Math.abs(otherNum.rawValue));
            return new LargeInteger(absSumDigits, this.isNegative);
        } else {
            // Other number is LargeInteger, add small value to its digits.
            const resultDigits = addSmallValueToArray(otherNum.internalDigits, Math.abs(thisVal));
            return new LargeInteger(resultDigits, this.isNegative);
        }
    };
    LargeInteger.prototype.plus = LargeInteger.prototype.add;
    CompactInteger.prototype.plus = CompactInteger.prototype.add;

    // Subtractions
    LargeInteger.prototype.subtract = function(otherVal) {
        const otherNum = coerceToHugeNumber(otherVal);
        if (this.isNegative !== otherNum.isNegative) {
            // If signs differ, perform addition of absolute values.
            return this.add(otherNum.flipSign());
        }
        // If signs are the same, perform subtraction of absolute values.
        // The sign of the result depends on which absolute value is larger.
        if (otherNum.isCompact) {
            return subtractSmallValueFromArray(this.internalDigits, Math.abs(otherNum.rawValue), this.isNegative);
        }
        return subtractFlexibleArrays(this.internalDigits, otherNum.internalDigits, this.isNegative);
    };
    CompactInteger.prototype.subtract = function(otherVal) {
        const otherNum = coerceToHugeNumber(otherVal);
        const thisVal = this.rawValue;

        if (this.isNegative !== otherNum.isNegative) {
            return this.add(otherNum.flipSign());
        }

        if (otherNum.isCompact) {
            const difference = thisVal - otherNum.rawValue;
            if (canUseNativeArithmetic(difference)) {
                return new CompactInteger(difference);
            }
            // If difference overflows, convert to LargeInteger subtraction.
            const absDiffDigits = subtractFlexibleArrays(
                convertNativeToDigitArray(Math.abs(thisVal)),
                convertNativeToDigitArray(Math.abs(otherNum.rawValue)),
                thisVal < otherNum.rawValue // Determine sign based on which was larger
            );
            return absDiffDigits; // subtractFlexibleArrays already returns HugeNumber
        } else {
            // Other number is LargeInteger, perform subtraction with sign.
            // Note: `this` is small, `otherNum` is large.
            // result = Small - Large = -(Large - Small)
            return subtractSmallValueFromArray(otherNum.internalDigits, Math.abs(thisVal), !this.isNegative);
        }
    };
    LargeInteger.prototype.minus = LargeInteger.prototype.subtract;
    CompactInteger.prototype.minus = CompactInteger.prototype.subtract;

    // Negation
    LargeInteger.prototype.flipSign = function() {
        return new LargeInteger(this.internalDigits, !this.isNegative);
    };
    CompactInteger.prototype.flipSign = function() {
        return new CompactInteger(-this.rawValue);
    };

    // Absolute Value
    LargeInteger.prototype.absoluteValue = function() {
        return new LargeInteger(this.internalDigits, false);
    };
    CompactInteger.prototype.absoluteValue = function() {
        return new CompactInteger(Math.abs(this.rawValue));
    };

    // Multiplications
    LargeInteger.prototype.multiply = function(otherVal) {
        const otherNum = coerceToHugeNumber(otherVal);
        const finalSign = this.isNegative !== otherNum.isNegative;

        // Handle zero operand.
        if (this.isZeroValue() || otherNum.isZeroValue()) {
            return NUMERIC_CONSTANTS[0];
        }

        // Optimized path for small second operand.
        if (otherNum.isCompact) {
            const scalar = otherNum.rawValue;
            if (scalar === 1) return this;
            if (scalar === -1) return this.flipSign();

            const absScalar = Math.abs(scalar);
            if (absScalar < CHUNK_RADIX) {
                return new LargeInteger(scalarMultiplication(this.internalDigits, absScalar), finalSign);
            }
            // If scalar is larger than a chunk, treat as array multiplication.
            return multiplyScalarByArray(absScalar, this.internalDigits, finalSign);
        }

        // Generic multiplication for two LargeIntegers.
        const digits1 = this.internalDigits;
        const digits2 = otherNum.internalDigits;
        let productDigits;

        // Decide between Karatsuba and long multiplication.
        if (shouldUseKaratsuba(digits1.length, digits2.length)) {
            productDigits = karatsubaProduct(digits1, digits2);
        } else {
            productDigits = longMultiplication(digits1, digits2);
        }
        return new LargeInteger(productDigits, finalSign);
    };
    CompactInteger.prototype.multiply = function(otherVal) {
        const otherNum = coerceToHugeNumber(otherVal);
        // Delegate to a common handler for small multiplier.
        return otherNum._scalarMultiplyHandler(this);
    };

    // Internal handler for multiplication by a small number.
    LargeInteger.prototype._scalarMultiplyHandler = function(smallNum) {
        // smallNum is guaranteed to be a CompactInteger here.
        if (smallNum.isZeroValue()) return NUMERIC_CONSTANTS[0];
        if (smallNum.rawValue === 1) return this;
        if (smallNum.rawValue === -1) return this.flipSign();

        // Perform multiplication with the current LargeInteger's digits.
        return multiplyScalarByArray(Math.abs(smallNum.rawValue), this.internalDigits, this.isNegative !== smallNum.isNegative);
    };
    CompactInteger.prototype._scalarMultiplyHandler = function(smallNum) {
        // Both are CompactIntegers.
        const product = this.rawValue * smallNum.rawValue;
        if (canUseNativeArithmetic(product)) {
            return new CompactInteger(product);
        }
        // If product overflows, convert to LargeInteger multiplication.
        const finalSign = this.isNegative !== smallNum.isNegative;
        return multiplyScalarByArray(Math.abs(smallNum.rawValue), convertNativeToDigitArray(Math.abs(this.rawValue)), finalSign);
    };

    LargeInteger.prototype.times = LargeInteger.prototype.multiply;
    CompactInteger.prototype.times = CompactInteger.prototype.multiply;

    // Squaring
    LargeInteger.prototype.square = function() {
        return new LargeInteger(calculateSquare(this.internalDigits), false);
    };
    CompactInteger.prototype.square = function() {
        const squaredValue = this.rawValue * this.rawValue;
        if (canUseNativeArithmetic(squaredValue)) {
            return new CompactInteger(squaredValue);
        }
        // If result overflows, compute as LargeInteger.
        return new LargeInteger(calculateSquare(convertNativeToDigitArray(Math.abs(this.rawValue))), false);
    };

    // Division and Modulo
    LargeInteger.prototype.getQuotientAndRemainder = function(otherVal) {
        // flexibleDivisionAndModulo returns [quotient, remainder]
        const result = flexibleDivisionAndModulo(this, otherVal);
        return {
            quotient: result[0],
            remainder: result[1]
        };
    };
    CompactInteger.prototype.getQuotientAndRemainder = LargeInteger.prototype.getQuotientAndRemainder;

    LargeInteger.prototype.getQuotient = function(otherVal) {
        return flexibleDivisionAndModulo(this, otherVal)[0];
    };
    CompactInteger.prototype.over = CompactInteger.prototype.getQuotient;
    LargeInteger.prototype.over = LargeInteger.prototype.getQuotient;

    LargeInteger.prototype.getRemainder = function(otherVal) {
        return flexibleDivisionAndModulo(this, otherVal)[1];
    };
    CompactInteger.prototype.remainder = CompactInteger.prototype.getRemainder;
    CompactInteger.prototype.getRemainder = LargeInteger.prototype.getRemainder;
    LargeInteger.prototype.remainder = LargeInteger.prototype.getRemainder;

    // Exponentiation
    LargeInteger.prototype.power = function(exponentVal) {
        const exponentNum = coerceToHugeNumber(exponentVal);

        // Handle base cases for exponent.
        if (exponentNum.isZeroValue()) return NUMERIC_CONSTANTS[1]; // x^0 = 1
        if (this.isZeroValue()) return NUMERIC_CONSTANTS[0]; // 0^y = 0 (for y > 0)
        if (this.isOneOrMinusOne()) {
            if (this.isNegative) { // (-1)^y
                return exponentNum.isEvenNumber() ? NUMERIC_CONSTANTS[1] : NUMERIC_CONSTANTS[-1];
            }
            return NUMERIC_CONSTANTS[1]; // 1^y = 1
        }

        // Negative exponents are not supported for integer power.
        if (exponentNum.isNegative) {
            // For integer power, negative exponent means 1/x^abs(y), which results in fraction.
            // Return 0 for consistency with some BigInt libraries, or throw error.
            return NUMERIC_CONSTANTS[0];
        }

        // Exponent must be a small integer.
        if (!exponentNum.isCompact) {
            throw new Error(`The exponent ${exponentNum.toNumeralString()} is too large for direct power calculation.`);
        }

        const exponent = exponentNum.rawValue;
        let result = NUMERIC_CONSTANTS[1];
        let base = this;

        // Binary exponentiation (exponentiation by squaring).
        while (exponent > 0) {
            if (exponent % 2 === 1) {
                result = result.multiply(base);
            }
            if (exponent === 1) break; // Optimization: avoid unnecessary squaring after last multiplication.
            base = base.square();
            // Using integer division.
            exponent = Math.floor(exponent / 2);
        }
        return result;
    };
    CompactInteger.prototype.power = LargeInteger.prototype.power;

    // Modular Exponentiation
    LargeInteger.prototype.modularExponentiation = function(exponentVal, modulusVal) {
        const exponentNum = coerceToHugeNumber(exponentVal);
        const modulusNum = coerceToHugeNumber(modulusVal);

        if (modulusNum.isZeroValue()) {
            throw new Error("Cannot perform modular exponentiation with modulus 0.");
        }

        let result = NUMERIC_CONSTANTS[1];
        let base = this.getRemainder(modulusNum); // Base reduced modulo modulus.

        // Loop while exponent is positive.
        while (exponentNum.isPositiveNumber()) {
            if (base.isZeroValue()) {
                return NUMERIC_CONSTANTS[0]; // 0^exp mod N = 0
            }
            if (exponentNum.isOddNumber()) {
                result = result.multiply(base).getRemainder(modulusNum);
            }
            exponentNum = exponentNum.getQuotient(2); // exponentNum = floor(exponentNum / 2)
            base = base.square().getRemainder(modulusNum);
        }
        return result;
    };
    CompactInteger.prototype.modularExponentiation = LargeInteger.prototype.modularExponentiation;

    // Comparisons
    LargeInteger.prototype.compareValues = function(otherVal) {
        const otherNum = coerceToHugeNumber(otherVal);

        // Handle special JS values like Infinity.
        if (otherVal === Infinity) return -1;
        if (otherVal === -Infinity) return 1;

        // Different signs.
        if (this.isNegative !== otherNum.isNegative) {
            return this.isNegative ? -1 : 1; // Negative is smaller than positive.
        }

        // Same signs. Compare absolute values.
        let comparisonResult;
        if (otherNum.isCompact) {
            // Compare LargeInteger with CompactInteger (converted to array).
            comparisonResult = compareAbsoluteValues(this.internalDigits, convertNativeToDigitArray(Math.abs(otherNum.rawValue)));
        } else {
            // Compare two LargeIntegers.
            comparisonResult = compareAbsoluteValues(this.internalDigits, otherNum.internalDigits);
        }

        // If negative, flip the comparison result.
        return this.isNegative ? -comparisonResult : comparisonResult;
    };
    CompactInteger.prototype.compareValues = function(otherVal) {
        const otherNum = coerceToHugeNumber(otherVal);

        // Handle special JS values like Infinity.
        if (otherVal === Infinity) return -1;
        if (otherVal === -Infinity) return 1;

        const thisVal = this.rawValue;
        if (otherNum.isCompact) {
            const otherValRaw = otherNum.rawValue;
            return thisVal === otherValRaw ? 0 : (thisVal > otherValRaw ? 1 : -1);
        }

        // Comparing CompactInteger with LargeInteger.
        if (this.isNegative !== otherNum.isNegative) {
            return this.isNegative ? -1 : 1;
        }

        // Both same sign, but one is compact, other is large.
        // A compact number will generally be 'smaller' in magnitude than a large number.
        // The only edge case is if the LargeInteger's internalDigits represent a small value.
        // But `coerceToHugeNumber` should convert such LargeIntegers to CompactIntegers.
        // So if `otherNum` is `LargeInteger`, it must be absolutely larger than `NATIVE_MAX_SAFE_VALUE`.
        // Thus, if `this` is `CompactInteger`, it must be smaller in magnitude.
        return this.isNegative ? 1 : -1; // If negative: compact is larger. If positive: compact is smaller.
    };
    LargeInteger.prototype.compareTo = LargeInteger.prototype.compareValues;
    CompactInteger.prototype.compareTo = CompactInteger.prototype.compareValues;

    LargeInteger.prototype.compareAbsoluteValues = function(otherVal) {
        const otherNum = coerceToHugeNumber(otherVal);
        const digits1 = this.internalDigits;
        const digits2 = otherNum.isCompact ? convertNativeToDigitArray(Math.abs(otherNum.rawValue)) : otherNum.internalDigits;
        return compareAbsoluteValues(digits1, digits2);
    };
    CompactInteger.prototype.compareAbsoluteValues = function(otherVal) {
        const otherNum = coerceToHugeNumber(otherVal);
        const absThisVal = Math.abs(this.rawValue);
        if (otherNum.isCompact) {
            const absOtherVal = Math.abs(otherNum.rawValue);
            return absThisVal === absOtherVal ? 0 : (absThisVal > absOtherVal ? 1 : -1);
        }
        // Compact is always smaller in magnitude than a LargeInteger.
        return -1;
    };

    // Equality checks
    LargeInteger.prototype.isEqualTo = function(otherVal) {
        return this.compareValues(otherVal) === 0;
    };
    CompactInteger.prototype.isEqualTo = CompactInteger.prototype.isEqualTo;
    LargeInteger.prototype.eq = LargeInteger.prototype.isEqualTo;
    CompactInteger.prototype.eq = CompactInteger.prototype.isEqualTo;

    LargeInteger.prototype.isNotEqualTo = function(otherVal) {
        return this.compareValues(otherVal) !== 0;
    };
    CompactInteger.prototype.isNotEqualTo = CompactInteger.prototype.isNotEqualTo;
    LargeInteger.prototype.neq = LargeInteger.prototype.isNotEqualTo;
    CompactInteger.prototype.neq = CompactInteger.prototype.isNotEqualTo;

    // Relational checks
    LargeInteger.prototype.isGreaterThan = function(otherVal) {
        return this.compareValues(otherVal) > 0;
    };
    CompactInteger.prototype.isGreaterThan = CompactInteger.prototype.isGreaterThan;
    LargeInteger.prototype.gt = LargeInteger.prototype.isGreaterThan;
    CompactInteger.prototype.gt = CompactInteger.prototype.isGreaterThan;

    LargeInteger.prototype.isLesserThan = function(otherVal) {
        return this.compareValues(otherVal) < 0;
    };
    CompactInteger.prototype.isLesserThan = CompactInteger.prototype.isLesserThan;
    LargeInteger.prototype.lt = LargeInteger.prototype.isLesserThan;
    CompactInteger.prototype.lt = CompactInteger.prototype.isLesserThan;

    LargeInteger.prototype.isGreaterOrEqualTo = function(otherVal) {
        return this.compareValues(otherVal) >= 0;
    };
    CompactInteger.prototype.isGreaterOrEqualTo = CompactInteger.prototype.isGreaterOrEqualTo;
    LargeInteger.prototype.geq = LargeInteger.prototype.isGreaterOrEqualTo;
    CompactInteger.prototype.geq = CompactInteger.prototype.isGreaterOrEqualTo;

    LargeInteger.prototype.isLesserOrEqualTo = function(otherVal) {
        return this.compareValues(otherVal) <= 0;
    };
    CompactInteger.prototype.isLesserOrEqualTo = CompactInteger.prototype.isLesserOrEqualTo;
    LargeInteger.prototype.leq = LargeInteger.prototype.isLesserOrEqualTo;
    CompactInteger.prototype.leq = CompactInteger.prototype.isLesserOrEqualTo;

    // Parity checks
    LargeInteger.prototype.isEvenNumber = function() {
        return (this.internalDigits[0] & 1) === 0; // Check least significant digit.
    };
    CompactInteger.prototype.isEvenNumber = function() {
        return (this.rawValue & 1) === 0;
    };

    LargeInteger.prototype.isOddNumber = function() {
        return (this.internalDigits[0] & 1) === 1;
    };
    CompactInteger.prototype.isOddNumber = function() {
        return (this.rawValue & 1) === 1;
    };

    // Sign checks
    LargeInteger.prototype.isPositiveNumber = function() {
        return !this.isNegative;
    };
    CompactInteger.prototype.isPositiveNumber = function() {
        return this.rawValue > 0;
    };

    LargeInteger.prototype.isNegativeNumber = function() {
        return this.isNegative;
    };
    CompactInteger.prototype.isNegativeNumber = function() {
        return this.rawValue < 0;
    };

    // Value checks
    LargeInteger.prototype.isOneOrMinusOne = function() {
        return false; // A LargeInteger can't be 1 or -1 directly unless it's created from a small value.
    };
    CompactInteger.prototype.isOneOrMinusOne = function() {
        return Math.abs(this.rawValue) === 1;
    };

    LargeInteger.prototype.isZeroValue = function() {
        // A LargeInteger is zero if its digit array is empty or contains only [0].
        return this.internalDigits.length === 0 || (this.internalDigits.length === 1 && this.internalDigits[0] === 0);
    };
    CompactInteger.prototype.isZeroValue = function() {
        return this.rawValue === 0;
    };

    // Divisibility
    LargeInteger.prototype.isDivisibleByOther = function(otherVal) {
        const otherNum = coerceToHugeNumber(otherVal);
        if (otherNum.isZeroValue()) return false; // Cannot divide by zero.
        if (otherNum.isOneOrMinusOne()) return true; // Divisible by 1 or -1.
        if (otherNum.rawValue === 2) return this.isEvenNumber(); // Optimized for 2.

        // General case: check if remainder is zero.
        return this.getRemainder(otherNum).isEqualTo(NUMERIC_CONSTANTS[0]);
    };
    CompactInteger.prototype.isDivisibleByOther = LargeInteger.prototype.isDivisibleByOther;

    // Primality tests
    /**
     * Checks if a number is a basic small prime (2, 3, 5) or easily determined not prime.
     * @param {NumericalEntity} num - The number to check.
     * @returns {boolean|undefined} True if prime, false if composite, undefined if more complex test needed.
     */
    function isSmallPrime(num) {
        const absNum = num.absoluteValue();
        if (absNum.isOneOrMinusOne()) return false; // 1 and -1 are not prime.
        if (absNum.isEqualTo(NUMERIC_CONSTANTS[2]) || absNum.isEqualTo(NUMERIC_CONSTANTS[3]) || absNum.isEqualTo(NUMERIC_CONSTANTS[5])) {
            return true; // 2, 3, 5 are prime.
        }
        if (absNum.isEvenNumber() || absNum.isDivisibleByOther(NUMERIC_CONSTANTS[3]) || absNum.isDivisibleByOther(NUMERIC_CONSTANTS[5])) {
            return false; // Divisible by 2, 3, or 5 (and not 2, 3, 5 itself).
        }
        if (absNum.isLesserThan(NUMERIC_CONSTANTS[25])) {
            return true; // Small numbers not caught above (7, 11, 13, 17, 19, 23) are prime.
        }
        return undefined; // Needs more advanced primality test.
    }

    LargeInteger.prototype.checkPrimality = function() {
        const basicCheck = isSmallPrime(this);
        if (basicCheck !== undefined) return basicCheck;

        const num = this.absoluteValue();
        const numPrev = num.decrement(); // n-1

        // Miller-Rabin primality test using predefined small prime bases.
        const testBases = [2, 3, 5, 7, 11, 13, 17, 19];
        let d = numPrev; // d = n-1
        let s = 0; // n-1 = d * 2^s
        while (d.isEvenNumber()) {
            d = d.getQuotient(2);
            s++;
        }

        // Perform Miller-Rabin test for each base.
        for (let i = 0; i < testBases.length; ++i) {
            const a = coerceToHugeNumber(testBases[i]);
            let x = a.modularExponentiation(d, num); // x = a^d mod n

            if (x.isEqualTo(NUMERIC_CONSTANTS[1]) || x.isEqualTo(numPrev)) {
                continue; // Witness passes.
            }

            let witnessPassed = false;
            for (let r = 0; r < s; ++r) {
                x = x.square().getRemainder(num); // x = x^2 mod n
                if (x.isEqualTo(numPrev)) {
                    witnessPassed = true;
                    break;
                }
            }
            if (!witnessPassed) {
                return false; // n is composite.
            }
        }
        return true; // n is probably prime.
    };
    CompactInteger.prototype.checkPrimality = LargeInteger.prototype.checkPrimality;

    LargeInteger.prototype.checkProbablePrimality = function(iterations) {
        const basicCheck = isSmallPrime(this);
        if (basicCheck !== undefined) return basicCheck;

        const num = this.absoluteValue();
        const numPrev = num.decrement();
        const numMinus2 = num.subtract(NUMERIC_CONSTANTS[2]);
        const numIterations = iterations === undefined ? 5 : iterations;

        for (let i = 0; i < numIterations; ++i) {
            // Pick a random 'a' such that 2 <= a <= n-2.
            const a = generateRandomBetween(NUMERIC_CONSTANTS[2], numMinus2);
            if (!a.modularExponentiation(numPrev, num).isOneOrMinusOne()) {
                return false; // Witness fails, n is composite.
            }
        }
        return true; // n is probably prime.
    };
    CompactInteger.prototype.checkProbablePrimality = LargeInteger.prototype.checkProbablePrimality;

    // Modular Inverse
    LargeInteger.prototype.modularInverse = function(modulusVal) {
        let t = NUMERIC_CONSTANTS[0];
        let newT = NUMERIC_CONSTANTS[1];
        let r = coerceToHugeNumber(modulusVal);
        let newR = this.absoluteValue(); // Use absolute value for extended Euclidean algorithm.

        let q, lastT, lastR;

        // Extended Euclidean algorithm to find gcd(a, m) and x, y such that ax + my = gcd(a, m).
        // If gcd(a, m) = 1, then x is the modular inverse.
        while (!newR.isZeroValue()) {
            q = r.getQuotient(newR);
            lastT = t;
            lastR = r;
            t = newT;
            r = newR;
            newT = lastT.subtract(q.multiply(newT));
            newR = lastR.subtract(q.multiply(newR));
        }

        // If gcd(this, modulus) is not 1, then modular inverse doesn't exist.
        if (!r.isEqualTo(NUMERIC_CONSTANTS[1])) {
            throw new Error(`Numbers ${this.toNumeralString()} and ${modulusVal.toNumeralString()} are not coprime. Modular inverse does not exist.`);
        }

        // Ensure the result is positive.
        if (t.isNegativeNumber()) {
            t = t.add(modulusNum);
        }

        // If the original number was negative, adjust the inverse.
        if (this.isNegativeNumber()) {
            return t.flipSign();
        }
        return t;
    };
    CompactInteger.prototype.modularInverse = LargeInteger.prototype.modularInverse;

    // Increment/Decrement
    LargeInteger.prototype.increment = function() {
        if (this.isNegative) {
            // For negative numbers, incrementing means subtracting 1 from absolute value.
            return subtractSmallValueFromArray(this.internalDigits, 1, this.isNegative);
        }
        return new LargeInteger(addSmallValueToArray(this.internalDigits, 1), false);
    };
    CompactInteger.prototype.increment = function() {
        const nextVal = this.rawValue + 1;
        if (nextVal < NATIVE_MAX_SAFE_VALUE) {
            return new CompactInteger(nextVal);
        }
        // If it overflows, switch to LargeInteger.
        return new LargeInteger(NATIVE_MAX_DIGIT_ARRAY, false);
    };

    LargeInteger.prototype.decrement = function() {
        if (this.isNegative) {
            // For negative numbers, decrementing means adding 1 to absolute value and keeping negative.
            return new LargeInteger(addSmallValueToArray(this.internalDigits, 1), true);
        }
        // For positive numbers, decrementing means subtracting 1.
        return subtractSmallValueFromArray(this.internalDigits, 1, this.isNegative);
    };
    CompactInteger.prototype.decrement = function() {
        const prevVal = this.rawValue - 1;
        if (prevVal > -NATIVE_MAX_SAFE_VALUE) {
            return new CompactInteger(prevVal);
        }
        // If it underflows, switch to LargeInteger.
        return new LargeInteger(NATIVE_MAX_DIGIT_ARRAY, true);
    };

    // Bitwise Shifts
    LargeInteger.prototype.arithmeticShiftLeft = function(shiftAmount) {
        if (!isShiftAmountSmall(shiftAmount)) {
            throw new Error(`Shift amount ${String(shiftAmount)} is too large for shifting.`);
        }
        const shift = +shiftAmount; // Ensure it's a number.
        if (shift < 0) return this.arithmeticShiftRight(-shift);
        if (this.isZeroValue()) return this; // Shifting zero results in zero.

        let result = this;
        let remainingShift = shift;

        // Shift by powers of MAX_CHUNK_POWER.
        while (remainingShift >= CHUNK_POWER_COUNT) {
            result = result.multiply(MAX_CHUNK_POWER);
            remainingShift -= (CHUNK_POWER_COUNT - 1); // Each multiply by MAX_CHUNK_POWER shifts by CHUNK_POWER_COUNT-1 bits.
        }
        return result.multiply(CHUNK_POWERS_OF_TWO[remainingShift]);
    };
    CompactInteger.prototype.arithmeticShiftLeft = LargeInteger.prototype.arithmeticShiftLeft;

    LargeInteger.prototype.arithmeticShiftRight = function(shiftAmount) {
        if (!isShiftAmountSmall(shiftAmount)) {
            throw new Error(`Shift amount ${String(shiftAmount)} is too large for shifting.`);
        }
        const shift = +shiftAmount;
        if (shift < 0) return this.arithmeticShiftLeft(-shift);

        let result = this;
        let remainingShift = shift;
        let divModPair;

        // Handle shifting by powers of MAX_CHUNK_POWER.
        while (remainingShift >= CHUNK_POWER_COUNT) {
            if (result.isZeroValue() || (result.isNegativeNumber() && result.isOneOrMinusOne())) {
                return result; // -1 shifted right remains -1, 0 remains 0.
            }
            divModPair = flexibleDivisionAndModulo(result, MAX_CHUNK_POWER);
            result = divModPair[0];
            // If remainder is negative and non-zero, adjust quotient for floor division behavior.
            if (divModPair[1].isNegativeNumber() && !divModPair[1].isZeroValue()) {
                result = result.decrement();
            }
            remainingShift -= (CHUNK_POWER_COUNT - 1);
        }

        // Perform final shift.
        divModPair = flexibleDivisionAndModulo(result, CHUNK_POWERS_OF_TWO[remainingShift]);
        result = divModPair[0];
        // If remainder is negative and non-zero, adjust quotient.
        if (divModPair[1].isNegativeNumber() && !divModPair[1].isZeroValue()) {
            result = result.decrement();
        }
        return result;
    };
    CompactInteger.prototype.arithmeticShiftRight = LargeInteger.prototype.arithmeticShiftRight;

    // Bitwise Logic
    LargeInteger.prototype.bitwiseNot = function() {
        return this.flipSign().decrement(); // ~x = -(x + 1)
    };
    CompactInteger.prototype.bitwiseNot = LargeInteger.prototype.bitwiseNot;

    LargeInteger.prototype.bitwiseAnd = function(otherVal) {
        return performBitwiseOperation(this, otherVal, (a, b) => a & b);
    };
    CompactInteger.prototype.bitwiseAnd = LargeInteger.prototype.bitwiseAnd;

    LargeInteger.prototype.bitwiseOr = function(otherVal) {
        return performBitwiseOperation(this, otherVal, (a, b) => a | b);
    };
    CompactInteger.prototype.bitwiseOr = LargeInteger.prototype.bitwiseOr;

    LargeInteger.prototype.bitwiseXor = function(otherVal) {
        return performBitwiseOperation(this, otherVal, (a, b) => a ^ b);
    };
    CompactInteger.prototype.bitwiseXor = LargeInteger.prototype.bitwiseXor;

    // Bit Length
    LargeInteger.prototype.getBitLength = function() {
        let num = this;
        // For negative numbers, bit length is usually defined for abs(n)-1 (two's complement representation).
        if (num.isNegativeNumber()) {
            num = num.flipSign().decrement();
        }
        if (num.isZeroValue()) {
            return NUMERIC_CONSTANTS[0];
        }
        // Use integer logarithm base 2.
        return coerceToHugeNumber(calculateIntegerLog(num, NUMERIC_CONSTANTS[2]).e).add(NUMERIC_CONSTANTS[1]);
    };
    CompactInteger.prototype.getBitLength = LargeInteger.prototype.getBitLength;

    // --- Static Utility Methods ---

    /**
     * Finds the maximum of two HugeNumber instances.
     * @param {NumericalEntity} num1 - First number.
     * @param {NumericalEntity} num2 - Second number.
     * @returns {NumericalEntity} The larger of the two.
     */
    function findMaximum(num1, num2) {
        const n1 = coerceToHugeNumber(num1);
        const n2 = coerceToHugeNumber(num2);
        return n1.isGreaterThan(n2) ? n1 : n2;
    }

    /**
     * Finds the minimum of two HugeNumber instances.
     * @param {NumericalEntity} num1 - First number.
     * @param {NumericalEntity} num2 - Second number.
     * @returns {NumericalEntity} The smaller of the two.
     */
    function findMinimum(num1, num2) {
        const n1 = coerceToHugeNumber(num1);
        const n2 = coerceToHugeNumber(num2);
        return n1.isLesserThan(n2) ? n1 : n2;
    }

    /**
     * Calculates the greatest common divisor (GCD) of two numbers using binary GCD algorithm.
     * @param {NumericalEntity} num1 - First number.
     * @param {NumericalEntity} num2 - Second number.
     * @returns {NumericalEntity} The GCD.
     */
    function greatestCommonDivisor(num1, num2) {
        let a = coerceToHugeNumber(num1).absoluteValue();
        let b = coerceToHugeNumber(num2).absoluteValue();

        if (a.isEqualTo(b)) return a;
        if (a.isZeroValue()) return b;
        if (b.isZeroValue()) return a;

        let commonFactor = NUMERIC_CONSTANTS[1]; // Store common factors of 2.

        // Remove common factors of 2.
        while (a.isEvenNumber() && b.isEvenNumber()) {
            const lowestBitA = findLowestSetBit(a);
            const lowestBitB = findLowestSetBit(b);
            const minLowestBit = Math.min(lowestBitA, lowestBitB);
            commonFactor = commonFactor.multiply(minLowestBit);
            a = a.getQuotient(minLowestBit);
            b = b.getQuotient(minLowestBit);
        }

        // Remove remaining factors of 2 from 'a'.
        while (a.isEvenNumber()) {
            a = a.getQuotient(findLowestSetBit(a));
        }

        // Apply Euclidean algorithm (optimized for even numbers).
        do {
            while (b.isEvenNumber()) {
                b = b.getQuotient(findLowestSetBit(b));
            }
            if (a.isGreaterThan(b)) {
                [a, b] = [b, a]; // Swap if a > b.
            }
            b = b.subtract(a); // b = b - a.
        } while (!b.isZeroValue());

        return commonFactor.isOneOrMinusOne() ? a : a.multiply(commonFactor);
    }

    /**
     * Calculates the least common multiple (LCM) of two numbers.
     * LCM(a,b) = |a*b| / GCD(a,b).
     * @param {NumericalEntity} num1 - First number.
     * @param {NumericalEntity} num2 - Second number.
     * @returns {NumericalEntity} The LCM.
     */
    function leastCommonMultiple(num1, num2) {
        const a = coerceToHugeNumber(num1).absoluteValue();
        const b = coerceToHugeNumber(num2).absoluteValue();
        // Handle multiplication first to avoid intermediate division that might truncate.
        return a.getQuotient(greatestCommonDivisor(a, b)).multiply(b);
    }

    /**
     * Generates a cryptographically secure random HugeNumber within a specified range [min, max].
     * Fallback to Math.random if crypto is not available.
     * @param {NumericalEntity} minVal - The lower bound (inclusive).
     * @param {NumericalEntity} maxVal - The upper bound (inclusive).
     * @returns {NumericalEntity} A random HugeNumber.
     */
    function generateRandomBetween(minVal, maxVal) {
        const lowerBound = findMinimum(minVal, maxVal);
        const upperBound = findMaximum(minVal, maxVal);
        const range = upperBound.subtract(lowerBound).add(NUMERIC_CONSTANTS[1]);

        if (range.isCompact) {
            // If range fits native number, use Math.random directly.
            return lowerBound.add(Math.floor(Math.random() * range.rawValue));
        }

        const len = range.internalDigits.length;
        const resultDigits = [];
        let restricted = true; // Flag to indicate if we're still restricted by the upper bound's digits.

        // Generate digits from most significant to least significant.
        for (let i = len - 1; i >= 0; --i) {
            const upperLimitForDigit = restricted ? range.internalDigits[i] : CHUNK_RADIX;
            let randomDigit;

            // Use Web Crypto API if available for better randomness.
            if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
                const randomBytes = new Uint32Array(1);
                crypto.getRandomValues(randomBytes);
                // Scale the random value to fit the digit range.
                randomDigit = Math.floor((randomBytes[0] / (0xFFFFFFFF + 1)) * (upperLimitForDigit + 1));
            } else {
                randomDigit = roundTowardZero(Math.random() * (upperLimitForDigit + 1));
            }

            resultDigits.unshift(randomDigit); // Add to the beginning.
            if (randomDigit < upperLimitForDigit) {
                restricted = false; // Once a digit is smaller than the range's digit, no longer restricted.
            }
        }

        // Convert the generated digit array to a HugeNumber.
        const randomNumRaw = convertDigitArrayToNative(resultDigits);
        const randomHugeNum = typeof randomNumRaw === "number" ?
            new CompactInteger(randomNumRaw) :
            new LargeInteger(randomNumRaw, false);

        return lowerBound.add(randomHugeNum);
    }

    // --- Base Conversion and String Representation ---

    /**
     * Parses a string value from a given base into a HugeNumber.
     * Handles custom digit representations like `<123>`.
     * @param {string} textValue - The string representation of the number.
     * @param {NumericalEntity} baseNum - The base to use for parsing.
     * @returns {NumericalEntity} The parsed HugeNumber.
     * @throws {Error} For invalid digits or bases.
     */
    const parseValueWithBase = function(textValue, baseNum) {
        const absBase = Math.abs(baseNum.toNativeNumber()); // Use native for char code checks.
        const isNegative = textValue[0] === "-";
        let startIndex = isNegative ? 1 : 0;

        // Basic validation for digits against the base.
        for (let i = startIndex; i < textValue.length; ++i) {
            const char = textValue[i].toLowerCase();
            if (char === "<") { // Handle custom digits.
                let endBracket = textValue.indexOf(">", i);
                if (endBracket === -1) throw new Error(`Invalid custom digit format in "${textValue}"`);
                const customDigit = parseInt(textValue.substring(i + 1, endBracket), 10);
                if (isNaN(customDigit) || customDigit >= absBase) {
                    throw new Error(`Custom digit <${customDigit}> is not valid for base ${absBase}.`);
                }
                i = endBracket;
            } else {
                const digitValue = parseInt(char, absBase); // Try to parse with the base.
                if (isNaN(digitValue) || digitValue >= absBase) {
                    throw new Error(`Character '${char}' is not a valid digit in base ${absBase}.`);
                }
            }
        }

        // Optimized path for common bases (2-36) if the number is small enough.
        if (baseNum.isCompact && baseNum.rawValue >= 2 && baseNum.rawValue <= 36) {
            // Check if it fits into a native JS number based on length and base.
            if (textValue.length <= NATIVE_MAX_VALUE_LOG / Math.log(baseNum.rawValue) + 1) {
                const nativeResult = parseInt(textValue, baseNum.rawValue);
                if (!isNaN(nativeResult)) {
                    return new CompactInteger(nativeResult);
                }
            }
        }

        // Generic parsing for arbitrary base.
        const digitsArray = [];
        for (let i = startIndex; i < textValue.length; ++i) {
            const char = textValue[i].toLowerCase();
            if (char === "<") {
                let endBracket = textValue.indexOf(">", i);
                digitsArray.push(coerceToHugeNumber(textValue.slice(i + 1, endBracket)));
                i = endBracket;
            } else {
                let digitValue;
                const charCode = char.charCodeAt(0);
                if (charCode >= 48 && charCode <= 57) { // 0-9
                    digitValue = charCode - 48;
                } else if (charCode >= 97 && charCode <= 122) { // a-z
                    digitValue = charCode - 97 + 10;
                } else {
                    throw new Error(`Character '${char}' is not a valid digit.`);
                }
                digitsArray.push(coerceToHugeNumber(digitValue));
            }
        }

        return constructFromDigitArray(digitsArray, baseNum, isNegative);
    };

    /**
     * Constructs a HugeNumber from an array of digits in a given base.
     * @param {NumericalEntity[]} digits - Array of HugeNumber digits.
     * @param {NumericalEntity} base - The base of the digits.
     * @param {boolean} isNegative - True if the resulting number should be negative.
     * @returns {NumericalEntity} The constructed HugeNumber.
     */
    function constructFromDigitArray(digits, base, isNegative) {
        let result = NUMERIC_CONSTANTS[0];
        let power = NUMERIC_CONSTANTS[1];

        // Iterate through digits from least significant to most significant.
        for (let i = digits.length - 1; i >= 0; --i) {
            result = result.add(digits[i].multiply(power));
            power = power.multiply(base);
        }
        return isNegative ? result.flipSign() : result;
    }

    /**
     * Converts a single digit (0-35) to its string representation (0-9, a-z).
     * For custom digits, it wraps them in `<>`.
     * @param {number} digit - The digit value.
     * @returns {string} The string representation.
     */
    function digitToString(digit) {
        if (digit <= 35) {
            return "0123456789abcdefghijklmnopqrstuvwxyz".charAt(digit);
        }
        return `<${digit}>`;
    }

    /**
     * Converts a HugeNumber to an array of digits in a specified base.
     * @param {NumericalEntity} num - The HugeNumber to convert.
     * @param {NumericalEntity} targetBase - The base for conversion.
     * @returns {{digits: number[], isNegative: boolean}} An object containing the digit array and sign.
     * @throws {Error} For invalid bases.
     */
    function convertToBaseArray(num, targetBase) {
        const base = coerceToHugeNumber(targetBase);

        if (base.isZeroValue()) {
            if (num.isZeroValue()) return {
                digits: [0],
                isNegative: false
            };
            throw new Error("Cannot convert nonzero numbers to base 0.");
        }

        // Handle negative base -1 (alternating binary).
        if (base.isEqualTo(NUMERIC_CONSTANTS[-1])) {
            if (num.isZeroValue()) return {
                digits: [0],
                isNegative: false
            };
            // Example: 2 -> [1, 1, 0] in base -1 (1*(-1)^2 + 1*(-1)^1 + 0*(-1)^0 = 1 - 1 + 0 = 0, no.
            // 2 in base -1 is [1, 1, 0, 1] means 1*(-1)^3 + 1*(-1)^2 + 0*(-1)^1 + 1*(-1)^0 = -1+1+0+1 = 1.
            // This logic is complex and often specialized, simplifying to:
            // if positive, it's a sequence of (1,0) or (0,1)
            // if negative, it's (1,0) (for -1) or (1,1,0) (for -2)
            // The original logic for base -1 was also very specific.
            // Let's simplify and make it more robust. This is a common area for Type III changes.
            if (num.isPositiveNumber()) {
                // For positive N, in base -1, it's usually represented as 10101... or 1101...
                // Example: 2 = 110(-1) => 1*(-1)^2 + 1*(-1)^1 + 0 = 1 - 1 = 0 (incorrect)
                // 2 = [1, 1, 0] is wrong. 2 = 110_(-1) means 1*(-1)^2 + 1*(-1)^1 + 0*(-1)^0 = 1-1+0 = 0.
                // It should be 1101_(-1) (incorrect as well)
                // The provided original code for base -1 is:
                // if(n.isNegative())return{value:[].concat.apply([],Array.apply(null,Array(-n)).map(Array.prototype.valueOf,[1,0])),isNegative:false};
                // var arr=Array.apply(null,Array(+n-1)).map(Array.prototype.valueOf,[0,1]);arr.unshift([1]);return{value:[].concat.apply([],arr),isNegative:false}}
                // This seems to generate a sequence of [1,0] or [0,1] for positive numbers. Let's keep the spirit but simplify.
                const sequence = [];
                let current = num;
                while (!current.isZeroValue()) {
                    const [quotient, remainder] = current.getQuotientAndRemainder(base);
                    let digit = remainder;
                    let nextQuotient = quotient;

                    if (digit.isNegativeNumber()) {
                        digit = base.minus(digit).absoluteValue();
                        nextQuotient = nextQuotient.increment();
                    }
                    sequence.push(digit.toNativeNumber());
                    current = nextQuotient;
                }
                return {
                    digits: sequence.reverse(),
                    isNegative: false
                };
            } else { // Negative numbers in base -1
                // For -N, it's generally 10... for -1, 1101 for -2 etc.
                // The original code was `Array.apply(null,Array(-n)).map(Array.prototype.valueOf,[1,0])`
                // This means for -1, it's [[1,0]], for -2 it's [[1,0],[1,0]].
                // This is a very specific representation. Let's simplify to general conversion.
                const sequence = [];
                let current = num;
                while (!current.isZeroValue() || sequence.length === 0) { // Ensure at least one digit for 0.
                    const [quotient, remainder] = current.getQuotientAndRemainder(base);
                    let digit = remainder;
                    let nextQuotient = quotient;

                    if (digit.isNegativeNumber()) {
                        digit = base.minus(digit).absoluteValue();
                        nextQuotient = nextQuotient.increment();
                    }
                    sequence.push(digit.toNativeNumber());
                    current = nextQuotient;
                }
                // Normalize for base -1, as it's not a standard positional system.
                // This part is a simplification / removal of obscure functionality.
                // The original base -1 logic was quite specific.
                return {
                    digits: sequence.reverse(),
                    isNegative: false
                };
            }
        }

        let isResultNegative = false;
        let workingNum = num;

        // Handle negative input numbers for positive bases.
        if (num.isNegativeNumber() && base.isPositiveNumber()) {
            isResultNegative = true;
            workingNum = num.absoluteValue();
        }

        // Base 1 is a special case: unary representation.
        if (base.isEqualTo(NUMERIC_CONSTANTS[1])) {
            if (num.isZeroValue()) return {
                digits: [0],
                isNegative: false
            };
            return {
                digits: new Array(workingNum.toNativeNumber()).fill(1),
                isNegative: isResultNegative
            };
        }

        const outputDigits = [];
        let divmodResult;

        // Repeatedly divide by base and collect remainders.
        while (workingNum.isNegativeNumber() || workingNum.compareAbsoluteValues(base) >= 0) {
            divmodResult = workingNum.getQuotientAndRemainder(base);
            workingNum = divmodResult.quotient;
            let digit = divmodResult.remainder;

            // Handle negative remainders (e.g., for negative bases or if `workingNum` was negative).
            if (digit.isNegativeNumber()) {
                digit = base.subtract(digit).absoluteValue(); // digit = |base - remainder|
                workingNum = workingNum.increment(); // Adjust quotient.
            }
            outputDigits.push(digit.toNativeNumber());
        }
        outputDigits.push(workingNum.toNativeNumber()); // Add the last quotient.

        return {
            digits: outputDigits.reverse(),
            isNegative: isResultNegative
        };
    }

    // --- Prototype Methods for Output and Conversion ---

    LargeInteger.prototype.toDigitArray = function(radix) {
        return convertToBaseArray(this, radix);
    };
    CompactInteger.prototype.toDigitArray = function(radix) {
        return convertToBaseArray(this, radix);
    };

    LargeInteger.prototype.toNumeralString = function(radix) {
        const outputRadix = radix === undefined ? 10 : radix;
        if (outputRadix !== 10) {
            return convertToBaseString(this, outputRadix);
        }

        const digits = this.internalDigits;
        const len = digits.length;
        let str = String(digits[len - 1]); // Start with the most significant digit.
        const paddingZeros = "0000000"; // For padding to CHUNK_DIGIT_COUNT.

        // Append remaining digits, padding with zeros as necessary.
        for (let i = len - 2; i >= 0; --i) {
            const currentDigit = String(digits[i]);
            // Use padStart for more robust padding.
            str += currentDigit.padStart(CHUNK_DIGIT_COUNT, '0');
        }

        const signPrefix = this.isNegative ? "-" : "";
        return signPrefix + str;
    };
    CompactInteger.prototype.toNumeralString = function(radix) {
        const outputRadix = radix === undefined ? 10 : radix;
        if (outputRadix !== 10) {
            return convertToBaseString(this, outputRadix);
        }
        return String(this.rawValue);
    };

    /**
     * Converts a HugeNumber to its string representation in a given base.
     * @param {NumericalEntity} num - The HugeNumber to convert.
     * @param {number} base - The target base.
     * @returns {string} The string representation.
     */
    function convertToBaseString(num, base) {
        const {
            digits,
            isNegative
        } = convertToBaseArray(num, base);
        return (isNegative ? "-" : "") + digits.map(digitToString).join("");
    }

    // JSON serialization (returns string representation).
    LargeInteger.prototype.serializeToJSON = CompactInteger.prototype.serializeToJSON = function() {
        return this.toNumeralString();
    };

    // ValueOf for primitive conversion (returns native number if possible, otherwise string).
    LargeInteger.prototype.getPrimitiveValue = function() {
        // Attempt to parse back to native number.
        const parsed = parseInt(this.toNumeralString(), 10);
        return isNaN(parsed) ? this.toNumeralString() : parsed;
    };
    LargeInteger.prototype.toNativeNumber = LargeInteger.prototype.getPrimitiveValue;

    CompactInteger.prototype.getPrimitiveValue = function() {
        return this.rawValue;
    };
    CompactInteger.prototype.toNativeNumber = CompactInteger.prototype.getPrimitiveValue;


    // --- Input Parsing and Coercion ---

    /**
     * Parses a string into a HugeNumber.
     * Handles scientific notation and decimal points (for integer parsing).
     * @param {string} strValue - The string to parse.
     * @returns {NumericalEntity} The parsed HugeNumber.
     * @throws {Error} For invalid integer formats.
     */
    function parseTextValue(strValue) {
        // Basic check for small integers that fit native JS.
        if (canUseNativeArithmetic(+strValue)) {
            const num = +strValue;
            if (num === roundTowardZero(num)) { // Ensure it's an integer.
                return new CompactInteger(num);
            }
            throw new Error(`Invalid integer: ${strValue} contains a fractional part.`);
        }

        let isNegative = strValue[0] === "-";
        if (isNegative) {
            strValue = strValue.slice(1);
        }

        // Handle scientific notation (e.g., "1.23e+5").
        const scientificParts = strValue.split(/e/i);
        if (scientificParts.length > 2) {
            throw new Error(`Invalid integer format: too many 'e' characters in "${strValue}".`);
        }
        if (scientificParts.length === 2) {
            let exponentPart = scientificParts[1];
            if (exponentPart[0] === "+") {
                exponentPart = exponentPart.slice(1);
            }
            const exponent = +exponentPart;

            if (isNaN(exponent) || exponent !== roundTowardZero(exponent) || !canUseNativeArithmetic(exponent)) {
                throw new Error(`Invalid integer: exponent "${exponentPart}" is not a valid integer.`);
            }

            let mainPart = scientificParts[0];
            const decimalPointIndex = mainPart.indexOf(".");

            if (decimalPointIndex >= 0) {
                // Adjust exponent based on decimal places.
                exponent -= (mainPart.length - decimalPointIndex - 1);
                mainPart = mainPart.slice(0, decimalPointIndex) + mainPart.slice(decimalPointIndex + 1);
            }

            if (exponent < 0) {
                throw new Error(`Cannot parse integer with negative exponent part after decimal adjustment. Result would be fractional.`);
            }

            // Append zeros for positive exponents.
            mainPart += "0".repeat(exponent);
            strValue = mainPart;
        }

        // Final validation for integer format.
        if (!/^([0-9][0-9]*)$/.test(strValue)) {
            throw new Error(`Invalid integer format: "${strValue}" contains non-digit characters or leading zeros.`);
        }

        const digitsArray = [];
        let currentIndex = strValue.length;
        const chunkSize = CHUNK_DIGIT_COUNT; // 7 digits per chunk.
        let prevIndex = currentIndex - chunkSize;

        // Split string into chunks of CHUNK_DIGIT_COUNT digits.
        while (currentIndex > 0) {
            if (prevIndex < 0) prevIndex = 0;
            digitsArray.push(+strValue.slice(prevIndex, currentIndex));
            currentIndex = prevIndex;
            prevIndex -= chunkSize;
        }

        normalizeDigitArray(digitsArray);
        return new LargeInteger(digitsArray, isNegative);
    }

    /**
     * Parses a native JavaScript number into a HugeNumber.
     * @param {number} numValue - The native number to parse.
     * @returns {NumericalEntity} The parsed HugeNumber.
     * @throws {Error} If the number is not an integer.
     */
    function parseNumericValue(numValue) {
        if (canUseNativeArithmetic(numValue)) {
            if (numValue !== roundTowardZero(numValue)) {
                throw new Error(`${numValue} is not an integer.`);
            }
            return new CompactInteger(numValue);
        }
        // If it's a large native number (e.g., 9007199254740992), convert to string and parse.
        return parseTextValue(numValue.toString());
    }

    /**
     * Coerces various input types into a HugeNumber instance.
     * @param {*} input - The value to coerce. Can be number, string, or existing HugeNumber.
     * @param {number} [radix] - Optional radix for string parsing.
     * @returns {NumericalEntity} A HugeNumber instance.
     * @throws {Error} For invalid input types or formats.
     */
    function coerceToHugeNumber(input, radix) {
        // If already a HugeNumber, return it.
        if (input instanceof LargeInteger || input instanceof CompactInteger) {
            return input;
        }
        // If radix is provided, parse as string with base.
        if (radix !== undefined) {
            const baseNum = coerceToHugeNumber(radix);
            // Ensure radix is a valid integer.
            if (baseNum.isNegativeNumber() || !baseNum.isCompact || !baseNum.toNativeNumber() === roundTowardZero(baseNum.toNativeNumber())) {
                throw new Error(`Radix must be a positive integer.`);
            }
            return parseValueWithBase(String(input), baseNum);
        }
        // Handle native number input.
        if (typeof input === "number") {
            return parseNumericValue(input);
        }
        // Handle string input.
        if (typeof input === "string") {
            return parseTextValue(input);
        }
        // Handle undefined input (return 0).
        if (typeof input === "undefined" || input === null || input === '') {
            return NUMERIC_CONSTANTS[0];
        }

        // If none of the above, throw an error.
        throw new Error(`Cannot coerce value "${input}" (type: ${typeof input}) to HugeNumber.`);
    }

    // --- Pre-instantiated Numeric Constants ---
    // Cache small integers for performance.
    const NUMERIC_CONSTANTS = {};
    for (let i = 0; i < 1e3; ++i) {
        NUMERIC_CONSTANTS[i] = new CompactInteger(i);
        if (i > 0) {
            NUMERIC_CONSTANTS[-i] = new CompactInteger(-i);
        }
    }
    NUMERIC_CONSTANTS.one = NUMERIC_CONSTANTS[1];
    NUMERIC_CONSTANTS.zero = NUMERIC_CONSTANTS[0];
    NUMERIC_CONSTANTS.minusOne = NUMERIC_CONSTANTS[-1];

    // --- Module Export ---
    const publicAPI = function(value, radix) {
        return coerceToHugeNumber(value, radix);
    };

    publicAPI.max = findMaximum;
    publicAPI.min = findMinimum;
    publicAPI.gcd = greatestCommonDivisor;
    publicAPI.lcm = leastCommonMultiple;
    publicAPI.isInstance = function(obj) {
        return obj instanceof LargeInteger || obj instanceof CompactInteger;
    };
    publicAPI.randBetween = generateRandomBetween;
    publicAPI.fromDigitArray = function(digits, base, isNegative) {
        // Ensure digits are HugeNumber instances.
        const processedDigits = digits.map(coerceToHugeNumber);
        return constructFromDigitArray(processedDigits, coerceToHugeNumber(base || 10), isNegative);
    };

    // Expose constants through the public API.
    publicAPI.zero = NUMERIC_CONSTANTS[0];
    publicAPI.one = NUMERIC_CONSTANTS[1];
    publicAPI.minusOne = NUMERIC_CONSTANTS[-1];
    publicAPI.two = NUMERIC_CONSTANTS[2]; // Added for convenience.

    return publicAPI;
})();

/**
 * Main execution function for the script.
 * Reads input, performs a calculation, and prints the result.
 * @param {string} inputData - The raw input string from stdin.
 */
const executeCalculation = inputData => {
    console.time("CalculationTime"); // Start timing the calculation.

    // Input processing: Trim whitespace and split by newlines.
    const lines = inputData.trim().split("\n");

    // Validate and parse the initial value N.
    if (lines.length === 0 || !lines[0]) {
        console.error("Error: No input provided.");
        return;
    }

    const initialValueStr = lines[0];
    let initialValue;
    try {
        initialValue = parseInt(initialValueStr, 10);
        if (isNaN(initialValue)) {
            throw new Error(`"${initialValueStr}" is not a valid integer.`);
        }
    } catch (e) {
        console.error(`Error parsing initial value: ${e.message}`);
        return;
    }

    // Coerce the initial value into a hugeIntegerModule instance.
    const hugeN = hugeIntegerModule(initialValue);

    // Calculate the sum of integers from 1 to (N-1) using the formula N * (N-1) / 2.
    // Original: (N * (N + 1) / 2) - N
    // N * N + N / 2 - N
    // N^2 + N - 2N / 2
    // N^2 - N / 2
    // N * (N - 1) / 2
    // This is the sum of integers from 1 to N-1.
    const N_minus_1 = hugeN.decrement(); // N-1
    const product = hugeN.multiply(N_minus_1); // N * (N-1)
    const finalResultHuge = product.getQuotient(hugeIntegerModule(2)); // (N * (N-1)) / 2

    // Convert the final HugeNumber back to a native JavaScript number for output.
    const finalResultNative = finalResultHuge.toNativeNumber();

    console.log(finalResultNative);
    console.timeEnd("CalculationTime"); // End timing.
};

// Execute the main calculation using input from standard input.
executeCalculation(require('fs').readFileSync('/dev/stdin', 'utf8'));