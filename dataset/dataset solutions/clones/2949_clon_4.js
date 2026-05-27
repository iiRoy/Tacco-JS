function processInputData(rawData) {
  const inputLines = rawData.split('\n');
  const firstLineSegments = inputLines[0].split(' ');
  const targetPosition = parseInt(firstLineSegments[1], 10);
  const sourceString = inputLines[1];

  const zeroBasedIndex = targetPosition - 1;
  const characterToModify = sourceString.charAt(zeroBasedIndex);
  const modifiedCharacter = characterToModify.toLowerCase();

  const resultString = sourceString.substring(0, zeroBasedIndex) +
                       modifiedCharacter +
                       sourceString.substring(zeroBasedIndex + 1);

  console.log(resultString);
}

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
