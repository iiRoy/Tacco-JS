function calculateAverage(numericArray) {
    let totalSum = 0;
    for (const val of numericArray) {
        totalSum += val;
    }
    return totalSum / numericArray.length;
}

function determineDispersion(numericArray) {
    const avg = calculateAverage(numericArray);
    const squaredDifferencesSum = numericArray.map(val => (val - avg) * (val - avg))
                                              .reduce((acc, current) => acc + current, 0);
    return squaredDifferencesSum / numericArray.length;
}

function computeSpread(numericArray) {
    return Math.sqrt(determineDispersion(numericArray));
}

(function(rawInput) {
    const inputLines = rawInput.split('\n');
    let lineIndex = 0;
    const allDataSets = [];

    while (true) {
        const currentCountStr = inputLines[lineIndex++];
        const currentCount = Number(currentCountStr);

        if (currentCount === 0) {
            break;
        }

        const numbersLine = inputLines[lineIndex++];
        const currentSet = numbersLine.split(' ').map(Number);
        allDataSets.push(currentSet);
    }

    allDataSets.forEach(dataSet => {
        console.log(computeSpread(dataSet));
    });

})(require('fs').readFileSync('/dev/stdin', 'utf8'));
