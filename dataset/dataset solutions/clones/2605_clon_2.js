// This section contains internal utility functions and should not be modified.
var inputProcessor = require('readline').createInterface({
    input:  process.stdin,
    output: process.stdout
});
var dataParser;
var rawInputLines = [];

inputProcessor.on('line', function (lineData) {
    rawInputLines.push(lineData);
});

inputProcessor.on('close', function () {
    dataParser = initializeParser(rawInputLines);
    console.error("\n"); // Output a newline to stderr for visual separation

    var commenceTime = Date.now();
    executePrimaryLogic();
    var durationMillis = Date.now() - commenceTime;

    logError("execution_time : " + (durationMillis) + "ms");
    logError("memory_usage : " + Math.round(process.memoryUsage().heapTotal / 1024) + "KB");
});

// Creates a deep copy of an object using JSON serialization/deserialization.
function deepCopyObject(originalObject) {
    return JSON.parse(JSON.stringify(originalObject));
}

// Retrieves and converts the next input entry.
function retrieveInteger() {
    return convertInput(fetchNextEntry(), 1);
}

function retrieveStringArray() {
    return convertInput(fetchNextEntry(), 2);
}

function retrieveIntegerArray() {
    return convertInput(fetchNextEntry(), 4);
}

function retrieveCharacterArray() {
    return convertInput(fetchNextEntry(), 6);
}

function fetchNextEntry() {
    return dataParser.fetchNextEntry();
}

function moreEntriesExist() {
    return dataParser.moreEntriesExist();
}

// Initializes the data parser utility.
function initializeParser(inputData) {
    var parserInstance = {
        dataCollection: inputData,
        currentPosition: 0,
        maximumCount: inputData.length,

        moreEntriesExist: function () {
            return (this.currentPosition < this.maximumCount);
        },

        fetchNextEntry: function () {
            if (!this.moreEntriesExist()) {
                throw "InputBoundsExceededException No further entries available.";
            } else {
                var currentEntryValue = this.dataCollection[this.currentPosition];
                this.currentPosition++;
                return currentEntryValue;
            }
        }
    };
    return parserInstance;
}

// Outputs a message to standard output.
function outputResult(messageContent) {
    console.log(messageContent);
}

// Outputs a debug message to standard error.
function logError(messageContent) {
    console.error("debug_info:" + require("util").inspect(messageContent, false, null));
}

// Handles various input conversion types.
// Parameter 'conversionType':
//  - Default/Unknown: Returns input as is.
//  - 1: Converts to integer.
//  - 2: Splits by space into a string array.
//  - 4: Splits by space into a number array.
//  - 6: Splits by character into a string array.
//  - 7: Splits by character into a number array.
//  - 8: Joins array elements with space.
//  - 9: Joins array elements with newline.
//  - 0: Joins array elements without separator.
function convertInput(inputValue, conversionType) {
    try {
        switch (conversionType) {
            case 1:
                return parseInt(inputValue);
            case 2:
                return inputValue.split(" ");
            case 4:
                return inputValue.split(" ").map(Number);
            case 6:
                return inputValue.split("");
            case 7:
                return inputValue.split("").map(Number);
            case 8:
                return inputValue.join(" ");
            case 9:
                return inputValue.join("\n");
            case 0:
                return inputValue.join("");
            default:
                return inputValue;
        }
    } catch (exceptionDetails) {
        return inputValue;
    }
}

// End of utility functions.
// ----------------------------------------------------------------------------------------------------

function executePrimaryLogic() {
    var playerCount = retrieveInteger(); // Read the total number of participants.

    // Initialize an array to store each player's schedule.
    var playerSchedule = new Array(playerCount + 1);

    // Populate each player's schedule with their opponent sequence.
    for (var playerIdx = 0; playerIdx < playerCount; playerIdx++) {
        playerSchedule[playerIdx + 1] = {
            opponentSequence: retrieveIntegerArray(), // The list of opponents for this player.
            currentOpponentPtr: 0 // Pointer to the next opponent in their sequence.
        };
    }

    var dayCounter = 0; // Tracks the number of days passed.
    var finishedPlayers = new Set(); // Stores players who have completed all their matches.

    // Main simulation loop for match days.
    while (true) {
        var dailyBattles = new Set(); // Players who have already competed on the current day.
        var anyMatchOccurred = false; // Flag to check if any matches took place today.
                                     // If no matches take place on a given day, the simulation concludes.

        // Iterate through all players to arrange matches for the current day.
        for (var currentPlayer = 1; currentPlayer <= playerCount; currentPlayer++) {
            // Skip players who have finished all matches or already battled today.
            if (finishedPlayers.has(currentPlayer) || dailyBattles.has(currentPlayer)) {
                continue;
            }

            // Determine the prospective opponent for the current player.
            var prospectiveOpponent = playerSchedule[currentPlayer].opponentSequence[playerSchedule[currentPlayer].currentOpponentPtr];

            // Check if the prospective opponent is available and hasn't battled yet today.
            if (!dailyBattles.has(prospectiveOpponent) && !finishedPlayers.has(prospectiveOpponent)) {
                // Verify if the prospective opponent also lists the current player as their next opponent.
                if (playerSchedule[prospectiveOpponent].opponentSequence[playerSchedule[prospectiveOpponent].currentOpponentPtr] === currentPlayer) {
                    // Both players agree to play; increment their opponent pointers.
                    playerSchedule[currentPlayer].currentOpponentPtr++;
                    playerSchedule[prospectiveOpponent].currentOpponentPtr++;

                    // Add both players to the list of those who battled today.
                    dailyBattles.add(currentPlayer);
                    dailyBattles.add(prospectiveOpponent);

                    // Check if the current player has completed all their matches.
                    if (playerSchedule[currentPlayer].currentOpponentPtr >= playerCount - 1) {
                        finishedPlayers.add(currentPlayer);
                    }
                    // Check if the prospective opponent has completed all their matches.
                    if (playerSchedule[prospectiveOpponent].currentOpponentPtr >= playerCount - 1) {
                        finishedPlayers.add(prospectiveOpponent);
                    }

                    anyMatchOccurred = true; // A match has occurred today.
                }
            }
        }

        // If no matches occurred today, evaluate the state of the simulation.
        if (!anyMatchOccurred) {
            if (finishedPlayers.size === playerCount) {
                // All players finished their matches successfully.
                outputResult(dayCounter);
            } else {
                // Not all players finished, indicating an impossible schedule.
                outputResult(-1);
            }
            return; // Exit the simulation.
        }

        dayCounter++; // Increment the day counter as matches occurred.
    }
}