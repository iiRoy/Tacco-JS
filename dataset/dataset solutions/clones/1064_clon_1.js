// This is a Type I clone generated to demonstrate extensive whitespace and comment variations.
// The logical structure, all identifiers, operators, and expressions are preserved exactly.

function   main  ( _stdin )
{
  // First, normalize the input string.
  const stdin = _stdin . trim ( ) . split ( '\n' ) ;

  // The first line of input represents the number of elements 'n'.
  const n = Number ( stdin . shift ( ) ) ;

  // The second line contains the array 'A' elements, separated by spaces.
  // These are parsed into numbers.
  const A = stdin . shift ( ) . split ( ' ' ) . map ( Number ) ;

  // Initialize a single-element array to hold the inversion count.
  // Using an array allows pass-by-reference semantics in JavaScript.
  let cnt = [ 0 ] ;

  // Invoke the mergeSort algorithm to sort array A and count inversions.
  // Parameters: the array, starting index, ending index (exclusive), and the counter.
  mergeSort ( A , 0 , n , cnt ) ;

  // Print the final accumulated inversion count.
  console . log ( cnt [ 0 ] ) ;
} // End of the main function definition.


/**
 * Implements the recursive merge sort algorithm.
 * This function divides the array into two halves, recursively sorts them,
 * and then merges the sorted halves back together, counting inversions.
 *
 * @param {Array<number>} array The array segment currently being processed.
 * @param {number} left The starting index (inclusive) of the current segment.
 * @param {number} right The ending index (exclusive) of the current segment.
 * @param {Array<number>} cnt A reference to the inversion counter.
 */
function mergeSort ( array , left , right , cnt )
{
  // Base case: if the segment has 0 or 1 element, it's already sorted.
  if ( left + 1 < right )
  {
    // Calculate the midpoint to divide the array into two halves.
    const mid = Math . ceil ( ( left + right ) / 2 ) ;

    // Recursively sort the left half of the array.
    mergeSort ( array , left , mid , cnt ) ;

    // Recursively sort the right half of the array.
    mergeSort ( array , mid , right , cnt ) ;

    // Merge the two sorted halves and update the inversion count.
    merge ( array , left , mid , right , cnt ) ;
  }
} // End of mergeSort function.


/*
 * This helper function merges two sorted subarrays back into the main array.
 * During the merge process, it also calculates and accumulates the number of
 * inversions. An inversion occurs when an element from the right subarray is
 * moved into the main array before a remaining element from the left subarray,
 * indicating that the left element is greater than the right element.
 *
 * @param {Array<number>} array The main array being sorted.
 * @param {number} left The starting index of the left subarray.
 * @param {number} mid The ending index of the left subarray (and start of right).
 * @param {number} right The ending index of the right subarray.
 * @param {Array<number>} cnt A reference to the inversion counter.
 */
function merge ( array , left , mid , right , cnt )
{
  // Create temporary arrays for the left and right halves.
  const lefts = array . slice ( left , mid ) ;
  const rights = array . slice ( mid , right ) ;

  // Add sentinel values (Infinity) to the end of each temporary array.
  // This simplifies the merging logic by avoiding checks for array bounds.
  lefts . push ( Infinity ) ;
  rights . push ( Infinity ) ;

  // Initialize pointers for the temporary left and right arrays.
  let leftIdx = 0 ;
  let rightIdx = 0 ;

  // Iterate through the main array segment, placing elements in sorted order.
  for ( let i = left , l = right ; i < l ; i ++ )
  {
    // Compare elements from the left and right temporary arrays.
    if ( lefts [ leftIdx ] <= rights [ rightIdx ] )
    {
      // If the left element is smaller or equal, take it.
      array [ i ] = lefts [ leftIdx ] ;
      leftIdx ++ ;
    }
    else
    {
      // If the right element is smaller, take it.
      array [ i ] = rights [ rightIdx ] ;
      rightIdx ++ ;

      // When an element from the right subarray is chosen, it means all
      // remaining elements in the left subarray (from leftIdx to mid-left)
      // are greater than the current right element. Each of these forms an inversion.
      cnt [ 0 ] += mid - left - leftIdx ;
    }
  }
} // End of merge function definition.


// The program's entry point: reads input from standard input and calls main.
main ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ;