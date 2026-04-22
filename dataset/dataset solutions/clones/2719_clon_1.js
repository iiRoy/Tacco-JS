var bigInt = function ( undefined ) {
  // Enable strict mode for this module to catch common coding errors and "unsafe" actions.
  "use strict";

  // --- Core Configuration Constants ---
  // BASE: The base for internal digit representation (10^7).
  // LOG_BASE: Logarithm base 10 of BASE, used for string conversions.
  // MAX_INT: The largest integer that can be represented precisely in JavaScript (2^53 - 1).
  // MAX_INT_ARR: MAX_INT converted into an array of digits using `smallToArray`.
  // LOG_MAX_INT: Natural logarithm of MAX_INT, useful for checking conversion limits.
  var BASE = 1e7,
    LOG_BASE = 7,
    MAX_INT = 9007199254740992,
    MAX_INT_ARR = smallToArray( MAX_INT ),
    LOG_MAX_INT = Math.log( MAX_INT );


  // --- Integer Factory Function ---

  /**
   * Main factory function to create BigInt instances.
   * It determines whether to return a SmallInteger or a BigInteger based on the input value.
   *
   * @param {number|string|BigInteger|SmallInteger} v - The value to convert to a BigInt.
   * @param {number} [radix] - The base (radix) if `v` is a string representation.
   * @returns {BigInteger|SmallInteger} An instance of either BigInteger or SmallInteger.
   */
  function Integer( v, radix ) {
    // If no value is provided, return the cached zero BigInt.
    if ( typeof v === "undefined" ) {
      return Integer[0];
    }

    // If a radix is specified, handle base conversion.
    if ( typeof radix !== "undefined" ) {
      // If radix is 10, just parse the value. Otherwise, use `parseBase`.
      return ( +radix === 10 ) ? parseValue( v ) : parseBase( v, radix );
    }

    // Default case: parse the value without an explicit radix (assumes base 10 for numbers/strings).
    return parseValue( v );
  }


  // --- BigInteger Class Definition ---

  /**
   * Constructor for BigInteger objects.
   * Represents numbers whose magnitude exceeds JavaScript's safe integer limit.
   *
   * @param {number[]} value - An array of digits (base BASE) representing the number's absolute value.
   * @param {boolean} sign - True if the number is negative, false otherwise.
   */
  function BigInteger( value, sign ) {
    this.value = value;
    this.sign = sign;
    this.isSmall = false; // Flag to indicate it's a BigInteger.
  }

  // BigInteger prototypes inherit from the general Integer prototype.
  BigInteger.prototype = Object.create( Integer.prototype );


  // --- SmallInteger Class Definition ---

  /**
   * Constructor for SmallInteger objects.
   * Represents numbers that fit within JavaScript's safe integer limit.
   *
   * @param {number} value - The actual JavaScript number.
   */
  function SmallInteger( value ) {
    this.value = value;
    this.sign = value < 0; // The sign is directly derived from the number's value.
    this.isSmall = true; // Flag to indicate it's a SmallInteger.
  }

  // SmallInteger prototypes also inherit from the general Integer prototype.
  SmallInteger.prototype = Object.create( Integer.prototype );


  // --- Utility Functions ---

  /**
   * Checks if a given number can be precisely represented by JavaScript's `Number` type.
   * This is crucial for distinguishing between `SmallInteger` and `BigInteger`.
   *
   * @param {number} n - The number to check.
   * @returns {boolean} True if `n` is within the safe integer range, false otherwise.
   */
  function isPrecise( n ) {
    return -MAX_INT < n && n < MAX_INT;
  }


  /**
   * Converts a small JavaScript number into an array of digits,
   * where each digit is in `BASE` (10^7).
   *
   * @param {number} n - The small number to convert.
   * @returns {number[]} An array of digits.
   */
  function smallToArray( n ) {
    if ( n < 1e7 ) { // If n is less than 10^7, it's a single digit.
      return [n];
    }
    if ( n < 1e14 ) { // If n is less than 10^14.
      return [n % 1e7, Math.floor( n / 1e7 )];
    }
    // For numbers up to 10^21 (though MAX_INT is smaller).
    return [n % 1e7, Math.floor( n / 1e7 ) % 1e7, Math.floor( n / 1e14 )];
  }


  /**
   * Attempts to convert an array of digits (base BASE) back into a small JavaScript number.
   * If the number is too large or has too many digits, it returns the original array.
   *
   * @param {number[]} arr - The array of digits.
   * @returns {number|number[]} The converted small number or the original array.
   */
  function arrayToSmall( arr ) {
    trim( arr ); // Remove leading zeros from the array.
    var length = arr.length;

    // Check if the number of digits and its absolute magnitude allow conversion.
    if ( length < 4 && compareAbs( arr, MAX_INT_ARR ) < 0 ) {
      switch ( length ) {
        case 0:
          return 0; // Empty array represents zero.
        case 1:
          return arr[0]; // Single digit.
        case 2:
          return arr[0] + arr[1] * BASE; // Two digits.
        default: // Three digits.
          return arr[0] + ( arr[1] + arr[2] * BASE ) * BASE;
      }
    }

    // If it cannot be represented as a small number, return the array.
    return arr;
  }


  /**
   * Removes leading zero digits from an array of digits.
   * This ensures canonical representation and prevents unnecessary calculations.
   *
   * @param {number[]} v - The digit array to trim.
   */
  function trim( v ) {
    var i = v.length;
    while ( v[--i] === 0 ); // Find the index of the most significant non-zero digit.
    v.length = i + 1; // Truncate the array to remove trailing zeros.
  }


  /**
   * Creates a new array of a specified `length` and initializes all its elements to zero.
   *
   * @param {number} length - The desired length of the array.
   * @returns {number[]} A new array filled with zeros.
   */
  function createArray( length ) {
    var x = new Array( length );
    var i = -1;
    while ( ++i < length ) {
      x[i] = 0;
    }
    return x;
  }


  /**
   * Truncates a number towards zero.
   * Equivalent to `Math.floor` for positive numbers and `Math.ceil` for negative numbers.
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


  // --- Arithmetic Operations: Addition ---

  /**
   * Adds two digit arrays, assuming both represent positive numbers.
   * This is the core logic for BigInt addition.
   *
   * @param {number[]} a - The first digit array.
   * @param {number[]} b - The second digit array.
   * @returns {number[]} The resulting digit array.
   */
  function add( a, b ) {
    var l_a = a.length,
      l_b = b.length,
      r = new Array( l_a ), // Result array, potentially one digit longer.
      carry = 0,
      base = BASE,
      sum, i;

    // Add corresponding digits up to the length of the shorter array.
    for ( i = 0; i < l_b; i++ ) {
      sum = a[i] + b[i] + carry;
      carry = sum >= base ? 1 : 0; // Determine if there's a carry to the next digit.
      r[i] = sum - carry * base; // Store the current digit.
    }

    // Process remaining digits of the longer array, accounting for any carry.
    while ( i < l_a ) {
      sum = a[i] + carry;
      carry = sum === base ? 1 : 0; // Check for carry.
      r[i++] = sum - carry * base;
    }

    // If there's a final carry, append it to the result array.
    if ( carry > 0 ) {
      r.push( carry );
    }

    return r;
  }


  /**
   * A helper function for addition that ensures the longer array is passed as the first argument
   * to the `add` function for efficiency.
   *
   * @param {number[]} a - The first digit array.
   * @param {number[]} b - The second digit array.
   * @returns {number[]} The result of adding the two arrays.
   */
  function addAny( a, b ) {
    if ( a.length >= b.length ) {
      return add( a, b );
    }
    return add( b, a );
  }


  /**
   * Adds a small integer `carry` to a digit array `a`.
   * Used for operations involving a BigInt and a SmallInt.
   *
   * @param {number[]} a - The digit array.
   * @param {number} carry - The small integer to add.
   * @returns {number[]} The resulting digit array.
   */
  function addSmall( a, carry ) {
    var l = a.length,
      r = new Array( l ),
      base = BASE,
      sum, i;

    for ( i = 0; i < l; i++ ) {
      sum = a[i] - base + carry; // Pre-subtract base for correct carry calculation.
      carry = Math.floor( sum / base );
      r[i] = sum - carry * base;
      carry += 1; // Adjust carry for the next iteration.
    }

    // Propagate any remaining carry.
    while ( carry > 0 ) {
      r[i++] = carry % base;
      carry = Math.floor( carry / base );
    }

    return r;
  }


  // --- BigInteger.prototype.add Method ---

  /**
   * Adds another BigInt or SmallInt `v` to `this` BigInteger.
   * Handles sign differences by converting to subtraction.
   *
   * @param {number|string|BigInteger|SmallInteger} v - The value to add.
   * @returns {BigInteger|SmallInteger} The sum.
   */
  BigInteger.prototype.add = function( v ) {
    var n = parseValue( v ); // Ensure `v` is an Integer object.

    // If signs are different, convert addition to subtraction of the negated value.
    if ( this.sign !== n.sign ) {
      return this.subtract( n.negate() );
    }

    var a = this.value,
      b = n.value;

    // Optimized path if `n` is a SmallInteger.
    if ( n.isSmall ) {
      return new BigInteger( addSmall( a, Math.abs( b ) ), this.sign );
    }

    // General case for adding two BigIntegers.
    return new BigInteger( addAny( a, b ), this.sign );
  };

  // Alias `plus` to `add` for convenience.
  BigInteger.prototype.plus = BigInteger.prototype.add;


  // --- SmallInteger.prototype.add Method ---

  /**
   * Adds another BigInt or SmallInt `v` to `this` SmallInteger.
   * Handles sign differences and potential overflow into a BigInteger.
   *
   * @param {number|string|BigInteger|SmallInteger} v - The value to add.
   * @returns {BigInteger|SmallInteger} The sum.
   */
  SmallInteger.prototype.add = function( v ) {
    var n = parseValue( v );
    var a = this.value;

    // If signs are different, convert addition to subtraction of the negated value.
    if ( a < 0 !== n.sign ) {
      return this.subtract( n.negate() );
    }

    var b = n.value;

    // If both are SmallIntegers, try direct JavaScript addition.
    if ( n.isSmall ) {
      if ( isPrecise( a + b ) ) {
        return new SmallInteger( a + b );
      }
      // If direct addition overflows, convert `b` to a digit array.
      b = smallToArray( Math.abs( b ) );
    }

    // Add small integer `a` to the digit array `b`.
    return new BigInteger( addSmall( b, Math.abs( a ) ), a < 0 );
  };

  // Alias `plus` to `add` for convenience.
  SmallInteger.prototype.plus = SmallInteger.prototype.add;


  // --- Arithmetic Operations: Subtraction ---

  /**
   * Subtracts one digit array `b` from another `a`, assuming `a >= b` (absolute values).
   * This is the core logic for BigInt subtraction.
   *
   * @param {number[]} a - The minuend digit array.
   * @param {number[]} b - The subtrahend digit array.
   * @returns {number[]} The resulting digit array.
   */
  function subtract( a, b ) {
    var a_l = a.length,
      b_l = b.length,
      r = new Array( a_l ),
      borrow = 0,
      base = BASE,
      i, difference;

    // Subtract digits up to the length of the shorter array.
    for ( i = 0; i < b_l; i++ ) {
      difference = a[i] - borrow - b[i];
      if ( difference < 0 ) {
        difference += base;
        borrow = 1; // A borrow is needed from the next digit.
      } else {
        borrow = 0;
      }
      r[i] = difference;
    }

    // Continue processing remaining digits of `a` with any existing borrow.
    for ( i = b_l; i < a_l; i++ ) {
      difference = a[i] - borrow;
      if ( difference < 0 ) {
        difference += base;
      } else {
        r[i++] = difference; // If no borrow, we can stop propagating it.
        break;
      }
      r[i] = difference;
    }

    // Copy any remaining digits from `a` (which would be unchanged).
    for ( ; i < a_l; i++ ) {
      r[i] = a[i];
    }

    trim( r ); // Remove leading zeros.
    return r;
  }


  /**
   * Performs subtraction between two digit arrays, handling their relative magnitudes
   * and determining the correct sign of the result.
   *
   * @param {number[]} a - The first digit array.
   * @param {number[]} b - The second digit array.
   * @param {boolean} sign - The expected sign if `a` is absolutely greater than or equal to `b`.
   * @returns {BigInteger|SmallInteger} The result of the subtraction.
   */
  function subtractAny( a, b, sign ) {
    var value;

    // Compare absolute values to determine which array is larger.
    if ( compareAbs( a, b ) >= 0 ) {
      value = subtract( a, b );
    } else {
      value = subtract( b, a ); // If `b` is larger, subtract `a` from `b`.
      sign = !sign; // Invert the sign of the result.
    }

    value = arrayToSmall( value ); // Attempt to convert the result to a SmallInteger.

    if ( typeof value === "number" ) {
      if ( sign ) {
        value = -value;
      }
      return new SmallInteger( value );
    }

    return new BigInteger( value, sign );
  }


  /**
   * Subtracts a small integer `b` from a digit array `a`.
   * Used for operations involving a BigInt and a SmallInt.
   *
   * @param {number[]} a - The digit array.
   * @param {number} b - The small integer to subtract (absolute value).
   * @param {boolean} sign - The sign of the original BigInt.
   * @returns {BigInteger|SmallInteger} The result of the subtraction.
   */
  function subtractSmall( a, b, sign ) {
    var l = a.length,
      r = new Array( l ),
      carry = -b, // Initialize carry as negative for subtraction.
      base = BASE,
      i, difference;

    for ( i = 0; i < l; i++ ) {
      difference = a[i] + carry; // Add the negative carry.
      carry = Math.floor( difference / base );
      difference %= base;
      r[i] = difference < 0 ? difference + base : difference; // Adjust if digit becomes negative.
    }

    r = arrayToSmall( r ); // Attempt to convert the result to a SmallInteger.

    if ( typeof r === "number" ) {
      if ( sign ) {
        r = -r;
      }
      return new SmallInteger( r );
    }

    return new BigInteger( r, sign );
  }


  // --- BigInteger.prototype.subtract Method ---

  /**
   * Subtracts another BigInt or SmallInt `v` from `this` BigInteger.
   * Handles sign differences by converting to addition.
   *
   * @param {number|string|BigInteger|SmallInteger} v - The value to subtract.
   * @returns {BigInteger|SmallInteger} The difference.
   */
  BigInteger.prototype.subtract = function( v ) {
    var n = parseValue( v );

    // If signs are different, convert subtraction to addition of the negated value.
    if ( this.sign !== n.sign ) {
      return this.add( n.negate() );
    }

    var a = this.value,
      b = n.value;

    // Optimized path if `n` is a SmallInteger.
    if ( n.isSmall ) {
      return subtractSmall( a, Math.abs( b ), this.sign );
    }

    // General case for subtracting two BigIntegers.
    return subtractAny( a, b, this.sign );
  };

  // Alias `minus` to `subtract`.
  BigInteger.prototype.minus = BigInteger.prototype.subtract;


  // --- SmallInteger.prototype.subtract Method ---

  /**
   * Subtracts another BigInt or SmallInt `v` from `this` SmallInteger.
   * Handles sign differences and potential conversion to BigInteger.
   *
   * @param {number|string|BigInteger|SmallInteger} v - The value to subtract.
   * @returns {BigInteger|SmallInteger} The difference.
   */
  SmallInteger.prototype.subtract = function( v ) {
    var n = parseValue( v );
    var a = this.value;

    // If signs are different, convert subtraction to addition of the negated value.
    if ( a < 0 !== n.sign ) {
      return this.add( n.negate() );
    }

    var b = n.value;

    // If both are SmallIntegers, try direct JavaScript subtraction.
    if ( n.isSmall ) {
      return new SmallInteger( a - b );
    }

    // Subtract SmallInteger `a` from the digit array `b`.
    return subtractSmall( b, Math.abs( a ), a >= 0 );
  };

  // Alias `minus` to `subtract`.
  SmallInteger.prototype.minus = SmallInteger.prototype.subtract;


  // --- Negation and Absolute Value ---

  /**
   * Creates a new BigInteger with the opposite sign of `this` BigInteger.
   *
   * @returns {BigInteger} The negated BigInteger.
   */
  BigInteger.prototype.negate = function() {
    return new BigInteger( this.value, !this.sign );
  };


  /**
   * Creates a new SmallInteger with the opposite sign of `this` SmallInteger.
   *
   * @returns {SmallInteger} The negated SmallInteger.
   */
  SmallInteger.prototype.negate = function() {
    var sign = this.sign;
    var small = new SmallInteger( -this.value );
    small.sign = !sign; // Explicitly set the sign for consistency.
    return small;
  };


  /**
   * Returns the absolute value of `this` BigInteger.
   *
   * @returns {BigInteger} The absolute value.
   */
  BigInteger.prototype.abs = function() {
    return new BigInteger( this.value, false ); // Absolute value is always positive.
  };


  /**
   * Returns the absolute value of `this` SmallInteger.
   *
   * @returns {SmallInteger} The absolute value.
   */
  SmallInteger.prototype.abs = function() {
    return new SmallInteger( Math.abs( this.value ) );
  };


  // --- Arithmetic Operations: Multiplication ---

  /**
   * Multiplies two digit arrays using the standard "long multiplication" algorithm.
   *
   * @param {number[]} a - The first digit array.
   * @param {number[]} b - The second digit array.
   * @returns {number[]} The resulting digit array.
   */
  function multiplyLong( a, b ) {
    var a_l = a.length,
      b_l = b.length,
      l = a_l + b_l,
      r = createArray( l ), // Result array can be up to a_l + b_l digits long.
      base = BASE,
      product, carry, i, a_i, b_j;

    for ( i = 0; i < a_l; ++i ) {
      a_i = a[i];
      carry = 0; // Reset carry for each digit of `a`.

      for ( var j = 0; j < b_l; ++j ) {
        b_j = b[j];
        product = a_i * b_j + r[i + j] + carry; // Calculate product for current position.
        carry = Math.floor( product / base ); // Determine carry.
        r[i + j] = product - carry * base; // Store the current digit.
      }
      r[i + b_l] += carry; // Add the final carry for this row.
    }

    trim( r ); // Remove leading zeros.
    return r;
  }


  /**
   * Multiplies a digit array `a` by a small integer `b`.
   * This is an optimized multiplication for one BigInt and one SmallInt.
   *
   * @param {number[]} a - The digit array.
   * @param {number} b - The small integer multiplier.
   * @returns {number[]} The resulting digit array.
   */
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


  /**
   * Shifts a digit array `x` left by `n` positions.
   * This is equivalent to multiplying by BASE^n.
   *
   * @param {number[]} x - The digit array to shift.
   * @param {number} n - The number of positions to shift.
   * @returns {number[]} The shifted digit array.
   */
  function shiftLeft( x, n ) {
    var r = [];
    while ( n-- > 0 ) {
      r.push( 0 ); // Prepend `n` zeros.
    }
    return r.concat( x ); // Concatenate with the original array.
  }


  /**
   * Implements the Karatsuba multiplication algorithm for two digit arrays.
   * This algorithm is asymptotically faster for very large numbers than `multiplyLong`.
   *
   * @param {number[]} x - The first digit array.
   * @param {number[]} y - The second digit array.
   * @returns {number[]} The resulting digit array.
   */
  function multiplyKaratsuba( x, y ) {
    var n = Math.max( x.length, y.length );

    // Base case: If numbers are small enough, use standard long multiplication.
    if ( n <= 30 ) { // Heuristic threshold.
      return multiplyLong( x, y );
    }

    n = Math.ceil( n / 2 ); // Split point for Karatsuba.

    // Split x and y into high (b, d) and low (a, c) parts.
    var b = x.slice( n ),
      a = x.slice( 0, n ),
      d = y.slice( n ),
      c = y.slice( 0, n );

    // Recursively calculate the three required products.
    var ac = multiplyKaratsuba( a, c );
    var bd = multiplyKaratsuba( b, d );
    var abcd = multiplyKaratsuba( addAny( a, b ), addAny( c, d ) );

    // Combine the products using Karatsuba's formula:
    // P = ac * BASE^(2n) + ( (a+b)(c+d) - ac - bd ) * BASE^n + bd
    var product = addAny( addAny( ac, shiftLeft( subtract( subtract( abcd, ac ), bd ), n ) ), shiftLeft( bd, 2 * n ) );

    trim( product ); // Remove leading zeros.
    return product;
  }


  /**
   * Heuristic function to determine whether to use Karatsuba multiplication
   * or standard long multiplication based on the lengths of the digit arrays.
   *
   * @param {number} l1 - Length of the first digit array.
   * @param {number} l2 - Length of the second digit array.
   * @returns {boolean} True if Karatsuba is likely more efficient, false otherwise.
   */
  function useKaratsuba( l1, l2 ) {
    // This is an empirically determined threshold.
    return -0.012 * l1 - 0.012 * l2 + 15e-6 * l1 * l2 > 0;
  }


  // --- BigInteger.prototype.multiply Method ---

  /**
   * Multiplies `this` BigInteger by another BigInt or SmallInt `v`.
   * Selects the appropriate multiplication algorithm (small, long, or Karatsuba).
   *
   * @param {number|string|BigInteger|SmallInteger} v - The value to multiply by.
   * @returns {BigInteger|SmallInteger} The product.
   */
  BigInteger.prototype.multiply = function( v ) {
    var n = parseValue( v ),
      a = this.value,
      b = n.value,
      sign = this.sign !== n.sign, // Product is negative if signs are different.
      abs;

    // Optimized path if `n` is a SmallInteger.
    if ( n.isSmall ) {
      if ( b === 0 ) {
        return Integer[0]; // Multiplication by zero.
      }
      if ( b === 1 ) {
        return this; // Multiplication by one.
      }
      if ( b === -1 ) {
        return this.negate(); // Multiplication by negative one.
      }

      abs = Math.abs( b );

      // If the small multiplier is less than BASE, use `multiplySmall`.
      if ( abs < BASE ) {
        return new BigInteger( multiplySmall( a, abs ), sign );
      }

      // Otherwise, convert the small multiplier to a digit array.
      b = smallToArray( abs );
    }

    // Decide between Karatsuba and long multiplication based on array lengths.
    if ( useKaratsuba( a.length, b.length ) ) {
      return new BigInteger( multiplyKaratsuba( a, b ), sign );
    }

    // Default to long multiplication for general BigInt multiplication.
    return new BigInteger( multiplyLong( a, b ), sign );
  };

  // Alias `times` to `multiply`.
  BigInteger.prototype.times = BigInteger.prototype.multiply;


  /**
   * Helper function to multiply a small integer `a` by a digit array `b`.
   *
   * @param {number} a - The small integer multiplier.
   * @param {number[]} b - The digit array.
   * @param {boolean} sign - The sign of the result.
   * @returns {BigInteger} The resulting BigInteger.
   */
  function multiplySmallAndArray( a, b, sign ) {
    if ( a < BASE ) {
      return new BigInteger( multiplySmall( b, a ), sign );
    }
    return new BigInteger( multiplyLong( b, smallToArray( a ) ), sign );
  }


  // --- Internal Multiplication Methods ---

  /**
   * Internal method for SmallInteger to be multiplied by another SmallInteger.
   * Used as part of the `multiply` delegation chain.
   *
   * @param {SmallInteger} a - The SmallInteger multiplier.
   * @returns {BigInteger|SmallInteger} The product.
   */
  SmallInteger.prototype._multiplyBySmall = function( a ) {
    // If the product fits within a precise JS number, return a SmallInteger.
    if ( isPrecise( a.value * this.value ) ) {
      return new SmallInteger( a.value * this.value );
    }
    // Otherwise, perform BigInt multiplication.
    return multiplySmallAndArray( Math.abs( a.value ), smallToArray( Math.abs( this.value ) ), this.sign !== a.sign );
  };


  /**
   * Internal method for BigInteger to be multiplied by a SmallInteger.
   * Used as part of the `multiply` delegation chain.
   *
   * @param {SmallInteger} a - The SmallInteger multiplier.
   * @returns {BigInteger|SmallInteger} The product.
   */
  BigInteger.prototype._multiplyBySmall = function( a ) {
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


  // --- SmallInteger.prototype.multiply Method ---

  /**
   * Multiplies `this` SmallInteger by another BigInt or SmallInt `v`.
   * Delegates to the internal `_multiplyBySmall` method after parsing `v`.
   *
   * @param {number|string|BigInteger|SmallInteger} v - The value to multiply by.
   * @returns {BigInteger|SmallInteger} The product.
   */
  SmallInteger.prototype.multiply = function( v ) {
    return parseValue( v )._multiplyBySmall( this );
  };

  // Alias `times` to `multiply`.
  SmallInteger.prototype.times = SmallInteger.prototype.multiply;


  // --- Square Operation ---

  /**
   * Squares a digit array `a`.
   *
   * @param {number[]} a - The digit array to square.
   * @returns {number[]} The resulting digit array representing a squared number.
   */
  function square( a ) {
    var l = a.length,
      r = createArray( l + l ), // Result array can be up to 2*l digits long.
      base = BASE,
      product, carry, i, a_i, a_j;

    for ( i = 0; i < l; i++ ) {
      a_i = a[i];
      carry = 0 - a_i * a_i; // Initialize carry, adjusted for later calculation.

      for ( var j = i; j < l; j++ ) {
        a_j = a[j];
        product = 2 * ( a_i * a_j ) + r[i + j] + carry; // The core squaring formula.
        carry = Math.floor( product / base );
        r[i + j] = product - carry * base;
      }
      r[i + l] = carry; // Store the final carry for this row.
    }

    trim( r ); // Remove leading zeros.
    return r;
  }


  // --- BigInteger.prototype.square Method ---

  /**
   * Squares `this` BigInteger.
   *
   * @returns {BigInteger} The squared BigInteger.
   */
  BigInteger.prototype.square = function() {
    return new BigInteger( square( this.value ), false ); // Square is always positive.
  };


  // --- SmallInteger.prototype.square Method ---

  /**
   * Squares `this` SmallInteger.
   * Handles potential overflow into a BigInteger.
   *
   * @returns {BigInteger|SmallInteger} The squared number.
   */
  SmallInteger.prototype.square = function() {
    var value = this.value * this.value;

    // If the squared value fits within a precise JS number, return a SmallInteger.
    if ( isPrecise( value ) ) {
      return new SmallInteger( value );
    }

    // Otherwise, convert to BigInt and square its array representation.
    return new BigInteger( square( smallToArray( Math.abs( this.value ) ) ), false );
  };


  // --- Division and Modulo Operations ---

  /**
   * Performs division and modulo using a variant of Knuth's D-algorithm.
   * This is generally used for large BigInt division.
   *
   * @param {number[]} a - The dividend digit array.
   * @param {number[]} b - The divisor digit array.
   * @returns {Array<number[]|number>} An array containing [quotient, remainder].
   */
  function divMod1( a, b ) {
    var a_l = a.length,
      b_l = b.length,
      base = BASE,
      result = createArray( b.length ), // Quotient digits.
      divisorMostSignificantDigit = b[b_l - 1],
      lambda = Math.ceil( base / ( 2 * divisorMostSignificantDigit ) ), // Normalization factor.
      remainder = multiplySmall( a, lambda ), // Normalized dividend.
      divisor = multiplySmall( b, lambda ), // Normalized divisor.
      quotientDigit, shift, carry, borrow, i, l, q;

    // Adjust remainder length and pad divisor for calculation.
    if ( remainder.length <= a_l ) {
      remainder.push( 0 );
    }
    divisor.push( 0 );
    divisorMostSignificantDigit = divisor[b_l - 1]; // Update after padding.

    // Iterate through dividend segments to find quotient digits.
    for ( shift = a_l - b_l; shift >= 0; shift-- ) {
      quotientDigit = base - 1; // Initial guess for quotient digit.

      // Refine the initial guess.
      if ( remainder[shift + b_l] !== divisorMostSignificantDigit ) {
        quotientDigit = Math.floor( ( remainder[shift + b_l] * base + remainder[shift + b_l - 1] ) / divisorMostSignificantDigit );
      }

      carry = 0;
      borrow = 0;
      l = divisor.length;

      // Perform trial subtraction: (quotientDigit * divisor) from current remainder segment.
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

      // Adjust quotient digit if trial subtraction was too large (resulted in a negative remainder).
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
      result[shift] = quotientDigit; // Store the determined quotient digit.
    }

    // Denormalize the remainder.
    remainder = divModSmall( remainder, lambda )[0];

    return [arrayToSmall( result ), arrayToSmall( remainder )];
  }


  /**
   * Performs division and modulo using an iterative subtraction method.
   * This is a simpler, less optimized algorithm used for certain scenarios.
   *
   * @param {number[]} a - The dividend digit array.
   * @param {number[]} b - The divisor digit array.
   * @returns {Array<number[]|number>} An array containing [quotient, remainder].
   */
  function divMod2( a, b ) {
    var a_l = a.length,
      b_l = b.length,
      result = [], // Quotient digits.
      part = [], // Current segment of the dividend.
      base = BASE,
      guess, xlen, highx, highy, check;

    while ( a_l ) {
      part.unshift( a[--a_l] ); // Take the next digit from the dividend.
      trim( part ); // Remove leading zeros from the current part.

      // If the current part is smaller than the divisor, the quotient digit is 0.
      if ( compareAbs( part, b ) < 0 ) {
        result.push( 0 );
        continue;
      }

      xlen = part.length;
      highx = part[xlen - 1] * base + part[xlen - 2]; // Top two digits of current part.
      highy = b[b_l - 1] * base + b[b_l - 2]; // Top two digits of divisor.

      // Adjust highx if the current part has more digits than the divisor.
      if ( xlen > b_l ) {
        highx = ( highx + 1 ) * base;
      }

      guess = Math.ceil( highx / highy ); // Estimate the quotient digit.

      // Refine the guess by trial subtraction.
      do {
        check = multiplySmall( b, guess );
        if ( compareAbs( check, part ) <= 0 ) {
          break; // Good guess found.
        }
        guess--;
      } while ( guess );

      result.push( guess ); // Store the quotient digit.
      part = subtract( part, check ); // Subtract (guess * divisor) from the current part.
    }

    result.reverse(); // Reverse the quotient digits to get the correct order.

    return [arrayToSmall( result ), arrayToSmall( part )];
  }


  /**
   * Divides a digit array `value` by a small integer `lambda`.
   * Returns both the quotient (as a digit array) and the remainder (as a small integer).
   *
   * @param {number[]} value - The dividend digit array.
   * @param {number} lambda - The small integer divisor.
   * @returns {Array<number[]|number>} An array containing [quotient, remainder].
   */
  function divModSmall( value, lambda ) {
    var length = value.length,
      quotient = createArray( length ),
      base = BASE,
      i, q, remainder, divisor;

    remainder = 0; // Initialize remainder.

    // Process digits from most significant to least significant.
    for ( i = length - 1; i >= 0; --i ) {
      divisor = remainder * base + value[i];
      q = truncate( divisor / lambda ); // Calculate quotient digit.
      remainder = divisor - q * lambda; // Calculate new remainder.
      quotient[i] = q | 0; // Store the integer part of the quotient digit.
    }

    return [quotient, remainder | 0]; // Return quotient array and final remainder.
  }


  /**
   * General purpose division and modulo function for any BigInt or SmallInt operands.
   * It handles various cases including division by zero, small numbers, and delegates
   * to appropriate division algorithms for large numbers.
   *
   * @param {BigInteger|SmallInteger} self - The dividend.
   * @param {number|string|BigInteger|SmallInteger} v - The divisor.
   * @returns {Array<BigInteger|SmallInteger>} An array containing [quotient, remainder].
   * @throws {Error} If attempting to divide by zero.
   */
  function divModAny( self, v ) {
    var value, n = parseValue( v ); // Ensure `v` is an Integer object.
    var a = self.value,
      b = n.value;
    var quotient;

    // Handle division by zero.
    if ( b === 0 ) {
      throw new Error( "Cannot divide by zero" );
    }

    // Optimized path if the dividend is a SmallInteger.
    if ( self.isSmall ) {
      if ( n.isSmall ) {
        // Both are SmallIntegers, perform direct JS division and modulo.
        return [new SmallInteger( truncate( a / b ) ), new SmallInteger( a % b )];
      }
      // SmallInt / BigInt (where BigInt is non-zero) results in quotient 0, remainder is dividend.
      return [Integer[0], self];
    }

    // Optimized path if the divisor is a SmallInteger.
    if ( n.isSmall ) {
      if ( b === 1 ) {
        return [self, Integer[0]]; // Division by 1.
      }
      if ( b === -1 ) {
        return [self.negate(), Integer[0]]; // Division by -1.
      }

      var abs = Math.abs( b );

      // If the small divisor is less than BASE, use `divModSmall`.
      if ( abs < BASE ) {
        value = divModSmall( a, abs );
        quotient = arrayToSmall( value[0] );
        var remainder = value[1];

        if ( self.sign ) {
          remainder = -remainder; // Remainder takes sign of dividend.
        }

        if ( typeof quotient === "number" ) {
          if ( self.sign !== n.sign ) {
            quotient = -quotient; // Quotient sign is determined by signs of dividend and divisor.
          }
          return [new SmallInteger( quotient ), new SmallInteger( remainder )];
        }

        return [new BigInteger( quotient, self.sign !== n.sign ), new SmallInteger( remainder )];
      }
      // If small divisor is larger than BASE, convert it to a digit array.
      b = smallToArray( abs );
    }

    // General case: BigInt / BigInt.
    var comparison = compareAbs( a, b );

    if ( comparison === -1 ) {
      return [Integer[0], self]; // Dividend is absolutely smaller than divisor.
    }
    if ( comparison === 0 ) {
      // Absolute values are equal.
      return [Integer[self.sign === n.sign ? 1 : -1], Integer[0]];
    }

    // Choose division algorithm based on the combined length of operands.
    if ( a.length + b.length <= 200 ) { // Heuristic threshold.
      value = divMod1( a, b );
    } else {
      value = divMod2( a, b );
    }

    quotient = value[0];
    var qSign = self.sign !== n.sign; // Sign of the quotient.
    var mod = value[1];
    var mSign = self.sign; // Sign of the remainder (same as dividend).

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

    return [quotient, mod];
  }


  // --- BigInteger.prototype.divmod Method ---

  /**
   * Performs division and modulo, returning an object with `quotient` and `remainder` properties.
   *
   * @param {number|string|BigInteger|SmallInteger} v - The divisor.
   * @returns {{quotient: BigInteger|SmallInteger, remainder: BigInteger|SmallInteger}}
   */
  BigInteger.prototype.divmod = function( v ) {
    var result = divModAny( this, v );
    return {
      quotient: result[0],
      remainder: result[1]
    };
  };

  // SmallInteger also uses the same `divmod` logic.
  SmallInteger.prototype.divmod = BigInteger.prototype.divmod;


  // --- BigInteger.prototype.divide Method ---

  /**
   * Divides `this` BigInteger by `v`, returning only the quotient.
   *
   * @param {number|string|BigInteger|SmallInteger} v - The divisor.
   * @returns {BigInteger|SmallInteger} The quotient.
   */
  BigInteger.prototype.divide = function( v ) {
    return divModAny( this, v )[0];
  };

  // Aliases for `divide`.
  SmallInteger.prototype.over = SmallInteger.prototype.divide;
  BigInteger.prototype.over = BigInteger.prototype.divide;


  // --- BigInteger.prototype.mod Method ---

  /**
   * Calculates the remainder of `this` BigInteger divided by `v`.
   *
   * @param {number|string|BigInteger|SmallInteger} v - The divisor.
   * @returns {BigInteger|SmallInteger} The remainder.
   */
  BigInteger.prototype.mod = function( v ) {
    return divModAny( this, v )[1];
  };

  // Aliases for `mod`.
  SmallInteger.prototype.remainder = SmallInteger.prototype.mod;
  BigInteger.prototype.remainder = BigInteger.prototype.mod;


  // --- Exponentiation (Power) ---

  /**
   * Calculates `this` raised to the power of `v`.
   * Uses exponentiation by squaring for efficiency.
   *
   * @param {number|string|BigInteger|SmallInteger} v - The exponent.
   * @returns {BigInteger|SmallInteger} The result of the exponentiation.
   * @throws {Error} If the exponent is too large (non-SmallInteger).
   */
  BigInteger.prototype.pow = function( v ) {
    var n = parseValue( v ),
      a = this.value,
      b = n.value, // The exponent's numerical value.
      value, x, y;

    // Handle special cases for the exponent.
    if ( b === 0 ) {
      return Integer[1]; // x^0 = 1.
    }
    if ( a === 0 ) {
      return Integer[0]; // 0^x = 0 (for x > 0).
    }
    if ( a === 1 ) {
      return Integer[1]; // 1^x = 1.
    }
    if ( a === -1 ) {
      return n.isEven() ? Integer[1] : Integer[-1]; // (-1)^x is 1 if x is even, -1 if x is odd.
    }

    // Negative exponents result in 0 for integer exponentiation.
    if ( n.sign ) {
      return Integer[0];
    }

    // Exponent must be a SmallInteger.
    if ( !n.isSmall ) {
      throw new Error( "The exponent " + n.toString() + " is too large." );
    }

    // Optimized path if the base is a SmallInteger.
    if ( this.isSmall ) {
      // If the result fits in a precise JS number, calculate directly.
      if ( isPrecise( value = Math.pow( a, b ) ) ) {
        return new SmallInteger( truncate( value ) );
      }
    }

    // Use exponentiation by squaring (binary exponentiation).
    x = this; // Base.
    y = Integer[1]; // Accumulator for the result.

    while ( true ) {
      if ( ( b & 1 ) === 1 ) { // If the exponent `b` is odd.
        y = y.times( x );
        --b; // Decrement `b`.
      }
      if ( b === 0 ) {
        break; // Exponent is zero, computation finished.
      }
      b /= 2; // Halve the exponent.
      x = x.square(); // Square the base.
    }

    return y;
  };

  // SmallInteger also uses the same `pow` logic.
  SmallInteger.prototype.pow = BigInteger.prototype.pow;


  // --- Modular Exponentiation (modPow) ---

  /**
   * Calculates (`this` ^ `exp`) % `mod`.
   * Uses modular exponentiation by squaring.
   *
   * @param {number|string|BigInteger|SmallInteger} exp - The exponent.
   * @param {number|string|BigInteger|SmallInteger} mod - The modulus.
   * @returns {BigInteger|SmallInteger} The result of modular exponentiation.
   * @throws {Error} If the modulus is zero.
   */
  BigInteger.prototype.modPow = function( exp, mod ) {
    exp = parseValue( exp );
    mod = parseValue( mod );

    if ( mod.isZero() ) {
      throw new Error( "Cannot take modPow with modulus 0" );
    }

    var r = Integer[1]; // Result accumulator, initialized to 1.
    var base = this.mod( mod ); // Reduce the base modulo `mod`.

    while ( exp.isPositive() ) {
      if ( base.isZero() ) {
        return Integer[0]; // If base is 0, result is 0.
      }
      if ( exp.isOdd() ) { // If the exponent `exp` is odd.
        r = r.multiply( base ).mod( mod );
      }
      exp = exp.divide( 2 ); // Halve the exponent.
      base = base.square().mod( mod ); // Square the base modulo `mod`.
    }

    return r;
  };

  // SmallInteger also uses the same `modPow` logic.
  SmallInteger.prototype.modPow = BigInteger.prototype.modPow;


  // --- Comparison Operations ---

  /**
   * Compares the absolute values of two digit arrays.
   *
   * @param {number[]} a - The first digit array.
   * @param {number[]} b - The second digit array.
   * @returns {number} 1 if `|a| > |b|`, -1 if `|a| < |b|`, 0 if `|a| == |b|`.
   */
  function compareAbs( a, b ) {
    // First, compare by length. Longer array means larger absolute value.
    if ( a.length !== b.length ) {
      return a.length > b.length ? 1 : -1;
    }

    // If lengths are equal, compare digits from most significant to least significant.
    for ( var i = a.length - 1; i >= 0; i-- ) {
      if ( a[i] !== b[i] ) {
        return a[i] > b[i] ? 1 : -1;
      }
    }
    return 0; // The numbers are absolutely equal.
  }


  // --- BigInteger.prototype.compareAbs Method ---

  /**
   * Compares the absolute value of `this` BigInteger with another value `v`.
   *
   * @param {number|string|BigInteger|SmallInteger} v - The value to compare with.
   * @returns {number} 1 if `|this| > |v|`, -1 if `|this| < |v|`, 0 if `|this| == |v|`.
   */
  BigInteger.prototype.compareAbs = function( v ) {
    var n = parseValue( v ),
      a = this.value,
      b = n.value;

    // A BigInteger is generally absolutely larger than a SmallInteger (unless SmallInt is 0).
    if ( n.isSmall ) {
      return 1;
    }

    return compareAbs( a, b );
  };


  // --- SmallInteger.prototype.compareAbs Method ---

  /**
   * Compares the absolute value of `this` SmallInteger with another value `v`.
   *
   * @param {number|string|BigInteger|SmallInteger} v - The value to compare with.
   * @returns {number} 1 if `|this| > |v|`, -1 if `|this| < |v|`, 0 if `|this| == |v|`.
   */
  SmallInteger.prototype.compareAbs = function( v ) {
    var n = parseValue( v ),
      a = Math.abs( this.value ),
      b = n.value;

    if ( n.isSmall ) {
      b = Math.abs( b );
      return a === b ? 0 : a > b ? 1 : -1;
    }

    // A SmallInteger is generally absolutely smaller than a BigInteger (unless SmallInt is 0).
    return -1;
  };


  // --- BigInteger.prototype.compare Method ---

  /**
   * Compares `this` BigInteger with another value `v`.
   *
   * @param {number|string|BigInteger|SmallInteger} v - The value to compare with.
   * @returns {number} 1 if `this > v`, -1 if `this < v`, 0 if `this == v`.
   */
  BigInteger.prototype.compare = function( v ) {
    // Handle comparisons with JavaScript's Infinity.
    if ( v === Infinity ) {
      return -1;
    }
    if ( v === -Infinity ) {
      return 1;
    }

    var n = parseValue( v ),
      a = this.value,
      b = n.value;

    // Compare signs first.
    if ( this.sign !== n.sign ) {
      return n.sign ? 1 : -1; // If `this` is positive and `n` is negative, `this` is greater.
    }

    // If `n` is a SmallInteger, and `this` is a BigInteger (with same sign).
    if ( n.isSmall ) {
      return this.sign ? -1 : 1; // If negative, BigInt is smaller; if positive, BigInt is larger.
    }

    // Compare absolute values and then apply the sign.
    return compareAbs( a, b ) * ( this.sign ? -1 : 1 );
  };

  // Alias `compareTo` to `compare`.
  BigInteger.prototype.compareTo = BigInteger.prototype.compare;


  // --- SmallInteger.prototype.compare Method ---

  /**
   * Compares `this` SmallInteger with another value `v`.
   *
   * @param {number|string|BigInteger|SmallInteger} v - The value to compare with.
   * @returns {number} 1 if `this > v`, -1 if `this < v`, 0 if `this == v`.
   */
  SmallInteger.prototype.compare = function( v ) {
    // Handle comparisons with JavaScript's Infinity.
    if ( v === Infinity ) {
      return -1;
    }
    if ( v === -Infinity ) {
      return 1;
    }

    var n = parseValue( v ),
      a = this.value,
      b = n.value;

    // If both are SmallIntegers, use direct numeric comparison.
    if ( n.isSmall ) {
      return a == b ? 0 : a > b ? 1 : -1;
    }

    // If `a` (SmallInt) is negative and `n` (BigInt) is positive, `a` is smaller.
    // If `a` (SmallInt) is positive and `n` (BigInt) is negative, `a` is larger.
    if ( a < 0 !== n.sign ) {
      return a < 0 ? -1 : 1;
    }

    // If both have the same sign, and `n` is a BigInt, then `a` (SmallInt) is smaller.
    return a < 0 ? 1 : -1;
  };

  // Alias `compareTo` to `compare`.
  SmallInteger.prototype.compareTo = SmallInteger.prototype.compare;


  // --- Equality and Relational Operators ---

  /**
   * Checks if `this` BigInteger is equal to `v`.
   *
   * @param {number|string|BigInteger|SmallInteger} v - The value to compare.
   * @returns {boolean} True if equal, false otherwise.
   */
  BigInteger.prototype.equals = function( v ) {
    return this.compare( v ) === 0;
  };

  // Aliases for `equals`.
  SmallInteger.prototype.eq = SmallInteger.prototype.equals;
  BigInteger.prototype.eq = BigInteger.prototype.equals;


  /**
   * Checks if `this` BigInteger is not equal to `v`.
   *
   * @param {number|string|BigInteger|SmallInteger} v - The value to compare.
   * @returns {boolean} True if not equal, false otherwise.
   */
  BigInteger.prototype.notEquals = function( v ) {
    return this.compare( v ) !== 0;
  };

  // Aliases for `notEquals`.
  SmallInteger.prototype.neq = SmallInteger.prototype.notEquals;
  BigInteger.prototype.neq = BigInteger.prototype.notEquals;


  /**
   * Checks if `this` BigInteger is greater than `v`.
   *
   * @param {number|string|BigInteger|SmallInteger} v - The value to compare.
   * @returns {boolean} True if greater, false otherwise.
   */
  BigInteger.prototype.greater = function( v ) {
    return this.compare( v ) > 0;
  };

  // Aliases for `greater`.
  SmallInteger.prototype.gt = SmallInteger.prototype.greater;
  BigInteger.prototype.gt = BigInteger.prototype.greater;


  /**
   * Checks if `this` BigInteger is lesser than `v`.
   *
   * @param {number|string|BigInteger|SmallInteger} v - The value to compare.
   * @returns {boolean} True if lesser, false otherwise.
   */
  BigInteger.prototype.lesser = function( v ) {
    return this.compare( v ) < 0;
  };

  // Aliases for `lesser`.
  SmallInteger.prototype.lt = SmallInteger.prototype.lesser;
  BigInteger.prototype.lt = BigInteger.prototype.lesser;


  /**
   * Checks if `this` BigInteger is greater than or equal to `v`.
   *
   * @param {number|string|BigInteger|SmallInteger} v - The value to compare.
   * @returns {boolean} True if greater or equal, false otherwise.
   */
  BigInteger.prototype.greaterOrEquals = function( v ) {
    return this.compare( v ) >= 0;
  };

  // Aliases for `greaterOrEquals`.
  SmallInteger.prototype.geq = SmallInteger.prototype.greaterOrEquals;
  BigInteger.prototype.geq = BigInteger.prototype.greaterOrEquals;


  /**
   * Checks if `this` BigInteger is lesser than or equal to `v`.
   *
   * @param {number|string|BigInteger|SmallInteger} v - The value to compare.
   * @returns {boolean} True if lesser or equal, false otherwise.
   */
  BigInteger.prototype.lesserOrEquals = function( v ) {
    return this.compare( v ) <= 0;
  };

  // Aliases for `lesserOrEquals`.
  SmallInteger.prototype.leq = SmallInteger.prototype.lesserOrEquals;
  BigInteger.prototype.leq = BigInteger.prototype.lesserOrEquals;


  // --- Property Checks (isEven, isOdd, etc.) ---

  /**
   * Checks if `this` BigInteger is an even number.
   * This is determined by the least significant digit.
   *
   * @returns {boolean} True if even, false otherwise.
   */
  BigInteger.prototype.isEven = function() {
    return ( this.value[0] & 1 ) === 0;
  };


  /**
   * Checks if `this` SmallInteger is an even number.
   *
   * @returns {boolean} True if even, false otherwise.
   */
  SmallInteger.prototype.isEven = function() {
    return ( this.value & 1 ) === 0;
  };


  /**
   * Checks if `this` BigInteger is an odd number.
   *
   * @returns {boolean} True if odd, false otherwise.
   */
  BigInteger.prototype.isOdd = function() {
    return ( this.value[0] & 1 ) === 1;
  };


  /**
   * Checks if `this` SmallInteger is an odd number.
   *
   * @returns {boolean} True if odd, false otherwise.
   */
  SmallInteger.prototype.isOdd = function() {
    return ( this.value & 1 ) === 1;
  };


  /**
   * Checks if `this` BigInteger is a positive number.
   *
   * @returns {boolean} True if positive, false otherwise.
   */
  BigInteger.prototype.isPositive = function() {
    return !this.sign;
  };


  /**
   * Checks if `this` SmallInteger is a positive number.
   *
   * @returns {boolean} True if positive, false otherwise.
   */
  SmallInteger.prototype.isPositive = function() {
    return this.value > 0;
  };


  /**
   * Checks if `this` BigInteger is a negative number.
   *
   * @returns {boolean} True if negative, false otherwise.
   */
  BigInteger.prototype.isNegative = function() {
    return this.sign;
  };


  /**
   * Checks if `this` SmallInteger is a negative number.
   *
   * @returns {boolean} True if negative, false otherwise.
   */
  SmallInteger.prototype.isNegative = function() {
    return this.value < 0;
  };


  /**
   * Checks if `this` BigInteger is a "unit" (1 or -1).
   * By definition of its internal representation, a BigInteger is never a unit.
   *
   * @returns {boolean} Always false for BigInteger.
   */
  BigInteger.prototype.isUnit = function() {
    return false;
  };


  /**
   * Checks if `this` SmallInteger is a "unit" (1 or -1).
   *
   * @returns {boolean} True if `|value| === 1`, false otherwise.
   */
  SmallInteger.prototype.isUnit = function() {
    return Math.abs( this.value ) === 1;
  };


  /**
   * Checks if `this` BigInteger is zero.
   * By definition of its internal representation, a BigInteger is never zero.
   *
   * @returns {boolean} Always false for BigInteger.
   */
  BigInteger.prototype.isZero = function() {
    return false;
  };


  /**
   * Checks if `this` SmallInteger is zero.
   *
   * @returns {boolean} True if `value === 0`, false otherwise.
   */
  SmallInteger.prototype.isZero = function() {
    return this.value === 0;
  };


  /**
   * Checks if `this` number is divisible by `v`.
   *
   * @param {number|string|BigInteger|SmallInteger} v - The divisor.
   * @returns {boolean} True if divisible, false otherwise.
   */
  BigInteger.prototype.isDivisibleBy = function( v ) {
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

    // For other divisors, check if the remainder is zero.
    return this.mod( n ).equals( Integer[0] );
  };

  // SmallInteger also uses the same `isDivisibleBy` logic.
  SmallInteger.prototype.isDivisibleBy = BigInteger.prototype.isDivisibleBy;


  // --- Primality Tests ---

  /**
   * Performs basic primality checks for small numbers.
   *
   * @param {BigInteger|SmallInteger} v - The number to check.
   * @returns {boolean|undefined} True/False if primality is determined, undefined if more complex tests are needed.
   */
  function isBasicPrime( v ) {
    var n = v.abs(); // Work with absolute value.

    if ( n.isUnit() ) {
      return false; // 1 and -1 are not prime.
    }
    if ( n.equals( 2 ) || n.equals( 3 ) || n.equals( 5 ) ) {
      return true; // 2, 3, 5 are prime.
    }
    if ( n.isEven() || n.isDivisibleBy( 3 ) || n.isDivisibleBy( 5 ) ) {
      return false; // Not prime if divisible by 2, 3, or 5.
    }
    if ( n.lesser( 25 ) ) {
      return true; // Numbers < 25 not caught above are 7, 11, 13, 17, 19, 23 (all prime).
    }
  }


  /**
   * Checks if `this` BigInteger is a prime number using the Miller-Rabin primality test.
   * This is a probabilistic test.
   *
   * @returns {boolean} True if prime, false otherwise.
   */
  BigInteger.prototype.isPrime = function() {
    var isPrime = isBasicPrime( this );
    if ( isPrime !== undefined ) {
      return isPrime;
    }

    var n = this.abs(),
      nPrev = n.prev(); // n - 1.

    // Witness bases for Miller-Rabin test (for numbers up to a certain size).
    var a = [2, 3, 5, 7, 11, 13, 17, 19],
      b = nPrev, // Represents 'd' in n-1 = d * 2^s.
      d, t, i, x;

    // Find 'd' such that n-1 = d * 2^s (by repeatedly dividing n-1 by 2).
    while ( b.isEven() ) {
      b = b.divide( 2 );
    }

    // Perform the Miller-Rabin test for each witness `a_i`.
    for ( i = 0; i < a.length; i++ ) {
      x = bigInt( a[i] ).modPow( b, n ); // Calculate x = a^d mod n.

      if ( x.equals( Integer[1] ) || x.equals( nPrev ) ) {
        continue; // Passes this witness test.
      }

      // Check x^(2^r) mod n for r from 1 to s-1.
      for ( t = true, d = b; t && d.lesser( nPrev ); d = d.multiply( 2 ) ) {
        x = x.square().mod( n );
        if ( x.equals( nPrev ) ) {
          t = false; // Found a strong pseudoprime, passes for this witness.
        }
      }

      if ( t ) {
        return false; // Composite number found.
      }
    }

    return true; // Probably prime.
  };

  // SmallInteger also uses the same `isPrime` logic.
  SmallInteger.prototype.isPrime = BigInteger.prototype.isPrime;


  /**
   * Checks if `this` BigInteger is probably prime using the Miller-Rabin primality test
   * with a specified number of `iterations`.
   *
   * @param {number} [iterations=5] - The number of iterations (witnesses) to use.
   * @returns {boolean} True if probably prime, false otherwise.
   */
  BigInteger.prototype.isProbablePrime = function( iterations ) {
    var isPrime = isBasicPrime( this );
    if ( isPrime !== undefined ) {
      return isPrime;
    }

    var n = this.abs();
    var t = iterations === undefined ? 5 : iterations; // Default iterations to 5.

    for ( var i = 0; i < t; i++ ) {
      var a = bigInt.randBetween( 2, n.minus( 2 ) ); // Pick a random witness.
      if ( !a.modPow( n.prev(), n ).isUnit() ) {
        return false; // Composite number found.
      }
    }

    return true; // Probably prime.
  };

  // SmallInteger also uses the same `isProbablePrime` logic.
  SmallInteger.prototype.isProbablePrime = BigInteger.prototype.isProbablePrime;


  // --- Modular Inverse ---

  /**
   * Calculates the modular multiplicative inverse of `this` modulo `n`.
   * Uses the Extended Euclidean Algorithm.
   *
   * @param {number|string|BigInteger|SmallInteger} n - The modulus.
   * @returns {BigInteger|SmallInteger} The modular inverse.
   * @throws {Error} If `this` and `n` are not coprime.
   */
  BigInteger.prototype.modInv = function( n ) {
    var t = bigInt.zero,
      newT = bigInt.one,
      r = parseValue( n ),
      newR = this.abs(), // Work with absolute value for Euclidean algorithm.
      q, lastT, lastR;

    // Extended Euclidean Algorithm.
    while ( !newR.equals( bigInt.zero ) ) {
      q = r.divide( newR );
      lastT = t;
      lastR = r;
      t = newT;
      r = newR;
      newT = lastT.subtract( q.multiply( newT ) );
      newR = lastR.subtract( q.multiply( newR ) );
    }

    // If `r` is not 1, then no modular inverse exists (numbers are not coprime).
    if ( !r.equals( 1 ) ) {
      throw new Error( this.toString() + " and " + n.toString() + " are not co-prime" );
    }

    // Adjust the result `t` to be positive.
    if ( t.compare( 0 ) === -1 ) {
      t = t.add( n );
    }

    // Adjust sign if the original number was negative.
    if ( this.isNegative() ) {
      return t.negate();
    }

    return t;
  };

  // SmallInteger also uses the same `modInv` logic.
  SmallInteger.prototype.modInv = BigInteger.prototype.modInv;


  // --- Increment/Decrement ---

  /**
   * Returns the next integer (`this` + 1).
   *
   * @returns {BigInteger|SmallInteger} The incremented integer.
   */
  BigInteger.prototype.next = function() {
    var value = this.value;
    if ( this.sign ) {
      // If negative, incrementing is equivalent to subtracting 1 from its absolute value.
      return subtractSmall( value, 1, this.sign );
    }
    // If positive, simply add 1.
    return new BigInteger( addSmall( value, 1 ), this.sign );
  };


  /**
   * Returns the next integer (`this` + 1) for a SmallInteger.
   * Handles potential overflow into a BigInteger.
   *
   * @returns {BigInteger|SmallInteger} The incremented integer.
   */
  SmallInteger.prototype.next = function() {
    var value = this.value;
    // If the incremented value still fits in a SmallInteger.
    if ( value + 1 < MAX_INT ) {
      return new SmallInteger( value + 1 );
    }
    // Otherwise, convert to a BigInteger.
    return new BigInteger( MAX_INT_ARR, false );
  };


  /**
   * Returns the previous integer (`this` - 1).
   *
   * @returns {BigInteger|SmallInteger} The decremented integer.
   */
  BigInteger.prototype.prev = function() {
    var value = this.value;
    if ( this.sign ) {
      // If negative, decrementing is equivalent to adding 1 to its absolute value and keeping negative.
      return new BigInteger( addSmall( value, 1 ), true );
    }
    // If positive, simply subtract 1.
    return subtractSmall( value, 1, this.sign );
  };


  /**
   * Returns the previous integer (`this` - 1) for a SmallInteger.
   * Handles potential underflow into a BigInteger.
   *
   * @returns {BigInteger|SmallInteger} The decremented integer.
   */
  SmallInteger.prototype.prev = function() {
    var value = this.value;
    // If the decremented value still fits in a SmallInteger.
    if ( value - 1 > -MAX_INT ) {
      return new SmallInteger( value - 1 );
    }
    // Otherwise, convert to a BigInteger.
    return new BigInteger( MAX_INT_ARR, true );
  };


  // --- Bitwise Operations ---

  // Pre-calculate powers of two up to BASE for efficient chunk-wise bitwise operations.
  var powersOfTwo = [1];
  while ( 2 * powersOfTwo[powersOfTwo.length - 1] <= BASE ) {
    powersOfTwo.push( 2 * powersOfTwo[powersOfTwo.length - 1] );
  }
  var powers2Length = powersOfTwo.length;
  var highestPower2 = powersOfTwo[powers2Length - 1]; // The largest power of 2 <= BASE.


  /**
   * Checks if a shift amount `n` is small enough to be handled directly or efficiently.
   *
   * @param {number|string|BigInteger} n - The shift amount.
   * @returns {boolean} True if `n` is considered "small" for shifting, false otherwise.
   */
  function shift_isSmall( n ) {
    return ( typeof n === "number" || typeof n === "string" ) && +Math.abs( n ) <= BASE || n instanceof BigInteger && n.value.length <= 1;
  }


  /**
   * Performs a left bit shift on `this` BigInteger by `n` bits.
   * Equivalent to multiplying by 2^n.
   *
   * @param {number|string|BigInteger} n - The number of bits to shift.
   * @returns {BigInteger|SmallInteger} The shifted number.
   * @throws {Error} If the shift amount is too large.
   */
  BigInteger.prototype.shiftLeft = function( n ) {
    if ( !shift_isSmall( n ) ) {
      throw new Error( String( n ) + " is too large for shifting." );
    }
    n = +n; // Ensure `n` is a number.

    if ( n < 0 ) {
      return this.shiftRight( -n ); // Negative left shift is a right shift.
    }

    var result = this;
    if ( result.isZero() ) {
      return result;
    }

    // Perform shifts in chunks using powers of BASE.
    while ( n >= powers2Length ) {
      result = result.multiply( highestPower2 );
      n -= powers2Length - 1; // Adjust `n` for the chunk shift.
    }

    return result.multiply( powersOfTwo[n] );
  };

  // SmallInteger also uses the same `shiftLeft` logic.
  SmallInteger.prototype.shiftLeft = BigInteger.prototype.shiftLeft;


  /**
   * Performs a right bit shift on `this` BigInteger by `n` bits.
   * Equivalent to integer division by 2^n.
   *
   * @param {number|string|BigInteger} n - The number of bits to shift.
   * @returns {BigInteger|SmallInteger} The shifted number.
   * @throws {Error} If the shift amount is too large.
   */
  BigInteger.prototype.shiftRight = function( n ) {
    var remQuo;
    if ( !shift_isSmall( n ) ) {
      throw new Error( String( n ) + " is too large for shifting." );
    }
    n = +n; // Ensure `n` is a number.

    if ( n < 0 ) {
      return this.shiftLeft( -n ); // Negative right shift is a left shift.
    }

    var result = this;
    if ( result.isZero() || ( result.isNegative() && result.isUnit() ) ) {
      return result; // Shifting 0 or -1 right results in 0 or -1.
    }

    // Perform shifts in chunks using powers of BASE.
    while ( n >= powers2Length ) {
      remQuo = divModAny( result, highestPower2 );
      result = remQuo[1].isNegative() ? remQuo[0].prev() : remQuo[0]; // Floor division for negative numbers.
      n -= powers2Length - 1; // Adjust `n` for the chunk shift.
    }

    remQuo = divModAny( result, powersOfTwo[n] );
    return remQuo[1].isNegative() ? remQuo[0].prev() : remQuo[0]; // Floor division for negative numbers.
  };

  // SmallInteger also uses the same `shiftRight` logic.
  SmallInteger.prototype.shiftRight = BigInteger.prototype.shiftRight;


  /**
   * Generic bitwise operation function.
   * It processes numbers chunk by chunk (digits in base `highestPower2`)
   * and handles two's complement representation for negative numbers.
   *
   * @param {BigInteger|SmallInteger} x - The first operand.
   * @param {number|string|BigInteger|SmallInteger} y - The second operand.
   * @param {function(number, number): number} fn - The bitwise function to apply (e.g., `(a, b) => a & b`).
   * @returns {BigInteger|SmallInteger} The result of the bitwise operation.
   */
  function bitwise( x, y, fn ) {
    y = parseValue( y );

    var xSign = x.isNegative(),
      ySign = y.isNegative();

    // Convert to two's complement for negative numbers (effectively `-(value + 1)`).
    var xRem = xSign ? x.not() : x,
      yRem = ySign ? y.not() : y;

    var xDigit = 0,
      yDigit = 0;
    var xDivMod = null,
      yDivMod = null;
    var result = [];

    // Process digits (chunks) from least significant to most significant.
    while ( !xRem.isZero() || !yRem.isZero() ) {
      xDivMod = divModAny( xRem, highestPower2 );
      xDigit = xDivMod[1].toJSNumber(); // Get the current chunk (remainder).
      if ( xSign ) {
        xDigit = highestPower2 - 1 - xDigit; // Invert bits for two's complement.
      }

      yDivMod = divModAny( yRem, highestPower2 );
      yDigit = yDivMod[1].toJSNumber();
      if ( ySign ) {
        yDigit = highestPower2 - 1 - yDigit;
      }

      xRem = xDivMod[0]; // Remaining part of `x` (quotient).
      yRem = yDivMod[0]; // Remaining part of `y` (quotient).

      result.push( fn( xDigit, yDigit ) ); // Apply the bitwise function to the current chunks.
    }

    // Handle final sign propagation based on the bitwise operation of the original signs.
    var sum = fn( xSign ? 1 : 0, ySign ? 1 : 0 ) !== 0 ? bigInt( -1 ) : bigInt( 0 );

    // Reconstruct the result from the processed chunks.
    for ( var i = result.length - 1; i >= 0; i -= 1 ) {
      sum = sum.multiply( highestPower2 ).add( bigInt( result[i] ) );
    }

    return sum;
  }


  /**
   * Performs a bitwise NOT operation on `this` BigInteger.
   * For integers, NOT(x) is equivalent to -(x+1).
   *
   * @returns {BigInteger|SmallInteger} The result of the NOT operation.
   */
  BigInteger.prototype.not = function() {
    return this.negate().prev();
  };

  // SmallInteger also uses the same `not` logic.
  SmallInteger.prototype.not = BigInteger.prototype.not;


  /**
   * Performs a bitwise AND operation between `this` BigInteger and `n`.
   *
   * @param {number|string|BigInteger|SmallInteger} n - The second operand.
   * @returns {BigInteger|SmallInteger} The result of the AND operation.
   */
  BigInteger.prototype.and = function( n ) {
    return bitwise( this, n, function( a, b ) {
      return a & b;
    } );
  };

  // SmallInteger also uses the same `and` logic.
  SmallInteger.prototype.and = BigInteger.prototype.and;


  /**
   * Performs a bitwise OR operation between `this` BigInteger and `n`.
   *
   * @param {number|string|BigInteger|SmallInteger} n - The second operand.
   * @returns {BigInteger|SmallInteger} The result of the OR operation.
   */
  BigInteger.prototype.or = function( n ) {
    return bitwise( this, n, function( a, b ) {
      return a | b;
    } );
  };

  // SmallInteger also uses the same `or` logic.
  SmallInteger.prototype.or = BigInteger.prototype.or;


  /**
   * Performs a bitwise XOR operation between `this` BigInteger and `n`.
   *
   * @param {number|string|BigInteger|SmallInteger} n - The second operand.
   * @returns {BigInteger|SmallInteger} The result of the XOR operation.
   */
  BigInteger.prototype.xor = function( n ) {
    return bitwise( this, n, function( a, b ) {
      return a ^ b;
    } );
  };

  // SmallInteger also uses the same `xor` logic.
  SmallInteger.prototype.xor = BigInteger.prototype.xor;


  // --- Other Mathematical Functions ---

  // Constants for `roughLOB` (Least One Bit) calculation.
  var LOBMASK_I = 1 << 30, // Mask for JavaScript integers.
    LOBMASK_BI = ( BASE & -BASE ) * ( BASE & -BASE ) | LOBMASK_I; // Mask for BigInt digits.


  /**
   * Calculates a rough approximation of the least significant bit (LSB) position.
   * Used as an optimization in the GCD algorithm.
   *
   * @param {BigInteger|SmallInteger} n - The number.
   * @returns {number} A number representing the LSB.
   */
  function roughLOB( n ) {
    var v = n.value,
      x = typeof v === "number" ? v | LOBMASK_I : v[0] + v[1] * BASE | LOBMASK_BI;
    return x & -x; // Returns the lowest set bit.
  }


  /**
   * Calculates the integer logarithm (base `base`) of `value`.
   * This is a recursive function.
   *
   * @param {BigInteger} value - The number for which to calculate the logarithm.
   * @param {BigInteger} base - The base of the logarithm.
   * @returns {{p: BigInteger, e: number}} An object containing the power `p` and exponent `e`.
   */
  function integerLogarithm( value, base ) {
    if ( base.compareTo( value ) <= 0 ) {
      var tmp = integerLogarithm( value, base.square() ); // Recursively call for base^2.
      var p = tmp.p;
      var e = tmp.e;
      var t = p.multiply( base );
      // Adjust exponent based on comparison.
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
    }; // Base case: value < base, log is 0.
  }


  /**
   * Calculates the bit length (number of bits required to represent) of `this` BigInteger.
   *
   * @returns {BigInteger} The bit length as a BigInt.
   */
  BigInteger.prototype.bitLength = function() {
    var n = this;

    // Adjust for negative numbers (two's complement representation).
    if ( n.compareTo( bigInt( 0 ) ) < 0 ) {
      n = n.negate().subtract( bigInt( 1 ) );
    }

    if ( n.compareTo( bigInt( 0 ) ) === 0 ) {
      return bigInt( 0 ); // Bit length of 0 is 0.
    }

    // Use integer logarithm base 2 to find the bit length.
    return bigInt( integerLogarithm( n, bigInt( 2 ) ).e ).add( bigInt( 1 ) );
  };

  // SmallInteger also uses the same `bitLength` logic.
  SmallInteger.prototype.bitLength = BigInteger.prototype.bitLength;


  /**
   * Returns the maximum of two numbers.
   *
   * @param {number|string|BigInteger|SmallInteger} a - The first number.
   * @param {number|string|BigInteger|SmallInteger} b - The second number.
   * @returns {BigInteger|SmallInteger} The larger of the two numbers.
   */
  function max( a, b ) {
    a = parseValue( a );
    b = parseValue( b );
    return a.greater( b ) ? a : b;
  }


  /**
   * Returns the minimum of two numbers.
   *
   * @param {number|string|BigInteger|SmallInteger} a - The first number.
   * @param {number|string|BigInteger|SmallInteger} b - The second number.
   * @returns {BigInteger|SmallInteger} The smaller of the two numbers.
   */
  function min( a, b ) {
    a = parseValue( a );
    b = parseValue( b );
    return a.lesser( b ) ? a : b;
  }


  /**
   * Calculates the greatest common divisor (GCD) of two numbers using the binary GCD algorithm.
   *
   * @param {number|string|BigInteger|SmallInteger} a - The first number.
   * @param {number|string|BigInteger|SmallInteger} b - The second number.
   * @returns {BigInteger|SmallInteger} The GCD.
   */
  function gcd( a, b ) {
    a = parseValue( a ).abs(); // Work with absolute values.
    b = parseValue( b ).abs();

    if ( a.equals( b ) ) {
      return a; // If numbers are equal, GCD is itself.
    }
    if ( a.isZero() ) {
      return b; // GCD(0, b) = b.
    }
    if ( b.isZero() ) {
      return a; // GCD(a, 0) = a.
    }

    var c = Integer[1], // Factor to accumulate common powers of 2.
      d, t;

    // Step 1: Remove common factors of 2.
    while ( a.isEven() && b.isEven() ) {
      d = Math.min( roughLOB( a ), roughLOB( b ) ); // Find the lowest set bit in both.
      a = a.divide( d );
      b = b.divide( d );
      c = c.multiply( d );
    }

    // Step 2: Remove factors of 2 from `a`.
    while ( a.isEven() ) {
      a = a.divide( roughLOB( a ) );
    }

    // Step 3: Euclidean algorithm (modified for binary GCD).
    do {
      while ( b.isEven() ) {
        b = b.divide( roughLOB( b ) );
      }
      if ( a.greater( b ) ) {
        t = b;
        b = a;
        a = t;
      }
      b = b.subtract( a );
    } while ( !b.isZero() );

    return c.isUnit() ? a : a.multiply( c ); // Multiply by the accumulated common factors of 2.
  }


  /**
   * Calculates the least common multiple (LCM) of two numbers.
   * LCM(a, b) = |a * b| / GCD(a, b).
   *
   * @param {number|string|BigInteger|SmallInteger} a - The first number.
   * @param {number|string|BigInteger|SmallInteger} b - The second number.
   * @returns {BigInteger|SmallInteger} The LCM.
   */
  function lcm( a, b ) {
    a = parseValue( a ).abs();
    b = parseValue( b ).abs();
    return a.divide( gcd( a, b ) ).multiply( b );
  }


  /**
   * Generates a random BigInteger between `a` and `b` (inclusive).
   *
   * @param {number|string|BigInteger|SmallInteger} a - The lower bound.
   * @param {number|string|BigInteger|SmallInteger} b - The upper bound.
   * @returns {BigInteger|SmallInteger} The random number.
   */
  function randBetween( a, b ) {
    a = parseValue( a );
    b = parseValue( b );

    var low = min( a, b ),
      high = max( a, b );
    var range = high.subtract( low ).add( 1 );

    // If the range is small, use `Math.random` directly.
    if ( range.isSmall ) {
      return low.add( Math.floor( Math.random() * range ) );
    }

    var length = range.value.length - 1;
    var result = [];
    var restricted = true; // Flag to ensure digits stay within the range bounds.

    // Generate digits from most significant to least significant.
    for ( var i = length; i >= 0; i-- ) {
      var top = restricted ? range.value[i] : BASE; // Upper limit for the current digit.
      var digit = truncate( Math.random() * top );
      result.unshift( digit ); // Add digit to the front.
      if ( digit < top ) {
        restricted = false; // If digit is less than max, subsequent digits can be anything.
      }
    }

    result = arrayToSmall( result ); // Attempt to convert to SmallInteger.

    return low.add( typeof result === "number" ? new SmallInteger( result ) : new BigInteger( result, false ) );
  }


  // --- Base Conversion and String Representation ---

  /**
   * Parses a string `text` in a given `base` into an Integer object.
   *
   * @param {string} text - The string representation of the number.
   * @param {number|BigInteger|SmallInteger} base - The base (radix) of the string.
   * @returns {BigInteger|SmallInteger} The parsed integer.
   * @throws {Error} If the string contains invalid digits for the given base.
   */
  var parseBase = function( text, base ) {
    var length = text.length;
    var i;
    var absBase = Math.abs( base );

    // First pass: validate digits for the given base.
    for ( i = 0; i < length; i++ ) {
      var c = text[i].toLowerCase();
      if ( c === "-" ) {
        continue;
      }
      if ( /[a-z0-9]/.test( c ) ) {
        // Check if digit is valid for numeric bases.
        if ( /[0-9]/.test( c ) && +c >= absBase ) {
          if ( c === "1" && absBase === 1 ) {
            continue; // Special case for base 1.
          }
          throw new Error( c + " is not a valid digit in base " + base + "." );
        }
        // Check if digit is valid for alphanumeric bases (a-z).
        else if ( c.charCodeAt( 0 ) - 87 >= absBase ) { // 'a' is 97, so 'a'-87=10.
          throw new Error( c + " is not a valid digit in base " + base + "." );
        }
      }
    }

    // Optimization for common bases (2-36) that fit in JS number.
    if ( 2 <= base && base <= 36 ) {
      // Check if the number of digits allows parsing with `parseInt`.
      if ( length <= LOG_MAX_INT / Math.log( base ) ) {
        var result = parseInt( text, base );
        if ( isNaN( result ) ) {
          // This case should ideally be caught by initial validation, but included for robustness.
          throw new Error( c + " is not a valid digit in base " + base + "." );
        }
        return new SmallInteger( parseInt( text, base ) );
      }
    }

    // General case for arbitrary large base or number.
    base = parseValue( base ); // Ensure base is an Integer object.
    var digits = [];
    var isNegative = text[0] === "-";

    // Convert string digits to Integer objects.
    for ( i = isNegative ? 1 : 0; i < text.length; i++ ) {
      var c = text[i].toLowerCase(),
        charCode = c.charCodeAt( 0 );

      if ( 48 <= charCode && charCode <= 57 ) { // '0'-'9'.
        digits.push( parseValue( c ) );
      } else if ( 97 <= charCode && charCode <= 122 ) { // 'a'-'z'.
        digits.push( parseValue( charCode - 87 ) ); // 'a' -> 10, 'b' -> 11, etc.
      } else if ( c === "<" ) { // Handle custom digits like "<10>".
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


  /**
   * Parses an array of digits (represented as Integer objects) in a given `base`
   * into a single Integer object.
   *
   * @param {BigInteger[]|SmallInteger[]} digits - An array of digit Integer objects.
   * @param {BigInteger|SmallInteger} base - The base (radix).
   * @param {boolean} isNegative - True if the number is negative.
   * @returns {BigInteger|SmallInteger} The parsed integer.
   */
  function parseBaseFromArray( digits, base, isNegative ) {
    var val = Integer[0], // Accumulator, starts at 0.
      pow = Integer[1], // Current power of base, starts at 1.
      i;

    // Polynomial evaluation: sum(digit_i * base^i).
    for ( i = digits.length - 1; i >= 0; i-- ) {
      val = val.add( digits[i].times( pow ) );
      pow = pow.times( base );
    }

    return isNegative ? val.negate() : val;
  }


  /**
   * Converts a single digit (0-35) to its string representation (0-9, a-z)
   * or wraps larger digits in angle brackets (e.g., "<36>").
   *
   * @param {number} digit - The digit to stringify.
   * @returns {string} The string representation of the digit.
   */
  function stringify( digit ) {
    if ( digit <= 35 ) {
      return "0123456789abcdefghijklmnopqrstuvwxyz".charAt( digit );
    }
    return "<" + digit + ">";
  }


  /**
   * Converts an Integer object to an array of digits in a specified base.
   *
   * @param {BigInteger|SmallInteger} n - The number to convert.
   * @param {BigInteger|SmallInteger} base - The target base.
   * @returns {{value: number[], isNegative: boolean}} An object containing the digit array and sign.
   * @throws {Error} For invalid base conversions (e.g., nonzero to base 0).
   */
  function toBase( n, base ) {
    base = bigInt( base ); // Ensure base is an Integer object.

    if ( base.isZero() ) {
      if ( n.isZero() ) {
        return {
          value: [0],
          isNegative: false
        }; // 0 in base 0 is [0].
      }
      throw new Error( "Cannot convert nonzero numbers to base 0." );
    }

    if ( base.equals( -1 ) ) {
      if ( n.isZero() ) {
        return {
          value: [0],
          isNegative: false
        };
      }
      if ( n.isNegative() ) {
        // Example: -5 in base -1 is [1,0,1,0,1,0,1,0,1,0]
        return {
          value: [].concat.apply( [], Array.apply( null, Array( -n ) ).map( Array.prototype.valueOf, [1, 0] ) ),
          isNegative: false
        };
      }
      // Example: 5 in base -1 is [1,0,1,0,1]
      var arr = Array.apply( null, Array( +n - 1 ) ).map( Array.prototype.valueOf, [0, 1] );
      arr.unshift( [1] );
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

    if ( base.equals( 1 ) ) {
      if ( n.isZero() ) {
        return {
          value: [0],
          isNegative: false
        };
      }
      // Example: 5 in base 1 is [1,1,1,1,1]
      return {
        value: Array.apply( null, Array( +n ) ).map( Number.prototype.valueOf, 1 ),
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

      // Adjust for negative remainders in non-standard bases.
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
    }; // Reverse to get the correct order of digits.
  }


  /**
   * Converts an Integer object to its string representation in a specified base.
   *
   * @param {BigInteger|SmallInteger} n - The number to convert.
   * @param {BigInteger|SmallInteger} base - The target base.
   * @returns {string} The string representation of the number.
   */
  function toBaseString( n, base ) {
    var arr = toBase( n, base );
    return ( arr.isNegative ? "-" : "" ) + arr.value.map( stringify ).join( "" );
  }


  // --- BigInteger.prototype.toArray Method ---

  /**
   * Converts `this` BigInteger to an array of digits in a specified radix (base).
   *
   * @param {number} radix - The base for the conversion.
   * @returns {{value: number[], isNegative: boolean}} Object with digit array and sign.
   */
  BigInteger.prototype.toArray = function( radix ) {
    return toBase( this, radix );
  };

  // SmallInteger also uses the same `toArray` logic.
  SmallInteger.prototype.toArray = function( radix ) {
    return toBase( this, radix );
  };


  // --- BigInteger.prototype.toString Method ---

  /**
   * Converts `this` BigInteger to its string representation.
   * Defaults to base 10, but can convert to other bases.
   *
   * @param {number} [radix=10] - The base for the string representation.
   * @returns {string} The string representation of the number.
   */
  BigInteger.prototype.toString = function( radix ) {
    if ( radix === undefined ) {
      radix = 10;
    }

    if ( radix !== 10 ) {
      return toBaseString( this, radix );
    }

    var v = this.value,
      l = v.length,
      str = String( v[--l] ), // Start with the most significant digit.
      zeros = "0000000", // Used for padding digits to `LOG_BASE` length.
      digit;

    // Concatenate digits, padding with zeros for consistent length.
    while ( --l >= 0 ) {
      digit = String( v[l] );
      str += zeros.slice( digit.length ) + digit;
    }

    var sign = this.sign ? "-" : "";
    return sign + str;
  };


  // --- SmallInteger.prototype.toString Method ---

  /**
   * Converts `this` SmallInteger to its string representation.
   * Defaults to base 10, but can convert to other bases.
   *
   * @param {number} [radix=10] - The base for the string representation.
   * @returns {string} The string representation of the number.
   */
  SmallInteger.prototype.toString = function( radix ) {
    if ( radix === undefined ) {
      radix = 10;
    }

    if ( radix != 10 ) {
      return toBaseString( this, radix );
    }

    return String( this.value );
  };


  // --- JSON Serialization ---

  /**
   * Returns the string representation of the number for JSON serialization.
   *
   * @returns {string} The string representation.
   */
  BigInteger.prototype.toJSON = SmallInteger.prototype.toJSON = function() {
    return this.toString();
  };


  // --- Value Conversion to JavaScript Number ---

  /**
   * Converts `this` BigInteger to a JavaScript number.
   * Note: This may result in loss of precision for very large numbers.
   *
   * @returns {number} The JavaScript number representation.
   */
  BigInteger.prototype.valueOf = function() {
    return parseInt( this.toString(), 10 );
  };

  // Alias `toJSNumber` to `valueOf`.
  BigInteger.prototype.toJSNumber = BigInteger.prototype.valueOf;


  /**
   * Converts `this` SmallInteger to a JavaScript number.
   *
   * @returns {number} The JavaScript number representation.
   */
  SmallInteger.prototype.valueOf = function() {
    return this.value;
  };

  // Alias `toJSNumber` to `valueOf`.
  SmallInteger.prototype.toJSNumber = SmallInteger.prototype.valueOf;


  // --- Parsing Input Values ---

  /**
   * Parses a string `v` into a BigInteger or SmallInteger.
   * Handles scientific notation and validates integer format.
   *
   * @param {string} v - The string to parse.
   * @returns {BigInteger|SmallInteger} The parsed integer.
   * @throws {Error} If the string is not a valid integer.
   */
  function parseStringValue( v ) {
    // Attempt to parse as a precise small integer directly.
    if ( isPrecise( +v ) ) {
      var x = +v;
      if ( x === truncate( x ) ) {
        return new SmallInteger( x );
      }
      throw new Error( "Invalid integer: " + v ); // Not an integer.
    }

    var sign = v[0] === "-";
    if ( sign ) {
      v = v.slice( 1 ); // Remove sign for parsing digits.
    }

    var split = v.split( /e/i ); // Handle scientific notation (e.g., "1.23e+4").
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
        throw new Error( "Cannot include negative exponent part for integers" );
      }

      text += new Array( exp + 1 ).join( "0" ); // Add trailing zeros for the exponent.
      v = text;
    }

    // Validate the resulting string contains only digits.
    var isValid = /^([0-9][0-9]*)$/.test( v );
    if ( !isValid ) {
      throw new Error( "Invalid integer: " + v );
    }

    var r = [];
    var max = v.length;
    var l = LOG_BASE; // Length of each digit in string form.
    var min = max - l;

    // Split the string into chunks (digits in base BASE).
    while ( max > 0 ) {
      r.push( +v.slice( min, max ) );
      min -= l;
      if ( min < 0 ) {
        min = 0;
      }
      max -= l;
    }

    trim( r ); // Remove leading zeros from the digit array.
    return new BigInteger( r, sign );
  }


  /**
   * Parses a number `v` into a BigInteger or SmallInteger.
   *
   * @param {number} v - The number to parse.
   * @returns {BigInteger|SmallInteger} The parsed integer.
   * @throws {Error} If the number is not an integer.
   */
  function parseNumberValue( v ) {
    if ( isPrecise( v ) ) {
      if ( v !== truncate( v ) ) {
        throw new Error( v + " is not an integer." );
      }
      return new SmallInteger( v );
    }
    // If the number is too large or imprecise, convert to string and parse.
    return parseStringValue( v.toString() );
  }


  /**
   * General purpose parser for various input types into an Integer object.
   *
   * @param {number|string|BigInteger|SmallInteger} v - The value to parse.
   * @returns {BigInteger|SmallInteger} The parsed integer.
   */
  function parseValue( v ) {
    if ( typeof v === "number" ) {
      return parseNumberValue( v );
    }
    if ( typeof v === "string" ) {
      return parseStringValue( v );
    }
    return v; // Assume it's already an Integer object.
  }


  // --- Integer Cache and Static Properties ---

  // Pre-populate a cache for frequently used small integers (0 to 999).
  for ( var i = 0; i < 1e3; i++ ) {
    Integer[i] = new SmallInteger( i );
    if ( i > 0 ) {
      Integer[-i] = new SmallInteger( -i );
    }
  }

  // Define common integer constants for easy access.
  Integer.one = Integer[1];
  Integer.zero = Integer[0];
  Integer.minusOne = Integer[-1];

  // Expose utility functions as static methods of the Integer factory.
  Integer.max = max;
  Integer.min = min;
  Integer.gcd = gcd;
  Integer.lcm = lcm;

  /**
   * Checks if an object is an instance of BigInteger or SmallInteger.
   *
   * @param {*} x - The object to check.
   * @returns {boolean} True if `x` is an Integer object, false otherwise.
   */
  Integer.isInstance = function( x ) {
    return x instanceof BigInteger || x instanceof SmallInteger;
  };

  Integer.randBetween = randBetween;

  /**
   * Creates an Integer from an array of digits in a specified base.
   *
   * @param {Array<number|string|BigInteger|SmallInteger>} digits - An array of digits.
   * @param {number|string|BigInteger|SmallInteger} [base=10] - The base of the digits.
   * @param {boolean} [isNegative] - True if the number is negative.
   * @returns {BigInteger|SmallInteger} The constructed integer.
   */
  Integer.fromArray = function( digits, base, isNegative ) {
    return parseBaseFromArray( digits.map( parseValue ), parseValue( base || 10 ), isNegative );
  };


  return Integer; // Return the main Integer factory function.
}();


/*
 * GET Input Parser Module
 * This module provides functions to parse input from standard input.
 * It's designed to read lines, split them, and convert to numbers or strings.
 */
var GET = ( function() {

  // Factory function: Creates a new parser instance.
  function f( s ) {
    return new g( s );
  }

  // Constructor for the parser object.
  function g( s ) {
    this._s = s.trim().split( "\n" ); // Trim whitespace and split input into lines.
    this._y = 0; // Initialize line index to 0.
  }

  /**
   * Reads a single value from the current line.
   * If the line contains multiple values, it reads them from right to left (simulating a stack).
   *
   * @param {boolean} [f] - If true, return as string; otherwise, convert to number.
   * @returns {string|number} The parsed value.
   */
  g.prototype.a = function( f ) {
    var s = this._s,
      y = this._y,
      r;

    // If the current line hasn't been split yet, split it by spaces and reverse for efficient `pop`.
    if ( typeof s[y] === "string" ) {
      s[y] = s[y].split( " " ).reverse();
    }

    r = s[y].pop(); // Get the last element (which was the first in original order).

    // If the current line is now empty, advance to the next line.
    if ( !s[y].length ) {
      this._y++;
    }

    // Return the value, converting to number if `f` is false.
    return f ? r : +r;
  };

  /**
   * Reads an entire line of values.
   *
   * @param {boolean} [f] - If true, return array of strings; otherwise, return array of numbers.
   * @returns {Array<string|number>} The parsed line.
   */
  g.prototype.l = function( f ) {
    // Get the current line, split it by spaces, and advance the line index.
    var line = this._s[this._y++].split( " " );
    return f ? line : line.map( a => +a ); // Convert elements to numbers if `f` is false.
  };

  /**
   * Reads multiple lines, treating them as a matrix of values.
   *
   * @param {number} n - The number of lines (rows) to read.
   * @param {boolean} [f] - If true, return matrix of strings; otherwise, return matrix of numbers.
   * @returns {Array<Array<string|number>>} The parsed matrix.
   */
  g.prototype.m = function( n, f ) {
    // Slice `n` lines from the input, splitting each line by spaces.
    var r = this._s.slice( this._y, this._y += n ).map( a => a.split( " " ) );
    // Convert inner arrays to numbers if `f` is false.
    return f ? r : r.map( a => a.map( a => +a ) );
  };

  /**
   * Reads multiple lines as raw strings or converts them to numbers.
   *
   * @param {number} n - The number of lines to read.
   * @param {boolean} [f] - If true, return array of strings; otherwise, return array of numbers.
   * @returns {Array<string|number>} The parsed lines.
   */
  g.prototype.r = function( n, f ) {
    var r = this._s.slice( this._y, this._y += n ); // Slice `n` lines from the input.
    return f ? r : r.map( a => +a ); // Convert elements to numbers if `f` is false.
  };

  return f; // Return the factory function `f`.
} )();


// Initialize the GET parser with input read from `/dev/stdin`.
// This assumes a Node.js environment where `require("fs")` is available.
var o = GET( require( "fs" ).readFileSync( "/dev/stdin", "utf8" ) );


/**
 * Dynamically creates a multi-dimensional array initialized with a given value.
 * This function uses `eval` for dynamic array creation, which should be used with caution.
 *
 * @param {*} v - The initial value for each element.
 * @param {...number} dimensions - The dimensions of the array (e.g., d1, d2, d3).
 * @returns {Array} The created multi-dimensional array.
 */
function xArray( v ) {
  var a = arguments,
    l = a.length,
    // Construct the innermost array creation string.
    r = "Array(a[" + ( --l ) + "]).fill(0).map(x=>{return " + v + ";})";

  // Wrap with outer array creation strings for each remaining dimension.
  while ( --l ) {
    r = "Array(a[" + l + "]).fill(0).map(x=>" + r + ")";
  }

  return eval( r ); // Execute the dynamically generated code.
}


// Initialize an instance of the bigInt library.
var bi = bigInt();


// Execute the main function and print its result to the console.
console.log( main() );


/**
 * The main logic function for the program.
 * It reads an integer `n` from input, performs calculations using the bigInt library,
 * and outputs a formatted string based on the result.
 *
 * @returns {string} The formatted result string.
 */
function main() {
  // Read a single integer from input using the GET parser.
  var n = o.a( 1 );

  // Add the input number `n` to the bigInt instance (effectively `bi + n`).
  var s = bi.add( n );

  // Initialize an array to store parts of the final answer.
  var ans = [0, 0, 1e9]; // Default initial values.

  // Check if `s` is perfectly divisible by 1e9 (1,000,000,000).
  if ( s.mod( 1e9 ).isZero() ) {
    ans.push( 0 ); // Add 0 as a specific result component.
    ans.push( 0 ); // Add another 0.
    ans.push( s.divide( 1e9 ).toString() ); // Add the quotient (s / 1e9) as a string.
    return ans.join( " " ); // Join array elements with spaces and return.
  }

  // If `s` is not perfectly divisible by 1e9, execute the alternative calculation path.
  ans.push( 1 ); // Add 1 as a different result component.

  // Calculate `t`: (s + 999,999,999) / 1,000,000,000.
  // This effectively calculates ceil(s / 1e9) for positive `s`.
  var t = s.add( 999999999 ).divide( 1e9 );

  // Calculate the difference: (t * 1e9) - s.
  // This represents the amount needed to add to `s` to reach the next multiple of 1e9.
  ans.push( t.times( 1e9 ).minus( s ).toString() );

  // Add `t` itself as a string.
  ans.push( t.toString() );

  return ans.join( " " ); // Join array elements with spaces and return.
}