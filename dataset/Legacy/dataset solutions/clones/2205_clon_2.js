var inputReader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

var inputProcessor;
var inputLines = [];

inputReader.on('line', function(currentLine){
  inputLines.push(currentLine);
});

inputReader.on('close', function(){
  inputProcessor = initializeInputHandler(inputLines);
  // Debug message for input/output separation
  console.error('\n↑ Input ↓ Output');
  executeSolution();
});

// Utility function to create a deep copy of an object or Set
function createDeepCopy(originalObject){
  return (originalObject instanceof Set) ? new Set(Array.from(originalObject)) : JSON.parse(JSON.stringify(originalObject));
}

// Helper functions for reading various input types
function readInteger(){ return convertInputType(getNextInputLine(), 1); }
function readStringArray(){ return convertInputType(getNextInputLine(), 2); }
function readIntegerArray(){ return convertInputType(getNextInputLine(), 4); }
function readCharacterArray(){ return convertInputType(getNextInputLine(), 6); }

// Core input stream methods
function getNextInputLine(){ return inputProcessor.advanceAndGet(); }
function hasMoreInput(){ return inputProcessor.canAdvance(); }

// Initializes an object to manage input lines
function initializeInputHandler(linesCollection){
  return {
    dataLines : linesCollection,
    currentLineIndex : 0,
    totalLines : linesCollection.length,

    canAdvance : function(){
      return (this.currentLineIndex < this.totalLines);
    },

    advanceAndGet : function(){
      if(this.canAdvance()){
        return this.dataLines[this.currentLineIndex++];
      } else {
        throw 'ArrayIndexOutOfBoundsException ‚There is no more input';
      }
    }
  };
}

// Function to print the final result
function printResult(outputValue){
  console.log(outputValue);
}

// Function for logging debug information to stderr
function logDebug(debugData){
  console.error('debug:' + require('util').inspect(debugData, false, null));
}

// Universal input conversion utility
// param "conversionType" specifies the desired output format
// 1: parseInt
// 2: split by space
// 4: split by space and map to Number
// 6: split by character
// 7: split by character and map to Number
// 8: join array elements with space
// 9: join array elements with newline
// 0: join array elements without separator
function convertInputType(inputValue, conversionType){
  try {
    switch(conversionType){
      case 1: return parseInt(inputValue);
      case 2: return inputValue.split(' ');
      case 4: return inputValue.split(' ').map(Number);
      case 6: return inputValue.split('');
      case 7: return inputValue.split('').map(Number);
      case 8: return inputValue.join(' ');
      case 9: return inputValue.join('\n');
      case 0: return inputValue.join('');
      default: return inputValue;
    }
  } catch(error) {
    return inputValue;
  }
}

// Main solution logic starts here
function executeSolution(){
  var firstLineData = readIntegerArray();
  var numMonsters = firstLineData[0];
  var bombRange = firstLineData[1];
  var bombDamage = firstLineData[2];

  var monsterData = new Array(numMonsters);
  for(var idx = 0; idx < numMonsters; idx++){
    monsterData[idx] = readIntegerArray();
  }

  // Sort monsters by their position (first element)
  monsterData.sort(function(monsterA, monsterB){
    return monsterA[0] - monsterB[0];
  });

  var totalBombs = 0;

  // Iterate through each monster to determine bombing strategy
  for(var idx = 0; idx < numMonsters; idx++){
    // If monster's HP is already 0 or less, skip it
    if(monsterData[idx][1] <= 0){
      continue;
    }

    var currentMonsterPos = monsterData[idx][0];
    // Calculate how many bombs are needed for the current monster
    var bombsToDeploy = Math.ceil(monsterData[idx][1] / bombDamage);
    totalBombs += bombsToDeploy;

    // Apply bomb damage to subsequent monsters within range
    for(var innerIdx = idx + 1; innerIdx < numMonsters; innerIdx++){
      // Check if the current bomb's effective range covers the next monster
      // The bomb covers from currentMonsterPos to currentMonsterPos + 2 * bombRange
      if(currentMonsterPos + 2 * bombRange >= monsterData[innerIdx][0]){
        // Reduce the next monster's HP, ensuring it doesn't go below zero
        monsterData[innerIdx][1] = Math.max(0, monsterData[innerIdx][1] - bombsToDeploy * bombDamage);
      } else {
        // Monsters are sorted by position, so if this one is out of range,
        // all subsequent monsters will also be out of range.
        break;
      }
    }
  }
  printResult(totalBombs);
}
