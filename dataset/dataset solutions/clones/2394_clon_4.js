const findMinimumExclusion = (collectionOfNumbers) => {
    let currentCandidate = 1;
    while (collectionOfNumbers.has(currentCandidate)) {
        currentCandidate++;
    }
    return currentCandidate;
};

const processConnectionAssignments = (rawDataSource) => {
    const dataChunks = rawDataSource.trim().split("\n");
    const connectionCount = Number(dataChunks[0]);
    const relationshipDescriptions = dataChunks.slice(1, connectionCount);

    const startingConfiguration = {
        maximumAssignedValue: 0,
        nodeValueRegister: new Map(),
        assignedValueSequence: []
    };

    const finalConfiguration = relationshipDescriptions.reduce((currentConfig, descriptionLine) => {
        const [firstIdentifierStr, secondIdentifierStr] = descriptionLine.split(" ");
        const firstIdentifier = Number(firstIdentifierStr);
        const secondIdentifier = Number(secondIdentifierStr);

        const existingFirstValues = currentConfig.nodeValueRegister.get(firstIdentifier) || new Set();
        const existingSecondValues = currentConfig.nodeValueRegister.get(secondIdentifier) || new Set();

        const combinedExistingValues = new Set([...existingFirstValues, ...existingSecondValues]);

        const nextAvailableValue = findMinimumExclusion(combinedExistingValues);

        const updatedNodeRegister = new Map(currentConfig.nodeValueRegister);
        
        const newFirstValues = new Set(existingFirstValues);
        newFirstValues.add(nextAvailableValue);
        updatedNodeRegister.set(firstIdentifier, newFirstValues);

        const newSecondValues = new Set(existingSecondValues);
        newSecondValues.add(nextAvailableValue);
        updatedNodeRegister.set(secondIdentifier, newSecondValues);

        return {
            maximumAssignedValue: Math.max(currentConfig.maximumAssignedValue, nextAvailableValue),
            nodeValueRegister: updatedNodeRegister,
            assignedValueSequence: [...currentConfig.assignedValueSequence, nextAvailableValue]
        };
    }, startingConfiguration);

    console.log(finalConfiguration.maximumAssignedValue);
    finalConfiguration.assignedValueSequence.forEach(value => console.log(value));
};

processConnectionAssignments(require('fs').readFileSync('/dev/stdin', 'utf8'));