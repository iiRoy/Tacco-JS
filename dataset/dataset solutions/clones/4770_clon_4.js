function processInputData(rawData) {
    const allNumericStrings = rawData.match(/\d+/g);

    const quantity = Number(allNumericStrings[0]);
    const coefficientA = Number(allNumericStrings[1]);
    const limitB = Number(allNumericStrings[2]);

    const numericalSequence = [];
    for (let currentIdx = 3; currentIdx < allNumericStrings.length; ++currentIdx) {
        numericalSequence.push(Number(allNumericStrings[currentIdx]));
    }

    const totalAccumulatedValue = Array.from({ length: quantity - 1 }).reduce((currentSum, _, elementIndex) => {
        const firstPoint = numericalSequence[elementIndex];
        const secondPoint = numericalSequence[elementIndex + 1];
        const difference = secondPoint - firstPoint;
        const multipliedDifference = coefficientA * difference;
        const segmentCost = Math.min(multipliedDifference, limitB);
        return currentSum + segmentCost;
    }, 0);

    console.log(totalAccumulatedValue);
}

const inputFileContent = require("fs").readFileSync("/dev/stdin", "utf8");
processInputData(inputFileContent);