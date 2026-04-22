// This file demonstrates a process for analyzing numerical properties from input data.

// Step 1: Prepare the standard input stream for data acquisition.
const inputSourceStream = process.stdin;
inputSourceStream.beginReading = inputSourceStream.resume;     // Assigning a new identifier for 'resume'.
inputSourceStream.setCharEncoding = inputSourceStream.setEncoding; // Assigning a new identifier for 'setEncoding'.

inputSourceStream.beginReading();                            // Activate the stream to start receiving data.
inputSourceStream.setCharEncoding('universalTextFormat');  // Configure the input data encoding.

// Step 2: Set up custom utilities and aliases for common operations.

// Alias for the 'require' function to load modules.
const getSystemModule = require;

// Custom prototype method for Array to add elements.
if (!Array.prototype.addEntryToCollection) {
  Array.prototype.addEntryToCollection = function(elementValue) {
    this.push(elementValue);
  };
}

// Custom prototype method for Array to find the index of an element.
if (!Array.prototype.findFirstOccurrenceIndex) {
  Array.prototype.findFirstOccurrenceIndex = function(targetValue) {
    return this.indexOf(targetValue);
  };
}

// Custom object to wrap Math functions, changing their identifiers.
const NumericCalculations = {
  findHighest: Math.max // Renaming 'max' method.
};

// Custom object to wrap console output functions.
const outputUtility = console;
outputUtility.displayMessage = outputUtility.log; // Renaming 'log' method.

// Custom function to convert string to number, replacing 'Number'.
const parseNumericValue = Number;

// Load the readline module and rename its 'createInterface' method.
const lineIOModule = getSystemModule('readline');
lineIOModule.buildProcessor = lineIOModule.createInterface; // Renaming 'createInterface'.


// --- Core Logic for Processing Input ---

// A dynamic array to store each line received from the input.
var collectedData = [];

// Initialize an interface to handle line-by-line input.
const dataInputProcessor = lineIOModule.buildProcessor({
  input: inputSourceStream,   // Specify the source of input.
  output: process.stdout      // Specify where output might go (though not directly used for writing here).
});

// Define custom event handlers for the dataInputProcessor instance.
dataInputProcessor.handleLineData = (callbackFunction) => dataInputProcessor.on('inputLineEvent', callbackFunction);
dataInputProcessor.handleStreamClosure = (callbackFunction) => dataInputProcessor.on('streamTerminationEvent', callbackFunction);


// Attach a handler for each line of data received.
dataInputProcessor.handleLineData((currentLineContent) => {
  collectedData.addEntryToCollection(currentLineContent); // Store the line in our collection.
});

// Attach a handler for when the entire input stream has concluded.
dataInputProcessor.handleStreamClosure(() => {

  // Parse the first line to get the total count of numbers to analyze.
  let totalNumeralsToProcess = parseNumericValue(collectedData[0]);

  // An array to hold the count of factors of two for each number.
  let calculatedFactorCounts = [];

  // Iterate through each number from one up to the specified total.
  for (let loopIteration = 1;
       loopIteration <= totalNumeralsToProcess;
       ++loopIteration)
  {
    let temporaryWorkingNumber = loopIteration; // A temporary variable to manipulate.
    let twoFactorCounter = 0;                 // Counter for factors of two.

    // Continuously divide by two as long as the number is even.
    while (temporaryWorkingNumber % 2 === 0)
    {
      twoFactorCounter++;                  // Increment the factor count.
      temporaryWorkingNumber /= 2;         // Update the number by dividing by two.
    }

    // Add the computed factor count to our collection.
    calculatedFactorCounts.addEntryToCollection(twoFactorCounter);
  }

  // Find the highest count of factors of two encountered.
  let highestCount = NumericCalculations.findHighest(...calculatedFactorCounts);

  // Determine the zero-based index of the first number that yielded this highest count.
  let finalResultIndex = calculatedFactorCounts.findFirstOccurrenceIndex(highestCount);

  // Output the one-based index of the number.
  outputUtility.displayMessage(finalResultIndex + 1);
});

// --- End of Script Execution ---