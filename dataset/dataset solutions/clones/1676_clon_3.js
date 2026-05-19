const inputReader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

let inputProcessor;
const inputLines = [];

inputReader.on('line', function(currentLine){
  inputLines.push(currentLine);
});

inputReader.on('close', function(){
  inputProcessor = initializeInputHandler(inputLines);
  console.error("\n");
  
  const startTime = new Date();
  executeSolution();
  const endTime = new Date();
  const durationMs = endTime.getTime() - startTime.getTime();
  
  logDebug("time : " + (durationMs) + "ms");
  logDebug("memory : " + Math.round(process.memoryUsage().heapTotal / 1024) + "KB");
});

function createDeepCopy(sourceObject){
  return JSON.parse(JSON.stringify(sourceObject));
}

function readInteger(){return convertAndFormat(getNextLine(),1);}
function readStringArray(){return convertAndFormat(getNextLine(),2);}
function readIntegerArray(){return convertAndFormat(getNextLine(),4);}
function readCharacterArray(){return convertAndFormat(getNextLine(),6);}

function getNextLine(){return inputProcessor.getNext();}
function hasMoreLines(){return inputProcessor.hasMoreLines();}

function initializeInputHandler(linesArray){
  const handlerObject = {};
  handlerObject.lineList = linesArray;
  handlerObject.currentIndex = 0;
  handlerObject.maxIndex = linesArray.length;

  handlerObject.hasMoreLines = function(){
    return (this.currentIndex < this.maxIndex);
  };

  handlerObject.getNext = function(){
    if(!this.hasMoreLines()){
      throw new Error("ArrayIndexOutOfBoundsException: No more input lines available.");
    } else {
      const currentInputLine = this.lineList[this.currentIndex];
      this.currentIndex++;
      return currentInputLine;
    }
  };
  return handlerObject;
}

function printOutput(data){console.log(data);}
function logDebug(message){console.error("debug:" + require("util").inspect(message,false,null));}

const CONVERSION_OPTIONS = {
    TO_INT: 1,
    SPLIT_BY_SPACE: 2,
    SPLIT_BY_SPACE_TO_INT_ARRAY: 4,
    SPLIT_BY_CHAR: 6,
    SPLIT_BY_CHAR_TO_INT_ARRAY: 7,
    JOIN_BY_SPACE: 8,
    JOIN_BY_NEWLINE: 9,
    JOIN_NO_DELIMITER: 0
};

function convertAndFormat(inputValue, conversionType){
  try {
    switch(conversionType){
      case CONVERSION_OPTIONS.TO_INT:
        return parseInt(inputValue, 10);
      case CONVERSION_OPTIONS.SPLIT_BY_SPACE:
        return inputValue.split(" ");
      case CONVERSION_OPTIONS.SPLIT_BY_SPACE_TO_INT_ARRAY:
        return inputValue.split(" ").map(Number);
      case CONVERSION_OPTIONS.SPLIT_BY_CHAR:
        return inputValue.split("");
      case CONVERSION_OPTIONS.SPLIT_BY_CHAR_TO_INT_ARRAY:
        return inputValue.split("").map(Number);
      case CONVERSION_OPTIONS.JOIN_BY_SPACE:
        return inputValue.join(" ");
      case CONVERSION_OPTIONS.JOIN_BY_NEWLINE:
        return inputValue.join("\n");
      case CONVERSION_OPTIONS.JOIN_NO_DELIMITER:
        return inputValue.join("");
      default:
        return inputValue;
    }
  } catch(e){
    return inputValue;
  }
}

function calculateSumExpression(valA, valB, valC) {
    const sqA = valA * valA;
    const sqB = valB * valB;
    const sqC = valC * valC;
    const prodAB = valA * valB;
    const prodBC = valB * valC;
    const prodCA = valC * valA;
    return sqA + sqB + sqC + prodAB + prodBC + prodCA;
}

function executeSolution(){
    const targetCount = readInteger();
    const sumFrequencyMap = {};

    const MAX_DIMENSION = 200;
    for(let idxA = 1; idxA <= MAX_DIMENSION; idxA++){
        for(let idxB = 1; idxB <= MAX_DIMENSION; idxB++){
            for(let idxC = 1; idxC <= MAX_DIMENSION; idxC++){
                const currentSumValue = calculateSumExpression(idxA, idxB, idxC);
                
                if (sumFrequencyMap[currentSumValue] === undefined) {
                    sumFrequencyMap[currentSumValue] = 0;
                }
                sumFrequencyMap[currentSumValue]++;
            }
        }
    }

    const resultArray = new Array(targetCount);
    for(let currentIdx = 0; currentIdx < targetCount; currentIdx++){
        const requiredSumKey = currentIdx + 1;
        const frequency = sumFrequencyMap[requiredSumKey];
        
        if(frequency === undefined){
            resultArray[currentIdx] = 0;
        } else {
            resultArray[currentIdx] = frequency;
        }
    }
    
    printOutput(convertAndFormat(resultArray, CONVERSION_OPTIONS.JOIN_BY_NEWLINE));
}
