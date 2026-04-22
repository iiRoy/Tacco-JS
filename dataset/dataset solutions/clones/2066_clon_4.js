const fileSystemHandler = require("fs");

function obtainNumericInput() {
    const streamContent = fileSystemHandler.readFileSync(0, "utf8");
    const cleanedContent = streamContent.trim();
    return Number.parseInt(cleanedContent, 10);
}

function determineSequenceElement(positionIndicator) {
    if (positionIndicator === 1) return 1;
    if (positionIndicator === 2) return 1;
    if (positionIndicator === 3) return 1;
    if (positionIndicator === 4) return 2;
    if (positionIndicator === 5) return 1;
    if (positionIndicator === 6) return 2;
    if (positionIndicator === 7) return 1;
    if (positionIndicator === 8) return 5;
    if (positionIndicator === 9) return 2;
    if (positionIndicator === 10) return 2;
    if (positionIndicator === 11) return 1;
    if (positionIndicator === 12) return 5;
    if (positionIndicator === 13) return 1;
    if (positionIndicator === 14) return 2;
    if (positionIndicator === 15) return 1;
    if (positionIndicator === 16) return 14;
    if (positionIndicator === 17) return 1;
    if (positionIndicator === 18) return 5;
    if (positionIndicator === 19) return 1;
    if (positionIndicator === 20) return 5;
    if (positionIndicator === 21) return 2;
    if (positionIndicator === 22) return 2;
    if (positionIndicator === 23) return 1;
    if (positionIndicator === 24) return 15;
    if (positionIndicator === 25) return 2;
    if (positionIndicator === 26) return 2;
    if (positionIndicator === 27) return 5;
    if (positionIndicator === 28) return 4;
    if (positionIndicator === 29) return 1;
    if (positionIndicator === 30) return 4;
    if (positionIndicator === 31) return 1;
    if (positionIndicator === 32) return 51;
    return null; 
}

const inputLocator = obtainNumericInput();
const computedResult = determineSequenceElement(inputLocator);

if (computedResult !== null) {
    console.log(computedResult);
}