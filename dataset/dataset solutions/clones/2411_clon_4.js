function ProcessInput(rawData) {
    const dataSegments = rawData.split("\n");
    const elementCount = Number(dataSegments[0]);
    const numberSequence = dataSegments[1].split(" ").map(val => Number(val));

    let currentTotal = 0;
    const prefixTotals = [0, ...numberSequence.map(val => (currentTotal += val, currentTotal))];

    console.log(prefixTotals);

    const discrepancies = Array.from({ length: elementCount - 1 }, (_, idx) => {
        const leftPartitionSum = prefixTotals[idx];
        const totalSequenceSum = prefixTotals[elementCount];
        const rightPartitionSum = totalSequenceSum - leftPartitionSum;
        return Math.abs(leftPartitionSum - rightPartitionSum);
    });

    const minimumDiscrepancy = discrepancies.reduce((minVal, currentVal) => Math.min(minVal, currentVal), Infinity);

    console.log(minimumDiscrepancy);
}

ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
