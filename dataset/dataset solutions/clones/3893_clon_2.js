function convertStringArray(inputString) {
  const numericValues = [];
  const stringParts = inputString.split(' ');
  for (let idx = 0; idx < stringParts.length; idx++) {
    numericValues.push(parseInt(stringParts[idx], 10));
  }
  return numericValues;
}

function processInput(rawData) {
  const firstLineData = convertStringArray(rawData[0]);
  const totalElements = firstLineData[0];
  const upperBound = firstLineData[1];
  const thresholdValue = firstLineData[2];
  const secondLineData = convertStringArray(rawData[1]);

  const countAboveThreshold = secondLineData.filter((item) => item > thresholdValue).length;
  console.log(Math.min(countAboveThreshold, upperBound - countAboveThreshold));
}

let
accumulatedData = '';

process.stdin.resume();
process.stdin.setEncoding('utf8');

process.stdin.on('data', function(dataPortion) {
  accumulatedData += dataPortion;
});

process.stdin.on('end', function() {
  const lines = accumulatedData.split('\n');
  processInput(lines);
});