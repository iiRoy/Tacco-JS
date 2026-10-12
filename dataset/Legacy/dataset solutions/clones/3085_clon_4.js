function Main(rawInputData) {
  let initialGolemTypes = [];

  let processedInputSegments = rawInputData.split('\n').map((lineSegment, segmentIndex) => {
    if (segmentIndex === 0) {
      return lineSegment.split(' ').map(Number);
    } else if (segmentIndex === 1) {
      return lineSegment.split('').map(charElement => {
        initialGolemTypes.push(charElement);
        return charElement;
      });
    } else {
      return lineSegment.split(' ');
    }
  });

  let [boardConfig, , ...operationInstructions] = processedInputSegments;
  let [gridDimension, operationCount] = boardConfig;

  let positionalStacks = new Map();
  for (let i = 0; i < gridDimension; i++) {
    positionalStacks.set(i, {
      golemCount: 1,
      presentTypes: new Set([initialGolemTypes[i]])
    });
  }

  let remainingGolemUnits = gridDimension;

  let finalSimulationState = operationInstructions.reduce((accumulator, currentOperation) => {
    let [targetGolemIdentifier, movementDirectionIndicator] = currentOperation;
    let { currentBoardMap, currentActiveGolems } = accumulator;

    let displacementValue = (movementDirectionIndicator === 'L' ? -1 : 1);

    for (let cellIterator = 0; cellIterator < gridDimension; cellIterator++) {
      let cellStackData = currentBoardMap.get(cellIterator);

      if (!cellStackData || cellStackData.golemCount === 0 || !cellStackData.presentTypes.has(targetGolemIdentifier)) {
        continue;
      }

      let stackSizeToMove = cellStackData.golemCount;

      cellStackData.presentTypes.delete(targetGolemIdentifier);

      cellStackData.golemCount = 0;

      let nextCellLocation = cellIterator + displacementValue;

      if (nextCellLocation < 0 || nextCellLocation >= gridDimension) {
        currentActiveGolems -= stackSizeToMove;
      } else {
        let destinationStackData = currentBoardMap.get(nextCellLocation);
        if (!destinationStackData) {
          destinationStackData = { golemCount: 0, presentTypes: new Set() };
          currentBoardMap.set(nextCellLocation, destinationStackData);
        }

        destinationStackData.presentTypes.add(initialGolemTypes[nextCellLocation]);

        destinationStackData.golemCount += stackSizeToMove;
      }
    }

    return { currentBoardMap, currentActiveGolems };
  }, { currentBoardMap: positionalStacks, currentActiveGolems: remainingGolemUnits });

  console.log(finalSimulationState.currentActiveGolems);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
