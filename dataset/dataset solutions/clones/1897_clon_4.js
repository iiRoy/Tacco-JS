const analyzeInputStructure = (sourceText) => {
    const allTextLines = sourceText.trim().split('\n');
    const firstLineDetails = allTextLines[0].split(' ').map(Number);
    const totalNodes = firstLineDetails[0];
    const totalEdges = firstLineDetails[1];

    const nodeAltitudeValues = allTextLines[1].split(' ').map(Number);

    const connectionData = allTextLines.slice(2).map(line => line.split(' ').map(Number));

    return {
        nodeCount: totalNodes,
        edgeCount: totalEdges,
        altitudes: nodeAltitudeValues,
        connections: connectionData
    };
};

const constructNetworkGraph = (nodeQuantity, edgeList) => {
    const networkMap = new Map();
    Array.from({ length: nodeQuantity }, (_, index) => index + 1).forEach(nodeIdentifier => {
        networkMap.set(nodeIdentifier, new Set());
    });

    edgeList.forEach(edgePair => {
        const [firstNode, secondNode] = edgePair;
        networkMap.get(firstNode).add(secondNode);
        networkMap.get(secondNode).add(firstNode);
    });
    return networkMap;
};

const identifyPeakObservations = (nodeQuantity, nodeAltitudes, graphRepresentation) => {
    const nodeIdentifiers = Array.from({ length: nodeQuantity }, (_, index) => index + 1);

    const observablePeaks = nodeIdentifiers.filter(currentNodeId => {
        const connectedNodes = graphRepresentation.get(currentNodeId);
        const currentAltitude = nodeAltitudes[currentNodeId - 1];

        if (!connectedNodes || connectedNodes.size === 0) {
            return true;
        }

        const adjacentAltitudes = Array.from(connectedNodes).map(neighborId => nodeAltitudes[neighborId - 1]);
        const highestAdjacentAltitude = Math.max(...adjacentAltitudes);

        return currentAltitude > highestAdjacentAltitude;
    });

    return observablePeaks.length;
};

const processTopographyData = (rawTextData) => {
    const parsedComponents = analyzeInputStructure(rawTextData);

    const topographyNetwork = constructNetworkGraph(
        parsedComponents.nodeCount,
        parsedComponents.connections
    );

    const finalResult = identifyPeakObservations(
        parsedComponents.nodeCount,
        parsedComponents.altitudes,
        topographyNetwork
    );

    console.log(finalResult);
};

processTopographyData(require("fs").readFileSync("/dev/stdin", "utf8"));