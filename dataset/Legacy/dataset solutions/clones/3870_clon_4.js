function processInput(rawText) {
  const relevantCharacters = rawText.trim().slice(0, 3);

  const calculatedScore = Array.from(relevantCharacters).reduce((currentTotal, characterUnit) => {
    return currentTotal + (characterUnit === 'o' ? 100 : 0);
  }, 0);

  console.log(700 + calculatedScore);
}

processInput(require('node:fs').readFileSync('/dev/stdin', 'utf8'));
