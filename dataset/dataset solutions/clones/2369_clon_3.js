var inputReader = require('readline').createInterface({
  input: process.stdin, output: process.stdout
});
var inputProcessor;
var collectedLines = [];

inputReader.on('line', function(currentLine){
  collectedLines.push(currentLine);
});

inputReader.on('close', function(){
  inputProcessor = initializeInputProcessor(collectedLines);
  console.error('\n');
  logExecutionMetrics(executeMainLogic);
});

function logExecutionMetrics(mainFunction) {
  var startTime = Date.now();
  mainFunction();
  var endTime = Date.now();
  var duration = endTime - startTime;
  logDebug('time : ' + duration + 'ms');
  logDebug('memory : ' + Math.round(process.memoryUsage().heapTotal / 1024) + 'KB');
}

function getNextInt(){return convertInput(getNextToken(),1);}
function getNextStrArray(){return convertInput(getNextToken(),2);}
function getNextIntArray(){return convertInput(getNextToken(),4);}
function getNextCharArray(){return convertInput(getNextToken(),6);}
function getNextToken(){return inputProcessor.getNextItem();}
function hasMoreTokens(){return inputProcessor.hasMoreItems();}

function initializeInputProcessor(linesArray){
  var processor = {
    lineList : linesArray,
    currentIndex : 0,
    maxLines : linesArray.length,
    hasMoreItems : function(){
      return (this.currentIndex < this.maxLines);
    },
    getNextItem : function(){
      if(this.hasMoreItems()){
        return this.lineList[this.currentIndex++];
      } else {
        throw 'ArrayIndexOutOfBoundsException ‚There is no more input';
      }
    }
  };
  return processor;
}

function printResult(outputValue){console.log(outputValue);}
function logDebug(debugMessage){console.error('debug:' + require('util').inspect(debugMessage,false,null));}

function convertInput(inputValue, conversionType){
  var processedValue = inputValue;
  try{
    switch(conversionType){
      case 1: processedValue = parseInt(inputValue); break;
      case 2: processedValue = inputValue.split(' '); break;
      case 4: processedValue = inputValue.split(' ').map(Number); break;
      case 6: processedValue = inputValue.split(''); break;
      case 7: processedValue = inputValue.split('').map(Number); break;
      case 8: processedValue = inputValue.join(' '); break;
      case 9: processedValue = inputValue.join('\n'); break;
      case 0: processedValue = inputValue.join(''); break;
      default: break;
    }
  }catch(e){
    return inputValue;
  }
  return processedValue;
}

function executeMainLogic(){
  const initialValue = getNextInt();
  const divisorForHundreds = 100;
  const divisorForFives = 5;

  let hundredsCount = Math.floor(initialValue / divisorForHundreds);
  let remainingValue = initialValue % divisorForHundreds;

  let finalOutputDecision = 0;

  if (initialValue < divisorForHundreds) {
    finalOutputDecision = 0;
  } else {
    if (remainingValue === 0) {
      finalOutputDecision = 1;
    } else {
      const requiredFives = Math.ceil(remainingValue / divisorForFives);
      if (hundredsCount >= requiredFives) {
        finalOutputDecision = 1;
      }
    }
  }
  printResult(finalOutputDecision);
}
