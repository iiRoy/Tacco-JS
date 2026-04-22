// This JavaScript program is designed to extract the first letter of three words
// provided as input, convert them to uppercase, and then concatenate them
// to form an acronym. It's structured for typical command-line execution.


function   main   (   input   )
{
    // The very first step is to clean up the raw input string.
    // This removes any extraneous whitespace from both ends.
    input   =   input . trim ( ) ;

    /*
     * Next, the cleaned input string is split into an array of substrings.
     * The delimiter used for splitting is a single space character.
     * It is assumed that the input will contain three space-separated components.
     * Array destructuring is then used to assign these three components
     * directly to variables 'a', 'b', and 'c' for easier access.
     */
    const   [   a   ,   b   ,   c   ]   =   input . split   (   " "   )   ;


    // A new variable 'x' is declared using 'let' to hold the final acronym.
    // The acronym is constructed by performing several operations:
    // 1. For each of the three variables (a, b, c), the 'slice' method is used
    //    to extract the very first character (from index 0 up to, but not including, index 1).
    // 2. The extracted character is then converted to its uppercase equivalent
    //    using the 'toUpperCase()' method.
    // 3. These three uppercase characters are then concatenated together
    //    using the '+' operator to form a single string.
    let   x   =   a . slice ( 0 , 1 ) . toUpperCase ( )        +
                  b . slice ( 0 , 1 ) . toUpperCase ( )        +
                  c . slice ( 0 , 1 ) . toUpperCase ( )        ;


    // Finally, the resulting acronym, stored in variable 'x',
    // is printed to the standard output console.
    console . log ( x ) ;

} /* main function ends here */


// This line initiates the execution of the program.
// It calls the 'main' function and passes it the necessary input.
// The input is obtained by:
// 1. Requiring the built-in 'fs' (file system) module.
// 2. Using 'readFileSync' from 'fs' to read the content of '/dev/stdin'.
//    '/dev/stdin' is a common path for standard input in Unix-like systems.
// 3. Specifying "utf8" as the encoding for reading the file content.
// The entire content read from stdin is then passed as the 'input' argument to 'main'.
main ( require ( "fs" ) . readFileSync ( "/dev/stdin" ,   "utf8" ) ) ;