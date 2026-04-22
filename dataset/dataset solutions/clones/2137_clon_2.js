// Entire input data arrives as a string for processing.
function CalculateCost(dataString) {
  // The first line is linesArray[0], the second is linesArray[1], and so on.
  var linesArray = dataString.split('\n');

  var firstLineTokens = linesArray[0].split(' ');
  var secondLineTokens = linesArray[1].split(' ');

  // Utilize parseInt to convert string representations into base-10 integer values.
  var countElements = parseInt(firstLineTokens[0], 10);

  var numberSet = [];
  for (var idx = 0; idx < countElements; idx++) {
    var currentNum = parseInt(secondLineTokens[idx], 10);
    numberSet[idx] = currentNum;
  }

  var lowestValue = Math.min(...numberSet);
  var highestValue = Math.max(...numberSet);

  // console.debug('Determined range: min=', lowestValue, ', max=', highestValue);
  // console.debug('Original number array:', numberSet);

  var costAccumulator = [];
  var sumOfSquares = 0;

  for (var targetVal = lowestValue; targetVal <= highestValue; targetVal++) {
    for (var idxInner = 0; idxInner < countElements; idxInner++) {
      var elementValue = numberSet[idxInner];
      var difference = elementValue - targetVal;
      // console.debug('Individual difference:', difference);
      sumOfSquares += (difference * difference);
    }
    costAccumulator[targetVal] = sumOfSquares;
    sumOfSquares = 0; // Reset sum for the next target value
  }

  // console.debug('Intermediate cost array:', costAccumulator);

  costAccumulator.splice(0, lowestValue); // Remove initial elements up to the minimum value index.

  // console.debug('Cost array after initial trim:', costAccumulator);

  var finalResult = Math.min(...costAccumulator);
  console.log(finalResult);

}
// This following line should not be altered (it handles standard input/output and invokes the primary processing function).
CalculateCost(require("fs").readFileSync("/dev/stdin", "utf8")); // Pass the complete input string to the main function for execution.