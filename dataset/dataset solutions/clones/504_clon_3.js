// This script processes a series of network configurations, each defining a set of locations and routes
// with associated travel costs. The goal is to find the minimum cost to travel from a designated
// starting location to a destination location, with the special condition of being allowed to use
// one "free pass" on a single segment of the journey.

// Utilize Node.js's built-in file system module to synchronously read all input from standard input.
const rawInputContent = require('fs').readFileSync('/dev/stdin', 'utf8');

// A reusable utility function to parse a single line of space-separated numbers.
// It trims whitespace, splits the string into parts, and converts each part to a numeric value.
const parseNumericLine = (lineString) => {
    // Ensure the line is not empty or just whitespace before processing.
    if (!lineString || lineString.trim() === '') {
        // In a production scenario, one might throw an error or handle it differently.
        // For this problem, we assume valid input format.
        return [];
    }
    return lineString.trim().split(" ").map(Number);
};

// Define symbolic constants for the states used in the dynamic programming table.
// These states represent whether the free pass has been used and, if so, when.
// STATE_NO_PASS: The journey segment leading to the current location was paid for, and the free pass has not been used yet.
const STATE_NO_PASS = 0;
// STATE_PASS_JUST_USED: The journey segment leading to the current location was covered by the free pass.
// This state indicates the free pass was just consumed.
const STATE_PASS_JUST_USED = 1;
// STATE_PASS_USED_EARLIER: The free pass was used at some point *before* the current segment, and the current segment was paid for.
const STATE_PASS_USED_EARLIER = 2;
// Total number of distinct states for each location in the DP table.
const TOTAL_DP_STATES = 3;

// Split the entire raw input content into an array of individual lines.
// This array will be consumed line by line.
let inputDataLines = rawInputContent.trim().split("\n");

// Begin the main processing loop for multiple network configurations.
// The loop continues indefinitely until a specific termination condition is met.
while (true) {
    // Extract the network dimensions (number of locations and routes) from the first line of the current configuration.
    // The `shift()` method removes the first element from `inputDataLines` and returns it.
    const networkDimensions = parseNumericLine(inputDataLines.shift());

    // Check for the termination signal: a line with "0 0".
    // If found, it indicates the end of all network configurations.
    if (networkDimensions[0] === 0 && networkDimensions[1] === 0) {
        break; // Exit the main processing loop.
    }

    // Assign the extracted dimensions to clearly named variables.
    const numberOfLocations = networkDimensions[0]; // Corresponds to 'n' in the original code.
    const numberOfRoutes = networkDimensions[1];     // Corresponds to 'm' in the original code.

    // Define the fixed start and destination locations for each network.
    const initialLocation = 1;         // The starting point is always location 1.
    const finalDestination = numberOfLocations; // The destination is the last location 'N'.

    // Read all route definitions for the current network.
    // Each route is stored as an array: [Location A, Location B, Travel Cost].
    const definedRoutes = [];
    for (let i = 0; i < numberOfRoutes; i++) {
        definedRoutes.push(parseNumericLine(inputDataLines.shift()));
    }

    // Initialize the Dynamic Programming table to store minimum costs.
    // `minCosts[location_id][state_id]` will hold the minimum cost to reach `location_id`
    // in `state_id`. All costs are initially set to `Infinity` to represent unreachable states.
    const minCosts = Array.from({ length: numberOfLocations + 1 }, () =>
        Array.from({ length: TOTAL_DP_STATES }, () => Infinity)
    );

    // Set the initial condition: The cost to reach the `initialLocation` with `STATE_NO_PASS` is zero.
    minCosts[initialLocation][STATE_NO_PASS] = 0;

    // A queue for locations that need to be processed. This simulates a breadth-first search or
    // a simplified Dijkstra's algorithm (without a priority queue).
    let locationsToExplore = [initialLocation];
    // A set to keep track of locations whose outgoing edges have already been fully processed
    // in the current iteration of the main algorithm loop. This helps prevent redundant work.
    const fullyProcessedLocations = new Set();

    // Main graph traversal loop: continues as long as there are locations to explore.
    while (locationsToExplore.length > 0) {
        // Retrieve and remove the next location from the front of the queue.
        const currentLocation = locationsToExplore.shift();

        // If this location has already been fully processed, skip it to avoid cycles and redundant computations.
        if (fullyProcessedLocations.has(currentLocation)) {
            continue;
        }
        // Mark the current location as fully processed.
        fullyProcessedLocations.add(currentLocation);

        // Iterate through all available routes to find connections originating from or leading to the `currentLocation`.
        for (const routeDefinition of definedRoutes) {
            // Destructure the route details for clarity.
            const [pointA, pointB, segmentFare] = routeDefinition;

            // Helper function to apply cost updates for a given segment (origin to destination).
            // This encapsulates the complex DP state transition logic.
            const updateCostsForSegment = (originNode, destinationNode, costOfSegment) => {
                let costsWereUpdated = false; // Flag to track if any costs changed for `destinationNode`.

                // Retrieve the current minimum costs for the `originNode` in all states.
                const costAtOriginNoPass = minCosts[originNode][STATE_NO_PASS];
                const costAtOriginJustPass = minCosts[originNode][STATE_PASS_JUST_USED];
                const costAtOriginPassEarlier = minCosts[originNode][STATE_PASS_USED_EARLIER];

                // --- Scenario 1: Transition from STATE_NO_PASS at `originNode` ---
                if (costAtOriginNoPass !== Infinity) {
                    // Option A: Pay for this segment. `destinationNode` is reached in STATE_NO_PASS.
                    const newCostToDestNoPass = costAtOriginNoPass + costOfSegment;
                    if (newCostToDestNoPass < minCosts[destinationNode][STATE_NO_PASS]) {
                        minCosts[destinationNode][STATE_NO_PASS] = newCostToDestNoPass;
                        costsWereUpdated = true;
                    }
                    // Option B: Use the free pass on this segment. `destinationNode` is reached in STATE_PASS_JUST_USED.
                    // The cost for this segment is effectively zero.
                    const newCostToDestJustPass = costAtOriginNoPass;
                    if (newCostToDestJustPass < minCosts[destinationNode][STATE_PASS_JUST_USED]) {
                        minCosts[destinationNode][STATE_PASS_JUST_USED] = newCostToDestJustPass;
                        costsWereUpdated = true;
                    }
                }

                // --- Scenario 2: Transition from STATE_PASS_JUST_USED at `originNode` ---
                if (costAtOriginJustPass !== Infinity) {
                    // This is a crucial and somewhat unusual transition as per the original code's logic:
                    // If the free pass was *just used* to reach `originNode`, and we now move to `destinationNode`,
                    // the original code implies this segment from `originNode` to `destinationNode` is also free,
                    // and `destinationNode` is reached in `STATE_PASS_USED_EARLIER`.
                    // This effectively means a "double free" or an extension of the free pass for one more segment
                    // when transitioning from STATE_PASS_JUST_USED to STATE_PASS_USED_EARLIER.
                    // If it were a standard paid segment, the update would be `costAtOriginJustPass + costOfSegment`.
                    if (costAtOriginJustPass < minCosts[destinationNode][STATE_PASS_USED_EARLIER]) {
                        minCosts[destinationNode][STATE_PASS_USED_EARLIER] = costAtOriginJustPass;
                        costsWereUpdated = true;
                    }
                }

                // --- Scenario 3: Transition from STATE_PASS_USED_EARLIER at `originNode` ---
                if (costAtOriginPassEarlier !== Infinity) {
                    // Option A: Pay for this segment. `destinationNode` is reached and remains in STATE_PASS_USED_EARLIER.
                    const newCostToDestPassEarlier = costAtOriginPassEarlier + costOfSegment;
                    if (newCostToDestPassEarlier < minCosts[destinationNode][STATE_PASS_USED_EARLIER]) {
                        minCosts[destinationNode][STATE_PASS_USED_EARLIER] = newCostToDestPassEarlier;
                        costsWereUpdated = true;
                    }
                }

                // If any costs for the `destinationNode` were improved (updated),
                // and it hasn't been fully processed yet, add it to the queue for re-exploration.
                // This ensures that all paths and state transitions are properly considered.
                if (costsWereUpdated && !fullyProcessedLocations.has(destinationNode)) {
                    locationsToExplore.push(destinationNode);
                }
            };

            // Check if the current route involves the `currentLocation` as either its start or end point.
            if (pointA === currentLocation) {
                // If `currentLocation` is `pointA`, process the route from `pointA` to `pointB`.
                updateCostsForSegment(pointA, pointB, segmentFare);
            } else if (pointB === currentLocation) {
                // If `currentLocation` is `pointB`, process the route from `pointB` to `pointA`.
                updateCostsForSegment(pointB, pointA, segmentFare);
            }
        }
    }

    // After the graph traversal completes, calculate the overall minimum cost to reach the `finalDestination`.
    let overallMinJourneyCost = Infinity;

    // Iterate through all possible DP states at the `finalDestination`.
    // As per the original problem logic, `STATE_PASS_JUST_USED` (index 1) is explicitly excluded from the final comparison.
    // This implies that the journey must not terminate with the free pass having been used on the very last segment.
    for (let stateIdx = 0; stateIdx < TOTAL_DP_STATES; stateIdx++) {
        if (stateIdx !== STATE_PASS_JUST_USED) { // Exclude the state where the pass was just used to reach the destination.
            overallMinJourneyCost = Math.min(overallMinJourneyCost, minCosts[finalDestination][stateIdx]);
        }
    }

    // Output the calculated minimum cost for the current network configuration.
    console.log(overallMinJourneyCost);
}