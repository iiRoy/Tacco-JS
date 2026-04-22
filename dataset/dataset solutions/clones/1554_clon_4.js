const inputProcessor = (inputLineSegments) => {
    const numericalSequence = inputLineSegments[1].split(' ').map(Number);
    const moduloConstant = Math.pow(10, 9) + 7;

    const suffixSumRegistry = new Array(numericalSequence.length);
    let currentCumulativeSum = 0;

    for (let k = numericalSequence.length - 1; k >= 0; k--) {
        currentCumulativeSum = (currentCumulativeSum + numericalSequence[k]) % moduloConstant;
        suffixSumRegistry[k] = currentCumulativeSum;
    }

    const finalComputation = numericalSequence.slice(0, -1).reduce((totalAccumulation, currentElement, currentIndex) => {
        const correspondingSuffixSum = suffixSumRegistry[currentIndex + 1];
        const productTerm = (currentElement * correspondingSuffixSum) % moduloConstant;
        return (totalAccumulation + productTerm) % moduloConstant;
    }, 0);

    console.log(finalComputation);
};

let collectedInputString = '';

process.stdin.on('data', (chunk) => {
    collectedInputString += chunk;
});

process.stdin.on('end', () => {
    const { EOL: lineSeparator } = require('os');
    const lineSegments = collectedInputString.split(lineSeparator);
    inputProcessor(lineSegments);
});