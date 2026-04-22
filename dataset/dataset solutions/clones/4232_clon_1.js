/*
 * This file defines a JavaScript program including constants,
 * a main function for hexadecimal comparison, and a self-executing
 * anonymous function to handle execution in different environments.
 */

// Global constants definition section.
// These constants are used throughout the program for string manipulation.
const  BKRT  =   "\n"  ; /* Represents a newline character. Commonly used for splitting input. */
const SPAC = " "; // A single space character, useful for tokenizing input lines.
const NOSP = ""; /* An empty string, could be used where no separator is needed. */


/**
 * The primary function of this program. It takes an input string,
 * parses two hexadecimal numbers from it, and returns a string indicating
 * their relative comparison.
 *
 * @param {string} input - The raw input string containing the hexadecimal numbers.
 * @returns {string} - Returns ">" if the first number is greater,
 *                     "=" if they are equal, or "<" if the first is smaller.
 */
function   Main (  input )  {

    /*
     * Pre-process the input string.
     * Steps:
     * 1. Split the input string by newline characters (BKRT).
     * 2. For each resulting line, split it by space characters (SPAC).
     * 3. Flatten the array of arrays into a single, one-dimensional array.
     * This prepares the input for sequential shifting.
     */
    input  =  [ ] . concat (  ...input.split(BKRT).map( a => a.split(SPAC) )  ) ;


    // Define a helper arrow function to retrieve string tokens.
    // It removes and returns the first element from the 'input' array.
    const   strShift   =   ( )   =>   input.shift ( ) ;


    // Define another helper arrow function to retrieve integer tokens.
    // It uses the bitwise NOT operator (~~) for a fast integer conversion (truncation).
    const   intShift   =   ( )   =>   ~~input.shift ( ) ;


    // Declare and initialize variable A.
    // It parses the first shifted string as a base-16 (hexadecimal) integer.
    var   A   =   parseInt (  strShift ( ) ,  16  ) ;


    // Declare and initialize variable B.
    // It parses the second shifted string as a base-16 (hexadecimal) integer.
    var   B   =   parseInt (  strShift ( ) ,  16  ) ;


    // Conditional logic to compare the two hexadecimal numbers.
    // The comparison determines the output string.
    if  (  A  >  B  )  { // If A is strictly greater than B.
        return  ">" ;
    }
    if  (  A  ==  B  )  { // If A is strictly equal to B.
        return  "=" ;
    }
    if  (  A  <  B  )  { // If A is strictly less than B.
        return  "<" ;
    }

} // End of the Main function definition.


/*
 * This is a self-executing anonymous function (IIFE) that wraps the entire
 * script. It provides a mechanism for running the 'Main' function in
 * different environments (Node.js vs. browser-like environment for testing).
 *
 * The `b`, `c`, `d` parameters are used internally for processing and display.
 */
( (   b ,   c ,   d   )   =>   "undefined"   !=   typeof   require   ?
    // --- Node.js Environment Branch ---
    // If 'require' is defined (indicating Node.js), read input from stdin,
    // execute 'Main', and log the result to the console.
    console.log (  Main ( require (  "fs"  ) . readFileSync (  "/dev/stdin" ,  "utf8"  )  )  )  :
    // --- Browser-like Environment Branch (for local testing/debugging) ---
    // If not Node.js, this block prepares a simple debug interface.
    [
        // Process the initial input 'b':
        // 1. Split by newline.
        // 2. Remove the first and last lines (often empty or boilerplate).
        // 3. Join the remaining lines back into a single string.
        b   =   b . split (  "\n"  ) . slice (  1 ,   -1  ) . join (  "\n"  )  ,

        // Execute the Main function with the processed input 'b'.
        // This is wrapped in a try-catch to gracefully handle potential errors
        // during execution and display them.
        c   =   function ( ) {
            try {
                return   Main (  b  ) ;
            }   catch (  f  ) {
                // In case of an error, return the error stack or message.
                return   f.stack   ||   f.message ;
            }
        } ( ) , // Immediately invoke this anonymous function.

        // Determine the type of the result 'c'.
        d   =   typeof   c  ,

        // If 'c' is not already a string, convert it to a JSON string
        // for display purposes. This handles objects, numbers, booleans, etc.
        "string"   ==   d   ||   (   c   =   JSON.stringify (  c  )   )  ,

        // Create an HTML form element.
        // Append multiple textareas and <br> tags to display:
        // 1. The processed input 'b'.
        // 2. The type of the result 'd'.
        // 3. The stringified result 'c'.
        $ (  "<form>"  ) . append (  [
            [  10 ,   b  ]  ,   0  , // Textarea for input 'b' (10 rows).
            [  1 ,   d  ]  ,   0  , // Textarea for type 'd' (1 row).
            [  10 ,   c  ]          // Textarea for result 'c' (10 rows).
        ] . map (   f   =>   $ (  f   ?   "<textarea>"   :   "<br>"  ,
                // If 'f' is truthy (an array like [rows, text]), create a textarea.
                // Otherwise, create a <br> tag.
                f   &&   {  rows :   f [  0  ] ,   cols :   40 ,   text :   f [  1  ]  }
            )
        )  ) . appendTo (  "body"  ) // Append the entire form to the HTML body.
    ]
) (  `
A B
`  ) ; // The initial input string provided to the IIFE.