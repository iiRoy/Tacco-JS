/*
 * This file contains a JavaScript application structure,
 * including utility classes for input handling and array operations.
 * It strictly adheres to modern JavaScript practices.
 */

'use strict'; // Enforce stricter parsing and error handling for cleaner code.

/**
 * The main application class responsible for solving the problem.
 * It orchestrates the input processing and calculation steps.
 */
class Main
{
  /**
   * Solves the primary problem by processing input and returning a result.
   * This method reads numerical arrays, performs transformations, and sums the results.
   * @returns {number} The calculated sum based on the problem's logic.
   */
  solve()
  {
    // Read the first line of input as an array of integers (n, a, b).
    const nab = input.nextIntArr();

    // Read the second line of input as a sequence of integers.
    const seq = input.nextIntArr();

    // Calculate the differences between consecutive elements in the sequence.
    // Then, for each difference 'e', calculate Math.min(e * nab[1], nab[2]).
    // Finally, sum all these calculated minimum values.
    return _.sum(
      _.diffArray(seq)
       .map(
         e => Math.min(e * nab[1], nab[2])
       )
    );
  }
}

/**
 * A utility class providing common array manipulation functions,
 * similar to the popular Underscore.js library.
 * It includes methods for summation, min/max, sorting, range generation,
 * array slicing, and custom array transformations.
 */
class Underscore
{
  /**
   * Calculates the sum of all elements in a numerical array.
   * Uses Array.prototype.reduce for efficient summation.
   * @param {number[]} arr - The array of numbers to sum.
   * @returns {number} The total sum of the array elements.
   */
  sum(arr) { return arr.reduce((a, b) => a + b); }

  /**
   * Finds the minimum element in an array.
   * An optional comparator function can be provided.
   * @param {Array<any>} arr - The array to search.
   * @param {function(any, any): number} [func] - Optional comparator function.
   * @returns {any} The minimum element found in the array.
   */
  min(arr, func)
  {
    // Default comparator for numbers if none is provided.
    if (func == null)
    {
      func = (a, b) => a - b;
    }
    // Reduce the array to find the minimum value.
    return arr.reduce((a, b) => func(a, b) < 0 ? a : b);
  }

  /**
   * Finds the maximum element in an array.
   * An optional comparator function can be provided.
   * @param {Array<any>} arr - The array to search.
   * @param {function(any, any): number} [func] - Optional comparator function.
   * @returns {any} The maximum element found in the array.
   */
  max(arr, func)
  {
    // Default comparator for numbers.
    if (func == null)
    {
      func = (a, b) => a - b;
    }
    // Reduce the array to find the maximum value.
    return arr.reduce((a, b) => func(a, b) > 0 ? a : b);
  }

  /**
   * Sorts an array in place.
   * An optional comparator function can be provided.
   * @param {Array<any>} arr - The array to sort.
   * @param {function(any, any): number} [func] - Optional comparator function.
   * @returns {Array<any>} The sorted array.
   */
  sort(arr, func)
  {
    // Default comparator for numbers.
    if (func == null)
    {
      func = (a, b) => a - b;
    }
    // Use the native sort method with the given function.
    return arr.sort(func);
  }

  /**
   * Generates an array of numbers within a specified range.
   * Similar to Python's range function.
   * @param {number} start - The starting value (inclusive).
   * @param {number} [stop] - The stopping value (exclusive). If omitted, `start` becomes `stop` and `start` becomes 0.
   * @param {number} [step] - The increment/decrement step. Defaults to 1 or -1 based on start/stop.
   * @returns {number[]} An array of numbers in the specified range.
   */
  range(start, stop, step)
  {
    // Handle optional 'stop' parameter.
    if (stop == null)
    {
      stop = start || 0; // If 'start' is also null/undefined, stop becomes 0.
      start = 0;         // If 'stop' is null, 'start' is treated as the 'stop' value.
    }
    // Determine the step if not provided.
    if (!step)
    {
      step = stop < start ? -1 : 1; // Step is -1 if stop is less than start, otherwise 1.
    }

    // Calculate the length of the range, ensuring it's non-negative.
    const length = Math.max(Math.ceil((stop - start) / step), 0);
    // Create an array of the calculated length.
    const range = Array(length);

    // Populate the array with values from start to stop, incrementing by step.
    for (var idx = 0; idx < length; idx++, start += step)
    {
      range[idx] = start;
    }
    return range;
  }

  /**
   * Retrieves the first element(s) of an array.
   * If 'n' is provided, returns the first 'n' elements.
   * @param {Array<any>} array - The array to query.
   * @param {number} [n] - The number of elements to return from the beginning.
   * @returns {any|Array<any>|undefined} The first element, an array of first 'n' elements, or undefined/empty array.
   */
  first(array, n)
  {
    // Handle empty or null arrays.
    if (array == null || array.length < 1)
    {
      return n == null ? void 0 : []; // Return undefined if n is null, else empty array.
    }
    // If 'n' is not specified, return the very first element.
    if (n == null)
    {
      return array[0];
    }
    // Otherwise, return the first 'n' elements using `initial` utility.
    return this.initial(array, array.length - n);
  }

  /**
   * Returns all but the last element(s) of an array.
   * If 'n' is provided, returns all but the last 'n' elements.
   * @param {Array<any>} array - The array to query.
   * @param {number} [n] - The number of elements to exclude from the end.
   * @returns {Array<any>} A new array containing the initial elements.
   */
  initial(array, n)
  {
    // Use slice to get a portion of the array.
    // The end index is calculated to exclude 'n' elements from the end.
    return array.slice.call(array, 0, Math.max(0, array.length - (n == null ? 1 : n)));
  }

  /**
   * Returns all but the first element(s) of an array.
   * If 'n' is provided, returns all but the first 'n' elements.
   * @param {Array<any>} array - The array to query.
   * @param {number} [n] - The number of elements to exclude from the beginning.
   * @returns {Array<any>} A new array containing the tail elements.
   */
  tail(array, n)
  {
    // Use slice to get a portion of the array starting from the specified index.
    return array.slice.call(array, n == null ? 1 : n);
  }

  /**
   * Retrieves the last element(s) of an array.
   * If 'n' is provided, returns the last 'n' elements.
   * @param {Array<any>} array - The array to query.
   * @param {number} [n] - The number of elements to return from the end.
   * @returns {any|Array<any>|undefined} The last element, an array of last 'n' elements, or undefined.
   */
  last(array, n)
  {
    // If 'n' is not specified, return the very last element.
    if (n == null)
    {
      return array[array.length - 1];
    }
    // Otherwise, return the last 'n' elements using `tail` utility.
    return this.tail(array, Math.max(0, array.length - n));
  }

  /**
   * Calculates a running sum (prefix sum) array.
   * The first element of the result array is the first element of the input.
   * Subsequent elements are the sum of all preceding elements including the current one.
   * @param {number[]} arr - The input array of numbers.
   * @returns {number[]} An array where each element is the sum of all previous elements from the input.
   */
  sumArray(arr)
  {
    // Use reduce to build up the running sum.
    // The initial accumulator is [0] to handle the first element correctly.
    // The 'tail' function is then used to remove this initial 0 if desired.
    return this.tail(arr.reduce(((a, b, i) => { a.push(b + a[i]); return a }), [0]));
  }

  /**
   * Calculates the difference between consecutive elements in an array.
   * The resulting array will have one less element than the input.
   * @param {number[]} arr - The input array of numbers.
   * @returns {number[]} An array containing the differences between adjacent elements.
   */
  diffArray(arr)
  {
    const s = []; // Initialize an empty array to store differences.
    // Iterate from the second element to calculate differences.
    for (let i = 1; i < arr.length; ++i)
    {
      s.push(arr[i] - arr[i - 1]); // Add the difference to the result array.
    }
    return s; // Return the array of differences.
  }

  /**
   * Performs a binary search on a sorted array to find the insertion point for a key.
   * Can use an iteratee function to extract the value for comparison from objects.
   * @param {Array<any>} array - The sorted array to search within.
   * @param {any} key - The value to search for.
   * @param {string|function(any): any} [iteratee] - Property name or function to extract value from array elements.
   * @returns {number} The index where the key should be inserted to maintain sorted order.
   */
  binarySearch(array, key, iteratee)
  {
    // Helper function to get the value to compare.
    // If iteratee is a string, it's a property name. Otherwise, it's a function.
    const itr = (obj) => (typeof obj === 'object' && iteratee) ? obj[iteratee] : obj;

    // The value we are searching for, potentially extracted by iteratee.
    const value = itr(key);

    let low = 0, high = array.length; // Initialize search boundaries.

    // Perform binary search.
    while (low < high)
    {
      let mid = Math.floor((low + high) / 2); // Calculate the middle index.
      // Compare the value at mid with the search value.
      if (itr(array[mid]) < value)
      {
        low = mid + 1; // If mid value is smaller, search in the upper half.
      }
      else
      {
        high = mid; // If mid value is greater or equal, search in the lower half (including mid).
      }
    }
    return low; // 'low' will be the insertion point.
  }
}

// Create an instance of the Underscore utility class for global use.
const _ = new Underscore();

/**
 * A class dedicated to handling standard input operations.
 * It reads all input at once and provides methods to parse
 * various data types (integers, strings, arrays) line by line or in blocks.
 */
class Input
{
  /**
   * Initializes the Input handler.
   * Reads all available input from /dev/stdin upon instantiation.
   */
  constructor()
  {
    this.cursor = 0; // Tracks the current line being read.
    this.inputAll(); // Reads all input data.
  }

  /**
   * Reads all input data from standard input (/dev/stdin).
   * Splits the input by newlines and stores it in `this.data`.
   * @returns {string[]} An array of strings, where each string is a line of input.
   */
  inputAll()
  {
    // Use Node.js 'fs' module to synchronously read from stdin.
    this.data = (require("fs").readFileSync("/dev/stdin", "utf8")).split('\n');
    return this.data;
  }

  /**
   * Retrieves one or multiple lines of input.
   * Advances the internal cursor.
   * @param {number} [n] - The number of lines to retrieve. If omitted, retrieves a single line.
   * @returns {string|string[]} A single line string or an array of line strings.
   */
  nextLine(n)
  {
    // If 'n' is provided, retrieve 'n' lines.
    if (n)
    {
      const ret = this.data.slice(this.cursor, this.cursor + n); // Slice 'n' lines.
      this.cursor += n; // Advance cursor by 'n'.
      return ret;
    }
    // Otherwise, retrieve a single line.
    return this.data[this.cursor++]; // Return current line and advance cursor.
  }

  /**
   * Retrieves and parses a single integer from the next line of input.
   * @returns {number} The parsed integer.
   */
  nextInt()
  {
    return parseInt(this.nextLine());
  }

  /**
   * Retrieves the next line of input and splits it into an array of strings.
   * Assumes space-separated values.
   * @returns {string[]} An array of strings from the current line.
   */
  nextStrArr()
  {
    return this.nextLine().split(' ');
  }

  /**
   * Retrieves the next line of input, splits it by spaces, and parses each part as an integer.
   * @returns {number[]} An array of integers from the current line.
   */
  nextIntArr()
  {
    return this.nextStrArr().map((e) => parseInt(e));
  }

  /**
   * Retrieves the next line of input, splits it by spaces, and parses each part as a float.
   * @returns {number[]} An array of floating-point numbers from the current line.
   */
  nextFloatArr()
  {
    return this.nextStrArr().map((e) => parseFloat(e));
  }

  /**
   * Retrieves 'n' lines of input and parses each line as a single integer.
   * @param {number} n - The number of lines to read.
   * @returns {number[]} An array of integers, one for each line.
   */
  nextIntLine(n)
  {
    return this.nextLine(n).map((e) => parseInt(e));
  }

  /**
   * Retrieves 'n' lines of input and parses each line as a single floating-point number.
   * @param {number} n - The number of lines to read.
   * @returns {number[]} An array of floats, one for each line.
   */
  nextFloatLine(n)
  {
    return this.nextLine(n).map((e) => parseFloat(e));
  }

  /**
   * Retrieves 'n' lines of input, and for each line, splits it into an array of strings.
   * Creates a 2D array of strings.
   * @param {number} n - The number of lines to read.
   * @returns {string[][]} A 2D array of strings.
   */
  nextStrRange(n)
  {
    return this.nextLine(n).map((line) => line.split(' '));
  }

  /**
   * Retrieves 'n' lines of input, and for each line, splits it into an array of integers.
   * Creates a 2D array of integers.
   * @param {number} n - The number of lines to read.
   * @returns {number[][]} A 2D array of integers.
   */
  nextIntRange(n)
  {
    return this.nextLine(n).map((line) => line.split(' ').map((e) => parseInt(e)));
  }

  /**
   * Retrieves 'n' lines of input, and for each line, splits it into an array of floats.
   * Creates a 2D array of floating-point numbers.
   * @param {number} n - The number of lines to read.
   * @returns {number[][]} A 2D array of floats.
   */
  nextFloatRange(n)
  {
    return this.nextLine(n).map((line) => line.split(' ').map((e) => parseFloat(e)));
  }
}

// Create a global instance of the Input class to handle all input.
const input = new Input();

/**
 * A utility function for outputting results to the console.
 * It handles special cases for boolean true/false to output "Yes"/"No",
 * and prevents output if the value is null or undefined.
 * @param {any} output - The value to be printed to the console.
 */
const Out = (output) =>
{
  let ret; // Variable to hold the formatted output.

  // If output is null or undefined, do nothing.
  if (output == null)
  {
    return;
  }

  // Handle boolean true specifically.
  if (output === true)
  {
    ret = 'Yes';
  }
  // Handle boolean false specifically.
  else if (output === false)
  {
    ret = 'No';
  }
  // For all other types, use the output value directly.
  else
  {
    ret = output;
  }

  // Print the formatted result to the console.
  console.log(ret);
};

// Execute the main solution and output its result.
// This is the entry point of the application logic.
Out(new Main().solve());