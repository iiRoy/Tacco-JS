// This JavaScript file presents a re-formatted and commented version of an original script.
// It serves as a Type I clone, meaning its logical structure and operational semantics
// are identical to the source code, with modifications limited exclusively to
// whitespace (indentation, spacing, blank lines) and comments.

/**
 * The primary function responsible for executing the core logic of the program.
 * It takes a raw string input, processes it, and then applies a series of
 * arithmetic operations based on specific conditions to a numerical variable.
 *
 * @param {string} input - A string containing numerical data, typically read from standard input.
 */
function Main ( input ) {

    // Process the raw input string:
    // 1. Split the string into an array of substrings using the newline character as a delimiter.
    // 2. Map each substring in the resulting array to its numerical equivalent.
    // This converts the input from a multi-line string of numbers into an array of actual numbers.
    input = input.split( "\n" ).map( Number ) ;

    // Initialize the 'now' variable. This variable will be dynamically updated
    // throughout the program's execution based on the defined rules.
    var now = 1 ;

    // Begin a loop that iterates a number of times determined by the first element
    // of the processed input array (input[0]).
    for ( var i = 0 ; i < input[0] ; i++ )
    {
        // Inside the loop, evaluate a conditional statement:
        // Check if the current value of 'now' is greater than or equal to the
        // second element of the processed input array (input[1]).
        if ( now >= input[1] )
        {
            // If the condition is true, add the value of input[1] to 'now'.
            // This represents one branch of the arithmetic logic.
            now += input[1] ;
        }
        else
        {
            // If the condition is false, multiply the current value of 'now' by 2.
            // This represents the alternative branch of the arithmetic logic.
            now *= 2 ;
        }

    } // The loop concludes after 'input[0]' iterations.

    // After the entire loop has completed its execution, the final calculated value
    // of 'now' is printed to the standard output (console).
    console.log( now ) ;

} // End of the Main function definition.


// This line immediately invokes the 'Main' function upon script execution.
// It reads the input from the standard input stream ('/dev/stdin'), converts
// it to a UTF-8 encoded string, and then removes any leading or trailing
// whitespace before passing it as an argument to the 'Main' function.
Main( require( "fs" ).readFileSync( "/dev/stdin" , "utf8" ).trim() ) ;