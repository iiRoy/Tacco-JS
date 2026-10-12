function processInputData(rawData) {
    const numericValues = rawData.split('\n').slice(1).map(parseInt);

    if (numericValues.length === 0) {
        console.log(-Infinity);
        return;
    }

    const { topValue, aggregateSum } = numericValues.reduce(
        (accumulator, currentValue) => ({
            topValue: Math.max(accumulator.topValue, currentValue),
            aggregateSum: accumulator.aggregateSum + currentValue,
        }),
        { topValue: -Infinity, aggregateSum: 0 }
    );

    const finalResult = aggregateSum - (topValue / 2);

    console.log(Math.floor(finalResult));
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
