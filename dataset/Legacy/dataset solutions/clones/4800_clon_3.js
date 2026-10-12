const inputReader = require('readline').createInterface({
  input: process.stdin, output: process.stdout
});

let inputHandlerInstance;
let collectedInputLines = [];

inputReader.on('line', function(lineContent){
  collectedInputLines.push(lineContent);
});

inputReader.on('close', function(){
  inputHandlerInstance = new InputHandler(collectedInputLines);
  console.error('\n');
  const startTime = Date.now();
  solveProblem();
  const endTime = Date.now() - startTime;
  printDebug('time : ' + endTime + 'ms');
  printDebug('memory : ' + Math.round(process.memoryUsage().heapTotal / 1024) + 'KB');
});

function createDeepCopy(sourceObject){
  return (sourceObject instanceof Set) ? new Set(Array.from(sourceObject)) : JSON.parse(JSON.stringify(sourceObject));
}

class InputHandler {
  constructor(lines) {
    this.dataLines = lines;
    this.currentIndex = 0;
    this.totalLines = lines.length;
  }

  hasMoreLines() {
    return this.currentIndex < this.totalLines;
  }

  readNextLine() {
    if (this.hasMoreLines()) {
      return this.dataLines[this.currentIndex++];
    } else {
      throw 'ArrayIndexOutOfBoundsException ‚There is no more input';
    }
  }

  static convertData(data, typeCode) {
    try {
      switch (typeCode) {
        case 1: return parseInt(data, 10);
        case 2: return data.split(' ');
        case 4: return data.split(' ').map(Number);
        case 6: return data.split('');
        case 7: return data.split('').map(Number);
        case 8: return data.join(' ');
        case 9: return data.join('\n');
        case 0: return data.join('');
        default: return data;
      }
    } catch (e) {
      return data;
    }
  }

  readInteger() { return InputHandler.convertData(this.readNextLine(), 1); }
  readStringArray() { return InputHandler.convertData(this.readNextLine(), 2); }
  readIntegerArray() { return InputHandler.convertData(this.readNextLine(), 4); }
  readCharacterArray() { return InputHandler.convertData(this.readNextLine(), 6); }
  readCharacterIntegerArray() { return InputHandler.convertData(this.readNextLine(), 7); }
}

function printOutput(message){
  console.log(message);
}

function printDebug(debugMessage){
  console.error('debug:' + require('util').inspect(debugMessage,false,null));
}

const EMPTY_CELL_VALUE = null;

function initializeGridWithInitialPlacements(dimension, initialPositions, gridCells) {
  for (let idx = 0; idx < dimension; idx++) {
    gridCells[initialPositions[idx] - 1] = idx + 1;
  }
}

function fillGridWithSequentialNumbers(dimension, gridCells) {
  const totalCells = dimension * dimension;
  for (let currentNumber = 2; currentNumber <= dimension; currentNumber++) {
    let requiredSlotsForCurrentNumber = currentNumber - 1;
    for (let cellIdx = 0; cellIdx < totalCells; cellIdx++) {
      if (gridCells[cellIdx] === EMPTY_CELL_VALUE) {
        requiredSlotsForCurrentNumber--;
        gridCells[cellIdx] = currentNumber;
        if (requiredSlotsForCurrentNumber === 0) {
          break;
        }
      } else if (gridCells[cellIdx] === currentNumber) {
        printOutput("No");
        return false;
      }
    }
  }
  return true;
}

function completeGridWithRemainingNumbers(dimension, gridCells) {
  const totalCells = dimension * dimension;
  const countsOfNumbersToPlace = Array.from({ length: dimension }, (_, idx) => dimension - 1 - idx);

  let numberToFill = 1;
  for (let cellIdx = 0; cellIdx < totalCells; cellIdx++) {
    if (gridCells[cellIdx] === EMPTY_CELL_VALUE) {
      gridCells[cellIdx] = numberToFill;
      countsOfNumbersToPlace[0]--;

      if (countsOfNumbersToPlace[0] === 0) {
        countsOfNumbersToPlace.shift();
        numberToFill++;
      }
    }
  }
}

function solveProblem(){
  const gridDimension = inputHandlerInstance.readInteger();
  const initialPlacementIndices = inputHandlerInstance.readIntegerArray();
  const totalCells = gridDimension * gridDimension;
  
  const resultGridCells = new Array(totalCells).fill(EMPTY_CELL_VALUE);

  initializeGridWithInitialPlacements(gridDimension, initialPlacementIndices, resultGridCells);

  const success = fillGridWithSequentialNumbers(gridDimension, resultGridCells);
  if (!success) {
    return;
  }

  completeGridWithRemainingNumbers(gridDimension, resultGridCells);

  printOutput("Yes");
  printOutput(InputHandler.convertData(resultGridCells, 8));
}
