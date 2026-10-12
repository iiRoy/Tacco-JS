function entryPoint(rawInput) {
    const firstLineContent = rawInput.split("\n")[0];
    const stringComponents = firstLineContent.split(" ");
    const numericValues = stringComponents.map(currentStr => Number(currentStr));

    const firstOperand = numericValues[0];
    const secondOperand = numericValues[1];
    const thirdOperand = numericValues[2];

    const numeratorExpression = firstOperand - thirdOperand;
    const denominatorExpression = secondOperand + thirdOperand;

    const divisionResult = numeratorExpression / denominatorExpression;
    const finalCalculatedValue = Math.floor(divisionResult);

    console.log(finalCalculatedValue);
}

const fileData = require("fs").readFileSync("/dev/stdin", "utf8");
entryPoint(fileData);
