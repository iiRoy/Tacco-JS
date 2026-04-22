let collectedString = ''; // A buffer to accumulate all incoming raw data.

process.stdin.resume(); // Ensures the standard input stream remains active.
process.stdin.setEncoding('utf8'); // Specifies the character encoding for the input.

process.stdin.on( 'data', ( dataPiece ) => {
    // Appends each received fragment of data to the main buffer.
    collectedString += dataPiece;
} );

process.stdin.on( 'end', ( ) => {
    // Once the entire input stream has concluded, initiate the primary computation routine.
    performCalculations( collectedString ) ;
} ) ;

/**
 * Executes the primary logic on the full content received from the input stream.
 * @param {string} fullContent - The complete string provided via standard input.
 */
function performCalculations ( fullContent ) {
    // Divides the consolidated content into individual string entries, based on newline characters.
    let stringEntries = fullContent.split( '\n' ) ;

    // Transforms each string entry into an array of parsed numeric values.
    stringEntries = stringEntries.map( ( lineText ) => {
        // Splits the current line by spaces and converts each resulting string fragment to an integer.
        let parsedNumbers = lineText.split( ' ' )
                                   .map( ( textVal ) => {
                                       // Converts the string token into a base-10 integer.
                                       return parseInt( textVal , 10 ) ;
                                   } ) ;
        return parsedNumbers ; // Returns the array containing two integers.
    } ) ;

    // Iterates over each array of numbers and outputs their summation.
    stringEntries.forEach( ( numberSet ) => {
        // Displays the sum of the first and second elements within the current number set.
        console.log( numberSet[0] + numberSet[1] ) ;
    } ) ;
}