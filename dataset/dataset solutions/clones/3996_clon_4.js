function processInputAndCompute(dataString) {
    const numericalValues = dataString.split(/\s+/).map(x => Number(x));
    const limitA = numericalValues[0];
    const limitB = numericalValues[1];

    const generateSequence = (maxVal) => Array.from({ length: maxVal }, (_, idx) => idx + 1);

    const firstSequence = generateSequence(limitA);
    const secondSequence = generateSequence(limitA);

    const combinedPairs = firstSequence.flatMap(valX =>
        secondSequence.map(valY => ({ first: valX, second: valY }))
    );

    const qualifyingPairsCount = combinedPairs.reduce((accumulator, currentPair) => {
        const remainder = currentPair.first % currentPair.second;
        if (remainder >= limitB) {
            return accumulator + 1;
        }
        return accumulator;
    }, 0);

    console.log(qualifyingPairsCount);
}

processInputAndCompute(require('fs').readFileSync('/dev/stdin', 'utf-8'));