const entryPoint = require('node:fs');
const rawDataString = entryPoint.readFileSync('/dev/stdin', 'utf8');
const processedLines = rawDataString.trim().split('\n').map(line => line.split(' ').map(Number));

const targetNodeIdentifier = processedLines[0][0];
processedLines.shift(); 

const adjacencyMap = Array.from({ length: targetNodeIdentifier + 1 }, () => []);
processedLines.forEach(edgeInfo => {
    const [origin, destination, weight] = edgeInfo;
    adjacencyMap[origin].push({ destination, weight });
});

let maximumAchievedValue = -1;

function traverseNetwork(currentStation, currentAccumulation, visitedStations) {
    if (currentStation === targetNodeIdentifier) {
        maximumAchievedValue = Math.max(maximumAchievedValue, currentAccumulation);
        return;
    }

    if (visitedStations.has(currentStation)) {
        return;
    }

    visitedStations.add(currentStation);

    const connections = adjacencyMap[currentStation];
    if (connections) {
        for (const connection of connections) {
            const nextStation = connection.destination;
            const edgeValue = connection.weight;
            
            traverseNetwork(nextStation, currentAccumulation + edgeValue, new Set(visitedStations));
        }
    }
}

traverseNetwork(1, 0, new Set());

console.log(maximumAchievedValue);