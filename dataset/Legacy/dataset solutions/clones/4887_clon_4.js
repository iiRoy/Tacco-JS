function processInputData(rawDataString) {
    const inputLines = rawDataString.split("\n");

    const configValues = inputLines[0].trim().split(" ").map(Number);
    const itemCount = configValues[0];
    const timeLimit = configValues[1];

    const valueSequence = inputLines[1].trim().split(" ").map(Number);

    if (itemCount === 1) {
        console.log("0");
    }

    const analysisResult = valueSequence.reduce((accumulator, currentPrice) => {
        const potentialProfit = currentPrice - accumulator.lowestPriceSeen;

        if (potentialProfit > accumulator.maxProfitFound) {
            accumulator.maxProfitFound = potentialProfit;
            accumulator.profitCountInstances = 1;
        } else if (potentialProfit === accumulator.maxProfitFound) {
            accumulator.profitCountInstances++;
        }

        accumulator.lowestPriceSeen = Math.min(accumulator.lowestPriceSeen, currentPrice);

        return accumulator;
    }, {
        lowestPriceSeen: valueSequence[0],
        maxProfitFound: 0,
        profitCountInstances: 0
    });

    const finalOutputValue = Math.min(analysisResult.profitCountInstances, Math.floor(timeLimit / 2));

    console.log(finalOutputValue);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
