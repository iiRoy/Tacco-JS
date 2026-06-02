const fileSystem = require('fs');

const rawData = fileSystem.readFileSync('/dev/stdin', 'utf8').trim();
const processedEntries = rawData.split('\n');

while (processedEntries.length > 1) {
    const [totalUnits, completionTarget] = processedEntries.shift().trim().split(' ').map(Number);

    const initialAccumulations = Array(totalUnits).fill(0);
    const initialSimulationState = {
        currentPosition: 0,
        availableResourceUnits: completionTarget,
        unitProgressValues: initialAccumulations
    };

    const advanceSimulation = (currentState, targetValue, unitCountLimit) => {
        const { currentPosition, availableResourceUnits, unitProgressValues } = currentState;

        if (unitProgressValues[currentPosition] === targetValue) {
            return currentPosition;
        }

        const nextProgressValues = [...unitProgressValues];
        let nextResourceUnits;
        let nextPosition = (currentPosition + 1) % unitCountLimit;

        if (availableResourceUnits > 0) {
            nextProgressValues[currentPosition]++;
            nextResourceUnits = availableResourceUnits - 1;
        } else {
            nextResourceUnits = unitProgressValues[currentPosition];
            nextProgressValues[currentPosition] = 0;
        }

        const nextSimulationState = {
            currentPosition: nextPosition,
            availableResourceUnits: nextResourceUnits,
            unitProgressValues: nextProgressValues
        };

        return advanceSimulation(nextSimulationState, targetValue, unitCountLimit);
    };

    console.log(advanceSimulation(initialSimulationState, completionTarget, totalUnits));
}
