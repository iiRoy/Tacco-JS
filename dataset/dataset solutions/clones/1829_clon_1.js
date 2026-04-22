/*
 * This is a Type I clone of the original JavaScript code.
 * It demonstrates extensive modifications to whitespace and comments.
 * All identifiers, operators, and expressions remain strictly identical.
 */

    // Declare a variable 'input' and read data from standard input.
    // The data is read as UTF-8, then split into an array by newline characters.
var   input   =   require (   'fs'   )   .   readFileSync   (   '/dev/stdin'   ,   'utf8'   )   .   split   (   '\n'   )


    // Declare a variable 'T' and assign it the first element of the 'input' array.
    // This typically represents the main string to be processed.
var   T   =   input   [   0   ]

    // Define a regular expression 'pdReg' for matching specific patterns.
    // This pattern looks for '?' or 'P' followed by '?' or 'D', globally.
var   pdReg   =   /   [\?|P]   [\?|D]   /   g

    // Define another regular expression 'dReg' for matching all '?' characters, globally.
var   dReg   =   /   \?   /   g


    // Log the final processed string to the console.
    // First, replace all occurrences of 'pdReg' pattern with 'PD'.
    // Then, replace all remaining 'dReg' patterns (which are just '?') with 'D'.
console   .   log   (   T   .   replace   (   pdReg   ,   'PD'   )   .   replace   (   dReg   ,   'D'   )   )

// End of Type I cloned code.