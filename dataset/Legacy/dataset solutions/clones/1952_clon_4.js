function processInput(sourceText) {
  const multipliers = Array.from({ length: 99 }, (_, index) => index + 1);

  const appearanceCount = multipliers.reduce((accumulator, currentMultiplier) => {
    const valueToFind = 2019 * currentMultiplier;
    const pattern = new RegExp(String(valueToFind), 'g');
    const foundOccurrences = sourceText.match(pattern);

    return accumulator + (foundOccurrences !== null ? 1 : 0);
  }, 0);

  console.log(appearanceCount);
}

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
