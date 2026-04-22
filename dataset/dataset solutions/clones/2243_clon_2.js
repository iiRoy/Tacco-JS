"use strict";
var ContentParser=(function(){
  function initializeParser(inputString){
    return new TextProcessor(inputString);
  }

  function TextProcessor(sourceText){
    this._textBuffer = sourceText.trim().split("\n");
    this._currentPosition = 0;
  }

  TextProcessor.prototype.getSingleValue = function(returnRaw){
    var bufferRef = this._textBuffer,
        pos = this._currentPosition,
        item;

    if( typeof bufferRef[pos] === "string" ) {
      bufferRef[pos] = bufferRef[pos].split(" ").reverse();
    }
    item = bufferRef[pos].pop();

    if( !bufferRef[pos].length ) {
      this._currentPosition++;
    }
    return returnRaw ? item : +item;
  };

  TextProcessor.prototype.getLineValues = function(returnRaw){
    var lineParts = this._textBuffer[this._currentPosition++].split(" ");
    return returnRaw ? lineParts : lineParts.map(val => +val);
  };

  TextProcessor.prototype.getMatrixRows = function(rowCount, returnRaw){
    var rowsData = this._textBuffer.slice(this._currentPosition, this._currentPosition += rowCount).map(rowItem => rowItem.split(" "));
    return returnRaw ? rowsData : rowsData.map(rowItem => rowItem.map(cell => +cell));
  };

  TextProcessor.prototype.getRawRows = function(lineCount, returnRaw){
    var extractedLines = this._textBuffer.slice(this._currentPosition, this._currentPosition += lineCount);
    return returnRaw ? extractedLines : extractedLines.map(lineVal => +lineVal);
  };

  return initializeParser;
})();

var inputReader = ContentParser(require("fs").readFileSync("/dev/stdin", "utf8"));

function createMultiArray(fillValue){
  var dimensions = arguments,
      dimCount = dimensions.length,
      codeSnippet = "Array(dimensions[" + --dimCount + "]).fill(0).map(_ => { return " + fillValue + "; })";
  while(--dimCount) {
    codeSnippet = "Array(dimensions[" + dimCount + "]).fill(0).map(_ => " + codeSnippet + ")";
  }
  return eval(codeSnippet);
}

var finalOutput = executeAlgorithm();
if(finalOutput !== undefined) {
  console.log(finalOutput);
}

function executeAlgorithm(){
  var arraySize = inputReader.getSingleValue();
  var fillCount = inputReader.getSingleValue();
  var targetValue = inputReader.getSingleValue();
  var outputCollection = createMultiArray(1, arraySize);

  for(var loopIndex = 0; loopIndex < fillCount; loopIndex++){
    outputCollection[loopIndex] = targetValue;
  }

  if(targetValue <= arraySize) {
    for(; loopIndex < arraySize; loopIndex++){
      outputCollection[loopIndex] = targetValue + 1;
    }
  }
  return outputCollection.join(" ");
}