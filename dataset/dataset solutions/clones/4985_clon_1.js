/*
 * This is a Type I clone of the original JavaScript code.
 *
 * It maintains the exact same functionality and token sequence.
 * The only modifications are extensive changes to whitespace and comments.
 * This includes:
 * - Altered indentation (e.g., mixing tabs and spaces, varying space counts).
 * - Addition of new comments and modification of existing ones.
 * - Strategic placement of blank lines for visual distinction.
 * - Varied spacing around operators, keywords, and punctuation.
 *
 * The original code was likely part of a BigInteger library,
 * followed by a 'Main' function that uses it.
 *
 * This cloned version aims to look significantly different visually,
 * while being byte-for-byte identical in its functional tokens.
 *
 */

// Original comments describing the BigInt necessity and library source.
// The problem involves calculations that might exceed JavaScript's safe integer limit (10^18).
// Therefore, a BigInt implementation is crucial for accurate results.
// Instead of creating a custom library, this code leverages an existing one:
// specifically, the 'BigInteger.min.js' from 'https://github.com/peterolson/BigInteger.js'.

var bigInt = function ( undefined ) {
  "use strict";

  // --- Core Constants and Setup ---
  var BASE = 1e7; /* Base for internal number representation (10^7) */
  var LOG_BASE = 7; /* Logarithm of the base (log10(10^7) = 7) */
  var MAX_INT = 9007199254740992; /* Maximum safe integer in JavaScript (2^53 - 1) */
  var MAX_INT_ARR = smallToArray( MAX_INT ); /* MAX_INT represented as an array of base-BASE digits */
  var DEFAULT_ALPHABET = "0123456789abcdefghijklmnopqrstuvwxyz"; /* Default alphabet for base conversions */

  // Check for native BigInt support in the environment.
  var supportsNativeBigInt = typeof BigInt === "function";

  // --- Integer Constructor Function ---
  // This is the primary entry point for creating BigInt instances.
  function Integer( v, radix, alphabet, caseSensitive ) {

    if ( typeof v === "undefined" ) {
      return Integer[0]; // Return zero if no value is provided.
    }

    if ( typeof radix !== "undefined" ) {
      // If radix is 10 and no custom alphabet, parse as a standard number.
      return +radix === 10 && !alphabet ? parseValue( v ) : parseBase( v, radix, alphabet, caseSensitive );
    }

    // Default parsing for a single value.
    return parseValue( v );
  }

  // --- BigInteger Class Definition ---
  // Represents large integers using an array of digits.
  function BigInteger( value, sign ) {
    this.value = value; // Array of digits
    this.sign = sign; // Boolean: true for negative, false for positive/zero
    this.isSmall = false; // Flag indicating it's not a SmallInteger
  }
  // Inherit from Integer prototype.
  BigInteger.prototype = Object.create( Integer.prototype );

  // --- SmallInteger Class Definition ---
  // Represents integers that fit within JavaScript's native number type.
  function SmallInteger( value ) {
    this.value = value; // Native number value
    this.sign = value < 0; // Boolean: true for negative
    this.isSmall = true; // Flag indicating it's a SmallInteger
  }
  // Inherit from Integer prototype.
  SmallInteger.prototype = Object.create( Integer.prototype );

  // --- NativeBigInt Class Definition ---
  // Wrapper for JavaScript's native BigInt type, if supported.
  function NativeBigInt( value ) {
    this.value = value; // Native BigInt value
  }
  // Inherit from Integer prototype.
  NativeBigInt.prototype = Object.create( Integer.prototype );

  // --- Utility Functions ---

  // Checks if a number can be precisely represented by JavaScript's number type.
  function isPrecise( n ) {
    return -MAX_INT < n && n < MAX_INT;
  }

  // Converts a small integer to an array of digits in BASE.
  function smallToArray( n ) {
    if ( n < BASE ) {
      return [ n ];
    }
    if ( n < BASE * BASE ) {
      return [ n % BASE, Math.floor( n / BASE ) ];
    }
    // For numbers up to MAX_INT (approx 9 * 10^15), it needs 3 digits in base 10^7.
    return [ n % BASE, Math.floor( n / BASE ) % BASE, Math.floor( n / ( BASE * BASE ) ) ];
  }

  // Converts an array of digits back to a small integer if possible.
  function arrayToSmall( arr ) {
    trim( arr ); // Remove leading zeros.
    var length = arr.length;

    // If the array is small enough, convert it back to a native number.
    if ( length < 4 && compareAbs( arr, MAX_INT_ARR ) < 0 ) {
      switch ( length ) {
        case 0:
          return 0;
        case 1:
          return arr[0];
        case 2:
          return arr[0] + arr[1] * BASE;
        default:
          return arr[0] + ( arr[1] + arr[2] * BASE ) * BASE;
      }
    }
    return arr; // Not small, return the array.
  }

  // Removes leading zeros from a digit array.
  function trim( v ) {
    var i = v.length;
    while ( v[--i] === 0 && i > 0 ); // Loop until a non-zero digit is found or array is empty.
    v.length = i + 1; // Resize the array.
  }

  // Creates an array filled with zeros.
  function createArray( length ) {
    var x = new Array( length );
    var i = -1;
    while ( ++i < length ) {
      x[i] = 0;
    }
    return x;
  }

  // Truncates a number (removes fractional part).
  function truncate( n ) {
    if ( n > 0 ) {
      return Math.floor( n );
    }
    return Math.ceil( n );
  }

  // --- Arithmetic Operations: Addition ---

  // Adds two arrays of digits (representing positive numbers).
  function add( a, b ) {
    var l_a = a.length,
      l_b = b.length,
      r = new Array( l_a ),
      carry = 0,
      base = BASE,
      sum, i;

    // Add digits up to the length of the shorter array.
    for ( i = 0; i < l_b; i++ ) {
      sum = a[i] + b[i] + carry;
      carry = sum >= base ? 1 : 0; // Determine carry.
      r[i] = sum - carry * base; // Store the digit.
    }

    // Add remaining digits of the longer array, with carry.
    while ( i < l_a ) {
      sum = a[i] + carry;
      carry = sum === base ? 1 : 0;
      r[i++] = sum - carry * base;
    }

    // If there's a final carry, append it.
    if ( carry > 0 ) {
      r.push( carry );
    }
    return r;
  }

  // Adds two arrays of digits, ensuring the longer array is 'a'.
  function addAny( a, b ) {
    if ( a.length >= b.length ) {
      return add( a, b );
    }
    return add( b, a );
  }

  // Adds a small number (carry) to an array of digits.
  function addSmall( a, carry ) {
    var l = a.length,
      r = new Array( l ),
      base = BASE,
      sum, i;

    for ( i = 0; i < l; i++ ) {
      sum = a[i] - base + carry; // Subtraction from base simplifies carry calculation.
      carry = Math.floor( sum / base );
      r[i] = sum - carry * base;
      carry += 1; // Adjust carry for next iteration.
    }

    // Propagate remaining carry.
    while ( carry > 0 ) {
      r[i++] = carry % base;
      carry = Math.floor( carry / base );
    }
    return r;
  }

  // BigInteger addition method.
  BigInteger.prototype.add = function ( v ) {
    var n = parseValue( v );

    // If signs are different, it's a subtraction.
    if ( this.sign !== n.sign ) {
      return this.subtract( n.negate() );
    }

    var a = this.value,
      b = n.value;

    // If 'n' is a SmallInteger, use optimized addSmall.
    if ( n.isSmall ) {
      return new BigInteger( addSmall( a, Math.abs( b ) ), this.sign );
    }
    // Otherwise, use general addAny for two BigIntegers.
    return new BigInteger( addAny( a, b ), this.sign );
  };
  BigInteger.prototype.plus = BigInteger.prototype.add; // Alias 'plus' for 'add'.

  // SmallInteger addition method.
  SmallInteger.prototype.add = function ( v ) {
    var n = parseValue( v );
    var a = this.value;

    // If signs are different (or this is negative and n is positive), it's subtraction.
    if ( a < 0 !== n.sign ) {
      return this.subtract( n.negate() );
    }

    var b = n.value;

    // If both are SmallIntegers, try native addition.
    if ( n.isSmall ) {
      if ( isPrecise( a + b ) ) {
        return new SmallInteger( a + b );
      }
      // If it overflows, convert 'b' to array and use BigInteger addition.
      b = smallToArray( Math.abs( b ) );
    }

    // Convert 'this' to an array and perform BigInteger addition.
    return new BigInteger( addSmall( b, Math.abs( a ) ), a < 0 );
  };
  SmallInteger.prototype.plus = SmallInteger.prototype.add; // Alias 'plus' for 'add'.

  // NativeBigInt addition method (uses native BigInt operators).
  NativeBigInt.prototype.add = function ( v ) {
    return new NativeBigInt( this.value + parseValue( v ).value );
  };
  NativeBigInt.prototype.plus = NativeBigInt.prototype.add; // Alias 'plus' for 'add'.

  // --- Arithmetic Operations: Subtraction ---

  // Subtracts two arrays of digits (assuming a >= b).
  function subtract( a, b ) {
    var a_l = a.length,
      b_l = b.length,
      r = new Array( a_l ),
      borrow = 0,
      base = BASE,
      i, difference;

    // Subtract digits up to the length of 'b'.
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

    // Propagate borrow through remaining digits of 'a'.
    for ( i = b_l; i < a_l; i++ ) {
      difference = a[i] - borrow;
      if ( difference < 0 ) {
        difference += base;
      } else {
        r[i++] = difference; // If no borrow, copy remaining digits.
        break;
      }
      r[i] = difference;
    }

    // Copy any remaining digits from 'a'.
    for ( ; i < a_l; i++ ) {
      r[i] = a[i];
    }

    trim( r ); // Remove leading zeros.
    return r;
  }

  // Subtracts two arrays of digits, handling order and sign.
  function subtractAny( a, b, sign ) {
    var value;

    // Ensure 'a' is the larger absolute value for subtraction.
    if ( compareAbs( a, b ) >= 0 ) {
      value = subtract( a, b );
    } else {
      value = subtract( b, a );
      sign = !sign; // Flip sign if 'b' was larger.
    }

    value = arrayToSmall( value ); // Try to convert to SmallInteger.

    if ( typeof value === "number" ) {
      if ( sign ) {
        value = -value;
      }
      return new SmallInteger( value );
    }
    return new BigInteger( value, sign );
  }

  // Subtracts a small number from an array of digits.
  function subtractSmall( a, b, sign ) {
    var l = a.length,
      r = new Array( l ),
      carry = -b, // Initialize carry with negative 'b'.
      base = BASE,
      i, difference;

    for ( i = 0; i < l; i++ ) {
      difference = a[i] + carry; // Add carry (which is negative).
      carry = Math.floor( difference / base );
      difference %= base;
      r[i] = difference < 0 ? difference + base : difference; // Ensure positive digit.
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

  // BigInteger subtraction method.
  BigInteger.prototype.subtract = function ( v ) {
    var n = parseValue( v );

    // If signs are different, it's an addition (A - (-B) = A + B).
    if ( this.sign !== n.sign ) {
      return this.add( n.negate() );
    }

    var a = this.value,
      b = n.value;

    // If 'n' is a SmallInteger, use optimized subtractSmall.
    if ( n.isSmall ) {
      return subtractSmall( a, Math.abs( b ), this.sign );
    }
    // Otherwise, use general subtractAny.
    return subtractAny( a, b, this.sign );
  };
  BigInteger.prototype.minus = BigInteger.prototype.subtract; // Alias 'minus' for 'subtract'.

  // SmallInteger subtraction method.
  SmallInteger.prototype.subtract = function ( v ) {
    var n = parseValue( v );
    var a = this.value;

    // If signs are different, it's an addition.
    if ( a < 0 !== n.sign ) {
      return this.add( n.negate() );
    }

    var b = n.value;

    // If both are SmallIntegers, try native subtraction.
    if ( n.isSmall ) {
      return new SmallInteger( a - b );
    }

    // If 'n' is a BigInteger, perform subtraction with 'b' as the main operand.
    // The sign logic here is tricky: if 'a' (SmallInteger) is negative,
    // then 'a - b' is equivalent to '-(|b| + |a|)' or '-(|b| - |a|)' depending on relative magnitudes.
    // The `a >= 0` determines the final sign.
    return subtractSmall( b, Math.abs( a ), a >= 0 );
  };
  SmallInteger.prototype.minus = SmallInteger.prototype.subtract; // Alias 'minus' for 'subtract'.

  // NativeBigInt subtraction method.
  NativeBigInt.prototype.subtract = function ( v ) {
    return new NativeBigInt( this.value - parseValue( v ).value );
  };
  NativeBigInt.prototype.minus = NativeBigInt.prototype.subtract; // Alias 'minus' for 'subtract'.

  // --- Sign Manipulation ---

  // Negates a BigInteger.
  BigInteger.prototype.negate = function () {
    return new BigInteger( this.value, !this.sign );
  };

  // Negates a SmallInteger.
  SmallInteger.prototype.negate = function () {
    var sign = this.sign;
    var small = new SmallInteger( -this.value );
    small.sign = !sign; // Explicitly flip the sign flag.
    return small;
  };

  // Negates a NativeBigInt.
  NativeBigInt.prototype.negate = function () {
    return new NativeBigInt( -this.value );
  };

  // Absolute value for BigInteger.
  BigInteger.prototype.abs = function () {
    return new BigInteger( this.value, false ); // Always positive.
  };

  // Absolute value for SmallInteger.
  SmallInteger.prototype.abs = function () {
    return new SmallInteger( Math.abs( this.value ) );
  };

  // Absolute value for NativeBigInt.
  NativeBigInt.prototype.abs = function () {
    return new NativeBigInt( this.value >= 0 ? this.value : -this.value );
  };

  // --- Arithmetic Operations: Multiplication ---

  // Multiplies two arrays of digits using standard long multiplication.
  function multiplyLong( a, b ) {
    var a_l = a.length,
      b_l = b.length,
      l = a_l + b_l, // Maximum possible length of the result.
      r = createArray( l ), // Result array, initialized with zeros.
      base = BASE,
      product, carry, i, a_i, b_j;

    for ( i = 0; i < a_l; ++i ) {
      a_i = a[i];
      for ( var j = 0; j < b_l; ++j ) {
        b_j = b[j];
        product = a_i * b_j + r[i + j]; // Current product plus carry from previous step.
        carry = Math.floor( product / base ); // New carry.
        r[i + j] = product - carry * base; // Store current digit.
        r[i + j + 1] += carry; // Add carry to the next position.
      }
    }
    trim( r ); // Remove leading zeros.
    return r;
  }

  // Multiplies an array of digits by a small number.
  function multiplySmall( a, b ) {
    var l = a.length,
      r = new Array( l ),
      base = BASE,
      carry = 0,
      product, i;

    for ( i = 0; i < l; i++ ) {
      product = a[i] * b + carry;
      carry = Math.floor( product / base );
      r[i] = product - carry * base;
    }

    // Propagate any remaining carry.
    while ( carry > 0 ) {
      r[i++] = carry % base;
      carry = Math.floor( carry / base );
    }
    return r;
  }

  // Helper function to shift an array of digits left by 'n' positions (equivalent to multiplying by BASE^n).
  function shiftLeft( x, n ) {
    var r = [];
    while ( n-- > 0 ) {
      r.push( 0 ); // Add zeros to the right.
    }
    return r.concat( x ); // Concatenate original digits after zeros.
  }

  // Multiplies two arrays of digits using Karatsuba algorithm for efficiency with large numbers.
  function multiplyKaratsuba( x, y ) {
    var n = Math.max( x.length, y.length );

    // Base case: if numbers are small, use long multiplication.
    if ( n <= 30 ) { // Threshold for switching to long multiplication.
      return multiplyLong( x, y );
    }

    // Split numbers into two halves.
    n = Math.ceil( n / 2 );
    var b = x.slice( n ),
      a = x.slice( 0, n ),
      d = y.slice( n ),
      c = y.slice( 0, n );

    // Recursive steps for Karatsuba.
    var ac = multiplyKaratsuba( a, c );
    var bd = multiplyKaratsuba( b, d );
    var abcd = multiplyKaratsuba( addAny( a, b ), addAny( c, d ) );

    // Recombine results.
    var product = addAny( addAny( ac, shiftLeft( subtract( subtract( abcd, ac ), bd ), n ) ), shiftLeft( bd, 2 * n ) );
    trim( product );
    return product;
  }

  // Heuristic to decide whether to use Karatsuba multiplication.
  function useKaratsuba( l1, l2 ) {
    // This formula is an empirical optimization threshold.
    return -.012 * l1 - .012 * l2 + 15e-6 * l1 * l2 > 0;
  }

  // BigInteger multiplication method.
  BigInteger.prototype.multiply = function ( v ) {
    var n = parseValue( v ),
      a = this.value,
      b = n.value,
      sign = this.sign !== n.sign, // Determine the sign of the result.
      abs;

    // Optimization for small multipliers.
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
      if ( abs < BASE ) { // If small multiplier fits within a single digit.
        return new BigInteger( multiplySmall( a, abs ), sign );
      }
      b = smallToArray( abs ); // Convert small multiplier to array for long multiplication.
    }

    // Choose between Karatsuba and long multiplication.
    if ( useKaratsuba( a.length, b.length ) ) {
      return new BigInteger( multiplyKaratsuba( a, b ), sign );
    }
    return new BigInteger( multiplyLong( a, b ), sign );
  };
  BigInteger.prototype.times = BigInteger.prototype.multiply; // Alias 'times' for 'multiply'.

  // Helper for multiplying a small number by a digit array.
  function multiplySmallAndArray( a, b, sign ) {
    if ( a < BASE ) {
      return new BigInteger( multiplySmall( b, a ), sign );
    }
    return new BigInteger( multiplyLong( b, smallToArray( a ) ), sign );
  }

  // SmallInteger specific multiplication helper.
  SmallInteger.prototype._multiplyBySmall = function ( a ) {
    // If both are small and result fits, use native multiplication.
    if ( isPrecise( a.value * this.value ) ) {
      return new SmallInteger( a.value * this.value );
    }
    // Otherwise, convert to BigInteger multiplication.
    return multiplySmallAndArray( Math.abs( a.value ), smallToArray( Math.abs( this.value ) ), this.sign !== a.sign );
  };

  // BigInteger specific multiplication helper.
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
    return multiplySmallAndArray( Math.abs( a.value ), this.value, this.sign !== a.sign );
  };

  // SmallInteger multiplication method.
  SmallInteger.prototype.multiply = function ( v ) {
    // Delegate to the other number's _multiplyBySmall method.
    return parseValue( v )._multiplyBySmall( this );
  };
  SmallInteger.prototype.times = SmallInteger.prototype.multiply; // Alias 'times' for 'multiply'.

  // NativeBigInt multiplication method.
  NativeBigInt.prototype.multiply = function ( v ) {
    return new NativeBigInt( this.value * parseValue( v ).value );
  };
  NativeBigInt.prototype.times = NativeBigInt.prototype.multiply; // Alias 'times' for 'multiply'.

  // --- Arithmetic Operations: Squaring ---

  // Squares an array of digits.
  function square( a ) {
    var l = a.length,
      r = createArray( l + l ), // Result array length is at most 2*l.
      base = BASE,
      product, carry, i, a_i, a_j;

    for ( i = 0; i < l; i++ ) {
      a_i = a[i];
      carry = 0 - a_i * a_i; // Initialize carry with negative square. This is a common optimization.
      for ( var j = i; j < l; j++ ) {
        a_j = a[j];
        product = 2 * ( a_i * a_j ) + r[i + j] + carry; // Double product for i!=j, single for i==j.
        carry = Math.floor( product / base );
        r[i + j] = product - carry * base;
      }
      r[i + l] = carry; // Store final carry for this row.
    }
    trim( r );
    return r;
  }

  // BigInteger square method.
  BigInteger.prototype.square = function () {
    return new BigInteger( square( this.value ), false ); // Square is always positive.
  };

  // SmallInteger square method.
  SmallInteger.prototype.square = function () {
    var value = this.value * this.value;
    if ( isPrecise( value ) ) {
      return new SmallInteger( value );
    }
    return new BigInteger( square( smallToArray( Math.abs( this.value ) ) ), false );
  };

  // NativeBigInt square method.
  NativeBigInt.prototype.square = function ( v ) {
    return new NativeBigInt( this.value * this.value );
  };

  // --- Arithmetic Operations: Division and Modulo ---

  // Division with remainder using Knuth's Algorithm D (normalized divisor).
  function divMod1( a, b ) {
    var a_l = a.length,
      b_l = b.length,
      base = BASE,
      result = createArray( b.length ), // Quotient digits.
      divisorMostSignificantDigit = b[b_l - 1], // Most significant digit of divisor.
      lambda = Math.ceil( base / ( 2 * divisorMostSignificantDigit ) ), // Normalization factor.
      remainder = multiplySmall( a, lambda ), // Normalized remainder.
      divisor = multiplySmall( b, lambda ), // Normalized divisor.
      quotientDigit, shift, carry, borrow, i, l, q;

    // Adjust array lengths after normalization.
    if ( remainder.length <= a_l ) {
      remainder.push( 0 );
    }
    divisor.push( 0 ); // Pad divisor for easier calculations.
    divisorMostSignificantDigit = divisor[b_l - 1]; // Update after padding.

    // Main loop for calculating quotient digits.
    for ( shift = a_l - b_l; shift >= 0; shift-- ) {
      quotientDigit = base - 1; // Initial guess for quotient digit.

      // Refine guess if leading digits are different.
      if ( remainder[shift + b_l] !== divisorMostSignificantDigit ) {
        quotientDigit = Math.floor( ( remainder[shift + b_l] * base + remainder[shift + b_l - 1] ) / divisorMostSignificantDigit );
      }

      carry = 0;
      borrow = 0;
      l = divisor.length;

      // Perform trial subtraction (quotientDigit * divisor) from remainder.
      for ( i = 0; i < l; i++ ) {
        carry += quotientDigit * divisor[i];
        q = Math.floor( carry / base );
        borrow += remainder[shift + i] - ( carry - q * base ); // Borrow for subtraction.
        carry = q;
        if ( borrow < 0 ) {
          remainder[shift + i] = borrow + base;
          borrow = -1;
        } else {
          remainder[shift + i] = borrow;
          borrow = 0;
        }
      }

      // Adjust quotient digit if trial subtraction resulted in negative remainder.
      while ( borrow !== 0 ) {
        quotientDigit -= 1;
        carry = 0;
        for ( i = 0; i < l; i++ ) {
          carry += remainder[shift + i] - base + divisor[i]; // Add back divisor.
          if ( carry < 0 ) {
            remainder[shift + i] = carry + base;
            carry = 0;
          } else {
            remainder[shift + i] = carry;
            carry = 1;
          }
        }
        borrow += carry; // Update total borrow.
      }
      result[shift] = quotientDigit; // Store final quotient digit.
    }

    // Denormalize the remainder.
    remainder = divModSmall( remainder, lambda )[0];
    return [ arrayToSmall( result ), arrayToSmall( remainder ) ]; // Return quotient and remainder.
  }

  // Alternative division algorithm (simpler, less efficient for very large numbers).
  function divMod2( a, b ) {
    var a_l = a.length,
      b_l = b.length,
      result = [],
      part = [],
      base = BASE,
      guess, xlen, highx, highy, check;

    while ( a_l ) {
      part.unshift( a[--a_l] ); // Take digits from 'a' one by one.
      trim( part ); // Keep 'part' normalized.

      if ( compareAbs( part, b ) < 0 ) { // If current part is smaller than divisor.
        result.push( 0 ); // Quotient digit is 0.
        continue;
      }

      xlen = part.length;
      highx = part[xlen - 1] * base + part[xlen - 2]; // Top two digits of part.
      highy = b[b_l - 1] * base + b[b_l - 2]; // Top two digits of divisor.

      if ( xlen > b_l ) {
        highx = ( highx + 1 ) * base; // Adjust for length difference.
      }

      guess = Math.ceil( highx / highy ); // Initial guess for quotient digit.

      // Refine guess by trial multiplication and subtraction.
      do {
        check = multiplySmall( b, guess );
        if ( compareAbs( check, part ) <= 0 ) {
          break;
        }
        guess--;
      } while ( guess );

      result.push( guess ); // Store quotient digit.
      part = subtract( part, check ); // Update remainder part.
    }
    result.reverse(); // Digits were pushed in reverse order.
    return [ arrayToSmall( result ), arrayToSmall( part ) ]; // Return quotient and remainder.
  }

  // Divides an array of digits by a small number.
  function divModSmall( value, lambda ) {
    var length = value.length,
      quotient = createArray( length ),
      base = BASE,
      i, q, remainder, divisor;

    remainder = 0;
    // Process digits from most significant to least significant.
    for ( i = length - 1; i >= 0; --i ) {
      divisor = remainder * base + value[i];
      q = truncate( divisor / lambda ); // Quotient digit.
      remainder = divisor - q * lambda; // New remainder.
      quotient[i] = q | 0; // Store quotient digit.
    }
    return [ quotient, remainder | 0 ]; // Return quotient array and final remainder.
  }

  // Generic division and modulo function, handles different types and signs.
  function divModAny( self, v ) {
    var value, n = parseValue( v );

    // Use native BigInt if available.
    if ( supportsNativeBigInt ) {
      return [ new NativeBigInt( self.value / n.value ), new NativeBigInt( self.value % n.value ) ];
    }

    var a = self.value,
      b = n.value;

    // Handle division by zero.
    if ( b === 0 ) {
      throw new Error( "Cannot divide by zero" );
    }

    // Cases for small integers.
    if ( self.isSmall ) {
      if ( n.isSmall ) {
        return [ new SmallInteger( truncate( a / b ) ), new SmallInteger( a % b ) ];
      }
      return [ Integer[0], self ]; // Small divided by large BigInteger is 0 quotient, self as remainder.
    }

    // Cases for BigInteger divided by SmallInteger.
    if ( n.isSmall ) {
      if ( b === 1 ) {
        return [ self, Integer[0] ];
      }
      if ( b == -1 ) {
        return [ self.negate(), Integer[0] ];
      }
      var abs = Math.abs( b );
      if ( abs < BASE ) { // If small divisor fits within a digit.
        value = divModSmall( a, abs );
        quotient = arrayToSmall( value[0] );
        var remainder = value[1];
        if ( self.sign ) {
          remainder = -remainder;
        } // Adjust remainder sign.
        if ( typeof quotient === "number" ) {
          if ( self.sign !== n.sign ) {
            quotient = -quotient;
          } // Adjust quotient sign.
          return [ new SmallInteger( quotient ), new SmallInteger( remainder ) ];
        }
        return [ new BigInteger( quotient, self.sign !== n.sign ), new SmallInteger( remainder ) ];
      }
      b = smallToArray( abs ); // Convert small divisor to array for general division.
    }

    // General BigInteger division.
    var comparison = compareAbs( a, b );
    if ( comparison === -1 ) {
      return [ Integer[0], self ]; // If dividend < divisor (absolute), quotient is 0.
    }
    if ( comparison === 0 ) {
      // If dividend == divisor (absolute), quotient is 1 or -1.
      return [ Integer[self.sign === n.sign ? 1 : -1], Integer[0] ];
    }

    // Choose division algorithm based on length.
    if ( a.length + b.length <= 200 ) { // Heuristic for algorithm selection.
      value = divMod1( a, b );
    } else {
      value = divMod2( a, b );
    }

    quotient = value[0];
    var qSign = self.sign !== n.sign,
      mod = value[1],
      mSign = self.sign; // Remainder takes sign of dividend.

    // Convert results to appropriate Integer types.
    if ( typeof quotient === "number" ) {
      if ( qSign ) {
        quotient = -quotient;
      }
      quotient = new SmallInteger( quotient );
    } else {
      quotient = new BigInteger( quotient, qSign );
    }

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

  // BigInteger divmod method.
  BigInteger.prototype.divmod = function ( v ) {
    var result = divModAny( this, v );
    return {
      quotient: result[0],
      remainder: result[1]
    };
  };
  NativeBigInt.prototype.divmod = SmallInteger.prototype.divmod = BigInteger.prototype.divmod; // Share divmod.

  // BigInteger divide method.
  BigInteger.prototype.divide = function ( v ) {
    return divModAny( this, v )[0];
  };
  NativeBigInt.prototype.over = NativeBigInt.prototype.divide = function ( v ) {
    return new NativeBigInt( this.value / parseValue( v ).value );
  };
  SmallInteger.prototype.over = SmallInteger.prototype.divide = BigInteger.prototype.over = BigInteger.prototype.divide; // Share divide and over.

  // BigInteger mod method.
  BigInteger.prototype.mod = function ( v ) {
    return divModAny( this, v )[1];
  };
  NativeBigInt.prototype.mod = NativeBigInt.prototype.remainder = function ( v ) {
    return new NativeBigInt( this.value % parseValue( v ).value );
  };
  SmallInteger.prototype.remainder = SmallInteger.prototype.mod = BigInteger.prototype.remainder = BigInteger.prototype.mod; // Share mod and remainder.

  // --- Arithmetic Operations: Exponentiation ---

  // BigInteger power method.
  BigInteger.prototype.pow = function ( v ) {
    var n = parseValue( v ),
      a = this.value,
      b = n.value,
      value, x, y;

    // Special cases for exponentiation.
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
      return n.isEven() ? Integer[1] : Integer[-1]; // (-1)^x = 1 if x even, -1 if x odd.
    }

    // Handle negative exponent (result is 0 for integers).
    if ( n.sign ) {
      return Integer[0];
    }

    // Exponent must be a small integer.
    if ( !n.isSmall ) {
      throw new Error( "The exponent " + n.toString() + " is too large." );
    }

    // If base is small, try native Math.pow.
    if ( this.isSmall ) {
      if ( isPrecise( value = Math.pow( a, b ) ) ) {
        return new SmallInteger( truncate( value ) );
      }
    }

    // Binary exponentiation (exponentiation by squaring).
    x = this;
    y = Integer[1]; // Accumulator for the result.
    while ( true ) {
      if ( ( b & 1 ) === 1 ) { // If exponent is odd.
        y = y.times( x );
        --b;
      }
      if ( b === 0 ) {
        break; // Exponent is zero, done.
      }
      b /= 2; // Divide exponent by 2.
      x = x.square(); // Square the base.
    }
    return y;
  };
  SmallInteger.prototype.pow = BigInteger.prototype.pow; // Share power method.

  // NativeBigInt power method.
  NativeBigInt.prototype.pow = function ( v ) {
    var n = parseValue( v );
    var a = this.value,
      b = n.value;
    var _0 = BigInt( 0 ),
      _1 = BigInt( 1 ),
      _2 = BigInt( 2 );

    // Special cases for native BigInt.
    if ( b === _0 ) {
      return Integer[1];
    }
    if ( a === _0 ) {
      return Integer[0];
    }
    if ( a === _1 ) {
      return Integer[1];
    }
    if ( a === BigInt( -1 ) ) {
      return n.isEven() ? Integer[1] : Integer[-1];
    }

    // Negative exponent for native BigInt.
    if ( n.isNegative() ) {
      return new NativeBigInt( _0 ); // Result is 0 for integer power.
    }

    // Binary exponentiation for native BigInt.
    var x = this;
    var y = Integer[1];
    while ( true ) {
      if ( ( b & _1 ) === _1 ) {
        y = y.times( x );
        --b;
      }
      if ( b === _0 ) {
        break;
      }
      b /= _2;
      x = x.square();
    }
    return y;
  };

  // Modular exponentiation (base^exp % mod).
  BigInteger.prototype.modPow = function ( exp, mod ) {
    exp = parseValue( exp );
    mod = parseValue( mod );

    if ( mod.isZero() ) {
      throw new Error( "Cannot take modPow with modulus 0" );
    }

    var r = Integer[1], // Result accumulator.
      base = this.mod( mod ); // Base reduced modulo mod.

    // Handle negative exponent (modular inverse needed).
    if ( exp.isNegative() ) {
      exp = exp.multiply( Integer[-1] ); // Make exponent positive.
      base = base.modInv( mod ); // Calculate modular inverse of base.
    }

    // Binary exponentiation with modulo.
    while ( exp.isPositive() ) {
      if ( base.isZero() ) {
        return Integer[0]; // If base is 0, result is 0.
      }
      if ( exp.isOdd() ) {
        r = r.multiply( base ).mod( mod ); // If exponent is odd, multiply result.
      }
      exp = exp.divide( 2 ); // Divide exponent by 2.
      base = base.square().mod( mod ); // Square base modulo mod.
    }
    return r;
  };
  NativeBigInt.prototype.modPow = SmallInteger.prototype.modPow = BigInteger.prototype.modPow; // Share modPow.

  // --- Comparison Operations ---

  // Compares absolute values of two digit arrays.
  function compareAbs( a, b ) {
    if ( a.length !== b.length ) {
      return a.length > b.length ? 1 : -1; // Longer array is larger.
    }
    // Compare digits from most significant to least significant.
    for ( var i = a.length - 1; i >= 0; i-- ) {
      if ( a[i] !== b[i] ) {
        return a[i] > b[i] ? 1 : -1;
      }
    }
    return 0; // Arrays are equal.
  }

  // BigInteger compare absolute value method.
  BigInteger.prototype.compareAbs = function ( v ) {
    var n = parseValue( v ),
      a = this.value,
      b = n.value;

    if ( n.isSmall ) {
      return 1; // BigInteger is always absolutely larger than SmallInteger.
    }
    return compareAbs( a, b );
  };

  // SmallInteger compare absolute value method.
  SmallInteger.prototype.compareAbs = function ( v ) {
    var n = parseValue( v ),
      a = Math.abs( this.value ),
      b = n.value;

    if ( n.isSmall ) {
      b = Math.abs( b );
      return a === b ? 0 : a > b ? 1 : -1;
    }
    return -1; // SmallInteger is always absolutely smaller than BigInteger.
  };

  // NativeBigInt compare absolute value method.
  NativeBigInt.prototype.compareAbs = function ( v ) {
    var a = this.value;
    var b = parseValue( v ).value;
    a = a >= 0 ? a : -a; // Absolute value for native BigInt.
    b = b >= 0 ? b : -b;
    return a === b ? 0 : a > b ? 1 : -1;
  };

  // BigInteger general comparison method.
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

    // Handle different signs.
    if ( this.sign !== n.sign ) {
      return n.sign ? 1 : -1; // If this is positive and n is negative, this is greater.
    }

    // If 'n' is a SmallInteger, and 'this' is BigInteger, 'this' is larger (or smaller if negative).
    if ( n.isSmall ) {
      return this.sign ? -1 : 1;
    }

    // Compare absolute values and apply sign.
    return compareAbs( a, b ) * ( this.sign ? -1 : 1 );
  };
  BigInteger.prototype.compareTo = BigInteger.prototype.compare; // Alias 'compareTo' for 'compare'.

  // SmallInteger general comparison method.
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

    // If 'n' is also small, use native comparison.
    if ( n.isSmall ) {
      return a == b ? 0 : a > b ? 1 : -1;
    }

    // If signs are different.
    if ( a < 0 !== n.sign ) {
      return a < 0 ? -1 : 1; // If this is negative and n is positive, this is smaller.
    }

    // If same sign, and 'n' is BigInteger, then 'this' (SmallInteger) is smaller.
    return a < 0 ? 1 : -1; // If both negative, small integer is 'larger' (closer to zero).
  };
  SmallInteger.prototype.compareTo = SmallInteger.prototype.compare; // Alias 'compareTo' for 'compare'.

  // NativeBigInt general comparison method.
  NativeBigInt.prototype.compare = function ( v ) {
    if ( v === Infinity ) {
      return -1;
    }
    if ( v === -Infinity ) {
      return 1;
    }

    var a = this.value;
    var b = parseValue( v ).value;
    return a === b ? 0 : a > b ? 1 : -1;
  };
  NativeBigInt.prototype.compareTo = NativeBigInt.prototype.compare; // Alias 'compareTo' for 'compare'.

  // --- Equality and Inequality ---

  BigInteger.prototype.equals = function ( v ) {
    return this.compare( v ) === 0;
  };
  NativeBigInt.prototype.eq = NativeBigInt.prototype.equals = SmallInteger.prototype.eq = SmallInteger.prototype.equals = BigInteger.prototype.eq = BigInteger.prototype.equals;

  BigInteger.prototype.notEquals = function ( v ) {
    return this.compare( v ) !== 0;
  };
  NativeBigInt.prototype.neq = NativeBigInt.prototype.notEquals = SmallInteger.prototype.neq = SmallInteger.prototype.notEquals = BigInteger.prototype.neq = BigInteger.prototype.notEquals;

  BigInteger.prototype.greater = function ( v ) {
    return this.compare( v ) > 0;
  };
  NativeBigInt.prototype.gt = NativeBigInt.prototype.greater = SmallInteger.prototype.gt = SmallInteger.prototype.greater = BigInteger.prototype.gt = BigInteger.prototype.greater;

  BigInteger.prototype.lesser = function ( v ) {
    return this.compare( v ) < 0;
  };
  NativeBigInt.prototype.lt = NativeBigInt.prototype.lesser = SmallInteger.prototype.lt = SmallInteger.prototype.lesser = BigInteger.prototype.lt = BigInteger.prototype.lesser;

  BigInteger.prototype.greaterOrEquals = function ( v ) {
    return this.compare( v ) >= 0;
  };
  NativeBigInt.prototype.geq = NativeBigInt.prototype.greaterOrEquals = SmallInteger.prototype.geq = SmallInteger.prototype.greaterOrEquals = BigInteger.prototype.geq = BigInteger.prototype.greaterOrEquals;

  BigInteger.prototype.lesserOrEquals = function ( v ) {
    return this.compare( v ) <= 0;
  };
  NativeBigInt.prototype.leq = NativeBigInt.prototype.lesserOrEquals = SmallInteger.prototype.leq = SmallInteger.prototype.lesserOrEquals = BigInteger.prototype.leq = BigInteger.prototype.lesserOrEquals;

  // --- Property Checkers ---

  BigInteger.prototype.isEven = function () {
    return ( this.value[0] & 1 ) === 0; // Check least significant digit.
  };
  SmallInteger.prototype.isEven = function () {
    return ( this.value & 1 ) === 0; // Check native number.
  };
  NativeBigInt.prototype.isEven = function () {
    return ( this.value & BigInt( 1 ) ) === BigInt( 0 ); // Check native BigInt.
  };

  BigInteger.prototype.isOdd = function () {
    return ( this.value[0] & 1 ) === 1;
  };
  SmallInteger.prototype.isOdd = function () {
    return ( this.value & 1 ) === 1;
  };
  NativeBigInt.prototype.isOdd = function () {
    return ( this.value & BigInt( 1 ) ) === BigInt( 1 );
  };

  BigInteger.prototype.isPositive = function () {
    return !this.sign; // Not negative.
  };
  SmallInteger.prototype.isPositive = function () {
    return this.value > 0;
  };
  NativeBigInt.prototype.isPositive = SmallInteger.prototype.isPositive; // Share for native BigInt.

  BigInteger.prototype.isNegative = function () {
    return this.sign; // Is negative.
  };
  SmallInteger.prototype.isNegative = function () {
    return this.value < 0;
  };
  NativeBigInt.prototype.isNegative = SmallInteger.prototype.isNegative; // Share for native BigInt.

  BigInteger.prototype.isUnit = function () {
    return false; // A BigInteger cannot be 1 or -1 unless it's a SmallInteger representation.
  };
  SmallInteger.prototype.isUnit = function () {
    return Math.abs( this.value ) === 1;
  };
  NativeBigInt.prototype.isUnit = function () {
    return this.abs().value === BigInt( 1 );
  };

  BigInteger.prototype.isZero = function () {
    return false; // A BigInteger cannot be 0 unless it's a SmallInteger representation.
  };
  SmallInteger.prototype.isZero = function () {
    return this.value === 0;
  };
  NativeBigInt.prototype.isZero = function () {
    return this.value === BigInt( 0 );
  };

  // Checks if a number is divisible by another.
  BigInteger.prototype.isDivisibleBy = function ( v ) {
    var n = parseValue( v );
    if ( n.isZero() ) {
      return false; // Cannot divide by zero.
    }
    if ( n.isUnit() ) {
      return true; // Divisible by 1 or -1.
    }
    if ( n.compareAbs( 2 ) === 0 ) {
      return this.isEven(); // Divisible by 2 if even.
    }
    return this.mod( n ).isZero(); // Check if remainder is zero.
  };
  NativeBigInt.prototype.isDivisibleBy = SmallInteger.prototype.isDivisibleBy = BigInteger.prototype.isDivisibleBy; // Share isDivisibleBy.

  // --- Primality Testing ---

  // Basic primality test for small numbers.
  function isBasicPrime( v ) {
    var n = v.abs();
    if ( n.isUnit() ) {
      return false; // 1 is not prime.
    }
    if ( n.equals( 2 ) || n.equals( 3 ) || n.equals( 5 ) ) {
      return true; // 2, 3, 5 are prime.
    }
    if ( n.isEven() || n.isDivisibleBy( 3 ) || n.isDivisibleBy( 5 ) ) {
      return false; // Divisible by 2, 3, or 5 (and not 2,3,5 itself) is not prime.
    }
    if ( n.lesser( 49 ) ) {
      return true; // Numbers less than 49 (7*7) that passed above tests are prime.
    }
  }

  // Miller-Rabin primality test.
  function millerRabinTest( n, a ) {
    var nPrev = n.prev(),
      b = nPrev,
      r = 0,
      d, t, i, x;

    // Find r and d such that n-1 = 2^r * d, with d odd.
    while ( b.isEven() ) {
      b = b.divide( 2 );
      r++;
    }

    next:
      for ( i = 0; i < a.length; i++ ) {
        if ( n.lesser( a[i] ) ) {
          continue; // Skip if 'a' is larger than 'n'.
        }
        x = bigInt( a[i] ).modPow( b, n ); // x = a^d mod n.

        if ( x.isUnit() || x.equals( nPrev ) ) {
          continue; // Passes first condition of Miller-Rabin.
        }

        // Check if x^(2^j) mod n = n-1 for some 0 <= j < r.
        for ( d = r - 1; d != 0; d-- ) {
          x = x.square().mod( n );
          if ( x.isUnit() ) {
            return false; // Composite.
          }
          if ( x.equals( nPrev ) ) {
            continue next; // Passes second condition.
          }
        }
        return false; // Composite.
      }
    return true; // Probably prime.
  }

  // BigInteger primality test.
  BigInteger.prototype.isPrime = function ( strict ) {
    var isPrime = isBasicPrime( this );
    if ( isPrime !== undefined ) {
      return isPrime;
    }

    var n = this.abs();
    var bits = n.bitLength();

    // Use fixed set of bases for smaller numbers.
    if ( bits <= 64 ) {
      return millerRabinTest( n, [ 2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37 ] );
    }

    // For larger numbers, use a number of random bases.
    var logN = Math.log( 2 ) * bits.toJSNumber();
    var t = Math.ceil( strict === true ? 2 * Math.pow( logN, 2 ) : logN ); // Number of iterations.

    var a = [];
    for ( var i = 0; i < t; i++ ) {
      a.push( bigInt( i + 2 ) ); // Use sequential bases for deterministic primality.
    }
    return millerRabinTest( n, a );
  };
  NativeBigInt.prototype.isPrime = SmallInteger.prototype.isPrime = BigInteger.prototype.isPrime; // Share isPrime.

  // BigInteger probable primality test (uses random bases).
  BigInteger.prototype.isProbablePrime = function ( iterations, rng ) {
    var isPrime = isBasicPrime( this );
    if ( isPrime !== undefined ) {
      return isPrime;
    }

    var n = this.abs();
    var t = iterations === undefined ? 5 : iterations; // Default to 5 iterations.

    var a = [];
    for ( var i = 0; i < t; i++ ) {
      a.push( bigInt.randBetween( 2, n.minus( 2 ), rng ) ); // Generate random bases.
    }
    return millerRabinTest( n, a );
  };
  NativeBigInt.prototype.isProbablePrime = SmallInteger.prototype.isProbablePrime = BigInteger.prototype.isProbablePrime; // Share isProbablePrime.

  // --- Modular Inverse ---

  // Extended Euclidean Algorithm for modular inverse.
  BigInteger.prototype.modInv = function ( n ) {
    var t = bigInt.zero,
      newT = bigInt.one,
      r = parseValue( n ),
      newR = this.abs(),
      q, lastT, lastR;

    // Euclidean algorithm.
    while ( !newR.isZero() ) {
      q = r.divide( newR );
      lastT = t;
      lastR = r;
      t = newT;
      r = newR;
      newT = lastT.subtract( q.multiply( newT ) );
      newR = lastR.subtract( q.multiply( newR ) );
    }

    if ( !r.isUnit() ) {
      throw new Error( this.toString() + " and " + n.toString() + " are not co-prime" );
    }

    if ( t.compare( 0 ) === -1 ) {
      t = t.add( n ); // Ensure result is positive.
    }

    if ( this.isNegative() ) {
      return t.negate(); // Adjust sign if original number was negative.
    }
    return t;
  };
  NativeBigInt.prototype.modInv = SmallInteger.prototype.modInv = BigInteger.prototype.modInv; // Share modInv.

  // --- Increment/Decrement ---

  // BigInteger next (increment by 1).
  BigInteger.prototype.next = function () {
    var value = this.value;
    if ( this.sign ) {
      return subtractSmall( value, 1, this.sign ); // If negative, increment means subtracting 1 from absolute value.
    }
    return new BigInteger( addSmall( value, 1 ), this.sign );
  };

  // SmallInteger next (increment by 1).
  SmallInteger.prototype.next = function () {
    var value = this.value;
    if ( value + 1 < MAX_INT ) {
      return new SmallInteger( value + 1 );
    }
    return new BigInteger( MAX_INT_ARR, false ); // Overflow to BigInteger.
  };

  // NativeBigInt next (increment by 1).
  NativeBigInt.prototype.next = function () {
    return new NativeBigInt( this.value + BigInt( 1 ) );
  };

  // BigInteger prev (decrement by 1).
  BigInteger.prototype.prev = function () {
    var value = this.value;
    if ( this.sign ) {
      return new BigInteger( addSmall( value, 1 ), true ); // If negative, decrement means adding 1 to absolute value.
    }
    return subtractSmall( value, 1, this.sign );
  };

  // SmallInteger prev (decrement by 1).
  SmallInteger.prototype.prev = function () {
    var value = this.value;
    if ( value - 1 > -MAX_INT ) {
      return new SmallInteger( value - 1 );
    }
    return new BigInteger( MAX_INT_ARR, true ); // Underflow to BigInteger.
  };

  // NativeBigInt prev (decrement by 1).
  NativeBigInt.prototype.prev = function () {
    return new NativeBigInt( this.value - BigInt( 1 ) );
  };

  // --- Bitwise Operations ---

  // Pre-calculate powers of 2 for efficient shifting.
  var powersOfTwo = [ 1 ];
  while ( 2 * powersOfTwo[powersOfTwo.length - 1] <= BASE ) {
    powersOfTwo.push( 2 * powersOfTwo[powersOfTwo.length - 1] );
  }
  var powers2Length = powersOfTwo.length,
    highestPower2 = powersOfTwo[powers2Length - 1];

  // Checks if a shift amount is small enough to be handled directly.
  function shift_isSmall( n ) {
    return Math.abs( n ) <= BASE;
  }

  // BigInteger left shift.
  BigInteger.prototype.shiftLeft = function ( v ) {
    var n = parseValue( v ).toJSNumber();
    if ( !shift_isSmall( n ) ) {
      throw new Error( String( n ) + " is too large for shifting." );
    }
    if ( n < 0 ) {
      return this.shiftRight( -n ); // Negative shift left is shift right.
    }

    var result = this;
    if ( result.isZero() ) {
      return result;
    }

    // Apply shifts in chunks of powers2Length - 1.
    while ( n >= powers2Length ) {
      result = result.multiply( highestPower2 );
      n -= powers2Length - 1;
    }
    return result.multiply( powersOfTwo[n] ); // Apply remaining shift.
  };
  NativeBigInt.prototype.shiftLeft = SmallInteger.prototype.shiftLeft = BigInteger.prototype.shiftLeft; // Share shiftLeft.

  // BigInteger right shift.
  BigInteger.prototype.shiftRight = function ( v ) {
    var remQuo;
    var n = parseValue( v ).toJSNumber();
    if ( !shift_isSmall( n ) ) {
      throw new Error( String( n ) + " is too large for shifting." );
    }
    if ( n < 0 ) {
      return this.shiftLeft( -n ); // Negative shift right is shift left.
    }

    var result = this;

    // Apply shifts in chunks.
    while ( n >= powers2Length ) {
      if ( result.isZero() || result.isNegative() && result.isUnit() ) {
        return result; // Shifting 0 or -1 right results in 0 or -1.
      }
      remQuo = divModAny( result, highestPower2 );
      result = remQuo[1].isNegative() ? remQuo[0].prev() : remQuo[0]; // Adjust for negative remainder.
      n -= powers2Length - 1;
    }
    remQuo = divModAny( result, powersOfTwo[n] );
    return remQuo[1].isNegative() ? remQuo[0].prev() : remQuo[0]; // Final adjustment.
  };
  NativeBigInt.prototype.shiftRight = SmallInteger.prototype.shiftRight = BigInteger.prototype.shiftRight; // Share shiftRight.

  // Generic bitwise operation helper.
  function bitwise( x, y, fn ) {
    y = parseValue( y );
    var xSign = x.isNegative(),
      ySign = y.isNegative();

    // Convert to two's complement for negative numbers.
    var xRem = xSign ? x.not() : x,
      yRem = ySign ? y.not() : y;

    var xDigit = 0,
      yDigit = 0;
    var xDivMod = null,
      yDivMod = null;
    var result = [];

    // Process digits from least significant to most significant.
    while ( !xRem.isZero() || !yRem.isZero() ) {
      xDivMod = divModAny( xRem, highestPower2 );
      xDigit = xDivMod[1].toJSNumber();
      if ( xSign ) {
        xDigit = highestPower2 - 1 - xDigit; // Two's complement for current digit.
      }

      yDivMod = divModAny( yRem, highestPower2 );
      yDigit = yDivMod[1].toJSNumber();
      if ( ySign ) {
        yDigit = highestPower2 - 1 - yDigit; // Two's complement for current digit.
      }

      xRem = xDivMod[0];
      yRem = yDivMod[0];

      result.push( fn( xDigit, yDigit ) ); // Apply bitwise function.
    }

    // Determine sign of the result.
    var sum = fn( xSign ? 1 : 0, ySign ? 1 : 0 ) !== 0 ? bigInt( -1 ) : bigInt( 0 );

    // Reconstruct the result from digits.
    for ( var i = result.length - 1; i >= 0; i -= 1 ) {
      sum = sum.multiply( highestPower2 ).add( bigInt( result[i] ) );
    }
    return sum;
  }

  // Bitwise NOT.
  BigInteger.prototype.not = function () {
    return this.negate().prev(); // ~x = -x - 1.
  };
  NativeBigInt.prototype.not = SmallInteger.prototype.not = BigInteger.prototype.not; // Share not.

  // Bitwise AND.
  BigInteger.prototype.and = function ( n ) {
    return bitwise( this, n, function ( a, b ) {
      return a & b;
    } );
  };
  NativeBigInt.prototype.and = SmallInteger.prototype.and = BigInteger.prototype.and; // Share and.

  // Bitwise OR.
  BigInteger.prototype.or = function ( n ) {
    return bitwise( this, n, function ( a, b ) {
      return a | b;
    } );
  };
  NativeBigInt.prototype.or = SmallInteger.prototype.or = BigInteger.prototype.or; // Share or.

  // Bitwise XOR.
  BigInteger.prototype.xor = function ( n ) {
    return bitwise( this, n, function ( a, b ) {
      return a ^ b;
    } );
  };
  NativeBigInt.prototype.xor = SmallInteger.prototype.xor = BigInteger.prototype.xor; // Share xor.

  // --- Other Mathematical Functions ---

  // Lowest One Bit mask for small numbers and BigInt arrays.
  var LOBMASK_I = 1 << 30, // Mask for native numbers.
    LOBMASK_BI = ( BASE & -BASE ) * ( BASE & -BASE ) | LOBMASK_I; // Mask for BigInt digits.

  // Rough calculation of Lowest One Bit (LOB).
  function roughLOB( n ) {
    var v = n.value,
      x = typeof v === "number" ? v | LOBMASK_I : typeof v === "bigint" ? v | BigInt( LOBMASK_I ) : v[0] + v[1] * BASE | LOBMASK_BI;
    return x & -x; // Classic trick to get LOB.
  }

  // Integer logarithm (base 2 for bitLength).
  function integerLogarithm( value, base ) {
    if ( base.compareTo( value ) <= 0 ) {
      var tmp = integerLogarithm( value, base.square( base ) );
      var p = tmp.p;
      var e = tmp.e;
      var t = p.multiply( base );
      return t.compareTo( value ) <= 0 ? {
        p: t,
        e: e * 2 + 1
      } : {
        p: p,
        e: e * 2
      };
    }
    return {
      p: bigInt( 1 ),
      e: 0
    };
  }

  // Calculates the number of bits required to represent the number.
  BigInteger.prototype.bitLength = function () {
    var n = this;
    if ( n.compareTo( bigInt( 0 ) ) < 0 ) {
      n = n.negate().subtract( bigInt( 1 ) ); // For negative numbers, bitLength of two's complement.
    }
    if ( n.compareTo( bigInt( 0 ) ) === 0 ) {
      return bigInt( 0 );
    }
    return bigInt( integerLogarithm( n, bigInt( 2 ) ).e ).add( bigInt( 1 ) );
  };
  NativeBigInt.prototype.bitLength = SmallInteger.prototype.bitLength = BigInteger.prototype.bitLength; // Share bitLength.

  // Returns the maximum of two numbers.
  function max( a, b ) {
    a = parseValue( a );
    b = parseValue( b );
    return a.greater( b ) ? a : b;
  }

  // Returns the minimum of two numbers.
  function min( a, b ) {
    a = parseValue( a );
    b = parseValue( b );
    return a.lesser( b ) ? a : b;
  }

  // Calculates the greatest common divisor (GCD) using Binary GCD algorithm.
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

    var c = Integer[1],
      d, t;

    // Remove common factors of 2.
    while ( a.isEven() && b.isEven() ) {
      d = min( roughLOB( a ), roughLOB( b ) );
      a = a.divide( d );
      b = b.divide( d );
      c = c.multiply( d );
    }

    // Remove factors of 2 from 'a'.
    while ( a.isEven() ) {
      a = a.divide( roughLOB( a ) );
    }

    do {
      // Remove factors of 2 from 'b'.
      while ( b.isEven() ) {
        b = b.divide( roughLOB( b ) );
      }
      // Ensure 'a' is always the smaller of the two.
      if ( a.greater( b ) ) {
        t = b;
        b = a;
        a = t;
      }
      b = b.subtract( a ); // b = (b - a).
    } while ( !b.isZero() );

    return c.isUnit() ? a : a.multiply( c ); // Multiply back common factors of 2.
  }

  // Calculates the least common multiple (LCM).
  function lcm( a, b ) {
    a = parseValue( a ).abs();
    b = parseValue( b ).abs();
    return a.divide( gcd( a, b ) ).multiply( b ); // LCM(a,b) = |a*b| / GCD(a,b).
  }

  // Generates a random number between a and b (inclusive).
  function randBetween( a, b, rng ) {
    a = parseValue( a );
    b = parseValue( b );
    var usedRNG = rng || Math.random; // Use provided RNG or Math.random.

    var low = min( a, b ),
      high = max( a, b );
    var range = high.subtract( low ).add( 1 ); // Range size.

    if ( range.isSmall ) {
      return low.add( Math.floor( usedRNG() * range ) ); // If range is small, use native random.
    }

    var digits = toBase( range, BASE ).value; // Convert range to array of digits.
    var result = [],
      restricted = true;

    // Generate random digits, ensuring the result is within range.
    for ( var i = 0; i < digits.length; i++ ) {
      var top = restricted ? digits[i] : BASE;
      var digit = truncate( usedRNG() * top );
      result.push( digit );
      if ( digit < top ) {
        restricted = false;
      } // Once a digit is less than its max, subsequent digits can be anything up to BASE-1.
    }
    return low.add( Integer.fromArray( result, BASE, false ) );
  }

  // --- Base Conversion and String Representation ---

  // Parses a string representation of a number in a given base.
  var parseBase = function ( text, base, alphabet, caseSensitive ) {
    alphabet = alphabet || DEFAULT_ALPHABET;
    text = String( text );

    if ( !caseSensitive ) {
      text = text.toLowerCase();
      alphabet = alphabet.toLowerCase();
    }

    var length = text.length;
    var i;
    var absBase = Math.abs( base );
    var alphabetValues = {};

    // Map alphabet characters to their numeric values.
    for ( i = 0; i < alphabet.length; i++ ) {
      alphabetValues[alphabet[i]] = i;
    }

    // Validate input string.
    for ( i = 0; i < length; i++ ) {
      var c = text[i];
      if ( c === "-" ) {
        continue;
      }
      if ( c in alphabetValues ) {
        if ( alphabetValues[c] >= absBase ) {
          if ( c === "1" && absBase === 1 ) {
            continue;
          } // Special case for base 1.
          throw new Error( c + " is not a valid digit in base " + base + "." );
        }
      }
    }

    base = parseValue( base ); // Convert base to an Integer.
    var digits = [];
    var isNegative = text[0] === "-";

    // Extract digits from the input string.
    for ( i = isNegative ? 1 : 0; i < text.length; i++ ) {
      var c = text[i];
      if ( c in alphabetValues ) {
        digits.push( parseValue( alphabetValues[c] ) );
      } else if ( c === "<" ) { // Handle custom multi-char digits (e.g., "<10>").
        var start = i;
        do {
          i++;
        } while ( text[i] !== ">" && i < text.length );
        digits.push( parseValue( text.slice( start + 1, i ) ) );
      } else {
        throw new Error( c + " is not a valid character" );
      }
    }
    return parseBaseFromArray( digits, base, isNegative );
  };

  // Converts an array of digits in a given base to an Integer.
  function parseBaseFromArray( digits, base, isNegative ) {
    var val = Integer[0],
      pow = Integer[1],
      i;

    // Horner's method for base conversion: sum(digit * base^power).
    for ( i = digits.length - 1; i >= 0; i-- ) {
      val = val.add( digits[i].times( pow ) );
      pow = pow.times( base );
    }
    return isNegative ? val.negate() : val;
  }

  // Converts a single digit to its string representation using the alphabet.
  function stringify( digit, alphabet ) {
    alphabet = alphabet || DEFAULT_ALPHABET;
    if ( digit < alphabet.length ) {
      return alphabet[digit];
    }
    return "<" + digit + ">"; // For digits larger than alphabet size.
  }

  // Converts an Integer to an array of digits in a given base.
  function toBase( n, base ) {
    base = bigInt( base );

    if ( base.isZero() ) {
      if ( n.isZero() ) {
        return {
          value: [ 0 ],
          isNegative: false
        };
      }
      throw new Error( "Cannot convert nonzero numbers to base 0." );
    }
    if ( base.equals( -1 ) ) {
      if ( n.isZero() ) {
        return {
          value: [ 0 ],
          isNegative: false
        };
      }
      if ( n.isNegative() ) {
        // Representation for negative numbers in base -1 is complex.
        return {
          value: [].concat.apply( [], Array.apply( null, Array( -n.toJSNumber() ) ).map( Array.prototype.valueOf, [ 1, 0 ] ) ),
          isNegative: false
        };
      }
      var arr = Array.apply( null, Array( n.toJSNumber() - 1 ) ).map( Array.prototype.valueOf, [ 0, 1 ] );
      arr.unshift( [ 1 ] );
      return {
        value: [].concat.apply( [], arr ),
        isNegative: false
      };
    }

    var neg = false;
    if ( n.isNegative() && base.isPositive() ) {
      neg = true;
      n = n.abs();
    }

    if ( base.isUnit() ) {
      if ( n.isZero() ) {
        return {
          value: [ 0 ],
          isNegative: false
        };
      }
      // In base 1 (unary), it's just 'n' ones.
      return {
        value: Array.apply( null, Array( n.toJSNumber() ) ).map( Number.prototype.valueOf, 1 ),
        isNegative: neg
      };
    }

    var out = [];
    var left = n,
      divmod;

    // Repeatedly divide by base and collect remainders.
    while ( left.isNegative() || left.compareAbs( base ) >= 0 ) {
      divmod = left.divmod( base );
      left = divmod.quotient;
      var digit = divmod.remainder;

      // Handle negative remainders.
      if ( digit.isNegative() ) {
        digit = base.minus( digit ).abs();
        left = left.next();
      }
      out.push( digit.toJSNumber() );
    }
    out.push( left.toJSNumber() ); // Add the last quotient.

    return {
      value: out.reverse(),
      isNegative: neg
    };
  }

  // Converts an Integer to its string representation in a given base.
  function toBaseString( n, base, alphabet ) {
    var arr = toBase( n, base );
    return ( arr.isNegative ? "-" : "" ) + arr.value.map( function ( x ) {
      return stringify( x, alphabet );
    } ).join( "" );
  }

  // BigInteger toArray method.
  BigInteger.prototype.toArray = function ( radix ) {
    return toBase( this, radix );
  };
  SmallInteger.prototype.toArray = function ( radix ) {
    return toBase( this, radix );
  };
  NativeBigInt.prototype.toArray = function ( radix ) {
    return toBase( this, radix );
  };

  // BigInteger toString method.
  BigInteger.prototype.toString = function ( radix, alphabet ) {
    if ( radix === undefined ) {
      radix = 10;
    }
    if ( radix !== 10 ) {
      return toBaseString( this, radix, alphabet ); // Use generic toBaseString for non-decimal.
    }

    var v = this.value,
      l = v.length,
      str = String( v[--l] ), // Start with the most significant digit.
      zeros = "0000000",
      digit;

    // Concatenate digits, padding with zeros as needed.
    while ( --l >= 0 ) {
      digit = String( v[l] );
      str += zeros.slice( digit.length ) + digit;
    }
    var sign = this.sign ? "-" : "";
    return sign + str;
  };

  // SmallInteger toString method.
  SmallInteger.prototype.toString = function ( radix, alphabet ) {
    if ( radix === undefined ) {
      radix = 10;
    }
    if ( radix != 10 ) {
      return toBaseString( this, radix, alphabet );
    }
    return String( this.value );
  };
  NativeBigInt.prototype.toString = SmallInteger.prototype.toString; // NativeBigInt uses its internal toString.

  // JSON serialization.
  NativeBigInt.prototype.toJSON = BigInteger.prototype.toJSON = SmallInteger.prototype.toJSON = function () {
    return this.toString();
  };

  // ValueOf and toJSNumber methods.
  BigInteger.prototype.valueOf = function () {
    // This can lose precision for large BigIntegers.
    return parseInt( this.toString(), 10 );
  };
  BigInteger.prototype.toJSNumber = BigInteger.prototype.valueOf;

  SmallInteger.prototype.valueOf = function () {
    return this.value;
  };
  SmallInteger.prototype.toJSNumber = SmallInteger.prototype.valueOf;

  NativeBigInt.prototype.valueOf = NativeBigInt.prototype.toJSNumber = function () {
    // This can lose precision for large NativeBigInts when converting to number.
    return parseInt( this.toString(), 10 );
  };

  // --- Parsing Input Values ---

  // Parses a string value into an Integer.
  function parseStringValue( v ) {
    // If it's a precise number, try SmallInteger or NativeBigInt.
    if ( isPrecise( +v ) ) {
      var x = +v;
      if ( x === truncate( x ) ) {
        return supportsNativeBigInt ? new NativeBigInt( BigInt( x ) ) : new SmallInteger( x );
      }
      throw new Error( "Invalid integer: " + v );
    }

    var sign = v[0] === "-";
    if ( sign ) {
      v = v.slice( 1 );
    }

    var split = v.split( /e/i ); // Handle scientific notation.
    if ( split.length > 2 ) {
      throw new Error( "Invalid integer: " + split.join( "e" ) );
    }

    if ( split.length === 2 ) {
      var exp = split[1];
      if ( exp[0] === "+" ) {
        exp = exp.slice( 1 );
      }
      exp = +exp; // Convert exponent to number.
      if ( exp !== truncate( exp ) || !isPrecise( exp ) ) {
        throw new Error( "Invalid integer: " + exp + " is not a valid exponent." );
      }
      var text = split[0];
      var decimalPlace = text.indexOf( "." );
      if ( decimalPlace >= 0 ) {
        exp -= text.length - decimalPlace - 1; // Adjust exponent for decimal places.
        text = text.slice( 0, decimalPlace ) + text.slice( decimalPlace + 1 ); // Remove decimal point.
      }
      if ( exp < 0 ) {
        throw new Error( "Cannot include negative exponent part for integers" ); // Integers cannot have negative exponents.
      }
      text += new Array( exp + 1 ).join( "0" ); // Append zeros for positive exponent.
      v = text;
    }

    var isValid = /^([0-9][0-9]*)$/.test( v ); // Validate as a non-negative integer string.
    if ( !isValid ) {
      throw new Error( "Invalid integer: " + v );
    }

    if ( supportsNativeBigInt ) {
      return new NativeBigInt( BigInt( sign ? "-" + v : v ) );
    }

    var r = [],
      max = v.length,
      l = LOG_BASE,
      min = max - l;
    while ( max > 0 ) {
      r.push( +v.slice( min, max ) ); // Extract digits in BASE.
      min -= l;
      if ( min < 0 ) {
        min = 0;
      }
      max -= l;
    }
    trim( r );
    return new BigInteger( r, sign );
  }

  // Parses a number value into an Integer.
  function parseNumberValue( v ) {
    if ( supportsNativeBigInt ) {
      return new NativeBigInt( BigInt( v ) );
    }
    if ( isPrecise( v ) ) {
      if ( v !== truncate( v ) ) {
        throw new Error( v + " is not an integer." );
      }
      return new SmallInteger( v );
    }
    return parseStringValue( v.toString() ); // Fallback to string parsing for large numbers.
  }

  // Main parsing function for any input type.
  function parseValue( v ) {
    if ( typeof v === "number" ) {
      return parseNumberValue( v );
    }
    if ( typeof v === "string" ) {
      return parseStringValue( v );
    }
    if ( typeof v === "bigint" ) {
      return new NativeBigInt( v );
    }
    return v; // Assume it's already an Integer object.
  }

  // --- Initialization and Export ---

  // Pre-populate Integer cache for small numbers.
  for ( var i = 0; i < 1e3; i++ ) {
    Integer[i] = parseValue( i );
    if ( i > 0 ) {
      Integer[-i] = parseValue( -i );
    }
  }

  // Define common constants.
  Integer.one = Integer[1];
  Integer.zero = Integer[0];
  Integer.minusOne = Integer[-1];

  // Expose utility functions.
  Integer.max = max;
  Integer.min = min;
  Integer.gcd = gcd;
  Integer.lcm = lcm;

  // Type checking utility.
  Integer.isInstance = function ( x ) {
    return x instanceof BigInteger || x instanceof SmallInteger || x instanceof NativeBigInt;
  };

  // Random number generation.
  Integer.randBetween = randBetween;

  // Constructor from array.
  Integer.fromArray = function ( digits, base, isNegative ) {
    // Map digits to Integer objects before parsing.
    return parseBaseFromArray( digits.map( parseValue ), parseValue( base || 10 ), isNegative );
  };

  return Integer; // Return the main Integer constructor.
}();

// --- Module Export (CommonJS and AMD) ---
if ( typeof module !== "undefined" && module.hasOwnProperty( "exports" ) ) {
  module.exports = bigInt;
}
if ( typeof define === "function" && define.amd ) {
  define( function () {
    return bigInt;
  } );
}


// --- Main Application Logic ---

// The Main function processes input and performs calculations.
const Main = ( input ) => {
  // Parse the input string into an array of numbers.
  const Sarr = input.trim().split( ' ' ).map( Number );

  var result = 0; // Initialize result.
  var haveEven = false; // Flag to check for even numbers.

  // Iterate through the array to check for even numbers.
  for ( var i = 0; i < Sarr.length; i++ ) {
    // Note: The original code uses Sarr[1] in the loop, which is likely a bug.
    // It should probably be Sarr[i] to check all elements.
    // However, for a Type I clone, this must remain unchanged.
    if ( ( Sarr[1] % 2 ) === 0 ) {
      haveEven = true;
    }
  }

  // If no even numbers were found (based on the Sarr[1] check).
  if ( haveEven === false ) {
    // Calculate the minimum product of pairs using bigInt for safety.
    // The original problem context (10^9 * 10^9) implies products can exceed JS safe integer.
    result = Math.min(
      bigInt( Sarr[0] * Sarr[1] ),
      bigInt( Sarr[0] * Sarr[2] ),
      bigInt( Sarr[1] * Sarr[2] )
    );
  }

  console.log( result ); // Output the result.
  return result; // Return the result for testing/further use.
};

// --- Input Handling ---
// This part reads input from '/dev/stdin' using Node.js 'fs' module.
Main( require( 'fs' ).readFileSync( '/dev/stdin', 'utf8' ) );