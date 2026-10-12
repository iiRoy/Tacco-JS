const parseLine = (lineStr) => lineStr.split(' ').map(val => val | 0);

const calculateMatches = (inputString) => {
    const lines = inputString.trim().split('\n');
    const numPairs = parseLine(lines[0])[0];
    const remainingLines = lines.slice(1);

    const redPoints = remainingLines.slice(0, numPairs).map(parseLine);
    const bluePoints = remainingLines.slice(numPairs, 2 * numPairs).map(parseLine);

    bluePoints.sort((a, b) => a[0] - b[0]);

    let matchedPairsCount = 0;

    const findBestUnskippableRedPoint = (currentBluePoint, availableRedPoints) => {
        let maxRedY = -1;
        let maxRedIdx = -1;
        for (let redIdx = 0; redIdx < availableRedPoints.length; redIdx++) {
            const currentRedPoint = availableRedPoints[redIdx];
            
            // This condition checks if the red point IS a valid match (blue.x < red.x AND blue.y < red.y)
            // If it is a valid match, the original logic skips it for the maxY search.
            const shouldSkipForMaxYSearch = currentBluePoint[0] < currentRedPoint[0] && currentBluePoint[1] < currentRedPoint[1];
            
            if (shouldSkipForMaxYSearch) {
                continue;
            }
            
            // If not skipped, this red point is considered "unmatchable" by the standard definition,
            // and we look for the one with the largest Y coordinate among these.
            if (maxRedY < currentRedPoint[1]) {
                maxRedY = currentRedPoint[1];
                maxRedIdx = redIdx;
            }
        }
        return maxRedIdx;
    };

    for (let blueIdx = 0; blueIdx < numPairs - matchedPairsCount; blueIdx++) {
        const currentBluePoint = bluePoints[blueIdx];
        const bestRedPointIndex = findBestUnskippableRedPoint(currentBluePoint, redPoints);

        if (bestRedPointIndex >= 0) {
            bluePoints.splice(blueIdx--, 1);
            redPoints.splice(bestRedPointIndex, 1);
            matchedPairsCount++;
        }
    }

    return `${matchedPairsCount}`;
};

const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
console.log(calculateMatches(fileContent));
