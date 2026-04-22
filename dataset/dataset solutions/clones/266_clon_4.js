const fileSystemOperations = require("fs");
const sourceContent = fileSystemOperations.readFileSync("/dev/stdin", "utf8");
const numericalSegments = sourceContent.split(/\s/).filter(Boolean).map(Number);

function processNumericSequence(dataset, currentPoint) {
    if (currentPoint + 1 >= dataset.length) {
        return;
    }

    const firstQuantity = dataset[currentPoint];
    const secondQuantity = dataset[currentPoint + 1];

    if (firstQuantity === 0 || secondQuantity === 0) {
        return;
    }

    const squareOfFirst = Math.pow(firstQuantity, 2);
    const intermediateValue = firstQuantity * Math.hypot(2 * secondQuantity, firstQuantity);
    const finalProduct = intermediateValue + squareOfFirst;

    console.log(finalProduct);

    processNumericSequence(dataset, currentPoint + 2);
}

processNumericSequence(numericalSegments, 0);