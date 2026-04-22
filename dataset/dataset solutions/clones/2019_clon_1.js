"use strict";


// This module provides a BigInt implementation for JavaScript.
// It handles arbitrary-precision integers.
let bigInt = function (  undefined  ) {

    // Internal constants and configurations
    const BASE = 1e7; // Base for internal representation (10^7)
    const LOG_BASE = 7; // Logarithm of the base
    const MAX_INT = 9007199254740992; // Max safe integer in JavaScript
    const MAX_INT_ARR = smallToArray(MAX_INT); // MAX_INT represented as an array
    const LOG_MAX_INT = Math.log(MAX_INT); // Log of MAX_INT

    /**
     * Main Integer constructor function.
     * Parses various input types into a BigInt or SmallInt.
     * @param {*} v - The value to parse.
     * @param {number} [radix] - The base for parsing string values.
     * @returns {Integer} A BigInt or SmallInt instance.
     */
    function Integer( v, radix ) {
        if ( typeof v === "undefined" ) {
            return Integer[0]; // Return zero if no value provided
        }

        // If a radix is provided, parse accordingly
        if ( typeof radix !== "undefined" ) {
            return +radix === 10 ? parseValue(v) : parseBase(v, radix);
        }

        return parseValue(v);
    }

    /**
     * Constructor for BigInteger objects (large numbers).
     * @param {number[]} value - Array of digits representing the number.
     * @param {boolean} sign - True if negative, false if positive.
     */
    function BigInteger( value, sign ) {
        this.value = value;
        this.sign = sign;
        this.isSmall = false; // Flag to indicate it's not a small integer
    }

    // BigInteger inherits from Integer.prototype
    BigInteger.prototype = Object.create(Integer.prototype);


    /**
     * Constructor for SmallInteger objects (numbers within JS safe integer limits).
     * @param {number} value - The numeric value.
     */
    function SmallInteger(value) {
        this.value = value;
        this.sign = value < 0; // Determine sign based on value
        this.isSmall = true; // Flag to indicate it's a small integer
    }

    // SmallInteger also inherits from Integer.prototype
    SmallInteger.prototype = Object.create(Integer.prototype);


    /**
     * Checks if a number can be precisely represented as a JavaScript number.
     * @param {number} n - The number to check.
     * @returns {boolean} True if precise, false otherwise.
     */
    function isPrecise( n ) {
        return -MAX_INT < n && n < MAX_INT;
    }


    /**
     * Converts a small JavaScript number into its array representation.
     * This is useful for numbers that might exceed a single BASE digit but still fit in MAX_INT.
     * @param {number} n - The number to convert.
     * @returns {number[]} Array representation of the number.
     */
    function smallToArray( n ) {
        // If n is less than BASE, it's just a single digit
        if ( n < BASE ) {
            return [n];
        }

        // If n is less than BASE^2, it's two digits
        if ( n < 1e14 ) {
            return [n % BASE, Math.floor(n / BASE)];
        }

        // If n is less than BASE^3, it's three digits (covers MAX_INT)
        return [n % BASE, Math.floor(n / BASE) % BASE, Math.floor(n / 1e14)];
    }


    /**
     * Converts an array representation back to a small JavaScript number if possible.
     * @param {number[]} arr - The array of digits.
     * @returns {number|number[]} The small number or the original array if too large.
     */
    function arrayToSmall( arr ) {
        trim(arr); // Remove leading zeros
        var length = arr.length;

        // If the array is short and its absolute value is less than MAX_INT, convert to number
        if ( length < 4 && compareAbs(arr, MAX_INT_ARR) < 0 ) {
            switch (length) {
                case 0:
                    return 0; // Empty array is 0
                case 1:
                    return arr[0]; // Single digit
                case 2:
                    return arr[0] + arr[1] * BASE; // Two digits
                default:
                    return arr[0] + (arr[1] + arr[2] * BASE) * BASE; // Three digits
            }
        }
        return arr; // Too large, return the array
    }


    /**
     * Removes leading zeros from a digit array.
     * @param {number[]} v - The digit array.
     */
    function trim( v ) {
        var i = v.length;
        while ( v[--i] === 0 ); // Find the first non-zero digit from the end
        v.length = i + 1; // Trim the array
    }


    /**
     * Creates an array filled with zeros.
     * @param {number} length - The desired length of the array.
     * @returns {number[]} A new array filled with zeros.
     */
    function createArray( length ) {
        var x = new Array(length);
        var i = -1;
        while ( ++i < length ) {
            x[i] = 0;
        }
        return x;
    }


    /**
     * Truncates a number (removes its fractional part).
     * @param {number} n - The number to truncate.
     * @returns {number} The truncated integer.
     */
    function truncate( n ) {
        if ( n > 0 ) {
            return Math.floor(n);
        }
        return Math.ceil(n);
    }


    /**
     * Adds two arrays of digits (representing positive numbers).
     * @param {number[]} a - First operand.
     * @param {number[]} b - Second operand.
     * @returns {number[]} Resulting sum array.
     */
    function add( a, b ) {
        var l_a = a.length,
            l_b = b.length,
            r = new Array(l_a),
            carry = 0,
            base = BASE,
            sum, i;

        // Add digits element by element, handling carry
        for ( i = 0; i < l_b; i++ ) {
            sum = a[i] + b[i] + carry;
            carry = sum >= base ? 1 : 0;
            r[i] = sum - carry * base;
        }

        // Propagate carry through the rest of the longer number
        while ( i < l_a ) {
            sum = a[i] + carry;
            carry = sum === base ? 1 : 0;
            r[i++] = sum - carry * base;
        }

        // If there's a final carry, add it
        if ( carry > 0 ) {
            r.push(carry);
        }

        return r;
    }


    /**
     * Adds two arrays of digits, ensuring the longer array is first for `add`.
     * @param {number[]} a - First operand.
     * @param {number[]} b - Second operand.
     * @returns {number[]} Resulting sum array.
     */
    function addAny( a, b ) {
        if ( a.length >= b.length ) {
            return add(a, b);
        }
        return add(b, a);
    }


    /**
     * Adds a small number (carry) to a digit array.
     * This is typically used for `addSmall` where `carry` can be negative for subtraction.
     * @param {number[]} a - The digit array.
     * @param {number} carry - The small number to add.
     * @returns {number[]} Resulting sum array.
     */
    function addSmall( a, carry ) {
        var l = a.length,
            r = new Array(l),
            base = BASE,
            sum, i;

        // Add carry to each digit, propagating new carry
        for ( i = 0; i < l; i++ ) {
            sum = a[i] - base + carry; // Use -base for potential negative carry propagation
            carry = Math.floor(sum / base);
            r[i] = sum - carry * base;
            carry += 1; // Adjust carry for next iteration
        }

        // Add any remaining carry
        while ( carry > 0 ) {
            r[i++] = carry % base;
            carry = Math.floor(carry / base);
        }

        return r;
    }


    // Prototype method for BigInteger addition
    BigInteger.prototype.add = function ( v ) {
        var n = parseValue(v);

        // If signs are different, perform subtraction
        if ( this.sign !== n.sign ) {
            return this.subtract(n.negate());
        }

        var a = this.value,
            b = n.value;

        // If the other operand is small, use optimized addSmall
        if ( n.isSmall ) {
            return new BigInteger(addSmall(a, Math.abs(b)), this.sign);
        }

        // Otherwise, use generic addAny
        return new BigInteger(addAny(a, b), this.sign);
    };

    // Alias for add
    BigInteger.prototype.plus = BigInteger.prototype.add;


    // Prototype method for SmallInteger addition
    SmallInteger.prototype.add = function ( v ) {
        var n = parseValue(v);
        var a = this.value;

        // If signs are different (and not both negative or positive), perform subtraction
        if ( a < 0 !== n.sign ) {
            return this.subtract(n.negate());
        }

        var b = n.value;

        // If both are small, try direct addition
        if ( n.isSmall ) {
            if ( isPrecise(a + b) ) {
                return new SmallInteger(a + b);
            }
            // If direct addition overflows, convert b to array and use addSmall
            b = smallToArray(Math.abs(b));
        }

        // Use addSmall with absolute value of 'a' and 'b' (converted to array if needed)
        // The sign is determined by 'a'
        return new BigInteger(addSmall(b, Math.abs(a)), a < 0);
    };

    // Alias for add
    SmallInteger.prototype.plus = SmallInteger.prototype.add;


    /**
     * Subtracts two arrays of digits (assuming a >= b).
     * @param {number[]} a - Minuend (must be greater than or equal to b).
     * @param {number[]} b - Subtrahend.
     * @returns {number[]} Resulting difference array.
     */
    function subtract( a, b ) {
        var a_l = a.length,
            b_l = b.length,
            r = new Array(a_l),
            borrow = 0,
            base = BASE,
            i, difference;

        // Subtract digits element by element, handling borrow
        for ( i = 0; i < b_l; i++ ) {
            difference = a[i] - borrow - b[i];
            if ( difference < 0 ) {
                difference += base;
                borrow = 1;
            } else {
                borrow = 0;
            }
            r[i] = difference;
        }

        // Propagate borrow through the rest of the longer number (a)
        for ( i = b_l; i < a_l; i++ ) {
            difference = a[i] - borrow;
            if ( difference < 0 ) {
                difference += base;
            } else {
                r[i++] = difference;
                break; // No more borrow, can copy remaining digits
            }
            r[i] = difference;
        }

        // Copy remaining digits if no more borrow
        for ( ; i < a_l; i++ ) {
            r[i] = a[i];
        }

        trim(r); // Remove leading zeros
        return r;
    }


    /**
     * Subtracts two numbers represented by digit arrays, handling signs.
     * @param {number[]} a - First operand.
     * @param {number[]} b - Second operand.
     * @param {boolean} sign - The expected sign of the result.
     * @returns {Integer} The resulting BigInt or SmallInt.
     */
    function subtractAny( a, b, sign ) {
        var value;

        // Determine which number is larger in absolute value to ensure positive subtraction
        if ( compareAbs(a, b) >= 0 ) {
            value = subtract(a, b);
        } else {
            value = subtract(b, a);
            sign = !sign; // Flip sign if we swapped operands
        }

        value = arrayToSmall(value); // Try to convert to small integer

        if ( typeof value === "number" ) {
            if ( sign ) {
                value = -value;
            }
            return new SmallInteger(value);
        }
        return new BigInteger(value, sign);
    }


    /**
     * Subtracts a small number from a digit array.
     * This is effectively `addSmall` with a negative carry.
     * @param {number[]} a - The digit array.
     * @param {number} b - The small number to subtract.
     * @param {boolean} sign - The sign of the result.
     * @returns {Integer} The resulting BigInt or SmallInt.
     */
    function subtractSmall( a, b, sign ) {
        var l = a.length,
            r = new Array(l),
            carry = -b, // Negative carry for subtraction
            base = BASE,
            i, difference;

        // Perform subtraction with carry propagation
        for ( i = 0; i < l; i++ ) {
            difference = a[i] + carry;
            carry = Math.floor(difference / base);
            difference %= base;
            r[i] = difference < 0 ? difference + base : difference;
        }

        r = arrayToSmall(r); // Try to convert to small integer

        if ( typeof r === "number" ) {
            if ( sign ) {
                r = -r;
            }
            return new SmallInteger(r);
        }
        return new BigInteger(r, sign);
    }


    // Prototype method for BigInteger subtraction
    BigInteger.prototype.subtract = function ( v ) {
        var n = parseValue(v);

        // If signs are different, perform addition with negated operand
        if ( this.sign !== n.sign ) {
            return this.add(n.negate());
        }

        var a = this.value,
            b = n.value;

        // If the other operand is small, use optimized subtractSmall
        if ( n.isSmall ) {
            return subtractSmall(a, Math.abs(b), this.sign);
        }

        // Otherwise, use generic subtractAny
        return subtractAny(a, b, this.sign);
    };

    // Alias for subtract
    BigInteger.prototype.minus = BigInteger.prototype.subtract;


    // Prototype method for SmallInteger subtraction
    SmallInteger.prototype.subtract = function ( v ) {
        var n = parseValue(v);
        var a = this.value;

        // If signs are different, perform addition with negated operand
        if ( a < 0 !== n.sign ) {
            return this.add(n.negate());
        }

        var b = n.value;

        // If both are small, try direct subtraction
        if ( n.isSmall ) {
            return new SmallInteger(a - b);
        }

        // Otherwise, use subtractSmall (note: operands are swapped and sign adjusted)
        return subtractSmall(b, Math.abs(a), a >= 0);
    };

    // Alias for subtract
    SmallInteger.prototype.minus = SmallInteger.prototype.subtract;


    // Prototype method for BigInteger negation
    BigInteger.prototype.negate = function () {
        return new BigInteger(this.value, !this.sign);
    };


    // Prototype method for SmallInteger negation
    SmallInteger.prototype.negate = function () {
        var sign = this.sign;
        var small = new SmallInteger(-this.value); // Negate the value
        small.sign = !sign; // Flip the sign
        return small;
    };


    // Prototype method for BigInteger absolute value
    BigInteger.prototype.abs = function () {
        return new BigInteger(this.value, false); // Always positive sign
    };


    // Prototype method for SmallInteger absolute value
    SmallInteger.prototype.abs = function () {
        return new SmallInteger(Math.abs(this.value));
    };


    /**
     * Multiplies two digit arrays using the long multiplication algorithm.
     * @param {number[]} a - First operand array.
     * @param {number[]} b - Second operand array.
     * @returns {number[]} Resulting product array.
     */
    function multiplyLong( a, b ) {
        var a_l = a.length,
            b_l = b.length,
            l = a_l + b_l,
            r = createArray(l), // Result array, max length is sum of lengths
            base = BASE,
            product, carry, i, a_i, b_j;

        // Perform digit-by-digit multiplication
        for ( i = 0; i < a_l; ++i ) {
            a_i = a[i];
            for ( var j = 0; j < b_l; ++j ) {
                b_j = b[j];
                product = a_i * b_j + r[i + j]; // Add to existing sum at this position
                carry = Math.floor(product / base);
                r[i + j] = product - carry * base;
                r[i + j + 1] += carry; // Add carry to the next position
            }
        }

        trim(r); // Remove leading zeros
        return r;
    }


    /**
     * Multiplies a digit array by a small number.
     * @param {number[]} a - The digit array.
     * @param {number} b - The small number (multiplier).
     * @returns {number[]} Resulting product array.
     */
    function multiplySmall( a, b ) {
        var l = a.length,
            r = new Array(l),
            base = BASE,
            carry = 0,
            product, i;

        // Multiply each digit by 'b', propagating carry
        for ( i = 0; i < l; i++ ) {
            product = a[i] * b + carry;
            carry = Math.floor(product / base);
            r[i] = product - carry * base;
        }

        // Add any remaining carry
        while ( carry > 0 ) {
            r[i++] = carry % base;
            carry = Math.floor(carry / base);
        }

        return r;
    }


    /**
     * Shifts a digit array left by appending zeros.
     * @param {number[]} x - The digit array.
     * @param {number} n - The number of zeros to append.
     * @returns {number[]} The shifted array.
     */
    function shiftLeft( x, n ) {
        var r = [];
        while ( n-- > 0 ) {
            r.push(0);
        }
        return r.concat(x);
    }


    /**
     * Multiplies two digit arrays using the Karatsuba algorithm.
     * This is more efficient for very large numbers.
     * @param {number[]} x - First operand array.
     * @param {number[]} y - Second operand array.
     * @returns {number[]} Resulting product array.
     */
    function multiplyKaratsuba( x, y ) {
        var n = Math.max(x.length, y.length);

        // Base case: if numbers are small enough, use long multiplication
        if ( n <= 30 ) {
            return multiplyLong(x, y);
        }

        // Split numbers into two halves
        n = Math.ceil(n / 2);
        var b = x.slice(n),
            a = x.slice(0, n),
            d = y.slice(n),
            c = y.slice(0, n);

        // Recursive calls
        var ac = multiplyKaratsuba(a, c);
        var bd = multiplyKaratsuba(b, d);
        var abcd = multiplyKaratsuba(addAny(a, b), addAny(c, d));

        // Combine results using Karatsuba formula:
        // P(x) = ac * B^(2n) + ((a+b)(c+d) - ac - bd) * B^n + bd
        var product = addAny(addAny(ac, shiftLeft(subtract(subtract(abcd, ac), bd), n)), shiftLeft(bd, 2 * n));

        trim(product);
        return product;
    }


    /**
     * Determines whether to use Karatsuba multiplication based on array lengths.
     * Heuristic to decide when Karatsuba becomes faster than long multiplication.
     * @param {number} l1 - Length of the first array.
     * @param {number} l2 - Length of the second array.
     * @returns {boolean} True if Karatsuba should be used.
     */
    function useKaratsuba( l1, l2 ) {
        // This is an empirical formula, values might need fine-tuning
        return -.012 * l1 - .012 * l2 + 15e-6 * l1 * l2 > 0;
    }


    // Prototype method for BigInteger multiplication
    BigInteger.prototype.multiply = function ( v ) {
        var n = parseValue(v),
            a = this.value,
            b = n.value,
            sign = this.sign !== n.sign, // Determine result sign
            abs;

        // Handle multiplication by small integers
        if ( n.isSmall ) {
            if ( b === 0 ) {
                return Integer[0]; // Multiply by zero is zero
            }
            if ( b === 1 ) {
                return this; // Multiply by one is self
            }
            if ( b === -1 ) {
                return this.negate(); // Multiply by negative one is negation
            }

            abs = Math.abs(b);

            if ( abs < BASE ) {
                return new BigInteger(multiplySmall(a, abs), sign); // Use optimized small multiplication
            }

            b = smallToArray(abs); // Convert small number to array for long multiplication
        }

        // Choose between Karatsuba and long multiplication
        if ( useKaratsuba(a.length, b.length) ) {
            return new BigInteger(multiplyKaratsuba(a, b), sign);
        }

        return new BigInteger(multiplyLong(a, b), sign);
    };

    // Alias for multiply
    BigInteger.prototype.times = BigInteger.prototype.multiply;


    /**
     * Multiplies a small number by a digit array, returning a BigInt.
     * @param {number} a - The small number multiplier.
     * @param {number[]} b - The digit array.
     * @param {boolean} sign - The sign of the result.
     * @returns {BigInteger} The resulting BigInteger.
     */
    function multiplySmallAndArray( a, b, sign ) {
        if ( a < BASE ) {
            return new BigInteger(multiplySmall(b, a), sign);
        }
        return new BigInteger(multiplyLong(b, smallToArray(a)), sign);
    }


    // Internal method for SmallInteger to multiply by another SmallInteger
    SmallInteger.prototype._multiplyBySmall = function ( a ) {
        // If product fits in a precise JS number, return SmallInteger
        if ( isPrecise(a.value * this.value) ) {
            return new SmallInteger(a.value * this.value);
        }

        // Otherwise, convert to array and use multiplySmallAndArray
        return multiplySmallAndArray(Math.abs(a.value), smallToArray(Math.abs(this.value)), this.sign !== a.sign);
    };


    // Internal method for BigInteger to multiply by a SmallInteger
    BigInteger.prototype._multiplyBySmall = function ( a ) {
        if ( a.value === 0 ) {
            return Integer[0];
        }
        if ( a.value === 1 ) {
            return this;
        }
        if ( a.value === -1 ) {
            return this.negate();
        }
        return multiplySmallAndArray(Math.abs(a.value), this.value, this.sign !== a.sign);
    };


    // Prototype method for SmallInteger multiplication (dispatches to _multiplyBySmall)
    SmallInteger.prototype.multiply = function ( v ) {
        return parseValue(v)._multiplyBySmall(this);
    };

    // Alias for multiply
    SmallInteger.prototype.times = SmallInteger.prototype.multiply;


    /**
     * Squares a digit array using an optimized algorithm.
     * @param {number[]} a - The digit array to square.
     * @returns {number[]} The resulting squared array.
     */
    function square( a ) {
        var l = a.length,
            r = createArray(l + l), // Result array length is 2*l
            base = BASE,
            product, carry, i, a_i, a_j;

        // Optimized squaring algorithm (similar to long multiplication but exploits symmetry)
        for ( i = 0; i < l; i++ ) {
            a_i = a[i];
            carry = 0 - a_i * a_i; // Initialize carry with diagonal term (negative because it's subtracted later)
            for ( var j = i; j < l; j++ ) {
                a_j = a[j];
                product = 2 * (a_i * a_j) + r[i + j] + carry; // 2 * cross-product + existing sum + carry
                carry = Math.floor(product / base);
                r[i + j] = product - carry * base;
            }
            r[i + l] = carry; // Store final carry for this row
        }

        trim(r);
        return r;
    }


    // Prototype method for BigInteger squaring
    BigInteger.prototype.square = function () {
        return new BigInteger(square(this.value), false); // Square is always positive
    };


    // Prototype method for SmallInteger squaring
    SmallInteger.prototype.square = function () {
        var value = this.value * this.value;

        // If squared value fits precisely, return SmallInteger
        if ( isPrecise(value) ) {
            return new SmallInteger(value);
        }

        // Otherwise, convert to array and return BigInteger
        return new BigInteger(square(smallToArray(Math.abs(this.value))), false);
    };


    /**
     * Performs division and modulo for two BigIntegers using Algorithm D from Knuth.
     * This is for when the divisor has multiple digits.
     * @param {number[]} a - Dividend array.
     * @param {number[]} b - Divisor array.
     * @returns {number[][]} An array containing [quotient array, remainder array].
     */
    function divMod1( a, b ) {
        var a_l = a.length,
            b_l = b.length,
            base = BASE,
            result = createArray(b.length),
            divisorMostSignificantDigit = b[b_l - 1],
            lambda = Math.ceil(base / (2 * divisorMostSignificantDigit)), // Normalization factor
            remainder = multiplySmall(a, lambda), // Normalize dividend
            divisor = multiplySmall(b, lambda), // Normalize divisor
            quotientDigit, shift, carry, borrow, i, l, q;

        // Adjust lengths after normalization
        if ( remainder.length <= a_l ) {
            remainder.push(0);
        }
        divisor.push(0); // Pad divisor for easier calculations
        divisorMostSignificantDigit = divisor[b_l - 1]; // Re-get MSD after normalization

        // Iterate from most significant digit position
        for ( shift = a_l - b_l; shift >= 0; shift-- ) {
            quotientDigit = base - 1; // Initial guess for quotient digit

            // Refine initial guess
            if ( remainder[shift + b_l] !== divisorMostSignificantDigit ) {
                quotientDigit = Math.floor((remainder[shift + b_l] * base + remainder[shift + b_l - 1]) / divisorMostSignificantDigit);
            }

            carry = 0;
            borrow = 0;
            l = divisor.length;

            // Multiply divisor by quotientDigit and subtract from remainder
            for ( i = 0; i < l; i++ ) {
                carry += quotientDigit * divisor[i];
                q = Math.floor(carry / base);
                borrow += remainder[shift + i] - (carry - q * base); // Subtract product and accumulate borrow
                carry = q;
                if ( borrow < 0 ) {
                    remainder[shift + i] = borrow + base;
                    borrow = -1;
                } else {
                    remainder[shift + i] = borrow;
                    borrow = 0;
                }
            }

            // Adjust quotientDigit if it was too large (borrow is still negative)
            while ( borrow !== 0 ) {
                quotientDigit -= 1;
                carry = 0;
                for ( i = 0; i < l; i++ ) {
                    carry += remainder[shift + i] - base + divisor[i]; // Add divisor back
                    if ( carry < 0 ) {
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

        // Denormalize remainder
        remainder = divModSmall(remainder, lambda)[0];

        return [arrayToSmall(result), arrayToSmall(remainder)];
    }


    /**
     * Performs division and modulo for two BigIntegers using a simpler "schoolbook" method.
     * Used when the Knuth algorithm is not suitable or for smaller large numbers.
     * @param {number[]} a - Dividend array.
     * @param {number[]} b - Divisor array.
     * @returns {number[][]} An array containing [quotient array, remainder array].
     */
    function divMod2( a, b ) {
        var a_l = a.length,
            b_l = b.length,
            result = [],
            part = [],
            base = BASE,
            guess, xlen, highx, highy, check;

        // Iterate through dividend digits from left to right
        while ( a_l ) {
            part.unshift(a[--a_l]); // Take next digit from dividend
            trim(part); // Remove leading zeros from current part

            // If current part is smaller than divisor, quotient digit is 0
            if ( compareAbs(part, b) < 0 ) {
                result.push(0);
                continue;
            }

            xlen = part.length;
            highx = part[xlen - 1] * base + part[xlen - 2]; // Top two digits of current part
            highy = b[b_l - 1] * base + b[b_l - 2]; // Top two digits of divisor

            // Adjust highx if part has more digits than divisor (estimate for large numbers)
            if ( xlen > b_l ) {
                highx = (highx + 1) * base;
            }

            guess = Math.ceil(highx / highy); // Initial guess for quotient digit

            // Refine guess by trial multiplication and subtraction
            do {
                check = multiplySmall(b, guess);
                if ( compareAbs(check, part) <= 0 ) {
                    break;
                }
                guess--;
            } while ( guess );

            result.push(guess); // Store the quotient digit
            part = subtract(part, check); // Subtract product from current part
        }

        result.reverse(); // Digits were pushed in reverse order
        return [arrayToSmall(result), arrayToSmall(part)];
    }


    /**
     * Performs division and modulo of a digit array by a small number.
     * @param {number[]} value - The digit array (dividend).
     * @param {number} lambda - The small number (divisor).
     * @returns {number[][]} An array containing [quotient array, remainder number].
     */
    function divModSmall( value, lambda ) {
        var length = value.length,
            quotient = createArray(length),
            base = BASE,
            i, q, remainder, divisor;

        remainder = 0;

        // Perform long division by a single digit
        for ( i = length - 1; i >= 0; --i ) {
            divisor = remainder * base + value[i];
            q = truncate(divisor / lambda);
            remainder = divisor - q * lambda;
            quotient[i] = q | 0; // Truncate to integer
        }

        return [quotient, remainder | 0];
    }


    /**
     * Performs division and modulo for two general Integer objects.
     * Handles various cases like small integers, zero divisor, and signs.
     * @param {Integer} self - The dividend.
     * @param {Integer} v - The divisor.
     * @returns {Integer[]} An array containing [quotient Integer, remainder Integer].
     */
    function divModAny( self, v ) {
        var value, n = parseValue(v);
        var a = self.value,
            b = n.value;
        var quotient;

        if ( b === 0 ) {
            throw new Error("Cannot divide by zero");
        }

        // Handle cases where `self` is a SmallInteger
        if ( self.isSmall ) {
            if ( n.isSmall ) {
                return [new SmallInteger(truncate(a / b)), new SmallInteger(a % b)];
            }
            return [Integer[0], self]; // Small divided by large is 0 quotient, self remainder
        }

        // Handle cases where `n` (divisor) is a SmallInteger
        if ( n.isSmall ) {
            if ( b === 1 ) {
                return [self, Integer[0]];
            }
            if ( b === -1 ) {
                return [self.negate(), Integer[0]];
            }

            var abs = Math.abs(b);

            if ( abs < BASE ) {
                value = divModSmall(a, abs); // Optimized small divisor division
                quotient = arrayToSmall(value[0]);
                var remainder = value[1];

                if ( self.sign ) {
                    remainder = -remainder;
                }

                if ( typeof quotient === "number" ) {
                    if ( self.sign !== n.sign ) {
                        quotient = -quotient;
                    }
                    return [new SmallInteger(quotient), new SmallInteger(remainder)];
                }
                return [new BigInteger(quotient, self.sign !== n.sign), new SmallInteger(remainder)];
            }
            b = smallToArray(abs); // Convert small divisor to array for larger division algorithms
        }

        // Compare absolute values to determine order and potential zero quotient
        var comparison = compareAbs(a, b);

        if ( comparison === -1 ) {
            return [Integer[0], self]; // Dividend < Divisor (absolute)
        }
        if ( comparison === 0 ) {
            return [Integer[self.sign === n.sign ? 1 : -1], Integer[0]]; // Dividend == Divisor (absolute)
        }

        // Choose division algorithm based on size
        if ( a.length + b.length <= 200 ) {
            value = divMod1(a, b); // Knuth's Algorithm D
        } else {
            value = divMod2(a, b); // Simpler schoolbook division
        }

        quotient = value[0];
        var qSign = self.sign !== n.sign, // Quotient sign
            mod = value[1],
            mSign = self.sign; // Remainder sign is same as dividend

        // Convert quotient to Integer object
        if ( typeof quotient === "number" ) {
            if ( qSign ) {
                quotient = -quotient;
            }
            quotient = new SmallInteger(quotient);
        } else {
            quotient = new BigInteger(quotient, qSign);
        }

        // Convert remainder to Integer object
        if ( typeof mod === "number" ) {
            if ( mSign ) {
                mod = -mod;
            }
            mod = new SmallInteger(mod);
        } else {
            mod = new BigInteger(mod, mSign);
        }

        return [quotient, mod];
    }


    // Prototype method for BigInteger divmod (returns {quotient, remainder})
    BigInteger.prototype.divmod = function ( v ) {
        var result = divModAny(this, v);
        return {
            quotient: result[0],
            remainder: result[1]
        };
    };

    // SmallInteger uses BigInteger's divmod
    SmallInteger.prototype.divmod = BigInteger.prototype.divmod;


    // Prototype method for BigInteger division (returns quotient)
    BigInteger.prototype.divide = function ( v ) {
        return divModAny(this, v)[0];
    };

    // Aliases for division
    SmallInteger.prototype.over = SmallInteger.prototype.divide = BigInteger.prototype.over = BigInteger.prototype.divide;


    // Prototype method for BigInteger modulo (returns remainder)
    BigInteger.prototype.mod = function ( v ) {
        return divModAny(this, v)[1];
    };

    // Aliases for modulo
    SmallInteger.prototype.remainder = SmallInteger.prototype.mod = BigInteger.prototype.remainder = BigInteger.prototype.mod;


    // Prototype method for BigInteger exponentiation (power)
    BigInteger.prototype.pow = function ( v ) {
        var n = parseValue(v),
            a = this.value,
            b = n.value,
            value, x, y;

        if ( b === 0 ) {
            return Integer[1]; // x^0 = 1
        }
        if ( a === 0 ) {
            return Integer[0]; // 0^x = 0 (for x > 0)
        }
        if ( a === 1 ) {
            return Integer[1]; // 1^x = 1
        }
        if ( a === -1 ) {
            return n.isEven() ? Integer[1] : Integer[-1]; // (-1)^x is 1 if even, -1 if odd
        }

        // Negative exponent means fractional result, which is 0 for integer power
        if ( n.sign ) {
            return Integer[0];
        }

        // Exponent too large for practical computation
        if ( !n.isSmall ) {
            throw new Error("The exponent " + n.toString() + " is too large.");
        }

        // If base is small, try direct Math.pow
        if ( this.isSmall ) {
            if ( isPrecise(value = Math.pow(a, b)) ) {
                return new SmallInteger(truncate(value));
            }
        }

        // Binary exponentiation (exponentiation by squaring)
        x = this;
        y = Integer[1]; // Accumulator for result

        while ( true ) {
            if ( b & 1 === 1 ) { // If exponent is odd
                y = y.times(x);
                --b;
            }
            if ( b === 0 ) {
                break; // Done
            }
            b /= 2; // Halve exponent
            x = x.square(); // Square base
        }

        return y;
    };

    // SmallInteger uses BigInteger's pow
    SmallInteger.prototype.pow = BigInteger.prototype.pow;


    // Prototype method for modular exponentiation
    BigInteger.prototype.modPow = function ( exp, mod ) {
        exp = parseValue(exp);
        mod = parseValue(mod);

        if ( mod.isZero() ) {
            throw new Error("Cannot take modPow with modulus 0");
        }

        var r = Integer[1], // Result accumulator
            base = this.mod(mod); // Base modulo modulus

        // Handle negative exponent: modInv
        if ( exp.isNegative() ) {
            return base.modInv(mod).modPow(exp.negate(), mod);
        }

        // Binary exponentiation modulo modulus
        while ( exp.isPositive() ) {
            if ( base.isZero() ) {
                return Integer[0]; // 0^exp mod mod = 0
            }
            if ( exp.isOdd() ) {
                r = r.multiply(base).mod(mod);
            }
            exp = exp.divide(2);
            base = base.square().mod(mod);
        }
        return r;
    };

    // SmallInteger uses BigInteger's modPow
    SmallInteger.prototype.modPow = BigInteger.prototype.modPow;


    /**
     * Compares the absolute values of two digit arrays.
     * @param {number[]} a - First array.
     * @param {number[]} b - Second array.
     * @returns {number} 1 if a > b, -1 if a < b, 0 if a == b.
     */
    function compareAbs( a, b ) {
        if ( a.length !== b.length ) {
            return a.length > b.length ? 1 : -1;
        }
        // Compare digit by digit from most significant
        for ( var i = a.length - 1; i >= 0; i-- ) {
            if ( a[i] !== b[i] ) {
                return a[i] > b[i] ? 1 : -1;
            }
        }
        return 0; // Numbers are equal
    }


    // Prototype method for BigInteger absolute comparison
    BigInteger.prototype.compareAbs = function ( v ) {
        var n = parseValue(v),
            a = this.value,
            b = n.value;

        if ( n.isSmall ) {
            // If comparing BigInt with SmallInt, BigInt (usually) has larger absolute value
            return 1;
        }
        return compareAbs(a, b);
    };


    // Prototype method for SmallInteger absolute comparison
    SmallInteger.prototype.compareAbs = function ( v ) {
        var n = parseValue(v),
            a = Math.abs(this.value),
            b = n.value;

        if ( n.isSmall ) {
            b = Math.abs(b);
            return a === b ? 0 : a > b ? 1 : -1;
        }
        return -1; // SmallInt is absolutely smaller than BigInt
    };


    // Prototype method for BigInteger comparison
    BigInteger.prototype.compare = function ( v ) {
        // Handle special JS Infinity values
        if ( v === Infinity ) {
            return -1;
        }
        if ( v === -Infinity ) {
            return 1;
        }

        var n = parseValue(v),
            a = this.value,
            b = n.value;

        // Compare signs first
        if ( this.sign !== n.sign ) {
            return n.sign ? 1 : -1; // If this is positive and n is negative, this > n
        }

        // If n is small, and we are BigInt, our absolute value is larger
        if ( n.isSmall ) {
            return this.sign ? -1 : 1;
        }

        // Compare absolute values, then apply sign
        return compareAbs(a, b) * (this.sign ? -1 : 1);
    };

    // Alias for compare
    BigInteger.prototype.compareTo = BigInteger.prototype.compare;


    // Prototype method for SmallInteger comparison
    SmallInteger.prototype.compare = function ( v ) {
        // Handle special JS Infinity values
        if ( v === Infinity ) {
            return -1;
        }
        if ( v === -Infinity ) {
            return 1;
        }

        var n = parseValue(v),
            a = this.value,
            b = n.value;

        // If n is also small, direct numeric comparison
        if ( n.isSmall ) {
            return a == b ? 0 : a > b ? 1 : -1;
        }

        // If signs are different, handle based on which is negative
        if ( a < 0 !== n.sign ) {
            return a < 0 ? -1 : 1; // If a is negative, it's smaller. If a is positive, it's larger.
        }

        // If signs are same, but types are different (SmallInt vs BigInt),
        // and SmallInt's sign is negative, then SmallInt is larger (closer to zero).
        // If SmallInt's sign is positive, then SmallInt is smaller (closer to zero).
        return a < 0 ? 1 : -1;
    };

    // Alias for compare
    SmallInteger.prototype.compareTo = SmallInteger.prototype.compare;


    // Prototype method for equality check
    BigInteger.prototype.equals = function ( v ) {
        return this.compare(v) === 0;
    };

    // Aliases for equality
    SmallInteger.prototype.eq = SmallInteger.prototype.equals = BigInteger.prototype.eq = BigInteger.prototype.equals;


    // Prototype method for inequality check
    BigInteger.prototype.notEquals = function ( v ) {
        return this.compare(v) !== 0;
    };

    // Aliases for inequality
    SmallInteger.prototype.neq = SmallInteger.prototype.notEquals = BigInteger.prototype.neq = BigInteger.prototype.notEquals;


    // Prototype method for greater than check
    BigInteger.prototype.greater = function ( v ) {
        return this.compare(v) > 0;
    };

    // Aliases for greater than
    SmallInteger.prototype.gt = SmallInteger.prototype.greater = BigInteger.prototype.gt = BigInteger.prototype.greater;


    // Prototype method for less than check
    BigInteger.prototype.lesser = function ( v ) {
        return this.compare(v) < 0;
    };

    // Aliases for less than
    SmallInteger.prototype.lt = SmallInteger.prototype.lesser = BigInteger.prototype.lt = BigInteger.prototype.lesser;


    // Prototype method for greater than or equals check
    BigInteger.prototype.greaterOrEquals = function ( v ) {
        return this.compare(v) >= 0;
    };

    // Aliases for greater than or equals
    SmallInteger.prototype.geq = SmallInteger.prototype.greaterOrEquals = BigInteger.prototype.geq = BigInteger.prototype.greaterOrEquals;


    // Prototype method for less than or equals check
    BigInteger.prototype.lesserOrEquals = function ( v ) {
        return this.compare(v) <= 0;
    };

    // Aliases for less than or equals
    SmallInteger.prototype.leq = SmallInteger.prototype.lesserOrEquals = BigInteger.prototype.leq = BigInteger.prototype.lesserOrEquals;


    // Prototype method for BigInteger even check
    BigInteger.prototype.isEven = function () {
        return (this.value[0] & 1) === 0; // Check the least significant digit
    };


    // Prototype method for SmallInteger even check
    SmallInteger.prototype.isEven = function () {
        return (this.value & 1) === 0;
    };


    // Prototype method for BigInteger odd check
    BigInteger.prototype.isOdd = function () {
        return (this.value[0] & 1) === 1; // Check the least significant digit
    };


    // Prototype method for SmallInteger odd check
    SmallInteger.prototype.isOdd = function () {
        return (this.value & 1) === 1;
    };


    // Prototype method for BigInteger positive check
    BigInteger.prototype.isPositive = function () {
        return !this.sign;
    };


    // Prototype method for SmallInteger positive check
    SmallInteger.prototype.isPositive = function () {
        return this.value > 0;
    };


    // Prototype method for BigInteger negative check
    BigInteger.prototype.isNegative = function () {
        return this.sign;
    };


    // Prototype method for SmallInteger negative check
    SmallInteger.prototype.isNegative = function () {
        return this.value < 0;
    };


    // Prototype method for BigInteger unit (1 or -1) check
    BigInteger.prototype.isUnit = function () {
        return false; // BigInts are never units (unless they are SmallInts wrapped as BigInts)
    };


    // Prototype method for SmallInteger unit (1 or -1) check
    SmallInteger.prototype.isUnit = function () {
        return Math.abs(this.value) === 1;
    };


    // Prototype method for BigInteger zero check
    BigInteger.prototype.isZero = function () {
        return false; // A BigInt can't be zero by definition (it would be a SmallInt)
    };


    // Prototype method for SmallInteger zero check
    SmallInteger.prototype.isZero = function () {
        return this.value === 0;
    };


    // Prototype method for BigInteger divisibility check
    BigInteger.prototype.isDivisibleBy = function ( v ) {
        var n = parseValue(v);
        var value = n.value;

        if ( value === 0 ) {
            return false; // Cannot divide by zero
        }
        if ( value === 1 ) {
            return true; // Any number is divisible by 1
        }
        if ( value === 2 ) {
            return this.isEven(); // Optimized check for 2
        }

        // For other divisors, check if remainder is zero
        return this.mod(n).equals(Integer[0]);
    };

    // SmallInteger uses BigInteger's isDivisibleBy
    SmallInteger.prototype.isDivisibleBy = BigInteger.prototype.isDivisibleBy;


    /**
     * Checks if a number is a basic prime (2, 3, 5) or small composite.
     * @param {Integer} v - The number to check.
     * @returns {boolean|undefined} True/False if determined, undefined if more checks needed.
     */
    function isBasicPrime( v ) {
        var n = v.abs();

        if ( n.isUnit() ) {
            return false; // 1 is not prime
        }
        if ( n.equals(2) || n.equals(3) || n.equals(5) ) {
            return true;
        }
        if ( n.isEven() || n.isDivisibleBy(3) || n.isDivisibleBy(5) ) {
            return false; // Divisible by 2, 3, or 5
        }
        if ( n.lesser(25) ) {
            return true; // Primes less than 25 (excluding 2,3,5 already checked): 7, 11, 13, 17, 19, 23
        }
    }


    // Prototype method for BigInteger primality test (Miller-Rabin)
    BigInteger.prototype.isPrime = function () {
        var isPrime = isBasicPrime(this);
        if ( isPrime !== undefined ) {
            return isPrime;
        }

        // Miller-Rabin test for larger numbers
        var n = this.abs(),
            nPrev = n.prev(); // n-1
        var a = [2, 3, 5, 7, 11, 13, 17, 19], // Bases for the test
            b = nPrev,
            d, t, i, x;

        // Find d and s such that n-1 = d * 2^s (b is d here)
        while ( b.isEven() ) {
            b = b.divide(2);
        }

        // For each base 'a'
        for ( i = 0; i < a.length; i++ ) {
            x = bigInt(a[i]).modPow(b, n); // a^d mod n

            if ( x.equals(Integer[1]) || x.equals(nPrev) ) {
                continue; // n is probably prime for this base
            }

            // Check x^(d * 2^r) mod n for r = 1 to s-1
            for ( t = true, d = b; t && d.lesser(nPrev); d = d.multiply(2) ) {
                x = x.square().mod(n);
                if ( x.equals(nPrev) ) {
                    t = false; // Found a witness, n is probably prime
                }
            }

            if ( t ) {
                return false; // n is composite
            }
        }
        return true; // n is probably prime
    };

    // SmallInteger uses BigInteger's isPrime
    SmallInteger.prototype.isPrime = BigInteger.prototype.isPrime;


    // Prototype method for BigInteger probable primality test
    BigInteger.prototype.isProbablePrime = function ( iterations ) {
        var isPrime = isBasicPrime(this);
        if ( isPrime !== undefined ) {
            return isPrime;
        }

        var n = this.abs();
        var t = iterations === undefined ? 5 : iterations; // Default iterations

        // Perform Miller-Rabin test 't' times
        for ( var i = 0; i < t; i++ ) {
            var a = bigInt.randBetween(2, n.minus(2)); // Random base a
            if ( !a.modPow(n.prev(), n).isUnit() ) {
                return false; // n is composite
            }
        }
        return true; // n is probably prime
    };

    // SmallInteger uses BigInteger's isProbablePrime
    SmallInteger.prototype.isProbablePrime = BigInteger.prototype.isProbablePrime;


    // Prototype method for modular inverse (a^-1 mod n)
    BigInteger.prototype.modInv = function ( n ) {
        var t = bigInt.zero,
            newT = bigInt.one,
            r = parseValue(n),
            newR = this.abs(),
            q, lastT, lastR;

        // Extended Euclidean algorithm
        while ( !newR.equals(bigInt.zero) ) {
            q = r.divide(newR);
            lastT = t;
            lastR = r;
            t = newT;
            r = newR;
            newT = lastT.subtract(q.multiply(newT));
            newR = lastR.subtract(q.multiply(newR));
        }

        // If gcd(this, n) is not 1, then modular inverse does not exist
        if ( !r.equals(1) ) {
            throw new Error(this.toString() + " and " + n.toString() + " are not co-prime");
        }

        // Adjust 't' to be positive
        if ( t.compare(0) === -1 ) {
            t = t.add(n);
        }

        // Adjust sign if original number was negative
        if ( this.isNegative() ) {
            return t.negate();
        }

        return t;
    };

    // SmallInteger uses BigInteger's modInv
    SmallInteger.prototype.modInv = BigInteger.prototype.modInv;


    // Prototype method for BigInteger increment (next number)
    BigInteger.prototype.next = function () {
        var value = this.value;

        // If negative, increment means moving towards zero
        if ( this.sign ) {
            return subtractSmall(value, 1, this.sign);
        }
        return new BigInteger(addSmall(value, 1), this.sign);
    };


    // Prototype method for SmallInteger increment
    SmallInteger.prototype.next = function () {
        var value = this.value;

        // If value + 1 is still precise, return SmallInteger
        if ( value + 1 < MAX_INT ) {
            return new SmallInteger(value + 1);
        }
        // Otherwise, it overflows to a BigInteger
        return new BigInteger(MAX_INT_ARR, false);
    };


    // Prototype method for BigInteger decrement (previous number)
    BigInteger.prototype.prev = function () {
        var value = this.value;

        // If negative, decrement means moving away from zero
        if ( this.sign ) {
            return new BigInteger(addSmall(value, 1), true);
        }
        return subtractSmall(value, 1, this.sign);
    };


    // Prototype method for SmallInteger decrement
    SmallInteger.prototype.prev = function () {
        var value = this.value;

        // If value - 1 is still precise, return SmallInteger
        if ( value - 1 > -MAX_INT ) {
            return new SmallInteger(value - 1);
        }
        // Otherwise, it underflows to a BigInteger
        return new BigInteger(MAX_INT_ARR, true); // MAX_INT_ARR is absolute value, sign true makes it negative
    };


    // Precompute powers of 2 up to BASE for efficient bit shifts
    var powersOfTwo = [1];
    while ( 2 * powersOfTwo[powersOfTwo.length - 1] <= BASE ) {
        powersOfTwo.push(2 * powersOfTwo[powersOfTwo.length - 1]);
    }
    var powers2Length = powersOfTwo.length,
        highestPower2 = powersOfTwo[powers2Length - 1];


    /**
     * Checks if a shift amount is "small" enough to be handled directly.
     * @param {*} n - The shift amount.
     * @returns {boolean} True if small, false otherwise.
     */
    function shift_isSmall( n ) {
        return (typeof n === "number" || typeof n === "string") && +Math.abs(n) <= BASE || n instanceof BigInteger && n.value.length <= 1;
    }


    // Prototype method for BigInteger left bit shift
    BigInteger.prototype.shiftLeft = function ( n ) {
        if ( !shift_isSmall(n) ) {
            throw new Error(String(n) + " is too large for shifting.");
        }
        n = +n; // Ensure n is a number

        if ( n < 0 ) {
            return this.shiftRight(-n); // Negative shift left is shift right
        }

        var result = this;
        if ( result.isZero() ) {
            return result;
        }

        // Shift by multiples of `powers2Length` (i.e., multiply by `highestPower2`)
        while ( n >= powers2Length ) {
            result = result.multiply(highestPower2);
            n -= powers2Length - 1; // Adjust n for the number of actual shifts by `highestPower2`
        }

        // Final shift by remaining amount
        return result.multiply(powersOfTwo[n]);
    };

    // SmallInteger uses BigInteger's shiftLeft
    SmallInteger.prototype.shiftLeft = BigInteger.prototype.shiftLeft;


    // Prototype method for BigInteger right bit shift
    BigInteger.prototype.shiftRight = function ( n ) {
        var remQuo;
        if ( !shift_isSmall(n) ) {
            throw new Error(String(n) + " is too large for shifting.");
        }
        n = +n; // Ensure n is a number

        if ( n < 0 ) {
            return this.shiftLeft(-n); // Negative shift right is shift left
        }

        var result = this;

        // Handle zero or negative unit cases (shifting them right keeps them)
        while ( n >= powers2Length ) {
            if ( result.isZero() || result.isNegative() && result.isUnit() ) {
                return result;
            }
            remQuo = divModAny(result, highestPower2);
            // Adjust quotient for negative numbers (floor division behavior)
            result = remQuo[1].isNegative() ? remQuo[0].prev() : remQuo[0];
            n -= powers2Length - 1;
        }

        // Final shift
        remQuo = divModAny(result, powersOfTwo[n]);
        return remQuo[1].isNegative() ? remQuo[0].prev() : remQuo[0];
    };

    // SmallInteger uses BigInteger's shiftRight
    SmallInteger.prototype.shiftRight = BigInteger.prototype.shiftRight;


    /**
     * Performs a bitwise operation on two BigIntegers.
     * @param {Integer} x - First operand.
     * @param {Integer} y - Second operand.
     * @param {function(number, number): number} fn - The bitwise function (e.g., & | ^).
     * @returns {Integer} The result of the bitwise operation.
     */
    function bitwise( x, y, fn ) {
        y = parseValue(y);

        var xSign = x.isNegative(),
            ySign = y.isNegative();

        // Convert to 2's complement representation for negative numbers
        var xRem = xSign ? x.not() : x,
            yRem = ySign ? y.not() : y;

        var xDigit = 0,
            yDigit = 0;
        var xDivMod = null,
            yDivMod = null;
        var result = [];

        // Process digits from least significant to most significant
        while ( !xRem.isZero() || !yRem.isZero() ) {
            xDivMod = divModAny(xRem, highestPower2);
            xDigit = xDivMod[1].toJSNumber();
            if ( xSign ) {
                xDigit = highestPower2 - 1 - xDigit; // Invert bits for negative numbers
            }

            yDivMod = divModAny(yRem, highestPower2);
            yDigit = yDivMod[1].toJSNumber();
            if ( ySign ) {
                yDigit = highestPower2 - 1 - yDigit; // Invert bits for negative numbers
            }

            xRem = xDivMod[0];
            yRem = yDivMod[0];

            result.push(fn(xDigit, yDigit)); // Apply bitwise function
        }

        // Determine the sign of the result based on the bitwise function applied to signs
        var sum = fn(xSign ? 1 : 0, ySign ? 1 : 0) !== 0 ? bigInt(-1) : bigInt(0);

        // Reconstruct the number from the result digits
        for ( var i = result.length - 1; i >= 0; i -= 1 ) {
            sum = sum.multiply(highestPower2).add(bigInt(result[i]));
        }

        return sum;
    }


    // Prototype method for BigInteger bitwise NOT
    BigInteger.prototype.not = function () {
        return this.negate().prev(); // ~x = -x - 1
    };

    // SmallInteger uses BigInteger's not
    SmallInteger.prototype.not = BigInteger.prototype.not;


    // Prototype method for BigInteger bitwise AND
    BigInteger.prototype.and = function ( n ) {
        return bitwise(this, n, function ( a, b ) {
            return a & b;
        });
    };

    // SmallInteger uses BigInteger's and
    SmallInteger.prototype.and = BigInteger.prototype.and;


    // Prototype method for BigInteger bitwise OR
    BigInteger.prototype.or = function ( n ) {
        return bitwise(this, n, function ( a, b ) {
            return a | b;
        });
    };

    // SmallInteger uses BigInteger's or
    SmallInteger.prototype.or = BigInteger.prototype.or;


    // Prototype method for BigInteger bitwise XOR
    BigInteger.prototype.xor = function ( n ) {
        return bitwise(this, n, function ( a, b ) {
            return a ^ b;
        });
    };

    // SmallInteger uses BigInteger's xor
    SmallInteger.prototype.xor = BigInteger.prototype.xor;


    // Constants for rough LOB (Least Significant Bit) calculation
    const LOBMASK_I = 1 << 30; // Mask for 30 bits for small integers
    const LOBMASK_BI = (BASE & -BASE) * (BASE & -BASE) | LOBMASK_I; // Mask for BigIntegers


    /**
     * Calculates a "rough" LOB (least significant bit) for an Integer.
     * This is an approximation and might not be exact for BigIntegers but useful for GCD.
     * @param {Integer} n - The Integer.
     * @returns {number} The approximate LOB.
     */
    function roughLOB( n ) {
        var v = n.value,
            x = typeof v === "number" ? v | LOBMASK_I : v[0] + v[1] * BASE | LOBMASK_BI;
        return x & -x; // Returns the lowest set bit
    }


    /**
     * Calculates the integer logarithm of a value to a given base.
     * Used for bitLength calculation.
     * @param {Integer} value - The number.
     * @param {Integer} base - The base of the logarithm.
     * @returns {{p: Integer, e: number}} Object containing power and exponent.
     */
    function integerLogarithm( value, base ) {
        if ( base.compareTo(value) <= 0 ) {
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


    // Prototype method for BigInteger bit length calculation
    BigInteger.prototype.bitLength = function () {
        var n = this;
        // For negative numbers, bitLength is defined for (~n)
        if ( n.compareTo(bigInt(0)) < 0 ) {
            n = n.negate().subtract(bigInt(1));
        }
        if ( n.compareTo(bigInt(0)) === 0 ) {
            return bigInt(0);
        }
        // Use integer logarithm to calculate bit length
        return bigInt(integerLogarithm(n, bigInt(2)).e).add(bigInt(1));
    };

    // SmallInteger uses BigInteger's bitLength
    SmallInteger.prototype.bitLength = BigInteger.prototype.bitLength;


    /**
     * Returns the maximum of two Integer values.
     * @param {Integer|number|string} a - First value.
     * @param {Integer|number|string} b - Second value.
     * @returns {Integer} The larger of the two values.
     */
    function max( a, b ) {
        a = parseValue(a);
        b = parseValue(b);
        return a.greater(b) ? a : b;
    }


    /**
     * Returns the minimum of two Integer values.
     * @param {Integer|number|string} a - First value.
     * @param {Integer|number|string} b - Second value.
     * @returns {Integer} The smaller of the two values.
     */
    function min( a, b ) {
        a = parseValue(a);
        b = parseValue(b);
        return a.lesser(b) ? a : b;
    }


    /**
     * Calculates the greatest common divisor (GCD) of two Integer values.
     * Uses binary GCD algorithm for efficiency.
     * @param {Integer|number|string} a - First value.
     * @param {Integer|number|string} b - Second value.
     * @returns {Integer} The GCD.
     */
    function gcd( a, b ) {
        a = parseValue(a).abs();
        b = parseValue(b).abs();

        if ( a.equals(b) ) {
            return a;
        }
        if ( a.isZero() ) {
            return b;
        }
        if ( b.isZero() ) {
            return a;
        }

        var c = Integer[1],
            d, t;

        // Remove common factors of 2
        while ( a.isEven() && b.isEven() ) {
            d = Math.min(roughLOB(a), roughLOB(b));
            a = a.divide(d);
            b = b.divide(d);
            c = c.multiply(d);
        }

        // Remove factors of 2 from 'a'
        while ( a.isEven() ) {
            a = a.divide(roughLOB(a));
        }

        // Main Euclidean loop
        do {
            // Remove factors of 2 from 'b'
            while ( b.isEven() ) {
                b = b.divide(roughLOB(b));
            }

            // Ensure a <= b
            if ( a.greater(b) ) {
                t = b;
                b = a;
                a = t;
            }

            b = b.subtract(a); // b = b - a
        } while ( !b.isZero() );

        return c.isUnit() ? a : a.multiply(c); // Multiply back common factors of 2
    }


    /**
     * Calculates the least common multiple (LCM) of two Integer values.
     * LCM(a, b) = |a * b| / GCD(a, b)
     * @param {Integer|number|string} a - First value.
     * @param {Integer|number|string} b - Second value.
     * @returns {Integer} The LCM.
     */
    function lcm( a, b ) {
        a = parseValue(a).abs();
        b = parseValue(b).abs();
        return a.divide(gcd(a, b)).multiply(b);
    }


    /**
     * Generates a random BigInt between two given limits (inclusive).
     * @param {Integer|number|string} a - Lower bound.
     * @param {Integer|number|string} b - Upper bound.
     * @returns {Integer} A random Integer within the range.
     */
    function randBetween( a, b ) {
        a = parseValue(a);
        b = parseValue(b);

        var low = min(a, b),
            high = max(a, b);
        var range = high.subtract(low).add(1);

        // If range is small, use Math.random directly
        if ( range.isSmall ) {
            return low.add(Math.floor(Math.random() * range));
        }

        // For large ranges, generate random digits
        var length = range.value.length - 1;
        var result = [],
            restricted = true;

        for ( var i = length; i >= 0; i-- ) {
            var top = restricted ? range.value[i] : BASE;
            var digit = truncate(Math.random() * top);
            result.unshift(digit);
            if ( digit < top ) {
                restricted = false;
            }
        }

        result = arrayToSmall(result);
        return low.add(typeof result === "number" ? new SmallInteger(result) : new BigInteger(result, false));
    }


    /**
     * Parses a string representation of a number in a given base.
     * @param {string} text - The string to parse.
     * @param {number} base - The base (radix) of the number.
     * @returns {Integer} The parsed Integer.
     * @throws {Error} If the string contains invalid digits for the base.
     */
    var parseBase = function ( text, base ) {
        var length = text.length;
        var i;
        var absBase = Math.abs(base);

        // Validate input digits for the given base
        for ( var i = 0; i < length; i++ ) {
            var c = text[i].toLowerCase();
            if ( c === "-" ) {
                continue;
            }
            if ( /[a-z0-9]/.test(c) ) {
                if ( /[0-9]/.test(c) && +c >= absBase ) {
                    if ( c === "1" && absBase === 1 ) {
                        continue;
                    }
                    throw new Error(c + " is not a valid digit in base " + base + ".");
                } else if ( c.charCodeAt(0) - 87 >= absBase ) { // 'a' is charCode 97
                    throw new Error(c + " is not a valid digit in base " + base + ".");
                }
            }
        }

        // Optimization for small bases (2-36) that fit in JS numbers
        if ( 2 <= base && base <= 36 ) {
            if ( length <= LOG_MAX_INT / Math.log(base) ) {
                var result = parseInt(text, base);
                if ( isNaN(result) ) {
                    throw new Error(c + " is not a valid digit in base " + base + "."); // Should not happen after initial validation
                }
                return new SmallInteger(parseInt(text, base));
            }
        }

        base = parseValue(base); // Ensure base is an Integer object
        var digits = [];
        var isNegative = text[0] === "-";

        // Convert each character to its digit value
        for ( i = isNegative ? 1 : 0; i < text.length; i++ ) {
            var c = text[i].toLowerCase(),
                charCode = c.charCodeAt(0);

            if ( 48 <= charCode && charCode <= 57 ) { // '0'-'9'
                digits.push(parseValue(c));
            } else if ( 97 <= charCode && charCode <= 122 ) { // 'a'-'z'
                digits.push(parseValue(c.charCodeAt(0) - 87));
            } else if ( c === "<" ) { // Handle custom digits like <10>
                var start = i;
                do {
                    i++;
                } while ( text[i] !== ">" );
                digits.push(parseValue(text.slice(start + 1, i)));
            } else {
                throw new Error(c + " is not a valid character");
            }
        }

        return parseBaseFromArray(digits, base, isNegative);
    };


    /**
     * Converts an array of digits (parsed from a string) in a given base to an Integer.
     * @param {Integer[]} digits - Array of digit values (as Integers).
     * @param {Integer} base - The base of the number.
     * @param {boolean} isNegative - True if the original number was negative.
     * @returns {Integer} The resulting Integer.
     */
    function parseBaseFromArray( digits, base, isNegative ) {
        var val = Integer[0],
            pow = Integer[1],
            i;

        // Horner's method: (d_n * base^(n-1) + ... + d_1 * base + d_0)
        for ( i = digits.length - 1; i >= 0; i-- ) {
            val = val.add(digits[i].times(pow));
            pow = pow.times(base);
        }

        return isNegative ? val.negate() : val;
    }


    /**
     * Converts a single digit (0-35) or custom digit to its string representation.
     * @param {number} digit - The digit value.
     * @returns {string} The string representation.
     */
    function stringify( digit ) {
        if ( digit <= 35 ) {
            return "0123456789abcdefghijklmnopqrstuvwxyz".charAt(digit);
        }
        return "<" + digit + ">"; // For custom digits > 35
    }


    /**
     * Converts an Integer to an array of digits in a specified base.
     * @param {Integer} n - The Integer to convert.
     * @param {Integer} base - The target base.
     * @returns {{value: number[], isNegative: boolean}} Object with digit array and sign.
     * @throws {Error} For invalid base conversions (e.g., base 0).
     */
    function toBase( n, base ) {
        base = bigInt(base);

        if ( base.isZero() ) {
            if ( n.isZero() ) {
                return {
                    value: [0],
                    isNegative: false
                };
            }
            throw new Error("Cannot convert nonzero numbers to base 0.");
        }

        // Special case for base -1
        if ( base.equals(-1) ) {
            if ( n.isZero() ) {
                return {
                    value: [0],
                    isNegative: false
                };
            }
            if ( n.isNegative() ) {
                // For negative n, e.g., -5 in base -1 is 10101 (1*(-1)^4 + 0*(-1)^3 + 1*(-1)^2 + 0*(-1)^1 + 1*(-1)^0)
                return {
                    value: [].concat.apply([], Array.apply(null, Array(-n)).map(Array.prototype.valueOf, [1, 0])),
                    isNegative: false
                };
            }
            // For positive n, e.g., 5 in base -1 is 10101
            var arr = Array.apply(null, Array(+n - 1)).map(Array.prototype.valueOf, [0, 1]);
            arr.unshift([1]);
            return {
                value: [].concat.apply([], arr),
                isNegative: false
            };
        }

        var neg = false;
        if ( n.isNegative() && base.isPositive() ) {
            neg = true;
            n = n.abs();
        }

        // Special case for base 1
        if ( base.equals(1) ) {
            if ( n.isZero() ) {
                return {
                    value: [0],
                    isNegative: false
                };
            }
            return {
                value: Array.apply(null, Array(+n)).map(Number.prototype.valueOf, 1),
                isNegative: neg
            };
        }

        var out = [];
        var left = n,
            divmod;

        // Repeatedly divide by base and collect remainders
        while ( left.isNegative() || left.compareAbs(base) >= 0 ) {
            divmod = left.divmod(base);
            left = divmod.quotient;
            var digit = divmod.remainder;

            // Handle negative remainders (adjust quotient and remainder)
            if ( digit.isNegative() ) {
                digit = base.minus(digit).abs();
                left = left.next();
            }
            out.push(digit.toJSNumber());
        }

        out.push(left.toJSNumber()); // Add the final quotient
        return {
            value: out.reverse(),
            isNegative: neg
        };
    }


    /**
     * Converts an Integer to its string representation in a specified base.
     * @param {Integer} n - The Integer to convert.
     * @param {number} base - The target base.
     * @returns {string} The string representation.
     */
    function toBaseString( n, base ) {
        var arr = toBase(n, base);
        return (arr.isNegative ? "-" : "") + arr.value.map(stringify).join("");
    }


    // Prototype method for BigInteger toArray (base conversion)
    BigInteger.prototype.toArray = function ( radix ) {
        return toBase(this, radix);
    };

    // SmallInteger uses BigInteger's toArray
    SmallInteger.prototype.toArray = function ( radix ) {
        return toBase(this, radix);
    };


    // Prototype method for BigInteger toString
    BigInteger.prototype.toString = function ( radix ) {
        if ( radix === undefined ) {
            radix = 10;
        }

        if ( radix !== 10 ) {
            return toBaseString(this, radix);
        }

        var v = this.value,
            l = v.length,
            str = String(v[--l]), // Start with the most significant digit
            zeros = "0000000",
            digit;

        // Concatenate remaining digits, padding with zeros if necessary
        while ( --l >= 0 ) {
            digit = String(v[l]);
            str += zeros.slice(digit.length) + digit;
        }

        var sign = this.sign ? "-" : "";
        return sign + str;
    };


    // Prototype method for SmallInteger toString
    SmallInteger.prototype.toString = function ( radix ) {
        if ( radix === undefined ) {
            radix = 10;
        }
        if ( radix != 10 ) {
            return toBaseString(this, radix);
        }
        return String(this.value);
    };


    // JSON serialization for both types
    BigInteger.prototype.toJSON = SmallInteger.prototype.toJSON = function () {
        return this.toString();
    };


    // Prototype method for BigInteger valueOf (for implicit type conversions)
    BigInteger.prototype.valueOf = function () {
        return parseInt(this.toString(), 10);
    };

    // Alias for valueOf
    BigInteger.prototype.toJSNumber = BigInteger.prototype.valueOf;


    // Prototype method for SmallInteger valueOf
    SmallInteger.prototype.valueOf = function () {
        return this.value;
    };

    // Alias for valueOf
    SmallInteger.prototype.toJSNumber = SmallInteger.prototype.valueOf;


    /**
     * Parses a string value into an Integer object.
     * Handles scientific notation and checks for valid integer format.
     * @param {string} v - The string to parse.
     * @returns {Integer} The parsed Integer.
     * @throws {Error} If the string is not a valid integer.
     */
    function parseStringValue( v ) {
        // Try to parse as a precise small integer first
        if ( isPrecise(+v) ) {
            var x = +v;
            if ( x === truncate(x) ) {
                return new SmallInteger(x);
            }
            throw new Error("Invalid integer: " + v);
        }

        var sign = v[0] === "-";
        if ( sign ) {
            v = v.slice(1);
        }

        var split = v.split(/e/i); // Handle scientific notation
        if ( split.length > 2 ) {
            throw new Error("Invalid integer: " + split.join("e"));
        }

        // Process scientific notation (e.g., "1.23e+5")
        if ( split.length === 2 ) {
            var exp = split[1];
            if ( exp[0] === "+" ) {
                exp = exp.slice(1);
            }
            exp = +exp;
            if ( exp !== truncate(exp) || !isPrecise(exp) ) {
                throw new Error("Invalid integer: " + exp + " is not a valid exponent.");
            }

            var text = split[0];
            var decimalPlace = text.indexOf(".");
            if ( decimalPlace >= 0 ) {
                exp -= text.length - decimalPlace - 1;
                text = text.slice(0, decimalPlace) + text.slice(decimalPlace + 1);
            }

            if ( exp < 0 ) {
                throw new Error("Cannot include negative exponent part for integers");
            }
            text += new Array(exp + 1).join("0"); // Append zeros
            v = text;
        }

        // Final validation for integer format
        var isValid = /^([0-9][0-9]*)$/.test(v);
        if ( !isValid ) {
            throw new Error("Invalid integer: " + v);
        }

        // Convert string to digit array representation
        var r = [],
            max = v.length,
            l = LOG_BASE,
            min = max - l;

        while ( max > 0 ) {
            r.push(+v.slice(min, max));
            min -= l;
            if ( min < 0 ) {
                min = 0;
            }
            max -= l;
        }

        trim(r); // Remove leading zeros
        return new BigInteger(r, sign);
    }


    /**
     * Parses a number value into an Integer object.
     * @param {number} v - The number to parse.
     * @returns {Integer} The parsed Integer.
     * @throws {Error} If the number is not an integer or is not precise.
     */
    function parseNumberValue( v ) {
        if ( isPrecise(v) ) {
            if ( v !== truncate(v) ) {
                throw new Error(v + " is not an integer.");
            }
            return new SmallInteger(v);
        }
        return parseStringValue(v.toString()); // Fallback to string parsing for large numbers
    }


    /**
     * Parses any value into an Integer object.
     * This is the main entry point for converting input to BigInt/SmallInt.
     * @param {*} v - The value to parse (number, string, or existing Integer).
     * @returns {Integer} The parsed Integer.
     */
    function parseValue( v ) {
        if ( typeof v === "number" ) {
            return parseNumberValue(v);
        }
        if ( typeof v === "string" ) {
            return parseStringValue(v);
        }
        return v; // Assume it's already an Integer object
    }


    // Pre-populate an array with SmallInteger instances for 0-999
    // This acts as a cache for frequently used small integers.
    for ( var i = 0; i < 1e3; i++ ) {
        Integer[i] = new SmallInteger(i);
        if ( i > 0 ) {
            Integer[-i] = new SmallInteger(-i);
        }
    }

    // Export common constants and utility functions
    Integer.one = Integer[1];
    Integer.zero = Integer[0];
    Integer.minusOne = Integer[-1];
    Integer.max = max;
    Integer.min = min;
    Integer.gcd = gcd;
    Integer.lcm = lcm;

    // Type checking utility
    Integer.isInstance = function ( x ) {
        return x instanceof BigInteger || x instanceof SmallInteger;
    };

    Integer.randBetween = randBetween;

    // Helper for creating BigInts from digit arrays
    Integer.fromArray = function ( digits, base, isNegative ) {
        // Map digits to Integer objects and then parse from base array
        return parseBaseFromArray(digits.map(parseValue), parseValue(base || 10), isNegative);
    };

    return Integer; // Return the main Integer constructor
}();

// The main function for processing input and generating output.
const main = arg => {
    // Trim whitespace from input and split into lines.
    const N = arg.trim().split("\n");
    // Get the first line and convert it to an array of characters.
    const tmp = N[0].split('');

    // Check if the characters at specific indices meet a condition.
    // If the 3rd char (index 2) equals the 4th char (index 3)
    // AND the 5th char (index 4) equals the 6th char (index 5)
    if ( tmp[2] == tmp[3] && tmp[4] == tmp[5] ) {
        console.log('Yes'); // Output 'Yes'
    } else {
        console.log('No');  // Otherwise, output 'No'
    }
}

// Read input from stdin and pass it to the main function.
main(require('fs').readFileSync('/dev/stdin', 'utf8'));