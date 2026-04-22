/*
 * This file, BigInt.js, provides an arbitrary-size integer math package
 * for JavaScript environments.
 *
 * Original Copyright (C) 2000 Masanao Izumo <iz@onicos.co.jp>
 * Version: 1.0.1
 * Licence: GNU General Public License (GPL), Version 2 or any later version.
 *
 * This software is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 * Please refer to the GNU General Public License for full details.
 *
 *
 *
 * Available Interfaces for BigInt operations:
 * --------------------------------------------
 *
 * // Create a new BigInt instance from a string representation
 * var x = new BigInt( "1234567890123456789012345678901234567890" );
 *
 * // Create a BigInt from a hexadecimal string
 * var y = new BigInt( "0x123456789abcdef0123456789abcdef0" );
 *
 * // Create a deep copy of an existing BigInt
 * var z = x.clone( );
 *
 * // Unary minus operation
 * var z = bigint_uminus( x );
 *
 * // Addition of two BigInts
 * var z = bigint_plus( x, y );
 *
 * // Subtraction of two BigInts
 * var z = bigint_minus( x, y );
 *
 * // Multiplication of two BigInts
 * var z = bigint_mul( x, y );
 *
 * // Division of two BigInts
 * var z = bigint_div( x, y ); // (Note: bigint_div not provided in original snippet)
 *
 * // Modulo operation
 * var z = bigint_mod( x, y ); // (Note: bigint_mod not provided in original snippet)
 *
 * // Comparison of two BigInts
 * var cmp = bigint_cmp( x, y ); // Returns -1 if x < y, 0 if x == y, 1 if x > y
 *
 * // Conversion of a BigInt to a standard JavaScript number (may lose precision)
 * var num = bigint_number( x ); // (Note: bigint_number not provided in original snippet)
 *
 *
 */


function _BigInt_toString ( )
{
    // Simply delegates to toStringBase with base 10 for standard decimal representation.
    return this.toStringBase( 10 );
}


function _BigInt_toStringBase ( base )
{
    var i, j, hbase; // Loop counters and base for internal calculations
    var t;           // Temporary BigInt for calculations
    var ds;          // Digits array of the temporary BigInt
    var c;           // Character code for digit conversion
    var s;           // Result string accumulator


    // Handle zero value edge cases.
    i = this.len;

    if ( i == 0 )
        return "0";

    if ( i == 1 && ! this.digits[0] )
        return "0";


    // Determine internal base and estimated length for the target base.
    switch ( base ) {
        default:
        case 10:
            j = Math.floor( ( 2 * 8 * i * 241 ) / 800 ) + 2;
            hbase = 10000; // Using 10000 as a power of 10 for decimal conversion
            break;

        case 16:
            j = Math.floor( ( 2 * 8 * i ) / 4 ) + 2;
            hbase = 0x10000; // Using 0x10000 for hexadecimal conversion
            break;

        case 8:
            j = ( 2 * 8 * i ) + 2;
            hbase = 010000; // Using 010000 (octal) for octal conversion
            break;

        case 2:
            j = ( 2 * 8 * i ) + 2;
            hbase = 020; // Using 020 (octal, equivalent to 16 decimal) for binary conversion
            break;
    }


    // Clone the BigInt to avoid modifying the original during conversion.
    t = this.clone( );
    ds = t.digits;
    s = ""; // Initialize result string


    // Main conversion loop: repeatedly divide by the base and append remainders.
    while ( i && j ) {
        var k = i;
        var num = 0; // Accumulator for current division block


        // Perform division by hbase on a block of digits.
        while ( k-- ) {
            num = ( num << 16 ) + ds[k]; // Shift and add next digit
            if ( num < 0 )
                num += 4294967296; // Handle potential negative results from bitwise operations

            ds[k] = Math.floor( num / hbase ); // Store quotient
            num %= hbase;                      // Keep remainder
        }


        // If the most significant digit becomes zero, reduce effective length.
        if ( ds[i-1] == 0 )
            i--;

        k = 4; // Process 4 digits at a time (related to hbase)

        // Convert the remainder (num) to string digits in the target base.
        while ( k-- ) {
            c = ( num % base ); // Get the current digit
            s = "0123456789abcdef".charAt( c ) + s; // Prepend to result string

            --j; // Decrement remaining length counter

            num = Math.floor( num / base ); // Prepare for next digit

            // Break if all digits are processed.
            if ( i == 0 && num == 0 ) {
                break;
            }
        }
    }


    // Remove leading zeros from the result string.
    i = 0;
    while ( i < s.length && s.charAt( i ) == "0" )
        i++;

    if ( i )
        s = s.substring( i, s.length );

    // Prepend negative sign if applicable.
    if ( ! this.sign )
        s = "-" + s;

    return s;
}


function _BigInt_clone ( )
{
    var x, i;

    // Create a new BigInt with the same length and sign.
    x = new BigInt( this.len, this.sign );

    // Copy all digits from the current BigInt to the new one.
    for ( i = 0; i < this.len; i++ )
        x.digits[i] = this.digits[i];

    return x;
}


function BigInt ( len, sign )
{
    var i, x, need_init;


    // Setup member functions for this BigInt instance.
    // NOTE: There was a known Garbage Collection bug with anonymous functions in Netscape.
    //       Therefore, named functions are used and assigned here.
    this.toString     = _BigInt_toString;
    this.toStringBase = _BigInt_toStringBase;
    this.clone        = _BigInt_clone;


    // Handle different constructor call signatures.
    if ( BigInt.arguments.length == 0 ) {
        // Default constructor: creates a BigInt representing 0.
        this.sign     = true;   // Positive sign
        this.len      = len = 1; // Length of 1 digit
        this.digits   = new Array( 1 ); // Array to hold digits
        need_init     = true;   // Digits need to be initialized to 0
    }
    else if ( BigInt.arguments.length == 1 ) {
        // Constructor with one argument: can be another BigInt, string, or number.
        x = bigint_from_any( BigInt.arguments[0] );

        // If bigint_from_any returned the original object, clone it to avoid shared references.
        if ( x == BigInt.arguments[0] )
            x = x.clone( );

        this.sign     = x.sign;
        this.len      = x.len;
        this.digits   = x.digits;
        need_init     = false; // Digits are already set from the source BigInt
    }
    else {
        // Constructor with two arguments: `len` and `sign`.
        // Used internally for pre-allocating space for results.
        this.sign     = ( sign ? true : false ); // Explicitly set sign
        this.len      = len;
        this.digits   = new Array( len );
        need_init     = true; // Digits need to be initialized to 0
    }


    // Initialize digits array to zeros if `need_init` is true.
    if ( need_init ) {
        for ( i = 0; i < len; i++ )
            this.digits[i] = 0;
    }
}


function bigint_norm ( x )
{
    var len = x.len;
    var ds  = x.digits;

    // Reduce the effective length by removing leading zero digits.
    while ( len-- && ! ds[len] )
        ; // Empty loop body

    x.len = ++len; // Update length, accounting for the last non-zero digit.

    return x;
}


function bigint_from_int ( n )
{
    var sign, big, i;


    // Determine the sign of the number.
    if ( n < 0 ) {
        n    = -n;    // Make it positive for digit extraction
        sign = false; // Store negative sign
    }
    else {
        sign = true;  // Store positive sign
    }

    n &= 0x7fffffff; // Ensure number fits within a 31-bit signed integer range for safety.


    // Create a BigInt instance based on the magnitude of n.
    if ( n <= 0xffff ) {
        // If n fits in one digit (16 bits)
        big        = new BigInt( 1, 1 );
        big.digits[0] = n;
    }
    else {
        // If n requires two digits
        big        = new BigInt( 2, 1 );
        big.digits[0] = ( n & 0xffff );       // Lower 16 bits
        big.digits[1] = ( ( n >> 16 ) & 0xffff ); // Upper 16 bits
    }

    return big;
}


function bigint_from_string ( str, base )
{
    var str_i;     // Index for iterating through the input string
    var sign = true; // Initial assumption: positive
    var c;         // Current character from string
    var len;       // Estimated length of the BigInt
    var z;         // The resulting BigInt object
    var zds;       // Digits array of the result BigInt
    var num;       // Accumulator for digit conversion
    var i;         // Loop counter
    var blen = 1;  // Current effective length of the result BigInt's digits

    // Append a terminator character to simplify parsing loop.
    str += "@";


    str_i = 0;
    // TODO: Implement skipping of whitespace characters if necessary.


    // Check for explicit sign.
    if ( str.charAt( str_i ) == "+" ) {
        str_i++;
    }
    else if ( str.charAt( str_i ) == "-" ) {
        str_i++;
        sign = false; // Set sign to negative
    }


    // If string is empty or only contains sign, return null.
    if ( str.charAt( str_i ) == "@" )
        return null;


    // Auto-detect base if not provided.
    if ( ! base ) {
        if ( str.charAt( str_i ) == "0" ) {
            c = str.charAt( str_i + 1 );
            if ( c == "x" || c == "X" ) {
                base = 16; // Hexadecimal
            }
            else if ( c == "b" || c == "B" ) {
                base = 2; // Binary
            }
            else {
                base = 8; // Octal
            }
        }
        else {
            base = 10; // Decimal (default)
        }
    }


    // Adjust string index and estimate length based on base.
    if ( base == 8 ) {
        while ( str.charAt( str_i ) == "0" )
            str_i++;
        len = 3 * ( str.length - str_i ); // Each octal digit takes approx 3 bits
    }
    else { // base == 10, 2 or 16
        // Skip common base prefixes for hex and binary.
        if ( base == 16 && str.charAt( str_i ) == '0' && ( str.charAt( str_i + 1 ) == "x" || str.charAt( str_i + 1 ) == "X" ) ) {
            str_i += 2;
        }
        if ( base == 2 && str.charAt( str_i ) == '0' && ( str.charAt( str_i + 1 ) == "b" || str.charAt( str_i + 1 ) == "B" ) ) {
            str_i += 2;
        }

        // Skip leading zeros after prefix.
        while ( str.charAt( str_i ) == "0" )
            str_i++;

        // Adjust index if all digits were zeros.
        if ( str.charAt( str_i ) == "@" )
            str_i--;

        len = 4 * ( str.length - str_i ); // Each hex digit takes 4 bits
    }


    // Allocate BigInt with estimated length.
    len = ( len >> 4 ) + 1; // Convert bit length to 16-bit digit length
    z = new BigInt( len, sign );
    zds = z.digits;


    // Main loop to parse string digits and convert to BigInt.
    while ( true ) {
        c = str.charAt( str_i++ ); // Get next character

        if ( c == "@" ) // Break on terminator
            break;

        // Convert character to its numeric value.
        switch ( c ) {
            case '0': c = 0;  break;
            case '1': c = 1;  break;
            case '2': c = 2;  break;
            case '3': c = 3;  break;
            case '4': c = 4;  break;
            case '5': c = 5;  break;
            case '6': c = 6;  break;
            case '7': c = 7;  break;
            case '8': c = 8;  break;
            case '9': c = 9;  break;
            case 'a': case 'A': c = 10; break;
            case 'b': case 'B': c = 11; break;
            case 'c': case 'C': c = 12; break;
            case 'd': case 'D': c = 13; break;
            case 'e': case 'E': c = 14; break;
            case 'f': case 'F': c = 15; break;
            default:
                c = base; // Set to base value to trigger break if invalid digit
                break;
        }

        // If character is not a valid digit for the given base, stop parsing.
        if ( c >= base )
            break;


        i = 0;
        num = c; // Initialize accumulator with the current digit.

        // Multiply existing BigInt by base and add current digit.
        while ( true ) {
            while ( i < blen ) {
                num += zds[i] * base; // Multiply current digit by base and add carry
                zds[i++] = ( num & 0xffff ); // Store lower 16 bits
                num >>>= 16;                 // Shift right for next carry
            }
            if ( num ) {
                blen++;    // Expand BigInt length if there's a carry
                continue;  // Continue processing carry
            }
            break; // No more carry, move to next input character
        }
    }

    return bigint_norm( z ); // Normalize the resulting BigInt (remove leading zeros)
}


function bigint_from_any ( x )
{
    // If input is already a BigInt object, return it (or a clone, depending on usage).
    if ( typeof( x ) == "object" ) {
        if ( x.constructor == BigInt )
            return x; // It's already a BigInt, return as is.
        return new BigInt( 1, 1 ); // Default to a BigInt of 0 if object is not a BigInt.
    }

    // If input is a string, parse it.
    if ( typeof( x ) == "string" ) {
        return bigint_from_string( x );
    }

    // If input is a number, convert it.
    if ( typeof( x ) == "number" ) {
        var i, x1, x2, fpt, np;

        // If the number fits within standard integer limits, use optimized conversion.
        if ( -2147483647 <= x && x <= 2147483647 ) { // Roughly 2^31 - 1
            return bigint_from_int( x );
        }

        // For larger numbers or floating point numbers with 'e' notation.
        x = x + ""; // Convert number to string to handle scientific notation.
        i = x.indexOf( "e", 0 );

        if ( i == -1 )
            return bigint_from_string( x ); // No 'e' notation, parse as regular string.

        // Handle scientific notation (e.g., 1.23e+5).
        x1 = x.substr( 0, i );         // Part before 'e' (mantissa)
        x2 = x.substr( i + 2, x.length - ( i + 2 ) ); // Part after 'e+' or 'e-' (exponent)

        fpt = x1.indexOf( ".", 0 );
        if ( fpt != -1 ) {
            // If mantissa has a decimal point, adjust exponent.
            np = x1.length - ( fpt + 1 );
            x1 = x1.substr( 0, fpt ) + x1.substr( fpt + 1, np ); // Remove decimal point
            x2 = parseInt( x2 ) - np; // Adjust exponent by number of decimal places
        }
        else {
            x2 = parseInt( x2 ); // Parse exponent directly
        }

        // Apply the exponent by appending zeros.
        while ( x2-- > 0 ) {
            x1 += "0";
        }

        return bigint_from_string( x1 ); // Parse the final string representation.
    }

    // Default return for unsupported types (e.g., boolean, undefined).
    return new BigInt( 1, 1 ); // Return a BigInt of 0.
}


function bigint_uminus ( x )
{
    // Create a clone to avoid modifying the original BigInt.
    var z = x.clone( );

    // Invert the sign of the cloned BigInt.
    z.sign = ! z.sign;

    // Normalize the result (e.g., -0 should become 0).
    return bigint_norm( z );
}


function bigint_add_internal ( x, y, sign )
{
    var z;         // The result BigInt
    var num;       // Carry/borrow accumulator
    var i, len;    // Loop counters and length variable


    // Determine if we are effectively adding or subtracting based on signs.
    // 'sign' parameter indicates the desired sign of 'y' for addition.
    // If x.sign is different from the effective sign of y, it's a subtraction.
    sign = ( sign == y.sign ); // True if signs are effectively the same for addition

    if ( x.sign != sign ) {
        // Signs differ, perform subtraction.
        if ( sign )
            return bigint_sub_internal( y, x ); // Effectively y - x
        return bigint_sub_internal( x, y );     // Effectively x - y
    }


    // Ensure x is the shorter number for optimized loop (x.len <= y.len).
    if ( x.len > y.len ) {
        len = x.len + 1; // Max possible length of result
        z = x; x = y; y = z; // Swap x and y
    }
    else {
        len = y.len + 1; // Max possible length of result
    }

    // Create a new BigInt for the result.
    z = new BigInt( len, sign );


    // Perform digit-by-digit addition with carry.
    len = x.len;
    for ( i = 0, num = 0; i < len; i++ ) {
        num += x.digits[i] + y.digits[i]; // Add digits and previous carry
        z.digits[i] = ( num & 0xffff );   // Store lower 16 bits
        num >>>= 16;                      // Get carry
    }

    // Continue adding remaining digits of the longer number (y) with carry.
    len = y.len;
    while ( num && i < len ) {
        num += y.digits[i];               // Add digit and carry
        z.digits[i++] = ( num & 0xffff ); // Store lower 16 bits
        num >>>= 16;                      // Get carry
    }

    // Copy any remaining digits of the longer number (y) if no more carry.
    while ( i < len ) {
        z.digits[i] = y.digits[i];
        i++;
    }

    // Store the final carry, if any.
    z.digits[i] = ( num & 0xffff );

    return bigint_norm( z ); // Normalize the result.
    // return z; // Original comment, indicating normalization might be optional in some contexts.
}


function bigint_sub_internal ( x, y )
{
    var z = 0;     // Temporary variable for swapping, also indicates if swap occurred
    var zds;       // Digits array of the result BigInt
    var num;       // Borrow accumulator
    var i;         // Loop counter


    i = x.len;

    // Compare magnitudes to ensure x >= y for standard subtraction.
    // If x is smaller than y, swap them and negate the final result.
    if ( x.len < y.len ) {
        z = x; x = y; y = z; // Swap x and y, z now holds original x
    }
    else if ( x.len == y.len ) {
        // If lengths are equal, compare digit by digit from MSB to LSB.
        while ( i > 0 ) {
            i--;
            if ( x.digits[i] > y.digits[i] ) {
                break; // x is larger
            }
            if ( x.digits[i] < y.digits[i] ) {
                z = x; x = y; y = z; // x is smaller, swap x and y
                break;
            }
        }
    }


    // Create a new BigInt for the result.
    // Sign is determined by whether a swap occurred (z == 0 means x was originally >= y).
    z = new BigInt( x.len, ( z == 0 ) ? 1 : 0 );
    zds = z.digits;


    // Perform digit-by-digit subtraction with borrow.
    for ( i = 0, num = 0; i < y.len; i++ ) {
        num += x.digits[i] - y.digits[i]; // Subtract digits and previous borrow
        zds[i] = ( num & 0xffff );        // Store lower 16 bits (result digit)
        num >>>= 16;                      // Get borrow (will be negative if borrow occurred)
    }

    // Continue subtracting with borrow for remaining digits of x.
    while ( num && i < x.len ) {
        num += x.digits[i];               // Add digit and borrow
        zds[i++] = ( num & 0xffff );      // Store result digit
        num >>>= 16;                      // Get next borrow
    }

    // Copy any remaining digits of x if no more borrow.
    while ( i < x.len ) {
        zds[i] = x.digits[i];
        i++;
    }

    return bigint_norm( z ); // Normalize the result.
}


function bigint_plus ( x, y )
{
    x = bigint_from_any( x ); // Ensure x is a BigInt
    y = bigint_from_any( y ); // Ensure y is a BigInt

    // Call internal addition function, treating y as having a positive sign for addition.
    return bigint_add_internal( x, y, 1 );
}


function bigint_minus ( x, y )
{
    x = bigint_from_any( x ); // Ensure x is a BigInt
    y = bigint_from_any( y ); // Ensure y is a BigInt

    // Call internal addition function, treating y as having a negative sign for subtraction.
    return bigint_add_internal( x, y, 0 );
}


function bigint_mul ( x, y )
{
    var i, j;      // Loop counters
    var n = 0;     // Accumulator for multiplication results
    var z;         // The result BigInt
    var zds, xds, yds; // Digit arrays for x, y, and z
    var dd, ee;    // Temporary variables for digit multiplication
    var ylen;      // Length of y's digits for optimization


    x = bigint_from_any( x ); // Ensure x is a BigInt
    y = bigint_from_any( y ); // Ensure y is a BigInt


    // Determine the maximum possible length of the product.
    j = x.len + y.len + 1;
    // Create a new BigInt for the result, determining sign based on x.sign == y.sign.
    z = new BigInt( j, x.sign == y.sign );


    xds = x.digits;
    yds = y.digits;
    zds = z.digits;
    ylen = y.len;

    // Initialize all digits of the result to zero.
    while ( j-- )
        zds[j] = 0;


    // Perform long multiplication (schoolbook method).
    for ( i = 0; i < x.len; i++ ) {
        dd = xds[i]; // Current digit of x

        if ( dd == 0 ) // Optimization: if digit is zero, skip inner loop.
            continue;

        n = 0; // Reset carry for this row of multiplication.

        for ( j = 0; j < ylen; j++ ) {
            ee = n + dd * yds[j]; // Multiply x_i * y_j and add carry from previous digit.
            n = zds[i + j] + ee;  // Add to existing digit and get new carry.

            if ( ee ) // Optimization: only update if there's a value.
                zds[i + j] = ( n & 0xffff ); // Store lower 16 bits.

            n >>>= 16; // Get new carry.
        }

        if ( n ) {
            zds[i + j] = n; // Store any remaining carry.
        }
    }

    return bigint_norm( z ); // Normalize the result.
}


function bigint_divmod ( x, y, modulo )
{
    var nx = x.len; // Length of x
    var ny = y.len; // Length of y
    var i, j;       // Loop counters
    var yy, z;      // Temporary BigInts for division
    var xds, yds, zds, tds; // Digit arrays for x, y, z, and temporary.

    // ... (rest of bigint_divmod implementation, not provided in snippet)
}