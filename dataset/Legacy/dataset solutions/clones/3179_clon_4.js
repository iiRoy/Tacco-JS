const parseNumericArray = (lines, startIdx, count) => {
    const result = [];
    for (let k = 0; k < count; k++) {
        result.push(Number(lines[startIdx + k]));
    }
    return result.sort((a, b) => a - b);
};

const getAdjacentValues = (sortedArr, targetValue) => {
    const candidates = new Set();
    let low = 0;
    let high = sortedArr.length - 1;
    let insertionPoint = -1;

    while (low <= high) {
        const mid = Math.floor((low + high) / 2);
        if (sortedArr[mid] === targetValue) {
            insertionPoint = mid;
            break;
        } else if (sortedArr[mid] < targetValue) {
            low = mid + 1;
        } else {
            high = mid - 1;
        }
    }

    if (insertionPoint !== -1) {
        candidates.add(sortedArr[insertionPoint]);
        if (insertionPoint > 0) candidates.add(sortedArr[insertionPoint - 1]);
        if (insertionPoint < sortedArr.length - 1) candidates.add(sortedArr[insertionPoint + 1]);
    } else {
        if (high >= 0) candidates.add(sortedArr[high]);
        if (low < sortedArr.length) candidates.add(sortedArr[low]);
    }
    return Array.from(candidates);
};

function Main(rawData) {
    const lineSegments = rawData.split("\n");
    const initialParameters = lineSegments[0].split(" ").map(Number);

    const shrineCount = initialParameters[0];
    const templeCount = initialParameters[1];
    const queryCount = initialParameters[2];

    const sortedShrineLocations = parseNumericArray(lineSegments, 1, shrineCount);

    const sortedTempleLocations = parseNumericArray(lineSegments, 1 + shrineCount, templeCount);

    for (let queryIndex = 0; queryIndex < queryCount; queryIndex++) {
        const currentQueryLocation = Number(lineSegments[1 + shrineCount + templeCount + queryIndex]);

        const candidateShrines = getAdjacentValues(sortedShrineLocations, currentQueryLocation);
        const candidateTemples = getAdjacentValues(sortedTempleLocations, currentQueryLocation);

        let minimumTravelCost = Infinity;

        for (const sLoc of candidateShrines) {
            for (const tLoc of candidateTemples) {
                const currentPathCost = Math.abs(sLoc - tLoc) + Math.min(Math.abs(currentQueryLocation - sLoc), Math.abs(currentQueryLocation - tLoc));
                minimumTravelCost = Math.min(minimumTravelCost, currentPathCost);
            }
        }
        console.log(minimumTravelCost);
    }
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
