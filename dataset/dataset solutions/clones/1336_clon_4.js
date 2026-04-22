const inputContentCollection = require('fs').readFileSync('/dev/stdin', 'utf8');
const initialLineArray = inputContentCollection.split('\n');

const initialStringComponent = initialLineArray.shift();
const operationCountText = initialLineArray.shift();
const numericOperationCount = Number(operationCountText);

const processedInstructions = initialLineArray.slice(0, numericOperationCount).map(entryString => {
    const segmentParts = entryString.split(' ');
    const activityName = segmentParts[0];
    const firstCoordinate = Number(segmentParts[1]);
    const secondCoordinate = Number(segmentParts[2]);
    const supplementaryValue = segmentParts[3];

    const activityIdentifierMap = {
        'print': 'outputSegment',
        'reverse': 'flipInterval',
        'replace': 'substituteBlock'
    };

    return {
        action: activityIdentifierMap[activityName],
        startBound: firstCoordinate,
        endBound: secondCoordinate,
        extraData: supplementaryValue
    };
});

const initialSystemState = {
    characterSequence: initialStringComponent.split(''),
    accumulatedOutputs: []
};

const systemActivityHandlers = {
    outputSegment: (currentSystemState, start, end) => {
        const extractedFragment = currentSystemState.characterSequence.slice(start, end + 1).join('');
        return {
            characterSequence: currentSystemState.characterSequence,
            accumulatedOutputs: [...currentSystemState.accumulatedOutputs, extractedFragment]
        };
    },
    flipInterval: (currentSystemState, start, end) => {
        const precedingPart = currentSystemState.characterSequence.slice(0, start);
        const invertedPart = currentSystemState.characterSequence.slice(start, end + 1).reverse();
        const succeedingPart = currentSystemState.characterSequence.slice(end + 1);
        return {
            characterSequence: [...precedingPart, ...invertedPart, ...succeedingPart],
            accumulatedOutputs: currentSystemState.accumulatedOutputs
        };
    },
    substituteBlock: (currentSystemState, start, end, replacementContent) => {
        const replacementCharacters = replacementContent.split('');
        const precedingPart = currentSystemState.characterSequence.slice(0, start);
        const succeedingPart = currentSystemState.characterSequence.slice(end + 1);
        return {
            characterSequence: [...precedingPart, ...replacementCharacters, ...succeedingPart],
            accumulatedOutputs: currentSystemState.accumulatedOutputs
        };
    }
};

const stateTransformer = (currentAccumulatedState, currentInstruction) => {
    const handlerFunction = systemActivityHandlers[currentInstruction.action];
    if (!handlerFunction) {
        throw new Error(`Unrecognized operation: ${currentInstruction.action}`);
    }
    return handlerFunction(currentAccumulatedState, currentInstruction.startBound, currentInstruction.endBound, currentInstruction.extraData);
};

const finalSystemState = processedInstructions.reduce(stateTransformer, initialSystemState);

console.log(finalSystemState.accumulatedOutputs.join('\n'));