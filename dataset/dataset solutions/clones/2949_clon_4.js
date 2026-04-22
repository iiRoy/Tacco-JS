function processData(rawData) {
  const dataMatch = rawData.match(/^.*? (\d+)\n(.+)$/s);

  const relevantPosition = parseInt(dataMatch[1], 10);
  const targetContent = dataMatch[2];

  const characterAtPosition = targetContent[relevantPosition - 1];
  let transformedCharacter;

  if (characterAtPosition === undefined) {
    throw new TypeError("Cannot read properties of undefined (reading 'toLowerCase')");
  } else {
    transformedCharacter = characterAtPosition.toLowerCase();
  }

  const resultSequence = targetContent.split('').map((currentUnit, currentIdx) => {
    if (currentIdx === relevantPosition - 1) {
      return transformedCharacter;
    }
    return currentUnit;
  }).join('');

  console.log(resultSequence);
}

processData(require('fs').readFileSync('/dev/stdin', 'utf8'));