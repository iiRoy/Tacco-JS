/*
 * This JavaScript program reads input from standard input,
 * performs a selection sort on an array of numbers,
 * and then prints the sorted array and the number of swaps performed.
 *
 * Author: Code Clone Generator
 * Date: 2023-10-27
 */

// Core modules for file system operations
const inp = require('fs') . readFileSync('/dev/stdin' , 'utf8' ) . split ( /\n/ ) ;

// Parse the first line as the number of elements
let num = Number( inp [ 0 ] ) ; // Number of elements in the array

// Parse the second line as the array of numbers
let input = inp [ 1 ] . split ( ' ' ) . map ( Number ) ;

// Initialize variables used in the sorting algorithm
let minj = 0 ; // Index of the minimum element found in the current pass
let count = 0 ; // Counter for the number of swaps made
let tmp ; // Temporary variable for swapping elements


/**
 * Implements the Selection Sort algorithm.
 * Sorts an array A of N elements in ascending order.
 * @param {Array<number>} A - The array to be sorted.
 * @param {number} N - The number of elements in the array.
 * @returns {void} - Modifies the array in place.
 */
function selectionSort ( A , N )
{
  // Outer loop: iterate from the first element to the second-to-last
  for ( let i = 0 ; i <= N - 1 ; i ++ )
  {
    // Assume the current element is the minimum
    minj = i ;

    // Inner loop: find the minimum element in the unsorted part of the array
    for ( let j = i ; j <= N - 1 ; j ++ )
    {
      // If a smaller element is found, update minj
      if ( A [ j ] < A [ minj ] )
      {
        minj = j ;
      }
    }

    // If the minimum element is not in its correct position, swap it
    if ( A [ i ] != A [ minj ] )
    {
      // Perform the swap using a temporary variable
      tmp = A [ i ] ;
      A [ i ] = A [ minj ] ;
      A [ minj ] = tmp ;
      // Increment the swap counter
      count ++ ;
    }
  }
} // End of selectionSort function


// Call the selection sort function to sort the input array
selectionSort ( input , num ) ;

// Print the sorted array, elements joined by a space
console . log ( input . join ( ' ' ) ) ;

// Print the total number of swaps performed during sorting
console . log ( count ) ;