const primeDivisor = 1000000007;

const inputProcessor = require('readline');

async function executePathCalculation() {
    const streamHandler = inputProcessor.createInterface({
        input: process.stdin,
        output: process.stdout,
        crlfDelay: Infinity
    });

    const inputLines = [];
    for await (const currentLine of streamHandler) {
        inputLines.push(currentLine);
    }
    streamHandler.close();

    const initialConfig = inputLines[0].split(" ").map(Number);
    const maxDistance = initialConfig[0];
    const numRestricted = initialConfig[1];

    const restrictedPositions = new Set(inputLines.slice(1).map(Number));

    const pathAccumulator = Array(maxDistance + 1).fill(0);

    pathAccumulator[maxDistance] = 1;

    for (let currentSpot = maxDistance - 1; currentSpot >= 0; currentSpot--) {
        if (restrictedPositions.has(currentSpot)) {
            pathAccumulator[currentSpot] = 0;
            continue;
        }

        let waysToReach = 0;
        
        if (currentSpot + 1 <= maxDistance) {
            waysToReach = (waysToReach + pathAccumulator[currentSpot + 1]) % primeDivisor;
        }
        
        if (currentSpot + 2 <= maxDistance) {
            waysToReach = (waysToReach + pathAccumulator[currentSpot + 2]) % primeDivisor;
        }
        
        pathAccumulator[currentSpot] = waysToReach;
    }

    console.log(pathAccumulator[0]);
}

executePathCalculation();