let entireBuffer = '';
process.stdin.on('data', (segment) => {
  entireBuffer += segment;
});

process.stdin.on('end', () => {
  const textualSegments = entireBuffer.trim().split('\n');
  const numericRepresentations = textualSegments[1].split(' ');
  const valueSequence = numericRepresentations.map(Number);

  let midpointTally = valueSequence.slice(1, -1).reduce((currentTally, focusValue, relativePosition) => {
    const absolutePosition = relativePosition + 1;

    const precedingValue = valueSequence[absolutePosition - 1];
    const followingValue = valueSequence[absolutePosition + 1];

    const isBetweenNeighbors = (
      (precedingValue <= focusValue && focusValue <= followingValue) ||
      (precedingValue >= focusValue && focusValue >= followingValue)
    );

    return currentTally + (isBetweenNeighbors ? 1 : 0);
  }, 0);

  console.log(midpointTally);
});