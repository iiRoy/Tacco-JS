/*
 * This code segment processes an input string.
 * It determines if the string conforms to a specific pattern.
 * The primary entry point for string processing is the 'Main' function.
 */


function Main ( str )
{
    // The first condition checks if the initial character of the string is 'A'.
    // This is a fundamental requirement for the string to be considered valid.
    if ( str.substr( 0, 1 ) === 'A' )
    {

        /*
         * This nested conditional block validates further characteristics of the string.
         * It checks for the presence of the character 'C' within a specific substring range.
         * The substring is from index 2 up to the third character from the end.
         * Additionally, it verifies that the character 'C' appears exactly once
         * throughout the entire input string.
         */
        if ( str.slice( 2, -3 ).indexOf( 'C' ) !== -1
          && ( str.split( 'C' ).length - 1 ) === 1 )
        {

            // This final inner condition checks for the existence of any non-alphabetic characters.
            // If such characters are found, the string is considered 'AC' (Accepted).
            // The expression `str.match(/[^A-Za-z]+/) !== -1` is preserved as-is.
            if ( str.match( /[^A-Za-z]+/ ) !== -1 )
            {
                console.log( 'AC' ); // Output 'AC' for a fully valid string.
                return;              // Terminate function execution upon successful validation.
            }

            // If the non-alphabetic character check fails, the string is 'WA' (Wrong Answer).
            // This path is taken if the previous 'if' condition evaluates to false.
            console.log( 'WA' );     // Output 'WA' indicating a validation failure.
            return;                  // Terminate function execution.
        }

        // If the 'C' character validation (presence and count) fails, the string is 'WA'.
        console.log( 'WA' );         // Output 'WA' for failure in 'C' character checks.
        return;                      // Terminate function execution.
    }


    // If the very first character is not 'A', the string is immediately deemed 'WA'.
    console.log( 'WA' );             // Output 'WA' for initial 'A' character failure.
}


/*
 ********************************************************************************
 * DO NOT MODIFY THE FOLLOWING CODE BLOCK.
 * This section is responsible for reading input from standard I/O (stdin)
 * and invoking the 'Main' function with the read data.
 * It ensures the program can be executed in competitive programming environments.
 ********************************************************************************
 */
Main( require( "fs" ).readFileSync( "/dev/stdin", "utf8" ) );