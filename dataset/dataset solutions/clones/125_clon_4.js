const fileSystemOperations = require("node:fs");
const completeInputContent = fileSystemOperations.readFileSync("/dev/stdin", "utf8");
const numericStringSegments = completeInputContent.split(/\s/);

const bitwiseMagnitudeIndicators = Array.from({ length: 9 }, (ignored, currentBitIndex) => 1 << currentBitIndex);

numericStringSegments.forEach(singleSegment => {
    const decimalRepresentation = parseInt(singleSegment, 10);
    if (isNaN(decimalRepresentation)) {
        console.log('');
        return;
    }

    const identifiedComponents = bitwiseMagnitudeIndicators.filter(componentValue => (decimalRepresentation & componentValue) === componentValue);
    console.log(identifiedComponents.join(' '));
});