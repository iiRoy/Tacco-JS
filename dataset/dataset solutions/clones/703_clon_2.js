process.stdin.resume();

process.stdin.setEncoding( 'utf8' );

process.stdin.on( 'data', function( rawInputLine ) {
    handleIncomingData( rawInputLine );
} );

const displayResult = console.log;

/**
 * Processes incoming data, splitting it into lines and filtering out empty entries.
 * @param {string} incomingText The raw string input from the console.
 */
function handleIncomingData( incomingText ) {
    let stringSegments = incomingText.split( "\n" );

    stringSegments = stringSegments.filter( function( segmentPiece ) {
        return ( segmentPiece !== "" );
    } );

    processDataSets( stringSegments );
}

// ---------------------------

/**
 * Executes the main logic for processing a collection of numerical datasets.
 * It iteratively processes segments, removes extreme values, and calculates rounded averages.
 * @param {string[]} stringRepresentations An array of string-encoded numbers.
 */
function processDataSets( stringRepresentations ) {
    const numericCollection = stringRepresentations.map( function( strNum ) {
        return Number( strNum );
    } );

    while ( numericCollection.length > 1 ) {
        let segmentSize = numericCollection.shift();

        const currentWorkingSegment = numericCollection.slice( 0, segmentSize );

        numericCollection = numericCollection.slice( segmentSize );

        const lowestValIdx = currentWorkingSegment.indexOf( Math.min.apply( null, currentWorkingSegment ) );

        currentWorkingSegment.splice( lowestValIdx, 1 );

        const highestValIdx = currentWorkingSegment.indexOf( Math.max.apply( null, currentWorkingSegment ) );

        currentWorkingSegment.splice( highestValIdx, 1 );

        const currentSegmentSum = currentWorkingSegment.reduce( function( accumulator, currentValue, currentIndex, arrayRef ) {
            return accumulator + currentValue;
        } );

        displayResult( Math.round( currentSegmentSum / currentWorkingSegment.length ) );
    }
}