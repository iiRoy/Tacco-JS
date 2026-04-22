"use strict"; // Enforce strict parsing and error handling for cleaner code.

// Defines a utility class for processing sequential data from a string.
function DataStreamProcessor(rawDataString, valueConverter) {
  // Stores the input string broken into individual lines.
  this.parsedLines = rawDataString.split("\n");
  // Tracks the current word position within the active line.
  this.wordPointer = 0;
  // Tracks the index of the currently active line.
  this.linePointer = 0;
  // Sets the default function for converting extracted tokens, defaults to Number.
  this.numberParser = valueConverter || Number;
}

// Prototype method to extract a single data element from the stream.
DataStreamProcessor.prototype.extractDatum = function(specificTransformer) {
  // Retrieve the current line from the parsed input.
  var activeLine = this.parsedLines[this.linePointer];
  // Check if the line is valid (not undefined or empty).
  if (activeLine) {
    // Split the current line into individual words, after trimming whitespace.
    var lineElements = activeLine.trim().split(" ");
    // Get the data element at the current word pointer.
    var currentDatum = lineElements[this.wordPointer];
    // Advance the word pointer for the next extraction.
    this.wordPointer++;
    // If all words on the current line have been processed, reset word pointer and advance to the next line.
    if (lineElements.length === this.wordPointer) {
      this.wordPointer = 0;
      this.linePointer++;
    }
    // Apply the provided transformer function, or the default number parser.
    return specificTransformer ? specificTransformer(currentDatum) : this.numberParser(currentDatum);
  }
};

// Prototype method to parse all elements on the current line.
DataStreamProcessor.prototype.parseLine = function(elementProcessor) {
  // Get the string content of the current line.
  var activeLineString = this.parsedLines[this.linePointer];
  // If the line exists, process it.
  if (activeLineString) {
    // Reset the word pointer as we're processing a whole new line.
    this.wordPointer = 0;
    // Advance to the next line after processing the current one.
    this.linePointer++;
    // Split the line by spaces and map each element using the provided or default processor.
    return activeLineString.split(" ").map(elementProcessor || this.numberParser);
  }
};

// Export the data stream processing utility.
module.exports = DataStreamProcessor;

/**
 * Main execution function to process the input payload and generate output.
 * @param {string} rawInputPayload - The entire input string from the source.
 */
function executeSolution(rawInputPayload) {
  // Create an instance of the data processor with the raw input.
  var inputReader = new DataStreamProcessor(rawInputPayload);

  // Extract the first numeric parameter.
  var primaryParameter = inputReader.extractDatum();
  // Extract the second numeric control value.
  var secondaryFlag = inputReader.extractDatum();

  // Check the condition based on the secondary control value.
  if (secondaryFlag === 0) {
    // Initialize an array to store the generated sequence.
    var outputCollection = [];
    // Calculate the upper bound for the sequence generation.
    var sequenceLimit = Math.pow(2, primaryParameter);

    // Populate the collection with increasing numbers.
    for (var counterVariable = 0; counterVariable < sequenceLimit; counterVariable++) {
      outputCollection.push(counterVariable);
    }

    // Populate the collection with decreasing numbers, mirroring the first part.
    for (var counterVariable = sequenceLimit - 1; counterVariable >= 0; counterVariable--) {
      outputCollection.push(counterVariable);
    }

    // Output the generated sequence joined by spaces.
    console.log(outputCollection.join(" "));
  } else {
    // If the condition is not met, output the error indicator.
    console.log("-1");
  }
}

// Invoke the main solution function, reading input from standard input.
executeSolution(require("fs").readFileSync("/dev/stdin", "utf8"));