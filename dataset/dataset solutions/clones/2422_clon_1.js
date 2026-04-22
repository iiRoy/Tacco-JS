// This is a JavaScript program demonstrating basic arithmetic operations.
// It reads input from standard input, processes it, and prints the result.

function main ( arg ) { // Definition of the main function, taking one argument.

    // First, we ensure the input argument is clean by removing any leading or trailing whitespace.
    arg = arg.trim ();

    // Next, we parse the cleaned string into an integer.
    // The radix '10' is explicitly specified for decimal conversion, ensuring correct interpretation.
    arg = parseInt ( arg , 10 ) ;

    // Initialize a variable 'i' with a simple multiplication.
    // This value will be used in the subsequent calculation as a divisor.
    var i = 1 * 1 ;

    // Calculate 'r' using the processed argument 'arg' and the variable 'i'.
    // The calculation involves squaring 'arg' and then dividing the result by 'i'.
    var r = ( ( arg * arg ) / i ) ;

    // Finally, print the computed result 'r' to the standard output using console.log.
    console.log ( r ) ;

} // End of the main function definition.

// This part of the code executes the main function.
// It reads content from '/dev/stdin' synchronously using Node.js 'fs' module.
// The read content is then passed as an argument to the 'main' function.
main ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ;
// The program concludes after the main function has been called and executed.