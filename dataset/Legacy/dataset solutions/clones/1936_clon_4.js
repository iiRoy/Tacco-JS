function InputProcessor(sourceText) {
    let currentPosition = 0;
    const parsedTokens = sourceText.replace(/[\n\s\t]+/g, " ").trim().split(" ");

    this.retrieveNext = function() {
        const token = parsedTokens[currentPosition];
        currentPosition++;
        return (token !== undefined) ? token : null;
    };

    this.retrieveInteger = function() {
        const token = parsedTokens[currentPosition];
        currentPosition++;
        return (token !== undefined) ? parseInt(token, 10) : null;
    };

    this.retrieveDecimal = function() {
        const token = parsedTokens[currentPosition];
        currentPosition++;
        return (token !== undefined) ? parseFloat(token) : null;
    };
    
    this.retrieveByte = function() {
        const token = parsedTokens[currentPosition];
        currentPosition++;
        return (token !== undefined) ? new Int8Array(token) : null;
    };
}

function findInsertionPoint(sortedArr, targetValue) {
    let lowIndex = 0;
    let highIndex = sortedArr.length;
    while (lowIndex < highIndex) {
        const midIndex = Math.floor((lowIndex + highIndex) / 2);
        if (sortedArr[midIndex] < targetValue) {
            lowIndex = midIndex + 1;
        } else {
            highIndex = midIndex;
        }
    }
    return lowIndex;
}

function calculateLisLength(valueSequence) {
    if (valueSequence.length === 0) return 0;
    const lisEndValues = [];

    for (const currentElement of valueSequence) {
        const insertAt = findInsertionPoint(lisEndValues, currentElement);

        if (insertAt === lisEndValues.length) {
            lisEndValues.push(currentElement);
        } else {
            lisEndValues[insertAt] = currentElement;
        }
    }
    return lisEndValues.length;
}

function ProcessGraph(inputProcessor) {
    const nodeCount = inputProcessor.retrieveInteger();
    const resultLengths = [];
    
    const nodeValues = new Map();
    for (let nodeIdx = 1; nodeIdx <= nodeCount; nodeIdx++) {
        nodeValues.set(nodeIdx, inputProcessor.retrieveInteger());
    }
    
    const adjacencyMap = new Map();
    for (let edgeIdx = 0; edgeIdx < nodeCount - 1; edgeIdx++) {
        const firstNode = inputProcessor.retrieveInteger();
        const secondNode = inputProcessor.retrieveInteger();
        
        if (!adjacencyMap.has(firstNode)) adjacencyMap.set(firstNode, []);
        adjacencyMap.get(firstNode).push(secondNode);
        
        if (!adjacencyMap.has(secondNode)) adjacencyMap.set(secondNode, []);
        adjacencyMap.get(secondNode).push(firstNode);
    }
    
    const nodePathValueSequences = new Map();
    const traversalStack = [[1, -1, []]]; // [currentNodeId, parentNodeId, pathValuesSoFar]
    
    while (traversalStack.length > 0) {
        const [currentNodeId, parentNodeId, pathValuesSoFar] = traversalStack.pop();
        
        const extendedPath = pathValuesSoFar.concat(nodeValues.get(currentNodeId));
        nodePathValueSequences.set(currentNodeId, extendedPath);
        
        const neighbors = adjacencyMap.get(currentNodeId) || [];
        for (const neighborNode of neighbors) {
            if (neighborNode !== parentNodeId) {
                traversalStack.push([neighborNode, currentNodeId, extendedPath]);
            }
        }
    }
    
    for (let nodeIdx = 1; nodeIdx <= nodeCount; nodeIdx++) {
        const currentPathSequence = nodePathValueSequences.get(nodeIdx);
        resultLengths.push(calculateLisLength(currentPathSequence));
    }
    
    console.log(resultLengths.join("\n"));
}

ProcessGraph(new InputProcessor(require("fs").readFileSync("/dev/stdin", "utf8")));
