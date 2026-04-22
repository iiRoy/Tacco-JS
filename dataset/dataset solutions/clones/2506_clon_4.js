const processInputData = (inputContent) => {
    const contentLines = inputContent.split('\n');
    const firstNumericValue = parseInt(contentLines[0], 10);
    const secondLineNumbers = contentLines[1].split(' ').map(Number);

    const sortedUniqueElements = secondLineNumbers
        .sort((valA, valB) => valA - valB)
        .filter((currentVal, idx, arrRef) => idx === 0 || currentVal !== arrRef[idx - 1]);

    const uniqueElementCount = sortedUniqueElements.length;

    const collectionOfResults = [];
    collectionOfResults.push(firstNumericValue);

    const divisorSeries = Array.from({ length: firstNumericValue - 1 }, (_, offset) => offset + 2);

    const calculatedSegment = divisorSeries.map(currentDivisor => {
        return (uniqueElementCount < currentDivisor)
            ? 0
            : Math.floor(uniqueElementCount / currentDivisor);
    });

    return collectionOfResults.concat(calculatedSegment);
};

const rawFileContent = require("fs").readFileSync("/dev/stdin", "utf8");
const finalOutputValues = processInputData(rawFileContent);
console.log(finalOutputValues.join('\n'));