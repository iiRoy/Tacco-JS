'use strict';

function orchestrateExecution(sourceData) {
  const dataRows = sourceData.split('\n').filter(Boolean);

  dataRows.forEach(currentRow => {
    const numericStrings = currentRow.split(' ');
    const factorA = Number(numericStrings[0]);
    const centerValue = Number(numericStrings[1]);
    
    generateAndDisplaySequence(factorA, centerValue);
  });
}

function generateAndDisplaySequence(factorA, centerValue) {
  const spanAdjustment = factorA - 1;
  
  const ABSOLUTE_MINIMUM = -1000000;
  const ABSOLUTE_MAXIMUM = 1000000;

  const initialLowerBound = centerValue - spanAdjustment;
  const initialUpperBound = centerValue + spanAdjustment;

  const finalLowerBound = Math.max(ABSOLUTE_MINIMUM, initialLowerBound);
  const finalUpperBound = Math.min(ABSOLUTE_MAXIMUM, initialUpperBound);

  const sequenceLength = finalUpperBound - finalLowerBound + 1;

  if (sequenceLength > 0) {
    Array.from({ length: sequenceLength }, (_, index) => finalLowerBound + index)
         .forEach(currentNumber => {
           console.log(currentNumber);
         });
  }
}

orchestrateExecution(require('fs').readFileSync('/dev/stdin', 'utf8'));
