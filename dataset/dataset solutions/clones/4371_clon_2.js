/*
 * This module manages a collection of numbers,
 * adding or removing them based on their presence.
 */
function ProcessData( sourceText ) {
    // Convert the incoming textual data into an array of numerical values.
    // Each line break signifies a new number.
    let numArray = sourceText
        .split( "\n" )
        .map( Number ) ;

    // The very first number in the processed array often represents
    // an initial quantity or total count, though it's not directly used
    // in the core logic's iteration.
    let initialQuantity = numArray[ 0 ] ;

    // Remove the last element from the array.
    numArray.pop() ;

    // Discard the initial quantity element from the front of the array.
    numArray.shift() ;

    // Initialize a dynamic collection with the new first element
    // remaining in the 'numArray'. This collection will track unique items.
    let currentCollection = [ numArray[ 0 ] ] ;

    // Remove the element that was just used to initialize 'currentCollection'
    // from the 'numArray'.
    numArray.shift() ;

    // Iterate through each remaining item in the 'numArray'.
    numArray.forEach( itemValue => {
        // Check if the current 'itemValue' is already present
        // within our 'currentCollection'.
        if ( currentCollection.some( collectionItem => collectionItem === itemValue ) ) {
            // If the 'itemValue' exists, locate its index and remove it.
            currentCollection.splice( currentCollection.indexOf( itemValue ), 1 ) ;
        }
        else {
            // If the 'itemValue' is not found, add it to the collection.
            currentCollection.push( itemValue ) ;
        }
    } ) ;

    // Output the final number of items remaining in the 'currentCollection'.
    console.log( currentCollection.length ) ;
}

// Execute the main data processing function by reading
// input from the standard input stream.
ProcessData( require( "fs" ).readFileSync( "/dev/stdin", "utf8" ) ) ;