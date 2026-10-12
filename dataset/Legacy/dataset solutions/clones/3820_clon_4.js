function processInputAndCompute(rawInput) {
    const numericData = rawInput.split("\n").map(val => Number(val));
    const initialCount = numericData[0];

    const computeSumRecursively = (currentIdx, accumulatedResult) => {
        if (currentIdx <= 1) {
            return accumulatedResult;
        }

        const currentElement = numericData[currentIdx];
        const previousElement = numericData[currentIdx - 1];

        if (currentElement >= currentIdx) {
            return -1;
        }

        const nextAccumulation = (currentElement === previousElement + 1)
            ? accumulatedResult + 1
            : accumulatedResult + currentElement;

        return computeSumRecursively(currentIdx - 1, nextAccumulation);
    };

    const finalOutcome = computeSumRecursively(initialCount, 0);
    console.log(finalOutcome);
}

processInputAndCompute(require("fs").readFileSync("/dev/stdin","utf8"));
