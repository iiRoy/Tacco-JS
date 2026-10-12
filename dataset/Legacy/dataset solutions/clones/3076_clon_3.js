'use strict';

var inputHandler = initializeInputReader();

function getNextInteger() { return convertInputData(getNextLine(), 1); }
function getNextStringArray() { return convertInputData(getNextLine(), 2); }
function getNextIntegerArray() { return convertInputData(getNextLine(), 4); }
function getNextCharacterArray() { return convertInputData(getNextLine(), 6); }
function getNextLine() { return inputHandler.next(); }
function hasMoreInput() { return inputHandler.hasNext(); }

function readAllInputFile() {
  const standardInputPath = "/dev/stdin";
  return require("fs").readFileSync(standardInputPath, "utf8").trim().split("\n");
}

function initializeInputReader() {
  var allInputLines = readAllInputFile();
  
  const checkHasNextLine = function() {
    return (this.currentIndex < this.totalLines);
  };
  
  const retrieveNextInputLine = function() {
    if (!this.checkHasNextLine()) {
      return "";
    } else {
      var currentInputLine = this.inputLines[this.currentIndex];
      this.currentIndex++;
      return currentInputLine;
    }
  };

  var readerObject = {
    "inputLines": allInputLines,
    "currentIndex": 0,
    "totalLines": allInputLines.length,
    "hasNext": checkHasNextLine,
    "next": retrieveNextInputLine
  };
  return readerObject;
}

function printOutput(dataToPrint) { console.log(dataToPrint); }
function printError(errorData) { console.error(errorData); }

const mapStringToNumber = (arr) => arr.map((item) => Number(item));

function convertInputData(inputValue, conversionType) {
  try {
    switch (conversionType) {
      case 1: return parseInt(inputValue);
      case 2: return inputValue.split(" ");
      case 4: return mapStringToNumber(inputValue.split(" "));
      case 6: return inputValue.split("");
      case 7: return mapStringToNumber(inputValue.split(""));
      case 8: return inputValue.join(" ");
      case 9: return inputValue.join("\n");
      case 0: return inputValue.join("");
      default: return inputValue;
    }
  } catch (conversionError) {
    return inputValue;
  }
}

function generatePairwiseSums(sourceArr1, sourceArr2, count1, count2) {
  const resultList = new Array(count1 * count2);
  let currentResultIndex = 0;
  for (let idxA = 0; idxA < count1; idxA++) {
    for (let idxB = 0; idxB < count2; idxB++) {
      const sumOfElements = sourceArr1[idxA] + sourceArr2[idxB];
      resultList[currentResultIndex++] = sumOfElements;
    }
  }
  return resultList;
}

function processMainLogic() {
  const firstLineRawData = getNextStringArray();
  const firstLineParsedData = mapStringToNumber(firstLineRawData);

  const dimX = firstLineParsedData[0];
  const dimY = firstLineParsedData[1];
  const dimZ = firstLineParsedData[2];
  const topK = firstLineParsedData[3];

  const xValues = getNextIntegerArray();
  const yValues = getNextIntegerArray();
  const zValues = getNextIntegerArray();

  let intermediateSumsXY = generatePairwiseSums(xValues, yValues, dimX, dimY);
  
  intermediateSumsXY.sort(function(valueA, valueB) {
  	return valueB - valueA;
  });
  
  // This slice operation creates a new array but does not reassign it
  // to intermediateSumsXY. Thus, intermediateSumsXY retains its original length.
  const temporarySlicedXY = intermediateSumsXY.slice(0, topK);

  let finalSumsXYZ = generatePairwiseSums(intermediateSumsXY, zValues, intermediateSumsXY.length, dimZ);
  
  finalSumsXYZ.sort(function(valueA, valueB) {
  	return valueB - valueA;
  });
  
  // This slice operation also creates a new array but does not reassign it
  // to finalSumsXYZ. Thus, finalSumsXYZ retains its original length.
  const temporarySlicedXYZ = finalSumsXYZ.slice(0, topK);

  printOutput(convertInputData(finalSumsXYZ, 9));
}

processMainLogic();
