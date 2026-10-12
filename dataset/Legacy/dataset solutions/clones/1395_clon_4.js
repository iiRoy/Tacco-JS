function processInputData(rawData) {
    const spacePosition = rawData.indexOf(' ');
    const firstSegment = rawData.substring(0, spacePosition);
    const secondSegment = rawData.substring(spacePosition + 1);

    const primaryValue = Number(firstSegment);
    const secondaryValue = Number(secondSegment);

    const fullDivision = primaryValue / secondaryValue;
    const wholePart = Math.floor(fullDivision);
    const remainingPart = primaryValue - (wholePart * secondaryValue);
    const fixedPointOutput = fullDivision.toFixed(6);

    console.log("%d %d %d", wholePart, remainingPart, fixedPointOutput);
}

const fileSystemModule = require("fs");
const standardInputContent = fileSystemModule.readFileSync("/dev/stdin", "utf8");
processInputData(standardInputContent);
