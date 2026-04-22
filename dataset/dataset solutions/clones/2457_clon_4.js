const processInputString = (incomingText) => {
  const purifiedString = incomingText.trim();
  const purifiedLength = purifiedString.length;

  const leftScoresMap = new Map();
  const rightScoresMap = new Map();

  const determineLeftScore = (indexPosition) => {
    if (indexPosition === 0) return 0;
    if (leftScoresMap.has(indexPosition)) return leftScoresMap.get(indexPosition);

    let calculatedScore;
    const precedingCharacter = purifiedString[indexPosition - 1];
    if (precedingCharacter === '<') {
      calculatedScore = determineLeftScore(indexPosition - 1) + 1;
    } else {
      calculatedScore = 0;
    }
    leftScoresMap.set(indexPosition, calculatedScore);
    return calculatedScore;
  };

  const determineRightScore = (indexPosition) => {
    if (indexPosition === purifiedLength) return 0;
    if (rightScoresMap.has(indexPosition)) return rightScoresMap.get(indexPosition);

    let calculatedScore;
    const currentCharacter = purifiedString[indexPosition];
    if (currentCharacter === '>') {
      calculatedScore = determineRightScore(indexPosition + 1) + 1;
    } else {
      calculatedScore = 0;
    }
    rightScoresMap.set(indexPosition, calculatedScore);
    return calculatedScore;
  };

  let overallSum = 0;
  for (let currentPos = 0; currentPos <= purifiedLength; ++currentPos) {
    const scoreFromLeft = determineLeftScore(currentPos);
    const scoreFromRight = determineRightScore(currentPos);
    overallSum += (scoreFromLeft > scoreFromRight ? scoreFromLeft : scoreFromRight);
  }

  return overallSum.toString();
};

process.stdout.write(processInputString(require('node:fs').readFileSync(0, 'utf8')));