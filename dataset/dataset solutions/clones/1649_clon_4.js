const processInput = (rawText) => {
    const allNumbersStr = rawText.replace(/\n/g, ' ');
    const numericData = allNumbersStr.split(' ').filter(Boolean).map(Number);

    const countA = numericData[0];
    const windowSize = numericData[1];
    const valueList = numericData.slice(2);

    return { countA, windowSize, valueList };
};

const determineTrend = (dataCollection) => {
    const totalElements = dataCollection.countA;
    const span = dataCollection.windowSize;
    const numericalSequence = dataCollection.valueList;

    let currentPosition = 0;
    while (currentPosition < totalElements - span) {
        const precedingValue = numericalSequence[currentPosition];
        const succeedingValue = numericalSequence[currentPosition + span];

        if (succeedingValue > precedingValue) {
            process.stdout.write("Yes\n");
        } else {
            process.stdout.write("No\n");
        }
        currentPosition++;
    }
};

(() => {
    const entireInput = require("fs").readFileSync("/dev/stdin", "utf8");
    const parsedParameters = processInput(entireInput);
    determineTrend(parsedParameters);
})();