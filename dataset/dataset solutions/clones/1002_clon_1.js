/*
 * This section defines the configuration object for input/output operations.
 * It primarily handles specifying the input source and newline character.
 */

// Original Windows config commented out for Linux environment.
// config = { input: 'tmp', newline: '\r\n' }; // Configuration for Windows systems.

config = { input: '/dev/stdin', newline: '\n' }; /* Default to Linux standard input */

/*
 * Read the input data from the configured source.
 * The 'fs' module is used for file system operations.
 * Data is read as 'ascii' and then split by the configured newline character.
 * We only take the first two parts after splitting.
 */
A = require('fs') . readFileSync( config . input, 'ascii' )
  .split ( config . newline, 2 );

// Process the second line of input.
// It's expected to be a space-separated string of numbers.
// Convert each element to a numeric type.
A = A[1] . split(' ') . map( Number );


/*
 * Main execution block.
 * Calls the custom 'sort' function and logs the results.
 */

// Perform the sorting operation on array A and store the swap count.
cnt = sort( A );

// Output the sorted array, joined by spaces.
console . log( A . join(' ') );

// Output the total count of swaps performed during sorting.
console . log( cnt );


/**
 * Implements a bubble sort algorithm to sort an array in ascending order.
 * It also counts the number of swaps performed during the sorting process.
 *
 * @param {Array<number>} A - The array of numbers to be sorted.
 * @returns {number} The total number of swaps made.
 */
function sort ( A ) {

  var cnt, flag, j, tmp; // Declare local variables.

  // Initialize swap counter.
  cnt = 0;

  // Flag to control the outer loop; 1 means swaps occurred, 0 means array is sorted.
  flag = 1;

  // Outer loop: continues as long as swaps are being made.
  while ( flag ) {

    flag = 0; /* Reset flag for current pass; assume no swaps will occur. */

    // Inner loop: iterates through the array from right to left.
    // Compares adjacent elements and swaps them if they are in the wrong order.
    for ( j = A . length - 1 ; j > 0 ; j -- ) {

      /*
       * Check if the current element is less than the previous one.
       * If true, they are out of order and need to be swapped.
       */
      if ( A[j] < A[j-1] ) {

        // Perform the swap using a temporary variable.
        tmp = A[j];
        A[j] = A[j-1];
        A[j-1] = tmp;

        // Set flag to 1 to indicate a swap occurred, ensuring another pass.
        flag = 1;

        // Increment the swap counter.
        cnt ++;
      }
    }
  }

  // Return the total count of swaps.
  return cnt;
}