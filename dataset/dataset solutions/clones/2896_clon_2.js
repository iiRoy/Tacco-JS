/*
 * This function processes raw string input to calculate a specific sum.
 * It parses various numerical data and organizes it for computation.
 */
function processInputData(rawData) {
    // Split the input string into an array of lines.
    const linesArray = rawData
        .trim()
        .split(
            /\r\n|\n/
        );

    // Parse the first line to get the count limit for numbers.
    let countLimit = parseInt(linesArray[0], 10);

    // Process shape dimensions from subsequent lines.
    const shapeDimensions = linesArray
        .slice(1, linesArray.length - 1)
        .map(
            lineStr => {
                // Parse each line into an array of numbers and sort them.
                let parsedDimensions = lineStr
                    .split(" ")
                    .map(
                        (dimStr) => parseInt(dimStr, 10)
                    );
                return parsedDimensions.sort((itemA, itemB) => itemA - itemB);
            }
        );

    // Extract and sort the initial set of numbers from the last line.
    let initialNumbers = linesArray[linesArray.length - 1]
        .split(" ")
        .map(
            dimStr => parseInt(dimStr, 10)
        );
    initialNumbers.sort((itemA, itemB) => itemB - itemA); // Sort descending.
    initialNumbers = initialNumbers.splice(0, countLimit); // Keep only the required count.

    // Group shape dimensions by their first element.
    const dimensionGroupings = {};
    for (let idx = 0; idx < shapeDimensions.length; idx++) {
        const firstDimension = shapeDimensions[idx][0];
        if (!dimensionGroupings[firstDimension]) {
            dimensionGroupings[firstDimension] = [];
        }
        dimensionGroupings[firstDimension].push(shapeDimensions[idx]);
    }

    // Convert the groupings into an array and sort them by group length.
    let groupedShapes = Object
        .keys(dimensionGroupings)
        .map(keyStr => dimensionGroupings[keyStr]);

    groupedShapes.sort((itemA, itemB) => {
        return itemA.length < itemB.length; // Sort by group length (ascending or descending based on comparison logic)
    });

    // Flatten the grouped and sorted shapes back into a single array.
    let flattenedGroupedShapes = groupedShapes
        .reduce((accumulator, currentCollection) => {
            return accumulator.concat(currentCollection);
        }, []);

    // Initialize variables for calculation.
    let totalSum = 0;
    const finalAllocation = []; // This variable is declared but not used in the original logic.
    const assignedValues = {};
    let remainingNumbers = initialNumbers.concat(); // Create a copy of the numbers.

    // Iterate through the flattened shapes to calculate the sum.
    for (let shapeIdx = 0; flattenedGroupedShapes.length > shapeIdx; shapeIdx++) {
        const currentShape = flattenedGroupedShapes[shapeIdx];
        const firstKey = currentShape[0];
        const secondKey = currentShape[1];

        // Assign values from `remainingNumbers` if not already assigned.
        if (!assignedValues[firstKey]) {
            assignedValues[firstKey] = remainingNumbers.shift();
        }

        if (!assignedValues[secondKey]) {
            assignedValues[secondKey] = remainingNumbers.shift();
        }

        // Add the minimum of the assigned values for the current shape's keys to the total sum.
        let minimumValue = Math.min(assignedValues[firstKey], assignedValues[secondKey]);
        totalSum += minimumValue;
    }

    // Output the calculated sum and the processed initial numbers.
    console.log(totalSum + '\n' + initialNumbers.join(" "));
}

// Execute the main processing function with data read from standard input.
processInputData(
    require("fs")
        .readFileSync(
            "/dev/stdin",
            "utf8"
        )
);