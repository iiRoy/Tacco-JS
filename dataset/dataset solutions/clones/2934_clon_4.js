const determineIntervalLength = (sourceInput) => {
    const documentLines = sourceInput.trim().split('\n');
    const headerParts = documentLines[0].split(' ').map(val => parseInt(val, 10));
    // The first number (N) from the header is not used in the calculation.
    const intervalCount = headerParts[1]; // This corresponds to M in the original code

    // Extract the lines that define the intervals, skipping the header line
    // and taking exactly 'intervalCount' lines afterwards.
    const intervalDefinitionStrings = documentLines.slice(1, intervalCount + 1);

    // Transform each string representation of an interval into a structured object.
    const intervalObjects = intervalDefinitionStrings.map(lineText => {
        const [startPoint, endPoint] = lineText.split(' ').map(value => parseInt(value, 10));
        return { lowerBound: startPoint, upperBound: endPoint };
    });

    // A functional helper to compute the intersection of two intervals.
    // It returns a new interval representing the common range.
    const findIntersection = (currentAggregate, nextInterval) => {
        // If the `currentAggregate` is already an empty set (lowerBound > upperBound),
        // any further intersection with it will also be an empty set.
        if (currentAggregate.lowerBound > currentAggregate.upperBound) {
            // Return a consistent sentinel value for an empty set,
            // mirroring the original's `min=0, max=-1` for a length of 0.
            return { lowerBound: 0, upperBound: -1 };
        }

        // Calculate the new lower bound (maximum of current lower bounds)
        const newLower = Math.max(currentAggregate.lowerBound, nextInterval.lowerBound);
        // Calculate the new upper bound (minimum of current upper bounds)
        const newUpper = Math.min(currentAggregate.upperBound, nextInterval.upperBound);

        // If the newly calculated bounds define an empty set (newLower > newUpper),
        // return the empty set sentinel.
        if (newLower > newUpper) {
            return { lowerBound: 0, upperBound: -1 };
        } else {
            // Otherwise, return the valid intersected interval.
            return { lowerBound: newLower, upperBound: newUpper };
        }
    };

    // Use the `reduce` method to iteratively apply `findIntersection` across all intervals.
    // The first interval in `intervalObjects` serves as the initial accumulator.
    // This assumes `intervalObjects` is never empty (M >= 1 as per typical problem constraints).
    const resultingIntersection = intervalObjects.reduce(findIntersection);

    // Finally, calculate the length of the resulting intersection.
    if (resultingIntersection.lowerBound > resultingIntersection.upperBound) {
        // If the resulting intersection is an empty set, its length is 0.
        return 0;
    } else {
        // For a valid intersection, the length is (upper bound - lower bound + 1).
        return resultingIntersection.upperBound - resultingIntersection.lowerBound + 1;
    }
};

// This function serves as the entry point for processing external data,
// orchestrating the parsing and calculation, and handling the output.
const processExternalData = (dataStream) => {
    const finalResult = determineIntervalLength(dataStream);
    console.log(finalResult);
};

// Standard input handling for execution environments like competitive programming platforms.
processExternalData(require("fs").readFileSync("/dev/stdin", "utf8"));