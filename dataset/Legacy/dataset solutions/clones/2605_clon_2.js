var inputReader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});
var dataProcessor;
var receivedLines = [];

// Event listener for each line of input
inputReader.on('line', function(currentLine) {
  receivedLines.push(currentLine);
});

// Event listener for when input stream closes
inputReader.on('close', function() {
  dataProcessor = setupInputProcessor(receivedLines); // Initialize the input handler
  console.error("\n"); // Print a newline to stderr for visual separation
  var processingStartTime = Date.now(); // Record start time for performance measurement
  executeGameLogic(); // Execute the main program logic
  var elapsedProcessingTime = Date.now() - processingStartTime; // Calculate elapsed time
  outputDebugInfo("time : " + (elapsedProcessingTime) + "ms"); // Log execution time
  outputDebugInfo("memory : " + Math.round(process.memoryUsage().heapTotal / 1024) + "KB"); // Log memory usage
});

/**
 * Creates a deep copy of an object.
 * @param {object} sourceObject - The object to copy.
 * @returns {object} A new object that is a deep copy of the source.
 */
function deepCopyObject(sourceObject) {
  return JSON.parse(JSON.stringify(sourceObject));
}

/**
 * Reads the next line of input and converts it to an integer.
 * @returns {number} The next integer from input.
 */
function readNextInteger() {
  return performConversion(fetchNextInput(), 1);
}

/**
 * Reads the next line of input and splits it into a string array.
 * @returns {string[]} An array of strings.
 */
function readNextStringArray() {
  return performConversion(fetchNextInput(), 2);
}

/**
 * Reads the next line of input, splits it, and converts elements to numbers.
 * @returns {number[]} An array of numbers.
 */
function readNextIntegerArray() {
  return performConversion(fetchNextInput(), 4);
}

/**
 * Reads the next line of input and splits it into a character array.
 * @returns {string[]} An array of characters.
 */
function readNextCharacterArray() {
  return performConversion(fetchNextInput(), 6);
}

/**
 * Fetches the next available line from the input processor.
 * @returns {string} The next line of input.
 */
function fetchNextInput() {
  return dataProcessor.next();
}

/**
 * Checks if there are more lines available in the input.
 * @returns {boolean} True if more input is available, false otherwise.
 */
function hasMoreInput() {
  return dataProcessor.hasNext();
}

/**
 * Initializes the input processing object.
 * @param {string[]} rawInputData - An array of raw input lines.
 * @returns {object} An object with methods to navigate input lines.
 */
function setupInputProcessor(rawInputData) {
  var processorInstance = {
    sourceDataLines: rawInputData,
    currentDataIndex: 0,
    totalDataLines: rawInputData.length,

    /**
     * Checks if there are more lines to process.
     * @returns {boolean} True if more lines exist, false otherwise.
     */
    hasNext: function() {
      return (this.currentDataIndex < this.totalDataLines);
    },

    /**
     * Retrieves the next line of input.
     * @returns {string} The next line.
     * @throws {string} If no more lines are available.
     */
    next: function() {
      if (!this.hasNext()) {
        throw "ArrayIndexOutOfBoundsException これ以上ないよ";
      } else {
        var fetchedLineContent = this.sourceDataLines[this.currentDataIndex];
        this.currentDataIndex++;
        return fetchedLineContent;
      }
    }
  };
  return processorInstance;
}

/**
 * Prints a message to standard output.
 * @param {*} message - The message to print.
 */
function displayResult(message) {
  console.log(message);
}

/**
 * Prints a debug message to standard error.
 * @param {*} debugMessage - The message to print.
 */
function outputDebugInfo(debugMessage) {
  console.error("debug:" + require("util").inspect(debugMessage, false, null));
}

/**
 * Performs various conversions on input values based on a specified mode.
 * @param {*} valueToProcess - The value to convert.
 * @param {number} conversionMode - The mode of conversion (1: int, 2: string array, etc.).
 * @returns {*} The converted value.
 */
function performConversion(valueToProcess, conversionMode) {
  try {
    switch (conversionMode) {
      case 1:
        return parseInt(valueToProcess);
      case 2:
        return valueToProcess.split(" ");
      case 4:
        return valueToProcess.split(" ").map(Number);
      case 6:
        return valueToProcess.split("");
      case 7:
        return valueToProcess.split("").map(Number);
      case 8:
        return valueToProcess.join(" ");
      case 9:
        return valueToProcess.join("\n");
      case 0:
        return valueToProcess.join("");
      default:
        return valueToProcess;
    }
  } catch (e) {
    return valueToProcess; // Return original value on error
  }
}

/**
 * Main function containing the game logic for scheduling matches.
 */
function executeGameLogic() {
  var playerCount = readNextInteger(); // Read the total number of players
  var playerMatchups = new Array(playerCount + 1); // Array to store each player's schedule, 1-indexed

  // Populate player schedules
  for (var playerIdx = 0; playerIdx < playerCount; playerIdx++) {
    playerMatchups[playerIdx + 1] = {
      scheduledOpponents: readNextIntegerArray(), // List of opponents for this player
      currentMatchupPointer: 0 // Pointer to the next opponent in their schedule
    };
  }

  var dayCount = 0; // Counter for the number of days (rounds)
  var completedPlayers = new Set(); // Set of players who have finished all their matches

  // Main loop for simulating days
  while (true) {
    var playersMatchedToday = new Set(); // Set of players who have played a match on the current day
    var anyMatchOccurred = false; // Flag to track if any matches were made on this iteration

    // Iterate through each player to schedule matches for the current day
    for (var playerIdx = 1; playerIdx <= playerCount; playerIdx++) {
      // Skip players who have completed all matches or already played today
      if (completedPlayers.has(playerIdx) || playersMatchedToday.has(playerIdx)) {
        continue;
      }

      // Determine the potential opponent for the current player
      var potentialOpponent = playerMatchups[playerIdx].scheduledOpponents[playerMatchups[playerIdx].currentMatchupPointer];

      // Check if the potential opponent is available and hasn't completed their matches
      if (!playersMatchedToday.has(potentialOpponent) && !completedPlayers.has(potentialOpponent)) {
        // Verify if the potential opponent also has the current player scheduled next
        if (playerMatchups[potentialOpponent].scheduledOpponents[playerMatchups[potentialOpponent].currentMatchupPointer] === playerIdx) {
          // Both players agree to play, so increment their matchup pointers
          playerMatchups[playerIdx].currentMatchupPointer++;
          playerMatchups[potentialOpponent].currentMatchupPointer++;

          // Add both players to the set of players who matched today
          playersMatchedToday.add(playerIdx);
          playersMatchedToday.add(potentialOpponent);

          // Check if the current player has completed all their matches
          if (playerMatchups[playerIdx].currentMatchupPointer >= playerCount - 1) {
            completedPlayers.add(playerIdx);
          }
          // Check if the potential opponent has completed all their matches
          if (playerMatchups[potentialOpponent].currentMatchupPointer >= playerCount - 1) {
            completedPlayers.add(potentialOpponent);
          }
          anyMatchOccurred = true; // Mark that at least one match occurred today
        }
      }
    }

    // If no matches occurred today
    if (!anyMatchOccurred) {
      // If all players have completed their matches, output the total day count
      if (completedPlayers.size === playerCount) {
        displayResult(dayCount);
      } else {
        // Otherwise, it's impossible to complete all matches, output -1
        displayResult(-1);
      }
      return; // End the game logic
    }
    dayCount++; // Increment the day counter for the next round
  }
}
