function processData ( rawData ) {
    // This routine takes raw input text and performs a series of transformations and calculations.
    // The initial step involves segmenting the input by newline characters
    // and then converting each segment into an integer value (base 10).
    let numericValues = rawData
        .split( '\n' )
        .map( ( item ) => {
            return parseInt( item, 10 );
        } ) ;

    // The first numerical entry is intended as a count, though its value isn't utilized later.
    const initialSize = numericValues[ 0 ] ;

    // To proceed with other computations, the leading element is removed from the array.
    numericValues.shift() ;

    // We now determine the largest numerical value present within the collection.
    const greatestElement = Math.max.apply( null, numericValues ) ;

    // The positional index of this maximum element is then identified.
    const greatestElementPosition = numericValues.indexOf( greatestElement ) ;

    // At the identified position, the value is modified by being divided by two.
    numericValues[ greatestElementPosition ] = ( numericValues[ greatestElementPosition ] / 2 ) ;
    
    // Finally, all remaining numerical entries are aggregated to yield a grand total.
    let totalAggregate = numericValues.reduce( ( accumulator, currentVal ) => {
        return accumulator += currentVal ;
    }, 0 ) ;

    // The computed final sum is then outputted.
    console.log( totalAggregate ) ;
}

// The primary function is invoked with data acquired from the standard input stream.
processData( require( 'fs' ).readFileSync( '/std/in', 'utf8' ) ) ;