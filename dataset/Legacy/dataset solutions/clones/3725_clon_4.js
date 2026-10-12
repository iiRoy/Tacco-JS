const processInputAndCalculate = (inputData) => {
    const [firstOperand, secondOperand] = inputData.split(/\s+/).map(Number);

    let finalResult;

    if (secondOperand === 1) {
        finalResult = Infinity;
    } else if (secondOperand === 2) {
        finalResult = firstOperand - 1;
    } else {
        const adjustedDivisor = secondOperand - 1;
        finalResult = Math.ceil((firstOperand - 1) / adjustedDivisor);
    }

    console.log(finalResult);
};

processInputAndCalculate(require("fs").readFileSync("/dev/stdin", "utf8"));
