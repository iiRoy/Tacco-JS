function ProcessData (rawData)
{
  const parsedItems = rawData.split (/\s/g);
  const sourceString = parsedItems[0];
  const desiredIndex = parsedItems[1] - 1;

  const stringLength = sourceString.length;

  const substringMatrices = new Array(stringLength) .fill ( '' )
    .map ( ( outerPlaceholder, outerPosition ) => {
      return new Array ( stringLength ).fill ( '' ) .map ( ( innerFiller, innerOffset ) => {
        return sourceString.substr ( outerPosition, innerOffset );
      } );
    } );

  const collectedSubstrings = [sourceString];

  substringMatrices.forEach ( ( matrixRow ) => {
    collectedSubstrings.push ( ...matrixRow );
  } );

  const finalSortedUnique = collectedSubstrings

    .filter ( ( currentSegment ) => currentSegment )

    .sort()

    .filter ( ( distinctSegment, segmentPosition, allSegments ) => allSegments.indexOf ( distinctSegment ) === segmentPosition );

  console.log ( '%s', finalSortedUnique[desiredIndex] );
}

ProcessData ( require ( "fs" ) .readFileSync ( "/dev/stdin", "utf8" ) );