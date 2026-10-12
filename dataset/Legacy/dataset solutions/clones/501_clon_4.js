const acquireInput = (sourcePath) => {
    return require('fs').readFileSync(sourcePath, 'utf8');
};

const parseProblemSets = (inputContent) => {
    const inputLines = inputContent.trim().split("\n");
    const problemSets = [];
    let currentLineIdx = 0;

    while (true) {
        const dimensions = inputLines[currentLineIdx++].split(" ").map(Number);
        const [vertexCount, edgeQuantity] = dimensions;
        if (vertexCount === 0 && edgeQuantity === 0) break;

        const edgeList = [];
        for (let i = 0; i < edgeQuantity; i++) {
            edgeList.push(inputLines[currentLineIdx++].split(" ").map(Number));
        }
        problemSets.push({ vertexCount, edgeQuantity, edgeList });
    }
    return problemSets;
};

const computeMinimumPath = (vertexCount, edgeQuantity, edgeList) => {
    const originVertex = 1;
    const destinationVertex = vertexCount;

    // DP table: Map<vertex, [costState0, costState1, costState2]>
    // minPathStates.get(node) returns an array [cost_state0, cost_state1, cost_state2]
    const minPathStates = new Map();
    for (let i = 1; i <= vertexCount; i++) {
        minPathStates.set(i, [Infinity, Infinity, Infinity]);
    }
    minPathStates.get(originVertex)[0] = 0;

    // Set of nodes whose costs have been updated and need to be processed in the current wave
    let processingQueue = new Set([originVertex]);

    // Bellman-Ford-like relaxation with a queue (Set)
    // The original code's `obj` behavior (preventing processing the same node multiple times in one `bomb` iteration)
    // is implicitly handled by `Set` uniqueness in `processingQueue`.
    // The critical `dp[d][1]=Infinity` reset for every edge is explicitly replicated.

    let loopCounter = 0;
    // Maximum iterations for convergence in a Bellman-Ford-like algorithm
    // (vertexCount * number_of_states) to account for path length and state changes.
    const maxRelaxations = vertexCount * 3; 

    while (processingQueue.size > 0 && loopCounter < maxRelaxations) {
        const nextProcessingQueue = new Set();
        // Convert the Set to an Array to iterate over a fixed snapshot for the current wave.
        const currentWaveVertices = Array.from(processingQueue); 

        for (const currentVtx of currentWaveVertices) {
            // The original code iterates over ALL edges (`ary.forEach`) for each `S` (currentVtx).
            // Inside that loop, it resets `dp[d][1]`.
            // To replicate this exact behavior, we must iterate over the full `edgeList` here.
            for (const [u_orig, v_orig, weightOfEdge] of edgeList) {
                // CRITICAL BEHAVIOR REPLICATION:
                // The original code `dp[d][1]=Infinity;` is executed for every edge in `ary.forEach`.
                // This means `minPathStates.get(destinationVertex)[1]` is reset `edgeQuantity` times
                // for EACH `currentVtx` processed in `currentWaveVertices`.
                minPathStates.get(destinationVertex)[1] = Infinity;

                let sourceNodeForRelaxation = -1;
                let targetNodeForRelaxation = -1;

                // Determine if the current `currentVtx` is one end of the `(u_orig, v_orig)` edge.
                // This simulates the `if (a==S)` or `else if (b==S)` logic from the original.
                if (u_orig === currentVtx) {
                    sourceNodeForRelaxation = u_orig;
                    targetNodeForRelaxation = v_orig;
                } else if (v_orig === currentVtx) {
                    sourceNodeForRelaxation = v_orig; // currentVtx is the source for relaxation
                    targetNodeForRelaxation = u_orig; // The other end is the target
                }

                // If this edge is connected to `currentVtx`, apply relaxation.
                if (sourceNodeForRelaxation !== -1) {
                    const sourceStates = minPathStates.get(sourceNodeForRelaxation);
                    const targetStates = minPathStates.get(targetNodeForRelaxation);
                    let stateChanged = false;

                    // Relaxation for state 0: Standard shortest path
                    // Original: dp[b][0]=Math.min(dp[b][0],dp[a][0]+f);
                    if (sourceStates[0] !== Infinity && sourceStates[0] + weightOfEdge < targetStates[0]) {
                        targetStates[0] = sourceStates[0] + weightOfEdge;
                        stateChanged = true;
                    }

                    // Relaxation for state 1: Special transition (cost is source's state 0 cost, ignoring edge weight)
                    // Original: dp[b][1]=Math.min(dp[b][1],dp[a][0]);
                    if (sourceStates[0] !== Infinity && sourceStates[0] < targetStates[1]) {
                        targetStates[1] = sourceStates[0];
                        stateChanged = true;
                    }

                    // Relaxation for state 2: Special transition (cost is source's state 1 cost, ignoring edge weight)
                    // Original: dp[b][2]=Math.min(dp[b][2],dp[a][1]);
                    if (sourceStates[1] !== Infinity && sourceStates[1] < targetStates[2]) {
                        targetStates[2] = sourceStates[1];
                        stateChanged = true;
                    }

                    // Relaxation for state 2: Normal transition (cost is source's state 2 cost + edge weight)
                    // Original: dp[b][2]=Math.min(dp[b][2],dp[a][2]+f);
                    if (sourceStates[2] !== Infinity && sourceStates[2] + weightOfEdge < targetStates[2]) {
                        targetStates[2] = sourceStates[2] + weightOfEdge;
                        stateChanged = true;
                    }

                    if (stateChanged) {
                        nextProcessingQueue.add(targetNodeForRelaxation);
                    }
                }
            }
        }
        processingQueue = nextProcessingQueue;
        loopCounter++;
    }

    let finalMinimumCost = Infinity;
    const destinationStates = minPathStates.get(destinationVertex);
    
    // Original: dp[d].forEach(function(v,i){ ans=Math.min(ans,v); });
    finalMinimumCost = Math.min(finalMinimumCost, destinationStates[0]);
    finalMinimumCost = Math.min(finalMinimumCost, destinationStates[1]);
    finalMinimumCost = Math.min(finalMinimumCost, destinationStates[2]);

    return finalMinimumCost;
};

// Main execution flow
const allProblemSets = parseProblemSets(acquireInput('/dev/stdin'));
for (const problemData of allProblemSets) {
    console.log(computeMinimumPath(problemData.vertexCount, problemData.edgeQuantity, problemData.edgeList));
}
