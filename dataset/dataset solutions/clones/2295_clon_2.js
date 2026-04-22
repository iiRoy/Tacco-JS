'use strict';
( function ( rawData ) {
  const
    [ firstVal, secondVal, limitVal ] = rawData
      .trim()
      .split( ' ' )
      .map( itemStr => Number( itemStr ) );

  const remainingLimit = Math.max( 0, limitVal - firstVal );

  console.log(
    [
      Math.max( firstVal - limitVal, 0 ),
      Math.max( secondVal - remainingLimit, 0 )
    ]
      .join( ' ' )
  );
} )( require( 'fs' ).readFileSync( '/dev/stdin', 'utf8' ) );