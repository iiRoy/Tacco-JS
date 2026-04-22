'use strict'

function performCalculation(rawData) {
  const processedData = rawData.trim();
  const firstLineBreak = processedData.indexOf('\n');

  let initialValue;
  let subsequentValue;

  if (firstLineBreak === -1) {
    initialValue = processedData;
    subsequentValue = undefined;
  } else {
    initialValue = processedData.substring(0, firstLineBreak);
    const remainder = processedData.substring(firstLineBreak + 1);
    const secondLineBreak = remainder.indexOf('\n');
    if (secondLineBreak === -1) {
      subsequentValue = remainder;
    } else {
      subsequentValue = remainder.substring(0, secondLineBreak);
    }
  }

  const numericKey = +initialValue;
  const thresholdConstant = 3200;

  let finalOutcome;

  if (numericKey >= thresholdConstant) {
    finalOutcome = subsequentValue;
  } else {
    finalOutcome = 'red';
  }

  console.log(finalOutcome);
}

performCalculation(require('node:fs').readFileSync('/dev/stdin', { encoding: 'utf8' }));