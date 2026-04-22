/* This is a self-executing anonymous function
 * designed to process input from stdin.
 * It reads lines, converts them to numbers,
 * and calculates the sum of their digits.
 */
( function ( input )
{
  // Declare a variable 'p' to store an array of lines from the input.
  var p = input . split ( '\n' ) ;

  // Loop through each line in the 'p' array.
  for ( var i = 0 ; i < p . length ; i ++ )
  {
    // Convert the current line to a number and store it in 'x'.
    var x = Number ( p [ i ] ) ;

    /* Check if the number is zero.
     * If it is, terminate the function execution.
     * This acts as a sentinel value.
     */
    if ( x === 0 )
    {
      return ; // Exit the function.
    }

    // Calculate the sum of digits for the current number 'x'
    // and print the result to the console.
    console . log ( String ( x ) . split ( '' ) . map ( Number ) . reduce ( function ( a , b )
    {
      // The reduce function accumulates the sum of digits.
      return a + b ;
    } ) ) ;
  } // End of the for loop.
} )
/*
 * Immediately invoke the function with the content of /dev/stdin.
 * The 'require' function is used to load the 'fs' module,
 * 'readFileSync' reads the file synchronously,
 * and 'utf8' specifies the encoding.
 */
( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ;