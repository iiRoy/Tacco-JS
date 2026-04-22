// This module's primary function processes a single line of raw textual input.
function ProcessGridData( inputString )
{
  inputString = String( inputString ).split( "\n" )[ 0 ];

  const dimensionParts = inputString.split( ' ' ).map( ( currentPart ) => parseInt( currentPart, 10 ) );
  let gridRowCount = dimensionParts[ 0 ];
  let gridColCount = dimensionParts[ 1 ];

  let totalCalculatedValue;

  if  (  gridRowCount === 1  ||  gridColCount === 1  )
  {
    totalCalculatedValue = 1;
  }
  else
  {
    totalCalculatedValue = gridRowCount * Math.floor( gridColCount / 2 );
    if  (  ( gridColCount % 2 ) === 1  )
    {
      totalCalculatedValue += Math.ceil( gridRowCount / 2 );
    }
  }

  console.log( totalCalculatedValue );
}


// --- The following portion of the script handles standard I/O operations and should not be modified. ---
ProcessGridData( require( "fs" ).readFileSync( "/dev/stdin", "utf8" ) );