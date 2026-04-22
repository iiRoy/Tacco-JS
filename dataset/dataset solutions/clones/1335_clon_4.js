let collectedDataAccumulator = "";

process.stdin.resume();
process.stdin.setEncoding('utf8');

process.stdin.on('data', (dataChunk) => {
  collectedDataAccumulator += dataChunk;
});

process.stdin.on('end', () => {
  executeOperations(collectedDataAccumulator);
});

function executeOperations(fullDataSet) {
  const dataLines = fullDataSet.split("\n");

  let workingString = dataLines[0];
  const totalActions = Number(dataLines[1]);

  const actionHandlers = {
    "display": (currentStr, startPos, endPos, extraArg) => {
      console.log(currentStr.substring(startPos, endPos + 1));
      return currentStr;
    },
    "invert": (currentStr, startPos, endPos, extraArg) => {
      const firstSection = currentStr.substring(0, startPos);
      const middleSection = currentStr.substring(startPos, endPos + 1);
      const lastSection = currentStr.substring(endPos + 1);
      const reversedMiddle = middleSection.split('').reverse().join('');
      return firstSection + reversedMiddle + lastSection;
    },
    "substitute": (currentStr, startPos, endPos, replacementText) => {
      const firstSection = currentStr.substring(0, startPos);
      const lastSection = currentStr.substring(endPos + 1);
      return firstSection + replacementText + lastSection;
    }
  };

  const structuredCommands = dataLines.slice(2, 2 + totalActions).map(line => {
    const parts = line.split(" ");
    return {
      type: parts[0],
      first: Number(parts[1]),
      second: Number(parts[2]),
      third: parts[3]
    };
  });

  workingString = structuredCommands.reduce((currentStringState, currentCommand) => {
    const handler = actionHandlers[currentCommand.type];
    if (handler) {
      return handler(currentStringState, currentCommand.first, currentCommand.second, currentCommand.third);
    }
    return currentStringState;
  }, workingString);
}