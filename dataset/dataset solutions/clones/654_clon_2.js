const fileSystem = require('fs');

const numericMap = fileSystem
    .readFileSync(0, 'utf8')
    .trim()
    .split(/\s+/)
    .map(Number);

const islandAmount = numericMap[0];
const connectionAmount = numericMap[1];

const energyRoutes = Array.from(
    { length: islandAmount + 1 },
    () => []
);

let readingPosition = 2;

for (
    let connectionIndex = 0;
    connectionIndex < connectionAmount;
    connectionIndex++
) {
    const firstIsland = numericMap[readingPosition++];
    const secondIsland = numericMap[readingPosition++];

    energyRoutes[firstIsland].push(secondIsland);
    energyRoutes[secondIsland].push(firstIsland);
}

const discoveredIslands =
    new Array(islandAmount + 1).fill(false);

function navigate(currentIsland) {
    discoveredIslands[currentIsland] = true;

    for (const connectedIsland of energyRoutes[currentIsland]) {
        if (!discoveredIslands[connectedIsland]) {
            navigate(connectedIsland);
        }
    }
}

let independentRegions = 0;

for (
    let currentIsland = 1;
    currentIsland <= islandAmount;
    currentIsland++
) {
    if (!discoveredIslands[currentIsland]) {
        independentRegions++;
        navigate(currentIsland);
    }
}

console.log(independentRegions);