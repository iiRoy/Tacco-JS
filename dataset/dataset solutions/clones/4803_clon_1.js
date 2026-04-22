/*
 * This is a Type I clone of a JavaScript program.
 * It calculates the sum or difference of two numbers
 * provided as input, based on an operator.
 *
 * This version includes extensive whitespace variations
 * and comments to demonstrate a Type I clone.
 */

// Define the main function that will process the input data.
function   Main (  input )    {
    // Declare variable 'a' and initialize it with the first numeric value from the input array.
    // The `- 0` is used to explicitly convert the input string element to a number.
    var   a    =    input[0]   -   0    ;


    // Declare variable 'c' and initialize it with the second numeric value from the input array.
    // This value is taken from the fifth position (index 4) of the input.
    var   c    =    input[4]   -   0    ;   /* Input positions are crucial for correct operation. */

    // Check if the operator specified in the input (at index 2) is an addition symbol.
	if    (   input[2]    ==    '+'   )
    {
        // If it is, calculate the sum of 'a' and 'c' and print it to the console.
        console .log( a + c );
    }

 	// Otherwise, check if the operator is a subtraction symbol.
    if   (  input[2]    ==    '-'   )
    {
        // If it is, calculate the difference of 'a' and 'c' and print it to the console.
        console .log( a - c ) ;
    }

} // End of Main function definition.


// Call the Main function, providing it with input read from standard input.
// This uses Node.js's 'fs' module to synchronously read the entire content
// of '/dev/stdin' as a UTF-8 encoded string.
Main(  require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" )  ) ;
// The program execution concludes after the Main function has been called.