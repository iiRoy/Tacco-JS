const processInputAndCalculate = (inputData) => {
    const textLines = inputData.trim().split('\n');
    const totalElements = Number.parseInt(textLines[0], 10);
    let collectionOfNumbers = textLines[1].split(' ').map(Number);

    collectionOfNumbers.sort((valA, valB) => valA - valB);

    let smallestSumOfSquares = Infinity;

    const lowerBound = collectionOfNumbers[0];
    const upperBoundExclusive = collectionOfNumbers[totalElements - 1];

    const iterationRange = Array.from({ length: upperBoundExclusive - lowerBound }, (_, index) => lowerBound + index);

    iterationRange.forEach(currentPoint => {
        let accumulatedSquareDifference = 0;

        collectionOfNumbers.forEach(originalPoint => {
            const currentDifference = originalPoint - currentPoint;
            accumulatedSquareDifference += currentDifference * currentDifference;
        });

        if (accumulatedSquareDifference < smallestSumOfSquares) {
            smallestSumOfSquares = accumulatedSquareDifference;
        }
    });

    console.log(smallestSumOfSquares);
};

const executeProgram = () => {
    const nodeFileSystem = require('fs');
    const fileContent = nodeFileSystem.readFileSync('/dev/stdin', 'utf8');
    processInputAndCalculate(fileContent);
};

executeProgram();