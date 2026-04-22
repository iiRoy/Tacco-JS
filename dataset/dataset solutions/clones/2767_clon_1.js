"use strict"; // Enable strict mode for this JavaScript file.

// This is an Immediately Invoked Function Expression (IIFE)
// that sets up the bigInt library.
let bigInt = function (
    undefined // Ensure 'undefined' is truly undefined within this scope.
) {
    // --- Core Constants and Configuration ---

    // BASE: The base for our internal number representation, chosen for efficiency.
    // 1e7 means 10,000,000. Each element in our number arrays will store a digit up to this base.
    var BASE       = 1e7,
        // LOG_BASE: Logarithm of the BASE, used for string conversions and digit counting.
        LOG_BASE   = 7,
        // MAX_INT: The maximum safe integer in JavaScript (2^53 - 1).
        // Numbers larger than this cannot be precisely represented by standard JS numbers.
        MAX_INT    = 9007199254740992,
        // MAX_INT_ARR: MAX_INT converted into our custom array representation.
        // Used for comparisons and boundary checks.
        MAX_INT_ARR = smallToArray( MAX_INT ),
        // LOG_MAX_INT: Logarithm of MAX_INT, useful for optimizing `parseInt` calls.
        LOG_MAX_INT = Math.log( MAX_INT );


    // --- Integer Constructor (Factory Function) ---

    /*
     * The primary entry point for creating big integer objects.
     * It intelligently decides whether to create a SmallInteger or BigInteger.
     *
     * @param {number|string|BigInteger|SmallInteger} v - The value to convert.
     * @param {number} [radix] - Optional radix for string conversions.
     * @returns {BigInteger|SmallInteger} A big integer object.
     */
    function Integer( v , radix ) {
        // If no value is provided, default to zero.
        if ( typeof v === "undefined" ) {
            return Integer[ 0 ];
        }

        // If a radix is specified, parse the value based on that radix.
        if ( typeof radix !== "undefined" ) {
            // For radix 10, we can use the general parseValue, otherwise parseBase.
            return +radix === 10
                ? parseValue( v )
                : parseBase( v , radix );
        }

        // If no radix, simply parse the value.
        return parseValue( v );
    }


    // --- BigInteger Constructor ---

    /*
     * Constructor for large integers that exceed JavaScript's native number precision.
     * These numbers are stored as arrays of 'digits' in BASE.
     *
     * @param {number[]} value - An array of digits representing the number.
     * @param {boolean} sign - True if the number is negative, false otherwise.
     */
    function BigInteger( value , sign ) {
        this.value   = value; // The array of digits.
        this.sign    = sign;  // The sign of the number.
        this.isSmall = false; // Flag to indicate it's a BigInteger instance.
    }
    // BigInteger objects inherit methods from Integer.prototype.
    BigInteger.prototype = Object.create( Integer.prototype );


    // --- SmallInteger Constructor ---

    /*
     * Constructor for small integers that can be precisely represented by JavaScript numbers.
     * This provides an optimized path for smaller number operations.
     *
     * @param {number} value - The native JavaScript number.
     */
    function SmallInteger( value ) {
        this.value   = value; // The native number.
        this.sign    = value < 0; // The sign is derived directly from the value.
        this.isSmall = true;  // Flag to indicate it's a SmallInteger instance.
    }
    // SmallInteger objects also inherit methods from Integer.prototype.
    SmallInteger.prototype = Object.create( Integer.prototype );


    // --- Utility Functions ---

    /*
     * Checks if a given number `n` can be precisely represented by a native JavaScript number.
     * This is crucial for optimizing operations on small values.
     *
     * @param {number} n - The number to check.
     * @returns {boolean} True if precise, false otherwise.
     */
    function isPrecise( n ) {
        return -MAX_INT < n && n < MAX_INT;
    }


    /*
     * Converts a small native number `n` into the internal array representation.
     * This function handles numbers up to 10^14 efficiently.
     *
     * @param {number} n - The small number to convert.
     * @returns {number[]} The array representation.
     */
    function smallToArray( n ) {
        if ( n < 1e7 ) { // If n is less than BASE (10^7)
            return [ n ];
        }
        if ( n < 1e14 ) { // If n is less than BASE^2 (10^14)
            return [ n % 1e7 , Math.floor( n / 1e7 ) ];
        }
        // For numbers up to BASE^3 (10^21), which is beyond MAX_INT anyway.
        return [ n % 1e7 , Math.floor( n / 1e7 ) % 1e7 , Math.floor( n / 1e14 ) ];
    }


    /*
     * Converts an array representation `arr` back to a small native number if possible.
     * It also trims leading zeros from the array before conversion.
     *
     * @param {number[]} arr - The array representation.
     * @returns {number|number[]} A native number if small enough, otherwise the trimmed array.
     */
    function arrayToSmall( arr ) {
        trim( arr ); // Remove any leading zeros.

        var length = arr.length;

        // If the array is short and its absolute value is less than MAX_INT.
        if ( length < 4 && compareAbs( arr , MAX_INT_ARR ) < 0 ) {
            switch ( length ) {
                case 0: return 0; // Empty array means zero.
                case 1: return arr[ 0 ];
                case 2: return arr[ 0 ] + arr[ 1 ] * BASE;
                default: // Case 3: arr[0] + arr[1]*BASE + arr[2]*BASE*BASE
                    return arr[ 0 ] + ( arr[ 1 ] + arr[ 2 ] * BASE ) * BASE;
            }
        }
        return arr; // If it's still too large, return the array itself.
    }


    /*
     * Trims leading (most significant) zero elements from a big integer's value array.
     * This is important for canonical representation and performance.
     *
     * @param {number[]} v - The array of digits to trim.
     */
    function trim( v ) {
        var i = v.length;
        while ( v[ --i ] === 0 ) {
            // Loop backwards until a non-zero digit is found.
        }
        v.length = i + 1; // Adjust the array length.
    }


    /*
     * Creates a new array of a specified length, initialized with zeros.
     * A common helper for arithmetic operations.
     *
     * @param {number} length - The desired length of the array.
     * @returns {number[]} An array filled with zeros.
     */
    function createArray( length ) {
        var x = new Array( length );
        var i = -1;
        while ( ++i < length ) {
            x[ i ] = 0; // Initialize each element.
        }
        return x;
    }


    /*
     * Truncates a number towards zero. Similar to Math.trunc().
     *
     * @param {number} n - The number to truncate.
     * @returns {number} The truncated integer.
     */
    function truncate( n ) {
        if ( n > 0 ) {
            return Math.floor( n );
        }
        return Math.ceil( n );
    }


    // --- Addition Operations ---

    /*
     * Performs array-based addition of two positive big integers.
     * Assumes `a.length >= b.length` for simplified looping.
     *
     * @param {number[]} a - The first operand (larger or equal length).
     * @param {number[]} b - The second operand.
     * @returns {number[]} The sum as an array.
     */
    function add( a , b ) {
        var l_a   = a.length,
            l_b   = b.length,
            r     = new Array( l_a ), // Result array, sized to the longer input.
            carry = 0,
            base  = BASE,
            sum,
            i;

        // Add corresponding digits from both arrays, propagating carry.
        for ( i = 0 ; i < l_b ; i++ ) {
            sum = a[ i ] + b[ i ] + carry;
            carry = sum >= base ? 1 : 0;
            r[ i ] = sum - carry * base;
        }

        // Propagate carry through the remaining digits of the longer number.
        while ( i < l_a ) {
            sum = a[ i ] + carry;
            carry = sum === base ? 1 : 0;
            r[ i++ ] = sum - carry * base;
        }

        // If there's a final carry, append it.
        if ( carry > 0 ) {
            r.push( carry );
        }
        return r;
    }


    /*
     * A wrapper for `add` that ensures the longer array is passed as the first argument.
     *
     * @param {number[]} a - The first big integer array.
     * @param {number[]} b - The second big integer array.
     * @returns {number[]} The sum.
     */
    function addAny( a , b ) {
        if ( a.length >= b.length ) {
            return add( a , b );
        }
        return add( b , a ); // Swap operands if `b` is longer.
    }


    /*
     * Adds a small integer `carry` (can be positive or negative) to a big integer array `a`.
     * This is internally used for `next`, `prev`, and small number additions/subtractions.
     *
     * @param {number[]} a - The big integer array.
     * @param {number} carry - The small integer to add.
     * @returns {number[]} The result array.
     */
    function addSmall( a , carry ) {
        var l    = a.length,
            r    = new Array( l ),
            base = BASE,
            sum,
            i;

        for ( i = 0 ; i < l ; i++ ) {
            sum = a[ i ] - base + carry; // The '- base' and '+1' in carry are for handling negative carries correctly.
            carry = Math.floor( sum / base );
            r[ i ] = sum - carry * base;
            carry += 1; // Adjust carry for the next iteration.
        }

        // Handle any remaining carry.
        while ( carry > 0 ) {
            r[ i++ ] = carry % base;
            carry = Math.floor( carry / base );
        }
        return r;
    }


    // --- BigInteger.prototype.add Method ---
    BigInteger.prototype.add = function ( v ) {
        var n = parseValue( v ); // Convert input to a BigInt object.

        // If signs are different, addition becomes subtraction of the absolute values.
        if ( this.sign !== n.sign ) {
            return this.subtract( n.negate() );
        }

        var a = this.value,
            b = n.value;

        // Optimized path: if adding a SmallInteger.
        if ( n.isSmall ) {
            // `addSmall` expects `carry` to be positive for addition, so use `Math.abs(b)`.
            return new BigInteger( addSmall( a , Math.abs( b ) ) , this.sign );
        }

        // General case: adding two BigIntegers.
        return new BigInteger( addAny( a , b ) , this.sign );
    };
    BigInteger.prototype.plus = BigInteger.prototype.add; // Alias for convenience.


    // --- SmallInteger.prototype.add Method ---
    SmallInteger.prototype.add = function ( v ) {
        var n = parseValue( v ); // Convert input to a BigInt object.
        var a = this.value;     // The native value of 'this' SmallInteger.

        // If signs are effectively different (e.g., `a` is negative and `n` is positive),
        // it's a subtraction.
        if ( a < 0 !== n.sign ) {
            return this.subtract( n.negate() );
        }

        var b = n.value; // The value of the other operand.

        // Optimized path: if adding another SmallInteger.
        if ( n.isSmall ) {
            // If the sum fits within native JS number precision.
            if ( isPrecise( a + b ) ) {
                return new SmallInteger( a + b );
            }
            // If not, convert 'b' to array form for `addSmall`.
            b = smallToArray( Math.abs( b ) );
        }

        // Perform the addition using `addSmall` (which works with one array and one native number).
        // The sign is determined by the original 'a'.
        return new BigInteger( addSmall( b , Math.abs( a ) ) , a < 0 );
    };
    SmallInteger.prototype.plus = SmallInteger.prototype.add; // Alias for convenience.


    // --- Subtraction Operations ---

    /*
     * Performs array-based subtraction of two positive big integers (a - b).
     * Assumes `a` >= `b` in absolute value.
     *
     * @param {number[]} a - The first operand (minuend).
     * @param {number[]} b - The second operand (subtrahend).
     * @returns {number[]} The difference as an array.
     */
    function subtract( a , b ) {
        var a_l        = a.length,
            b_l        = b.length,
            r          = new Array( a_l ), // Result array.
            borrow     = 0,
            base       = BASE,
            i,
            difference;

        // Subtract digits pairwise, propagating borrow.
        for ( i = 0 ; i < b_l ; i++ ) {
            difference = a[ i ] - borrow - b[ i ];
            if ( difference < 0 ) {
                difference += base;
                borrow = 1;
            } else {
                borrow = 0;
            }
            r[ i ] = difference;
        }

        // Propagate borrow through the remaining digits of `a`.
        for ( i = b_l ; i < a_l ; i++ ) {
            difference = a[ i ] - borrow;
            if ( difference < 0 ) {
                difference += base;
            } else {
                r[ i++ ] = difference; // If no borrow, we can quickly copy remaining digits.
                break;
            }
            r[ i ] = difference;
        }

        // Copy any remaining digits from `a` (if no more borrows).
        for ( ; i < a_l ; i++ ) {
            r[ i ] = a[ i ];
        }

        trim( r ); // Remove leading zeros from the result.
        return r;
    }


    /*
     * Handles subtraction between two big integer arrays, determining the correct sign.
     *
     * @param {number[]} a - The first operand.
     * @param {number[]} b - The second operand.
     * @param {boolean} sign - The initial expected sign (true for negative, false for positive).
     * @returns {BigInteger|SmallInteger} The result of the subtraction.
     */
    function subtractAny( a , b , sign ) {
        var value;

        // Compare absolute values to determine which is larger for correct subtraction order.
        if ( compareAbs( a , b ) >= 0 ) {
            value = subtract( a , b );
        } else {
            value = subtract( b , a ); // Swap operands if b is absolutely larger.
            sign = !sign;             // Invert the sign.
        }

        value = arrayToSmall( value ); // Try to convert to SmallInteger if possible.

        if ( typeof value === "number" ) {
            if ( sign ) {
                value = -value;
            }
            return new SmallInteger( value );
        }
        return new BigInteger( value , sign );
    }


    /*
     * Subtracts a small integer `b` from a big integer array `a`.
     * This is an internal helper for optimized subtraction.
     *
     * @param {number[]} a - The big integer array.
     * @param {number} b - The small integer to subtract.
     * @param {boolean} sign - The expected sign of the result.
     * @returns {BigInteger|SmallInteger} The result of the subtraction.
     */
    function subtractSmall( a , b , sign ) {
        var l          = a.length,
            r          = new Array( l ),
            carry      = -b, // The small integer becomes a negative carry.
            base       = BASE,
            i,
            difference;

        for ( i = 0 ; i < l ; i++ ) {
            difference = a[ i ] + carry; // Add the negative carry.
            carry = Math.floor( difference / base );
            difference %= base;
            r[ i ] = difference < 0 ? difference + base : difference; // Ensure positive digit.
        }

        r = arrayToSmall( r ); // Attempt to convert to SmallInteger.

        if ( typeof r === "number" ) {
            if ( sign ) {
                r = -r;
            }
            return new SmallInteger( r );
        }
        return new BigInteger( r , sign );
    }


    // --- BigInteger.prototype.subtract Method ---
    BigInteger.prototype.subtract = function ( v ) {
        var n = parseValue( v ); // Parse the input.

        // If signs are different, subtraction becomes addition of the absolute values.
        if ( this.sign !== n.sign ) {
            return this.add( n.negate() );
        }

        var a = this.value,
            b = n.value;

        // Optimized path: if subtracting a SmallInteger.
        if ( n.isSmall ) {
            return subtractSmall( a , Math.abs( b ) , this.sign );
        }

        // General case: subtracting two BigIntegers.
        return subtractAny( a , b , this.sign );
    };
    BigInteger.prototype.minus = BigInteger.prototype.subtract; // Alias.


    // --- SmallInteger.prototype.subtract Method ---
    SmallInteger.prototype.subtract = function ( v ) {
        var n = parseValue( v ); // Parse the input.
        var a = this.value;     // Native value of 'this'.

        // If signs are effectively different (e.g., `a` is positive and `n` is negative),
        // it's an addition.
        if ( a < 0 !== n.sign ) {
            return this.add( n.negate() );
        }

        var b = n.value; // Value of the other operand.

        // Optimized path: if subtracting another SmallInteger.
        if ( n.isSmall ) {
            return new SmallInteger( a - b ); // Direct native subtraction.
        }

        // If 'this' is small, but 'n' is a BigInteger.
        // We effectively perform `abs(b) - abs(a)` and adjust sign.
        return subtractSmall( b , Math.abs( a ) , a >= 0 );
    };
    SmallInteger.prototype.minus = SmallInteger.prototype.subtract; // Alias.


    // --- Negation (Unary Minus) ---

    // BigInteger: just flip the sign property.
    BigInteger.prototype.negate = function () {
        return new BigInteger( this.value , !this.sign );
    };

    // SmallInteger: negate the value and flip the sign property.
    SmallInteger.prototype.negate = function () {
        var sign = this.sign;
        var small = new SmallInteger( -this.value );
        small.sign = !sign; // Ensure the sign is consistent with the new value.
        return small;
    };


    // --- Absolute Value ---

    // BigInteger: return a new BigInteger with sign set to false (positive).
    BigInteger.prototype.abs = function () {
        return new BigInteger( this.value , false );
    };

    // SmallInteger: return a new SmallInteger with the absolute value.
    SmallInteger.prototype.abs = function () {
        return new SmallInteger( Math.abs( this.value ) );
    };


    // --- Multiplication Operations ---

    /*
     * Performs standard long multiplication for two big integer arrays.
     * This is a basic O(N*M) multiplication algorithm.
     *
     * @param {number[]} a - The first operand.
     * @param {number[]} b - The second operand.
     * @returns {number[]} The product as an array.
     */
    function multiplyLong( a , b ) {
        var a_l   = a.length,
            b_l   = b.length,
            l     = a_l + b_l, // Max possible length of the product.
            r     = createArray( l ), // Result array initialized with zeros.
            base  = BASE,
            product,
            carry,
            i,
            a_i,
            b_j;

        for ( i = 0 ; i < a_l ; ++i ) {
            a_i = a[ i ];
            for ( var j = 0 ; j < b_l ; ++j ) {
                b_j = b[ j ];
                product = a_i * b_j + r[ i + j ]; // Calculate product for current digits + previous carry.
                carry = Math.floor( product / base );
                r[ i + j ] = product - carry * base; // Store current digit.
                r[ i + j + 1 ] += carry;             // Add carry to the next position.
            }
        }
        trim( r ); // Remove leading zeros.
        return r;
    }


    /*
     * Multiplies a big integer array `a` by a single small integer `b`.
     * This is an optimized multiplication for one small operand.
     *
     * @param {number[]} a - The big integer array.
     * @param {number} b - The small integer multiplier.
     * @returns {number[]} The product as an array.
     */
    function multiplySmall( a , b ) {
        var l       = a.length,
            r       = new Array( l ),
            base    = BASE,
            carry   = 0,
            product,
            i;

        for ( i = 0 ; i < l ; i++ ) {
            product = a[ i ] * b + carry; // Multiply digit by b and add carry.
            carry = Math.floor( product / base );
            r[ i ] = product - carry * base;
        }

        // Propagate any remaining carry.
        while ( carry > 0 ) {
            r[ i++ ] = carry % base;
            carry = Math.floor( carry / base );
        }
        return r;
    }


    /*
     * Shifts an array `x` left by `n` positions (effectively multiplying by BASE^n).
     * This is used in Karatsuba multiplication.
     *
     * @param {number[]} x - The array to shift.
     * @param {number} n - The number of positions to shift.
     * @returns {number[]} The shifted array.
     */
    function shiftLeft( x , n ) {
        var r = [];
        while ( n-- > 0 ) {
            r.push( 0 ); // Prepend zeros.
        }
        return r.concat( x ); // Concatenate with the original array.
    }


    /*
     * Implements the Karatsuba multiplication algorithm for faster multiplication
     * of very large numbers (sub-quadratic complexity).
     *
     * @param {number[]} x - The first operand.
     * @param {number[]} y - The second operand.
     * @returns {number[]} The product.
     */
    function multiplyKaratsuba( x , y ) {
        var n = Math.max( x.length , y.length );

        // Base case: if numbers are small enough, use long multiplication.
        if ( n <= 30 ) {
            return multiplyLong( x , y );
        }

        // Split numbers into two halves.
        n = Math.ceil( n / 2 );
        var b = x.slice( n ),
            a = x.slice( 0 , n ),
            d = y.slice( n ),
            c = y.slice( 0 , n );

        // Recursive calls.
        var ac   = multiplyKaratsuba( a , c ),
            bd   = multiplyKaratsuba( b , d ),
            abcd = multiplyKaratsuba( addAny( a , b ) , addAny( c , d ) );

        // Combine results using Karatsuba formula:
        // (a*BASE^n + b) * (c*BASE^n + d) = ac*BASE^(2n) + (ad+bc)*BASE^n + bd
        // ad+bc = abcd - ac - bd
        var product = addAny(
            addAny( ac , shiftLeft( subtract( subtract( abcd , ac ) , bd ) , n ) ),
            shiftLeft( bd , 2 * n )
        );

        trim( product ); // Trim leading zeros.
        return product;
    }


    /*
     * Heuristic to decide whether to use Karatsuba multiplication or standard long multiplication.
     * Karatsuba is faster for very large numbers but has overhead for smaller ones.
     *
     * @param {number} l1 - Length of the first number.
     * @param {number} l2 - Length of the second number.
     * @returns {boolean} True if Karatsuba should be used.
     */
    function useKaratsuba( l1 , l2 ) {
        // This is an empirical formula for optimal crossover point.
        return -.012 * l1 - .012 * l2 + 15e-6 * l1 * l2 > 0;
    }


    // --- BigInteger.prototype.multiply Method ---
    BigInteger.prototype.multiply = function ( v ) {
        var n    = parseValue( v ), // Parse the input.
            a    = this.value,
            b    = n.value,
            sign = this.sign !== n.sign, // Determine the sign of the result.
            abs;

        // Optimized path: if multiplying by a SmallInteger.
        if ( n.isSmall ) {
            if ( b === 0 ) return Integer[ 0 ]; // Multiply by zero.
            if ( b === 1 ) return this;         // Multiply by one.
            if ( b === -1 ) return this.negate(); // Multiply by negative one.

            abs = Math.abs( b );
            if ( abs < BASE ) {
                return new BigInteger( multiplySmall( a , abs ) , sign );
            }
            // If the small integer is larger than BASE, convert it to array form.
            b = smallToArray( abs );
        }

        // Decide between Karatsuba and long multiplication based on length heuristic.
        if ( useKaratsuba( a.length , b.length ) ) {
            return new BigInteger( multiplyKaratsuba( a , b ) , sign );
        }
        return new BigInteger( multiplyLong( a , b ) , sign );
    };
    BigInteger.prototype.times = BigInteger.prototype.multiply; // Alias.


    /*
     * Multiplies a small integer `a` by a big integer array `b`.
     * Internal helper for cases where one operand is small.
     *
     * @param {number} a - The small integer.
     * @param {number[]} b - The big integer array.
     * @param {boolean} sign - The sign of the result.
     * @returns {BigInteger} The product.
     */
    function multiplySmallAndArray( a , b , sign ) {
        if ( a < BASE ) {
            return new BigInteger( multiplySmall( b , a ) , sign );
        }
        // If 'a' is large enough, convert it to array form and use long multiplication.
        return new BigInteger( multiplyLong( b , smallToArray( a ) ) , sign );
    }


    // --- Internal _multiplyBySmall methods ---
    SmallInteger.prototype._multiplyBySmall = function ( a ) {
        // If the direct native multiplication is precise.
        if ( isPrecise( a.value * this.value ) ) {
            return new SmallInteger( a.value * this.value );
        }
        // Otherwise, convert to array and use array-based multiplication.
        return multiplySmallAndArray( Math.abs( a.value ) , smallToArray( Math.abs( this.value ) ) , this.sign !== a.sign );
    };

    BigInteger.prototype._multiplyBySmall = function ( a ) {
        if ( a.value === 0 ) return Integer[ 0 ];
        if ( a.value === 1 ) return this;
        if ( a.value === -1 ) return this.negate();
        return multiplySmallAndArray( Math.abs( a.value ) , this.value , this.sign !== a.sign );
    };


    // --- SmallInteger.prototype.multiply Method ---
    SmallInteger.prototype.multiply = function ( v ) {
        // Delegate to the internal `_multiplyBySmall` method, ensuring `v` is parsed.
        return parseValue( v )._multiplyBySmall( this );
    };
    SmallInteger.prototype.times = SmallInteger.prototype.multiply; // Alias.


    // --- Squaring Operations ---

    /*
     * Squares a big integer array `a`. Optimized for squaring (a * a).
     *
     * @param {number[]} a - The big integer array to square.
     * @returns {number[]} The square as an array.
     */
    function square( a ) {
        var l       = a.length,
            r       = createArray( l + l ), // Max length is 2*l.
            base    = BASE,
            product,
            carry,
            i,
            a_i,
            a_j;

        for ( i = 0 ; i < l ; i++ ) {
            a_i = a[ i ];
            carry = 0 - a_i * a_i; // Initialize carry with the negative square of the current digit.
            for ( var j = i ; j < l ; j++ ) {
                a_j = a[ j ];
                // Calculate 2 * a_i * a_j + r[i+j] + carry.
                // This accounts for both i*j and j*i contributions.
                product = 2 * ( a_i * a_j ) + r[ i + j ] + carry;
                carry = Math.floor( product / base );
                r[ i + j ] = product - carry * base;
            }
            r[ i + l ] = carry; // Store the final carry for this row.
        }
        trim( r ); // Trim leading zeros.
        return r;
    }


    // --- BigInteger.prototype.square Method ---
    BigInteger.prototype.square = function () {
        return new BigInteger( square( this.value ) , false ); // Square is always positive.
    };

    // --- SmallInteger.prototype.square Method ---
    SmallInteger.prototype.square = function () {
        var value = this.value * this.value;
        if ( isPrecise( value ) ) {
            return new SmallInteger( value );
        }
        // If the square exceeds native precision, convert to BigInteger representation.
        return new BigInteger( square( smallToArray( Math.abs( this.value ) ) ) , false );
    };


    // --- Division and Modulo Operations ---

    /*
     * Implements a division algorithm (Knuth's Algorithm D) for big integers.
     * This version is optimized for performance with large numbers.
     *
     * @param {number[]} a - The dividend.
     * @param {number[]} b - The divisor.
     * @returns {number[][]} An array containing [quotient_array, remainder_array].
     */
    function divMod1( a , b ) {
        var a_l                        = a.length,
            b_l                        = b.length,
            base                       = BASE,
            result                     = createArray( b.length ), // Quotient result array.
            divisorMostSignificantDigit = b[ b_l - 1 ],
            lambda                     = Math.ceil( base / ( 2 * divisorMostSignificantDigit ) ), // Normalization factor.
            remainder                  = multiplySmall( a , lambda ), // Normalized dividend.
            divisor                    = multiplySmall( b , lambda ), // Normalized divisor.
            quotientDigit,
            shift,
            carry,
            borrow,
            i,
            l,
            q;

        // Adjust lengths after normalization.
        if ( remainder.length <= a_l ) {
            remainder.push( 0 );
        }
        divisor.push( 0 ); // Pad divisor.
        divisorMostSignificantDigit = divisor[ b_l - 1 ]; // Recalculate MSD.

        // Main division loop: estimate quotient digits.
        for ( shift = a_l - b_l ; shift >= 0 ; shift-- ) {
            quotientDigit = base - 1; // Initial guess for quotient digit.

            // Refine guess if needed.
            if ( remainder[ shift + b_l ] !== divisorMostSignificantDigit ) {
                quotientDigit = Math.floor( ( remainder[ shift + b_l ] * base + remainder[ shift + b_l - 1 ] ) / divisorMostSignificantDigit );
            }

            carry = 0;
            borrow = 0;
            l = divisor.length;

            // Perform trial multiplication and subtraction.
            for ( i = 0 ; i < l ; i++ ) {
                carry += quotientDigit * divisor[ i ];
                q = Math.floor( carry / base );
                borrow += remainder[ shift + i ] - ( carry - q * base ); // Subtract and track borrow.
                carry = q;
                if ( borrow < 0 ) {
                    remainder[ shift + i ] = borrow + base;
                    borrow = -1;
                } else {
                    remainder[ shift + i ] = borrow;
                    borrow = 0;
                }
            }

            // Adjust quotient digit if the trial subtraction resulted in a negative remainder.
            while ( borrow !== 0 ) {
                quotientDigit -= 1;
                carry = 0;
                for ( i = 0 ; i < l ; i++ ) {
                    carry += remainder[ shift + i ] - base + divisor[ i ]; // Add back divisor.
                    if ( carry < 0 ) {
                        remainder[ shift + i ] = carry + base;
                        carry = 0;
                    } else {
                        remainder[ shift + i ] = carry;
                        carry = 1;
                    }
                }
                borrow += carry;
            }
            result[ shift ] = quotientDigit; // Store the final quotient digit.
        }

        // Denormalize the remainder.
        remainder = divModSmall( remainder , lambda )[ 0 ];
        return [ arrayToSmall( result ) , arrayToSmall( remainder ) ];
    }


    /*
     * A simpler, slower division algorithm (schoolbook method) for smaller numbers.
     * Used as a fallback or for specific cases.
     *
     * @param {number[]} a - The dividend.
     * @param {number[]} b - The divisor.
     * @returns {number[][]} An array containing [quotient_array, remainder_array].
     */
    function divMod2( a , b ) {
        var a_l   = a.length,
            b_l   = b.length,
            result = [], // Quotient digits.
            part  = [], // Current part of the dividend being processed.
            base  = BASE,
            guess,
            xlen,
            highx,
            highy,
            check;

        while ( a_l ) {
            part.unshift( a[ --a_l ] ); // Take one digit from dividend.
            trim( part ); // Trim part.

            if ( compareAbs( part , b ) < 0 ) {
                result.push( 0 ); // Current part is too small, quotient digit is 0.
                continue;
            }

            // Estimate quotient digit.
            xlen = part.length;
            highx = part[ xlen - 1 ] * base + part[ xlen - 2 ];
            highy = b[ b_l - 1 ] * base + b[ b_l - 2 ];

            if ( xlen > b_l ) {
                highx = ( highx + 1 ) * base; // Adjust for extra digit.
            }
            guess = Math.ceil( highx / highy ); // Initial guess.

            // Refine guess by trial multiplication and subtraction.
            do {
                check = multiplySmall( b , guess );
                if ( compareAbs( check , part ) <= 0 ) {
                    break;
                }
                guess--;
            } while ( guess );

            result.push( guess ); // Store quotient digit.
            part = subtract( part , check ); // Subtract from current part.
        }

        result.reverse(); // Reverse to get correct order.
        return [ arrayToSmall( result ) , arrayToSmall( part ) ];
    }


    /*
     * Divides a big integer array `value` by a small integer `lambda`.
     * Returns both quotient and remainder.
     *
     * @param {number[]} value - The big integer array.
     * @param {number} lambda - The small integer divisor.
     * @returns {number[][]} An array containing [quotient_array, remainder_number].
     */
    function divModSmall( value , lambda ) {
        var length    = value.length,
            quotient  = createArray( length ),
            base      = BASE,
            i,
            q,
            remainder,
            divisor;

        remainder = 0;
        for ( i = length - 1 ; i >= 0 ; --i ) {
            divisor = remainder * base + value[ i ];
            q = truncate( divisor / lambda );
            remainder = divisor - q * lambda;
            quotient[ i ] = q | 0; // Ensure integer.
        }
        return [ quotient , remainder | 0 ]; // Return quotient array and small remainder.
    }


    /*
     * General divmod function, handling different input types and signs.
     *
     * @param {BigInteger|SmallInteger} self - The dividend.
     * @param {number|string|BigInteger|SmallInteger} v - The divisor.
     * @returns {BigInteger[]|SmallInteger[]} An array containing [quotient, remainder].
     */
    function divModAny( self , v ) {
        var value,
            n = parseValue( v ); // Parse the divisor.

        var a = self.value,
            b = n.value;

        var quotient;

        if ( b === 0 ) {
            throw new Error( "Cannot divide by zero" );
        }

        // Case: Dividend is a SmallInteger.
        if ( self.isSmall ) {
            if ( n.isSmall ) {
                // Both are SmallIntegers, use native division.
                return [ new SmallInteger( truncate( a / b ) ) , new SmallInteger( a % b ) ];
            }
            // SmallInteger / BigInteger -> quotient is 0, remainder is self.
            return [ Integer[ 0 ] , self ];
        }

        // Case: Divisor is a SmallInteger.
        if ( n.isSmall ) {
            if ( b === 1 ) return [ self , Integer[ 0 ] ]; // Divide by 1.
            if ( b === -1 ) return [ self.negate() , Integer[ 0 ] ]; // Divide by -1.

            var abs = Math.abs( b );
            if ( abs < BASE ) {
                value = divModSmall( a , abs ); // Use optimized small divisor division.
                quotient = arrayToSmall( value[ 0 ] );
                var remainder = value[ 1 ];

                if ( self.sign ) {
                    remainder = -remainder;
                }

                if ( typeof quotient === "number" ) {
                    if ( self.sign !== n.sign ) {
                        quotient = -quotient;
                    }
                    return [ new SmallInteger( quotient ) , new SmallInteger( remainder ) ];
                }
                return [ new BigInteger( quotient , self.sign !== n.sign ) , new SmallInteger( remainder ) ];
            }
            // If small divisor is too large, convert it to array.
            b = smallToArray( abs );
        }

        // Both are BigIntegers.
        var comparison = compareAbs( a , b );

        if ( comparison === -1 ) {
            return [ Integer[ 0 ] , self ]; // Dividend is smaller than divisor.
        }
        if ( comparison === 0 ) {
            // Dividend equals divisor (absolute values).
            return [ Integer[ self.sign === n.sign ? 1 : -1 ] , Integer[ 0 ] ];
        }

        // Choose division algorithm based on size.
        if ( a.length + b.length <= 200 ) {
            value = divMod1( a , b ); // Knuth's algorithm for moderate sizes.
        } else {
            value = divMod2( a , b ); // Schoolbook for very large sizes (or fallback).
        }

        quotient = value[ 0 ];
        var qSign = self.sign !== n.sign, // Quotient sign.
            mod   = value[ 1 ],
            mSign = self.sign;             // Remainder sign (same as dividend).

        // Convert quotient to BigInt/SmallInt.
        if ( typeof quotient === "number" ) {
            if ( qSign ) {
                quotient = -quotient;
            }
            quotient = new SmallInteger( quotient );
        } else {
            quotient = new BigInteger( quotient , qSign );
        }

        // Convert remainder to BigInt/SmallInt.
        if ( typeof mod === "number" ) {
            if ( mSign ) {
                mod = -mod;
            }
            mod = new SmallInteger( mod );
        } else {
            mod = new BigInteger( mod , mSign );
        }

        return [ quotient , mod ];
    }


    // --- BigInteger.prototype.divmod Method ---
    BigInteger.prototype.divmod = function ( v ) {
        var result = divModAny( this , v );
        return { quotient: result[ 0 ] , remainder: result[ 1 ] };
    };
    SmallInteger.prototype.divmod = BigInteger.prototype.divmod; // Share implementation.


    // --- BigInteger.prototype.divide Method ---
    BigInteger.prototype.divide = function ( v ) {
        return divModAny( this , v )[ 0 ]; // Return only the quotient.
    };
    SmallInteger.prototype.over = SmallInteger.prototype.divide = BigInteger.prototype.over = BigInteger.prototype.divide; // Aliases.


    // --- BigInteger.prototype.mod Method ---
    BigInteger.prototype.mod = function ( v ) {
        return divModAny( this , v )[ 1 ]; // Return only the remainder.
    };
    SmallInteger.prototype.remainder = SmallInteger.prototype.mod = BigInteger.prototype.remainder = BigInteger.prototype.mod; // Aliases.


    // --- Exponentiation (Power) ---

    // BigInteger.prototype.pow and SmallInteger.prototype.pow share the same implementation.
    BigInteger.prototype.pow = function ( v ) {
        var n     = parseValue( v ), // Parse the exponent.
            a     = this.value,
            b     = n.value,
            value,
            x,
            y;

        if ( b === 0 ) return Integer[ 1 ]; // x^0 = 1.
        if ( a === 0 ) return Integer[ 0 ]; // 0^x = 0 (for x > 0).
        if ( a === 1 ) return Integer[ 1 ]; // 1^x = 1.
        if ( a === -1 ) return n.isEven() ? Integer[ 1 ] : Integer[ -1 ]; // (-1)^x.

        // If exponent is negative, result is 0 (for integers).
        if ( n.sign ) {
            return Integer[ 0 ];
        }

        // If exponent is a very large BigInteger, throw an error.
        if ( !n.isSmall ) {
            throw new Error( "The exponent " + n.toString() + " is too large." );
        }

        // If base is SmallInteger and result fits native precision.
        if ( this.isSmall ) {
            if ( isPrecise( value = Math.pow( a , b ) ) ) {
                return new SmallInteger( truncate( value ) );
            }
        }

        // Binary exponentiation (exponentiation by squaring).
        x = this;
        y = Integer[ 1 ]; // Initialize result to 1.
        while ( true ) {
            if ( b & 1 === 1 ) { // If exponent is odd.
                y = y.times( x );
                --b;
            }
            if ( b === 0 ) break; // Exponent is zero, done.
            b /= 2; // Divide exponent by 2.
            x = x.square(); // Square the base.
        }
        return y;
    };
    SmallInteger.prototype.pow = BigInteger.prototype.pow; // Share implementation.


    // --- Modular Exponentiation (ModPow) ---

    // BigInteger.prototype.modPow and SmallInteger.prototype.modPow share the same implementation.
    BigInteger.prototype.modPow = function ( exp , mod ) {
        exp = parseValue( exp );
        mod = parseValue( mod );

        if ( mod.isZero() ) {
            throw new Error( "Cannot take modPow with modulus 0" );
        }

        var r = Integer[ 1 ], // Result initialized to 1.
            base = this.mod( mod ); // Base reduced modulo mod.

        while ( exp.isPositive() ) {
            if ( base.isZero() ) return Integer[ 0 ]; // 0^exp % mod = 0.
            if ( exp.isOdd() ) {
                r = r.multiply( base ).mod( mod ); // r = (r * base) % mod.
            }
            exp = exp.divide( 2 );     // exp = exp / 2.
            base = base.square().mod( mod ); // base = (base^2) % mod.
        }
        return r;
    };
    SmallInteger.prototype.modPow = BigInteger.prototype.modPow; // Share implementation.


    // --- Comparison Operations ---

    /*
     * Compares the absolute values of two big integer arrays.
     *
     * @param {number[]} a - First array.
     * @param {number[]} b - Second array.
     * @returns {number} 0 if equal, 1 if a > b, -1 if a < b.
     */
    function compareAbs( a , b ) {
        if ( a.length !== b.length ) {
            return a.length > b.length ? 1 : -1; // Longer array is larger.
        }
        // Compare digit by digit from most significant to least significant.
        for ( var i = a.length - 1 ; i >= 0 ; i-- ) {
            if ( a[ i ] !== b[ i ] ) {
                return a[ i ] > b[ i ] ? 1 : -1;
            }
        }
        return 0; // Arrays are identical.
    }


    // --- BigInteger.prototype.compareAbs Method ---
    BigInteger.prototype.compareAbs = function ( v ) {
        var n = parseValue( v ),
            a = this.value,
            b = n.value;

        if ( n.isSmall ) {
            // A BigInteger is always absolutely larger than a SmallInteger (unless the SmallInteger is 0).
            // This is a simplification; a more precise check would involve converting the small to array.
            // Given MAX_INT_ARR, this means a BigInteger is always larger than any SmallInteger in value.
            return 1;
        }
        return compareAbs( a , b );
    };

    // --- SmallInteger.prototype.compareAbs Method ---
    SmallInteger.prototype.compareAbs = function ( v ) {
        var n = parseValue( v ),
            a = Math.abs( this.value ),
            b = n.value;

        if ( n.isSmall ) {
            b = Math.abs( b );
            return a === b ? 0 : a > b ? 1 : -1;
        }
        // A SmallInteger is always absolutely smaller than a BigInteger (unless the BigInteger is 0).
        // This is a simplification.
        return -1;
    };


    // --- BigInteger.prototype.compare Method ---
    BigInteger.prototype.compare = function ( v ) {
        if ( v === Infinity ) {
            return -1; // Any finite BigInt is less than Infinity.
        }
        if ( v === -Infinity ) {
            return 1; // Any finite BigInt is greater than -Infinity.
        }

        var n = parseValue( v ),
            a = this.value,
            b = n.value;

        // Compare signs first.
        if ( this.sign !== n.sign ) {
            return n.sign ? 1 : -1; // Positive > Negative.
        }

        // If 'n' is a SmallInteger, it's either smaller or larger depending on sign.
        if ( n.isSmall ) {
            return this.sign ? -1 : 1; // If negative, this is smaller; if positive, this is larger.
        }

        // Both are BigIntegers with the same sign. Compare absolute values and adjust based on sign.
        return compareAbs( a , b ) * ( this.sign ? -1 : 1 );
    };
    BigInteger.prototype.compareTo = BigInteger.prototype.compare; // Alias.


    // --- SmallInteger.prototype.compare Method ---
    SmallInteger.prototype.compare = function ( v ) {
        if ( v === Infinity ) {
            return -1; // Any finite SmallInt is less than Infinity.
        }
        if ( v === -Infinity ) {
            return 1; // Any finite SmallInt is greater than -Infinity.
        }

        var n = parseValue( v ),
            a = this.value,
            b = n.value;

        if ( n.isSmall ) {
            // Both are SmallIntegers, use native comparison.
            return a == b ? 0 : a > b ? 1 : -1;
        }

        // 'this' is SmallInteger, 'n' is BigInteger.
        // Compare based on signs.
        if ( a < 0 !== n.sign ) {
            return a < 0 ? -1 : 1; // If `a` is negative, it's smaller; if positive, it's larger.
        }
        return a < 0 ? 1 : -1; // If both negative, `a` is larger; if both positive, `a` is smaller.
    };
    SmallInteger.prototype.compareTo = SmallInteger.prototype.compare; // Alias.


    // --- Equality Checks ---
    BigInteger.prototype.equals = function ( v ) {
        return this.compare( v ) === 0;
    };
    SmallInteger.prototype.eq = SmallInteger.prototype.equals = BigInteger.prototype.eq = BigInteger.prototype.equals; // Aliases.

    BigInteger.prototype.notEquals = function ( v ) {
        return this.compare( v ) !== 0;
    };
    SmallInteger.prototype.neq = SmallInteger.prototype.notEquals = BigInteger.prototype.neq = BigInteger.prototype.notEquals; // Aliases.


    // --- Relational Operators ---
    BigInteger.prototype.greater = function ( v ) {
        return this.compare( v ) > 0;
    };
    SmallInteger.prototype.gt = SmallInteger.prototype.greater = BigInteger.prototype.gt = BigInteger.prototype.greater; // Aliases.

    BigInteger.prototype.lesser = function ( v ) {
        return this.compare( v ) < 0;
    };
    SmallInteger.prototype.lt = SmallInteger.prototype.lesser = BigInteger.prototype.lt = BigInteger.prototype.lesser; // Aliases.

    BigInteger.prototype.greaterOrEquals = function ( v ) {
        return this.compare( v ) >= 0;
    };
    SmallInteger.prototype.geq = SmallInteger.prototype.greaterOrEquals = BigInteger.prototype.geq = BigInteger.prototype.greaterOrEquals; // Aliases.

    BigInteger.prototype.lesserOrEquals = function ( v ) {
        return this.compare( v ) <= 0;
    };
    SmallInteger.prototype.leq = SmallInteger.prototype.lesserOrEquals = BigInteger.prototype.leq = BigInteger.prototype.lesserOrEquals; // Aliases.


    // --- Property Checks ---

    // BigInteger: Check if the least significant digit is even.
    BigInteger.prototype.isEven = function () {
        return ( this.value[ 0 ] & 1 ) === 0;
    };
    // SmallInteger: Check if the native value is even.
    SmallInteger.prototype.isEven = function () {
        return ( this.value & 1 ) === 0;
    };

    // BigInteger: Check if the least significant digit is odd.
    BigInteger.prototype.isOdd = function () {
        return ( this.value[ 0 ] & 1 ) === 1;
    };
    // SmallInteger: Check if the native value is odd.
    SmallInteger.prototype.isOdd = function () {
        return ( this.value & 1 ) === 1;
    };

    // BigInteger: Check if the number is positive.
    BigInteger.prototype.isPositive = function () {
        return !this.sign;
    };
    // SmallInteger: Check if the native value is greater than 0.
    SmallInteger.prototype.isPositive = function () {
        return this.value > 0;
    };

    // BigInteger: Check if the number is negative.
    BigInteger.prototype.isNegative = function () {
        return this.sign;
    };
    // SmallInteger: Check if the native value is less than 0.
    SmallInteger.prototype.isNegative = function () {
        return this.value < 0;
    };

    // BigInteger: A BigInteger (unless 0) is never a 'unit' (1 or -1).
    BigInteger.prototype.isUnit = function () {
        return false;
    };
    // SmallInteger: Check if the absolute value is 1.
    SmallInteger.prototype.isUnit = function () {
        return Math.abs( this.value ) === 1;
    };

    // BigInteger: A BigInteger is only zero if its value array is empty (after trim).
    BigInteger.prototype.isZero = function () {
        return false; // Should be handled by Integer[0] or trim.
    };
    // SmallInteger: Check if the native value is 0.
    SmallInteger.prototype.isZero = function () {
        return this.value === 0;
    };


    // --- Divisibility Check ---
    BigInteger.prototype.isDivisibleBy = function ( v ) {
        var n = parseValue( v );
        var value = n.value;

        if ( value === 0 ) return false; // Cannot divide by zero.
        if ( value === 1 ) return true;  // Divisible by 1.
        if ( value === 2 ) return this.isEven(); // Optimized check for 2.

        // For other divisors, check if remainder is zero.
        return this.mod( n ).equals( Integer[ 0 ] );
    };
    SmallInteger.prototype.isDivisibleBy = BigInteger.prototype.isDivisibleBy; // Share implementation.


    // --- Primality Tests ---

    /*
     * Checks for primality for small numbers using trial division.
     *
     * @param {BigInteger|SmallInteger} v - The number to check.
     * @returns {boolean|undefined} True if prime, false if composite, undefined if inconclusive.
     */
    function isBasicPrime( v ) {
        var n = v.abs();
        if ( n.isUnit() ) return false; // 1 is not prime.
        if ( n.equals( 2 ) || n.equals( 3 ) || n.equals( 5 ) ) return true; // Small primes.
        if ( n.isEven() || n.isDivisibleBy( 3 ) || n.isDivisibleBy( 5 ) ) return false; // Divisible by 2, 3, or 5.
        if ( n.lesser( 25 ) ) return true; // Numbers between 5 and 25 (excluding multiples of 2,3,5) are prime.
        return undefined; // Inconclusive, need further tests.
    }


    // --- BigInteger.prototype.isPrime Method (Miller-Rabin) ---
    BigInteger.prototype.isPrime = function () {
        var isPrime = isBasicPrime( this );
        if ( isPrime !== undefined ) return isPrime; // Return early if basic test is conclusive.

        var n      = this.abs(),
            nPrev  = n.prev(); // n - 1.

        // Miller-Rabin witnesses.
        var a = [ 2 , 3 , 5 , 7 , 11 , 13 , 17 , 19 ],
            b = nPrev, // b = n - 1.
            d,
            t,
            i,
            x;

        // Find d and s such that n - 1 = d * 2^s (b = d * 2^s).
        while ( b.isEven() ) {
            b = b.divide( 2 );
        }

        // Miller-Rabin test for each witness.
        for ( i = 0 ; i < a.length ; i++ ) {
            x = bigInt( a[ i ] ).modPow( b , n ); // x = a^d % n.

            if ( x.equals( Integer[ 1 ] ) || x.equals( nPrev ) ) {
                continue; // Strong probable prime, continue with next witness.
            }

            // Check x^(2^r) % n for r from 1 to s-1.
            for ( t = true , d = b ; t && d.lesser( nPrev ) ; d = d.multiply( 2 ) ) {
                x = x.square().mod( n );
                if ( x.equals( nPrev ) ) {
                    t = false; // Found a strong probable prime, break inner loop.
                }
            }
            if ( t ) return false; // Not a strong probable prime, it's composite.
        }
        return true; // Passed all tests, likely prime.
    };
    SmallInteger.prototype.isPrime = BigInteger.prototype.isPrime; // Share implementation.


    // --- BigInteger.prototype.isProbablePrime Method ---
    BigInteger.prototype.isProbablePrime = function ( iterations ) {
        var isPrime = isBasicPrime( this );
        if ( isPrime !== undefined ) return isPrime;

        var n = this.abs();
        var t = iterations === undefined ? 5 : iterations; // Default iterations is 5.

        for ( var i = 0 ; i < t ; i++ ) {
            // Pick a random number 'a' between 2 and n-2.
            var a = bigInt.randBetween( 2 , n.minus( 2 ) );
            // If a^(n-1) % n is not 1, then n is composite (Fermat's Little Theorem).
            if ( !a.modPow( n.prev() , n ).isUnit() ) {
                return false;
            }
        }
        return true; // Passed Fermat test 't' times, probably prime.
    };
    SmallInteger.prototype.isProbablePrime = BigInteger.prototype.isProbablePrime; // Share implementation.


    // --- Modular Inverse ---

    // BigInteger.prototype.modInv and SmallInteger.prototype.modInv share the same implementation.
    BigInteger.prototype.modInv = function ( n ) {
        var t     = bigInt.zero,
            newT  = bigInt.one,
            r     = parseValue( n ),
            newR  = this.abs(),
            q,
            lastT,
            lastR;

        // Extended Euclidean Algorithm.
        while ( !newR.equals( bigInt.zero ) ) {
            q     = r.divide( newR );
            lastT = t;
            lastR = r;
            t     = newT;
            r     = newR;
            newT  = lastT.subtract( q.multiply( newT ) );
            newR  = lastR.subtract( q.multiply( newR ) );
        }

        // If gcd(this, n) is not 1, then modular inverse does not exist.
        if ( !r.equals( 1 ) ) {
            throw new Error( this.toString() + " and " + n.toString() + " are not co-prime" );
        }

        // Adjust 't' to be positive if it's negative.
        if ( t.compare( 0 ) === -1 ) {
            t = t.add( n );
        }

        // If the original number was negative, negate the result.
        if ( this.isNegative() ) {
            return t.negate();
        }
        return t;
    };
    SmallInteger.prototype.modInv = BigInteger.prototype.modInv; // Share implementation.


    // --- Increment/Decrement ---

    // BigInteger.prototype.next (this + 1)
    BigInteger.prototype.next = function () {
        var value = this.value;
        if ( this.sign ) {
            // If negative, effectively subtract 1 from absolute value.
            return subtractSmall( value , 1 , this.sign );
        }
        // If positive, add 1.
        return new BigInteger( addSmall( value , 1 ) , this.sign );
    };
    // SmallInteger.prototype.next (this + 1)
    SmallInteger.prototype.next = function () {
        var value = this.value;
        // If incremented value still fits in native number.
        if ( value + 1 < MAX_INT ) {
            return new SmallInteger( value + 1 );
        }
        // Otherwise, convert to BigInteger using MAX_INT_ARR.
        return new BigInteger( MAX_INT_ARR , false );
    };

    // BigInteger.prototype.prev (this - 1)
    BigInteger.prototype.prev = function () {
        var value = this.value;
        if ( this.sign ) {
            // If negative, effectively add 1 to absolute value.
            return new BigInteger( addSmall( value , 1 ) , true );
        }
        // If positive, subtract 1.
        return subtractSmall( value , 1 , this.sign );
    };
    // SmallInteger.prototype.prev (this - 1)
    SmallInteger.prototype.prev = function () {
        var value = this.value;
        // If decremented value still fits in native number.
        if ( value - 1 > -MAX_INT ) {
            return new SmallInteger( value - 1 );
        }
        // Otherwise, convert to BigInteger using MAX_INT_ARR (negative).
        return new BigInteger( MAX_INT_ARR , true );
    };


    // --- Bitwise Shift Helpers ---
    var powersOfTwo = [ 1 ];
    // Precompute powers of 2 up to BASE for efficient bitwise shifts.
    while ( 2 * powersOfTwo[ powersOfTwo.length - 1 ] <= BASE ) {
        powersOfTwo.push( 2 * powersOfTwo[ powersOfTwo.length - 1 ] );
    }
    var powers2Length  = powersOfTwo.length,
        highestPower2 = powersOfTwo[ powers2Length - 1 ];


    /*
     * Checks if a shift amount `n` is small enough to be handled directly or if it's a BigInt.
     *
     * @param {number|string|BigInteger} n - The shift amount.
     * @returns {boolean} True if small, false otherwise.
     */
    function shift_isSmall( n ) {
        return ( typeof n === "number" || typeof n === "string" ) && +Math.abs( n ) <= BASE || n instanceof BigInteger && n.value.length <= 1;
    }


    // --- BigInteger.prototype.shiftLeft Method ---
    BigInteger.prototype.shiftLeft = function ( n ) {
        if ( !shift_isSmall( n ) ) {
            throw new Error( String( n ) + " is too large for shifting." );
        }
        n = +n; // Ensure 'n' is a number.
        if ( n < 0 ) return this.shiftRight( -n ); // Negative shift left is shift right.

        var result = this;
        if ( result.isZero() ) return result;

        // Apply shifts in chunks of `powers2Length - 1` (which is log2(highestPower2)).
        while ( n >= powers2Length ) {
            result = result.multiply( highestPower2 );
            n -= powers2Length - 1;
        }
        // Apply remaining shift.
        return result.multiply( powersOfTwo[ n ] );
    };
    SmallInteger.prototype.shiftLeft = BigInteger.prototype.shiftLeft; // Share implementation.


    // --- BigInteger.prototype.shiftRight Method ---
    BigInteger.prototype.shiftRight = function ( n ) {
        var remQuo;
        if ( !shift_isSmall( n ) ) {
            throw new Error( String( n ) + " is too large for shifting." );
        }
        n = +n; // Ensure 'n' is a number.
        if ( n < 0 ) return this.shiftLeft( -n ); // Negative shift right is shift left.

        var result = this;

        while ( n >= powers2Length ) {
            // If result is 0 or -1, shifting further does not change it.
            if ( result.isZero() || result.isNegative() && result.isUnit() ) {
                return result;
            }
            remQuo = divModAny( result , highestPower2 );
            // Adjust for negative numbers: floor division.
            result = remQuo[ 1 ].isNegative() ? remQuo[ 0 ].prev() : remQuo[ 0 ];
            n -= powers2Length - 1;
        }

        remQuo = divModAny( result , powersOfTwo[ n ] );
        // Adjust for negative numbers: floor division.
        return remQuo[ 1 ].isNegative() ? remQuo[ 0 ].prev() : remQuo[ 0 ];
    };
    SmallInteger.prototype.shiftRight = BigInteger.prototype.shiftRight; // Share implementation.


    // --- Bitwise Operations ---

    /*
     * Generic bitwise operation function.
     *
     * @param {BigInteger|SmallInteger} x - First operand.
     * @param {BigInteger|SmallInteger} y - Second operand.
     * @param {function} fn - The bitwise function (e.g., `&`, `|`, `^`).
     * @returns {BigInteger} The result of the bitwise operation.
     */
    function bitwise( x , y , fn ) {
        y = parseValue( y ); // Ensure 'y' is a BigInt object.

        var xSign = x.isNegative(),
            ySign = y.isNegative();

        // Convert to two's complement representation if negative (for internal calculations).
        var xRem = xSign ? x.not() : x,
            yRem = ySign ? y.not() : y;

        var xDigit = 0,
            yDigit = 0;

        var xDivMod = null,
            yDivMod = null;

        var result = []; // Stores the resulting digits.

        // Process digits from least significant to most significant.
        while ( !xRem.isZero() || !yRem.isZero() ) {
            xDivMod = divModAny( xRem , highestPower2 );
            xDigit = xDivMod[ 1 ].toJSNumber();
            if ( xSign ) {
                xDigit = highestPower2 - 1 - xDigit; // Apply two's complement.
            }

            yDivMod = divModAny( yRem , highestPower2 );
            yDigit = yDivMod[ 1 ].toJSNumber();
            if ( ySign ) {
                yDigit = highestPower2 - 1 - yDigit; // Apply two's complement.
            }

            xRem = xDivMod[ 0 ]; // Next chunk of 'x'.
            yRem = yDivMod[ 0 ]; // Next chunk of 'y'.

            result.push( fn( xDigit , yDigit ) ); // Apply the bitwise function.
        }

        // Handle the sign of the result based on the most significant bits.
        var sum = fn( xSign ? 1 : 0 , ySign ? 1 : 0 ) !== 0 ? bigInt( -1 ) : bigInt( 0 );
        for ( var i = result.length - 1 ; i >= 0 ; i -= 1 ) {
            sum = sum.multiply( highestPower2 ).add( bigInt( result[ i ] ) );
        }
        return sum;
    }


    // --- BigInteger.prototype.not Method (Bitwise NOT) ---
    BigInteger.prototype.not = function () {
        return this.negate().prev(); // ~x = -x - 1.
    };
    SmallInteger.prototype.not = BigInteger.prototype.not; // Share implementation.


    // --- BigInteger.prototype.and Method (Bitwise AND) ---
    BigInteger.prototype.and = function ( n ) {
        return bitwise( this , n , function ( a , b ) { return a & b; } );
    };
    SmallInteger.prototype.and = BigInteger.prototype.and; // Share implementation.


    // --- BigInteger.prototype.or Method (Bitwise OR) ---
    BigInteger.prototype.or = function ( n ) {
        return bitwise( this , n , function ( a , b ) { return a | b; } );
    };
    SmallInteger.prototype.or = BigInteger.prototype.or; // Share implementation.


    // --- BigInteger.prototype.xor Method (Bitwise XOR) ---
    BigInteger.prototype.xor = function ( n ) {
        return bitwise( this , n , function ( a , b ) { return a ^ b; } );
    };
    SmallInteger.prototype.xor = BigInteger.prototype.xor; // Share implementation.


    // --- Logarithm and Bit Length ---

    // LOBMASK_I: Least Significant Bit (LSB) mask for native integers.
    var LOBMASK_I  = 1 << 30,
        // LOBMASK_BI: LSB mask for BigIntegers (handles BASE digits).
        LOBMASK_BI = ( BASE & -BASE ) * ( BASE & -BASE ) | LOBMASK_I;

    /*
     * Calculates a 'rough' LOB (Least One Bit) for a number.
     * This is an approximation for efficiency in GCD.
     *
     * @param {BigInteger|SmallInteger} n - The number.
     * @returns {number} The rough LOB.
     */
    function roughLOB( n ) {
        var v = n.value,
            x = typeof v === "number" ? v | LOBMASK_I : v[ 0 ] + v[ 1 ] * BASE | LOBMASK_BI;
        return x & -x; // Returns the lowest set bit.
    }


    /*
     * Calculates the integer logarithm (log_base(value)).
     *
     * @param {BigInteger} value - The number.
     * @param {BigInteger} base - The base of the logarithm.
     * @returns {{p: BigInteger, e: number}} Object with p (power) and e (exponent).
     */
    function integerLogarithm( value , base ) {
        if ( base.compareTo( value ) <= 0 ) {
            var tmp = integerLogarithm( value , base.square() ); // Recursive call with squared base.
            var p   = tmp.p;
            var e   = tmp.e;
            var t   = p.multiply( base );
            return t.compareTo( value ) <= 0 ? { p: t , e: e * 2 + 1 } : { p: p , e: e * 2 };
        }
        return { p: bigInt( 1 ) , e: 0 }; // Base case.
    }


    // --- BigInteger.prototype.bitLength Method ---
    BigInteger.prototype.bitLength = function () {
        var n = this;
        // For negative numbers, bitLength is defined for (abs(n) - 1).
        if ( n.compareTo( bigInt( 0 ) ) < 0 ) {
            n = n.negate().subtract( bigInt( 1 ) );
        }
        if ( n.compareTo( bigInt( 0 ) ) === 0 ) {
            return bigInt( 0 );
        }
        // Calculate log base 2 and add 1.
        return bigInt( integerLogarithm( n , bigInt( 2 ) ).e ).add( bigInt( 1 ) );
    };
    SmallInteger.prototype.bitLength = BigInteger.prototype.bitLength; // Share implementation.


    // --- Min/Max Functions ---

    /*
     * Returns the maximum of two big integers.
     *
     * @param {BigInteger|SmallInteger} a - First number.
     * @param {BigInteger|SmallInteger} b - Second number.
     * @returns {BigInteger|SmallInteger} The larger number.
     */
    function max( a , b ) {
        a = parseValue( a );
        b = parseValue( b );
        return a.greater( b ) ? a : b;
    }

    /*
     * Returns the minimum of two big integers.
     *
     * @param {BigInteger|SmallInteger} a - First number.
     * @param {BigInteger|SmallInteger} b - Second number.
     * @returns {BigInteger|SmallInteger} The smaller number.
     */
    function min( a , b ) {
        a = parseValue( a );
        b = parseValue( b );
        return a.lesser( b ) ? a : b;
    }


    // --- Greatest Common Divisor (GCD) ---

    /*
     * Calculates the greatest common divisor of two big integers using binary GCD algorithm.
     *
     * @param {BigInteger|SmallInteger} a - First number.
     * @param {BigInteger|SmallInteger} b - Second number.
     * @returns {BigInteger|SmallInteger} The GCD.
     */
    function gcd( a , b ) {
        a = parseValue( a ).abs(); // Use absolute values.
        b = parseValue( b ).abs();

        if ( a.equals( b ) ) return a;
        if ( a.isZero() ) return b;
        if ( b.isZero() ) return a;

        var c = Integer[ 1 ], // Factor of 2s extracted.
            d,
            t;

        // Remove common factors of 2.
        while ( a.isEven() && b.isEven() ) {
            d = Math.min( roughLOB( a ) , roughLOB( b ) );
            a = a.divide( d );
            b = b.divide( d );
            c = c.multiply( d );
        }

        // Remove factors of 2 from 'a'.
        while ( a.isEven() ) {
            a = a.divide( roughLOB( a ) );
        }

        // Main binary GCD loop.
        do {
            // Remove factors of 2 from 'b'.
            while ( b.isEven() ) {
                b = b.divide( roughLOB( b ) );
            }

            if ( a.greater( b ) ) {
                t = b;
                b = a;
                a = t;
            }
            b = b.subtract( a ); // b = b - a.
        } while ( !b.isZero() );

        // Multiply back the common factors of 2.
        return c.isUnit() ? a : a.multiply( c );
    }


    // --- Least Common Multiple (LCM) ---

    /*
     * Calculates the least common multiple of two big integers.
     * LCM(a, b) = (abs(a) * abs(b)) / GCD(a, b).
     *
     * @param {BigInteger|SmallInteger} a - First number.
     * @param {BigInteger|SmallInteger} b - Second number.
     * @returns {BigInteger|SmallInteger} The LCM.
     */
    function lcm( a , b ) {
        a = parseValue( a ).abs();
        b = parseValue( b ).abs();
        return a.divide( gcd( a , b ) ).multiply( b );
    }


    // --- Random Number Generation ---

    /*
     * Generates a random big integer between `a` and `b` (inclusive).
     *
     * @param {BigInteger|SmallInteger} a - Lower bound.
     * @param {BigInteger|SmallInteger} b - Upper bound.
     * @returns {BigInteger|SmallInteger} A random big integer.
     */
    function randBetween( a , b ) {
        a = parseValue( a );
        b = parseValue( b );

        var low  = min( a , b ),
            high = max( a , b );

        var range = high.subtract( low ).add( 1 ); // Range = high - low + 1.

        if ( range.isSmall ) {
            // If the range fits in a small integer, use native Math.random.
            return low.add( Math.floor( Math.random() * range ) );
        }

        var length = range.value.length - 1;
        var result = [],
            restricted = true;

        // Generate random digits for the result.
        for ( var i = length ; i >= 0 ; i-- ) {
            var top   = restricted ? range.value[ i ] : BASE;
            var digit = truncate( Math.random() * top );
            result.unshift( digit );
            if ( digit < top ) {
                restricted = false; // Once a digit is less than the max, subsequent digits can be anything.
            }
        }

        result = arrayToSmall( result ); // Convert to small if possible.
        return low.add( typeof result === "number" ? new SmallInteger( result ) : new BigInteger( result , false ) );
    }


    // --- Base Conversion (Parsing) ---

    /*
     * Parses a string `text` representing a number in a given `base`.
     *
     * @param {string} text - The string representation.
     * @param {number} base - The base (radix) of the number.
     * @returns {BigInteger|SmallInteger} The parsed number.
     * @throws {Error} If the input string contains invalid digits for the base.
     */
    var parseBase = function ( text , base ) {
        var length  = text.length;
        var i;
        var absBase = Math.abs( base );

        // Validate digits for the given base.
        for ( var i = 0 ; i < length ; i++ ) {
            var c = text[ i ].toLowerCase();
            if ( c === "-" ) continue; // Skip minus sign.
            if ( /[a-z0-9]/.test( c ) ) {
                if ( /[0-9]/.test( c ) && +c >= absBase ) {
                    if ( c === "1" && absBase === 1 ) continue; // Special case for base 1.
                    throw new Error( c + " is not a valid digit in base " + base + "." );
                } else if ( c.charCodeAt( 0 ) - 87 >= absBase ) { // 'a' is 97, 'a'-87 = 10.
                    throw new Error( c + " is not a valid digit in base " + base + "." );
                }
            }
        }

        // Optimized path for bases 2-36 if the number is small enough for native parseInt.
        if ( 2 <= base && base <= 36 ) {
            if ( length <= LOG_MAX_INT / Math.log( base ) ) {
                var result = parseInt( text , base );
                if ( isNaN( result ) ) {
                    throw new Error( c + " is not a valid digit in base " + base + "." ); // Error from original code, might be 'c' undefined.
                }
                return new SmallInteger( parseInt( text , base ) );
            }
        }

        base = parseValue( base ); // Ensure base is a BigInt.
        var digits = [];
        var isNegative = text[ 0 ] === "-";

        for ( i = isNegative ? 1 : 0 ; i < text.length ; i++ ) {
            var c = text[ i ].toLowerCase(),
                charCode = c.charCodeAt( 0 );

            if ( 48 <= charCode && charCode <= 57 ) { // '0'-'9'
                digits.push( parseValue( c ) );
            } else if ( 97 <= charCode && charCode <= 122 ) { // 'a'-'z'
                digits.push( parseValue( c.charCodeAt( 0 ) - 87 ) ); // 'a' is 10, 'b' is 11, etc.
            } else if ( c === "<" ) { // Handle custom digits like <123>
                var start = i;
                do {
                    i++;
                } while ( text[ i ] !== ">" );
                digits.push( parseValue( text.slice( start + 1 , i ) ) );
            } else {
                throw new Error( c + " is not a valid character" );
            }
        }
        return parseBaseFromArray( digits , base , isNegative );
    };


    /*
     * Converts an array of digits (in a given base) into a BigInteger.
     *
     * @param {BigInteger[]} digits - An array of BigInteger digits.
     * @param {BigInteger} base - The base of the number.
     * @param {boolean} isNegative - True if the number is negative.
     * @returns {BigInteger} The resulting big integer.
     */
    function parseBaseFromArray( digits , base , isNegative ) {
        var val = Integer[ 0 ], // Initialize result to 0.
            pow = Integer[ 1 ], // Initialize power to 1.
            i;

        // Sum digits * base^power.
        for ( i = digits.length - 1 ; i >= 0 ; i-- ) {
            val = val.add( digits[ i ].times( pow ) );
            pow = pow.times( base );
        }
        return isNegative ? val.negate() : val;
    }


    // --- Base Conversion (Stringifying) ---

    /*
     * Converts a single digit (number) to its string representation for various bases.
     *
     * @param {number} digit - The digit to convert.
     * @returns {string} The string representation of the digit.
     */
    function stringify( digit ) {
        if ( digit <= 35 ) {
            return "0123456789abcdefghijklmnopqrstuvwxyz".charAt( digit );
        }
        return "<" + digit + ">"; // For digits > 35, use custom format.
    }


    /*
     * Converts a big integer `n` to an array of digits in a given `base`.
     *
     * @param {BigInteger|SmallInteger} n - The number to convert.
     * @param {BigInteger|SmallInteger} base - The target base.
     * @returns {{value: number[], isNegative: boolean}} Object with digit array and sign.
     * @throws {Error} If base is 0 or other invalid scenarios.
     */
    function toBase( n , base ) {
        base = bigInt( base ); // Ensure base is a BigInt.

        if ( base.isZero() ) {
            if ( n.isZero() ) return { value: [ 0 ] , isNegative: false };
            throw new Error( "Cannot convert nonzero numbers to base 0." );
        }

        if ( base.equals( -1 ) ) {
            if ( n.isZero() ) return { value: [ 0 ] , isNegative: false };
            if ( n.isNegative() ) {
                // For negative numbers in base -1, alternating 1s and 0s.
                return { value: [].concat.apply( [] , Array.apply( null , Array( -n ) ).map( Array.prototype.valueOf , [ 1 , 0 ] ) ) , isNegative: false };
            }
            // For positive numbers in base -1.
            var arr = Array.apply( null , Array( +n - 1 ) ).map( Array.prototype.valueOf , [ 0 , 1 ] );
            arr.unshift( [ 1 ] );
            return { value: [].concat.apply( [] , arr ) , isNegative: false };
        }

        var neg = false;
        if ( n.isNegative() && base.isPositive() ) {
            neg = true;
            n = n.abs();
        }

        if ( base.equals( 1 ) ) {
            if ( n.isZero() ) return { value: [ 0 ] , isNegative: false };
            // For base 1, result is an array of ones.
            return { value: Array.apply( null , Array( +n ) ).map( Number.prototype.valueOf , 1 ) , isNegative: neg };
        }

        var out = [];
        var left = n,
            divmod;

        // Repeatedly divide by base and take remainders.
        while ( left.isNegative() || left.compareAbs( base ) >= 0 ) {
            divmod = left.divmod( base );
            left = divmod.quotient;
            var digit = divmod.remainder;

            // Handle negative remainders by adjusting quotient and remainder.
            if ( digit.isNegative() ) {
                digit = base.minus( digit ).abs();
                left = left.next();
            }
            out.push( digit.toJSNumber() );
        }
        out.push( left.toJSNumber() ); // Push the final quotient.
        return { value: out.reverse() , isNegative: neg }; // Reverse for correct order.
    }


    /*
     * Converts a big integer `n` to its string representation in a given `base`.
     *
     * @param {BigInteger|SmallInteger} n - The number to convert.
     * @param {number} base - The target base.
     * @returns {string} The string representation.
     */
    function toBaseString( n , base ) {
        var arr = toBase( n , base );
        return ( arr.isNegative ? "-" : "" ) + arr.value.map( stringify ).join( "" );
    }


    // --- BigInteger.prototype.toArray Method ---
    BigInteger.prototype.toArray = function ( radix ) {
        return toBase( this , radix );
    };
    SmallInteger.prototype.toArray = function ( radix ) {
        return toBase( this , radix );
    };


    // --- BigInteger.prototype.toString Method ---
    BigInteger.prototype.toString = function ( radix ) {
        if ( radix === undefined ) radix = 10;
        if ( radix !== 10 ) return toBaseString( this , radix ); // Use generic base conversion for non-10.

        var v   = this.value,
            l   = v.length,
            str = String( v[ --l ] ), // Start with the most significant digit.
            zeros = "0000000",        // Helper for padding with leading zeros.
            digit;

        while ( --l >= 0 ) {
            digit = String( v[ l ] );
            str += zeros.slice( digit.length ) + digit; // Pad and append.
        }

        var sign = this.sign ? "-" : "";
        return sign + str;
    };


    // --- SmallInteger.prototype.toString Method ---
    SmallInteger.prototype.toString = function ( radix ) {
        if ( radix === undefined ) radix = 10;
        if ( radix != 10 ) return toBaseString( this , radix ); // Use generic base conversion for non-10.
        return String( this.value ); // Native conversion for base 10.
    };


    // --- JSON Serialization ---
    BigInteger.prototype.toJSON = SmallInteger.prototype.toJSON = function () {
        return this.toString(); // Serialize to string.
    };


    // --- Value Of and JS Number Conversion ---
    BigInteger.prototype.valueOf = function () {
        return parseInt( this.toString() , 10 ); // Convert to native JS number.
    };
    BigInteger.prototype.toJSNumber = BigInteger.prototype.valueOf; // Alias.

    SmallInteger.prototype.valueOf = function () {
        return this.value; // Return the native value directly.
    };
    SmallInteger.prototype.toJSNumber = SmallInteger.prototype.valueOf; // Alias.


    // --- Parsing Input Values ---

    /*
     * Parses a string `v` into a BigInteger or SmallInteger.
     * Handles scientific notation and checks for valid integer format.
     *
     * @param {string} v - The string to parse.
     * @returns {BigInteger|SmallInteger} The parsed number.
     * @throws {Error} If the string is not a valid integer.
     */
    function parseStringValue( v ) {
        if ( isPrecise( +v ) ) {
            var x = +v;
            if ( x === truncate( x ) ) {
                return new SmallInteger( x );
            }
            throw new Error( "Invalid integer: " + v );
        }

        var sign = v[ 0 ] === "-";
        if ( sign ) v = v.slice( 1 ); // Remove sign for parsing digits.

        var split = v.split( /e/i ); // Handle scientific notation.
        if ( split.length > 2 ) {
            throw new Error( "Invalid integer: " + split.join( "e" ) );
        }

        if ( split.length === 2 ) {
            var exp = split[ 1 ];
            if ( exp[ 0 ] === "+" ) exp = exp.slice( 1 );
            exp = +exp; // Convert exponent to number.

            if ( exp !== truncate( exp ) || !isPrecise( exp ) ) {
                throw new Error( "Invalid integer: " + exp + " is not a valid exponent." );
            }
            if ( exp < 0 ) {
                throw new Error( "Cannot include negative exponent part for integers" );
            }

            var text = split[ 0 ];
            var decimalPlace = text.indexOf( "." );
            if ( decimalPlace >= 0 ) {
                exp -= text.length - decimalPlace - 1;
                text = text.slice( 0 , decimalPlace ) + text.slice( decimalPlace + 1 ); // Remove decimal point.
            }
            text += new Array( exp + 1 ).join( "0" ); // Add trailing zeros for exponent.
            v = text;
        }

        var isValid = /^([0-9][0-9]*)$/.test( v ); // Basic validation for integer format.
        if ( !isValid ) {
            throw new Error( "Invalid integer: " + v );
        }

        var r   = [],
            max = v.length,
            l   = LOG_BASE, // Length of each digit chunk.
            min = max - l;

        // Split the string into chunks of BASE digits and convert to numbers.
        while ( max > 0 ) {
            r.push( +v.slice( min , max ) );
            min -= l;
            if ( min < 0 ) min = 0;
            max -= l;
        }

        trim( r ); // Trim leading zeros from the array.
        return new BigInteger( r , sign );
    }


    /*
     * Parses a number `v` into a BigInteger or SmallInteger.
     *
     * @param {number} v - The number to parse.
     * @returns {BigInteger|SmallInteger} The parsed number.
     * @throws {Error} If the number is not an integer.
     */
    function parseNumberValue( v ) {
        if ( isPrecise( v ) ) {
            if ( v !== truncate( v ) ) {
                throw new Error( v + " is not an integer." );
            }
            return new SmallInteger( v );
        }
        // If not precise, convert to string and parse.
        return parseStringValue( v.toString() );
    }


    /*
     * The main parsing function, handles various input types.
     *
     * @param {any} v - The value to parse.
     * @returns {BigInteger|SmallInteger} The parsed number.
     */
    function parseValue( v ) {
        if ( typeof v === "number" ) {
            return parseNumberValue( v );
        }
        if ( typeof v === "string" ) {
            return parseStringValue( v );
        }
        return v; // Assume it's already a BigInt object.
    }


    // --- Pre-cached SmallIntegers ---
    // Cache small integers from 0 to 999 for performance.
    for ( var i = 0 ; i < 1e3 ; i++ ) {
        Integer[ i ] = new SmallInteger( i );
        if ( i > 0 ) {
            Integer[ -i ] = new SmallInteger( -i );
        }
    }

    // --- Static Properties on Integer ---
    Integer.one       = Integer[ 1 ];
    Integer.zero      = Integer[ 0 ];
    Integer.minusOne  = Integer[ -1 ];
    Integer.max       = max;
    Integer.min       = min;
    Integer.gcd       = gcd;
    Integer.lcm       = lcm;
    // Type check for BigInt instances.
    Integer.isInstance = function ( x ) {
        return x instanceof BigInteger || x instanceof SmallInteger;
    };
    Integer.randBetween = randBetween;

    // Factory method to create from an array of digits.
    Integer.fromArray = function ( digits , base , isNegative ) {
        // Map digits to BigInt objects, parse base, then call parseBaseFromArray.
        return parseBaseFromArray( digits.map( parseValue ) , parseValue( base || 10 ) , isNegative );
    };


    return Integer; // The factory function for creating big integers.
}(); // End of IIFE, bigInt is now the Integer factory.


// --- Main Program Logic ---

// The main function receives input as a string.
const main = arg => {
    // Trim whitespace from the input and split it by newlines.
    arg = arg
          .trim()
          .split( "\n" );

    // Parse the first line to get L and R values.
    // L: The starting number for the range.
    const L = parseInt( arg[ 0 ].split( " " )[ 0 ] );
    // R: The ending number for the range.
    const R = parseInt( arg[ 0 ].split( " " )[ 1 ] );

    // Initialize 'answer' (though it's not directly used for the final output here)
    // and 'pp' (product) and 'tt' (remainder).
    let answer = L; // This variable seems to be a placeholder for a specific purpose, maybe for a different problem variant.
    let pp     = bigInt( L )
                 .multiply( L + 1 ); // Calculate L * (L + 1).
    let tt     = bigInt( pp )
                 .divmod( 2019 )
                 .remainder; // Calculate (L * (L + 1)) % 2019.

    // Iterate through the range from L to R (exclusive of R).
    for ( let i = L ; i < R ; i++ ) {
        // This block checks if 'i' itself is a multiple of 2019.
        // If it is, then i * (i + 1) will also be a multiple of 2019,
        // making the remainder 0, which is the smallest possible remainder.
        if ( i % 2019 === 0 ) {
            answer = i; // Store 'i' as the 'answer' that yields a zero remainder.
            let multi = bigInt( answer )
                        .multiply( answer + 1 ); // Recalculate (answer * (answer + 1)).
            // Print the remainder, which will be 0.
            console.log( bigInt( multi ).divmod( 2019 ).remainder.toString() );
            return; // Exit early as the minimum remainder (0) has been found.
        }

        // Calculate (i * (i + 1)) % 2019 for the current 'i'.
        let temp = ( bigInt( i ).multiply( i + 1 ) );
        temp = bigInt( temp )
               .divmod( 2019 )
               .remainder;

        /*
         * Original debug comments, now formatted as a multi-line comment block.
         *
         * console.log("i:" + i);
         * console.log("tt:" + tt);
         * console.log("temp:" + temp);
         */

        // Update 'tt' if a smaller remainder is found.
        if ( tt > temp ) {
            tt = temp;
        }
    }

    // After checking all numbers in the range, print the smallest remainder found.
    console.log( tt.toString() );
};

// Read input from standard input (/dev/stdin) and pass it to the main function.
main( require( 'fs' ).readFileSync( '/dev/stdin' , 'utf8' ) );