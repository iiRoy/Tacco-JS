function analyzeTravelItinerary(rawItineraryData) {
    // A custom utility function for parsing numeric values, ensuring robustness.
    const safeParseInt = (valueString) => {
        const parsed = Number(valueString);
        if (isNaN(parsed)) {
            // In a real-world scenario, more sophisticated error handling might be needed.
            // For competitive programming, input is usually guaranteed to be valid.
            return 0; // Default to 0 or throw an error.
        }
        return parsed;
    };

    // Helper to calculate absolute difference between two numbers.
    const calculateAbsoluteDifference = (val1, val2) => {
        return Math.abs(val1 - val2);
    };

    // Step 1: Process the raw input string into a structured format.
    const itineraryLines = rawItineraryData.trim().split('\n');

    // Add a guard clause for empty input data.
    if (itineraryLines.length === 0 || itineraryLines[0].trim() === '') {
        console.log("No"); // No itinerary provided, so no travel is possible.
        return;
    }

    const firstLineDetails = itineraryLines[0].split(' ').map(safeParseInt);
    // The first number N indicates the total count of subsequent checkpoints.
    // While N is not strictly used in the loop iteration (we iterate based on line count),
    // we can use it for an optional validation check.
    const expectedCheckpointCount = firstLineDetails[0];

    const travelCheckpoints = [];
    // Populate the list of travel checkpoints, starting from the second line.
    for (let i = 1; i < itineraryLines.length; i++) {
        const checkpointTokens = itineraryLines[i].split(' ').map(safeParseInt);

        // Basic validation for checkpoint data structure.
        if (checkpointTokens.length !== 3) {
            // Malformed line, consider the journey impossible or skip this segment.
            // For this problem, we'll assume valid input format after N.
            // If strictly following the problem, this might imply "No".
            // For now, we'll proceed, but this is a good place for a robust check.
            console.error(`Warning: Malformed checkpoint data on line ${i + 1}. Skipping.`);
            continue;
        }

        // Store checkpoint data as objects for better readability.
        travelCheckpoints.push({
            eventTime: checkpointTokens[0],
            positionX: checkpointTokens[1],
            positionY: checkpointTokens[2]
        });
    }

    // Optional: Validate if the number of parsed checkpoints matches N.
    if (travelCheckpoints.length !== expectedCheckpointCount) {
        console.warn(`Mismatch: Expected ${expectedCheckpointCount} checkpoints, found ${travelCheckpoints.length}. Proceeding with available data.`);
    }

    // Initialize the current state of the traveler.
    // The journey implicitly starts at (0,0) at time 0.
    let lastKnownTime = 0;
    let lastKnownXCoordinate = 0;
    let lastKnownYCoordinate = 0;

    // Flag to track if the entire journey is feasible.
    let journeyIsFeasible = true;

    // Iterate through each planned checkpoint to verify travel possibility.
    for (const currentCheckpoint of travelCheckpoints) {
        const { eventTime: plannedArrivalTime, positionX: plannedDestinationX, positionY: plannedDestinationY } = currentCheckpoint;

        // Calculate time elapsed and spatial distances for the current segment.
        const timeSegmentDuration = plannedArrivalTime - lastKnownTime;
        const deltaXPosition = calculateAbsoluteDifference(plannedDestinationX, lastKnownXCoordinate);
        const deltaYPosition = calculateAbsoluteDifference(plannedDestinationY, lastKnownYCoordinate);

        // Calculate the total Manhattan distance required to reach the destination.
        const totalManhattanDistance = deltaXPosition + deltaYPosition;

        // Condition 1: Check if there's enough time to cover the Manhattan distance.
        const hasSufficientTime = timeSegmentDuration >= totalManhattanDistance;

        // Condition 2: Check if the parity of time and distance match.
        // This is crucial for grid movement where one can move 1 unit per time step.
        // If time_delta > manhattan_distance, the "extra" time must be an even number
        // to allow for back-and-forth movement to arrive exactly on time.
        const parityRequirementMet = (timeSegmentDuration % 2) === (totalManhattanDistance % 2);

        // If either condition is not met, the journey is impossible.
        if (!hasSufficientTime || !parityRequirementMet) {
            journeyIsFeasible = false;
            // Early exit: No need to check further segments if one fails.
            break;
        }

        // Update the traveler's state to the current checkpoint's details for the next iteration.
        lastKnownTime = plannedArrivalTime;
        lastKnownXCoordinate = plannedDestinationX;
        lastKnownYCoordinate = plannedDestinationY;
    }

    // Determine the final message based on the feasibility flag.
    const finalOutcomeMessage = journeyIsFeasible ? "Yes" : "No";

    // Output the result to the console.
    console.log(finalOutcomeMessage);
}

// Standard boilerplate for reading input from stdin in Node.js.
// This ensures compatibility with common online judge environments.
analyzeTravelItinerary(require('fs').readFileSync('/dev/stdin', 'utf8'));