const calculateAbsoluteDifference = (val1, val2) => {
    return Math.abs(val1 - val2);
};

function solveProblem(rawInputString) {
    const trimmedInput = rawInputString.trim();
    const stringParts = trimmedInput.split(" ");
    const numericValues = stringParts.map(Number);

    const primaryValue = numericValues[0];
    const refPointA = numericValues[1];
    const refPointB = numericValues[2];

    const diffToA = calculateAbsoluteDifference(primaryValue, refPointA);
    const diffToB = calculateAbsoluteDifference(primaryValue, refPointB);

    let resultIndicator;
    if (diffToA < diffToB) {
        resultIndicator = "A";
    } else {
        resultIndicator = "B";
    }
    console.log(resultIndicator);
}

const fileSystemModule = require("fs");
const standardInputPath = "/dev/stdin";
const encodingFormat = "utf8";

const fileContent = fileSystemModule.readFileSync(standardInputPath, encodingFormat);
solveProblem(fileContent);
