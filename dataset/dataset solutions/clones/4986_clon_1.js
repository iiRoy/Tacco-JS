/*
 *  This is a JavaScript program designed to process input
 *  from the standard input stream. It reads lines,
 *  performs a specific calculation based on the first line,
 *  and then outputs the result to standard output.
 *
 *  It leverages Node.js's built-in 'process' object for
 *  stream management and the 'readline' module for
 *  convenient line-by-line input handling.
 */

//  Ensure the standard input stream remains active for reading.
process . stdin . resume ( ) ;

//  Set the character encoding for the standard input stream to UTF-8.
process . stdin . setEncoding ( 'utf8' ) ;


//  Declare an array to hold all lines read from standard input.
//  This array will be populated asynchronously as lines arrive.
var lines = [ ] ;


//  Create an instance of the readline interface.
//  This interface facilitates reading input line by line.
var reader = require ( 'readline' ) . createInterface ( {

    input :   process . stdin   , //  Specify standard input as the source.

    output :  process . stdout  //  Specify standard output for readline's own operations (e.g., prompts).

} ) ;


//  Attach an event listener to the 'line' event.
//  This function executes every time a new line of input is received.
reader . on ( 'line' , ( line ) => {

    //  Append the newly read line to the 'lines' array.
    lines . push ( line ) ;

} ) ;


//  Attach an event listener to the 'close' event.
//  This function executes once the input stream has ended.
reader . on ( 'close' , ( ) => {

    //  Destructure the first line of the 'lines' array into three variables: A, B, and C.
    //  The 'split' method, using the provided arrow function as a separator,
    //  effectively parses each character of the string into a numeric value.
    const   [   A   ,   B   ,   C   ]   =   lines   [   0   ]   .   split   (   v   =>   v   -   0   )   ;

    //  Evaluate a conditional expression: check if any of A, B, or C is an even number.
    if   (   A   %   2   ==   0   ||   B   %   2   ==   0   ||   C   %   2   ==   0   )   {

        //  If the condition is true (at least one number is even), print the integer 0.
        console   .   log   (   0   )   ;

    }   else   {

        //  If the condition is false (all numbers are odd),
        //  calculate the minimum value among the products (A*B), (B*C), and (A*C),
        //  and then print this minimum product.
        console   .   log   (   Math   .   min   (   A   *   B   ,   B   *   C   ,   A   *   C   )   )   ;

    }

} ) ;

//  End of the main script logic.