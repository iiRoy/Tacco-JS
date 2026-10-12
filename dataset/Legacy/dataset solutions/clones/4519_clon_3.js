var globalOutputVar;
var fileContentRaw = require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");

var lineReaderInstance = {
  "sourceLines" : fileContentRaw,
  "currentLineIndex" : 0,
  "totalLinesCount" : fileContentRaw.length,
  "retrieveNext" : function(){
    if(!this.checkHasNext()){throw "NoSuchElementException:次に要素は無いよ";}
    var retrievedLine = this.sourceLines[this.currentLineIndex];
    this.currentLineIndex++;
    return retrievedLine;
  },
  "checkHasNext" : function(){return (this.currentLineIndex < this.totalLinesCount);}
};

executeProcessingLogic();

function fetchNextLine(){return lineReaderInstance.retrieveNext();}
function hasMoreLinesAvailable(){return lineReaderInstance.checkHasNext();}
function displayResult(content){console.log(content);}
function logErrorToConsole(errorMsg){console.error(errorMsg);}

function transformInputData(inputValue, conversionType){
  try{
    switch(conversionType){
      case 1: return parseInt(inputValue);
      case 2: return inputValue.split(" ");
      case 4: return inputValue.split(" ").map((itemStr)=>Number(itemStr));
      case 6: return inputValue.split("");
      case 7: return inputValue.split("").map((itemStr)=>Number(itemStr));
      case 8: return inputValue.join(" ");
      case 9: return inputValue.join("\n");
      case 0: return inputValue.join("");
      default: return inputValue;
    }
  }catch(e){
    return inputValue;
  }
}

function executeProcessingLogic() {
  var initialCharArray = transformInputData(fetchNextLine(), 6);
  var characterOccurrences = {};

  for (let char of initialCharArray) {
    characterOccurrences[char] = (characterOccurrences[char] || 0) + 1;
  }
  
  var distinctCharacters = Object.keys(characterOccurrences);

  if(distinctCharacters.length === 1){
    displayResult(0);
    return;
  }
  
  var minimumOperations = 107; // Initial large value for min comparison

  for(var charIterator = 0; charIterator < distinctCharacters.length; charIterator++){
    var targetCharacter = distinctCharacters[charIterator];
    var currentWorkingArray = [...initialCharArray]; // Use spread for array copy
    var currentOperationCount = 0;

    while(!isUniform(currentWorkingArray, targetCharacter)){
      const currentArrayLength = currentWorkingArray.length;
      for(var elementIndex = 0; elementIndex < currentArrayLength - 1; elementIndex++){
        if(currentWorkingArray[elementIndex + 1] === targetCharacter){
          currentWorkingArray[elementIndex] = targetCharacter;
        }
      }
      currentWorkingArray.pop();
      currentOperationCount++;
    }
    minimumOperations = Math.min(minimumOperations, currentOperationCount);
  }
  displayResult(minimumOperations);
}

function isUniform(charSequence, uniformChar){
  return charSequence.every(element => element === uniformChar);
}
