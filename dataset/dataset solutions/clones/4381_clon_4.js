const processAndCalculate = (inputString) => {
    const lines = inputString.split('\n');
    const numericalSequence = lines[1].split(' ').map(Number.parseInt);

    const maximumElement = numericalSequence.reduce((currentMax, element) => Math.max(currentMax, element), 0);

    const tallyMap = numericalSequence.reduce((accum, value) => {
        accum.set(value, (accum.get(value) || 0) + 1);
        return accum;
    }, new Map());

    const occurrenceArray = Array.from({ length: maximumElement + 2 }, (_, index) => tallyMap.get(index) || 0);

    const secureValue = (arr, position) => (position >= 0 && position < arr.length) ? arr[position] : 0;

    const aggregateSums = Array.from({ length: maximumElement + 1 }, (_, currentKey) => {
        const previousCount = secureValue(occurrenceArray, currentKey - 1);
        const presentCount = secureValue(occurrenceArray, currentKey);
        const subsequentCount = secureValue(occurrenceArray, currentKey + 1);
        return previousCount + presentCount + subsequentCount;
    });

    const ultimatePeak = aggregateSums.reduce((highestSum, currentSum) => Math.max(highestSum, currentSum), 0);

    console.log(ultimatePeak);
};

const systemInitiator = (dataStream) => {
    processAndCalculate(dataStream);
};

systemInitiator(require("fs").readFileSync("/dev/stdin", "utf8"));