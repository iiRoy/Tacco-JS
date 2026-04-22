/*
 * This file implements a comprehensive BigInteger library in JavaScript,
 * along with a utility for parsing input and a main function
 * to solve a specific algorithmic problem.
 *
 * The BigInt library handles arbitrarily large integers,
 * overcoming JavaScript's native number limitations.
 */
var bigInt = function(undefined) {
  "use strict"; // Enforce strict mode for cleaner code.

  // --- Configuration Constants ---

  // Base for internal array representation (10^7).
  // Each element in the array represents a 'digit' in this base.
  var BASE = 1e7;

  // Logarithm of the base, used for calculations like digit counts.
  var LOG_BASE = 7;

  // Maximum safe integer value in JavaScript (2^53 - 1).
  var MAX_INT = 9007199254740992;

  // Array representation of MAX_INT, useful for comparisons with big integers.
  var MAX_INT_ARR = smallToArray(MAX_INT);

  // Logarithm of MAX_INT, assists in optimizing string parsing.
  var LOG_MAX_INT = Math.log(MAX_INT);

  // --- Core Integer Constructor and Prototypes ---

  /**
   * The primary constructor for Integer objects.
   * It acts as a factory, returning either a SmallInteger or a BigInteger
   * based on the input value and radix.
   *
   * @param {any} v - The value to be converted into an Integer.
   * @param {number} [radix] - The base of the number string if `v` is a string.
   * @returns {Integer} An instance of SmallInteger or BigInteger.
   */
  function Integer(v, radix) {
    if (typeof v === "undefined") {
      // If no value is provided, default to zero.
      return Integer[0];
    }

    if (typeof radix !== "undefined") {
      // If a radix is specified, handle base conversion.
      // Optimization: if radix is 10, use standard parsing.
      return +radix === 10 ? parseValue(v) : parseBase(v, radix);
    }

    // Default case: parse the value directly (handles numbers and base-10 strings).
    return parseValue(v);
  }

  /**
   * Constructor for BigInteger objects.
   * Represents numbers that exceed JavaScript's safe integer range.
   *
   * @param {number[]} value - An array of numbers, where each element is a 'digit' in BASE.
   * @param {boolean} sign - True if the number is negative, false otherwise.
   */
  function BigInteger(value, sign) {
    this.value = value;
    this.sign = sign;
    this.isSmall = false; // Flag to indicate it's a BigInteger.
  }

  // Set up inheritance: BigInteger inherits from Integer.
  BigInteger.prototype = Object.create(Integer.prototype);


  /**
   * Constructor for SmallInteger objects.
   * Represents numbers that fit within JavaScript's safe integer range.
   *
   * @param {number} value - The numerical value.
   */
  function SmallInteger(value) {
    this.value = value;
    this.sign = value < 0; // Determine sign from the value.
    this.isSmall = true; // Flag to indicate it's a SmallInteger.
  }

  // Set up inheritance: SmallInteger inherits from Integer.
  SmallInteger.prototype = Object.create(Integer.prototype);


  // --- Utility Functions for Internal Representation ---

  /**
   * Checks if a given number can be precisely represented as a JavaScript number.
   * This is crucial for determining whether to use SmallInteger or BigInteger.
   *
   * @param {number} n - The number to check.
   * @returns {boolean} True if the number is within the safe integer range, false otherwise.
   */
  function isPrecise(n) {
    return -MAX_INT < n && n < MAX_INT;
  }

  /**
   * Converts a standard JavaScript number into its base-BASE array representation.
   * This is used when a SmallInteger needs to interact with BigInteger arithmetic.
   *
   * @param {number} n - The JavaScript number to convert.
   * @returns {number[]} An array of digits in base BASE.
   */
  function smallToArray(n) {
    // Optimized for numbers that fit within one, two, or three BASE digits.
    if (n < 1e7) {
      return [n];
    }
    if (n < 1e14) {
      return [n % 1e7, Math.floor(n / 1e7)];
    }
    // For numbers up to 10^21 (approx MAX_INT).
    return [n % 1e7, Math.floor(n / 1e7) % 1e7, Math.floor(n / 1e14)];
  }

  /**
   * Attempts to convert a base-BASE array representation back into a
   * standard JavaScript number if it fits within the safe integer range.
   *
   * @param {number[]} arr - The array of digits in base BASE.
   * @returns {number|number[]} The numerical value if small, otherwise the original array.
   */
  function arrayToSmall(arr) {
    trim(arr); // Remove any leading zero 'digits'.
    var length = arr.length;

    // Check if the array represents a number that fits in a SmallInteger.
    if (length < 4 && compareAbs(arr, MAX_INT_ARR) < 0) {
      switch (length) {
        case 0:
          return 0; // Empty array represents zero.
        case 1:
          return arr[0];
        case 2:
          return arr[0] + arr[1] * BASE;
        default: // Case 3
          return arr[0] + (arr[1] + arr[2] * BASE) * BASE;
      }
    }
    return arr; // If it's too large, return the array itself.
  }

  /**
   * Removes leading zero 'digits' from a base-BASE array.
   * This ensures canonical representation and avoids unnecessary calculations.
   *
   * @param {number[]} v - The array to trim in place.
   */
  function trim(v) {
    var i = v.length;
    // Find the highest index with a non-zero digit.
    while (v[--i] === 0 && i > 0);
    v.length = i + 1; // Adjust the array length.
  }

  /**
   * Creates a new array of a specified length, initialized with zeros.
   * This is a common helper for arithmetic operations.
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
   * Truncates a number, effectively removing its fractional part.
   * Works for both positive and negative numbers (e.g., truncate(3.7) -> 3, truncate(-3.7) -> -3).
   *
   * @param {number} n - The number to truncate.
   * @returns {number} The integer part of the number.
   */
  function truncate(n) {
    if (n > 0) {
      return Math.floor(n);
    }
    return Math.ceil(n);
  }

  // --- Arithmetic Operations: Addition ---

  /**
   * Performs addition of two non-negative base-BASE arrays.
   * Assumes `a` is at least as long as `b`.
   *
   * @param {number[]} a - The first operand (minuend).
   * @param {number[]} b - The second operand (subtrahend).
   * @returns {number[]} The result of the addition.
   */
  function add(a, b) {
    var l_a = a.length,
      l_b = b.length,
      r = new Array(l_a), // Result array will be at most l_a + 1 long.
      carry = 0,
      base = BASE,
      sum, i;

    // Add corresponding digits from both arrays.
    for (i = 0; i < l_b; i++) {
      sum = a[i] + b[i] + carry;
      carry = sum >= base ? 1 : 0; // Calculate carry for the next digit.
      r[i] = sum - carry * base; // Store the current digit.
    }

    // Propagate any remaining carry through the longer array.
    while (i < l_a) {
      sum = a[i] + carry;
      carry = sum === base ? 1 : 0; // Carry is 1 if sum equals base.
      r[i++] = sum - carry * base;
    }

    // If there's a final carry, append it to the result.
    if (carry > 0)
    {
      r.push(carry);
    }
    return r;
  }

  /**
   * Handles addition of two base-BASE arrays, ensuring the longer array is passed first to `add`.
   *
   * @param {number[]} a - The first array operand.
   * @param {number[]} b - The second array operand.
   * @returns {number[]} The sum of the two arrays.
   */
  function addAny(a, b) {
    if (a.length >= b.length)
    {
      return add(a, b);
    }
    return add(b, a); // Swap if 'b' is longer.
  }

  /**
   * Adds a small number (carry) to a base-BASE array.
   * This is an optimized function for incrementing or adding a small constant.
   *
   * @param {number[]} a - The array to which the small number is added.
   * @param {number} carry - The small number (integer) to add.
   * @returns {number[]} The resulting array after addition.
   */
  function addSmall(a, carry) {
    var l = a.length,
      r = new Array(l),
      base = BASE,
      sum, i;

    for (i = 0; i < l; i++) {
      sum = a[i] - base + carry; // Pre-subtract base for more efficient carry calculation.
      carry = Math.floor(sum / base);
      r[i] = sum - carry * base;
      carry += 1; // Restore carry to positive.
    }

    // Handle any remaining carry.
    while (carry > 0) {
      r[i++] = carry % base;
      carry = Math.floor(carry / base);
    }
    return r;
  }

  /**
   * BigInteger prototype method for addition.
   * Handles different signs and delegates to appropriate internal add functions.
   *
   * @param {any} v - The value to add (can be number, string, or Integer object).
   * @returns {BigInteger} The sum as a new BigInteger instance.
   */
  BigInteger.prototype.add = function(v) {
    var n = parseValue(v); // Ensure 'v' is an Integer object.

    // If signs are different, convert addition to subtraction.
    if (this.sign !== n.sign) {
      return this.subtract(n.negate());
    }

    var a = this.value,
      b = n.value;

    // Optimized path if the other operand is a SmallInteger.
    if (n.isSmall) {
      return new BigInteger(addSmall(a, Math.abs(b)), this.sign);
    }

    // General case for adding two BigIntegers.
    return new BigInteger(addAny(a, b), this.sign);
  };

  // Provide an alias for the add method.
  BigInteger.prototype.plus = BigInteger.prototype.add;

  /**
   * SmallInteger prototype method for addition.
   * Optimizes for small integer arithmetic, then delegates to BigInteger logic if necessary.
   *
   * @param {any} v - The value to add.
   * @returns {SmallInteger|BigInteger} The sum, potentially as a BigInteger if it overflows.
   */
  SmallInteger.prototype.add = function(v) {
    var n = parseValue(v);
    var a = this.value;

    // If signs are different, convert addition to subtraction.
    if (a < 0 !== n.sign) {
      return this.subtract(n.negate());
    }

    var b = n.value;

    // If both operands are SmallIntegers.
    if (n.isSmall) {
      if (isPrecise(a + b))
      {
        return new SmallInteger(a + b); // Direct addition if result is precise.
      }
      // If result overflows, convert 'b' to array for BigInteger addition.
      b = smallToArray(Math.abs(b));
    }

    // Fallback to BigInteger addition.
    return new BigInteger(addSmall(b, Math.abs(a)), a < 0);
  };

  // Provide an alias for the add method.
  SmallInteger.prototype.plus = SmallInteger.prototype.add;


  // --- Arithmetic Operations: Subtraction ---

  /**
   * Performs subtraction of two non-negative base-BASE arrays.
   * Assumes `a` is greater than or equal to `b` in absolute value.
   *
   * @param {number[]} a - The minuend array.
   * @param {number[]} b - The subtrahend array.
   * @returns {number[]} The result of the subtraction.
   */
  function subtract(a, b) {
    var a_l = a.length,
      b_l = b.length,
      r = new Array(a_l),
      borrow = 0,
      base = BASE,
      i, difference;

    // Subtract corresponding digits and handle borrow.
    for (i = 0; i < b_l; i++) {
      difference = a[i] - borrow - b[i];
      if (difference < 0) {
        difference += base;
        borrow = 1;
      } else
      {
        borrow = 0;
      }
      r[i] = difference;
    }

    // Propagate any remaining borrow through the longer array.
    for (i = b_l; i < a_l; i++) {
      difference = a[i] - borrow;
      if (difference < 0)
      {
        difference += base;
      }
      else {
        r[i++] = difference;
        break; // No more borrow, can copy remaining digits directly.
      }
      r[i] = difference;
    }

    // Copy any remaining digits from 'a' (if no more borrows).
    for (; i < a_l; i++) {
      r[i] = a[i];
    }

    trim(r); // Remove leading zeros.
    return r;
  }

  /**
   * Handles subtraction between two base-BASE arrays, managing signs and operand order.
   *
   * @param {number[]} a - The first array operand.
   * @param {number[]} b - The second array operand.
   * @param {boolean} sign - The initial sign assumption for the result.
   * @returns {SmallInteger|BigInteger} The result of the subtraction.
   */
  function subtractAny(a, b, sign) {
    var value;

    // Determine which number is larger in absolute value to ensure correct subtraction order.
    if (compareAbs(a, b) >= 0) {
      value = subtract(a, b);
    } else {
      value = subtract(b, a);
      sign = !sign; // Flip the sign if 'b' was absolutely larger.
    }

    value = arrayToSmall(value); // Attempt to convert to a SmallInteger.

    if (typeof value === "number") {
      if (sign)
      {
        value = -value;
      }
      return new SmallInteger(value);
    }
    return new BigInteger(value, sign);
  }

  /**
   * Subtracts a small number (carry) from a base-BASE array.
   * Optimized for decrementing or subtracting a small constant.
   *
   * @param {number[]} a - The array to subtract from.
   * @param {number} b - The small number (integer) to subtract.
   * @param {boolean} sign - The sign of the result.
   * @returns {SmallInteger|BigInteger} The result of the subtraction.
   */
  function subtractSmall(a, b, sign) {
    var l = a.length,
      r = new Array(l),
      carry = -b, // Initialize carry with the negative of the small number.
      base = BASE,
      i, difference;

    for (i = 0; i < l; i++) {
      difference = a[i] + carry;
      carry = Math.floor(difference / base);
      difference %= base;
      // Ensure positive digit by adding base if negative.
      r[i] = difference < 0 ? difference + base : difference;
    }

    r = arrayToSmall(r); // Attempt to convert to a SmallInteger.

    if (typeof r === "number") {
      if (sign)
      {
        r = -r;
      }
      return new SmallInteger(r);
    }
    return new BigInteger(r, sign);
  }

  /**
   * BigInteger prototype method for subtraction.
   * Handles different signs and delegates to appropriate internal subtract functions.
   *
   * @param {any} v - The value to subtract.
   * @returns {BigInteger} The difference as a new BigInteger instance.
   */
  BigInteger.prototype.subtract = function(v) {
    var n = parseValue(v);

    // If signs are different, convert subtraction to addition.
    if (this.sign !== n.sign) {
      return this.add(n.negate());
    }

    var a = this.value,
      b = n.value;

    // Optimized path if the other operand is a SmallInteger.
    if (n.isSmall)
    {
      return subtractSmall(a, Math.abs(b), this.sign);
    }

    // General case for subtracting two BigIntegers.
    return subtractAny(a, b, this.sign);
  };

  // Provide an alias for the subtract method.
  BigInteger.prototype.minus = BigInteger.prototype.subtract;

  /**
   * SmallInteger prototype method for subtraction.
   * Optimizes for small integer arithmetic, then delegates to BigInteger logic if necessary.
   *
   * @param {any} v - The value to subtract.
   * @returns {SmallInteger|BigInteger} The difference.
   */
  SmallInteger.prototype.subtract = function(v) {
    var n = parseValue(v);
    var a = this.value;

    // If signs are different, convert subtraction to addition.
    if (a < 0 !== n.sign) {
      return this.add(n.negate());
    }

    var b = n.value;

    // If both operands are SmallIntegers.
    if (n.isSmall) {
      return new SmallInteger(a - b); // Direct subtraction.
    }

    // Fallback to BigInteger subtraction.
    return subtractSmall(b, Math.abs(a), a >= 0);
  };

  // Provide an alias for the subtract method.
  SmallInteger.prototype.minus = SmallInteger.prototype.subtract;


  // --- Unary Operations ---

  /**
   * BigInteger prototype method to negate the number (flip its sign).
   *
   * @returns {BigInteger} A new BigInteger with the opposite sign.
   */
  BigInteger.prototype.negate = function() {
    return new BigInteger(this.value, !this.sign);
  };

  /**
   * SmallInteger prototype method to negate the number.
   *
   * @returns {SmallInteger} A new SmallInteger with the opposite sign.
   */
  SmallInteger.prototype.negate = function() {
    var sign = this.sign;
    var small = new SmallInteger(-this.value);
    small.sign = !sign; // Explicitly flip the sign property.
    return small;
  };

  /**
   * BigInteger prototype method to get the absolute value.
   *
   * @returns {BigInteger} A new BigInteger representing the absolute value.
   */
  BigInteger.prototype.abs = function() {
    return new BigInteger(this.value, false); // Sign is always false for absolute value.
  };

  /**
   * SmallInteger prototype method to get the absolute value.
   *
   * @returns {SmallInteger} A new SmallInteger representing the absolute value.
   */
  SmallInteger.prototype.abs = function() {
    return new SmallInteger(Math.abs(this.value));
  };


  // --- Arithmetic Operations: Multiplication ---

  /**
   * Multiplies two base-BASE arrays using the standard long multiplication algorithm.
   * Suitable for arrays of moderate size.
   *
   * @param {number[]} a - The first array operand.
   * @param {number[]} b - The second array operand.
   * @returns {number[]} The product array.
   */
  function multiplyLong(a, b) {
    var a_l = a.length,
      b_l = b.length,
      l = a_l + b_l, // Maximum possible length of the product.
      r = createArray(l), // Initialize result array with zeros.
      base = BASE,
      product, carry, i, a_i, b_j;

    for (i = 0; i < a_l; ++i) {
      a_i = a[i];
      carry = 0; // Reset carry for each digit of 'a'.
      for (var j = 0; j < b_l; ++j) {
        b_j = b[j];
        product = a_i * b_j + r[i + j] + carry; // Current digit product + previous sum + carry.
        carry = Math.floor(product / base); // Calculate new carry.
        r[i + j] = product - carry * base; // Store current digit.
      }
      r[i + b_l] += carry; // Propagate final carry for this row.
    }
    trim(r); // Remove leading zeros.
    return r;
  }

  /**
   * Multiplies a base-BASE array by a single small JavaScript number.
   *
   * @param {number[]} a - The array operand.
   * @param {number} b - The small number multiplier.
   * @returns {number[]} The product array.
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

    // Handle any remaining carry.
    while (carry > 0) {
      r[i++] = carry % base;
      carry = Math.floor(carry / base);
    }
    return r;
  }

  /**
   * Shifts a base-BASE array representation to the left by `n` positions.
   * Equivalent to multiplying by BASE^n.
   *
   * @param {number[]} x - The array to shift.
   * @param {number} n - The number of positions to shift (append zeros).
   * @returns {number[]} The shifted array.
   */
  function shiftLeft(x, n) {
    var r = [];
    while (n-- > 0)
    {
      r.push(0); // Append 'n' zeros.
    }
    return r.concat(x); // Concatenate original array.
  }

  /**
   * Multiplies two base-BASE arrays using the Karatsuba algorithm.
   * This algorithm is asymptotically faster than long multiplication for very large numbers.
   *
   * @param {number[]} x - The first array operand.
   * @param {number[]} y - The second array operand.
   * @returns {number[]} The product array.
   */
  function multiplyKaratsuba(x, y) {
    var n = Math.max(x.length, y.length);

    // Base case: if numbers are small, use long multiplication.
    if (n <= 30)
    {
      return multiplyLong(x, y);
    }

    n = Math.ceil(n / 2); // Split point.

    // Split x into (a, b) and y into (c, d) where x = a*BASE^n + b, y = c*BASE^n + d.
    var b = x.slice(n),
      a = x.slice(0, n),
      d = y.slice(n),
      c = y.slice(0, n);

    // Recursively calculate ac, bd, and (a+b)(c+d).
    var ac = multiplyKaratsuba(a, c),
      bd = multiplyKaratsuba(b, d),
      abcd = multiplyKaratsuba(addAny(a, b), addAny(c, d));

    // Combine results using Karatsuba's formula:
    // x*y = ac*BASE^(2n) + ((a+b)(c+d) - ac - bd)*BASE^n + bd
    var product = addAny(addAny(ac, shiftLeft(subtract(subtract(abcd, ac), bd), n)), shiftLeft(bd, 2 * n));

    trim(product); // Remove leading zeros.
    return product;
  }

  /**
   * Heuristic function to decide whether to use Karatsuba multiplication
   * or standard long multiplication based on array lengths.
   *
   * @param {number} l1 - Length of the first array.
   * @param {number} l2 - Length of the second array.
   * @returns {boolean} True if Karatsuba is likely more efficient, false otherwise.
   */
  function useKaratsuba(l1, l2) {
    // This is an empirically derived threshold.
    return -.012 * l1 - .012 * l2 + 15e-6 * l1 * l2 > 0;
  }

  /**
   * BigInteger prototype method for multiplication.
   * Selects the appropriate multiplication algorithm (small, long, or Karatsuba).
   *
   * @param {any} v - The value to multiply by.
   * @returns {BigInteger} The product.
   */
  BigInteger.prototype.multiply = function(v) {
    var n = parseValue(v),
      a = this.value,
      b = n.value,
      sign = this.sign !== n.sign, // Determine sign of the product.
      abs;

    // Optimized path for multiplying by a SmallInteger.
    if (n.isSmall) {
      if (b === 0)
      {
        return Integer[0];
      }
      if (b === 1)
      {
        return this;
      }
      if (b === -1)
      {
        return this.negate();
      }
      abs = Math.abs(b);
      if (abs < BASE) {
        return new BigInteger(multiplySmall(a, abs), sign);
      }
      b = smallToArray(abs); // Convert small 'b' to array for long multiplication.
    }

    // Choose between Karatsuba and long multiplication for two large numbers.
    if (useKaratsuba(a.length, b.length))
    {
      return new BigInteger(multiplyKaratsuba(a, b), sign);
    }
    return new BigInteger(multiplyLong(a, b), sign);
  };

  // Provide an alias for the multiply method.
  BigInteger.prototype.times = BigInteger.prototype.multiply;

  /**
   * Multiplies a small number by a base-BASE array.
   * Helper function for internal use.
   *
   * @param {number} a - The small number multiplier.
   * @param {number[]} b - The array operand.
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
   * Internal BigInteger method for multiplication by a SmallInteger.
   *
   * @param {SmallInteger} a - The SmallInteger multiplier.
   * @returns {BigInteger} The product.
   */
  BigInteger.prototype._multiplyBySmall = function(a) {
    if (a.value === 0)
    {
      return Integer[0];
    }
    if (a.value === 1)
    {
      return this;
    }
    if (a.value === -1)
    {
      return this.negate();
    }
    return multiplySmallAndArray(Math.abs(a.value), this.value, this.sign !== a.sign);
  };

  /**
   * Internal SmallInteger method for multiplication by another SmallInteger.
   *
   * @param {SmallInteger} a - The SmallInteger multiplier.
   * @returns {SmallInteger|BigInteger} The product.
   */
  SmallInteger.prototype._multiplyBySmall = function(a) {
    // If the product fits into a precise JavaScript number.
    if (isPrecise(a.value * this.value)) {
      return new SmallInteger(a.value * this.value);
    }
    // Otherwise, convert to array representation and use BigInteger multiplication.
    return multiplySmallAndArray(Math.abs(a.value), smallToArray(Math.abs(this.value)), this.sign !== a.sign);
  };

  /**
   * SmallInteger prototype method for multiplication.
   * Delegates to the internal `_multiplyBySmall` method of the other operand.
   *
   * @param {any} v - The value to multiply by.
   * @returns {SmallInteger|BigInteger} The product.
   */
  SmallInteger.prototype.multiply = function(v) {
    return parseValue(v)._multiplyBySmall(this);
  };

  // Provide an alias for the multiply method.
  SmallInteger.prototype.times = SmallInteger.prototype.multiply;


  // --- Arithmetic Operations: Squaring ---

  /**
   * Squares a base-BASE array representation.
   * This is an optimized version of multiplication for a number by itself.
   *
   * @param {number[]} a - The array to square.
   * @returns {number[]} The squared array.
   */
  function square(a) {
    var l = a.length,
      r = createArray(l + l), // Maximum length of square.
      base = BASE,
      product, carry, i, a_i, a_j;

    for (i = 0; i < l; i++) {
      a_i = a[i];
      carry = 0; // Reset carry for each row.
      // Calculate 2 * a_i * a_j + carry for j > i, and a_i * a_i for j = i.
      for (var j = i; j < l; j++) {
        a_j = a[j];
        // The term 2 * (a_i * a_j) is due to symmetry (a_i*a_j + a_j*a_i).
        product = 2 * (a_i * a_j) + r[i + j] + carry;
        carry = Math.floor(product / base);
        r[i + j] = product - carry * base;
      }
      r[i + l] = carry; // Propagate final carry for this row.
    }
    trim(r); // Remove leading zeros.
    return r;
  }

  /**
   * BigInteger prototype method for squaring.
   *
   * @returns {BigInteger} The square of the number.
   */
  BigInteger.prototype.square = function() {
    return new BigInteger(square(this.value), false); // Square is always non-negative.
  };

  /**
   * SmallInteger prototype method for squaring.
   * Optimizes for small integer squaring, then delegates to BigInteger logic if necessary.
   *
   * @returns {SmallInteger|BigInteger} The square of the number.
   */
  SmallInteger.prototype.square = function() {
    var value = this.value * this.value;
    if (isPrecise(value))
    {
      return new SmallInteger(value); // Direct squaring if result is precise.
    }
    // If result overflows, convert to array and use BigInteger squaring.
    return new BigInteger(square(smallToArray(Math.abs(this.value))), false);
  };


  // --- Arithmetic Operations: Division and Modulo ---

  /**
   * Implements a variant of Knuth's Algorithm D for division of large numbers.
   * This algorithm is efficient for general BigInteger division.
   *
   * @param {number[]} a - The dividend array.
   * @param {number[]} b - The divisor array.
   * @returns {number[][]} An array containing [quotient_array, remainder_array].
   */
  function divMod1(a, b) {
    var a_l = a.length,
      b_l = b.length,
      base = BASE,
      result = createArray(b_l), // Quotient will be roughly a_l - b_l + 1 digits.
      divisorMostSignificantDigit = b[b_l - 1],
      lambda = Math.ceil(base / (2 * divisorMostSignificantDigit)), // Normalization factor.
      remainder = multiplySmall(a, lambda), // Normalize dividend.
      divisor = multiplySmall(b, lambda), // Normalize divisor.
      quotientDigit, shift, carry, borrow, i, l, q;

    if (remainder.length <= a_l)
    {
      remainder.push(0); // Ensure enough space for normalization.
    }
    divisor.push(0); // Add a leading zero for easier indexing in the loop.
    divisorMostSignificantDigit = divisor[b_l - 1]; // Update after normalization.

    // Iterate from most significant 'digit' position down.
    for (shift = a_l - b_l; shift >= 0; shift--) {
      quotientDigit = base - 1; // Initial guess for the quotient digit.
      // Refine guess using the two most significant digits of remainder and divisor.
      if (remainder[shift + b_l] !== divisorMostSignificantDigit) {
        quotientDigit = Math.floor((remainder[shift + b_l] * base + remainder[shift + b_l - 1]) / divisorMostSignificantDigit);
      }

      carry = 0;
      borrow = 0;
      l = divisor.length;

      // Perform trial subtraction: remainder -= quotientDigit * divisor.
      for (i = 0; i < l; i++) {
        carry += quotientDigit * divisor[i];
        q = Math.floor(carry / base);
        borrow += remainder[shift + i] - (carry - q * base); // Calculate borrow for current digit.
        carry = q;
        if (borrow < 0) {
          remainder[shift + i] = borrow + base;
          borrow = -1;
        } else {
          remainder[shift + i] = borrow;
          borrow = 0;
        }
      }

      // Adjust quotient digit if trial subtraction was too large (resulted in negative remainder).
      while (borrow !== 0) {
        quotientDigit -= 1;
        carry = 0;
        for (i = 0; i < l; i++) {
          carry += remainder[shift + i] - base + divisor[i]; // Add divisor back.
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
      result[shift] = quotientDigit; // Store the calculated quotient digit.
    }

    // Denormalize the remainder.
    remainder = divModSmall(remainder, lambda)[0];

    return [arrayToSmall(result), arrayToSmall(remainder)];
  }

  /**
   * Another division algorithm, potentially a simpler "schoolbook" approach.
   * Divides by repeatedly subtracting scaled divisor from the dividend.
   *
   * @param {number[]} a - The dividend array.
   * @param {number[]} b - The divisor array.
   * @returns {number[][]} An array containing [quotient_array, remainder_array].
   */
  function divMod2(a, b) {
    var a_l = a.length,
      b_l = b.length,
      result = [],
      part = [], // Current portion of the dividend being processed.
      base = BASE,
      guess, xlen, highx, highy, check;

    while (a_l) {
      part.unshift(a[--a_l]); // Take digits from dividend, one by one, from MSB.
      trim(part);

      // If current part is smaller than the divisor, the quotient digit is 0.
      if (compareAbs(part, b) < 0) {
        result.push(0);
        continue;
      }

      xlen = part.length;
      // Estimate quotient digit using the two most significant digits.
      highx = part[xlen - 1] * base + part[xlen - 2];
      highy = b[b_l - 1] * base + b[b_l - 2];

      if (xlen > b_l)
      {
        highx = (highx + 1) * base; // Adjust if part is longer than divisor.
      }

      guess = Math.ceil(highx / highy); // Initial guess.

      // Refine guess by trial multiplication and subtraction.
      do {
        check = multiplySmall(b, guess);
        if (compareAbs(check, part) <= 0)
        {
          break; // Guess is good.
        }
        guess--; // Guess was too high.
      } while (guess);

      result.push(guess); // Store the quotient digit.
      part = subtract(part, check); // Subtract (divisor * guess) from the current part.
    }

    result.reverse(); // Digits were collected in reverse order.
    return [arrayToSmall(result), arrayToSmall(part)];
  }

  /**
   * Divides a base-BASE array by a single small JavaScript number.
   *
   * @param {number[]} value - The array dividend.
   * @param {number} lambda - The small integer divisor.
   * @returns {number[]} An array containing [quotient_array, remainder_number].
   */
  function divModSmall(value, lambda) {
    var length = value.length,
      quotient = createArray(length),
      base = BASE,
      i, q, remainder, divisor;

    remainder = 0;
    // Process digits from most significant to least significant.
    for (i = length - 1; i >= 0; --i) {
      divisor = remainder * base + value[i]; // Form the current part of the dividend.
      q = truncate(divisor / lambda); // Calculate quotient digit.
      remainder = divisor - q * lambda; // Calculate new remainder.
      quotient[i] = q | 0; // Store quotient digit (ensure integer).
    }
    return [quotient, remainder | 0]; // Return quotient array and final remainder.
  }

  /**
   * Generic division and modulo function for Integer objects.
   * Handles various cases including small divisors, zero divisor, and delegates to
   * appropriate division algorithms for large numbers.
   *
   * @param {BigInteger|SmallInteger} self - The dividend.
   * @param {any} v - The divisor.
   * @returns {BigInteger[]|SmallInteger[]} An array containing [quotient, remainder].
   */
  function divModAny(self, v) {
    var value, n = parseValue(v); // Ensure 'v' is an Integer object.
    var a = self.value,
      b = n.value;
    var quotient;

    if (b === 0)
    {
      throw new Error("Cannot divide by zero");
    }

    // Case 1: Dividend is a SmallInteger.
    if (self.isSmall) {
      if (n.isSmall) {
        return [new SmallInteger(truncate(a / b)), new SmallInteger(a % b)]; // Direct JS division.
      }
      return [Integer[0], self]; // Small / Large = 0 remainder Small.
    }

    // Case 2: Divisor is a SmallInteger.
    if (n.isSmall) {
      if (b === 1)
      {
        return [self, Integer[0]];
      }
      if (b == -1)
      {
        return [self.negate(), Integer[0]];
      }

      var abs = Math.abs(b);
      if (abs < BASE) {
        value = divModSmall(a, abs); // Use optimized small divisor division.
        quotient = arrayToSmall(value[0]);
        var remainder = value[1];

        if (self.sign)
        {
          remainder = -remainder; // Adjust remainder sign.
        }

        if (typeof quotient === "number") {
          if (self.sign !== n.sign)
          {
            quotient = -quotient; // Adjust quotient sign.
          }
          return [new SmallInteger(quotient), new SmallInteger(remainder)];
        }
        return [new BigInteger(quotient, self.sign !== n.sign), new SmallInteger(remainder)];
      }
      b = smallToArray(abs); // Convert small 'b' to array for large division.
    }

    // Case 3: Both dividend and divisor are BigIntegers.
    var comparison = compareAbs(a, b);

    if (comparison === -1)
    {
      return [Integer[0], self]; // a < b, quotient is 0, remainder is a.
    }
    if (comparison === 0)
    {
      return [Integer[self.sign === n.sign ? 1 : -1], Integer[0]]; // a = b, quotient is +/-1, remainder is 0.
    }

    // Choose division algorithm based on length (heuristic).
    if (a.length + b.length <= 200)
    {
      value = divMod1(a, b);
    }
    else
    {
      value = divMod2(a, b);
    }

    quotient = value[0];
    var qSign = self.sign !== n.sign, // Quotient sign is XOR of operand signs.
      mod = value[1],
      mSign = self.sign; // Remainder sign is same as dividend.

    // Convert results back into Integer objects.
    if (typeof quotient === "number") {
      if (qSign)
      {
        quotient = -quotient;
      }
      quotient = new SmallInteger(quotient);
    } else
    {
      quotient = new BigInteger(quotient, qSign);
    }

    if (typeof mod === "number") {
      if (mSign)
      {
        mod = -mod;
      }
      mod = new SmallInteger(mod);
    } else
    {
      mod = new BigInteger(mod, mSign);
    }

    return [quotient, mod];
  }

  /**
   * BigInteger prototype method for division and modulo.
   * Returns an object containing both quotient and remainder.
   *
   * @param {any} v - The divisor.
   * @returns {{quotient: BigInteger|SmallInteger, remainder: BigInteger|SmallInteger}}
   */
  BigInteger.prototype.divmod = function(v) {
    var result = divModAny(this, v);
    return {
      quotient: result[0],
      remainder: result[1]
    };
  };

  // SmallInteger also uses the generic divmod function.
  SmallInteger.prototype.divmod = BigInteger.prototype.divmod;

  /**
   * BigInteger prototype method for division (returns only the quotient).
   *
   * @param {any} v - The divisor.
   * @returns {BigInteger|SmallInteger} The quotient.
   */
  BigInteger.prototype.divide = function(v) {
    return divModAny(this, v)[0];
  };

  // Aliases for division.
  SmallInteger.prototype.over = SmallInteger.prototype.divide = BigInteger.prototype.over = BigInteger.prototype.divide;

  /**
   * BigInteger prototype method for modulo (returns only the remainder).
   *
   * @param {any} v - The divisor.
   * @returns {BigInteger|SmallInteger} The remainder.
   */
  BigInteger.prototype.mod = function(v) {
    return divModAny(this, v)[1];
  };

  // Aliases for modulo.
  SmallInteger.prototype.remainder = SmallInteger.prototype.mod = BigInteger.prototype.remainder = BigInteger.prototype.mod;


  // --- Arithmetic Operations: Exponentiation ---

  /**
   * BigInteger prototype method for exponentiation (power).
   * Calculates `this` raised to the power of `v`.
   *
   * @param {any} v - The exponent.
   * @returns {BigInteger|SmallInteger} The result.
   * @throws {Error} If the exponent is negative (fractional result) or too large.
   */
  BigInteger.prototype.pow = function(v) {
    var n = parseValue(v),
      a = this.value,
      b = n.value,
      value, x, y;

    // Handle special cases for exponent 0, base 0, base 1, base -1.
    if (b === 0)
    {
      return Integer[1];
    }
    if (a === 0)
    {
      return Integer[0];
    }
    if (a === 1)
    {
      return Integer[1];
    }
    if (a === -1)
    {
      return n.isEven() ? Integer[1] : Integer[-1];
    }

    if (n.sign) {
      return Integer[0]; // Negative exponent implies fractional result, not supported for integers.
    }

    if (!n.isSmall)
    {
      throw new Error("The exponent " + n.toString() + " is too large.");
    }

    // Optimization: if both base and exponent are small.
    if (this.isSmall) {
      if (isPrecise(value = Math.pow(a, b)))
      {
        return new SmallInteger(truncate(value));
      }
    }

    // Use binary exponentiation (exponentiation by squaring) for efficiency.
    x = this; // Base
    y = Integer[1]; // Accumulator for the result.
    while (true) {
      if (b & 1 === 1)
      {
        y = y.times(x); // If the current bit of exponent is 1, multiply into result.
        --b;
      }
      if (b === 0)
      {
        break; // Exponent exhausted.
      }
      b /= 2; // Halve the exponent.
      x = x.square(); // Square the base.
    }
    return y;
  };

  // SmallInteger also uses the generic pow function.
  SmallInteger.prototype.pow = BigInteger.prototype.pow;

  /**
   * BigInteger prototype method for modular exponentiation (base^exp % mod).
   * Implements the right-to-left binary method.
   *
   * @param {any} exp - The exponent.
   * @param {any} mod - The modulus.
   * @returns {BigInteger|SmallInteger} The result.
   * @throws {Error} If modulus is zero.
   */
  BigInteger.prototype.modPow = function(exp, mod) {
    exp = parseValue(exp);
    mod = parseValue(mod);

    if (mod.isZero())
    {
      throw new Error("Cannot take modPow with modulus 0");
    }

    var r = Integer[1], // Result accumulator, initialized to 1.
      base = this.mod(mod); // Reduce the base modulo mod first.

    while (exp.isPositive()) {
      if (base.isZero())
      {
        return Integer[0]; // If base is 0, result is 0.
      }
      if (exp.isOdd())
      {
        r = r.multiply(base).mod(mod); // If exponent bit is 1, multiply into result and take modulo.
      }
      exp = exp.divide(2); // Halve the exponent.
      base = base.square().mod(mod); // Square the base and take modulo.
    }
    return r;
  };

  // SmallInteger also uses the generic modPow function.
  SmallInteger.prototype.modPow = BigInteger.prototype.modPow;


  // --- Comparison Operations ---

  /**
   * Compares the absolute values of two non-negative base-BASE arrays.
   *
   * @param {number[]} a - The first array.
   * @param {number[]} b - The second array.
   * @returns {number} 1 if |a| > |b|, -1 if |a| < |b|, 0 if |a| = |b|.
   */
  function compareAbs(a, b) {
    if (a.length !== b.length) {
      return a.length > b.length ? 1 : -1; // Longer array is absolutely larger.
    }
    // If lengths are equal, compare digits from most significant to least significant.
    for (var i = a.length - 1; i >= 0; i--) {
      if (a[i] !== b[i])
      {
        return a[i] > b[i] ? 1 : -1;
      }
    }
    return 0; // Arrays are identical.
  }

  /**
   * BigInteger prototype method to compare absolute values.
   *
   * @param {any} v - The value to compare with.
   * @returns {number} 1 if |this| > |v|, -1 if |this| < |v|, 0 if |this| = |v|.
   */
  BigInteger.prototype.compareAbs = function(v) {
    var n = parseValue(v),
      a = this.value,
      b = n.value;

    if (n.isSmall)
    {
      return 1; // A BigInteger is always absolutely larger than a SmallInteger (unless SmallInteger is 0).
    }
    return compareAbs(a, b);
  };

  /**
   * SmallInteger prototype method to compare absolute values.
   *
   * @param {any} v - The value to compare with.
   * @returns {number} 1 if |this| > |v|, -1 if |this| < |v|, 0 if |this| = |v|.
   */
  SmallInteger.prototype.compareAbs = function(v) {
    var n = parseValue(v),
      a = Math.abs(this.value),
      b = n.value;

    if (n.isSmall) {
      b = Math.abs(b);
      return a === b ? 0 : a > b ? 1 : -1; // Direct comparison for two small numbers.
    }
    return -1; // A SmallInteger is always absolutely smaller than a BigInteger.
  };

  /**
   * BigInteger prototype method for general comparison.
   * Takes into account both magnitude and sign.
   *
   * @param {any} v - The value to compare with.
   * @returns {number} 1 if this > v, -1 if this < v, 0 if this = v.
   */
  BigInteger.prototype.compare = function(v) {
    // Handle special JavaScript values Infinity, -Infinity.
    if (v === Infinity)
    {
      return -1;
    }
    if (v === -Infinity)
    {
      return 1;
    }

    var n = parseValue(v),
      a = this.value,
      b = n.value;

    // Case 1: Different signs.
    if (this.sign !== n.sign) {
      return n.sign ? 1 : -1; // If n is negative, this is positive (greater). Else, this is negative (lesser).
    }

    // Case 2: Same signs.
    // If one is small and the other is large (but same sign).
    if (n.isSmall)
    {
      return this.sign ? -1 : 1; // If negative, large is smaller. If positive, large is greater.
    }

    // Both are large and have the same sign.
    // Compare absolute values, then adjust result based on sign.
    return compareAbs(a, b) * (this.sign ? -1 : 1);
  };

  // Provide an alias for the compare method.
  BigInteger.prototype.compareTo = BigInteger.prototype.compare;

  /**
   * SmallInteger prototype method for general comparison.
   *
   * @param {any} v - The value to compare with.
   * @returns {number} 1 if this > v, -1 if this < v, 0 if this = v.
   */
  SmallInteger.prototype.compare = function(v) {
    // Handle special JavaScript values Infinity, -Infinity.
    if (v === Infinity)
    {
      return -1;
    }
    if (v === -Infinity)
    {
      return 1;
    }

    var n = parseValue(v),
      a = this.value,
      b = n.value;

    // Case 1: Both are SmallIntegers.
    if (n.isSmall) {
      return a == b ? 0 : a > b ? 1 : -1; // Direct numerical comparison.
    }

    // Case 2: SmallInteger vs BigInteger (different types).
    // If signs are different.
    if (a < 0 !== n.sign) {
      return a < 0 ? -1 : 1; // If small is negative, it's smaller. If positive, it's greater.
    }

    // Same sign (small vs large).
    // Small numbers are closer to zero.
    return a < 0 ? 1 : -1; // If both negative, small is greater (e.g., -5 > -10). If both positive, small is lesser.
  };

  // Provide an alias for the compare method.
  SmallInteger.prototype.compareTo = SmallInteger.prototype.compare;

  /**
   * BigInteger prototype method for equality check.
   *
   * @param {any} v - The value to compare with.
   * @returns {boolean} True if equal, false otherwise.
   */
  BigInteger.prototype.equals = function(v) {
    return this.compare(v) === 0;
  };

  // Aliases for equality.
  SmallInteger.prototype.eq = SmallInteger.prototype.equals = BigInteger.prototype.eq = BigInteger.prototype.equals;

  /**
   * BigInteger prototype method for inequality check.
   *
   * @param {any} v - The value to compare with.
   * @returns {boolean} True if not equal, false otherwise.
   */
  BigInteger.prototype.notEquals = function(v) {
    return this.compare(v) !== 0;
  };

  // Aliases for inequality.
  SmallInteger.prototype.neq = SmallInteger.prototype.notEquals = BigInteger.prototype.neq = BigInteger.prototype.notEquals;

  /**
   * BigInteger prototype method for greater than check.
   *
   * @param {any} v - The value to compare with.
   * @returns {boolean} True if greater, false otherwise.
   */
  BigInteger.prototype.greater = function(v) {
    return this.compare(v) > 0;
  };

  // Aliases for greater than.
  SmallInteger.prototype.gt = SmallInteger.prototype.greater = BigInteger.prototype.gt = BigInteger.prototype.greater;

  /**
   * BigInteger prototype method for less than check.
   *
   * @param {any} v - The value to compare with.
   * @returns {boolean} True if less, false otherwise.
   */
  BigInteger.prototype.lesser = function(v) {
    return this.compare(v) < 0;
  };

  // Aliases for less than.
  SmallInteger.prototype.lt = SmallInteger.prototype.lesser = BigInteger.prototype.lt = BigInteger.prototype.lesser;

  /**
   * BigInteger prototype method for greater than or equals check.
   *
   * @param {any} v - The value to compare with.
   * @returns {boolean} True if greater or equals, false otherwise.
   */
  BigInteger.prototype.greaterOrEquals = function(v) {
    return this.compare(v) >= 0;
  };

  // Aliases for greater than or equals.
  SmallInteger.prototype.geq = SmallInteger.prototype.greaterOrEquals = BigInteger.prototype.geq = BigInteger.prototype.greaterOrEquals;

  /**
   * BigInteger prototype method for less than or equals check.
   *
   * @param {any} v - The value to compare with.
   * @returns {boolean} True if less or equals, false otherwise.
   */
  BigInteger.prototype.lesserOrEquals = function(v) {
    return this.compare(v) <= 0;
  };

  // Aliases for less than or equals.
  SmallInteger.prototype.leq = SmallInteger.prototype.lesserOrEquals = BigInteger.prototype.leq = BigInteger.prototype.lesserOrEquals;


  // --- Property Checks (isEven, isPositive, etc.) ---

  /**
   * BigInteger prototype method to check if the number is even.
   * Checks the least significant digit of the internal array.
   *
   * @returns {boolean} True if even, false otherwise.
   */
  BigInteger.prototype.isEven = function() {
    return (this.value[0] & 1) === 0;
  };

  /**
   * SmallInteger prototype method to check if the number is even.
   *
   * @returns {boolean} True if even, false otherwise.
   */
  SmallInteger.prototype.isEven = function() {
    return (this.value & 1) === 0;
  };

  /**
   * BigInteger prototype method to check if the number is odd.
   *
   * @returns {boolean} True if odd, false otherwise.
   */
  BigInteger.prototype.isOdd = function() {
    return (this.value[0] & 1) === 1;
  };

  /**
   * SmallInteger prototype method to check if the number is odd.
   *
   * @returns {boolean} True if odd, false otherwise.
   */
  SmallInteger.prototype.isOdd = function() {
    return (this.value & 1) === 1;
  };

  /**
   * BigInteger prototype method to check if the number is positive.
   *
   * @returns {boolean} True if positive, false otherwise.
   */
  BigInteger.prototype.isPositive = function() {
    return !this.sign;
  };

  /**
   * SmallInteger prototype method to check if the number is positive.
   *
   * @returns {boolean} True if positive, false otherwise.
   */
  SmallInteger.prototype.isPositive = function() {
    return this.value > 0;
  };

  /**
   * BigInteger prototype method to check if the number is negative.
   *
   * @returns {boolean} True if negative, false otherwise.
   */
  BigInteger.prototype.isNegative = function() {
    return this.sign;
  };

  /**
   * SmallInteger prototype method to check if the number is negative.
   *
   * @returns {boolean} True if negative, false otherwise.
   */
  SmallInteger.prototype.isNegative = function() {
    return this.value < 0;
  };

  /**
   * BigInteger prototype method to check if the number is a unit (1 or -1).
   * For true BigIntegers (value.length > 1), it's never a unit.
   *
   * @returns {boolean} Always false.
   */
  BigInteger.prototype.isUnit = function() {
    return false;
  };

  /**
   * SmallInteger prototype method to check if the number is a unit.
   *
   * @returns {boolean} True if absolute value is 1, false otherwise.
   */
  SmallInteger.prototype.isUnit = function() {
    return Math.abs(this.value) === 1;
  };

  /**
   * BigInteger prototype method to check if the number is zero.
   * For true BigIntegers (value.length > 1), it's never zero.
   *
   * @returns {boolean} Always false.
   */
  BigInteger.prototype.isZero = function() {
    return false;
  };

  /**
   * SmallInteger prototype method to check if the number is zero.
   *
   * @returns {boolean} True if value is 0, false otherwise.
   */
  SmallInteger.prototype.isZero = function() {
    return this.value === 0;
  };

  /**
   * BigInteger prototype method to check if the number is divisible by another number.
   *
   * @param {any} v - The divisor.
   * @returns {boolean} True if divisible, false otherwise.
   */
  BigInteger.prototype.isDivisibleBy = function(v) {
    var n = parseValue(v);
    var value = n.value;

    if (value === 0)
    {
      return false; // Division by zero is undefined.
    }
    if (value === 1)
    {
      return true; // Any integer is divisible by 1.
    }
    if (value === 2)
    {
      return this.isEven(); // Optimized check for divisibility by 2.
    }

    return this.mod(n).equals(Integer[0]); // Check if remainder is zero.
  };

  // SmallInteger also uses the generic isDivisibleBy function.
  SmallInteger.prototype.isDivisibleBy = BigInteger.prototype.isDivisibleBy;


  // --- Primality Tests ---

  /**
   * Helper function for basic primality tests for small numbers.
   *
   * @param {BigInteger|SmallInteger} v - The number to test.
   * @returns {boolean|undefined} True if prime, false if composite, undefined if too large for basic check.
   */
  function isBasicPrime(v) {
    var n = v.abs();

    if (n.isUnit())
    {
      return false; // 1 is not prime.
    }
    if (n.equals(2) || n.equals(3) || n.equals(5))
    {
      return true; // 2, 3, 5 are prime.
    }
    if (n.isEven() || n.isDivisibleBy(3) || n.isDivisibleBy(5))
    {
      return false; // Composite if divisible by 2, 3, or 5.
    }
    if (n.lesser(25))
    {
      return true; // Primes between 5 and 25 (7, 11, 13, 17, 19, 23).
    }
  }

  /**
   * BigInteger prototype method to check if the number is prime.
   * Uses a deterministic Miller-Rabin primality test for larger numbers.
   *
   * @returns {boolean} True if the number is prime, false otherwise.
   */
  BigInteger.prototype.isPrime = function() {
    var isPrime = isBasicPrime(this);
    if (isPrime !== undefined)
    {
      return isPrime;
    }

    var n = this.abs(),
      nPrev = n.prev(); // n-1.
    var a = [2, 3, 5, 7, 11, 13, 17, 19], // Small prime bases for Miller-Rabin.
      b = nPrev,
      d, t, i, x;

    // Find b and s such that n-1 = b * 2^s, where b is odd.
    while (b.isEven())
    {
      b = b.divide(2);
    }

    // Perform Miller-Rabin test for each base 'a'.
    for (i = 0; i < a.length; i++) {
      x = bigInt(a[i]).modPow(b, n); // Calculate a^b mod n.
      if (x.equals(Integer[1]) || x.equals(nPrev))
      {
        continue; // 'n' is a strong probable prime to base 'a'.
      }

      // Check for x^(2^j) mod n = n-1.
      for (t = true, d = b; t && d.lesser(nPrev); d = d.multiply(2)) {
        x = x.square().mod(n); // Square x and take modulo.
        if (x.equals(nPrev))
        {
          t = false; // Found a strong probable prime, 'n' is likely prime.
        }
      }
      if (t)
      {
        return false; // 'n' is composite.
      }
    }
    return true; // Passed all tests, considered prime (deterministic for numbers up to a certain size).
  };

  // SmallInteger also uses the generic isPrime function.
  SmallInteger.prototype.isPrime = BigInteger.prototype.isPrime;

  /**
   * BigInteger prototype method to check if the number is a probable prime.
   * Uses the Miller-Rabin probabilistic primality test with a specified number of iterations.
   *
   * @param {number} [iterations=5] - The number of random bases to test.
   * @returns {boolean} True if the number is probably prime, false otherwise.
   */
  BigInteger.prototype.isProbablePrime = function(iterations) {
    var isPrime = isBasicPrime(this);
    if (isPrime !== undefined)
    {
      return isPrime;
    }

    var n = this.abs();
    var t = iterations === undefined ? 5 : iterations; // Default to 5 iterations.

    for (var i = 0; i < t; i++) {
      // Pick a random base 'a' between 2 and n-2.
      var a = bigInt.randBetween(2, n.minus(2));
      // If a^(n-1) mod n is not 1, then n is composite (by Fermat's Little Theorem).
      if (!a.modPow(n.prev(), n).isUnit())
      {
        return false;
      }
    }
    return true; // Passed all probabilistic tests, highly likely prime.
  };

  // SmallInteger also uses the generic isProbablePrime function.
  SmallInteger.prototype.isProbablePrime = BigInteger.prototype.isProbablePrime;


  // --- Cryptographic Operations ---

  /**
   * BigInteger prototype method for calculating the modular multiplicative inverse.
   * Finds 'x' such that (this * x) % n = 1.
   * Uses the extended Euclidean algorithm.
   *
   * @param {any} n - The modulus.
   * @returns {BigInteger|SmallInteger} The modular inverse.
   * @throws {Error} If `this` and `n` are not coprime.
   */
  BigInteger.prototype.modInv = function(n) {
    var t = bigInt.zero,
      newT = bigInt.one,
      r = parseValue(n),
      newR = this.abs(), // Work with absolute values for Euclidean algorithm.
      q, lastT, lastR;

    // Extended Euclidean algorithm to find gcd(r, newR) and coefficients.
    while (!newR.equals(bigInt.zero)) {
      q = r.divide(newR); // Quotient.
      lastT = t;
      lastR = r;
      t = newT;
      r = newR;
      newT = lastT.subtract(q.multiply(newT));
      newR = lastR.subtract(q.multiply(newR));
    }

    // If gcd(this, n) is not 1, then no modular inverse exists.
    if (!r.equals(1))
    {
      throw new Error(this.toString() + " and " + n.toString() + " are not co-prime");
    }

    // Ensure the result 't' is positive and within the modulus range.
    if (t.compare(0) === -1)
    {
      t = t.add(n);
    }

    // Adjust sign if the original number was negative.
    if (this.isNegative())
    {
      return t.negate();
    }

    return t;
  };

  // SmallInteger also uses the generic modInv function.
  SmallInteger.prototype.modInv = BigInteger.prototype.modInv;


  // --- Increment / Decrement ---

  /**
   * BigInteger prototype method to get the next integer (this + 1).
   *
   * @returns {BigInteger|SmallInteger} The incremented number.
   */
  BigInteger.prototype.next = function() {
    var value = this.value;
    if (this.sign) {
      // If negative, incrementing means subtracting 1 from its absolute value.
      return subtractSmall(value, 1, this.sign);
    }
    // If positive, simply add 1.
    return new BigInteger(addSmall(value, 1), this.sign);
  };

  /**
   * SmallInteger prototype method to get the next integer (this + 1).
   * Handles overflow into BigInteger if necessary.
   *
   * @returns {SmallInteger|BigInteger} The incremented number.
   */
  SmallInteger.prototype.next = function() {
    var value = this.value;
    if (value + 1 < MAX_INT)
    {
      return new SmallInteger(value + 1);
    }
    // If it exceeds MAX_INT, return a BigInteger.
    return new BigInteger(MAX_INT_ARR, false);
  };

  /**
   * BigInteger prototype method to get the previous integer (this - 1).
   *
   * @returns {BigInteger|SmallInteger} The decremented number.
   */
  BigInteger.prototype.prev = function() {
    var value = this.value;
    if (this.sign) {
      // If negative, decrementing means adding 1 to its absolute value.
      return new BigInteger(addSmall(value, 1), true);
    }
    // If positive, simply subtract 1.
    return subtractSmall(value, 1, this.sign);
  };

  /**
   * SmallInteger prototype method to get the previous integer (this - 1).
   * Handles underflow into BigInteger if necessary.
   *
   * @returns {SmallInteger|BigInteger} The decremented number.
   */
  SmallInteger.prototype.prev = function() {
    var value = this.value;
    if (value - 1 > -MAX_INT)
    {
      return new SmallInteger(value - 1);
    }
    // If it goes below -MAX_INT, return a BigInteger.
    return new BigInteger(MAX_INT_ARR, true);
  };


  // --- Bitwise Operations ---

  // Pre-calculate powers of two up to BASE for efficient bit shifting.
  var powersOfTwo = [1];
  while (2 * powersOfTwo[powersOfTwo.length - 1] <= BASE)
  {
    powersOfTwo.push(2 * powersOfTwo[powersOfTwo.length - 1]);
  }
  var powers2Length = powersOfTwo.length,
    highestPower2 = powersOfTwo[powers2Length - 1]; // Largest power of 2 <= BASE.

  /**
   * Checks if a shift amount is "small" enough to be handled directly or if it requires
   * iteration over `powersOfTwo`.
   *
   * @param {any} n - The shift amount.
   * @returns {boolean} True if the shift amount is small, false otherwise.
   */
  function shift_isSmall(n) {
    return (typeof n === "number" || typeof n === "string") && +Math.abs(n) <= BASE || n instanceof BigInteger && n.value.length <= 1;
  }

  /**
   * BigInteger prototype method for left bit shift (multiplication by 2^n).
   *
   * @param {any} n - The number of bits to shift.
   * @returns {BigInteger|SmallInteger} The shifted number.
   * @throws {Error} If the shift amount is too large.
   */
  BigInteger.prototype.shiftLeft = function(n) {
    if (!shift_isSmall(n))
    {
      throw new Error(String(n) + " is too large for shifting.");
    }

    n = +n; // Ensure 'n' is a numeric value.

    if (n < 0)
    {
      return this.shiftRight(-n); // Negative left shift is a right shift.
    }

    var result = this;
    if (result.isZero())
    {
      return result;
    }

    // For large shifts, repeatedly multiply by the highest power of 2 in BASE.
    while (n >= powers2Length) {
      result = result.multiply(highestPower2);
      n -= powers2Length - 1; // Subtract the exponent of highestPower2.
    }

    return result.multiply(powersOfTwo[n]); // Multiply by the remaining power of 2.
  };

  // SmallInteger also uses the generic shiftLeft function.
  SmallInteger.prototype.shiftLeft = BigInteger.prototype.shiftLeft;

  /**
   * BigInteger prototype method for right bit shift (division by 2^n).
   *
   * @param {any} n - The number of bits to shift.
   * @returns {BigInteger|SmallInteger} The shifted number.
   * @throws {Error} If the shift amount is too large.
   */
  BigInteger.prototype.shiftRight = function(n) {
    var remQuo;
    if (!shift_isSmall(n))
    {
      throw new Error(String(n) + " is too large for shifting.");
    }

    n = +n; // Ensure 'n' is a numeric value.

    if (n < 0)
    {
      return this.shiftLeft(-n); // Negative right shift is a left shift.
    }

    var result = this;

    // Optimization for zero or negative one.
    if (result.isZero() || result.isNegative() && result.isUnit())
    {
      return result;
    }

    // For large shifts, repeatedly divide by the highest power of 2 in BASE.
    while (n >= powers2Length) {
      remQuo = divModAny(result, highestPower2);
      // Adjust for negative division to ensure floor-like behavior.
      result = remQuo[1].isNegative() ? remQuo[0].prev() : remQuo[0];
      n -= powers2Length - 1;
    }

    remQuo = divModAny(result, powersOfTwo[n]);
    // Adjust for negative division.
    return remQuo[1].isNegative() ? remQuo[0].prev() : remQuo[0];
  };

  // SmallInteger also uses the generic shiftRight function.
  SmallInteger.prototype.shiftRight = BigInteger.prototype.shiftRight;

  /**
   * Generic bitwise operation function.
   * Performs a given bitwise function (AND, OR, XOR) on two BigIntegers,
   * handling two's complement for negative numbers.
   *
   * @param {BigInteger|SmallInteger} x - The first operand.
   * @param {any} y - The second operand.
   * @param {function(number, number): number} fn - The bitwise function (e.g., `(a, b) => a & b`).
   * @returns {BigInteger|SmallInteger} The result of the bitwise operation.
   */
  function bitwise(x, y, fn) {
    y = parseValue(y); // Ensure 'y' is an Integer object.

    var xSign = x.isNegative(),
      ySign = y.isNegative();

    // Convert to two's complement for negative numbers.
    // `~N = -(N+1)`
    var xRem = xSign ? x.not() : x,
      yRem = ySign ? y.not() : y;

    var xDigit = 0,
      yDigit = 0;
    var xDivMod = null,
      yDivMod = null;
    var result = [];

    // Process 'digits' (chunks of bits) from least significant to most significant.
    while (!xRem.isZero() || !yRem.isZero()) {
      // Extract a 'digit' (up to highestPower2) from xRem.
      xDivMod = divModAny(xRem, highestPower2);
      xDigit = xDivMod[1].toJSNumber();
      if (xSign)
      {
        xDigit = highestPower2 - 1 - xDigit; // Apply two's complement to the digit.
      }

      // Extract a 'digit' from yRem.
      yDivMod = divModAny(yRem, highestPower2);
      yDigit = yDivMod[1].toJSNumber();
      if (ySign)
      {
        yDigit = highestPower2 - 1 - yDigit;
      }

      xRem = xDivMod[0]; // Update remaining part of x.
      yRem = yDivMod[0]; // Update remaining part of y.

      result.push(fn(xDigit, yDigit)); // Apply the bitwise function to the digits.
    }

    // Determine the final sign of the result based on the most significant bit.
    var sum = fn(xSign ? 1 : 0, ySign ? 1 : 0) !== 0 ? bigInt(-1) : bigInt(0);
    // Reconstruct the number from the resulting digits.
    for (var i = result.length - 1; i >= 0; i -= 1) {
      sum = sum.multiply(highestPower2).add(bigInt(result[i]));
    }
    return sum;
  }

  /**
   * BigInteger prototype method for bitwise NOT.
   * Implemented as `-(this + 1)` for two's complement behavior.
   *
   * @returns {BigInteger|SmallInteger} The bitwise NOT of this number.
   */
  BigInteger.prototype.not = function() {
    return this.negate().prev();
  };

  // SmallInteger also uses the generic not function.
  SmallInteger.prototype.not = BigInteger.prototype.not;

  /**
   * BigInteger prototype method for bitwise AND.
   *
   * @param {any} n - The other operand.
   * @returns {BigInteger|SmallInteger} The result of bitwise AND.
   */
  BigInteger.prototype.and = function(n) {
    return bitwise(this, n, function(a, b) {
      return a & b;
    });
  };

  // SmallInteger also uses the generic and function.
  SmallInteger.prototype.and = BigInteger.prototype.and;

  /**
   * BigInteger prototype method for bitwise OR.
   *
   * @param {any} n - The other operand.
   * @returns {BigInteger|SmallInteger} The result of bitwise OR.
   */
  BigInteger.prototype.or = function(n) {
    return bitwise(this, n, function(a, b) {
      return a | b;
    });
  };

  // SmallInteger also uses the generic or function.
  SmallInteger.prototype.or = BigInteger.prototype.or;

  /**
   * BigInteger prototype method for bitwise XOR.
   *
   * @param {any} n - The other operand.
   * @returns {BigInteger|SmallInteger} The result of bitwise XOR.
   */
  BigInteger.prototype.xor = function(n) {
    return bitwise(this, n, function(a, b) {
      return a ^ b;
    });
  };

  // SmallInteger also uses the generic xor function.
  SmallInteger.prototype.xor = BigInteger.prototype.xor;

  // Constants used in roughLOB calculation.
  var LOBMASK_I = 1 << 30, // Mask for JavaScript numbers.
    LOBMASK_BI = (BASE & -BASE) * (BASE & -BASE) | LOBMASK_I; // Mask for BigIntegers.

  /**
   * Calculates a "rough" Least Significant Bit (LOB).
   * This is an optimization to quickly find factors of 2.
   *
   * @param {BigInteger|SmallInteger} n - The number.
   * @returns {number} The rough LOB.
   */
  function roughLOB(n) {
    var v = n.value,
      x = typeof v === "number" ? v | LOBMASK_I : v[0] + v[1] * BASE | LOBMASK_BI;
    return x & -x; // Isolates the least significant bit.
  }

  /**
   * Calculates the integer logarithm (floor(log_base(value))).
   * Used as a helper for `bitLength`.
   *
   * @param {BigInteger} value - The number.
   * @param {BigInteger} base - The base of the logarithm.
   * @returns {{p: BigInteger, e: number}} Object with p (power) and e (exponent).
   */
  function integerLogarithm(value, base) {
    if (base.compareTo(value) <= 0) {
      // Recursive step: log_b(x) = 2 * log_b^2(x).
      var tmp = integerLogarithm(value, base.square());
      var p = tmp.p;
      var e = tmp.e;
      var t = p.multiply(base);
      // Check if p * base is still <= value.
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
    }; // Base case: log_b(x) = 0 if x < b.
  }

  /**
   * BigInteger prototype method to calculate the bit length.
   * This is the number of bits required to represent the absolute value of the number.
   *
   * @returns {BigInteger} The bit length as a BigInteger.
   */
  BigInteger.prototype.bitLength = function() {
    var n = this;
    if (n.compareTo(bigInt(0)) < 0) {
      // For negative numbers, bit length is defined for -(N+1) (two's complement interpretation).
      n = n.negate().subtract(bigInt(1));
    }
    if (n.compareTo(bigInt(0)) === 0)
    {
      return bigInt(0); // Bit length of 0 is 0.
    }
    // Calculate log_2(n) and add 1 (since log_2(N) + 1 is the number of bits).
    return bigInt(integerLogarithm(n, bigInt(2)).e).add(bigInt(1));
  };

  // SmallInteger also uses the generic bitLength function.
  SmallInteger.prototype.bitLength = BigInteger.prototype.bitLength;


  // --- Mathematical Functions (max, min, gcd, lcm) ---

  /**
   * Returns the maximum of two numbers.
   *
   * @param {any} a - The first number.
   * @param {any} b - The second number.
   * @returns {BigInteger|SmallInteger} The larger of the two numbers.
   */
  function max(a, b) {
    a = parseValue(a);
    b = parseValue(b);
    return a.greater(b) ? a : b;
  }

  /**
   * Returns the minimum of two numbers.
   *
   * @param {any} a - The first number.
   * @param {any} b - The second number.
   * @returns {BigInteger|SmallInteger} The smaller of the two numbers.
   */
  function min(a, b) {
    a = parseValue(a);
    b = parseValue(b);
    return a.lesser(b) ? a : b;
  }

  /**
   * Calculates the Greatest Common Divisor (GCD) of two numbers.
   * Uses the binary GCD algorithm (Stein's algorithm) for efficiency.
   *
   * @param {any} a - The first number.
   * @param {any} b - The second number.
   * @returns {BigInteger|SmallInteger} The GCD.
   */
  function gcd(a, b) {
    a = parseValue(a).abs(); // Work with absolute values.
    b = parseValue(b).abs();

    if (a.equals(b))
    {
      return a;
    }
    if (a.isZero())
    {
      return b;
    }
    if (b.isZero())
    {
      return a;
    }

    var c = Integer[1], // Factor of 2s removed.
      d, t;

    // Step 1: Remove common factors of 2.
    while (a.isEven() && b.isEven()) {
      d = Math.min(roughLOB(a), roughLOB(b)); // Find smallest power of 2 that divides both.
      a = a.divide(d);
      b = b.divide(d);
      c = c.multiply(d); // Store common factor of 2s.
    }

    // Step 2: Remove remaining factors of 2 from 'a'.
    while (a.isEven())
    {
      a = a.divide(roughLOB(a));
    }

    // Step 3: Apply Euclidean algorithm using subtraction.
    do {
      // Remove remaining factors of 2 from 'b'.
      while (b.isEven())
      {
        b = b.divide(roughLOB(b));
      }

      // Ensure 'a' is the smaller of the two.
      if (a.greater(b)) {
        t = b;
        b = a;
        a = t;
      }

      b = b.subtract(a); // Replace b with b - a.
    } while (!b.isZero());

    // Step 4: Multiply back the common factors of 2.
    return c.isUnit() ? a : a.multiply(c);
  }

  /**
   * Calculates the Least Common Multiple (LCM) of two numbers.
   * LCM(a, b) = (|a * b|) / GCD(a, b).
   *
   * @param {any} a - The first number.
   * @param {any} b - The second number.
   * @returns {BigInteger|SmallInteger} The LCM.
   */
  function lcm(a, b) {
    a = parseValue(a).abs();
    b = parseValue(b).abs();
    return a.divide(gcd(a, b)).multiply(b);
  }

  /**
   * Generates a cryptographically weak pseudo-random BigInteger within a specified range (inclusive).
   *
   * @param {any} a - The lower bound.
   * @param {any} b - The upper bound.
   * @returns {BigInteger|SmallInteger} A random number within [a, b].
   */
  function randBetween(a, b) {
    a = parseValue(a);
    b = parseValue(b);

    var low = min(a, b),
      high = max(a, b);
    var range = high.subtract(low).add(1); // Calculate the size of the range.

    if (range.isSmall)
    {
      return low.add(Math.floor(Math.random() * range)); // If range is small, use JS random.
    }

    var length = range.value.length - 1;
    var result = [],
      restricted = true;

    // Generate random digits for the result, ensuring it stays within the range.
    for (var i = length; i >= 0; i--) {
      var top = restricted ? range.value[i] : BASE; // Upper limit for current digit.
      var digit = truncate(Math.random() * top); // Generate random digit.
      result.unshift(digit);
      if (digit < top)
      {
        restricted = false; // Once a digit is less than its upper limit, subsequent digits can be anything.
      }
    }

    result = arrayToSmall(result); // Convert result array back to SmallInteger if possible.
    return low.add(typeof result === "number" ? new SmallInteger(result) : new BigInteger(result, false));
  }


  // --- String Conversion and Parsing ---

  /**
   * Parses a string representation of a number in a given base (radix).
   * Handles various bases and custom digit representations.
   *
   * @param {string} text - The string to parse.
   * @param {number|BigInteger} base - The base (radix) of the number.
   * @returns {BigInteger|SmallInteger} The parsed number.
   * @throws {Error} If `text` contains invalid digits for the specified `base`.
   */
  var parseBase = function(text, base) {
    var length = text.length;
    var i;
    var absBase = Math.abs(base);

    // Initial validation of digits in the string.
    for (var i = 0; i < length; i++) {
      var c = text[i].toLowerCase();
      if (c === "-")
      {
        continue;
      } // Skip negative sign.
      if (/[a-z0-9]/.test(c)) {
        if (/[0-9]/.test(c) && +c >= absBase) {
          if (c === "1" && absBase === 1)
          {
            continue;
          } // Special case for base 1.
          throw new Error(c + " is not a valid digit in base " + base + ".");
        } else if (c.charCodeAt(0) - 87 >= absBase) { // 'a' is charCode 97, 87 offset for 10.
          throw new Error(c + " is not a valid digit in base " + base + ".");
        }
      }
    }

    // Optimization for common small bases (2-36) where `parseInt` can be used.
    if (2 <= base && base <= 36) {
      if (length <= LOG_MAX_INT / Math.log(base)) { // Check if result fits in JS number.
        var result = parseInt(text, base);
        if (isNaN(result))
        {
          throw new Error(c + " is not a valid digit in base " + base + ".");
        } // Should not happen if previous checks passed.
        return new SmallInteger(parseInt(text, base));
      }
    }

    base = parseValue(base); // Ensure base is an Integer object.
    var digits = [];
    var isNegative = text[0] === "-";

    // Convert string characters to individual digit Integer objects.
    for (i = isNegative ? 1 : 0; i < text.length; i++) {
      var c = text[i].toLowerCase(),
        charCode = c.charCodeAt(0);
      if (48 <= charCode && charCode <= 57)
      {
        digits.push(parseValue(c)); // '0' through '9'.
      }
      else if (97 <= charCode && charCode <= 122)
      {
        digits.push(parseValue(charCode - 87)); // 'a' (10) through 'z' (35).
      }
      else if (c === "<") { // Handle custom multi-character digits like "<123>".
        var start = i;
        do {
          i++;
        } while (text[i] !== ">");
        digits.push(parseValue(text.slice(start + 1, i)));
      } else
      {
        throw new Error(c + " is not a valid character");
      }
    }

    return parseBaseFromArray(digits, base, isNegative);
  };

  /**
   * Constructs an Integer object from an array of digit Integer objects and a base.
   * This is the core logic for base conversion from digits.
   *
   * @param {BigInteger[]|SmallInteger[]} digits - An array of Integer objects, each representing a digit.
   * @param {BigInteger|SmallInteger} base - The base (radix).
   * @param {boolean} isNegative - True if the final number should be negative.
   * @returns {BigInteger|SmallInteger} The constructed Integer.
   */
  function parseBaseFromArray(digits, base, isNegative) {
    var val = Integer[0], // Accumulator, starts at 0.
      pow = Integer[1], // Current power of base, starts at 1.
      i;

    // Use Horner's method: val = (...(d_n * base + d_{n-1}) * base + ... + d_0).
    // Or equivalently, sum(digit_i * base^i).
    for (i = digits.length - 1; i >= 0; i--) {
      val = val.add(digits[i].times(pow));
      pow = pow.times(base);
    }
    return isNegative ? val.negate() : val;
  }

  /**
   * Converts a single digit value (0-35) to its character representation.
   * For digits > 35, it uses a custom "<digit>" format.
   *
   * @param {number} digit - The digit value.
   * @returns {string} The string representation of the digit.
   */
  function stringify(digit) {
    if (digit <= 35) {
      return "0123456789abcdefghijklmnopqrstuvwxyz".charAt(digit);
    }
    return "<" + digit + ">"; // Custom format for higher digits.
  }

  /**
   * Converts an Integer object to an array of digits in a given base.
   * This is the inverse of `parseBaseFromArray`.
   *
   * @param {BigInteger|SmallInteger} n - The number to convert.
   * @param {BigInteger|SmallInteger} base - The target base.
   * @returns {{value: number[], isNegative: boolean}} An object containing the digit array and the sign.
   * @throws {Error} For invalid base.
   */
  function toBase(n, base) {
    base = bigInt(base); // Ensure base is an Integer object.

    if (base.isZero()) {
      if (n.isZero())
      {
        return {
          value: [0],
          isNegative: false
        };
      }
      throw new Error("Cannot convert nonzero numbers to base 0.");
    }

    // Special handling for base -1 (alternating powers of -1).
    if (base.equals(-1)) {
      if (n.isZero())
      {
        return {
          value: [0],
          isNegative: false
        };
      }
      if (n.isNegative())
      {
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
      n = n.abs(); // Convert absolute value, then apply sign.
    }

    // Special handling for base 1.
    if (base.equals(1)) {
      if (n.isZero())
      {
        return {
          value: [0],
          isNegative: false
        };
      }
      return {
        value: Array.apply(null, Array(+n)).map(Number.prototype.valueOf, 1),
        isNegative: neg
      };
    }

    var out = [];
    var left = n,
      divmod;

    // Repeatedly divide by base and collect remainders (digits).
    while (left.isNegative() || left.compareAbs(base) >= 0) {
      divmod = left.divmod(base);
      left = divmod.quotient;
      var digit = divmod.remainder;

      // Adjust for negative remainders (e.g., in non-standard bases).
      if (digit.isNegative()) {
        digit = base.minus(digit).abs();
        left = left.next(); // Adjust quotient accordingly.
      }
      out.push(digit.toJSNumber()); // Store the digit.
    }

    out.push(left.toJSNumber()); // Store the last quotient (most significant digit).
    return {
      value: out.reverse(),
      isNegative: neg
    }; // Reverse to get correct order.
  }

  /**
   * Converts an Integer object to its string representation in a given base.
   *
   * @param {BigInteger|SmallInteger} n - The number to convert.
   * @param {number|BigInteger} base - The target base.
   * @returns {string} The string representation.
   */
  function toBaseString(n, base) {
    var arr = toBase(n, base);
    return (arr.isNegative ? "-" : "") + arr.value.map(stringify).join("");
  }

  /**
   * BigInteger prototype method to convert to an array of digits in a given radix.
   *
   * @param {number} [radix=10] - The target radix.
   * @returns {{value: number[], isNegative: boolean}} Object with digit array and sign.
   */
  BigInteger.prototype.toArray = function(radix) {
    return toBase(this, radix);
  };

  // SmallInteger also uses the generic toArray function.
  SmallInteger.prototype.toArray = function(radix) {
    return toBase(this, radix);
  };

  /**
   * BigInteger prototype method to convert to a string representation.
   * Optimizes for base 10.
   *
   * @param {number} [radix=10] - The target radix.
   * @returns {string} The string representation.
   */
  BigInteger.prototype.toString = function(radix) {
    if (radix === undefined)
    {
      radix = 10;
    }
    if (radix !== 10)
    {
      return toBaseString(this, radix);
    }

    var v = this.value,
      l = v.length,
      str = String(v[--l]), // Start with the most significant digit.
      zeros = "0000000", // Helper for padding.
      digit;

    // Concatenate digits, padding with leading zeros to maintain BASE structure.
    while (--l >= 0) {
      digit = String(v[l]);
      str += zeros.slice(digit.length) + digit;
    }

    var sign = this.sign ? "-" : "";
    return sign + str;
  };

  /**
   * SmallInteger prototype method to convert to a string representation.
   * Optimizes for base 10.
   *
   * @param {number} [radix=10] - The target radix.
   * @returns {string} The string representation.
   */
  SmallInteger.prototype.toString = function(radix) {
    if (radix === undefined)
    {
      radix = 10;
    }
    if (radix != 10)
    {
      return toBaseString(this, radix);
    }
    return String(this.value);
  };

  // Provide JSON serialization for BigInteger and SmallInteger.
  BigInteger.prototype.toJSON = SmallInteger.prototype.toJSON = function() {
    return this.toString();
  };

  /**
   * BigInteger prototype method to get the primitive number value.
   * Note: This may lose precision for numbers larger than MAX_INT.
   *
   * @returns {number} The approximate numeric value.
   */
  BigInteger.prototype.valueOf = function() {
    return parseInt(this.toString(), 10);
  };

  // Alias for valueOf.
  BigInteger.prototype.toJSNumber = BigInteger.prototype.valueOf;

  /**
   * SmallInteger prototype method to get the primitive number value.
   *
   * @returns {number} The numeric value.
   */
  SmallInteger.prototype.valueOf = function() {
    return this.value;
  };

  // Alias for valueOf.
  SmallInteger.prototype.toJSNumber = SmallInteger.prototype.valueOf;

  /**
   * Parses a string representation of a number into a BigInteger.
   * Handles optional negative sign, scientific notation, and validates integer format.
   *
   * @param {string} v - The string to parse.
   * @returns {SmallInteger|BigInteger} The parsed number.
   * @throws {Error} If the string is not a valid integer format.
   */
  function parseStringValue(v) {
    // Attempt to parse as a precise small integer first for performance.
    if (isPrecise(+v)) {
      var x = +v;
      if (x === truncate(x))
      {
        return new SmallInteger(x);
      } // Ensure it's an integer.
      throw new Error("Invalid integer: " + v); // Not an integer.
    }

    var sign = v[0] === "-";
    if (sign)
    {
      v = v.slice(1); // Remove sign for parsing magnitude.
    }

    var split = v.split(/e/i); // Handle scientific notation (e.g., "1.23e+5").
    if (split.length > 2)
    {
      throw new Error("Invalid integer: " + split.join("e"));
    } // More than one 'e'.

    if (split.length === 2) {
      var exp = split[1];
      if (exp[0] === "+")
      {
        exp = exp.slice(1);
      } // Remove leading '+'.
      exp = +exp;
      if (exp !== truncate(exp) || !isPrecise(exp))
      {
        throw new Error("Invalid integer: " + exp + " is not a valid exponent.");
      }

      var text = split[0];
      var decimalPlace = text.indexOf(".");
      if (decimalPlace >= 0) {
        exp -= text.length - decimalPlace - 1; // Adjust exponent for decimal places.
        text = text.slice(0, decimalPlace) + text.slice(decimalPlace + 1); // Remove decimal point.
      }

      if (exp < 0)
      {
        throw new Error("Cannot include negative exponent part for integers"); // Integer cannot have negative exponent part.
      }

      text += new Array(exp + 1).join("0"); // Append zeros for positive exponent.
      v = text;
    }

    var isValid = /^([0-9][0-9]*)$/.test(v); // Validate remaining string as pure digits.
    if (!isValid)
    {
      throw new Error("Invalid integer: " + v);
    }

    // Convert the validated digit string into a base-BASE array.
    var r = [],
      max = v.length,
      l = LOG_BASE,
      min = max - l;
    while (max > 0) {
      r.push(+v.slice(min, max)); // Extract chunks of digits.
      min -= l;
      if (min < 0)
      {
        min = 0;
      }
      max -= l;
    }

    trim(r); // Remove leading zeros.
    return new BigInteger(r, sign);
  }

  /**
   * Parses a standard JavaScript number into an Integer object.
   *
   * @param {number} v - The number to parse.
   * @returns {SmallInteger|BigInteger} The parsed number.
   * @throws {Error} If the number is not an integer.
   */
  function parseNumberValue(v) {
    if (isPrecise(v)) {
      if (v !== truncate(v))
      {
        throw new Error(v + " is not an integer.");
      }
      return new SmallInteger(v);
    }
    // If the number is too large for JS's safe integer range, convert to string and parse.
    return parseStringValue(v.toString());
  }

  /**
   * Generic parsing function that takes any value and converts it into an Integer object.
   * Dispatches to specific parsing functions based on the type of `v`.
   *
   * @param {any} v - The value to parse (number, string, or existing Integer object).
   * @returns {SmallInteger|BigInteger} The parsed number.
   */
  function parseValue(v) {
    if (typeof v === "number")
    {
      return parseNumberValue(v);
    }
    if (typeof v === "string")
    {
      return parseStringValue(v);
    }
    return v; // Assume it's already an Integer object.
  }


  // --- Initialization and Export ---

  // Pre-instantiate small integer objects (0-999) for performance.
  for (var i = 0; i < 1e3; i++) {
    Integer[i] = new SmallInteger(i);
    if (i > 0)
    {
      Integer[-i] = new SmallInteger(-i);
    }
  }

  // Common integer constants.
  Integer.one = Integer[1];
  Integer.zero = Integer[0];
  Integer.minusOne = Integer[-1];

  // Export utility functions directly on the Integer constructor.
  Integer.max = max;
  Integer.min = min;
  Integer.gcd = gcd;
  Integer.lcm = lcm;

  // Method to check if an object is an instance of BigInteger or SmallInteger.
  Integer.isInstance = function(x) {
    return x instanceof BigInteger || x instanceof SmallInteger;
  };

  Integer.randBetween = randBetween;

  /**
   * Factory method to create an Integer from an array of digits in a given base.
   *
   * @param {number[]} digits - Array of digit values (e.g., [1, 2, 3] for 123).
   * @param {number} [base=10] - The base of the digits.
   * @param {boolean} [isNegative=false] - Whether the number is negative.
   * @returns {BigInteger|SmallInteger} The created integer.
   */
  Integer.fromArray = function(digits, base, isNegative) {
    return parseBaseFromArray(digits.map(parseValue), parseValue(base || 10), isNegative);
  };

  return Integer; // Return the main bigInt API.

}();


/*
 * GET Input Utility Module
 * This IIFE provides a set of helper functions to read and parse input
 * from a string, typically from standard input.
 * It allows reading tokens, lines, or blocks of lines, converting to numbers or keeping as strings.
 */
var GET = (function() {

  /**
   * Factory function that creates and returns a new input reader instance.
   * @param {string} s - The raw input string, usually from a file or stdin.
   * @returns {g} An instance of the input reader.
   */
  function f(s) {
    return new g(s);
  }

  /**
   * Constructor for the input reader object.
   * Initializes the internal state for reading.
   * @param {string} s - The raw input string.
   */
  function g(s) {
    this._s = s.trim().split("\n"); // Trim whitespace and split into an array of lines.
    this._y = 0; // Current line index, points to the next line to read.
  }

  /**
   * Reads a single token (word) from the current input line.
   * Tokens are space-separated. If the current line is exhausted, it advances to the next.
   * @param {boolean} [f] - If true, returns the token as a string. Otherwise, attempts to parse it as a number.
   * @returns {string|number} The parsed token.
   */
  g.prototype.a = function(f) {
    var s = this._s,
      y = this._y,
      r;

    // If the current line has not yet been split into tokens, do so and reverse for efficient popping.
    if (typeof s[y] === "string")
    {
      s[y] = s[y].split(" ").reverse();
    }

    r = s[y].pop(); // Get the last element (which is the first token in original order).

    // If the current line is now empty, advance to the next line.
    if (!s[y].length)
    {
      this._y++;
    }

    return f ? r : +r; // Return as string or convert to number.
  };

  /**
   * Reads an entire line from the input and splits it into tokens.
   * Advances the current line index.
   * @param {boolean} [f] - If true, returns an array of strings. Otherwise, returns an array of numbers.
   * @returns {string[]|number[]} An array of tokens from the line.
   */
  g.prototype.l = function(f) {
    var s = this._s[this._y++].split(" "); // Get the current line, split by spaces, and advance line index.
    return f ? s : s.map(a => +a); // Return as string array or convert each to number.
  };

  /**
   * Reads `n` lines from the input, splitting each into tokens.
   * Advances the current line index by `n`.
   * @param {number} n - The number of lines to read.
   * @param {boolean} [f] - If true, returns an array of string arrays. Otherwise, returns an array of number arrays.
   * @returns {string[][]|number[][]} An array of arrays, representing the parsed lines.
   */
  g.prototype.m = function(n, f) {
    // Slice `n` lines, then map each line to an array of tokens.
    var r = this._s.slice(this._y, this._y += n).map(a => a.split(" "));
    return f ? r : r.map(a => a.map(a => +a)); // Return as string arrays or convert all to numbers.
  };

  /**
   * Reads `n` lines from the input as raw lines (without splitting into tokens).
   * Advances the current line index by `n`.
   * @param {number} n - The number of lines to read.
   * @param {boolean} [f] - If true, returns an array of raw strings. Otherwise, returns an array of numbers (one per line).
   * @returns {string[]|number[]} An array of lines.
   */
  g.prototype.r = function(n, f) {
    var r = this._s.slice(this._y, this._y += n); // Slice `n` lines.
    return f ? r : r.map(a => +a); // Return as string array or convert each to number.
  };

  return f; // Return the factory function as the public API for GET.

})();


// Initialize the input parser by reading from standard input.
var o = GET(require("fs").readFileSync("/dev/stdin", "utf8"));

// Initialize the bigInt library instance.
// Calling bigInt() without arguments returns Integer[0] (zero).
var bi = bigInt();

// Execute the main problem-solving logic and print its result to the console.
console.log(main());


/**
 * The main function that encapsulates the problem's logic.
 * It reads problem parameters (N, K, array A), calculates subarray sums,
 * and then finds a specific bitwise XOR pattern based on these sums.
 *
 * @returns {number} The final calculated answer.
 */
function main() {

  var n = o.a(); // Read the first integer, N.
  var k = o.a(); // Read the second integer, K.

  var a = o.l(); // Read an array of integers, A.

  // Calculate prefix sums for array `a`.
  // s[i] will store the sum of elements from a[0] to a[i-1].
  var s = [0];
  for (var i = 0; i < n; i++)
  {
    s[i + 1] = s[i] + a[i];
  }

  // Generate all possible subarray sums and count their frequencies.
  var w = [],
    max = 0,
    x = {}; // `w` stores unique subarray sums, `x` stores their counts.

  for (var l = 0; l < n; l++) {
    for (var r = l + 1; r <= n; r++) {
      var t = s[r] - s[l]; // Calculate the sum of subarray a[l...r-1].

      if (x[t])
      {
        x[t]++; // Increment count if sum `t` already exists.
      }
      else {
        w.push(t); // Add `t` to the list of unique sums.
        x[t] = 1; // Initialize count for new sum `t`.
      }

      if (t > max)
      {
        max = t; // Keep track of the maximum subarray sum found.
      }
    }
  }

  // Determine the highest bit position `q` in `max`.
  // `q` will be floor(log2(max)).
  var q = 0;
  while (max > 1)
  {
    max = Math.floor(max / 2), q++;
  }

  var ans = 0; // Initialize the final answer.

  // Iterate from the highest bit position down to 30.
  // Bits at or above position 30 might exceed standard JavaScript number precision,
  // so `bigInt` operations are used here.
  for (i = q; i >= 30; i--) {
    var t = [],
      z = Math.pow(2, i), // The value of the current bit (2^i).
      c = 0; // Counter for sums that have the current bit set.

    for (var j = 0; j < w.length; j++) {
      // Check if the `i`-th bit is set in `w[j]` using `bigInt`'s bitwise AND.
      // `bi.add(z)` creates a bigInt from `z`.
      if (!bi.add(z).and(w[j]).isZero()) {
        t.push(w[j]); // If bit is set, keep this sum.
        c += x[w[j]]; // Add its frequency to the counter.
      }
    }

    // If the count of sums with this bit set is at least `k`.
    if (c >= k) {
      ans += z; // Include this bit's value in the answer.
      w = t; // Filter `w` to only include sums that had this bit set.
    }
  }

  // Continue iteration for lower bit positions (from 29 down to 0).
  // Standard JavaScript bitwise operations are sufficient here.
  for (; i >= 0; i--) {
    var t = [],
      z = 1 << i, // The value of the current bit (2^i).
      c = 0; // Counter for sums that have the current bit set.

    for (j = 0; j < w.length; j++) {
      // Check if the `i`-th bit is set in `w[j]` using standard bitwise AND.
      if ((z & w[j]) !== 0) {
        t.push(w[j]); // If bit is set, keep this sum.
        c += x[w[j]]; // Add its frequency to the counter.
      }
    }

    // If the count of sums with this bit set is at least `k`.
    if (c >= k) {
      ans += z; // Include this bit's value in the answer.
      w = t; // Filter `w` to only include sums that had this bit set.
    }
  }

  return ans; // Return the final calculated answer.
}