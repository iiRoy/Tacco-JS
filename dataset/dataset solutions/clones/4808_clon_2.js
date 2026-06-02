'use strict';

/**
 * Processes raw input data to calculate adjusted times based on drink modifications.
 * This function reads problem durations and drink effects, then outputs the total time
 * for each drink scenario.
 * @param {string} rawData - The complete input string read from standard input.
 */
function ProcessInput(rawData) {
    // Split the entire input string into an array of individual lines.
    const lines = rawData.split('\n');

    // The first line contains the number of problems (N), which is not directly used in calculations.
    const numProblems = lines.shift();

    // The second line contains space-separated durations for each problem.
    // These are parsed into an array of numbers.
    const problemDurations = lines.shift().split(' ').map(durationString => Number(durationString));

    // The third line contains the number of drink modifications (M), also not directly used.
    const numDrinks = lines.shift();

    // The remaining lines describe each drink modification.
    // Each line is split into two numbers: problem index (P) and new duration (X).
    const drinkModifications = lines.map(drinkLine => drinkLine.split(' ').map(valueString => Number(valueString)));

    // A commented-out debug line, mirroring the original's behavior.
    // console.log(numProblems, problemDurations, numDrinks, drinkModifications);

    // Calculate the initial total time by summing up all original problem durations.
    let initialTotalTime = 0;
    for (const duration of problemDurations) {
        initialTotalTime += duration; // Add each problem's time to the running total.
    }

    // An array to store the calculated total times for each drink modification.
    const finalTimes = [];

    // Iterate through each drink modification entry.
    for (const drinkInfo of drinkModifications) {
        // drinkInfo[0] is the 1-based index of the problem to be modified.
        // drinkInfo[1] is the new duration for that specific problem.
        const targetProblemIndex = drinkInfo[0] - 1; // Convert to 0-based array index.
        const newProblemDuration = drinkInfo[1];

        // Calculate the difference between the original duration and the new duration for the modified problem.
        const timeDifference = problemDurations[targetProblemIndex] - newProblemDuration;

        // The adjusted total time is the initial total time minus this calculated difference.
        const adjustedTime = initialTotalTime - timeDifference;

        // Add the computed adjusted time to our collection of results.
        finalTimes.push(adjustedTime);
    }

    // Output each calculated adjusted time to the console, one per line.
    for (const outputTime of finalTimes) {
        console.log(outputTime);
    }
}

// Read the entire content of standard input synchronously and pass it to the processing function.
ProcessInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
