const acquireSourceMaterial = () => {
    const nativeFileSystem = require('fs');
    return nativeFileSystem.readFileSync('/dev/stdin', 'utf8');
};

const interpretNumericString = (lineOfDigits) => {
    return Array.from(lineOfDigits).map(charUnit => parseInt(charUnit, 10));
};

const deriveNextStage = (currentDataSet) => {
    if (currentDataSet.length === 1) {
        return currentDataSet[0];
    }

    const subsequentDataSet = currentDataSet.slice(0, -1).map((elementA, position) => {
        const elementB = currentDataSet[position + 1];
        return Math.abs(elementA - elementB);
    });

    return deriveNextStage(subsequentDataSet);
};

const manageOperationFlow = (rawTextualInput) => {
    const partitionedText = rawTextualInput.split('\n');
    const numberSequenceLine = partitionedText[1];

    const initialNumberSet = interpretNumericString(numberSequenceLine);

    const finalComputedValue = deriveNextStage(initialNumberSet);

    console.log(finalComputedValue);
};

manageOperationFlow(acquireSourceMaterial());