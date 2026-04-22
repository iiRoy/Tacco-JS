// This module processes a travel itinerary to determine its feasibility.

/**
 * Calculates the absolute difference between two numerical values.
 * @param {number} valueA - The first numerical value.
 * @param {number} valueB - The second numerical value.
 * @returns {number} The absolute difference between valueA and valueB.
 */
const calculateAbsoluteDifference = (valueA, valueB) => {
    // Ensuring the result is always positive regardless of operand order.
    if (valueA < valueB) {
        return valueB - valueA;
    } else {
        return valueA - valueB;
    }
};

/**
 * Determines if a given travel plan, specified by a series of time-space coordinates,
 * is physically possible to execute.
 * @param {string} rawInputData - The raw input string containing the travel plan.
 *                                  The first line is the number of points,
 *                                  subsequent lines are "time X Y".
 */
function processTravelPlan(rawInputData) {
    const coordinateLines = rawInputData.trim().split("\n");

    // Early exit for invalid input structure.
    if (coordinateLines.length === 0) {
        console.log("No");
        return;
    }

    // The first line indicates the total number of travel points.
    const numberOfPointsToVisit = parseInt(coordinateLines[0], 10);
    if (isNaN(numberOfPointsToVisit) || numberOfPointsToVisit < 0) {
        console.log("No"); // Malformed input for point count or invalid count.
        return;
    }

    let currentXCoordinate = 0;
    let currentYCoordinate = 0;
    let absoluteTimeOfPreviousPoint = 0; // Tracks the time of the last successfully visited point.
    let isTravelPlanPossible = true; // Flag to track overall feasibility.

    // Iterate through each travel segment, starting from the first actual point after the header.
    // The loop runs for the declared number of points.
    for (let segmentIndex = 1; segmentIndex <= numberOfPointsToVisit; ++segmentIndex) {
        // Guard against input where the number of lines is less than declared.
        if (segmentIndex >= coordinateLines.length) {
            isTravelPlanPossible = false;
            break;
        }

        const segmentDetails = coordinateLines[segmentIndex].split(" ").map(Number);

        // Input validation for each segment's parsed data.
        if (segmentDetails.length !== 3 || segmentDetails.some(isNaN)) {
            isTravelPlanPossible = false;
            break;
        }

        const [nextAbsoluteTime, targetXCoordinate, targetYCoordinate] = segmentDetails;

        // Validate time progression: next point cannot be in the past relative to the previous.
        if (nextAbsoluteTime < absoluteTimeOfPreviousPoint) {
            isTravelPlanPossible = false;
            break;
        }

        // Calculate the time duration for this specific segment of travel.
        const timeElapsedForSegment = nextAbsoluteTime - absoluteTimeOfPreviousPoint;

        // Calculate the Manhattan distance required to reach the target coordinates.
        const distanceX = calculateAbsoluteDifference(currentXCoordinate, targetXCoordinate);
        const distanceY = calculateAbsoluteDifference(currentYCoordinate, targetYCoordinate);
        const manhattanDistanceRequired = distanceX + distanceY;

        // Check feasibility based on time and distance.
        if (manhattanDistanceRequired > timeElapsedForSegment) {
            // It's impossible to reach the destination in the given time.
            isTravelPlanPossible = false;
            break; // No need to check further segments.
        } else if (manhattanDistanceRequired < timeElapsedForSegment) {
            // Arrived early. The remaining time must be an even number.
            // This is because any excess time must be spent moving back and forth,
            // which always consumes an even number of steps.
            const remainingTime = timeElapsedForSegment - manhattanDistanceRequired;
            if (remainingTime % 2 !== 0) {
                isTravelPlanPossible = false;
                break; // Impossible because you can only move back and forth in even steps.
            }
        }
        // If manhattanDistanceRequired === timeElapsedForSegment, it's perfectly fine, no action needed.

        // Update current position and time for the next iteration.
        currentXCoordinate = targetXCoordinate;
        currentYCoordinate = targetYCoordinate;
        absoluteTimeOfPreviousPoint = nextAbsoluteTime;
    }

    // Output the final verdict based on the feasibility flag.
    console.log(isTravelPlanPossible ? "Yes" : "No");
}

// Entry point for execution, typically reading from standard input in a competitive programming environment.
// This part is external to the core logic and handles the environment-specific I/O.
processTravelPlan(require("fs").readFileSync("/dev/stdin", "utf8"));