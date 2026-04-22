// This section handles input processing and foundational utilities.
// It's designed to abstract away I/O specifics and provide data conversion.

const DATA_TYPE_CONVERSION = {
  INTEGER: 1,
  STRING_ARRAY: 2,
  NUMERIC_ARRAY: 4,
  CHAR_ARRAY: 6,
  NUMERIC_CHAR_ARRAY: 7,
  JOIN_SPACE: 8,
  JOIN_NEWLINE: 9,
  JOIN_EMPTY: 0
};

// Input stream setup
const consoleInputInterface = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

let processedInputSystem; // Will hold the input reader instance
let rawInputLinesBuffer = []; // Accumulates lines from stdin

// Capture each line as it's received
consoleInputInterface.on('line', (currentLine) => {
  rawInputLinesBuffer.push(currentLine);
});

// Once all input is received, initialize the system and run the main logic
consoleInputInterface.on('close', () => {
  processedInputSystem = createInputReader(rawInputLinesBuffer); // Prepare input for consumption

  const startTimeMillis = Date.now();
  executeTournamentSimulation(); // Invoke the core application logic
  const durationMillis = Date.now() - startTimeMillis;

  // Output performance diagnostics
  logDiagnostic(`Execution time: ${durationMillis}ms`);
  const memoryUsageKB = Math.round(process.memoryUsage().heapTotal / 1024);
  logDiagnostic(`Memory footprint: ${memoryUsageKB}KB`);
});

/**
 * Factory function to create an input reader object.
 * Provides methods to check for available lines and retrieve the next one.
 * @param {string[]} sourceData - Array of input strings.
 * @returns {object} An object with methods for sequential input access.
 */
function createInputReader(sourceData) {
  if (!Array.isArray(sourceData) || sourceData.length === 0) {
    logDiagnostic("Warning: Input source data is empty or invalid.");
    return {
      hasMoreLines: () => false,
      retrieveNextLine: () => { throw new Error("No more input lines available."); }
    };
  }

  let currentLineCursor = 0;
  const totalLineCount = sourceData.length;

  return {
    /** Checks if there are more lines to read. */
    hasMoreLines: () => currentLineCursor < totalLineCount,
    /** Retrieves the next available input line. */
    retrieveNextLine: () => {
      if (!this.hasMoreLines()) {
        throw new Error("EndOfInputException: Attempted to read past available input.");
      }
      return sourceData[currentLineCursor++];
    }
  };
}

/**
 * Converts input value based on a specified type.
 * @param {string|string[]} valueToConvert - The input value or array to transform.
 * @param {number} conversionDirective - A constant from DATA_TYPE_CONVERSION specifying the target format.
 * @returns {*} The converted value.
 */
function applyDataConversion(valueToConvert, conversionDirective) {
  try {
    switch (conversionDirective) {
      case DATA_TYPE_CONVERSION.INTEGER:
        return parseInt(valueToConvert, 10); // Ensure base 10
      case DATA_TYPE_CONVERSION.STRING_ARRAY:
        return valueToConvert.split(" ");
      case DATA_TYPE_CONVERSION.NUMERIC_ARRAY:
        return valueToConvert.split(" ").map(Number);
      case DATA_TYPE_CONVERSION.CHAR_ARRAY:
        return valueToConvert.split("");
      case DATA_TYPE_CONVERSION.NUMERIC_CHAR_ARRAY:
        return valueToConvert.split("").map(Number);
      case DATA_TYPE_CONVERSION.JOIN_SPACE:
        return valueToConvert.join(" ");
      case DATA_TYPE_CONVERSION.JOIN_NEWLINE:
        return valueToConvert.join("\n");
      case DATA_TYPE_CONVERSION.JOIN_EMPTY:
        return valueToConvert.join("");
      default:
        logDiagnostic(`Unknown conversion directive: ${conversionDirective}. Returning original value.`);
        return valueToConvert;
    }
  } catch (error) {
    logDiagnostic(`Conversion error for value "${valueToConvert}" with directive ${conversionDirective}: ${error.message}`);
    return valueToConvert; // Return original on error
  }
}

// Simplified input reading functions
const fetchNumericValue = () => applyDataConversion(processedInputSystem.retrieveNextLine(), DATA_TYPE_CONVERSION.INTEGER);
const fetchNumericArray = () => applyDataConversion(processedInputSystem.retrieveNextLine(), DATA_TYPE_CONVERSION.NUMERIC_ARRAY);
// Note: Other fetch functions like fetchStringArray, fetchCharacterArray are omitted if not used in Main,
// demonstrating Type III removal of unused fragments.

/**
 * Prints the final result to standard output.
 * @param {*} dataToOutput - The data to be displayed.
 */
const printResult = (dataToOutput) => {
  console.log(dataToOutput);
};

/**
 * Logs a diagnostic message to standard error, useful for debugging.
 * @param {*} debugInfo - Information to log.
 */
const logDiagnostic = (debugInfo) => {
  console.error(`DEBUG: ${require("util").inspect(debugInfo, false, null)}`);
};


// Main application logic begins here.
// This function orchestrates the simulation of a tournament.
function executeTournamentSimulation() {
  const participantCount = fetchNumericValue();

  // Validate participant count
  if (participantCount < 1) {
    printResult(0); // If no participants, 0 days needed.
    return;
  }

  // Structure to hold each player's match schedule and current progress.
  // Using an array of objects for easier property access.
  const playerMatchData = Array.from({ length: participantCount + 1 }, () => ({
    matchSchedule: [],
    scheduleCursor: 0
  }));

  // Populate schedules for each participant.
  for (let playerIndex = 1; playerIndex <= participantCount; ++playerIndex) {
    playerMatchData[playerIndex].matchSchedule = fetchNumericArray();
  }

  let currentDay = 0;
  const completedPlayers = new Set(); // Tracks players who have finished all their matches.
  const requiredMatchesPerPlayer = participantCount - 1; // Each player needs to play N-1 matches.

  // Main simulation loop: continues until no matches can be played or all players are done.
  while (completedPlayers.size < participantCount) {
    const dailyEngagedPlayers = new Set(); // Players who have a match today.
    let anyMatchesToday = false; // Flag to check if at least one match occurred.

    // Iterate through all players to find potential matches for the current day.
    for (let pIdx = 1; pIdx <= participantCount; ++pIdx) {
      // Skip players who have already completed their schedule or are already engaged today.
      if (completedPlayers.has(pIdx) || dailyEngagedPlayers.has(pIdx)) {
        continue;
      }

      const currentPlayerInfo = playerMatchData[pIdx];

      // Ensure player has matches left in their schedule.
      if (currentPlayerInfo.scheduleCursor >= requiredMatchesPerPlayer) {
        completedPlayers.add(pIdx);
        continue;
      }

      const potentialOpponentId = currentPlayerInfo.matchSchedule[currentPlayerInfo.scheduleCursor];

      // Basic validation for opponent ID.
      if (potentialOpponentId === undefined || potentialOpponentId < 1 || potentialOpponentId > participantCount) {
        logDiagnostic(`Invalid opponent ID ${potentialOpponentId} for player ${pIdx}. Skipping.`);
        continue;
      }

      const opponentInfo = playerMatchData[potentialOpponentId];

      // Skip if opponent is already completed or engaged today.
      if (completedPlayers.has(potentialOpponentId) || dailyEngagedPlayers.has(potentialOpponentId)) {
        continue;
      }

      // Check for mutual match: Does the opponent's schedule also list the current player?
      if (opponentInfo.matchSchedule[opponentInfo.scheduleCursor] === pIdx) {
        // A match is confirmed!
        currentPlayerInfo.scheduleCursor++;
        opponentInfo.scheduleCursor++;

        dailyEngagedPlayers.add(pIdx);
        dailyEngagedPlayers.add(potentialOpponentId);
        anyMatchesToday = true;

        // Check if players have completed all required matches after this one.
        if (currentPlayerInfo.scheduleCursor >= requiredMatchesPerPlayer) {
          completedPlayers.add(pIdx);
        }
        if (opponentInfo.scheduleCursor >= requiredMatchesPerPlayer) {
          completedPlayers.add(potentialOpponentId);
        }
      }
    }

    // If no matches occurred today, the simulation might be stuck.
    if (!anyMatchesToday) {
      // If all players are completed, then the simulation ended successfully.
      if (completedPlayers.size === participantCount) {
        printResult(currentDay);
      } else {
        // Otherwise, it's an impossible scenario (stalemate).
        printResult(-1);
      }
      return; // Exit the simulation.
    }

    currentDay++; // Increment day counter as matches occurred.
  }

  // If the loop exits naturally, it means all players completed their matches.
  printResult(currentDay);
}