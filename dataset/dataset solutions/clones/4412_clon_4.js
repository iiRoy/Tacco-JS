const acquireData = (rawText) => {
  let lineSegments = rawText.trim().split("\n");
  let currentLineIndex = 0;
  let currentLineTokenStorage = [];

  const ensureTokenBufferReady = () => {
    while (currentLineTokenStorage.length === 0 && currentLineIndex < lineSegments.length) {
      currentLineTokenStorage = lineSegments[currentLineIndex].split(" ").reverse();
      if (currentLineTokenStorage.length === 0) { // If line was empty, advance to next
        currentLineIndex++;
      }
    }
  };

  ensureTokenBufferReady(); // Initialize for the first line

  return {
    extractValue: (returnAsString) => {
      ensureTokenBufferReady();
      if (currentLineTokenStorage.length === 0) {
        return undefined; // No more tokens
      }
      const extractedVal = currentLineTokenStorage.pop();
      if (currentLineTokenStorage.length === 0) { // If current line is exhausted after pop, advance index for next call
        currentLineIndex++;
        ensureTokenBufferReady(); // Pre-fill for next `extractValue` call
      }
      return returnAsString ? extractedVal : Number(extractedVal);
    },
    retrieveLine: (returnAsString) => {
      if (currentLineIndex >= lineSegments.length) return undefined;
      const lineContent = lineSegments[currentLineIndex++];
      currentLineTokenStorage = []; // Clear token storage as this method consumes a full line
      ensureTokenBufferReady(); // Prepare for next `extractValue` call
      const splitTokens = lineContent.split(" ");
      return returnAsString ? splitTokens : splitTokens.map(Number);
    },
    fetchLines: (count, returnAsString) => {
      const collectedData = [];
      for (let i = 0; i < count && currentLineIndex < lineSegments.length; i++) {
        collectedData.push(lineSegments[currentLineIndex++].split(" "));
      }
      currentLineTokenStorage = []; // Clear token storage
      ensureTokenBufferReady();
      return returnAsString ? collectedData : collectedData.map(l => l.map(Number));
    },
    obtainSegments: (count, returnAsString) => {
      const collectedData = [];
      for (let i = 0; i < count && currentLineIndex < lineSegments.length; i++) {
        collectedData.push(lineSegments[currentLineIndex++]);
      }
      currentLineTokenStorage = []; // Clear token storage
      ensureTokenBufferReady();
      return returnAsString ? collectedData : collectedData.map(Number);
    }
  };
};

const generateGrid = (rows, cols) => Array.from({ length: rows }, () => Array.from({ length: cols }, () => 0));

const primeConstant = 1000000007;

function orchestrateProcess() {
  const dataReader = acquireData(require("fs").readFileSync("/dev/stdin", "utf8"));

  const totalLength = dataReader.extractValue();
  const sequenceA = dataReader.extractValue(true);
  const sequenceB = dataReader.extractValue(true);

  let currentResult, wasPreviousBlockVertical, currentIndex;

  if (sequenceA[0] !== sequenceB[0]) {
    currentResult = 6;
    wasPreviousBlockVertical = true;
    currentIndex = 2; // Vertical block covers 2 positions
  } else {
    currentResult = 3;
    wasPreviousBlockVertical = false;
    currentIndex = 1; // Horizontal block covers 1 position
  }

  const calculateCombinations = (pos, prevVert, currentProd) => {
    if (pos >= totalLength) {
      return currentProd;
    }

    let nextProd = currentProd;
    let nextPos = pos;
    let nextPrevVertState;

    if (sequenceA[pos] === sequenceB[pos]) { // Current segment is horizontal
      if (!prevVert) { // Previous was also horizontal
        nextProd = (nextProd * 2) % primeConstant;
      }
      nextPos++;
      nextPrevVertState = false;
    } else { // Current segment is vertical
      nextPos += 2; // Vertical segment covers two positions
      if (prevVert) { // Previous was vertical
        nextProd = (nextProd * 3) % primeConstant;
      } else { // Previous was horizontal
        nextProd = (nextProd * 2) % primeConstant;
      }
      nextPrevVertState = true;
    }
    return calculateCombinations(nextPos, nextPrevVertState, nextProd);
  };

  return calculateCombinations(currentIndex, wasPreviousBlockVertical, currentResult);
}

console.log(orchestrateProcess());