const fs = require('fs');

const acquireSourceData = (sourcePath) => {
    const rawContent = fs.readFileSync(sourcePath, 'utf8');
    return rawContent.trim().split('\n');
};

const compileGroupedValues = (dataLines) => {
    return dataLines.reduce((collectionMap, currentLineSegment) => {
        const [keyIdentifier, valueString] = currentLineSegment.split(' ');
        const numericalValue = Number(valueString);

        if (!collectionMap.has(keyIdentifier)) {
            collectionMap.set(keyIdentifier, []);
        }
        collectionMap.get(keyIdentifier).push(numericalValue);
        return collectionMap;
    }, new Map());
};

const renderFormattedResult = (processedCollection) => {
    const orderedKeys = Array.from(processedCollection.keys()).sort();

    const resultSegments = orderedKeys.flatMap(currentKeyItem => {
        const sortedNumericList = processedCollection.get(currentKeyItem).sort((valA, valB) => valA - valB);
        const joinedValueString = sortedNumericList.join(' ');
        return [currentKeyItem, joinedValueString];
    });

    return resultSegments.join('\n');
};

const executeProcessing = () => {
    const initialLines = acquireSourceData('/dev/stdin');
    const groupedDataMap = compileGroupedValues(initialLines);
    const finalOutputString = renderFormattedResult(groupedDataMap);
    console.log(finalOutputString);
};

executeProcessing();
