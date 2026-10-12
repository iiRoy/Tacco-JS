var inputReader = require('readline').createInterface({
  input: process.stdin, output: process.stdout
});
var inputData; var inputLines = [];
inputReader.on('line', function(lineContent){inputLines.push(lineContent);});
inputReader.on('close', function(){
  inputData = initializeInputHandler(inputLines);
  console.error("\n");
  var startTime = Date.now();
  executeMainLogic();
  var elapsedTime = Date.now() - startTime;
  printDebug("time : " + (elapsedTime) + "ms");
  printDebug("memory : " + Math.round(process.memoryUsage().heapTotal / 1024) + "KB");
});

// Removed makeClone as it was unused and non-essential.

function InputHandler(lines) {
  this.dataList = lines;
  this.currentIndex = 0;
  this.maxIndex = lines.length;

  this.hasMore = function() {
    return (this.currentIndex < this.maxIndex);
  };

  this.retrieveNext = function() {
    if (this.hasMore()) {
      return this.dataList[this.currentIndex++];
    } else {
      throw "ArrayIndexOutOfBoundsException ‚There is no more input";
    }
  };
}

function initializeInputHandler(lines){  
  return new InputHandler(lines);
}

function readInteger(){return convertInput(getNextToken(),1);}
function readStringArray(){return convertInput(getNextToken(),2);}
function readIntegerArray(){return convertInput(getNextToken(),4);}
function readCharacterArray(){return convertInput(getNextToken(),6);}
function getNextToken(){return inputData.retrieveNext();}
function hasMoreTokens(){return inputData.hasMore();}

function printOutput(content){console.log(content);}
function printDebug(content){console.error("debug:" + require("util").inspect(content,false,null));}

function convertInput(inputValue, conversionType){
  const conversionMap = {
    1: (val) => parseInt(val),
    2: (val) => val.split(" "),
    4: (val) => val.split(" ").map(Number),
    6: (val) => val.split(""),
    7: (val) => val.split("").map(Number),
    8: (val) => val.join(" "),
    9: (val) => val.join("\n"),
    0: (val) => val.join(""),
  };

  try {
    const converter = conversionMap[conversionType];
    if (converter) {
      return converter(inputValue);
    } else {
      return inputValue;
    }
  } catch(e) {
    return inputValue;
  }
}

function findTriangularRoot(targetValue) {
  let currentCandidate = 0;
  while (true) {
    const currentSum = (currentCandidate * (currentCandidate + 1)) * 0.5;
    if (currentSum === targetValue) {
      return currentCandidate;
    }
    if (currentSum > targetValue) {
      return -1; // Not a triangular number
    }
    currentCandidate++;
  }
}

function createAndPopulateMatrix(size) {
  const matrix = Array.from({ length: size + 1 }, () => Array(size).fill(0));
  let elementValue = 1;
  for (let rowIdx = 0; rowIdx < size; rowIdx++) {
    for (let colIdx = rowIdx; colIdx < size; colIdx++) {
      matrix[rowIdx][colIdx] = elementValue;
      matrix[colIdx + 1][rowIdx] = elementValue;
      elementValue++;
    }
  }
  return matrix;
}

function formatMatrixRowsForOutput(matrix, prefixValue) {
  const formattedRows = [];
  for (let rowIdx = 0; rowIdx < matrix.length; rowIdx++) {
    const currentRow = matrix[rowIdx];
    const rowWithPrefix = [prefixValue, ...currentRow];
    formattedRows.push(rowWithPrefix.join(" "));
  }
  return formattedRows;
}

function executeMainLogic(){
  var targetNumber = readInteger();
  var triangularRoot = findTriangularRoot(targetNumber);

  if (triangularRoot === -1) {
    printOutput("No");
    return;
  }
  
  printOutput("Yes");
  var checkValue = triangularRoot;
  
  var resultMatrix = createAndPopulateMatrix(checkValue);
  
  printDebug(resultMatrix);
  printOutput(resultMatrix.length);
  
  var finalOutputLines = formatMatrixRowsForOutput(resultMatrix, checkValue);
  printOutput(convertInput(finalOutputLines, 9));
}
