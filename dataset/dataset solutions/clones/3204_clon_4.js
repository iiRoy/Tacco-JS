function processInputData(inputString) {
    const numericValues = inputString.trim().split(/[\n\s]/).map(valStr => {
        const currentVal = Number(valStr);
        if (currentVal < 1 || currentVal > 4) {
            throw new TypeError("Cannot set properties of undefined (setting '0')");
        }
        return currentVal;
    });

    const frequencyMap = numericValues.reduce((accumulator, currentNumber) => {
        accumulator.set(currentNumber, (accumulator.get(currentNumber) || 0) + 1);
        return accumulator;
    }, new Map());

    const sortedFrequencies = Array.from(frequencyMap.values()).sort((a, b) => a - b);

    let finalDecision = false;
    if (sortedFrequencies.length === 4) {
        const frequencyAnalysis = sortedFrequencies.reduce((acc, freq) => {
            if (freq === 1) acc.ones++;
            else if (freq === 2) acc.twos++;
            else acc.others++;
            return acc;
        }, { ones: 0, twos: 0, others: 0 });

        finalDecision = (frequencyAnalysis.ones === 2 &&
                         frequencyAnalysis.twos === 2 &&
                         frequencyAnalysis.others === 0);
    }

    console.log(finalDecision ? 'YES' : 'NO');
}

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
