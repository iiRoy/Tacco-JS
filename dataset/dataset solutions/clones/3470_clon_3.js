function parseNumericString(inputString) {
  return parseInt(inputString);
}

function calculateNextState(currentA, currentB, currentTurn) {
    let tempA = currentA;
    let tempB = currentB;
    let nextTurnIdentifier;
    let amountToTransfer;

    if (currentTurn === 'a') {
        if (tempA % 2 !== 0) {
            tempA = tempA - 1;
        }
        amountToTransfer = tempA / 2;
        tempA = tempA - amountToTransfer;
        tempB = tempB + amountToTransfer;
        nextTurnIdentifier = 'b';
    } else { // currentTurn === 'b'
        if (tempB % 2 !== 0) {
            tempB = tempB - 1;
        }
        amountToTransfer = tempB / 2;
        tempA = tempA + amountToTransfer;
        tempB = tempB - amountToTransfer;
        nextTurnIdentifier = 'a';
    }
    return { updatedA: tempA, updatedB: tempB, nextTurn: nextTurnIdentifier };
}

function processInputData(rawData) {
  const inputLines = rawData.split("\n");
  const initialValues = inputLines[0].split(' ').map(parseNumericString);

  const initialAValue = initialValues[0];
  const initialBValue = initialValues[1];
  const numberOfIterations = initialValues[2];

  let currentAState = initialAValue;
  let currentBState = initialBValue;

  let activeTurn = 'a';

  for (let loopCounter = 0; loopCounter < numberOfIterations; loopCounter++) {
    const stateResult = calculateNextState(currentAState, currentBState, activeTurn);
    currentAState = stateResult.updatedA;
    currentBState = stateResult.updatedB;
    activeTurn = stateResult.nextTurn;
  }

  console.log(currentAState + ' ' + currentBState);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
