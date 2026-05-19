function processInputData(rawData) {
    const charSequence = rawData.split("");

    const frequencyMap = charSequence.reduce((accumulator, currentSymbol) => {
        accumulator.set(currentSymbol, (accumulator.get(currentSymbol) || 0) + 1);
        return accumulator;
    }, new Map());

    const distinctSymbolCount = frequencyMap.size;
    const allFrequenciesAreTwo = Array.from(frequencyMap.values()).every(
        (symbolFrequency) => symbolFrequency === 2
    );

    if (distinctSymbolCount === 2 && allFrequenciesAreTwo) {
        console.log('Yes');
    } else {
        console.log('No');
    }
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
