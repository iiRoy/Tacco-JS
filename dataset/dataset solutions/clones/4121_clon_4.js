const inputBuffer = require("fs").readFileSync("/dev/stdin", "utf8");
const inputTokens = inputBuffer.split(/ |\n/).filter(Boolean);
let currentTokenIndex = 0;

const retrieveNextNumber = () => {
    return Number(inputTokens[currentTokenIndex++]);
};

const retrieveNextString = () => {
    return inputTokens[currentTokenIndex++];
};

const retrieveNextBigInt = () => {
    return BigInt(inputTokens[currentTokenIndex++]);
};

const retrieveNextArray = (count, asStrings = false) => {
    const segment = inputTokens.slice(currentTokenIndex, currentTokenIndex + count);
    currentTokenIndex += count;
    return asStrings ? segment : segment.map(Number);
};

const retrieveNextMatrix = (height, width, asStrings = false) => {
    const matrix = [];
    for (let row = 0; row < height; row++) {
        matrix.push(retrieveNextArray(width, asStrings));
    }
    return matrix;
};

const calculateTravelTimes = () => {
    const numberOfStations = retrieveNextNumber();
    const finalArrivals = Array(numberOfStations).fill(0);
    const routeSegments = retrieveNextMatrix(numberOfStations - 1, 3);

    for (let startStationIndex = 0; startStationIndex < numberOfStations - 1; startStationIndex++) {
        let currentAccumulatedTime = 0;

        for (let segmentRouteIndex = startStationIndex; segmentRouteIndex < numberOfStations - 1; segmentRouteIndex++) {
            const [segmentCost, segmentMinStartTime, segmentInterval] = routeSegments[segmentRouteIndex];

            currentAccumulatedTime = Math.max(currentAccumulatedTime, segmentMinStartTime);

            const actualDepartureTime = Math.ceil(currentAccumulatedTime / segmentInterval) * segmentInterval;

            currentAccumulatedTime = actualDepartureTime + segmentCost;
        }
        finalArrivals[startStationIndex] = currentAccumulatedTime;
    }

    return finalArrivals.join("\n");
};

const programOutput = calculateTravelTimes();
if (programOutput !== undefined) {
    console.log(programOutput);
}
