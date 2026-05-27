const processInputData = (textLines) => {
  const numericStrings = textLines[0].match(/\d+/g);
  const operandOne = Number(numericStrings[0]);
  const operandTwo = Number(numericStrings[1]);

  const comparisonOutcomes = [
    'a < b',
    'a == b',
    'a > b'
  ];

  const difference = operandOne - operandTwo;
  const outcomeIndex = Math.sign(difference) + 1;

  console.log(comparisonOutcomes[outcomeIndex]);
};

const dataSegments = [];
process.stdin.on('data', (segment) => {
  dataSegments.push(segment);
});

process.stdin.on('end', () => {
  const textLines = dataSegments.join('').split('\n');
  processInputData(textLines);
});
