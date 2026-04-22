'use strict' // This ensures strict mode for the entire script.

// Define the main application logic class.
class Main {
  // The primary method to execute the solution.
  solve() {
    // Read an array of integers (n, a, b) from input.
    const nab = input.nextIntArr(); // Store configuration values.
    // Read another array of integers (x values) from input.
    const x = input.nextIntArr(); // This variable 'x' is defined but not used in the original 'solve' method.
                                  // The original code uses 's' which is undefined.
                                  // As per Type I clone rules, this bug is preserved.

    /*
     * Calculate the sum of transformed elements.
     * 1. Calculate differences between consecutive elements in 's'.
     * 2. For each difference 'e', calculate Math.min(e * nab[1], nab[2]).
     * 3. Sum all these minimum values.
     */
    return _.sum (
        _ . diffArray ( s ) // Apply diffArray to 's' (which is undefined, replicating original bug).
            . map ( e =>
                Math . min ( e * nab[1] , nab[2] ) // Transform each element.
            )
    ) ; // Return the final computed sum.
  }
} // End of Main class definition.

// Utility class providing common functional programming helpers.
class Underscore {
  // Computes the sum of all elements in an array.
  sum(arr) {
    return arr.reduce( (a, b) => a + b );
  }

  // Finds the minimum element in an array, optionally using a custom comparison function.
  min(arr, func) {
    if (func == null) {
      func = (a, b) => a - b; // Default comparison for numbers.
    }
    return arr.reduce( (a, b) => func(a, b) < 0 ? a : b );
  }

  // Finds the maximum element in an array, optionally using a custom comparison function.
  max(arr, func) {
    if (func == null) {
      func = (a, b) => a - b; // Default comparison for numbers.
    }
    return arr.reduce( (a, b) => func(a, b) > 0 ? a : b );
  }

  // Sorts an array, optionally using a custom comparison function.
  sort(arr, func) {
    if (func == null) {
      func = (a, b) => a - b; // Default comparison for numbers.
    }
    return arr.sort(func);
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

  // Gets the first element(s) of an array.
  first(array, n) {
    if (array == null || array.length < 1) {
      return n == null ? void 0 : [];
    }
    if (n == null) {
      return array[0];
    }
    return this.initial(array, array.length - n);
  }

  // Gets all but the last element(s) of an array.
  initial(array, n) {
    return array.slice.call(array, 0, Math.max(0, array.length - (n == null ? 1 : n)));
  }

  // Gets all but the first element(s) of an array.
  tail(array, n) {
    return array.slice.call(array, n == null ? 1 : n);
  }

  // Gets the last element(s) of an array.
  last(array, n) {
    if (n == null) {
      return array[array.length - 1];
    }
    return this.tail(array, Math.max(0, array.length - n));
  }

  // Calculates a running sum array.
  sumArray(arr) {
    return this.tail(arr.reduce(((a, b, i) => {
      a.push(b + a[i]);
      return a;
    }), [0]));
  }

  // Calculates the differences between consecutive elements in an array.
  diffArray(arr) {
    const s = []; // Temporary array to store differences.
    for (let i = 1; i < arr.length; ++i) {
      s.push(arr[i] - arr[i - 1]);
    }
    return s;
  }

  // Performs a binary search on a sorted array.
  binarySearch(array, key, iteratee) {
    // Helper function to extract the value for comparison.
    const itr = (obj) => (typeof obj === 'object') ? obj[iteratee] : obj;
    const value = itr(key); // The value to search for.

    let low = 0,
      high = array.length; // Initialize search bounds.

    while (low < high) {
      let mid = Math.floor((low + high) / 2); // Calculate middle index.
      if (itr(array[mid]) < value) {
        low = mid + 1; // Adjust low bound.
      } else {
        high = mid; // Adjust high bound.
      }
    }
    return low; // Return the insertion point.
  }
} // End of Underscore class.

// Instantiate the Underscore utility object.
const _ = new Underscore();

// Class for handling input operations.
class Input {
  // Constructor initializes input data and cursor.
  constructor() {
    this.cursor = 0; // Current position in the input data.
    this.inputAll(); // Load all input data immediately.
  }

  // Reads all input from stdin and stores it as an array of lines.
  inputAll() {
    this.data = (require("fs").readFileSync("/dev/stdin", "utf8")).split('\n');
    return this.data;
  }

  /*
   * Retrieves one or multiple lines of input.
   * @param {number} n - Optional: number of lines to retrieve.
   * @returns {string|string[]} - A single line string or an array of lines.
   */
  nextLine(n) {
    if (n) {
      const ret = this.data.slice(this.cursor, this.cursor + n);
      this.cursor += n;
      return ret;
    }
    return this.data[this.cursor++];
  }

  /*
   * Retrieves and parses the next line as a single integer.
   * @returns {number} - The parsed integer.
   */
  nextInt() {
    return parseInt(this.nextLine());
  }

  /*
   * Retrieves the next line and splits it into an array of strings.
   * @returns {string[]} - An array of strings.
   */
  nextStrArr() {
    return this.nextLine().split(' ');
  }

  /*
   * Retrieves the next line, splits it, and parses elements into an array of integers.
   * @returns {number[]} - An array of integers.
   */
  nextIntArr() {
    return this.nextStrArr().map((e) => parseInt(e));
  }

  /*
   * Retrieves the next line, splits it, and parses elements into an array of floats.
   * @returns {number[]} - An array of floats.
   */
  nextFloatArr() {
    return this.nextStrArr().map((e) => parseFloat(e));
  }

  /*
   * Retrieves multiple lines and parses each into an integer.
   * @param {number} n - Number of lines to retrieve.
   * @returns {number[]} - An array of integers from n lines.
   */
  nextIntLine(n) {
    return this.nextLine(n).map((e) => parseInt(e));
  }

  /*
   * Retrieves multiple lines and parses each into a float.
   * @param {number} n - Number of lines to retrieve.
   * @returns {number[]} - An array of floats from n lines.
   */
  nextFloatLine(n) {
    return this.nextLine(n).map((e) => parseFloat(e));
  }

  /*
   * Retrieves multiple lines and splits each into an array of strings.
   * @param {number} n - Number of lines to retrieve.
   * @returns {string[][]} - A 2D array of strings.
   */
  nextStrRange(n) {
    return this.nextLine(n).map((line) => line.split(' '));
  }

  /*
   * Retrieves multiple lines, splits each, and parses elements into a 2D array of integers.
   * @param {number} n - Number of lines to retrieve.
   * @returns {number[][]} - A 2D array of integers.
   */
  nextIntRange(n) {
    return this.nextLine(n).map((line) => line.split(' ').map((e) => parseInt(e)));
  }

  /*
   * Retrieves multiple lines, splits each, and parses elements into a 2D array of floats.
   * @param {number} n - Number of lines to retrieve.
   * @returns {number[][]} - A 2D array of floats.
   */
  nextFloatRange(n) {
    return this.nextLine(n).map((line) => line.split(' ').map((e) => parseFloat(e)));
  }
} // End of Input class.

// Instantiate the Input object to handle all input operations.
const input = new Input();

// Global output function.
const Out = (output) => {
  let ret; // Variable to hold the formatted output.
  if (output == null) {
    return; // Do nothing if output is null or undefined.
  }

  if (output === true) {
    ret = 'Yes'; // Convert boolean true to string 'Yes'.
  } else if (output === false) {
    ret = 'No'; // Convert boolean false to string 'No'.
  } else {
    ret = output; // Use output as is for other types.
  }
  console.log(ret); // Print the result to standard output.
};

// Execute the main solution and output its result.
Out(new Main().solve()); // Create an instance of Main and call its solve method.