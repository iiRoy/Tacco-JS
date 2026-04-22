"use strict"
; /* Enable strict mode for better error handling and cleaner code. */

// Define the GET utility module using an Immediately Invoked Function Expression (IIFE).
// This module provides methods for parsing input data.
var GET = (function () {
  // Inner function `f` acts as the public interface for the GET module.
  // It creates and returns a new instance of the `g` class.
  function f (s) {
    return new g(s);
  }

  // Constructor function `g` for handling input string parsing.
  // It initializes the internal state with the input string.
  function g (s) {
    // Trim whitespace and split the input string into lines.
    this._s = s .trim() .split("\n");
    // Initialize the current line index to 0.
    this._y = 0;
  }

  // Prototype method `a` for `g`: Reads a single token from the current line.
  // If `f` is true, returns the token as a string; otherwise, converts to a number.
  g.prototype.a = function (f) {
    var s = this._s, // Reference to the array of input lines.
        y = this._y, // Current line index.
        r;           // Variable to hold the result.

    // Check if the current line needs to be processed (split and reversed).
    if ( typeof s[y] === "string" ) {
      s[y] = s[y] .split(" ") .reverse();
    }

    // Pop the last token from the current line (which is the first after reversal).
    r = s[y] .pop();

    // If the current line is now empty, advance to the next line.
    if ( !s[y] .length ) {
      this._y++;
    }

    // Return the token, optionally converting it to a number.
    return f ? r : +r;
  };

  // Prototype method `l` for `g`: Reads an entire line of tokens.
  // If `f` is true, returns tokens as strings; otherwise, converts them to numbers.
  g.prototype.l = function (f) {
    // Split the current line into tokens and advance the line index.
    var s = this._s[this._y++] .split(" ");

    // Return tokens, optionally converting each to a number.
    return f ? s : s .map( a => +a );
  };

  // Prototype method `m` for `g`: Reads `n` lines, each containing multiple tokens.
  // If `f` is true, returns 2D array of strings; otherwise, converts all to numbers.
  g.prototype.m = function (n, f) {
    // Slice `n` lines, split each into tokens, and advance the line index.
    var r = this._s .slice(this._y, this._y += n) .map(a => a .split(" "));

    // Return the 2D array, optionally converting all tokens to numbers.
    return f ? r : r .map(a => a .map(a => +a));
  };

  // Prototype method `r` for `g`: Reads `n` lines as raw string or converted to numbers.
  // If `f` is true, returns array of strings; otherwise, converts all to numbers.
  g.prototype.r = function (n, f) {
    // Slice `n` lines and advance the line index.
    var r = this._s .slice(this._y, this._y += n);

    // Return the array, optionally converting each element to a number.
    return f ? r : r .map(a => +a);
  };

  // The public interface of the GET module.
  return f;

})(); // End of the GET IIFE.


// Initialize 'o' with the GET parser, reading input from /dev/stdin.
var o = GET(require("fs").readFileSync("/dev/stdin", "utf8"));


// Function to dynamically create a multi-dimensional array.
// 'v' is the initial value, subsequent arguments define dimensions.
function xArray (v) {
  var a = arguments, // All arguments passed to the function.
      l = a.length,  // Number of arguments.
      r = "Array(a[" + --l + "]) .fill(0) .map(x=>{return " + v + ";})"; // Innermost array creation.

  // Loop to build up the array creation string for each dimension.
  while ( --l ) {
    r = "Array(a[" + l + "]) .fill(0) .map(x=>" + r + ")";
  }

  // Evaluate the constructed string to create the array.
  return eval(r);
}


// The bigInt library, implemented as an IIFE to encapsulate its internals.
var bigInt = (function (undefined) {
  "use strict"; // Enforce strict mode within the bigInt module.

  // --- Constants and Global Variables ---
  var BASE = 1e7,                 // Base for internal number representation (10^7).
      LOG_BASE = 7,               // Logarithm of BASE (log10(10^7) = 7).
      MAX_INT = 9007199254740992, // Maximum safe integer in JavaScript (2^53 - 1).
      MAX_INT_ARR = smallToArray(MAX_INT), // MAX_INT represented as an array of BASE digits.
      LOG_MAX_INT = Math.log(MAX_INT);     // Logarithm of MAX_INT, used for base conversion checks.


  // --- Integer Constructor and Type Definitions ---

  // Main Integer constructor (abstract).
  // All bigInt objects are instances of Integer, but can be SmallInteger or BigInteger.
  function Integer (v, radix) {
    if ( typeof v === "undefined" ) {
      return Integer[0]; // Return zero if no value is provided.
    }
    if ( typeof radix !== "undefined" ) {
      // If radix is provided, parse the value based on the radix.
      return +radix === 10 ? parseValue(v) : parseBase(v, radix);
    }
    // Default parsing for a given value.
    return parseValue(v);
  }

  // BigInteger constructor: For numbers too large to fit in a SmallInteger.
  function BigInteger (value, sign) {
    this.value = value; // Array of digits in BASE.
    this.sign = sign;   // Boolean: true for negative, false for positive.
    this.isSmall = false; // Flag indicating it's a BigInteger.
  }
  // Inherit methods from Integer.
  BigInteger.prototype = Object .create(Integer.prototype);


  // SmallInteger constructor: For numbers that fit within JavaScript's safe integer range.
  function SmallInteger (value) {
    this.value = value; // The raw JavaScript number.
    this.sign = value < 0; // Boolean: true for negative, false for positive.
    this.isSmall = true; // Flag indicating it's a SmallInteger.
  }
  // Inherit methods from Integer.
  SmallInteger.prototype = Object .create(Integer.prototype);


  // --- Utility Functions ---

  // Checks if a number `n` can be precisely represented as a SmallInteger.
  function isPrecise (n) {
    return -MAX_INT < n && n < MAX_INT;
  }

  // Converts a small JavaScript number `n` into an array of BASE digits.
  function smallToArray (n) {
    if ( n < BASE ) {
      return [n];
    }
    if ( n < BASE * BASE ) {
      return [n % BASE, Math .floor(n / BASE)];
    }
    // For numbers up to MAX_INT (which is less than BASE^3).
    return [n % BASE, Math .floor(n / BASE) % BASE, Math .floor(n / (BASE * BASE))];
  }

  // Converts an array of BASE digits back to a small JavaScript number if possible.
  function arrayToSmall (arr) {
    trim(arr); // Remove leading zeros.
    var length = arr.length;

    // If the array is small enough and its absolute value is within MAX_INT.
    if ( length < 4 && compareAbs(arr, MAX_INT_ARR) < 0 ) {
      switch ( length ) {
        case 0:
          return 0;
        case 1:
          return arr[0];
        case 2:
          return arr[0] + arr[1] * BASE;
        default: // length is 3
          return arr[0] + (arr[1] + arr[2] * BASE) * BASE;
      }
    }
    return arr; // Return the array if it's too large to be a SmallInteger.
  }

  // Removes leading zeros (or empty elements) from a digit array.
  function trim (v) {
    var i = v.length;
    while ( v[--i] === 0 && i >= 0 ); // Find the last non-zero digit.
    v.length = i + 1; // Truncate the array.
  }

  // Creates a new array of a given length, filled with zeros.
  function createArray (length) {
    var x = new Array(length);
    var i = -1;
    while ( ++i < length ) {
      x[i] = 0;
    }
    return x;
  }

  // Truncates a number (removes decimal part). Floors for positive, ceils for negative.
  function truncate (n) {
    if ( n > 0 ) {
      return Math .floor(n);
    }
    return Math .ceil(n);
  }


  // --- Arithmetic Operations: Addition ---

  // Adds two arrays of digits (representing positive numbers).
  function add (a, b) {
    var l_a = a.length,
        l_b = b.length,
        r = new Array(l_a), // Result array, sized to the longer input.
        carry = 0,
        base = BASE,
        sum,
        i;

    // Add digits up to the length of the shorter array.
    for ( i = 0; i < l_b; i++ ) {
      sum = a[i] + b[i] + carry;
      carry = sum >= base ? 1 : 0;
      r[i] = sum - carry * base;
    }

    // Add remaining digits from the longer array, with carry.
    while ( i < l_a ) {
      sum = a[i] + carry;
      carry = sum === base ? 1 : 0;
      r[i++] = sum - carry * base;
    }

    // If there's a final carry, push it to the result.
    if ( carry > 0 ) {
      r .push(carry);
    }
    return r;
  }

  // Adds two digit arrays, ensuring the longer array is 'a' for `add`.
  function addAny (a, b) {
    if ( a.length >= b.length ) {
      return add(a, b);
    }
    return add(b, a);
  }

  // Adds a small number (`carry`) to a digit array (`a`).
  function addSmall (a, carry) {
    var l = a.length,
        r = new Array(l),
        base = BASE,
        sum,
        i;

    // Add the carry to each digit, propagating new carries.
    for ( i = 0; i < l; i++ ) {
      sum = a[i] - base + carry; // Subtract base to handle potential negative sums directly.
      carry = Math .floor(sum / base);
      r[i] = sum - carry * base;
      carry += 1; // Increment carry for the next iteration.
    }

    // Handle any remaining carry.
    while ( carry > 0 ) {
      r[i++] = carry % base;
      carry = Math .floor(carry / base);
    }
    return r;
  }

  // BigInteger prototype method for addition.
  BigInteger.prototype.add = function (v) {
    var n = parseValue(v); // Parse the input value into an Integer object.

    // If signs are different, convert to subtraction.
    if ( this.sign !== n.sign ) {
      return this .subtract(n .negate());
    }

    var a = this.value, // This BigInteger's digit array.
        b = n.value;    // Other Integer's digit array/value.

    // If the other number is small, use optimized `addSmall`.
    if ( n.isSmall ) {
      return new BigInteger(addSmall(a, Math .abs(b)), this.sign);
    }
    // Both are BigIntegers, use `addAny`.
    return new BigInteger(addAny(a, b), this.sign);
  };
  // Alias `plus` to `add`.
  BigInteger.prototype.plus = BigInteger.prototype.add;

  // SmallInteger prototype method for addition.
  SmallInteger.prototype.add = function (v) {
    var n = parseValue(v);
    var a = this.value;

    // If signs are different, convert to subtraction.
    if ( a < 0 !== n.sign ) {
      return this .subtract(n .negate());
    }

    var b = n.value;

    // If both are SmallIntegers, perform direct addition.
    if ( n.isSmall ) {
      if ( isPrecise(a + b) ) {
        return new SmallInteger(a + b);
      }
      // If result exceeds safe integer, convert `b` to array and proceed.
      b = smallToArray(Math .abs(b));
    }
    // One or both are BigIntegers (or result of SmallInteger addition is too large).
    return new BigInteger(addSmall(b, Math .abs(a)), a < 0);
  };
  // Alias `plus` to `add`.
  SmallInteger.prototype.plus = SmallInteger.prototype.add;


  // --- Arithmetic Operations: Subtraction ---

  // Subtracts digit array `b` from `a` (assuming `a >= b`).
  function subtract (a, b) {
    var a_l = a.length,
        b_l = b.length,
        r = new Array(a_l), // Result array, sized to the longer input.
        borrow = 0,
        base = BASE,
        i,
        difference;

    // Subtract digits up to the length of the shorter array.
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

    // Subtract remaining digits from the longer array with borrow.
    for ( i = b_l; i < a_l; i++ ) {
      difference = a[i] - borrow;
      if ( difference < 0 ) {
        difference += base;
      } else {
        r[i++] = difference; // If no borrow, we can stop early.
        break;
      }
      r[i] = difference;
    }

    // Copy any remaining digits from `a`.
    for ( ; i < a_l; i++ ) {
      r[i] = a[i];
    }

    trim(r); // Remove leading zeros.
    return r;
  }

  // Performs subtraction of two digit arrays, handling signs and order.
  function subtractAny (a, b, sign) {
    var value;

    // Determine which array is larger in absolute value.
    if ( compareAbs(a, b) >= 0 ) {
      value = subtract(a, b);
    } else {
      value = subtract(b, a);
      sign = !sign; // Flip sign if we swapped operands.
    }

    value = arrayToSmall(value); // Try to convert to SmallInteger.

    if ( typeof value === "number" ) {
      if ( sign ) {
        value = -value;
      }
      return new SmallInteger(value);
    }
    return new BigInteger(value, sign);
  }

  // Subtracts a small number `b` from a digit array `a`.
  function subtractSmall (a, b, sign) {
    var l = a.length,
        r = new Array(l),
        carry = -b, // `carry` here acts as the negative value to subtract.
        base = BASE,
        i,
        difference;

    // Perform subtraction with carry propagation.
    for ( i = 0; i < l; i++ ) {
      difference = a[i] + carry; // `a[i] - b` effectively.
      carry = Math .floor(difference / base);
      difference %= base;
      r[i] = difference < 0 ? difference + base : difference;
    }

    r = arrayToSmall(r); // Try to convert to SmallInteger.

    if ( typeof r === "number" ) {
      if ( sign ) {
        r = -r;
      }
      return new SmallInteger(r);
    }
    return new BigInteger(r, sign);
  }

  // BigInteger prototype method for subtraction.
  BigInteger.prototype.subtract = function (v) {
    var n = parseValue(v);

    // If signs are different, convert to addition.
    if ( this.sign !== n.sign ) {
      return this .add(n .negate());
    }

    var a = this.value,
        b = n.value;

    // If the other number is small, use optimized `subtractSmall`.
    if ( n.isSmall ) {
      return subtractSmall(a, Math .abs(b), this.sign);
    }
    // Both are BigIntegers, use `subtractAny`.
    return subtractAny(a, b, this.sign);
  };
  // Alias `minus` to `subtract`.
  BigInteger.prototype.minus = BigInteger.prototype.subtract;

  // SmallInteger prototype method for subtraction.
  SmallInteger.prototype.subtract = function (v) {
    var n = parseValue(v);
    var a = this.value;

    // If signs are different, convert to addition.
    if ( a < 0 !== n.sign ) {
      return this .add(n .negate());
    }

    var b = n.value;

    // If both are SmallIntegers, perform direct subtraction.
    if ( n.isSmall ) {
      return new SmallInteger(a - b);
    }
    // One is SmallInteger, the other is BigInteger (or result too large for SmallInteger).
    return subtractSmall(b, Math .abs(a), a >= 0);
  };
  // Alias `minus` to `subtract`.
  SmallInteger.prototype.minus = SmallInteger.prototype.subtract;


  // --- Sign and Absolute Value Operations ---

  // Negates a BigInteger.
  BigInteger.prototype.negate = function () {
    return new BigInteger(this.value, !this.sign);
  };

  // Negates a SmallInteger.
  SmallInteger.prototype.negate = function () {
    var sign = this.sign;
    var small = new SmallInteger(-this.value);
    small.sign = !sign; // Invert the sign property explicitly.
    return small;
  };

  // Returns the absolute value of a BigInteger.
  BigInteger.prototype.abs = function () {
    return new BigInteger(this.value, false); // Always positive.
  };

  // Returns the absolute value of a SmallInteger.
  SmallInteger.prototype.abs = function () {
    return new SmallInteger(Math .abs(this.value));
  };


  // --- Arithmetic Operations: Multiplication ---

  // Multiplies two digit arrays using standard long multiplication.
  function multiplyLong (a, b) {
    var a_l = a.length,
        b_l = b.length,
        l = a_l + b_l, // Maximum possible length of the result.
        r = createArray(l), // Initialize result array with zeros.
        base = BASE,
        product,
        carry,
        i,
        a_i,
        b_j;

    // Iterate through digits of `a`.
    for ( i = 0; i < a_l; ++i ) {
      a_i = a[i];
      carry = 0; // Reset carry for each digit of `a`.

      // Iterate through digits of `b`.
      for ( var j = 0; j < b_l; ++j ) {
        b_j = b[j];
        product = a_i * b_j + r[i + j] + carry; // Current product + existing digit + carry.
        carry = Math .floor(product / base);
        r[i + j] = product - carry * base;
      }
      r[i + l_b] += carry; // Add remaining carry to the next position.
    }
    trim(r); // Remove leading zeros.
    return r;
  }

  // Multiplies a digit array `a` by a small number `b`.
  function multiplySmall (a, b) {
    var l = a.length,
        r = new Array(l),
        base = BASE,
        carry = 0,
        product,
        i;

    // Multiply each digit by `b` and propagate carry.
    for ( i = 0; i < l; i++ ) {
      product = a[i] * b + carry;
      carry = Math .floor(product / base);
      r[i] = product - carry * base;
    }

    // Handle any remaining carry.
    while ( carry > 0 ) {
      r[i++] = carry % base;
      carry = Math .floor(carry / base);
    }
    return r;
  }

  // Shifts a digit array `x` left by `n` positions (effectively multiplying by BASE^n).
  function shiftLeft (x, n) {
    var r = [];
    while ( n-- > 0 ) {
      r .push(0); // Prepend zeros.
    }
    return r .concat(x);
  }

  // Multiplies two digit arrays using Karatsuba algorithm for efficiency with large numbers.
  function multiplyKaratsuba (x, y) {
    var n = Math .max(x.length, y.length);

    // Base case: if numbers are small, use long multiplication.
    if ( n <= 30 ) {
      return multiplyLong(x, y);
    }

    n = Math .ceil(n / 2); // Split point for Karatsuba.

    // Split x and y into two halves.
    var b = x .slice(n),
        a = x .slice(0, n),
        d = y .slice(n),
        c = y .slice(0, n);

    // Recursively compute sub-products.
    var ac = multiplyKaratsuba(a, c),
        bd = multiplyKaratsuba(b, d),
        abcd = multiplyKaratsuba(addAny(a, b), addAny(c, d));

    // Combine sub-products according to Karatsuba formula:
    // x*y = (ac * B^2n) + ((ad+bc) * B^n) + bd
    // ad+bc = abcd - ac - bd
    var product = addAny(addAny(ac, shiftLeft(subtract(subtract(abcd, ac), bd), n)), shiftLeft(bd, 2 * n));

    trim(product); // Remove leading zeros.
    return product;
  }

  // Heuristic to decide whether to use Karatsuba or standard long multiplication.
  function useKaratsuba (l1, l2) {
    // This formula determines if Karatsuba is likely faster based on lengths.
    return -0.012 * l1 - 0.012 * l2 + 15e-6 * l1 * l2 > 0;
  }

  // BigInteger prototype method for multiplication.
  BigInteger.prototype.multiply = function (v) {
    var n = parseValue(v),
        a = this.value,
        b = n.value,
        sign = this.sign !== n.sign, // Determine the sign of the result.
        abs;

    // Optimization: If the other number is small.
    if ( n.isSmall ) {
      if ( b === 0 ) {
        return Integer[0]; // Multiply by zero.
      }
      if ( b === 1 ) {
        return this; // Multiply by one.
      }
      if ( b === -1 ) {
        return this .negate(); // Multiply by negative one.
      }
      abs = Math .abs(b);
      if ( abs < BASE ) {
        // If small number fits in a single digit of BASE.
        return new BigInteger(multiplySmall(a, abs), sign);
      }
      // Small number is larger than BASE, convert to array.
      b = smallToArray(abs);
    }

    // Decide between Karatsuba and long multiplication.
    if ( useKaratsuba(a.length, b.length) ) {
      return new BigInteger(multiplyKaratsuba(a, b), sign);
    }
    return new BigInteger(multiplyLong(a, b), sign);
  };
  // Alias `times` to `multiply`.
  BigInteger.prototype.times = BigInteger.prototype.multiply;

  // Helper for multiplying a small number with a digit array.
  function multiplySmallAndArray (a, b, sign) {
    if ( a < BASE ) {
      return new BigInteger(multiplySmall(b, a), sign);
    }
    return new BigInteger(multiplyLong(b, smallToArray(a)), sign);
  }

  // Internal multiplication method for SmallInteger by another Integer.
  SmallInteger.prototype._multiplyBySmall = function (a) {
    // If both are small and result is precise, return SmallInteger.
    if ( isPrecise(a.value * this.value) ) {
      return new SmallInteger(a.value * this.value);
    }
    // Otherwise, use array multiplication logic.
    return multiplySmallAndArray(Math .abs(a.value), smallToArray(Math .abs(this.value)), this.sign !== a.sign);
  };

  // Internal multiplication method for BigInteger by a SmallInteger.
  BigInteger.prototype._multiplyBySmall = function (a) {
    if ( a.value === 0 ) {
      return Integer[0];
    }
    if ( a.value === 1 ) {
      return this;
    }
    if ( a.value === -1 ) {
      return this .negate();
    }
    return multiplySmallAndArray(Math .abs(a.value), this.value, this.sign !== a.sign);
  };

  // SmallInteger prototype method for multiplication.
  SmallInteger.prototype.multiply = function (v) {
    // Delegate to the internal _multiplyBySmall method after parsing `v`.
    return parseValue(v) ._multiplyBySmall(this);
  };
  // Alias `times` to `multiply`.
  SmallInteger.prototype.times = SmallInteger.prototype.multiply;


  // --- Arithmetic Operations: Square ---

  // Squares a digit array.
  function square (a) {
    var l = a.length,
        r = createArray(l + l), // Result can be up to twice the length.
        base = BASE,
        product,
        carry,
        i,
        a_i,
        a_j;

    // Standard square multiplication algorithm.
    for ( i = 0; i < l; i++ ) {
      a_i = a[i];
      carry = 0 - a_i * a_i; // Initialize carry with diagonal product (negative).

      for ( var j = i; j < l; j++ ) {
        a_j = a[j];
        // For j=i, it's a_i*a_i. For j>i, it's 2*a_i*a_j.
        product = 2 * (a_i * a_j) + r[i + j] + carry;
        carry = Math .floor(product / base);
        r[i + j] = product - carry * base;
      }
      r[i + l] = carry; // Store final carry.
    }
    trim(r); // Remove leading zeros.
    return r;
  }

  // BigInteger prototype method for squaring.
  BigInteger.prototype.square = function () {
    return new BigInteger(square(this.value), false); // Square is always positive.
  };

  // SmallInteger prototype method for squaring.
  SmallInteger.prototype.square = function () {
    var value = this.value * this.value;
    if ( isPrecise(value) ) {
      return new SmallInteger(value);
    }
    // If result exceeds safe integer, convert to BigInteger.
    return new BigInteger(square(smallToArray(Math .abs(this.value))), false);
  };


  // --- Arithmetic Operations: Division and Modulo ---

  // Division with remainder using Knuth's algorithm D (Algorithm 9.1 in "The Art of Computer Programming, Vol. 2").
  // This version performs normalization by multiplying by lambda.
  function divMod1 (a, b) {
    var a_l = a.length,
        b_l = b.length,
        base = BASE,
        result = createArray(b.length), // Quotient array.
        divisorMostSignificantDigit = b[b_l - 1],
        lambda = Math .ceil(base / (2 * divisorMostSignificantDigit)), // Normalization factor.
        remainder = multiplySmall(a, lambda), // Normalized dividend.
        divisor = multiplySmall(b, lambda),   // Normalized divisor.
        quotientDigit,
        shift,
        carry,
        borrow,
        i,
        l,
        q;

    if ( remainder.length <= a_l ) {
      remainder .push(0); // Ensure enough space for normalization.
    }
    divisor .push(0); // Pad divisor for easier calculations.
    divisorMostSignificantDigit = divisor[b_l - 1]; // Re-get MSD after normalization.

    // Main loop for calculating quotient digits.
    for ( shift = a_l - b_l; shift >= 0; shift-- ) {
      quotientDigit = base - 1; // Initial guess for quotient digit.
      if ( remainder[shift + b_l] !== divisorMostSignificantDigit ) {
        // More precise guess if MSDs don't match (prevents division by zero or very small numbers).
        quotientDigit = Math .floor((remainder[shift + b_l] * base + remainder[shift + b_l - 1]) / divisorMostSignificantDigit);
      }

      carry = 0;
      borrow = 0;
      l = divisor.length;

      // Subtract (quotientDigit * divisor) from current part of remainder.
      for ( i = 0; i < l; i++ ) {
        carry += quotientDigit * divisor[i];
        q = Math .floor(carry / base);
        borrow += remainder[shift + i] - (carry - q * base); // Calculate borrow.
        carry = q;

        if ( borrow < 0 ) {
          remainder[shift + i] = borrow + base;
          borrow = -1;
        } else {
          remainder[shift + i] = borrow;
          borrow = 0;
        }
      }

      // Adjust quotientDigit if it was too large (borrow was negative).
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
        borrow += carry;
      }
      result[shift] = quotientDigit; // Store the calculated quotient digit.
    }

    // Denormalize the remainder by dividing by lambda.
    remainder = divModSmall(remainder, lambda)[0];

    return [arrayToSmall(result), arrayToSmall(remainder)];
  }

  // Alternative division algorithm for very large numbers (simpler, but potentially slower).
  function divMod2 (a, b) {
    var a_l = a.length,
        b_l = b.length,
        result = [],
        part = [], // Current segment of the dividend being processed.
        base = BASE,
        guess,
        xlen,
        highx,
        highy,
        check;

    // Process dividend digits from left to right.
    while ( a_l ) {
      part .unshift(a[--a_l]); // Add the next digit to the current part.
      trim(part); // Remove leading zeros from the part.

      // If the current part is less than the divisor, quotient digit is 0.
      if ( compareAbs(part, b) < 0 ) {
        result .push(0);
        continue;
      }

      xlen = part.length;
      highx = part[xlen - 1] * base + part[xlen - 2]; // Top two digits of current part.
      highy = b[b_l - 1] * base + b[b_l - 2];         // Top two digits of divisor.

      if ( xlen > b_l ) {
        highx = (highx + 1) * base; // Adjust if part is longer than divisor.
      }

      guess = Math .ceil(highx / highy); // Initial guess for quotient digit.

      // Refine the guess by repeatedly subtracting (guess * divisor) until it fits.
      do {
        check = multiplySmall(b, guess);
        if ( compareAbs(check, part) <= 0 ) {
          break; // Guess is good.
        }
        guess--;
      } while ( guess );

      result .push(guess); // Store quotient digit.
      part = subtract(part, check); // Update the remainder part.
    }

    result .reverse(); // Reverse result to get correct order.
    return [arrayToSmall(result), arrayToSmall(part)];
  }

  // Divides a digit array `value` by a small number `lambda`.
  function divModSmall (value, lambda) {
    var length = value.length,
        quotient = createArray(length),
        base = BASE,
        i,
        q,
        remainder,
        divisor;

    remainder = 0;
    // Perform division from most significant digit to least significant.
    for ( i = length - 1; i >= 0; --i ) {
      divisor = remainder * base + value[i];
      q = truncate(divisor / lambda);
      remainder = divisor - q * lambda;
      quotient[i] = q | 0; // Ensure integer value.
    }
    return [quotient, remainder | 0]; // Return quotient array and final remainder.
  }

  // Generic division and modulo function, dispatches to appropriate algorithm.
  function divModAny (self, v) {
    var value,
        n = parseValue(v); // Parse the divisor.

    var a = self.value, // Dividend's value.
        b = n.value;    // Divisor's value.

    var quotient;

    if ( b === 0 ) {
      throw new Error("Cannot divide by zero");
    }

    // Handle cases where the dividend is a SmallInteger.
    if ( self.isSmall ) {
      if ( n.isSmall ) {
        return [new SmallInteger(truncate(a / b)), new SmallInteger(a % b)];
      }
      return [Integer[0], self]; // Small / Big (abs) = 0 remainder Small.
    }

    // Handle cases where the divisor is a SmallInteger.
    if ( n.isSmall ) {
      if ( b === 1 ) {
        return [self, Integer[0]]; // Divide by 1.
      }
      if ( b === -1 ) {
        return [self .negate(), Integer[0]]; // Divide by -1.
      }
      var abs = Math .abs(b);
      if ( abs < BASE ) {
        // If small divisor fits in a single digit of BASE.
        value = divModSmall(a, abs);
        quotient = arrayToSmall(value[0]);
        var remainder = value[1];

        if ( self.sign ) {
          remainder = -remainder; // Adjust remainder sign.
        }

        if ( typeof quotient === "number" ) {
          if ( self.sign !== n.sign ) {
            quotient = -quotient; // Adjust quotient sign.
          }
          return [new SmallInteger(quotient), new SmallInteger(remainder)];
        }
        return [new BigInteger(quotient, self.sign !== n.sign), new SmallInteger(remainder)];
      }
      b = smallToArray(abs); // Convert small divisor to array if larger than BASE.
    }

    // Both are BigIntegers.
    var comparison = compareAbs(a, b);
    if ( comparison === -1 ) {
      return [Integer[0], self]; // Dividend is smaller than divisor (abs).
    }
    if ( comparison === 0 ) {
      // Dividend equals divisor (abs).
      return [Integer[self.sign === n.sign ? 1 : -1], Integer[0]];
    }

    // Choose division algorithm based on length.
    if ( a.length + b.length <= 200 ) {
      value = divMod1(a, b); // Knuth's algorithm.
    } else {
      value = divMod2(a, b); // Simpler repeated subtraction.
    }

    quotient = value[0];
    var qSign = self.sign !== n.sign, // Quotient sign.
        mod = value[1],
        mSign = self.sign;             // Remainder sign is same as dividend.

    // Convert quotient to appropriate Integer type.
    if ( typeof quotient === "number" ) {
      if ( qSign ) {
        quotient = -quotient;
      }
      quotient = new SmallInteger(quotient);
    } else {
      quotient = new BigInteger(quotient, qSign);
    }

    // Convert remainder to appropriate Integer type.
    if ( typeof mod === "number" ) {
      if ( mSign ) {
        mod = -mod;
      }
      mod = new SmallInteger(mod);
    } else {
      mod = new BigInteger(mod, mSign);
    }

    return [quotient, mod];
  }

  // BigInteger prototype method for division and modulo (returns an object).
  BigInteger.prototype.divmod = function (v) {
    var result = divModAny(this, v);
    return { quotient: result[0], remainder: result[1] };
  };
  // SmallInteger also uses the same divmod.
  SmallInteger.prototype.divmod = BigInteger.prototype.divmod;

  // BigInteger prototype method for division (returns only the quotient).
  BigInteger.prototype.divide = function (v) {
    return divModAny(this, v)[0];
  };
  // Aliases for division.
  SmallInteger.prototype.over = SmallInteger.prototype.divide = BigInteger.prototype.over = BigInteger.prototype.divide;

  // BigInteger prototype method for modulo (returns only the remainder).
  BigInteger.prototype.mod = function (v) {
    return divModAny(this, v)[1];
  };
  // Aliases for modulo/remainder.
  SmallInteger.prototype.remainder = SmallInteger.prototype.mod = BigInteger.prototype.remainder = BigInteger.prototype.mod;


  // --- Arithmetic Operations: Power ---

  // BigInteger prototype method for exponentiation (this^v).
  BigInteger.prototype.pow = function (v) {
    var n = parseValue(v), // Exponent.
        a = this.value,    // Base value.
        b = n.value,       // Exponent value.
        value,
        x,
        y;

    if ( b === 0 ) {
      return Integer[1]; // Any number to the power of 0 is 1.
    }
    if ( a === 0 ) {
      return Integer[0]; // 0 to any positive power is 0.
    }
    if ( a === 1 ) {
      return Integer[1]; // 1 to any power is 1.
    }
    if ( a === -1 ) {
      return n .isEven() ? Integer[1] : Integer[-1]; // -1 to even power is 1, odd is -1.
    }
    if ( n.sign ) {
      return Integer[0]; // Negative exponent results in fraction (0 for integers).
    }
    if ( !n.isSmall ) {
      throw new Error("The exponent " + n.toString() + " is too large.");
    }

    // If base is small, check if result fits in SmallInteger.
    if ( this.isSmall ) {
      if ( isPrecise(value = Math .pow(a, b)) ) {
        return new SmallInteger(truncate(value));
      }
    }

    // Binary exponentiation (exponentiation by squaring).
    x = this;      // Current base.
    y = Integer[1]; // Accumulator for result.
    while ( true ) {
      if ( (b & 1) === 1 ) { // If exponent is odd.
        y = y .times(x);
        --b; // Decrement exponent.
      }
      if ( b === 0 ) {
        break; // Exponent is zero, done.
      }
      b /= 2; // Halve exponent.
      x = x .square(); // Square base.
    }
    return y;
  };
  // SmallInteger also uses the same pow.
  SmallInteger.prototype.pow = BigInteger.prototype.pow;

  // BigInteger prototype method for modular exponentiation (this^exp mod mod).
  BigInteger.prototype.modPow = function (exp, mod) {
    exp = parseValue(exp);
    mod = parseValue(mod);

    if ( mod .isZero() ) {
      throw new Error("Cannot take modPow with modulus 0");
    }

    var r = Integer[1],         // Result accumulator, initialized to 1.
        base = this .mod(mod); // Reduce base modulo mod.

    // Standard modular exponentiation algorithm.
    while ( exp .isPositive() ) {
      if ( base .isZero() ) {
        return Integer[0]; // If base is 0, result is 0 (for positive exp).
      }
      if ( exp .isOdd() ) {
        r = r .multiply(base) .mod(mod); // r = (r * base) % mod.
      }
      exp = exp .divide(2); // exp = exp / 2.
      base = base .square() .mod(mod); // base = (base * base) % mod.
    }
    return r;
  };
  // SmallInteger also uses the same modPow.
  SmallInteger.prototype.modPow = BigInteger.prototype.modPow;


  // --- Comparison Operations ---

  // Compares the absolute values of two digit arrays.
  // Returns -1 if a < b, 0 if a == b, 1 if a > b.
  function compareAbs (a, b) {
    if ( a.length !== b.length ) {
      return a.length > b.length ? 1 : -1;
    }
    // Compare digits from most significant to least significant.
    for ( var i = a.length - 1; i >= 0; i-- ) {
      if ( a[i] !== b[i] ) {
        return a[i] > b[i] ? 1 : -1;
      }
    }
    return 0; // Arrays are identical.
  }

  // BigInteger prototype method for comparing absolute values.
  BigInteger.prototype.compareAbs = function (v) {
    var n = parseValue(v),
        a = this.value,
        b = n.value;

    if ( n.isSmall ) {
      return 1; // A BigInteger is always absolutely larger than a SmallInteger (unless Small is 0, handled by compareAbs).
    }
    return compareAbs(a, b);
  };

  // SmallInteger prototype method for comparing absolute values.
  SmallInteger.prototype.compareAbs = function (v) {
    var n = parseValue(v),
        a = Math .abs(this.value),
        b = n.value;

    if ( n.isSmall ) {
      b = Math .abs(b);
      return a === b ? 0 : a > b ? 1 : -1;
    }
    return -1; // A SmallInteger is always absolutely smaller than a BigInteger.
  };

  // BigInteger prototype method for general comparison.
  BigInteger.prototype.compare = function (v) {
    // Handle special cases for Infinity.
    if ( v === Infinity ) {
      return -1;
    }
    if ( v === -Infinity ) {
      return 1;
    }

    var n = parseValue(v),
        a = this.value,
        b = n.value;

    // Compare signs first.
    if ( this.sign !== n.sign ) {
      return n.sign ? 1 : -1; // If `n` is negative, `this` is positive (1). If `n` is positive, `this` is negative (-1).
    }

    // If `n` is a SmallInteger, and `this` is BigInteger.
    if ( n.isSmall ) {
      return this.sign ? -1 : 1; // If negative, this is smaller. If positive, this is larger.
    }

    // Both are BigIntegers with the same sign.
    // Compare absolute values and adjust for sign.
    return compareAbs(a, b) * (this.sign ? -1 : 1);
  };
  // Alias `compareTo` to `compare`.
  BigInteger.prototype.compareTo = BigInteger.prototype.compare;

  // SmallInteger prototype method for general comparison.
  SmallInteger.prototype.compare = function (v) {
    // Handle special cases for Infinity.
    if ( v === Infinity ) {
      return -1;
    }
    if ( v === -Infinity ) {
      return 1;
    }

    var n = parseValue(v),
        a = this.value,
        b = n.value;

    // If `n` is also a SmallInteger.
    if ( n.isSmall ) {
      return a == b ? 0 : a > b ? 1 : -1;
    }

    // `this` is SmallInteger, `n` is BigInteger.
    // Compare signs.
    if ( a < 0 !== n.sign ) {
      return a < 0 ? -1 : 1; // If 'a' is negative, it's smaller. If 'a' is positive, it's larger.
    }
    // Signs are the same. A SmallInteger is always closer to zero than a BigInteger.
    return a < 0 ? 1 : -1; // If both negative, SmallInteger is larger (closer to 0). If both positive, SmallInteger is smaller (closer to 0).
  };
  // Alias `compareTo` to `compare`.
  SmallInteger.prototype.compareTo = SmallInteger.prototype.compare;


  // --- Equality and Inequality Operations ---

  // Checks if two numbers are equal.
  BigInteger.prototype.equals = function (v) {
    return this .compare(v) === 0;
  };
  // Aliases for equality.
  SmallInteger.prototype.eq = SmallInteger.prototype.equals = BigInteger.prototype.eq = BigInteger.prototype.equals;

  // Checks if two numbers are not equal.
  BigInteger.prototype.notEquals = function (v) {
    return this .compare(v) !== 0;
  };
  // Aliases for inequality.
  SmallInteger.prototype.neq = SmallInteger.prototype.notEquals = BigInteger.prototype.neq = BigInteger.prototype.notEquals;


  // --- Relational Operations ---

  // Checks if this number is greater than `v`.
  BigInteger.prototype.greater = function (v) {
    return this .compare(v) > 0;
  };
  // Aliases for greater than.
  SmallInteger.prototype.gt = SmallInteger.prototype.greater = BigInteger.prototype.gt = BigInteger.prototype.greater;

  // Checks if this number is less than `v`.
  BigInteger.prototype.lesser = function (v) {
    return this .compare(v) < 0;
  };
  // Aliases for less than.
  SmallInteger.prototype.lt = SmallInteger.prototype.lesser = BigInteger.prototype.lt = BigInteger.prototype.lesser;

  // Checks if this number is greater than or equal to `v`.
  BigInteger.prototype.greaterOrEquals = function (v) {
    return this .compare(v) >= 0;
  };
  // Aliases for greater than or equal.
  SmallInteger.prototype.geq = SmallInteger.prototype.greaterOrEquals = BigInteger.prototype.geq = BigInteger.prototype.greaterOrEquals;

  // Checks if this number is less than or equal to `v`.
  BigInteger.prototype.lesserOrEquals = function (v) {
    return this .compare(v) <= 0;
  };
  // Aliases for less than or equal.
  SmallInteger.prototype.leq = SmallInteger.prototype.lesserOrEquals = BigInteger.prototype.leq = BigInteger.prototype.lesserOrEquals;


  // --- Property Checks ---

  // Checks if a BigInteger is even.
  BigInteger.prototype.isEven = function () {
    return (this.value[0] & 1) === 0; // Check the least significant digit.
  };
  // Checks if a SmallInteger is even.
  SmallInteger.prototype.isEven = function () {
    return (this.value & 1) === 0;
  };

  // Checks if a BigInteger is odd.
  BigInteger.prototype.isOdd = function () {
    return (this.value[0] & 1) === 1;
  };
  // Checks if a SmallInteger is odd.
  SmallInteger.prototype.isOdd = function () {
    return (this.value & 1) === 1;
  };

  // Checks if a BigInteger is positive.
  BigInteger.prototype.isPositive = function () {
    return !this.sign;
  };
  // Checks if a SmallInteger is positive.
  SmallInteger.prototype.isPositive = function () {
    return this.value > 0;
  };

  // Checks if a BigInteger is negative.
  BigInteger.prototype.isNegative = function () {
    return this.sign;
  };
  // Checks if a SmallInteger is negative.
  SmallInteger.prototype.isNegative = function () {
    return this.value < 0;
  };

  // Checks if a BigInteger is 1 or -1 (always false for BigInteger).
  BigInteger.prototype.isUnit = function () {
    return false;
  };
  // Checks if a SmallInteger is 1 or -1.
  SmallInteger.prototype.isUnit = function () {
    return Math .abs(this.value) === 1;
  };

  // Checks if a BigInteger is zero (always false for BigInteger).
  BigInteger.prototype.isZero = function () {
    return false;
  };
  // Checks if a SmallInteger is zero.
  SmallInteger.prototype.isZero = function () {
    return this.value === 0;
  };

  // Checks if a BigInteger is divisible by `v`.
  BigInteger.prototype.isDivisibleBy = function (v) {
    var n = parseValue(v);
    var value = n.value;

    if ( value === 0 ) {
      return false; // Cannot divide by zero.
    }
    if ( value === 1 ) {
      return true; // Always divisible by 1.
    }
    if ( value === 2 ) {
      return this .isEven(); // Check parity.
    }
    // For other divisors, check if remainder is zero.
    return this .mod(n) .equals(Integer[0]);
  };
  // SmallInteger also uses the same isDivisibleBy.
  SmallInteger.prototype.isDivisibleBy = BigInteger.prototype.isDivisibleBy;


  // --- Primality Tests ---

  // Basic primality test for small numbers.
  function isBasicPrime (v) {
    var n = v .abs();
    if ( n .isUnit() ) {
      return false; // 1 is not prime.
    }
    if ( n .equals(2) || n .equals(3) || n .equals(5) ) {
      return true; // 2, 3, 5 are prime.
    }
    if ( n .isEven() || n .isDivisibleBy(3) || n .isDivisibleBy(5) ) {
      return false; // Divisible by 2, 3, or 5.
    }
    if ( n .lesser(25) ) {
      return true; // Primes less than 25 (7, 11, 13, 17, 19, 23) not caught above.
    }
  }

  // BigInteger prototype method for deterministic primality test (Miller-Rabin for small numbers, then trial division).
  BigInteger.prototype.isPrime = function () {
    var isPrime = isBasicPrime(this);
    if ( isPrime !== undefined ) {
      return isPrime;
    }

    var n = this .abs(),
        nPrev = n .prev(); // n-1.

    // Miller-Rabin primality test with fixed bases for numbers up to ~3.4e14.
    // Bases chosen for strong primality test.
    var a = [2, 3, 5, 7, 11, 13, 17, 19],
        b = nPrev, // n-1 = 2^s * d
        d,
        t,
        i,
        x;

    // Find d such that n-1 = 2^s * d (d is odd).
    while ( b .isEven() ) {
      b = b .divide(2);
    }

    // Perform Miller-Rabin test for each base 'a_i'.
    for ( i = 0; i < a.length; i++ ) {
      x = bigInt(a[i]) .modPow(b, n); // x = a_i^d mod n.

      // If x = 1 or x = n-1, then n is a probable prime for this base.
      if ( x .equals(Integer[1]) || x .equals(nPrev) ) {
        continue;
      }

      // Check for x^(2^r * d) mod n = n-1.
      for ( t = true, d = b; t && d .lesser(nPrev); d = d .multiply(2) ) {
        x = x .square() .mod(n);
        if ( x .equals(nPrev) ) {
          t = false; // Found a strong pseudoprime.
        }
      }
      if ( t ) {
        return false; // Not a prime (composite).
      }
    }
    return true; // Passed all tests, is prime.
  };
  // SmallInteger also uses the same isPrime.
  SmallInteger.prototype.isPrime = BigInteger.prototype.isPrime;

  // BigInteger prototype method for probabilistic primality test (Miller-Rabin).
  BigInteger.prototype.isProbablePrime = function (iterations) {
    var isPrime = isBasicPrime(this);
    if ( isPrime !== undefined ) {
      return isPrime;
    }

    var n = this .abs();
    // Default iterations if not provided.
    var t = iterations === undefined ? 5 : iterations;

    // Perform Miller-Rabin test `t` times with random bases.
    for ( var i = 0; i < t; i++ ) {
      // Choose random 'a' between 2 and n-2.
      var a = bigInt .randBetween(2, n .minus(2));
      // If a^(n-1) mod n is not 1, then n is composite.
      if ( !a .modPow(n .prev(), n) .isUnit() ) {
        return false;
      }
    }
    return true; // Probably prime.
  };
  // SmallInteger also uses the same isProbablePrime.
  SmallInteger.prototype.isProbablePrime = BigInteger.prototype.isProbablePrime;


  // --- Modular Inverse ---

  // BigInteger prototype method for modular multiplicative inverse (this^-1 mod n).
  BigInteger.prototype.modInv = function (n) {
    var t = bigInt .zero,
        newT = bigInt .one,
        r = parseValue(n),
        newR = this .abs(), // Use absolute value for extended Euclidean algorithm.
        q,
        lastT,
        lastR;

    // Extended Euclidean algorithm to find gcd(a, n) and coefficients.
    while ( !newR .equals(bigInt .zero) ) {
      q = r .divide(newR); // Quotient.
      lastT = t;           // Store previous t.
      lastR = r;           // Store previous r.
      t = newT;            // Update t.
      r = newR;            // Update r.
      newT = lastT .subtract(q .multiply(newT)); // newT = lastT - q * newT.
      newR = lastR .subtract(q .multiply(newR)); // newR = lastR - q * newR.
    }

    // If gcd(this, n) is not 1, then modular inverse does not exist.
    if ( !r .equals(1) ) {
      throw new Error(this .toString() + " and " + n .toString() + " are not co-prime");
    }

    // Adjust t to be positive and within [0, n-1].
    if ( t .compare(0) === -1 ) {
      t = t .add(n);
    }

    // If original number was negative, adjust inverse.
    if ( this .isNegative() ) {
      return t .negate();
    }
    return t;
  };
  // SmallInteger also uses the same modInv.
  SmallInteger.prototype.modInv = BigInteger.prototype.modInv;


  // --- Increment/Decrement ---

  // BigInteger prototype method for incrementing.
  BigInteger.prototype.next = function () {
    var value = this.value;
    if ( this.sign ) {
      // If negative, next means subtract 1 from absolute value.
      return subtractSmall(value, 1, this.sign);
    }
    // If positive, add 1.
    return new BigInteger(addSmall(value, 1), this.sign);
  };

  // SmallInteger prototype method for incrementing.
  SmallInteger.prototype.next = function () {
    var value = this.value;
    if ( value + 1 < MAX_INT ) {
      return new SmallInteger(value + 1);
    }
    // If incrementing exceeds MAX_INT, convert to BigInteger.
    return new BigInteger(MAX_INT_ARR, false);
  };

  // BigInteger prototype method for decrementing.
  BigInteger.prototype.prev = function () {
    var value = this.value;
    if ( this.sign ) {
      // If negative, prev means add 1 to absolute value (further from zero).
      return new BigInteger(addSmall(value, 1), true);
    }
    // If positive, subtract 1.
    return subtractSmall(value, 1, this.sign);
  };

  // SmallInteger prototype method for decrementing.
  SmallInteger.prototype.prev = function () {
    var value = this.value;
    if ( value - 1 > -MAX_INT ) {
      return new SmallInteger(value - 1);
    }
    // If decrementing goes below -MAX_INT, convert to BigInteger.
    // This looks like a bug in the original, should be `smallToArray(Math.abs(value-1))` not MAX_INT_ARR.
    // However, as per Type I, I must keep it exactly as is.
    return new BigInteger(MAX_INT_ARR, true);
  };


  // --- Bitwise Operations ---

  // Pre-calculated powers of 2 (up to BASE).
  var powersOfTwo = [1];
  while ( 2 * powersOfTwo[powersOfTwo.length - 1] <= BASE ) {
    powersOfTwo .push(2 * powersOfTwo[powersOfTwo.length - 1]);
  }
  var powers2Length = powersOfTwo.length,      // Number of powers of 2.
      highestPower2 = powersOfTwo[powers2Length - 1]; // Largest power of 2 <= BASE.

  // Helper to check if a shift amount `n` is small enough.
  function shift_isSmall (n) {
    return (typeof n === "number" || typeof n === "string") && +Math .abs(n) <= BASE || n instanceof BigInteger && n.value.length <= 1;
  }

  // BigInteger prototype method for left bit shift.
  BigInteger.prototype.shiftLeft = function (n) {
    if ( !shift_isSmall(n) ) {
      throw new Error(String(n) + " is too large for shifting.");
    }
    n = +n; // Ensure `n` is a number.
    if ( n < 0 ) {
      return this .shiftRight(-n); // Negative shiftLeft is shiftRight.
    }

    var result = this;
    if ( result .isZero() ) {
      return result;
    }

    // Perform shifts in chunks of `powers2Length - 1` (equivalent to multiplying by `highestPower2`).
    while ( n >= powers2Length ) {
      result = result .multiply(highestPower2);
      n -= powers2Length - 1; // Correctly decrement n, as highestPower2 is 2^(powers2Length-1).
    }
    // Perform final shift.
    return result .multiply(powersOfTwo[n]);
  };
  // SmallInteger also uses the same shiftLeft.
  SmallInteger.prototype.shiftLeft = BigInteger.prototype.shiftLeft;

  // BigInteger prototype method for right bit shift.
  BigInteger.prototype.shiftRight = function (n) {
    var remQuo;
    if ( !shift_isSmall(n) ) {
      throw new Error(String(n) + " is too large for shifting.");
    }
    n = +n; // Ensure `n` is a number.
    if ( n < 0 ) {
      return this .shiftLeft(-n); // Negative shiftRight is shiftLeft.
    }

    var result = this;

    // Perform shifts in chunks.
    while ( n >= powers2Length ) {
      if ( result .isZero() || result .isNegative() && result .isUnit() ) {
        return result; // Shift right of 0 or -1 is 0 or -1.
      }
      remQuo = divModAny(result, highestPower2);
      // Adjust quotient for negative numbers (floor division behavior).
      result = remQuo[1] .isNegative() ? remQuo[0] .prev() : remQuo[0];
      n -= powers2Length - 1;
    }

    // Perform final shift.
    remQuo = divModAny(result, powersOfTwo[n]);
    return remQuo[1] .isNegative() ? remQuo[0] .prev() : remQuo[0];
  };
  // SmallInteger also uses the same shiftRight.
  SmallInteger.prototype.shiftRight = BigInteger.prototype.shiftRight;

  // Bitwise operation helper function.
  function bitwise (x, y, fn) {
    y = parseValue(y);

    var xSign = x .isNegative(),
        ySign = y .isNegative();

    // Use two's complement representation for negative numbers.
    var xRem = xSign ? x .not() : x,
        yRem = ySign ? y .not() : y;

    var xDigit = 0,
        yDigit = 0;
    var xDivMod = null,
        yDivMod = null;
    var result = [];

    // Process digits from least significant to most significant.
    while ( !xRem .isZero() || !yRem .isZero() ) {
      xDivMod = divModAny(xRem, highestPower2);
      xDigit = xDivMod[1] .toJSNumber();
      if ( xSign ) {
        xDigit = highestPower2 - 1 - xDigit; // Two's complement for this digit.
      }

      yDivMod = divModAny(yRem, highestPower2);
      yDigit = yDivMod[1] .toJSNumber();
      if ( ySign ) {
        yDigit = highestPower2 - 1 - yDigit; // Two's complement for this digit.
      }

      xRem = xDivMod[0];
      yRem = yDivMod[0];

      result .push(fn(xDigit, yDigit)); // Apply bitwise function.
    }

    // Determine the sign of the result.
    var sum = fn(xSign ? 1 : 0, ySign ? 1 : 0) !== 0 ? bigInt(-1) : bigInt(0);

    // Reconstruct the result from digits.
    for ( var i = result.length - 1; i >= 0; i -= 1 ) {
      sum = sum .multiply(highestPower2) .add(bigInt(result[i]));
    }
    return sum;
  }

  // BigInteger prototype method for bitwise NOT.
  BigInteger.prototype.not = function () {
    return this .negate() .prev(); // ~x = -x - 1.
  };
  // SmallInteger also uses the same not.
  SmallInteger.prototype.not = BigInteger.prototype.not;

  // BigInteger prototype method for bitwise AND.
  BigInteger.prototype.and = function (n) {
    return bitwise(this, n, function (a, b) { return a & b; });
  };
  // SmallInteger also uses the same and.
  SmallInteger.prototype.and = BigInteger.prototype.and;

  // BigInteger prototype method for bitwise OR.
  BigInteger.prototype.or = function (n) {
    return bitwise(this, n, function (a, b) { return a | b; });
  };
  // SmallInteger also uses the same or.
  SmallInteger.prototype.or = BigInteger.prototype.or;

  // BigInteger prototype method for bitwise XOR.
  BigInteger.prototype.xor = function (n) {
    return bitwise(this, n, function (a, b) { return a ^ b; });
  };
  // SmallInteger also uses the same xor.
  SmallInteger.prototype.xor = BigInteger.prototype.xor;


  // --- Bit Length and Logarithms ---

  // Constants for rough LOB (Least-significant One Bit) calculation.
  var LOBMASK_I = 1 << 30, // Mask for JavaScript numbers.
      LOBMASK_BI = (BASE & -BASE) * (BASE & -BASE) | LOBMASK_I; // Mask for BigIntegers.

  // Calculates the position of the least-significant one bit (LOB).
  // This is a rough estimation, mainly for optimization in GCD.
  function roughLOB (n) {
    var v = n.value,
        x = typeof v === "number" ? v | LOBMASK_I : v[0] + v[1] * BASE | LOBMASK_BI;
    return x & -x; // Returns a number with only the LSB set.
  }

  // Calculates integer logarithm (base 2) for bitLength.
  function integerLogarithm (value, base) {
    if ( base .compareTo(value) <= 0 ) {
      var tmp = integerLogarithm(value, base .square(base));
      var p = tmp.p;
      var e = tmp.e;
      var t = p .multiply(base);
      return t .compareTo(value) <= 0 ? {p: t, e: e * 2 + 1} : {p: p, e: e * 2};
    }
    return {p: bigInt(1), e: 0};
  }

  // BigInteger prototype method for calculating bit length.
  BigInteger.prototype.bitLength = function () {
    var n = this;
    // For negative numbers, bit length is for two's complement representation.
    if ( n .compareTo(bigInt(0)) < 0 ) {
      n = n .negate() .subtract(bigInt(1)); // ~n = -n - 1.
    }
    if ( n .compareTo(bigInt(0)) === 0 ) {
      return bigInt(0);
    }
    // Use integer logarithm base 2.
    return bigInt(integerLogarithm(n, bigInt(2)) .e) .add(bigInt(1));
  };
  // SmallInteger also uses the same bitLength.
  SmallInteger.prototype.bitLength = BigInteger.prototype.bitLength;


  // --- Utility Functions (Max, Min, GCD, LCM, Random) ---

  // Returns the maximum of two numbers.
  function max (a, b) {
    a = parseValue(a);
    b = parseValue(b);
    return a .greater(b) ? a : b;
  }

  // Returns the minimum of two numbers.
  function min (a, b) {
    a = parseValue(a);
    b = parseValue(b);
    return a .lesser(b) ? a : b;
  }

  // Calculates the greatest common divisor (GCD) of two numbers using binary GCD algorithm.
  function gcd (a, b) {
    a = parseValue(a) .abs();
    b = parseValue(b) .abs();

    if ( a .equals(b) ) {
      return a;
    }
    if ( a .isZero() ) {
      return b;
    }
    if ( b .isZero() ) {
      return a;
    }

    var c = Integer[1], // Factor of 2s extracted.
        d,
        t;

    // Extract common factors of 2.
    while ( a .isEven() && b .isEven() ) {
      d = Math .min(roughLOB(a), roughLOB(b));
      a = a .divide(d);
      b = b .divide(d);
      c = c .multiply(d);
    }

    // Remove factors of 2 from 'a'.
    while ( a .isEven() ) {
      a = a .divide(roughLOB(a));
    }

    // Main loop of binary GCD.
    do {
      // Remove factors of 2 from 'b'.
      while ( b .isEven() ) {
        b = b .divide(roughLOB(b));
      }
      // Ensure 'a' is the smaller of the two.
      if ( a .greater(b) ) {
        t = b;
        b = a;
        a = t;
      }
      b = b .subtract(a); // b = b - a.
    } while ( !b .isZero() );

    return c .isUnit() ? a : a .multiply(c); // Multiply back the common factors of 2.
  }

  // Calculates the least common multiple (LCM) of two numbers.
  // LCM(a, b) = |a * b| / GCD(a, b).
  function lcm (a, b) {
    a = parseValue(a) .abs();
    b = parseValue(b) .abs();
    return a .divide(gcd(a, b)) .multiply(b);
  }

  // Generates a random BigInt between `a` and `b` (inclusive).
  function randBetween (a, b) {
    a = parseValue(a);
    b = parseValue(b);
    var low = min(a, b),
        high = max(a, b);

    var range = high .subtract(low) .add(1); // Range size.

    // If the range is small enough, use JavaScript's Math.random directly.
    if ( range .isSmall ) {
      return low .add(Math .floor(Math .random() * range));
    }

    // For large ranges, generate digits one by one.
    var length = range.value.length - 1;
    var result = [],
        restricted = true; // Flag to ensure digits stay within range bounds.

    for ( var i = length; i >= 0; i-- ) {
      var top = restricted ? range.value[i] : BASE; // Max digit value at this position.
      var digit = truncate(Math .random() * top);
      result .unshift(digit); // Add digit to the front.
      if ( digit < top ) {
        restricted = false; // Once a digit is less than max, no longer restricted.
      }
    }

    result = arrayToSmall(result); // Try converting to SmallInteger.
    return low .add(typeof result === "number" ? new SmallInteger(result) : new BigInteger(result, false));
  }


  // --- Base Conversion and String Representation ---

  // Parses a string `text` in a given `base` into an Integer object.
  var parseBase = function (text, base) {
    var length = text.length;
    var i;
    var absBase = Math .abs(base);

    // Validate digits for the given base.
    for ( var i = 0; i < length; i++ ) {
      var c = text[i] .toLowerCase();
      if ( c === "-" ) {
        continue;
      }
      if ( /[a-z0-9]/.test(c) ) {
        if ( /[0-9]/.test(c) && +c >= absBase ) {
          if ( c === "1" && absBase === 1 ) {
            continue;
          }
          throw new Error(c + " is not a valid digit in base " + base + ".");
        } else if ( c .charCodeAt(0) - 87 >= absBase ) { // 'a' is 10, 'b' is 11, etc.
          throw new Error(c + " is not a valid digit in base " + base + ".");
        }
      }
    }

    // Optimization for small bases and small numbers (use parseInt).
    if ( 2 <= base && base <= 36 ) {
      if ( length <= LOG_MAX_INT / Math .log(base) ) {
        var result = parseInt(text, base);
        if ( isNaN(result) ) {
          throw new Error(c + " is not a valid digit in base " + base + ".");
        }
        return new SmallInteger(parseInt(text, base));
      }
    }

    base = parseValue(base); // Ensure base is a BigInt.
    var digits = [];
    var isNegative = text[0] === "-";

    // Parse digits from string.
    for ( i = isNegative ? 1 : 0; i < text.length; i++ ) {
      var c = text[i] .toLowerCase(),
          charCode = c .charCodeAt(0);
      if ( 48 <= charCode && charCode <= 57 ) { // '0'-'9'
        digits .push(parseValue(c));
      } else if ( 97 <= charCode && charCode <= 122 ) { // 'a'-'z'
        digits .push(parseValue(c .charCodeAt(0) - 87));
      } else if ( c === "<" ) {
        // Handle custom digit format like "<10>".
        var start = i;
        do {
          i++;
        } while ( text[i] !== ">" );
        digits .push(parseValue(text .slice(start + 1, i)));
      } else {
        throw new Error(c + " is not a valid character");
      }
    }
    return parseBaseFromArray(digits, base, isNegative);
  };

  // Parses an array of digits in a given base into an Integer object.
  function parseBaseFromArray (digits, base, isNegative) {
    var val = Integer[0],
        pow = Integer[1],
        i;

    // Convert from base using Horner's method (sum(digit * base^i)).
    for ( i = digits.length - 1; i >= 0; i-- ) {
      val = val .add(digits[i] .times(pow));
      pow = pow .times(base);
    }
    return isNegative ? val .negate() : val;
  }

  // Converts a single digit (0-35) to its character representation.
  function stringify (digit) {
    if ( digit <= 35 ) {
      return "0123456789abcdefghijklmnopqrstuvwxyz" .charAt(digit);
    }
    return "<" + digit + ">"; // For digits > 35, use custom format.
  }

  // Converts a BigInt `n` to an array of digits in `base`.
  function toBase (n, base) {
    base = bigInt(base);

    if ( base .isZero() ) {
      if ( n .isZero() ) {
        return {value: [0], isNegative: false};
      }
      throw new Error("Cannot convert nonzero numbers to base 0.");
    }

    if ( base .equals(-1) ) {
      if ( n .isZero() ) {
        return {value: [0], isNegative: false};
      }
      if ( n .isNegative() ) {
        // Example: -5 in base -1 -> [1,0,1,0,1,0]
        return {value: [].concat .apply([], Array .apply(null, Array(-n)) .map(Array.prototype.valueOf, [1, 0])), isNegative: false};
      }
      // Example: 5 in base -1 -> [1,0,1,0,1]
      var arr = Array .apply(null, Array(+n - 1)) .map(Array.prototype.valueOf, [0, 1]);
      arr .unshift([1]);
      return {value: [].concat .apply([], arr), isNegative: false};
    }

    var neg = false;
    if ( n .isNegative() && base .isPositive() ) {
      neg = true;
      n = n .abs();
    }

    if ( base .equals(1) ) {
      if ( n .isZero() ) {
        return {value: [0], isNegative: false};
      }
      // Example: 5 in base 1 -> [1,1,1,1,1]
      return {value: Array .apply(null, Array(+n)) .map(Number.prototype.valueOf, 1), isNegative: neg};
    }

    var out = [];
    var left = n,
        divmod;

    // Repeatedly divide by base and collect remainders.
    while ( left .isNegative() || left .compareAbs(base) >= 0 ) {
      divmod = left .divmod(base);
      left = divmod.quotient;
      var digit = divmod.remainder;

      // Adjust for negative remainders (e.g., in negative bases).
      if ( digit .isNegative() ) {
        digit = base .minus(digit) .abs(); // digit = base - abs(digit).
        left = left .next(); // Increment quotient.
      }
      out .push(digit .toJSNumber());
    }
    out .push(left .toJSNumber()); // Push the last quotient.

    return {value: out .reverse(), isNegative: neg}; // Reverse to get correct order.
  }

  // Converts a BigInt `n` to a string in `base`.
  function toBaseString (n, base) {
    var arr = toBase(n, base);
    return (arr.isNegative ? "-" : "") + arr.value .map(stringify) .join("");
  }

  // BigInteger prototype method to convert to an array of digits in a given radix.
  BigInteger.prototype.toArray = function (radix) {
    return toBase(this, radix);
  };
  // SmallInteger also uses the same toArray.
  SmallInteger.prototype.toArray = function (radix) {
    return toBase(this, radix);
  };

  // BigInteger prototype method to convert to a string.
  BigInteger.prototype.toString = function (radix) {
    if ( radix === undefined ) {
      radix = 10;
    }
    if ( radix !== 10 ) {
      return toBaseString(this, radix);
    }

    var v = this.value,
        l = v.length,
        str = String(v[--l]), // Start with the most significant digit.
        zeros = "0000000",     // For padding with leading zeros.
        digit;

    // Concatenate digits, padding with zeros as needed.
    while ( --l >= 0 ) {
      digit = String(v[l]);
      str += zeros .slice(digit.length) + digit;
    }
    var sign = this.sign ? "-" : "";
    return sign + str;
  };

  // SmallInteger prototype method to convert to a string.
  SmallInteger.prototype.toString = function (radix) {
    if ( radix === undefined ) {
      radix = 10;
    }
    if ( radix != 10 ) {
      return toBaseString(this, radix);
    }
    return String(this.value);
  };

  // JSON serialization for BigInt objects.
  BigInteger.prototype.toJSON = SmallInteger.prototype.toJSON = function () {
    return this .toString();
  };

  // Converts a BigInteger to a JavaScript number (may lose precision).
  BigInteger.prototype.valueOf = function () {
    return parseInt(this .toString(), 10);
  };
  // Alias `toJSNumber` to `valueOf`.
  BigInteger.prototype.toJSNumber = BigInteger.prototype.valueOf;

  // Converts a SmallInteger to a JavaScript number.
  SmallInteger.prototype.valueOf = function () {
    return this.value;
  };
  // Alias `toJSNumber` to `valueOf`.
  SmallInteger.prototype.toJSNumber = SmallInteger.prototype.valueOf;


  // --- Parsing Input Values ---

  // Parses a string value into an Integer object.
  function parseStringValue (v) {
    // Handle small precise numbers directly.
    if ( isPrecise(+v) ) {
      var x = +v;
      if ( x === truncate(x) ) {
        return new SmallInteger(x);
      }
      throw new Error("Invalid integer: " + v);
    }

    var sign = v[0] === "-";
    if ( sign ) {
      v = v .slice(1);
    }

    // Handle scientific notation.
    var split = v .split(/e/i);
    if ( split.length > 2 ) {
      throw new Error("Invalid integer: " + split .join("e"));
    }
    if ( split.length === 2 ) {
      var exp = split[1];
      if ( exp[0] === "+" ) {
        exp = exp .slice(1);
      }
      exp = +exp;
      if ( exp !== truncate(exp) || !isPrecise(exp) ) {
        throw new Error("Invalid integer: " + exp + " is not a valid exponent.");
      }
      var text = split[0];
      var decimalPlace = text .indexOf(".");
      if ( decimalPlace >= 0 ) {
        exp -= text.length - decimalPlace - 1;
        text = text .slice(0, decimalPlace) + text .slice(decimalPlace + 1);
      }
      if ( exp < 0 ) {
        throw new Error("Cannot include negative exponent part for integers");
      }
      text += new Array(exp + 1) .join("0"); // Append zeros for exponent.
      v = text;
    }

    // Validate the string format.
    var isValid = /^([0-9][0-9]*)$/ .test(v);
    if ( !isValid ) {
      throw new Error("Invalid integer: " + v);
    }

    var r = [],
        max = v.length,
        l = LOG_BASE, // Number of digits per BASE.
        min = max - l;

    // Split the string into chunks of BASE digits.
    while ( max > 0 ) {
      r .push(+v .slice(min, max));
      min -= l;
      if ( min < 0 ) {
        min = 0;
      }
      max -= l;
    }
    trim(r); // Remove leading zeros.
    return new BigInteger(r, sign);
  }

  // Parses a number value into an Integer object.
  function parseNumberValue (v) {
    if ( isPrecise(v) ) {
      if ( v !== truncate(v) ) {
        throw new Error(v + " is not an integer.");
      }
      return new SmallInteger(v);
    }
    // If not precise, convert to string and parse.
    return parseStringValue(v .toString());
  }

  // Main entry point for parsing any value into an Integer object.
  function parseValue (v) {
    if ( typeof v === "number" ) {
      return parseNumberValue(v);
    }
    if ( typeof v === "string" ) {
      return parseStringValue(v);
    }
    // Assume it's already an Integer object.
    return v;
  }


  // --- Integer Object Initialization and Export ---

  // Pre-populate Integer cache for small numbers (0 to 999).
  for ( var i = 0; i < 1e3; i++ ) {
    Integer[i] = new SmallInteger(i);
    if ( i > 0 ) {
      Integer[-i] = new SmallInteger(-i);
    }
  }

  // Define common constants.
  Integer.one = Integer[1];
  Integer.zero = Integer[0];
  Integer.minusOne = Integer[-1];

  // Attach utility functions to the Integer object.
  Integer.max = max;
  Integer.min = min;
  Integer.gcd = gcd;
  Integer.lcm = lcm;

  // Type checking utility.
  Integer.isInstance = function (x) {
    return x instanceof BigInteger || x instanceof SmallInteger;
  };

  // Random number generation.
  Integer.randBetween = randBetween;

  // Factory method to create an Integer from an array of digits.
  Integer.fromArray = function (digits, base, isNegative) {
    return parseBaseFromArray(digits .map(parseValue), parseValue(base || 10), isNegative);
  };

  // Return the public Integer object (which is `bigInt` externally).
  return Integer;

}) (); // End of the bigInt IIFE.


// Initialize a 'bigInt' instance for general use (representing 0).
var bi = bigInt();

// Define a modulo constant for calculations.
var mod = 1e9 + 7;


// Main function where the core logic of the program resides.
function main () {

  // Read the number of elements 'n' from input.
  var n = o .a();

  // Read an array 'a' of 'n' numbers from input.
  var a = o .l();

  // Initialize 'lcm' (Least Common Multiple) with the first element, converted to bigInt.
  // Note: The original `bi.add(a[0])` is effectively `bigInt(a[0])` because `bi` is `bigInt(0)`.
  // `bigInt(0).add(value)` is equivalent to `bigInt(value)`.
  var lcm = bi .add(a[0]);

  // Calculate the LCM of all elements in array 'a'.
  for ( var i = 1; i < n; i++ ) {
    lcm = bigInt .lcm(lcm, a[i]);
  }

  // Take the modulo of the calculated LCM with the global 'mod' constant.
  lcm = lcm .mod(mod);

  // Initialize 'ans' (answer) to bigInt(0).
  var ans = bi;

  // Iterate through the array 'a' to sum up terms.
  for ( var i = 0; i < n; i++ ) {
    // Calculate `lcm * (a[i]^-1 mod mod)` and add to `ans`.
    // `bi.add(a[i])` again acts as `bigInt(a[i])`.
    ans = ans .add(lcm .times(bi .add(a[i]) .modInv(mod)));
  }

  // Return the final answer, converted to a JavaScript number, after taking modulo 'mod'.
  // The `+` operator forces conversion to number.
  return +ans .mod(mod);
}

// Call the main function and, if it returns a value, print it to the console.
var myOut = main();
if ( myOut !== undefined ) {
  console .log(myOut);
}