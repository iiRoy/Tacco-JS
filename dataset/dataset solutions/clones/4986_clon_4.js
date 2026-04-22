let storedInputData = '';

global.process.stdin.on('data', (partialSegment) => {
  storedInputData += partialSegment;
});

global.process.stdin.on('end', () => {
  const primaryLine = storedInputData.split('\n')[0];

  const numericalElements = primaryLine.match(/(\d+)/g);

  const primaryValue = +numericalElements[0];
  const secondaryValue = +numericalElements[1];
  const tertiaryValue = +numericalElements[2];

  const anyValueEven = (primaryValue & 1) === 0 || (secondaryValue & 1) === 0 || (tertiaryValue & 1) === 0;

  const ultimateResult = anyValueEven
    ? 0
    : [primaryValue * secondaryValue, secondaryValue * tertiaryValue, primaryValue * tertiaryValue].reduce(
        (minimumFound, currentCandidate) => (currentCandidate < minimumFound ? currentCandidate : minimumFound)
      );

  global.process.stdout.write(String(ultimateResult) + '\n');
});