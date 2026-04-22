var bigInt = function (undefined) {
  // --- Core Constants for BigInt Operations ---
  // Base for internal array representation (10^7 for JavaScript numbers)
  var BASE = 1e7,
    // Logarithm of the base, used for digit length calculations
    LOG_BASE = 7,
    // Maximum safe integer in JavaScript (2^53 - 1)
    MAX_INT = 9007199254740992,
    // MAX_INT converted to internal array format
    MAX_INT_ARR = smallToArray(MAX_INT),
    // Logarithm of MAX_INT, useful for certain checks
    LOG_MAX_INT = Math.log(MAX_INT);


  /**
   * Main constructor for Integer objects.
   * This acts as a factory, returning either a SmallInteger or BigInteger.
   * @param {*} v The value to convert to an Integer.
   * @param {number} [radix] The base for parsing strings.
   * @returns {Integer} A new Integer instance.
   */
  function Integer(v, radix) {
    // If no value is provided, default to zero.
    if (typeof v === "undefined") {
      return Integer[0];
    }

    // If a radix is specified, handle base conversion.
    if (typeof radix !== "undefined") {
      // For base 10, use standard parsing; otherwise, use base parsing.
      return (+radix === 10) ? parseValue(v) : parseBase(v, radix);
    }

    // Default parsing for various value types.
    return parseValue(v);
  }

  /**
   * Represents a large integer using an array of digits.
   * @param {number[]} value An array of base-BASE digits.
   * @param {boolean} sign True if negative, false if positive.
   */
  function BigInteger(value, sign) {
    this.value = value;
    this.sign = sign;
    this.isSmall = false; // Flag to indicate it's a BigInteger
  }

  // BigInteger instances inherit from Integer's prototype.
  BigInteger.prototype = Object.create(Integer.prototype);


  /**
   * Represents a small integer that fits within JavaScript's safe integer range.
   * @param {number} value The numeric value.
   */
  function SmallInteger(value) {
    this.value = value;
    this.sign = (value < 0); // Determine sign
    this.isSmall = true; // Flag to indicate it's a SmallInteger
  }

  // SmallInteger instances also inherit from Integer's prototype.
  SmallInteger.prototype = Object.create(Integer.prototype);


  /**
   * Checks if a number can be precisely represented by JavaScript's number type.
   * @param {number} n The number to check.
   * @returns {boolean} True if precise, false otherwise.
   */
  function isPrecise(n) {
    return (-MAX_INT < n && n < MAX_INT);
  }


  /**
   * Converts a small JavaScript number into the internal array representation.
   * @param {number} n The small number.
   * @returns {number[]} Array of digits.
   */
  function smallToArray(n) {
    // Handle numbers smaller than BASE
    if (n < 1e7) {
      return [n];
    }
    // Handle numbers smaller than BASE^2
    if (n < 1e14) {
      return [n % 1e7, Math.floor(n / 1e7)];
    }
    // Handle numbers up to MAX_INT (approx BASE^3)
    return [n % 1e7, Math.floor(n / 1e7) % 1e7, Math.floor(n / 1e14)];
  }


  /**
   * Converts an internal array representation back to a small JavaScript number if possible.
   * @param {number[]} arr The array of digits.
   * @returns {number|number[]} The number or the original array if too large.
   */
  function arrayToSmall(arr) {
    trim(arr); // Remove leading zeros
    var length = arr.length;

    // If the array is small enough and its absolute value fits into MAX_INT
    if (length < 4 && compareAbs(arr, MAX_INT_ARR) < 0) {
      switch (length) {
        case 0:
          return 0; // Empty array means 0
        case 1:
          return arr[0]; // Single digit
        case 2:
          return arr[0] + arr[1] * BASE; // Two digits
        default:
          // Three digits, combining them
          return arr[0] + (arr[1] + arr[2] * BASE) * BASE;
      }
    }
    return arr; // Still too large, return array
  }


  /**
   * Removes leading zero digits from an array representation.
   * Modifies the array in place.
   * @param {number[]} v The array of digits.
   */
  function trim(v) {
    var i = v.length;
    while (v[--i] === 0); // Find the first non-zero digit from the end
    v.length = i + 1; // Truncate the array
  }


  /**
   * Creates a new array filled with zeros.
   * @param {number} length The desired length of the array.
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
   * Truncates a number towards zero (floor for positive, ceil for negative).
   * @param {number} n The number to truncate.
   * @returns {number} The truncated integer.
   */
  function truncate(n) {
    if (n > 0) return Math.floor(n);
    return Math.ceil(n);
  }


  /**
   * Adds two arrays of digits (representing positive BigIntegers).
   * @param {number[]} a First array of digits.
   * @param {number[]} b Second array of digits.
   * @returns {number[]} Resulting array of digits.
   */
  function add(a, b) {
    var l_a = a.length,
      l_b = b.length,
      r = new Array(l_a), // Result array, size of the longer input
      carry = 0,
      base = BASE,
      sum, i;

    // Add corresponding digits from both arrays
    for (i = 0; i < l_b; i++) {
      sum = a[i] + b[i] + carry;
      carry = (sum >= base) ? 1 : 0; // Calculate carry
      r[i] = sum - carry * base; // Store the digit
    }

    // Propagate carry through the rest of the longer array (if any)
    while (i < l_a) {
      sum = a[i] + carry;
      carry = (sum === base) ? 1 : 0;
      r[i++] = sum - carry * base;
    }

    // If there's a final carry, push it to the result
    if (carry > 0) {
      r.push(carry);
    }
    return r;
  }


  /**
   * Adds two arrays of digits, ensuring the longer array is passed as 'a' to 'add'.
   * @param {number[]} a First array of digits.
   * @param {number[]} b Second array of digits.
   * @returns {number[]} Resulting array of digits.
   */
  function addAny(a, b) {
    if (a.length >= b.length) {
      return add(a, b);
    }
    return add(b, a); // Ensure 'a' is always the longer array for efficiency
  }


  /**
   * Adds a small number (carry) to an array of digits.
   * Used for adding a small number to a BigInteger's value array.
   * @param {number[]} a The array of digits.
   * @param {number} carry The small number to add.
   * @returns {number[]} Resulting array of digits.
   */
  function addSmall(a, carry) {
    var l = a.length,
      r = new Array(l),
      base = BASE,
      sum, i;

    // Add the carry digit by digit
    for (i = 0; i < l; i++) {
      sum = a[i] - base + carry; // Subtract base to simplify carry calculation
      carry = Math.floor(sum / base);
      r[i] = sum - carry * base;
      carry += 1; // Adjust carry for the next iteration
    }

    // Propagate any remaining carry
    while (carry > 0) {
      r[i++] = carry % base;
      carry = Math.floor(carry / base);
    }
    return r;
  }


  // --- BigInteger Prototype Methods ---

  // Addition method for BigIntegers
  BigInteger.prototype.add = function (v) {
    var n = parseValue(v); // Parse input to an Integer object

    // If signs are different, perform subtraction instead (e.g., 5 + (-3) = 5 - 3)
    if (this.sign !== n.sign) {
      return this.subtract(n.negate());
    }

    var a = this.value,
      b = n.value;

    // Optimize for adding a SmallInteger
    if (n.isSmall) {
      return new BigInteger(addSmall(a, Math.abs(b)), this.sign);
    }

    // General case for adding two BigIntegers
    return new BigInteger(addAny(a, b), this.sign);
  };

  // Alias for add
  BigInteger.prototype.plus = BigInteger.prototype.add;


  // Addition method for SmallIntegers
  SmallInteger.prototype.add = function (v) {
    var n = parseValue(v);
    var a = this.value;

    // If signs are different (or a is negative and n is positive), perform subtraction.
    if (a < 0 !== n.sign) {
      return this.subtract(n.negate());
    }

    var b = n.value;

    // If both are SmallIntegers, try direct addition.
    if (n.isSmall) {
      if (isPrecise(a + b)) {
        return new SmallInteger(a + b);
      }
      // If result exceeds safe integer, convert b to array and use BigInt addition.
      b = smallToArray(Math.abs(b));
    }

    // Convert 'a' to array if 'n' was a BigInteger or direct addition overflowed.
    return new BigInteger(addSmall(b, Math.abs(a)), a < 0);
  };

  // Alias for add
  SmallInteger.prototype.plus = SmallInteger.prototype.add;


  /**
   * Subtracts two arrays of digits (assuming a >= b).
   * @param {number[]} a The minuend array.
   * @param {number[]} b The subtrahend array.
   * @returns {number[]} The difference array.
   */
  function subtract(a, b) {
    var a_l = a.length,
      b_l = b.length,
      r = new Array(a_l),
      borrow = 0,
      base = BASE,
      i, difference;

    // Subtract digits from both arrays
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

    // Propagate borrow through the rest of the minuend array
    for (i = b_l; i < a_l; i++) {
      difference = a[i] - borrow;
      if (difference < 0) {
        difference += base;
      } else {
        r[i++] = difference; // If no borrow, we can copy the rest directly
        break;
      }
      r[i] = difference;
    }

    // Copy remaining digits from 'a'
    for (; i < a_l; i++) {
      r[i] = a[i];
    }
    trim(r); // Remove leading zeros
    return r;
  }


  /**
   * Performs subtraction between two arrays of digits, handling signs and order.
   * @param {number[]} a First array.
   * @param {number[]} b Second array.
   * @param {boolean} sign Initial sign of the result.
   * @returns {SmallInteger|BigInteger} The result.
   */
  function subtractAny(a, b, sign) {
    var value;

    // Determine which array is larger in absolute value to ensure correct subtraction order
    if (compareAbs(a, b) >= 0) {
      value = subtract(a, b);
    } else {
      value = subtract(b, a);
      sign = !sign; // Flip sign if we swapped operands
    }

    value = arrayToSmall(value); // Try to convert to SmallInteger

    if (typeof value === "number") {
      if (sign) value = -value;
      return new SmallInteger(value);
    }
    return new BigInteger(value, sign);
  }


  /**
   * Subtracts a small number from an array of digits.
   * @param {number[]} a The minuend array.
   * @param {number} b The small subtrahend.
   * @param {boolean} sign The sign of the BigInteger.
   * @returns {SmallInteger|BigInteger} The result.
   */
  function subtractSmall(a, b, sign) {
    var l = a.length,
      r = new Array(l),
      carry = -b, // Negative b acts as an initial borrow
      base = BASE,
      i, difference;

    for (i = 0; i < l; i++) {
      difference = a[i] + carry;
      carry = Math.floor(difference / base);
      difference %= base;
      r[i] = (difference < 0) ? difference + base : difference;
    }

    r = arrayToSmall(r); // Try converting to SmallInteger

    if (typeof r === "number") {
      if (sign) r = -r;
      return new SmallInteger(r);
    }
    return new BigInteger(r, sign);
  }


  // Subtraction method for BigIntegers
  BigInteger.prototype.subtract = function (v) {
    var n = parseValue(v);

    // If signs are different, perform addition instead (e.g., 5 - (-3) = 5 + 3)
    if (this.sign !== n.sign) {
      return this.add(n.negate());
    }

    var a = this.value,
      b = n.value;

    // Optimize for subtracting a SmallInteger
    if (n.isSmall) {
      return subtractSmall(a, Math.abs(b), this.sign);
    }

    // General case for subtracting two BigIntegers
    return subtractAny(a, b, this.sign);
  };

  // Alias for subtract
  BigInteger.prototype.minus = BigInteger.prototype.subtract;


  // Subtraction method for SmallIntegers
  SmallInteger.prototype.subtract = function (v) {
    var n = parseValue(v);
    var a = this.value;

    // If signs are different (or a is negative and n is positive), perform addition.
    if (a < 0 !== n.sign) {
      return this.add(n.negate());
    }

    var b = n.value;

    // If both are SmallIntegers, try direct subtraction.
    if (n.isSmall) {
      return new SmallInteger(a - b);
    }

    // If 'n' is a BigInteger, convert 'a' to an array for subtraction.
    // Note the order: it's b - abs(a), with sign determined by a >= 0.
    return subtractSmall(b, Math.abs(a), a >= 0);
  };

  // Alias for subtract
  SmallInteger.prototype.minus = SmallInteger.prototype.subtract;


  // Negates a BigInteger (flips its sign).
  BigInteger.prototype.negate = function () {
    return new BigInteger(this.value, !this.sign);
  };


  // Negates a SmallInteger.
  SmallInteger.prototype.negate = function () {
    var sign = this.sign;
    var small = new SmallInteger(-this.value);
    small.sign = !sign; // Explicitly set sign for consistency
    return small;
  };


  // Returns the absolute value of a BigInteger.
  BigInteger.prototype.abs = function () {
    return new BigInteger(this.value, false);
  };


  // Returns the absolute value of a SmallInteger.
  SmallInteger.prototype.abs = function () {
    return new SmallInteger(Math.abs(this.value));
  };


  /**
   * Multiplies two arrays of digits (long multiplication).
   * @param {number[]} a First array.
   * @param {number[]} b Second array.
   * @returns {number[]} The product array.
   */
  function multiplyLong(a, b) {
    var a_l = a.length,
      b_l = b.length,
      l = a_l + b_l, // Maximum possible length of the product
      r = createArray(l), // Result array, initialized to zeros
      base = BASE,
      product, carry, i, a_i, b_j;

    // Standard long multiplication algorithm
    for (i = 0; i < a_l; ++i) {
      a_i = a[i];
      for (var j = 0; j < b_l; ++j) {
        b_j = b[j];
        product = a_i * b_j + r[i + j]; // Add current product and previous carry/sum
        carry = Math.floor(product / base);
        r[i + j] = product - carry * base;
        r[i + j + 1] += carry; // Propagate carry to the next position
      }
    }
    trim(r); // Remove leading zeros
    return r;
  }


  /**
   * Multiplies an array of digits by a small number.
   * @param {number[]} a The array of digits.
   * @param {number} b The small multiplier.
   * @returns {number[]} The product array.
   */
  function multiplySmall(a, b) {
    var l = a.length,
      r = new Array(l),
      base = BASE,
      carry = 0,
      product, i;

    // Multiply each digit by 'b' and handle carries
    for (i = 0; i < l; i++) {
      product = a[i] * b + carry;
      carry = Math.floor(product / base);
      r[i] = product - carry * base;
    }

    // Propagate any remaining carry
    while (carry > 0) {
      r[i++] = carry % base;
      carry = Math.floor(carry / base);
    }
    return r;
  }


  /**
   * Shifts an array of digits left by 'n' positions (multiplies by BASE^n).
   * @param {number[]} x The array of digits.
   * @param {number} n The number of positions to shift.
   * @returns {number[]} The shifted array.
   */
  function shiftLeft(x, n) {
    var r = [];
    while (n-- > 0) {
      r.push(0); // Prepend zeros
    }
    return r.concat(x); // Concatenate with original array
  }


  /**
   * Multiplies two arrays of digits using Karatsuba algorithm for efficiency.
   * @param {number[]} x First array.
   * @param {number[]} y Second array.
   * @returns {number[]} The product array.
   */
  function multiplyKaratsuba(x, y) {
    var n = Math.max(x.length, y.length);

    // Base case: if arrays are small, use long multiplication
    if (n <= 30) {
      return multiplyLong(x, y);
    }

    n = Math.ceil(n / 2); // Split point

    // Split arrays into two halves
    var b = x.slice(n),
      a = x.slice(0, n),
      d = y.slice(n),
      c = y.slice(0, n);

    // Recursively calculate products
    var ac = multiplyKaratsuba(a, c),
      bd = multiplyKaratsuba(b, d),
      abcd = multiplyKaratsuba(addAny(a, b), addAny(c, d));

    // Combine results using Karatsuba formula
    var product = addAny(addAny(ac, shiftLeft(subtract(subtract(abcd, ac), bd), n)), shiftLeft(bd, 2 * n));
    trim(product); // Remove leading zeros
    return product;
  }


  /**
   * Heuristic to decide whether to use Karatsuba multiplication.
   * @param {number} l1 Length of first operand.
   * @param {number} l2 Length of second operand.
   * @returns {boolean} True if Karatsuba is likely faster.
   */
  function useKaratsuba(l1, l2) {
    // This is an empirical formula; Karatsuba is faster for larger numbers.
    return -.012 * l1 - .012 * l2 + 15e-6 * l1 * l2 > 0;
  }


  // Multiplication method for BigIntegers
  BigInteger.prototype.multiply = function (v) {
    var n = parseValue(v),
      a = this.value,
      b = n.value,
      sign = this.sign !== n.sign, // Determine overall sign
      abs;

    // Optimize for multiplication by a SmallInteger
    if (n.isSmall) {
      if (b === 0) return Integer[0]; // Multiply by zero
      if (b === 1) return this; // Multiply by one
      if (b === -1) return this.negate(); // Multiply by minus one

      abs = Math.abs(b);
      if (abs < BASE) {
        // If small multiplier fits in a single digit
        return new BigInteger(multiplySmall(a, abs), sign);
      }
      // If small multiplier is larger, convert it to array
      b = smallToArray(abs);
    }

    // Choose between Karatsuba and long multiplication
    if (useKaratsuba(a.length, b.length)) {
      return new BigInteger(multiplyKaratsuba(a, b), sign);
    }

    // Default to long multiplication
    return new BigInteger(multiplyLong(a, b), sign);
  };

  // Alias for multiply
  BigInteger.prototype.times = BigInteger.prototype.multiply;


  /**
   * Multiplies a small number by a BigInteger's array value.
   * @param {number} a The small number.
   * @param {number[]} b The BigInteger's value array.
   * @param {boolean} sign The resulting sign.
   * @returns {BigInteger} The product.
   */
  function multiplySmallAndArray(a, b, sign) {
    if (a < BASE) {
      return new BigInteger(multiplySmall(b, a), sign);
    }
    return new BigInteger(multiplyLong(b, smallToArray(a)), sign);
  }


  // Internal multiplication helper for SmallInteger with a SmallInteger
  SmallInteger.prototype._multiplyBySmall = function (a) {
    // Check if the product fits in a safe JS integer
    if (isPrecise(a.value * this.value)) {
      return new SmallInteger(a.value * this.value);
    }
    // Otherwise, convert to BigInteger multiplication
    return multiplySmallAndArray(Math.abs(a.value), smallToArray(Math.abs(this.value)), this.sign !== a.sign);
  };


  // Internal multiplication helper for BigInteger with a SmallInteger
  BigInteger.prototype._multiplyBySmall = function (a) {
    if (a.value === 0) return Integer[0];
    if (a.value === 1) return this;
    if (a.value === -1) return this.negate();
    return multiplySmallAndArray(Math.abs(a.value), this.value, this.sign !== a.sign);
  };


  // Multiplication method for SmallIntegers
  SmallInteger.prototype.multiply = function (v) {
    // Delegate to the internal _multiplyBySmall method after parsing 'v'
    return parseValue(v)._multiplyBySmall(this);
  };

  // Alias for multiply
  SmallInteger.prototype.times = SmallInteger.prototype.multiply;


  /**
   * Squares an array of digits (optimized multiplication by itself).
   * @param {number[]} a The array of digits.
   * @returns {number[]} The squared array.
   */
  function square(a) {
    var l = a.length,
      r = createArray(l + l), // Result array, max length 2*l
      base = BASE,
      product, carry, i, a_i, a_j;

    // Optimized squaring algorithm
    for (i = 0; i < l; i++) {
      a_i = a[i];
      carry = 0 - a_i * a_i; // Initialize carry with negative square (for later addition)
      for (var j = i; j < l; j++) {
        a_j = a[j];
        product = 2 * (a_i * a_j) + r[i + j] + carry; // Double product for i!=j terms
        carry = Math.floor(product / base);
        r[i + j] = product - carry * base;
      }
      r[i + l] = carry; // Store final carry for this row
    }
    trim(r); // Remove leading zeros
    return r;
  }


  // Square method for BigIntegers
  BigInteger.prototype.square = function () {
    return new BigInteger(square(this.value), false); // Result is always positive
  };


  // Square method for SmallIntegers
  SmallInteger.prototype.square = function () {
    var value = this.value * this.value;
    if (isPrecise(value)) {
      return new SmallInteger(value);
    }
    // If result overflows, convert to BigInteger square
    return new BigInteger(square(smallToArray(Math.abs(this.value))), false);
  };


  /**
   * Division and modulo using Knuth's algorithm D (normalized division).
   * This is for large BigInteger division.
   * @param {number[]} a The dividend array.
   * @param {number[]} b The divisor array.
   * @returns {[number[], number[]]} An array containing [quotient, remainder].
   */
  function divMod1(a, b) {
    var a_l = a.length,
      b_l = b.length,
      base = BASE,
      result = createArray(b.length), // Quotient will have at most a_l - b_l + 1 digits
      divisorMostSignificantDigit = b[b_l - 1],
      // Normalization factor to make divisor's MSD at least BASE/2
      lambda = Math.ceil(base / (2 * divisorMostSignificantDigit)),
      remainder = multiplySmall(a, lambda), // Normalize dividend
      divisor = multiplySmall(b, lambda), // Normalize divisor
      quotientDigit, shift, carry, borrow, i, l, q;

    // Adjust dividend length
    if (remainder.length <= a_l) remainder.push(0);
    divisor.push(0); // Extend divisor for easier shifting

    // Update divisor's MSD after normalization
    divisorMostSignificantDigit = divisor[b_l - 1];

    // Iterate from most significant digits
    for (shift = a_l - b_l; shift >= 0; shift--) {
      quotientDigit = base - 1; // Initial guess for quotient digit

      // Refine quotient digit guess based on leading digits
      if (remainder[shift + b_l] !== divisorMostSignificantDigit) {
        quotientDigit = Math.floor((remainder[shift + b_l] * base + remainder[shift + b_l - 1]) / divisorMostSignificantDigit);
      }

      carry = 0;
      borrow = 0;
      l = divisor.length;

      // Multiply divisor by guess and subtract from remainder
      for (i = 0; i < l; i++) {
        carry += quotientDigit * divisor[i];
        q = Math.floor(carry / base);
        borrow += remainder[shift + i] - (carry - q * base); // Calculate borrow
        carry = q;
        if (borrow < 0) {
          remainder[shift + i] = borrow + base;
          borrow = -1;
        } else {
          remainder[shift + i] = borrow;
          borrow = 0;
        }
      }

      // Adjust quotient digit if the guess was too high
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

    // Denormalize the remainder
    remainder = divModSmall(remainder, lambda)[0];

    // Convert results back to small numbers if possible
    return [arrayToSmall(result), arrayToSmall(remainder)];
  }


  /**
   * Alternative division algorithm for smaller BigIntegers or when divMod1 isn't ideal.
   * This is a simpler, repeated subtraction-like division.
   * @param {number[]} a The dividend array.
   * @param {number[]} b The divisor array.
   * @returns {[number[], number[]]} An array containing [quotient, remainder].
   */
  function divMod2(a, b) {
    var a_l = a.length,
      b_l = b.length,
      result = [],
      part = [],
      base = BASE,
      guess, xlen, highx, highy, check;

    // Process dividend digits from most significant to least
    while (a_l) {
      part.unshift(a[--a_l]); // Take one digit from dividend
      trim(part); // Remove leading zeros from current part

      if (compareAbs(part, b) < 0) {
        result.push(0); // If part is smaller than divisor, quotient digit is 0
        continue;
      }

      xlen = part.length;
      highx = part[xlen - 1] * base + part[xlen - 2]; // Top two digits of part
      highy = b[b_l - 1] * base + b[b_l - 2]; // Top two digits of divisor

      if (xlen > b_l) {
        highx = (highx + 1) * base; // Adjust if part has more digits than divisor
      }

      guess = Math.ceil(highx / highy); // Initial guess for quotient digit

      // Refine guess by trial subtraction
      do {
        check = multiplySmall(b, guess);
        if (compareAbs(check, part) <= 0) break; // If guess * divisor <= part, it's a good guess
        guess--;
      } while (guess);

      result.push(guess); // Store quotient digit
      part = subtract(part, check); // Subtract (guess * divisor) from part
    }

    result.reverse(); // Digits were pushed in reverse order
    return [arrayToSmall(result), arrayToSmall(part)]; // Convert to small if possible
  }


  /**
   * Performs division and modulo of an array of digits by a small number (lambda).
   * @param {number[]} value The dividend array.
   * @param {number} lambda The small divisor.
   * @returns {[number[], number]} An array containing [quotient array, remainder].
   */
  function divModSmall(value, lambda) {
    var length = value.length,
      quotient = createArray(length),
      base = BASE,
      i, q, remainder, divisor;

    remainder = 0;

    // Divide digit by digit from most significant to least
    for (i = length - 1; i >= 0; --i) {
      divisor = remainder * base + value[i];
      q = truncate(divisor / lambda); // Calculate quotient digit
      remainder = divisor - q * lambda; // Calculate new remainder
      quotient[i] = q | 0; // Store quotient digit (ensure integer)
    }
    return [quotient, remainder | 0]; // Return quotient array and final remainder
  }


  /**
   * Generic division and modulo for any two Integer types.
   * @param {Integer} self The dividend.
   * @param {*} v The divisor (will be parsed).
   * @returns {[Integer, Integer]} An array containing [quotient, remainder].
   */
  function divModAny(self, v) {
    var value, n = parseValue(v); // Parse divisor
    var a = self.value,
      b = n.value;
    var quotient;

    if (b === 0) throw new Error("Cannot divide by zero");

    // Handle cases where self (dividend) is a SmallInteger
    if (self.isSmall) {
      if (n.isSmall) {
        // Both are small, use native JS division
        return [new SmallInteger(truncate(a / b)), new SmallInteger(a % b)];
      }
      // SmallInteger dividend, BigInteger divisor: quotient is 0, remainder is dividend
      return [Integer[0], self];
    }

    // Handle cases where n (divisor) is a SmallInteger
    if (n.isSmall) {
      if (b === 1) return [self, Integer[0]]; // Divide by 1
      if (b == -1) return [self.negate(), Integer[0]]; // Divide by -1

      var abs = Math.abs(b);
      if (abs < BASE) {
        // Small divisor, use optimized divModSmall
        value = divModSmall(a, abs);
        quotient = arrayToSmall(value[0]);
        var remainder = value[1];

        // Adjust remainder sign
        if (self.sign) remainder = -remainder;

        // Convert quotient to SmallInteger or BigInteger
        if (typeof quotient === "number") {
          if (self.sign !== n.sign) quotient = -quotient; // Adjust quotient sign
          return [new SmallInteger(quotient), new SmallInteger(remainder)];
        }
        return [new BigInteger(quotient, self.sign !== n.sign), new SmallInteger(remainder)];
      }
      // Small divisor is large enough, convert to array for general division
      b = smallToArray(abs);
    }

    // General BigInteger division
    var comparison = compareAbs(a, b);
    if (comparison === -1) {
      return [Integer[0], self]; // Dividend < divisor, quotient is 0
    }
    if (comparison === 0) {
      // Dividend === divisor, quotient is 1 or -1
      return [Integer[self.sign === n.sign ? 1 : -1], Integer[0]];
    }

    // Choose division algorithm based on size
    if (a.length + b.length <= 200) {
      value = divMod1(a, b); // Knuth's algorithm D
    } else {
      value = divMod2(a, b); // Simpler repeated subtraction
    }

    quotient = value[0];
    var qSign = self.sign !== n.sign, // Quotient sign
      mod = value[1],
      mSign = self.sign; // Remainder sign is same as dividend

    // Convert quotient to SmallInteger or BigInteger
    if (typeof quotient === "number") {
      if (qSign) quotient = -quotient;
      quotient = new SmallInteger(quotient);
    } else {
      quotient = new BigInteger(quotient, qSign);
    }

    // Convert remainder to SmallInteger or BigInteger
    if (typeof mod === "number") {
      if (mSign) mod = -mod;
      mod = new SmallInteger(mod);
    } else {
      mod = new BigInteger(mod, mSign);
    }

    return [quotient, mod];
  }


  // Divmod method (returns an object with quotient and remainder)
  BigInteger.prototype.divmod = function (v) {
    var result = divModAny(this, v);
    return {
      quotient: result[0],
      remainder: result[1]
    };
  };

  // SmallInteger also gets divmod via prototype chaining
  SmallInteger.prototype.divmod = BigInteger.prototype.divmod;


  // Division method (returns only the quotient)
  BigInteger.prototype.divide = function (v) {
    return divModAny(this, v)[0];
  };

  // Aliases for division
  SmallInteger.prototype.over = SmallInteger.prototype.divide;
  BigInteger.prototype.over = BigInteger.prototype.divide;


  // Modulo method (returns only the remainder)
  BigInteger.prototype.mod = function (v) {
    return divModAny(this, v)[1];
  };

  // Aliases for modulo
  SmallInteger.prototype.remainder = SmallInteger.prototype.mod;
  BigInteger.prototype.remainder = BigInteger.prototype.mod;


  // Exponentiation (power) method
  BigInteger.prototype.pow = function (v) {
    var n = parseValue(v),
      a = this.value,
      b = n.value,
      value, x, y;

    // Handle special cases for exponent
    if (b === 0) return Integer[1]; // x^0 = 1
    if (a === 0) return Integer[0]; // 0^x = 0 (for x > 0)
    if (a === 1) return Integer[1]; // 1^x = 1
    if (a === -1) return n.isEven() ? Integer[1] : Integer[-1]; // (-1)^x

    // Negative exponent is not supported for integer results (returns 0)
    if (n.sign) {
      return Integer[0];
    }
    // Exponent must be a SmallInteger
    if (!n.isSmall) {
      throw new Error("The exponent " + n.toString() + " is too large.");
    }

    // If base is small, try native JS exponentiation
    if (this.isSmall) {
      if (isPrecise(value = Math.pow(a, b))) {
        return new SmallInteger(truncate(value));
      }
    }

    // Binary exponentiation (exponentiation by squaring)
    x = this;
    y = Integer[1]; // Accumulator for result

    while (true) {
      if ((b & 1) === 1) { // If exponent is odd
        y = y.times(x);
        --b;
      }
      if (b === 0) break; // If exponent is zero, done
      b /= 2; // Halve exponent
      x = x.square(); // Square the base
    }
    return y;
  };

  // SmallInteger also gets pow via prototype chaining
  SmallInteger.prototype.pow = BigInteger.prototype.pow;


  // Modular exponentiation (base^exp mod mod)
  BigInteger.prototype.modPow = function (exp, mod) {
    exp = parseValue(exp);
    mod = parseValue(mod);

    if (mod.isZero()) throw new Error("Cannot take modPow with modulus 0");

    var r = Integer[1], // Result accumulator (starts at 1)
      base = this.mod(mod); // Base reduced modulo modulus

    // Binary exponentiation loop
    while (exp.isPositive()) {
      if (base.isZero()) return Integer[0]; // If base is 0, result is 0
      if (exp.isOdd()) r = r.multiply(base).mod(mod); // If exponent is odd, multiply result
      exp = exp.divide(2); // Halve exponent
      base = base.square().mod(mod); // Square base
    }
    return r;
  };

  // SmallInteger also gets modPow via prototype chaining
  SmallInteger.prototype.modPow = BigInteger.prototype.modPow;


  /**
   * Compares the absolute values of two arrays of digits.
   * @param {number[]} a First array.
   * @param {number[]} b Second array.
   * @returns {number} -1 if a < b, 0 if a == b, 1 if a > b.
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


  // Compares absolute value of BigInteger with another Integer.
  BigInteger.prototype.compareAbs = function (v) {
    var n = parseValue(v),
      a = this.value,
      b = n.value;

    if (n.isSmall) return 1; // BigInteger is always 'larger' than SmallInteger in this context (unless SmallInteger is 0)
    return compareAbs(a, b);
  };


  // Compares absolute value of SmallInteger with another Integer.
  SmallInteger.prototype.compareAbs = function (v) {
    var n = parseValue(v),
      a = Math.abs(this.value),
      b = n.value;

    if (n.isSmall) {
      b = Math.abs(b);
      return (a === b) ? 0 : (a > b) ? 1 : -1;
    }
    return -1; // SmallInteger is 'smaller' than BigInteger
  };


  // Compares BigInteger with another value (handles signs).
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
      return n.sign ? 1 : -1; // If 'n' is negative, 'this' (positive) is greater
    }

    // If 'n' is a SmallInteger, and 'this' is BigInteger, 'this' is larger (unless 'this' is negative)
    if (n.isSmall) {
      return this.sign ? -1 : 1;
    }

    // Compare absolute values, then apply sign
    return compareAbs(a, b) * (this.sign ? -1 : 1);
  };

  // Alias for compare
  BigInteger.prototype.compareTo = BigInteger.prototype.compare;


  // Compares SmallInteger with another value.
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

    // If 'n' is also a SmallInteger, direct numeric comparison
    if (n.isSmall) {
      return (a == b) ? 0 : (a > b) ? 1 : -1;
    }

    // If signs are different (or a is negative and n is positive), simple sign comparison
    if (a < 0 !== n.sign) {
      return a < 0 ? -1 : 1;
    }

    // If signs are the same, but one is Small and other is Big, Big is 'larger'
    // This logic is tricky. If 'a' is negative, Small is "larger" (closer to 0) than Big negative.
    return a < 0 ? 1 : -1;
  };

  // Alias for compare
  SmallInteger.prototype.compareTo = SmallInteger.prototype.compare;


  // Equality check
  BigInteger.prototype.equals = function (v) {
    return this.compare(v) === 0;
  };

  // Aliases for equality
  SmallInteger.prototype.eq = SmallInteger.prototype.equals;
  BigInteger.prototype.eq = BigInteger.prototype.equals;


  // Inequality check
  BigInteger.prototype.notEquals = function (v) {
    return this.compare(v) !== 0;
  };

  // Aliases for inequality
  SmallInteger.prototype.neq = SmallInteger.prototype.notEquals;
  BigInteger.prototype.neq = BigInteger.prototype.notEquals;


  // Greater than check
  BigInteger.prototype.greater = function (v) {
    return this.compare(v) > 0;
  };

  // Aliases for greater than
  SmallInteger.prototype.gt = SmallInteger.prototype.greater;
  BigInteger.prototype.gt = BigInteger.prototype.greater;


  // Lesser than check
  BigInteger.prototype.lesser = function (v) {
    return this.compare(v) < 0;
  };

  // Aliases for lesser than
  SmallInteger.prototype.lt = SmallInteger.prototype.lesser;
  BigInteger.prototype.lt = BigInteger.prototype.lesser;


  // Greater than or equals check
  BigInteger.prototype.greaterOrEquals = function (v) {
    return this.compare(v) >= 0;
  };

  // Aliases for greater than or equals
  SmallInteger.prototype.geq = SmallInteger.prototype.greaterOrEquals;
  BigInteger.prototype.geq = BigInteger.prototype.greaterOrEquals;


  // Lesser than or equals check
  BigInteger.prototype.lesserOrEquals = function (v) {
    return this.compare(v) <= 0;
  };

  // Aliases for lesser than or equals
  SmallInteger.prototype.leq = SmallInteger.prototype.lesserOrEquals;
  BigInteger.prototype.leq = BigInteger.prototype.lesserOrEquals;


  // Check if BigInteger is even
  BigInteger.prototype.isEven = function () {
    return (this.value[0] & 1) === 0;
  };


  // Check if SmallInteger is even
  SmallInteger.prototype.isEven = function () {
    return (this.value & 1) === 0;
  };


  // Check if BigInteger is odd
  BigInteger.prototype.isOdd = function () {
    return (this.value[0] & 1) === 1;
  };


  // Check if SmallInteger is odd
  SmallInteger.prototype.isOdd = function () {
    return (this.value & 1) === 1;
  };


  // Check if BigInteger is positive
  BigInteger.prototype.isPositive = function () {
    return !this.sign;
  };


  // Check if SmallInteger is positive
  SmallInteger.prototype.isPositive = function () {
    return this.value > 0;
  };


  // Check if BigInteger is negative
  BigInteger.prototype.isNegative = function () {
    return this.sign;
  };


  // Check if SmallInteger is negative
  SmallInteger.prototype.isNegative = function () {
    return this.value < 0;
  };


  // Check if BigInteger is a unit (1 or -1) - always false for BigInteger
  BigInteger.prototype.isUnit = function () {
    return false;
  };


  // Check if SmallInteger is a unit (1 or -1)
  SmallInteger.prototype.isUnit = function () {
    return Math.abs(this.value) === 1;
  };


  // Check if BigInteger is zero - always false for BigInteger
  BigInteger.prototype.isZero = function () {
    return false;
  };


  // Check if SmallInteger is zero
  SmallInteger.prototype.isZero = function () {
    return this.value === 0;
  };


  // Check if divisible by another Integer
  BigInteger.prototype.isDivisibleBy = function (v) {
    var n = parseValue(v);
    var value = n.value;

    if (value === 0) return false; // Cannot divide by zero
    if (value === 1) return true; // Always divisible by 1
    if (value === 2) return this.isEven(); // Optimized check for 2

    return this.mod(n).equals(Integer[0]); // General case: remainder is zero
  };

  // SmallInteger also gets isDivisibleBy via prototype chaining
  SmallInteger.prototype.isDivisibleBy = BigInteger.prototype.isDivisibleBy;


  /**
   * Basic primality test for small numbers.
   * @param {Integer} v The number to test.
   * @returns {boolean|undefined} True if prime, false if composite, undefined if inconclusive.
   */
  function isBasicPrime(v) {
    var n = v.abs();
    if (n.isUnit()) return false; // 1 is not prime
    if (n.equals(2) || n.equals(3) || n.equals(5)) return true; // Small primes
    if (n.isEven() || n.isDivisibleBy(3) || n.isDivisibleBy(5)) return false; // Divisible by small primes
    if (n.lesser(25)) return true; // All primes below 25 are covered
  }


  // Primality test for BigIntegers (Miller-Rabin)
  BigInteger.prototype.isPrime = function () {
    var isPrime = isBasicPrime(this);
    if (isPrime !== undefined) return isPrime; // Use basic test results

    var n = this.abs(),
      nPrev = n.prev(); // n - 1

    // Array of small prime bases for Miller-Rabin
    var a = [2, 3, 5, 7, 11, 13, 17, 19],
      b = nPrev,
      d, t, i, x;

    while (b.isEven()) b = b.divide(2); // Find d such that n-1 = d * 2^s

    // Iterate through Miller-Rabin bases
    for (i = 0; i < a.length; i++) {
      x = bigInt(a[i]).modPow(b, n); // Calculate a^d mod n

      if (x.equals(Integer[1]) || x.equals(nPrev)) continue; // Passes initial test

      // Check subsequent squares
      for (t = true, d = b; t && d.lesser(nPrev); d = d.multiply(2)) {
        x = x.square().mod(n);
        if (x.equals(nPrev)) t = false; // Passes secondary test
      }
      if (t) return false; // Fails Miller-Rabin test, definitely composite
    }
    return true; // Likely prime
  };

  // SmallInteger also gets isPrime via prototype chaining
  SmallInteger.prototype.isPrime = BigInteger.prototype.isPrime;


  // Probable primality test (Miller-Rabin with random bases)
  BigInteger.prototype.isProbablePrime = function (iterations) {
    var isPrime = isBasicPrime(this);
    if (isPrime !== undefined) return isPrime;

    var n = this.abs();
    var t = (iterations === undefined) ? 5 : iterations; // Number of iterations

    for (var i = 0; i < t; i++) {
      // Choose a random base 'a' between 2 and n-2
      var a = bigInt.randBetween(2, n.minus(2));
      // If a^(n-1) mod n is not 1, then n is composite (Fermat's Little Theorem)
      if (!a.modPow(n.prev(), n).isUnit()) return false;
    }
    return true; // Probably prime
  };

  // SmallInteger also gets isProbablePrime via prototype chaining
  SmallInteger.prototype.isProbablePrime = BigInteger.prototype.isProbablePrime;


  // Modular inverse (a^-1 mod n) using extended Euclidean algorithm
  BigInteger.prototype.modInv = function (n) {
    var t = bigInt.zero, // Previous remainder coefficient
      newT = bigInt.one, // Current remainder coefficient
      r = parseValue(n), // Previous remainder (modulus)
      newR = this.abs(), // Current remainder (this number's absolute value)
      q, lastT, lastR;

    // Extended Euclidean algorithm
    while (!newR.equals(bigInt.zero)) {
      q = r.divide(newR); // Quotient
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
      return t.negate(); // Adjust for negative 'this'
    }
    return t;
  };

  // SmallInteger also gets modInv via prototype chaining
  SmallInteger.prototype.modInv = BigInteger.prototype.modInv;


  // Returns the next integer (this + 1)
  BigInteger.prototype.next = function () {
    var value = this.value;
    if (this.sign) {
      return subtractSmall(value, 1, this.sign); // If negative, subtract 1 from abs value
    }
    return new BigInteger(addSmall(value, 1), this.sign); // If positive, add 1
  };


  // Returns the next integer for SmallInteger
  SmallInteger.prototype.next = function () {
    var value = this.value;
    if (value + 1 < MAX_INT) {
      return new SmallInteger(value + 1);
    }
    // If overflow, convert to BigInteger
    return new BigInteger(MAX_INT_ARR, false);
  };


  // Returns the previous integer (this - 1)
  BigInteger.prototype.prev = function () {
    var value = this.value;
    if (this.sign) {
      return new BigInteger(addSmall(value, 1), true); // If negative, add 1 to abs value (making it less negative)
    }
    return subtractSmall(value, 1, this.sign); // If positive, subtract 1
  };


  // Returns the previous integer for SmallInteger
  SmallInteger.prototype.prev = function () {
    var value = this.value;
    if (value - 1 > -MAX_INT) {
      return new SmallInteger(value - 1);
    }
    // If underflow, convert to BigInteger
    return new BigInteger(MAX_INT_ARR, true);
  };


  // --- Bitwise Operations ---

  // Precompute powers of two up to BASE for efficient shifting
  var powersOfTwo = [1];
  while (2 * powersOfTwo[powersOfTwo.length - 1] <= BASE) {
    powersOfTwo.push(2 * powersOfTwo[powersOfTwo.length - 1]);
  }
  var powers2Length = powersOfTwo.length,
    highestPower2 = powersOfTwo[powers2Length - 1];


  /**
   * Helper to check if shift amount is small enough (fits in JS number).
   * @param {*} n The shift amount.
   * @returns {boolean} True if small, false otherwise.
   */
  function shift_isSmall(n) {
    return (typeof n === "number" || typeof n === "string") && +Math.abs(n) <= BASE ||
      (n instanceof BigInteger && n.value.length <= 1);
  }


  // Left bit shift (multiplication by powers of 2)
  BigInteger.prototype.shiftLeft = function (n) {
    if (!shift_isSmall(n)) {
      throw new Error(String(n) + " is too large for shifting.");
    }
    n = +n; // Ensure number type

    if (n < 0) return this.shiftRight(-n); // Delegate to right shift for negative shifts

    var result = this;
    if (result.isZero()) return result;

    // Perform shifts in chunks using precomputed powersOfTwo
    while (n >= powers2Length) {
      result = result.multiply(highestPower2);
      n -= powers2Length - 1; // Adjust remaining shift amount
    }
    return result.multiply(powersOfTwo[n]);
  };

  // SmallInteger also gets shiftLeft via prototype chaining
  SmallInteger.prototype.shiftLeft = BigInteger.prototype.shiftLeft;


  // Right bit shift (division by powers of 2)
  BigInteger.prototype.shiftRight = function (n) {
    var remQuo;
    if (!shift_isSmall(n)) {
      throw new Error(String(n) + " is too large for shifting.");
    }
    n = +n;

    if (n < 0) return this.shiftLeft(-n); // Delegate to left shift for negative shifts

    var result = this;
    // Handle edge case for 0 or -1
    if (result.isZero() || (result.isNegative() && result.isUnit())) return result;

    // Perform shifts in chunks using precomputed powersOfTwo
    while (n >= powers2Length) {
      remQuo = divModAny(result, highestPower2);
      // Adjust quotient for negative remainders (floor division)
      result = remQuo[1].isNegative() ? remQuo[0].prev() : remQuo[0];
      n -= powers2Length - 1;
    }

    remQuo = divModAny(result, powersOfTwo[n]);
    // Adjust quotient for negative remainders (floor division)
    return remQuo[1].isNegative() ? remQuo[0].prev() : remQuo[0];
  };

  // SmallInteger also gets shiftRight via prototype chaining
  SmallInteger.prototype.shiftRight = BigInteger.prototype.shiftRight;


  /**
   * Generic bitwise operation function.
   * Handles sign extension for negative numbers by converting to two's complement equivalent.
   * @param {Integer} x First operand.
   * @param {Integer} y Second operand.
   * @param {function(number, number): number} fn The bitwise function (e.g., &, |, ^).
   * @returns {Integer} The result.
   */
  function bitwise(x, y, fn) {
    y = parseValue(y); // Ensure y is an Integer

    var xSign = x.isNegative(),
      ySign = y.isNegative();

    // Convert negative numbers to their "two's complement" positive equivalent for operation
    var xRem = xSign ? x.not() : x,
      yRem = ySign ? y.not() : y;

    var xDigit = 0,
      yDigit = 0;
    var xDivMod = null,
      yDivMod = null;
    var result = [];

    // Process digits from LSB to MSB
    while (!xRem.isZero() || !yRem.isZero()) {
      xDivMod = divModAny(xRem, highestPower2);
      xDigit = xDivMod[1].toJSNumber();
      if (xSign) {
        xDigit = highestPower2 - 1 - xDigit; // Apply two's complement logic
      }

      yDivMod = divModAny(yRem, highestPower2);
      yDigit = yDivMod[1].toJSNumber();
      if (ySign) {
        yDigit = highestPower2 - 1 - yDigit; // Apply two's complement logic
      }

      xRem = xDivMod[0];
      yRem = yDivMod[0];

      result.push(fn(xDigit, yDigit)); // Apply the bitwise function
    }

    // Determine the sign of the result based on the most significant bits
    var sum = fn(xSign ? 1 : 0, ySign ? 1 : 0) !== 0 ? bigInt(-1) : bigInt(0);

    // Reconstruct the result from digits
    for (var i = result.length - 1; i >= 0; i -= 1) {
      sum = sum.multiply(highestPower2).add(bigInt(result[i]));
    }
    return sum;
  }


  // Bitwise NOT (two's complement negation)
  BigInteger.prototype.not = function () {
    return this.negate().prev(); // Equivalent to -(x + 1)
  };

  // SmallInteger also gets not via prototype chaining
  SmallInteger.prototype.not = BigInteger.prototype.not;


  // Bitwise AND
  BigInteger.prototype.and = function (n) {
    return bitwise(this, n, function (a, b) {
      return a & b;
    });
  };

  // SmallInteger also gets and via prototype chaining
  SmallInteger.prototype.and = BigInteger.prototype.and;


  // Bitwise OR
  BigInteger.prototype.or = function (n) {
    return bitwise(this, n, function (a, b) {
      return a | b;
    });
  };

  // SmallInteger also gets or via prototype chaining
  SmallInteger.prototype.or = BigInteger.prototype.or;


  // Bitwise XOR
  BigInteger.prototype.xor = function (n) {
    return bitwise(this, n, function (a, b) {
      return a ^ b;
    });
  };

  // SmallInteger also gets xor via prototype chaining
  SmallInteger.prototype.xor = BigInteger.prototype.xor;


  // --- Utility Functions ---

  // Mask for finding the lowest set bit (for roughLOB)
  var LOBMASK_I = 1 << 30, // For small numbers
    LOBMASK_BI = (BASE & -BASE) * (BASE & -BASE) | LOBMASK_I; // For BigIntegers (multi-digit)


  /**
   * Rough estimate of the Lowest One Bit (LOB) for an Integer.
   * @param {Integer} n The Integer.
   * @returns {number} A power of 2 representing the LOB.
   */
  function roughLOB(n) {
    var v = n.value,
      x = (typeof v === "number") ? v | LOBMASK_I : v[0] + v[1] * BASE | LOBMASK_BI;
    return x & -x; // Classic trick to get LOB
  }


  /**
   * Calculates integer logarithm (base 2) for bitLength.
   * @param {Integer} value The number.
   * @param {Integer} base The base of the logarithm.
   * @returns {{p: Integer, e: number}} An object with power and exponent.
   */
  function integerLogarithm(value, base) {
    if (base.compareTo(value) <= 0) {
      var tmp = integerLogarithm(value, base.square()); // Recursively compute for base^2
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


  // Calculates the number of bits required to represent the absolute value of the BigInteger.
  BigInteger.prototype.bitLength = function () {
    var n = this;
    if (n.compareTo(bigInt(0)) < 0) {
      n = n.negate().subtract(bigInt(1)); // Two's complement for negative numbers
    }
    if (n.compareTo(bigInt(0)) === 0) {
      return bigInt(0); // Bit length of 0 is 0
    }
    // Use integerLogarithm (base 2) and add 1
    return bigInt(integerLogarithm(n, bigInt(2)).e).add(bigInt(1));
  };

  // SmallInteger also gets bitLength via prototype chaining
  SmallInteger.prototype.bitLength = BigInteger.prototype.bitLength;


  /**
   * Returns the greater of two Integers.
   * @param {*} a First value.
   * @param {*} b Second value.
   * @returns {Integer} The maximum.
   */
  function max(a, b) {
    a = parseValue(a);
    b = parseValue(b);
    return a.greater(b) ? a : b;
  }


  /**
   * Returns the lesser of two Integers.
   * @param {*} a First value.
   * @param {*} b Second value.
   * @returns {Integer} The minimum.
   */
  function min(a, b) {
    a = parseValue(a);
    b = parseValue(b);
    return a.lesser(b) ? a : b;
  }


  /**
   * Calculates the Greatest Common Divisor (GCD) of two Integers using binary GCD.
   * @param {*} a First value.
   * @param {*} b Second value.
   * @returns {Integer} The GCD.
   */
  function gcd(a, b) {
    a = parseValue(a).abs();
    b = parseValue(b).abs();

    if (a.equals(b)) return a;
    if (a.isZero()) return b;
    if (b.isZero()) return a;

    var c = Integer[1], // Factor of 2
      d, t;

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

    do {
      // Remove factors of 2 from 'b'
      while (b.isEven()) {
        b = b.divide(roughLOB(b));
      }

      // Ensure a <= b
      if (a.greater(b)) {
        t = b;
        b = a;
        a = t;
      }

      b = b.subtract(a); // Euclidean step
    } while (!b.isZero());

    return c.isUnit() ? a : a.multiply(c); // Multiply back common factors of 2
  }


  /**
   * Calculates the Least Common Multiple (LCM) of two Integers.
   * LCM(a,b) = |a*b| / GCD(a,b)
   * @param {*} a First value.
   * @param {*} b Second value.
   * @returns {Integer} The LCM.
   */
  function lcm(a, b) {
    a = parseValue(a).abs();
    b = parseValue(b).abs();
    return a.divide(gcd(a, b)).multiply(b);
  }


  /**
   * Generates a random Integer between 'a' and 'b' (inclusive).
   * @param {*} a Lower bound.
   * @param {*} b Upper bound.
   * @returns {Integer} A random Integer.
   */
  function randBetween(a, b) {
    a = parseValue(a);
    b = parseValue(b);

    var low = min(a, b),
      high = max(a, b);
    var range = high.subtract(low).add(1);

    // If range is small enough, use native Math.random
    if (range.isSmall) {
      return low.add(Math.floor(Math.random() * range));
    }

    var length = range.value.length - 1;
    var result = [],
      restricted = true;

    // Generate random digits, ensuring the number doesn't exceed 'range'
    for (var i = length; i >= 0; i--) {
      var top = restricted ? range.value[i] : BASE;
      var digit = truncate(Math.random() * top);
      result.unshift(digit);
      if (digit < top) restricted = false; // Once a digit is smaller, subsequent digits can be anything
    }

    result = arrayToSmall(result); // Convert to SmallInteger if possible
    return low.add(typeof result === "number" ? new SmallInteger(result) : new BigInteger(result, false));
  }


  /**
   * Parses a string representation of a number in a given base.
   * @param {string} text The string to parse.
   * @param {number} base The base (radix).
   * @returns {Integer} The parsed Integer.
   * @throws {Error} If the string contains invalid digits for the base.
   */
  var parseBase = function (text, base) {
    var length = text.length;
    var i;
    var absBase = Math.abs(base);

    // Validate digits for the given base
    for (var i = 0; i < length; i++) {
      var c = text[i].toLowerCase();
      if (c === "-") continue; // Skip minus sign
      if (/[a-z0-9]/.test(c)) { // Check if it's an alphanumeric digit
        if (/[0-9]/.test(c) && +c >= absBase) {
          if (c === "1" && absBase === 1) continue; // Special case for base 1
          throw new Error(c + " is not a valid digit in base " + base + ".");
        } else if (c.charCodeAt(0) - 87 >= absBase) {
          throw new Error(c + " is not a valid digit in base " + base + ".");
        }
      }
    }

    // Optimization for common bases (2-36) that fit in native parseInt
    if (2 <= base && base <= 36) {
      // Check if the number of digits is small enough to fit in MAX_INT
      if (length <= LOG_MAX_INT / Math.log(base)) {
        var result = parseInt(text, base);
        if (isNaN(result)) {
          // This error message seems to reuse 'c' which might be undefined here.
          // Original code has this bug. Keeping it as is for Type I.
          throw new Error(c + " is not a valid digit in base " + base + ".");
        }
        return new SmallInteger(parseInt(text, base));
      }
    }

    base = parseValue(base); // Ensure base is an Integer
    var digits = [];
    var isNegative = text[0] === "-";

    // Convert string digits to Integer objects
    for (i = isNegative ? 1 : 0; i < text.length; i++) {
      var c = text[i].toLowerCase(),
        charCode = c.charCodeAt(0);
      if (48 <= charCode && charCode <= 57) {
        digits.push(parseValue(c));
      } else if (97 <= charCode && charCode <= 122) {
        digits.push(parseValue(c.charCodeAt(0) - 87));
      } else if (c === "<") { // Handle custom digits like <10>
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
   * Parses an array of Integer digits in a given base.
   * @param {Integer[]} digits The array of digits (as Integer objects).
   * @param {Integer} base The base.
   * @param {boolean} isNegative True if the number is negative.
   * @returns {Integer} The parsed Integer.
   */
  function parseBaseFromArray(digits, base, isNegative) {
    var val = Integer[0], // Accumulator for the result
      pow = Integer[1], // Current power of the base
      i;

    // Horner's method (or polynomial evaluation)
    for (i = digits.length - 1; i >= 0; i--) {
      val = val.add(digits[i].times(pow));
      pow = pow.times(base);
    }
    return isNegative ? val.negate() : val;
  }


  /**
   * Converts a digit (0-35) or a custom digit to its string representation.
   * @param {number} digit The digit to stringify.
   * @returns {string} The string representation.
   */
  function stringify(digit) {
    if (digit <= 35) {
      return "0123456789abcdefghijklmnopqrstuvwxyz".charAt(digit);
    }
    return "<" + digit + ">"; // For custom digits > 35
  }


  /**
   * Converts an Integer to an array of digits in a specified base.
   * @param {Integer} n The Integer to convert.
   * @param {Integer} base The target base.
   * @returns {{value: number[], isNegative: boolean}} Object with digit array and sign.
   * @throws {Error} If base is 0 or invalid.
   */
  function toBase(n, base) {
    base = bigInt(base); // Ensure base is an Integer

    if (base.isZero()) {
      if (n.isZero()) return {
        value: [0],
        isNegative: false
      };
      throw new Error("Cannot convert nonzero numbers to base 0.");
    }

    // Special handling for base -1 (alternating base representation)
    if (base.equals(-1)) {
      if (n.isZero()) return {
        value: [0],
        isNegative: false
      };
      if (n.isNegative()) {
        // Convert negative numbers using specific pattern
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
      n = n.abs(); // Work with absolute value for conversion
    }

    // Special handling for base 1
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

    // Repeatedly divide by base and collect remainders
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
    out.push(left.toJSNumber()); // Push the last quotient
    return {
      value: out.reverse(),
      isNegative: neg
    }; // Reverse and return
  }


  /**
   * Converts an Integer to its string representation in a specified base.
   * @param {Integer} n The Integer to convert.
   * @param {number} base The target base.
   * @returns {string} The string representation.
   */
  function toBaseString(n, base) {
    var arr = toBase(n, base);
    return (arr.isNegative ? "-" : "") + arr.value.map(stringify).join("");
  }


  // Converts BigInteger to an array of digits in a given radix.
  BigInteger.prototype.toArray = function (radix) {
    return toBase(this, radix);
  };

  // SmallInteger also gets toArray via prototype chaining
  SmallInteger.prototype.toArray = function (radix) {
    return toBase(this, radix);
  };


  // Converts BigInteger to its string representation.
  BigInteger.prototype.toString = function (radix) {
    if (radix === undefined) radix = 10;

    if (radix !== 10) return toBaseString(this, radix); // Delegate for non-base 10

    var v = this.value,
      l = v.length,
      str = String(v[--l]), // Start with the most significant digit
      zeros = "0000000",
      digit;

    // Append remaining digits, padding with zeros if necessary
    while (--l >= 0) {
      digit = String(v[l]);
      str += zeros.slice(digit.length) + digit;
    }
    var sign = this.sign ? "-" : "";
    return sign + str;
  };


  // Converts SmallInteger to its string representation.
  SmallInteger.prototype.toString = function (radix) {
    if (radix === undefined) radix = 10;
    if (radix != 10) return toBaseString(this, radix); // Delegate for non-base 10
    return String(this.value);
  };


  // JSON serialization method (returns string representation)
  BigInteger.prototype.toJSON = SmallInteger.prototype.toJSON = function () {
    return this.toString();
  };


  // ValueOf for BigInteger (returns integer part of string, potentially lossy)
  BigInteger.prototype.valueOf = function () {
    return parseInt(this.toString(), 10);
  };

  // Alias for valueOf
  BigInteger.prototype.toJSNumber = BigInteger.prototype.valueOf;


  // ValueOf for SmallInteger (returns native number)
  SmallInteger.prototype.valueOf = function () {
    return this.value;
  };

  // Alias for valueOf
  SmallInteger.prototype.toJSNumber = SmallInteger.prototype.valueOf;


  /**
   * Parses a string into an Integer. Handles scientific notation and decimal points.
   * @param {string} v The string to parse.
   * @returns {SmallInteger|BigInteger} The parsed Integer.
   * @throws {Error} If the string is not a valid integer.
   */
  function parseStringValue(v) {
    // Check if it fits into a precise JavaScript number first
    if (isPrecise(+v)) {
      var x = +v;
      if (x === truncate(x)) return new SmallInteger(x);
      throw new Error("Invalid integer: " + v); // Not an integer (e.g., decimal)
    }

    var sign = v[0] === "-";
    if (sign) v = v.slice(1); // Remove sign for processing

    var split = v.split(/e/i); // Handle scientific notation
    if (split.length > 2) {
      throw new Error("Invalid integer: " + split.join("e"));
    }

    if (split.length === 2) {
      var exp = split[1];
      if (exp[0] === "+") exp = exp.slice(1);
      exp = +exp; // Convert exponent to number

      // Validate exponent
      if (exp !== truncate(exp) || !isPrecise(exp)) {
        throw new Error("Invalid integer: " + exp + " is not a valid exponent.");
      }

      var text = split[0];
      var decimalPlace = text.indexOf(".");
      if (decimalPlace >= 0) {
        // Adjust exponent for decimal places
        exp -= text.length - decimalPlace - 1;
        text = text.slice(0, decimalPlace) + text.slice(decimalPlace + 1);
      }
      if (exp < 0) {
        throw new Error("Cannot include negative exponent part for integers");
      }
      // Append zeros for positive exponent
      text += new Array(exp + 1).join("0");
      v = text;
    }

    // Final validation for integer format
    var isValid = /^([0-9][0-9]*)$/.test(v);
    if (!isValid) {
      throw new Error("Invalid integer: " + v);
    }

    var r = [],
      max = v.length,
      l = LOG_BASE,
      min = max - l;

    // Convert string to array of digits (BASE-based)
    while (max > 0) {
      r.push(+v.slice(min, max));
      min -= l;
      if (min < 0) min = 0;
      max -= l;
    }
    trim(r); // Remove leading zeros
    return new BigInteger(r, sign);
  }


  /**
   * Parses a number (JavaScript native) into an Integer.
   * @param {number} v The number to parse.
   * @returns {SmallInteger|BigInteger} The parsed Integer.
   * @throws {Error} If the number is not an integer.
   */
  function parseNumberValue(v) {
    if (isPrecise(v)) {
      if (v !== truncate(v)) {
        throw new Error(v + " is not an integer.");
      }
      return new SmallInteger(v);
    }
    // If not precise, convert to string and parse
    return parseStringValue(v.toString());
  }


  /**
   * Universal parsing function for various input types into an Integer.
   * @param {*} v The value to parse.
   * @returns {SmallInteger|BigInteger} The parsed Integer.
   */
  function parseValue(v) {
    if (typeof v === "number") {
      return parseNumberValue(v);
    }
    if (typeof v === "string") {
      return parseStringValue(v);
    }
    // If it's already an Integer instance, return it directly
    return v;
  }


  // --- Pre-populate small integer cache ---
  for (var i = 0; i < 1e3; i++) {
    Integer[i] = new SmallInteger(i);
    if (i > 0) Integer[-i] = new SmallInteger(-i);
  }


  // --- Exported Helper Properties and Methods ---
  Integer.one = Integer[1];
  Integer.zero = Integer[0];
  Integer.minusOne = Integer[-1];

  Integer.max = max;
  Integer.min = min;
  Integer.gcd = gcd;
  Integer.lcm = lcm;

  // Type checking utility
  Integer.isInstance = function (x) {
    return x instanceof BigInteger || x instanceof SmallInteger;
  };

  Integer.randBetween = randBetween;

  // Factory method to create an Integer from an array of digits
  Integer.fromArray = function (digits, base, isNegative) {
    // Map digits to Integer objects and parse the base
    return parseBaseFromArray(digits.map(parseValue), parseValue(base || 10), isNegative);
  };

  return Integer; // Return the factory function
}(); // IIFE immediately invoked


/**
 * Main function to process input and calculate the result.
 * @param {string} arg The input string from stdin.
 */
function Main(arg) {

  // Parse the first line of input as a number N
  var N = arg.split("\n")[0] - 0;

  // Calculate (N-1) * N / 2 using the bigInt library
  // This is the formula for sum of integers from 1 to N-1
  var ans = bigInt((bigInt(N - 1).multiply(N))).divide(2);

  // Print the result to console
  console.log(ans.toString());
}

// Read input from stdin and call Main
Main(require("fs").readFileSync("/dev/stdin", "utf8"));