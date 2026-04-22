// This module provides a core function for numerical processing based on string input.
'use strict';

/**
 * Orchestrates the main computational flow using provided textual data.
 * @param {string} incomingText - The entire text string that requires parsing.
 */
function performCalculation( incomingText )
{
    // Break down the input string into individual components using space as a delimiter.
    const numericalStrings = incomingText . trim ( ) . split ( ' ' ) ;

    // Convert the initial string component to its numeric equivalent.
    const firstOperand = Number ( numericalStrings [ 0 ] ) ;

    // Convert the subsequent string component to its numeric equivalent.
    const secondOperand = Number ( numericalStrings [ 1 ] ) ;

    // Compute the result: firstOperand divided by (secondOperand multiplied by 2),
    // then round this quotient up to the nearest whole integer, and display it.
    console . log ( Math . ceil ( firstOperand / ( secondOperand * 2 ) ) ) ;
}

// Acquire input from the standard input stream and pass it to the primary processing routine.
performCalculation( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;