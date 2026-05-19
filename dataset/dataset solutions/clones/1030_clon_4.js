(function executeAnalysis() {
    const inputContent = require('fs').readFileSync('/dev/stdin', 'utf8').trim();
    const characterStream = Array.from(inputContent);

    const initialSegment = characterStream.slice(characterStream.findIndex(c => c === '\\') || characterStream.length);
    const finalSegment = initialSegment.slice(0, (initialSegment.lastIndexOf('/') + 1) || 0);

    const initialLevels = [0];
    const elevationProfile = finalSegment.reduce((accumulator, symbol) => {
        const lastKnownLevel = accumulator[accumulator.length - 1];
        let nextLevel;
        if (symbol === '\\') {
            nextLevel = lastKnownLevel - 1;
        } else if (symbol === '_') {
            nextLevel = lastKnownLevel;
        } else { // symbol === '/'
            nextLevel = lastKnownLevel + 1;
        }
        accumulator.push(nextLevel);
        return accumulator;
    }, initialLevels);

    const allPools = processElevationData(elevationProfile, []);

    const totalVolume = allPools.reduce((sum, volume) => sum + volume, 0);

    console.log(totalVolume);
    if (allPools.length > 0) {
        console.log(allPools.length + ' ' + allPools.join(' '));
    } else {
        console.log(0);
    }

    function processElevationData(elevationPoints, collectedPools) {
        if (elevationPoints.length <= 1) {
            return collectedPools;
        }

        const startingElevation = elevationPoints[0];
        const subsequentElevation = elevationPoints[1];

        if (subsequentElevation >= startingElevation) {
            return processElevationData(elevationPoints.slice(1), collectedPools);
        }

        let potentialBoundaryIndex = -1;
        for (let k = 1; k < elevationPoints.length; k++) {
            if (elevationPoints[k] >= startingElevation) {
                potentialBoundaryIndex = k;
                break;
            }
        }

        if (potentialBoundaryIndex === -1) {
            return processElevationData(elevationPoints.slice(1), collectedPools);
        }

        let currentPoolVolume = 0;
        for (let k = 1; k < potentialBoundaryIndex; k++) {
            currentPoolVolume += startingElevation - elevationPoints[k];
        }

        const updatedPools = collectedPools.concat(currentPoolVolume);
        return processElevationData(elevationPoints.slice(potentialBoundaryIndex), updatedPools);
    }
})();
