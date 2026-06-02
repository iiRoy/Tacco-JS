process.stdin.on("data", function(inputBuffer) {
    const rawInputString = String(inputBuffer).trim();
    const numericParts = rawInputString.split(/\s+/);

    const firstOperand = Number(numericParts[0]);
    const secondOperand = Number(numericParts[1]);

    const integerResult = Math.trunc(firstOperand / secondOperand);
    const remainderResult = firstOperand % secondOperand;
    const preciseDivision = Number((firstOperand / secondOperand).toFixed(8));

    console.log(integerResult, remainderResult, preciseDivision);
}).resume();
