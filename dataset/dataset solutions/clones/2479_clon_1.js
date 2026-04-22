// This function calculates the prime factors of a given number.
function factorization( num )
{
    // Initialize the starting divisor to 2.
    var dividor = 2;

    // Use a temporary variable to work with the number.
    var workbench = num;

    // This array will store the prime factors found.
    var ret = [];

    // Loop until the workbench number is reduced to 1.
    while ( workbench > 1 )
    {
        // Check if the current divisor evenly divides the workbench number.
        if ( workbench % dividor === 0 )
        {
            // If it does, divide the workbench by the divisor.
            workbench /= dividor;
            // And add the divisor to our list of prime factors.
            ret.push( dividor );
        }
        else
        {
            // If not, increment the divisor to check the next number.
            dividor++;
        }

        // Optimization: If the square of the current divisor
        // is greater than the remaining workbench, it means
        // the remaining workbench must be a prime factor itself.
        if ( dividor ** 2 > workbench )
        {
            ret.push( workbench ); // Add the remaining prime factor.
            break;                 // Exit the loop.
        }
    }

    // Return the array containing all prime factors.
    return ret;
}

/**
 * The main function to process input and produce output.
 * @param {string} input - The raw input string from stdin.
 */
function Main( input )
{
    // Split the input string into an array of lines.
    input = input.split( "\n" );

    // If the last line is empty (common with standard input), remove it.
    if ( input[ input.length - 1 ] === '' )
    {
        input.pop();
    }

    // Parse values from the first line of input.
    // The problem seems to involve geometry or trigonometry.
    const a = input[ 0 ].split( ' ' )[ 0 ] - 0; // Convert to number
    const b = input[ 0 ].split( ' ' )[ 1 ] - 0; // Convert to number
    const x = input[ 0 ].split( ' ' )[ 2 ] - 0; // Convert to number

    // Calculate and log the result based on a specific formula.
    // This looks like a conversion from radians to degrees for an arctangent.
    console.log( 180 / Math.PI * Math.atan( a * b * b / x / 2 ) );
}


// --- DO NOT EDIT THE FOLLOWING LINE ---
// This section handles reading from standard input and invoking the Main function.
Main( require( "fs" ).readFileSync( "/dev/stdin", "utf8" ) );
// --- END OF DO NOT EDIT SECTION ---