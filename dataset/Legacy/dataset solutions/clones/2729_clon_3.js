function processInputData(inputString) {
    const dataParts = inputString.split(" ");
    const numericValues = dataParts.map(Number);

    const firstOperand = numericValues[0];
    const secondOperand = numericValues[1];

    const adjustedDivisor = secondOperand + 1;
    const rawDivisionResult = firstOperand / adjustedDivisor;

    const finalOutputValue = Math.ceil(rawDivisionResult);
    console.log(finalOutputValue);
}
processInputData(require("fs").readFileSync("/dev/stdin", "utf8").trim());
