/*
 * This is a Type I clone of the original JavaScript code.
 * It demonstrates variations in whitespace and comments
 * while preserving the exact structure and logic of the source.
 */

function Main  (   input   ) { // Start of the main function definition
    // Declare a variable 'a' and initialize it.
    // The '-0' is used to explicitly convert the string to a number.
    var  a   =   input [ 0 ]   -   0   ;

    // Log the result of the calculation to the console.
    // The calculation is 'a' multiplied by 2 and then by Math.PI.
    console . log ( a * 2 * Math . PI ) ;

} // End of the Main function definition


// Call the Main function with input read from standard input.
// This line reads the content of '/dev/stdin',
// decodes it as UTF-8, removes leading/trailing whitespace,
// and splits it into an array of lines.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) . trim ( ) . split ( "\n" ) ) ;
    // This comment is intentionally placed here to demonstrate varied spacing.