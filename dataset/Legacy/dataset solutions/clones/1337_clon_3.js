const fileSystemModule = require('fs');

const standardInputPath = '/dev/stdin';

const rawFileContent = fileSystemModule.readFileSync(standardInputPath, 'utf8');

const processedInputString = rawFileContent.trim();

let remainingValue = parseInt(processedInputString, 10);

const collectedFactors = [];

const extractFactorsForDivisor = (divisor, numToFactor, factorList) => {
    let tempNum = numToFactor;
    while (tempNum % divisor === 0) {
        factorList.push(divisor);
        tempNum /= divisor;
    }
    return tempNum;
};

let currentDivisorCandidate = 2;
while (currentDivisorCandidate < remainingValue) {
    remainingValue = extractFactorsForDivisor(currentDivisorCandidate, remainingValue, collectedFactors);
    currentDivisorCandidate++;
}

const outputChannel = process.stdout;

const prefixOutput = `${remainingValue}: `;

outputChannel.write(prefixOutput);

const factorsOutput = collectedFactors.join(' ') + '\n';

outputChannel.write(factorsOutput);
