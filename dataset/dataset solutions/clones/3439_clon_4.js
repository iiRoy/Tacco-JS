function processData(rawData) {
    const parsedLines = rawData.trim().split('\n');
    const quantity = parseInt(parsedLines[0], 10);
    const numberCollection = parsedLines[1].split(' ').map(itemStr => parseInt(itemStr, 10));

    const totalCalculated = numberCollection.reduce((accum, val) => accum + val, 0);

    const targetMean = totalCalculated / quantity;

    let minimumDifferenceFound = Number.MAX_VALUE;
    let resultIndex = -1;

    for (let currentIdx = 0; currentIdx < quantity; ++currentIdx) {
        const currentItemValue = numberCollection[currentIdx];
        const currentDifference = Math.abs(currentItemValue - targetMean);

        if (currentDifference < minimumDifferenceFound) {
            minimumDifferenceFound = currentDifference;
            resultIndex = currentIdx;
        }
    }

    return resultIndex;
}