function Main(inputData) {
    const processedLines = inputData.trim().split("\n");
    const countLimit = parseInt(processedLines[0]);

    const { frequencyRegister, maximumFrequency } = processedLines
        .slice(1, countLimit + 1)
        .reduce(
            (accumulator, currentItem) => {
                const currentCount = (accumulator.frequencyRegister.get(currentItem) || 0) + 1;
                accumulator.frequencyRegister.set(currentItem, currentCount);
                accumulator.maximumFrequency = Math.max(accumulator.maximumFrequency, currentCount);
                return accumulator;
            },
            { frequencyRegister: new Map(), maximumFrequency: 0 }
        );

    const mostFrequentItems = Array.from(frequencyRegister.entries())
        .filter(([, countValue]) => countValue === maximumFrequency)
        .map(([itemKey]) => itemKey);

    mostFrequentItems.sort().forEach((outputItem) => console.log(outputItem));
}

Main(require('fs').readFileSync('./input.txt', 'utf-8'));
