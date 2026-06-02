'use strict';
// This script processes text based on a series of commands provided via standard input.
(function(inputData) {
  // Split the entire input string into an array of lines.
  var inputLines = inputData.toString().split('\n');

  // Define a constructor for handling text operations.
  var TextProcessor = function(initialString) {
    this.currentText = initialString; // The string currently being manipulated.
    this.outputBuffer = [];           // Buffer to store results of 'print' operations.
  };

  // Add a method to the TextProcessor prototype for executing various operations.
  TextProcessor.prototype.executeOperation = function(operationName, rangeIndices, operationOption) {
    var processorInstance = this; // Capture 'this' for use within nested functions.

    // Define a collection of available text manipulation operations.
    var availableOperations = {
      // 'displaySegment' operation: Extracts a substring and adds it to the output buffer.
      displaySegment : function(range) {
        processorInstance.outputBuffer.push(processorInstance.currentText.slice(range[0], range[1] + 1));
      },
      // 'invertSegment' operation: Reverses a specified segment of the text.
      invertSegment : function(range) {
        var characterArray = processorInstance.currentText.split('');
        var invertedSegment = characterArray.slice(range[0], range[1] + 1).reverse().join('');
        // Use the 'substituteSegment' helper to perform the actual replacement.
        this.substituteSegment(range, invertedSegment);
      },
      // 'substituteSegment' operation: Replaces a segment of the text with a new string.
      substituteSegment : function(range, replacementValue) {
        var characterArray = processorInstance.currentText.split('');
        // Splice modifies the array in place, then join back to a string.
        characterArray.splice(range[0], range[1] - range[0] + 1, replacementValue);
        processorInstance.currentText = characterArray.join('');
      }
    };
    // Execute the requested operation using the provided arguments.
    availableOperations[operationName](rangeIndices, operationOption);
  };

  // Add a method to the TextProcessor prototype to get the final buffered output.
  TextProcessor.prototype.getProcessedOutput = function(){
    return this.outputBuffer.join('\n'); // Join all buffered segments with newlines.
  };

  // Main execution block:
  // This immediately-invoked function expression (IIFE) processes the input.
  var finalResult = (function(initialSource, operationList) {
    // Create a new TextProcessor instance with the initial source string.
    var textHandler = new TextProcessor(initialSource);

    // Iterate over each operation in the list and execute it.
    operationList.forEach(function(currentOperation) {
      // The first element is the operation name, next two are indices (converted to numbers),
      // and the last is an optional argument.
      textHandler.executeOperation(
        currentOperation[0],
        currentOperation.slice(1, 3).map(Number),
        currentOperation[3]
      );
    });
    // Return the accumulated output from the text handler.
    return textHandler.getProcessedOutput();
  }(
    inputLines.shift(), // The first line is the initial text string.
    // The remaining lines define the operations.
    // The second line indicates the number of operations, then subsequent lines are the operations themselves.
    inputLines.slice(0, inputLines.shift()).map(function(lineData){
      return lineData.split(' '); // Split each operation line into parts.
    })
  ));

  // Output the final result to the console.
  console.log(finalResult);

// Read standard input using Node.js 'fs' module.
}(require('fs').readFileSync('/dev/stdin', 'utf8')));
