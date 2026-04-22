function processTextData(rawData) {
    const performScan = (collection, initialValue, transformation) => {
        let outcome = [initialValue];
        let currentAgg = initialValue;
        for (let position = 0; position < collection.length; position++) {
            currentAgg = transformation(currentAgg, collection[position], position, collection);
            outcome.push(currentAgg);
        }
        return outcome;
    };

    const sourceLines = rawData.split('\n');
    const elementCount = Number(sourceLines[0]);
    const numericElements = sourceLines[1].split(' ').map(Number);

    const cumulativeTotals = performScan(numericElements, 0, (agg, val) => agg + val);

    const overallSumValue = cumulativeTotals[elementCount];

    const segmentDisparities = Array.from({ length: elementCount - 1 }, (_, indexPosition) => indexPosition + 1)
        .map(splitPoint => {
            const firstSegmentTotal = cumulativeTotals[splitPoint];
            const secondSegmentTotal = overallSumValue - firstSegmentTotal;
            return Math.abs(firstSegmentTotal - secondSegmentTotal);
        });

    console.log(Math.min(...segmentDisparities));
}

processTextData(require("fs").readFileSync("/dev/stdin", "utf8"));