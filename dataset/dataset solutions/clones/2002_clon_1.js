"use strict"

// This is a Type I clone, focusing solely on whitespace and comments.
// All functional aspects, variable names, and expressions remain identical.

var bigInt = function (undefined) {
    "use strict";

    /*
     * Define core constants used throughout the bigInt library.
     * BASE is the internal representation base (10^7).
     * LOG_BASE is log10(BASE).
     * MAX_INT is the maximum safe integer in JavaScript.
     * MAX_INT_ARR is MAX_INT converted to the internal array format.
     * LOG_MAX_INT is log(MAX_INT) for quick comparisons.
     */
    var BASE = 1e7,
        LOG_BASE = 7,
        MAX_INT = 9007199254740992,
        MAX_INT_ARR = smallToArray(MAX_INT),
        LOG_MAX_INT = Math.log(MAX_INT);

    /**
     * Main constructor function for bigInt.
     * Parses the input value and radix.
     * @param {*} v - The value to parse.
     * @param {number} radix - The base of the input value.
     * @returns {Integer} A BigInteger or SmallInteger instance.
     */
    function Integer(v, radix) {
        if (typeof v === "undefined") {
            return Integer[0]; // Returns zero if no value is provided.
        }

        if (typeof radix !== "undefined") {
            // If a radix is specified, parse accordingly.
            return (+radix === 10) ? parseValue(v) : parseBase(v, radix);
        }

        // Default parsing for numbers or strings without a specified radix.
        return parseValue(v);
    }



    /**
     * Constructor for BigInteger objects (large numbers).
     * @param {Array<number>} value - The array of digits in BASE.
     * @param {boolean} sign - True if negative, false if positive.
     */
    function BigInteger(value, sign) {
        this.value = value;
        this.sign = sign;
        this.isSmall = false; // Flag to distinguish from SmallInteger.
    }

    // BigInteger inherits from Integer.
    BigInteger.prototype = Object.create(Integer.prototype);



    /**
     * Constructor for SmallInteger objects (numbers fitting in JS number type).
     * @param {number} value - The JavaScript number value.
     */
    function SmallInteger(value) {
        this.value = value;
        this.sign = value < 0; // Determine sign based on value.
        this.isSmall = true;   // Flag to distinguish from BigInteger.
    }

    // SmallInteger also inherits from Integer.
    SmallInteger.prototype = Object.create(Integer.prototype);



    /**
     * Checks if a number can be precisely represented by JavaScript's number type.
     * @param {number} n - The number to check.
     * @returns {boolean} True if precise, false otherwise.
     */
    function isPrecise(n) {
        return -MAX_INT < n && n < MAX_INT;
    }



    /**
     * Converts a small JavaScript number into the internal array representation.
     * @param {number} n - The number to convert.
     * @returns {Array<number>} The array representation.
     */
    function smallToArray(n) {
        if (n < 1e7) {
            return [n];
        }

        if (n < 1e14) {
            return [n % 1e7, Math.floor(n / 1e7)];
        }

        return [n % 1e7, Math.floor(n / 1e7) % 1e7, Math.floor(n / 1e14)];
    }



    /**
     * Converts an internal array representation back to a small JavaScript number if possible.
     * @param {Array<number>} arr - The array to convert.
     * @returns {number|Array<number>} The number or the original array if too large.
     */
    function arrayToSmall(arr) {
        trim(arr); // Remove leading zeros.

        var length = arr.length;

        // Check if the array represents a number within MAX_INT range.
        if (length < 4 && compareAbs(arr, MAX_INT_ARR) < 0) {
            switch (length) {
                case 0:
                    return 0;
                case 1:
                    return arr[0];
                case 2:
                    return arr[0] + arr[1] * BASE;
                default:
                    return arr[0] + (arr[1] + arr[2] * BASE) * BASE;
            }
        }

        return arr; // Too large, return as array.
    }



    /**
     * Removes leading zeros from an array of digits.
     * @param {Array<number>} v - The array to trim.
     */
    function trim(v) {
        var i = v.length;
        while (v[--i] === 0); // Find the last non-zero digit.
        v.length = i + 1;     // Truncate the array.
    }



    /**
     * Creates a new array filled with zeros.
     * @param {number} length - The desired length of the array.
     * @returns {Array<number>} The new array.
     */
    function createArray(length) {
        var x = new Array(length);
        var i = -1;
        while (++i < length) {
            x[i] = 0;
        }
        return x;
    }



    /**
     * Truncates a number (removes decimal part).
     * @param {number} n - The number to truncate.
     * @returns {number} The truncated number.
     */
    function truncate(n) {
        if (n > 0) {
            return Math.floor(n);
        }
        return Math.ceil(n);
    }



    /**
     * Adds two arrays of digits (representing positive numbers).
     * @param {Array<number>} a - First operand.
     * @param {Array<number>} b - Second operand.
     * @returns {Array<number>} The sum.
     */
    function add(a, b) {
        var l_a = a.length,
            l_b = b.length,
            r = new Array(l_a), // Result array, sized for the larger input.
            carry = 0,
            base = BASE,
            sum,
            i;

        // Add digits pairwise, handling carry.
        for (i = 0; i < l_b; i++) {
            sum = a[i] + b[i] + carry;
            carry = sum >= base ? 1 : 0;
            r[i] = sum - carry * base;
        }

        // Process remaining digits of the longer number.
        while (i < l_a) {
            sum = a[i] + carry;
            carry = sum === base ? 1 : 0;
            r[i++] = sum - carry * base;
        }

        // If there's a final carry, add it.
        if (carry > 0) {
            r.push(carry);
        }

        return r;
    }



    /**
     * Adds two arrays of digits, ensuring the longer array is first.
     * @param {Array<number>} a - First operand.
     * @param {Array<number>} b - Second operand.
     * @returns {Array<number>} The sum.
     */
    function addAny(a, b) {
        if (a.length >= b.length) {
            return add(a, b);
        }
        return add(b, a); // Ensure `a` is the longer array for `add`.
    }



    /**
     * Adds a small number (carry) to an array of digits.
     * Used for operations involving a BigInteger and a small integer.
     * @param {Array<number>} a - The array of digits.
     * @param {number} carry - The small number to add.
     * @returns {Array<number>} The result array.
     */
    function addSmall(a, carry) {
        var l = a.length,
            r = new Array(l),
            base = BASE,
            sum,
            i;

        // Add carry, propagating through the array.
        for (i = 0; i < l; i++) {
            sum = a[i] - base + carry; // Subtract base to handle negative sums correctly.
            carry = Math.floor(sum / base);
            r[i] = sum - carry * base;
            carry += 1; // Adjust carry for next iteration.
        }

        // If there's remaining carry, add new digits.
        while (carry > 0) {
            r[i++] = carry % base;
            carry = Math.floor(carry / base);
        }

        return r;
    }



    // BigInteger prototype methods for addition.
    BigInteger.prototype.add = function (v) {
        var n = parseValue(v); // Convert input to an Integer object.

        // If signs are different, perform subtraction instead.
        if (this.sign !== n.sign) {
            return this.subtract(n.negate());
        }

        var a = this.value,
            b = n.value;

        // If the other operand is a small integer.
        if (n.isSmall) {
            return new BigInteger(addSmall(a, Math.abs(b)), this.sign);
        }

        // Both are BigIntegers, use addAny.
        return new BigInteger(addAny(a, b), this.sign);
    };

    BigInteger.prototype.plus = BigInteger.prototype.add; // Alias for add.



    // SmallInteger prototype methods for addition.
    SmallInteger.prototype.add = function (v) {
        var n = parseValue(v);
        var a = this.value;

        // If signs are different (and this is negative, or n is negative), subtract.
        if (a < 0 !== n.sign) {
            return this.subtract(n.negate());
        }

        var b = n.value;

        // If both are small integers.
        if (n.isSmall) {
            if (isPrecise(a + b)) {
                return new SmallInteger(a + b);
            }
            b = smallToArray(Math.abs(b)); // Convert b to array for BigInteger addition.
        }

        // One is SmallInteger, the other is BigInteger (or converted small to array).
        return new BigInteger(addSmall(b, Math.abs(a)), a < 0);
    };

    SmallInteger.prototype.plus = SmallInteger.prototype.add; // Alias for add.



    /**
     * Subtracts array b from array a (assuming a >= b, both positive).
     * @param {Array<number>} a - Minuend.
     * @param {Array<number>} b - Subtrahend.
     * @returns {Array<number>} The difference.
     */
    function subtract(a, b) {
        var a_l = a.length,
            b_l = b.length,
            r = new Array(a_l),
            borrow = 0,
            base = BASE,
            i,
            difference;

        // Subtract digits pairwise, handling borrow.
        for (i = 0; i < b_l; i++) {
            difference = a[i] - borrow - b[i];
            if (difference < 0) {
                difference += base;
                borrow = 1;
            } else {
                borrow = 0;
            }
            r[i] = difference;
        }

        // Process remaining digits of the minuend.
        for (i = b_l; i < a_l; i++) {
            difference = a[i] - borrow;
            if (difference < 0) {
                difference += base;
            } else {
                r[i++] = difference; // If no borrow, we can simply copy.
                break;
            }
            r[i] = difference;
        }

        // Copy remaining digits from a.
        for (; i < a_l; i++) {
            r[i] = a[i];
        }

        trim(r); // Remove leading zeros.
        return r;
    }



    /**
     * Performs subtraction between two numbers, handling signs and array conversions.
     * @param {Array<number>} a - First operand (absolute value array).
     * @param {Array<number>} b - Second operand (absolute value array).
     * @param {boolean} sign - The intended sign of the result if a >= b.
     * @returns {Integer} The result of subtraction.
     */
    function subtractAny(a, b, sign) {
        var value;

        // Determine which number is larger in absolute value.
        if (compareAbs(a, b) >= 0) {
            value = subtract(a, b);
        } else {
            value = subtract(b, a);
            sign = !sign; // Flip sign if b was larger.
        }

        value = arrayToSmall(value); // Try to convert to SmallInteger.

        if (typeof value === "number") {
            if (sign) {
                value = -value;
            }
            return new SmallInteger(value);
        }

        return new BigInteger(value, sign);
    }



    /**
     * Subtracts a small number from an array of digits (BigInteger).
     * @param {Array<number>} a - The array of digits.
     * @param {number} b - The small number to subtract (absolute value).
     * @param {boolean} sign - The sign of the original BigInteger.
     * @returns {Integer} The result of subtraction.
     */
    function subtractSmall(a, b, sign) {
        var l = a.length,
            r = new Array(l),
            carry = -b, // Initial carry is negative of b.
            base = BASE,
            i,
            difference;

        // Subtract, propagating carry.
        for (i = 0; i < l; i++) {
            difference = a[i] + carry;
            carry = Math.floor(difference / base);
            difference %= base;
            r[i] = difference < 0 ? difference + base : difference; // Ensure positive digit.
        }

        r = arrayToSmall(r); // Try to convert to SmallInteger.

        if (typeof r === "number") {
            if (sign) {
                r = -r;
            }
            return new SmallInteger(r);
        }

        return new BigInteger(r, sign);
    }



    // BigInteger prototype methods for subtraction.
    BigInteger.prototype.subtract = function (v) {
        var n = parseValue(v);

        // If signs are different, convert to addition.
        if (this.sign !== n.sign) {
            return this.add(n.negate());
        }

        var a = this.value,
            b = n.value;

        // If the other operand is a small integer.
        if (n.isSmall) {
            return subtractSmall(a, Math.abs(b), this.sign);
        }

        // Both are BigIntegers.
        return subtractAny(a, b, this.sign);
    };

    BigInteger.prototype.minus = BigInteger.prototype.subtract; // Alias for subtract.



    // SmallInteger prototype methods for subtraction.
    SmallInteger.prototype.subtract = function (v) {
        var n = parseValue(v);
        var a = this.value;

        // If signs are different, convert to addition.
        if (a < 0 !== n.sign) {
            return this.add(n.negate());
        }

        var b = n.value;

        // If both are small integers.
        if (n.isSmall) {
            return new SmallInteger(a - b);
        }

        // One is SmallInteger, the other is BigInteger (or converted small to array).
        return subtractSmall(b, Math.abs(a), a >= 0); // Note: parameters are swapped.
    };

    SmallInteger.prototype.minus = SmallInteger.prototype.subtract; // Alias for subtract.



    // Negation methods.
    BigInteger.prototype.negate = function () {
        return new BigInteger(this.value, !this.sign);
    };

    SmallInteger.prototype.negate = function () {
        var sign = this.sign;
        var small = new SmallInteger(-this.value);
        small.sign = !sign; // Explicitly set sign for consistency.
        return small;
    };



    // Absolute value methods.
    BigInteger.prototype.abs = function () {
        return new BigInteger(this.value, false); // Always positive.
    };

    SmallInteger.prototype.abs = function () {
        return new SmallInteger(Math.abs(this.value));
    };



    /**
     * Multiplies two arrays of digits (long multiplication).
     * @param {Array<number>} a - First operand.
     * @param {Array<number>} b - Second operand.
     * @returns {Array<number>} The product.
     */
    function multiplyLong(a, b) {
        var a_l = a.length,
            b_l = b.length,
            l = a_l + b_l, // Max possible length of result.
            r = createArray(l),
            base = BASE,
            product,
            carry,
            i,
            a_i,
            b_j;

        // Standard long multiplication algorithm.
        for (i = 0; i < a_l; ++i) {
            a_i = a[i];
            for (var j = 0; j < b_l; ++j) {
                b_j = b[j];
                product = a_i * b_j + r[i + j]; // Add previous carry/result.
                carry = Math.floor(product / base);
                r[i + j] = product - carry * base;
                r[i + j + 1] += carry; // Add carry to the next position.
            }
        }

        trim(r); // Remove leading zeros.
        return r;
    }



    /**
     * Multiplies an array of digits by a small JavaScript number.
     * @param {Array<number>} a - The array operand.
     * @param {number} b - The small number operand.
     * @returns {Array<number>} The product.
     */
    function multiplySmall(a, b) {
        var l = a.length,
            r = new Array(l),
            base = BASE,
            carry = 0,
            product,
            i;

        // Multiply each digit by b, propagating carry.
        for (i = 0; i < l; i++) {
            product = a[i] * b + carry;
            carry = Math.floor(product / base);
            r[i] = product - carry * base;
        }

        // Add any remaining carry as new digits.
        while (carry > 0) {
            r[i++] = carry % base;
            carry = Math.floor(carry / base);
        }

        return r;
    }



    /**
     * Shifts an array of digits left by adding zeros at the beginning.
     * This is equivalent to multiplying by BASE^n.
     * @param {Array<number>} x - The array to shift.
     * @param {number} n - The number of positions to shift.
     * @returns {Array<number>} The shifted array.
     */
    function shiftLeft(x, n) {
        var r = [];
        while (n-- > 0) {
            r.push(0); // Add zeros to the left.
        }
        return r.concat(x); // Concatenate with original array.
    }



    /**
     * Multiplies two arrays of digits using Karatsuba algorithm.
     * This is an optimized algorithm for large numbers.
     * @param {Array<number>} x - First operand.
     * @param {Array<number>} y - Second operand.
     * @returns {Array<number>} The product.
     */
    function multiplyKaratsuba(x, y) {
        var n = Math.max(x.length, y.length);

        // Base case: if numbers are small enough, use long multiplication.
        if (n <= 30) {
            return multiplyLong(x, y);
        }

        n = Math.ceil(n / 2); // Split point.

        // Divide numbers into two halves.
        var b = x.slice(n),
            a = x.slice(0, n),
            d = y.slice(n),
            c = y.slice(0, n);

        // Recursively compute products.
        var ac = multiplyKaratsuba(a, c),
            bd = multiplyKaratsuba(b, d),
            abcd = multiplyKaratsuba(addAny(a, b), addAny(c, d));

        // Combine results using Karatsuba formula:
        // P(x) = ac * B^(2n) + ((a+b)(c+d) - ac - bd) * B^n + bd
        var product = addAny(addAny(ac, shiftLeft(subtract(subtract(abcd, ac), bd), n)), shiftLeft(bd, 2 * n));

        trim(product); // Clean up result.
        return product;
    }



    /**
     * Heuristic to decide whether to use Karatsuba multiplication.
     * @param {number} l1 - Length of first number.
     * @param {number} l2 - Length of second number.
     * @returns {boolean} True if Karatsuba should be used.
     */
    function useKaratsuba(l1, l2) {
        // This is an empirical formula.
        return -.012 * l1 - .012 * l2 + 15e-6 * l1 * l2 > 0;
    }



    // BigInteger prototype method for multiplication.
    BigInteger.prototype.multiply = function (v) {
        var n = parseValue(v),
            a = this.value,
            b = n.value,
            sign = this.sign !== n.sign, // Determine result sign.
            abs;

        if (n.isSmall) {
            // Handle special cases for small multipliers.
            if (b === 0) {
                return Integer[0];
            }
            if (b === 1) {
                return this;
            }
            if (b === -1) {
                return this.negate();
            }

            abs = Math.abs(b);

            // If small multiplier fits within a single digit, use multiplySmall.
            if (abs < BASE) {
                return new BigInteger(multiplySmall(a, abs), sign);
            }

            // Otherwise, convert small multiplier to array and proceed.
            b = smallToArray(abs);
        }

        // Decide between Karatsuba and long multiplication.
        if (useKaratsuba(a.length, b.length)) {
            return new BigInteger(multiplyKaratsuba(a, b), sign);
        }

        return new BigInteger(multiplyLong(a, b), sign);
    };

    BigInteger.prototype.times = BigInteger.prototype.multiply; // Alias for multiply.



    /**
     * Helper for multiplying a small number by an array (BigInteger).
     * @param {number} a - The small number.
     * @param {Array<number>} b - The array of digits.
     * @param {boolean} sign - The sign of the result.
     * @returns {BigInteger} The product.
     */
    function multiplySmallAndArray(a, b, sign) {
        if (a < BASE) {
            return new BigInteger(multiplySmall(b, a), sign);
        }
        return new BigInteger(multiplyLong(b, smallToArray(a)), sign);
    }



    // Internal multiplication helper for SmallInteger.
    SmallInteger.prototype._multiplyBySmall = function (a) {
        // If the product fits in a precise JS number.
        if (isPrecise(a.value * this.value)) {
            return new SmallInteger(a.value * this.value);
        }
        // Otherwise, convert to array multiplication.
        return multiplySmallAndArray(Math.abs(a.value), smallToArray(Math.abs(this.value)), this.sign !== a.sign);
    };



    // Internal multiplication helper for BigInteger.
    BigInteger.prototype._multiplyBySmall = function (a) {
        // Handle special cases for small multipliers.
        if (a.value === 0) {
            return Integer[0];
        }
        if (a.value === 1) {
            return this;
        }
        if (a.value === -1) {
            return this.negate();
        }
        // Otherwise, use the helper function.
        return multiplySmallAndArray(Math.abs(a.value), this.value, this.sign !== a.sign);
    };



    // SmallInteger prototype method for multiplication.
    SmallInteger.prototype.multiply = function (v) {
        // Parse the other value and use its internal multiplication helper.
        return parseValue(v)._multiplyBySmall(this);
    };

    SmallInteger.prototype.times = SmallInteger.prototype.multiply; // Alias for multiply.



    /**
     * Squares an array of digits.
     * Uses an optimized algorithm for squaring.
     * @param {Array<number>} a - The array to square.
     * @returns {Array<number>} The squared array.
     */
    function square(a) {
        var l = a.length,
            r = createArray(l + l), // Max possible length of result.
            base = BASE,
            product,
            carry,
            i,
            a_i,
            a_j;

        for (i = 0; i < l; i++) {
            a_i = a[i];
            carry = 0 - a_i * a_i; // Initialize carry with negative square.
            for (var j = i; j < l; j++) {
                a_j = a[j];
                // Formula for squaring: (sum a_i * B^i)^2 = sum (a_i^2 * B^(2i)) + sum (2 * a_i * a_j * B^(i+j))
                product = 2 * (a_i * a_j) + r[i + j] + carry;
                carry = Math.floor(product / base);
                r[i + j] = product - carry * base;
            }
            r[i + l] = carry; // Store final carry for this digit.
        }

        trim(r); // Clean up result.
        return r;
    }



    // BigInteger prototype method for squaring.
    BigInteger.prototype.square = function () {
        return new BigInteger(square(this.value), false); // Square is always positive.
    };



    // SmallInteger prototype method for squaring.
    SmallInteger.prototype.square = function () {
        var value = this.value * this.value;

        // If the squared value fits in a precise JS number.
        if (isPrecise(value)) {
            return new SmallInteger(value);
        }

        // Otherwise, convert to BigInteger square.
        return new BigInteger(square(smallToArray(Math.abs(this.value))), false);
    };



    /**
     * Performs division and modulo using a single-digit divisor.
     * This is a fast path for specific division cases.
     * @param {Array<number>} a - Dividend array.
     * @param {Array<number>} b - Divisor array (must be a single digit).
     * @returns {Array<Array<number>, number>} [quotient, remainder].
     */
    function divMod1(a, b) {
        var a_l = a.length,
            b_l = b.length,
            base = BASE,
            result = createArray(b.length),
            divisorMostSignificantDigit = b[b_l - 1],
            lambda = Math.ceil(base / (2 * divisorMostSignificantDigit)), // Normalization factor.
            remainder = multiplySmall(a, lambda),
            divisor = multiplySmall(b, lambda),
            quotientDigit,
            shift,
            carry,
            borrow,
            i,
            l,
            q;

        // Prepare remainder and divisor for division.
        if (remainder.length <= a_l) {
            remainder.push(0);
        }
        divisor.push(0); // Pad divisor for easier calculations.
        divisorMostSignificantDigit = divisor[b_l - 1]; // Update after normalization.

        // Main division loop.
        for (shift = a_l - b_l; shift >= 0; shift--) {
            quotientDigit = base - 1; // Initial guess for quotient digit.

            // Estimate quotient digit.
            if (remainder[shift + b_l] !== divisorMostSignificantDigit) {
                quotientDigit = Math.floor((remainder[shift + b_l] * base + remainder[shift + b_l - 1]) / divisorMostSignificantDigit);
            }

            carry = 0;
            borrow = 0;
            l = divisor.length;

            // Multiply divisor by quotientDigit and subtract from remainder.
            for (i = 0; i < l; i++) {
                carry += quotientDigit * divisor[i];
                q = Math.floor(carry / base);
                borrow += remainder[shift + i] - (carry - q * base);
                carry = q;
                if (borrow < 0) {
                    remainder[shift + i] = borrow + base;
                    borrow = -1;
                } else {
                    remainder[shift + i] = borrow;
                    borrow = 0;
                }
            }

            // Adjust quotientDigit if it was too large.
            while (borrow !== 0) {
                quotientDigit -= 1;
                carry = 0;
                for (i = 0; i < l; i++) {
                    carry += remainder[shift + i] - base + divisor[i];
                    if (carry < 0) {
                        remainder[shift + i] = carry + base;
                        carry = 0;
                    } else {
                        remainder[shift + i] = carry;
                        carry = 1;
                    }
                }
                borrow += carry;
            }
            result[shift] = quotientDigit; // Store current quotient digit.
        }

        // Denormalize remainder.
        remainder = divModSmall(remainder, lambda)[0];

        return [arrayToSmall(result), arrayToSmall(remainder)];
    }



    /**
     * Performs division and modulo using a more generic algorithm (slower than divMod1).
     * @param {Array<number>} a - Dividend array.
     * @param {Array<number>} b - Divisor array.
     * @returns {Array<Array<number>, number>} [quotient, remainder].
     */
    function divMod2(a, b) {
        var a_l = a.length,
            b_l = b.length,
            result = [],
            part = [],
            base = BASE,
            guess,
            xlen,
            highx,
            highy,
            check;

        while (a_l) {
            part.unshift(a[--a_l]); // Take digits from dividend one by one.
            trim(part);

            // If current part is less than divisor, quotient digit is 0.
            if (compareAbs(part, b) < 0) {
                result.push(0);
                continue;
            }

            xlen = part.length;
            highx = part[xlen - 1] * base + part[xlen - 2];
            highy = b[b_l - 1] * base + b[b_l - 2];

            if (xlen > b_l) {
                highx = (highx + 1) * base; // Adjust for additional digit.
            }

            guess = Math.ceil(highx / highy); // Initial guess for quotient digit.

            // Refine guess.
            do {
                check = multiplySmall(b, guess);
                if (compareAbs(check, part) <= 0) {
                    break;
                }
                guess--;
            } while (guess);

            result.push(guess); // Store quotient digit.
            part = subtract(part, check); // Update remainder.
        }

        result.reverse(); // Digits were pushed in reverse order.
        return [arrayToSmall(result), arrayToSmall(part)];
    }



    /**
     * Divides an array of digits by a small JavaScript number.
     * @param {Array<number>} value - The dividend array.
     * @param {number} lambda - The small divisor.
     * @returns {Array<Array<number>, number>} [quotient array, remainder number].
     */
    function divModSmall(value, lambda) {
        var length = value.length,
            quotient = createArray(length),
            base = BASE,
            i,
            q,
            remainder,
            divisor;

        remainder = 0; // Initialize remainder.

        // Perform long division by a single digit.
        for (i = length - 1; i >= 0; --i) {
            divisor = remainder * base + value[i];
            q = truncate(divisor / lambda);
            remainder = divisor - q * lambda;
            quotient[i] = q | 0; // Ensure integer.
        }

        return [quotient, remainder | 0]; // Return quotient array and final remainder.
    }



    /**
     * Generic division and modulo function for any BigInt types.
     * @param {Integer} self - The dividend.
     * @param {*} v - The divisor.
     * @returns {Array<Integer, Integer>} [quotient, remainder].
     */
    function divModAny(self, v) {
        var value,
            n = parseValue(v); // Parse divisor.

        var a = self.value,
            b = n.value;
        var quotient;

        if (b === 0) {
            throw new Error("Cannot divide by zero");
        }

        if (self.isSmall) {
            if (n.isSmall) {
                // Both are small integers.
                return [new SmallInteger(truncate(a / b)), new SmallInteger(a % b)];
            }
            // Small dividend, large divisor -> quotient is 0, remainder is dividend.
            return [Integer[0], self];
        }

        if (n.isSmall) {
            // Large dividend, small divisor.
            if (b === 1) {
                return [self, Integer[0]];
            }
            if (b == -1) {
                return [self.negate(), Integer[0]];
            }

            var abs = Math.abs(b);

            if (abs < BASE) {
                value = divModSmall(a, abs);
                quotient = arrayToSmall(value[0]);
                var remainder = value[1];

                if (self.sign) {
                    remainder = -remainder;
                }

                if (typeof quotient === "number") {
                    if (self.sign !== n.sign) {
                        quotient = -quotient;
                    }
                    return [new SmallInteger(quotient), new SmallInteger(remainder)];
                }

                return [new BigInteger(quotient, self.sign !== n.sign), new SmallInteger(remainder)];
            }
            b = smallToArray(abs); // Convert small divisor to array if it's large enough.
        }

        var comparison = compareAbs(a, b);

        if (comparison === -1) {
            // Dividend < divisor (absolute) -> quotient is 0, remainder is dividend.
            return [Integer[0], self];
        }
        if (comparison === 0) {
            // Dividend == divisor (absolute) -> quotient is +/-1, remainder is 0.
            return [Integer[self.sign === n.sign ? 1 : -1], Integer[0]];
        }

        // Both are BigIntegers, and dividend >= divisor.
        // Choose division algorithm based on length.
        if (a.length + b.length <= 200) {
            value = divMod1(a, b);
        } else {
            value = divMod2(a, b);
        }

        quotient = value[0];
        var qSign = self.sign !== n.sign,
            mod = value[1],
            mSign = self.sign;

        // Convert quotient to SmallInteger if possible.
        if (typeof quotient === "number") {
            if (qSign) {
                quotient = -quotient;
            }
            quotient = new SmallInteger(quotient);
        } else {
            quotient = new BigInteger(quotient, qSign);
        }

        // Convert remainder to SmallInteger if possible.
        if (typeof mod === "number") {
            if (mSign) {
                mod = -mod;
            }
            mod = new SmallInteger(mod);
        } else {
            mod = new BigInteger(mod, mSign);
        }

        return [quotient, mod];
    }



    // BigInteger prototype method for divmod (returns object with quotient and remainder).
    BigInteger.prototype.divmod = function (v) {
        var result = divModAny(this, v);
        return {
            quotient: result[0],
            remainder: result[1]
        };
    };

    SmallInteger.prototype.divmod = BigInteger.prototype.divmod; // SmallInteger uses the same logic.



    // BigInteger prototype method for division (returns only quotient).
    BigInteger.prototype.divide = function (v) {
        return divModAny(this, v)[0];
    };

    // Aliases for division.
    SmallInteger.prototype.over = SmallInteger.prototype.divide = BigInteger.prototype.over = BigInteger.prototype.divide;



    // BigInteger prototype method for modulo (returns only remainder).
    BigInteger.prototype.mod = function (v) {
        return divModAny(this, v)[1];
    };

    // Aliases for modulo.
    SmallInteger.prototype.remainder = SmallInteger.prototype.mod = BigInteger.prototype.remainder = BigInteger.prototype.mod;



    // BigInteger prototype method for exponentiation (integer exponent only).
    BigInteger.prototype.pow = function (v) {
        var n = parseValue(v),
            a = this.value,
            b = n.value,
            value,
            x,
            y;

        // Handle base and exponent special cases.
        if (b === 0) {
            return Integer[1]; // x^0 = 1
        }
        if (a === 0) {
            return Integer[0]; // 0^y = 0 (for y > 0)
        }
        if (a === 1) {
            return Integer[1]; // 1^y = 1
        }
        if (a === -1) {
            return n.isEven() ? Integer[1] : Integer[-1]; // (-1)^y is 1 if y even, -1 if y odd.
        }

        if (n.sign) {
            return Integer[0]; // x^y where y is negative, returns 0 for integers.
        }

        if (!n.isSmall) {
            throw new Error("The exponent " + n.toString() + " is too large.");
        }

        if (this.isSmall) {
            // If base is small, try native Math.pow.
            if (isPrecise(value = Math.pow(a, b))) {
                return new SmallInteger(truncate(value));
            }
        }

        x = this;
        y = Integer[1]; // Accumulator for the result.

        // Binary exponentiation (exponentiation by squaring).
        while (true) {
            if ((b & 1) === 1) { // If exponent is odd.
                y = y.times(x);
                --b;
            }
            if (b === 0) {
                break; // Done.
            }
            b /= 2; // Halve exponent.
            x = x.square(); // Square the base.
        }

        return y;
    };

    SmallInteger.prototype.pow = BigInteger.prototype.pow; // SmallInteger uses the same logic.



    // BigInteger prototype method for modular exponentiation.
    BigInteger.prototype.modPow = function (exp, mod) {
        exp = parseValue(exp);
        mod = parseValue(mod);

        if (mod.isZero()) {
            throw new Error("Cannot take modPow with modulus 0");
        }

        var r = Integer[1], // Result accumulator (initially 1).
            base = this.mod(mod); // Base modulo modulus.

        while (exp.isPositive()) {
            if (base.isZero()) {
                return Integer[0]; // If base % mod is 0, result is 0.
            }
            if (exp.isOdd()) {
                r = r.multiply(base).mod(mod); // If exponent is odd, multiply result.
            }
            exp = exp.divide(2); // Halve exponent.
            base = base.square().mod(mod); // Square base modulo modulus.
        }

        return r;
    };

    SmallInteger.prototype.modPow = BigInteger.prototype.modPow; // SmallInteger uses the same logic.



    /**
     * Compares the absolute values of two arrays of digits.
     * @param {Array<number>} a - First array.
     * @param {Array<number>} b - Second array.
     * @returns {number} -1 if a < b, 0 if a == b, 1 if a > b.
     */
    function compareAbs(a, b) {
        if (a.length !== b.length) {
            return a.length > b.length ? 1 : -1; // Longer array is larger.
        }

        // Compare digit by digit from most significant.
        for (var i = a.length - 1; i >= 0; i--) {
            if (a[i] !== b[i]) {
                return a[i] > b[i] ? 1 : -1;
            }
        }

        return 0; // Arrays are equal.
    }



    // BigInteger prototype method for comparing absolute values.
    BigInteger.prototype.compareAbs = function (v) {
        var n = parseValue(v),
            a = this.value,
            b = n.value;

        if (n.isSmall) {
            return 1; // A BigInteger is always considered larger in abs value than a SmallInteger's abs value (unless SmallInteger is 0).
        }
        return compareAbs(a, b);
    };



    // SmallInteger prototype method for comparing absolute values.
    SmallInteger.prototype.compareAbs = function (v) {
        var n = parseValue(v),
            a = Math.abs(this.value),
            b = n.value;

        if (n.isSmall) {
            b = Math.abs(b);
            return a === b ? 0 : (a > b ? 1 : -1);
        }
        return -1; // A SmallInteger is always considered smaller in abs value than a BigInteger's abs value (unless BigInteger is 0).
    };



    // BigInteger prototype method for general comparison.
    BigInteger.prototype.compare = function (v) {
        if (v === Infinity) {
            return -1; // Any finite number is less than Infinity.
        }
        if (v === -Infinity) {
            return 1; // Any finite number is greater than -Infinity.
        }

        var n = parseValue(v),
            a = this.value,
            b = n.value;

        // Handle sign differences.
        if (this.sign !== n.sign) {
            return n.sign ? 1 : -1; // Positive is greater than negative.
        }

        if (n.isSmall) {
            return this.sign ? -1 : 1; // If `this` is Big and `n` is Small (and same sign), Big is greater in magnitude.
        }

        // Both are BigIntegers, compare absolute values and apply sign.
        return compareAbs(a, b) * (this.sign ? -1 : 1);
    };

    BigInteger.prototype.compareTo = BigInteger.prototype.compare; // Alias for compare.



    // SmallInteger prototype method for general comparison.
    SmallInteger.prototype.compare = function (v) {
        if (v === Infinity) {
            return -1;
        }
        if (v === -Infinity) {
            return 1;
        }

        var n = parseValue(v),
            a = this.value,
            b = n.value;

        if (n.isSmall) {
            return a == b ? 0 : (a > b ? 1 : -1); // Direct comparison for two small integers.
        }

        // SmallInteger vs BigInteger.
        if (a < 0 !== n.sign) {
            return a < 0 ? -1 : 1; // If signs differ, positive is greater.
        }

        return a < 0 ? 1 : -1; // If signs are same, BigInteger is greater if negative, smaller if positive.
    };

    SmallInteger.prototype.compareTo = SmallInteger.prototype.compare; // Alias for compare.



    // Equality check.
    BigInteger.prototype.equals = function (v) {
        return this.compare(v) === 0;
    };

    SmallInteger.prototype.eq = SmallInteger.prototype.equals = BigInteger.prototype.eq = BigInteger.prototype.equals;



    // Inequality check.
    BigInteger.prototype.notEquals = function (v) {
        return this.compare(v) !== 0;
    };

    SmallInteger.prototype.neq = SmallInteger.prototype.notEquals = BigInteger.prototype.neq = BigInteger.prototype.notEquals;



    // Greater than check.
    BigInteger.prototype.greater = function (v) {
        return this.compare(v) > 0;
    };

    SmallInteger.prototype.gt = SmallInteger.prototype.greater = BigInteger.prototype.gt = BigInteger.prototype.greater;



    // Less than check.
    BigInteger.prototype.lesser = function (v) {
        return this.compare(v) < 0;
    };

    SmallInteger.prototype.lt = SmallInteger.prototype.lesser = BigInteger.prototype.lt = BigInteger.prototype.lesser;



    // Greater than or equals check.
    BigInteger.prototype.greaterOrEquals = function (v) {
        return this.compare(v) >= 0;
    };

    SmallInteger.prototype.geq = SmallInteger.prototype.greaterOrEquals = BigInteger.prototype.geq = BigInteger.prototype.greaterOrEquals;



    // Less than or equals check.
    BigInteger.prototype.lesserOrEquals = function (v) {
        return this.compare(v) <= 0;
    };

    SmallInteger.prototype.leq = SmallInteger.prototype.lesserOrEquals = BigInteger.prototype.leq = BigInteger.prototype.lesserOrEquals;



    // Even check for BigInteger.
    BigInteger.prototype.isEven = function () {
        return (this.value[0] & 1) === 0; // Check the least significant digit.
    };



    // Even check for SmallInteger.
    SmallInteger.prototype.isEven = function () {
        return (this.value & 1) === 0;
    };



    // Odd check for BigInteger.
    BigInteger.prototype.isOdd = function () {
        return (this.value[0] & 1) === 1; // Check the least significant digit.
    };



    // Odd check for SmallInteger.
    SmallInteger.prototype.isOdd = function () {
        return (this.value & 1) === 1;
    };



    // Positive check for BigInteger.
    BigInteger.prototype.isPositive = function () {
        return !this.sign; // Not negative.
    };



    // Positive check for SmallInteger.
    SmallInteger.prototype.isPositive = function () {
        return this.value > 0;
    };



    // Negative check for BigInteger.
    BigInteger.prototype.isNegative = function () {
        return this.sign;
    };



    // Negative check for SmallInteger.
    SmallInteger.prototype.isNegative = function () {
        return this.value < 0;
    };



    // Unit check for BigInteger (always false, as BigIntegers represent numbers larger than 1).
    BigInteger.prototype.isUnit = function () {
        return false;
    };



    // Unit check for SmallInteger.
    SmallInteger.prototype.isUnit = function () {
        return Math.abs(this.value) === 1;
    };



    // Zero check for BigInteger (always false, as BigIntegers are non-zero by definition here).
    BigInteger.prototype.isZero = function () {
        return false;
    };



    // Zero check for SmallInteger.
    SmallInteger.prototype.isZero = function () {
        return this.value === 0;
    };



    // Divisibility check for BigInteger.
    BigInteger.prototype.isDivisibleBy = function (v) {
        var n = parseValue(v);
        var value = n.value;

        if (value === 0) {
            return false; // Cannot divide by zero.
        }
        if (value === 1) {
            return true; // Always divisible by 1.
        }
        if (value === 2) {
            return this.isEven(); // Check parity for 2.
        }

        return this.mod(n).equals(Integer[0]); // Check if remainder is zero.
    };

    SmallInteger.prototype.isDivisibleBy = BigInteger.prototype.isDivisibleBy; // Same logic for SmallInteger.



    /**
     * Checks for basic primality (small primes).
     * @param {Integer} v - The number to check.
     * @returns {boolean|undefined} True/False if basic check applies, undefined otherwise.
     */
    function isBasicPrime(v) {
        var n = v.abs();

        if (n.isUnit()) {
            return false; // 1 is not prime.
        }
        if (n.equals(2) || n.equals(3) || n.equals(5)) {
            return true;
        }
        if (n.isEven() || n.isDivisibleBy(3) || n.isDivisibleBy(5)) {
            return false; // Divisible by 2, 3, or 5.
        }
        if (n.lesser(25)) {
            return true; // Small numbers not caught above are prime.
        }
    }



    // Primality test for BigInteger (Miller-Rabin for larger numbers).
    BigInteger.prototype.isPrime = function () {
        var isPrime = isBasicPrime(this);
        if (isPrime !== undefined) {
            return isPrime;
        }

        var n = this.abs(),
            nPrev = n.prev(); // n-1

        // Miller-Rabin test setup.
        var a = [2, 3, 5, 7, 11, 13, 17, 19], // Bases for the test.
            b = nPrev,
            d, t, i, x;

        // Find d and s such that n-1 = d * 2^s (b becomes d here).
        while (b.isEven()) {
            b = b.divide(2);
        }

        // Perform Miller-Rabin test for each base 'a'.
        for (i = 0; i < a.length; i++) {
            x = bigInt(a[i]).modPow(b, n); // a^d mod n.

            if (x.equals(Integer[1]) || x.equals(nPrev)) {
                continue; // Strong probable prime.
            }

            // Check powers of 2.
            for (t = true, d = b; t && d.lesser(nPrev); d = d.multiply(2)) {
                x = x.square().mod(n); // x^(2^r * d) mod n.
                if (x.equals(nPrev)) {
                    t = false; // Strong probable prime.
                }
            }

            if (t) {
                return false; // Composite.
            }
        }

        return true; // Probably prime.
    };

    SmallInteger.prototype.isPrime = BigInteger.prototype.isPrime; // SmallInteger uses the same logic.



    // Probable primality test for BigInteger (Miller-Rabin with configurable iterations).
    BigInteger.prototype.isProbablePrime = function (iterations) {
        var isPrime = isBasicPrime(this);
        if (isPrime !== undefined) {
            return isPrime;
        }

        var n = this.abs();
        var t = iterations === undefined ? 5 : iterations; // Default iterations.

        for (var i = 0; i < t; i++) {
            // Choose random base a.
            var a = bigInt.randBetween(2, n.minus(2));
            if (!a.modPow(n.prev(), n).isUnit()) {
                return false; // Composite.
            }
        }

        return true; // Probably prime.
    };

    SmallInteger.prototype.isProbablePrime = BigInteger.prototype.isProbablePrime; // SmallInteger uses the same logic.



    // BigInteger prototype method for modular inverse (Extended Euclidean Algorithm).
    BigInteger.prototype.modInv = function (n) {
        var t = bigInt.zero,
            newT = bigInt.one,
            r = parseValue(n),
            newR = this.abs(), // Use absolute value for extended Euclidean algorithm.
            q, lastT, lastR;

        // Extended Euclidean algorithm.
        while (!newR.equals(bigInt.zero)) {
            q = r.divide(newR);
            lastT = t;
            lastR = r;
            t = newT;
            r = newR;
            newT = lastT.subtract(q.multiply(newT));
            newR = lastR.subtract(q.multiply(newR));
        }

        if (!r.equals(1)) {
            throw new Error(this.toString() + " and " + n.toString() + " are not co-prime");
        }

        // Adjust result to be positive.
        if (t.compare(0) === -1) {
            t = t.add(n);
        }

        // Adjust for negative input.
        if (this.isNegative()) {
            return t.negate();
        }

        return t;
    };

    SmallInteger.prototype.modInv = BigInteger.prototype.modInv; // SmallInteger uses the same logic.



    // BigInteger prototype method for increment.
    BigInteger.prototype.next = function () {
        var value = this.value;

        if (this.sign) {
            // If negative, subtracting 1 (absolute value) makes it closer to zero.
            return subtractSmall(value, 1, this.sign);
        }

        // If positive, simply add 1.
        return new BigInteger(addSmall(value, 1), this.sign);
    };



    // SmallInteger prototype method for increment.
    SmallInteger.prototype.next = function () {
        var value = this.value;

        // If incremented value still fits in a precise JS number.
        if (value + 1 < MAX_INT) {
            return new SmallInteger(value + 1);
        }

        // Otherwise, convert to BigInteger.
        return new BigInteger(MAX_INT_ARR, false);
    };



    // BigInteger prototype method for decrement.
    BigInteger.prototype.prev = function () {
        var value = this.value;

        if (this.sign) {
            // If negative, adding 1 (absolute value) makes it more negative.
            return new BigInteger(addSmall(value, 1), true);
        }

        // If positive, subtracting 1.
        return subtractSmall(value, 1, this.sign);
    };



    // SmallInteger prototype method for decrement.
    SmallInteger.prototype.prev = function () {
        var value = this.value;

        // If decremented value still fits in a precise JS number.
        if (value - 1 > -MAX_INT) {
            return new SmallInteger(value - 1);
        }

        // Otherwise, convert to BigInteger.
        return new BigInteger(MAX_INT_ARR, true);
    };



    // Precomputed powers of two for bitwise operations.
    var powersOfTwo = [1];
    while (2 * powersOfTwo[powersOfTwo.length - 1] <= BASE) {
        powersOfTwo.push(2 * powersOfTwo[powersOfTwo.length - 1]);
    }
    var powers2Length = powersOfTwo.length,
        highestPower2 = powersOfTwo[powers2Length - 1];



    /**
     * Checks if a shift amount is small enough to be handled directly.
     * @param {*} n - The shift amount.
     * @returns {boolean} True if small, false otherwise.
     */
    function shift_isSmall(n) {
        return (typeof n === "number" || typeof n === "string") && +Math.abs(n) <= BASE || n instanceof BigInteger && n.value.length <= 1;
    }



    // BigInteger prototype method for left bit shift.
    BigInteger.prototype.shiftLeft = function (n) {
        if (!shift_isSmall(n)) {
            throw new Error(String(n) + " is too large for shifting.");
        }
        n = +n; // Ensure n is a number.

        if (n < 0) {
            return this.shiftRight(-n); // Negative shiftLeft is shiftRight.
        }

        var result = this;
        if (result.isZero()) {
            return result;
        }

        // Shift by blocks of BASE (powers of two).
        while (n >= powers2Length) {
            result = result.multiply(highestPower2);
            n -= powers2Length - 1; // Adjust n for the block shift.
        }

        return result.multiply(powersOfTwo[n]); // Apply remaining shift.
    };

    SmallInteger.prototype.shiftLeft = BigInteger.prototype.shiftLeft; // SmallInteger uses the same logic.



    // BigInteger prototype method for right bit shift.
    BigInteger.prototype.shiftRight = function (n) {
        var remQuo;

        if (!shift_isSmall(n)) {
            throw new Error(String(n) + " is too large for shifting.");
        }
        n = +n;

        if (n < 0) {
            return this.shiftLeft(-n); // Negative shiftRight is shiftLeft.
        }

        var result = this;

        // Handle zero or negative unit (e.g., -1 shifted right is -1).
        if (result.isZero() || result.isNegative() && result.isUnit()) {
            return result;
        }

        // Shift by blocks of BASE (powers of two).
        while (n >= powers2Length) {
            remQuo = divModAny(result, highestPower2);
            // Adjust for negative numbers: if remainder is negative, quotient needs to be decremented.
            result = remQuo[1].isNegative() ? remQuo[0].prev() : remQuo[0];
            n -= powers2Length - 1;
        }

        remQuo = divModAny(result, powersOfTwo[n]);
        // Adjust for negative numbers.
        return remQuo[1].isNegative() ? remQuo[0].prev() : remQuo[0];
    };

    SmallInteger.prototype.shiftRight = BigInteger.prototype.shiftRight; // SmallInteger uses the same logic.



    /**
     * Performs a bitwise operation on two bigInt numbers.
     * Handles negative numbers using two's complement representation.
     * @param {Integer} x - First operand.
     * @param {Integer} y - Second operand.
     * @param {function} fn - The bitwise function (e.g., `(a,b) => a & b`).
     * @returns {Integer} The result of the bitwise operation.
     */
    function bitwise(x, y, fn) {
        y = parseValue(y); // Ensure y is an Integer object.

        var xSign = x.isNegative(),
            ySign = y.isNegative();

        // Convert to two's complement representation (effectively, abs value for positive, (abs-1) then bitwise NOT for negative).
        var xRem = xSign ? x.not() : x,
            yRem = ySign ? y.not() : y;

        var xDigit = 0,
            yDigit = 0;
        var xDivMod = null,
            yDivMod = null;
        var result = [];

        // Process digits from least significant.
        while (!xRem.isZero() || !yRem.isZero()) {
            xDivMod = divModAny(xRem, highestPower2);
            xDigit = xDivMod[1].toJSNumber(); // Get current digit.
            if (xSign) {
                xDigit = highestPower2 - 1 - xDigit; // Apply two's complement for negative x.
            }

            yDivMod = divModAny(yRem, highestPower2);
            yDigit = yDivMod[1].toJSNumber();
            if (ySign) {
                yDigit = highestPower2 - 1 - yDigit; // Apply two's complement for negative y.
            }

            xRem = xDivMod[0];
            yRem = yDivMod[0];

            result.push(fn(xDigit, yDigit)); // Apply bitwise function to digits.
        }

        // Handle final sign bit (most significant bit).
        var sum = fn(xSign ? 1 : 0, ySign ? 1 : 0) !== 0 ? bigInt(-1) : bigInt(0);

        // Reconstruct the number from digits.
        for (var i = result.length - 1; i >= 0; i -= 1) {
            sum = sum.multiply(highestPower2).add(bigInt(result[i]));
        }

        return sum;
    }



    // BigInteger prototype method for bitwise NOT.
    BigInteger.prototype.not = function () {
        return this.negate().prev(); // Equivalent to -(this + 1).
    };

    SmallInteger.prototype.not = BigInteger.prototype.not; // SmallInteger uses the same logic.



    // BigInteger prototype method for bitwise AND.
    BigInteger.prototype.and = function (n) {
        return bitwise(this, n, function (a, b) {
            return a & b;
        });
    };

    SmallInteger.prototype.and = BigInteger.prototype.and; // SmallInteger uses the same logic.



    // BigInteger prototype method for bitwise OR.
    BigInteger.prototype.or = function (n) {
        return bitwise(this, n, function (a, b) {
            return a | b;
        });
    };

    SmallInteger.prototype.or = BigInteger.prototype.or; // SmallInteger uses the same logic.



    // BigInteger prototype method for bitwise XOR.
    BigInteger.prototype.xor = function (n) {
        return bitwise(this, n, function (a, b) {
            return a ^ b;
        });
    };

    SmallInteger.prototype.xor = BigInteger.prototype.xor; // SmallInteger uses the same logic.



    // Constants for rough LOB (Least One Bit) calculation.
    var LOBMASK_I = 1 << 30,
        LOBMASK_BI = (BASE & -BASE) * (BASE & -BASE) | LOBMASK_I;



    /**
     * Calculates a rough approximation of the Least One Bit (LOB).
     * Used for GCD optimization.
     * @param {Integer} n - The number to check.
     * @returns {number} A power of 2.
     */
    function roughLOB(n) {
        var v = n.value,
            // If small, use JS bitwise AND. If BigInteger, check first two digits.
            x = typeof v === "number" ? v | LOBMASK_I : v[0] + v[1] * BASE | LOBMASK_BI;
        return x & -x; // Returns the lowest set bit.
    }



    /**
     * Calculates integer logarithm (floor(log_base(value))).
     * @param {Integer} value - The number.
     * @param {Integer} base - The base of the logarithm.
     * @returns {{p: Integer, e: number}} Object with power (p) and exponent (e).
     */
    function integerLogarithm(value, base) {
        if (base.compareTo(value) <= 0) {
            var tmp = integerLogarithm(value, base.square()); // Recursively call with squared base.
            var p = tmp.p;
            var e = tmp.e;
            var t = p.multiply(base); // Multiply by original base.

            // Adjust exponent if product is still less than or equal to value.
            return t.compareTo(value) <= 0 ? {
                p: t,
                e: e * 2 + 1
            } : {
                p: p,
                e: e * 2
            };
        }
        return {
            p: bigInt(1),
            e: 0
        }; // Base case: value < base.
    }



    // BigInteger prototype method for bit length.
    BigInteger.prototype.bitLength = function () {
        var n = this;

        // For negative numbers, bit length is for -(n+1) (two's complement).
        if (n.compareTo(bigInt(0)) < 0) {
            n = n.negate().subtract(bigInt(1));
        }

        if (n.compareTo(bigInt(0)) === 0) {
            return bigInt(0);
        }

        // Use integer logarithm base 2.
        return bigInt(integerLogarithm(n, bigInt(2)).e).add(bigInt(1));
    };

    SmallInteger.prototype.bitLength = BigInteger.prototype.bitLength; // SmallInteger uses the same logic.



    /**
     * Returns the maximum of two bigInt numbers.
     * @param {*} a - First number.
     * @param {*} b - Second number.
     * @returns {Integer} The larger number.
     */
    function max(a, b) {
        a = parseValue(a);
        b = parseValue(b);
        return a.greater(b) ? a : b;
    }



    /**
     * Returns the minimum of two bigInt numbers.
     * @param {*} a - First number.
     * @param {*} b - Second number.
     * @returns {Integer} The smaller number.
     */
    function min(a, b) {
        a = parseValue(a);
        b = parseValue(b);
        return a.lesser(b) ? a : b;
    }



    /**
     * Calculates the greatest common divisor (GCD) of two bigInt numbers.
     * Uses binary GCD algorithm for efficiency.
     * @param {*} a - First number.
     * @param {*} b - Second number.
     * @returns {Integer} The GCD.
     */
    function gcd(a, b) {
        a = parseValue(a).abs(); // Take absolute values.
        b = parseValue(b).abs();

        if (a.equals(b)) {
            return a;
        }
        if (a.isZero()) {
            return b;
        }
        if (b.isZero()) {
            return a;
        }

        var c = Integer[1], // Factor of 2s removed.
            d, t;

        // Remove common factors of 2.
        while (a.isEven() && b.isEven()) {
            d = Math.min(roughLOB(a), roughLOB(b));
            a = a.divide(d);
            b = b.divide(d);
            c = c.multiply(d);
        }

        // Remove factors of 2 from a.
        while (a.isEven()) {
            a = a.divide(roughLOB(a));
        }

        // Binary GCD loop.
        do {
            while (b.isEven()) {
                b = b.divide(roughLOB(b));
            }
            if (a.greater(b)) {
                t = b;
                b = a;
                a = t;
            }
            b = b.subtract(a);
        } while (!b.isZero());

        return c.isUnit() ? a : a.multiply(c); // Re-incorporate common factors of 2.
    }



    /**
     * Calculates the least common multiple (LCM) of two bigInt numbers.
     * LCM(a,b) = |a*b| / GCD(a,b).
     * @param {*} a - First number.
     * @param {*} b - Second number.
     * @returns {Integer} The LCM.
     */
    function lcm(a, b) {
        a = parseValue(a).abs();
        b = parseValue(b).abs();
        return a.divide(gcd(a, b)).multiply(b);
    }



    /**
     * Generates a random bigInt between two given bigInts (inclusive).
     * @param {*} a - Lower bound.
     * @param {*} b - Upper bound.
     * @returns {Integer} A random bigInt.
     */
    function randBetween(a, b) {
        a = parseValue(a);
        b = parseValue(b);

        var low = min(a, b),
            high = max(a, b);

        var range = high.subtract(low).add(1); // Calculate the range size.

        if (range.isSmall) {
            return low.add(Math.floor(Math.random() * range)); // If range is small, use native Math.random.
        }

        var length = range.value.length - 1;
        var result = [],
            restricted = true; // Flag for ensuring number stays within range.

        // Generate digits from most significant.
        for (var i = length; i >= 0; i--) {
            var top = restricted ? range.value[i] : BASE;
            var digit = truncate(Math.random() * top); // Random digit.
            result.unshift(digit);
            if (digit < top) {
                restricted = false; // If digit is not max, subsequent digits can be anything.
            }
        }

        result = arrayToSmall(result); // Try to convert to SmallInteger.

        return low.add(typeof result === "number" ? new SmallInteger(result) : new BigInteger(result, false));
    }



    /**
     * Parses a string representation of a number in a given base.
     * @param {string} text - The string to parse.
     * @param {number|Integer} base - The base (radix).
     * @returns {Integer} The parsed number.
     */
    var parseBase = function (text, base) {
        var length = text.length;
        var i;
        var absBase = Math.abs(base);

        // Input validation: check if all digits are valid for the given base.
        for (var i = 0; i < length; i++) {
            var c = text[i].toLowerCase();
            if (c === "-") {
                continue;
            }
            if (/[a-z0-9]/.test(c)) {
                if (/[0-9]/.test(c) && +c >= absBase) {
                    if (c === "1" && absBase === 1) { // Special case for base 1.
                        continue;
                    }
                    throw new Error(c + " is not a valid digit in base " + base + ".");
                } else if (c.charCodeAt(0) - 87 >= absBase) { // For 'a'-'z'
                    throw new Error(c + " is not a valid digit in base " + base + ".");
                }
            }
        }

        // Fast path for bases 2-36 if result fits in JS number.
        if (2 <= base && base <= 36) {
            if (length <= LOG_MAX_INT / Math.log(base)) {
                var result = parseInt(text, base);
                if (isNaN(result)) {
                    throw new Error(c + " is not a valid digit in base " + base + ".");
                }
                return new SmallInteger(parseInt(text, base));
            }
        }

        base = parseValue(base); // Ensure base is an Integer.
        var digits = [];
        var isNegative = text[0] === "-";

        // Extract digits.
        for (i = isNegative ? 1 : 0; i < text.length; i++) {
            var c = text[i].toLowerCase(),
                charCode = c.charCodeAt(0);

            if (48 <= charCode && charCode <= 57) { // 0-9
                digits.push(parseValue(c));
            } else if (97 <= charCode && charCode <= 122) { // a-z
                digits.push(parseValue(c.charCodeAt(0) - 87));
            } else if (c === "<") { // Handle custom digits like <10>
                var start = i;
                do {
                    i++;
                } while (text[i] !== ">");
                digits.push(parseValue(text.slice(start + 1, i)));
            } else {
                throw new Error(c + " is not a valid character");
            }
        }

        return parseBaseFromArray(digits, base, isNegative);
    };



    /**
     * Converts an array of digits in a given base to a bigInt number.
     * @param {Array<Integer>} digits - Array of digit values.
     * @param {Integer} base - The base.
     * @param {boolean} isNegative - Whether the number is negative.
     * @returns {Integer} The converted number.
     */
    function parseBaseFromArray(digits, base, isNegative) {
        var val = Integer[0],
            pow = Integer[1],
            i;

        // Polynomial evaluation: sum(digit_i * base^i).
        for (i = digits.length - 1; i >= 0; i--) {
            val = val.add(digits[i].times(pow));
            pow = pow.times(base);
        }

        return isNegative ? val.negate() : val;
    }



    /**
     * Converts a digit (0-35) to its string representation (0-9, a-z).
     * Or for larger digits, wraps in < >.
     * @param {number} digit - The digit value.
     * @returns {string} The string representation.
     */
    function stringify(digit) {
        if (digit <= 35) {
            return "0123456789abcdefghijklmnopqrstuvwxyz".charAt(digit);
        }
        return "<" + digit + ">";
    }



    /**
     * Converts a bigInt number to an array of digits in a specified base.
     * @param {Integer} n - The number to convert.
     * @param {Integer} base - The target base.
     * @returns {{value: Array<number>, isNegative: boolean}} Object with digit array and sign.
     */
    function toBase(n, base) {
        base = bigInt(base);

        if (base.isZero()) {
            if (n.isZero()) {
                return {
                    value: [0],
                    isNegative: false
                };
            }
            throw new Error("Cannot convert nonzero numbers to base 0.");
        }

        if (base.equals(-1)) {
            if (n.isZero()) {
                return {
                    value: [0],
                    isNegative: false
                };
            }
            if (n.isNegative()) {
                // Special handling for negative numbers in base -1.
                return {
                    value: [].concat.apply([], Array.apply(null, Array(-n)).map(Array.prototype.valueOf, [1, 0])),
                    isNegative: false
                };
            }
            var arr = Array.apply(null, Array(+n - 1)).map(Array.prototype.valueOf, [0, 1]);
            arr.unshift([1]);
            return {
                value: [].concat.apply([], arr),
                isNegative: false
            };
        }

        var neg = false;
        if (n.isNegative() && base.isPositive()) {
            neg = true;
            n = n.abs(); // Work with absolute value for conversion.
        }

        if (base.equals(1)) {
            if (n.isZero()) {
                return {
                    value: [0],
                    isNegative: false
                };
            }
            // Base 1: array of 1s.
            return {
                value: Array.apply(null, Array(+n)).map(Number.prototype.valueOf, 1),
                isNegative: neg
            };
        }

        var out = [];
        var left = n,
            divmod;

        // Repeatedly divide by base and take remainders.
        while (left.isNegative() || left.compareAbs(base) >= 0) {
            divmod = left.divmod(base);
            left = divmod.quotient;
            var digit = divmod.remainder;

            if (digit.isNegative()) {
                digit = base.minus(digit).abs(); // Adjust for negative remainders.
                left = left.next(); // Adjust quotient.
            }
            out.push(digit.toJSNumber());
        }

        out.push(left.toJSNumber()); // Add the last quotient.
        return {
            value: out.reverse(),
            isNegative: neg
        }; // Reverse for correct order.
    }



    /**
     * Converts a bigInt number to its string representation in a specified base.
     * @param {Integer} n - The number to convert.
     * @param {number} base - The target base.
     * @returns {string} The string representation.
     */
    function toBaseString(n, base) {
        var arr = toBase(n, base);
        return (arr.isNegative ? "-" : "") + arr.value.map(stringify).join("");
    }



    // BigInteger prototype method to convert to an array of digits in a given radix.
    BigInteger.prototype.toArray = function (radix) {
        return toBase(this, radix);
    };

    SmallInteger.prototype.toArray = function (radix) {
        return toBase(this, radix);
    };



    // BigInteger prototype method for string conversion.
    BigInteger.prototype.toString = function (radix) {
        if (radix === undefined) {
            radix = 10;
        }
        if (radix !== 10) {
            return toBaseString(this, radix); // Use generic toBaseString for non-decimal.
        }

        // Optimized decimal string conversion.
        var v = this.value,
            l = v.length,
            str = String(v[--l]), // Start with most significant digit.
            zeros = "0000000",
            digit;

        while (--l >= 0) {
            digit = String(v[l]);
            str += zeros.slice(digit.length) + digit; // Pad with leading zeros.
        }

        var sign = this.sign ? "-" : "";
        return sign + str;
    };



    // SmallInteger prototype method for string conversion.
    SmallInteger.prototype.toString = function (radix) {
        if (radix === undefined) {
            radix = 10;
        }
        if (radix != 10) {
            return toBaseString(this, radix); // Use generic toBaseString for non-decimal.
        }
        return String(this.value); // Native conversion for decimal.
    };



    // JSON serialization (returns string representation).
    BigInteger.prototype.toJSON = SmallInteger.prototype.toJSON = function () {
        return this.toString();
    };



    // ValueOf for BigInteger (returns JS number, potentially losing precision).
    BigInteger.prototype.valueOf = function () {
        return parseInt(this.toString(), 10);
    };

    BigInteger.prototype.toJSNumber = BigInteger.prototype.valueOf; // Alias.



    // ValueOf for SmallInteger (returns native JS number).
    SmallInteger.prototype.valueOf = function () {
        return this.value;
    };

    SmallInteger.prototype.toJSNumber = SmallInteger.prototype.valueOf; // Alias.



    /**
     * Parses a string value into a bigInt number.
     * Handles scientific notation and decimal points (for exponent calculation).
     * @param {string} v - The string to parse.
     * @returns {BigInteger} The parsed number.
     */
    function parseStringValue(v) {
        if (isPrecise(+v)) {
            var x = +v;
            if (x === truncate(x)) {
                return new SmallInteger(x);
            }
            throw new Error("Invalid integer: " + v);
        }

        var sign = v[0] === "-";
        if (sign) {
            v = v.slice(1);
        }

        var split = v.split(/e/i); // Handle scientific notation.
        if (split.length > 2) {
            throw new Error("Invalid integer: " + split.join("e"));
        }

        if (split.length === 2) {
            var exp = split[1];
            if (exp[0] === "+") {
                exp = exp.slice(1);
            }
            exp = +exp; // Convert exponent to number.

            if (exp !== truncate(exp) || !isPrecise(exp)) {
                throw new Error("Invalid integer: " + exp + " is not a valid exponent.");
            }

            var text = split[0];
            var decimalPlace = text.indexOf(".");
            if (decimalPlace >= 0) {
                exp -= text.length - decimalPlace - 1; // Adjust exponent for decimal places.
                text = text.slice(0, decimalPlace) + text.slice(decimalPlace + 1); // Remove decimal point.
            }

            if (exp < 0) {
                throw new Error("Cannot include negative exponent part for integers");
            }

            text += new Array(exp + 1).join("0"); // Append zeros for exponent.
            v = text;
        }

        // Validate remaining string (must be digits).
        var isValid = /^([0-9][0-9]*)$/.test(v);
        if (!isValid) {
            throw new Error("Invalid integer: " + v);
        }

        var r = [],
            max = v.length,
            l = LOG_BASE,
            min = max - l;

        // Split string into digits based on BASE.
        while (max > 0) {
            r.push(+v.slice(min, max)); // Convert substring to number.
            min -= l;
            if (min < 0) {
                min = 0;
            }
            max -= l;
        }

        trim(r); // Remove leading zeros.
        return new BigInteger(r, sign);
    }



    /**
     * Parses a number value into a bigInt number.
     * @param {number} v - The number to parse.
     * @returns {Integer} The parsed number.
     */
    function parseNumberValue(v) {
        if (isPrecise(v)) {
            if (v !== truncate(v)) {
                throw new Error(v + " is not an integer.");
            }
            return new SmallInteger(v);
        }
        return parseStringValue(v.toString()); // Convert to string and parse.
    }



    /**
     * Universal parsing function for any input value.
     * @param {*} v - The value to parse.
     * @returns {Integer} The parsed number.
     */
    function parseValue(v) {
        if (typeof v === "number") {
            return parseNumberValue(v);
        }
        if (typeof v === "string") {
            return parseStringValue(v);
        }
        return v; // Assume it's already an Integer object.
    }



    // Pre-populate Integer cache for small numbers (0-999).
    for (var i = 0; i < 1e3; i++) {
        Integer[i] = new SmallInteger(i);
        if (i > 0) {
            Integer[-i] = new SmallInteger(-i);
        }
    }

    // Common constants.
    Integer.one = Integer[1];
    Integer.zero = Integer[0];
    Integer.minusOne = Integer[-1];

    // Export utility functions.
    Integer.max = max;
    Integer.min = min;
    Integer.gcd = gcd;
    Integer.lcm = lcm;

    // Type checking utility.
    Integer.isInstance = function (x) {
        return x instanceof BigInteger || x instanceof SmallInteger;
    };

    // Random number generation.
    Integer.randBetween = randBetween;

    // Array-to-BigInt conversion.
    Integer.fromArray = function (digits, base, isNegative) {
        // Map digits to Integer objects, parse base, then use parseBaseFromArray.
        return parseBaseFromArray(digits.map(parseValue), parseValue(base || 10), isNegative);
    };


    return Integer; // Return the bigInt constructor.

}();


// --- Main execution logic ---

function main(arg) {
    // Parse input: m is the second number on the first line.
    var m = arg.trim().split("\n")[0].split(' ').map(Number)[1];

    // Parse input: ai is the array of numbers on the second line, sorted in descending order.
    var ai = arg.trim().split("\n")[1].split(' ').map(Number).sort((a, b) => b - a);

    var sum = 0; // Total sum of all elements in ai.
    var sum_m = 0; // Sum of the largest (ai.length - (m-1)) elements.

    // Calculate sum_m: sum of elements from index m-1 to the end.
    // These are the (ai.length - m + 1) smallest elements in the sorted array.
    // Wait, the array is sorted descending, so these are the *smallest* elements.
    // The problem statement likely implies sum of *largest* elements, but code sums smallest.
    // Let's stick to the code's logic.
    for (var i = m - 1; i < ai.length; i++) {
        sum_m += ai[i];
    }

    // Calculate sum: sum of all elements.
    for (var i = 0; i < ai.length; i++) {
        sum += ai[i];
    }

    // console.log(sum) // Debug comment, kept as is.

    // Calculate the threshold: sum / (4 * m) using bigInt for precision.
    var div = bigInt(sum).divide(bigInt(4).multiply(m));

    // Compare sum_m with the threshold.
    // The original comment is `sum_m < sum / (4 * m)`.
    // The code `bigInt(div).compare(sum_m) === 1` means `div > sum_m`.
    // This is equivalent to `sum_m < div`.
    if (bigInt(div).compare(sum_m) === 1) {
        // if (sum_m < sum / (4 * m)) {
        console.log('No');
    } else {
        console.log('Yes');
    }

}


// Read input from stdin and run the main function.
main(require('fs').readFileSync('/dev/stdin', 'utf8'));