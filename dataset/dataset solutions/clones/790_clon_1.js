// This JavaScript program processes numerical input from standard input.
// It aims to find the minimum sum of three non-negative integers (x + y + z)
// such that a given input number 'e' satisfies the equation:
// e = x + y^2 + z^3.

const input = require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) . trim ( ) ;
// ^ The 'fs' module is used to access the file system.
//   readFileSync reads the content of '/dev/stdin' (standard input) synchronously.
//   The 'utf8' encoding is specified.
//   .trim() removes any leading or trailing whitespace from the read string.

// Split the entire input string into an array of individual lines.
const lines = input . split ( '\n' ) ;


// Iterate over each line obtained from the input.
for ( let i = 0 ; i < lines . length ; i ++ )
{
    // Convert the current line (which is a string) into a number.
    // This 'e' represents the target value for the current iteration.
    e = Number ( lines [ i ] ) ;

    // Process only if the number 'e' is not zero.
    // A value of zero might act as a sentinel or indicate end of input.
    if ( e !== 0 )
    {
        // Initialize 'min' with the current value of 'e'.
        // 'min' will store the smallest sum (x + y + z) found that satisfies the condition.
        let min = e ;

        // Determine the maximum possible integer value for 'z'.
        // Since z^3 must be less than or equal to 'e', 'z' must be less than or equal to the cube root of 'e'.
        let maxZ = Math . floor ( Math . cbrt ( e ) ) ;

        // Begin the outermost loop, iterating for 'z' from 0 up to 'maxZ'.
        for ( let z = 0 ; z <= maxZ ; z ++ )
        {
            // Calculate the maximum possible integer value for 'y' for the current 'z'.
            // y^2 must be less than or equal to 'e - z^3'. So, 'y' <= sqrt(e - z^3).
            let maxY = Math . floor ( Math . sqrt ( e - z * z * z ) ) ;

            // Begin the inner loop, iterating for 'y' from 0 up to 'maxY'.
            for ( let y = 0 ; y <= maxY ; y ++ )
            {
                // Calculate the value of 'x' using the derived equation: x = e - y^2 - z^3.
                // This 'x' is the remaining part of 'e' after subtracting y^2 and z^3.
                x = e - z * z * z - y * y ;

                // Check if the sum of current x, y, and z is less than the current minimum sum.
                // Note: The original code does not explicitly check if 'x' is non-negative or an integer.
                // It implicitly assumes valid 'x' values are generated or handled by comparison.
                if ( x + y + z < min )
                {
                    // If a smaller sum is found, update 'min' to this new sum.
                    min = x + y + z ;
                }
            } // End of the 'y' loop.
        } // End of the 'z' loop.

        // After checking all possible combinations of 'y' and 'z' (and thus 'x'),
        // print the minimum sum found for the current 'e'.
        console . log ( min ) ;
    } // End of the 'if (e !== 0)' block.
} // End of the main 'for' loop.

// End of the script.