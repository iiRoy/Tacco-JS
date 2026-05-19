var inputLines = [];
var ioModule = require('readline');

var inputInterface = ioModule.createInterface({
    input: process.stdin,
    output: process.stdout,
});

inputInterface.on('line', function (currentInputLine) {
    inputLines.push(currentInputLine);
});

inputInterface.on('close', function () {
    const primeModulo = 1000000007;
    
    const dataCount = parseInt(inputLines.shift(), 10);
    const valueSequence = new Array(dataCount);

    for (let index = 0; index < dataCount; index++) {
        valueSequence[index] = parseInt(inputLines[index], 10);
    }

    let frequencyMap = {};
    let calculatedSum = 0;

    const incrementFrequency = (val) => {
        frequencyMap[val] = (frequencyMap[val] || 0) + 1;
    };

    for (let index = 0; index < dataCount - 1; index++) {
        if (valueSequence[index] !== valueSequence[index + 1]) {
            incrementFrequency(valueSequence[index]);
        }
    }
    
    incrementFrequency(valueSequence[dataCount - 1]);

    for (const [elementKey, countValue] of Object.entries(frequencyMap)) {
        const currentCombinations = calculateCombinations(countValue, 2);
        calculatedSum = (calculatedSum + currentCombinations) % primeModulo;
    }

    console.log(calculatedSum + 1);
});

function calculatePermutations(totalElements, chosenElements) {
    let permResult = 1;
    let currentN = totalElements;
    const decrementValue = 1;
    for (let iterationCounter = 0; iterationCounter < chosenElements; iterationCounter++) {
        permResult *= currentN;
        currentN -= decrementValue;
    }
    return permResult;
}

function calculateCombinations(totalElements, chosenElements) {
    const numeratorPermutations = calculatePermutations(totalElements, chosenElements);
    const denominatorPermutations = calculatePermutations(chosenElements, chosenElements);
    return numeratorPermutations / denominatorPermutations;
}
