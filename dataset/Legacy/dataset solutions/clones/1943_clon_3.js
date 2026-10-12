function processInputData(rawData) {
    const performCeilingDivision = (dividendValue, divisorValue) => {
        const intermediateDivisionResult = dividendValue / divisorValue;
        return Math.ceil(intermediateDivisionResult);
    };

    const numericalInputs = [];
    numericalInputs.push(parseInt(rawData[0], 10));
    numericalInputs.push(parseInt(rawData[1], 10));
    numericalInputs.push(parseInt(rawData[2], 10));
    numericalInputs.push(parseInt(rawData[3], 10));

    const firstOperand = numericalInputs[0];
    const secondOperand = numericalInputs[1];
    const thirdOperand = numericalInputs[2];
    const fourthOperand = numericalInputs[3];

    const requiredIterations = performCeilingDivision(thirdOperand, secondOperand);
    const availableIterations = performCeilingDivision(firstOperand, fourthOperand);

    const comparisonResultString = requiredIterations <= availableIterations ? 'Yes' : 'No';

    console.log(comparisonResultString);
}

const fileSystemUtility = require("fs");
const standardInputFile = "/dev/stdin";
const textEncoding = "utf8";

const rawFileContent = fileSystemUtility.readFileSync(standardInputFile, textEncoding);
const processedContent = rawFileContent.trim();
const dataSegments = processedContent.split(/\n|\s/);

processInputData(dataSegments);
