function processInputData(rawData) {
  const lines = rawData.split("\n");
  lines.pop();

  const firstLineParts = lines[0].split(" ");
  const initialJwellCount = parseInt(firstLineParts[0]);
  const maxOperations = parseInt(firstLineParts[1]);

  const initialJwells = lines[1].split(" ").map(str => parseInt(str));

  let globalMaxSum = 0;

  const calculateArraySum = (jwellArray) => jwellArray.reduce((acc, val) => acc + val, 0);

  const cloneState = (stateToClone) => ({
    availableJwells: stateToClone.availableJwells.slice(),
    heldJwells: stateToClone.heldJwells.slice()
  });

  function exploreOperations(currentState, currentOperationNumber) {
    if (currentOperationNumber >= maxOperations) {
      return;
    }

    if (currentState.availableJwells.length > 0) {
      let nextStateFromFront = cloneState(currentState);
      const jwellTakenFromFront = nextStateFromFront.availableJwells.shift();
      nextStateFromFront.heldJwells.push(jwellTakenFromFront);
      const sumAfterFrontTake = calculateArraySum(nextStateFromFront.heldJwells);
      if (sumAfterFrontTake > globalMaxSum) {
        globalMaxSum = sumAfterFrontTake;
      }
      exploreOperations(nextStateFromFront, currentOperationNumber + 1);

      let nextStateFromBack = cloneState(currentState);
      const jwellTakenFromBack = nextStateFromBack.availableJwells.pop();
      nextStateFromBack.heldJwells.push(jwellTakenFromBack);
      const sumAfterBackTake = calculateArraySum(nextStateFromBack.heldJwells);
      if (sumAfterBackTake > globalMaxSum) {
        globalMaxSum = sumAfterBackTake;
      }
      exploreOperations(nextStateFromBack, currentOperationNumber + 1);
    }

    for (let handIdx = 0; handIdx < currentState.heldJwells.length; handIdx++) {
      let nextStateReturnFront = cloneState(currentState);
      const returnedJwellToFront = nextStateReturnFront.heldJwells.splice(handIdx, 1)[0];
      nextStateReturnFront.availableJwells.unshift(returnedJwellToFront);
      const sumAfterReturnFront = calculateArraySum(nextStateReturnFront.heldJwells);
      if (sumAfterReturnFront > globalMaxSum) {
        globalMaxSum = sumAfterReturnFront;
      }
      exploreOperations(nextStateReturnFront, currentOperationNumber + 1);

      let nextStateReturnBack = cloneState(currentState);
      const returnedJwellToBack = nextStateReturnBack.heldJwells.splice(handIdx, 1)[0];
      nextStateReturnBack.availableJwells.push(returnedJwellToBack);
      const sumAfterReturnBack = calculateArraySum(nextStateReturnBack.heldJwells);
      if (sumAfterReturnBack > globalMaxSum) {
        globalMaxSum = sumAfterReturnBack;
      }
      exploreOperations(nextStateReturnBack, currentOperationNumber + 1);
    }
  }

  exploreOperations({ availableJwells: initialJwells.slice(), heldJwells: [] }, 0);

  console.log(globalMaxSum);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
