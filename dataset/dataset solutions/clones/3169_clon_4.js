const processFinancialRecords = (sourceText) => {
    const segmentCollection = (sourceText.match(/\S+/g) || []);

    if (segmentCollection.length === 0) {
        console.log(undefined);
        return;
    }

    const numericSegments = segmentCollection.map(Number);

    const numberOfEntries = numericSegments[0];

    if (isNaN(numberOfEntries) || numberOfEntries <= 0) {
        console.log(undefined);
        return;
    }

    const performAggregation = (currentEntryIndex, dataPointer, currentSum) => {
        if (currentEntryIndex >= numberOfEntries) {
            return currentSum;
        }

        const entryValue = numericSegments[dataPointer];

        return performAggregation(
            currentEntryIndex + 1,
            dataPointer + 2,
            currentSum + entryValue
        );
    };

    const finalValue = performAggregation(0, 1, 0);

    console.log(finalValue);
};

processFinancialRecords(require("fs").readFileSync("/dev/stdin", "utf8"));