function calculateRemainderToNextThousand(sourceValue = "") {
    const numericInput = Number.parseInt(sourceValue, 10) || 0;
    const currentRemainder = numericInput % 1000;
    return (1000 - currentRemainder) % 1000;
}

exports.computeValue = calculateRemainderToNextThousand;

function processInputAndLogResult(rawInputContent) {
    const cleanedContent = rawInputContent.trim();
    const finalCalculatedValue = calculateRemainderToNextThousand(cleanedContent);
    console.log(finalCalculatedValue);
}

const executionModeIdentifier = process.argv[2];
if (executionModeIdentifier !== "test") {
    const fileSystemModule = require("fs");
    const standardInputData = fileSystemModule.readFileSync("/dev/stdin", "utf8");
    processInputAndLogResult(standardInputData);
}
