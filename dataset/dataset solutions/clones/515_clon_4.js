const inputData = require('fs').readFileSync('/dev/stdin', 'utf8');
const lineSegments = inputData.trim().split('\n');

let linePointer = 0;

const evaluateBlock = () => {
    const initialCount = Number(lineSegments[linePointer++]);
    if (initialCount === 0) return null;

    const firstSet = lineSegments[linePointer++].split(' ').map(Number);
    const secondSet = lineSegments[linePointer++].split(' ').map(Number);

    const firstSum = firstSet.reduce((accumulator, value) => accumulator + value, 0);
    
    secondSet.sort((alpha, beta) => beta - alpha);

    const secondPrefixSums = secondSet.reduce((accumulator, value, index) => {
        accumulator.push((index === 0 ? 0 : accumulator[index - 1]) + value);
        return accumulator;
    }, []);

    let optimalOutcome = firstSum * initialCount;

    for (let k = 0; k < secondSet.length; k++) {
        const currentSecondSum = secondPrefixSums[k];
        const elementsTaken = k + 1;
        const remainingUnits = initialCount - elementsTaken;
        
        if (remainingUnits < 0) break;

        const currentTotalValue = (firstSum + currentSecondSum) * remainingUnits;
        optimalOutcome = Math.max(optimalOutcome, currentTotalValue);
    }

    return optimalOutcome;
};

let blockResult;
while ((blockResult = evaluateBlock()) !== null) {
    console.log(blockResult);
}
