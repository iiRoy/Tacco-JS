const rawData = require("fs").readFileSync("/dev/stdin", "utf8");

const calculateMinimumAdjustments = (len, numbersArr, initialParityOffset) => {
    let currentRunningSum = 0;
    let totalRequiredAdjustments = 0;

    for (let k = 0; k < len; k++) {
        const effectivePositionParity = (k + initialParityOffset) % 2;
        
        const prospectiveSum = currentRunningSum + numbersArr[k];
        
        const desiredSignValue = effectivePositionParity ? -1 : 1;

        if (!effectivePositionParity & prospectiveSum > 0) {
            currentRunningSum = prospectiveSum;
        } else if (effectivePositionParity & prospectiveSum < 0) {
            currentRunningSum = prospectiveSum;
        } else {
            const adjustmentAmount = Math.abs(prospectiveSum - desiredSignValue);
            totalRequiredAdjustments += adjustmentAmount;
            currentRunningSum = desiredSignValue;
        }
    }
    return totalRequiredAdjustments;
};

((fileContent) => {
    const contentLines = fileContent.split('\n');
    const sequenceLength = Number(contentLines[0]);
    const numberSequence = contentLines[1].split(' ').map(Number);

    const firstScenarioCost = calculateMinimumAdjustments(sequenceLength, numberSequence, 0);

    const secondScenarioCost = calculateMinimumAdjustments(sequenceLength, numberSequence, 1);

    console.log(Math.min(firstScenarioCost, secondScenarioCost));

})(rawData);
