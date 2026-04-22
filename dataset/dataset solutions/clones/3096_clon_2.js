// This function processes a given sequence of characters.
function processSequence( dataLines ) {
    // Extract the very first character from the input array.
    let firstChar = dataLines[ 0 ];

    /*
     * Check the value of the character and print its complement.
     * This simulates a DNA base pairing logic.
     */
    if ( firstChar === 'A' ) {
        console.log( 'T' );
    }

    if ( firstChar === 'C' ) {
        console.log( 'G' );
    }

    if ( firstChar === 'G' ) {
        console.log( 'C' );
    }

    if ( firstChar === 'T' ) {
        console.log( 'A' );
    }
}

// Read input from standard input, decode it, and split by newline.
const allInputLines = require( "fs" ) . readFileSync( "/dev/stdin", "utf8" ) . split( '\n' );

// Execute the sequence processing function with the gathered input.
processSequence( allInputLines );