const createInputUtility = (sourceData) => {
  let lineSegments = sourceData.trim().split('\n');
  let currentSegmentIndex = 0;

  const acquireToken = (shouldConvert) => {
    if (currentSegmentIndex >= lineSegments.length) {
      return undefined;
    }

    let activeLine = lineSegments[currentSegmentIndex];
    let tokensOnLine = activeLine.split(' ');
    let firstToken = tokensOnLine.shift();
    
    lineSegments[currentSegmentIndex] = tokensOnLine.join(' ');

    if (tokensOnLine.length === 0) {
      currentSegmentIndex++;
    }

    return shouldConvert ? Number(firstToken) : firstToken;
  };

  const acquireLineTokens = (shouldConvert) => {
    if (currentSegmentIndex >= lineSegments.length) {
      return undefined;
    }
    const currentLine = lineSegments[currentSegmentIndex++];
    const tokens = currentLine.split(' ');
    return shouldConvert ? tokens.map(Number) : tokens;
  };

  const acquireMatrix = (numberOfRows, shouldConvert) => {
    const collectedData = [];
    for (let i = 0; i < numberOfRows; i++) {
      if (currentSegmentIndex >= lineSegments.length) break;
      const rowTokens = lineSegments[currentSegmentIndex++].split(' ');
      collectedData.push(shouldConvert ? rowTokens.map(Number) : rowTokens);
    }
    return collectedData;
  };

  const acquireRowStrings = (numberOfRows, shouldConvert) => {
    const collectedData = [];
    for (let i = 0; i < numberOfRows; i++) {
      if (currentSegmentIndex >= lineSegments.length) break;
      const rowContent = lineSegments[currentSegmentIndex++];
      collectedData.push(shouldConvert ? Number(rowContent) : rowContent);
    }
    return collectedData;
  };

  return {
    getValue: acquireToken,
    getTokens: acquireLineTokens,
    getGrid: acquireMatrix,
    getLines: acquireRowStrings,
  };
};

const processedInput = createInputUtility(require("fs").readFileSync("/dev/stdin","utf8"));

console.log(calculateResult());

function calculateResult() {
  const problemSize = processedInput.getValue(true);
  const coreStrings = processedInput.getLines(problemSize, false);
  
  const expandedStrings = [...coreStrings, ...coreStrings];

  const checkRotationalSymmetry = (startOffset, currentSize, fullData) => {
    return !Array.from({ length: currentSize }).some((rIndex) => {
      return Array.from({ length: currentSize - (rIndex + 1) }).some((_, cOffset) => {
        const cIndex = rIndex + 1 + cOffset;
        const charA = fullData[rIndex + startOffset][cIndex];
        const charB = fullData[cIndex + startOffset][rIndex];
        return charA !== charB;
      });
    });
  };

  const finalScore = Array.from({ length: problemSize }).reduce((accumulator, _, rotationIndex) => {
    if (checkRotationalSymmetry(rotationIndex, problemSize, expandedStrings)) {
      return accumulator + problemSize;
    }
    return accumulator;
  }, 0);

  return finalScore;
}