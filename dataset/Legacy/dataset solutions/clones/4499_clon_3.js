var inputReader = require('readline').createInterface({
  input: process.stdin, output: process.stdout
});
var inputHandler; var inputLinesBuffer = [];
inputReader.on('line', function(inputLine){inputLinesBuffer.push(inputLine);});
inputReader.on('close', function(){
  inputHandler = new InputHandler(inputLinesBuffer);
  console.error('\n↑入力 ↓出力');
  executeMainLogic();
});

class InputHandler {
  constructor(lines) {
    this.lines = lines;
    this.currentLineIndex = 0;
    this.totalLines = lines.length;
  }

  hasMoreTokens() {
    return this.currentLineIndex < this.totalLines;
  }

  getNextToken() {
    if (this.hasMoreTokens()) {
      return this.lines[this.currentLineIndex++];
    } else {
      throw 'ArrayIndexOutOfBoundsException ‚There is no more input';
    }
  }
}

function deepCopy(sourceObject){return (sourceObject instanceof Set) ? new Set(Array.from(sourceObject)) : JSON.parse(JSON.stringify(sourceObject));}
function readInteger(){return convertInput(getNextToken(),1);} function readStringArray(){return convertInput(getNextToken(),2);}
function readIntegerArray(){return convertInput(getNextToken(),4);} function readCharacterArray(){return convertInput(getNextToken(),6);}
function getNextToken(){return inputHandler.getNextToken();} function hasMoreTokens(){return inputHandler.hasMoreTokens();}

function printOutput(outputValue){console.log(outputValue);}
function printDebugError(errorMessage){console.error('debug:' + require('util').inspect(errorMessage,false,null));}

function convertInput(inputValue, conversionType){
  try{
    const splitBySpace = (val) => val.split(' ');
    const splitByChar = (val) => val.split('');

    const conversionMap = {
      1: (val) => parseInt(val),
      2: splitBySpace,
      4: (val) => splitBySpace(val).map(Number),
      6: splitByChar,
      7: (val) => splitByChar(val).map(Number),
      8: (val) => val.join(' '),
      9: (val) => val.join('\n'),
      0: (val) => val.join('')
    };

    const converter = conversionMap[conversionType];
    if (converter) {
      return converter(inputValue);
    } else {
      return inputValue;
    }
  }catch(e){
    return inputValue;
  }
}

function executeMainLogic(){
  const countElements = readInteger();
  const dataList = readIntegerArray();
  const resultArray = [];

  const isCountEven = (countElements % 2 === 0);

  const insertElementIntoResult = (targetArray, element, isEvenIndex, isEvenTotalCount) => {
    if (isEvenTotalCount) {
      if (isEvenIndex) {
        targetArray.push(element);
      } else {
        targetArray.unshift(element);
      }
    } else {
      if (isEvenIndex) {
        targetArray.unshift(element);
      } else {
        targetArray.push(element);
      }
    }
  };

  for (let currentIndex = 0; currentIndex < countElements; currentIndex++) {
    const currentElement = dataList[currentIndex];
    const isCurrentIndexEven = (currentIndex % 2 === 0);
    insertElementIntoResult(resultArray, currentElement, isCurrentIndexEven, isCountEven);
  }

  printOutput(convertInput(resultArray, 8));
}
