/*
 * This JavaScript program processes input to determine a specific value.
 * It's designed to read from standard input and output a single digit.
 */

// The main function that orchestrates the input processing and logic.
// It takes the entire input string as its argument.
function    Main ( input )
{

    // Declare a variable 'inputs' to store the lines of the input.
    // The input string is split by newline characters to create an array of strings.
    var inputs  =  input . split ( '\n' ) ;


    // Declare a variable 'day'.
    // It takes the second line of the input (at index 1) and splits it by spaces.
    // This assumes the second line contains space-separated values,
    // and we are interested in one of them.
    var day     =  inputs [ 1 ] . split ( ' ' ) ;


    // This is a conditional block.
    // It checks if the second element (at index 1) of the 'day' array
    // is strictly equal to the string literal '1'.
    if  ( day [ 1 ]  ===  '1' )
    {
        // If the condition is true, print the integer 1 to the console.
        console . log ( 1 ) ;
    }
    // This 'else' block executes if the 'if' condition is false.
    else
    {
        // If the condition is false, print the integer 0 to the console.
        console . log ( 0 ) ;
    }

} // End of the Main function definition.


// This line is responsible for executing the Main function.
// It reads the entire content of '/dev/stdin' (standard input) synchronously
// using Node.js's 'fs' module. The content is decoded as UTF-8.
// The resulting string is then passed as the 'input' argument to the Main function.
Main ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ;