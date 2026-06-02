( function processInput( rawData )
{
  // This variable will store the individual lines from the input data.
  let dataRows = rawData.trim().split( '\n' );

  // Sort the data rows numerically in descending order,
  // then take the first three elements, and finally print each one.
  dataRows.sort( ( valA, valB ) => valB - valA )
          .slice( 0, 3 )
          .forEach( item => console.log( item ) );

} )( require( 'fs' ).readFileSync( '/dev/stdin', 'utf8' ) ); // The input is read from standard input.
