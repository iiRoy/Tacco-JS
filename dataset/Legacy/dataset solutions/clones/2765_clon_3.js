const getModuloResult = (numberValue, divisorValue) => {
    return numberValue % divisorValue;
};

const extractBounds = (inputStringLine) => {
    const partsOfLine = inputStringLine.split(" ");
    const parsedLeft = parseInt(partsOfLine[0], 10);
    const parsedRight = parseInt(partsOfLine[1], 10);
    return { leftBoundary: parsedLeft, rightBoundary: parsedRight };
};

const processInputData = (inputLinesArray) => {
    const TARGET_MODULUS = 2019;
    const { leftBoundary, rightBoundary } = extractBounds(inputLinesArray[0]);

    if (rightBoundary - leftBoundary >= TARGET_MODULUS) {
        console.log(0);
        return;
    }

    const remainderCollection = [];
    let zeroFoundDuringIteration = false;

    for (let currentNum = leftBoundary; currentNum <= rightBoundary; currentNum++) {
        const currentRemainder = getModuloResult(currentNum, TARGET_MODULUS);
        remainderCollection.push(currentRemainder);
        if (currentRemainder === 0) {
            zeroFoundDuringIteration = true;
            break;
        }
    }

    remainderCollection.sort((valA, valB) => valA - valB);

    const calculatedMinimumProduct = remainderCollection[0] * remainderCollection[1];
    console.log(calculatedMinimumProduct);
};

processInputData(require('fs').readFileSync('/dev/stdin', 'UTF-8').trim().split("\n"));
