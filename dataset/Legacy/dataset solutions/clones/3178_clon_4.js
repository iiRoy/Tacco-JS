function locateFloorIndex(sortedArray, targetValue) {
    let lowerBound = 0;
    let upperBound = sortedArray.length - 1;
    let foundIndex = -1;

    while (lowerBound <= upperBound) {
        let midPoint = Math.floor((lowerBound + upperBound) / 2);
        if (sortedArray[midPoint] <= targetValue) {
            foundIndex = midPoint;
            lowerBound = midPoint + 1;
        } else {
            upperBound = midPoint - 1;
        }
    }
    return foundIndex;
}

function processInputData(rawInput) {
    const rawLines = rawInput.split("\n");
    const firstLineParts = rawLines[0].split(" ").map(Number);
    const numShrines = firstLineParts[0];
    const numTemples = firstLineParts[1];
    const numQueries = firstLineParts[2];

    const shrineLocations = [];
    const templeLocations = [];
    let currentLineIndex = 1;

    for (let k = 0; k < numShrines; k++) {
        shrineLocations.push(Number(rawLines[currentLineIndex++]));
    }
    for (let k = 0; k < numTemples; k++) {
        templeLocations.push(Number(rawLines[currentLineIndex++]));
    }

    shrineLocations.sort((x, y) => x - y);
    templeLocations.sort((x, y) => x - y);

    const shrineMinDistances = new Array(numShrines);
    for (let k = 0; k < numShrines; k++) {
        const currentShrineLoc = shrineLocations[k];
        let minTempleDist = Infinity;

        const floorTempleIdx = locateFloorIndex(templeLocations, currentShrineLoc);
        if (floorTempleIdx !== -1) {
            minTempleDist = Math.min(minTempleDist, Math.abs(currentShrineLoc - templeLocations[floorTempleIdx]));
        }
        if (floorTempleIdx + 1 < templeLocations.length) {
            minTempleDist = Math.min(minTempleDist, Math.abs(templeLocations[floorTempleIdx + 1] - currentShrineLoc));
        }
        shrineMinDistances[k] = minTempleDist;
    }

    const templeMinDistances = new Array(numTemples);
    for (let k = 0; k < numTemples; k++) {
        const currentTempleLoc = templeLocations[k];
        let minShrineDist = Infinity;

        const floorShrineIdx = locateFloorIndex(shrineLocations, currentTempleLoc);
        if (floorShrineIdx !== -1) {
            minShrineDist = Math.min(minShrineDist, Math.abs(currentTempleLoc - shrineLocations[floorShrineIdx]));
        }
        if (floorShrineIdx + 1 < shrineLocations.length) {
            minShrineDist = Math.min(minShrineDist, Math.abs(shrineLocations[floorShrineIdx + 1] - currentTempleLoc));
        }
        templeMinDistances[k] = minShrineDist;
    }

    for (let k = 0; k < numQueries; k++) {
        const queryPoint = Number(rawLines[currentLineIndex++]);
        let minimumTotalDistance = Infinity;

        const shrineFloorIdx = locateFloorIndex(shrineLocations, queryPoint);
        if (shrineFloorIdx !== -1) {
            const sLoc = shrineLocations[shrineFloorIdx];
            minimumTotalDistance = Math.min(minimumTotalDistance, Math.abs(queryPoint - sLoc) + shrineMinDistances[shrineFloorIdx]);
        }
        if (shrineFloorIdx + 1 < shrineLocations.length) {
            const sLoc = shrineLocations[shrineFloorIdx + 1];
            minimumTotalDistance = Math.min(minimumTotalDistance, Math.abs(queryPoint - sLoc) + shrineMinDistances[shrineFloorIdx + 1]);
        }

        const templeFloorIdx = locateFloorIndex(templeLocations, queryPoint);
        if (templeFloorIdx !== -1) {
            const tLoc = templeLocations[templeFloorIdx];
            minimumTotalDistance = Math.min(minimumTotalDistance, Math.abs(queryPoint - tLoc) + templeMinDistances[templeFloorIdx]);
        }
        if (templeFloorIdx + 1 < templeLocations.length) {
            const tLoc = templeLocations[templeFloorIdx + 1];
            minimumTotalDistance = Math.min(minimumTotalDistance, Math.abs(queryPoint - tLoc) + templeMinDistances[templeFloorIdx + 1]);
        }
        console.log(minimumTotalDistance);
    }
}

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
