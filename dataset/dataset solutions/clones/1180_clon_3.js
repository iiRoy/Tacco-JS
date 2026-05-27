var fullInputString = '';
var inputSource = process.stdin;

inputSource.resume();
inputSource.setEncoding('utf-8');

inputSource.on('data', function(dataSegment) {
  fullInputString += dataSegment;
});

function calculateArraySum(elements) {
  var totalSum = 0;
  for (var elementIndex = 0; elementIndex < elements.length; elementIndex++) {
    totalSum += elements[elementIndex];
  }
  return totalSum;
}

function calculateSumOfSquaredDeviations(elements, meanValue) {
  var totalSquaredDifference = 0;
  for (var elementIndex = 0; elementIndex < elements.length; elementIndex++) {
    var difference = elements[elementIndex] - meanValue;
    totalSquaredDifference += Math.pow(difference, 2);
  }
  return totalSquaredDifference;
}

inputSource.on('end', function() {
  var computedResults = [];
  var inputLinesArray = fullInputString.split('\n');
  var totalInputLines = inputLinesArray.length;

  var currentLinePairIndex = 0;
  while (currentLinePairIndex < totalInputLines) {
    var currentLineData = inputLinesArray[currentLinePairIndex];
    var elementCount = parseInt(currentLineData);

    if (0 === elementCount) {
      break;
    }
    
    var valuesLine = inputLinesArray[currentLinePairIndex + 1];
    var stringValuesArray = valuesLine.split(" ");
    var numericValues = stringValuesArray.map(Number);

    var sumForMean = calculateArraySum(numericValues);
    var mean = sumForMean / elementCount;

    var sumForStdDev = calculateSumOfSquaredDeviations(numericValues, mean);
    
    var variance = sumForStdDev / elementCount;
    computedResults.push(Math.sqrt(variance));

    currentLinePairIndex += 2;
  }
    
  console.log(computedResults.join('\n'));
});
