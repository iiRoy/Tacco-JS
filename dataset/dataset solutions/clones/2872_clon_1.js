var bigInt = function ( undefined ) {
    "use strict";

    // Base for internal array representation of big integers
    var BASE = 1e7;

    // Logarithm of the base, used for string conversions
    var LOG_BASE = 7;

    // Maximum safe integer in JavaScript
    var MAX_INT = 9007199254740992;

    // MAX_INT converted to the internal array format
    var MAX_INT_ARR = smallToArray( MAX_INT );

    // Logarithm of MAX_INT, useful for base conversions
    var LOG_MAX_INT = Math.log( MAX_INT );


    // Main Integer constructor function
    function Integer( v, radix ) {
        if ( typeof v === "undefined" ) {
            return Integer[0]; // Return zero if no value is provided
        }

        // Handle radix conversion if specified
        if ( typeof radix !== "undefined" ) {
            // If radix is 10, simply parse the value
            return +radix === 10 ? parseValue( v ) : parseBase( v, radix );
        }

        // Default parsing for numbers and strings
        return parseValue( v );
    }


    // Constructor for BigInteger objects (large numbers)
    function BigInteger( value, sign ) {
        this.value = value; // Array of digits
        this.sign = sign;   // Boolean: true for negative, false for positive
        this.isSmall = false; // Flag to indicate it's a BigInteger
    }

    // BigInteger prototypes inherit from Integer
    BigInteger.prototype = Object.create( Integer.prototype );


    // Constructor for SmallInteger objects (numbers within JS safe integer limits)
    function SmallInteger( value ) {
        this.value = value; // The raw JavaScript number
        this.sign = value < 0; // Boolean: true for negative
        this.isSmall = true; // Flag to indicate it's a SmallInteger
    }

    // SmallInteger prototypes inherit from Integer
    SmallInteger.prototype = Object.create( Integer.prototype );


    // Checks if a number can be precisely represented as a JavaScript number
    function isPrecise( n ) {
        return -MAX_INT < n && n < MAX_INT;
    }


    // Converts a JavaScript number to the internal array format
    function smallToArray( n ) {
        // Handle small numbers directly
        if ( n < 1e7 ) {
            return [n];
        }

        // Handle numbers up to 1e14
        if ( n < 1e14 ) {
            return [ n % 1e7, Math.floor( n / 1e7 ) ];
        }

        // Handle numbers up to MAX_INT
        return [ n % 1e7, Math.floor( n / 1e7 ) % 1e7, Math.floor( n / 1e14 ) ];
    }


    // Converts an internal array back to a JavaScript number if possible
    function arrayToSmall( arr ) {
        trim( arr ); // Remove leading zeros
        var length = arr.length;

        // Check if the number fits within MAX_INT and has few digits
        if ( length < 4 && compareAbs( arr, MAX_INT_ARR ) < 0 ) {
            switch ( length ) {
                case 0:
                    return 0; // Empty array means zero
                case 1:
                    return arr[0]; // Single digit
                case 2:
                    return arr[0] + arr[1] * BASE; // Two digits
                default:
                    return arr[0] + ( arr[1] + arr[2] * BASE ) * BASE; // Three digits
            }
        }
        return arr; // Return the array if it's still large
    }


    // Removes leading zeros from an internal array representation
    function trim( v ) {
        var i = v.length;
        while ( v[--i] === 0 ); // Find the last non-zero digit
        v.length = i + 1; // Truncate the array
    }


    // Creates an array filled with zeros
    function createArray( length ) {
        var x = new Array( length );
        var i = -1;
        while ( ++i < length ) {
            x[i] = 0;
        }
        return x;
    }


    // Truncates a number (removes fractional part)
    function truncate( n ) {
        if ( n > 0 ) {
            return Math.floor( n );
        }
        return Math.ceil( n );
    }


    // Adds two arrays representing big integers (positive only)
    function add( a, b ) {
        var l_a = a.length,
            l_b = b.length,
            r = new Array( l_a ), // Result array, sized for the larger input
            carry = 0,
            base = BASE,
            sum,
            i;

        // Add digits pairwise
        for ( i = 0; i < l_b; i++ ) {
            sum = a[i] + b[i] + carry;
            carry = sum >= base ? 1 : 0;
            r[i] = sum - carry * base;
        }

        // Add remaining digits from the longer array
        while ( i < l_a ) {
            sum = a[i] + carry;
            carry = sum === base ? 1 : 0;
            r[i++] = sum - carry * base;
        }

        // Handle final carry
        if ( carry > 0 ) {
            r.push( carry );
        }
        return r;
    }


    // Helper for addition, ensuring the longer array is 'a'
    function addAny( a, b ) {
        if ( a.length >= b.length ) {
            return add( a, b );
        }
        return add( b, a );
    }


    // Adds a small number (carry) to a big integer array
    function addSmall( a, carry ) {
        var l = a.length,
            r = new Array( l ),
            base = BASE,
            sum,
            i;

        // Iterate through digits, adding carry
        for ( i = 0; i < l; i++ ) {
            sum = a[i] - base + carry; // Subtract base to simplify carry calculation
            carry = Math.floor( sum / base );
            r[i] = sum - carry * base;
            carry += 1; // Adjust carry back
        }

        // Handle any remaining carry
        while ( carry > 0 ) {
            r[i++] = carry % base;
            carry = Math.floor( carry / base );
        }
        return r;
    }


    // BigInteger addition method
    BigInteger.prototype.add = function ( v ) {
        var n = parseValue( v );

        // If signs are different, it's a subtraction
        if ( this.sign !== n.sign ) {
            return this.subtract( n.negate() );
        }

        var a = this.value,
            b = n.value;

        // If the other number is small, use optimized addSmall
        if ( n.isSmall ) {
            return new BigInteger( addSmall( a, Math.abs( b ) ), this.sign );
        }

        // Otherwise, use general addAny
        return new BigInteger( addAny( a, b ), this.sign );
    };

    // Alias for add
    BigInteger.prototype.plus = BigInteger.prototype.add;


    // SmallInteger addition method
    SmallInteger.prototype.add = function ( v ) {
        var n = parseValue( v );
        var a = this.value;

        // If signs are effectively different (a<0 and n.sign is true, or a>=0 and n.sign is false)
        if ( a < 0 !== n.sign ) {
            return this.subtract( n.negate() );
        }

        var b = n.value;

        // If both are small, perform direct addition
        if ( n.isSmall ) {
            if ( isPrecise( a + b ) ) {
                return new SmallInteger( a + b );
            }
            b = smallToArray( Math.abs( b ) ); // Convert small 'b' to array for addSmall
        }

        // Use addSmall with absolute value of 'a' and 'b' array, then determine sign
        return new BigInteger( addSmall( b, Math.abs( a ) ), a < 0 );
    };

    // Alias for add
    SmallInteger.prototype.plus = SmallInteger.prototype.add;


    // Subtracts array 'b' from array 'a' (assuming a >= b, positive numbers)
    function subtract( a, b ) {
        var a_l = a.length,
            b_l = b.length,
            r = new Array( a_l ), // Result array
            borrow = 0,
            base = BASE,
            i,
            difference;

        // Subtract digits pairwise
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

        // Propagate borrow through remaining digits of 'a'
        for ( i = b_l; i < a_l; i++ ) {
            difference = a[i] - borrow;
            if ( difference < 0 ) {
                difference += base;
            } else {
                r[i++] = difference; // If no borrow, just copy remaining digits
                break;
            }
            r[i] = difference;
        }

        // Copy any remaining digits of 'a'
        for ( ; i < a_l; i++ ) {
            r[i] = a[i];
        }

        trim( r ); // Remove leading zeros
        return r;
    }


    // Handles subtraction for any two big integer arrays, determining the sign
    function subtractAny( a, b, sign ) {
        var value;

        // Ensure 'a' is the larger absolute value for subtraction
        if ( compareAbs( a, b ) >= 0 ) {
            value = subtract( a, b );
        } else {
            value = subtract( b, a );
            sign = !sign; // Flip sign if 'b' was larger
        }

        value = arrayToSmall( value ); // Convert result to SmallInteger if possible

        if ( typeof value === "number" ) {
            if ( sign ) {
                value = -value;
            }
            return new SmallInteger( value );
        }

        return new BigInteger( value, sign );
    }


    // Subtracts a small number 'b' from a big integer array 'a'
    function subtractSmall( a, b, sign ) {
        var l = a.length,
            r = new Array( l ),
            carry = -b, // Initialize carry with negative 'b'
            base = BASE,
            i,
            difference;

        // Iterate through digits, applying carry/borrow
        for ( i = 0; i < l; i++ ) {
            difference = a[i] + carry;
            carry = Math.floor( difference / base ); // Calculate new carry
            difference %= base;
            r[i] = difference < 0 ? difference + base : difference; // Ensure positive digit
        }

        r = arrayToSmall( r ); // Convert result to SmallInteger if possible

        if ( typeof r === "number" ) {
            if ( sign ) {
                r = -r;
            }
            return new SmallInteger( r );
        }
        return new BigInteger( r, sign );
    }


    // BigInteger subtraction method
    BigInteger.prototype.subtract = function ( v ) {
        var n = parseValue( v );

        // If signs are different, it's an addition
        if ( this.sign !== n.sign ) {
            return this.add( n.negate() );
        }

        var a = this.value,
            b = n.value;

        // If the other number is small, use optimized subtractSmall
        if ( n.isSmall ) {
            return subtractSmall( a, Math.abs( b ), this.sign );
        }

        // Otherwise, use general subtractAny
        return subtractAny( a, b, this.sign );
    };

    // Alias for subtract
    BigInteger.prototype.minus = BigInteger.prototype.subtract;


    // SmallInteger subtraction method
    SmallInteger.prototype.subtract = function ( v ) {
        var n = parseValue( v );
        var a = this.value;

        // If signs are effectively different
        if ( a < 0 !== n.sign ) {
            return this.add( n.negate() );
        }

        var b = n.value;

        // If both are small, perform direct subtraction
        if ( n.isSmall ) {
            return new SmallInteger( a - b );
        }

        // Otherwise, use subtractSmall with absolute value of 'a' and 'b' array, determining sign
        return subtractSmall( b, Math.abs( a ), a >= 0 );
    };

    // Alias for subtract
    SmallInteger.prototype.minus = SmallInteger.prototype.subtract;


    // Negates a BigInteger
    BigInteger.prototype.negate = function () {
        return new BigInteger( this.value, !this.sign );
    };


    // Negates a SmallInteger
    SmallInteger.prototype.negate = function () {
        var sign = this.sign;
        var small = new SmallInteger( -this.value ); // Negate the value
        small.sign = !sign; // Flip the sign flag
        return small;
    };


    // Returns the absolute value of a BigInteger
    BigInteger.prototype.abs = function () {
        return new BigInteger( this.value, false );
    };


    // Returns the absolute value of a SmallInteger
    SmallInteger.prototype.abs = function () {
        return new SmallInteger( Math.abs( this.value ) );
    };


    // Multiplies two big integer arrays (long multiplication)
    function multiplyLong( a, b ) {
        var a_l = a.length,
            b_l = b.length,
            l = a_l + b_l, // Max length of result
            r = createArray( l ), // Result array, initialized with zeros
            base = BASE,
            product,
            carry,
            i,
            a_i,
            b_j;

        // Standard long multiplication algorithm
        for ( i = 0; i < a_l; ++i ) {
            a_i = a[i];
            for ( var j = 0; j < b_l; ++j ) {
                b_j = b[j];
                product = a_i * b_j + r[i + j]; // Add previous carry/product
                carry = Math.floor( product / base );
                r[i + j] = product - carry * base;
                r[i + j + 1] += carry; // Propagate carry to the next position
            }
        }

        trim( r ); // Remove leading zeros
        return r;
    }


    // Multiplies a big integer array by a small number
    function multiplySmall( a, b ) {
        var l = a.length,
            r = new Array( l ),
            base = BASE,
            carry = 0,
            product,
            i;

        // Multiply each digit by 'b' and handle carry
        for ( i = 0; i < l; i++ ) {
            product = a[i] * b + carry;
            carry = Math.floor( product / base );
            r[i] = product - carry * base;
        }

        // Handle any remaining carry
        while ( carry > 0 ) {
            r[i++] = carry % base;
            carry = Math.floor( carry / base );
        }
        return r;
    }


    // Shifts an array (big integer) left by 'n' positions (multiplies by BASE^n)
    function shiftLeft( x, n ) {
        var r = [];
        while ( n-- > 0 ) {
            r.push( 0 ); // Prepend zeros
        }
        return r.concat( x ); // Concatenate with original array
    }


    // Karatsuba multiplication algorithm (recursive)
    function multiplyKaratsuba( x, y ) {
        var n = Math.max( x.length, y.length );

        // Base case for recursion: use long multiplication for small arrays
        if ( n <= 30 ) {
            return multiplyLong( x, y );
        }

        n = Math.ceil( n / 2 ); // Split point

        // Divide numbers into two halves
        var b = x.slice( n ),
            a = x.slice( 0, n ),
            d = y.slice( n ),
            c = y.slice( 0, n );

        // Recursively compute sub-products
        var ac = multiplyKaratsuba( a, c ),
            bd = multiplyKaratsuba( b, d ),
            abcd = multiplyKaratsuba( addAny( a, b ), addAny( c, d ) );

        // Combine sub-products using Karatsuba formula
        var product = addAny(
            addAny( ac, shiftLeft( subtract( subtract( abcd, ac ), bd ), n ) ),
            shiftLeft( bd, 2 * n )
        );

        trim( product ); // Remove leading zeros
        return product;
    }


    // Heuristic to decide whether to use Karatsuba multiplication
    function useKaratsuba( l1, l2 ) {
        // This is an empirical formula
        return -.012 * l1 - .012 * l2 + 15e-6 * l1 * l2 > 0;
    }


    // BigInteger multiplication method
    BigInteger.prototype.multiply = function ( v ) {
        var n = parseValue( v ),
            a = this.value,
            b = n.value,
            sign = this.sign !== n.sign, // Determine result sign
            abs;

        // Optimize for small multipliers
        if ( n.isSmall ) {
            if ( b === 0 ) {
                return Integer[0];
            }
            if ( b === 1 ) {
                return this;
            }
            if ( b === -1 ) {
                return this.negate();
            }

            abs = Math.abs( b );
            if ( abs < BASE ) {
                return new BigInteger( multiplySmall( a, abs ), sign );
            }
            b = smallToArray( abs ); // Convert small 'b' to array for multiplyLong/Karatsuba
        }

        // Decide between Karatsuba and long multiplication
        if ( useKaratsuba( a.length, b.length ) ) {
            return new BigInteger( multiplyKaratsuba( a, b ), sign );
        }

        return new BigInteger( multiplyLong( a, b ), sign );
    };

    // Alias for multiply
    BigInteger.prototype.times = BigInteger.prototype.multiply;


    // Multiplies a small number by a big integer array
    function multiplySmallAndArray( a, b, sign ) {
        if ( a < BASE ) {
            return new BigInteger( multiplySmall( b, a ), sign );
        }
        return new BigInteger( multiplyLong( b, smallToArray( a ) ), sign );
    }


    // SmallInteger's internal multiplication by a small number
    SmallInteger.prototype._multiplyBySmall = function ( a ) {
        if ( isPrecise( a.value * this.value ) ) {
            return new SmallInteger( a.value * this.value );
        }
        return multiplySmallAndArray(
            Math.abs( a.value ),
            smallToArray( Math.abs( this.value ) ),
            this.sign !== a.sign
        );
    };


    // BigInteger's internal multiplication by a small number
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
        return multiplySmallAndArray(
            Math.abs( a.value ),
            this.value,
            this.sign !== a.sign
        );
    };


    // SmallInteger multiplication method (delegates to _multiplyBySmall)
    SmallInteger.prototype.multiply = function ( v ) {
        return parseValue( v )._multiplyBySmall( this );
    };

    // Alias for multiply
    SmallInteger.prototype.times = SmallInteger.prototype.multiply;


    // Squares a big integer array
    function square( a ) {
        var l = a.length,
            r = createArray( l + l ), // Result array, max length 2*l
            base = BASE,
            product,
            carry,
            i,
            a_i,
            a_j;

        // Optimized squaring algorithm
        for ( i = 0; i < l; i++ ) {
            a_i = a[i];
            carry = 0 - a_i * a_i; // Initialize carry with negative square
            for ( var j = i; j < l; j++ ) {
                a_j = a[j];
                product = 2 * ( a_i * a_j ) + r[i + j] + carry;
                carry = Math.floor( product / base );
                r[i + j] = product - carry * base;
            }
            r[i + l] = carry; // Store final carry
        }

        trim( r ); // Remove leading zeros
        return r;
    }


    // BigInteger square method
    BigInteger.prototype.square = function () {
        return new BigInteger( square( this.value ), false );
    };


    // SmallInteger square method
    SmallInteger.prototype.square = function () {
        var value = this.value * this.value;
        if ( isPrecise( value ) ) {
            return new SmallInteger( value );
        }
        return new BigInteger( square( smallToArray( Math.abs( this.value ) ) ), false );
    };


    // Division and Modulo (Algorithm 1: faster for smaller numbers)
    function divMod1( a, b ) {
        var a_l = a.length,
            b_l = b.length,
            base = BASE,
            result = createArray( b.length ),
            divisorMostSignificantDigit = b[b_l - 1],
            lambda = Math.ceil( base / ( 2 * divisorMostSignificantDigit ) ), // Normalization factor
            remainder = multiplySmall( a, lambda ), // Normalize dividend
            divisor = multiplySmall( b, lambda ), // Normalize divisor
            quotientDigit,
            shift,
            carry,
            borrow,
            i,
            l,
            q;

        if ( remainder.length <= a_l ) {
            remainder.push( 0 ); // Pad remainder if needed
        }
        divisor.push( 0 ); // Pad divisor
        divisorMostSignificantDigit = divisor[b_l - 1]; // Update after padding

        // Main loop for calculating quotient digits
        for ( shift = a_l - b_l; shift >= 0; shift-- ) {
            quotientDigit = base - 1; // Initial guess for quotient digit

            if ( remainder[shift + b_l] !== divisorMostSignificantDigit ) {
                quotientDigit = Math.floor(
                    ( remainder[shift + b_l] * base + remainder[shift + b_l - 1] ) /
                    divisorMostSignificantDigit
                );
            }

            carry = 0;
            borrow = 0;
            l = divisor.length;

            // Multiply divisor by quotientDigit and subtract from remainder
            for ( i = 0; i < l; i++ ) {
                carry += quotientDigit * divisor[i];
                q = Math.floor( carry / base );
                borrow += remainder[shift + i] - ( carry - q * base );
                carry = q;

                if ( borrow < 0 ) {
                    remainder[shift + i] = borrow + base;
                    borrow = -1;
                } else {
                    remainder[shift + i] = borrow;
                    borrow = 0;
                }
            }

            // Adjust quotientDigit if it was too large
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

        // Denormalize remainder
        remainder = divModSmall( remainder, lambda )[0];

        return [ arrayToSmall( result ), arrayToSmall( remainder ) ];
    }


    // Division and Modulo (Algorithm 2: slower but more general)
    function divMod2( a, b ) {
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
            part.unshift( a[--a_l] ); // Take one digit from dividend
            trim( part ); // Remove leading zeros from current part

            // If current part is smaller than divisor, quotient digit is 0
            if ( compareAbs( part, b ) < 0 ) {
                result.push( 0 );
                continue;
            }

            xlen = part.length;
            highx = part[xlen - 1] * base + part[xlen - 2]; // Top two digits of part
            highy = b[b_l - 1] * base + b[b_l - 2]; // Top two digits of divisor

            if ( xlen > b_l ) {
                highx = ( highx + 1 ) * base; // Adjust if part is longer
            }

            guess = Math.ceil( highx / highy ); // Initial guess for quotient digit

            // Refine guess by trial subtraction
            do {
                check = multiplySmall( b, guess );
                if ( compareAbs( check, part ) <= 0 ) {
                    break;
                }
                guess--;
            } while ( guess );

            result.push( guess ); // Add quotient digit
            part = subtract( part, check ); // Update part (remainder)
        }

        result.reverse(); // Reverse to get correct order
        return [ arrayToSmall( result ), arrayToSmall( part ) ];
    }


    // Divides a big integer array by a small number (lambda)
    function divModSmall( value, lambda ) {
        var length = value.length,
            quotient = createArray( length ),
            base = BASE,
            i,
            q,
            remainder,
            divisor;

        remainder = 0;
        // Process digits from most significant to least significant
        for ( i = length - 1; i >= 0; --i ) {
            divisor = remainder * base + value[i];
            q = truncate( divisor / lambda );
            remainder = divisor - q * lambda;
            quotient[i] = q | 0; // Ensure integer
        }
        return [ quotient, remainder | 0 ]; // Return quotient array and remainder
    }


    // General division and modulo function
    function divModAny( self, v ) {
        var value,
            n = parseValue( v );

        var a = self.value,
            b = n.value;

        var quotient;

        if ( b === 0 ) {
            throw new Error( "Cannot divide by zero" );
        }

        // Handle cases where 'self' is a SmallInteger
        if ( self.isSmall ) {
            if ( n.isSmall ) {
                return [ new SmallInteger( truncate( a / b ) ), new SmallInteger( a % b ) ];
            }
            return [ Integer[0], self ]; // Small integer divided by large integer is 0 with remainder 'self'
        }

        // Handle cases where 'n' is a SmallInteger
        if ( n.isSmall ) {
            if ( b === 1 ) {
                return [ self, Integer[0] ];
            }
            if ( b === -1 ) {
                return [ self.negate(), Integer[0] ];
            }

            var abs = Math.abs( b );
            if ( abs < BASE ) {
                value = divModSmall( a, abs ); // Use optimized divModSmall
                quotient = arrayToSmall( value[0] );
                var remainder = value[1];

                if ( self.sign ) {
                    remainder = -remainder;
                }

                if ( typeof quotient === "number" ) {
                    if ( self.sign !== n.sign ) {
                        quotient = -quotient;
                    }
                    return [ new SmallInteger( quotient ), new SmallInteger( remainder ) ];
                }

                return [
                    new BigInteger( quotient, self.sign !== n.sign ),
                    new SmallInteger( remainder )
                ];
            }
            b = smallToArray( abs ); // Convert small 'b' to array for divMod1/2
        }

        // General case: both are BigIntegers
        var comparison = compareAbs( a, b );

        if ( comparison === -1 ) {
            return [ Integer[0], self ]; // Dividend is smaller than divisor
        }
        if ( comparison === 0 ) {
            return [ Integer[ self.sign === n.sign ? 1 : -1 ], Integer[0] ]; // Dividend equals divisor
        }

        // Choose division algorithm based on length
        if ( a.length + b.length <= 200 ) {
            value = divMod1( a, b );
        } else {
            value = divMod2( a, b );
        }

        quotient = value[0];
        var qSign = self.sign !== n.sign,
            mod = value[1],
            mSign = self.sign;

        // Convert quotient to appropriate Integer type
        if ( typeof quotient === "number" ) {
            if ( qSign ) {
                quotient = -quotient;
            }
            quotient = new SmallInteger( quotient );
        } else {
            quotient = new BigInteger( quotient, qSign );
        }

        // Convert remainder to appropriate Integer type
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


    // BigInteger divmod method
    BigInteger.prototype.divmod = function ( v ) {
        var result = divModAny( this, v );
        return { quotient: result[0], remainder: result[1] };
    };

    // SmallInteger divmod method (inherits from BigInteger)
    SmallInteger.prototype.divmod = BigInteger.prototype.divmod;


    // BigInteger divide method
    BigInteger.prototype.divide = function ( v ) {
        return divModAny( this, v )[0];
    };

    // Aliases for divide
    SmallInteger.prototype.over = SmallInteger.prototype.divide =
        BigInteger.prototype.over = BigInteger.prototype.divide;


    // BigInteger mod method
    BigInteger.prototype.mod = function ( v ) {
        return divModAny( this, v )[1];
    };

    // Aliases for mod
    SmallInteger.prototype.remainder = SmallInteger.prototype.mod =
        BigInteger.prototype.remainder = BigInteger.prototype.mod;


    // BigInteger power method
    BigInteger.prototype.pow = function ( v ) {
        var n = parseValue( v ),
            a = this.value,
            b = n.value,
            value,
            x,
            y;

        // Handle base cases for exponentiation
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

        // Negative exponents are not supported for integers (result is fractional)
        if ( n.sign ) {
            return Integer[0];
        }

        // Check if exponent is too large
        if ( !n.isSmall ) {
            throw new Error( "The exponent " + n.toString() + " is too large." );
        }

        // If base is small, try direct Math.pow
        if ( this.isSmall ) {
            if ( isPrecise( value = Math.pow( a, b ) ) ) {
                return new SmallInteger( truncate( value ) );
            }
        }

        // Binary exponentiation (exponentiation by squaring)
        x = this;
        y = Integer[1];
        while ( true ) {
            if ( ( b & 1 ) === 1 ) {
                y = y.times( x );
                --b;
            }
            if ( b === 0 ) {
                break;
            }
            b /= 2;
            x = x.square();
        }
        return y;
    };

    // SmallInteger power method (inherits from BigInteger)
    SmallInteger.prototype.pow = BigInteger.prototype.pow;


    // BigInteger modular exponentiation method (modPow)
    BigInteger.prototype.modPow = function ( exp, mod ) {
        exp = parseValue( exp );
        mod = parseValue( mod );

        if ( mod.isZero() ) {
            throw new Error( "Cannot take modPow with modulus 0" );
        }

        var r = Integer[1], // Result initialized to 1
            base = this.mod( mod ); // Base is 'this' modulo 'mod'

        // Binary exponentiation with modulo at each step
        while ( exp.isPositive() ) {
            if ( base.isZero() ) {
                return Integer[0]; // If base is 0, result is 0
            }
            if ( exp.isOdd() ) {
                r = r.multiply( base ).mod( mod );
            }
            exp = exp.divide( 2 );
            base = base.square().mod( mod );
        }
        return r;
    };

    // SmallInteger modPow method (inherits from BigInteger)
    SmallInteger.prototype.modPow = BigInteger.prototype.modPow;


    // Compares the absolute values of two big integer arrays
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
        return 0; // Equal
    }


    // BigInteger absolute comparison method
    BigInteger.prototype.compareAbs = function ( v ) {
        var n = parseValue( v ),
            a = this.value,
            b = n.value;

        if ( n.isSmall ) {
            return 1; // A big integer is always absolutely larger than a small integer (unless the small integer is 0)
        }
        return compareAbs( a, b );
    };


    // SmallInteger absolute comparison method
    SmallInteger.prototype.compareAbs = function ( v ) {
        var n = parseValue( v ),
            a = Math.abs( this.value ),
            b = n.value;

        if ( n.isSmall ) {
            b = Math.abs( b );
            return a === b ? 0 : a > b ? 1 : -1;
        }
        return -1; // A small integer is always absolutely smaller than a big integer (unless the small integer is 0)
    };


    // BigInteger comparison method
    BigInteger.prototype.compare = function ( v ) {
        if ( v === Infinity ) {
            return -1;
        }
        if ( v === -Infinity ) {
            return 1;
        }

        var n = parseValue( v ),
            a = this.value,
            b = n.value;

        // Different signs
        if ( this.sign !== n.sign ) {
            return n.sign ? 1 : -1; // If n is negative, this is positive (larger); else this is negative (smaller)
        }

        // If 'n' is a SmallInteger, and 'this' is BigInteger, 'this' is larger (or smaller if negative)
        if ( n.isSmall ) {
            return this.sign ? -1 : 1;
        }

        // Same signs, compare absolute values
        return compareAbs( a, b ) * ( this.sign ? -1 : 1 ); // Flip result if negative
    };

    // Alias for compare
    BigInteger.prototype.compareTo = BigInteger.prototype.compare;


    // SmallInteger comparison method
    SmallInteger.prototype.compare = function ( v ) {
        if ( v === Infinity ) {
            return -1;
        }
        if ( v === -Infinity ) {
            return 1;
        }

        var n = parseValue( v ),
            a = this.value,
            b = n.value;

        if ( n.isSmall ) {
            return a == b ? 0 : a > b ? 1 : -1; // Direct comparison for small integers
        }

        // If 'this' is small and 'n' is big
        if ( a < 0 !== n.sign ) {
            return a < 0 ? -1 : 1; // If 'a' is negative, it's smaller; if positive, it's larger
        }

        return a < 0 ? 1 : -1; // If both are negative, 'a' being less negative means larger. If both positive, 'a' less positive means smaller.
    };

    // Alias for compare
    SmallInteger.prototype.compareTo = SmallInteger.prototype.compare;


    // Equality check
    BigInteger.prototype.equals = function ( v ) {
        return this.compare( v ) === 0;
    };

    // Aliases for equals
    SmallInteger.prototype.eq = SmallInteger.prototype.equals =
        BigInteger.prototype.eq = BigInteger.prototype.equals;


    // Inequality check
    BigInteger.prototype.notEquals = function ( v ) {
        return this.compare( v ) !== 0;
    };

    // Aliases for notEquals
    SmallInteger.prototype.neq = SmallInteger.prototype.notEquals =
        BigInteger.prototype.neq = BigInteger.prototype.notEquals;


    // Greater than check
    BigInteger.prototype.greater = function ( v ) {
        return this.compare( v ) > 0;
    };

    // Aliases for greater
    SmallInteger.prototype.gt = SmallInteger.prototype.greater =
        BigInteger.prototype.gt = BigInteger.prototype.greater;


    // Lesser than check
    BigInteger.prototype.lesser = function ( v ) {
        return this.compare( v ) < 0;
    };

    // Aliases for lesser
    SmallInteger.prototype.lt = SmallInteger.prototype.lesser =
        BigInteger.prototype.lt = BigInteger.prototype.lesser;


    // Greater than or equals check
    BigInteger.prototype.greaterOrEquals = function ( v ) {
        return this.compare( v ) >= 0;
    };

    // Aliases for greaterOrEquals
    SmallInteger.prototype.geq = SmallInteger.prototype.greaterOrEquals =
        BigInteger.prototype.geq = BigInteger.prototype.greaterOrEquals;


    // Lesser than or equals check
    BigInteger.prototype.lesserOrEquals = function ( v ) {
        return this.compare( v ) <= 0;
    };

    // Aliases for lesserOrEquals
    SmallInteger.prototype.leq = SmallInteger.prototype.lesserOrEquals =
        BigInteger.prototype.leq = BigInteger.prototype.lesserOrEquals;


    // BigInteger isEven check (based on the least significant digit)
    BigInteger.prototype.isEven = function () {
        return ( this.value[0] & 1 ) === 0;
    };

    // SmallInteger isEven check
    SmallInteger.prototype.isEven = function () {
        return ( this.value & 1 ) === 0;
    };


    // BigInteger isOdd check
    BigInteger.prototype.isOdd = function () {
        return ( this.value[0] & 1 ) === 1;
    };

    // SmallInteger isOdd check
    SmallInteger.prototype.isOdd = function () {
        return ( this.value & 1 ) === 1;
    };


    // BigInteger isPositive check
    BigInteger.prototype.isPositive = function () {
        return !this.sign;
    };

    // SmallInteger isPositive check
    SmallInteger.prototype.isPositive = function () {
        return this.value > 0;
    };


    // BigInteger isNegative check
    BigInteger.prototype.isNegative = function () {
        return this.sign;
    };

    // SmallInteger isNegative check
    SmallInteger.prototype.isNegative = function () {
        return this.value < 0;
    };


    // BigInteger isUnit check (always false as it's not 1 or -1)
    BigInteger.prototype.isUnit = function () {
        return false;
    };

    // SmallInteger isUnit check
    SmallInteger.prototype.isUnit = function () {
        return Math.abs( this.value ) === 1;
    };


    // BigInteger isZero check (always false for BigInteger, BigInteger represents non-zero large numbers)
    BigInteger.prototype.isZero = function () {
        return false;
    };

    // SmallInteger isZero check
    SmallInteger.prototype.isZero = function () {
        return this.value === 0;
    };


    // BigInteger isDivisibleBy check
    BigInteger.prototype.isDivisibleBy = function ( v ) {
        var n = parseValue( v );
        var value = n.value;

        if ( value === 0 ) {
            return false; // Cannot divide by zero
        }
        if ( value === 1 ) {
            return true;
        }
        if ( value === 2 ) {
            return this.isEven();
        }

        return this.mod( n ).equals( Integer[0] ); // Check if remainder is zero
    };

    // SmallInteger isDivisibleBy check (inherits from BigInteger)
    SmallInteger.prototype.isDivisibleBy = BigInteger.prototype.isDivisibleBy;


    // Checks for basic primality (small primes)
    function isBasicPrime( v ) {
        var n = v.abs();

        if ( n.isUnit() ) {
            return false;
        }
        if ( n.equals( 2 ) || n.equals( 3 ) || n.equals( 5 ) ) {
            return true;
        }
        if ( n.isEven() || n.isDivisibleBy( 3 ) || n.isDivisibleBy( 5 ) ) {
            return false;
        }
        if ( n.lesser( 25 ) ) {
            return true; // Primes less than 25 not caught by above (7, 11, 13, 17, 19, 23)
        }
    }


    // BigInteger primality test (Miller-Rabin)
    BigInteger.prototype.isPrime = function () {
        var isPrime = isBasicPrime( this );
        if ( isPrime !== undefined ) {
            return isPrime;
        }

        var n = this.abs(),
            nPrev = n.prev(); // n-1

        // Miller-Rabin test requires n-1 = 2^s * d
        var a = [ 2, 3, 5, 7, 11, 13, 17, 19 ], // Bases for the test
            b = nPrev,
            d,
            t,
            i,
            x;

        // Find d such that n-1 = 2^s * d
        while ( b.isEven() ) {
            b = b.divide( 2 );
        }

        // Perform Miller-Rabin for each base
        for ( i = 0; i < a.length; i++ ) {
            x = bigInt( a[i] ).modPow( b, n ); // x = a^d mod n
            if ( x.equals( Integer[1] ) || x.equals( nPrev ) ) {
                continue; // n is probably prime for this base
            }

            // Check x^(2^r) mod n for r from 1 to s-1
            for ( t = true, d = b; t && d.lesser( nPrev ); d = d.multiply( 2 ) ) {
                x = x.square().mod( n );
                if ( x.equals( nPrev ) ) {
                    t = false; // n is probably prime for this base
                }
            }
            if ( t ) {
                return false; // n is composite
            }
        }
        return true; // n is prime
    };

    // SmallInteger isPrime method (inherits from BigInteger)
    SmallInteger.prototype.isPrime = BigInteger.prototype.isPrime;


    // BigInteger probabilistic primality test (Miller-Rabin with random bases)
    BigInteger.prototype.isProbablePrime = function ( iterations ) {
        var isPrime = isBasicPrime( this );
        if ( isPrime !== undefined ) {
            return isPrime;
        }

        var n = this.abs();
        var t = iterations === undefined ? 5 : iterations; // Number of iterations

        // Perform Miller-Rabin with 't' random bases
        for ( var i = 0; i < t; i++ ) {
            var a = bigInt.randBetween( 2, n.minus( 2 ) ); // Choose random base 'a'
            if ( !a.modPow( n.prev(), n ).isUnit() ) {
                return false; // Composite
            }
        }
        return true; // Probably prime
    };

    // SmallInteger isProbablePrime method (inherits from BigInteger)
    SmallInteger.prototype.isProbablePrime = BigInteger.prototype.isProbablePrime;


    // BigInteger modular multiplicative inverse (extended Euclidean algorithm)
    BigInteger.prototype.modInv = function ( n ) {
        var t = bigInt.zero,
            newT = bigInt.one,
            r = parseValue( n ),
            newR = this.abs(),
            q,
            lastT,
            lastR;

        // Extended Euclidean algorithm
        while ( !newR.equals( bigInt.zero ) ) {
            q = r.divide( newR );
            lastT = t;
            lastR = r;
            t = newT;
            r = newR;
            newT = lastT.subtract( q.multiply( newT ) );
            newR = lastR.subtract( q.multiply( newR ) );
        }

        if ( !r.equals( 1 ) ) {
            throw new Error( this.toString() + " and " + n.toString() + " are not co-prime" );
        }

        if ( t.compare( 0 ) === -1 ) {
            t = t.add( n ); // Ensure result is positive
        }

        if ( this.isNegative() ) {
            return t.negate(); // Adjust sign if original number was negative
        }
        return t;
    };

    // SmallInteger modInv method (inherits from BigInteger)
    SmallInteger.prototype.modInv = BigInteger.prototype.modInv;


    // BigInteger next (this + 1) method
    BigInteger.prototype.next = function () {
        var value = this.value;
        if ( this.sign ) {
            return subtractSmall( value, 1, this.sign ); // If negative, subtract 1 from abs value
        }
        return new BigInteger( addSmall( value, 1 ), this.sign ); // If positive, add 1
    };

    // SmallInteger next (this + 1) method
    SmallInteger.prototype.next = function () {
        var value = this.value;
        if ( value + 1 < MAX_INT ) {
            return new SmallInteger( value + 1 );
        }
        return new BigInteger( MAX_INT_ARR, false ); // Exceeds small integer limit
    };


    // BigInteger prev (this - 1) method
    BigInteger.prototype.prev = function () {
        var value = this.value;
        if ( this.sign ) {
            return new BigInteger( addSmall( value, 1 ), true ); // If negative, add 1 to abs value (e.g., -5 becomes -6)
        }
        return subtractSmall( value, 1, this.sign ); // If positive, subtract 1
    };

    // SmallInteger prev (this - 1) method
    SmallInteger.prototype.prev = function () {
        var value = this.value;
        if ( value - 1 > -MAX_INT ) {
            return new SmallInteger( value - 1 );
        }
        return new BigInteger( MAX_INT_ARR, true ); // Exceeds small integer limit, becomes negative big int
    };


    // Powers of two array for bitwise operations
    var powersOfTwo = [1];
    while ( 2 * powersOfTwo[powersOfTwo.length - 1] <= BASE ) {
        powersOfTwo.push( 2 * powersOfTwo[powersOfTwo.length - 1] );
    }
    var powers2Length = powersOfTwo.length,
        highestPower2 = powersOfTwo[powers2Length - 1];


    // Helper to check if a shift amount is small enough
    function shift_isSmall( n ) {
        return (
            ( typeof n === "number" || typeof n === "string" ) &&
            +Math.abs( n ) <= BASE
        ) || ( n instanceof BigInteger && n.value.length <= 1 );
    }


    // BigInteger left shift method
    BigInteger.prototype.shiftLeft = function ( n ) {
        if ( !shift_isSmall( n ) ) {
            throw new Error( String( n ) + " is too large for shifting." );
        }
        n = +n; // Ensure 'n' is a number

        if ( n < 0 ) {
            return this.shiftRight( -n ); // Negative shift left is shift right
        }

        var result = this;
        if ( result.isZero() ) {
            return result;
        }

        // Perform shifts in chunks using powers of two
        while ( n >= powers2Length ) {
            result = result.multiply( highestPower2 );
            n -= powers2Length - 1;
        }
        return result.multiply( powersOfTwo[n] );
    };

    // SmallInteger shiftLeft method (inherits from BigInteger)
    SmallInteger.prototype.shiftLeft = BigInteger.prototype.shiftLeft;


    // BigInteger right shift method
    BigInteger.prototype.shiftRight = function ( n ) {
        var remQuo;
        if ( !shift_isSmall( n ) ) {
            throw new Error( String( n ) + " is too large for shifting." );
        }
        n = +n; // Ensure 'n' is a number

        if ( n < 0 ) {
            return this.shiftLeft( -n ); // Negative shift right is shift left
        }

        var result = this;

        // Handle zero or unit negative numbers
        if ( result.isZero() || ( result.isNegative() && result.isUnit() ) ) {
            return result;
        }

        // Perform shifts in chunks using powers of two
        while ( n >= powers2Length ) {
            remQuo = divModAny( result, highestPower2 );
            result = remQuo[1].isNegative() ? remQuo[0].prev() : remQuo[0]; // Floor division for negative numbers
            n -= powers2Length - 1;
        }

        remQuo = divModAny( result, powersOfTwo[n] );
        return remQuo[1].isNegative() ? remQuo[0].prev() : remQuo[0]; // Floor division for negative numbers
    };

    // SmallInteger shiftRight method (inherits from BigInteger)
    SmallInteger.prototype.shiftRight = BigInteger.prototype.shiftRight;


    // Generic bitwise operation function
    function bitwise( x, y, fn ) {
        y = parseValue( y );

        var xSign = x.isNegative(),
            ySign = y.isNegative();

        // Convert to two's complement representation if negative
        var xRem = xSign ? x.not() : x,
            yRem = ySign ? y.not() : y;

        var xDigit = 0,
            yDigit = 0;

        var xDivMod = null,
            yDivMod = null;

        var result = [];

        // Process digits from least significant to most significant
        while ( !xRem.isZero() || !yRem.isZero() ) {
            xDivMod = divModAny( xRem, highestPower2 );
            xDigit = xDivMod[1].toJSNumber();
            if ( xSign ) {
                xDigit = highestPower2 - 1 - xDigit; // Two's complement for this chunk
            }

            yDivMod = divModAny( yRem, highestPower2 );
            yDigit = yDivMod[1].toJSNumber();
            if ( ySign ) {
                yDigit = highestPower2 - 1 - yDigit; // Two's complement for this chunk
            }

            xRem = xDivMod[0];
            yRem = yDivMod[0];

            result.push( fn( xDigit, yDigit ) ); // Apply bitwise function
        }

        // Determine sign of the result
        var sum = fn( xSign ? 1 : 0, ySign ? 1 : 0 ) !== 0 ? bigInt( -1 ) : bigInt( 0 );

        // Reconstruct the result from chunks
        for ( var i = result.length - 1; i >= 0; i -= 1 ) {
            sum = sum.multiply( highestPower2 ).add( bigInt( result[i] ) );
        }

        return sum;
    }


    // LOB (Least One Bit) mask constants
    var LOBMASK_I = 1 << 30,
        LOBMASK_BI = ( BASE & -BASE ) * ( BASE & -BASE ) | LOBMASK_I;


    // Rough LOB calculation for performance (used in GCD)
    function roughLOB( n ) {
        var v = n.value,
            x = typeof v === "number" ? v | LOBMASK_I : v[0] + v[1] * BASE | LOBMASK_BI;
        return x & -x; // Returns the lowest set bit
    }


    // Integer logarithm base 'base' of 'value'
    function integerLogarithm( value, base ) {
        if ( base.compareTo( value ) <= 0 ) {
            var tmp = integerLogarithm( value, base.square( base ) );
            var p = tmp.p;
            var e = tmp.e;
            var t = p.multiply( base );
            return t.compareTo( value ) <= 0 ? { p: t, e: e * 2 + 1 } : { p: p, e: e * 2 };
        }
        return { p: bigInt( 1 ), e: 0 };
    }


    // BigInteger bit length method
    BigInteger.prototype.bitLength = function () {
        var n = this;
        if ( n.compareTo( bigInt( 0 ) ) < 0 ) {
            n = n.negate().subtract( bigInt( 1 ) ); // For negative numbers, bit length of two's complement
        }
        if ( n.compareTo( bigInt( 0 ) ) === 0 ) {
            return bigInt( 0 );
        }
        return bigInt( integerLogarithm( n, bigInt( 2 ) ).e ).add( bigInt( 1 ) );
    };

    // SmallInteger bitLength method (inherits from BigInteger)
    SmallInteger.prototype.bitLength = BigInteger.prototype.bitLength;


    // Bitwise NOT for BigInteger (two's complement)
    BigInteger.prototype.not = function () {
        return this.negate().prev();
    };

    // SmallInteger bitwise NOT (inherits from BigInteger)
    SmallInteger.prototype.not = BigInteger.prototype.not;


    // Bitwise AND for BigInteger
    BigInteger.prototype.and = function ( n ) {
        return bitwise( this, n, function ( a, b ) {
            return a & b;
        } );
    };

    // SmallInteger bitwise AND (inherits from BigInteger)
    SmallInteger.prototype.and = BigInteger.prototype.and;


    // Bitwise OR for BigInteger
    BigInteger.prototype.or = function ( n ) {
        return bitwise( this, n, function ( a, b ) {
            return a | b;
        } );
    };

    // SmallInteger bitwise OR (inherits from BigInteger)
    SmallInteger.prototype.or = BigInteger.prototype.or;


    // Bitwise XOR for BigInteger
    BigInteger.prototype.xor = function ( n ) {
        return bitwise( this, n, function ( a, b ) {
            return a ^ b;
        } );
    };

    // SmallInteger bitwise XOR (inherits from BigInteger)
    SmallInteger.prototype.xor = BigInteger.prototype.xor;


    // Finds the maximum of two big integers
    function max( a, b ) {
        a = parseValue( a );
        b = parseValue( b );
        return a.greater( b ) ? a : b;
    }


    // Finds the minimum of two big integers
    function min( a, b ) {
        a = parseValue( a );
        b = parseValue( b );
        return a.lesser( b ) ? a : b;
    }


    // Greatest Common Divisor (GCD) using binary GCD algorithm
    function gcd( a, b ) {
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

        var c = Integer[1], // Common factor of 2
            d,
            t;

        // Remove common factors of 2
        while ( a.isEven() && b.isEven() ) {
            d = Math.min( roughLOB( a ), roughLOB( b ) );
            a = a.divide( d );
            b = b.divide( d );
            c = c.multiply( d );
        }

        // Remove remaining factors of 2 from 'a'
        while ( a.isEven() ) {
            a = a.divide( roughLOB( a ) );
        }

        // Main binary GCD loop
        do {
            // Remove factors of 2 from 'b'
            while ( b.isEven() ) {
                b = b.divide( roughLOB( b ) );
            }

            // Ensure 'a' is always smaller than 'b'
            if ( a.greater( b ) ) {
                t = b;
                b = a;
                a = t;
            }
            b = b.subtract( a ); // b = (b - a)
        } while ( !b.isZero() );

        return c.isUnit() ? a : a.multiply( c ); // Multiply by common factors of 2
    }


    // Least Common Multiple (LCM)
    function lcm( a, b ) {
        a = parseValue( a ).abs();
        b = parseValue( b ).abs();
        return a.divide( gcd( a, b ) ).multiply( b ); // LCM(a,b) = (a*b) / GCD(a,b)
    }


    // Generates a random big integer between 'a' and 'b' (inclusive)
    function randBetween( a, b ) {
        a = parseValue( a );
        b = parseValue( b );

        var low = min( a, b ),
            high = max( a, b );
        var range = high.subtract( low ).add( 1 );

        // If range fits in a small integer, use Math.random directly
        if ( range.isSmall ) {
            return low.add( Math.floor( Math.random() * range ) );
        }

        var length = range.value.length - 1;
        var result = [],
            restricted = true;

        // Generate random digits for the result
        for ( var i = length; i >= 0; i-- ) {
            var top = restricted ? range.value[i] : BASE;
            var digit = truncate( Math.random() * top );
            result.unshift( digit );
            if ( digit < top ) {
                restricted = false;
            }
        }

        result = arrayToSmall( result ); // Convert to SmallInteger if possible
        return low.add( typeof result === "number" ? new SmallInteger( result ) : new BigInteger( result, false ) );
    }


    // Parses a string value in a given base
    var parseBase = function ( text, base ) {
        var length = text.length;
        var i;
        var absBase = Math.abs( base );

        // Validate digits for the given base
        for ( var i = 0; i < length; i++ ) {
            var c = text[i].toLowerCase();
            if ( c === "-" ) {
                continue;
            }
            if ( /[a-z0-9]/.test( c ) ) {
                if ( /[0-9]/.test( c ) && +c >= absBase ) {
                    if ( c === "1" && absBase === 1 ) {
                        continue;
                    }
                    throw new Error( c + " is not a valid digit in base " + base + "." );
                } else if ( c.charCodeAt( 0 ) - 87 >= absBase ) {
                    throw new Error( c + " is not a valid digit in base " + base + "." );
                }
            }
        }

        // Optimize for common bases and small numbers using parseInt
        if ( 2 <= base && base <= 36 ) {
            if ( length <= LOG_MAX_INT / Math.log( base ) ) {
                var result = parseInt( text, base );
                if ( isNaN( result ) ) {
                    throw new Error( c + " is not a valid digit in base " + base + "." );
                }
                return new SmallInteger( parseInt( text, base ) );
            }
        }

        base = parseValue( base );
        var digits = [];
        var isNegative = text[0] === "-";

        // Extract digits, handling custom digit representations (e.g., "<10>")
        for ( i = isNegative ? 1 : 0; i < text.length; i++ ) {
            var c = text[i].toLowerCase(),
                charCode = c.charCodeAt( 0 );

            if ( 48 <= charCode && charCode <= 57 ) {
                digits.push( parseValue( c ) );
            } else if ( 97 <= charCode && charCode <= 122 ) {
                digits.push( parseValue( c.charCodeAt( 0 ) - 87 ) );
            } else if ( c === "<" ) {
                var start = i;
                do {
                    i++;
                } while ( text[i] !== ">" );
                digits.push( parseValue( text.slice( start + 1, i ) ) );
            } else {
                throw new Error( c + " is not a valid character" );
            }
        }
        return parseBaseFromArray( digits, base, isNegative );
    };


    // Converts an array of digits in a given base to a big integer
    function parseBaseFromArray( digits, base, isNegative ) {
        var val = Integer[0],
            pow = Integer[1],
            i;

        // Horner's method for base conversion
        for ( i = digits.length - 1; i >= 0; i-- ) {
            val = val.add( digits[i].times( pow ) );
            pow = pow.times( base );
        }
        return isNegative ? val.negate() : val;
    }


    // Converts a digit (0-35) to its string representation (0-9, a-z)
    function stringify( digit ) {
        if ( digit <= 35 ) {
            return "0123456789abcdefghijklmnopqrstuvwxyz".charAt( digit );
        }
        return "<" + digit + ">"; // For digits > 35, use custom format
    }


    // Converts a big integer to an array of digits in a specified base
    function toBase( n, base ) {
        base = bigInt( base );

        if ( base.isZero() ) {
            if ( n.isZero() ) {
                return { value: [0], isNegative: false };
            }
            throw new Error( "Cannot convert nonzero numbers to base 0." );
        }

        if ( base.equals( -1 ) ) {
            if ( n.isZero() ) {
                return { value: [0], isNegative: false };
            }
            if ( n.isNegative() ) {
                return {
                    value: [].concat.apply(
                        [],
                        Array.apply( null, Array( -n ) ).map( Array.prototype.valueOf, [1, 0] )
                    ),
                    isNegative: false
                };
            }
            var arr = Array.apply( null, Array( +n - 1 ) ).map( Array.prototype.valueOf, [0, 1] );
            arr.unshift( [1] );
            return { value: [].concat.apply( [], arr ), isNegative: false };
        }

        var neg = false;
        if ( n.isNegative() && base.isPositive() ) {
            neg = true;
            n = n.abs();
        }

        if ( base.equals( 1 ) ) {
            if ( n.isZero() ) {
                return { value: [0], isNegative: false };
            }
            return {
                value: Array.apply( null, Array( +n ) ).map( Number.prototype.valueOf, 1 ),
                isNegative: neg
            };
        }

        var out = [];
        var left = n,
            divmod;

        // Repeatedly divide by base and collect remainders
        while ( left.isNegative() || left.compareAbs( base ) >= 0 ) {
            divmod = left.divmod( base );
            left = divmod.quotient;
            var digit = divmod.remainder;

            if ( digit.isNegative() ) {
                digit = base.minus( digit ).abs();
                left = left.next(); // Adjust quotient for negative remainder
            }
            out.push( digit.toJSNumber() );
        }

        out.push( left.toJSNumber() );
        return { value: out.reverse(), isNegative: neg }; // Reverse to get correct order
    }


    // Converts a big integer to a string in a specified base
    function toBaseString( n, base ) {
        var arr = toBase( n, base );
        return ( arr.isNegative ? "-" : "" ) + arr.value.map( stringify ).join( "" );
    }


    // BigInteger toArray method
    BigInteger.prototype.toArray = function ( radix ) {
        return toBase( this, radix );
    };

    // SmallInteger toArray method (inherits from BigInteger)
    SmallInteger.prototype.toArray = function ( radix ) {
        return toBase( this, radix );
    };


    // BigInteger toString method
    BigInteger.prototype.toString = function ( radix ) {
        if ( radix === undefined ) {
            radix = 10;
        }
        if ( radix !== 10 ) {
            return toBaseString( this, radix ); // Use general toBaseString for non-decimal
        }

        var v = this.value,
            l = v.length,
            str = String( v[--l] ), // Most significant digit
            zeros = "0000000",
            digit;

        // Concatenate remaining digits, padding with zeros
        while ( --l >= 0 ) {
            digit = String( v[l] );
            str += zeros.slice( digit.length ) + digit;
        }

        var sign = this.sign ? "-" : "";
        return sign + str;
    };

    // SmallInteger toString method
    SmallInteger.prototype.toString = function ( radix ) {
        if ( radix === undefined ) {
            radix = 10;
        }
        if ( radix != 10 ) {
            return toBaseString( this, radix ); // Use general toBaseString for non-decimal
        }
        return String( this.value ); // Direct string conversion for small integers
    };


    // BigInteger toJSON method
    BigInteger.prototype.toJSON = SmallInteger.prototype.toJSON = function () {
        return this.toString();
    };


    // BigInteger valueOf method (returns JS number, potentially losing precision)
    BigInteger.prototype.valueOf = function () {
        return parseInt( this.toString(), 10 );
    };

    // Alias for valueOf
    BigInteger.prototype.toJSNumber = BigInteger.prototype.valueOf;


    // SmallInteger valueOf method
    SmallInteger.prototype.valueOf = function () {
        return this.value;
    };

    // Alias for valueOf
    SmallInteger.prototype.toJSNumber = SmallInteger.prototype.valueOf;


    // Parses a string value into an Integer object
    function parseStringValue( v ) {
        if ( isPrecise( +v ) ) {
            var x = +v;
            if ( x === truncate( x ) ) {
                return new SmallInteger( x );
            }
            throw new Error( "Invalid integer: " + v );
        }

        var sign = v[0] === "-";
        if ( sign ) {
            v = v.slice( 1 );
        }

        var split = v.split( /e/i ); // Handle scientific notation
        if ( split.length > 2 ) {
            throw new Error( "Invalid integer: " + split.join( "e" ) );
        }

        if ( split.length === 2 ) {
            var exp = split[1];
            if ( exp[0] === "+" ) {
                exp = exp.slice( 1 );
            }
            exp = +exp;

            if ( exp !== truncate( exp ) || !isPrecise( exp ) ) {
                throw new Error( "Invalid integer: " + exp + " is not a valid exponent." );
            }
            var text = split[0];
            var decimalPlace = text.indexOf( "." );
            if ( decimalPlace >= 0 ) {
                exp -= text.length - decimalPlace - 1;
                text = text.slice( 0, decimalPlace ) + text.slice( decimalPlace + 1 );
            }
            if ( exp < 0 ) {
                throw new Error( "Cannot include negative exponent part for integers" );
            }
            text += new Array( exp + 1 ).join( "0" ); // Pad with zeros for exponent
            v = text;
        }

        var isValid = /^([0-9][0-9]*)$/.test( v );
        if ( !isValid ) {
            throw new Error( "Invalid integer: " + v );
        }

        var r = [],
            max = v.length,
            l = LOG_BASE,
            min = max - l;

        // Convert string to array of digits (base BASE)
        while ( max > 0 ) {
            r.push( +v.slice( min, max ) );
            min -= l;
            if ( min < 0 ) {
                min = 0;
            }
            max -= l;
        }

        trim( r ); // Remove leading zeros
        return new BigInteger( r, sign );
    }


    // Parses a number value into an Integer object
    function parseNumberValue( v ) {
        if ( isPrecise( v ) ) {
            if ( v !== truncate( v ) ) {
                throw new Error( v + " is not an integer." );
            }
            return new SmallInteger( v );
        }
        return parseStringValue( v.toString() ); // Fallback to string parsing for large numbers
    }


    // Main function to parse any value into an Integer object
    function parseValue( v ) {
        if ( typeof v === "number" ) {
            return parseNumberValue( v );
        }
        if ( typeof v === "string" ) {
            return parseStringValue( v );
        }
        return v; // Assume it's already an Integer object
    }


    // Pre-create SmallInteger objects for common small numbers (0 to 999)
    for ( var i = 0; i < 1e3; i++ ) {
        Integer[i] = new SmallInteger( i );
        if ( i > 0 ) {
            Integer[-i] = new SmallInteger( -i );
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
    Integer.isInstance = function ( x ) {
        return x instanceof BigInteger || x instanceof SmallInteger;
    };
    Integer.randBetween = randBetween;
    Integer.fromArray = function ( digits, base, isNegative ) {
        return parseBaseFromArray(
            digits.map( parseValue ),
            parseValue( base || 10 ),
            isNegative
        );
    };

    return Integer;
}();


var GET = ( function () {

    // Main function to create a new reader instance
    function f( s ) {
        return new g( s );
    }

    // Reader constructor
    function g( s ) {
        this._s = s.trim().split( "\n" ); // Store lines as an array
        this._y = 0; // Current line index
    }

    // Reads a single value from the current line
    g.prototype.a = function ( f ) {
        var s = this._s,
            y = this._y,
            r;

        // If the current line hasn't been split yet, split it by space and reverse
        if ( typeof s[y] === "string" ) {
            s[y] = s[y].split( " " ).reverse();
        }

        r = s[y].pop(); // Pop the last element (which was the first after reverse)

        // If the current line is empty, move to the next line
        if ( !s[y].length ) {
            this._y++;
        }

        return f ? r : +r; // Return as string if 'f' is true, else as number
    };

    // Reads a full line of values
    g.prototype.l = function ( f ) {
        var s = this._s[this._y++].split( " " ); // Get current line, split, and advance line index
        return f ? s : s.map( a => +a ); // Return as strings or numbers
    };

    // Reads 'n' lines of values, creating a matrix
    g.prototype.m = function ( n, f ) {
        var r = this._s
            .slice( this._y, ( this._y += n ) ) // Slice 'n' lines and advance index
            .map( a => a.split( " " ) ); // Split each line into an array of strings

        return f ? r : r.map( a => a.map( a => +a ) ); // Return as strings or numbers
    };

    // Reads 'n' lines as raw strings or numbers (single value per line)
    g.prototype.r = function ( n, f ) {
        var r = this._s.slice( this._y, ( this._y += n ) ); // Slice 'n' lines and advance index
        return f ? r : r.map( a => +a ); // Return as strings or numbers
    };

    return f;
} )();

// Initialize the GET reader with input from stdin
var o = GET( require( "fs" ).readFileSync( "/dev/stdin", "utf8" ) );

// Helper function to create multi-dimensional arrays initialized with a value
function xArray( v ) {
    var a = arguments,
        l = a.length,
        r = "Array(a[" + --l + "]).fill(0).map(x=>{return " + v + ";})"; // Innermost array creation

    // Loop to build nested array creation string
    while ( --l ) {
        r = "Array(a[" + l + "]).fill(0).map(x=>" + r + ")";
    }

    return eval( r ); // Evaluate the constructed string to create the array
}

// Global variable for modulo value
var mod;

// Initialize bigInt library
var bi = bigInt();

// Modular multiplication for numbers that might exceed 32-bit (uses 16-bit chunks)
function abmod() {
    for ( var a = arguments, r = a[0], i = 1; i < a.length; ) {
        // (X * Y) % M = ( (X_high * 2^16 + X_low) * Y ) % M
        // = ( (X_high * Y * 2^16) % M + (X_low * Y) % M ) % M
        r = ( ( r >> 16 ) * a[i] % mod * 65536 + ( r & 65535 ) * a[i++] ) % mod;
    }
    return r;
}

// Modular exponentiation (a^n % mod) using binary exponentiation
function powmod( a, n ) {
    for ( var r = 1; n; a = abmod( a, a ), n >>= 1 ) {
        if ( n & 1 ) {
            r = abmod( a, r );
        }
    }
    return r;
}

// Call the main function and print its result to console
console.log( main() );


// Main logic function
function main() {
    var L = o.a( 1 ); // Read L
    var A = o.a( 1 ); // Read A
    var B = o.a( 1 ); // Read B

    // Convert L, A, B to bigInt objects
    var l = bi.add( L );
    var a = bi.add( A );
    var b = bi.add( B );

    // Read the modulo value and convert L, A, B to JavaScript numbers for `abmod` and `powmod`
    mod = o.a(), L = +L, A = +A, B = +B;

    // Create a 19-element array initialized with bigInt objects
    var d = xArray( bi, 19 );

    // Initialize the answer matrix (or vector in this case, [ [0, 0, 1] ] )
    var ans = [ [0, 0, 1] ];

    // Initialize `s` (current length processed) as a bigInt
    var s = bi;

    // Loop for different digit lengths (up to 18 digits or until L is reached)
    for ( var i = 1; i < 19 && !s.minus( l ).isZero(); i++ ) {
        // Calculate `t` as 10^i - 1 (e.g., 9, 99, 999...)
        var t = bi.add( 10 ).pow( i ).minus( 1 );

        // Calculate `d[i]` (number of values for current digit length)
        // ( (10^i - 1) - A + B ) / B - S
        d[i] = t.minus( a ).add( b ).divide( b ).minus( s );

        if ( d[i].isZero() ) {
            continue; // Skip if no numbers of this length contribute
        }

        // Adjust d[i] if it exceeds the remaining length `l - s`
        if ( s.add( d[i] ).gt( l ) ) {
            d[i] = l.minus( s );
        }

        // Construct the transformation matrix for current digit length
        // [ [ powmod(10, i), 0, 0 ],
        //   [ 1, 1, 0 ],
        //   [ 0, B % mod, 1 ] ]
        var r = matrixPowMod(
            [
                [ powmod( 10, i ), 0, 0 ],
                [ 1, 1, 0 ],
                [ 0, +b.mod( mod ), 1 ]
            ],
            d[i]
        );

        // Update the second element of the answer vector
        ans[0][1] = +b.times( s ).add( a ).mod( mod );

        // Multiply the current answer vector by the transformation matrix
        ans = matrixMultipleMod( ans, r );

        // Update total length processed
        s = s.add( d[i] );
    }

    return ans[0][0]; // Return the final result
}


// Performs matrix exponentiation (M^P % mod)
function matrixPowMod( m, p ) {
    var l = m.length,
        r = xArray( 0, l, l ); // Initialize result as identity matrix

    for ( var i = 0; i < l; i++ ) {
        r[i][i] = 1;
    }

    // Binary exponentiation for matrices
    while ( !p.isZero() ) {
        if ( !p.and( 1 ).isZero() ) {
            r = matrixMultipleMod( r, m ); // If p is odd, multiply result by m
        }
        m = matrixMultipleMod( m, m ); // Square m
        p = p.divide( 2 ); // Halve p
    }
    return r;
}


// Performs matrix multiplication (A * B % mod)
function matrixMultipleMod( a, b ) {
    var x, y;

    // Convert single row arrays to 2D arrays if needed
    if ( typeof a[0] === "object" ) {
        x = a;
    } else {
        x = [a];
    }
    if ( typeof b[0] === "object" ) {
        y = b;
    } else {
        y = [b];
    }

    var h = x.length, // Number of rows in A
        w = y[0].length; // Number of columns in B

    var r = xArray( 0, h, w ); // Result matrix, initialized with zeros

    // Standard matrix multiplication
    for ( var yi = 0; yi < h; yi++ ) {
        for ( var xi = 0; xi < w; xi++ ) {
            for ( var zi = 0; zi < y.length; zi++ ) { // y.length is number of rows in B (or columns in A)
                r[yi][xi] += abmod( a[yi][zi], b[zi][xi] ); // Perform modular multiplication for each term
            }
            r[yi][xi] %= mod; // Apply modulo to the sum
        }
    }
    return r;
}