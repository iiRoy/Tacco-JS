const obtainSourceData = () => require('fs').readFileSync(0, 'utf8').trim().split('\n');

const interpretSpecifications = (linesOfInput) => ({
    gridDimension: Number(linesOfInput[0]),
    swapOperationsCount: Number(linesOfInput[1])
});

const formInitialArrangement = (countValue) => Array.from({ length: countValue }, (_, positionId) => positionId);

const applySinglePermutation = (currentArrangement, firstPointer, secondPointer) => {
    const nextArrangement = [...currentArrangement];
    [nextArrangement[firstPointer], nextArrangement[secondPointer]] = [nextArrangement[secondPointer], nextArrangement[firstPointer]];
    return nextArrangement;
};

const processAllPermutations = (sourceLines) => {
    const { gridDimension, swapOperationsCount } = interpretSpecifications(sourceLines);
    
    let startingArrangement = formInitialArrangement(gridDimension);

    const finalArrangement = sourceLines.slice(2, swapOperationsCount + 2).reduce((accumulatedArrangement, instructionLine) => {
        const [pointOne, pointTwo] = instructionLine.split(',').map(Number);
        const zeroIndexedPointOne = pointOne - 1;
        const zeroIndexedPointTwo = pointTwo - 1;
        
        return applySinglePermutation(accumulatedArrangement, zeroIndexedPointOne, zeroIndexedPointTwo);
    }, startingArrangement);

    finalArrangement.forEach(finalPositionValue => console.log(finalPositionValue + 1));
};

processAllPermutations(obtainSourceData());