function processInput(rawInputString) {
  const trimmedInput = rawInputString.trim();
  const upperBound = parseInt(trimmedInput, 10);

  let calculatedPowers = new Set();
  calculatedPowers.add(1);

  const MIN_EXPONENT = 2;
  const MAX_EXPONENT = 10;
  const MIN_BASE = 2;

  for (let currentExponent = MIN_EXPONENT; currentExponent <= MAX_EXPONENT; currentExponent++) {
    for (let currentBase = MIN_BASE; ; currentBase++) {
      const powerValue = Math.pow(currentBase, currentExponent);

      if (powerValue > upperBound) {
        break;
      }
      calculatedPowers.add(powerValue);
    }
  }

  let overallMaximum = 1;

  for (const valueInSet of calculatedPowers) {
    if (valueInSet > overallMaximum) {
      overallMaximum = valueInSet;
    }
  }

  console.log(overallMaximum);
}

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
