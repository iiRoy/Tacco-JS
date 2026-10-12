function ProcessInput(rawData) {
    const dataRows = rawData.split("\n");

    const [elementCount, thresholdValue] = dataRows[0].trim().split(" ").map(Number);
    const numericSequence = dataRows[1].trim().split(" ").map(Number);

    const initialAccumulator = {
        lowestPointEncountered: numericSequence[0],
        maximumProfit: 0,
        profitOccurrences: 1
    };

    const finalResult = numericSequence.slice(1).reduce((accumulator, currentObservation) => {
        const calculatedProfit = currentObservation - accumulator.lowestPointEncountered;

        if (calculatedProfit > accumulator.maximumProfit) {
            accumulator.maximumProfit = calculatedProfit;
            accumulator.profitOccurrences = 1;
        } else if (calculatedProfit === accumulator.maximumProfit) {
            accumulator.profitOccurrences++;
        }

        accumulator.lowestPointEncountered = Math.min(accumulator.lowestPointEncountered, currentObservation);
        return accumulator;
    }, initialAccumulator);

    console.log(Math.min(finalResult.profitOccurrences, Math.floor(thresholdValue / 2)));
}

ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
