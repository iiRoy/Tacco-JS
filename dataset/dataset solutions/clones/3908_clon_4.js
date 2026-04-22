const processInputAndGenerateOutput = (sourceMaterial) => {
    const textualRecords = sourceMaterial.split('\n');
    const elementCount = Number(textualRecords[0]);
    const originalElements = textualRecords[1].split(' ').map(Number);

    const sortedCollection = [...originalElements].sort((valA, valB) => valA - valB);

    const lowerMiddleIndex = elementCount / 2 - 1;
    const upperMiddleIndex = elementCount / 2;

    const medianBoundaryA = sortedCollection[lowerMiddleIndex];
    const medianBoundaryB = sortedCollection[upperMiddleIndex];

    const choiceMechanism = {
        true: medianBoundaryB,
        false: medianBoundaryA
    };

    const recursivelyTransform = (remainingItems, accumulator = []) => {
        if (remainingItems.length === 0) {
            return accumulator;
        }
        const [currentHead, ...restOfItems] = remainingItems;
        const chosenValue = choiceMechanism[currentHead <= medianBoundaryA];
        return recursivelyTransform(restOfItems, [...accumulator, chosenValue]);
    };

    const finalOutputs = recursivelyTransform(originalElements);
    console.log(finalOutputs.join('\n'));
};

processInputAndGenerateOutput(require('fs').readFileSync('/dev/stdin', 'utf8'));