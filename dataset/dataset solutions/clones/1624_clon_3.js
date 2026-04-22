function ProcessGeometricData(rawInputString) {
    // This variable will store the total count of points that satisfy our geometric condition.
    let qualifyingPointsCount = 0;

    // The entire input string is segmented into an array of individual lines.
    const dataLines = rawInputString.split('\n');

    // --- Input Validation Section ---
    // A preliminary check to ensure there is actual data to process.
    if (!dataLines || dataLines.length === 0 || dataLines[0].trim() === '') {
        console.error("Input processing terminated: No valid data lines found or input is empty.");
        return; // Exit the function if input is invalid.
    }

    // The first line typically contains auxiliary information, including our distance threshold.
    // We expect it to be in the format: "N THRESHOLD_VALUE".
    const initialLineParts = dataLines[0].split(' ');
    if (initialLineParts.length < 2) {
        console.error("Input processing terminated: First line is malformed; expected 'N THRESHOLD_VALUE'.");
        return;
    }

    // Attempt to parse the second component of the first line as our target distance criterion.
    const distanceCriterion = parseFloat(initialLineParts[1]);

    // Validate the parsed threshold to ensure it's a positive number.
    if (isNaN(distanceCriterion) || distanceCriterion < 0) {
        console.error(`Input processing terminated: Invalid or negative distance threshold '${initialLineParts[1]}' provided.`);
        return;
    }
    // --- End Input Validation Section ---

    // All lines after the first one are considered coordinate pairs.
    // We create a new array containing only these coordinate data strings.
    const pointCoordinateStrings = dataLines.slice(1);

    // Iterate through each string representing a potential coordinate pair.
    // Using a for...of loop for cleaner iteration over array elements.
    for (const coordinateLine of pointCoordinateStrings) {
        // Skip any empty lines that might occur due to formatting or trailing newlines.
        if (coordinateLine.trim() === '') {
            continue; // Move to the next line.
        }

        // Split the current coordinate line into its X and Y string components.
        const coordinateComponents = coordinateLine.split(' ');

        // Validate if we have at least two components (X and Y).
        if (coordinateComponents.length < 2) {
            console.warn(`Skipping malformed coordinate entry: '${coordinateLine}'. Expected two space-separated numbers.`);
            continue; // Skip this line and proceed to the next.
        }

        // Convert string components to numerical values using the unary plus operator.
        // This is a concise way to convert strings to numbers.
        const abscissaValue = +coordinateComponents[0]; // Represents the X-coordinate.
        const ordinateValue = +coordinateComponents[1]; // Represents the Y-coordinate.

        // Validate that both parsed values are indeed numbers.
        if (isNaN(abscissaValue) || isNaN(ordinateValue)) {
            console.warn(`Skipping line with non-numeric coordinates: '${coordinateLine}'.`);
            continue; // Skip if conversion failed for either coordinate.
        }

        // --- Geometric Calculation ---
        // Calculate the square of the Euclidean distance from the origin (0,0).
        // This intermediate step avoids an unnecessary square root operation until the final comparison.
        const squaredEuclideanDistance = (abscissaValue * abscissaValue) + (ordinateValue * ordinateValue);

        // Now, compute the actual Euclidean distance.
        const actualEuclideanDistance = Math.sqrt(squaredEuclideanDistance);

        // Apply the rounding operation as per the problem's criteria, then compare.
        // If the rounded distance is greater than or equal to our specified criterion, increment the counter.
        if (Math.round(actualEuclideanDistance) >= distanceCriterion) {
            qualifyingPointsCount = qualifyingPointsCount + 1; // Increment the counter.
        }
    }

    // After processing all points, display the final tally.
    console.log(qualifyingPointsCount);
}

// The program's execution entry point: reads data from standard input.
// This standard boilerplate for competitive programming remains consistent.
ProcessGeometricData(require("fs").readFileSync("/dev/stdin", "utf8"));