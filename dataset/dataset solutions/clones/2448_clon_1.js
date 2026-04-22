// This file contains a custom BigInt implementation and a main program using it.
// The BigInt library is designed to handle arbitrarily large integers in JavaScript.

    "use strict"; // Enforce strict mode for better code quality and error handling.


// The core BigInt factory function, encapsulated in an Immediately Invoked Function Expression (IIFE).
let bigInt = function ( /* This 'undefined' parameter ensures that 'undefined' is truly undefined locally */ undefined ) {
    // --- Internal Constants and Helper Variables ---
    // Base for internal array representation of BigInts.
    var BASE = 1e7, /* 10,000,000 */
        // Logarithm of the base, used for string conversions and other calculations.
        LOG_BASE = 7, /* log10(1e7) */
        // Maximum safe integer in JavaScript.
        MAX_INT = 9007199254740992, /* 2^53 */
        // MAX_INT represented as an array of base-1e7 digits.
        MAX_INT_ARR = smallToArray(MAX_INT),
        // Logarithm of MAX_INT, useful for optimizing number parsing.
        LOG_MAX_INT = Math.log(MAX_INT);

    // --- Core Constructor Function for BigInts ---
    // The main entry point for creating BigInt instances.
    function Integer ( v, radix ) {
        // If no value is provided, return the BigInt zero constant.
        if ( typeof v === "undefined" ) {
             return Integer[0];
        }

        // If a radix is specified, parse the value according to that radix.
        if ( typeof radix !== "undefined" ) {
            // If radix is 10, use the standard parseValue function.
            if ( +radix === 10 ) {
                return parseValue(v);
            }
            // Otherwise, parse using the specified base.
            return parseBase(v, radix);
        }

        // If no radix, default to parsing the value directly (assumed base 10 or number).
        return parseValue(v);
    }

    // --- BigInteger Class Definition ---
    // Represents large integers that cannot fit into standard JavaScript numbers.
    function BigInteger ( value, sign ) {
        this.value = value; // An array of digits in base BASE.
        this.sign = sign;   // Boolean: true for negative, false for positive.
        this.isSmall = false; // Flag indicating it's a large integer.
    }

    // BigInteger inherits from Integer.
    BigInteger.prototype = Object.create(Integer.prototype);


    // --- SmallInteger Class Definition ---
    // Represents integers that can fit into standard JavaScript numbers.
    function SmallInteger ( value ) {
        this.value = value; // The actual number.
        this.sign = value < 0; // Boolean: true if negative.
        this.isSmall = true; // Flag indicating it's a small integer.
    }

    // SmallInteger also inherits from Integer.
    SmallInteger.prototype = Object.create(Integer.prototype);


    // --- Utility Functions ---

    // Checks if a given number `n` can be precisely represented by JavaScript's number type.
    function isPrecise ( n ) {
        return -MAX_INT < n && n < MAX_INT;
    }

    // Converts a small JavaScript number into an array representation suitable for BigInt.
    function smallToArray ( n ) {
        // Handle small numbers efficiently.
        if ( n < 1e7 ) {
            return [n];
        }

        // Handle numbers up to 1e14.
        if ( n < 1e14 ) {
            return [ n % 1e7, Math.floor(n / 1e7) ];
        }

        // Handle numbers up to MAX_INT (approx 9e15).
        return [ n % 1e7, Math.floor(n / 1e7) % 1e7, Math.floor(n / 1e14) ];
    }

    // Converts an array of digits back to a small JavaScript number if possible.
    function arrayToSmall ( arr ) {
        trim(arr); // Remove leading zeros.
        var length = arr.length;

        // If the array is small enough and its absolute value is within MAX_INT.
        if ( length < 4 && compareAbs(arr, MAX_INT_ARR) < 0 ) {
            switch ( length ) {
                case 0:
                    return 0; // Empty array means zero.
                case 1:
                    return arr[0]; // Single digit.
                case 2:
                    return arr[0] + arr[1] * BASE; // Two digits.
                default:
                    return arr[0] + (arr[1] + arr[2] * BASE) * BASE; // Three digits.
            }
        }
        return arr; // Otherwise, return the array as is (it's a BigInt).
    }

    // Removes leading zero digits from a number array.
    function trim ( v ) {
        var i = v.length;
        while ( v[--i] === 0 ) {
             /* Loop until a non-zero digit is found or array is exhausted */
        }
        v.length = i + 1; // Adjust the array length.
    }

    // Creates a new array of a specified length, initialized with zeros.
    function createArray ( length ) {
        var x = new Array(length);
        var i = -1;
        while ( ++i < length ) {
            x[i] = 0;
        }
        return x;
    }

    // Truncates a number towards zero (like Math.trunc).
    function truncate ( n ) {
        if ( n > 0 ) {
            return Math.floor(n);
        }
        return Math.ceil(n);
    }

    // --- Addition Operations ---

    // Adds two arrays of digits (representing positive numbers).
    function add ( a, b ) {
        var l_a = a.length,
            l_b = b.length,
            r = new Array(l_a),
            carry = 0,
            base = BASE,
            sum,
            i;

        // Add corresponding digits from both arrays.
        for ( i = 0; i < l_b; i++ ) {
            sum = a[i] + b[i] + carry;
            carry = sum >= base ? 1 : 0;
            r[i] = sum - carry * base;
        }

        // Propagate carry through the remaining digits of the longer array.
        while ( i < l_a ) {
            sum = a[i] + carry;
            carry = sum === base ? 1 : 0;
            r[i++] = sum - carry * base;
        }

        // If there's a final carry, add it to the result.
        if ( carry > 0 ) {
            r.push(carry);
        }
        return r;
    }

    // Adds two arrays, ensuring the longer array is the first argument to `add`.
    function addAny ( a, b ) {
        if ( a.length >= b.length ) {
            return add(a, b);
        }
        return add(b, a);
    }

    // Adds a small number (carry) to an array of digits.
    function addSmall ( a, carry ) {
        var l = a.length,
            r = new Array(l),
            base = BASE,
            sum,
            i;

        // Add carry to each digit, propagating new carries.
        for ( i = 0; i < l; i++ ) {
            sum = a[i] - base + carry; // Trick to handle negative sum correctly.
            carry = Math.floor(sum / base);
            r[i] = sum - carry * base;
            carry += 1;
        }

        // Propagate any remaining carry.
        while ( carry > 0 ) {
            r[i++] = carry % base;
            carry = Math.floor(carry / base);
        }
        return r;
    }

    // BigInteger.prototype.add method.
    BigInteger.prototype.add = function ( v ) {
        var n = parseValue(v); // Parse the input value.

        // If signs are different, perform subtraction.
        if ( this.sign !== n.sign ) {
            return this.subtract(n.negate());
        }

        var a = this.value,
            b = n.value;

        // If the other number is small, use optimized addSmall.
        if ( n.isSmall ) {
            return new BigInteger(addSmall(a, Math.abs(b)), this.sign);
        }

        // Otherwise, use general addAny for two large numbers.
        return new BigInteger(addAny(a, b), this.sign);
    };

    // Alias for add.
    BigInteger.prototype.plus = BigInteger.prototype.add;


    // SmallInteger.prototype.add method.
    SmallInteger.prototype.add = function ( v ) {
        var n = parseValue(v);
        var a = this.value;

        // If signs are different (and 'a' is negative XOR 'n' is negative), subtract.
        if ( a < 0 !== n.sign ) {
            return this.subtract(n.negate());
        }

        var b = n.value;

        // If both are small integers.
        if ( n.isSmall ) {
            // Check if their sum is still precise.
            if ( isPrecise(a + b) ) {
                return new SmallInteger(a + b);
            }
            // If not, convert 'b' to array and use addSmall.
            b = smallToArray(Math.abs(b));
        }

        // If 'n' was large or 'a+b' wasn't precise, use addSmall with 'a' converted to array.
        return new BigInteger(addSmall(b, Math.abs(a)), a < 0);
    };

    // Alias for add.
    SmallInteger.prototype.plus = SmallInteger.prototype.add;


    // --- Subtraction Operations ---

    // Subtracts array `b` from array `a` (assuming a >= b).
    function subtract ( a, b ) {
        var a_l = a.length,
            b_l = b.length,
            r = new Array(a_l),
            borrow = 0,
            base = BASE,
            i,
            difference;

        // Subtract corresponding digits.
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

        // Propagate borrow through remaining digits of `a`.
        for ( i = b_l; i < a_l; i++ ) {
            difference = a[i] - borrow;
            if ( difference < 0 ) {
                difference += base;
            } else {
                r[i++] = difference;
                break; // No more borrow, copy remaining digits directly.
            }
            r[i] = difference;
        }

        // Copy any remaining digits from `a`.
        for ( ; i < a_l; i++ ) {
            r[i] = a[i];
        }

        trim(r); // Remove leading zeros.
        return r;
    }

    // Performs subtraction between two arrays, handling signs and order.
    function subtractAny ( a, b, sign ) {
        var value;

        // Determine which array is larger in absolute value.
        if ( compareAbs(a, b) >= 0 ) {
            value = subtract(a, b);
        } else {
            value = subtract(b, a);
            sign = !sign; // Flip the sign if 'b' was larger.
        }

        value = arrayToSmall(value); // Try to convert result to SmallInteger.

        // If result is a number, return SmallInteger.
        if ( typeof value === "number" ) {
            if ( sign ) {
                value = -value;
            }
            return new SmallInteger(value);
        }

        // Otherwise, return BigInteger.
        return new BigInteger(value, sign);
    }

    // Subtracts a small number `b` from an array `a`.
    function subtractSmall ( a, b, sign ) {
        var l = a.length,
            r = new Array(l),
            carry = -b, // `carry` is effectively the negative of `b` for subtraction.
            base = BASE,
            i,
            difference;

        for ( i = 0; i < l; i++ ) {
            difference = a[i] + carry; // a[i] - b (or a[i] - carry)
            carry = Math.floor(difference / base);
            difference %= base;
            r[i] = difference < 0 ? difference + base : difference;
        }

        r = arrayToSmall(r); // Try to convert result to SmallInteger.

        // If result is a number, return SmallInteger.
        if ( typeof r === "number" ) {
            if ( sign ) {
                r = -r;
            }
            return new SmallInteger(r);
        }

        // Otherwise, return BigInteger.
        return new BigInteger(r, sign);
    }

    // BigInteger.prototype.subtract method.
    BigInteger.prototype.subtract = function ( v ) {
        var n = parseValue(v); // Parse the input value.

        // If signs are different, perform addition with negated value.
        if ( this.sign !== n.sign ) {
            return this.add(n.negate());
        }

        var a = this.value,
            b = n.value;

        // If the other number is small, use optimized subtractSmall.
        if ( n.isSmall ) {
            return subtractSmall(a, Math.abs(b), this.sign);
        }

        // Otherwise, use general subtractAny for two large numbers.
        return subtractAny(a, b, this.sign);
    };

    // Alias for subtract.
    BigInteger.prototype.minus = BigInteger.prototype.subtract;


    // SmallInteger.prototype.subtract method.
    SmallInteger.prototype.subtract = function ( v ) {
        var n = parseValue(v);
        var a = this.value;

        // If signs are different (and 'a' is negative XOR 'n' is negative), add.
        if ( a < 0 !== n.sign ) {
            return this.add(n.negate());
        }

        var b = n.value;

        // If both are small integers, perform direct subtraction.
        if ( n.isSmall ) {
            return new SmallInteger(a - b);
        }

        // If 'n' is large, subtract 'a' (converted to array) from 'b'.
        return subtractSmall(b, Math.abs(a), a >= 0);
    };

    // Alias for subtract.
    SmallInteger.prototype.minus = SmallInteger.prototype.subtract;


    // --- Negation and Absolute Value ---

    // Negates a BigInteger.
    BigInteger.prototype.negate = function () {
        return new BigInteger(this.value, !this.sign);
    };

    // Negates a SmallInteger.
    SmallInteger.prototype.negate = function () {
        var sign = this.sign;
        var small = new SmallInteger(-this.value);
        small.sign = !sign; // Explicitly set sign for consistency.
        return small;
    };

    // Returns the absolute value of a BigInteger.
    BigInteger.prototype.abs = function () {
        return new BigInteger(this.value, false);
    };

    // Returns the absolute value of a SmallInteger.
    SmallInteger.prototype.abs = function () {
        return new SmallInteger(Math.abs(this.value));
    };


    // --- Multiplication Operations ---

    // Multiplies two arrays of digits (long multiplication).
    function multiplyLong ( a, b ) {
        var a_l = a.length,
            b_l = b.length,
            l = a_l + b_l, // Maximum possible length of the product.
            r = createArray(l), // Result array initialized with zeros.
            base = BASE,
            product,
            carry,
            i,
            a_i,
            b_j;

        for ( i = 0; i < a_l; ++i ) {
            a_i = a[i];
            for ( var j = 0; j < b_l; ++j ) {
                b_j = b[j];
                product = a_i * b_j + r[i + j]; // Current digit product plus any existing value.
                carry = Math.floor(product / base);
                r[i + j] = product - carry * base; // Store the current digit.
                r[i + j + 1] += carry; // Add carry to the next position.
            }
        }
        trim(r); // Remove leading zeros.
        return r;
    }

    // Multiplies an array of digits by a small number.
    function multiplySmall ( a, b ) {
        var l = a.length,
            r = new Array(l),
            base = BASE,
            carry = 0,
            product,
            i;

        for ( i = 0; i < l; i++ ) {
            product = a[i] * b + carry;
            carry = Math.floor(product / base);
            r[i] = product - carry * base;
        }

        // Propagate any remaining carry.
        while ( carry > 0 ) {
            r[i++] = carry % base;
            carry = Math.floor(carry / base);
        }
        return r;
    }

    // Shifts an array of digits left by `n` positions (multiplies by BASE^n).
    function shiftLeft ( x, n ) {
        var r = [];
        while ( n-- > 0 ) {
            r.push(0); // Add zeros to the right.
        }
        return r.concat(x); // Prepend zeros to the number array.
    }

    // Karatsuba multiplication algorithm for large numbers.
    function multiplyKaratsuba ( x, y ) {
        var n = Math.max(x.length, y.length);

        // Base case: if numbers are small enough, use long multiplication.
        if ( n <= 30 ) {
            return multiplyLong(x, y);
        }

        n = Math.ceil(n / 2); // Split point.

        // Split x into a (high) and b (low), y into d (high) and c (low).
        var b = x.slice(n),
            a = x.slice(0, n),
            d = y.slice(n),
            c = y.slice(0, n);

        // Recursively compute products.
        var ac = multiplyKaratsuba(a, c),
            bd = multiplyKaratsuba(b, d),
            abcd = multiplyKaratsuba(addAny(a, b), addAny(c, d));

        // Combine results using Karatsuba formula.
        var product = addAny(addAny(ac, shiftLeft(subtract(subtract(abcd, ac), bd), n)), shiftLeft(bd, 2 * n));

        trim(product); // Clean up result.
        return product;
    }

    // Heuristic to decide whether to use Karatsuba or long multiplication.
    function useKaratsuba ( l1, l2 ) {
        // This is a magic formula, likely empirically derived.
        return -0.012 * l1 - 0.012 * l2 + 15e-6 * l1 * l2 > 0;
    }

    // BigInteger.prototype.multiply method.
    BigInteger.prototype.multiply = function ( v ) {
        var n = parseValue(v),
            a = this.value,
            b = n.value,
            sign = this.sign !== n.sign, // Determine the sign of the result.
            abs;

        // Optimized path for multiplication by small integers.
        if ( n.isSmall ) {
            if ( b === 0 ) {
                return Integer[0]; // Multiply by zero.
            }
            if ( b === 1 ) {
                return this; // Multiply by one.
            }
            if ( b === -1 ) {
                return this.negate(); // Multiply by negative one.
            }
            abs = Math.abs(b);
            // If absolute value of small integer is less than BASE, use multiplySmall.
            if ( abs < BASE ) {
                return new BigInteger(multiplySmall(a, abs), sign);
            }
            // Otherwise, convert small integer to array.
            b = smallToArray(abs);
        }

        // Decide between Karatsuba and long multiplication for two large numbers.
        if ( useKaratsuba(a.length, b.length) ) {
            return new BigInteger(multiplyKaratsuba(a, b), sign);
        }
        return new BigInteger(multiplyLong(a, b), sign);
    };

    // Alias for multiply.
    BigInteger.prototype.times = BigInteger.prototype.multiply;


    // Helper for multiplying a small number with an array.
    function multiplySmallAndArray ( a, b, sign ) {
        if ( a < BASE ) {
            return new BigInteger(multiplySmall(b, a), sign);
        }
        return new BigInteger(multiplyLong(b, smallToArray(a)), sign);
    }

    // SmallInteger.prototype._multiplyBySmall (internal helper).
    SmallInteger.prototype._multiplyBySmall = function ( a ) {
        // If the product of two small numbers is still precise.
        if ( isPrecise(a.value * this.value) ) {
            return new SmallInteger(a.value * this.value);
        }
        // Otherwise, perform multiplication using array methods.
        return multiplySmallAndArray(Math.abs(a.value), smallToArray(Math.abs(this.value)), this.sign !== a.sign);
    };

    // BigInteger.prototype._multiplyBySmall (internal helper).
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
        // Perform multiplication using array methods.
        return multiplySmallAndArray(Math.abs(a.value), this.value, this.sign !== a.sign);
    };

    // SmallInteger.prototype.multiply method.
    SmallInteger.prototype.multiply = function ( v ) {
        return parseValue(v)._multiplyBySmall(this);
    };

    // Alias for multiply.
    SmallInteger.prototype.times = SmallInteger.prototype.multiply;


    // --- Squaring Operations ---

    // Squares an array of digits (optimized multiplication by itself).
    function square ( a ) {
        var l = a.length,
            r = createArray(l + l), // Max length of square.
            base = BASE,
            product,
            carry,
            i,
            a_i,
            a_j;

        for ( i = 0; i < l; i++ ) {
            a_i = a[i];
            carry = 0 - a_i * a_i; // Initialize carry with negative square.
            for ( var j = i; j < l; j++ ) {
                a_j = a[j];
                product = 2 * (a_i * a_j) + r[i + j] + carry; // Formula for squaring digits.
                carry = Math.floor(product / base);
                r[i + j] = product - carry * base;
            }
            r[i + l] = carry; // Store final carry.
        }
        trim(r); // Clean up result.
        return r;
    }

    // BigInteger.prototype.square method.
    BigInteger.prototype.square = function () {
        return new BigInteger(square(this.value), false); // Square is always positive.
    };

    // SmallInteger.prototype.square method.
    SmallInteger.prototype.square = function () {
        var value = this.value * this.value;
        // If the squared value is still precise.
        if ( isPrecise(value) ) {
            return new SmallInteger(value);
        }
        // Otherwise, convert to BigInt and square.
        return new BigInteger(square(smallToArray(Math.abs(this.value))), false);
    };


    // --- Division and Modulo Operations ---

    // Division with remainder for two large numbers (Knuth's algorithm D).
    function divMod1 ( a, b ) {
        var a_l = a.length,
            b_l = b.length,
            base = BASE,
            result = createArray(b.length), // Quotient array.
            divisorMostSignificantDigit = b[b_l - 1],
            // Normalization factor.
            lambda = Math.ceil(base / (2 * divisorMostSignificantDigit)),
            remainder = multiplySmall(a, lambda), // Normalized dividend.
            divisor = multiplySmall(b, lambda), // Normalized divisor.
            quotientDigit,
            shift,
            carry,
            borrow,
            i,
            l,
            q;

        // Adjust lengths for normalization.
        if ( remainder.length <= a_l ) {
            remainder.push(0);
        }
        divisor.push(0);
        divisorMostSignificantDigit = divisor[b_l - 1];

        // Main loop for calculating quotient digits.
        for ( shift = a_l - b_l; shift >= 0; shift-- ) {
            quotientDigit = base - 1; // Initial guess for quotient digit.
            // Improve guess if possible.
            if ( remainder[shift + b_l] !== divisorMostSignificantDigit ) {
                quotientDigit = Math.floor((remainder[shift + b_l] * base + remainder[shift + b_l - 1]) / divisorMostSignificantDigit);
            }

            carry = 0;
            borrow = 0;
            l = divisor.length;
            // Subtract (quotientDigit * divisor) from (remainder shifted).
            for ( i = 0; i < l; i++ ) {
                carry += quotientDigit * divisor[i];
                q = Math.floor(carry / base);
                borrow += remainder[shift + i] - (carry - q * base);
                carry = q;
                if ( borrow < 0 ) {
                    remainder[shift + i] = borrow + base;
                    borrow = -1;
                } else {
                    remainder[shift + i] = borrow;
                    borrow = 0;
                }
            }

            // Adjust quotientDigit if the subtraction resulted in a negative remainder.
            while ( borrow !== 0 ) {
                quotientDigit -= 1;
                carry = 0;
                for ( i = 0; i < l; i++ ) {
                    carry += remainder[shift + i] - base + divisor[i];
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

        // Denormalize the remainder.
        remainder = divModSmall(remainder, lambda)[0];

        return [ arrayToSmall(result), arrayToSmall(remainder) ];
    }

    // Alternative division algorithm (simpler, but potentially slower).
    function divMod2 ( a, b ) {
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

        while ( a_l ) {
            part.unshift(a[--a_l]); // Take digits from dividend.
            trim(part); // Remove leading zeros from current part.

            // If the current part is smaller than divisor, quotient digit is 0.
            if ( compareAbs(part, b) < 0 ) {
                result.push(0);
                continue;
            }

            xlen = part.length;
            // Estimate quotient digit using most significant digits.
            highx = part[xlen - 1] * base + part[xlen - 2];
            highy = b[b_l - 1] * base + b[b_l - 2];

            if ( xlen > b_l ) {
                highx = (highx + 1) * base; // Adjust for additional digit.
            }
            guess = Math.ceil(highx / highy);

            // Refine guess by trial subtraction.
            do {
                check = multiplySmall(b, guess);
                if ( compareAbs(check, part) <= 0 ) {
                    break;
                }
                guess--;
            } while ( guess );

            result.push(guess); // Add quotient digit to result.
            part = subtract(part, check); // Update remainder part.
        }

        result.reverse(); // Reverse result to get correct order.
        return [ arrayToSmall(result), arrayToSmall(part) ];
    }

    // Divides an array of digits by a small number `lambda`.
    function divModSmall ( value, lambda ) {
        var length = value.length,
            quotient = createArray(length),
            base = BASE,
            i,
            q,
            remainder,
            divisor;

        remainder = 0;
        for ( i = length - 1; i >= 0; --i ) {
            divisor = remainder * base + value[i];
            q = truncate(divisor / lambda);
            remainder = divisor - q * lambda;
            quotient[i] = q | 0; // Ensure integer.
        }
        return [ quotient, remainder | 0 ]; // Return quotient array and remainder.
    }

    // General divmod function for any BigInt or SmallInt.
    function divModAny ( self, v ) {
        var value,
            n = parseValue(v); // Parse the divisor.

        var a = self.value,
            b = n.value;

        var quotient;

        // Handle division by zero.
        if ( b === 0 ) {
            throw new Error("Cannot divide by zero");
        }

        // Optimized path for SmallInteger dividend.
        if ( self.isSmall ) {
            // Both are SmallIntegers.
            if ( n.isSmall ) {
                return [ new SmallInteger(truncate(a / b)), new SmallInteger(a % b) ];
            }
            // SmallInteger dividend, BigInteger divisor.
            return [ Integer[0], self ]; // Quotient is 0, remainder is self.
        }

        // Optimized path for SmallInteger divisor.
        if ( n.isSmall ) {
            if ( b === 1 ) {
                return [ self, Integer[0] ]; // Division by 1.
            }
            if ( b === -1 ) {
                return [ self.negate(), Integer[0] ]; // Division by -1.
            }
            var abs = Math.abs(b);
            // If absolute value of small integer is less than BASE, use divModSmall.
            if ( abs < BASE ) {
                value = divModSmall(a, abs);
                quotient = arrayToSmall(value[0]);
                var remainder = value[1];

                if ( self.sign ) {
                    remainder = -remainder;
                }

                // If quotient is a number, return SmallInteger.
                if ( typeof quotient === "number" ) {
                    if ( self.sign !== n.sign ) {
                        quotient = -quotient;
                    }
                    return [ new SmallInteger(quotient), new SmallInteger(remainder) ];
                }

                // Otherwise, return BigInteger for quotient.
                return [ new BigInteger(quotient, self.sign !== n.sign), new SmallInteger(remainder) ];
            }
            // If small integer divisor is large, convert to array.
            b = smallToArray(abs);
        }

        // Compare absolute values of dividend and divisor.
        var comparison = compareAbs(a, b);

        // If dividend < divisor, quotient is 0, remainder is dividend.
        if ( comparison === -1 ) {
            return [ Integer[0], self ];
        }
        // If dividend == divisor, quotient is 1 (or -1), remainder is 0.
        if ( comparison === 0 ) {
            return [ Integer[self.sign === n.sign ? 1 : -1], Integer[0] ];
        }

        // Choose division algorithm based on length.
        if ( a.length + b.length <= 200 ) {
            value = divMod1(a, b);
        } else {
            value = divMod2(a, b);
        }

        quotient = value[0];
        var qSign = self.sign !== n.sign, // Sign of the quotient.
            mod = value[1],
            mSign = self.sign; // Sign of the remainder.

        // Convert quotient to BigInt or SmallInteger.
        if ( typeof quotient === "number" ) {
            if ( qSign ) {
                quotient = -quotient;
            }
            quotient = new SmallInteger(quotient);
        } else {
            quotient = new BigInteger(quotient, qSign);
        }

        // Convert remainder to BigInt or SmallInteger.
        if ( typeof mod === "number" ) {
            if ( mSign ) {
                mod = -mod;
            }
            mod = new SmallInteger(mod);
        } else {
            mod = new BigInteger(mod, mSign);
        }

        return [ quotient, mod ];
    }

    // BigInteger.prototype.divmod method.
    BigInteger.prototype.divmod = function ( v ) {
        var result = divModAny(this, v);
        return { quotient: result[0], remainder: result[1] };
    };

    // SmallInteger.prototype.divmod delegates to BigInteger's.
    SmallInteger.prototype.divmod = BigInteger.prototype.divmod;


    // BigInteger.prototype.divide method (returns only the quotient).
    BigInteger.prototype.divide = function ( v ) {
        return divModAny(this, v)[0];
    };

    // Aliases for divide.
    SmallInteger.prototype.over = SmallInteger.prototype.divide = BigInteger.prototype.over = BigInteger.prototype.divide;


    // BigInteger.prototype.mod method (returns only the remainder).
    BigInteger.prototype.mod = function ( v ) {
        return divModAny(this, v)[1];
    };

    // Aliases for mod.
    SmallInteger.prototype.remainder = SmallInteger.prototype.mod = BigInteger.prototype.remainder = BigInteger.prototype.mod;


    // --- Exponentiation Operations ---

    // BigInteger.prototype.pow method.
    BigInteger.prototype.pow = function ( v ) {
        var n = parseValue(v),
            a = this.value,
            b = n.value,
            value,
            x,
            y;

        // Special cases for exponent 0, base 0, 1, -1.
        if ( b === 0 ) {
            return Integer[1];
        }
        if ( a === 0 ) {
            return Integer[0];
        }
        if ( a === 1 ) {
            return Integer[1];
        }
        if ( a === -1 ) {
            return n.isEven() ? Integer[1] : Integer[-1];
        }

        // Negative exponents are not supported for BigInt (result would be fractional).
        if ( n.sign ) {
            return Integer[0]; // For integer exponentiation, negative exponent results in 0.
        }

        // If exponent is too large, throw an error.
        if ( !n.isSmall ) {
            throw new Error("The exponent " + n.toString() + " is too large.");
        }

        // Optimized path for small base where result might still be precise.
        if ( this.isSmall ) {
            if ( isPrecise(value = Math.pow(a, b)) ) {
                return new SmallInteger(truncate(value));
            }
        }

        // Binary exponentiation (exponentiation by squaring).
        x = this;
        y = Integer[1]; // Result accumulator.
        while ( true ) {
            if ( (b & 1) === 1 ) { // If exponent is odd.
                y = y.times(x);
                --b;
            }
            if ( b === 0 ) {
                break; // Exponent is zero, done.
            }
            b /= 2; // Halve the exponent.
            x = x.square(); // Square the base.
        }
        return y;
    };

    // SmallInteger.prototype.pow delegates to BigInteger's.
    SmallInteger.prototype.pow = BigInteger.prototype.pow;


    // BigInteger.prototype.modPow method (modular exponentiation).
    BigInteger.prototype.modPow = function ( exp, mod ) {
        exp = parseValue(exp);
        mod = parseValue(mod);

        // Modulus cannot be zero.
        if ( mod.isZero() ) {
            throw new Error("Cannot take modPow with modulus 0");
        }

        var r = Integer[1], // Result accumulator.
            base = this.mod(mod); // Base modulo modulus.

        // Binary exponentiation loop.
        while ( exp.isPositive() ) {
            if ( base.isZero() ) {
                return Integer[0]; // If base is 0, result is 0.
            }
            if ( exp.isOdd() ) {
                r = r.multiply(base).mod(mod); // If exponent is odd, multiply result.
            }
            exp = exp.divide(2); // Halve the exponent.
            base = base.square().mod(mod); // Square the base modulo modulus.
        }
        return r;
    };

    // SmallInteger.prototype.modPow delegates to BigInteger's.
    SmallInteger.prototype.modPow = BigInteger.prototype.modPow;


    // --- Comparison Operations ---

    // Compares the absolute values of two digit arrays.
    function compareAbs ( a, b ) {
        // Different lengths mean different magnitudes.
        if ( a.length !== b.length ) {
            return a.length > b.length ? 1 : -1;
        }

        // Compare digit by digit from most significant.
        for ( var i = a.length - 1; i >= 0; i-- ) {
            if ( a[i] !== b[i] ) {
                return a[i] > b[i] ? 1 : -1;
            }
        }
        return 0; // Arrays are equal.
    }

    // BigInteger.prototype.compareAbs method.
    BigInteger.prototype.compareAbs = function ( v ) {
        var n = parseValue(v),
            a = this.value,
            b = n.value;

        // If 'n' is small, 'this' (BigInteger) is always absolutely larger.
        if ( n.isSmall ) {
            return 1;
        }
        return compareAbs(a, b);
    };

    // SmallInteger.prototype.compareAbs method.
    SmallInteger.prototype.compareAbs = function ( v ) {
        var n = parseValue(v),
            a = Math.abs(this.value),
            b = n.value;

        // If 'n' is also small.
        if ( n.isSmall ) {
            b = Math.abs(b);
            return a === b ? 0 : a > b ? 1 : -1;
        }
        // If 'n' is large, 'this' (SmallInteger) is always absolutely smaller.
        return -1;
    };

    // BigInteger.prototype.compare method.
    BigInteger.prototype.compare = function ( v ) {
        // Handle comparison with Infinity.
        if ( v === Infinity ) {
            return -1;
        }
        if ( v === -Infinity ) {
            return 1;
        }

        var n = parseValue(v),
            a = this.value,
            b = n.value;

        // Compare based on signs first.
        if ( this.sign !== n.sign ) {
            return n.sign ? 1 : -1; // If 'n' is negative, 'this' (positive) is larger.
        }

        // If 'n' is small, 'this' (BigInteger) is larger (if both positive) or smaller (if both negative).
        if ( n.isSmall ) {
            return this.sign ? -1 : 1;
        }

        // Compare absolute values and apply sign.
        return compareAbs(a, b) * (this.sign ? -1 : 1);
    };

    // Alias for compare.
    BigInteger.prototype.compareTo = BigInteger.prototype.compare;


    // SmallInteger.prototype.compare method.
    SmallInteger.prototype.compare = function ( v ) {
        // Handle comparison with Infinity.
        if ( v === Infinity ) {
            return -1;
        }
        if ( v === -Infinity ) {
            return 1;
        }

        var n = parseValue(v),
            a = this.value,
            b = n.value;

        // If 'n' is also small, direct comparison.
        if ( n.isSmall ) {
            return a == b ? 0 : a > b ? 1 : -1;
        }

        // If signs are different.
        if ( a < 0 !== n.sign ) {
            return a < 0 ? -1 : 1; // If 'a' is negative, it's smaller than positive 'n'.
        }
        // If signs are the same, but 'n' is BigInt.
        return a < 0 ? 1 : -1; // If both negative, small 'a' is larger (closer to zero). If both positive, small 'a' is smaller.
    };

    // Alias for compare.
    SmallInteger.prototype.compareTo = SmallInteger.prototype.compare;


    // --- Equality Checks ---

    // Checks if two numbers are equal.
    BigInteger.prototype.equals = function ( v ) {
        return this.compare(v) === 0;
    };

    // Aliases for equals.
    SmallInteger.prototype.eq = SmallInteger.prototype.equals = BigInteger.prototype.eq = BigInteger.prototype.equals;


    // Checks if two numbers are not equal.
    BigInteger.prototype.notEquals = function ( v ) {
        return this.compare(v) !== 0;
    };

    // Aliases for notEquals.
    SmallInteger.prototype.neq = SmallInteger.prototype.notEquals = BigInteger.prototype.neq = BigInteger.prototype.notEquals;


    // --- Relational Comparisons ---

    // Checks if 'this' is greater than 'v'.
    BigInteger.prototype.greater = function ( v ) {
        return this.compare(v) > 0;
    };

    // Aliases for greater.
    SmallInteger.prototype.gt = SmallInteger.prototype.greater = BigInteger.prototype.gt = BigInteger.prototype.greater;


    // Checks if 'this' is less than 'v'.
    BigInteger.prototype.lesser = function ( v ) {
        return this.compare(v) < 0;
    };

    // Aliases for lesser.
    SmallInteger.prototype.lt = SmallInteger.prototype.lesser = BigInteger.prototype.lt = BigInteger.prototype.lesser;


    // Checks if 'this' is greater than or equal to 'v'.
    BigInteger.prototype.greaterOrEquals = function ( v ) {
        return this.compare(v) >= 0;
    };

    // Aliases for greaterOrEquals.
    SmallInteger.prototype.geq = SmallInteger.prototype.greaterOrEquals = BigInteger.prototype.geq = BigInteger.prototype.greaterOrEquals;


    // Checks if 'this' is less than or equal to 'v'.
    BigInteger.prototype.lesserOrEquals = function ( v ) {
        return this.compare(v) <= 0;
    };

    // Aliases for lesserOrEquals.
    SmallInteger.prototype.leq = SmallInteger.prototype.lesserOrEquals = BigInteger.prototype.leq = BigInteger.prototype.lesserOrEquals;


    // --- Property Checks ---

    // Checks if BigInteger is even.
    BigInteger.prototype.isEven = function () {
        return (this.value[0] & 1) === 0; // Check the least significant digit.
    };

    // Checks if SmallInteger is even.
    SmallInteger.prototype.isEven = function () {
        return (this.value & 1) === 0;
    };


    // Checks if BigInteger is odd.
    BigInteger.prototype.isOdd = function () {
        return (this.value[0] & 1) === 1;
    };

    // Checks if SmallInteger is odd.
    SmallInteger.prototype.isOdd = function () {
        return (this.value & 1) === 1;
    };


    // Checks if BigInteger is positive.
    BigInteger.prototype.isPositive = function () {
        return !this.sign;
    };

    // Checks if SmallInteger is positive.
    SmallInteger.prototype.isPositive = function () {
        return this.value > 0;
    };


    // Checks if BigInteger is negative.
    BigInteger.prototype.isNegative = function () {
        return this.sign;
    };

    // Checks if SmallInteger is negative.
    SmallInteger.prototype.isNegative = function () {
        return this.value < 0;
    };


    // Checks if BigInteger is a unit (1 or -1).
    BigInteger.prototype.isUnit = function () {
        return false; // BigInts are never considered "units" in this context unless they are 1 or -1 in value which are SmallIntegers.
    };

    // Checks if SmallInteger is a unit (1 or -1).
    SmallInteger.prototype.isUnit = function () {
        return Math.abs(this.value) === 1;
    };


    // Checks if BigInteger is zero.
    BigInteger.prototype.isZero = function () {
        return false; // Only SmallInteger 0 is truly zero.
    };

    // Checks if SmallInteger is zero.
    SmallInteger.prototype.isZero = function () {
        return this.value === 0;
    };


    // Checks if 'this' is divisible by 'v'.
    BigInteger.prototype.isDivisibleBy = function ( v ) {
        var n = parseValue(v);
        var value = n.value;

        // Special cases for divisor.
        if ( value === 0 ) {
            return false;
        }
        if ( value === 1 ) {
            return true;
        }
        if ( value === 2 ) {
            return this.isEven();
        }

        // General case: check if remainder is zero.
        return this.mod(n).equals(Integer[0]);
    };

    // SmallInteger.prototype.isDivisibleBy delegates.
    SmallInteger.prototype.isDivisibleBy = BigInteger.prototype.isDivisibleBy;


    // --- Primality Tests ---

    // Basic primality test for small numbers.
    function isBasicPrime ( v ) {
        var n = v.abs();

        if ( n.isUnit() ) {
            return false; // 1 is not prime.
        }
        if ( n.equals(2) || n.equals(3) || n.equals(5) ) {
            return true; // 2, 3, 5 are prime.
        }
        if ( n.isEven() || n.isDivisibleBy(3) || n.isDivisibleBy(5) ) {
            return false; // Multiples of 2, 3, 5 (except themselves) are not prime.
        }
        if ( n.lesser(25) ) {
            return true; // Numbers like 7, 11, 13, 17, 19, 23 are prime.
        }
    }

    // BigInteger.prototype.isPrime (Miller-Rabin primality test).
    BigInteger.prototype.isPrime = function () {
        var isPrime = isBasicPrime(this);
        if ( isPrime !== undefined ) {
            return isPrime; // If basic test gave a definitive answer.
        }

        var n = this.abs(),
            nPrev = n.prev(); // n-1.

        var a = [ 2, 3, 5, 7, 11, 13, 17, 19 ], // Bases for Miller-Rabin.
            b = nPrev, // n-1.
            d,
            t,
            i,
            x;

        // Find d and s such that n-1 = d * 2^s (b is d here, s is implicit count of divisions by 2).
        while ( b.isEven() ) {
            b = b.divide(2);
        }

        // Perform Miller-Rabin test for each base 'a'.
        for ( i = 0; i < a.length; i++ ) {
            x = bigInt(a[i]).modPow(b, n); // x = a^d mod n.
            if ( x.equals(Integer[1]) || x.equals(nPrev) ) {
                continue; // Strong probable prime conditions met.
            }

            // Check x^(2^r) mod n for r from 1 to s-1.
            for ( t = true, d = b; t && d.lesser(nPrev); d = d.multiply(2) ) {
                x = x.square().mod(n);
                if ( x.equals(nPrev) ) {
                    t = false; // Condition met, continue to next base.
                }
            }
            if ( t ) {
                return false; // Not a strong probable prime for this base, so composite.
            }
        }
        return true; // Passed all tests, likely prime.
    };

    // SmallInteger.prototype.isPrime delegates.
    SmallInteger.prototype.isPrime = BigInteger.prototype.isPrime;


    // BigInteger.prototype.isProbablePrime (Miller-Rabin with custom iterations).
    BigInteger.prototype.isProbablePrime = function ( iterations ) {
        var isPrime = isBasicPrime(this);
        if ( isPrime !== undefined ) {
            return isPrime;
        }

        var n = this.abs();
        var t = iterations === undefined ? 5 : iterations; // Number of iterations.

        for ( var i = 0; i < t; i++ ) {
            var a = bigInt.randBetween(2, n.minus(2)); // Random base.
            if ( !a.modPow(n.prev(), n).isUnit() ) {
                return false; // Failed Miller-Rabin test.
            }
        }
        return true; // Passed all iterations, probable prime.
    };

    // SmallInteger.prototype.isProbablePrime delegates.
    SmallInteger.prototype.isProbablePrime = BigInteger.prototype.isProbablePrime;


    // --- Modular Inverse ---

    // BigInteger.prototype.modInv (Extended Euclidean Algorithm).
    BigInteger.prototype.modInv = function ( n ) {
        var t = bigInt.zero,
            newT = bigInt.one,
            r = parseValue(n),
            newR = this.abs(),
            q,
            lastT,
            lastR;

        // Standard Extended Euclidean Algorithm.
        while ( !newR.equals(bigInt.zero) ) {
            q = r.divide(newR);
            lastT = t;
            lastR = r;
            t = newT;
            r = newR;
            newT = lastT.subtract(q.multiply(newT));
            newR = lastR.subtract(q.multiply(newR));
        }

        // If gcd(this, n) is not 1, modular inverse does not exist.
        if ( !r.equals(1) ) {
            throw new Error(this.toString() + " and " + n.toString() + " are not co-prime");
        }

        // Adjust 't' to be positive.
        if ( t.compare(0) === -1 ) {
            t = t.add(n);
        }

        // Adjust sign if original number was negative.
        if ( this.isNegative() ) {
            return t.negate();
        }
        return t;
    };

    // SmallInteger.prototype.modInv delegates.
    SmallInteger.prototype.modInv = BigInteger.prototype.modInv;


    // --- Increment and Decrement ---

    // BigInteger.prototype.next (increment by 1).
    BigInteger.prototype.next = function () {
        var value = this.value;
        if ( this.sign ) {
            return subtractSmall(value, 1, this.sign); // If negative, decrement absolute value.
        }
        return new BigInteger(addSmall(value, 1), this.sign);
    };

    // SmallInteger.prototype.next (increment by 1).
    SmallInteger.prototype.next = function () {
        var value = this.value;
        if ( value + 1 < MAX_INT ) {
            return new SmallInteger(value + 1);
        }
        return new BigInteger(MAX_INT_ARR, false); // If overflows SmallInteger, return BigInteger MAX_INT.
    };


    // BigInteger.prototype.prev (decrement by 1).
    BigInteger.prototype.prev = function () {
        var value = this.value;
        if ( this.sign ) {
            return new BigInteger(addSmall(value, 1), true); // If negative, increment absolute value.
        }
        return subtractSmall(value, 1, this.sign);
    };

    // SmallInteger.prototype.prev (decrement by 1).
    SmallInteger.prototype.prev = function () {
        var value = this.value;
        if ( value - 1 > -MAX_INT ) {
            return new SmallInteger(value - 1);
        }
        return new BigInteger(MAX_INT_ARR, true); // If underflows SmallInteger, return BigInteger -MAX_INT.
    };


    // --- Bitwise Operations Helpers ---

    // Powers of two within the BASE.
    var powersOfTwo = [ 1 ];
    while ( 2 * powersOfTwo[powersOfTwo.length - 1] <= BASE ) {
        powersOfTwo.push(2 * powersOfTwo[powersOfTwo.length - 1]);
    }
    var powers2Length = powersOfTwo.length,
        highestPower2 = powersOfTwo[powers2Length - 1];

    // Checks if shift amount `n` is small enough for optimized handling.
    function shift_isSmall ( n ) {
        return (typeof n === "number" || typeof n === "string") && +Math.abs(n) <= BASE || n instanceof BigInteger && n.value.length <= 1;
    }

    // BigInteger.prototype.shiftLeft (bitwise left shift).
    BigInteger.prototype.shiftLeft = function ( n ) {
        if ( !shift_isSmall(n) ) {
            throw new Error(String(n) + " is too large for shifting.");
        }
        n = +n;
        if ( n < 0 ) {
            return this.shiftRight(-n); // Negative shiftLeft is shiftRight.
        }

        var result = this;
        if ( result.isZero() ) {
            return result;
        }

        // Perform shifts in chunks of highestPower2.
        while ( n >= powers2Length ) {
            result = result.multiply(highestPower2);
            n -= powers2Length - 1; // Adjust n for the actual power.
        }
        return result.multiply(powersOfTwo[n]); // Final shift.
    };

    // SmallInteger.prototype.shiftLeft delegates.
    SmallInteger.prototype.shiftLeft = BigInteger.prototype.shiftLeft;


    // BigInteger.prototype.shiftRight (bitwise right shift).
    BigInteger.prototype.shiftRight = function ( n ) {
        var remQuo;
        if ( !shift_isSmall(n) ) {
            throw new Error(String(n) + " is too large for shifting.");
        }
        n = +n;
        if ( n < 0 ) {
            return this.shiftLeft(-n); // Negative shiftRight is shiftLeft.
        }

        var result = this;
        // Handle special cases or large shifts.
        while ( n >= powers2Length ) {
            if ( result.isZero() || result.isNegative() && result.isUnit() ) {
                return result; // Shifting 0 or -1 right yields itself.
            }
            remQuo = divModAny(result, highestPower2);
            result = remQuo[1].isNegative() ? remQuo[0].prev() : remQuo[0]; // Floor division for negative numbers.
            n -= powers2Length - 1;
        }
        remQuo = divModAny(result, powersOfTwo[n]);
        return remQuo[1].isNegative() ? remQuo[0].prev() : remQuo[0];
    };

    // SmallInteger.prototype.shiftRight delegates.
    SmallInteger.prototype.shiftRight = BigInteger.prototype.shiftRight;


    // Generic bitwise operation function.
    function bitwise ( x, y, fn ) {
        y = parseValue(y);

        var xSign = x.isNegative(),
            ySign = y.isNegative();

        // Convert to two's complement representation (if negative).
        var xRem = xSign ? x.not() : x,
            yRem = ySign ? y.not() : y;

        var xDigit = 0,
            yDigit = 0;
        var xDivMod = null,
            yDivMod = null;

        var result = [];

        // Process digit by digit (in BASE system).
        while ( !xRem.isZero() || !yRem.isZero() ) {
            xDivMod = divModAny(xRem, highestPower2);
            xDigit = xDivMod[1].toJSNumber();
            if ( xSign ) {
                xDigit = highestPower2 - 1 - xDigit; // Two's complement for negative numbers.
            }
            yDivMod = divModAny(yRem, highestPower2);
            yDigit = yDivMod[1].toJSNumber();
            if ( ySign ) {
                yDigit = highestPower2 - 1 - yDigit;
            }
            xRem = xDivMod[0];
            yRem = yDivMod[0];
            result.push(fn(xDigit, yDigit)); // Apply bitwise function.
        }

        // Reconstruct the result from digits.
        var sum = fn(xSign ? 1 : 0, ySign ? 1 : 0) !== 0 ? bigInt(-1) : bigInt(0);
        for ( var i = result.length - 1; i >= 0; i -= 1 ) {
            sum = sum.multiply(highestPower2).add(bigInt(result[i]));
        }
        return sum;
    }

    // BigInteger.prototype.not (bitwise NOT).
    BigInteger.prototype.not = function () {
        return this.negate().prev(); // ~x = -x - 1.
    };

    // SmallInteger.prototype.not delegates.
    SmallInteger.prototype.not = BigInteger.prototype.not;


    // BigInteger.prototype.and (bitwise AND).
    BigInteger.prototype.and = function ( n ) {
        return bitwise(this, n, function ( a, b ) {
            return a & b;
        });
    };

    // SmallInteger.prototype.and delegates.
    SmallInteger.prototype.and = BigInteger.prototype.and;


    // BigInteger.prototype.or (bitwise OR).
    BigInteger.prototype.or = function ( n ) {
        return bitwise(this, n, function ( a, b ) {
            return a | b;
        });
    };

    // SmallInteger.prototype.or delegates.
    SmallInteger.prototype.or = BigInteger.prototype.or;


    // BigInteger.prototype.xor (bitwise XOR).
    BigInteger.prototype.xor = function ( n ) {
        return bitwise(this, n, function ( a, b ) {
            return a ^ b;
        });
    };

    // SmallInteger.prototype.xor delegates.
    SmallInteger.prototype.xor = BigInteger.prototype.xor;


    // --- Logarithm and Utility ---

    // Masks for rough LOB (Least One Bit) calculation.
    var LOBMASK_I = 1 << 30,
        LOBMASK_BI = (BASE & -BASE) * (BASE & -BASE) | LOBMASK_I;

    // Rough calculation of LOB for a BigInt or SmallInt.
    function roughLOB ( n ) {
        var v = n.value,
            x = typeof v === "number" ? v | LOBMASK_I : v[0] + v[1] * BASE | LOBMASK_BI;
        return x & -x;
    }

    // Integer logarithm calculation.
    function integerLogarithm ( value, base ) {
        if ( base.compareTo(value) <= 0 ) {
            var tmp = integerLogarithm(value, base.square(base));
            var p = tmp.p;
            var e = tmp.e;
            var t = p.multiply(base);
            return t.compareTo(value) <= 0 ? { p: t, e: e * 2 + 1 } : { p: p, e: e * 2 };
        }
        return { p: bigInt(1), e: 0 };
    }

    // BigInteger.prototype.bitLength.
    BigInteger.prototype.bitLength = function () {
        var n = this;
        if ( n.compareTo(bigInt(0)) < 0 ) {
            n = n.negate().subtract(bigInt(1)); // For negative numbers, bit length of -(x+1).
        }
        if ( n.compareTo(bigInt(0)) === 0 ) {
            return bigInt(0);
        }
        return bigInt(integerLogarithm(n, bigInt(2)).e).add(bigInt(1));
    };

    // SmallInteger.prototype.bitLength delegates.
    SmallInteger.prototype.bitLength = BigInteger.prototype.bitLength;


    // --- GCD, LCM, Min, Max, Random ---

    // Returns the maximum of two BigInts.
    function max ( a, b ) {
        a = parseValue(a);
        b = parseValue(b);
        return a.greater(b) ? a : b;
    }

    // Returns the minimum of two BigInts.
    function min ( a, b ) {
        a = parseValue(a);
        b = parseValue(b);
        return a.lesser(b) ? a : b;
    }

    // Calculates the greatest common divisor (GCD) of two BigInts using binary GCD algorithm.
    function gcd ( a, b ) {
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

        var c = Integer[1], // Factor of 2.
            d,
            t;

        // Remove common factors of 2.
        while ( a.isEven() && b.isEven() ) {
            d = Math.min(roughLOB(a), roughLOB(b));
            a = a.divide(d);
            b = b.divide(d);
            c = c.multiply(d);
        }

        // Remove factors of 2 from 'a'.
        while ( a.isEven() ) {
            a = a.divide(roughLOB(a));
        }

        // Main Euclidean loop.
        do {
            // Remove factors of 2 from 'b'.
            while ( b.isEven() ) {
                b = b.divide(roughLOB(b));
            }
            // Ensure a <= b.
            if ( a.greater(b) ) {
                t = b;
                b = a;
                a = t;
            }
            b = b.subtract(a); // b = b - a.
        } while ( !b.isZero() );

        return c.isUnit() ? a : a.multiply(c); // Multiply back common factors of 2.
    }

    // Calculates the least common multiple (LCM) of two BigInts.
    function lcm ( a, b ) {
        a = parseValue(a).abs();
        b = parseValue(b).abs();
        return a.divide(gcd(a, b)).multiply(b); // LCM(a,b) = |a*b| / GCD(a,b).
    }

    // Generates a random BigInt between 'a' and 'b' (inclusive).
    function randBetween ( a, b ) {
        a = parseValue(a);
        b = parseValue(b);

        var low = min(a, b),
            high = max(a, b);

        var range = high.subtract(low).add(1); // Calculate the range size.

        // If range is small, use Math.random directly.
        if ( range.isSmall ) {
            return low.add(Math.floor(Math.random() * range));
        }

        var length = range.value.length - 1;
        var result = [],
            restricted = true;

        // Generate random digits for the number within the range.
        for ( var i = length; i >= 0; i-- ) {
            var top = restricted ? range.value[i] : BASE; // Upper bound for the digit.
            var digit = truncate(Math.random() * top);
            result.unshift(digit);
            if ( digit < top ) {
                restricted = false; // If a digit is less than its max, subsequent digits are unrestricted.
            }
        }

        result = arrayToSmall(result); // Convert to SmallInteger if possible.
        return low.add(typeof result === "number" ? new SmallInteger(result) : new BigInteger(result, false));
    }


    // --- String Conversion and Parsing ---

    // Parses a string `text` in a given `base`.
    var parseBase = function ( text, base ) {
        var length = text.length;
        var i;
        var absBase = Math.abs(base);

        // Validate characters based on base.
        for ( var i = 0; i < length; i++ ) {
            var c = text[i].toLowerCase();
            if ( c === "-" ) {
                continue;
            }
            if ( /[a-z0-9]/.test(c) ) {
                if ( /[0-9]/.test(c) && +c >= absBase ) {
                    if ( c === "1" && absBase === 1 ) {
                        continue;
                    } // Special case for base 1.
                    throw new Error(c + " is not a valid digit in base " + base + ".");
                } else if ( c.charCodeAt(0) - 87 >= absBase ) {
                    throw new Error(c + " is not a valid digit in base " + base + ".");
                }
            }
        }

        // Optimized path for small bases (2-36) that fit into JS numbers.
        if ( 2 <= base && base <= 36 ) {
            if ( length <= LOG_MAX_INT / Math.log(base) ) {
                var result = parseInt(text, base);
                if ( isNaN(result) ) {
                    throw new Error(c + " is not a valid digit in base " + base + ".");
                }
                return new SmallInteger(parseInt(text, base));
            }
        }

        base = parseValue(base); // Ensure base is a BigInt.
        var digits = [];
        var isNegative = text[0] === "-";

        // Parse digits.
        for ( i = isNegative ? 1 : 0; i < text.length; i++ ) {
            var c = text[i].toLowerCase(),
                charCode = c.charCodeAt(0);
            if ( 48 <= charCode && charCode <= 57 ) {
                digits.push(parseValue(c)); // '0'-'9'.
            } else if ( 97 <= charCode && charCode <= 122 ) {
                digits.push(parseValue(c.charCodeAt(0) - 87)); // 'a'-'z'.
            } else if ( c === "<" ) {
                // Custom digit format like <123>.
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

    // Converts an array of digits in a given base to a BigInt.
    function parseBaseFromArray ( digits, base, isNegative ) {
        var val = Integer[0],
            pow = Integer[1],
            i;

        // Sum digits * base^power.
        for ( i = digits.length - 1; i >= 0; i-- ) {
            val = val.add(digits[i].times(pow));
            pow = pow.times(base);
        }
        return isNegative ? val.negate() : val;
    }

    // Converts a digit (0-35) or custom digit to its string representation.
    function stringify ( digit ) {
        if ( digit <= 35 ) {
            return "0123456789abcdefghijklmnopqrstuvwxyz".charAt(digit);
        }
        return "<" + digit + ">";
    }

    // Converts a BigInt to an array of digits in a specified base.
    function toBase ( n, base ) {
        base = bigInt(base);

        // Handle base 0.
        if ( base.isZero() ) {
            if ( n.isZero() ) {
                return { value: [0], isNegative: false };
            }
            throw new Error("Cannot convert nonzero numbers to base 0.");
        }

        // Handle base -1.
        if ( base.equals(-1) ) {
            if ( n.isZero() ) {
                return { value: [0], isNegative: false };
            }
            if ( n.isNegative() ) {
                // Example: -5 in base -1 is 10101_(-1)
                return { value: [].concat.apply([], Array.apply(null, Array(-n)).map(Array.prototype.valueOf, [1, 0])), isNegative: false };
            }
            // Example: 5 in base -1 is 101_(-1)
            var arr = Array.apply(null, Array(+n - 1)).map(Array.prototype.valueOf, [0, 1]);
            arr.unshift([1]);
            return { value: [].concat.apply([], arr), isNegative: false };
        }

        var neg = false;
        // If number is negative and base is positive, convert absolute value and add sign later.
        if ( n.isNegative() && base.isPositive() ) {
            neg = true;
            n = n.abs();
        }

        // Handle base 1.
        if ( base.equals(1) ) {
            if ( n.isZero() ) {
                return { value: [0], isNegative: false };
            }
            // Example: 5 in base 1 is 11111_(1)
            return { value: Array.apply(null, Array(+n)).map(Number.prototype.valueOf, 1), isNegative: neg };
        }

        var out = [];
        var left = n,
            divmod;

        // Repeatedly divide by base and take remainder.
        while ( left.isNegative() || left.compareAbs(base) >= 0 ) {
            divmod = left.divmod(base);
            left = divmod.quotient;
            var digit = divmod.remainder;

            // Adjust for negative remainders (common in negative bases).
            if ( digit.isNegative() ) {
                digit = base.minus(digit).abs();
                left = left.next();
            }
            out.push(digit.toJSNumber());
        }
        out.push(left.toJSNumber()); // Add the last quotient.
        return { value: out.reverse(), isNegative: neg };
    }

    // Converts a BigInt to a string representation in a specified base.
    function toBaseString ( n, base ) {
        var arr = toBase(n, base);
        return (arr.isNegative ? "-" : "") + arr.value.map(stringify).join("");
    }


    // BigInteger.prototype.toArray.
    BigInteger.prototype.toArray = function ( radix ) {
        return toBase(this, radix);
    };

    // SmallInteger.prototype.toArray delegates.
    SmallInteger.prototype.toArray = function ( radix ) {
        return toBase(this, radix);
    };


    // BigInteger.prototype.toString.
    BigInteger.prototype.toString = function ( radix ) {
        if ( radix === undefined ) {
            radix = 10;
        }
        if ( radix !== 10 ) {
            return toBaseString(this, radix);
        }

        var v = this.value,
            l = v.length,
            str = String(v[--l]), // Start with the most significant digit.
            zeros = "0000000",
            digit;

        // Append remaining digits, padding with zeros.
        while ( --l >= 0 ) {
            digit = String(v[l]);
            str += zeros.slice(digit.length) + digit;
        }
        var sign = this.sign ? "-" : "";
        return sign + str;
    };

    // SmallInteger.prototype.toString.
    SmallInteger.prototype.toString = function ( radix ) {
        if ( radix === undefined ) {
            radix = 10;
        }
        if ( radix != 10 ) {
            return toBaseString(this, radix);
        }
        return String(this.value);
    };


    // JSON serialization (returns string representation).
    BigInteger.prototype.toJSON = SmallInteger.prototype.toJSON = function () {
        return this.toString();
    };


    // ValueOf for BigInteger (returns JS number if possible, otherwise string).
    BigInteger.prototype.valueOf = function () {
        return parseInt(this.toString(), 10);
    };

    // Alias for valueOf.
    BigInteger.prototype.toJSNumber = BigInteger.prototype.valueOf;


    // ValueOf for SmallInteger (returns the internal number).
    SmallInteger.prototype.valueOf = function () {
        return this.value;
    };

    // Alias for valueOf.
    SmallInteger.prototype.toJSNumber = SmallInteger.prototype.valueOf;


    // Parses a string value into a BigInt or SmallInt.
    function parseStringValue ( v ) {
        // If it can be precisely represented as a JS number.
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

        // Handle scientific notation.
        var split = v.split(/e/i);
        if ( split.length > 2 ) {
            throw new Error("Invalid integer: " + split.join("e"));
        }
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
            text += new Array(exp + 1).join("0"); // Append zeros for positive exponent.
            v = text;
        }

        // Validate the string format.
        var isValid = /^([0-9][0-9]*)$/.test(v);
        if ( !isValid ) {
            throw new Error("Invalid integer: " + v);
        }

        var r = [],
            max = v.length,
            l = LOG_BASE,
            min = max - l;

        // Convert string to array of digits in BASE.
        while ( max > 0 ) {
            r.push(+v.slice(min, max));
            min -= l;
            if ( min < 0 ) {
                min = 0;
            }
            max -= l;
        }
        trim(r); // Remove leading zeros.
        return new BigInteger(r, sign);
    }

    // Parses a number value into a BigInt or SmallInt.
    function parseNumberValue ( v ) {
        if ( isPrecise(v) ) {
            if ( v !== truncate(v) ) {
                throw new Error(v + " is not an integer.");
            }
            return new SmallInteger(v);
        }
        return parseStringValue(v.toString()); // Fallback to string parsing for large numbers.
    }

    // Main parsing function, dispatches based on type.
    function parseValue ( v ) {
        if ( typeof v === "number" ) {
            return parseNumberValue(v);
        }
        if ( typeof v === "string" ) {
            return parseStringValue(v);
        }
        return v; // Assume it's already a BigInt/SmallInt object.
    }


    // --- Initialization of Integer Constants ---

    // Pre-create SmallInteger instances for common small numbers (0-999).
    for ( var i = 0; i < 1e3; i++ ) {
        Integer[i] = new SmallInteger(i);
        if ( i > 0 ) {
            Integer[-i] = new SmallInteger(-i);
        }
    }

    // Assign common constant values.
    Integer.one = Integer[1];
    Integer.zero = Integer[0];
    Integer.minusOne = Integer[-1];

    // Expose utility functions on the Integer object.
    Integer.max = max;
    Integer.min = min;
    Integer.gcd = gcd;
    Integer.lcm = lcm;
    Integer.isInstance = function ( x ) {
        return x instanceof BigInteger || x instanceof SmallInteger;
    };
    Integer.randBetween = randBetween;
    Integer.fromArray = function ( digits, base, isNegative ) {
        return parseBaseFromArray(digits.map(parseValue), parseValue(base || 10), isNegative);
    };

    // Return the Integer factory function.
    return Integer;
}(); // End of the IIFE for the bigInt library.

// -----------------------------------------------------------------------------
// Main program logic starts here.
// This part reads input, performs calculations using the bigInt library,
// and prints the result.
// -----------------------------------------------------------------------------

const main = arg => {
    // Trim whitespace and split input into lines.
    arg = arg.trim().split("\n");

    // Parse the first line as N, the number of elements.
    const N = parseInt(arg[0]);

    // Parse the second line as an array of integers D.
    const D = arg[1].split(" ").map(n => parseInt(n));

    // Find the maximum value in the array D.
    const max = Math.max(...D);

    // Initial validation: D[0] must be 0.
    if ( D[0] !== 0 ) {
        console.log(0);
        return; // If not, output 0 and exit.
    }

    // Initialize answer to 1 (multiplicative identity).
    let answer = 1;
    // `list` will store the frequency of each distance value.
    let list = { 0: 1 }; // Initialize count for distance 0 as 1 (for D[0]).

    // Iterate through the rest of the distances.
    for ( let i = 1; i < N; i++ ) {
        // If any D[i] is 0 for i > 0, it's an invalid structure.
        if ( D[i] === 0 ) {
            console.log(0);
            return; // Output 0 and exit.
        }

        // Increment count for D[i] in the frequency map.
        if ( list[D[i]] ) {
            list[D[i]]++;
        } else {
            list[D[i]] = 1;
        }
    }

    // Main calculation loop based on distance levels.
    for ( let i = 1; i <= max; i++ ) {
        // Check if previous level or current level is missing, indicating an invalid structure.
        if ( list[i - 1] === undefined || list[i] === undefined ) {
            console.log(0);
            return; // Output 0 and exit.
        }

        // `parents` is the count of nodes at the previous distance level (i-1).
        const parents = list[i - 1];

        // Calculate (parents)^(count of nodes at distance i) using bigInt.
        const temp = bigInt(parents).pow(list[i]);

        // Multiply the running answer by this `temp` value.
        answer = bigInt(answer).multiply(temp);
    }

    // Finally, print the answer modulo 998244353.
    console.log(bigInt(answer).mod(998244353).toString());
};

// Read input from /dev/stdin and pass it to the main function.
main(require('fs').readFileSync('/dev/stdin', 'utf8'));