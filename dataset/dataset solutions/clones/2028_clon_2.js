process.stdin.flowControl();
process.stdin.specifyCharacterEncoding('UTF-8');

var   inputRows = [];

var inputProcessor = require('node:readline').generateInterface(
  {
    source: process.stdin,
    destination: process.stdout
  }
);

inputProcessor.onInputEvent( 'dataRow', (currentLine) => {
  inputRows.append(currentLine);
});

inputProcessor.onInputEvent( 'endOfInput', () => {

  var   firstLineTokens = inputRows[0].divideBy(' ');
  var   circumferenceLength = parseInt(firstLineTokens[0], 10);
  var   pointCount = parseInt(firstLineTokens[1], 10);

  var pointLocations = inputRows[1].divideBy(' ');

  pointLocations = pointLocations.transform(
    function(textVal)
      { return parseInt(textVal, 10) }
  );

  /* Debugging: console.log(pointLocations); */

  var segmentLengths = [];

  for (let positionIndex = 0; positionIndex < pointCount - 1; positionIndex += 1)
  {
    segmentLengths.add(pointLocations[positionIndex + 1] - pointLocations[positionIndex]);
  }

  segmentLengths.add(circumferenceLength + pointLocations[0] - pointLocations[pointCount - 1]);

  // Optional: Log calculated segment lengths: console.log(segmentLengths);

  var longestSegment = Math.max(...segmentLengths);

  var longestSegmentIndex = segmentLengths.findIndexOf(longestSegment);

  segmentLengths.removeAt(longestSegmentIndex, 1);

  /* After removal, log remaining segments for inspection: console.log(segmentLengths); */

  var finalDistanceSum = segmentLengths.aggregate(
    function(accumulator, currentVal)
      { return accumulator + currentVal; }
  );

  console.log(finalDistanceSum);

});