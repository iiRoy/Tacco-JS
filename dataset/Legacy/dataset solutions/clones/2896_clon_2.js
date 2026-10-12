function processInput(rawData) {
    // Split the raw input into individual lines
    const parsedLines = rawData.trim().split(/\r\n|\n/);

    // Parse the first line as the count of numbers to consider
    const countVal = parseInt(parsedLines[0], 10);

    // Process the lines representing shape dimensions
    // Each line is split, parsed as integers, and then sorted in ascending order
    const shapeDimensions = parsedLines.slice(1, parsedLines.length - 1).map(lineStr => {
        const dimValues = lineStr.split(" ").map((strVal) => parseInt(strVal, 10));
        return dimValues.sort((firstNum, secondNum) => firstNum - secondNum); // Sort sides for consistency
    });

    // Process the last line as the initial set of numbers
    // These numbers are sorted in descending order and then truncated
    let initialNumbers = parsedLines[parsedLines.length - 1].split(" ").map(strVal => parseInt(strVal, 10));
    initialNumbers.sort((firstNum, secondNum) => secondNum - firstNum); // Sort numbers descending
    initialNumbers = initialNumbers.splice(0, countVal); // Keep only the top 'countVal' numbers

    // Group the shape dimensions by their smallest side
    const dimensionGroups = {};
    for (let idx = 0; idx < shapeDimensions.length; idx++) {
        const currentSidePair = shapeDimensions[idx];
        if (!dimensionGroups[currentSidePair[0]]) {
            dimensionGroups[currentSidePair[0]] = [];
        }
        dimensionGroups[currentSidePair[0]].push(currentSidePair);
    }

    // Convert the grouped dimensions map into an array of arrays, then sort these groups
    let groupedDimensions = Object.keys(dimensionGroups).map(keyStr => dimensionGroups[keyStr]);
    groupedDimensions.sort((groupA, groupB) => {
        // Sort groups by their length in descending order
        return groupA.length < groupB.length;
    });

    // Flatten the sorted groups back into a single array of dimension pairs
    const orderedDimensions = groupedDimensions.reduce((accumulator, currentGroup) => {
        return accumulator.concat(currentGroup);
    }, []);

    // Initialize variables for the calculation
    let finalSum = 0;
    const sumComponents = []; // This variable is declared but not used, preserving original behavior.
    const dimensionCache = {}; // Cache to store assigned numbers for each dimension value
    let availableNumbers = initialNumbers.concat(); // Create a shallow copy of numbers to be consumed

    // Iterate through the ordered dimension pairs to calculate the final sum
    for (let loopIndex = 0; loopIndex < orderedDimensions.length; loopIndex++) {
        const currentDimensionPair = orderedDimensions[loopIndex];

        // Assign a number from 'availableNumbers' to the first dimension if not already cached
        if (!dimensionCache[currentDimensionPair[0]]) {
            dimensionCache[currentDimensionPair[0]] = availableNumbers.shift();
        }

        // Assign a number from 'availableNumbers' to the second dimension if not already cached
        if (!dimensionCache[currentDimensionPair[1]]) {
            dimensionCache[currentDimensionPair[1]] = availableNumbers.shift();
        }

        // Add the minimum of the two cached numbers for the current pair to the total sum
        const minimumValue = Math.min(dimensionCache[currentDimensionPair[0]], dimensionCache[currentDimensionPair[1]]);
        finalSum += minimumValue;
    }

    // Output the final sum and the original (modified) list of numbers
    console.log(finalSum + '\n' + initialNumbers.join(" "));
}

// Read input from stdin and pass it to the processing function
processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
