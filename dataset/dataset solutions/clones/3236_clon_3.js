function processInput(rawDataString) {
    const stringSegments = rawDataString.split(" ");

    const numericalData = stringSegments.map(Number);

    const valA = numericalData[0];
    const valB = numericalData[1];
    const valC = numericalData[2];

    const sumOfBAndC = valB + valC;

    let computedResult = sumOfBAndC - valA;

    computedResult = Math.max(0, computedResult);

    const minimumOfBAndC = Math.min(valB, valC);

    const finalOutputString = minimumOfBAndC + " " + computedResult;

    console.log(finalOutputString);
}

const fileSystemUtility = require("fs");
const rawFileContent = fileSystemUtility.readFileSync("/dev/stdin", "utf8");
const cleanedInputContent = rawFileContent.trim();

processInput(cleanedInputContent);
