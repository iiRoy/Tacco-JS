let collectedInput = '';

process.stdin.on('data', (pieceOfData) => {
    collectedInput += pieceOfData;
});

process.stdin.on('end', () => {
    const allLines = collectedInput.trim().split('\n');
    const computedOutcomes = [];

    const processSequenceRecursively = (sequenceElements, currentPositionInSequence) => {
        if (currentPositionInSequence >= sequenceElements.length) {
            return;
        }

        const currentElement = sequenceElements[currentPositionInSequence];
        if (currentElement === "0 0") {
            return;
        }

        const parsedValues = currentElement.split(' ').map(Number);
        const totalSpots = parsedValues[0];
        const stepsToSkip = parsedValues[1];

        const initialConfiguration = {
            openSpots: new Set(Array.from({ length: totalSpots }, (_, indexValue) => indexValue)),
            lastAssignedIndex: 0
        };

        const determineNextOccupant = (startingPoint, remainingJumps, currentOpenSet, maximumSpots) => {
            const candidatePoint = (startingPoint + 1) % maximumSpots;
            if (currentOpenSet.has(candidatePoint)) {
                if (remainingJumps === 1) {
                    return candidatePoint;
                } else {
                    return determineNextOccupant(candidatePoint, remainingJumps - 1, currentOpenSet, maximumSpots);
                }
            } else {
                return determineNextOccupant(candidatePoint, remainingJumps, currentOpenSet, maximumSpots);
            }
        };

        const finalArrangement = Array.from({ length: totalSpots }).reduce((currentArrangement, _, passNumber) => {
            const chosenSpot = determineNextOccupant(currentArrangement.lastAssignedIndex, stepsToSkip, currentArrangement.openSpots, totalSpots);
            
            const updatedOpenSet = new Set(currentArrangement.openSpots);
            updatedOpenSet.delete(chosenSpot);

            return {
                openSpots: updatedOpenSet,
                lastAssignedIndex: chosenSpot
            };
        }, initialConfiguration);

        computedOutcomes.push(finalArrangement.lastAssignedIndex);
        
        processSequenceRecursively(sequenceElements, currentPositionInSequence + 1);
    };

    processSequenceRecursively(allLines, 0);

    computedOutcomes.forEach(resultValue => console.log(resultValue));
});