var inputReader = require('readline').createInterface({
  input: process.stdin, output: process.stdout
});
var inputHandler;
var inputLinesBuffer = [];

inputReader.on('line', function(lineContent){
  inputLinesBuffer.push(lineContent);
});

inputReader.on('close', function(){
  inputHandler = createInputProcessor(inputLinesBuffer);
  console.error('\n↑入力 ↓出力');
  executeMainLogic();
});

function readInteger(){return processInputData(getLineFromHandler(),1);}
function readStringArray(){return processInputData(getLineFromHandler(),2);}
function readIntArray(){return processInputData(getLineFromHandler(),4);}
function readCharArray(){return processInputData(getLineFromHandler(),6);}

function getLineFromHandler(){return inputHandler.next();}
function checkMoreInput(){return inputHandler.hasMoreInput();}

function createInputProcessor(linesCollection){  
  var handlerObject = {
    sourceLines : linesCollection,
    currentIndex : 0,
    totalLinesCount : linesCollection.length,
    
    hasMoreInput : function(){
      return (this.currentIndex < this.totalLinesCount);
    },
    next : function(){
      if(this.hasMoreInput()){
        return this.sourceLines[this.currentIndex++];
      } else {
        throw 'ArrayIndexOutOfBoundsException ‚There is no more input';
      }
    }
  };
  return handlerObject;
}

function printResult(outputValue){console.log(outputValue);}
function printDebugMessage(debugContent){console.error('debug:' + require('util').inspect(debugContent,false,null));}

function processInputData(inputValue, conversionType){
  var conversionOperations = {
    1: function(val){return parseInt(val);},
    2: function(val){return val.split(' ');},
    4: function(val){return val.split(' ').map(Number);},
    6: function(val){return val.split('');},
    7: function(val){return val.split('').map(Number);},
    8: function(val){return val.join(' ');},
    9: function(val){return val.join('\n');},
    0: function(val){return val.join('');}
  };

  try {
    var selectedConverter = conversionOperations[conversionType];
    if (selectedConverter) {
      return selectedConverter(inputValue);
    } else {
      return inputValue;
    }
  } catch (processingError) {
    return inputValue;
  }
}

function executeMainLogic(){
  var inputTargetSum = readInteger();
  
  var dpTable = [];
  var tableCapacity = 2001;
  for (var k = 0; k < tableCapacity; k++) {
    dpTable.push(0);
  }

  var currentModulus = 1000000007;

  var performModularAddition = function(currentVal, addVal) {
    var sum = currentVal + addVal;
    return sum % currentModulus;
  };

  for(var currentIteration = 3; currentIteration <= inputTargetSum; currentIteration++){
    dpTable[currentIteration] = performModularAddition(dpTable[currentIteration], 1);
    
    var innerLoopLimit = currentIteration - 3;
    for(var prevIteration = 3; prevIteration <= innerLoopLimit; prevIteration++){
      dpTable[currentIteration] = performModularAddition(dpTable[currentIteration], dpTable[prevIteration]);
    }
  }
  printResult(dpTable[inputTargetSum]);
}
