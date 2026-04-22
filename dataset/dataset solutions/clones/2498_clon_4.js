function processInputData(rawDataContent) {
    const dataLines = rawDataContent.split('\n');
    const collectionSize = Number(dataLines[0]);
    const numberCollection = dataLines[1]
        .split(/\s+/)
        .filter(segment => segment !== '')
        .map(numString => Number(numString));

    numberCollection.sort((valA, valB) => valB - valA);

    let totalAccumulator = 0;

    for (let currentPrimary = 0; currentPrimary < collectionSize - 2; currentPrimary++) {
        let currentSecondary = currentPrimary + 1;
        let currentTertiary = collectionSize - 1;

        while (currentSecondary < currentTertiary) {
            if (numberCollection[currentPrimary] < numberCollection[currentSecondary] + numberCollection[currentTertiary]) {
                totalAccumulator += (currentTertiary - currentSecondary);
                currentSecondary++;
            } else {
                currentTertiary--;
            }
        }
    }
    console.log(totalAccumulator);
}

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));