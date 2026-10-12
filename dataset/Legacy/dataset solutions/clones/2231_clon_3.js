let treeNodes = [];
let constraintPaths = [];

const createEdgeIdentifier = (nodeId1, nodeId2) => Math.min(nodeId1, nodeId2) * 100 + Math.max(nodeId1, nodeId2);

const countCharOccurrences = (targetString, charToCount) => (targetString.match(new RegExp(charToCount, "g")) || []).length;

const getUniqueElements = (inputArray) => inputArray.filter((element, index, self) => self.indexOf(element) === index);

function initializeNodes(count) {
    const newNodes = [];
    for (let i = 0; i < count; i++) {
        newNodes.push({
            nodeId: i,
            adjacencies: [],
            nodeDepth: 0,
            parentNode: null
        });
    }
    return newNodes;
}

function addBidirectionalEdge(nodeAIndex, nodeBIndex) {
    treeNodes[nodeAIndex].adjacencies.push(nodeBIndex);
    treeNodes[nodeBIndex].adjacencies.push(nodeAIndex);
}

function buildTreeStructure(currentNode) {
    const actualChildren = currentNode.adjacencies.filter(
        (adjId) => adjId !== currentNode.parentNode
    );

    currentNode.adjacencies = actualChildren;

    for (const childId of actualChildren) {
        const childNode = treeNodes[childId];
        childNode.parentNode = currentNode.nodeId;
        childNode.nodeDepth = currentNode.nodeDepth + 1;
        buildTreeStructure(childNode);
    }
}

function findPathEdges(startNodeId, endNodeId) {
    const pathEdges = [];
    let currNodeA = startNodeId;
    let currNodeB = endNodeId;
    let depthA = treeNodes[currNodeA].nodeDepth;
    let depthB = treeNodes[currNodeB].nodeDepth;

    while (true) {
        if (depthA === depthB) {
            if (currNodeA === currNodeB) {
                break;
            }
            pathEdges.push(createEdgeIdentifier(currNodeA, treeNodes[currNodeA].parentNode));
            currNodeA = treeNodes[currNodeA].parentNode;
            depthA--;

            pathEdges.push(createEdgeIdentifier(currNodeB, treeNodes[currNodeB].parentNode));
            currNodeB = treeNodes[currNodeB].parentNode;
            depthB--;
        } else if (depthA > depthB) {
            pathEdges.push(createEdgeIdentifier(currNodeA, treeNodes[currNodeA].parentNode));
            currNodeA = treeNodes[currNodeA].parentNode;
            depthA--;
        } else {
            pathEdges.push(createEdgeIdentifier(currNodeB, treeNodes[currNodeB].parentNode));
            currNodeB = treeNodes[currNodeB].parentNode;
            depthB--;
        }
    }
    return pathEdges;
}

function calculateCombinedPaths() {
    const combinedPathMap = {};
    const totalConstraintSets = Math.pow(2, constraintPaths.length);

    for (let i = 1; i < totalConstraintSets; i++) {
        const binaryKey = i.toString(2);
        const setBitsInKey = countCharOccurrences(binaryKey, "1");

        if (setBitsInKey === 1) {
            combinedPathMap[binaryKey] = constraintPaths[binaryKey.length - 1];
        } else {
            const currentKeyLength = binaryKey.length;
            const highestBitKeyString = String(parseInt(binaryKey.substring(0, 1), 2) * Math.pow(10, currentKeyLength - 1));
            const remainingBitsKeyString = parseInt(binaryKey.substring(1), 2).toString(2);

            const pathA = combinedPathMap[highestBitKeyString];
            const pathB = combinedPathMap[remainingBitsKeyString];

            combinedPathMap[binaryKey] = getUniqueElements(pathA.concat(pathB));
        }
    }
    return combinedPathMap;
}

function processInput(rawData) {
    const lines = rawData.split("\n");

    const nodeCount = parseInt(lines[0], 10);
    treeNodes = initializeNodes(nodeCount);

    for (let i = 1; i < nodeCount; i++) {
        const [nodeAStr, nodeBStr] = lines[i].split(" ");
        addBidirectionalEdge(parseInt(nodeAStr, 10) - 1, parseInt(nodeBStr, 10) - 1);
    }
    buildTreeStructure(treeNodes[0]);

    const constraintCount = parseInt(lines[nodeCount], 10);
    for (let i = 1; i <= constraintCount; i++) {
        const [resNodeAStr, resNodeBStr] = lines[nodeCount + i].split(" ");
        constraintPaths.push(findPathEdges(parseInt(resNodeAStr, 10) - 1, parseInt(resNodeBStr, 10) - 1));
    }

    const combinedPathMap = calculateCombinedPaths();

    let finalExclusionSum = 0;

    for (const binaryKey in combinedPathMap) {
        const currentPathEdgeCount = combinedPathMap[binaryKey].length;
        const setBitsInKey = countCharOccurrences(binaryKey, "1");

        const termExponent = nodeCount - (1 + currentPathEdgeCount);
        const termValue = Math.pow(2, termExponent);

        if (setBitsInKey % 2 === 1) {
            finalExclusionSum += termValue;
        } else {
            finalExclusionSum -= termValue;
        }
    }
    console.log(Math.pow(2, nodeCount - 1) - finalExclusionSum);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
