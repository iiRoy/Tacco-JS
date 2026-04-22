/*
 * This is a Type I clone of the original JavaScript code.
 * All functional elements, identifiers, and logic remain precisely
 * as they were in the original version.
 *
 * The only modifications made are to whitespace (indentation, spacing,
 * and blank lines) and the addition of comments, as per the
 * Type I clone definition.
 */

// Define the primary function that processes the input.
function    main    (    input    )
{


        // Step 1: Trim any leading or trailing whitespace from the input string.
        input    =    input    .    trim    (    )    ;


        // Step 2: Parse the input.
        // The input string is split by spaces, and then each resulting
        // substring is converted into a numerical value.
        // This array of numbers is stored in the constant 'a'.
        const    a    =    input    .    split    (    " "    )    .    map    (    Number    )    ;


        // Step 3: Perform the core logical check and output the result.
        // We check if the sum of the first two elements (a[0] and a[1])
        // is greater than or equal to the third element (a[2]).
        // Based on the outcome, "Yes" or "No" is printed to the console.
        console    .    log    (    (    a    [    0    ]    +    a    [    1    ]    >=    a    [    2    ]    )    ?    "Yes"    :    "No"    )    ;


}   // End of the main function definition.


// This section handles reading input from the standard input stream.
// It uses Node.js's 'fs' module to synchronously read the content of
// '/dev/stdin' as a UTF-8 encoded string, and then passes this
// string to the 'main' function for processing.
main    (    require    (    'fs'    )    .    readFileSync    (    '/dev/stdin'    ,    'utf8'    )    )    ;