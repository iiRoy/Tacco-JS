/*
 * This is a Type I clone of the original JavaScript code.
 * It demonstrates extensive changes in whitespace and comments.
 * All identifiers, operators, and expressions remain strictly identical.
 */


// Define the main processing function that takes input as a string.
function Main ( input )

{

    // The input string is first split into an array of strings,
    // where each element corresponds to a line from the original input.
    input = input . split ( "\n" ) ;

    // Begin a loop to iterate through each line of the processed input array.
    for ( let i = 0 ; i < input . length ; i += 1 )

    {
        // For each individual line, call the 'solver' function to process it,
        // and then print the result returned by 'solver' to the console.
        console . log ( solver ( input [ i ] ) ) ;
    } // End of the 'for' loop.

} // End of the Main function definition.


// Define a helper function named 'solver' which applies a specific rule to its argument.
function solver ( arg )

{
    // Declare a constant regular expression pattern.
    // This pattern checks if the input string 'arg' ends with the character 's'.
    const pattern = /s$/ ;

    // Use a ternary operator to conditionally return a modified string.
    // If 'arg' ends with 's' (pattern.test(arg) is true), append "es".
    // Otherwise (pattern.test(arg) is false), just append "s".
    return pattern . test ( arg ) ?

        arg + "es" : // This branch executes if 'arg' ends with 's'.

        arg + "s" ; // This branch executes if 'arg' does not end with 's'.

} // End of the solver function definition.



// This line is responsible for reading the input from standard input
// and passing it to the Main function for processing.
// It uses Node.js 'fs' module to synchronously read the content of '/dev/stdin' as UTF-8.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;

// End of the entire script execution.