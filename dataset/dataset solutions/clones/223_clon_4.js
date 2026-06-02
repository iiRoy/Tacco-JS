const fileSystemModule = require("fs");

const transformationFactor = 1688 / 243;

const standardInputContent = fileSystemModule.readFileSync("/dev/stdin", "utf8");
const inputTokens = standardInputContent.split(/\s/);

inputTokens.forEach(function(currentInputString) {
    const numericalValue = Number(currentInputString);
    const calculatedResult = numericalValue * transformationFactor;
    console.log(calculatedResult.toFixed(8));
});
