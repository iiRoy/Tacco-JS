var input = `4
141421356 17320508 22360679 244949`;

const modVal = 1000000007;

function modProduct(valA, valB) {
    return Number((BigInt(valA) * BigInt(valB)) % BigInt(modVal));
}

const inputSegments = input.split('\n');
const elementCount = Number(inputSegments[0]);
const dataElements = inputSegments[1].split(' ').map(Number);

const initialAccumulator = {
    currentPrefixSum: (elementCount > 0 ? dataElements[0] : 0) % modVal,
    finalResult: 0
};

const calculationResult = dataElements.slice(1).reduce((acc, currentElement) => {
    const term = modProduct(acc.currentPrefixSum, currentElement);
    acc.finalResult = (acc.finalResult + term) % modVal;
    acc.currentPrefixSum = (acc.currentPrefixSum + currentElement) % modVal;
    return acc;
}, initialAccumulator);

console.log(calculationResult.finalResult);
