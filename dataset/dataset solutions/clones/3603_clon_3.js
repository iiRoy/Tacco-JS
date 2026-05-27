function executeCalculation(rawInputString) {
    const inputParts = rawInputString.split(" ");

    const firstOperandString = inputParts[0];
    const secondOperandString = inputParts[1];

    const numericValueA = parseInt(firstOperandString, 10);
    const numericValueB = parseInt(secondOperandString, 10);

    const adjustedValueA = numericValueA - 1;
    const adjustedValueB = numericValueB - 1;

    const computedProduct = adjustedValueA * adjustedValueB;

    console.log(computedProduct);
}

const fileSystemUtility = require("fs");
const standardInputFilePath = "/dev/stdin";
const inputEncoding = "utf8";

const fileContents = fileSystemUtility.readFileSync(standardInputFilePath, inputEncoding);

executeCalculation(fileContents);
