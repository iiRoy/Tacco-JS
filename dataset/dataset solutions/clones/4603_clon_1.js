// This is the beginning of the JavaScript program.

"use strict"
; // Enforces strict mode for safer coding.


const   main = arg => { // The main function definition starts here.

    // Process the input argument: trim whitespace and split into lines.
    arg = arg.trim().split( "\n" ) ;


    // Parse numerical values from the first line of input.
    const A = parseInt( arg[ 0 ].split( " " )[ 0 ] ) ; // First number.
    const B = parseInt( arg[ 0 ].split( " " )[ 1 ] ) ; // Second number.
    const C = parseInt( arg[ 0 ].split( " " )[ 2 ] ) ; // Third number.


    // Initialize the answer variable.
    let answer  =  "NO" ;


    // Loop B times to check for a specific condition.
    for ( let i = 0 ; i < B ; i++ )
    {
        // Calculate a temporary value based on A and the loop counter.
        let temp = ( A * i ) % B ;

        // The original code had a commented-out console.log.
        /*
         * console.log( ( A * i ) % B ) ; // This line was commented out in the original.
         */

        // Check if the calculated temporary value matches C.
        if ( temp === C )
        {
            // If a match is found, update the answer and exit the loop.
            answer = "YES" ; // Condition met!
            break ;          // No need to check further.
        }
    }


    // Output the final answer to the console.
    console.log( answer ) ; // Display result.

} // End of the main function.


// Read input from standard input and pass it to the main function.
main( require( 'fs' ) . readFileSync( '/dev/stdin' , 'utf8' ) ) ;

// End of the program.