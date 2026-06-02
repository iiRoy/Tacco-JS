process.stdin.resume();
process.stdin.setEncoding('utf8');

const inputLines = [];
const lineReader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

lineReader.on('line', (currentLine) => {
  inputLines.push(currentLine);
});

lineReader.on('close', () => {
  const queryLimit = parseInt(inputLines[0], 10);

  const maxExpressionValue = 60000; // Maximum value for i*i + k*k + j*j + i*k + j*i + k*j when i,j,k <= 100
  const occurrenceCounts = new Array(maxExpressionValue + 1).fill(0);

  const numberSequence = Array.from({ length: 100 }, (_, index) => index + 1);

  numberSequence.forEach(firstTerm => {
    numberSequence.forEach(secondTerm => {
      numberSequence.forEach(thirdTerm => {
        const computedValue =
          firstTerm * firstTerm +
          secondTerm * secondTerm +
          thirdTerm * thirdTerm +
          firstTerm * secondTerm +
          secondTerm * thirdTerm +
          thirdTerm * firstTerm;

        if (computedValue <= maxExpressionValue) {
          occurrenceCounts[computedValue]++;
        }
      });
    });
  });

  for (let currentTarget = 1; currentTarget <= queryLimit; currentTarget++) {
    console.log(occurrenceCounts[currentTarget] || 0);
  }
});
