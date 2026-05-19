function Main(input) {
    const lineSegments = input.split("\n");
    const currencyCount = parseInt(lineSegments[0], 10);

    const dataEntries = lineSegments.slice(1, currencyCount + 1);

    const initialAccumulators = {
        yenAccumulator: 0,
        bitcoinAccumulator: 0.0
    };

    const currencyProcessors = {
        'JPY': (currentAcc, amountString) => ({
            ...currentAcc,
            yenAccumulator: currentAcc.yenAccumulator + parseInt(amountString, 10)
        }),
        'BTC': (currentAcc, amountString) => ({
            ...currentAcc,
            bitcoinAccumulator: currentAcc.bitcoinAccumulator + parseFloat(amountString)
        })
    };

    const finalAccumulation = dataEntries.reduce((accumulatedValues, currentEntry) => {
        const [amountText, currencyIdentifier] = currentEntry.split(' ');
        const processor = currencyProcessors[currencyIdentifier];
        return processor ? processor(accumulatedValues, amountText) : accumulatedValues;
    }, initialAccumulators);

    const combinedValue = finalAccumulation.yenAccumulator + (finalAccumulation.bitcoinAccumulator * 380000.0);
    console.log(combinedValue);
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
