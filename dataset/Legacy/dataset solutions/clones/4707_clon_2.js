// This section handles input and output operations.
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
  console.error('\n↑ Input ↓ Output'); // Debug message for user
  solveProblem();
});

// Creates a deep copy of an object or Set.
function createDeepCopy(originalObject){
  return (originalObject instanceof Set) ? new Set(Array.from(originalObject)) : JSON.parse(JSON.stringify(originalObject));
}

// Reads the next input as an integer.
function readInteger(){
  return convertInput(fetchNext(), 0x1);
}

// Reads the next input as an array of strings (space-separated).
function readStringArray(){
  return convertInput(fetchNext(), 0x2);
}

// Reads the next input as an array of integers (space-separated).
function readIntegerArray(){
  return convertInput(fetchNext(), 0x4);
}

// Reads the next input as an array of characters.
function readCharacterArray(){
  return convertInput(fetchNext(), 0x6);
}

// Fetches the next raw input line.
function fetchNext(){
  return inputProcessor.getNextLine();
}

// Checks if there's more input available.
function checkHasNext(){
  return inputProcessor.hasMoreInput();
}

// Initializes the input handler object.
function initializeInputHandler(linesArray){
  return {
    dataLines : linesArray,
    currentLineIndex : 0x0,
    totalLines : linesArray.length,
    hasMoreInput : function(){
      return (this.currentLineIndex < this.totalLines);
    },
    getNextLine : function(){
      if(this.hasMoreInput()){
        return this.dataLines[this.currentLineIndex++];
      } else {
        throw 'ArrayIndexOutOfBoundsException ‚There is no more input';
      }
    }
  };
}

// Prints the final result to standard output.
function printResult(outputValue){
  console.log(outputValue);
}

// Logs debug information to standard error.
function logDebug(debugInfo){
  console.error('debug:' + require('util').inspect(debugInfo, false, null));
}

// Utility function for various input conversions.
// conversionType:
//   0x1: parseInt
//   0x2: split by space
//   0x4: split by space and map to Number
//   0x6: split by character
//   0x7: split by character and map to Number
//   0x8: join by space
//   0x9: join by newline
//   0x0: join with no character
//   default: return as is
function convertInput(inputValue, conversionType){
  try {
    switch(conversionType){
      case 0x1: return parseInt(inputValue);
      case 0x2: return inputValue.split(' ');
      case 0x4: return inputValue.split(' ').map(Number);
      case 0x6: return inputValue.split('');
      case 0x7: return inputValue.split('').map(Number);
      case 0x8: return inputValue.join(' ');
      case 0x9: return inputValue.join('\n');
      case 0x0: return inputValue.join('');
      default: return inputValue;
    }
  } catch(error) {
    return inputValue;
  }
}

// Main problem-solving logic.
function solveProblem(){
  var numAnimals = readInteger();
  var animalStates = readCharacterArray();

  // Define initial configurations for the first two animals.
  var initialConfigurations = [
    ["S", "S"],
    ["S", "W"],
    ["W", "S"],
    ["W", "W"]
  ];

  // Iterate through each possible initial configuration.
  for(var configIndex = 0x0; configIndex < initialConfigurations.length; configIndex++){
    var animalArrangement = new Array(numAnimals + 0x2); // Array to store animal types (S/W)
    animalArrangement[0x0] = initialConfigurations[configIndex][0x0];
    animalArrangement[0x1] = initialConfigurations[configIndex][0x1];

    // Determine the type of each subsequent animal based on the current and previous two.
    for(var currentAnimalIndex = 0x0; currentAnimalIndex < numAnimals; currentAnimalIndex++){
      if(animalStates[currentAnimalIndex] === "o"){ // If the current animal is an 'o' (sheep)
        if(animalArrangement[currentAnimalIndex] === animalArrangement[currentAnimalIndex + 0x1]){
          animalArrangement[currentAnimalIndex + 0x2] = "S"; // Next animal is S if current and next are same
        } else {
          animalArrangement[currentAnimalIndex + 0x2] = "W"; // Next animal is W if current and next are different
        }
      } else { // If the current animal is an 'x' (wolf)
        if(animalArrangement[currentAnimalIndex] !== animalArrangement[currentAnimalIndex + 0x1]){
          animalArrangement[currentAnimalIndex + 0x2] = "S"; // Next animal is S if current and next are different
        } else {
          animalArrangement[currentAnimalIndex + 0x2] = "W"; // Next animal is W if current and next are same
        }
      }
    }

    // Check if the arrangement forms a valid cycle.
    if(animalArrangement[0x0] === animalArrangement[numAnimals] && animalArrangement[0x1] === animalArrangement[numAnimals + 0x1]){
      animalArrangement.pop(); // Remove the last two elements (which are duplicates for cycle check)
      animalArrangement.pop();
      printResult(animalArrangement.join("")); // Output the valid arrangement
      return; // Exit after finding the first valid solution
    }
  }

  // If no valid arrangement is found after checking all initial configurations.
  printResult(-0x1);
}
