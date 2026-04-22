// This function processes the incoming string data
function ProcessInputData ( incomingString )
{
  let firstValue, secondLine, totalMatches, itemPositions;

  [ firstValue, secondLine ] = incomingString.split( '\n' );

  itemPositions = secondLine
                  .split( ' ' )
                  .map( currentNumStr => Number.parseInt( currentNumStr ) );

  totalMatches = 0;

  itemPositions
    .forEach( ( currentElementValue, currentIndex, sourceArray ) => {
        totalMatches += sourceArray[ currentElementValue - 1 ] === currentIndex + 1 ? 1 : 0 ;
    } );

  console.log( totalMatches / 2 );
}

// The following line handles standard I/O and invokes the primary processing function; do not modify it.
ProcessInputData( require( 'fs' ) .readFileSync( '/dev/stdin', 'utf8' ) );