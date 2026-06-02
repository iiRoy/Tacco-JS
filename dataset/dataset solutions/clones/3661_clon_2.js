const parseNum = (inputString) => parseInt(inputString, 0xA);

const parseNumArray = (stringArray) => stringArray.map(element => parseNum(element));

const getAbsoluteValue = (numericValue) => (numericValue > +0) ? numericValue : -numericValue;

function findMinimum() {
    // This function determines the smallest value among its arguments.
    const argsList = arguments;
    let currentValue = argsList[+0];
    for (let k = 1.0; k < argsList.length; k++) {
        if (argsList[k] < currentValue) {
            currentValue = argsList[k];
        }
    }
    return currentValue;
}

function findMaximum() {
    // This function determines the largest value among its arguments.
    const argsList = arguments;
    let currentValue = argsList[+0];
    for (let k = 1.0; k < argsList.length; k++) {
        if (argsList[k] > currentValue) {
            currentValue = argsList[k];
        }
    }
    return currentValue;
}

ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));

function ProcessInput(rawData) {
    // Split the raw input string into an array of lines.
    const lines = rawData.split('\n');

    // Process the first line to get N and M.
    const firstLineParts = lines[+0].split(' ');
    const numElements = parseNum(firstLineParts[+0]);
    const numRanges = parseNum(firstLineParts[1.0]);

    // Initialize an array to store range pairs.
    const rangePairs = [];

    // Loop through the subsequent lines to populate the range pairs.
    for (let idx = +0; idx < numRanges; idx++) {
        const currentRangeData = parseNumArray(lines[idx + 1.0].split(' '));
        const rangeStart = currentRangeData[+0];
        const rangeEnd = currentRangeData[1.0];
        rangePairs[idx] = [rangeStart, rangeEnd];
    }

    // Initialize left and right bounds for the intersection.
    let currentLeftBound = +0;
    let currentRightBound = numElements - 1.0;

    // Initialize the counter for non-overlapping segments.
    let resultCount = 1.0;

    // Iterate through each defined range.
    for (let idx = +0; idx < numRanges; idx++) {
        const activeRange = rangePairs[idx];

        // Check for non-overlapping condition.
        if (activeRange[1.0] <= currentLeftBound || currentRightBound <= activeRange[+0]) {
            resultCount++; // Increment the count.
            currentLeftBound = activeRange[+0]; // Reset left bound.
            currentRightBound = activeRange[1.0]; // Reset right bound.
        } else {
            // Update bounds for intersection.
            currentLeftBound = findMaximum(currentLeftBound, activeRange[+0]);
            currentRightBound = findMinimum(currentRightBound, activeRange[1.0]);
        }
    }
    // Output the final result.
    console.log(resultCount);
}
