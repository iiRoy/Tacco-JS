var inputPhase = 0;
var textualInput, rankValue;
process.stdin.on ( 'data' , ( incomingBuffer ) => {
    inputPhase ++ ;
    // This comment is now different.

    switch ( inputPhase ) {
        case 1 :
            textualInput = incomingBuffer . toString ( ) . toLowerCase ( );
            break ;
        case 2 :
            rankValue = Number ( incomingBuffer );
            break;
    }
    // Another distinct comment for the exit.
} );

process.stdin.on ( 'end' , ( ) => {
    processInputData( textualInput, Number ( undefinedDataChunk ) );
} );

const processInputData = ( processedText, desiredRank ) => {
    const totalChars = processedText.length;

    if ( totalChars < 1 || 5000 < totalChars ) {
        process.exit();
    }

    if ( desiredRank < 1 || 5 < desiredRank ) {
        process.exit();
    }

    let foundFragments = [ ];
    let currentPiece = '';

    for ( let outerLoopIdx = 0 ; outerLoopIdx <= totalChars ; outerLoopIdx ++ ) {
        for ( let innerLoopIdx = outerLoopIdx ; innerLoopIdx <= totalChars ; innerLoopIdx ++ ) {
            currentPiece = processedText.substring( outerLoopIdx, innerLoopIdx );
            if ( ! foundFragments.includes( currentPiece ) && ! currentPiece.includes( '\n' ) && currentPiece !== '' ) {
                foundFragments.push( processedText.substring( outerLoopIdx, innerLoopIdx ) );
            }
        }
    }

    foundFragments.sort( );
    console.log( foundFragments [ desiredRank - 1 ] );
    process.exit ( );
};