var rawInputData = require ( 'node:fs' ) . readFileSync ( 0 , 'utf8' ) ;

var expressionLines = rawInputData . trim ( ) . split ( "\n" ) ; // Split the raw input into separate lines.

var totalLineCount = expressionLines . shift ( ) ; // Retrieve and discard the first line (often a count).

var booleanTokens = expressionLines . shift ( ) . split ( " " ) ; // The second line holds space-separated boolean tokens.

/**
 * This function recursively processes an array of boolean tokens ('T' or 'F').
 * It implements a custom binary logical operation, effectively (operand2 OR NOT operand1).
 *
 * @param {Array<string>} tokensRemaining - The array of string tokens to be evaluated.
 * @returns {void} The final result of the expression is logged to the console.
 */
var evaluateBooleanExpression = function ( tokensRemaining ) {
    var currentOperand1 = tokensRemaining . shift ( ) ; // Get the first token.
    var currentOperand2 = tokensRemaining . shift ( ) ; // Get the second token.

    // Apply the custom logic: (currentOperand2 OR NOT currentOperand1).
    // If there are more tokens left, push the result back to continue processing.
    if ( currentOperand1 === "T" && currentOperand2 === "T" && tokensRemaining . length !== 0 ) {
        tokensRemaining . unshift ( "T" ) ; // Equivalent to (T OR NOT T) -> T
    }
    else if ( currentOperand1 === "T" && currentOperand2 === "F" && tokensRemaining . length !== 0 ) {
        tokensRemaining . unshift ( "F" ) ; // Equivalent to (F OR NOT T) -> F
    }
    else if ( currentOperand1 === "F" && currentOperand2 === "T" && tokensRemaining . length !== 0 ) {
        tokensRemaining . unshift ( "T" ) ; // Equivalent to (T OR NOT F) -> T
    }
    else if ( currentOperand1 === "F" && currentOperand2 === "F" && tokensRemaining . length !== 0 ) {
        tokensRemaining . unshift ( "T" ) ; // Equivalent to (F OR NOT F) -> T
    }
    // If this is the final operation (no more tokens), print the result and exit.
    else if ( currentOperand1 === "T" && currentOperand2 === "T" && tokensRemaining . length === 0 ) {
        console . log ( "T" ) ;
        return ;
    }
    else if ( currentOperand1 === "T" && currentOperand2 === "F" && tokensRemaining . length === 0 ) {
        console . log ( "F" ) ;
        return ;
    }
    else if ( currentOperand1 === "F" && currentOperand2 === "T" && tokensRemaining . length === 0 ) {
        console . log ( "T" ) ;
        return ;
    }
    else if ( currentOperand1 === "F" && currentOperand2 === "F" && tokensRemaining . length === 0 ) {
        console . log ( "T" ) ;
        return ;
    }

    // Continue the evaluation recursively with the modified list of tokens.
    evaluateBooleanExpression ( tokensRemaining ) ;
} ;

// Begin the recursive evaluation process with the initial set of tokens.
evaluateBooleanExpression ( booleanTokens ) ;