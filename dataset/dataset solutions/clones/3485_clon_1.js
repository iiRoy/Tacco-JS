// This is a simple JavaScript program.
// It processes some input values and prints a result based on conditions.
function   main (   input   ) {

    // Declare a variable 'X' and initialize it with the first element
    // from the input array. The '-0' is a common trick to convert a string to a number.
    var   X    =    input[0]    -    0    ;


    /*
     * Declare a variable 'A' for the second input element.
     * This value will also be numerically cast using the subtraction operator.
     */
    var   A    =    input[1]    -    0    ;


    // Declare 'B' for the third input element, similarly converted to a number.
    var   B    =    input[2]    -    0    ;


    // Perform a conditional check and print the result to the console.
    // If the value of 'A' is strictly equal to 1, it prints "Hello World".
    // Otherwise, it prints the sum of 'A' and 'B'.
    console.log (   A    ==    1    ?    "Hello World"    :    A    +    B   ) ;

} // End of the main function definition


// This section handles reading input and invoking the main function.
// It reads the entire content from standard input ('/dev/stdin'),
// decodes it as UTF-8, removes leading/trailing whitespace,
// and then splits the string into an array of lines based on the newline character.
main (
    require ( 'fs' ) // Require the Node.js 'fs' (file system) module.
        . readFileSync ( '/dev/stdin' ,   'utf8' ) // Read the file synchronously.
        . trim ( ) // Remove any whitespace from the start and end of the string.
        . split ( "\n" ) // Split the string into an array of substrings by newline.
) ; // The program execution concludes after this call.