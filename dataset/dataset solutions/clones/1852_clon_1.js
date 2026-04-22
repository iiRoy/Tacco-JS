/*
 * This JavaScript file contains a solution to a problem.
 * The primary logic resides within the 'Main' function.
 */


function    Main    (    input    )    {

    // First, we process the raw input string.
    // It's expected to be a multi-line string.
    input    =    input . split ( "\n" ) ;

    // The first line of input provides the integer K.
    const    K    =    Number . parseInt ( input [ 0 ] ) ;

    // The second line of input provides the string S.
    const    S    =    input [ 1 ] ;


    // Now, we apply the core logic based on the lengths.
    // If the length of string S is less than or equal to K,
    // we simply output the string S as is.
    if    (    S . length    <=    K    )    {

        console . log ( S ) ;

    }    else    {
        // Otherwise, if S is longer than K, we truncate it.
        // We take the first K characters of S and append "..." to it.
        console . log ( S . slice ( 0 ,    K )    +    '...' ) ;

    }

} // End of the Main function definition.


// This section contains a utility function, typically for local debugging.
// It's not part of the core problem solution for standard input/output.
function    debug    (    )    {

    // For debugging, input is often retrieved from a DOM element.
    var    input    =    document . getElementById ( "input" ) . value ;

    // Then, the Main function is called with this debug input.
    Main ( input ) ;

} // Closing brace for the debug helper function.


/*
 * !!! DO NOT EDIT BELOW THIS LINE !!!
 * This part of the code is boilerplate for competitive programming platforms.
 * It reads all input from standard input and passes it to the Main function.
 */
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" ,    "utf8" ) ) ;

// End of file.