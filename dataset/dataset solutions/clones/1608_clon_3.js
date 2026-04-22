// Function responsible for orchestrating the game data processing and solution calculation.
function ProcessGameData(rawDataInput) {
    // Stage 1: Initial Input Parsing and Data Extraction
    // First, clean the raw input string, then split it into individual lines.
    // Each line is further split by spaces to separate numerical values.
    const parsedInputLines = rawDataInput.trim().split("\n").map(lineSegment => lineSegment.split(" "));

    // Extract the primary game parameters: total number of celestial bodies (nodes)
    // and the maximum allowable movements (steps).
    // Using Number() for explicit type conversion from string to numeric.
    const totalNodes = Number(parsedInputLines[0][0]);
    const maxMoves = Number(parsedInputLines[0][1]);

    // Parse the navigation directives (P_i) and associated score values (C_i) for each node.
    // Note: The problem often uses 1-indexed values for P_i, so we convert them to 0-indexed
    // for seamless array access in JavaScript (P_i - 1).
    const nextPlanetMappings = parsedInputLines[1].map(strValue => Number(strValue) - 1);
    const planetScoreValues = parsedInputLines[2].map(strValue => Number(strValue));

    // Initialize a tracking array to mark nodes that have been included in a detected cycle.
    // This prevents reprocessing the same cycle multiple times.
    const visitedNodesTracker = new Array(totalNodes).fill(false);

    // This variable will hold the highest score found across all possible paths and cycles.
    // Initialized to negative infinity to ensure any valid score is greater.
    let overallHighestScore = -Infinity;

    // Stage 2: Pre-computation Guard Clauses
    // If there are no moves or no nodes, the score is trivially 0.
    if (maxMoves <= 0 || totalNodes <= 0) {
        console.log(0);
        return;
    }

    // Stage 3: Cycle Detection and Score Evaluation
    // Iterate through each potential starting node (planet) in the system.
    // We only initiate a cycle detection if the node hasn't been visited yet.
    for (let currentNodeIndex = 0; currentNodeIndex < totalNodes; ++currentNodeIndex) {
        // Skip nodes that are already part of an identified cycle.
        if (visitedNodesTracker[currentNodeIndex]) {
            continue;
        }

        // --- Sub-stage 3.1: Identify a New Cycle ---
        const currentCyclePath = []; // Stores the sequence of nodes in the current cycle.
        let cyclePathTotalValue = 0; // Sum of scores for one full traversal of this cycle.

        let cycleTraversalPointer = currentNodeIndex;
        const cycleStartingNode = currentNodeIndex;

        // Traverse the cycle. A do-while structure is suitable here as we always take at least one step.
        // Continue until we loop back to the cycle's starting node.
        do {
            visitedNodesTracker[cycleTraversalPointer] = true; // Mark node as visited.

            // Add the current node's data (its 0-indexed position and score) to the cycle path.
            currentCyclePath.push({
                position: cycleTraversalPointer,
                score: planetScoreValues[cycleTraversalPointer]
            });
            cyclePathTotalValue += planetScoreValues[cycleTraversalPointer];

            // Move to the next planet as per the navigation mappings.
            cycleTraversalPointer = nextPlanetMappings[cycleTraversalPointer];
        } while (cycleTraversalPointer !== cycleStartingNode);

        const cycleLength = currentCyclePath.length;

        // --- Sub-stage 3.2: Calculate Maximum Score within the Current Cycle ---
        let maxScoreFromPartialTraversal = -Infinity; // Tracks the best score from a partial path.

        // Determine the effective number of steps to consider within a single cycle traversal.
        // This is crucial for optimizing score calculation based on `maxMoves` and `cyclePathTotalValue`.
        let effectiveStepsConsidered;
        if (maxMoves <= cycleLength) {
            // If total moves are less than or equal to cycle length, we simply take `maxMoves` steps.
            effectiveStepsConsidered = maxMoves;
        } else if (cyclePathTotalValue > 0) {
            // If the cycle yields a positive score, we want to repeat it as much as possible.
            // The remainder steps are `maxMoves % cycleLength`. If 0, it means a full cycle.
            effectiveStepsConsidered = maxMoves % cycleLength;
            if (effectiveStepsConsidered === 0) {
                effectiveStepsConsidered = cycleLength;
            }
        } else {
            // If cycle score is non-positive, repeating it is not beneficial or detrimental.
            // We only consider the best path up to `cycleLength` steps within one traversal.
            effectiveStepsConsidered = cycleLength;
        }

        // Iterate through all possible starting points within the detected cycle.
        for (let startingOffset = 0; startingOffset < cycleLength; ++startingOffset) {
            let currentAccumulatedPathScore = 0;
            // For each starting point, simulate taking `effectiveStepsConsidered` steps.
            for (let stepCounter = 0; stepCounter < effectiveStepsConsidered; ++stepCounter) {
                const actualNodeIndexInCycle = (startingOffset + stepCounter) % cycleLength;
                currentAccumulatedPathScore += currentCyclePath[actualNodeIndexInCycle].score;
                // Update the maximum score found for any such partial path.
                maxScoreFromPartialTraversal = Math.max(maxScoreFromPartialTraversal, currentAccumulatedPathScore);
            }
        }

        // --- Sub-stage 3.3: Combine Partial Path Score with Full Cycle Repetitions ---
        // Calculate the number of full cycle repetitions that contribute to the total score.
        // This accounts for moves beyond the `effectiveStepsConsidered` part.
        const numberOfFullCycleRepeats = Math.floor((maxMoves - effectiveStepsConsidered) / cycleLength);

        // Only add score from full cycles if the cycle's total value is positive.
        const scoreFromFullCycleIterations = Math.max(0, cyclePathTotalValue) * numberOfFullCycleRepeats;

        // Update the overall highest score with the best combination from this cycle.
        overallHighestScore = Math.max(overallHighestScore, maxScoreFromPartialTraversal + scoreFromFullCycleIterations);
    }

    // Stage 4: Output the Final Result
    console.log(overallHighestScore);
}

// Entry point: Read input from standard input and pass it to the main processing function.
ProcessGameData(require("fs").readFileSync("/dev/stdin", "utf8"));