const processInputData = (incomingText) => {
    const numericComponents = incomingText.trim().split(' ').map(Number);
    const spanWidth = numericComponents[0];
    const focalPoint = numericComponents[1];

    const rangeOffset = spanWidth - 1;

    const startingBoundary = focalPoint - rangeOffset;
    const finalBoundary = focalPoint + rangeOffset;
    const sequenceLength = finalBoundary - startingBoundary + 1;

    const valueSequence = Array.from({ length: sequenceLength }, (_, indexPosition) => {
        return startingBoundary + indexPosition;
    });

    const outputRepresentation = valueSequence.join(' ');

    process.stdout.write(outputRepresentation + '\n');
};

const fileSystemHandler = require('node:fs');
processInputData(fileSystemHandler.readFileSync('/dev/stdin', 'utf8'));