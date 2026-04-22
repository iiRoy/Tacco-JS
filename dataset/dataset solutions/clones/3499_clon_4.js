const inputLines = [];
const dataStreamProcessor = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});

dataStreamProcessor.on('line', (incomingData) => {
    inputLines.push(incomingData);
});

dataStreamProcessor.on('close', () => {
    processInputValues(inputLines);
});

function retrievePrimeFactors(numericalValue) {
    if (numericalValue <= 1) {
        return [];
    }
    let remainingValue = numericalValue;
    const uniquePrimeDivisors = new Set();
    let potentialDivisor = 2;
    while (potentialDivisor * potentialDivisor <= remainingValue) {
        if (remainingValue % potentialDivisor === 0) {
            uniquePrimeDivisors.add(potentialDivisor);
            while (remainingValue % potentialDivisor === 0) {
                remainingValue /= potentialDivisor;
            }
        }
        potentialDivisor++;
    }
    if (remainingValue > 1) {
        uniquePrimeDivisors.add(remainingValue);
    }
    return Array.from(uniquePrimeDivisors);
}

function processInputValues(receivedLines) {
    const parsedNumbers = receivedLines[0].split(' ').map(Number);
    const valueA = parsedNumbers[0];
    const valueB = parsedNumbers[1];

    if (valueB % valueA === 0) {
        console.log(valueB / valueA);
    } else {
        const allPrimeDivisors = retrievePrimeFactors(valueB);
        const eligibleDivisors = allPrimeDivisors.filter(
            (divisorCandidate) => divisorCandidate >= valueA
        );

        if (eligibleDivisors.length > 0) {
            const smallestEligible = eligibleDivisors.reduce(
                (currentMinimum, element) => (element < currentMinimum ? element : currentMinimum),
                eligibleDivisors[0]
            );
            console.log(valueB / smallestEligible);
        } else {
            console.log(1);
        }
    }
}