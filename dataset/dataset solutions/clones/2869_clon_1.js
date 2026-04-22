var bigInt = function (undefined) {
  // Strict mode ensures cleaner code and helps catch common coding errors.
  "use strict";

  // Define core constants for BigInt operations.
  var BASE = 1e7;       // Base for internal array representation (10^7)
  var LOG_BASE = 7;     // Log base 10 of BASE
  var MAX_INT = 9007199254740992; // Maximum safe integer in JavaScript (2^53 - 1)
  var MAX_INT_ARR = smallToArray(MAX_INT); // MAX_INT represented as a BigInt array
  var LOG_MAX_INT = Math.log(MAX_INT); // Logarithm of MAX_INT, used for base conversion checks


  /**
   * Main Integer factory function.
   * Converts various types of input into a BigInteger or SmallInteger object.
   * @param {number|string|BigInteger|SmallInteger} v - The value to convert.
   * @param {number} [radix] - The base of the input string if `v` is a string.
   * @returns {BigInteger|SmallInteger} An Integer object.
   */
  function Integer(v, radix) {
    if (typeof v === "undefined") {
      return Integer[0]; // Return zero if no value is provided.
    }

    if (typeof radix !== "undefined") {
      // Handle base conversion for string inputs.
      return (+radix === 10) ? parseValue(v) : parseBase(v, radix);
    }

    // Default parsing for numbers, strings, or existing Integer objects.
    return parseValue(v);
  }


  /**
   * Constructor for BigInteger objects.
   * Represents large integers using an array of digits.
   * @param {number[]} value - An array of digits, where each digit is < BASE.
   * @param {boolean} sign - True if negative, false if positive or zero.
   */
  function BigInteger(value, sign) {
    this.value = value;
    this.sign = sign;
    this.isSmall = false; // Flag to distinguish from SmallInteger.
  }

  // Set prototype chain for BigInteger.
  BigInteger.prototype = Object.create(Integer.prototype);


  /**
   * Constructor for SmallInteger objects.
   * Represents integers that fit within JavaScript's safe integer range.
   * @param {number} value - The integer value.
   */
  function SmallInteger(value) {
    this.value = value;
    this.sign = value < 0;
    this.isSmall = true; // Flag to distinguish from BigInteger.
  }

  // Set prototype chain for SmallInteger.
  SmallInteger.prototype = Object.create(Integer.prototype);


  /**
   * Checks if a number can be precisely represented by JavaScript's number type.
   * @param {number} n - The number to check.
   * @returns {boolean} True if precise, false otherwise.
   */
  function isPrecise(n) {
    return -MAX_INT < n && n < MAX_INT;
  }


  /**
   * Converts a small JavaScript number into an array representation for BigInt.
   * @param {number} n - The small number.
   * @returns {number[]} Array of digits.
   */
  function smallToArray(n) {
    if (n < 1e7) {
      return [n];
    }
    if (n < 1e14) {
      return [n % 1e7, Math.floor(n / 1e7)];
    }
    return [n % 1e7, Math.floor(n / 1e7) % 1e7, Math.floor(n / 1e14)];
  }


  /**
   * Converts an array representation back into a small JavaScript number if possible.
   * @param {number[]} arr - The array of digits.
   * @returns {number|number[]} A number if small enough, otherwise the original array.
   */
  function arrayToSmall(arr) {
    trim(arr); // Remove leading zeros from the array.
    var length = arr.length;
    if (length < 4 && compareAbs(arr, MAX_INT_ARR) < 0) {
      switch (length) {
        case 0:
          return 0;
        case 1:
          return arr[0];
        case 2:
          return arr[0] + arr[1] * BASE;
        default: // length === 3
          return arr[0] + (arr[1] + arr[2] * BASE) * BASE;
      }
    }
    return arr;
  }


  /**
   * Removes leading zero elements from a digit array.
   * @param {number[]} v - The digit array.
   */
  function trim(v) {
    var i = v.length;
    while (v[--i] === 0); // Find the last non-zero digit.
    v.length = i + 1; // Trim the array.
  }


  /**
   * Creates an array of a given length, initialized with zeros.
   * @param {number} length - The desired length of the array.
   * @returns {number[]} The new array.
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
   * Truncates a number (removes fractional part).
   * @param {number} n - The number to truncate.
   * @returns {number} The truncated integer.
   */
  function truncate(n) {
    if (n > 0) {
      return Math.floor(n);
    }
    return Math.ceil(n);
  }


  // --- Arithmetic Operations ---


  /**
   * Adds two digit arrays (representing positive BigInts).
   * @param {number[]} a - First operand.
   * @param {number[]} b - Second operand.
   * @returns {number[]} The sum.
   */
  function add(a, b) {
    var l_a = a.length,
      l_b = b.length,
      r = new Array(l_a),
      carry = 0,
      base = BASE,
      sum, i;

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
   * Adds two digit arrays, ensuring the longer array is the first argument to `add`.
   * @param {number[]} a - First operand.
   * @param {number[]} b - Second operand.
   * @returns {number[]} The sum.
   */
  function addAny(a, b) {
    if (a.length >= b.length) {
      return add(a, b);
    }
    return add(b, a);
  }


  /**
   * Adds a small number (carry) to a digit array.
   * @param {number[]} a - The digit array.
   * @param {number} carry - The small number to add.
   * @returns {number[]} The sum.
   */
  function addSmall(a, carry) {
    var l = a.length,
      r = new Array(l),
      base = BASE,
      sum, i;

    for (i = 0; i < l; i++) {
      sum = a[i] - base + carry; // optimized for carry propagation
      carry = Math.floor(sum / base);
      r[i] = sum - carry * base;
      carry += 1;
    }

    while (carry > 0) {
      r[i++] = carry % base;
      carry = Math.floor(carry / base);
    }
    return r;
  }


  // BigInteger addition prototype.
  BigInteger.prototype.add = function (v) {
    var n = parseValue(v);
    if (this.sign !== n.sign) {
      return this.subtract(n.negate()); // Different signs, convert to subtraction.
    }
    var a = this.value,
      b = n.value;
    if (n.isSmall) {
      // If adding a small integer, use optimized addSmall.
      return new BigInteger(addSmall(a, Math.abs(b)), this.sign);
    }
    return new BigInteger(addAny(a, b), this.sign);
  };

  BigInteger.prototype.plus = BigInteger.prototype.add; // Alias for add.


  // SmallInteger addition prototype.
  SmallInteger.prototype.add = function (v) {
    var n = parseValue(v);
    var a = this.value;
    if (a < 0 !== n.sign) {
      return this.subtract(n.negate()); // Different signs, convert to subtraction.
    }
    var b = n.value;
    if (n.isSmall) {
      if (isPrecise(a + b)) {
        return new SmallInteger(a + b); // Direct addition if result is small and precise.
      }
      b = smallToArray(Math.abs(b)); // Convert small operand to array for BigInt addition.
    }
    return new BigInteger(addSmall(b, Math.abs(a)), a < 0);
  };

  SmallInteger.prototype.plus = SmallInteger.prototype.add; // Alias for add.


  /**
   * Subtracts two digit arrays (a - b), assuming a >= b.
   * @param {number[]} a - Minuend.
   * @param {number[]} b - Subtrahend.
   * @returns {number[]} The difference.
   */
  function subtract(a, b) {
    var a_l = a.length,
      b_l = b.length,
      r = new Array(a_l),
      borrow = 0,
      base = BASE,
      i, difference;

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
        break; // No more borrowing needed.
      }
      r[i] = difference;
    }

    // Copy remaining digits from 'a' if no borrowing was needed past 'b_l'.
    for (; i < a_l; i++) {
      r[i] = a[i];
    }
    trim(r); // Remove leading zeros.
    return r;
  }


  /**
   * Subtracts two digit arrays, handling signs and order.
   * @param {number[]} a - First operand.
   * @param {number[]} b - Second operand.
   * @param {boolean} sign - Expected sign of the result.
   * @returns {BigInteger|SmallInteger} The difference.
   */
  function subtractAny(a, b, sign) {
    var value;
    if (compareAbs(a, b) >= 0) {
      value = subtract(a, b);
    } else {
      value = subtract(b, a); // b is larger, so result's sign is inverted.
      sign = !sign;
    }
    value = arrayToSmall(value); // Try to convert to SmallInteger.
    if (typeof value === "number") {
      if (sign) {
        value = -value;
      }
      return new SmallInteger(value);
    }
    return new BigInteger(value, sign);
  }


  /**
   * Subtracts a small number from a digit array.
   * @param {number[]} a - The digit array.
   * @param {number} b - The small number (absolute value).
   * @param {boolean} sign - Expected sign of the result.
   * @returns {BigInteger|SmallInteger} The difference.
   */
  function subtractSmall(a, b, sign) {
    var l = a.length,
      r = new Array(l),
      carry = -b, // Initialize carry as negative for subtraction.
      base = BASE,
      i, difference;

    for (i = 0; i < l; i++) {
      difference = a[i] + carry;
      carry = Math.floor(difference / base);
      difference %= base;
      r[i] = difference < 0 ? difference + base : difference; // Adjust negative digits.
    }

    r = arrayToSmall(r); // Try to convert to SmallInteger.
    if (typeof r === "number") {
      if (sign) {
        r = -r;
      }
      return new SmallInteger(r);
    }
    return new BigInteger(r, sign);
  }


  // BigInteger subtraction prototype.
  BigInteger.prototype.subtract = function (v) {
    var n = parseValue(v);
    if (this.sign !== n.sign) {
      return this.add(n.negate()); // Different signs, convert to addition.
    }
    var a = this.value,
      b = n.value;
    if (n.isSmall) {
      return subtractSmall(a, Math.abs(b), this.sign);
    }
    return subtractAny(a, b, this.sign);
  };

  BigInteger.prototype.minus = BigInteger.prototype.subtract; // Alias for subtract.


  // SmallInteger subtraction prototype.
  SmallInteger.prototype.subtract = function (v) {
    var n = parseValue(v);
    var a = this.value;
    if (a < 0 !== n.sign) {
      return this.add(n.negate()); // Different signs, convert to addition.
    }
    var b = n.value;
    if (n.isSmall) {
      return new SmallInteger(a - b); // Direct subtraction if both are small.
    }
    // Convert current small integer to array and subtract from the other BigInt.
    return subtractSmall(b, Math.abs(a), a >= 0);
  };

  SmallInteger.prototype.minus = SmallInteger.prototype.subtract; // Alias for subtract.


  // Negation prototypes.
  BigInteger.prototype.negate = function () {
    return new BigInteger(this.value, !this.sign);
  };

  SmallInteger.prototype.negate = function () {
    var sign = this.sign;
    var small = new SmallInteger(-this.value);
    small.sign = !sign; // Update sign based on new value.
    return small;
  };


  // Absolute value prototypes.
  BigInteger.prototype.abs = function () {
    return new BigInteger(this.value, false); // Always positive.
  };

  SmallInteger.prototype.abs = function () {
    return new SmallInteger(Math.abs(this.value));
  };


  /**
   * Multiplies two digit arrays (long multiplication).
   * @param {number[]} a - First operand.
   * @param {number[]} b - Second operand.
   * @returns {number[]} The product.
   */
  function multiplyLong(a, b) {
    var a_l = a.length,
      b_l = b.length,
      l = a_l + b_l,
      r = createArray(l), // Result array length can be sum of lengths.
      base = BASE,
      product, carry, i, a_i, b_j;

    for (i = 0; i < a_l; ++i) {
      a_i = a[i];
      for (var j = 0; j < b_l; ++j) {
        b_j = b[j];
        product = a_i * b_j + r[i + j];
        carry = Math.floor(product / base);
        r[i + j] = product - carry * base;
        r[i + j + 1] += carry; // Add carry to the next position.
      }
    }
    trim(r); // Remove leading zeros.
    return r;
  }


  /**
   * Multiplies a digit array by a small number.
   * @param {number[]} a - The digit array.
   * @param {number} b - The small multiplier.
   * @returns {number[]} The product.
   */
  function multiplySmall(a, b) {
    var l = a.length,
      r = new Array(l),
      base = BASE,
      carry = 0,
      product, i;

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
   * Shifts a digit array left by `n` positions (effectively multiplying by BASE^n).
   * @param {number[]} x - The digit array.
   * @param {number} n - The number of positions to shift.
   * @returns {number[]} The shifted array.
   */
  function shiftLeft(x, n) {
    var r = [];
    while (n-- > 0) {
      r.push(0); // Prepend zeros for shifting.
    }
    return r.concat(x);
  }


  /**
   * Multiplies two digit arrays using Karatsuba algorithm for efficiency.
   * @param {number[]} x - First operand.
   * @param {number[]} y - Second operand.
   * @returns {number[]} The product.
   */
  function multiplyKaratsuba(x, y) {
    var n = Math.max(x.length, y.length);
    if (n <= 30) {
      return multiplyLong(x, y); // Fallback to long multiplication for small inputs.
    }

    n = Math.ceil(n / 2); // Split point.
    var b = x.slice(n),
      a = x.slice(0, n),
      d = y.slice(n),
      c = y.slice(0, n);

    var ac = multiplyKaratsuba(a, c),
      bd = multiplyKaratsuba(b, d),
      abcd = multiplyKaratsuba(addAny(a, b), addAny(c, d));

    // Reconstruct product: ac * B^(2n) + (abcd - ac - bd) * B^n + bd
    var product = addAny(addAny(ac, shiftLeft(subtract(subtract(abcd, ac), bd), n)), shiftLeft(bd, 2 * n));
    trim(product);
    return product;
  }


  /**
   * Heuristic to decide whether to use Karatsuba multiplication.
   * @param {number} l1 - Length of first array.
   * @param {number} l2 - Length of second array.
   * @returns {boolean} True if Karatsuba is likely faster.
   */
  function useKaratsuba(l1, l2) {
    // This formula is an empirical optimization threshold.
    return -.012 * l1 - .012 * l2 + 15e-6 * l1 * l2 > 0;
  }


  // BigInteger multiplication prototype.
  BigInteger.prototype.multiply = function (v) {
    var n = parseValue(v),
      a = this.value,
      b = n.value,
      sign = this.sign !== n.sign, // Determine result sign.
      abs;

    if (n.isSmall) {
      if (b === 0) return Integer[0]; // Multiply by zero.
      if (b === 1) return this; // Multiply by one.
      if (b === -1) return this.negate(); // Multiply by negative one.

      abs = Math.abs(b);
      if (abs < BASE) {
        return new BigInteger(multiplySmall(a, abs), sign); // Small multiplier.
      }
      b = smallToArray(abs); // Convert small multiplier to array.
    }

    if (useKaratsuba(a.length, b.length)) {
      return new BigInteger(multiplyKaratsuba(a, b), sign); // Use Karatsuba.
    }
    return new BigInteger(multiplyLong(a, b), sign); // Use long multiplication.
  };

  BigInteger.prototype.times = BigInteger.prototype.multiply; // Alias for multiply.


  /**
   * Multiplies a small number by a digit array, returning a BigInteger.
   * @param {number} a - Small number multiplier.
   * @param {number[]} b - Digit array operand.
   * @param {boolean} sign - Result sign.
   * @returns {BigInteger} The product.
   */
  function multiplySmallAndArray(a, b, sign) {
    if (a < BASE) {
      return new BigInteger(multiplySmall(b, a), sign);
    }
    return new BigInteger(multiplyLong(b, smallToArray(a)), sign);
  }


  // Internal multiplication helper for SmallInteger.
  SmallInteger.prototype._multiplyBySmall = function (a) {
    if (isPrecise(a.value * this.value)) {
      return new SmallInteger(a.value * this.value); // Direct multiplication if precise.
    }
    return multiplySmallAndArray(Math.abs(a.value), smallToArray(Math.abs(this.value)), this.sign !== a.sign);
  };


  // Internal multiplication helper for BigInteger.
  BigInteger.prototype._multiplyBySmall = function (a) {
    if (a.value === 0) return Integer[0];
    if (a.value === 1) return this;
    if (a.value === -1) return this.negate();
    return multiplySmallAndArray(Math.abs(a.value), this.value, this.sign !== a.sign);
  };


  // SmallInteger multiplication prototype.
  SmallInteger.prototype.multiply = function (v) {
    return parseValue(v)._multiplyBySmall(this); // Delegate to internal helper.
  };

  SmallInteger.prototype.times = SmallInteger.prototype.multiply; // Alias for multiply.


  /**
   * Squares a digit array.
   * @param {number[]} a - The digit array.
   * @returns {number[]} The square.
   */
  function square(a) {
    var l = a.length,
      r = createArray(l + l), // Result array length can be up to 2*l.
      base = BASE,
      product, carry, i, a_i, a_j;

    for (i = 0; i < l; i++) {
      a_i = a[i];
      carry = 0 - a_i * a_i; // Initialize carry with negative square (for optimization).
      for (var j = i; j < l; j++) {
        a_j = a[j];
        // 2 * a_i * a_j + r[i+j] + carry
        product = 2 * (a_i * a_j) + r[i + j] + carry;
        carry = Math.floor(product / base);
        r[i + j] = product - carry * base;
      }
      r[i + l] = carry; // Store final carry.
    }
    trim(r); // Remove leading zeros.
    return r;
  }


  // BigInteger square prototype.
  BigInteger.prototype.square = function () {
    return new BigInteger(square(this.value), false); // Square is always positive.
  };


  // SmallInteger square prototype.
  SmallInteger.prototype.square = function () {
    var value = this.value * this.value;
    if (isPrecise(value)) {
      return new SmallInteger(value); // Direct square if precise.
    }
    return new BigInteger(square(smallToArray(Math.abs(this.value))), false);
  };


  // --- Division and Modulo Operations ---


  /**
   * Performs division and modulo for two BigInts using an optimized algorithm (divMod1).
   * Applies normalization (multiplication by lambda) to improve digit estimation.
   * @param {number[]} a - Dividend (digit array).
   * @param {number[]} b - Divisor (digit array).
   * @returns {[number[], number[]]} Array containing [quotient, remainder].
   */
  function divMod1(a, b) {
    var a_l = a.length,
      b_l = b.length,
      base = BASE,
      result = createArray(b.length),
      divisorMostSignificantDigit = b[b_l - 1],
      // Normalization factor: make divisor's MSD >= BASE/2
      lambda = Math.ceil(base / (2 * divisorMostSignificantDigit)),
      remainder = multiplySmall(a, lambda),
      divisor = multiplySmall(b, lambda),
      quotientDigit, shift, carry, borrow, i, l, q;

    if (remainder.length <= a_l) {
      remainder.push(0); // Ensure enough space for normalization.
    }
    divisor.push(0); // Pad divisor for simpler loop bounds.
    divisorMostSignificantDigit = divisor[b_l - 1]; // Recalculate after normalization.

    // Iterate from most significant digit downwards.
    for (shift = a_l - b_l; shift >= 0; shift--) {
      // Estimate quotient digit.
      quotientDigit = base - 1;
      if (remainder[shift + b_l] !== divisorMostSignificantDigit) {
        quotientDigit = Math.floor((remainder[shift + b_l] * base + remainder[shift + b_l - 1]) / divisorMostSignificantDigit);
      }

      // Perform trial subtraction (quotientDigit * divisor from remainder).
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

      // Adjust quotient digit if trial subtraction was too large (borrow != 0).
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

    // Denormalize the remainder.
    remainder = divModSmall(remainder, lambda)[0];
    return [arrayToSmall(result), arrayToSmall(remainder)];
  }


  /**
   * Performs division and modulo for two BigInts using a simpler, iterative algorithm (divMod2).
   * Less efficient than divMod1 for very large numbers.
   * @param {number[]} a - Dividend (digit array).
   * @param {number[]} b - Divisor (digit array).
   * @returns {[number[], number[]]} Array containing [quotient, remainder].
   */
  function divMod2(a, b) {
    var a_l = a.length,
      b_l = b.length,
      result = [],
      part = [],
      base = BASE,
      guess, xlen, highx, highy, check;

    while (a_l) {
      part.unshift(a[--a_l]); // Take one digit at a time from dividend.
      trim(part); // Remove leading zeros from the current part.

      if (compareAbs(part, b) < 0) {
        result.push(0); // If part is smaller than divisor, quotient digit is 0.
        continue;
      }

      xlen = part.length;
      highx = part[xlen - 1] * base + part[xlen - 2]; // Top two digits of current part.
      highy = b[b_l - 1] * base + b[b_l - 2]; // Top two digits of divisor.

      if (xlen > b_l) {
        highx = (highx + 1) * base; // Adjust if part is longer than divisor.
      }

      guess = Math.ceil(highx / highy); // Initial guess for quotient digit.

      do {
        check = multiplySmall(b, guess); // Check if guess is too large.
        if (compareAbs(check, part) <= 0) {
          break;
        }
        guess--;
      } while (guess);

      result.push(guess);
      part = subtract(part, check); // Subtract (guess * divisor) from part.
    }

    result.reverse(); // Digits were collected in reverse order.
    return [arrayToSmall(result), arrayToSmall(part)];
  }


  /**
   * Divides a digit array by a small number (lambda).
   * @param {number[]} value - The digit array.
   * @param {number} lambda - The small divisor.
   * @returns {[number[], number]} Array containing [quotient array, remainder number].
   */
  function divModSmall(value, lambda) {
    var length = value.length,
      quotient = createArray(length),
      base = BASE,
      i, q, remainder, divisor;

    remainder = 0;
    for (i = length - 1; i >= 0; --i) {
      divisor = remainder * base + value[i];
      q = truncate(divisor / lambda); // Calculate quotient digit.
      remainder = divisor - q * lambda; // Calculate new remainder.
      quotient[i] = q | 0; // Ensure integer.
    }
    return [quotient, remainder | 0];
  }


  /**
   * General division and modulo function for any two Integer types.
   * @param {BigInteger|SmallInteger} self - The dividend.
   * @param {BigInteger|SmallInteger} v - The divisor.
   * @returns {[BigInteger|SmallInteger, BigInteger|SmallInteger]} Array containing [quotient, remainder].
   */
  function divModAny(self, v) {
    var value, n = parseValue(v);
    var a = self.value,
      b = n.value;
    var quotient;

    if (b === 0) {
      throw new Error("Cannot divide by zero");
    }

    if (self.isSmall) {
      if (n.isSmall) {
        return [new SmallInteger(truncate(a / b)), new SmallInteger(a % b)]; // Direct division for small numbers.
      }
      return [Integer[0], self]; // Small dividend, large divisor -> quotient 0, remainder dividend.
    }

    if (n.isSmall) {
      if (b === 1) return [self, Integer[0]]; // Divide by 1.
      if (b === -1) return [self.negate(), Integer[0]]; // Divide by -1.

      var abs = Math.abs(b);
      if (abs < BASE) {
        value = divModSmall(a, abs); // Optimized division by small number.
        quotient = arrayToSmall(value[0]);
        var remainder = value[1];

        if (self.sign) remainder = -remainder; // Adjust remainder sign.

        if (typeof quotient === "number") {
          if (self.sign !== n.sign) quotient = -quotient; // Adjust quotient sign.
          return [new SmallInteger(quotient), new SmallInteger(remainder)];
        }
        return [new BigInteger(quotient, self.sign !== n.sign), new SmallInteger(remainder)];
      }
      b = smallToArray(abs); // Convert small divisor to array.
    }

    var comparison = compareAbs(a, b);
    if (comparison === -1) return [Integer[0], self]; // Dividend < divisor.
    if (comparison === 0) return [Integer[self.sign === n.sign ? 1 : -1], Integer[0]]; // Dividend == divisor.

    // Choose division algorithm based on size.
    if (a.length + b.length <= 200) {
      value = divMod1(a, b);
    } else {
      value = divMod2(a, b);
    }

    quotient = value[0];
    var qSign = self.sign !== n.sign,
      mod = value[1],
      mSign = self.sign; // Remainder takes sign of dividend.

    if (typeof quotient === "number") {
      if (qSign) quotient = -quotient;
      quotient = new SmallInteger(quotient);
    } else {
      quotient = new BigInteger(quotient, qSign);
    }

    if (typeof mod === "number") {
      if (mSign) mod = -mod;
      mod = new SmallInteger(mod);
    } else {
      mod = new BigInteger(mod, mSign);
    }

    return [quotient, mod];
  }


  // BigInteger divmod prototype.
  BigInteger.prototype.divmod = function (v) {
    var result = divModAny(this, v);
    return {
      quotient: result[0],
      remainder: result[1]
    };
  };

  SmallInteger.prototype.divmod = BigInteger.prototype.divmod; // SmallInteger delegates to BigInteger's divmod.


  // BigInteger division prototype.
  BigInteger.prototype.divide = function (v) {
    return divModAny(this, v)[0]; // Return only the quotient.
  };

  SmallInteger.prototype.over = SmallInteger.prototype.divide = BigInteger.prototype.over = BigInteger.prototype.divide; // Aliases.


  // BigInteger modulo prototype.
  BigInteger.prototype.mod = function (v) {
    return divModAny(this, v)[1]; // Return only the remainder.
  };

  SmallInteger.prototype.remainder = SmallInteger.prototype.mod = BigInteger.prototype.remainder = BigInteger.prototype.mod; // Aliases.


  // --- Exponentiation Operations ---


  // BigInteger power prototype.
  BigInteger.prototype.pow = function (v) {
    var n = parseValue(v),
      a = this.value,
      b = n.value,
      value, x, y;

    if (b === 0) return Integer[1]; // x^0 = 1.
    if (a === 0) return Integer[0]; // 0^n = 0 (for n > 0).
    if (a === 1) return Integer[1]; // 1^n = 1.
    if (a === -1) return n.isEven() ? Integer[1] : Integer[-1]; // (-1)^n.

    if (n.sign) {
      return Integer[0]; // Negative exponent implies fractional result, not supported for integers.
    }

    if (!n.isSmall) {
      throw new Error("The exponent " + n.toString() + " is too large.");
    }

    if (this.isSmall) {
      if (isPrecise(value = Math.pow(a, b))) {
        return new SmallInteger(truncate(value)); // Direct calculation if small and precise.
      }
    }

    // Binary exponentiation (exponentiation by squaring).
    x = this;
    y = Integer[1]; // Initialize result to 1.
    while (true) {
      if ((b & 1) === 1) { // If exponent is odd.
        y = y.times(x);
        --b;
      }
      if (b === 0) break; // Exponent is zero, done.
      b /= 2;
      x = x.square(); // Square the base.
    }
    return y;
  };

  SmallInteger.prototype.pow = BigInteger.prototype.pow; // SmallInteger delegates to BigInteger's pow.


  // BigInteger modular exponentiation prototype.
  BigInteger.prototype.modPow = function (exp, mod) {
    exp = parseValue(exp);
    mod = parseValue(mod);

    if (mod.isZero()) {
      throw new Error("Cannot take modPow with modulus 0");
    }

    var r = Integer[1], // Result initialized to 1.
      base = this.mod(mod); // Base reduced modulo mod.

    while (exp.isPositive()) {
      if (base.isZero()) {
        return Integer[0]; // If base is 0, result is 0.
      }
      if (exp.isOdd()) {
        r = r.multiply(base).mod(mod); // If exponent is odd, multiply result by base.
      }
      exp = exp.divide(2); // Halve the exponent.
      base = base.square().mod(mod); // Square the base.
    }
    return r;
  };

  SmallInteger.prototype.modPow = BigInteger.prototype.modPow; // SmallInteger delegates to BigInteger's modPow.


  // --- Comparison Operations ---


  /**
   * Compares the absolute values of two digit arrays.
   * @param {number[]} a - First operand.
   * @param {number[]} b - Second operand.
   * @returns {number} 1 if a > b, -1 if a < b, 0 if a == b.
   */
  function compareAbs(a, b) {
    if (a.length !== b.length) {
      return a.length > b.length ? 1 : -1; // Longer array is larger.
    }
    for (var i = a.length - 1; i >= 0; i--) {
      if (a[i] !== b[i]) {
        return a[i] > b[i] ? 1 : -1; // Compare digits from most significant.
      }
    }
    return 0; // Arrays are equal.
  }


  // BigInteger absolute comparison prototype.
  BigInteger.prototype.compareAbs = function (v) {
    var n = parseValue(v),
      a = this.value,
      b = n.value;
    if (n.isSmall) {
      return 1; // BigInt is always absolutely larger than SmallInt (unless SmallInt is 0).
    }
    return compareAbs(a, b);
  };


  // SmallInteger absolute comparison prototype.
  SmallInteger.prototype.compareAbs = function (v) {
    var n = parseValue(v),
      a = Math.abs(this.value),
      b = n.value;
    if (n.isSmall) {
      b = Math.abs(b);
      return a === b ? 0 : a > b ? 1 : -1; // Direct comparison for small numbers.
    }
    return -1; // SmallInt is always absolutely smaller than BigInt (unless BigInt is 0).
  };


  // BigInteger comparison prototype.
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

    if (this.sign !== n.sign) {
      return n.sign ? 1 : -1; // Different signs: positive > negative.
    }

    if (n.isSmall) {
      return this.sign ? -1 : 1; // If one is small, BigInt is larger in magnitude.
    }

    // Same sign, compare absolute values and adjust based on sign.
    return compareAbs(a, b) * (this.sign ? -1 : 1);
  };

  BigInteger.prototype.compareTo = BigInteger.prototype.compare; // Alias.


  // SmallInteger comparison prototype.
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
      return a == b ? 0 : a > b ? 1 : -1; // Direct comparison for small numbers.
    }

    if (a < 0 !== n.sign) {
      return a < 0 ? -1 : 1; // Different signs: negative < positive.
    }

    return a < 0 ? 1 : -1; // Both negative: numerically smaller is larger.
  };

  SmallInteger.prototype.compareTo = SmallInteger.prototype.compare; // Alias.


  // Equality checks.
  BigInteger.prototype.equals = function (v) {
    return this.compare(v) === 0;
  };
  SmallInteger.prototype.eq = SmallInteger.prototype.equals = BigInteger.prototype.eq = BigInteger.prototype.equals;


  // Inequality checks.
  BigInteger.prototype.notEquals = function (v) {
    return this.compare(v) !== 0;
  };
  SmallInteger.prototype.neq = SmallInteger.prototype.notEquals = BigInteger.prototype.neq = BigInteger.prototype.notEquals;


  // Greater than.
  BigInteger.prototype.greater = function (v) {
    return this.compare(v) > 0;
  };
  SmallInteger.prototype.gt = SmallInteger.prototype.greater = BigInteger.prototype.gt = BigInteger.prototype.greater;


  // Lesser than.
  BigInteger.prototype.lesser = function (v) {
    return this.compare(v) < 0;
  };
  SmallInteger.prototype.lt = SmallInteger.prototype.lesser = BigInteger.prototype.lt = BigInteger.prototype.lesser;


  // Greater than or equals.
  BigInteger.prototype.greaterOrEquals = function (v) {
    return this.compare(v) >= 0;
  };
  SmallInteger.prototype.geq = SmallInteger.prototype.greaterOrEquals = BigInteger.prototype.geq = BigInteger.prototype.greaterOrEquals;


  // Lesser than or equals.
  BigInteger.prototype.lesserOrEquals = function (v) {
    return this.compare(v) <= 0;
  };
  SmallInteger.prototype.leq = SmallInteger.prototype.lesserOrEquals = BigInteger.prototype.leq = BigInteger.prototype.lesserOrEquals;


  // --- Property checks ---


  // Even/Odd checks.
  BigInteger.prototype.isEven = function () {
    return (this.value[0] & 1) === 0; // Check last digit.
  };
  SmallInteger.prototype.isEven = function () {
    return (this.value & 1) === 0; // Check value directly.
  };

  BigInteger.prototype.isOdd = function () {
    return (this.value[0] & 1) === 1; // Check last digit.
  };
  SmallInteger.prototype.isOdd = function () {
    return (this.value & 1) === 1; // Check value directly.
  };


  // Sign checks.
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


  // Unit (1 or -1) checks.
  BigInteger.prototype.isUnit = function () {
    return false; // BigInts are generally not units unless explicitly 1.
  };
  SmallInteger.prototype.isUnit = function () {
    return Math.abs(this.value) === 1;
  };


  // Zero check.
  BigInteger.prototype.isZero = function () {
    return false; // BigInt is not zero unless its value array is empty (trimmed to 0).
  };
  SmallInteger.prototype.isZero = function () {
    return this.value === 0;
  };


  // Divisibility check.
  BigInteger.prototype.isDivisibleBy = function (v) {
    var n = parseValue(v);
    var value = n.value;

    if (value === 0) return false;
    if (value === 1) return true;
    if (value === 2) return this.isEven(); // Optimized for 2.

    return this.mod(n).equals(Integer[0]); // Check if remainder is zero.
  };

  SmallInteger.prototype.isDivisibleBy = BigInteger.prototype.isDivisibleBy; // SmallInteger delegates.


  /**
   * Checks for basic primality for small numbers.
   * @param {BigInteger|SmallInteger} v - The number to check.
   * @returns {boolean|undefined} True if prime, false if composite, undefined if too large for basic check.
   */
  function isBasicPrime(v) {
    var n = v.abs();
    if (n.isUnit()) return false; // 1 is not prime.
    if (n.equals(2) || n.equals(3) || n.equals(5)) return true; // Known small primes.
    if (n.isEven() || n.isDivisibleBy(3) || n.isDivisibleBy(5)) return false; // Divisible by small primes.
    if (n.lesser(25)) return true; // All numbers < 25 not caught above are prime.
  }


  // BigInteger primality test (Miller-Rabin).
  BigInteger.prototype.isPrime = function () {
    var isPrime = isBasicPrime(this);
    if (isPrime !== undefined) return isPrime; // Use basic check results.

    var n = this.abs(),
      nPrev = n.prev(); // n-1.
    var a = [2, 3, 5, 7, 11, 13, 17, 19], // Small bases for Miller-Rabin.
      b = nPrev,
      d, t, i, x;

    while (b.isEven()) {
      b = b.divide(2); // Find d such that n-1 = 2^s * d.
    }

    for (i = 0; i < a.length; i++) {
      x = bigInt(a[i]).modPow(b, n); // a^d mod n.
      if (x.equals(Integer[1]) || x.equals(nPrev)) continue; // Passes first condition.

      for (t = true, d = b; t && d.lesser(nPrev); d = d.multiply(2)) {
        x = x.square().mod(n); // x^(2^r * d) mod n.
        if (x.equals(nPrev)) t = false; // Passes second condition.
      }
      if (t) return false; // Fails Miller-Rabin test.
    }
    return true; // Likely prime.
  };

  SmallInteger.prototype.isPrime = BigInteger.prototype.isPrime; // SmallInteger delegates.


  // BigInteger probable primality test (Miller-Rabin with custom iterations).
  BigInteger.prototype.isProbablePrime = function (iterations) {
    var isPrime = isBasicPrime(this);
    if (isPrime !== undefined) return isPrime;

    var n = this.abs();
    var t = iterations === undefined ? 5 : iterations; // Default iterations.

    for (var i = 0; i < t; i++) {
      var a = bigInt.randBetween(2, n.minus(2)); // Random base a.
      if (!a.modPow(n.prev(), n).isUnit()) {
        return false; // Fails Fermat's Little Theorem (a^(n-1) !== 1 mod n).
      }
    }
    return true; // Probably prime.
  };

  SmallInteger.prototype.isProbablePrime = BigInteger.prototype.isProbablePrime; // SmallInteger delegates.


  // BigInteger modular inverse.
  BigInteger.prototype.modInv = function (n) {
    var t = bigInt.zero,
      newT = bigInt.one,
      r = parseValue(n),
      newR = this.abs(),
      q, lastT, lastR;

    // Extended Euclidean algorithm.
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

    if (t.compare(0) === -1) {
      t = t.add(n); // Ensure positive result.
    }

    if (this.isNegative()) {
      return t.negate();
    }
    return t;
  };

  SmallInteger.prototype.modInv = BigInteger.prototype.modInv; // SmallInteger delegates.


  // --- Increment/Decrement Operations ---


  // BigInteger next (increment by 1).
  BigInteger.prototype.next = function () {
    var value = this.value;
    if (this.sign) {
      return subtractSmall(value, 1, this.sign); // If negative, effectively subtract 1 from abs.
    }
    return new BigInteger(addSmall(value, 1), this.sign);
  };


  // SmallInteger next (increment by 1).
  SmallInteger.prototype.next = function () {
    var value = this.value;
    if (value + 1 < MAX_INT) {
      return new SmallInteger(value + 1);
    }
    return new BigInteger(MAX_INT_ARR, false); // Overflow to BigInteger.
  };


  // BigInteger previous (decrement by 1).
  BigInteger.prototype.prev = function () {
    var value = this.value;
    if (this.sign) {
      return new BigInteger(addSmall(value, 1), true); // If negative, effectively add 1 to abs.
    }
    return subtractSmall(value, 1, this.sign);
  };


  // SmallInteger previous (decrement by 1).
  SmallInteger.prototype.prev = function () {
    var value = this.value;
    if (value - 1 > -MAX_INT) {
      return new SmallInteger(value - 1);
    }
    return new BigInteger(MAX_INT_ARR, true); // Underflow to BigInteger.
  };


  // --- Bitwise Operations ---


  // Precompute powers of 2 up to BASE for efficient bitwise operations.
  var powersOfTwo = [1];
  while (2 * powersOfTwo[powersOfTwo.length - 1] <= BASE) {
    powersOfTwo.push(2 * powersOfTwo[powersOfTwo.length - 1]);
  }
  var powers2Length = powersOfTwo.length,
    highestPower2 = powersOfTwo[powers2Length - 1];


  /**
   * Checks if a number can be used directly as a shift amount.
   * @param {number|string|BigInteger} n - The shift amount.
   * @returns {boolean} True if small and precise, false otherwise.
   */
  function shift_isSmall(n) {
    return (typeof n === "number" || typeof n === "string") && +Math.abs(n) <= BASE || n instanceof BigInteger && n.value.length <= 1;
  }


  // BigInteger left shift.
  BigInteger.prototype.shiftLeft = function (n) {
    if (!shift_isSmall(n)) {
      throw new Error(String(n) + " is too large for shifting.");
    }
    n = +n; // Ensure number type.
    if (n < 0) return this.shiftRight(-n); // Negative shiftLeft is shiftRight.

    var result = this;
    if (result.isZero()) return result;

    // Multiply by powers of BASE (which is 2^LOG_BASE * whatever).
    while (n >= powers2Length) {
      result = result.multiply(highestPower2);
      n -= powers2Length - 1; // Subtract the effective shift amount.
    }
    return result.multiply(powersOfTwo[n]);
  };

  SmallInteger.prototype.shiftLeft = BigInteger.prototype.shiftLeft; // SmallInteger delegates.


  // BigInteger right shift.
  BigInteger.prototype.shiftRight = function (n) {
    var remQuo;
    if (!shift_isSmall(n)) {
      throw new Error(String(n) + " is too large for shifting.");
    }
    n = +n; // Ensure number type.
    if (n < 0) return this.shiftLeft(-n); // Negative shiftRight is shiftLeft.

    var result = this;
    while (n >= powers2Length) {
      if (result.isZero() || result.isNegative() && result.isUnit()) {
        return result; // Shifting a negative unit or zero.
      }
      remQuo = divModAny(result, highestPower2);
      result = remQuo[1].isNegative() ? remQuo[0].prev() : remQuo[0]; // Handle negative results correctly.
      n -= powers2Length - 1;
    }

    remQuo = divModAny(result, powersOfTwo[n]);
    return remQuo[1].isNegative() ? remQuo[0].prev() : remQuo[0]; // Handle negative results correctly.
  };

  SmallInteger.prototype.shiftRight = BigInteger.prototype.shiftRight; // SmallInteger delegates.


  /**
   * Generic bitwise operation function.
   * @param {BigInteger|SmallInteger} x - First operand.
   * @param {BigInteger|SmallInteger} y - Second operand.
   * @param {function(number, number): number} fn - The bitwise function (e.g., `&`, `|`, `^`).
   * @returns {BigInteger|SmallInteger} The result.
   */
  function bitwise(x, y, fn) {
    y = parseValue(y);

    var xSign = x.isNegative(),
      ySign = y.isNegative();
    // For negative numbers, bitwise operations are typically done on their 2's complement.
    // This implementation uses a "bitwise not" approach for negative numbers.
    var xRem = xSign ? x.not() : x,
      yRem = ySign ? y.not() : y;

    var xDigit = 0,
      yDigit = 0;
    var xDivMod = null,
      yDivMod = null;
    var result = [];

    while (!xRem.isZero() || !yRem.isZero()) {
      xDivMod = divModAny(xRem, highestPower2);
      xDigit = xDivMod[1].toJSNumber();
      if (xSign) {
        xDigit = highestPower2 - 1 - xDigit; // Apply 2's complement logic.
      }

      yDivMod = divModAny(yRem, highestPower2);
      yDigit = yDivMod[1].toJSNumber();
      if (ySign) {
        yDigit = highestPower2 - 1 - yDigit; // Apply 2's complement logic.
      }

      xRem = xDivMod[0];
      yRem = yDivMod[0];
      result.push(fn(xDigit, yDigit)); // Apply bitwise function digit by digit.
    }

    // Determine final sign and reconstruct the number.
    var sum = fn(xSign ? 1 : 0, ySign ? 1 : 0) !== 0 ? bigInt(-1) : bigInt(0);
    for (var i = result.length - 1; i >= 0; i -= 1) {
      sum = sum.multiply(highestPower2).add(bigInt(result[i]));
    }
    return sum;
  }


  // Bitwise NOT.
  BigInteger.prototype.not = function () {
    return this.negate().prev(); // ~x = -x - 1.
  };

  SmallInteger.prototype.not = BigInteger.prototype.not;


  // Bitwise AND.
  BigInteger.prototype.and = function (n) {
    return bitwise(this, n, function (a, b) {
      return a & b;
    });
  };

  SmallInteger.prototype.and = BigInteger.prototype.and;


  // Bitwise OR.
  BigInteger.prototype.or = function (n) {
    return bitwise(this, n, function (a, b) {
      return a | b;
    });
  };

  SmallInteger.prototype.or = BigInteger.prototype.or;


  // Bitwise XOR.
  BigInteger.prototype.xor = function (n) {
    return bitwise(this, n, function (a, b) {
      return a ^ b;
    });
  };

  SmallInteger.prototype.xor = BigInteger.prototype.xor;


  // --- Miscellaneous Operations ---


  // Constants for rough LOB (Least One Bit) calculation.
  var LOBMASK_I = 1 << 30,
    LOBMASK_BI = (BASE & -BASE) * (BASE & -BASE) | LOBMASK_I;


  /**
   * Calculates a "rough" Least One Bit (LOB) for internal use in GCD.
   * @param {BigInteger|SmallInteger} n - The number.
   * @returns {number} A power of 2 indicating the LOB.
   */
  function roughLOB(n) {
    var v = n.value,
      x = typeof v === "number" ? v | LOBMASK_I : v[0] + v[1] * BASE | LOBMASK_BI;
    return x & -x; // Returns the lowest set bit.
  }


  /**
   * Calculates integer logarithm (log_base(value)).
   * @param {BigInteger|SmallInteger} value - The number.
   * @param {BigInteger|SmallInteger} base - The base of the logarithm.
   * @returns {{p: BigInteger|SmallInteger, e: number}} Object with p (power) and e (exponent).
   */
  function integerLogarithm(value, base) {
    if (base.compareTo(value) <= 0) {
      var tmp = integerLogarithm(value, base.square(base)); // Recursive step.
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
    }; // Base case: value < base.
  }


  // BigInteger bit length.
  BigInteger.prototype.bitLength = function () {
    var n = this;
    if (n.compareTo(bigInt(0)) < 0) {
      n = n.negate().subtract(bigInt(1)); // For negative numbers, bit length is for 2's complement.
    }
    if (n.compareTo(bigInt(0)) === 0) {
      return bigInt(0);
    }
    return bigInt(integerLogarithm(n, bigInt(2)).e).add(bigInt(1));
  };

  SmallInteger.prototype.bitLength = BigInteger.prototype.bitLength; // SmallInteger delegates.


  /**
   * Returns the maximum of two Integer objects.
   * @param {BigInteger|SmallInteger|number|string} a - First operand.
   * @param {BigInteger|SmallInteger|number|string} b - Second operand.
   * @returns {BigInteger|SmallInteger} The maximum value.
   */
  function max(a, b) {
    a = parseValue(a);
    b = parseValue(b);
    return a.greater(b) ? a : b;
  }


  /**
   * Returns the minimum of two Integer objects.
   * @param {BigInteger|SmallInteger|number|string} a - First operand.
   * @param {BigInteger|SmallInteger|number|string} b - Second operand.
   * @returns {BigInteger|SmallInteger} The minimum value.
   */
  function min(a, b) {
    a = parseValue(a);
    b = parseValue(b);
    return a.lesser(b) ? a : b;
  }


  /**
   * Calculates the Greatest Common Divisor (GCD) of two Integer objects using binary GCD algorithm.
   * @param {BigInteger|SmallInteger|number|string} a - First operand.
   * @param {BigInteger|SmallInteger|number|string} b - Second operand.
   * @returns {BigInteger|SmallInteger} The GCD.
   */
  function gcd(a, b) {
    a = parseValue(a).abs();
    b = parseValue(b).abs();

    if (a.equals(b)) return a;
    if (a.isZero()) return b;
    if (b.isZero()) return a;

    var c = Integer[1],
      d, t;

    while (a.isEven() && b.isEven()) {
      d = Math.min(roughLOB(a), roughLOB(b)); // Find common factors of 2.
      a = a.divide(d);
      b = b.divide(d);
      c = c.multiply(d);
    }

    while (a.isEven()) {
      a = a.divide(roughLOB(a)); // Remove factors of 2 from a.
    }

    do {
      while (b.isEven()) {
        b = b.divide(roughLOB(b)); // Remove factors of 2 from b.
      }
      if (a.greater(b)) {
        t = b;
        b = a;
        a = t; // Swap if a > b.
      }
      b = b.subtract(a); // Replace b with b - a.
    } while (!b.isZero());

    return c.isUnit() ? a : a.multiply(c); // Multiply back the common factors of 2.
  }


  /**
   * Calculates the Least Common Multiple (LCM) of two Integer objects.
   * LCM(a, b) = |a * b| / GCD(a, b).
   * @param {BigInteger|SmallInteger|number|string} a - First operand.
   * @param {BigInteger|SmallInteger|number|string} b - Second operand.
   * @returns {BigInteger|SmallInteger} The LCM.
   */
  function lcm(a, b) {
    a = parseValue(a).abs();
    b = parseValue(b).abs();
    return a.divide(gcd(a, b)).multiply(b);
  }


  /**
   * Generates a random BigInt between two given BigInts (inclusive).
   * @param {BigInteger|SmallInteger|number|string} a - Lower bound.
   * @param {BigInteger|SmallInteger|number|string} b - Upper bound.
   * @returns {BigInteger|SmallInteger} A random BigInt.
   */
  function randBetween(a, b) {
    a = parseValue(a);
    b = parseValue(b);

    var low = min(a, b),
      high = max(a, b);
    var range = high.subtract(low).add(1);

    if (range.isSmall) {
      return low.add(Math.floor(Math.random() * range)); // If range is small, use JS random.
    }

    var length = range.value.length - 1;
    var result = [],
      restricted = true;

    // Generate random digits for the result, ensuring it's within range.
    for (var i = length; i >= 0; i--) {
      var top = restricted ? range.value[i] : BASE;
      var digit = truncate(Math.random() * top);
      result.unshift(digit);
      if (digit < top) {
        restricted = false; // Once a digit is smaller than the corresponding range digit, restriction is lifted.
      }
    }

    result = arrayToSmall(result);
    return low.add(typeof result === "number" ? new SmallInteger(result) : new BigInteger(result, false));
  }


  // --- Base Conversion ---


  /**
   * Parses a string representation of a number in a given base.
   * @param {string} text - The string to parse.
   * @param {number|BigInteger|SmallInteger} base - The base (radix).
   * @returns {BigInteger|SmallInteger} The parsed Integer object.
   */
  var parseBase = function (text, base) {
    var length = text.length;
    var i;
    var absBase = Math.abs(base);

    // Validate digits for the given base.
    for (var i = 0; i < length; i++) {
      var c = text[i].toLowerCase();
      if (c === "-") continue;
      if (/[a-z0-9]/.test(c)) {
        if (/[0-9]/.test(c) && +c >= absBase) {
          if (c === "1" && absBase === 1) continue;
          throw new Error(c + " is not a valid digit in base " + base + ".");
        } else if (c.charCodeAt(0) - 87 >= absBase) {
          throw new Error(c + " is not a valid digit in base " + base + ".");
        }
      }
    }

    // For small bases and small numbers, use native parseInt for efficiency.
    if (2 <= base && base <= 36) {
      if (length <= LOG_MAX_INT / Math.log(base)) {
        var result = parseInt(text, base);
        if (isNaN(result)) {
          throw new Error(c + " is not a valid digit in base " + base + ".");
        }
        return new SmallInteger(parseInt(text, base));
      }
    }

    base = parseValue(base); // Convert base to Integer object.
    var digits = [];
    var isNegative = text[0] === "-";

    // Parse digits into BigInts.
    for (i = isNegative ? 1 : 0; i < text.length; i++) {
      var c = text[i].toLowerCase(),
        charCode = c.charCodeAt(0);
      if (48 <= charCode && charCode <= 57) {
        digits.push(parseValue(c));
      } else if (97 <= charCode && charCode <= 122) {
        digits.push(parseValue(c.charCodeAt(0) - 87));
      } else if (c === "<") {
        // Handle custom digit format like "<123>".
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
   * Converts an array of digit-Integers in a given base to a single Integer.
   * @param {BigInteger[]|SmallInteger[]} digits - Array of digit values.
   * @param {BigInteger|SmallInteger} base - The base.
   * @param {boolean} isNegative - Whether the final number should be negative.
   * @returns {BigInteger|SmallInteger} The resulting Integer.
   */
  function parseBaseFromArray(digits, base, isNegative) {
    var val = Integer[0],
      pow = Integer[1],
      i;
    for (i = digits.length - 1; i >= 0; i--) {
      val = val.add(digits[i].times(pow));
      pow = pow.times(base);
    }
    return isNegative ? val.negate() : val;
  }


  /**
   * Converts a single digit (0-35) to its string representation.
   * @param {number} digit - The digit.
   * @returns {string} The string representation.
   */
  function stringify(digit) {
    if (digit <= 35) {
      return "0123456789abcdefghijklmnopqrstuvwxyz".charAt(digit);
    }
    return "<" + digit + ">"; // For digits > 35.
  }


  /**
   * Converts an Integer to a specified base, returning an array of digits and sign.
   * @param {BigInteger|SmallInteger} n - The number to convert.
   * @param {BigInteger|SmallInteger} base - The target base.
   * @returns {{value: number[], isNegative: boolean}} Object with digit array and sign.
   */
  function toBase(n, base) {
    base = bigInt(base); // Ensure base is an Integer.

    if (base.isZero()) {
      if (n.isZero()) return {
        value: [0],
        isNegative: false
      };
      throw new Error("Cannot convert nonzero numbers to base 0.");
    }

    if (base.equals(-1)) {
      if (n.isZero()) return {
        value: [0],
        isNegative: false
      };
      if (n.isNegative()) return {
        value: [].concat.apply([], Array.apply(null, Array(-n)).map(Array.prototype.valueOf, [1, 0])),
        isNegative: false
      };
      var arr = Array.apply(null, Array(+n - 1)).map(Array.prototype.valueOf, [0, 1]);
      arr.unshift([1]);
      return {
        value: [].concat.apply([], arr),
        isNegative: false
      };
    }

    var neg = false;
    if (n.isNegative() && base.isPositive()) {
      neg = true;
      n = n.abs();
    }

    if (base.equals(1)) {
      if (n.isZero()) return {
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
    while (left.isNegative() || left.compareAbs(base) >= 0) {
      divmod = left.divmod(base);
      left = divmod.quotient;
      var digit = divmod.remainder;
      if (digit.isNegative()) {
        digit = base.minus(digit).abs(); // Adjust negative remainder.
        left = left.next(); // Adjust quotient.
      }
      out.push(digit.toJSNumber());
    }
    out.push(left.toJSNumber());
    return {
      value: out.reverse(),
      isNegative: neg
    };
  }


  /**
   * Converts an Integer to a string representation in a specified base.
   * @param {BigInteger|SmallInteger} n - The number to convert.
   * @param {BigInteger|SmallInteger} base - The target base.
   * @returns {string} The string representation.
   */
  function toBaseString(n, base) {
    var arr = toBase(n, base);
    return (arr.isNegative ? "-" : "") + arr.value.map(stringify).join("");
  }


  // BigInteger toArray prototype.
  BigInteger.prototype.toArray = function (radix) {
    return toBase(this, radix);
  };

  SmallInteger.prototype.toArray = function (radix) {
    return toBase(this, radix);
  };


  // BigInteger toString prototype.
  BigInteger.prototype.toString = function (radix) {
    if (radix === undefined) radix = 10;
    if (radix !== 10) return toBaseString(this, radix); // Delegate for non-base-10.

    var v = this.value,
      l = v.length,
      str = String(v[--l]),
      zeros = "0000000",
      digit;

    while (--l >= 0) {
      digit = String(v[l]);
      str += zeros.slice(digit.length) + digit; // Pad with leading zeros.
    }
    var sign = this.sign ? "-" : "";
    return sign + str;
  };


  // SmallInteger toString prototype.
  SmallInteger.prototype.toString = function (radix) {
    if (radix === undefined) radix = 10;
    if (radix != 10) return toBaseString(this, radix); // Delegate for non-base-10.
    return String(this.value);
  };


  // JSON serialization.
  BigInteger.prototype.toJSON = SmallInteger.prototype.toJSON = function () {
    return this.toString();
  };


  // ValueOf and toJSNumber (for interoperability).
  BigInteger.prototype.valueOf = function () {
    return parseInt(this.toString(), 10);
  };

  BigInteger.prototype.toJSNumber = BigInteger.prototype.valueOf;

  SmallInteger.prototype.valueOf = function () {
    return this.value;
  };

  SmallInteger.prototype.toJSNumber = SmallInteger.prototype.valueOf;


  // --- Internal Parsing Functions ---


  /**
   * Parses a string into an Integer object. Handles scientific notation.
   * @param {string} v - The string value.
   * @returns {BigInteger|SmallInteger} The parsed Integer.
   */
  function parseStringValue(v) {
    if (isPrecise(+v)) {
      var x = +v;
      if (x === truncate(x)) return new SmallInteger(x);
      throw new Error("Invalid integer: " + v);
    }

    var sign = v[0] === "-";
    if (sign) v = v.slice(1);

    var split = v.split(/e/i); // Handle scientific notation.
    if (split.length > 2) throw new Error("Invalid integer: " + split.join("e"));

    if (split.length === 2) {
      var exp = split[1];
      if (exp[0] === "+") exp = exp.slice(1);
      exp = +exp;
      if (exp !== truncate(exp) || !isPrecise(exp)) throw new Error("Invalid integer: " + exp + " is not a valid exponent.");

      var text = split[0];
      var decimalPlace = text.indexOf(".");
      if (decimalPlace >= 0) {
        exp -= text.length - decimalPlace - 1;
        text = text.slice(0, decimalPlace) + text.slice(decimalPlace + 1);
      }
      if (exp < 0) throw new Error("Cannot include negative exponent part for integers");
      text += new Array(exp + 1).join("0"); // Append zeros for exponent.
      v = text;
    }

    var isValid = /^([0-9][0-9]*)$/.test(v); // Basic validation.
    if (!isValid) throw new Error("Invalid integer: " + v);

    var r = [],
      max = v.length,
      l = LOG_BASE,
      min = max - l;

    // Split string into digit array.
    while (max > 0) {
      r.push(+(v.slice(min, max)));
      min -= l;
      if (min < 0) min = 0;
      max -= l;
    }
    trim(r); // Remove leading zeros.
    return new BigInteger(r, sign);
  }


  /**
   * Parses a number into an Integer object.
   * @param {number} v - The number value.
   * @returns {BigInteger|SmallInteger} The parsed Integer.
   */
  function parseNumberValue(v) {
    if (isPrecise(v)) {
      if (v !== truncate(v)) throw new Error(v + " is not an integer.");
      return new SmallInteger(v);
    }
    return parseStringValue(v.toString()); // Fallback to string parsing for large numbers.
  }


  /**
   * General parsing function to convert various types to Integer objects.
   * @param {number|string|BigInteger|SmallInteger} v - The value to parse.
   * @returns {BigInteger|SmallInteger} The parsed Integer.
   */
  function parseValue(v) {
    if (typeof v === "number") {
      return parseNumberValue(v);
    }
    if (typeof v === "string") {
      return parseStringValue(v);
    }
    return v; // Assume it's already an Integer object.
  }


  // --- Initialize Integer object properties ---

  // Pre-instantiate small integers for performance.
  for (var i = 0; i < 1e3; i++) {
    Integer[i] = new SmallInteger(i);
    if (i > 0) Integer[-i] = new SmallInteger(-i);
  }

  // Common constants.
  Integer.one = Integer[1];
  Integer.zero = Integer[0];
  Integer.minusOne = Integer[-1];

  // Expose utility functions.
  Integer.max = max;
  Integer.min = min;
  Integer.gcd = gcd;
  Integer.lcm = lcm;

  // Type checking.
  Integer.isInstance = function (x) {
    return x instanceof BigInteger || x instanceof SmallInteger;
  };

  // Random number generation.
  Integer.randBetween = randBetween;

  // Custom base parsing from array.
  Integer.fromArray = function (digits, base, isNegative) {
    return parseBaseFromArray(digits.map(parseValue), parseValue(base || 10), isNegative);
  };

  return Integer;
}();


// GET utility for parsing input from stdin.
var GET = (function () {

  /**
   * Factory function to create a new GET parser instance.
   * @param {string} s - The input string (e.g., from stdin).
   * @returns {g} A new GET parser object.
   */
  function f(s) {
    return new g(s);
  }

  /**
   * GET parser constructor.
   * @param {string} s - The input string.
   */
  function g(s) {
    this._s = s.trim().split("\n"); // Split input into lines.
    this._y = 0; // Current line index.
  }

  /**
   * Reads a single value from the current line.
   * If the line contains multiple values, it pops them from the end.
   * @param {boolean} [f] - If true, return as string; otherwise, as number.
   * @returns {string|number} The parsed value.
   */
  g.prototype.a = function (f) {
    var s = this._s,
      y = this._y,
      r;
    if (typeof s[y] === "string") {
      s[y] = s[y].split(" ").reverse(); // Split line into words and reverse for easy popping.
    }
    r = s[y].pop(); // Get the last element (original first).
    if (!s[y].length) {
      this._y++; // Move to next line if current line is empty.
    }
    return f ? r : +r; // Convert to number unless f is true.
  };

  /**
   * Reads an entire line as an array of values.
   * @param {boolean} [f] - If true, return as array of strings; otherwise, as numbers.
   * @returns {string[]|number[]} The array of values.
   */
  g.prototype.l = function (f) {
    var s = this._s[this._y++].split(" "); // Get line, split, and advance line index.
    return f ? s : s.map(a => +a); // Convert to numbers unless f is true.
  };

  /**
   * Reads `n` lines as a 2D array (matrix).
   * @param {number} n - The number of lines to read.
   * @param {boolean} [f] - If true, return as array of string arrays; otherwise, as number arrays.
   * @returns {string[][]|number[][]} The 2D array.
   */
  g.prototype.m = function (n, f) {
    var r = this._s.slice(this._y, this._y += n).map(a => a.split(" ")); // Slice n lines, split each.
    return f ? r : r.map(a => a.map(a => +a)); // Convert to numbers unless f is true.
  };

  /**
   * Reads `n` lines as a 1D array, where each line contains a single value.
   * @param {number} n - The number of lines to read.
   * @param {boolean} [f] - If true, return as array of strings; otherwise, as numbers.
   * @returns {string[]|number[]} The 1D array.
   */
  g.prototype.r = function (n, f) {
    var r = this._s.slice(this._y, this._y += n); // Slice n lines.
    return f ? r : r.map(a => +a); // Convert to numbers unless f is true.
  };

  return f;
})();


// Initialize GET parser with input from stdin.
var o = GET(require("fs").readFileSync("/dev/stdin", "utf8"));


/**
 * Creates a multi-dimensional array initialized with a value or a nested structure.
 * This function uses `eval` for dynamic array creation based on arguments.
 * Example: xArray(0, 3, 4) creates a 3x4 matrix of zeros.
 * @param {*} v - The initial value for the innermost elements.
 * @param {...number} dimensions - The dimensions of the array (e.g., d1, d2, d3...).
 * @returns {Array} The dynamically created multi-dimensional array.
 */
function xArray(v) {
  var a = arguments,
    l = a.length,
    r = "Array(a[" + --l + "]).fill(0).map(x=>{return " + v + ";})"; // Innermost array.
  while (--l) {
    r = "Array(a[" + l + "]).fill(0).map(x=>" + r + ")"; // Nest arrays.
  }
  return eval(r); // Evaluate the generated string to create the array.
}


var mod; // Global variable to store the modulus.
var bi = bigInt(); // Initialize a bigInt object (defaults to 0).


/**
 * Performs modular multiplication of multiple arguments.
 * Effectively calculates (arg1 * arg2 * ... * argN) % mod.
 * Uses properties of modular arithmetic for large numbers to prevent overflow.
 * @param {...number} a - Numbers to multiply. The first argument is the initial product.
 * @returns {number} The result of modular multiplication.
 */
function abmod() {
  for (var a = arguments, r = a[0], i = 1; i < a.length;) {
    // Split r into two 16-bit parts to prevent overflow during intermediate multiplication.
    // (r >> 16) * a[i] % mod * 65536 + (r & 65535) * a[i++]
    r = ((r >> 16) * a[i] % mod * 65536 + (r & 65535) * a[i++]) % mod;
  }
  return r;
}


/**
 * Performs modular exponentiation (a^n % mod) using exponentiation by squaring.
 * @param {number} a - The base.
 * @param {number} n - The exponent.
 * @returns {number} The result of a^n % mod.
 */
function powmod(a, n) {
  for (var r = 1; n; a = abmod(a, a), n >>= 1) { // While n > 0, square a, halve n.
    if (n & 1) { // If n is odd.
      r = abmod(a, r); // Multiply result by a.
    }
  }
  return r;
}


// Output the result of the main function.
console.log(main());


/**
 * Main function containing the problem logic.
 * Reads input values L, A, B, and mod.
 * Performs calculations involving BigInts and matrix operations modulo `mod`.
 * @returns {number} The final calculated answer.
 */
function main() {
  // Read input values.
  var L = o.a(1); // Length L (as number).
  var A = o.a(1); // Starting value A (as number).
  var B = o.a(1); // Increment B (as number).

  // Convert L, A, B to BigInts.
  var l = bi.add(L);
  var a = bi.add(A);
  var b = bi.add(B);

  // Read modulus `mod` and re-cast L, A, B to numbers for `powmod` etc.
  mod = o.a(), L = +L, A = +A, B = +B;

  // Initialize a 19-element array `d` with BigInts.
  // The actual dimensions are 19, and elements are BigInt objects (implicitly 0 initially).
  var d = xArray(bi, 19);

  // Initialize `ans` as a 1x3 matrix for results, with b mod mod in the last position.
  var ans = [
    [0, 0, +b.mod(mod)]
  ];

  // `s` represents the current sum, initialized to bigInt(0).
  var s = bi;

  // Loop through powers of 10 up to 10^18 (represented by i=1 to 18).
  // The loop continues as long as `s` is less than `l`.
  for (var i = 1; i < 19 && !s.minus(l).isZero(); i++) {
    // `t` represents 10^i - 1.
    var t = bi.add(10).pow(i).minus(1);

    // Calculate `d[i]`: ( (10^i - 1 - a + b) / b ) - s.
    // This looks like a calculation of how many numbers of `i` digits can be formed
    // starting from `s` given an arithmetic progression.
    d[i] = t.minus(a).add(b).divide(b).minus(s);

    if (d[i].isZero()) {
      continue; // Skip if no numbers are added for this digit length.
    }

    // Adjust `d[i]` if `s + d[i]` exceeds `l`.
    if (s.add(d[i]).gt(l)) {
      d[i] = l.minus(s);
    }

    // Construct the transformation matrix `m` for this step.
    // It's a 3x3 matrix representing some recurrence relation.
    var m = [
      [powmod(10, i), 0, 0],
      [1, 1, 0],
      [0, 1, 1]
    ];

    // Raise the transformation matrix to the power of `d[i]` (number of steps for this digit length).
    var r = matrixPowMod(m, d[i]);

    // Update the second element of `ans` based on `b`, `s`, `a`, and `mod`.
    // This seems to be calculating a sum of an arithmetic progression.
    ans[0][1] = +b.times(s).add(a).mod(mod);

    // Multiply the current `ans` matrix (1x3) by the transformation matrix `r` (3x3).
    ans = matrixMultipleMod(ans, r);

    // Update `s` by adding `d[i]`.
    s = s.add(d[i]);
  }

  // The final answer is the first element of the resulting 1x3 matrix.
  return ans[0][0];
}


/**
 * Performs modular matrix exponentiation (m^p % mod).
 * Uses binary exponentiation (exponentiation by squaring) for matrices.
 * @param {number[][]} m - The square base matrix.
 * @param {BigInt} p - The BigInt exponent.
 * @returns {number[][]} The resulting matrix (m^p % mod).
 */
function matrixPowMod(m, p) {
  var l = m.length; // Dimension of the square matrix.
  var r = xArray(0, l, l); // Initialize result matrix as identity matrix.

  for (var i = 0; i < l; i++) {
    r[i][i] = 1; // Set diagonal elements to 1.
  }

  while (!p.isZero()) { // Loop while exponent p is not zero.
    if (!p.and(1).isZero()) { // If p is odd (p & 1).
      r = matrixMultipleMod(r, m); // Multiply result by base matrix.
    }
    m = matrixMultipleMod(m, m); // Square the base matrix.
    p = p.divide(2); // Halve the exponent.
  }
  return r;
}


/**
 * Performs modular matrix multiplication (a * b % mod).
 * `a` can be a 1D array (row vector) or a 2D array (matrix).
 * `b` can be a 1D array (column vector) or a 2D array (matrix).
 * @param {number[]|number[][]} a - The first matrix/vector.
 * @param {number[]|number[][]} b - The second matrix/vector.
 * @returns {number[][]} The resulting matrix.
 */
function matrixMultipleMod(a, b) {
  var x, y;

  // Normalize inputs to always be 2D arrays (matrices).
  if (typeof a[0] === "object") x = a;
  else x = [a]; // If `a` is a 1D array, treat it as a 1xN matrix.

  if (typeof b[0] === "object") y = b;
  else y = [b]; // If `b` is a 1D array, treat it as a 1xN matrix. This logic might be flawed for column vectors.
  // Assuming `b` is always intended as a matrix or `a` is 1xN and `b` is Nx1 or NxM.

  var h = x.length, // Number of rows in `x`.
    w = y[0].length; // Number of columns in `y`.

  var r = xArray(0, h, w); // Resulting matrix dimensions.

  for (var yi = 0; yi < h; yi++) { // Iterate through rows of `x`.
    for (var xi = 0; xi < w; xi++) { // Iterate through columns of `y`.
      for (var zi = 0; zi < y.length; zi++) { // Iterate through inner dimension (columns of `x`, rows of `y`).
        r[yi][xi] += abmod(x[yi][zi], y[zi][xi]); // Perform dot product of row `yi` of `x` and column `xi` of `y`.
      }
      r[yi][xi] %= mod; // Apply modulo to each element.
    }
  }
  return r;
}