/*
 * This is a Type I clone of a JavaScript program.
 * It determines if the product of two numbers is even or odd.
 * The input is expected to be two space-separated integers.
 */

// Define the main function that processes the input
function     main  (  input  )
{
  // Split the input string by space to get individual arguments
  const args = input.split(' ');

  // Parse the first argument as an integer with base 10
  const   a    =    parseInt( args[0] , 10 )  ;

  // Parse the second argument as an integer with base 10
  const   b    =    parseInt( args[1] , 10 )  ;


  // Check if the product of 'a' and 'b' is even or odd
  if    (   (  a  *  b  )   %   2   ===   0   )
  {
    // If the remainder when divided by 2 is 0, it's even
    console.log(   'Even'   )   ;
  }
  else
  {
    // Otherwise, it's odd
    console.log(   'Odd'   )   ;
  }

} // End of main function


// Execute the main function with input read from standard input
// This part reads the entire file content from /dev/stdin as UTF-8
main(  require('fs').readFileSync(  '/dev/stdin'  ,  'utf8'  )  )  ;

// EOF