'use strict';

function ProcessContestData(rawData) {
    // This function processes competition data to calculate cumulative satisfaction scores.

    // Split the raw input string into individual lines for easier parsing.
    const parsedLines = rawData.trim().split('\n');

    // The first line contains the total number of competition days.
    const numDays = Number(parsedLines[0]);

    // The second line contains space-separated penalty costs for each contest type.
    const penaltyCosts = parsedLines[1].split(' ').map((item) => Number(item));

    // Subsequent lines (from index 2 up to 2 + numDays - 1) represent satisfaction scores.
    // Each inner array corresponds to a day, and its elements are scores for different contest types.
    const satisfactionMatrix = parsedLines
        .slice(2, 2 + numDays)
        .map((item) => item.split(' ').map((val) => Number(val)));

    // The last 'numDays' lines specify the contest type scheduled for each day.
    const dailyContestTypes = parsedLines.slice(-1 * numDays).map((item) => Number(item));

    // Initialize an array to keep track of the most recent day each contest type was held.
    // There are 26 contest types (0-25), initialized to day 0 (before the competition starts).
    let lastHeldDay = Array(26).fill(0);

    // Initialize an array to store the calculated satisfaction or penalty for each contest type
    // on the current processing day.
    let currentDayScores = Array(26).fill(0);

    // This variable will accumulate the total satisfaction score over all days.
    let totalScore = 0;

    // Iterate through each day of the competition, from day 1 up to 'numDays'.
    for (let dayIndex = 1; dayIndex <= numDays; dayIndex++) {
        // Update the 'lastHeldDay' for the contest type scheduled for the current 'dayIndex'.
        // Note: Contest types are 1-indexed in input, so we adjust to 0-indexed for array access.
        lastHeldDay[dailyContestTypes[dayIndex - 1] - 1] = dayIndex;

        // Calculate the scores (satisfaction or penalty) for all contest types for the current day.
        for (let contestTypeIndex = 0; contestTypeIndex < penaltyCosts.length; contestTypeIndex++) {
            if (lastHeldDay[contestTypeIndex] === dayIndex) {
                // If the current contest type was held on 'dayIndex', its score is directly from the satisfaction matrix.
                currentDayScores[contestTypeIndex] = satisfactionMatrix[dayIndex - 1][contestTypeIndex];
            } else {
                // If the contest type was NOT held today, a penalty is incurred.
                // The penalty is calculated based on the cost and the number of days since it was last held.
                currentDayScores[contestTypeIndex] = penaltyCosts[contestTypeIndex] * (dayIndex - lastHeldDay[contestTypeIndex]) * -1;
            }
        }

        // Sum up all the individual contest type scores for the current day and add to the running total.
        totalScore += currentDayScores.reduce((accumulator, currentValue) => accumulator + currentValue);

        // Output the cumulative total score after processing each day.
        console.log(String(totalScore));
    }

    // The function completes its execution after processing all days.
    return;
}

// Read the entire input from standard input and pass it to the processing function.
ProcessContestData(require('fs').readFileSync('/dev/stdin', 'utf8'));
