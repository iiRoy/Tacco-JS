const rawInputData = `10 58
9 1 6 7 8 4 3 2 10 5
695279662 988782657 -119067776 382975538 -151885171 -177220596 -169777795 37619092 389386780 980092719`;

// --- Input Processing ---
const inputParts = rawInputData.split('\n');
const [nodeCountStr, stepLimitStr] = inputParts[0].split(' ');
const nodeCount = parseInt(nodeCountStr, 10);
const stepLimit = parseInt(stepLimitStr, 10);

// Adjust path definitions to be 0-indexed for easier array access
const pathDefinitions = inputParts[1].split(' ').map(val => parseInt(val, 10) - 1);
// Score definitions can be used directly with 0-indexed node positions
const scoreDefinitions = inputParts[2].split(' ').map(val => parseInt(val, 10));

// --- Core Path Calculation Function ---
const calculatePathScore = (initialPositionOneBased, totalMoves, pointValues, nextNodeMap) => {
    let currentPositionZeroBased = initialPositionOneBased - 1; // Convert starting position to 0-indexed
    let currentAccumulatedPoints = 0;
    let overallHighestPoints = -Infinity; // Initialize with negative infinity to correctly handle all negative scores

    const pathTraversalHistory = []; // Stores node_index visited in order
    const nodeToVisitStepIndex = new Map(); // Maps node_index -> step_index in pathTraversalHistory

    for (let currentStep = 0; currentStep < totalMoves; currentStep++) {
        pathTraversalHistory.push(currentPositionZeroBased);
        nodeToVisitStepIndex.set(currentPositionZeroBased, currentStep);

        currentPositionZeroBased = nextNodeMap[currentPositionZeroBased]; // Move to the next node according to the map
        currentAccumulatedPoints += pointValues[currentPositionZeroBased]; // Add points obtained at the new node
        overallHighestPoints = Math.max(overallHighestPoints, currentAccumulatedPoints); // Update highest score achieved so far

        // Check for cycle detection
        if (nodeToVisitStepIndex.has(currentPositionZeroBased)) {
            const cycleStartStepIndex = nodeToVisitStepIndex.get(currentPositionZeroBased);
            const cyclePathLength = currentStep - cycleStartStepIndex + 1; // Length of the detected cycle
            const movesRemainingAfterCycleDetection = totalMoves - (currentStep + 1); // Steps left after this move

            let cycleTotalPoints = 0;
            let maxRelativeCyclePoints = -Infinity; // Max points within one cycle, relative to cycle start (0 initial)

            // Simulate one full cycle to determine its total points and maximum relative points
            let tempCycleWalkerNode = pathTraversalHistory[cycleStartStepIndex]; // Node where the cycle begins
            let tempCycleAccumulator = 0;
            for (let c = 0; c < cyclePathLength; c++) {
                tempCycleWalkerNode = nextNodeMap[tempCycleWalkerNode]; // Move through the cycle
                tempCycleAccumulator += pointValues[tempCycleWalkerNode];
                maxRelativeCyclePoints = Math.max(maxRelativeCyclePoints, tempCycleAccumulator);
            }
            cycleTotalPoints = tempCycleAccumulator;

            // If the cycle does not add value (or is negative), we don't repeat it
            if (cycleTotalPoints <= 0) {
                return overallHighestPoints; // The max score is already tracked up to this point
            } else {
                // If the cycle adds value, we can repeat it
                const fullCycleRepetitions = Math.floor(movesRemainingAfterCycleDetection / cyclePathLength);
                const partialCycleMoves = movesRemainingAfterCycleDetection % cyclePathLength;

                // `scorePriorToCycleRepeats` is the accumulated score at the point the cycle was first completed
                // (i.e., after `currentStep + 1` moves).
                const scorePriorToCycleRepeats = currentAccumulatedPoints;
                
                // Scenario 1: Max is achieved within one of the full cycle repetitions.
                // We consider adding `maxRelativeCyclePoints` to the score after `k_rep` full cycle traversals.
                // This covers the highest score at any point within the repeated cycles.
                for (let k_rep = 0; k_rep <= fullCycleRepetitions; k_rep++) {
                    overallHighestPoints = Math.max(overallHighestPoints, scorePriorToCycleRepeats + (k_rep * cycleTotalPoints) + maxRelativeCyclePoints);
                }

                // Scenario 2: Max is achieved within the partial cycle after all full repetitions.
                let partialCycleAccumulator = 0;
                let partialCycleWalkerNode = currentPositionZeroBased; // Where cycle was detected
                for (let p = 0; p < partialCycleMoves; p++) {
                    partialCycleWalkerNode = nextNodeMap[partialCycleWalkerNode];
                    partialCycleAccumulator += pointValues[partialCycleWalkerNode];
                    overallHighestPoints = Math.max(overallHighestPoints, scorePriorToCycleRepeats + (fullCycleRepetitions * cycleTotalPoints) + partialCycleAccumulator);
                }
                return overallHighestPoints;
            }
        }
    }
    // If the loop completes without detecting a cycle within totalMoves
    return overallHighestPoints;
};

// --- Main Execution ---
const ultimateMaximumScore = Array.from({ length: nodeCount }, (_, index) => index)
    .reduce((currentGlobalMax, zeroBasedStartNode) => {
        // Call the path calculation function for each possible starting node (converting to 1-based)
        return Math.max(currentGlobalMax, calculatePathScore(zeroBasedStartNode + 1, stepLimit, scoreDefinitions, pathDefinitions));
    }, -Infinity); // Initialize global max with negative infinity

console.log(ultimateMaximumScore);