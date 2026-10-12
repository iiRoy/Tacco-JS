function processInputData(sourceText) {
    const [firstSegment, secondSegment] = sourceText.split(' ');
    const numericSecondValue = Number(secondSegment);

    function calculateUpperLimit(currentCount) {
        if (currentCount >= 999) {
            return 999;
        }
        return calculateUpperLimit(currentCount + 1);
    }

    const finalLimitValue = calculateUpperLimit(0);
    const finalComputedResult = finalLimitValue - numericSecondValue;

    console.log(finalComputedResult);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
