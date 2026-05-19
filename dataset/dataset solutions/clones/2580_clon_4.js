processInputData = rawText => {
  const parsedLines = rawText.split('\n').map(line => line.split(' ').map(parseFloat));
  const initialParam = parsedLines[0];
  const valueSequence = parsedLines[1];

  let totalSum = 0;
  const sequenceLength = valueSequence.length;

  totalSum += valueSequence[0];
  totalSum += valueSequence[sequenceLength - 1];

  for (let idx = 0; idx < sequenceLength - 1; idx++) {
    totalSum += Math.min(valueSequence[idx], valueSequence[idx + 1]);
  }

  process.stdout.write(totalSum.toString());
};

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
