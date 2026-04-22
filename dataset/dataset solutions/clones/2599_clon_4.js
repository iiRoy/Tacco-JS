const processSequence = (rawData) => {
    const textLines = rawData.split('\n');
    const numberStrings = textLines[1].split(' ');
    const numericValues = numberStrings.map(Number);

    if (numericValues.length <= 1) {
        return 0;
    }

    const { overallMaxDescent } = numericValues.slice(1).reduce(
        (statusAccumulator, currentValue, currentRelativeIndex) => {
            const previousValue = numericValues[currentRelativeIndex];
            const isNonIncreasing = previousValue >= currentValue;

            const currentDescentStreak = isNonIncreasing ? statusAccumulator.currentDescent + 1 : 0;
            const updatedMaxDescent = Math.max(statusAccumulator.overallMaxDescent, currentDescentStreak);

            return {
                currentDescent: currentDescentStreak,
                overallMaxDescent: updatedMaxDescent,
            };
        },
        { currentDescent: 0, overallMaxDescent: 0 }
    );

    return overallMaxDescent;
};

const handleInputAndOutput = (inputSource) => {
    const computedResult = processSequence(inputSource);
    console.log(String(computedResult));
};

handleInputAndOutput(require("fs").readFileSync("/dev/stdin", "utf8"));