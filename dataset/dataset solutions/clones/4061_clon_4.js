function ProcessGraphRelations(rawData) {
    const lines = rawData.split("\n");
    const dimensions = lines[0].split(" ").map(Number);
    const nodeCount = dimensions[0];
    const constraintCount = dimensions[1];

    const constraintList = [];
    for (let k = 0; k < constraintCount; k++) {
        const [nodeA, nodeB, diffVal] = lines[k + 1].split(" ").map(Number);
        constraintList.push({ nodeA: nodeA - 1, nodeB: nodeB - 1, diffVal: diffVal });
    }

    const parentArray = Array.from({ length: nodeCount }, (_, i) => i);
    const offsetArray = Array(nodeCount).fill(0); // offsetArray[i] = value[i] - value[parentArray[i]]

    function findRootAndOffset(idx) {
        if (parentArray[idx] === idx) {
            return { rootNode: idx, rootOffset: 0 };
        }
        const { rootNode: currentParent, rootOffset: offsetToParent } = findRootAndOffset(parentArray[idx]);
        parentArray[idx] = currentParent; // Path compression
        offsetArray[idx] += offsetToParent; // Accumulate offset
        return { rootNode: currentParent, rootOffset: offsetArray[idx] };
    }

    let outcome = "Yes";

    for (const currentConstraint of constraintList) {
        const { nodeA, nodeB, diffVal } = currentConstraint;

        const { rootNode: rootA, rootOffset: offsetA } = findRootAndOffset(nodeA);
        const { rootNode: rootB, rootOffset: offsetB } = findRootAndOffset(nodeB);

        if (rootA !== rootB) {
            // Merge rootB's component into rootA's component
            parentArray[rootB] = rootA;
            // We know: value[nodeB] - value[nodeA] = diffVal
            // Also: value[nodeB] = value[rootB] + offsetB
            // And: value[nodeA] = value[rootA] + offsetA
            // So: (value[rootB] + offsetB) - (value[rootA] + offsetA) = diffVal
            // We want offsetArray[rootB] = value[rootB] - value[rootA]
            // value[rootB] - value[rootA] = diffVal - offsetB + offsetA
            offsetArray[rootB] = diffVal - offsetB + offsetA;
        } else {
            // Already in the same component, check for consistency
            // We expect value[nodeB] - value[nodeA] = diffVal
            // From DSU: value[nodeB] - value[rootA] = offsetB
            // From DSU: value[nodeA] - value[rootA] = offsetA
            // So: (value[nodeB] - value[rootA]) - (value[nodeA] - value[rootA]) = offsetB - offsetA
            // Thus: value[nodeB] - value[nodeA] = offsetB - offsetA
            if (offsetB - offsetA !== diffVal) {
                outcome = "No";
                break;
            }
        }
    }

    console.log(outcome);
}

ProcessGraphRelations(require("fs").readFileSync("/dev/stdin", "utf8"));
