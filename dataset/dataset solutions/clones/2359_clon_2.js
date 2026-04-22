"use strict";
var INPUT_READER=(function(){function createReaderInstance(inputStringData){return new InputParser(inputStringData);}function InputParser(inputStringData){this._sourceLines=inputStringData.trim().split("\n");this._currentLineIndex=0;}InputParser.prototype.readNumberFromLineEnd=function(returnAsString){var linesArray=this._sourceLines,lineCursor=this._currentLineIndex,extractedValue;if(typeof linesArray[lineCursor]==="string")linesArray[lineCursor]=linesArray[lineCursor].split(" ").reverse();extractedValue=linesArray[lineCursor].pop();if(!linesArray[lineCursor].length)this._currentLineIndex++;return returnAsString?extractedValue:+extractedValue;};InputParser.prototype.readAllNumbersOnLine=function(returnAsString){var currentLineParts=this._sourceLines[this._currentLineIndex++].split(" ");return returnAsString?currentLineParts:currentLineParts.map(element=>+element);};InputParser.prototype.readMatrix=function(numberOfRows,returnAsString){var resultMatrix=this._sourceLines.slice(this._currentLineIndex,this._currentLineIndex+=numberOfRows).map(element=>element.split(" "));return returnAsString?resultMatrix:resultMatrix.map(element=>element.map(nestedElement=>+nestedElement));};InputParser.prototype.readLinesAsNumbers=function(linesToRead,returnAsString){var lineValues=this._sourceLines.slice(this._currentLineIndex,this._currentLineIndex+=linesToRead);return returnAsString?lineValues:lineValues.map(element=>+element);};return createReaderInstance;})();
var dataProcessor=INPUT_READER(require("fs").readFileSync("/dev/stdin","utf8"));
function multiDimArray(initialValueExpression){var argumentList=arguments,lengthCounter=argumentList.length,arrayConstructionString="Array(argumentList["+ --lengthCounter+"]).fill(0).map(_=>{return "+initialValueExpression+";})";while(--lengthCounter)arrayConstructionString="Array(argumentList["+lengthCounter+"]).fill(0).map(_=>"+arrayConstructionString+")";return eval(arrayConstructionString);}

console.log(executeSolution());
function executeSolution(){
  var heightDim = dataProcessor.readNumberFromLineEnd();
  var widthDim = dataProcessor.readNumberFromLineEnd();
  var dynamicProgression = multiDimArray("new Set()",heightDim,widthDim);
  var matrixA = dataProcessor.readMatrix(heightDim);
  var matrixB = dataProcessor.readMatrix(heightDim);
  var diffMatrix = multiDimArray("[]",heightDim,widthDim);
  for(var rowIndex=0;rowIndex<heightDim;rowIndex++){
    for(var colIndex=0;colIndex<widthDim;colIndex++){
      diffMatrix[rowIndex][colIndex]=matrixA[rowIndex][colIndex]-matrixB[rowIndex][colIndex];
    }
  }
  dynamicProgression[0][0].add(Math.abs(diffMatrix[0][0]));
  for(var rowIndex=0;rowIndex<heightDim;rowIndex++){
    for(var colIndex=0;colIndex<widthDim;colIndex++){
      if(rowIndex)for(var prevValue of dynamicProgression[rowIndex-1][colIndex]){
        dynamicProgression[rowIndex][colIndex].add(Math.abs(prevValue+diffMatrix[rowIndex][colIndex]));
        dynamicProgression[rowIndex][colIndex].add(Math.abs(prevValue-diffMatrix[rowIndex][colIndex]));
      }
      if(colIndex)for(var prevValue of dynamicProgression[rowIndex][colIndex-1]){
        dynamicProgression[rowIndex][colIndex].add(Math.abs(prevValue+diffMatrix[rowIndex][colIndex]));
        dynamicProgression[rowIndex][colIndex].add(Math.abs(prevValue-diffMatrix[rowIndex][colIndex]));
      }
    }
  }
  var finalAnswer=1e9;
  for(var valueInSet of dynamicProgression[heightDim-1][widthDim-1]){
    if(valueInSet<finalAnswer)finalAnswer=valueInSet;
  }
  return finalAnswer;
}