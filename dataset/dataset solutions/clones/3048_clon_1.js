/*
 * This is a Type I clone of the original JavaScript code.
 * All identifiers, operators, and expressions are preserved exactly.
 * Only whitespace and comments have been altered significantly.
 */


function   main ( arg )    {
    // Declare and initialize variables for processing input.
    // The input 'arg' is expected to be a string.
    var    data    =    arg
                                .trim ( )
                                .split ( "\n" )
                                [ 0 ]
                                .split ( " " )
                                .map ( Number ) ;


    // Extract the first two numbers from the processed data array.
    var    a    =    data [ 0 ] ;

    var    b    =    data [ 1 ] ;


    // Initialize the answer variable.
    var    ans    =    0 ;


    /*
     * This loop iterates a fixed number of times (2 iterations).
     * In each iteration, it compares 'a' and 'b'.
     * The larger value is added to 'ans', and then decremented.
     */
    for    (    var    i    =    0   ;   i    <    2   ;   i ++    )
    {
        // Check which value is currently greater.
        if    (    a    >    b    )
        {
            // If 'a' is greater, add 'a' to the answer.
            ans    +=    a    ;

            // Decrement 'a'.
            a--    ;
        }
        else
        {
            // If 'b' is greater or equal, add 'b' to the answer.
            ans    +=    b    ;

            // Decrement 'b'.
            b--    ;
        }
    }


    // Output the final calculated answer to the console.
    console.log ( ans ) ;

} // End of main function definition.


/*
 * This section reads input from standard input,
 * processes it, and calls the main function.
 * It uses Node.js's 'fs' module to read file content.
 */
main (
    require ( 'fs' )
             .readFileSync ( '/dev/stdin' , 'utf8' )
) ;