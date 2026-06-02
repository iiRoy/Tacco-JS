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

function retrieveInteger(){ return convertInput(getNextItem(), 1); }
function retrieveStringArray(){ return convertInput(getNextItem(), 2); }
function retrieveIntegerArray(){ return convertInput(getNextItem(), 4); }
function retrieveCharacterArray(){ return convertInput(getNextItem(), 6); }

function getNextItem(){ return dataHandler.fetchNext(); }
function hasMoreItems(){ return dataHandler.checkAvailability(); }

function initializeInputProcessor(incomingLines){
  return {
    dataCollection : incomingLines,
    currentPosition : 0,
    maximumCount : incomingLines.length,
    checkAvailability : function(){
      return (this.currentPosition < this.maximumCount);
    },
    fetchNext : function(){
      if(this.checkAvailability()){
        return this.dataCollection[this.currentPosition++];
      } else {
        throw 'ArrayIndexOutOfBoundsException ‚There is no more input';
      }
    }
  };
}

function outputResult(content){
  console.log(content);
}

function outputDebug(debugContent){
  console.error('debug:' + require('util').inspect(debugContent, false, null));
}

function convertInput(inputVal, conversionType){
  try {
    switch(conversionType){
      case 1: return parseInt(inputVal);
      case 2: return inputVal.split(' ');
      case 4: return inputVal.split(' ').map(Number);
      case 6: return inputVal.split('');
      case 7: return inputVal.split('').map(Number);
      case 8: return inputVal.join(' ');
      case 9: return inputVal.join('\n');
      case 0: return inputVal.join('');
      default: return inputVal;
    }
  } catch(error) {
    return inputVal;
  }
}

function executeMainLogic(){
  var firstLineData = retrieveIntegerArray();
  var countElements = firstLineData[0];
  var valueZ = firstLineData[1];
  var valueW = firstLineData[2];

  var elementList = retrieveIntegerArray();

  if(countElements == 1){
    outputResult(Math.abs(elementList[countElements - 1] - valueW));
  } else {
    outputResult(Math.max(
      Math.abs(elementList[countElements - 2] - elementList[countElements - 1]),
      Math.abs(elementList[countElements - 1] - valueW)
    ));
  }
}
