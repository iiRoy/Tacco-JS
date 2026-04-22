const LARGE_NUMBER_THRESHOLD = 999999999;
const UNVISITED_MARKER = 65535;
let resultGrid = new Array(8);
for (let firstDim = 0; firstDim < 8; firstDim++) {
  resultGrid[firstDim] = new Array(8);
  for (let secondDim = 0; secondDim < 8; secondDim++) {
    resultGrid[firstDim][secondDim] = new Array(8);
    for (let thirdDim = 0; thirdDim < 8; thirdDim++) {
      resultGrid[firstDim][secondDim][thirdDim] = new Array(8);
      for (let fourthDim = 0; fourthDim < 8; fourthDim++) {
        resultGrid[firstDim][secondDim][thirdDim][fourthDim] = new Array(8);
        for (let fifthDim = 0; fifthDim < 8; fifthDim++) {
          resultGrid[firstDim][secondDim][thirdDim][fourthDim][fifthDim] = new Array(8);
          for (let sixthDim = 0; sixthDim < 8; sixthDim++) {
            resultGrid[firstDim][secondDim][thirdDim][fourthDim][fifthDim][sixthDim] = new Array(8);
            for (let seventhDim = 0; seventhDim < 8; seventhDim++) {
              resultGrid[firstDim][secondDim][thirdDim][fourthDim][fifthDim][sixthDim][seventhDim] = UNVISITED_MARKER;
            }
          }
        }
      }
    }
  }
}
const moveSteps = [-1, 1, -4, 4];
function computeChildConfigurations(currentArrangement) {
  let gapPosition;
  for (let idx = 0; idx < 8; idx++) {
    if (currentArrangement[idx] === 0) {
      gapPosition = idx;
      break;
    }
  }
  const successorConfigurations = [];
  for (let moveIdx = 0; moveIdx < 4; moveIdx++) {
    const candidateArrangement = [...currentArrangement];
    const destinationSpot = gapPosition + moveSteps[moveIdx];
    if (destinationSpot >= 0 && destinationSpot < 8) {
      if ((gapPosition === 3 && moveSteps[moveIdx] === 1) || (gapPosition === 4 && moveSteps[moveIdx] === -1)) {
        continue;
      }
      [candidateArrangement[gapPosition], candidateArrangement[destinationSpot]] = [candidateArrangement[destinationSpot], candidateArrangement[gapPosition]];
      successorConfigurations.push(candidateArrangement);
    }
  }
  return successorConfigurations;
}
function checkSortedOrder(currentArrangement) {
  for (let elemIndex = 0; elemIndex < 7; elemIndex++) {
    if (currentArrangement[elemIndex] + 1 !== currentArrangement[elemIndex + 1]) {
      return false;
    }
  }
  return true;
}
function calculateMinimumMoves(currentBoardState, currentMoveCount) {
  if (currentMoveCount > 10)
    return UNVISITED_MARKER;
  if (checkSortedOrder(currentBoardState)) {
    resultGrid[currentBoardState[0]][currentBoardState[1]][currentBoardState[2]][currentBoardState[3]][currentBoardState[4]][currentBoardState[5]][currentBoardState[6]] = currentMoveCount;
    return currentMoveCount;
  }
  const cachedValue = resultGrid[currentBoardState[0]][currentBoardState[1]][currentBoardState[2]][currentBoardState[3]][currentBoardState[4]][currentBoardState[5]][currentBoardState[6]];
  if (cachedValue !== UNVISITED_MARKER) {
    return cachedValue;
  }
  const nextConfigurations = computeChildConfigurations(currentBoardState);
  let minimumMovesFound = LARGE_NUMBER_THRESHOLD;
  for (let stateIdx = 0; stateIdx < nextConfigurations.length; stateIdx++) {
    minimumMovesFound = Math.min(minimumMovesFound, calculateMinimumMoves(currentBoardState, currentMoveCount + 1));
  }
  resultGrid[currentBoardState[0]][currentBoardState[1]][currentBoardState[2]][currentBoardState[3]][currentBoardState[4]][currentBoardState[5]][currentBoardState[6]] = minimumMovesFound;
  return minimumMovesFound;
}
function initiateSolver() {
  const initialInput = [1, 2, 3, 0, 4, 5, 6, 7];
  resultGrid[initialInput[0]][initialInput[1]][initialInput[2]][initialInput[3]][initialInput[4]][initialInput[5]][initialInput[6]] = 0;
  let finalMinimum = LARGE_NUMBER_THRESHOLD;
  const firstLevelConfigurations = computeChildConfigurations(initialInput);
  for (let configIndex = 0; configIndex < firstLevelConfigurations.length; configIndex++) {
    finalMinimum = Math.min(finalMinimum, calculateMinimumMoves(firstLevelConfigurations[configIndex], 1));
  }
  console.log(finalMinimum);
}
initiateSolver();