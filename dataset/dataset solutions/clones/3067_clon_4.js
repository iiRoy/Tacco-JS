const calculateModifier = (value) => {
    const remainderValue = value % 10;
    return (remainderValue === 0) ? 10 : remainderValue;
};

const aggregateSummation = (entries, currentPosition, runningTotal) => {
    if (currentPosition >= entries.length) {
        return runningTotal;
    }

    const currentEntry = entries[currentPosition];
    let amountToAdd;

    if (currentPosition === 0) {
        amountToAdd = currentEntry.initialValue;
    } else {
        amountToAdd = currentEntry.initialValue + (10 - (currentEntry.initialValue % 10)) % 10;
    }

    return aggregateSummation(entries, currentPosition + 1, runningTotal + amountToAdd);
};

const processAndCompute = (inputDataString) => {
    const dataLines = inputDataString.split('\n');
    const transformedItems = dataLines.map(lineContent => {
                                       const numericRepresentation = Number(lineContent);
                                       return {
                                           initialValue: numericRepresentation,
                                           sortingKey: calculateModifier(numericRepresentation)
                                       };
                                   });

    transformedItems.sort((elementA, elementB) => elementA.sortingKey - elementB.sortingKey);

    const finalAccumulation = aggregateSummation(transformedItems, 0, 0);

    console.log(finalAccumulation);
};

processAndCompute(require('fs').readFileSync('/dev/stdin', 'utf8'));