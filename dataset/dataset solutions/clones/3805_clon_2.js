function ProcessData(rawData) {
  let processedLines = rawData.split('\n');
  if ( processedLines[processedLines.length - 1] === '' ) {
    processedLines.pop();
  }
  const quantity = parseInt(processedLines[0].split(' ')[0], 10);
  let accumulatorValue, rightBoundary;
  const dataArray = processedLines[1]
    .split(' ')
    .map(elementStr => {
      return Number(elementStr);
    });
  let boundaryMarkers = [];
  rightBoundary = 0;
  accumulatorValue = 0;
  while ( rightBoundary < quantity && ( ( accumulatorValue ^ dataArray[rightBoundary] ) === ( accumulatorValue + dataArray[rightBoundary] ) ) ) {
    accumulatorValue = accumulatorValue + dataArray[rightBoundary];
    rightBoundary++;
  }
  boundaryMarkers.push(rightBoundary - 1);
  for ( let leftBoundary = 1; leftBoundary < quantity; leftBoundary++ ) {
    accumulatorValue = accumulatorValue ^ dataArray[leftBoundary - 1];
    while ( ( rightBoundary < quantity ) && ( ( accumulatorValue ^ dataArray[rightBoundary] ) === ( accumulatorValue + dataArray[rightBoundary] ) ) ) {
      accumulatorValue = accumulatorValue + dataArray[rightBoundary];
      rightBoundary++;
    }
    boundaryMarkers.push(rightBoundary - 1);
  }
  console.log( boundaryMarkers.reduce( ( totalCount, currentMarker, markerIndex ) => {
    return totalCount + ( currentMarker - markerIndex + 1 );
  }, 0 ) );
}
ProcessData(require("fs").readFileSync("/dev/stdin", "utf8"));