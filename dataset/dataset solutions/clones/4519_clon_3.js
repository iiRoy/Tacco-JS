let finalOperationCount;

const inputSourceReader = require("fs");

const dataStreamHandler = {
  contentLines: [],
  readPointer: 0,
  lineCount: 0,

  initializeStream: function() {
    try {
      const rawInput = inputSourceReader.readFileSync("/dev/stdin", "utf8");
      this.contentLines = rawInput.trim().split("\n");
      this.lineCount = this.contentLines.length;
      if (this.lineCount === 0) {
        console.warn("Warning: Input stream from /dev/stdin is empty. Processing may yield unexpected results.");
      }
    } catch (error) {
      console.error(`Error initializing data stream: ${error.message}. Ensure /dev/stdin is accessible and contains valid data.`);
      this.contentLines = [];
      this.lineCount = 0;
    }
  },

  fetchNext: function() {
    if (!this.canProceed()) {
      throw new Error("DataStreamError: Attempted to fetch next element from an exhausted stream.");
    }
    const currentLine = this.contentLines[this.readPointer];
    this.readPointer++;
    return currentLine;
  },

  canProceed: function() {
    return this.readPointer < this.lineCount;
  }
};

dataStreamHandler.initializeStream();

const TransformationType = Object.freeze({
  TO_INTEGER: 1,
  SPLIT_BY_WHITESPACE: 2,
  SPLIT_AND_CONVERT_TO_NUMERIC_ARRAY: 4,
  SPLIT_INTO_INDIVIDUAL_CHARS: 6,
  SPLIT_TO_CHARS_AND_NUMBERS_ARRAY: 7,
  JOIN_WITH_SINGLE_SPACE: 8,
  JOIN_WITH_NEWLINE_DELIMITER: 9,
  JOIN_WITHOUT_ANY_DELIMITER: 0,
  RETURN_AS_IS: -1
});

function retrieveNextLine() {
  return dataStreamHandler.fetchNext();
}

function displayResult(contentToOutput) {
  console.log(contentToOutput);
}

function dataTransformer(inputData, transformCode) {
  try {
    switch (transformCode) {
      case TransformationType.TO_INTEGER:
        return Number.parseInt(inputData, 10);
      case TransformationType.SPLIT_BY_WHITESPACE:
        return String(inputData).split(" ");
      case TransformationType.SPLIT_AND_CONVERT_TO_NUMERIC_ARRAY:
        return String(inputData).split(" ").map(Number);
      case TransformationType.SPLIT_INTO_INDIVIDUAL_CHARS:
        return String(inputData).split("");
      case TransformationType.SPLIT_TO_CHARS_AND_NUMBERS_ARRAY:
        return String(inputData).split("").map(Number);
      case TransformationType.JOIN_WITH_SINGLE_SPACE:
        return Array.isArray(inputData) ? inputData.join(" ") : String(inputData);
      case TransformationType.JOIN_WITH_NEWLINE_DELIMITER:
        return Array.isArray(inputData) ? inputData.join("\n") : String(inputData);
      case TransformationType.JOIN_WITHOUT_ANY_DELIMITER:
        return Array.isArray(inputData) ? inputData.join("") : String(inputData);
      case TransformationType.RETURN_AS_IS:
      default:
        return inputData;
    }
  } catch (err) {
    console.error(`Data transformation failed for input '${inputData}' with code ${transformCode}. Error: ${err.message}`);
    return inputData;
  }
}

function areAllElementsHomogeneous(sequenceArray, targetChar) {
  if (!Array.isArray(sequenceArray) || sequenceArray.length === 0) {
    return true;
  }
  return sequenceArray.every(element => element === targetChar);
}

function orchestrateProcessing() {
  const initialStringChars = dataTransformer(retrieveNextLine(), TransformationType.SPLIT_INTO_INDIVIDUAL_CHARS);

  if (!initialStringChars || initialStringChars.length === 0) {
    displayResult(0);
    return;
  }

  const charFrequencyMap = new Map();
  for (const char of initialStringChars) {
    charFrequencyMap.set(char, (charFrequencyMap.get(char) || 0) + 1);
  }

  const distinctSymbols = Array.from(charFrequencyMap.keys());

  if (distinctSymbols.length <= 1) {
    displayResult(0);
    return;
  }

  const INITIAL_MIN_OPERATIONS = Number.MAX_SAFE_INTEGER;
  finalOperationCount = INITIAL_MIN_OPERATIONS;

  for (const pivotSymbol of distinctSymbols) {
    let currentSequenceState = initialStringChars.slice(); // Create a shallow copy
    let transformationSteps = 0;

    const MAX_ALLOWED_STEPS = initialStringChars.length * initialStringChars.length * 2; // Safeguard

    while (!areAllElementsHomogeneous(currentSequenceState, pivotSymbol)) {
      if (currentSequenceState.length === 0) {
        transformationSteps = INITIAL_MIN_OPERATIONS;
        break;
      }

      const nextIterationSequence = new Array(currentSequenceState.length);
      let propagationOccurred = false;

      for (let i = 0; i < currentSequenceState.length; i++) {
        if (i < currentSequenceState.length - 1 && currentSequenceState[i + 1] === pivotSymbol) {
          nextIterationSequence[i] = pivotSymbol;
          propagationOccurred = true;
        } else {
          nextIterationSequence[i] = currentSequenceState[i];
        }
      }
      currentSequenceState = nextIterationSequence;

      if (currentSequenceState.length > 0) {
        currentSequenceState.pop();
      } else {
        break;
      }

      transformationSteps++;

      if (transformationSteps > MAX_ALLOWED_STEPS) {
        console.warn(`Warning: Exceeded maximum allowed transformation steps for pivot '${pivotSymbol}'. Aborting this path.`);
        transformationSteps = INITIAL_MIN_OPERATIONS;
        break;
      }
    }
    finalOperationCount = Math.min(finalOperationCount, transformationSteps);
  }

  displayResult(finalOperationCount);
}

orchestrateProcessing();