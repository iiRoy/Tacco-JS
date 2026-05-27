var lineReader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

var dataHandler;
var collectedLines = [];

lineReader.on('line', function(receivedLine){
  collectedLines.push(receivedLine);
});

lineReader.on('close', function(){
  dataHandler = createInputHandler(collectedLines);
  logDebugMessage("-----start-----");
  var executionStartTimestamp = new Date();
  executePrimaryLogic();
  var executionDuration = new Date() - executionStartTimestamp;
  logDebugMessage("----- end -----");
  logDebugMessage("time : " + (executionDuration) + "ms");
  logDebugMessage("memory : " + Math.round(process.memoryUsage().heapTotal / 1024) + "KB");
});

function getNextInteger(){ return performConversion(fetchNextLine(), 1); }
function getNextStringArray(){ return performConversion(fetchNextLine(), 2); }
function getNextIntegerArray(){ return performConversion(fetchNextLine(), 4); }
function getNextCharacterArray(){ return performConversion(fetchNextLine(), 6); }
function fetchNextLine(){ return dataHandler.next(); }
function hasMoreLines(){ return dataHandler.hasNext(); }

function createInputHandler(sourceLines){
  var handlerInstance = {
    storedLines : sourceLines,
    currentIndex : 0,
    maxIndex : sourceLines.length,

    hasNext : function(){
      return (this.currentIndex < this.maxIndex);
    },

    next : function(){
      if(!this.hasNext()){
        throw "ArrayIndexOutOfBoundsException これ以上ないよ";
      }
      var retrievedLine = this.storedLines[this.currentIndex];
      this.currentIndex++;
      return retrievedLine;
    }
  };
  return handlerInstance;
}

function printOutput(messageContent){
  console.log(messageContent);
}

function logDebugMessage(messageContent){
  console.error("debug:" + require("util").inspect(messageContent,false,null));
}

const CONVERSION_TYPES = {
  TO_INT: 1,
  SPLIT_BY_SPACE: 2,
  SPLIT_AND_MAP_TO_INT: 4,
  SPLIT_BY_CHAR: 6,
  SPLIT_BY_CHAR_AND_MAP_TO_INT: 7,
  JOIN_BY_SPACE: 8,
  JOIN_BY_NEWLINE: 9,
  JOIN_WITHOUT_SEPARATOR: 0
};

const conversionFunctions = {
  [CONVERSION_TYPES.TO_INT]: (data) => parseInt(data),
  [CONVERSION_TYPES.SPLIT_BY_SPACE]: (data) => data.split(" "),
  [CONVERSION_TYPES.SPLIT_AND_MAP_TO_INT]: (data) => data.split(" ").map(Number),
  [CONVERSION_TYPES.SPLIT_BY_CHAR]: (data) => data.split(""),
  [CONVERSION_TYPES.SPLIT_BY_CHAR_AND_MAP_TO_INT]: (data) => data.split("").map(Number),
  [CONVERSION_TYPES.JOIN_BY_SPACE]: (data) => data.join(" "),
  [CONVERSION_TYPES.JOIN_BY_NEWLINE]: (data) => data.join("\n"),
  [CONVERSION_TYPES.JOIN_WITHOUT_SEPARATOR]: (data) => data.join("")
};

function performConversion(inputData, conversionCode){
  try {
    const converter = conversionFunctions[conversionCode];
    if (converter) {
      return converter(inputData);
    }
    return inputData;
  } catch(e) {
    return inputData;
  }
}

function executePrimaryLogic(){
  var initialNumber = getNextInteger();
  var divisorsForN = calculateDivisors(initialNumber);
  
  const N_MINUS_ONE = initialNumber - 1;
  var divisorsForNMinusOne = calculateDivisors(N_MINUS_ONE);
  
  var uniqueResults = new Set();

  const addDivisorsToSet = (divisorList) => {
    for(var loopIndex = 1; loopIndex < divisorList.length; loopIndex++){
      uniqueResults.add(divisorList[loopIndex]);
    }
  };

  addDivisorsToSet(divisorsForNMinusOne);

  const reduceByDivisor = (num, divisor) => {
    let tempNum = num;
    while(tempNum >= divisor){
      if(tempNum % divisor === 0){
        tempNum /= divisor;
      } else {
        tempNum %= divisor;
      }
    }
    return tempNum;
  };

  for(var loopIndex = 1; loopIndex < divisorsForN.length; loopIndex++){
    var currentDivisor = divisorsForN[loopIndex];
    var reducedValue = reduceByDivisor(initialNumber, currentDivisor);
    if(reducedValue === 1){
      uniqueResults.add(currentDivisor);
    }
  }
  printOutput(uniqueResults.size);
}

function calculateDivisors(targetValue){
  var foundDivisors = [];
  for(var divisorCandidate = 1; divisorCandidate * divisorCandidate <= targetValue; divisorCandidate++){
    if(targetValue % divisorCandidate === 0){
      foundDivisors.push(divisorCandidate);
      var conjugateDivisor = targetValue / divisorCandidate;
      if(divisorCandidate * divisorCandidate !== targetValue){
        foundDivisors.push(conjugateDivisor);
      }
    }
  }
  foundDivisors.sort(function(a,b){ return a - b; });
  return foundDivisors;
}

function checkPrimality(numberToCheck){
  if (numberToCheck === null || numberToCheck <= 1) {
    return false;
  }
  if (numberToCheck === 2) {
    return true;
  }
  if (numberToCheck % 2 === 0) {
    return false;
  }

  var sqrtLimit = Math.floor(Math.sqrt(numberToCheck));
  for(var primeCandidate = 3; primeCandidate <= sqrtLimit; primeCandidate += 2){
    if(numberToCheck % primeCandidate === 0){
      return false;
    }
  }
  return true;
}

function factorizeIntoPrimes(numberToFactor){
  var primeFactorCounts = {};
  var currentFactor = 2;
  var remainingNumber = numberToFactor;

  while(remainingNumber !== 1){
    if(remainingNumber % currentFactor === 0){
      primeFactorCounts[currentFactor] = (primeFactorCounts[currentFactor] || 0) + 1;
      remainingNumber /= currentFactor;
      if(checkPrimality(remainingNumber)){
        primeFactorCounts[remainingNumber] = (primeFactorCounts[remainingNumber] || 0) + 1;
        break;
      }
    }else{
      currentFactor = (currentFactor === 2) ? currentFactor + 1 : currentFactor + 2;
    }
  }
  return primeFactorCounts;
}
