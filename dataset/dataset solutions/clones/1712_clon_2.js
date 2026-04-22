"use strict";

// This section handles reading input from standard input.
const dataSource = require("fs").readFileSync("/dev/stdin", "utf8");

// Initialize an array of tokens and a pointer to the current token.
let tokenStream = dataSource.split(/ |\n/);
let tokenIndex = 0;

// Retrieves the subsequent numeric token from the stream.
function getNextNumber() {
    return +tokenStream[tokenIndex++];
}

// Retrieves the subsequent string token from the stream.
function getNextString() {
    return tokenStream[tokenIndex++];
}

// Retrieves the subsequent BigInt token from the stream.
function getNextBigInt() {
    return BigInt(tokenStream[tokenIndex++]);
}

// Fetches an array of specified 'count' items, converting to numbers unless 'isString' is true.
function getNumbersArray(count, isString) {
    if (isString) {
        return tokenStream.slice(tokenIndex, tokenIndex += count);
    } else {
        return tokenStream.slice(tokenIndex, tokenIndex += count).map(value => +value);
    }
}

// Reads a matrix of 'height' rows and 'width' columns from the token stream.
function getMatrix(height, width, isString) {
    let resultMatrix = [];
    let rowIndex = 0;
    if (isString) {
        for (; rowIndex < height; rowIndex++) {
            resultMatrix.push(tokenStream.slice(tokenIndex, tokenIndex += width));
        }
    } else {
        for (; rowIndex < height; rowIndex++) {
            resultMatrix.push(tokenStream.slice(tokenIndex, tokenIndex += width).map(value => +value));
        }
    }
    return resultMatrix;
}

// Generates a multi-dimensional array dynamically based on provided dimensions and an initial value.
function createMultiDimArray(initialValue) {
    const dimensions = arguments;
    let lengthCounter = dimensions.length;
    let arrayExpression = `Array(dimensions[${--lengthCounter}]).fill().map(_ => { return ${initialValue}; })`;
    while (--lengthCounter) {
        arrayExpression = `Array(dimensions[${lengthCounter}]).fill().map(_ => ${arrayExpression})`;
    }
    return eval(arrayExpression); // Executes the constructed string as JavaScript code.
}


// Global variable to accumulate the final result score.
let totalScore = 0;

// Execute the primary logic of the program and store its return value.
const programOutput = executeProgram();

// Output the program's result if it produced any meaningful data.
if (programOutput !== undefined) {
    console.log(String(programOutput));
}

// console.debug("Final calculated score:", totalScore); // A debugging statement, currently inactive.


// The core function encapsulating the main algorithm.
function executeProgram() {
    const numDays = getNextNumber(); // The total duration in days (e.g., 365).
    const numContests = 26; // A fixed constant representing the number of available competition types.
    const costArray = getNumbersArray(numContests); // Read the initial cost/penalty associated with each contest type.

    // An array to track the last day a particular contest was chosen, initialized to zero.
    let lastDayArray = createMultiDimArray(0, numContests);
    const contestChoices = []; // This array will store the selected contest for each day.

    // Iterate through each day of the competition period.
    for (let dayCounter = 0; dayCounter < numDays; dayCounter++) {
        const dayScores = getNumbersArray(numContests); // Read the potential scores for each contest on the current day.
        let maxScoreToday = -1_000_000_000; // Initialize the maximum score found for the current day to a very low value.
        let chosenContestIndex = 0; // Initialize the index of the best contest for this day.

        // Iterate through each available contest type.
        for (let contestIndex = 0; contestIndex < numContests; contestIndex++) {
            lastDayArray[contestIndex] -= costArray[contestIndex]; // Adjust the last day tracking based on its cost.
            // Calculate the potential score if this contest were chosen today.
            const currentScoreCalc = dayScores[contestIndex] - lastDayArray[contestIndex] + costArray[contestIndex];

            // If the current contest yields a higher potential score, update the maximum and the chosen index.
            if (maxScoreToday < currentScoreCalc) {
                maxScoreToday = currentScoreCalc;
                chosenContestIndex = contestIndex;
            }
        }

        // Record the 1-indexed chosen contest for the current day.
        contestChoices[dayCounter] = chosenContestIndex + 1;
        lastDayArray[chosenContestIndex] = 0; // Reset the last day for the chosen contest.
        totalScore += dayScores[chosenContestIndex]; // Add the score of the chosen contest to the global total.

        // Incorporate accumulated penalties/bonuses from all contests into the total score.
        for (let contestIndex = 0; contestIndex < numContests; contestIndex++) {
            totalScore += lastDayArray[contestIndex];
        }
    }
    // Return the list of chosen contests, joined by newlines for output.
    return contestChoices.join("\n");
}