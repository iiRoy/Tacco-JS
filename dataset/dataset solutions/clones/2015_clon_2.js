var inputReader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});
var dataProcessor;
var inputLines = [];
inputReader.on('line', function(currentLine){inputLines.push(currentLine);});
inputReader.on('close', function(){
  dataProcessor = initializeInputHandler(inputLines);
  debugLog("----- Program Start -----");
  var startTime = new Date();
  executePrimaryLogic();
  var endTime = new Date() - startTime;
  debugLog("----- Program End -----");
  debugLog("Execution Time : " + (endTime) + "ms");
  debugLog("Memory Usage : " + Math.round(process.memoryUsage().heapTotal / 1024) + "KB");
});
function getNextInteger(){return convertInput(fetchNextLine(),1);} function getNextStringArray(){return convertInput(fetchNextLine(),2);}
function getNextIntegerArray(){return convertInput(fetchNextLine(),4);} function getNextCharacterArray(){return convertInput(fetchNextLine(),6);}
function fetchNextLine(){return dataProcessor.next();} function hasMoreLines(){return dataProcessor.hasNext();}
function initializeInputHandler(incomingData){
  var handlerObject = {
    lineCollection : incomingData, currentPosition : 0, totalLines : incomingData.length,
    hasNext : function(){return (this.currentPosition < this.totalLines);},
    next : function(){if(!this.hasNext()){throw "InputOutOfBoundsException: No more input available.";}else{var retrievedLine = this.lineCollection[this.currentPosition];this.currentPosition++;return retrievedLine;}}
  };
  return handlerObject;
}
function printOutput(message){console.log(message);}
function debugLog(messageContent){console.error("DEBUG_INFO: " + require("util").inspect(messageContent,false,null));}
// Input conversion utility
// conversionType: 1:integer, 2:string array, 4:integer array, 6:char array
// 7:char integer array, 8:join with space, 9:join with newline, 0:join without separator
function convertInput(inputItem, conversionType){try{switch(conversionType){case 1:return parseInt(inputItem, 10);case 2:return inputItem.split(" ");case 4:return inputItem.split(" ").map(Number);case 6:return inputItem.split("");case 7:return inputItem.split("").map(Number);case 8:return inputItem.join(" ");case 9:return inputItem.join("\n");case 0:return inputItem.join("");default:return inputItem;}}catch(error){return inputItem;}}

function executePrimaryLogic(){
  var inputNumber = getNextInteger();
  var divisorsOfN = calculateDivisors(inputNumber);
  var divisorsOfNMinusOne = calculateDivisors(inputNumber - 1);
  var resultantSet = new Set();
  for(var counterA = 1; counterA < divisorsOfNMinusOne.length; counterA++){
    resultantSet.add(divisorsOfNMinusOne[counterA]);
  }
  for(var counterB = 1; counterB < divisorsOfN.length; counterB++){
    var tempNumber = inputNumber;
    var currentDivisor = divisorsOfN[counterB];
    while(tempNumber >= currentDivisor){
      if(tempNumber % currentDivisor === 0){
        tempNumber /= currentDivisor;
      }else{
        tempNumber %= currentDivisor;
      }
    }
    if(tempNumber === 1){
      resultantSet.add(currentDivisor);
    }
  }
  printOutput(resultantSet.size);
}
function calculateDivisors(currentValue){
  var divisorCollection = [];
  for(var factor = 1; factor * factor <= currentValue; factor++){
    if(currentValue % factor === 0){
      divisorCollection.push(factor);
      if(factor * factor !== currentValue){
        divisorCollection.push(currentValue / factor);
      }
    }
  }
  divisorCollection.sort(function(first, second){ return first - second; });
  return divisorCollection;
}
function checkIfPrime(numberToCheck){
  if(numberToCheck === null || numberToCheck <= 1 || (numberToCheck !== 2 && numberToCheck % 2 === 0)){
    return false;
  }else if(numberToCheck === 2){
    return true;
  }
  var squareRootVal = Math.floor(Math.sqrt(numberToCheck));
  for(var oddFactor = 3; oddFactor <= squareRootVal; oddFactor += 2){
    if(numberToCheck % oddFactor === 0){
      return false;
    }
  }
  return true;
}
function factorizeIntoPrimes(numberToFactor){
  var primeFactorCounts = {};
  var currentDivisor = 2;
  while(numberToFactor !== 1){
    if(numberToFactor % currentDivisor === 0){
      (primeFactorCounts[currentDivisor] === undefined)  ? primeFactorCounts[currentDivisor] = 1 : primeFactorCounts[currentDivisor]++;
      numberToFactor /= currentDivisor;
      if(checkIfPrime(numberToFactor)){
        (primeFactorCounts[numberToFactor] === undefined)  ? primeFactorCounts[numberToFactor] = 1 : primeFactorCounts[numberToFactor]++;
        break;
      }
    }else{
      currentDivisor = (currentDivisor === 2) ? currentDivisor + 1 : currentDivisor + 2;
    }
  }
  return primeFactorCounts;
}
