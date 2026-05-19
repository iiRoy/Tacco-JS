process.stdin.resume();
process.stdin.setEncoding('utf8');

const processInputData = (rawData) => {
    const stringLines = rawData.toString().split("\n");
    const numericalValues = stringLines.map(lineItem => Number(lineItem));
    const filteredNonZero = numericalValues.filter(valueEntry => valueEntry !== 0);
    return filteredNonZero;
};

process.stdin.on('data', function (inputBuffer) {
    const allProcessedNumbers = processInputData(inputBuffer);

    const DEDUCTION_CONSTANT = 50;

    const firstGroupOfNumbers = allProcessedNumbers.slice(0, 3);
    const secondGroupOfNumbers = allProcessedNumbers.slice(3, 5);

    const minimumOfFirstGroup = Math.min(...firstGroupOfNumbers);
    const minimumOfSecondGroup = Math.min(...secondGroupOfNumbers);

    const finalCalculatedValue = minimumOfFirstGroup + minimumOfSecondGroup - DEDUCTION_CONSTANT;
    console.log(finalCalculatedValue);
});
