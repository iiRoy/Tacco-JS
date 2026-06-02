function calculatePrefixSums(numbers) {
    const sums = [];
    let currentAccumulatedSum = 0;
    for (const value of numbers) {
        currentAccumulatedSum += value;
        sums.push(currentAccumulatedSum);
    }
    return sums;
}

function findCeilingIndex(searchArray, searchLimit) {
    if (searchArray.length === 0) {
        return 0;
    }

    let lowerBound = 0;
    let upperBound = searchArray.length; // Exclusive upper bound

    while (lowerBound < upperBound) {
        const midPoint = Math.floor((lowerBound + upperBound) / 2);
        if (searchLimit < searchArray[midPoint]) {
            upperBound = midPoint;
        } else {
            lowerBound = midPoint + 1;
        }
    }
    return lowerBound;
}

function processInput(rawInputData) {
    const inputLines = rawInputData.split('\n');
    const [countA, countB, timeBudget] = inputLines[0].split(' ').map(Number);

    const cumulativeTimesA = calculatePrefixSums(inputLines[1].split(' ').map(Number));
    const cumulativeTimesB = calculatePrefixSums(inputLines[2].split(' ').map(Number));

    const maxBooksFromAOnly = findCeilingIndex(cumulativeTimesA, timeBudget);

    let overallMaxBooksRead = 0;

    for (let currentBooksA = 0; currentBooksA <= maxBooksFromAOnly; currentBooksA++) {
        const timeSpentOnA = currentBooksA === 0 ? 0 : cumulativeTimesA[currentBooksA - 1];
        const remainingTimeForB = timeBudget - timeSpentOnA;

        const maxBooksFromB = findCeilingIndex(cumulativeTimesB, remainingTimeForB);
        
        overallMaxBooksRead = Math.max(overallMaxBooksRead, currentBooksA + maxBooksFromB);
    }

    console.log(overallMaxBooksRead);
}

processInput(require('fs').readFileSync('/dev/stdin', 'utf8').trim());
