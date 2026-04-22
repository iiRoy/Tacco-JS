/*
 * This JavaScript code snippet is an example of a Type I clone.
 * It demonstrates how to achieve visual differentiation
 * while maintaining exact structural and logical equivalence
 * to an original source file.
 *
 * Key characteristics of a Type I clone include:
 * - Identical identifiers (variable names, function names).
 * - Identical operators and expressions.
 * - Identical control flow structures.
 *
 * Permitted variations are strictly limited to:
 * - Whitespace (spaces, tabs, newlines).
 * - Comments (addition, modification, or removal).
 *
 * This particular script processes a single line of input
 * containing three space-separated values,
 * determines their equality relationships,
 * and prints a corresponding digit (1, 2, or 3) to standard output.
 */


// Ensure the standard input stream remains active and open for receiving data.
process . stdin . resume ( ) ;


// Explicitly set the character encoding for the incoming standard input data.
process . stdin . setEncoding ( "utf-8" ) ;


// Attach an event handler to the 'data' event of the standard input stream.
// This function will be executed whenever a chunk of data is received.
process . stdin . on ( "data" , function ( chunk ) {

    // -------------------------------------------------------------------------
    // Data Processing Block:
    // This section parses the incoming data chunk.
    // -------------------------------------------------------------------------

    // Declare a variable 'array' to hold the parsed input values.
    // The 'i' variable is also declared, mirroring the original code's declaration,
    // even though it is not subsequently used in this specific logic.
    var    array    =    chunk    .    replace    (    "\n"    ,    ""    )    .    split    (    " "    )    ,    i    ;


    // Assign the first parsed value to variable 'a'.
    var    a    =    array    [    0    ]    ;


    // Assign the second parsed value to variable 'b'.
    var    b    =    array    [    1    ]    ;


    // Assign the third parsed value to variable 'c'.
    var    c    =    array    [    2    ]    ;


    // -------------------------------------------------------------------------
    // Conditional Logic Block:
    // This section determines the equality status of 'a', 'b', and 'c'.
    // -------------------------------------------------------------------------

    // Check if all three values are distinct from each other.
    if    (    a    !==    b    &&    a    !==    c    &&    b    !==    c    )    {
        // If all are distinct, output '3'.
        process    .    stdout    .    write    (    "3"    )    ;
    }


    // Check if 'a' and 'b' are equal, but 'c' is different from 'a' (and 'b').
    if    (    a    ===    b    &&    a    !==    c    )    {
        // If two are equal and one is different, output '2'.
        process    .    stdout    .    write    (    "2"    )    ;
    }


    // Check if 'b' and 'c' are equal, but 'a' is different from 'c' (and 'b').
    if    (    b    ===    c    &&    a    !==    c    )    {
        // If two are equal and one is different, output '2'.
        process    .    stdout    .    write    (    "2"    )    ;
    }


    // Check if 'c' and 'a' are equal, but 'b' is different from 'a' (and 'c').
    if    (    c    ===    a    &&    a    !==    b    )    {
        // If two are equal and one is different, output '2'.
        process    .    stdout    .    write    (    "2"    )    ;
    }


    // Check if all three values are exactly equal to each other.
    if    (    a    ===    b    &&    a    ===    c    )    {
        // If all three are equal, output '1'.
        process    .    stdout    .    write    (    "1"    )    ;
    }

}    )    ;    // End of the 'data' event listener function.


// End of script.
/*
 * This concludes the demonstration of a Type I code clone.
 */