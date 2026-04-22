/*
 * This section handles input setup. It initializes a line-by-line reader
 * and sets up event listeners for incoming data and stream closure.
 */
var dataStream = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});
var parserInstance;

var rawLines = []; // Stores all received input lines
dataStream.on('line', function (currentLine) {
  rawLines.push(currentLine);
});

dataStream.on('close', function () {
  parserInstance = setupInput(rawLines);

  console.error(" \n "); // Print a newline for better console separation
  var executionStart = new Date();

  primaryFunction(); // Execute the main logic of the program

  var elapsedTime = new Date() - executionStart;

  printDiagnostic("Execution duration: " + (elapsedTime) + "ms");
  printDiagnostic("Memory usage: " + Math.round(process.memoryUsage().heapTotal / 1024) + "KB");
});

// Utility function to retrieve the next integer from input
function readInteger() {
  return processInput(readNextElement(), 1);
}

// Utility function to retrieve the next string array from input
function readStringArray() {
  return processInput(readNextElement(), 2);
}

// Utility function to retrieve the next integer array from input
function readIntegerArray() {
  return processInput(readNextElement(), 4);
}

// Utility function to retrieve the next character array from input
function readCharacterArray() {
  return processInput(readNextElement(), 6);
}

// Fetches the next available input item
function readNextElement() {
  return parserInstance.readNextElement();
}

// Checks if there are more input items to process
function isNextAvailable() {
  return parserInstance.isNextAvailable();
}

/**
 * Initializes the input parsing mechanism.
 * @param {Array<string>} sourceLines - An array of raw input lines.
 * @returns {object} An object with methods to access input.
 */
function setupInput(sourceLines) {
  const dataAccessor = {
    storedLines: sourceLines,
    lineIndex: 0,
    totalLines: sourceLines.length,

    // Checks if there are more lines to read
    isNextAvailable: function () {
      return (this.lineIndex < this.totalLines);
    },

    // Retrieves the next line from the stored input
    readNextElement: function () {
      if (!this.isNextAvailable()) {
        throw new Error("InputOutOfBounds: No more elements to retrieve.");
      } else {
        const extractedLine = this.storedLines[this.lineIndex];
        this.lineIndex++;
        return extractedLine;
      }
    }
  };
  return dataAccessor;
}

// Displays a message to standard output
function writeToConsole(textToLog) {
  console.log(textToLog);
}

// Outputs diagnostic messages to standard error
function printDiagnostic(textToLog) {
  console.error("debug output: " + require("util").inspect(textToLog, false, null));
}

/*
 * This function handles various data transformations based on an operation code.
 * It supports converting to integers, splitting strings, joining arrays, etc.
 *
 * Operation codes:
 * 1: Convert to integer
 * 2: Split string by space into string array
 * 4: Split string by space into number array
 * 6: Split string by character into character array
 * 7: Split string by character into number array
 * 8: Join array elements with space
 * 9: Join array elements with newline
 * 0: Join array elements without separator
 * Default: Return item as is
 */
function processInput(itemToProcess, operationCode) {
  try {
    switch (operationCode) {
      case 1:
        return parseInt(itemToProcess);
      case 2:
        return itemToProcess.split(" ");
      case 4:
        return itemToProcess.split(" ").map(Number);
      case 6:
        return itemToProcess.split("");
      case 7:
        return itemToProcess.split("").map(Number);
      case 8:
        return itemToProcess.join(" ");
      case 9:
        return itemToProcess.join("\n");
      case 0:
        return itemToProcess.join("");
      default:
        return itemToProcess;
    }
  } catch (conversionError) {
    return itemToProcess; // In case of error, return original item
  }
}

/*
 * This is the primary function containing the main program logic.
 * It reads a sequence of numbers, determines a median-based value,
 * and outputs a new sequence based on comparisons.
 */
function primaryFunction() {
  var itemQuantity = readInteger();
  var inputArray = readIntegerArray();
  var orderedElements = JSON.parse(JSON.stringify(inputArray)); // Deep copy the input array
  orderedElements.sort(function (valA, valB) {
    return valA - valB;
  });

  printDiagnostic(orderedElements); // Log the sorted array for debugging

  var processedNumbers = new Array(itemQuantity);
  var upperHalfValue = orderedElements[(itemQuantity / 2)];
  var lowerHalfValue = orderedElements[(itemQuantity / 2) - 1];

  printDiagnostic({
    upperHalfValue,
    lowerHalfValue
  }); // Log median values

  for (var iterator = 0; iterator < itemQuantity; iterator++) {
    if (lowerHalfValue === upperHalfValue) {
      processedNumbers[iterator] = upperHalfValue;
    } else {
      if (lowerHalfValue >= inputArray[iterator]) {
        processedNumbers[iterator] = upperHalfValue;
      } else {
        processedNumbers[iterator] = lowerHalfValue;
      }
    }
  }
  writeToConsole(processInput(processedNumbers, 9)); // Output the result, joined by newlines
}