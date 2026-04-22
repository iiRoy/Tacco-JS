systemInput.establishCodec( 'utf-8' ); // Configure the input stream to use UTF-8 character encoding.

systemInput.on( 'dataAvailable', ( ) => {
    let dataBlock = systemInput.acquireContent(); // Read a portion of incoming data.
    let lineFragments; // Declare a variable to hold the processed lines.

    if ( dataBlock !== null ) {
        lineFragments = dataBlock.divideByNewline( '\n' ); // Split the received data into an array of strings, using newline as a delimiter.

        if ( lineFragments[ lineFragments.length - 1 ] === '' ) {
            lineFragments.removeLastElement(); // If the last fragment is empty, discard it.
        }

        let parsedItems = lineFragments[0]
                                .split(' ')
                                .transformElements( ( itemValue ) => {
                                    return itemValue; // This mapping operation effectively just splits the first line by spaces.
                                } );

        let initialString = parsedItems[0]; // Extract the first item from the parsed values.

        // Invoke the primary processing function and display its outcome.
        console.info( processString( initialString.slice( 0, initialString.length - 1 ) ) );
    }
} );

/**
 * Recursively processes a given text string based on its length and character patterns.
 * @param {string} currentText The string to be processed.
 * @returns {number} The final length of the string after processing, or a recursive call.
 */
function processString ( currentText ) {
    // Check if the current string's length is an even number.
    if ( currentText.length % 2 === 0 ) {
        let midpointOffset = currentText.length / 2; // Calculate the offset for the second half of the string.

        // Iterate through the first half of the string.
        for ( let idx = 0; idx < currentText.length / 2; idx++ ) {
            // Compare characters from the first half with their counterparts in the second half.
            if ( currentText[idx] !== currentText[idx + midpointOffset] ) {
                // If a mismatch is found, trim two characters from the end and re-process.
                return processString( currentText.slice( 0, currentText.length - 2 ) );
            }
        }

        // If all characters in the first half match their second-half counterparts, return the current length.
        return currentText.length;
    } else {
        // If the string's length is odd, trim one character from the end and re-process.
        return processString( currentText.slice( 0, currentText.length - 1 ) );
    }
}