const ProcessData = (rawDataString) => {
    // Preprocess the raw input string: trim whitespace, split into lines, and filter out any empty lines.
    const dataLines = rawDataString.trim().split("\n").filter(lineContent => lineContent.length > 0);

    // Extract the declared total number of data points from the very first line.
    // Convert this string value to a numerical type.
    const declaredPointCountStr = dataLines[0].split(" ")[0];
    let declaredPointCount = Number(declaredPointCountStr);

    // Implement a guard clause to validate the initial point count.
    // If it's not a valid positive number, log an error and terminate processing.
    if (isNaN(declaredPointCount) || declaredPointCount <= 0) {
        console.error("Input Error: The specified total number of points is invalid or non-positive.");
        return; 
    }

    // Initialize an array to store the parsed coordinate pairs.
    // A null placeholder is added at index 0 to maintain 1-based indexing,
    // aligning with the problem's typical input structure where data points start from index 1.
    const pointCollection = [null]; 
    
    // Iterate through the remaining lines (starting from the second line, index 1)
    // to parse individual coordinate pairs.
    for (let lineIndex = 1; lineIndex < dataLines.length; lineIndex++) {
        const currentLineParts = dataLines[lineIndex].split(" ").map(coordStr => Number(coordStr));
        
        // Validate each parsed line to ensure it contains exactly two valid numbers (coordinates).
        if (currentLineParts.length === 2 && !isNaN(currentLineParts[0]) && !isNaN(currentLineParts[1])) {
            pointCollection.push(currentLineParts);
        } else {
            // Log a warning for any malformed coordinate lines encountered.
            console.warn(`Data Warning: Skipping malformed coordinate line ${lineIndex}: "${dataLines[lineIndex]}"`);
        }
    }

    // After parsing, verify if the actual number of collected points matches the declared count.
    // Adjust the `declaredPointCount` if fewer points were actually provided than declared.
    const actualCollectedPoints = pointCollection.length - 1;
    if (actualCollectedPoints < declaredPointCount) {
        console.warn(`Data Warning: Declared ${declaredPointCount} points, but only ${actualCollectedPoints} were successfully parsed. Adjusting processing scope.`);
        declaredPointCount = actualCollectedPoints; 
    }

    // Define a nested utility function to compute the number of diagonally related points
    // for a given reference point within the `pointCollection`.
    const determineDiagonalRelations = (currentIdx, currentX, currentY) => {
        let diagonalMatchCount = 0; // Accumulator for points meeting the diagonal criteria.

        // Loop through all points in the collection (using 1-based indexing).
        for (let comparisonIdx = 1; comparisonIdx <= declaredPointCount; comparisonIdx++) {
            // A point cannot be diagonally related to itself, so skip if indices are identical.
            if (currentIdx === comparisonIdx) {
                continue; 
            }

            // Retrieve the coordinates of the point currently being compared.
            const comparisonCoords = pointCollection[comparisonIdx];
            // Implement a guard to ensure valid coordinate data exists for the comparison point.
            if (!comparisonCoords) {
                console.error(`Processing Error: Missing coordinate data for point at index ${comparisonIdx}. Skipping comparison.`);
                continue;
            }
            
            const comparisonX = comparisonCoords[0];
            const comparisonY = comparisonCoords[1];

            // Check for the diagonal relationship condition:
            // Either both coordinates of the comparison point are strictly greater than the reference point,
            // OR both are strictly smaller.
            const bothCoordsHigher = (currentX < comparisonX && currentY < comparisonY);
            const bothCoordsLower = (comparisonX < currentX && comparisonY < currentY);

            if (bothCoordsHigher || bothCoordsLower) {
                diagonalMatchCount++; // Increment if a diagonal relationship is found.
            }
        }
        return diagonalMatchCount; // Return the total count for the current reference point.
    };

    // The primary execution loop: iterate through each valid point in the collection
    // and print its calculated number of diagonal relationships.
    for (let processingIdx = 1; processingIdx <= declaredPointCount; processingIdx++) {
        const targetPointData = pointCollection[processingIdx];
        // Another guard to handle potential data inconsistencies during the main loop.
        if (!targetPointData) {
            console.error(`Processing Error: Data for point index ${processingIdx} is unexpectedly missing during final iteration.`);
            continue;
        }

        const targetX = targetPointData[0];
        const targetY = targetPointData[1];
        
        // Call the helper function to get the count for the current point.
        const calculatedConnections = determineDiagonalRelations(processingIdx, targetX, targetY);
        console.log(calculatedConnections); // Output the result as required.
    }
};

// This section handles reading input from the standard input stream,
// a common pattern in competitive programming environments.
ProcessData(require("fs").readFileSync("/dev/stdin", "utf8"));