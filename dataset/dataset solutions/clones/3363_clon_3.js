const acquireRawData = () => {
    try {
        return require("fs").readFileSync("/dev/stdin", "utf8");
    } catch (dataReadError) {
        // In case of an error reading from stdin, log it and return an empty string
        // This allows the main logic to handle potentially missing or malformed input gracefully.
        console.error("Failed to read input data:", dataReadError.message);
        return "";
    }
};

// Computes the distance between two points on a circular track, moving in a clockwise direction.
// Parameters:
//   originPoint: The starting coordinate.
//   destinationPoint: The target coordinate.
//   trackCircumference: The total length of the circular track.
const calculateClockwiseSegmentLength = (originPoint, destinationPoint, trackCircumference) => {
    // Normalize points to ensure they are within the [0, trackCircumference) range.
    // This step adds robustness against out-of-range inputs, though often not strictly needed
    // if input constraints guarantee points are already normalized.
    const normalizedOrigin = originPoint % trackCircumference;
    const normalizedDestination = destinationPoint % trackCircumference;

    // Calculate the raw difference. If negative, it means we wrapped around the circle.
    let segmentLength = normalizedDestination - normalizedOrigin;
    if (segmentLength < 0) {
        segmentLength += trackCircumference; // Adjust for circular wrap-around
    }
    return segmentLength;
};

// Computes the distance between two points on a circular track, moving in a counter-clockwise direction.
// Parameters are similar to calculateClockwiseSegmentLength.
const calculateCounterClockwiseSegmentLength = (originPoint, destinationPoint, trackCircumference) => {
    const normalizedOrigin = originPoint % trackCircumference;
    const normalizedDestination = destinationPoint % trackCircumference;

    // The counter-clockwise distance from origin to destination is the clockwise distance
    // from destination to origin.
    let segmentLength = normalizedOrigin - normalizedDestination;
    if (segmentLength < 0) {
        segmentLength += trackCircumference; // Adjust for circular wrap-around
    }
    return segmentLength;
};

// Main function to process the input and determine the maximum possible total distance
// when visiting points in a specific manner on a circular track.
function determineMaxCircularRouteSum(sourceTextData) {
    // Validate the incoming text data. If it's empty or not a string, return 0
    // as no valid path can be formed.
    if (!sourceTextData || typeof sourceTextData !== 'string') {
        return 0;
    }

    // Split the entire input block into separate lines for parsing.
    const inputLinesArray = sourceTextData.split("\n");

    // The first line contains global configuration: track length and number of points.
    const configurationLine = inputLinesArray[0];
    const parsedConfiguration = configurationLine.split(" ").map(Number);

    const circuitTotalLength = parsedConfiguration[0]; // Represents 'L' from original problem
    const totalPointsToVisit = parsedConfiguration[1]; // Represents 'N' from original problem

    // Extract all subsequent lines, filtering out any empty strings and converting to numbers.
    // These are the coordinates of the points that must be visited.
    const targetCoordinates = inputLinesArray
        .slice(1) // Skip the configuration line
        .filter(lineStr => lineStr.trim() !== '') // Remove any blank lines
        .map(Number); // Convert string representations to actual numbers

    // A dynamic array to store the total travel distances for all completed paths.
    let accumulatedPathDistances = [];

    // Early exit if there are no points to visit, or if the parsed number of points
    // doesn't match the actual number of points extracted.
    if (totalPointsToVisit === 0 || targetCoordinates.length === 0) {
        return 0; // No points means no travel, so sum is 0.
    }
    // Optional: Add a check if totalPointsToVisit !== targetCoordinates.length
    // if strict input validation is required. For this clone, we assume targetCoordinates
    // is the definitive set.

    // This recursive function explores all possible sequences of visiting points.
    // Parameters:
    //   currentLocation: The coordinate where the traveler is currently located.
    //   remainingLocations: An array of coordinates that still need to be visited.
    //                       This array is always maintained in sorted order.
    //   currentTotalDistance: The sum of distances traveled up to the currentLocation.
    const explorePathVariations = (currentLocation, remainingLocations, currentTotalDistance) => {
        // Base case: If there are no locations left to visit, a complete path has been formed.
        if (remainingLocations.length === 0) {
            accumulatedPathDistances.push(currentTotalDistance); // Store this path's total distance
            return; // Terminate this recursive branch
        }

        // --- Branch 1: Choose the leftmost available location ---
        const nextLeftmostLocation = remainingLocations[0];
        // Calculate the distance to travel from the currentLocation to the nextLeftmostLocation (clockwise).
        const distanceToLeft = calculateClockwiseSegmentLength(currentLocation, nextLeftmostLocation, circuitTotalLength);

        // Create a new array for the left branch's remaining locations by copying and removing the first element.
        const leftBranchRemaining = [...remainingLocations];
        leftBranchRemaining.shift(); // Remove the chosen leftmost location

        // Recursively call to continue exploring from the nextLeftmostLocation.
        explorePathVariations(nextLeftmostLocation, leftBranchRemaining, currentTotalDistance + distanceToLeft);

        // --- Branch 2: Choose the rightmost available location ---
        const nextRightmostLocation = remainingLocations[remainingLocations.length - 1];
        // Calculate the distance to travel from the currentLocation to the nextRightmostLocation (counter-clockwise).
        const distanceToRight = calculateCounterClockwiseSegmentLength(currentLocation, nextRightmostLocation, circuitTotalLength);

        // Create a new array for the right branch's remaining locations by copying and removing the last element.
        const rightBranchRemaining = Array.from(remainingLocations); // Alternative copy method
        rightBranchRemaining.pop(); // Remove the chosen rightmost location

        // Recursively call to continue exploring from the nextRightmostLocation.
        explorePathVariations(nextRightmostLocation, rightBranchRemaining, currentTotalDistance + distanceToRight);
    };

    // Initiate the path exploration process:
    // Start at coordinate 0, with all target coordinates initially unvisited, and a total distance of 0.
    explorePathVariations(0, targetCoordinates, 0);

    // After all paths have been explored and their total distances recorded,
    // find and return the maximum distance among them.
    // If no paths were recorded (e.g., due to an unusual edge case), return 0.
    return accumulatedPathDistances.length > 0 ? Math.max(...accumulatedPathDistances) : 0;
}

// Entry point for the program:
// 1. Acquire the raw input data from stdin.
// 2. Process the data to find the maximum circular route sum.
// 3. Output the final result to the console.
const programExecutionStart = () => {
    const rawInputContent = acquireRawData();
    const computedMaxSum = determineMaxCircularRouteSum(rawInputContent);
    console.log(computedMaxSum);
};

// Execute the program.
programExecutionStart();