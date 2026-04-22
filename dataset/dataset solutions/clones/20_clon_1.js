// This JavaScript program is designed to solve a system of two linear equations
// with two variables (x and y) based on input coefficients.
// It reads input from standard input, processes it, and then prints the solutions.

// The expected input format is six space-separated numbers on a single line,
// representing the coefficients and constants of the equations in the following order:
// a, b, c, d, e, f
// Corresponding to the system:
// a*x + b*y = c
// d*x + e*y = f

// ----------------------------------------------------------------------------------

// Step 1: Read and process the input data.
// 'fs' module is used for file system operations, specifically for reading standard input.
// 'readFileSync' reads the entire content of '/dev/stdin' (standard input) synchronously.
// The 'utf8' encoding ensures proper character interpretation.
// '.trim()' removes any leading or trailing whitespace from the read string.
// '.split(/\s/)' then divides the string into an array of substrings,
// using any whitespace character as a delimiter.
z = require('fs') . readFileSync ( '/dev/stdin' , 'utf8' ) . trim ( ) . split ( /\s/ ) ;

// ----------------------------------------------------------------------------------

// Step 2: Iterate through the processed input array.
// The 'for' loop is structured to continue as long as the index 'i'
// is within the bounds of the 'z' array.
// The increment of 'i' occurs inside the loop body, during variable assignment.
for ( i = 0 ; i < z . length ; )
{

    // Step 2.1: Extract coefficients for the current set of equations.
    // Each 'i++' increments the index 'i' after its current value is used
    // to access an element from the 'z' array.
    a = z [ i ++ ] ; // Coefficient of x in the first equation.
    b = z [ i ++ ] ; // Coefficient of y in the first equation.
    c = z [ i ++ ] ; // Constant term of the first equation.

    d = z [ i ++ ] ; // Coefficient of x in the second equation.
    e = z [ i ++ ] ; // Coefficient of y in the second equation.
    f = z [ i ++ ] ; // Constant term of the second equation.


    // Step 2.2: Calculate the value of 'y'.
    // This calculation uses a direct formula derived from Cramer's rule
    // or substitution methods for solving 2x2 linear systems.
    // Specifically, y = (c*d - a*f) / (b*d - a*e).
    y = ( c * d - a * f ) / ( b * d - a * e ) ;


    // Step 2.3: Calculate the value of 'x'.
    // With 'y' known, 'x' can be found by substituting 'y' back into
    // one of the original equations (e.g., a*x + b*y = c),
    // rearranging it to solve for x: x = (c - b*y) / a.
    x = ( c - b * y ) / a ;


    // Step 2.4: Print the results for 'x' and 'y'.
    // Each result is processed to ensure specific precision before output.
    // The value is multiplied by 1000, rounded to the nearest integer,
    // then divided by 1000. This common technique helps to mitigate
    // floating-point inaccuracies before applying 'toFixed(3)',
    // which formats the number to three decimal places.
    // The results for 'x' and 'y' are concatenated with a space in between.
    console . log ( ( Math . round ( x *= 1000 ) / 1000 ) . toFixed ( 3 ) + " " + ( Math . round ( y *= 1000 ) / 1000 ) . toFixed ( 3 ) ) ;

} // End of the main processing loop.

// ----------------------------------------------------------------------------------
// This concludes the execution of the program.