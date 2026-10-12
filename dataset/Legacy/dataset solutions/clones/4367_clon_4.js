function processInputData(sourceContent) {
    const contentLines = sourceContent.split('\n');
    const dataLines = contentLines.slice(1);

    const accumulatedValue = dataLines.reduce((currentAccumulator, currentLineSegment) => {
        const numericParts = currentLineSegment.split(' ');
        const firstBoundary = parseInt(numericParts[0], 10);
        const secondBoundary = parseInt(numericParts[1], 10);

        return currentAccumulator + (secondBoundary - firstBoundary + 1);
    }, 0);

    return accumulatedValue;
}

const fileData = require("fs").readFileSync("/dev/stdin", "utf8");
const finalSum = processInputData(fileData);
console.log('%d', finalSum);
