function ProcessInput(rawData) {
  const lines = rawData.split("\n").slice(0, -1);

  const firstLineParts = lines[0].split(" ");

  const numJewels = parseInt(firstLineParts[0], 10);
  const numOperations = parseInt(firstLineParts[1], 10);

  const initialJewels = lines[1].split(" ").map(strVal => parseInt(strVal, 10));

  const totalPositiveJewelValue = initialJewels.reduce((accumulator, currentJewel) => {
    return accumulator + (currentJewel > 0 ? currentJewel : 0);
  }, 0);

  let isFinished = false;
  let currentMaxScore = 0;

  const createStateCopy = (originalState) => ({
    queue: originalState.queue.slice(),
    held: originalState.held.slice(),
  });

  const calculateHandSum = (itemsInHand) => {
    return itemsInHand.reduce((summedValue, currentItem) => summedValue + currentItem, 0);
  };

  const evaluateStateScore = (evaluatedState) => {
    const currentScore = calculateHandSum(evaluatedState.held);
    if (currentMaxScore < currentScore) {
      currentMaxScore = currentScore;
      const targetMax = totalPositiveJewelValue;
      if (currentMaxScore === targetMax) {
        isFinished = true;
      }
    }
  };

  const moveFromFrontToHand = (targetState) => {
    const item = targetState.queue.shift();
    if (item !== undefined) {
      targetState.held.push(item);
    }
  };

  const moveFromBackToHand = (targetState) => {
    const item = targetState.queue.pop();
    if (item !== undefined) {
      targetState.held.push(item);
    }
  };

  const moveFromHandToFront = (targetState, itemIndex) => {
    if (itemIndex >= 0 && itemIndex < targetState.held.length) {
      const [item] = targetState.held.splice(itemIndex, 1);
      targetState.queue.unshift(item);
    }
  };

  const moveFromHandToBack = (targetState, itemIndex) => {
    if (itemIndex >= 0 && itemIndex < targetState.held.length) {
      const [item] = targetState.held.splice(itemIndex, 1);
      targetState.queue.push(item);
    }
  };

  const performOperations = (currentState, operationCount) => {
    if (operationCount > numOperations || isFinished) {
      return;
    }

    const applyAndRecurse = (operationFunction, ...args) => {
      const nextState = createStateCopy(currentState);
      operationFunction(nextState, ...args);
      evaluateStateScore(nextState);
      performOperations(nextState, operationCount + 1);
    };

    if (currentState.queue.length > 0) {
      applyAndRecurse(moveFromFrontToHand);
      applyAndRecurse(moveFromBackToHand);
    }

    for (let j = 0; j < currentState.held.length; j++) {
      applyAndRecurse(moveFromHandToFront, j);
      applyAndRecurse(moveFromHandToBack, j);
    }
  };

  performOperations({ queue: initialJewels.slice(), held: [] }, 1);

  console.log(currentMaxScore);
}

ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
