function checkAncestry(startIdentifier, targetIdentifier, graphStructure, visitedNodes) {
    if (startIdentifier === targetIdentifier) {
        return true;
    }
    if (visitedNodes.has(startIdentifier)) {
        return false;
    }
    visitedNodes.add(startIdentifier);

    const incomingConnections = graphStructure[startIdentifier] || [];
    for (const connection of incomingConnections) {
        if (checkAncestry(connection.source, targetIdentifier, graphStructure, visitedNodes)) {
            return true;
        }
    }
    return false;
}

function processGraphData(inputLines) {
    const firstLineParts = inputLines[0].split(' ');
    const nodeCount = parseInt(firstLineParts[0]);
    const extraEdges = parseInt(firstLineParts[1]);

    const adjacencyMap = {};

    for (let i = 0; i < nodeCount - 1 + extraEdges; i++) {
        const currentLineParts = inputLines[i + 1].split(' ');
        const currentEdge = {
            source: parseInt(currentLineParts[0]),
            destination: parseInt(currentLineParts[1])
        };
        if (!adjacencyMap[currentEdge.destination]) {
            adjacencyMap[currentEdge.destination] = [];
        }
        adjacencyMap[currentEdge.destination].push(currentEdge);
    }

    const finalResults = new Array(nodeCount);

    for (let i = 1; i <= nodeCount; i++) {
        const currentIdentifier = i;
        const incomingEdgesToCurrent = adjacencyMap[currentIdentifier] || [];
        const directSources = incomingEdgesToCurrent.map(edge => edge.source);

        if (directSources.length <= 1) {
            finalResults[currentIdentifier - 1] = directSources.length ? directSources[0] : 0;
        } else {
            let primaryFound = false;
            for (let j = 0; j < directSources.length; j++) {
                const candidateSource = directSources[j];
                let isDescendantOfAnotherSource = false;

                for (let k = 0; k < directSources.length; k++) {
                    if (j === k) continue;

                    const otherSource = directSources[k];
                    if (checkAncestry(candidateSource, otherSource, adjacencyMap, new Set())) {
                        isDescendantOfAnotherSource = true;
                        break;
                    }
                }

                if (!isDescendantOfAnotherSource) {
                    finalResults[currentIdentifier - 1] = candidateSource;
                    primaryFound = true;
                    break;
                }
            }

            if (!primaryFound) {
                finalResults[currentIdentifier - 1] = undefined;
            }
        }
    }
    console.log(finalResults.join('\n'));
}

let accumulatedInput = '';

process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function(dataChunk) {
    accumulatedInput += dataChunk;
});
process.stdin.on('end', function() {
    const processedInput = accumulatedInput.split('\n');
    processGraphData(processedInput);
});
