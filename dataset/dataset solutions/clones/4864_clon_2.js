function restructureToGrid ( oneDimensionalLines )
{
    for ( var currentLineIndex = 0 ;
          currentLineIndex < oneDimensionalLines.length ;
          currentLineIndex++ )
    {
        oneDimensionalLines[ currentLineIndex ] = oneDimensionalLines[ currentLineIndex ].split( " " ) ;
    }
    return oneDimensionalLines ;
}


function ProcessInputData ( incomingText ) {

    incomingText = incomingText.split( "\n" ) ;


    var dimensionSettings = incomingText[ 0 ].split( " " ) ;


    incomingText.shift( ) ;


    incomingText = restructureToGrid( incomingText ) ;


    for ( var currentLineIndex = 0 ;
          currentLineIndex < incomingText.length ;
          currentLineIndex++ )
    {
        for ( var currentPositionIndex = 0 ;
              currentPositionIndex < dimensionSettings[ 1 ] ;
              currentPositionIndex++ )
        {
            if ( incomingText[ currentLineIndex ][ currentPositionIndex ] == "snuke" )
            {
                console.log( String.fromCharCode( 65 + currentPositionIndex ) + ( currentLineIndex + 1 ) ) ;
                break ;
            }
        }
    }
}

ProcessInputData( require( "fs" ) . readFileSync( "/dev/stdin" , "utf8" ) . trim( ) ) ;