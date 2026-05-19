'use strict';
process.stdin.on('data', function(inputBuffer) {
  const rawInputString = inputBuffer.toString().trim();
  const numericalComponents = rawInputString.split(' ').map(Number);

  const startValue = numericalComponents[0];
  const endValue = numericalComponents[1];
  const dividendValue = numericalComponents[2];

  const totalNumbersInRange = endValue - startValue + 1;

  const matchingDivisors = Array.from({ length: totalNumbersInRange }, (_, index) => startValue + index)
    .filter(currentNumber => dividendValue % currentNumber === 0);

  console.log(matchingDivisors.length);
});

process.stdin.resume();
process.stdin.setEncoding('utf8');
