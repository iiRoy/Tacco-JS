var GET = ( /* This is an immediately invoked function expression (IIFE)
                       that sets up a utility for reading input. */
  function () {

    /**
     * Factory function to create a new input reader instance.
     * @param {string} s - The input string.
     * @returns {g} A new instance of the input reader.
     */
    function f (s) {
      return new g(s);
    }

    /**
     * Constructor for the input reader.
     * It processes the raw input string into an array of lines.
     * @param {string} s - The raw input string.
     */
    function g (s) {

      // Store the processed lines, splitting by newline after trimming.
      this._s = s . trim () . split ( "\n" );

      // Initialize the current line index to 0.
      this._y = 0;
    }

    /**
     * Reads a single value from the current line.
     * It handles both numeric and string output based on the 'f' flag.
     * @param {boolean} f - If true, returns the value as a string; otherwise, as a number.
     * @returns {*} The read value.
     */
    g. prototype . a = function (f) {
      var s = this._s,
        y = this._y,
        r;

      // If the current line hasn't been split yet, split it and reverse to pop from the left.
      if (typeof s [y] === "string") {
        s [y] = s [y] . split ( " " ) . reverse ();
      }

      // Pop the next value from the current line.
      r = s [y] . pop ();

      // If the current line is exhausted, move to the next line.
      if (!s [y] . length) {
        this._y++;
      }

      // Return as string or number based on the flag.
      return f ? r : +r;
    };

    /**
     * Reads an entire line of space-separated values.
     * @param {boolean} f - If true, returns values as strings; otherwise, as numbers.
     * @returns {Array} An array of values from the line.
     */
    g . prototype . l = function (f) {

      // Get the current line, increment the line index, and split by space.
      var s = this._s [this._y++] . split ( " " );

      // Return as string array or number array.
      return f ? s : s . map (a => +a);
    };

    /**
     * Reads 'n' lines and parses each into an array of space-separated values.
     * @param {number} n - The number of lines to read.
     * @param {boolean} f - If true, returns values as strings; otherwise, as numbers.
     * @returns {Array<Array>} A 2D array of values.
     */
    g . prototype . m = function (n, f) {
      var r = this._s . slice (this._y, this._y += n) . map (a => a . split ( " " ));

      // Return as string 2D array or number 2D array.
      return f ? r : r . map (a => a . map (a => +a));
    };

    /**
     * Reads 'n' lines as raw strings or converts them to numbers.
     * @param {number} n - The number of lines to read.
     * @param {boolean} f - If true, returns lines as strings; otherwise, as numbers.
     * @returns {Array} An array of lines/numbers.
     */
    g . prototype . r = function (n, f) {
      var r = this._s . slice (this._y, this._y += n);

      // Return as string array or number array.
      return f ? r : r . map (a => +a);
    };

    // The IIFE returns the factory function 'f'.
    return f;

  }) (); // End of the GET IIFE.

// Initialize the input reader 'o' by reading from /dev/stdin.
var o = GET ( require ( "fs" ) . readFileSync ( "/dev/stdin", "utf8" ) );

/**
 * Dynamically creates a multi-dimensional array initialized with a given value.
 * This function uses 'eval' and is generally considered unsafe for untrusted input.
 * @param {*} v - The initial value for array elements.
 * @param {...number} dimensions - The dimensions of the array (e.g., xArray(0, 2, 3) for a 2x3 array of zeros).
 * @returns {Array} The dynamically created multi-dimensional array.
 */
function xArray (v) {
  var a = arguments,
    l = a . length,
    r = "Array(a[" + --l + "]) . fill (0) . map (x => { return " + v + "; })"; // Innermost array creation.

  // Loop to build up the nested array creation string.
  while ( --l ) {
    r = "Array(a[" + l + "]) . fill (0) . map (x => " + r + ")";
  }

  // Evaluate the constructed string to create the array.
  return eval (r);
}

// Execute the main function and print its result to the console.
console . log ( main () );

/**
 * The main logic function for the problem.
 * It calculates the maximum possible sum by strategically removing elements.
 * @returns {number} The maximum sum.
 */
function main () {

  // Read the total number of elements 'n'.
  var n = o . a ();

  // Read the maximum number of operations 'k'.
  var k = o . a ();

  // Read the array of values 'v'.
  var v = o . l ();

  // Initialize the maximum answer found so far.
  var ans = 0;

  // Outer loop: Iterate through the number of elements to take from the left and right (total 'i' elements).
  for ( var i = 0; i <= k && i < n; i++ ) {

    // Inner loop: Distribute 'i' elements between the left side ('l' elements)
    // and the right side ('i - l' elements).
    for ( var l = 0; l <= i; l++ ) {

      // 'm' will store negative numbers collected from the ends.
      var m = [];

      // 's' will store the current sum.
      var s = 0;

      // Loop to take 'l' elements from the left side of 'v'.
      for ( var l2 = 0; l2 < l; l2++ ) {

        // If the element is negative, add it to 'm' for potential removal later.
        if ( v [l2] < 0 ) {
          m . push ( v [l2] );
        }

        // Add the element to the current sum.
        s += v [l2];
      }

      // Loop to take 'i - l2' elements from the right side of 'v'.
      // Note: 'l2' here is the final value from the previous loop, effectively 'l'.
      for ( var r = 0; r < i - l2; r++ ) {

        // If the element is negative, add it to 'm'.
        if ( v [n - 1 - r] < 0 ) {
          m . push ( v [n - 1 - r] );
        }

        // Add the element to the current sum.
        s += v [n - 1 - r];
      }

      // Sort the collected negative numbers in ascending order.
      m . sort ( (a, b) => a - b );

      // Remove the smallest negative numbers if we have remaining operations (k-i).
      for ( var x = 0; x < k - i && x < m . length; x++ ) {

        // Subtracting a negative number increases the sum.
        s -= m [x];
      }

      // Update the overall maximum answer if the current sum is greater.
      if ( s > ans ) {
        ans = s;
      }
    }
  }

  // Return the final maximum sum.
  return ans;
}