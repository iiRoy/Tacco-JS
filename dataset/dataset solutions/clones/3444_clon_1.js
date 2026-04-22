var bigInt = function (undefined) {
  "use strict" ; // Use strict mode for cleaner code.

  // --- Constants and Core Definitions ---
  var BASE = 1e7,       // Base for internal number representation (10^7).
      LOG_BASE = 7,     // Logarithm of BASE (log10(10^7) = 7).
      MAX_INT = 9007199254740992, // Max safe integer in JavaScript (2^53 - 1).
      MAX_INT_ARR = smallToArray(MAX_INT), // MAX_INT represented as an array of base-BASE digits.
      LOG_MAX_INT = Math.log(MAX_INT); // Natural logarithm of MAX_INT.


  /**
   * The main constructor for bigInt objects.
   * Handles initialization from various types and bases.
   * @param {string|number|BigInteger|SmallInteger} v - The value to parse.
   * @param {number} [radix] - The base of the input string `v`.
   * @returns {BigInteger|SmallInteger} A new bigInt instance.
   */
  function Integer(v, radix) {

    if ( typeof v === "undefined" ) {
      return Integer[0]; // Default to zero if no value is provided.
    }

    if ( typeof radix !== "undefined" ) {
      // Handle different radices.
      return +radix === 10 ? parseValue(v) : parseBase(v, radix);
    }
    return parseValue(v); // Parse value if no radix is specified.
  }

  // --- BigInteger Class ---
  /**
   * Represents a large integer that exceeds JavaScript's safe integer limit.
   * Stores value as an array of digits in base BASE.
   * @param {number[]} value - Array of digits.
   * @param {boolean} sign - True if negative, false if positive.
   */
  function BigInteger(value, sign) {
    this.value = value;
    this.sign = sign;
    this.isSmall = false; // Flag to distinguish from SmallInteger.
  }

  BigInteger.prototype = Object.create(Integer.prototype); // Inherit from Integer.


  // --- SmallInteger Class ---
  /**
   * Represents an integer that fits within JavaScript's safe integer limit.
   * @param {number} value - The integer value.
   */
  function SmallInteger(value) {
    this.value = value;
    this.sign = value < 0;
    this.isSmall = true; // Flag to distinguish from BigInteger.
  }

  SmallInteger.prototype = Object.create(Integer.prototype); // Inherit from Integer.


  // --- Utility Functions ---

  /**
   * Checks if a number can be precisely represented as a JavaScript number.
   * @param {number} n - The number to check.
   * @returns {boolean} True if precise, false otherwise.
   */
  function isPrecise(n) {
    return -MAX_INT < n && n < MAX_INT;
  }

  /**
   * Converts a small JavaScript number into an array of base-BASE digits.
   * @param {number} n - The number to convert.
   * @returns {number[]} Array of digits.
   */
  function smallToArray(n) {
    if ( n < 1e7 ) {
      return [n];
    }

    if ( n < 1e14 ) {
      return [n % 1e7, Math.floor(n / 1e7)];
    }

    // For numbers up to 1e21 (approx MAX_INT).
    return [n % 1e7, Math.floor(n / 1e7) % 1e7, Math.floor(n / 1e14)];
  }

  /**
   * Converts an array of base-BASE digits back to a small JavaScript number if possible.
   * @param {number[]} arr - Array of digits.
   * @returns {number|number[]} The number if small, otherwise the array itself.
   */
  function arrayToSmall(arr) {
    trim(arr); // Remove leading zeros.
    var length = arr.length;

    if ( length < 4 && compareAbs(arr, MAX_INT_ARR) < 0 ) {
      switch ( length ) {
        case 0:
          return 0;
        case 1:
          return arr[0];
        case 2:
          return arr[0] + arr[1] * BASE;
        default: // case 3
          return arr[0] + (arr[1] + arr[2] * BASE) * BASE;
      }
    }
    return arr;
  }

  /**
   * Removes leading zeros from a digit array.
   * @param {number[]} v - The digit array to trim.
   */
  function trim(v) {
    var i = v.length;
    while (v[--i] === 0);
    v.length = i + 1;
  }

  /**
   * Creates a new array filled with zeros.
   * @param {number} length - The desired length of the array.
   * @returns {number[]} A new array of zeros.
   */
  function createArray(length) {
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
   * @returns {number} The truncated number.
   */
  function truncate(n) {
    if ( n > 0 ) return Math.floor(n);
    return Math.ceil(n);
  }


  // --- Arithmetic Operations (Internal) ---

  /**
   * Adds two digit arrays (representing positive numbers).
   * Assumes `a` is longer or equal in length to `b`.
   * @param {number[]} a - First digit array.
   * @param {number[]} b - Second digit array.
   * @returns {number[]} Resulting digit array.
   */
  function add(a, b) {
    var l_a = a.length,
        l_b = b.length,
        r = new Array(l_a),
        carry = 0,
        base = BASE,
        sum, i;

    for ( i = 0; i < l_b; i++ ) {
      sum = a[i] + b[i] + carry;
      carry = sum >= base ? 1 : 0;
      r[i] = sum - carry * base;
    }

    while ( i < l_a ) {
      sum = a[i] + carry;
      carry = sum === base ? 1 : 0;
      r[i++] = sum - carry * base;
    }

    if ( carry > 0 ) {
      r.push(carry);
    }
    return r;
  }

  /**
   * Adds two digit arrays, handling their lengths.
   * @param {number[]} a - First digit array.
   * @param {number[]} b - Second digit array.
   * @returns {number[]} Resulting digit array.
   */
  function addAny(a, b) {
    if ( a.length >= b.length ) {
      return add(a, b);
    }
    return add(b, a);
  }

  /**
   * Adds a small number (carry) to a digit array.
   * Used when one operand is small and needs to be added to a large number's digits.
   * @param {number[]} a - Digit array.
   * @param {number} carry - Small number to add.
   * @returns {number[]} Resulting digit array.
   */
  function addSmall(a, carry) {
    var l = a.length,
        r = new Array(l),
        base = BASE,
        sum, i;

    for ( i = 0; i < l; i++ ) {
      sum = a[i] - base + carry; // Trick to allow negative sum for carry calculation.
      carry = Math.floor(sum / base);
      r[i] = sum - carry * base;
      carry += 1;
    }

    while ( carry > 0 ) {
      r[i++] = carry % base;
      carry = Math.floor(carry / base);
    }
    return r;
  }


  // --- BigInteger.prototype.add ---
  BigInteger.prototype.add = function (v) {
    var n = parseValue(v); // Ensure `v` is a bigInt object.

    if ( this.sign !== n.sign ) {
      // If signs are different, it's a subtraction.
      return this.subtract(n.negate());
    }

    var a = this.value,
        b = n.value;

    if ( n.isSmall ) {
      return new BigInteger(addSmall(a, Math.abs(b)), this.sign);
    }
    return new BigInteger(addAny(a, b), this.sign);
  };
  BigInteger.prototype.plus = BigInteger.prototype.add; // Alias for add.


  // --- SmallInteger.prototype.add ---
  SmallInteger.prototype.add = function (v) {
    var n = parseValue(v);
    var a = this.value;

    if ( a < 0 !== n.sign ) {
      // If signs are different, and this is negative, or this is positive and n is negative.
      return this.subtract(n.negate());
    }

    var b = n.value;

    if ( n.isSmall ) {
      if ( isPrecise(a + b) ) {
        return new SmallInteger(a + b);
      }
      b = smallToArray(Math.abs(b)); // Convert small b to array for addSmall.
    }
    return new BigInteger(addSmall(b, Math.abs(a)), a < 0);
  };
  SmallInteger.prototype.plus = SmallInteger.prototype.add; // Alias for add.


  /**
   * Subtracts two digit arrays (a - b), assuming a >= b.
   * @param {number[]} a - Minuend digit array.
   * @param {number[]} b - Subtrahend digit array.
   * @returns {number[]} Resulting digit array.
   */
  function subtract(a, b) {
    var a_l = a.length,
        b_l = b.length,
        r = new Array(a_l),
        borrow = 0,
        base = BASE,
        i, difference;

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

    for ( i = b_l; i < a_l; i++ ) {
      difference = a[i] - borrow;
      if ( difference < 0 ) {
        difference += base;
      } else {
        r[i++] = difference;
        break; // No more borrowing needed.
      }
      r[i] = difference;
    }

    for ( ; i < a_l; i++ ) {
      r[i] = a[i]; // Copy remaining digits.
    }

    trim(r); // Remove leading zeros.
    return r;
  }

  /**
   * Subtracts two digit arrays (a - b), handling absolute values and signs.
   * @param {number[]} a - First digit array.
   * @param {number[]} b - Second digit array.
   * @param {boolean} sign - The sign of the result if a >= b.
   * @returns {SmallInteger|BigInteger} The result.
   */
  function subtractAny(a, b, sign) {
    var value;
    if ( compareAbs(a, b) >= 0 ) {
      value = subtract(a, b);
    } else {
      value = subtract(b, a);
      sign = !sign; // Flip sign if b was larger.
    }
    value = arrayToSmall(value); // Try to convert to small integer.

    if ( typeof value === "number" ) {
      if ( sign ) value = -value;
      return new SmallInteger(value);
    }
    return new BigInteger(value, sign);
  }

  /**
   * Subtracts a small number from a digit array.
   * @param {number[]} a - Digit array.
   * @param {number} b - Small number to subtract.
   * @param {boolean} sign - The sign of the result.
   * @returns {SmallInteger|BigInteger} The result.
   */
  function subtractSmall(a, b, sign) {
    var l = a.length,
        r = new Array(l),
        carry = -b, // Initial carry for subtraction.
        base = BASE,
        i, difference;

    for ( i = 0; i < l; i++ ) {
      difference = a[i] + carry;
      carry = Math.floor(difference / base);
      difference %= base;
      r[i] = difference < 0 ? difference + base : difference;
    }

    r = arrayToSmall(r); // Try to convert to small integer.

    if ( typeof r === "number" ) {
      if ( sign ) r = -r;
      return new SmallInteger(r);
    }
    return new BigInteger(r, sign);
  }


  // --- BigInteger.prototype.subtract ---
  BigInteger.prototype.subtract = function (v) {
    var n = parseValue(v);

    if ( this.sign !== n.sign ) {
      return this.add(n.negate()); // If signs differ, add negated value.
    }

    var a = this.value,
        b = n.value;

    if ( n.isSmall ) {
      // If subtracting a small integer.
      return subtractSmall(a, Math.abs(b), this.sign);
    }

    // If both are large.
    return subtractAny(a, b, this.sign);
  };
  BigInteger.prototype.minus = BigInteger.prototype.subtract; // Alias for subtract.


  // --- SmallInteger.prototype.subtract ---
  SmallInteger.prototype.subtract = function (v) {
    var n = parseValue(v);
    var a = this.value;

    if ( a < 0 !== n.sign ) {
      // Signs are different, perform addition of negated value.
      return this.add(n.negate());
    }

    var b = n.value;

    if ( n.isSmall ) {
      return new SmallInteger(a - b); // Simple subtraction if both are small.
    }

    // If 'n' is large, subtract 'this' (small) from 'n' and flip sign.
    return subtractSmall(b, Math.abs(a), a >= 0);
  };
  SmallInteger.prototype.minus = SmallInteger.prototype.subtract; // Alias for subtract.


  // --- Negation ---
  BigInteger.prototype.negate = function () {
    return new BigInteger(this.value, !this.sign);
  };

  SmallInteger.prototype.negate = function () {
    var sign = this.sign;
    var small = new SmallInteger(-this.value);
    small.sign = !sign; // Explicitly set sign for consistency.
    return small;
  };


  // --- Absolute Value ---
  BigInteger.prototype.abs = function () {
    return new BigInteger(this.value, false); // Always positive.
  };

  SmallInteger.prototype.abs = function () {
    return new SmallInteger(Math.abs(this.value));
  };


  /**
   * Multiplies two digit arrays using standard long multiplication.
   * @param {number[]} a - First digit array.
   * @param {number[]} b - Second digit array.
   * @returns {number[]} Resulting digit array.
   */
  function multiplyLong(a, b) {
    var a_l = a.length,
        b_l = b.length,
        l = a_l + b_l,
        r = createArray(l), // Result array, max length is sum of operand lengths.
        base = BASE,
        product, carry, i, a_i, b_j;

    for ( i = 0; i < a_l; ++i ) {
      a_i = a[i];
      for ( var j = 0; j < b_l; ++j ) {
        b_j = b[j];
        product = a_i * b_j + r[i + j]; // Add previous carry/product at this position.
        carry = Math.floor(product / base);
        r[i + j] = product - carry * base;
        r[i + j + 1] += carry; // Accumulate carry to the next position.
      }
    }
    trim(r); // Remove any leading zeros.
    return r;
  }

  /**
   * Multiplies a digit array by a small number.
   * @param {number[]} a - Digit array.
   * @param {number} b - Small number.
   * @returns {number[]} Resulting digit array.
   */
  function multiplySmall(a, b) {
    var l = a.length,
        r = new Array(l),
        base = BASE,
        carry = 0,
        product, i;

    for ( i = 0; i < l; i++ ) {
      product = a[i] * b + carry;
      carry = Math.floor(product / base);
      r[i] = product - carry * base;
    }

    while ( carry > 0 ) {
      r[i++] = carry % base;
      carry = Math.floor(carry / base);
    }
    return r;
  }

  /**
   * Shifts a digit array left by padding with zeros.
   * @param {number[]} x - The digit array.
   * @param {number} n - Number of zeros to append.
   * @returns {number[]} Shifted digit array.
   */
  function shiftLeft(x, n) {
    var r = [];
    while ( n-- > 0 ) {
      r.push(0);
    }
    return r.concat(x);
  }

  /**
   * Multiplies two digit arrays using Karatsuba algorithm.
   * More efficient for very large numbers than long multiplication.
   * @param {number[]} x - First digit array.
   * @param {number[]} y - Second digit array.
   * @returns {number[]} Resulting digit array.
   */
  function multiplyKaratsuba(x, y) {
    var n = Math.max(x.length, y.length);

    if ( n <= 30 ) { // Base case for Karatsuba, switch to long multiplication.
      return multiplyLong(x, y);
    }

    n = Math.ceil(n / 2); // Split point.

    var b = x.slice(n), // x = a * BASE^n + b
        a = x.slice(0, n),
        d = y.slice(n), // y = c * BASE^n + d
        c = y.slice(0, n);

    var ac = multiplyKaratsuba(a, c),
        bd = multiplyKaratsuba(b, d),
        abcd = multiplyKaratsuba(addAny(a, b), addAny(c, d)); // (a+b)(c+d) = ac + ad + bc + bd

    // Result = ac*BASE^(2n) + (ad+bc)*BASE^n + bd
    // ad+bc = (a+b)(c+d) - ac - bd
    var product = addAny(addAny(ac, shiftLeft(subtract(subtract(abcd, ac), bd), n)), shiftLeft(bd, 2 * n));

    trim(product);
    return product;
  }

  /**
   * Heuristic to decide whether to use Karatsuba multiplication.
   * @param {number} l1 - Length of first operand.
   * @param {number} l2 - Length of second operand.
   * @returns {boolean} True if Karatsuba should be used.
   */
  function useKaratsuba(l1, l2) {
    // This is an empirical formula.
    return -.012 * l1 - .012 * l2 + 15e-6 * l1 * l2 > 0;
  }


  // --- BigInteger.prototype.multiply ---
  BigInteger.prototype.multiply = function (v) {
    var n = parseValue(v),
        a = this.value,
        b = n.value,
        sign = this.sign !== n.sign, // Determine result sign.
        abs;

    if ( n.isSmall ) {
      if ( b === 0 ) return Integer[0];
      if ( b === 1 ) return this;
      if ( b === -1 ) return this.negate();

      abs = Math.abs(b);
      if ( abs < BASE ) {
        return new BigInteger(multiplySmall(a, abs), sign);
      }
      b = smallToArray(abs); // Convert small number to array for multiplication.
    }

    if ( useKaratsuba(a.length, b.length) ) {
      return new BigInteger(multiplyKaratsuba(a, b), sign);
    }
    return new BigInteger(multiplyLong(a, b), sign);
  };
  BigInteger.prototype.times = BigInteger.prototype.multiply; // Alias for multiply.


  /**
   * Multiplies a small number by a digit array.
   * @param {number} a - Small number.
   * @param {number[]} b - Digit array.
   * @param {boolean} sign - The sign of the result.
   * @returns {BigInteger} The product.
   */
  function multiplySmallAndArray(a, b, sign) {
    if ( a < BASE ) {
      return new BigInteger(multiplySmall(b, a), sign);
    }
    return new BigInteger(multiplyLong(b, smallToArray(a)), sign);
  }

  // Helper method for BigInteger to multiply by a SmallInteger.
  BigInteger.prototype._multiplyBySmall = function (a) {
    if ( a.value === 0 ) return Integer[0];
    if ( a.value === 1 ) return this;
    if ( a.value === -1 ) return this.negate();
    return multiplySmallAndArray(Math.abs(a.value), this.value, this.sign !== a.sign);
  };

  // Helper method for SmallInteger to multiply by a SmallInteger.
  SmallInteger.prototype._multiplyBySmall = function (a) {
    if ( isPrecise(a.value * this.value) ) {
      return new SmallInteger(a.value * this.value);
    }
    return multiplySmallAndArray(Math.abs(a.value), smallToArray(Math.abs(this.value)), this.sign !== a.sign);
  };

  // --- SmallInteger.prototype.multiply ---
  SmallInteger.prototype.multiply = function (v) {
    // Delegate to the _multiplyBySmall method, passing 'this' as the small operand.
    return parseValue(v)._multiplyBySmall(this);
  };
  SmallInteger.prototype.times = SmallInteger.prototype.multiply; // Alias for multiply.


  /**
   * Squares a digit array using optimized algorithm.
   * @param {number[]} a - The digit array to square.
   * @returns {number[]} The squared digit array.
   */
  function square(a) {
    var l = a.length,
        r = createArray(l + l), // Result array, max length is 2*operand length.
        base = BASE,
        product, carry, i, a_i, a_j;

    for ( i = 0; i < l; i++ ) {
      a_i = a[i];
      carry = 0 - a_i * a_i; // Initialize carry with diagonal element (negative for easier math).

      for ( var j = i; j < l; j++ ) {
        a_j = a[j];
        // 2 * a_i * a_j for off-diagonal terms, plus existing sum and carry.
        product = 2 * (a_i * a_j) + r[i + j] + carry;
        carry = Math.floor(product / base);
        r[i + j] = product - carry * base;
      }
      r[i + l] = carry; // Store final carry for this row.
    }
    trim(r);
    return r;
  }

  // --- BigInteger.prototype.square ---
  BigInteger.prototype.square = function () {
    return new BigInteger(square(this.value), false); // Square is always positive.
  };

  // --- SmallInteger.prototype.square ---
  SmallInteger.prototype.square = function () {
    var value = this.value * this.value;
    if ( isPrecise(value) ) {
      return new SmallInteger(value);
    }
    return new BigInteger(square(smallToArray(Math.abs(this.value))), false);
  };


  /**
   * Division and modulo using Knuth's algorithm D. (Algorithm 1)
   * Optimized for BigInt/BigInt division.
   * @param {number[]} a - Dividend digit array.
   * @param {number[]} b - Divisor digit array.
   * @returns {[number[]|number, number[]|number]} Array containing [quotient, remainder].
   */
  function divMod1(a, b) {
    var a_l = a.length,
        b_l = b.length,
        base = BASE,
        result = createArray(b.length),
        divisorMostSignificantDigit = b[b_l - 1],
        lambda = Math.ceil(base / (2 * divisorMostSignificantDigit)), // Normalization factor.
        remainder = multiplySmall(a, lambda), // Normalize dividend.
        divisor = multiplySmall(b, lambda), // Normalize divisor.
        quotientDigit, shift, carry, borrow, i, l, q;

    // Adjust sizes for normalization.
    if ( remainder.length <= a_l ) {
      remainder.push(0);
    }
    divisor.push(0); // Pad divisor for easier calculations.
    divisorMostSignificantDigit = divisor[b_l - 1]; // Update after normalization.

    for ( shift = a_l - b_l; shift >= 0; shift-- ) {
      quotientDigit = base - 1; // Initial guess for quotient digit.
      if ( remainder[shift + b_l] !== divisorMostSignificantDigit ) {
        quotientDigit = Math.floor((remainder[shift + b_l] * base + remainder[shift + b_l - 1]) / divisorMostSignificantDigit);
      }

      carry = 0;
      borrow = 0;
      l = divisor.length;

      // Multiply divisor by quotientDigit and subtract from remainder segment.
      for ( i = 0; i < l; i++ ) {
        carry += quotientDigit * divisor[i];
        q = Math.floor(carry / base);
        borrow += remainder[shift + i] - (carry - q * base); // This is remainder[shift+i] - (carry % base)
        carry = q;

        if ( borrow < 0 ) {
          remainder[shift + i] = borrow + base;
          borrow = -1;
        } else {
          remainder[shift + i] = borrow;
          borrow = 0;
        }
      }

      // Adjust quotientDigit if it was too large (remainder became negative).
      while ( borrow !== 0 ) {
        quotientDigit -= 1;
        carry = 0;
        for ( i = 0; i < l; i++ ) {
          carry += remainder[shift + i] - base + divisor[i]; // Add divisor back.
          if ( carry < 0 ) {
            remainder[shift + i] = carry + base;
            carry = 0;
          } else {
            remainder[shift + i] = carry;
            carry = 1;
          }
        }
        borrow += carry; // Check if the adjustment caused a new borrow.
      }
      result[shift] = quotientDigit;
    }

    // Denormalize remainder.
    remainder = divModSmall(remainder, lambda)[0];
    return [arrayToSmall(result), arrayToSmall(remainder)];
  }

  /**
   * Division and modulo using a simpler, iterative approach. (Algorithm 2)
   * @param {number[]} a - Dividend digit array.
   * @param {number[]} b - Divisor digit array.
   * @returns {[number[]|number, number[]|number]} Array containing [quotient, remainder].
   */
  function divMod2(a, b) {
    var a_l = a.length,
        b_l = b.length,
        result = [],
        part = [],
        base = BASE,
        guess, xlen, highx, highy, check;

    // Repeatedly subtract divisor from dividend.
    while ( a_l ) {
      part.unshift(a[--a_l]); // Take digits from dividend.
      trim(part); // Remove leading zeros from current part.

      if ( compareAbs(part, b) < 0 ) {
        result.push(0); // If part is smaller than divisor, quotient digit is 0.
        continue;
      }

      xlen = part.length;
      highx = part[xlen - 1] * base + part[xlen - 2]; // Estimate top two digits of part.
      highy = b[b_l - 1] * base + b[b_l - 2]; // Estimate top two digits of divisor.

      if ( xlen > b_l ) { // If part is longer than divisor, adjust highx.
        highx = (highx + 1) * base;
      }

      guess = Math.ceil(highx / highy); // Initial guess for quotient digit.

      do {
        check = multiplySmall(b, guess);
        if ( compareAbs(check, part) <= 0 ) {
          break; // Guess is good.
        }
        guess--; // Guess was too high.
      } while ( guess );

      result.push(guess);
      part = subtract(part, check); // Subtract (guess * divisor) from part.
    }

    result.reverse(); // Digits were collected in reverse order.
    return [arrayToSmall(result), arrayToSmall(part)];
  }

  /**
   * Divides a digit array by a small number.
   * @param {number[]} value - The digit array.
   * @param {number} lambda - The small divisor.
   * @returns {[number[], number]} Array containing [quotient digit array, remainder number].
   */
  function divModSmall(value, lambda) {
    var length = value.length,
        quotient = createArray(length),
        base = BASE,
        i, q, remainder, divisor;

    remainder = 0; // Initialize remainder.

    for ( i = length - 1; i >= 0; --i ) {
      divisor = remainder * base + value[i]; // Form the current number to divide.
      q = truncate(divisor / lambda); // Calculate quotient digit.
      remainder = divisor - q * lambda; // Calculate new remainder.
      quotient[i] = q | 0; // Store quotient digit.
    }
    return [quotient, remainder | 0];
  }

  /**
   * Performs division and modulo for any BigInt/SmallInt operands.
   * @param {BigInteger|SmallInteger} self - The dividend.
   * @param {BigInteger|SmallInteger} v - The divisor.
   * @returns {[BigInteger|SmallInteger, BigInteger|SmallInteger]} Array containing [quotient, remainder].
   */
  function divModAny(self, v) {
    var value, n = parseValue(v); // Ensure v is a bigInt object.
    var a = self.value,
        b = n.value;
    var quotient;

    if ( b === 0 ) {
      throw new Error("Cannot divide by zero");
    }

    if ( self.isSmall ) {
      if ( n.isSmall ) {
        // Both small, use native JS division.
        return [new SmallInteger(truncate(a / b)), new SmallInteger(a % b)];
      }
      return [Integer[0], self]; // Small dividend, large divisor => quotient 0, remainder dividend.
    }

    if ( n.isSmall ) {
      if ( b === 1 ) return [self, Integer[0]];
      if ( b === -1 ) return [self.negate(), Integer[0]];

      var abs = Math.abs(b);
      if ( abs < BASE ) {
        // Divide large by small.
        value = divModSmall(a, abs);
        quotient = arrayToSmall(value[0]);
        var remainder = value[1];

        if ( self.sign ) remainder = -remainder; // Adjust remainder sign.

        if ( typeof quotient === "number" ) {
          if ( self.sign !== n.sign ) quotient = -quotient;
          return [new SmallInteger(quotient), new SmallInteger(remainder)];
        }
        return [new BigInteger(quotient, self.sign !== n.sign), new SmallInteger(remainder)];
      }
      b = smallToArray(abs); // Convert small divisor to array for large division.
    }

    var comparison = compareAbs(a, b);
    if ( comparison === -1 ) {
      return [Integer[0], self]; // Dividend < divisor.
    }
    if ( comparison === 0 ) {
      return [Integer[self.sign === n.sign ? 1 : -1], Integer[0]]; // Dividend == divisor.
    }

    // Perform large division.
    if ( a.length + b.length <= 200 ) { // Heuristic for choosing division algorithm.
      value = divMod1(a, b);
    } else {
      value = divMod2(a, b);
    }

    quotient = value[0];
    var qSign = self.sign !== n.sign, // Quotient sign.
        mod = value[1],
        mSign = self.sign; // Remainder sign is same as dividend.

    if ( typeof quotient === "number" ) {
      if ( qSign ) quotient = -quotient;
      quotient = new SmallInteger(quotient);
    } else {
      quotient = new BigInteger(quotient, qSign);
    }

    if ( typeof mod === "number" ) {
      if ( mSign ) mod = -mod;
      mod = new SmallInteger(mod);
    } else {
      mod = new BigInteger(mod, mSign);
    }

    return [quotient, mod];
  }


  // --- BigInteger.prototype.divmod ---
  BigInteger.prototype.divmod = function (v) {
    var result = divModAny(this, v);
    return {
      quotient: result[0],
      remainder: result[1]
    };
  };
  SmallInteger.prototype.divmod = BigInteger.prototype.divmod; // Share divmod implementation.


  // --- Division and Modulo Aliases ---
  BigInteger.prototype.divide = function (v) {
    return divModAny(this, v)[0];
  };
  SmallInteger.prototype.over = SmallInteger.prototype.divide = BigInteger.prototype.over = BigInteger.prototype.divide;

  BigInteger.prototype.mod = function (v) {
    return divModAny(this, v)[1];
  };
  SmallInteger.prototype.remainder = SmallInteger.prototype.mod = BigInteger.prototype.remainder = BigInteger.prototype.mod;


  // --- Exponentiation (Power) ---
  BigInteger.prototype.pow = function (v) {
    var n = parseValue(v),
        a = this.value,
        b = n.value,
        value, x, y;

    if ( b === 0 ) return Integer[1]; // x^0 = 1
    if ( a === 0 ) return Integer[0]; // 0^x = 0 (for x > 0)
    if ( a === 1 ) return Integer[1]; // 1^x = 1
    if ( a === -1 ) return n.isEven() ? Integer[1] : Integer[-1]; // (-1)^x = 1 if x even, -1 if x odd.

    if ( n.sign ) {
      return Integer[0]; // Negative exponent -> fraction, approximated as 0 for integers.
    }

    if ( !n.isSmall ) {
      throw new Error("The exponent " + n.toString() + " is too large.");
    }

    if ( this.isSmall ) {
      // If base is small, try native JS Math.pow.
      if ( isPrecise(value = Math.pow(a, b)) ) {
        return new SmallInteger(truncate(value));
      }
    }

    // Binary exponentiation (exponentiation by squaring).
    x = this;
    y = Integer[1]; // Initialize result to 1.

    while ( true ) {
      if ( (b & 1) === 1 ) { // If exponent is odd.
        y = y.times(x);
        --b;
      }
      if ( b === 0 ) break;

      b /= 2;
      x = x.square(); // Square the base.
    }
    return y;
  };
  SmallInteger.prototype.pow = BigInteger.prototype.pow; // Share pow implementation.


  // --- Modular Exponentiation ---
  BigInteger.prototype.modPow = function (exp, mod) {
    exp = parseValue(exp);
    mod = parseValue(mod);

    if ( mod.isZero() ) {
      throw new Error("Cannot take modPow with modulus 0");
    }

    var r = Integer[1], // Result initialized to 1.
        base = this.mod(mod); // Reduce base modulo mod.

    while ( exp.isPositive() ) {
      if ( base.isZero() ) return Integer[0]; // 0^exp mod mod = 0.

      if ( exp.isOdd() ) {
        r = r.multiply(base).mod(mod); // r = (r * base) % mod.
      }
      exp = exp.divide(2); // exp = exp / 2.
      base = base.square().mod(mod); // base = (base^2) % mod.
    }
    return r;
  };
  SmallInteger.prototype.modPow = BigInteger.prototype.modPow; // Share modPow implementation.


  // --- Comparison Functions ---

  /**
   * Compares the absolute values of two digit arrays.
   * @param {number[]} a - First digit array.
   * @param {number[]} b - Second digit array.
   * @returns {number} -1 if a < b, 0 if a == b, 1 if a > b.
   */
  function compareAbs(a, b) {
    if ( a.length !== b.length ) {
      return a.length > b.length ? 1 : -1;
    }

    for ( var i = a.length - 1; i >= 0; i-- ) {
      if ( a[i] !== b[i] ) {
        return a[i] > b[i] ? 1 : -1;
      }
    }
    return 0;
  }

  // --- BigInteger.prototype.compareAbs ---
  BigInteger.prototype.compareAbs = function (v) {
    var n = parseValue(v),
        a = this.value,
        b = n.value;

    if ( n.isSmall ) {
      return 1; // A large number is always absolutely greater than a small number (unless small is 0).
    }
    return compareAbs(a, b);
  };

  // --- SmallInteger.prototype.compareAbs ---
  SmallInteger.prototype.compareAbs = function (v) {
    var n = parseValue(v),
        a = Math.abs(this.value),
        b = n.value;

    if ( n.isSmall ) {
      b = Math.abs(b);
      return a === b ? 0 : a > b ? 1 : -1;
    }
    return -1; // A small number is always absolutely smaller than a large number.
  };

  // --- BigInteger.prototype.compare ---
  BigInteger.prototype.compare = function (v) {
    if ( v === Infinity ) return -1;
    if ( v === -Infinity ) return 1;

    var n = parseValue(v),
        a = this.value,
        b = n.value;

    if ( this.sign !== n.sign ) {
      return n.sign ? 1 : -1; // If signs differ, negative is smaller.
    }

    if ( n.isSmall ) {
      // If 'n' is small, 'this' is BigInt.
      // If 'this' is negative, it's smaller, otherwise larger.
      return this.sign ? -1 : 1;
    }

    // Both are BigInts with same sign.
    return compareAbs(a, b) * (this.sign ? -1 : 1); // Flip result if negative.
  };
  BigInteger.prototype.compareTo = BigInteger.prototype.compare; // Alias for compare.

  // --- SmallInteger.prototype.compare ---
  SmallInteger.prototype.compare = function (v) {
    if ( v === Infinity ) return -1;
    if ( v === -Infinity ) return 1;

    var n = parseValue(v),
        a = this.value,
        b = n.value;

    if ( n.isSmall ) {
      return a == b ? 0 : a > b ? 1 : -1; // Simple comparison for two small numbers.
    }

    if ( a < 0 !== n.sign ) {
      // If signs differ (e.g., a is negative, n is positive BigInt).
      return a < 0 ? -1 : 1;
    }

    // Both have same sign, but 'n' is BigInt.
    // If 'a' is negative, it's larger (closer to zero than negative BigInt).
    // If 'a' is positive, it's smaller (closer to zero than positive BigInt).
    return a < 0 ? 1 : -1;
  };
  SmallInteger.prototype.compareTo = SmallInteger.prototype.compare; // Alias for compare.


  // --- Equality and Inequality ---
  BigInteger.prototype.equals = function (v) {
    return this.compare(v) === 0;
  };
  SmallInteger.prototype.eq = SmallInteger.prototype.equals = BigInteger.prototype.eq = BigInteger.prototype.equals;

  BigInteger.prototype.notEquals = function (v) {
    return this.compare(v) !== 0;
  };
  SmallInteger.prototype.neq = SmallInteger.prototype.notEquals = BigInteger.prototype.neq = BigInteger.prototype.notEquals;


  // --- Relational Operators ---
  BigInteger.prototype.greater = function (v) {
    return this.compare(v) > 0;
  };
  SmallInteger.prototype.gt = SmallInteger.prototype.greater = BigInteger.prototype.gt = BigInteger.prototype.greater;

  BigInteger.prototype.lesser = function (v) {
    return this.compare(v) < 0;
  };
  SmallInteger.prototype.lt = SmallInteger.prototype.lesser = BigInteger.prototype.lt = BigInteger.prototype.lesser;

  BigInteger.prototype.greaterOrEquals = function (v) {
    return this.compare(v) >= 0;
  };
  SmallInteger.prototype.geq = SmallInteger.prototype.greaterOrEquals = BigInteger.prototype.geq = BigInteger.prototype.greaterOrEquals;

  BigInteger.prototype.lesserOrEquals = function (v) {
    return this.compare(v) <= 0;
  };
  SmallInteger.prototype.leq = SmallInteger.prototype.lesserOrEquals = BigInteger.prototype.leq = BigInteger.prototype.lesserOrEquals;


  // --- Property Checkers ---

  BigInteger.prototype.isEven = function () {
    return (this.value[0] & 1) === 0; // Check least significant digit.
  };
  SmallInteger.prototype.isEven = function () {
    return (this.value & 1) === 0;
  };

  BigInteger.prototype.isOdd = function () {
    return (this.value[0] & 1) === 1;
  };
  SmallInteger.prototype.isOdd = function () {
    return (this.value & 1) === 1;
  };

  BigInteger.prototype.isPositive = function () {
    return !this.sign;
  };
  SmallInteger.prototype.isPositive = function () {
    return this.value > 0;
  };

  BigInteger.prototype.isNegative = function () {
    return this.sign;
  };
  SmallInteger.prototype.isNegative = function () {
    return this.value < 0;
  };

  BigInteger.prototype.isUnit = function () {
    return false; // A BigInteger cannot be 1 or -1 (by definition of being "Big").
  };
  SmallInteger.prototype.isUnit = function () {
    return Math.abs(this.value) === 1;
  };

  BigInteger.prototype.isZero = function () {
    return false; // A BigInteger cannot be 0.
  };
  SmallInteger.prototype.isZero = function () {
    return this.value === 0;
  };

  BigInteger.prototype.isDivisibleBy = function (v) {
    var n = parseValue(v);
    var value = n.value;

    if ( value === 0 ) return false;
    if ( value === 1 ) return true;
    if ( value === 2 ) return this.isEven();

    return this.mod(n).equals(Integer[0]); // If remainder is zero, it's divisible.
  };
  SmallInteger.prototype.isDivisibleBy = BigInteger.prototype.isDivisibleBy; // Share implementation.


  /**
   * Checks for small prime numbers.
   * @param {BigInteger|SmallInteger} v - The number to check.
   * @returns {boolean|undefined} True if prime, false if composite, undefined if too large for basic check.
   */
  function isBasicPrime(v) {
    var n = v.abs();

    if ( n.isUnit() ) return false; // 1 is not prime.
    if ( n.equals(2) || n.equals(3) || n.equals(5) ) return true;
    if ( n.isEven() || n.isDivisibleBy(3) || n.isDivisibleBy(5) ) return false;
    if ( n.lesser(25) ) return true; // All primes below 25 are covered above.
  }

  // --- BigInteger.prototype.isPrime (Miller-Rabin) ---
  BigInteger.prototype.isPrime = function () {
    var isPrime = isBasicPrime(this);
    if ( isPrime !== undefined ) return isPrime;

    var n = this.abs(),
        nPrev = n.prev(); // n - 1

    var a = [2, 3, 5, 7, 11, 13, 17, 19], // Small primes for Miller-Rabin test.
        b = nPrev, // n - 1
        d, t, i, x;

    // Find d and s such that n - 1 = d * 2^s and d is odd.
    while ( b.isEven() ) {
      b = b.divide(2);
    }

    // Miller-Rabin test for each 'a' in the array.
    for ( i = 0; i < a.length; i++ ) {
      x = bigInt(a[i]).modPow(b, n); // x = a^d mod n

      if ( x.equals(Integer[1]) || x.equals(nPrev) ) {
        continue; // Potentially prime.
      }

      for ( t = true, d = b; t && d.lesser(nPrev); d = d.multiply(2) ) {
        x = x.square().mod(n); // x = x^2 mod n
        if ( x.equals(nPrev) ) {
          t = false; // Found a witness, potentially prime.
        }
      }
      if ( t ) return false; // Not a prime.
    }
    return true; // Probably prime.
  };
  SmallInteger.prototype.isPrime = BigInteger.prototype.isPrime; // Share implementation.

  // --- BigInteger.prototype.isProbablePrime ---
  BigInteger.prototype.isProbablePrime = function (iterations) {
    var isPrime = isBasicPrime(this);
    if ( isPrime !== undefined ) return isPrime;

    var n = this.abs();
    var t = iterations === undefined ? 5 : iterations; // Number of iterations for Miller-Rabin.

    for ( var i = 0; i < t; i++ ) {
      var a = bigInt.randBetween(2, n.minus(2)); // Random base a.
      if ( !a.modPow(n.prev(), n).isUnit() ) {
        return false; // Not a probable prime.
      }
    }
    return true; // Probably prime.
  };
  SmallInteger.prototype.isProbablePrime = BigInteger.prototype.isProbablePrime; // Share implementation.


  // --- Modular Inverse ---
  BigInteger.prototype.modInv = function (n) {
    var t = bigInt.zero,
        newT = bigInt.one,
        r = parseValue(n),
        newR = this.abs(),
        q, lastT, lastR;

    // Extended Euclidean algorithm.
    while ( !newR.equals(bigInt.zero) ) {
      q = r.divide(newR);
      lastT = t;
      lastR = r;
      t = newT;
      r = newR;
      newT = lastT.subtract(q.multiply(newT));
      newR = lastR.subtract(q.multiply(newR));
    }

    if ( !r.equals(1) ) {
      throw new Error(this.toString() + " and " + n.toString() + " are not co-prime");
    }

    if ( t.compare(0) === -1 ) {
      t = t.add(n); // Ensure positive result.
    }

    if ( this.isNegative() ) {
      return t.negate(); // Adjust for negative 'this'.
    }
    return t;
  };
  SmallInteger.prototype.modInv = BigInteger.prototype.modInv; // Share implementation.


  // --- Increment/Decrement ---
  BigInteger.prototype.next = function () {
    var value = this.value;
    if ( this.sign ) {
      // If negative, increment means moving towards zero (e.g., -5 -> -4).
      return subtractSmall(value, 1, this.sign);
    }
    return new BigInteger(addSmall(value, 1), this.sign); // If positive, simple increment.
  };

  SmallInteger.prototype.next = function () {
    var value = this.value;
    if ( value + 1 < MAX_INT ) {
      return new SmallInteger(value + 1);
    }
    return new BigInteger(MAX_INT_ARR, false); // If overflows, create a BigInteger.
  };

  BigInteger.prototype.prev = function () {
    var value = this.value;
    if ( this.sign ) {
      // If negative, decrement means moving away from zero (e.g., -5 -> -6).
      return new BigInteger(addSmall(value, 1), true);
    }
    return subtractSmall(value, 1, this.sign); // If positive, simple decrement.
  };

  SmallInteger.prototype.prev = function () {
    var value = this.value;
    if ( value - 1 > -MAX_INT ) {
      return new SmallInteger(value - 1);
    }
    return new BigInteger(MAX_INT_ARR, true); // If underflows, create a BigInteger.
  };


  // --- Bitwise Shift Operations ---

  // Precompute powers of two for efficient shifting.
  var powersOfTwo = [1];
  while ( 2 * powersOfTwo[powersOfTwo.length - 1] <= BASE ) {
    powersOfTwo.push(2 * powersOfTwo[powersOfTwo.length - 1]);
  }
  var powers2Length = powersOfTwo.length,
      highestPower2 = powersOfTwo[powers2Length - 1];

  /**
   * Checks if the shift amount `n` is small enough to be handled directly.
   * @param {number|string|BigInteger} n - The shift amount.
   * @returns {boolean} True if small, false otherwise.
   */
  function shift_isSmall(n) {
    return (typeof n === "number" || typeof n === "string") && +Math.abs(n) <= BASE || n instanceof BigInteger && n.value.length <= 1;
  }

  BigInteger.prototype.shiftLeft = function (n) {
    if ( !shift_isSmall(n) ) {
      throw new Error(String(n) + " is too large for shifting.");
    }
    n = +n; // Ensure n is a number.

    if ( n < 0 ) {
      return this.shiftRight(-n); // Left shift by negative is right shift.
    }

    var result = this;
    if ( result.isZero() ) return result;

    while ( n >= powers2Length ) {
      result = result.multiply(highestPower2); // Multiply by largest power of 2.
      n -= powers2Length - 1; // Reduce n accordingly.
    }
    return result.multiply(powersOfTwo[n]); // Multiply by remaining power of 2.
  };
  SmallInteger.prototype.shiftLeft = BigInteger.prototype.shiftLeft; // Share implementation.

  BigInteger.prototype.shiftRight = function (n) {
    var remQuo;
    if ( !shift_isSmall(n) ) {
      throw new Error(String(n) + " is too large for shifting.");
    }
    n = +n;

    if ( n < 0 ) {
      return this.shiftLeft(-n); // Right shift by negative is left shift.
    }

    var result = this;
    while ( n >= powers2Length ) {
      if ( result.isZero() || result.isNegative() && result.isUnit() ) {
        return result; // Shifting 0 or -1 right yields 0 or -1.
      }
      remQuo = divModAny(result, highestPower2);
      // Adjust quotient for negative numbers: floor division.
      result = remQuo[1].isNegative() ? remQuo[0].prev() : remQuo[0];
      n -= powers2Length - 1;
    }
    remQuo = divModAny(result, powersOfTwo[n]);
    return remQuo[1].isNegative() ? remQuo[0].prev() : remQuo[0];
  };
  SmallInteger.prototype.shiftRight = BigInteger.prototype.shiftRight; // Share implementation.


  // --- Bitwise Operations (AND, OR, XOR, NOT) ---

  /**
   * Generic bitwise operation function.
   * Works by splitting numbers into chunks (highestPower2) and applying the operation.
   * @param {BigInteger|SmallInteger} x - First operand.
   * @param {BigInteger|SmallInteger} y - Second operand.
   * @param {function(number, number): number} fn - The bitwise function (e.g., `a & b`).
   * @returns {BigInteger} The result.
   */
  function bitwise(x, y, fn) {
    y = parseValue(y); // Ensure y is a bigInt object.

    var xSign = x.isNegative(),
        ySign = y.isNegative();

    // Two's complement for negative numbers.
    var xRem = xSign ? x.not() : x,
        yRem = ySign ? y.not() : y;

    var xDigit = 0,
        yDigit = 0;
    var xDivMod = null,
        yDivMod = null;
    var result = [];

    while ( !xRem.isZero() || !yRem.isZero() ) {
      xDivMod = divModAny(xRem, highestPower2);
      xDigit = xDivMod[1].toJSNumber();
      if ( xSign ) {
        xDigit = highestPower2 - 1 - xDigit; // Invert bits for two's complement.
      }

      yDivMod = divModAny(yRem, highestPower2);
      yDigit = yDivMod[1].toJSNumber();
      if ( ySign ) {
        yDigit = highestPower2 - 1 - yDigit; // Invert bits for two's complement.
      }

      xRem = xDivMod[0];
      yRem = yDivMod[0];

      result.push(fn(xDigit, yDigit)); // Apply bitwise function.
    }

    // Determine final sign and reconstruct number.
    var sum = fn(xSign ? 1 : 0, ySign ? 1 : 0) !== 0 ? bigInt(-1) : bigInt(0);

    for ( var i = result.length - 1; i >= 0; i -= 1 ) {
      sum = sum.multiply(highestPower2).add(bigInt(result[i]));
    }
    return sum;
  }

  // Bitwise NOT operation.
  BigInteger.prototype.not = function () {
    return this.negate().prev(); // ~x = -(x + 1)
  };
  SmallInteger.prototype.not = BigInteger.prototype.not; // Share implementation.

  BigInteger.prototype.and = function (n) {
    return bitwise(this, n, function (a, b) {
      return a & b;
    });
  };
  SmallInteger.prototype.and = BigInteger.prototype.and;

  BigInteger.prototype.or = function (n) {
    return bitwise(this, n, function (a, b) {
      return a | b;
    });
  };
  SmallInteger.prototype.or = BigInteger.prototype.or;

  BigInteger.prototype.xor = function (n) {
    return bitwise(this, n, function (a, b) {
      return a ^ b;
    });
  };
  SmallInteger.prototype.xor = BigInteger.prototype.xor;


  // --- Bit Length Calculation ---

  // Constants for rough LOB (Least Significant Bit) calculation.
  var LOBMASK_I = 1 << 30,
      LOBMASK_BI = (BASE & -BASE) * (BASE & -BASE) | LOBMASK_I;

  /**
   * Calculates a rough approximation of the Least Significant Bit (LOB).
   * @param {BigInteger|SmallInteger} n - The number.
   * @returns {number} Rough LOB.
   */
  function roughLOB(n) {
    var v = n.value,
        x = typeof v === "number" ? v | LOBMASK_I : v[0] + v[1] * BASE | LOBMASK_BI;
    return x & -x; // Returns the lowest set bit.
  }

  /**
   * Calculates integer logarithm (floor(log_base(value))).
   * Used as a helper for bitLength.
   * @param {BigInteger} value - The value.
   * @param {BigInteger} base - The base of the logarithm.
   * @returns {{p: BigInteger, e: number}} Object with p (power) and e (exponent).
   */
  function integerLogarithm(value, base) {
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
  SmallInteger.prototype.bitLength = BigInteger.prototype.bitLength; // Share implementation.


  // --- Static Math Functions ---

  /**
   * Returns the maximum of two bigInt numbers.
   * @param {BigInteger|SmallInteger|number|string} a - First number.
   * @param {BigInteger|SmallInteger|number|string} b - Second number.
   * @returns {BigInteger|SmallInteger} The maximum.
   */
  function max(a, b) {
    a = parseValue(a);
    b = parseValue(b);
    return a.greater(b) ? a : b;
  }

  /**
   * Returns the minimum of two bigInt numbers.
   * @param {BigInteger|SmallInteger|number|string} a - First number.
   * @param {BigInteger|SmallInteger|number|string} b - Second number.
   * @returns {BigInteger|SmallInteger} The minimum.
   */
  function min(a, b) {
    a = parseValue(a);
    b = parseValue(b);
    return a.lesser(b) ? a : b;
  }

  /**
   * Calculates the Greatest Common Divisor (GCD) of two numbers.
   * Uses binary GCD algorithm.
   * @param {BigInteger|SmallInteger|number|string} a - First number.
   * @param {BigInteger|SmallInteger|number|string} b - Second number.
   * @returns {BigInteger|SmallInteger} The GCD.
   */
  function gcd(a, b) {
    a = parseValue(a).abs();
    b = parseValue(b).abs();

    if ( a.equals(b) ) return a;
    if ( a.isZero() ) return b;
    if ( b.isZero() ) return a;

    var c = Integer[1],
        d, t;

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

    // Euclidean algorithm variant.
    do {
      // Remove factors of 2 from 'b'.
      while ( b.isEven() ) {
        b = b.divide(roughLOB(b));
      }

      if ( a.greater(b) ) {
        t = b;
        b = a;
        a = t;
      }
      b = b.subtract(a);
    } while ( !b.isZero() );

    return c.isUnit() ? a : a.multiply(c);
  }

  /**
   * Calculates the Least Common Multiple (LCM) of two numbers.
   * LCM(a, b) = |a * b| / GCD(a, b).
   * @param {BigInteger|SmallInteger|number|string} a - First number.
   * @param {BigInteger|SmallInteger|number|string} b - Second number.
   * @returns {BigInteger|SmallInteger} The LCM.
   */
  function lcm(a, b) {
    a = parseValue(a).abs();
    b = parseValue(b).abs();
    return a.divide(gcd(a, b)).multiply(b);
  }

  /**
   * Generates a random bigInt between `a` and `b` (inclusive).
   * @param {BigInteger|SmallInteger|number|string} a - Lower bound.
   * @param {BigInteger|SmallInteger|number|string} b - Upper bound.
   * @returns {BigInteger|SmallInteger} A random bigInt.
   */
  function randBetween(a, b) {
    a = parseValue(a);
    b = parseValue(b);

    var low = min(a, b),
        high = max(a, b);
    var range = high.subtract(low).add(1);

    if ( range.isSmall ) {
      return low.add(Math.floor(Math.random() * range));
    }

    var length = range.value.length - 1;
    var result = [],
        restricted = true; // Flag to ensure digits are within range bounds.

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


  // --- Parsing from String (Base Conversion) ---

  var parseBase = function (text, base) {
    var length = text.length;
    var i;
    var absBase = Math.abs(base);

    // Validate digits for the given base.
    for ( i = 0; i < length; i++ ) {
      var c = text[i].toLowerCase();
      if ( c === "-" ) continue; // Skip negative sign.

      if ( /[a-z0-9]/.test(c) ) {
        if ( /[0-9]/.test(c) && +c >= absBase ) {
          if ( c === "1" && absBase === 1 ) continue; // Special case for base 1.
          throw new Error(c + " is not a valid digit in base " + base + ".");
        } else if ( c.charCodeAt(0) - 87 >= absBase ) { // 'a' is 10, 'b' is 11 etc.
          throw new Error(c + " is not a valid digit in base " + base + ".");
        }
      }
    }

    // Optimization for common bases that fit in JS numbers.
    if ( 2 <= base && base <= 36 ) {
      // Check if the number of digits is too large to fit in MAX_INT.
      if ( length <= LOG_MAX_INT / Math.log(base) ) {
        var result = parseInt(text, base);
        if ( isNaN(result) ) {
          // This check is redundant due to earlier validation, but kept for robustness.
          throw new Error(c + " is not a valid digit in base " + base + ".");
        }
        return new SmallInteger(parseInt(text, base));
      }
    }

    base = parseValue(base); // Ensure base is a bigInt object.
    var digits = [];
    var isNegative = text[0] === "-";

    // Parse digits.
    for ( i = isNegative ? 1 : 0; i < text.length; i++ ) {
      var c = text[i].toLowerCase(),
          charCode = c.charCodeAt(0);

      if ( 48 <= charCode && charCode <= 57 ) { // '0'-'9'
        digits.push(parseValue(c));
      } else if ( 97 <= charCode && charCode <= 122 ) { // 'a'-'z'
        digits.push(parseValue(c.charCodeAt(0) - 87));
      } else if ( c === "<" ) {
        // Custom multi-digit "digit" format, e.g., <100>.
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
   * Converts an array of digits (each digit is a bigInt) from a given base.
   * @param {BigInteger[]} digits - Array of digit bigInts.
   * @param {BigInteger} base - The base.
   * @param {boolean} isNegative - True if the original number was negative.
   * @returns {BigInteger|SmallInteger} The resulting bigInt.
   */
  function parseBaseFromArray(digits, base, isNegative) {
    var val = Integer[0],
        pow = Integer[1],
        i;

    // Horner's method: val = d0 + d1*base + d2*base^2 + ...
    for ( i = digits.length - 1; i >= 0; i-- ) {
      val = val.add(digits[i].times(pow));
      pow = pow.times(base);
    }
    return isNegative ? val.negate() : val;
  }

  /**
   * Converts a digit to its string representation (0-9, a-z, or <digit>).
   * @param {number} digit - The digit.
   * @returns {string} String representation.
   */
  function stringify(digit) {
    if ( digit <= 35 ) {
      return "0123456789abcdefghijklmnopqrstuvwxyz".charAt(digit);
    }
    return "<" + digit + ">";
  }

  /**
   * Converts a bigInt to an array of digits in a specified base.
   * @param {BigInteger|SmallInteger} n - The number to convert.
   * @param {BigInteger|SmallInteger} base - The target base.
   * @returns {{value: number[], isNegative: boolean}} Object with digit array and sign.
   */
  function toBase(n, base) {
    base = bigInt(base); // Ensure base is a bigInt.

    if ( base.isZero() ) {
      if ( n.isZero() ) return {
        value: [0],
        isNegative: false
      };
      throw new Error("Cannot convert nonzero numbers to base 0.");
    }

    if ( base.equals(-1) ) {
      if ( n.isZero() ) return {
        value: [0],
        isNegative: false
      };
      if ( n.isNegative() ) {
        // Special handling for base -1.
        return {
          value: [].concat.apply([], Array.apply(null, Array(-n)).map(Array.prototype.valueOf, [1, 0])),
          isNegative: false
        };
      }
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
      n = n.abs(); // Work with absolute value for conversion.
    }

    if ( base.equals(1) ) {
      if ( n.isZero() ) return {
        value: [0],
        isNegative: false
      };
      return {
        value: Array.apply(null, Array(+n)).map(Number.prototype.valueOf, 1),
        isNegative: neg
      };
    }

    var out = [];
    var left = n,
        divmod;

    while ( left.isNegative() || left.compareAbs(base) >= 0 ) {
      divmod = left.divmod(base);
      left = divmod.quotient;
      var digit = divmod.remainder;

      if ( digit.isNegative() ) {
        digit = base.minus(digit).abs(); // Adjust remainder to be positive.
        left = left.next(); // Adjust quotient.
      }
      out.push(digit.toJSNumber());
    }
    out.push(left.toJSNumber()); // Push the last quotient.

    return {
      value: out.reverse(),
      isNegative: neg
    };
  }

  /**
   * Converts a bigInt to a string representation in a specified base.
   * @param {BigInteger|SmallInteger} n - The number to convert.
   * @param {BigInteger|SmallInteger} base - The target base.
   * @returns {string} The string representation.
   */
  function toBaseString(n, base) {
    var arr = toBase(n, base);
    return (arr.isNegative ? "-" : "") + arr.value.map(stringify).join("");
  }


  // --- String Conversion Methods ---

  BigInteger.prototype.toArray = function (radix) {
    return toBase(this, radix);
  };
  SmallInteger.prototype.toArray = function (radix) {
    return toBase(this, radix);
  };

  BigInteger.prototype.toString = function (radix) {
    if ( radix === undefined ) radix = 10;
    if ( radix !== 10 ) return toBaseString(this, radix);

    var v = this.value,
        l = v.length,
        str = String(v[--l]), // Start with most significant digit.
        zeros = "0000000", // For padding.
        digit;

    while ( --l >= 0 ) {
      digit = String(v[l]);
      str += zeros.slice(digit.length) + digit; // Pad and append.
    }

    var sign = this.sign ? "-" : "";
    return sign + str;
  };

  SmallInteger.prototype.toString = function (radix) {
    if ( radix === undefined ) radix = 10;
    if ( radix != 10 ) return toBaseString(this, radix);
    return String(this.value);
  };

  BigInteger.prototype.toJSON = SmallInteger.prototype.toJSON = function () {
    return this.toString();
  };

  BigInteger.prototype.valueOf = function () {
    return parseInt(this.toString(), 10); // Converts to JS number, potentially losing precision.
  };
  BigInteger.prototype.toJSNumber = BigInteger.prototype.valueOf;

  SmallInteger.prototype.valueOf = function () {
    return this.value;
  };
  SmallInteger.prototype.toJSNumber = SmallInteger.prototype.valueOf;


  // --- Value Parsing Functions ---

  /**
   * Parses a string value into a BigInteger or SmallInteger.
   * Handles scientific notation and checks for valid integer format.
   * @param {string} v - The string to parse.
   * @returns {BigInteger|SmallInteger} The parsed bigInt.
   */
  function parseStringValue(v) {
    if ( isPrecise(+v) ) {
      var x = +v;
      if ( x === truncate(x) ) {
        return new SmallInteger(x);
      }
      throw new Error("Invalid integer: " + v);
    }

    var sign = v[0] === "-";
    if ( sign ) v = v.slice(1); // Remove sign for parsing digits.

    var split = v.split(/e/i); // Handle scientific notation.
    if ( split.length > 2 ) {
      throw new Error("Invalid integer: " + split.join("e"));
    }

    if ( split.length === 2 ) {
      var exp = split[1];
      if ( exp[0] === "+" ) exp = exp.slice(1);
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

      text += new Array(exp + 1).join("0"); // Append zeros for exponent.
      v = text;
    }

    var isValid = /^([0-9][0-9]*)$/.test(v); // Validate remaining string.
    if ( !isValid ) {
      throw new Error("Invalid integer: " + v);
    }

    var r = [],
        max = v.length,
        l = LOG_BASE,
        min = max - l;

    // Split string into chunks of LOG_BASE digits.
    while ( max > 0 ) {
      r.push(+v.slice(min, max));
      min -= l;
      if ( min < 0 ) min = 0;
      max -= l;
    }

    trim(r); // Remove leading zeros.
    return new BigInteger(r, sign);
  }

  /**
   * Parses a number value into a SmallInteger or BigInteger.
   * @param {number} v - The number to parse.
   * @returns {BigInteger|SmallInteger} The parsed bigInt.
   */
  function parseNumberValue(v) {
    if ( isPrecise(v) ) {
      if ( v !== truncate(v) ) {
        throw new Error(v + " is not an integer.");
      }
      return new SmallInteger(v);
    }
    return parseStringValue(v.toString()); // Fallback to string parsing for large numbers.
  }

  /**
   * Main entry point for parsing various value types into bigInt.
   * @param {any} v - The value to parse.
   * @returns {BigInteger|SmallInteger} The parsed bigInt.
   */
  function parseValue(v) {
    if ( typeof v === "number" ) {
      return parseNumberValue(v);
    }
    if ( typeof v === "string" ) {
      return parseStringValue(v);
    }
    return v; // Assume it's already a bigInt object.
  }


  // --- Integer Object Initialization ---

  // Pre-instantiate small integers for performance.
  for ( var i = 0; i < 1e3; i++ ) {
    Integer[i] = new SmallInteger(i);
    if ( i > 0 ) Integer[-i] = new SmallInteger(-i);
  }

  // Common constants.
  Integer.one = Integer[1];
  Integer.zero = Integer[0];
  Integer.minusOne = Integer[-1];

  // Static methods exposed on the bigInt function.
  Integer.max = max;
  Integer.min = min;
  Integer.gcd = gcd;
  Integer.lcm = lcm;

  Integer.isInstance = function (x) {
    return x instanceof BigInteger || x instanceof SmallInteger;
  };

  Integer.randBetween = randBetween;

  Integer.fromArray = function (digits, base, isNegative) {
    return parseBaseFromArray(digits.map(parseValue), parseValue(base || 10), isNegative);
  };

  return Integer; // Return the constructor/factory function.
}(); // Immediately invoked function expression to create the bigInt object.


// --- Input Processing Utility (GET) ---
// This module provides helper functions to read structured input from stdin.
var GET = (function () {

  /**
   * Factory function to create a new input reader.
   * @param {string} s - The raw input string.
   * @returns {g} An instance of the input reader.
   */
  function f(s) {
    return new g(s);
  }

  /**
   * Input reader class.
   * @param {string} s - The raw input string.
   * @private
   */
  function g(s) {
    this._s = s.trim().split("\n"); // Split input into lines.
    this._y = 0; // Current line index.
  }

  /**
   * Reads a single token from the current line.
   * If `f` is true, returns as string; otherwise, as number.
   * @param {boolean} [f] - If true, return as string.
   * @returns {string|number} The token.
   */
  g.prototype.a = function (f) {
    var s = this._s,
        y = this._y,
        r;

    if ( typeof s[y] === "string" ) {
      s[y] = s[y].split(" ").reverse(); // Split line into tokens and reverse for efficient popping.
    }

    r = s[y].pop(); // Get last token.

    if ( !s[y].length ) {
      this._y++; // Move to next line if current line is empty.
    }
    return f ? r : +r; // Convert to number unless string is requested.
  };

  /**
   * Reads an entire line of tokens.
   * If `f` is true, returns as array of strings; otherwise, as array of numbers.
   * @param {boolean} [f] - If true, return as strings.
   * @returns {string[]|number[]} Array of tokens.
   */
  g.prototype.l = function (f) {
    var s = this._s[this._y++].split(" "); // Get line, split, then move to next line.
    return f ? s : s.map(a => +a); // Convert to numbers unless string is requested.
  };

  /**
   * Reads `n` lines, each as an array of tokens.
   * If `f` is true, returns as 2D array of strings; otherwise, as 2D array of numbers.
   * @param {number} n - Number of lines to read.
   * @param {boolean} [f] - If true, return as strings.
   * @returns {string[][]|number[][]} 2D array of tokens.
   */
  g.prototype.m = function (n, f) {
    var r = this._s.slice(this._y, this._y += n).map(a => a.split(" ")); // Slice n lines, split each.
    return f ? r : r.map(a => a.map(a => +a)); // Convert to numbers unless string is requested.
  };

  /**
   * Reads `n` lines, each as a single token.
   * If `f` is true, returns as array of strings; otherwise, as array of numbers.
   * @param {number} n - Number of lines to read.
   * @param {boolean} [f] - If true, return as strings.
   * @returns {string[]|number[]} Array of tokens.
   */
  g.prototype.r = function (n, f) {
    var r = this._s.slice(this._y, this._y += n); // Slice n lines.
    return f ? r : r.map(a => +a); // Convert to numbers unless string is requested.
  };

  return f; // Return the factory function.
})();


// --- Main Program Execution ---

// Initialize input reader with content from stdin.
var o = GET(require("fs").readFileSync("/dev/stdin", "utf8"));

// Initialize a bigInt instance (defaults to 0).
var bi = bigInt();

// Call the main function and print its result to console.
console.log(main());


/**
 * Main logic function for the problem.
 * Reads N and K, then an array A.
 * Computes all possible subarray sums, counts their occurrences,
 * and finds the largest possible X such that at least K subarray sums
 * are divisible by X.
 * @returns {string} The largest X as a string.
 */
function main() {
  var n = o.a(); // Read N (number of elements).
  var k = o.a(); // Read K (minimum required count).
  var a = o.l(); // Read array A of N elements.

  // Precompute prefix sums. s[i] = sum of a[0]...a[i-1].
  var s = [0];
  for ( var i = 0; i < n; i++ ) {
    s[i + 1] = s[i] + a[i];
  }

  // Calculate all possible subarray sums.
  var w = [], // Array to store unique subarray sums.
      max = 0, // Stores the maximum subarray sum found.
      x = {}; // Hash map to store counts of each subarray sum.

  for ( var l = 0; l < n; l++ ) {
    for ( var r = l + 1; r <= n; r++ ) {
      var t = s[r] - s[l]; // Subarray sum from index l to r-1.
      if ( x[t] ) {
        x[t]++; // Increment count if sum already exists.
      } else {
        w.push(t); // Add to unique sums if new.
        x[t] = 1; // Initialize count.
      }
      if ( t > max ) max = t; // Update maximum sum.
    }
  }

  // Determine the maximum possible bit length for X.
  var q = 0;
  while ( max > 1 ) {
    max = Math.floor(max / 2);
    q++;
  }

  // Initialize answer to 0 (as a bigInt).
  var ans = bi;

  // Iterate from most significant bit to least significant bit.
  for ( i = q; i >= 0; i-- ) {
    var t = [], // Temporary array for sums that satisfy the current bit condition.
        z = bi.add(1).shiftLeft(i), // Current power of 2 (2^i).
        c = 0; // Count of sums divisible by current potential X.

    for ( var j = 0; j < w.length; j++ ) {
      // Check if current sum `w[j]` has the `i`-th bit set
      // (i.e., if it is divisible by the current `z` when considering current `ans` bit).
      // More accurately, it checks if `w[j]` is 'compatible' with `z` and `ans`.
      // `(ans | z)` represents the candidate X. If `w[j]` is divisible by `(ans | z)`.
      // The logic `!z.and(w[j]).isZero()` here is problematic if `ans` is not included.
      // The original code `!z.and(w[j]).isZero()` tests if the `i`-th bit of `w[j]` is set.
      // This is a common approach in competitive programming for finding max X using bitwise DP.
      // It implies finding the largest X such that for every `w_j`, `X & w_j == X`.
      // Or, more likely, it's finding largest X such that `count(w_j % X == 0) >= k`.
      // The given code implies finding the largest `X` which is a power of 2 (or a sum of powers of 2)
      // such that at least `k` numbers `w[j]` have `X` as a common divisor.
      // The inner loop condition `!z.and(w[j]).isZero()` means `w[j]` has the current bit `z` set.
      // If `c >= k`, it means we can potentially include this bit `z` in our `ans`.
      // Then `w` is filtered to only include numbers that also have this bit `z` set.
      if ( !z.and(w[j]).isZero() ) {
        t.push(w[j]);
        c += x[w[j]];
      }
    }

    if ( c >= k ) {
      ans = ans.add(z); // If enough sums share this bit, add it to our answer.
      w = t; // Filter `w` to only sums that have this bit set.
    }
  }

  return ans.toString(); // Return the result as a string.
}