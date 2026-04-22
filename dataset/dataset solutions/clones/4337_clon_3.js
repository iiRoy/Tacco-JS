const fetchInputLines = () => {
  try {
    const fileContent = require("fs").readFileSync("/dev/stdin", "utf8");
    return fileContent.trim().split("\n");
  } catch (error) {
    console.error("Error reading input from stdin:", error.message);
    return [];
  }
};

const initializeLineProcessor = () => {
  const allInputLines = fetchInputLines();
  let currentLineIndex = 0;
  const totalLines = allInputLines.length;

  if (totalLines === 0) {
    console.warn("Input file was empty or unreadable.");
  }

  return {
    hasMoreContent: () => currentLineIndex < totalLines,
    retrieveNextLine: () => {
      if (!this.hasMoreContent()) {
        console.error("Attempted to read past the end of input lines.");
        return "";
      }
      const lineToReturn = allInputLines[currentLineIndex];
      currentLineIndex++;
      return lineToReturn;
    },
  };
};

const inputProcessor = initializeLineProcessor();

const transformInput = (inputData, formatCode) => {
  try {
    switch (formatCode) {
      case 1: // Convert to integer
        return Number.parseInt(inputData, 10);
      case 2: // Split by space into string array
        return String(inputData).split(" ");
      case 3: // Split by space into numeric array (new variation)
      case 4: // Split by space into numeric array (original)
        return String(inputData).split(" ").map(Number);
      case 5: // Split into character array (new variation)
      case 6: // Split into character array (original)
        return String(inputData).split("");
      case 7: // Split into character array, then convert to numbers
        return String(inputData).split("").map(Number);
      case 8: // Join array with spaces
        return Array.isArray(inputData) ? inputData.join(" ") : inputData;
      case 9: // Join array with newlines
        return Array.isArray(inputData) ? inputData.join("\n") : inputData;
      case 0: // Join array without delimiter
        return Array.isArray(inputData) ? inputData.join("") : inputData;
      default:
        console.warn(`Unrecognized transformation code: ${formatCode}. Returning original data.`);
        return inputData;
    }
  } catch (conversionError) {
    console.error(`Failed to transform input with code ${formatCode}: ${conversionError.message}`);
    return inputData;
  }
};

const obtainNextInteger = () => transformInput(inputProcessor.retrieveNextLine(), 1);
const obtainNextStringArray = () => transformInput(inputProcessor.retrieveNextLine(), 2);
const obtainNextNumericArray = () => transformInput(inputProcessor.retrieveNextLine(), 4);
const obtainNextCharacterArray = () => transformInput(inputProcessor.retrieveNextLine(), 6);

const emitOutput = (content) => {
  console.log(String(content));
};

const logDiagnostic = (message) => {
  console.error(`[DEBUG] ${String(message)}`);
};

const incrementCharCount = (charMap, char) => {
  charMap.set(char, (charMap.get(char) || 0) + 1);
};

const allocateCharacterBlocks = (charFrequencies, uniqueChars, blockCount, decrementAmount) => {
  if (blockCount <= 0) {
    return true;
  }

  let currentBlocksToAllocate = blockCount;
  let allocationPossibleInPass;

  while (currentBlocksToAllocate > 0) {
    allocationPossibleInPass = false;
    for (const charKey of uniqueChars) {
      if (charFrequencies.get(charKey) >= decrementAmount) {
        charFrequencies.set(charKey, charFrequencies.get(charKey) - decrementAmount);
        currentBlocksToAllocate--;
        allocationPossibleInPass = true;
        if (currentBlocksToAllocate === 0) {
          return true;
        }
      }
    }
    if (!allocationPossibleInPass) {
      return false; // No character could satisfy the requirement in this pass
    }
  }
  return true;
};

function analyzeGridPattern() {
  const gridDimensions = obtainNextNumericArray();
  
  if (!gridDimensions || gridDimensions.length < 2 || gridDimensions.some(d => !Number.isInteger(d) || d <= 0)) {
    logDiagnostic("Invalid or insufficient grid dimensions provided. Terminating.");
    emitOutput("No");
    return;
  }

  const gridHeight = gridDimensions[0];
  const gridWidth = gridDimensions[1];

  const charFrequencies = new Map();

  for (let rowIdx = 0; rowIdx < gridHeight; rowIdx++) {
    const currentRowCharacters = obtainNextCharacterArray();
    if (currentRowCharacters.length !== gridWidth) {
        logDiagnostic(`Row ${rowIdx} length mismatch: expected ${gridWidth}, got ${currentRowCharacters.length}.`);
        // For robustness, could exit here: emitOutput("No"); return;
    }
    for (const char of currentRowCharacters) {
      incrementCharCount(charFrequencies, char);
    }
  }

  let requiredFourBlocks = 0;
  let requiredTwoBlocks = 0;
  let requiredSingleBlocks = 0;

  const halfHeightRoundedUp = Math.ceil(gridHeight / 2);
  const halfWidthRoundedUp = Math.ceil(gridWidth / 2);

  const isHeightDimensionOdd = (gridHeight % 2 === 1);
  const isWidthDimensionOdd = (gridWidth % 2 === 1);

  if (isHeightDimensionOdd && isWidthDimensionOdd) {
    requiredFourBlocks = (halfHeightRoundedUp - 1) * (halfWidthRoundedUp - 1);
    requiredTwoBlocks = (halfHeightRoundedUp - 1) + (halfWidthRoundedUp - 1);
    requiredSingleBlocks = 1;
  } else if (isHeightDimensionOdd && !isWidthDimensionOdd) {
    requiredFourBlocks = halfWidthRoundedUp * (halfHeightRoundedUp - 1);
    requiredTwoBlocks = halfWidthRoundedUp;
  } else if (!isHeightDimensionOdd && isWidthDimensionOdd) {
    requiredFourBlocks = halfHeightRoundedUp * (halfWidthRoundedUp - 1);
    requiredTwoBlocks = halfHeightRoundedUp;
  } else { // Both dimensions are even
    requiredFourBlocks = halfHeightRoundedUp * halfWidthRoundedUp;
  }

  logDiagnostic(`Target blocks: 4s=${requiredFourBlocks}, 2s=${requiredTwoBlocks}, 1s=${requiredSingleBlocks}`);

  const uniqueCharactersInGrid = Array.from(charFrequencies.keys());

  if (!allocateCharacterBlocks(charFrequencies, uniqueCharactersInGrid, requiredFourBlocks, 4)) {
    emitOutput("No");
    return;
  }
  if (!allocateCharacterBlocks(charFrequencies, uniqueCharactersInGrid, requiredTwoBlocks, 2)) {
    emitOutput("No");
    return;
  }
  if (!allocateCharacterBlocks(charFrequencies, uniqueCharactersInGrid, requiredSingleBlocks, 1)) {
    emitOutput("No");
    return;
  }
  
  emitOutput("Yes");
}

analyzeGridPattern();