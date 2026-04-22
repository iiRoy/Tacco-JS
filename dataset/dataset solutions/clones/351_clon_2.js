/*
 * This file processes arithmetic equations containing 'X' as a placeholder digit.
 * It attempts to find a digit (0-9) that replaces 'X' to make the equation true.
 */

/**
 * Main processing function to evaluate numerical expressions.
 * Iterates through each line of input to solve equations.
 */
function executeProcessor ( )
{
    // Process each line of the received raw data.
    rawData . forEach ( function ( incomingLine )
    {
        // Variables to hold string parts of the equation and parsed numerical values.
        let firstOperandString, secondOperandString, resultString,
            parsedMatch,
            firstVal, secondVal, resultVal,
            digitIterator;

        // Skip empty lines to prevent errors.
        if ( incomingLine . trim ( ) === '' )
        {
            return ;
        }

        // Use a regular expression to extract the two operands and the result string.
        // The pattern looks for numbers or 'X' characters separated by '+' and '='.
        parsedMatch = incomingLine . match ( /([0-9X]+)\+([0-9X]+)\=([0-9X]+)/ ) ;

        // Assign the captured groups to their respective string variables.
        firstOperandString  = parsedMatch [ 1 ] ;
        secondOperandString = parsedMatch [ 2 ] ;
        resultString        = parsedMatch [ 3 ] ;

        // Iterate through possible digits from 0 to 9 to substitute for 'X'.
        for ( digitIterator = 0 ; digitIterator <= 9 ; digitIterator ++ )
        {
            // If the current digit is 0, check if it's at the beginning of any operand/result string.
            // Numbers typically don't start with 0 unless they are just '0' itself.
            // If 'X' is the first character and 'digitIterator' is 0, this substitution is invalid for multi-digit numbers.
            if ( ( digitIterator === 0 ) &&
                 ( ( firstOperandString . charAt ( 0 ) === 'X' ) ||
                   ( secondOperandString . charAt ( 0 ) === 'X' ) ||
                   ( resultString . charAt ( 0 ) === 'X' ) ) )
            {
                continue ; // Skip this iteration if 'X' is a leading digit and 'digitIterator' is 0.
            }

            // Replace all 'X' characters in the operand and result strings with the current digit.
            // Then, parse these modified strings into integers for calculation.
            firstVal  = parseInt ( firstOperandString . replace ( /X/g , digitIterator ) , 10 ) ;
            secondVal = parseInt ( secondOperandString . replace ( /X/g , digitIterator ) , 10 ) ;
            resultVal = parseInt ( resultString . replace ( /X/g , digitIterator ) , 10 ) ;

            // Check if the sum of the first two values equals the result value.
            if ( ( firstVal + secondVal ) === resultVal )
            {
                break ; // If the equation holds true, we've found the correct digit; exit the loop.
            }
        }

        // Output the found digit or 'NA' if no digit (0-9) satisfies the equation.
        console . log ( ( digitIterator === 10 ) ? 'NA' : digitIterator ) ;
    } ) ;
}


// Global variable to accumulate incoming data from standard input.
let rawData = '' ;

// Configure standard input stream.
process . stdin . resume ( ) ;                         // Ensure the standard input stream is active.
process . stdin . setEncoding ( 'utf8' ) ;               // Set the character encoding for the input.

// Event listener for incoming data chunks.
process . stdin . on ( 'data' , function ( dataChunk )
{
    rawData += dataChunk ; // Append each received data chunk to the rawData string.
} ) ;

// Event listener for the end of the input stream.
process . stdin . on ( 'end' , function ( )
{
    // When all data has been received, split the rawData into an array of lines.
    rawData = rawData . split ( '\n' ) ;
    // Call the main processing function to handle the parsed input.
    executeProcessor ( ) ;
} ) ;