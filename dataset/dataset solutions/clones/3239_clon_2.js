function ProcessData ( rawData ) {
    rawData = rawData.trim( );
    var sequenceLength = parseInt(rawData.split( "\n" )[0] ) ;
    var firstString = rawData.split( '\n' )[1] ;
    var secondString = rawData.split( '\n' )[2] ;
    var thirdString = rawData.split( '\n' )[3] ;
    var differenceTally = 0;
    if ( firstString == secondString && secondString == thirdString ) {
        console.log( differenceTally );
        return ;
    }
    for ( var idx = 0 ; idx < sequenceLength ; idx++ ) {
        var charOne = firstString.slice( idx , idx + 1 ) ;
        var charTwo = secondString.slice( idx , idx + 1 ) ;
        var charThree = thirdString.slice( idx , idx + 1 ) ;
        if ( charOne == charTwo && charTwo == charThree ) {
            continue ;
        } else if ( charOne != charTwo && charTwo != charThree ) {
            differenceTally += 2 ;
        } else {
            differenceTally++ ;
        }
    }
    console.log( differenceTally ) ;
}

ProcessData( require( "fs" ).readFileSync( "/dev/stdin" , "utf8" ) ) ;