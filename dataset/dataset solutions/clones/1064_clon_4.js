function processInputAndCompute(inputDataString) {
    const parsedLines = inputDataString.trim().split('\n');
    const elementCount = Number(parsedLines.shift());
    const originalNumbers = parsedLines.shift().split(' ').map(Number);

    const totalInversions = calculateInversionsWithFenwick(originalNumbers, elementCount);

    console.log(totalInversions);
}

function calculateInversionsWithFenwick(dataCollection, collectionLength) {
    const uniqueValues = [...new Set(dataCollection)].sort((a, b) => a - b);
    const valueRankMap = new Map();
    uniqueValues.forEach((val, index) => valueRankMap.set(val, index + 1));
    const maxRank = uniqueValues.length;

    const rankedCollection = dataCollection.map(val => valueRankMap.get(val));

    const bitStorage = new Array(maxRank + 1).fill(0);

    const updateBit = (rankIndex, deltaValue) => {
        while (rankIndex <= maxRank) {
            bitStorage[rankIndex] += deltaValue;
            rankIndex += rankIndex & (-rankIndex);
        }
    };

    const queryBit = (rankIndex) => {
        let sumResult = 0;
        while (rankIndex > 0) {
            sumResult += bitStorage[rankIndex];
            rankIndex -= rankIndex & (-rankIndex);
        }
        return sumResult;
    };

    let inversionCounter = 0;
    for (let currentElementIndex = 0; currentElementIndex < collectionLength; currentElementIndex++) {
        const currentRank = rankedCollection[currentElementIndex];
        inversionCounter += queryBit(maxRank) - queryBit(currentRank);
        updateBit(currentRank, 1);
    }

    return inversionCounter;
}

processInputAndCompute(require('fs').readFileSync('/dev/stdin', 'utf8'));
