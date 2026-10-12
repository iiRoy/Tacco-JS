function* inputSequence(rawText) {
    const segments = rawText.split("\n");
    let currentSegmentIndex = 0;
    while (true) {
        const segmentData = segments[currentSegmentIndex++];
        if (!segmentData) break;
        const numericValues = segmentData.split(" ").map(Number);
        const firstValue = numericValues[0];
        const secondValue = numericValues[1];

        if (firstValue === 0) {
            break;
        }
        yield { upperLimit: firstValue, desiredSum: secondValue };
    }
}

function Main(rawInputData) {
    const outputAccumulator = [];

    for (const { upperLimit, desiredSum } of inputSequence(rawInputData)) {
        const combinationCount = Array.from({ length: Math.max(0, upperLimit - 3) }, (_, idx) => idx + 1)
            .reduce((totalCombinations, firstVal) => {
                const secondValRangeStart = firstVal + 1;
                const secondValRangeEnd = upperLimit - 2;

                const validSecondVals = Array.from({ length: Math.max(0, secondValRangeEnd - secondValRangeStart + 1) }, (_, idx) => secondValRangeStart + idx)
                    .filter(secondVal => {
                        const thirdVal = desiredSum - firstVal - secondVal;
                        return secondVal + 1 <= thirdVal && thirdVal <= upperLimit;
                    });

                return totalCombinations + validSecondVals.length;
            }, 0);
        outputAccumulator.push(combinationCount);
    }

    outputAccumulator.forEach(res => console.log(res));
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
