const processData = (rawData) => {
    const lines = rawData.split('\n');
    const [configLine, dataLine] = lines;

    const parameters = configLine.split(' ').map(Number);
    const totalCount = parameters[1];
    const limitBoundary = parameters[2];

    const dataSeries = dataLine.split(' ').map(Number);

    const firstRelevantIndex = dataSeries.findIndex(
        (entry) => entry > limitBoundary
    );

    if (firstRelevantIndex !== -1) {
        const distanceA = firstRelevantIndex;
        const distanceB = totalCount - firstRelevantIndex;
        console.log(Math.min(distanceA, distanceB));
    }
};

const acquiredInput = require("fs").readFileSync("/dev/stdin", "utf8");
processData(acquiredInput);