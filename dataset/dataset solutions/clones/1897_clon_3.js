const processInputData = (rawDataString) => {
    const inputLines = rawDataString.split('\n').filter(lineContent => lineContent.trim() !== '');
    const parseInteger = (strValue) => parseInt(strValue, 10);
    const mapToNumbers = (strLine) => strLine.split(' ').map(parseInteger);

    const firstLineValues = mapToNumbers(inputLines.shift());
    const numberOfLocations = firstLineValues[0];
    const numberOfRoads = firstLineValues[1];

    const locationHeightsArray = mapToNumbers(inputLines.shift());
    const roadConnectionsArray = inputLines.map(mapToNumbers);

    return {
        N_val: numberOfLocations,
        M_val: numberOfRoads,
        H_arr: locationHeightsArray,
        A_arr: roadConnectionsArray
    };
};

const MainProgram = (inputDataString) => {
    const { N_val, M_val, H_arr, A_arr } = processInputData(inputDataString);
    console.log(determineGoodPeaksCount(N_val, M_val, H_arr, A_arr));
};

const determineGoodPeaksCount = (totalLocations, totalRoads, heightsOfLocations, roadNetwork) => {
    const adjacencies = Array.from({ length: totalLocations + 1 }, () => []);

    for (let roadIndex = 0; roadIndex < totalRoads; roadIndex++) {
        const [locationOne, locationTwo] = roadNetwork[roadIndex];
        adjacencies[locationOne].push(locationTwo);
        adjacencies[locationTwo].push(locationOne);
    }

    let goodPeaksCounter = 0;

    const checkIsPeak = (currentLocationIdentifier, allHeights, adjacencyStructure) => {
        const currentLocHeight = allHeights[currentLocationIdentifier - 1];
        const connectedNeighbors = adjacencyStructure[currentLocationIdentifier];

        if (connectedNeighbors.length === 0) {
            return true; // A location with no roads is always a peak
        }

        const neighborHeights = connectedNeighbors.map(neighborId => allHeights[neighborId - 1]);
        const highestNeighborHeight = Math.max(...neighborHeights);

        return currentLocHeight > highestNeighborHeight;
    };

    for (let locId = 1; locId <= totalLocations; locId++) {
        if (checkIsPeak(locId, heightsOfLocations, adjacencies)) {
            goodPeaksCounter++;
        }
    }

    return goodPeaksCounter;
};

MainProgram(require("fs").readFileSync("/dev/stdin", "utf8"));
