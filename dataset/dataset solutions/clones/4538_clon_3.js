function processInput(rawDataString) {
    const inputLines = rawDataString.split("\n");
    const firstLineParts = inputLines[0].split(" ");

    const numericValues = firstLineParts.map(part => parseInt(part, 10));

    const [firstOperand, secondOperand] = numericValues;
    
    const calculatedSum = firstOperand + secondOperand;
    
    if (calculatedSum > 9) {
        console.log("error");
    } else {
        console.log(calculatedSum);
    }
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
