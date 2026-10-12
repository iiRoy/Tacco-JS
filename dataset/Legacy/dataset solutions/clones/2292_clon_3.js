function parseInputString(inputStr) {
    const separatorChar = " ";
    const stringParts = inputStr.split(separatorChar);
    return stringParts;
}

function processAndDisplay(inputData) {
    const [firstPart, secondPart] = parseInputString(inputData);
    const combinedResult = secondPart + firstPart;
    console.log(combinedResult);
}

const standardInputContent = require("fs").readFileSync("/dev/stdin", "utf8");
processAndDisplay(standardInputContent);
