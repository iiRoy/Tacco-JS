"use strict";

// This class is designed to process text input,
// splitting it into lines and then into segments (words)
// for sequential retrieval.
function DataStream(sourceText, defaultParserFunction) {
  // Store the input text split into an array of lines.
  this._sourceLines = sourceText.split("\n");
  // Index of the current segment within the current line.
  this._currentSegmentIndex = 0;
  // Index of the current line being processed.
  this._currentLineIndex = 0;
  // The default function to parse segments if no custom parser is provided.
  this._defaultParser = defaultParserFunction || Number;
}

// Prototype method to fetch the next individual data segment from the stream.
DataStream.prototype.fetchValue = function (customParser) {
  // Get the content of the current line.
  const currentLineContent = this._sourceLines[this._currentLineIndex];

  // If the current line exists, process it.
  if (currentLineContent) {
    // Trim whitespace and split the line into segments (words).
    const lineSegments = currentLineContent.trim().split(" ");
    // Get the segment at the current segment index.
    const segmentValue = lineSegments[this._currentSegmentIndex];

    // Move to the next segment for the next read operation.
    this._currentSegmentIndex++;

    // If all segments in the current line have been read,
    // reset segment index and move to the next line.
    if (lineSegments.length === this._currentSegmentIndex) {
      this._currentSegmentIndex = 0;
      this._currentLineIndex++;
    }

    // Apply the custom parser if provided, otherwise use the default parser.
    return customParser ? customParser(segmentValue) : this._defaultParser(segmentValue);
  }
};

// Prototype method to fetch all segments of the current line as an array.
// This also advances to the next line.
DataStream.prototype.fetchLineArray = function (lineItemParser) {
  // Get the content of the active line.
  const activeLineContent = this._sourceLines[this._currentLineIndex];

  // If the active line exists, process it.
  if (activeLineContent) {
    // Reset segment index as we're reading the whole line.
    this._currentSegmentIndex = 0;
    // Advance to the next line.
    this._currentLineIndex++;

    // Split the line into segments and map them using the provided parser
    // or the default one.
    return activeLineContent.split(" ").map(lineItemParser || this._defaultParser);
  }
};

// Export the DataStream class for use in other modules.
module.exports = DataStream;


// Main function to execute the problem's logic.
function executeSolution(rawDataInput) {
  // Initialize a data processor with the raw input.
  // This will handle reading numbers and other data from the input stream.
  let inputSource = new DataStream(rawDataInput);

  // Read the total number of operations to perform.
  let totalOperationsCount = inputSource.fetchValue();

  // Initialize a cumulative offset variable.
  // This value will be added to the final result.
  let cumulativeOffset = 0;
  // Initialize an array to store elements that need to be sorted.
  let orderedElements = [];

  // Loop through each operation.
  for (let operationIndex = 0; operationIndex < totalOperationsCount; operationIndex++) {

    // Read the type of the current operation.
    let currentOperationType = inputSource.fetchValue();

    // Check if the operation is of type 1 (add element and offset).
    if (currentOperationType === 1) {
      // Read the element value to be added to the sorted list.
      let elementValue = inputSource.fetchValue();
      // Read the offset amount to be added to the cumulative offset.
      let offsetAmount = inputSource.fetchValue();

      // Update the cumulative offset.
      cumulativeOffset += offsetAmount;

      // Add the element to the list.
      orderedElements.push(elementValue);
    }
    // If the operation is not type 1 (it must be type 2 based on problem context).
    else {
      // Sort the elements in ascending order.
      orderedElements.sort((firstItem, secondItem) => firstItem - secondItem);

      // Calculate the median element.
      // For an array with N elements, the median is at index floor((N-1)/2).
      let medianElement = orderedElements[Math.floor((orderedElements.length - 1) / 2)];

      // Calculate the sum of absolute differences from the median,
      // then add the cumulative offset.
      let calculatedResult = orderedElements.map(
        (item) => Math.abs(item - medianElement)
      ).reduce(
        (accumulator, currentValue) => accumulator + currentValue
      ) + cumulativeOffset;

      // Output the median element and the calculated result to the console.
      console.log(medianElement, calculatedResult);
    }
  }
}


// --- Program Entry Point ---
// Read the entire content of standard input synchronously,
// then pass it to the main solution function.
const fileSystemModule = require("fs");
const standardInputPath = "/dev/stdin";
const rawTextContent = fileSystemModule.readFileSync(standardInputPath, "utf8");

executeSolution(rawTextContent);