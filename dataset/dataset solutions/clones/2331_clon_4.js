function processInputSequence(sourceData) {
    const dataLines = sourceData.split('\n');
    const elementCount = Number(dataLines[0]);
    const numberArray = dataLines[1].split(' ').map(Number);

    const { currentExpectedValue, skippedElementCount } = numberArray.reduce(
        (accumulatorState, currentArrayElement) => {
            if (currentArrayElement === accumulatorState.currentExpectedValue) {
                return {
                    currentExpectedValue: accumulatorState.currentExpectedValue + 1,
                    skippedElementCount: accumulatorState.skippedElementCount
                };
            } else {
                return {
                    currentExpectedValue: accumulatorState.currentExpectedValue,
                    skippedElementCount: accumulatorState.skippedElementCount + 1
                };
            }
        },
        { currentExpectedValue: 1, skippedElementCount: 0 }
    );

    let finalOutputValue = skippedElementCount;

    if (skippedElementCount === elementCount && currentExpectedValue === 1) {
        finalOutputValue = -1;
    }
        
    console.log(finalOutputValue);
}

processInputSequence(require("fs").readFileSync("/dev/stdin", "utf8"));
