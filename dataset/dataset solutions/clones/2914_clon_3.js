function Main(rawInput) {
  const inputLines = rawInput.trim().split("\n");
  const [jwellCountStr, opCountStr] = inputLines[0].split(" ");
  const numJwells = Number(jwellCountStr);
  const numOperations = Number(opCountStr);
  const initialJwells = inputLines[1].split(" ").map(Number);
  let maximumHandValue = 0;

  function createClonedState(originalState) {
    return {
      dequeue: originalState.dequeue.slice(),
      hands: originalState.hands.slice(),
    };
  }

  function calculateHandSum(handItems) {
    return handItems.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
  }

  function updateMaxTotal(currentHandState) {
    const currentTotal = calculateHandSum(currentHandState.hands);
    if (maximumHandValue < currentTotal) {
      maximumHandValue = currentTotal;
    }
  }

  function takeFromDequeueFront(opState) {
    opState.hands.push(opState.dequeue.shift());
  }

  function takeFromDequeueBack(opState) {
    opState.hands.push(opState.dequeue.pop());
  }

  function returnToDequeueFront(opState, itemIndex) {
    const [removedItem] = opState.hands.splice(itemIndex, 1);
    opState.dequeue.unshift(removedItem);
  }

  function returnToDequeueBack(opState, itemIndex) {
    const [removedItem] = opState.hands.splice(itemIndex, 1);
    opState.dequeue.push(removedItem);
  }

  function simulateOperations(currentOpState, currentOpCount) {
    if (currentOpCount > numOperations) {
      return;
    }

    const possibleOperations = [
      // Operation 0: Take from dequeue front (A)
      (stateForOp) => {
        if (stateForOp.dequeue.length > 0) {
          const nextState = createClonedState(stateForOp);
          takeFromDequeueFront(nextState);
          updateMaxTotal(nextState);
          simulateOperations(nextState, currentOpCount + 1);
        }
      },
      // Operation 1: Take from dequeue back (B)
      (stateForOp) => {
        if (stateForOp.dequeue.length > 0) {
          const nextState = createClonedState(stateForOp);
          takeFromDequeueBack(nextState);
          updateMaxTotal(nextState);
          simulateOperations(nextState, currentOpCount + 1);
        }
      },
      // Operation 2: Return from hands to dequeue front (C)
      (stateForOp) => {
        for (let i = 0; i < stateForOp.hands.length; i++) {
          const nextState = createClonedState(stateForOp);
          returnToDequeueFront(nextState, i);
          updateMaxTotal(nextState);
          simulateOperations(nextState, currentOpCount + 1);
        }
      },
      // Operation 3: Return from hands to dequeue back (D)
      (stateForOp) => {
        for (let i = 0; i < stateForOp.hands.length; i++) {
          const nextState = createClonedState(stateForOp);
          returnToDequeueBack(nextState, i);
          updateMaxTotal(nextState);
          simulateOperations(nextState, currentOpCount + 1);
        }
      },
    ];

    for (let opExecutor of possibleOperations) {
      opExecutor(currentOpState);
    }
  }

  simulateOperations({ dequeue: initialJwells.slice(), hands: [] }, 1);

  console.log(maximumHandValue);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
