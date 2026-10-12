let inputBuffer = '';
process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', chunk => {
  inputBuffer += chunk;
});

const ALL_ROTATION_DIRECTIONS = ['N', 'W', 'S', 'E'];
const TOP_FACE_INDICES = [1, 5, 6, 2];
const RIGHT_FACE_INDICES = [1, 3, 6, 4];

const initializeDiceObject = faceValues => ({
  top: TOP_FACE_INDICES.map(faceIndex => faceValues[faceIndex - 1]),
  right: RIGHT_FACE_INDICES.map(faceIndex => faceValues[faceIndex - 1]),
});

const performDiceRoll = (currentDiceState, chosenDirection) => {
  const { top: currentTop, right: currentRight } = currentDiceState;

  switch (chosenDirection) {
    case 'W': {
      const newTopW = [currentRight[1], currentTop[1], currentRight[3], currentTop[3]];
      const newRightW = [currentRight[1], currentRight[2], currentRight[3], currentRight[0]];
      return { ...currentDiceState, top: newTopW, right: newRightW };
    }
    case 'E': {
      const newTopE = [currentRight[3], currentTop[1], currentRight[1], currentTop[3]];
      const newRightE = [currentRight[3], currentRight[0], currentRight[1], currentRight[2]];
      return { ...currentDiceState, top: newTopE, right: newRightE };
    }
    case 'S': {
      const newTopS = [currentTop[1], currentTop[2], currentTop[3], currentTop[0]];
      const newRightS = [currentTop[1], currentRight[1], currentTop[3], currentRight[3]];
      return { ...currentDiceState, top: newTopS, right: newRightS };
    }
    case 'N': {
      const newTopN = [currentTop[3], currentTop[0], currentTop[1], currentTop[2]];
      const newRightN = [currentTop[3], currentRight[1], currentTop[1], currentRight[3]];
      return { ...currentDiceState, top: newTopN, right: newRightN };
    }
    default:
      return currentDiceState;
  }
};

const areDiceStatesIdentical = (die1, die2) => {
  const topFacesMatch = die1.top.every((val, idx) => val === die2.top[idx]);
  const rightFacesMatch = die1.right.every((val, idx) => val === die2.right[idx]);
  return topFacesMatch && rightFacesMatch;
};

const checkDiceEquivalence = (firstDie, secondDie) => {
  const searchEndTime = Date.now() + 400;
  let currentDieState = { ...firstDie };

  while (Date.now() < searchEndTime) {
    const randomIndex = Math.floor(Math.random() * ALL_ROTATION_DIRECTIONS.length);
    const chosenDirection = ALL_ROTATION_DIRECTIONS[randomIndex];
    currentDieState = performDiceRoll(currentDieState, chosenDirection);

    if (areDiceStatesIdentical(currentDieState, secondDie)) {
      return true;
    }
  }
  return false;
};

const orientDiceToMatch = (initialDiceState, [targetTop, targetFront]) => {
  let workingDiceState = { ...initialDiceState };
  while (workingDiceState.top[0] !== targetTop || workingDiceState.top[3] !== targetFront) {
    const randomIndex = Math.floor(Math.random() * ALL_ROTATION_DIRECTIONS.length);
    const chosenDirection = ALL_ROTATION_DIRECTIONS[randomIndex];
    workingDiceState = performDiceRoll(workingDiceState, chosenDirection);
  }
  return workingDiceState;
};

const parseDiceInput = (rawInput) => {
  const trimmedInput = rawInput.trim();
  const inputLines = trimmedInput.split('\n');
  return inputLines.map(inputLine => {
    const numberStrings = inputLine.split(' ');
    const parsedNumbers = numberStrings.map(nStr => parseInt(nStr, 10));
    return initializeDiceObject(parsedNumbers);
  });
};

process.stdin.on('end', () => {
  const dicePair = parseDiceInput(inputBuffer);
  const firstDie = dicePair[0];
  const secondDie = dicePair[1];

  console.log(checkDiceEquivalence(firstDie, secondDie) ? 'Yes' : 'No');
});
