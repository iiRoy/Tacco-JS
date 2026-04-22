/*
 * This is a Type I clone of the original JavaScript code.
 * It maintains exact logical and structural identity,
 * only varying in whitespace and comments.
 */

const Main = ( input ) => {
    // The main function starts here.
    // It takes one argument, 'input', which is expected to be a string.

    var xs = input . trim() . split( ' ' ) . map( v => parseInt( v, 10 ) );
    /*
     * Above, the input string is processed in several steps:
     * 1. '.trim()' removes any leading or trailing whitespace.
     * 2. '.split(' ')' divides the string into an array of substrings,
     *    using a space character as the delimiter.
     * 3. '.map(v => parseInt(v, 10))' then iterates over each substring,
     *    converting it into an integer with a base of 10.
     * The resulting array of integers is stored in the 'xs' variable.
     */


    var ans = xs[0] - xs[1]; // Calculate the difference between the first two numbers in the array.


    console . log( ans ); // Output the final calculated answer to the console.

}; // End of the Main function definition.


// This section handles reading input and calling the main function.
Main( require( "fs" ) . readFileSync( "/dev/stdin" , "utf8" ) );
/*
 * The 'require("fs")' statement imports the Node.js file system module.
 * '.readFileSync("/dev/stdin", "utf8")' reads the content of the standard input
 * synchronously and decodes it as a UTF-8 string.
 * This string is then passed as an argument to the 'Main' function.
 */