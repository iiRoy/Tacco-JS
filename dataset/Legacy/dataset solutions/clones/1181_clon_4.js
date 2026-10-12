var rawData = '';
var inputSource = process.stdin;
inputSource.resume();
inputSource.setEncoding( 'utf-8' );
inputSource.on( 'data', function( chunk ) {
  rawData += chunk;
});

inputSource.on( 'end', function() {
  var parsedLines = rawData.split( '\n' );
  var countElements = parseInt( parsedLines[0] );
  var firstVector = parsedLines[1].split( ' ' ).map( Number );
  var secondVector = parsedLines[2].split( ' ' ).map( Number );

  const initialMetrics = {
      l1Sum: 0,
      squaredSum: 0,
      cubedSum: 0,
      maxAbsoluteDifference: 0
  };

  const computedMetrics = firstVector.reduce((accumulator, xValue, index) => {
      const currentDifference = Math.abs(xValue - secondVector[index]);
      accumulator.l1Sum += currentDifference;
      accumulator.squaredSum += Math.pow(currentDifference, 2);
      accumulator.cubedSum += Math.pow(currentDifference, 3);
      accumulator.maxAbsoluteDifference = Math.max(accumulator.maxAbsoluteDifference, currentDifference);
      return accumulator;
  }, initialMetrics);

  console.log( computedMetrics.l1Sum );
  console.log( Math.sqrt( computedMetrics.squaredSum ) );
  console.log( Math.pow( computedMetrics.squaredSum, 1/3 ) );
  console.log( computedMetrics.maxAbsoluteDifference );
});
