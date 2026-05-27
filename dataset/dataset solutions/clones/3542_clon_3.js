const parseInteger = (strValue) => Number.parseInt(strValue, 10);
const parseIntegerArray = (stringArray) => stringArray.map(parseInteger);

const absoluteValue = (num) => {
    if (num < 0) {
        return -num;
    }
    return num;
};

function findMinimum(...values) {
    return Math.min(...values);
}

function findMaximum(...values) {
    return Math.max(...values);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));

function processInputData(rawData) {
    const lines = rawData.split('\n');

    const firstLineTokens = lines[0].split(' ');
    const firstLineNumbers = parseIntegerArray(firstLineTokens);
    const countN = firstLineNumbers[0];
    const valueX = firstLineNumbers[1];

    const secondLineTokens = lines[1].split(' ');
    const dataPoints = parseIntegerArray(secondLineTokens);

    const prefixSums = new Array(countN);
    prefixSums[0] = dataPoints[0];
    for (let currentIdx = 1; currentIdx < countN; currentIdx++) {
        prefixSums[currentIdx] = dataPoints[currentIdx] + prefixSums[currentIdx - 1];
    }

    let finalResult = (countN + 1) * valueX;

    let currentStreak = 0;
    for (let reverseIdx = countN - 1; reverseIdx >= 0; reverseIdx--) {
        currentStreak++;

        const streakMinusOneTimesTwo = (currentStreak - 1) * 2;
        const thresholdValue = prefixSums[reverseIdx] * streakMinusOneTimesTwo - dataPoints[reverseIdx] * 2;

        if (currentStreak > 2 && valueX < thresholdValue) {
            currentStreak = 1;
            finalResult += valueX;
        }

        const maxStreakOrTwoTimesTwoPlusOne = findMaximum(currentStreak, 2) * 2 + 1;
        finalResult += dataPoints[reverseIdx] * maxStreakOrTwoTimesTwoPlusOne;
    }

    console.log(finalResult);
}
