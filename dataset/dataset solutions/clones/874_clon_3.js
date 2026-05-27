function readAllInput() {
    const fileSystem = require('fs');
    const standardInputFD = process.stdin.fd;
    const dataLength = fileSystem.fstatSync(standardInputFD).size;
    const inputBuffer = Buffer.alloc(dataLength);
    const readBytesCount = fileSystem.readSync(standardInputFD, inputBuffer, 0, dataLength, 0);
    return inputBuffer.toString('utf8', 0, readBytesCount).split('\n');
}

let inputLines = readAllInput();
processInputData();

function UnionFindStructure(nodeCount) {
    const parentArray = new Array(nodeCount).fill(-1);

    function findRoot(nodeIdx) {
        if (parentArray[nodeIdx] < 0) {
            return nodeIdx;
        }
        parentArray[nodeIdx] = findRoot(parentArray[nodeIdx]);
        return parentArray[nodeIdx];
    }

    function performUnion(nodeA, nodeB) {
        let rootA = findRoot(nodeA);
        let rootB = findRoot(nodeB);

        if (rootA !== rootB) {
            if (parentArray[rootA] < parentArray[rootB]) {
                parentArray[rootA] += parentArray[rootB];
                parentArray[rootB] = rootA;
            } else {
                parentArray[rootB] += parentArray[rootA];
                parentArray[rootA] = rootB;
            }
            return true;
        }
        return false;
    }

    function countComponents(activeStatusMap) {
        let componentCounter = 0;
        for (let idx = 0; idx < nodeCount; idx++) {
            if (activeStatusMap[idx] && parentArray[idx] < 0) {
                componentCounter++;
            }
        }
        return componentCounter;
    }

    function areSameSet(nodeA, nodeB) {
        return findRoot(nodeA) === findRoot(nodeB);
    }

    return {
        performUnion: performUnion,
        findRoot: findRoot,
        countComponents: countComponents,
        areSameSet: areSameSet
    };
}

function parseProblemDimensions(line) {
    const parts = line.split(' ');
    const numNodes = parseInt(parts[0], 10);
    const numEdges = parseInt(parts[1], 10);
    return { numNodes, numEdges };
}

function readAndPrepareNodeData(count, inputSource) {
    const nodes = [];
    const activeFlags = new Array(count).fill(false);
    for (let i = 0; i < count; i++) {
        nodes[i] = {
            nodeId: i,
            daysValue: parseInt(inputSource.shift(), 10)
        };
    }
    nodes.sort((dataA, dataB) => dataA.daysValue - dataB.daysValue);
    return { nodes, activeFlags };
}

function readAndPrepareGraphEdges(count, inputSource) {
    const edges = [];
    for (let i = 0; i < count; i++) {
        const parts = inputSource.shift().split(' ');
        edges[i] = [
            parseInt(parts[0], 10) - 1,
            parseInt(parts[1], 10) - 1,
            parseInt(parts[2], 10)
        ];
    }
    edges.sort((edgeA, edgeB) => edgeA[2] - edgeB[2]);
    return edges;
}

function processInputData() {
    while (true) {
        const { numNodes, numEdges } = parseProblemDimensions(inputLines.shift());

        if (numNodes === 0 && numEdges === 0) {
            break;
        }

        const { nodes: sortedNodeData, activeFlags: currentActiveNodes } = readAndPrepareNodeData(numNodes, inputLines);
        const sortedGraphEdges = readAndPrepareGraphEdges(numEdges, inputLines);

        let unionFindInstance = UnionFindStructure(numNodes);
        let accumulatedCost = 0;

        for (let i = numNodes - 1; i >= 0; i--) {
            const currentNode = sortedNodeData[i];
            const currentDaysThreshold = currentNode.daysValue;

            currentActiveNodes[currentNode.nodeId] = true;

            let tempIndex = i;
            while (tempIndex > 0 && sortedNodeData[tempIndex - 1].daysValue === currentDaysThreshold) {
                tempIndex--;
                currentActiveNodes[sortedNodeData[tempIndex].nodeId] = true;
            }
            i = tempIndex;

            for (const edge of sortedGraphEdges) {
                const [u, v, weight] = edge;
                if (currentActiveNodes[u] && currentActiveNodes[v]) {
                    if (unionFindInstance.performUnion(u, v)) {
                        accumulatedCost += weight;
                    }
                }
            }

            if (unionFindInstance.countComponents(currentActiveNodes) > 1) {
                accumulatedCost = 0;
                unionFindInstance = UnionFindStructure(numNodes);
            }
        }

        console.log(accumulatedCost);
    }
}
