'use strict' ; /* This directive enforces stricter parsing and error handling in the code. */

process . stdin . resume ( ) ; // Begin standard input stream processing.
process . stdin . setEncoding ( 'utf-8' ) ; // Configure character encoding for incoming data.

let receivedText = '' ; /* Buffer to accumulate all input received from stdin. */
let lineIndex = 0 ; // Pointer to the current line being processed from the input buffer.

process . stdin . on ( 'data', function ( incomingData ) {
    receivedText += incomingData ; // Append the new chunk of data to the existing buffer.
} ) ;

process . stdin . on ( 'end', ( ) => {
    receivedText = receivedText . split ( '\n' ) ; // Divide the entire input string into an array of lines.
    runCoreLogic ( ) ; // Initiate the primary execution flow of the application.
} ) ;

/*
 * Utility function to retrieve the next available line from the prepared input array.
 * It also increments the internal line counter for subsequent calls.
 */
function fetchNextLine ( ) {
    return receivedText [ lineIndex++ ] ;
}

function runCoreLogic ( ) { // This is the main entry point for the program's logic.

    const parsedNumbers = fetchNextLine ( ) . split ( ' ' ) . map ( val => parseInt ( val , 10 ) ) ;
    const totalElements = parsedNumbers [ 0 ] ; // The first numerical parameter.
    const startValue = parsedNumbers [ 1 ] ; // The second numerical parameter.
    const endValue = parsedNumbers [ 2 ] ; // The third numerical parameter.

    // The calculation logic to determine the final count based on input parameters.
    const finalCount = Math . max ( ( totalElements - 2 ) * ( endValue - startValue ) + 1 , 0 ) ;

    console . log ( finalCount ) ; // Display the calculated result to the console.
}