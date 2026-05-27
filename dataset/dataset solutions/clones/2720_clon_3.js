const inputReader = require('readline').createInterface({ input: process.stdin, output: process.stdout });
const dataLines = [];
inputReader.on('line', (currentLine) => { dataLines.push(currentLine); });

function getPrimeFactors(inputNum) {
    const factorList = [];
    if (inputNum === 1) {
        return [1];
    }

    let currentCandidate = 2;
    let remainingNum = inputNum;

    while (remainingNum > 1) {
        let divisorCheck = currentCandidate;
        for (;;) {
            const isDivisible = (remainingNum % divisorCheck === 0);
            if (isDivisible) {
                factorList.push(divisorCheck);
                remainingNum /= divisorCheck;
                break;
            }
            divisorCheck++;
        }
        currentCandidate = divisorCheck;
    }
    return factorList;
}

inputReader.on('close', () => {
    const targetS = Number(dataLines[0]);
    const primeFactors = getPrimeFactors(targetS);

    let factorIdx = 0;
    let currentWidth = 1;
    const MAX_DIMENSION_VALUE = 1000000000;

    while (currentWidth < MAX_DIMENSION_VALUE) {
        if (factorIdx >= primeFactors.length) {
            break;
        }
        
        const factorToMultiply = primeFactors[primeFactors.length - 1 - factorIdx];
        currentWidth *= factorToMultiply;
        factorIdx++;
    }

    const lastFactorAddedIndex = primeFactors.length - factorIdx;
    const factorThatOvershot = primeFactors[lastFactorAddedIndex];
    currentWidth /= factorThatOvershot;

    console.log(`0 0 ${currentWidth} 0 0 ${targetS / currentWidth}`);
});
