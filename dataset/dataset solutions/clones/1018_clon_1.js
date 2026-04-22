/*
 * This JavaScript file processes a mathematical expression in Reverse Polish Notation (RPN).
 * It reads input from standard input, parses it, and computes the result using a stack.
 */

'use strict' ; /* Enforce strict mode for cleaner code and fewer errors. */

// Import the Node.js 'fs' (file system) module to read input.
let    input= require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ; // Read the entire content of /dev/stdin as a UTF-8 string.

// Process the raw input: remove leading/trailing whitespace and split into an array of strings by space.
input = input . trim( ) . split ( ' ' ) ;

// Initialize an empty array to serve as our operand stack.
const stack = [ ] ;

/*
 * Iterate through each element (token) in the processed input array.
 * This loop processes the RPN expression token by token.
 */
for (let i = 0 ; i < input . length ; ++ i )
{
  // Get the current token.
  const  v  =  input [ i ] ;

  // Use a switch statement to handle different types of tokens: operators or numbers.
  switch ( v )
  {
    // If the token is a '+' operator.
    case '+' :
      // Pop the top two operands, add them, and push the result back onto the stack.
      // Note: The order of `pop()` calls is important for subtraction/division, but for addition it doesn't matter.
      stack . push ( stack . pop ( ) + stack . pop ( ) ) ;
      break ; // Exit the switch statement.

    // If the token is a '-' operator.
    case '-' :
      // Pop the top two operands. The second pop() is the first operand, and the first pop() is the second operand.
      // So, it's (first_popped_value - second_popped_value) usually, but here it's cleverly done as -b + a.
      // Example: stack has [5, 3]. pop() gets 3, pop() gets 5. Result is -3 + 5 = 2. (5 - 3)
      stack . push ( - stack . pop ( ) + stack . pop ( ) ) ;
      break ; // Exit the switch statement.

    // If the token is a '*' operator.
    case '*' :
      // Pop the top two operands, multiply them, and push the result back onto the stack.
      stack . push ( stack . pop ( ) * stack . pop ( ) ) ;
      break ; // Exit the switch statement.

    // If the token is not an operator, it must be a number.
    default :
      // Convert the token string to a number and push it onto the stack.
      stack . push ( Number ( v ) ) ;
      break ; // Exit the switch statement.
  } // End of switch statement for token processing.
} // End of for loop iterating through input tokens.

// After processing all tokens, the final result will be the only element left on the stack.
// Print the result to the console.
console . log ( stack [ 0 ] ) ; // Access the first (and only) element of the stack.