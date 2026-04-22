/*
 * This JavaScript program calculates a final 'number' based on initial inputs N and K.
 * It simulates a process where 'number' is either doubled or increased by K in each step.
 */
function Main ( input )
{
  // Parse the first line of input to get N, converting it to an integer.
  var   N   =   parseInt ( input . split ( "\n" ) [ 0 ] ) ;

  // Parse the second line of input to get K, also converting it to an integer.
  var   K   =   parseInt ( input . split ( "\n" ) [ 1 ] ) ;


  // Initialize the 'number' variable with a starting value of 1.
  var   number   =   1 ;

  // Begin a loop that will iterate N times.
  // The loop counter 'i' starts from 0 and goes up to N-1.
  for ( var   i   =   0 ;   i   <   N ;   i ++ )
  {
    // This conditional statement checks which operation to perform on 'number'.
    // The expression (number * 2 - number) is mathematically equivalent to 'number',
    // but is kept in its original form as per Type I cloning rules.
    if ( ( number   *   2   -     number )   <=   K )
    {
      // If the condition is met, 'number' is doubled.
      number   =   number   *   2 ;
    }
    else
    {
      // Otherwise (if the condition is false), K is added to 'number'.
      number   +=   K ;
    }
    // End of the conditional block for the current iteration.
  }

  // After the loop completes, the final calculated 'number' is printed to the console.
  console . log ( number ) ;
}

// Call the Main function with input read from standard input.
/*
 * This line reads the entire content of the standard input stream (/dev/stdin)
 * as a UTF-8 encoded string and passes it as the 'input' argument to the Main function.
 * The 'fs' module is used for file system operations, specifically 'readFileSync'.
 */
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" ,   "utf8" ) ) ;