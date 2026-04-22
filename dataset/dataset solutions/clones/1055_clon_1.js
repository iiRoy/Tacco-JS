/*
 * This file contains an implementation of the Merge Sort algorithm
 * and related utilities for processing input data.
 *
 * It includes functions for sorting an array and merging its sub-arrays,
 * along with a main solver function and input/output handling.
 */


// A global counter variable, incremented during the merge operation.
let           cnt           =           0;

/**
 * Implements the recursive merge sort algorithm.
 *
 * @param {Array<number>} xs The array to be sorted.
 * @param {number} left The starting index of the sub-array (inclusive).
 * @param {number} right The ending index of the sub-array (exclusive).
 */
const mergeSort = ( xs , left , right ) => {
  // Base case: if the sub-array has 0 or 1 element, it's already sorted.
  // The condition `left + 1 < right` checks if there are at least two elements.
  if ( left + 1 < right ) {

    // Calculate the middle index to split the array into two halves.
    const mid   =   Math . floor ( ( left + right ) / 2 ) ;

    // Recursively sort the left half.
    mergeSort ( xs , left , mid ) ;

    // Recursively sort the right half.
    mergeSort ( xs , mid , right ) ;

    // Merge the two sorted halves.
    merge ( xs , left , mid , right ) ;

  }
};


/**
 * Merges two sorted sub-arrays back into the main array.
 * This is the core merging step of the merge sort algorithm.
 *
 * @param {Array<number>} xs The main array.
 * @param {number} left The starting index of the first sub-array.
 * @param {number} mid The ending index of the first sub-array
 *                    and the starting index of the second sub-array.
 * @param {number} right The ending index of the second sub-array.
 */
const merge = ( xs , left , mid , right ) => {

  // Calculate the sizes of the two sub-arrays.
  const n1 = mid - left ;
  const n2 = right - mid ;

  // Create temporary arrays for the left sub-array elements.
  var ls = new Array ( n1 ) ;

  // Populate the left temporary array.
  for ( var i = 0 ; i < n1 ; i ++ ) {
    ls [ i ] = xs [ left + i ] ;
  }

  // Add a sentinel value to the end of the left temporary array
  // to simplify comparisons during merging.
  ls [ n1 ] = 1000000000 ;

  // Create temporary arrays for the right sub-array elements.
  var rs = new Array ( n2 ) ;

  // Populate the right temporary array.
  for ( var i = 0 ; i < n2 ; i ++ ) {
    rs [ i ] = xs [ mid + i ] ;
  }

  // Add a sentinel value to the end of the right temporary array.
  rs [ n2 ] = 1000000000 ;

  // Initialize pointers for the temporary arrays.
  var i = 0 ;
  var j = 0 ;

  // Iterate through the main array segment and merge elements.
  for ( var k = left ; k < right ; k ++ ) {
    // Increment the global counter for each comparison/assignment.
    cnt ++ ;

    // Compare elements from the temporary arrays and place the smaller one
    // into the correct position in the main array.
    if ( ls [ i ] < rs [ j ] ) {
      xs [ k ] = ls [ i ] ;
      i ++ ;
    } else {
      xs [ k ] = rs [ j ] ;
      j ++ ;
    }
  }
};


/**
 * The main solver function that orchestrates the sorting process.
 *
 * @param {number} n The number of elements in the array (unused directly, but context implies it's the array length).
 * @param {Array<number>} xs The array to be sorted.
 * @returns {Array<number>} The sorted array.
 */
const solver = ( n , xs ) => {
  // Call mergeSort to sort the entire array from index 0 to n.
  mergeSort ( xs , 0 , n ) ;
  return xs ;
};


// Variable to keep track of the number of input rows processed.
let           rows           =           0;

// Variable to store the number of elements (n) from the first input line.
let           n           =           0;


// Set up the readline interface to handle standard input and output.
const reader = require ( "readline" ) . createInterface ( {
  input : process . stdin , // Read from standard input
  output : process . stdout , // Write to standard output
} ) ;


// Event listener for each line of input received.
reader . on ( "line" , ( line ) => {
  // Increment the row counter.
  rows ++ ;

  // First line of input contains the number of elements 'n'.
  if ( rows === 1 ) {
    // Parse 'n' from the line.
    n = Number ( line . trim ( ) ) ;
  }
  // Subsequent lines (in this case, just the second line) contain the array elements.
  else {
    // Parse the array of numbers from the line.
    const xs = line . trim ( ) . split ( " " ) . map ( x => Number ( x ) ) ;

    // Call the solver function to sort the array.
    const result = solver ( n , xs ) ;

    // Print the sorted array elements, joined by spaces.
    console . log ( result . reduce ( ( acc , x ) => `${ acc } ${ x }` ) ) ;

    // Print the total count of comparisons/assignments made during merging.
    console . log ( cnt ) ;

    // Exit the process after processing the input and printing results.
    process . exit ( 0 ) ;
  }
} ) ;