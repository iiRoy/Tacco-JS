var inputReader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

var dataHandler;
var inputLines = [];

inputReader.on('line', function(currentLine){
  inputLines.push(currentLine);
});

inputReader.on('close', function(){
  dataHandler = initializeInputProcessor(inputLines);
  console.error('\n↑入力 ↓出力');
  executeMainLogic();
});

function createDeepCopy(originalObject){
  return (originalObject instanceof Set)
    ? new Set(Array.from(originalObject))
    : JSON.parse(JSON.stringify(originalObject));
}

function getNextInteger(){ return convertInput(fetchNextItem(), 1); }
function getNextStringArray(){ return convertInput(fetchNextItem(), 2); }
function getNextIntegerArray(){ return convertInput(fetchNextItem(), 4); }
function getNextCharacterArray(){ return convertInput(fetchNextItem(), 6); }

function fetchNextItem(){ return dataHandler.next(); }
function hasMoreItems(){ return dataHandler.hasNext(); }

function initializeInputProcessor(rawInputData){
  return {
    dataList : rawInputData,
    currentIndex : 0,
    maximumIndex : rawInputData.length,

    hasNext : function(){
      return (this.currentIndex < this.maximumIndex);
    },

    next : function(){
      if(this.hasNext()){
        return this.dataList[this.currentIndex++];
      } else {
        throw 'ArrayIndexOutOfBoundsException ‚There is no more input';
      }
    }
  };
}

function outputResult(outputString){
  console.log(outputString);
}

function logDebugMessage(debugContent){
  console.error('debug:' + require('util').inspect(debugContent, false, null));
}

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
  } catch(errorObject){
    return inputValue;
  }
}

function executeMainLogic(){
  var targetSum = getNextInteger();
  var dynamicProgrammingArray = new Array(2001).fill(0);
  var moduloValue = 1000000007;

  for(var currentSum = 3; currentSum <= targetSum; currentSum++){
    dynamicProgrammingArray[currentSum]++;
    for(var previousSum = 3; previousSum <= currentSum - 3; previousSum++){
      dynamicProgrammingArray[currentSum] += dynamicProgrammingArray[previousSum];
      dynamicProgrammingArray[currentSum] %= moduloValue;
    }
  }
  outputResult(dynamicProgrammingArray[targetSum]);
}
