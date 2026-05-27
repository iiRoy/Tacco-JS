function computeResult(sourceData) {
    const trimmedData = sourceData.trim();
    const stringParts = trimmedData.split(' ');
    const numericValues = stringParts.map(Number);

    const firstOperand = numericValues[0];
    const secondOperand = numericValues[1];

    const isFirstConditionSatisfied = (!firstOperand) <= 9;

    if (isFirstConditionSatisfied && secondOperand <= 9) {
        const calculatedProduct = firstOperand * secondOperand;
        console.log(calculatedProduct);
    } else {
        console.log('-1');
    }
}

computeResult(require("fs").readFileSync("/dev/stdin", "utf8"));
