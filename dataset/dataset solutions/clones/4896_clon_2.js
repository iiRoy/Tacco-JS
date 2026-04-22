function ProcessInput( rawData ) {
	let lines = rawData.split( "\n" );
	let secondLineParts = lines[ 1 ].split( " " );

	let initialCount = parseInt( lines[ 0 ], 10 );
    let initialSequence = [];
    initialSequence.length = ( 2 * initialCount ) - 1;

    for ( let k = 0; k < initialSequence.length; k++ ) {
        initialSequence[ k ] = parseInt( secondLineParts[ k ], 10 );
    }

    function computeNextSequence( currentSequence ) {
        let nextGeneratedSequence = [];
        nextGeneratedSequence.length = currentSequence.length - 2;
        for ( let m = 0; m < nextGeneratedSequence.length; m++ ) {
            let subSegment = currentSequence.slice( m, m + 3 );
            nextGeneratedSequence[ m ] = subSegment.sort(
              function( valA, valB ) {
                return ( valA < valB ? -1 : 1 );
              }
            )[ 1 ];
        }
        return nextGeneratedSequence;
    }

    let workingSequence = initialSequence;
    while ( workingSequence.length > 1 ) {
        workingSequence = computeNextSequence( workingSequence );
    }
	console.log( workingSequence[ 0 ] );
}

ProcessInput( require( "fs" ).readFileSync( "/dev/stdin", "utf8" ) );