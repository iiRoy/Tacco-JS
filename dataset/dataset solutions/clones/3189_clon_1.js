'use strict'
// This script processes a list of numbers to find their Greatest Common Divisor (GCD).
// It reads input, sorts it using a custom binary search insertion sort,
// and then computes the GCD of all numbers.

/**
 * Main function to orchestrate the program flow.
 * @param {string} input - The raw string input from stdin.
 */
function Main ( input )
{
  // First, parse the input string into an array of numbers.
  input = readAsNumArray ( input ) ;

  // Extract the first number, which represents N, the count of subsequent numbers.
  // This modifies the 'input' array, removing N from its beginning.
  var N = input . shift ( ) ;

  // Sort the remaining numbers using a custom binary search-based insertion sort.
  // This helps in processing, though not strictly necessary for GCD calculation itself.
  input = binarySearchSort ( input ) ;

  // Assign the sorted array to a more descriptive variable name.
  var A = input ;

  // Handle the edge case where N is 1. The GCD of a single number is the number itself.
  if ( N === 1 )
  {
    console . log ( A [ 0 ] ) ; // Output the single number.
    return ; // Exit the function early.
  }

  // Initialize the GCD with the first element of the sorted array.
  var g = A [ 0 ] ;

  // Iterate through the rest of the array to compute the GCD of all elements.
  // The GCD of multiple numbers is computed iteratively: GCM(a, b, c) = GCM(GCM(a,b), c).
  for ( let i = 0 ; i < N - 1 ; i ++ )
  {
    // Update 'g' by finding the GCD of the current 'g' and the next number in the array.
    g = GCM ( A [ i + 1 ] , g ) ;
  }

  // Finally, print the calculated greatest common divisor.
  console . log ( g ) ;
}


/**
 * Computes the Greatest Common Divisor (GCD) of two non-negative integers using the Euclidean algorithm.
 * This function is named GCM in the original code, possibly a typo for GCD.
 * @param {number} a - The first integer.
 * @param {number} b - The second integer.
 * @returns {number} The greatest common divisor of 'a' and 'b'.
 */
function GCM ( a , b )
{
  // The Euclidean algorithm continues as long as both numbers are non-zero.
  while ( ! ( a === 0 || b === 0 ) )
  {
    // If 'a' is greater than 'b', replace 'a' with 'a' modulo 'b'.
    if ( a > b )
    {
      a = a % b ;
    }
    // Otherwise (if 'b' is greater than or equal to 'a'), replace 'b' with 'b' modulo 'a'.
    else
    {
      b = b % a ;
    }
  }
  // When one of the numbers becomes zero, the other number is the GCD.
  // Math.max is used to pick the non-zero value.
  var m = Math . max ( a , b ) ;
  return m ; // Return the calculated GCD.
}


/**
 * Parses a string input containing numbers (potentially separated by spaces or newlines)
 * into an array of integers.
 * @param {string} input - The raw string input.
 * @returns {number[]} An array of parsed numbers.
 */
function readAsNumArray ( input )
{
  // Initialize an empty array to store the parsed integers.
  var I = [ ] , i = 0 ;

  // Regular expression to match an integer (positive or negative).
  var checkNum = / ^ - * \d + / ;

  // Regular expression to match one or more spaces or newlines.
  var checkSpace = / + | \n + / ;

  // Loop as long as there's content left in the input string.
  while ( input . length > 0 )
  {
    // Try to match a number at the beginning of the input string.
    if ( input . match ( checkNum ) !== null )
    {
      // If a number is found, parse it as an integer and add it to the array.
      I [ i ] = parseInt ( input . match ( checkNum ) [ 0 ] ) ;

      // Remove the matched number from the input string.
      input = input . replace ( checkNum , "" ) ;

      i ++ ; // Increment the index for the next number.

      continue ; // Continue to the next iteration to look for more numbers.
    }

    // If no number was found, it must be whitespace. Remove it.
    input = input . replace ( checkSpace , "" ) ;

    continue ; // Continue to the next iteration.
  }
  // After processing all numbers, return the array of integers.
  // The assignment 'input=I' here is superfluous as 'input' is local,
  // but it's part of the original structure.
  return input = I ;
}


/**
 * Sorts an array of numbers using an insertion sort algorithm that employs binary search
 * to find the correct insertion position for each element.
 * This can be more efficient than a simple linear insertion sort for larger arrays.
 * @param {number[]} arr - The array of numbers to be sorted.
 * @returns {number[]} A new array containing the sorted numbers.
 */
function binarySearchSort ( arr )
{
  var n = arr . length ; // Get the length of the input array.
  var newArr = [ ] ; // Initialize an empty array to build the sorted list.

  // Iterate through each element of the original array.
  for ( let i = 0 ; i < n ; i ++ )
  {
    // For binary search: 'd' for 'down' (start of search range),
    // 'u' for 'up' (end of search range), 'm' for 'middle'.
    var d = 0 , m = 0 , u = newArr . length - 1 ; // Note: 'u' depends on newArr's current size.

    // Calculate initial middle point for binary search.
    // This initial calculation can be outside the loop if newArr is empty, but
    // for consistency with the loop's structure it's here.
    m = Math . floor ( ( d + u ) / 2 ) ;

    // Perform binary search to find the correct insertion point in `newArr`.
    // The loop continues as long as the 'down' pointer is not greater than the 'up' pointer.
    while ( ! ( d > u ) )
    {
      // If the element in the middle of `newArr` is less than the current element from `arr`,
      // then the insertion point must be in the upper half.
      if ( newArr [ m ] < arr [ i ] )
      {
        d = m + 1 ; // Move the 'down' pointer.
      }
      // Otherwise, the insertion point is in the lower half or at the middle itself.
      else
      {
        u = m - 1 ; // Move the 'up' pointer.
      }
      // Recalculate the middle point for the next iteration.
      m = Math . floor ( ( d + u ) / 2 ) ;
    }
    // Once the binary search completes, 'm + 1' (or 'd') is the correct insertion index.
    // Insert the current element from `arr` into `newArr` at the found position.
    newArr . splice ( m + 1 , 0 , arr [ i ] ) ;
  }
  return newArr ; // Return the newly created and sorted array.
}


// This is the entry point of the program.
// It reads the entire content of '/dev/stdin' as a UTF-8 string,
// and then passes it to the 'Main' function for processing.
Main ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ;