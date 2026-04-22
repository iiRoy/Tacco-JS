const performComputation = (rawSequenceData) => {
  const textLines = rawSequenceData.split('\n');
  const sequenceLength = Number(textLines[0]);

  const transitionMap = new Map();
  for (let index = 0; index < sequenceLength; index++) {
    transitionMap.set(index + 1, Number(textLines[index + 1]));
  }

  const traversePath = (currentLocation, stepsTaken, visitedLocations, connectionRules, maxStepsAllowed) => {
    if (currentLocation === 2) {
      return stepsTaken;
    }

    if (stepsTaken > maxStepsAllowed) {
      return -1;
    }

    if (visitedLocations.has(currentLocation)) {
      return -1;
    }

    visitedLocations.add(currentLocation);

    const nextLocation = connectionRules.get(currentLocation);

    return traversePath(nextLocation, stepsTaken + 1, visitedLocations, connectionRules, maxStepsAllowed);
  };

  const initialLocation = transitionMap.get(1);

  const finalOutcome = traversePath(initialLocation, 1, new Set(), transitionMap, sequenceLength);

  console.log(finalOutcome);
};

const inputSource = require('fs').readFileSync('/dev/stdin', 'utf-8');
performComputation(inputSource);