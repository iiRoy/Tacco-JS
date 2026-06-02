function ProcessInput(rawData) {
    const lines = rawData.split('\n');
    const elementCount = Number(lines[0]);
    const inputNumbers = lines[1].split(' ').map(Number);

    const { sumFrequencies } = inputNumbers.reduce((accumulator, currentNum) => {
        accumulator.currentSum += currentNum;
        accumulator.sumFrequencies.set(
            accumulator.currentSum,
            (accumulator.sumFrequencies.get(accumulator.currentSum) || 0) + 1
        );
        return accumulator;
    }, { currentSum: 0, sumFrequencies: new Map([[0, 1]]) });

    const resultantPairCount = Array.from(sumFrequencies.values()).reduce((total, count) => {
        return total + (count * (count - 1) / 2);
    }, 0);

    console.log(resultantPairCount);
}

ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
