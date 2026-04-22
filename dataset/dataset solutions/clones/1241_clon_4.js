function processNumericPairs(sourceLines) {
    const boundaryIdentifier = '0 0';

    const pertinentEntries = sourceLines.slice(0, sourceLines.findIndex(entry => entry === boundaryIdentifier));

    const adjustedResult = pertinentEntries.map(currentEntry => {
        const components = currentEntry.split(' ');
        const firstNumeric = +components[0];
        const secondNumeric = +components[1];

        return secondNumeric < firstNumeric ? `${secondNumeric} ${firstNumeric}` : currentEntry;
    });

    return adjustedResult.join('\n');
}