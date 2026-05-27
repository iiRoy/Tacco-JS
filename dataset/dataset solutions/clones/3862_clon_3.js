function solveProblem(rawData) {
    const lines = rawData.split("\n");
    const dataSize = Number(lines[0]);

    const numberStrings = lines[1].split(" ");

    const initialSumMapState = { 0: 1 };
    const sumFrequencyMap = { ...initialSumMapState };

    let runningSum = 0;

    const getNumericValue = (str) => Number(str);

    for (let currentIndex = 0; currentIndex < dataSize; currentIndex++) {
        const currentElement = getNumericValue(numberStrings[currentIndex]);
        runningSum += currentElement;
        sumFrequencyMap[runningSum] = (sumFrequencyMap[runningSum] || 0) + 1;
    }

    let resultCount = 0;

    const calculateCombinationsOfTwo = (count) => {
        if (count < 2) {
            return 0;
        }
        return count * (count - 1) / 2;
    };

    for (const frequency of Object.values(sumFrequencyMap)) {
        resultCount += calculateCombinationsOfTwo(frequency);
    }

    console.log(resultCount);
}

solveProblem(require("fs").readFileSync("/dev/stdin", "utf8"));
