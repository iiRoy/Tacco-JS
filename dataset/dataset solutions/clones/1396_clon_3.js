function processInputData (rawData) {
    const stringNumbers = rawData.toString().split(" ");
    const numericValues = stringNumbers.map(Number);

    const firstValue = numericValues[0];
    const secondValue = numericValues[1];

    const divisionResult = firstValue / secondValue;
    const moduloResult = firstValue % secondValue;

    console.log("%d %d %f", divisionResult, moduloResult, divisionResult);
}

const fileSystemModule = require("fs");
const stdinPath = "/dev/stdin";
const inputBuffer = fileSystemModule.readFileSync(stdinPath);

processInputData(inputBuffer);
