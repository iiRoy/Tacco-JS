function Main(rawData) {
    const lineSegments = rawData.split("\n");
    const targetSum = Number(lineSegments[0]);

    const iterationRange = Array.from({ length: 999 }, (_, index) => index + 1);

    const totalValidCombinations = iterationRange.reduce((outerAccumulator, firstOperand) => {
        return outerAccumulator + iterationRange.reduce((innerAccumulator, secondOperand) => {
            const derivedThirdOperand = targetSum - (firstOperand * secondOperand);
            return innerAccumulator + ((derivedThirdOperand >= 1 && derivedThirdOperand <= 999) ? 1 : 0);
        }, 0);
    }, 0);

    console.log('%d', totalValidCombinations);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
