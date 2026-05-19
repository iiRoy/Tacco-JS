var inputReader = require('readline').createInterface({
  input: process.stdin, output: process.stdout
});
var inputSource;
var inputLinesBuffer = [];
inputReader.on('line', function(lineContent){inputLinesBuffer.push(lineContent);});
inputReader.on('close', function(){
  inputSource = initializeInputSystem(inputLinesBuffer);
  console.error("\n");
  var startTime = Date.now();
  Main();
  var endTime = Date.now() - startTime;
  logErrorDetails("time : " + (endTime) + "ms");
  logErrorDetails("memory : " + Math.round(process.memoryUsage().heapTotal / 1024) + "KB");
});

function createDeepCopy(originalObject){return JSON.parse(JSON.stringify(originalObject));}

class InputProcessor {
    constructor(lines) {
        this.dataLines = lines;
        this.currentPosition = 0;
    }

    hasMoreData() {
        return this.currentPosition < this.dataLines.length;
    }

    fetchNextLine() {
        if (!this.hasMoreData()) {
            throw "ArrayIndexOutOfBoundsException ‚There is no more input";
        }
        return this.dataLines[this.currentPosition++];
    }
}

function initializeInputSystem(linesArray){  
  return new InputProcessor(linesArray);
}

const conversionStrategies = {
    1: (val) => parseInt(val, 10),
    2: (val) => val.split(" "),
    4: (val) => val.split(" ").map(Number),
    6: (val) => val.split(""),
    7: (val) => val.split("").map(Number),
    8: (arr) => arr.join(" "),
    9: (arr) => arr.join("\n"),
    0: (arr) => arr.join("")
};

function performTypeConversion(value, conversionType){
    try {
        const strategy = conversionStrategies[conversionType];
        return strategy ? strategy(value) : value;
    } catch(e) {
        return value;
    }
}

function retrieveInteger(){return performTypeConversion(fetchNextLine(),1);}
function retrieveStringArray(){return performTypeConversion(fetchNextLine(),2);}
function retrieveIntegerArray(){return performTypeConversion(fetchNextLine(),4);}
function retrieveCharacterArray(){return performTypeConversion(fetchNextLine(),6);}
function fetchNextLine(){return inputSource.fetchNextLine();}
function hasMoreLines(){return inputSource.hasMoreData();}

function outputResult(content){console.log(content);}
function logErrorDetails(message){console.error("debug:" + require("util").inspect(message,false,null));}

function Main(){
  var arrayLength = retrieveInteger();
  var numberSequence = retrieveIntegerArray();
  
  const initialAccumulator = {
      currentXorSum: 0,
      leftBoundary: 0,
      totalValidSubarrays: 0
  };

  const finalState = numberSequence.reduce((accumulator, currentElement, rightBoundary) => {
      let { currentXorSum, leftBoundary, totalValidSubarrays } = accumulator;

      while ((currentXorSum & currentElement) !== 0) {
          currentXorSum ^= numberSequence[leftBoundary];
          leftBoundary++;
      }
      currentXorSum ^= currentElement;
      totalValidSubarrays += (rightBoundary - leftBoundary + 1);

      return { currentXorSum, leftBoundary, totalValidSubarrays };
  }, initialAccumulator);

  outputResult(finalState.totalValidSubarrays);
}
