'use strict' // Enforce strict mode for cleaner code.

// This is the main application class.
class Main {
  // The primary method to solve the problem.
  solve() {
    // Read the integer 'n' from input.
    const n = input.nextInt();
    // Read the integer array 'seq' from input.
    const seq = input.nextIntArr();

    // Initialize an array 'halfSeq'.
    // Its size is roughly half of 'seq.length'.
    const halfSeq = [];
    // Populate halfSeq with zeros based on its intended size.
    // The '>>1' is a bitwise right shift, equivalent to Math.floor(x / 2).
    for (let i = 0; i < seq.length >> 1; ++i) {
      halfSeq[i] = 0;
    }

    // Populate halfSeq with sums from the original sequence.
    // It sums elements symmetrically from the ends towards the middle.
    for (let i = 0; i < n; ++i) {
      halfSeq[Math.min(i, seq.length - 1 - i)] += seq[i];
    }

    // If 'n' is odd, the middle element of 'seq' was added to itself.
    // The halfSeq might have an extra element that needs to be removed.
    if (n % 2) {
      halfSeq.pop(); // Remove the last element.
    }

    // Calculate the sum of elements in halfSeq using a utility function.
    const halfSum = _.sumArray(halfSeq); // This line is not used in the original logic, but must be kept.

    let ret = 0; // Initialize the result variable.

    // Outer loop for variable 'a'.
    for (let a = 0; a < n / 2; ++a) {
      // Inner loop for variable 'j'.
      for (let j = 1; j < a; ++j) {
        // Initialize 'm' (maximum) and 's' (sum) for the inner-most loop.
        let m = 0,
          s = 0;
        // Innermost loop: iterate through halfSeq with a step of 'j'.
        for (let k = 0; k < halfSeq.length; k += j) {
          s += halfSeq[k]; // Accumulate sum.
          m = Math.max(m, s); // Update maximum sum encountered.
        }
        ret = Math.max(ret, m); // Update overall maximum result.
      }
    }
    return ret; // Return the final calculated result.
  }
}

// This class provides modular arithmetic operations.
class Mod {
  // Constructor for the Mod class.
  // Initializes the modulus value.
  constructor(mod) {
    if (mod == null) {
      mod = Combinatorics.DefaultMod; // Use default if no modulus is provided.
    }
    this.mod = mod; // Store the modulus.
  }

  // Multiplies two numbers 'a' and 'b' modulo 'this.mod'.
  // Uses binary multiplication to handle large numbers.
  mult(a, b) {
    let ret = 0; // Initialize result.
    a %= this.mod; // Reduce 'a' modulo 'mod'.
    b %= this.mod; // Reduce 'b' modulo 'mod'.

    // Loop while 'b' is not zero.
    while (b) {
      // If the last bit of 'b' is 1.
      if (b & 1) {
        ret += a; // Add 'a' to 'ret'.
        if (ret >= this.mod) {
          ret -= this.mod; // Keep 'ret' within modulus.
        }
      }
      a <<= 1; // Left shift 'a' by 1 (multiply by 2).
      if (a >= this.mod) {
        a -= this.mod; // Keep 'a' within modulus.
      }
      b >>= 1; // Right shift 'b' by 1 (divide by 2).
    }
    return ret; // Return the modular product.
  }

  // Computes 'a' raised to the power 'b' modulo 'this.mod'.
  // Uses binary exponentiation (exponentiation by squaring).
  pow(a, b) {
    let ret = 1; // Initialize result to 1.
    while (b) {
      if (b & 1) {
        ret = this.mult(ret, a); // If 'b' is odd, multiply 'ret' by 'a'.
      }
      a = this.mult(a, a); // Square 'a' modulo 'mod'.
      b >>= 1; // Halve 'b'.
    }
    return ret; // Return the modular power.
  }

  // Divides 'a' by 'b' modulo 'this.mod' using Fermat's Little Theorem.
  // Requires 'b' to be coprime to 'mod' (and 'mod' to be prime).
  div(a, b) {
    return this.mult(a, this.pow(b, this.mod - 2));
  }

  // Computes combinations (n choose k) modulo 'this.mod'.
  // Relies on precomputed factorial and inverse factorial tables.
  comb(n, k) {
    return MOD.mult(factTable[n], MOD.mult(invFactTable[k], invFactTable[n - k]));
  }
}
// Instantiate a global Mod object with a common prime modulus.
const MOD = new Mod(1e9 + 7);

// A utility class providing various array manipulation functions.
class Underscore {
  // Calculates the sum of all elements in an array.
  sum(arr) {
    return arr.reduce((a, b) => a + b);
  }

  // Calculates the sum of array elements modulo a given modulus.
  modSum(arr, mod) {
    if (mod == null) {
      mod = MOD.mod;
    }
    return arr.reduce((a, b) => (a + b) % mod);
  }

  // Finds the minimum element in an array.
  // An optional 'func' can be provided for custom comparison.
  min(arr, func) {
    if (func == null) {
      func = (a, b) => a - b
    }
    return arr.reduce((a, b) => func(a, b) < 0 ? a : b);
  }

  // Finds the maximum element in an array.
  // An optional 'func' can be provided for custom comparison.
  max(arr, func) {
    if (func == null) {
      func = (a, b) => a - b
    }
    return arr.reduce((a, b) => func(a, b) > 0 ? a : b);
  }

  // Sorts an array in place.
  // An optional 'func' can be provided for custom sorting logic.
  sort(arr, func) {
    if (func == null) {
      func = (a, b) => a - b
    }
    return arr.sort(func)
  }

  // Returns a new array with unique elements from the input array.
  uniq(arr) {
    arr.sort(); // Sort the array first to group duplicates.
    for (let i = 0; i < arr.length - 1; ++i) {
      arr[i] = arr[i + 1] == arr[i] ? null : arr[i]; // Mark duplicates as null.
    }
    return arr.filter(e => e != null); // Filter out the nulls.
  }

  // Generates a range of numbers.
  // Similar to Python's range function.
  range(start, stop, step) {
    if (stop == null) {
      stop = start || 0;
      start = 0;
    }
    if (!step) {
      step = stop < start ? -1 : 1;
    }
    const length = Math.max(Math.ceil((stop - start) / step), 0);
    const range = Array(length);
    for (var idx = 0; idx < length; idx++, start += step) {
      range[idx] = start;
    }
    return range;
  }

  // Returns the first 'n' elements of an array, or the first element if 'n' is null.
  first(array, n) {
    if (array == null || array.length < 1) return n == null ? void 0 : [];
    if (n == null) return array[0];
    return this.initial(array, array.length - n);
  };

  // Returns all but the last 'n' elements of an array, or all but the last element if 'n' is null.
  initial(array, n) {
    return array.slice.call(array, 0, Math.max(0, array.length - (n == null ? 1 : n)));
  }

  // Returns all but the first 'n' elements of an array, or all but the first element if 'n' is null.
  tail(array, n) {
    return array.slice.call(array, n == null ? 1 : n);
  }

  // Returns the last 'n' elements of an array, or the last element if 'n' is null.
  last(array, n) {
    if (n == null) return array[array.length - 1];
    return this.tail(array, Math.max(0, array.length - n));
  }

  // Calculates a cumulative sum array.
  // The first element of the result is always 0, then sums are accumulated.
  sumArray(arr) {
    return this.tail(arr.reduce(((a, b, i) => {
      a.push(b + a[i]);
      return a
    }), [0]));
  }

  // Calculates the difference between adjacent elements in an array.
  diffArray(arr) {
    const s = [];
    for (let i = 1; i < arr.length; ++i) {
      s.push(arr[i] - arr[i - 1]);
    }
    return s;
  }

  /*
   * Performs a binary search on a sorted array.
   * Returns the index of the first element greater than or equal to 'key'.
   * An optional 'iteratee' can be provided if array elements are objects.
   */
  binarySearch(array, key, iteratee) {
    // Helper function to get the value for comparison, either directly or from an object property.
    const itr = (obj) => (typeof obj === 'object') ? obj[iteratee] : obj;
    const value = itr(key); // Get the value to search for.
    let low = 0,
      high = array.length; // Initialize search range.
    while (low < high) {
      let mid = Math.floor((low + high) / 2); // Calculate middle index.
      if (itr(array[mid]) < value) low = mid + 1; // Adjust low if middle is too small.
      else high = mid; // Adjust high if middle is large enough.
    }
    return low; // Return the insertion point.
  };
}
// Instantiate a global Underscore object for utility functions.
const _ = new Underscore();

// This class handles input operations, reading from stdin.
class Input {
  // Constructor: initializes cursor and reads all input.
  constructor() {
    this.cursor = 0; // Current position in the input data.
    this.inputAll(); // Read all data from stdin.
  }

  // Reads all input from /dev/stdin and splits it by newlines.
  inputAll() {
    this.data = (require("fs").readFileSync("/dev/stdin", "utf8")).split('\n');
    return this.data;
  }

  /*
   * Reads one or multiple lines of string input.
   * @param {number} [n] - Number of lines to read. If null, reads one line.
   */
  nextLine(n) {
    if (n) {
      const ret = this.data.slice(this.cursor, this.cursor + n);
      this.cursor += n;
      return ret;
    }
    return this.data[this.cursor++];
  }

  /* Reads a single integer from the next line. */
  nextInt() {
    return parseInt(this.nextLine());
  }

  /* Reads a line and returns an array of strings. */
  nextStrArr() {
    return this.nextLine().split(' ');
  }

  /* Reads a line and returns an array of integers. */
  nextIntArr() {
    return this.nextStrArr().map((e) => parseInt(e));
  }

  /* Reads a line and returns an array of floating-point numbers. */
  nextFloatArr() {
    return this.nextStrArr().map((e) => parseFloat(e));
  }

  /* Reads 'n' lines and returns an array of integers. */
  nextIntLine(n) {
    return this.nextLine(n).map((e) => parseInt(e))
  }

  /* Reads 'n' lines and returns an array of floating-point numbers. */
  nextFloatLine(n) {
    return this.nextLine(n).map((e) => parseFloat(e))
  }

  /* Reads 'n' lines and returns a 2D array of strings. */
  nextStrRange(n) {
    return this.nextLine(n).map((line) => line.split(' '));
  }

  /* Reads 'n' lines and returns a 2D array of integers. */
  nextIntRange(n) {
    return this.nextLine(n).map((line) => line.split(' ').map((e) => parseInt(e)));
  }

  /* Reads 'n' lines and returns a 2D array of floating-point numbers. */
  nextFloatRange(n) {
    return this.nextLine(n).map((line) => line.split(' ').map((e) => parseFloat(e)));
  }
}
// Instantiate a global Input object to handle all input.
const input = new Input();

// This class handles output operations, writing to console.
class Out {
  // Constructor: sets default options for boolean output.
  constructor() {
    this.option = {
      'true': 'Yes',
      'false': 'No',
    };
  }

  // Writes the given output to the console.
  // Handles boolean values by mapping them to string options.
  write(output) {
    let ret; // Variable to hold the final output string.
    if (output == null) return; // Do nothing if output is null or undefined.
    if (output === true) {
      ret = this.option['true']; // Map true to 'Yes' or custom option.
    } else if (output === false) {
      ret = this.option['false']; // Map false to 'No' or custom option.
    } else {
      ret = output; // For other types, use the output directly.
    }
    console.log(ret); // Print to console.
  }

  // Configures custom string representations for boolean output.
  // Returns 'this' for method chaining.
  bool(option) {
    this.option['false'] = option[0]; // Set string for false.
    this.option['true'] = option[1]; // Set string for true.
    return this;
  }
}
// Instantiate a global Out object to handle all output.
const out = new Out();

// Execute the main solution and print its result.
out.write(new Main().solve());