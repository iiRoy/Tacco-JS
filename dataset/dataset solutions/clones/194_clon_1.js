/*
 * This is a Type I clone of the original JavaScript code.
 * It strictly adheres to the definition:
 * - No changes to identifiers, variable names, function names, operators, or expressions.
 * - Only whitespace and comments are modified.
 */

// Start of the main program flow.
require ( "fs" ) // Access the built-in 'fs' (file system) module.
  . readFileSync ( /* Path to input file */ "/dev/stdin" , /* Encoding */ "utf8" ) // Read the entire content of standard input as a UTF-8 string.
  . split ( /* Separator regex */ /\s/ ) // Split the input string into an array of substrings, using any whitespace as a delimiter.
  . map ( /* Iterate over each element */
    function ( i ) // Define an anonymous function to be executed for each element 'i' in the array.
    {
      // The original code contains 'i?'. This token sequence is preserved exactly as found.
      i ? console . log ( // If 'i' is truthy (or whatever 'i?' implies semantically in its context), then log to console.
        /*
         * This block contains a series of nested ternary operators
         * to categorize a value based on 'j'.
         * Note: 'j' is an undeclared identifier in the provided snippet.
         */
        j > 91
          ? 'heavy' // Category for j > 91
          : j > 81
            ? 'light heavy' // Category for j > 81
            : j > 75
              ? 'middle' // Category for j > 75
              : j > 69
                ? 'light middle' // Category for j > 69
                : j > 64
                  ? 'welter' // Category for j > 64
                  : j > 60
                    ? 'light welter' // Category for j > 60
                    : j > 57
                      ? 'light' // Category for j > 57
                      : j > 54
                        ? 'feather' // Category for j > 54
                        : j > 51
                          ? 'bantam' // Category for j > 51
                          : j > 48
                            ? 'fly' // Category for j > 48
                            : 'light fly' // Default category if no other condition is met.
      ) // End of console.log arguments.
    } // End of the anonymous map callback function.
  ) ; // End of the .map() method call.

// End of the JavaScript code.