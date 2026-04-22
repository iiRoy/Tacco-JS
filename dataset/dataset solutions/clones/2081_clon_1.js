// This is an immediately invoked function expression (IIFE) that processes some input.
(
    /**
     * Defines the primary function for our application logic.
     * This function checks for a specific pattern in the provided string.
     *
     * @param   {string}    S   The input string to be processed.
     * @returns {string}        'Yes' if the pattern is found, otherwise 'No'.
     */
    function    Main    (   S   )
    {
        // The core logic: use a regular expression to search for "hi"
        // The match() method returns null if no match is found,
        // which evaluates to false in a boolean context.
        return  S   .   match   (   /hi/    )

            ?   // If a match is found (truthy result)
            'Yes'

            :   // If no match is found (falsy result, e.g., null)
            'No'
        ;   // End of the return statement
    }
)
// This is the invocation part of the IIFE.
// It provides the input string 'S' to the 'Main' function.
(
    // We are using Node.js's built-in 'fs' (file system) module.
    // The 'require' function loads this module.
    require (   "fs"    )

        // The 'readFileSync' method is used to synchronously read the content of a file.
        // It takes the file path and encoding as arguments.
        .   readFileSync (
            // The file path for standard input in a Unix-like environment.
            "/dev/stdin"    ,

            // The encoding for the input file.
            "utf8"
        )
)
; // A semicolon to properly terminate the IIFE statement.