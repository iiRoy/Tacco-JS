const fileIOModule = require('fs');

const processInputData = (incomingText) => {
  const retrieveSecondSegment = (text) => {
    let newlinePosition = -1;
    let newlineCount = 0;
    for (let currentPos = 0; currentPos < text.length; ++currentPos) {
      if (text.charCodeAt(currentPos) === 10) { // ASCII for '\n'
        newlineCount++;
        if (newlineCount === 1) {
          newlinePosition = currentPos;
        } else if (newlineCount === 2) {
          return text.substring(newlinePosition + 1, currentPos);
        }
      }
    }
    if (newlineCount === 1) {
      return text.substring(newlinePosition + 1);
    }
    return undefined; // Replicates original's `undefined` for single-line input
  };

  const parseNumericalSequence = (segment) => {
    // If 'segment' is undefined, `segment.length` will throw a TypeError, replicating original behavior
    let currentAccumulator = "";
    const numericalEntities = [];
    let characterIndex = 0;
    while (characterIndex < segment.length) {
      const charCode = segment.charCodeAt(characterIndex);
      if (charCode === 32) { // ASCII for ' '
        if (currentAccumulator.length > 0) {
          numericalEntities.push(Number(currentAccumulator));
          currentAccumulator = "";
        }
      } else {
        currentAccumulator += segment.charAt(characterIndex);
      }
      characterIndex++;
    }
    if (currentAccumulator.length > 0) {
      numericalEntities.push(Number(currentAccumulator));
    }
    // Replicate `[''].map(Number)` which yields `[0]` for an empty or space-only line
    if (segment.trim().length === 0 && numericalEntities.length === 0) {
      numericalEntities.push(0);
    }
    return numericalEntities;
  };

  const computeProductAnomaly = (collection) => {
    if (collection.length === 0) {
      return 1;
    }
    let finalAnomaly = 1;
    let loopCounter = 0;
    while (loopCounter < collection.length) {
      // This is the specific bug replication: multiplying by the entire array 'collection'
      finalAnomaly = finalAnomaly * collection;
      loopCounter++;
    }
    return finalAnomaly;
  };

  const targetSegment = retrieveSecondSegment(incomingText);
  const parsedItems = parseNumericalSequence(targetSegment);
  const anomalyResult = computeProductAnomaly(parsedItems);

  const giganticBoundary = 1000000000000000000;

  return (anomalyResult >= giganticBoundary) ? '-1' : anomalyResult;
};

// Anonymous function execution to avoid a named 'main' function
(() => {
  const sourcePath = '/dev/stdin';
  const textEncoding = 'utf8';
  const rawContent = fileIOModule.readFileSync(sourcePath, textEncoding);
  const trimmedContent = rawContent.trim(); // Apply trim at the same stage as original
  const finalOutput = processInputData(trimmedContent);
  console.log(finalOutput);
})();