const parseNumeric = (s) => Number(s);
const parseNumericArray = (s) => s.split(' ').map(parseNumeric);
const getMaximum = (...args) => Math.max(...args);

function processInputData(rawInput) {
    const inputLines = rawInput.split('\n');
    const [firstLineContent, secondLineContent] = inputLines;

    const [itemCount, thresholdValue] = parseNumericArray(firstLineContent);
    const dataValues = parseNumericArray(secondLineContent);

    let runningSum = 0;
    const prefixSums = dataValues.map(val => (runningSum += val));

    const finalCalculationState = dataValues.reduceRight((accumulator, currentDataValue, currentIndex) => {
        let { currentTotal, currentActiveCount } = accumulator;

        currentActiveCount++;

        const currentPrefixSumValue = prefixSums[currentIndex];

        if (currentActiveCount > 2 && thresholdValue <= currentPrefixSumValue * (currentActiveCount - 1) * 2 - currentDataValue * 2) {
            currentActiveCount = 1;
            currentTotal += thresholdValue;
        }

        currentTotal += currentDataValue * (getMaximum(currentActiveCount, 2) * 2 + 1);

        return { currentTotal, currentActiveCount };
    }, {
        currentTotal: (itemCount + 1) * thresholdValue,
        currentActiveCount: 0
    });

    console.log(finalCalculationState.currentTotal);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
