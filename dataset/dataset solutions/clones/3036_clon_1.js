/*
 * This JavaScript code defines a function to process
 * a specific type of string input.
 * It demonstrates character manipulation based on an index.
 */
'use strict' /* This directive enables strict mode,
                which helps in writing cleaner code
                and catching common coding mistakes. */

// The main function that takes a single 'input' argument,
// which is expected to be a multi-line string.
function Main(  input  )
{
    // First, remove any leading or trailing whitespace from the input string.
    // Then, split the string into an array of lines using the newline character
    // as a delimiter.
    input  =  input.trim(  )  .split(  /\n/  )  ;

    // Declare and initialize multiple variables from the parsed input array.
    // N: The first element (line 0), converted to a number by subtracting 0.
    // S: The second element (line 1), split into an array of individual characters.
    // K: The third element (line 2), which will be used as an index.
    var   N  =  input[0]  -  0  ,
          S  =  input[1]  .split(  ''  )  ,
          K  =  input[2]  ; // K represents the index from the input.

    // Retrieve the character at the specified index K from the character array S.
    // This character 'e' will be the reference for our transformation.
    var   e  =  S[K]  ;

    // Transform the character array S:
    // Use the map function to iterate over each character 'x' in S.
    // If 'x' is strictly equal to the reference character 'e', keep 'e'.
    // Otherwise, replace 'x' with an asterisk character '*'.
    // Finally, join all the transformed characters back into a single string.
    var   ans  =  S.map(  x  =>  x  ===  e  ?  e  :  '*'  )  .join(  ''  )  ;

    // Output the final resulting string to the console.
    console.log(  ans  )  ;
} // End of the Main function definition.


// This section handles reading input from the standard input stream
// and passing it to the Main function for processing.
// It uses Node.js's 'fs' module to read the file synchronously.
Main(  require(  'fs'  )  .readFileSync(  '/dev/stdin'  ,  'utf8'  )  )  ;