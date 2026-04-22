/*
 * This file contains a JavaScript program designed to perform
 * a specific sequence of calculations and comparisons.
 * It reads input from standard input, processes numerical data,
 * and prints a series of "Yes" or "No" answers to standard output.
 *
 * This version includes extensive whitespace variations and comments
 * to demonstrate a Type I code clone, adhering strictly to the rule
 * that only whitespace and comments can be altered, while all
 * operational code elements remain identical.
 */

"use strict" ; // Enforce strict parsing and error handling in the script.


// Define the main function that processes the input argument.
const main = ( arg ) =>
{

  // Step 1: Prepare the input string.
  // Trim any leading/trailing whitespace and split the string into an array of lines.
  arg = arg . trim ( ) . split ( "\n" ) ;


  // Step 2: Parse initial parameters N and K from the first line of input.
  // The first line is expected to contain two space-separated integers.

  const N = parseInt ( arg [ 0 ] . split ( " " ) [ 0 ] ) ; // Extract N (total number of elements).

  const K = parseInt ( arg [ 0 ] . split ( " " ) [ 1 ] ) ; // Extract K (window size for product calculation).


  // Step 3: Parse the array A from the second line of input.
  // This line contains space-separated integers which are mapped to an array of numbers.
  const A = arg [ 1 ] . split ( " " ) . map ( n => parseInt ( n ) ) ;


  // Initialize a temporary variable to hold the rolling product.
  let temp = 1 ;

  // Initialize an empty list to store all calculated rolling products.
  let list = [ ] ;


  // Step 4: Calculate the product of the first K elements.
  // This forms the initial window's product.
  for ( let i = 0 ; i < K ; i ++ )
  {
    temp *= A [ i ] ; // Multiply 'temp' by each element in the initial window.
  }

  // After calculating the first product, add it to our list.
  list . push ( temp ) ;


  // Step 5: Calculate the subsequent rolling products.
  // Iterate from the K-th element up to (N-1)-th element.
  // For each step, divide by the element leaving the window and multiply by the new element entering.
  for ( let i = K ; i < N ; i ++ )
  {
    temp /= A [ i - K ] ; // Remove the contribution of the element that just left the window.
    temp *= A [ i ] ;     // Add the contribution of the new element entering the window.

    list . push ( temp ) ; // Store the newly calculated rolling product.
  }


  // Step 6: Prepare an array to store the "Yes" / "No" answers.
  let answer = [ ] ;


  // Get the total number of rolling products calculated.
  let n = list . length ;


  // Step 7: Compare adjacent rolling products to determine if the product increased.
  // Start from the second product (index 1) and compare with its predecessor.
  for ( let i = 1 ; i < n ; i ++ )
  {
    // If the current product is less than or equal to the previous product, it did not increase.
    if ( list [ i ] <= list [ i - 1 ] )
    {
      answer . push ( "No" ) ; // The product did not strictly increase.
    }
    else // Otherwise, the current product is strictly greater than the previous.
    {
      answer . push ( "Yes" ) ; // The product increased.
    }
  }


  // Step 8: Output the final results.
  // Join all "Yes" / "No" strings with newline characters and print to console.
  console . log ( answer . join ( "\n" ) ) ;

} // End of the main function.


/*
 * This is the entry point of the script.
 * It reads the entire content of standard input as UTF-8 encoded text
 * and passes it as an argument to the 'main' function.
 * This setup is common for competitive programming environments.
 */
main ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ;