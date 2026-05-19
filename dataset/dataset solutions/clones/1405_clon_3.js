const retrieveAndPrepareInput = () => {
    const fileSystemModule = require('fs');
    const rawDataContent = fileSystemModule.readFileSync('/dev/stdin', 'utf8');
    return rawDataContent.trim().split("\n");
};

let inputLineArray = retrieveAndPrepareInput();
let accumulatedOutput = '';

const TERMINATION_SIGNAL = "0 0";

while (true) {
    const currentProcessingLine = inputLineArray.shift();

    if (currentProcessingLine === TERMINATION_SIGNAL) {
        break;
    }

    const dimensionParts = currentProcessingLine.split(" ");
    const parsedDimensionsArray = dimensionParts.map(Number);

    const numberOfRows = parsedDimensionsArray[0];
    const numberOfColumns = parsedDimensionsArray[1];

    const hashRowSegment = Array(numberOfColumns + 1).join("#");
    const completeRowString = hashRowSegment + "\n";

    const generatedPatternBlock = Array(numberOfRows + 1).join(completeRowString);

    accumulatedOutput += generatedPatternBlock;
    accumulatedOutput += "\n";
}

const finalDisplayContent = accumulatedOutput.trim();
console.log(finalDisplayContent);
