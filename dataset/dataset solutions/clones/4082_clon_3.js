const parseCoordinateSegment = (lineSegment) => {
    // Guards against empty or malformed line segments
    if (!lineSegment || lineSegment.trim() === '') {
        return null;
    }
    const parts = lineSegment.split(' ');
    // Expecting exactly three numeric parts: time, x-coordinate, y-coordinate
    if (parts.length !== 3) {
        return null;
    }
    const numericParts = parts.map(Number);
    // Basic validation to ensure all parts are valid numbers
    if (numericParts.some(isNaN)) {
        return null;
    }
    return numericParts;
};

function analyzeTravelPlanFeasibility(rawJourneyData) {
    // Pre-validation: ensure input is a non-empty string.
    if (typeof rawJourneyData !== 'string' || rawJourneyData.trim() === '') {
        // In a real-world scenario, you might throw an error or log a warning.
        return 'Invalid input provided for journey analysis.';
    }

    // Split the entire input string into individual lines.
    // The first line typically contains metadata (like the number of segments)
    // which is not directly used in the per-segment calculations, so we discard it.
    const journeyPathLines = rawJourneyData.split('\n').slice(1);

    // If there are no actual journey segments after header removal,
    // the journey is vacuously considered possible.
    if (journeyPathLines.length === 0) {
        return 'All segments successfully processed (vacuously true).';
    }

    // Convert string representations of journey segments into structured numeric arrays.
    // This step incorporates error handling for individual line parsing.
    const destinationCoordinates = journeyPathLines
        .map(parseCoordinateSegment)
        .filter(segment => segment !== null); // Retain only successfully parsed segments

    // If all lines were malformed, there are no valid destinations to check.
    if (destinationCoordinates.length === 0) {
        return 'No valid journey segments could be parsed from input.';
    }

    // Initialize the traveler's state: starting at (0,0) at time 0.
    let currentTravelTime = 0;
    let currentXLocation = 0;
    let currentYLocation = 0;

    // A flag to track whether the entire journey remains feasible.
    let overallJourneyIsPossible = true;

    // Iterate through each planned destination to verify feasibility.
    // Using a 'for...of' loop for clarity when iterating over array elements.
    for (const nextScheduledStop of destinationCoordinates) {
        // Destructure the time and coordinates for the upcoming stop.
        const [scheduledArrivalTime, targetXLocation, targetYLocation] = nextScheduledStop;

        // Calculate the elapsed time and displacement for this specific leg of the journey.
        const timeRequiredForLeg = scheduledArrivalTime - currentTravelTime;
        const horizontalDistance = Math.abs(targetXLocation - currentXLocation);
        const verticalDistance = Math.abs(targetYLocation - currentYLocation);

        // The Manhattan distance represents the minimum number of 'steps' required.
        const totalManhattanDistance = horizontalDistance + verticalDistance;

        // Condition 1: Time constraint check.
        // The time elapsed must be sufficient to cover the Manhattan distance.
        if (timeRequiredForLeg < totalManhattanDistance) {
            overallJourneyIsPossible = false;
            break; // No need to check further; the journey is already deemed impossible.
        }

        // Condition 2: Parity constraint check.
        // The parity of the time elapsed must match the parity of the Manhattan distance.
        // This ensures the traveler can arrive exactly at the target coordinates.
        // If (A % 2) !== (B % 2), then (A - B) is odd.
        if ((timeRequiredForLeg % 2) !== (totalManhattanDistance % 2)) {
            overallJourneyIsPossible = false;
            break; // Journey is impossible due to parity mismatch.
        }

        // If both conditions pass, update the traveler's current state for the next leg.
        currentTravelTime = scheduledArrivalTime;
        currentXLocation = targetXLocation;
        currentYLocation = targetYLocation;
    }

    // Based on the final feasibility flag, return the appropriate result message.
    return overallJourneyIsPossible ? 'Journey Feasible' : 'Journey Not Feasible';
}

// Standard input reading and execution.
const inputBuffer = require('fs').readFileSync('/dev/stdin', 'utf8');
console.log(analyzeTravelPlanFeasibility(inputBuffer));