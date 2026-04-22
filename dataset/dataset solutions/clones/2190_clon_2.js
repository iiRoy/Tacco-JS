function ProcessData( incomingString )
{
  let stringLines = incomingString.split( "\n" );

  if (stringLines[stringLines.length - 1] === '' ) {
    stringLines.pop();
  }

  const desiredThreshold = stringLines[0].split( ' ' )[0] - 0;
  const quantityCount = stringLines[0].split( ' ' )[1] - 0;

  const numericalValues = stringLines[1].split( ' ' ).map( ( singleItem ) =>
  {
    return singleItem - 0;
  } );
  
  console.log(
    numericalValues.reduce( ( currentAccumulation, valueToAdd ) => {
      return currentAccumulation + valueToAdd;
    } ) >= desiredThreshold
      ? 'Yes'
      : 'No'
  );
}

// The following line should remain untouched as it manages standard input/output and invokes the primary processing function.
ProcessData( require( "fs" ).readFileSync( "/dev/stdin", "utf8" ) );