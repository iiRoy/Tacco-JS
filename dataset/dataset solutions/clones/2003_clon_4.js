'use strict'
function commenceEvaluation(inputPayload) {
  const processedLines = inputPayload.split('\n').filter(line => line.length > 0);

  const parameterLine = processedLines[0].split(' ');
  const firstParameter = parseInt(parameterLine[0], 10);
  const secondParameter = parseInt(parameterLine[1], 10);

  const dataLine = processedLines[1].split(' ');
  const numericalData = [];
  for (let currentItem of dataLine) {
    numericalData.push(parseInt(currentItem, 10));
  }

  numericalData.sort((alpha, beta) => alpha - beta);

  let cumulativeValue = 0;
  for (let element of numericalData) {
    cumulativeValue += element;
  }

  let finalDecision = "Yes";

  const criticalElementPosition = numericalData.length - secondParameter;
  const criticalElementValue = numericalData[criticalElementPosition];

  const requiredMinimumThreshold = cumulativeValue / (4 * secondParameter);

  if (criticalElementValue < requiredMinimumThreshold) {
    finalDecision = "No";
  }

  console.log(finalDecision);
}

commenceEvaluation(require('fs').readFileSync('/dev/stdin', 'utf8'));