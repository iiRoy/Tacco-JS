const system = {
  input: process.stdin,
  output: process.stdout,
  errorOutput: console.error,
  logOutput: console.log,
  memoryUsage: process.memoryUsage
};

const getModule = require;

const lineProcessor = getModule('readline').createInterface({
  input: system.input,
  output: system.output
});

let inputHandler; // Object responsible for managing input stream
const capturedLines = []; // Array to store all incoming lines

lineProcessor.on('dataLine', (currentLineContent) => {
  capturedLines.push(currentLineContent);
});

lineProcessor.on('streamEnded', () => {
  inputHandler = initializeInput(capturedLines);
  system.errorOutput("\n"); // Insert a newline for clearer debug output
  const startTime = new Date();
  executeCoreLogic(); // Execute the primary application logic
  const duration = new Date() - startTime;
  logErrorDetails("execution_time : " + (duration) + "ms");
  logErrorDetails("memory_usage : " + Math.round(system.memoryUsage().heapTotal / 1024) + "KB");
});

function deepCopyObject(sourceObject) {
  return JSON.parse(JSON.stringify(sourceObject));
}

function retrieveInteger() {
  return dataTransformer(fetchNextItem(), 1);
}

function retrieveStringArray() {
  return dataTransformer(fetchNextItem(), 2);
}

function retrieveIntegerArray() {
  return dataTransformer(fetchNextItem(), 4);
}

function retrieveCharacterArray() {
  return dataTransformer(fetchNextItem(), 6);
}

function fetchNextItem() {
  return inputHandler.getNext();
}

function hasMoreItems() {
  return inputHandler.hasRemaining();
}

// Function to set up the input parsing utility
function initializeInput(rawInputLines) {
  const parsingUtility = {
    sourceData: rawInputLines,
    currentPosition: 0,
    maximumLength: rawInputLines.length,

    hasRemaining: function() {
      return (this.currentPosition < this.maximumLength);
    },

    getNext: function() {
      if (!this.hasRemaining()) {
        throw "EndOfInputException No further elements available";
      } else {
        const currentElement = this.sourceData[this.currentPosition];
        this.currentPosition++;
        return currentElement;
      }
    }
  };
  return parsingUtility;
}

// Displays the processed output to the standard output stream
function outputResult(contentToDisplay) {
  system.logOutput(contentToDisplay);
}

// Outputs diagnostic messages to the standard error stream
function logErrorDetails(debugMessage) {
  system.errorOutput("diagnostic:" + getModule("util").inspect(debugMessage, false, null));
}

/*
 * This helper function performs various data type conversions and manipulations.
 * Transformation Codes:
 * 1: Parse the input string into an integer.
 * 2: Split the input string by spaces into an array of strings.
 * 4: Split by spaces and convert each part to a number, returning an array of numbers.
 * 6: Split the input string into individual characters, returning an array of characters.
 * 7: Split into characters and convert each to a number, returning an array of numbers.
 * 8: Join elements of an array with a single space.
 * 9: Join elements of an array with a newline character.
 * 0: Join elements of an array without any separator.
 * Default: Returns the input value without modification.
 */
function dataTransformer(inputValue, transformType) {
  try {
    switch (transformType) {
      case 1:
        return Number.parseInt(inputValue, 10);
      case 2:
        return inputValue.split(" ");
      case 4:
        return inputValue.split(" ").map(Number);
      case 6:
        return inputValue.split("");
      case 7:
        return inputValue.split("").map(Number);
      case 8:
        return inputValue.join(" ");
      case 9:
        return inputValue.join("\n");
      case 0:
        return inputValue.join("");
      default:
        return inputValue;
    }
  } catch (errorObject) {
    return inputValue; // In case of conversion error, return original input
  }
}

// End of supporting functionalities
// --------------------------------------------------------------------------

function executeCoreLogic() {
  const inputCount = retrieveInteger();
  const resultContainer = new Array(inputCount);
  const frequencyMap = {};

  // Compute frequencies for sums of squares and products
  for (let firstDimension = 1; firstDimension <= 200; firstDimension++) {
    for (let secondDimension = 1; secondDimension <= 200; secondDimension++) {
      for (let thirdDimension = 1; thirdDimension <= 200; thirdDimension++) {
        const calculatedSum =
          firstDimension * firstDimension +
          secondDimension * secondDimension +
          thirdDimension * thirdDimension +
          firstDimension * secondDimension +
          secondDimension * thirdDimension +
          thirdDimension * firstDimension;

        if (frequencyMap[calculatedSum] === undefined) {
          frequencyMap[calculatedSum] = 0;
        }
        frequencyMap[calculatedSum]++;
      }
    }
  }

  // Populate the final result array based on the computed frequencies
  for (let outputIndex = 0; outputIndex < inputCount; outputIndex++) {
    if (frequencyMap[outputIndex + 1] === undefined) {
      resultContainer[outputIndex] = 0;
    } else {
      resultContainer[outputIndex] = frequencyMap[outputIndex + 1];
    }
  }

  // Output the formatted results, with each entry on a new line
  outputResult(dataTransformer(resultContainer, 9));
}