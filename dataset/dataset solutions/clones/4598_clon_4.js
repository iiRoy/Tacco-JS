let collectedData = '';

process.stdin.resume();
process.stdin.setEncoding('utf8');

process.stdin.on('data', (dataChunk) => {
  collectedData += dataChunk;
});

process.stdin.on('end', () => {
  let processedInputLines = collectedData.split('\n').map((lineSegment) => lineSegment.trim());

  if (processedInputLines.length > 0 && processedInputLines[processedInputLines.length - 1] === '') {
    processedInputLines.pop();
  }

  evaluateConnectivity(processedInputLines);
});

function evaluateConnectivity(inputDataSegments) {
  const sourceString = inputDataSegments[0];
  let currentAccumulator = '';
  const parsedTokens = [];

  for (let charIndex = 0; charIndex < sourceString.length; charIndex++) {
    const character = sourceString[charIndex];
    if (character === ' ') {
      parsedTokens.push(currentAccumulator.trim());
      currentAccumulator = '';
    } else {
      currentAccumulator += character;
    }
  }
  parsedTokens.push(currentAccumulator.trim());

  const firstComponent = parsedTokens[0];
  const secondComponent = parsedTokens[1];
  const thirdComponent = parsedTokens[2];

  function checkSequenceLink(componentA, componentB, componentC) {
    const lastCharOfA = componentA.slice(-1);
    const firstCharOfB = componentB.charAt(0);
    const lastCharOfB = componentB.slice(-1);
    const firstCharOfC = componentC.charAt(0);

    if (lastCharOfA === firstCharOfB && lastCharOfB === firstCharOfC) {
      return "YES";
    } else {
      return "NO";
    }
  }

  console.log(checkSequenceLink(firstComponent, secondComponent, thirdComponent));
}
