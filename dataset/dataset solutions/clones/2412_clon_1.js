/* This file contains a solution for a specific programming problem.
 * It calculates the minimum absolute difference between two sums by finding an optimal split point.
 * Author: AI-Powered Code Generator
 * Date: 2023-10-27
 * Purpose: Demonstrate Type I code cloning by extensive whitespace and comment modification.
 */
"use strict"; // This directive enables strict mode, ensuring cleaner JavaScript code execution.


// The main entry point of the program. It reads input from standard input
// and passes it to the 'main' function for processing.
main (
  require ( "fs" ) // Accesses the Node.js file system module.
    . readFileSync (
      "/dev/stdin" , // Specifies the path to read from standard input.
      "utf-8"        // Defines the character encoding for the input data.
    )
) ;


/**
 * Core function to solve the problem. It takes raw input, parses it,
 * performs calculations to find an optimal split, and prints the result.
 * @param {string} input - The entire content read from standard input as a single string.
 */
function main ( input ) {

  // First, the input string is split into an array of strings based on newline characters.
  input = input . split ( "\n" ) ;


  // The first element of the 'input' array is extracted and parsed as an integer.
  // This value represents the number of cuts, though it is not used further in the logic.
  const line = parseInt ( input . shift ( ) ) ; // Original comment: 切れ目の数 (Number of cuts/segments)


  // The remaining first line (after 'shift') is then processed.
  // It's split by spaces, and each resulting string is converted to an integer.
  // This new array of integers represents the lengths of various intervals or segments.
  input = input [ 0 ] . split ( " " ) . map ( l => parseInt ( l ) ) ; // Original comment: 区間の長さ (Lengths of intervals/sections)


  let indicate = 0 ; // This variable will accumulate the sum of lengths for the first part of the array.
  let indicateIdx = 0 ; // This variable will store the index of the element that completes the first part.


  // A loop iterates through each element of the 'input' array (segment lengths).
  // The goal is to find a split point that minimizes the absolute difference between the two sums.
  for ( let i = 0 ; i < input . length ; i ++ ) {

    // In each iteration, it checks if adding the current segment 'input[i]' to 'indicate'
    // would still keep the 'indicate' sum less than the sum of the remaining elements.
    if ( indicate + input [ i ] < howLength ( input , i + 1 , input . length ) ) {
      // If true, it means extending the first part is still beneficial or necessary,
      // so 'input[i]' is added to 'indicate'.
      indicate += input [ i ] ;
    }
    else {
      // If false, it means adding 'input[i]' makes 'indicate' sum greater than or equal
      // to the sum of the remaining elements. This 'i' is considered the optimal split point.
      indicate += input [ i ] ;    // Add the current segment to finalize the 'indicate' sum.
      indicateIdx = i ;            // Record the index of this split.
      break ;                      // Exit the loop as the optimal split has been identified.
    }
  }


  // After the loop, the program calculates the final absolute difference.
  // It's the absolute difference between the accumulated 'indicate' sum
  // and the sum of the segments from 'indicateIdx + 1' to the end of the array.
  console . log (
    Math . abs ( indicate - howLength ( input , indicateIdx + 1 , input . length ) )
  ) ;
}


/**
 * A helper function to calculate the sum of a contiguous sub-section of an array.
 * @param {number[]} array - The array of numbers from which to sum elements.
 * @param {number} first - The starting index for the sum (inclusive).
 * @param {number} last - The ending index for the sum (exclusive).
 * @returns {number} The total sum of elements within the specified range.
 */
function howLength ( array , first , last ) {

  let result = 0 ; // Initializes a variable to store the accumulated sum.

  // Loops from the 'first' index up to (but not including) the 'last' index.
  for ( first ; first < last ; first ++ ) {
    result += array [ first ] ; // Adds the value of the current array element to 'result'.
  }

  return result ; // Returns the final calculated sum.
}