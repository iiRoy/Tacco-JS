'use strict'; // Enforce strict mode for better code quality and error handling

// This is the main class that contains the core logic for solving the problem.
class Main // Entry point for the application logic.
{
  /**
   * Solves the primary problem statement.
   * @returns {number} The calculated result.
   */
  solve()
  {
    // Read the integer 'n' from the input.
    const n = input.nextInt();

    /*
     * Read the next line, convert it to an array of characters,
     * and then map each character to a number (1 for '#', 0 otherwise).
     */
    const list = Array.from(input.nextLine()).map(e => e === '#' ? 1 : 0);

    // Initialize a flag to skip leading zeros (or non-'#')
    let skip = true;

    // Create an empty list to store processed elements.
    const l1 = [];

    // Iterate through the input list from the beginning.
    for (let i = 0; i < n; ++i) {
      // If a '1' (representing '#') is encountered, stop skipping.
      if (list[i] == 1)
      {
        skip = false;
      }
      // If still skipping, move to the next iteration.
      if (skip)
      {
        continue;
      }
      // Add the current element to l1 if not skipping.
      l1.push(list[i]);
    } // End of first loop.


    // Determine the initial size of the relevant part of l1.
    let size = l1.length;

    // Iterate backwards from the end of l1 to find trailing zeros.
    for (let i = l1.length - 1; i >= 0; --i)
    {
      // If a '0' is found, it marks the end of the significant part.
      if (l1[i] == 0)
      {
        break; // Exit the loop as the first trailing zero is found.
      }
      // Update size to the current index if it's a '1'.
      size = i;
    } // End of second loop.

    // Extract the significant portion of l1 using slice.
    const l2 = l1.slice(0, size);

    // Calculate the minimum of the counts of '1's and '0's in l2.
    return Math.min(
      l2.filter(e => e == 1).length, // Count of '1's in l2.
      l2.filter(e => e == 0).length  // Count of '0's in l2.
    );
  } // End of solve method.
} // End of Main class.

// This class provides modular arithmetic operations.
class Mod {
  /**
   * Constructor for the Mod class.
   * @param {number} mod The modulus value.
   */
  constructor(mod) {
    // If mod is not provided, use a default value (presumably from Combinatorics.DefaultMod).
    if (mod == null)
    {
      mod = Combinatorics.DefaultMod;
    }
    this.mod = mod;
  } // End of constructor.

  /**
   * Performs modular multiplication (a * b) % mod.
   * Uses binary multiplication to prevent overflow with large numbers.
   * @param {number} a The first operand.
   * @param {number} b The second operand.
   * @returns {number} The result of (a * b) % mod.
   */
  mult(a, b)
  {
    let ret = 0;
    a %= this.mod; // Reduce a modulo this.mod.
    b %= this.mod; // Reduce b modulo this.mod.

    // Binary multiplication loop.
    while (b) {
      if (b & 1) // If the least significant bit of b is 1.
      {
        ret += a; // Add a to the result.
        if (ret > this.mod) {
          ret -= this.mod; // Keep result within modulus.
        }
      }
      a <<= 1; // Double a.
      if (a > this.mod) {
        a -= this.mod; // Keep a within modulus.
      }
      b >>= 1; // Halve b.
    } // End of while loop.
    return ret;
  } // End of mult method.

  /**
   * Performs modular exponentiation (a^b) % mod.
   * Uses binary exponentiation (exponentiation by squaring).
   * @param {number} a The base.
   * @param {number} b The exponent.
   * @returns {number} The result of (a^b) % mod.
   */
  pow(a, b)
  {
    let ret = 1; // Initialize result to 1.
    while (b) {
      if (b & 1)
      {
        ret = this.mult(ret, a); // If b is odd, multiply result by a.
      }
      a = this.mult(a, a); // Square a.
      b >>= 1; // Halve b.
    } // End of while loop.
    return ret;
  } // End of pow method.

  /**
   * Performs modular division (a / b) % mod using Fermat's Little Theorem.
   * Requires the modulus to be a prime number.
   * @param {number} a The numerator.
   * @param {number} b The denominator.
   * @returns {number} The result of (a * b^(mod-2)) % mod.
   */
  div(a, b)
  {
    return this.mult(a, this.pow(b, this.mod - 2));
  } // End of div method.

  /**
   * Calculates modular combinations (nCk) % mod.
   * Assumes 'factTable' and 'invFactTable' are precomputed global arrays.
   * @param {number} n The total number of items.
   * @param {number} k The number of items to choose.
   * @returns {number} The result of (nCk) % mod.
   */
  comb(n, k)
  {
    return MOD.mult(factTable[n], MOD.mult(invFactTable[k], invFactTable[n - k]));
  } // End of comb method.
} // End of Mod class.

// Instantiate a Mod object with a specific prime modulus.
const MOD = new Mod(998244353); // Common prime modulus for competitive programming.

// This class provides utility functions similar to Underscore.js or Lodash.
class Underscore {
  /**
   * Calculates the sum of all elements in an array.
   * @param {Array<number>} arr The input array.
   * @returns {number} The sum of array elements.
   */
  sum(arr) {
    return arr.reduce((a, b) => a + b);
  } // End of sum method.

  /**
   * Calculates the modular sum of all elements in an array.
   * @param {Array<number>} arr The input array.
   * @param {number} [mod] The modulus to use; defaults to MOD.mod if not provided.
   * @returns {number} The modular sum of array elements.
   */
  modSum(arr, mod) {
    if (mod == null)
    {
      mod = MOD.mod; // Use global MOD if not specified.
    }
    return arr.reduce((a, b) => (a + b) % mod);
  } // End of modSum method.

  /**
   * Finds the minimum element in an array based on an optional comparator function.
   * @param {Array<any>} arr The input array.
   * @param {Function} [func] The comparator function (a, b) => a - b for numbers.
   * @returns {any} The minimum element.
   */
  min(arr, func) {
    if (func == null)
    {
      func = (a, b) => a - b; // Default to numeric comparison.
    }
    return arr.reduce((a, b) => func(a, b) < 0 ? a : b);
  } // End of min method.

  /**
   * Finds the maximum element in an array based on an optional comparator function.
   * @param {Array<any>} arr The input array.
   * @param {Function} [func] The comparator function (a, b) => a - b for numbers.
   * @returns {any} The maximum element.
   */
  max(arr, func) {
    if (func == null)
    {
      func = (a, b) => a - b; // Default to numeric comparison.
    }
    return arr.reduce((a, b) => func(a, b) > 0 ? a : b);
  } // End of max method.

  /**
   * Sorts an array in place using an optional comparator function.
   * @param {Array<any>} arr The input array.
   * @param {Function} [func] The comparator function (a, b) => a - b for numbers.
   * @returns {Array<any>} The sorted array.
   */
  sort(arr, func) {
    if (func == null)
    {
      func = (a, b) => a - b; // Default to numeric comparison.
    }
    return arr.sort(func);
  } // End of sort method.

  /**
   * Returns a duplicate-free version of the array. Modifies the original array by sorting it.
   * @param {Array<any>} arr The input array.
   * @returns {Array<any>} The array with unique elements.
   */
  uniq(arr)
  {
    arr.sort(); // Sort the array to group duplicates.
    for (let i = 0; i < arr.length - 1; ++i)
    {
      // Mark duplicates as null.
      arr[i] = arr[i + 1] == arr[i] ? null : arr[i];
    }
    return arr.filter(e => e != null); // Filter out nulls.
  } // End of uniq method.

  /**
   * Creates an array of numbers (a progression) from start up to (but not including) stop, with a step.
   * @param {number} start The start of the range.
   * @param {number} [stop] The end of the range (exclusive).
   * @param {number} [step] The step value.
   * @returns {Array<number>} The generated range array.
   */
  range(start, stop, step) {
    if (stop == null)
    {
      stop = start || 0;
      start = 0;
    }
    if (!step)
    {
      step = stop < start ? -1 : 1;
    }
    const length = Math.max(Math.ceil((stop - start) / step), 0);
    const range = Array(length);
    for (var idx = 0; idx < length; idx++, start += step)
    {
      range[idx] = start;
    }
    return range;
  } // End of range method.

  /**
   * Gets the first element(s) of an array.
   * @param {Array<any>} array The input array.
   * @param {number} [n] The number of elements to retrieve from the beginning.
   * @returns {any|Array<any>} The first element or an array of the first n elements.
   */
  first(array, n)
  {
    if (array == null || array.length < 1) return n == null ? void 0 : [];
    if (n == null) return array[0];
    return this.initial(array, array.length - n);
  } // End of first method.

  /**
   * Gets all but the last n elements of an array.
   * @param {Array<any>} array The input array.
   * @param {number} [n=1] The number of elements to exclude from the end.
   * @returns {Array<any>} The initial portion of the array.
   */
  initial(array, n)
  {
    return array.slice.call(array, 0, Math.max(0, array.length - (n == null ? 1 : n)));
  } // End of initial method.

  /**
   * Gets all but the first n elements of an array.
   * @param {Array<any>} array The input array.
   * @param {number} [n=1] The number of elements to exclude from the beginning.
   * @returns {Array<any>} The tail portion of the array.
   */
  tail(array, n)
  {
    return array.slice.call(array, n == null ? 1 : n);
  } // End of tail method.

  /**
   * Gets the last element(s) of an array.
   * @param {Array<any>} array The input array.
   * @param {number} [n] The number of elements to retrieve from the end.
   * @returns {any|Array<any>} The last element or an array of the last n elements.
   */
  last(array, n)
  {
    if (n == null) return array[array.length - 1];
    return this.tail(array, Math.max(0, array.length - n));
  } // End of last method.

  /**
   * Calculates the cumulative sum (prefix sum) of an array.
   * @param {Array<number>} arr The input array of numbers.
   * @returns {Array<number>} An array containing the cumulative sums.
   */
  sumArray(arr)
  {
    return this.tail(arr.reduce(((a, b, i) => { a.push(b + a[i]); return a; }), [0]));
  } // End of sumArray method.

  /**
   * Calculates the difference between adjacent elements in an array.
   * @param {Array<number>} arr The input array of numbers.
   * @returns {Array<number>} An array containing the differences.
   */
  diffArray(arr)
  {
    const s = []; // Initialize an empty array for differences.
    for (let i = 1; i < arr.length; ++i)
    {
      s.push(arr[i] - arr[i - 1]); // Calculate and push the difference.
    }
    return s;
  } // End of diffArray method.

  /**
   * Performs a binary search on a sorted array to find the index of the largest element less than or equal to a key.
   * This is similar to `upper_bound` in C++ STL if `iteratee` extracts the value.
   * @param {Array<any>} array The sorted input array.
   * @param {any} key The value to search for.
   * @param {string} [iteratee] The property name to use if array elements are objects.
   * @returns {number} The index where the key would be inserted to maintain sorted order, or the length of the array.
   */
  binarySearch(array, key, iteratee)
  {
    // Helper function to extract the value from an object or use the primitive value.
    const itr = (obj) => (typeof obj === 'object') ? obj[iteratee] : obj;
    const value = itr(key); // Get the value to search for.
    let low = 0,
      high = array.length; // Initialize search bounds.
    while (low < high)
    {
      let mid = Math.floor((low + high) / 2); // Calculate the middle index.
      if (itr(array[mid]) < value)
      {
        low = mid + 1; // If middle element is too small, search in the upper half.
      } else
      {
        high = mid; // If middle element is large enough, search in the lower half (including mid).
      }
    } // End of while loop.
    return low; // Return the insertion point.
  } // End of binarySearch method.
} // End of Underscore class.

// Instantiate the Underscore utility class.
const _ = new Underscore(); // A common convention for utility libraries.

// This class handles input operations, reading from stdin.
class Input {
  /**
   * Constructor for the Input class.
   * Initializes cursor and reads all input.
   */
  constructor() {
    this.cursor = 0; // Tracks the current line being read.
    this.inputAll(); // Read all input upon instantiation.
  } // End of constructor.

  /**
   * Reads all lines from standard input and stores them in `this.data`.
   * @returns {Array<string>} An array of all input lines.
   */
  inputAll() {
    // Requires Node.js 'fs' module to read from '/dev/stdin'.
    this.data = (require("fs").readFileSync("/dev/stdin", "utf8")).split('\n');
    return this.data;
  } // End of inputAll method.

  /**
   * Reads one or multiple lines from input.
   * @param {number} [n] The number of lines to read. If not provided, reads one line.
   * @returns {string|Array<string>} A single line string or an array of lines.
   */
  nextLine(n) {
    if (n) {
      // If 'n' is provided, slice 'n' lines.
      const ret = this.data.slice(this.cursor, this.cursor + n);
      this.cursor += n; // Advance the cursor.
      return ret;
    }
    return this.data[this.cursor++]; // Read one line and advance cursor.
  } // End of nextLine method.

  /**
   * Reads the next line as an integer.
   * @returns {number} The parsed integer.
   */
  nextInt() {
    return parseInt(this.nextLine());
  } // End of nextInt method.

  /**
   * Reads the next line, splits it by space, and returns an array of strings.
   * @returns {Array<string>} An array of strings from the line.
   */
  nextStrArr() {
    return this.nextLine().split(' ');
  } // End of nextStrArr method.

  /**
   * Reads the next line, splits it by space, and returns an array of integers.
   * @returns {Array<number>} An array of parsed integers.
   */
  nextIntArr() {
    return this.nextStrArr().map((e) => parseInt(e));
  } // End of nextIntArr method.

  /**
   * Reads the next line, splits it by space, and returns an array of floating-point numbers.
   * @returns {Array<number>} An array of parsed floats.
   */
  nextFloatArr() {
    return this.nextStrArr().map((e) => parseFloat(e));
  } // End of nextFloatArr method.

  /**
   * Reads 'n' lines and parses each as an integer, returning an array of integers.
   * @param {number} n The number of lines to read.
   * @returns {Array<number>} An array of parsed integers from multiple lines.
   */
  nextIntLine(n) {
    return this.nextLine(n).map((e) => parseInt(e));
  } // End of nextIntLine method.

  /**
   * Reads 'n' lines and parses each as a float, returning an array of floats.
   * @param {number} n The number of lines to read.
   * @returns {Array<number>} An array of parsed floats from multiple lines.
   */
  nextFloatLine(n) {
    return this.nextLine(n).map((e) => parseFloat(e));
  } // End of nextFloatLine method.

  /**
   * Reads 'n' lines, splits each by space, returning a 2D array of strings.
   * @param {number} n The number of lines to read.
   * @returns {Array<Array<string>>} A 2D array of strings.
   */
  nextStrRange(n) {
    return this.nextLine(n).map((line) => line.split(' '));
  } // End of nextStrRange method.

  /**
   * Reads 'n' lines, splits each by space, and parses elements as integers, returning a 2D array of integers.
   * @param {number} n The number of lines to read.
   * @returns {Array<Array<number>>} A 2D array of integers.
   */
  nextIntRange(n) {
    return this.nextLine(n).map((line) => line.split(' ').map((e) => parseInt(e)));
  } // End of nextIntRange method.

  /**
   * Reads 'n' lines, splits each by space, and parses elements as floats, returning a 2D array of floats.
   * @param {number} n The number of lines to read.
   * @returns {Array<Array<number>>} A 2D array of floats.
   */
  nextFloatRange(n) {
    return this.nextLine(n).map((line) => line.split(' ').map((e) => parseFloat(e)));
  } // End of nextFloatRange method.
} // End of Input class.

// Instantiate the Input class to handle reading from stdin.
const input = new Input(); // Global input reader.

// This class handles output operations, specifically writing to console.
class Out {
  /**
   * Constructor for the Out class.
   * Sets up default options for boolean output.
   */
  constructor() {
    this.option = {
      'true': 'Yes', // Default string for true.
      'false': 'No', // Default string for false.
    };
  } // End of constructor.

  /**
   * Writes the given output to the console. Handles boolean conversion based on options.
   * @param {any} output The value to be written.
   */
  write(output) {
    let ret;
    if (output == null) return; // Do nothing if output is null or undefined.

    if (output === true)
    {
      ret = this.option['true']; // Use custom string for true.
    }
    else if (output === false)
    {
      ret = this.option['false']; // Use custom string for false.
    }
    else
    {
      ret = output; // For other types, use the value directly.
    }
    console.log(ret); // Output to standard console.
  } // End of write method.

  /**
   * Sets custom string options for boolean output.
   * @param {Array<string>} option An array where option[0] is for 'false' and option[1] for 'true'.
   * @returns {Out} The current Out instance for chaining.
   */
  bool(option) {
    this.option['false'] = option[0]; // Set custom string for false.
    this.option['true'] = option[1]; // Set custom string for true.
    return this; // Allow method chaining.
  } // End of bool method.
} // End of Out class.

// Instantiate the Out class to handle writing to stdout.
const out = new Out(); // Global output writer.

// Main execution block:
// Create a new instance of the Main class, call its solve method,
// and then write the result to the console using the 'out' utility.
out.write(new Main().solve()); // Execute the program and print the final result.