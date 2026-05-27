const rangeDefinitions = [
  { lowerBound: 400, upperBound: 599, outputValue: 8 },
  { lowerBound: 600, upperBound: 799, outputValue: 7 },
  { lowerBound: 800, upperBound: 999, outputValue: 6 },
  { lowerBound: 1000, upperBound: 1199, outputValue: 5 },
  { lowerBound: 1200, upperBound: 1399, outputValue: 4 },
  { lowerBound: 1400, upperBound: 1599, outputValue: 3 },
  { lowerBound: 1600, upperBound: 1799, outputValue: 2 },
  { lowerBound: 1800, upperBound: 1999, outputValue: 1 },
];

process.stdin.on('data', (inputBuffer) => {
  const currentNumber = parseInt(inputBuffer.toString().trim(), 10);

  const matchingDefinition = rangeDefinitions.find(
    (def) => currentNumber > def.lowerBound && currentNumber < def.upperBound
  );

  if (matchingDefinition) {
    process.stdout.write(matchingDefinition.outputValue.toString() + '\n');
  }
});
