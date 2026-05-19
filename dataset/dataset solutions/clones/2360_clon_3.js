var inputReader = require('readline').createInterface({
  input: process.stdin, output: process.stdout
});
var inputHandler;
var inputLines = [];

inputReader.on('line', function(lineContent){inputLines.push(lineContent);});
inputReader.on('close', function(){
  inputHandler = initializeInputHandler(inputLines);
  console.error('\n↑入力 ↓出力');
  solveProblem();
});

function createDeepCopy(sourceObj){return (sourceObj instanceof Set) ? new Set(Array.from(sourceObj)) : JSON.parse(JSON.stringify(sourceObj));}

function readInt(){return convertInput(getNextInputLine(), 1);}
function readStrArray(){return convertInput(getNextInputLine(), 2);}
function readIntArray(){return convertInput(getNextInputLine(), 4);}
function readCharArray(){return convertInput(getNextInputLine(), 6);}

function getNextInputLine(){return inputHandler.getNextLine();}
function hasMoreInput(){return inputHandler.hasMoreLines();}

function initializeInputHandler(linesArr){  
  let currentIdx = 0;
  const totalLines = linesArr.length;

  return {
    inputData : linesArr,
    currentIndex : currentIdx,
    maxLines : totalLines,
    hasMoreLines : function(){return (this.currentIndex < this.maxLines);},
    getNextLine : function(){
      if(this.hasMoreLines()){
        return this.inputData[this.currentIndex++];
      }else{
        throw 'ArrayIndexOutOfBoundsException – No more input available';
      }
    }
  };
}

function printResult(output){console.log(output);}
function printDebug(debugMsg){console.error('debug:' + require('util').inspect(debugMsg,false,null));}

const conversionMap = new Map([
  [1, (i) => parseInt(i)],
  [2, (i) => i.split(' ')],
  [4, (i) => i.split(' ').map(Number)],
  [6, (i) => i.split('')],
  [7, (i) => i.split('').map(Number)],
  [8, (i) => i.join(' ')],
  [9, (i) => i.join('\n')],
  [0, (i) => i.join('')]
]);

function convertInput(inputVal, conversionType){
  try{
    const converter = conversionMap.get(conversionType);
    if (converter) {
      return converter(inputVal);
    }
    return inputVal;
  }catch(e){
    return inputVal;
  }
}

function solveProblem(){
  const dimensions = readIntArray();
  const heightVal = dimensions[0];
  const widthVal = dimensions[1];

  const maxPossibleDiff = 1272;

  const diffMatrix = new Array(heightVal);
  const dpTable = new Array(heightVal);

  for(let rowIdx = 0; rowIdx < heightVal; rowIdx++){
    diffMatrix[rowIdx] = readIntArray();
    dpTable[rowIdx] = Array.from({ length: widthVal }, () => Array(maxPossibleDiff).fill(false));
  }

  for(let rowIdx = 0; rowIdx < heightVal; rowIdx++){
    const currentLineValues = readIntArray();
    for(let colIdx = 0; colIdx < widthVal; colIdx++){
      diffMatrix[rowIdx][colIdx] = Math.abs(diffMatrix[rowIdx][colIdx] - currentLineValues[colIdx]);
    }
  }
  
  const updateDpStates = (targetRow, targetCol, prevDiff, currentCellValue) => {
    const sumDiff = Math.abs(prevDiff + currentCellValue);
    const subDiff = Math.abs(prevDiff - currentCellValue);
    if (sumDiff < maxPossibleDiff) {
      dpTable[targetRow][targetCol][sumDiff] = true;
    }
    if (subDiff < maxPossibleDiff) {
      dpTable[targetRow][targetCol][subDiff] = true;
    }
  };

  if (diffMatrix[0][0] < maxPossibleDiff) {
    dpTable[0][0][diffMatrix[0][0]] = true;
  }
  
  for(let rowIdx = 0; rowIdx < heightVal; rowIdx++){
    for(let colIdx = 0; colIdx < widthVal; colIdx++){
      if(rowIdx === 0 && colIdx === 0){
        continue;
      }

      const processPreviousCell = (prevR, prevC) => {
        if (prevR >= 0 && prevC >= 0) {
          for(let diffVal = 0; diffVal < maxPossibleDiff; diffVal++){
            if(dpTable[prevR][prevC][diffVal]){
              updateDpStates(rowIdx, colIdx, diffVal, diffMatrix[rowIdx][colIdx]);
            }
          }
        }
      };

      processPreviousCell(rowIdx - 1, colIdx);
      processPreviousCell(rowIdx, colIdx - 1);
    }
  }

  for(let finalDiff = 0; finalDiff < maxPossibleDiff; finalDiff++){
    if(dpTable[heightVal - 1][widthVal - 1][finalDiff]){
      printResult(finalDiff);
      return;
    }
  }
}
