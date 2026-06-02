"use strict";

/**
 * Analyzes input data to determine the range of distinct color categories.
 * @param {string} inputContent - The raw string input, typically from standard input.
 */
const processInputData = (inputContent) => {
    // Divide the input string into an array of lines.
    inputContent = inputContent.split("\n");

    // Parse the first line, which represents the total number of items.
    // Although 'initialCount' is not directly used in the subsequent logic,
    // its parsing maintains the original input processing structure.
    const initialCount = parseInt(inputContent[0], 10);

    // Process the second line: split by spaces and convert each part to an integer.
    const scoreValues = inputContent[1].split(" ").map(val => parseInt(val, 10));

    // Initialize a counter for scores that exceed all predefined color thresholds.
    let overflowCount = 0;

    // Define an object to track which color categories have been encountered.
    // Each property represents a color, initialized to 'false' (not present).
    const colorStatus = {
        grey:   false,   // For scores less than 400
        brown:  false,   // For scores less than 800
        green:  false,   // For scores less than 1200
        mizu:   false,   // For scores less than 1600 (a light blue/aqua color)
        blue:   false,   // For scores less than 2000
        yellow: false,   // For scores less than 2400
        orange: false,   // For scores less than 2800
        red:    false    // For scores less than 3200
    };

    // Iterate through each score value to categorize it.
    for (let idx in scoreValues) {
        const currentScore = scoreValues[idx]; // Retrieve the score at the current index.

        // Assign the score to its corresponding color category based on thresholds.
        if (currentScore < 400) {
            colorStatus.grey = true;
        } else if (currentScore < 800) {
            colorStatus.brown = true;
        } else if (currentScore < 1200) {
            colorStatus.green = true;
        } else if (currentScore < 1600) {
            colorStatus.mizu = true;
        } else if (currentScore < 2000) {
            colorStatus.blue = true;
        } else if (currentScore < 2400) {
            colorStatus.yellow = true;
        } else if (currentScore < 2800) {
            colorStatus.orange = true;
        } else if (currentScore < 3200) {
            colorStatus.red = true;
        } else {
            // If the score is 3200 or higher, it's considered an 'overflow' score.
            overflowCount++;
        }
    }

    // Count the number of distinct color categories that were marked as 'true'.
    const activeColorTypes = Object.keys(colorStatus).filter(colorName => colorStatus[colorName] === true).length;

    // Determine the minimum possible number of distinct categories.
    // If no specific color categories are present, but there are overflow scores,
    // then at least one category (representing the overflow) is considered.
    const minPossible = activeColorTypes === 0 ? 1 : activeColorTypes;

    // Determine the maximum possible number of distinct categories.
    // This is the sum of the specific color categories found and the overflow scores.
    const maxPossible = activeColorTypes + overflowCount;

    // Output the calculated minimum and maximum values, separated by a space.
    console.log(minPossible + " " + maxPossible);
};

// Read the entire content from standard input and pass it to the processing function.
processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
