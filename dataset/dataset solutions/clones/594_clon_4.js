const obtainSource = (sourcePath) => require('node:fs').readFileSync(sourcePath, 'utf8');

const processRawData = (rawData) => {
    const cleansed = rawData.trim();
    const segments = cleansed.split('\n');
    return segments;
};

const extractConfigAndData = (dataLines) => {
    const configLine = dataLines[0].split(' ').map(Number);
    const totalDimensions = configLine[0];
    const instructionCount = configLine[1];

    const elementSet = dataLines.slice(1, totalDimensions).map(Number);
    const movementSet = dataLines.slice(totalDimensions, totalDimensions + instructionCount).map(Number);

    return { elementSet, movementSet };
};

const computeTraversal = (stepsToTake) => {
    const initialState = { currentPosition: 0, accumulatedPathIndices: [] };

    const finalState = stepsToTake.reduce((previousState, singleStepInstruction) => {
        const directionIndicator = singleStepInstruction > 0 ? 1 : -1;
        const numberOfRepetitions = Math.abs(singleStepInstruction);

        const stepResults = Array.from({ length: numberOfRepetitions }).reduce((interimState) => {
            let nextPos = interimState.currentPosition;
            let currentIndices = [...interimState.pathIndices];

            if (directionIndicator === 1) {
                currentIndices.push(nextPos);
                nextPos++;
            } else {
                nextPos--;
                currentIndices.push(nextPos);
            }
            return { currentPosition: nextPos, pathIndices: currentIndices };
        }, { currentPosition: previousState.currentPosition, pathIndices: [] });

        return {
            currentPosition: stepResults.currentPosition,
            accumulatedPathIndices: previousState.accumulatedPathIndices.concat(stepResults.pathIndices)
        };
    }, initialState);

    return finalState.accumulatedPathIndices;
};

const calculateFinalSum = (indices, values) => {
    return indices.reduce((total, idx) => total + values[idx], 0);
};

const rawInputContent = obtainSource('/dev/stdin');
const processedLines = processRawData(rawInputContent);
const { elementSet, movementSet } = extractConfigAndData(processedLines);

const allVisitedIndices = computeTraversal(movementSet);
const finalOutcome = calculateFinalSum(allVisitedIndices, elementSet);

console.log(finalOutcome);