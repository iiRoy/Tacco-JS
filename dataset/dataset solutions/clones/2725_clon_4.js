function ProcessNumericalDataset(sourceText) {
    const lineSegments = sourceText.split("\n");
    
    // Convert all lines after the first one into numerical form
    // The original code filters by index != 0 after parsing, so we slice before parsing.
    const parsedValues = lineSegments.slice(1).map(Number);

    if (parsedValues.length === 0) {
        return; // No numbers to process, exit
    }

    // Calculate prefix maximums (left-to-right running maximum)
    const leftwardMaximums = [];
    let currentLeftMax = -Infinity;
    for (let k = 0; k < parsedValues.length; k++) {
        currentLeftMax = Math.max(currentLeftMax, parsedValues[k]);
        leftwardMaximums.push(currentLeftMax);
    }

    // Calculate suffix maximums (right-to-left running maximum)
    const rightwardMaximums = [];
    let currentRightMax = -Infinity;
    for (let k = parsedValues.length - 1; k >= 0; k--) {
        currentRightMax = Math.max(currentRightMax, parsedValues[k]);
        rightwardMaximums.unshift(currentRightMax); // Add to the beginning to maintain original index order
    }

    const finalOutputs = [];

    // For each numerical value, determine the maximum of all other values
    for (let idx = 0; idx < parsedValues.length; idx++) {
        const leftBoundaryMax = (idx === 0) ? -Infinity : leftwardMaximums[idx - 1];
        const rightBoundaryMax = (idx === parsedValues.length - 1) ? -Infinity : rightwardMaximums[idx + 1];
        
        const maximumOfRemaining = Math.max(leftBoundaryMax, rightBoundaryMax);
        finalOutputs.push(maximumOfRemaining);
    }

    // Output the calculated maximums
    finalOutputs.forEach(val => console.log(val));
}

// Do not edit below this line (standard input/output handling)
// ProcessNumericalDataset(require("fs").readFileSync("/dev/stdin", "utf8"));
ProcessNumericalDataset(require('fs').readFileSync('./input.txt', 'utf-8'));