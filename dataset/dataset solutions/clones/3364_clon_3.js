const ioUtilityModule = require("readline");

// This array will hold all input lines received from the standard input.
let collectedInputLines = [];

// Establish an interface to manage input/output operations.
const inputProcessingInterface = ioUtilityModule.createInterface({
    input: process.stdin,  // Directing the interface to read from standard input.
    output: process.stdout // Directing the interface to write to standard output (though not used for direct output in this logic).
});

// Register an event listener for each line of input.
inputProcessingInterface.on("line", (singleLineContent) => {
    // Each line read is added to our collection.
    collectedInputLines.push(singleLineContent);
});

// Register an event listener for when the input stream concludes.
inputProcessingInterface.on("close", () => {
    // --- Initial Data Extraction and Validation ---

    // Retrieve the very first line of input, which contains critical parameters.
    const initialParametersString = collectedInputLines.shift();

    // Implement a guard clause to ensure the first line was provided.
    if (!initialParametersString) {
        console.error("Critical Error: The initial parameter line was not supplied.");
        process.exit(1); // Terminate execution due to missing essential input.
    }

    // Parse the parameters from the first line, splitting by space.
    const parameterTokens = initialParametersString.split(" ");

    // Another guard clause: verify that both 'L' and 'N' parameters are present.
    if (parameterTokens.length < 2) {
        console.error("Critical Error: Insufficient parameters on the first line. Expected at least two values (L and N).");
        process.exit(1);
    }

    // Convert the string parameters to numeric types.
    // 'totalBoundaryLength' corresponds to 'L' in the original problem.
    const totalBoundaryLength = parseInt(parameterTokens[0], 10);
    // 'numberOfLocations' corresponds to 'N' in the original problem.
    const numberOfLocations = parseInt(parameterTokens[1], 10);

    // Validate that the parsed values are indeed numbers and 'N' is non-negative.
    if (isNaN(totalBoundaryLength) || isNaN(numberOfLocations) || numberOfLocations < 0) {
        console.error("Critical Error: Invalid numeric values detected for the total boundary length or the count of locations.");
        process.exit(1);
    }

    // Create an array to store the coordinate values for each location.
    let locationCoordinates = new Array(numberOfLocations);

    // Populate the coordinates array from the remaining input lines.
    for (let pointIndex = 0; pointIndex < numberOfLocations; ++pointIndex) {
        const currentCoordinateValue = parseInt(collectedInputLines[pointIndex], 10);
        // Validate each coordinate value during parsing.
        if (isNaN(currentCoordinateValue)) {
            console.error(`Critical Error: An invalid coordinate value was found on line ${pointIndex + 2}.`);
            process.exit(1);
        }
        locationCoordinates[pointIndex] = currentCoordinateValue;
    }

    // Sort the location coordinates numerically in ascending order.
    // This ordering is fundamental to the algorithm's logic.
    locationCoordinates.sort((coordA, coordB) => coordA - coordB);

    // --- Path Calculation Scenario 1: Initial movement prioritizing the 'left' direction ---

    // Initialize pointers for navigating the sorted location array.
    // 'currentRightmostPointIndex' tracks the rightmost available point for a 'left' move.
    let currentRightmostPointIndex = numberOfLocations - 1;
    // 'currentLeftmostPointIndex' tracks the leftmost available point for a 'right' move.
    let currentLeftmostPointIndex = 0;

    // Calculate the initial segment lengths for potential moves.
    // 'distanceToLeftEnd' represents the distance from the origin to the last point, subtracted from L.
    let distanceToLeftEnd = totalBoundaryLength - locationCoordinates[currentRightmostPointIndex];
    // 'distanceToRightEnd' represents the distance from the origin to the first point.
    let distanceToRightEnd = locationCoordinates[currentLeftmostPointIndex];

    // This variable accumulates the total distance covered in this scenario.
    let cumulativeDistanceLeftStart = 0;

    // Iterate 'N' times, simulating moves to cover all locations.
    for (let currentStep = 0; currentStep < numberOfLocations; ++currentStep) {
        // Determine the decision for the current step.
        // A move to the 'left' is favored if 'distanceToRightEnd' is less than or equal to 'distanceToLeftEnd',
        // OR if this is the very first step of the journey.
        const shouldPreferRightPath = (distanceToRightEnd <= distanceToLeftEnd);
        const isTheInitialMoveSequence = (currentStep === 0);

        if (shouldPreferRightPath || isTheInitialMoveSequence) {
            // Execute a move towards the left.
            cumulativeDistanceLeftStart += distanceToLeftEnd; // Add the distance of the current left segment.
            distanceToRightEnd += distanceToLeftEnd; // Update the effective right path length (it grows by the segment just traversed left).
            currentRightmostPointIndex--; // Move the 'left' pointer inward.

            // Calculate the length of the *next* potential left segment.
            // A boundary check is necessary to prevent accessing invalid array indices.
            if (currentRightmostPointIndex >= 0) {
                distanceToLeftEnd = locationCoordinates[currentRightmostPointIndex + 1] - locationCoordinates[currentRightmostPointIndex];
            } else {
                distanceToLeftEnd = 0; // If no more points to the left, this segment length becomes zero.
            }
        } else {
            // Execute a move towards the right.
            cumulativeDistanceLeftStart += distanceToRightEnd; // Add the distance of the current right segment.
            distanceToLeftEnd += distanceToRightEnd; // Update the effective left path length.
            currentLeftmostPointIndex++; // Move the 'right' pointer inward.

            // Calculate the length of the *next* potential right segment.
            // A boundary check is necessary here as well.
            if (currentLeftmostPointIndex < numberOfLocations) {
                distanceToRightEnd = locationCoordinates[currentLeftmostPointIndex] - locationCoordinates[currentLeftmostPointIndex - 1];
            } else {
                distanceToRightEnd = 0; // If no more points to the right, this segment length becomes zero.
            }
        }
    }

    // --- Path Calculation Scenario 2: Initial movement prioritizing the 'right' direction ---

    // Reset and re-initialize all relevant variables for the second scenario.
    let currentRightEndIdx = numberOfLocations - 1;
    let currentLeftEndIdx = 0;

    let segmentLengthToLeft = totalBoundaryLength - locationCoordinates[currentRightEndIdx];
    let segmentLengthToRight = locationCoordinates[currentLeftEndIdx];

    // Accumulator for the total distance covered in this second scenario.
    let totalTravelRightStart = 0;

    // Iterate 'N' times, similar to the first scenario.
    for (let journeyStep = 0; journeyStep < numberOfLocations; ++journeyStep) {
        // Determine the decision for the current step.
        // A move to the 'right' is favored if 'segmentLengthToLeft' is less than or equal to 'segmentLengthToRight',
        // OR if this is the very first step of this journey.
        const isFirstLegOfJourney = (journeyStep === 0);
        const preferLeftwardMovement = (segmentLengthToLeft <= segmentLengthToRight);

        if (preferLeftwardMovement || isFirstLegOfJourney) {
            // Execute a move towards the right.
            totalTravelRightStart += segmentLengthToRight; // Add the distance of the current right segment.
            segmentLengthToLeft += segmentLengthToRight; // Update the effective left path length.
            currentLeftEndIdx++; // Move the 'right' pointer inward.

            // Calculate the length of the *next* potential right segment, with boundary check.
            if (currentLeftEndIdx < numberOfLocations) {
                segmentLengthToRight = locationCoordinates[currentLeftEndIdx] - locationCoordinates[currentLeftEndIdx - 1];
            } else {
                segmentLengthToRight = 0; // No more points to the right.
            }
        } else {
            // Execute a move towards the left.
            totalTravelRightStart += segmentLengthToLeft; // Add the distance of the current left segment.
            segmentLengthToRight += segmentLengthToLeft; // Update the effective right path length.
            currentRightEndIdx--; // Move the 'left' pointer inward.

            // Calculate the length of the *next* potential left segment, with boundary check.
            if (currentRightEndIdx >= 0) {
                segmentLengthToLeft = locationCoordinates[currentRightEndIdx + 1] - locationCoordinates[currentRightEndIdx];
            } else {
                segmentLengthToLeft = 0; // No more points to the left.
            }
        }
    }

    // --- Final Output ---

    // Display the maximum total distance achieved from either of the two calculated paths.
    console.log(Math.max(cumulativeDistanceLeftStart, totalTravelRightStart));
});