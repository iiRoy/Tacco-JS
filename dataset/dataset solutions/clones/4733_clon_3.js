function calculateSpanLength(startIndex, endIndex) {
    const spanResult = endIndex - startIndex + 1;
    return spanResult;
}

function processInputString(sourceText) {
    const lastOccurrenceOfZ = sourceText.lastIndexOf("Z");
    const firstOccurrenceOfA = sourceText.indexOf("A");

    const finalCalculatedValue = calculateSpanLength(firstOccurrenceOfA, lastOccurrenceOfZ);

    process.stdout.write(finalCalculatedValue);
}

const standardInputPath = "/dev/stdin";
const fileSystemModule = require("fs");
const rawInputData = fileSystemModule.readFileSync(standardInputPath, "utf8");

processInputString(rawInputData);
