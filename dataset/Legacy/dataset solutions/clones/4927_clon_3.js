var inputHandler = initializeInputHandler();

processInput();

function readInt(){return convertInput(getNextLine(), 1);}
function readStringArray(){return convertInput(getNextLine(), 2);}
function readIntArray(){return convertInput(getNextLine(), 4);}
function readCharArray(){return convertInput(getNextLine(), 6);}

function getNextLine(){return inputHandler.next();}
function hasMoreLines(){return inputHandler.hasNext();}

function getInputContent(){return require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");}

function initializeInputHandler(){
  const rawInputLines = getInputContent();
  const OUT_OF_BOUNDS_ERROR_MSG = "ArrayIndexOutOfBoundsException これ以上ないよ";

  const handlerInstance = {
    "list" : rawInputLines,
    "index" : 0,
    "max" : rawInputLines.length,
    "hasNext" : function(){
      return (this.index < this.max);
    },
    "next" : function(){
      if(!this.hasNext()){
        throw OUT_OF_BOUNDS_ERROR_MSG;
      }
      const currentLine = this.list[this.index];
      this.index++;
      return currentLine;
    }
  };
  return handlerInstance;
}

function printResult(value){console.log(value);}
function printError(value){console.error(value);}

const parseInteger = (val) => parseInt(val);
const splitBySpace = (val) => val.split(" ");
const splitAndMapToNumber = (val) => val.split(" ").map(Number);
const splitByChar = (val) => val.split("");
const splitCharAndMapToNumber = (val) => val.split("").map(Number);
const joinWithSpace = (arr) => arr.join(" ");
const joinWithNewline = (arr) => arr.join("\n");
const joinWithoutSeparator = (arr) => arr.join("");

function convertInput(inputValue, conversionType){
  try {
    let processedValue;
    switch(conversionType){
      case 1: processedValue = parseInteger(inputValue); break;
      case 2: processedValue = splitBySpace(inputValue); break;
      case 4: processedValue = splitAndMapToNumber(inputValue); break;
      case 6: processedValue = splitByChar(inputValue); break;
      case 7: processedValue = splitCharAndMapToNumber(inputValue); break;
      case 8: processedValue = joinWithSpace(inputValue); break;
      case 9: processedValue = joinWithNewline(inputValue); break;
      case 0: processedValue = joinWithoutSeparator(inputValue); break;
      default: processedValue = inputValue; break;
    }
    return processedValue;
  } catch(e) {
    return inputValue;
  }
}

function processInput(){
  const inputString = getNextLine();
  let score = 0;
  const stringLength = inputString.length;

  const shouldEvaluateForG = (idx, len) => (idx % 2 === 0 && idx !== len - 1);

  for(let charIndex = 0; charIndex < stringLength; charIndex++){
    const currentChar = inputString[charIndex];

    if(shouldEvaluateForG(charIndex, stringLength)){
      if(currentChar === "g"){
        score++;
      }
    } else {
      if(currentChar === "p"){
        score--;
      }
    }
  }
  printResult(score);
}
