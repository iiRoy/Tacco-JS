const fileContent = require("fs").readFileSync("/dev/stdin", "utf8");
const contentRows = fileContent.split('\n');

const firstLineData = contentRows[0];
const parameterStrings = firstLineData.split(' ');

const firstParameter = Number(parameterStrings[0]);
const secondParameter = Number(parameterStrings[1]);

const parityCheckResult = firstParameter % 2;
const adjustmentValue = parityCheckResult === 0 ? 2 : 1;

let calculatedBaseValue = firstParameter - adjustmentValue;

for (let currentIteration = 0; currentIteration < secondParameter; currentIteration++) {
    const outputLeftComponent = currentIteration + 1;
    const outputRightComponent = calculatedBaseValue - currentIteration;
    console.log(`${outputLeftComponent} ${outputRightComponent}`);
}
