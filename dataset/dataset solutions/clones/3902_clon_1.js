"use strict" ; /* This directive enforces strict mode for the entire script, ensuring safer JavaScript. */


// Define a function named 'permutation' to calculate the number of permutations (nPr).
// It takes two arguments: 'n' (total items) and 'r' (items to choose).
const  permutation  =  ( n ,  r )  =>
{
  // Initialize a variable 'res' to store the result of the permutation calculation.
  let   res   =   1 ;

  // Start a loop that iterates 'r' times.
  // The loop variable 'i' goes from 0 up to (but not including) 'r'.
  for  ( let   i = 0 ;   i < r ;   i ++ )
  {
    // In each iteration, multiply 'res' by (n - i).
    // This calculates n * (n-1) * ... * (n-r+1).
    res  *=  ( n  -  i ) ;
  } // End of the 'for' loop for permutation calculation.

  // Return the final calculated permutation value.
  return   res ;
} ; // End of the 'permutation' function definition.


/*
 * This function, 'combination', calculates the number of combinations (nCr).
 * It leverages the 'permutation' function defined above.
 * The mathematical formula for combinations is nCr = nPr / rPr.
 *
 * @param {number} n - The total number of items.
 * @param {number} r - The number of items to choose.
 * @returns {number} The calculated number of combinations.
 */
const  combination  =  ( n ,  r )  =>
{
  // Calculate nPr and rPr using the 'permutation' function, then divide them.
  return   permutation ( n ,  r )   /   permutation ( r ,  r ) ;
} ; // End of the 'combination' function definition.


/**
 * This is the main execution function of the script.
 * It processes the input, performs calculations, and prints the result.
 *
 * @param {string} arg - The raw input string, typically read from standard input.
 */
const   main   =   arg   =>
{
    // Step 1: Prepare the input string.
    // Remove leading/trailing whitespace and then split the string into an array of lines.
    arg   =   arg . trim ( ) . split ( "\n" ) ;

    // Step 2: Parse the first line of input to get the integer N.
    // The 'parseInt' function converts the string representation of a number to an integer.
    const   N   =   parseInt ( arg [ 0 ] ) ;

    // Step 3: Process the second line of input to create and sort array A.
    // - Split the string by spaces to get individual number strings.
    // - Use 'map' to convert each string number to an integer.
    // - Use 'sort' to arrange the numbers in descending order (largest to smallest).
    const   A   =   arg [ 1 ] . split ( " " ) . map ( n => parseInt ( n ) ) . sort ( ( a , b ) => b - a ) ;


    // Step 4: Initialize variables for finding the element closest to half of the largest number.
    // 'middle' is half of the largest element in array A (which is A[0] after sorting).
    let   middle   =   A [ 0 ]   /   2 ;

    // 'min' is initialized to 'Infinity' to ensure the first comparison always passes.
    let   min   =   Infinity ;

    // 'r' (local to main, unrelated to permutation/combination 'r') will store the result.
    // Based on the original code's logic, this 'r' will ultimately hold the last element of A.
    let   r ;


    // Step 5: Iterate through the array A to determine the value of 'r'.
    // Note: Using 'for...in' for array iteration iterates over indices as strings.
    // Due to 'min' remaining 'Infinity' (it's never updated in the original code),
    // the condition 'Math.abs(middle - A[i]) < min' will always evaluate to true
    // for any finite number A[i].
    for   ( let   i   in   A )
    {
        // This condition will always be met because 'min' is 'Infinity'.
        if ( Math . abs ( middle   -   A [ i ] )   <   min )
        {
            // 'r' is updated with the current element A[i].
            // As this update happens in every iteration, 'r' will effectively
            // store the value of the last element encountered in array A.
            r   =   A [ i ] ;
        }
    }


    // Step 6: Output the result.
    // Print the largest element of A (A[0]) and the final value of 'r',
    // separated by a single space, to the console.
    console . log ( A [ 0 ]   +   " "   +   r ) ;
} ; // End of the 'main' function definition.


// Execute the 'main' function.
// It reads the entire content of '/dev/stdin' (standard input) as a UTF-8 string,
// and passes it as the argument to the 'main' function.
main ( require ( 'fs' ) . readFileSync ( '/dev/stdin' ,   'utf8' ) ) ;