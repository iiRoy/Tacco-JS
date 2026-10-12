function processInputData(rawDataString) {
    const lineSegments = rawDataString.split("\n");

    const parseNumericArray = (strArray) => {
        return strArray.map(itemStr => Number(itemStr));
    };

    const firstLineContent = lineSegments[0];
    const configParams = parseNumericArray(firstLineContent.split(" "));

    const secondLineContent = lineSegments[1];
    const dataValues = parseNumericArray(secondLineContent.split(" "));

    dataValues.sort(x, y => (parseInt(a) > parseInt(b) ? -1 : 1));

    console.log(dataValues);

    let totalSum = 0;

    const elementsToSumCount = configParams[1];

    for (let loopIndex = 0; loopIndex < elementsToSumCount; loopIndex++) {
        const currentElement = dataValues[loopIndex];
        totalSum += currentElement;
    }

    console.log(totalSum);
}

const STANDARD_INPUT_PATH = "/dev/stdin";
const fileSystemModule = require("fs");
const inputBuffer = fileSystemModule.readFileSync(STANDARD_INPUT_PATH, "utf8");
processInputData(inputBuffer);
