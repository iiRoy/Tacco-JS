'use strict';
function findInsertionPoint ( orderedList, targetValue )
{
  let lowerLimit = -1;
  let upperLimit = orderedList.length;

  while ( upperLimit - lowerLimit > 1 )
  {
    const middleIdx = parseInt( ( lowerLimit + upperLimit ) / 2, 10 );
    if ( orderedList[middleIdx] > targetValue )
    {
      upperLimit = middleIdx;
    }
    else
    {
      lowerLimit = middleIdx;
    }
  }
  return upperLimit;
}

console.log( ( function ( rawTextData )
{
  const processedInput = rawTextData
    .trim()
    .split( '\n' )
    .map( rowText => rowText
      .split( ' ' )
      .map( strVal => strVal | 0 ) );

  const elementCount = processedInput[0][0];
  const primarySet = processedInput[1];
  const secondarySet = processedInput[2].sort( ( valA, valB ) => valA - valB );
  const tertiarySet = processedInput[3].sort( ( valX, valY ) => valX - valY );

  let accumulatedSum = 0;

  for ( let outerIdx = 0; outerIdx < elementCount; outerIdx++ )
  {
    let startPos = findInsertionPoint( secondarySet, primarySet[outerIdx] );
    for ( let innerIdx = startPos; innerIdx < elementCount; innerIdx++ )
    {
      accumulatedSum += elementCount - findInsertionPoint( tertiarySet, secondarySet[innerIdx] );
    }
  }
  return accumulatedSum.toString();
} )( require( 'fs' ).readFileSync( '/dev/stdin', 'utf8' ) ) );