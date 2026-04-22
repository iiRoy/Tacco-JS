function ProcessInput(rawData) {
  rawData = rawData.split('\n');
  const elementCount = Number.parseInt(rawData[0], 10);
  const characterString = rawData[1];
  const queryCount = Number.parseInt(rawData[2], 10);
  let nextDataLine = 3;
  const commandList = [];
  const charDataArray = [];
  for (let idx = 0; idx < elementCount; idx++) {
    charDataArray.push(characterString[idx]);
  }
  for (let qIdx = 0; qIdx < queryCount; qIdx++) {
    commandList[qIdx] = rawData[(nextDataLine + qIdx)];
  }
  for (const currentCommand of commandList) {
    const commandSegments = currentCommand.split(' ');
    const operationKind = Number.parseInt(commandSegments[0], 10);
    switch (operationKind) {
      case 1:
        const targetPosition = Number.parseInt(commandSegments[1], 10);
        const newCharacter = commandSegments[2];
        if (charDataArray[targetPosition - 1] !== newCharacter) {
          charDataArray[targetPosition - 1] = newCharacter;
        }
        break;
      case 2:
        let startIndex = Number.parseInt(commandSegments[1], 10);
        const endIndex = Number.parseInt(commandSegments[2], 10);
        const distinctCharacters = {};
        if (startIndex <= endIndex && startIndex < elementCount) {
          for (; startIndex <= endIndex; startIndex++) {
            distinctCharacters[charDataArray[(startIndex - 1)]] = null;
          }
        }
        const uniqueCount = Object.keys(distinctCharacters).length;
        console.log('%d\n', uniqueCount);
        break;
      default:
        break;
    }
  }
}
ProcessInput(require('fs').readFileSync('/dev/stdin', 'utf8'));