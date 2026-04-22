/*
 * This JavaScript file processes mathematical expressions from standard input.
 * It reads lines, tokenizes them, and evaluates them using a stack-based approach,
 * similar to Reverse Polish Notation (RPN) evaluation.
 *
 * This is a Type I clone, preserving all original identifiers, operators, and expressions.
 * Only whitespace and comments have been altered.
 */

// Import the 'fs' (file system) module to handle file operations, specifically reading from stdin.
var input = require ( 'fs' ) . readFileSync ( '/dev/stdin' ,  'utf8' ) . trim ( ) ;

// Split the entire input string into an array of individual lines.
// Each element in the 'lines' array will correspond to one line read from the input.
var lines = input . split ( '\n' ) ;


// Declare a variable 'line' which will temporarily store each line as it's processed.
var line ;

// Begin a loop that iterates through each line obtained from the input.
// The 'lines.shift()' method removes the first element from the 'lines' array and returns it.
// The loop continues as long as a line is successfully shifted (i.e., not undefined/null).
while ( line  =  lines . shift ( ) )
{
        // For the current line, first remove any leading/trailing whitespace,
        // then split it into an array of tokens based on one or more spaces.
        var tokens = line . trim ( ) . split ( / +/ ) ;

        // Initialize an empty array to serve as the operand stack for evaluating the expression.
        var stack = [ ] ;

        // Process each token from the 'tokens' array until it becomes empty.
        while ( tokens . length )
        {
                // Extract the next token from the beginning of the 'tokens' array.
                var token = tokens . shift ( ) ;

                // Check if the token represents a numeric value.
                // The unary plus operator attempts to convert 'token' to a number.
                // If the conversion is successful and the value matches the original token
                // (e.g., "123" converts to 123, and 123 == "123" is true due to type coercion,
                // but "abc" converts to NaN, and NaN == "abc" is false), it's considered a number.
                if ( + token  ==  token )
                {
                        // If the token is a number, push it onto the stack.
                        stack . push ( token ) ;
                }
                else
                {
                        // If the token is an operator, we need to perform an operation.
                        // Pop the top two operands from the stack. 'a' is the second operand, 'b' is the first.
                        var a = stack . pop ( ) ;
                        var b = stack . pop ( ) ;

                        // Evaluate the expression formed by 'b', 'token' (operator), and 'a'.
                        // The 'eval()' function is used here to dynamically execute the string as JavaScript code.
                        // Note: Using 'eval()' with untrusted input can be a security risk.
                        stack . push ( eval ( b  +  token  +  a ) ) ;
                }
        }

        // After all tokens for the current line have been processed, the stack should contain the final result.
        // Pop this result, format it to a string with exactly 6 decimal places, and print it to the console.
        console . log ( stack . pop ( ) . toFixed ( 6 ) ) ;
}

// End of the program logic.