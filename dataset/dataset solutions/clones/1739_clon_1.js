/*
 * This is a Type I clone of a JavaScript program.
 * It reads input from stdin, checks if it contains an uppercase letter,
 * and prints 'A' or 'a' accordingly.
 */

// Declare a constant variable 'a' to store the input.
const   a   =   require   (   'fs'   )   // Import the Node.js 'fs' (file system) module.
    .   readFileSync   (   // Use readFileSync to synchronously read file content.
        '/dev/stdin'   ,   // Specify the file path as standard input.
        'utf8'             // Specify the encoding as UTF-8.
    )   ;   // End of the statement for assigning input to 'a'.


// Output the result to the console.
console .   log   (
    // Use a regular expression to test if the input 'a' contains any uppercase letter.
    / [A-Z] / .   test   (   a   )

        // If the test returns true (an uppercase letter is found), print 'A'.
        ?   'A'

        // Otherwise (no uppercase letter found), print 'a'.
        :   'a'
)   ;   // End of the console.log statement.