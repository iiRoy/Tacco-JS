"use strict";

// This module provides a BigInt implementation for JavaScript, allowing
// arbitrary-precision integer arithmetic. It handles numbers larger than
// JavaScript's native Number type can safely represent.

let bigInt = function (undefined) {

    // --- Internal Constants and Core Data Structures ---

    // BASE is the radix for internal number representation (10^7).
    // LOG_BASE is the logarithm of BASE (7).
    // MAX_INT is the largest safe integer in JavaScript (2^53 - 1).
    // MAX_INT_ARR is the array representation of MAX_INT.
    // LOG_MAX_INT is used for optimizing base conversions.
    var BASE        = 1e7,
        LOG_BASE    = 7,
        MAX_INT     = 9007199254740992,
        MAX_INT_ARR = smallToArray(MAX_INT),
        LOG_MAX_INT = Math.log(MAX_INT);

    /**
     * @constructor Integer
     * Factory function for creating BigInt or SmallInt instances.
     * Delegates to `parseValue` or `parseBase` based on arguments.
     * @param {number|string|BigInteger|SmallInteger} v - The value to parse.
     * @param {number} [radix] - The base of the input string `v`.
     */
    function Integer(v, radix) {
        // If no value is provided, default to zero.
        if (typeof v === "undefined")
            { return Integer[0]; }

        // If a radix is specified, parse the value from that base.
        if (typeof radix !== "undefined")
            { return +radix === 10 ? parseValue(v) : parseBase(v, radix); }

        // Otherwise, parse the value directly.
        return parseValue(v);
    }


    /**
     * @constructor BigInteger
     * Represents large integers that exceed JavaScript's safe integer limit.
     * @param {number[]} value - Array of digits in base BASE.
     * @param {boolean} sign - True if negative, false if positive.
     */
    function BigInteger(value, sign) {
        this.value   = value;
        this.sign    = sign;
        this.isSmall = false; // Flag to distinguish from SmallInteger.
    }

    // BigInteger prototypes inherit from Integer prototypes.
    BigInteger.prototype = Object.create(Integer.prototype);


    /**
     * @constructor SmallInteger
     * Represents integers that fit within JavaScript's safe integer limit.
     * @param {number} value - The raw JavaScript number.
     */
    function SmallInteger(value) {
        this.value   = value;
        this.sign    = value < 0; // True if negative.
        this.isSmall = true;      // Flag to distinguish from BigInteger.
    }

    // SmallInteger prototypes inherit from Integer prototypes.
    SmallInteger.prototype = Object.create(Integer.prototype);


    // --- Utility Functions ---

    /**
     * Checks if a number `n` can be precisely represented as a JavaScript number.
     * @param {number} n - The number to check.
     * @returns {boolean} True if precise, false otherwise.
     */
    function isPrecise(n) {
        return -MAX_INT < n && n < MAX_INT;
    }


    /**
     * Converts a small JavaScript number into its array representation (base BASE).
     * Used for converting SmallIntegers to a format compatible with BigIntegers.
     * @param {number} n - The small number.
     * @returns {number[]} Array of digits.
     */
    function smallToArray(n) {
        // For numbers less than BASE (1e7), it's a single digit.
        if (n < 1e7)
            { return [n]; }

        // For numbers up to BASE^2 (1e14), it's two digits.
        if (n < 1e14)
            { return [n % 1e7, Math.floor(n / 1e7)]; }

        // For numbers up to MAX_INT, it's three digits.
        return [n % 1e7, Math.floor(n / 1e7) % 1e7, Math.floor(n / 1e14)];
    }


    /**
     * Converts an array representation back to a small JavaScript number if possible.
     * @param {number[]} arr - Array of digits.
     * @returns {number|number[]} The converted number or the original array if too large.
     */
    function arrayToSmall(arr) {
        trim(arr); // Remove leading zeros before conversion.

        var length = arr.length;

        // If the array has few digits and its absolute value is within MAX_INT.
        if (length < 4 && compareAbs(arr, MAX_INT_ARR) < 0) {
            switch (length) {
                case 0:
                    return 0;
                case 1:
                    return arr[0];
                case 2:
                    return arr[0] + arr[1] * BASE;
                default: // case 3
                    return arr[0] + (arr[1] + arr[2] * BASE) * BASE;
            }
        }
        return arr; // Still too large, return the array.
    }


    /**
     * Removes leading zero digits from an array-represented number.
     * Modifies the array in place.
     * @param {number[]} v - The array of digits.
     */
    function trim(v) {
        var i = v.length;
        while (v[--i] === 0); // Find the index of the most significant non-zero digit.
        v.length = i + 1;     // Truncate the array.
    }


    /**
     * Creates a new array of a specified length, initialized with zeros.
     * @param {number} length - The desired length of the array.
     * @returns {number[]} The new array.
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
     * Truncates a number to its integer part.
     * Behaves like Math.floor() for positive numbers and Math.ceil() for negative.
     * @param {number} n - The number to truncate.
     * @returns {number} The truncated integer.
     */
    function truncate(n) {
        if (n > 0)
            { return Math.floor(n); }
        return Math.ceil(n);
    }


    // --- Arithmetic Operations: Addition ---

    /**
     * Adds two array-represented numbers (assumed positive).
     * @param {number[]} a - First number's digit array.
     * @param {number[]} b - Second number's digit array.
     * @returns {number[]} The sum as a digit array.
     */
    function add(a, b) {
        var l_a   = a.length,
            l_b   = b.length,
            r     = new Array(l_a), // Result array, sized for the longer number.
            carry = 0,
            base  = BASE,
            sum,
            i;

        // Iterate through digits, adding corresponding elements and carry.
        for (i = 0; i < l_b; i++) {
            sum   = a[i] + b[i] + carry;
            carry = sum >= base ? 1 : 0;
            r[i]  = sum - carry * base;
        }

        // Propagate carry through remaining digits of the longer number.
        while (i < l_a) {
            sum   = a[i] + carry;
            carry = sum === base ? 1 : 0;
            r[i++] = sum - carry * base;
        }

        // If there's a final carry, append it.
        if (carry > 0)
            { r.push(carry); }

        return r;
    }


    /**
     * Adds two array-represented numbers, ensuring the first argument is the longer one.
     * @param {number[]} a - First number's digit array.
     * @param {number[]} b - Second number's digit array.
     * @returns {number[]} The sum as a digit array.
     */
    function addAny(a, b) {
        if (a.length >= b.length)
            { return add(a, b); }
        return add(b, a); // Swap if 'b' is longer.
    }


    /**
     * Adds a small integer `carry` to an array-represented number `a`.
     * Used for operations like `BigInt + SmallInt` or `BigInt + 1`.
     * @param {number[]} a - The digit array.
     * @param {number} carry - The small integer to add.
     * @returns {number[]} The sum as a digit array.
     */
    function addSmall(a, carry) {
        var l    = a.length,
            r    = new Array(l),
            base = BASE,
            sum,
            i;

        for (i = 0; i < l; i++) {
            sum   = a[i] - base + carry; // Optimized for carry propagation.
            carry = Math.floor(sum / base);
            r[i]  = sum - carry * base;
            carry += 1;
        }

        // Propagate any remaining carry.
        while (carry > 0) {
            r[i++] = carry % base;
            carry  = Math.floor(carry / base);
        }
        return r;
    }


    // BigInteger.prototype.add method.
    BigInteger.prototype.add = function (v) {
        var n = parseValue(v);

        // If signs are different, convert to subtraction.
        if (this.sign !== n.sign) {
            return this.subtract(n.negate());
        }

        var a = this.value,
            b = n.value;

        // If the other number is a SmallInteger, use addSmall.
        if (n.isSmall) {
            return new BigInteger(addSmall(a, Math.abs(b)), this.sign);
        }

        // Otherwise, both are BigIntegers, use addAny.
        return new BigInteger(addAny(a, b), this.sign);
    };

    // Alias for add.
    BigInteger.prototype.plus = BigInteger.prototype.add;


    // SmallInteger.prototype.add method.
    SmallInteger.prototype.add = function (v) {
        var n = parseValue(v);
        var a = this.value;

        // If signs are different, convert to subtraction.
        if (a < 0 !== n.sign) {
            return this.subtract(n.negate());
        }

        var b = n.value;

        // If both are SmallIntegers, perform direct addition if precise.
        if (n.isSmall) {
            if (isPrecise(a + b))
                { return new SmallInteger(a + b); }
            // If sum overflows, convert 'b' to array and proceed.
            b = smallToArray(Math.abs(b));
        }

        // Use addSmall, handling the sign correctly.
        return new BigInteger(addSmall(b, Math.abs(a)), a < 0);
    };

    // Alias for add.
    SmallInteger.prototype.plus = SmallInteger.prototype.add;


    // --- Arithmetic Operations: Subtraction ---

    /**
     * Subtracts array-represented number `b` from `a` (assumed `a >= b` and both positive).
     * @param {number[]} a - Minuend's digit array.
     * @param {number[]} b - Subtrahend's digit array.
     * @returns {number[]} The difference as a digit array.
     */
    function subtract(a, b) {
        var a_l        = a.length,
            b_l        = b.length,
            r          = new Array(a_l), // Result array, sized for 'a'.
            borrow     = 0,
            base       = BASE,
            i,
            difference;

        // Subtract digits element by element.
        for (i = 0; i < b_l; i++) {
            difference = a[i] - borrow - b[i];
            if (difference < 0) {
                difference += base;
                borrow      = 1;
            } else
                { borrow = 0; }
            r[i] = difference;
        }

        // Propagate borrow through remaining digits of 'a'.
        for (i = b_l; i < a_l; i++) {
            difference = a[i] - borrow;
            if (difference < 0)
                { difference += base; }
            else {
                r[i++] = difference;
                break; // No more borrow, so remaining digits can be copied.
            }
            r[i] = difference;
        }

        // Copy any remaining digits from 'a'.
        for (; i < a_l; i++) {
            r[i] = a[i];
        }

        trim(r); // Remove leading zeros.
        return r;
    }


    /**
     * Subtracts any two array-represented numbers, handling signs and order.
     * @param {number[]} a - First number's digit array.
     * @param {number[]} b - Second number's digit array.
     * @param {boolean} sign - The sign of the result (true for negative).
     * @returns {BigInteger|SmallInteger} The difference.
     */
    function subtractAny(a, b, sign) {
        var value;

        // Determine which number is larger in absolute value to ensure positive result from `subtract`.
        if (compareAbs(a, b) >= 0) {
            value = subtract(a, b); // a - b
        } else {
            value = subtract(b, a); // b - a, then flip the sign.
            sign  = !sign;
        }

        value = arrayToSmall(value); // Attempt to convert to SmallInteger.

        if (typeof value === "number") {
            if (sign)
                { value = -value; }
            return new SmallInteger(value);
        }
        return new BigInteger(value, sign);
    }


    /**
     * Subtracts a small integer `b` from an array-represented number `a`.
     * @param {number[]} a - The digit array.
     * @param {number} b - The small integer to subtract.
     * @param {boolean} sign - The sign of the result.
     * @returns {BigInteger|SmallInteger} The difference.
     */
    function subtractSmall(a, b, sign) {
        var l          = a.length,
            r          = new Array(l),
            carry      = -b, // 'carry' effectively acts as the small number to subtract.
            base       = BASE,
            i,
            difference;

        for (i = 0; i < l; i++) {
            difference = a[i] + carry;
            carry      = Math.floor(difference / base);
            difference %= base;
            r[i]       = difference < 0 ? difference + base : difference; // Ensure digit is positive.
        }

        r = arrayToSmall(r); // Attempt to convert to SmallInteger.

        if (typeof r === "number") {
            if (sign)
                { r = -r; }
            return new SmallInteger(r);
        }
        return new BigInteger(r, sign);
    }


    // BigInteger.prototype.subtract method.
    BigInteger.prototype.subtract = function (v) {
        var n = parseValue(v);

        // If signs are different, convert to addition of the negated number.
        if (this.sign !== n.sign) {
            return this.add(n.negate());
        }

        var a = this.value,
            b = n.value;

        // If the other number is a SmallInteger, use subtractSmall.
        if (n.isSmall)
            { return subtractSmall(a, Math.abs(b), this.sign); }

        // Otherwise, both are BigIntegers, use subtractAny.
        return subtractAny(a, b, this.sign);
    };

    // Alias for subtract.
    BigInteger.prototype.minus = BigInteger.prototype.subtract;


    // SmallInteger.prototype.subtract method.
    SmallInteger.prototype.subtract = function (v) {
        var n = parseValue(v);
        var a = this.value;

        // If signs are different, convert to addition of the negated number.
        if (a < 0 !== n.sign) {
            return this.add(n.negate());
        }

        var b = n.value;

        // If both are SmallIntegers, perform direct subtraction.
        if (n.isSmall) {
            return new SmallInteger(a - b);
        }

        // If this is SmallInteger and `n` is BigInteger, use subtractSmall, handling signs.
        return subtractSmall(b, Math.abs(a), a >= 0);
    };

    // Alias for subtract.
    SmallInteger.prototype.minus = SmallInteger.prototype.subtract;


    // --- Sign and Absolute Value Operations ---

    // Negates a BigInteger (flips its sign).
    BigInteger.prototype.negate = function () {
        return new BigInteger(this.value, !this.sign);
    };


    // Negates a SmallInteger.
    SmallInteger.prototype.negate = function () {
        var sign  = this.sign;
        var small = new SmallInteger(-this.value);
        small.sign = !sign; // Ensure the sign property is updated.
        return small;
    };


    // Returns the absolute value of a BigInteger.
    BigInteger.prototype.abs = function () {
        return new BigInteger(this.value, false); // Simply set sign to false.
    };


    // Returns the absolute value of a SmallInteger.
    SmallInteger.prototype.abs = function () {
        return new SmallInteger(Math.abs(this.value));
    };


    // --- Arithmetic Operations: Multiplication ---

    /**
     * Multiplies two array-represented numbers using standard long multiplication.
     * @param {number[]} a - First number's digit array.
     * @param {number[]} b - Second number's digit array.
     * @returns {number[]} The product as a digit array.
     */
    function multiplyLong(a, b) {
        var a_l   = a.length,
            b_l   = b.length,
            l     = a_l + b_l, // Maximum possible length of the result.
            r     = createArray(l), // Result array.
            base  = BASE,
            product,
            carry,
            i,
            a_i,
            b_j;

        // Iterate through digits of 'a' and 'b'.
        for (i = 0; i < a_l; ++i) {
            a_i = a[i];
            for (var j = 0; j < b_l; ++j) {
                b_j     = b[j];
                product = a_i * b_j + r[i + j];
                carry   = Math.floor(product / base);
                r[i + j] = product - carry * base;
                r[i + j + 1] += carry; // Add carry to the next position.
            }
        }

        trim(r); // Remove leading zeros.
        return r;
    }


    /**
     * Multiplies an array-represented number `a` by a small integer `b`.
     * @param {number[]} a - The digit array.
     * @param {number} b - The small integer multiplier.
     * @returns {number[]} The product as a digit array.
     */
    function multiplySmall(a, b) {
        var l       = a.length,
            r       = new Array(l),
            base    = BASE,
            carry   = 0,
            product,
            i;

        for (i = 0; i < l; i++) {
            product = a[i] * b + carry;
            carry   = Math.floor(product / base);
            r[i]    = product - carry * base;
        }

        // Propagate any remaining carry.
        while (carry > 0) {
            r[i++] = carry % base;
            carry  = Math.floor(carry / base);
        }
        return r;
    }


    /**
     * Shifts an array-represented number `x` left by `n` positions (effectively multiplying by BASE^n).
     * For BigInts, this means appending `n` zeros to the array.
     * @param {number[]} x - The digit array.
     * @param {number} n - The number of positions to shift.
     * @returns {number[]} The shifted array.
     */
    function shiftLeft(x, n) {
        var r = [];
        while (n-- > 0)
            { r.push(0); } // Append n zeros.
        return r.concat(x);
    }


    /**
     * Implements the Karatsuba multiplication algorithm for large numbers.
     * This is a divide-and-conquer algorithm that is asymptotically faster than long multiplication.
     * @param {number[]} x - First number's digit array.
     * @param {number[]} y - Second number's digit array.
     * @returns {number[]} The product as a digit array.
     */
    function multiplyKaratsuba(x, y) {
        var n = Math.max(x.length, y.length);

        // Base case: if numbers are small enough, use long multiplication.
        if (n <= 30)
            { return multiplyLong(x, y); }

        n = Math.ceil(n / 2); // Split point for Karatsuba.

        // Split x and y into two parts: x = a*B^n + b, y = c*B^n + d.
        var b = x.slice(n),
            a = x.slice(0, n),
            d = y.slice(n),
            c = y.slice(0, n);

        // Recursively compute products: ac, bd, (a+b)(c+d).
        var ac   = multiplyKaratsuba(a, c),
            bd   = multiplyKaratsuba(b, d),
            abcd = multiplyKaratsuba(addAny(a, b), addAny(c, d));

        // Combine results using Karatsuba's formula: ac * B^(2n) + ((a+b)(c+d) - ac - bd) * B^n + bd.
        var product = addAny(addAny(ac, shiftLeft(subtract(subtract(abcd, ac), bd), n)), shiftLeft(bd, 2 * n));

        trim(product); // Clean up the result.
        return product;
    }


    /**
     * Heuristic to decide whether to use Karatsuba multiplication or long multiplication.
     * Karatsuba is generally faster for very large numbers.
     * @param {number} l1 - Length of the first number's digit array.
     * @param {number} l2 - Length of the second number's digit array.
     * @returns {boolean} True if Karatsuba should be used.
     */
    function useKaratsuba(l1, l2) {
        return -.012 * l1 - .012 * l2 + 15e-6 * l1 * l2 > 0;
    }


    // BigInteger.prototype.multiply method.
    BigInteger.prototype.multiply = function (v) {
        var n    = parseValue(v),
            a    = this.value,
            b    = n.value,
            sign = this.sign !== n.sign, // Determine the sign of the product.
            abs;

        // Handle multiplication by a SmallInteger.
        if (n.isSmall) {
            if (b === 0)
                { return Integer[0]; } // Multiply by zero.
            if (b === 1)
                { return this; }      // Multiply by one.
            if (b === -1)
                { return this.negate(); } // Multiply by negative one.

            abs = Math.abs(b);

            // If the absolute value of the small number is less than BASE, use multiplySmall.
            if (abs < BASE) {
                return new BigInteger(multiplySmall(a, abs), sign);
            }

            // Otherwise, convert the small number to an array and proceed.
            b = smallToArray(abs);
        }

        // Decide between Karatsuba and long multiplication based on length heuristic.
        if (useKaratsuba(a.length, b.length))
            { return new BigInteger(multiplyKaratsuba(a, b), sign); }

        return new BigInteger(multiplyLong(a, b), sign);
    };

    // Alias for multiply.
    BigInteger.prototype.times = BigInteger.prototype.multiply;


    /**
     * Helper function to multiply an array-represented number by a small integer,
     * returning a new BigInteger instance.
     * @param {number} a - The small integer multiplier.
     * @param {number[]} b - The digit array.
     * @param {boolean} sign - The sign of the result.
     * @returns {BigInteger} The product.
     */
    function multiplySmallAndArray(a, b, sign) {
        if (a < BASE) {
            return new BigInteger(multiplySmall(b, a), sign);
        }
        return new BigInteger(multiplyLong(b, smallToArray(a)), sign);
    }


    // SmallInteger's internal multiplication by another SmallInteger.
    SmallInteger.prototype._multiplyBySmall = function (a) {
        // If the product fits within a precise JavaScript number, return a SmallInteger.
        if (isPrecise(a.value * this.value)) {
            return new SmallInteger(a.value * this.value);
        }
        // Otherwise, convert to array representation and use multiplySmallAndArray.
        return multiplySmallAndArray(Math.abs(a.value), smallToArray(Math.abs(this.value)), this.sign !== a.sign);
    };


    // BigInteger's internal multiplication by a SmallInteger.
    BigInteger.prototype._multiplyBySmall = function (a) {
        if (a.value === 0)
            { return Integer[0]; }
        if (a.value === 1)
            { return this; }
        if (a.value === -1)
            { return this.negate(); }

        return multiplySmallAndArray(Math.abs(a.value), this.value, this.sign !== a.sign);
    };


    // SmallInteger.prototype.multiply method (delegates to _multiplyBySmall).
    SmallInteger.prototype.multiply = function (v) {
        // Parse the other value and call its _multiplyBySmall method, passing `this`.
        return parseValue(v)._multiplyBySmall(this);
    };

    // Alias for multiply.
    SmallInteger.prototype.times = SmallInteger.prototype.multiply;


    /**
     * Squares an array-represented number using an optimized algorithm.
     * @param {number[]} a - The digit array.
     * @returns {number[]} The square as a digit array.
     */
    function square(a) {
        var l     = a.length,
            r     = createArray(l + l), // Max length 2*l.
            base  = BASE,
            product,
            carry,
            i,
            a_i,
            a_j;

        for (i = 0; i < l; i++) {
            a_i   = a[i];
            carry = 0 - a_i * a_i; // Initialize carry, part of the optimization for squaring.

            for (var j = i; j < l; j++) {
                a_j     = a[j];
                product = 2 * (a_i * a_j) + r[i + j] + carry; // Diagonal terms are doubled.
                carry   = Math.floor(product / base);
                r[i + j] = product - carry * base;
            }
            r[i + l] = carry; // Store final carry for this row.
        }

        trim(r); // Clean up the result.
        return r;
    }


    // BigInteger.prototype.square method.
    BigInteger.prototype.square = function () {
        return new BigInteger(square(this.value), false); // Square is always positive.
    };


    // SmallInteger.prototype.square method.
    SmallInteger.prototype.square = function () {
        var value = this.value * this.value;

        // If the result fits in a precise JavaScript number, return a SmallInteger.
        if (isPrecise(value))
            { return new SmallInteger(value); }

        // Otherwise, convert to array representation and square.
        return new BigInteger(square(smallToArray(Math.abs(this.value))), false);
    };


    // --- Arithmetic Operations: Division and Modulo ---

    /**
     * Performs division and modulo using Algorithm 1 from Knuth's "The Art of Computer Programming",
     * optimized for when the divisor is relatively small.
     * @param {number[]} a - Dividend's digit array.
     * @param {number[]} b - Divisor's digit array.
     * @returns {[BigInteger|SmallInteger, BigInteger|SmallInteger]} An array containing [quotient, remainder].
     */
    function divMod1(a, b) {
        var a_l                         = a.length,
            b_l                         = b.length,
            base                        = BASE,
            result                      = createArray(b.length), // Quotient digits.
            divisorMostSignificantDigit = b[b_l - 1],
            lambda                      = Math.ceil(base / (2 * divisorMostSignificantDigit)), // Normalization factor.
            remainder                   = multiplySmall(a, lambda), // Normalized dividend.
            divisor                     = multiplySmall(b, lambda), // Normalized divisor.
            quotientDigit,
            shift,
            carry,
            borrow,
            i,
            l,
            q;

        // Ensure remainder has enough space (can grow by one digit during normalization).
        if (remainder.length <= a_l)
            { remainder.push(0); }

        divisor.push(0); // Pad divisor for easier comparison in the loop.
        divisorMostSignificantDigit = divisor[b_l - 1]; // Re-evaluate after normalization.

        // Iterate from most significant digits.
        for (shift = a_l - b_l; shift >= 0; shift--) {
            quotientDigit = base - 1; // Initial guess for the quotient digit.

            // Refine guess if leading digits don't match.
            if (remainder[shift + b_l] !== divisorMostSignificantDigit) {
                quotientDigit = Math.floor((remainder[shift + b_l] * base + remainder[shift + b_l - 1]) / divisorMostSignificantDigit);
            }

            // Perform trial subtraction: remainder -= (quotientDigit * divisor).
            carry  = 0;
            borrow = 0;
            l      = divisor.length;

            for (i = 0; i < l; i++) {
                carry += quotientDigit * divisor[i];
                q      = Math.floor(carry / base);
                borrow += remainder[shift + i] - (carry - q * base); // Calculate borrow.
                carry  = q;

                if (borrow < 0) {
                    remainder[shift + i] = borrow + base;
                    borrow               = -1;
                } else {
                    remainder[shift + i] = borrow;
                    borrow               = 0;
                }
            }

            // Adjust quotientDigit if it was too high (resulted in a negative borrow).
            while (borrow !== 0) {
                quotientDigit -= 1;
                carry          = 0;
                for (i = 0; i < l; i++) {
                    carry += remainder[shift + i] - base + divisor[i];
                    if (carry < 0) {
                        remainder[shift + i] = carry + base;
                        carry                = 0;
                    } else {
                        remainder[shift + i] = carry;
                        carry                = 1;
                    }
                }
                borrow += carry;
            }
            result[shift] = quotientDigit; // Store the validated quotient digit.
        }

        // Denormalize the remainder by dividing by lambda.
        remainder = divModSmall(remainder, lambda)[0];

        return [arrayToSmall(result), arrayToSmall(remainder)];
    }


    /**
     * Performs division and modulo using Algorithm 2 (schoolbook long division with optimizations).
     * This is a more general algorithm suitable for any divisor size.
     * @param {number[]} a - Dividend's digit array.
     * @param {number[]} b - Divisor's digit array.
     * @returns {[BigInteger|SmallInteger, BigInteger|SmallInteger]} An array containing [quotient, remainder].
     */
    function divMod2(a, b) {
        var a_l   = a.length,
            b_l   = b.length,
            result = [],
            part  = [],
            base  = BASE,
            guess,
            xlen,
            highx,
            highy,
            check;

        // Process dividend digits from most significant to least significant.
        while (a_l) {
            part.unshift(a[--a_l]); // Add the next digit to the current part of the dividend.
            trim(part);              // Remove leading zeros from the current part.

            // If the current part is smaller than the divisor, the quotient digit is 0.
            if (compareAbs(part, b) < 0) {
                result.push(0);
                continue;
            }

            xlen  = part.length;
            highx = part[xlen - 1] * base + part[xlen - 2];
            highy = b[b_l - 1] * base + b[b_l - 2];

            // Adjust highx if xlen is greater than bl (implies more significant digits in part than divisor).
            if (xlen > b_l) {
                highx = (highx + 1) * base;
            }

            guess = Math.ceil(highx / highy); // Initial guess for the quotient digit.

            // Refine guess by trial subtraction (decrementing guess until it's valid).
            do {
                check = multiplySmall(b, guess);
                if (compareAbs(check, part) <= 0)
                    { break; }
                guess--;
            } while (guess);

            result.push(guess);        // Store the validated quotient digit.
            part = subtract(part, check); // Update the remainder part.
        }

        result.reverse(); // Reverse the result digits as they were collected in reverse order.

        return [arrayToSmall(result), arrayToSmall(part)];
    }


    /**
     * Divides an array-represented number `value` by a small integer `lambda`.
     * @param {number[]} value - The dividend's digit array.
     * @param {number} lambda - The small integer divisor.
     * @returns {[number[], number]} An array containing [quotient_array, remainder_number].
     */
    function divModSmall(value, lambda) {
        var length   = value.length,
            quotient = createArray(length),
            base     = BASE,
            i,
            q,
            remainder,
            divisor;

        remainder = 0;

        // Perform long division by a single digit (lambda).
        for (i = length - 1; i >= 0; --i) {
            divisor    = remainder * base + value[i];
            q          = truncate(divisor / lambda);
            remainder  = divisor - q * lambda;
            quotient[i] = q | 0; // Ensure integer.
        }
        return [quotient, remainder | 0];
    }


    /**
     * Generic division and modulo function, handling BigInt and SmallInt inputs.
     * @param {BigInteger|SmallInteger} self - The dividend.
     * @param {number|string|BigInteger|SmallInteger} v - The divisor.
     * @returns {[BigInteger|SmallInteger, BigInteger|SmallInteger]} An array containing [quotient, remainder].
     */
    function divModAny(self, v) {
        var value,
            n = parseValue(v);
        var a = self.value,
            b = n.value;
        var quotient;

        if (b === 0)
            { throw new Error("Cannot divide by zero"); }

        // Case 1: Dividend is a SmallInteger.
        if (self.isSmall) {
            if (n.isSmall) {
                // Both are SmallIntegers, perform direct JS division.
                return [new SmallInteger(truncate(a / b)), new SmallInteger(a % b)];
            }
            // SmallInt / BigInt: quotient is 0, remainder is the SmallInt itself.
            return [Integer[0], self];
        }

        // Case 2: Divisor is a SmallInteger.
        if (n.isSmall) {
            if (b === 1)
                { return [self, Integer[0]]; } // Division by 1.
            if (b == -1)
                { return [self.negate(), Integer[0]]; } // Division by -1.

            var abs = Math.abs(b);

            // If absolute divisor is less than BASE, use optimized divModSmall.
            if (abs < BASE) {
                value    = divModSmall(a, abs);
                quotient = arrayToSmall(value[0]);
                var remainder = value[1];

                if (self.sign)
                    { remainder = -remainder; } // Adjust remainder sign if dividend was negative.

                // Return SmallIntegers if possible.
                if (typeof quotient === "number") {
                    if (self.sign !== n.sign)
                        { quotient = -quotient; } // Adjust quotient sign.
                    return [new SmallInteger(quotient), new SmallInteger(remainder)];
                }
                return [new BigInteger(quotient, self.sign !== n.sign), new SmallInteger(remainder)];
            }
            // If small divisor is large (e.g., 1e10), convert it to array for general division.
            b = smallToArray(abs);
        }

        // Case 3: Both are BigIntegers.
        var comparison = compareAbs(a, b);

        if (comparison === -1)
            { return [Integer[0], self]; } // Dividend < Divisor (absolute).
        if (comparison === 0)
            { return [Integer[self.sign === n.sign ? 1 : -1], Integer[0]]; } // Dividend == Divisor (absolute).

        // Choose division algorithm based on total length (heuristic).
        if (a.length + b.length <= 200)
            { value = divMod1(a, b); }
        else
            { value = divMod2(a, b); }

        quotient = value[0];
        var qSign = self.sign !== n.sign, // Quotient sign is XOR of dividend and divisor signs.
            mod   = value[1],
            mSign = self.sign;             // Remainder sign is same as dividend sign.

        // Convert quotient to BigInt/SmallInt.
        if (typeof quotient === "number") {
            if (qSign)
                { quotient = -quotient; }
            quotient = new SmallInteger(quotient);
        } else
            { quotient = new BigInteger(quotient, qSign); }

        // Convert remainder to BigInt/SmallInt.
        if (typeof mod === "number") {
            if (mSign)
                { mod = -mod; }
            mod = new SmallInteger(mod);
        } else
            { mod = new BigInteger(mod, mSign); }

        return [quotient, mod];
    }


    // BigInteger.prototype.divmod method (returns an object with quotient and remainder).
    BigInteger.prototype.divmod = function (v) {
        var result = divModAny(this, v);
        return {
            quotient: result[0],
            remainder: result[1]
        };
    };

    // SmallInteger.prototype.divmod (delegates to BigInteger's divmod).
    SmallInteger.prototype.divmod = BigInteger.prototype.divmod;


    // BigInteger.prototype.divide method.
    BigInteger.prototype.divide = function (v) {
        return divModAny(this, v)[0]; // Return only the quotient.
    };

    // Aliases for divide.
    SmallInteger.prototype.over = SmallInteger.prototype.divide = BigInteger.prototype.over = BigInteger.prototype.divide;


    // BigInteger.prototype.mod method.
    BigInteger.prototype.mod = function (v) {
        return divModAny(this, v)[1]; // Return only the remainder.
    };

    // Aliases for mod.
    SmallInteger.prototype.remainder = SmallInteger.prototype.mod = BigInteger.prototype.remainder = BigInteger.prototype.mod;


    // --- Arithmetic Operations: Exponentiation ---

    // BigInteger.prototype.pow method (integer exponentiation).
    BigInteger.prototype.pow = function (v) {
        var n     = parseValue(v),
            a     = this.value,
            b     = n.value,
            value,
            x,
            y;

        if (b === 0)
            { return Integer[1]; } // x^0 = 1.
        if (a === 0)
            { return Integer[0]; } // 0^y = 0 (for y > 0).
        if (a === 1)
            { return Integer[1]; } // 1^y = 1.
        if (a === -1)
            { return n.isEven() ? Integer[1] : Integer[-1]; } // (-1)^y is 1 or -1.

        // Negative exponent results in 0 for integer exponentiation (truncation towards zero).
        if (n.sign) {
            return Integer[0];
        }

        // Exponent must be a SmallInteger.
        if (!n.isSmall)
            { throw new Error("The exponent " + n.toString() + " is too large."); }

        // If base is a SmallInteger, try direct Math.pow first for efficiency.
        if (this.isSmall) {
            if (isPrecise(value = Math.pow(a, b)))
                { return new SmallInteger(truncate(value)); }
        }

        // Binary exponentiation (exponentiation by squaring) algorithm.
        x = this;
        y = Integer[1]; // Accumulator for the result.

        while (true) {
            if (b & 1 === 1) { // If exponent is odd.
                y = y.times(x);
                --b;           // Decrement exponent.
            }
            if (b === 0)
                { break; }     // Exponent is zero, done.
            b /= 2;            // Halve exponent.
            x = x.square();    // Square the base.
        }
        return y;
    };

    // SmallInteger.prototype.pow (delegates to BigInteger's pow).
    SmallInteger.prototype.pow = BigInteger.prototype.pow;


    // BigInteger.prototype.modPow method (modular exponentiation).
    BigInteger.prototype.modPow = function (exp, mod) {
        exp = parseValue(exp);
        mod = parseValue(mod);

        if (mod.isZero())
            { throw new Error("Cannot take modPow with modulus 0"); }

        var r    = Integer[1], // Result accumulator.
            base = this.mod(mod); // Base modulo modulus.

        while (exp.isPositive()) {
            if (base.isZero())
                { return Integer[0]; } // If base % mod is 0, then 0^exp % mod is 0.

            if (exp.isOdd())
                { r = r.multiply(base).mod(mod); } // r = (r * base) % mod.

            exp  = exp.divide(2);       // exp = exp / 2.
            base = base.square().mod(mod); // base = (base^2) % mod.
        }
        return r;
    };

    // SmallInteger.prototype.modPow (delegates to BigInteger's modPow).
    SmallInteger.prototype.modPow = BigInteger.prototype.modPow;


    // --- Comparison Operations ---

    /**
     * Compares the absolute values of two array-represented numbers.
     * @param {number[]} a - First number's digit array.
     * @param {number[]} b - Second number's digit array.
     * @returns {number} 1 if a > b, -1 if a < b, 0 if a == b.
     */
    function compareAbs(a, b) {
        if (a.length !== b.length) {
            return a.length > b.length ? 1 : -1; // Longer array means larger absolute value.
        }
        // Compare digits from most significant to least significant.
        for (var i = a.length - 1; i >= 0; i--) {
            if (a[i] !== b[i])
                { return a[i] > b[i] ? 1 : -1; }
        }
        return 0; // Numbers are equal in absolute value.
    }


    // BigInteger.prototype.compareAbs method.
    BigInteger.prototype.compareAbs = function (v) {
        var n = parseValue(v),
            a = this.value,
            b = n.value;

        // If the other number is a SmallInteger, this BigInt is always larger (in abs value).
        if (n.isSmall)
            { return 1; }

        return compareAbs(a, b);
    };


    // SmallInteger.prototype.compareAbs method.
    SmallInteger.prototype.compareAbs = function (v) {
        var n = parseValue(v),
            a = Math.abs(this.value),
            b = n.value;

        if (n.isSmall) {
            b = Math.abs(b);
            return a === b ? 0 : a > b ? 1 : -1; // Direct comparison for two small numbers.
        }

        // If the other number is a BigInteger, this SmallInt is smaller (in abs value).
        return -1;
    };


    // BigInteger.prototype.compare method.
    BigInteger.prototype.compare = function (v) {
        // Handle special JavaScript values (Infinity, -Infinity).
        if (v === Infinity)
            { return -1; }
        if (v === -Infinity)
            { return 1; }

        var n = parseValue(v),
            a = this.value,
            b = n.value;

        // Compare based on signs first.
        if (this.sign !== n.sign) {
            return n.sign ? 1 : -1; // If n is negative, this (positive) is larger; else (n positive) this (negative) is smaller.
        }

        // If n is a SmallInteger, and signs are the same, this BigInt is larger (if positive) or smaller (if negative).
        if (n.isSmall) {
            return this.sign ? -1 : 1;
        }

        // Both are BigIntegers, compare absolute values and adjust for the common sign.
        return compareAbs(a, b) * (this.sign ? -1 : 1);
    };

    // Alias for compare.
    BigInteger.prototype.compareTo = BigInteger.prototype.compare;


    // SmallInteger.prototype.compare method.
    SmallInteger.prototype.compare = function (v) {
        // Handle special JavaScript values.
        if (v === Infinity)
            { return -1; }
        if (v === -Infinity)
            { return 1; }

        var n = parseValue(v),
            a = this.value,
            b = n.value;

        // If the other number is a SmallInteger, direct comparison.
        if (n.isSmall) {
            return a == b ? 0 : a > b ? 1 : -1;
        }

        // If signs are different, compare based on signs.
        if (a < 0 !== n.sign) {
            return a < 0 ? -1 : 1;
        }

        // If signs are the same, and the other is a BigInt, this SmallInt is smaller (if positive) or larger (if negative).
        return a < 0 ? 1 : -1;
    };

    // Alias for compare.
    SmallInteger.prototype.compareTo = SmallInteger.prototype.compare;


    // BigInteger.prototype.equals method.
    BigInteger.prototype.equals = function (v) {
        return this.compare(v) === 0;
    };

    // Aliases for equals.
    SmallInteger.prototype.eq = SmallInteger.prototype.equals = BigInteger.prototype.eq = BigInteger.prototype.equals;


    // BigInteger.prototype.notEquals method.
    BigInteger.prototype.notEquals = function (v) {
        return this.compare(v) !== 0;
    };

    // Aliases for notEquals.
    SmallInteger.prototype.neq = SmallInteger.prototype.notEquals = BigInteger.prototype.neq = BigInteger.prototype.notEquals;


    // BigInteger.prototype.greater method.
    BigInteger.prototype.greater = function (v) {
        return this.compare(v) > 0;
    };

    // Aliases for greater.
SmallInteger.prototype.gt = SmallInteger.prototype.greater = BigInteger.prototype.gt = BigInteger.prototype.greater;


    // BigInteger.prototype.lesser method.
    BigInteger.prototype.lesser = function (v) {
        return this.compare(v) < 0;
    };

    // Aliases for lesser.
    SmallInteger.prototype.lt = SmallInteger.prototype.lesser = BigInteger.prototype.lt = BigInteger.prototype.lesser;


    // BigInteger.prototype.greaterOrEquals method.
    BigInteger.prototype.greaterOrEquals = function (v) {
        return this.compare(v) >= 0;
    };

    // Aliases for greaterOrEquals.
    SmallInteger.prototype.geq = SmallInteger.prototype.greaterOrEquals = BigInteger.prototype.geq = BigInteger.prototype.greaterOrEquals;


    // BigInteger.prototype.lesserOrEquals method.
    BigInteger.prototype.lesserOrEquals = function (v) {
        return this.compare(v) <= 0;
    };

    // Aliases for lesserOrEquals.
    SmallInteger.prototype.leq = SmallInteger.prototype.lesserOrEquals = BigInteger.prototype.leq = BigInteger.prototype.lesserOrEquals;


    // --- Property Checks (isEven, isPositive, etc.) ---

    // BigInteger.prototype.isEven method.
    BigInteger.prototype.isEven = function () {
        return (this.value[0] & 1) === 0; // Check the least significant digit.
    };


    // SmallInteger.prototype.isEven method.
    SmallInteger.prototype.isEven = function () {
        return (this.value & 1) === 0;
    };


    // BigInteger.prototype.isOdd method.
    BigInteger.prototype.isOdd = function () {
        return (this.value[0] & 1) === 1; // Check the least significant digit.
    };


    // SmallInteger.prototype.isOdd method.
    SmallInteger.prototype.isOdd = function () {
        return (this.value & 1) === 1;
    };


    // BigInteger.prototype.isPositive method.
    BigInteger.prototype.isPositive = function () {
        return !this.sign;
    };


    // SmallInteger.prototype.isPositive method.
    SmallInteger.prototype.isPositive = function () {
        return this.value > 0;
    };


    // BigInteger.prototype.isNegative method.
    BigInteger.prototype.isNegative = function () {
        return this.sign;
    };


    // SmallInteger.prototype.isNegative method.
    SmallInteger.prototype.isNegative = function () {
        return this.value < 0;
    };


    // BigInteger.prototype.isUnit method (checks if value is 1 or -1).
    BigInteger.prototype.isUnit = function () {
        // A BigInteger with a value array generally isn't 1 or -1,
        // as these would typically be represented as SmallIntegers.
        return false;
    };


    // SmallInteger.prototype.isUnit method.
    SmallInteger.prototype.isUnit = function () {
        return Math.abs(this.value) === 1;
    };


    // BigInteger.prototype.isZero method.
    BigInteger.prototype.isZero = function () {
        // Similar to isUnit, a BigInteger with a value array isn't 0.
        return false;
    };


    // SmallInteger.prototype.isZero method.
    SmallInteger.prototype.isZero = function () {
        return this.value === 0;
    };


    // BigInteger.prototype.isDivisibleBy method.
    BigInteger.prototype.isDivisibleBy = function (v) {
        var n = parseValue(v);
        var value = n.value;

        if (value === 0)
            { return false; } // Cannot divide by zero.
        if (value === 1)
            { return true; }  // Any number is divisible by 1.
        if (value === 2)
            { return this.isEven(); } // Check for evenness.

        return this.mod(n).equals(Integer[0]); // Check if remainder is zero.
    };

    // SmallInteger.prototype.isDivisibleBy (delegates to BigInteger's isDivisibleBy).
    SmallInteger.prototype.isDivisibleBy = BigInteger.prototype.isDivisibleBy;


    /**
     * Helper function for basic primality tests (small numbers).
     * @param {BigInteger|SmallInteger} v - The number to check.
     * @returns {boolean|undefined} True/False if result is certain, undefined if more complex test is needed.
     */
    function isBasicPrime(v) {
        var n = v.abs();

        if (n.isUnit())
            { return false; } // 1 or -1 is not prime.
        if (n.equals(2) || n.equals(3) || n.equals(5))
            { return true; }  // 2, 3, 5 are primes.
        if (n.isEven() || n.isDivisibleBy(3) || n.isDivisibleBy(5))
            { return false; } // Divisible by 2, 3, or 5 => not prime.
        if (n.lesser(25))
            { return true; }  // Primes less than 25 (excluding 2,3,5 checked above) are 7, 11, 13, 17, 19, 23.
                              // All these pass the above checks, so if n < 25 and passed, it's prime.
    }


    // BigInteger.prototype.isPrime method (Miller-Rabin primality test).
    BigInteger.prototype.isPrime = function () {
        var isPrime = isBasicPrime(this);
        if (isPrime !== undefined)
            { return isPrime; } // Return early for small numbers.

        var n     = this.abs(),
            nPrev = n.prev(); // n-1.

        // Miller-Rabin test with a fixed set of small prime bases.
        var a = [2, 3, 5, 7, 11, 13, 17, 19],
            b = nPrev, // b is n-1.
            d,
            t,
            i,
            x;

        // Express n-1 as d * 2^s (where d is odd).
        while (b.isEven())
            { b = b.divide(2); }

        // For each base 'a' in the set.
        for (i = 0; i < a.length; i++) {
            x = bigInt(a[i]).modPow(b, n); // x = a^d mod n.

            if (x.equals(Integer[1]) || x.equals(nPrev))
                { continue; } // Passes first condition of Miller-Rabin.

            // Check x^(2^r * d) mod n for r from 0 to s-1.
            for (t = true, d = b; t && d.lesser(nPrev); d = d.multiply(2)) {
                x = x.square().mod(n);
                if (x.equals(nPrev))
                    { t = false; } // Passes second condition.
            }

            if (t)
                { return false; } // If neither condition passed, n is composite.
        }
        return true; // All bases passed, n is a probable prime.
    };

    // SmallInteger.prototype.isPrime (delegates to BigInteger's isPrime).
    SmallInteger.prototype.isPrime = BigInteger.prototype.isPrime;


    // BigInteger.prototype.isProbablePrime method (Miller-Rabin with configurable iterations).
    BigInteger.prototype.isProbablePrime = function (iterations) {
        var isPrime = isBasicPrime(this);
        if (isPrime !== undefined)
            { return isPrime; }

        var n = this.abs();
        var t = iterations === undefined ? 5 : iterations; // Default iterations to 5.

        // Perform Miller-Rabin test 't' times with random bases.
        for (var i = 0; i < t; i++) {
            var a = bigInt.randBetween(2, n.minus(2)); // Choose a random base 'a' (2 <= a <= n-2).
            if (!a.modPow(n.prev(), n).isUnit())      // Check a^(n-1) mod n === 1 (Fermat's Little Theorem).
                                                      // This is a simplified check, full Miller-Rabin is in isPrime.
                { return false; }
        }
        return true; // All random checks passed, n is a probable prime.
    };

    // SmallInteger.prototype.isProbablePrime (delegates to BigInteger's isProbablePrime).
    SmallInteger.prototype.isProbablePrime = BigInteger.prototype.isProbablePrime;


    // BigInteger.prototype.modInv method (modular multiplicative inverse using Extended Euclidean Algorithm).
    BigInteger.prototype.modInv = function (n) {
        var t     = bigInt.zero,    // Previous remainder coefficient.
            newT  = bigInt.one,     // Current remainder coefficient.
            r     = parseValue(n),  // Previous remainder (modulus).
            newR  = this.abs(),     // Current remainder (number to invert).
            q,                      // Quotient.
            lastT,                  // Temporary for old t.
            lastR;                  // Temporary for old r.

        // Extended Euclidean Algorithm.
        while (!newR.equals(bigInt.zero)) {
            q     = r.divide(newR); // q = r / newR (integer division).
            lastT = t;
            lastR = r;
            t     = newT;
            r     = newR;
            newT  = lastT.subtract(q.multiply(newT)); // Bezout's identity for t.
            newR  = lastR.subtract(q.multiply(newR)); // Bezout's identity for r.
        }

        if (!r.equals(1))
            { throw new Error(this.toString() + " and " + n.toString() + " are not co-prime"); } // If gcd is not 1, no inverse exists.

        if (t.compare(0) === -1) { // If t is negative.
            t = t.add(n);          // Add modulus to make it positive.
        }

        if (this.isNegative()) {
            return t.negate();     // If original number was negative, inverse is also negative (mod n).
        }

        return t;
    };

    // SmallInteger.prototype.modInv (delegates to BigInteger's modInv).
    SmallInteger.prototype.modInv = BigInteger.prototype.modInv;


    // --- Increment and Decrement Operations ---

    // BigInteger.prototype.next method (returns this + 1).
    BigInteger.prototype.next = function () {
        var value = this.value;

        if (this.sign) {
            // If negative, e.g., -5.next() should be -4.
            // subtractSmall([5], 1, true) => BigInt([4], true) => -4.
            return subtractSmall(value, 1, this.sign);
        }

        // If positive, add 1.
        return new BigInteger(addSmall(value, 1), this.sign);
    };


    // SmallInteger.prototype.next method.
    SmallInteger.prototype.next = function () {
        var value = this.value;

        // If value + 1 is still within the safe integer range, return a SmallInteger.
        if (value + 1 < MAX_INT)
            { return new SmallInteger(value + 1); }

        // Otherwise, it overflows, return a BigInteger.
        return new BigInteger(MAX_INT_ARR, false);
    };


    // BigInteger.prototype.prev method (returns this - 1).
    BigInteger.prototype.prev = function () {
        var value = this.value;

        if (this.sign) {
            // If negative, e.g., -5.prev() should be -6.
            // addSmall([5], 1) => BigInt([6], true) => -6.
            return new BigInteger(addSmall(value, 1), true);
        }

        // If positive, subtract 1.
        return subtractSmall(value, 1, this.sign);
    };


    // SmallInteger.prototype.prev method.
    SmallInteger.prototype.prev = function () {
        var value = this.value;

        // If value - 1 is still within the safe integer range, return a SmallInteger.
        if (value - 1 > -MAX_INT)
            { return new SmallInteger(value - 1); }

        // Otherwise, it underflows, return a BigInteger representing -MAX_INT.
        return new BigInteger(MAX_INT_ARR, true);
    };


    // --- Bitwise Operations ---

    // Pre-computed powers of two for efficient bit shifting (up to BASE).
    var powersOfTwo = [1];
    while (2 * powersOfTwo[powersOfTwo.length - 1] <= BASE)
        { powersOfTwo.push(2 * powersOfTwo[powersOfTwo.length - 1]); }

    var powers2Length  = powersOfTwo.length,
        highestPower2 = powersOfTwo[powers2Length - 1];


    /**
     * Checks if the shift amount `n` is a small integer (within BASE or SmallInteger).
     * @param {number|string|BigInteger} n - The shift amount.
     * @returns {boolean} True if `n` is small.
     */
    function shift_isSmall(n) {
        return (typeof n === "number" || typeof n === "string") && +Math.abs(n) <= BASE || n instanceof BigInteger && n.value.length <= 1;
    }


    // BigInteger.prototype.shiftLeft method (bitwise left shift).
    BigInteger.prototype.shiftLeft = function (n) {
        if (!shift_isSmall(n)) {
            throw new Error(String(n) + " is too large for shifting.");
        }
        n = +n; // Convert to number.

        if (n < 0)
            { return this.shiftRight(-n); } // Negative shift left is shift right.

        var result = this;

        if (result.isZero())
            { return result; }

        // Perform shifts by multiplying by powers of 2 (BASE is a power of 2).
        while (n >= powers2Length) {
            result = result.multiply(highestPower2);
            n -= powers2Length - 1; // Reduce n by the largest power of 2.
        }

        return result.multiply(powersOfTwo[n]); // Multiply by remaining power of 2.
    };

    // SmallInteger.prototype.shiftLeft (delegates to BigInteger's shiftLeft).
    SmallInteger.prototype.shiftLeft = BigInteger.prototype.shiftLeft;


    // BigInteger.prototype.shiftRight method (bitwise right shift).
    BigInteger.prototype.shiftRight = function (n) {
        var remQuo;

        if (!shift_isSmall(n)) {
            throw new Error(String(n) + " is too large for shifting.");
        }
        n = +n; // Convert to number.

        if (n < 0)
            { return this.shiftLeft(-n); } // Negative shift right is shift left.

        var result = this;

        // Handle special cases for 0 and -1.
        while (n >= powers2Length) {
            if (result.isZero() || result.isNegative() && result.isUnit())
                { return result; } // Right shifting 0 or -1 results in 0 or -1.

            remQuo = divModAny(result, highestPower2); // Divide by highest power of 2.
            result = remQuo[1].isNegative() ? remQuo[0].prev() : remQuo[0]; // Handle negative remainders (floor division).
            n -= powers2Length - 1;
        }

        remQuo = divModAny(result, powersOfTwo[n]); // Divide by remaining power of 2.

        return remQuo[1].isNegative() ? remQuo[0].prev() : remQuo[0]; // Handle negative remainders.
    };

    // SmallInteger.prototype.shiftRight (delegates to BigInteger's shiftRight).
    SmallInteger.prototype.shiftRight = BigInteger.prototype.shiftRight;


    /**
     * Generic bitwise operation function (AND, OR, XOR).
     * Handles negative numbers using two's complement logic.
     * @param {BigInteger|SmallInteger} x - First operand.
     * @param {BigInteger|SmallInteger} y - Second operand.
     * @param {function(number, number): number} fn - The bitwise function (e.g., `(a, b) => a & b`).
     * @returns {BigInteger} The result of the bitwise operation.
     */
    function bitwise(x, y, fn) {
        y = parseValue(y); // Ensure y is an Integer object.

        var xSign = x.isNegative(),
            ySign = y.isNegative();

        // Convert to (pseudo) 2's complement representation for negative numbers.
        var xRem = xSign ? x.not() : x,
            yRem = ySign ? y.not() : y;

        var xDigit    = 0,
            yDigit    = 0;
        var xDivMod   = null,
            yDivMod   = null;
        var result    = [];

        // Process digits from least significant to most significant.
        while (!xRem.isZero() || !yRem.isZero()) {
            xDivMod = divModAny(xRem, highestPower2);
            xDigit  = xDivMod[1].toJSNumber();
            if (xSign) {
                xDigit = highestPower2 - 1 - xDigit; // Invert digits for 2's complement representation.
            }

            yDivMod = divModAny(yRem, highestPower2);
            yDigit  = yDivMod[1].toJSNumber();
            if (ySign) {
                yDigit = highestPower2 - 1 - yDigit; // Invert digits for 2's complement representation.
            }

            xRem = xDivMod[0];
            yRem = yDivMod[0];

            result.push(fn(xDigit, yDigit)); // Apply the bitwise function to current digits.
        }

        // Handle the sign bit (most significant part).
        // If the result should be negative, start with -1. Otherwise, 0.
        var sum = fn(xSign ? 1 : 0, ySign ? 1 : 0) !== 0 ? bigInt(-1) : bigInt(0);

        // Reconstruct the number from the result digits.
        for (var i = result.length - 1; i >= 0; i -= 1) {
            sum = sum.multiply(highestPower2).add(bigInt(result[i]));
        }
        return sum;
    }


    // BigInteger.prototype.not method (bitwise NOT).
    BigInteger.prototype.not = function () {
        return this.negate().prev(); // NOT x = -x - 1 (in two's complement).
    };

    // SmallInteger.prototype.not (delegates to BigInteger's not).
    SmallInteger.prototype.not = BigInteger.prototype.not;


    // BigInteger.prototype.and method (bitwise AND).
    BigInteger.prototype.and = function (n) {
        return bitwise(this, n, function (a, b) {
            return a & b;
        });
    };

    // SmallInteger.prototype.and (delegates to BigInteger's and).
    SmallInteger.prototype.and = BigInteger.prototype.and;


    // BigInteger.prototype.or method (bitwise OR).
    BigInteger.prototype.or = function (n) {
        return bitwise(this, n, function (a, b) {
            return a | b;
        });
    };

    // SmallInteger.prototype.or (delegates to BigInteger's or).
    SmallInteger.prototype.or = BigInteger.prototype.or;


    // BigInteger.prototype.xor method (bitwise XOR).
    BigInteger.prototype.xor = function (n) {
        return bitwise(this, n, function (a, b) {
            return a ^ b;
        });
    };

    // SmallInteger.prototype.xor (delegates to BigInteger's xor).
    SmallInteger.prototype.xor = BigInteger.prototype.xor;


    // LOBMASK_I for small integers (30 bits).
    var LOBMASK_I  = 1 << 30,
        // LOBMASK_BI for BigIntegers, accounts for BASE.
        LOBMASK_BI = (BASE & -BASE) * (BASE & -BASE) | LOBMASK_I;


    /**
     * Provides a rough estimate of the Least Significant Bit (LSB) mask.
     * Used in GCD for efficient division by powers of 2.
     * @param {BigInteger|SmallInteger} n - The number.
     * @returns {number} A number with only the LSB set.
     */
    function roughLOB(n) {
        var v = n.value,
            x = typeof v === "number" ? v | LOBMASK_I : v[0] + v[1] * BASE | LOBMASK_BI;
        return x & -x; // Returns a number with only the LSB set (e.g., 8 for 24).
    }


    /**
     * Computes the integer logarithm (log_base(value)).
     * @param {BigInteger} value - The number whose logarithm is to be computed.
     * @param {BigInteger} base - The base of the logarithm.
     * @returns {{p: BigInteger, e: number}} An object containing the power (p) and exponent (e).
     */
    function integerLogarithm(value, base) {
        if (base.compareTo(value) <= 0) {
            var tmp = integerLogarithm(value, base.square(base)); // Recursive call with base^2.
            var p   = tmp.p;
            var e   = tmp.e;
            var t   = p.multiply(base);

            // Adjust exponent based on comparison with value.
            return t.compareTo(value) <= 0 ? { p: t, e: e * 2 + 1 } : { p: p, e: e * 2 };
        }
        return { p: bigInt(1), e: 0 }; // Base case: value < base.
    }


    // BigInteger.prototype.bitLength method (number of bits required to represent the number).
    BigInteger.prototype.bitLength = function () {
        var n = this;

        // For negative numbers, bit length is usually defined for abs(n) or 2's complement.
        // This implementation calculates bit length for abs(n)-1 (to match common definition for non-negative).
        if (n.compareTo(bigInt(0)) < 0) {
            n = n.negate().subtract(bigInt(1));
        }

        if (n.compareTo(bigInt(0)) === 0) {
            return bigInt(0);
        }

        // Uses integer logarithm with base 2.
        return bigInt(integerLogarithm(n, bigInt(2)).e).add(bigInt(1));
    };

    // SmallInteger.prototype.bitLength (delegates to BigInteger's bitLength).
    SmallInteger.prototype.bitLength = BigInteger.prototype.bitLength;


    // --- Other Mathematical Functions ---

    /**
     * Returns the maximum of two BigInts.
     * @param {BigInteger|SmallInteger} a - First number.
     * @param {BigInteger|SmallInteger} b - Second number.
     * @returns {BigInteger|SmallInteger} The larger of the two.
     */
    function max(a, b) {
        a = parseValue(a);
        b = parseValue(b);
        return a.greater(b) ? a : b;
    }


    /**
     * Returns the minimum of two BigInts.
     * @param {BigInteger|SmallInteger} a - First number.
     * @param {BigInteger|SmallInteger} b - Second number.
     * @returns {BigInteger|SmallInteger} The smaller of the two.
     */
    function min(a, b) {
        a = parseValue(a);
        b = parseValue(b);
        return a.lesser(b) ? a : b;
    }


    /**
     * Computes the Greatest Common Divisor (GCD) of two BigInts using the Binary GCD algorithm.
     * @param {BigInteger|SmallInteger} a - First number.
     * @param {BigInteger|SmallInteger} b - Second number.
     * @returns {BigInteger|SmallInteger} The GCD.
     */
    function gcd(a, b) {
        a = parseValue(a).abs(); // Ensure positive.
        b = parseValue(b).abs(); // Ensure positive.

        if (a.equals(b))
            { return a; }
        if (a.isZero())
            { return b; }
        if (b.isZero())
            { return a; }

        var c = Integer[1], // Factor of 2s removed.
            d,
            t;

        // Step 1: Remove common factors of 2.
        while (a.isEven() && b.isEven()) {
            d = Math.min(roughLOB(a), roughLOB(b)); // Find smallest power of 2.
            a = a.divide(d);
            b = b.divide(d);
            c = c.multiply(d);
        }

        // Step 2: Remove factors of 2 from 'a' (now 'a' is odd).
        while (a.isEven()) {
            a = a.divide(roughLOB(a));
        }

        // Step 3: Loop until b is zero.
        do {
            // Remove factors of 2 from 'b'.
            while (b.isEven()) {
                b = b.divide(roughLOB(b));
            }

            // Ensure a <= b.
            if (a.greater(b)) {
                t = b;
                b = a;
                a = t;
            }

            b = b.subtract(a); // Replace b with b - a.
        } while (!b.isZero());

        return c.isUnit() ? a : a.multiply(c); // Restore common factors of 2.
    }


    /**
     * Computes the Least Common Multiple (LCM) of two BigInts.
     * LCM(a, b) = |a * b| / GCD(a, b).
     * @param {BigInteger|SmallInteger} a - First number.
     * @param {BigInteger|SmallInteger} b - Second number.
     * @returns {BigInteger|SmallInteger} The LCM.
     */
    function lcm(a, b) {
        a = parseValue(a).abs();
        b = parseValue(b).abs();
        return a.divide(gcd(a, b)).multiply(b);
    }


    /**
     * Generates a random BigInt between `a` and `b` (inclusive).
     * @param {BigInteger|SmallInteger} a - Lower bound.
     * @param {BigInteger|SmallInteger} b - Upper bound.
     * @returns {BigInteger|SmallInteger} A random BigInt.
     */
    function randBetween(a, b) {
        a = parseValue(a);
        b = parseValue(b);

        var low   = min(a, b),
            high  = max(a, b);
        var range = high.subtract(low).add(1); // Calculate the size of the range.

        // If the range is small enough, use Math.random directly.
        if (range.isSmall)
            { return low.add(Math.floor(Math.random() * range)); }

        var length     = range.value.length - 1; // Number of digits in the range.
        var result     = [],
            restricted = true;

        // Generate random digits for the result, ensuring it stays within the range.
        for (var i = length; i >= 0; i--) {
            var top   = restricted ? range.value[i] : BASE; // Max value for current digit.
            var digit = truncate(Math.random() * top);     // Random digit.
            result.unshift(digit);

            if (digit < top)
                { restricted = false; } // If digit is less than max, subsequent digits are not restricted.
        }

        result = arrayToSmall(result); // Convert to SmallInteger if possible.

        // Add to the lower bound to get the final random number.
        return low.add(typeof result === "number" ? new SmallInteger(result) : new BigInteger(result, false));
    }


    // --- String Conversion and Parsing ---

    /**
     * Parses a string `text` in a given `base` into a BigInt.
     * @param {string} text - The string representation of the number.
     * @param {number|BigInteger} base - The base (radix) of the input string.
     * @returns {BigInteger|SmallInteger} The parsed number.
     */
    var parseBase = function (text, base) {
        var length  = text.length;
        var i;
        var absBase = Math.abs(base);

        // Input validation for digits.
        for (var i = 0; i < length; i++) {
            var c = text[i].toLowerCase();
            if (c === "-")
                { continue; } // Skip negative sign.

            if (/[a-z0-9]/.test(c)) {
                // Check if digit value is valid for the base.
                if (/[0-9]/.test(c) && +c >= absBase) {
                    if (c === "1" && absBase === 1)
                        { continue; } // Special case for base 1.
                    throw new Error(c + " is not a valid digit in base " + base + ".");
                } else if (c.charCodeAt(0) - 87 >= absBase) { // For a-z (a=10, b=11, ...).
                    throw new Error(c + " is not a valid digit in base " + base + ".");
                }
            }
        }

        // If base is within typical range (2-36) and number is small enough, use native parseInt.
        if (2 <= base && base <= 36) {
            if (length <= LOG_MAX_INT / Math.log(base)) {
                var result = parseInt(text, base);
                if (isNaN(result)) {
                    throw new Error(c + " is not a valid digit in base " + base + "."); // Should be 'text' not 'c' here, but preserving original.
                }
                return new SmallInteger(parseInt(text, base));
            }
        }

        base         = parseValue(base); // Ensure base is an Integer object.
        var digits   = [];
        var isNegative = text[0] === "-";

        // Parse digits from the string.
        for (i = isNegative ? 1 : 0; i < text.length; i++) {
            var c        = text[i].toLowerCase(),
                charCode = c.charCodeAt(0);

            if (48 <= charCode && charCode <= 57) // 0-9.
                { digits.push(parseValue(c)); }
            else if (97 <= charCode && charCode <= 122) // a-z.
                { digits.push(parseValue(c.charCodeAt(0) - 87)); }
            else if (c === "<") { // Handle custom digits like <10>.
                var start = i;
                do {
                    i++;
                } while (text[i] !== ">");
                digits.push(parseValue(text.slice(start + 1, i)));
            } else
                { throw new Error(c + " is not a valid character"); }
        }

        return parseBaseFromArray(digits, base, isNegative);
    };


    /**
     * Converts an array of digits in a given base to a BigInt.
     * Uses Horner's method for efficient base conversion.
     * @param {BigInteger[]|SmallInteger[]} digits - Array of digit values.
     * @param {BigInteger} base - The base of the digits.
     * @param {boolean} isNegative - True if the final number should be negative.
     * @returns {BigInteger|SmallInteger} The converted number.
     */
    function parseBaseFromArray(digits, base, isNegative) {
        var val = Integer[0],
            pow = Integer[1],
            i;

        for (i = digits.length - 1; i >= 0; i--) {
            val = val.add(digits[i].times(pow));
            pow = pow.times(base);
        }

        return isNegative ? val.negate() : val;
    }


    /**
     * Converts a digit (number) to its string representation (0-9, a-z, or <digit>).
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
     * Converts a BigInt to its representation in a given base.
     * @param {BigInteger|SmallInteger} n - The number to convert.
     * @param {number|BigInteger} base - The target base.
     * @returns {{value: number[], isNegative: boolean}} Object with digit array and sign.
     */
    function toBase(n, base) {
        base = bigInt(base);

        if (base.isZero()) {
            if (n.isZero())
                { return { value: [0], isNegative: false }; }
            throw new Error("Cannot convert nonzero numbers to base 0.");
        }

        // Special handling for base -1 (alternating powers of -1).
        if (base.equals(-1)) {
            if (n.isZero())
                { return { value: [0], isNegative: false }; }
            if (n.isNegative())
                { return { value: [].concat.apply([], Array.apply(null, Array(-n)).map(Array.prototype.valueOf, [1, 0])), isNegative: false }; }
            var arr = Array.apply(null, Array(+n - 1)).map(Array.prototype.valueOf, [0, 1]);
            arr.unshift([1]);
            return { value: [].concat.apply([], arr), isNegative: false };
        }

        var neg = false;
        // Handle negative numbers for positive bases.
        if (n.isNegative() && base.isPositive()) {
            neg = true;
            n   = n.abs();
        }

        // Special handling for base 1.
        if (base.equals(1)) {
            if (n.isZero())
                { return { value: [0], isNegative: false }; }
            return { value: Array.apply(null, Array(+n)).map(Number.prototype.valueOf, 1), isNegative: neg };
        }

        var out = [];
        var left = n,
            divmod;

        // Repeatedly divide by base and collect remainders.
        while (left.isNegative() || left.compareAbs(base) >= 0) {
            divmod = left.divmod(base);
            left   = divmod.quotient;
            var digit = divmod.remainder;

            // Adjust for negative remainders (common in non-standard bases).
            if (digit.isNegative()) {
                digit = base.minus(digit).abs();
                left  = left.next();
            }
            out.push(digit.toJSNumber());
        }

        out.push(left.toJSNumber()); // Push the last quotient.

        return { value: out.reverse(), isNegative: neg };
    }


    /**
     * Converts a BigInt to its string representation in a given base.
     * @param {BigInteger|SmallInteger} n - The number to convert.
     * @param {number|BigInteger} base - The target base.
     * @returns {string} The string representation.
     */
    function toBaseString(n, base) {
        var arr = toBase(n, base);
        return (arr.isNegative ? "-" : "") + arr.value.map(stringify).join("");
    }


    // BigInteger.prototype.toArray method.
    BigInteger.prototype.toArray = function (radix) {
        return toBase(this, radix);
    };


    // SmallInteger.prototype.toArray method.
    SmallInteger.prototype.toArray = function (radix) {
        return toBase(this, radix);
    };


    // BigInteger.prototype.toString method.
    BigInteger.prototype.toString = function (radix) {
        if (radix === undefined)
            { radix = 10; }
        if (radix !== 10)
            { return toBaseString(this, radix); }

        var v     = this.value,
            l     = v.length,
            str   = String(v[--l]), // Start with the most significant digit.
            zeros = "0000000",      // Helper string for padding with zeros.
            digit;

        // Concatenate digits, padding with leading zeros to maintain BASE-digit chunks.
        while (--l >= 0) {
            digit = String(v[l]);
            str  += zeros.slice(digit.length) + digit;
        }

        var sign = this.sign ? "-" : "";
        return sign + str;
    };


    // SmallInteger.prototype.toString method.
    SmallInteger.prototype.toString = function (radix) {
        if (radix === undefined)
            { radix = 10; }
        if (radix != 10)
            { return toBaseString(this, radix); }
        return String(this.value);
    };


    // BigInteger.prototype.toJSON (for JSON serialization).
    BigInteger.prototype.toJSON = SmallInteger.prototype.toJSON = function () {
        return this.toString();
    };


    // BigInteger.prototype.valueOf (for implicit type conversion to primitive).
    BigInteger.prototype.valueOf = function () {
        return parseInt(this.toString(), 10);
    };

    // Alias for valueOf.
    BigInteger.prototype.toJSNumber = BigInteger.prototype.valueOf;


    // SmallInteger.prototype.valueOf.
    SmallInteger.prototype.valueOf = function () {
        return this.value;
    };

    // Alias for valueOf.
    SmallInteger.prototype.toJSNumber = SmallInteger.prototype.valueOf;


    /**
     * Parses a string value into a BigInt. Handles scientific notation and checks for validity.
     * @param {string} v - The string to parse.
     * @returns {BigInteger|SmallInteger} The parsed number.
     * @throws {Error} If the string is not a valid integer representation.
     */
    function parseStringValue(v) {
        // If it fits in a precise JavaScript number, try SmallInteger first.
        if (isPrecise(+v)) {
            var x = +v;
            if (x === truncate(x))
                { return new SmallInteger(x); }
            throw new Error("Invalid integer: " + v);
        }

        var sign = v[0] === "-";
        if (sign)
            { v = v.slice(1); } // Remove sign for internal parsing.

        var split = v.split(/e/i); // Handle scientific notation (e.g., "1.23e+5").
        if (split.length > 2)
            { throw new Error("Invalid integer: " + split.join("e")); }

        if (split.length === 2) {
            var exp = split[1];
            if (exp[0] === "+")
                { exp = exp.slice(1); }
            exp = +exp; // Convert exponent to number.

            if (exp !== truncate(exp) || !isPrecise(exp))
                { throw new Error("Invalid integer: " + exp + " is not a valid exponent."); }

            var text        = split[0];
            var decimalPlace = text.indexOf(".");

            // Adjust exponent for decimal places.
            if (decimalPlace >= 0) {
                exp  -= text.length - decimalPlace - 1;
                text  = text.slice(0, decimalPlace) + text.slice(decimalPlace + 1);
            }

            if (exp < 0)
                { throw new Error("Cannot include negative exponent part for integers"); }

            text += new Array(exp + 1).join("0"); // Append zeros for the exponent.
            v     = text;
        }

        var isValid = /^([0-9][0-9]*)$/.test(v); // Validate the remaining string as a pure digit sequence.
        if (!isValid)
            { throw new Error("Invalid integer: " + v); }

        var r   = [],
            max = v.length,
            l   = LOG_BASE,
            min = max - l;

        // Split the string into chunks (digits) of base BASE.
        while (max > 0) {
            r.push(+v.slice(min, max));
            min -= l;
            if (min < 0)
                { min = 0; }
            max -= l;
        }

        trim(r); // Remove any leading zeros that might have resulted from parsing.

        return new BigInteger(r, sign);
    }


    /**
     * Parses a number value into a BigInt.
     * @param {number} v - The number to parse.
     * @returns {BigInteger|SmallInteger} The parsed number.
     * @throws {Error} If the number is not an integer.
     */
    function parseNumberValue(v) {
        if (isPrecise(v)) {
            if (v !== truncate(v))
                { throw new Error(v + " is not an integer."); }
            return new SmallInteger(v);
        }
        return parseStringValue(v.toString()); // Convert to string and parse if too large.
    }


    /**
     * Generic parse function, handles number, string, or existing BigInt/SmallInt.
     * This is the main entry point for `bigInt(value)` calls.
     * @param {number|string|BigInteger|SmallInteger} v - The value to parse.
     * @returns {BigInteger|SmallInteger} The parsed number.
     */
    function parseValue(v) {
        if (typeof v === "number") {
            return parseNumberValue(v);
        }
        if (typeof v === "string") {
            return parseStringValue(v);
        }
        // Assume it's already an Integer object (BigInteger or SmallInteger).
        return v;
    }


    // --- Initialization and Export ---

    // Pre-populate Integer cache for small numbers (0 to 999) for efficiency.
    for (var i = 0; i < 1e3; i++) {
        Integer[i] = new SmallInteger(i);
        if (i > 0)
            { Integer[-i] = new SmallInteger(-i); }
    }

    // Common constants for convenience.
    Integer.one      = Integer[1];
    Integer.zero     = Integer[0];
    Integer.minusOne = Integer[-1];

    // Export utility functions.
    Integer.max        = max;
    Integer.min        = min;
    Integer.gcd        = gcd;
    Integer.lcm        = lcm;
    Integer.isInstance = function (x) {
        return x instanceof BigInteger || x instanceof SmallInteger;
    };
    Integer.randBetween = randBetween;

    // From array constructor.
    Integer.fromArray = function (digits, base, isNegative) {
        return parseBaseFromArray(digits.map(parseValue), parseValue(base || 10), isNegative);
    };

    // Return the Integer factory function, which is assigned to `bigInt`.
    return Integer;
}();


// --- Main Application Logic ---
// This section reads input, performs a specific calculation involving BigInts,
// and outputs the result. It seems to be solving a problem related to counting
// trailing zeros in factorials or similar.

const main = arg => {

    // Process input: trim whitespace and split into lines.
    arg = arg.trim().split("\n");

    // Convert the first line of input to a BigInt.
    const N = bigInt(arg[0]);

    // Problem-specific logic:
    // If N is odd, the answer is 0.
    // The problem might be related to counting factors of 10 (2*5),
    // and if N is odd, there are no factors of 2.
    if (parseInt(N.divmod(2).remainder) !== 0) {
        console.log(0); // Output 0.
        return;         // Exit the function.
    }

    // Initialize an array to store powers of 5 (5, 25, 125, ...).
    let fives = [];
    // Start with the first power of 5.
    let times = bigInt(5);

    // Populate the 'fives' array.
    // Continue as long as N is greater than or equal to the current power of 5.
    while (N.greaterOrEquals(times)) {
        fives.push(times);
        times = times.multiply(5); // Calculate the next power of 5.
    }

    // Initialize a counter for the final result.
    let cnt = bigInt(0);

    // Iterate through the collected powers of 5.
    for (let i in fives) {
        // For each power of 5 (fives[i]), calculate N / (fives[i] * 2).
        // This is likely part of Legendre's formula or a similar counting method.
        const temp = N.divide(fives[i].multiply(2));

        // Add this calculated 'temp' value to the total count.
        cnt = cnt.add(temp);
    }

    // Print the final count as a string to console.
    console.log(cnt.toString());
};

// Read input from standard input and pass it to the main function.
main(require('fs').readFileSync('/dev/stdin', 'utf8'));