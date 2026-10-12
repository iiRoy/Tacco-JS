const calculateMetrics = (numericSequence) => numericSequence.reduce((accumulator, currentVal) => ({
    totalSum: accumulator.totalSum + currentVal,
    sumExcludingOnes: accumulator.sumExcludingOnes + (currentVal !== 1 ? currentVal : 0)
}), { totalSum: 0, sumExcludingOnes: 0 });

const processInputAndDetermineOutcome = (rawInputString) => {
    const numericElements = rawInputString.split("\n").map(Number);
    numericElements.shift();

    const { totalSum, sumExcludingOnes } = calculateMetrics(numericElements);
    const elementCount = numericElements.length;

    const allElementsAreUnits = (totalSum === elementCount);
    const sumOfNonUnitValuesIsOdd = (sumExcludingOnes % 2 !== 0);

    const finalParitySource = (allElementsAreUnits || sumOfNonUnitValuesIsOdd) ? 1 : totalSum;

    return (finalParitySource % 2 !== 0) ? "first" : "second";
};

console.log(processInputAndDetermineOutcome(require("fs").readFileSync("/dev/stdin", "utf8").trim()));
