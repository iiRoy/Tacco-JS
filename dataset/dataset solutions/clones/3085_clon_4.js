const processRawData = (incomingData) => {
    const dataLines = incomingData.split('\n');

    const [sizeOfRealm, numOperations] = dataLines[0].split(' ').map(Number);

    const initialSquareIdentifiers = [];
    const realmInhabitantsInitialState = dataLines[1].split('').map(charIdentifier => {
        initialSquareIdentifiers.push(charIdentifier);
        return { kind: charIdentifier, quantity: 1 };
    });

    const operationSequence = dataLines.slice(2, 2 + numOperations).map(opLine => {
        const [targetKind, movementDirection] = opLine.split(' ');
        return { targetKind, movementDirection };
    });

    return {
        realmSize: sizeOfRealm,
        operationCount: numOperations,
        originalSquareIdentifiers: initialSquareIdentifiers,
        initialRealmState: realmInhabitantsInitialState,
        operationSequence: operationSequence
    };
};

const CommenceOperation = (incomingData) => {
    const { realmSize, operationCount, originalSquareIdentifiers, initialRealmState, operationSequence } = processRawData(incomingData);

    let realmInhabitantsState = initialRealmState.map(golemState => ({ ...golemState }));
    let currentPopulationCount = realmSize;

    for (let opIdx = 0; opIdx < operationCount; ++opIdx) {
        const { targetKind, movementDirection } = operationSequence[opIdx];

        for (let spatialIndex = 0; spatialIndex < realmSize; ++spatialIndex) {
            if (realmInhabitantsState[spatialIndex].kind === targetKind && realmInhabitantsState[spatialIndex].quantity > 0) {
                const movedQuantity = realmInhabitantsState[spatialIndex].quantity;

                realmInhabitantsState[spatialIndex].quantity = 0;

                const displacement = (movementDirection === 'L' ? -1 : 1);
                const destinationIndex = spatialIndex + displacement;

                if (destinationIndex < 0 || destinationIndex >= realmSize) {
                    currentPopulationCount -= movedQuantity;
                } else {
                    realmInhabitantsState[destinationIndex].kind = originalSquareIdentifiers[destinationIndex];
                    realmInhabitantsState[destinationIndex].quantity += movedQuantity;
                }
            }
        }
    }

    console.log(currentPopulationCount);
};

CommenceOperation(require("fs").readFileSync("/dev/stdin", "utf8"));