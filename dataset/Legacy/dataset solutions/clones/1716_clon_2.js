var inputReader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});
var dataProcessor;
var inputLines = [];

// Event listener for each line of input
inputReader.on('line', function(currentInputLine){
  inputLines.push(currentInputLine);
});

// Event listener for when input stream closes
inputReader.on('close', function(){
  dataProcessor = initializeInputHandler(inputLines);
  console.error("\n"); // Print a newline to stderr for formatting
  var startTime = new Date();
  executeChallenge(); // Execute the main program logic
  var elapsedTime = new Date() - startTime;
  
  logDebugInfo("time : " + (elapsedTime) + "ms");
  logDebugInfo("memory : " + Math.round(process.memoryUsage().heapTotal / 1024) + "KB");
});

// Helper functions for parsing input
function getNextInteger(){return transformInput(retrieveNextLine(),1);}
function getNextStringArray(){return transformInput(retrieveNextLine(),2);}
function getNextIntegerArray(){return transformInput(retrieveNextLine(),4);}
function getNextCharacterArray(){return transformInput(retrieveNextLine(),6);}
function retrieveNextLine(){return dataProcessor.retrieveNextLine();}
function hasMoreData(){return dataProcessor.hasMoreData();}

// Initializes an object to manage input lines
function initializeInputHandler(sourceInput){  
  var handlerObject = {
    sourceLines : sourceInput,
    currentPosition : 0,
    totalLines : sourceInput.length,
    // Checks if there are more lines to process
    hasMoreData : function(){
      return (this.currentPosition < this.totalLines);
    },
    // Retrieves the next line from the input
    retrieveNextLine : function(){
      if(!this.hasMoreData()){
        throw "ArrayIndexOutOfBoundsException これ以上ないよ"; // Error if no more input
      } else {
        var currentLineContent = this.sourceLines[this.currentPosition];
        this.currentPosition++;
        return currentLineContent;
      }
    }
  };
  return handlerObject;
}

// Outputs a result to standard output
function printResult(content){
  console.log(content);
}

// Outputs debug information to standard error
function logDebugInfo(debugMessage){
  console.error("debug:" + require("util").inspect(debugMessage,false,null));
}

// Utility function for converting input values based on a specified type
// conversionType:
// 1: Convert to integer
// 2: Split by space into string array
// 4: Split by space into number array
// 6: Split by character into string array
// 7: Split by character into number array
// 8: Join array with space
// 9: Join array with newline
// 0: Join array without separator
// Default: Return input as is
function transformInput(inputValue, conversionType){
  try{
    switch(conversionType){
      case 1: return parseInt(inputValue);
      case 2: return inputValue.split(" ");
      case 4: return inputValue.split(" ").map(Number);
      case 6: return inputValue.split("");
      case 7: return inputValue.split("").map(Number);
      case 8: return inputValue.join(" ");
      case 9: return inputValue.join("\n");
      case 0: return inputValue.join("");
      default: return inputValue;
    }
  } catch(error){
    return inputValue; // Return original value on error
  }
}

// Main program logic
function executeChallenge(){
	var numDays = getNextInteger(); // Read the number of days
	var costFactors = getNextIntegerArray(); // Read the cost factors for each contest type
	var dailyScores = new Array(numDays); // Array to store cumulative scores
	var lastOccurrence = new Array(26).fill(0); // Tracks the last day each contest type was held

	// Iterate through each day
	for(var currentDay = 1; currentDay <= numDays; currentDay++){
		var dayScores = getNextIntegerArray(); // Read scores for contests on the current day
		var highestScore = -1; // Initialize highest score for the day
		var bestContestIndex = -1; // Initialize index of the best contest type

		// Find the contest type with the highest score for the current day
		for(var contestType = 0; contestType < dayScores.length; contestType++){
			if(highestScore < dayScores[contestType]){
				highestScore = dayScores[contestType];
				bestContestIndex = contestType;
			}
		}
		
		// Update the last occurrence day for the chosen contest type
		lastOccurrence[bestContestIndex] = currentDay;

		// Adjust the highest score based on cost factors and last occurrence
		for(var contestType = 0; contestType < 26; contestType++){
			highestScore -= costFactors[contestType] * (currentDay - lastOccurrence[contestType]);
		}

		// Calculate cumulative score for the current day
		if(currentDay === 1){
			dailyScores[currentDay - 1] = highestScore;
		} else {
			dailyScores[currentDay - 1] = highestScore + dailyScores[currentDay - 2];
		}
		
		logDebugInfo(highestScore); // Log the adjusted highest score for the day
	}
	// Output the final cumulative scores, each on a new line
	printResult(transformInput(dailyScores,9));
}
