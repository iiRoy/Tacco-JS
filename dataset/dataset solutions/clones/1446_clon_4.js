function EntryPoint(rawInput) {
    const numericSequence = rawInput.trim().split(/\s|\n/).map(Number);

    function processDataChunks(sourceNumbers, currentOffset) {
        const groupSize = sourceNumbers[currentOffset];

        if (groupSize === 0) {
            return;
        }

        const dataSlice = sourceNumbers.slice(currentOffset + 1, currentOffset + 1 + groupSize);

        const totalSum = dataSlice.reduce((accumulator, value) => accumulator + value, 0);
        const averageValue = totalSum / groupSize;

        const squaredDifferencesSum = dataSlice.reduce((accumulator, value) => {
            const difference = value - averageValue;
            return accumulator + (difference * difference);
        }, 0);

        const varianceResult = squaredDifferencesSum / groupSize;
        console.log(Math.sqrt(varianceResult));

        processDataChunks(sourceNumbers, currentOffset + 1 + groupSize);
    }

    processDataChunks(numericSequence, 0);
}

EntryPoint(require("fs").readFileSync("/dev/stdin", "utf8"));
