const dataSource = require('fs').readFileSync('/dev/stdin', 'utf8');

const parsedLines = dataSource.trim().split('\n');
const numericalPairs = parsedLines.map((s) => s.split(' ').map(Number));

function assessConnectivity(vertexDegrees) {
    const oddVertices = Object.keys(vertexDegrees)
                              .filter(vtxKey => vertexDegrees[vtxKey] % 2 !== 0)
                              .map(Number);

    const numOdd = oddVertices.length;

    switch (numOdd) {
        case 0:
            return false;
        case 2:
            oddVertices.sort((a, b) => a - b);
            return oddVertices[0] === 1 && oddVertices[1] === 2;
        default:
            return false;
    }
}

const processingResult = numericalPairs.reduce((accumulatedState, currentPair) => {
    const [alpha, beta] = currentPair;

    if (alpha === 0 && beta === 0) {
        const segmentOutcome = assessConnectivity(accumulatedState.currentDegrees) ? 'OK' : 'NG';
        accumulatedState.outputMessages.push(segmentOutcome);
        accumulatedState.currentDegrees = {};
    } else {
        accumulatedState.currentDegrees[alpha] = (accumulatedState.currentDegrees[alpha] || 0) + 1;
        accumulatedState.currentDegrees[beta] = (accumulatedState.currentDegrees[beta] || 0) + 1;
    }
    return accumulatedState;
}, { currentDegrees: {}, outputMessages: [] });

processingResult.outputMessages.forEach(msg => console.log(msg));