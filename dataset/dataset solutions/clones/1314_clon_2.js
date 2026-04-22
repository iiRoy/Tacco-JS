/*
 * This self-executing function processes incoming textual information
 * to compute the frequency of lowercase alphabetic characters.
 */
( function ( rawData ) {
    // Initialize a structure to store character counts.
    // An array is used here but it behaves as a dictionary/map.
    let charOccurrences = [];

    // Populate the frequency map with all lowercase English alphabet letters,
    // initializing their counts to zero.
    for ( let asciiPosition = 'a'.charCodeAt( 0 );
          asciiPosition <= 'z'.charCodeAt( 0 );
          asciiPosition++ )
    {
        charOccurrences[ String.fromCharCode( asciiPosition ) ] = 0;
    }

    // Process each character from the raw input data.
    rawData . split ( '' ) . forEach ( function ( singleChar ) {
        // Convert the current character to lowercase for case-insensitive counting.
        let processedChar = singleChar . toLowerCase ( );

        // If the character is an English alphabet letter (i.e., present in our map),
        // increment its corresponding count.
        if ( processedChar in charOccurrences ) {
            charOccurrences[ processedChar ]++;
        }
    } );

    // Format and display the final character counts.
    console . log (
        Object . keys ( charOccurrences ) . map ( function ( letterSymbol ) {
            // Construct a string for each letter and its count.
            return letterSymbol + ' : ' + this[ letterSymbol ];
        }, charOccurrences ) . join ( '\n' )
    );

} ) (
    // Read input from standard input using Node.js file system module.
    require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' )
);