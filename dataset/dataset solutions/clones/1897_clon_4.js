const entryPoint = (rawData) => {
    const allLines = rawData.split('\n').filter(Boolean);
    
    const [nodeCount, edgeCount] = allLines.shift().split(' ').map(Number);
    const heightValues = allLines.shift().split(' ').map(Number);
    
    const connectionEdges = allLines.map(line => line.split(' ').map(Number));

    console.log(calculateGoodCities(nodeCount, edgeCount, heightValues, connectionEdges));
};

const calculateGoodCities = (totalNodes, totalEdges, nodeHeights, edgeConnections) => {
    const adjacencyMap = new Map();

    for (let currentId = 1; currentId <= totalNodes; currentId++) {
        adjacencyMap.set(currentId, new Set());
    }

    edgeConnections.forEach(([nodeA, nodeB]) => {
        adjacencyMap.get(nodeA).add(nodeB);
        adjacencyMap.get(nodeB).add(nodeA);
    });

    const goodCities = Array.from({ length: totalNodes }, (_, index) => index + 1)
        .filter(cityId => {
            const currentCityHeight = nodeHeights[cityId - 1];
            const connectedNeighbors = adjacencyMap.get(cityId);

            if (connectedNeighbors.size === 0) {
                return true;
            }

            const neighborHeights = Array.from(connectedNeighbors).map(neighborId => nodeHeights[neighborId - 1]);
            const highestNeighborHeight = Math.max(...neighborHeights);

            return currentCityHeight > highestNeighborHeight;
        });

    return goodCities.length;
};

entryPoint(require("fs").readFileSync("/dev/stdin", "utf8"));
