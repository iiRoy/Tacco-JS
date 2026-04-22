"use strict"; // Enforce strict parsing and error handling for cleaner code.
    
// This primary routine handles the processing of incoming textual data.
const processInput = (      dataStream ) =>
{
    // First, sanitize the input: remove leading/trailing spaces, then divide into distinct lines.
    dataStream = dataStream .trim() .split( "\n" ) ;
    
    // Extract the numerical count of items from the initial segment of the first line.
    const itemCount = parseInt( dataStream [ 0 ] .split( " " ) [ 0 ] ) ;

    // Convert the elements of the second line into an array of whole numbers.
    const initialElements = dataStream [ 1 ] .split( " " ) .map( ( numericString ) => { return parseInt( numericString ); } ) ;
    
    // Generate a new array containing the original elements, arranged in ascending order.
    const orderedElements = [ ...initialElements ] .sort( ( valA , valB ) => valA - valB ) ;
    
    // Calculate the first (lower) median value from the sorted collection.
    const lowerMedianValue = orderedElements [ ( itemCount / 2 ) - 1 ] ;
    
    // Determine the second (upper) median value from the sorted collection.
    const upperMedianValue = orderedElements [ itemCount / 2 ] ;

    // Prepare an array to accumulate the final computed outcomes.
    let finalResults = [];
    
    // Iterate through each element in the original unsorted array.
    for ( let currentIdx in initialElements ) {
        // Based on comparison with the upper median, select which median to push to results.
        if ( initialElements [ currentIdx ] < upperMedianValue ) {
            finalResults .push( upperMedianValue );
        } else {
            finalResults .push( lowerMedianValue );
        }
    }
    
    // Output the collected results, with each entry separated by a newline character.
    console.log( finalResults .join( "\n" ) );
};

// Execute the main processing function, feeding it content read from the standard input stream.
processInput( require( 'fs' ) .readFileSync( '/dev/stdin' , 'utf8' ) );