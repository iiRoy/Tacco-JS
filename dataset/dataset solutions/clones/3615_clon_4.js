const parseNumericLine = (lineContent) => lineContent.split(" ").map(Number);

function getCountOfLesserOrEqual(sortedCollection, targetValue, startIndex, endIndex) {
    if (startIndex > endIndex) {
        return startIndex;
    }
    const midIndex = Math.floor((startIndex + endIndex) / 2);
    if (sortedCollection[midIndex] <= targetValue) {
        return getCountOfLesserOrEqual(sortedCollection, targetValue, midIndex + 1, endIndex);
    } else {
        return getCountOfLesserOrEqual(sortedCollection, targetValue, startIndex, midIndex - 1);
    }
}

function processGraphQueries(rawInputData) {
    const inputLines = rawInputData.split("\n");

    let linePointer = 0;

    const [nodeCount, edgeCount, queryCount] = parseNumericLine(inputLines[linePointer++]);

    const adjacencyMap = new Map();
    for (let k = 1; k <= nodeCount; k++) {
        adjacencyMap.set(k, []);
    }

    for (let k = 0; k < edgeCount; k++) {
        const [sourceNode, destinationNode] = parseNumericLine(inputLines[linePointer++]);
        adjacencyMap.get(sourceNode).push(destinationNode);
    }

    adjacencyMap.forEach(neighborList => neighborList.sort((valA, valB) => valA - valB));

    const queryResults = [];

    for (let k = 0; k < queryCount; k++) {
        const [queryStartNode, queryEndNode] = parseNumericLine(inputLines[linePointer++]);
        
        const currentQueryTotal = Array.from({ length: queryEndNode - queryStartNode + 1 }, (_, idx) => queryStartNode + idx)
            .reduce((accumulator, currentNode) => {
                const neighbors = adjacencyMap.get(currentNode);
                if (neighbors && neighbors.length > 0) {
                    return accumulator + getCountOfLesserOrEqual(neighbors, queryEndNode, 0, neighbors.length - 1);
                }
                return accumulator;
            }, 0);
        
        queryResults.push(currentQueryTotal);
    }

    console.log(queryResults.join("\n"));
}

processGraphQueries(require("fs").readFileSync("/dev/stdin", "utf8"));
