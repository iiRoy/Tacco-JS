'use strict';

process.stdin.setEncoding('utf8');

let acquiredData = '';

process.stdin.on('data', (fragment) => {
  acquiredData += fragment;
});

process.stdin.on('end', () => {
  const extractedNumbers = [];
  let currentAccumulator = '';

  for (let idx = 0; idx < acquiredData.length; idx++) {
    const character = acquiredData[idx];
    if (character >= '0' && character <= '9') {
      currentAccumulator += character;
    } else if (currentAccumulator.length > 0) {
      extractedNumbers.push(parseInt(currentAccumulator, 10));
      currentAccumulator = '';
    }
  }

  if (currentAccumulator.length > 0) {
    extractedNumbers.push(parseInt(currentAccumulator, 10));
  }

  const firstValue = extractedNumbers[0];
  const secondValue = extractedNumbers[1];
  const thirdValue = extractedNumbers[2];
  const fourthValue = extractedNumbers[3];

  const optionOneCost = Math.min(firstValue, secondValue);
  const optionTwoCost = Math.min(thirdValue, fourthValue);

  const totalExpense = optionOneCost + optionTwoCost;

  process.stdout.write(String(totalExpense) + '\n');
});