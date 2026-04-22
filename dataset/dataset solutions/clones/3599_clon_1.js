/*
 * This file defines a custom input reader class named 'gets'
 * and several utility functions for processing data.
 *
 * The 'gets' class is designed to read input lines and parse
 * numbers or strings from them, advancing through the input stream.
 */
function gets(str) {
  // Store the input string, split into an array of lines.
  // Each line is initially a raw string.
  this._s = str.split("\n");

  // Initialize the current line index to 0,
  // pointing to the first line of input.
  this._y = 0;
}

// Define prototype methods for the 'gets' class.
gets.prototype = {
  /**
   * Reads and parses a single token (word) from the current line.
   * If 'f' is true, returns the token as a string; otherwise,
   * attempts to convert it to a number.
   *
   * @param {boolean} f - Flag indicating whether to return a string (true) or a number (false).
   * @returns {string|number} The parsed token.
   */
  a: function(f) {
    // Local references for efficiency and readability.
    var s = this._s,
      y = this._y,
      r; // 'r' will hold the result token.

    // If the current line is still a raw string, split it into words
    // and reverse the array so 'pop()' can be used to read tokens
    // from left to right (as if reading from the beginning of the line).
    if (typeof s[y] === "string") {
      s[y] = s[y].split(" ").reverse();
    }

    // Pop the last element (which is the first word due to reversal)
    // from the current line's array of words.
    r = s[y].pop();

    // If the current line is now empty (all words have been read),
    // increment the line index to move to the next line for subsequent reads.
    if (!s[y].length) {
      this._y++;
    }

    // Return the token, either as a string or a number based on the 'f' flag.
    return f ? r : +r;
  },

  /**
   * Reads an entire line of input and parses its tokens.
   * If 'f' is true, returns an array of strings; otherwise,
   * returns an array of numbers.
   *
   * @param {boolean} f - Flag indicating string array (true) or number array (false).
   * @returns {string[]|number[]} An array of tokens from the line.
   */
  l: function(f) {
    // Get the current line, increment the line index, and split the line into words.
    var s = this._s[this._y++].split(" ");

    // Return the array of tokens, mapping to numbers if 'f' is false.
    return f ? s : s.map(a => +a);
  },

  /**
   * Reads 'n' consecutive lines of input, parsing each line into tokens.
   * Returns a 2D array (matrix) of tokens.
   *
   * @param {number} n - The number of lines to read.
   * @param {boolean} f - Flag indicating string matrix (true) or number matrix (false).
   * @returns {string[][]|number[][]} A 2D array of tokens.
   */
  m: function(n, f) {
    var s = this._s,
      y = this._y,
      r = [],
      i = 0; // 'r' will be the resulting 2D array, 'i' is a loop counter.

    // Loop 'n' times to read 'n' lines.
    if (f) {
      // If 'f' is true, store tokens as strings.
      for (; i < n; i++) {
        r[i] = s[y + i].split(" ");
      }
    } else {
      // If 'f' is false, parse tokens as numbers.
      for (; i < n; i++) {
        r[i] = s[y + i].split(" ").map(a => +a);
      }
    }

    // Advance the line index by 'n' as 'n' lines have been consumed.
    this._y += n;

    // Return the 2D array of parsed tokens.
    return r;
  },
};

// Initialize the 'gets' input reader with content from standard input.
// This reads the entire file content, assuming it's UTF-8 encoded.
var o = new gets(require("fs").readFileSync("/dev/stdin", "utf8"));

/**
 * Calculates the number of inversions in an array using a modified merge sort approach.
 * An inversion is a pair of indices (i, j) such that i < j and a[i] > a[j].
 * This function modifies the input array 'a' during the sorting process.
 *
 * @param {number[]} a - The array for which to count inversions.
 * @returns {number} The total count of inversions.
 */
function inv(a) {
  var n = a.length; // Get the length of the array.
  var m = 0; // Initialize inversion count to zero.

  // The outer loop performs passes similar to merge sort,
  // doubling the size of the subarrays being merged in each pass.
  // 'i' represents the current size of the subarrays.
  for (var i = 1; i < n; i <<= 1) {
    var b = []; // 'b' is a temporary array to store the merged result of the current pass.

    // The inner loop iterates through the array, merging adjacent subarrays of size 'i'.
    for (var j = 0; j < n;) {
      // Define the boundaries of the two subarrays to be merged.
      // 'l' and 'r' define the first subarray [l, r).
      var l = j,
        r = Math.min(n, l + i);
      // 'l2' and 'r2' define the second subarray [l2, r2).
      var l2 = r,
        r2 = Math.min(n, r + i);

      // Merge the two subarrays into 'b'.
      while (j < r2) {
        // Case 1: First subarray is exhausted. Take from the second subarray.
        if (l === l2) {
          b[j] = a[r++];
        }
        // Case 2: Second subarray is exhausted. Take from the first subarray.
        else if (r === r2) {
          b[j] = a[l++];
        }
        // Case 3: Both subarrays have elements. Compare them.
        else if (a[l] > a[r]) {
          // If a[l] > a[r], it means a[l] is greater than a[r]
          // AND all remaining elements in the first subarray (from l to l2-1)
          // are also greater than a[r] (because both subarrays are sorted).
          // So, we add 'l2 - l' to the inversion count.
          m += l2 - l;
          b[j] = a[r++]; // Take the smaller element from the second subarray.
        }
        // Case 4: a[l] <= a[r]. No inversion with a[r].
        else {
          b[j] = a[l++]; // Take the smaller element from the first subarray.
        }
        j++; // Move to the next position in the merged array 'b'.
      }
    }
    a = b; // Update 'a' with the newly sorted and merged array 'b' for the next pass.
  }
  return m; // Return the total inversion count.
}

// Call the main function and print its result to the console.
console.log(main());

/**
 * Main function to solve the problem.
 * This function appears to be finding the median of medians or a similar statistical measure
 * by using binary search on the answer space combined with inversion counting.
 * Specifically, it seems to find the k-th smallest element where k is related to n*(n+1)/4.
 *
 * @returns {number} The calculated value (likely a specific quantile or median).
 */
function main() {
  // Read the number of elements 'n' from input.
  var n = o.a();
  // Read the array 'a' of numbers from input.
  var a = o.l();

  // Handle base cases for small 'n'.
  if (n <= 2) {
    // For n=1 or n=2, the "median" related value is simply the maximum element.
    return Math.max(...a);
  }

  // Calculate 'p', which represents the rank (k-th smallest) we are looking for.
  // The formula n*(n+1)/4 + 1 suggests finding a specific quantile,
  // possibly related to the median of all subarray sums or a similar statistical property.
  var p = Math.floor(n * (n + 1) / 4 + 1);

  // Initialize binary search range [l, r].
  // 'l' is the lower bound (minimum possible value, 2 in this context).
  // 'r' is the upper bound (a large number, 10^9 + 1, as values can be up to 10^9).
  var l = 2,
    r = 1e9 + 1;

  // Perform binary search for the target value.
  while (l < r) {
    // Calculate the middle value 'm'. Using bitwise right shift (>> 1) for integer division.
    var m = l + r >> 1;

    // Create a new array 'b' based on 'a' and the current 'm'.
    // 'b[i+1]' will store a prefix sum: +1 if a[i] >= m, -1 if a[i] < m.
    // This transforms the problem into counting inversions on 'b'.
    var b = [0]; // Initialize with a leading zero.
    for (var i = 0; i < n; i++) {
      b[i + 1] = b[i]; // Copy previous prefix sum.
      if (a[i] < m) {
        b[i + 1]--; // Decrement if a[i] is less than 'm'.
      } else {
        b[i + 1]++; // Increment if a[i] is greater than or equal to 'm'.
      }
    }

    // Count inversions in the transformed array 'b'.
    // The number of inversions in 'b' tells us how many pairs (i, j) with i < j
    // exist such that b[i] > b[j]. This is related to the number of subarrays
    // whose sum (after transformation) is negative.
    if (inv(b) < p) {
      // If the number of inversions is less than 'p', it means our 'm' is too small.
      // We need a larger 'm' to get more inversions (or more specifically,
      // to shift the median-like value upwards).
      l = m + 1;
    } else {
      // If the number of inversions is greater than or equal to 'p',
      // 'm' might be our answer or too large. We try a smaller or equal 'm'.
      r = m;
    }
  }

  // 'l' will converge to the smallest 'm' for which inv(b) >= p.
  // The problem's specific definition often requires returning l-1 in such cases
  // to get the actual k-th smallest value or a related threshold.
  return l - 1;
}