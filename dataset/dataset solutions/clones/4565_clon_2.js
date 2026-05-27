function parseInteger(strValue) {
    // Converts a string to an integer.
    return parseInt(strValue);
}

function parseFloatValue(strValue) {
    // Converts a string to a floating-point number.
    return parseFloat(strValue);
}

function isEven(numValue) {
    // Checks if a number is even.
    return (numValue % 2) === 0;
}

function isOdd(numValue) {
    // Checks if a number is odd.
    return (numValue % 2) === 1;
}

// Extend Array prototype for custom sorting and filtering.
Array.prototype.sortNumbersAscending = function () {
    // Sorts array elements numerically in ascending order.
    return this.sort((valA, valB) => (valA - valB));
};

Array.prototype.sortNumbersDescending = function () {
    // Sorts array elements numerically in descending order.
    return this.sort((valA, valB) => (valB - valA));
};

Array.prototype.sortStringsAscending = function () {
    // Sorts array elements as strings in ascending order.
    return this.sort();
};

Array.prototype.sortStringsDescending = function () {
    // Sorts array elements as strings in descending order.
    return this.sort().reverse();
};

Array.prototype.filterOut = function (excludedElement) {
    // Returns a new array with all occurrences of `excludedElement` removed.
    return this.filter(currentElement => currentElement !== excludedElement);
};

/**
 * Main function to process input lines and calculate the minimum difference.
 * @param {string[]} inputLines - An array of strings, where each string is a line of input.
 */
function processInput(inputLines) {
    // Parse the first line to get initial dimensions.
    const dimensionsArray = inputLines[0].split(' ').map(parseInteger);

    let heightVal = dimensionsArray[0]; // First dimension, typically height.
    let widthVal = dimensionsArray[1];  // Second dimension, typically width.

    let minimumDifference = Infinity; // Initialize with a very large value.

    // Loop through two possible orientations (H, W) or (W, H).
    for (let orientationIndex = 0; orientationIndex < 2; orientationIndex++) {
        // Determine current dimensions based on orientation.
        const currentDimensions = (orientationIndex === 0) ? [widthVal, heightVal] : [heightVal, widthVal];

        // Loop through two ways to split the first dimension.
        for (let splitTypeIndex = 0; splitTypeIndex < 2; splitTypeIndex++) {
            // Calculate the first split point.
            const firstSplitDim = Math.round(currentDimensions[0] / 3);
            const remainingDim = currentDimensions[0] - firstSplitDim;

            // Calculate the area of the first piece.
            const areaOne = firstSplitDim * currentDimensions[1];

            // Determine sub-dimensions for the remaining part.
            const subDimensions = (splitTypeIndex === 0) ? [remainingDim, currentDimensions[1]] : [currentDimensions[1], remainingDim];

            // Calculate the second split point for the remaining part.
            const secondSplitDim = Math.round(subDimensions[0] / 2);
            const lastRemainingDim = subDimensions[0] - secondSplitDim;

            // Calculate areas of the second and third pieces.
            const areaTwo = secondSplitDim * subDimensions[1];
            const areaThree = lastRemainingDim * subDimensions[1];

            // Sort the three calculated areas in descending order.
            const sortedAreas = [areaOne, areaTwo, areaThree].sortNumbersDescending();

            // Update the minimum difference found so far.
            minimumDifference = Math.min(minimumDifference, (sortedAreas[0] - sortedAreas[2]));
        }
    }

    // Output the final minimum difference.
    console.log(minimumDifference);
}

// Read input from stdin, process it, and call the main function.
processInput(require("fs").readFileSync("/dev/stdin", "utf8").split('\n').map(l => l.trim()));
