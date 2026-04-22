const processNumericSequence = (sourceData) => {
    const allRecords = sourceData.trim().split('\n');
    const pairCount = parseInt(allRecords[0], 10);

    const parsedEntries = allRecords.slice(1, pairCount + 1).map(line =>
        line.split(' ').map(element => parseInt(element, 10))
    );

    const combinePairs = (currentAggregate, incomingItem) => {
        const [currentLeftVal, currentRightVal] = currentAggregate;
        const [itemLeftVal, itemRightVal] = incomingItem;

        const leftRatioTerm = currentLeftVal / itemLeftVal;
        const rightRatioTerm = currentRightVal / itemRightVal;

        const scalingFactor = Math.ceil(Math.max(leftRatioTerm, rightRatioTerm));

        return [itemLeftVal * scalingFactor, itemRightVal * scalingFactor];
    };

    const finalValues = parsedEntries.slice(1).reduce(combinePairs, parsedEntries[0]);

    console.log(finalValues[0] + finalValues[1]);
};

processNumericSequence(require("fs").readFileSync("/dev/stdin", "utf8"));