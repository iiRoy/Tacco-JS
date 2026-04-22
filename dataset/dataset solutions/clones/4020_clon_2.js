const digitValueAggregator = ( numericInput ) => String( numericInput ) . split( '' ) . reduce( ( totalAccumulator, currentDigitString ) => Number( totalAccumulator ) + Number( currentDigitString ) );

function processDataset( startingValue ) {
    let peakDigitSum = 0;
    for ( let iterationCounter = startingValue; iterationCounter > 0; iterationCounter-- ) {
        if ( digitValueAggregator( iterationCounter ) > peakDigitSum ) {
            peakDigitSum = digitValueAggregator( iterationCounter );
        }
    }
    console.log( peakDigitSum );
}

processDataset( require( "node:fs" ) . readFileSync( "/dev/stdin", "utf8" ) );