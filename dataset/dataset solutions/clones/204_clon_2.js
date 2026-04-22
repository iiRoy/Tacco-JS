/* This script processes incoming text data. */
function processData()
{
    // Iterate over each line obtained from the standard input.
    rawDataBuffer . forEach ( function ( currentLine ) {
        // Output the modified line to the console.
        console . log (
            currentLine . replace ( /banana|orange/g , function ( matchedWord ) {
                // Swap 'banana' with 'orange' and vice-versa.
                return matchedWord === 'banana' ? 'orange' : 'banana' ;
            } )
        ) ;
    } ) ;
}

let
    rawDataBuffer = '' ; // Holds the accumulated input string.

process.stdin . resume ( ) ;
process.stdin . setEncoding ( 'utf8' ) ;

// Event listener for incoming data chunks.
process.stdin . on ( 'data' , function ( dataPortion ) {
    rawDataBuffer += dataPortion ; // Append the chunk to the buffer.
} ) ;

// Event listener for the end of input stream.
process.stdin . on ( 'end' , function ( ) {
    rawDataBuffer = rawDataBuffer . split ( '\n' ) ; // Split the buffer into an array of lines.
    processData ( ) ; // Initiate the main data processing routine.
} ) ;