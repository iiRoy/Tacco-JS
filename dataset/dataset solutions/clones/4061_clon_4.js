function ExecuteProgram(rawData) {
    const lines = rawData.split("\n");

    const firstLineData = lines[0].split(" ").map(val => parseInt(val, 10));
    const totalNodes = firstLineData[0];
    const totalEdges = firstLineData[1];

    let componentTracker = Array(totalNodes);
    let relativePosition = Array(totalNodes); // relativePosition[i] stores value[i] - value[componentTracker[i]]

    for (let i = 0; i < totalNodes; i++) {
        componentTracker[i] = i;
        relativePosition[i] = 0;
    }

    // Recursively finds the ultimate root of a node's component
    // and performs path compression by updating relativePosition for all nodes on the path.
    function locateComponentRoot(nodeIndex) {
        if (componentTracker[nodeIndex] === nodeIndex) {
            return nodeIndex;
        }
        const currentRootParent = locateComponentRoot(componentTracker[nodeIndex]);
        relativePosition[nodeIndex] += relativePosition[componentTracker[nodeIndex]];
        componentTracker[nodeIndex] = currentRootParent;
        return currentRootParent;
    }

    let overallConsistency = true;

    for (let i = 0; i < totalEdges; i++) {
        const edgeDefinition = lines[i + 1].split(" ").map(val => parseInt(val, 10));
        const originNode = edgeDefinition[0] - 1; // Convert to 0-indexed
        const destinationNode = edgeDefinition[1] - 1; // Convert to 0-indexed
        const requiredDelta = edgeDefinition[2]; // value[destinationNode] - value[originNode] = requiredDelta

        const rootOfOrigin = locateComponentRoot(originNode);
        const rootOfDestination = locateComponentRoot(destinationNode);

        if (rootOfOrigin !== rootOfDestination) {
            // The nodes are in different components, merge them
            // We attach the destination's root component to the origin's root component
            componentTracker[rootOfDestination] = rootOfOrigin;
            
            // Calculate the relative position of the destination's root with respect to the origin's root.
            // We want relativePosition[rootOfDestination] = value[rootOfDestination] - value[rootOfOrigin]
            //
            // We know:
            // 1. value[destinationNode] - value[originNode] = requiredDelta
            // 2. value[originNode] = value[rootOfOrigin] + relativePosition[originNode]
            // 3. value[destinationNode] = value[rootOfDestination] + relativePosition[destinationNode]
            //
            // Substituting (2) and (3) into (1):
            // (value[rootOfDestination] + relativePosition[destinationNode]) - (value[rootOfOrigin] + relativePosition[originNode]) = requiredDelta
            //
            // Rearranging to find value[rootOfDestination] - value[rootOfOrigin]:
            // value[rootOfDestination] - value[rootOfOrigin] = requiredDelta + relativePosition[originNode] - relativePosition[destinationNode]
            //
            // So, update relativePosition[rootOfDestination] with this calculated difference:
            relativePosition[rootOfDestination] = requiredDelta + relativePosition[originNode] - relativePosition[destinationNode];
        } else {
            // The nodes are already in the same component, check for consistency
            // The current difference implied by the component structure is:
            // (value[destinationNode] - value[rootOfOrigin]) - (value[originNode] - value[rootOfOrigin])
            // which simplifies to relativePosition[destinationNode] - relativePosition[originNode]
            if (relativePosition[destinationNode] - relativePosition[originNode] !== requiredDelta) {
                overallConsistency = false;
                break; // Inconsistency found, no need to process further relations
            }
        }
    }

    if (overallConsistency) {
        console.log("Yes");
    } else {
        console.log("No");
    }
}

ExecuteProgram(require("fs").readFileSync("/dev/stdin", "utf8"));