const inputReader = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});

const requests = [];

inputReader.on('line', (currentLine) => {
    const numericValue = parseInt(currentLine, 10);
    if (!isNaN(numericValue) && numericValue >= 0) {
        requests.push(numericValue);
    } else {
        inputReader.close();
    }
});

inputReader.on('close', () => {
    processRequests(requests);
});

function processRequests(queryNumbers) {
    const sumTally = computePrimeSumCounts();

    queryNumbers.forEach(num => {
        console.log(sumTally[num]);
    });
}

function computePrimeSumCounts() {
    const maximumValue = 50000;
    const isComposite = new Uint8Array(maximumValue + 1);

    isComposite[0] = 1;
    isComposite[1] = 1;

    for (let currentNum = 2; currentNum * currentNum <= maximumValue; ++currentNum) {
        if (isComposite[currentNum] === 0) {
            for (let multiple = currentNum * currentNum; multiple <= maximumValue; multiple += currentNum) {
                isComposite[multiple] = 1;
            }
        }
    }

    const foundPrimes = [];
    for (let num = 2; num <= maximumValue; ++num) {
        if (isComposite[num] === 0) {
            foundPrimes.push(num);
        }
    }

    const pairSums = new Uint16Array(maximumValue + 1);

    for (let idx1 = 0; idx1 < foundPrimes.length; ++idx1) {
        const prime1 = foundPrimes[idx1];
        for (let idx2 = idx1; idx2 < foundPrimes.length; ++idx2) {
            const prime2 = foundPrimes[idx2];
            const currentSum = prime1 + prime2;

            if (currentSum > maximumValue) {
                break;
            }
            pairSums[currentSum]++;
        }
    }

    return pairSums;
}