const retrieveContent = () => require("fs").readFileSync("/dev/stdin", "utf8");
const processContent = (textData) => textData.split(/\s+/).filter(Boolean);

let tokenCollection;
let tokenIterator = 0;

const fetchNextElement = () => tokenCollection[tokenIterator++];
const fetchNumericElement = () => Number(fetchNextElement());

function manageGraphOperations() {
    tokenCollection = processContent(retrieveContent());

    const nodeCount = fetchNumericElement();

    const adjacencyList = new Map();
    for (let i = 0; i < nodeCount; i++) {
        adjacencyList.set(i, new Set());
    }

    for (let i = 0; i < nodeCount - 1; i++) {
        const firstNode = fetchNumericElement() - 1;
        const secondNode = fetchNumericElement() - 1;
        adjacencyList.get(firstNode).add(secondNode);
        adjacencyList.get(secondNode).add(firstNode);
    }

    const nodeLevelMap = new Map(); // Node index -> its level (depth)
    const nodeParentMap = new Map(); // Node index -> its parent
    
    const bfsQueue = [];

    bfsQueue.push(0);
    nodeLevelMap.set(0, 0);
    nodeParentMap.set(0, -1); // Root has no parent

    let queuePointer = 0;
    while (queuePointer < bfsQueue.length) {
        const currentVertex = bfsQueue[queuePointer++];
        const currentVertexLevel = nodeLevelMap.get(currentVertex);

        for (const neighborVertex of adjacencyList.get(currentVertex)) {
            if (!nodeLevelMap.has(neighborVertex)) { // If not visited
                nodeLevelMap.set(neighborVertex, currentVertexLevel + 1);
                nodeParentMap.set(neighborVertex, currentVertex);
                bfsQueue.push(neighborVertex);
            }
        }
    }

    const evenLevelVertices = [];
    const oddLevelVertices = [];
    for (let i = 0; i < nodeCount; i++) {
        if (nodeLevelMap.get(i) % 2 === 0) {
            evenLevelVertices.push(i);
        } else {
            oddLevelVertices.push(i);
        }
    }

    const finalLabelings = new Array(nodeCount);
    
    let labelSeq1 = 1;
    let labelSeq2 = 2;
    let labelSeq3 = 3;

    const assignLabel = (targetArray, index, sequenceIdentifier) => {
        if (sequenceIdentifier === 1) {
            targetArray[index] = labelSeq1;
            labelSeq1 += 3;
        } else if (sequenceIdentifier === 2) {
            targetArray[index] = labelSeq2;
            labelSeq2 += 3;
        } else if (sequenceIdentifier === 3) {
            targetArray[index] = labelSeq3;
            labelSeq3 += 3;
        }
    };

    const countDiv3 = Math.floor(nodeCount / 3);

    if (oddLevelVertices.length <= countDiv3) {
        for (const nodeIdx of oddLevelVertices) {
            assignLabel(finalLabelings, nodeIdx, 3);
        }
        for (const nodeIdx of evenLevelVertices) {
            if (labelSeq1 <= nodeCount) {
                assignLabel(finalLabelings, nodeIdx, 1);
            } else if (labelSeq2 <= nodeCount) {
                assignLabel(finalLabelings, nodeIdx, 2);
            } else {
                assignLabel(finalLabelings, nodeIdx, 3);
            }
        }
    } else if (evenLevelVertices.length <= countDiv3) {
        for (const nodeIdx of evenLevelVertices) {
            assignLabel(finalLabelings, nodeIdx, 3);
        }
        for (const nodeIdx of oddLevelVertices) {
            if (labelSeq1 <= nodeCount) {
                assignLabel(finalLabelings, nodeIdx, 1);
            } else if (labelSeq2 <= nodeCount) {
                assignLabel(finalLabelings, nodeIdx, 2);
            } else {
                assignLabel(finalLabelings, nodeIdx, 3);
            }
        }
    } else {
        for (const nodeIdx of oddLevelVertices) {
            if (labelSeq1 <= nodeCount) {
                assignLabel(finalLabelings, nodeIdx, 1);
            } else {
                assignLabel(finalLabelings, nodeIdx, 3);
            }
        }
        for (const nodeIdx of evenLevelVertices) {
            if (labelSeq2 <= nodeCount) {
                assignLabel(finalLabelings, nodeIdx, 2);
            } else {
                assignLabel(finalLabelings, nodeIdx, 3);
            }
        }
    }
    
    return finalLabelings.join(" ");
}

const finalResult = manageGraphOperations();
if (finalResult !== undefined) {
    console.log(finalResult);
}