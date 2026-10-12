function processInputData(rawDataString) {
    const trimmedData = rawDataString.trim();
    const dataLines = trimmedData.split("\n");

    const parseNumericValue = (lineContent) => {
        return parseInt(lineContent, 10);
    };

    const firstParsedValue = parseNumericValue(dataLines[0]);
    const secondParsedValue = parseNumericValue(dataLines[1]);

    const initialSetOfNumbers = [1, 2, 3];

    const isNotExcluded = (candidateNumber) => {
        const isDifferentFromFirst = candidateNumber !== firstParsedValue;
        const isDifferentFromSecond = candidateNumber !== secondParsedValue;
        return isDifferentFromFirst && isDifferentFromSecond;
    };

    const finalSelectionResult = initialSetOfNumbers.filter(isNotExcluded);

    const resultToDisplay = finalSelectionResult[0];
    console.log(resultToDisplay);
}
   
const fileSystemModule = require("fs");
const standardInputPath = "/dev/stdin";
const rawFileContent = fileSystemModule.readFileSync(standardInputPath, "utf8");
processInputData(rawFileContent);
