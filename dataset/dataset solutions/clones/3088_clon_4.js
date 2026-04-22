const environmentReader = require("fs");
const sourcePath = "/dev/stdin";
const encoding = "utf8";

const advanceGridState = (priorConfiguration, characterMap, extent, instructionChar, instructionMove) => {
    const specificMovements = priorConfiguration.flatMap((individualCount, currentPosition) => {
        if (individualCount === 0) {
            return [];
        }

        const mapCharacter = characterMap[currentPosition];

        if (mapCharacter === instructionChar) {
            if (instructionMove === 'L') {
                return (currentPosition > 0) ? [{ targetPosition: currentPosition - 1, amount: individualCount }] : [];
            } else {
                return (currentPosition < extent - 1) ? [{ targetPosition: currentPosition + 1, amount: individualCount }] : [];
            }
        } else {
            return [{ targetPosition: currentPosition, amount: individualCount }];
        }
    });

    const nextConfiguration = Array.from({ length: extent }, () => 0);
    specificMovements.forEach(({ targetPosition, amount }) => {
        nextConfiguration[targetPosition] += amount;
    });

    return nextConfiguration;
};


const simulateCreatureDynamics = (inputData) => {
    const lineSegments = inputData.split('\n');

    const [dimensionInfo] = lineSegments;
    const gridSize = parseInt(dimensionInfo.split(' ')[0], 10);

    const characterLayout = lineSegments[1];

    const initialPopulationState = Array.from({ length: gridSize }, () => 1);

    const evolutionCommands = lineSegments.slice(2);

    const finalPopulationState = evolutionCommands.reduce((currentGridState, commandText) => {
        const triggerChar = commandText[0];
        const motionDirection = commandText[2];

        return advanceGridState(currentGridState, characterLayout, gridSize, triggerChar, motionDirection);
    }, initialPopulationState);

    const finalPopulationSum = finalPopulationState.reduce((total, count) => total + count, 0);

    console.log(finalPopulationSum);
};

simulateCreatureDynamics(environmentReader.readFileSync(sourcePath, encoding));