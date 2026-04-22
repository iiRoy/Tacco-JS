"use strict"
// This is a self-executing anonymous function that initializes the bigInt library.
// It creates a closure for its internal variables and functions, preventing global pollution.
var bigInt = ( function ( undefined ) {

    "use strict"; // Enforce strict mode within the IIFE as well

    /*
     *  Constants used throughout the BigInteger implementation.
     *  BASE: The base for arithmetic operations (10^7 for efficient JS number handling).
     *  LOG_BASE: Logarithm of the base, used for string conversions and digit extraction.
     *  MAX_INT: Maximum safe integer in JavaScript.
     *  MAX_INT_ARR: MAX_INT represented as an array of base-`BASE` digits.
     *  LOG_MAX_INT: Logarithm of MAX_INT, useful for base conversions.
     */
    var BASE          = 1e7,
        LOG_BASE      = 7,
        MAX_INT       = 9007199254740992,
        MAX_INT_ARR   = smallToArray( MAX_INT ),
        LOG_MAX_INT   = Math.log( MAX_INT );

    // Core Integer constructor function, acts as a factory for BigInteger/SmallInteger instances.
    function Integer ( v, radix ) {
        // If no value is provided, return the cached zero instance.
        if ( typeof v === "undefined" ) {
            return Integer[ 0 ];
        }

        // If a radix is provided, parse the value according to that base.
        if ( typeof radix !== "undefined" ) {
            return +radix === 10 ? parseValue( v ) : parseBase( v, radix );
        }

        // Default parsing for value without explicit radix.
        return parseValue( v );
    }

    // Constructor for BigInteger objects (numbers exceeding MAX_INT).
    function BigInteger ( value, sign ) {
        this.value   = value; // Array of digits in base BASE.
        this.sign    = sign;  // Boolean, true for negative, false for positive.
        this.isSmall = false; // Flag indicating it's a BigInteger.
    }

    // Set up prototype chain: BigInteger inherits from Integer.
    BigInteger.prototype = Object.create( Integer.prototype );

    // Constructor for SmallInteger objects (numbers within MAX_INT range).
    function SmallInteger ( value ) {
        this.value   = value; // The actual JavaScript number.
        this.sign    = value < 0; // Boolean, true for negative.
        this.isSmall = true;  // Flag indicating it's a SmallInteger.
    }

    // Set up prototype chain: SmallInteger also inherits from Integer.
    SmallInteger.prototype = Object.create( Integer.prototype );


    /**
     * Checks if a given number `n` can be precisely represented by JavaScript's number type.
     * @param {number} n - The number to check.
     * @returns {boolean} - True if precise, false otherwise.
     */
    function isPrecise ( n ) {
        return -MAX_INT < n && n < MAX_INT;
    }

    /**
     * Converts a small JavaScript number into an array of digits in BASE.
     * This is used to represent small numbers consistently with BigIntegers.
     * @param {number} n - The small number.
     * @returns {number[]} - Array of digits.
     */
    function smallToArray ( n ) {
        if ( n < 1e7 ) {
            return [ n ];
        }
        if ( n < 1e14 ) {
            return [ n % 1e7, Math.floor( n / 1e7 ) ];
        }
        return [ n % 1e7, Math.floor( n / 1e7 ) % 1e7, Math.floor( n / 1e14 ) ];
    }

    /**
     * Converts an array of digits (in BASE) back to a small JavaScript number if possible.
     * This optimizes storage and operations for numbers that fit within MAX_INT.
     * @param {number[]} arr - Array of digits.
     * @returns {number|number[]} - The small number or the original array if too large.
     */
    function arrayToSmall ( arr ) {
        // Remove leading zeros (or empty array if all zeros).
        trim( arr );

        var length = arr.length;

        // Check if the array represents a number small enough to be a SmallInteger.
        if ( length < 4 && compareAbs( arr, MAX_INT_ARR ) < 0 ) {
            switch ( length ) {
                case 0:
                    return 0; // Represents zero.
                case 1:
                    return arr[ 0 ];
                case 2:
                    return arr[ 0 ] + arr[ 1 ] * BASE;
                default:
                    return arr[ 0 ] + ( arr[ 1 ] + arr[ 2 ] * BASE ) * BASE;
            }
        }
        return arr; // Still too large, return as array.
    }

    /**
     * Removes leading zeros from a digit array (in BASE).
     * Modifies the array in place.
     * @param {number[]} v - The digit array.
     */
    function trim ( v ) {
        var i = v.length;
        while ( v[ --i ] === 0 && i >= 0 ); // Find the first non-zero digit from the end.
        v.length = i + 1; // Truncate the array.
    }

    /**
     * Creates a new array of a given length, initialized with zeros.
     * @param {number} length - The desired length of the array.
     * @returns {number[]} - The new array.
     */
    function createArray ( length ) {
        var x = new Array( length );
        var i = -1;
        while ( ++i < length ) {
            x[ i ] = 0;
        }
        return x;
    }

    /**
     * Truncates a number towards zero (removes fractional part).
     * Equivalent to Math.trunc() for positive numbers, Math.ceil() for negative.
     * @param {number} n - The number to truncate.
     * @returns {number} - The truncated integer.
     */
    function truncate ( n ) {
        if ( n > 0 ) {
            return Math.floor( n );
        }
        return Math.ceil( n );
    }

    // --- Arithmetic Operations ---

    /**
     * Adds two digit arrays (representing positive BigIntegers).
     * Assumes a.length >= b.length.
     * @param {number[]} a - First operand (digit array).
     * @param {number[]} b - Second operand (digit array).
     * @returns {number[]} - Resulting digit array.
     */
    function add ( a, b ) {
        var l_a   = a.length,
            l_b   = b.length,
            r     = new Array( l_a ),
            carry = 0,
            base  = BASE,
            sum,
            i;

        // Add digits pairwise until one array runs out.
        for ( i = 0; i < l_b; i++ ) {
            sum      = a[ i ] + b[ i ] + carry;
            carry    = sum >= base ? 1 : 0;
            r[ i ]   = sum - carry * base;
        }

        // Add remaining digits of the longer array with carry.
        while ( i < l_a ) {
            sum      = a[ i ] + carry;
            carry    = sum === base ? 1 : 0;
            r[ i++ ] = sum - carry * base;
        }

        // If there's a final carry, push it to the result.
        if ( carry > 0 ) {
            r.push( carry );
        }

        return r;
    }

    /**
     * Adds two digit arrays, handling differing lengths by ensuring the longer is first.
     * @param {number[]} a - First operand.
     * @param {number[]} b - Second operand.
     * @returns {number[]} - Resulting digit array.
     */
    function addAny ( a, b ) {
        if ( a.length >= b.length ) {
            return add( a, b );
        }
        return add( b, a );
    }

    /**
     * Adds a small number (carry) to a digit array.
     * Used for operations involving SmallIntegers and BigIntegers.
     * @param {number[]} a - Digit array.
     * @param {number} carry - Small number to add.
     * @returns {number[]} - Resulting digit array.
     */
    function addSmall ( a, carry ) {
        var l     = a.length,
            r     = new Array( l ),
            base  = BASE,
            sum,
            i;

        for ( i = 0; i < l; i++ ) {
            sum    = a[ i ] - base + carry; // optimized for carry propagation
            carry  = Math.floor( sum / base );
            r[ i ] = sum - carry * base;
            carry += 1;
        }

        // Handle any remaining carry.
        while ( carry > 0 ) {
            r[ i++ ] = carry % base;
            carry    = Math.floor( carry / base );
        }

        return r;
    }

    // BigInteger.prototype.add method implementation.
    BigInteger.prototype.add = function ( v ) {
        var n = parseValue( v ); // Convert input to an Integer object.

        // If signs are different, perform subtraction instead (e.g., 5 + (-3) = 5 - 3).
        if ( this.sign !== n.sign ) {
            return this.subtract( n.negate() );
        }

        var a = this.value,
            b = n.value;

        // If the other operand is small, use optimized addSmall.
        if ( n.isSmall ) {
            return new BigInteger( addSmall( a, Math.abs( b ) ), this.sign );
        }

        // Both are BigIntegers, use general addAny.
        return new BigInteger( addAny( a, b ), this.sign );
    };

    // Alias 'plus' for 'add'.
    BigInteger.prototype.plus = BigInteger.prototype.add;

    // SmallInteger.prototype.add method implementation.
    SmallInteger.prototype.add = function ( v ) {
        var n = parseValue( v ); // Convert input to an Integer object.
        var a = this.value;

        // If signs are different, perform subtraction (e.g., -5 + 3 = -(5 - 3)).
        if ( a < 0 !== n.sign ) {
            return this.subtract( n.negate() );
        }

        var b = n.value;

        // If both are small, perform direct addition.
        if ( n.isSmall ) {
            if ( isPrecise( a + b ) ) {
                return new SmallInteger( a + b );
            }
            // If result exceeds MAX_INT, convert b to array and use BigInteger path.
            b = smallToArray( Math.abs( b ) );
        }

        // One or both are BigIntegers, convert 'a' to array and use BigInteger addition.
        return new BigInteger( addSmall( b, Math.abs( a ) ), a < 0 );
    };

    // Alias 'plus' for 'add' on SmallInteger.
    SmallInteger.prototype.plus = SmallInteger.prototype.add;

    /**
     * Subtracts two digit arrays (representing positive BigIntegers).
     * Assumes a >= b.
     * @param {number[]} a - Minuend (digit array).
     * @param {number[]} b - Subtrahend (digit array).
     * @returns {number[]} - Resulting digit array.
     */
    function subtract ( a, b ) {
        var a_l      = a.length,
            b_l      = b.length,
            r        = new Array( a_l ),
            borrow   = 0,
            base     = BASE,
            i,
            difference;

        // Subtract digits pairwise.
        for ( i = 0; i < b_l; i++ ) {
            difference = a[ i ] - borrow - b[ i ];
            if ( difference < 0 ) {
                difference += base;
                borrow      = 1;
            } else {
                borrow      = 0;
            }
            r[ i ] = difference;
        }

        // Propagate borrow through remaining digits of 'a'.
        for ( i = b_l; i < a_l; i++ ) {
            difference = a[ i ] - borrow;
            if ( difference < 0 ) {
                difference += base;
            } else {
                r[ i++ ] = difference;
                break; // No more borrow, copy rest of 'a'.
            }
            r[ i ] = difference;
        }

        // Copy any remaining digits from 'a' (no borrow left).
        for ( ; i < a_l; i++ ) {
            r[ i ] = a[ i ];
        }

        trim( r ); // Remove leading zeros.
        return r;
    }

    /**
     * Subtracts two digit arrays, handling sign and order.
     * @param {number[]} a - First operand.
     * @param {number[]} b - Second operand.
     * @param {boolean} sign - The current sign of the result (will be inverted if b > a).
     * @returns {BigInteger|SmallInteger} - Resulting Integer object.
     */
    function subtractAny ( a, b, sign ) {
        var value;

        // Determine which number is larger in absolute value to ensure positive result from `subtract`.
        if ( compareAbs( a, b ) >= 0 ) {
            value = subtract( a, b );
        } else {
            value = subtract( b, a );
            sign  = !sign; // Invert sign if b was larger.
        }

        value = arrayToSmall( value ); // Try to convert to SmallInteger if possible.

        if ( typeof value === "number" ) {
            if ( sign ) {
                value = -value;
            }
            return new SmallInteger( value );
        }
        return new BigInteger( value, sign );
    }

    /**
     * Subtracts a small number from a digit array.
     * @param {number[]} a - Digit array.
     * @param {number} b - Small number to subtract.
     * @param {boolean} sign - The sign of the result.
     * @returns {BigInteger|SmallInteger} - Resulting Integer object.
     */
    function subtractSmall ( a, b, sign ) {
        var l          = a.length,
            r          = new Array( l ),
            carry      = -b, // Negative carry for subtraction.
            base       = BASE,
            i,
            difference;

        for ( i = 0; i < l; i++ ) {
            difference = a[ i ] + carry;
            carry      = Math.floor( difference / base );
            difference %= base;
            r[ i ]     = difference < 0 ? difference + base : difference;
        }

        r = arrayToSmall( r ); // Try to convert to SmallInteger.

        if ( typeof r === "number" ) {
            if ( sign ) {
                r = -r;
            }
            return new SmallInteger( r );
        }
        return new BigInteger( r, sign );
    }

    // BigInteger.prototype.subtract method implementation.
    BigInteger.prototype.subtract = function ( v ) {
        var n = parseValue( v );

        // If signs are different, perform addition instead (e.g., 5 - (-3) = 5 + 3).
        if ( this.sign !== n.sign ) {
            return this.add( n.negate() );
        }

        var a = this.value,
            b = n.value;

        // If the other operand is small, use optimized subtractSmall.
        if ( n.isSmall ) {
            return subtractSmall( a, Math.abs( b ), this.sign );
        }

        // Both are BigIntegers, use general subtractAny.
        return subtractAny( a, b, this.sign );
    };

    // Alias 'minus' for 'subtract' on BigInteger.
    BigInteger.prototype.minus = BigInteger.prototype.subtract;

    // SmallInteger.prototype.subtract method implementation.
    SmallInteger.prototype.subtract = function ( v ) {
        var n = parseValue( v );
        var a = this.value;

        // If signs are different, perform addition.
        if ( a < 0 !== n.sign ) {
            return this.add( n.negate() );
        }

        var b = n.value;

        // If both are small, perform direct subtraction.
        if ( n.isSmall ) {
            return new SmallInteger( a - b );
        }

        // One or both are BigIntegers, convert 'a' to array and use BigInteger subtraction.
        return subtractSmall( b, Math.abs( a ), a >= 0 );
    };

    // Alias 'minus' for 'subtract' on SmallInteger.
    SmallInteger.prototype.minus = SmallInteger.prototype.subtract;

    // Negates the BigInteger (flips its sign).
    BigInteger.prototype.negate = function () {
        return new BigInteger( this.value, !this.sign );
    };

    // Negates the SmallInteger.
    SmallInteger.prototype.negate = function () {
        var sign  = this.sign;
        var small = new SmallInteger( -this.value );
        small.sign = !sign; // Flip the sign.
        return small;
    };

    // Returns the absolute value of the BigInteger.
    BigInteger.prototype.abs = function () {
        return new BigInteger( this.value, false ); // Always non-negative.
    };

    // Returns the absolute value of the SmallInteger.
    SmallInteger.prototype.abs = function () {
        return new SmallInteger( Math.abs( this.value ) );
    };

    /**
     * Multiplies two digit arrays (long multiplication algorithm).
     * @param {number[]} a - First operand.
     * @param {number[]} b - Second operand.
     * @returns {number[]} - Resulting digit array.
     */
    function multiplyLong ( a, b ) {
        var a_l     = a.length,
            b_l     = b.length,
            l       = a_l + b_l,
            r       = createArray( l ), // Result array initialized to zeros.
            base    = BASE,
            product,
            carry,
            i,
            a_i,
            b_j;

        for ( i = 0; i < a_l; ++i ) {
            a_i = a[ i ];
            for ( var j = 0; j < b_l; ++j ) {
                b_j     = b[ j ];
                product = a_i * b_j + r[ i + j ]; // Add current product and previous carry/sum.
                carry   = Math.floor( product / base );
                r[ i + j ]   = product - carry * base;
                r[ i + j + 1 ] += carry; // Add carry to the next position.
            }
        }

        trim( r ); // Remove leading zeros.
        return r;
    }

    /**
     * Multiplies a digit array by a small number.
     * @param {number[]} a - Digit array.
     * @param {number} b - Small number multiplier.
     * @returns {number[]} - Resulting digit array.
     */
    function multiplySmall ( a, b ) {
        var l       = a.length,
            r       = new Array( l ),
            base    = BASE,
            carry   = 0,
            product,
            i;

        for ( i = 0; i < l; i++ ) {
            product = a[ i ] * b + carry;
            carry   = Math.floor( product / base );
            r[ i ]  = product - carry * base;
        }

        // Handle any remaining carry.
        while ( carry > 0 ) {
            r[ i++ ] = carry % base;
            carry    = Math.floor( carry / base );
        }

        return r;
    }

    /**
     * Shifts a digit array left by `n` positions (multiplies by BASE^n).
     * This is essentially appending `n` zeros.
     * @param {number[]} x - The digit array.
     * @param {number} n - The number of positions to shift.
     * @returns {number[]} - The shifted array.
     */
    function shiftLeft ( x, n ) {
        var r = [];
        while ( n-- > 0 ) {
            r.push( 0 );
        }
        return r.concat( x );
    }

    /**
     * Implements Karatsuba multiplication for two digit arrays.
     * It's an asymptotically faster algorithm for very large numbers.
     * @param {number[]} x - First operand.
     * @param {number[]} y - Second operand.
     * @returns {number[]} - Resulting digit array.
     */
    function multiplyKaratsuba ( x, y ) {
        var n = Math.max( x.length, y.length );

        // Base case for recursion: fall back to long multiplication for small arrays.
        if ( n <= 30 ) {
            return multiplyLong( x, y );
        }

        n = Math.ceil( n / 2 ); // Split point.

        // Divide x and y into two halves.
        var b    = x.slice( n ),
            a    = x.slice( 0, n ),
            d    = y.slice( n ),
            c    = y.slice( 0, n );

        // Recursively compute products.
        var ac   = multiplyKaratsuba( a, c ),
            bd   = multiplyKaratsuba( b, d ),
            abcd = multiplyKaratsuba( addAny( a, b ), addAny( c, d ) );

        // Combine results using Karatsuba formula:
        // (a*BASE^n + b) * (c*BASE^n + d) = ac*BASE^2n + (ad+bc)*BASE^n + bd
        // where ad+bc = (a+b)(c+d) - ac - bd
        var product = addAny( addAny( ac, shiftLeft( subtract( subtract( abcd, ac ), bd ), n ) ), shiftLeft( bd, 2 * n ) );

        trim( product ); // Remove leading zeros.
        return product;
    }

    /**
     * Heuristic to decide whether to use Karatsuba algorithm.
     * Karatsuba is faster for very large numbers but has overhead for smaller ones.
     * This function approximates the crossover point.
     * @param {number} l1 - Length of first digit array.
     * @param {number} l2 - Length of second digit array.
     * @returns {boolean} - True if Karatsuba should be used.
     */
    function useKaratsuba ( l1, l2 ) {
        return -.012 * l1 - .012 * l2 + 15e-6 * l1 * l2 > 0;
    }

    // BigInteger.prototype.multiply method implementation.
    BigInteger.prototype.multiply = function ( v ) {
        var n    = parseValue( v ),
            a    = this.value,
            b    = n.value,
            sign = this.sign !== n.sign, // Determine sign of result.
            abs;

        // Optimization for multiplication by SmallInteger.
        if ( n.isSmall ) {
            if ( b === 0 ) {
                return Integer[ 0 ];
            }
            if ( b === 1 ) {
                return this;
            }
            if ( b === -1 ) {
                return this.negate();
            }

            abs = Math.abs( b );

            // If small number fits within a single digit, use multiplySmall.
            if ( abs < BASE ) {
                return new BigInteger( multiplySmall( a, abs ), sign );
            }

            // Convert small number to digit array for multiplyLong.
            b = smallToArray( abs );
        }

        // Choose between Karatsuba and standard long multiplication.
        if ( useKaratsuba( a.length, b.length ) ) {
            return new BigInteger( multiplyKaratsuba( a, b ), sign );
        }

        return new BigInteger( multiplyLong( a, b ), sign );
    };

    // Alias 'times' for 'multiply' on BigInteger.
    BigInteger.prototype.times = BigInteger.prototype.multiply;

    /**
     * Multiplies a small number by a digit array.
     * This is a helper function for internal multiplication logic.
     * @param {number} a - The small number.
     * @param {number[]} b - The digit array.
     * @param {boolean} sign - The sign of the result.
     * @returns {BigInteger} - The resulting BigInteger.
     */
    function multiplySmallAndArray ( a, b, sign ) {
        if ( a < BASE ) {
            return new BigInteger( multiplySmall( b, a ), sign );
        }
        return new BigInteger( multiplyLong( b, smallToArray( a ) ), sign );
    }

    // SmallInteger._multiplyBySmall: Multiplies a SmallInteger by another SmallInteger.
    SmallInteger.prototype._multiplyBySmall = function ( a ) {
        // Direct multiplication if result is precise.
        if ( isPrecise( a.value * this.value ) ) {
            return new SmallInteger( a.value * this.value );
        }
        // Fallback to BigInteger multiplication.
        return multiplySmallAndArray( Math.abs( a.value ), smallToArray( Math.abs( this.value ) ), this.sign !== a.sign );
    };

    // BigInteger._multiplyBySmall: Multiplies a BigInteger by a SmallInteger.
    BigInteger.prototype._multiplyBySmall = function ( a ) {
        if ( a.value === 0 ) {
            return Integer[ 0 ];
        }
        if ( a.value === 1 ) {
            return this;
        }
        if ( a.value === -1 ) {
            return this.negate();
        }
        return multiplySmallAndArray( Math.abs( a.value ), this.value, this.sign !== a.sign );
    };

    // SmallInteger.prototype.multiply method implementation.
    SmallInteger.prototype.multiply = function ( v ) {
        // Delegate to the internal _multiplyBySmall method after parsing the value.
        return parseValue( v )._multiplyBySmall( this );
    };

    // Alias 'times' for 'multiply' on SmallInteger.
    SmallInteger.prototype.times = SmallInteger.prototype.multiply;

    /**
     * Squares a digit array using an optimized algorithm.
     * @param {number[]} a - The digit array to square.
     * @returns {number[]} - The squared digit array.
     */
    function square ( a ) {
        var l       = a.length,
            r       = createArray( l + l ), // Result array for a*a will have up to 2*l digits.
            base    = BASE,
            product,
            carry,
            i,
            a_i,
            a_j;

        for ( i = 0; i < l; i++ ) {
            a_i   = a[ i ];
            carry = 0 - a_i * a_i; // Initialize carry with negative square for efficient calculation.
            for ( var j = i; j < l; j++ ) {
                a_j   = a[ j ];
                product   = 2 * ( a_i * a_j ) + r[ i + j ] + carry;
                carry     = Math.floor( product / base );
                r[ i + j ] = product - carry * base;
            }
            r[ i + l ] = carry; // Store final carry for this 'i' loop.
        }

        trim( r ); // Remove leading zeros.
        return r;
    }

    // BigInteger.prototype.square method implementation.
    BigInteger.prototype.square = function () {
        return new BigInteger( square( this.value ), false ); // Square is always non-negative.
    };

    // SmallInteger.prototype.square method implementation.
    SmallInteger.prototype.square = function () {
        var value = this.value * this.value;
        if ( isPrecise( value ) ) {
            return new SmallInteger( value );
        }
        // If result exceeds MAX_INT, convert to BigInteger square.
        return new BigInteger( square( smallToArray( Math.abs( this.value ) ) ), false );
    };

    /**
     * Division with remainder (Knuth's Algorithm D).
     * Optimized for cases where divisor has more than one digit.
     * @param {number[]} a - Dividend digit array.
     * @param {number[]} b - Divisor digit array.
     * @returns {[number[], number[]]} - [quotient array, remainder array].
     */
    function divMod1 ( a, b ) {
        var a_l                         = a.length,
            b_l                         = b.length,
            base                        = BASE,
            result                      = createArray( b.length ), // Quotient will have approx a_l - b_l + 1 digits.
            divisorMostSignificantDigit = b[ b_l - 1 ],
            // Normalization factor (lambda) to make the most significant digit of divisor >= BASE/2.
            lambda                      = Math.ceil( base / ( 2 * divisorMostSignificantDigit ) ),
            remainder                   = multiplySmall( a, lambda ), // Normalize dividend.
            divisor                     = multiplySmall( b, lambda ), // Normalize divisor.
            quotientDigit,
            shift,
            carry,
            borrow,
            i,
            l,
            q;

        // Ensure remainder has enough space for shifted digits.
        if ( remainder.length <= a_l ) {
            remainder.push( 0 );
        }

        divisor.push( 0 ); // Pad divisor for easier calculations.
        divisorMostSignificantDigit = divisor[ b_l - 1 ]; // Recalculate after normalization/padding.

        // Iterate from most significant digit position down to least significant.
        for ( shift = a_l - b_l; shift >= 0; shift-- ) {
            // Initial guess for quotient digit.
            quotientDigit = base - 1;
            if ( remainder[ shift + b_l ] !== divisorMostSignificantDigit ) {
                quotientDigit = Math.floor( ( remainder[ shift + b_l ] * base + remainder[ shift + b_l - 1 ] ) / divisorMostSignificantDigit );
            }

            carry  = 0;
            borrow = 0;
            l      = divisor.length;

            // Multiply divisor by quotientDigit and subtract from current part of remainder.
            for ( i = 0; i < l; i++ ) {
                carry += quotientDigit * divisor[ i ];
                q      = Math.floor( carry / base );
                borrow += remainder[ shift + i ] - ( carry - q * base );
                carry  = q;
                if ( borrow < 0 ) {
                    remainder[ shift + i ] = borrow + base;
                    borrow                 = -1;
                } else {
                    remainder[ shift + i ] = borrow;
                    borrow                 = 0;
                }
            }

            // Adjust quotientDigit if the subtraction resulted in a negative remainder part.
            while ( borrow !== 0 ) {
                quotientDigit -= 1;
                carry          = 0;
                for ( i = 0; i < l; i++ ) {
                    carry += remainder[ shift + i ] - base + divisor[ i ];
                    if ( carry < 0 ) {
                        remainder[ shift + i ] = carry + base;
                        carry                  = 0;
                    } else {
                        remainder[ shift + i ] = carry;
                        carry                  = 1;
                    }
                }
                borrow += carry;
            }
            result[ shift ] = quotientDigit;
        }

        // Denormalize the remainder.
        remainder = divModSmall( remainder, lambda )[ 0 ];

        return [ arrayToSmall( result ), arrayToSmall( remainder ) ];
    }

    /**
     * Alternative division algorithm, simpler but potentially slower for very large numbers.
     * @param {number[]} a - Dividend digit array.
     * @param {number[]} b - Divisor digit array.
     * @returns {[number[], number[]]} - [quotient array, remainder array].
     */
    function divMod2 ( a, b ) {
        var a_l    = a.length,
            b_l    = b.length,
            result = [],
            part   = [],
            base   = BASE,
            guess,
            xlen,
            highx,
            highy,
            check;

        // Iterate through dividend digits from most significant to least significant.
        while ( a_l ) {
            part.unshift( a[ --a_l ] ); // Take one digit from dividend.
            trim( part ); // Remove leading zeros from current part.

            // If current part is smaller than divisor, quotient digit is 0.
            if ( compareAbs( part, b ) < 0 ) {
                result.push( 0 );
                continue;
            }

            // Estimate quotient digit.
            xlen = part.length;
            highx = part[ xlen - 1 ] * base + part[ xlen - 2 ];
            highy = b[ b_l - 1 ] * base + b[ b_l - 2 ];

            if ( xlen > b_l ) {
                highx = ( highx + 1 ) * base;
            }

            guess = Math.ceil( highx / highy );

            // Refine guess by trial subtraction.
            do {
                check = multiplySmall( b, guess );
                if ( compareAbs( check, part ) <= 0 ) {
                    break;
                }
                guess--;
            } while ( guess );

            result.push( guess ); // Add refined guess to quotient.
            part = subtract( part, check ); // Update remainder part.
        }

        result.reverse(); // Quotient digits were accumulated in reverse.

        return [ arrayToSmall( result ), arrayToSmall( part ) ];
    }

    /**
     * Performs division and modulo by a small number (single digit in BASE).
     * @param {number[]} value - The digit array to divide.
     * @param {number} lambda - The small divisor.
     * @returns {[number[], number]} - [quotient array, remainder].
     */
    function divModSmall ( value, lambda ) {
        var length    = value.length,
            quotient  = createArray( length ),
            base      = BASE,
            i,
            q,
            remainder,
            divisor;

        remainder = 0;

        // Perform long division by a single digit.
        for ( i = length - 1; i >= 0; --i ) {
            divisor    = remainder * base + value[ i ];
            q          = truncate( divisor / lambda );
            remainder  = divisor - q * lambda;
            quotient[ i ] = q | 0; // Ensure integer value.
        }

        return [ quotient, remainder | 0 ]; // Return quotient array and final remainder.
    }

    /**
     * Generic division with remainder for any two Integer objects.
     * @param {BigInteger|SmallInteger} self - The dividend.
     * @param {BigInteger|SmallInteger|number|string} v - The divisor.
     * @returns {[BigInteger|SmallInteger, BigInteger|SmallInteger]} - [quotient, remainder].
     */
    function divModAny ( self, v ) {
        var value,
            n = parseValue( v ); // Convert divisor to an Integer object.

        var a = self.value,
            b = n.value;

        var quotient;

        // Handle division by zero.
        if ( b === 0 ) {
            throw new Error( "Cannot divide by zero" );
        }

        // Case: Dividend is SmallInteger.
        if ( self.isSmall ) {
            // Case: Both are SmallIntegers.
            if ( n.isSmall ) {
                return [ new SmallInteger( truncate( a / b ) ), new SmallInteger( a % b ) ];
            }
            // Case: SmallInteger dividend, BigInteger divisor.
            return [ Integer[ 0 ], self ]; // Quotient is 0, remainder is dividend.
        }

        // Case: Divisor is SmallInteger.
        if ( n.isSmall ) {
            if ( b === 1 ) {
                return [ self, Integer[ 0 ] ];
            }
            if ( b === -1 ) {
                return [ self.negate(), Integer[ 0 ] ];
            }

            var abs = Math.abs( b );

            // If small divisor fits within a single digit, use divModSmall.
            if ( abs < BASE ) {
                value    = divModSmall( a, abs );
                quotient = arrayToSmall( value[ 0 ] );
                var remainder = value[ 1 ];

                if ( self.sign ) {
                    remainder = -remainder;
                }

                // Convert quotient to SmallInteger if possible.
                if ( typeof quotient === "number" ) {
                    if ( self.sign !== n.sign ) {
                        quotient = -quotient;
                    }
                    return [ new SmallInteger( quotient ), new SmallInteger( remainder ) ];
                }

                return [ new BigInteger( quotient, self.sign !== n.sign ), new SmallInteger( remainder ) ];
            }
            b = smallToArray( abs ); // Convert small divisor to array for BigInteger division.
        }

        // Case: Both are BigIntegers.
        var comparison = compareAbs( a, b );

        if ( comparison === -1 ) {
            return [ Integer[ 0 ], self ]; // Dividend is smaller than divisor.
        }
        if ( comparison === 0 ) {
            return [ Integer[ self.sign === n.sign ? 1 : -1 ], Integer[ 0 ] ]; // Dividend equals divisor.
        }

        // Choose division algorithm based on length.
        if ( a.length + b.length <= 200 ) {
            value = divMod1( a, b );
        } else {
            value = divMod2( a, b );
        }

        quotient  = value[ 0 ];
        var qSign = self.sign !== n.sign,
            mod   = value[ 1 ],
            mSign = self.sign;

        // Convert quotient to appropriate Integer type.
        if ( typeof quotient === "number" ) {
            if ( qSign ) {
                quotient = -quotient;
            }
            quotient = new SmallInteger( quotient );
        } else {
            quotient = new BigInteger( quotient, qSign );
        }

        // Convert remainder to appropriate Integer type.
        if ( typeof mod === "number" ) {
            if ( mSign ) {
                mod = -mod;
            }
            mod = new SmallInteger( mod );
        } else {
            mod = new BigInteger( mod, mSign );
        }

        return [ quotient, mod ];
    }

    // BigInteger.prototype.divmod method implementation.
    BigInteger.prototype.divmod = function ( v ) {
        var result = divModAny( this, v );
        return {
            quotient  : result[ 0 ],
            remainder : result[ 1 ]
        };
    };

    // SmallInteger.prototype.divmod method shares implementation with BigInteger.
    SmallInteger.prototype.divmod = BigInteger.prototype.divmod;

    // BigInteger.prototype.divide method (returns only the quotient).
    BigInteger.prototype.divide = function ( v ) {
        return divModAny( this, v )[ 0 ];
    };

    // Alias 'over' for 'divide' on both SmallInteger and BigInteger.
    SmallInteger.prototype.over = SmallInteger.prototype.divide = BigInteger.prototype.over = BigInteger.prototype.divide;

    // BigInteger.prototype.mod method (returns only the remainder).
    BigInteger.prototype.mod = function ( v ) {
        return divModAny( this, v )[ 1 ];
    };

    // Alias 'remainder' for 'mod' on both SmallInteger and BigInteger.
    SmallInteger.prototype.remainder = SmallInteger.prototype.mod = BigInteger.prototype.remainder = BigInteger.prototype.mod;

    // BigInteger.prototype.pow method (exponentiation).
    BigInteger.prototype.pow = function ( v ) {
        var n     = parseValue( v ),
            a     = this.value,
            b     = n.value,
            value,
            x,
            y;

        // Base cases for exponentiation.
        if ( b === 0 ) {
            return Integer[ 1 ]; // Any number to the power of 0 is 1.
        }
        if ( a === 0 ) {
            return Integer[ 0 ]; // 0 to any positive power is 0.
        }
        if ( a === 1 ) {
            return Integer[ 1 ]; // 1 to any power is 1.
        }
        if ( a === -1 ) {
            return n.isEven() ? Integer[ 1 ] : Integer[ -1 ]; // (-1)^even = 1, (-1)^odd = -1.
        }

        // Negative exponents are not supported for integers (result would be fractional).
        if ( n.sign ) {
            return Integer[ 0 ];
        }

        // Exponent must be a SmallInteger (or convertible to one).
        if ( !n.isSmall ) {
            throw new Error( "The exponent " + n.toString() + " is too large." );
        }

        // Optimization for small base and exponent: direct Math.pow.
        if ( this.isSmall ) {
            if ( isPrecise( value = Math.pow( a, b ) ) ) {
                return new SmallInteger( truncate( value ) );
            }
        }

        // Binary exponentiation (exponentiation by squaring).
        x = this;
        y = Integer[ 1 ]; // Initialize result to 1.

        while ( true ) {
            if ( ( b & 1 ) === 1 ) { // If exponent is odd.
                y = y.times( x );
                --b;
            }
            if ( b === 0 ) {
                break;
            }
            b /= 2;
            x = x.square(); // Square the base.
        }

        return y;
    };

    // SmallInteger.prototype.pow method shares implementation with BigInteger.
    SmallInteger.prototype.pow = BigInteger.prototype.pow;

    // BigInteger.prototype.modPow method (modular exponentiation).
    BigInteger.prototype.modPow = function ( exp, mod ) {
        exp = parseValue( exp );
        mod = parseValue( mod );

        if ( mod.isZero() ) {
            throw new Error( "Cannot take modPow with modulus 0" );
        }

        var r    = Integer[ 1 ],      // Result accumulator, initialized to 1.
            base = this.mod( mod ); // Base reduced modulo the modulus.

        // Standard modular exponentiation by squaring algorithm.
        while ( exp.isPositive() ) {
            if ( base.isZero() ) {
                return Integer[ 0 ]; // If base is 0, result is 0.
            }
            if ( exp.isOdd() ) {
                r = r.multiply( base ).mod( mod ); // r = (r * base) % mod.
            }
            exp  = exp.divide( 2 );     // exp = exp / 2.
            base = base.square().mod( mod ); // base = (base * base) % mod.
        }

        return r;
    };

    // SmallInteger.prototype.modPow method shares implementation with BigInteger.
    SmallInteger.prototype.modPow = BigInteger.prototype.modPow;

    // --- Comparison Operations ---

    /**
     * Compares the absolute values of two digit arrays.
     * @param {number[]} a - First digit array.
     * @param {number[]} b - Second digit array.
     * @returns {number} - 0 if equal, 1 if a > b, -1 if a < b.
     */
    function compareAbs ( a, b ) {
        if ( a.length !== b.length ) {
            return a.length > b.length ? 1 : -1;
        }

        // Compare digits from most significant to least significant.
        for ( var i = a.length - 1; i >= 0; i-- ) {
            if ( a[ i ] !== b[ i ] ) {
                return a[ i ] > b[ i ] ? 1 : -1;
            }
        }
        return 0; // Absolute values are equal.
    }

    // BigInteger.prototype.compareAbs method.
    BigInteger.prototype.compareAbs = function ( v ) {
        var n = parseValue( v ),
            a = this.value,
            b = n.value;

        // If comparing with a SmallInteger, the BigInteger is always larger in abs value.
        if ( n.isSmall ) {
            return 1;
        }
        return compareAbs( a, b );
    };

    // SmallInteger.prototype.compareAbs method.
    SmallInteger.prototype.compareAbs = function ( v ) {
        var n = parseValue( v ),
            a = Math.abs( this.value ),
            b = n.value;

        if ( n.isSmall ) {
            b = Math.abs( b );
            return a === b ? 0 : a > b ? 1 : -1;
        }
        return -1; // SmallInteger is always smaller in abs value than a BigInteger.
    };

    // BigInteger.prototype.compare method.
    BigInteger.prototype.compare = function ( v ) {
        // Handle special floating-point values for comparison.
        if ( v === Infinity ) {
            return -1;
        }
        if ( v === -Infinity ) {
            return 1;
        }

        var n = parseValue( v ),
            a = this.value,
            b = n.value;

        // Compare based on signs first.
        if ( this.sign !== n.sign ) {
            return n.sign ? 1 : -1; // If `this` is positive and `n` is negative, `this > n`.
        }

        // If `n` is a SmallInteger, a BigInteger is generally "larger" (or "smaller" if negative).
        if ( n.isSmall ) {
            return this.sign ? -1 : 1;
        }

        // Both are BigIntegers, compare absolute values and apply sign.
        return compareAbs( a, b ) * ( this.sign ? -1 : 1 );
    };

    // Alias 'compareTo' for 'compare' on BigInteger.
    BigInteger.prototype.compareTo = BigInteger.prototype.compare;

    // SmallInteger.prototype.compare method.
    SmallInteger.prototype.compare = function ( v ) {
        // Handle special floating-point values.
        if ( v === Infinity ) {
            return -1;
        }
        if ( v === -Infinity ) {
            return 1;
        }

        var n = parseValue( v ),
            a = this.value,
            b = n.value;

        // If both are SmallIntegers, direct comparison.
        if ( n.isSmall ) {
            return a == b ? 0 : a > b ? 1 : -1;
        }

        // If signs are different, compare based on signs.
        if ( a < 0 !== n.sign ) {
            return a < 0 ? -1 : 1;
        }

        // One is SmallInteger, one is BigInteger, and signs are the same.
        // A negative SmallInteger is "larger" than a negative BigInteger (closer to zero).
        // A positive SmallInteger is "smaller" than a positive BigInteger (closer to zero).
        return a < 0 ? 1 : -1;
    };

    // Alias 'compareTo' for 'compare' on SmallInteger.
    SmallInteger.prototype.compareTo = SmallInteger.prototype.compare;

    // BigInteger.prototype.equals method.
    BigInteger.prototype.equals = function ( v ) {
        return this.compare( v ) === 0;
    };

    // Aliases for equality checks.
    SmallInteger.prototype.eq = SmallInteger.prototype.equals = BigInteger.prototype.eq = BigInteger.prototype.equals;

    // BigInteger.prototype.notEquals method.
    BigInteger.prototype.notEquals = function ( v ) {
        return this.compare( v ) !== 0;
    };

    // Aliases for inequality checks.
    SmallInteger.prototype.neq = SmallInteger.prototype.notEquals = BigInteger.prototype.neq = BigInteger.prototype.notEquals;

    // BigInteger.prototype.greater method.
    BigInteger.prototype.greater = function ( v ) {
        return this.compare( v ) > 0;
    };

    // Aliases for greater than.
    SmallInteger.prototype.gt = SmallInteger.prototype.greater = BigInteger.prototype.gt = BigInteger.prototype.greater;

    // BigInteger.prototype.lesser method.
    BigInteger.prototype.lesser = function ( v ) {
        return this.compare( v ) < 0;
    };

    // Aliases for lesser than.
    SmallInteger.prototype.lt = SmallInteger.prototype.lesser = BigInteger.prototype.lt = BigInteger.prototype.lesser;

    // BigInteger.prototype.greaterOrEquals method.
    BigInteger.prototype.greaterOrEquals = function ( v ) {
        return this.compare( v ) >= 0;
    };

    // Aliases for greater than or equals.
    SmallInteger.prototype.geq = SmallInteger.prototype.greaterOrEquals = BigInteger.prototype.geq = BigInteger.prototype.greaterOrEquals;

    // BigInteger.prototype.lesserOrEquals method.
    BigInteger.prototype.lesserOrEquals = function ( v ) {
        return this.compare( v ) <= 0;
    };

    // Aliases for lesser than or equals.
    SmallInteger.prototype.leq = SmallInteger.prototype.lesserOrEquals = BigInteger.prototype.leq = BigInteger.prototype.lesserOrEquals;

    // --- Utility Methods ---

    // BigInteger.prototype.isEven method.
    BigInteger.prototype.isEven = function () {
        return ( this.value[ 0 ] & 1 ) === 0; // Check the least significant digit.
    };

    // SmallInteger.prototype.isEven method.
    SmallInteger.prototype.isEven = function () {
        return ( this.value & 1 ) === 0;
    };

    // BigInteger.prototype.isOdd method.
    BigInteger.prototype.isOdd = function () {
        return ( this.value[ 0 ] & 1 ) === 1;
    };

    // SmallInteger.prototype.isOdd method.
    SmallInteger.prototype.isOdd = function () {
        return ( this.value & 1 ) === 1;
    };

    // BigInteger.prototype.isPositive method.
    BigInteger.prototype.isPositive = function () {
        return !this.sign; // Positive if sign is false.
    };

    // SmallInteger.prototype.isPositive method.
    SmallInteger.prototype.isPositive = function () {
        return this.value > 0;
    };

    // BigInteger.prototype.isNegative method.
    BigInteger.prototype.isNegative = function () {
        return this.sign; // Negative if sign is true.
    };

    // SmallInteger.prototype.isNegative method.
    SmallInteger.prototype.isNegative = function () {
        return this.value < 0;
    };

    // BigInteger.prototype.isUnit method (is 1 or -1).
    BigInteger.prototype.isUnit = function () {
        return false; // A BigInteger cannot be 1 or -1, those are SmallIntegers.
    };

    // SmallInteger.prototype.isUnit method.
    SmallInteger.prototype.isUnit = function () {
        return Math.abs( this.value ) === 1;
    };

    // BigInteger.prototype.isZero method.
    BigInteger.prototype.isZero = function () {
        return false; // A BigInteger cannot be 0, that's a SmallInteger.
    };

    // SmallInteger.prototype.isZero method.
    SmallInteger.prototype.isZero = function () {
        return this.value === 0;
    };

    // BigInteger.prototype.isDivisibleBy method.
    BigInteger.prototype.isDivisibleBy = function ( v ) {
        var n = parseValue( v );
        var value = n.value;

        if ( value === 0 ) {
            return false; // Cannot divide by zero.
        }
        if ( value === 1 ) {
            return true; // Any integer is divisible by 1.
        }
        if ( value === 2 ) {
            return this.isEven(); // Optimized check for divisibility by 2.
        }

        // For other cases, check if remainder is zero.
        return this.mod( n ).equals( Integer[ 0 ] );
    };

    // SmallInteger.prototype.isDivisibleBy method shares implementation with BigInteger.
    SmallInteger.prototype.isDivisibleBy = BigInteger.prototype.isDivisibleBy;

    /**
     * Checks for basic primality (small primes and trivial cases).
     * @param {BigInteger|SmallInteger} v - The number to check.
     * @returns {boolean|undefined} - True/False if result is definitive, undefined if more checks needed.
     */
    function isBasicPrime ( v ) {
        var n = v.abs();

        if ( n.isUnit() ) {
            return false; // 1 and -1 are not prime.
        }
        if ( n.equals( 2 ) || n.equals( 3 ) || n.equals( 5 ) ) {
            return true; // 2, 3, 5 are prime.
        }
        if ( n.isEven() || n.isDivisibleBy( 3 ) || n.isDivisibleBy( 5 ) ) {
            return false; // Divisible by 2, 3, or 5, so not prime (unless it IS 2, 3, or 5).
        }
        if ( n.lesser( 25 ) ) {
            return true; // Numbers like 7, 11, 13, 17, 19, 23 (primes up to 25 not covered above).
        }
    }

    // BigInteger.prototype.isPrime method (Miller-Rabin primality test).
    BigInteger.prototype.isPrime = function () {
        var isPrime = isBasicPrime( this );
        if ( isPrime !== undefined ) {
            return isPrime;
        }

        var n     = this.abs(),
            nPrev = n.prev(); // n-1.

        // Miller-Rabin parameters.
        var a = [ 2, 3, 5, 7, 11, 13, 17, 19 ], // Smallest primes to test as bases.
            b = nPrev, // n-1.
            d,
            t,
            i,
            x;

        // Find d and s such that n-1 = d * 2^s (where d is odd).
        while ( b.isEven() ) {
            b = b.divide( 2 );
        }

        // Perform Miller-Rabin test for each base 'a'.
        for ( i = 0; i < a.length; i++ ) {
            x = bigInt( a[ i ] ).modPow( b, n ); // x = a^d mod n.

            if ( x.equals( Integer[ 1 ] ) || x.equals( nPrev ) ) {
                continue; // n is a probable prime for this base.
            }

            // Check x^(2^r * d) mod n for r from 1 to s-1.
            for ( t = true, d = b; t && d.lesser( nPrev ); d = d.multiply( 2 ) ) {
                x = x.square().mod( n );
                if ( x.equals( nPrev ) ) {
                    t = false; // Found a witness, n is composite.
                }
            }

            if ( t ) {
                return false; // n is definitely composite.
            }
        }

        return true; // n is very likely prime.
    };

    // SmallInteger.prototype.isPrime method shares implementation.
    SmallInteger.prototype.isPrime = BigInteger.prototype.isPrime;

    // BigInteger.prototype.isProbablePrime method (Simplified Miller-Rabin).
    BigInteger.prototype.isProbablePrime = function ( iterations ) {
        var isPrime = isBasicPrime( this );
        if ( isPrime !== undefined ) {
            return isPrime;
        }

        var n = this.abs();
        var t = iterations === undefined ? 5 : iterations; // Number of tests.

        for ( var i = 0; i < t; i++ ) {
            // Pick a random base 'a' between 2 and n-2.
            var a = bigInt.randBetween( 2, n.minus( 2 ) );
            // Check if a^(n-1) = 1 (mod n). If not, n is composite.
            if ( !a.modPow( n.prev(), n ).isUnit() ) {
                return false;
            }
        }

        return true; // n is very likely prime.
    };

    // SmallInteger.prototype.isProbablePrime method shares implementation.
    SmallInteger.prototype.isProbablePrime = BigInteger.prototype.isProbablePrime;


    // BigInteger.prototype.modInv (Modular Multiplicative Inverse)
    // Extended Euclidean Algorithm.
    BigInteger.prototype.modInv = function ( n ) {
        var t     = bigInt.zero,
            newT  = bigInt.one,
            r     = parseValue( n ),
            newR  = this.abs(),
            q,
            lastT,
            lastR;

        // Euclidean algorithm to find gcd(r, newR) and coefficients.
        while ( !newR.equals( bigInt.zero ) ) {
            q     = r.divide( newR );
            lastT = t;
            lastR = r;
            t     = newT;
            r     = newR;
            newT  = lastT.subtract( q.multiply( newT ) );
            newR  = lastR.subtract( q.multiply( newR ) );
        }

        // If gcd is not 1, modular inverse does not exist.
        if ( !r.equals( 1 ) ) {
            throw new Error( this.toString() + " and " + n.toString() + " are not co-prime" );
        }

        // Ensure result is positive.
        if ( t.compare( 0 ) === -1 ) {
            t = t.add( n );
        }

        // Adjust for negative input.
        if ( this.isNegative() ) {
            return t.negate();
        }

        return t;
    };

    // SmallInteger.prototype.modInv method shares implementation.
    SmallInteger.prototype.modInv = BigInteger.prototype.modInv;

    // BigInteger.prototype.next method (returns this + 1).
    BigInteger.prototype.next = function () {
        var value = this.value;
        if ( this.sign ) {
            // For negative numbers, next means subtracting 1 from absolute value and keeping sign.
            return subtractSmall( value, 1, this.sign );
        }
        // For positive numbers, simply add 1.
        return new BigInteger( addSmall( value, 1 ), this.sign );
    };

    // SmallInteger.prototype.next method.
    SmallInteger.prototype.next = function () {
        var value = this.value;
        if ( value + 1 < MAX_INT ) {
            return new SmallInteger( value + 1 );
        }
        // If it overflows SmallInteger, create a BigInteger.
        return new BigInteger( MAX_INT_ARR, false );
    };

    // BigInteger.prototype.prev method (returns this - 1).
    BigInteger.prototype.prev = function () {
        var value = this.value;
        if ( this.sign ) {
            // For negative numbers, prev means adding 1 to absolute value and keeping sign.
            return new BigInteger( addSmall( value, 1 ), true );
        }
        // For positive numbers, simply subtract 1.
        return subtractSmall( value, 1, this.sign );
    };

    // SmallInteger.prototype.prev method.
    SmallInteger.prototype.prev = function () {
        var value = this.value;
        if ( value - 1 > -MAX_INT ) {
            return new SmallInteger( value - 1 );
        }
        // If it underflows SmallInteger, create a BigInteger (negative MAX_INT_ARR).
        return new BigInteger( MAX_INT_ARR, true );
    };

    // Pre-calculate powers of two up to BASE for efficient shifting.
    var powersOfTwo = [ 1 ];
    while ( 2 * powersOfTwo[ powersOfTwo.length - 1 ] <= BASE ) {
        powersOfTwo.push( 2 * powersOfTwo[ powersOfTwo.length - 1 ] );
    }
    var powers2Length  = powersOfTwo.length,
        highestPower2  = powersOfTwo[ powers2Length - 1 ];

    /**
     * Helper to check if a shift amount is small enough for optimization.
     * @param {number|string|BigInteger} n - The shift amount.
     * @returns {boolean} - True if small enough.
     */
    function shift_isSmall ( n ) {
        return ( typeof n === "number" || typeof n === "string" ) && +Math.abs( n ) <= BASE || n instanceof BigInteger && n.value.length <= 1;
    }

    // BigInteger.prototype.shiftLeft method (bitwise left shift).
    BigInteger.prototype.shiftLeft = function ( n ) {
        if ( !shift_isSmall( n ) ) {
            throw new Error( String( n ) + " is too large for shifting." );
        }
        n = +n; // Ensure n is a number.

        if ( n < 0 ) {
            return this.shiftRight( -n ); // Negative shift left is shift right.
        }

        var result = this;
        if ( result.isZero() ) {
            return result;
        }

        // Perform shifts by multiplying by powers of 2.
        while ( n >= powers2Length ) {
            result = result.multiply( highestPower2 );
            n -= powers2Length - 1; // Adjust n for the powersOfTwo array index.
        }
        return result.multiply( powersOfTwo[ n ] );
    };

    // SmallInteger.prototype.shiftLeft method shares implementation.
    SmallInteger.prototype.shiftLeft = BigInteger.prototype.shiftLeft;

    // BigInteger.prototype.shiftRight method (bitwise right shift).
    BigInteger.prototype.shiftRight = function ( n ) {
        var remQuo;

        if ( !shift_isSmall( n ) ) {
            throw new Error( String( n ) + " is too large for shifting." );
        }
        n = +n; // Ensure n is a number.

        if ( n < 0 ) {
            return this.shiftLeft( -n ); // Negative shift right is shift left.
        }

        var result = this;

        // Handle zero or negative unit cases.
        if ( result.isZero() || ( result.isNegative() && result.isUnit() ) ) {
            return result;
        }

        // Perform shifts by dividing by powers of 2.
        while ( n >= powers2Length ) {
            if ( result.isZero() || ( result.isNegative() && result.isUnit() ) ) {
                return result; // Optimization for already zero or -1.
            }
            remQuo = divModAny( result, highestPower2 );
            // Adjust quotient for negative numbers (floor division).
            result = remQuo[ 1 ].isNegative() ? remQuo[ 0 ].prev() : remQuo[ 0 ];
            n -= powers2Length - 1; // Adjust n for powersOfTwo array index.
        }

        remQuo = divModAny( result, powersOfTwo[ n ] );
        // Adjust quotient for negative numbers.
        return remQuo[ 1 ].isNegative() ? remQuo[ 0 ].prev() : remQuo[ 0 ];
    };

    // SmallInteger.prototype.shiftRight method shares implementation.
    SmallInteger.prototype.shiftRight = BigInteger.prototype.shiftRight;

    /**
     * Generic bitwise operation function.
     * Performs a bitwise operation (AND, OR, XOR) on two Integer objects.
     * @param {BigInteger|SmallInteger} x - First operand.
     * @param {BigInteger|SmallInteger|number|string} y - Second operand.
     * @param {function(number, number): number} fn - The bitwise function (e.g., `(a,b) => a & b`).
     * @returns {BigInteger|SmallInteger} - Resulting Integer object.
     */
    function bitwise ( x, y, fn ) {
        y = parseValue( y ); // Ensure y is an Integer object.

        var xSign = x.isNegative(),
            ySign = y.isNegative();

        // Handle two's complement for negative numbers (bitwise NOT).
        var xRem = xSign ? x.not() : x,
            yRem = ySign ? y.not() : y;

        var xDigit = 0,
            yDigit = 0;

        var xDivMod = null,
            yDivMod = null;

        var result = [];

        // Process digits from least significant to most significant.
        while ( !xRem.isZero() || !yRem.isZero() ) {
            xDivMod  = divModAny( xRem, highestPower2 );
            xDigit   = xDivMod[ 1 ].toJSNumber();
            if ( xSign ) {
                xDigit = highestPower2 - 1 - xDigit; // Apply two's complement for negative.
            }

            yDivMod  = divModAny( yRem, highestPower2 );
            yDigit   = yDivMod[ 1 ].toJSNumber();
            if ( ySign ) {
                yDigit = highestPower2 - 1 - yDigit; // Apply two's complement for negative.
            }

            xRem = xDivMod[ 0 ];
            yRem = yDivMod[ 0 ];

            result.push( fn( xDigit, yDigit ) ); // Apply the bitwise function.
        }

        // Determine the sign of the final result and construct it.
        var sum = fn( xSign ? 1 : 0, ySign ? 1 : 0 ) !== 0 ? bigInt( -1 ) : bigInt( 0 );

        for ( var i = result.length - 1; i >= 0; i -= 1 ) {
            sum = sum.multiply( highestPower2 ).add( bigInt( result[ i ] ) );
        }

        return sum;
    }

    // BigInteger.prototype.not method (bitwise NOT).
    BigInteger.prototype.not = function () {
        return this.negate().prev(); // Equivalent to -(this + 1).
    };

    // SmallInteger.prototype.not method shares implementation.
    SmallInteger.prototype.not = BigInteger.prototype.not;

    // BigInteger.prototype.and method (bitwise AND).
    BigInteger.prototype.and = function ( n ) {
        return bitwise( this, n, function ( a, b ) {
            return a & b;
        } );
    };

    // SmallInteger.prototype.and method shares implementation.
    SmallInteger.prototype.and = BigInteger.prototype.and;

    // BigInteger.prototype.or method (bitwise OR).
    BigInteger.prototype.or = function ( n ) {
        return bitwise( this, n, function ( a, b ) {
            return a | b;
        } );
    };

    // SmallInteger.prototype.or method shares implementation.
    SmallInteger.prototype.or = BigInteger.prototype.or;

    // BigInteger.prototype.xor method (bitwise XOR).
    BigInteger.prototype.xor = function ( n ) {
        return bitwise( this, n, function ( a, b ) {
            return a ^ b;
        } );
    };

    // SmallInteger.prototype.xor method shares implementation.
    SmallInteger.prototype.xor = BigInteger.prototype.xor;


    // Constants for roughLOB (Least One Bit) calculation.
    var LOBMASK_I  = 1 << 30, // Mask for JavaScript integer.
        LOBMASK_BI = ( BASE & -BASE ) * ( BASE & -BASE ) | LOBMASK_I; // Mask for BigInteger digit.

    /**
     * Calculates a "rough" Least One Bit (LOB) for an Integer object.
     * This is an approximation for performance, not a precise bitwise LOB.
     * @param {BigInteger|SmallInteger} n - The Integer.
     * @returns {number} - A rough LOB value.
     */
    function roughLOB ( n ) {
        var v = n.value,
            x = typeof v === "number" ? v | LOBMASK_I : v[ 0 ] + v[ 1 ] * BASE | LOBMASK_BI;
        return x & -x;
    }

    /**
     * Calculates the integer logarithm of a value with a given base.
     * Used in bitLength calculation.
     * @param {BigInteger} value - The number to take logarithm of.
     * @param {BigInteger} base - The base of the logarithm.
     * @returns {{p: BigInteger, e: number}} - {partial_power, exponent}.
     */
    function integerLogarithm ( value, base ) {
        if ( base.compareTo( value ) <= 0 ) {
            var tmp = integerLogarithm( value, base.square() );
            var p   = tmp.p;
            var e   = tmp.e;
            var t   = p.multiply( base );
            return t.compareTo( value ) <= 0 ? { p: t, e: e * 2 + 1 } : { p: p, e: e * 2 };
        }
        return { p: bigInt( 1 ), e: 0 };
    }

    // BigInteger.prototype.bitLength method.
    BigInteger.prototype.bitLength = function () {
        var n = this;
        if ( n.compareTo( bigInt( 0 ) ) < 0 ) {
            // For negative numbers, bit length is for -(n+1) (two's complement interpretation).
            n = n.negate().subtract( bigInt( 1 ) );
        }
        if ( n.compareTo( bigInt( 0 ) ) === 0 ) {
            return bigInt( 0 );
        }
        // Calculate log base 2 and add 1.
        return bigInt( integerLogarithm( n, bigInt( 2 ) ).e ).add( bigInt( 1 ) );
    };

    // SmallInteger.prototype.bitLength method shares implementation.
    SmallInteger.prototype.bitLength = BigInteger.prototype.bitLength;

    // --- Static Methods (exported via Integer object) ---

    // Returns the maximum of two Integer objects.
    function max ( a, b ) {
        a = parseValue( a );
        b = parseValue( b );
        return a.greater( b ) ? a : b;
    }

    // Returns the minimum of two Integer objects.
    function min ( a, b ) {
        a = parseValue( a );
        b = parseValue( b );
        return a.lesser( b ) ? a : b;
    }

    // Calculates the Greatest Common Divisor (GCD) of two Integer objects.
    // Uses binary GCD algorithm (Stein's algorithm) for efficiency.
    function gcd ( a, b ) {
        a = parseValue( a ).abs();
        b = parseValue( b ).abs();

        if ( a.equals( b ) ) {
            return a;
        }
        if ( a.isZero() ) {
            return b;
        }
        if ( b.isZero() ) {
            return a;
        }

        var c = Integer[ 1 ], // Factor of 2s removed.
            d,
            t;

        // Remove common factors of 2.
        while ( a.isEven() && b.isEven() ) {
            d = Math.min( roughLOB( a ), roughLOB( b ) ); // Rough estimate for highest power of 2.
            a = a.divide( d );
            b = b.divide( d );
            c = c.multiply( d );
        }

        // Remove factors of 2 from 'a'.
        while ( a.isEven() ) {
            a = a.divide( roughLOB( a ) );
        }

        // Main loop of binary GCD.
        do {
            // Remove factors of 2 from 'b'.
            while ( b.isEven() ) {
                b = b.divide( roughLOB( b ) );
            }

            // Ensure a <= b.
            if ( a.greater( b ) ) {
                t = b;
                b = a;
                a = t;
            }

            b = b.subtract( a ); // b = b - a.
        } while ( !b.isZero() );

        // Restore common factors of 2.
        return c.isUnit() ? a : a.multiply( c );
    }

    // Calculates the Least Common Multiple (LCM) of two Integer objects.
    // LCM(a,b) = |a*b| / GCD(a,b).
    function lcm ( a, b ) {
        a = parseValue( a ).abs();
        b = parseValue( b ).abs();
        return a.divide( gcd( a, b ) ).multiply( b );
    }

    // Generates a random BigInteger between 'a' and 'b' (inclusive).
    function randBetween ( a, b ) {
        a = parseValue( a );
        b = parseValue( b );

        var low  = min( a, b ),
            high = max( a, b );

        var range = high.subtract( low ).add( 1 );

        // If the range is small enough, use native Math.random().
        if ( range.isSmall ) {
            return low.add( Math.floor( Math.random() * range ) );
        }

        // For large ranges, generate digits randomly.
        var length   = range.value.length - 1;
        var result   = [],
            restricted = true; // Flag to ensure result is within range.

        for ( var i = length; i >= 0; i-- ) {
            // Upper bound for current digit depends on whether previous digits were restricted.
            var top   = restricted ? range.value[ i ] : BASE;
            var digit = truncate( Math.random() * top );
            result.unshift( digit );
            if ( digit < top ) {
                restricted = false; // Once a digit is less than its upper bound, no longer restricted.
            }
        }

        result = arrayToSmall( result ); // Try to convert to SmallInteger.

        // Add the random offset to the lower bound.
        return low.add( typeof result === "number" ? new SmallInteger( result ) : new BigInteger( result, false ) );
    }

    // Parses a string representation of a number in a given base.
    var parseBase = function ( text, base ) {
        var length  = text.length;
        var i;
        var absBase = Math.abs( base );

        // Validate digits for the given base.
        for ( var i = 0; i < length; i++ ) {
            var c = text[ i ].toLowerCase();
            if ( c === "-" ) {
                continue;
            }
            if ( /[a-z0-9]/.test( c ) ) {
                if ( /[0-9]/.test( c ) && +c >= absBase ) {
                    if ( c === "1" && absBase === 1 ) {
                        continue;
                    }
                    throw new Error( c + " is not a valid digit in base " + base + "." );
                } else if ( c.charCodeAt( 0 ) - 87 >= absBase ) { // 'a' is 97, 'a'-87 = 10
                    throw new Error( c + " is not a valid digit in base " + base + "." );
                }
            }
        }

        // Optimized path for base 2-36 if it fits in a native JS number.
        if ( 2 <= base && base <= 36 ) {
            if ( length <= LOG_MAX_INT / Math.log( base ) ) {
                var result = parseInt( text, base );
                if ( isNaN( result ) ) {
                    throw new Error( c + " is not a valid digit in base " + base + "." ); // Error 'c' is undefined here, should be `text`. Original bug?
                }
                return new SmallInteger( parseInt( text, base ) );
            }
        }

        base = parseValue( base ); // Ensure base is an Integer object.
        var digits     = [];
        var isNegative = text[ 0 ] === "-";

        // Parse digits, handling custom digit representations like "<10>".
        for ( i = isNegative ? 1 : 0; i < text.length; i++ ) {
            var c        = text[ i ].toLowerCase(),
                charCode = c.charCodeAt( 0 );
            if ( 48 <= charCode && charCode <= 57 ) { // '0'-'9'
                digits.push( parseValue( c ) );
            } else if ( 97 <= charCode && charCode <= 122 ) { // 'a'-'z'
                digits.push( parseValue( c.charCodeAt( 0 ) - 87 ) );
            } else if ( c === "<" ) {
                var start = i;
                do {
                    i++;
                } while ( text[ i ] !== ">" );
                digits.push( parseValue( text.slice( start + 1, i ) ) );
            } else {
                throw new Error( c + " is not a valid character" );
            }
        }

        return parseBaseFromArray( digits, base, isNegative );
    };

    /**
     * Converts an array of digits (in a specified base) to an Integer object.
     * @param {BigInteger[]|SmallInteger[]} digits - Array of digit values (as Integer objects).
     * @param {BigInteger} base - The base of the number.
     * @param {boolean} isNegative - True if the final number should be negative.
     * @returns {BigInteger|SmallInteger} - The resulting Integer object.
     */
    function parseBaseFromArray ( digits, base, isNegative ) {
        var val = Integer[ 0 ], // Accumulator.
            pow = Integer[ 1 ], // Current power of base.
            i;

        // Sum digits multiplied by increasing powers of base.
        for ( i = digits.length - 1; i >= 0; i-- ) {
            val = val.add( digits[ i ].times( pow ) );
            pow = pow.times( base );
        }

        return isNegative ? val.negate() : val;
    }

    /**
     * Converts a single digit (number) to its string representation.
     * Used for `toBaseString`.
     * @param {number} digit - The digit value.
     * @returns {string} - String representation of the digit.
     */
    function stringify ( digit ) {
        if ( digit <= 35 ) {
            return "0123456789abcdefghijklmnopqrstuvwxyz".charAt( digit );
        }
        return "<" + digit + ">"; // Custom format for digits > 35.
    }

    /**
     * Converts an Integer object to an array of digits in a specified base.
     * @param {BigInteger|SmallInteger} n - The number to convert.
     * @param {BigInteger|SmallInteger|number|string} base - The target base.
     * @returns {{value: number[], isNegative: boolean}} - Object containing digit array and sign.
     */
    function toBase ( n, base ) {
        base = bigInt( base ); // Ensure base is an Integer object.

        // Handle edge cases for base.
        if ( base.isZero() ) {
            if ( n.isZero() ) {
                return { value: [ 0 ], isNegative: false };
            }
            throw new Error( "Cannot convert nonzero numbers to base 0." );
        }

        // Special handling for base -1.
        if ( base.equals( -1 ) ) {
            if ( n.isZero() ) {
                return { value: [ 0 ], isNegative: false };
            }
            if ( n.isNegative() ) {
                // Example: -5 in base -1 is [1,0,1,0,1]
                return { value: [].concat.apply( [], Array.apply( null, Array( -n ) ).map( Array.prototype.valueOf, [ 1, 0 ] ) ), isNegative: false };
            }
            // Example: 5 in base -1 is [1,0,1,0,0] -> [1] then [0,1] for 4 times
            var arr = Array.apply( null, Array( +n - 1 ) ).map( Array.prototype.valueOf, [ 0, 1 ] );
            arr.unshift( [ 1 ] );
            return { value: [].concat.apply( [], arr ), isNegative: false };
        }

        var neg = false;
        // Handle negative numbers for positive bases.
        if ( n.isNegative() && base.isPositive() ) {
            neg = true;
            n   = n.abs();
        }

        // Special handling for base 1.
        if ( base.equals( 1 ) ) {
            if ( n.isZero() ) {
                return { value: [ 0 ], isNegative: false };
            }
            return { value: Array.apply( null, Array( +n ) ).map( Number.prototype.valueOf, 1 ), isNegative: neg };
        }

        var out = [];
        var left = n,
            divmod;

        // Repeatedly divide by base and collect remainders.
        while ( left.isNegative() || left.compareAbs( base ) >= 0 ) {
            divmod = left.divmod( base );
            left   = divmod.quotient;
            var digit = divmod.remainder;

            // Handle negative remainders by adjusting quotient and remainder.
            if ( digit.isNegative() ) {
                digit = base.minus( digit ).abs(); // digit = base - abs(digit)
                left  = left.next(); // quotient = quotient + 1
            }
            out.push( digit.toJSNumber() );
        }
        out.push( left.toJSNumber() ); // Add the final quotient.

        return { value: out.reverse(), isNegative: neg }; // Reverse digits for correct order.
    }

    /**
     * Converts an Integer object to its string representation in a given base.
     * @param {BigInteger|SmallInteger} n - The number to convert.
     * @param {BigInteger|SmallInteger|number|string} base - The target base.
     * @returns {string} - String representation of the number.
     */
    function toBaseString ( n, base ) {
        var arr = toBase( n, base );
        // Prepend negative sign if necessary, then join stringified digits.
        return ( arr.isNegative ? "-" : "" ) + arr.value.map( stringify ).join( "" );
    }

    // BigInteger.prototype.toArray method.
    BigInteger.prototype.toArray = function ( radix ) {
        return toBase( this, radix );
    };

    // SmallInteger.prototype.toArray method shares implementation.
    SmallInteger.prototype.toArray = function ( radix ) {
        return toBase( this, radix );
    };

    // BigInteger.prototype.toString method.
    BigInteger.prototype.toString = function ( radix ) {
        if ( radix === undefined ) {
            radix = 10;
        }
        if ( radix !== 10 ) {
            return toBaseString( this, radix );
        }

        var v   = this.value,
            l   = v.length,
            str = String( v[ --l ] ), // Start with the most significant digit.
            zeros = "0000000",
            digit;

        // Append remaining digits, padding with zeros if necessary.
        while ( --l >= 0 ) {
            digit = String( v[ l ] );
            str   += zeros.slice( digit.length ) + digit;
        }

        var sign = this.sign ? "-" : "";
        return sign + str;
    };

    // SmallInteger.prototype.toString method.
    SmallInteger.prototype.toString = function ( radix ) {
        if ( radix === undefined ) {
            radix = 10;
        }
        if ( radix != 10 ) {
            return toBaseString( this, radix );
        }
        return String( this.value );
    };

    // BigInteger.prototype.toJSON and SmallInteger.prototype.toJSON (for JSON.stringify).
    BigInteger.prototype.toJSON = SmallInteger.prototype.toJSON = function () {
        return this.toString();
    };

    // BigInteger.prototype.valueOf and BigInteger.prototype.toJSNumber.
    // Returns a native JavaScript number, potentially losing precision for large numbers.
    BigInteger.prototype.valueOf = function () {
        return parseInt( this.toString(), 10 );
    };
    BigInteger.prototype.toJSNumber = BigInteger.prototype.valueOf;

    // SmallInteger.prototype.valueOf and SmallInteger.prototype.toJSNumber.
    SmallInteger.prototype.valueOf = function () {
        return this.value;
    };
    SmallInteger.prototype.toJSNumber = SmallInteger.prototype.valueOf;

    /**
     * Parses a string value into an Integer object.
     * Handles scientific notation, decimal points, and validation.
     * @param {string} v - The string to parse.
     * @returns {BigInteger|SmallInteger} - The resulting Integer object.
     */
    function parseStringValue ( v ) {
        // Try to parse as a precise small integer first.
        if ( isPrecise( +v ) ) {
            var x = +v;
            if ( x === truncate( x ) ) {
                return new SmallInteger( x );
            }
            throw new Error( "Invalid integer: " + v ); // Not an integer.
        }

        var sign = v[ 0 ] === "-";
        if ( sign ) {
            v = v.slice( 1 ); // Remove sign for parsing digits.
        }

        // Handle scientific notation (e.g., "1.23e+5").
        var split = v.split( /e/i );
        if ( split.length > 2 ) {
            throw new Error( "Invalid integer: " + split.join( "e" ) );
        }
        if ( split.length === 2 ) {
            var exp = split[ 1 ];
            if ( exp[ 0 ] === "+" ) {
                exp = exp.slice( 1 );
            }
            exp = +exp; // Convert exponent to number.

            // Validate exponent.
            if ( exp !== truncate( exp ) || !isPrecise( exp ) ) {
                throw new Error( "Invalid integer: " + exp + " is not a valid exponent." );
            }

            var text = split[ 0 ];
            var decimalPlace = text.indexOf( "." );
            if ( decimalPlace >= 0 ) {
                exp  -= text.length - decimalPlace - 1; // Adjust exponent for decimal places.
                text = text.slice( 0, decimalPlace ) + text.slice( decimalPlace + 1 ); // Remove decimal point.
            }

            if ( exp < 0 ) {
                throw new Error( "Cannot include negative exponent part for integers" );
            }

            text += new Array( exp + 1 ).join( "0" ); // Append zeros for positive exponent.
            v     = text;
        }

        // Final validation for integer format.
        var isValid = /^([0-9][0-9]*)$/.test( v );
        if ( !isValid ) {
            throw new Error( "Invalid integer: " + v );
        }

        var r   = [],
            max = v.length,
            l   = LOG_BASE,
            min = max - l;

        // Split string into digits in BASE.
        while ( max > 0 ) {
            r.push( +v.slice( min, max ) ); // Convert substring to number.
            min -= l;
            if ( min < 0 ) {
                min = 0;
            }
            max -= l;
        }

        trim( r ); // Remove leading zeros from digit array.
        return new BigInteger( r, sign );
    }

    /**
     * Parses a number value into an Integer object.
     * @param {number} v - The number to parse.
     * @returns {BigInteger|SmallInteger} - The resulting Integer object.
     */
    function parseNumberValue ( v ) {
        if ( isPrecise( v ) ) {
            if ( v !== truncate( v ) ) {
                throw new Error( v + " is not an integer." );
            }
            return new SmallInteger( v );
        }
        // If not precise, convert to string and use string parser.
        return parseStringValue( v.toString() );
    }

    /**
     * Universal parser for various input types into an Integer object.
     * @param {BigInteger|SmallInteger|number|string} v - The value to parse.
     * @returns {BigInteger|SmallInteger} - The resulting Integer object.
     */
    function parseValue ( v ) {
        if ( typeof v === "number" ) {
            return parseNumberValue( v );
        }
        if ( typeof v === "string" ) {
            return parseStringValue( v );
        }
        // If it's already an Integer object, return it.
        return v;
    }

    // Pre-cache SmallInteger instances for common small numbers (0-999 and their negatives).
    // This improves performance by avoiding repeated object creation.
    for ( var i = 0; i < 1e3; i++ ) {
        Integer[ i ] = new SmallInteger( i );
        if ( i > 0 ) {
            Integer[ -i ] = new SmallInteger( -i );
        }
    }

    // Expose commonly used constants and methods on the Integer object.
    Integer.one       = Integer[ 1 ];
    Integer.zero      = Integer[ 0 ];
    Integer.minusOne  = Integer[ -1 ];

    Integer.max       = max;
    Integer.min       = min;
    Integer.gcd       = gcd;
    Integer.lcm       = lcm;

    // Type checking utility.
    Integer.isInstance = function ( x ) {
        return x instanceof BigInteger || x instanceof SmallInteger;
    };

    Integer.randBetween = randBetween;

    // Factory method to create an Integer from an array of digits in a given base.
    Integer.fromArray = function ( digits, base, isNegative ) {
        // Ensure digits are parsed into Integer objects before passing to parseBaseFromArray.
        return parseBaseFromArray( digits.map( parseValue ), parseValue( base || 10 ), isNegative );
    };

    return Integer; // The bigInt function returns the Integer factory/namespace.

} )(); // Immediately invoke the function.

/*
 *  The main function for the application.
 *  It reads an input number, then searches for the first prime number
 *  starting from that input, up to a very large range.
 */
function main ( arg ) {

    // Extract the first line of input and convert it to a number.
    var n = Number( arg.split( "\n" )[ 0 ] );

    // Loop through numbers starting from 'n'.
    // The upper bound is 'n' + 10^14, which is a very large search range.
    for ( var i = n; i < n + 100000000000000; i++ ) {
        // Convert the current number 'i' to a bigInt object and check if it's prime.
        if ( bigInt( i ).isPrime() ) {
            // If a prime is found, print it to the console.
            console.log( i );
            break; // Exit the loop after finding the first prime.
        }
    }

}


// Execute the main function with input from standard input.
// Reads the entire content of '/dev/stdin' as a UTF-8 string.
main( require( 'fs' ).readFileSync( '/dev/stdin', 'utf8' ) );