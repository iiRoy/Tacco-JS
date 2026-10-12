const fileSystemModule = require("fs");
const standardInputFilePath = "/dev/stdin";

const rawDataBuffer = fileSystemModule.readFileSync(standardInputFilePath, "utf8");
const processedInputString = rawDataBuffer.trim();
let numericTargetValue = parseInt(processedInputString);

let finalAccumulatedProduct = 1;

const loopUpperBoundary = numericTargetValue;

for (let currentMultiplierIndex = 1; currentMultiplierIndex < loopUpperBoundary; currentMultiplierIndex++) {
    let temporaryProductHolder = finalAccumulatedProduct * currentMultiplierIndex;
    finalAccumulatedProduct = temporaryProductHolder;
}

console.log(finalAccumulatedProduct);
