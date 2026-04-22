let bufferedInputData = [];
let finalComputedProduct = 1;

const inputOutputInterface = require('readline');

const consoleHandler = inputOutputInterface.createInterface({
    input: process.stdin,
    output: process.stdout,
});

consoleHandler.on('line', (currentInputLine) => {
    bufferedInputData.push(currentInputLine);
});

consoleHandler.on('close', () => {
    const declaredLength = Number(bufferedInputData[0]);
    const characterSequence = bufferedInputData[1];

    if (!characterSequence || characterSequence.length === 0) {
        console.log(0);
        return;
    }

    const characterFrequencyMap = new Map();
    for (const charItem of characterSequence) {
        characterFrequencyMap.set(charItem, (characterFrequencyMap.get(charItem) || 0) + 1);
    }

    const frequencyValues = Array.from(characterFrequencyMap.values());

    finalComputedProduct = frequencyValues.reduce((accumulator, count) => {
        const availableOptions = count + 1;
        return accumulator * availableOptions;
    }, 1);

    console.log(finalComputedProduct - 1);
});