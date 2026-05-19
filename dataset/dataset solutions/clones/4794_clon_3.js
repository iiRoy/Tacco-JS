var inputReader = require('readline').createInterface({
  input: process.stdin, output: process.stdout
});
var inputHandler;
var inputLines = [];

inputReader.on('line', function(lineContent){inputLines.push(lineContent);});
inputReader.on('close', function(){
  inputHandler = new InputProcessor(inputLines);
  console.error('\n↑入力 ↓出力');
  executeSolution();
});

function deepCopyValue(sourceObj){return (sourceObj instanceof Set) ? new Set(Array.from(sourceObj)) : JSON.parse(JSON.stringify(sourceObj));}

class InputProcessor {
    constructor(linesData) {
        this.dataList = linesData;
        this.currentIndex = 0;
        this.maxLength = linesData.length;
    }

    hasMoreLines() {
        return (this.currentIndex < this.maxLength);
    }

    getNextLine() {
        if (this.hasMoreLines()) {
            return this.dataList[this.currentIndex++];
        } else {
            throw 'ArrayIndexOutOfBoundsException ‚There is no more input';
        }
    }
}

const inputConverters = {
    1: (val) => parseInt(val),
    2: (val) => val.split(' '),
    4: (val) => val.split(' ').map(Number),
    6: (val) => val.split(''),
    7: (val) => val.split('').map(Number),
    8: (val) => val.join(' '),
    9: (val) => val.join('\n'),
    0: (val) => val.join(''),
    default: (val) => val
};

function processInputConversion(inputValue, conversionType) {
    try {
        const converter = inputConverters[conversionType] || inputConverters.default;
        return converter(inputValue);
    } catch (error) {
        return inputValue;
    }
}

function readInt(){return processInputConversion(getNextLine(),1);}
function readStringArray(){return processInputConversion(getNextLine(),2);}
function readIntArray(){return processInputConversion(getNextLine(),4);}
function readCharArray(){return processInputConversion(getNextLine(),6);}
function getNextLine(){return inputHandler.getNextLine();}
function hasMoreLines(){return inputHandler.hasMoreLines();}

function printResult(outputValue){console.log(outputValue);}
function logDebug(debugValue){console.error('debug:' + require('util').inspect(debugValue,false,null));}

function getEvenComponent(value) {
    return value - (value % 2);
}

function executeSolution(){
  const inputNumbers = readIntArray();
  const valI = inputNumbers[0];
  const valO = inputNumbers[1];
  const valT = inputNumbers[2];
  const valJ = inputNumbers[3];
  const valL = inputNumbers[4];
  const valS = inputNumbers[5];
  const valZ = inputNumbers[6];

  const evenPairsI_A = getEvenComponent(valI);
  const evenPairsJ_A = getEvenComponent(valJ);
  const evenPairsL_A = getEvenComponent(valL);
  const resultOptionA = evenPairsI_A + evenPairsJ_A + evenPairsL_A;

  let resultOptionB = 0;
  const canFormThreeBlock = (valI >= 1 && valJ >= 1 && valL >= 1);

  if (canFormThreeBlock) {
    const remainingI = valI - 1;
    const remainingJ = valJ - 1;
    const remainingL = valL - 1;

    const evenPairsI_B = getEvenComponent(remainingI);
    const evenPairsJ_B = getEvenComponent(remainingJ);
    const evenPairsL_B = getEvenComponent(remainingL);

    resultOptionB = evenPairsI_B + evenPairsJ_B + evenPairsL_B + 3;
  }

  const maximumPossiblePairs = Math.max(resultOptionA, resultOptionB);
  printResult(maximumPossiblePairs + valO);
}
