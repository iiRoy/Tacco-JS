'use strict';
(function(inputData) {
  const fs = require('fs');
  var inputLines = inputData.toString().split('\n');

  const parseCommandIndices = (commandArray) => {
    return commandArray.slice(1, 3).map(Number);
  };

  var TextProcessor = function(initialText) {
    this.currentText = initialText;
    this.outputBuffer = [];
  };

  TextProcessor.prototype.handlePrint = function(indices) {
    this.outputBuffer.push(this.currentText.slice(indices[0], indices[1] + 1));
  };

  TextProcessor.prototype.handleReplace = function(indices, replacementValue) {
    var textChars = this.currentText.split('');
    var spliceLength = indices[1] - indices[0] + 1;
    textChars.splice(indices[0], spliceLength, replacementValue);
    this.currentText = textChars.join('');
  };

  TextProcessor.prototype.handleReverse = function(indices) {
    var textChars = this.currentText.split('');
    var segmentToReverse = textChars.slice(indices[0], indices[1] + 1);
    var reversedSegment = segmentToReverse.reverse().join('');
    this.handleReplace(indices, reversedSegment);
  };

  const operationDispatchMap = {
    print: TextProcessor.prototype.handlePrint,
    reverse: TextProcessor.prototype.handleReverse,
    replace: TextProcessor.prototype.handleReplace
  };

  TextProcessor.prototype.executeOperation = function(operationName, rangeIndices, operationArg) {
    operationDispatchMap[operationName].call(this, rangeIndices, operationArg);
  };

  TextProcessor.prototype.getOutput = function() {
    return this.outputBuffer.join('\n');
  };

  var finalOutput = (function(initialSourceText, commandLines) {
    var textProcessor = new TextProcessor(initialSourceText);
    commandLines.forEach(function(currentCommandEntry) {
      const operationIdentifier = currentCommandEntry[0];
      const operationIndices = parseCommandIndices(currentCommandEntry);
      const operationArgument = currentCommandEntry[3];

      textProcessor.executeOperation(
        operationIdentifier,
        operationIndices,
        operationArgument
      );
    });
    return textProcessor.getOutput();
  }(
    inputLines.shift(),
    inputLines.slice(0, inputLines.shift()).map(function(lineStr) { return lineStr.split(' '); })
  ));

  console.log(finalOutput);

}(fs.readFileSync('/dev/stdin', 'utf8')));
