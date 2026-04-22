/*
 * This is a Type I clone of the original JavaScript code.
 * It maintains exact functionality while extensively varying whitespace and comments.
 * All identifiers, operators, and expressions are strictly preserved.
 */

function   Main  (  input  )     {
    // First, process the input string.
    // It's expected to be a multi-line string where each line is a number.
    input  =  input.split ( "\n" ) .map ( Number ) ;

    // Calculate the result based on specific elements of the processed input array.
    // The formula is (input[0] + 1 - input[1]) * (input[0] + 1 - input[2])
    // This is a direct translation of the original arithmetic expression.
    console.log ( ( input [ 0 ]  +  1  -  input [ 1 ] )  *  ( input [ 0 ]  +  1  -  input [ 2 ] ) ) ;

} // End of the Main function definition.

// The following line immediately invokes the Main function.
// It reads input from standard input, decodes it as UTF-8, and removes leading/trailing whitespace.
Main ( require ( "fs" ) .readFileSync ( "/dev/stdin" ,  "utf8" ) .trim ( ) ) ;

/*
 * End of generated Type I clone.
 * This file should execute identically to the source code.
 */