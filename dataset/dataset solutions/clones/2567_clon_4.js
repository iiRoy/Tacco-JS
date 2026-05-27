var inputReader = require('readline').createInterface({
  input: process.stdin, output: process.stdout
});
var inputLines = [];
var dataProcessor;
inputReader.on('line', function(lineContent){inputLines.push(lineContent);});
inputReader.on('close', function(){
  dataProcessor = initializeInputReader(inputLines);
  console.error("\n");
  var startTime = Date.now();
  executeMainLogic();
  var endTime = Date.now() - startTime;
  logError("time : " + endTime + "ms");
  logError("memory : " + Math.round(process.memoryUsage().heapTotal / 1024) + "KB");
});
function getNextInteger(){return convertInput(retrieveNext(),1);}
function getNextStringArray(){return convertInput(retrieveNext(),2);}
function getNextIntegerArray(){return convertInput(retrieveNext(),4);}
function getNextCharacterArray(){return convertInput(retrieveNext(),6);}
function retrieveNext(){return dataProcessor.fetchNext();}
function hasMoreInput(){return dataProcessor.checkHasNext();}
function initializeInputReader(lines){
  return {
    dataLines : lines,
    currentPosition : 0,
    totalLines : lines.length,
    checkHasNext : function(){return (this.currentPosition < this.totalLines);},
    fetchNext : function(){
      if(this.checkHasNext()){
        return this.dataLines[this.currentPosition++];
      }else{
        throw "InputExhaustedException ‚No more input available";
      }
    }
  };
}
function outputResult(content){console.log(content);}
function logError(message){console.error("debug:" + require("util").inspect(message,false,null));}
function convertInput(item, type){
  try{
    switch(type){
      case 1:return parseInt(item);
      case 2:return item.split(" ");
      case 4:return item.split(" ").map(Number);
      case 6:return item.split("");
      case 7:return item.split("").map(Number);
      case 8:return item.join(" ");
      case 9:return item.join("\n");
      case 0:return item.join("");
      default:return item;
    }
  }catch(e){
    return item;
  }
}
function executeMainLogic(){
  var inputNumber = getNextInteger();
  var characterSequence = getNextCharacterArray();
  var maximumOverlapLength = 0;
  
  for (let currentSuffixStart = 0; currentSuffixStart < characterSequence.length; currentSuffixStart++) {
    let activeSubsequence = characterSequence.slice(currentSuffixStart);
    
    let zArrayForSubsequence = new Array(activeSubsequence.length).fill(0);
    if (activeSubsequence.length > 0) {
        zArrayForSubsequence[0] = activeSubsequence.length;
    }
    
    for (let checkIndex = 1; checkIndex < activeSubsequence.length; checkIndex++) {
      let currentMatchLength = 0;
      while (checkIndex + currentMatchLength < activeSubsequence.length &&
             activeSubsequence[currentMatchLength] === activeSubsequence[checkIndex + currentMatchLength]) {
        currentMatchLength++;
      }
      zArrayForSubsequence[checkIndex] = currentMatchLength;
    }
    
    for (let position = activeSubsequence.length - 1; position >= Math.ceil(activeSubsequence.length / 2); position--) {
      maximumOverlapLength = Math.max(maximumOverlapLength, zArrayForSubsequence[position]);
    }
  }
  
  outputResult(maximumOverlapLength);
}
