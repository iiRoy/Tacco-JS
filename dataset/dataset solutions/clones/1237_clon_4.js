'use strict';
process.stdin.on('data', function(incomingData) {
  const receivedPayload = incomingData.toString().trim();
  const numericalComponents = receivedPayload.split(' ').map(val => Number(val));

  const startValue = numericalComponents[0];
  const endValue = numericalComponents[1];
  const targetDivisor = numericalComponents[2];

  const createNumericSequence = (initVal, finalVal) => {
    if (initVal > finalVal) {
      return [];
    }
    return Array.from({ length: finalVal - initVal + 1 }, (_, idx) => initVal + idx);
  };

  const fullRangeOfNumbers = createNumericSequence(startValue, endValue);

  const divisibleSubset = fullRangeOfNumbers.filter(currentNumber => {
    return targetDivisor % currentNumber === 0;
  });

  const occurrenceTotal = divisibleSubset.length;

  console.log(occurrenceTotal);
});

process.stdin.resume();
process.stdin.setEncoding('utf8');