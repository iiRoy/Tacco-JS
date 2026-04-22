const fileSystem = require('fs');

// This code explores paths on a graph, managing an energy resource
// to find the minimum accumulated time to reach a specific destination point.

// --- Input Data Acquisition and Initial Parsing ---

// Read all raw input data from the standard input stream.
// Each line represents either graph parameters, point elevations, or connection details.
const rawInputContent = fileSystem.readFileSync('/dev/stdin', 'utf8');

// Split the raw content into individual lines and filter out any empty lines.
const dataEntryLines = rawInputContent.split('\n').filter(line => line.trim().length > 0);

/**
 * Parses a string containing space-separated numbers into an array of integers.
 * @param {string} inputString - The string to parse (e.g., "10 5 100").
 * @returns {number[]} An array of parsed integer values.
 */
function parseSpaceSeparatedNumbers(inputString) {
    return inputString.split(' ').map(numStr => parseInt(numStr.trim(), 10));
}

// The very first line contains global graph parameters:
// total geographical points, total connections between them, and the initial energy at the start.
const [totalLocations, totalRoads, startingEnergyLevel] = parseSpaceSeparatedNumbers(dataEntryLines[0]);

// --- Data Structure Setup ---

// `locationAltitudes` stores an 'altitude' or 'capacity' value for each geographical point.
// This value is crucial for energy calculations during traversal.
const locationAltitudes = new Array(totalLocations).fill(0);

// `graphAdjacencyList` represents the graph using an adjacency list.
// Each element `graphAdjacencyList[i]` is an array of `RoadSegment` objects,
// detailing connections from point `i`.
const graphAdjacencyList = new Array(totalLocations).fill(null).map(() => []);

// Populate the `locationAltitudes` array from the input lines.
// These are the lines immediately following the initial parameter line.
for (let i = 0; i < totalLocations; i++) {
    locationAltitudes[i] = parseInt(dataEntryLines[i + 1].trim(), 10);
}

/**
 * Defines a road segment (edge) in the graph.
 * @class
 * @param {number} destinationNodeId - The identifier of the point this road leads to.
 * @param {number} segmentTravelCost - The cost (time/resource consumption) to traverse this segment.
 */
class RoadSegment {
    constructor(destinationNodeId, segmentTravelCost) {
        this.destinationNodeId = destinationNodeId;
        this.segmentTravelCost = segmentTravelCost;
    }
}

// Populate the `graphAdjacencyList` with road segments.
// Connection data begins after all location altitudes have been read.
for (let i = 0; i < totalRoads; i++) {
    const rawSegmentData = parseSpaceSeparatedNumbers(dataEntryLines[i + totalLocations + 1]);
    // Adjust point identifiers to be 0-based for array indexing.
    const originPoint = rawSegmentData[0] - 1;
    const terminalPoint = rawSegmentData[1] - 1;
    const segmentCost = rawSegmentData[2];

    // Basic validation: ensure traversal cost is positive. Skip invalid segments.
    if (segmentCost <= 0) {
        // console.warn(`Skipping road segment with non-positive cost between ${originPoint} and ${terminalPoint}.`);
        continue;
    }

    // Add bidirectional road segments to the adjacency list.
    graphAdjacencyList[originPoint].push(new RoadSegment(terminalPoint, segmentCost));
    graphAdjacencyList[terminalPoint].push(new RoadSegment(originPoint, segmentCost));
}

/**
 * Encapsulates the state of the search at any given point.
 * @class
 * @param {number} currentLocationId - The current point in the graph.
 * @param {number} totalElapsedJourneyTime - The cumulative time taken to reach this state.
 * @param {number} currentEnergyLevel - The energy remaining upon reaching this state.
 * @param {number[]} pathVisitedNodes - An ordered list of node IDs visited to reach this state.
 */
class SearchPathState {
    constructor(currentLocationId, totalElapsedJourneyTime, currentEnergyLevel, pathVisitedNodes) {
        this.currentLocationId = currentLocationId;
        this.totalElapsedJourneyTime = totalElapsedJourneyTime;
        this.currentEnergyLevel = currentEnergyLevel;
        this.pathVisitedNodes = pathVisitedNodes;
    }
}

// --- Pathfinding Algorithm (Depth-First Search Variant) ---

// The `explorationStack` acts as the frontier for our depth-first search.
// It holds `SearchPathState` objects awaiting exploration.
const explorationStack = [];

// Initialize the search with the starting state:
// at point 0, with 0 time, initial energy, and path containing only point 0.
explorationStack.push(new SearchPathState(0, 0, startingEnergyLevel, [0]));

// `minimumCompletionTimeFound` tracks the shortest time to reach the destination.
// Initialized to a very large number, as we are looking for a minimum.
let minimumCompletionTimeFound = Infinity;

// Continue the search as long as there are states in the stack to explore.
while (explorationStack.length > 0) {
    // Retrieve the most recent state from the stack (LIFO behavior).
    const currentPathState = explorationStack.pop();

    // Check if we have reached the destination (the last point, `totalLocations - 1`).
    if (currentPathState.currentLocationId === totalLocations - 1) {
        // If so, calculate the final adjusted time for this path and update the minimum.
        // The adjustment involves the destination's altitude and remaining energy.
        const finalAdjustedTime = currentPathState.totalElapsedJourneyTime +
                                 locationAltitudes[totalLocations - 1] -
                                 currentPathState.currentEnergyLevel;
        minimumCompletionTimeFound = Math.min(minimumCompletionTimeFound, finalAdjustedTime);
        // This path has reached its end, so move to the next state in the stack.
        continue;
    }

    // Explore all outgoing road segments (connections) from the current point.
    for (const segment of graphAdjacencyList[currentPathState.currentLocationId]) {
        const nextLocationId = segment.destinationNodeId;
        const currentSegmentCost = segment.segmentTravelCost;

        // Skip this segment if the `nextLocationId` has already been visited in the current path.
        // This prevents infinite loops in cyclic graphs and ensures simple paths.
        if (currentPathState.pathVisitedNodes.includes(nextLocationId)) {
            continue;
        }

        // --- Core Logic: Calculate New Energy and Time for the Next State ---

        // Retrieve altitude/capacity values for the current and next locations.
        const currentLocElevation = locationAltitudes[currentPathState.currentLocationId];
        const nextLocElevation = locationAltitudes[nextLocationId];
        const energyBeforeTraversal = currentPathState.currentEnergyLevel;

        // Condition 1: Cannot traverse if the current location's elevation (minimum required energy)
        // is less than the cost of the road segment.
        if (currentLocElevation < currentSegmentCost) {
            continue; // This segment is impassable from the current state.
        }

        let newTotalJourneyTime;
        let newEnergyAfterTraversal;

        // Condition 2: If the sum of the next location's elevation and the segment cost
        // is less than the energy available before traversal.
        // This implies an energy surplus, potentially allowing for "recharge" up to the next location's elevation.
        if (nextLocElevation + currentSegmentCost < energyBeforeTraversal) {
            newTotalJourneyTime = currentPathState.totalElapsedJourneyTime + (energyBeforeTraversal - nextLocElevation);
            newEnergyAfterTraversal = nextLocElevation;
        }
        // Condition 3: If the sum of the next location's elevation and segment cost
        // is greater than or equal to current energy, AND current energy is
        // sufficient for the segment cost. This is a direct energy consumption case.
        else if (nextLocElevation + currentSegmentCost >= energyBeforeTraversal && energyBeforeTraversal >= currentSegmentCost) {
            newTotalJourneyTime = currentPathState.totalElapsedJourneyTime + currentSegmentCost;
            newEnergyAfterTraversal = energyBeforeTraversal - currentSegmentCost;
        }
        // Condition 4 (Else): Covers all other scenarios, typically when energy is low
        // but the segment is still traversable (due to `currentLocElevation` check).
        // This implies a penalty to time and energy depletion.
        else {
            newTotalJourneyTime = currentPathState.totalElapsedJourneyTime + (2 * currentSegmentCost - energyBeforeTraversal);
            newEnergyAfterTraversal = 0; // Energy is fully depleted after this traversal.
        }

        // Create a new `SearchPathState` for the `nextLocationId` and add it to the stack.
        // The path history is updated by appending the `nextLocationId`.
        const updatedPathHistory = currentPathState.pathVisitedNodes.concat(nextLocationId);
        explorationStack.push(new SearchPathState(nextLocationId, newTotalJourneyTime, newEnergyAfterTraversal, updatedPathHistory));
    }
}

// Print the overall minimum time found to reach the destination point.
console.log(minimumCompletionTimeFound);