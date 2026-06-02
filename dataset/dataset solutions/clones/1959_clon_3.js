function processInput(dataArray) {
    const CIRCLE_CONSTANT_FACTOR = 2;
    const PI_VALUE = Math.PI;

    const rawRadiusString = dataArray[0];

    const radiusNumericValue = +rawRadiusString;

    const computeCircumference = (currentRadius) => {
        return currentRadius * CIRCLE_CONSTANT_FACTOR * PI_VALUE;
    };

    const calculatedCircumference = computeCircumference(radiusNumericValue);

    console.log(calculatedCircumference);
}

const fileSystemHandler = require("fs");
const standardInputPath = "/dev/stdin";
const fileContentEncoding = "utf8";

const rawFileContent = fileSystemHandler.readFileSync(standardInputPath, fileContentEncoding);

const processedLines = rawFileContent.trim().split("\n");

processInput(processedLines);
