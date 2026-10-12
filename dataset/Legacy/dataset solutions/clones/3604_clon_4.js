function calculateProductOfDecremented(rawData) {
    const stringSegments = rawData.split(" ");
    const numericValues = [];

    for (const segment of stringSegments) {
        numericValues.push(Number.parseInt(segment, 10));
    }

    const firstOperand = numericValues[0];
    const secondOperand = numericValues[1];

    const finalResult = firstOperand * secondOperand - firstOperand - secondOperand + 1;

    console.log(finalResult);
}

calculateProductOfDecremented(require("fs").readFileSync("/dev/stdin", "utf8"));
