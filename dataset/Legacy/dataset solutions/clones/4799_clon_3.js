var inputReader = require('readline').createInterface({
  input: process.stdin, output: process.stdout
});
var inputHandler;
var inputLines = [];

inputReader.on('line', function(lineData){
  inputLines.push(lineData);
});

inputReader.on('close', function(){
  inputHandler = initializeInputHandler(inputLines);
  console.error('\n');
  var startTime = Date.now();
  solveProblem();
  var endTime = Date.now() - startTime;
  printDebug('time : ' + endTime + 'ms');
  printDebug('memory : ' + Math.round(process.memoryUsage().heapTotal / 1024) + 'KB');
});

function createDeepCopy(originalObject){
  return (originalObject instanceof Set) ? new Set(Array.from(originalObject)) : JSON.parse(JSON.stringify(originalObject));
}

function readInteger(){ return convertInput(getNextToken(), 1); }
function readStringArray(){ return convertInput(getNextToken(), 2); }
function readIntegerArray(){ return convertInput(getNextToken(), 4); }
function readCharacterArray(){ return convertInput(getNextToken(), 6); }

function getNextToken(){ return inputHandler.getNext(); }
function hasMoreTokens(){ return inputHandler.hasMoreTokens(); }

function initializeInputHandler(linesArray){
  return {
    dataList : linesArray,
    currentIndex : 0,
    maxIndex : linesArray.length,
    hasMoreTokens : function(){ return (this.currentIndex < this.maxIndex); },
    getNext : function(){
      if(this.hasMoreTokens()){
        return this.dataList[this.currentIndex++];
      } else {
        throw 'InputOutOfBoundsException: No more input available.';
      }
    }
  };
}

function printOutput(data){ console.log(data); }
function printDebug(data){ console.error('debug_info:' + require('util').inspect(data, false, null)); }

function convertInput(inputValue, conversionType){
  try {
    switch(conversionType){
      case 1: return parseInt(inputValue);
      case 2: return inputValue.split(' ');
      case 4: return inputValue.split(' ').map(Number);
      case 6: return inputValue.split('');
      case 7: return inputValue.split('').map(Number);
      case 8: return inputValue.join(' ');
      case 9: return inputValue.join('\n');
      case 0: return inputValue.join('');
      default: return inputValue;
    }
  } catch(e){
    return inputValue;
  }
}

function solveProblem(){
  const gridSize = readInteger();
  const initialPositions = readIntegerArray();
  const totalCells = gridSize * gridSize;
  const resultGrid = new Array(totalCells).fill(null);

  for (let currentIdx = 0; currentIdx < gridSize; ++currentIdx) {
    const valueToPlace = currentIdx + 1;
    const targetPosition = initialPositions[currentIdx] - 1;
    resultGrid[targetPosition] = valueToPlace;
  }

  for (let fillValue = 2; fillValue <= gridSize; ++fillValue) {
    let cellsToFill = fillValue - 1;
    for (let cellPos = 0; cellPos < totalCells; ++cellPos) {
      if (resultGrid[cellPos] === null) {
        cellsToFill--;
        resultGrid[cellPos] = fillValue;
        if (cellsToFill === 0) {
          break;
        }
      } else if (resultGrid[cellPos] === fillValue) {
        printOutput("No");
        return;
      }
    }
  }

  for (let fillValue = 1; fillValue < gridSize; ++fillValue) {
    let cellsToFill = gridSize - fillValue;
    const startSearchPos = initialPositions[fillValue - 1];
    for (let cellPos = startSearchPos; cellPos < totalCells; ++cellPos) {
      if (resultGrid[cellPos] === null) {
        cellsToFill--;
        resultGrid[cellPos] = fillValue;
        if (cellsToFill === 0) {
          break;
        }
      }
    }
  }

  let hasUnfilledCells = false;
  for (let finalCheckPos = 0; finalCheckPos < totalCells; ++finalCheckPos) {
    if (resultGrid[finalCheckPos] === null) {
      hasUnfilledCells = true;
      break;
    }
  }

  if (hasUnfilledCells) {
    printOutput("No");
  } else {
    printOutput("Yes");
    printOutput(convertInput(resultGrid, 8));
  }
}
