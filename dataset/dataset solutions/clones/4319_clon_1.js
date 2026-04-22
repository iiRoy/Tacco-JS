// This file contains a JavaScript program designed to process input.
// It demonstrates basic string manipulation and array filtering.

"use strict"; /* This directive enables strict mode, catching common coding errors and "unsafe" actions. */


/**
 * The primary function responsible for executing the program's logic.
 * It takes a single string argument, processes it, and outputs a count.
 *
 * @param {string} arg - The input string, typically representing multiple lines of text.
 */
const    main    =    arg    =>    {
    // First, remove any leading or trailing whitespace from the input string.
    // Then, split the cleaned string into an array of lines based on the newline character.
    arg    =    arg    .    trim    (    )    .    split    (    "\n"    )    ;

    // Access the first line of the processed input array.
    // Convert this first line into an array of individual characters.
    const    S    =    arg    [    0    ]    .    split    (    ""    )    ;

    // Filter the character array 'S' to include only elements that are strictly equal to the character '1'.
    // After filtering, retrieve the total number of elements in the resulting filtered array.
    // Finally, print this count to the standard output (console).
    console    .    log    (    S    .    filter    (    n    =>    n    ===    "1"    )    .    length    )    ;
} // End of the 'main' function definition.


// This line ensures the script is runnable by calling the 'main' function.
// It reads the entire content of standard input ('/dev/stdin') as a UTF-8 string,
// and then passes this string to the 'main' function for processing.
main    (    require    (    'fs'    )    .    readFileSync    (    '/dev/stdin'    ,    'utf8'    )    )    ;