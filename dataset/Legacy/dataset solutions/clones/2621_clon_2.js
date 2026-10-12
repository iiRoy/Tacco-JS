var inputReader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});
var dataProcessor;
var inputLines = [];
inputReader.on('line', function(currentLine){inputLines.push(currentLine);});
inputReader.on('close', function(){
  dataProcessor = initializeProcessor(inputLines);
  console.error('\n↑入力 ↓出力');
  executePrimaryLogic();
});
function duplicateObject(originalObject){return (originalObject instanceof Set) ? new Set(Array.from(originalObject)) : JSON.parse(JSON.stringify(originalObject));}
function retrieveInteger(){return transformInput(getNextItem(),1);}
function retrieveStringArray(){return transformInput(getNextItem(),2);}
function retrieveIntegerArray(){return transformInput(getNextItem(),4);}
function retrieveCharacterArray(){return transformInput(getNextItem(),6);}
function getNextItem(){return dataProcessor.getNextItem();}
function hasMoreItems(){return dataProcessor.hasMoreItems();}
function initializeProcessor(rawInputData){  
  return {
    sourceList : rawInputData, currentIndex : 0, maximumCount : rawInputData.length,
    hasMoreItems : function(){return (this.currentIndex < this.maximumCount);},
    getNextItem : function(){if(this.hasMoreItems()){return this.sourceList[this.currentIndex++];}else{throw 'ArrayIndexOutOfBoundsException ‚There is no more input';}}
  };
}
function displayOutput(messageContent){console.log(messageContent);}
function logDebug(messageContent){console.error('debug:' + require('util').inspect(messageContent,false,null));}
function transformInput(inputData,conversionType){try{switch(conversionType){case 1:return parseInt(inputData);case 2:return inputData.split(' ');case 4:return inputData.split(' ').map(Number);case 6:return inputData.split('');case 7:return inputData.split('').map(Number);case 8:return inputData.join(' ');case 9:return inputData.join('\n');case 0:return inputData.join('');default:return inputData;}}catch(errorDetails){return inputData;}}

function executePrimaryLogic(){
  var itemCount = retrieveInteger();
  var resultCollection = [];
  for(var idxA = 0; idxA < itemCount - 1; idxA++){
    for(var idxB = idxA + 1; idxB < itemCount; idxB++){
      for(var bitPos = 0; bitPos < 10; bitPos++){
        if((idxA >> bitPos & 1) !== (idxB >> bitPos & 1)){
          resultCollection.push(bitPos + 1);
        }
      }
    }
  }
  displayOutput(transformInput(resultCollection, 9));
}
