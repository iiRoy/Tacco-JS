/*
 * This file contains various sorting algorithms and a main function
 * to demonstrate their usage and stability properties.
 *
 * All identifiers, operators, and expressions are preserved exactly
 * as in the original code. Only whitespace and comments are modified.
 */

// A placeholder function, currently empty.
// It might be intended for checking stability but is not implemented.
function checkStable( arr )
{
  /*
   * This function is currently empty.
   * No operations are performed within its scope.
   */
}


/**
 * Implements the Bubble Sort algorithm.
 *
 * This function sorts an array of elements based on their second component (index 1),
 * assuming each element is an array or string that can be indexed.
 * It also prints the sorted array and returns a stability indicator.
 *
 * @param {number} lgh - The length of the array to be sorted.
 * @param {Array<Array<string>>} arr - The array of elements to sort.
 * @returns {string} - Always returns "Stable" as Bubble Sort is generally stable.
 */
function bubbleSort( lgh, arr )
{
  var flag = 1; // Flag to indicate if any swaps occurred in a pass.
  var count = 0; // Counter for the number of swaps.

  // Loop continues as long as swaps are being made.
  while ( flag )
  {
    flag = 0; // Reset flag for the current pass.

    // Iterate through the array to compare adjacent elements.
    for ( let i = 0; i < lgh - 1; i++ )
    {
      /*
       * Compare the second component (index 1) of adjacent elements.
       * Number() conversion ensures numerical comparison.
       */
      if ( Number( arr[i][1] ) > Number( arr[i + 1][1] ) )
      {
        // Swap elements if they are in the wrong order.
        [ arr[i], arr[i + 1] ] = [ arr[i + 1], arr[i] ];

        flag = 1;    // Set flag to 1 as a swap occurred.
        count++;     // Increment swap counter.
      }
    }
  }

  // Output the sorted array elements joined by spaces to the console.
  console.log( arr.join( " " ) );

  // Bubble Sort is inherently stable, so we return "Stable".
  return "Stable";
}


/*
 * This function implements the Selection Sort algorithm.
 * It sorts the array `arr` in place based on the second component of its elements.
 *
 * Selection Sort is generally not a stable sorting algorithm.
 */
function selectionSort( lgh, arr )
{
  var count = 0; // Initialize a counter for swaps (though not used for return value).

  // Outer loop iterates from the first element up to the second-to-last.
  for ( let i = 0; i < lgh - 1; i++ )
  {
    var tmp = i; // Initialize `tmp` to the current index `i`. This will hold the index of the minimum element found.

    // Inner loop finds the minimum element in the unsorted part of the array.
    for ( let j = i; j < lgh; j++ )
    {
      // Compare the second component of the current element with the current minimum.
      if ( Number( arr[j][1] ) < Number( arr[tmp][1] ) )
      {
        tmp = j; // Update `tmp` if a smaller element is found.
      }
    }

    // If the minimum element is not at the current position `i`, swap them.
    if ( i != tmp )
    {
      // Perform a destructuring assignment swap.
      [ arr[i], arr[tmp] ] = [ arr[tmp], arr[i] ];

      count++; // Increment the swap counter.
    }
  }

  // Print the sorted array (after selection sort) to the console.
  console.log( arr.join( " " ) );
}


/*
 * The main function of the program.
 * It orchestrates the sorting process and stability check.
 *
 * @param {string} input - The input string containing array length and elements.
 */
function Main( input )
{
  // Split the input string into two parts: array length (a) and array elements (b).
  var [ a, b ] = input.split( "\n" );

  // Create two copies of the array elements for different sorting algorithms.
  // 's' will be used for selection sort, 'b' for bubble sort.
  s = b.split( " " ); // 's' is a copy of the original elements.
  b = b.split( " " ); // 'b' is another copy of the original elements.

  // Call bubbleSort and log its return value (which is "Stable").
  console.log( bubbleSort( a, b ) );

  // Call selectionSort on the 's' array.
  selectionSort( a, s );

  // Compare the results of selectionSort (s) and bubbleSort (b) to check stability.
  // Bubble Sort is stable, so if s and b are identical, selectionSort was also stable for this input.
  console.log( s.join() === b.join() ? "Stable" : "Not stable" );
}


/*
 * Entry point of the script.
 * Reads input from standard input and passes it to the Main function.
 */
Main( require( "fs" ).readFileSync( "/dev/stdin", "utf8" ) );