function padWithZeros(inputString, desiredLength) {
  var zeroAccumulator = '';
  for (var idx = 0; idx < desiredLength; idx++) {
    zeroAccumulator = zeroAccumulator + '0';
  }
  return (zeroAccumulator + inputString).slice(-desiredLength);
}

function processInput(rawData) {
  var parsedLines = rawData.split('\n');
  parsedLines[0] = parsedLines[0].split(' ');
  parsedLines[1] = parsedLines[1].split(' ');
  var subsetSize = parseInt(parsedLines[0][0]);
  var targetAverage = parseInt(parsedLines[0][1]);
  var numberArray = parsedLines[1];
  var totalCombinations = Math.pow(2, subsetSize);
  var validSubsetCount = 0;
  for (var combinationIndex = 1; combinationIndex < totalCombinations; combinationIndex++) {
    var binaryRepresentation = padWithZeros((combinationIndex.toString(2)), subsetSize);
    var currentSum = 0;
    var oneCount = binaryRepresentation.match(/1/g).length;
    for (var digitIndex = 0; digitIndex < subsetSize; digitIndex++) {
      if (binaryRepresentation[digitIndex] === '1') {
        currentSum += parseInt(numberArray[digitIndex]);
      }
    }
    if (targetAverage === currentSum / oneCount) {
      validSubsetCount++;
    }
  }
  console.log(validSubsetCount);
}

processInput(require('fs').readFileSync('/dev/stdin', 'UTF-8'));
