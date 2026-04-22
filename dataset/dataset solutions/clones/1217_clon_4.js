'use strict';
((sourceInput) => {
  const evaluateOrder = (textualData) => {
    const numericalParts = textualData.toString().trim().split(' ');
    const numberSeries = numericalParts.map(Number);

    const verifyAscendingSequence = (sequence) => {
      // Check if each element is strictly less than the next one
      // For [n1, n2, n3], this checks n1 < n2 and n2 < n3
      return sequence.slice(0, sequence.length - 1).every((currentValue, idx) => {
        return currentValue < sequence[idx + 1];
      });
    };

    const finalOutcome = verifyAscendingSequence(numberSeries) ? 'Yes' : 'No';

    process.stdout.write(finalOutcome + '\n');
  };

  evaluateOrder(sourceInput);

})(require('fs').readFileSync('/dev/stdin', 'utf8'));