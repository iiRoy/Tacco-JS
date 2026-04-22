let fullInput = '';
process.stdin.on('data', inputChunk => {
    fullInput += inputChunk.toString();
});

process.stdin.on('end', () => {
    const dataLines = fullInput.trim().split('\n');
    let dataPointer = 0;

    const extractNextPair = (lineIndex) => {
        const segments = dataLines[lineIndex].split(' ').map(Number);
        return { countValue: segments[0], limitValue: segments[1] };
    };

    const determineExceedingPairs = (numericCollection, boundaryValue) => {
        const orderedCollection = [...numericCollection].sort((valA, valB) => valA - valB);
        let totalExceedingCount = 0;

        for (let primaryIndex = 0; primaryIndex < orderedCollection.length; primaryIndex++) {
            const primaryElement = orderedCollection[primaryIndex];
            let lowerBound = primaryIndex + 1;
            let upperBound = orderedCollection.length - 1;
            let firstSuitableIndex = orderedCollection.length;

            while (lowerBound <= upperBound) {
                const middleIndex = Math.floor((lowerBound + upperBound) / 2);
                if (primaryElement + orderedCollection[middleIndex] > boundaryValue) {
                    firstSuitableIndex = middleIndex;
                    upperBound = middleIndex - 1;
                } else {
                    lowerBound = middleIndex + 1;
                }
            }
            totalExceedingCount += (orderedCollection.length - firstSuitableIndex);
        }
        return totalExceedingCount;
    };

    while (true) {
        const configuration = extractNextPair(dataPointer++);
        const elementQuantity = configuration.countValue;
        const sumBoundary = configuration.limitValue;

        if (elementQuantity === 0 && sumBoundary === 0) {
            break;
        }

        const currentNumbers = [];
        for (let iteration = 0; iteration < elementQuantity; iteration++) {
            currentNumbers.push(Number(dataLines[dataPointer++]));
        }

        const calculatedOutcome = determineExceedingPairs(currentNumbers, sumBoundary);
        process.stdout.write(calculatedOutcome + '\n');
    }
});