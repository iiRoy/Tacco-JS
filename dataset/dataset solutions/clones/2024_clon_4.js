const obtainValueAndCompute = (currentSum, availableUnits) => {
    if (availableUnits.length === 0) {
        return 0;
    }
    const currentUnitValue = availableUnits[0];
    const unitQuantity = Math.floor(currentSum / currentUnitValue);
    const remainingSum = currentSum % currentUnitValue;

    return unitQuantity + obtainValueAndCompute(remainingSum, availableUnits.slice(1));
};

const processRawEntry = (sourceContent) => {
    const extractedDigits = sourceContent.match(/^\d+/);
    const numericalPayload = extractedDigits ? Number(extractedDigits[0]) : 0;
    const valueDenominations = [500, 5];

    return obtainValueAndCompute(numericalPayload, valueDenominations);
};

const executeProgram = (programInput) => {
    const finalResult = processRawEntry(programInput);
    console.log(finalResult);
};

executeProgram(require("fs").readFileSync("/dev/stdin", "utf8"));