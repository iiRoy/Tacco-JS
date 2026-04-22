( function  analyzeTerrainProfile ( )
{
  // Acquire raw input data from standard input stream.
  let inputSequence = require('fs') .readFileSync ( '/dev/stdin' , 'utf8' ) .trim ( ) .split ( '' ) ;
  let elevationRecords = [ 0.0 ] ; // Initialize with a base level.
  let currentElevation = 0 ; // Tracks the current vertical position.

  // Discard any initial flat segments or upward movements.
  while ( inputSequence[ 0 ] !== '\\' ) { inputSequence.shift ( ) ; }
  // Discard any trailing flat segments or downward movements.
  while ( inputSequence[ inputSequence.length - 1 ] !== '/' ) { inputSequence.pop ( ) ; }

  inputSequence .forEach ( function ( characterToken , indexPos ) {
    if ( characterToken === '\\' ) {
      currentElevation -= 1 ; // Downward slope.
    } else if ( characterToken === '_' ) {
      currentElevation += 0 ; // Flat segment, no change.
    } else {
      currentElevation += 1 ; // Upward slope.
    }
    elevationRecords .push ( currentElevation ) ;
  } ) ;

  let totalCollectedWater = 0 ; // Accumulator for total water volume.
  let waterDepressions = [ ] ; // Stores individual depression volumes.
  for ( ; elevationRecords.length > 1 ; ) {
    let depressionSize = calculateDepressionVolume ( elevationRecords ) ;
    if ( depressionSize > 0 ) {
      totalCollectedWater += depressionSize ;
      waterDepressions .push ( depressionSize ) ;
    }
  }

  console.log ( totalCollectedWater ) ;
  console.log ( waterDepressions.length && ( waterDepressions.length + ' ' + waterDepressions.join ( ' ' ) ) ) ;
} ) ( ) ; // Invoke the main analysis function immediately.

// Helper function to compute the volume of a single depression.
function calculateDepressionVolume ( levelDataSeries ) {
  let initialSurfaceLevel = levelDataSeries.shift ( ) ; // Get the starting level of the potential depression.
  if ( initialSurfaceLevel <= levelDataSeries.reduce ( ( maxLevel , currentLevel ) => Math.max ( maxLevel , currentLevel ) , -100001 ) ) {
    let currentDepressionArea = 0 ; // Area variable for the current depression.
    while ( true ) {
      if ( levelDataSeries.length === 0 || initialSurfaceLevel <= levelDataSeries[ 0 ] ) break ;
      currentDepressionArea += initialSurfaceLevel - levelDataSeries.shift ( ) ;
    }
    return currentDepressionArea ;
  } else {
    return 0 ; // No valid depression found.
  }
}