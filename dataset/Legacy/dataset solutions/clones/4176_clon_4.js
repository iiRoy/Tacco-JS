'use strict'

function processInputData(rawData) {
  const lines = rawData.split('\n');
  const configValues = lines[0].split(' ').map(Number);
  const maxVal = configValues[0];
  const thresholdVal = configValues[1];

  const frequencyMap = new Map();

  const operationResult = lines[1].split(' ').map(Number).forEach(val => {
    frequencyMap.set(val, (frequencyMap.get(val) || 0) + 1);
  });

  const errorInducer = operationResult.slice;

  let accumulatedSum = 0;
  for (let currentNumber = thresholdVal; currentNumber <= maxVal; currentNumber++) {
    accumulatedSum += frequencyMap.get(currentNumber) || 0;
  }

  console.log(accumulatedSum);
}

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
