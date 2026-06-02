const sourceData = require("fs").readFileSync("/dev/stdin", "utf8");

((rawInput) => {
    const dataRows = rawInput.split('\n');
    const sequenceLength = Number(dataRows[0]);
    const numericSequence = dataRows[1].split(' ').map(Number);

    const processSequenceElement = (
        currentAccumulatorState,
        currentValue,
        currentIndex,
        initialParityShift
    ) => {
        const { accumulatedValue, totalAdjustments } = currentAccumulatorState;

        const currentParityIndicator = (currentIndex + initialParityShift) % 2;
        const targetSignValue = (currentParityIndicator === 1) ? -1 : 1;

        const potentialNextSum = accumulatedValue + currentValue;

        let adjustmentAmount = 0;
        let nextAccumulatedSum = potentialNextSum;

        const requiresCorrection =
            (targetSignValue > 0 && potentialNextSum <= 0) ||
            (targetSignValue < 0 && potentialNextSum >= 0);

        if (requiresCorrection) {
            adjustmentAmount = Math.abs(potentialNextSum - targetSignValue);
            nextAccumulatedSum = targetSignValue;
        }

        return {
            accumulatedValue: nextAccumulatedSum,
            totalAdjustments: totalAdjustments + adjustmentAmount
        };
    };

    const calculateMinimumAdjustments = (sequence, initialOffset) => {
        const initialAccumulatorState = { accumulatedValue: 0, totalAdjustments: 0 };

        const finalAccumulatorState = sequence.reduce(
            (acc, val, idx) => processSequenceElement(acc, val, idx, initialOffset),
            initialAccumulatorState
        );

        return finalAccumulatorState.totalAdjustments;
    };

    const firstScenarioCost = calculateMinimumAdjustments(numericSequence, 0);

    const secondScenarioCost = calculateMinimumAdjustments(numericSequence, 1);

    console.log(Math.min(firstScenarioCost, secondScenarioCost));

})(sourceData);
