'use strict';

const parseSpaceSeparatedNumbers = (lineContent) => {
    return lineContent.split(' ').map(Number);
};

const processCompetitionData = (fullInputString) => {
    const NO_VALID_OPTION_CODE = 1001; // Constant for the sentinel value

    const allInputLines = fullInputString.split('\n');

    // Extract and parse the first line containing item count and time limit
    const [totalItemCount, maximumAllowedTime] = parseSpaceSeparatedNumbers(allInputLines[0]);

    // Slice the array to get only the lines describing each item
    const itemDescriptionLines = allInputLines.slice(1, totalItemCount + 1);

    let currentMinimumCost = NO_VALID_OPTION_CODE;
    let foundAnyValidItem = false; // Flag to track if any item met the criteria

    // Iterate through each item's description
    for (const itemLine of itemDescriptionLines) {
        const [itemCost, itemTime] = parseSpaceSeparatedNumbers(itemLine);

        // Evaluate conditions for the current item
        const isTimeAcceptable = itemTime < maximumAllowedTime;
        const isCostLowerThanCurrentMin = itemCost < currentMinimumCost;

        if (isTimeAcceptable) {
            // If the item is within the time limit, check its cost
            if (isCostLowerThanCurrentMin) {
                currentMinimumCost = itemCost;
                foundAnyValidItem = true; // Update flag as a valid item has been found
            }
        }
    }

    // Determine the final output based on whether a valid item was found
    if (foundAnyValidItem) {
        console.log(currentMinimumCost);
    } else {
        console.log('TLE'); // Time Limit Exceeded or no item met criteria
    }
};

processCompetitionData(require('fs').readFileSync('/dev/stdin', 'utf-8'));
