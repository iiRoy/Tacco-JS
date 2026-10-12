const fileSystem = require("fs");
const rawInputData = fileSystem.readFileSync("/dev/stdin", "utf8");

const dataLines = rawInputData.split('\n');

const firstLineContent = dataLines[0];
const numberStrings = firstLineContent.split(' ');
const firstValue = Number(numberStrings[0]);
const secondValue = Number(numberStrings[1]);

const moduloResult = firstValue % 2;
let calculatedEvenBase = firstValue - moduloResult;

const generateOutputString = (currentIteration, baseValue) => {
    const firstPart = currentIteration + 1;
    const secondPart = baseValue - currentIteration;
    return `${firstPart} ${secondPart}`;
};

let iterationIndex = 0;
while (iterationIndex < secondValue) {
    console.log(generateOutputString(iterationIndex, calculatedEvenBase));
    iterationIndex++;
}
