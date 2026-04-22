const executeComputation = (inputMatrix) => {
    const parseInput = (textBlock) => {
        const lines = textBlock.trim().split('\n');
        const [vertexCount, edgeCountParam, queryCountParam] = lines[0].split(' ').map(val => parseInt(val, 10));

        const edgeRecords = lines.slice(1, 1 + edgeCountParam).map(line => {
            const [sourceNode, targetNode] = line.split(' ').map(val => parseInt(val, 10));
            return { source: sourceNode, target: targetNode };
        });

        const queryRecords = lines.slice(1 + edgeCountParam).map(line => {
            const [beginNode, endNode] = line.split(' ').map(val => parseInt(val, 10));
            return { begin: beginNode, end: endNode };
        });

        return { vertexCount, edgeCountParam, queryCountParam, edgeRecords, queryRecords };
    };

    const buildTopology = (records, totalVertices) => {
        const connectivityGraph = new Map();
        for (let currentVertex = 1; currentVertex <= totalVertices; ++currentVertex) {
            connectivityGraph.set(currentVertex, []);
        }
        records.forEach(connection => {
            connectivityGraph.get(connection.source).push(connection.target);
        });
        connectivityGraph.forEach(targets => targets.sort((v1, v2) => v1 - v2));
        return connectivityGraph;
    };

    const findBoundaryIndex = (orderedCollection, valueThreshold, startPointer, endPointer) => {
        if (startPointer >= endPointer) {
            return startPointer;
        }
        const midPoint = Math.floor((startPointer + endPointer) / 2);
        if (orderedCollection[midPoint] <= valueThreshold) {
            return findBoundaryIndex(orderedCollection, valueThreshold, midPoint + 1, endPointer);
        } else {
            return findBoundaryIndex(orderedCollection, valueThreshold, startPointer, midPoint);
        }
    };

    const { vertexCount, edgeCountParam, queryCountParam, edgeRecords, queryRecords } = parseInput(inputMatrix);
    const connectionMap = buildTopology(edgeRecords, vertexCount);

    const finalResults = queryRecords.map(currentQuery => {
        const relevantNodesRange = Array.from({ length: currentQuery.end - currentQuery.begin + 1 },
                                              (_, offset) => currentQuery.begin + offset);

        return relevantNodesRange.reduce((accumulatedPathCount, processingNode) => {
            const destinationNodes = connectionMap.get(processingNode);
            if (destinationNodes && destinationNodes.length > 0) {
                accumulatedPathCount += findBoundaryIndex(destinationNodes, currentQuery.end, 0, destinationNodes.length);
            }
            return accumulatedPathCount;
        }, 0);
    });

    console.log(finalResults.join('\n'));
};
executeComputation(require("fs").readFileSync("/dev/stdin","utf8"));