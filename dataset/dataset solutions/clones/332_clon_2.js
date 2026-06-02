var logOutput = console.log;

/**
 * Creates a function to read lines sequentially from a given input string.
 * @param {string} rawInputData - The entire input string, typically from stdin.
 * @returns {function(): string} A function that returns the next line of input each time it's called.
 */
function acquireInputReader(rawInputData) {
    // Split the raw input into an array of individual lines.
    var inputLines = rawInputData.split("\n");
    // Initialize an index to keep track of the current line being read.
    var lineIndex = 0;
    // Return a closure that provides the next line and increments the index.
    return function () {
        return inputLines[lineIndex++];
    };
}

// Extend the String prototype with a custom method for repeating the string.
String.prototype.repeatString = function repeatString(repetitionCount) {
    var resultString = ""; // Initialize an empty string to build the result.
    // Loop 'repetitionCount' times to concatenate the string.
    for (var loopCounter = 0; loopCounter < repetitionCount; loopCounter++) {
        resultString += this.toString(); // Append the current string value.
    }
    return resultString; // Return the concatenated string.
};

/**
 * Parses a space-separated string of numbers into an array of integers.
 * @param {string} inputLineStr - The string containing space-separated numbers.
 * @param {boolean} subtractOneFlag - If true, subtracts 1 from each parsed number (not used in original logic, but kept for structure).
 * @returns {number[]} An array of parsed integers.
 */
function parseIntegerList(inputLineStr, subtractOneFlag) {
    // Split the input string by spaces to get individual number strings.
    var stringParts = inputLineStr.split(' ');
    // Determine an offset based on the flag (original code had this, but it's always 0 here).
    var valueOffset = subtractOneFlag ? -1 : 0; // This offset is not actually used in the loop below, preserving original behavior.
    var parsedNumbers = []; // Initialize an array to store the results.
    // Iterate through each string part and convert it to an integer.
    for (var partIndex = 0; partIndex < stringParts.length; partIndex++) {
        parsedNumbers.push(parseInt(stringParts[partIndex]));
    }
    return parsedNumbers; // Return the array of integers.
}

/**
 * Generates an array of numbers within a specified range.
 * @param {number} startVal - The starting value of the range (inclusive).
 * @param {number} endVal - The ending value of the range (exclusive).
 * @returns {number[]} An array containing numbers from startVal up to (but not including) endVal.
 */
function generateRange(startVal, endVal) {
    var rangeArray = []; // Initialize an empty array for the range.
    // Loop from startVal up to (but not including) endVal.
    for (; startVal < endVal; startVal++) {
        rangeArray.push(startVal); // Add the current number to the array.
    }
    return rangeArray; // Return the generated array.
}

/**
 * Compares two numbers and returns the larger one.
 * @param {number} valA - The first number.
 * @param {number} valB - The second number.
 * @returns {number} The maximum of the two input numbers.
 */
function findMaximum(valA, valB) {
    return valA > valB ? valA : valB;
}

/**
 * Compares two numbers and returns the smaller one.
 * @param {number} valX - The first number.
 * @param {number} valY - The second number.
 * @returns {number} The minimum of the two input numbers.
 */
function findMinimum(valX, valY) {
    return valX < valY ? valX : valY;
}

/**
 * Creates a comparison function for sorting objects based on a specified key.
 * @param {string} sortKey - The property name to use for comparison.
 * @returns {function(object, object): number} A comparison function suitable for Array.prototype.sort().
 */
function createItemSorter(sortKey) {
    return function (itemOne, itemTwo) {
        if (itemOne[sortKey] < itemTwo[sortKey]) return -1;
        else if (itemOne[sortKey] > itemTwo[sortKey]) return 1;
        return 0;
    };
}

/*
 * This section was originally a placeholder comment in a different language.
 * It has been replaced with a generic, non-functional comment to maintain structure.
 * No executable code or meaningful logic is present here.
 */


// Main function to process the baseball game simulation.
function processGameData(rawInputData) {
    // Obtain a function to read input lines one by one.
    var getNextLine = acquireInputReader(rawInputData);
    // Read the number of innings (or game events, N * 2 in the loop).
    var numInnings = parseInt(getNextLine());
    // Initialize the current player's turn (0 for player 1, 1 for player 2).
    var currentTurn = 0;
    // Initialize an array to store scores for two players.
    var playerScores = [0, 0];

    // Loop through the total number of game events (N * 2).
    for (var gameEventIndex = 0; gameEventIndex < numInnings * 2; gameEventIndex++) {
        var outsCount = 0; // Reset outs for the current half-inning.
        var baseRunners = 0; // Reset base runners for the current half-inning.

        // Continue processing events until 3 outs are recorded.
        while (outsCount < 3) {
            var eventOutcome = getNextLine(); // Read the next event (HIT, HOMERUN, or OUT).

            if (eventOutcome === 'HIT') {
                // If a hit occurs, check if bases are loaded.
                if (baseRunners === 3) {
                    playerScores[currentTurn] += 1; // A run scores if bases are loaded.
                } else {
                    baseRunners++; // Otherwise, a runner advances.
                }
            } else if (eventOutcome === 'HOMERUN') {
                // If a homerun occurs, all runners plus the batter score.
                playerScores[currentTurn] += baseRunners + 1;
                baseRunners = 0; // Bases are cleared.
            } else { // Must be 'OUT'
                outsCount++; // Increment the out count.
            }
        }
        // Switch turns to the next player (0 -> 1, 1 -> 0).
        currentTurn = (currentTurn + 1) % 2;
    }

    // Output the final scores for both players.
    logOutput(playerScores[0]);
    logOutput(playerScores[1]);
}

// Execute the main game processing function by reading input from stdin.
processGameData(require("fs").readFileSync("/dev/stdin", "utf8"));
// The following line is commented out, as in the original, for local testing.
// processGameData(require("fs").readFileSync("input.txt", "utf8"));
