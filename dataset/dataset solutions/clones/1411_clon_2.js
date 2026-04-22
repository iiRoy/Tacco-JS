function  processInputData ( rawInputLines )
{
    for ( var lineIterator = 0; ; lineIterator++ )
    {
        if ( rawInputLines[ lineIterator ] == '0 0' ) {
            break ;
        }

        var dimensionTokens = rawInputLines[ lineIterator ].split( /\s+/ ) ;
        var heightValue = parseInt( dimensionTokens[ 0 ], 10 ) ;
        var widthValue = parseInt( dimensionTokens[ 1 ], 10 ) ;

        var gridBuffer = new Array( heightValue ) ;
        for ( var rowCounter = 0; rowCounter < gridBuffer.length; rowCounter++ )
        {
            gridBuffer[ rowCounter ] = new Array( heightValue ) ;
            for ( var colCounter = 0; colCounter < gridBuffer[ rowCounter ].length; colCounter++ )
            {
                gridBuffer[ rowCounter ][ colCounter ] = ( ( colCounter + rowCounter ) % 2 == 0 ) ? '#' : '.' ;
            }
            gridBuffer[ rowCounter ] = gridBuffer[ rowCounter ].join( '' ) + '\n' ;
        }
        gridBuffer = gridBuffer.join( '' ) ;

        console.log( gridBuffer ) ;
    }
}

var dataFragments = [] ;
process.stdin.on( 'data', function ( inputSegment )
{
    dataFragments.push( inputSegment ) ;
} ) ;
process.stdin.on( 'end', function ( )
{
    var rawInputLines = dataFragments.join( '' ).split( '\n' ) ;
    processInputData( rawInputLines ) ;
} ) ;