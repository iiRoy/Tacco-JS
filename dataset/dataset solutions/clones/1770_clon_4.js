function determinePossibility(rawData) {
    const processedInput = rawData.trim();
    const parts = processedInput.split(" ");

    const numEntities = Number(parts[0]);
    const totalConnections = Number(parts[1]);

    const minimumConnections = numEntities * 2;
    const maximumConnections = numEntities * 4;

    const lowerDifference = totalConnections - minimumConnections;
    const upperDifference = maximumConnections - totalConnections;

    const isWithinBounds = Math.min(lowerDifference, upperDifference) >= 0;

    process.stdout.write(isWithinBounds ? "Yes" : "No");
}

const nodeFs = require("node:fs");
const standardInputBuffer = nodeFs.readFileSync("/dev/stdin");
determinePossibility(standardInputBuffer.toString("utf8"));