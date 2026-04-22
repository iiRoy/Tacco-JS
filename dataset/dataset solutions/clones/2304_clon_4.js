const generateSequences = (upperBound, sequenceLength) => {
  const findSequences = (currentSequence, remainingLength, availableNumbers) => {
    if (remainingLength === 0) {
      return [currentSequence];
    }

    let resultingSequences = [];
    for (let currentNum of availableNumbers) {
      const nextAvailable = new Set(availableNumbers);
      nextAvailable.delete(currentNum);
      const subSequences = findSequences([...currentSequence, currentNum], remainingLength - 1, nextAvailable);
      resultingSequences.push(...subSequences);
    }
    return resultingSequences;
  };

  const initialNumbers = new Set();
  for (let val = 1; val <= upperBound; val++) {
    initialNumbers.add(val);
  }

  return findSequences([], sequenceLength, initialNumbers);
};

const processGame = (rawInput) => {
  const gameLines = rawInput.trim().split('\n');
  const [matchCount, cooldownDistance] = gameLines[0].split(' ').map(Number);
  const [scoreForRock, scoreForScissors, scoreForPaper] = gameLines[1].split(' ').map(Number);
  const opponentPattern = gameLines[2];

  const moveOutcomes = {
    'r': scoreForPaper,
    's': scoreForRock,
    'p': scoreForScissors
  };

  const [totalPointsAccumulated] = Array.from(opponentPattern).reduce((stateContainer, currentFoeMove, currentRoundIndex) => {
    let [currentTotalPoints, bypassedRoundIndices] = stateContainer;

    const previousRelevantRoundIndex = currentRoundIndex - cooldownDistance;
    const isStrategicBypass =
      previousRelevantRoundIndex >= 0 &&
      currentFoeMove === opponentPattern[previousRelevantRoundIndex] &&
      !bypassedRoundIndices.has(previousRelevantRoundIndex);

    if (isStrategicBypass) {
      bypassedRoundIndices.add(currentRoundIndex);
    } else {
      currentTotalPoints += moveOutcomes[currentFoeMove];
    }

    return [currentTotalPoints, bypassedRoundIndices];
  }, [0, new Set()]);

  console.log(totalPointsAccumulated);
};

processGame(require("fs").readFileSync("/dev/stdin", "utf8"));