inputDataLines = require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) . split ( / \n / ) ; // Read all input lines from standard input stream

for ( let lineIterator = 0 ; lineIterator < inputDataLines.length ; lineIterator ++ ) { // Process each line as a separate expression

  let tokenizedExpression = inputDataLines [ lineIterator ] . split ( / \s / ) ; // Split the current line into individual tokens (numbers or operators)

  let computationStack = new Array ( ) ; // Initialize an empty stack for Reverse Polish Notation (RPN) evaluation

  for ( let tokenIterator = 0 ; tokenIterator < tokenizedExpression.length ; tokenIterator ++ ) { // Iterate through each token in the expression

    let currentElement = tokenizedExpression [ tokenIterator ] ; // Get the current token

    switch ( currentElement ) { // Evaluate the token based on its type

      case '+' :
        computationStack.push ( computationStack.pop ( ) + computationStack.pop ( ) ) ; // Pop two operands, add them, and push the result
        break ;

      case '-' :
        // For subtraction, the order of popping matters.
        // The first pop is the second operand, the second pop is the first operand.
        computationStack.push ( - computationStack.pop ( ) + computationStack.pop ( ) ) ; // Effectively: operand1 - operand2
        break ;

      case '*' :
        computationStack.push ( computationStack.pop ( ) * computationStack.pop ( ) ) ; // Pop two operands, multiply them, and push the result
        break ;

      case '/' :
        // For division, the order of popping matters.
        // The first pop is the divisor (second operand), the second pop is the dividend (first operand).
        computationStack.push ( 1 / computationStack.pop ( ) * computationStack.pop ( ) ) ; // Effectively: operand1 / operand2
        break ;

      default :
        // If it's not an operator, it must be a number (or invalid).
        // Convert to float, fix precision, and push onto the stack.
        // If not a number, push 0.
        computationStack.push ( isNaN ( currentElement ) ? 0 : parseFloat ( currentElement ) . toFixed ( 6 ) ) ;
    } // End of switch statement for token evaluation
  } // End of loop for processing tokens in an expression

  console . log ( computationStack [ 0 ] ) ; // After processing all tokens, the result is the only element left on the stack
} // End of loop for processing all input lines