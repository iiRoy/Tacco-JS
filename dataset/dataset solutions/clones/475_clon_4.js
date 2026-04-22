const retrieveInput = () => require('fs').readFileSync('/dev/stdin', 'utf8');

const createPosition = (xVal, yVal) => ({ x: xVal, y: yVal });

const measureManhattanDistance = (firstPos, secondPos) =>
  Math.abs(firstPos.x - secondPos.x) + Math.abs(firstPos.y - secondPos.y);

const analyzeGridScenario = (scenarioLines, currentLinePointer) => {
  const [gridWidth, gridHeight] = scenarioLines[currentLinePointer++].split(' ').map(Number);

  if (gridWidth === 0 && gridHeight === 0) {
    return { finished: true, nextPointer: currentLinePointer };
  }

  let startCoords = null;
  let endCoords = null;
  const categorizedElements = Array.from({ length: 5 }, () => []);

  for (let yIterator = 0; yIterator < gridHeight; yIterator++) {
    const rowData = scenarioLines[currentLinePointer++];
    for (let xIterator = 0; xIterator < gridWidth; xIterator++) {
      const charSymbol = rowData[xIterator];
      const currentPos = createPosition(xIterator, yIterator);

      switch (charSymbol) {
        case 'S':
          startCoords = currentPos;
          break;
        case 'G':
          endCoords = currentPos;
          break;
        case '.':
          break;
        default:
          const attributeIndex = Number(charSymbol) - 1;
          categorizedElements[attributeIndex].push(currentPos);
          break;
      }
    }
  }

  let minimalTotalPath = Infinity;
  let optimalStartingAttribute = -1;

  for (let initialAttributeSelection = 0; initialAttributeSelection < 5; initialAttributeSelection++) {
    const pathMemo = new Map();

    const findPathSegment = (currentLocation, currentSequenceStep, previousAttributeType = -1, previousInstanceIndex = -1) => {
      if (currentSequenceStep === 5) {
        return measureManhattanDistance(currentLocation, endCoords);
      }

      if (previousAttributeType !== -1 && previousInstanceIndex !== -1) {
        const memoKey = `${currentSequenceStep}-${previousAttributeType}-${previousInstanceIndex}`;
        if (pathMemo.has(memoKey)) {
          return pathMemo.get(memoKey);
        }
      }

      const requiredAttributeType = (initialAttributeSelection + currentSequenceStep) % 5;
      const candidateAttributeInstances = categorizedElements[requiredAttributeType];

      if (candidateAttributeInstances.length === 0) {
        const result = Infinity;
        if (previousAttributeType !== -1 && previousInstanceIndex !== -1) {
          const memoKey = `${currentSequenceStep}-${previousAttributeType}-${previousInstanceIndex}`;
          pathMemo.set(memoKey, result);
        }
        return result;
      }

      let localShortestPath = Infinity;

      for (let instanceIdx = 0; instanceIdx < candidateAttributeInstances.length; instanceIdx++) {
        const nextInstanceLocation = candidateAttributeInstances[instanceIdx];
        const directSegmentLength = measureManhattanDistance(currentLocation, nextInstanceLocation);

        const remainingPathFromNext = findPathSegment(
          nextInstanceLocation,
          currentSequenceStep + 1,
          requiredAttributeType,
          instanceIdx
        );

        if (remainingPathFromNext !== Infinity) {
          localShortestPath = Math.min(localShortestPath, directSegmentLength + remainingPathFromNext);
        }
      }

      if (previousAttributeType !== -1 && previousInstanceIndex !== -1) {
        const memoKey = `${currentSequenceStep}-${previousAttributeType}-${previousInstanceIndex}`;
        pathMemo.set(memoKey, localShortestPath);
      }
      return localShortestPath;
    };

    const currentSequenceTotalLength = findPathSegment(startCoords, 0);

    if (currentSequenceTotalLength < minimalTotalPath) {
      minimalTotalPath = currentSequenceTotalLength;
      optimalStartingAttribute = initialAttributeSelection;
    }
  }

  if (minimalTotalPath === Infinity) {
    console.log("NA");
  } else {
    console.log(`${optimalStartingAttribute + 1} ${minimalTotalPath}`);
  }

  return { finished: false, nextPointer: currentLinePointer };
};

const executeProgram = () => {
  const allInputLines = retrieveInput().trim().split('\n');
  let linePtr = 0;
  while (true) {
    const scenarioResult = analyzeGridScenario(allInputLines, linePtr);
    linePtr = scenarioResult.nextPointer;
    if (scenarioResult.finished) {
      break;
    }
  }
};

executeProgram();