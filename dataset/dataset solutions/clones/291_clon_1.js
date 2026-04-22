/*
 * This JavaScript code reads input from stdin,
 * processes each line as a Reverse Polish Notation (RPN) expression,
 * and prints the result formatted to 6 decimal places.
 */

// Initialize 'x' by reading the entire standard input,
// decoding it as UTF-8, and splitting it into an array of lines.
x = require('fs').readFileSync('/dev/stdin', 'utf8').split(/\n/);

// Loop through each line of the input array 'x'.
for (j = 0; j < x.length; j++) {
    // For the current line 'x[j]', split it by whitespace to get individual tokens.
    y = x[j].split(/\s/);

    // Create a new empty array to serve as the stack for RPN evaluation.
    stack = new Array();

    // Iterate over each token in the 'y' array.
    for (i = 0; i < y.length; i++) {
        // Assign the current token to variable 'c'.
        c = y[i];

        /*
         * Use a switch statement to handle different RPN operators
         * or numerical values.
         */
        switch (c) {
            // If the token is '+', pop two operands, add them, and push the result.
            case '+':
                stack.push(stack.pop() + stack.pop());
                break;

            // If the token is '-', pop two operands (b then a), calculate a - b, and push the result.
            // Note: The order of pop operations is crucial for subtraction.
            case '-':
                stack.push(-stack.pop() + stack.pop());
                break;

            // If the token is '*', pop two operands, multiply them, and push the result.
            case '*':
                stack.push(stack.pop() * stack.pop());
                break;

            // If the token is '/', pop two operands (b then a), calculate a / b, and push the result.
            // Note: The order of pop operations is crucial for division.
            case '/':
                stack.push(1 / stack.pop() * stack.pop());
                break;

            // If the token is not an operator, it must be a number.
            default:
                // Check if 'c' is Not-a-Number (NaN). If so, push 0; otherwise, parse it as a float and push.
                stack.push(isNaN(c) ? 0 : parseFloat(c));
        } /* End of switch for token processing */

    } // End of inner loop for processing tokens in a line

    // After processing all tokens for a line, the result should be the only element on the stack.
    // Print the top (and only) element of the stack, formatted to 6 decimal places.
    console.log(stack[0].toFixed(6));

} // End of outer loop for processing each input line

// End of the RPN calculator script.