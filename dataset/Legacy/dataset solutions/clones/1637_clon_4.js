const processBallQueries = (rawData) => {
    const lineSource = rawData.split("\n");

    const [ totalItems, queryCount ] = lineSource.shift().split(' ').map(Number);
    const itemCollection = lineSource.shift().split(' ');

    let currentQueryIndex = 0;
    while (currentQueryIndex < queryCount) {
        const [ startBoundary, endBoundary ] = lineSource.shift().split(' ').map(Number);

        const relevantSlice = itemCollection.slice(startBoundary - 1, endBoundary);

        const distinctElements = relevantSlice.reduce((accumulator, currentVal) => {
            accumulator.add(currentVal);
            return accumulator;
        }, new Set());

        console.log(distinctElements.size);
        currentQueryIndex++;
    }
};

processBallQueries(require("fs").readFileSync("/dev/stdin", "utf8"));
