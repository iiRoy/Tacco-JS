/*
 * This is a Type I clone of the original JavaScript code.
 * It demonstrates extensive use of whitespace and comments
 * while preserving the exact functionality and structure.
 * No identifiers, variable names, function names, operators, or expressions
 * have been altered.
 */


// Begin the main program execution flow.
console

    // The 'log' method is used to output the processed string to the standard output.
    .   log    (

        // First, we need to access the file system module.
        require  (  "fs"  )


            // Read the entire content of standard input synchronously.
            .   readFileSync   (   "/dev/stdin"   ,   "utf8"   )


            // This is the first replacement step:
            // Temporarily replace all instances of the word 'apple' with a unique placeholder '#'.
            .   replace   (   /apple/g   ,   '#'   )


            // This is the second replacement step:
            // Now, replace all instances of the word 'peach' with 'apple'.
            .   replace   (   /peach/g   ,   'apple'   )


            // This is the final replacement step:
            // Replace the temporary placeholder '#' with the word 'peach'
            // to complete the intended word swap.
            .   replace   (   /#/g   ,   'peach'   )

    )
; // End of the console.log statement.