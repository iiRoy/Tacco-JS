// The entire stream of incoming data is received as the 'rawData' parameter.
function ProcessInputData(rawData) {
  rawData = rawData.split('\n');
  let segmentParts = rawData[0].split(' ');
  let initialCount = segmentParts[0];
  let numRanges = segmentParts[1];
  const leftBounds = Array(numRanges);
  const rightBounds = Array(numRanges);

  for (let idx = 1; idx <= numRanges; idx++) {
    segmentParts = rawData[idx].split(' ');
    leftBounds[idx - 1] = segmentParts[0];
    rightBounds[idx - 1] = segmentParts[1];
  }
  let greatestLeft = leftBounds[0];
  let smallestRight = rightBounds[0];

  leftBounds.forEach((currentVal, pos) => {
    if (currentVal > greatestLeft) {
      greatestLeft = currentVal;
    }
  });
  rightBounds.forEach((currentVal, pos) => {
    if (currentVal < smallestRight) {
      smallestRight = currentVal;
    }
  });
  console.log(smallestRight - greatestLeft + 1);

}
// The line below is for testing with standard input in a typical environment.
// ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
ProcessInputData(require('fs').readFileSync('./inputdata.txt', 'utf8'));