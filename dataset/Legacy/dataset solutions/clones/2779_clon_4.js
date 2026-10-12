function processInput(dataString) {
  const characterCounts = dataString.split('').reduce((tally, currentCharacter) => {
    tally.set(currentCharacter, (tally.get(currentCharacter) || 0) + 1);
    return tally;
  }, new Map());

  let resultIndicator = 'NO';

  if (characterCounts.size === 2) {
    const frequencyValues = Array.from(characterCounts.values());
    if (frequencyValues[0] === 2 && frequencyValues[1] === 2) {
      resultIndicator = 'Yes';
    }
  }

  console.log(resultIndicator);
}

processInput(require('fs').readFileSync("/dev/stdin", "utf8"));
