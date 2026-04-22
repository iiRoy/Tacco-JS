"use strict" /* This is a type I clone of the original JavaScript code.
 * All identifiers, variable names, function names, operators, and expressions
 * remain completely unchanged.
 * Only whitespace (indentation, spacing, blank lines) and comments
 * have been extensively modified to create a visually different,
 * but functionally identical, clone.
 */
var bigInt = function (undefined) {
  "use strict";

  // Base for big integer arithmetic operations
  var BASE = 1e7;

  // Logarithm of the base
  var LOG_BASE = 7;

  // Maximum safe integer in JavaScript
  var MAX_INT = 9007199254740992;

  // MAX_INT represented as an array of base-1e7 digits
  var MAX_INT_ARR = smallToArray(MAX_INT);

  // Logarithm of MAX_INT, useful for base conversion checks
  var LOG_MAX_INT = Math.log(MAX_INT);

  /**
   * Main Integer constructor function.
   * @param {number|string|BigInteger|SmallInteger} v - The value to parse.
   * @param {number} [radix] - The radix for string representation.
   * @returns {BigInteger|SmallInteger} A new Integer instance.
   */
  function Integer (v, radix) {
    // If no value is provided, return the zero constant.
    if (typeof v === "undefined") {
      return Integer[0];
    }

    // If a radix is specified, parse the value accordingly.
    if (typeof radix !== "undefined") {
      // If radix is 10, use standard parsing; otherwise, parse based on the given radix.
      return (+radix === 10) ? parseValue(v) : parseBase(v, radix);
    }

    // Default parsing for numbers or strings.
    return parseValue(v);
  }

  /**
   * Represents a large integer.
   * @param {number[]} value - An array of digits representing the number.
   * @param {boolean} sign - True if the number is negative, false otherwise.
   */
  function BigInteger (value, sign) {
    this.value = value;
    this.sign = sign;
    this.isSmall = false; // Flag to indicate if it's a small integer.
  }

  // BigInteger instances inherit from Integer.
  BigInteger.prototype = Object.create(Integer.prototype);

  /**
   * Represents a small integer that fits within JavaScript's safe integer range.
   * @param {number} value - The numerical value.
   */
  function SmallInteger (value) {
    this.value = value;
    this.sign = value < 0; // Determine sign based on value.
    this.isSmall = true; // Flag to indicate it's a small integer.
  }

  // SmallInteger instances also inherit from Integer.
  SmallInteger.prototype = Object.create(Integer.prototype);


  // Helper function to check if a number is precisely representable by JS number type.
  function isPrecise (n) {
    return -MAX_INT < n && n < MAX_INT;
  }

  // Converts a small JavaScript number into an array of base-1e7 digits.
  function smallToArray (n) {
    if (n < BASE) {
      return [n];
    }
    if (n < BASE * BASE) {
      return [n % BASE, Math.floor(n / BASE)];
    }
    return [n % BASE, Math.floor(n / BASE) % BASE, Math.floor(n / (BASE * BASE))];
  }

  // Converts an array of base-1e7 digits back to a small JavaScript number if possible.
  function arrayToSmall (arr) {
    trim(arr); // Remove leading zeros.
    var length = arr.length;

    // If the array is short and represents a number within MAX_INT.
    if (length < 4 && compareAbs(arr, MAX_INT_ARR) < 0) {
      switch (length) {
        case 0:
          return 0; // Empty array means zero.
        case 1:
          return arr[0];
        case 2:
          return arr[0] + arr[1] * BASE;
        default:
          return arr[0] + (arr[1] + arr[2] * BASE) * BASE;
      }
    }
    return arr; // Return array if it's too large for a small integer.
  }

  // Removes leading zeros from a digit array.
  function trim (v) {
    var i = v.length;
    while (v[--i] === 0); // Find the first non-zero digit from the end.
    v.length = i + 1; // Trim the array.
  }

  // Creates an array filled with zeros.
  function createArray (length) {
    var x = new Array(length);
    var i = -1;
    while (++i < length) {
      x[i] = 0;
    }
    return x;
  }

  // Truncates a number (removes decimal part).
  function truncate (n) {
    if (n > 0) {
      return Math.floor(n);
    }
    return Math.ceil(n);
  }

  // Adds two digit arrays (representing positive numbers).
  function add (a, b) {
    var l_a = a.length,
      l_b = b.length,
      r = new Array(l_a),
      carry = 0,
      base = BASE,
      sum, i;

    // Add digits up to the length of the shorter array.
    for (i = 0; i < l_b; i++) {
      sum = a[i] + b[i] + carry;
      carry = sum >= base ? 1 : 0;
      r[i] = sum - carry * base;
    }

    // Continue adding for the remaining digits of the longer array.
    while (i < l_a) {
      sum = a[i] + carry;
      carry = sum === base ? 1 : 0;
      r[i++] = sum - carry * base;
    }

    // If there's a final carry, push it to the result.
    if (carry > 0) {
      r.push(carry);
    }
    return r;
  }

  // Adds two digit arrays, ensuring the first argument is always the longer one.
  function addAny (a, b) {
    if (a.length >= b.length) {
      return add(a, b);
    }
    return add(b, a);
  }

  // Adds a small number (carry) to a digit array.
  function addSmall (a, carry) {
    var l = a.length,
      r = new Array(l),
      base = BASE,
      sum, i;

    // Iterate through digits, adding carry.
    for (i = 0; i < l; i++) {
      sum = a[i] - base + carry; // Subtract base to handle potential overflow from previous digit.
      carry = Math.floor(sum / base);
      r[i] = sum - carry * base;
      carry += 1; // Adjust carry for next iteration.
    }

    // Propagate any remaining carry.
    while (carry > 0) {
      r[i++] = carry % base;
      carry = Math.floor(carry / base);
    }
    return r;
  }

  // BigInteger addition method.
  BigInteger.prototype.add = function (v) {
    var n = parseValue(v); // Parse the operand.

    // If signs are different, perform subtraction.
    if (this.sign !== n.sign) {
      return this.subtract(n.negate());
    }

    var a = this.value,
      b = n.value;

    // If the other operand is small, use optimized addSmall.
    if (n.isSmall) {
      return new BigInteger(addSmall(a, Math.abs(b)), this.sign);
    }

    // Otherwise, use general addAny.
    return new BigInteger(addAny(a, b), this.sign);
  };

  // Alias for addition.
  BigInteger.prototype.plus = BigInteger.prototype.add;

  // SmallInteger addition method.
  SmallInteger.prototype.add = function (v) {
    var n = parseValue(v);
    var a = this.value;

    // If signs are different (for positive `a`, negative `n` or vice-versa)
    // and `a` is not negative (or `n.sign` is false, i.e., `n` is positive)
    // then subtract n.negate().
    if (a < 0 !== n.sign) {
      return this.subtract(n.negate());
    }

    var b = n.value;

    // If both are small, try direct addition.
    if (n.isSmall) {
      if (isPrecise(a + b)) {
        return new SmallInteger(a + b);
      }
      b = smallToArray(Math.abs(b)); // Convert small `b` to array if sum overflows.
    }

    // If `n` is BigInteger or sum overflows, use BigInteger arithmetic.
    return new BigInteger(addSmall(b, Math.abs(a)), a < 0);
  };

  // Alias for addition.
  SmallInteger.prototype.plus = SmallInteger.prototype.add;

  // Subtracts digit array `b` from `a` (assuming a >= b, non-negative).
  function subtract (a, b) {
    var a_l = a.length,
      b_l = b.length,
      r = new Array(a_l),
      borrow = 0,
      base = BASE,
      i, difference;

    // Subtract digit by digit.
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

    // Propagate borrow for remaining digits of `a`.
    for (i = b_l; i < a_l; i++) {
      difference = a[i] - borrow;
      if (difference < 0) {
        difference += base;
      } else {
        r[i++] = difference;
        break; // No more borrow, can copy remaining digits.
      }
      r[i] = difference;
    }

    // Copy remaining digits of `a`.
    for (; i < a_l; i++) {
      r[i] = a[i];
    }

    trim(r); // Remove leading zeros.
    return r;
  }

  // Subtracts any two BigIntegers, handling signs and order.
  function subtractAny (a, b, sign) {
    var value;

    // Ensure `a` is the larger (absolute) number for subtraction.
    if (compareAbs(a, b) >= 0) {
      value = subtract(a, b);
    } else {
      value = subtract(b, a);
      sign = !sign; // Flip sign if order was swapped.
    }

    value = arrayToSmall(value); // Try to convert to SmallInteger.

    // Return SmallInteger if possible.
    if (typeof value === "number") {
      if (sign) {
        value = -value;
      }
      return new SmallInteger(value);
    }

    // Return BigInteger otherwise.
    return new BigInteger(value, sign);
  }

  // Subtracts a small number from a digit array, handling sign.
  function subtractSmall (a, b, sign) {
    var l = a.length,
      r = new Array(l),
      carry = -b, // Initialize carry with the small number to subtract.
      base = BASE,
      i, difference;

    for (i = 0; i < l; i++) {
      difference = a[i] + carry;
      carry = Math.floor(difference / base);
      difference %= base;
      r[i] = difference < 0 ? difference + base : difference; // Ensure positive digit.
    }

    r = arrayToSmall(r); // Try converting to SmallInteger.

    // Return SmallInteger if possible.
    if (typeof r === "number") {
      if (sign) {
        r = -r;
      }
      return new SmallInteger(r);
    }

    // Return BigInteger otherwise.
    return new BigInteger(r, sign);
  }

  // BigInteger subtraction method.
  BigInteger.prototype.subtract = function (v) {
    var n = parseValue(v); // Parse the operand.

    // If signs are different, convert to addition.
    if (this.sign !== n.sign) {
      return this.add(n.negate());
    }

    var a = this.value,
      b = n.value;

    // If the other operand is small, use optimized subtractSmall.
    if (n.isSmall) {
      return subtractSmall(a, Math.abs(b), this.sign);
    }

    // Otherwise, use general subtractAny.
    return subtractAny(a, b, this.sign);
  };

  // Alias for subtraction.
  BigInteger.prototype.minus = BigInteger.prototype.subtract;

  // SmallInteger subtraction method.
  SmallInteger.prototype.subtract = function (v) {
    var n = parseValue(v);
    var a = this.value;

    // If signs are different, convert to addition.
    if (a < 0 !== n.sign) {
      return this.add(n.negate());
    }

    var b = n.value;

    // If both are small, try direct subtraction.
    if (n.isSmall) {
      return new SmallInteger(a - b);
    }

    // If `n` is BigInteger, use BigInteger subtraction logic.
    return subtractSmall(b, Math.abs(a), a >= 0);
  };

  // Alias for subtraction.
  SmallInteger.prototype.minus = SmallInteger.prototype.subtract;

  // BigInteger negation.
  BigInteger.prototype.negate = function () {
    return new BigInteger(this.value, !this.sign);
  };

  // SmallInteger negation.
  SmallInteger.prototype.negate = function () {
    var sign = this.sign;
    var small = new SmallInteger(-this.value);
    small.sign = !sign;
    return small;
  };

  // BigInteger absolute value.
  BigInteger.prototype.abs = function () {
    return new BigInteger(this.value, false);
  };

  // SmallInteger absolute value.
  SmallInteger.prototype.abs = function () {
    return new SmallInteger(Math.abs(this.value));
  };

  // Multiplies two digit arrays (long multiplication).
  function multiplyLong (a, b) {
    var a_l = a.length,
      b_l = b.length,
      l = a_l + b_l,
      r = createArray(l), // Result array, max length is sum of input lengths.
      base = BASE,
      product, carry, i, a_i, b_j;

    for (i = 0; i < a_l; ++i) {
      a_i = a[i];
      for (var j = 0; j < b_l; ++j) {
        b_j = b[j];
        product = a_i * b_j + r[i + j]; // Current digit product + carry from previous.
        carry = Math.floor(product / base);
        r[i + j] = product - carry * base; // Store current digit.
        r[i + j + 1] += carry; // Add carry to next position.
      }
    }

    trim(r); // Remove leading zeros.
    return r;
  }

  // Multiplies a digit array by a small number.
  function multiplySmall (a, b) {
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

    // Propagate any remaining carry.
    while (carry > 0) {
      r[i++] = carry % base;
      carry = Math.floor(carry / base);
    }
    return r;
  }

  // Shifts a digit array left by `n` positions (effectively multiplying by BASE^n).
  function shiftLeft (x, n) {
    var r = [];
    while (n-- > 0) {
      r.push(0); // Add zeros for shifting.
    }
    return r.concat(x);
  }

  // Karatsuba multiplication algorithm for large numbers.
  function multiplyKaratsuba (x, y) {
    var n = Math.max(x.length, y.length);

    // Base case: if numbers are small enough, use long multiplication.
    if (n <= 30) {
      return multiplyLong(x, y);
    }

    n = Math.ceil(n / 2); // Split point.

    // Split numbers into two halves.
    var b = x.slice(n),
      a = x.slice(0, n),
      d = y.slice(n),
      c = y.slice(0, n);

    // Recursively calculate products.
    var ac = multiplyKaratsuba(a, c),
      bd = multiplyKaratsuba(b, d),
      abcd = multiplyKaratsuba(addAny(a, b), addAny(c, d));

    // Combine results using Karatsuba formula.
    var product = addAny(addAny(ac, shiftLeft(subtract(subtract(abcd, ac), bd), n)), shiftLeft(bd, 2 * n));

    trim(product); // Clean up result.
    return product;
  }

  // Heuristic to decide whether to use Karatsuba multiplication.
  function useKaratsuba (l1, l2) {
    // This is an empirical formula.
    return -.012 * l1 - .012 * l2 + 15e-6 * l1 * l2 > 0;
  }

  // BigInteger multiplication method.
  BigInteger.prototype.multiply = function (v) {
    var n = parseValue(v),
      a = this.value,
      b = n.value,
      sign = this.sign !== n.sign, // Determine overall sign.
      abs;

    // If the other operand is small.
    if (n.isSmall) {
      if (b === 0) {
        return Integer[0]; // Multiply by zero is zero.
      }
      if (b === 1) {
        return this; // Multiply by one is self.
      }
      if (b === -1) {
        return this.negate(); // Multiply by negative one is negation.
      }

      abs = Math.abs(b);

      // If small operand fits within a single digit.
      if (abs < BASE) {
        return new BigInteger(multiplySmall(a, abs), sign);
      }

      b = smallToArray(abs); // Convert small operand to array.
    }

    // Choose multiplication algorithm based on size heuristic.
    if (useKaratsuba(a.length, b.length)) {
      return new BigInteger(multiplyKaratsuba(a, b), sign);
    }

    // Default to long multiplication.
    return new BigInteger(multiplyLong(a, b), sign);
  };

  // Alias for multiplication.
  BigInteger.prototype.times = BigInteger.prototype.multiply;

  // Multiplies a small number by a digit array, returning a BigInteger.
  function multiplySmallAndArray (a, b, sign) {
    if (a < BASE) {
      return new BigInteger(multiplySmall(b, a), sign);
    }
    // If 'a' is larger than BASE, treat it as an array.
    return new BigInteger(multiplyLong(b, smallToArray(a)), sign);
  }

  // SmallInteger internal multiplication by another small integer.
  SmallInteger.prototype._multiplyBySmall = function (a) {
    // If the result fits in a precise JS number.
    if (isPrecise(a.value * this.value)) {
      return new SmallInteger(a.value * this.value);
    }
    // Otherwise, convert to BigInteger multiplication.
    return multiplySmallAndArray(Math.abs(a.value), smallToArray(Math.abs(this.value)), this.sign !== a.sign);
  };

  // BigInteger internal multiplication by a small integer.
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

  // SmallInteger general multiplication method.
  SmallInteger.prototype.multiply = function (v) {
    return parseValue(v)._multiplyBySmall(this);
  };

  // Alias for multiplication.
  SmallInteger.prototype.times = SmallInteger.prototype.multiply;

  // Squares a digit array using optimized algorithm.
  function square (a) {
    var l = a.length,
      r = createArray(l + l), // Result array can be up to twice the length.
      base = BASE,
      product, carry, i, a_i, a_j;

    for (i = 0; i < l; i++) {
      a_i = a[i];
      carry = 0 - a_i * a_i; // Initialize carry, handling negative for first term.

      // Calculate 2 * a[i] * a[j] + carry + r[i+j]
      for (var j = i; j < l; j++) {
        a_j = a[j];
        product = 2 * (a_i * a_j) + r[i + j] + carry;
        carry = Math.floor(product / base);
        r[i + j] = product - carry * base;
      }
      r[i + l] = carry; // Store final carry for this row.
    }

    trim(r); // Clean up result.
    return r;
  }

  // BigInteger squaring method.
  BigInteger.prototype.square = function () {
    return new BigInteger(square(this.value), false);
  };

  // SmallInteger squaring method.
  SmallInteger.prototype.square = function () {
    var value = this.value * this.value;
    if (isPrecise(value)) {
      return new SmallInteger(value);
    }
    // Convert to BigInteger squaring if result overflows.
    return new BigInteger(square(smallToArray(Math.abs(this.value))), false);
  };

  // Division with remainder for large numbers (DivMod algorithm 1).
  function divMod1 (a, b) {
    var a_l = a.length,
      b_l = b.length,
      base = BASE,
      result = createArray(b.length), // Quotient digits.
      divisorMostSignificantDigit = b[b_l - 1],
      lambda = Math.ceil(base / (2 * divisorMostSignificantDigit)), // Normalization factor.
      remainder = multiplySmall(a, lambda), // Normalized dividend.
      divisor = multiplySmall(b, lambda), // Normalized divisor.
      quotientDigit, shift, carry, borrow, i, l, q;

    // Adjust sizes for normalization.
    if (remainder.length <= a_l) {
      remainder.push(0);
    }
    divisor.push(0);
    divisorMostSignificantDigit = divisor[b_l - 1];

    // Main loop for division.
    for (shift = a_l - b_l; shift >= 0; shift--) {
      quotientDigit = base - 1; // Initial guess for quotient digit.

      // Refine quotient digit guess.
      if (remainder[shift + b_l] !== divisorMostSignificantDigit) {
        quotientDigit = Math.floor((remainder[shift + b_l] * base + remainder[shift + b_l - 1]) / divisorMostSignificantDigit);
      }

      carry = 0;
      borrow = 0;
      l = divisor.length;

      // Multiply divisor by quotientDigit and subtract from remainder part.
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

      // If subtraction resulted in negative, adjust quotientDigit and add back divisor.
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

  // Division with remainder for large numbers (DivMod algorithm 2 - simpler but potentially slower).
  function divMod2 (a, b) {
    var a_l = a.length,
      b_l = b.length,
      result = [],
      part = [], // Current portion of dividend being processed.
      base = BASE,
      guess, xlen, highx, highy, check;

    while (a_l) {
      part.unshift(a[--a_l]); // Take one digit from dividend.
      trim(part); // Remove leading zeros from part.

      // If current part is smaller than divisor, quotient digit is 0.
      if (compareAbs(part, b) < 0) {
        result.push(0);
        continue;
      }

      xlen = part.length;
      highx = part[xlen - 1] * base + part[xlen - 2]; // Top two digits of dividend part.
      highy = b[b_l - 1] * base + b[b_l - 2]; // Top two digits of divisor.

      if (xlen > b_l) {
        highx = (highx + 1) * base; // Adjust for length difference.
      }

      guess = Math.ceil(highx / highy); // Initial guess for quotient digit.

      // Refine guess by trial subtraction.
      do {
        check = multiplySmall(b, guess);
        if (compareAbs(check, part) <= 0) {
          break;
        }
        guess--;
      } while (guess);

      result.push(guess); // Add quotient digit.
      part = subtract(part, check); // Subtract from current part.
    }

    result.reverse(); // Digits were collected in reverse order.
    return [arrayToSmall(result), arrayToSmall(part)];
  }

  // Divides a digit array by a small number (lambda).
  function divModSmall (value, lambda) {
    var length = value.length,
      quotient = createArray(length),
      base = BASE,
      i, q, remainder, divisor;

    remainder = 0;

    // Perform long division by a single digit.
    for (i = length - 1; i >= 0; --i) {
      divisor = remainder * base + value[i];
      q = truncate(divisor / lambda);
      remainder = divisor - q * lambda;
      quotient[i] = q | 0; // Ensure integer.
    }

    return [quotient, remainder | 0];
  }

  // General division and modulo function for any two integers.
  function divModAny (self, v) {
    var value, n = parseValue(v);
    var a = self.value,
      b = n.value;
    var quotient;

    if (b === 0) {
      throw new Error("Cannot divide by zero");
    }

    // Handle small integer cases.
    if (self.isSmall) {
      if (n.isSmall) {
        return [new SmallInteger(truncate(a / b)), new SmallInteger(a % b)];
      }
      return [Integer[0], self]; // Small divided by large is 0 quotient, self remainder.
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

        // Return SmallInteger results if possible.
        if (typeof quotient === "number") {
          if (self.sign !== n.sign) {
            quotient = -quotient;
          }
          return [new SmallInteger(quotient), new SmallInteger(remainder)];
        }

        // Otherwise, return BigInteger quotient.
        return [new BigInteger(quotient, self.sign !== n.sign), new SmallInteger(remainder)];
      }
      b = smallToArray(abs); // Convert small divisor to array.
    }

    // Compare absolute values to determine if quotient is 0 or +/-1.
    var comparison = compareAbs(a, b);
    if (comparison === -1) {
      return [Integer[0], self];
    }
    if (comparison === 0) {
      return [Integer[self.sign === n.sign ? 1 : -1], Integer[0]];
    }

    // Choose division algorithm based on length.
    if (a.length + b.length <= 200) {
      value = divMod1(a, b);
    } else {
      value = divMod2(a, b);
    }

    quotient = value[0];
    var qSign = self.sign !== n.sign, // Quotient sign.
      mod = value[1], // Remainder value.
      mSign = self.sign; // Remainder sign is same as dividend.

    // Convert quotient to SmallInteger or BigInteger.
    if (typeof quotient === "number") {
      if (qSign) {
        quotient = -quotient;
      }
      quotient = new SmallInteger(quotient);
    } else {
      quotient = new BigInteger(quotient, qSign);
    }

    // Convert remainder to SmallInteger or BigInteger.
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

  // BigInteger divmod method (returns quotient and remainder).
  BigInteger.prototype.divmod = function (v) {
    var result = divModAny(this, v);
    return {
      quotient: result[0],
      remainder: result[1]
    };
  };

  // SmallInteger divmod method (inherits from BigInteger).
  SmallInteger.prototype.divmod = BigInteger.prototype.divmod;

  // BigInteger division method (returns only quotient).
  BigInteger.prototype.divide = function (v) {
    return divModAny(this, v)[0];
  };

  // Aliases for division.
  SmallInteger.prototype.over = SmallInteger.prototype.divide = BigInteger.prototype.over = BigInteger.prototype.divide;

  // BigInteger modulo method (returns only remainder).
  BigInteger.prototype.mod = function (v) {
    return divModAny(this, v)[1];
  };

  // Aliases for modulo/remainder.
  SmallInteger.prototype.remainder = SmallInteger.prototype.mod = BigInteger.prototype.remainder = BigInteger.prototype.mod;

  // BigInteger power method.
  BigInteger.prototype.pow = function (v) {
    var n = parseValue(v),
      a = this.value,
      b = n.value,
      value, x, y;

    if (b === 0) {
      return Integer[1]; // x^0 = 1.
    }
    if (a === 0) {
      return Integer[0]; // 0^x = 0 (for x > 0).
    }
    if (a === 1) {
      return Integer[1]; // 1^x = 1.
    }
    if (a === -1) {
      return n.isEven() ? Integer[1] : Integer[-1]; // (-1)^x is 1 if even, -1 if odd.
    }

    if (n.sign) {
      return Integer[0]; // Negative exponent, result is fraction (approximates 0 for big integers).
    }

    if (!n.isSmall) {
      throw new Error("The exponent " + n.toString() + " is too large.");
    }

    if (this.isSmall) {
      // Try native Math.pow for small numbers.
      if (isPrecise(value = Math.pow(a, b))) {
        return new SmallInteger(truncate(value));
      }
    }

    x = this;
    y = Integer[1]; // Initialize result to 1.

    // Binary exponentiation (exponentiation by squaring).
    while (true) {
      if (b & 1 === 1) { // If exponent is odd.
        y = y.times(x);
        --b;
      }
      if (b === 0) {
        break; // Done.
      }
      b /= 2; // Halve exponent.
      x = x.square(); // Square base.
    }
    return y;
  };

  // SmallInteger power method (inherits from BigInteger).
  SmallInteger.prototype.pow = BigInteger.prototype.pow;

  // BigInteger modular exponentiation.
  BigInteger.prototype.modPow = function (exp, mod) {
    exp = parseValue(exp);
    mod = parseValue(mod);

    if (mod.isZero()) {
      throw new Error("Cannot take modPow with modulus 0");
    }

    var r = Integer[1], // Result accumulator.
      base = this.mod(mod); // Base modulo modulus.

    // Binary exponentiation.
    while (exp.isPositive()) {
      if (base.isZero()) {
        return Integer[0]; // If base is 0, result is 0.
      }
      if (exp.isOdd()) {
        r = r.multiply(base).mod(mod); // If exponent is odd, multiply result by base.
      }
      exp = exp.divide(2); // Halve exponent.
      base = base.square().mod(mod); // Square base.
    }
    return r;
  };

  // SmallInteger modular exponentiation (inherits from BigInteger).
  SmallInteger.prototype.modPow = BigInteger.prototype.modPow;

  // Compares absolute values of two digit arrays.
  function compareAbs (a, b) {
    if (a.length !== b.length) {
      return a.length > b.length ? 1 : -1; // Longer array is larger.
    }
    // Compare digit by digit from most significant.
    for (var i = a.length - 1; i >= 0; i--) {
      if (a[i] !== b[i]) {
        return a[i] > b[i] ? 1 : -1;
      }
    }
    return 0; // Equal.
  }

  // BigInteger absolute comparison.
  BigInteger.prototype.compareAbs = function (v) {
    var n = parseValue(v),
      a = this.value,
      b = n.value;

    if (n.isSmall) {
      return 1; // BigInteger is always absolutely larger than SmallInteger.
    }
    return compareAbs(a, b);
  };

  // SmallInteger absolute comparison.
  SmallInteger.prototype.compareAbs = function (v) {
    var n = parseValue(v),
      a = Math.abs(this.value),
      b = n.value;

    if (n.isSmall) {
      b = Math.abs(b);
      return a === b ? 0 : a > b ? 1 : -1; // Direct comparison for small numbers.
    }
    return -1; // SmallInteger is always absolutely smaller than BigInteger.
  };

  // BigInteger comparison.
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

    // Handle different signs.
    if (this.sign !== n.sign) {
      return n.sign ? 1 : -1; // Positive is greater than negative.
    }

    // If comparing with a small integer.
    if (n.isSmall) {
      return this.sign ? -1 : 1; // Negative BigInteger < Small, Positive BigInteger > Small.
    }

    // Compare absolute values, then adjust for sign.
    return compareAbs(a, b) * (this.sign ? -1 : 1);
  };

  // Alias for comparison.
  BigInteger.prototype.compareTo = BigInteger.prototype.compare;

  // SmallInteger comparison.
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

    // If `a` is negative and `n` is positive, `a` is smaller.
    // If `a` is positive and `n` is negative, `a` is larger.
    if (a < 0 !== n.sign) {
      return a < 0 ? -1 : 1;
    }

    // If signs are the same, `a` (small) is smaller than `n` (big).
    return a < 0 ? 1 : -1; // This logic seems a bit off, usually small compared to big is -1 or 1 depending on signs.
    // Re-evaluating: If `a` is small and `n` is big, and they have the same sign.
    // E.g., `5` vs `BigInt(100)`. `5` is smaller.
    // `BigInt(-100)` vs `-5`. `-5` is larger.
    // So if same sign, small value is "closer to zero" than big value.
    // Which means if both positive, small < big. If both negative, small > big.
    // The original code `return a < 0 ? 1 : -1` works for this.
    // If `a < 0` (both negative), then `a` is closer to zero, so greater. returns 1.
    // If `a >= 0` (both positive), then `a` is closer to zero, so lesser. returns -1.
  };

  // Alias for comparison.
  SmallInteger.prototype.compareTo = SmallInteger.prototype.compare;

  // BigInteger equality check.
  BigInteger.prototype.equals = function (v) {
    return this.compare(v) === 0;
  };

  // Aliases for equality.
  SmallInteger.prototype.eq = SmallInteger.prototype.equals = BigInteger.prototype.eq = BigInteger.prototype.equals;

  // BigInteger inequality check.
  BigInteger.prototype.notEquals = function (v) {
    return this.compare(v) !== 0;
  };

  // Aliases for inequality.
  SmallInteger.prototype.neq = SmallInteger.prototype.notEquals = BigInteger.prototype.neq = BigInteger.prototype.notEquals;

  // BigInteger greater than check.
  BigInteger.prototype.greater = function (v) {
    return this.compare(v) > 0;
  };

  // Aliases for greater than.
  SmallInteger.prototype.gt = SmallInteger.prototype.greater = BigInteger.prototype.gt = BigInteger.prototype.greater;

  // BigInteger lesser than check.
  BigInteger.prototype.lesser = function (v) {
    return this.compare(v) < 0;
  };

  // Aliases for lesser than.
  SmallInteger.prototype.lt = SmallInteger.prototype.lesser = BigInteger.prototype.lt = BigInteger.prototype.lesser;

  // BigInteger greater than or equals check.
  BigInteger.prototype.greaterOrEquals = function (v) {
    return this.compare(v) >= 0;
  };

  // Aliases for greater than or equals.
  SmallInteger.prototype.geq = SmallInteger.prototype.greaterOrEquals = BigInteger.prototype.geq = BigInteger.prototype.greaterOrEquals;

  // BigInteger lesser than or equals check.
  BigInteger.prototype.lesserOrEquals = function (v) {
    return this.compare(v) <= 0;
  };

  // Aliases for lesser than or equals.
  SmallInteger.prototype.leq = SmallInteger.prototype.lesserOrEquals = BigInteger.prototype.leq = BigInteger.prototype.lesserOrEquals;

  // BigInteger even check.
  BigInteger.prototype.isEven = function () {
    return (this.value[0] & 1) === 0; // Check least significant digit.
  };

  // SmallInteger even check.
  SmallInteger.prototype.isEven = function () {
    return (this.value & 1) === 0;
  };

  // BigInteger odd check.
  BigInteger.prototype.isOdd = function () {
    return (this.value[0] & 1) === 1; // Check least significant digit.
  };

  // SmallInteger odd check.
  SmallInteger.prototype.isOdd = function () {
    return (this.value & 1) === 1;
  };

  // BigInteger positive check.
  BigInteger.prototype.isPositive = function () {
    return !this.sign;
  };

  // SmallInteger positive check.
  SmallInteger.prototype.isPositive = function () {
    return this.value > 0;
  };

  // BigInteger negative check.
  BigInteger.prototype.isNegative = function () {
    return this.sign;
  };

  // SmallInteger negative check.
  SmallInteger.prototype.isNegative = function () {
    return this.value < 0;
  };

  // BigInteger unit check (i.e., is 1 or -1).
  BigInteger.prototype.isUnit = function () {
    return false; // BigInteger cannot be a unit (unless it's value is [1], but this is a general BigInt).
  };

  // SmallInteger unit check.
  SmallInteger.prototype.isUnit = function () {
    return Math.abs(this.value) === 1;
  };

  // BigInteger zero check.
  BigInteger.prototype.isZero = function () {
    return false; // Only Integer[0] is truly zero.
  };

  // SmallInteger zero check.
  SmallInteger.prototype.isZero = function () {
    return this.value === 0;
  };

  // BigInteger divisibility check.
  BigInteger.prototype.isDivisibleBy = function (v) {
    var n = parseValue(v);
    var value = n.value;

    if (value === 0) {
      return false; // Cannot divide by zero.
    }
    if (value === 1) {
      return true; // Divisible by 1.
    }
    if (value === 2) {
      return this.isEven(); // Check parity for 2.
    }

    // For other divisors, check if remainder is zero.
    return this.mod(n).equals(Integer[0]);
  };

  // SmallInteger divisibility check (inherits from BigInteger).
  SmallInteger.prototype.isDivisibleBy = BigInteger.prototype.isDivisibleBy;

  // Basic primality test for small numbers.
  function isBasicPrime (v) {
    var n = v.abs();

    if (n.isUnit()) {
      return false;
    } // 1 is not prime.
    if (n.equals(2) || n.equals(3) || n.equals(5)) {
      return true;
    } // 2, 3, 5 are prime.
    if (n.isEven() || n.isDivisibleBy(3) || n.isDivisibleBy(5)) {
      return false;
    } // Divisible by 2, 3, or 5 is not prime.
    if (n.lesser(25)) {
      return true;
    } // Primes below 25 after previous checks: 7, 11, 13, 17, 19, 23.
  }

  // BigInteger primality test (uses Miller-Rabin).
  BigInteger.prototype.isPrime = function () {
    var isPrime = isBasicPrime(this);
    if (isPrime !== undefined) {
      return isPrime;
    }

    var n = this.abs(),
      nPrev = n.prev();
    var a = [2, 3, 5, 7, 11, 13, 17, 19], // Small prime bases for Miller-Rabin.
      b = nPrev,
      d, t, i, x;

    // Find d and s such that n-1 = d * 2^s (b is d here).
    while (b.isEven()) {
      b = b.divide(2);
    }

    // Miller-Rabin test for each base `a_i`.
    for (i = 0; i < a.length; i++) {
      x = bigInt(a[i]).modPow(b, n); // x = a^d mod n.
      if (x.equals(Integer[1]) || x.equals(nPrev)) {
        continue;
      } // If x = 1 or x = n-1, it's a strong probable prime for this base.

      for (t = true, d = b; t && d.lesser(nPrev); d = d.multiply(2)) {
        x = x.square().mod(n); // x = x^2 mod n.
        if (x.equals(nPrev)) {
          t = false;
        } // If x = n-1, it's a strong probable prime.
      }
      if (t) {
        return false;
      } // If loop finished and x != n-1, then n is composite.
    }
    return true; // Passed all tests, likely prime.
  };

  // SmallInteger primality test (inherits from BigInteger).
  SmallInteger.prototype.isPrime = BigInteger.prototype.isPrime;

  // BigInteger probable primality test (simpler Miller-Rabin).
  BigInteger.prototype.isProbablePrime = function (iterations) {
    var isPrime = isBasicPrime(this);
    if (isPrime !== undefined) {
      return isPrime;
    }

    var n = this.abs();
    var t = iterations === undefined ? 5 : iterations; // Number of iterations.

    for (var i = 0; i < t; i++) {
      var a = bigInt.randBetween(2, n.minus(2)); // Random base.
      if (!a.modPow(n.prev(), n).isUnit()) {
        return false;
      } // If a^(n-1) mod n != 1, it's composite (Fermat's Little Theorem).
    }
    return true; // Passed tests, probable prime.
  };

  // SmallInteger probable primality test (inherits from BigInteger).
  SmallInteger.prototype.isProbablePrime = BigInteger.prototype.isProbablePrime;

  // BigInteger modular multiplicative inverse.
  BigInteger.prototype.modInv = function (n) {
    var t = bigInt.zero,
      newT = bigInt.one,
      r = parseValue(n),
      newR = this.abs(),
      q, lastT, lastR;

    // Extended Euclidean Algorithm.
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
      t = t.add(n);
    } // Ensure result is positive.

    if (this.isNegative()) {
      return t.negate();
    } // Adjust sign if original number was negative.

    return t;
  };

  // SmallInteger modular multiplicative inverse (inherits from BigInteger).
  SmallInteger.prototype.modInv = BigInteger.prototype.modInv;

  // BigInteger next (increment by 1).
  BigInteger.prototype.next = function () {
    var value = this.value;
    if (this.sign) {
      return subtractSmall(value, 1, this.sign);
    } // If negative, decrement absolute value.
    return new BigInteger(addSmall(value, 1), this.sign); // If positive, increment.
  };

  // SmallInteger next (increment by 1).
  SmallInteger.prototype.next = function () {
    var value = this.value;
    if (value + 1 < MAX_INT) {
      return new SmallInteger(value + 1);
    } // If still small, return SmallInteger.
    return new BigInteger(MAX_INT_ARR, false); // If overflows, return BigInteger.
  };

  // BigInteger previous (decrement by 1).
  BigInteger.prototype.prev = function () {
    var value = this.value;
    if (this.sign) {
      return new BigInteger(addSmall(value, 1), true);
    } // If negative, increment absolute value.
    return subtractSmall(value, 1, this.sign); // If positive, decrement.
  };

  // SmallInteger previous (decrement by 1).
  SmallInteger.prototype.prev = function () {
    var value = this.value;
    if (value - 1 > -MAX_INT) {
      return new SmallInteger(value - 1);
    } // If still small, return SmallInteger.
    return new BigInteger(MAX_INT_ARR, true); // If underflows, return BigInteger.
  };


  // Pre-calculate powers of two up to BASE for efficient bit shifting.
  var powersOfTwo = [1];
  while (2 * powersOfTwo[powersOfTwo.length - 1] <= BASE) {
    powersOfTwo.push(2 * powersOfTwo[powersOfTwo.length - 1]);
  }
  var powers2Length = powersOfTwo.length,
    highestPower2 = powersOfTwo[powers2Length - 1];

  // Checks if a shift amount is small enough to be handled directly.
  function shift_isSmall (n) {
    return (typeof n === "number" || typeof n === "string") && +Math.abs(n) <= BASE || n instanceof BigInteger && n.value.length <= 1;
  }

  // BigInteger left bit shift (multiplication by powers of 2).
  BigInteger.prototype.shiftLeft = function (n) {
    if (!shift_isSmall(n)) {
      throw new Error(String(n) + " is too large for shifting.");
    }
    n = +n; // Ensure `n` is a number.
    if (n < 0) {
      return this.shiftRight(-n);
    } // Negative shift left is shift right.

    var result = this;
    if (result.isZero()) {
      return result;
    }

    // Perform shifts in chunks of powers2Length-1.
    while (n >= powers2Length) {
      result = result.multiply(highestPower2);
      n -= powers2Length - 1;
    }

    return result.multiply(powersOfTwo[n]); // Final shift.
  };

  // SmallInteger left bit shift (inherits from BigInteger).
  SmallInteger.prototype.shiftLeft = BigInteger.prototype.shiftLeft;

  // BigInteger right bit shift (division by powers of 2).
  BigInteger.prototype.shiftRight = function (n) {
    var remQuo;
    if (!shift_isSmall(n)) {
      throw new Error(String(n) + " is too large for shifting.");
    }
    n = +n; // Ensure `n` is a number.
    if (n < 0) {
      return this.shiftLeft(-n);
    } // Negative shift right is shift left.

    var result = this;

    // Perform shifts in chunks of powers2Length-1.
    while (n >= powers2Length) {
      // Handle special cases for 0 and -1 (unit).
      if (result.isZero() || result.isNegative() && result.isUnit()) {
        return result;
      }

      remQuo = divModAny(result, highestPower2);
      // Adjust quotient for negative remainders (floor division).
      result = remQuo[1].isNegative() ? remQuo[0].prev() : remQuo[0];
      n -= powers2Length - 1;
    }

    remQuo = divModAny(result, powersOfTwo[n]);
    // Adjust quotient for negative remainders.
    return remQuo[1].isNegative() ? remQuo[0].prev() : remQuo[0];
  };

  // SmallInteger right bit shift (inherits from BigInteger).
  SmallInteger.prototype.shiftRight = BigInteger.prototype.shiftRight;

  // Generic bitwise operation function.
  function bitwise (x, y, fn) {
    y = parseValue(y); // Ensure y is an Integer.

    var xSign = x.isNegative(),
      ySign = y.isNegative();
    var xRem = xSign ? x.not() : x, // Two's complement for negative numbers.
      yRem = ySign ? y.not() : y;

    var xDigit = 0,
      yDigit = 0;
    var xDivMod = null,
      yDivMod = null;
    var result = [];

    // Process digits from least significant to most significant.
    while (!xRem.isZero() || !yRem.isZero()) {
      xDivMod = divModAny(xRem, highestPower2);
      xDigit = xDivMod[1].toJSNumber();
      if (xSign) {
        xDigit = highestPower2 - 1 - xDigit; // Invert for two's complement.
      }

      yDivMod = divModAny(yRem, highestPower2);
      yDigit = yDivMod[1].toJSNumber();
      if (ySign) {
        yDigit = highestPower2 - 1 - yDigit; // Invert for two's complement.
      }

      xRem = xDivMod[0];
      yRem = yDivMod[0];

      result.push(fn(xDigit, yDigit)); // Apply bitwise function.
    }

    // Handle final sign bit.
    var sum = fn(xSign ? 1 : 0, ySign ? 1 : 0) !== 0 ? bigInt(-1) : bigInt(0);

    // Reconstruct the result from digits.
    for (var i = result.length - 1; i >= 0; i -= 1) {
      sum = sum.multiply(highestPower2).add(bigInt(result[i]));
    }
    return sum;
  }

  // BigInteger bitwise NOT.
  BigInteger.prototype.not = function () {
    return this.negate().prev(); // Equivalent to -(n+1).
  };

  // SmallInteger bitwise NOT (inherits from BigInteger).
  SmallInteger.prototype.not = BigInteger.prototype.not;

  // BigInteger bitwise AND.
  BigInteger.prototype.and = function (n) {
    return bitwise(this, n, function (a, b) {
      return a & b;
    });
  };

  // SmallInteger bitwise AND (inherits from BigInteger).
  SmallInteger.prototype.and = BigInteger.prototype.and;

  // BigInteger bitwise OR.
  BigInteger.prototype.or = function (n) {
    return bitwise(this, n, function (a, b) {
      return a | b;
    });
  };

  // SmallInteger bitwise OR (inherits from BigInteger).
  SmallInteger.prototype.or = BigInteger.prototype.or;

  // BigInteger bitwise XOR.
  BigInteger.prototype.xor = function (n) {
    return bitwise(this, n, function (a, b) {
      return a ^ b;
    });
  };

  // SmallInteger bitwise XOR (inherits from BigInteger).
  SmallInteger.prototype.xor = BigInteger.prototype.xor;

  // Masks for rough LOB calculation.
  var LOBMASK_I = 1 << 30,
    LOBMASK_BI = (BASE & -BASE) * (BASE & -BASE) | LOBMASK_I;

  // Rough Least-Significant Bit (LOB) calculation.
  function roughLOB (n) {
    var v = n.value,
      x = typeof v === "number" ? v | LOBMASK_I : v[0] + v[1] * BASE | LOBMASK_BI;
    return x & -x; // Returns the lowest set bit.
  }

  // Integer logarithm (used for bitLength).
  function integerLogarithm (value, base) {
    if (base.compareTo(value) <= 0) {
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

  // BigInteger bit length.
  BigInteger.prototype.bitLength = function () {
    var n = this;
    if (n.compareTo(bigInt(0)) < 0) {
      n = n.negate().subtract(bigInt(1)); // For negative numbers, bit length of two's complement.
    }
    if (n.compareTo(bigInt(0)) === 0) {
      return bigInt(0);
    }
    return bigInt(integerLogarithm(n, bigInt(2)).e).add(bigInt(1));
  };

  // SmallInteger bit length (inherits from BigInteger).
  SmallInteger.prototype.bitLength = BigInteger.prototype.bitLength;

  // Returns the maximum of two integers.
  function max (a, b) {
    a = parseValue(a);
    b = parseValue(b);
    return a.greater(b) ? a : b;
  }

  // Returns the minimum of two integers.
  function min (a, b) {
    a = parseValue(a);
    b = parseValue(b);
    return a.lesser(b) ? a : b;
  }

  // Greatest Common Divisor (GCD) using Binary GCD algorithm.
  function gcd (a, b) {
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
      d, t;

    // Remove common factors of 2.
    while (a.isEven() && b.isEven()) {
      d = Math.min(roughLOB(a), roughLOB(b));
      a = a.divide(d);
      b = b.divide(d);
      c = c.multiply(d);
    }

    // Remove factors of 2 from 'a'.
    while (a.isEven()) {
      a = a.divide(roughLOB(a));
    }

    do {
      // Remove factors of 2 from 'b'.
      while (b.isEven()) {
        b = b.divide(roughLOB(b));
      }

      // Ensure a <= b.
      if (a.greater(b)) {
        t = b;
        b = a;
        a = t;
      }

      b = b.subtract(a); // b = b - a.
    } while (!b.isZero());

    return c.isUnit() ? a : a.multiply(c); // Multiply back common factors of 2.
  }

  // Least Common Multiple (LCM).
  function lcm (a, b) {
    a = parseValue(a).abs();
    b = parseValue(b).abs();
    return a.divide(gcd(a, b)).multiply(b);
  }

  // Generates a random integer between a and b (inclusive).
  function randBetween (a, b) {
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
      restricted = true;

    for (var i = length; i >= 0; i--) {
      var top = restricted ? range.value[i] : BASE;
      var digit = truncate(Math.random() * top);
      result.unshift(digit);
      if (digit < top) {
        restricted = false;
      }
    }

    result = arrayToSmall(result);
    return low.add(typeof result === "number" ? new SmallInteger(result) : new BigInteger(result, false));
  }

  // Parses a string value in a given base.
  var parseBase = function (text, base) {
    var length = text.length;
    var i;
    var absBase = Math.abs(base);

    // Validate characters for the given base.
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
        } else if (c.charCodeAt(0) - 87 >= absBase) { // For a-z.
          throw new Error(c + " is not a valid digit in base " + base + ".");
        }
      }
    }

    // Optimized path for small bases and numbers that fit JS safe integer.
    if (2 <= base && base <= 36) {
      if (length <= LOG_MAX_INT / Math.log(base)) {
        var result = parseInt(text, base);
        if (isNaN(result)) {
          throw new Error(c + " is not a valid digit in base " + base + ".");
        }
        return new SmallInteger(parseInt(text, base));
      }
    }

    base = parseValue(base); // Ensure base is an Integer.
    var digits = [];
    var isNegative = text[0] === "-";

    // Convert string digits to Integer objects.
    for (i = isNegative ? 1 : 0; i < text.length; i++) {
      var c = text[i].toLowerCase(),
        charCode = c.charCodeAt(0);
      if (48 <= charCode && charCode <= 57) { // 0-9.
        digits.push(parseValue(c));
      } else if (97 <= charCode && charCode <= 122) { // a-z.
        digits.push(parseValue(c.charCodeAt(0) - 87));
      } else if (c === "<") { // Handle custom digits like <10>.
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

  // Parses an array of digits in a given base.
  function parseBaseFromArray (digits, base, isNegative) {
    var val = Integer[0],
      pow = Integer[1],
      i;

    // Convert digits from base to decimal using polynomial evaluation.
    for (i = digits.length - 1; i >= 0; i--) {
      val = val.add(digits[i].times(pow));
      pow = pow.times(base);
    }

    return isNegative ? val.negate() : val;
  }

  // Converts a digit (0-35) to its string representation.
  function stringify (digit) {
    if (digit <= 35) {
      return "0123456789abcdefghijklmnopqrstuvwxyz".charAt(digit);
    }
    return "<" + digit + ">"; // For digits > 35.
  }

  // Converts a BigInteger to an array of digits in a specified base.
  function toBase (n, base) {
    base = bigInt(base);

    if (base.isZero()) {
      if (n.isZero()) {
        return {
          value: [0],
          isNegative: false
        };
      }
      throw new Error("Cannot convert nonzero numbers to base 0.");
    }

    if (base.equals(-1)) {
      if (n.isZero()) {
        return {
          value: [0],
          isNegative: false
        };
      }
      if (n.isNegative()) {
        // Special handling for negative numbers in base -1.
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
    if (n.isNegative() && base.isPositive()) {
      neg = true;
      n = n.abs(); // Work with absolute value for conversion.
    }

    if (base.equals(1)) {
      if (n.isZero()) {
        return {
          value: [0],
          isNegative: false
        };
      }
      // For base 1, representation is just `n` ones.
      return {
        value: Array.apply(null, Array(+n)).map(Number.prototype.valueOf, 1),
        isNegative: neg
      };
    }

    var out = [];
    var left = n,
      divmod;

    // Repeatedly divide by base and collect remainders.
    while (left.isNegative() || left.compareAbs(base) >= 0) {
      divmod = left.divmod(base);
      left = divmod.quotient;
      var digit = divmod.remainder;

      // Handle negative remainders for non-standard bases.
      if (digit.isNegative()) {
        digit = base.minus(digit).abs();
        left = left.next();
      }
      out.push(digit.toJSNumber());
    }

    out.push(left.toJSNumber()); // Add the last quotient.
    return {
      value: out.reverse(),
      isNegative: neg
    }; // Reverse to get correct order.
  }

  // Converts a BigInteger to a string in a specified base.
  function toBaseString (n, base) {
    var arr = toBase(n, base);
    return (arr.isNegative ? "-" : "") + arr.value.map(stringify).join("");
  }

  // BigInteger toArray method.
  BigInteger.prototype.toArray = function (radix) {
    return toBase(this, radix);
  };

  // SmallInteger toArray method (inherits from BigInteger).
  SmallInteger.prototype.toArray = function (radix) {
    return toBase(this, radix);
  };

  // BigInteger toString method.
  BigInteger.prototype.toString = function (radix) {
    if (radix === undefined) {
      radix = 10;
    }
    if (radix !== 10) {
      return toBaseString(this, radix);
    }

    var v = this.value,
      l = v.length,
      str = String(v[--l]), // Start with the most significant digit.
      zeros = "0000000", // Helper for padding.
      digit;

    // Concatenate digits, padding with zeros for base-1e7 representation.
    while (--l >= 0) {
      digit = String(v[l]);
      str += zeros.slice(digit.length) + digit;
    }

    var sign = this.sign ? "-" : "";
    return sign + str;
  };

  // SmallInteger toString method.
  SmallInteger.prototype.toString = function (radix) {
    if (radix === undefined) {
      radix = 10;
    }
    if (radix != 10) {
      return toBaseString(this, radix);
    }
    return String(this.value);
  };

  // BigInteger toJSON method (for serialization).
  BigInteger.prototype.toJSON = SmallInteger.prototype.toJSON = function () {
    return this.toString();
  };

  // BigInteger valueOf (returns a JS number if possible, or string).
  BigInteger.prototype.valueOf = function () {
    return parseInt(this.toString(), 10);
  };

  // Alias for valueOf.
  BigInteger.prototype.toJSNumber = BigInteger.prototype.valueOf;

  // SmallInteger valueOf (returns the raw number).
  SmallInteger.prototype.valueOf = function () {
    return this.value;
  };

  // Alias for valueOf.
  SmallInteger.prototype.toJSNumber = SmallInteger.prototype.valueOf;

  // Parses a string value into an Integer.
  function parseStringValue (v) {
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

    var split = v.split(/e/i); // Handle scientific notation.
    if (split.length > 2) {
      throw new Error("Invalid integer: " + split.join("e"));
    }

    if (split.length === 2) {
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
        exp -= text.length - decimalPlace - 1;
        text = text.slice(0, decimalPlace) + text.slice(decimalPlace + 1);
      }

      if (exp < 0) {
        throw new Error("Cannot include negative exponent part for integers");
      }
      text += new Array(exp + 1).join("0"); // Pad with zeros.
      v = text;
    }

    var isValid = /^([0-9][0-9]*)$/.test(v); // Validate integer format.
    if (!isValid) {
      throw new Error("Invalid integer: " + v);
    }

    var r = [],
      max = v.length,
      l = LOG_BASE, // Digits per segment.
      min = max - l;

    // Split string into base-1e7 digits.
    while (max > 0) {
      r.push(+v.slice(min, max));
      min -= l;
      if (min < 0) {
        min = 0;
      }
      max -= l;
    }

    trim(r); // Remove leading zeros.
    return new BigInteger(r, sign);
  }

  // Parses a number value into an Integer.
  function parseNumberValue (v) {
    if (isPrecise(v)) {
      if (v !== truncate(v)) {
        throw new Error(v + " is not an integer.");
      }
      return new SmallInteger(v);
    }
    return parseStringValue(v.toString()); // Convert to string and parse.
  }

  // General function to parse any value into an Integer.
  function parseValue (v) {
    if (typeof v === "number") {
      return parseNumberValue(v);
    }
    if (typeof v === "string") {
      return parseStringValue(v);
    }
    return v; // Assume it's already an Integer object.
  }

  // Pre-create small integer constants for performance.
  for (var i = 0; i < 1e3; i++) {
    Integer[i] = new SmallInteger(i);
    if (i > 0) {
      Integer[-i] = new SmallInteger(-i);
    }
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

  // Type check.
  Integer.isInstance = function (x) {
    return x instanceof BigInteger || x instanceof SmallInteger;
  };

  // Random number generation.
  Integer.randBetween = randBetween;

  // Construction from array of digits.
  Integer.fromArray = function (digits, base, isNegative) {
    return parseBaseFromArray(digits.map(parseValue), parseValue(base || 10), isNegative);
  };

  return Integer;
}();


/**
 * Main function to solve the problem.
 * Reads input, calculates combinations, and sums up differences.
 * @param {string} arg - The input string from stdin.
 */
function main (arg) {
  // Parse the first line for n and k.
  var src = arg.trim().split("\n")[0].split(' ').map(Number);

  // Parse the second line for array 'a'.
  var a = arg.trim().split("\n")[1].split(' ').map(Number);

  var n = src[0]; // Total number of elements.
  var k = src[1]; // Size of combinations.

  // Generate all combinations of 'k' elements from array 'a'.
  var maps = combination(a, k, k);

  var sum = 0; // Initialize sum of differences.

  // Iterate through each combination.
  for (var i = 0; i < maps.length; i++) {
    // console.log(maps[i]) // Debugging: print current combination.

    // Calculate the difference between max and min in the current combination.
    var data = Math.max.apply(null, maps[i]) - Math.min.apply(null, maps[i]);

    // Add the difference modulo 1000000007 to the sum.
    sum += data % 1000000007;

    // console.log([data, 1000000007]) // More debugging.
    // console.log(data) // Even more debugging.

    // sum += bigInt(data).divide('1000000007') // Original commented out line, kept as is.
  }

  // Output the final sum.
  console.log(sum);
}


// Read input from stdin and call the main function.
main(require('fs').readFileSync('/dev/stdin', 'utf8'));


/**
 * Generates combinations of elements from an array.
 * @param {number[]} nums - The array of numbers to choose from.
 * @param {number} k - The number of elements to choose for each combination.
 * @param {number} _k - Internal parameter, typically same as k.
 * @returns {number[][]} An array of arrays, where each inner array is a combination.
 */
function combination (nums, k, _k) {
  var ans = []; // Stores the resulting combinations.
  var sum = 0; // Unused variable in this function, but kept as per Type I clone rule.

  // Base case: if not enough elements to form a combination of size k.
  if (nums.length < k) {
    return [];
  }

  // Base case: if k is 1, each element is a combination by itself.
  if (k === 1) {
    for (var i = 0; i < nums.length; i++) {
      ans[i] = [nums[i]];
    }
  } else {
    // Recursive step: iterate through elements.
    for (var i = 0; i < nums.length - k + 1; i++) {
      // Recursively get combinations for the remaining elements.
      var row = combination(nums.slice(i + 1), k - 1, _k);

      // Prepend the current element to each combination from the recursive call.
      for (var j = 0; j < row.length; j++) {
        ans.push([nums[i]].concat(row[j]));
      }
    }
  }

  return ans; // Return all generated combinations.
}