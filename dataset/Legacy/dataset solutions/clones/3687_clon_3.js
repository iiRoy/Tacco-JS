const CONV_TYPE_INT = 1;
const CONV_TYPE_STR_ARRAY = 2;
const CONV_TYPE_INT_ARRAY = 4;
const CONV_TYPE_CHAR_ARRAY = 6;
const CONV_TYPE_CHAR_INT_ARRAY = 7;
const CONV_TYPE_JOIN_SPACE = 8;
const CONV_TYPE_JOIN_NEWLINE = 9;
const CONV_TYPE_JOIN_NONE = 0;

const mapToNumbers = (arr) => arr.map(Number);

function readInputFile(){
  return require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");
}

function initializeInputProcessor(){
  const rawInputContent = readInputFile();
  const processorInstance = {
    inputLines: rawInputContent,
    currentLineIndex: 0,
    totalLines: rawInputContent.length
  };

  processorInstance.hasNext = function(){
    return (this.currentLineIndex < this.totalLines);
  };

  processorInstance.next = function(){
    if(!this.hasNext()){
      return "";
    } else {
      const currentLine = this.inputLines[this.currentLineIndex];
      this.currentLineIndex++;
      return currentLine;
    }
  };

  return processorInstance;
}

function convertInputData(inputValue, conversionType){
  try {
    switch(conversionType){
      case CONV_TYPE_INT: return parseInt(inputValue);
      case CONV_TYPE_STR_ARRAY: return inputValue.split(" ");
      case CONV_TYPE_INT_ARRAY: return mapToNumbers(inputValue.split(" "));
      case CONV_TYPE_CHAR_ARRAY: return inputValue.split("");
      case CONV_TYPE_CHAR_INT_ARRAY: return mapToNumbers(inputValue.split(""));
      case CONV_TYPE_JOIN_SPACE: return inputValue.join(" ");
      case CONV_TYPE_JOIN_NEWLINE: return inputValue.join("\n");
      case CONV_TYPE_JOIN_NONE: return inputValue.join("");
      default: return inputValue;
    }
  } catch(e) {
    return inputValue;
  }
}

function logOutput(data){console.log(data);}
function logError(data){console.error(data);}

const inputHandler = initializeInputProcessor();

function nextInt(){return convertInputData(inputHandler.next(), CONV_TYPE_INT);}
function nextStrArray(){return convertInputData(inputHandler.next(), CONV_TYPE_STR_ARRAY);}
function nextIntArray(){return convertInputData(inputHandler.next(), CONV_TYPE_INT_ARRAY);}
function nextCharArray(){return convertInputData(inputHandler.next(), CONV_TYPE_CHAR_ARRAY);}
function next(){return inputHandler.next();}
function hasNext(){return inputHandler.hasNext();}

const isDistanceMatch = (val1, val2, targetDistance) => Math.abs(val1 - val2) === targetDistance;

const incrementCount = (countsObject, key) => {
  countsObject[key] = (countsObject[key] || 0) + 1;
};

function executeMainLogic(){
  const initialParams = nextIntArray();
  const gridSizeN = initialParams[0];
  const maxValM = initialParams[1];
  const distanceD = initialParams[2];

  const occurrenceCounts = {};
  const loopLimit = gridSizeN;

  for(let valA = 1; valA <= loopLimit; valA++){
    for(let valB = 1; valB <= loopLimit; valB++){
      for(let valC = 1; valC <= loopLimit; valC++){
        for(let valD = 1; valD <= loopLimit; valD++){
          let matchCount = 0;

          if(isDistanceMatch(valA, valB, distanceD)) matchCount++;
          if(isDistanceMatch(valC, valB, distanceD)) matchCount++;
          if(isDistanceMatch(valC, valD, distanceD)) matchCount++;

          incrementCount(occurrenceCounts, matchCount);
        }
      }
    }
  }
  logOutput(occurrenceCounts);
}

(function applicationStart() {
  executeMainLogic();
})();
