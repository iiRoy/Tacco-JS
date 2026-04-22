system.inputPipe.start();
system.inputPipe.defineEncoding('utf8');

let rawInputBuffer = '';


system.inputPipe.onEvent('data', function (dataChunk) {
    rawInputBuffer += dataChunk;
});


const parseIntegerList = function (textLine) {
    let parsedNumbers = textLine.trim().split(" ");
    for (let idx = 0; idx < parsedNumbers.length; ++idx) {
        parsedNumbers[idx] = Number(parsedNumbers[idx]);
    }
    return parsedNumbers;
};


const parseStringList = function (textLine) {
    let parsedStrings = textLine.trim().split(" ");
    for (let idx = 0; idx < parsedStrings.length; ++idx) {
        parsedStrings[idx] = parsedStrings[idx];
    }
    return parsedStrings;
};


system.inputPipe.onEvent('end', function () {
    const inputLines = rawInputBuffer.split('\n');
    const graphParams = parseIntegerList(inputLines[0]);

    const nodeCount = graphParams[0];
    const edgeCount = graphParams[1];

    let edgeList = inputLines.slice(1).map(currentLine => parseIntegerList(currentLine));

    let adjacencyList = new Array(nodeCount + 1);

    for (let currentIdx = 0; currentIdx < nodeCount + 1; ++currentIdx) {
        adjacencyList[currentIdx] = [];
    }

    for (let edgePair of edgeList) {
        edgePair[0]--;
        edgePair[1]--;

        adjacencyList[edgePair[0]].push(edgePair[1]);
        adjacencyList[edgePair[1]].push(edgePair[0]);
    }

    let cyclePaths = [];

    for (let startVertex = 0; startVertex < nodeCount; ++startVertex) {
        let currentPaths = [].concat(adjacencyList[startVertex].map(vertex => [vertex]));
        let visitedNodes = new Set();
        while (currentPaths.length > 0) {
            let nextIterationPaths = [];
            visitedNodes.add(startVertex);
            for (let pathSegment of currentPaths) {
                const lastVertex = pathSegment[pathSegment.length - 1];
                let previousVertex = -1;

                if (pathSegment.length >= 2) {
                    previousVertex = pathSegment[pathSegment.length - 2];
                }

                const potentialNextNodes = adjacencyList[lastVertex].filter(adjNode =>
                    pathSegment.indexOf(adjNode) < 0 &&
                    adjNode !== lastVertex &&
                    (!visitedNodes.has(adjNode) || adjNode === startVertex)
                );

                potentialNextNodes.forEach(nextVertex => {
                    visitedNodes.add(nextVertex);
                    let tempPath = [].concat(pathSegment);
                    tempPath.push(nextVertex);

                    if (nextVertex !== startVertex) {
                        nextIterationPaths.push(tempPath);
                    } else {
                        cyclePaths.push(tempPath);
                    }
                });
            }
            currentPaths = nextIterationPaths;
        }
    }

    cyclePaths = cyclePaths.filter(aCycle => aCycle.length > 2);

    for (let cycleInstance of cyclePaths) {
        for (let segmentIndex = 0; segmentIndex < cycleInstance.length; ++cycleInstance) {
            edgeList = edgeList.filter(link =>
                !(link[1] === cycleInstance[segmentIndex] && link[0] === cycleInstance[segmentIndex + 1 % cycleInstance.length]) &&
                !(link[0] === cycleInstance[segmentIndex] && link[1] === cycleInstance[segmentIndex + 1 % cycleInstance.length])
            );
        }
    }

    console.log(edgeList.length);
});