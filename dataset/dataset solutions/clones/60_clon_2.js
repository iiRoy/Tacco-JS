(  function( sourceText )
{
  const parsedNumbers = sourceText.replace( /\n$/, "" ) .split( "\n" ) .map( parseFloat ) ;

  while ( parsedNumbers.length > 0 )
  {
    let currentIncrement = parsedNumbers.shift( );
    let accumulatedValue = 0;
    for ( let pointIndex = 0; pointIndex < 600; pointIndex += currentIncrement )
    {
      accumulatedValue += pointIndex * pointIndex * currentIncrement;
    }
    console.log( accumulatedValue );
  }
} )( require( "fs" ).readFileSync( "/dev/stdin", "utf8" ) );