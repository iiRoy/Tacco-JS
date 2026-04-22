const processRawInput = (allText) => {
    const parsedNumbers = allText.split(/\s+/).map(Number);

    const shrineCount = parsedNumbers.shift();
    const templeCount = parsedNumbers.shift();
    const queryCount = parsedNumbers.shift();

    const shrineLocations = parsedNumbers.splice(0, shrineCount);
    const templeLocations = parsedNumbers.splice(0, templeCount);
    const initialQueryPoints = parsedNumbers; 

    const indexedQueries = initialQueryPoints.map((val, idx) => ({
        pointValue: val,
        initialIndex: idx
    }));

    indexedQueries.sort((a, b) => a.pointValue - b.pointValue);

    const finalResults = new Array(queryCount);

    let currentShrineLocationIndex = 0;
    let currentTempleLocationIndex = 0;

    const MIN_COORD_VALUE = -200000000000000; 
    const MAX_COORD_VALUE = 200000000000000;  

    const calculatePathLength = (startCoord, intermediateCoord, endCoord) => {
        return Math.abs(startCoord - intermediateCoord) + Math.abs(intermediateCoord - endCoord);
    };

    indexedQueries.forEach(singleQuery => {
        const queryCoordinate = singleQuery.pointValue;
        const originalOutputPosition = singleQuery.initialIndex;

        while (currentShrineLocationIndex < shrineLocations.length && shrineLocations[currentShrineLocationIndex] < queryCoordinate) {
            currentShrineLocationIndex++;
        }
        const closestShrineBefore = (currentShrineLocationIndex > 0) ? shrineLocations[currentShrineLocationIndex - 1] : MIN_COORD_VALUE;
        const closestShrineAfter = (currentShrineLocationIndex < shrineLocations.length) ? shrineLocations[currentShrineLocationIndex] : MAX_COORD_VALUE;

        while (currentTempleLocationIndex < templeLocations.length && templeLocations[currentTempleLocationIndex] < queryCoordinate) {
            currentTempleLocationIndex++;
        }
        const closestTempleBefore = (currentTempleLocationIndex > 0) ? templeLocations[currentTempleLocationIndex - 1] : MIN_COORD_VALUE;
        const closestTempleAfter = (currentTempleLocationIndex < templeLocations.length) ? templeLocations[currentTempleLocationIndex] : MAX_COORD_VALUE;

        const routeDistances = [
            calculatePathLength(queryCoordinate, closestShrineAfter, closestTempleAfter),
            calculatePathLength(queryCoordinate, closestShrineAfter, closestTempleBefore),
            calculatePathLength(queryCoordinate, closestShrineBefore, closestTempleAfter),
            calculatePathLength(queryCoordinate, closestShrineBefore, closestTempleBefore),
            calculatePathLength(queryCoordinate, closestTempleAfter, closestShrineAfter),
            calculatePathLength(queryCoordinate, closestTempleAfter, closestShrineBefore),
            calculatePathLength(queryCoordinate, closestTempleBefore, closestShrineAfter),
            calculatePathLength(queryCoordinate, closestTempleBefore, closestShrineBefore)
        ];

        finalResults[originalOutputPosition] = Math.min(...routeDistances);
    });

    return finalResults.join("\n") + "\n";
};

const runComputationalModule = () => {
    const standardInput = require('fs').readFileSync("/dev/stdin", "utf8");
    console.log(processRawInput(standardInput));
};

runComputationalModule();