function ProcessInput(rawData) {
  const inputLines = rawData.split("\n");
  const numPeople = +inputLines[0];
  const remainingLines = inputLines.slice(1);

  const statementsCollection = [];
  let lineCursor = 0;

  const parsePersonStatements = (startLineIndex, linesArray) => {
    const statementCount = +linesArray[startLineIndex];
    const statementsForCurrentPerson = [];
    for (let k = 1; k <= statementCount; k++) {
      statementsForCurrentPerson.push(linesArray[startLineIndex + k].split(' ').map(Number));
    }
    return { statements: statementsForCurrentPerson, count: statementCount };
  };

  while (lineCursor < remainingLines.length) {
    const { statements, count } = parsePersonStatements(lineCursor, remainingLines);
    statementsCollection.push(statements);
    lineCursor += count + 1;
  }

  let maxHonestCount = 0;
  let currentHonestCount;

  const isPersonHonestInPattern = (personIndex, pattern) => {
    return ((pattern >> personIndex) & 1) === 1;
  };

  for (let truthfulnessPattern = (1 << numPeople) - 1; truthfulnessPattern > 0; truthfulnessPattern--) {
    currentHonestCount = calculateHonestCount(truthfulnessPattern);

    const isCurrentPatternBetter = currentHonestCount > maxHonestCount;
    if (!isCurrentPatternBetter) {
      continue;
    }

    const checkPatternConsistency = (pattern) => {
      return statementsCollection.every((personStatements, speakerIndex) => {
        const isSpeakerHonest = isPersonHonestInPattern(speakerIndex, pattern);

        return personStatements.every((statementDetail) => {
          const targetPersonIdx = statementDetail[0] - 1;
          const targetPersonTruthfulness = statementDetail[1];

          const targetPersonTruthFlag = isPersonHonestInPattern(targetPersonIdx, pattern) ? 1 : 0;

          const statementMatchesPattern = (targetPersonTruthfulness === targetPersonTruthFlag);

          return (isSpeakerHonest && statementMatchesPattern) || (!isSpeakerHonest && !statementMatchesPattern);
        });
      });
    };

    if (checkPatternConsistency(truthfulnessPattern)) {
      maxHonestCount = currentHonestCount;
    }
  }

  console.log(maxHonestCount);
}

function calculateHonestCount(pattern) {
  let tempPattern = pattern;
  let count = 0;
  while (tempPattern > 0) {
    if ((tempPattern & 1) === 1) {
      count++;
    }
    tempPattern >>= 1;
  }
  return count;
}

ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8").trim());
