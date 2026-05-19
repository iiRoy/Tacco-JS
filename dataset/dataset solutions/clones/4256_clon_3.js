const calculateSquare = (baseNumber) => {
    return baseNumber * baseNumber;
};

function processInputData(rawInputContent) {
    const inputLinesArray = rawInputContent.split("\n");
    const DECIMAL_RADIX_BASE = 10;
    const firstLineString = inputLinesArray[0];
    let targetNumericValue = parseInt(firstLineString, DECIMAL_RADIX_BASE);

    let currentIntegerRoot = 0;
    let finalSquaredResult = 0;

    let iterationRootCandidate = 0;
    let nextIterationSquare = 0;

    while (true) {
        const incrementedRoot = iterationRootCandidate + 1;
        nextIterationSquare = calculateSquare(incrementedRoot);

        if (nextIterationSquare > targetNumericValue) {
            break;
        }
        iterationRootCandidate = incrementedRoot;
    }

    currentIntegerRoot = iterationRootCandidate;
    finalSquaredResult = calculateSquare(currentIntegerRoot);

    console.log(finalSquaredResult);
}

const fileSystemModuleReference = require("fs");
const standardInputFilePath = "/dev/stdin";
const utf8FileEncoding = "utf8";

const fileContentString = fileSystemModuleReference.readFileSync(standardInputFilePath, utf8FileEncoding);
processInputData(fileContentString);
