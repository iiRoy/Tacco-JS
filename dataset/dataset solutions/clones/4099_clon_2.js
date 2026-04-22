'use strict';

/**
 * Core processing routine for the application.
 * @param {string} rawInputText - The complete raw data provided as input.
 */
const processInputData = ( rawInputText ) => {
    // Obtain the initial line from the input and convert it into a sequence of characters.
    const characterSequence = rawInputText
        .split ( '\n' ) [0]
        .split ( '' ) ;

    // Update a specific character within the obtained sequence.
    characterSequence [3] = '8';

    // Output the modified character sequence as a single concatenated string.
    console . log ( characterSequence . join ( '' ) ) ;
};

// Initiate the data processing by reading content from the standard input stream.
processInputData (
    require ( 'fs' )
        . readFileSync ( '/dev/stdin' , 'utf8' )
) ;