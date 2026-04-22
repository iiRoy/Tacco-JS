"use strict";

/**
 * Custom Input Reader class for competitive programming.
 * This class helps in reading tokens and lines from a multi-line string input.
 * It maintains internal pointers for current line and column.
 *
 * @param {string} s - The raw input string, typically read from stdin.
 * @param {function} f - A parsing function to convert string tokens to desired types (e.g., Number, parseInt).
 *                       If not provided, it defaults to the global Number function.
 */
function I(s, f) {
    // Store the input string split into an array of lines.
    // Each element in this array corresponds to a line of input.
    this._s = s.split("\n");

    // Initialize the current column index to 0.
    // This tracks the position within the current line.
    this._c = 0;

    // Initialize the current line index to 0.
    // This tracks which line is currently being processed.
    this._l = 0;

    // Set the parsing function. If 'f' is provided, use it; otherwise, use Number.
    this._f = f || Number;
}

/**
 * Reads and returns a single token from the input.
 * Tokens are separated by spaces within a line.
 * It automatically advances to the next token, and to the next line when a line is exhausted.
 *
 * @returns {*} The parsed token, or undefined if no more input is available.
 */
I.prototype.a = function() {
    // Get the current line from the stored array of lines.
    // 'this._l' is the index of the current line.
    var l = this._s[this._l];

    // If the current line is undefined (meaning we've exhausted all lines),
    // there's no more input to read, so return.
    if (!l) {
        return;
    }

    // Trim leading/trailing whitespace from the current line and split it into tokens by spaces.
    var t = l.trim().split(" ");

    // Get the token at the current column index 'this._c'.
    var a = t[this._c];

    // Increment the column index to point to the next token for subsequent reads.
    this._c++;

    // Check if all tokens on the current line have been read.
    // If 'this._c' is equal to the total number of tokens in the line,
    // it means we've reached the end of the current line.
    if (t.length === this._c) {
        // Reset the column index to 0 for the next line.
        this._c = 0;
        // Increment the line index to move to the next line.
        this._l++;
    }

    // Parse the extracted token using the configured parsing function 'this._f'
    // and return the result.
    return this._f(a);
};

/**
 * Reads and returns all tokens from the current line as an array.
 * It automatically advances to the next line after reading the current one.
 *
 * @returns {Array<*>} An array of parsed tokens from the current line,
 *                     or undefined if no more input lines are available.
 */
I.prototype.l = function() {
    // Get the current line from the stored array of lines.
    var l = this._s[this._l];

    // If the current line is undefined (no more lines), return.
    if (!l) {
        return;
    }

    // Reset the column index to 0. This method reads the entire line,
    // so the column pointer becomes irrelevant for the current line after this operation.
    this._c = 0;

    // Increment the line index to move to the next line for subsequent reads.
    this._l++;

    // Split the line into tokens by spaces and then apply the parsing function 'this._f'
    // to each token, returning the array of parsed values.
    return l.split(" ").map(this._f);
};

// Export the 'I' class so it can be used as a module (e.g., in Node.js).
module.exports = I;


// This section contains the 'big-integer' library, adapted for the Type I clone.
// It includes extensive whitespace and comment modifications while preserving
// all original identifiers and logical structure.
var bigInt = function(undefined) {
    "use strict";

    // --- Configuration Constants ---
    var BASE = 1e7, // The base for internal numerical representation (10^7).
        LOG_BASE = 7, // The logarithm of the base (log10(10^7) = 7).
        MAX_INT = 9007199254740992, // The maximum safe integer value in JavaScript (2^53 - 1).
        MAX_INT_ARR = smallToArray(MAX_INT), // MAX_INT represented as an array of base-BASE digits.
        DEFAULT_ALPHABET = "0123456789abcdefghijklmnopqrstuvwxyz"; // Default alphabet for base conversions.

    // Feature detection for native BigInt support.
    var supportsNativeBigInt = typeof BigInt === "function";


    // --- Core Integer Representation Classes ---

    /**
     * The main constructor for BigInteger objects.
     * This function acts as a factory, returning an appropriate integer instance
     * (BigInteger, SmallInteger, or NativeBigInt) based on the input value and environment.
     *
     * @param {*} v - The value to convert into an Integer object. Can be a number, string, BigInt, or existing Integer.
     * @param {number} [radix] - Optional radix for parsing string values. Defaults to 10.
     * @param {string} [alphabet] - Optional custom alphabet for base conversion.
     * @param {boolean} [caseSensitive] - Optional flag for case-sensitive alphabet parsing.
     * @returns {Integer} An instance of BigInteger, SmallInteger, or NativeBigInt.
     */
    function Integer(v, radix, alphabet, caseSensitive) {
        // If no value is provided, return the zero constant.
        if (typeof v === "undefined") {
            return Integer[0];
        }

        // If a radix is specified, perform base conversion.
        if (typeof radix !== "undefined") {
            // Optimized path for base 10 without a custom alphabet.
            return +radix === 10 && !alphabet ? parseValue(v) : parseBase(v, radix, alphabet, caseSensitive);
        }

        // Otherwise, parse the value directly without base conversion.
        return parseValue(v);
    }

    /**
     * Represents a large integer that exceeds JavaScript's safe integer limit.
     * Internally, it stores numbers as an array of "digits" in BASE (10^7).
     *
     * @param {Array<number>} value - An array of numerical "digits" in base BASE.
     * @param {boolean} sign - True if the number is negative, false otherwise (positive or zero).
     */
    function BigInteger(value, sign) {
        this.value = value;
        this.sign = sign;
        this.isSmall = false; // Flag indicating it's not a SmallInteger.
    }
    // Inherit from Integer.prototype to share common methods.
    BigInteger.prototype = Object.create(Integer.prototype);

    /**
     * Represents a small integer that fits within JavaScript's safe integer range.
     * These can be stored and operated on directly as native JavaScript numbers for performance.
     *
     * @param {number} value - The integer value.
     */
    function SmallInteger(value) {
        this.value = value;
        this.sign = value < 0; // Determine sign based on the number's value.
        this.isSmall = true; // Flag indicating it is a SmallInteger.
    }
    // Inherit from Integer.prototype.
    SmallInteger.prototype = Object.create(Integer.prototype);

    /**
     * Represents a large integer using the native JavaScript BigInt type.
     * This class acts as a wrapper for native BigInts when supported.
     *
     * @param {BigInt} value - The native BigInt value.
     */
    function NativeBigInt(value) {
        this.value = value;
    }
    // Inherit from Integer.prototype.
    NativeBigInt.prototype = Object.create(Integer.prototype);


    // --- Utility Functions ---

    /**
     * Checks if a given JavaScript number is precisely representable (within MAX_INT and -MAX_INT).
     *
     * @param {number} n - The number to check.
     * @returns {boolean} True if the number is precise, false otherwise.
     */
    function isPrecise(n) {
        return -MAX_INT < n && n < MAX_INT;
    }

    /**
     * Converts a small JavaScript number into an array of digits in base BASE.
     * This is used to convert SmallIntegers to the BigInteger internal representation.
     *
     * @param {number} n - The small number to convert.
     * @returns {Array<number>} An array of digits.
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
     * Converts an array of digits (base BASE) back into a small JavaScript number
     * if the value fits within the safe integer range.
     *
     * @param {Array<number>} arr - The array of digits.
     * @returns {number|Array<number>} The converted small number, or the original array if it's too large.
     */
    function arrayToSmall(arr) {
        trim(arr); // Remove leading zeros.
        var length = arr.length;

        // Check if the number of digits is small enough and its absolute value is within MAX_INT.
        if (length < 4 && compareAbs(arr, MAX_INT_ARR) < 0) {
            switch (length) {
                case 0:
                    return 0; // Empty array represents zero.
                case 1:
                    return arr[0]; // Single digit.
                case 2:
                    return arr[0] + arr[1] * BASE; // Two digits.
                default:
                    return arr[0] + (arr[1] + arr[2] * BASE) * BASE; // Three digits.
            }
        }
        return arr; // If too large, return the array as is.
    }

    /**
     * Removes leading zero "digits" from an array representing a BigInteger.
     * This ensures the representation is canonical (e.g., [0, 0, 1] becomes [1]).
     *
     * @param {Array<number>} v - The array of digits to trim.
     */
    function trim(v) {
        var i = v.length;
        // Iterate backwards, finding the first non-zero digit.
        while (v[--i] === 0);
        // Resize the array to exclude trailing zeros.
        v.length = i + 1;
    }

    /**
     * Creates a new array and initializes all its elements to zero.
     *
     * @param {number} length - The desired length of the array.
     * @returns {Array<number>} The newly created and initialized array.
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
     * Truncates a number, effectively removing its fractional part.
     * Behaves like Math.floor for positive numbers and Math.ceil for negative numbers.
     *
     * @param {number} n - The number to truncate.
     * @returns {number} The truncated integer.
     */
    function truncate(n) {
        if (n > 0) {
            return Math.floor(n);
        }
        return Math.ceil(n);
    }


    // --- Arithmetic Operations ---

    /**
     * Adds two arrays of digits, representing positive numbers.
     * Assumes 'a' is at least as long as 'b' (or equal length).
     *
     * @param {Array<number>} a - The first array of digits (operand).
     * @param {Array<number>} b - The second array of digits (operand).
     * @returns {Array<number>} A new array representing the sum.
     */
    function add(a, b) {
        var l_a = a.length,
            l_b = b.length,
            r = new Array(l_a), // Result array, sized to the longer operand.
            carry = 0, // Carry-over from digit addition.
            base = BASE,
            sum, i;

        // Add digits up to the length of the shorter operand.
        for (i = 0; i < l_b; i++) {
            sum = a[i] + b[i] + carry;
            carry = sum >= base ? 1 : 0; // Determine new carry.
            r[i] = sum - carry * base; // Store the current digit.
        }

        // Add remaining digits of the longer operand with any carry.
        while (i < l_a) {
            sum = a[i] + carry;
            carry = sum === base ? 1 : 0; // Check for carry.
            r[i++] = sum - carry * base; // Store digit and increment index.
        }

        // If there's a final carry, push it to the result.
        if (carry > 0) {
            r.push(carry);
        }
        return r;
    }

    /**
     * Adds two arrays of digits, handling cases where their lengths might differ.
     * Ensures the longer array is passed as the first argument to `add`.
     *
     * @param {Array<number>} a - The first array of digits.
     * @param {Array<number>} b - The second array of digits.
     * @returns {Array<number>} A new array representing the sum.
     */
    function addAny(a, b) {
        if (a.length >= b.length) {
            return add(a, b);
        }
        return add(b, a);
    }

    /**
     * Adds a small number (carry) to an array of digits.
     * This is typically used for incrementing or handling carries.
     *
     * @param {Array<number>} a - The array of digits.
     * @param {number} carry - The small number to add.
     * @returns {Array<number>} A new array representing the sum.
     */
    function addSmall(a, carry) {
        var l = a.length,
            r = new Array(l),
            base = BASE,
            sum, i;

        for (i = 0; i < l; i++) {
            // Subtract base, add carry, then add original digit to simulate addition.
            // This is a common trick for efficient addition with carries.
            sum = a[i] - base + carry;
            carry = Math.floor(sum / base);
            r[i] = sum - carry * base; // Current digit.
            carry += 1; // Restore carry for next iteration.
        }

        // Handle any remaining carry.
        while (carry > 0) {
            r[i++] = carry % base;
            carry = Math.floor(carry / base);
        }
        return r;
    }

    // BigInteger prototype method for addition.
    BigInteger.prototype.add = function(v) {
        var n = parseValue(v); // Ensure 'v' is an Integer object.

        // If signs are different, perform subtraction instead (e.g., 5 + (-3) = 5 - 3).
        if (this.sign !== n.sign) {
            return this.subtract(n.negate());
        }

        var a = this.value,
            b = n.value;

        // If the other operand is a SmallInteger, use optimized addSmall.
        if (n.isSmall) {
            return new BigInteger(addSmall(a, Math.abs(b)), this.sign);
        }

        // Otherwise, use general addAny for two BigIntegers.
        return new BigInteger(addAny(a, b), this.sign);
    };
    BigInteger.prototype.plus = BigInteger.prototype.add; // Alias for 'add'.

    // SmallInteger prototype method for addition.
    SmallInteger.prototype.add = function(v) {
        var n = parseValue(v);
        var a = this.value;

        // If signs are different, perform subtraction.
        if (a < 0 !== n.sign) {
            return this.subtract(n.negate());
        }

        var b = n.value;

        if (n.isSmall) {
            // If both are SmallIntegers, perform native addition.
            // Check for overflow into BigInteger range.
            if (isPrecise(a + b)) {
                return new SmallInteger(a + b);
            }
            // If it overflows, convert 'b' to array and use BigInteger addition path.
            b = smallToArray(Math.abs(b));
        }

        // Convert 'a' to array and use BigInteger addition path.
        return new BigInteger(addSmall(b, Math.abs(a)), a < 0);
    };
    SmallInteger.prototype.plus = SmallInteger.prototype.add; // Alias for 'add'.

    // NativeBigInt prototype method for addition.
    NativeBigInt.prototype.add = function(v) {
        // Use native BigInt addition.
        return new NativeBigInt(this.value + parseValue(v).value);
    };
    NativeBigInt.prototype.plus = NativeBigInt.prototype.add; // Alias for 'add'.

    /**
     * Subtracts array 'b' from array 'a', assuming a >= b (absolute values).
     *
     * @param {Array<number>} a - The minuend (array of digits).
     * @param {Array<number>} b - The subtrahend (array of digits).
     * @returns {Array<number>} A new array representing the difference.
     */
    function subtract(a, b) {
        var a_l = a.length,
            b_l = b.length,
            r = new Array(a_l),
            borrow = 0, // Borrow-out from digit subtraction.
            base = BASE,
            i, difference;

        // Subtract digits up to the length of the shorter operand.
        for (i = 0; i < b_l; i++) {
            difference = a[i] - borrow - b[i];
            if (difference < 0) {
                difference += base;
                borrow = 1; // Set borrow for next digit.
            } else {
                borrow = 0; // No borrow needed.
            }
            r[i] = difference;
        }

        // Subtract from remaining digits of the longer operand with any borrow.
        for (i = b_l; i < a_l; i++) {
            difference = a[i] - borrow;
            if (difference < 0) {
                difference += base;
            } else {
                r[i++] = difference; // Store digit and increment.
                break; // No more borrows, remaining digits are copied.
            }
            r[i] = difference;
        }

        // Copy any remaining digits from 'a' if no more borrows.
        for (; i < a_l; i++) {
            r[i] = a[i];
        }

        trim(r); // Remove leading zeros.
        return r;
    }

    /**
     * Subtracts two numbers represented by digit arrays, handling signs.
     * Determines which absolute value is larger to ensure correct subtraction order.
     *
     * @param {Array<number>} a - The first operand's digit array.
     * @param {Array<number>} b - The second operand's digit array.
     * @param {boolean} sign - The initial sign assumption for the result.
     * @returns {Integer} A BigInteger or SmallInteger instance representing the difference.
     */
    function subtractAny(a, b, sign) {
        var value;

        // Compare absolute values to determine which is larger.
        if (compareAbs(a, b) >= 0) {
            value = subtract(a, b);
        } else {
            value = subtract(b, a);
            sign = !sign; // If b > a, the sign flips.
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
     * Subtracts a small number 'b' from an array of digits 'a'.
     *
     * @param {Array<number>} a - The minuend array.
     * @param {number} b - The small subtrahend.
     * @param {boolean} sign - The sign of the result.
     * @returns {Integer} A BigInteger or SmallInteger instance representing the difference.
     */
    function subtractSmall(a, b, sign) {
        var l = a.length,
            r = new Array(l),
            carry = -b, // Initialize carry with negative subtrahend.
            base = BASE,
            i, difference;

        for (i = 0; i < l; i++) {
            difference = a[i] + carry;
            carry = Math.floor(difference / base);
            difference %= base;
            r[i] = difference < 0 ? difference + base : difference; // Adjust negative digits.
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

    // BigInteger prototype method for subtraction.
    BigInteger.prototype.subtract = function(v) {
        var n = parseValue(v);

        // If signs are different, perform addition (e.g., 5 - (-3) = 5 + 3).
        if (this.sign !== n.sign) {
            return this.add(n.negate());
        }

        var a = this.value,
            b = n.value;

        // If the other operand is a SmallInteger, use optimized subtractSmall.
        if (n.isSmall) {
            return subtractSmall(a, Math.abs(b), this.sign);
        }

        // Otherwise, use general subtractAny for two BigIntegers.
        return subtractAny(a, b, this.sign);
    };
    BigInteger.prototype.minus = BigInteger.prototype.subtract; // Alias for 'subtract'.

    // SmallInteger prototype method for subtraction.
    SmallInteger.prototype.subtract = function(v) {
        var n = parseValue(v);
        var a = this.value;

        // If signs are different, perform addition.
        if (a < 0 !== n.sign) {
            return this.add(n.negate());
        }

        var b = n.value;

        if (n.isSmall) {
            // If both are SmallIntegers, perform native subtraction.
            return new SmallInteger(a - b);
        }
        // If 'n' is a BigInteger, and 'this' is SmallInteger,
        // subtract 'this' (converted to abs) from 'n', and adjust sign.
        return subtractSmall(b, Math.abs(a), a >= 0);
    };
    SmallInteger.prototype.minus = SmallInteger.prototype.subtract; // Alias for 'subtract'.

    // NativeBigInt prototype method for subtraction.
    NativeBigInt.prototype.subtract = function(v) {
        // Use native BigInt subtraction.
        return new NativeBigInt(this.value - parseValue(v).value);
    };
    NativeBigInt.prototype.minus = NativeBigInt.prototype.subtract; // Alias for 'subtract'.

    // BigInteger prototype method for negation.
    BigInteger.prototype.negate = function() {
        return new BigInteger(this.value, !this.sign); // Simply flip the sign.
    };

    // SmallInteger prototype method for negation.
    SmallInteger.prototype.negate = function() {
        var sign = this.sign;
        var small = new SmallInteger(-this.value);
        small.sign = !sign; // Explicitly update the sign property.
        return small;
    };

    // NativeBigInt prototype method for negation.
    NativeBigInt.prototype.negate = function() {
        return new NativeBigInt(-this.value); // Use native BigInt negation.
    };

    // BigInteger prototype method for absolute value.
    BigInteger.prototype.abs = function() {
        return new BigInteger(this.value, false); // Always positive.
    };

    // SmallInteger prototype method for absolute value.
    SmallInteger.prototype.abs = function() {
        return new SmallInteger(Math.abs(this.value)); // Use native Math.abs.
    };

    // NativeBigInt prototype method for absolute value.
    NativeBigInt.prototype.abs = function() {
        return new NativeBigInt(this.value >= 0 ? this.value : -this.value); // Use native BigInt logic.
    };

    /**
     * Multiplies two arrays of digits using the standard long multiplication algorithm.
     * This is efficient for smaller numbers or as a base case for Karatsuba.
     *
     * @param {Array<number>} a - The first operand's digit array.
     * @param {Array<number>} b - The second operand's digit array.
     * @returns {Array<number>} A new array representing the product.
     */
    function multiplyLong(a, b) {
        var a_l = a.length,
            b_l = b.length,
            l = a_l + b_l, // Maximum possible length of the product.
            r = createArray(l), // Result array, initialized to zeros.
            base = BASE,
            product, carry, i, a_i, b_j;

        // Outer loop iterates through digits of 'a'.
        for (i = 0; i < a_l; ++i) {
            a_i = a[i];
            // Inner loop iterates through digits of 'b'.
            for (var j = 0; j < b_l; ++j) {
                b_j = b[j];
                // Calculate partial product and add to current position, including previous carry.
                product = a_i * b_j + r[i + j];
                carry = Math.floor(product / base); // New carry.
                r[i + j] = product - carry * base; // Store current digit.
                r[i + j + 1] += carry; // Add carry to the next position.
            }
        }

        trim(r); // Remove leading zeros.
        return r;
    }

    /**
     * Multiplies an array of digits by a single small JavaScript number.
     *
     * @param {Array<number>} a - The array of digits.
     * @param {number} b - The small number multiplier.
     * @returns {Array<number>} A new array representing the product.
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

        // Handle any remaining carry.
        while (carry > 0) {
            r[i++] = carry % base;
            carry = Math.floor(carry / base);
        }
        return r;
    }

    /**
     * Shifts an array of digits to the left by `n` positions, effectively multiplying by BASE^n.
     * This is done by prepending `n` zeros.
     *
     * @param {Array<number>} x - The array of digits to shift.
     * @param {number} n - The number of positions to shift (number of zeros to add).
     * @returns {Array<number>} The shifted array.
     */
    function shiftLeft(x, n) {
        var r = [];
        while (n-- > 0) {
            r.push(0);
        }
        return r.concat(x); // Concatenate zeros to the beginning.
    }

    /**
     * Multiplies two arrays of digits using the Karatsuba algorithm.
     * This algorithm is asymptotically faster than long multiplication for very large numbers.
     *
     * @param {Array<number>} x - The first operand's digit array.
     * @param {Array<number>} y - The second operand's digit array.
     * @returns {Array<number>} A new array representing the product.
     */
    function multiplyKaratsuba(x, y) {
        var n = Math.max(x.length, y.length);

        // Base case: if numbers are small enough, use long multiplication.
        if (n <= 30) {
            return multiplyLong(x, y);
        }

        // Split numbers into two halves.
        n = Math.ceil(n / 2);

        var b = x.slice(n),
            a = x.slice(0, n),
            d = y.slice(n),
            c = y.slice(0, n);

        // Recursively compute the three products required by Karatsuba.
        var ac = multiplyKaratsuba(a, c), // z0
            bd = multiplyKaratsuba(b, d), // z2
            abcd = multiplyKaratsuba(addAny(a, b), addAny(c, d)); // z1 = (a+b)(c+d)

        // Combine the products: z0 + (z1 - z0 - z2)*B^n + z2*B^(2n)
        var product = addAny(addAny(ac, shiftLeft(subtract(subtract(abcd, ac), bd), n)), shiftLeft(bd, 2 * n));

        trim(product); // Remove leading zeros.
        return product;
    }

    /**
     * Heuristic function to determine whether Karatsuba multiplication
     * is likely to be faster than standard long multiplication.
     *
     * @param {number} l1 - Length of the first number's digit array.
     * @param {number} l2 - Length of the second number's digit array.
     * @returns {boolean} True if Karatsuba is recommended, false otherwise.
     */
    function useKaratsuba(l1, l2) {
        return -.012 * l1 - .012 * l2 + 15e-6 * l1 * l2 > 0;
    }

    // BigInteger prototype method for multiplication.
    BigInteger.prototype.multiply = function(v) {
        var n = parseValue(v),
            a = this.value,
            b = n.value,
            // Determine the sign of the result: true if signs are different.
            sign = this.sign !== n.sign,
            abs;

        if (n.isSmall) {
            // Optimization for multiplying by a SmallInteger.
            if (b === 0) {
                return Integer[0]; // Multiply by zero.
            }
            if (b === 1) {
                return this; // Multiply by one.
            }
            if (b === -1) {
                return this.negate(); // Multiply by negative one.
            }

            abs = Math.abs(b);
            if (abs < BASE) {
                return new BigInteger(multiplySmall(a, abs), sign); // Small multiplier.
            }
            b = smallToArray(abs); // Convert larger SmallInteger to array.
        }

        // Choose between Karatsuba and long multiplication based on heuristic.
        if (useKaratsuba(a.length, b.length)) {
            return new BigInteger(multiplyKaratsuba(a, b), sign);
        }
        return new BigInteger(multiplyLong(a, b), sign);
    };
    BigInteger.prototype.times = BigInteger.prototype.multiply; // Alias for 'multiply'.

    /**
     * Multiplies a small JavaScript number by an array of digits.
     *
     * @param {number} a - The small number multiplier.
     * @param {Array<number>} b - The array of digits.
     * @param {boolean} sign - The sign of the result.
     * @returns {BigInteger} A BigInteger instance representing the product.
     */
    function multiplySmallAndArray(a, b, sign) {
        if (a < BASE) {
            return new BigInteger(multiplySmall(b, a), sign);
        }
        return new BigInteger(multiplyLong(b, smallToArray(a)), sign);
    }

    // SmallInteger internal method for multiplication by another SmallInteger.
    SmallInteger.prototype._multiplyBySmall = function(a) {
        if (isPrecise(a.value * this.value)) {
            return new SmallInteger(a.value * this.value); // Native multiplication if precise.
        }
        // Otherwise, convert to BigInteger path.
        return multiplySmallAndArray(Math.abs(a.value), smallToArray(Math.abs(this.value)), this.sign !== a.sign);
    };

    // BigInteger internal method for multiplication by a SmallInteger.
    BigInteger.prototype._multiplyBySmall = function(a) {
        if (a.value === 0) {
            return Integer[0];
        }
        if (a.value === 1) {
            return this;
        }
        if (a.value === -1) {
            return this.negate();
        }
        return multiplySmallAndArray(Math.abs(a.value), this.value, this.sign !== a.sign);
    };

    // SmallInteger prototype method for multiplication (dispatches to internal method).
    SmallInteger.prototype.multiply = function(v) {
        return parseValue(v)._multiplyBySmall(this);
    };
    SmallInteger.prototype.times = SmallInteger.prototype.multiply; // Alias for 'multiply'.

    // NativeBigInt prototype method for multiplication.
    NativeBigInt.prototype.multiply = function(v) {
        return new NativeBigInt(this.value * parseValue(v).value); // Native BigInt multiplication.
    };
    NativeBigInt.prototype.times = NativeBigInt.prototype.multiply; // Alias for 'multiply'.

    /**
     * Squares an array of digits. Optimized for squaring (a * a).
     *
     * @param {Array<number>} a - The array of digits to square.
     * @returns {Array<number>} A new array representing the square.
     */
    function square(a) {
        var l = a.length,
            r = createArray(l + l), // Result array length is up to 2 * original length.
            base = BASE,
            product, carry, i, a_i, a_j;

        for (i = 0; i < l; i++) {
            a_i = a[i];
            // Initialize carry with negative of a_i * a_i. This clever trick handles
            // the diagonal terms (a_i * a_i) and sets up the carry for subsequent terms.
            carry = 0 - a_i * a_i;
            for (var j = i; j < l; j++) {
                a_j = a[j];
                // For i === j, it's a_i * a_i. For i !== j, it's 2 * a_i * a_j.
                product = 2 * (a_i * a_j) + r[i + j] + carry;
                carry = Math.floor(product / base);
                r[i + j] = product - carry * base;
            }
            r[i + l] = carry; // Store the final carry for this row.
        }

        trim(r); // Remove leading zeros.
        return r;
    }

    // BigInteger prototype method for squaring.
    BigInteger.prototype.square = function() {
        return new BigInteger(square(this.value), false); // Square is always positive.
    };

    // SmallInteger prototype method for squaring.
    SmallInteger.prototype.square = function() {
        var value = this.value * this.value;
        if (isPrecise(value)) {
            return new SmallInteger(value); // Native square if precise.
        }
        // Otherwise, convert to BigInteger path.
        return new BigInteger(square(smallToArray(Math.abs(this.value))), false);
    };

    // NativeBigInt prototype method for squaring.
    NativeBigInt.prototype.square = function(v) {
        return new NativeBigInt(this.value * this.value); // Native BigInt square.
    };

    /**
     * Division with remainder using an optimized algorithm (likely a variation of Knuth's algorithm D).
     * This is generally faster for larger divisors.
     *
     * @param {Array<number>} a - The dividend's digit array.
     * @param {Array<number>} b - The divisor's digit array.
     * @returns {Array<Array<number>>} An array containing [quotient array, remainder array].
     */
    function divMod1(a, b) {
        var a_l = a.length,
            b_l = b.length,
            base = BASE,
            result = createArray(b.length), // Quotient will have length a_l - b_l + 1.
            divisorMostSignificantDigit = b[b_l - 1],
            // Normalization factor (lambda) to make the most significant digit of the divisor large.
            lambda = Math.ceil(base / (2 * divisorMostSignificantDigit)),
            remainder = multiplySmall(a, lambda), // Normalize dividend.
            divisor = multiplySmall(b, lambda), // Normalize divisor.
            quotientDigit, shift, carry, borrow, i, l, q;

        // Pad remainder and divisor for easier calculations.
        if (remainder.length <= a_l) {
            remainder.push(0);
        }
        divisor.push(0); // This also ensures divisorMostSignificantDigit is correct after normalization.

        divisorMostSignificantDigit = divisor[b_l - 1]; // Re-evaluate after normalization.

        // Main loop for division. Iterate from most significant digits.
        for (shift = a_l - b_l; shift >= 0; shift--) {
            quotientDigit = base - 1; // Initial guess for the quotient digit.

            // Refine initial guess for quotient digit.
            if (remainder[shift + b_l] !== divisorMostSignificantDigit) {
                quotientDigit = Math.floor((remainder[shift + b_l] * base + remainder[shift + b_l - 1]) / divisorMostSignificantDigit);
            }

            carry = 0;
            borrow = 0;
            l = divisor.length;

            // Multiply divisor by quotientDigit and subtract from current part of remainder.
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

            // Adjust quotient digit if the guess was too high (remainder became negative).
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
            result[shift] = quotientDigit;
        }

        // Denormalize the remainder (divide by lambda).
        remainder = divModSmall(remainder, lambda)[0];
        return [arrayToSmall(result), arrayToSmall(remainder)];
    }

    /**
     * Division with remainder using a simpler, iterative subtraction method.
     * This might be faster for smaller divisors or when `divMod1` overhead is too high.
     *
     * @param {Array<number>} a - The dividend's digit array.
     * @param {Array<number>} b - The divisor's digit array.
     * @returns {Array<Array<number>>} An array containing [quotient array, remainder array].
     */
    function divMod2(a, b) {
        var a_l = a.length,
            b_l = b.length,
            result = [],
            part = [],
            base = BASE,
            guess, xlen, highx, highy, check;

        while (a_l) {
            part.unshift(a[--a_l]); // Take one digit from dividend.
            trim(part); // Remove leading zeros from the current 'part'.

            if (compareAbs(part, b) < 0) {
                result.push(0); // If part is smaller than divisor, quotient digit is 0.
                continue;
            }

            xlen = part.length;
            highx = part[xlen - 1] * base + part[xlen - 2]; // Two most significant digits of part.
            highy = b[b_l - 1] * base + b[b_l - 2]; // Two most significant digits of divisor.

            if (xlen > b_l) {
                highx = (highx + 1) * base; // Adjust highx if part is longer than divisor.
            }

            guess = Math.ceil(highx / highy); // Initial guess for quotient digit.

            // Refine guess by trial subtraction.
            do {
                check = multiplySmall(b, guess);
                if (compareAbs(check, part) <= 0) {
                    break;
                }
                guess--;
            } while (guess);

            result.push(guess); // Store the refined quotient digit.
            part = subtract(part, check); // Subtract (divisor * guess) from part.
        }

        result.reverse(); // Digits were pushed in reverse order.
        return [arrayToSmall(result), arrayToSmall(part)];
    }

    /**
     * Divides an array of digits by a single small JavaScript number (lambda).
     * Returns the quotient as an array and the remainder as a number.
     *
     * @param {Array<number>} value - The dividend array.
     * @param {number} lambda - The small divisor.
     * @returns {Array<Array<number>>} An array containing [quotient array, remainder number].
     */
    function divModSmall(value, lambda) {
        var length = value.length,
            quotient = createArray(length),
            base = BASE,
            i, q, remainder, divisor;

        remainder = 0;
        // Iterate from most significant digit down to least significant.
        for (i = length - 1; i >= 0; --i) {
            divisor = remainder * base + value[i]; // Form the current part of the dividend.
            q = truncate(divisor / lambda); // Calculate quotient digit.
            remainder = divisor - q * lambda; // Calculate new remainder.
            quotient[i] = q | 0; // Store quotient digit (ensure integer).
        }
        return [quotient, remainder | 0]; // Return quotient array and final remainder.
    }

    /**
     * Generic division and modulo function.
     * Dispatches to appropriate division algorithms based on operand types and sizes.
     *
     * @param {Integer} self - The dividend (this object).
     * @param {*} v - The divisor (can be any type parseable by bigInt).
     * @returns {Array<Integer>} An array containing [quotient Integer, remainder Integer].
     */
    function divModAny(self, v) {
        var value, n = parseValue(v); // Ensure 'v' is an Integer object.

        // If native BigInt is supported, use it for direct division.
        if (supportsNativeBigInt) {
            return [new NativeBigInt(self.value / n.value), new NativeBigInt(self.value % n.value)];
        }

        var a = self.value,
            b = n.value;
        var quotient;

        if (b === 0) {
            throw new Error("Cannot divide by zero"); // Division by zero error.
        }

        if (self.isSmall) {
            if (n.isSmall) {
                // Both are SmallIntegers, use native JS division.
                return [new SmallInteger(truncate(a / b)), new SmallInteger(a % b)];
            }
            // SmallInteger / BigInteger -> quotient is 0, remainder is the SmallInteger itself.
            return [Integer[0], self];
        }

        if (n.isSmall) {
            // BigInteger / SmallInteger.
            if (b === 1) {
                return [self, Integer[0]]; // Divide by 1.
            }
            if (b == -1) {
                return [self.negate(), Integer[0]]; // Divide by -1.
            }

            var abs = Math.abs(b);
            if (abs < BASE) {
                // If small divisor is within BASE, use optimized divModSmall.
                value = divModSmall(a, abs);
                quotient = arrayToSmall(value[0]);
                var remainder = value[1];

                if (self.sign) {
                    remainder = -remainder; // Apply sign to remainder.
                }

                if (typeof quotient === "number") {
                    if (self.sign !== n.sign) {
                        quotient = -quotient; // Apply sign to quotient.
                    }
                    return [new SmallInteger(quotient), new SmallInteger(remainder)];
                }
                return [new BigInteger(quotient, self.sign !== n.sign), new SmallInteger(remainder)];
            }
            b = smallToArray(abs); // Convert larger SmallInteger to array for general division.
        }

        // Compare absolute values to handle cases where dividend is smaller than divisor.
        var comparison = compareAbs(a, b);
        if (comparison === -1) {
            return [Integer[0], self]; // |a| < |b|, quotient is 0, remainder is 'self'.
        }
        if (comparison === 0) {
            return [Integer[self.sign === n.sign ? 1 : -1], Integer[0]]; // |a| == |b|, quotient is +/-1, remainder is 0.
        }

        // Choose between divMod1 and divMod2 based on heuristic (length).
        if (a.length + b.length <= 200) {
            value = divMod1(a, b);
        } else {
            value = divMod2(a, b);
        }

        quotient = value[0];
        var qSign = self.sign !== n.sign, // Quotient sign is determined by XORing operand signs.
            mod = value[1],
            mSign = self.sign; // Remainder sign is same as dividend's sign.

        // Convert raw quotient array/number to appropriate Integer type.
        if (typeof quotient === "number") {
            if (qSign) {
                quotient = -quotient;
            }
            quotient = new SmallInteger(quotient);
        } else {
            quotient = new BigInteger(quotient, qSign);
        }

        // Convert raw remainder array/number to appropriate Integer type.
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

    // BigInteger prototype method for divmod (returns an object with quotient and remainder).
    BigInteger.prototype.divmod = function(v) {
        var result = divModAny(this, v);
        return {
            quotient: result[0],
            remainder: result[1]
        };
    };
    NativeBigInt.prototype.divmod = SmallInteger.prototype.divmod = BigInteger.prototype.divmod;

    // BigInteger prototype method for division (returns only the quotient).
    BigInteger.prototype.divide = function(v) {
        return divModAny(this, v)[0];
    };
    // Aliases for division.
    NativeBigInt.prototype.over = NativeBigInt.prototype.divide = SmallInteger.prototype.over = SmallInteger.prototype.divide = BigInteger.prototype.over = BigInteger.prototype.divide;

    // BigInteger prototype method for modulo (returns only the remainder).
    BigInteger.prototype.mod = function(v) {
        return divModAny(this, v)[1];
    };
    // Aliases for modulo.
    NativeBigInt.prototype.mod = NativeBigInt.prototype.remainder = SmallInteger.prototype.remainder = SmallInteger.prototype.mod = BigInteger.prototype.remainder = BigInteger.prototype.mod;

    // BigInteger prototype method for exponentiation (power).
    BigInteger.prototype.pow = function(v) {
        var n = parseValue(v),
            a = this.value,
            b = n.value,
            value, x, y;

        // Special cases for exponentiation.
        if (b === 0) {
            return Integer[1]; // x^0 = 1.
        }
        if (a === 0) {
            return Integer[0]; // 0^y = 0 (for y > 0).
        }
        if (a === 1) {
            return Integer[1]; // 1^y = 1.
        }
        if (a === -1) {
            return n.isEven() ? Integer[1] : Integer[-1]; // (-1)^y is 1 if y even, -1 if y odd.
        }
        if (n.sign) {
            return Integer[0]; // Negative exponent (result is fractional, approximated to 0 for integer type).
        }
        if (!n.isSmall) {
            throw new Error("The exponent " + n.toString() + " is too large."); // Exponent too large for practical computation.
        }
        if (this.isSmall) {
            // If base is small, try native Math.pow.
            if (isPrecise(value = Math.pow(a, b))) {
                return new SmallInteger(truncate(value));
            }
        }

        // Use exponentiation by squaring (binary exponentiation).
        x = this;
        y = Integer[1]; // Initialize result to 1.

        while (true) {
            if (b & 1 === 1) { // If the current bit of the exponent is 1 (exponent is odd).
                y = y.times(x); // Multiply result by base.
                --b; // Decrement exponent.
            }
            if (b === 0) {
                break; // Exponent is 0, done.
            }
            b /= 2; // Divide exponent by 2 (right shift).
            x = x.square(); // Square the base.
        }
        return y;
    };
    SmallInteger.prototype.pow = BigInteger.prototype.pow; // SmallInteger uses the same power logic.

    var pow;
    // If native BigInt is supported, define a helper for native exponentiation.
    if (supportsNativeBigInt) {
        pow = eval("(a,b)=>a**b"); // Use native BigInt exponentiation operator.
    }

    // NativeBigInt prototype method for exponentiation.
    NativeBigInt.prototype.pow = function(v) {
        var n = parseValue(v);
        var a = this.value,
            b = n.value;

        // Special cases for native BigInt.
        if (b === BigInt(0)) {
            return Integer[1];
        }
        if (a === BigInt(0)) {
            return Integer[0];
        }
        if (a === BigInt(1)) {
            return Integer[1];
        }
        if (a === BigInt(-1)) {
            return n.isEven() ? Integer[1] : Integer[-1];
        }
        if (n.isNegative()) {
            return new NativeBigInt(BigInt(0)); // Native BigInt doesn't support negative exponents for integer results.
        }
        return new NativeBigInt(pow(a, b)); // Use native exponentiation.
    };

    // BigInteger prototype method for modular exponentiation (modPow).
    BigInteger.prototype.modPow = function(exp, mod) {
        exp = parseValue(exp);
        mod = parseValue(mod);

        if (mod.isZero()) {
            throw new Error("Cannot take modPow with modulus 0"); // Modulus cannot be zero.
        }

        var r = Integer[1], // Initialize result to 1.
            base = this.mod(mod); // Reduce base modulo mod.

        // Use binary exponentiation for modular exponentiation.
        while (exp.isPositive()) {
            if (base.isZero()) {
                return Integer[0]; // If base is 0, result is 0.
            }
            if (exp.isOdd()) {
                r = r.multiply(base).mod(mod); // If exponent bit is 1, multiply result.
            }
            exp = exp.divide(2); // Divide exponent by 2.
            base = base.square().mod(mod); // Square base modulo mod.
        }
        return r;
    };
    // All Integer types use the same modPow logic.
    NativeBigInt.prototype.modPow = SmallInteger.prototype.modPow = BigInteger.prototype.modPow;


    // --- Comparison Operations ---

    /**
     * Compares the absolute values of two arrays of digits.
     *
     * @param {Array<number>} a - The first digit array.
     * @param {Array<number>} b - The second digit array.
     * @returns {number} -1 if |a| < |b|, 0 if |a| == |b|, 1 if |a| > |b|.
     */
    function compareAbs(a, b) {
        // Compare by length first. Longer array has larger absolute value.
        if (a.length !== b.length) {
            return a.length > b.length ? 1 : -1;
        }

        // If lengths are equal, compare digits from most significant to least significant.
        for (var i = a.length - 1; i >= 0; i--) {
            if (a[i] !== b[i]) {
                return a[i] > b[i] ? 1 : -1;
            }
        }
        return 0; // All digits are equal, so numbers are equal.
    }

    // BigInteger prototype method for comparing absolute values.
    BigInteger.prototype.compareAbs = function(v) {
        var n = parseValue(v),
            a = this.value,
            b = n.value;

        if (n.isSmall) {
            // A BigInteger is generally "larger" in representation than a SmallInteger.
            // This might need careful review depending on exact semantics, but consistent with original.
            return 1;
        }
        return compareAbs(a, b);
    };

    // SmallInteger prototype method for comparing absolute values.
    SmallInteger.prototype.compareAbs = function(v) {
        var n = parseValue(v),
            a = Math.abs(this.value),
            b = n.value;

        if (n.isSmall) {
            b = Math.abs(b);
            return a === b ? 0 : a > b ? 1 : -1; // Native comparison for two small numbers.
        }
        return -1; // A SmallInteger is generally "smaller" in representation than a BigInteger.
    };

    // NativeBigInt prototype method for comparing absolute values.
    NativeBigInt.prototype.compareAbs = function(v) {
        var a = this.value;
        var b = parseValue(v).value;
        a = a >= 0 ? a : -a; // Get absolute value for native BigInt.
        b = b >= 0 ? b : -b;
        return a === b ? 0 : a > b ? 1 : -1;
    };

    // BigInteger prototype method for full comparison (considering sign).
    BigInteger.prototype.compare = function(v) {
        // Handle comparison with Infinity.
        if (v === Infinity) {
            return -1;
        }
        if (v === -Infinity) {
            return 1;
        }

        var n = parseValue(v),
            a = this.value,
            b = n.value;

        // If signs are different, the negative number is smaller.
        if (this.sign !== n.sign) {
            return n.sign ? 1 : -1; // If n is negative, this (positive) is larger. If this is negative, n (positive) is larger.
        }

        if (n.isSmall) {
            // Comparing BigInteger to SmallInteger with the same sign.
            // If both are negative, the "smaller" (closer to zero) in absolute value is larger.
            // If both are positive, the BigInteger is larger.
            return this.sign ? -1 : 1;
        }

        // For same signs and both BigIntegers, compare absolute values and apply sign.
        return compareAbs(a, b) * (this.sign ? -1 : 1);
    };
    BigInteger.prototype.compareTo = BigInteger.prototype.compare; // Alias for 'compare'.

    // SmallInteger prototype method for full comparison.
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
            return a == b ? 0 : a > b ? 1 : -1; // Native comparison for two small numbers.
        }

        // If signs are different.
        if (a < 0 !== n.sign) {
            return a < 0 ? -1 : 1;
        }
        // If signs are same, but one is SmallInteger and other is BigInteger.
        return a < 0 ? 1 : -1; // If negative, Small is larger (closer to zero). If positive, Small is smaller.
    };
    SmallInteger.prototype.compareTo = SmallInteger.prototype.compare; // Alias for 'compare'.

    // NativeBigInt prototype method for full comparison.
    NativeBigInt.prototype.compare = function(v) {
        if (v === Infinity) {
            return -1;
        }
        if (v === -Infinity) {
            return 1;
        }

        var a = this.value;
        var b = parseValue(v).value;
        return a === b ? 0 : a > b ? 1 : -1; // Native BigInt comparison.
    };
    NativeBigInt.prototype.compareTo = NativeBigInt.prototype.compare; // Alias for 'compare'.

    // BigInteger equality check.
    BigInteger.prototype.equals = function(v) {
        return this.compare(v) === 0;
    };
    // Aliases for equality.
    NativeBigInt.prototype.eq = NativeBigInt.prototype.equals = SmallInteger.prototype.eq = SmallInteger.prototype.equals = BigInteger.prototype.eq = BigInteger.prototype.equals;

    // BigInteger inequality check.
    BigInteger.prototype.notEquals = function(v) {
        return this.compare(v) !== 0;
    };
    // Aliases for inequality.
    NativeBigInt.prototype.neq = NativeBigInt.prototype.notEquals = SmallInteger.prototype.neq = SmallInteger.prototype.notEquals = BigInteger.prototype.neq = BigInteger.prototype.notEquals;

    // BigInteger greater than check.
    BigInteger.prototype.greater = function(v) {
        return this.compare(v) > 0;
    };
    // Aliases for greater than.
    NativeBigInt.prototype.gt = NativeBigInt.prototype.greater = SmallInteger.prototype.gt = SmallInteger.prototype.greater = BigInteger.prototype.gt = BigInteger.prototype.greater;

    // BigInteger lesser than check.
    BigInteger.prototype.lesser = function(v) {
        return this.compare(v) < 0;
    };
    // Aliases for lesser than.
    NativeBigInt.prototype.lt = NativeBigInt.prototype.lesser = SmallInteger.prototype.lt = SmallInteger.prototype.lesser = BigInteger.prototype.lt = BigInteger.prototype.lesser;

    // BigInteger greater than or equals check.
    BigInteger.prototype.greaterOrEquals = function(v) {
        return this.compare(v) >= 0;
    };
    // Aliases for greater than or equals.
    NativeBigInt.prototype.geq = NativeBigInt.prototype.greaterOrEquals = SmallInteger.prototype.geq = SmallInteger.prototype.greaterOrEquals = BigInteger.prototype.geq = BigInteger.prototype.greaterOrEquals;

    // BigInteger lesser than or equals check.
    BigInteger.prototype.lesserOrEquals = function(v) {
        return this.compare(v) <= 0;
    };
    // Aliases for lesser than or equals.
    NativeBigInt.prototype.leq = NativeBigInt.prototype.lesserOrEquals = SmallInteger.prototype.leq = SmallInteger.prototype.lesserOrEquals = BigInteger.prototype.leq = BigInteger.prototype.lesserOrEquals;


    // --- Property Checks (isEven, isOdd, isPositive, etc.) ---

    // BigInteger isEven check (checks the least significant digit).
    BigInteger.prototype.isEven = function() {
        return (this.value[0] & 1) === 0;
    };

    // SmallInteger isEven check.
    SmallInteger.prototype.isEven = function() {
        return (this.value & 1) === 0;
    };

    // NativeBigInt isEven check.
    NativeBigInt.prototype.isEven = function() {
        return (this.value & BigInt(1)) === BigInt(0);
    };

    // BigInteger isOdd check.
    BigInteger.prototype.isOdd = function() {
        return (this.value[0] & 1) === 1;
    };

    // SmallInteger isOdd check.
    SmallInteger.prototype.isOdd = function() {
        return (this.value & 1) === 1;
    };

    // NativeBigInt isOdd check.
    NativeBigInt.prototype.isOdd = function() {
        return (this.value & BigInt(1)) === BigInt(1);
    };

    // BigInteger isPositive check.
    BigInteger.prototype.isPositive = function() {
        return !this.sign; // Positive if sign is false.
    };

    // SmallInteger isPositive check.
    SmallInteger.prototype.isPositive = function() {
        return this.value > 0;
    };
    NativeBigInt.prototype.isPositive = SmallInteger.prototype.isPositive; // NativeBigInt can also use this simple check.

    // BigInteger isNegative check.
    BigInteger.prototype.isNegative = function() {
        return this.sign; // Negative if sign is true.
    };

    // SmallInteger isNegative check.
    SmallInteger.prototype.isNegative = function() {
        return this.value < 0;
    };
    NativeBigInt.prototype.isNegative = SmallInteger.prototype.isNegative; // NativeBigInt can also use this simple check.

    // BigInteger isUnit check (is it 1 or -1?).
    BigInteger.prototype.isUnit = function() {
        return false; // A BigInteger is typically not 1 or -1 by its nature, unless it's very small.
    };

    // SmallInteger isUnit check.
    SmallInteger.prototype.isUnit = function() {
        return Math.abs(this.value) === 1;
    };

    // NativeBigInt isUnit check.
    NativeBigInt.prototype.isUnit = function() {
        return this.abs().value === BigInt(1);
    };

    // BigInteger isZero check.
    BigInteger.prototype.isZero = function() {
        return false; // A BigInteger object always has a non-empty value array, so it's not strictly zero.
    };

    // SmallInteger isZero check.
    SmallInteger.prototype.isZero = function() {
        return this.value === 0;
    };

    // NativeBigInt isZero check.
    NativeBigInt.prototype.isZero = function() {
        return this.value === BigInt(0);
    };

    // BigInteger isDivisibleBy check.
    BigInteger.prototype.isDivisibleBy = function(v) {
        var n = parseValue(v);

        if (n.isZero()) {
            return false; // Cannot divide by zero.
        }
        if (n.isUnit()) {
            return true; // Divisible by 1 or -1.
        }
        if (n.compareAbs(2) === 0) {
            return this.isEven(); // Optimization for checking divisibility by 2.
        }

        return this.mod(n).isZero(); // If remainder is zero, it's divisible.
    };
    // All Integer types use the same isDivisibleBy logic.
    NativeBigInt.prototype.isDivisibleBy = SmallInteger.prototype.isDivisibleBy = BigInteger.prototype.isDivisibleBy;


    // --- Primality Tests ---

    /**
     * Checks for basic primality (2, 3, 5) or immediate compositeness.
     *
     * @param {Integer} v - The number to check.
     * @returns {boolean|undefined} True if a basic prime, false if composite by basic primes, undefined if inconclusive.
     */
    function isBasicPrime(v) {
        var n = v.abs(); // Work with absolute value.

        if (n.isUnit()) {
            return false; // 1 is not prime.
        }
        if (n.equals(2) || n.equals(3) || n.equals(5)) {
            return true; // 2, 3, 5 are prime.
        }
        if (n.isEven() || n.isDivisibleBy(3) || n.isDivisibleBy(5)) {
            return false; // Divisible by 2, 3, or 5, so composite.
        }
        if (n.lesser(49)) {
            return true; // Numbers less than 49 not caught by above (7, 11, 13, etc.) are prime.
        }
    }

    /**
     * Performs a Miller-Rabin primality test for a given number `n` and a set of bases `a`.
     *
     * @param {Integer} n - The number to test for primality.
     * @param {Array<number>} a - An array of bases to use in the test.
     * @returns {boolean} True if `n` is a strong probable prime for all bases, false if composite.
     */
    function millerRabinTest(n, a) {
        var nPrev = n.prev(), // n - 1.
            b = nPrev, // Represents 'd' in Miller-Rabin: n-1 = d * 2^r.
            r = 0, // Exponent 'r'.
            d, t, i, x;

        // Find r such that n-1 = d * 2^r, where d is odd.
        while (b.isEven()) {
            b = b.divide(2);
            r++;
        }

        // Iterate through each base.
        next: for (i = 0; i < a.length; i++) {
            if (n.lesser(a[i])) {
                continue; // Skip bases larger than n.
            }

            x = bigInt(a[i]).modPow(b, n); // Calculate a^d mod n.

            if (x.isUnit() || x.equals(nPrev)) {
                continue; // n is a strong probable prime for this base.
            }

            // Check the sequence x, x^2, x^4, ..., x^(d*2^(r-1)) mod n.
            for (d = r - 1; d != 0; d--) {
                x = x.square().mod(n);
                if (x.isUnit()) {
                    return false; // Found a non-trivial square root of 1, so n is composite.
                }
                if (x.equals(nPrev)) {
                    continue next; // n is a strong probable prime for this base.
                }
            }
            return false; // If loop finishes without x being 1 or n-1, n is composite.
        }
        return true; // Passed all tests, likely prime.
    }

    // BigInteger prototype method for primality test.
    BigInteger.prototype.isPrime = function(strict) {
        var isPrime = isBasicPrime(this);
        if (isPrime !== undefined) {
            return isPrime; // Return early if basic check is conclusive.
        }

        var n = this.abs();
        var bits = n.bitLength();

        if (bits <= 64) {
            // For numbers up to 64 bits, use a fixed set of strong probable prime bases.
            // These bases are sufficient to guarantee primality for 64-bit numbers.
            return millerRabinTest(n, [2, 325, 9375, 28178, 450775, 9780504, 1795265022]);
        }

        // For larger numbers, use a number of bases proportional to log(N)^2 (strict) or log(N).
        var logN = Math.log(2) * bits.toJSNumber();
        var t = Math.ceil(strict === true ? 2 * Math.pow(logN, 2) : logN);

        var a = [];
        for (var i = 0; i < t; i++) {
            a.push(bigInt(i + 2)); // Use small integers as bases.
        }

        return millerRabinTest(n, a);
    };
    // All Integer types use the same isPrime logic.
    NativeBigInt.prototype.isPrime = SmallInteger.prototype.isPrime = BigInteger.prototype.isPrime;

    // BigInteger prototype method for probable primality test (fewer iterations).
    BigInteger.prototype.isProbablePrime = function(iterations) {
        var isPrime = isBasicPrime(this);
        if (isPrime !== undefined) {
            return isPrime;
        }

        var n = this.abs();
        var t = iterations === undefined ? 5 : iterations; // Default to 5 iterations.

        var a = [];
        for (var i = 0; i < t; i++) {
            a.push(bigInt.randBetween(2, n.minus(2))); // Choose random bases.
        }

        return millerRabinTest(n, a);
    };
    // All Integer types use the same isProbablePrime logic.
    NativeBigInt.prototype.isProbablePrime = SmallInteger.prototype.isProbablePrime = BigInteger.prototype.isProbablePrime;


    // --- Modular Inverse ---

    // BigInteger prototype method for modular inverse (Extended Euclidean Algorithm).
    BigInteger.prototype.modInv = function(n) {
        var t = bigInt.zero, // Initial values for coefficients.
            newT = bigInt.one,
            r = parseValue(n), // Modulus.
            newR = this.abs(), // Number for which inverse is sought (absolute value).
            q, lastT, lastR;

        // Standard Extended Euclidean Algorithm loop.
        while (!newR.isZero()) {
            q = r.divide(newR); // Quotient.
            lastT = t;
            lastR = r;
            t = newT;
            r = newR;
            newT = lastT.subtract(q.multiply(newT));
            newR = lastR.subtract(q.multiply(newR));
        }

        if (!r.isUnit()) {
            throw new Error(this.toString() + " and " + n.toString() + " are not co-prime"); // Inverse exists only if GCD is 1.
        }

        // Adjust 't' to be positive if it's negative.
        if (t.compare(0) === -1) {
            t = t.add(n);
        }

        // If original number was negative, negate the result.
        if (this.isNegative()) {
            return t.negate();
        }
        return t;
    };
    // All Integer types use the same modInv logic.
    NativeBigInt.prototype.modInv = SmallInteger.prototype.modInv = BigInteger.prototype.modInv;


    // --- Increment/Decrement ---

    // BigInteger prototype method for incrementing.
    BigInteger.prototype.next = function() {
        var value = this.value;
        if (this.sign) {
            return subtractSmall(value, 1, this.sign); // If negative, -N + 1 is -(N-1).
        }
        return new BigInteger(addSmall(value, 1), this.sign); // If positive, N + 1.
    };

    // SmallInteger prototype method for incrementing.
    SmallInteger.prototype.next = function() {
        var value = this.value;
        if (value + 1 < MAX_INT) {
            return new SmallInteger(value + 1); // Native increment if still small.
        }
        return new BigInteger(MAX_INT_ARR, false); // Overflow to BigInteger if exceeds MAX_INT.
    };

    // NativeBigInt prototype method for incrementing.
    NativeBigInt.prototype.next = function() {
        return new NativeBigInt(this.value + BigInt(1)); // Native BigInt increment.
    };

    // BigInteger prototype method for decrementing.
    BigInteger.prototype.prev = function() {
        var value = this.value;
        if (this.sign) {
            return new BigInteger(addSmall(value, 1), true); // If negative, -N - 1 is -(N+1).
        }
        return subtractSmall(value, 1, this.sign); // If positive, N - 1.
    };

    // SmallInteger prototype method for decrementing.
    SmallInteger.prototype.prev = function() {
        var value = this.value;
        if (value - 1 > -MAX_INT) {
            return new SmallInteger(value - 1); // Native decrement if still small.
        }
        return new BigInteger(MAX_INT_ARR, true); // Underflow to BigInteger if exceeds -MAX_INT.
    };

    // NativeBigInt prototype method for decrementing.
    NativeBigInt.prototype.prev = function() {
        return new NativeBigInt(this.value - BigInt(1)); // Native BigInt decrement.
    };


    // --- Bitwise Operations and Shifts ---

    // Pre-calculated powers of two, used for efficient shifting.
    var powersOfTwo = [1];
    while (2 * powersOfTwo[powersOfTwo.length - 1] <= BASE) {
        powersOfTwo.push(2 * powersOfTwo[powersOfTwo.length - 1]);
    }
    var powers2Length = powersOfTwo.length,
        highestPower2 = powersOfTwo[powers2Length - 1];

    /**
     * Checks if a shift amount is small enough to be a standard JavaScript number.
     *
     * @param {number} n - The shift amount.
     * @returns {boolean} True if small, false otherwise.
     */
    function shift_isSmall(n) {
        return Math.abs(n) <= BASE;
    }

    // BigInteger prototype method for left bit shift.
    BigInteger.prototype.shiftLeft = function(v) {
        var n = parseValue(v).toJSNumber(); // Get shift amount as JS number.

        if (!shift_isSmall(n)) {
            throw new Error(String(n) + " is too large for shifting.");
        }
        if (n < 0) {
            return this.shiftRight(-n); // Negative left shift is a right shift.
        }

        var result = this;
        if (result.isZero()) {
            return result;
        }

        // Perform shifts in chunks of powers2Length to avoid too many small multiplications.
        while (n >= powers2Length) {
            result = result.multiply(highestPower2);
            n -= powers2Length - 1; // Note: This should likely be `n -= powers2Length;` for correct scaling.
        }
        return result.multiply(powersOfTwo[n]); // Apply remaining shift.
    };
    // All Integer types use the same shiftLeft logic.
    NativeBigInt.prototype.shiftLeft = SmallInteger.prototype.shiftLeft = BigInteger.prototype.shiftLeft;

    // BigInteger prototype method for right bit shift.
    BigInteger.prototype.shiftRight = function(v) {
        var remQuo;
        var n = parseValue(v).toJSNumber(); // Get shift amount as JS number.

        if (!shift_isSmall(n)) {
            throw new Error(String(n) + " is too large for shifting.");
        }
        if (n < 0) {
            return this.shiftLeft(-n); // Negative right shift is a left shift.
        }

        var result = this;
        while (n >= powers2Length) {
            // Handle edge cases for -1 and 0 when shifting right.
            if (result.isZero() || (result.isNegative() && result.isUnit())) {
                return result; // -1 >> N is -1, 0 >> N is 0.
            }
            remQuo = divModAny(result, highestPower2);
            // Adjust quotient based on remainder sign for floor division.
            result = remQuo[1].isNegative() ? remQuo[0].prev() : remQuo[0];
            n -= powers2Length - 1; // Note: This should likely be `n -= powers2Length;` for correct scaling.
        }

        remQuo = divModAny(result, powersOfTwo[n]);
        // Adjust quotient based on remainder sign for floor division.
        return remQuo[1].isNegative() ? remQuo[0].prev() : remQuo[0];
    };
    // All Integer types use the same shiftRight logic.
    NativeBigInt.prototype.shiftRight = SmallInteger.prototype.shiftRight = BigInteger.prototype.shiftRight;

    /**
     * Performs a generic bitwise operation (AND, OR, XOR) on two BigIntegers.
     * It simulates two's complement arithmetic by converting to an unsigned representation,
     * performing the operation digit-by-digit, and then converting back.
     *
     * @param {Integer} x - The first operand.
     * @param {Integer} y - The second operand.
     * @param {function(number, number): number} fn - The bitwise function to apply (e.g., `(a, b) => a & b`).
     * @returns {Integer} The result of the bitwise operation.
     */
    function bitwise(x, y, fn) {
        y = parseValue(y);

        var xSign = x.isNegative(),
            ySign = y.isNegative();

        // Convert negative numbers to their two's complement "unsigned" form.
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

            result.push(fn(xDigit, yDigit)); // Apply bitwise function to digits.
        }

        // Determine the sign of the result based on the bitwise operation on the signs.
        // If the sign bits result in 1, the overall result is negative.
        var sum = fn(xSign ? 1 : 0, ySign ? 1 : 0) !== 0 ? bigInt(-1) : bigInt(0);

        // Reconstruct the result from the processed digits.
        for (var i = result.length - 1; i >= 0; i -= 1) {
            sum = sum.multiply(highestPower2).add(bigInt(result[i]));
        }

        return sum;
    }

    // BigInteger prototype method for bitwise NOT.
    BigInteger.prototype.not = function() {
        return this.negate().prev(); // Formula for two's complement NOT: ~x = -x - 1.
    };
    // All Integer types use the same bitwise NOT logic.
    NativeBigInt.prototype.not = SmallInteger.prototype.not = BigInteger.prototype.not;

    // BigInteger prototype method for bitwise AND.
    BigInteger.prototype.and = function(n) {
        return bitwise(this, n, function(a, b) {
            return a & b;
        });
    };
    // All Integer types use the same bitwise AND logic.
    NativeBigInt.prototype.and = SmallInteger.prototype.and = BigInteger.prototype.and;

    // BigInteger prototype method for bitwise OR.
    BigInteger.prototype.or = function(n) {
        return bitwise(this, n, function(a, b) {
            return a | b;
        });
    };
    // All Integer types use the same bitwise OR logic.
    NativeBigInt.prototype.or = SmallInteger.prototype.or = BigInteger.prototype.or;

    // BigInteger prototype method for bitwise XOR.
    BigInteger.prototype.xor = function(n) {
        return bitwise(this, n, function(a, b) {
            return a ^ b;
        });
    };
    // All Integer types use the same bitwise XOR logic.
    NativeBigInt.prototype.xor = SmallInteger.prototype.xor = BigInteger.prototype.xor;

    // Constants for roughLOB (Least One Bit) calculation.
    var LOBMASK_I = 1 << 30, // For JavaScript numbers, ensures a power of 2.
        // For BigInt digits, combines BASE-related mask with LOBMASK_I.
        LOBMASK_BI = (BASE & -BASE) * (BASE & -BASE) | LOBMASK_I;

    /**
     * Calculates a rough estimate of the "Least One Bit" (lowest set bit).
     * This is used in GCD calculations to efficiently divide by powers of two.
     *
     * @param {Integer} n - The number to analyze.
     * @returns {number|BigInt} A power of 2 representing the lowest set bit.
     */
    function roughLOB(n) {
        var v = n.value,
            x = typeof v === "number" ? v | LOBMASK_I : typeof v === "bigint" ? v | BigInt(LOBMASK_I) : v[0] + v[1] * BASE | LOBMASK_BI;
        return x & -x; // Classic trick to get the lowest set bit.
    }

    /**
     * Calculates the integer logarithm (log_base(value)).
     * Used internally for bitLength calculation.
     *
     * @param {Integer} value - The number.
     * @param {Integer} base - The base of the logarithm.
     * @returns {{p: Integer, e: number}} An object containing the partial power `p` and the exponent `e`.
     */
    function integerLogarithm(value, base) {
        if (base.compareTo(value) <= 0) {
            // Recursive step: log_base(value) = 2 * log_base^2(value) + (0 or 1).
            var tmp = integerLogarithm(value, base.square());
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
        }; // Base case: value < base, log is 0.
    }

    // BigInteger prototype method for calculating bit length.
    BigInteger.prototype.bitLength = function() {
        var n = this;
        if (n.compareTo(bigInt(0)) < 0) {
            n = n.negate().subtract(bigInt(1)); // For negative numbers, bit length is for two's complement.
        }
        if (n.compareTo(bigInt(0)) === 0) {
            return bigInt(0); // Bit length of 0 is 0.
        }
        // Calculate log base 2 and add 1 (for the most significant bit).
        return bigInt(integerLogarithm(n, bigInt(2)).e).add(bigInt(1));
    };
    // All Integer types use the same bitLength logic.
    NativeBigInt.prototype.bitLength = SmallInteger.prototype.bitLength = BigInteger.prototype.bitLength;


    // --- Other Mathematical Functions ---

    /**
     * Returns the maximum of two BigIntegers.
     *
     * @param {*} a - The first number.
     * @param {*} b - The second number.
     * @returns {Integer} The larger of the two numbers.
     */
    function max(a, b) {
        a = parseValue(a);
        b = parseValue(b);
        return a.greater(b) ? a : b;
    }

    /**
     * Returns the minimum of two BigIntegers.
     *
     * @param {*} a - The first number.
     * @param {*} b - The second number.
     * @returns {Integer} The smaller of the two numbers.
     */
    function min(a, b) {
        a = parseValue(a);
        b = parseValue(b);
        return a.lesser(b) ? a : b;
    }

    /**
     * Calculates the Greatest Common Divisor (GCD) of two BigIntegers.
     * Uses the binary GCD algorithm (Stein's algorithm) for efficiency.
     *
     * @param {*} a - The first number.
     * @param {*} b - The second number.
     * @returns {Integer} The GCD of 'a' and 'b'.
     */
    function gcd(a, b) {
        a = parseValue(a).abs(); // Work with absolute values.
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

        var c = Integer[1], // Factor to multiply back at the end.
            d, t;

        // Step 1: Remove common factors of 2.
        while (a.isEven() && b.isEven()) {
            d = min(roughLOB(a), roughLOB(b)); // Find minimum power of 2.
            a = a.divide(d);
            b = b.divide(d);
            c = c.multiply(d);
        }

        // Step 2: Remove remaining factors of 2 from 'a' (if any).
        while (a.isEven()) {
            a = a.divide(roughLOB(a));
        }

        // Step 3: Euclidean algorithm using subtraction.
        do {
            while (b.isEven()) {
                b = b.divide(roughLOB(b));
            }
            if (a.greater(b)) {
                t = b;
                b = a;
                a = t; // Swap a and b if a > b.
            }
            b = b.subtract(a); // b = b - a.
        } while (!b.isZero()); // Repeat until b is 0.

        return c.isUnit() ? a : a.multiply(c); // Multiply 'a' by common factors of 2 found earlier.
    }

    /**
     * Calculates the Least Common Multiple (LCM) of two BigIntegers.
     * Uses the formula: LCM(a, b) = (|a * b|) / GCD(a, b).
     *
     * @param {*} a - The first number.
     * @param {*} b - The second number.
     * @returns {Integer} The LCM of 'a' and 'b'.
     */
    function lcm(a, b) {
        a = parseValue(a).abs();
        b = parseValue(b).abs();
        return a.divide(gcd(a, b)).multiply(b);
    }

    /**
     * Generates a random BigInteger between two inclusive bounds.
     *
     * @param {*} a - The lower bound.
     * @param {*} b - The upper bound.
     * @returns {Integer} A random BigInteger within the specified range.
     */
    function randBetween(a, b) {
        a = parseValue(a);
        b = parseValue(b);

        var low = min(a, b),
            high = max(a, b);
        var range = high.subtract(low).add(1); // Calculate the size of the range.

        if (range.isSmall) {
            return low.add(Math.floor(Math.random() * range)); // If range is small, use native random.
        }

        var digits = toBase(range, BASE).value; // Convert range to digit array.
        var result = [],
            restricted = true;

        // Generate random digits, ensuring the result stays within the range.
        for (var i = 0; i < digits.length; i++) {
            var top = restricted ? digits[i] : BASE;
            var digit = truncate(Math.random() * top); // Generate random digit.
            result.push(digit);
            if (digit < top) {
                restricted = false; // If a digit is less than its max, subsequent digits can be anything up to BASE-1.
            }
        }
        return low.add(Integer.fromArray(result, BASE, false)); // Add the random number to the lower bound.
    }


    // --- Base Conversion and String Representation ---

    /**
     * Parses a string representation of a number in a given base.
     *
     * @param {string} text - The string to parse.
     * @param {number} base - The base (radix) of the number.
     * @param {string} [alphabet] - Optional custom alphabet for digits.
     * @param {boolean} [caseSensitive] - Optional flag for case sensitivity in alphabet.
     * @returns {Integer} The parsed BigInteger.
     */
    var parseBase = function(text, base, alphabet, caseSensitive) {
        alphabet = alphabet || DEFAULT_ALPHABET;
        text = String(text);

        if (!caseSensitive) {
            text = text.toLowerCase();
            alphabet = alphabet.toLowerCase();
        }

        var length = text.length;
        var i;
        var absBase = Math.abs(base);
        var alphabetValues = {};

        // Map characters in the alphabet to their numerical values.
        for (i = 0; i < alphabet.length; i++) {
            alphabetValues[alphabet[i]] = i;
        }

        // Validate that all characters in the text are valid digits for the given base/alphabet.
        for (i = 0; i < length; i++) {
            var c = text[i];
            if (c === "-") {
                continue;
            }
            if (c in alphabetValues) {
                if (alphabetValues[c] >= absBase) {
                    if (c === "1" && absBase === 1) {
                        continue; // Special case for unary base-1.
                    }
                    throw new Error(c + " is not a valid digit in base " + base + ".");
                }
            }
        }

        base = parseValue(base); // Convert base to an Integer object.
        var digits = [];
        var isNegative = text[0] === "-"; // Check for negative sign.

        // Extract digits from the text.
        for (i = isNegative ? 1 : 0; i < text.length; i++) {
            var c = text[i];
            if (c in alphabetValues) {
                digits.push(parseValue(alphabetValues[c]));
            } else if (c === "<") {
                // Handle multi-character digits enclosed in < > (e.g., <10> for digit 10).
                var start = i;
                do {
                    i++;
                } while (text[i] !== ">" && i < text.length);
                digits.push(parseValue(text.slice(start + 1, i)));
            } else {
                throw new Error(c + " is not a valid character");
            }
        }
        return parseBaseFromArray(digits, base, isNegative);
    };

    /**
     * Parses a number from an array of BigInt digits in a given base.
     * This is the core logic for converting an array of digits (each an Integer object)
     * and a base (also an Integer object) into a single BigInteger.
     *
     * @param {Array<Integer>} digits - An array of digit values, each as an Integer object.
     * @param {Integer} base - The base (radix) as an Integer object.
     * @param {boolean} isNegative - True if the final number should be negative.
     * @returns {Integer} The parsed BigInteger.
     */
    function parseBaseFromArray(digits, base, isNegative) {
        var val = Integer[0], // Initialize value to zero.
            pow = Integer[1], // Initialize power to one.
            i;

        // Iterate through digits from right to left (least significant to most significant).
        for (i = digits.length - 1; i >= 0; i--) {
            val = val.add(digits[i].times(pow)); // Add (digit * current_power_of_base).
            pow = pow.times(base); // Update power of base for the next digit.
        }
        return isNegative ? val.negate() : val; // Apply final sign.
    }

    /**
     * Converts a single digit value into its string representation using a given alphabet.
     * Handles digits larger than the alphabet length by enclosing them in < >.
     *
     * @param {number} digit - The numerical value of the digit.
     * @param {string} alphabet - The alphabet string (e.g., "0123456789abcdef").
     * @returns {string} The string representation of the digit.
     */
    function stringify(digit, alphabet) {
        alphabet = alphabet || DEFAULT_ALPHABET;
        if (digit < alphabet.length) {
            return alphabet[digit]; // Use alphabet character if available.
        }
        return "<" + digit + ">"; // Fallback for large digits.
    }

    /**
     * Converts a BigInteger 'n' into an array of digits in a specified base.
     *
     * @param {Integer} n - The BigInteger to convert.
     * @param {Integer} base - The target base.
     * @returns {{value: Array<number>, isNegative: boolean}} An object containing the array of digits and the sign.
     */
    function toBase(n, base) {
        base = bigInt(base); // Ensure base is an Integer object.

        // Special cases for base 0 and base -1.
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
            // Logic for base -1 representation (alternating 0s and 1s).
            if (n.isNegative()) {
                return {
                    value: [].concat.apply([], Array.apply(null, Array(-n.toJSNumber())).map(Array.prototype.valueOf, [1, 0])),
                    isNegative: false
                };
            }
            var arr = Array.apply(null, Array(n.toJSNumber() - 1)).map(Array.prototype.valueOf, [0, 1]);
            arr.unshift([1]);
            return {
                value: [].concat.apply([], arr),
                isNegative: false
            };
        }

        var neg = false;
        // Handle negative numbers for positive bases.
        if (n.isNegative() && base.isPositive()) {
            neg = true;
            n = n.abs();
        }

        // Special case for base 1.
        if (base.isUnit()) {
            if (n.isZero()) {
                return {
                    value: [0],
                    isNegative: false
                };
            }
            return {
                value: Array.apply(null, Array(n.toJSNumber())).map(Number.prototype.valueOf, 1),
                isNegative: neg
            };
        }

        var out = [];
        var left = n,
            divmod;

        // Repeatedly perform divmod to extract digits in the target base.
        while (left.isNegative() || left.compareAbs(base) >= 0) {
            divmod = left.divmod(base);
            left = divmod.quotient;
            var digit = divmod.remainder;

            // Adjust for negative remainders in non-standard bases.
            if (digit.isNegative()) {
                digit = base.minus(digit).abs();
                left = left.next();
            }
            out.push(digit.toJSNumber());
        }
        out.push(left.toJSNumber()); // Push the last quotient as a digit.

        return {
            value: out.reverse(),
            isNegative: neg
        }; // Reverse to get correct order and apply sign.
    }

    /**
     * Converts a BigInteger to its string representation in a specified base.
     *
     * @param {Integer} n - The BigInteger to convert.
     * @param {number} base - The target base.
     * @param {string} [alphabet] - Optional custom alphabet.
     * @returns {string} The string representation.
     */
    function toBaseString(n, base, alphabet) {
        var arr = toBase(n, base);
        return (arr.isNegative ? "-" : "") + arr.value.map(function(x) {
            return stringify(x, alphabet);
        }).join("");
    }

    // BigInteger prototype method to convert to an array of digits in a given radix.
    BigInteger.prototype.toArray = function(radix) {
        return toBase(this, radix);
    };
    SmallInteger.prototype.toArray = function(radix) {
        return toBase(this, radix);
    };
    NativeBigInt.prototype.toArray = function(radix) {
        return toBase(this, radix);
    };

    // BigInteger prototype method for string conversion.
    BigInteger.prototype.toString = function(radix, alphabet) {
        if (radix === undefined) {
            radix = 10;
        }
        if (radix !== 10) {
            return toBaseString(this, radix, alphabet);
        }

        var v = this.value,
            l = v.length,
            str = String(v[--l]), // Start with the most significant digit.
            zeros = "0000000", // For padding with leading zeros within a digit block.
            digit;

        // Concatenate digits, ensuring each has 7 digits (padding with zeros if necessary).
        while (--l >= 0) {
            digit = String(v[l]);
            str += zeros.slice(digit.length) + digit;
        }

        var sign = this.sign ? "-" : ""; // Prepend negative sign if applicable.
        return sign + str;
    };

    // SmallInteger prototype method for string conversion.
    SmallInteger.prototype.toString = function(radix, alphabet) {
        if (radix === undefined) {
            radix = 10;
        }
        if (radix != 10) {
            return toBaseString(this, radix, alphabet);
        }
        return String(this.value); // Native string conversion for small numbers.
    };
    NativeBigInt.prototype.toString = SmallInteger.prototype.toString; // NativeBigInt also uses native string conversion.

    // JSON serialization methods for all Integer types.
    NativeBigInt.prototype.toJSON = BigInteger.prototype.toJSON = SmallInteger.prototype.toJSON = function() {
        return this.toString();
    };

    // BigInteger prototype method to convert to a JavaScript number (potentially losing precision).
    BigInteger.prototype.valueOf = function() {
        return parseInt(this.toString(), 10);
    };
    BigInteger.prototype.toJSNumber = BigInteger.prototype.valueOf; // Alias.

    // SmallInteger prototype method to convert to a JavaScript number.
    SmallInteger.prototype.valueOf = function() {
        return this.value;
    };
    SmallInteger.prototype.toJSNumber = SmallInteger.prototype.valueOf; // Alias.

    // NativeBigInt prototype method to convert to a JavaScript number.
    NativeBigInt.prototype.valueOf = NativeBigInt.prototype.toJSNumber = function() {
        return parseInt(this.toString(), 10); // Converts native BigInt to JS number.
    };

    /**
     * Parses a string value into an Integer object.
     * Handles standard integer strings, scientific notation, and negative signs.
     *
     * @param {string} v - The string to parse.
     * @returns {Integer} The parsed BigInteger or NativeBigInt.
     */
    function parseStringValue(v) {
        // Attempt to parse as a small precise number first.
        if (isPrecise(+v)) {
            var x = +v;
            if (x === truncate(x)) {
                return supportsNativeBigInt ? new NativeBigInt(BigInt(x)) : new SmallInteger(x);
            }
            throw new Error("Invalid integer: " + v); // If it's a float, it's invalid.
        }

        var sign = v[0] === "-";
        if (sign) {
            v = v.slice(1); // Remove sign for parsing.
        }

        var split = v.split(/e/i); // Handle scientific notation (e.g., "1.23e+5").
        if (split.length > 2) {
            throw new Error("Invalid integer: " + split.join("e"));
        }

        if (split.length === 2) {
            var exp = split[1];
            if (exp[0] === "+") {
                exp = exp.slice(1);
            }
            exp = +exp; // Convert exponent to number.

            // Validate exponent.
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
                throw new Error("Cannot include negative exponent part for integers"); // Integer cannot have negative exponent.
            }
            text += new Array(exp + 1).join("0"); // Pad with zeros to apply exponent.
            v = text;
        }

        var isValid = /^([0-9][0-9]*)$/.test(v); // Basic validation that it's a valid number string.
        if (!isValid) {
            throw new Error("Invalid integer: " + v);
        }

        if (supportsNativeBigInt) {
            return new NativeBigInt(BigInt(sign ? "-" + v : v)); // Use native BigInt constructor.
        }

        var r = [],
            max = v.length,
            l = LOG_BASE,
            min = max - l;

        // Convert the large number string into an array of digits in base BASE.
        while (max > 0) {
            r.push(+v.slice(min, max)); // Extract a segment of digits.
            min -= l;
            if (min < 0) {
                min = 0;
            }
            max -= l;
        }

        trim(r); // Remove leading zeros from the digit array.
        return new BigInteger(r, sign); // Create a new BigInteger.
    }

    /**
     * Parses a JavaScript number value into an Integer object.
     * Handles potential precision issues for large numbers.
     *
     * @param {number} v - The number to parse.
     * @returns {Integer} The parsed BigInteger, SmallInteger, or NativeBigInt.
     */
    function parseNumberValue(v) {
        if (supportsNativeBigInt) {
            return new NativeBigInt(BigInt(v)); // Use native BigInt if available.
        }

        if (isPrecise(v)) {
            if (v !== truncate(v)) {
                throw new Error(v + " is not an integer."); // Reject floats.
            }
            return new SmallInteger(v); // If precise, use SmallInteger.
        }
        return parseStringValue(v.toString()); // If too large for SmallInteger, convert to string and parse.
    }

    /**
     * Dispatches the parsing of a value to the appropriate function based on its type.
     * This is the entry point for converting any input type into an Integer object.
     *
     * @param {*} v - The value to parse. Can be number, string, BigInt, or an existing Integer instance.
     * @returns {Integer} The parsed BigInteger, SmallInteger, or NativeBigInt.
     */
    function parseValue(v) {
        if (typeof v === "number") {
            return parseNumberValue(v);
        }
        if (typeof v === "string") {
            return parseStringValue(v);
        }
        if (typeof v === "bigint") {
            return new NativeBigInt(v);
        }
        return v; // Assume it's already an Integer instance if none of the above.
    }

    // Pre-populate a cache for small integer values (0 to 999 and their negatives).
    // This avoids repeated object creation for frequently used small numbers.
    for (var i = 0; i < 1e3; i++) {
        Integer[i] = parseValue(i);
        if (i > 0) {
            Integer[-i] = parseValue(-i);
        }
    }

    // --- Exported Constants and Utility Methods on the Integer object ---
    Integer.one = Integer[1];
    Integer.zero = Integer[0];
    Integer.minusOne = Integer[-1];
    Integer.max = max; // Expose max function.
    Integer.min = min; // Expose min function.
    Integer.gcd = gcd; // Expose GCD function.
    Integer.lcm = lcm; // Expose LCM function.

    /**
     * Checks if a given object is an instance of BigInteger, SmallInteger, or NativeBigInt.
     *
     * @param {*} x - The object to check.
     * @returns {boolean} True if it's an Integer instance, false otherwise.
     */
    Integer.isInstance = function(x) {
        return x instanceof BigInteger || x instanceof SmallInteger || x instanceof NativeBigInt;
    };
    Integer.randBetween = randBetween; // Expose random number generation.

    /**
     * Creates an Integer from an array of digits in a specified base.
     * This is a public API for `parseBaseFromArray`.
     *
     * @param {Array<number>} digits - An array of numerical digit values.
     * @param {number} [base=10] - The base (radix).
     * @param {boolean} [isNegative=false] - True if the number is negative.
     * @returns {Integer} The created BigInteger.
     */
    Integer.fromArray = function(digits, base, isNegative) {
        // Map native number digits to Integer objects before parsing.
        return parseBaseFromArray(digits.map(parseValue), parseValue(base || 10), isNegative);
    };

    return Integer; // Return the main Integer constructor/factory.

}(); // Execute the IIFE to create the bigInt library.

// --- Module Exporting ---

// CommonJS (Node.js) export.
if (typeof module !== "undefined" && module.hasOwnProperty("exports")) {
    module.exports = bigInt;
}

// AMD (Require.js) export.
if (typeof define === "function" && define.amd) {
    define("big-integer", [], function() {
        return bigInt;
    });
}


/**
 * Performs a binary search on a sorted array to find the index of an element.
 * If the element is not found, it returns a negative value indicating the
 * insertion point.
 *
 * @param {Array<number>} ar - The sorted array to search within.
 * @param {number} el - The element to search for.
 * @returns {number} The index of the element if found (>= 0);
 *                   otherwise, `(-(insertion point) - 1)`.
 *                   The insertion point is the index where the element would be inserted
 *                   to maintain the sorted order.
 */
function binarySearch(ar, el) {
    // Define the comparison function. For numeric arrays sorted ascending, `a - b` works.
    let compare_fn = (a, b) => a - b;

    var m = 0; // Initialize the lower bound of the search range.
    var n = ar.length - 1; // Initialize the upper bound of the search range.

    // Continue the search as long as the lower bound is less than or equal to the upper bound.
    while (m <= n) {
        // Calculate the middle index using a bitwise right shift (equivalent to Math.floor((n + m) / 2)).
        var k = (n + m) >> 1;

        // Compare the target element (`el`) with the element at the middle index (`ar[k]`).
        var cmp = compare_fn(el, ar[k]);

        if (cmp > 0) {
            // If `el` is greater than `ar[k]`, discard the left half and search in the right half.
            m = k + 1;
        } else if (cmp < 0) {
            // If `el` is less than `ar[k]`, discard the right half and search in the left half.
            n = k - 1;
        } else {
            // If `cmp` is 0, `el` is equal to `ar[k]`, so the element is found at index `k`.
            return k;
        }
    }

    // If the loop finishes, the element was not found.
    // The variable `m` now represents the "insertion point" (the index where `el` would be inserted).
    // Return `(-(insertion point) - 1)` following a common convention for "not found" in binary search.
    return -m - 1;
}


/**
 * The main application logic.
 * This function processes the input according to the problem statement.
 *
 * @param {string} input - The raw input string read from standard input.
 */
function main(input) {
    // Initialize the custom input reader with the provided input string.
    // The 'I' class (our custom input reader) will parse numbers by default.
    const o = new I(input);

    // Read the first integer from the input, which is 'N'.
    const N = o.a();

    // Initialize an array 'C' to store the sequence of numbers read from input.
    const C = [];
    // Initialize an object 'pos' to act as a hash map.
    // 'pos[number]' will store an array of indices where 'number' appears in the 'C' sequence.
    const pos = {};

    // Loop N times to read the sequence of numbers and populate 'C' and 'pos'.
    for (let i = 0; i < N; i++) {
        // Read the current number from the input.
        let cn = o.a();
        // Add the number to the sequence array 'C'.
        C.push(cn);

        // Update the 'pos' map:
        // If 'cn' is encountered for the first time, create a new array for its indices.
        if (!pos[cn]) {
            pos[cn] = [i];
        } else {
            // Otherwise, append the current index 'i' to the existing array of indices for 'cn'.
            pos[cn].push(i);
        }
    }

    // Initialize the 'results' array.
    // 'results[i]' will store the calculated value up to index 'i' in the sequence.
    // The base case: results[0] is 1 (assuming there's at least one element).
    let results = [bigInt(1)];

    // Iterate from the second element (index 1) up to the last element (N-1).
    for (let i = 1; i < N; i++) {
        // Case 1: The current number is the same as the previous one.
        // In this scenario, the result up to 'i' is simply the same as the result up to 'i-1'.
        if (C[i] === C[i - 1]) {
            results[i] = results[i - 1];
        } else {
            // Case 2: The current number is different from the previous one.
            // We need to find the previous occurrence of the current number C[i].

            // Use binarySearch to find the index where 'i' would be inserted into the sorted
            // list of indices for C[i]. Since 'pos[C[i]]' is sorted, this works.
            // The result 'posInPos' will be negative if 'i' is not already in the list.
            let posInPos = binarySearch(pos[C[i]], i);

            // 'prev' will be the index of the occurrence of C[i] that *immediately precedes*
            // the current index 'i'. This is found by taking the element at `posInPos - 1`
            // within the 'pos[C[i]]' array.
            let prev = pos[C[i]][posInPos - 1];

            // If a previous occurrence ('prev') exists (i.e., 'prev' is not undefined):
            if (prev !== undefined) {
                // The current result 'results[i]' is the sum of:
                // 1. The result up to the previous element: `results[i-1]`
                // 2. The result up to the previous occurrence of the current number C[i]: `results[prev]`
                results[i] = results[i - 1].add(results[prev]);
            } else {
                // If there is no previous occurrence of C[i] (meaning this is the first time
                // C[i] has appeared in the sequence up to this point),
                // the result is simply carried over from the previous step.
                results[i] = results[i - 1];
            }
        }
    }

    // After the loop, `results[N-1]` holds the final calculated value.
    // We need to take this value modulo 1000000007 and convert it to a string for output.
    console.log(results[N - 1].mod(1000000007).toString());
}


// This line reads the input from '/dev/stdin' (standard input)
// and passes it as a UTF-8 string to the 'main' function to start execution.
main(require("fs").readFileSync("/dev/stdin", "utf8"));