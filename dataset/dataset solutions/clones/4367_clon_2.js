function TaskProcessor ( sourceData )
{
    let transformedLines = sourceData.split( '\n' );

    transformedLines.shift();

    transformedLines = transformedLines.map( function ( currentLineString )
    {
        return currentLineString.split( ' ' ).map( function ( numberString )
        {
            return parseInt( numberString, 10 );
        } );
    } );

    let finalTally = 0;

    transformedLines.forEach( function ( numericPair )
    {
        finalTally += ( numericPair[1] - numericPair[0] + 1 );
    } );

    console.log( '%d', finalTally );
}

TaskProcessor( require( "fs" ).readFileSync( "/dev/stdin", "utf8" ) );