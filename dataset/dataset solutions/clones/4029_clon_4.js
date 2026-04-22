function inputProcessor(rawText) {
    const dataLines = rawText.trim().split('\n');
    let currentPosition = 0;

    function getNumericalMatrices(itemCount) {
        if (currentPosition + itemCount > dataLines.length) {
            throw new Error("Insufficient data lines available.");
        }
        const selectedSegments = dataLines.slice(currentPosition, currentPosition + itemCount);
        currentPosition += itemCount;

        return selectedSegments.map(segment => segment.split(' ').map(Number));
    }

    return {
        acquireNumericalBlocks: getNumericalMatrices,
    };
}

function checkVectorAlignment(referencePoint, targetPoint) {
    const primaryShift = targetPoint[0] - referencePoint[0];
    
    return (targetPoint[1] - referencePoint[1] === primaryShift) &&
           (targetPoint[2] - referencePoint[2] === primaryShift);
}

function evaluateTransformation(dataSet) {
    const baseVector = dataSet[0];
    const firstComparisonVector = dataSet[1];
    const secondComparisonVector = dataSet[2];

    const firstValidation = checkVectorAlignment(baseVector, firstComparisonVector);
    if (!firstValidation) {
        return "No";
    }

    const secondValidation = checkVectorAlignment(baseVector, secondComparisonVector);
    if (!secondValidation) {
        return "No";
    }

    return "Yes";
}

const sourceContent = require("fs").readFileSync("/dev/stdin", "utf8");
const dataProvider = inputProcessor(sourceContent);
const collectedMatrices = dataProvider.acquireNumericalBlocks(3);

console.log(evaluateTransformation(collectedMatrices));