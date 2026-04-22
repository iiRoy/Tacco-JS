"use strict";
var DATA_PARSER=(function( ){
  function createReaderInstance(sourceInputText){
    return new InputContentProcessor(sourceInputText);
  }
  function InputContentProcessor(sourceInputText){
    this.inputLineCollection = sourceInputText.trim( ).split("\n");
    this.currentLineNumber = 0;
  }
  InputContentProcessor.prototype.fetchNextValue=function(returnAsString){
    var lineData = this.inputLineCollection,
        lineNumber = this.currentLineNumber,
        extractedElement;
    if (typeof lineData[lineNumber] === "string") {
      lineData[lineNumber] = lineData[lineNumber].split(" ").reverse();
    }
    extractedElement = lineData[lineNumber].pop();
    if (!lineData[lineNumber].length) {
      this.currentLineNumber++;
    }
    return returnAsString ? extractedElement : +extractedElement;
  };
  InputContentProcessor.prototype.retrieveLineValues=function(keepStrings){
    var lineFragments = this.inputLineCollection[this.currentLineNumber++].split(" ");
    return keepStrings ? lineFragments : lineFragments.map(itemVal => +itemVal);
  };
  InputContentProcessor.prototype.getMatrixRows=function(rowCount,asStringMatrix){
    var matrixContent = this.inputLineCollection.slice(this.currentLineNumber,this.currentLineNumber+=rowCount).map(rowText => rowText.split(" "));
    return asStringMatrix ? matrixContent : matrixContent.map(row => row.map(cellText => +cellText));
  };
  InputContentProcessor.prototype.extractRawLines=function(linesToRead,preserveText){
    var rawLines = this.inputLineCollection.slice(this.currentLineNumber,this.currentLineNumber+=linesToRead);
    return preserveText ? rawLines : rawLines.map(lineEntry => +lineEntry);
  };
  return createReaderInstance;
})( );
var inputDataSource = DATA_PARSER(require("fs").readFileSync("/dev/stdin","utf8"));
function constructMultiDimArray(defaultFiller){
  var dimensionArguments = arguments,
      argumentLength = dimensionArguments.length,
      arrayDefinitionString = "Array(dimensionArguments[" + --argumentLength + "]).fill(0).map(_=>{return " + defaultFiller + ";})";
  while(--argumentLength) {
    arrayDefinitionString = "Array(dimensionArguments[" + argumentLength + "]).fill(0).map(_=>" + arrayDefinitionString + ")";
  }
  return eval(arrayDefinitionString);
}

console.log(executeSolution());

function executeSolution(){
  var elementCount = inputDataSource.fetchNextValue();
  var divisorModulus = inputDataSource.fetchNextValue();
  var valueAdjustments = inputDataSource.retrieveLineValues().map(itemVal => itemVal - 1);
  var cumulativeSums = Array(elementCount + 1);
  cumulativeSums[0] = 0;
  for (var iterationIndex = 0; iterationIndex < elementCount; iterationIndex++) {
    cumulativeSums[iterationIndex + 1] = (cumulativeSums[iterationIndex] + valueAdjustments[iterationIndex]) % divisorModulus;
  }
  var resultAccumulator = 0;
  var remainderFrequency = {};
  for (var iterationIndex = 0; iterationIndex <= elementCount; iterationIndex++) {
    if (divisorModulus <= iterationIndex) {
      remainderFrequency[cumulativeSums[iterationIndex - divisorModulus]]--;
    }
    if (remainderFrequency[cumulativeSums[iterationIndex]]) {
      resultAccumulator += remainderFrequency[cumulativeSums[iterationIndex]]++;
    } else {
      remainderFrequency[cumulativeSums[iterationIndex]] = 1;
    }
  }
  return resultAccumulator;
}