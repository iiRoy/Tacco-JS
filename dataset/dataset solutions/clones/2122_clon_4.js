function processNetwork(dataLines) {
    const parseNumbers = (line) => line.split(" ").map(s => Number(s));

    const [numNodes, numFriendships, numBlocks] = parseNumbers(dataLines[0]);

    // Functional Disjoint Set Union (DSU) implementation
    const createDisjointSets = (nodeCount) => {
        const parentOf = Array.from({ length: nodeCount }, (_, i) => i);
        const groupSizes = Array.from({ length: nodeCount }, () => 1);

        // Recursive find with path compression
        const locateRepresentative = (element) => {
            if (parentOf[element] === element) {
                return element;
            }
            parentOf[element] = locateRepresentative(parentOf[element]);
            return parentOf[element];
        };

        // Union by size
        const mergeSets = (elementA, elementB) => {
            let rootA = locateRepresentative(elementA);
            let rootB = locateRepresentative(elementB);

            if (rootA !== rootB) {
                // Attach smaller tree under root of larger tree
                if (groupSizes[rootA] < groupSizes[rootB]) {
                    [rootA, rootB] = [rootB, rootA]; // Swap to ensure rootA is larger or equal
                }
                parentOf[rootB] = rootA;
                groupSizes[rootA] += groupSizes[rootB];
                return true; // Sets were combined
            }
            return false; // Already in the same set
        };

        return { locateRepresentative, mergeSets, groupSizes };
    };

    // Create a map to track excluded connections for each node
    const establishExclusionMap = (nodeCount) => {
        const exclusions = new Map();
        for (let i = 0; i < nodeCount; i++) {
            const nodeExclusions = new Set();
            nodeExclusions.add(i); // A node cannot be friends with itself
            exclusions.set(i, nodeExclusions);
        }
        return exclusions;
    };

    const recordExclusion = (registry, item1, item2) => {
        registry.get(item1).add(item2);
        registry.get(item2).add(item1);
    };

    const { locateRepresentative, mergeSets, groupSizes } = createDisjointSets(numNodes);
    const exclusionRegistry = establishExclusionMap(numNodes);

    let currentLineIndex = 1;

    // Process friendship connections
    for (let i = 0; i < numFriendships; i++) {
        const [personA, personB] = parseNumbers(dataLines[currentLineIndex++]).map(val => val - 1);
        mergeSets(personA, personB);
        recordExclusion(exclusionRegistry, personA, personB);
    }

    // Process block connections
    for (let i = 0; i < numBlocks; i++) {
        const [personA, personB] = parseNumbers(dataLines[currentLineIndex++]).map(val => val - 1);
        recordExclusion(exclusionRegistry, personA, personB);
    }

    const suggestedFriendCounts = new Array(numNodes);

    // Calculate potential friends for each node
    for (let i = 0; i < numNodes; i++) {
        const currentPersonRoot = locateRepresentative(i);
        const totalInCurrentGroup = groupSizes[currentPersonRoot];
        let actualExclusionsInSameGroup = 0;

        for (const excludedPeer of exclusionRegistry.get(i)) {
            if (locateRepresentative(excludedPeer) === currentPersonRoot) {
                actualExclusionsInSameGroup++;
            }
        }
        suggestedFriendCounts[i] = totalInCurrentGroup - actualExclusionsInSameGroup;
    }

    console.log(suggestedFriendCounts.join(" "));
}

processNetwork(require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n"));