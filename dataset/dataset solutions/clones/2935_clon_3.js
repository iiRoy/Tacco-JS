// This module processes textual input to determine the size of the intersection
// of multiple numerical intervals defined within the input data.
function analyzeIntervalIntersection(rawTextData) {
    // Trim potential leading/trailing whitespace and split the entire input
    // string into an array of individual lines.
    const dataRows = rawTextData.trim().split('\n');

    // If the input data is empty or only contains whitespace, there are no intervals to process.
    // In this scenario, the intersection size is 0.
    if (dataRows.length === 0) {
        console.log(0);
        return;
    }

    // The first line of the input contains metadata.
    // It's expected to have two space-separated integers.
    const metadataParts = dataRows[0].split(' ');

    // Basic validation: ensure the metadata line has at least two components.
    // If not, the input format is invalid for defining intervals.
    if (metadataParts.length < 2) {
        console.log(0); // Treat as invalid input, no intervals.
        return;
    }

    // Parse the first number from the metadata line. This often represents a total count
    // (e.g., number of elements 'N' in the problem statement) but might not be used
    // in the core logic for interval intersection.
    const totalElementCount = parseInt(metadataParts[0], 10);

    // Parse the second number, which specifies how many interval definition lines follow.
    // This corresponds to 'M' in typical problem statements.
    const numberOfIntervalDefinitions = parseInt(metadataParts[1], 10);

    // Validate that the parsed count of definitions is a non-negative integer.
    // If it's invalid (NaN or negative), it implies no valid intervals to process.
    if (isNaN(numberOfIntervalDefinitions) || numberOfIntervalDefinitions < 0) {
        console.log(0); // Invalid count of definitions.
        return;
    }

    // If zero intervals are specified, their intersection is trivially empty.
    if (numberOfIntervalDefinitions === 0) {
        console.log(0);
        return;
    }

    // Initialize variables to keep track of the overall intersection boundaries.
    // To find the intersection [max(L_i), min(R_i)]:
    // - The overall maximum of all left boundaries (`currentMaxLeftBoundary`)
    //   must be initialized to the smallest possible number to ensure any 'L_i'
    //   will be greater than it.
    // - The overall minimum of all right boundaries (`currentMinRightBoundary`)
    //   must be initialized to the largest possible number to ensure any 'R_i'
    //   will be smaller than it.
    let currentMaxLeftBoundary = Number.MIN_SAFE_INTEGER;
    let currentMinRightBoundary = Number.MAX_SAFE_INTEGER;

    // Loop through each subsequent line, starting from the second line (index 1),
    // up to the number of interval definitions specified.
    for (let definitionIndex = 1; definitionIndex <= numberOfIntervalDefinitions; ++definitionIndex) {
        // Ensure that the current line index is within the bounds of the actual data rows array.
        // This is a robustness check for malformed input where 'M' is larger than available lines.
        if (definitionIndex >= dataRows.length) {
            // If we run out of data lines before processing all 'M' intervals,
            // it means the input is incomplete. We can assume no valid intersection
            // or simply stop processing further. For this clone, we'll stop.
            break;
        }

        const currentIntervalParts = dataRows[definitionIndex].split(' ');

        // Validate the format of the current interval line: it should contain two numbers.
        if (currentIntervalParts.length < 2) {
            // If the line is malformed, we skip this interval and proceed to the next,
            // rather than invalidating the entire process.
            continue;
        }

        // Parse the left and right boundary values for the current interval.
        const leftBoundaryValue = parseInt(currentIntervalParts[0], 10);
        const rightBoundaryValue = parseInt(currentIntervalParts[1], 10);

        // Validate that both parsed values are actual numbers.
        if (isNaN(leftBoundaryValue) || isNaN(rightBoundaryValue)) {
            // If non-numeric values are found, skip this interval.
            continue;
        }

        // Update the overall intersection boundaries:
        // The start of the overall intersection is the maximum of all left boundaries encountered.
        currentMaxLeftBoundary = Math.max(currentMaxLeftBoundary, leftBoundaryValue);
        // The end of the overall intersection is the minimum of all right boundaries encountered.
        currentMinRightBoundary = Math.min(currentMinRightBoundary, rightBoundaryValue);
    }

    // Calculate the potential length of the intersection.
    // An interval [A, B] has length B - A + 1.
    // If currentMinRightBoundary is less than currentMaxLeftBoundary, it means the intervals
    // do not overlap, and the calculated length will be negative.
    const calculatedIntersectionSpan = currentMinRightBoundary - currentMaxLeftBoundary + 1;

    // The length of an intersection cannot be negative. If the calculated span is negative,
    // it implies an empty intersection, so the effective length is 0.
    const finalIntersectionLength = Math.max(0, calculatedIntersectionSpan);

    // Output the final computed length to standard output.
    console.log(finalIntersectionLength);
}

// This is the typical entry point for competitive programming in Node.js.
// It reads all input from standard input (/dev/stdin) synchronously,
// decodes it as UTF-8, and then passes it to our processing function.
analyzeIntervalIntersection(require("fs").readFileSync("/dev/stdin", "utf8"));