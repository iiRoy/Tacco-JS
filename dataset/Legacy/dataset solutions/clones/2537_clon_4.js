function processGraphInput(inputData) {
    inputData = inputData.split("\n");
    if (inputData[inputData.length - 1] === '') {
        inputData.pop();
    }

    const firstLineParts = inputData[0].split(' ');
    const nodeCount = Number(firstLineParts[0]);
    const edgeCount = Number(firstLineParts[1]);

    const adjacencyMap = new Map();
    for (let i = 1; i <= nodeCount; i++) {
        adjacencyMap.set(i, new Set());
    }

    for (let i = 1; i < inputData.length; i++) {
        const edgeParts = inputData[i].split(' ');
        const sourceNode = Number(edgeParts[0]);
        const targetNode = Number(edgeParts[1]);
        adjacencyMap.get(sourceNode).add(targetNode);
    }

    const cyclePath = locateShortestCycle(adjacencyMap, nodeCount);

    if (cyclePath) {
        const pathSegments = cyclePath.slice();
        pathSegments.shift();
        console.log(pathSegments.length);
        console.log(pathSegments.join("\n"));
    } else {
        console.log(-1);
    }
}

function locateShortestCycle(graphStructure, totalNodes) {
    for (let initialNode = 1; initialNode <= totalNodes; initialNode++) {
        const traversalQueue = [[initialNode, [initialNode]]];
        const visitedNodesForCurrentBFS = new Set();
        visitedNodesForCurrentBFS.add(initialNode);

        let queueHead = 0;

        while (queueHead < traversalQueue.length) {
            const [currentNodeInTraversal, currentPathSequence] = traversalQueue[queueHead++];

            const neighbors = graphStructure.get(currentNodeInTraversal);
            if (neighbors) {
                for (const nextNodeInPath of neighbors) {
                    if (nextNodeInPath === initialNode) {
                        const detectedCycle = currentPathSequence.concat([nextNodeInPath]);
                        return detectedCycle;
                    }

                    if (!visitedNodesForCurrentBFS.has(nextNodeInPath)) {
                        visitedNodesForCurrentBFS.add(nextNodeInPath);
                        traversalQueue.push([nextNodeInPath, currentPathSequence.concat([nextNodeInPath])]);
                    }
                }
            }
        }
    }

    return null;
}

processGraphInput(require("fs").readFileSync("/dev/stdin", "utf8"));
