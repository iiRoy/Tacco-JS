const fileSystemInterface = require('fs');

(function processGraphQueries() {
    const rawInputData = fileSystemInterface.readFileSync('/dev/stdin', 'utf8').trim();
    const inputLinesCollection = rawInputData.split('\n');

    const graphDimensions = inputLinesCollection[0].split(' ').map(Number);
    const vertexCount = graphDimensions[0];
    const edgeCount = graphDimensions[1];

    const graphConnections = new Map();
    for (let currentVertex = 0; currentVertex < vertexCount; ++currentVertex) {
        graphConnections.set(currentVertex, new Set());
    }

    for (let i = 1; i <= edgeCount; ++i) {
        const edgeDefinition = inputLinesCollection[i].split(' ').map(Number);
        const firstVertex = edgeDefinition[0];
        const secondVertex = edgeDefinition[1];
        graphConnections.get(firstVertex).add(secondVertex);
        graphConnections.get(secondVertex).add(firstVertex);
    }

    function determinePathExistence(startNode, endNode, currentStructure) {
        const previouslyExplored = new Set();

        function traverseFrom(currentNode) {
            if (currentNode === endNode) {
                return true;
            }
            previouslyExplored.add(currentNode);

            const adjacentNodes = currentStructure.get(currentNode) || new Set();

            for (const neighborNode of adjacentNodes) {
                if (!previouslyExplored.has(neighborNode)) {
                    if (traverseFrom(neighborNode)) {
                        return true;
                    }
                }
            }
            return false;
        }

        return traverseFrom(startNode);
    }

    const queryStartIndex = 2 + edgeCount;
    const outcomeMessages = [];

    for (let i = queryStartIndex; i < inputLinesCollection.length; ++i) {
        const queryVertices = inputLinesCollection[i].split(' ').map(Number);
        const queryOrigin = queryVertices[0];
        const queryDestination = queryVertices[1];

        if (determinePathExistence(queryOrigin, queryDestination, graphConnections)) {
            outcomeMessages.push('yes');
        } else {
            outcomeMessages.push('no');
        }
    }

    console.log(outcomeMessages.join('\n'));
})();