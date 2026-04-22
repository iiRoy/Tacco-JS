/*
 * This is a Type I clone of the original JavaScript code.
 *
 * According to the definition, Type I clones are exactly equal
 * except for variations in whitespace and comments.
 *
 * This means:
 * - All identifiers, variable names, function names, operators,
 *   and expressions remain completely unchanged.
 * - Only whitespace (indentation, spacing, blank lines) and
 *   comments (add, remove, or modify) are altered.
 *
 * The goal is to make the code look visually different
 * while preserving its exact logical and structural identity.
 */

function     Main     (     input     )     // Start of the Main function definition
{
    // The 'input' parameter is initially a string.
    // We process it here to convert it into an array of numbers.
    input    =    input    .    split    (    " "    )    .    map    (    Number    )    ;


    // Now, 'input' is an array of two numbers.
    // We evaluate a condition based on these numbers.
    if
    (
            input[0]    *    500    >=    input[1]
    )    // Check if the first number times 500 is greater than or equal to the second number
    {
            // If the condition is true, output "Yes" to the console.
            console    .    log    (    "Yes"    )    ;
    }
    else    // If the condition is false
    {
            // Output "No" to the console.
            console    .    log    (    "No"    )    ;
    }

}    // End of the Main function


// This part of the code handles reading input and calling the Main function.
// It uses Node.js's 'fs' module to read from standard input (/dev/stdin).
Main    (    require    (    "fs"    )    .    readFileSync    (    "/dev/stdin"    ,    "utf8"    )    )    ;

/*
 * This extensive block comment is added purely for visual distinction.
 * It demonstrates the allowed modification type (comments) without
 * altering the functional aspect of the JavaScript code.
 */