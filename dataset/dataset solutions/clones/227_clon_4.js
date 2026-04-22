const topVal = 50000;
let primeCheck = new Array(topVal + 1).fill(true);
primeCheck[0] = primeCheck[1] = false;

for (let current = 2; current * current <= topVal; current++) {
    if (primeCheck[current]) {
        for (let multipleOfPrime = current * current; multipleOfPrime <= topVal; multipleOfPrime += current) {
            primeCheck[multipleOfPrime] = false;
        }
    }
}

const calculatePrimeSums = (targetNumber, checkerArray) => {
    if (targetNumber < 4) return 0;
    let pairCounter = 0;
    for (let firstPrimeCandidate = 2; firstPrimeCandidate <= targetNumber / 2; firstPrimeCandidate++) {
        if (checkerArray[firstPrimeCandidate] && checkerArray[targetNumber - firstPrimeCandidate]) {
            pairCounter++;
        }
    }
    return pairCounter;
};

let incomingData = '';

process.stdin.resume();
process.stdin.setEncoding('utf8');

process.stdin.on('data', function(chunk) {
    incomingData += chunk;
});

process.stdin.on('end', function() {
    const rawLines = incomingData.split('\n').map(str => str.trim());
    const processedNumbers = [];

    for (const line of rawLines) {
        const num = Number.parseInt(line, 10);
        if (Number.isNaN(num)) {
            continue;
        }
        if (num === 0) {
            break;
        }
        processedNumbers.push(num);
    }

    processedNumbers.forEach(queryVal => {
        console.log(calculatePrimeSums(queryVal, primeCheck));
    });
});