var read = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});
var inputProcessor;
var inputLines = [];
read.on('line', function(input){inputLines.push(input);});
read.on('close', function(){
  inputProcessor = initializeInput(inputLines);
  console.error("\n");
  var startTime = Date.now();
  executeMainLogic();
  var elapsedTime = Date.now() - startTime;
  logError("time : " + (elapsedTime) + "ms");
  logError("memory : " + Math.round(process.memoryUsage().heapTotal / 1024) + "KB");
});
function createDeepCopy(sourceObj){return JSON.parse(JSON.stringify(sourceObj));}
function getNextInteger(){return convertInput(retrieveNext(),1);}
function getNextStringArray(){return convertInput(retrieveNext(),2);}
function getNextIntegerArray(){return convertInput(retrieveNext(),4);}
function getNextCharacterArray(){return convertInput(retrieveNext(),6);}
function retrieveNext(){return inputProcessor.next();}
function hasMoreInput(){return inputProcessor.hasNext();}
function initializeInput(lines){
  var inputHandler = {
    dataList : lines, currentIdx : 0, maxIdx : lines.length,
    hasNext : function(){return (this.currentIdx < this.maxIdx);},
    next : function(){if(!this.hasNext()){throw "InputOutOfBoundsException No more input available";}else{var currentInput = this.dataList[this.currentIdx];this.currentIdx++;return currentInput;}}
  };
  return inputHandler;
}
function outputResult(data){console.log(data);}
function logError(message){console.error("debug:" + require("util").inspect(message,false,null));}
function convertInput(item, conversionType){
  try{
    switch(conversionType){
      case 1: return parseInt(item);
      case 2: return item.split(" ");
      case 4: return item.split(" ").map(Number);
      case 6: return item.split("");
      case 7: return item.split("").map(Number);
      case 8: return item.join(" ");
      case 9: return item.join("\n");
      case 0: return item.join("");
      default: return item;
    }
  }catch(e){
    return item;
  }
}

function executeMainLogic(){
    const inputPattern = retrieveNext();
    const patternLength = inputPattern.length;
    const moduloValue = 1000000007;
    const targetDivisor = 13;

    // Initialize the dynamic programming state.
    // 'waysByRemainder' will store the count of numbers formed so far
    // that yield a specific remainder when divided by 'targetDivisor'.
    // The initial state represents an empty string, which forms the number 0.
    // 0 % 13 = 0, so there's 1 way to get remainder 0. All others are 0.
    const initialWays = Array(targetDivisor).fill(0);
    initialWays[0] = 1;

    // Process each character of the input pattern using a functional reduction approach.
    // The accumulator 'previousWays' holds the DP state from the prior character.
    // 'currentCharacter' is the character being processed in the current step.
    const finalWays = inputPattern.split('').reduce((previousWays, currentCharacter) => {
        // 'currentWays' will store the DP state after processing the 'currentCharacter'.
        // It's initialized to all zeros for each step.
        const currentWays = Array(targetDivisor).fill(0);

        // Iterate through all possible remainders from the 'previousWays' state.
        for (let prevRemainder = 0; prevRemainder < targetDivisor; prevRemainder++) {
            // If no ways led to 'prevRemainder' in the previous step, skip.
            if (previousWays[prevRemainder] === 0) {
                continue;
            }

            // Determine the set of possible digits for the 'currentCharacter'.
            // If it's '?', all digits from 0-9 are possible.
            // Otherwise, it's just the digit represented by the character.
            const possibleDigits = (currentCharacter === '?')
                ? Array.from({ length: 10 }, (_, idx) => idx) // Generates [0, 1, ..., 9]
                : [Number(currentCharacter)]; // Converts char to number

            // For each possible digit, calculate the new remainder and update 'currentWays'.
            for (const digitValue of possibleDigits) {
                const nextRemainder = (prevRemainder * 10 + digitValue) % targetDivisor;
                currentWays[nextRemainder] = (currentWays[nextRemainder] + previousWays[prevRemainder]) % moduloValue;
            }
        }
        // Return the updated DP state for the next character in the reduction.
        return currentWays;
    }, initialWays); // Start the reduction with the 'initialWays' state.

    // The problem asks for the count of ways to form a number with remainder 5.
    outputResult(finalWays[5]);
}
