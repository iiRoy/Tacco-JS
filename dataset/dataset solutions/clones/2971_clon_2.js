const lineHandler = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});
let inputSource;
const bufferedLines = [];
lineHandler.on('line', function (receivedText) {
  bufferedLines.push(receivedText);
});
lineHandler.on('close', function () {
  inputSource = setupParser(bufferedLines);
  console.error("\n"); // Add some spacing to the error output
  const commenceTime = Date.now();
  performCoreTask();
  const durationMs = Date.now() - commenceTime;
  logDiagnostic(`Execution time: ${durationMs} ms`);
  logDiagnostic(`Memory usage: ${Math.round(process.memoryUsage().heapTotal / 1024)} KB`);
});
function replicateObject(originalItem) {
  return JSON.parse(JSON.stringify(originalItem));
}
function readInteger() { return transformValue(fetchData(), 1); }
function readWordsArray() { return transformValue(fetchData(), 2); }
function readIntegersArray() { return transformValue(fetchData(), 4); }
function readCharactersArray() { return transformValue(fetchData(), 6); }
function fetchData() { return inputSource.grabNext(); }
function checkDataAvailability() { return inputSource.hasMore(); }
function setupParser(sourceInput) {
  // Configures an object for sequential access to input data.
  const parserObject = {
    sourceData: sourceInput,
    currentIdx: 0,
    maxLength: sourceInput.length,
    hasMore: function () {
      return (this.currentIdx < this.maxLength);
    },
    grabNext: function () {
      if (!this.hasMore()) {
        throw new Error("EndOfDataException: No further elements available.");
      } else {
        const extractedData = this.sourceData[this.currentIdx];
        this.currentIdx++;
        return extractedData;
      }
    }
  };
  return parserObject;
}
function displayOutput(messageContent) {
  console.log(messageContent);
}
function logDiagnostic(diagnosticMessage) {
  console.error("DEBUG INFO: " + require("util").inspect(diagnosticMessage, false, null));
}
// This function handles various input data transformations.
// 'operationCode' dictates the type of conversion:
// 1: Convert to integer
// 2: Split by space into string array
// 4: Split by space, convert to number array
// 6: Split by character into string array
// 7: Split by character, convert to number array
// 8: Join array elements with space
// 9: Join array elements with newline
// 0: Join array elements without separator
// Default: Return input as-is (for unknown/unhandled codes)
function transformValue(inputVal, operationCode) {
  try {
    switch (operationCode) {
      case 1:
        return parseInt(inputVal, 10); // Always specify radix for parseInt
      case 2:
        return inputVal.split(" ");
      case 4:
        return inputVal.split(" ").map(Number);
      case 6:
        return inputVal.split("");
      case 7:
        return inputVal.split("").map(Number);
      case 8:
        return inputVal.join(" ");
      case 9:
        return inputVal.join("\n");
      case 0:
        return inputVal.join("");
      default:
        return inputVal;
    }
  } catch (errorDetails) {
    // If conversion fails, return the original value.
    return inputVal;
  }
}

// End of helper utility functions.
function performCoreTask() {
  // Reads the first line of input and parses it into an array of numbers.
  const initialParams = readIntegersArray();
  // Extracts the dimension parameter from the parsed input.
  const paramDimension = initialParams[0];
  // Extracts the excluded element from the parsed input.
  const excludedElement = initialParams[1];

  // Checks if the excluded element is within the valid range for the given dimension.
  if (excludedElement >= 0 && excludedElement < Math.pow(2, paramDimension)) {
    // Special handling for a dimension of 1.
    if (paramDimension === 1) {
      if (excludedElement === 0) {
        displayOutput("0 0 1 1"); // Specific output for M=1, K=0.
      } else {
        displayOutput(-1); // Invalid case for M=1, K!=0.
      }
      return; // Exit the function after handling M=1.
    }

    // Handles the case where the excluded element is 0.
    if (excludedElement === 0) {
      // Creates an array to store the sequence.
      const finalSequence = new Array(Math.pow(2, paramDimension + 1));
      // Populates the sequence with pairs of numbers from 0 to 2^M - 1.
      for (let sequenceIndex = 0; sequenceIndex < Math.pow(2, paramDimension); sequenceIndex++) {
        finalSequence[sequenceIndex * 2] = sequenceIndex;
        finalSequence[sequenceIndex * 2 + 1] = sequenceIndex;
      }
      // Displays the final sequence, joined by spaces.
      displayOutput(transformValue(finalSequence, 8));
    } else {
      // Handles cases where the excluded element is not 0.
      const finalSequence = [excludedElement, 0]; // Start with K and 0.
      // Adds numbers from 1 up to (2^M - 1), skipping the excluded element.
      for (let sequenceIndex = 1; sequenceIndex <= Math.pow(2, paramDimension) - 1; sequenceIndex++) {
        if (sequenceIndex !== excludedElement) {
          finalSequence.push(sequenceIndex);
        }
      }
      finalSequence.push(excludedElement); // Add K again.
      // Adds numbers from (2^M - 1) down to 1, skipping the excluded element.
      for (let sequenceIndex = Math.pow(2, paramDimension) - 1; sequenceIndex > 0; sequenceIndex--) {
        if (sequenceIndex !== excludedElement) {
          finalSequence.push(sequenceIndex);
        }
      }
      finalSequence.push(0); // End with 0.
      // Displays the final sequence, joined by spaces.
      displayOutput(transformValue(finalSequence, 8));
    }
  } else {
    // If the excluded element is outside the valid range, output -1.
    displayOutput(-1);
  }
}