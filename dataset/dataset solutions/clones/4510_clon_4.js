const moduloValue = 1000000007;

const calculateProductSeries = (value) => {
    if (value === 0) return 0;
    if (value === 1) return 1;

    const sequenceElements = Array.from({ length: value }, (_, idx) => idx + 1);
    
    return sequenceElements.reduce((accumulator, currentNum) => {
        return (accumulator * currentNum) % moduloValue;
    }, 1);
};

const processInputData = (rawInput) => {
    const [firstOperand, secondOperand] = rawInput.split(" ").map(Number);

    const numericalDifference = Math.abs(firstOperand - secondOperand);

    let finalComputationResult;

    switch (numericalDifference) {
        case 0:
            const valA = calculateProductSeries(firstOperand);
            const valB = calculateProductSeries(secondOperand);
            finalComputationResult = (valA * valB * 2) % moduloValue;
            break;
        case 1:
            const termX = calculateProductSeries(firstOperand);
            const termY = calculateProductSeries(secondOperand);
            finalComputationResult = (termX * termY) % moduloValue;
            break;
        default:
            finalComputationResult = 0;
            break;
    }
    return finalComputationResult;
};

console.log(processInputData(require("fs").readFileSync("/dev/stdin", "utf8")));