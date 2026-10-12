const inputLineReader = require('readline').createInterface({
  input: process.stdin, output: process.stdout
});

let inputDataHandler;
const bufferedInputLines = [];

inputLineReader.on('line', function(lineContent){
  bufferedInputLines.push(lineContent);
});

inputLineReader.on('close', function(){
  inputDataHandler = createInputDataHandler(bufferedInputLines);
  console.error('\n');
  const startTime = Date.now();
  executeMainLogic();
  const endTime = Date.now() - startTime;
  const KILOBYTE_CONVERSION_FACTOR = 1024;
  logDebugMessage('time : ' + endTime + 'ms');
  logDebugMessage('memory : ' + Math.round(process.memoryUsage().heapTotal / KILOBYTE_CONVERSION_FACTOR) + 'KB');
});

function createDeepClone(sourceObject){
  return (sourceObject instanceof Set) ? new Set(Array.from(sourceObject)) : JSON.parse(JSON.stringify(sourceObject));
}

function readInt(){ return processInputConversion(getNextLine(), 1); }
function readStrArray(){ return processInputConversion(getNextLine(), 2); }
function readIntArray(){ return processInputConversion(getNextLine(), 4); }
function readCharArray(){ return processInputConversion(getNextLine(), 6); }

function getNextLine(){ return inputDataHandler.getNext(); }
function hasMoreLines(){ return inputDataHandler.hasMore(); }

function createInputDataHandler(linesArray){  
  let currentLineIndex = 0;
  const totalLines = linesArray.length;

  return {
    hasMore : function(){ return (currentLineIndex < totalLines); },
    getNext : function(){
      if(this.hasMore()){
        return linesArray[currentLineIndex++];
      } else {
        throw 'ArrayIndexOutOfBoundsException: No more input lines available.';
      }
    }
  };
}

function printOutputLine(content){ console.log(content); }
function logDebugMessage(message){ console.error('debug:' + require('util').inspect(message, false, null)); }

// param "conversionType" is
// 1: parseInt.
// 2: split space.
// 4: split space and parseInt.
// 6: split 1 character.
// 7: split 1 character and parseInt.
// 8: join space.
// 9: join newline.
// 0: join no character.
function processInputConversion(inputItem, conversionType){
  try {
    switch(conversionType){
      case 1: return parseInt(inputItem);
      case 2: return inputItem.split(' ');
      case 4: return inputItem.split(' ').map(Number);
      case 6: return inputItem.split('');
      case 7: return inputItem.split('').map(Number);
      case 8: return inputItem.join(' ');
      case 9: return inputItem.join('\n');
      case 0: return inputItem.join('');
      default: return inputItem;
    }
  } catch(e){
    return inputItem;
  }
}

function executeMainLogic(){
  const gridDimension = readInt();
  const initialPlacementIndices = readIntArray();
  const totalGridCells = gridDimension * gridDimension;
  const finalGridState = new Array(totalGridCells).fill(null);

  const attemptCellPlacement = (valueToPlace, cellPosition, grid, remainingCountRef) => {
      if (grid[cellPosition] === null) {
          remainingCountRef.value--;
          grid[cellPosition] = valueToPlace;
          return true;
      } else if (grid[cellPosition] === valueToPlace) {
          printOutputLine("No");
          return false;
      }
      return true;
  };

  for(let i = 0; i < gridDimension; i++){
    const targetIndex = initialPlacementIndices[i] - 1;
    const valueToPlace = i + 1;
    finalGridState[targetIndex] = valueToPlace;
  }

  for(let currentValue = 2; currentValue <= gridDimension; currentValue++){
    const cellsToFillForCurrentValue = currentValue - 1;
    if (cellsToFillForCurrentValue === 0) continue;

    const remainingSlots = { value: cellsToFillForCurrentValue };
    for(let cellPosition = 0; cellPosition < totalGridCells; cellPosition++){
      if (!attemptCellPlacement(currentValue, cellPosition, finalGridState, remainingSlots)) {
        return;
      }
      if (remainingSlots.value === 0){
        break;
      }
    }
  }

  for(let currentValue = 1; currentValue < gridDimension; currentValue++){
    const cellsToFillForCurrentValue = gridDimension - currentValue;
    if (cellsToFillForCurrentValue === 0) continue;

    const remainingSlots = { value: cellsToFillForCurrentValue };
    for(let cellPosition = totalGridCells - 1; cellPosition >= 0; cellPosition--){
      if (!attemptCellPlacement(currentValue, cellPosition, finalGridState, remainingSlots)) {
        return;
      }
      if (remainingSlots.value === 0){
        break;
      }
    }
  }

  for(let cellPosition = 0; cellPosition < totalGridCells; cellPosition++){
    if(finalGridState[cellPosition] === null){
      printOutputLine("No");
      return;
    }
  }

  printOutputLine("Yes");
  printOutputLine(processInputConversion(finalGridState, 8));
}
