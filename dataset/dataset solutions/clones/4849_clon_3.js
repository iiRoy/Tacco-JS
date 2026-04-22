const fileSystem = require("fs");

const sourceDataLines = fileSystem.readFileSync("/dev/stdin", "utf8").trim().split("\n");

const dataStreamProcessor = {
  textSegments: sourceDataLines,
  currentSegmentIndex: 0,
  totalSegmentsCount: sourceDataLines.length,

  hasMoreSegments: function() {
    return (this.currentSegmentIndex < this.totalSegmentsCount);
  },

  fetchNextSegment: function() {
    if (!this.hasMoreSegments()) {
      return "";
    }
    const retrievedSegment = this.textSegments[this.currentSegmentIndex];
    this.currentSegmentIndex++;
    return retrievedSegment;
  }
};

initiatePrimaryComputation();

function retrieveNextLine() {
  return dataStreamProcessor.fetchNextSegment();
}

function getParsedInteger() {
  return applyInputConversion(retrieveNextLine(), 1);
}

function getSpaceDelimitedStrings() {
  return applyInputConversion(retrieveNextLine(), 2);
}

function getSpaceDelimitedIntegers() {
  return applyInputConversion(retrieveNextLine(), 4);
}

function getIndividualCharacters() {
  return applyInputConversion(retrieveNextLine(), 6);
}

function checkMoreLinesAvailable() {
  return dataStreamProcessor.hasMoreSegments();
}

function emitOutput(content) {
  console.log(content);
}

function signalError(errorMessage) {
  console.error(errorMessage);
}

function applyInputConversion(inputValue, conversionType) {
  if (inputValue === null || inputValue === undefined) {
    signalError(`Warning: Received null/undefined input for conversion type ${conversionType}.`);
    return inputValue;
  }

  try {
    switch (conversionType) {
      case 1:
        const parsedInt = Number.parseInt(String(inputValue), 10);
        if (isNaN(parsedInt)) {
            signalError(`Warning: Could not parse "${inputValue}" as an integer. Returning 0.`);
            return 0;
        }
        return parsedInt;
      case 2:
        return String(inputValue).split(" ");
      case 4:
        return String(inputValue).split(" ").filter(s => s !== '').map((item) => Number(item));
      case 6:
        return String(inputValue).split("");
      default:
        signalError(`Unknown conversion type: ${conversionType}. Returning original input.`);
        return inputValue;
    }
  } catch (error) {
    signalError(`Error during input conversion for value "${inputValue}" with type ${conversionType}: ${error.message}`);
    return inputValue;
  }
}

function initiatePrimaryComputation() {
  const numericInputs = getSpaceDelimitedIntegers();

  if (!Array.isArray(numericInputs) || numericInputs.length !== 2) {
    signalError("Error: Expected exactly two numeric inputs on a single line. Outputting 0.");
    emitOutput(0);
    return;
  }

  const [firstNum, secondNum] = numericInputs;

  if (typeof firstNum !== 'number' || isNaN(firstNum) || firstNum === 0 ||
      typeof secondNum !== 'number' || isNaN(secondNum) || secondNum === 0) {
    signalError("Error: Input values must be non-zero numbers to perform reciprocal calculation. Outputting 0.");
    emitOutput(0);
    return;
  }

  const product = firstNum * secondNum;
  const sum = firstNum + secondNum;

  if (sum === 0) {
      signalError("Error: Sum of input numbers is zero, cannot calculate reciprocal of sum. Outputting 0.");
      emitOutput(0);
      return;
  }

  const finalResult = product / sum;

  emitOutput(finalResult);
}