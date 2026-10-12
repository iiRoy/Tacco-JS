function processInputData(inputContent) {
    const inputLines = inputContent.split("\n");

    const dataSize = parseInt(inputLines[0], 10);
    const stringNumbers = inputLines[1].split(" ");

    const numericValues = stringNumbers.map(valueStr => Number(valueStr));

    const STARTING_SUM_COUNT = 1;

    const sumFrequencyMap = {};
    sumFrequencyMap[0] = STARTING_SUM_COUNT;

    let runningTotal = 0;
    for (let currentIndex = 0; currentIndex < dataSize; currentIndex++) {
        runningTotal += numericValues[currentIndex];
        sumFrequencyMap[runningTotal] = (sumFrequencyMap[runningTotal] ?? 0) + 1;
    }

    let pairCount = 0;

    const calculatePairsFromFrequency = (count) => {
        if (count < 2) {
            return 0;
        }
        return count * (count - 1) / 2;
    };

    Object.values(sumFrequencyMap).forEach(frequencyValue => {
        pairCount += calculatePairsFromFrequency(frequencyValue);
    });

    console.log(pairCount);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
