"use strict"; // Enforce strict mode for better error handling and cleaner code.

// This is a custom input reader class, designed to parse
// lines of text and extract values.
function I(s, f) {
    // Store the input string, split by newline characters, into an array.
    this._s = s.split("\n");
    // Initialize current column index for parsing.
    this._c = 0;
    // Initialize current line index for parsing.
    this._l = 0;
    // Store the parsing function, defaulting to Number if not provided.
    this._f = f || Number;
}

// Define methods for the I prototype.

// Method to read a single item from the current line.
I.prototype.a = function() {
    // Get the current line.
    var l = this._s[this._l];

    // If the line is empty or undefined, return immediately.
    if (!l)
        return;

    // Trim whitespace from the line and split it by spaces.
    var t = l.trim().split(" ");
    // Get the item at the current column index.
    var a = t[this._c];
    // Increment the column index for the next read.
    this._c++;

    // If all items on the current line have been read,
    // reset column and advance to the next line.
    if (t.length === this._c) {
        this._c = 0;
        this._l++;
    }

    // Apply the parsing function to the item and return it.
    return this._f(a);
};

// Method to read an entire line as an array of parsed items.
I.prototype.l = function() {
    // Get the current line.
    var l = this._s[this._l];

    // If the line is empty or undefined, return immediately.
    if (!l)
        return;

    // Reset the column index as we're processing the whole line.
    this._c = 0;
    // Advance to the next line.
    this._l++;

    // Split the line by spaces, apply the parsing function to each part, and return the array.
    return l.split(" ").map(this._f);
};



// The following code implements a BigInt library, providing arbitrary-precision integer arithmetic.
var bigInt = function(undefined) {
    "use strict";

    // Base for internal number representation (10^7).
    var BASE = 1e7;
    // Logarithm of the base, used for calculations.
    var LOG_BASE = 7;
    // Maximum safe integer in JavaScript.
    var MAX_INT = 9007199254740992;
    // Array representation of MAX_INT.
    var MAX_INT_ARR = smallToArray(MAX_INT);
    // Logarithm of MAX_INT.
    var LOG_MAX_INT = Math.log(MAX_INT);

    /**
     * Main constructor for Integer objects.
     * Handles various input types for creating a BigInt.
     * @param {number|string|BigInteger|SmallInteger} v The value to initialize with.
     * @param {number} [radix] The base of the input string if `v` is a string.
     * @returns {BigInteger|SmallInteger} An Integer object.
     */
    function Integer(v, radix) {
        if (typeof v === "undefined") {
            return Integer[0]; // Return zero if no value is provided.
        }

        if (typeof radix !== "undefined") {
            // If a radix is specified, parse accordingly.
            return +radix === 10 ? parseValue(v) : parseBase(v, radix);
        }

        // Default parsing for a single value.
        return parseValue(v);
    }

    /**
     * Constructor for BigInteger objects (large numbers).
     * @param {number[]} value An array of digits representing the number.
     * @param {boolean} sign True if negative, false if positive.
     */
    function BigInteger(value, sign) {
        this.value = value;
        this.sign = sign;
        this.isSmall = false; // Mark as a BigInteger.
    }

    // BigInteger inherits from Integer.
    BigInteger.prototype = Object.create(Integer.prototype);

    /**
     * Constructor for SmallInteger objects (numbers fitting in JS Number type).
     * @param {number} value The numerical value.
     */
    function SmallInteger(value) {
        this.value = value;
        this.sign = value < 0;
        this.isSmall = true; // Mark as a SmallInteger.
    }

    // SmallInteger inherits from Integer.
    SmallInteger.prototype = Object.create(Integer.prototype);

    /**
     * Checks if a number can be precisely represented by JavaScript's Number type.
     * @param {number} n The number to check.
     * @returns {boolean} True if precise, false otherwise.
     */
    function isPrecise(n) {
        return -MAX_INT < n && n < MAX_INT;
    }

    /**
     * Converts a small integer into its array representation (base BASE).
     * @param {number} n The small integer.
     * @returns {number[]} Array representation.
     */
    function smallToArray(n) {
        if (n < BASE) {
            return [n];
        }
        if (n < BASE * BASE) {
            return [n % BASE, Math.floor(n / BASE)];
        }
        return [n % BASE, Math.floor(n / BASE) % BASE, Math.floor(n / (BASE * BASE))];
    }

    /**
     * Converts an array representation (base BASE) back to a small integer if possible.
     * @param {number[]} arr The array representation.
     * @returns {number|number[]} The small integer or the original array if too large.
     */
    function arrayToSmall(arr) {
        trim(arr); // Remove leading zeros.
        var length = arr.length;

        // If the array is small enough and fits within MAX_INT, convert to a number.
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
        return arr; // Return the array if it's too large for a small integer.
    }

    /**
     * Removes leading zeros from an array of digits.
     * @param {number[]} v The array to trim.
     */
    function trim(v) {
        var i = v.length;
        while (v[--i] === 0); // Find the last non-zero digit.
        v.length = i + 1; // Resize the array.
    }

    /**
     * Creates a new array filled with zeros.
     * @param {number} length The desired length of the array.
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
     * Truncates a number (removes decimal part).
     * @param {number} n The number to truncate.
     * @returns {number} The truncated integer.
     */
    function truncate(n) {
        if (n > 0) {
            return Math.floor(n);
        }
        return Math.ceil(n);
    }

    /**
     * Adds two arrays of digits (representing numbers) together.
     * Assumes a is longer than or equal to b.
     * @param {number[]} a The first array.
     * @param {number[]} b The second array.
     * @returns {number[]} The sum array.
     */
    function add(a, b) {
        var l_a = a.length,
            l_b = b.length,
            r = new Array(l_a),
            carry = 0,
            base = BASE,
            sum, i;

        for (i = 0; i < l_b; i++) {
            sum = a[i] + b[i] + carry;
            carry = sum >= base ? 1 : 0;
            r[i] = sum - carry * base;
        }
        while (i < l_a) {
            sum = a[i] + carry;
            carry = sum === base ? 1 : 0;
            r[i++] = sum - carry * base;
        }
        if (carry > 0) {
            r.push(carry);
        }
        return r;
    }

    /**
     * Adds two arrays of digits, handling different lengths.
     * @param {number[]} a The first array.
     * @param {number[]} b The second array.
     * @returns {number[]} The sum array.
     */
    function addAny(a, b) {
        if (a.length >= b.length) {
            return add(a, b);
        }
        return add(b, a);
    }

    /**
     * Adds a small number (carry) to an array of digits.
     * @param {number[]} a The array of digits.
     * @param {number} carry The small number to add.
     * @returns {number[]} The sum array.
     */
    function addSmall(a, carry) {
        var l = a.length,
            r = new Array(l),
            base = BASE,
            sum, i;

        for (i = 0; i < l; i++) {
            sum = a[i] - base + carry; // Optimization: sum - base to get a negative value, then add base if positive.
            carry = Math.floor(sum / base);
            r[i] = sum - carry * base;
            carry += 1; // Adjust carry because of the -base.
        }
        while (carry > 0) {
            r[i++] = carry % base;
            carry = Math.floor(carry / base);
        }
        return r;
    }

    // BigInteger addition method.
    BigInteger.prototype.add = function(v) {
        var n = parseValue(v); // Parse the input value.

        if (this.sign !== n.sign) {
            // If signs are different, perform subtraction.
            return this.subtract(n.negate());
        }

        var a = this.value,
            b = n.value;

        if (n.isSmall) {
            // If 'n' is a small integer, optimize addition.
            return new BigInteger(addSmall(a, Math.abs(b)), this.sign);
        }
        // Otherwise, perform general array addition.
        return new BigInteger(addAny(a, b), this.sign);
    };

    // Alias for add.
    BigInteger.prototype.plus = BigInteger.prototype.add;

    // SmallInteger addition method.
    SmallInteger.prototype.add = function(v) {
        var n = parseValue(v); // Parse the input value.
        var a = this.value;

        if (a < 0 !== n.sign) {
            // If signs are different, perform subtraction.
            return this.subtract(n.negate());
        }

        var b = n.value;

        if (n.isSmall) {
            // If both are small integers, try direct addition.
            if (isPrecise(a + b)) {
                return new SmallInteger(a + b);
            }
            // If direct addition overflows, convert 'b' to array.
            b = smallToArray(Math.abs(b));
        }

        // Perform array addition.
        return new BigInteger(addSmall(b, Math.abs(a)), a < 0);
    };

    // Alias for add.
    SmallInteger.prototype.plus = SmallInteger.prototype.add;

    /**
     * Subtracts array b from array a.
     * Assumes a is greater than or equal to b.
     * @param {number[]} a The minuend array.
     * @param {number[]} b The subtrahend array.
     * @returns {number[]} The difference array.
     */
    function subtract(a, b) {
        var a_l = a.length,
            b_l = b.length,
            r = new Array(a_l),
            borrow = 0,
            base = BASE,
            i, difference;

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

        // Handle remaining digits in 'a'.
        for (i = b_l; i < a_l; i++) {
            difference = a[i] - borrow;
            if (difference < 0) {
                difference += base;
            } else {
                r[i++] = difference;
                break;
            }
            r[i] = difference;
        }

        // Copy any remaining digits.
        for (; i < a_l; i++) {
            r[i] = a[i];
        }

        trim(r); // Remove leading zeros.
        return r;
    }

    /**
     * Subtracts two arrays of digits, handling signs and order.
     * @param {number[]} a The first array.
     * @param {number[]} b The second array.
     * @param {boolean} sign The initial sign before comparison.
     * @returns {BigInteger|SmallInteger} The result.
     */
    function subtractAny(a, b, sign) {
        var value;

        if (compareAbs(a, b) >= 0) {
            value = subtract(a, b);
        } else {
            value = subtract(b, a);
            sign = !sign; // Flip sign if b was larger.
        }

        value = arrayToSmall(value); // Convert to small integer if possible.

        if (typeof value === "number") {
            if (sign) {
                value = -value;
            }
            return new SmallInteger(value);
        }
        return new BigInteger(value, sign);
    }

    /**
     * Subtracts a small number from an array of digits.
     * @param {number[]} a The minuend array.
     * @param {number} b The small subtrahend.
     * @param {boolean} sign The sign of the minuend.
     * @returns {BigInteger|SmallInteger} The result.
     */
    function subtractSmall(a, b, sign) {
        var l = a.length,
            r = new Array(l),
            carry = -b, // Negative carry for subtraction.
            base = BASE,
            i, difference;

        for (i = 0; i < l; i++) {
            difference = a[i] + carry;
            carry = Math.floor(difference / base);
            difference %= base;
            r[i] = difference < 0 ? difference + base : difference; // Ensure positive digit.
        }

        r = arrayToSmall(r); // Convert to small integer if possible.

        if (typeof r === "number") {
            if (sign) {
                r = -r;
            }
            return new SmallInteger(r);
        }
        return new BigInteger(r, sign);
    }

    // BigInteger subtraction method.
    BigInteger.prototype.subtract = function(v) {
        var n = parseValue(v); // Parse input value.

        if (this.sign !== n.sign) {
            // If signs are different, perform addition.
            return this.add(n.negate());
        }

        var a = this.value,
            b = n.value;

        if (n.isSmall) {
            // If 'n' is a small integer, optimize subtraction.
            return subtractSmall(a, Math.abs(b), this.sign);
        }
        // Otherwise, perform general array subtraction.
        return subtractAny(a, b, this.sign);
    };

    // Alias for subtract.
    BigInteger.prototype.minus = BigInteger.prototype.subtract;

    // SmallInteger subtraction method.
    SmallInteger.prototype.subtract = function(v) {
        var n = parseValue(v); // Parse input value.
        var a = this.value;

        if (a < 0 !== n.sign) {
            // If signs are different, perform addition.
            return this.add(n.negate());
        }

        var b = n.value;

        if (n.isSmall) {
            // If both are small integers, try direct subtraction.
            return new SmallInteger(a - b);
        }

        // Perform array subtraction.
        return subtractSmall(b, Math.abs(a), a >= 0);
    };

    // Alias for subtract.
    SmallInteger.prototype.minus = SmallInteger.prototype.subtract;

    // BigInteger negation method.
    BigInteger.prototype.negate = function() {
        return new BigInteger(this.value, !this.sign);
    };

    // SmallInteger negation method.
    SmallInteger.prototype.negate = function() {
        var sign = this.sign;
        var small = new SmallInteger(-this.value);
        small.sign = !sign; // Explicitly set sign for consistency.
        return small;
    };

    // BigInteger absolute value method.
    BigInteger.prototype.abs = function() {
        return new BigInteger(this.value, false);
    };

    // SmallInteger absolute value method.
    SmallInteger.prototype.abs = function() {
        return new SmallInteger(Math.abs(this.value));
    };

    /**
     * Multiplies two arrays of digits using standard long multiplication.
     * @param {number[]} a The first array.
     * @param {number[]} b The second array.
     * @returns {number[]} The product array.
     */
    function multiplyLong(a, b) {
        var a_l = a.length,
            b_l = b.length,
            l = a_l + b_l,
            r = createArray(l), // Result array, max length is sum of input lengths.
            base = BASE,
            product, carry, i, a_i, b_j;

        for (i = 0; i < a_l; ++i) {
            a_i = a[i];
            for (var j = 0; j < b_l; ++j) {
                b_j = b[j];
                product = a_i * b_j + r[i + j]; // Add existing carry from previous multiplications.
                carry = Math.floor(product / base);
                r[i + j] = product - carry * base;
                r[i + j + 1] += carry; // Add carry to the next position.
            }
        }

        trim(r); // Remove leading zeros.
        return r;
    }

    /**
     * Multiplies an array of digits by a small integer.
     * @param {number[]} a The array of digits.
     * @param {number} b The small integer multiplier.
     * @returns {number[]} The product array.
     */
    function multiplySmall(a, b) {
        var l = a.length,
            r = new Array(l),
            base = BASE,
            carry = 0,
            product, i;

        for (i = 0; i < l; i++) {
            product = a[i] * b + carry;
            carry = Math.floor(product / base);
            r[i] = product - carry * base;
        }

        while (carry > 0) {
            r[i++] = carry % base;
            carry = Math.floor(carry / base);
        }
        return r;
    }

    /**
     * Shifts an array of digits left by 'n' positions (multiplies by BASE^n).
     * @param {number[]} x The array to shift.
     * @param {number} n The number of positions to shift.
     * @returns {number[]} The shifted array.
     */
    function shiftLeft(x, n) {
        var r = [];
        while (n-- > 0) {
            r.push(0);
        }
        return r.concat(x);
    }

    /**
     * Multiplies two arrays of digits using Karatsuba algorithm for large numbers.
     * @param {number[]} x The first array.
     * @param {number[]} y The second array.
     * @returns {number[]} The product array.
     */
    function multiplyKaratsuba(x, y) {
        var n = Math.max(x.length, y.length);

        // Base case: if numbers are small, use long multiplication.
        if (n <= 30) {
            return multiplyLong(x, y);
        }

        // Split numbers into two halves.
        n = Math.ceil(n / 2);
        var b = x.slice(n),
            a = x.slice(0, n),
            d = y.slice(n),
            c = y.slice(0, n);

        // Recursively compute products.
        var ac = multiplyKaratsuba(a, c),
            bd = multiplyKaratsuba(b, d),
            abcd = multiplyKaratsuba(addAny(a, b), addAny(c, d));

        // Combine results using Karatsuba formula: ac * (BASE^(2n)) + ((a+b)(c+d) - ac - bd) * (BASE^n) + bd
        var product = addAny(addAny(ac, shiftLeft(subtract(subtract(abcd, ac), bd), n)), shiftLeft(bd, 2 * n));

        trim(product); // Remove leading zeros.
        return product;
    }

    /**
     * Heuristic to decide whether to use Karatsuba multiplication.
     * @param {number} l1 Length of the first number.
     * @param {number} l2 Length of the second number.
     * @returns {boolean} True if Karatsuba should be used.
     */
    function useKaratsuba(l1, l2) {
        // This is an empirical threshold for when Karatsuba becomes faster.
        return -.012 * l1 - .012 * l2 + 15e-6 * l1 * l2 > 0;
    }

    // BigInteger multiplication method.
    BigInteger.prototype.multiply = function(v) {
        var n = parseValue(v),
            a = this.value,
            b = n.value,
            sign = this.sign !== n.sign,
            abs;

        if (n.isSmall) {
            if (b === 0) return Integer[0];
            if (b === 1) return this;
            if (b === -1) return this.negate();

            abs = Math.abs(b);
            if (abs < BASE) {
                // Optimize for multiplication by a single digit small integer.
                return new BigInteger(multiplySmall(a, abs), sign);
            }
            // Convert small integer to array for general multiplication.
            b = smallToArray(abs);
        }

        // Decide between Karatsuba and long multiplication.
        if (useKaratsuba(a.length, b.length)) {
            return new BigInteger(multiplyKaratsuba(a, b), sign);
        }

        return new BigInteger(multiplyLong(a, b), sign);
    };

    // Alias for multiply.
    BigInteger.prototype.times = BigInteger.prototype.multiply;

    /**
     * Multiplies a small integer by an array of digits.
     * @param {number} a The small integer.
     * @param {number[]} b The array of digits.
     * @param {boolean} sign The sign of the result.
     * @returns {BigInteger} The product.
     */
    function multiplySmallAndArray(a, b, sign) {
        if (a < BASE) {
            // If small integer is a single digit within base, use optimized multiplySmall.
            return new BigInteger(multiplySmall(b, a), sign);
        }
        // Otherwise, convert small integer to array and use long multiplication.
        return new BigInteger(multiplyLong(b, smallToArray(a)), sign);
    }

    // Internal helper for SmallInteger to multiply by another SmallInteger.
    SmallInteger.prototype._multiplyBySmall = function(a) {
        // Try direct multiplication if it fits within precise integer limits.
        if (isPrecise(a.value * this.value)) {
            return new SmallInteger(a.value * this.value);
        }
        // Fallback to array multiplication.
        return multiplySmallAndArray(Math.abs(a.value), smallToArray(Math.abs(this.value)), this.sign !== a.sign);
    };

    // Internal helper for BigInteger to multiply by a SmallInteger.
    BigInteger.prototype._multiplyBySmall = function(a) {
        if (a.value === 0) return Integer[0];
        if (a.value === 1) return this;
        if (a.value === -1) return this.negate();
        // Use multiplySmallAndArray.
        return multiplySmallAndArray(Math.abs(a.value), this.value, this.sign !== a.sign);
    };

    // SmallInteger multiplication method.
    SmallInteger.prototype.multiply = function(v) {
        // Parse the value and delegate to the internal helper.
        return parseValue(v)._multiplyBySmall(this);
    };

    // Alias for multiply.
    SmallInteger.prototype.times = SmallInteger.prototype.multiply;

    /**
     * Squares an array of digits.
     * @param {number[]} a The array to square.
     * @returns {number[]} The squared array.
     */
    function square(a) {
        var l = a.length,
            r = createArray(l + l), // Max length is 2*l.
            base = BASE,
            product, carry, i, a_i, a_j;

        for (i = 0; i < l; i++) {
            a_i = a[i];
            carry = 0 - a_i * a_i; // Initialize carry with negative self-product.

            for (var j = i; j < l; j++) {
                a_j = a[j];
                // Formula for squaring: (sum a_i * BASE^i)^2 = sum a_i^2 * BASE^(2i) + sum 2*a_i*a_j * BASE^(i+j)
                // The 2*a_i*a_j term handles off-diagonal elements.
                product = 2 * (a_i * a_j) + r[i + j] + carry;
                carry = Math.floor(product / base);
                r[i + j] = product - carry * base;
            }
            r[i + l] = carry; // Store final carry.
        }

        trim(r); // Remove leading zeros.
        return r;
    }

    // BigInteger square method.
    BigInteger.prototype.square = function() {
        return new BigInteger(square(this.value), false);
    };

    // SmallInteger square method.
    SmallInteger.prototype.square = function() {
        var value = this.value * this.value;
        if (isPrecise(value)) {
            return new SmallInteger(value);
        }
        return new BigInteger(square(smallToArray(Math.abs(this.value))), false);
    };

    /**
     * Division and modulo using Knuth's algorithm D (normalized division).
     * Optimized for specific cases.
     * @param {number[]} a The dividend array.
     * @param {number[]} b The divisor array.
     * @returns {Array<number[]|number>} An array containing [quotient, remainder].
     */
    function divMod1(a, b) {
        var a_l = a.length,
            b_l = b.length,
            base = BASE,
            result = createArray(b.length),
            divisorMostSignificantDigit = b[b_l - 1],
            // Normalization factor.
            lambda = Math.ceil(base / (2 * divisorMostSignificantDigit)),
            remainder = multiplySmall(a, lambda),
            divisor = multiplySmall(b, lambda),
            quotientDigit, shift, carry, borrow, i, l, q;

        if (remainder.length <= a_l) {
            remainder.push(0); // Ensure remainder is long enough.
        }
        divisor.push(0); // Pad divisor.
        divisorMostSignificantDigit = divisor[b_l - 1]; // Update after normalization.

        for (shift = a_l - b_l; shift >= 0; shift--) {
            quotientDigit = base - 1; // Initial guess for quotient digit.

            // Refine guess if leading digits don't match.
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

            // Adjust quotientDigit if subtraction resulted in negative borrow.
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
            result[shift] = quotientDigit; // Store the quotient digit.
        }

        // Denormalize the remainder.
        remainder = divModSmall(remainder, lambda)[0];

        return [arrayToSmall(result), arrayToSmall(remainder)];
    }

    /**
     * Division and modulo using a simpler, iterative subtraction method.
     * Used for smaller numbers where Knuth's algorithm D overhead is not justified.
     * @param {number[]} a The dividend array.
     * @param {number[]} b The divisor array.
     * @returns {Array<number[]|number>} An array containing [quotient, remainder].
     */
    function divMod2(a, b) {
        var a_l = a.length,
            b_l = b.length,
            result = [],
            part = [],
            base = BASE,
            guess, xlen, highx, highy, check;

        while (a_l) {
            part.unshift(a[--a_l]); // Take digits from dividend one by one.
            trim(part); // Remove leading zeros from the current part.

            if (compareAbs(part, b) < 0) {
                result.push(0); // If part is smaller than divisor, quotient digit is 0.
                continue;
            }

            xlen = part.length;
            highx = part[xlen - 1] * base + part[xlen - 2]; // Top two digits of part.
            highy = b[b_l - 1] * base + b[b_l - 2]; // Top two digits of divisor.

            if (xlen > b_l) {
                highx = (highx + 1) * base; // Adjust if part is longer.
            }

            guess = Math.ceil(highx / highy); // Initial guess for quotient digit.

            do {
                check = multiplySmall(b, guess); // Multiply divisor by guess.
                if (compareAbs(check, part) <= 0) {
                    break; // If check <= part, guess is good.
                }
                guess--; // Otherwise, reduce guess.
            } while (guess);

            result.push(guess); // Store the quotient digit.
            part = subtract(part, check); // Subtract from part.
        }

        result.reverse(); // Reverse result to get correct order.
        return [arrayToSmall(result), arrayToSmall(part)];
    }

    /**
     * Divides an array of digits by a small integer.
     * @param {number[]} value The dividend array.
     * @param {number} lambda The small integer divisor.
     * @returns {Array<number[]|number>} An array containing [quotient, remainder].
     */
    function divModSmall(value, lambda) {
        var length = value.length,
            quotient = createArray(length),
            base = BASE,
            i, q, remainder, divisor;

        remainder = 0;
        for (i = length - 1; i >= 0; --i) {
            divisor = remainder * base + value[i];
            q = truncate(divisor / lambda);
            remainder = divisor - q * lambda;
            quotient[i] = q | 0; // Ensure integer.
        }

        return [quotient, remainder | 0];
    }

    /**
     * Performs division and modulo for any BigInt or SmallInt.
     * @param {BigInteger|SmallInteger} self The dividend.
     * @param {BigInteger|SmallInteger|number|string} v The divisor.
     * @returns {Array<BigInteger|SmallInteger>} An array containing [quotient, remainder].
     */
    function divModAny(self, v) {
        var value, n = parseValue(v);
        var a = self.value,
            b = n.value;
        var quotient;

        if (b === 0) {
            throw new Error("Cannot divide by zero");
        }

        if (self.isSmall) {
            if (n.isSmall) {
                // Both small integers, direct division.
                return [new SmallInteger(truncate(a / b)), new SmallInteger(a % b)];
            }
            // Small dividend, large divisor -> quotient 0, remainder self.
            return [Integer[0], self];
        }

        if (n.isSmall) {
            if (b === 1) return [self, Integer[0]];
            if (b == -1) return [self.negate(), Integer[0]];

            var abs = Math.abs(b);
            if (abs < BASE) {
                // Optimized division by small integer.
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
            // Convert small divisor to array.
            b = smallToArray(abs);
        }

        var comparison = compareAbs(a, b);

        if (comparison === -1) {
            // Dividend < divisor, quotient 0, remainder dividend.
            return [Integer[0], self];
        }
        if (comparison === 0) {
            // Dividend == divisor, quotient 1 or -1, remainder 0.
            return [Integer[self.sign === n.sign ? 1 : -1], Integer[0]];
        }

        // Choose division algorithm based on size.
        if (a.length + b.length <= 200) {
            value = divMod1(a, b);
        } else {
            value = divMod2(a, b);
        }

        quotient = value[0];
        var qSign = self.sign !== n.sign,
            mod = value[1],
            mSign = self.sign;

        // Convert quotient to appropriate Integer type.
        if (typeof quotient === "number") {
            if (qSign) {
                quotient = -quotient;
            }
            quotient = new SmallInteger(quotient);
        } else {
            quotient = new BigInteger(quotient, qSign);
        }

        // Convert remainder to appropriate Integer type.
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

    // BigInteger divmod method.
    BigInteger.prototype.divmod = function(v) {
        var result = divModAny(this, v);
        return {
            quotient: result[0],
            remainder: result[1]
        };
    };

    // SmallInteger divmod method.
    SmallInteger.prototype.divmod = BigInteger.prototype.divmod;

    // BigInteger divide method (returns quotient).
    BigInteger.prototype.divide = function(v) {
        return divModAny(this, v)[0];
    };

    // Aliases for divide.
    SmallInteger.prototype.over = SmallInteger.prototype.divide = BigInteger.prototype.over = BigInteger.prototype.divide;

    // BigInteger modulo method (returns remainder).
    BigInteger.prototype.mod = function(v) {
        return divModAny(this, v)[1];
    };

    // Aliases for mod.
    SmallInteger.prototype.remainder = SmallInteger.prototype.mod = BigInteger.prototype.remainder = BigInteger.prototype.mod;

    // BigInteger power method.
    BigInteger.prototype.pow = function(v) {
        var n = parseValue(v),
            a = this.value,
            b = n.value,
            value, x, y;

        if (b === 0) return Integer[1]; // x^0 = 1.
        if (a === 0) return Integer[0]; // 0^x = 0 (for x > 0).
        if (a === 1) return Integer[1]; // 1^x = 1.
        if (a === -1) return n.isEven() ? Integer[1] : Integer[-1]; // (-1)^x.

        if (n.sign) {
            // Negative exponent, result is 0 for integers.
            return Integer[0];
        }

        if (!n.isSmall) {
            throw new Error("The exponent " + n.toString() + " is too large.");
        }

        if (this.isSmall) {
            // If base is small, try direct Math.pow.
            if (isPrecise(value = Math.pow(a, b))) {
                return new SmallInteger(truncate(value));
            }
        }

        // Binary exponentiation (exponentiation by squaring).
        x = this;
        y = Integer[1]; // Initialize result to 1.
        while (true) {
            if (b & 1 === 1) { // If exponent is odd.
                y = y.times(x);
                --b;
            }
            if (b === 0) break; // If exponent is 0, done.
            b /= 2; // Divide exponent by 2.
            x = x.square(); // Square the base.
        }
        return y;
    };

    // SmallInteger power method.
    SmallInteger.prototype.pow = BigInteger.prototype.pow;

    // BigInteger modular exponentiation method.
    BigInteger.prototype.modPow = function(exp, mod) {
        exp = parseValue(exp);
        mod = parseValue(mod);

        if (mod.isZero()) {
            throw new Error("Cannot take modPow with modulus 0");
        }

        var r = Integer[1], // Result initialized to 1.
            base = this.mod(mod); // Base modulo modulus.

        while (exp.isPositive()) {
            if (base.isZero()) {
                return Integer[0]; // 0^exp mod mod = 0.
            }
            if (exp.isOdd()) {
                r = r.multiply(base).mod(mod); // If exponent is odd, multiply result by base.
            }
            exp = exp.divide(2); // Halve the exponent.
            base = base.square().mod(mod); // Square the base.
        }
        return r;
    };

    // SmallInteger modular exponentiation method.
    SmallInteger.prototype.modPow = BigInteger.prototype.modPow;

    /**
     * Compares the absolute values of two arrays of digits.
     * @param {number[]} a The first array.
     * @param {number[]} b The second array.
     * @returns {number} -1 if a < b, 0 if a == b, 1 if a > b.
     */
    function compareAbs(a, b) {
        if (a.length !== b.length) {
            return a.length > b.length ? 1 : -1;
        }
        for (var i = a.length - 1; i >= 0; i--) {
            if (a[i] !== b[i]) {
                return a[i] > b[i] ? 1 : -1;
            }
        }
        return 0;
    }

    // BigInteger absolute comparison method.
    BigInteger.prototype.compareAbs = function(v) {
        var n = parseValue(v),
            a = this.value,
            b = n.value;

        if (n.isSmall) {
            // If 'n' is small, 'this' (BigInteger) is always larger in magnitude.
            return 1;
        }
        return compareAbs(a, b);
    };

    // SmallInteger absolute comparison method.
    SmallInteger.prototype.compareAbs = function(v) {
        var n = parseValue(v),
            a = Math.abs(this.value),
            b = n.value;

        if (n.isSmall) {
            // Both small integers, direct comparison.
            b = Math.abs(b);
            return a === b ? 0 : a > b ? 1 : -1;
        }
        // SmallInteger is always smaller in magnitude than a BigInteger.
        return -1;
    };

    // BigInteger comparison method.
    BigInteger.prototype.compare = function(v) {
        if (v === Infinity) {
            return -1;
        }
        if (v === -Infinity) {
            return 1;
        }

        var n = parseValue(v),
            a = this.value,
            b = n.value;

        if (this.sign !== n.sign) {
            // Different signs: positive > negative.
            return n.sign ? 1 : -1;
        }

        if (n.isSmall) {
            // If 'n' is small and 'this' is BigInt, 'this' is larger in magnitude.
            // Sign determines actual comparison.
            return this.sign ? -1 : 1;
        }
        // Compare absolute values and apply sign.
        return compareAbs(a, b) * (this.sign ? -1 : 1);
    };

    // Alias for compare.
    BigInteger.prototype.compareTo = BigInteger.prototype.compare;

    // SmallInteger comparison method.
    SmallInteger.prototype.compare = function(v) {
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
            // Both small integers, direct comparison.
            return a == b ? 0 : a > b ? 1 : -1;
        }

        if (a < 0 !== n.sign) {
            // Different signs: positive > negative.
            return a < 0 ? -1 : 1;
        }
        // If same sign, BigInteger is larger in magnitude.
        // If 'a' is negative, it's smaller than the BigInteger.
        return a < 0 ? 1 : -1;
    };

    // Alias for compare.
    SmallInteger.prototype.compareTo = SmallInteger.prototype.compare;

    // BigInteger equality check.
    BigInteger.prototype.equals = function(v) {
        return this.compare(v) === 0;
    };

    // Aliases for equals.
    SmallInteger.prototype.eq = SmallInteger.prototype.equals = BigInteger.prototype.eq = BigInteger.prototype.equals;

    // BigInteger inequality check.
    BigInteger.prototype.notEquals = function(v) {
        return this.compare(v) !== 0;
    };

    // Aliases for notEquals.
    SmallInteger.prototype.neq = SmallInteger.prototype.notEquals = BigInteger.prototype.neq = BigInteger.prototype.notEquals;

    // BigInteger greater than check.
    BigInteger.prototype.greater = function(v) {
        return this.compare(v) > 0;
    };

    // Aliases for greater.
    SmallInteger.prototype.gt = SmallInteger.prototype.greater = BigInteger.prototype.gt = BigInteger.prototype.greater;

    // BigInteger lesser than check.
    BigInteger.prototype.lesser = function(v) {
        return this.compare(v) < 0;
    };

    // Aliases for lesser.
    SmallInteger.prototype.lt = SmallInteger.prototype.lesser = BigInteger.prototype.lt = BigInteger.prototype.lesser;

    // BigInteger greater than or equals check.
    BigInteger.prototype.greaterOrEquals = function(v) {
        return this.compare(v) >= 0;
    };

    // Aliases for greaterOrEquals.
    SmallInteger.prototype.geq = SmallInteger.prototype.greaterOrEquals = BigInteger.prototype.geq = BigInteger.prototype.greaterOrEquals;

    // BigInteger lesser than or equals check.
    BigInteger.prototype.lesserOrEquals = function(v) {
        return this.compare(v) <= 0;
    };

    // Aliases for lesserOrEquals.
    SmallInteger.prototype.leq = SmallInteger.prototype.lesserOrEquals = BigInteger.prototype.leq = BigInteger.prototype.lesserOrEquals;

    // BigInteger even check (based on the least significant digit).
    BigInteger.prototype.isEven = function() {
        return (this.value[0] & 1) === 0;
    };

    // SmallInteger even check.
    SmallInteger.prototype.isEven = function() {
        return (this.value & 1) === 0;
    };

    // BigInteger odd check.
    BigInteger.prototype.isOdd = function() {
        return (this.value[0] & 1) === 1;
    };

    // SmallInteger odd check.
    SmallInteger.prototype.isOdd = function() {
        return (this.value & 1) === 1;
    };

    // BigInteger positive check.
    BigInteger.prototype.isPositive = function() {
        return !this.sign;
    };

    // SmallInteger positive check.
    SmallInteger.prototype.isPositive = function() {
        return this.value > 0;
    };

    // BigInteger negative check.
    BigInteger.prototype.isNegative = function() {
        return this.sign;
    };

    // SmallInteger negative check.
    SmallInteger.prototype.isNegative = function() {
        return this.value < 0;
    };

    // BigInteger unit check (magnitude 1).
    BigInteger.prototype.isUnit = function() {
        return false;
    };

    // SmallInteger unit check.
    SmallInteger.prototype.isUnit = function() {
        return Math.abs(this.value) === 1;
    };

    // BigInteger zero check.
    BigInteger.prototype.isZero = function() {
        return false;
    };

    // SmallInteger zero check.
    SmallInteger.prototype.isZero = function() {
        return this.value === 0;
    };

    // BigInteger divisibility check.
    BigInteger.prototype.isDivisibleBy = function(v) {
        var n = parseValue(v);
        var value = n.value;

        if (value === 0) return false; // Cannot divide by zero.
        if (value === 1) return true; // Divisible by 1.
        if (value === 2) return this.isEven(); // Optimized check for 2.

        return this.mod(n).equals(Integer[0]); // Check if remainder is zero.
    };

    // SmallInteger divisibility check.
    SmallInteger.prototype.isDivisibleBy = BigInteger.prototype.isDivisibleBy;

    /**
     * Checks for basic primality (small primes and common factors).
     * @param {BigInteger|SmallInteger} v The number to check.
     * @returns {boolean|undefined} True if prime, false if composite, undefined if more tests needed.
     */
    function isBasicPrime(v) {
        var n = v.abs();
        if (n.isUnit()) return false; // 1 is not prime.
        if (n.equals(2) || n.equals(3) || n.equals(5)) return true; // Smallest primes.
        if (n.isEven() || n.isDivisibleBy(3) || n.isDivisibleBy(5)) return false; // Divisible by 2, 3, or 5.
        if (n.lesser(25)) return true; // Numbers under 25 not caught above (7, 11, 13, 17, 19, 23) are prime.
    }

    // BigInteger primality test (Miller-Rabin for larger numbers).
    BigInteger.prototype.isPrime = function() {
        var isPrime = isBasicPrime(this);
        if (isPrime !== undefined) return isPrime; // Return early if basic test is conclusive.

        var n = this.abs(),
            nPrev = n.prev(); // n-1.
        var a = [2, 3, 5, 7, 11, 13, 17, 19], // Small test primes.
            b = nPrev,
            d, t, i, x;

        while (b.isEven()) {
            b = b.divide(2); // Find d such that n-1 = 2^s * d.
        }

        for (i = 0; i < a.length; i++) {
            // Miller-Rabin test for each 'a'.
            x = bigInt(a[i]).modPow(b, n); // x = a^d mod n.

            if (x.equals(Integer[1]) || x.equals(nPrev)) {
                continue; // Passes if x == 1 or x == n-1.
            }

            for (t = true, d = b; t && d.lesser(nPrev); d = d.multiply(2)) {
                x = x.square().mod(n); // x = x^2 mod n.
                if (x.equals(nPrev)) {
                    t = false; // Passes if x == n-1.
                }
            }
            if (t) return false; // Failed Miller-Rabin test.
        }
        return true; // Likely prime.
    };

    // SmallInteger primality test.
    SmallInteger.prototype.isPrime = BigInteger.prototype.isPrime;

    // BigInteger probable prime test (Miller-Rabin with configurable iterations).
    BigInteger.prototype.isProbablePrime = function(iterations) {
        var isPrime = isBasicPrime(this);
        if (isPrime !== undefined) return isPrime;

        var n = this.abs();
        var t = iterations === undefined ? 5 : iterations; // Default iterations to 5.

        for (var i = 0; i < t; i++) {
            var a = bigInt.randBetween(2, n.minus(2)); // Random base 'a'.
            if (!a.modPow(n.prev(), n).isUnit()) {
                return false; // Fails Miller-Rabin.
            }
        }
        return true; // Probably prime.
    };

    // SmallInteger probable prime test.
    SmallInteger.prototype.isProbablePrime = BigInteger.prototype.isProbablePrime;

    // BigInteger modular inverse method (using extended Euclidean algorithm).
    BigInteger.prototype.modInv = function(n) {
        var t = bigInt.zero,
            newT = bigInt.one,
            r = parseValue(n),
            newR = this.abs(),
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

        if (t.compare(0) === -1) {
            t = t.add(n); // Ensure result is positive.
        }
        if (this.isNegative()) {
            return t.negate();
        }
        return t;
    };

    // SmallInteger modular inverse method.
    SmallInteger.prototype.modInv = BigInteger.prototype.modInv;

    // BigInteger next (increment by 1) method.
    BigInteger.prototype.next = function() {
        var value = this.value;
        if (this.sign) {
            // If negative, decrement absolute value and keep negative.
            return subtractSmall(value, 1, this.sign);
        }
        // If positive, increment absolute value.
        return new BigInteger(addSmall(value, 1), this.sign);
    };

    // SmallInteger next (increment by 1) method.
    SmallInteger.prototype.next = function() {
        var value = this.value;
        if (value + 1 < MAX_INT) {
            return new SmallInteger(value + 1);
        }
        // If overflows, convert to BigInteger.
        return new BigInteger(MAX_INT_ARR, false);
    };

    // BigInteger prev (decrement by 1) method.
    BigInteger.prototype.prev = function() {
        var value = this.value;
        if (this.sign) {
            // If negative, increment absolute value and keep negative.
            return new BigInteger(addSmall(value, 1), true);
        }
        // If positive, decrement absolute value.
        return subtractSmall(value, 1, this.sign);
    };

    // SmallInteger prev (decrement by 1) method.
    SmallInteger.prototype.prev = function() {
        var value = this.value;
        if (value - 1 > -MAX_INT) {
            return new SmallInteger(value - 1);
        }
        // If underflows, convert to BigInteger.
        return new BigInteger(MAX_INT_ARR, true);
    };

    // Precomputed powers of 2 for efficient shifting.
    var powersOfTwo = [1];
    while (2 * powersOfTwo[powersOfTwo.length - 1] <= BASE) {
        powersOfTwo.push(2 * powersOfTwo[powersOfTwo.length - 1]);
    }
    var powers2Length = powersOfTwo.length,
        highestPower2 = powersOfTwo[powers2Length - 1];

    /**
     * Checks if a shift amount is small enough to be handled directly.
     * @param {number|string|BigInteger} n The shift amount.
     * @returns {boolean} True if small, false otherwise.
     */
    function shift_isSmall(n) {
        return (typeof n === "number" || typeof n === "string") && +Math.abs(n) <= BASE || n instanceof BigInteger && n.value.length <= 1;
    }

    // BigInteger left shift method.
    BigInteger.prototype.shiftLeft = function(n) {
        if (!shift_isSmall(n)) {
            throw new Error(String(n) + " is too large for shifting.");
        }
        n = +n; // Ensure 'n' is a number.

        if (n < 0) {
            return this.shiftRight(-n); // Negative shiftLeft is shiftRight.
        }

        var result = this;
        if (result.isZero()) {
            return result;
        }

        // Apply shifts in chunks using precomputed powers of two.
        while (n >= powers2Length) {
            result = result.multiply(highestPower2);
            n -= powers2Length - 1; // Adjust 'n' by (length-1) because highestPower2 is 2^(length-1).
        }
        return result.multiply(powersOfTwo[n]);
    };

    // SmallInteger left shift method.
    SmallInteger.prototype.shiftLeft = BigInteger.prototype.shiftLeft;

    // BigInteger right shift method.
    BigInteger.prototype.shiftRight = function(n) {
        var remQuo;
        if (!shift_isSmall(n)) {
            throw new Error(String(n) + " is too large for shifting.");
        }
        n = +n; // Ensure 'n' is a number.

        if (n < 0) {
            return this.shiftLeft(-n); // Negative shiftRight is shiftLeft.
        }

        var result = this;

        // Apply shifts in chunks using precomputed powers of two.
        while (n >= powers2Length) {
            if (result.isZero() || result.isNegative() && result.isUnit()) {
                return result; // Shifting a negative unit or zero doesn't change it.
            }
            remQuo = divModAny(result, highestPower2);
            // Handle negative results for floor division.
            result = remQuo[1].isNegative() ? remQuo[0].prev() : remQuo[0];
            n -= powers2Length - 1;
        }

        remQuo = divModAny(result, powersOfTwo[n]);
        // Handle negative results for floor division.
        return remQuo[1].isNegative() ? remQuo[0].prev() : remQuo[0];
    };

    // SmallInteger right shift method.
    SmallInteger.prototype.shiftRight = BigInteger.prototype.shiftRight;

    /**
     * Performs bitwise operations on BigInts.
     * @param {BigInteger|SmallInteger} x The first operand.
     * @param {BigInteger|SmallInteger|number|string} y The second operand.
     * @param {function} fn The bitwise function (e.g., &, |, ^).
     * @returns {BigInteger} The result.
     */
    function bitwise(x, y, fn) {
        y = parseValue(y);

        var xSign = x.isNegative(),
            ySign = y.isNegative();

        // Convert to two's complement representation if negative.
        var xRem = xSign ? x.not() : x,
            yRem = ySign ? y.not() : y;

        var xDigit = 0,
            yDigit = 0;
        var xDivMod = null,
            yDivMod = null;
        var result = [];

        // Process digits from least significant to most significant.
        while (!xRem.isZero() || !yRem.isZero()) {
            xDivMod = divModAny(xRem, highestPower2);
            xDigit = xDivMod[1].toJSNumber();
            if (xSign) {
                xDigit = highestPower2 - 1 - xDigit; // Invert bits for negative numbers.
            }

            yDivMod = divModAny(yRem, highestPower2);
            yDigit = yDivMod[1].toJSNumber();
            if (ySign) {
                yDigit = highestPower2 - 1 - yDigit; // Invert bits for negative numbers.
            }

            xRem = xDivMod[0];
            yRem = yDivMod[0];

            result.push(fn(xDigit, yDigit)); // Apply bitwise function.
        }

        // Determine final sign and reconstruct the number.
        var sum = fn(xSign ? 1 : 0, ySign ? 1 : 0) !== 0 ? bigInt(-1) : bigInt(0);

        for (var i = result.length - 1; i >= 0; i -= 1) {
            sum = sum.multiply(highestPower2).add(bigInt(result[i]));
        }
        return sum;
    }

    // BigInteger bitwise NOT.
    BigInteger.prototype.not = function() {
        return this.negate().prev(); // Two's complement: ~x = -x - 1.
    };

    // SmallInteger bitwise NOT.
    SmallInteger.prototype.not = BigInteger.prototype.not;

    // BigInteger bitwise AND.
    BigInteger.prototype.and = function(n) {
        return bitwise(this, n, function(a, b) {
            return a & b;
        });
    };

    // SmallInteger bitwise AND.
    SmallInteger.prototype.and = BigInteger.prototype.and;

    // BigInteger bitwise OR.
    BigInteger.prototype.or = function(n) {
        return bitwise(this, n, function(a, b) {
            return a | b;
        });
    };

    // SmallInteger bitwise OR.
    SmallInteger.prototype.or = BigInteger.prototype.or;

    // BigInteger bitwise XOR.
    BigInteger.prototype.xor = function(n) {
        return bitwise(this, n, function(a, b) {
            return a ^ b;
        });
    };

    // SmallInteger bitwise XOR.
    SmallInteger.prototype.xor = BigInteger.prototype.xor;

    // Masks for rough LOB (Least One Bit) calculation.
    var LOBMASK_I = 1 << 30,
        LOBMASK_BI = (BASE & -BASE) * (BASE & -BASE) | LOBMASK_I;

    /**
     * Calculates a rough approximation of the Least One Bit (LOB).
     * @param {BigInteger|SmallInteger} n The number.
     * @returns {number} The rough LOB.
     */
    function roughLOB(n) {
        var v = n.value,
            x = typeof v === "number" ? v | LOBMASK_I : v[0] + v[1] * BASE | LOBMASK_BI;
        return x & -x;
    }

    /**
     * Computes integer logarithm (log_base(value)).
     * @param {BigInteger} value The number.
     * @param {BigInteger} base The logarithm base.
     * @returns {{p: BigInteger, e: number}} An object with power and exponent.
     */
    function integerLogarithm(value, base) {
        if (base.compareTo(value) <= 0) {
            var tmp = integerLogarithm(value, base.square(base));
            var p = tmp.p;
            var e = tmp.e;
            var t = p.multiply(base);
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
        };
    }

    // BigInteger bit length method.
    BigInteger.prototype.bitLength = function() {
        var n = this;
        if (n.compareTo(bigInt(0)) < 0) {
            n = n.negate().subtract(bigInt(1)); // For negative numbers, bit length of |x|-1.
        }
        if (n.compareTo(bigInt(0)) === 0) {
            return bigInt(0); // Bit length of 0 is 0.
        }
        // Calculate log base 2 and add 1.
        return bigInt(integerLogarithm(n, bigInt(2)).e).add(bigInt(1));
    };

    // SmallInteger bit length method.
    SmallInteger.prototype.bitLength = BigInteger.prototype.bitLength;

    /**
     * Returns the maximum of two numbers.
     * @param {BigInteger|SmallInteger|number|string} a The first number.
     * @param {BigInteger|SmallInteger|number|string} b The second number.
     * @returns {BigInteger|SmallInteger} The maximum.
     */
    function max(a, b) {
        a = parseValue(a);
        b = parseValue(b);
        return a.greater(b) ? a : b;
    }

    /**
     * Returns the minimum of two numbers.
     * @param {BigInteger|SmallInteger|number|string} a The first number.
     * @param {BigInteger|SmallInteger|number|string} b The second number.
     * @returns {BigInteger|SmallInteger} The minimum.
     */
    function min(a, b) {
        a = parseValue(a);
        b = parseValue(b);
        return a.lesser(b) ? a : b;
    }

    /**
     * Computes the greatest common divisor (GCD) of two numbers.
     * Uses binary GCD algorithm.
     * @param {BigInteger|SmallInteger|number|string} a The first number.
     * @param {BigInteger|SmallInteger|number|string} b The second number.
     * @returns {BigInteger|SmallInteger} The GCD.
     */
    function gcd(a, b) {
        a = parseValue(a).abs();
        b = parseValue(b).abs();

        if (a.equals(b)) return a;
        if (a.isZero()) return b;
        if (b.isZero()) return a;

        var c = Integer[1],
            d, t;

        // Remove common factors of 2.
        while (a.isEven() && b.isEven()) {
            d = Math.min(roughLOB(a), roughLOB(b));
            a = a.divide(d);
            b = b.divide(d);
            c = c.multiply(d);
        }

        // Remove factors of 2 from 'a'.
        while (a.isEven()) {
            a = a.divide(roughLOB(a));
        }

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

        return c.isUnit() ? a : a.multiply(c); // Multiply back common factors of 2.
    }

    /**
     * Computes the least common multiple (LCM) of two numbers.
     * LCM(a,b) = |a*b| / GCD(a,b).
     * @param {BigInteger|SmallInteger|number|string} a The first number.
     * @param {BigInteger|SmallInteger|number|string} b The second number.
     * @returns {BigInteger|SmallInteger} The LCM.
     */
    function lcm(a, b) {
        a = parseValue(a).abs();
        b = parseValue(b).abs();
        return a.divide(gcd(a, b)).multiply(b);
    }

    /**
     * Generates a random BigInt between two specified numbers (inclusive).
     * @param {BigInteger|SmallInteger|number|string} a The lower bound.
     * @param {BigInteger|SmallInteger|number|string} b The upper bound.
     * @returns {BigInteger|SmallInteger} The random number.
     */
    function randBetween(a, b) {
        a = parseValue(a);
        b = parseValue(b);

        var low = min(a, b),
            high = max(a, b);
        var range = high.subtract(low).add(1);

        if (range.isSmall) {
            return low.add(Math.floor(Math.random() * range));
        }

        var length = range.value.length - 1;
        var result = [],
            restricted = true; // Indicates if digits are restricted by 'range'.

        for (var i = length; i >= 0; i--) {
            var top = restricted ? range.value[i] : BASE;
            var digit = truncate(Math.random() * top);
            result.unshift(digit); // Add digit to the front.

            if (digit < top) {
                restricted = false; // If a digit is less than max, subsequent digits are not restricted.
            }
        }

        result = arrayToSmall(result); // Convert to small if possible.
        return low.add(typeof result === "number" ? new SmallInteger(result) : new BigInteger(result, false));
    }

    /**
     * Parses a string representation of a number in a given base.
     * @param {string} text The string to parse.
     * @param {number} base The base of the number.
     * @returns {BigInteger|SmallInteger} The parsed number.
     */
    var parseBase = function(text, base) {
        var length = text.length;
        var i;
        var absBase = Math.abs(base);

        // Input validation for digits.
        for (var i = 0; i < length; i++) {
            var c = text[i].toLowerCase();
            if (c === "-") continue;

            if (/[a-z0-9]/.test(c)) {
                if (/[0-9]/.test(c) && +c >= absBase) {
                    if (c === "1" && absBase === 1) continue;
                    throw new Error(c + " is not a valid digit in base " + base + ".");
                } else if (c.charCodeAt(0) - 87 >= absBase) {
                    throw new Error(c + " is not a valid digit in base " + base + ".");
                }
            }
        }

        // Optimized parsing for small bases that fit in JS Number.
        if (2 <= base && base <= 36) {
            if (length <= LOG_MAX_INT / Math.log(base)) {
                var result = parseInt(text, base);
                if (isNaN(result)) {
                    throw new Error(c + " is not a valid digit in base " + base + ".");
                }
                return new SmallInteger(parseInt(text, base));
            }
        }

        base = parseValue(base);
        var digits = [];
        var isNegative = text[0] === "-";

        for (i = isNegative ? 1 : 0; i < text.length; i++) {
            var c = text[i].toLowerCase(),
                charCode = c.charCodeAt(0);

            if (48 <= charCode && charCode <= 57) {
                digits.push(parseValue(c)); // '0'-'9'.
            } else if (97 <= charCode && charCode <= 122) {
                digits.push(parseValue(c.charCodeAt(0) - 87)); // 'a'-'z'.
            } else if (c === "<") {
                // Handle custom digit format "<value>".
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
     * Parses a number from an array of digits in a given base.
     * @param {BigInteger[]|SmallInteger[]} digits An array of Integer digits.
     * @param {BigInteger|SmallInteger} base The base of the number.
     * @param {boolean} isNegative True if the number is negative.
     * @returns {BigInteger|SmallInteger} The parsed number.
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
     * Converts a digit to its string representation (0-9, a-z, or <value>).
     * @param {number} digit The digit to convert.
     * @returns {string} The string representation.
     */
    function stringify(digit) {
        if (digit <= 35) {
            return "0123456789abcdefghijklmnopqrstuvwxyz".charAt(digit);
        }
        return "<" + digit + ">";
    }

    /**
     * Converts a BigInt to an array of digits in a given base.
     * @param {BigInteger|SmallInteger} n The number to convert.
     * @param {BigInteger|SmallInteger} base The target base.
     * @returns {{value: number[], isNegative: boolean}} An object with the digit array and sign.
     */
    function toBase(n, base) {
        base = bigInt(base);

        if (base.isZero()) {
            if (n.isZero()) return {
                value: [0],
                isNegative: false
            };
            throw new Error("Cannot convert nonzero numbers to base 0.");
        }

        if (base.equals(-1)) {
            // Special case for base -1 (alternating base system).
            if (n.isZero()) return {
                value: [0],
                isNegative: false
            };
            if (n.isNegative()) {
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
            n = n.abs();
        }

        if (base.equals(1)) {
            if (n.isZero()) return {
                value: [0],
                isNegative: false
            };
            return {
                value: Array.apply(null, Array(+n)).map(Number.prototype.valueOf, 1),
                isNegative: neg
            };
        }

        var out = [];
        var left = n,
            divmod;

        while (left.isNegative() || left.compareAbs(base) >= 0) {
            divmod = left.divmod(base);
            left = divmod.quotient;
            var digit = divmod.remainder;

            if (digit.isNegative()) {
                digit = base.minus(digit).abs(); // Adjust negative remainder.
                left = left.next(); // Adjust quotient.
            }
            out.push(digit.toJSNumber());
        }
        out.push(left.toJSNumber());

        return {
            value: out.reverse(),
            isNegative: neg
        };
    }

    /**
     * Converts a BigInt to its string representation in a given base.
     * @param {BigInteger|SmallInteger} n The number to convert.
     * @param {number} base The target base.
     * @returns {string} The string representation.
     */
    function toBaseString(n, base) {
        var arr = toBase(n, base);
        return (arr.isNegative ? "-" : "") + arr.value.map(stringify).join("");
    }

    // BigInteger toArray method (returns digits in a given radix).
    BigInteger.prototype.toArray = function(radix) {
        return toBase(this, radix);
    };

    // SmallInteger toArray method.
    SmallInteger.prototype.toArray = function(radix) {
        return toBase(this, radix);
    };

    // BigInteger toString method.
    BigInteger.prototype.toString = function(radix) {
        if (radix === undefined) radix = 10;
        if (radix !== 10) {
            return toBaseString(this, radix);
        }

        var v = this.value,
            l = v.length,
            str = String(v[--l]),
            zeros = "0000000", // For padding with leading zeros.
            digit;

        while (--l >= 0) {
            digit = String(v[l]);
            str += zeros.slice(digit.length) + digit; // Pad and append.
        }
        var sign = this.sign ? "-" : "";
        return sign + str;
    };

    // SmallInteger toString method.
    SmallInteger.prototype.toString = function(radix) {
        if (radix === undefined) radix = 10;
        if (radix != 10) {
            return toBaseString(this, radix);
        }
        return String(this.value);
    };

    // BigInteger toJSON method (for JSON serialization).
    BigInteger.prototype.toJSON = SmallInteger.prototype.toJSON = function() {
        return this.toString();
    };

    // BigInteger valueOf method (returns JS Number, potentially losing precision).
    BigInteger.prototype.valueOf = function() {
        return parseInt(this.toString(), 10);
    };

    // Alias for valueOf.
    BigInteger.prototype.toJSNumber = BigInteger.prototype.valueOf;

    // SmallInteger valueOf method.
    SmallInteger.prototype.valueOf = function() {
        return this.value;
    };

    // Alias for valueOf.
    SmallInteger.prototype.toJSNumber = SmallInteger.prototype.valueOf;

    /**
     * Parses a string value into a BigInteger or SmallInteger.
     * Handles scientific notation and checks for valid integer format.
     * @param {string} v The string to parse.
     * @returns {BigInteger|SmallInteger} The parsed number.
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
            exp = +exp;

            if (exp !== truncate(exp) || !isPrecise(exp)) {
                throw new Error("Invalid integer: " + exp + " is not a valid exponent.");
            }

            var text = split[0];
            var decimalPlace = text.indexOf(".");
            if (decimalPlace >= 0) {
                exp -= text.length - decimalPlace - 1;
                text = text.slice(0, decimalPlace) + text.slice(decimalPlace + 1);
            }

            if (exp < 0) {
                throw new Error("Cannot include negative exponent part for integers");
            }
            text += new Array(exp + 1).join("0"); // Append zeros for exponent.
            v = text;
        }

        var isValid = /^([0-9][0-9]*)$/.test(v); // Check for valid integer string.
        if (!isValid) {
            throw new Error("Invalid integer: " + v);
        }

        var r = [],
            max = v.length,
            l = LOG_BASE,
            min = max - l;

        while (max > 0) {
            r.push(+v.slice(min, max)); // Extract digits in chunks of LOG_BASE.
            min -= l;
            if (min < 0) min = 0;
            max -= l;
        }

        trim(r); // Remove leading zeros.
        return new BigInteger(r, sign);
    }

    /**
     * Parses a number value into a BigInteger or SmallInteger.
     * @param {number} v The number to parse.
     * @returns {BigInteger|SmallInteger} The parsed number.
     */
    function parseNumberValue(v) {
        if (isPrecise(v)) {
            if (v !== truncate(v)) {
                throw new Error(v + " is not an integer.");
            }
            return new SmallInteger(v);
        }
        return parseStringValue(v.toString()); // Fallback to string parsing for large numbers.
    }

    /**
     * General purpose value parser.
     * @param {BigInteger|SmallInteger|number|string} v The value to parse.
     * @returns {BigInteger|SmallInteger} The parsed number.
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

    // Pre-populate Integer cache for small numbers.
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
    Integer.isInstance = function(x) {
        return x instanceof BigInteger || x instanceof SmallInteger;
    };
    Integer.randBetween = randBetween;
    Integer.fromArray = function(digits, base, isNegative) {
        return parseBaseFromArray(digits.map(parseValue), parseValue(base || 10), isNegative);
    };

    return Integer; // Return the Integer constructor as bigInt.
}();


// --- Main program logic starts here ---
function main(input) {
    // Create an instance of the custom input reader.
    var o = new I(input);

    // Read problem parameters.
    var n = o.a(); // First integer 'n'.
    var k = o.a(); // Second integer 'k'.
    var a = o.l(); // Array 'a' of integers.

    // Define a limit for bit representation (e.g., 40 bits).
    var limit = 40;
    // Initialize array 'b' with powers of 2 (1, 2, 4, 8, ...).
    var b = [1];
    for (var i = 1; i < limit; i++) {
        b[i] = b[i - 1] * 2;
    }
    // Reverse 'b' to have highest power of 2 first (e.g., ..., 8, 4, 2, 1).
    b = b.reverse();

    // Initialize array 'c' to count set bits for each position.
    var c = Array(limit).fill(0);
    // Iterate through each bit position.
    for (var i = 0; i < limit; i++) {
        // For each number 'x' in array 'a'.
        a.forEach(x => {
            // Check if the i-th bit (from MSB) is set in 'x'.
            // Math.floor(x/b[i]) gives the number with current bit as LSB.
            // % 2 checks if that LSB is 1.
            if (Math.floor(x / b[i]) % 2 === 1) c[i] += 1;
        });
    }

    // Construct a 'perfect' binary string.
    // For each bit position, if count of set bits (c[i]) is >= half of array length,
    // then the 'perfect' bit is 0, otherwise it's 1.
    // This aims to maximize XOR sum with numbers in 'a'.
    var perfect = c.map(x => x >= Math.floor(a.length / 2) ? 0 : 1).join('');

    // Convert 'k' to its binary string representation.
    var strK = k.toString(2);
    // Initialize 'tries' array with 'k' itself.
    var tries = [k];

    // Generate candidate numbers for 'x' based on 'k' and 'perfect'.
    // These candidates are numbers that are less than or equal to 'k'.
    for (var i = 0; i < strK.length; i++) {
        // If the i-th bit of 'k' (from MSB) is 1.
        if (strK[i] === "1") {
            // Create a temporary number:
            // - Prefix is the same as 'k' up to (i-1)-th bit.
            // - i-th bit is forced to 0.
            // - Suffix is taken from 'perfect' string to maximize XOR sum.
            var temp = strK.slice(0, strK.length - i - 1) + "0" + perfect.slice(perfect.length - i, perfect.length);
            // Add the integer value of this binary string to 'tries'.
            tries.push(parseInt(temp, 2));
        }
    }

    // Initialize the maximum XOR sum found so far as a BigInt.
    var ans = bigInt(0);

    // Iterate through each candidate number 't' in 'tries'.
    tries.forEach(t => {
        // Convert 't' to its binary string representation.
        var strT = t.toString(2);
        // Pad 'strT' with leading zeros to match the 'limit' length.
        while (strT.length < limit) strT = "0" + strT;

        // Calculate the XOR sum for the current candidate 't'.
        var temp = strT.split("").reduce((acc, cur, i) => {
            // If the current bit of 't' is 0.
            if (cur === "0") {
                // To maximize XOR sum, we want to XOR with 1s.
                // So, for this bit position, multiply power of 2 (b[i]) by count of 1s (c[i]).
                return acc.add(bigInt(b[i]).multiply(c[i]));
            } else { // If the current bit of 't' is 1.
                // To maximize XOR sum, we want to XOR with 0s.
                // So, for this bit position, multiply power of 2 (b[i]) by count of 0s (a.length - c[i]).
                return acc.add(bigInt(b[i]).multiply(a.length - c[i]));
            }
        }, bigInt(0)); // Start with BigInt 0.

        // Update 'ans' if the current 'temp' sum is greater.
        if (temp.greater(ans)) ans = temp;
    });

    // Output the final maximum XOR sum.
    console.log(ans.toString());

    // The commented-out section below appears to be an alternative
    // calculation using standard JavaScript numbers, which might
    // overflow for larger inputs. The BigInt version above is the
    // correct implementation for the problem.

    // var ans = 0;
    // tries.forEach(t => {
    //   var strT = t.toString(2);
    //   while(strT.length < limit) strT = "0" + strT;
    //   var temp = strT.split("").reduce((acc, cur, i) => {
    //     if (cur === "0") {
    //       return acc + b[i] * c[i];
    //     } else {
    //       return acc + b[i] * (a.length - c[i]);
    //     }
    //   }, 0);
    //   if (temp > ans) ans = temp;
    //  });

    //  console.log(ans);
}


// Read input from standard input and pass it to the main function.
main(require("fs").readFileSync("/dev/stdin", "utf8")); // Read file synchronously from /dev/stdin with UTF-8 encoding.