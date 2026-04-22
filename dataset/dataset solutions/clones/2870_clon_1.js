/*
 * This is a Type I clone generated from the original JavaScript code.
 * All identifiers, operators, and expressions remain strictly unchanged.
 * Only whitespace (spaces, tabs, newlines) and comments have been altered.
 * The functional behavior of the code is identical to the original.
 */

var bigInt = function (undefined) {
  // Enforce strict mode for cleaner code and error handling.
  "use strict";

  // --- Constants and Initialization ---
  var BASE = 1e7, // Base for internal representation (10^7)
    LOG_BASE = 7, // Logarithm of the base
    MAX_INT = 9007199254740992, // Max safe integer in JavaScript
    MAX_INT_ARR = smallToArray(MAX_INT), // MAX_INT represented as an array
    LOG_MAX_INT = Math.log(MAX_INT); // Logarithm of MAX_INT

  /**
   * Main constructor for the Integer type.
   * Dispatches to SmallInteger or BigInteger based on value and radix.
   *
   * @param {number|string|BigInteger|SmallInteger} v - The value to parse.
   * @param {number} [radix] - The base of the number string, if `v` is a string.
   * @returns {BigInteger|SmallInteger} An Integer instance.
   */
  function Integer(v, radix) {
    if (typeof v === "undefined") {
      // If no value is provided, return the cached zero instance.
      return Integer[0];
    }

    if (typeof radix !== "undefined") {
      // If a radix is provided, handle base conversion.
      return +radix === 10 ? parseValue(v) : parseBase(v, radix);
    }

    // Default case: parse the value directly.
    return parseValue(v);
  }

  /**
   * Represents a large integer that exceeds JavaScript's safe integer limit.
   *
   * @param {number[]} value - Array of digits in base BASE.
   * @param {boolean} sign - True if negative, false if positive.
   */
  function BigInteger(value, sign) {
    this.value = value;
    this.sign = sign;
    this.isSmall = false; // Flag to distinguish BigInteger from SmallInteger
  }

  // Set up prototype chain for BigInteger
  BigInteger.prototype = Object.create(Integer.prototype);

  /**
   * Represents a small integer that fits within JavaScript's safe integer limit.
   *
   * @param {number} value - The integer value.
   */
  function SmallInteger(value) {
    this.value = value;
    this.sign = value < 0; // Determine sign based on value
    this.isSmall = true; // Flag to distinguish SmallInteger from BigInteger
  }

  // Set up prototype chain for SmallInteger
  SmallInteger.prototype = Object.create(Integer.prototype);

  // --- Utility Functions ---

  /**
   * Checks if a number can be precisely represented by JavaScript's number type.
   *
   * @param {number} n - The number to check.
   * @returns {boolean} True if precise, false otherwise.
   */
  function isPrecise(n) {
    return -MAX_INT < n && n < MAX_INT;
  }

  /**
   * Converts a small JavaScript number into an array representation for BigInteger.
   *
   * @param {number} n - The number to convert.
   * @returns {number[]} Array of digits.
   */
  function smallToArray(n) {
    // Optimized for numbers that fit within one, two, or three BASE digits.
    if (n < 1e7) {
      return [n];
    }

    if (n < 1e14) {
      return [n % 1e7, Math.floor(n / 1e7)];
    }

    // For numbers up to 1e21 (MAX_INT is ~9e15)
    return [n % 1e7, Math.floor(n / 1e7) % 1e7, Math.floor(n / 1e14)];
  }

  /**
   * Converts an array representation back to a small JavaScript number if possible.
   *
   * @param {number[]} arr - The array of digits.
   * @returns {number|number[]} The number if small, otherwise the array.
   */
  function arrayToSmall(arr) {
    trim(arr); // Remove leading zeros
    var length = arr.length;

    // If the array is small enough and its absolute value is within MAX_INT
    if (length < 4 && compareAbs(arr, MAX_INT_ARR) < 0) {
      switch (length) {
        case 0:
          return 0; // Empty array means zero
        case 1:
          return arr[0]; // Single digit
        case 2:
          return arr[0] + arr[1] * BASE; // Two digits
        default:
          return arr[0] + (arr[1] + arr[2] * BASE) * BASE; // Three digits
      }
    }

    return arr; // Still too large for a small number
  }

  /**
   * Removes leading zero digits from an array representation.
   * Modifies the array in place.
   *
   * @param {number[]} v - The array of digits.
   */
  function trim(v) {
    var i = v.length;
    while (v[--i] === 0); // Find the first non-zero digit from the end
    v.length = i + 1; // Truncate the array
  }

  /**
   * Creates a new array of a given length, initialized with zeros.
   *
   * @param {number} length - The desired length of the array.
   * @returns {number[]} A new array filled with zeros.
   */
  function createArray(length) {
    var x = new Array(length);
    var i = -1;
    while (++i < length) {
      x[i] = 0;
    }
    return x;
  }

  /**
   * Truncates a number towards zero (removes fractional part).
   *
   * @param {number} n - The number to truncate.
   * @returns {number} The truncated integer.
   */
  function truncate(n) {
    if (n > 0) {
      return Math.floor(n);
    }
    return Math.ceil(n);
  }

  // --- Arithmetic Operations (Internal) ---

  /**
   * Adds two arrays of digits (representing positive BigIntegers).
   * Assumes a.length >= b.length.
   *
   * @param {number[]} a - First array.
   * @param {number[]} b - Second array.
   * @returns {number[]} Resulting array.
   */
  function add(a, b) {
    var l_a = a.length,
      l_b = b.length,
      r = new Array(l_a),
      carry = 0,
      base = BASE,
      sum,
      i;

    for (i = 0; i < l_b; i++) {
      sum = a[i] + b[i] + carry;
      carry = sum >= base ? 1 : 0;
      r[i] = sum - carry * base;
    }

    while (i < l_a) {
      sum = a[i] + carry;
      carry = sum === base ? 1 : 0;
      r[i++] = sum - carry * base;
    }

    if (carry > 0) {
      r.push(carry);
    }

    return r;
  }

  /**
   * Adds two arrays of digits, handling length differences.
   *
   * @param {number[]} a - First array.
   * @param {number[]} b - Second array.
   * @returns {number[]} Resulting array.
   */
  function addAny(a, b) {
    if (a.length >= b.length) {
      return add(a, b);
    }
    return add(b, a);
  }

  /**
   * Adds a small number (carry) to each digit of an array, propagating carries.
   * Used for adding small values or negating.
   *
   * @param {number[]} a - The array of digits.
   * @param {number} carry - The small number to add (can be negative).
   * @returns {number[]} Resulting array.
   */
  function addSmall(a, carry) {
    var l = a.length,
      r = new Array(l),
      base = BASE,
      sum,
      i;

    for (i = 0; i < l; i++) {
      sum = a[i] - base + carry; // Subtract base to ensure sum is small enough for Math.floor
      carry = Math.floor(sum / base);
      r[i] = sum - carry * base;
      carry += 1; // Adjust carry back
    }

    while (carry > 0) {
      r[i++] = carry % base;
      carry = Math.floor(carry / base);
    }

    return r;
  }

  // --- BigInteger.prototype.add ---
  BigInteger.prototype.add = function (v) {
    var n = parseValue(v);

    // If signs are different, perform subtraction.
    if (this.sign !== n.sign) {
      return this.subtract(n.negate());
    }

    var a = this.value,
      b = n.value;

    // Optimized path for adding a SmallInteger
    if (n.isSmall) {
      return new BigInteger(addSmall(a, Math.abs(b)), this.sign);
    }

    // General path for adding two BigIntegers
    return new BigInteger(addAny(a, b), this.sign);
  };

  // Alias for add
  BigInteger.prototype.plus = BigInteger.prototype.add;

  // --- SmallInteger.prototype.add ---
  SmallInteger.prototype.add = function (v) {
    var n = parseValue(v);
    var a = this.value;

    // If signs are different, perform subtraction (careful with 'a < 0 !== n.sign')
    // This checks if 'a' is negative and 'n' is positive, or 'a' is positive and 'n' is negative.
    if ((a < 0) !== n.sign) {
      return this.subtract(n.negate());
    }

    var b = n.value;

    // Optimized path for adding two SmallIntegers
    if (n.isSmall) {
      if (isPrecise(a + b)) {
        return new SmallInteger(a + b);
      }
      // If sum exceeds MAX_INT, convert b to array and proceed with BigInteger addition
      b = smallToArray(Math.abs(b));
    }

    // Fallback to BigInteger addition logic
    return new BigInteger(addSmall(b, Math.abs(a)), a < 0);
  };

  // Alias for add
  SmallInteger.prototype.plus = SmallInteger.prototype.add;

  /**
   * Subtracts one array of digits from another (a - b).
   * Assumes a >= b (absolute values).
   *
   * @param {number[]} a - Minuend array.
   * @param {number[]} b - Subtrahend array.
   * @returns {number[]} Resulting array.
   */
  function subtract(a, b) {
    var a_l = a.length,
      b_l = b.length,
      r = new Array(a_l),
      borrow = 0,
      base = BASE,
      i,
      difference;

    for (i = 0; i < b_l; i++) {
      difference = a[i] - borrow - b[i];
      if (difference < 0) {
        difference += base;
        borrow = 1;
      } else {
        borrow = 0;
      }
      r[i] = difference;
    }

    for (i = b_l; i < a_l; i++) {
      difference = a[i] - borrow;
      if (difference < 0) {
        difference += base;
      } else {
        r[i++] = difference;
        break;
      }
      r[i] = difference;
    }

    // Copy remaining digits from 'a' if any
    for (; i < a_l; i++) {
      r[i] = a[i];
    }

    trim(r);
    return r;
  }

  /**
   * Subtracts two arrays of digits, handling signs and order.
   *
   * @param {number[]} a - First array.
   * @param {number[]} b - Second array.
   * @param {boolean} sign - Expected sign of the result (true for negative, false for positive).
   * @returns {BigInteger|SmallInteger} Resulting integer.
   */
  function subtractAny(a, b, sign) {
    var value;

    // Compare absolute values to determine which is larger
    if (compareAbs(a, b) >= 0) {
      value = subtract(a, b);
    } else {
      value = subtract(b, a);
      sign = !sign; // Flip sign if we swapped operands
    }

    value = arrayToSmall(value); // Try to convert back to small
    if (typeof value === "number") {
      if (sign) {
        value = -value;
      }
      return new SmallInteger(value);
    }
    return new BigInteger(value, sign);
  }

  /**
   * Subtracts a small number (b) from an array of digits (a).
   * Used for subtracting small values or negating.
   *
   * @param {number[]} a - The array of digits.
   * @param {number} b - The small number to subtract.
   * @param {boolean} sign - The sign of the original `a`.
   * @returns {BigInteger|SmallInteger} Resulting integer.
   */
  function subtractSmall(a, b, sign) {
    var l = a.length,
      r = new Array(l),
      carry = -b, // Negative carry for subtraction
      base = BASE,
      i,
      difference;

    for (i = 0; i < l; i++) {
      difference = a[i] + carry;
      carry = Math.floor(difference / base);
      difference %= base;
      r[i] = difference < 0 ? difference + base : difference; // Ensure positive digit
    }

    r = arrayToSmall(r); // Try to convert back to small
    if (typeof r === "number") {
      if (sign) {
        r = -r;
      }
      return new SmallInteger(r);
    }
    return new BigInteger(r, sign);
  }

  // --- BigInteger.prototype.subtract ---
  BigInteger.prototype.subtract = function (v) {
    var n = parseValue(v);

    // If signs are different, perform addition of the negated number.
    if (this.sign !== n.sign) {
      return this.add(n.negate());
    }

    var a = this.value,
      b = n.value;

    // Optimized path for subtracting a SmallInteger
    if (n.isSmall) {
      return subtractSmall(a, Math.abs(b), this.sign);
    }

    // General path for subtracting two BigIntegers
    return subtractAny(a, b, this.sign);
  };

  // Alias for subtract
  BigInteger.prototype.minus = BigInteger.prototype.subtract;

  // --- SmallInteger.prototype.subtract ---
  SmallInteger.prototype.subtract = function (v) {
    var n = parseValue(v);
    var a = this.value;

    // If signs are different, perform addition of the negated number.
    if ((a < 0) !== n.sign) {
      return this.add(n.negate());
    }

    var b = n.value;

    // Optimized path for subtracting two SmallIntegers
    if (n.isSmall) {
      return new SmallInteger(a - b);
    }

    // Fallback to BigInteger subtraction logic
    // Note: The original implementation here seems to swap 'a' and 'b' (b, Math.abs(a))
    // which is unusual. It correctly handles the 'a >= 0' sign for the result.
    return subtractSmall(b, Math.abs(a), a >= 0);
  };

  // Alias for subtract
  SmallInteger.prototype.minus = SmallInteger.prototype.subtract;

  // --- Negation and Absolute Value ---

  BigInteger.prototype.negate = function () {
    return new BigInteger(this.value, !this.sign);
  };

  SmallInteger.prototype.negate = function () {
    var sign = this.sign;
    var small = new SmallInteger(-this.value);
    small.sign = !sign;
    return small;
  };

  BigInteger.prototype.abs = function () {
    return new BigInteger(this.value, false); // Always positive sign
  };

  SmallInteger.prototype.abs = function () {
    return new SmallInteger(Math.abs(this.value));
  };

  // --- Multiplication Operations (Internal) ---

  /**
   * Multiplies two arrays of digits using the standard long multiplication algorithm.
   *
   * @param {number[]} a - First array.
   * @param {number[]} b - Second array.
   * @returns {number[]} Resulting array.
   */
  function multiplyLong(a, b) {
    var a_l = a.length,
      b_l = b.length,
      l = a_l + b_l, // Max possible length of result
      r = createArray(l), // Result array, initialized with zeros
      base = BASE,
      product,
      carry,
      i,
      a_i,
      b_j;

    for (i = 0; i < a_l; ++i) {
      a_i = a[i];
      for (var j = 0; j < b_l; ++j) {
        b_j = b[j];
        product = a_i * b_j + r[i + j]; // Add current product to existing sum at position
        carry = Math.floor(product / base);
        r[i + j] = product - carry * base;
        r[i + j + 1] += carry; // Add carry to the next position
      }
    }

    trim(r); // Remove leading zeros
    return r;
  }

  /**
   * Multiplies an array of digits by a small JavaScript number.
   *
   * @param {number[]} a - Array of digits.
   * @param {number} b - Small number multiplier.
   * @returns {number[]} Resulting array.
   */
  function multiplySmall(a, b) {
    var l = a.length,
      r = new Array(l),
      base = BASE,
      carry = 0,
      product,
      i;

    for (i = 0; i < l; i++) {
      product = a[i] * b + carry;
      carry = Math.floor(product / base);
      r[i] = product - carry * base;
    }

    while (carry > 0) {
      r[i++] = carry % base;
      carry = Math.floor(carry / base);
    }

    return r;
  }

  /**
   * Shifts an array of digits left by 'n' positions (multiplies by BASE^n).
   *
   * @param {number[]} x - The array to shift.
   * @param {number} n - Number of positions to shift.
   * @returns {number[]} The shifted array.
   */
  function shiftLeft(x, n) {
    var r = [];
    while (n-- > 0) {
      r.push(0); // Add zeros to the right
    }
    return r.concat(x); // Concatenate original digits
  }

  /**
   * Multiplies two arrays of digits using the Karatsuba algorithm.
   * More efficient for very large numbers than `multiplyLong`.
   *
   * @param {number[]} x - First array.
   * @param {number[]} y - Second array.
   * @returns {number[]} Resulting array.
   */
  function multiplyKaratsuba(x, y) {
    var n = Math.max(x.length, y.length);

    // Base case: if numbers are small enough, use long multiplication.
    if (n <= 30) {
      return multiplyLong(x, y);
    }

    n = Math.ceil(n / 2); // Split point for Karatsuba

    // Divide x and y into two halves
    var b = x.slice(n),
      a = x.slice(0, n),
      d = y.slice(n),
      c = y.slice(0, n);

    // Recursively compute sub-products
    var ac = multiplyKaratsuba(a, c),
      bd = multiplyKaratsuba(b, d),
      abcd = multiplyKaratsuba(addAny(a, b), addAny(c, d));

    // Combine sub-products
    var product = addAny(
      addAny(ac, shiftLeft(subtract(subtract(abcd, ac), bd), n)),
      shiftLeft(bd, 2 * n)
    );

    trim(product);
    return product;
  }

  /**
   * Heuristic to decide whether to use Karatsuba multiplication or long multiplication.
   *
   * @param {number} l1 - Length of the first number.
   * @param {number} l2 - Length of the second number.
   * @returns {boolean} True if Karatsuba is likely faster.
   */
  function useKaratsuba(l1, l2) {
    return -0.012 * l1 - 0.012 * l2 + 15e-6 * l1 * l2 > 0;
  }

  // --- BigInteger.prototype.multiply ---
  BigInteger.prototype.multiply = function (v) {
    var n = parseValue(v),
      a = this.value,
      b = n.value,
      sign = this.sign !== n.sign, // Determine result sign
      abs;

    // Optimized path for multiplying by a SmallInteger
    if (n.isSmall) {
      if (b === 0) {
        return Integer[0]; // Multiply by zero
      }
      if (b === 1) {
        return this; // Multiply by one
      }
      if (b === -1) {
        return this.negate(); // Multiply by negative one
      }
      abs = Math.abs(b);
      if (abs < BASE) {
        // If small multiplier fits in one digit
        return new BigInteger(multiplySmall(a, abs), sign);
      }
      // If small multiplier is larger than one digit, convert to array
      b = smallToArray(abs);
    }

    // Choose multiplication algorithm based on size heuristic
    if (useKaratsuba(a.length, b.length)) {
      return new BigInteger(multiplyKaratsuba(a, b), sign);
    }

    // Default to long multiplication
    return new BigInteger(multiplyLong(a, b), sign);
  };

  // Alias for multiply
  BigInteger.prototype.times = BigInteger.prototype.multiply;

  /**
   * Multiplies a small number by an array of digits.
   *
   * @param {number} a - Small number multiplier.
   * @param {number[]} b - Array of digits.
   * @param {boolean} sign - Sign of the result.
   * @returns {BigInteger} Resulting BigInteger.
   */
  function multiplySmallAndArray(a, b, sign) {
    if (a < BASE) {
      return new BigInteger(multiplySmall(b, a), sign);
    }
    return new BigInteger(multiplyLong(b, smallToArray(a)), sign);
  }

  // Internal helper for multiplication, called by SmallInteger.multiply
  SmallInteger.prototype._multiplyBySmall = function (a) {
    if (isPrecise(a.value * this.value)) {
      // If product fits in a small integer
      return new SmallInteger(a.value * this.value);
    }
    // Otherwise, convert to array and use BigInteger multiplication
    return multiplySmallAndArray(
      Math.abs(a.value),
      smallToArray(Math.abs(this.value)),
      this.sign !== a.sign
    );
  };

  // Internal helper for multiplication, called by BigInteger.multiply (indirectly)
  BigInteger.prototype._multiplyBySmall = function (a) {
    if (a.value === 0) {
      return Integer[0];
    }
    if (a.value === 1) {
      return this;
    }
    if (a.value === -1) {
      return this.negate();
    }
    return multiplySmallAndArray(
      Math.abs(a.value),
      this.value,
      this.sign !== a.sign
    );
  };

  // --- SmallInteger.prototype.multiply ---
  SmallInteger.prototype.multiply = function (v) {
    return parseValue(v)._multiplyBySmall(this);
  };

  // Alias for multiply
  SmallInteger.prototype.times = SmallInteger.prototype.multiply;

  // --- Square Operations ---

  /**
   * Squares an array of digits using a specialized algorithm.
   *
   * @param {number[]} a - The array to square.
   * @returns {number[]} The squared array.
   */
  function square(a) {
    var l = a.length,
      r = createArray(l + l), // Max possible length of result
      base = BASE,
      product,
      carry,
      i,
      a_i,
      a_j;

    for (i = 0; i < l; i++) {
      a_i = a[i];
      carry = 0 - a_i * a_i; // Initialize carry with diagonal term (negative square)

      for (var j = i; j < l; j++) {
        a_j = a[j];
        // 2 * a_i * a_j + r[i+j] + carry
        // The 2* factor handles cross-terms (a_i * a_j + a_j * a_i)
        product = 2 * (a_i * a_j) + r[i + j] + carry;
        carry = Math.floor(product / base);
        r[i + j] = product - carry * base;
      }
      r[i + l] = carry; // Store final carry for this row
    }

    trim(r);
    return r;
  }

  // --- BigInteger.prototype.square ---
  BigInteger.prototype.square = function () {
    return new BigInteger(square(this.value), false); // Square is always positive
  };

  // --- SmallInteger.prototype.square ---
  SmallInteger.prototype.square = function () {
    var value = this.value * this.value;
    if (isPrecise(value)) {
      return new SmallInteger(value);
    }
    return new BigInteger(square(smallToArray(Math.abs(this.value))), false);
  };

  // --- Division and Modulo Operations (Internal) ---

  /**
   * Division algorithm for BigIntegers (Knuth's Algorithm D).
   * Used when divisor has multiple digits.
   *
   * @param {number[]} a - Dividend array.
   * @param {number[]} b - Divisor array.
   * @returns {[number[], number[]]} Array containing [quotient, remainder].
   */
  function divMod1(a, b) {
    var a_l = a.length,
      b_l = b.length,
      base = BASE,
      result = createArray(b.length), // Quotient array
      divisorMostSignificantDigit = b[b_l - 1],
      // Normalize: multiply by lambda to make divisorMostSignificantDigit >= BASE / 2
      lambda = Math.ceil(base / (2 * divisorMostSignificantDigit)),
      remainder = multiplySmall(a, lambda),
      divisor = multiplySmall(b, lambda),
      quotientDigit,
      shift,
      carry,
      borrow,
      i,
      l,
      q;

    // Adjust lengths after normalization
    if (remainder.length <= a_l) {
      remainder.push(0);
    }
    divisor.push(0); // Pad divisor for easier calculations
    divisorMostSignificantDigit = divisor[b_l - 1]; // Update after normalization

    for (shift = a_l - b_l; shift >= 0; shift--) {
      // Estimate quotient digit
      quotientDigit = base - 1;
      if (remainder[shift + b_l] !== divisorMostSignificantDigit) {
        quotientDigit = Math.floor(
          (remainder[shift + b_l] * base + remainder[shift + b_l - 1]) /
            divisorMostSignificantDigit
        );
      }

      // Subtract (quotientDigit * divisor) from current part of remainder
      carry = 0;
      borrow = 0;
      l = divisor.length;
      for (i = 0; i < l; i++) {
        carry += quotientDigit * divisor[i];
        q = Math.floor(carry / base);
        borrow += remainder[shift + i] - (carry - q * base);
        carry = q;
        if (borrow < 0) {
          remainder[shift + i] = borrow + base;
          borrow = -1;
        } else {
          remainder[shift + i] = borrow;
          borrow = 0;
        }
      }

      // Adjust quotientDigit if it was too large
      while (borrow !== 0) {
        quotientDigit -= 1;
        carry = 0;
        for (i = 0; i < l; i++) {
          carry += remainder[shift + i] - base + divisor[i];
          if (carry < 0) {
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
   * Simpler division algorithm for BigIntegers.
   * Used when divisor has only one digit (after normalization).
   * Or when `divMod1` is too complex (e.g. for small number of digits)
   *
   * @param {number[]} a - Dividend array.
   * @param {number[]} b - Divisor array.
   * @returns {[number[], number[]]} Array containing [quotient, remainder].
   */
  function divMod2(a, b) {
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

    while (a_l) {
      part.unshift(a[--a_l]); // Take digits from dividend one by one
      trim(part); // Remove leading zeros from the part

      if (compareAbs(part, b) < 0) {
        result.push(0); // If part is smaller than divisor, quotient digit is 0
        continue;
      }

      xlen = part.length;
      highx = part[xlen - 1] * base + part[xlen - 2]; // Top two digits of part
      highy = b[b_l - 1] * base + b[b_l - 2]; // Top two digits of divisor

      if (xlen > b_l) {
        highx = (highx + 1) * base; // Adjust for length difference
      }

      guess = Math.ceil(highx / highy); // Initial guess for quotient digit

      // Refine guess
      do {
        check = multiplySmall(b, guess);
        if (compareAbs(check, part) <= 0) {
          break;
        }
        guess--;
      } while (guess);

      result.push(guess); // Add confirmed quotient digit
      part = subtract(part, check); // Subtract (guess * divisor) from part
    }

    result.reverse(); // Digits were collected in reverse order
    return [arrayToSmall(result), arrayToSmall(part)];
  }

  /**
   * Divides an array of digits by a small JavaScript number.
   *
   * @param {number[]} value - The array of digits (dividend).
   * @param {number} lambda - The small number (divisor).
   * @returns {[number[], number]} Array containing [quotient array, remainder number].
   */
  function divModSmall(value, lambda) {
    var length = value.length,
      quotient = createArray(length),
      base = BASE,
      i,
      q,
      remainder,
      divisor;

    remainder = 0;
    for (i = length - 1; i >= 0; --i) {
      divisor = remainder * base + value[i];
      q = truncate(divisor / lambda);
      remainder = divisor - q * lambda;
      quotient[i] = q | 0; // Ensure integer
    }
    return [quotient, remainder | 0]; // Ensure integer
  }

  /**
   * Performs division and modulo for any BigInteger/SmallInteger combination.
   *
   * @param {BigInteger|SmallInteger} self - The dividend.
   * @param {BigInteger|SmallInteger|number|string} v - The divisor.
   * @returns {[BigInteger|SmallInteger, BigInteger|SmallInteger]} Array containing [quotient, remainder].
   */
  function divModAny(self, v) {
    var value,
      n = parseValue(v); // Ensure divisor is an Integer instance
    var a = self.value,
      b = n.value;
    var quotient;

    if (b === 0) {
      throw new Error("Cannot divide by zero");
    }

    // Optimized path for SmallInteger dividend
    if (self.isSmall) {
      if (n.isSmall) {
        // Both small
        return [
          new SmallInteger(truncate(a / b)),
          new SmallInteger(a % b),
        ];
      }
      // Small dividend, BigInteger divisor => quotient is 0, remainder is dividend itself
      return [Integer[0], self];
    }

    // Optimized path for SmallInteger divisor
    if (n.isSmall) {
      if (b === 1) {
        return [self, Integer[0]];
      }
      if (b === -1) {
        return [self.negate(), Integer[0]];
      }

      var abs = Math.abs(b);
      if (abs < BASE) {
        // Small divisor fits in one digit
        value = divModSmall(a, abs);
        quotient = arrayToSmall(value[0]);
        var remainder = value[1];

        if (self.sign) {
          remainder = -remainder;
        }

        if (typeof quotient === "number") {
          if (self.sign !== n.sign) {
            quotient = -quotient;
          }
          return [new SmallInteger(quotient), new SmallInteger(remainder)];
        }
        return [
          new BigInteger(quotient, self.sign !== n.sign),
          new SmallInteger(remainder),
        ];
      }
      // Small divisor is larger than one digit, convert to array
      b = smallToArray(abs);
    }

    // General path for BigInteger division
    var comparison = compareAbs(a, b);
    if (comparison === -1) {
      // Dividend < Divisor (absolute)
      return [Integer[0], self];
    }
    if (comparison === 0) {
      // Dividend == Divisor (absolute)
      return [Integer[self.sign === n.sign ? 1 : -1], Integer[0]];
    }

    // Choose division algorithm based on size
    if (a.length + b.length <= 200) {
      value = divMod1(a, b);
    } else {
      value = divMod2(a, b);
    }

    quotient = value[0];
    var qSign = self.sign !== n.sign, // Sign of quotient
      mod = value[1],
      mSign = self.sign; // Sign of remainder is same as dividend

    if (typeof quotient === "number") {
      if (qSign) {
        quotient = -quotient;
      }
      quotient = new SmallInteger(quotient);
    } else {
      quotient = new BigInteger(quotient, qSign);
    }

    if (typeof mod === "number") {
      if (mSign) {
        mod = -mod;
      }
      mod = new SmallInteger(mod);
    } else {
      mod = new BigInteger(mod, mSign);
    }

    return [quotient, mod];
  }

  // --- BigInteger.prototype.divmod ---
  BigInteger.prototype.divmod = function (v) {
    var result = divModAny(this, v);
    return { quotient: result[0], remainder: result[1] };
  };

  // --- SmallInteger.prototype.divmod ---
  SmallInteger.prototype.divmod = BigInteger.prototype.divmod;

  // --- BigInteger.prototype.divide ---
  BigInteger.prototype.divide = function (v) {
    return divModAny(this, v)[0];
  };

  // Aliases for divide
  SmallInteger.prototype.over = SmallInteger.prototype.divide = BigInteger.prototype.over = BigInteger.prototype.divide;

  // --- BigInteger.prototype.mod ---
  BigInteger.prototype.mod = function (v) {
    return divModAny(this, v)[1];
  };

  // Aliases for mod
  SmallInteger.prototype.remainder = SmallInteger.prototype.mod = BigInteger.prototype.remainder = BigInteger.prototype.mod;

  // --- Power Operations ---

  // --- BigInteger.prototype.pow ---
  BigInteger.prototype.pow = function (v) {
    var n = parseValue(v),
      a = this.value,
      b = n.value,
      value,
      x,
      y;

    if (b === 0) {
      return Integer[1]; // Any number to the power of 0 is 1
    }
    if (a === 0) {
      return Integer[0]; // 0 to any positive power is 0
    }
    if (a === 1) {
      return Integer[1]; // 1 to any power is 1
    }
    if (a === -1) {
      // -1 to even power is 1, to odd power is -1
      return n.isEven() ? Integer[1] : Integer[-1];
    }

    if (n.sign) {
      return Integer[0]; // Negative exponent for integer results in 0 (for |base| > 1)
    }

    if (!n.isSmall) {
      throw new Error("The exponent " + n.toString() + " is too large.");
    }

    // Optimization for small bases and exponents
    if (this.isSmall) {
      if (isPrecise((value = Math.pow(a, b)))) {
        return new SmallInteger(truncate(value));
      }
    }

    // Binary exponentiation (exponentiation by squaring)
    x = this;
    y = Integer[1]; // Accumulator for the result

    while (true) {
      if ((b & 1) === 1) {
        // If exponent is odd
        y = y.times(x);
        --b;
      }
      if (b === 0) {
        break; // Done
      }
      b /= 2; // Halve the exponent
      x = x.square(); // Square the base
    }

    return y;
  };

  // --- SmallInteger.prototype.pow ---
  SmallInteger.prototype.pow = BigInteger.prototype.pow;

  // --- BigInteger.prototype.modPow ---
  BigInteger.prototype.modPow = function (exp, mod) {
    exp = parseValue(exp);
    mod = parseValue(mod);

    if (mod.isZero()) {
      throw new Error("Cannot take modPow with modulus 0");
    }

    var r = Integer[1], // Result accumulator (starts at 1)
      base = this.mod(mod); // Base modulo modulus

    while (exp.isPositive()) {
      if (base.isZero()) {
        return Integer[0]; // If base % mod is 0, then 0^exp % mod is 0
      }
      if (exp.isOdd()) {
        r = r.multiply(base).mod(mod); // If exponent is odd, multiply result by base
      }
      exp = exp.divide(2); // Halve the exponent
      base = base.square().mod(mod); // Square the base modulo modulus
    }

    return r;
  };

  // --- SmallInteger.prototype.modPow ---
  SmallInteger.prototype.modPow = BigInteger.prototype.modPow;

  // --- Comparison Operations (Internal) ---

  /**
   * Compares the absolute values of two arrays of digits.
   *
   * @param {number[]} a - First array.
   * @param {number[]} b - Second array.
   * @returns {number} 1 if a > b, -1 if a < b, 0 if a == b.
   */
  function compareAbs(a, b) {
    if (a.length !== b.length) {
      return a.length > b.length ? 1 : -1; // Longer array is larger
    }
    // Compare digit by digit from most significant
    for (var i = a.length - 1; i >= 0; i--) {
      if (a[i] !== b[i]) {
        return a[i] > b[i] ? 1 : -1;
      }
    }
    return 0; // Arrays are equal
  }

  // --- BigInteger.prototype.compareAbs ---
  BigInteger.prototype.compareAbs = function (v) {
    var n = parseValue(v),
      a = this.value,
      b = n.value;

    if (n.isSmall) {
      return 1; // BigInteger is always larger than SmallInteger in absolute value (unless SmallInteger is 0)
    }
    return compareAbs(a, b);
  };

  // --- SmallInteger.prototype.compareAbs ---
  SmallInteger.prototype.compareAbs = function (v) {
    var n = parseValue(v),
      a = Math.abs(this.value),
      b = n.value;

    if (n.isSmall) {
      b = Math.abs(b);
      return a === b ? 0 : a > b ? 1 : -1; // Standard number comparison
    }
    return -1; // SmallInteger is smaller than BigInteger in absolute value (unless BigInteger is 0)
  };

  // --- BigInteger.prototype.compare ---
  BigInteger.prototype.compare = function (v) {
    if (v === Infinity) {
      return -1;
    }
    if (v === -Infinity) {
      return 1;
    }

    var n = parseValue(v),
      a = this.value,
      b = n.value;

    // Compare signs first
    if (this.sign !== n.sign) {
      return n.sign ? 1 : -1; // If `n` is negative, `this` (positive) is greater
    }

    // If `n` is a SmallInteger, it's either smaller or larger depending on sign
    if (n.isSmall) {
      return this.sign ? -1 : 1; // If negative, SmallInteger is "less negative" (closer to 0)
    }

    // Compare absolute values, then apply sign
    return compareAbs(a, b) * (this.sign ? -1 : 1);
  };

  // Alias for compare
  BigInteger.prototype.compareTo = BigInteger.prototype.compare;

  // --- SmallInteger.prototype.compare ---
  SmallInteger.prototype.compare = function (v) {
    if (v === Infinity) {
      return -1;
    }
    if (v === -Infinity) {
      return 1;
    }

    var n = parseValue(v),
      a = this.value,
      b = n.value;

    if (n.isSmall) {
      return a == b ? 0 : a > b ? 1 : -1; // Standard number comparison
    }

    // If signs are different, one is negative and other is positive
    // (a < 0 !== n.sign) means (a is negative AND n is positive) OR (a is positive AND n is negative)
    if ((a < 0) !== n.sign) {
      return a < 0 ? -1 : 1; // If 'a' is negative, it's smaller; if positive, it's larger
    }

    // Both have same sign, 'a' is small, 'n' is big
    // If 'a' is negative, it's smaller (e.g., -50 < -1000)
    // If 'a' is positive, it's smaller (e.g., 50 < 1000)
    return a < 0 ? 1 : -1; // This logic seems reversed; a negative small int is GREATER than a negative big int.
    // The original logic here is correct: if a < 0, then this (SmallInteger) is "less negative" than BigInteger, so it's larger.
    // If a > 0, then this (SmallInteger) is smaller than BigInteger.
    // Let's re-verify:
    // a=5, n=BigInteger(100): a.compare(n) -> a<0!==n.sign is false. a<0 is false. returns -1 (correct, 5 < 100)
    // a=-5, n=BigInteger(-100): a<0!==n.sign is false. a<0 is true. returns 1 (correct, -5 > -100)
  };

  // Alias for compare
  SmallInteger.prototype.compareTo = SmallInteger.prototype.compare;

  // --- Equality and Inequality ---

  BigInteger.prototype.equals = function (v) {
    return this.compare(v) === 0;
  };
  SmallInteger.prototype.eq = SmallInteger.prototype.equals = BigInteger.prototype.eq = BigInteger.prototype.equals;

  BigInteger.prototype.notEquals = function (v) {
    return this.compare(v) !== 0;
  };
  SmallInteger.prototype.neq = SmallInteger.prototype.notEquals = BigInteger.prototype.neq = BigInteger.prototype.notEquals;

  // --- Greater Than / Less Than ---

  BigInteger.prototype.greater = function (v) {
    return this.compare(v) > 0;
  };
  SmallInteger.prototype.gt = SmallInteger.prototype.greater = BigInteger.prototype.gt = BigInteger.prototype.greater;

  BigInteger.prototype.lesser = function (v) {
    return this.compare(v) < 0;
  };
  SmallInteger.prototype.lt = SmallInteger.prototype.lesser = BigInteger.prototype.lt = BigInteger.prototype.lesser;

  // --- Greater Than or Equals / Lesser Than or Equals ---

  BigInteger.prototype.greaterOrEquals = function (v) {
    return this.compare(v) >= 0;
  };
  SmallInteger.prototype.geq = SmallInteger.prototype.greaterOrEquals = BigInteger.prototype.geq = BigInteger.prototype.greaterOrEquals;

  BigInteger.prototype.lesserOrEquals = function (v) {
    return this.compare(v) <= 0;
  };
  SmallInteger.prototype.leq = SmallInteger.prototype.lesserOrEquals = BigInteger.prototype.leq = BigInteger.prototype.lesserOrEquals;

  // --- Property Checks ---

  BigInteger.prototype.isEven = function () {
    return (this.value[0] & 1) === 0; // Check the least significant digit
  };
  SmallInteger.prototype.isEven = function () {
    return (this.value & 1) === 0;
  };

  BigInteger.prototype.isOdd = function () {
    return (this.value[0] & 1) === 1; // Check the least significant digit
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
    return false; // Only small integers can be 1 or -1
  };
  SmallInteger.prototype.isUnit = function () {
    return Math.abs(this.value) === 1;
  };

  BigInteger.prototype.isZero = function () {
    return false; // Only SmallInteger(0) is true
  };
  SmallInteger.prototype.isZero = function () {
    return this.value === 0;
  };

  BigInteger.prototype.isDivisibleBy = function (v) {
    var n = parseValue(v);
    var value = n.value;

    if (value === 0) {
      return false; // Cannot divide by zero
    }
    if (value === 1) {
      return true; // Divisible by 1
    }
    if (value === 2) {
      return this.isEven(); // Check evenness for divisibility by 2
    }

    return this.mod(n).equals(Integer[0]); // Check if remainder is zero
  };
  SmallInteger.prototype.isDivisibleBy = BigInteger.prototype.isDivisibleBy;

  // --- Primality Tests ---

  /**
   * Checks for basic primality (small primes and divisibility by small primes).
   *
   * @param {BigInteger|SmallInteger} v - The number to check.
   * @returns {boolean|undefined} True/False if result is conclusive, undefined otherwise.
   */
  function isBasicPrime(v) {
    var n = v.abs();

    if (n.isUnit()) {
      return false; // 1 is not prime
    }
    if (n.equals(2) || n.equals(3) || n.equals(5)) {
      return true; // 2, 3, 5 are primes
    }
    if (n.isEven() || n.isDivisibleBy(3) || n.isDivisibleBy(5)) {
      return false; // Divisible by 2, 3, or 5
    }
    if (n.lesser(25)) {
      return true; // All numbers less than 25 not divisible by 2,3,5 are prime (7,11,13,17,19,23)
    }
    // For larger numbers, more robust tests are needed
    return undefined;
  }

  // --- BigInteger.prototype.isPrime ---
  BigInteger.prototype.isPrime = function () {
    var isPrime = isBasicPrime(this);
    if (isPrime !== undefined) {
      return isPrime;
    }

    var n = this.abs(),
      nPrev = n.prev(); // n - 1

    // Miller-Rabin test with a fixed set of bases
    var a = [2, 3, 5, 7, 11, 13, 17, 19],
      b = nPrev, // n-1 = 2^s * d, where d is odd
      d,
      t,
      i,
      x;

    // Find d such that n-1 = 2^s * d
    while (b.isEven()) {
      b = b.divide(2);
    }

    // Perform Miller-Rabin test for each base 'a_i'
    for (i = 0; i < a.length; i++) {
      x = bigInt(a[i]).modPow(b, n); // x = a_i^d mod n

      if (x.equals(Integer[1]) || x.equals(nPrev)) {
        continue; // Pass for this base
      }

      for (t = true, d = b; t && d.lesser(nPrev); d = d.multiply(2)) {
        x = x.square().mod(n); // x = x^2 mod n
        if (x.equals(nPrev)) {
          t = false; // Pass for this base
        }
      }
      if (t) {
        return false; // Composite
      }
    }
    return true; // Probably prime
  };

  // --- SmallInteger.prototype.isPrime ---
  SmallInteger.prototype.isPrime = BigInteger.prototype.isPrime;

  // --- BigInteger.prototype.isProbablePrime ---
  BigInteger.prototype.isProbablePrime = function (iterations) {
    var isPrime = isBasicPrime(this);
    if (isPrime !== undefined) {
      return isPrime;
    }

    var n = this.abs();
    var t = iterations === undefined ? 5 : iterations; // Number of iterations for Miller-Rabin

    for (var i = 0; i < t; i++) {
      var a = bigInt.randBetween(2, n.minus(2)); // Random base 'a'
      if (!a.modPow(n.prev(), n).isUnit()) {
        return false; // Composite
      }
    }
    return true; // Probably prime
  };

  // --- SmallInteger.prototype.isProbablePrime ---
  SmallInteger.prototype.isProbablePrime = BigInteger.prototype.isProbablePrime;

  // --- Modular Inverse ---

  // --- BigInteger.prototype.modInv ---
  BigInteger.prototype.modInv = function (n) {
    var t = bigInt.zero, // t_0
      newT = bigInt.one, // t_1
      r = parseValue(n), // r_0 = modulus
      newR = this.abs(), // r_1 = number to invert (absolute value)
      q,
      lastT,
      lastR;

    // Extended Euclidean Algorithm
    while (!newR.equals(bigInt.zero)) {
      q = r.divide(newR); // q = floor(r_k / r_{k+1})

      lastT = t; // Store t_k
      lastR = r; // Store r_k

      t = newT; // t_{k+1}
      r = newR; // r_{k+1}

      newT = lastT.subtract(q.multiply(newT)); // t_{k+2} = t_k - q * t_{k+1}
      newR = lastR.subtract(q.multiply(newR)); // r_{k+2} = r_k - q * r_{k+1}
    }

    if (!r.equals(1)) {
      throw new Error(
        this.toString() + " and " + n.toString() + " are not co-prime"
      );
    }

    // Adjust 't' to be positive if needed
    if (t.compare(0) === -1) {
      t = t.add(n);
    }

    // If original number was negative, negate the result
    if (this.isNegative()) {
      return t.negate();
    }

    return t;
  };

  // --- SmallInteger.prototype.modInv ---
  SmallInteger.prototype.modInv = BigInteger.prototype.modInv;

  // --- Increment/Decrement ---

  // --- BigInteger.prototype.next ---
  BigInteger.prototype.next = function () {
    var value = this.value;
    if (this.sign) {
      // If negative, increment means subtracting 1 from absolute value
      return subtractSmall(value, 1, this.sign);
    }
    // If positive, increment means adding 1
    return new BigInteger(addSmall(value, 1), this.sign);
  };

  // --- SmallInteger.prototype.next ---
  SmallInteger.prototype.next = function () {
    var value = this.value;
    if (value + 1 < MAX_INT) {
      return new SmallInteger(value + 1);
    }
    // If incrementing exceeds MAX_INT, convert to BigInteger
    return new BigInteger(MAX_INT_ARR, false);
  };

  // --- BigInteger.prototype.prev ---
  BigInteger.prototype.prev = function () {
    var value = this.value;
    if (this.sign) {
      // If negative, decrement means adding 1 to absolute value
      return new BigInteger(addSmall(value, 1), true);
    }
    // If positive, decrement means subtracting 1
    return subtractSmall(value, 1, this.sign);
  };

  // --- SmallInteger.prototype.prev ---
  SmallInteger.prototype.prev = function () {
    var value = this.value;
    if (value - 1 > -MAX_INT) {
      return new SmallInteger(value - 1);
    }
    // If decrementing goes below -MAX_INT, convert to BigInteger
    return new BigInteger(MAX_INT_ARR, true); // MAX_INT_ARR with negative sign
  };

  // --- Bitwise Shift Operations ---

  // Pre-calculate powers of two up to BASE for efficient shifting
  var powersOfTwo = [1];
  while (2 * powersOfTwo[powersOfTwo.length - 1] <= BASE) {
    powersOfTwo.push(2 * powersOfTwo[powersOfTwo.length - 1]);
  }
  var powers2Length = powersOfTwo.length,
    highestPower2 = powersOfTwo[powers2Length - 1];

  /**
   * Checks if the shift amount is small enough to be handled directly.
   *
   * @param {number|string|BigInteger} n - The shift amount.
   * @returns {boolean} True if small, false otherwise.
   */
  function shift_isSmall(n) {
    return (
      (typeof n === "number" || typeof n === "string") &&
      +Math.abs(n) <= BASE || // Small number or string representation
      (n instanceof BigInteger && n.value.length <= 1)
    ); // BigInteger with one digit (small value)
  }

  // --- BigInteger.prototype.shiftLeft ---
  BigInteger.prototype.shiftLeft = function (n) {
    if (!shift_isSmall(n)) {
      throw new Error(String(n) + " is too large for shifting.");
    }
    n = +n; // Ensure 'n' is a number

    if (n < 0) {
      return this.shiftRight(-n); // Left shifting by negative is right shifting
    }

    var result = this;
    if (result.isZero()) {
      return result;
    }

    // Perform shifts in chunks of highestPower2
    while (n >= powers2Length) {
      result = result.multiply(highestPower2);
      n -= powers2Length - 1; // powers2Length-1 because powersOfTwo[powers2Length-1] is 2^(powers2Length-1)
    }

    return result.multiply(powersOfTwo[n]); // Apply remaining shift
  };

  // --- SmallInteger.prototype.shiftLeft ---
  SmallInteger.prototype.shiftLeft = BigInteger.prototype.shiftLeft;

  // --- BigInteger.prototype.shiftRight ---
  BigInteger.prototype.shiftRight = function (n) {
    var remQuo;
    if (!shift_isSmall(n)) {
      throw new Error(String(n) + " is too large for shifting.");
    }
    n = +n; // Ensure 'n' is a number

    if (n < 0) {
      return this.shiftLeft(-n); // Right shifting by negative is left shifting
    }

    var result = this;

    // Perform shifts in chunks of highestPower2
    while (n >= powers2Length) {
      if (result.isZero() || (result.isNegative() && result.isUnit())) {
        return result; // Shifting a negative unit right results in -1 or 0
      }
      remQuo = divModAny(result, highestPower2);
      result = remQuo[1].isNegative() ? remQuo[0].prev() : remQuo[0]; // Handle negative remainders for floor division
      n -= powers2Length - 1;
    }

    remQuo = divModAny(result, powersOfTwo[n]);
    return remQuo[1].isNegative() ? remQuo[0].prev() : remQuo[0]; // Handle negative remainders for floor division
  };

  // --- SmallInteger.prototype.shiftRight ---
  SmallInteger.prototype.shiftRight = BigInteger.prototype.shiftRight;

  // --- Bitwise Logical Operations ---

  /**
   * Generic bitwise operation function.
   *
   * @param {BigInteger|SmallInteger} x - First operand.
   * @param {BigInteger|SmallInteger|number|string} y - Second operand.
   * @param {function(number, number): number} fn - The bitwise function (e.g., &, |, ^).
   * @returns {BigInteger|SmallInteger} Result of the bitwise operation.
   */
  function bitwise(x, y, fn) {
    y = parseValue(y); // Ensure y is an Integer instance

    var xSign = x.isNegative(),
      ySign = y.isNegative();

    // Use two's complement representation for negative numbers
    var xRem = xSign ? x.not() : x, // x' = ~x if x < 0
      yRem = ySign ? y.not() : y; // y' = ~y if y < 0

    var xDigit = 0,
      yDigit = 0;
    var xDivMod = null,
      yDivMod = null;
    var result = []; // Stores digits of the result

    // Process digits from least significant
    while (!xRem.isZero() || !yRem.isZero()) {
      xDivMod = divModAny(xRem, highestPower2);
      xDigit = xDivMod[1].toJSNumber();
      if (xSign) {
        xDigit = highestPower2 - 1 - xDigit; // Invert digits for negative numbers
      }

      yDivMod = divModAny(yRem, highestPower2);
      yDigit = yDivMod[1].toJSNumber();
      if (ySign) {
        yDigit = highestPower2 - 1 - yDigit; // Invert digits for negative numbers
      }

      xRem = xDivMod[0];
      yRem = yDivMod[0];

      result.push(fn(xDigit, yDigit)); // Apply bitwise function to digits
    }

    // Determine the sign of the result by applying fn to the "sign bits"
    var sum = fn(xSign ? 1 : 0, ySign ? 1 : 0) !== 0 ? bigInt(-1) : bigInt(0);

    // Reconstruct the result from digits
    for (var i = result.length - 1; i >= 0; i -= 1) {
      sum = sum.multiply(highestPower2).add(bigInt(result[i]));
    }

    return sum;
  }

  // --- BigInteger.prototype.not ---
  BigInteger.prototype.not = function () {
    return this.negate().prev(); // ~x = -x - 1
  };

  // --- SmallInteger.prototype.not ---
  SmallInteger.prototype.not = BigInteger.prototype.not;

  // --- BigInteger.prototype.and ---
  BigInteger.prototype.and = function (n) {
    return bitwise(this, n, function (a, b) {
      return a & b;
    });
  };

  // --- SmallInteger.prototype.and ---
  SmallInteger.prototype.and = BigInteger.prototype.and;

  // --- BigInteger.prototype.or ---
  BigInteger.prototype.or = function (n) {
    return bitwise(this, n, function (a, b) {
      return a | b;
    });
  };

  // --- SmallInteger.prototype.or ---
  SmallInteger.prototype.or = BigInteger.prototype.or;

  // --- BigInteger.prototype.xor ---
  BigInteger.prototype.xor = function (n) {
    return bitwise(this, n, function (a, b) {
      return a ^ b;
    });
  };

  // --- SmallInteger.prototype.xor ---
  SmallInteger.prototype.xor = BigInteger.prototype.xor;

  // --- Least Significant Bit (LOB) ---

  // Constants for fast LOB calculation
  var LOBMASK_I = 1 << 30, // Mask for integer LOB
    LOBMASK_BI = (BASE & -BASE) * (BASE & -BASE) | LOBMASK_I; // Mask for BigInteger LOB

  /**
   * Calculates a rough approximation of the Least Significant Bit (LOB).
   *
   * @param {BigInteger|SmallInteger} n - The number.
   * @returns {number} Rough LOB.
   */
  function roughLOB(n) {
    var v = n.value,
      x =
        typeof v === "number"
          ? v | LOBMASK_I
          : v[0] + v[1] * BASE | LOBMASK_BI; // Use first few digits
    return x & -x; // Standard way to find LOB
  }

  // --- Logarithm and Bit Length ---

  /**
   * Calculates integer logarithm (base 2).
   * Used for bitLength.
   *
   * @param {BigInteger|SmallInteger} value - The number.
   * @param {BigInteger|SmallInteger} base - The base (e.g., 2 for bitLength).
   * @returns {{p: BigInteger|SmallInteger, e: number}} Object with power and exponent.
   */
  function integerLogarithm(value, base) {
    if (base.compareTo(value) <= 0) {
      var tmp = integerLogarithm(value, base.square(base)); // Recursive call with squared base
      var p = tmp.p;
      var e = tmp.e;
      var t = p.multiply(base); // p * base

      return t.compareTo(value) <= 0
        ? { p: t, e: e * 2 + 1 }
        : { p: p, e: e * 2 };
    }
    return { p: bigInt(1), e: 0 }; // Base case: value < base
  }

  // --- BigInteger.prototype.bitLength ---
  BigInteger.prototype.bitLength = function () {
    var n = this;

    if (n.compareTo(bigInt(0)) < 0) {
      n = n.negate().subtract(bigInt(1)); // For negative numbers, bit length of ~x
    }
    if (n.compareTo(bigInt(0)) === 0) {
      return bigInt(0); // Bit length of 0 is 0
    }

    return bigInt(integerLogarithm(n, bigInt(2)).e).add(bigInt(1)); // Log base 2 + 1
  };

  // --- SmallInteger.prototype.bitLength ---
  SmallInteger.prototype.bitLength = BigInteger.prototype.bitLength;

  // --- Min/Max ---

  /**
   * Returns the maximum of two numbers.
   *
   * @param {BigInteger|SmallInteger|number|string} a - First number.
   * @param {BigInteger|SmallInteger|number|string} b - Second number.
   * @returns {BigInteger|SmallInteger} The larger number.
   */
  function max(a, b) {
    a = parseValue(a);
    b = parseValue(b);
    return a.greater(b) ? a : b;
  }

  /**
   * Returns the minimum of two numbers.
   *
   * @param {BigInteger|SmallInteger|number|string} a - First number.
   * @param {BigInteger|SmallInteger|number|string} b - Second number.
   * @returns {BigInteger|SmallInteger} The smaller number.
   */
  function min(a, b) {
    a = parseValue(a);
    b = parseValue(b);
    return a.lesser(b) ? a : b;
  }

  // --- Greatest Common Divisor (GCD) ---

  /**
   * Calculates the Greatest Common Divisor (GCD) of two numbers.
   * Uses binary GCD algorithm.
   *
   * @param {BigInteger|SmallInteger|number|string} a - First number.
   * @param {BigInteger|SmallInteger|number|string} b - Second number.
   * @returns {BigInteger|SmallInteger} The GCD.
   */
  function gcd(a, b) {
    a = parseValue(a).abs();
    b = parseValue(b).abs();

    if (a.equals(b)) {
      return a;
    }
    if (a.isZero()) {
      return b;
    }
    if (b.isZero()) {
      return a;
    }

    var c = Integer[1], // Factor of 2s
      d,
      t;

    while (a.isEven() && b.isEven()) {
      d = Math.min(roughLOB(a), roughLOB(b)); // Find smallest power of 2
      a = a.divide(d);
      b = b.divide(d);
      c = c.multiply(d);
    }

    while (a.isEven()) {
      a = a.divide(roughLOB(a));
    }

    do {
      while (b.isEven()) {
        b = b.divide(roughLOB(b));
      }
      if (a.greater(b)) {
        t = b;
        b = a;
        a = t; // Swap a and b if a > b
      }
      b = b.subtract(a); // b = b - a
    } while (!b.isZero());

    return c.isUnit() ? a : a.multiply(c); // Multiply back the common powers of 2
  }

  // --- Least Common Multiple (LCM) ---

  /**
   * Calculates the Least Common Multiple (LCM) of two numbers.
   * LCM(a, b) = |a * b| / GCD(a, b)
   *
   * @param {BigInteger|SmallInteger|number|string} a - First number.
   * @param {BigInteger|SmallInteger|number|string} b - Second number.
   * @returns {BigInteger|SmallInteger} The LCM.
   */
  function lcm(a, b) {
    a = parseValue(a).abs();
    b = parseValue(b).abs();
    return a.divide(gcd(a, b)).multiply(b);
  }

  // --- Random Number Generation ---

  /**
   * Generates a random BigInteger between 'a' and 'b' (inclusive).
   *
   * @param {BigInteger|SmallInteger|number|string} a - Lower bound.
   * @param {BigInteger|SmallInteger|number|string} b - Upper bound.
   * @returns {BigInteger|SmallInteger} A random integer.
   */
  function randBetween(a, b) {
    a = parseValue(a);
    b = parseValue(b);

    var low = min(a, b),
      high = max(a, b);
    var range = high.subtract(low).add(1); // Calculate the range (inclusive)

    if (range.isSmall) {
      return low.add(Math.floor(Math.random() * range)); // If range is small, use Math.random directly
    }

    var length = range.value.length - 1; // Number of digits - 1 (for random generation)
    var result = [],
      restricted = true;

    // Generate random digits, ensuring the number stays within range
    for (var i = length; i >= 0; i--) {
      var top = restricted ? range.value[i] : BASE; // Upper bound for current digit
      var digit = truncate(Math.random() * top); // Generate random digit
      result.unshift(digit); // Add to the beginning

      if (digit < top) {
        restricted = false; // If a digit is less than its max, subsequent digits can be anything
      }
    }

    result = arrayToSmall(result); // Convert generated digits to BigInteger/SmallInteger
    return low.add(
      typeof result === "number" ? new SmallInteger(result) : new BigInteger(result, false)
    );
  }

  // --- Base Conversion (Parsing) ---

  /**
   * Parses a string representation of a number in a given base.
   *
   * @param {string} text - The string to parse.
   * @param {number|BigInteger|SmallInteger} base - The base (radix).
   * @returns {BigInteger|SmallInteger} The parsed integer.
   */
  var parseBase = function (text, base) {
    var length = text.length;
    var i;
    var absBase = Math.abs(base); // Absolute value of base

    // Validate digits for the given base
    for (var i = 0; i < length; i++) {
      var c = text[i].toLowerCase();
      if (c === "-") {
        continue;
      }
      if (/[a-z0-9]/.test(c)) {
        if (/[0-9]/.test(c) && +c >= absBase) {
          if (c === "1" && absBase === 1) {
            continue; // Special case for base 1
          }
          throw new Error(c + " is not a valid digit in base " + base + ".");
        } else if (c.charCodeAt(0) - 87 >= absBase) {
          // 'a' is 97, so 'a'-87 = 10
          throw new Error(c + " is not a valid digit in base " + base + ".");
        }
      }
    }

    // Optimization for common bases (2-36) and small numbers
    if (2 <= base && base <= 36) {
      if (length <= LOG_MAX_INT / Math.log(base)) {
        // If the number fits in JS native number
        var result = parseInt(text, base);
        if (isNaN(result)) {
          throw new Error(c + " is not a valid digit in base " + base + "."); // Should not happen after initial validation
        }
        return new SmallInteger(parseInt(text, base));
      }
    }

    base = parseValue(base); // Ensure base is an Integer instance
    var digits = [];
    var isNegative = text[0] === "-";

    // Extract digits
    for (i = isNegative ? 1 : 0; i < text.length; i++) {
      var c = text[i].toLowerCase(),
        charCode = c.charCodeAt(0);

      if (48 <= charCode && charCode <= 57) {
        // '0'-'9'
        digits.push(parseValue(c));
      } else if (97 <= charCode && charCode <= 122) {
        // 'a'-'z'
        digits.push(parseValue(c.charCodeAt(0) - 87));
      } else if (c === "<") {
        // Custom digit format like "<10>"
        var start = i;
        do {
          i++;
        } while (text[i] !== ">");
        digits.push(parseValue(text.slice(start + 1, i)));
      } else {
        throw new Error(c + " is not a valid character");
      }
    }

    return parseBaseFromArray(digits, base, isNegative);
  };

  /**
   * Converts an array of digits in a given base to a BigInteger.
   *
   * @param {BigInteger[]|SmallInteger[]} digits - Array of digits.
   * @param {BigInteger|SmallInteger} base - The base (radix).
   * @param {boolean} isNegative - True if the final number should be negative.
   * @returns {BigInteger|SmallInteger} The resulting integer.
   */
  function parseBaseFromArray(digits, base, isNegative) {
    var val = Integer[0], // Accumulator
      pow = Integer[1], // Power of base
      i;

    // Horner's method: sum(d_i * base^i)
    for (i = digits.length - 1; i >= 0; i--) {
      val = val.add(digits[i].times(pow));
      pow = pow.times(base);
    }
    return isNegative ? val.negate() : val;
  }

  // --- Base Conversion (Stringify) ---

  /**
   * Converts a digit to its string representation (0-9, a-z, or <digit>).
   *
   * @param {number} digit - The digit to stringify.
   * @returns {string} String representation.
   */
  function stringify(digit) {
    if (digit <= 35) {
      return "0123456789abcdefghijklmnopqrstuvwxyz".charAt(digit);
    }
    return "<" + digit + ">"; // For digits > 35
  }

  /**
   * Converts a BigInteger to an array of digits in a specified base.
   *
   * @param {BigInteger|SmallInteger} n - The number to convert.
   * @param {number|BigInteger|SmallInteger} base - The target base.
   * @returns {{value: number[], isNegative: boolean}} Object with digit array and sign.
   */
  function toBase(n, base) {
    base = bigInt(base); // Ensure base is an Integer instance

    if (base.isZero()) {
      if (n.isZero()) {
        return { value: [0], isNegative: false };
      }
      throw new Error("Cannot convert nonzero numbers to base 0.");
    }

    if (base.equals(-1)) {
      // Special handling for base -1
      if (n.isZero()) {
        return { value: [0], isNegative: false };
      }
      if (n.isNegative()) {
        // Example: -5 in base -1 is 11111_(-1)
        return {
          value: [].concat.apply(
            [],
            Array.apply(null, Array(-n)).map(Array.prototype.valueOf, [1, 0])
          ),
          isNegative: false,
        };
      }
      // Example: 5 in base -1 is 101_(-1)
      var arr = Array.apply(null, Array(+n - 1)).map(
        Array.prototype.valueOf,
        [0, 1]
      );
      arr.unshift([1]);
      return { value: [].concat.apply([], arr), isNegative: false };
    }

    var neg = false;
    if (n.isNegative() && base.isPositive()) {
      neg = true; // Result will be negative if n is negative and base is positive
      n = n.abs();
    }

    if (base.equals(1)) {
      if (n.isZero()) {
        return { value: [0], isNegative: false };
      }
      // Base 1: n becomes n ones
      return {
        value: Array.apply(null, Array(+n)).map(Number.prototype.valueOf, 1),
        isNegative: neg,
      };
    }

    var out = [];
    var left = n,
      divmod;

    // Repeatedly divide by base and collect remainders
    while (left.isNegative() || left.compareAbs(base) >= 0) {
      divmod = left.divmod(base);
      left = divmod.quotient;
      var digit = divmod.remainder;

      if (digit.isNegative()) {
        // If remainder is negative, adjust quotient and remainder
        digit = base.minus(digit).abs(); // digit = base - |digit|
        left = left.next(); // quotient + 1
      }
      out.push(digit.toJSNumber());
    }
    out.push(left.toJSNumber()); // Add the last quotient

    return { value: out.reverse(), isNegative: neg };
  }

  /**
   * Converts a BigInteger to its string representation in a given base.
   *
   * @param {BigInteger|SmallInteger} n - The number to convert.
   * @param {number|BigInteger|SmallInteger} base - The target base.
   * @returns {string} The string representation.
   */
  function toBaseString(n, base) {
    var arr = toBase(n, base);
    return (arr.isNegative ? "-" : "") + arr.value.map(stringify).join("");
  }

  // --- Exported Conversion Methods ---

  // --- BigInteger.prototype.toArray ---
  BigInteger.prototype.toArray = function (radix) {
    return toBase(this, radix);
  };

  // --- SmallInteger.prototype.toArray ---
  SmallInteger.prototype.toArray = function (radix) {
    return toBase(this, radix);
  };

  // --- BigInteger.prototype.toString ---
  BigInteger.prototype.toString = function (radix) {
    if (radix === undefined) {
      radix = 10;
    }

    if (radix !== 10) {
      return toBaseString(this, radix); // Use generic base conversion
    }

    // Optimized string conversion for base 10
    var v = this.value,
      l = v.length,
      str = String(v[--l]), // Start with the most significant digit
      zeros = "0000000", // Helper for padding
      digit;

    while (--l >= 0) {
      digit = String(v[l]);
      str += zeros.slice(digit.length) + digit; // Pad with leading zeros if necessary
    }

    var sign = this.sign ? "-" : "";
    return sign + str;
  };

  // --- SmallInteger.prototype.toString ---
  SmallInteger.prototype.toString = function (radix) {
    if (radix === undefined) {
      radix = 10;
    }
    if (radix != 10) {
      return toBaseString(this, radix);
    }
    return String(this.value);
  };

  // --- JSON Serialization ---
  BigInteger.prototype.toJSON = SmallInteger.prototype.toJSON = function () {
    return this.toString();
  };

  // --- ValueOf and toJSNumber ---
  BigInteger.prototype.valueOf = function () {
    return parseInt(this.toString(), 10); // Converts to JS number (may lose precision)
  };
  BigInteger.prototype.toJSNumber = BigInteger.prototype.valueOf;

  SmallInteger.prototype.valueOf = function () {
    return this.value;
  };
  SmallInteger.prototype.toJSNumber = SmallInteger.prototype.valueOf;

  // --- Parsing Input Values (Internal) ---

  /**
   * Parses a string value into a BigInteger.
   * Handles scientific notation and checks for valid integer format.
   *
   * @param {string} v - The string to parse.
   * @returns {BigInteger|SmallInteger} The parsed integer.
   */
  function parseStringValue(v) {
    if (isPrecise(+v)) {
      // If it looks like a precise number, try to parse directly as SmallInteger
      var x = +v;
      if (x === truncate(x)) {
        return new SmallInteger(x);
      }
      throw new Error("Invalid integer: " + v);
    }

    var sign = v[0] === "-";
    if (sign) {
      v = v.slice(1);
    }

    var split = v.split(/e/i); // Handle scientific notation
    if (split.length > 2) {
      throw new Error("Invalid integer: " + split.join("e"));
    }

    if (split.length === 2) {
      // Process scientific notation
      var exp = split[1];
      if (exp[0] === "+") {
        exp = exp.slice(1);
      }
      exp = +exp;

      if (exp !== truncate(exp) || !isPrecise(exp)) {
        throw new Error("Invalid integer: " + exp + " is not a valid exponent.");
      }

      var text = split[0];
      var decimalPlace = text.indexOf(".");
      if (decimalPlace >= 0) {
        exp -= text.length - decimalPlace - 1; // Adjust exponent for decimal places
        text = text.slice(0, decimalPlace) + text.slice(decimalPlace + 1); // Remove decimal point
      }

      if (exp < 0) {
        throw new Error("Cannot include negative exponent part for integers");
      }

      text += new Array(exp + 1).join("0"); // Add trailing zeros
      v = text;
    }

    var isValid = /^([0-9][0-9]*)$/.test(v); // Check if it's a valid integer string
    if (!isValid) {
      throw new Error("Invalid integer: " + v);
    }

    // Convert string to array of digits in BASE
    var r = [],
      max = v.length,
      l = LOG_BASE,
      min = max - l; // Digits per chunk (base 10^7)

    while (max > 0) {
      r.push(+v.slice(min, max)); // Extract a chunk
      min -= l;
      if (min < 0) {
        min = 0;
      }
      max -= l;
    }

    trim(r); // Remove leading zeros
    return new BigInteger(r, sign);
  }

  /**
   * Parses a number value into a SmallInteger or BigInteger.
   *
   * @param {number} v - The number to parse.
   * @returns {BigInteger|SmallInteger} The parsed integer.
   */
  function parseNumberValue(v) {
    if (isPrecise(v)) {
      if (v !== truncate(v)) {
        throw new Error(v + " is not an integer.");
      }
      return new SmallInteger(v);
    }
    // If not precise, convert to string and parse as string
    return parseStringValue(v.toString());
  }

  /**
   * Parses any input value into a SmallInteger or BigInteger.
   *
   * @param {number|string|BigInteger|SmallInteger} v - The value to parse.
   * @returns {BigInteger|SmallInteger} An Integer instance.
   */
  function parseValue(v) {
    if (typeof v === "number") {
      return parseNumberValue(v);
    }
    if (typeof v === "string") {
      return parseStringValue(v);
    }
    // Assume it's already an Integer instance
    return v;
  }

  // --- Pre-populate Integer cache for small numbers ---
  for (var i = 0; i < 1e3; i++) {
    Integer[i] = new SmallInteger(i);
    if (i > 0) {
      Integer[-i] = new SmallInteger(-i);
    }
  }

  // --- Exported constants and utility methods ---
  Integer.one = Integer[1];
  Integer.zero = Integer[0];
  Integer.minusOne = Integer[-1];

  Integer.max = max;
  Integer.min = min;
  Integer.gcd = gcd;
  Integer.lcm = lcm;

  // Check if an object is an instance of BigInteger or SmallInteger
  Integer.isInstance = function (x) {
    return x instanceof BigInteger || x instanceof SmallInteger;
  };

  Integer.randBetween = randBetween;

  // Constructor for creating an Integer from an array of digits in a given base
  Integer.fromArray = function (digits, base, isNegative) {
    return parseBaseFromArray(
      digits.map(parseValue),
      parseValue(base || 10),
      isNegative
    );
  };

  // Return the Integer constructor as the public interface
  return Integer;
}(); // End of bigInt IIFE

/*
 * GET function: utility to parse input from standard input.
 * It provides methods to read numbers, lines, or matrices.
 */
var GET = (function () {
  function f(s) {
    // Factory function to create a new parser instance.
    return new g(s);
  }

  function g(s) {
    // Constructor for the parser.
    this._s = s.trim().split("\n"); // Split input string by newlines, trim any leading/trailing whitespace.
    this._y = 0; // Current line index.
  }

  /*
   * Read a single element (number or string).
   *
   * @param {boolean} [f] - If true, return as string; otherwise, return as number.
   * @returns {string|number} The parsed element.
   */
  g.prototype.a = function (f) {
    var s = this._s, // Reference to the input lines array.
      y = this._y, // Current line index.
      r; // Result variable.

    if (typeof s[y] === "string") {
      // If the current line is still a string, split it into elements and reverse for easy popping.
      s[y] = s[y].split(" ").reverse();
    }

    r = s[y].pop(); // Get the last element (original first element due to reverse).

    if (!s[y].length) {
      // If the current line is exhausted, move to the next line.
      this._y++;
    }

    return f ? r : +r; // Return as string or number.
  };

  /*
   * Read a full line of elements.
   *
   * @param {boolean} [f] - If true, return elements as strings; otherwise, return as numbers.
   * @returns {string[]|number[]} Array of parsed elements.
   */
  g.prototype.l = function (f) {
    var s = this._s[this._y++].split(" "); // Split the current line by spaces and increment line index.
    return f ? s : s.map((a) => +a); // Return as array of strings or numbers.
  };

  /*
   * Read an N x M matrix.
   *
   * @param {number} n - Number of rows to read.
   * @param {boolean} [f] - If true, return elements as strings; otherwise, return as numbers.
   * @returns {string[][]|number[][]} 2D array (matrix).
   */
  g.prototype.m = function (n, f) {
    var r = this._s
      .slice(this._y, (this._y += n))
      .map((a) => a.split(" ")); // Slice N rows, split each by spaces.
    return f ? r : r.map((a) => a.map((a) => +a)); // Return as 2D array of strings or numbers.
  };

  /*
   * Read N raw lines (each line as a single element).
   *
   * @param {number} n - Number of lines to read.
   * @param {boolean} [f] - If true, return lines as strings; otherwise, return as numbers.
   * @returns {string[]|number[]} Array of raw lines.
   */
  g.prototype.r = function (n, f) {
    var r = this._s.slice(this._y, (this._y += n)); // Slice N raw lines.
    return f ? r : r.map((a) => +a); // Return as array of strings or numbers.
  };

  return f; // Return the factory function.
})();

// Initialize the input parser 'o' by reading from /dev/stdin.
var o = GET(require("fs").readFileSync("/dev/stdin", "utf8"));

/**
 * Dynamically creates a multi-dimensional array initialized with a value.
 *
 * @param {*} v - The initial value for the innermost elements.
 * @param {...number} arguments - Dimensions of the array.
 * @returns {Array} The created multi-dimensional array.
 */
function xArray(v) {
  var a = arguments,
    l = a.length,
    // Start building the `eval` string for the innermost array.
    // Example: `Array(a[2]).fill(0).map(x=>{return v;})`
    r = "Array(a[" + --l + "]).fill(0).map(x=>{return " + v + ";})";

  // Wrap with outer array initializations for each dimension.
  // Example: `Array(a[1]).fill(0).map(x=>Array(a[2]).fill(0).map(x=>{return v;}))`
  while (--l) {
    r = "Array(a[" + l + "]).fill(0).map(x=>" + r + ")";
  }

  return eval(r); // Evaluate the dynamically constructed string.
}

var mod; // Global variable to store the modulus.
var bi = bigInt(); // Initialize a bigInt instance for convenience.

/**
 * Performs modular multiplication of multiple arguments.
 * Uses a trick to split numbers into 16-bit chunks to avoid overflow before modulo,
 * then combines them.
 *
 * @param {...number} arguments - Numbers to multiply, first is initial accumulator.
 * @returns {number} The result of (arg1 * arg2 * ... * argN) % mod.
 */
function abmod() {
  for (var a = arguments, r = a[0], i = 1; i < a.length; ) {
    // r = ((r >> 16) * a[i] % mod * 65536 + (r & 65535) * a[i++]) % mod;
    // This is equivalent to `r = (r * a[i++]) % mod;` but handles large intermediate products
    // by splitting `r` into high and low 16-bit parts.
    // (r_high * 2^16 + r_low) * a_i = r_high * a_i * 2^16 + r_low * a_i
    // then apply modulo.
    r = ((r >> 16) * a[i] % mod * 65536 + (r & 65535) * a[i++]) % mod;
  }
  return r;
}

/**
 * Performs modular exponentiation (a^n % mod).
 * Uses binary exponentiation (exponentiation by squaring).
 *
 * @param {number} a - The base.
 * @param {number} n - The exponent.
 * @returns {number} The result of (a^n) % mod.
 */
function powmod(a, n) {
  for (var r = 1; n; a = abmod(a, a), n >>= 1) {
    // Initialize result 'r' to 1.
    // Loop while exponent 'n' is not zero.
    // In each iteration, square the base 'a' (modulo mod).
    // Halve the exponent 'n' by right-shifting.
    if (n & 1) {
      // If the current bit of 'n' is 1 (n is odd).
      r = abmod(a, r); // Multiply result 'r' by the current base 'a' (modulo mod).
    }
  }
  return r;
}

console.log(main()); // Execute the main function and print its return value.

/**
 * Main function containing the problem logic.
 * Reads L, A, B, and modulus from input.
 * Calculates a value based on these inputs using matrix exponentiation.
 *
 * @returns {number} The final calculated result.
 */
function main() {
  var L = o.a(1); // Read L as a number.
  var A = o.a(1); // Read A as a number.
  var B = o.a(1); // Read B as a number.

  // Convert L, A, B to bigInt instances.
  var l = bi.add(L);
  var a = bi.add(A);
  var b = bi.add(B);

  mod = o.a(); // Read the modulus.
  // Re-cast L, A, B to numbers for non-bigInt operations later.
  L = +L;
  A = +A;
  B = +B;

  // Initialize the answer matrix (1x3) for matrix multiplication.
  // The initial state is [0, 0, B % mod].
  var ans = [[0, 0, +b.mod(mod)]];

  var s = bi; // 's' represents the current count. Initialized to bigInt(0).

  // Loop for up to 18 iterations (i from 1 to 18) or until 's' reaches 'l'.
  // This loop likely processes segments of numbers based on their digit count.
  for (var i = 1; i < 19 && !s.minus(l).isZero(); i++) {
    // t = 10^i - 1. Represents the largest number with 'i' digits (e.g., 9, 99, 999).
    var t = bi.add(10).pow(i).minus(1);

    // d = (t - A + B) / B - s. Represents the number of elements in the current segment.
    var d = t.minus(a).add(b).divide(b).minus(s);

    if (d.leq(0)) {
      continue; // If d is not positive, skip this segment.
    }

    // If adding 'd' exceeds 'l', cap 'd' at the remaining amount.
    if (s.add(d).gt(l)) {
      d = l.minus(s);
    }

    // Define the transformation matrix for this segment.
    // This matrix is specific to the problem's recurrence relation.
    // powmod(10, i) is 10^i % mod.
    var r = matrixPowMod([[powmod(10, i), 0, 0], [1, 1, 0], [0, 1, 1]], d);

    // Update the second element of the answer matrix.
    // This part likely accumulates a sum or counts.
    ans[0][1] = +b.times(s).add(a).mod(mod);

    // Multiply the answer matrix by the transformation matrix.
    ans = matrixMultipleMod(ans, r);

    s = s.add(d); // Increment 's' by 'd'.
  }

  return ans[0][0]; // Return the first element of the final answer matrix.
}

/**
 * Performs matrix exponentiation (m^p % mod) using binary exponentiation.
 *
 * @param {number[][]} m - The base matrix.
 * @param {BigInteger|SmallInteger} p - The exponent (a bigInt instance).
 * @returns {number[][]} The resulting matrix.
 */
function matrixPowMod(m, p) {
  var l = m.length, // Dimension of the square matrix.
    r = xArray(0, l, l); // Result matrix, initialized as an identity matrix.

  for (var i = 0; i < l; i++) {
    r[i][i] = 1; // Set diagonal elements to 1 for identity matrix.
  }

  while (!p.isZero()) {
    // Loop while exponent 'p' is not zero.
    if (!p.and(1).isZero()) {
      // If 'p' is odd (p & 1 is not zero).
      r = matrixMultipleMod(r, m); // Multiply result 'r' by current base 'm'.
    }
    m = matrixMultipleMod(m, m); // Square the base matrix 'm'.
    p = p.divide(2); // Halve the exponent 'p'.
  }
  return r;
}

/**
 * Performs modular matrix multiplication (a * b % mod).
 *
 * @param {number[][]|number[]} a - The first matrix (or a row vector).
 * @param {number[][]|number[]} b - The second matrix (or a column vector).
 * @returns {number[][]} The resulting matrix.
 */
function matrixMultipleMod(a, b) {
  var x, y;

  // Convert row vectors to 1xN matrices for consistent processing.
  if (typeof a[0] === "object") {
    x = a;
  } else {
    x = [a];
  }

  if (typeof b[0] === "object") {
    y = b;
  } else {
    y = [b];
  }

  var h = x.length, // Height of result matrix (rows of x).
    w = y[0].length; // Width of result matrix (columns of y).

  var r = xArray(0, h, w); // Result matrix, initialized with zeros.

  // Perform standard matrix multiplication.
  for (var yi = 0; yi < h; yi++) {
    for (var xi = 0; xi < w; xi++) {
      for (var zi = 0; zi < w; zi++) {
        // r[yi][xi] += a[yi][zi] * b[zi][xi] (modulo mod)
        r[yi][xi] += abmod(a[yi][zi], b[zi][xi]);
      }
      r[yi][xi] %= mod; // Apply modulo to each element.
    }
  }
  return r;
}