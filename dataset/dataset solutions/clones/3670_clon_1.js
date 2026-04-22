var bigInt = function (undefined) {
  "use strict";

  // Base for internal array representation of big integers (10^7)
  var BASE = 1e7;
  // Logarithm of the base (log10(10^7) = 7)
  var LOG_BASE = 7;
  // Maximum safe integer in JavaScript (2^53 - 1)
  var MAX_INT = 9007199254740992;
  // Array representation of MAX_INT for comparisons
  var MAX_INT_ARR = smallToArray(MAX_INT);
  // Logarithm of MAX_INT, used for base conversion checks
  var LOG_MAX_INT = Math.log(MAX_INT);

  /**
   * Main constructor for Integer objects.
   * Handles parsing various input types.
   * @param {number|string|BigInteger|SmallInteger} v - The value to parse.
   * @param {number} [radix] - The base for string parsing.
   * @returns {BigInteger|SmallInteger} An Integer instance.
   */
  function Integer(v, radix) {
    if (typeof v === "undefined") {
      return Integer[0];
    }
    if (typeof radix !== "undefined") {
      // If radix is 10, parse as a decimal string, otherwise parse with base
      return +radix === 10 ? parseValue(v) : parseBase(v, radix);
    }
    return parseValue(v);
  }

  /**
   * Constructor for BigInteger objects.
   * Represents large integers as arrays of digits in BASE.
   * @param {number[]} value - Array of digits.
   * @param {boolean} sign - True if negative, false if positive.
   */
  function BigInteger(value, sign) {
    this.value = value;
    this.sign = sign;
    this.isSmall = false; // Flag to indicate it's a BigInteger
  }

  // BigInteger prototypes inherit from Integer prototypes
  BigInteger.prototype = Object.create(Integer.prototype);

  /**
   * Constructor for SmallInteger objects.
   * Represents integers that fit within JavaScript's safe integer range.
   * @param {number} value - The integer value.
   */
  function SmallInteger(value) {
    this.value = value;
    this.sign = value < 0;
    this.isSmall = true; // Flag to indicate it's a SmallInteger
  }

  // SmallInteger prototypes inherit from Integer prototypes
  SmallInteger.prototype = Object.create(Integer.prototype);

  /**
   * Checks if a number can be precisely represented by JavaScript.
   * @param {number} n - The number to check.
   * @returns {boolean} True if precise, false otherwise.
   */
  function isPrecise(n) {
    return -MAX_INT < n && n < MAX_INT;
  }

  /**
   * Converts a small JavaScript number to its array representation (base BASE).
   * @param {number} n - The number to convert.
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
   * Converts an array representation (base BASE) back to a small JavaScript number if possible.
   * @param {number[]} arr - Array of digits.
   * @returns {number|number[]} The number if small, otherwise the trimmed array.
   */
  function arrayToSmall(arr) {
    trim(arr); // Remove leading zeros
    var length = arr.length;
    if (length < 4 && compareAbs(arr, MAX_INT_ARR) < 0) {
      switch (length) {
        case 0:
          return 0;
        case 1:
          return arr[0];
        case 2:
          return arr[0] + arr[1] * BASE;
        default:
          return arr[0] + (arr[1] + arr[2] * BASE) * BASE;
      }
    }
    return arr;
  }

  /**
   * Removes leading zeros from a digit array.
   * @param {number[]} v - The array to trim.
   */
  function trim(v) {
    var i = v.length;
    while (v[--i] === 0) {
      /* empty */
    }
    v.length = i + 1;
  }

  /**
   * Creates an array of a given length, initialized with zeros.
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
   * Adds two digit arrays (representing positive numbers).
   * @param {number[]} a - First operand.
   * @param {number[]} b - Second operand.
   * @returns {number[]} The sum array.
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
   * Adds two digit arrays, handling different lengths by ensuring the longer array is first.
   * @param {number[]} a - First operand.
   * @param {number[]} b - Second operand.
   * @returns {number[]} The sum array.
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
   * @returns {number[]} The sum array.
   */
  function addSmall(a, carry) {
    var l = a.length,
      r = new Array(l),
      base = BASE,
      sum,
      i;
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

  /**
   * Adds a value to a BigInteger.
   * @param {BigInteger|SmallInteger|number|string} v - The value to add.
   * @returns {BigInteger} The sum.
   */
  BigInteger.prototype.add = function (v) {
    var n = parseValue(v);
    if (this.sign !== n.sign) {
      return this.subtract(n.negate());
    }
    var a = this.value,
      b = n.value;
    if (n.isSmall) {
      return new BigInteger(addSmall(a, Math.abs(b)), this.sign);
    }
    return new BigInteger(addAny(a, b), this.sign);
  };

  // Alias for add method
  BigInteger.prototype.plus = BigInteger.prototype.add;

  /**
   * Adds a value to a SmallInteger.
   * @param {BigInteger|SmallInteger|number|string} v - The value to add.
   * @returns {BigInteger|SmallInteger} The sum.
   */
  SmallInteger.prototype.add = function (v) {
    var n = parseValue(v);
    var a = this.value;
    if (a < 0 !== n.sign) {
      return this.subtract(n.negate());
    }
    var b = n.value;
    if (n.isSmall) {
      if (isPrecise(a + b)) {
        return new SmallInteger(a + b);
      }
      b = smallToArray(Math.abs(b));
    }
    return new BigInteger(addSmall(b, Math.abs(a)), a < 0);
  };

  // Alias for add method
  SmallInteger.prototype.plus = SmallInteger.prototype.add;

  /**
   * Subtracts two digit arrays (assuming a >= b).
   * @param {number[]} a - Minuend.
   * @param {number[]} b - Subtrahend.
   * @returns {number[]} The difference array.
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
    for (; i < a_l; i++) {
      r[i] = a[i];
    }
    trim(r);
    return r;
  }

  /**
   * Subtracts two digit arrays, handling order and sign.
   * @param {number[]} a - First operand.
   * @param {number[]} b - Second operand.
   * @param {boolean} sign - Initial sign guess.
   * @returns {BigInteger|SmallInteger} The difference.
   */
  function subtractAny(a, b, sign) {
    var value;
    if (compareAbs(a, b) >= 0) {
      value = subtract(a, b);
    } else {
      value = subtract(b, a);
      sign = !sign; // Flip sign if b was larger
    }
    value = arrayToSmall(value);
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
   * @param {number} b - The small number to subtract.
   * @param {boolean} sign - The sign of the result.
   * @returns {BigInteger|SmallInteger} The difference.
   */
  function subtractSmall(a, b, sign) {
    var l = a.length,
      r = new Array(l),
      carry = -b,
      base = BASE,
      i,
      difference;
    for (i = 0; i < l; i++) {
      difference = a[i] + carry;
      carry = Math.floor(difference / base);
      difference %= base;
      r[i] = difference < 0 ? difference + base : difference;
    }
    r = arrayToSmall(r);
    if (typeof r === "number") {
      if (sign) {
        r = -r;
      }
      return new SmallInteger(r);
    }
    return new BigInteger(r, sign);
  }

  /**
   * Subtracts a value from a BigInteger.
   * @param {BigInteger|SmallInteger|number|string} v - The value to subtract.
   * @returns {BigInteger} The difference.
   */
  BigInteger.prototype.subtract = function (v) {
    var n = parseValue(v);
    if (this.sign !== n.sign) {
      return this.add(n.negate());
    }
    var a = this.value,
      b = n.value;
    if (n.isSmall) {
      return subtractSmall(a, Math.abs(b), this.sign);
    }
    return subtractAny(a, b, this.sign);
  };

  // Alias for subtract method
  BigInteger.prototype.minus = BigInteger.prototype.subtract;

  /**
   * Subtracts a value from a SmallInteger.
   * @param {BigInteger|SmallInteger|number|string} v - The value to subtract.
   * @returns {BigInteger|SmallInteger} The difference.
   */
  SmallInteger.prototype.subtract = function (v) {
    var n = parseValue(v);
    var a = this.value;
    if (a < 0 !== n.sign) {
      return this.add(n.negate());
    }
    var b = n.value;
    if (n.isSmall) {
      return new SmallInteger(a - b);
    }
    return subtractSmall(b, Math.abs(a), a >= 0);
  };

  // Alias for subtract method
  SmallInteger.prototype.minus = SmallInteger.prototype.subtract;

  /**
   * Negates a BigInteger (flips its sign).
   * @returns {BigInteger} The negated BigInteger.
   */
  BigInteger.prototype.negate = function () {
    return new BigInteger(this.value, !this.sign);
  };

  /**
   * Negates a SmallInteger (flips its sign).
   * @returns {SmallInteger} The negated SmallInteger.
   */
  SmallInteger.prototype.negate = function () {
    var sign = this.sign;
    var small = new SmallInteger(-this.value);
    small.sign = !sign; // Ensure sign property is correct
    return small;
  };

  /**
   * Returns the absolute value of a BigInteger.
   * @returns {BigInteger} The absolute value.
   */
  BigInteger.prototype.abs = function () {
    return new BigInteger(this.value, false);
  };

  /**
   * Returns the absolute value of a SmallInteger.
   * @returns {SmallInteger} The absolute value.
   */
  SmallInteger.prototype.abs = function () {
    return new SmallInteger(Math.abs(this.value));
  };

  /**
   * Multiplies two digit arrays (long multiplication).
   * @param {number[]} a - First operand.
   * @param {number[]} b - Second operand.
   * @returns {number[]} The product array.
   */
  function multiplyLong(a, b) {
    var a_l = a.length,
      b_l = b.length,
      l = a_l + b_l,
      r = createArray(l),
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
        product = a_i * b_j + r[i + j];
        carry = Math.floor(product / base);
        r[i + j] = product - carry * base;
        r[i + j + 1] += carry;
      }
    }
    trim(r);
    return r;
  }

  /**
   * Multiplies a digit array by a small number.
   * @param {number[]} a - The digit array.
   * @param {number} b - The small number.
   * @returns {number[]} The product array.
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
   * Shifts a digit array left by n positions (effectively multiplying by BASE^n).
   * @param {number[]} x - The digit array.
   * @param {number} n - The number of positions to shift.
   * @returns {number[]} The shifted array.
   */
  function shiftLeft(x, n) {
    var r = [];
    while (n-- > 0) {
      r.push(0);
    }
    return r.concat(x);
  }

  /**
   * Multiplies two digit arrays using Karatsuba algorithm.
   * Optimized for larger numbers.
   * @param {number[]} x - First operand.
   * @param {number[]} y - Second operand.
   * @returns {number[]} The product array.
   */
  function multiplyKaratsuba(x, y) {
    var n = Math.max(x.length, y.length);
    if (n <= 30) {
      return multiplyLong(x, y);
    }
    n = Math.ceil(n / 2); // Split point

    // Split x into a (low part) and b (high part)
    var b = x.slice(n),
      a = x.slice(0, n);
    // Split y into c (low part) and d (high part)
    var d = y.slice(n),
      c = y.slice(0, n);

    // Recursively calculate products
    var ac = multiplyKaratsuba(a, c),
      bd = multiplyKaratsuba(b, d),
      abcd = multiplyKaratsuba(addAny(a, b), addAny(c, d));

    // Combine results
    var product = addAny(
      addAny(ac, shiftLeft(subtract(subtract(abcd, ac), bd), n)),
      shiftLeft(bd, 2 * n)
    );
    trim(product);
    return product;
  }

  /**
   * Heuristic to decide whether to use Karatsuba multiplication.
   * @param {number} l1 - Length of first array.
   * @param {number} l2 - Length of second array.
   * @returns {boolean} True if Karatsuba should be used.
   */
  function useKaratsuba(l1, l2) {
    return -0.012 * l1 - 0.012 * l2 + 15e-6 * l1 * l2 > 0;
  }

  /**
   * Multiplies a BigInteger by a value.
   * @param {BigInteger|SmallInteger|number|string} v - The value to multiply by.
   * @returns {BigInteger} The product.
   */
  BigInteger.prototype.multiply = function (v) {
    var n = parseValue(v),
      a = this.value,
      b = n.value,
      sign = this.sign !== n.sign,
      abs;
    if (n.isSmall) {
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
        return new BigInteger(multiplySmall(a, abs), sign);
      }
      b = smallToArray(abs);
    }
    if (useKaratsuba(a.length, b.length)) {
      return new BigInteger(multiplyKaratsuba(a, b), sign);
    }
    return new BigInteger(multiplyLong(a, b), sign);
  };

  // Alias for multiply method
  BigInteger.prototype.times = BigInteger.prototype.multiply;

  /**
   * Helper function to multiply a small number by a digit array.
   * @param {number} a - The small number.
   * @param {number[]} b - The digit array.
   * @param {boolean} sign - The sign of the result.
   * @returns {BigInteger} The product.
   */
  function multiplySmallAndArray(a, b, sign) {
    if (a < BASE) {
      return new BigInteger(multiplySmall(b, a), sign);
    }
    return new BigInteger(multiplyLong(b, smallToArray(a)), sign);
  }

  /**
   * Internal method for SmallInteger to multiply by another SmallInteger.
   * @param {SmallInteger} a - The other SmallInteger.
   * @returns {BigInteger|SmallInteger} The product.
   */
  SmallInteger.prototype._multiplyBySmall = function (a) {
    if (isPrecise(a.value * this.value)) {
      return new SmallInteger(a.value * this.value);
    }
    return multiplySmallAndArray(
      Math.abs(a.value),
      smallToArray(Math.abs(this.value)),
      this.sign !== a.sign
    );
  };

  /**
   * Internal method for BigInteger to multiply by a SmallInteger.
   * @param {SmallInteger} a - The SmallInteger.
   * @returns {BigInteger} The product.
   */
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

  /**
   * Multiplies a SmallInteger by a value.
   * @param {BigInteger|SmallInteger|number|string} v - The value to multiply by.
   * @returns {BigInteger|SmallInteger} The product.
   */
  SmallInteger.prototype.multiply = function (v) {
    return parseValue(v)._multiplyBySmall(this);
  };

  // Alias for multiply method
  SmallInteger.prototype.times = SmallInteger.prototype.multiply;

  /**
   * Squares a digit array.
   * @param {number[]} a - The digit array.
   * @returns {number[]} The squared array.
   */
  function square(a) {
    var l = a.length,
      r = createArray(l + l),
      base = BASE,
      product,
      carry,
      i,
      a_i,
      a_j;
    for (i = 0; i < l; i++) {
      a_i = a[i];
      carry = 0 - a_i * a_i; // Initialize carry with negative square
      for (var j = i; j < l; j++) {
        a_j = a[j];
        product = 2 * (a_i * a_j) + r[i + j] + carry;
        carry = Math.floor(product / base);
        r[i + j] = product - carry * base;
      }
      r[i + l] = carry;
    }
    trim(r);
    return r;
  }

  /**
   * Squares a BigInteger.
   * @returns {BigInteger} The squared BigInteger.
   */
  BigInteger.prototype.square = function () {
    return new BigInteger(square(this.value), false);
  };

  /**
   * Squares a SmallInteger.
   * @returns {BigInteger|SmallInteger} The squared SmallInteger.
   */
  SmallInteger.prototype.square = function () {
    var value = this.value * this.value;
    if (isPrecise(value)) {
      return new SmallInteger(value);
    }
    return new BigInteger(square(smallToArray(Math.abs(this.value))), false);
  };

  /**
   * Divides two digit arrays and returns quotient and remainder (Algorithm 1 from Knuth).
   * Efficient for smaller divisors.
   * @param {number[]} a - Dividend.
   * @param {number[]} b - Divisor.
   * @returns {number[][]} An array containing [quotient_array, remainder_array].
   */
  function divMod1(a, b) {
    var a_l = a.length,
      b_l = b.length,
      base = BASE,
      result = createArray(b.length),
      divisorMostSignificantDigit = b[b_l - 1],
      lambda = Math.ceil(base / (2 * divisorMostSignificantDigit)), // Normalization factor
      remainder = multiplySmall(a, lambda),
      divisor = multiplySmall(b, lambda),
      quotientDigit,
      shift,
      carry,
      borrow,
      i,
      l,
      q;

    if (remainder.length <= a_l) {
      remainder.push(0);
    }
    divisor.push(0); // Add a leading zero for easier calculations
    divisorMostSignificantDigit = divisor[b_l - 1]; // Update after normalization

    for (shift = a_l - b_l; shift >= 0; shift--) {
      quotientDigit = base - 1; // Initial guess for quotient digit
      if (remainder[shift + b_l] !== divisorMostSignificantDigit) {
        quotientDigit = Math.floor(
          (remainder[shift + b_l] * base + remainder[shift + b_l - 1]) /
            divisorMostSignificantDigit
        );
      }

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

      // Adjust quotient digit if guess was too high
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
   * Divides two digit arrays and returns quotient and remainder (Algorithm 2).
   * Slower but simpler for very large numbers or certain edge cases.
   * @param {number[]} a - Dividend.
   * @param {number[]} b - Divisor.
   * @returns {number[][]} An array containing [quotient_array, remainder_array].
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
      part.unshift(a[--a_l]); // Take next digit from dividend
      trim(part); // Remove leading zeros from current part

      if (compareAbs(part, b) < 0) {
        result.push(0); // Current part is too small, quotient digit is 0
        continue;
      }

      xlen = part.length;
      highx = part[xlen - 1] * base + part[xlen - 2];
      highy = b[b_l - 1] * base + b[b_l - 2];

      if (xlen > b_l) {
        highx = (highx + 1) * base; // Adjust for larger dividend part
      }

      guess = Math.ceil(highx / highy); // Estimate quotient digit

      do {
        check = multiplySmall(b, guess); // Check if guess is too high
        if (compareAbs(check, part) <= 0) {
          break;
        }
        guess--;
      } while (guess);

      result.push(guess);
      part = subtract(part, check); // Subtract multiple of divisor
    }

    result.reverse(); // Digits were pushed in reverse order
    return [arrayToSmall(result), arrayToSmall(part)];
  }

  /**
   * Divides a digit array by a small number.
   * @param {number[]} value - The digit array.
   * @param {number} lambda - The small divisor.
   * @returns {number[][]} An array containing [quotient_array, remainder].
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
   * Performs division and modulo operations for any BigInteger/SmallInteger.
   * @param {BigInteger|SmallInteger} self - The dividend.
   * @param {BigInteger|SmallInteger|number|string} v - The divisor.
   * @returns {BigInteger[]|SmallInteger[]} An array containing [quotient, remainder].
   */
  function divModAny(self, v) {
    var value,
      n = parseValue(v);
    var a = self.value,
      b = n.value;
    var quotient;

    if (b === 0) {
      throw new Error("Cannot divide by zero");
    }

    if (self.isSmall) {
      if (n.isSmall) {
        return [new SmallInteger(truncate(a / b)), new SmallInteger(a % b)];
      }
      return [Integer[0], self]; // Small dividend, large divisor -> quotient 0, remainder dividend
    }

    if (n.isSmall) {
      if (b === 1) {
        return [self, Integer[0]];
      }
      if (b === -1) {
        return [self.negate(), Integer[0]];
      }
      var abs = Math.abs(b);
      if (abs < BASE) {
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
      b = smallToArray(abs);
    }

    var comparison = compareAbs(a, b);
    if (comparison === -1) {
      return [Integer[0], self]; // Dividend smaller than divisor
    }
    if (comparison === 0) {
      return [Integer[self.sign === n.sign ? 1 : -1], Integer[0]]; // Dividend equals divisor
    }

    // Choose division algorithm based on length
    if (a.length + b.length <= 200) {
      value = divMod1(a, b);
    } else {
      value = divMod2(a, b);
    }

    quotient = value[0];
    var qSign = self.sign !== n.sign,
      mod = value[1],
      mSign = self.sign;

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

  /**
   * Calculates quotient and remainder of division.
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
   * Divides a BigInteger by a value, returning only the quotient.
   * @param {BigInteger|SmallInteger|number|string} v - The divisor.
   * @returns {BigInteger|SmallInteger} The quotient.
   */
  BigInteger.prototype.divide = function (v) {
    return divModAny(this, v)[0];
  };

  // Aliases for divide method
  SmallInteger.prototype.over = SmallInteger.prototype.divide =
    BigInteger.prototype.over =
    BigInteger.prototype.divide;

  /**
   * Calculates the remainder of division.
   * @param {BigInteger|SmallInteger|number|string} v - The divisor.
   * @returns {BigInteger|SmallInteger} The remainder.
   */
  BigInteger.prototype.mod = function (v) {
    return divModAny(this, v)[1];
  };

  // Aliases for mod method
  SmallInteger.prototype.remainder = SmallInteger.prototype.mod =
    BigInteger.prototype.remainder =
    BigInteger.prototype.mod;

  /**
   * Raises a BigInteger to the power of an exponent.
   * @param {BigInteger|SmallInteger|number|string} v - The exponent.
   * @returns {BigInteger|SmallInteger} The result.
   */
  BigInteger.prototype.pow = function (v) {
    var n = parseValue(v),
      a = this.value,
      b = n.value,
      value,
      x,
      y;

    if (b === 0) {
      return Integer[1]; // Any number to power 0 is 1
    }
    if (a === 0) {
      return Integer[0]; // 0 to any positive power is 0
    }
    if (a === 1) {
      return Integer[1]; // 1 to any power is 1
    }
    if (a === -1) {
      return n.isEven() ? Integer[1] : Integer[-1]; // -1 to even is 1, -1 to odd is -1
    }
    if (n.sign) {
      return Integer[0]; // Negative exponent means 1/x^abs(n), which is 0 for integers > 1
    }
    if (!n.isSmall) {
      throw new Error("The exponent " + n.toString() + " is too large.");
    }
    if (this.isSmall) {
      if (isPrecise((value = Math.pow(a, b)))) {
        return new SmallInteger(truncate(value));
      }
    }

    // Binary exponentiation (exponentiation by squaring)
    x = this; // Base
    y = Integer[1]; // Result accumulator
    while (true) {
      if ((b & 1) === 1) {
        y = y.times(x);
        --b;
      }
      if (b === 0) {
        break;
      }
      b /= 2;
      x = x.square();
    }
    return y;
  };

  // SmallInteger also uses the same pow logic
  SmallInteger.prototype.pow = BigInteger.prototype.pow;

  /**
   * Calculates (base^exponent) mod modulus.
   * @param {BigInteger|SmallInteger|number|string} exp - The exponent.
   * @param {BigInteger|SmallInteger|number|string} mod - The modulus.
   * @returns {BigInteger|SmallInteger} The result.
   */
  BigInteger.prototype.modPow = function (exp, mod) {
    exp = parseValue(exp);
    mod = parseValue(mod);

    if (mod.isZero()) {
      throw new Error("Cannot take modPow with modulus 0");
    }

    var r = Integer[1],
      base = this.mod(mod); // Reduce base modulo mod first

    while (exp.isPositive()) {
      if (base.isZero()) {
        return Integer[0]; // If base is 0, result is 0
      }
      if (exp.isOdd()) {
        r = r.multiply(base).mod(mod); // r = (r * base) % mod
      }
      exp = exp.divide(2); // exp = exp / 2
      base = base.square().mod(mod); // base = (base * base) % mod
    }
    return r;
  };

  // SmallInteger also uses the same modPow logic
  SmallInteger.prototype.modPow = BigInteger.prototype.modPow;

  /**
   * Compares the absolute values of two digit arrays.
   * @param {number[]} a - First array.
   * @param {number[]} b - Second array.
   * @returns {number} 1 if a > b, -1 if a < b, 0 if a == b.
   */
  function compareAbs(a, b) {
    if (a.length !== b.length) {
      return a.length > b.length ? 1 : -1;
    }
    // Compare digit by digit from most significant
    for (var i = a.length - 1; i >= 0; i--) {
      if (a[i] !== b[i]) {
        return a[i] > b[i] ? 1 : -1;
      }
    }
    return 0; // Arrays are equal
  }

  /**
   * Compares the absolute value of a BigInteger with another value.
   * @param {BigInteger|SmallInteger|number|string} v - The value to compare with.
   * @returns {number} 1 if this > v, -1 if this < v, 0 if this == v (absolute values).
   */
  BigInteger.prototype.compareAbs = function (v) {
    var n = parseValue(v),
      a = this.value,
      b = n.value;
    if (n.isSmall) {
      return 1; // A BigInteger is always 'larger' in representation than a SmallInteger
    }
    return compareAbs(a, b);
  };

  /**
   * Compares the absolute value of a SmallInteger with another value.
   * @param {BigInteger|SmallInteger|number|string} v - The value to compare with.
   * @returns {number} 1 if this > v, -1 if this < v, 0 if this == v (absolute values).
   */
  SmallInteger.prototype.compareAbs = function (v) {
    var n = parseValue(v),
      a = Math.abs(this.value),
      b = n.value;
    if (n.isSmall) {
      b = Math.abs(b);
      return a === b ? 0 : a > b ? 1 : -1;
    }
    return -1; // A SmallInteger is always 'smaller' in representation than a BigInteger
  };

  /**
   * Compares a BigInteger with another value.
   * @param {BigInteger|SmallInteger|number|string} v - The value to compare with.
   * @returns {number} 1 if this > v, -1 if this < v, 0 if this == v.
   */
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
      return n.sign ? 1 : -1; // Different signs: negative is smaller
    }
    if (n.isSmall) {
      return this.sign ? -1 : 1; // BigInteger vs SmallInteger of same sign
    }
    // Same sign, compare absolute values and adjust based on sign
    return compareAbs(a, b) * (this.sign ? -1 : 1);
  };

  // Alias for compare method
  BigInteger.prototype.compareTo = BigInteger.prototype.compare;

  /**
   * Compares a SmallInteger with another value.
   * @param {BigInteger|SmallInteger|number|string} v - The value to compare with.
   * @returns {number} 1 if this > v, -1 if this < v, 0 if this == v.
   */
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
      return a == b ? 0 : a > b ? 1 : -1;
    }
    if (a < 0 !== n.sign) {
      return a < 0 ? -1 : 1; // Different signs
    }
    return a < 0 ? 1 : -1; // Same sign, but SmallInteger vs BigInteger
  };

  // Alias for compare method
  SmallInteger.prototype.compareTo = SmallInteger.prototype.compare;

  /**
   * Checks if a BigInteger is equal to another value.
   * @param {BigInteger|SmallInteger|number|string} v - The value to compare with.
   * @returns {boolean} True if equal, false otherwise.
   */
  BigInteger.prototype.equals = function (v) {
    return this.compare(v) === 0;
  };

  // Aliases for equals method
  SmallInteger.prototype.eq = SmallInteger.prototype.equals =
    BigInteger.prototype.eq =
    BigInteger.prototype.equals;

  /**
   * Checks if a BigInteger is not equal to another value.
   * @param {BigInteger|SmallInteger|number|string} v - The value to compare with.
   * @returns {boolean} True if not equal, false otherwise.
   */
  BigInteger.prototype.notEquals = function (v) {
    return this.compare(v) !== 0;
  };

  // Aliases for notEquals method
  SmallInteger.prototype.neq = SmallInteger.prototype.notEquals =
    BigInteger.prototype.neq =
    BigInteger.prototype.notEquals;

  /**
   * Checks if a BigInteger is greater than another value.
   * @param {BigInteger|SmallInteger|number|string} v - The value to compare with.
   * @returns {boolean} True if greater, false otherwise.
   */
  BigInteger.prototype.greater = function (v) {
    return this.compare(v) > 0;
  };

  // Aliases for greater method
  SmallInteger.prototype.gt = SmallInteger.prototype.greater =
    BigInteger.prototype.gt =
    BigInteger.prototype.greater;

  /**
   * Checks if a BigInteger is less than another value.
   * @param {BigInteger|SmallInteger|number|string} v - The value to compare with.
   * @returns {boolean} True if less, false otherwise.
   */
  BigInteger.prototype.lesser = function (v) {
    return this.compare(v) < 0;
  };

  // Aliases for lesser method
  SmallInteger.prototype.lt = SmallInteger.prototype.lesser =
    BigInteger.prototype.lt =
    BigInteger.prototype.lesser;

  /**
   * Checks if a BigInteger is greater than or equal to another value.
   * @param {BigInteger|SmallInteger|number|string} v - The value to compare with.
   * @returns {boolean} True if greater or equal, false otherwise.
   */
  BigInteger.prototype.greaterOrEquals = function (v) {
    return this.compare(v) >= 0;
  };

  // Aliases for greaterOrEquals method
  SmallInteger.prototype.geq = SmallInteger.prototype.greaterOrEquals =
    BigInteger.prototype.geq =
    BigInteger.prototype.greaterOrEquals;

  /**
   * Checks if a BigInteger is less than or equal to another value.
   * @param {BigInteger|SmallInteger|number|string} v - The value to compare with.
   * @returns {boolean} True if less or equal, false otherwise.
   */
  BigInteger.prototype.lesserOrEquals = function (v) {
    return this.compare(v) <= 0;
  };

  // Aliases for lesserOrEquals method
  SmallInteger.prototype.leq = SmallInteger.prototype.lesserOrEquals =
    BigInteger.prototype.leq =
    BigInteger.prototype.lesserOrEquals;

  /**
   * Checks if a BigInteger is even.
   * @returns {boolean} True if even, false otherwise.
   */
  BigInteger.prototype.isEven = function () {
    return (this.value[0] & 1) === 0;
  };

  /**
   * Checks if a SmallInteger is even.
   * @returns {boolean} True if even, false otherwise.
   */
  SmallInteger.prototype.isEven = function () {
    return (this.value & 1) === 0;
  };

  /**
   * Checks if a BigInteger is odd.
   * @returns {boolean} True if odd, false otherwise.
   */
  BigInteger.prototype.isOdd = function () {
    return (this.value[0] & 1) === 1;
  };

  /**
   * Checks if a SmallInteger is odd.
   * @returns {boolean} True if odd, false otherwise.
   */
  SmallInteger.prototype.isOdd = function () {
    return (this.value & 1) === 1;
  };

  /**
   * Checks if a BigInteger is positive.
   * @returns {boolean} True if positive, false otherwise.
   */
  BigInteger.prototype.isPositive = function () {
    return !this.sign;
  };

  /**
   * Checks if a SmallInteger is positive.
   * @returns {boolean} True if positive, false otherwise.
   */
  SmallInteger.prototype.isPositive = function () {
    return this.value > 0;
  };

  /**
   * Checks if a BigInteger is negative.
   * @returns {boolean} True if negative, false otherwise.
   */
  BigInteger.prototype.isNegative = function () {
    return this.sign;
  };

  /**
   * Checks if a SmallInteger is negative.
   * @returns {boolean} True if negative, false otherwise.
   */
  SmallInteger.prototype.isNegative = function () {
    return this.value < 0;
  };

  /**
   * Checks if a BigInteger has an absolute value of 1.
   * @returns {boolean} True if |this| == 1, false otherwise.
   */
  BigInteger.prototype.isUnit = function () {
    return false; // By definition, BigIntegers are not units unless their value array is [1]
  };

  /**
   * Checks if a SmallInteger has an absolute value of 1.
   * @returns {boolean} True if |this| == 1, false otherwise.
   */
  SmallInteger.prototype.isUnit = function () {
    return Math.abs(this.value) === 1;
  };

  /**
   * Checks if a BigInteger is zero.
   * @returns {boolean} True if zero, false otherwise.
   */
  BigInteger.prototype.isZero = function () {
    return false; // A BigInteger cannot be zero (it would be a SmallInteger)
  };

  /**
   * Checks if a SmallInteger is zero.
   * @returns {boolean} True if zero, false otherwise.
   */
  SmallInteger.prototype.isZero = function () {
    return this.value === 0;
  };

  /**
   * Checks if a BigInteger is divisible by another value.
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
      return true; // Divisible by 1
    }
    if (value === 2) {
      return this.isEven();
    }
    return this.mod(n).equals(Integer[0]);
  };

  // SmallInteger also uses the same isDivisibleBy logic
  SmallInteger.prototype.isDivisibleBy = BigInteger.prototype.isDivisibleBy;

  /**
   * Checks if a number is a basic prime (2, 3, 5) or small prime.
   * @param {BigInteger|SmallInteger} v - The number to check.
   * @returns {boolean|undefined} True if prime, false if composite, undefined if needs further testing.
   */
  function isBasicPrime(v) {
    var n = v.abs();
    if (n.isUnit()) {
      return false; // 1 is not prime
    }
    if (n.equals(2) || n.equals(3) || n.equals(5)) {
      return true;
    }
    if (n.isEven() || n.isDivisibleBy(3) || n.isDivisibleBy(5)) {
      return false;
    }
    if (n.lesser(25)) {
      return true; // Primes less than 25 (excluding 2,3,5 already checked): 7, 11, 13, 17, 19, 23
    }
  }

  /**
   * Checks if a BigInteger is prime using Miller-Rabin test.
   * @returns {boolean} True if likely prime, false otherwise.
   */
  BigInteger.prototype.isPrime = function () {
    var isPrime = isBasicPrime(this);
    if (isPrime !== undefined) {
      return isPrime;
    }

    var n = this.abs(),
      nPrev = n.prev();
    var a = [2, 3, 5, 7, 11, 13, 17, 19],
      b = nPrev,
      d,
      t,
      i,
      x;

    // n-1 = 2^s * d, where d is odd
    while (b.isEven()) {
      b = b.divide(2);
    }

    // Miller-Rabin test with fixed bases
    for (i = 0; i < a.length; i++) {
      x = bigInt(a[i]).modPow(b, n);
      if (x.equals(Integer[1]) || x.equals(nPrev)) {
        continue;
      }

      for (t = true, d = b; t && d.lesser(nPrev); d = d.multiply(2)) {
        x = x.square().mod(n);
        if (x.equals(nPrev)) {
          t = false;
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
   * Checks if a BigInteger is probable prime using Miller-Rabin test with random bases.
   * @param {number} [iterations=5] - Number of iterations for the test.
   * @returns {boolean} True if probable prime, false otherwise.
   */
  BigInteger.prototype.isProbablePrime = function (iterations) {
    var isPrime = isBasicPrime(this);
    if (isPrime !== undefined) {
      return isPrime;
    }

    var n = this.abs();
    var t = iterations === undefined ? 5 : iterations;

    // Miller-Rabin test with random bases
    for (var i = 0; i < t; i++) {
      var a = bigInt.randBetween(2, n.minus(2));
      if (!a.modPow(n.prev(), n).isUnit()) {
        return false; // Composite
      }
    }
    return true; // Probable prime
  };

  // SmallInteger also uses the same isProbablePrime logic
  SmallInteger.prototype.isProbablePrime = BigInteger.prototype.isProbablePrime;

  /**
   * Computes the modular multiplicative inverse (this^-1 mod n).
   * Uses the extended Euclidean algorithm.
   * @param {BigInteger|SmallInteger|number|string} n - The modulus.
   * @returns {BigInteger|SmallInteger} The modular inverse.
   * @throws {Error} If this and n are not coprime.
   */
  BigInteger.prototype.modInv = function (n) {
    var t = bigInt.zero,
      newT = bigInt.one,
      r = parseValue(n),
      newR = this.abs(),
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

    if (t.compare(0) === -1) {
      t = t.add(n); // Ensure positive result
    }

    if (this.isNegative()) {
      return t.negate();
    }
    return t;
  };

  // SmallInteger also uses the same modInv logic
  SmallInteger.prototype.modInv = BigInteger.prototype.modInv;

  /**
   * Returns the next integer (this + 1).
   * @returns {BigInteger|SmallInteger} The next integer.
   */
  BigInteger.prototype.next = function () {
    var value = this.value;
    if (this.sign) {
      return subtractSmall(value, 1, this.sign); // If negative, adding 1 is like subtracting from absolute value
    }
    return new BigInteger(addSmall(value, 1), this.sign);
  };

  /**
   * Returns the next integer (this + 1).
   * @returns {BigInteger|SmallInteger} The next integer.
   */
  SmallInteger.prototype.next = function () {
    var value = this.value;
    if (value + 1 < MAX_INT) {
      return new SmallInteger(value + 1);
    }
    return new BigInteger(MAX_INT_ARR, false); // Overflow to BigInteger
  };

  /**
   * Returns the previous integer (this - 1).
   * @returns {BigInteger|SmallInteger} The previous integer.
   */
  BigInteger.prototype.prev = function () {
    var value = this.value;
    if (this.sign) {
      return new BigInteger(addSmall(value, 1), true); // If negative, subtracting 1 is like adding to absolute value
    }
    return subtractSmall(value, 1, this.sign);
  };

  /**
   * Returns the previous integer (this - 1).
   * @returns {BigInteger|SmallInteger} The previous integer.
   */
  SmallInteger.prototype.prev = function () {
    var value = this.value;
    if (value - 1 > -MAX_INT) {
      return new SmallInteger(value - 1);
    }
    return new BigInteger(MAX_INT_ARR, true); // Underflow to BigInteger (MAX_INT_ARR represents MAX_INT, so -MAX_INT is the smallest small integer)
  };

  // Powers of 2 used for bitwise operations (up to BASE)
  var powersOfTwo = [1];
  while (2 * powersOfTwo[powersOfTwo.length - 1] <= BASE) {
    powersOfTwo.push(2 * powersOfTwo[powersOfTwo.length - 1]);
  }
  var powers2Length = powersOfTwo.length,
    highestPower2 = powersOfTwo[powers2Length - 1];

  /**
   * Checks if a shift amount is small enough for direct JS number operations.
   * @param {number|string|BigInteger} n - The shift amount.
   * @returns {boolean} True if small, false otherwise.
   */
  function shift_isSmall(n) {
    return (
      (typeof n === "number" || typeof n === "string") &&
      +Math.abs(n) <= BASE ||
      (n instanceof BigInteger && n.value.length <= 1)
    );
  }

  /**
   * Performs a left bit shift (multiplication by 2^n).
   * @param {number|string|BigInteger} n - The shift amount.
   * @returns {BigInteger} The shifted BigInteger.
   * @throws {Error} If shift amount is too large.
   */
  BigInteger.prototype.shiftLeft = function (n) {
    if (!shift_isSmall(n)) {
      throw new Error(String(n) + " is too large for shifting.");
    }
    n = +n;
    if (n < 0) {
      return this.shiftRight(-n);
    }

    var result = this;
    if (result.isZero()) {
      return result;
    }

    // Repeatedly multiply by highestPower2 until n is small enough
    while (n >= powers2Length) {
      result = result.multiply(highestPower2);
      n -= powers2Length - 1; // powersOfTwo array is 0-indexed, so length-1 shifts by highestPower2
    }
    return result.multiply(powersOfTwo[n]);
  };

  // SmallInteger also uses the same shiftLeft logic
  SmallInteger.prototype.shiftLeft = BigInteger.prototype.shiftLeft;

  /**
   * Performs a right bit shift (division by 2^n).
   * @param {number|string|BigInteger} n - The shift amount.
   * @returns {BigInteger|SmallInteger} The shifted BigInteger.
   * @throws {Error} If shift amount is too large.
   */
  BigInteger.prototype.shiftRight = function (n) {
    var remQuo;
    if (!shift_isSmall(n)) {
      throw new Error(String(n) + " is too large for shifting.");
    }
    n = +n;
    if (n < 0) {
      return this.shiftLeft(-n);
    }

    var result = this;
    // Handle special cases for 0 or -1
    if (result.isZero() || (result.isNegative() && result.isUnit())) {
      return result;
    }

    // Repeatedly divide by highestPower2 until n is small enough
    while (n >= powers2Length) {
      remQuo = divModAny(result, highestPower2);
      result = remQuo[1].isNegative() ? remQuo[0].prev() : remQuo[0]; // Floor division for negative numbers
      n -= powers2Length - 1;
    }
    remQuo = divModAny(result, powersOfTwo[n]);
    return remQuo[1].isNegative() ? remQuo[0].prev() : remQuo[0]; // Floor division for negative numbers
  };

  // SmallInteger also uses the same shiftRight logic
  SmallInteger.prototype.shiftRight = BigInteger.prototype.shiftRight;

  /**
   * Performs a bitwise operation (AND, OR, XOR) on two integers.
   * @param {BigInteger|SmallInteger} x - First operand.
   * @param {BigInteger|SmallInteger|number|string} y - Second operand.
   * @param {function(number, number): number} fn - The bitwise function (e.g., `(a,b) => a & b`).
   * @returns {BigInteger|SmallInteger} The result.
   */
  function bitwise(x, y, fn) {
    y = parseValue(y);

    var xSign = x.isNegative(),
      ySign = y.isNegative();
    // For bitwise ops, negative numbers are treated as two's complement.
    // E.g., -5 is treated as ~4 (bitwise NOT 4)
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
        xDigit = highestPower2 - 1 - xDigit; // Two's complement for negative X
      }

      yDivMod = divModAny(yRem, highestPower2);
      yDigit = yDivMod[1].toJSNumber();
      if (ySign) {
        yDigit = highestPower2 - 1 - yDigit; // Two's complement for negative Y
      }

      xRem = xDivMod[0];
      yRem = yDivMod[0];

      result.push(fn(xDigit, yDigit)); // Apply bitwise function
    }

    // Determine sign of the result based on the most significant "bit" (highestPower2 block)
    // If the most significant block is all 1s (after the operation), it's negative.
    var sum = fn(xSign ? 1 : 0, ySign ? 1 : 0) !== 0 ? bigInt(-1) : bigInt(0);

    // Reconstruct the result from digits
    for (var i = result.length - 1; i >= 0; i -= 1) {
      sum = sum.multiply(highestPower2).add(bigInt(result[i]));
    }
    return sum;
  }

  // Masks for rough LOB (Least Significant Bit) calculation
  var LOBMASK_I = 1 << 30,
    LOBMASK_BI = (BASE & -BASE) * (BASE & -BASE) | LOBMASK_I;

  /**
   * Calculates the bitwise NOT of a BigInteger.
   * (~x = -x - 1)
   * @returns {BigInteger} The result.
   */
  BigInteger.prototype.not = function () {
    return this.negate().prev();
  };

  // SmallInteger also uses the same not logic
  SmallInteger.prototype.not = BigInteger.prototype.not;

  /**
   * Performs a bitwise AND operation.
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
   * Performs a bitwise OR operation.
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
   * Performs a bitwise XOR operation.
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

  /**
   * Calculates a rough Least Significant Bit (LSB) value.
   * Used as a heuristic for GCD.
   * @param {BigInteger|SmallInteger} n - The number.
   * @returns {number} A rough LSB value.
   */
  function roughLOB(n) {
    var v = n.value,
      x = typeof v === "number" ? v | LOBMASK_I : v[0] + v[1] * BASE | LOBMASK_BI;
    return x & -x;
  }

  /**
   * Calculates the integer logarithm of a value with a given base.
   * @param {BigInteger|SmallInteger} value - The number.
   * @param {BigInteger|SmallInteger} base - The base of the logarithm.
   * @returns {{p: BigInteger|SmallInteger, e: number}} Object with power and exponent.
   */
  function integerLogarithm(value, base) {
    if (base.compareTo(value) <= 0) {
      var tmp = integerLogarithm(value, base.square());
      var p = tmp.p;
      var e = tmp.e;
      var t = p.multiply(base);
      return t.compareTo(value) <= 0
        ? { p: t, e: e * 2 + 1 }
        : { p: p, e: e * 2 };
    }
    return { p: bigInt(1), e: 0 };
  }

  /**
   * Calculates the bit length (number of bits required to represent the number).
   * @returns {BigInteger|SmallInteger} The bit length.
   */
  BigInteger.prototype.bitLength = function () {
    var n = this;
    if (n.compareTo(bigInt(0)) < 0) {
      n = n.negate().subtract(bigInt(1)); // For negative numbers, bit length is for |n|-1
    }
    if (n.compareTo(bigInt(0)) === 0) {
      return bigInt(0);
    }
    return bigInt(integerLogarithm(n, bigInt(2)).e).add(bigInt(1));
  };

  // SmallInteger also uses the same bitLength logic
  SmallInteger.prototype.bitLength = BigInteger.prototype.bitLength;

  /**
   * Returns the maximum of two values.
   * @param {BigInteger|SmallInteger|number|string} a - First value.
   * @param {BigInteger|SmallInteger|number|string} b - Second value.
   * @returns {BigInteger|SmallInteger} The greater value.
   */
  function max(a, b) {
    a = parseValue(a);
    b = parseValue(b);
    return a.greater(b) ? a : b;
  }

  /**
   * Returns the minimum of two values.
   * @param {BigInteger|SmallInteger|number|string} a - First value.
   * @param {BigInteger|SmallInteger|number|string} b - Second value.
   * @returns {BigInteger|SmallInteger} The smaller value.
   */
  function min(a, b) {
    a = parseValue(a);
    b = parseValue(b);
    return a.lesser(b) ? a : b;
  }

  /**
   * Calculates the greatest common divisor (GCD) of two values.
   * Uses binary GCD algorithm.
   * @param {BigInteger|SmallInteger|number|string} a - First value.
   * @param {BigInteger|SmallInteger|number|string} b - Second value.
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

    var c = Integer[1],
      d,
      t;

    // Remove common factors of 2
    while (a.isEven() && b.isEven()) {
      d = Math.min(roughLOB(a), roughLOB(b));
      a = a.divide(d);
      b = b.divide(d);
      c = c.multiply(d);
    }

    // Remove factors of 2 from a (if any remain)
    while (a.isEven()) {
      a = a.divide(roughLOB(a));
    }

    do {
      // Remove factors of 2 from b (if any remain)
      while (b.isEven()) {
        b = b.divide(roughLOB(b));
      }

      // Ensure a <= b
      if (a.greater(b)) {
        t = b;
        b = a;
        a = t;
      }

      b = b.subtract(a); // b = b - a
    } while (!b.isZero());

    return c.isUnit() ? a : a.multiply(c);
  }

  /**
   * Calculates the least common multiple (LCM) of two values.
   * LCM(a,b) = |a*b| / GCD(a,b)
   * @param {BigInteger|SmallInteger|number|string} a - First value.
   * @param {BigInteger|SmallInteger|number|string} b - Second value.
   * @returns {BigInteger|SmallInteger} The LCM.
   */
  function lcm(a, b) {
    a = parseValue(a).abs();
    b = parseValue(b).abs();
    return a.divide(gcd(a, b)).multiply(b);
  }

  /**
   * Generates a random BigInteger between two inclusive bounds.
   * @param {BigInteger|SmallInteger|number|string} a - Lower bound.
   * @param {BigInteger|SmallInteger|number|string} b - Upper bound.
   * @returns {BigInteger|SmallInteger} A random integer.
   */
  function randBetween(a, b) {
    a = parseValue(a);
    b = parseValue(b);

    var low = min(a, b),
      high = max(a, b);
    var range = high.subtract(low).add(1); // Calculate range (inclusive)

    if (range.isSmall) {
      return low.add(Math.floor(Math.random() * range));
    }

    var length = range.value.length - 1;
    var result = [],
      restricted = true;

    // Generate random digits for the result
    for (var i = length; i >= 0; i--) {
      var top = restricted ? range.value[i] : BASE;
      var digit = truncate(Math.random() * top);
      result.unshift(digit);
      if (digit < top) {
        restricted = false; // Once a digit is less than the upper bound's digit, subsequent digits are unrestricted
      }
    }

    result = arrayToSmall(result);
    return low.add(
      typeof result === "number" ? new SmallInteger(result) : new BigInteger(result, false)
    );
  }

  /**
   * Parses a string representation of a number in a given base.
   * @param {string} text - The string to parse.
   * @param {number|BigInteger|SmallInteger|string} base - The base.
   * @returns {BigInteger|SmallInteger} The parsed integer.
   * @throws {Error} If text contains invalid digits for the base.
   */
  var parseBase = function (text, base) {
    var length = text.length;
    var i;
    var absBase = Math.abs(base);

    // Initial validation of digits for the given base
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

    // Optimized path for small bases (2-36) that fit in JS numbers
    if (2 <= base && base <= 36) {
      if (length <= LOG_MAX_INT / Math.log(base)) {
        var result = parseInt(text, base);
        if (isNaN(result)) {
          throw new Error(c + " is not a valid digit in base " + base + "."); // This 'c' will be undefined, but the original code has this
        }
        return new SmallInteger(parseInt(text, base));
      }
    }

    base = parseValue(base);
    var digits = [];
    var isNegative = text[0] === "-";

    // Parse digits, handling custom multi-digit "digits" like <10>
    for (i = isNegative ? 1 : 0; i < text.length; i++) {
      var c = text[i].toLowerCase(),
        charCode = c.charCodeAt(0);
      if (48 <= charCode && charCode <= 57) {
        digits.push(parseValue(c));
      } else if (97 <= charCode && charCode <= 122) {
        digits.push(parseValue(c.charCodeAt(0) - 87));
      } else if (c === "<") {
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
   * Converts an array of digits (parsed as BigInts) in a given base to a BigInt.
   * @param {BigInteger[]|SmallInteger[]} digits - Array of digits.
   * @param {BigInteger|SmallInteger} base - The base.
   * @param {boolean} isNegative - Whether the final number should be negative.
   * @returns {BigInteger|SmallInteger} The resulting integer.
   */
  function parseBaseFromArray(digits, base, isNegative) {
    var val = Integer[0],
      pow = Integer[1],
      i;
    // Horner's method: d_n * base^n + d_{n-1} * base^{n-1} + ... + d_0
    for (i = digits.length - 1; i >= 0; i--) {
      val = val.add(digits[i].times(pow));
      pow = pow.times(base);
    }
    return isNegative ? val.negate() : val;
  }

  /**
   * Converts a single digit (0-35) to its character representation.
   * For digits > 35, it uses <digit> format.
   * @param {number} digit - The digit.
   * @returns {string} The character representation.
   */
  function stringify(digit) {
    if (digit <= 35) {
      return "0123456789abcdefghijklmnopqrstuvwxyz".charAt(digit);
    }
    return "<" + digit + ">";
  }

  /**
   * Converts a BigInteger to an array of digits in a specified base.
   * @param {BigInteger|SmallInteger} n - The number to convert.
   * @param {BigInteger|SmallInteger} base - The target base.
   * @returns {{value: number[], isNegative: boolean}} Array of digits and sign.
   * @throws {Error} For invalid base.
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
        // -N in base -1 is a sequence of 1,0,1,0...
        return {
          value: [].concat.apply(
            [],
            Array.apply(null, Array(-n)).map(Array.prototype.valueOf, [1, 0])
          ),
          isNegative: false,
        };
      }
      // N in base -1 is a sequence of 0,1,0,1...
      var arr = Array.apply(null, Array(+n - 1)).map(Array.prototype.valueOf, [
        0,
        1,
      ]);
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
      return {
        value: Array.apply(null, Array(+n)).map(Number.prototype.valueOf, 1),
        isNegative: neg,
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
        digit = base.minus(digit).abs(); // Adjust for negative remainder
        left = left.next(); // Adjust quotient
      }
      out.push(digit.toJSNumber());
    }
    out.push(left.toJSNumber());

    return { value: out.reverse(), isNegative: neg };
  }

  /**
   * Converts a BigInteger to its string representation in a specified base.
   * @param {BigInteger|SmallInteger} n - The number to convert.
   * @param {BigInteger|SmallInteger} base - The target base.
   * @returns {string} The string representation.
   */
  function toBaseString(n, base) {
    var arr = toBase(n, base);
    return (arr.isNegative ? "-" : "") + arr.value.map(stringify).join("");
  }

  /**
   * Converts a BigInteger to an array of digits in a specified radix.
   * @param {number} [radix] - The target radix.
   * @returns {{value: number[], isNegative: boolean}} Array of digits and sign.
   */
  BigInteger.prototype.toArray = function (radix) {
    return toBase(this, radix);
  };

  // SmallInteger also uses the same toArray logic
  SmallInteger.prototype.toArray = function (radix) {
    return toBase(this, radix);
  };

  /**
   * Converts a BigInteger to its string representation.
   * @param {number} [radix=10] - The target radix.
   * @returns {string} The string representation.
   */
  BigInteger.prototype.toString = function (radix) {
    if (radix === undefined) {
      radix = 10;
    }
    if (radix !== 10) {
      return toBaseString(this, radix);
    }

    var v = this.value,
      l = v.length,
      str = String(v[--l]), // Start with most significant digit
      zeros = "0000000", // For padding
      digit;

    while (--l >= 0) {
      digit = String(v[l]);
      str += zeros.slice(digit.length) + digit; // Pad with leading zeros if necessary
    }
    var sign = this.sign ? "-" : "";
    return sign + str;
  };

  /**
   * Converts a SmallInteger to its string representation.
   * @param {number} [radix=10] - The target radix.
   * @returns {string} The string representation.
   */
  SmallInteger.prototype.toString = function (radix) {
    if (radix === undefined) {
      radix = 10;
    }
    if (radix != 10) {
      return toBaseString(this, radix);
    }
    return String(this.value);
  };

  /**
   * Converts a BigInteger to its JSON representation (string).
   * @returns {string} The string representation.
   */
  BigInteger.prototype.toJSON = SmallInteger.prototype.toJSON = function () {
    return this.toString();
  };

  /**
   * Converts a BigInteger to a JavaScript number (may lose precision).
   * @returns {number} The JavaScript number.
   */
  BigInteger.prototype.valueOf = function () {
    return parseInt(this.toString(), 10);
  };

  // Alias for valueOf method
  BigInteger.prototype.toJSNumber = BigInteger.prototype.valueOf;

  /**
   * Converts a SmallInteger to a JavaScript number.
   * @returns {number} The JavaScript number.
   */
  SmallInteger.prototype.valueOf = function () {
    return this.value;
  };

  // Alias for valueOf method
  SmallInteger.prototype.toJSNumber = SmallInteger.prototype.valueOf;

  /**
   * Parses a string value into a BigInteger or SmallInteger.
   * Handles scientific notation and decimal points (for integers).
   * @param {string} v - The string to parse.
   * @returns {BigInteger|SmallInteger} The parsed integer.
   * @throws {Error} For invalid integer strings.
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
        exp -= text.length - decimalPlace - 1; // Adjust exponent for decimal part
        text = text.slice(0, decimalPlace) + text.slice(decimalPlace + 1); // Remove decimal point
      }
      if (exp < 0) {
        throw new Error("Cannot include negative exponent part for integers");
      }
      text += new Array(exp + 1).join("0"); // Add trailing zeros for positive exponent
      v = text;
    }

    var isValid = /^([0-9][0-9]*)$/.test(v); // Ensure it's a valid integer string
    if (!isValid) {
      throw new Error("Invalid integer: " + v);
    }

    var r = [],
      max = v.length,
      l = LOG_BASE,
      min = max - l;

    // Convert string to digit array (base BASE)
    while (max > 0) {
      r.push(+v.slice(min, max));
      min -= l;
      if (min < 0) {
        min = 0;
      }
      max -= l;
    }
    trim(r);
    return new BigInteger(r, sign);
  }

  /**
   * Parses a number value into a BigInteger or SmallInteger.
   * @param {number} v - The number to parse.
   * @returns {BigInteger|SmallInteger} The parsed integer.
   * @throws {Error} If number is not an integer.
   */
  function parseNumberValue(v) {
    if (isPrecise(v)) {
      if (v !== truncate(v)) {
        throw new Error(v + " is not an integer.");
      }
      return new SmallInteger(v);
    }
    return parseStringValue(v.toString());
  }

  /**
   * Parses any value into a BigInteger or SmallInteger.
   * @param {BigInteger|SmallInteger|number|string} v - The value to parse.
   * @returns {BigInteger|SmallInteger} The parsed integer.
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

  // Pre-instantiate SmallInteger objects for common small integers (0-999)
  for (var i = 0; i < 1e3; i++) {
    Integer[i] = new SmallInteger(i);
    if (i > 0) {
      Integer[-i] = new SmallInteger(-i);
    }
  }

  // Expose common constants and utility functions
  Integer.one = Integer[1];
  Integer.zero = Integer[0];
  Integer.minusOne = Integer[-1];

  Integer.max = max;
  Integer.min = min;
  Integer.gcd = gcd;
  Integer.lcm = lcm;

  /**
   * Checks if an object is an instance of BigInteger or SmallInteger.
   * @param {*} x - The object to check.
   * @returns {boolean} True if it's an Integer instance, false otherwise.
   */
  Integer.isInstance = function (x) {
    return x instanceof BigInteger || x instanceof SmallInteger;
  };

  Integer.randBetween = randBetween;

  /**
   * Creates an Integer from an array of digits in a given base.
   * @param {number[]|string[]|BigInteger[]|SmallInteger[]} digits - Array of digits.
   * @param {number|string|BigInteger|SmallInteger} [base=10] - The base.
   * @param {boolean} [isNegative] - Whether the number is negative.
   * @returns {BigInteger|SmallInteger} The created integer.
   */
  Integer.fromArray = function (digits, base, isNegative) {
    return parseBaseFromArray(
      digits.map(parseValue),
      parseValue(base || 10),
      isNegative
    );
  };

  return Integer;
}();

// Initialize `bi` as the bigInt factory function
var bi = bigInt();

/**
 * Main function to solve the problem.
 * Reads input from a string, processes it, and prints results.
 * @param {string} s - The input string containing test cases.
 */
function Main(s) {
  // Split input string into lines
  s = s.split("\n");

  // Parse the number of test cases
  var t = +s[0];

  // Iterate through each test case
  for (var i = 1; i <= t; i++) {
    // Split the current line into parts
    var a_parts = s[i].split(" ");

    // Parse the numbers using the bigInt library
    var b = bi.add(a_parts[1]),
      c = bi.add(a_parts[2]),
      d = bi.add(a_parts[3]);
    var a = bi.add(a_parts[0]);

    // First set of conditions
    if (a.lt(b) || d.lt(b)) {
      console.log("No");
      continue; // Move to the next test case
    }

    // Second set of conditions
    if (b.leq(c.minus(1))) {
      console.log("Yes");
      continue; // Move to the next test case
    }

    // Calculate remainder of a divided by b
    var m = a.mod(b);

    // Third set of conditions
    if (c.lt(m)) {
      console.log("No");
      continue; // Move to the next test case
    }

    // Calculate GCD of b and d
    var g = bigInt.gcd(b, d);

    // Calculate remainder of m divided by g
    m = m.mod(g);

    // Final condition based on a complex expression
    if (c.minus(m).divide(g).multiply(g).add(m).add(g).lt(b)) {
      console.log("No");
    } else {
      console.log("Yes");
    }
  }
}

// Read input from stdin and pass it to the Main function
Main(require("fs").readFileSync("/dev/stdin", "utf8"));