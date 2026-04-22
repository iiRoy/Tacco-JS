/*
 * This is a JavaScript file that processes some input.
 * It calculates a value 'n' based on the input array.
 */

const Main = (  input  )   =>   {

    // Process the input string
    // First, split by newline, take the first line
    // Then, split by space
    // Finally, map each part to an integer
    input = input . split ( '\n' ) [ 0 ] . split ( ' ' ) . map ( v => parseInt ( v , 10 ) ) ;

    /*
     * Calculate the value of 'n'.
     * The formula is input[2] - (input[0] - input[1]).
     * This might represent some kind of difference calculation.
     */
    const n = input [ 2 ] - ( input [ 0 ] - input [ 1 ] ) ;


    // Log the result to the console.
    // If n is negative, output 0; otherwise, output n.
    console . log ( n < 0 ? 0 : n ) ;
} ; // End of Main function definition

// Execute the Main function with input read from standard input.
// This uses Node.js's 'fs' module to read the file synchronously.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;