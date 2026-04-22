const determineOverallLength = (sourceData) => {
    const lineSegments = [...sourceData.matchAll(/(\d+) (\d+)/g)];

    const cumulativeExtent = lineSegments.reduce((currentTotal, currentSegmentMatch) => {
        const startingPoint = Number(currentSegmentMatch[1]);
        const endingPoint = Number(currentSegmentMatch[2]);
        return currentTotal + (endingPoint - startingPoint + 1);
    }, 0);

    return cumulativeExtent;
};

const acquiredData = require("fs").readFileSync("/dev/stdin", "utf8");
const finalSummation = determineOverallLength(acquiredData);

process.stdout.write(`${finalSummation}\n`);