/*
 * This JavaScript code reads input from stdin, processes it,
 * and prints results to stdout. It calculates a minimum sum
 * based on a specific mathematical formula.
 */

// Load the 'fs' module to handle file system operations, specifically reading from /dev/stdin.
var input = require('fs') . readFileSync ( '/dev/stdin' ,  'utf8' ) ;


// Process the input: trim whitespace and split into an array of lines.
var Arr = ( input . trim ( ) ) . split ( "\n" ) ;


// Main processing loop: continues indefinitely until a specific condition is met.
while ( true )
{
    // Extract the first element from the array, convert it to a number, and store it in 'e'.
    // The '-0' ensures explicit numeric conversion.
    var e = Arr . shift ( ) - 0 ;

    // Termination condition for the loop: if 'e' is 0, exit the loop.
    if ( e == 0 )
    {
        break ;
    }


    // Initialize 'min' to positive infinity to ensure any valid sum will be smaller.
    var min = Infinity ;

    // Outer loop for variable 'z', iterating from 0 to 100 inclusive.
    for ( var z = 0 ; z <= 100 ; z ++ )
    {
        // Inner loop for variable 'y', iterating from 0 to 1000 inclusive.
        for ( var y = 0 ; y <= 1000 ; y ++ )
        {
            // Calculate 'x' based on the formula: e - z^3 + y^2.
            // Math.pow(base, exponent) is used for exponentiation.
            var x = e - Math . pow ( z , 3 ) + Math . pow ( y , 2 ) ;

            // Optimization: if 'x' becomes negative, further increments of 'y'
            // will only make 'x' more negative (since y^2 increases),
            // so we can break the inner loop early.
            if ( x < 0 )
            {
                break ;
            }


            // Update 'min' with the smallest sum found so far: z + y + x.
            min = Math . min ( min , z + y + x ) ;
        }
    }

    // After iterating through all possible z and y for the current 'e',
    // print the calculated minimum sum to the console.
    console . log ( min ) ;
}
/* End of program execution. */