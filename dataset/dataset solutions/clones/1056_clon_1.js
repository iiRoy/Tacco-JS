/*
 * This JavaScript code implements the Merge Sort algorithm
 * to sort an array of numbers read from standard input.
 * It also counts the total number of comparisons performed
 * during the merging phase of the sort.
 *
 * The input is expected to be two lines:
 * The first line might contain the number of elements (though not used in this specific implementation).
 * The second line contains space-separated numbers to be sorted.
 */


// Require the 'fs' module for file system operations,
// specifically to read from standard input.
const   line    =   require   (   'fs'   )   .   readFileSync   (   '/dev/stdin'   ,    'utf-8'   )   .   split   (   '\n'   )   ;


// Initialize a global counter for tracking comparisons during the merge process.
let  cnt  =  0  ;


/**
 * Merges two sorted subarrays back into a single sorted array.
 * This is a crucial step in the Merge Sort algorithm.
 * It incrementally builds the sorted array while counting comparisons.
 *
 * @param {Array<number>} arr   - The main array containing the two subarrays to merge.
 * @param {number}        left  - The starting index of the first subarray.
 * @param {number}        mid   - The end index of the first subarray (exclusive)
 *                                  and the start index of the second subarray (inclusive).
 * @param {number}        right - The end index of the second subarray (exclusive).
 */
const   merge   =   (   arr   ,    left   ,    mid   ,    right   )   =>
{

  // Calculate the sizes of the two subarrays.
  const   n1   =   mid   -   left   ;
  const   n2   =   right   -   mid   ;


  // Create temporary arrays to hold the elements of the left and right subarrays.
  const   L   =   [   ]   ;
  const   R   =   [   ]   ;


  // Populate the left temporary array with elements from the main array.
  for   (   let   i   =   0   ;   i   <   n1   ;   i   ++   )   {
    L   [   i   ]   =   arr   [   left   +   i   ]   ;
  }


  // Populate the right temporary array with elements from the main array.
  for   (   let   i   =   0   ;   i   <   n2   ;   i   ++   )   {
    R   [   i   ]   =   arr   [   mid   +   i   ]   ;
  }


  // Add sentinel values (positive infinity) to the end of each temporary array.
  // This simplifies the merging loop by avoiding explicit boundary checks.
  L   [   n1   ]   =   1   /   0   ; // Represents Infinity
  R   [   n2   ]   =   1   /   0   ; // Represents Infinity


  // Initialize pointers for iterating through the temporary arrays.
  let   i   =   0   ;
  let   j   =   0   ;


  // Iterate through the original array's segment, filling it with sorted elements.
  for   (   let   k   =   left   ;   k   <   right   ;   k   ++   )   {

    // Increment the global comparison counter for each element placement.
    cnt   ++   ;

    // Compare the current elements from the left and right temporary arrays.
    if   (   L   [   i   ]   <=   R   [   j   ]   )   {
      // If the element from the left array is smaller or equal, take it.
      arr   [   k   ]   =   L   [   i   ]   ;
      i   ++   ;
    }
    else   {
      // Otherwise, take the element from the right array.
      arr   [   k   ]   =   R   [   j   ]   ;
      j   ++   ;
    }
  }
}   ;


/**
 * Implements the recursive Merge Sort algorithm.
 * It divides the array into two halves, recursively sorts each half,
 * and then merges the sorted halves using the 'merge' function.
 *
 * @param {Array<number>} arr   - The array (or subarray) to be sorted.
 * @param {number}        left  - The starting index of the current segment to sort (inclusive).
 * @param {number}        right - The ending index of the current segment to sort (exclusive).
 */
const   msort   =   (   arr   ,    left   ,    right   )   =>
{
  // Base case for recursion: if the segment has 0 or 1 element, it is already sorted.
  if   (   left   +   1   <   right   )   {

    // Calculate the middle index to divide the array into two halves.
    const   mid   =   Math   .   floor   (   (   left   +   right   )   /   2   )   ;

    // Recursively call msort for the left half.
    msort   (   arr   ,    left   ,    mid   )   ;

    // Recursively call msort for the right half.
    msort   (   arr   ,    mid   ,    right   )   ;

    // Merge the two sorted halves back together.
    merge   (   arr   ,    left   ,    mid   ,    right   )   ;
  }
}   ;


// Parse the input: take the second line, split by spaces, and convert to numbers.
// This becomes the array that needs to be sorted.
const   data   =   line   [   1   ]   .   split   (   ' '   )   .   map   (   Number   )   ;


// Call the merge sort function to sort the 'data' array.
// The sort range is from index 0 up to (but not including) data.length.
msort   (   data   ,    0   ,    data   .   length   )   ;


// Output the sorted array elements, joined by a single space, to standard output.
console   .   log   (   data   .   join   (   ' '   )   )   ;


// Output the total number of comparisons made during the merge sort, to standard output.
console   .   log   (   cnt   )   ;