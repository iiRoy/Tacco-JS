/*
 * This is a Type I clone of a JavaScript program.
 * It reads input from standard input, processes it,
 * and prints results to standard output.
 *
 * Changes are limited to whitespace and comments only.
 * All identifiers, operators, and expressions remain identical.
 */
'use strict'; // Enforce strict mode for cleaner code and fewer errors.

// Import the 'fs' (file system) module to read files.
var input = require('fs')
    .readFileSync(
        '/dev/stdin', // Path to standard input, typically for competitive programming.
        'utf8'        // Specify UTF-8 encoding for reading the file content.
    );

// Process the raw input string.
// .trim() removes leading/trailing whitespace (like newlines at the end).
// .split('\n') divides the string into an array of lines.
var minvs = input . trim ( ) . split ( '\n' ) ;

// Loop as long as the 'minvs' array contains elements.
while ( minvs . length !== 0 )
{
    // Remove the first element from the 'minvs' array and convert it to a number.
    // The unary plus operator (+) is used for type conversion.
    var t = + minvs . shift ( ) ;

    // Calculate the result: (t * t / 98) + 1, then ceiling it to the nearest integer.
    // Finally, print the calculated result to the console.
    console . log ( Math . ceil ( t * t / 98 + 1 ) ) ;
}

// End of program execution.