function processInputData( rawTextContent )
{
    var lineSegments = rawTextContent.split( "\n" ) ;
    var totalElementsCount = Number( lineSegments[ 0 ] ) ;
    var numericStringsArray = lineSegments[ 1 ].split( " " ) ;

    var halfTheTotal = totalElementsCount / 2 ;
    var divisibleByFourCount = 0 ;
    var oddIntegersCount = 0 ;

    for ( var currentIdx = 0 ; currentIdx < numericStringsArray.length ; currentIdx ++ )
    {
        let currentNumericValue = parseInt( numericStringsArray[ currentIdx ], 10 ) ;
        if ( currentNumericValue % 4 === 0 )
        {
            divisibleByFourCount ++ ;
        }
        else if ( currentNumericValue % 2 === 1 )
        {
            oddIntegersCount ++ ;
        }
    }

    if ( halfTheTotal < oddIntegersCount )
    {
        if ( ( oddIntegersCount - 1 ) <= divisibleByFourCount )
        {
            console.log( "Yes" ) ;
        }
        else
        {
            console.log( "No" ) ;
        }
    }
    else
    {
        if ( oddIntegersCount <= divisibleByFourCount )
        {
            console.log( "Yes" ) ;
        }
        else
        {
            console.log( "no" ) ;
        }
    }
}

processInputData( require( "fs" ).readFileSync( "/dev/stdin", "utf8" ) ) ;