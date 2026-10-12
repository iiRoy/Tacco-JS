function ProcessInput(rawData) {
    // Trim whitespace, split by newlines, then split each line by spaces
    // and parse numbers where appropriate.
    let processedLines = rawData.trim().split("\n").map(function(lineSegment) {
        return lineSegment.split(" ");
    });

    // Extract N (number of elements) and K (number of steps) from the first line
    let numElements = parseInt(processedLines[0][0], 10);
    let numSteps = parseInt(processedLines[0][1], 10);

    // Parse the permutation array (v_P in original)
    let permutationArr = processedLines[1].map(elementStr => parseInt(elementStr, 10));
    // Parse the score array (v_C in original)
    let scoreArr = processedLines[2].map(elementStr => parseInt(elementStr, 10));

    // Initialize a boolean array to keep track of visited nodes in cycles
    let visitedFlags = Array.from({length: numElements}, () => false);

    // This array will store all identified cycles. Each cycle is an array of [node_index, score] pairs.
    let cyclesList = [];

    // Variables for cycle detection and score calculation
    let cycleStartIdx, currentIdx, nextIdx, currentPathScore, currentCycleTotalScore;
    // Initialize the maximum overall score to negative infinity
    let maxOverallScore = Number.NEGATIVE_INFINITY;

    // Iterate through each element to find cycles
    for (let elementIdx = 0; elementIdx < numElements; elementIdx++) {
        // If the current element hasn't been visited yet, start a new cycle detection
        if (!visitedFlags[elementIdx]) {
            // Add a new empty cycle to our list and add the starting node
            cyclesList.push([[elementIdx + 1, scoreArr[elementIdx]]]);
            currentCycleTotalScore = scoreArr[elementIdx]; // Initialize cycle sum with the first node's score
            cycleStartIdx = elementIdx + 1; // Store the starting node's 1-based index
            currentIdx = elementIdx + 1; // Current node in the cycle traversal

            // Traverse the cycle until we return to the starting node
            while (true) {
                visitedFlags[currentIdx - 1] = true; // Mark the current node as visited
                nextIdx = permutationArr[currentIdx - 1]; // Get the next node in the permutation
                if (cycleStartIdx === nextIdx) break; // If we've returned to the start, break the loop
                currentIdx = nextIdx; // Move to the next node
                currentCycleTotalScore += scoreArr[currentIdx - 1]; // Add its score to the cycle total
                cyclesList[cyclesList.length - 1].push([currentIdx, scoreArr[currentIdx - 1]]); // Add node to the current cycle
            }

            // Get the last detected cycle for processing
            let currentCycleNodes = cyclesList[cyclesList.length - 1].slice();
            let maxPathInCycle = Number.NEGATIVE_INFINITY; // Max score for a path within this cycle

            // Determine the effective number of steps to consider within a single cycle traversal
            let effectiveSteps;
            if (numSteps <= currentCycleNodes.length) {
                // If K is less than or equal to cycle length, we can't complete a full cycle
                effectiveSteps = numSteps;
            } else if (currentCycleTotalScore > 0) {
                // If K is greater than cycle length and the cycle has a positive total score,
                // we can potentially traverse the cycle multiple times.
                // The remainder of steps after full cycles determines the path within the last cycle.
                effectiveSteps = numSteps % currentCycleNodes.length;
                if (effectiveSteps === 0) {
                    effectiveSteps = currentCycleNodes.length; // If remainder is 0, it means a full cycle traversal
                }
            } else {
                // If K is greater than cycle length but the cycle has a non-positive total score,
                // we only consider paths up to the cycle length to avoid negative contributions from full cycles.
                effectiveSteps = currentCycleNodes.length;
            }

            // Iterate through all possible starting points in the cycle
            for (let startNodeOffset = 0; startNodeOffset < currentCycleNodes.length; startNodeOffset++) {
                currentPathScore = 0; // Reset path score for each new starting point
                // Calculate the score for a path of 'effectiveSteps' length starting from 'startNodeOffset'
                for (let pathNodeOffset = startNodeOffset; pathNodeOffset < startNodeOffset + effectiveSteps; pathNodeOffset++) {
                    let wrappedNodeOffset = pathNodeOffset % currentCycleNodes.length; // Handle wrapping around the cycle
                    currentPathScore += currentCycleNodes[wrappedNodeOffset][1]; // Add score of the node
                    maxPathInCycle = Math.max(maxPathInCycle, currentPathScore); // Update max path score
                }
            }

            // Calculate the total score for the current cycle configuration
            // This involves the max path found within the cycle (maxPathInCycle)
            // plus the contribution from full cycle traversals.
            // Full cycle traversals only contribute if the cycle's total score is positive.
            // The number of full cycles is (numSteps - effectiveSteps) / currentCycleNodes.length.
            maxOverallScore = Math.max(maxOverallScore, maxPathInCycle + Math.max(0, currentCycleTotalScore) * ((numSteps - effectiveSteps) / currentCycleNodes.length));
        }
    }

    // Output the final maximum overall score
    console.log(maxOverallScore);
}

// Read input from stdin and pass it to the main processing function
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
