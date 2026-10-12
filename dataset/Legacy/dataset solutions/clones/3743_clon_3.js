const NOT_CONNECTED_IN_ORIGINAL = 1;
const CONNECTED_IN_ORIGINAL = 0;

const NODE_VISITED = 1;
const NODE_UNVISITED = 0;

const PARTITION_SIDE_A = 0;
const PARTITION_SIDE_B = 1;

function processGraphData(rawInputString) {
    const inputLines = rawInputString.split("\n");

    const [totalNodes, totalEdges] = inputLines[0].split(" ").map(Number);

    const complementGraphAdj = Array(totalNodes).fill(null).map(() => Array(totalNodes).fill(NOT_CONNECTED_IN_ORIGINAL));

    for (let edgeIndex = 0; edgeIndex < totalEdges; edgeIndex++) {
        const [nodeU, nodeV] = inputLines[edgeIndex + 1].split(" ").map(s => Number(s) - 1);
        complementGraphAdj[nodeU][nodeV] = CONNECTED_IN_ORIGINAL;
        complementGraphAdj[nodeV][nodeU] = CONNECTED_IN_ORIGINAL;
    }

    const visitedStatus = Array(totalNodes).fill(NODE_UNVISITED);

    const componentPartitionASizes = [];
    const componentPartitionBSizes = [];
    let currentComponentIdentifier = 0;

    const traverseAndCheckBipartite = (nodesToProcess, assignedPartitionSide) => {
        if (nodesToProcess.length === 0) {
            return false;
        }

        const nextLevelNodes = [];

        for (let k = 0; k < nodesToProcess.length; k++) {
            const currentNode = nodesToProcess[k];

            if (visitedStatus[currentNode] === NODE_VISITED) {
                continue;
            }
            visitedStatus[currentNode] = NODE_VISITED;

            if (assignedPartitionSide === PARTITION_SIDE_A) {
                componentPartitionASizes[currentComponentIdentifier]++;
            } else {
                componentPartitionBSizes[currentComponentIdentifier]++;
            }

            for (let otherNodeIndex = k + 1; otherNodeIndex < nodesToProcess.length; otherNodeIndex++) {
                const otherNode = nodesToProcess[otherNodeIndex];
                if (visitedStatus[otherNode] === NODE_VISITED) {
                    continue;
                }
                if (complementGraphAdj[currentNode][otherNode] === NOT_CONNECTED_IN_ORIGINAL) {
                    return true;
                }
            }

            for (let potentialNeighbor = 0; potentialNeighbor < totalNodes; potentialNeighbor++) {
                if (complementGraphAdj[currentNode][potentialNeighbor] === NOT_CONNECTED_IN_ORIGINAL &&
                    visitedStatus[potentialNeighbor] === NODE_UNVISITED) {
                    nextLevelNodes.push(potentialNeighbor);
                }
            }
        }
        return traverseAndCheckBipartite(nextLevelNodes, 1 - assignedPartitionSide);
    };

    for (let nodeIterator = 0; nodeIterator < totalNodes; nodeIterator++) {
        if (visitedStatus[nodeIterator] === NODE_VISITED) {
            continue;
        }

        componentPartitionASizes[currentComponentIdentifier] = 0;
        componentPartitionBSizes[currentComponentIdentifier] = 0;

        visitedStatus[nodeIterator] = NODE_VISITED;
        componentPartitionASizes[currentComponentIdentifier]++;

        const initialComponentNodesToExplore = [];
        for (let otherNodeIterator = nodeIterator + 1; otherNodeIterator < totalNodes; otherNodeIterator++) {
            if (complementGraphAdj[nodeIterator][otherNodeIterator] === NOT_CONNECTED_IN_ORIGINAL) {
                initialComponentNodesToExplore.push(otherNodeIterator);
            }
        }

        if (traverseAndCheckBipartite(initialComponentNodesToExplore, PARTITION_SIDE_B)) {
            console.log(-1);
            return;
        }
        
        currentComponentIdentifier++;
    }

    const possibleSubsetSums = Array(totalNodes + 1).fill(false);
    possibleSubsetSums[0] = true;

    for (let i = 0; i < currentComponentIdentifier; i++) {
        const currentComponentASize = componentPartitionASizes[i];
        const currentComponentBSize = componentPartitionBSizes[i];

        for (let currentSum = totalNodes; currentSum >= 0; currentSum--) {
            if (possibleSubsetSums[currentSum]) {
                if (currentSum + currentComponentASize <= totalNodes) {
                    possibleSubsetSums[currentSum + currentComponentASize] = true;
                }
                if (currentSum + currentComponentBSize <= totalNodes) {
                    possibleSubsetSums[currentSum + currentComponentBSize] = true;
                }
            }
        }
    }

    let optimalCliqueSize = 0;
    let maxMinPartitionValue = 0;

    for (let i = 0; i <= totalNodes; i++) {
        if (possibleSubsetSums[i]) {
            const currentMinPartitionValue = Math.min(i, totalNodes - i);
            if (currentMinPartitionValue > maxMinPartitionValue) {
                maxMinPartitionValue = currentMinPartitionValue;
                optimalCliqueSize = i;
            }
        }
    }

    const cliqueOneSize = optimalCliqueSize;
    const cliqueTwoSize = totalNodes - optimalCliqueSize;

    const edgesInCliqueOne = (cliqueOneSize * (cliqueOneSize - 1)) / 2;
    const edgesInCliqueTwo = (cliqueTwoSize * (cliqueTwoSize - 1)) / 2;

    console.log(edgesInCliqueOne + edgesInCliqueTwo);
}

processGraphData(require("fs").readFileSync("/dev/stdin", "utf8"));
