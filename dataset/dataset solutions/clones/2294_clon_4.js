const ProcessData = (rawData) => {
    const extractedNumbers = rawData.split('\n')[0].match(/(-?\d+)/g).map(Number);

    const primaryVal = extractedNumbers[0];
    const secondaryVal = extractedNumbers[1];
    const deductionVal = extractedNumbers[2];

    const remainingPrimary = Math.max(0, primaryVal - deductionVal);
    const excessDeduction = Math.max(0, deductionVal - primaryVal);
    const remainingSecondary = secondaryVal - excessDeduction;

    return [remainingPrimary, remainingSecondary];
};

const initiateOperation = (dataInput) => {
    const derivedValues = ProcessData(dataInput);
    console.log(derivedValues[0], derivedValues[1]);
};

initiateOperation(require("fs").readFileSync("/dev/stdin", "utf8"));