'use strict';
( function ( sourceData )
{
  sourceData = sourceData.trim()
                         .split(/\s+/)
                         .map( currentVal => currentVal - 0 );

  const totalElements = sourceData.shift();
  const initialValues = sourceData;

  // This table stores the minimum cost to merge segments of elements.
  // minimalCosts[length][start] represents the minimum cost to merge elements
  // from index 'start' up to 'start + length'.
  const minimalCosts = new Array(totalElements).fill(0)
                                               .map( ( _ignored, lenIndex ) =>
                                                     new Array(totalElements - lenIndex).fill(Infinity) );

  minimalCosts[0] = new Array(totalElements).fill(0);

  // This matrix holds the accumulated sum (size) for segments of elements.
  // segmentSums[length][start] represents the sum of elements
  // from index 'start' up to 'start + length'.
  const segmentSums = new Array(totalElements).fill(0)
                                              .map( ( _dummy, lengthIndex ) =>
                                                    new Array(totalElements - lengthIndex).fill(0) );

  segmentSums[0] = initialValues;

  // Pre-calculate segment sums for all possible contiguous segments
  for ( let segmentLength = 1; segmentLength < totalElements; segmentLength++ ) {
    for ( let startIndex = 0; startIndex < totalElements - segmentLength; startIndex++ ) {
      segmentSums[segmentLength][startIndex] = segmentSums[segmentLength - 1][startIndex] + segmentSums[0][startIndex + segmentLength];
    }
  }

  // Dynamic programming to find the minimum merge cost
  for ( let currentLength = 1; currentLength < totalElements; currentLength++ )
  {
    for ( let startIndex = 0; startIndex < totalElements - currentLength; startIndex++ )
    {
      for ( let splitPoint = 0; splitPoint < currentLength; splitPoint++ )
      {
        // The goal is to find the minimum cost by splitting the current segment
        // (from startIndex to startIndex + currentLength) into two sub-segments:
        // (startIndex to startIndex + splitPoint) and
        // (startIndex + splitPoint + 1 to startIndex + currentLength).
        // Iterate through all possible split points to determine the optimal merge.

        const firstSubsegmentCost = minimalCosts[splitPoint][startIndex];
        const secondSubsegmentLength = currentLength - splitPoint - 1;
        const secondSubsegmentStart = startIndex + splitPoint + 1;
        const secondSubsegmentCost = minimalCosts[secondSubsegmentLength][secondSubsegmentStart];
        const totalCombinedSize = segmentSums[splitPoint][startIndex] + segmentSums[secondSubsegmentLength][secondSubsegmentStart];

        minimalCosts[currentLength][startIndex] = Math.min(
          minimalCosts[currentLength][startIndex],
          firstSubsegmentCost + secondSubsegmentCost + totalCombinedSize
        );
      }
    }
  }

  // The final answer is the minimum cost to merge all elements from index 0
  // for a total length of totalElements - 1.
  console.log( minimalCosts[totalElements - 1][0] );

} )( require('fs').readFileSync( '/dev/stdin', 'utf8' ) );