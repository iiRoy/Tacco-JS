var inputReader = require('readline').createInterface({
  input: process.stdin, output: process.stdout
});
var inputProcessor;
var inputLines = [];

inputReader.on('line', function(lineContent){inputLines.push(lineContent);});
inputReader.on('close', function(){
  inputProcessor = initializeInput(inputLines);
  console.error('\n');
  var startTime = Date.now();
  executeMainLogic();
  var endTime = Date.now() - startTime;
  logDebug('time : ' + endTime + 'ms');
  logDebug('memory : ' + Math.round(process.memoryUsage().heapTotal / 1024) + 'KB');
});

function createDeepCopy(originalObject){
  return (originalObject instanceof Set) ? new Set(Array.from(originalObject)) : JSON.parse(JSON.stringify(originalObject));
}

function parseNextInt(){return convertInput(getNextToken(),1);}
function parseNextStrArray(){return convertInput(getNextToken(),2);}
function parseNextIntArray(){return convertInput(getNextToken(),4);}
function parseNextCharArray(){return convertInput(getNextToken(),6);}

function getNextToken(){return inputProcessor.getNextToken();}
function hasMoreTokens(){return inputProcessor.hasMoreTokens();}

function initializeInput(linesArray){
  return {
    dataList : linesArray, currentIdx : 0, maxIdx : linesArray.length,
    hasMoreTokens : function(){return (this.currentIdx < this.maxIdx);},
    getNextToken : function(){
      if(this.hasMoreTokens()){
        return this.dataList[this.currentIdx++];
      }else{
        throw 'InputExhaustedException: No more input available';
      }
    }
  };
}

function printResult(outputValue){console.log(outputValue);}
function logDebug(debugMessage){console.error('debug:' + require('util').inspect(debugMessage,false,null));}

//param "conversionType" is
//unknown or outlier : return inputValue. 1: parseInt.
//2: split space. 4: split space and parseInt.
//6: split 1 character. 7: split 1 character and parseInt.
//8: join space. 9: join nextline. 0: join no character.
function convertInput(inputValue, conversionType){
  try{
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
  }catch(e){
    return inputValue;
  }
}

function executeMainLogic(){
  var firstLineData = parseNextIntArray();
  var N_val = firstLineData[0];
  var K_val = firstLineData[1];
  var modulus = 1000000007;

  const finalSum = Array.from({ length: Math.max(0, N_val + 1 - K_val + 1) }, (_, index) => K_val + index)
    .reduce((accumulator, current_i) => {
        const termMin = current_i * (current_i - 1) / 2;
        const termMax = N_val * current_i - termMin;
        const termValue = (termMax - termMin + 1);
        return (accumulator + termValue) % modulus;
    }, 0);

  printResult(finalSum);
}
