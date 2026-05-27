const fileSystem = require("fs");

(function() {
    const rawInputContent = fileSystem.readFileSync("/dev/stdin", "UTF-8");
    const processedInputLines = rawInputContent.split("\n");

    function processGraphAndFindCycle(graphDescriptionLines) {
        const [nodeCount, edgeCount] = graphDescriptionLines[0].split(" ").map(Number);

        const adjacencyStructure = Array.from({ length: nodeCount }, () => []);

        for (let currentEdgeIndex = 1; currentEdgeIndex <= edgeCount; currentEdgeIndex++) {
            const [sourceNode, targetNode] = graphDescriptionLines[currentEdgeIndex].split(" ").map(s => Number(s) - 1);
            adjacencyStructure[sourceNode].push(targetNode);
        }

        function depthFirstTraversal(currentNode, pathTracker, currentPathLength, initialTraversalNode) {
            pathTracker.add(currentNode);

            const neighborsOfCurrent = adjacencyStructure[currentNode];

            for (const nextNodeCandidate of neighborsOfCurrent) {
                if (nextNodeCandidate === initialTraversalNode) {
                    console.log(currentPathLength + 1);

                    const cycleNodesOrdered = Array.from(pathTracker).sort((a, b) => a - b);
                    for (const nodeInCycle of cycleNodesOrdered) {
                        console.log(nodeInCycle + 1);
                    }
                    return true;
                }

                if (!pathTracker.has(nextNodeCandidate)) {
                    if (depthFirstTraversal(nextNodeCandidate, pathTracker, currentPathLength + 1, initialTraversalNode)) {
                        return true;
                    }
                }
            }

            pathTracker.delete(currentNode);
            return false;
        }

        for (let entryPointNode = 0; entryPointNode < nodeCount; entryPointNode++) {
            const currentPathSet = new Set();
            if (depthFirstTraversal(entryPointNode, currentPathSet, 0, entryPointNode)) {
                return;
            }
        }

        console.log(-1);
    }

    processGraphAndFindCycle(processedInputLines);
})();
