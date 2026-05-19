function processInputData(rawDataLines) {
    const initialNumericValue = Number(rawDataLines[0]);

    const { occurrenceCounts, maximumObservedValue } = rawDataLines[1].split(" ").reduce(
        (accumulator, itemString) => {
            const numericItem = Number(itemString);
            accumulator.occurrenceCounts.set(numericItem, (accumulator.occurrenceCounts.get(numericItem) || 0) + 1);
            accumulator.maximumObservedValue = Math.max(accumulator.maximumObservedValue, numericItem);
            return accumulator;
        },
        { occurrenceCounts: new Map(), maximumObservedValue: 0 }
    );

    const MODULO_DIVISOR = 998244353;

    const calculatedProduct = Array.from({ length: maximumObservedValue }, (_, index) => index + 1)
        .reduce((currentAccumulatedProduct, currentIterationNumber) => {
            if (currentAccumulatedProduct === 0) {
                return 0;
            }

            const previousNumberCount = occurrenceCounts.get(currentIterationNumber - 1) || 0;
            const currentNumberCount = occurrenceCounts.get(currentIterationNumber) || 0;

            if (currentNumberCount === 0) {
                return 0;
            }

            const termValue = Math.pow(previousNumberCount, currentNumberCount);

            return (currentAccumulatedProduct * termValue) % MODULO_DIVISOR;
        }, 1);

    console.log(calculatedProduct);
}

processInputData(require('node:fs').readFileSync(0, 'utf8').split("\n"));
