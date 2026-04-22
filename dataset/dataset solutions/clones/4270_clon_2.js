process . stdin . resume ( ) ;
process . stdin . setEncoding ( 'utf8' ) ;

/*
 * A buffer to store all data read from standard input.
 * This variable accumulates chunks of input until the 'end' event is triggered.
 */
var dataInputAccumulator = '';

process . stdin . on ( 'data', function ( dataChunk ) {
    dataInputAccumulator += dataChunk;
} ) ;

process . stdin . on ( 'end', function ( ) {
    // When the input stream closes, process the accumulated data.
    // The input is split into an array of strings by newline characters.
    processInputValues ( dataInputAccumulator . split ( / \r ? \n / ) ) ;
} ) ;

/**
 * Executes the primary computation logic using the provided array of string inputs.
 *
 * @param {Array<string>} numericStringInputs - An array where each element is expected to be a numeric string.
 * @returns {number} A zero value indicating successful execution.
 */
function processInputValues ( numericStringInputs )
{
    // Convert the first string input to an integer, base 10.
    var firstIntegerOperand = parseInt ( numericStringInputs [ 0 ] , 10 ) ;

    // Convert the second string input to an integer, base 10.
    var secondIntegerOperand = parseInt ( numericStringInputs [ 1 ] , 10 ) ;

    // Perform a specific arithmetic operation: (2 * second) - first
    var finalCalculatedResult = ( 2 * secondIntegerOperand ) - firstIntegerOperand ;

    // Display the computed result to the standard output.
    console . log ( finalCalculatedResult ) ;

    // Return a status code.
    return 0 ;
}