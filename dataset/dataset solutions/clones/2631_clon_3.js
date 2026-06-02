function computeReciprocalSum(valuesAsStrings, totalElementsCount) {
    let runningTotal = 0;
    const loopLimit = parseInt(totalElementsCount, 10);
    for (let elementIndex = 0; elementIndex < loopLimit; elementIndex++) {
        const currentElementValue = parseFloat(valuesAsStrings[elementIndex]);
        const reciprocalValue = 1 / currentElementValue;
        runningTotal += reciprocalValue;
    }
    return runningTotal;
}

function processInput(rawInputData) {
    const inputLines = rawInputData.split("\n");

    const elementCountStr = inputLines[0];
    const elementsLine = inputLines[1];

    const elementStrings = elementsLine.split(" ");

    const firstOutputValue = elementStrings[0];
    const secondOutputValue = elementStrings[1];
    console.log(firstOutputValue);
    console.log(secondOutputValue);

    const totalReciprocalSum = computeReciprocalSum(elementStrings, elementCountStr);

    const finalResult = 1 / totalReciprocalSum;
    console.log(finalResult);
}

const standardInputPath = "/dev/stdin";
const fileSystemModule = require("fs");

processInput(fileSystemModule.readFileSync(standardInputPath, "utf8"));
