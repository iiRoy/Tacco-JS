/*
 * This is a Type I clone of the original JavaScript code.
 * All identifiers, operators, and expressions are preserved exactly.
 * Only whitespace and comments have been altered significantly
 * to create a visually distinct, yet functionally identical, clone.
 */
"use strict"
;
// Immediately Invoked Function Expression (IIFE) for the bigInt library
let bigInt = function (
  undefined // Parameter to ensure 'undefined' is truly undefined locally
) {
  // Constants used throughout the BigInteger library
  var BASE = 1e7;
  var LOG_BASE = 7;
  var MAX_INT = 9007199254740992; // Max safe integer in JavaScript
  var MAX_INT_ARR = smallToArray(MAX_INT); // MAX_INT represented as an array of base-BASE digits
  var LOG_MAX_INT = Math.log(MAX_INT); // Logarithm of MAX_INT, useful for base conversion checks

  /**
   * Main Integer constructor function.
   * @param {number|string|BigInteger|SmallInteger} v - The value to parse.
   * @param {number} [radix] - The radix for string parsing.
   * @returns {BigInteger|SmallInteger} An Integer object.
   */
  function Integer(v, radix) {
    if (typeof v === "undefined") {
      return Integer[0]; // Return zero if no value is provided
    }

    if (typeof radix !== "undefined") {
      // If a radix is provided, parse the value accordingly
      return +radix === 10 ? parseValue(v) : parseBase(v, radix);
    }

    // Default parsing for numbers or strings without explicit radix
    return parseValue(v);
  }

  /**
   * BigInteger constructor for large numbers.
   * @param {number[]} value - Array of digits in base BASE.
   * @param {boolean} sign - True if negative, false if positive.
   */
  function BigInteger(value, sign) {
    this.value = value;
    this.sign = sign;
    this.isSmall = false; // Flag to indicate it's a BigInteger
  }

  BigInteger.prototype = Object.create(Integer.prototype); // Inherit from Integer

  /**
   * SmallInteger constructor for numbers that fit in JavaScript's safe integer range.
   * @param {number} value - The numeric value.
   */
  function SmallInteger(value) {
    this.value = value;
    this.sign = value < 0; // Sign is determined by the value
    this.isSmall = true; // Flag to indicate it's a SmallInteger
  }

  SmallInteger.prototype = Object.create(Integer.prototype); // Inherit from Integer

  /**
   * Checks if a number is within the safe integer range.
   * @param {number} n - The number to check.
   * @returns {boolean} True if precise, false otherwise.
   */
  function isPrecise(n) {
    return -MAX_INT < n && n < MAX_INT;
  }

  /**
   * Converts a small integer into an array of base-BASE digits.
   * @param {number} n - The small integer.
   * @returns {number[]} Array of digits.
   */
  function smallToArray(n) {
    if (n < 1e7) {
      return [n];
    }
    if (n < 1e14) {
      return [n % 1e7, Math.floor(n / 1e7)];
    }
    // For numbers up to 1e21, requiring three digits
    return [n % 1e7, Math.floor(n / 1e7) % 1e7, Math.floor(n / 1e14)];
  }

  /**
   * Converts an array of base-BASE digits back to a small integer if possible.
   * @param {number[]} arr - Array of digits.
   * @returns {number|number[]} A small integer or the original array if too large.
   */
  function arrayToSmall(arr) {
    trim(arr); // Remove leading zeros
    var length = arr.length;

    // Check if the number can be represented as a small integer
    if (length < 4 && compareAbs(arr, MAX_INT_ARR) < 0) {
      switch (length) {
        case 0:
          return 0; // Empty array means zero
        case 1:
          return arr[0];
        case 2:
          return arr[0] + arr[1] * BASE;
        default:
          // length is 3
          return arr[0] + (arr[1] + arr[2] * BASE) * BASE;
      }
    }
    return arr; // Return array if it's a BigInteger
  }

  /**
   * Removes leading zero digits from an array representation of a number.
   * @param {number[]} v - The array of digits.
   */
  function trim(v) {
    var i = v.length;
    while (v[--i] === 0 && i >= 0); // Find the first non-zero digit from the end
    v.length = i + 1; // Truncate the array
  }

  /**
   * Creates a new array filled with zeros.
   * @param {number} length - The desired length of the array.
   * @returns {number[]} An array of zeros.
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
   * Truncates a number (removes its fractional part).
   * @param {number} n - The number to truncate.
   * @returns {number} The truncated number.
   */
  function truncate(n) {
    if (n > 0) {
      return Math.floor(n);
    }
    return Math.ceil(n);
  }

  /**
   * Adds two arrays of digits (representing positive numbers).
   * @param {number[]} a - First array of digits.
   * @param {number[]} b - Second array of digits.
   * @returns {number[]} The sum as an array of digits.
   */
  function add(a, b) {
    var l_a = a.length,
      l_b = b.length,
      r = new Array(l_a), // Result array, sized for the longer operand
      carry = 0,
      base = BASE,
      sum,
      i;

    // Add digits up to the length of the shorter operand
    for (i = 0; i < l_b; i++) {
      sum = a[i] + b[i] + carry;
      carry = sum >= base ? 1 : 0;
      r[i] = sum - carry * base;
    }

    // Propagate carry through the remaining digits of the longer operand
    while (i < l_a) {
      sum = a[i] + carry;
      carry = sum === base ? 1 : 0;
      r[i++] = sum - carry * base;
    }

    // If there's a final carry, push it to the result
    if (carry > 0) {
      r.push(carry);
    }

    return r;
  }

  /**
   * Adds two arrays of digits, handling different lengths by ensuring the longer one is first.
   * @param {number[]} a - First array of digits.
   * @param {number[]} b - Second array of digits.
   * @returns {number[]} The sum as an array of digits.
   */
  function addAny(a, b) {
    if (a.length >= b.length) {
      return add(a, b);
    }
    return add(b, a); // Ensure 'a' is always the longer array for 'add'
  }

  /**
   * Adds a small integer (carry) to an array of digits.
   * Used for adding a small number to a BigInteger.
   * @param {number[]} a - Array of digits.
   * @param {number} carry - The small integer to add.
   * @returns {number[]} The sum as an array of digits.
   */
  function addSmall(a, carry) {
    var l = a.length,
      r = new Array(l),
      base = BASE,
      sum,
      i;

    // Add carry to each digit, propagating new carry
    for (i = 0; i < l; i++) {
      sum = a[i] - base + carry; // Add carry, then subtract base to get new carry
      carry = Math.floor(sum / base);
      r[i] = sum - carry * base;
      carry += 1; // Adjust carry for next iteration
    }

    // If there's a remaining carry, add new digits
    while (carry > 0) {
      r[i++] = carry % base;
      carry = Math.floor(carry / base);
    }

    return r;
  }

  /**
   * BigInteger prototype method for addition.
   * @param {BigInteger|SmallInteger|number|string} v - The value to add.
   * @returns {BigInteger|SmallInteger} The sum.
   */
  BigInteger.prototype.add = function (v) {
    var n = parseValue(v); // Parse the input value
    if (this.sign !== n.sign) {
      // If signs are different, it's a subtraction
      return this.subtract(n.negate());
    }

    var a = this.value,
      b = n.value;

    if (n.isSmall) {
      // If adding a SmallInteger, use optimized addSmall
      return new BigInteger(addSmall(a, Math.abs(b)), this.sign);
    }

    // Both are BigIntegers, use addAny
    return new BigInteger(addAny(a, b), this.sign);
  };

  // Alias 'plus' to 'add' for convenience
  BigInteger.prototype.plus = BigInteger.prototype.add;

  /**
   * SmallInteger prototype method for addition.
   * @param {BigInteger|SmallInteger|number|string} v - The value to add.
   * @returns {BigInteger|SmallInteger} The sum.
   */
  SmallInteger.prototype.add = function (v) {
    var n = parseValue(v);
    var a = this.value;

    if (a < 0 !== n.sign) {
      // If signs are effectively different (a<0 and n.sign is true, or a>=0 and n.sign is false)
      return this.subtract(n.negate());
    }

    var b = n.value;

    if (n.isSmall) {
      // Both are SmallIntegers
      if (isPrecise(a + b)) {
        return new SmallInteger(a + b); // If result fits, return SmallInteger
      }
      // If result overflows, convert 'b' to array and use BigInteger addition logic
      b = smallToArray(Math.abs(b));
    }

    // One is SmallInteger, the other is BigInteger (or small overflowed)
    return new BigInteger(addSmall(b, Math.abs(a)), a < 0);
  };

  // Alias 'plus' to 'add' for SmallInteger
  SmallInteger.prototype.plus = SmallInteger.prototype.add;

  /**
   * Subtracts two arrays of digits (representing positive numbers), where a >= b.
   * @param {number[]} a - Minuend array.
   * @param {number[]} b - Subtrahend array.
   * @returns {number[]} The difference as an array of digits.
   */
  function subtract(a, b) {
    var a_l = a.length,
      b_l = b.length,
      r = new Array(a_l), // Result array, sized for minuend
      borrow = 0,
      base = BASE,
      i,
      difference;

    // Subtract digits up to the length of the subtrahend
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

    // Propagate borrow through the remaining digits of the minuend
    for (i = b_l; i < a_l; i++) {
      difference = a[i] - borrow;
      if (difference < 0) {
        difference += base;
      } else {
        r[i++] = difference; // If no more borrow, copy remaining digits and break
        break;
      }
      r[i] = difference;
    }

    // Copy any remaining digits from 'a' if no borrow further
    for (; i < a_l; i++) {
      r[i] = a[i];
    }

    trim(r); // Remove leading zeros
    return r;
  }

  /**
   * Subtracts two arrays of digits, handling sign and order.
   * @param {number[]} a - First array.
   * @param {number[]} b - Second array.
   * @param {boolean} sign - The initial sign before comparison.
   * @returns {BigInteger|SmallInteger} The difference.
   */
  function subtractAny(a, b, sign) {
    var value;

    // Compare absolute values to determine which is larger
    if (compareAbs(a, b) >= 0) {
      value = subtract(a, b);
    } else {
      value = subtract(b, a); // Swap and invert sign if b > a
      sign = !sign;
    }

    value = arrayToSmall(value); // Try to convert to SmallInteger

    if (typeof value === "number") {
      if (sign) {
        value = -value;
      }
      return new SmallInteger(value);
    }
    return new BigInteger(value, sign);
  }

  /**
   * Subtracts a small integer from an array of digits.
   * @param {number[]} a - Array of digits.
   * @param {number} b - Small integer to subtract.
   * @param {boolean} sign - The sign of the original BigInteger.
   * @returns {BigInteger|SmallInteger} The difference.
   */
  function subtractSmall(a, b, sign) {
    var l = a.length,
      r = new Array(l),
      carry = -b, // Initialize carry with negative subtrahend
      base = BASE,
      i,
      difference;

    // Perform subtraction with carry
    for (i = 0; i < l; i++) {
      difference = a[i] + carry;
      carry = Math.floor(difference / base);
      difference %= base;
      r[i] = difference < 0 ? difference + base : difference; // Ensure positive digit
    }

    r = arrayToSmall(r); // Try to convert to SmallInteger

    if (typeof r === "number") {
      if (sign) {
        r = -r;
      }
      return new SmallInteger(r);
    }
    return new BigInteger(r, sign);
  }

  /**
   * BigInteger prototype method for subtraction.
   * @param {BigInteger|SmallInteger|number|string} v - The value to subtract.
   * @returns {BigInteger|SmallInteger} The difference.
   */
  BigInteger.prototype.subtract = function (v) {
    var n = parseValue(v);

    if (this.sign !== n.sign) {
      // If signs are different, it's an addition
      return this.add(n.negate());
    }

    var a = this.value,
      b = n.value;

    if (n.isSmall) {
      // If subtracting a SmallInteger
      return subtractSmall(a, Math.abs(b), this.sign);
    }

    // Both are BigIntegers
    return subtractAny(a, b, this.sign);
  };

  // Alias 'minus' to 'subtract' for BigInteger
  BigInteger.prototype.minus = BigInteger.prototype.subtract;

  /**
   * SmallInteger prototype method for subtraction.
   * @param {BigInteger|SmallInteger|number|string} v - The value to subtract.
   * @returns {BigInteger|SmallInteger} The difference.
   */
  SmallInteger.prototype.subtract = function (v) {
    var n = parseValue(v);
    var a = this.value;

    if (a < 0 !== n.sign) {
      // If signs are effectively different
      return this.add(n.negate());
    }

    var b = n.value;

    if (n.isSmall) {
      // Both are SmallIntegers
      return new SmallInteger(a - b);
    }

    // Subtracting a BigInteger from a SmallInteger
    // Convert the SmallInteger to an array and use BigInteger subtraction logic
    return subtractSmall(b, Math.abs(a), a >= 0);
  };

  // Alias 'minus' to 'subtract' for SmallInteger
  SmallInteger.prototype.minus = SmallInteger.prototype.subtract;

  /**
   * BigInteger prototype method to negate the number.
   * @returns {BigInteger} A new BigInteger with the opposite sign.
   */
  BigInteger.prototype.negate = function () {
    return new BigInteger(this.value, !this.sign);
  };

  /**
   * SmallInteger prototype method to negate the number.
   * @returns {SmallInteger} A new SmallInteger with the opposite sign.
   */
  SmallInteger.prototype.negate = function () {
    var sign = this.sign;
    var small = new SmallInteger(-this.value);
    small.sign = !sign; // Explicitly set sign
    return small;
  };

  /**
   * BigInteger prototype method to get the absolute value.
   * @returns {BigInteger} A new BigInteger with a positive sign.
   */
  BigInteger.prototype.abs = function () {
    return new BigInteger(this.value, false);
  };

  /**
   * SmallInteger prototype method to get the absolute value.
   * @returns {SmallInteger} A new SmallInteger with the absolute value.
   */
  SmallInteger.prototype.abs = function () {
    return new SmallInteger(Math.abs(this.value));
  };

  /**
   * Multiplies two arrays of digits (long multiplication).
   * @param {number[]} a - First array of digits.
   * @param {number[]} b - Second array of digits.
   * @returns {number[]} The product as an array of digits.
   */
  function multiplyLong(a, b) {
    var a_l = a.length,
      b_l = b.length,
      l = a_l + b_l, // Max length of result
      r = createArray(l), // Result array
      base = BASE,
      product,
      carry,
      i,
      a_i,
      b_j;

    // Standard long multiplication algorithm
    for (i = 0; i < a_l; ++i) {
      a_i = a[i];
      carry = 0; // Reset carry for each digit of 'a'

      for (var j = 0; j < b_l; ++j) {
        b_j = b[j];
        product = a_i * b_j + r[i + j] + carry;
        carry = Math.floor(product / base);
        r[i + j] = product - carry * base;
      }
      r[i + b_l] += carry; // Add any remaining carry
    }

    trim(r); // Remove leading zeros
    return r;
  }

  /**
   * Multiplies an array of digits by a small integer.
   * @param {number[]} a - Array of digits.
   * @param {number} b - Small integer multiplier.
   * @returns {number[]} The product as an array of digits.
   */
  function multiplySmall(a, b) {
    var l = a.length,
      r = new Array(l),
      base = BASE,
      carry = 0,
      product,
      i;

    // Multiply each digit by 'b' and propagate carry
    for (i = 0; i < l; i++) {
      product = a[i] * b + carry;
      carry = Math.floor(product / base);
      r[i] = product - carry * base;
    }

    // Add any remaining carry as new digits
    while (carry > 0) {
      r[i++] = carry % base;
      carry = Math.floor(carry / base);
    }

    return r;
  }

  /**
   * Shifts an array of digits left by 'n' positions (multiplies by BASE^n).
   * @param {number[]} x - The array of digits.
   * @param {number} n - The number of positions to shift.
   * @returns {number[]} The shifted array.
   */
  function shiftLeft(x, n) {
    var r = [];
    while (n-- > 0) {
      r.push(0); // Prepend zeros
    }
    return r.concat(x); // Concatenate with original digits
  }

  /**
   * Performs Karatsuba multiplication on two arrays of digits.
   * @param {number[]} x - First array of digits.
   * @param {number[]} y - Second array of digits.
   * @returns {number[]} The product as an array of digits.
   */
  function multiplyKaratsuba(x, y) {
    var n = Math.max(x.length, y.length);

    // Base case for small numbers, switch to long multiplication
    if (n <= 30) {
      return multiplyLong(x, y);
    }

    n = Math.ceil(n / 2); // Split point

    // Divide numbers into two halves
    var b = x.slice(n),
      a = x.slice(0, n),
      d = y.slice(n),
      c = y.slice(0, n);

    // Recursively compute sub-products
    var ac = multiplyKaratsuba(a, c),
      bd = multiplyKaratsuba(b, d),
      abcd = multiplyKaratsuba(addAny(a, b), addAny(c, d));

    // Combine sub-products using Karatsuba's formula
    var product = addAny(
      addAny(ac, shiftLeft(subtract(subtract(abcd, ac), bd), n)),
      shiftLeft(bd, 2 * n)
    );

    trim(product); // Remove leading zeros
    return product;
  }

  /**
   * Heuristic to decide whether to use Karatsuba multiplication or long multiplication.
   * @param {number} l1 - Length of the first operand.
   * @param {number} l2 - Length of the second operand.
   * @returns {boolean} True if Karatsuba is likely faster.
   */
  function useKaratsuba(l1, l2) {
    // This formula is a heuristic and may vary based on BASE
    return -0.012 * l1 - 0.012 * l2 + 15e-6 * l1 * l2 > 0;
  }

  /**
   * BigInteger prototype method for multiplication.
   * @param {BigInteger|SmallInteger|number|string} v - The value to multiply.
   * @returns {BigInteger|SmallInteger} The product.
   */
  BigInteger.prototype.multiply = function (v) {
    var n = parseValue(v),
      a = this.value,
      b = n.value,
      sign = this.sign !== n.sign,
      abs;

    if (n.isSmall) {
      // Multiplying by a SmallInteger
      if (b === 0) {
        return Integer[0];
      }
      if (b === 1) {
        return this;
      }
      if (b === -1) {
        return this.negate();
      }

      abs = Math.abs(b);
      if (abs < BASE) {
        // If small integer fits within a single digit
        return new BigInteger(multiplySmall(a, abs), sign);
      }
      // Convert small integer to array for long multiplication
      b = smallToArray(abs);
    }

    // Both are BigIntegers or small integer converted to array
    // Choose between Karatsuba and long multiplication
    if (useKaratsuba(a.length, b.length)) {
      return new BigInteger(multiplyKaratsuba(a, b), sign);
    }
    return new BigInteger(multiplyLong(a, b), sign);
  };

  // Alias 'times' to 'multiply' for BigInteger
  BigInteger.prototype.times = BigInteger.prototype.multiply;

  /**
   * Multiplies a small integer by an array of digits, handling sign.
   * @param {number} a - Small integer.
   * @param {number[]} b - Array of digits.
   * @param {boolean} sign - The sign of the result.
   * @returns {BigInteger} The product.
   */
  function multiplySmallAndArray(a, b, sign) {
    if (a < BASE) {
      return new BigInteger(multiplySmall(b, a), sign);
    }
    return new BigInteger(multiplyLong(b, smallToArray(a)), sign);
  }

  // Internal multiplication method for SmallInteger
  SmallInteger.prototype._multiplyBySmall = function (a) {
    // Check if the product of two small integers fits in a small integer
    if (isPrecise(a.value * this.value)) {
      return new SmallInteger(a.value * this.value);
    }
    // Otherwise, convert to BigInteger multiplication
    return multiplySmallAndArray(
      Math.abs(a.value),
      smallToArray(Math.abs(this.value)),
      this.sign !== a.sign
    );
  };

  // Internal multiplication method for BigInteger
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
    return multiplySmallAndArray(Math.abs(a.value), this.value, this.sign !== a.sign);
  };

  /**
   * SmallInteger prototype method for multiplication.
   * Delegates to the internal _multiplyBySmall method.
   * @param {BigInteger|SmallInteger|number|string} v - The value to multiply.
   * @returns {BigInteger|SmallInteger} The product.
   */
  SmallInteger.prototype.multiply = function (v) {
    return parseValue(v)._multiplyBySmall(this);
  };

  // Alias 'times' to 'multiply' for SmallInteger
  SmallInteger.prototype.times = SmallInteger.prototype.multiply;

  /**
   * Squares an array of digits (optimized for squaring).
   * @param {number[]} a - The array of digits.
   * @returns {number[]} The square as an array of digits.
   */
  function square(a) {
    var l = a.length,
      r = createArray(l + l), // Max length of result
      base = BASE,
      product,
      carry,
      i,
      a_i,
      a_j;

    // Optimized squaring algorithm
    for (i = 0; i < l; i++) {
      a_i = a[i];
      carry = 0 - a_i * a_i; // Initialize carry, will be negative

      for (var j = i; j < l; j++) {
        a_j = a[j];
        product = 2 * (a_i * a_j) + r[i + j] + carry; // Sum of cross-products
        carry = Math.floor(product / base);
        r[i + j] = product - carry * base;
      }
      r[i + l] = carry; // Add final carry for this row
    }

    trim(r); // Remove leading zeros
    return r;
  }

  /**
   * BigInteger prototype method for squaring.
   * @returns {BigInteger} The square.
   */
  BigInteger.prototype.square = function () {
    return new BigInteger(square(this.value), false); // Square is always positive
  };

  /**
   * SmallInteger prototype method for squaring.
   * @returns {BigInteger|SmallInteger} The square.
   */
  SmallInteger.prototype.square = function () {
    var value = this.value * this.value;
    if (isPrecise(value)) {
      return new SmallInteger(value); // If result fits, return SmallInteger
    }
    // Otherwise, convert to BigInteger square
    return new BigInteger(square(smallToArray(Math.abs(this.value))), false);
  };

  /**
   * Divides two arrays of digits using the Knuth division algorithm (Algorithm D).
   * This is a complex algorithm for precise arbitrary-precision division.
   * @param {number[]} a - Dividend array.
   * @param {number[]} b - Divisor array.
   * @returns {[number[], number[]]} An array containing the quotient and remainder arrays.
   */
  function divMod1(a, b) {
    var a_l = a.length,
      b_l = b.length,
      base = BASE,
      result = createArray(b.length), // Quotient array
      divisorMostSignificantDigit = b[b_l - 1],
      lambda = Math.ceil(base / (2 * divisorMostSignificantDigit)), // Normalization factor
      remainder = multiplySmall(a, lambda), // Normalized dividend
      divisor = multiplySmall(b, lambda), // Normalized divisor
      quotientDigit,
      shift,
      carry,
      borrow,
      i,
      l,
      q;

    // Ensure remainder has enough space
    if (remainder.length <= a_l) {
      remainder.push(0);
    }
    divisor.push(0); // Pad divisor for easier calculation

    divisorMostSignificantDigit = divisor[b_l - 1]; // Update after normalization

    // Main loop: estimate quotient digits
    for (shift = a_l - b_l; shift >= 0; shift--) {
      // Estimate quotient digit
      quotientDigit = base - 1;
      if (remainder[shift + b_l] !== divisorMostSignificantDigit) {
        quotientDigit = Math.floor(
          (remainder[shift + b_l] * base + remainder[shift + b_l - 1]) /
            divisorMostSignificantDigit
        );
      }

      carry = 0;
      borrow = 0;
      l = divisor.length;

      // Multiply divisor by quotientDigit and subtract from remainder
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

      // Adjust quotientDigit if estimate was too high
      while (borrow !== 0) {
        quotientDigit -= 1;
        carry = 0;
        for (i = 0; i < l; i++) {
          carry += remainder[shift + i] - base + divisor[i]; // Add back divisor
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
      result[shift] = quotientDigit; // Store the quotient digit
    }

    // Denormalize the remainder
    remainder = divModSmall(remainder, lambda)[0];
    return [arrayToSmall(result), arrayToSmall(remainder)];
  }

  /**
   * Divides two arrays of digits using a simpler, iterative approach.
   * This method might be slower for very large numbers than divMod1 but is easier to understand.
   * @param {number[]} a - Dividend array.
   * @param {number[]} b - Divisor array.
   * @returns {[number[], number[]]} An array containing the quotient and remainder arrays.
   */
  function divMod2(a, b) {
    var a_l = a.length,
      b_l = b.length,
      result = [],
      part = [], // Current part of dividend being processed
      base = BASE,
      guess,
      xlen,
      highx,
      highy,
      check;

    // Process dividend digits from most significant to least significant
    while (a_l) {
      part.unshift(a[--a_l]); // Add digit to the front of 'part'
      trim(part); // Remove leading zeros from 'part'

      if (compareAbs(part, b) < 0) {
        result.push(0); // If part is smaller than divisor, quotient digit is 0
        continue;
      }

      xlen = part.length;
      highx = part[xlen - 1] * base + part[xlen - 2]; // Top two digits of part
      highy = b[b_l - 1] * base + b[b_l - 2]; // Top two digits of divisor

      if (xlen > b_l) {
        highx = (highx + 1) * base; // Adjust highx if part is longer than divisor
      }

      guess = Math.ceil(highx / highy); // Initial guess for quotient digit

      // Refine guess
      do {
        check = multiplySmall(b, guess); // Multiply divisor by guess
        if (compareAbs(check, part) <= 0) {
          break; // If check <= part, guess is good
        }
        guess--; // Otherwise, reduce guess
      } while (guess);

      result.push(guess); // Store the quotient digit
      part = subtract(part, check); // Subtract (divisor * guess) from part
    }

    result.reverse(); // Result was built in reverse order
    return [arrayToSmall(result), arrayToSmall(part)];
  }

  /**
   * Divides an array of digits by a small integer.
   * @param {number[]} value - Dividend array.
   * @param {number} lambda - Small integer divisor.
   * @returns {[number[], number]} An array containing the quotient array and the remainder.
   */
  function divModSmall(value, lambda) {
    var length = value.length,
      quotient = createArray(length),
      base = BASE,
      i,
      q,
      remainder,
      divisor;

    remainder = 0; // Initialize remainder

    // Perform long division by a small integer
    for (i = length - 1; i >= 0; --i) {
      divisor = remainder * base + value[i];
      q = truncate(divisor / lambda);
      remainder = divisor - q * lambda;
      quotient[i] = q | 0; // Store quotient digit
    }
    return [quotient, remainder | 0]; // Return quotient array and final remainder
  }

  /**
   * Generic division and modulo function for BigIntegers and SmallIntegers.
   * @param {BigInteger|SmallInteger} self - The dividend.
   * @param {BigInteger|SmallInteger|number|string} v - The divisor.
   * @returns {[BigInteger|SmallInteger, BigInteger|SmallInteger]} Array containing quotient and remainder.
   */
  function divModAny(self, v) {
    var value,
      n = parseValue(v); // Parse divisor

    var a = self.value,
      b = n.value;

    var quotient;

    if (b === 0) {
      throw new Error("Cannot divide by zero");
    }

    // Handle small integer dividends
    if (self.isSmall) {
      if (n.isSmall) {
        // Both small integers
        return [new SmallInteger(truncate(a / b)), new SmallInteger(a % b)];
      }
      return [Integer[0], self]; // Small dividend, large divisor results in 0 quotient, dividend as remainder
    }

    // Handle small integer divisors
    if (n.isSmall) {
      if (b === 1) {
        return [self, Integer[0]]; // Dividing by 1
      }
      if (b == -1) {
        return [self.negate(), Integer[0]]; // Dividing by -1
      }

      var abs = Math.abs(b);
      if (abs < BASE) {
        // Divisor fits in a single digit
        value = divModSmall(a, abs);
        quotient = arrayToSmall(value[0]);
        var remainder = value[1];

        if (self.sign) {
          remainder = -remainder; // Adjust remainder sign
        }

        if (typeof quotient === "number") {
          if (self.sign !== n.sign) {
            quotient = -quotient; // Adjust quotient sign
          }
          return [new SmallInteger(quotient), new SmallInteger(remainder)];
        }
        return [
          new BigInteger(quotient, self.sign !== n.sign),
          new SmallInteger(remainder),
        ];
      }
      b = smallToArray(abs); // Convert small divisor to array for general division
    }

    // Both are BigIntegers or small divisor converted to array
    var comparison = compareAbs(a, b);
    if (comparison === -1) {
      return [Integer[0], self]; // Dividend < divisor, quotient is 0, remainder is dividend
    }
    if (comparison === 0) {
      // Dividend == divisor
      return [Integer[self.sign === n.sign ? 1 : -1], Integer[0]]; // Quotient 1 or -1, remainder 0
    }

    // Choose division algorithm based on length
    if (a.length + b.length <= 200) {
      value = divMod1(a, b); // Knuth's algorithm
    } else {
      value = divMod2(a, b); // Iterative algorithm
    }

    quotient = value[0];
    var qSign = self.sign !== n.sign, // Quotient sign
      mod = value[1],
      mSign = self.sign; // Remainder sign (same as dividend)

    // Convert quotient to SmallInteger or BigInteger
    if (typeof quotient === "number") {
      if (qSign) {
        quotient = -quotient;
      }
      quotient = new SmallInteger(quotient);
    } else {
      quotient = new BigInteger(quotient, qSign);
    }

    // Convert remainder to SmallInteger or BigInteger
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

  /**
   * BigInteger prototype method to get both quotient and remainder.
   * @param {BigInteger|SmallInteger|number|string} v - The divisor.
   * @returns {{quotient: BigInteger|SmallInteger, remainder: BigInteger|SmallInteger}}
   */
  BigInteger.prototype.divmod = function (v) {
    var result = divModAny(this, v);
    return { quotient: result[0], remainder: result[1] };
  };

  // SmallInteger also uses the same divmod logic
  SmallInteger.prototype.divmod = BigInteger.prototype.divmod;

  /**
   * BigInteger prototype method for division (returns only the quotient).
   * @param {BigInteger|SmallInteger|number|string} v - The divisor.
   * @returns {BigInteger|SmallInteger} The quotient.
   */
  BigInteger.prototype.divide = function (v) {
    return divModAny(this, v)[0];
  };

  // Aliases for division
  SmallInteger.prototype.over = SmallInteger.prototype.divide;
  BigInteger.prototype.over = BigInteger.prototype.divide;

  /**
   * BigInteger prototype method for modulo (returns only the remainder).
   * @param {BigInteger|SmallInteger|number|string} v - The divisor.
   * @returns {BigInteger|SmallInteger} The remainder.
   */
  BigInteger.prototype.mod = function (v) {
    return divModAny(this, v)[1];
  };

  // Aliases for modulo
  SmallInteger.prototype.remainder = SmallInteger.prototype.mod;
  SmallInteger.prototype.mod = BigInteger.prototype.remainder;
  BigInteger.prototype.mod = BigInteger.prototype.mod;

  /**
   * BigInteger prototype method for exponentiation (a^b).
   * @param {BigInteger|SmallInteger|number|string} v - The exponent.
   * @returns {BigInteger|SmallInteger} The result of the exponentiation.
   * @throws {Error} If exponent is negative or too large.
   */
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
      return n.isEven() ? Integer[1] : Integer[-1]; // -1 to even power is 1, to odd power is -1
    }

    if (n.sign) {
      return Integer[0]; // Negative exponent implies fractional result, not supported for integers
    }

    if (!n.isSmall) {
      throw new Error("The exponent " + n.toString() + " is too large.");
    }

    // If base is small, try to compute directly if result fits
    if (this.isSmall) {
      if (isPrecise((value = Math.pow(a, b)))) {
        return new SmallInteger(truncate(value));
      }
    }

    // Use binary exponentiation (exponentiation by squaring)
    x = this; // Base
    y = Integer[1]; // Result accumulator

    while (true) {
      if ((b & 1) === 1) {
        y = y.times(x); // If exponent is odd, multiply result by base
        --b; // Decrement exponent
      }
      if (b === 0) {
        break; // Exponent is zero, done
      }
      b /= 2; // Halve exponent
      x = x.square(); // Square the base
    }
    return y;
  };

  // SmallInteger also uses the same pow logic
  SmallInteger.prototype.pow = BigInteger.prototype.pow;

  /**
   * BigInteger prototype method for modular exponentiation (base^exp mod mod).
   * @param {BigInteger|SmallInteger|number|string} exp - The exponent.
   * @param {BigInteger|SmallInteger|number|string} mod - The modulus.
   * @returns {BigInteger|SmallInteger} The result.
   * @throws {Error} If modulus is zero.
   */
  BigInteger.prototype.modPow = function (exp, mod) {
    exp = parseValue(exp);
    mod = parseValue(mod);

    if (mod.isZero()) {
      throw new Error("Cannot take modPow with modulus 0");
    }

    var r = Integer[1], // Result accumulator
      base = this.mod(mod); // Base modulo modulus

    while (exp.isPositive()) {
      if (base.isZero()) {
        return Integer[0]; // If base mod mod is 0, result is 0
      }
      if (exp.isOdd()) {
        r = r.multiply(base).mod(mod); // If exponent is odd, multiply result
      }
      exp = exp.divide(2); // Halve exponent
      base = base.square().mod(mod); // Square base modulo modulus
    }
    return r;
  };

  // SmallInteger also uses the same modPow logic
  SmallInteger.prototype.modPow = BigInteger.prototype.modPow;

  /**
   * Compares the absolute values of two arrays of digits.
   * @param {number[]} a - First array.
   * @param {number[]} b - Second array.
   * @returns {number} 1 if a > b, -1 if a < b, 0 if a == b.
   */
  function compareAbs(a, b) {
    if (a.length !== b.length) {
      return a.length > b.length ? 1 : -1; // Longer array is larger
    }

    // Compare digit by digit from most significant to least significant
    for (var i = a.length - 1; i >= 0; i--) {
      if (a[i] !== b[i]) {
        return a[i] > b[i] ? 1 : -1;
      }
    }
    return 0; // Arrays are equal
  }

  /**
   * BigInteger prototype method to compare absolute values.
   * @param {BigInteger|SmallInteger|number|string} v - The value to compare with.
   * @returns {number} 1 if this > v, -1 if this < v, 0 if this == v (absolute).
   */
  BigInteger.prototype.compareAbs = function (v) {
    var n = parseValue(v),
      a = this.value,
      b = n.value;

    if (n.isSmall) {
      return 1; // A BigInteger is always considered absolutely larger than a SmallInteger
    }
    return compareAbs(a, b);
  };

  /**
   * SmallInteger prototype method to compare absolute values.
   * @param {BigInteger|SmallInteger|number|string} v - The value to compare with.
   * @returns {number} 1 if this > v, -1 if this < v, 0 if this == v (absolute).
   */
  SmallInteger.prototype.compareAbs = function (v) {
    var n = parseValue(v),
      a = Math.abs(this.value),
      b = n.value;

    if (n.isSmall) {
      b = Math.abs(b);
      return a === b ? 0 : a > b ? 1 : -1;
    }
    return -1; // A SmallInteger is always considered absolutely smaller than a BigInteger
  };

  /**
   * BigInteger prototype method for full comparison (with sign).
   * @param {BigInteger|SmallInteger|number|string} v - The value to compare with.
   * @returns {number} 1 if this > v, -1 if this < v, 0 if this == v.
   */
  BigInteger.prototype.compare = function (v) {
    // Handle Infinity cases
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
      return n.sign ? 1 : -1; // If this is positive and n is negative, this > n, etc.
    }

    if (n.isSmall) {
      // Comparing BigInteger with SmallInteger (same sign)
      // Positive BigInt > Positive SmallInt
      // Negative BigInt < Negative SmallInt
      return this.sign ? -1 : 1;
    }

    // Both BigIntegers, same sign, compare absolute values
    return compareAbs(a, b) * (this.sign ? -1 : 1); // Invert result if negative
  };

  // Alias 'compareTo' to 'compare' for BigInteger
  BigInteger.prototype.compareTo = BigInteger.prototype.compare;

  /**
   * SmallInteger prototype method for full comparison (with sign).
   * @param {BigInteger|SmallInteger|number|string} v - The value to compare with.
   * @returns {number} 1 if this > v, -1 if this < v, 0 if this == v.
   */
  SmallInteger.prototype.compare = function (v) {
    // Handle Infinity cases
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
      // Both SmallIntegers
      return a == b ? 0 : a > b ? 1 : -1;
    }

    // SmallInteger vs BigInteger
    if (a < 0 !== n.sign) {
      // If signs are different
      return a < 0 ? -1 : 1; // Negative small < positive big, positive small > negative big
    }

    return a < 0 ? 1 : -1; // If signs are same, negative small > negative big (closer to zero)
  };

  // Alias 'compareTo' to 'compare' for SmallInteger
  SmallInteger.prototype.compareTo = SmallInteger.prototype.compare;

  /**
   * BigInteger prototype method for equality check.
   * @param {BigInteger|SmallInteger|number|string} v - The value to compare with.
   * @returns {boolean} True if equal, false otherwise.
   */
  BigInteger.prototype.equals = function (v) {
    return this.compare(v) === 0;
  };

  // Aliases for equality
  SmallInteger.prototype.eq = SmallInteger.prototype.equals;
  SmallInteger.prototype.equals = BigInteger.prototype.eq;
  BigInteger.prototype.eq = BigInteger.prototype.equals;

  /**
   * BigInteger prototype method for inequality check.
   * @param {BigInteger|SmallInteger|number|string} v - The value to compare with.
   * @returns {boolean} True if not equal, false otherwise.
   */
  BigInteger.prototype.notEquals = function (v) {
    return this.compare(v) !== 0;
  };

  // Aliases for inequality
  SmallInteger.prototype.neq = SmallInteger.prototype.notEquals;
  SmallInteger.prototype.notEquals = BigInteger.prototype.neq;
  BigInteger.prototype.neq = BigInteger.prototype.notEquals;

  /**
   * BigInteger prototype method for greater than check.
   * @param {BigInteger|SmallInteger|number|string} v - The value to compare with.
   * @returns {boolean} True if greater, false otherwise.
   */
  BigInteger.prototype.greater = function (v) {
    return this.compare(v) > 0;
  };

  // Aliases for greater than
  SmallInteger.prototype.gt = SmallInteger.prototype.greater;
  SmallInteger.prototype.greater = BigInteger.prototype.gt;
  BigInteger.prototype.gt = BigInteger.prototype.greater;

  /**
   * BigInteger prototype method for lesser than check.
   * @param {BigInteger|SmallInteger|number|string} v - The value to compare with.
   * @returns {boolean} True if lesser, false otherwise.
   */
  BigInteger.prototype.lesser = function (v) {
    return this.compare(v) < 0;
  };

  // Aliases for lesser than
  SmallInteger.prototype.lt = SmallInteger.prototype.lesser;
  SmallInteger.prototype.lesser = BigInteger.prototype.lt;
  BigInteger.prototype.lt = BigInteger.prototype.lesser;

  /**
   * BigInteger prototype method for greater than or equals check.
   * @param {BigInteger|SmallInteger|number|string} v - The value to compare with.
   * @returns {boolean} True if greater or equal, false otherwise.
   */
  BigInteger.prototype.greaterOrEquals = function (v) {
    return this.compare(v) >= 0;
  };

  // Aliases for greater than or equals
  SmallInteger.prototype.geq = SmallInteger.prototype.greaterOrEquals;
  SmallInteger.prototype.greaterOrEquals = BigInteger.prototype.geq;
  BigInteger.prototype.geq = BigInteger.prototype.greaterOrEquals;

  /**
   * BigInteger prototype method for lesser than or equals check.
   * @param {BigInteger|SmallInteger|number|string} v - The value to compare with.
   * @returns {boolean} True if lesser or equal, false otherwise.
   */
  BigInteger.prototype.lesserOrEquals = function (v) {
    return this.compare(v) <= 0;
  };

  // Aliases for lesser than or equals
  SmallInteger.prototype.leq = SmallInteger.prototype.lesserOrEquals;
  SmallInteger.prototype.lesserOrEquals = BigInteger.prototype.leq;
  BigInteger.prototype.leq = BigInteger.prototype.lesserOrEquals;

  /**
   * BigInteger prototype method to check if the number is even.
   * Checks the least significant digit.
   * @returns {boolean} True if even, false otherwise.
   */
  BigInteger.prototype.isEven = function () {
    return (this.value[0] & 1) === 0;
  };

  /**
   * SmallInteger prototype method to check if the number is even.
   * @returns {boolean} True if even, false otherwise.
   */
  SmallInteger.prototype.isEven = function () {
    return (this.value & 1) === 0;
  };

  /**
   * BigInteger prototype method to check if the number is odd.
   * Checks the least significant digit.
   * @returns {boolean} True if odd, false otherwise.
   */
  BigInteger.prototype.isOdd = function () {
    return (this.value[0] & 1) === 1;
  };

  /**
   * SmallInteger prototype method to check if the number is odd.
   * @returns {boolean} True if odd, false otherwise.
   */
  SmallInteger.prototype.isOdd = function () {
    return (this.value & 1) === 1;
  };

  /**
   * BigInteger prototype method to check if the number is positive.
   * @returns {boolean} True if positive, false otherwise.
   */
  BigInteger.prototype.isPositive = function () {
    return !this.sign;
  };

  /**
   * SmallInteger prototype method to check if the number is positive.
   * @returns {boolean} True if positive, false otherwise.
   */
  SmallInteger.prototype.isPositive = function () {
    return this.value > 0;
  };

  /**
   * BigInteger prototype method to check if the number is negative.
   * @returns {boolean} True if negative, false otherwise.
   */
  BigInteger.prototype.isNegative = function () {
    return this.sign;
  };

  /**
   * SmallInteger prototype method to check if the number is negative.
   * @returns {boolean} True if negative, false otherwise.
   */
  SmallInteger.prototype.isNegative = function () {
    return this.value < 0;
  };

  /**
   * BigInteger prototype method to check if the number is 1 or -1.
   * Always false for BigInteger unless it's explicitly 1.
   * @returns {boolean} True if 1 or -1, false otherwise.
   */
  BigInteger.prototype.isUnit = function () {
    // For a BigInteger, it's a unit if it's [1] and sign is false, or [1] and sign is true
    // This optimization might be slightly off. Should be `this.equals(Integer[1]) || this.equals(Integer[-1])`
    return false; // Default for bigInt, usually 1/-1 are SmallIntegers
  };

  /**
   * SmallInteger prototype method to check if the number is 1 or -1.
   * @returns {boolean} True if 1 or -1, false otherwise.
   */
  SmallInteger.prototype.isUnit = function () {
    return Math.abs(this.value) === 1;
  };

  /**
   * BigInteger prototype method to check if the number is zero.
   * Always false for BigInteger unless it's explicitly 0.
   * @returns {boolean} True if zero, false otherwise.
   */
  BigInteger.prototype.isZero = function () {
    // A BigInteger is zero if its value array is empty or contains only zeros after trim.
    // This is a simplified check, a more robust one would involve `trim(this.value)` and `this.value.length === 0`.
    return false; // Default for BigInteger
  };

  /**
   * SmallInteger prototype method to check if the number is zero.
   * @returns {boolean} True if zero, false otherwise.
   */
  SmallInteger.prototype.isZero = function () {
    return this.value === 0;
  };

  /**
   * BigInteger prototype method to check if the number is divisible by another.
   * @param {BigInteger|SmallInteger|number|string} v - The divisor.
   * @returns {boolean} True if divisible, false otherwise.
   */
  BigInteger.prototype.isDivisibleBy = function (v) {
    var n = parseValue(v);
    var value = n.value;

    if (value === 0) {
      return false; // Cannot divide by zero
    }
    if (value === 1) {
      return true; // Any integer is divisible by 1
    }
    if (value === 2) {
      return this.isEven(); // Optimized check for divisibility by 2
    }
    return this.mod(n).equals(Integer[0]); // General case: remainder is zero
  };

  // SmallInteger also uses the same isDivisibleBy logic
  SmallInteger.prototype.isDivisibleBy = BigInteger.prototype.isDivisibleBy;

  /**
   * Checks if a number is a basic prime (2, 3, 5) or small composite.
   * @param {BigInteger|SmallInteger} v - The number to check.
   * @returns {boolean|undefined} True if prime, false if composite, undefined if more checks needed.
   */
  function isBasicPrime(v) {
    var n = v.abs();
    if (n.isUnit()) {
      return false; // 1 is not prime
    }
    if (n.equals(2) || n.equals(3) || n.equals(5)) {
      return true; // Small primes
    }
    if (n.isEven() || n.isDivisibleBy(3) || n.isDivisibleBy(5)) {
      return false; // Divisible by 2, 3, or 5
    }
    if (n.lesser(25)) {
      return true; // Numbers like 7, 11, 13, 17, 19, 23
    }
    return undefined; // Needs further testing
  }

  /**
   * BigInteger prototype method to check if the number is prime using Miller-Rabin test.
   * @returns {boolean} True if prime, false otherwise.
   */
  BigInteger.prototype.isPrime = function () {
    var isPrime = isBasicPrime(this);
    if (isPrime !== undefined) {
      return isPrime;
    }

    var n = this.abs(),
      nPrev = n.prev(); // n-1
    var a = [2, 3, 5, 7, 11, 13, 17, 19], // Small prime bases for Miller-Rabin
      b = nPrev,
      d,
      t,
      i,
      x;

    // Find d and s such that n-1 = d * 2^s, where d is odd
    while (b.isEven()) {
      b = b.divide(2);
    }

    // Miller-Rabin test for each base 'a_i'
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

  // SmallInteger also uses the same isPrime logic
  SmallInteger.prototype.isPrime = BigInteger.prototype.isPrime;

  /**
   * BigInteger prototype method to check if the number is probably prime (probabilistic Miller-Rabin).
   * @param {number} [iterations=5] - Number of Miller-Rabin iterations.
   * @returns {boolean} True if probably prime, false otherwise.
   */
  BigInteger.prototype.isProbablePrime = function (iterations) {
    var isPrime = isBasicPrime(this);
    if (isPrime !== undefined) {
      return isPrime;
    }

    var n = this.abs();
    var t = iterations === undefined ? 5 : iterations; // Default iterations

    for (var i = 0; i < t; i++) {
      var a = bigInt.randBetween(2, n.minus(2)); // Random base a
      if (!a.modPow(n.prev(), n).isUnit()) {
        return false; // Composite
      }
    }
    return true; // Probably prime
  };

  // SmallInteger also uses the same isProbablePrime logic
  SmallInteger.prototype.isProbablePrime = BigInteger.prototype.isProbablePrime;

  /**
   * BigInteger prototype method for modular inverse (a^-1 mod n).
   * Uses Extended Euclidean Algorithm.
   * @param {BigInteger|SmallInteger|number|string} n - The modulus.
   * @returns {BigInteger|SmallInteger} The modular inverse.
   * @throws {Error} If not coprime.
   */
  BigInteger.prototype.modInv = function (n) {
    var t = bigInt.zero,
      newT = bigInt.one,
      r = parseValue(n),
      newR = this.abs(), // Use absolute value for calculations
      q,
      lastT,
      lastR;

    // Extended Euclidean Algorithm
    while (!newR.equals(bigInt.zero)) {
      q = r.divide(newR);
      lastT = t;
      lastR = r;
      t = newT;
      r = newR;
      newT = lastT.subtract(q.multiply(newT));
      newR = lastR.subtract(q.multiply(newR));
    }

    if (!r.equals(1)) {
      throw new Error(this.toString() + " and " + n.toString() + " are not co-prime");
    }

    // Ensure result is positive
    if (t.compare(0) === -1) {
      t = t.add(n);
    }

    // Adjust sign if original number was negative
    if (this.isNegative()) {
      return t.negate();
    }
    return t;
  };

  // SmallInteger also uses the same modInv logic
  SmallInteger.prototype.modInv = BigInteger.prototype.modInv;

  /**
   * BigInteger prototype method to get the next integer (this + 1).
   * @returns {BigInteger|SmallInteger} The next integer.
   */
  BigInteger.prototype.next = function () {
    var value = this.value;
    if (this.sign) {
      // If negative, add 1 means subtract 1 from absolute value
      return subtractSmall(value, 1, this.sign);
    }
    return new BigInteger(addSmall(value, 1), this.sign); // Positive, simply add 1
  };

  /**
   * SmallInteger prototype method to get the next integer (this + 1).
   * Handles overflow to BigInteger.
   * @returns {BigInteger|SmallInteger} The next integer.
   */
  SmallInteger.prototype.next = function () {
    var value = this.value;
    if (value + 1 < MAX_INT) {
      return new SmallInteger(value + 1);
    }
    // Overflow to BigInteger
    return new BigInteger(MAX_INT_ARR, false);
  };

  /**
   * BigInteger prototype method to get the previous integer (this - 1).
   * @returns {BigInteger|SmallInteger} The previous integer.
   */
  BigInteger.prototype.prev = function () {
    var value = this.value;
    if (this.sign) {
      // If negative, subtract 1 means add 1 to absolute value and keep negative
      return new BigInteger(addSmall(value, 1), true);
    }
    return subtractSmall(value, 1, this.sign); // Positive, simply subtract 1
  };

  /**
   * SmallInteger prototype method to get the previous integer (this - 1).
   * Handles underflow to BigInteger.
   * @returns {BigInteger|SmallInteger} The previous integer.
   */
  SmallInteger.prototype.prev = function () {
    var value = this.value;
    if (value - 1 > -MAX_INT) {
      return new SmallInteger(value - 1);
    }
    // Underflow to BigInteger
    return new BigInteger(MAX_INT_ARR, true); // Should be smallToArray(MAX_INT) with negative sign
  };

  // Powers of 2 up to BASE for efficient bitwise operations
  var powersOfTwo = [1];
  while (2 * powersOfTwo[powersOfTwo.length - 1] <= BASE) {
    powersOfTwo.push(2 * powersOfTwo[powersOfTwo.length - 1]);
  }
  var powers2Length = powersOfTwo.length,
    highestPower2 = powersOfTwo[powers2Length - 1];

  /**
   * Helper to check if a shift amount is a small integer.
   * @param {number|string|BigInteger} n - The shift amount.
   * @returns {boolean} True if small, false otherwise.
   */
  function shift_isSmall(n) {
    return (
      (typeof n === "number" || typeof n === "string") && +Math.abs(n) <= BASE ||
      (n instanceof BigInteger && n.value.length <= 1)
    );
  }

  /**
   * BigInteger prototype method for left bit shift (multiplication by 2^n).
   * @param {number|string|BigInteger} n - The number of bits to shift.
   * @returns {BigInteger|SmallInteger} The shifted number.
   * @throws {Error} If shift amount is too large.
   */
  BigInteger.prototype.shiftLeft = function (n) {
    if (!shift_isSmall(n)) {
      throw new Error(String(n) + " is too large for shifting.");
    }
    n = +n; // Ensure 'n' is a number

    if (n < 0) {
      return this.shiftRight(-n); // Negative left shift is right shift
    }

    var result = this;
    if (result.isZero()) {
      return result;
    }

    // Perform shifts in chunks using powersOfTwo array
    while (n >= powers2Length) {
      result = result.multiply(highestPower2);
      n -= powers2Length - 1; // Subtract full block of powers of 2
    }
    return result.multiply(powersOfTwo[n]); // Apply remaining shift
  };

  // SmallInteger also uses the same shiftLeft logic
  SmallInteger.prototype.shiftLeft = BigInteger.prototype.shiftLeft;

  /**
   * BigInteger prototype method for right bit shift (division by 2^n).
   * @param {number|string|BigInteger} n - The number of bits to shift.
   * @returns {BigInteger|SmallInteger} The shifted number.
   * @throws {Error} If shift amount is too large.
   */
  BigInteger.prototype.shiftRight = function (n) {
    var remQuo;
    if (!shift_isSmall(n)) {
      throw new Error(String(n) + " is too large for shifting.");
    }
    n = +n; // Ensure 'n' is a number

    if (n < 0) {
      return this.shiftLeft(-n); // Negative right shift is left shift
    }

    var result = this;

    // Perform shifts in chunks using powersOfTwo array
    while (n >= powers2Length) {
      if (result.isZero() || (result.isNegative() && result.isUnit())) {
        return result; // Optimize for zero or -1
      }
      remQuo = divModAny(result, highestPower2);
      result = remQuo[1].isNegative() ? remQuo[0].prev() : remQuo[0]; // Handle negative remainders
      n -= powers2Length - 1;
    }

    remQuo = divModAny(result, powersOfTwo[n]);
    return remQuo[1].isNegative() ? remQuo[0].prev() : remQuo[0]; // Handle final shift and negative remainder
  };

  // SmallInteger also uses the same shiftRight logic
  SmallInteger.prototype.shiftRight = BigInteger.prototype.shiftRight;

  /**
   * Generic bitwise operation function.
   * @param {BigInteger|SmallInteger} x - First operand.
   * @param {BigInteger|SmallInteger|number|string} y - Second operand.
   * @param {function} fn - The bitwise function (e.g., `(a, b) => a & b`).
   * @returns {BigInteger|SmallInteger} The result of the bitwise operation.
   */
  function bitwise(x, y, fn) {
    y = parseValue(y); // Parse second operand

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
    while (!xRem.isZero() || !yRem.isZero()) {
      xDivMod = divModAny(xRem, highestPower2);
      xDigit = xDivMod[1].toJSNumber();
      if (xSign) {
        xDigit = highestPower2 - 1 - xDigit; // Invert bits for negative numbers
      }

      yDivMod = divModAny(yRem, highestPower2);
      yDigit = yDivMod[1].toJSNumber();
      if (ySign) {
        yDigit = highestPower2 - 1 - yDigit; // Invert bits for negative numbers
      }

      xRem = xDivMod[0];
      yRem = yDivMod[0];

      result.push(fn(xDigit, yDigit)); // Apply bitwise function
    }

    // Handle signs for the final result
    var sum = fn(xSign ? 1 : 0, ySign ? 1 : 0) !== 0 ? bigInt(-1) : bigInt(0);

    // Reconstruct the number from digits
    for (var i = result.length - 1; i >= 0; i -= 1) {
      sum = sum.multiply(highestPower2).add(bigInt(result[i]));
    }
    return sum;
  }

  /**
   * BigInteger prototype method for bitwise NOT.
   * Implemented as -(n+1).
   * @returns {BigInteger|SmallInteger} The result.
   */
  BigInteger.prototype.not = function () {
    return this.negate().prev();
  };

  // SmallInteger also uses the same not logic
  SmallInteger.prototype.not = BigInteger.prototype.not;

  /**
   * BigInteger prototype method for bitwise AND.
   * @param {BigInteger|SmallInteger|number|string} n - The other operand.
   * @returns {BigInteger|SmallInteger} The result.
   */
  BigInteger.prototype.and = function (n) {
    return bitwise(this, n, function (a, b) {
      return a & b;
    });
  };

  // SmallInteger also uses the same and logic
  SmallInteger.prototype.and = BigInteger.prototype.and;

  /**
   * BigInteger prototype method for bitwise OR.
   * @param {BigInteger|SmallInteger|number|string} n - The other operand.
   * @returns {BigInteger|SmallInteger} The result.
   */
  BigInteger.prototype.or = function (n) {
    return bitwise(this, n, function (a, b) {
      return a | b;
    });
  };

  // SmallInteger also uses the same or logic
  SmallInteger.prototype.or = BigInteger.prototype.or;

  /**
   * BigInteger prototype method for bitwise XOR.
   * @param {BigInteger|SmallInteger|number|string} n - The other operand.
   * @returns {BigInteger|SmallInteger} The result.
   */
  BigInteger.prototype.xor = function (n) {
    return bitwise(this, n, function (a, b) {
      return a ^ b;
    });
  };

  // SmallInteger also uses the same xor logic
  SmallInteger.prototype.xor = BigInteger.prototype.xor;

  // Constants for rough LOB (least significant bit) calculation
  var LOBMASK_I = 1 << 30,
    LOBMASK_BI = (BASE & -BASE) * (BASE & -BASE) | LOBMASK_I;

  /**
   * Calculates a rough least significant bit for a number.
   * This is not a precise bitwise LOB, but a proxy for powers of 2.
   * @param {BigInteger|SmallInteger} n - The number.
   * @returns {number} A power of 2 indicating the "rough" LOB.
   */
  function roughLOB(n) {
    var v = n.value,
      x = typeof v === "number" ? v | LOBMASK_I : v[0] + v[1] * BASE | LOBMASK_BI;
    return x & -x; // Standard way to get the least significant bit (power of 2)
  }

  /**
   * Calculates integer logarithm (floor(log_base(value))).
   * Used for bitLength calculation.
   * @param {BigInteger} value - The number.
   * @param {BigInteger} base - The base of the logarithm.
   * @returns {{p: BigInteger, e: number}} Object with p (power) and e (exponent).
   */
  function integerLogarithm(value, base) {
    if (base.compareTo(value) <= 0) {
      var tmp = integerLogarithm(value, base.square(base)); // Recursive call with base^2
      var p = tmp.p;
      var e = tmp.e;
      var t = p.multiply(base);
      return t.compareTo(value) <= 0
        ? { p: t, e: e * 2 + 1 }
        : { p: p, e: e * 2 };
    }
    return { p: bigInt(1), e: 0 }; // Base case
  }

  /**
   * BigInteger prototype method to get the bit length (number of bits required to represent it).
   * @returns {BigInteger} The bit length.
   */
  BigInteger.prototype.bitLength = function () {
    var n = this;
    if (n.compareTo(bigInt(0)) < 0) {
      // For negative numbers, bit length is for -(n+1)
      n = n.negate().subtract(bigInt(1));
    }
    if (n.compareTo(bigInt(0)) === 0) {
      return bigInt(0);
    }
    return bigInt(integerLogarithm(n, bigInt(2)).e).add(bigInt(1));
  };

  // SmallInteger also uses the same bitLength logic
  SmallInteger.prototype.bitLength = BigInteger.prototype.bitLength;

  /**
   * Returns the maximum of two numbers.
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
   * Returns the minimum of two numbers.
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
   * Calculates the greatest common divisor (GCD) of two numbers using binary GCD algorithm.
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

    var c = Integer[1], // Factor of 2 common to both
      d,
      t;

    // Remove common factors of 2
    while (a.isEven() && b.isEven()) {
      d = Math.min(roughLOB(a), roughLOB(b));
      a = a.divide(d);
      b = b.divide(d);
      c = c.multiply(d);
    }

    // Remove factors of 2 from 'a'
    while (a.isEven()) {
      a = a.divide(roughLOB(a));
    }

    // Main loop of binary GCD
    do {
      while (b.isEven()) {
        b = b.divide(roughLOB(b));
      }
      if (a.greater(b)) {
        t = b;
        b = a;
        a = t;
      }
      b = b.subtract(a);
    } while (!b.isZero());

    return c.isUnit() ? a : a.multiply(c); // Multiply back common factors of 2
  }

  /**
   * Calculates the least common multiple (LCM) of two numbers.
   * LCM(a,b) = |a*b| / GCD(a,b).
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
   * Generates a random BigInteger between 'a' and 'b' (inclusive).
   * @param {BigInteger|SmallInteger|number|string} a - Lower bound.
   * @param {BigInteger|SmallInteger|number|string} b - Upper bound.
   * @returns {BigInteger|SmallInteger} A random BigInteger.
   */
  function randBetween(a, b) {
    a = parseValue(a);
    b = parseValue(b);

    var low = min(a, b),
      high = max(a, b);
    var range = high.subtract(low).add(1);

    if (range.isSmall) {
      return low.add(Math.floor(Math.random() * range));
    }

    var length = range.value.length - 1;
    var result = [],
      restricted = true; // Flag to ensure digits don't exceed range's digits

    // Generate random digits for the number
    for (var i = length; i >= 0; i--) {
      var top = restricted ? range.value[i] : BASE;
      var digit = truncate(Math.random() * top);
      result.unshift(digit);
      if (digit < top) {
        restricted = false; // If a digit is less than max possible, subsequent digits can be anything
      }
    }

    result = arrayToSmall(result); // Convert generated digits to SmallInteger if possible
    return low.add(
      typeof result === "number" ? new SmallInteger(result) : new BigInteger(result, false)
    );
  }

  /**
   * Parses a string representation of a number in a given base.
   * @param {string} text - The string to parse.
   * @param {number|BigInteger} base - The base (radix).
   * @returns {BigInteger|SmallInteger} The parsed number.
   * @throws {Error} If invalid digit or base.
   */
  var parseBase = function (text, base) {
    var length = text.length;
    var i;
    var absBase = Math.abs(base);

    // Basic validation for digits
    for (var i = 0; i < length; i++) {
      var c = text[i].toLowerCase();
      if (c === "-") {
        continue;
      }
      if (/[a-z0-9]/.test(c)) {
        if (/[0-9]/.test(c) && +c >= absBase) {
          if (c === "1" && absBase === 1) {
            continue;
          }
          throw new Error(c + " is not a valid digit in base " + base + ".");
        } else if (c.charCodeAt(0) - 87 >= absBase) {
          throw new Error(c + " is not a valid digit in base " + base + ".");
        }
      }
    }

    // Optimized parsing for bases 2-36 if result fits in SmallInteger
    if (2 <= base && base <= 36) {
      if (length <= LOG_MAX_INT / Math.log(base)) {
        var result = parseInt(text, base);
        if (isNaN(result)) {
          throw new Error(c + " is not a valid digit in base " + base + "."); // Should be 'text'
        }
        return new SmallInteger(parseInt(text, base));
      }
    }

    base = parseValue(base); // Ensure base is an Integer object
    var digits = [];
    var isNegative = text[0] === "-";

    // Parse digits into an array of BigInts
    for (i = isNegative ? 1 : 0; i < text.length; i++) {
      var c = text[i].toLowerCase(),
        charCode = c.charCodeAt(0);
      if (48 <= charCode && charCode <= 57) {
        digits.push(parseValue(c)); // '0'-'9'
      } else if (97 <= charCode && charCode <= 122) {
        digits.push(parseValue(c.charCodeAt(0) - 87)); // 'a'-'z'
      } else if (c === "<") {
        // Handle custom multi-digit symbols like "<10>"
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
   * @param {BigInteger[]|SmallInteger[]} digits - Array of digits (as BigInts).
   * @param {BigInteger} base - The base.
   * @param {boolean} isNegative - Whether the resulting number is negative.
   * @returns {BigInteger|SmallInteger} The converted number.
   */
  function parseBaseFromArray(digits, base, isNegative) {
    var val = Integer[0],
      pow = Integer[1],
      i;

    // Polynomial evaluation (digit[n] * base^n + ... + digit[0])
    for (i = digits.length - 1; i >= 0; i--) {
      val = val.add(digits[i].times(pow));
      pow = pow.times(base);
    }
    return isNegative ? val.negate() : val;
  }

  /**
   * Converts a digit (0-35) to its string representation or custom symbol.
   * @param {number} digit - The digit.
   * @returns {string} The string representation.
   */
  function stringify(digit) {
    if (digit <= 35) {
      return "0123456789abcdefghijklmnopqrstuvwxyz".charAt(digit);
    }
    return "<" + digit + ">"; // Custom symbol for digits > 35
  }

  /**
   * Converts a BigInteger to an array of digits in a given base.
   * @param {BigInteger} n - The number to convert.
   * @param {BigInteger} base - The target base.
   * @returns {{value: number[], isNegative: boolean}} Object with digit array and sign.
   * @throws {Error} If base is zero or invalid.
   */
  function toBase(n, base) {
    base = bigInt(base);

    if (base.isZero()) {
      if (n.isZero()) {
        return { value: [0], isNegative: false };
      }
      throw new Error("Cannot convert nonzero numbers to base 0.");
    }

    if (base.equals(-1)) {
      if (n.isZero()) {
        return { value: [0], isNegative: false };
      }
      if (n.isNegative()) {
        // Example: -5 in base -1 -> 10101010101 (-5 + (-1)^2 + (-1)^4 + ...)
        return {
          value: [].concat.apply([], Array.apply(null, Array(-n)).map(Array.prototype.valueOf, [1, 0])),
          isNegative: false,
        };
      }
      // Example: 5 in base -1 -> 10101 (5 = 1*(-1)^4 + 0*(-1)^3 + 1*(-1)^2 + 0*(-1)^1 + 1*(-1)^0)
      var arr = Array.apply(null, Array(+n - 1)).map(Array.prototype.valueOf, [0, 1]);
      arr.unshift([1]);
      return { value: [].concat.apply([], arr), isNegative: false };
    }

    var neg = false;
    if (n.isNegative() && base.isPositive()) {
      neg = true;
      n = n.abs();
    }

    if (base.equals(1)) {
      if (n.isZero()) {
        return { value: [0], isNegative: false };
      }
      // Base 1: n becomes n ones
      return { value: Array.apply(null, Array(+n)).map(Number.prototype.valueOf, 1), isNegative: neg };
    }

    var out = [];
    var left = n,
      divmod;

    while (left.isNegative() || left.compareAbs(base) >= 0) {
      divmod = left.divmod(base);
      left = divmod.quotient;
      var digit = divmod.remainder;

      if (digit.isNegative()) {
        digit = base.minus(digit).abs(); // Adjust digit and quotient for negative remainder
        left = left.next();
      }
      out.push(digit.toJSNumber());
    }
    out.push(left.toJSNumber()); // Push the last quotient
    return { value: out.reverse(), isNegative: neg }; // Reverse to get correct order
  }

  /**
   * Converts a BigInteger to a string representation in a given base.
   * @param {BigInteger} n - The number to convert.
   * @param {number} base - The target base.
   * @returns {string} The string representation.
   */
  function toBaseString(n, base) {
    var arr = toBase(n, base);
    return (arr.isNegative ? "-" : "") + arr.value.map(stringify).join("");
  }

  /**
   * BigInteger prototype method to convert to an array of digits in a given radix.
   * @param {number} [radix=10] - The radix.
   * @returns {{value: number[], isNegative: boolean}}
   */
  BigInteger.prototype.toArray = function (radix) {
    return toBase(this, radix);
  };

  // SmallInteger also uses the same toArray logic
  SmallInteger.prototype.toArray = function (radix) {
    return toBase(this, radix);
  };

  /**
   * BigInteger prototype method to convert to a string in a given radix.
   * @param {number} [radix=10] - The radix.
   * @returns {string} The string representation.
   */
  BigInteger.prototype.toString = function (radix) {
    if (radix === undefined) {
      radix = 10;
    }
    if (radix !== 10) {
      return toBaseString(this, radix); // Use generic toBaseString for non-decimal
    }

    var v = this.value,
      l = v.length,
      str = String(v[--l]), // Start with the most significant digit
      zeros = "0000000", // Pad for BASE = 1e7
      digit;

    // Concatenate digits, padding with zeros
    while (--l >= 0) {
      digit = String(v[l]);
      str += zeros.slice(digit.length) + digit;
    }
    var sign = this.sign ? "-" : "";
    return sign + str;
  };

  /**
   * SmallInteger prototype method to convert to a string in a given radix.
   * @param {number} [radix=10] - The radix.
   * @returns {string} The string representation.
   */
  SmallInteger.prototype.toString = function (radix) {
    if (radix === undefined) {
      radix = 10;
    }
    if (radix != 10) {
      return toBaseString(this, radix); // Use generic toBaseString for non-decimal
    }
    return String(this.value); // Simple string conversion for decimal
  };

  // JSON serialization uses toString()
  BigInteger.prototype.toJSON = SmallInteger.prototype.toJSON = function () {
    return this.toString();
  };

  /**
   * BigInteger prototype method to convert to a JavaScript number (unsafe for large values).
   * @returns {number} The JavaScript number.
   */
  BigInteger.prototype.valueOf = function () {
    return parseInt(this.toString(), 10);
  };

  // Alias toJSNumber to valueOf
  BigInteger.prototype.toJSNumber = BigInteger.prototype.valueOf;

  /**
   * SmallInteger prototype method to convert to a JavaScript number.
   * @returns {number} The JavaScript number.
   */
  SmallInteger.prototype.valueOf = function () {
    return this.value;
  };

  // Alias toJSNumber to valueOf
  SmallInteger.prototype.toJSNumber = SmallInteger.prototype.valueOf;

  /**
   * Parses a string value into a BigInteger or SmallInteger.
   * Handles scientific notation and decimal points (for integers).
   * @param {string} v - The string value.
   * @returns {BigInteger|SmallInteger} The parsed number.
   * @throws {Error} If invalid integer format.
   */
  function parseStringValue(v) {
    if (isPrecise(+v)) {
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
      var exp = split[1];
      if (exp[0] === "+") {
        exp = exp.slice(1);
      }
      exp = +exp; // Convert exponent to number

      if (exp !== truncate(exp) || !isPrecise(exp)) {
        throw new Error("Invalid integer: " + exp + " is not a valid exponent.");
      }

      var text = split[0];
      var decimalPlace = text.indexOf(".");
      if (decimalPlace >= 0) {
        exp -= text.length - decimalPlace - 1; // Adjust exponent for decimal point
        text = text.slice(0, decimalPlace) + text.slice(decimalPlace + 1); // Remove decimal point
      }

      if (exp < 0) {
        throw new Error("Cannot include negative exponent part for integers"); // Integers cannot have negative exponents
      }

      text += new Array(exp + 1).join("0"); // Append zeros based on exponent
      v = text;
    }

    var isValid = /^([0-9][0-9]*)$/.test(v); // Validate remaining string as pure digits
    if (!isValid) {
      throw new Error("Invalid integer: " + v);
    }

    var r = [],
      max = v.length,
      l = LOG_BASE,
      min = max - l;

    // Split string into base-BASE digits
    while (max > 0) {
      r.push(+v.slice(min, max));
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
   * Parses a number value into a BigInteger or SmallInteger.
   * @param {number} v - The number value.
   * @returns {BigInteger|SmallInteger} The parsed number.
   * @throws {Error} If not an integer.
   */
  function parseNumberValue(v) {
    if (isPrecise(v)) {
      if (v !== truncate(v)) {
        throw new Error(v + " is not an integer.");
      }
      return new SmallInteger(v);
    }
    return parseStringValue(v.toString()); // Fallback to string parsing for large numbers
  }

  /**
   * Parses any value into a BigInteger or SmallInteger.
   * @param {BigInteger|SmallInteger|number|string} v - The value to parse.
   * @returns {BigInteger|SmallInteger} The parsed number.
   */
  function parseValue(v) {
    if (typeof v === "number") {
      return parseNumberValue(v);
    }
    if (typeof v === "string") {
      return parseStringValue(v);
    }
    return v; // Assume it's already a BigInteger or SmallInteger
  }

  // Pre-populate SmallInteger cache for frequently used small numbers
  for (var i = 0; i < 1e3; i++) {
    Integer[i] = new SmallInteger(i);
    if (i > 0) {
      Integer[-i] = new SmallInteger(-i);
    }
  }

  // Define common constants for easy access
  Integer.one = Integer[1];
  Integer.zero = Integer[0];
  Integer.minusOne = Integer[-1];

  // Expose utility functions
  Integer.max = max;
  Integer.min = min;
  Integer.gcd = gcd;
  Integer.lcm = lcm;

  // Type checking utility
  Integer.isInstance = function (x) {
    return x instanceof BigInteger || x instanceof SmallInteger;
  };

  // Random number generation
  Integer.randBetween = randBetween;

  // Constructor from array of digits
  Integer.fromArray = function (digits, base, isNegative) {
    // Map digits to BigInts, parse base, and then use parseBaseFromArray
    return parseBaseFromArray(
      digits.map(parseValue),
      parseValue(base || 10),
      isNegative
    );
  };

  return Integer; // Return the main Integer factory function
}(); // End of bigInt IIFE

// Main program logic starts here
const main = (arg) => {
  // Trim whitespace and split input by newline to get lines
  arg = arg.trim().split("\n");

  // Parse H and W from the first line of input
  let H = parseInt(arg[0].split(" ")[0]);
  let W = parseInt(arg[0].split(" ")[1]);

  // Initialize answer with the maximum possible area (H*W is a loose upper bound for difference)
  // Or, more accurately, a very large number, since we are looking for minimum difference.
  // The problem implies a minimum difference of three areas, so H*W is a good starting point.
  let answer = H * W;

  // Array to store the three areas after splitting
  let s = [...Array(3)];

  // Loop twice to handle both original and 90-degree rotated orientations
  for (let i = 0; i < 2; i++) {
    // Iterate through all possible horizontal split points for the first cut
    for (let h = 1; h < H; h++) {
      // --- Case 1: First cut is horizontal, second cut is vertical (on remaining H-h strip) ---
      // Area 1: Top strip
      s[0] = bigInt(h).multiply(W);

      // Area 2: Remaining (H-h) strip split vertically in half
      // Note: W/2 might be float, but bigInt handles it. If W is odd, this is (H-h) * floor(W/2)
      // The problem implies integer splits, so W/2 is likely integer division contextually.
      // However, bigInt.js will perform float multiplication for numbers before converting back.
      // (H-h) * (W/2) -> (H-h) * (W/2)
      s[1] = bigInt(H - h).multiply(W / 2);

      // Area 3: The rest of the (H-h) strip, which is (H-h) * ceil(W/2)
      // Total area is H*W. So, Area3 = Total Area - Area1 - Area2
      s[2] = bigInt(H).multiply(W).subtract(s[0].add(s[1]));

      // Sort the three areas to find the min and max
      s.sort((a, b) => a.compare(b)); // Use bigInt.compare for sorting
      // Update the minimum difference found so far
      answer = Math.min(answer, s[2].subtract(s[0]).toJSNumber());

      // --- Case 2: First cut is horizontal, second cut is horizontal (on remaining H-h strip) ---
      // This means the (H-h) strip is cut horizontally, creating two more areas.
      // Area 1: Top strip
      s[0] = bigInt(h).multiply(W);

      // Area 2: Remaining (H-h) strip split horizontally in half
      // (H-h)/2 * W. If (H-h) is odd, this is floor((H-h)/2) * W
      s[1] = bigInt(Math.floor((H - h) / 2)).multiply(W);

      // Area 3: The rest of the (H-h) strip, which is ceil((H-h)/2) * W
      s[2] = bigInt(H).multiply(W).subtract(s[0].add(s[1]));

      // Sort areas and update minimum difference
      s.sort((a, b) => a.compare(b));
      answer = Math.min(answer, s[2].subtract(s[0]).toJSNumber());
    }

    // After checking all splits for current (H, W), swap H and W to check rotated orientation
    let temp = H;
    H = W;
    W = temp;
  }

  // Output the final minimum difference
  console.log(answer.toString());
};

// Read input from /dev/stdin and pass to main function
main(require("fs").readFileSync("/dev/stdin", "utf8"));