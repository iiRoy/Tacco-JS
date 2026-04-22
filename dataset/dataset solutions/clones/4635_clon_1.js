'use strict'
/* 
 * This file contains the primary logic for solving the problem.
 * It's structured into several classes for modularity and reusability.
 */


class Main { // Main application logic entry point
  solve() { // The core method to execute the problem solution
    const nlt = input.nextIntArr(); // Read N, L, T from input
    // Destructure the array into individual constants for clarity
    const N = nlt[0];
    const L = nlt[1];
    const T = nlt[2];

    const xwList = input.nextIntRange(N) // Read N pairs of (x, w)
      .map(e => {
        /* Transform the input array.
         * x: initial position
         * w: direction (1 for right, -1 for left)
         */
        return {
          x: e[0],
          w: e[1] == 1 ? 1 : -1
        };
      });

    // Calculate the final position of each ant if they could pass through each other.
    // The modulo L ensures they stay within the circular track.
    const lastPos = xwList.map(xw => (xw.x + xw.w * (T % L) + L) % L);

    /*
     * Calculate the number of times the first ant (ant 0) effectively crosses
     * other ants if they were ghosts (passing through each other).
     * This determines the rotational shift needed for the final sorted positions.
     */
    let sum = 0; // Initialize a counter for 'crossings'
    const xw0 = xwList[0]; // Reference to the first ant's initial state

    for (let i = 1; i < N; ++i) { // Iterate through other ants
      const xw = xwList[i]; // Current ant being considered

      // If ants are moving in the same direction, they never "collide" or cross
      if (xw.w == xw0.w) {
        continue;
      }

      // Calculate the initial distance between ant 0 and ant i on the circular track
      // This accounts for the circular nature (L).
      const d = (xw0.w * (xw.x - xw0.x) + L) % L;

      // When ants move towards each other, their relative speed is 2.
      // We need to find how many full laps (L) they effectively cross each other.
      // The formula derived from 2 * T <= (x - 1) * L + d
      // <=> (2 * T - d) / L <= x
      const x = 1 + ((2 * T - d) / L | 0); // Use bitwise OR 0 for floor division

      sum += x; // Accumulate the number of crossings
      sum %= N; // Keep sum within [0, N-1] range
    }

    // `idx` represents the final index of the first ant after all 'ghost' collisions,
    // relative to its initial position within the sorted list of final positions.
    const idx = (xw0.w * sum + N) % N;

    const pos = lastPos[0]; // The final position of the first ant (ant 0)

    // Sort the ghost final positions to determine the order.
    // This is crucial for matching actual ant identities to final positions.
    _.sort(lastPos);

    /*
     * Determine the rotation offset.
     * If ant 0 moves right (w=1), its final position `pos` will be the element
     * at `_.binarySearch(lastPos, pos + 1) - 1` in the sorted `lastPos` array.
     * If ant 0 moves left (w=-1), its final position `pos` will be the element
     * at `_.binarySearch(lastPos, pos)` in the sorted `lastPos` array.
     */
    let rotate = (xw0.w == 1 ?
      _.binarySearch(lastPos, pos + 1) - 1 :
      _.binarySearch(lastPos, pos));

    // // Debugging output, commented out for final submission
    // console.log(lastPos);
    // console.log(`${idx} ${rotate} ${pos}`);

    // Apply the rotation to the sorted `lastPos` array.
    // The rotation amount is `rotate - idx`.
    const lastAnts = _.rotate(lastPos, rotate - idx);

    return lastAnts.join('\n'); // Return the final ant positions, each on a new line
  } // End of solve method
} // End of Main class


/*
 * Modulo arithmetic class for operations within a specific modulus.
 * Useful for problems involving large numbers where results need to be
 * kept within a certain range (e.g., 10^9 + 7).
 */
class Mod {

  // Constructor: initializes the modulus value.
  constructor(mod) {
    if (mod == null) {
      mod = Combinatorics.DefaultMod; // Fallback to a default mod if not provided
    }
    this.mod = mod;
  }

  // Multiplies two numbers (a * b) modulo this.mod.
  // Uses binary multiplication to handle potentially large numbers without overflow.
  mult(a, b) {
    let ret = 0; // Result accumulator
    a %= this.mod; // Reduce a modulo mod
    b %= this.mod; // Reduce b modulo mod

    while (b) { // Loop while b is not zero
      if (b & 1) { // If the last bit of b is 1 (b is odd)
        ret += a; // Add a to result
        if (ret >= this.mod) { // Keep ret within [0, mod-1]
          ret -= this.mod;
        }
      }
      a <<= 1; // Double a (a = a * 2)
      if (a >= this.mod) { // Keep a within [0, mod-1]
        a -= this.mod;
      }
      b >>= 1; // Halve b (b = b / 2)
    }
    return ret; // Return the final product modulo mod
  }

  // Calculates (a^b) modulo this.mod using exponentiation by squaring.
  pow(a, b) {
    let ret = 1; // Result accumulator, starts at 1 (a^0)
    a %= this.mod; // Reduce base a modulo mod

    while (b) { // Loop while exponent b is not zero
      if (b & 1) { // If b is odd
        ret = this.mult(ret, a); // Multiply result by current a
      }
      a = this.mult(a, a); // Square a (a = a^2)
      b >>= 1; // Halve exponent b
    }
    return ret; // Return the final power modulo mod
  }
}
const MOD = new Mod(1e9 + 7); // Instantiate a global Mod object with 10^9 + 7


/*
 * A utility class providing common array and collection manipulation functions,
 * inspired by libraries like Lodash or Underscore.js.
 */
class Underscore {
  // Calculates the sum of all elements in an array.
  sum(arr) {
    return arr.reduce((a, b) => a + b);
  }

  // Calculates the sum of all elements in an array modulo `mod`.
  modSum(arr, mod) {
    if (mod == null) {
      mod = MOD.mod; // Use global MOD if not specified
    }
    return arr.reduce((a, b) => (a + b) % mod);
  }

  // Finds the minimum element in an array.
  // Optional `func` can specify a custom comparison.
  min(arr, func) {
    if (func == null) {
      func = (a, b) => a - b
    } // Default numeric comparison
    return arr.reduce((a, b) => func(a, b) < 0 ? a : b);
  }

  // Finds the maximum element in an array.
  // Optional `func` can specify a custom comparison.
  max(arr, func) {
    if (func == null) {
      func = (a, b) => a - b
    } // Default numeric comparison
    return arr.reduce((a, b) => func(a, b) > 0 ? a : b);
  }

  // Sorts an array in-place.
  // Optional `func` can specify a custom comparison.
  sort(arr, func) {
    if (func == null) {
      func = (a, b) => a - b
    } // Default numeric comparison
    return arr.sort(func);
  }

  // Generates an array of numbers in a specified range.
  // Similar to Python's range().
  range(start, stop, step) {
    if (stop == null) {
      stop = start || 0;
      start = 0;
    } // Handle `range(stop)` case
    if (!step) {
      step = stop < start ? -1 : 1;
    } // Default step is 1 or -1

    const length = Math.max(Math.ceil((stop - start) / step), 0); // Calculate array length
    const range = Array(length); // Pre-allocate array

    for (var idx = 0; idx < length; idx++, start += step) {
      range[idx] = start;
    } // Populate array
    return range;
  }

  // Retrieves the first element(s) of an array.
  // If `n` is specified, returns the first `n` elements.
  first(array, n) {
    if (array == null || array.length < 1) {
      return n == null ? void 0 : [];
    }
    if (n == null) {
      return array[0];
    }
    return this.initial(array, array.length - n);
  }

  // Retrieves all but the last element(s) of an array.
  // If `n` is specified, returns all but the last `n` elements.
  initial(array, n) {
    return array.slice.call(array, 0, Math.max(0, array.length - (n == null ? 1 : n)));
  }

  // Retrieves all but the first element(s) of an array.
  // If `n` is specified, returns all but the first `n` elements.
  tail(array, n) {
    return array.slice.call(array, n == null ? 1 : n);
  }

  // Retrieves the last element(s) of an array.
  // If `n` is specified, returns the last `n` elements.
  last(array, n) {
    if (n == null) {
      return array[array.length - 1];
    }
    return this.tail(array, Math.max(0, array.length - n));
  }

  // Computes the prefix sums (cumulative sums) of an array.
  sumArray(arr) {
    // Starts with [0] to correctly handle the first sum.
    return this.tail(arr.reduce(((a, b, i) => {
      a.push(b + a[i]);
      return a
    }), [0]));
  }

  // Computes the differences between adjacent elements in an array.
  diffArray(arr) {
    const s = []; // Array to store differences
    for (let i = 1; i < arr.length; ++i) { // Iterate from the second element
      s.push(arr[i] - arr[i - 1]); // Add difference to result
    }
    return s;
  }

  /*
   * Performs a binary search on a sorted array.
   * Returns the index of the first element that is greater than or equal to `key`.
   * `iteratee` can be a property name if array elements are objects.
   */
  binarySearch(array, key, iteratee) {
    const itr = (obj) => (typeof obj === 'object') ? obj[iteratee] : obj; // Helper for iteratee
    const value = itr(key); // Get the value to search for

    let low = 0,
      high = array.length; // Search range [low, high)

    while (low < high) {
      let mid = Math.floor((low + high) / 2); // Calculate middle index
      if (itr(array[mid]) < value) { // If middle element is too small, search right half
        low = mid + 1;
      } else { // Otherwise, search left half (or mid is the answer)
        high = mid;
      }
    }
    return low; // `low` is the insertion point or the index of the first matching element
  }

  // Rotates an array by `n` positions.
  // Positive `n` rotates right, negative `n` rotates left.
  rotate(arr, n) {
    n %= arr.length; // Normalize n to be within [0, arr.length-1]
    if (n < 0) {
      n += arr.length;
    } // Handle negative rotations by converting to positive
    // Slice and concatenate to perform the rotation
    return arr.slice(n).concat(arr.slice(0, n));
  }
}
const _ = new Underscore(); // Instantiate a global Underscore object


/*
 * A class for handling input from stdin in competitive programming contexts.
 * Provides methods to read various data types (integers, strings, arrays, etc.).
 */
class Input {
  constructor() {
    this.cursor = 0; // Current line number being read
    this.inputAll(); // Read all input upon instantiation
  }

  // Reads all data from standard input.
  inputAll() {
    this.data = (require("fs").readFileSync("/dev/stdin", "utf8")).split('\n');
    return this.data;
  }

  /*
   * Reads one or multiple lines of input.
   * If `n` is provided, returns an array of `n` lines.
   * Otherwise, returns a single line.
   */
  nextLine(n) {
    if (n) {
      const ret = this.data.slice(this.cursor, this.cursor + n); // Get n lines
      this.cursor += n; // Advance cursor
      return ret;
    }
    return this.data[this.cursor++]; // Get one line and advance cursor
  }

  /* Reads a single integer from the next line. */
  nextInt() {
    return parseInt(this.nextLine());
  }

  /* Reads a line and splits it into an array of strings. */
  nextStrArr() {
    return this.nextLine().split(' ');
  }

  /* Reads a line, splits it, and converts elements to integers. */
  nextIntArr() {
    return this.nextStrArr().map((e) => parseInt(e));
  }

  /* Reads a line, splits it, and converts elements to floats. */
  nextFloatArr() {
    return this.nextStrArr().map((e) => parseFloat(e));
  }

  /* Reads `n` lines and converts each to an integer. */
  nextIntLine(n) {
    return this.nextLine(n).map((e) => parseInt(e));
  }

  /* Reads `n` lines and converts each to a float. */
  nextFloatLine(n) {
    return this.nextLine(n).map((e) => parseFloat(e));
  }

  /* Reads `n` lines, each split into an array of strings (2D array). */
  nextStrRange(n) {
    return this.nextLine(n).map((line) => line.split(' '));
  }

  /* Reads `n` lines, each split and converted to an array of integers (2D array). */
  nextIntRange(n) {
    return this.nextLine(n).map((line) => line.split(' ').map((e) => parseInt(e)));
  }

  /* Reads `n` lines, each split and converted to an array of floats (2D array). */
  nextFloatRange(n) {
    return this.nextLine(n).map((line) => line.split(' ').map((e) => parseFloat(e)));
  }
}
const input = new Input(); // Instantiate a global Input object to handle I/O


/*
 * Utility function to print output to the console.
 * Handles boolean conversion to 'Yes'/'No' and other types directly.
 */
const Out = (output) => {
  let ret; // Variable to hold the final output string

  if (output == null) {
    return;
  } // Do nothing if output is null or undefined

  if (output === true) {
    ret = 'Yes';
  } // Convert true to 'Yes'
  else if (output === false) {
    ret = 'No';
  } // Convert false to 'No'
  else {
    ret = output;
  } // For other types, use as is

  console.log(ret); // Print the result to standard output
}

// Execute the main solution and print its result.
Out(new Main().solve());