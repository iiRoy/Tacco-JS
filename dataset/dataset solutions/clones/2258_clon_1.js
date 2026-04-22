/*
 * This file contains the main logic for processing input data.
 * It's designed to read from standard input, parse numerical values,
 * perform calculations involving combinations, and print the result.
 */
function Main(  input  ) {
  // Define a modulo number for arithmetic operations, a common practice in competitive programming.
  var    modnumber    =    1000000007;

  // Process the raw input string into a structured array of integers.
  // First, `inputting` converts the string to a 2D array of strings.
  // Then, `parseint_array` converts all elements in that 2D array to integers.
  var tmp = parseint_array(  inputting( input )  );

  // Generate all possible patterns (combinations) based on the first two input values.
  // tmp[0][0] and tmp[0][1] are assumed to be the 'n' and 'k' parameters for combination generation.
  var pat = ccc(   tmp[0][0],   tmp[0][1]   ); /* This variable stores the generated patterns */

  // Initialize a sum variable to accumulate results.
  var sum = 0;

  // Iterate through each generated pattern.
  for ( var i = 0;   i < pat.length;   i++ ) {
    // For each pattern, calculate a value using the `fx` function
    // and add it to the sum, applying the modulo operation to prevent overflow.
    sum += fx(  tmp[1],  pat[i]  ) % modnumber;
  }

  // Output the final calculated sum to the console.
  // This is the standard output for the program.
  console.log(  sum  );
}




/*
 * Function `fx`: Calculates the difference between the maximum and minimum values
 * within an array `arr` at indices specified by `pat`.
 *
 * @param {Array<number>} arr - The array of numbers to search within.
 * @param {Array<number>} pat - An array of 1-based indices indicating which elements of `arr` to consider.
 * @returns {number} The difference between the maximum and minimum values found.
 */
function fx(  arr,  pat  ) {
  // Initialize minimum and maximum values with the first element specified by the pattern.
  var mi = arr[  pat[0] - 1  ]; // Minimum value found so far.
  var ma = arr[  pat[0] - 1  ]; // Maximum value found so far.

  // Loop through the rest of the pattern indices.
  for ( var i = 1;   i < pat.length;   i++ ) {
    // Update minimum if a smaller value is found.
    mi = Math.min(  mi,  arr[  pat[i] - 1  ]  );
    // Update maximum if a larger value is found.
    // NOTE: There might be a logical error in the original code, as `Math.max(mi, ...)`
    // should probably be `Math.max(ma, ...)` to track the overall maximum.
    // However, per Type I definition, this expression must remain unchanged.
    ma = Math.max(  mi,  arr[  pat[i] - 1  ]  );
  }

  // Return the computed difference.
  return (  ma - mi  );
}




/*
 * Function `inputting`: Processes raw input string into a 2D array of strings.
 * Each line of input becomes a row, and each space-separated token becomes a column.
 *
 * @param {string} input - The raw input string, typically from standard input.
 * @returns {Array<Array<string>>} A 2D array where each inner array represents a line
 *                                  of input split by spaces.
 */
function inputting(  input  ) {
  /*
   * This function transforms the standard input data.
   * It splits the input by newlines to get individual rows.
   * Then, each row is split by spaces to get individual elements.
   * The result is a 2D array where [i][j] contains the j-th data element of the i-th line.
   */
  input = input.split(  "\n"  );

  var tmp = []; // Temporary array to store the processed input.

  // Iterate over each line of the input.
  for ( var i = 0;   i < input.length;   i++ ) {
    // Split the current line by spaces and store it as a row in the temporary array.
    tmp[i] = input[i].split(  " "  );
  }

  // Return the fully processed 2D array of strings.
  return tmp;
}




/*
 * Function `parseint_array`: Converts all string elements in a 2D array to integers.
 *
 * @param {Array<Array<string>>} arr - A 2D array of strings.
 * @returns {Array<Array<number>>} A new 2D array with all elements converted to integers.
 */
function parseint_array(  arr  ) {
  var ret = []; // Result array to hold integer values.

  // Outer loop: iterate over rows.
  for ( var i = 0;   i < arr.length;   i++ ) {
    ret[i] = []; // Initialize an empty array for the current row.

    // Inner loop: iterate over columns in the current row.
    for ( var j = 0;   j < arr[i].length;   j++ ) {
      // Convert the string element to an integer and store it.
      ret[i][j] = parseInt(  arr[i][j]  );
    }
  }

  // Return the 2D array of integers.
  return ret;
}




/*
 * Function `ccc`: Generates combinations (or permutations, depending on logic)
 * based on `n` and `k` values. This appears to be a custom combination generator.
 *
 * @param {number} n - The upper limit for numbers in the combination.
 * @param {number} k - The number of elements in each combination.
 * @returns {Array<Array<number>>} An array of arrays, where each inner array is a generated pattern.
 */
function ccc(  n,  k  ) {
  var ret = []; // This will store all generated patterns.
  var nowsearch = []; // This holds the current pattern being built.

  // Initialize the first pattern: [1, 2, ..., k].
  for ( var ii = 1;   ii <= k;   ii++ ) {
    nowsearch[ nowsearch.length ] = ii;
  }

  // Main loop to generate subsequent patterns.
  for (  ; ;  ) {
    // Add a copy of the current pattern to the results.
    ret[ ret.length ] = nowsearch.concat();

    // Find the rightmost element that can be incremented.
    var aaa = nowsearch.length - 1; // Index of the element to potentially increment.

    // Iterate from right to left to find the 'pivot' element.
    for ( var iii = nowsearch.length - 1;   iii >= 0;   iii-- ) {
      // If the current element is not at its maximum possible value
      // (n - (number of elements to its right)), then it's a pivot.
      if ( nowsearch[iii] !== n - ( nowsearch.length - iii - 1 ) ) {
        break; // Found the pivot.
      } else {
        // If it's at max, try the element to its left.
        aaa = iii - 1;
      }
    }

    // If a pivot was found (aaa is not -1).
    if ( aaa >= 0 ) {
      // Increment the pivot element.
      var movepoint = nowsearch[aaa];

      // Reconstruct the elements to the right of the pivot.
      // They should be consecutive numbers starting from (pivot + 1).
      for ( var i4 = 0;   i4 < nowsearch.length - aaa;   i4++ ) {
        nowsearch[ aaa + i4 ] = movepoint + i4 + 1;
      }
    } else {
      // No pivot found, meaning all elements are at their maximum possible values (e.g., [n-k+1, ..., n]).
      // All combinations have been generated.
      break;
    }
  }

  // Return the collection of all generated patterns.
  return ret;
}


/*
 *  DO NOT MODIFY THE LINES BELOW THIS COMMENT.
 *  These lines handle reading input from standard I/O and invoking the Main function.
 */
Main( require( "fs" ).readFileSync( "/dev/stdin", "utf8" ) );
// Main( "4 2\n1 1 3 4" ); // Example standard input for testing purposes.