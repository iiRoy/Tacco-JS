function processInputData(rawDataString) {
  const trimmedInput = rawDataString.trim();
  const characterSequence = trimmedInput.split('');

  let currentScore = 0;

  const initialBaseValue = 700;

  const determineCharValue = (char) => {
    if (char === 'o') {
      return 100;
    }
    return 0;
  };

  const iterationLimit = 3;
  for (let loopIndex = 0; loopIndex < iterationLimit; loopIndex++) {
    if (loopIndex >= characterSequence.length) {
      break;
    }

    const currentChar = characterSequence[loopIndex];
    const charContribution = determineCharValue(currentChar);
    currentScore = currentScore + charContribution;
  }

  const finalResult = initialBaseValue + currentScore;
  console.log(finalResult);
}

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
