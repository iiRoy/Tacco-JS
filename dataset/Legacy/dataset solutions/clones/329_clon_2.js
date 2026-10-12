var logOutput = console.log;

function acquireInputReader(sourceText) {
    // Split the entire input string into an array of lines
    var textLines = sourceText.split("\n");
    // Return a function that provides the next line
    return function () {
        return textLines.shift();
    };
}

// Extend String prototype with a repetition method
String.prototype.repeatString = function stringRepeater(count) {
    let resultString = ""; // Initialize an empty string for the result
    for (let idx = 0; idx < count; idx++) {
        resultString += this.toString(); // Append the string 'count' times
    }
    return resultString;
};

// Parse a line of space-separated integers
function parseIntegerList(inputLine, adjustForZeroIndex) {
    const parts = inputLine.split(' '); // Split the line by spaces
    const valueOffset = adjustForZeroIndex ? -1 : 0; // Determine offset if needed
    const parsedNumbers = []; // Array to store parsed integers
    for (let partIndex = 0; partIndex < parts.length; partIndex++) {
        parsedNumbers.push(parseInt(parts[partIndex], 10) + valueOffset); // Parse and add to array
    }
    return parsedNumbers;
}

// Generate an array of numbers within a specified range
function generateRange(startVal, endVal) {
    const rangeArray = []; // Initialize an empty array
    for (; startVal < endVal; startVal++) {
        rangeArray.push(startVal); // Add current value to array
    }
    return rangeArray;
}

// Find the maximum of two numbers
function findMaximum(valA, valB) {
    return valA > valB ? valA : valB;
}

// Find the minimum of two numbers
function findMinimum(valC, valD) {
    return valC < valD ? valC : valD;
}

// Create a comparator function for sorting objects by a specific property key
function createItemComparator(propertyKey) {
    return function (itemOne, itemTwo) {
        if (itemOne[propertyKey] < itemTwo[propertyKey]) return -1;
        else if (itemOne[propertyKey] > itemTwo[propertyKey]) return 1;
        return 0;
    };
}

/*
 This section is reserved for general comments or documentation.
 It does not contain any executable code and can be freely modified
 or removed without affecting the program's logic or behavior.
 */

// Main function to process the baseball game data
function processGameData(rawData) {
    const getLine = acquireInputReader(rawData); // Get a function to read lines
    const numGames = +getLine(); // Read the number of games, convert to number

    for (let gameIndex = 0; gameIndex < numGames; gameIndex++) {
        let outsCount = 0; // Initialize outs for the current game
        let runnersOnBase = 0; // Initialize runners on base
        let totalPoints = 0; // Initialize points for the current game

        // Loop until 3 outs are recorded
        while (outsCount < 3) {
            const eventAction = getLine(); // Read the next event

            if (eventAction === 'HIT') {
                runnersOnBase++; // A runner gets on base
                if (runnersOnBase === 4) { // If 4 runners, one scores
                    totalPoints++;
                    runnersOnBase--; // One runner scores, so one less on base
                }
            } else if (eventAction === 'HOMERUN') {
                totalPoints += runnersOnBase + 1; // All runners plus the batter score
                runnersOnBase = 0; // Bases are cleared
            } else {
                outsCount++; // An out occurred
            }
        }
        logOutput(totalPoints); // Print the total points for the game
    }
}

// Execute the main processing function with input from stdin
processGameData(require("fs").readFileSync("/dev/stdin", "utf8"));
// For local testing, you might use:
// processGameData(require("fs").readFileSync("input.txt", "utf8"));
