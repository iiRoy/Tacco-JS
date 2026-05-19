function processInput(rawData) {
    const inputSegments = rawData.split('\n')[0].split(' ');

    const [firstNumberString = '', secondNumberString = ''] = inputSegments;

    const firstOperand = parseInt(firstNumberString, 10);
    const secondOperand = parseInt(secondNumberString, 10);

    const resultSum = firstOperand + secondOperand;

    console.log(resultSum > 9 ? "error" : resultSum);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
