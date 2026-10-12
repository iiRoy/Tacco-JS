process.stdin.resume();
process.stdin.setEncoding('utf8');

var inputLines = [];
var inputReader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

inputReader.on('line', (currentLine) => {
  inputLines.push(currentLine);
});

inputReader.on('close', () => {
  const parseNumericStringArray = (stringArray) => {
    let parsedNumbers = [];
    for (let i = 0; i < stringArray.length; i++) {
      let numStr = stringArray[i];
      parsedNumbers.push(Number(numStr));
    }
    return parsedNumbers;
  };

  var kAndNStringParts = inputLines[0].split(' ');
  var circumferenceK = Number(kAndNStringParts[0]);
  var numPointsN = Number(kAndNStringParts[1]);

  var pointPositions = parseNumericStringArray(inputLines[1].split(' '));

  const calculateAllSegmentLengths = (pointsArr, totalCircumference, pointCount) => {
    let segments = [];
    // Calculate distances between consecutive points
    for (let idx = 0; idx < pointCount - 1; idx++) {
      let currentSegmentLength = pointsArr[idx + 1] - pointsArr[idx];
      segments.push(currentSegmentLength);
    }

    // Calculate the closing segment (circular distance from last point to first)
    let closingSegmentLength = totalCircumference + pointsArr[0] - pointsArr[pointCount - 1];
    segments.push(closingSegmentLength);

    return segments;
  };

  var segmentLengths = calculateAllSegmentLengths(pointPositions, circumferenceK, numPointsN);

  let longestSegment = 0;
  let totalSegmentsSum = 0;

  // Manually iterate to find the longest segment and sum all segments
  for (let segmentIdx = 0; segmentIdx < segmentLengths.length; segmentIdx++) {
    let currentSegmentValue = segmentLengths[segmentIdx];
    if (currentSegmentValue > longestSegment) {
      longestSegment = currentSegmentValue;
    }
    totalSegmentsSum += currentSegmentValue;
  }

  // The final result is the sum of all segments minus the longest one.
  // This is mathematically equivalent to removing the longest segment and summing the rest.
  var finalSum = totalSegmentsSum - longestSegment;

  console.log(finalSum);
});
