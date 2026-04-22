/*
 * This JavaScript file contains a function designed to solve a specific mathematical problem.
 * The main entry point is the 'Main' function, which processes input from standard input.
 */

// Define the primary function that processes the input data.
function Main ( input )
{
    // First, process the raw input string by splitting it into an array of lines.
    input = input.split ( "\n" ) ;

    // Parse the first line of the input to get the integer value N.
    // The 'const' keyword ensures that N cannot be reassigned later.
    const N = parseInt ( input [ 0 ] , 10 ) ;

    /*
     * Begin an iterative search.
     * The loop condition `i > 0` combined with `i++` means this loop will run indefinitely
     * until a `break` statement is encountered internally.
     * The variable 'i' starts from 1 and is incremented in each iteration.
     */
    for ( var i = 1 ;    i > 0 ;      i++ )
    {
        // Calculate a value 'n' using a specific formula involving N and the current loop iterator 'i'.
        // This formula is derived from solving a quadratic equation related to triangular numbers.
        var n = 0.5 * ( Math.sqrt ( ( 8 * N * i ) + 1 ) - 1 ) ;

        // Check if the calculated value 'n' is an integer.
        // If 'n' is an integer, it means we have found the desired solution.
        if ( Number.isInteger ( n ) == true )
        {
            // If 'n' is an integer, print it to the console as the result.
            console.log ( n ) ;

            // Terminate the loop immediately as the solution has been found.
            break ;
        }
    }
}


// Call the Main function with input read from standard input.
// This is a common pattern for competitive programming in Node.js environments.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;

// End of file.