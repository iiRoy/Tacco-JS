const acquireSourceContent = () => {
    return require('fs').readFileSync('/dev/stdin', 'utf8');
};

const processRawData = (sourceString) => {
    const segmentedData = sourceString.trim().split('\n');
    const recordsCount = Number(segmentedData.shift());
    
    const pertinentEntries = segmentedData.slice(0, recordsCount);

    const dataCollection = pertinentEntries.reduce((registry, currentRecord) => {
        const parts = currentRecord.split(' ');
        const itemKey = parts[0];
        const itemValue = Number(parts[1]);

        registry.set(itemKey, (registry.get(itemKey) || 0) + itemValue);
        return registry;
    }, new Map());

    return dataCollection;
};

const generateFormattedOutput = (processedCollection) => {
    const orderedKeys = [...processedCollection.keys()].sort();
    
    const outputLines = orderedKeys.map(key => 
        `${key} ${processedCollection.get(key)}`
    );
    
    return outputLines.join('\n');
};

const sourceText = acquireSourceContent();
const aggregatedValues = processRawData(sourceText);
const finalResult = generateFormattedOutput(aggregatedValues);
console.log(finalResult);