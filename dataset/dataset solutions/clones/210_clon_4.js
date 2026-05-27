const fileSystemModule = require('fs');
const rawInputContent = fileSystemModule.readFileSync(process.stdin.fd, 'utf8');
const inputLines = rawInputContent.trim().split('\n');

processInputData();

function processInputData() {
    const precomputedValues = generatePrecomputedValues();
    inputLines.forEach(line => {
        const numericValue = parseInt(line, 10);
        console.log(precomputedValues[numericValue]);
    });
}

function generatePrecomputedValues() {
    const upperBound = 20000;
    const valueStore = new Int32Array(upperBound + 1);

    const calculateSumOfQuots = (currentNumber) => {
        if (currentNumber < 5) {
            return 0;
        }
        const nextQuotient = Math.floor(currentNumber / 5);
        return nextQuotient + calculateSumOfQuots(nextQuotient);
    };

    for (let currentIdx = 5; currentIdx <= upperBound; currentIdx++) {
        valueStore[currentIdx] = calculateSumOfQuots(currentIdx);
    }
    return valueStore;
}
