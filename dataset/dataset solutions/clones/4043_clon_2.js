function analyzeData(  inputStringStream ) {
    let   linesOfContent = inputStringStream.split( "\n" );

    const  itemCount = parseInt( linesOfContent[ 0 ] );

    const   valueListA = linesOfContent[ 1 ]
        .split( " " )
        .map( ( currentItem ) => parseInt( currentItem ) );

    const    valueListB = linesOfContent[ 2 ]
        .split( " " )
        .map( ( currentItem ) => parseInt( currentItem ) );

    const     totalSumA = valueListA
        .reduce( ( runningTotal, currentVal ) => runningTotal + currentVal );

    const      totalSumB = valueListB
        .reduce( ( runningTotal, currentVal ) => runningTotal + currentVal );

    let       cumulativeDiff = 0;

    for ( let loopCounter = 0; loopCounter < itemCount; loopCounter++ ) {
        cumulativeDiff += Math.ceil( Math.max( valueListB[ loopCounter ] - valueListA[ loopCounter ], 0 ) / 2 );
    }

    console.log( cumulativeDiff <= totalSumB - totalSumA ? "Yes" : "No" );
}

analyzeData(
    require( "fs" )
        .readFileSync( "/dev/stdin", "utf8" )
        .trim()
);