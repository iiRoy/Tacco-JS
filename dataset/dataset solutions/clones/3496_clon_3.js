function LocatePyramidPeak(inputSource) {
    // Trim whitespace from input and split into lines for processing
    const processedLines = inputSource.trim().split("\n");

    // Validate if any input data was provided
    if (processedLines.length === 0 || processedLines[0].trim() === '') {
        // Log an error and indicate failure if no meaningful input exists
        console.error("Error: No input data provided or input is empty.");
        return "Input data missing or invalid.";
    }

    // Iterate through a potential range for the pyramid's peak X-coordinate (0 to 100 inclusive)
    for (let currentScanX = 0; currentScanX <= 100; currentScanX++) {
        // Iterate through a potential range for the pyramid's peak Y-coordinate (0 to 100 inclusive)
        for (let currentScanY = 0; currentScanY <= 100; currentScanY++) {
            // Evaluate if the current (X, Y) candidate is a consistent peak location
            // The helper function returns the peak height if valid, otherwise null
            const determinedPeakHeight = EvaluatePyramidConsistency(processedLines, currentScanX, currentScanY);

            // If a valid peak height was found (not null), construct and return the result string
            if (determinedPeakHeight !== null) {
                // Using template literals for clear string concatenation
                return `${currentScanX} ${currentScanY} ${determinedPeakHeight}`;
            }
        }
    }

    // If no valid pyramid peak is found after checking all possible (X, Y) coordinates
    return "No consistent pyramid peak found within the specified search area.";
}

// Helper function to check if a given (candidatePeakX, candidatePeakY) is a valid pyramid center
function EvaluatePyramidConsistency(pointRecords, candidatePeakX, candidatePeakY) {
    // Parse the total number of data points from the first line
    const numberOfPoints = Number(pointRecords[0]);

    // Perform validation on the declared number of points
    if (isNaN(numberOfPoints) || numberOfPoints < 0 || numberOfPoints !== pointRecords.length - 1) {
        // If the point count is invalid or doesn't match actual data length, this candidate is invalid
        console.warn(`Warning: Declared point count (${pointRecords[0]}) is invalid or does not match actual data size. Candidate (${candidatePeakX},${candidatePeakY}) rejected.`);
        return null;
    }
    
    // Initialize bounds for the possible peak height
    // minPossibleHeight represents the lowest acceptable height for the peak
    // maxPossibleHeight represents the highest acceptable height for the peak
    let minPossibleHeight = 1; // Pyramid height must be positive
    let maxPossibleHeight = Infinity; // Initially, no upper limit beyond what's possible

    // Loop through each data point, starting from the second line (index 1)
    for (let dataIndex = 1; dataIndex <= numberOfPoints; dataIndex++) {
        // Split the current observation line into its components (x, y, h)
        const currentObservation = pointRecords[dataIndex].split(" ");

        // Validate the format of the current data point
        if (currentObservation.length < 3) {
            console.error(`Error: Malformed data point at line ${dataIndex + 1} for candidate (${candidatePeakX},${candidatePeakY}). Skipping.`);
            return null; // Malformed data implies this candidate is invalid
        }

        // Convert string components to numbers
        const observationX = Number(currentObservation[0]);
        const observationY = Number(currentObservation[1]);
        const observationH = Number(currentObservation[2]);

        // Validate if the parsed components are actual numbers
        if (isNaN(observationX) || isNaN(observationY) || isNaN(observationH)) {
            console.error(`Error: Non-numeric data point at line ${dataIndex + 1} for candidate (${candidatePeakX},${candidatePeakY}). Skipping.`);
            return null; // Non-numeric data implies this candidate is invalid
        }

        // Calculate absolute differences in coordinates
        const deltaX = Math.abs(candidatePeakX - observationX);
        const deltaY = Math.abs(candidatePeakY - observationY);

        // Calculate the expected peak height based on the current observation and candidate center
        const calculatedHeightFromObservation = observationH + deltaX + deltaY;

        // Apply constraints based on the observation height (h)
        if (observationH === 0) {
            // If the observed height (h) is 0, the actual peak height must be less than or equal to
            // the calculated height from this observation. Update the upper bound.
            maxPossibleHeight = Math.min(maxPossibleHeight, calculatedHeightFromObservation);
        } else {
            // If the observed height (h) is greater than 0, the actual peak height must be
            // exactly equal to the calculated height from this observation.
            // This updates both lower and upper bounds to converge towards this value.
            maxPossibleHeight = Math.min(maxPossibleHeight, calculatedHeightFromObservation);
            minPossibleHeight = Math.max(minPossibleHeight, calculatedHeightFromObservation);
        }

        // Check for inconsistency: if the lower bound exceeds the upper bound, no solution is possible
        if (minPossibleHeight > maxPossibleHeight) {
            return null; // This candidate (X,Y) is inconsistent
        }
    }

    // After processing all points, if minPossibleHeight is not equal to maxPossibleHeight,
    // it means there isn't a single, unique peak height that satisfies all conditions.
    // This implies inconsistency.
    if (minPossibleHeight !== maxPossibleHeight) {
        return null;
    }
    
    // If all points are consistent and a unique height is found, return that height
    return minPossibleHeight;
}

// Encapsulate the execution logic for cleaner separation of concerns
function executePyramidSearch() {
    try {
        // Read input from standard input
        const fileContent = require("fs").readFileSync("/dev/stdin", "utf8");
        // Call the main function with the file content
        const finalResult = LocatePyramidPeak(fileContent);
        // Output the result
        console.log(finalResult);
    } catch (error) {
        // Handle potential errors during file reading or processing
        console.error("An error occurred during execution:", error.message);
        console.log("Error processing input.");
    }
}

// Initiate the solution execution
executePyramidSearch();