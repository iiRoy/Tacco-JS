/*
 * This file provides the JavaScript wrapper for the BigNum native module.
 * It handles loading the appropriate native binary (debug or release)
 * and defines various BigNum operations and utility methods.
 */

// Attempt to load the debug version of the native module first.
// If it fails, fall back to the release version.
try {
    var cc = new require('./build/Debug/bignum');
}
catch ( e ) {
    // If the debug version isn't found, try the release version.
    var cc = new require('./build/Release/bignum');
}

// Export the BigNum constructor from the loaded native module.
var BigNum = cc.BigNum;


// Make BigNum available as the module's export.
module.exports = BigNum;


/*
 * Helper function to condition arguments for BigNum operations.
 * It handles conversion of numbers to strings and special cases
 * for scientific notation.
 *
 * @param {string|number} num - The number to condition.
 * @param {number} base - The base for string conversion, defaults to 10.
 * @returns {object} An object containing the conditioned number string and its base.
 */
BigNum.conditionArgs = function ( num, base ) {
    // If 'num' is not already a string, convert it using the specified base (or 10).
    if ( typeof num !== 'string' ) {
        num = num.toString( base || 10 );
    }

    // Check for positive scientific notation (e.g., 1e+5).
    if ( num.match( /e\+/ ) ) { /* positive exponent */
        // If the number, when converted back to a string, doesn't have 'e+'
        // (e.g., 1.0e+0 becomes "1"), then it's a simple integer.
        if ( !Number( num ).toString().match( /e\+/ ) ) {
            return {
                num  :  Math.floor( Number( num ) ).toString(),
                base :  10
            };
        }
        else {
            // Complex positive exponent handling, often for large powers of 2.
            var pow = Math.ceil( Math.log( num ) / Math.log( 2 ) );
            var n = ( num / Math.pow( 2, pow ) ).toString( 2 )
                .replace( /^0/, '' ); // Remove leading zero if any.
            var i = n.length - n.indexOf( '.' ); // Position of decimal point.
            n = n.replace( /\./, '' ); // Remove the decimal point.

            // Pad with zeros to account for the power.
            for ( ; i <= pow; i++ ) {
                n += '0';
            }
            return {
                num  :  n,
                base :  2
            };
        }
    }
    // Check for negative scientific notation (e.g., 1e-5).
    else if ( num.match( /e\-/ ) ) { /* negative exponent */
        // For negative exponents, just floor it and convert to string.
        return {
            num  :  Math.floor( Number( num ) ).toString(),
            base :  base || 10
        };
    }
    else {
        // Default case: no scientific notation, just return the number and base.
        return {
            num  :  num,
            base :  base || 10
        };
    }
};

// Set the JavaScript conditioner function in the native module.
cc.setJSConditioner( BigNum.conditionArgs );


/**
 * Returns a string representation of the BigNum for inspection.
 * @returns {string} Inspection string.
 */
BigNum.prototype.inspect = function () {
    return '<BigNum ' + this.toString( 10 ) + '>';
};


/**
 * Converts the BigNum to a string representation in the specified base.
 * @param {number} [base] - The base for conversion (e.g., 10 for decimal, 16 for hex).
 * @returns {string} The string representation of the BigNum.
 */
BigNum.prototype.toString = function ( base ) {
    var value;

    // Call the native 'tostring' method.
    if ( base ) {
        value = this.tostring( base );
    }
    else {
        value = this.tostring();
    }

    // Convert to lowercase if base > 10 (e.g., hex characters A-F).
    if ( base > 10 && "string" === typeof value ) {
        value = value.toLowerCase();
    }

    return value;
};


/**
 * Converts the BigNum to a standard JavaScript number.
 * Note: May lose precision for very large numbers.
 * @returns {number} The numeric representation.
 */
BigNum.prototype.toNumber = function () {
    return parseInt( this.toString(), 10 );
};


/*
 * Define common arithmetic operations (add, sub, mul, div, mod)
 * on the BigNum prototype.
 * These methods handle various input types (BigNum, number, string)
 * and delegate to appropriate native methods.
 */
[ 'add', 'sub', 'mul', 'div', 'mod' ].forEach( function ( op ) {
    BigNum.prototype[ op ] = function ( num ) {
        // If the other operand is a BigNum instance.
        if ( num instanceof BigNum ) {
            return this[ 'b' + op ]( num );
        }
        // If the other operand is a standard JavaScript number.
        else if ( typeof num === 'number' ) {
            if ( num >= 0 ) {
                // Unsigned operation if positive.
                return this[ 'u' + op ]( num );
            }
            else if ( op === 'add' ) {
                // Addition with negative number becomes subtraction.
                return this.usub( -num );
            }
            else if ( op === 'sub' ) {
                // Subtraction with negative number becomes addition.
                return this.uadd( -num );
            }
            else {
                // For other operations with negative numbers, convert to BigNum.
                var x = BigNum( num );
                return this[ 'b' + op ]( x );
            }
        }
        // If the other operand is a string.
        else if ( typeof num === 'string' ) {
            // Convert string to BigNum and then perform the operation.
            var x = BigNum( num );
            return this[ 'b' + op ]( x );
        }
        else {
            // Throw an error for unsupported types.
            throw new TypeError( 'Unspecified operation for type '
                + ( typeof num ) + ' for ' + op );
        }
    };
} );


/**
 * Returns the absolute value of the BigNum.
 * @returns {BigNum} The absolute value.
 */
BigNum.prototype.abs = function () {
    return this.babs();
};


/**
 * Returns the negation of the BigNum.
 * @returns {BigNum} The negated value.
 */
BigNum.prototype.neg = function () {
    return this.bneg();
};


/**
 * Performs modular exponentiation (this^num % mod).
 * @param {BigNum|number|string} num - The exponent.
 * @param {BigNum|number|string} mod - The modulus.
 * @returns {BigNum} The result of modular exponentiation.
 */
BigNum.prototype.powm = function ( num, mod ) {
    var m, res; // Declare m and res variables.

    // Determine the modulus 'm' based on its type.
    if ( ( typeof mod ) === 'number' || ( typeof mod ) === 'string' ) {
        m = BigNum( mod ); // Convert to BigNum if number or string.
    }
    else if ( mod instanceof BigNum ) {
        m = mod; // Use directly if already a BigNum.
    }

    // Determine how to call the native power function based on 'num' type.
    if ( ( typeof num ) === 'number' ) {
        return this.upowm( num, m ); // Unsigned power with number exponent.
    }
    else if ( ( typeof num ) === 'string' ) {
        var n = BigNum( num ); // Convert string exponent to BigNum.
        return this.bpowm( n, m ); // BigNum power with BigNum exponent.
    }
    else if ( num instanceof BigNum ) {
        return this.bpowm( num, m ); // BigNum power with BigNum exponent.
    }
};


/**
 * Performs modular division (this % num, with optional modulus mod).
 * Note: This method's name `mod` is overloaded with standard modulus.
 * The second `mod` parameter makes this `(this % num) % mod` effectively.
 * @param {BigNum|number|string} num - The divisor.
 * @param {BigNum|number|string} [mod] - An optional modulus for the result.
 * @returns {BigNum} The result of the modular operation.
 */
BigNum.prototype.mod = function ( num, mod ) {
    var m, res; // Declare variables for modulus and result.

    // Condition the optional 'mod' parameter.
    if ( ( typeof mod ) === 'number' || ( typeof mod ) === 'string' ) {
        m = BigNum( mod ); // Convert to BigNum if number or string.
    }
    else if ( mod instanceof BigNum ) {
        m = mod; // Use directly if already a BigNum.
    }

    // Call the appropriate native mod function based on 'num' type.
    if ( ( typeof num ) === 'number' ) {
        return this.umod( num, m ); // Unsigned mod with number divisor.
    }
    else if ( ( typeof num ) === 'string' ) {
        var n = BigNum( num ); // Convert string divisor to BigNum.
        return this.bmod( n, m ); // BigNum mod with BigNum divisor.
    }
    else if ( num instanceof BigNum ) {
        return this.bmod( num, m ); // BigNum mod with BigNum divisor.
    }
};


/**
 * Calculates 'this' raised to the power of 'num'.
 * @param {BigNum|number|string} num - The exponent.
 * @returns {BigNum} The result of exponentiation.
 */
BigNum.prototype.pow = function ( num ) {
    if ( typeof num === 'number' ) {
        if ( num >= 0 ) {
            // Use unsigned power for non-negative number exponents.
            return this.upow( num );
        }
        else {
            // For negative number exponents, delegate to powm (this^num % this implies something else).
            // Retaining original logic: it calls powm with `this` as the modulus.
            return BigNum.prototype.powm.call( this, num, this );
        }
    }
    else {
        // If num is not a number, convert it to an integer and retry.
        var x = parseInt( num.toString(), 10 );
        return BigNum.prototype.pow.call( this, x );
    }
};


/**
 * Performs a left bit shift operation.
 * @param {number|string} num - The number of bits to shift.
 * @returns {BigNum} The result of the left shift.
 */
BigNum.prototype.shiftLeft = function ( num ) {
    if ( typeof num === 'number' ) {
        if ( num >= 0 ) {
            // If shift amount is non-negative, use unsigned multiply by 2^num.
            return this.umul2exp( num );
        }
        else {
            // If shift amount is negative, it's equivalent to a right shift.
            return this.shiftRight( -num );
        }
    }
    else {
        // If num is not a number, convert it to an integer and retry.
        var x = parseInt( num.toString(), 10 );
        return BigNum.prototype.shiftLeft.call( this, x );
    }
};


/**
 * Performs a right bit shift operation.
 * @param {number|string} num - The number of bits to shift.
 * @returns {BigNum} The result of the right shift.
 */
BigNum.prototype.shiftRight = function ( num ) {
    if ( typeof num === 'number' ) {
        if ( num >= 0 ) {
            // If shift amount is non-negative, use unsigned divide by 2^num.
            return this.udiv2exp( num );
        }
        else {
            // If shift amount is negative, it's equivalent to a left shift.
            return this.shiftLeft( -num );
        }
    }
    else {
        // If num is not a number, convert it to an integer and retry.
        var x = parseInt( num.toString(), 10 );
        return BigNum.prototype.shiftRight.call( this, x );
    }
};


/**
 * Compares this BigNum with another number.
 * @param {BigNum|number|string} num - The number to compare against.
 * @returns {number} 0 if equal, 1 if this > num, -1 if this < num.
 */
BigNum.prototype.cmp = function ( num ) {
    if ( num instanceof BigNum ) {
        return this.bcompare( num ); // Compare with another BigNum.
    }
    else if ( typeof num === 'number' ) {
        if ( num < 0 ) {
            return this.scompare( num ); // Signed compare for negative numbers.
        }
        else {
            return this.ucompare( num ); // Unsigned compare for non-negative numbers.
        }
    }
    else {
        // Convert string to BigNum and then compare.
        var x = BigNum( num );
        return this.bcompare( x );
    }
};


/**
 * Checks if this BigNum is greater than 'num'.
 * @param {BigNum|number|string} num - The number to compare against.
 * @returns {boolean} True if this > num, false otherwise.
 */
BigNum.prototype.gt = function ( num ) {
    return this.cmp( num ) > 0;
};


/**
 * Checks if this BigNum is greater than or equal to 'num'.
 * @param {BigNum|number|string} num - The number to compare against.
 * @returns {boolean} True if this >= num, false otherwise.
 */
BigNum.prototype.ge = function ( num ) {
    return this.cmp( num ) >= 0;
};


/**
 * Checks if this BigNum is equal to 'num'.
 * @param {BigNum|number|string} num - The number to compare against.
 * @returns {boolean} True if this === num, false otherwise.
 */
BigNum.prototype.eq = function ( num ) {
    return this.cmp( num ) === 0;
};


/**
 * Checks if this BigNum is not equal to 'num'.
 * @param {BigNum|number|string} num - The number to compare against.
 * @returns {boolean} True if this !== num, false otherwise.
 */
BigNum.prototype.ne = function ( num ) {
    return this.cmp( num ) !== 0;
};


/**
 * Checks if this BigNum is less than 'num'.
 * @param {BigNum|number|string} num - The number to compare against.
 * @returns {boolean} True if this < num, false otherwise.
 */
BigNum.prototype.lt = function ( num ) {
    return this.cmp( num ) < 0;
};


/**
 * Checks if this BigNum is less than or equal to 'num'.
 * @param {BigNum|number|string} num - The number to compare against.
 * @returns {boolean} True if this <= num, false otherwise.
 */
BigNum.prototype.le = function ( num ) {
    return this.cmp( num ) <= 0;
};


/*
 * Define bitwise operations (AND, OR, XOR) on the BigNum prototype.
 * These methods delegate to native BigNum bitwise methods.
 */
'and or xor'.split( ' ' ).forEach( function ( name ) {
    BigNum.prototype[ name ] = function ( num ) {
        if ( num instanceof BigNum ) {
            return this[ 'b' + name ]( num ); // Operate with another BigNum.
        }
        else {
            var x = BigNum( num ); // Convert to BigNum if not already.
            return this[ 'b' + name ]( x );
        }
    };
} );


/**
 * Calculates the square root of the BigNum.
 * @returns {BigNum} The square root.
 */
BigNum.prototype.sqrt = function () {
    return this.bsqrt();
};


/**
 * Calculates the Nth root of the BigNum.
 * @param {BigNum|number|string} num - The root to calculate (e.g., 2 for square root).
 * @returns {BigNum} The Nth root.
 */
BigNum.prototype.root = function ( num ) {
    if ( num instanceof BigNum ) {
        return this.broot( num ); // Root with BigNum exponent.
    }
    else {
        var x = BigNum( num ); // Convert to BigNum if not already.
        return this.broot( num ); // Note: Original code passes `num` directly, not `x`. This is kept.
    }
};


/**
 * Generates a random BigNum.
 * If 'to' is undefined, generates a random number between 0 and `this` (exclusive).
 * If 'to' is provided, generates a random number between `this` (inclusive) and `to` (exclusive).
 * @param {BigNum|number|string} [to] - Upper bound (exclusive).
 * @returns {BigNum} A random BigNum.
 */
BigNum.prototype.rand = function ( to ) {
    if ( to === undefined ) {
        if ( this.toString() === '1' ) {
            return BigNum( 0 ); // Special case: if this is 1, rand between 0 and 1 is always 0.
        }
        else {
            return this.brand0(); // Native random function for 0 to this-1.
        }
    }
    else {
        // Calculate range (to - this) and then add 'this' to the random result.
        var x = to instanceof BigNum
            ? to.sub( this )
            : BigNum( to ).sub( this );
        return x.brand0().add( this );
    }
};


/**
 * Calculates the modular multiplicative inverse of 'this' modulo 'mod'.
 * (i.e., find x such that (this * x) % mod === 1)
 * @param {BigNum|number|string} mod - The modulus.
 * @returns {BigNum} The modular inverse.
 */
BigNum.prototype.invertm = function ( mod ) {
    if ( mod instanceof BigNum ) {
        return this.binvertm( mod ); // Invert modulo another BigNum.
    }
    else {
        var x = BigNum( mod ); // Convert to BigNum if not already.
        return this.binvertm( x );
    }
};


/**
 * Generates a prime BigNum of a given number of bits.
 * @param {number} bits - The desired number of bits for the prime.
 * @param {boolean} [safe=true] - Whether to generate a "safe" prime.
 * @returns {BigNum} A prime BigNum.
 */
BigNum.prime = function ( bits, safe ) {
    // If 'safe' is not explicitly defined, default it to true.
    if ( "undefined" === typeof safe ) {
        safe = true;
    }

    // Force 'bits' to be an unsigned 32-bit integer.
    bits >>>= 0;

    // Call the native prime generation function.
    return BigNum.uprime0( bits, !!safe );
};


/**
 * Performs a probabilistic primality test (Miller-Rabin).
 * @param {number} [reps=10] - The number of repetitions for the test.
 * @returns {boolean} True if probably prime, false otherwise.
 */
BigNum.prototype.probPrime = function ( reps ) {
    var n = this.probprime( reps || 10 ); // Call native test, default reps to 10.
    // Map native result (0 or 1) to boolean.
    return { 1 : true, 0 : false }[ n ];
};


/**
 * Finds the next prime number greater than this BigNum.
 * @returns {BigNum} The next prime.
 */
BigNum.prototype.nextPrime = function () {
    var num = this; // Start with the current number.
    do {
        num = num.add( 1 ); // Increment the number.
    } while ( !num.probPrime() ); // Keep incrementing until a probable prime is found.
    return num;
};


/**
 * Checks if a specific bit is set in the BigNum.
 * @param {number} n - The bit position to check (0-indexed).
 * @returns {boolean} True if the bit is set, false otherwise.
 */
BigNum.prototype.isBitSet = function ( n ) {
    return this.isbitset( n ) === 1;
};


/*
 * Static method to create a BigNum from a Buffer.
 * Supports different endianness and chunk sizes.
 */
BigNum.fromBuffer = function ( buf, opts ) {
    // Ensure opts object exists.
    if ( !opts ) {
        opts = {};
    }

    // Determine endianness. Default to 'big'.
    var endian = { 1 : 'big', '-1' : 'little' }[ opts.endian ]
        || opts.endian || 'big';

    // Determine chunk size. 'auto' means buffer length, otherwise default to 1.
    var size = opts.size === 'auto' ? Math.ceil( buf.length ) : ( opts.size || 1 );

    // Validate buffer length against chunk size.
    if ( buf.length % size !== 0 ) {
        throw new RangeError( 'Buffer length (' + buf.length + ')'
            + ' must be a multiple of size (' + size + ')'
        );
    }

    // Convert buffer to an array of hex strings.
    var hex = [];
    for ( var i = 0; i < buf.length; i += size ) {
        var chunk = [];
        for ( var j = 0; j < size; j++ ) {
            chunk.push( buf[
                i + ( endian === 'big' ? j : ( size - j - 1 ) ) // Handle endianness.
            ] );
        }

        hex.push( chunk
            .map( function ( c ) {
                return ( c < 16 ? '0' : '' ) + c.toString( 16 ); // Convert byte to 2-digit hex.
            } )
            .join( '' )
        );
    }

    // Create a BigNum from the concatenated hex string.
    return BigNum( hex.join( '' ), 16 );
};


/*
 * Converts the BigNum to a Buffer representation.
 * Supports 'mpint' format and standard buffer conversion.
 */
BigNum.prototype.toBuffer = function ( opts ) {
    // Special handling for 'mpint' format (used in SSH, TLS, etc.).
    if ( typeof opts === 'string' ) {
        if ( opts !== 'mpint' ) {
            return 'Unsupported Buffer representation'; // Return error string for unknown string opts.
        }

        var abs = this.abs(); // Get absolute value.
        var buf = abs.toBuffer( { size : 1, endian : 'big' } ); // Convert to raw big-endian buffer.
        var len = buf.length === 1 && buf[ 0 ] === 0 ? 0 : buf.length; // Calculate effective length.
        if ( buf[ 0 ] & 0x80 ) {
            len++; // If MSB is set, need an extra byte for positive representation.
        }

        var ret = new Buffer( 4 + len ); // Allocate buffer for length prefix + data.
        if ( len > 0 ) {
            buf.copy( ret, 4 + ( buf[ 0 ] & 0x80 ? 1 : 0 ) ); // Copy data, offset if MSB set.
        }
        if ( buf[ 0 ] & 0x80 ) {
            ret[ 4 ] = 0; // Ensure the extra byte is zero.
        }

        // Write the length prefix (4 bytes, big-endian).
        ret[ 0 ] = len & ( 0xff << 24 );
        ret[ 1 ] = len & ( 0xff << 16 );
        ret[ 2 ] = len & ( 0xff << 8 );
        ret[ 3 ] = len & ( 0xff << 0 );

        // Apply two's complement for negative integers.
        var isNeg = this.lt( 0 );
        if ( isNeg ) {
            for ( var i = 4; i < ret.length; i++ ) {
                ret[ i ] = 0xff - ret[ i ]; // Invert bits.
            }
        }
        // Set sign bit and adjust for two's complement.
        ret[ 4 ] = ( ret[ 4 ] & 0x7f ) | ( isNeg ? 0x80 : 0 );
        if ( isNeg ) {
            ret[ ret.length - 1 ]++; // Add 1 for two's complement.
        }

        return ret; // Return the final mpint buffer.
    }

    // Handle standard buffer conversion.
    if ( !opts ) {
        opts = {};
    }

    // Determine endianness, default to 'big'.
    var endian = { 1 : 'big', '-1' : 'little' }[ opts.endian ]
        || opts.endian || 'big';

    // Get hex string representation.
    var hex = this.toString( 16 );
    if ( hex.charAt( 0 ) === '-' ) {
        throw new Error(
            'converting negative numbers to Buffers not supported yet'
        ); // Negative numbers not supported for standard conversion.
    }

    // Determine chunk size for buffer.
    var size = opts.size === 'auto' ? Math.ceil( hex.length / 2 ) : ( opts.size || 1 );

    // Calculate total buffer length.
    var len = Math.ceil( hex.length / ( 2 * size ) ) * size;
    var buf = new Buffer( len ); // Create new buffer.

    // Zero-pad the hex string so chunks are aligned.
    while ( hex.length < 2 * len ) {
        hex = '0' + hex;
    }

    // Split hex string into chunks of (2 * size) characters.
    var hx = hex
        .split( new RegExp( '(.{' + ( 2 * size ) + '})' ) )
        .filter( function ( s ) {
            return s.length > 0;
        } );

    // Populate the buffer from hex chunks.
    hx.forEach( function ( chunk, i ) {
        for ( var j = 0; j < size; j++ ) {
            var ix = i * size + ( endian === 'big' ? j : size - j - 1 ); // Calculate index based on endianness.
            buf[ ix ] = parseInt( chunk.slice( j * 2, j * 2 + 2 ), 16 ); // Parse two hex digits to a byte.
        }
    } );

    return buf; // Return the created buffer.
};


/*
 * Dynamically add static methods to BigNum that mirror its prototype methods.
 * This allows calling BigNum.add(a, b) instead of a.add(b).
 */
Object.keys( BigNum.prototype ).forEach( function ( name ) {
    // Skip 'inspect' and 'toString' to avoid conflicts or unexpected behavior.
    if ( name === 'inspect' || name === 'toString' ) {
        return;
    }

    // Define the static method.
    BigNum[ name ] = function ( num ) {
        var args = [].slice.call( arguments, 1 ); // Get all arguments after the first.

        // If the first argument is already a BigNum, call its prototype method.
        if ( num instanceof BigNum ) {
            return num[ name ].apply( num, args );
        }
        else {
            // Otherwise, convert the first argument to a BigNum and then call the method.
            var bigi = BigNum( num );
            return bigi[ name ].apply( bigi, args );
        }
    };
} );