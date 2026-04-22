/* This is a Type I clone of the original JavaScript code.
 * It maintains exact structural and logical equivalence.
 * Only whitespace and comments have been altered significantly
 * to create a visually distinct but functionally identical version.
 */

"use strict" // Enforces strict mode for cleaner code.


/**
 * The main function that processes the input.
 * @param {string} inputt - The raw input string from stdin.
 */
const Main = ( inputt ) => { /* Start of the Main function definition */


  // Process the input string: split by space, then convert each part to a number.
  const Array = inputt . split ( " " ) . map ( ( ele ) => { return ele - 0 } ) ;


  // Extracting and converting the numerical values from the processed array.
  const A = Array [ 0 ] - 0 ; // First number
  const B = Array [ 1 ] - 0 ; // Second number
  const K = Array [ 2 ] - 0 ; // Third number, often referred to as 'K' in problem statements.


  // This comment was originally "iは配列番号K", let's rephrase it.
  /* 'i' will be used as a loop counter, not directly an array index 'K'.
   * It iterates from A to B to populate resultArray.
   */

  // Initialize an empty array to store the sequence of numbers.
  const resultArray = [ ] ;


  // Populate resultArray with numbers from A to B, inclusive.
  for ( let i = A ; i <= B ; i += 1 ) {

    resultArray . push ( i ) ; // Add the current number 'i' to the array.

  } /* End of loop for populating resultArray */


  // Calculate the last valid index of resultArray.
  const index = resultArray . length - 1 ;


  // Print the first K elements of resultArray.
  for ( let j = 0 ; j <= K - 1 ; j += 1 ) {

    console . log ( resultArray [ j ] ) ; // Output the element at index 'j'.

  } /* End of loop for first K elements */


  // Print the last K elements of resultArray.
  // This part handles cases where A and B might be close,
  // potentially overlapping with the first K elements.
  for ( let k = index - K + 1 ; k <= index ; k += 1 ) {

    // Ensure we don't print elements already printed or out of bounds.
    // The problem statement implies a specific output order, so direct printing is fine.
    // If K is large, this might print elements already printed by the previous loop.
    // The problem constraints usually handle this or specify desired behavior.
    console . log ( resultArray [ k ] ) ; // Output the element at index 'k'.

  } /* End of loop for last K elements */


} /* End of the Main function definition */



// --- Program execution starts here ---

// Read input from standard input (usually a file in competitive programming environments).
// Then, pass the read content to the Main function for processing.
Main ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ;

// --- End of program ---