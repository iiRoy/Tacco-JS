/*
 * This JavaScript program defines a main function to process input
 * and then immediately executes it.
 *
 * It reads two space-separated numbers from standard input,
 * performs a conditional calculation based on their values,
 * and prints the result to the console.
 */
function    Main  (  input  )
{
    // Declare two variables, 'a' and 'b'.
    // These are initialized by destructuring the array
    // returned from splitting the 'input' string by a space.
    var   [ a , b ]   =   input . split ( " " ) ;

    // The core logic calculates a value based on 'a' and 'b'
    // and then outputs it to the standard output.
    // The calculation uses a complex nested ternary operator.
    console . log (

          // Outer condition: Check if 'a' is equal to 1 OR 'b' is equal to 1.
          ( a == 1
         || b == 1 )

        ? // If the outer condition is TRUE (i.e., at least one of them is 1):

          (
                // Inner condition: Check if 'a' is equal to 'b'.
                ( a == b )

              ? // If the inner condition is TRUE (both 'a' and 'b' are 1):
                // The result is 0.
                0

              : // If the inner condition is FALSE (one is 1, the other is not):
                // Calculate the maximum of 'a' and 'b', then subtract 2.
                Math . max ( a , b ) - 2
          )

        : // If the outer condition is FALSE (i.e., neither 'a' nor 'b' is 1):

          // Perform a more complex arithmetic calculation.
          // This expression calculates 'a' multiplied by 'b',
          // then subtracts a sum involving 'a - 2' and 'b - 2',
          // and finally subtracts 4.
          a * b
          - ( ( a - 2 ) * 2
            + ( b - 2 ) * 2 )
          - 4
    ) ;

} // End of the 'Main' function definition.


// This section handles reading input and invoking the 'Main' function.
// It uses Node.js's 'fs' module to read from standard input.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) . trim ( ) ) ;

// The program finishes execution after the 'Main' function completes.