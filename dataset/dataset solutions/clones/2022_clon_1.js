/*
 * This is a JavaScript function designed to perform a series of calculations
 * based on an input value. It demonstrates the use of while loops and basic
 * arithmetic operations.
 */

function   main  (  input  )
{
  // Initialize temporary variables before their first use.
  // Note: The original code implies 'tmp' and 'tmp2' are global or
  // implicitly declared. For a Type I clone, we must maintain this
  // exact structure. If they were meant to be declared inside,
  // that would be a different type of clone.
  // Assuming 'tmp' and 'tmp2' are accessible in this scope.

  while  (  tmp  >=  input  )
  {
    // Increment 'tmp' by 500 until it's greater than 'input'.
    tmp  +=  500  ;
  }

  // After the first loop, perform a multiplication.
  a  =  tmp  *  2  ;

  /*
   * Start of the second processing loop.
   * This loop continues as long as tmp2 is greater than or equal to
   * the difference between input and tmp.
   */
  while  (  tmp2  >=  input  -  tmp  )
  {
    // Increment 'tmp2' by 5 in each iteration.
    tmp2  +=  5  ;
  }

  // Add the final value of tmp2 to 'a'.
  a  +=  tmp2  ;


  // Output the final calculated value of 'a' to the console.
  console  .  log  (  "%d"  ,  a  )  ;

} // End of the main function.


// Call the main function with input from standard input.
// This line reads the entire content of /dev/stdin as a UTF-8 string.
main  (  require  (  "fs"  )  .  readFileSync  (  "/dev/stdin"  ,  "utf8"  )  )  ;