function processGraphData(rawData) {
    const minPathValue = -100000000000000;

    const [nodeCount, edgeCount] = rawData[0].split(" ").map(Number);

    const adjacencyMap = new Map();
    rawData.slice(1, 1 + edgeCount).forEach(line => {
        const [sourceNode, targetNode, edgeWeight] = line.split(" ").map(Number);
        const adjustedSource = sourceNode - 1;
        const adjustedTarget = targetNode - 1;

        if (!adjacencyMap.has(adjustedSource)) {
            adjacencyMap.set(adjustedSource, []);
        }
        adjacencyMap.get(adjustedSource).push({ destination: adjustedTarget, weight: edgeWeight });
    });

    let pathLengths = Array(nodeCount).fill(minPathValue);
    pathLengths[0] = 0;

    // First relaxation phase: n passes, considering nodes 0 to n-2 as sources
    Array.from({ length: nodeCount }).forEach(() => { // Simulates outer k loop
        Array.from({ length: nodeCount - 1 }).forEach((_, currentSourceIdx) => { // Simulates inner i loop (0 to n-2)
            if (pathLengths[currentSourceIdx] === minPathValue) {
                return; // Equivalent to continue
            }
            (adjacencyMap.get(currentSourceIdx) || []).forEach(edge => { // Simulates innermost j loop
                if (pathLengths[edge.destination] < pathLengths[currentSourceIdx] + edge.weight) {
                    pathLengths[edge.destination] = pathLengths[currentSourceIdx] + edge.weight;
                }
            });
        });
    });

    let positiveCycleDetected = false;

    // Second phase: n passes, considering all nodes 0 to n-1 as sources, with cycle detection
    for (let passIteration = 0; passIteration < nodeCount; passIteration++) { // Simulates outer k loop
        for (let currentSourceIdx = 0; currentSourceIdx < nodeCount; currentSourceIdx++) { // Simulates inner i loop (0 to n-1)
            // Original code had `if (dist[t] === inf)` here, where `t` was uninitialized.
            // This line was effectively dead code or a bug that didn't prevent relaxation.
            // Therefore, no `if (pathLengths[currentSourceIdx] === minPathValue)` check is performed here,
            // replicating the original's behavior where paths from `minPathValue` nodes could still be relaxed.
            
            const edgesFromCurrentSource = adjacencyMap.get(currentSourceIdx) || [];
            for (let edgeIndex = 0; edgeIndex < edgesFromCurrentSource.length; edgeIndex++) { // Simulates innermost j loop
                const edge = edgesFromCurrentSource[edgeIndex];
                if (pathLengths[edge.destination] < pathLengths[currentSourceIdx] + edge.weight) {
                    pathLengths[edge.destination] = pathLengths[currentSourceIdx] + edge.weight;
                    if (currentSourceIdx === nodeCount - 1) {
                        positiveCycleDetected = true;
                        break; // Breaks from edgeIndex loop
                    }
                }
            }
            if (positiveCycleDetected) {
                break; // Breaks from currentSourceIdx loop
            }
        }
        // The passIteration loop continues to run for `nodeCount` times,
        // but if `positiveCycleDetected` is true, the inner loop will break immediately in subsequent iterations.
    }

    if (positiveCycleDetected) {
        console.log("inf");
    } else {
        console.log(pathLengths[nodeCount - 1]);
    }
}

processGraphData(require("fs").readFileSync("/dev/stdin", "utf8").split("\n"));
