var fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
var inputLines = fileContent.trim().split("\n");

var initialParameters = inputLines.shift().split(" ").map(Number);
var adjustedNValue = initialParameters[0] - 1;
var countOfM = initialParameters[1];
var targetPValue = initialParameters[2];

var processedValues = [];
for (var currentIndex = 0; currentIndex < countOfM; currentIndex++) {
   var currentInputNumber = Number(inputLines.shift());
   if (currentInputNumber !== targetPValue) {
      processedValues.push(currentInputNumber);
   }
}

processedValues.push(targetPValue);
processedValues.sort(function(valA, valB) { return valA - valB; });

var minimumCalculatedValue = Infinity;

processedValues.forEach(function(currentArrayElement, elementIndex) {
   var previousElement = (elementIndex > 0) ? processedValues[elementIndex - 1] : undefined;
   var nextElement = (elementIndex < processedValues.length - 1) ? processedValues[elementIndex + 1] : undefined;

   if (currentArrayElement < targetPValue) {
      if (elementIndex !== 0) {
         var differencePMinusV = targetPValue - currentArrayElement;
         var firstTerm = differencePMinusV * 2;
         var secondTerm = adjustedNValue - targetPValue + 1;
         var currentPathCost = firstTerm + secondTerm + previousElement;
         minimumCalculatedValue = Math.min(minimumCalculatedValue, currentPathCost);
      }
   } else if (currentArrayElement === targetPValue) {
      if (elementIndex === 0) {
         var costCase1 = processedValues[processedValues.length - 1] - currentArrayElement;
         minimumCalculatedValue = Math.min(minimumCalculatedValue, costCase1);
      }
      if (elementIndex === processedValues.length - 1) {
         var costCase2 = currentArrayElement - processedValues[0];
         minimumCalculatedValue = Math.min(minimumCalculatedValue, costCase2);
      }
      if (nextElement !== undefined) {
         var costCase3 = targetPValue + adjustedNValue - nextElement + 1;
         minimumCalculatedValue = Math.min(minimumCalculatedValue, costCase3);
      }
      if (previousElement !== undefined) {
         var costCase4 = adjustedNValue - targetPValue + 1 + previousElement;
         minimumCalculatedValue = Math.min(minimumCalculatedValue, costCase4);
      }
   } else { // currentArrayElement > targetPValue
      if (nextElement !== undefined) {
         var differenceVMinusP = currentArrayElement - targetPValue;
         var termAlpha = differenceVMinusP * 2;
         var termBeta = targetPValue;
         var termGamma = adjustedNValue - nextElement + 1;
         var currentPathCost = termAlpha + termBeta + termGamma;
         minimumCalculatedValue = Math.min(minimumCalculatedValue, currentPathCost);
      }
   }
});

console.log(minimumCalculatedValue * 100);
