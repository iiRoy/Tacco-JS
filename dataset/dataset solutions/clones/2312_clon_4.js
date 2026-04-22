const calculateOutcome = (rawData) => {
    const [firstOperand, secondOperand, thirdOperand] = rawData.split(" ").map(val => parseInt(val, 10));

    const parityCheckValue = thirdOperand - secondOperand;

    const isEvenFlag = Number(!(parityCheckValue & 1));

    const optionOne = firstOperand - secondOperand;
    const optionTwo = thirdOperand - 1;
    const oddCaseResult = (optionOne + optionTwo - Math.abs(optionOne - optionTwo)) / 2;

    const finalOutcome = (isEvenFlag * (parityCheckValue / 2)) + ((1 - isEvenFlag) * oddCaseResult);

    console.info(finalOutcome);
};

calculateOutcome(require("fs").readFileSync("/dev/stdin", "utf8"));