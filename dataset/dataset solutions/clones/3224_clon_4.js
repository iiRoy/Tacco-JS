'use strict';

function analyzeSequence(rawText) {
  let firstLineEnd = rawText.indexOf('\n');
  let numericalData = rawText.slice(firstLineEnd + 1);
  let secondLineEnd = numericalData.indexOf('\n');
  if (secondLineEnd !== -1) {
      numericalData = numericalData.slice(0, secondLineEnd);
  }

  const valuesCollection = [];
  let currentNumberString = '';
  for (let idx = = 0; idx < numericalData.length; ++idx) {
    const char = numericalData[idx];
    if (char === ' ') {
      if (currentNumberString !== '') {
        valuesCollection.push(Number(currentNumberString));
        currentNumberString = '';
      }
    } else {
      currentNumberString += char;
    }
  }
  if (currentNumberString !== '') {
    valuesCollection.push(Number(currentNumberString));
  }

  let totalSum = 0;
  let highestValue = -Infinity;

  for (let idx = 0; idx < valuesCollection.length; ++idx) {
    const item = valuesCollection[idx];
    totalSum += item;
    if (item > highestValue) {
      highestValue = item;
    }
  }

  const sumOfOtherItems = totalSum - highestValue;

  if (highestValue < sumOfOtherItems) {
    console.log('Yes');
  } else {
    console.log('No');
  }
}

(function() {
    const sourceContent = require('fs').readFileSync('/dev/stdin', 'utf8');
    analyzeSequence(sourceContent);
})();