const convertToInteger = (valStr) => Number.parseInt(valStr, 10);

const mapStringsToNumbers = (stringArray) => stringArray.map(str => convertToInteger(str));

function initiateProcessing(rawDataContent) {
    // Input parsing and initial data extraction
    const dataLines = rawDataContent.split('\n').filter(line => line.length > 0);

    if (dataLines.length < 2) {
        console.error("Error: Insufficient input data. Expected at least two lines.");
        return;
    }

    const firstLineSegments = dataLines[0].split(/\s+/);
    if (firstLineSegments.length < 2) {
        console.error("Error: First line malformed. Expected two numbers.");
        return;
    }
    const [elementCount, controlFactor] = mapStringsToNumbers(firstLineSegments);

    if (Number.isNaN(elementCount) || Number.isNaN(controlFactor)) {
        console.error("Error: Invalid numeric input detected in the first line.");
        return;
    }

    const secondLineSegments = dataLines[1].split(/\s+/);
    const numericSequence = mapStringsToNumbers(secondLineSegments);

    if (numericSequence.some(isNaN) || numericSequence.length !== elementCount) {
        console.error("Error: Numeric sequence contains non-numeric values or count mismatch.");
        return;
    }

    // Calculate prefix sums
    const prefixSums = new Array(elementCount);
    if (elementCount > 0) {
        prefixSums[0] = numericSequence[0];
        for (let j = 1; j < elementCount; ++j) {
            prefixSums[j] = numericSequence[j] + prefixSums[j - 1];
        }
    } else {
        // Handle case where elementCount is 0, though problem constraints usually prevent this
        console.log(0); // Or throw error, depending on desired behavior for empty sequence
        return;
    }

    // Initialize the primary accumulated value
    let finalAccumulatedValue = elementCount * controlFactor + controlFactor;

    // Main processing loop, iterating in reverse
    let groupCounter = 0;
    for (let reverseIndex = elementCount - 1; reverseIndex >= 0; --reverseIndex) {
        groupCounter++;

        // Evaluate the conditional logic
        const isGroupSizeSignificant = groupCounter > 2;
        const leftSideOfComparison = controlFactor;
        const currentPrefixSum = prefixSums[reverseIndex];
        const currentElementValue = numericSequence[reverseIndex];

        const rightSideTerm1 = currentPrefixSum * (groupCounter - 1) * 2;
        const rightSideTerm2 = currentElementValue * 2;
        const rightSideOfComparison = rightSideTerm1 - rightSideTerm2;

        if (isGroupSizeSignificant && (leftSideOfComparison < rightSideOfComparison)) {
            groupCounter = 1;
            finalAccumulatedValue += controlFactor;
        }

        // Apply the accumulation formula
        const maxOfGroupOrTwo = Math.max(groupCounter, 2);
        const factorCalculation = maxOfGroupOrTwo * 2 + 1;
        finalAccumulatedValue += currentElementValue * factorCalculation;
    }
    
    // Output the final computed result
    console.log(finalAccumulatedValue.toString());
}

// Entry point for execution
initiateProcessing(require("node:fs").readFileSync("/dev/stdin", { encoding: "utf8" }));