var inputReader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});
var inputProcessor;
var rawInputLines = [];
inputReader.on('line', function(inputLine){rawInputLines.push(inputLine);});
inputReader.on('close', function(){
  inputProcessor = initializeInputProcessor(rawInputLines);
  logDebugMessage("-----start-----");
  var startTime = new Date();
  processMainLogic();
  var endTime = new Date() - startTime;
  logDebugMessage("----- end -----");
  logDebugMessage("time : " + (endTime) + "ms");
  logDebugMessage("memory : " + Math.round(process.memoryUsage().heapTotal / 1024) + "KB");
});
function retrieveNextInteger(){return performTypeConversion(fetchNextLine(),1);} function retrieveNextStringArray(){return performTypeConversion(fetchNextLine(),2);}
function retrieveNextIntegerArray(){return performTypeConversion(fetchNextLine(),4);} function retrieveNextCharacterArray(){return performTypeConversion(fetchNextLine(),6);}
function fetchNextLine(){return inputProcessor.retrieveNext();} function hasMoreLines(){return inputProcessor.moreAvailable();}
function initializeInputProcessor(sourceLines){  
  let currentLineIndex = 0;
  const totalLines = sourceLines.length;

  const lineIterator = {
    moreAvailable: () => currentLineIndex < totalLines,
    retrieveNext: () => {
      if (!lineIterator.moreAvailable()) {
        throw new Error("InputExhaustedError: No more lines available.");
      }
      const currentLine = sourceLines[currentLineIndex];
      currentLineIndex++;
      return currentLine;
    }
  };
  return lineIterator;
}
function displayOutput(content){console.log(content);}
function logDebugMessage(message){console.error("debug:" + require("util").inspect(message,false,null));}

function performTypeConversion(inputItem, conversionType) {
  const conversionHandlers = new Map([
    [1, (val) => parseInt(val)],
    [2, (val) => val.split(" ")],
    [4, (val) => val.split(" ").map(Number)],
    [6, (val) => val.split("")],
    [7, (val) => val.split("").map(Number)],
    [8, (val) => val.join(" ")],
    [9, (val) => val.join("\n")],
    [0, (val) => val.join("")],
  ]);

  try {
    if (conversionHandlers.has(conversionType)) {
      return conversionHandlers.get(conversionType)(inputItem);
    } else {
      return inputItem;
    }
  } catch (error) {
    return inputItem;
  }
}

function processMainLogic(){
  const inputNumber = retrieveNextInteger();
  const divisorsOfNMinusOne = obtainDivisors(inputNumber - 1);
  const divisorsOfN = obtainDivisors(inputNumber);

  const resultantSet = new Set();

  divisorsOfNMinusOne.forEach(divisorCandidate => {
    if (divisorCandidate !== 1) {
      resultantSet.add(divisorCandidate);
    }
  });

  const checkReductionPath = (currentValue, divisor) => {
    if (currentValue === 1) {
      return true;
    }
    if (currentValue < divisor) {
      return false;
    }
    if (currentValue % divisor === 0) {
      return checkReductionPath(currentValue / divisor, divisor);
    } else {
      return checkReductionPath(currentValue % divisor, divisor);
    }
  };

  divisorsOfN.forEach(divisorCandidate => {
    if (divisorCandidate !== 1 && checkReductionPath(inputNumber, divisorCandidate)) {
      resultantSet.add(divisorCandidate);
    }
  });

  displayOutput(resultantSet.size);
}

function obtainDivisors(value) {
  const collectedDivisors = new Set();
  const searchLimit = Math.floor(Math.sqrt(value));

  Array.from({ length: searchLimit }, (_, idx) => idx + 1).forEach(potentialDivisor => {
    if (value % potentialDivisor === 0) {
      collectedDivisors.add(potentialDivisor);
      collectedDivisors.add(value / potentialDivisor);
    }
  });

  return Array.from(collectedDivisors).sort((a, b) => a - b);
}
