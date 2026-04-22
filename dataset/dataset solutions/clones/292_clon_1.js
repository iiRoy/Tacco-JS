// This script reads input from /dev/stdin, processes it as RPN (Reverse Polish Notation),
// and prints the result of each line.

// Initialize variable x by reading the input file.
// The file is read as UTF-8 and then split into an array of lines.
x = require('fs') . readFileSync('/dev/stdin' , 'utf8') . split(/\n/) ;


// Loop through each line of the input array 'x'.
for ( j = 0 ; j < x . length ; j++ )
{

    // Split the current line into tokens based on whitespace.
    y = x[j] . split(/\s/) ;

    // Create a new empty array to serve as the operand stack for RPN evaluation.
    stack = new Array() ;

    // Iterate over each token in the current line.
    for ( i = 0 ; i < y . length ; i++ )
    {
        // Get the current token.
        c = y[i] ;

        // Use a switch statement to handle different RPN operations.
        switch ( c )
        {
            // Addition operation: Pop two operands, add them, and push the result.
            case '+' :
                stack . push ( stack . pop ( ) + stack . pop ( ) ) ;
                break ;

            // Subtraction operation: Pop two operands (A then B), calculate B - A, then push.
            // Note: The order of popping for subtraction and division is important.
            case '-' :
                stack . push ( - stack . pop ( ) + stack . pop ( ) ) ;
                break ;

            // Multiplication operation: Pop two operands, multiply them, and push the result.
            case '*' :
                stack . push ( stack . pop ( ) * stack . pop ( ) ) ;
                break ;

            // Division operation: Pop two operands (A then B), calculate B / A, then push.
            case '/' :
                stack . push ( 1 / stack . pop ( ) * stack . pop ( ) ) ;
                break ;

            // Default case: If the token is not an operator, it's an operand.
            default :
                // Check if the token is Not-a-Number (isNaN).
                // If it is, push 0. Otherwise, parse it as a float and push to 6 decimal places.
                stack . push ( isNaN ( c ) ? 0 : parseFloat ( c ) . toFixed ( 6 ) ) ;
        } // End of switch statement.

    } // End of inner loop (token iteration).

    // After processing all tokens in a line, the result should be the only element on the stack.
    // Print the result to the console.
    console . log ( stack[0] ) ;

} // End of outer loop (line iteration).

// End of script.