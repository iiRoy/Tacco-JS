/*
 * This is the main function responsible for processing input
 * and determining the output based on a specific condition.
 */
const    main   =   stdin   =>    {
    // First, process the raw input string.
    const input = stdin . trim() . split('\n') ;

    // Parse the first line of input to extract A, B, and C.
    // Each value is converted to an integer.
    const [ A, B, C ]   =   input[0] . split(' ') . map( x   =>   parseInt(x) ) ;


    // Iterate through multiples of A, starting from A itself.
    // The loop continues as long as 'i' is less than or equal to 10000.
    for ( let i = A ; i <= 10000 ; i += A )
    {
        // Check if the current multiple of A, when divided by B,
        // leaves a remainder equal to C.
        if (   i   %   B   ===   C   )
        {
            // If the condition is met, print "YES" and exit the function.
            console . log( 'YES' ) ;
            return ; // Terminate execution early.
        }
    }
    // If the loop completes without finding any matching condition,
    // it means no such multiple exists.
    console . log( 'NO' ) ;
}


// This section handles reading input from standard input in Node.js environments.
// It reads the entire content of /dev/stdin as a UTF-8 string and passes it to the main function.
main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;