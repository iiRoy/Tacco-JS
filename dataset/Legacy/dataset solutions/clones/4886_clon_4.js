function processData(inputString) {
    const extractNumericSequence = (lineContent) =>
        lineContent.trim().split(" ").map(Number);

    const allInputLines = inputString.split("\n");

    const [itemCount, timeLimit] = extractNumericSequence(allInputLines[0]);
    const numericalValues = extractNumericSequence(allInputLines[1]);

    const { peakProfit, peakProfitCount } = numericalValues.reduce(
        (accumulatorState, currentItemValue) => {
            const potentialProfit = currentItemValue - accumulatorState.currentMinimumValue;

            if (potentialProfit > accumulatorState.peakProfit) {
                accumulatorState.peakProfit = potentialProfit;
                accumulatorState.peakProfitCount = 1;
            } else if (potentialProfit === accumulatorState.peakProfit) {
                accumulatorState.peakProfitCount++;
            }

            accumulatorState.currentMinimumValue = Math.min(accumulatorState.currentMinimumValue, currentItemValue);

            return accumulatorState;
        },
        {
            currentMinimumValue: numericalValues[0],
            peakProfit: 0,
            peakProfitCount: 0
        }
    );

    const finalOutput = Math.min(peakProfitCount, Math.floor(timeLimit / 2));

    console.log(finalOutput);
}

processData(require("fs").readFileSync("/dev/stdin", "utf8"));
