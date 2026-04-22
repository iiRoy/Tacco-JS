let inputReader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

let dataProcessor;
let receivedLines = [];

inputReader.on('line', function(currentLine) {
  receivedLines.push(currentLine);
});

inputReader.on('close', function() {
  dataProcessor = initializeProcessor(receivedLines);
  console.error(" ");

  let commencementTime = Date.now();
  executePrimaryLogic();
  let elapsedDuration = Date.now() - commencementTime;

  reportDiagnostic("duration : " + (elapsedDuration) + "ms");
  reportDiagnostic("memory : " + Math.round(process.memoryUsage().heapTotal / 1024) + "KB");
});

function deepCopyObject(sourceObj) {
  return JSON.parse(JSON.stringify(sourceObj));
}

function retrieveNextInteger() {
  return transformValue(getNextItem(), 1);
}

function retrieveNextStringArray() {
  return transformValue(getNextItem(), 2);
}

function retrieveNextIntegerArray() {
  return transformValue(getNextItem(), 4);
}

function retrieveNextCharacterArray() {
  return transformValue(getNextItem(), 6);
}

function getNextItem() {
  return dataProcessor.retrieve();
}

function hasMoreItems() {
  return dataProcessor.peekNext();
}

function initializeProcessor(inputData) {
  let processedObject = {
    dataLines: inputData,
    currentPosition: 0,
    maximumLength: inputData.length,
    peekNext: function() {
      return (this.currentPosition < this.maximumLength);
    },
    retrieve: function() {
      if (!this.peekNext()) {
        throw "InputDataExhaustedException ‚No further input available";
      }
      let extractedEntry = this.dataLines[this.currentPosition++];
      return extractedEntry;
    }
  };
  return processedObject;
}

function displayOutput(content) {
  console.log(content);
}

function reportDiagnostic(message) {
  console.error("debug_info:" + require("util").inspect(message, false, null));
}

// The 'conversionType' parameter indicates:
// unknown or default: returns input as is.
// 1: parses to integer.
// 2: splits by space.
// 4: splits by space and maps to numbers.
// 6: splits by character.
// 7: splits by character and maps to numbers.
// 8: joins array elements with space.
// 9: joins array elements with newline.
// 0: joins array elements without separator.
function transformValue(inputValue, conversionType) {
  try {
    switch (conversionType) {
      case 1:
        return parseInt(inputValue);
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
    return inputValue;
  }
}

function executePrimaryLogic() {
  let totalElements = retrieveNextInteger();
  let inputSequence = retrieveNextIntegerArray();

  let cumulativeResult = 0;
  let leftPointer = 0;
  let rightPointer = 0;
  let currentXORSum = inputSequence[0];

  while (leftPointer < totalElements || rightPointer < totalElements) {
    // Advance the right boundary as long as the condition (sum == XOR sum) holds.
    // The cumulative result increases by the distance between boundaries.
    // If the condition becomes false:
    // Add the accumulated distance between the pointers to the result.
    // Advance the left boundary. Repeat the process.
    // reportDiagnostic("current XOR state: " + currentXORSum);
    // reportDiagnostic({leftPointer, rightPointer});

    if ((currentXORSum + inputSequence[rightPointer + 1]) == (currentXORSum ^ inputSequence[rightPointer + 1])) {
      // reportDiagnostic("Condition met.");
      // reportDiagnostic(rightPointer - leftPointer + 1);
      cumulativeResult += rightPointer - leftPointer + 1;
      rightPointer++;
      currentXORSum += inputSequence[rightPointer];
    } else {
      // reportDiagnostic("Condition failed.");
      // cumulativeResult += 1; // This line seems commented out in the original, keeping it so.
      currentXORSum -= inputSequence[leftPointer];
      leftPointer++;

      if (rightPointer < leftPointer) {
        rightPointer = leftPointer;
        currentXORSum = inputSequence[rightPointer];
      }
    }
    // reportDiagnostic("next XOR state: " + currentXORSum);
    // reportDiagnostic({leftPointer, rightPointer});
  }
  displayOutput(cumulativeResult + totalElements);
}