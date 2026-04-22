let receivedRawInput = '';
process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', (segment) => {
    receivedRawInput += segment;
});
process.stdin.on('end', () => {
    initiateScenarioProcessing(receivedRawInput.split('\n'));
});

const vectorMap = {
    'N': { horizontalShift: 0, verticalShift: 1 },
    'S': { horizontalShift: 0, verticalShift: -1 },
    'E': { horizontalShift: 1, verticalShift: 0 },
    'W': { horizontalShift: -1, verticalShift: 0 }
};

function initiateScenarioProcessing(allInputLines) {
    let currentLineIndex = 0;

    const processNextDataBatch = () => {
        const gemCountDescriptor = allInputLines[currentLineIndex];
        if (!gemCountDescriptor || parseInt(gemCountDescriptor, 10) === 0) {
            return; 
        }

        const currentGemQuantity = parseInt(gemCountDescriptor, 10);
        currentLineIndex++;

        const gemCoordinatesCollection = new Set(); 
        for (let i = 0; i < currentGemQuantity; i++) {
            const coords = allInputLines[currentLineIndex].split(' ').map(Number);
            gemCoordinatesCollection.add(`${coords[0]},${coords[1]}`);
            currentLineIndex++;
        }

        const moveCountDescriptor = allInputLines[currentLineIndex];
        const currentMoveQuantity = parseInt(moveCountDescriptor, 10);
        currentLineIndex++;

        const movementCommandList = [];
        for (let i = 0; i < currentMoveQuantity; i++) {
            const commandParts = allInputLines[currentLineIndex].split(' ');
            movementCommandList.push({ directionIndicator: commandParts[0], travelDistance: parseInt(commandParts[1], 10) });
            currentLineIndex++;
        }

        const result = evaluateAllGemPickup(gemCoordinatesCollection, movementCommandList);
        console.log(result ? 'Yes' : 'No');

        processNextDataBatch(); 
    };

    processNextDataBatch(); 
}

function evaluateAllGemPickup(initialGemSet, sequenceOfCommands) {
    const startingState = {
        robotXCoordinate: 10,
        robotYCoordinate: 10,
        remainingGemCoordinates: new Set(initialGemSet)
    };

    const finalResultingState = sequenceOfCommands.reduce((currentStateAccumulator, currentCommand) => {
        let { robotXCoordinate, robotYCoordinate, remainingGemCoordinates } = currentStateAccumulator;
        const { directionIndicator, travelDistance } = currentCommand;
        const { horizontalShift, verticalShift } = vectorMap[directionIndicator];

        for (let stepIterator = 0; stepIterator < travelDistance; stepIterator++) {
            robotXCoordinate += horizontalShift;
            robotYCoordinate += verticalShift;
            const currentCoordinateString = `${robotXCoordinate},${robotYCoordinate}`;
            
            if (remainingGemCoordinates.has(currentCoordinateString)) {
                const updatedGemSet = new Set(remainingGemCoordinates);
                updatedGemSet.delete(currentCoordinateString);
                remainingGemCoordinates = updatedGemSet;
            }
        }
        return { robotXCoordinate, robotYCoordinate, remainingGemCoordinates };
    }, startingState);

    return finalResultingState.remainingGemCoordinates.size === 0;
}