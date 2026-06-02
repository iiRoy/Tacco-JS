//Don't have to see. start------------------------------------------
var inputInterface = require('readline').createInterface({
  input: process.stdin, output: process.stdout
});
var inputProcessor;
var bufferedInputLines = [];

inputInterface.on('line', function(inputLine){
  bufferedInputLines.push(inputLine);
});

inputInterface.on('close', function(){
  inputProcessor = createInputProcessor(bufferedInputLines);
  console.error('\n↑入力 ↓出力');
  executeProblemSolver();
});

function deepCloneObject(originalObject){
  return (originalObject instanceof Set) ? new Set(Array.from(originalObject)) : JSON.parse(JSON.stringify(originalObject));
}

function readInteger(){ return parseAndConvertInput(getNextToken(), 1); }
function readStringArray(){ return parseAndConvertInput(getNextToken(), 2); }
function readIntegerArray(){ return parseAndConvertInput(getNextToken(), 4); }
function readCharacterArray(){ return parseAndConvertInput(getNextToken(), 6); }

function getNextToken(){ return inputProcessor.getNext(); }
function hasMoreTokens(){ return inputProcessor.hasMore(); }

function createInputProcessor(linesArray){
  let currentLineIndex = 0;
  const totalLines = linesArray.length;

  return {
    hasMore : function(){
      return (currentLineIndex < totalLines);
    },
    getNext : function(){
      if(this.hasMore()){
        return linesArray[currentLineIndex++];
      } else {
        // Preserving the exact original error string
        throw 'ArrayIndexOutOfBoundsException ‚There is no more input';
      }
    }
  };
}

function outputResult(data){ console.log(data); }
function outputDebug(data){ console.error('debug:' + require('util').inspect(data,false,null)); }

// Constants for parseAndConvertInput 'conversionType' parameter
const CONVERT_TO_INT = 1;
const SPLIT_BY_SPACE = 2;
const SPLIT_AND_PARSE_INT = 4;
const SPLIT_BY_CHAR = 6;
const SPLIT_BY_CHAR_AND_PARSE_INT = 7;
const JOIN_BY_SPACE = 8;
const JOIN_BY_NEWLINE = 9;
const JOIN_NO_SEPARATOR = 0;

function parseAndConvertInput(inputValue, conversionType){
  try{
    switch(conversionType){
      case CONVERT_TO_INT: return parseInt(inputValue);
      case SPLIT_BY_SPACE: return inputValue.split(' ');
      case SPLIT_AND_PARSE_INT: return inputValue.split(' ').map(Number);
      case SPLIT_BY_CHAR: return inputValue.split('');
      case SPLIT_BY_CHAR_AND_PARSE_INT: return inputValue.split('').map(Number);
      case JOIN_BY_SPACE: return inputValue.join(' '); // Assuming inputValue is an array here
      case JOIN_BY_NEWLINE: return inputValue.join('\n'); // Assuming inputValue is an array here
      case JOIN_NO_SEPARATOR: return inputValue.join(''); // Assuming inputValue is an array here
      default: return inputValue;
    }
  }catch(e){
    // In case of parsing error, return original value as per original behavior
    return inputValue;
  }
}

//Don't have to see. end------------------------------------------

// Helper function for DP state updates
function updateReachableSums(dpTable, row, col, currentSum, valueToApply, maxLimit) {
    const sumPlus = Math.abs(currentSum + valueToApply);
    const sumMinus = Math.abs(currentSum - valueToApply);

    // Only set to true if the sum is within the valid bounds
    if (sumPlus < maxLimit) {
        dpTable[row][col][sumPlus] = true;
    }
    if (sumMinus < maxLimit) {
        dpTable[row][col][sumMinus] = true;
    }
}

function executeProblemSolver(){
  const gridDimensions = readIntegerArray();
  const gridHeight = gridDimensions[0];
  const gridWidth = gridDimensions[1];

  const diffMatrix = new Array(gridHeight);
  for(let rowIndex = 0; rowIndex < gridHeight; rowIndex++){
    diffMatrix[rowIndex] = readIntegerArray();
  }

  // Calculate absolute differences for each cell
  for(let rowIndex = 0; rowIndex < gridHeight; rowIndex++){
    const currentInputRow = readIntegerArray();
    for(let colIndex = 0; colIndex < gridWidth; colIndex++){
      diffMatrix[rowIndex][colIndex] = Math.abs(diffMatrix[rowIndex][colIndex] - currentInputRow[colIndex]);
    }
  }

  const maxPossibleDifferenceSum = 13000; // This value is a constant in the original
  // Initialize the 3D DP table with false
  const reachableDifferenceSums = Array.from({ length: gridHeight + 1 }, () =>
    Array.from({ length: gridWidth + 1 }, () =>
      new Array(maxPossibleDifferenceSum).fill(false)
    )
  );
  
  // Initialize DP for the starting cell (0,0)
  // The value at diffMatrix[0][0] is the initial absolute difference sum
  reachableDifferenceSums[0][0][diffMatrix[0][0]] = true;

  // Iterate through the grid to fill the DP table
  for(let rowIndex = 0; rowIndex < gridHeight; rowIndex++){
    for(let colIndex = 0; colIndex < gridWidth; colIndex++){
      // Skip the initial cell (0,0) as its base state is already handled
      if(rowIndex === 0 && colIndex === 0){
        continue;
      }

      const currentValueAtCell = diffMatrix[rowIndex][colIndex];

      // Propagate states from the cell above (if not in the first row)
      if (rowIndex > 0) {
          for(let currentDiffSum = 0; currentDiffSum < maxPossibleDifferenceSum; currentDiffSum++){
              if(reachableDifferenceSums[rowIndex - 1][colIndex][currentDiffSum]){
                  updateReachableSums(reachableDifferenceSums, rowIndex, colIndex, currentDiffSum, currentValueAtCell, maxPossibleDifferenceSum);
              }
          }
      }

      // Propagate states from the cell to the left (if not in the first column)
      if (colIndex > 0) {
          for(let currentDiffSum = 0; currentDiffSum < maxPossibleDifferenceSum; currentDiffSum++){
              if(reachableDifferenceSums[rowIndex][colIndex - 1][currentDiffSum]){
                  updateReachableSums(reachableDifferenceSums, rowIndex, colIndex, currentDiffSum, currentValueAtCell, maxPossibleDifferenceSum);
              }
          }
      }
    }
  }

  // After filling the DP table, find the minimum absolute difference sum
  // that is reachable at the bottom-right cell (gridHeight-1, gridWidth-1)
  for(let finalSumCandidate = 0; finalSumCandidate < maxPossibleDifferenceSum; finalSumCandidate++){
    if(reachableDifferenceSums[gridHeight - 1][gridWidth - 1][finalSumCandidate]){
      outputResult(finalSumCandidate);
      return; // Found the smallest possible sum, exit
    }
  }
}
