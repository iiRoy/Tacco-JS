/*
 * This JavaScript file contains a simple program structure.
 * It defines a function to process an input string
 * and then calls that function with data read from standard input.
 *
 * All original identifiers, operators, and expressions are preserved.
 * Only whitespace and comments have been modified.
 */


// Declares the primary function named 'main'.
// This function accepts a single parameter, which is named 'input'.
function    main   (   input   )
{
    // This statement outputs a concatenated string to the console.
    // It combines the literal string "ABC" with the value of the 'input' parameter.
    console .   log   (   "ABC"    +    input   )   ;
}


// Following the function definition, the 'main' function is invoked.
// The argument passed to 'main' is the result of a series of operations:
// 1. 'require("fs")' loads the Node.js file system module.
// 2. '.readFileSync("/dev/stdin", "utf8")' reads the entire content
//    of the standard input file ('/dev/stdin') synchronously,
//    interpreting its content as UTF-8 encoded text.
// The resulting string is then passed as the 'input' to the 'main' function.
main    (   require   (   "fs"   )   .   readFileSync   (   "/dev/stdin"   ,   "utf8"   )   )   ;

// End of the script execution.