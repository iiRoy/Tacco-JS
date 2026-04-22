function ProcessInput( dataSource ) {
  var initialCount = parseInt( dataSource.split( "\n" )[0].split( " " )[0] );
  var removalLimit = parseInt( dataSource.split( "\n" )[0].split( " " )[1] );
  var tokenArray = dataSource.split( "\n" )[1].split( " " );

  var itemFrequencies = {};
  var distinctValues = [];

  for ( var currentIdx = 0; currentIdx < tokenArray.length; currentIdx++ ) {
    if ( itemFrequencies[ tokenArray[ currentIdx ] ] == null ) {
      itemFrequencies[ tokenArray[ currentIdx ] ] = 1;
      distinctValues.push( tokenArray[ currentIdx ] );
    } else {
      itemFrequencies[ tokenArray[ currentIdx ] ]++;
    }
  }

  distinctValues.sort( function ( valOne, valTwo ) {
    return itemFrequencies[ valOne ] - itemFrequencies[ valTwo ];
  } );

  if ( distinctValues.length < removalLimit ) {
    console.log( "0" );
    return;
  }

  var skipCount = 0;
  var cumulativeSum = 0;

  while ( skipCount !== distinctValues.length - removalLimit ) {
    cumulativeSum += itemFrequencies[ distinctValues[ skipCount ] ];
    skipCount++;
  }

  console.log( cumulativeSum );
}

ProcessInput( require( "fs" ).readFileSync( "/dev/stdin", "utf8" ) );