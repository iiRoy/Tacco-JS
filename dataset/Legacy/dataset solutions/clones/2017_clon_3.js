const parseInputData = (inputString) => {
    const parts = inputString.split(' ');
    const numNodes = parseInt(parts[0], 10);
    const xCoord = parseInt(parts[1], 10);
    const yCoord = parseInt(parts[2], 10);
    return { numNodes, xCoord, yCoord };
};

const computePathDistance = (nodeA, nodeB, specialX, specialY) => {
    const directPathLength = nodeB - nodeA;
    const specialPathOffset = 1;
    const pathViaSpecialNodes = Math.abs(specialX - nodeA) + Math.abs(specialY - nodeB) + specialPathOffset;
    return Math.min(directPathLength, pathViaSpecialNodes);
};

function processGraphDistances(rawData) {
    const { numNodes, xCoord, yCoord } = parseInputData(rawData);

    const calculatePairsForDistance = (targetDistance, totalNodes, specialX, specialY) => {
        let pairCounter = 0;
        for (let firstNode = 1; firstNode < totalNodes; firstNode++) {
            for (let secondNode = firstNode + 1; secondNode <= totalNodes; secondNode++) {
                const calculatedDist = computePathDistance(firstNode, secondNode, specialX, specialY);
                if (calculatedDist === targetDistance) {
                    pairCounter++;
                }
            }
        }
        return pairCounter;
    };

    for (let currentDistVal = 1; currentDistVal < numNodes; currentDistVal++) {
        const currentDistancePairCount = calculatePairsForDistance(currentDistVal, numNodes, xCoord, yCoord);
        console.log(currentDistancePairCount);
    }
}

processGraphDistances(require('fs').readFileSync('/dev/stdin', 'utf8'));
