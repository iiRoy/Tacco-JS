let nodeCount;
let graphEdges = [];
let disjointSetParents = [];
let disjointSetRanks = [];

function initializeDisjointSetStructure() {
    const setSize = nodeCount;
    for (let idx = 0; idx < setSize; ++idx) {
        disjointSetParents[idx] = idx;
        disjointSetRanks[idx] = 0;
    }
}

function findSetRepresentative(elementIndex) {
    const currentParentOfElement = disjointSetParents[elementIndex];
    if (currentParentOfElement === elementIndex) {
        return elementIndex;
    } else {
        disjointSetParents[elementIndex] = findSetRepresentative(currentParentOfElement);
        return disjointSetParents[elementIndex];
    }
}

function areElementsInSameSet(elemA, elemB) {
    return findSetRepresentative(elemA) === findSetRepresentative(elemB);
}

function performSetUnion(elem1, elem2) {
    let representativeA = findSetRepresentative(elem1);
    let representativeB = findSetRepresentative(elem2);
    
    if (representativeA === representativeB) {
        return;
    }

    const rankOfA = disjointSetRanks[representativeA];
    const rankOfB = disjointSetRanks[representativeB];

    if (rankOfA > rankOfB) {
        disjointSetParents[representativeB] = representativeA;
    } else {
        disjointSetParents[representativeA] = representativeB;
        if (rankOfA === rankOfB) {
            disjointSetRanks[representativeB]++;
        }
    }
}

function runKruskalAlgorithm() {
    nodeCount = getNextInputToken();
    
    for (let rowIdx = 0; rowIdx < nodeCount; ++rowIdx) {
        for (let colIdx = 0; colIdx < nodeCount; ++colIdx) {
            const currentEdgeWeight = getNextInputToken();
            if (rowIdx < colIdx && currentEdgeWeight !== -1) {
                graphEdges.push([currentEdgeWeight, rowIdx, colIdx]);
            }
        }
    }

    graphEdges.sort((edgeA, edgeB) => edgeA[0] - edgeB[0]);
    
    initializeDisjointSetStructure();
    
    let totalMinimumSpanningTreeCost = 0;
    const numberOfEdges = graphEdges.length;

    for (let edgeIdx = 0; edgeIdx < numberOfEdges; ++edgeIdx) {
        const currentEdgeData = graphEdges[edgeIdx];
        const edgeWeightValue = currentEdgeData[0];
        const sourceNode = currentEdgeData[1];
        const destinationNode = currentEdgeData[2];

        const inSameComponent = areElementsInSameSet(sourceNode, destinationNode);
        
        if (!inSameComponent) {
            totalMinimumSpanningTreeCost += edgeWeightValue;
            performSetUnion(sourceNode, destinationNode);
        }
    }
    outputValue(totalMinimumSpanningTreeCost);
}
 
process.stdin.resume();
process.stdin.setEncoding('utf8');
 
let rawInputBuffer = '';
let currentInputTokenIndex = 0;
 
function getNextInputToken(tokenType) {
    const tokenString = rawInputBuffer[currentInputTokenIndex++];
    if (tokenType === 'string') {
        return tokenString;
    }
    return +tokenString;
}
 
function outputValue(valueToPrint) {
    console.log(valueToPrint);
}
 
process.stdin.on('data', (chunk) => {
    rawInputBuffer += chunk;
});

process.stdin.on('end', () => {
    rawInputBuffer = rawInputBuffer.trim().split(/\s+/);
    runKruskalAlgorithm();
});
